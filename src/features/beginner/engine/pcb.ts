import type {
  BoardDef,
  FootprintDef,
  FootprintKind,
  PcbPad,
  PcbPad_Located,
  PcbPart,
  PcbState,
  PlacedComponent,
  ResistorPart,
  SolveResult,
  Verdict,
} from './types'
import { fmtI } from './format'

/** Footprint pad geometry, in millimetres, local to the part's own (unrotated) frame. */
export const FP: Record<FootprintKind, FootprintDef> = {
  R: {
    pads: [
      { n: '1', x: -0.95, y: 0, w: 1, h: 1.35 },
      { n: '2', x: 0.95, y: 0, w: 1, h: 1.35 },
    ],
    body: [2, 1.25],
  },
  C: {
    pads: [
      { n: '1', x: -0.95, y: 0, w: 1, h: 1.35 },
      { n: '2', x: 0.95, y: 0, w: 1, h: 1.35 },
    ],
    body: [2, 1.25],
  },
  LED: {
    pads: [
      { n: 'A', x: -0.95, y: 0, w: 1, h: 1.35 },
      { n: 'K', x: 0.95, y: 0, w: 1, h: 1.35 },
    ],
    body: [2, 1.25],
    pol: 1,
  },
  J: {
    pads: [
      { n: '1', x: -1.27, y: 0, w: 1.7, h: 1.7, r: true },
      { n: '2', x: 1.27, y: 0, w: 1.7, h: 1.7, r: true },
    ],
    body: [5, 2.5],
  },
  SOIC8: {
    pads: (() => {
      const a: PcbPad[] = []
      for (let i = 0; i < 4; i++) a.push({ n: String(i + 1), x: -1.905 + i * 1.27, y: 2.6, w: 0.6, h: 1.5 })
      for (let i = 0; i < 4; i++) a.push({ n: String(8 - i), x: -1.905 + i * 1.27, y: -2.6, w: 0.6, h: 1.5 })
      return a
    })(),
    body: [5, 3.9],
    pin1: 1,
  },
}

/** Board presets. `led` mirrors whatever resistor/LED the schematic step solved; the
 *  other three (pcbonly lessons) are fixed layouts with no schematic behind them. */
