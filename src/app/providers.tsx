import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/app/error-boundary'
import { ThemeProvider } from '@/app/theme-provider'
import { PwaUpdatePrompt } from '@/app/pwa-update-prompt'
import { queryClient } from '@/lib/query-client'
import { router } from '@/app/router'
import { ProgressProvider } from '@/providers/progress-provider'

export function Providers() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ProgressProvider>
            <RouterProvider router={router} />
            <Toaster position="top-center" />
            <PwaUpdatePrompt />
          </ProgressProvider>
        </ThemeProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
