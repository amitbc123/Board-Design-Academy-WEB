import { Link, useParams } from 'react-router'
import { getTopic } from '@/content'
import { Button } from '@/components/ui/button'

export function Component() {
  const { chapterId, topicId } = useParams()
  const topic = chapterId && topicId ? getTopic(chapterId, topicId) : undefined

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-muted-foreground">הנושא המבוקש לא נמצא.</p>
        <Button asChild variant="link" className="px-0">
          <Link to="/">חזרה לדף הבית</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">{topic.title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">מסך הנושא המלא ייבנה בהמשך.</p>
    </div>
  )
}
