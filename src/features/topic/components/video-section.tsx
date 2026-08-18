import { Video } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function VideoSection({ videoIds, topicTitle }: { videoIds: string[]; topicTitle: string }) {
  if (videoIds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
          <Video className="size-8" aria-hidden="true" />
          <p className="text-sm">טרם נוסף סרטון לנושא זה.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {videoIds.map((id) => (
        <div key={id} className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${id}`}
            title={`סרטון עבור הנושא: ${topicTitle}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
