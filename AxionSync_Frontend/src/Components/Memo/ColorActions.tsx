interface ColorActionsProps {
  onSave: () => void;
  onSetDefault: () => void;
  onApplyAll: () => void;
}

export default function ColorActions({
  onSave,
  onSetDefault,
  onApplyAll,
}: ColorActionsProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={onSave}
        style={{
          padding: "6px 10px",
          background: "#5865f2",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 12,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#4752c4";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#5865f2";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Save Color
      </button>
      <button
        onClick={onSetDefault}
        style={{
          padding: "6px 10px",
          background: "#4f545c",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 12,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#3e434a";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#4f545c";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Set as Default
      </button>
      <button
        onClick={onApplyAll}
        style={{
          padding: "6px 10px",
          background: "#43b581",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 12,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#3ca374";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#43b581";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Apply to All Memos
      </button>
    </div>
  );
}
