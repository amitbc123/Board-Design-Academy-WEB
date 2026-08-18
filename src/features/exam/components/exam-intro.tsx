import { GraduationCap } from 'lucide-react'
import type { Chapter } from '@/content/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ExamIntro({
  chapter,
  isRetake,
  onStart,
}: {
  chapter: Chapter
  isRetake: boolean
  onStart: () => void
}) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader className="items-center text-center">
        <GraduationCap className="size-10 text-primary" aria-hidden="true" />
        <CardTitle className="text-xl">מבחן: {chapter.title}</CardTitle>
        <CardDescription>
          {chapter.examQuestions.length} שאלות אמריקאיות, פידבק מיידי אחרי כל שאלה, וציון סופי בתום המבחן.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <Button size="lg" onClick={onStart}>
          {isRetake ? 'ביצוע מבחן חוזר' : 'התחלת המבחן'}
        </Button>
      </CardContent>
    </Card>
  )
}
