import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold text-foreground">אקדמיית תכנון לוחות</h1>
      <p className="max-w-prose text-muted-foreground">בונים את התשתית של האפליקציה...</p>
      <Button>בדיקת עיצוב</Button>
    </div>
  )
}

export default App
