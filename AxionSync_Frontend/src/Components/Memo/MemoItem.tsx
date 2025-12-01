import type { Memo } from "@/Types/Memo";
import type { Tab } from "@/Types/Tab";
import MemoContextMenu from "./MemoContextMenu";

interface MemoItemProps {
  memo: Memo;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editContent: string;
  openMenuId: number | null;
  currentTab: Tab | null;
  currentUserId: number | undefined;
  showHeader?: boolean;
  onSelect: () => void;
  onHoverChange: (hovered: boolean) => void;
  onEditChange: (content: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onMenuToggle: () => void;
  onEdit: () => void;
  onCollect?: () => void;
  onUncollect?: () => void;
  onDelete: () => void;
  onMenuClose: () => void;
}

export default function MemoItem({
  memo,
  isSelected,
  isHovered,
  isEditing,
  editContent,
  openMenuId,
  currentTab,
  currentUserId,
  showHeader = true,
  onSelect,
  onHoverChange,
  onEditChange,
  onEditSave,
  onEditCancel,
  onMenuToggle,
  onEdit,
  onCollect,
  onUncollect,
  onDelete,
  onMenuClose,
}: MemoItemProps) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: "4px",
        backgroundColor: isSelected ? "#40444b" : "transparent",
        cursor: "pointer",
        transition: "background-color 0.2s",
        position: "relative",
      }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onClick={onSelect}
    >
      <div
        style={{
          display: "flex",
          alignItems: showHeader ? "center" : "flex-start",
          marginBottom: "4px",
        }}
      >
        {showHeader && (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: memo.collected
                ? "#43b581"
                : currentTab?.color || "#5865f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "600",
              marginRight: "12px",
            }}
          >
            {memo.collected ? "✓" : memo.user.username.charAt(0).toUpperCase()}
          </div>
        )}
        {!showHeader && <div style={{ width: "52px" }} />}
        <div style={{ flex: 1 }}>
          {showHeader && (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 500, fontSize: 16 }}>
                {memo.user.username}
              </span>
              <span style={{ color: "#72767d", fontSize: 12 }}>
                {new Date(memo.created_at).toLocaleString()}
              </span>
              {memo.collected && (
                <span
                  style={{
                    color: "#43b581",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  • COLLECTED
                </span>
              )}
            </div>
          )}
          {isEditing ? (
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                value={editContent}
                onChange={(e) => onEditChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onEditSave();
                  if (e.key === "Escape") onEditCancel();
                }}
                style={{
                  width: "100%",
                  padding: 8,
                  backgroundColor: "#40444b",
                  border: "1px solid #5865f2",
                  borderRadius: 4,
                  color: "#dcddde",
                  fontSize: 15,
                  outline: "none",
                }}
                autoFocus
              />
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button
                  onClick={onEditSave}
                  style={{
                    padding: "4px 12px",
                    backgroundColor: "#43b581",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={onEditCancel}
                  style={{
                    padding: "4px 12px",
                    backgroundColor: "#4f545c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                color: memo.font_color || "#dcddde",
                marginTop: 4,
                fontFamily: currentTab?.font_name || "inherit",
                fontSize: currentTab?.font_size || 15,
              }}
            >
              {memo.content}
            </div>
          )}
        </div>
        {currentUserId && memo.user.id === currentUserId && isHovered && (
          <div
            style={{ position: "relative", marginLeft: 8 }}
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle();
            }}
          >
            <div
              style={{
                cursor: "pointer",
                padding: "4px 8px",
                color: "#b9bbbe",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              ⋯
            </div>
            <MemoContextMenu
              memo={memo}
              isOpen={openMenuId === memo.id}
              onEdit={onEdit}
              onCollect={onCollect}
              onUncollect={onUncollect}
              onDelete={onDelete}
              onClose={onMenuClose}
            />
          </div>
        )}
      </div>
    </div>
  );
}
