import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function LinearVsSmpsDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>השוואת טופולוגיה: רגולטור ליניארי מול ממיר מיתוג (SMPS)</title>
      <desc>
        רגולטור ליניארי משתמש בטרנזיסטור מעבר הפועל כנגד משתנה, ומפזר את הפרש המתח כחום. ממיר
        מיתוג (SMPS) מפסיק ומדליק מתג במהירות גבוהה ומאגר אנרגיה בסליל, ולכן יעיל הרבה יותר אך
        מייצר רעש מיתוג.
      </desc>

      {/* Linear */}
      <g>
        <text x="30" y="24" className="fill-foreground text-[13px] font-semibold">
          רגולטור ליניארי
        </text>
        <rect x="30" y="40" width="180" height="70" rx="6" className="fill-none stroke-foreground/50" />
        <line x1="20" y1="60" x2="60" y2="60" className="stroke-foreground/60" strokeWidth="2" />
        <path d="M60 50 L60 70 M60 50 L80 60 L60 70" className="fill-none stroke-primary" strokeWidth="2" />
        <text x="55" y="90" className="fill-muted-foreground text-[10px]">
          טרנזיסטור מעבר
        </text>
        <line x1="150" y1="60" x2="190" y2="60" className="stroke-foreground/60" strokeWidth="2" />
        <text x="20" y="130" className="fill-muted-foreground text-[11px]">
          Vin → מתח פלט קבוע, ההפרש נפלט כחום
        </text>
      </g>

      {/* SMPS */}
      <g transform="translate(230,0)">
        <text x="20" y="24" className="fill-foreground text-[13px] font-semibold">
          ממיר מיתוג (SMPS / Buck)
        </text>
        <rect x="20" y="40" width="200" height="70" rx="6" className="fill-none stroke-foreground/50" />
        <rect x="35" y="55" width="18" height="18" className="fill-none stroke-primary" strokeWidth="2" />
        <text x="30" y="88" className="fill-muted-foreground text-[10px]">
          מתג
        </text>
        <path d="M75 64 q10 -14 20 0 q10 14 20 0 q10 -14 20 0" className="fill-none stroke-primary" strokeWidth="2" />
        <text x="80" y="88" className="fill-muted-foreground text-[10px]">
          סליל
        </text>
        <line x1="150" y1="64" x2="150" y2="95" className="stroke-foreground/50" strokeWidth="2" />
        <line x1="130" y1="95" x2="170" y2="95" className="stroke-foreground/50" strokeWidth="2" />
        <text x="165" y="88" className="fill-muted-foreground text-[10px]">
          קבל פלט
        </text>
        <text x="10" y="130" className="fill-muted-foreground text-[11px]">
          אנרגיה נאגרת ומשוחררת במהירות — יעיל, אך מייצר רעש מיתוג
        </text>
      </g>
    </svg>
  )
}

export function RiseTimeBandwidthDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 200" className={cn('h-auto w-full', className)} role="img">
      <title>זמן עלייה ורוחב הפס האפקטיבי של אות דיגיטלי</title>
      <desc>
        קצה מהיר יותר (זמן עלייה tr קצר יותר) מכיל תוכן הרמוני עד תדר גבוה יותר, בקירוב BW ≈
        0.35/tr. קצה איטי יותר "עני" בהרמוניות גבוהות.
      </desc>

      {/* trapezoid pulse */}
      <g>
        <line x1="30" y1="150" x2="410" y2="150" className="stroke-foreground/40" strokeWidth="1" />
        <path
          d="M40 150 L40 150 L70 40 L220 40 L250 150"
          className="fill-none stroke-primary"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <line x1="40" y1="160" x2="70" y2="160" className="stroke-chart-3" strokeWidth="1.5" />
        <text x="35" y="176" className="fill-chart-3 text-[11px] font-medium">
          tr — זמן עלייה
        </text>
        <text x="220" y="176" className="fill-muted-foreground text-[11px]">
          זמן
        </text>
        <text x="35" y="30" className="fill-muted-foreground text-[11px]">
          מתח
        </text>
      </g>

      {/* small bandwidth annotation */}
      <g transform="translate(280,20)">
        <rect x="0" y="0" width="160" height="150" rx="6" className="fill-none stroke-foreground/30" strokeDasharray="3 3" />
        <text x="10" y="20" className="fill-foreground text-[11px] font-medium">
          תוכן הרמוני
        </text>
        <path d="M15 40 L15 120 M15 120 L145 120" className="stroke-foreground/50" strokeWidth="1.5" />
        <path d="M15 60 C 60 60 70 110 145 118" className="fill-none stroke-primary" strokeWidth="2" />
        <text x="20" y="135" className="fill-muted-foreground text-[10px]">
          BW ≈ 0.35 / tr
        </text>
      </g>
    </svg>
  )
}

export function FourierSynthesisDiagram({ className }: DiagramProps) {
  const yc1 = 35
  const yc2 = 90
  const a1 = 18
  const a2 = 8
  return (
    <svg viewBox="0 0 460 230" className={cn('h-auto w-full', className)} role="img">
      <title>בניית קצה חד מסכימת הרמוניות סינוסואידליות</title>
      <desc>
        חיבור של מרכיב היסוד עם הרמוניה שלישית וחמישית, כל אחת בעוצמה יורדת, מתקרב בהדרגה לצורת
        גל מלבנית עם קצוות חדים — זו הכוונה כשאומרים שקצה מהיר "מכיל" תדרים גבוהים.
      </desc>

      <text x="10" y="16" className="fill-foreground text-[11px] font-medium">
        מרכיב יסוד (1×f)
      </text>
      <path
        d={`M20 ${yc1} Q70 ${yc1 - a1} 120 ${yc1} Q170 ${yc1 + a1} 220 ${yc1}`}
        className="fill-none stroke-chart-1"
        strokeWidth="2.5"
      />

      <text x="10" y="71" className="fill-foreground text-[11px] font-medium">
        הרמוניה 3×f (עוצמה נמוכה יותר)
      </text>
      <path
        d={`M20 ${yc2} Q53.3 ${yc2 - a2} 86.7 ${yc2} Q120 ${yc2 + a2} 153.3 ${yc2} Q186.7 ${yc2 - a2} 220 ${yc2}`}
        className="fill-none stroke-chart-2"
        strokeWidth="2.5"
      />

      <text x="10" y="126" className="fill-muted-foreground text-[11px]">
        + הרמוניות גבוהות נוספות...
      </text>

      <text x="240" y="16" className="fill-foreground text-[12px] font-semibold">
        ← סכום המרכיבים
      </text>
      <path
        d="M250 150 L250 60 Q255 40 275 40 L335 40 Q355 40 360 60 L360 150"
        className="fill-none stroke-primary"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <text x="245" y="175" className="fill-muted-foreground text-[11px]">
        קצה תלול יותר ← דורש תדרים גבוהים יותר
      </text>
    </svg>
  )
}
