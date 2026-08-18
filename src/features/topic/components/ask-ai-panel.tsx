import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ChevronDown, Sparkles, TriangleAlert, WifiOff } from 'lucide-react'
import type { Topic } from '@/content/types'
import { useProgress } from '@/providers/progress-provider'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useAskAiMutation } from '@/features/ai/queries'
import { GeminiApiError } from '@/lib/gemini-client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Card, CardContent } from '@/components/ui/card'

function geminiErrorMessage(error: unknown): string {
  if (error instanceof GeminiApiError) {
    if (error.status === 0) return 'שגיאת רשת — בדקו את החיבור לאינטרנט ונסו שוב.'
    if (error.status === 401 || error.status === 403) return 'מפתח ה-API אינו תקין. ניתן לעדכן אותו במסך ההגדרות.'
    if (error.status === 429) return 'חריגה ממכסת הבקשות המותרת (rate limit). נסו שוב בעוד כמה רגעים.'
    return `שגיאה מצד שירות ה-AI: ${error.message}`
  }
  return 'אירעה שגיאה בלתי צפויה. נסו שוב.'
}

export function AskAiPanel({ topic }: { topic: Topic }) {
  const { geminiApiKey } = useProgress()
  const isOnline = useOnlineStatus()
  const [question, setQuestion] = useState('')
  const mutation = useAskAiMutation()

  const hasKey = Boolean(geminiApiKey?.trim())

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!hasKey || !question.trim() || !isOnline) return
    mutation.mutate({
      apiKey: geminiApiKey!,
      topicTitle: topic.title,
      topicSummary: topic.summary,
      question: question.trim(),
    })
  }

  return (
    <Collapsible className="rounded-lg border">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-start font-medium transition-colors hover:bg-accent [&[data-state=open]>svg]:rotate-180"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            שאלו את ה-AI על הנושא הזה
          </span>
          <ChevronDown className="size-4 shrink-0 transition-transform" aria-hidden="true" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t px-4 py-4">
        {!hasKey ? (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              כדי להשתמש בפאנל השאלות יש להגדיר מפתח Gemini API תחילה במסך{' '}
              <Link to="/settings" className="text-primary underline underline-offset-2">
                ההגדרות
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {!isOnline && (
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                <WifiOff className="size-4 shrink-0" aria-hidden="true" />
                אין חיבור לאינטרנט כרגע — לא ניתן לשלוח שאלות עד לחזרת החיבור.
              </div>
            )}
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`שאלו שאלה על "${topic.title}"...`}
              rows={3}
              disabled={!isOnline || mutation.isPending}
              aria-label="שאלה על הנושא"
            />
            <Button
              type="submit"
              disabled={!isOnline || !question.trim() || mutation.isPending}
              className="self-start"
            >
              {mutation.isPending ? 'שולח...' : 'שליחת שאלה'}
            </Button>

            {mutation.isError && (
              <Card className="border-destructive/40">
                <CardContent className="flex items-start gap-2 py-3 text-sm text-destructive">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>{geminiErrorMessage(mutation.error)}</p>
                </CardContent>
              </Card>
            )}

            {mutation.isSuccess && (
              <Card>
                <CardContent className="whitespace-pre-wrap py-3 text-sm leading-7">{mutation.data}</CardContent>
              </Card>
            )}
          </form>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
