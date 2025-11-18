// stores/userStore.ts
import { create } from "zustand";
import userService from "@/Service/user";
import type { User } from "@/Types/User";

type UserStore = {
  users: User[];
  editedUser: User | null;
  loading: boolean;
  getUsers: () => Promise<{ success: boolean; message?: string }>;
  getUser: (id: number) => Promise<{ success: boolean; message?: string }>;
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
}));
