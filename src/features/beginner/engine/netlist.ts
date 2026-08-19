import type { NetlistResult, PlacedComponent, Wire } from './types'
import { LIB } from '../data/symbols'

/** Schematic grid: 20 SVG units, everything placed/dragged snaps to it. */
export const GRID = 20
export const snap = (v: number): number => Math.round(v / GRID) * GRID

export function pinWorld(c: PlacedComponent, p: { x: number; y: number }): { x: number; y: number } {
  const r = ((c.rot || 0) * Math.PI) / 180
  const cs = Math.cos(r)
  const sn = Math.sin(r)
  return { x: c.x + p.x * cs - p.y * sn, y: c.y + p.x * sn + p.y * cs }
}

export const pinsOf = (c: PlacedComponent) => LIB[c.type].pins

/**
 * Union-find over pin coordinates — the same way commercial EDA tools derive
 * connectivity from a schematic: every pin touching the same net is one
 * electrical point, however many wires (or none at all, for a fixed power
 * symbol) it takes to draw that.
 */
export function buildNets(comps: PlacedComponent[], wires: Wire[]): NetlistResult {
  const keys: string[] = []
  const idx = new Map<string, number>()
  comps.forEach((c) => pinsOf(c).forEach((p) => {
    const k = c.id + '.' + p.n
    idx.set(k, keys.length)
    keys.push(k)
  }))
  const par = keys.map((_, i) => i)
  const find = (a: number): number => {
    while (par[a] !== a) {
      par[a] = par[par[a]]
      a = par[a]
    }
    return a
  }
  const uni = (a: number, b: number) => {
    a = find(a)
    b = find(b)
    if (a !== b) par[a] = b
  }
  wires.forEach((w) => {
    if (idx.has(w.a) && idx.has(w.b)) uni(idx.get(w.a)!, idx.get(w.b)!)
  })
  const seen: Record<string, number> = {}
  comps.filter((c) => LIB[c.type].net).forEach((c) => {
    const n = LIB[c.type].net!
    const k = c.id + '.1'
    if (seen[n] === undefined) seen[n] = idx.get(k)!
    else uni(idx.get(k)!, seen[n])
  })
  const gr = new Map<number, string[]>()
  keys.forEach((k, i) => {
    const r = find(i)
    if (!gr.has(r)) gr.set(r, [])
    gr.get(r)!.push(k)
  })
  const nets: { name: string; pins: string[] }[] = []
  let n = 1
  for (const [, mem] of gr) {
    let nm: string | null = null
    for (const m of mem) {
      const c = comps.find((x) => x.id === m.split('.')[0])
      if (c && LIB[c.type].net) nm = LIB[c.type].net!
    }
    nets.push({ name: nm || 'N' + n++, pins: mem })
  }
  const pinNet: Record<string, string> = {}
  nets.forEach((t) => t.pins.forEach((p) => (pinNet[p] = t.name)))
  return { nets, pinNet }
}
