import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function MicrostripStriplineDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 440 220" className={cn('h-auto w-full', className)} role="img">
      <title>חתך רוחב: מיקרוסטריפ מול סטריפליין</title>
      <desc>
        מיקרוסטריפ הוא מסלול על שכבה חיצונית מעל מישור התייחסות יחיד, חשוף לאוויר מלמעלה.
        סטריפליין הוא מסלול קבור בין שני מישורי התייחסות, כולו בתוך הדיאלקטריק.
      </desc>
      <g>
        <text x="20" y="20" className="fill-foreground text-[12px] font-semibold">
          מיקרוסטריפ (שכבה חיצונית)
        </text>
        <rect x="20" y="90" width="180" height="50" className="fill-chart-2/25 stroke-chart-2/60" strokeWidth="1" />
        <rect x="80" y="75" width="26" height="15" className="fill-primary" />
        <rect x="20" y="140" width="180" height="14" className="fill-muted-foreground/70" />
        <text x="25" y="170" className="fill-muted-foreground text-[10px]">
          מישור התייחסות יחיד
        </text>
        <text x="60" y="65" className="fill-muted-foreground text-[10px]">
          אוויר / מסכת הלחמה
        </text>
        <line x1="106" y1="90" x2="106" y2="140" className="stroke-foreground/50" strokeWidth="1" strokeDasharray="2 2" />
        <text x="112" y="118" className="fill-foreground text-[10px]">
          h
        </text>
      </g>
      <g transform="translate(220,0)">
        <text x="0" y="20" className="fill-foreground text-[12px] font-semibold">
          סטריפליין (שכבה פנימית)
        </text>
        <rect x="0" y="50" width="180" height="120" className="fill-chart-2/25 stroke-chart-2/60" strokeWidth="1" />
        <rect x="0" y="50" width="180" height="14" className="fill-muted-foreground/70" />
        <rect x="0" y="156" width="180" height="14" className="fill-muted-foreground/70" />
        <rect x="60" y="103" width="26" height="15" className="fill-primary" />
        <text x="20" y="45" className="fill-muted-foreground text-[10px]">
          מישור התייחסות עליון
        </text>
        <text x="15" y="182" className="fill-muted-foreground text-[10px]">
          מישור התייחסות תחתון
        </text>
      </g>
    </svg>
  )
}

export function LossyLineDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 440 220" className={cn('h-auto w-full', className)} role="img">
      <title>אפקט העור ואובדן דיאלקטרי מול תדר</title>
      <desc>
        בתדר גבוה הזרם מתרכז בשכבה דקה ליד פני שטח המוליך (אפקט העור), מה שמעלה את ההתנגדות
        האפקטיבית. יחד עם אובדן בדיאלקטריק, ההיחלשות של האות גדלה ככל שעולים בתדר.
      </desc>
      <g>
        <text x="20" y="18" className="fill-foreground text-[11px] font-medium">
          חתך מוליך ב-DC
        </text>
        <circle cx="60" cy="70" r="34" className="fill-primary/30 stroke-primary" strokeWidth="2" />
        <text x="20" y="120" className="fill-muted-foreground text-[10px]">
          זרם אחיד על פני כל החתך
        </text>

        <text x="190" y="18" className="fill-foreground text-[11px] font-medium">
          חתך מוליך בתדר גבוה
        </text>
        <circle cx="230" cy="70" r="34" className="fill-none stroke-foreground/20" strokeWidth="2" />
        <circle cx="230" cy="70" r="34" className="fill-none stroke-primary" strokeWidth="6" />
        <text x="190" y="120" className="fill-muted-foreground text-[10px]">
          זרם מתרכז בשכבה דקה בהיקף
        </text>
      </g>
      <g transform="translate(0,140)">
        <line x1="20" y1="60" x2="410" y2="60" className="stroke-foreground/40" strokeWidth="1" />
        <path d="M20 55 C 150 50 300 20 410 5" className="fill-none stroke-primary" strokeWidth="2.5" />
        <text x="300" y="20" className="fill-primary text-[10px]">
          היחלשות (dB) גדלה עם התדר
        </text>
        <text x="360" y="76" className="fill-muted-foreground text-[10px]">
          תדר ←
        </text>
      </g>
    </svg>
  )
}

