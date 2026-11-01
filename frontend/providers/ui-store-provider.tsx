import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";

import { useStore } from "zustand";

import {
  createUIStore,
  type UIStore,
  type UIState,
} from "@/stores/ui.store";

const UIStoreContext = createContext<UIStore | null>(null);

export function UIStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const storeRef = useRef<UIStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createUIStore();
  }

  return (
    <UIStoreContext.Provider value={storeRef.current}>
      {children}
    </UIStoreContext.Provider>
  );
}

export function useUIStore<T>(
  selector: (state: UIState) => T
): T {
  const store = useContext(UIStoreContext);

  if (!store) {
    throw new Error("useUIStore must be used inside UIStoreProvider");
  }

  return useStore(store, selector);
}

