import { useMemo } from 'react'
import type { UsePcbResult } from '../state/use-pcb'
import { gerber } from '../engine/gerber'

export function GerberStep({ ui, onFinish }: { ui: UsePcbResult; onFinish: () => void }) {
  const { pcb, board } = ui
  const text = useMemo(() => gerber(pcb, board), [pcb, board])
  const lines = text.split('\n').length

  return (
    <div className="mx-auto flex max-w-[74ch] flex-col gap-4">
      <div className="rounded-xl border bg-muted/30 px-5 py-4 text-[14px] leading-relaxed text-muted-foreground">
        <h3 className="mb-2.5 text-[17px] font-extrabold tracking-tight text-foreground">זה מה שהמפעל מקבל</h3>
        <p className="mb-2.5">
          הלוח שלך הוא עכשיו <b className="text-foreground">RS-274X</b> — הפורמט שכל מפעל PCB בעולם מקבל. זה טקסט רגיל.{' '}
          <code className="font-mono text-[12.5px] font-semibold text-primary">%ADD10R,1.000X1.350*%</code> מגדיר aperture 10 כמלבן 1 × 1.35 mm, שזה
          ה-pad של 0805 שלך. <code className="font-mono text-[12.5px] font-semibold text-primary">D03</code> מבליץ (flashes) אותו בקואורדינטה.{' '}
          <code className="font-mono text-[12.5px] font-semibold text-primary">D02</code> זז בלי לצייר,{' '}
          <code className="font-mono text-[12.5px] font-semibold text-primary">D01</code> מצייר קו — זו מסילה.
        </p>
        <p>
          <code className="font-mono text-[12.5px] font-semibold text-primary">%FSLAX36Y36*%</code> אומר שהקואורדינטות נושאות 3 ספרות שלמות ו-6
          עשרוניות, אז <code className="font-mono text-[12.5px] font-semibold text-primary">X5000000</code> פירושו 5.000000 מ&quot;מ. עבודה אמיתית
          צריכה גם את השכבות האחרות — soldermask, silkscreen, paste, וקובץ Excellon לחירור — בתוספת הערת stackup. אבל הקובץ הזה בלבד הוא הנחושת
          שציירת.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between border-b bg-muted/30 px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <span>
            {board.layer} · {lines} lines
          </span>
          <span className="normal-case tracking-normal">{pcb.traces.length} traces</span>
        </div>
        <pre className="max-h-[340px] overflow-auto whitespace-pre p-3.5 font-mono text-[11px] leading-relaxed">{text}</pre>
      </div>
      <button type="button" onClick={onFinish} className="w-full max-w-[290px] self-start rounded-xl bg-primary px-4 py-3 text-[15px] font-bold text-primary-foreground shadow-[0_3px_0_color-mix(in_srgb,var(--primary)_55%,#000)] transition-transform active:translate-y-0.5">
        סיום השלב
      </button>
    </div>
  )
}
