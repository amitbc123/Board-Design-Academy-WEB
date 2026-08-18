import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useIsDesktop } from '@/hooks/use-media-query'
import { NavContent } from '@/components/layout/nav-content'
import { MobileNavSheet } from '@/components/layout/mobile-nav-sheet'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { StorageStatusBanner } from '@/components/layout/storage-status-banner'

export function AppShell({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktop()

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <StorageStatusBanner />
      <header
        className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {!isDesktop && <MobileNavSheet />}
        <Link to="/" className="truncate text-base font-semibold">
          אקדמיית תכנון לוחות
        </Link>
        <div className="me-auto flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        {isDesktop && (
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-72 shrink-0 border-e p-4 md:block">
            <NavContent />
          </aside>
        )}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
