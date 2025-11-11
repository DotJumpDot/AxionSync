"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/Store/auth";

function LogoutBtn() {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/"); // กลับไปหน้าแรกหลัง logout
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "10px 20px",
        backgroundColor: "#ff4d4f",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
    >
      Logout
    </button>
  );
}

export default LogoutBtn;
