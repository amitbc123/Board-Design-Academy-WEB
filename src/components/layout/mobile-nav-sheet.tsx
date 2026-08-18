import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { NavContent } from '@/components/layout/nav-content'
import { useUIStore } from '@/stores/ui-store'

export function MobileNavSheet() {
  const open = useUIStore((s) => s.sidebarOpen)
  const setOpen = useUIStore((s) => s.setSidebarOpen)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="פתיחת תפריט הניווט">
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-5/6 max-w-xs p-0">
        <SheetHeader className="border-b">
          <SheetTitle>אקדמיית תכנון לוחות</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <NavContent onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
