import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Lesson } from './engine/types'
import { TrailView } from './components/trail-view'
import { LessonSheet } from './components/lesson-sheet'
import { RevBot } from './components/rev-bot'
import { useBeginnerProgress } from '@/providers/beginner-progress-provider'

export function Component() {
  const navigate = useNavigate()
  const progress = useBeginnerProgress()
  const [selected, setSelected] = useState<Lesson | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <TrailView
        onSelectLesson={(lesson) => {
          setSelected(lesson)
          setSheetOpen(true)
        }}
      />
      <LessonSheet
        lesson={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onStart={() => {
          if (!selected) return
          setSheetOpen(false)
          navigate(`/beginner/${selected.id}`)
        }}
        onSkip={() => {
          if (!selected) return
          void progress.skipLesson(selected.id)
          setSheetOpen(false)
        }}
      />
      <RevBot context={progress.completedCount > 0 ? 'path' : 'path0'} unit={selected?.u ?? 0} />
    </>
  )
}
