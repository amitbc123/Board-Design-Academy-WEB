import { useState } from 'react'
import type { Lesson } from '../engine/types'
import type { UsePcbResult } from '../state/use-pcb'
import { PcbCanvas } from './pcb-canvas'
import { WidthPicker, PcbReadouts, BoardInfoPanel } from './pcb-panels'
import { VerdictList } from './verdict-list'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDownIcon, Undo2Icon, XIcon, RefreshCwIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PcbStep({ lesson, ui, onPassed }: { lesson: Lesson; ui: UsePcbResult; onPassed: () => void }) {
  const { pcb, dispatch, drc } = ui
  const [checked, setChecked] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const allOk = drc.length > 0 && drc.every((v) => v.s === 'ok')

  const handleDrc = () => {
    setChecked(true)
    if (allOk) onPassed()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2.5 rounded-xl border bg-muted/30 px-4 py-3 text-[14.5px]">
        <b className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wide text-primary">מטרה</b>
        <span>{lesson.goal}</span>
      </div>

      <PcbReadouts ui={ui} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[212px_minmax(0,1fr)_300px]">
        <div className="order-2 flex flex-col gap-3 lg:order-1">
          <Panel title="רוחב מסילה">
            <WidthPicker ui={ui} />
            <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
              <b className="text-foreground/80">הצבה</b> — גרור footprint.
              <br />
              <b className="text-foreground/80">ניתוב</b> — הקש על pad, הקש על פינות, הקש על ה-pad המתאים.
              <br />
              צהוב = <b className="text-foreground/80">ratsnest</b>: חיבורים שהסכמה דורשת אבל שום נחושת עדיין לא מספקת.
            </p>
          </Panel>
        </div>

        <div className="order-1 overflow-hidden rounded-xl border lg:order-2">
          <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/40 px-2.5 py-2">
            <ToolButton onClick={() => dispatch({ type: 'UNDO_TRACE' })} disabled={!pcb.traces.length} icon={Undo2Icon} label="בטל מסילה" />
            <ToolButton onClick={() => dispatch({ type: 'CANCEL_ROUTE' })} disabled={!pcb.routing} icon={XIcon} label="בטל ניתוב" />
            <ToolButton onClick={() => dispatch({ type: 'RESET' })} icon={RefreshCwIcon} label="איפוס" />
            <span className="flex-1" />
            <span className="font-mono text-[10.5px] font-bold text-primary">{pcb.routing ? `ROUTING ${pcb.routing.net}` : ''}</span>
            <button type="button" onClick={handleDrc} className="rounded-md bg-primary px-3 py-1.5 font-mono text-[10.5px] font-bold text-primary-foreground hover:opacity-90">
              הרץ DRC
            </button>
          </div>
          <PcbCanvas ui={ui} />
        </div>

        <div className="order-3 flex flex-col gap-3">
          <Panel title="בדיקת כללי תכן (DRC)">
            <VerdictList verdicts={checked ? drc : []} emptyLabel="עדיין לא נבדק." />
          </Panel>
        </div>
      </div>

      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2.5 font-mono text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground hover:border-primary hover:text-foreground">
          פרטים — נתוני הלוח
          <ChevronDownIcon className={cn('size-3.5 transition-transform', detailsOpen && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <Panel title="לוח">
            <BoardInfoPanel ui={ui} />
          </Panel>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b bg-muted/30 px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="p-3.5">{children}</div>
    </div>
  )
}

function ToolButton({
  onClick,
  disabled,
  icon: Icon,
  label,
}: {
  onClick: () => void
  disabled?: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[10.5px] font-semibold text-muted-foreground transition-colors hover:not-disabled:border-primary hover:not-disabled:text-foreground disabled:opacity-35"
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  )
}
