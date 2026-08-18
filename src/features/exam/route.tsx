import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getChapter } from '@/content'
import { useProgress } from '@/providers/progress-provider'
import { Button } from '@/components/ui/button'
import type { ExamAnswerRecord } from '@/lib/progress-db'
import { ExamIntro } from '@/features/exam/components/exam-intro'
import { ExamRunner } from '@/features/exam/components/exam-runner'
import { ExamResultScreen } from '@/features/exam/components/exam-result-screen'

type ExamState = { phase: 'intro' } | { phase: 'running' } | { phase: 'result'; score: number; total: number }

export function Component() {
  const { chapterId } = useParams()
  const chapter = chapterId ? getChapter(chapterId) : undefined
  const { recordExamAttempt, latestExamAttempt } = useProgress()
  const [state, setState] = useState<ExamState>({ phase: 'intro' })

  if (!chapter) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">הפרק המבוקש לא נמצא.</p>
        <Button asChild>
          <Link to="/">חזרה לדף הבית</Link>
        </Button>
      </div>
    )
  }

  const handleFinish = async (answers: ExamAnswerRecord[]) => {
    const score = answers.filter((a) => a.correct).length
    await recordExamAttempt(chapter.id, score, answers.length, answers)
    setState({ phase: 'result', score, total: answers.length })
  }

  if (state.phase === 'intro') {
    return (
      <ExamIntro
        chapter={chapter}
        isRetake={Boolean(latestExamAttempt(chapter.id))}
        onStart={() => setState({ phase: 'running' })}
      />
    )
  }

  if (state.phase === 'running') {
    return <ExamRunner chapter={chapter} onFinish={handleFinish} />
  }

  return (
    <ExamResultScreen
      chapterId={chapter.id}
      chapterTitle={chapter.title}
      score={state.score}
      total={state.total}
      onRetake={() => setState({ phase: 'running' })}
    />
  )
}
