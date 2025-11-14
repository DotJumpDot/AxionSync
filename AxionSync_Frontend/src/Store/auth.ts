// stores/authStore.ts
import { create } from "zustand";
import authService from "@/Service/auth";
import type { User } from "@/Types/User";
import type { LoginRequest, LoginResponse } from "@/Types/Auth";

type AuthStore = {
  user: User | null;                 // ข้อมูลผู้ใช้ที่ล็อกอินอยู่
  isAuthenticated: boolean;          // สถานะล็อกอิน
  loading: boolean;                  // สถานะโหลดระหว่างล็อกอิน
  error: string | null;              // ข้อผิดพลาดถ้ามี
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // ✅ ฟังก์ชันล็อกอิน
  login: async (data: LoginRequest) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.login(data);
      const result: LoginResponse = res.data;

      if (result.success && result.user) {
        set({
          user: result.user,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({
          error: result.message || "Invalid credentials",
          isAuthenticated: false,
          loading: false,
        });
      }
    } catch (e) {
      console.error("Login failed:", e);
      set({
        error: "Login failed, please try again.",
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  // ✅ ฟังก์ชันล็อกเอาท์
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
