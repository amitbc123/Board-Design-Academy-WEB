import { useState } from 'react'
import type { QuizQuestion } from '../engine/types'
import { RichText } from './rich-text'
import { cn } from '@/lib/utils'

interface QuizRunState {
  i: number
  sel: number | null
  answered: boolean
  right: number
}

const PASS_RATIO = 0.6

export function QuizStep({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[]
  onComplete: (result: { right: number; total: number }) => void
}) {
  const [run, setRun] = useState<QuizRunState>({ i: 0, sel: null, answered: false, right: 0 })
  const q = questions[run.i]
  const last = run.i === questions.length - 1
  const passed = run.right / questions.length >= PASS_RATIO

  const choose = (i: number) => {
    if (run.answered) return
    setRun((r) => ({ ...r, sel: i, answered: true, right: i === q.a ? r.right + 1 : r.right }))
  }

  const advance = () => {
    if (!run.answered) return
    if (!last) {
      setRun((r) => ({ i: r.i + 1, sel: null, answered: false, right: r.right }))
      return
    }
    if (passed) onComplete({ right: run.right, total: questions.length })
    else setRun({ i: 0, sel: null, answered: false, right: 0 })
  }

  return (
    <div className="mx-auto flex max-w-[60ch] flex-col gap-4">
      <div className="flex gap-1">
        {questions.map((_, i) => (
          <div key={i} className={cn('h-1 flex-1 rounded-full', i < run.i || (i === run.i && run.answered) ? 'bg-primary' : 'bg-muted')} />
        ))}
      </div>
      <div>
        <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-primary">
          Question {run.i + 1} of {questions.length}
        </div>
        <RichText as="div" html={q.q} className="mb-4 mt-1.5 text-[18px] font-bold leading-snug tracking-tight [&_code]:font-mono [&_code]:text-[16px] [&_code]:text-primary" />
      </div>
      <div className="flex flex-col gap-2.5">
        {q.o.map((opt, i) => {
          const isAnswer = i === q.a
          const isSel = i === run.sel
          const state = !run.answered ? 'idle' : isAnswer ? 'right' : isSel ? 'wrong' : 'idle'
          return (
            <button
              key={i}
              type="button"
              disabled={run.answered}
              onClick={() => choose(i)}
              className={cn(
                'rounded-xl border-[1.5px] px-4 py-3.5 text-start text-[14.5px] leading-snug transition-colors',
                state === 'idle' && 'border-border hover:not-disabled:border-primary hover:not-disabled:bg-muted/40',
                state === 'right' && 'border-success bg-success/10',
                state === 'wrong' && 'border-destructive bg-destructive/10',
              )}
            >
              <RichText html={opt} />
            </button>
          )
        })}
      </div>

      {run.answered && (
        <div className={cn('rounded-xl border px-4 py-3.5 text-[13.5px] leading-relaxed', run.sel === q.a ? 'border-success/35 bg-success/8' : 'border-destructive/35 bg-destructive/8')}>
          <b className={cn('mb-1 block', run.sel === q.a ? 'text-success' : 'text-destructive')}>{run.sel === q.a ? 'Correct' : 'Not quite'}</b>
          <RichText html={q.e} />
        </div>
      )}

      {run.answered && last && (
        <div className={cn('rounded-xl border px-4 py-3.5 text-[13.5px]', passed ? 'border-success/35 bg-success/8' : 'border-destructive/35 bg-destructive/8')}>
          <b className={passed ? 'text-success' : 'text-destructive'}>
            {run.right} of {questions.length} correct
          </b>
          <p className="mt-1 text-muted-foreground">
            {passed ? 'You have the concept. Move on.' : 'You need at least 60% to clear this stage. Read the explanations above — they contain the answers — then run it again.'}
          </p>
        </div>
      )}

      {run.answered && (
        <button
          type="button"
          onClick={advance}
          className="w-full rounded-xl bg-primary px-4 py-3 text-[15px] font-bold text-primary-foreground shadow-[0_3px_0_color-mix(in_srgb,var(--primary)_55%,#000)] transition-transform active:translate-y-0.5"
        >
          {last ? (passed ? 'Finish stage' : 'Try again') : 'Next question'}
        </button>
      )}
    </div>
  )
}
