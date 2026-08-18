import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function DifferentialPairDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 440 200" className={cn('h-auto w-full', className)} role="img">
      <title>חתך זוג דיפרנציאלי: שני מסלולים צמודים, מצב אי-זוגי</title>
      <desc>
        שני מסלולים צמודים נושאים אותות הפוכים זה לזה (+/-). ההצמדה ההדוקה ביניהם קובעת, יחד עם
        הגובה מעל המישור, את העכבה הדיפרנציאלית Zdiff.
      </desc>
      <rect x="40" y="120" width="360" height="16" className="fill-muted-foreground/60" />
      <rect x="150" y="80" width="30" height="16" className="fill-primary" />
      <rect x="190" y="80" width="30" height="16" className="fill-chart-3" />

      <text x="150" y="70" className="fill-primary text-[10px]">
        + (V/2)
      </text>
      <text x="190" y="70" className="fill-chart-3 text-[10px]">
        − (−V/2)
      </text>

      <line x1="180" y1="88" x2="190" y2="88" className="stroke-foreground/50" strokeWidth="1.5" />
      <text x="170" y="105" className="fill-foreground text-[10px]">
        S
      </text>

      <text x="40" y="160" className="fill-muted-foreground text-[10px]">
        Zdiff ≈ 2 × Z0-odd, תלוי גם ב-S וגם בגובה מעל המישור
      </text>
    </svg>
  )
}

export function EyeDiagramDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 440 220" className={cn('h-auto w-full', className)} role="img">
      <title>תרשים עין: פתיחה אנכית ואופקית</title>
      <desc>
        חפיפת אלפי מעברי ביט יוצרת תבנית "עין". רעש סוגר את הפתיחה האנכית; ריצוד (jitter) סוגר את
        הפתיחה האופקית. המקלט צריך פתיחה מספקת בשני הכיוונים ברגע הדגימה.
      </desc>
      {Array.from({ length: 14 }).map((_, i) => (
        <path
          key={i}
          d={`M20 ${40 + (i % 3) * 4} C 140 ${100 + (i % 5) * 6}, 140 ${100 - (i % 4) * 6}, 260 ${40 + (i % 4) * 4}`}
          className="fill-none stroke-primary/40"
          strokeWidth="1.2"
        />
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <path
          key={`b${i}`}
          d={`M20 ${180 - (i % 3) * 4} C 140 ${100 - (i % 5) * 6}, 140 ${100 + (i % 4) * 6}, 260 ${180 - (i % 4) * 4}`}
          className="fill-none stroke-primary/40"
          strokeWidth="1.2"
        />
      ))}
      <line x1="140" y1="60" x2="140" y2="160" className="stroke-chart-3" strokeWidth="2" strokeDasharray="4 3" />
      <text x="150" y="55" className="fill-chart-3 text-[10px]">
        פתיחה אנכית (רעש)
      </text>
      <line x1="100" y1="110" x2="180" y2="110" className="stroke-destructive" strokeWidth="2" strokeDasharray="4 3" />
      <text x="290" y="115" className="fill-destructive text-[10px]">
        פתיחה אופקית (ריצוד)
      </text>
      <circle cx="140" cy="110" r="4" className="fill-foreground" />
      <text x="150" y="130" className="fill-foreground text-[10px]">
        נקודת דגימה
      </text>
    </svg>
  )
}

export function EqualizationDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>השוואה (equalization) פותחת מחדש עין שנסגרה מאובדן ערוץ</title>
      <desc>
        ערוץ עם אובדן תלוי-תדר מנחית תדרים גבוהים יותר מנמוכים, וסוגר את תרשים העין. השוואה
        (בצד המשדר או המקלט) מגבירה במכוון את התדרים הגבוהים כדי לפצות ולפתוח את העין מחדש.
      </desc>
      <g>
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          עין לפני השוואה — סגורה
        </text>
        <path d="M20 60 L60 100 L20 140" className="fill-none stroke-destructive" strokeWidth="2" />
        <path d="M120 60 L80 100 L120 140" className="fill-none stroke-destructive" strokeWidth="2" />
        <text x="10" y="165" className="fill-muted-foreground text-[10px]">
          אובדן תלוי-תדר "אוכל" את הפתיחה
        </text>
      </g>

      <g transform="translate(180,0)">
        <text x="0" y="18" className="fill-foreground text-[11px] font-medium">
          תגובת מסנן ההשוואה
        </text>
        <line x1="0" y1="60" x2="140" y2="60" className="stroke-foreground/30" strokeWidth="1" />
        <path d="M0 55 C 60 55 90 20 140 10" className="fill-none stroke-primary" strokeWidth="2.5" />
        <text x="0" y="80" className="fill-muted-foreground text-[10px]">
          מגביר תדרים גבוהים באופן מכוון
        </text>
      </g>

      <g transform="translate(340,0)">
        <text x="0" y="18" className="fill-foreground text-[11px] font-medium">
          עין אחרי השוואה — פתוחה
        </text>
        <path d="M10 50 L50 100 L10 150" className="fill-none stroke-success" strokeWidth="2" />
        <path d="M110 50 L70 100 L110 150" className="fill-none stroke-success" strokeWidth="2" />
      </g>
    </svg>
  )
}

export function HdiViaTypesDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>סוגי via: מקצה-לקצה, עיוור, קבור, ומיקרו-ויאס מוערמים</title>
      <desc>
        via רגיל עובר לאורך כל עובי הלוח. via עיוור מחבר שכבה חיצונית לפנימית בלבד. via קבור מחבר
        רק בין שכבות פנימיות ואינו נראה כלל מבחוץ. מיקרו-ויאס מוערמים מאפשרים מעבר בין כמה שכבות
        סמוכות בצפיפות גבוהה מאוד.
      </desc>
      {['Through', 'Blind', 'Buried', 'Stacked Micro'].map((label, i) => (
        <g key={label} transform={`translate(${20 + i * 110}, 20)`}>
          {Array.from({ length: 6 }).map((_, li) => (
            <rect key={li} x="0" y={li * 22} width="80" height="16" className={li % 2 === 0 ? 'fill-muted-foreground/50' : 'fill-card stroke-foreground/20'} strokeWidth="1" />
          ))}
          {i === 0 && <line x1="40" y1="8" x2="40" y2="140" className="stroke-primary" strokeWidth="6" />}
          {i === 1 && <line x1="40" y1="8" x2="40" y2="60" className="stroke-primary" strokeWidth="6" />}
          {i === 2 && <line x1="40" y1="52" x2="40" y2="96" className="stroke-primary" strokeWidth="6" />}
          {i === 3 && (
            <>
              <line x1="40" y1="8" x2="40" y2="52" className="stroke-primary" strokeWidth="6" />
              <line x1="40" y1="52" x2="40" y2="96" className="stroke-chart-3" strokeWidth="6" />
            </>
          )}
          <text x="0" y="160" className="fill-foreground text-[10px] font-medium">
            {label}
          </text>
        </g>
      ))}
    </svg>
  )
}
