import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";

import { useStore } from "zustand";

import {
  createChatStore,
  type ChatStore,
  type ChatState,
} from "@/stores/chat.store";

const ChatStoreContext = createContext<ChatStore | null>(
  null
);

export function ChatStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const storeRef = useRef<ChatStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createChatStore();
  }

  return (
    <ChatStoreContext.Provider value={storeRef.current}>
      {children}
    </ChatStoreContext.Provider>
  );
}

export function useChatStore<T>(
  selector: (state: ChatState) => T
): T {
  const store = useContext(ChatStoreContext);

  if (!store) {
    throw new Error("useChatStore must be used inside ChatStoreProvider");
  }

  return useStore(store, selector)
}