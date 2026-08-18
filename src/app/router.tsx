import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/app/root-layout'
import { RouteError } from '@/app/route-error'
import { DashboardRoute } from '@/features/dashboard/route'

// Basename mirrors Vite's configured `base` (see vite.config.ts / VITE_BASE_PATH),
// so the app works whether it's served from a domain root or a GitHub Pages subpath.
const rawBase = import.meta.env.BASE_URL
const basename = rawBase === '/' ? undefined : rawBase.replace(/\/$/, '')

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <RouteError />,
      children: [
        { index: true, element: <DashboardRoute /> },
        {
          path: 'chapters/:chapterId',
          lazy: () => import('@/features/chapter/route'),
          errorElement: <RouteError />,
        },
        {
          path: 'chapters/:chapterId/topics/:topicId',
          lazy: () => import('@/features/topic/route'),
          errorElement: <RouteError />,
        },
        {
          path: 'chapters/:chapterId/exam',
          lazy: () => import('@/features/exam/route'),
          errorElement: <RouteError />,
        },
        {
          path: 'settings',
          lazy: () => import('@/features/settings/route'),
          errorElement: <RouteError />,
        },
        {
          path: '*',
          lazy: () => import('@/features/not-found/route'),
          errorElement: <RouteError />,
        },
      ],
    },
  ],
  { basename },
)
