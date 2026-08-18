import type { Chapter } from '@/content/types'
import { chapter01 } from '@/content/chapters/chapter-01-foundations'
import { chapter02 } from '@/content/chapters/chapter-02-circuit-fundamentals'
import { chapter03 } from '@/content/chapters/chapter-03-passives-return-current'
import { chapter04 } from '@/content/chapters/chapter-04-transmission-lines'
import { chapter05 } from '@/content/chapters/chapter-05-crosstalk-stackup'
import { chapter06 } from '@/content/chapters/chapter-06-manufacturing-packaging'
import { chapter07 } from '@/content/chapters/chapter-07-power-integrity'
import { chapter08 } from '@/content/chapters/chapter-08-simulation-interfaces'
import { chapter09 } from '@/content/chapters/chapter-09-emc-shielding-filtering'
import { chapter10 } from '@/content/chapters/chapter-10-advanced-stackup'
import { chapter11 } from '@/content/chapters/chapter-11-digital-rf-mixed-signal'
import { chapter12 } from '@/content/chapters/chapter-12-multigigabit'

// Chapters are added here as they're authored (see plan: 12 chapters total).
export const chapters: Chapter[] = [
  chapter01,
  chapter02,
  chapter03,
  chapter04,
  chapter05,
  chapter06,
  chapter07,
  chapter08,
  chapter09,
  chapter10,
  chapter11,
  chapter12,
]
