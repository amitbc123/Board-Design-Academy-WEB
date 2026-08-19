import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { UsePcbResult } from '../state/use-pcb'
import { FP, groups, pcbNets } from '../engine/pcb'

const MM = 17

/** PCB placement + 45°-constrained routing editor, drawn to scale in millimetres. */
export function PcbCanvas({ ui }: { ui: UsePcbResult }) {
  const { pcb, board, dispatch } = ui
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const OX = (720 - board.w * MM) / 2
  const OY = (440 - board.h * MM) / 2

  /** Client -> board millimetres, via the screen CTM (see SchematicCanvas's toSvg for why
   *  a bounding-box ratio isn't enough once the container's aspect ratio doesn't match 720:460). */
  const toMm = (e: { clientX: number; clientY: number }): { x: number; y: number } => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(ctm.inverse())
    return { x: (p.x - OX) / MM, y: (p.y - OY) / MM }
  }

  const onPadDown = (e: ReactPointerEvent, padKey: string) => {
    e.stopPropagation()
    dispatch({ type: 'PAD_CLICK', padKey })
  }

  const onPartDown = (e: ReactPointerEvent, id: string) => {
    e.stopPropagation()
    const mm = toMm(e)
    const pt = pcb.parts.find((p) => p.id === id)!
    dragRef.current = { id, dx: mm.x - pt.x, dy: mm.y - pt.y }
    dispatch({ type: 'SELECT', id })
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onBgDown = (e: ReactPointerEvent) => {
    if (pcb.routing) {
      dispatch({ type: 'ROUTE_POINT', mm: toMm(e) })
      return
    }
    dispatch({ type: 'SELECT', id: null })
  }

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const mm = toMm(e)
    if (dragRef.current) {
      dispatch({ type: 'MOVE_PART', id: dragRef.current.id, mmX: mm.x - dragRef.current.dx, mmY: mm.y - dragRef.current.dy })
      return
    }
    if (pcb.routing) dispatch({ type: 'ROUTE_CURSOR', mm })
  }

  const onUp = () => {
    dragRef.current = null
  }

  const { pads, byNet } = pcbNets(pcb)

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 720 460"
      className="block h-auto w-full touch-none select-none"
      style={{ minHeight: '46vh', maxHeight: 560, background: 'var(--muted)' }}
      onPointerDown={onBgDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <rect x={OX} y={OY} width={board.w * MM} height={board.h * MM} rx={6} fill="#124A38" stroke="#0A2A20" strokeWidth={2} />
      <g opacity={0.4}>
        {Array.from({ length: Math.floor(board.w / 2) + 1 }, (_, i) => i * 2).map((x) => (
          <line key={`vx${x}`} x1={OX + x * MM} y1={OY} x2={OX + x * MM} y2={OY + board.h * MM} stroke="#fff" strokeWidth={0.4} />
        ))}
        {Array.from({ length: Math.floor(board.h / 2) + 1 }, (_, i) => i * 2).map((y) => (
          <line key={`vy${y}`} x1={OX} y1={OY + y * MM} x2={OX + board.w * MM} y2={OY + y * MM} stroke="#fff" strokeWidth={0.4} />
        ))}
      </g>

      {/* ratsnest: shortest unrouted link between each net's groups */}
      {Object.entries(byNet).map(([net, ps]) => {
        if (ps.length < 2) return null
        const gs = groups(net, ps, pcb)
        const lines: React.ReactNode[] = []
        for (let i = 1; i < gs.length; i++) {
          let best: { d: number; a: { x: number; y: number }; c: { x: number; y: number } } | null = null
          gs[i - 1].forEach((a) =>
            gs[i].forEach((c) => {
              const d = Math.hypot(a.x - c.x, a.y - c.y)
              if (!best || d < best.d) best = { d, a, c }
            }),
          )
          if (best) {
            const b = best as { d: number; a: { x: number; y: number }; c: { x: number; y: number } }
            lines.push(
              <line
                key={`${net}-${i}`}
                x1={OX + b.a.x * MM}
                y1={OY + b.a.y * MM}
                x2={OX + b.c.x * MM}
                y2={OY + b.c.y * MM}
                stroke="#E6C64A"
                strokeWidth={1.1}
                strokeDasharray="4 3"
                opacity={0.9}
              />,
            )
          }
        }
        return lines
      })}

      {/* routed copper */}
      {pcb.traces.map((t, i) => (
        <path
          key={i}
          d={t.pts.map((p, j) => (j ? 'L' : 'M') + (OX + p.x * MM) + ' ' + (OY + p.y * MM)).join('')}
          stroke="#C9862F"
          strokeWidth={t.width * MM}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {pcb.routing && (
        <path
          d={pcb.routing.pts
            .concat(pcb.routing.cur ? [pcb.routing.cur] : [])
            .map((p, j) => (j ? 'L' : 'M') + (OX + p.x * MM) + ' ' + (OY + p.y * MM))
            .join('')}
          stroke="#C9862F"
          strokeWidth={pcb.width * MM}
          fill="none"
          strokeLinecap="round"
          opacity={0.5}
          strokeDasharray="5 4"
        />
      )}

      {/* footprints */}
      {pcb.parts.map((p) => {
        const f = FP[p.fp]
        return (
          <g key={p.id}>
            <g transform={`translate(${OX + p.x * MM},${OY + p.y * MM}) rotate(${p.rot || 0})`} style={{ cursor: 'grab' }} onPointerDown={(e) => onPartDown(e, p.id)}>
              <rect x={(-f.body[0] * MM) / 2} y={(-f.body[1] * MM) / 2} width={f.body[0] * MM} height={f.body[1] * MM} stroke="#E8EEF2" strokeWidth={1.3} fill="none" opacity={0.8} />
              {f.pol && <path d={`M${-f.body[0] * MM / 2 - 4} ${-f.body[1] * MM / 2}v${f.body[1] * MM}`} stroke="#E8EEF2" strokeWidth={1.3} fill="none" opacity={0.8} />}
              {f.pin1 && <circle cx={-f.body[0] * MM / 2 + 5} cy={f.body[1] * MM / 2 - 5} r={2} stroke="#E8EEF2" strokeWidth={1.3} fill="none" opacity={0.8} />}
              {f.pads.map((pd) => (
                <rect
                  key={pd.n}
                  x={pd.x * MM - (pd.w * MM) / 2}
                  y={pd.y * MM - (pd.h * MM) / 2}
                  width={pd.w * MM}
                  height={pd.h * MM}
                  rx={pd.r ? (pd.w * MM) / 2 : undefined}
                  fill="#D8B26A"
                  stroke="#8A6A2E"
                  strokeWidth={0.7}
                />
              ))}
            </g>
            {pcb.sel === p.id && (
              <rect
                x={OX + p.x * MM - (f.body[0] * MM) / 2 - 6}
                y={OY + p.y * MM - (f.body[1] * MM) / 2 - 6}
                width={f.body[0] * MM + 12}
                height={f.body[1] * MM + 12}
                rx={4}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
            )}
            <text x={OX + p.x * MM} y={OY + p.y * MM - (f.body[1] * MM) / 2 - 7} fontFamily="ui-monospace" fontSize={9.5} fontWeight={700} fill="#E8EEF2" textAnchor="middle" opacity={0.92} style={{ pointerEvents: 'none' }}>
              {p.id}
            </text>
            <text x={OX + p.x * MM} y={OY + p.y * MM + (f.body[1] * MM) / 2 + 11} fontFamily="ui-monospace" fontSize={7} fill="#E8EEF2" textAnchor="middle" opacity={0.55} style={{ pointerEvents: 'none' }}>
              {p.mpn}
            </text>
          </g>
        )
      })}

      {/* pad hit targets, on top */}
      {pads
        .filter((p) => p.net)
        .map((p) => (
          <circle key={p.key} cx={OX + p.x * MM} cy={OY + p.y * MM} r={20} fill="transparent" style={{ cursor: 'pointer' }} onPointerDown={(e) => onPadDown(e, p.key)} />
        ))}

      <text x={360} y={OY + board.h * MM + 20} fontFamily="ui-monospace" fontSize={9} fill="var(--muted-foreground)" textAnchor="middle">
        {board.w} × {board.h} mm · 1 oz copper · {board.layer} · 0.20 mm rules
      </text>
    </svg>
  )
}
