import { useQuery } from "@tanstack/react-query";
import { getMessages } from "../api/message.api";
import { messageKeys } from "./message.keys";

export function useMessages(
  conversationId: string
) {
  return useQuery({
    queryKey: messageKeys.conversation(conversationId),

    queryFn: () => getMessages(conversationId),

    enabled: Boolean(conversationId),

    staleTime: 1000 * 30,
  });
}