/**
 * Part database — real MPNs.
 *
 * Transcribed verbatim from the original Rev A single-file app's `PARTS`
 * object. Do not round or "fix" any numeric value — they are taken from
 * real datasheets.
 */
import type { PartsDb } from '../engine/types'

export const PARTS: PartsDb = {
  R: [
    {
      mpn: 'RC0805FR-07220RL', mfr: 'Yageo', pkg: '0805 thick film', R: 220,
      spec: [['Resistance', '220 Ω'], ['Tolerance', '±1 %'], ['TCR', '±100 ppm/°C']],
      amr: [['Power rating', '0.125 W'], ['Max working V', '150 V']],
    },
    {
      mpn: 'CRCW080510R0FKEA', mfr: 'Vishay', pkg: '0805 thick film', R: 10,
      spec: [['Resistance', '10 Ω'], ['Tolerance', '±1 %'], ['TCR', '±100 ppm/°C']],
      amr: [['Power rating', '0.125 W'], ['Max working V', '150 V']],
    },
    {
      mpn: 'RC0805FR-07100RL', mfr: 'Yageo', pkg: '0805 thick film', R: 100,
      spec: [['Resistance', '100 Ω'], ['Tolerance', '±1 %'], ['TCR', '±100 ppm/°C']],
      amr: [['Power rating', '0.125 W'], ['Max working V', '150 V']],
    },
    {
      mpn: 'RC0805FR-071KL', mfr: 'Yageo', pkg: '0805 thick film', R: 1000,
      spec: [['Resistance', '1 kΩ'], ['Tolerance', '±1 %'], ['TCR', '±100 ppm/°C']],
      amr: [['Power rating', '0.125 W'], ['Max working V', '150 V']],
    },
    {
      mpn: 'RC0805FR-071K5L', mfr: 'Yageo', pkg: '0805 thick film', R: 1500,
      spec: [['Resistance', '1.5 kΩ'], ['Tolerance', '±1 %'], ['TCR', '±100 ppm/°C']],
      amr: [['Power rating', '0.125 W'], ['Max working V', '150 V']],
    },
    {
      mpn: 'RC0805FR-073KL', mfr: 'Yageo', pkg: '0805 thick film', R: 3000,
      spec: [['Resistance', '3 kΩ'], ['Tolerance', '±1 %'], ['TCR', '±100 ppm/°C']],
      amr: [['Power rating', '0.125 W'], ['Max working V', '150 V']],
    },
    {
      mpn: 'RC0805FR-074K7L', mfr: 'Yageo', pkg: '0805 thick film', R: 4700,
      spec: [['Resistance', '4.7 kΩ'], ['Tolerance', '±1 %'], ['TCR', '±100 ppm/°C']],
      amr: [['Power rating', '0.125 W'], ['Max working V', '150 V']],
    },
    {
      mpn: 'CRCW080510K0FKEA', mfr: 'Vishay', pkg: '0805 thick film', R: 10000,
      spec: [['Resistance', '10 kΩ'], ['Tolerance', '±1 %'], ['TCR', '±100 ppm/°C']],
      amr: [['Power rating', '0.125 W'], ['Max working V', '150 V']],
    },
    {
      mpn: 'RC0805FR-07100KL', mfr: 'Yageo', pkg: '0805 thick film', R: 100000,
      spec: [['Resistance', '100 kΩ'], ['Tolerance', '±1 %'], ['TCR', '±100 ppm/°C']],
      amr: [['Power rating', '0.125 W'], ['Max working V', '150 V']],
    },
  ],
  LED: [
    {
      mpn: 'LTST-C170KRKT', mfr: 'Lite-On', pkg: '0805 chip LED', Vf: 2.0, col: '#E8502F', tag: 'red',
      spec: [['Colour', 'Red · 631 nm'], ['V<sub>F</sub> @ 20 mA', '2.0 V'], ['Intensity', '~40 mcd']],
      amr: [['I<sub>F</sub> continuous', '20 mA'], ['I<sub>F</sub> peak', '100 mA'], ['Reverse V', '5 V']],
    },
    {
      mpn: 'LTST-C170KGKT', mfr: 'Lite-On', pkg: '0805 chip LED', Vf: 2.2, col: '#3FBF62', tag: 'green',
      spec: [['Colour', 'Green · 574 nm'], ['V<sub>F</sub> @ 20 mA', '2.2 V'], ['Intensity', '~45 mcd']],
      amr: [['I<sub>F</sub> continuous', '20 mA'], ['I<sub>F</sub> peak', '100 mA'], ['Reverse V', '5 V']],
    },
    {
      mpn: 'LTST-C170TBKT', mfr: 'Lite-On', pkg: '0805 chip LED', Vf: 3.2, col: '#3F7BE0', tag: 'blue',
      spec: [['Colour', 'Blue · 468 nm'], ['V<sub>F</sub> @ 20 mA', '3.2 V'], ['Intensity', '~80 mcd']],
      amr: [['I<sub>F</sub> continuous', '20 mA'], ['I<sub>F</sub> peak', '100 mA'], ['Reverse V', '5 V']],
    },
  ],
  C: [
    {
      mpn: 'GRM21BR71H104KA01L', mfr: 'Murata', pkg: '0805 X7R MLCC', C: 1e-7,
      spec: [['Capacitance', '100 nF'], ['Dielectric', 'X7R'], ['Tolerance', '±10 %']],
      amr: [['Rated voltage', '50 V'], ['Temp. range', '−55 … +125 °C']],
    },
    {
      mpn: 'GRM21BR61E106KA73L', mfr: 'Murata', pkg: '0805 X5R MLCC', C: 1e-5,
      spec: [['Capacitance', '10 µF'], ['Dielectric', 'X5R'], ['Tolerance', '±10 %']],
      amr: [['Rated voltage', '25 V'], ['Temp. range', '−55 … +85 °C']],
    },
  ],
  L: [
    {
      mpn: 'Relay coil (modelled)', mfr: 'מודל — לא רכיב ספציפי', pkg: 'סליל ריליי / מנוע', L: 0.1, Rs: 50,
      spec: [['השראות', '100 mH'], ['התנגדות הסליל', '50 Ω'], ['קבוע זמן L/R', '2 ms']],
      amr: [['זרם רציף', '200 mA'], ['הערה', 'פרמטרים מודלים לצורך הדגמה — לא מ-datasheet']],
    },
  ],
  D: [
    {
      mpn: '1N4148', mfr: 'onsemi', pkg: 'SOD-123 · דיודת אות', Vfd: 0.72,
      spec: [['V<sub>F</sub> @ 10 mA', '0.72 V'], ['זמן התאוששות', '4 ns'], ['קיבול', '2 pF']],
      amr: [['V<sub>R</sub>', '100 V'], ['I<sub>F</sub> רציף', '300 mA'], ['I<sub>FSM</sub> פולס', '2 A']],
    },
  ],
  SW: [
    {
      mpn: 'B3U-1000P', mfr: 'Omron', pkg: 'SMD tactile switch',
      spec: [['Type', 'SPST-NO momentary'], ['Actuation force', '1.6 N'], ['Travel', '0.15 mm']],
      amr: [['Switching current', '50 mA'], ['Switching voltage', '32 VDC'], ['Life', '300 000 cycles']],
    },
  ],
  Q: [
    {
      mpn: '2N7002', mfr: 'onsemi', pkg: 'SOT-23 N-MOSFET', Vth: 2.1, Ron: 2.0, Vbr: 60,
      spec: [['Type', 'N-channel enhancement'], ['V<sub>GS(th)</sub>', '1.0 – 2.5 V'], ['R<sub>DS(on)</sub> @ 10 V', '2.0 Ω']],
      amr: [['V<sub>DS</sub>', '60 V'], ['I<sub>D</sub> continuous', '115 mA'], ['V<sub>GS</sub>', '±20 V'], ['P<sub>D</sub>', '200 mW']],
    },
  ],
  IO: [
    {
      mpn: 'STM32G071 · GPIO', mfr: 'STMicroelectronics', pkg: 'LQFP-48 pin',
      spec: [
        ['Input type', 'Schmitt trigger, high-Z'],
        ['V<sub>IH</sub> min', '0.7 × V<sub>DD</sub> = 2.31 V'],
        ['V<sub>IL</sub> max', '0.3 × V<sub>DD</sub> = 0.99 V'],
        ['Leakage', '±1 µA'],
      ],
      amr: [['V<sub>DD</sub>', '3.6 V'], ['Injected current', '±5 mA']],
    },
  ],
}
