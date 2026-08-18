import { Link, useLocation } from 'react-router'
import { Home, Lock, Settings } from 'lucide-react'
import { getAllChapters } from '@/content'
import { useProgress } from '@/providers/progress-provider'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const chapters = getAllChapters()
  const { overallCompletionPercent, isChapterUnlocked, completedTopicCountForChapter } = useProgress()
  const location = useLocation()

  return (
    <nav className="flex h-full flex-col gap-4" aria-label="ניווט בקורס">
      <div className="flex flex-col gap-3 px-1">
        <Link
          to="/"
          onClick={onNavigate}
          className={cn(
            'flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent',
            location.pathname === '/' && 'bg-accent',
          )}
        >
          <Home className="size-4 shrink-0" aria-hidden="true" />
          דף הבית
        </Link>
        <div className="px-2">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>התקדמות כוללת</span>
            <span>{overallCompletionPercent}%</span>
          </div>
          <Progress value={overallCompletionPercent} aria-label="התקדמות כוללת בקורס" />
        </div>
      </div>

      <Separator />

      <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-1">
        {chapters.length === 0 && (
          <li className="px-2 py-4 text-sm text-muted-foreground">התוכן ייטען בקרוב.</li>
        )}
        {chapters.map((chapter) => {
          const unlocked = isChapterUnlocked(chapter.id)
          const completed = completedTopicCountForChapter(chapter.id)
          const isActive = location.pathname.startsWith(`/chapters/${chapter.id}`)

          if (!unlocked) {
            return (
              <li key={chapter.id}>
                <div className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground/70">
                  <Lock className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {chapter.order}. {chapter.title}
                  </span>
                </div>
              </li>
            )
          }

          return (
            <li key={chapter.id}>
              <Link
                to={`/chapters/${chapter.id}`}
                onClick={onNavigate}
                className={cn(
                  'flex min-h-11 items-center justify-between gap-2 rounded-md px-2 text-sm transition-colors hover:bg-accent',
                  isActive && 'bg-accent font-medium',
                )}
              >
                <span className="truncate">
                  {chapter.order}. {chapter.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {completed}/{chapter.topics.length}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <Separator />

      <Link
        to="/settings"
        onClick={onNavigate}
        className={cn(
          'flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent',
          location.pathname === '/settings' && 'bg-accent',
        )}
      >
        <Settings className="size-4 shrink-0" aria-hidden="true" />
        הגדרות
      </Link>
    </nav>
  )
}
