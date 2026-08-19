import { useMemo, useState } from 'react'
import type { Lesson, MosfetPart } from '../engine/types'
import type { UseSchematicResult } from '../state/use-schematic'
import { probeList, probeValue, runSweep, type Probe } from '../engine/scope'
import { runTransient } from '../engine/transient'
import { fmtI, fmtV } from '../engine/format'
import { LIB } from '../data/symbols'
import { cn } from '@/lib/utils'

const W = 420
const H = 190
const L = 46
const R = 10
const T = 12
const B = 28

/** DC-sweep or transient waveform scope — a real re-solve of the schematic, not a canned plot. */
export function Scope({ lesson, ui }: { lesson: Lesson; ui: UseSchematicResult }) {
  const { state, sim } = ui
  const [probeKey, setProbeKey] = useState<string | null>(null)

  const list = useMemo(() => probeList(state.comps, sim), [state.comps, sim])
  const probe: Probe | null = list.find((p) => p.k === probeKey) ?? list[0] ?? null

  const hasCoil = state.comps.some((c) => c.type === 'L')
  const q = state.comps.find((c) => c.type === 'Q')

  if (lesson.transient && sim.ok && hasCoil && q) {
    const dr = sim.pinNet[q.id + '.D']
    const tr = runTransient(state.comps, state.wires, { tEnd: 6e-3, n: 400, tOpen: 3e-3 })
    if (tr.length) {
      const Vbr = (q.part as MosfetPart).Vbr || 60
      const vals = tr.map((pt) => pt.V[dr] || 0)
      const ymax = Math.max(Math.max(...vals) * 1.15, Vbr * 1.25, 8)
      const L2 = 52
      const R2 = 12
      const T2 = 14
      const B2 = 30
      const X = (t: number) => L2 + (t / 6e-3) * (W - L2 - R2)
      const Y = (v: number) => H - B2 - (v / ymax) * (H - T2 - B2)
      const yb = Y(Vbr)
      let d = ''
      tr.forEach((pt, i) => {
        d += (i ? 'L' : 'M') + X(pt.t).toFixed(1) + ' ' + Y(pt.V[dr] || 0).toFixed(1)
      })
      const pk = Math.max(...vals)
      const killed = pk > Vbr * 0.9

      return (
        <div className="flex flex-col">
          <ScopeHeader label="שיא בכיבוי" value={pk.toFixed(1) + ' V'} title="אוסילוסקופ · מול זמן" />
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full bg-[#0B1524]">
            {[0, 1, 2, 3, 4].map((i) => {
              const y = H - B2 - (i / 4) * (H - T2 - B2)
              return (
                <g key={i}>
                  <line x1={L2} y1={y} x2={W - R2} y2={y} stroke={i ? '#15304E' : '#2B5580'} strokeWidth={i ? 1 : 1.2} />
                  <text x={L2 - 6} y={y + 4} fontFamily="ui-monospace" fontSize={11} fontWeight={600} fill="#8FB0CE" textAnchor="end">
                    {((ymax * i) / 4).toFixed(0)}
                  </text>
                </g>
              )
            })}
            {[0, 1, 2, 3].map((i) => {
              const x = L2 + (i / 3) * (W - L2 - R2)
              return (
                <g key={i}>
                  <line x1={x} y1={T2} x2={x} y2={H - B2} stroke={i ? '#15304E' : '#2B5580'} strokeWidth={i ? 1 : 1.2} />
                  <text x={x} y={H - B2 + 14} fontFamily="ui-monospace" fontSize={11} fontWeight={600} fill="#8FB0CE" textAnchor="middle">
                    {((6 * i) / 3).toFixed(0)} ms
                  </text>
                </g>
              )
            })}
            <line x1={L2} y1={yb} x2={W - R2} y2={yb} stroke="#FF5C5C" strokeWidth={1.3} strokeDasharray="5 4" opacity={0.85} />
            <text x={W - R2} y={yb - 5} fontFamily="ui-monospace" fontSize={11} fill="#FF5C5C" textAnchor="end">
              גבול ה-MOSFET {Vbr} V
            </text>
            <path d={d} stroke="#FF5C5C" strokeWidth={2.6} fill="none" strokeLinejoin="round" />
            <text x={(L2 + W - R2) / 2} y={H - 3} fontFamily="ui-monospace" fontSize={11} fontWeight={600} fill={killed ? '#FF5C5C' : '#3FD68C'} textAnchor="middle">
              {killed ? 'הכיבוי הורג את הטרנזיסטור' : 'הדיודה בולעת את הקפיצה'}
            </text>
          </svg>
          <div className="flex flex-wrap gap-1.5 border-t px-3 py-2.5">
            <span className="rounded-full border border-primary bg-primary px-2.5 py-1 font-mono text-[10px] font-bold text-primary-foreground">
              V על ה-drain · מול זמן
            </span>
          </div>
        </div>
      )
    }
  }

  if (!probe || !sim.ok) {
    return (
      <div className="flex flex-col">
        <ScopeHeader label="בנקודת העבודה" value="—" title="אוסילוסקופ · סריקת DC" />
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full bg-[#0B1524]">
          <text x={W / 2} y={H / 2} fontFamily="ui-monospace" fontSize={11} fill="#8FB0CE" textAnchor="middle">
            No conducting circuit to probe
          </text>
        </svg>
      </div>
    )
  }

  const { xs, ys } = runSweep(state.comps, state.wires, probe)
  const rails = state.comps.filter((c) => LIB[c.type].v !== undefined)
  const vmax = rails.length ? Math.max(...rails.map((c) => LIB[c.type].v!)) : 5
  let ymax = Math.max(...ys.map(Math.abs), 1e-9)
  const isI = probe.type === 'I'
  const scaleY = isI ? (ymax >= 1 ? 1 : ymax >= 1e-3 ? 1e3 : 1e6) : 1
  const unit = isI ? (ymax >= 1 ? 'A' : ymax >= 1e-3 ? 'mA' : 'µA') : 'V'
  ymax *= scaleY
  const nice = Math.pow(10, Math.floor(Math.log10(ymax || 1)))
  ymax = Math.ceil(ymax / nice) * nice || 1

  const X = (v: number) => L + v * (W - L - R)
  const Y = (v: number) => H - B - (v / ymax) * (H - T - B)
  let d = ''
  let fd = ''
  xs.forEach((x, i) => {
    const px = X(x)
    const py = Y(Math.abs(ys[i]) * scaleY)
    d += (i ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1)
    fd += (i ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1)
  })
  fd += `L${X(1).toFixed(1)} ${H - B}L${X(0).toFixed(1)} ${H - B}Z`
  const opv = probeValue(sim, probe)
  const scVal = opv !== null && isFinite(opv) ? (probe.type === 'V' ? fmtV(opv) : fmtI(opv)) : '—'

  return (
    <div className="flex flex-col">
      <ScopeHeader label="בנקודת העבודה" value={scVal} title="אוסילוסקופ · סריקת DC" />
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full bg-[#0B1524]">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = H - B - (i / 4) * (H - T - B)
          return (
            <g key={i}>
              <line x1={L} y1={y} x2={W - R} y2={y} stroke={i ? '#15304E' : '#2B5580'} strokeWidth={i ? 1 : 1.2} />
              <text x={L - 5} y={y + 3} fontFamily="ui-monospace" fontSize={11} fontWeight={600} fill="#8FB0CE" textAnchor="end">
                {(((ymax * i) / 4) || 0).toPrecision(2).replace(/\.?0+$/, '')}
              </text>
            </g>
          )
        })}
        {[0, 1, 2, 3, 4].map((i) => {
          const x = L + (i / 4) * (W - L - R)
          return (
            <g key={i}>
              <line x1={x} y1={T} x2={x} y2={H - B} stroke={i ? '#15304E' : '#2B5580'} strokeWidth={i ? 1 : 1.2} />
              <text x={x} y={H - B + 13} fontFamily="ui-monospace" fontSize={11} fontWeight={600} fill="#8FB0CE" textAnchor="middle">
                {((vmax * i) / 4).toFixed(1)}
              </text>
            </g>
          )
        })}
        <text x={(L + W - R) / 2} y={H - 4} fontFamily="ui-monospace" fontSize={11} fontWeight={600} fill="#8FB0CE" textAnchor="middle">
          supply sweep (V)
        </text>
        <text x={0} y={0} fontFamily="ui-monospace" fontSize={11} fontWeight={600} fill="#8FB0CE" textAnchor="middle" transform={`translate(11,${(T + H - B) / 2}) rotate(-90)`}>
          {probe.label} ({unit})
        </text>
        <path d={fd} fill="#FF5C5C" opacity={0.09} />
        <path d={d} stroke="#FF5C5C" strokeWidth={2.6} fill="none" strokeLinejoin="round" />
        {opv !== null && isFinite(opv) && (
          <>
            <line x1={X(1)} y1={T} x2={X(1)} y2={H - B} stroke="#5FD0D8" strokeWidth={1.4} strokeDasharray="4 3" />
            <circle cx={X(1)} cy={Y(Math.abs(opv) * scaleY)} r={3.6} fill="#5FD0D8" />
          </>
        )}
      </svg>
      <div className="flex flex-wrap gap-1.5 border-t px-3 py-2.5">
        {list.map((p) => (
          <button
            key={p.k}
            type="button"
            onClick={() => setProbeKey(p.k)}
            className={cn(
              'rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold whitespace-nowrap',
              p.type === 'I' && 'border-dashed',
              probe.k === p.k ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ScopeHeader({ label, value, title }: { label: string; value: string; title: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b bg-[#0B1524] px-3 pb-2 pt-2.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-[#8FB0CE]">{title}</span>
      <span className="flex items-baseline gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[#6E8CAC]">
        {label} <span className="text-[15px] font-bold text-[#E8A33D]">{value}</span>
      </span>
    </div>
  )
}
