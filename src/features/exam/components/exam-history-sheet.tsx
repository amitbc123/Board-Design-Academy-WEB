import type { ReactNode } from 'react'
import { useProgress } from '@/providers/progress-provider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ExamHistorySheet({
  chapterId,
  chapterTitle,
  children,
}: {
  chapterId: string
  chapterTitle: string
  children: ReactNode
}) {
  const { examHistoryForChapter } = useProgress()
  const history = examHistoryForChapter(chapterId)

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-5/6 max-w-sm">
        <SheetHeader className="border-b">
          <SheetTitle>היסטוריית מבחנים — {chapterTitle}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">עדיין לא בוצעו מבחנים בפרק זה.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.map((attempt) => (
                <li key={attempt.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{formatDate(attempt.takenAt)}</span>
                  <span className="font-medium tabular-nums">
                    {attempt.score}/{attempt.totalQuestions}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
