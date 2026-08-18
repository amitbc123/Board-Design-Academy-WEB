import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function ParasiticsOverlayDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 440 240" className={cn('h-auto w-full', className)} role="img">
      <title>אלמנטים פרזיטיים על גבי מסלול פשוט על לוח</title>
      <desc>
        מסלול נחושת בין שני רכיבים אינו תיל אידיאלי: יש לו התנגדות טורית R והשראות טורית L לאורכו,
        וקיבול C בינו לבין מישור ההתייחסות שמתחתיו.
      </desc>

      {/* reference plane */}
      <rect x="20" y="190" width="400" height="28" className="fill-muted" />
      <text x="30" y="208" className="fill-muted-foreground text-[11px]">
        מישור התייחסות (GND)
      </text>

      {/* pads */}
      <rect x="40" y="90" width="26" height="18" rx="2" className="fill-foreground/80" />
      <rect x="374" y="90" width="26" height="18" rx="2" className="fill-foreground/80" />
      <text x="35" y="80" className="fill-foreground text-[11px]">
        רכיב A
      </text>
      <text x="365" y="80" className="fill-foreground text-[11px]">
        רכיב B
      </text>

      {/* trace */}
      <line x1="66" y1="99" x2="374" y2="99" className="stroke-primary" strokeWidth="6" strokeLinecap="round" />

      {/* R and L brackets above the trace */}
      <path
        d="M100 70 H210"
        className="stroke-foreground/60"
        strokeWidth="1.5"
        markerStart="url(#c1-tick)"
        markerEnd="url(#c1-tick)"
      />
      <text x="120" y="62" className="fill-foreground text-[12px] font-medium">
        R — התנגדות טורית
      </text>
      <path
        d="M230 70 H340"
        className="stroke-foreground/60"
        strokeWidth="1.5"
        markerStart="url(#c1-tick)"
        markerEnd="url(#c1-tick)"
      />
      <text x="248" y="62" className="fill-foreground text-[12px] font-medium">
        L — השראות טורית
      </text>

      {/* capacitive coupling to plane, three sample points */}
      {[130, 220, 310].map((x) => (
        <g key={x}>
          <line x1={x} y1="102" x2={x} y2="188" className="stroke-chart-3" strokeWidth="1.5" strokeDasharray="4 4" />
        </g>
      ))}
      <text x="330" y="150" className="fill-chart-3 text-[12px] font-medium">
        C — קיבול למישור
      </text>

      <defs>
        <marker id="c1-tick" markerWidth="8" markerHeight="8" refX="4" refY="4">
          <line x1="4" y1="0" x2="4" y2="8" className="stroke-foreground/60" strokeWidth="1.5" />
        </marker>
      </defs>
    </svg>
  )
}
