import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useProgress } from '@/providers/progress-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ApiKeyForm() {
  const { geminiApiKey, setGeminiApiKey, dbAvailable } = useProgress()
  const [value, setValue] = useState(geminiApiKey ?? '')
  const [visible, setVisible] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await setGeminiApiKey(value.trim())
    toast.success('מפתח ה-API נשמר')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>מפתח Gemini API</CardTitle>
        <CardDescription>
          נדרש כדי להשתמש בפאנל "שאלו את ה-AI" בדפי הנושאים. המפתח נשמר מקומית בדפדפן בלבד ולעולם
          אינו נשלח לשרת כלשהו מלבד Google.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Label htmlFor="gemini-key">מפתח API</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="gemini-key"
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="AIza..."
                disabled={!dbAvailable}
                autoComplete="off"
                dir="ltr"
                className="pe-11 text-left"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 end-0 h-full"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'הסתרת המפתח' : 'הצגת המפתח'}
              >
                {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </Button>
            </div>
            <Button type="submit" disabled={!dbAvailable}>
              שמירה
            </Button>
          </div>
          {!dbAvailable && (
            <p className="text-sm text-muted-foreground">
              אחסון מקומי אינו זמין בדפדפן זה, ולכן לא ניתן לשמור מפתח API בסשן הזה.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
