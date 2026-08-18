import { useMutation } from '@tanstack/react-query'
import { askGemini, type AskGeminiParams } from '@/lib/gemini-client'

export function useAskAiMutation() {
  return useMutation({
    mutationFn: (params: AskGeminiParams) => askGemini(params),
  })
}
