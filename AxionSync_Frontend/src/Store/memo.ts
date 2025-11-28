// stores/memoStore.ts
import { create } from "zustand";
import memoService from "@/Service/memo";
import type { Memo, CreateMemoRequest } from "@/Types/Memo";

type MemoStore = {
  memos: Memo[];
  loading: boolean;
  getMemos: () => Promise<{ success: boolean; message?: string }>;
  createMemo: (
    data: CreateMemoRequest
  ) => Promise<{ success: boolean; message?: string; memo?: Memo }>;
  deleteMemo: (id: number) => Promise<{ success: boolean; message?: string }>;
};

export const useMemoStore = create<MemoStore>((set) => ({
  memos: [],
  loading: false,

  // 🔹 Get all memos
  getMemos: async () => {
    set({ loading: true });
    try {
      const res = await memoService.getMemos();
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

      // Prepend new memo to the list (Discord-like: newest on top)
      set((state) => ({
        memos: [newMemo, ...state.memos],
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
}));
