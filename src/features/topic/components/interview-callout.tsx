import { GraduationCap } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function InterviewCallout({ note }: { note?: string }) {
  return (
    <Alert variant="interview">
      <GraduationCap aria-hidden="true" />
      <AlertTitle>שאלת ריאיון נפוצה</AlertTitle>
      {note && <AlertDescription>{note}</AlertDescription>}
    </Alert>
  )
}
