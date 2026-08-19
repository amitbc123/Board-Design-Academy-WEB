import type { LessonConcept } from '../engine/types'
import { RichText } from './rich-text'

export function ConceptStep({ concept, onContinue }: { concept: LessonConcept; onContinue: () => void }) {
  return (
    <div className="mx-auto flex max-w-[74ch] flex-col gap-4">
      <div className="rounded-2xl border bg-muted/30 px-5 py-4">
        <h3 className="mb-2.5 text-[17px] font-extrabold tracking-tight">{concept.h}</h3>
        <RichText
          as="div"
          html={concept.b}
          className="beginner-concept flex flex-col gap-2.5 text-[14px] leading-relaxed text-muted-foreground [&_.fml]:my-1 [&_.fml]:inline-block [&_.fml]:rounded-md [&_.fml]:border [&_.fml]:bg-card [&_.fml]:px-3 [&_.fml]:py-2 [&_.fml]:font-mono [&_.fml]:text-[13px] [&_.fml]:font-medium [&_.fml]:text-foreground [&_.fml]:[direction:ltr] [&_b]:font-semibold [&_b]:text-foreground [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:font-semibold [&_code]:text-primary [&_li]:ms-5 [&_ul]:list-disc"
        />
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="w-full max-w-none self-center rounded-xl bg-primary px-4 py-3 text-[15px] font-bold text-primary-foreground shadow-[0_3px_0_color-mix(in_srgb,var(--primary)_55%,#000)] transition-transform active:translate-y-0.5"
      >
        הבנתי — נתחיל לבנות
      </button>
    </div>
  )
}
