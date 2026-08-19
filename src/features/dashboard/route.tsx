import { Link } from 'react-router'
import { Lock, Route as RouteIcon } from 'lucide-react'
import { getAllChapters } from '@/content'
import { useProgress } from '@/providers/progress-provider'
import { useBeginnerProgress } from '@/providers/beginner-progress-provider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function DashboardRoute() {
  const chapters = getAllChapters()
  const {
    overallCompletionPercent,
    isChapterUnlocked,
    isChapterComplete,
    completedTopicCountForChapter,
    latestExamAttempt,
    unlockChapter,
  } = useProgress()
  const beginnerProgress = useBeginnerProgress()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">אקדמיית תכנון לוחות</h1>
        <p className="mt-1 text-muted-foreground">
          קורס עומק אישי בתכנון PCB במהירות גבוהה — שלמות אות, שלמות הספק, תאימות EMC וסידור פיזי.
        </p>
      </div>

      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <RouteIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">מסלול למתחילים — לומדים הנדסת חומרה בבנייה</h3>
                <Badge variant="outline" className="text-primary">
                  חדש
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                מסלול שלבים מעשי בסגנון Duolingo: תשרטט מעגל, פותר אמיתי יגיד לך מה קורה בפועל, תסדר לוח PCB
                ותנתב אותו. Rev שואל שאלות בדרך.
              </p>
              {beginnerProgress.totalPractical > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <Progress
                    value={(beginnerProgress.completedCount / beginnerProgress.totalPractical) * 100}
                    className="h-2 w-40"
                    aria-label="התקדמות במסלול למתחילים"
                  />
                  <span className="text-xs text-muted-foreground">
                    {beginnerProgress.completedCount}/{beginnerProgress.totalPractical} שלבים
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/beginner">מעבר למסלול</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>התקדמות כוללת בקורס</CardTitle>
          <CardDescription>אחוז הנושאים שסומנו כהושלמו מתוך כלל הקורס</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Progress value={overallCompletionPercent} className="h-3 flex-1" aria-label="התקדמות כוללת" />
          <span className="w-12 shrink-0 text-end text-lg font-semibold tabular-nums">
            {overallCompletionPercent}%
          </span>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">פרקי הקורס</h2>
        {chapters.length === 0 && (
          <p className="text-sm text-muted-foreground">התוכן נמצא בבנייה ויתווסף בקרוב.</p>
        )}
        {chapters.map((chapter) => {
          const unlocked = isChapterUnlocked(chapter.id)
          const completed = completedTopicCountForChapter(chapter.id)
          const total = chapter.topics.length
          const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
          const latestExam = latestExamAttempt(chapter.id)
          const complete = isChapterComplete(chapter.id)

          return (
            <Card key={chapter.id} className={!unlocked ? 'opacity-70' : undefined}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">
                      {chapter.order}. {chapter.title}
                    </h3>
                    {complete && <Badge variant="success">הושלם</Badge>}
                    {!unlocked && (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="size-3" aria-hidden="true" />
                        נעול
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{chapter.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={percent} className="h-2 w-40" aria-label={`התקדמות בפרק ${chapter.title}`} />
                    <span className="text-xs text-muted-foreground">
                      {completed}/{total} נושאים
                    </span>
                  </div>
                  {latestExam && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ציון אחרון במבחן: {latestExam.score}/{latestExam.totalQuestions}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {unlocked ? (
                    <Button asChild>
                      <Link to={`/chapters/${chapter.id}`}>מעבר לפרק</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => unlockChapter(chapter.id)}>
                      דילוג קדימה ופתיחה
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
