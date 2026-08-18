import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function BgaFanoutDiagram({ className }: DiagramProps) {
  const balls: [number, number][] = []
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      balls.push([40 + c * 30, 30 + r * 30])
    }
  }
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>פאן-אאוט של BGA: via-in-pad ובריחה בין כדורים</title>
      <desc>
        כל כדור מקבל via צמוד (dogbone) שמוציא אותו לשכבת ניתוב פנימית. בצפיפות גבוהה נדרש
        via-in-pad כדי לפנות מקום לבריחת האותות שבין הכדורים הפנימיים.
      </desc>
      <g>
        {balls.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="8" className="fill-primary/70" />
        ))}
        {balls
          .filter((_, i) => i % 3 === 0)
          .map(([x, y], i) => (
            <g key={i}>
              <circle cx={x + 12} cy={y - 12} r="2.5" className="fill-chart-3" />
              <line x1={x} y1={y} x2={x + 12} y2={y - 12} className="stroke-chart-3" strokeWidth="1" />
            </g>
          ))}
      </g>
      <g transform="translate(230,20)">
        <text x="0" y="0" className="fill-foreground text-[11px] font-medium">
          בצפיפות מרבית:
        </text>
        <text x="0" y="20" className="fill-muted-foreground text-[10px]">
          via-in-pad — ה-via עצמו מתחת לכדור,
        </text>
        <text x="0" y="36" className="fill-muted-foreground text-[10px]">
          ממולא ומכוסה, כדי לפנות ערוץ בריחה
        </text>
        <text x="0" y="52" className="fill-muted-foreground text-[10px]">
          לכדורים הפנימיים ביותר.
        </text>
      </g>
    </svg>
  )
}

export function SerpentineStubDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>ניתוב סרפנטיני להתאמת אורך, וסטאב שיוצר החזרה</title>
      <desc>
        ניתוב סרפנטיני מאריך בכוונה מסלול קצר כדי להתאים לאחר. סטאב — קטע מסלול לא בשימוש שנשאר
        אחרי via — יוצר אי-רציפות עכבה ותהודה בתדר התלוי באורכו.
      </desc>
      <g>
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          ניתוב סרפנטיני (Serpentine)
        </text>
        <path
          d="M10 50 H60 V30 H90 V70 H120 V30 H150 V70 H180 H230"
          className="fill-none stroke-primary"
          strokeWidth="2.5"
        />
      </g>

      <g transform="translate(0,110)">
        <text x="10" y="0" className="fill-foreground text-[11px] font-medium">
          סטאב (Stub) לא בשימוש אחרי via
        </text>
        <line x1="10" y1="40" x2="150" y2="40" className="stroke-primary" strokeWidth="3" />
        <circle cx="150" cy="40" r="6" className="fill-primary" />
        <line x1="150" y1="46" x2="150" y2="90" className="stroke-destructive" strokeWidth="3" strokeDasharray="4 3" />
        <text x="160" y="75" className="fill-destructive text-[10px]">
          סטאב — יוצר החזרה בתדר התלוי באורכו
        </text>
      </g>
    </svg>
  )
}

export function RfCoplanarWaveguideDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>גל-מוליך מישורי משותף (CPW) עם הארקה, וטייפר RF</title>
      <desc>
        ב-CPW מוארק, מסלול האות מוקף במוליכי אדמה על אותה שכבה, בנוסף למישור אדמה מתחת. טייפר RF
        משנה רוחב מסלול בהדרגה כדי למנוע קפיצת עכבה חדה.
      </desc>
      <g>
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          חתך CPW מוארק
        </text>
        <rect x="20" y="60" width="60" height="16" className="fill-muted-foreground/60" />
        <rect x="90" y="60" width="30" height="16" className="fill-primary" />
        <rect x="130" y="60" width="60" height="16" className="fill-muted-foreground/60" />
        <rect x="20" y="90" width="170" height="14" className="fill-muted-foreground/40" />
        <text x="20" y="120" className="fill-muted-foreground text-[10px]">
          אדמה משני צידי המסלול + מישור מתחת
        </text>
      </g>

      <g transform="translate(230,0)">
        <text x="0" y="18" className="fill-foreground text-[11px] font-medium">
          טייפר RF — מעבר רוחב הדרגתי
        </text>
        <path d="M0 60 L60 55 L120 40 L180 40 L180 70 L120 70 L60 65 L0 60 Z" className="fill-primary/60" />
        <text x="0" y="100" className="fill-muted-foreground text-[10px]">
          מונע קפיצת עכבה חדה בין רוחבים שונים
        </text>
      </g>
    </svg>
  )
}

export function MixedSignalGroundingDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>מיקום אזורי אנלוגי, דיגיטלי ו-RF על אותו לוח</title>
      <desc>
        שלושת סוגי המעגלים מקובצים פיזית באזורים נפרדים, עם אזור ה-RF במרחק המרבי מהמתגים
        הדיגיטליים הרועשים ביותר, ומישור אדמה משותף ורציף מתחת לכולם.
      </desc>
      <rect x="20" y="30" width="120" height="140" rx="6" className="fill-chart-2/15 stroke-chart-2/60" strokeWidth="1.5" />
      <text x="30" y="20" className="fill-foreground text-[10px] font-medium">
        אנלוגי
      </text>
      <rect x="160" y="30" width="140" height="140" rx="6" className="fill-primary/10 stroke-primary/50" strokeWidth="1.5" />
      <text x="180" y="20" className="fill-foreground text-[10px] font-medium">
        דיגיטלי (הכי רועש)
      </text>
      <rect x="320" y="30" width="120" height="140" rx="6" className="fill-chart-3/15 stroke-chart-3/60" strokeWidth="1.5" />
      <text x="340" y="20" className="fill-foreground text-[10px] font-medium">
        RF
      </text>
      <text x="130" y="200" className="fill-muted-foreground text-[10px]">
        RF במרחק המרבי מהדיגיטלי; מישור אדמה משותף ורציף מתחת לכל האזורים
      </text>
    </svg>
  )
}
