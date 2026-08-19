/**
 * A handful of authored curriculum strings carry inline markup (`<sub>`,
 * `<code>`, `<b>`, `<span class="mp">`) for electrical notation — e.g.
 * "R<sub>DS(on)</sub>". This content is 100% static, ported verbatim from
 * our own data files; it never carries user input or network content, so
 * rendering it as HTML here is safe.
 *
 * A few of the source questions were authored with their markup already
 * HTML-entity-escaped (literal `&lt;sub&gt;` text instead of `<sub>`), which
 * would render as visible garbage. Undo that one extra escaping pass before
 * rendering — content that was written correctly (a bare `<sub>`) has no
 * `&lt;`/`&gt;` to touch, so this is a no-op for everything else.
 */
function decodeDoubleEscaped(html: string): string {
  if (!html.includes('&lt;') && !html.includes('&gt;') && !html.includes('&amp;')) return html
  return html.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

export function RichText({
  html,
  className,
  as: Tag = 'span',
}: {
  html: string
  className?: string
  as?: 'span' | 'div' | 'p'
}) {
  // The page is RTL, but curriculum text freely mixes Hebrew and English (many
  // quiz stages are English-only). Forcing `dir=rtl` on an all-English string
  // pushes trailing punctuation like "?" to the visual start. `plaintext`
  // (one word — that's the actual CSS keyword, not "plain-text") lets the
  // browser's own bidi algorithm pick each paragraph's direction instead of
  // inheriting ours — the same fix the original app used.
  return (
    <Tag
      className={className}
      style={{ unicodeBidi: 'plaintext' }}
      dangerouslySetInnerHTML={{ __html: decodeDoubleEscaped(html) }}
    />
  )
}
