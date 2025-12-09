// stores/authStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import authService from "@/Service/auth";
import type { User } from "@/Types/User";
import type { LoginRequest, LoginResponse } from "@/Types/Auth";
import { Locale } from "@/languages/config";

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean; // not persisted; kept for compatibility but derived by timers
  loading: boolean;
  error: string | null;
  token: string | null;
  tokenExpiresAt: number | null; // epoch ms
  logoutTimeoutId: number | null;
  locale: Locale; // persisted locale preference
  login: (data: LoginRequest) => Promise<{ success: boolean }>;
  logout: () => void;
  setLocale: (locale: Locale) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      token: null,
      tokenExpiresAt: null,
      logoutTimeoutId: null,
      locale: "en" as Locale,

      setLocale: (locale: Locale) => {
        set({ locale });
      },

      login: async (data: LoginRequest) => {
        set({ loading: true });

        try {
          const res = await authService.login(data);
          const result: LoginResponse = res.data;

          if (
            result.success &&
            result.user &&
            result.token &&
            result.expiresAt
          ) {
            const expiresAtMs = new Date(result.expiresAt).getTime();
            set({
              user: result.user,
              isAuthenticated: true,
              loading: false,
              error: null,
              token: result.token,
              tokenExpiresAt: expiresAtMs,
            });
            // Schedule auto-logout exactly at expiry
            const delay = Math.max(0, expiresAtMs - Date.now());
            if (typeof window !== "undefined") {
              const id = window.setTimeout(() => {
                set({
                  user: null,
                  isAuthenticated: false,
                  token: null,
                  tokenExpiresAt: null,
                  logoutTimeoutId: null,
                });
                localStorage.removeItem("auth-store");
              }, delay);
              set({ logoutTimeoutId: id });
            }
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
        set((s) => {
          if (s.logoutTimeoutId) {
            clearTimeout(s.logoutTimeoutId);
          }
          return {
            user: null,
            isAuthenticated: false,
            error: null,
            token: null,
            tokenExpiresAt: null,
            logoutTimeoutId: null,
          } as AuthStore;
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
        token: state.token,
        tokenExpiresAt: state.tokenExpiresAt,
        locale: state.locale,
      }),
      onRehydrateStorage: () => (restored) => {
        if (!restored) return;
        const now = Date.now();
        const keep =
          !!restored.token &&
          !!restored.tokenExpiresAt &&
          now < restored.tokenExpiresAt;
        if (!keep) {
          // mutate restored snapshot to ensure store reflects expired token
          restored.user = null;
          restored.isAuthenticated = false;
          restored.token = null;
          restored.tokenExpiresAt = null;
        } else {
          restored.isAuthenticated = true;
          // schedule logout for remaining duration
          const remaining = restored.tokenExpiresAt! - now;
          if (typeof window !== "undefined") {
            const id = window.setTimeout(() => {
              // cannot call set here; clear via localStorage removal and snapshot mutation is enough
              try {
                localStorage.removeItem("auth-store");
              } catch {}
            }, Math.max(0, remaining));
            restored.logoutTimeoutId = id as unknown as number;
          }
        }
      },
    }
  )
);

// Keep store in sync if 'auth-store' is removed/changed externally (e.g., DevTools)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== "auth-store") return;
    const state = useAuthStore.getState();
    if (!e.newValue) {
      state.logout();
      return;
    }
    try {
      const parsed = JSON.parse(e.newValue);
      const snap = parsed?.state ?? parsed;
      const token: string | null = snap?.token ?? null;
      const tokenExpiresAt: number | null = snap?.tokenExpiresAt ?? null;
      const valid = !!token && !!tokenExpiresAt && Date.now() < tokenExpiresAt;
      if (!valid) {
        state.logout();
      }
    } catch {
      state.logout();
    }
  });
}
