"use client";

import type { Memo } from "@/Types/Memo";

type MemoContextMenuProps = {
  memo: Memo;
  isEditing: boolean;
  isOpen?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onCollect?: () => void;
  onUncollect?: () => void;
  onDelete: () => void;
  onClose?: () => void;
};

export default function MemoContextMenu({
  memo,
  isEditing,
  isOpen = true,
  onEdit,
  onSave,
  onCancel,
  onCollect,
  onUncollect,
  onDelete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClose,
}: MemoContextMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        bottom: "-30px",
        right: "40px",
        backgroundColor: "#2f3136",
        border: "1px solid #202225",
        borderRadius: "4px",
        minWidth: "120px",
        zIndex: 1000,
        boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
      }}
    >
      {!isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "8px 12px",
            backgroundColor: "transparent",
            border: "none",
            color: "#dcddde",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Edit
        </button>
      )}
      {isEditing && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              backgroundColor: "transparent",
              border: "none",
              color: "#43b581",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Save
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              backgroundColor: "transparent",
              border: "none",
              color: "#f04747",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
        </>
      )}
      {!memo.collected && onCollect && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCollect();
          }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "8px 12px",
            backgroundColor: "transparent",
            border: "none",
            color: "#dcddde",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Collect
        </button>
      )}
      {memo.collected && onUncollect && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUncollect();
          }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "8px 12px",
            backgroundColor: "transparent",
            border: "none",
            color: "#dcddde",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Uncollect
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "8px 12px",
          backgroundColor: "transparent",
          border: "none",
          color: "#f04747",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Delete
      </button>
    </div>
  );
}
