import { Link } from 'react-router'
import { Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ExamResultScreen({
  chapterId,
  chapterTitle,
  score,
  total,
  onRetake,
}: {
  chapterId: string
  chapterTitle: string
  score: number
  total: number
  onRetake: () => void
}) {
  const percent = total === 0 ? 0 : Math.round((score / total) * 100)

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader className="items-center text-center">
        <Award className="size-10 text-primary" aria-hidden="true" />
        <CardTitle className="text-xl">סיימתם את המבחן: {chapterTitle}</CardTitle>
        <CardDescription>
          ציון: {score}/{total} ({percent}%)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onRetake}>ביצוע מבחן חוזר</Button>
        <Button asChild variant="outline">
          <Link to={`/chapters/${chapterId}`}>חזרה לפרק</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
