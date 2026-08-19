import type { Lesson } from '../engine/types'
import { CheckIcon } from 'lucide-react'

export function CompleteOverlay({
  lesson,
  firstTime,
  quizResult,
  nextLesson,
  onContinue,
  onBackToPath,
  onClose,
}: {
  lesson: Lesson
  firstTime: boolean
  quizResult: { right: number; total: number } | null
  nextLesson: Lesson | null
  onContinue: () => void
  onBackToPath: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1.5 bg-background/98 p-8 text-center backdrop-blur-sm" role="dialog" aria-modal="true">
      <button type="button" onClick={onClose} aria-label="סגירה" className="absolute end-4 top-4 grid size-8 place-items-center rounded-lg border text-muted-foreground hover:text-foreground">
        ✕
      </button>
      <div className="grid size-16 place-items-center rounded-full bg-success/15 text-success">
        <CheckIcon className="size-9" strokeWidth={2.5} />
      </div>
      <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight">{firstTime ? 'השלב הושלם' : 'השלב שוחזר'}</h2>
      <p className="max-w-[36ch] text-[14px] text-muted-foreground">
        {quizResult && `${quizResult.right} מתוך ${quizResult.total} תשובות נכונות. `}
        {nextLesson ? `הבא בתור: ${nextLesson.t}.` : 'הגעת לסוף השלבים הבנויים.'}
      </p>
      <div className="my-5 font-mono text-[15px] font-extrabold text-primary">{firstTime ? `+${lesson.xp} XP` : 'כבר הושג'}</div>
      <button
        type="button"
        onClick={onContinue}
        className="w-full max-w-[290px] rounded-xl bg-primary px-4 py-3 text-[15px] font-bold text-primary-foreground shadow-[0_3px_0_color-mix(in_srgb,var(--primary)_55%,#000)] transition-transform active:translate-y-0.5"
      >
        להמשיך
      </button>
      <button type="button" onClick={onBackToPath} className="w-full max-w-[290px] rounded-xl border px-4 py-3 text-[14px] font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground">
        חזרה למסלול
      </button>
    </div>
  )
}
