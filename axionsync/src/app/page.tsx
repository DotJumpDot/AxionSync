"use client";

function Page() {
  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <header
        style={{
          position: "absolute", // ✅ วางซ้อนบนภาพ
          top: 0,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          backgroundColor: "rgba(0, 0, 0, 0.3)", // ✅ โปร่งใสเล็กน้อย
          backdropFilter: "blur(6px)", // ✅ เพิ่มความฟุ้งแบบกระจก
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
            AxionSync
          </h1>
        </div>
      </header>

      {/* Background Section */}
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
              fontWeight: "700",
              lineHeight: "1.3",
              marginBottom: "20px",
            }}
          >
            AxionSync
          </h1>

          <p
            style={{
              fontSize: "1rem",
              lineHeight: "1.6",
              marginBottom: "30px",
              color: "#f5f5f5",
            }}
          >
            แพลตฟอร์มจัดการชีวิตส่วนตัวแบบครบวงจรรวมทุกอย่างที่สำคัญไว้ในที่เดียว
            ไม่ว่าจะเป็น Daily Tasks, Personal Notes, Book & Movie Tracker,
            หรือแม้แต่ไอเดียระหว่างวัน ทั้งหมดถูกซิงค์และจัดเรียงอย่างเป็นระบบ
            เพื่อให้คุณโฟกัสกับสิ่งที่สำคัญจริง ๆ
          </p>

          <button
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
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
