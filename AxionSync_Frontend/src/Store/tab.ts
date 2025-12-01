import { create } from "zustand";
import { persist } from "zustand/middleware";
import tabService from "@/Service/tab";
import type { Tab, CreateTabRequest, UpdateTabRequest } from "@/Types/Tab";

type TabStore = {
  tabs: Tab[];
  currentTabId: number | null;
  loading: boolean;
  getTabs: () => Promise<{ success: boolean; message?: string }>;
  createTab: (
    data: CreateTabRequest
  ) => Promise<{ success: boolean; message?: string; tab?: Tab }>;
  updateTab: (
    id: number,
    data: UpdateTabRequest
  ) => Promise<{ success: boolean; message?: string }>;
  deleteTab: (id: number) => Promise<{ success: boolean; message?: string }>;
  setCurrentTab: (id: number | null) => void;
};

export const useTabStore = create<TabStore>()(
  persist(
    (set) => ({
      tabs: [],
      currentTabId: null,
      loading: false,

      // 🔹 Get all tabs
      getTabs: async () => {
        set({ loading: true });
        try {
          const res = await tabService.getTabs();
          set({ tabs: res.data, loading: false });
          return { success: true };
        } catch (e) {
          console.error("Failed to fetch tabs:", e);
          set({ loading: false });
          return { success: false, message: "Failed to get tabs" };
        }
      },

      // 🔹 Create a new tab
      createTab: async (data: CreateTabRequest) => {
        set({ loading: true });
        try {
          const res = await tabService.createTab(data);
          const newTab = res.data;

          set((state) => ({
            tabs: [...state.tabs, newTab],
            loading: false,
          }));

          return { success: true, tab: newTab };
        } catch (e) {
          console.error("Failed to create tab:", e);
          set({ loading: false });
          return { success: false, message: "Failed to create tab" };
        }
      },

      // 🔹 Update a tab
      updateTab: async (id: number, data: UpdateTabRequest) => {
        set({ loading: true });
        try {
          const res = await tabService.updateTab(id, data);
          const updatedTab = res.data;

          set((state) => ({
            tabs: state.tabs.map((t) => (t.id === id ? updatedTab : t)),
            loading: false,
          }));

          return { success: true };
        } catch (e) {
          console.error("Failed to update tab:", e);
          set({ loading: false });
          return { success: false, message: "Failed to update tab" };
        }
      },

      // 🔹 Delete a tab
      deleteTab: async (id: number) => {
        set({ loading: true });
        try {
          await tabService.deleteTab(id);

          set((state) => ({
            tabs: state.tabs.filter((t) => t.id !== id),
            currentTabId: state.currentTabId === id ? null : state.currentTabId,
            loading: false,
          }));

          return { success: true };
        } catch (e) {
          console.error("Failed to delete tab:", e);
          set({ loading: false });
          return { success: false, message: "Failed to delete tab" };
        }
      },

      // 🔹 Set current tab
      setCurrentTab: (id: number | null) => set({ currentTabId: id }),
    }),
    {
      name: "tab-storage",
      partialize: (state) => ({ currentTabId: state.currentTabId }),
    }
  )
);