export const BOARDS: Record<'led' | 'decap' | 'width' | 'placement', BoardDef> = {
  led: {
    w: 24,
    h: 16,
    cur: 0,
    layer: 'Top copper',
    build(schComps: PlacedComponent[], schSim: SolveResult | null) {
      const s = schSim
      const P: PcbPart[] = [{ id: 'J1', fp: 'J', x: 5, y: 8, rot: 0, mpn: '61300211121', map: { '1': '+5V', '2': 'GND' } }]
      schComps
        .filter((c) => c.type === 'R')
        .forEach((c, i) => {
          P.push({
            id: c.id,
            fp: 'R',
            x: 12,
            y: 5 + i * 4,
            rot: 0,
            mpn: (c.part as ResistorPart).mpn,
            map: { '1': s?.pinNet[c.id + '.1'] ?? '', '2': s?.pinNet[c.id + '.2'] ?? '' },
          })
        })
      schComps
        .filter((c) => c.type === 'LED')
        .forEach((c) => {
          P.push({
            id: c.id,
            fp: 'LED',
            x: 19,
            y: 8,
            rot: 0,
            mpn: (c.part as { mpn: string }).mpn,
            map: { A: s?.pinNet[c.id + '.A'] ?? '', K: s?.pinNet[c.id + '.K'] ?? '' },
          })
        })
      return { parts: P, cur: s?.ok && s.led[0] ? s.led[0].I : 0.014 }
    },
  },
  decap: {
    w: 20,
    h: 14,
    cur: 0.05,
    layer: 'Top copper',
    goal: 'loop',
    build() {
      const parts: PcbPart[] = [
        {
          id: 'U1',
          fp: 'SOIC8',
          x: 7,
          y: 7,
          rot: 0,
          mpn: 'STM32G071 · VDD/VSS',
          map: { '8': '+3V3', '4': 'GND', '1': '', '2': '', '3': '', '5': '', '6': '', '7': '' },
        },
        { id: 'C1', fp: 'C', x: 15, y: 11, rot: 0, mpn: 'GRM21BR71H104KA01L', map: { '1': '+3V3', '2': 'GND' } },
      ]
      return { parts, cur: 0.05 }
    },
  },
  width: {
    w: 26,
    h: 16,
    cur: 1.2,
    layer: 'Top copper',
    goal: 'width',
    build() {
      const parts: PcbPart[] = [
        { id: 'J1', fp: 'J', x: 4.5, y: 8, rot: 0, mpn: '61300211121', map: { '1': 'VMOT', '2': 'GND' } },
        {
          id: 'U2',
          fp: 'SOIC8',
          x: 19,
          y: 8,
          rot: 0,
          mpn: 'DRV8871 driver',
          map: { '8': 'VMOT', '4': 'GND', '1': '', '2': '', '3': '', '5': '', '6': '', '7': '' },
        },
      ]
      return { parts, cur: 1.2 }
    },
  },
  placement: {
    w: 26,
    h: 18,
    cur: 0.02,
    layer: 'Top copper',
    goal: 'rats',
    build() {
      const parts: PcbPart[] = [
        { id: 'J1', fp: 'J', x: 4, y: 4, rot: 0, mpn: '61300211121', map: { '1': '+3V3', '2': 'GND' } },
        {
          id: 'U1',
          fp: 'SOIC8',
          x: 20,
          y: 14,
          rot: 0,
          mpn: 'BME280',
          map: { '8': '+3V3', '4': 'GND', '1': 'SDA', '2': 'SCL', '3': '', '5': '', '6': '', '7': '' },
        },
        { id: 'C1', fp: 'C', x: 5, y: 15, rot: 0, mpn: 'GRM21BR71H104KA01L', map: { '1': '+3V3', '2': 'GND' } },
        { id: 'R1', fp: 'R', x: 22, y: 3, rot: 0, mpn: 'RC0805FR-074K7L', map: { '1': '+3V3', '2': 'SDA' } },
        { id: 'R2', fp: 'R', x: 4, y: 10, rot: 0, mpn: 'RC0805FR-074K7L', map: { '1': '+3V3', '2': 'SCL' } },
      ]
      return { parts, cur: 0.02 }
    },
  },
}

export function initPcb(kind: 'led' | 'decap' | 'width' | 'placement', schComps: PlacedComponent[], schSim: SolveResult | null): PcbState {
  const B = BOARDS[kind]
  const r = B.build(schComps, schSim)
  return {
    kind,
    parts: r.parts.map((p) => ({ ...p, rot: p.rot || 0 })),
    traces: [],
    width: 0.25,
    cur: r.cur,
    sel: null,
    routing: null,
  }
}

/** Constrain a routed segment to 0/45/90° from its anchor, snapped to a 0.25 mm grid. */
export function snap45(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number } {
  const q = (v: number) => Math.round(v * 4) / 4
  let dx = to.x - from.x
  let dy = to.y - from.y
  if (Math.abs(dx) > Math.abs(dy) * 2.4) dy = 0
  else if (Math.abs(dy) > Math.abs(dx) * 2.4) dx = 0
  else {
    const d = (Math.abs(dx) + Math.abs(dy)) / 2
    dx = Math.sign(dx) * d
    dy = Math.sign(dy) * d
  }
  return { x: q(from.x + dx), y: q(from.y + dy) }
}

export function padWorld(p: PcbPart, pd: PcbPad): { x: number; y: number } {
  const r = ((p.rot || 0) * Math.PI) / 180
  const cs = Math.cos(r)
  const sn = Math.sin(r)
  return { x: p.x + pd.x * cs - pd.y * sn, y: p.y + pd.x * sn + pd.y * cs }
}

