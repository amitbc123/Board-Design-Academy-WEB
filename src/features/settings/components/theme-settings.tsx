import { Monitor, Moon, Sun } from 'lucide-react'
import { useUIStore, type ThemePreference } from '@/stores/ui-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'בהיר', icon: Sun },
  { value: 'dark', label: 'כהה', icon: Moon },
  { value: 'system', label: 'לפי המערכת', icon: Monitor },
]

export function ThemeSettings() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  return (
    <Card>
      <CardHeader>
        <CardTitle>ערכת נושא</CardTitle>
        <CardDescription>בחירת מראה בהיר, כהה, או התאמה אוטומטית להעדפת המערכת.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            onClick={() => setTheme(value)}
            aria-pressed={theme === value}
            className={cn('gap-1.5', theme === value && 'border-primary bg-accent')}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
