import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function EmiEmissionsDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>פליטה מוקרנת מול פליטה מוליכה, ומגבלת תקן טיפוסית</title>
      <desc>
        פליטה מוקרנת יוצאת דרך האוויר כגלים אלקטרומגנטיים; פליטה מוליכה נוסעת החוצה דרך כבלים
        וחוטי הספק. תקנים כמו EN55022 מגדירים קו מגבלה מקסימלי לאורך תדר.
      </desc>
      <g>
        <rect x="20" y="60" width="90" height="60" rx="4" className="fill-none stroke-primary" strokeWidth="2" />
        <text x="30" y="45" className="fill-foreground text-[11px] font-medium">
          פליטה מוקרנת
        </text>
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M110 ${75 + i * 15} q20 0 30 -10`}
            className="fill-none stroke-chart-3"
            strokeWidth="2"
            markerEnd="url(#c9-arrow)"
          />
        ))}
      </g>

      <g transform="translate(220,0)">
        <rect x="0" y="60" width="90" height="60" rx="4" className="fill-none stroke-primary" strokeWidth="2" />
        <text x="0" y="45" className="fill-foreground text-[11px] font-medium">
          פליטה מוליכה
        </text>
        <line x1="90" y1="90" x2="180" y2="90" className="stroke-chart-2" strokeWidth="3" />
        <text x="100" y="82" className="fill-chart-2 text-[10px]">
          החוצה דרך כבל הספק
        </text>
      </g>

      <g transform="translate(0,150)">
        <line x1="20" y1="60" x2="440" y2="60" className="stroke-foreground/40" strokeWidth="1" />
        <line x1="20" y1="60" x2="20" y2="10" className="stroke-foreground/40" strokeWidth="1" />
        <path d="M20 30 H440" className="stroke-destructive" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="350" y="24" className="fill-destructive text-[10px]">
          מגבלת תקן (EN55022)
        </text>
        <path d="M20 50 C 100 45 150 15 180 20 C 220 28 300 50 440 45" className="fill-none stroke-primary" strokeWidth="2" />
      </g>

      <defs>
        <marker id="c9-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <path d="M0,0 L5,3 L0,6 Z" className="fill-chart-3" />
        </marker>
      </defs>
    </svg>
  )
}

export function FaradayShieldingDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>מגן פאראדיי מעל מעגל רגיש, וגדר ויאס לאורך קצה הלוח</title>
      <desc>
        קופסת מיגון מוארקת חוסמת שדות חיצוניים מהגעה למעגל הרגיש שבתוכה. גדר ויאס — שורת vias
        מוארקים במרווחים קטנים מאורך הגל — מונעת דליפת שדה דרך קצה הלוח או חריץ.
      </desc>
      <g>
        <rect x="20" y="30" width="150" height="90" rx="4" className="fill-none stroke-primary" strokeWidth="2" strokeDasharray="4 3" />
        <text x="30" y="20" className="fill-foreground text-[11px] font-medium">
          מגן פאראדיי (Shield Can)
        </text>
        <rect x="50" y="60" width="40" height="24" className="fill-chart-3/30 stroke-chart-3" strokeWidth="1.5" />
        <text x="50" y="100" className="fill-muted-foreground text-[10px]">
          מעגל רגיש
        </text>
        {[20, 170].map((x) => (
          <line key={x} x1={x} y1="120" x2={x} y2="140" className="stroke-foreground/60" strokeWidth="2" />
        ))}
      </g>

      <g transform="translate(230,0)">
        <text x="0" y="20" className="fill-foreground text-[11px] font-medium">
          גדר ויאס לאורך קצה לוח / חריץ
        </text>
        <line x1="0" y1="60" x2="200" y2="60" className="stroke-foreground/40" strokeWidth="2" strokeDasharray="6 4" />
        {[10, 35, 60, 85, 110, 135, 160, 185].map((x) => (
          <circle key={x} cx={x} cy="60" r="4" className="fill-primary" />
        ))}
        <text x="0" y="90" className="fill-muted-foreground text-[10px]">
          מרווח קטן מאורך הגל — חוסם דליפת שדה
        </text>
      </g>
    </svg>
  )
}

export function DifferentialCommonModeDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>זרם מצב דיפרנציאלי מול זרם מצב משותף על זוג קווים</title>
      <desc>
        זרם מצב דיפרנציאלי זורם בכיוונים מנוגדים בשני הקווים ומתבטל בשדה הרחוק; זרם מצב משותף
        זורם באותו כיוון בשני הקווים ומצטבר — הוא המקור הדומיננטי לרוב בעיות הקרינה בפועל.
      </desc>
      <g>
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          מצב דיפרנציאלי (DM) — מתבטל בשדה הרחוק
        </text>
        <line x1="10" y1="50" x2="200" y2="50" className="stroke-primary" strokeWidth="3" markerEnd="url(#c9b-r)" />
        <line x1="10" y1="80" x2="200" y2="80" className="stroke-primary" strokeWidth="3" markerStart="url(#c9b-l)" />
      </g>

      <g transform="translate(0,110)">
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          מצב משותף (CM) — מצטבר, מקרין ביעילות
        </text>
        <line x1="10" y1="50" x2="200" y2="50" className="stroke-destructive" strokeWidth="3" markerEnd="url(#c9b-r2)" />
        <line x1="10" y1="80" x2="200" y2="80" className="stroke-destructive" strokeWidth="3" markerEnd="url(#c9b-r2)" />
      </g>

      <g transform="translate(260,40)">
        <text x="0" y="0" className="fill-foreground text-[11px] font-medium">
          חרוז CM (Common-Mode Choke)
        </text>
        <rect x="0" y="20" width="160" height="90" rx="6" className="fill-none stroke-foreground/40" strokeDasharray="3 3" />
        <path d="M10 45 q30 -18 60 0 q30 18 60 0 q30 -18 30 0" className="fill-none stroke-primary" strokeWidth="2.5" />
        <path d="M10 85 q30 -18 60 0 q30 18 60 0 q30 -18 30 0" className="fill-none stroke-primary" strokeWidth="2.5" />
        <text x="8" y="125" className="fill-muted-foreground text-[10px]">
          מעביר DM כמעט ללא הנחתה, חוסם CM
        </text>
      </g>

      <defs>
        <marker id="c9b-r" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <path d="M0,0 L5,3 L0,6 Z" className="fill-primary" />
        </marker>
        <marker id="c9b-l" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L5,3 L0,6 Z" className="fill-primary" />
        </marker>
        <marker id="c9b-r2" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <path d="M0,0 L5,3 L0,6 Z" className="fill-destructive" />
        </marker>
      </defs>
    </svg>
  )
}