export function allPads(pcb: PcbState): PcbPad_Located[] {
  const o: PcbPad_Located[] = []
  pcb.parts.forEach((p) => {
    FP[p.fp].pads.forEach((pd) => {
      const w = padWorld(p, pd)
      o.push({ key: p.id + '.' + pd.n, net: p.map[pd.n] || '', x: w.x, y: w.y, pd, part: p })
    })
  })
  return o
}

export function pcbNets(pcb: PcbState): { pads: PcbPad_Located[]; byNet: Record<string, PcbPad_Located[]> } {
  const pads = allPads(pcb)
  const byNet: Record<string, PcbPad_Located[]> = {}
  pads.forEach((p) => {
    if (!p.net) return
    ;(byNet[p.net] = byNet[p.net] || []).push(p)
  })
  return { pads, byNet }
}

export const nearP = (p: { x: number; y: number }, q: { x: number; y: number }) => Math.hypot(p.x - q.x, p.y - q.y) < 0.4

export function groups(net: string, pads: PcbPad_Located[], pcb: PcbState): PcbPad_Located[][] {
  const ix = new Map<string, number>()
  pads.forEach((p, i) => ix.set(p.key, i))
  const par = pads.map((_, i) => i)
  const f = (a: number): number => {
    while (par[a] !== a) {
      par[a] = par[par[a]]
      a = par[a]
    }
    return a
  }
  pcb.traces
    .filter((t) => t.net === net)
    .forEach((t) => {
      const s = pads.find((p) => nearP(p, t.pts[0]))
      const e = pads.find((p) => nearP(p, t.pts[t.pts.length - 1]))
      if (s && e) {
        const a = f(ix.get(s.key)!)
        const b = f(ix.get(e.key)!)
        if (a !== b) par[a] = b
      }
    })
  const g = new Map<number, PcbPad_Located[]>()
  pads.forEach((p, i) => {
    const r = f(i)
    if (!g.has(r)) g.set(r, [])
    g.get(r)!.push(p)
  })
  return [...g.values()]
}

function segD(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, d: { x: number; y: number }): number {
  const s = (p: { x: number; y: number }, q: { x: number; y: number }, r: { x: number; y: number }) => {
    const vx = r.x - q.x
    const vy = r.y - q.y
    const L = vx * vx + vy * vy
    let t = L ? ((p.x - q.x) * vx + (p.y - q.y) * vy) / L : 0
    t = Math.max(0, Math.min(1, t))
    return Math.hypot(p.x - (q.x + t * vx), p.y - (q.y + t * vy))
  }
  return Math.min(s(a, c, d), s(b, c, d), s(c, a, b), s(d, a, b))
}

export function ratsLen(pcb: PcbState): number {
  const { byNet } = pcbNets(pcb)
  let L = 0
  Object.entries(byNet).forEach(([n, ps]) => {
    if (ps.length < 2) return
    const gs = groups(n, ps, pcb)
    for (let i = 1; i < gs.length; i++) {
      let best: { d: number } | null = null
      gs[i - 1].forEach((a) =>
        gs[i].forEach((c) => {
          const d = Math.hypot(a.x - c.x, a.y - c.y)
          if (!best || d < best.d) best = { d }
        }),
      )
      if (best) L += (best as { d: number }).d
    }
  })
  return L
}

export function unrouted(pcb: PcbState): number {
  const { byNet } = pcbNets(pcb)
  let u = 0
  Object.entries(byNet).forEach(([n, ps]) => {
    if (ps.length > 1) u += groups(n, ps, pcb).length - 1
  })
  return u
}

export function overlaps(pcb: PcbState): number {
  let n = 0
  for (let i = 0; i < pcb.parts.length; i++) {
    for (let j = i + 1; j < pcb.parts.length; j++) {
      const a = pcb.parts[i]
      const b = pcb.parts[j]
      const fa = FP[a.fp]
      const fb = FP[b.fp]
      if (
        Math.abs(a.x - b.x) < (fa.body[0] + fb.body[0]) / 2 + 0.3 &&
        Math.abs(a.y - b.y) < (fa.body[1] + fb.body[1]) / 2 + 0.3
      )
        n++
    }
  }
  return n
}

