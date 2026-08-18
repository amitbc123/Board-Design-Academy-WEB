import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function ManufacturingFlowDiagram({ className }: DiagramProps) {
  const steps = [
    'קובצי Gerber ו-CAM',
    'הדמיה פוטוליתוגרפית',
    'תחריט נחושת (Etching)',
    'למינציה (רב-שכבתי)',
    'קידוח ו-Plating של vias',
    'מסכת הלחמה + סילקסקרין',
    'גימור משטח',
    'בדיקה חשמלית',
  ]
  return (
    <svg viewBox="0 0 460 260" className={cn('h-auto w-full', className)} role="img">
      <title>זרימת תהליך הייצור מקובצי Gerber ועד לוח בדוק</title>
      <desc>שמונה שלבים עיקריים בהפיכת קובצי תכנון ללוח מודפס פיזי ובדוק.</desc>
      {steps.map((step, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = col === 0 ? 20 : 240
        const y = 10 + row * 62
        return (
          <g key={step}>
            <rect x={x} y={y} width="200" height="42" rx="6" className="fill-card stroke-primary/50" strokeWidth="1.5" />
            <text x={x + 10} y={y + 26} className="fill-foreground text-[11px]">
              {i + 1}. {step}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function PackageEvolutionDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>חתכי אריזה: THT, SMT (gull-wing) ו-BGA</title>
      <desc>
        THT מחייב רגל שעוברת דרך חור מוצף בלוח. SMT עם רגלי gull-wing מולחם ישירות על פד עליון.
        BGA מחליף רגליים בכדורי הלחמה מתחת לגוף הרכיב, ומאפשר צפיפות פינים גבוהה בהרבה.
      </desc>

      <g>
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          THT — רגל דרך חור
        </text>
        <rect x="20" y="40" width="90" height="14" className="fill-muted-foreground/60" />
        <rect x="55" y="30" width="20" height="60" className="fill-foreground/70" />
        <circle cx="65" cy="47" r="6" className="fill-none stroke-primary" strokeWidth="2" />
        <line x1="65" y1="53" x2="65" y2="88" className="stroke-primary" strokeWidth="3" />
      </g>

      <g transform="translate(160,0)">
        <text x="0" y="18" className="fill-foreground text-[11px] font-medium">
          SMT — רגל Gull-Wing
        </text>
        <rect x="10" y="40" width="120" height="14" className="fill-muted-foreground/60" />
        <rect x="40" y="15" width="60" height="20" className="fill-foreground/70" />
        <path d="M40 35 q-10 5 -10 15 h10" className="fill-none stroke-primary" strokeWidth="3" />
        <path d="M100 35 q10 5 10 15 h-10" className="fill-none stroke-primary" strokeWidth="3" />
        <rect x="26" y="48" width="12" height="6" className="fill-primary" />
        <rect x="102" y="48" width="12" height="6" className="fill-primary" />
      </g>

      <g transform="translate(320,0)">
        <text x="0" y="18" className="fill-foreground text-[11px] font-medium">
          BGA — כדורי הלחמה
        </text>
        <rect x="0" y="40" width="130" height="14" className="fill-muted-foreground/60" />
        <rect x="15" y="10" width="100" height="20" className="fill-foreground/70" />
        {[25, 45, 65, 85, 105].map((x) => (
          <circle key={x} cx={x} cy="35" r="4.5" className="fill-primary" />
        ))}
      </g>

      <text x="10" y="120" className="fill-muted-foreground text-[11px]">
        BGA מאפשר פי כמה וכמה יותר חיבורים באותו שטח גוף, ומקצר את נתיב ההשראות של כל פין.
      </text>
    </svg>
  )
}
