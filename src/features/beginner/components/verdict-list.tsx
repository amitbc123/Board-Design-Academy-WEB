import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import type { Verdict } from '../engine/types'
import { RichText } from './rich-text'
import { cn } from '@/lib/utils'

const SEVERITY = {
  ok: {
    icon: CheckCircle2,
    border: 'border-success/35',
    bg: 'bg-success/8',
    text: 'text-success',
  },
  warn: {
    icon: AlertTriangle,
    border: 'border-amber-500/35',
    bg: 'bg-amber-500/8',
    text: 'text-amber-600 dark:text-amber-400',
  },
  bad: {
    icon: XCircle,
    border: 'border-destructive/35',
    bg: 'bg-destructive/8',
    text: 'text-destructive',
  },
} as const

/**
 * Renders a lesson's verdicts — schematic ERC or PCB DRC alike. Every check
 * in this app returns four fields and they're all required: what is wrong,
 * why it is wrong, the engineering principle, and the fix. Never a bare
 * pass/fail.
 */
export function VerdictList({ verdicts, emptyLabel }: { verdicts: Verdict[]; emptyLabel: string }) {
  if (!verdicts.length) {
    return <p className="text-sm italic text-muted-foreground">{emptyLabel}</p>
  }
  return (
    <div className="flex flex-col gap-2.5">
      {verdicts.map((v, i) => {
        const cfg = SEVERITY[v.s]
        const Icon = cfg.icon
        return (
          <div key={i} className={cn('rounded-lg border px-3.5 py-3 text-sm', cfg.border, cfg.bg)}>
            <div className={cn('flex items-center gap-2 font-semibold', cfg.text)}>
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <RichText html={v.t} />
            </div>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px] leading-relaxed">
              <dt className="pt-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">מה</dt>
              <dd className="text-foreground/90">
                <RichText html={v.what} />
              </dd>
              <dt className="pt-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">למה</dt>
              <dd className="text-foreground/90">
                <RichText html={v.why} />
              </dd>
              <dt className="pt-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">העקרון</dt>
              <dd className="text-foreground/90">
                <RichText html={v.prin} />
              </dd>
              <dt className="pt-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">הפתרון</dt>
              <dd className="text-foreground/90">
                <RichText html={v.fix} />
              </dd>
            </dl>
          </div>
        )
      })}
    </div>
  )
}
