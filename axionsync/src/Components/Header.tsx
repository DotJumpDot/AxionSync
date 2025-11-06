import "../app/globals.css";

function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        backgroundColor: "var(--color-secondary)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        height: "10vh",
      }}
    >
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

      <div></div>
    </header>
  );
}

export default Header;
