// stores/userStore.ts
import { create } from "zustand";
import userService from "@/Service/user";
import type { User, UserUpdate } from "@/Types/User";

type UserStore = {
  users: User[];
  editedUser: User | null;
  loading: boolean;
  getUsers: () => Promise<{ success: boolean; message?: string }>;
  getUser: (id: number) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (
    userId: number,
    data: UserUpdate
  ) => Promise<{ success: boolean; message?: string; user?: User }>;
  uploadPicture: (
    userId: number,
    file: File
  ) => Promise<{ success: boolean; message?: string; user?: User }>;
};

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  editedUser: null,
  loading: false,

  // 🔹 Get all users
  getUsers: async () => {
    set({ loading: true });
    try {
      const res = await userService.getUsers();

      set({ users: res.data, loading: false });

      return { success: true };
    } catch (e) {
      console.error("Failed to fetch users:", e);
      set({ loading: false });

      return { success: false, message: "Failed to get users" };
    }
  },

  // 🔹 Get user by id
  getUser: async (id: number) => {
    set({ loading: true });
    try {
      const res = await userService.getUser(id);

      set({ editedUser: res.data, loading: false });

      return { success: true };
    } catch (e) {
      console.error("Failed to fetch user:", e);
      set({ loading: false });

      return { success: false, message: "Failed to get user" };
    }
  },

  // 🔹 Update user profile
  updateProfile: async (userId: number, data: UserUpdate) => {
    set({ loading: true });
    try {
      const res = await userService.updateProfile(userId, data);

      set({ editedUser: res.data, loading: false });

      return { success: true, user: res.data };
    } catch (e) {
      console.error("Failed to update profile:", e);
      set({ loading: false });

      return { success: false, message: "Failed to update profile" };
    }
  },

  // 🔹 Upload profile picture
  uploadPicture: async (userId: number, file: File) => {
    set({ loading: true });
    try {
      const res = await userService.uploadPicture(userId, file);

      if (res.data.success && res.data.user) {
        set({ editedUser: res.data.user, loading: false });
        return { success: true, user: res.data.user };
      }

      set({ loading: false });
      return { success: false, message: "Failed to upload picture" };
    } catch (e) {
      console.error("Failed to upload picture:", e);
      set({ loading: false });

      return { success: false, message: "Failed to upload picture" };
    }
  },
}));
