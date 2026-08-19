import type { AnyPart, ComponentType, LedPart } from '../engine/types'

/**
 * Schematic symbol bodies, in the same local coordinate frame as the pin
 * geometry in `data/symbols.ts` (±40 units around origin). The canvas is
 * always a dark navy blueprint, independent of the page theme — this was
 * matched to a reference design and the colours are intentionally fixed,
 * not theme tokens.
 */
const LEAD = { stroke: '#DCE8F5', strokeWidth: 2.8, fill: 'none', strokeLinecap: 'round' as const }
const BODY = { stroke: '#DCE8F5', strokeWidth: 2.8, fill: '#0B1524' }
const DOT = { fill: '#DCE8F5', stroke: 'none' }

export interface SchematicSymbolProps {
  type: ComponentType
  /** LED needs its colour, IO needs its live level label — everything else ignores this */
  part?: AnyPart
  closed?: boolean
  ioLevel?: string
}

export function SchematicSymbol({ type, part, closed, ioLevel }: SchematicSymbolProps) {
  switch (type) {
    case 'R':
      return (
        <>
          <path d="M-40 0H-26M26 0H40" {...LEAD} />
          <rect x={-26} y={-9} width={52} height={18} rx={2} {...BODY} />
        </>
      )
    case 'LED': {
      const ledPart = part as LedPart | undefined
      return (
        <>
          <path d="M-40 0H-12M12 0H40" {...LEAD} />
          <path d="M-12 -13L12 0L-12 13Z" stroke={BODY.stroke} strokeWidth={BODY.strokeWidth} fill={ledPart?.col ?? '#E8502F'} />
          <path d="M12 -13V13" {...BODY} fill="none" />
          <path d="M2 -17l9-7M6 -21l5-1 -1 5M8 -23l9-7M12 -27l5-1 -1 5" {...LEAD} strokeWidth={1.5} />
        </>
      )
    }
    case 'C':
      return (
        <>
          <path d="M-40 0H-7M7 0H40" {...LEAD} />
          <path d="M-7 -14V14M7 -14V14" {...BODY} fill="none" />
        </>
      )
    case 'SW':
      return (
        <>
          <path d="M-40 0H-18M18 0H40" {...LEAD} />
          <circle cx={-18} cy={0} r={3} {...DOT} />
          <circle cx={18} cy={0} r={3} {...DOT} />
          <path d={closed ? 'M-18 0H18' : 'M-18 0L16 -13'} {...LEAD} />
          <path d="M0 -20V-15" {...LEAD} />
        </>
      )
    case 'L':
      return (
        <>
          <path d="M-40 0H-30M30 0H40" {...LEAD} />
          <path
            d="M-30 0a7.5 7.5 0 0 1 15 0a7.5 7.5 0 0 1 15 0a7.5 7.5 0 0 1 15 0a7.5 7.5 0 0 1 15 0"
            {...LEAD}
          />
        </>
      )
    case 'D':
      return (
        <>
          <path d="M-40 0H-12M12 0H40" {...LEAD} />
          <path d="M-12 -13L12 0L-12 13Z" stroke={BODY.stroke} strokeWidth={BODY.strokeWidth} fill="#DCE8F5" />
          <path d="M12 -13V13" {...BODY} fill="none" />
        </>
      )
    case 'Q':
      return (
        <>
          <path d="M-40 0H-12" {...LEAD} />
          <path d="M-12 -20V20" {...BODY} fill="none" />
          <path d="M-2 -22V-8M-2 -7V7M-2 8V22" {...BODY} fill="none" />
          <path d="M-2 -15H20V-40M-2 0H20M-2 15H20V40" {...LEAD} />
          <path d="M6 -6l8 6l-8 6Z" {...BODY} />
        </>
      )
    case 'IO':
      return (
        <>
          <path d="M-40 0H-20" {...LEAD} />
          <rect x={-20} y={-20} width={52} height={40} rx={3} {...BODY} />
          <text
            x={6}
            y={5}
            fontFamily="var(--font-mono, ui-monospace)"
            fontSize={17}
            fontWeight={800}
            fill="#E8A33D"
            textAnchor="middle"
          >
            {ioLevel ?? 'IN'}
          </text>
        </>
      )
    case 'VCC':
      return (
        <>
          <path d="M0 0V-18M-13 -18H13" {...LEAD} />
          <text x={0} y={-25} fontFamily="var(--font-mono, ui-monospace)" fontSize={14} fontWeight={700} fill="#DCE8F5" textAnchor="middle">
            +5V
          </text>
        </>
      )
    case 'V33':
      return (
        <>
          <path d="M0 0V-18M-13 -18H13" {...LEAD} />
          <text x={0} y={-25} fontFamily="var(--font-mono, ui-monospace)" fontSize={14} fontWeight={700} fill="#DCE8F5" textAnchor="middle">
            +3V3
          </text>
        </>
      )
    case 'GND':
      return <path d="M0 0V14M-14 14H14M-9 20H9M-4 26H4" {...LEAD} />
    default:
      return null
  }
}
