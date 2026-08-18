import { isRouteErrorResponse, useRouteError, Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function RouteError() {
  const error = useRouteError()

  const is404 = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">
        {is404 ? 'הדף לא נמצא' : 'אירעה שגיאה בטעינת הדף'}
      </h1>
      <p className="max-w-prose text-muted-foreground">
        {is404
          ? 'הכתובת המבוקשת אינה קיימת באפליקציה.'
          : 'משהו השתבש בזמן טעינת התוכן. אפשר לנסות לחזור לדף הבית.'}
      </p>
      <Button asChild>
        <Link to="/">חזרה לדף הבית</Link>
      </Button>
    </div>
  )
}
