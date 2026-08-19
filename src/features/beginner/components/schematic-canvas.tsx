import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { PlacedComponent, ResistorPart, SolveResult } from '../engine/types'
import type { UseSchematicResult } from '../state/use-schematic'
import { LIB } from '../data/symbols'
import { pinWorld, pinsOf } from '../engine/netlist'
import { fmtI, fmtR, fmtV } from '../engine/format'
import { SchematicSymbol } from './schematic-symbol'
import { ZoomInIcon, ZoomOutIcon } from 'lucide-react'

const BASE_VB = { x: 0, y: 0, w: 720, h: 460 }

/** Per-pin current flowing OUT of that pin into its net — drives the animated flow overlay. */
function pinCurrentMap(sim: SolveResult): Record<string, number> {
  const pc: Record<string, number> = {}
  sim.res.forEach((r) => {
    pc[r.c.id + '.1'] = -r.I
    pc[r.c.id + '.2'] = r.I
  })
  sim.led.forEach((d) => {
    pc[d.c.id + '.A'] = -d.I
    pc[d.c.id + '.K'] = d.I
  })
  sim.fets.forEach((f) => {
    if (!f.on) return
    const I = ((sim.V[f.d] || 0) - (sim.V[f.s] || 0)) / (f.c.part as { Ron: number }).Ron
    pc[f.c.id + '.D'] = -I
    pc[f.c.id + '.S'] = I
  })
  sim.sws.forEach((w) => {
    if (!w.c.closed) return
    const I = ((sim.V[w.a] || 0) - (sim.V[w.b] || 0)) / 0.05
    pc[w.c.id + '.1'] = -I
    pc[w.c.id + '.2'] = I
  })
  return pc
}

function wirePath(p1: { x: number; y: number }, p2: { x: number; y: number }): string {
  if (Math.abs(p1.y - p2.y) < 1) return `M${p1.x} ${p1.y}H${p2.x}`
  if (Math.abs(p1.x - p2.x) < 1) return `M${p1.x} ${p1.y}V${p2.y}`
  const mx = Math.round((p1.x + p2.x) / 2 / 20) * 20
  return `M${p1.x} ${p1.y}H${mx}V${p2.y}H${p2.x}`
}

