import { Link, useParams } from 'react-router'
import { getChapter } from '@/content'
import { Button } from '@/components/ui/button'

export function Component() {
  const { chapterId } = useParams()
  const chapter = chapterId ? getChapter(chapterId) : undefined

  if (!chapter) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-muted-foreground">הפרק המבוקש לא נמצא.</p>
        <Button asChild variant="link" className="px-0">
          <Link to="/">חזרה לדף הבית</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">
        {chapter.order}. {chapter.title}
      </h1>
      <p className="mt-2 text-muted-foreground">{chapter.description}</p>
      <p className="mt-6 text-sm text-muted-foreground">רשימת הנושאים תתווסף בהמשך הבנייה.</p>
    </div>
  )
}
