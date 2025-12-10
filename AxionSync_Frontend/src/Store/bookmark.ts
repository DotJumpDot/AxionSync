// stores/bookmarkStore.ts
import { create } from "zustand";
import bookmarkService from "@/Service/bookmark";
import type {
  Bookmark,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
  BookmarkType,
  BookmarkStatus,
  BookmarkMood,
} from "@/Types/Bookmark";

type SortByOption = "created" | "rating" | "name" | "lastViewed" | "mood";

type BookmarkStore = {
  bookmarks: Bookmark[];
  loading: boolean;
  selectedBookmark: Bookmark | null;
  filterType: BookmarkType | null;
  filterStatus: BookmarkStatus | null;
  filterMood: BookmarkMood | null;
  filterTag: number | null;
  sortBy: SortByOption;
  includeDeleted: boolean;

  // Actions
  getBookmarks: (params?: {
    type?: BookmarkType | null;
    status?: BookmarkStatus | null;
    include_deleted?: boolean;
  }) => Promise<{ success: boolean; message?: string }>;
  getPublicBookmarks: (
    type?: BookmarkType | null
  ) => Promise<{ success: boolean; message?: string }>;
  getBookmark: (
    id: number
  ) => Promise<{ success: boolean; message?: string; bookmark?: Bookmark }>;
  createBookmark: (
    data: CreateBookmarkRequest
  ) => Promise<{ success: boolean; message?: string; bookmark?: Bookmark }>;
  updateBookmark: (
    id: number,
    data: UpdateBookmarkRequest
  ) => Promise<{ success: boolean; message?: string; bookmark?: Bookmark }>;
  deleteBookmark: (
    id: number
  ) => Promise<{ success: boolean; message?: string }>;
  permanentDeleteBookmark: (
    id: number
  ) => Promise<{ success: boolean; message?: string }>;
  restoreBookmark: (
    id: number
  ) => Promise<{ success: boolean; message?: string; bookmark?: Bookmark }>;
  uploadCoverImage: (
    id: number,
    file: File
  ) => Promise<{ success: boolean; message?: string; bookmark?: Bookmark }>;
  getBookmarksByTag: (
    tagId: number
  ) => Promise<{ success: boolean; message?: string }>;

  // UI State
  setSelectedBookmark: (bookmark: Bookmark | null) => void;
  setFilterType: (type: BookmarkType | null) => void;
  setFilterStatus: (status: BookmarkStatus | null) => void;
  setFilterMood: (mood: BookmarkMood | null) => void;
  setFilterTag: (tagId: number | null) => void;
  setSortBy: (sortBy: SortByOption) => void;
  setIncludeDeleted: (include: boolean) => void;
  clearFilters: () => void;
};

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  loading: false,
  selectedBookmark: null,
  filterType: null,
  filterStatus: null,
  filterMood: null,
  filterTag: null,
  sortBy: "created",
  includeDeleted: false,

  // 🔹 Get all bookmarks for the user
  getBookmarks: async (params) => {
    set({ loading: true });
    try {
      const queryParams: Record<string, string | boolean> = {};
      if (params?.type) queryParams.type = params.type;
      if (params?.status) queryParams.status = params.status;
      if (params?.include_deleted) queryParams.include_deleted = true;

      const res = await bookmarkService.getBookmarks(queryParams);
      set({ bookmarks: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch bookmarks:", e);
      set({ loading: false });
      return { success: false, message: "Failed to get bookmarks" };
    }
  },

  // 🔹 Get public bookmarks
  getPublicBookmarks: async (type) => {
    set({ loading: true });
    try {
      const res = await bookmarkService.getPublicBookmarks(type || undefined);
      set({ bookmarks: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch public bookmarks:", e);
      set({ loading: false });
      return { success: false, message: "Failed to get public bookmarks" };
    }
  },

  // 🔹 Get a single bookmark
  getBookmark: async (id: number) => {
    try {
      const res = await bookmarkService.getBookmark(id);
      const bookmark = res.data;
      set({ selectedBookmark: bookmark });
      return { success: true, bookmark };
    } catch (e) {
      console.error("Failed to fetch bookmark:", e);
      return { success: false, message: "Failed to get bookmark" };
    }
  },

  // 🔹 Create a new bookmark
  createBookmark: async (data: CreateBookmarkRequest) => {
    try {
      const res = await bookmarkService.createBookmark(data);
      const newBookmark = res.data;

      // Add to list (newest first)
      set((state) => ({
        bookmarks: [newBookmark, ...state.bookmarks],
      }));

      return { success: true, bookmark: newBookmark };
    } catch (e) {
      console.error("Failed to create bookmark:", e);
      return { success: false, message: "Failed to create bookmark" };
    }
  },

  // 🔹 Update a bookmark
  updateBookmark: async (id: number, data: UpdateBookmarkRequest) => {
    try {
      const res = await bookmarkService.updateBookmark(id, data);
      const updatedBookmark = res.data;

      // Update in list
      set((state) => ({
        bookmarks: state.bookmarks.map((b) =>
          b.id === id ? updatedBookmark : b
        ),
        selectedBookmark:
          state.selectedBookmark?.id === id
            ? updatedBookmark
            : state.selectedBookmark,
      }));

      return { success: true, bookmark: updatedBookmark };
    } catch (e) {
      console.error("Failed to update bookmark:", e);
      return { success: false, message: "Failed to update bookmark" };
    }
  },

  // 🔹 Soft delete a bookmark
  deleteBookmark: async (id: number) => {
    try {
      await bookmarkService.deleteBookmark(id);

      // Remove from list (or mark as deleted if includeDeleted is true)
      const { includeDeleted } = get();
      if (includeDeleted) {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, deleted_status: true } : b
          ),
        }));
      } else {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
      }

      return { success: true };
    } catch (e) {
      console.error("Failed to delete bookmark:", e);
      return { success: false, message: "Failed to delete bookmark" };
    }
  },

  // 🔹 Permanently delete a bookmark
  permanentDeleteBookmark: async (id: number) => {
    try {
      await bookmarkService.permanentDeleteBookmark(id);

      // Remove from list
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
        selectedBookmark:
          state.selectedBookmark?.id === id ? null : state.selectedBookmark,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to permanently delete bookmark:", e);
      return {
        success: false,
        message: "Failed to permanently delete bookmark",
      };
    }
  },

  // 🔹 Restore a soft-deleted bookmark
  restoreBookmark: async (id: number) => {
    try {
      const res = await bookmarkService.restoreBookmark(id);
      const restoredBookmark = res.data;

      // Update in list
      set((state) => ({
        bookmarks: state.bookmarks.map((b) =>
          b.id === id ? restoredBookmark : b
        ),
      }));

      return { success: true, bookmark: restoredBookmark };
    } catch (e) {
      console.error("Failed to restore bookmark:", e);
      return { success: false, message: "Failed to restore bookmark" };
    }
  },

  // 🔹 Upload cover image
  uploadCoverImage: async (id: number, file: File) => {
    try {
      const res = await bookmarkService.uploadCoverImage(id, file);
      const updatedBookmark = res.data.bookmark;

      // Update in list
      set((state) => ({
        bookmarks: state.bookmarks.map((b) =>
          b.id === id ? updatedBookmark : b
        ),
        selectedBookmark:
          state.selectedBookmark?.id === id
            ? updatedBookmark
            : state.selectedBookmark,
      }));

      return { success: true, bookmark: updatedBookmark };
    } catch (e) {
      console.error("Failed to upload cover image:", e);
      return { success: false, message: "Failed to upload cover image" };
    }
  },

  // 🔹 Get bookmarks by tag
  getBookmarksByTag: async (tagId: number) => {
    set({ loading: true });
    try {
      const res = await bookmarkService.getBookmarksByTag(tagId);
      set({ bookmarks: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch bookmarks by tag:", e);
      set({ loading: false });
      return { success: false, message: "Failed to get bookmarks by tag" };
    }
  },

  // 🔹 UI State setters
  setSelectedBookmark: (bookmark) => set({ selectedBookmark: bookmark }),
  setFilterType: (type) => set({ filterType: type }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterMood: (mood) => set({ filterMood: mood }),
  setFilterTag: (tagId) => set({ filterTag: tagId }),
  setSortBy: (sortBy) => set({ sortBy }),
  setIncludeDeleted: (include) => set({ includeDeleted: include }),
  clearFilters: () =>
    set({
      filterType: null,
      filterStatus: null,
      filterMood: null,
      filterTag: null,
      sortBy: "created",
      includeDeleted: false,
    }),
}));
