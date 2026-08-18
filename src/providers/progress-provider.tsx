import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getAllChapters, getTotalTopicCount } from '@/content'
import {
  SETTINGS_KEYS,
  addExamAttempt as dbAddExamAttempt,
  getAllTopicProgress,
  getAllExamAttempts,
  getSetting,
  isIndexedDbAvailable,
  resetAllProgress as dbResetAllProgress,
  setSetting,
  setTopicComplete as dbSetTopicComplete,
  type ExamAnswerRecord,
  type ExamAttemptRecord,
  type TopicProgressRecord,
} from '@/lib/progress-db'

interface ProgressContextValue {
  loading: boolean
  dbAvailable: boolean
  geminiApiKey: string | null
  overallCompletionPercent: number
  isTopicComplete: (topicId: string) => boolean
  isChapterComplete: (chapterId: string) => boolean
  isChapterUnlocked: (chapterId: string) => boolean
  completedTopicCountForChapter: (chapterId: string) => number
  latestExamAttempt: (chapterId: string) => ExamAttemptRecord | undefined
  examHistoryForChapter: (chapterId: string) => ExamAttemptRecord[]
  setTopicComplete: (topicId: string, chapterId: string, completed: boolean) => Promise<void>
  unlockChapter: (chapterId: string) => Promise<void>
  recordExamAttempt: (
    chapterId: string,
    score: number,
    totalQuestions: number,
    answers: ExamAnswerRecord[],
  ) => Promise<ExamAttemptRecord>
  setGeminiApiKey: (key: string) => Promise<void>
  resetProgress: () => Promise<void>
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [dbAvailable, setDbAvailable] = useState(true)
  const [topicProgress, setTopicProgressState] = useState<Record<string, TopicProgressRecord>>({})
  const [examAttempts, setExamAttempts] = useState<ExamAttemptRecord[]>([])
  const [unlockedChapterIds, setUnlockedChapterIds] = useState<Set<string>>(new Set())
  const [geminiApiKey, setGeminiApiKeyState] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const ok = await isIndexedDbAvailable()
      if (cancelled) return
      setDbAvailable(ok)
      if (!ok) {
        setLoading(false)
        return
      }
      const [progressRecords, attempts, unlockedRaw, apiKey] = await Promise.all([
        getAllTopicProgress(),
        getAllExamAttempts(),
        getSetting(SETTINGS_KEYS.unlockedChapters),
        getSetting(SETTINGS_KEYS.geminiApiKey),
      ])
      if (cancelled) return
      setTopicProgressState(Object.fromEntries(progressRecords.map((r) => [r.topicId, r])))
      setExamAttempts(attempts)
      setUnlockedChapterIds(new Set(unlockedRaw ? (JSON.parse(unlockedRaw) as string[]) : []))
      setGeminiApiKeyState(apiKey)
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const chapters = useMemo(() => getAllChapters(), [])

  const isTopicComplete = (topicId: string) => topicProgress[topicId]?.completed === true

  const completedTopicCountForChapter = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId)
    if (!chapter) return 0
    return chapter.topics.filter((t) => isTopicComplete(t.id)).length
  }

  const isChapterComplete = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId)
    if (!chapter || chapter.topics.length === 0) return false
    return chapter.topics.every((t) => isTopicComplete(t.id))
  }

  const isChapterUnlocked = (chapterId: string) => {
    const index = chapters.findIndex((c) => c.id === chapterId)
    if (index <= 0) return true
    if (unlockedChapterIds.has(chapterId)) return true
    const previous = chapters[index - 1]
    return isChapterComplete(previous.id)
  }

  const examHistoryForChapter = (chapterId: string) =>
    examAttempts
      .filter((a) => a.chapterId === chapterId)
      .sort((a, b) => b.takenAt.localeCompare(a.takenAt))

  const latestExamAttempt = (chapterId: string) => examHistoryForChapter(chapterId)[0]

  const setTopicComplete = async (topicId: string, chapterId: string, completed: boolean) => {
    if (!dbAvailable) return
    const record = await dbSetTopicComplete(topicId, chapterId, completed)
    setTopicProgressState((prev) => ({ ...prev, [topicId]: record }))
  }

  const unlockChapter = async (chapterId: string) => {
    if (!dbAvailable) return
    const next = new Set(unlockedChapterIds)
    next.add(chapterId)
    setUnlockedChapterIds(next)
    await setSetting(SETTINGS_KEYS.unlockedChapters, JSON.stringify([...next]))
  }

  const recordExamAttempt = async (
    chapterId: string,
    score: number,
    totalQuestions: number,
    answers: ExamAnswerRecord[],
  ) => {
    const attempt = await dbAddExamAttempt({ chapterId, score, totalQuestions, answers })
    setExamAttempts((prev) => [attempt, ...prev])
    return attempt
  }

  const setGeminiApiKey = async (key: string) => {
    if (!dbAvailable) return
    await setSetting(SETTINGS_KEYS.geminiApiKey, key)
    setGeminiApiKeyState(key)
  }

  const resetProgress = async () => {
    if (!dbAvailable) return
    await dbResetAllProgress()
    await setSetting(SETTINGS_KEYS.unlockedChapters, '[]')
    setTopicProgressState({})
    setExamAttempts([])
    setUnlockedChapterIds(new Set())
  }

  const totalTopics = getTotalTopicCount()
  const completedTopics = Object.values(topicProgress).filter((p) => p.completed).length
  const overallCompletionPercent =
    totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)

  const value: ProgressContextValue = {
    loading,
    dbAvailable,
    geminiApiKey,
    overallCompletionPercent,
    isTopicComplete,
    isChapterComplete,
    isChapterUnlocked,
    completedTopicCountForChapter,
    latestExamAttempt,
    examHistoryForChapter,
    setTopicComplete,
    unlockChapter,
    recordExamAttempt,
    setGeminiApiKey,
    resetProgress,
  }

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider')
  return ctx
}
