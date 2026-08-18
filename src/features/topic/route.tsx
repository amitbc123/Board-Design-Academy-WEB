import { Link, useParams } from 'react-router'
import { getTopic, getChapter } from '@/content'
import { Button } from '@/components/ui/button'
import { TopicHeader } from '@/features/topic/components/topic-header'
import { ExplanationSection } from '@/features/topic/components/explanation-section'
import { DiagramSection } from '@/features/topic/components/diagram-section'
import { VideoSection } from '@/features/topic/components/video-section'
import { InterviewCallout } from '@/features/topic/components/interview-callout'
import { AskAiPanel } from '@/features/topic/components/ask-ai-panel'
import { TopicPagination } from '@/features/topic/components/topic-pagination'

export function Component() {
  const { chapterId, topicId } = useParams()
  const chapter = chapterId ? getChapter(chapterId) : undefined
  const topic = chapterId && topicId ? getTopic(chapterId, topicId) : undefined

  if (!chapter || !topic) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">הנושא המבוקש לא נמצא.</p>
        <Button asChild>
          <Link to="/">חזרה לדף הבית</Link>
        </Button>
      </div>
    )
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      {/* 1. Breadcrumb + mark-as-complete toggle */}
      <TopicHeader chapter={chapter} topic={topic} />

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{topic.title}</h1>

      {/* 2. Written explanation */}
      <ExplanationSection paragraphs={topic.explanation} />

      {/* 3. Diagram, when the topic has one */}
      <DiagramSection Diagram={topic.Diagram} caption={topic.diagramCaption} />

      {/* 4. Video embeds */}
      <VideoSection videoIds={topic.videoIds} topicTitle={topic.title} />

      {/* 5. Interview callout, when flagged */}
      {topic.isInterviewTopic && <InterviewCallout note={topic.interviewNote} />}

      {/* 6. Ask-AI panel */}
      <AskAiPanel topic={topic} />

      {/* 7. Previous/next navigation */}
      <TopicPagination chapterId={chapter.id} topicId={topic.id} />
    </article>
  )
}
