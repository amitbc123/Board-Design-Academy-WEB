import { CheckCircle2, XCircle } from 'lucide-react'
import type { ExamQuestion } from '@/content/types'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ExamQuestionCard({
  question,
  selectedOptionId,
  onSelect,
}: {
  question: ExamQuestion
  selectedOptionId: string | null
  onSelect: (optionId: string) => void
}) {
  const answered = selectedOptionId !== null
  const isCorrect = selectedOptionId === question.correctOptionId

  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <h2 className="text-lg font-medium leading-relaxed">{question.question}</h2>

        <RadioGroup
          value={selectedOptionId ?? undefined}
          onValueChange={(value) => {
            if (!answered) onSelect(value)
          }}
          className="gap-3"
        >
          {question.options.map((option) => {
            const isSelected = option.id === selectedOptionId
            const isCorrectOption = option.id === question.correctOptionId
            const showAsCorrect = answered && isCorrectOption
            const showAsWrong = answered && isSelected && !isCorrectOption

            return (
              <Label
                key={option.id}
                htmlFor={`option-${question.id}-${option.id}`}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-start font-normal transition-colors',
                  !answered && 'hover:bg-accent',
                  showAsCorrect && 'border-success bg-success/10',
                  showAsWrong && 'border-destructive bg-destructive/10',
                )}
              >
                <RadioGroupItem
                  id={`option-${question.id}-${option.id}`}
                  value={option.id}
                  disabled={answered}
                />
                <span className="flex-1">{option.text}</span>
                {showAsCorrect && <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />}
                {showAsWrong && <XCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />}
              </Label>
            )
          })}
        </RadioGroup>

        {answered && (
          <div
            role="status"
            className={cn(
              'rounded-md border px-4 py-3 text-sm leading-relaxed',
              isCorrect ? 'border-success/40 bg-success/10 text-success-foreground' : 'border-destructive/40 bg-destructive/5 text-destructive',
            )}
          >
            <p className="mb-1 font-medium">{isCorrect ? 'תשובה נכונה!' : 'תשובה שגויה'}</p>
            <p className="text-foreground/90">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
