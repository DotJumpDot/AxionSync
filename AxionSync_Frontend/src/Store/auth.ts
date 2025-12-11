// stores/authStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import authService from "@/Service/auth";
import type { User } from "@/Types/User";
import type { LoginRequest, LoginResponse } from "@/Types/Auth";
import { Locale } from "@/languages/config";

type AuthStore = {
  user: User | null;
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
      token: null,
      tokenExpiresAt: null,
      logoutTimeoutId: null,
      locale: "en" as Locale,

      setLocale: (locale: Locale) => {
        set({ locale });
      },

      login: async (data: LoginRequest) => {
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
            console.log("[AUTH] Login successful:", {
              user: result.user.username,
              token: result.token.substring(0, 20) + "...",
              expiresAt: result.expiresAt,
              expiresAtMs,
            });

            // Update state (this will trigger persist middleware to save to localStorage)
            set({
              user: result.user,
              token: result.token,
              tokenExpiresAt: expiresAtMs,
            });

            // Wait a tick to ensure localStorage is persisted before returning
            // This ensures the token is available when mainmenu page mounts
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Schedule auto-logout exactly at expiry
            const delay = Math.max(0, expiresAtMs - Date.now());
            if (typeof window !== "undefined") {
              const id = window.setTimeout(() => {
                set({
                  user: null,
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

          console.warn("[AUTH] Login failed:", result);
          return { success: false };
        } catch (e) {
          console.error("[AUTH] Login error:", e);
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
            token: null,
            tokenExpiresAt: null,
            logoutTimeoutId: null,
          } as AuthStore;
        });

        // Clear persist
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
          // Clear expired token
          restored.user = null;
          restored.token = null;
          restored.tokenExpiresAt = null;
        } else {
          // Token is valid, schedule logout for remaining duration
          const remaining = restored.tokenExpiresAt! - now;
          if (typeof window !== "undefined") {
            const id = window.setTimeout(() => {
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
