import axios from "axios";
import { useAuthStore } from "@/Store/auth";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
});

// Attach API key and Authorization header if present
instance.interceptors.request.use((config) => {
  // Frontend API key must be exposed as NEXT_PUBLIC_X_API_KEY
  const rawKey = process.env.NEXT_PUBLIC_X_API_KEY;
  let apiKey: string | undefined = rawKey;
  if (rawKey && rawKey.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(rawKey.replace(/'/g, '"'));
      if (Array.isArray(parsed) && parsed.length > 0)
        apiKey = String(parsed[0]);
    } catch {
      // fallback: strip brackets
      apiKey = rawKey
        .replace(/[\[\]\s]/g, "")
        .split(",")[0]
        ?.replace(/['"]/g, "");
    }
  }
  if (apiKey) {
    if (config.headers) {
      (config.headers as Record<string, string>)["X-API-KEY"] = apiKey;
    }
  }

  try {
    const raw = localStorage.getItem("auth-store");
    if (raw) {
      const parsed = JSON.parse(raw);
      const state = parsed?.state ?? parsed; // persist v4 stores under .state
      const token: string | undefined = state?.token;
      const expiresAt: number | undefined = state?.tokenExpiresAt;
      if (token && expiresAt && Date.now() < expiresAt) {
        if (config.headers) {
          (config.headers as Record<string, string>)[
            "Authorization"
          ] = `Bearer ${token}`;
        }
      }
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

// Handle 401 responses by clearing auth and redirecting to login

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear auth state and redirect to login
      try {
        const store = useAuthStore.getState();
        store.logout();
      } catch {
        // fallback: clear localStorage manually
        localStorage.removeItem("auth-store");
      }
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
