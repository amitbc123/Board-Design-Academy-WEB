import { chapters } from '@/content/chapters'
import type { Chapter, Topic } from '@/content/types'

export type { Chapter, Topic, ExamQuestion, QuizOption } from '@/content/types'

export function getAllChapters(): Chapter[] {
  return [...chapters].sort((a, b) => a.order - b.order)
}

export function getChapter(chapterId: string): Chapter | undefined {
  return chapters.find((c) => c.id === chapterId)
}

export function getTopic(chapterId: string, topicId: string): Topic | undefined {
  return getChapter(chapterId)?.topics.find((t) => t.id === topicId)
}

interface FlatTopic {
  topic: Topic
  chapter: Chapter
}

/** All topics in course order, flattened, for prev/next navigation. */
export function getFlatTopics(): FlatTopic[] {
  const result: FlatTopic[] = []
  for (const chapter of getAllChapters()) {
    for (const topic of [...chapter.topics].sort((a, b) => a.order - b.order)) {
      result.push({ topic, chapter })
    }
  }
  return result
}

export function getAdjacentTopics(chapterId: string, topicId: string) {
  const flat = getFlatTopics()
  const index = flat.findIndex((f) => f.chapter.id === chapterId && f.topic.id === topicId)
  return {
    previous: index > 0 ? flat[index - 1] : undefined,
    next: index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined,
  }
}

export function getTotalTopicCount(): number {
  return chapters.reduce((sum, c) => sum + c.topics.length, 0)
}
