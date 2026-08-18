import { useState } from 'react'
import type { Chapter } from '@/content/types'
import type { ExamAnswerRecord } from '@/lib/progress-db'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ExamQuestionCard } from '@/features/exam/components/exam-question-card'

export function ExamRunner({
  chapter,
  onFinish,
}: {
  chapter: Chapter
  onFinish: (answers: ExamAnswerRecord[]) => void
}) {
  const questions = chapter.examQuestions
  const [index, setIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<ExamAnswerRecord[]>([])

  const question = questions[index]
  const isLast = index === questions.length - 1
  const scoreSoFar = answers.filter((a) => a.correct).length

  const handleSelect = (optionId: string) => {
    setSelectedOptionId(optionId)
    setAnswers((prev) => [
      ...prev,
      { questionId: question.id, selectedOptionId: optionId, correct: optionId === question.correctOptionId },
    ])
  }

  const handleNext = () => {
    if (isLast) {
      onFinish(answers)
      return
    }
    setIndex((i) => i + 1)
    setSelectedOptionId(null)
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Progress
          value={((index + (selectedOptionId ? 1 : 0)) / questions.length) * 100}
          className="h-2 flex-1"
          aria-label="התקדמות במבחן"
        />
        <span className="shrink-0 text-sm text-muted-foreground">
          שאלה {index + 1}/{questions.length}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">ציון נוכחי: {scoreSoFar}/{answers.length}</p>

      <ExamQuestionCard question={question} selectedOptionId={selectedOptionId} onSelect={handleSelect} />

      {selectedOptionId && (
        <Button onClick={handleNext} className="self-end" autoFocus>
          {isLast ? 'סיום המבחן' : 'לשאלה הבאה'}
        </Button>
      )}
    </div>
  )
}
