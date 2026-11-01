import { apiClient } from "@/lib/api/api-client";

import type {
  Message,
  SendMessagePayload
} from "../types/message.types";

export function getMessages(
  conversationId: string
): Promise<Message[]> {
  return apiClient(`/conversations/${conversationId}/messages`);
}

export function sendMessage(
  payload: SendMessagePayload
): Promise<Message> {
  return apiClient(`/conversations/${payload.conversationId}/messages`,
    {
      method: "POST",

      body: JSON.stringify({
        content: payload.content
      })
    })
}
