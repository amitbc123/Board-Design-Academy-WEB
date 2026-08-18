import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getAdjacentTopics } from '@/content'
import { Button } from '@/components/ui/button'

export function TopicPagination({ chapterId, topicId }: { chapterId: string; topicId: string }) {
  const { previous, next } = getAdjacentTopics(chapterId, topicId)

  if (!previous && !next) return null

  return (
    <div className="flex items-center justify-between gap-3 border-t pt-6">
      {previous ? (
        <Button asChild variant="outline">
          <Link to={`/chapters/${previous.chapter.id}/topics/${previous.topic.id}`} className="gap-1.5">
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="truncate">{previous.topic.title}</span>
          </Link>
        </Button>
      ) : (
        <span />
      )}
      {next ? (
        <Button asChild variant="outline">
          <Link to={`/chapters/${next.chapter.id}/topics/${next.topic.id}`} className="gap-1.5">
            <span className="truncate">{next.topic.title}</span>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <span />
      )}
    </div>
  )
}
