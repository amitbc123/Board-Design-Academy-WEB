import { toast } from 'sonner'
import { TriangleAlert } from 'lucide-react'
import { useProgress } from '@/providers/progress-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function ResetProgressDialog() {
  const { resetProgress, dbAvailable } = useProgress()

  const handleReset = async () => {
    await resetProgress()
    toast.success('ההתקדמות אופסה')
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle>איפוס התקדמות</CardTitle>
        <CardDescription>
          מוחק את כל סימוני ההשלמה של הנושאים ואת כל היסטוריית המבחנים. לא ניתן לבטל פעולה זו.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={!dbAvailable} className="gap-1.5">
              <TriangleAlert className="size-4" aria-hidden="true" />
              איפוס כל ההתקדמות
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>לאפס את כל ההתקדמות?</AlertDialogTitle>
              <AlertDialogDescription>
                פעולה זו תמחק לצמיתות את כל סימוני השלמת הנושאים, פתיחות הפרקים הידניות, וכל
                היסטוריית ציוני המבחנים. לא ניתן לשחזר את הנתונים לאחר האיפוס.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                כן, איפוס ההתקדמות
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
