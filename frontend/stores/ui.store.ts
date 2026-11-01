import { createStore } from "zustand/vanilla";

export interface UIState {
  isSidebarOpen: boolean;

  activeModal: string | null;

  toggleSidebar: () => void;

  openModal: (modal: string) => void;

  closeModal: () => void;
}

export function createUIStore() {
  return createStore<UIState>((set) => ({
    isSidebarOpen: true,
    activeModal: null,
    toggleSidebar: () => set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
    openModal: (modal) => set({
      activeModal: modal
    }),
    closeModal: () => set({
      activeModal: null
    })
  }))
}

export type UIStore = ReturnType<typeof createUIStore>;