export function ReflectionWaveformDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 440 220" className={cn('h-auto w-full', className)} role="img">
      <title>גל אירוע וגל מוחזר באי-רציפות עכבה</title>
      <desc>
        כאשר עכבת העומס שונה מהעכבה המאפיינת של הקו, חלק מהאות מוחזר לאחור. מקדם ההחזרה נתון על
        ידי Γ = (ZL − Z0) / (ZL + Z0).
      </desc>
      <line x1="30" y1="180" x2="410" y2="180" className="stroke-foreground/40" strokeWidth="1" />
      <line x1="220" y1="30" x2="220" y2="180" className="stroke-foreground/30" strokeWidth="1" strokeDasharray="3 3" />
      <text x="225" y="25" className="fill-muted-foreground text-[10px]">
        אי-רציפות עכבה (ZL ≠ Z0)
      </text>

      <path d="M30 150 L100 150 L140 90 L220 90" className="fill-none stroke-primary" strokeWidth="3" />
      <text x="35" y="140" className="fill-primary text-[11px]">
        גל אירוע (incident)
      </text>

      <path d="M220 90 L260 90 L300 105 L410 105" className="fill-none stroke-chart-3" strokeWidth="2.5" strokeDasharray="5 3" />
      <text x="300" y="130" className="fill-chart-3 text-[11px]">
        גל מוחזר (reflected)
      </text>

      <text x="30" y="205" className="fill-foreground text-[12px] font-medium">
        Γ = (ZL − Z0) / (ZL + Z0)
      </text>
    </svg>
  )
}

export function TerminationSchematicsDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 240" className={cn('h-auto w-full', className)} role="img">
      <title>ארבע אסטרטגיות סיכום נפוצות</title>
      <desc>סיכום טורי, סיכום מקבילי לאדמה, סיכום Thevenin בין VCC ל-GND, וסיכום ODT בתוך המקלט.</desc>

      {[
        { x: 0, label: 'טורי (Series)' },
        { x: 230, label: 'מקבילי ל-GND (Parallel)' },
      ].map((col) => (
        <g key={col.label} transform={`translate(${col.x},0)`}>
          <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
            {col.label}
          </text>
        </g>
      ))}

      <g transform="translate(10,30)">
        <rect x="0" y="30" width="36" height="20" className="fill-none stroke-primary" strokeWidth="2" />
        <line x1="-10" y1="40" x2="0" y2="40" className="stroke-foreground/60" strokeWidth="2" />
        <line x1="36" y1="40" x2="120" y2="40" className="stroke-foreground/60" strokeWidth="2" />
        <rect x="120" y="25" width="24" height="30" className="fill-none stroke-foreground/60" strokeWidth="2" />
        <text x="0" y="80" className="fill-muted-foreground text-[10px]">
          R טורי קרוב למקור
        </text>
      </g>

      <g transform="translate(240,30)">
        <line x1="-10" y1="40" x2="90" y2="40" className="stroke-foreground/60" strokeWidth="2" />
        <rect x="90" y="25" width="24" height="30" className="fill-none stroke-foreground/60" strokeWidth="2" />
        <line x1="60" y1="40" x2="60" y2="70" className="stroke-primary" strokeWidth="2" />
        <rect x="50" y="70" width="20" height="14" className="fill-none stroke-primary" strokeWidth="2" />
        <line x1="60" y1="84" x2="60" y2="95" className="stroke-foreground/60" strokeWidth="2" />
        <text x="0" y="115" className="fill-muted-foreground text-[10px]">
          R ל-GND ליד המקלט
        </text>
      </g>

      <g transform="translate(10,140)">
        <text x="0" y="0" className="fill-foreground text-[11px] font-medium">
          Thevenin (VCC ו-GND)
        </text>
        <line x1="-10" y1="45" x2="90" y2="45" className="stroke-foreground/60" strokeWidth="2" />
        <rect x="90" y="30" width="24" height="30" className="fill-none stroke-foreground/60" strokeWidth="2" />
        <line x1="60" y1="45" x2="60" y2="20" className="stroke-primary" strokeWidth="2" />
        <rect x="50" y="6" width="20" height="14" className="fill-none stroke-primary" strokeWidth="2" />
        <text x="65" y="8" className="fill-muted-foreground text-[9px]">
          VCC
        </text>
        <line x1="60" y1="45" x2="60" y2="70" className="stroke-primary" strokeWidth="2" />
        <rect x="50" y="70" width="20" height="14" className="fill-none stroke-primary" strokeWidth="2" />
        <text x="65" y="92" className="fill-muted-foreground text-[9px]">
          GND
        </text>
      </g>

      <g transform="translate(240,140)">
        <text x="0" y="0" className="fill-foreground text-[11px] font-medium">
          ODT (בתוך המקלט)
        </text>
        <line x1="-10" y1="45" x2="70" y2="45" className="stroke-foreground/60" strokeWidth="2" />
        <rect x="70" y="10" width="70" height="70" rx="4" className="fill-none stroke-foreground/50" strokeDasharray="3 2" />
        <rect x="95" y="35" width="20" height="14" className="fill-none stroke-primary" strokeWidth="2" />
        <line x1="105" y1="49" x2="105" y2="60" className="stroke-foreground/60" strokeWidth="2" />
        <text x="75" y="95" className="fill-muted-foreground text-[10px]">
          R מוטמע בשבב עצמו
        </text>
      </g>
    </svg>
  )
}

