import type { Chapter } from '@/content/types'
import { chapter01 } from '@/content/chapters/chapter-01-foundations'
import { chapter02 } from '@/content/chapters/chapter-02-circuit-fundamentals'
import { chapter03 } from '@/content/chapters/chapter-03-passives-return-current'

// Chapters are added here as they're authored (see plan: 12 chapters total).
export const chapters: Chapter[] = [chapter01, chapter02, chapter03]
