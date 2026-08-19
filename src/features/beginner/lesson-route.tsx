import { useNavigate, useParams } from 'react-router'
import { LessonRunner } from './components/lesson-runner'

export function Component() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const id = Number(lessonId)

  if (!Number.isFinite(id)) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">השלב המבוקש לא נמצא.</p>
      </div>
    )
  }

  return (
    <LessonRunner
      lessonId={id}
      onBack={() => navigate('/beginner')}
      onOpenLesson={(nextId) => navigate(`/beginner/${nextId}`, { replace: true })}
    />
  )
}
