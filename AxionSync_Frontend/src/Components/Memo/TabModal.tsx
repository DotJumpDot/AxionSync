"use client";

import React from "react";
import type { CreateTabRequest, UpdateTabRequest } from "@/Types/Tab";
import { useTranslations } from "next-intl";

interface TabModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: UpdateTabRequest;
  onSubmit: (data: CreateTabRequest | UpdateTabRequest) => void;
  onClose: () => void;
}

export default function TabModal({
  isOpen,
  mode,
  initialData,
  onSubmit,
  onClose,
}: TabModalProps) {
  const tMemo = useTranslations("memo");
  const tCommon = useTranslations("common");
  const [formData, setFormData] = React.useState<CreateTabRequest>({
    tab_name: initialData?.tab_name || "",
    color: initialData?.color || "#5865f2",
    font_name: initialData?.font_name || "Arial",
    font_size: initialData?.font_size || 14,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const [isClosing, setIsClosing] = React.useState(false);
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
  };

  const availableFonts = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Courier New",
    "Verdana",
    "Trebuchet MS",
    "Comic Sans MS",
    "Impact",
    "Tahoma",
  ];

  // ...existing code...

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        animation: isClosing
          ? "fadeOut 0.15s ease-out"
          : "fadeIn 0.15s ease-out",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.9); opacity: 0; }
        }
      `}</style>
      <div
        style={{
          backgroundColor: "#2f3136",
          borderRadius: "8px",
          padding: "24px",
          width: "400px",
          maxWidth: "90%",
          animation: isClosing
            ? "slideOut 0.15s ease-out"
            : "slideIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            color: "#fff",
            fontSize: "20px",
            marginBottom: "20px",
          }}
        >
          {mode === "create"
            ? tMemo("modal.titleCreate")
            : tMemo("modal.titleEdit")}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#b9bbbe",
                fontSize: "12px",
                fontWeight: "600",
                display: "block",
                marginBottom: "8px",
              }}
            >
              {tMemo("modal.tabName")}
            </label>
            <input
              type="text"
              value={formData.tab_name}
              onChange={(e) =>
                setFormData({ ...formData, tab_name: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#40444b",
                border: "1px solid #202225",
                borderRadius: "4px",
                color: "#dcddde",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#b9bbbe",
                fontSize: "12px",
                fontWeight: "600",
                display: "block",
                marginBottom: "8px",
              }}
            >
              {tMemo("modal.color")}
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                style={{
                  width: "60px",
                  height: "40px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="#FFAA00"
                maxLength={7}
                style={{
                  flex: 1,
                  padding: "10px",
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

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                color: "#b9bbbe",
                fontSize: "12px",
                fontWeight: "600",
                display: "block",
                marginBottom: "8px",
              }}
            >
              {tMemo("modal.fontName")}
            </label>
            <select
              value={formData.font_name}
              onChange={(e) =>
                setFormData({ ...formData, font_name: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#40444b",
                border: "1px solid #202225",
                borderRadius: "4px",
                color: "#dcddde",
                fontSize: "14px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {availableFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                color: "#b9bbbe",
                fontSize: "12px",
                fontWeight: "600",
                display: "block",
                marginBottom: "8px",
              }}
            >
              {tMemo("modal.fontSize")}
            </label>
            <input
              type="number"
              value={formData.font_size}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  font_size: parseInt(e.target.value) || 14,
                })
              }
              min={10}
              max={32}
              required
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#40444b",
                border: "1px solid #202225",
                borderRadius: "4px",
                color: "#dcddde",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div
            style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4f545c",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#5865f2",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {mode === "create" ? tCommon("create") : tCommon("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
