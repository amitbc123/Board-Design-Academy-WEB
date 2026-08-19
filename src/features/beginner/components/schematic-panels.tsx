import { useMemo } from 'react'
import type { AnyPart, Lesson, MosfetPart, ResistorPart } from '../engine/types'
import type { UseSchematicResult } from '../state/use-schematic'
import { fmtI, fmtP, fmtR, fmtV } from '../engine/format'
import { pinLevel } from '../engine/checks'
import { runTransient } from '../engine/transient'
import { PARTS } from '../data/parts'
import { LIB } from '../data/symbols'
import { cn } from '@/lib/utils'

/** Short value label for a catalog entry — "220 Ω", "2.2 V", "100 nF" — used by both the quick picker and the datasheet's swap list. */
function partValueLabel(opt: AnyPart): string {
  if ('R' in opt) return fmtR(opt.R)
  if ('Vf' in opt) return `${opt.Vf} V`
  if ('C' in opt) return opt.C >= 1e-6 ? `${opt.C * 1e6} µF` : `${opt.C * 1e9} nF`
  return ''
}

/**
 * A one-tap value swap strip shown right next to the canvas whenever the
 * selected component has more than one catalog option (resistors, caps,
 * LED colours). Exists so changing a value doesn't require finding and
 * opening the "Details" disclosure below the fold — the single biggest
 * source of "I can't edit the component value" confusion, especially on
 * a phone where that disclosure sits several screens down.
 */
export function ValueQuickPicker({ ui }: { ui: UseSchematicResult }) {
  const { state, dispatch } = ui
  const c = state.sel ? state.comps.find((x) => x.id === state.sel) : null
  if (!c || LIB[c.type].fixed || !c.part) return null
  const dbKey = LIB[c.type].db
  const options = dbKey ? PARTS[dbKey] : []
  if (options.length <= 1) return null
  const P = c.part

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#1E4470] bg-[#0f1f38] px-2.5 py-2">
      <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wide text-[#6E8CAC]">{c.id} · ערך</span>
      {options.map((opt) => {
        const active = opt.mpn === P.mpn
        return (
          <button
            key={opt.mpn}
            type="button"
            onClick={() => dispatch({ type: 'SET_PART', id: c.id, part: opt })}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-bold transition-colors',
              active ? 'border-primary bg-primary text-primary-foreground' : 'border-[#2A3F5F] text-[#9FC0DE] hover:border-primary/60',
            )}
          >
            {partValueLabel(opt)}
          </button>
        )
      })}
    </div>
  )
}

type ReadoutTone = 'ok' | 'warn' | 'bad' | 'n'

const TONE_CLASS: Record<ReadoutTone, string> = {
  ok: 'border-success/40 text-success',
  warn: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
  bad: 'border-destructive/40 text-destructive',
  n: 'border-border text-foreground',
}

function ReadoutCard({ label, value, tone }: { label: string; value: string; tone: ReadoutTone }) {
  return (
    <div className={cn('min-w-0 flex-1 rounded-xl border bg-muted/30 px-4 py-3', TONE_CLASS[tone].split(' ')[0])}>
      <div className="font-mono text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn('mt-0.5 truncate font-mono text-[26px] font-extrabold leading-tight tabular-nums', TONE_CLASS[tone].split(' ')[1])}>
        {value}
      </div>
    </div>
  )
}

