import { cn } from '@/lib/utils'
import type { DiagramProps } from '@/content/types'

export function TdrWaveformDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>עקומת TDR: עכבה נמדדת לאורך מרחק פיזי על הקו</title>
      <desc>
        פולס נשלח לתוך הקו ונמדדת ההחזרה כפונקציה של זמן, שמתורגם למרחק לפי מהירות ההתפשטות.
        עלייה בעקומה מסמנת אי-רציפות עם עכבה גבוהה יותר (כמו via דק), וירידה מסמנת עכבה נמוכה
        יותר (כמו מישור רחב קרוב).
      </desc>
      <line x1="30" y1="180" x2="430" y2="180" className="stroke-foreground/40" strokeWidth="1" />
      <line x1="30" y1="180" x2="30" y2="20" className="stroke-foreground/40" strokeWidth="1" />
      <text x="380" y="196" className="fill-muted-foreground text-[10px]">
        מרחק / זמן ←
      </text>
      <text x="8" y="30" className="fill-muted-foreground text-[10px]">
        Z(x)
      </text>

      <line x1="30" y1="100" x2="150" y2="100" className="stroke-primary" strokeWidth="3" />
      <text x="40" y="90" className="fill-muted-foreground text-[10px]">
        Z0 יציב
      </text>

      <path d="M150 100 L170 60 L210 60 L230 100" className="fill-none stroke-chart-3" strokeWidth="3" />
      <text x="150" y="50" className="fill-chart-3 text-[10px]">
        עלייה — via / אי-רציפות
      </text>

      <line x1="230" y1="100" x2="300" y2="100" className="stroke-primary" strokeWidth="3" />

      <path d="M300 100 L320 140 L360 140 L380 100" className="fill-none stroke-chart-2" strokeWidth="3" />
      <text x="290" y="158" className="fill-chart-2 text-[10px]">
        ירידה — מישור רחב / קצר יחסי
      </text>

      <line x1="380" y1="100" x2="430" y2="100" className="stroke-primary" strokeWidth="3" />
    </svg>
  )
}

export function InterfaceComparisonDiagram({ className }: DiagramProps) {
  const rows = [
    { name: 'SPI', wires: '4 קווים (CLK, MOSI, MISO, CS)', topo: 'נקודה-לנקודה / כוכב מ-CS נפרד לכל התקן' },
    { name: 'I2C', wires: '2 קווים (SDA, SCL), open-drain', topo: 'באס משותף רב-נקודתי' },
    { name: 'UART', wires: '2 קווים (TX, RX)', topo: 'נקודה-לנקודה' },
    { name: 'CAN', wires: 'זוג דיפרנציאלי (CAN-H/L)', topo: 'באס דיפרנציאלי רב-נקודתי, מסוכם בשני הקצוות' },
    { name: 'USB 2.0', wires: 'זוג דיפרנציאלי (D+/D-)', topo: 'עץ Host → Hub → Device' },
  ]
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>השוואת ממשקים דיגיטליים נפוצים: מספר קווים וטופולוגיה</title>
      <desc>
        השוואה תמציתית של מבנה הקווים והטופולוגיה הפיזית של SPI, I2C, UART, CAN ו-USB 2.0.
      </desc>
      {rows.map((row, i) => (
        <g key={row.name} transform={`translate(0, ${i * 42})`}>
          <rect x="0" y="0" width="70" height="34" rx="4" className="fill-primary/15 stroke-primary/50" />
          <text x="10" y="21" className="fill-foreground text-[11px] font-medium">
            {row.name}
          </text>
          <text x="80" y="14" className="fill-muted-foreground text-[10px]">
            {row.wires}
          </text>
          <text x="80" y="28" className="fill-muted-foreground text-[10px]">
            {row.topo}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function ClockRoutingDiagram({ className }: DiagramProps) {
  return (
    <svg viewBox="0 0 460 220" className={cn('h-auto w-full', className)} role="img">
      <title>עץ שעון עם אורכים תואמים מול אורכים לא תואמים</title>
      <desc>
        חלוקת שעון לכמה עומסים עם אורכי מסלול תואמים (matched) מבטיחה שכולם יקבלו את קצה השעון
        באותו רגע בקירוב. הבדלי אורך גדולים יוצרים סטיית תזמון (skew) בין העומסים.
      </desc>
      <g>
        <text x="10" y="18" className="fill-foreground text-[11px] font-medium">
          אורכים תואמים — סטייה נמוכה
        </text>
        <rect x="10" y="40" width="20" height="16" className="fill-none stroke-primary" strokeWidth="2" />
        <path d="M30 48 h40 v-25 h60 M70 23 v50 h60" className="fill-none stroke-primary" strokeWidth="2" />
        <path d="M70 23 h60" className="fill-none stroke-primary" strokeWidth="2" />
        <rect x="190" y="15" width="18" height="16" className="fill-none stroke-chart-3" strokeWidth="2" />
        <rect x="190" y="65" width="18" height="16" className="fill-none stroke-chart-3" strokeWidth="2" />
      </g>

      <g transform="translate(240,0)">
        <text x="0" y="18" className="fill-foreground text-[11px] font-medium">
          אורכים לא תואמים — סטייה (skew)
        </text>
        <rect x="0" y="40" width="20" height="16" className="fill-none stroke-primary" strokeWidth="2" />
        <path d="M20 48 h20 v-30 h100" className="fill-none stroke-primary" strokeWidth="2" />
        <path d="M20 48 h160" className="fill-none stroke-primary" strokeWidth="2" />
        <rect x="180" y="10" width="18" height="16" className="fill-none stroke-chart-3" strokeWidth="2" />
        <rect x="180" y="65" width="18" height="16" className="fill-none stroke-chart-3" strokeWidth="2" />
        <text x="0" y="100" className="fill-muted-foreground text-[10px]">
          מסלול עליון קצר בהרבה מהתחתון ← קצה השעון מגיע בזמנים שונים
        </text>
      </g>
    </svg>
  )
}
