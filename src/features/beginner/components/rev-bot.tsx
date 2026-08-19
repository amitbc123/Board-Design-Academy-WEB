import { useEffect, useRef, useState } from 'react'
import type { RevTipContext } from '../data/rev-tips'
import { REV_TIPS } from '../data/rev-tips'
import { QUESTION_BANK } from '../data/lessons'
import { useBeginnerProgress } from '@/providers/beginner-progress-provider'
import { RichText } from './rich-text'
import { cn } from '@/lib/utils'

type Bubble = { kind: 'tip'; key: RevTipContext; i: number } | { kind: 'question'; index: number } | { kind: 'answered'; index: number; correct: boolean } | null

/** Rev, the tip robot in the corner — stays quiet until asked, except once on a first visit. */
export function RevBot({ context, unit }: { context: RevTipContext; unit: number }) {
  const progress = useBeginnerProgress()
  const [bubble, setBubble] = useState<Bubble>(null)
  const [turn, setTurn] = useState(0)
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shownFirstVisit = useRef(false)

  useEffect(() => {
    if (progress.loading || shownFirstVisit.current) return
    shownFirstVisit.current = true
    if (progress.completedCount > 0 || progress.hasSeenIntro) return
    const t = setTimeout(() => {
      setBubble({ kind: 'tip', key: 'path0', i: 0 })
      void progress.markIntroSeen()
    }, 1100)
    return () => clearTimeout(t)
  }, [progress.loading, progress.completedCount, progress.hasSeenIntro])

  const clearDismiss = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
  }
  const armDismiss = (ms: number) => {
    clearDismiss()
    dismissTimer.current = setTimeout(() => setBubble(null), ms)
  }

  const showTip = () => {
    const list = REV_TIPS[context]
    const next = bubble?.kind === 'tip' && bubble.key === context ? bubble.i + 1 : 0
    setBubble({ kind: 'tip', key: context, i: next % list.length })
    armDismiss(9000)
  }

  const askQuestion = () => {
    if (!QUESTION_BANK.length) return showTip()
    const near = QUESTION_BANK.filter((q) => Math.abs(q.unit - unit) <= 1)
    const pool = near.length > 3 ? near : QUESTION_BANK
    const q = pool[Math.floor(Math.random() * pool.length)]
    const index = QUESTION_BANK.indexOf(q)
    setBubble({ kind: 'question', index })
    clearDismiss()
  }

  const onBotClick = () => {
    const nextTurn = turn + 1
    setTurn(nextTurn)
    if (nextTurn % 3 === 0 && QUESTION_BANK.length) askQuestion()
    else showTip()
  }

  const answer = (index: number, choice: number) => {
    const q = QUESTION_BANK[index]
    const correct = choice === q.a
    void progress.recordQuestionAnswer(correct)
    setBubble({ kind: 'answered', index, correct })
    armDismiss(14000)
  }

  return (
    <div className="fixed bottom-3 end-3 z-30 flex items-end gap-2.5 [padding-bottom:env(safe-area-inset-bottom)]" style={{ maxWidth: 'min(88vw, 392px)' }}>
      {bubble && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (bubble.kind !== 'question') setBubble(null)
          }}
          className="mb-0.5 max-w-[280px] rounded-2xl rounded-be-sm border bg-card px-3.5 py-2.5 text-[12.5px] leading-relaxed shadow-lg"
        >
          {bubble.kind === 'tip' && (
            <>
              <RichText as="div" html={REV_TIPS[bubble.key][bubble.i][0]} className="font-semibold text-primary" />
              <RichText as="div" html={REV_TIPS[bubble.key][bubble.i][1]} className="mt-0.5" />
              <span className="mt-1.5 block font-mono text-[9.5px] uppercase tracking-wide text-muted-foreground">הקש על Rev לעוד · הקש כאן לסגירה</span>
            </>
          )}
          {bubble.kind === 'question' && (
            <QuestionBubble index={bubble.index} onAnswer={(choice) => answer(bubble.index, choice)} />
          )}
          {bubble.kind === 'answered' && (
            <>
              <div className={cn('font-semibold', bubble.correct ? 'text-success' : 'text-destructive')}>{bubble.correct ? 'נכון! ‎+5 XP' : 'לא בדיוק'}</div>
              <div className="mt-1">
                {!bubble.correct && (
                  <b>
                    <RichText html={QUESTION_BANK[bubble.index].o[QUESTION_BANK[bubble.index].a]} />
                    <br />
                  </b>
                )}
                <RichText html={QUESTION_BANK[bubble.index].e} />
              </div>
              <span className="mt-1.5 block font-mono text-[9.5px] uppercase tracking-wide text-muted-foreground">
                {progress.questionsRight}/{progress.questionsAsked} נכון · הקש על Rev לעוד
              </span>
            </>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onBotClick}
        aria-label="טיפ מ-Rev"
        className="grid size-11 shrink-0 place-items-center rounded-full border bg-card text-primary opacity-90 shadow-lg transition-transform hover:-translate-y-0.5 hover:opacity-100 active:scale-95"
      >
        <RevFace />
      </button>
    </div>
  )
}

function QuestionBubble({ index, onAnswer }: { index: number; onAnswer: (choice: number) => void }) {
  const q = QUESTION_BANK[index]
  return (
    <div>
      <div className="font-semibold text-primary">בדיקה מהירה — {q.topic}</div>
      <RichText as="div" html={q.q} className="mt-1.5" />
      <div className="mt-2 flex flex-col gap-1.5">
        {q.o.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAnswer(i)
            }}
            className="rounded-lg border bg-muted/40 px-2.5 py-1.5 text-start text-[11.5px] leading-snug transition-colors hover:border-primary"
          >
            <RichText html={opt} />
          </button>
        ))}
      </div>
    </div>
  )
}

function RevFace() {
  return (
    <svg viewBox="0 0 40 40" className="size-7" aria-hidden="true">
      <line x1={20} y1={6} x2={20} y2={11} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <circle cx={20} cy={4.5} r={2.4} fill="currentColor" />
      <rect x={7} y={11} width={26} height={21} rx={7} fill="var(--muted)" stroke="currentColor" strokeWidth={2} />
      <rect x={11.5} y={16} width={17} height={10} rx={4} fill="currentColor" opacity={0.08} />
      <circle cx={16} cy={21} r={2.6} fill="currentColor" className="animate-[beginner-blink_5.2s_infinite]" style={{ transformOrigin: 'center' }} />
      <circle cx={24} cy={21} r={2.6} fill="currentColor" className="animate-[beginner-blink_5.2s_infinite]" style={{ transformOrigin: 'center' }} />
      <path d="M16.5 27h7" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" opacity={0.45} />
      <path d="M4 19v5M36 19v5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}
