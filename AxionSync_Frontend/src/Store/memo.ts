// stores/memoStore.ts
import { create } from "zustand";
import memoService from "@/Service/memo";
import type { Memo, CreateMemoRequest } from "@/Types/Memo";

type MemoStore = {
  memos: Memo[];
  loading: boolean;
  getMemos: (
    tabId?: number | null
  ) => Promise<{ success: boolean; message?: string }>;
  createMemo: (
    data: CreateMemoRequest
  ) => Promise<{ success: boolean; message?: string; memo?: Memo }>;
  updateMemo: (
    id: number,
    data: { title: string; content: string; font_color?: string | null }
  ) => Promise<{ success: boolean; message?: string }>;
  deleteMemo: (id: number) => Promise<{ success: boolean; message?: string }>;
  collectMemo: (id: number) => Promise<{ success: boolean; message?: string }>;
  uncollectMemo: (
    id: number
  ) => Promise<{ success: boolean; message?: string }>;
};

export const useMemoStore = create<MemoStore>((set) => ({
  memos: [],
  loading: false,

  // 🔹 Get all memos (optionally filtered by tab_id)
  getMemos: async (tabId?: number | null) => {
    set({ loading: true });
    try {
      const res = await memoService.getMemos(tabId);
      set({ memos: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch memos:", e);
      set({ loading: false });
      return { success: false, message: "Failed to get memos" };
    }
  },

  // 🔹 Create a new memo
  createMemo: async (data: CreateMemoRequest) => {
    set({ loading: true });
    try {
      const res = await memoService.createMemo(data);
      const newMemo = res.data;

      // Append new memo to the list (newest at bottom)
      set((state) => ({
        memos: [...state.memos, newMemo],
        loading: false,
      }));

      return { success: true, memo: newMemo };
    } catch (e) {
      console.error("Failed to create memo:", e);
      set({ loading: false });
      return { success: false, message: "Failed to create memo" };
    }
  },

  // 🔹 Delete a memo
  deleteMemo: async (id: number) => {
    set({ loading: true });
    try {
      await memoService.deleteMemo(id);

      // Remove from list
      set((state) => ({
        memos: state.memos.filter((m) => m.id !== id),
        loading: false,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to delete memo:", e);
      set({ loading: false });
      return { success: false, message: "Failed to delete memo" };
    }
  },

  // 🔹 Collect a memo
  collectMemo: async (id: number) => {
    set({ loading: true });
    try {
      const res = await memoService.collectMemo(id);
      const updatedMemo = res.data;

      // Update memo in list
      set((state) => ({
        memos: state.memos.map((m) => (m.id === id ? updatedMemo : m)),
        loading: false,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to collect memo:", e);
      set({ loading: false });
      return { success: false, message: "Failed to collect memo" };
    }
  },

  // 🔹 Uncollect a memo
  uncollectMemo: async (id: number) => {
    set({ loading: true });
    try {
      const res = await memoService.uncollectMemo(id);
      const updatedMemo = res.data;

      // Update memo in list
      set((state) => ({
        memos: state.memos.map((m) => (m.id === id ? updatedMemo : m)),
        loading: false,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to uncollect memo:", e);
      set({ loading: false });
      return { success: false, message: "Failed to uncollect memo" };
    }
  },

  // 🔹 Update a memo
  updateMemo: async (
    id: number,
    data: { title: string; content: string; font_color?: string | null }
  ) => {
    set({ loading: true });
    try {
      const res = await memoService.updateMemo(id, data);
      const updatedMemo = res.data;

      // Update memo in list
      set((state) => ({
        memos: state.memos.map((m) => (m.id === id ? updatedMemo : m)),
        loading: false,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to update memo:", e);
      set({ loading: false });
      return { success: false, message: "Failed to update memo" };
    }
  },
}));