export function RoutingTopologyDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>שלוש טופולוגיות ניתוב נפוצות</title>
      <desc>נקודה-לנקודה, שרשרת רב-נקודתית (multidrop), וטופולוגיית fly-by עם שלוחות קצרות לכל התקן.</desc>

      <g>
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          נקודה-לנקודה
        </text>
        <rect x="10" y="40" width="20" height="20" className="fill-none stroke-primary" strokeWidth="2" />
        <line x1="30" y1="50" x2="120" y2="50" className="stroke-primary" strokeWidth="2.5" />
        <rect x="120" y="40" width="20" height="20" className="fill-none stroke-primary" strokeWidth="2" />
      </g>

      <g transform="translate(0,70)">
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          שרשרת רב-נקודתית (multidrop)
        </text>
        <rect x="10" y="40" width="18" height="18" className="fill-none stroke-primary" strokeWidth="2" />
        <line x1="28" y1="49" x2="180" y2="49" className="stroke-primary" strokeWidth="2.5" />
        <rect x="180" y="40" width="18" height="18" className="fill-none stroke-primary" strokeWidth="2" />
        {[70, 110, 150].map((x) => (
          <g key={x}>
            <line x1={x} y1="49" x2={x} y2="70" className="stroke-chart-3" strokeWidth="1.5" />
            <rect x={x - 9} y="70" width="18" height="14" className="fill-none stroke-chart-3" strokeWidth="1.5" />
          </g>
        ))}
      </g>

      <g transform="translate(0,150)">
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          Fly-by — שלוחות קצרות לכל התקן
        </text>
        <line x1="10" y1="49" x2="230" y2="49" className="stroke-primary" strokeWidth="2.5" />
        <rect x="10" y="40" width="16" height="18" className="fill-none stroke-primary" strokeWidth="2" />
        {[70, 120, 170, 220].map((x) => (
          <g key={x}>
            <line x1={x} y1="49" x2={x} y2="60" className="stroke-chart-3" strokeWidth="1.5" />
            <rect x={x - 8} y="60" width="16" height="12" className="fill-none stroke-chart-3" strokeWidth="1.5" />
          </g>
        ))}
      </g>
    </svg>
  )
}
