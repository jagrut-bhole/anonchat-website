import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { sendMessage } from "../api/message.api";
import { messageKeys } from "./message.keys";
import { Message } from "../types/message.types";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (newMessage) => {
          queryClient.setQueryData(
            messageKeys.conversation(
              newMessage.conversationId
            ),
            (oldMessages: Message[] | undefined) => {
              if (!oldMessages) {
                return [newMessage];
              }
    
              const exists = oldMessages.some(
                (message) => message.id === newMessage.id
              );
    
              if (exists) {
                return oldMessages;
              }
    
              return [...oldMessages, newMessage];
            }
          );
        },
      });
    }