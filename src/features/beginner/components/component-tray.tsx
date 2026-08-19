import type { ComponentType } from '../engine/types'
import { LIB } from '../data/symbols'
import { PARTS } from '../data/parts'
import { SchematicSymbol } from './schematic-symbol'
import { cn } from '@/lib/utils'

/**
 * Placement palette — tap a component here, then tap the canvas. Mirrors the
 * lesson's `palette` list; the small preview uses each part's first catalog
 * entry so a beginner sees exactly which chip they're about to place.
 */
export function ComponentTray({
  palette,
  placing,
  onPick,
}: {
  palette: ComponentType[]
  placing: ComponentType | null
  onPick: (kind: ComponentType) => void
}) {
  return (
    <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:flex-nowrap">
      {palette.map((kind) => {
        const def = LIB[kind]
        const part0 = def.db ? PARTS[def.db][0] : null
        const active = placing === kind
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onPick(kind)}
            className={cn(
              'flex min-w-0 flex-1 basis-[44%] items-center gap-2.5 rounded-lg border px-2.5 py-2 text-start transition-colors lg:basis-auto',
              active ? 'border-primary shadow-[inset_0_0_0_1px_var(--primary)]' : 'border-border hover:border-primary/60',
            )}
          >
            <svg viewBox="-52 -26 104 52" width={40} height={20} className="shrink-0">
              <SchematicSymbol type={kind} part={part0 ?? undefined} />
            </svg>
            <div className="min-w-0">
              <div className="truncate font-mono text-[11.5px] font-bold">{def.label}</div>
              <div className="truncate text-[10px] text-muted-foreground">{part0?.mfr ?? ''}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
