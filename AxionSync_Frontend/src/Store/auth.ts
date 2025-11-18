// stores/authStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import authService from "@/Service/auth";
import type { User } from "@/Types/User";
import type { LoginRequest, LoginResponse } from "@/Types/Auth";

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<{ success: boolean }>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (data: LoginRequest) => {
        set({ loading: true });

        try {
          const res = await authService.login(data);
          const result: LoginResponse = res.data;

          if (result.success && result.user) {
            set({
              user: result.user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            return { success: true };
          }

          set({ loading: false });
          return { success: false };
        } catch {
          set({ loading: false });
          return { success: false };
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });

        // 🔥 เคลียร์ persist ทั้งก้อน
        localStorage.removeItem("auth-store");
      },
    }),
    {
      name: "auth-store", // 🔥 key ที่ใช้เก็บใน localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
