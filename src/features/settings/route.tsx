import { useUIStore } from '@/stores/ui-store'
import { useProgress } from '@/providers/progress-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiKeyForm } from '@/features/settings/components/api-key-form'
import { ThemeSettings } from '@/features/settings/components/theme-settings'
import { ResetProgressDialog } from '@/features/settings/components/reset-progress-dialog'

export function Component() {
  const activeTab = useUIStore((s) => s.activeSettingsTab)
  const setActiveTab = useUIStore((s) => s.setActiveSettingsTab)
  const { dbAvailable } = useProgress()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">הגדרות</h1>
        <p className="mt-1 text-muted-foreground">ניהול מפתח ה-AI, ערכת הנושא, וההתקדמות השמורה בדפדפן.</p>
      </div>

      {!dbAvailable && (
        <p className="rounded-md border border-interview-border bg-interview/10 px-4 py-3 text-sm text-interview-foreground">
          אחסון מקומי אינו זמין בדפדפן זה — שינויים בהגדרות ובהתקדמות לא יישמרו בסשן הזה.
        </p>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="appearance">תצוגה</TabsTrigger>
          <TabsTrigger value="data">נתונים</TabsTrigger>
        </TabsList>
        <TabsContent value="ai">
          <ApiKeyForm />
        </TabsContent>
        <TabsContent value="appearance">
          <ThemeSettings />
        </TabsContent>
        <TabsContent value="data">
          <ResetProgressDialog />
        </TabsContent>
      </Tabs>
    </div>
  )
}
