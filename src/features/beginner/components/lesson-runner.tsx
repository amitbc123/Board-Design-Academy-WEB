import { useState } from 'react'
import { ArrowRightIcon } from 'lucide-react'
import type { Lesson } from '../engine/types'
import type { RevTipContext } from '../data/rev-tips'
import { PRACTICAL, lessonById } from '../data/lessons'
import { useSchematic } from '../state/use-schematic'
import { usePcb } from '../state/use-pcb'
import { useBeginnerProgress } from '@/providers/beginner-progress-provider'
import { ConceptStep } from './concept-step'
import { QuizStep } from './quiz-step'
import { BuildStep } from './build-step'
import { PcbStep } from './pcb-step'
import { GerberStep } from './gerber-step'
import { CompleteOverlay } from './complete-overlay'
import { RevBot } from './rev-bot'
import { cn } from '@/lib/utils'

type StepKey = 'concept' | 'quiz' | 'build' | 'pcb' | 'gerber'

function stepsFor(lesson: Lesson): { k: StepKey; n: string }[] {
  const st: { k: StepKey; n: string }[] = []
  if (lesson.concept) st.push({ k: 'concept', n: 'עקרון' })
  if (lesson.mode === 'quiz') st.push({ k: 'quiz', n: 'שאלות' })
  if (lesson.mode === 'build') st.push({ k: 'build', n: 'בנייה' })
  if (lesson.mode === 'build' && lesson.pcb) st.push({ k: 'pcb', n: 'פריסת PCB' })
  if (lesson.mode === 'pcbonly') st.push({ k: 'pcb', n: 'פריסת PCB' })
  if (lesson.pcb || lesson.mode === 'pcbonly') st.push({ k: 'gerber', n: 'Gerber' })
  return st
}

export function LessonRunner({ lessonId, onBack, onOpenLesson }: { lessonId: number; onBack: () => void; onOpenLesson: (id: number) => void }) {
  const lesson = lessonById(lessonId)
  const progress = useBeginnerProgress()
  const [stepIndex, setStepIndex] = useState(0)
  const [passed, setPassed] = useState<Partial<Record<StepKey, boolean>>>({})
  const [quizResult, setQuizResult] = useState<{ right: number; total: number } | null>(null)
  const [showComplete, setShowComplete] = useState(false)
  const [firstTime, setFirstTime] = useState(true)

  const schematic = useSchematic(lesson ?? PRACTICAL[0])
  const pcbUi = usePcb(lesson?.pcbLesson ?? 'led', schematic.state.comps, schematic.sim)

  if (!lesson) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">השלב המבוקש לא נמצא.</p>
        <button type="button" onClick={onBack} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          חזרה למסלול
        </button>
      </div>
    )
  }

  const steps = stepsFor(lesson)
  const current = steps[stepIndex]
  const nextInTrail = (() => {
    const idx = PRACTICAL.findIndex((l) => l.id === lesson.id)
    return idx >= 0 ? (PRACTICAL[idx + 1] ?? null) : null
  })()

  const finishLesson = async () => {
    const result = await progress.completeLesson(lesson.id, lesson.xp)
    setFirstTime(result.firstTime)
    setShowComplete(true)
  }

  const advanceOrFinish = (key: StepKey) => {
    setPassed((p) => ({ ...p, [key]: true }))
    const nextIdx = steps.findIndex((s) => s.k === key) + 1
    if (nextIdx < steps.length) setStepIndex(nextIdx)
    else void finishLesson()
  }

  const revContext: RevTipContext = current?.k === 'quiz' ? 'quiz' : current?.k === 'pcb' ? 'pcb' : current?.k === 'gerber' ? 'gerber' : 'build'

  return (
    <div className="mx-auto flex max-w-[1220px] flex-col gap-4">
      <div className="flex items-center gap-3 border-b pb-3">
        <button type="button" onClick={onBack} aria-label="חזרה למסלול" className="grid size-9 shrink-0 place-items-center rounded-lg border transition-colors hover:border-primary">
          <ArrowRightIcon className="size-4" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold">{lesson.t}</h1>
        <span className="shrink-0 font-mono text-xs font-bold text-primary">{lesson.xp} XP</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {steps.map((s, i) => {
          const locked = (s.k === 'pcb' && lesson.mode === 'build' && !passed.build) || (s.k === 'gerber' && !passed.pcb)
          const done = !!passed[s.k]
          return (
            <button
              key={s.k}
              type="button"
              disabled={locked}
              onClick={() => setStepIndex(i)}
              className={cn(
                'rounded-md px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                i === stepIndex ? 'bg-muted text-foreground' : done ? 'text-success' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {done ? '✓ ' : ''}
              {s.n}
            </button>
          )
        })}
      </div>

      <div>
        {current?.k === 'concept' && lesson.concept && <ConceptStep concept={lesson.concept} onContinue={() => advanceOrFinish('concept')} />}
        {current?.k === 'quiz' && lesson.quiz && (
          <QuizStep
            questions={lesson.quiz}
            onComplete={(result) => {
              setQuizResult(result)
              advanceOrFinish('quiz')
            }}
          />
        )}
        {current?.k === 'build' && <BuildStep key={lesson.id} lesson={lesson} onPassed={() => advanceOrFinish('build')} />}
        {current?.k === 'pcb' && <PcbStep lesson={lesson} ui={pcbUi} onPassed={() => advanceOrFinish('pcb')} />}
        {current?.k === 'gerber' && <GerberStep ui={pcbUi} onFinish={() => advanceOrFinish('gerber')} />}
      </div>

      <RevBot context={revContext} unit={lesson.u} />

      {showComplete && (
        <CompleteOverlay
          lesson={lesson}
          firstTime={firstTime}
          quizResult={quizResult}
          nextLesson={nextInTrail}
          onClose={() => setShowComplete(false)}
          onBackToPath={onBack}
          onContinue={() => {
            setShowComplete(false)
            if (nextInTrail) {
              onOpenLesson(nextInTrail.id)
              setStepIndex(0)
              setPassed({})
              setQuizResult(null)
            } else {
              onBack()
            }
          }}
        />
      )}
    </div>
  )
}
