"use client";

import { useMemo } from "react";
import { Image } from "antd";
import type { Memo } from "@/Types/Memo";
import type { User } from "@/Types/User";
import MemoContextMenu from "./MemoContextMenu";

type MemoGroup = {
  id: string;
  created_at: string;
  user: User;
  memos: Memo[];
};

type MemoMessageGroupProps = {
  group: MemoGroup;
  hoveredMemoId: number | null;
  openMenuId: number | null;
  editingMemoId: number | null;
  editContent: string;
  currentTabFontSize?: number;
  currentTabFontName?: string;
  onHoverMemo: (id: number | null) => void;
  onMenuToggle: (id: number | null) => void;
  onEdit: (id: number, content: string) => void;
  onEditContentChange: (content: string) => void;
  onEditSave: (id: number) => void;
  onEditCancel: () => void;
  onCollect: (id: number) => void;
  onUncollect: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function MemoMessageGroup({
  group,
  hoveredMemoId,
  openMenuId,
  editingMemoId,
  editContent,
  currentTabFontSize = 15,
  currentTabFontName = "inherit",
  onHoverMemo,
  onMenuToggle,
  onEdit,
  onEditContentChange,
  onEditSave,
  onEditCancel,
  onCollect,
  onUncollect,
  onDelete,
}: MemoMessageGroupProps) {
  const pictureUrl = group.user.picture_url?.trim() || "unidentified.jpg";

  // Generate image source with cache buster based on picture_url
  const imageSrc = useMemo(() => {
    const cacheKey = pictureUrl.split("_")[1] || pictureUrl;
    return `/userProfilePicture/${pictureUrl}?v=${cacheKey}`;
  }, [pictureUrl]);

  return (
    <div
      onMouseEnter={() => onHoverMemo(group.memos[0]?.id ?? null)}
      onMouseLeave={() => {
        // Keep hover if menu is open
        if (!openMenuId) {
          onHoverMemo(null);
        }
      }}
    >
      <div
        style={{
          display: "flex",
          padding: "4px 16px",
          gap: "16px",
          backgroundColor:
            hoveredMemoId !== null &&
            group.memos.some((m) => m.id === hoveredMemoId)
              ? "rgba(255, 255, 255, 0.05)"
              : "transparent",
          borderRadius: "4px",
          transition: "background-color 0.2s",
          position: "relative",
        }}
      >
        {/* Profile Picture */}
        <div style={{ flexShrink: 0, paddingTop: "4px" }}>
          <Image
            src={imageSrc}
            alt={group.user.username}
            width={40}
            height={40}
            preview={false}
            fallback="/userProfilePicture/unidentified.jpg"
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* Content area with menu button container */}
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          {/* Header: Username + Timestamp */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              {group.user.nickname || group.user.username}
            </span>
            <span
              style={{
                color: "#72767d",
                fontSize: "12px",
              }}
            >
              {new Date(group.created_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Messages */}
          {group.memos.map((memo) => (
            <div
              key={memo.id}
              onMouseEnter={() => onHoverMemo(memo.id)}
              style={{
                color: memo.font_color || "#dcddde",
                wordWrap: "break-word",
                fontSize: currentTabFontSize,
                fontFamily: currentTabFontName,
                lineHeight: "1.375",
                marginBottom: "2px",
                position: "relative",
                paddingRight: hoveredMemoId === memo.id ? "60px" : "0px",
                transition: "paddingRight 0.2s ease",
              }}
            >
              {editingMemoId === memo.id ? (
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => onEditContentChange(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#2f3136",
                    border: "1px solid #5865f2",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    color: "#dcddde",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onEditSave(memo.id);
                    } else if (e.key === "Escape") {
                      onEditCancel();
                    }
                  }}
                />
              ) : (
                <span>{memo.content}</span>
              )}
            </div>
          ))}
        </div>

        {/* Menu button - shows when hovering any message */}
        {hoveredMemoId !== null &&
          group.memos.some((m) => m.id === hoveredMemoId) && (
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                display: "flex",
                gap: "4px",
                backgroundColor: "#2f3136",
                border: "1px solid #202225",
                borderRadius: "4px",
                padding: "4px",
                pointerEvents: "auto",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuToggle(
                    openMenuId === hoveredMemoId ? null : hoveredMemoId
                  );
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#b9bbbe",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "16px",
                }}
              >
                •••
              </button>

              {/* Context Menu */}
              {openMenuId === hoveredMemoId &&
                hoveredMemoId !== null &&
                (() => {
                  const memo = group.memos.find((m) => m.id === hoveredMemoId);
                  return memo ? (
                    <MemoContextMenu
                      memo={memo}
                      isEditing={editingMemoId === hoveredMemoId}
                      onEdit={() => onEdit(hoveredMemoId, memo.content)}
                      onSave={() => onEditSave(hoveredMemoId)}
                      onCancel={onEditCancel}
                      onCollect={() => onCollect(hoveredMemoId)}
                      onUncollect={() => onUncollect(hoveredMemoId)}
                      onDelete={() => onDelete(hoveredMemoId)}
                    />
                  ) : null;
                })()}
            </div>
          )}
      </div>
    </div>
  );
}