/** The default view's headline numbers — two large readouts, chosen per what's on the board. */
export function BigReadouts({ ui }: { lesson: Lesson; ui: UseSchematicResult }) {
  const { state, sim } = ui
  const cards = useMemo(() => {
    const out: { k: string; v: string; s: ReadoutTone }[] = []
    const led = state.comps.find((c) => c.type === 'LED')
    const io = state.comps.find((c) => c.type === 'IO')
    const rs = state.comps.filter((c) => c.type === 'R')
    if (led && sim.ok) {
      const d = sim.led.find((z) => z.c.id === led.id)
      const I = d ? d.I : 0
      out.push({ k: `IF · ${led.id}`, v: fmtI(I), s: I > 0.02 ? 'bad' : I >= 0.005 ? 'ok' : I > 1e-6 ? 'warn' : 'n' })
      out.push({ k: `VF · ${led.id}`, v: d ? fmtV(d.vd) : '—', s: 'n' })
    }
    if (io && sim.ok) {
      const nt = sim.pinNet[io.id + '.1']
      const lv = pinLevel(sim, nt, 3.3)
      out.push({ k: 'רמת הפין', v: lv.float ? 'צף' : lv.lvl === '1' ? 'HIGH' : lv.lvl === '0' ? 'LOW' : 'אמצע', s: lv.float ? 'bad' : lv.lvl === '~' ? 'warn' : 'ok' })
      out.push({ k: 'מתח הפין', v: lv.v !== null ? fmtV(lv.v) : '—', s: 'n' })
    }
    const coil = state.comps.find((c) => c.type === 'L')
    if (coil && sim.ok && !out.length) {
      const q = state.comps.find((c) => c.type === 'Q')
      if (q) {
        const dr = sim.pinNet[q.id + '.D']
        const tr = runTransient(state.comps, state.wires, { tEnd: 6e-3, n: 220, tOpen: 3e-3 })
        if (tr.length) {
          const onI = Math.max(...tr.filter((pt) => pt.t < 2.9e-3).map((pt) => Math.abs(pt.il[coil.id] || 0)))
          out.push({ k: 'זרם הסליל (דלוק)', v: fmtI(onI), s: 'n' })
          const pk = Math.max(...tr.map((pt) => pt.V[dr] || 0))
          const Vbr = (q.part as MosfetPart).Vbr || 60
          out.push({ k: 'שיא V על ה-drain', v: pk.toFixed(0) + ' V', s: pk > Vbr * 0.9 ? 'bad' : 'ok' })
        }
      } else {
        const li = sim.inds.find((z) => z.c.id === coil.id)
        out.push({ k: 'זרם הסליל', v: li ? fmtI(Math.abs(li.I)) : '—', s: 'n' })
      }
    }
    if (!out.length && rs.length && sim.ok) {
      const mid = sim.nets.find((n) => n.name !== 'GND' && n.name !== '+5V' && n.name !== '+3V3' && n.pins.length > 1)
      if (mid) {
        out.push({ k: 'מתח האמצע', v: fmtV(sim.V[mid.name]), s: Math.abs(sim.V[mid.name] - 3.3) <= 0.2 ? 'ok' : 'bad' })
        const r = sim.res[0]
        if (r) out.push({ k: 'זרם השרשרת', v: fmtI(Math.abs(r.I)), s: 'n' })
      }
    }
    if (!out.length) out.push({ k: 'מצב', v: 'מעגל לא שלם', s: 'n' })
    return out.slice(0, 2)
  }, [state.comps, state.wires, sim])

  return (
    <div className="flex flex-wrap gap-2.5">
      {cards.map((c) => (
        <ReadoutCard key={c.k} label={c.k} value={c.v} tone={c.s} />
      ))}
    </div>
  )
}

/** The compact 4-cell live-measurement grid, tucked behind the "more" disclosure. */
export function MetersPanel({ ui }: { ui: UseSchematicResult }) {
  const { state, sim } = ui
  const out: { l: string; v: string; c: ReadoutTone }[] = []
  const led = state.comps.find((c) => c.type === 'LED')
  const io = state.comps.find((c) => c.type === 'IO')
  if (led && sim.ok) {
    const d = sim.led.find((z) => z.c.id === led.id)
    const I = d ? d.I : 0
    out.push({ l: `IF ${led.id}`, v: fmtI(I), c: I > 0.02 ? 'bad' : I >= 0.005 ? 'ok' : I > 1e-6 ? 'warn' : 'n' })
    out.push({ l: `VF ${led.id}`, v: d ? fmtV(d.vd) : '—', c: 'n' })
  }
  if (io && sim.ok) {
    const nt = sim.pinNet[io.id + '.1']
    const lv = pinLevel(sim, nt, 3.3)
    out.push({ l: 'רמת הפין', v: lv.float ? 'צף' : lv.lvl === '1' ? 'HIGH' : lv.lvl === '0' ? 'LOW' : 'MID', c: lv.float ? 'bad' : lv.lvl === '~' ? 'warn' : 'ok' })
    out.push({ l: 'מתח הפין', v: lv.v !== null ? fmtV(lv.v) : '—', c: 'n' })
  }
  const rs = state.comps.filter((c) => c.type === 'R')
  if (rs.length && sim.ok) {
    const r = sim.res.find((z) => z.c.id === rs[0].id)
    if (r) {
      out.push({ l: `I ${rs[0].id}`, v: fmtI(Math.abs(r.I)), c: 'n' })
      const p = r.I * r.I * (rs[0].part as ResistorPart).R
      out.push({ l: `P ${rs[0].id}`, v: fmtP(p), c: Math.abs(p) > 0.125 ? 'bad' : 'n' })
    }
  }
  while (out.length < 2) out.push({ l: 'Status', v: '—', c: 'n' })

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border">
      {out.slice(0, 4).map((m, i) => (
        <div key={i} className="min-w-0 bg-muted/40 px-2.5 py-2">
          <div className="truncate font-mono text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{m.l}</div>
          <div className={cn('mt-0.5 truncate font-mono text-base font-bold tabular-nums', TONE_CLASS[m.c].split(' ')[1])}>{m.v}</div>
        </div>
      ))}
    </div>
  )
}

