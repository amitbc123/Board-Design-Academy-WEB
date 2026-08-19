import type { PlacedComponent, TransientCtx, TransientOptions, TransientSample, Wire } from './types'
import { solve } from './solver'

const DEFAULTS: TransientOptions = { tEnd: 6e-3, n: 600, tOpen: 3e-3 }

/**
 * Backward-Euler transient over one switching event: the on-board switch
 * starts closed (steady state), opens at `tOpen`, and we record the drain
 * voltage / inductor current / flyback-diode current at each step.
 *
 * Pure: builds a fresh comps array per timestep (with the switch's `closed`
 * flag overridden) instead of mutating the caller's schematic state.
 */
export function runTransient(
  comps: PlacedComponent[],
  wires: Wire[],
  opts: Partial<TransientOptions> = {},
): TransientSample[] {
  const o = { ...DEFAULTS, ...opts }
  const sw = comps.find((c) => c.type === 'SW')
  const h = o.tEnd / o.n

  const withSwitch = (closed: boolean): PlacedComponent[] =>
    sw ? comps.map((c) => (c.id === sw.id ? { ...c, closed } : c)) : comps

  // start from the steady state with the switch closed
  const dc = solve(withSwitch(true), wires, { tr: null })
  const st: TransientCtx = { h, vc: {}, il: {} }
  dc.inds.forEach((L) => (st.il[L.c.id] = L.I))
  dc.caps.forEach((C) => (st.vc[C.c.id] = C.V))

  const trace: TransientSample[] = []
  for (let k = 0; k <= o.n; k++) {
    const t = k * h
    const stepComps = withSwitch(t < o.tOpen)
    const r = solve(stepComps, wires, { tr: st })
    if (!r.ok) return trace
    r.inds.forEach((L) => (st.il[L.c.id] = L.I))
    r.caps.forEach((C) => (st.vc[C.c.id] = C.V))
    trace.push({
      t,
      V: { ...r.V },
      il: { ...st.il },
      dioI: r.dio.reduce<Record<string, number>>((a, d) => {
        a[d.c.id] = d.I
        return a
      }, {}),
    })
  }
  return trace
}
