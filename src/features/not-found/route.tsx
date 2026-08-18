import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function Component() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">הדף לא נמצא</h1>
      <p className="text-muted-foreground">הכתובת המבוקשת אינה קיימת באפליקציה.</p>
      <Button asChild>
        <Link to="/">חזרה לדף הבית</Link>
      </Button>
    </div>
  )
}
