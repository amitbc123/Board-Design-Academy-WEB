import { useMemo, useRef, type ReactNode } from 'react'
import { CheckIcon, FlameIcon, LockIcon, RotateCcwIcon } from 'lucide-react'
import type { Lesson } from '../engine/types'
import { PRACTICAL } from '../data/lessons'
import { UNITS } from '../data/units'
import { useBeginnerProgress } from '@/providers/beginner-progress-provider'
import { useIsDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

/** Stage gating is off: the owner wants every stage visible. Revisit only when asked. */
const GATED = false

const unitColor = (u: number) => {
  const t = Math.max(0, Math.min(7, u)) / 7
  return `color-mix(in oklch, var(--primary) ${((1 - t) * 100).toFixed(0)}%, var(--chart-2) ${(t * 100).toFixed(0)}%)`
}

type NodeItem = { type: 'node'; lesson: Lesson; x: number; y: number }
type BannerItem = { type: 'banner'; unit: number; y: number }
type TrailItem = NodeItem | BannerItem

function layout(width: number) {
  const cx = width / 2
  const amp = Math.min(width * 0.28, 118)
  const gapY = 134
  const headerH = 58
  let y = 40
  const items: TrailItem[] = []
  const pts: { x: number; y: number }[] = []
  let lastUnit = -1
  PRACTICAL.forEach((lesson, i) => {
    if (lesson.u !== lastUnit) {
      lastUnit = lesson.u
      items.push({ type: 'banner', unit: lesson.u, y })
      y += headerH
    }
    const x = cx + Math.sin(i * 0.85) * amp
    items.push({ type: 'node', lesson, x, y })
    pts.push({ x, y })
    y += gapY
  })
  return { items, pts, height: y + 20 }
}

export function TrailView({ onSelectLesson }: { onSelectLesson: (lesson: Lesson) => void }) {
  const progress = useBeginnerProgress()
  const isDesktop = useIsDesktop()
  const width = isDesktop ? 480 : 380
  const { items, pts, height } = useMemo(() => layout(width), [width])

  const doneCount = PRACTICAL.filter((l) => progress.isLessonDone(l.id)).length
  const nextLesson = PRACTICAL.find((l) => !progress.isLessonDone(l.id))

  const pathD = useMemo(() => {
    let d = ''
    pts.forEach((p, i) => {
      if (!i) {
        d = `M${p.x} ${p.y}`
        return
      }
      const q = pts[i - 1]
      const my = (q.y + p.y) / 2
      d += ` C${q.x} ${my} ${p.x} ${my} ${p.x} ${p.y}`
    })
    return d
  }, [pts])

  const litLength = Math.max(1, height * 1.35) * (1 - Math.max(0.02, doneCount / PRACTICAL.length))

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-1 pb-20">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">הנדסת חומרה, שלב אחר שלב</h1>
          <p className="mt-1 max-w-[52ch] text-sm text-muted-foreground">
            כל שלב הוא מעשי: תשרטט את הסכמה, תפתור אותה, תסדר את הלוח, תנתב אותו. Rev שואל אותך שאלות בדרך.
          </p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <StatChip icon={FlameIcon} value={progress.streak} tone={progress.streak ? 'text-orange-500' : 'text-muted-foreground'} title={progress.streak ? `רצף של ${progress.streak} ימים` : 'סיים שלב כדי להתחיל רצף'} />
        <StatChip icon={undefined} value={`${progress.xp} XP`} tone="text-primary" />
        <span className="ms-auto text-xs text-muted-foreground">
          {doneCount}/{PRACTICAL.length}
        </span>
      </div>

      <div className="relative mx-auto" style={{ width }}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block" aria-hidden="true">
          <path d={pathD} fill="none" stroke="var(--border)" strokeWidth={11} strokeLinecap="round" />
          <path
            d={pathD}
            fill="none"
            stroke={unitColor(3.5)}
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={Math.max(1, height * 1.35)}
            strokeDashoffset={litLength}
          />
        </svg>
        <div className="absolute inset-0">
          {items.map((it) => {
            if (it.type === 'banner') {
              const doneInUnit = PRACTICAL.filter((l) => l.u === it.unit && progress.isLessonDone(l.id)).length
              const totalInUnit = PRACTICAL.filter((l) => l.u === it.unit).length
              return (
                <div key={`u${it.unit}`} className="absolute inset-x-0 flex items-center gap-2.5 px-1" style={{ top: it.y, transform: 'translateY(-50%)' }}>
                  <span className="h-px flex-1 bg-border" />
                  <b className="whitespace-nowrap font-mono text-[9.5px] font-bold uppercase tracking-widest" style={{ color: unitColor(it.unit) }}>
                    Unit {it.unit} · {UNITS[it.unit]} <em className="font-normal not-italic text-muted-foreground">{doneInUnit}/{totalInUnit}</em>
                  </b>
                  <span className="h-px flex-1 bg-border" />
                </div>
              )
            }
            const lesson = it.lesson
            const done = progress.isLessonDone(lesson.id)
            const skipped = progress.isLessonSkipped(lesson.id)
            const unlocked = !GATED || lesson.pos === 1 || (PRACTICAL[lesson.pos! - 2] && progress.isLessonDone(PRACTICAL[lesson.pos! - 2].id))
            const isCurrent = nextLesson?.id === lesson.id
            return (
              <TrailNode
                key={lesson.id}
                lesson={lesson}
                x={it.x}
                y={it.y}
                done={done}
                skipped={skipped}
                unlocked={unlocked}
                current={isCurrent}
                color={unitColor(lesson.u)}
                onClick={() => onSelectLesson(lesson)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatChip({ icon: Icon, value, tone, title }: { icon?: React.ComponentType<{ className?: string }>; value: ReactNode; tone: string; title?: string }) {
  return (
    <span className={cn('flex items-center gap-1 font-mono text-sm font-bold tabular-nums', tone)} title={title}>
      {Icon && <Icon className="size-4" />}
      {value}
    </span>
  )
}

function TrailNode({
  lesson,
  x,
  y,
  done,
  skipped,
  unlocked,
  current,
  color,
  onClick,
}: {
  lesson: Lesson
  x: number
  y: number
  done: boolean
  skipped: boolean
  unlocked: boolean
  current: boolean
  color: string
  onClick: () => void
}) {
  const nodeRef = useRef<HTMLButtonElement>(null)
  const clickable = unlocked
  return (
    <button
      ref={nodeRef}
      type="button"
      disabled={!clickable}
      onClick={onClick}
      className="absolute flex flex-col items-center gap-1.5 transition-transform enabled:hover:scale-[1.08] enabled:active:scale-95"
      style={{ left: x, top: y, transform: 'translate(-50%,-50%)' }}
    >
      <span className="relative grid size-[62px] place-items-center rounded-full" style={{ '--unit': color } as React.CSSProperties}>
        {current && <span className="absolute inset-[-6px] animate-ping rounded-full border-2 opacity-40" style={{ borderColor: color }} />}
        <span
          className={cn('absolute inset-0 rounded-full shadow-[0_3px_0_rgba(0,0,0,0.25)]', !unlocked && 'shadow-none')}
          style={{
            background: done || current ? color : unlocked ? 'var(--card)' : 'var(--muted)',
            boxShadow: done || current ? `inset 0 0 0 4px color-mix(in oklch, ${color} 72%, white)` : unlocked ? `inset 0 0 0 4px ${color}` : 'inset 0 0 0 3px var(--border)',
          }}
        />
        <span className="relative z-[1]" style={{ color: done || current ? 'white' : unlocked ? color : 'var(--muted-foreground)' }}>
          {done ? (
            skipped ? <RotateCcwIcon className="size-5" /> : <CheckIcon className="size-6" />
          ) : unlocked ? (
            <span className="font-mono text-lg font-extrabold">{lesson.pos}</span>
          ) : (
            <LockIcon className="size-4" />
          )}
        </span>
      </span>
      <span className={cn('max-w-[112px] truncate text-center font-mono text-[9px] font-bold tracking-wide', current ? '' : unlocked ? 'text-muted-foreground' : 'text-muted-foreground/60')} style={current ? { color } : undefined}>
        {lesson.short}
      </span>
    </button>
  )
}
