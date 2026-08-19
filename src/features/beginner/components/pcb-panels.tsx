import type { UsePcbResult } from '../state/use-pcb'
import { ipcWidth, loopArea, pcbNets, ratsLen, unrouted } from '../engine/pcb'
import { fmtI } from '../engine/format'
import { cn } from '@/lib/utils'

const WIDTHS: [number, string][] = [
  [0.15, 'מינימום'],
  [0.25, 'אות'],
  [0.6, 'הספק'],
  [1.0, 'נפחי'],
  [1.6, 'כבד'],
]

export function WidthPicker({ ui }: { ui: UsePcbResult }) {
  const { pcb, dispatch } = ui
  return (
    <div className="flex flex-col gap-1">
      {WIDTHS.map(([v, label]) => {
        const active = pcb.width === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => dispatch({ type: 'SET_WIDTH', width: v })}
            className={cn(
              'flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-start transition-colors',
              active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/60',
            )}
          >
            <span className="font-mono text-[10.5px] font-bold">{label}</span>
            <span className="font-mono text-[10.5px] opacity-80">{v.toFixed(2)} mm</span>
          </button>
        )
      })}
    </div>
  )
}

type Tone = 'ok' | 'warn' | 'bad' | 'n'
const TONE_TEXT: Record<Tone, string> = {
  ok: 'text-success',
  warn: 'text-amber-600 dark:text-amber-400',
  bad: 'text-destructive',
  n: 'text-foreground',
}
const TONE_BORDER: Record<Tone, string> = {
  ok: 'border-success/40',
  warn: 'border-amber-500/40',
  bad: 'border-destructive/40',
  n: 'border-border',
}

export function PcbReadouts({ ui }: { ui: UsePcbResult }) {
  const { pcb } = ui
  const un = unrouted(pcb)
  const rl = ratsLen(pcb)
  const cards: { k: string; v: string; s: Tone }[] = [{ k: 'Ratsnest', v: un ? `${un} לא מנותב` : 'הכל מנותב', s: un ? 'warn' : 'ok' }]
  if (pcb.kind === 'decap') {
    const A = loopArea(pcb)
    cards.push({ k: 'שטח לולאה', v: A === null ? '—' : `${A.toFixed(1)} mm²`, s: A === null ? 'n' : A <= 12 ? 'ok' : 'bad' })
  } else if (pcb.kind === 'width') {
    cards.push({ k: 'רוחב מינימלי IPC', v: `${ipcWidth(pcb.cur, 10).toFixed(2)} mm`, s: 'n' })
  } else if (pcb.kind === 'placement') {
    cards.push({ k: 'אורך Ratsnest', v: `${rl.toFixed(1)} mm`, s: rl <= 32 ? 'ok' : 'bad' })
  } else {
    cards.push({ k: 'אורך Ratsnest', v: `${rl.toFixed(1)} mm`, s: 'n' })
  }
  return (
    <div className="flex flex-wrap gap-2.5">
      {cards.slice(0, 2).map((c) => (
        <div key={c.k} className={cn('min-w-0 flex-1 rounded-xl border bg-muted/30 px-4 py-3', TONE_BORDER[c.s])}>
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{c.k}</div>
          <div className={cn('mt-0.5 truncate font-mono text-[26px] font-extrabold leading-tight tabular-nums', TONE_TEXT[c.s])}>{c.v}</div>
        </div>
      ))}
    </div>
  )
}

export function BoardInfoPanel({ ui }: { ui: UsePcbResult }) {
  const { pcb, board } = ui
  const { byNet } = pcbNets(pcb)
  const len = pcb.traces.reduce((a, t) => {
    let s = 0
    for (let i = 0; i < t.pts.length - 1; i++) s += Math.hypot(t.pts[i + 1].x - t.pts[i].x, t.pts[i + 1].y - t.pts[i].y)
    return a + s
  }, 0)
  const un = unrouted(pcb)
  const rl = ratsLen(pcb)
  const rows: [string, string, boolean?][] = [
    ['לוח', `${board.w} × ${board.h} mm`],
    ['שכבות', '1 · עליונה'],
    ['Nets', String(Object.keys(byNet).length)],
    ['Ratsnest', String(un), un > 0],
    ['אורך Ratsnest', `${rl.toFixed(1)} mm`],
    ['נחושת', `${len.toFixed(1)} mm`],
  ]
  if (pcb.kind === 'decap') {
    const A = loopArea(pcb)
    rows.push(['שטח לולאה', A === null ? '—' : `${A.toFixed(1)} mm²`])
  }
  if (pcb.kind === 'width') {
    rows.push(['זרם ה-rail', fmtI(pcb.cur)])
    rows.push(['רוחב מינימלי IPC', `${ipcWidth(pcb.cur, 10).toFixed(2)} mm`])
  }
  return (
    <table className="w-full font-mono text-[11px]">
      <tbody>
        {rows.map(([k, v, warn], i) => (
          <tr key={i}>
            <td className="py-0.5 pe-2 text-muted-foreground">{k}</td>
            <td className={cn('py-0.5 text-end font-semibold tabular-nums', warn && 'text-amber-600 dark:text-amber-400')}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
