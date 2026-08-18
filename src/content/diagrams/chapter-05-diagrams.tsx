import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function CrosstalkNextFextDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>NEXT בקצה הקרוב ו-FEXT בקצה הרחוק על קו הקורבן</title>
      <desc>
        קו התוקף (aggressor) מזריק רעש לקו הקורבן (victim) הצמוד לו. חלק מהרעש חוזר לכיוון המקור
        של הקורבן (NEXT — Near-End Crosstalk) וחלק ממשיך לכיוון הקצה הרחוק (FEXT — Far-End
        Crosstalk).
      </desc>

      <text x="20" y="20" className="fill-foreground text-[11px] font-medium">
        קו תוקף (Aggressor)
      </text>
      <line x1="20" y1="40" x2="440" y2="40" className="stroke-primary" strokeWidth="3" />

      <text x="20" y="80" className="fill-foreground text-[11px] font-medium">
        קו קורבן (Victim)
      </text>
      <line x1="20" y1="100" x2="440" y2="100" className="stroke-foreground/50" strokeWidth="3" />

      <rect x="80" y="34" width="200" height="72" className="fill-chart-3/10 stroke-chart-3/40" strokeDasharray="3 3" />
      <text x="120" y="128" className="fill-chart-3 text-[10px]">
        אזור צימוד (מסלולים צמודים)
      </text>

      <g transform="translate(0,150)">
        <text x="20" y="0" className="fill-chart-2 text-[11px] font-medium">
          NEXT — נראה בקצה הקרוב למקור התוקף
        </text>
        <line x1="20" y1="15" x2="150" y2="15" className="stroke-foreground/30" strokeWidth="1" />
        <path d="M20 15 h20 q10 -18 20 0 h90" className="fill-none stroke-chart-2" strokeWidth="2.5" />

        <text x="280" y="0" className="fill-chart-1 text-[11px] font-medium">
          FEXT — נראה בקצה הרחוק
        </text>
        <line x1="280" y1="15" x2="440" y2="15" className="stroke-foreground/30" strokeWidth="1" />
        <path d="M280 15 h90 q8 14 16 0 h34" className="fill-none stroke-chart-1" strokeWidth="2.5" />
      </g>
    </svg>
  )
}

export function CouplingMechanismDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 240" className={cn('h-auto w-full', className)} role="img">
      <title>צימוד קיבולי מול השראתי, וקו מגן בין שני מסלולים</title>
      <desc>
        צימוד קיבולי נובע משדה חשמלי בין המסלולים; צימוד השראתי נובע משדה מגנטי משותף. קו מגן
        מוארק בין שני המסלולים, עם ויאס תפירה תדופים, קוטע חלק ניכר משני מנגנוני הצימוד.
      </desc>

      <g>
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          צימוד קיבולי (שדה חשמלי)
        </text>
        <line x1="10" y1="50" x2="200" y2="50" className="stroke-primary" strokeWidth="3" />
        <line x1="10" y1="80" x2="200" y2="80" className="stroke-foreground/50" strokeWidth="3" />
        {[50, 90, 130, 170].map((x) => (
          <path key={x} d={`M${x} 53 Q${x + 10} 65 ${x} 77`} className="fill-none stroke-chart-3" strokeWidth="1.5" markerEnd="url(#c5-arrow)" />
        ))}
      </g>

      <g transform="translate(230,0)">
        <text x="0" y="18" className="fill-foreground text-[11px] font-medium">
          צימוד השראתי (שדה מגנטי)
        </text>
        <line x1="0" y1="50" x2="190" y2="50" className="stroke-primary" strokeWidth="3" />
        <line x1="0" y1="80" x2="190" y2="80" className="stroke-foreground/50" strokeWidth="3" />
        {[40, 90, 140].map((x) => (
          <circle key={x} cx={x} cy="65" r="9" className="fill-none stroke-chart-2" strokeWidth="1.5" strokeDasharray="3 2" />
        ))}
      </g>

      <g transform="translate(0,120)">
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          עם קו מגן מוארק ו-vias תפירה
        </text>
        <line x1="10" y1="60" x2="420" y2="60" className="stroke-primary" strokeWidth="3" />
        <line x1="10" y1="80" x2="420" y2="80" className="fill-none stroke-chart-3" strokeWidth="3" />
        <line x1="10" y1="100" x2="420" y2="100" className="stroke-foreground/50" strokeWidth="3" />
        {[60, 140, 220, 300, 380].map((x) => (
          <circle key={x} cx={x} cy="80" r="4" className="fill-chart-3" />
        ))}
        <text x="330" y="75" className="fill-chart-3 text-[10px]">
          קו מגן (GND)
        </text>
      </g>

      <defs>
        <marker id="c5-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <path d="M0,0 L5,3 L0,6 Z" className="fill-chart-3" />
        </marker>
      </defs>
    </svg>
  )
}

