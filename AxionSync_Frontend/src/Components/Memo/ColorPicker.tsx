import React from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function ColorPicker({
  value,
  onChange,
  label = "Color",
}: ColorPickerProps) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <div
          style={{
            color: "#b9bbbe",
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          {label}
        </div>
      )}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="color"
          value={value || "#5865f2"}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "60px",
            height: "40px",
            border: "1px solid #40444b",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: "transparent",
          }}
        />
        <input
          type="text"
          value={value || "#5865f2"}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#FFFFFF"
          maxLength={7}
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: "#40444b",
            border: "1px solid #202225",
            borderRadius: "4px",
            color: "#dcddde",
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}
