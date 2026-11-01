import { createStore } from "zustand/vanilla";

export interface ChatState {
  activeConversationId: string | null;

  messageDrafts: Record<string, string>;

  setActiveConversation: (id: string | null) => void;

  setMessageDraft: (
    id: string,
    message: string
  ) => void;

  clearMessageDraft: (id: string) => void;
}

export function createChatStore() {
  return createStore<ChatState>((set) => ({
    activeConversationId: null,
    messageDrafts: {},
    setActiveConversation: (id) => set({
      activeConversationId: id
    }),
    setMessageDraft: (id, message) => set((state) => ({
      messageDrafts: {
        ...state.messageDrafts,
        [id]: message
      }
    })),
    clearMessageDraft: (id) => set((state) => {
      const drafts = { ...state.messageDrafts };

      delete drafts[id];

      return {
        messageDrafts: drafts
      };
    }),
  }));
}

export type ChatStore = ReturnType<typeof createChatStore>;
