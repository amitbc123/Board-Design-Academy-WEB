// Default model for the "ask AI" panel. Bump this constant if Google renames
// or deprecates it by the time this app is actually used.
export const GEMINI_MODEL = 'gemini-2.5-flash'

const GEMINI_ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

export class MissingApiKeyError extends Error {
  constructor() {
    super('Gemini API key is not set')
    this.name = 'MissingApiKeyError'
  }
}

export class GeminiApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'GeminiApiError'
    this.status = status
  }
}

export interface AskGeminiParams {
  apiKey: string
  topicTitle: string
  topicSummary: string
  question: string
}

export async function askGemini({
  apiKey,
  topicTitle,
  topicSummary,
  question,
}: AskGeminiParams): Promise<string> {
  if (!apiKey.trim()) {
    throw new MissingApiKeyError()
  }

  const systemInstruction =
    'אתה עוזר טכני המסייע לסטודנט הלומד תכנון PCB במהירות גבוהה (שלמות אות, שלמות הספק, ' +
    'תאימות אלקטרומגנטית וסידור פיזי) להתכונן לראיונות עבודה בתחום ההנדסה. ' +
    `הנושא הנוכחי הוא: "${topicTitle}". רקע קצר על הנושא: ${topicSummary} ` +
    'ענה בעברית, בבהירות ובדיוק טכני, וקשר את התשובה לנושא הנוכחי כשרלוונטי.'

  let response: Response
  try {
    response = await fetch(GEMINI_ENDPOINT(GEMINI_MODEL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
      }),
    })
  } catch {
    throw new GeminiApiError(0, 'network')
  }

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = (await response.json()) as { error?: { message?: string } }
      if (body.error?.message) message = body.error.message
    } catch {
      // response body wasn't JSON — fall back to statusText
    }
    throw new GeminiApiError(response.status, message)
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new GeminiApiError(response.status, 'empty response')
  }
  return text
}
