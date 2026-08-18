import { useState } from 'react'
import { TriangleAlert, X } from 'lucide-react'
import { useProgress } from '@/providers/progress-provider'
import { Button } from '@/components/ui/button'

export function StorageStatusBanner() {
  const { loading, dbAvailable } = useProgress()
  const [dismissed, setDismissed] = useState(false)

  if (loading || dbAvailable || dismissed) return null

  return (
    <div
      role="status"
      className="flex items-center gap-3 border-b bg-interview/10 px-4 py-2 text-sm text-interview-foreground"
    >
      <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">
        אחסון מקומי אינו זמין בדפדפן זה (למשל מצב גלישה פרטית מחמיר). ניתן להמשיך לקרוא את התוכן,
        אך ההתקדמות וההישגים לא יישמרו בסשן הזה.
      </p>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDismissed(true)}
        aria-label="סגירת ההודעה"
        className="shrink-0"
      >
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
