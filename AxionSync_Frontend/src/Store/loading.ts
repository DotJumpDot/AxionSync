import { create } from "zustand";

interface PageLoadingState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const usePageLoadingStore = create<PageLoadingState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
