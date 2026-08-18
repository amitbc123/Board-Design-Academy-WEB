import type { ComponentType } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { DiagramProps } from '@/content/types'

export function DiagramSection({
  Diagram,
  caption,
}: {
  Diagram?: ComponentType<DiagramProps>
  caption?: string
}) {
  if (!Diagram) return null

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3">
        <Diagram className="max-w-2xl" />
        {caption && <p className="text-center text-sm text-muted-foreground">{caption}</p>}
      </CardContent>
    </Card>
  )
}
