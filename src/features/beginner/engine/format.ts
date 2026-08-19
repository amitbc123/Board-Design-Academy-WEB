/** Engineering-notation formatters shared across the schematic, PCB and check panels. */

export const fmtI = (i: number): string => {
  const a = Math.abs(i)
  if (a >= 1) return i.toFixed(2) + ' A'
  if (a >= 1e-3) return (i * 1e3).toFixed(1) + ' mA'
  if (a >= 1e-6) return (i * 1e6).toFixed(1) + ' µA'
  return '0 A'
}

export const fmtV = (v: number): string => (v || 0).toFixed(2) + ' V'

export const fmtP = (p: number): string => {
  const a = Math.abs(p)
  if (a >= 1) return p.toFixed(2) + ' W'
  if (a >= 1e-3) return (p * 1e3).toFixed(0) + ' mW'
  return (p * 1e6).toFixed(0) + ' µW'
}

export const fmtR = (r: number): string => {
  if (r >= 1e6) return r / 1e6 + ' MΩ'
  if (r >= 1000) return r / 1000 + ' kΩ'
  return r + ' Ω'
}
