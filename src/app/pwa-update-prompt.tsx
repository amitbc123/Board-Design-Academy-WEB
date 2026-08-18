import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

export function PwaUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  const dismiss = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-lg border bg-background p-4 shadow-lg sm:mx-0 sm:end-4 sm:inset-x-auto"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <p className="text-sm">{needRefresh ? 'גרסה חדשה של האפליקציה זמינה.' : 'האפליקציה מוכנה לעבודה במצב לא מקוון.'}</p>
      <div className="mt-3 flex gap-2">
        {needRefresh && (
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            רענון וטעינת הגרסה החדשה
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={dismiss}>
          סגירה
        </Button>
      </div>
    </div>
  )
}
