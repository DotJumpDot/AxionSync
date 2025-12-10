// stores/tagStore.ts
import { create } from "zustand";
import tagService from "@/Service/tag";
import type { Tag, CreateTagRequest, UpdateTagRequest } from "@/Types/Tag";

type TagStore = {
  tags: Tag[];
  loading: boolean;
  getTags: () => Promise<{ success: boolean; message?: string }>;
  createTag: (
    data: CreateTagRequest
  ) => Promise<{ success: boolean; message?: string; tag?: Tag }>;
  updateTag: (
    id: number,
    data: UpdateTagRequest
  ) => Promise<{ success: boolean; message?: string; tag?: Tag }>;
  deleteTag: (id: number) => Promise<{ success: boolean; message?: string }>;
};

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  loading: false,

  // 🔹 Get all tags
  getTags: async () => {
    set({ loading: true });
    try {
      const res = await tagService.getTags();
      set({ tags: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch tags:", e);
      set({ loading: false });
      return { success: false, message: "Failed to get tags" };
    }
  },

  // 🔹 Create a new tag
  createTag: async (data: CreateTagRequest) => {
    try {
      const res = await tagService.createTag(data);
      const newTag = res.data;

      // Add to list, sorted by priority
      set((state) => ({
        tags: [...state.tags, newTag].sort(
          (a, b) =>
            b.tag_priority - a.tag_priority || a.name.localeCompare(b.name)
        ),
      }));

      return { success: true, tag: newTag };
    } catch (e) {
      console.error("Failed to create tag:", e);
      return { success: false, message: "Failed to create tag" };
    }
  },

  // 🔹 Update a tag
  updateTag: async (id: number, data: UpdateTagRequest) => {
    try {
      const res = await tagService.updateTag(id, data);
      const updatedTag = res.data;

      // Update in list and re-sort
      set((state) => ({
        tags: state.tags
          .map((t) => (t.id === id ? updatedTag : t))
          .sort(
            (a, b) =>
              b.tag_priority - a.tag_priority || a.name.localeCompare(b.name)
          ),
      }));

      return { success: true, tag: updatedTag };
    } catch (e) {
      console.error("Failed to update tag:", e);
      return { success: false, message: "Failed to update tag" };
    }
  },

  // 🔹 Delete a tag
  deleteTag: async (id: number) => {
    try {
      await tagService.deleteTag(id);

      // Remove from list
      set((state) => ({
        tags: state.tags.filter((t) => t.id !== id),
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to delete tag:", e);
      return { success: false, message: "Failed to delete tag" };
    }
  },
}));
