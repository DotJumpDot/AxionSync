// stores/memoStore.ts
import { create } from "zustand";
import memoService from "@/Service/memo";
import type { Memo, CreateMemoRequest } from "@/Types/Memo";

type MemoStore = {
  memos: Memo[];
  loading: boolean;
  pollInterval: number | null;
  lastHash: string | null;
  getMemos: (
    tabId?: number | null
  ) => Promise<{ success: boolean; message?: string; changed?: boolean }>;
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
  startPolling: (tabId: number | null, intervalMs?: number) => void;
  stopPolling: () => void;
};

// Simple hash function to detect data changes
const computeHash = (memos: Memo[]): string => {
  const ids = memos
    .map((m) => `${m.id}:${m.updated_at || m.created_at}`)
    .join(",");
  return ids;
};

export const useMemoStore = create<MemoStore>((set, get) => ({
  memos: [],
  loading: false,
  pollInterval: null,
  lastHash: null,

  // 🔹 Get all memos with smart change detection
  getMemos: async (tabId?: number | null) => {
    try {
      const res = await memoService.getMemos(tabId);
      const newHash = computeHash(res.data);
      const oldHash = get().lastHash;
      const changed = newHash !== oldHash;

      set({
        memos: res.data,
        lastHash: newHash,
      });

      return { success: true, changed };
    } catch (e) {
      console.error("Failed to fetch memos:", e);
      return { success: false, message: "Failed to get memos", changed: false };
    }
  },

  // 🔹 Start smart polling - only updates when data actually changes
  startPolling: (tabId: number | null, intervalMs: number = 5000) => {
    // Clear any existing poll
    const currentInterval = get().pollInterval;
    if (currentInterval) clearInterval(currentInterval);

    // Set initial loading state off - don't show loading on polling
    set({ loading: false });

    const id = window.setInterval(() => {
      get().getMemos(tabId);
    }, intervalMs);

    set({ pollInterval: id });
  },

  // 🔹 Stop polling
  stopPolling: () => {
    const currentInterval = get().pollInterval;
    if (currentInterval) {
      clearInterval(currentInterval);
      set({ pollInterval: null });
    }
  },

  // 🔹 Create a new memo
  createMemo: async (data: CreateMemoRequest) => {
    // Don't show global loading for quick operations
    try {
      const res = await memoService.createMemo(data);
      const newMemo = res.data;

      // Append new memo to the list (newest at bottom)
      set((state) => ({
        memos: [...state.memos, newMemo],
      }));

      return { success: true, memo: newMemo };
    } catch (e) {
      console.error("Failed to create memo:", e);
      return { success: false, message: "Failed to create memo" };
    }
  },

  // 🔹 Delete a memo
  deleteMemo: async (id: number) => {
    // Don't show global loading for quick operations
    try {
      await memoService.deleteMemo(id);

      // Remove from list
      set((state) => ({
        memos: state.memos.filter((m) => m.id !== id),
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to delete memo:", e);
      return { success: false, message: "Failed to delete memo" };
    }
  },

  // 🔹 Collect a memo
  collectMemo: async (id: number) => {
    // Don't show global loading for quick operations
    try {
      const res = await memoService.collectMemo(id);
      const updatedMemo = res.data;

      // Update memo in list
      set((state) => ({
        memos: state.memos.map((m) => (m.id === id ? updatedMemo : m)),
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to collect memo:", e);
      return { success: false, message: "Failed to collect memo" };
    }
  },

  // 🔹 Uncollect a memo
  uncollectMemo: async (id: number) => {
    // Don't show global loading for quick operations
    try {
      const res = await memoService.uncollectMemo(id);
      const updatedMemo = res.data;

      // Update memo in list
      set((state) => ({
        memos: state.memos.map((m) => (m.id === id ? updatedMemo : m)),
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to uncollect memo:", e);
      return { success: false, message: "Failed to uncollect memo" };
    }
  },

  // 🔹 Update a memo
  updateMemo: async (
    id: number,
    data: { title: string; content: string; font_color?: string | null }
  ) => {
    // Don't show global loading for quick operations
    try {
      const res = await memoService.updateMemo(id, data);
      const updatedMemo = res.data;

      // Update memo in list
      set((state) => ({
        memos: state.memos.map((m) => (m.id === id ? updatedMemo : m)),
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to update memo:", e);
      return { success: false, message: "Failed to update memo" };
    }
  },
}));