export function SchematicCanvas({ ui }: { ui: UseSchematicResult }) {
  const { state, dispatch, sim } = ui
  const svgRef = useRef<SVGSVGElement>(null)
  const [vb, setVb] = useState(BASE_VB)
  const dragRef = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null)
  const panRef = useRef<{ startX: number; startY: number; vb0: typeof BASE_VB; moved: boolean } | null>(null)

  const comp = (id: string) => state.comps.find((c) => c.id === id)

  /**
   * Client -> SVG user-space coordinates, via the screen CTM rather than a
   * naive bounding-box ratio. The canvas has `min-height`/`max-height` CSS
   * that generally doesn't match the viewBox's 720:460 aspect ratio, so
   * `preserveAspectRatio="xMidYMid meet"` (the SVG default) letterboxes the
   * content — a bounding-box-relative mapping would be off inside the
   * letterboxed margin. getScreenCTM().inverse() accounts for that exactly.
   */
  const toSvg = (e: { clientX: number; clientY: number }): { x: number; y: number } => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  const zoomBy = (factor: number, center?: { x: number; y: number }) => {
    setVb((prev) => {
      const nw = Math.max(180, Math.min(1400, prev.w * factor))
      const nh = (nw / prev.w) * prev.h
      const cx = center ? center.x : prev.x + prev.w / 2
      const cy = center ? center.y : prev.y + prev.h / 2
      return { x: cx - (cx - prev.x) * (nw / prev.w), y: cy - (cy - prev.y) * (nh / prev.h), w: nw, h: nh }
    })
  }

  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    zoomBy(e.deltaY > 0 ? 1.12 : 1 / 1.12, toSvg(e))
  }

  const onPinDown = (e: ReactPointerEvent, pin: string) => {
    e.stopPropagation()
    dispatch({ type: 'PIN_CLICK', pin })
  }

  const onCompDown = (e: ReactPointerEvent, c: PlacedComponent) => {
    e.stopPropagation()
    const p = toSvg(e)
    dragRef.current = { id: c.id, dx: p.x - c.x, dy: p.y - c.y, moved: false }
    dispatch({ type: 'SELECT', id: c.id })
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onBgDown = (e: ReactPointerEvent) => {
    if (state.placing) {
      const p = toSvg(e)
      dispatch({ type: 'PLACE_AT', x: p.x, y: p.y })
      return
    }
    const p = toSvg(e)
    panRef.current = { startX: p.x, startY: p.y, vb0: vb, moved: false }
  }

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current) {
      const p = toSvg(e)
      const d = dragRef.current
      d.moved = true
      dispatch({ type: 'MOVE', id: d.id, x: p.x - d.dx, y: p.y - d.dy })
      return
    }
    if (panRef.current) {
      const p = toSvg(e)
      const d = panRef.current
      const ddx = p.x - d.startX
      const ddy = p.y - d.startY
      if (Math.abs(ddx) > 1 || Math.abs(ddy) > 1) {
        d.moved = true
        setVb({ ...d.vb0, x: d.vb0.x - ddx, y: d.vb0.y - ddy })
      }
    }
  }

  const onUp = () => {
    if (dragRef.current) {
      const d = dragRef.current
      const c = comp(d.id)
      if (!d.moved && c?.type === 'SW') dispatch({ type: 'TOGGLE_SWITCH', id: d.id })
      dragRef.current = null
      return
    }
    if (panRef.current) {
      if (!panRef.current.moved) dispatch({ type: 'SELECT', id: null })
      panRef.current = null
    }
  }

  const pinCount: Record<string, number> = {}
  state.wires.forEach((w) => {
    pinCount[w.a] = (pinCount[w.a] || 0) + 1
    pinCount[w.b] = (pinCount[w.b] || 0) + 1
  })

  const pc = sim.ok ? pinCurrentMap(sim) : {}
  const seenNetLabel = new Set<string>()

  return (
    <div className="relative overflow-hidden rounded-b-xl bg-[#0B1524]">
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        className="block h-auto w-full touch-none select-none"
        style={{ minHeight: '46vh', maxHeight: 560 }}
        onPointerDown={onBgDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
      >
        <defs>
          <filter id="beginner-led-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <style>{`
          @keyframes beginner-flow { to { stroke-dashoffset: -24 } }
          .b-flow { stroke: #E8A33D; stroke-width: 2.6; fill: none; stroke-linecap: round; stroke-dasharray: 3 21; animation: beginner-flow 1s linear infinite; pointer-events: none }
          @media (prefers-reduced-motion: reduce) { .b-flow { animation: none; opacity: .5 } }
        `}</style>
        <rect x={-2000} y={-2000} width={6000} height={6000} fill="#0B1524" />
        {Array.from({ length: 37 }, (_, i) => i * 20).map((x) => (
          <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={460} stroke={x % 100 ? '#15304E' : '#1E4470'} strokeWidth={x % 100 ? 0.9 : 1.3} />
        ))}
        {Array.from({ length: 24 }, (_, i) => i * 20).map((y) => (
          <line key={`gy${y}`} x1={0} y1={y} x2={720} y2={y} stroke={y % 100 ? '#15304E' : '#1E4470'} strokeWidth={y % 100 ? 0.9 : 1.3} />
        ))}

        {/* wires */}
        {state.wires.map((w, i) => {
          const [ca, pa] = w.a.split('.')
          const [cb, pb] = w.b.split('.')
          const A = comp(ca)
          const B = comp(cb)
          if (!A || !B) return null
          const p1 = pinWorld(A, pinsOf(A).find((p) => p.n === pa)!)
          const p2 = pinWorld(B, pinsOf(B).find((p) => p.n === pb)!)
          return <path key={i} d={wirePath(p1, p2)} stroke="#8FB8DC" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        })}

        {/* animated current flow */}
        {sim.ok &&
          state.wires.map((w, i) => {
            const ia = pc[w.a] || 0
            const ib = pc[w.b] || 0
            const I = Math.max(Math.abs(ia), Math.abs(ib))
            if (I < 3e-4) return null
            let from = w.a
            let to = w.b
            if (ia < 0 && ib > 0) {
              from = w.b
              to = w.a
            } else if (!(ia > 0 && ib < 0) && (sim.V[sim.pinNet[w.b]] || 0) > (sim.V[sim.pinNet[w.a]] || 0)) {
              from = w.b
              to = w.a
            }
            const [ca, pa] = from.split('.')
            const [cb, pb] = to.split('.')
            const X = comp(ca)
            const Y = comp(cb)
            if (!X || !Y) return null
            const p1 = pinWorld(X, pinsOf(X).find((p) => p.n === pa)!)
            const p2 = pinWorld(Y, pinsOf(Y).find((p) => p.n === pb)!)
            const dur = Math.max(0.28, Math.min(3.2, 0.9 / Math.pow(I / 0.014, 0.5)))
            return <path key={`f${i}`} d={wirePath(p1, p2)} className="b-flow" style={{ animationDuration: `${dur.toFixed(2)}s` }} />
          })}

        {/* net voltage labels */}
        {sim.ok &&
          state.wires.map((w, i) => {
            const nm = sim.pinNet[w.a]
            if (!nm || seenNetLabel.has(nm) || nm === 'GND' || nm === '+5V' || nm === '+3V3') return null
            seenNetLabel.add(nm)
            const [ca, pa] = w.a.split('.')
            const A = comp(ca)
            if (!A) return null
            const p1 = pinWorld(A, pinsOf(A).find((p) => p.n === pa)!)
            return (
              <text
                key={`nl${i}`}
                x={p1.x}
                y={p1.y - 12}
                fontFamily="ui-monospace"
                fontSize={12}
                fontWeight={700}
                fill="#5FD0D8"
                textAnchor="middle"
              >
                {nm} {fmtV(sim.V[nm])}
              </text>
            )
          })}

        {/* components */}
        {state.comps.map((c) => {
          const ledEntry = c.type === 'LED' && sim.ok ? sim.led.find((z) => z.c.id === c.id) : undefined
          const brightness = ledEntry ? Math.max(0, Math.min(1, Math.log10(Math.max(ledEntry.I, 1e-7) / 1e-5) / Math.log10(0.02 / 1e-5))) : 0
          let ioLevel: string | undefined
          if (c.type === 'IO' && sim.ok) {
            const nt = sim.pinNet[c.id + '.1']
            const V = sim.V[nt]
            ioLevel = !sim.driven[nt] ? '?' : V >= 0.7 * 3.3 ? '1' : V <= 0.3 * 3.3 ? '0' : '~'
          }
          return (
            <g key={c.id} transform={`translate(${c.x},${c.y}) rotate(${c.rot || 0})`} style={{ cursor: 'grab' }} onPointerDown={(e) => onCompDown(e, c)}>
              {ledEntry && brightness > 0.03 && (
                <circle cx={0} cy={0} r={17} fill={(c.part as { col?: string })?.col ?? '#E8502F'} opacity={brightness * 0.7} filter="url(#beginner-led-glow)" style={{ pointerEvents: 'none' }} />
              )}
              <rect x={-42} y={-30} width={84} height={60} fill="transparent" />
              <SchematicSymbol type={c.type} part={c.part} closed={c.closed} ioLevel={ioLevel} />
              {state.sel === c.id && <rect x={-50} y={-32} width={100} height={64} rx={6} fill="none" stroke="#E8A33D" strokeWidth={2} strokeDasharray="6 4" style={{ pointerEvents: 'none' }} />}
            </g>
          )
        })}

        {/* reference designators + values, and pin hit targets (drawn last so they stay on top) */}
        {state.comps.map((c) => {
          const def = LIB[c.type]
          if (def.fixed) return null
          let vt = ''
          if (c.type === 'R') vt = fmtR((c.part as ResistorPart).R)
          else if (c.type === 'C') {
            const cp = c.part as { C: number }
            vt = cp.C >= 1e-6 ? `${cp.C * 1e6} µF` : `${cp.C * 1e9} nF`
          } else if (c.type === 'LED' && sim.ok) {
            const d = sim.led.find((z) => z.c.id === c.id)
            vt = d ? fmtI(d.I) : ''
          } else if (c.type === 'SW') vt = c.closed ? 'PRESSED' : 'open'
          else if (c.type === 'Q' && sim.ok) {
            const f = sim.fets.find((z) => z.c.id === c.id)
            vt = f?.on ? 'ON' : 'off'
          }
          return (
            <g key={`lbl${c.id}`} style={{ pointerEvents: 'none' }}>
              <text x={c.x} y={c.y - 24} fontFamily="ui-monospace" fontSize={14} fontWeight={800} fill="#E8A33D" textAnchor="middle">
                {c.id}
              </text>
              {vt && (
                <text x={c.x} y={c.y + 34} fontFamily="ui-monospace" fontSize={13} fontWeight={600} fill="#9FC0DE" textAnchor="middle">
                  {vt}
                </text>
              )}
            </g>
          )
        })}
        {state.comps.map((c) =>
          pinsOf(c).map((p) => {
            const w = pinWorld(c, p)
            const key = `${c.id}.${p.n}`
            const wired = (pinCount[key] || 0) > 0
            return (
              <g key={key}>
                <circle
                  cx={w.x}
                  cy={w.y}
                  r={wired ? 4 : 3.6}
                  fill={state.pinSel === key ? '#E8A33D' : '#0B1524'}
                  stroke={state.pinSel === key ? '#E8A33D' : wired ? '#9FC0DE' : '#E8A33D'}
                  strokeWidth={2}
                  strokeDasharray={wired ? undefined : '3 2.5'}
                  style={{ pointerEvents: 'none' }}
                />
                <circle cx={w.x} cy={w.y} r={26} fill="transparent" style={{ cursor: 'pointer' }} onPointerDown={(e) => onPinDown(e, key)} />
              </g>
            )
          }),
        )}
      </svg>
      <div className="absolute bottom-2.5 end-2.5 flex gap-1.5">
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.3)}
          aria-label="הגדל"
          className="grid size-8 place-items-center rounded-lg border border-border/60 bg-[#132038] text-[#DCE8F5] shadow"
        >
          <ZoomInIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1.3)}
          aria-label="הקטן"
          className="grid size-8 place-items-center rounded-lg border border-border/60 bg-[#132038] text-[#DCE8F5] shadow"
        >
          <ZoomOutIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}
