"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/Store/auth";
import type { LoginRequest } from "@/Types/Auth";
import { validateLoginRequest } from "@/Functions/Auth/validate_login";
import { useRouter } from "next/navigation";
import { useNotification } from "@/Functions/Notification/useNotification";
import { useLocale } from "next-intl";
import { Locale } from "@/languages/config";
import { usePageLoadingStore } from "@/Store/loading";

function LoginDialogue({ toggleLogin }: { toggleLogin: () => void }) {
  const { showNotification } = useNotification();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [visible, setVisible] = useState(false);

  const router = useRouter();
  const locale = useLocale();
  const { login, token, tokenExpiresAt, setLocale } = useAuthStore();
  const setPageLoading = usePageLoadingStore((s) => s.setLoading);

  // const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Animation for showing dialog
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  // Auto redirect on login success
  useEffect(() => {
    if (!token || !tokenExpiresAt) {
      console.log("[LOGIN] Waiting for token...", {
        token: !!token,
        tokenExpiresAt,
      });
      return;
    }
    if (Date.now() >= tokenExpiresAt) {
      console.warn("[LOGIN] Token expired", {
        tokenExpiresAt,
        now: Date.now(),
      });
      return;
    }

    // Token is valid, redirect immediately without delay
    console.log("[LOGIN] Token valid, redirecting to mainmenu...", {
      locale,
      user: token.substring(0, 20) + "...",
    });

    // Small timeout to ensure localStorage is synced before navigation
    const timeout = setTimeout(() => {
      setLocale(locale as Locale);
      toggleLogin();
      router.push(`/${locale}/mainmenu`);
    }, 50);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tokenExpiresAt]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => toggleLogin(), 150);
  };

  // ===========================
  //       NOTIFICATION (AntD)
  // ===========================
  const showNotice = (
    msg: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    showNotification(msg, type);
  };

  // ===========================
  //          LOGIN
  // ===========================
  const handleLogin = async () => {
    setPageLoading(true);
    const request: LoginRequest = { username, password };

    const validationError = validateLoginRequest(request);
    if (validationError) {
      showNotice(validationError, "error");
      setPageLoading(false);
      return;
    }

    const result = await login(request);

    setPageLoading(false);
    if (result.success) {
      showNotice("Login Successful. Welcome back!", "success");
      return;
    }

    showNotice("Invalid username or password.", "error");
  };

  return (
    <div>
      {/* Login Dialog */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "30px",
            width: "500px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
            transform: visible ? "scale(1)" : "scale(0.7)",
            opacity: visible ? 1 : 0,
            transition: "all 0.15s ease-out",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "1.5rem",
              color: "var(--color-primary)",
            }}
          >
            Login
          </h2>

          {/* Username */}
          <div style={{ marginBottom: "15px", position: "relative" }}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 36px 10px 10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
            />

            {username && (
              <button
                onClick={() => setUsername("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "32px",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "20px", position: "relative" }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 36px 10px 10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
            />

            {password && (
              <button
                onClick={() => setPassword("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "32px",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Error (optional) */}

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "#f5f5f5",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleLogin}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--color-primary)",
                color: "white",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </div>

          <button
            style={{
              marginTop: "15px",
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid var(--color-primary)",
              backgroundColor: "transparent",
              color: "var(--color-primary)",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginDialogue;
