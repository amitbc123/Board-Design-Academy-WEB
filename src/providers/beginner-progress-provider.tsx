import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PRACTICAL } from '@/features/beginner/data/lessons'
import {
  SETTINGS_KEYS,
  getAllBeginnerLessonProgress,
  getSetting,
  isIndexedDbAvailable,
  resetBeginnerProgress as dbResetBeginnerProgress,
  setBeginnerLessonDone,
  setSetting,
  type BeginnerLessonRecord,
} from '@/lib/progress-db'

interface BeginnerProgressContextValue {
  loading: boolean
  dbAvailable: boolean
  xp: number
  streak: number
  questionsAsked: number
  questionsRight: number
  completedCount: number
  totalPractical: number
  isLessonDone: (lessonId: number) => boolean
  isLessonSkipped: (lessonId: number) => boolean
  /** Marks a stage complete. Awards XP and touches the streak only the first time. */
  completeLesson: (lessonId: number, xpAward: number) => Promise<{ firstTime: boolean }>
  skipLesson: (lessonId: number) => Promise<void>
  recordQuestionAnswer: (correct: boolean) => Promise<void>
  markIntroSeen: () => Promise<void>
  hasSeenIntro: boolean
  resetProgress: () => Promise<void>
}

const BeginnerProgressContext = createContext<BeginnerProgressContextValue | null>(null)

const dayKey = (d?: Date): string => {
  const t = d || new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

const toInt = (v: string | null): number => {
  const n = v ? parseInt(v, 10) : 0
  return Number.isFinite(n) ? n : 0
}

export function BeginnerProgressProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [dbAvailable, setDbAvailable] = useState(true)
  const [lessonProgress, setLessonProgress] = useState<Record<number, BeginnerLessonRecord>>({})
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lastActiveDay, setLastActiveDay] = useState<string | null>(null)
  const [questionsAsked, setQuestionsAsked] = useState(0)
  const [questionsRight, setQuestionsRight] = useState(0)
  const [hasSeenIntro, setHasSeenIntro] = useState(false)

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
      const [records, xpRaw, streakRaw, lastRaw, askedRaw, rightRaw, introRaw] = await Promise.all([
        getAllBeginnerLessonProgress(),
        getSetting(SETTINGS_KEYS.beginnerXp),
        getSetting(SETTINGS_KEYS.beginnerStreak),
        getSetting(SETTINGS_KEYS.beginnerLastActiveDay),
        getSetting(SETTINGS_KEYS.beginnerQuestionsAsked),
        getSetting(SETTINGS_KEYS.beginnerQuestionsRight),
        getSetting(SETTINGS_KEYS.beginnerSeenIntro),
      ])
      if (cancelled) return
      setLessonProgress(Object.fromEntries(records.map((r) => [r.lessonId, r])))
      setXp(toInt(xpRaw))
      setStreak(toInt(streakRaw))
      setLastActiveDay(lastRaw || null)
      setQuestionsAsked(toInt(askedRaw))
      setQuestionsRight(toInt(rightRaw))
      setHasSeenIntro(introRaw === '1')
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const isLessonDone = (lessonId: number) => lessonProgress[lessonId]?.done === true
  const isLessonSkipped = (lessonId: number) => lessonProgress[lessonId]?.skipped === true

  /** Once-per-day streak counter: +1 if the last active day was yesterday, reset to 1 otherwise. */
  const touchStreak = async (): Promise<number> => {
    const today = dayKey()
    if (lastActiveDay === today) return streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const next = lastActiveDay === dayKey(yesterday) ? (streak || 0) + 1 : 1
    setStreak(next)
    setLastActiveDay(today)
    if (dbAvailable) {
      await Promise.all([
        setSetting(SETTINGS_KEYS.beginnerStreak, String(next)),
        setSetting(SETTINGS_KEYS.beginnerLastActiveDay, today),
      ])
    }
    return next
  }

  const completeLesson = async (lessonId: number, xpAward: number): Promise<{ firstTime: boolean }> => {
    const firstTime = !isLessonDone(lessonId)
    await touchStreak()
    if (dbAvailable) {
      const record = await setBeginnerLessonDone(lessonId, { skipped: false })
      setLessonProgress((prev) => ({ ...prev, [lessonId]: record }))
    }
    if (firstTime) {
      const next = xp + xpAward
      setXp(next)
      if (dbAvailable) await setSetting(SETTINGS_KEYS.beginnerXp, String(next))
    }
    return { firstTime }
  }

  const skipLesson = async (lessonId: number): Promise<void> => {
    if (!dbAvailable) return
    const record = await setBeginnerLessonDone(lessonId, { skipped: true })
    setLessonProgress((prev) => ({ ...prev, [lessonId]: record }))
  }

  const recordQuestionAnswer = async (correct: boolean): Promise<void> => {
    const nextAsked = questionsAsked + 1
    const nextRight = correct ? questionsRight + 1 : questionsRight
    setQuestionsAsked(nextAsked)
    setQuestionsRight(nextRight)
    if (correct) {
      const nextXp = xp + 5
      setXp(nextXp)
      if (dbAvailable) await setSetting(SETTINGS_KEYS.beginnerXp, String(nextXp))
    }
    if (dbAvailable) {
      await Promise.all([
        setSetting(SETTINGS_KEYS.beginnerQuestionsAsked, String(nextAsked)),
        setSetting(SETTINGS_KEYS.beginnerQuestionsRight, String(nextRight)),
      ])
    }
  }

  const markIntroSeen = async (): Promise<void> => {
    setHasSeenIntro(true)
    if (dbAvailable) await setSetting(SETTINGS_KEYS.beginnerSeenIntro, '1')
  }

  const resetProgress = async (): Promise<void> => {
    if (!dbAvailable) return
    await dbResetBeginnerProgress()
    setLessonProgress({})
    setXp(0)
    setStreak(0)
    setLastActiveDay(null)
    setQuestionsAsked(0)
    setQuestionsRight(0)
    setHasSeenIntro(false)
  }

  const completedCount = useMemo(
    () => PRACTICAL.filter((l) => lessonProgress[l.id]?.done === true).length,
    [lessonProgress],
  )

  const value: BeginnerProgressContextValue = {
    loading,
    dbAvailable,
    xp,
    streak,
    questionsAsked,
    questionsRight,
    completedCount,
    totalPractical: PRACTICAL.length,
    isLessonDone,
    isLessonSkipped,
    completeLesson,
    skipLesson,
    recordQuestionAnswer,
    markIntroSeen,
    hasSeenIntro,
    resetProgress,
  }

  return <BeginnerProgressContext.Provider value={value}>{children}</BeginnerProgressContext.Provider>
}

export function useBeginnerProgress(): BeginnerProgressContextValue {
  const ctx = useContext(BeginnerProgressContext)
  if (!ctx) throw new Error('useBeginnerProgress must be used within a BeginnerProgressProvider')
  return ctx
}
