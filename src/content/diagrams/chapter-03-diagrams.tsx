import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function CapacitorImpedanceCurveDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 440 220" className={cn('h-auto w-full', className)} role="img">
      <title>עכבת קבל אמיתי מול תדר</title>
      <desc>
        בתדר נמוך הקבל מתנהג כקיבול טהור והעכבה יורדת עם התדר. בתדר התהודה העצמית (SRF) העכבה
        מגיעה למינימום השווה בקירוב ל-ESR. מעל SRF ההשראות הטורית (ESL) שולטת והעכבה חוזרת ועולה.
      </desc>
      <line x1="40" y1="180" x2="410" y2="180" className="stroke-foreground/50" strokeWidth="1.5" />
      <line x1="40" y1="180" x2="40" y2="20" className="stroke-foreground/50" strokeWidth="1.5" />
      <text x="380" y="196" className="fill-muted-foreground text-[11px]">
        תדר ←
      </text>
      <text x="10" y="30" className="fill-muted-foreground text-[11px]">
        |Z|
      </text>

      <path
        d="M50 40 C 130 60 190 150 220 165 C 250 150 320 60 400 35"
        className="fill-none stroke-primary"
        strokeWidth="3"
      />

      <line x1="220" y1="165" x2="220" y2="185" className="stroke-chart-3" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="180" y="205" className="fill-chart-3 text-[11px] font-medium">
        SRF (Z ≈ ESR)
      </text>

      <text x="55" y="55" className="fill-muted-foreground text-[10px]">
        תחום קיבולי
      </text>
      <text x="320" y="55" className="fill-muted-foreground text-[10px]">
        תחום השראתי (ESL)
      </text>
    </svg>
  )
}

export function FerriteBeadImpedanceDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 440 220" className={cn('h-auto w-full', className)} role="img">
      <title>עכבת חרוז פריט מול תדר: מרכיבי R ו-X</title>
      <desc>
        בתדר נמוך חרוז הפריט מתנהג בעיקר כהשראתי (X שולט). סביב תדר העבודה שלו, מרכיב ההתנגדות R
        עולה ושולט בעכבה — זו הסיבה שהוא מנחית אנרגיה בעיקר כחום ולא רק חוסם אותה כמו סליל טהור.
      </desc>
      <line x1="40" y1="180" x2="410" y2="180" className="stroke-foreground/50" strokeWidth="1.5" />
      <line x1="40" y1="180" x2="40" y2="20" className="stroke-foreground/50" strokeWidth="1.5" />
      <text x="380" y="196" className="fill-muted-foreground text-[11px]">
        תדר ←
      </text>

      <path d="M50 170 C 150 160 220 60 400 30" className="fill-none stroke-primary" strokeWidth="3" />
      <text x="300" y="50" className="fill-primary text-[11px] font-medium">
        |Z| כולל
      </text>

      <path d="M50 175 C 180 170 260 90 400 70" className="fill-none stroke-chart-3" strokeWidth="2.5" strokeDasharray="5 3" />
      <text x="260" y="105" className="fill-chart-3 text-[11px] font-medium">
        R (התנגדותי — מנחית כחום)
      </text>

      <path d="M50 172 C 160 140 230 60 320 30" className="fill-none stroke-chart-2" strokeWidth="2" strokeDasharray="2 3" />
      <text x="70" y="150" className="fill-chart-2 text-[11px] font-medium">
        X (השראתי)
      </text>
    </svg>
  )
}

export function DecouplingPlacementDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 440 220" className={cn('h-auto w-full', className)} role="img">
      <title>מיקום קבל פריקה: לולאת זרם קצרה מול ארוכה</title>
      <desc>
        קבל פריקה קרוב לפין ההספק של הרכיב סוגר לולאת זרם קטנה עם השראות טורית נמוכה. קבל מרוחק
        סוגר לולאה גדולה יותר, עם השראות טורית גבוהה יותר שפוגעת ביעילות בתדר גבוה.
      </desc>

      <g>
        <text x="20" y="20" className="fill-foreground text-[12px] font-semibold">
          מיקום טוב — לולאה קטנה
        </text>
        <rect x="60" y="50" width="70" height="50" rx="4" className="fill-none stroke-foreground/60" strokeWidth="2" />
        <text x="75" y="80" className="fill-foreground text-[10px]">
          IC
        </text>
        <rect x="150" y="65" width="18" height="20" className="fill-none stroke-primary" strokeWidth="2" />
        <text x="140" y="105" className="fill-muted-foreground text-[10px]">
          קבל
        </text>
        <path
          d="M130 60 H150 M130 80 H150 V85"
          className="fill-none stroke-primary"
          strokeWidth="2"
        />
        <path d="M130 60 H150 V85 H130 V60" className="fill-none stroke-chart-3" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="90" y="140" className="fill-muted-foreground text-[10px]">
          לולאה קטנה ← השראות L נמוכה
        </text>
      </g>

      <g transform="translate(220,0)">
        <text x="0" y="20" className="fill-foreground text-[12px] font-semibold">
          מיקום גרוע — לולאה גדולה
        </text>
        <rect x="20" y="50" width="70" height="50" rx="4" className="fill-none stroke-foreground/60" strokeWidth="2" />
        <text x="35" y="80" className="fill-foreground text-[10px]">
          IC
        </text>
        <rect x="180" y="65" width="18" height="20" className="fill-none stroke-primary" strokeWidth="2" />
        <text x="165" y="105" className="fill-muted-foreground text-[10px]">
          קבל
        </text>
        <path d="M90 60 H198 V85 H90 V60" className="fill-none stroke-destructive" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="30" y="140" className="fill-muted-foreground text-[10px]">
          לולאה גדולה ← השראות L גבוהה, פחות יעיל בתדר גבוה
        </text>
      </g>
    </svg>
  )
}

