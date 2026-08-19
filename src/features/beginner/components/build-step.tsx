import { useState } from 'react'
import type { Lesson } from '../engine/types'
import { useSchematic } from '../state/use-schematic'
import { ComponentTray } from './component-tray'
import { SchematicCanvas } from './schematic-canvas'
import { Scope } from './scope'
import { VerdictList } from './verdict-list'
import { BigReadouts, DatasheetPanel, MetersPanel, NetsTable, ValueQuickPicker } from './schematic-panels'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDownIcon, RotateCwIcon, Undo2Icon, RefreshCwIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BuildStep({ lesson, onPassed }: { lesson: Lesson; onPassed: () => void }) {
  const ui = useSchematic(lesson)
  const { state, dispatch, verdicts } = ui
  const [checked, setChecked] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const allOk = verdicts.length > 0 && verdicts.every((v) => v.s === 'ok')

  const handleVerify = () => {
    setChecked(true)
    if (allOk) onPassed()
  }

  const selected = state.sel ? state.comps.find((c) => c.id === state.sel) : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2.5 rounded-xl border bg-muted/30 px-4 py-3 text-[14.5px]">
        <b className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wide text-primary">מטרה</b>
        <span>{lesson.goal}</span>
      </div>

      <BigReadouts lesson={lesson} ui={ui} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[212px_minmax(0,1fr)_300px]">
        <div className="order-2 flex flex-col gap-3 lg:order-1">
          <Panel title="רכיבים">
            <ComponentTray palette={lesson.palette ?? []} placing={state.placing} onPick={(k) => dispatch({ type: 'START_PLACING', kind: k })} />
            <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
              <b className="text-foreground/80">הצבה</b> — הקש על רכיב, ואז על הלוח.
              <br />
              <b className="text-foreground/80">הזזה</b> — גרור אותו.
              <br />
              <b className="text-foreground/80">חיווט</b> — הקש על פין, ואז על פין אחר.
              <br />
              <b className="text-foreground/80">כפתור</b> — הקש עליו כדי להפעיל/לכבות.
            </p>
          </Panel>
        </div>

        <div className="order-1 overflow-hidden rounded-xl border bg-[#0B1524] lg:order-2">
          <div className="flex flex-wrap items-center gap-1.5 border-b bg-[#101c30] px-2.5 py-2">
            <ToolButton onClick={() => selected && dispatch({ type: 'ROTATE', id: selected.id })} disabled={!selected} icon={RotateCwIcon} label="סבב" />
            <ToolButton onClick={() => dispatch({ type: 'UNDO_WIRE' })} disabled={!state.wires.length} icon={Undo2Icon} label="בטל חוט" />
            <ToolButton onClick={() => dispatch({ type: 'RESET', preset: lesson.preset })} icon={RefreshCwIcon} label="איפוס" />
            <span className="flex-1" />
            <span className="font-mono text-[10.5px] font-bold text-[#E8A33D]">
              {state.placing ? 'TAP CANVAS' : state.pinSel ? 'TAP SECOND PIN' : ''}
            </span>
            <button
              type="button"
              onClick={handleVerify}
              className="rounded-md bg-primary px-3 py-1.5 font-mono text-[10.5px] font-bold text-primary-foreground hover:opacity-90"
            >
              אמת מעגל
            </button>
          </div>
          <ValueQuickPicker ui={ui} />
          <SchematicCanvas ui={ui} />
        </div>

        <div className="order-3 flex flex-col gap-3">
          <Panel title={lesson.transient ? 'אוסילוסקופ · מול זמן' : 'אוסילוסקופ · סריקת DC'} noPad>
            <Scope lesson={lesson} ui={ui} />
          </Panel>
          <Panel title="בדיקת כללים חשמליים (ERC)">
            <VerdictList verdicts={checked ? verdicts : []} emptyLabel="עדיין לא נבדק." />
          </Panel>
        </div>
      </div>

      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2.5 font-mono text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground hover:border-primary hover:text-foreground">
          פרטים — רכיב נבחר, Netlist, מדידות
          <ChevronDownIcon className={cn('size-3.5 transition-transform', detailsOpen && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {selected?.part && (
            <Panel title={selected.id}>
              <DatasheetPanel ui={ui} />
            </Panel>
          )}
          <Panel title="מדידה">
            <MetersPanel ui={ui} />
          </Panel>
          <Panel title="Netlist">
            <NetsTable ui={ui} />
          </Panel>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function Panel({ title, children, noPad }: { title: string; children: React.ReactNode; noPad?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b bg-muted/30 px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className={noPad ? '' : 'p-3.5'}>{children}</div>
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
      className="flex items-center gap-1.5 rounded-md border border-[#2A3F5F] px-2.5 py-1.5 font-mono text-[10.5px] font-semibold text-[#9FC0DE] transition-colors hover:not-disabled:border-primary hover:not-disabled:text-white disabled:opacity-35"
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  )
}