export function StackupFundamentalsDiagram({ className }: DiagramProps) {
  const layers = [
    { label: 'שכבת אות עליונה', kind: 'signal' },
    { label: 'GND', kind: 'plane' },
    { label: 'שכבת אות פנימית', kind: 'signal' },
    { label: 'הספק (VCC)', kind: 'plane' },
    { label: 'שכבת אות פנימית', kind: 'signal' },
    { label: 'GND', kind: 'plane' },
    { label: 'שכבת אות תחתונה', kind: 'signal' },
  ]
  return (
    <svg viewBox="0 0 380 260" className={cn('h-auto w-full', className)} role="img">
      <title>דוגמת מבנה שכבות (7 שכבות) עם מישורים סמוכים לכל שכבת אות</title>
      <desc>
        כלל אצבע ל-EMI ולשלמות אות: כל שכבת אות תהיה סמוכה למישור התייחסות, ומישורי הספק ואדמה
        סמוכים זה לזה כדי לספק קיבול בין-שכבתי גבוה.
      </desc>
      {layers.map((layer, i) => (
        <g key={i} transform={`translate(0, ${i * 34})`}>
          <rect
            x="90"
            y="0"
            width="220"
            height="26"
            className={layer.kind === 'plane' ? 'fill-muted-foreground/60' : 'fill-primary/25 stroke-primary/60'}
            strokeWidth={layer.kind === 'plane' ? 0 : 1}
          />
          <text x="20" y="18" className="fill-foreground text-[10px]">
            {i + 1}. {layer.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function TraceWidthSpacingDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 400 200" className={cn('h-auto w-full', className)} role="img">
      <title>רוחב מסלול W, מרווח S וגובה H — הפרמטרים הקובעים את העכבה</title>
      <desc>
        רוחב מסלול רחב יותר מוריד את העכבה המאפיינת; גובה רב יותר מעל המישור מעלה אותה; מרווח קטן
        בין מסלולים סמוכים מגביר צימוד.
      </desc>
      <rect x="40" y="140" width="320" height="16" className="fill-muted-foreground/60" />
      <rect x="140" y="100" width="50" height="16" className="fill-primary" />
      <rect x="210" y="100" width="50" height="16" className="fill-primary" />

      <line x1="140" y1="90" x2="190" y2="90" className="stroke-foreground/60" strokeWidth="1.5" />
      <text x="150" y="84" className="fill-foreground text-[10px]">
        W
      </text>

      <line x1="190" y1="108" x2="210" y2="108" className="stroke-chart-3" strokeWidth="1.5" />
      <text x="188" y="128" className="fill-chart-3 text-[10px]">
        S
      </text>

      <line x1="120" y1="108" x2="120" y2="140" className="stroke-foreground/60" strokeWidth="1.5" strokeDasharray="2 2" />
      <text x="90" y="128" className="fill-foreground text-[10px]">
        H
      </text>

      <text x="40" y="176" className="fill-muted-foreground text-[10px]">
        מישור התייחסות
      </text>
    </svg>
  )
}
