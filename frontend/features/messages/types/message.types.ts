export interface Message {
  id: string;

  conversationId: string;

  senderId: string;

  content: string;

  createdAt: string;

  updatedAt: string;
}

export interface SendMessagePayload {
  conversationId: string;

  content: string;
}