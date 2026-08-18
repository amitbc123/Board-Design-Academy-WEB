export function ExplanationSection({ paragraphs }: { paragraphs: string[] }) {
  if (paragraphs.length === 0) return null

  return (
    <div className="mx-auto flex max-w-[65ch] flex-col gap-4 text-[1.0625rem] leading-8 text-foreground/90">
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  )
}
