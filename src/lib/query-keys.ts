export const queryKeys = {
  ai: {
    ask: (topicId: string) => ['ai', 'ask', topicId] as const,
  },
}
