"use client";

import LoginDialogue from "@/Components/Auth/LoginDialogue";
import LanguageSwitcher from "@/Components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function LocalizedHomePage() {
  const tHome = useTranslations("home");
  const tCommon = useTranslations("common");
  const [showLogin, setShowLogin] = useState(false);

  const toggleLogin = () => {
    setShowLogin((prev) => !prev);
  };

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "var(--color-primary)",
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
            {tCommon("appName")}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "end", gap: "10px" }}>
          <LanguageSwitcher />
        </div>
      </header>

      <div
        style={{
          display: "flex",
          height: "100vh",
          backgroundImage: "url('/background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center left",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingRight: "8%",
        }}
      >
        <div
          style={{
            maxWidth: "450px",
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            padding: "40px",
            borderRadius: "12px",
            backdropFilter: "blur(4px)",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              lineHeight: "1.3",
              marginBottom: "20px",
            }}
          >
            {tHome("heroHeading")}
          </h1>

          <p
            style={{
              fontSize: "1rem",
              lineHeight: "1.6",
              marginBottom: "30px",
              color: "#f5f5f5",
            }}
          >
            {tHome("heroDescription")}
          </p>

          <button
            onClick={toggleLogin}
            style={{
              padding: "12px 32px",
              border: "2px solid #fff",
              borderRadius: "6px",
              backgroundColor: "transparent",
              color: "#fff",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
              width: "200px",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            {tHome("heroLogin")}
          </button>
        </div>
      </div>

      {showLogin && <LoginDialogue toggleLogin={toggleLogin} />}
    </div>
  );
}