/** IPC-2221 external-layer trace width for a given current and temperature rise. */
export function ipcWidth(I: number, dT: number): number {
  const A = Math.pow(I / (0.048 * Math.pow(dT, 0.44)), 1 / 0.725)
  return (A / 1.37) * 0.0254
}

export function loopArea(pcb: PcbState): number | null {
  const pw = pcb.traces.filter((t) => t.net === '+3V3')
  const pg = pcb.traces.filter((t) => t.net === 'GND')
  if (!pw.length || !pg.length) return null
  const len = (t: { pts: { x: number; y: number }[] }) => {
    let s = 0
    for (let i = 0; i < t.pts.length - 1; i++) s += Math.hypot(t.pts[i + 1].x - t.pts[i].x, t.pts[i + 1].y - t.pts[i].y)
    return s
  }
  const lp = Math.max(...pw.map(len))
  const lg = Math.max(...pg.map(len))
  const pads = allPads(pcb)
  const vp = pads.find((p) => p.part.id === 'C1' && p.net === '+3V3')
  const gp = pads.find((p) => p.part.id === 'C1' && p.net === 'GND')
  const sep = vp && gp ? Math.hypot(vp.x - gp.x, vp.y - gp.y) : 2
  return ((lp + lg) / 2) * sep
}

export function runDRC(pcb: PcbState): Verdict[] {
  const { pads } = pcbNets(pcb)
  const out: Verdict[] = []
  const K = pcb.kind
  const un = unrouted(pcb)

  if (K === 'placement') {
    const L = ratsLen(pcb)
    const ov = overlaps(pcb)
    if (ov) {
      out.push({
        s: 'bad',
        t: `${ov} footprints חופפים`,
        what: 'שני רכיבים או יותר תופסים את אותו מקום.',
        why: 'מכונת ההרכבה לא יכולה פיזית להציב אותם. חפיפת courtyard היא הדבר הראשון שכל DRC תופס, וזה תמיד קטלני.',
        prin: 'לכל footprint יש courtyard שצריך להישאר פנוי.',
        fix: 'גרור את הרכיבים הרחק אחד מהשני.',
      })
    }
    if (L <= 32 && !ov) {
      out.push({
        s: 'ok',
        t: `סך ה-Ratsnest הוא ${L.toFixed(1)} mm`,
        what: `כל החיבורים מסתכמים ב-${L.toFixed(1)} mm, מתחת למטרה של 32 mm.`,
        why: 'קווי ratsnest קצרים יותר פירושם מסילות קצרות יותר, פחות חציות, פחות צימוד ופחות השראות לולאה. קיבצת את ה-pull-ups קרוב לחיישן ואת קבל הפריקה קרוב לפין ההזנה שלו.',
        prin: 'המיקום קובע כמה קשה יהיה הניתוב. תבצע אופטימיזציה לפני שאתה מותח מסילה אחת.',
        fix: '—',
      })
    } else if (!ov) {
      out.push({
        s: 'bad',
        t: `סך ה-Ratsnest הוא ${L.toFixed(1)} mm`,
        what: `המטרה היא מתחת ל-32 mm; אתה ב-${L.toFixed(1)} mm.`,
        why: 'קווי ratsnest ארוכים פירושם שהרכיבים שמדברים אחד עם השני נמצאים רחוק אחד מהשני. כל מילימטר הופך למסילה עם השראות, וחציות הופכות ל-vias.',
        prin: 'קבץ לפי פונקציה ועקוב אחרי זרימת האותות. הפריקה (decoupling) שייכת לפין שלה.',
        fix: 'הזז את C1 לצד פיני ההזנה של U1, ואת ה-pull-ups R1/R2 קרוב ל-SDA/SCL של החיישן.',
      })
    }
    return out
  }

  if (un > 0) {
    out.push({
      s: 'bad',
      t: `${un} חיבור${un > 1 ? 'ים' : ''} עוד לא מנותב`,
      what: 'קווי ratsnest צהובים מסמנים pads שהסכמה שמה על net אחד ושום נחושת לא מחברת.',
      why: 'ה-netlist הוא החוזה בין הסכמה ללוח. כל קו ratsnest שנשאר בסוף הוא חיבור שקיים על הנייר ולא בנחושת.',
      prin: 'לוח מוכן כשה-ratsnest ריק וה-DRC נקי.',
      fix: 'הקש על pad, הקש על פינות, הקש על ה-pad המתאים.',
    })
  } else {
    out.push({
      s: 'ok',
      t: 'כל ה-nets מנותבים',
      what: 'לכל חיבור ב-netlist יש נחושת.',
      why: 'מספר ה-ratsnest הוא אפס, אז הסכמה והלייאאוט מתאימים.',
      prin: 'לייאאוט הוא תרגום נטול-אובדן של הסכמה.',
      fix: '—',
    })
  }

  const CL = 0.2
  let worst = Infinity
  let viol = 0
  const segs: { net: string; a: { x: number; y: number }; b: { x: number; y: number }; w: number }[] = []
  pcb.traces.forEach((t) => {
    for (let i = 0; i < t.pts.length - 1; i++) segs.push({ net: t.net, a: t.pts[i], b: t.pts[i + 1], w: t.width })
  })
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 1; j < segs.length; j++) {
      if (segs[i].net === segs[j].net) continue
      const d = segD(segs[i].a, segs[i].b, segs[j].a, segs[j].b) - (segs[i].w + segs[j].w) / 2
      worst = Math.min(worst, d)
      if (d < CL) viol++
    }
  }
  segs.forEach((s) =>
    pads.forEach((p) => {
      if (!p.net || p.net === s.net) return
      const hw = p.pd.w / 2
      const hh = p.pd.h / 2
      const mx = (s.a.x + s.b.x) / 2
      const my = (s.a.y + s.b.y) / 2
      const cx = Math.max(p.x - hw, Math.min(mx, p.x + hw))
      const cy = Math.max(p.y - hh, Math.min(my, p.y + hh))
      const d = segD(s.a, s.b, { x: cx, y: cy }, { x: cx, y: cy }) - s.w / 2
      worst = Math.min(worst, d)
      if (d < CL) viol++
    }),
  )
  if (segs.length) {
    if (viol > 0) {
      out.push({
        s: 'bad',
        t: `${viol} הפרת מרווח (clearance)`,
        what: `המרווח הצפוף ביותר בין nets שונים הוא ${worst < 0 ? 'חופף' : worst.toFixed(2) + ' mm'}, מתחת לחוק ה-0.20 mm.`,
        why: 'מתחת לכ-0.15 mm מפעל תקני משאיר שאריות נחושת ומשחת ההלחמה מגשרת על הפער בזמן ה-reflow.',
        prin: 'חוקי תכן מקודדים את מה שהמפעל יכול לבנות, לא את מה שהתוכנה יכולה לצייר.',
        fix: 'נתב מסביב, או גרור את ה-footprints הרחק אחד מהשני.',
      })
    } else {
      out.push({
        s: 'ok',
        t: 'המרווח עובר',
        what: `המרווח הצפוף ביותר בין nets שונים הוא ${isFinite(worst) ? worst.toFixed(2) + ' mm' : '—'}.`,
        why: 'יש מרווח לטולרנס ה-etch ולמשחת ההלחמה.',
        prin: 'השאר מרווח מגבול המפעל; אל תתכנן בדיוק עליו.',
        fix: '—',
      })
    }
  }

  if (K === 'width' && segs.length) {
    const I = pcb.cur
    const need = ipcWidth(I, 10)
    const vm = segs.filter((s) => s.net === 'VMOT' || s.net === 'GND')
    const mn = vm.length ? Math.min(...vm.map((s) => s.w)) : 0
    if (mn >= need) {
      out.push({
        s: 'ok',
        t: `${mn.toFixed(2)} mm נושא ${fmtI(I)}`,
        what: `IPC-2221 דורש ${need.toFixed(2)} mm בשביל ${fmtI(I)} בעליית טמפרטורה של 10 °C על נחושת חיצונית 1 oz. השתמשת ב-${mn.toFixed(2)} mm.`,
        why: `I = k·ΔT^0.44·A^0.725 עם k = 0.048 לשכבות חיצוניות. שכבה פנימית תצטרך בערך כפול, כי k יורד ל-0.024.`,
        prin: 'רוחב מסילת הספק הוא חישוב תרמי. רוחב מסילת אות הוא מינימום ייצור.',
        fix: '—',
      })
    } else {
      out.push({
        s: 'bad',
        t: `${mn.toFixed(2)} mm צר מדי בשביל ${fmtI(I)}`,
        what: `IPC-2221 דורש לפחות ${need.toFixed(2)} mm בעליית טמפרטורה של 10 °C; ניתבת ${mn.toFixed(2)} mm.`,
        why: `ב-${fmtI(I)} המסילה הזו תתחמם הרבה מעל 10 °C מעל הסביבה. התנגדות הנחושת עולה עם הטמפרטורה, מה שמעלה את האובדן עוד יותר — הכשל הדרגתי, לא פתאומי.`,
        prin: 'I = k·ΔT^0.44·A^0.725. מדוד נחושת הספק לפי חום, תמיד.',
        fix: 'בטל את המסילה, בחר הגדרת רוחב יותר גדולה, ונתב מחדש את VMOT ו-GND.',
      })
    }
  }

  if (K === 'decap' && !un) {
    const A = loopArea(pcb)
    if (A === null) {
      out.push({
        s: 'warn',
        t: 'נתב את שני צידי הלולאה',
        what: 'לולאת הזרם צריכה גם את מסילת ההזנה וגם את חזרת ה-GND.',
        why: 'שטח הלולאה הוא מה שקובע את ההשראות — מסילה אחת בלבד לא מלמדת אותך כלום.',
        prin: 'זרם זורם תמיד בלולאה.',
        fix: 'נתב +3V3 ו-GND מ-C1 ל-U1.',
      })
    } else {
      const dv = 5e-9 * (0.05 / 2e-9) * (A / 12)
      if (A <= 12) {
        out.push({
          s: 'ok',
          t: `שטח הלולאה הוא ${A.toFixed(1)} mm²`,
          what: `לולאת ההזנה-והחזרה מ-C1 דרך U1 סוגרת ${A.toFixed(1)} mm², מתחת למטרת ה-12 mm².`,
          why: `בערך 1 nH לכל מילימטר של היקף לולאה. קצה מיתוג של 50 mA ב-2 ns על פני הלולאה הזו מייצר בערך ${(dv * 1000).toFixed(0)} mV של שקיעת rail — קטן מספיק שהצ'יפ לעולם לא ישים לב.`,
          prin: 'אפקטיביות הפריקה נקבעת לפי שטח הלולאה, לא לפי ערך הקיבול.',
          fix: '—',
        })
      } else {
        out.push({
          s: 'bad',
          t: `שטח הלולאה ${A.toFixed(1)} mm² גדול מדי`,
          what: `המטרה היא מתחת ל-12 mm². הקבל רחוק מדי מפין ההזנה, או שמסלול החזרה ארוך.`,
          why: `V = L·dI/dt. בערך 1 nH למילימטר, הלולאה הזו נותנת לקצה מיתוג מהיר למשוך את ה-rail למטה בכ-${(dv * 1000).toFixed(0)} mV. הכפל בכמה פינים שמתגים בו-זמנית והצ'יפ נכנס ל-brownout.`,
          prin: 'קבל פריקה שנמצא 10 mm רחוק הוא דקורציה. המרחק הוא כל המפרט.',
          fix: 'גרור את C1 ישירות לצד פינים 4 ו-8 של U1, ואז נתב מחדש עם המסילות הקצרות ביותר האפשריות.',
        })
      }
    }
  }

  return out
}
