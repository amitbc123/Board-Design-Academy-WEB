import type { Lesson } from '../engine/types'
import { UNITS } from '../data/units'
import { PRACTICAL } from '../data/lessons'
import { useBeginnerProgress } from '@/providers/beginner-progress-provider'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

export function LessonSheet({
  lesson,
  open,
  onOpenChange,
  onStart,
  onSkip,
}: {
  lesson: Lesson | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStart: () => void
  onSkip: () => void
}) {
  const progress = useBeginnerProgress()
  if (!lesson) return null

  const done = progress.isLessonDone(lesson.id)
  const skipped = progress.isLessonSkipped(lesson.id)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[86vh] w-full max-w-[560px] gap-0 overflow-y-auto rounded-t-2xl border-x px-5 pb-6 pt-2">
        <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-border" />
        <SheetHeader className="gap-1 p-0">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-primary">
            Unit {lesson.u} · {UNITS[lesson.u]} · Stage {lesson.pos} of {PRACTICAL.length}
          </span>
          <SheetTitle className="text-[20px] font-extrabold tracking-tight">{lesson.t}</SheetTitle>
          <SheetDescription className="text-[14px] leading-relaxed">{lesson.d}</SheetDescription>
        </SheetHeader>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {(lesson.tags ?? []).map((tag, i) => (
            <Badge key={tag} variant={i === 0 ? 'default' : i === 1 ? 'secondary' : 'outline'} className="font-mono text-[9.5px] font-bold uppercase tracking-wide">
              {tag}
            </Badge>
          ))}
          <Badge variant="outline" className="font-mono text-[9.5px] font-bold uppercase tracking-wide text-primary">
            {lesson.xp} XP
          </Badge>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-[15px] font-bold text-primary-foreground shadow-[0_3px_0_color-mix(in_srgb,var(--primary)_55%,#000)] transition-transform active:translate-y-0.5"
        >
          {done ? 'שחק שוב' : 'התחל שלב'}
        </button>

        {!done && (
          <button type="button" onClick={onSkip} className="mt-2 w-full rounded-xl border px-4 py-3 text-[14px] font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground">
            אני יודע את זה — דלג
          </button>
        )}

        {done && (
          <p className="mt-3 text-center text-[12.5px] text-muted-foreground">
            {skipped ? 'סומן כידוע כבר. שיחזור לא מזכה ב-XP.' : 'הושלם כבר — שיחזור לא יזכה ב-XP נוסף.'}
          </p>
        )}
      </SheetContent>
    </Sheet>
  )
}
