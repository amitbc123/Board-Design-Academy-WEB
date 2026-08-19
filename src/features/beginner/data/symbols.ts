import type { ComponentType, SymbolDef } from '../engine/types'

/**
 * Symbol pin geometry, local to each component's own (unrotated) coordinate
 * frame — the same numbers the schematic renderer uses to draw the symbol
 * body, but that's a rendering concern (see `components/schematic-symbol.tsx`).
 * This module only carries the electrical facts: which pins exist, where
 * they are, and — for fixed power symbols — which net they force.
 */
export const LIB: Record<ComponentType, SymbolDef> = {
  R: { label: 'נגד', ref: 'R', db: 'R', pins: [{ n: '1', x: -40, y: 0 }, { n: '2', x: 40, y: 0 }] },
  LED: { label: 'LED', ref: 'D', db: 'LED', pins: [{ n: 'A', x: -40, y: 0 }, { n: 'K', x: 40, y: 0 }] },
  C: { label: 'Capacitor', ref: 'C', db: 'C', pins: [{ n: '1', x: -40, y: 0 }, { n: '2', x: 40, y: 0 }] },
  SW: { label: 'כפתור לחיצה', ref: 'SW', db: 'SW', pins: [{ n: '1', x: -40, y: 0 }, { n: '2', x: 40, y: 0 }] },
  L: { label: 'סליל / ריליי', ref: 'L', db: 'L', pins: [{ n: '1', x: -40, y: 0 }, { n: '2', x: 40, y: 0 }] },
  D: { label: 'דיודה', ref: 'D', db: 'D', pins: [{ n: 'A', x: -40, y: 0 }, { n: 'K', x: 40, y: 0 }] },
  Q: {
    label: 'N-MOSFET',
    ref: 'Q',
    db: 'Q',
    pins: [
      { n: 'G', x: -40, y: 0 },
      { n: 'D', x: 20, y: -40 },
      { n: 'S', x: 20, y: 40 },
    ],
  },
  IO: { label: 'MCU input', ref: 'U', db: 'IO', pins: [{ n: '1', x: -40, y: 0 }] },
  VCC: { label: '+5 V', ref: 'P', db: null, fixed: true, net: '+5V', v: 5, pins: [{ n: '1', x: 0, y: 0 }] },
  V33: { label: '+3.3 V', ref: 'P', db: null, fixed: true, net: '+3V3', v: 3.3, pins: [{ n: '1', x: 0, y: 0 }] },
  GND: { label: 'Ground', ref: 'P', db: null, fixed: true, net: 'GND', pins: [{ n: '1', x: 0, y: 0 }] },
}
