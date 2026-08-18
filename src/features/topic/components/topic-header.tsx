import { Link } from 'react-router'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import type { Chapter, Topic } from '@/content/types'
import { useProgress } from '@/providers/progress-provider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function TopicHeader({ chapter, topic }: { chapter: Chapter; topic: Topic }) {
  const { isTopicComplete, setTopicComplete } = useProgress()
  const completed = isTopicComplete(topic.id)

  return (
    <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="פירורי לחם" className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
        <Link to={`/chapters/${chapter.id}`} className="truncate hover:text-foreground hover:underline">
          {chapter.order}. {chapter.title}
        </Link>
        <ChevronLeft className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate text-foreground">{topic.title}</span>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <Label htmlFor="topic-complete" className="cursor-pointer gap-1.5 text-sm">
          {completed && <CheckCircle2 className="size-4 text-success" aria-hidden="true" />}
          סימון כהושלם
        </Label>
        <Switch
          id="topic-complete"
          checked={completed}
          onCheckedChange={(checked) => setTopicComplete(topic.id, chapter.id, checked)}
          aria-label="סימון הנושא כהושלם"
        />
      </div>
    </div>
  )
}
