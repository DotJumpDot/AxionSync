"use client";

import { useState, useEffect } from "react";

function LoginDialogue({ toggleLogin }: { toggleLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false); // สำหรับ animation

  useEffect(() => {
    // เปิด animation
    const timeout = setTimeout(() => {
      setVisible(true); // เปลี่ยนจาก false → true เพื่อ trigger transition
    }, 0); // หรือใส่เป็น 50-100ms เพื่อ delay เล็กน้อย
    return () => clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    setVisible(false);
    // รอ animation ก่อนค่อยปิดจริง
    setTimeout(() => {
      toggleLogin();
    }, 100);
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
      onClick={handleClose} // กดตรง background ปิด
    >
      <div
        onClick={(e) => e.stopPropagation()} // กันไม่ให้ปิดเมื่อคลิกในกล่อง
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
          <label
            htmlFor="username"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#333",
              fontSize: "0.9rem",
            }}
          >
            Username
          </label>
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
              outline: "none",
              fontSize: "1rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "6px",
              color: "#333",
              fontSize: "0.9rem",
            }}
          >
            Password
          </label>
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
              outline: "none",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* ปุ่มคู่ Cancel / Login */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "10px",
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
              color: "#333",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#e0e0e0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#f5f5f5")
            }
          >
            Cancel
          </button>

          <button
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "var(--color-primary)",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Login
          </button>
        </div>

        {/* ปุ่ม Register เต็มความกว้าง */}
        <button
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid var(--color-primary)",
            backgroundColor: "transparent",
            color: "var(--color-primary)",
            cursor: "pointer",
            fontWeight: "600",
            transition: "0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255, 165, 0, 0.1)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default LoginDialogue;
