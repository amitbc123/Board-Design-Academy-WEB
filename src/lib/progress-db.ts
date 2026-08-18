import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export interface TopicProgressRecord {
  topicId: string
  chapterId: string
  completed: boolean
  completedAt: string | null
}

export interface ExamAnswerRecord {
  questionId: string
  selectedOptionId: string
  correct: boolean
}

export interface ExamAttemptRecord {
  id: string
  chapterId: string
  score: number
  totalQuestions: number
  answers: ExamAnswerRecord[]
  takenAt: string
}

export interface SettingRecord {
  key: string
  value: string
}

interface ProgressDBSchema extends DBSchema {
  topicProgress: {
    key: string
    value: TopicProgressRecord
    indexes: { 'by-chapter': string }
  }
  examAttempts: {
    key: string
    value: ExamAttemptRecord
    indexes: { 'by-chapter': string }
  }
  settings: {
    key: string
    value: SettingRecord
  }
}

const DB_NAME = 'board-design-academy'
const DB_VERSION = 1

export const SETTINGS_KEYS = {
  geminiApiKey: 'geminiApiKey',
  unlockedChapters: 'unlockedChapters',
} as const

let dbPromise: Promise<IDBPDatabase<ProgressDBSchema>> | null = null
let availabilityChecked = false
let available = true

function getDb(): Promise<IDBPDatabase<ProgressDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<ProgressDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('topicProgress')) {
          const store = db.createObjectStore('topicProgress', { keyPath: 'topicId' })
          store.createIndex('by-chapter', 'chapterId')
        }
        if (!db.objectStoreNames.contains('examAttempts')) {
          const store = db.createObjectStore('examAttempts', { keyPath: 'id' })
          store.createIndex('by-chapter', 'chapterId')
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

export async function isIndexedDbAvailable(): Promise<boolean> {
  if (availabilityChecked) return available
  availabilityChecked = true
  if (typeof indexedDB === 'undefined') {
    available = false
    return available
  }
  try {
    await getDb()
    available = true
  } catch {
    available = false
  }
  return available
}

export async function getAllTopicProgress(): Promise<TopicProgressRecord[]> {
  const db = await getDb()
  return db.getAll('topicProgress')
}

export async function setTopicComplete(
  topicId: string,
  chapterId: string,
  completed: boolean,
): Promise<TopicProgressRecord> {
  const db = await getDb()
  const record: TopicProgressRecord = {
    topicId,
    chapterId,
    completed,
    completedAt: completed ? new Date().toISOString() : null,
  }
  await db.put('topicProgress', record)
  return record
}

export async function getExamHistory(chapterId: string): Promise<ExamAttemptRecord[]> {
  const db = await getDb()
  const attempts = await db.getAllFromIndex('examAttempts', 'by-chapter', chapterId)
  return attempts.sort((a, b) => b.takenAt.localeCompare(a.takenAt))
}

export async function getAllExamAttempts(): Promise<ExamAttemptRecord[]> {
  const db = await getDb()
  return db.getAll('examAttempts')
}

export async function addExamAttempt(
  attempt: Omit<ExamAttemptRecord, 'id' | 'takenAt'>,
): Promise<ExamAttemptRecord> {
  const db = await getDb()
  const record: ExamAttemptRecord = {
    ...attempt,
    id: crypto.randomUUID(),
    takenAt: new Date().toISOString(),
  }
  await db.put('examAttempts', record)
  return record
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb()
  const record = await db.get('settings', key)
  return record?.value ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb()
  await db.put('settings', { key, value })
}

export async function getAllSettings(): Promise<SettingRecord[]> {
  const db = await getDb()
  return db.getAll('settings')
}

export async function resetAllProgress(): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['topicProgress', 'examAttempts'], 'readwrite')
  await Promise.all([tx.objectStore('topicProgress').clear(), tx.objectStore('examAttempts').clear()])
  await tx.done
}
