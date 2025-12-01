import React from "react";
import type { Memo } from "@/Types/Memo";

interface MemoContextMenuProps {
  memo: Memo;
  isOpen: boolean;
  onEdit: () => void;
  onCollect?: () => void;
  onUncollect?: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function MemoContextMenu({
  memo,
  isOpen,
  onEdit,
  onCollect,
  onUncollect,
  onDelete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClose,
}: MemoContextMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: "100%",
        backgroundColor: "#18191c",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
        zIndex: 1000,
        minWidth: "150px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        onClick={onEdit}
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          color: "#dcddde",
          fontSize: "14px",
          borderBottom: "1px solid #2f3136",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#5865f2")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        ✏️ Edit
      </div>
      {!memo.collected && onCollect ? (
        <div
          onClick={onCollect}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            color: "#dcddde",
            fontSize: "14px",
            borderBottom: "1px solid #2f3136",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#43b581")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          ✓ Collect
        </div>
      ) : onUncollect ? (
        <div
          onClick={onUncollect}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            color: "#dcddde",
            fontSize: "14px",
            borderBottom: "1px solid #2f3136",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#faa61a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          ↶ Uncollect
        </div>
      ) : null}
      <div
        onClick={onDelete}
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          color: "#dcddde",
          fontSize: "14px",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#ed4245")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        🗑️ Delete
      </div>
    </div>
  );
}
