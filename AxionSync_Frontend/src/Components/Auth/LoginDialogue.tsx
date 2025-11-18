"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/Store/auth";
import type { LoginRequest } from "@/Types/Auth";
import { validateLoginRequest } from "@/validate/V_Auth";

import { useRouter } from "next/navigation";
import { Notice } from "../Notification/NotificationBox";
import NotificationPortal from "../Notification/NotificationPortal";
import NotificationList from "../Notification/NotificationList";

function LoginDialogue({ toggleLogin }: { toggleLogin: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [visible, setVisible] = useState(false);

  const router = useRouter();
  const { login, loading, error, isAuthenticated } = useAuthStore();

  const [notices, setNotices] = useState<Notice[]>([]);

  // const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Animation for showing dialog
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  // Auto redirect on login success
  useEffect(() => {
    if (isAuthenticated) {
      const timeout = setTimeout(() => {
        toggleLogin();
        router.push("/mainmenu");
      }, 150);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => toggleLogin(), 150);
  };

  // ===========================
  //       NOTIFICATION
  // ===========================
  const showNotice = (msg: string, type: Notice["type"]) => {
    const id = crypto.randomUUID();
    const item: Notice = { id, message: msg, type };

    setNotices((prev) => [item, ...prev]); // new one on top

    setTimeout(() => removeNotice(id), 3500);
  };

  const removeNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leaving: true } : n))
    );

    // ลบจริงหลัง animation ~300ms
    setTimeout(() => {
      setNotices((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  // ===========================
  //          LOGIN
  // ===========================
  const handleLogin = async () => {
    const request: LoginRequest = { username, password };

    const validationError = validateLoginRequest(request);
    if (validationError) {
      showNotice(validationError, "error");
      return;
    }

    const result = await login(request);

    if (result.success) {
      showNotice("Login Successful. Welcome back!", "success");
      return;
    }

    showNotice("Invalid username or password.", "error");
  };

  return (
    <div>
      {/* Global Loading */}
      {loading && (
        <div className="global-loading">
          <div className="global-spinner" />
        </div>
      )}

      {/* Notification System */}
      <NotificationPortal>
        <NotificationList notices={notices} remove={removeNotice} />
      </NotificationPortal>

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
          {error && (
            <p
              style={{
                color: "red",
                textAlign: "center",
                marginBottom: "10px",
              }}
            >
              {error}
            </p>
          )}

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
              disabled={loading}
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
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--color-primary)",
                color: "white",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Logging in..." : "Login"}
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
