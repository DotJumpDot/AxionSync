"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/Store/auth"; // ✅ import store
import type { LoginRequest } from "@/Types/Auth";

import { useRouter } from "next/navigation";

function LoginDialogue({ toggleLogin }: { toggleLogin: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [visible, setVisible] = useState(false);

  const router = useRouter();
  const { login, loading, error, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const timeout = setTimeout(() => {
        toggleLogin();
        router.push("/mainmenu");
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, toggleLogin, router]);


  const handleClose = () => {
    setVisible(false);
    setTimeout(() => toggleLogin(), 150);
  };

  const handleLogin = async () => {
    const data: LoginRequest = { username, password };
    await login(data);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={handleClose}
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

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* ✅ แสดง error จาก store */}
        {error && (
          <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>
            {error}
          </p>
        )}

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
  );
}

export default LoginDialogue;
