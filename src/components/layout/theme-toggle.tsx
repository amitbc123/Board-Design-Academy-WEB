import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore, type ThemePreference } from '@/stores/ui-store'

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const LABELS: Record<ThemePreference, string> = {
  system: 'ערכת נושא: לפי המערכת',
  light: 'ערכת נושא: בהירה',
  dark: 'ערכת נושא: כהה',
}

const ICONS: Record<ThemePreference, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const Icon = ICONS[theme]

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(NEXT[theme])}
      aria-label={`${LABELS[theme]}, לחיצה למעבר למצב הבא`}
      title={LABELS[theme]}
    >
      <Icon className="size-4" aria-hidden="true" />
    </Button>
  )
}