export function ReturnCurrentPathDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 260" className={cn('h-auto w-full', className)} role="img">
      <title>נתיב הזרם החוזר: זרימה צמודה מתחת למסלול, ומה קורה כשיש פער במישור</title>
      <desc>
        בתדר גבוה, זרם ההחזרה זורם במישור ההתייחסות ישירות מתחת למסלול המוליך — הנתיב בעל
        ההשראות המשותפת הנמוכה ביותר. פער במישור ההתייחסות מכריח את הזרם לעקוף בלולאה גדולה, מה
        שמעלה השראות ופולט EMI.
      </desc>

      <g>
        <text x="20" y="20" className="fill-foreground text-[12px] font-semibold">
          מישור רציף — זרם חוזר צמוד למסלול
        </text>
        <rect x="20" y="70" width="400" height="16" className="fill-muted" />
        <line x1="20" y1="40" x2="420" y2="40" className="stroke-primary" strokeWidth="4" />
        <text x="20" y="32" className="fill-primary text-[10px]">
          זרם אות →
        </text>
        <path
          d="M20 78 Q220 60 420 78"
          className="fill-none stroke-chart-3"
          strokeWidth="2.5"
          strokeDasharray="5 3"
        />
        <text x="150" y="100" className="fill-chart-3 text-[10px]">
          זרם חוזר ← צמוד ישירות מתחת למסלול
        </text>
      </g>

      <g transform="translate(0,130)">
        <text x="20" y="10" className="fill-foreground text-[12px] font-semibold">
          פער במישור ההתייחסות — לולאה גדולה ו-EMI
        </text>
        <rect x="20" y="60" width="170" height="16" className="fill-muted" />
        <rect x="230" y="60" width="170" height="16" className="fill-muted" />
        <text x="192" y="95" className="fill-destructive text-[10px] font-medium">
          פער
        </text>
        <line x1="20" y1="30" x2="420" y2="30" className="stroke-primary" strokeWidth="4" />
        <path
          d="M20 68 Q205 55 210 20 Q215 -5 230 20 Q235 55 420 68"
          className="fill-none stroke-destructive"
          strokeWidth="2.5"
          strokeDasharray="5 3"
        />
        <text x="230" y="15" className="fill-destructive text-[10px]">
          עוקף בלולאה גדולה — L↑, EMI↑
        </text>
      </g>
    </svg>
  )
}

export function ViaStitchingDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 400 240" className={cn('h-auto w-full', className)} role="img">
      <title>via לתפירה ליד via של אות המחליף שכבת התייחסות</title>
      <desc>
        כאשר via אות עובר משכבה המתייחסת למישור GND לשכבה המתייחסת למישור הספק, זרם ההחזרה חייב
        "לקפוץ" בין המישורים. via תפירה (stitching via) הצמוד לו מחבר בין שני המישורים ומספק נתיב
        חזרה מקומי קצר.
      </desc>

      <rect x="20" y="40" width="360" height="14" className="fill-muted" />
      <text x="25" y="32" className="fill-muted-foreground text-[10px]">
        מישור GND
      </text>
      <rect x="20" y="180" width="360" height="14" className="fill-muted" />
      <text x="25" y="212" className="fill-muted-foreground text-[10px]">
        מישור הספק (VCC)
      </text>

      {/* signal via */}
      <line x1="170" y1="30" x2="170" y2="200" className="stroke-primary" strokeWidth="6" />
      <circle cx="170" cy="30" r="6" className="fill-primary" />
      <circle cx="170" cy="200" r="6" className="fill-primary" />
      <text x="140" y="24" className="fill-primary text-[10px]">
        via אות
      </text>

      {/* stitching via */}
      <line x1="230" y1="47" x2="230" y2="187" className="stroke-chart-3" strokeWidth="5" strokeDasharray="6 3" />
      <circle cx="230" cy="47" r="5" className="fill-chart-3" />
      <circle cx="230" cy="187" r="5" className="fill-chart-3" />
      <text x="240" y="120" className="fill-chart-3 text-[10px]">
        via תפירה — נתיב חזרה מקומי
      </text>

      <path
        d="M170 100 Q200 100 230 90"
        className="fill-none stroke-chart-3"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        markerEnd="url(#c3-arrow)"
      />
      <defs>
        <marker id="c3-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" className="fill-chart-3" />
        </marker>
      </defs>
    </svg>
  )
}
