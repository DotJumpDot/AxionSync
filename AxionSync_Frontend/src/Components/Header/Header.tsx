"use client";

import { useAuthStore } from "@/Store/auth";

function Header() {
  const { user } = useAuthStore(); // ← ดึง user จาก store

  return (
    <header
      style={{
        height: "83px",
        top: 0,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(6px)",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        zIndex: 10,
      }}
    >
      {/* ซ้าย: โลโก้ + ชื่อเว็บ */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "var(--color-primary )",
            borderRadius: "50%",
          }}
        ></div>
        <h1
          style={{
            fontSize: "1.2rem",
            margin: "15px",
            fontWeight: 600,
            color: "white",
          }}
        >
          AxionSync
        </h1>
      </div>

      {/* ขวา: ชื่อผู้ใช้ */}
      <div style={{ display: "flex", alignItems: "center", color: "white" }}>
        {user ? (
          <span
            style={{
              fontSize: "1.3rem",
              fontWeight: 450,
              paddingRight: "20px",
              color: "white",
            }}
          >
            {user.firstname} {user.lastname}
          </span>
        ) : (
          <span
            style={{
              fontSize: "1.3rem",
              fontWeight: 450,
              paddingRight: "20px",
              color: "white",
            }}
          >
            Admin Users
          </span>
        )}
      </div>
    </header>
  );
}

export default Header;