/** Selected component's catalog datasheet — spec, absolute maximums, DigiKey link, and a part swap picker. */
export function DatasheetPanel({ ui }: { ui: UseSchematicResult }) {
  const { state, dispatch, sim } = ui
  const c = state.sel ? state.comps.find((x) => x.id === state.sel) : null
  if (!c || LIB[c.type].fixed || !c.part) return null
  const P = c.part
  const dk = `https://www.digikey.com/en/products/result?keywords=${encodeURIComponent(P.mpn)}`
  const dbKey = LIB[c.type].db
  const options = dbKey ? PARTS[dbKey] : []

  let workingRows: { k: string; v: string }[] = []
  if (sim.ok) {
    if (c.type === 'R') {
      const r = sim.res.find((z) => z.c.id === c.id)
      if (r) {
        const V = Math.abs((sim.V[r.a] || 0) - (sim.V[r.b] || 0))
        workingRows = [
          { k: 'Current', v: fmtI(Math.abs(r.I)) },
          { k: 'Voltage', v: fmtV(V) },
          { k: 'Dissipation', v: fmtP(r.I * r.I * (P as ResistorPart).R) },
        ]
      }
    } else if (c.type === 'LED') {
      const d = sim.led.find((z) => z.c.id === c.id)
      if (d) workingRows = [{ k: 'IF', v: `${fmtI(d.I)} / 20 mA` }, { k: 'VF', v: fmtV(d.vd) }]
    } else if (c.type === 'Q') {
      const f = sim.fets.find((z) => z.c.id === c.id)
      if (f) workingRows = [{ k: 'State', v: f.on ? 'ON' : 'off' }, { k: 'VGS', v: fmtV((sim.V[f.g] || 0) - (sim.V[f.s] || 0)) }]
    }
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-sm font-bold">{P.mpn}</div>
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-wide text-primary">{P.mfr}</div>
          <div className="font-mono text-[9.5px] text-muted-foreground">{P.pkg}</div>
        </div>
        <button type="button" onClick={() => dispatch({ type: 'DELETE_SELECTED' })} className="shrink-0 rounded-md border px-2 py-1 text-[11px] text-muted-foreground hover:border-destructive hover:text-destructive">
          מחיקה
        </button>
      </div>
      <a href={dk} target="_blank" rel="noopener noreferrer" className="block rounded-md border px-2 py-1.5 text-center font-mono text-[10.5px] font-bold tracking-wide text-success hover:border-success hover:bg-success/5">
        Datasheet &amp; stock on DigiKey ↗
      </a>
      <Spec title="מאפיינים" rows={P.spec} />
      <Spec title="Absolute maximum ratings" rows={P.amr} amr />
      {workingRows.length > 0 && <Spec title="נקודת עבודה" rows={workingRows.map((r) => [r.k, r.v] as [string, string])} />}
      {options.length > 1 && (
        <div>
          <div className="mb-1.5 border-t pt-2 font-mono text-[9px] font-bold uppercase tracking-wide text-muted-foreground">בחר רכיב</div>
          <div className="flex flex-col gap-1">
            {options.map((opt) => {
              const sec = partValueLabel(opt)
              const active = opt.mpn === P.mpn
              return (
                <button
                  key={opt.mpn}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_PART', id: c.id, part: opt })}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-start transition-colors',
                    active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/60',
                  )}
                >
                  <span className="truncate font-mono text-[10.5px] font-bold">{opt.mpn}</span>
                  <span className="shrink-0 font-mono text-[10.5px] opacity-80">{sec}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Spec({ title, rows, amr }: { title: string; rows: [string, string][]; amr?: boolean }) {
  return (
    <div>
      <div className="mb-1 border-t pt-2 font-mono text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{title}</div>
      <table className="w-full font-mono text-[11px]">
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={i}>
              <td className="py-0.5 pe-2 text-muted-foreground" dangerouslySetInnerHTML={{ __html: k }} />
              <td className={cn('py-0.5 text-end font-semibold tabular-nums', amr && 'text-destructive')} dangerouslySetInnerHTML={{ __html: v }} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const NET_COLORS = ['#E28B4B', '#3EB6BE', '#8E7CC3', '#6AA84F', '#D96C6C', '#C77BB0']

export function NetsTable({ ui }: { ui: UseSchematicResult }) {
  const { sim } = ui
  if (!sim.ok) return <p className="text-sm italic text-muted-foreground">מעגל לא שלם</p>
  const rows = sim.nets.filter((n) => n.pins.length > 1 || n.name === '+5V' || n.name === '+3V3' || n.name === 'GND')
  return (
    <table className="w-full font-mono text-[11px]">
      <thead>
        <tr className="text-start">
          <th className="pb-1.5 text-start text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Net</th>
          <th className="pb-1.5 text-start text-[9px] font-bold uppercase tracking-wide text-muted-foreground">פינים</th>
          <th className="pb-1.5 text-end text-[9px] font-bold uppercase tracking-wide text-muted-foreground">V</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((n, i) => (
          <tr key={n.name} className="border-t border-border/60">
            <td className="py-1">
              <span className="me-1.5 inline-block size-1.5 rounded-sm" style={{ background: NET_COLORS[i % 6] }} />
              {n.name}
            </td>
            <td className="py-1 text-muted-foreground">{n.pins.length}</td>
            <td className="py-1 text-end">{fmtV(sim.V[n.name])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
