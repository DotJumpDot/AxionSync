// stores/userStore.ts
import { create } from "zustand";
import userService from "@/Service/user";
import type { User } from "@/Types/User";

type UserStore = {
  users: User[];
  editedUser: User | null;
  getUsers: () => Promise<void>;
  getUser: (id: number) => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  editedUser: null,

  getUsers: async () => {
    try {
      const res = await userService.getUsers();
      set({ users: res.data });
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  },

  getUser: async (id: number) => {
    try {
      const res = await userService.getUser(id);
      set({ editedUser: res.data });
    } catch (e) {
      console.error("Failed to fetch user:", e);
    }
  },
}));
