import type {
  CapacitorSolveEntry,
  DiodeSolveEntry,
  DiodePart,
  FetSolveEntry,
  InductorPart,
  InductorSolveEntry,
  LedPart,
  LedSolveEntry,
  MosfetPart,
  PlacedComponent,
  ResSolveEntry,
  ResistorPart,
  SolveOptions,
  SolveResult,
  SwitchSolveEntry,
  Wire,
} from './types'
import { buildNets } from './netlist'

/** Thermal voltage used for every exponential junction model (LED, diode). */
export const VTE = 0.1
/** Deliberate 1 nS conductance on every node — a standard SPICE convergence aid, not a modelling error. */
export const GMIN = 1e-9
/** LED internal bulk resistance — an ideal Shockley junction alone solves to absurd currents. */
export const RS = 12

/** Back-solve I_S so the terminal V_F (after the RS drop) matches the datasheet point at 20 mA. */
export const isatFor = (Vf: number): number => 0.02 / Math.exp((Vf - 0.02 * RS) / VTE)

function gauss(A: Float64Array[], b: Float64Array, n: number): Float64Array | null {
  const M: number[][] = A.map((row, i) => {
    const a = Array.from(row)
    a.push(b[i])
    return a
  })
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    if (Math.abs(M[p][c]) < 1e-16) return null
    ;[M[c], M[p]] = [M[p], M[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      if (!f) continue
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  const x = new Float64Array(n)
  for (let i = 0; i < n; i++) x[i] = M[i][n] / M[i][i]
  return Array.from(x).every(Number.isFinite) ? x : null
}

const EMPTY_RESULT: Omit<SolveResult, 'ok'> = {
  V: {},
  pinNet: {},
  nets: [],
  led: [],
  res: [],
  fets: [],
  sws: [],
  dio: [],
  inds: [],
  caps: [],
  driven: {},
}

/**
 * Modified nodal analysis with Newton-Raphson on the exponential junctions
 * (LED, diode) and on MOSFET avalanche breakdown, Gaussian elimination with
 * partial pivoting. Pure: reads only `comps`/`wires`/`opts`, mutates nothing
 * the caller passed in, returns a fresh result every call.
 */
export function solve(comps: PlacedComponent[], wires: Wire[], opts: SolveOptions = {}): SolveResult {
  const TR = opts.tr ?? null
  const VSCALE = opts.vscale ?? 1
  const { nets, pinNet } = buildNets(comps, wires)
  const rails: { net: string; v: number }[] = []
  ;(['+5V', '+3V3'] as const).forEach((nm) => {
    if (nets.some((n) => n.name === nm)) rails.push({ net: nm, v: nm === '+5V' ? 5 : 3.3 })
  })
  const live = nets.filter((n) => n.name !== 'GND')
  const ni: Record<string, number> = {}
  live.forEach((n, i) => (ni[n.name] = i))
  const N = live.length
  /** A node reference is either a net name, or (for an LED's synthetic internal
   *  node) the numeric index reserved for it directly — mirrors the original
   *  solver's overloaded `nd()`. */
  type NodeRef = string | number
  const nd = (v: NodeRef): number =>
    typeof v === 'number' ? v : v === 'GND' ? -1 : ni[v] === undefined ? -1 : ni[v]

  const res = comps
    .filter((c) => c.type === 'R')
    .map((c) => ({ c, a: pinNet[c.id + '.1'], b: pinNet[c.id + '.2'] }))
  const sws = comps
    .filter((c) => c.type === 'SW')
    .map((c) => ({ c, a: pinNet[c.id + '.1'], b: pinNet[c.id + '.2'] }))
  const fets = comps
    .filter((c) => c.type === 'Q')
    .map((c) => ({
      c,
      g: pinNet[c.id + '.G'],
      d: pinNet[c.id + '.D'],
      s: pinNet[c.id + '.S'],
      on: false,
      avV: undefined as number | undefined,
    }))
  const led = comps
    .filter((c) => c.type === 'LED')
    .map((c, i) => ({
      c,
      a: pinNet[c.id + '.A'],
      b: pinNet[c.id + '.K'],
      mid: N + i,
      vd: 0.6,
      IS: isatFor((c.part as LedPart).Vf),
    }))
  const dio = comps
    .filter((c) => c.type === 'D')
    .map((c) => ({
      c,
      a: pinNet[c.id + '.A'],
      b: pinNet[c.id + '.K'],
      vd: 0.5,
      IS: 0.01 / Math.exp((c.part as DiodePart).Vfd / VTE),
    }))
  const inds = comps
    .filter((c) => c.type === 'L')
    .map((c) => ({ c, a: pinNet[c.id + '.1'], b: pinNet[c.id + '.2'] }))
  const caps = comps
    .filter((c) => c.type === 'C')
    .map((c) => ({ c, a: pinNet[c.id + '.1'], b: pinNet[c.id + '.2'] }))

  const NI = N + led.length
  const M = NI + rails.length
  if (M === 0 || N === 0) return { ok: false, ...EMPTY_RESULT, pinNet, nets }

  let sol: Float64Array | null = null
  for (let it = 0; it < 300; it++) {
    const A: Float64Array[] = Array.from({ length: M }, () => new Float64Array(M))
    const b = new Float64Array(M)
    for (let i = 0; i < NI; i++) A[i][i] += GMIN
    const sg = (x: NodeRef, y: NodeRef, g: number) => {
      const i = nd(x)
      const j = nd(y)
      if (i >= 0) A[i][i] += g
      if (j >= 0) A[j][j] += g
      if (i >= 0 && j >= 0) {
        A[i][j] -= g
        A[j][i] -= g
      }
    }
    const si = (x: NodeRef, y: NodeRef, I: number) => {
      const i = nd(x)
      const j = nd(y)
      if (i >= 0) b[i] -= I
      if (j >= 0) b[j] += I
    }

    res.forEach((r) => sg(r.a, r.b, 1 / Math.max((r.c.part as ResistorPart).R, 1e-4)))
    sws.forEach((w) => sg(w.a, w.b, w.c.closed ? 1 / 0.05 : 1e-12))

    /* inductor: DC -> its winding resistance only.
       transient -> Geq = h/L in parallel with a source of the previous current,
       scaled by 1/(1+Geq*Rw) — omitting that divisor injects a fraction of a
       percent of extra current every step and compounds badly over a run. */
    inds.forEach((L) => {
      const part = L.c.part as InductorPart
      const Rw = Math.max(part.Rs, 1e-3)
      if (!TR) {
        sg(L.a, L.b, 1 / Rw)
      } else {
        const Geq = TR.h / part.L
        const k = 1 + Geq * Rw
        const ip = TR.il[L.c.id] || 0
        sg(L.a, L.b, Geq / k)
        si(L.a, L.b, ip / k)
      }
    })

    /* capacitor: DC -> open (GMIN only). transient -> Geq = C/h with a source of the previous voltage. */
    caps.forEach((C) => {
      if (!TR) {
        sg(C.a, C.b, GMIN)
      } else {
        const Geq = (C.c.part as { C: number }).C / TR.h
        const vp = TR.vc[C.c.id] || 0
        sg(C.a, C.b, Geq)
        si(C.a, C.b, -Geq * vp)
      }
    })

    dio.forEach((d) => {
      const x = Math.min(d.vd / VTE, 80)
      const e = Math.exp(x)
      const Id = d.IS * (e - 1)
      const Gd = Math.max((d.IS / VTE) * e, GMIN)
      sg(d.a, d.b, Gd)
      si(d.a, d.b, Id - Gd * d.vd)
    })

    fets.forEach((f) => {
      const part = f.c.part as MosfetPart
      const vg = nd(f.g) >= 0 && sol ? sol[nd(f.g)] : 0
      const vs = nd(f.s) >= 0 && sol ? sol[nd(f.s)] : 0
      const vgs = vg - vs
      const th = part.Vth
      f.on = vgs > th
      if (f.on) {
        sg(f.d, f.s, 1 / part.Ron)
        return
      }
      /* off: leakage plus avalanche breakdown above the rated V_DS, linearised
         about the previous iterate — this is what a real part does with an
         unclamped inductive load, not a fixed high-impedance leakage constant. */
      const prev = f.avV === undefined ? 0 : f.avV
      const Vbr = part.Vbr || 60
      const nAv = 0.5
      const x = Math.min((prev - Vbr) / nAv, 60)
      const Iav = 1e-9 * Math.exp(x)
      const Gav = Math.max(Iav / nAv, 1e-12)
      sg(f.d, f.s, Gav)
      si(f.d, f.s, Iav - Gav * prev)
    })

    /* LED = internal node (synthetic index d.mid) joined to the anode through
       RS, then the Shockley junction from that internal node to the cathode.
       An ideal junction with no bulk resistance here would solve a real LED
       across 5 V to tens of amps — RS is not optional. */
    led.forEach((d) => {
      sg(d.a, d.mid, 1 / RS)
      const x = Math.min(d.vd / VTE, 80)
      const e = Math.exp(x)
      const Id = d.IS * (e - 1)
      const Gd = Math.max((d.IS / VTE) * e, GMIN)
      sg(d.mid, d.b, Gd)
      si(d.mid, d.b, Id - Gd * d.vd)
    })

    rails.forEach((rl, k) => {
      const j = NI + k
      const p = nd(rl.net)
      if (p >= 0) {
        A[j][p] = 1
        A[p][j] = 1
      } else A[j][j] = 1
      b[j] = rl.v * VSCALE
    })

    const x = gauss(A, b, M)
    if (!x) return { ok: false, ...EMPTY_RESULT, pinNet, nets }
    let dm = 0
    led.forEach((d) => {
      const vm = x[d.mid]
      const vk = nd(d.b) >= 0 ? x[nd(d.b)] : 0
      let nv = vm - vk
      if (nv > d.vd + 0.05) nv = d.vd + 0.05
      else if (nv < d.vd - 0.4) nv = d.vd - 0.4
      dm = Math.max(dm, Math.abs(nv - d.vd))
      d.vd = nv
    })
    dio.forEach((d) => {
      const va = nd(d.a) >= 0 ? x[nd(d.a)] : 0
      const vb = nd(d.b) >= 0 ? x[nd(d.b)] : 0
      let nv = va - vb
      if (nv > d.vd + 0.05) nv = d.vd + 0.05
      else if (nv < d.vd - 0.4) nv = d.vd - 0.4
      dm = Math.max(dm, Math.abs(nv - d.vd))
      d.vd = nv
    })
    fets.forEach((f) => {
      if (f.on) {
        f.avV = 0
        return
      }
      const vd = nd(f.d) >= 0 ? x[nd(f.d)] : 0
      const vs2 = nd(f.s) >= 0 ? x[nd(f.s)] : 0
      let nv = vd - vs2
      const pv = f.avV === undefined ? 0 : f.avV
      if (nv > pv + 2) nv = pv + 2
      else if (nv < pv - 10) nv = pv - 10
      dm = Math.max(dm, Math.abs(nv - pv) * 1e-3)
      f.avV = nv
    })
    sol = x
    if (dm < 1e-11 && it > 6) break
  }
  if (!sol) return { ok: false, ...EMPTY_RESULT, pinNet, nets }

  const V: Record<string, number> = { GND: 0 }
  live.forEach((n, i) => (V[n.name] = sol![i]))

  const ledOut: LedSolveEntry[] = led.map((d) => {
    const x = Math.min(d.vd / VTE, 80)
    const I = d.IS * (Math.exp(x) - 1)
    return { c: d.c, a: d.a, b: d.b, vd: (V[d.a] || 0) - (V[d.b] || 0), IS: d.IS, I }
  })
  const resOut: ResSolveEntry[] = res.map((r) => ({
    c: r.c,
    a: r.a,
    b: r.b,
    I: ((V[r.a] || 0) - (V[r.b] || 0)) / Math.max((r.c.part as ResistorPart).R, 1e-4),
  }))
  const dioOut: DiodeSolveEntry[] = dio.map((d) => {
    const x = Math.min(d.vd / VTE, 80)
    return { c: d.c, a: d.a, b: d.b, vd: d.vd, IS: d.IS, I: d.IS * (Math.exp(x) - 1) }
  })
  const indsOut: InductorSolveEntry[] = inds.map((L) => {
    const part = L.c.part as InductorPart
    const v = (V[L.a] || 0) - (V[L.b] || 0)
    let I: number
    if (!TR) {
      I = v / Math.max(part.Rs, 1e-3)
    } else {
      const Geq = TR.h / part.L
      const Rw = Math.max(part.Rs, 1e-3)
      const k = 1 + Geq * Rw
      I = (Geq / k) * v + (TR.il[L.c.id] || 0) / k
    }
    return { c: L.c, a: L.a, b: L.b, I, V: v }
  })
  const capsOut: CapacitorSolveEntry[] = caps.map((C) => ({
    c: C.c,
    a: C.a,
    b: C.b,
    V: (V[C.a] || 0) - (V[C.b] || 0),
  }))
  const fetsOut: FetSolveEntry[] = fets.map((f) => ({
    c: f.c,
    g: f.g,
    d: f.d,
    s: f.s,
    on: f.on,
    avV: f.avV,
  }))
  const swsOut: SwitchSolveEntry[] = sws.map((w) => ({ c: w.c, a: w.a, b: w.b }))

  /* floating detection: nets touching only high-Z pins are undriven */
  const drv: Record<string, true> = {}
  const mark = (n: string) => {
    if (n) drv[n] = true
  }
  res.forEach((r) => {
    mark(r.a)
    mark(r.b)
  })
  sws.forEach((w) => {
    if (w.c.closed) {
      mark(w.a)
      mark(w.b)
    }
  })
  led.forEach((d) => {
    mark(d.a)
    mark(d.b)
  })
  dio.forEach((d) => {
    mark(d.a)
    mark(d.b)
  })
  inds.forEach((L) => {
    mark(L.a)
    mark(L.b)
  })
  caps.forEach((C) => {
    mark(C.a)
    mark(C.b)
  })
  fets.forEach((f) => {
    if (f.on) {
      mark(f.d)
      mark(f.s)
    }
  })
  nets.forEach((n) => {
    if (n.name === 'GND' || n.name === '+5V' || n.name === '+3V3') drv[n.name] = true
  })

  return {
    ok: true,
    V,
    pinNet,
    nets,
    led: ledOut,
    res: resOut,
    fets: fetsOut,
    sws: swsOut,
    dio: dioOut,
    inds: indsOut,
    caps: capsOut,
    driven: drv,
  }
}
