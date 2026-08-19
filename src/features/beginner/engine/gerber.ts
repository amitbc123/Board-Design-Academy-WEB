import type { BoardDef, PcbState } from './types'
import { allPads } from './pcb'

/**
 * RS-274X writer — the exact plain-text format every PCB fab on earth reads.
 * Apertures are declared once (`%ADD..*%`), then every pad is a D03 flash
 * and every trace segment is a D02 move + D01 draw at that aperture.
 */
export function gerber(pcb: PcbState, board: BoardDef): string {
  const c = (v: number) => Math.round(v * 1e6).toString()
  type ApShape = { t: 'C' | 'R'; a: number[] }
  const ap = new Map<string, { d: number; o: ApShape }>()
  let dn = 10
  const key = (o: ApShape) => o.t + '|' + o.a.join(',')
  const add = (o: ApShape): number => {
    const k = key(o)
    if (!ap.has(k)) ap.set(k, { d: dn++, o })
    return ap.get(k)!.d
  }

  type Draw = { d: number } & ({ type: 'flash'; x: number; y: number } | { type: 'line'; pts: { x: number; y: number }[] })
  const pads = allPads(pcb)
  const draws: Draw[] = []
  pads.forEach((p) => {
    const d = add(p.pd.r ? { t: 'C', a: [p.pd.w] } : { t: 'R', a: [p.pd.w, p.pd.h] })
    draws.push({ d, type: 'flash', x: p.x, y: board.h - p.y })
  })
  pcb.traces.forEach((t) => {
    const d = add({ t: 'C', a: [t.width] })
    draws.push({ d, type: 'line', pts: t.pts.map((p) => ({ x: p.x, y: board.h - p.y })) })
  })

  let g = 'G04 Rev A generated - ' + board.layer + '*\n%MOMM*%\n%FSLAX36Y36*%\n%LPD*%\n'
  ;[...ap.values()]
    .sort((a, b) => a.d - b.d)
    .forEach(({ d, o }) => {
      g += `%ADD${d}${o.t},${o.a.map((v) => v.toFixed(3)).join('X')}*%\n`
    })
  g += 'G01*\n'
  let cd: number | null = null
  draws.forEach((dr) => {
    if (dr.d !== cd) {
      g += `D${dr.d}*\n`
      cd = dr.d
    }
    if (dr.type === 'flash') g += `X${c(dr.x)}Y${c(dr.y)}D03*\n`
    else dr.pts.forEach((p, i) => (g += `X${c(p.x)}Y${c(p.y)}D0${i ? 1 : 2}*\n`))
  })
  g += 'M02*\n'
  return g
}
