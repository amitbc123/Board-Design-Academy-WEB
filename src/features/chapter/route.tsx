import { Link, useParams } from 'react-router'
import { CheckCircle2, GraduationCap, History } from 'lucide-react'
import { getChapter } from '@/content'
import { useProgress } from '@/providers/progress-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ExamHistorySheet } from '@/features/exam/components/exam-history-sheet'

export function Component() {
  const { chapterId } = useParams()
  const chapter = chapterId ? getChapter(chapterId) : undefined
  const { isTopicComplete, isChapterUnlocked, latestExamAttempt } = useProgress()

  if (!chapter) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">הפרק המבוקש לא נמצא.</p>
        <Button asChild>
          <Link to="/">חזרה לדף הבית</Link>
        </Button>
      </div>
    )
  }

  if (!isChapterUnlocked(chapter.id)) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">
          פרק זה נעול. ניתן לפתוח אותו מדף הבית, או להשלים את הפרק הקודם.
        </p>
        <Button asChild>
          <Link to="/">חזרה לדף הבית</Link>
        </Button>
      </div>
    )
  }

  const topics = [...chapter.topics].sort((a, b) => a.order - b.order)
  const latestExam = latestExamAttempt(chapter.id)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">פרק {chapter.order}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{chapter.title}</h1>
        <p className="mt-2 max-w-[65ch] text-muted-foreground">{chapter.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link to={`/chapters/${chapter.id}/exam`} className="gap-1.5">
            <GraduationCap className="size-4" aria-hidden="true" />
            {latestExam ? 'ביצוע מבחן חוזר' : 'התחלת מבחן הפרק'}
          </Link>
        </Button>
        {latestExam && (
          <span className="text-sm text-muted-foreground">
            ציון אחרון: {latestExam.score}/{latestExam.totalQuestions}
          </span>
        )}
        <ExamHistorySheet chapterId={chapter.id} chapterTitle={chapter.title}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <History className="size-4" aria-hidden="true" />
            היסטוריית מבחנים
          </Button>
        </ExamHistorySheet>
      </div>

      <ul className="flex flex-col gap-2">
        {topics.map((topic) => {
          const completed = isTopicComplete(topic.id)
          return (
            <li key={topic.id}>
              <Link to={`/chapters/${chapter.id}/topics/${topic.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="flex items-center gap-3 py-4">
                    {completed ? (
                      <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <span className="size-5 shrink-0 rounded-full border-2 border-muted-foreground/30" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1 truncate font-medium">{topic.title}</span>
                    {topic.isInterviewTopic && (
                      <Badge variant="interview" className="shrink-0">
                        שאלת ריאיון
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
