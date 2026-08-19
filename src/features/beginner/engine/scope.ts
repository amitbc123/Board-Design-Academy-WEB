import type { PlacedComponent, SolveResult, Wire } from './types'
import { solve } from './solver'
import { LIB } from '../data/symbols'

export interface Probe {
  k: string
  type: 'V' | 'I'
  net?: string
  id?: string
  label: string
  unit: 'V' | 'A'
}

/** Every net worth watching (multi-pin, or a power rail), plus current through every R/LED. */
export function probeList(comps: PlacedComponent[], sim: SolveResult | null): Probe[] {
  if (!sim || !sim.ok) return []
  const out: Probe[] = []
  sim.nets.forEach((n) => {
    if (n.name === 'GND') return
    if (n.pins.length > 1 || LIB.VCC.net === n.name || LIB.V33.net === n.name) {
      out.push({ k: 'V:' + n.name, type: 'V', net: n.name, label: n.name, unit: 'V' })
    }
  })
  comps.forEach((c) => {
    if (c.type === 'R' || c.type === 'LED') out.push({ k: 'I:' + c.id, type: 'I', id: c.id, label: 'I ' + c.id, unit: 'A' })
  })
  return out
}

export function probeValue(sim: SolveResult | null, pr: Probe): number | null {
  if (!sim || !sim.ok) return null
  if (pr.type === 'V') return sim.V[pr.net!]
  const d = sim.led.find((z) => z.c.id === pr.id)
  if (d) return d.I
  const r = sim.res.find((z) => z.c.id === pr.id)
  if (r) return Math.abs(r.I)
  return null
}

/** DC sweep of the supply from 0 to 100%, re-solving at 70 points on the real solver. */
export function runSweep(comps: PlacedComponent[], wires: Wire[], pr: Probe): { xs: number[]; ys: number[] } {
  const N = 70
  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i <= N; i++) {
    const vscale = i / N
    const sim = solve(comps, wires, { vscale })
    const v = probeValue(sim, pr)
    xs.push(vscale)
    ys.push(v === null || !isFinite(v) ? 0 : v)
  }
  return { xs, ys }
}
