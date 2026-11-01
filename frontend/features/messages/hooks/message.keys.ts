export const messageKeys = {
  all: ["messages"] as const,

  lists: () => [...messageKeys.all, "lists"] as const,

  conversation: (conversationId: string) => [
    ...messageKeys.lists(),
    conversationId,
  ] as const
}