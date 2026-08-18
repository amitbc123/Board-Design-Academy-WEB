import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function PdnTargetImpedanceDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 240" className={cn('h-auto w-full', className)} role="img">
      <title>עכבת יעד ותרומת רכיבים שונים לאורך טווח התדרים</title>
      <desc>
        עכבת היעד היא קו אופקי; קבלי bulk תורמים בתדר נמוך, קבלי קרמיקה בתדר בינוני, וקיבול
        המישורים עצמו בתדר גבוה. עכבת ה-PDN בפועל חייבת להישאר מתחת ליעד לאורך כל הטווח.
      </desc>
      <line x1="40" y1="200" x2="430" y2="200" className="stroke-foreground/40" strokeWidth="1" />
      <line x1="40" y1="200" x2="40" y2="20" className="stroke-foreground/40" strokeWidth="1" />
      <text x="380" y="216" className="fill-muted-foreground text-[10px]">
        תדר ←
      </text>
      <text x="10" y="30" className="fill-muted-foreground text-[10px]">
        |Z|
      </text>

      <line x1="40" y1="120" x2="430" y2="120" className="stroke-destructive" strokeWidth="2" strokeDasharray="6 3" />
      <text x="340" y="112" className="fill-destructive text-[10px] font-medium">
        Z target
      </text>

      <path
        d="M50 60 C 90 90 130 150 170 155 C 210 150 250 100 290 90 C 330 80 370 100 420 70"
        className="fill-none stroke-primary"
        strokeWidth="3"
      />

      <text x="55" y="175" className="fill-chart-3 text-[10px]">
        bulk caps
      </text>
      <text x="180" y="175" className="fill-chart-2 text-[10px]">
        קבלי קרמיקה
      </text>
      <text x="330" y="60" className="fill-chart-1 text-[10px]">
        קיבול מישורים
      </text>
    </svg>
  )
}

export function GroundBounceDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>קפיצת אדמה (Ground Bounce) ממתגים בו-זמניים</title>
      <desc>
        כמה מוציאים מתגים בו-זמנית ל-GND דרך אותה השראות משותפת של ההדק/האריזה, מרימים את פוטנציאל
        ה-GND הפנימי לרגע — מה שנראה מבחוץ כרעש על פין "שקט" שכלל לא התכוון לעבור מצב.
      </desc>
      <rect x="60" y="30" width="220" height="120" rx="6" className="fill-none stroke-foreground/50" strokeWidth="2" />
      <text x="90" y="20" className="fill-foreground text-[11px] font-medium">
        רכיב עם כמה מוציאים
      </text>

      {[50, 80, 110].map((y) => (
        <g key={y}>
          <line x1="280" y1={y} x2="330" y2={y} className="stroke-primary" strokeWidth="2.5" />
          <text x="335" y={y + 4} className="fill-primary text-[9px]">
            מתג פעיל
          </text>
        </g>
      ))}
      <line x1="280" y1="135" x2="330" y2="135" className="stroke-chart-3" strokeWidth="2.5" />
      <text x="335" y="139" className="fill-chart-3 text-[9px]">
        פין "שקט"
      </text>

      <line x1="150" y1="150" x2="150" y2="190" className="stroke-foreground/60" strokeWidth="3" />
      <text x="160" y="180" className="fill-muted-foreground text-[9px]">
        L משותפת (הדק/אריזה)
      </text>
      <line x1="60" y1="190" x2="280" y2="190" className="fill-muted" />
      <rect x="60" y="190" width="220" height="10" className="fill-muted-foreground/60" />

      <g transform="translate(20,190)">
        <line x1="0" y1="0" x2="80" y2="0" className="stroke-foreground/30" strokeWidth="1" />
        <path d="M0 0 h20 v-18 h10 v18 h50" className="fill-none stroke-chart-3" strokeWidth="2" />
        <text x="0" y="15" className="fill-chart-3 text-[9px]">
          בליטת מתח על ה-GND הפנימי
        </text>
      </g>
    </svg>
  )
}

export function PlaneResonanceDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>תהודת מישורים: פסגות עכבה בתדרים שתלויים במידות המישור</title>
      <desc>
        זוג מישורי VCC/GND מתנהג כמו מהוד (cavity resonator) עם ממדים a ו-b. בתדרי תהודה מסוימים
        עכבת ה-PDN קופצת בחדות — פסגות שיכולות לפגוע ביעד העכבה אם לא מרוסנות.
      </desc>
      <line x1="40" y1="180" x2="430" y2="180" className="stroke-foreground/40" strokeWidth="1" />
      <line x1="40" y1="180" x2="40" y2="20" className="stroke-foreground/40" strokeWidth="1" />
      <text x="380" y="196" className="fill-muted-foreground text-[10px]">
        תדר ←
      </text>

      <path
        d="M40 160 L100 160 L110 40 L120 160 L220 160 L232 60 L244 160 L340 160 L350 90 L360 160 L430 160"
        className="fill-none stroke-primary"
        strokeWidth="2.5"
      />
      <text x="70" y="30" className="fill-muted-foreground text-[10px]">
        מצב תהודה ראשון
      </text>

      <g transform="translate(280,10)">
        <rect x="0" y="0" width="150" height="60" className="fill-none stroke-foreground/30" strokeDasharray="3 3" />
        <text x="8" y="16" className="fill-foreground text-[10px]">
          מישור a × b
        </text>
        <text x="8" y="34" className="fill-muted-foreground text-[9px]">
          תדרי תהודה תלויים
        </text>
        <text x="8" y="48" className="fill-muted-foreground text-[9px]">
          במידות a, b ובקבוע הדיאלקטרי
        </text>
      </g>
    </svg>
  )
}
