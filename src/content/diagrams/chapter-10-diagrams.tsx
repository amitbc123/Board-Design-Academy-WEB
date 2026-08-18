import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function CopperBalanceDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 200" className={cn('h-auto w-full', className)} role="img">
      <title>ערימה לא מאוזנת גורמת לעיוות (warp), ערימה מאוזנת נשארת שטוחה</title>
      <desc>
        פיזור נחושת לא סימטרי בין שכבות (הרבה נחושת בצד אחד, מעט בצד השני) יוצר מתחים לא שווים
        בזמן הלמינציה והקירור, ומעוות את הלוח. פיזור נחושת מאוזן שומר על לוח שטוח.
      </desc>
      <g>
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          ערימה לא מאוזנת — עיוות (warp)
        </text>
        <path
          d="M20 100 Q120 60 220 100"
          className="fill-none stroke-primary"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <text x="30" y="130" className="fill-muted-foreground text-[10px]">
          נחושת כבדה למעלה, קלה למטה
        </text>
      </g>

      <g transform="translate(240,0)">
        <text x="0" y="18" className="fill-foreground text-[11px] font-medium">
          ערימה מאוזנת — שטוחה
        </text>
        <rect x="0" y="95" width="200" height="10" rx="4" className="fill-primary" />
        <text x="10" y="130" className="fill-muted-foreground text-[10px]">
          פיזור נחושת דומה משני צידי מרכז הערימה
        </text>
      </g>
    </svg>
  )
}

export function StackupExamplesDiagram({ className }: DiagramProps) {
  const stacks: { title: string; layers: ('signal' | 'plane')[] }[] = [
    { title: '4 שכבות', layers: ['signal', 'plane', 'plane', 'signal'] },
    { title: '8 שכבות', layers: ['signal', 'plane', 'signal', 'plane', 'plane', 'signal', 'plane', 'signal'] },
    {
      title: '12 שכבות',
      layers: [
        'signal',
        'plane',
        'signal',
        'signal',
        'plane',
        'plane',
        'plane',
        'plane',
        'signal',
        'signal',
        'plane',
        'signal',
      ],
    },
  ]
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>דוגמאות מבנה שכבות בכמה גדלים: 4, 8 ו-12 שכבות</title>
      <desc>
        ככל שמספר השכבות עולה, מספר זוגות ההספק/אדמה הצמודים גדל גם הוא, ומאפשר יותר שכבות אות
        פנימיות מוגנות בסטריפליין תוך שמירה על רציפות התייחסות לכל שכבה.
      </desc>
      {stacks.map((stack, si) => (
        <g key={stack.title} transform={`translate(${20 + si * 150}, 10)`}>
          <text x="0" y="0" className="fill-foreground text-[11px] font-medium">
            {stack.title}
          </text>
          {stack.layers.map((layer, i) => (
            <rect
              key={i}
              x="0"
              y={10 + i * 15}
              width="120"
              height="11"
              className={layer === 'plane' ? 'fill-muted-foreground/60' : 'fill-primary/30 stroke-primary/60'}
              strokeWidth={layer === 'plane' ? 0 : 1}
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

export function TwentyHRuleDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 440 200" className={cn('h-auto w-full', className)} role="img">
      <title>כלל ה-20H: משיכת מישור ההספק פנימה ביחס למישור האדמה</title>
      <desc>
        מישור VCC נסוג פנימה מקצה מישור GND במרחק השווה בקירוב ל-20 פעמים גובה הדיאלקטריק ביניהם,
        כדי לצמצם דליפת שדה שוליים (fringing) מקצה מישור ההספק.
      </desc>
      <rect x="20" y="60" width="400" height="14" className="fill-muted-foreground/70" />
      <text x="20" y="50" className="fill-muted-foreground text-[10px]">
        מישור GND (עד קצה הלוח)
      </text>

      <rect x="60" y="100" width="320" height="14" className="fill-primary" />
      <text x="60" y="130" className="fill-primary text-[10px]">
        מישור VCC — נסוג פנימה
      </text>

      <line x1="20" y1="150" x2="60" y2="150" className="stroke-chart-3" strokeWidth="1.5" />
      <text x="15" y="165" className="fill-chart-3 text-[10px]">
        ≈ 20 × H
      </text>

      <line x1="40" y1="74" x2="40" y2="100" className="stroke-foreground/50" strokeWidth="1.5" strokeDasharray="2 2" />
      <text x="45" y="90" className="fill-foreground text-[9px]">
        H
      </text>

      <path d="M60 100 q-15 15 -15 30" className="fill-none stroke-chart-2" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x="30" y="30" className="fill-chart-2 text-[10px]">
        שדה שוליים מוכל בין המישורים, לא נפלט מהקצה
      </text>
    </svg>
  )
}

export function AnalogLayoutDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>הפרדה פיזית בין אזור אנלוגי לאזור דיגיטלי, עם גשר הארקה יחיד</title>
      <desc>
        אזור אנלוגי רגיש מקובץ יחד ומופרד פיזית מאזור דיגיטלי רועש, עם מישור אדמה משותף (לא מפוצל)
        ונקודת חיבור מוגדרת בין האזורים כדי למנוע לולאות זרם דיגיטליות שחוצות את האזור האנלוגי.
      </desc>
      <rect x="20" y="30" width="180" height="140" rx="6" className="fill-chart-2/15 stroke-chart-2/60" strokeWidth="1.5" />
      <text x="35" y="20" className="fill-foreground text-[11px] font-medium">
        אזור אנלוגי
      </text>

      <rect x="250" y="30" width="190" height="140" rx="6" className="fill-primary/10 stroke-primary/50" strokeWidth="1.5" />
      <text x="270" y="20" className="fill-foreground text-[11px] font-medium">
        אזור דיגיטלי
      </text>

      <line x1="200" y1="100" x2="250" y2="100" className="stroke-chart-3" strokeWidth="3" />
      <text x="185" y="90" className="fill-chart-3 text-[10px]">
        נקודת גישור מוגדרת
      </text>

      <text x="30" y="190" className="fill-muted-foreground text-[10px]">
        מישור אדמה משותף ורציף מתחת לשני האזורים — לא מפוצל
      </text>
    </svg>
  )
}
