"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { useMemoStore } from "@/Store/memo";
import { useTabStore } from "@/Store/tab";
import { useAuthStore } from "@/Store/auth";
import { useNotification } from "@/Functions/Notification/useNotification";
import MemoHeader from "@/Components/Memo/MemoHeader";
import MemoItem from "@/Components/Memo/MemoItem";
import MemoSidebar from "@/Components/Memo/MemoSidebar";
import TabModal from "@/Components/Memo/TabModal";
import type { Memo } from "@/Types/Memo";
import type { CreateTabRequest, UpdateTabRequest } from "@/Types/Tab";
import {
  scrollToMemo,
  scrollToBottom,
} from "@/Functions/Memo/memo_function_scroll";
import { filterCollectedMemos } from "@/Functions/Memo/memo_function_filters";
import {
  applyColorToAllMemos,
  shouldShowMemoHeader,
} from "@/Functions/Memo/memo_function_helpers";
import {
  handleMemoDelete,
  handleMemoCollect,
  handleMemoUncollect,
  handleMemoUpdate,
  handleMemoColorUpdate,
  handleTabUpdate,
  handleTabCreate,
} from "@/Functions/Memo/memo_function_handlers";

export default function MemoPage() {
  const {
    memos,
    loading,
    getMemos,
    createMemo,
    updateMemo,
    deleteMemo,
    collectMemo,
    uncollectMemo,
  } = useMemoStore();
  const { tabs, currentTabId, getTabs, setCurrentTab, updateTab, createTab } =
    useTabStore();
  const { user } = useAuthStore();
  const { showNotification: baseShowNotification, modal } = useNotification();

  // Wrap notification to use topLeft placement for memo page
  const showNotification = (
    msg: string,
    type?: "success" | "error" | "info" | "warning",
    duration?: number
  ) => {
    baseShowNotification(msg, type, duration, "topLeft");
  };

  const [input, setInput] = useState("");
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [panelTab, setPanelTab] = useQueryState("panel", {
    defaultValue: "details" as "details" | "collected",
  });
  const [hoveredMemo, setHoveredMemo] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingMemoId, setEditingMemoId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [channelEditing, setChannelEditing] = useState(false);
  const [channelNameDraft, setChannelNameDraft] = useState("");
  const [openTabModal, setOpenTabModal] = useState<false | "create" | "edit">(
    false
  );
  const [defaultMemoColor, setDefaultMemoColor] = useState("#dcddde");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const currentTab = useMemo(
    () => tabs.find((t) => t.id === currentTabId) || null,
    [tabs, currentTabId]
  );
  const collectedMemos = useMemo(() => filterCollectedMemos(memos), [memos]);

  useEffect(() => {
    getTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      (currentTabId == null || tabs.every((t) => t.id !== currentTabId)) &&
      tabs.length > 0
    ) {
      setCurrentTab(tabs[0].id);
    }
  }, [tabs, currentTabId, setCurrentTab]);

  useEffect(() => {
    if (currentTabId != null) {
      getMemos(currentTabId);
    }
  }, [currentTabId, getMemos]);

  useEffect(() => {
    scrollToBottom(messagesEndRef);
  }, [memos.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    createMemo({
      title: "Memo",
      content: input.trim(),
      tab_id: currentTabId ?? undefined,
      font_color: defaultMemoColor,
    }).then((result) => {
      if (result.success) {
        showNotification("Memo sent!", "success");
        setInput("");
        setTimeout(() => scrollToBottom(messagesEndRef), 50);
      } else {
        showNotification(result.message || "Failed to send memo", "error");
      }
    });
  };

  const handleDelete = (id: number) =>
    handleMemoDelete(id, deleteMemo, showNotification, (deletedId: number) => {
      if (selectedMemo?.id === deletedId) setSelectedMemo(null);
      setOpenMenuId(null);
    });

  const handleCollect = (id: number) =>
    handleMemoCollect(id, collectMemo, showNotification, () =>
      setOpenMenuId(null)
    );

  const handleUncollect = (id: number) =>
    handleMemoUncollect(id, uncollectMemo, showNotification, () =>
      setOpenMenuId(null)
    );

  const saveEditMemo = (id: number) =>
    handleMemoUpdate(
      id,
      "Memo",
      editContent,
      updateMemo,
      showNotification,
      () => {
        setEditingMemoId(null);
        setEditContent("");
      }
    );

  const saveChannelName = () => {
    if (!currentTab || !channelNameDraft.trim()) {
      setChannelEditing(false);
      return;
    }
    handleTabUpdate(
      currentTab.id,
      {
        tab_name: channelNameDraft.trim(),
        color: currentTab.color,
        font_name: currentTab.font_name,
        font_size: currentTab.font_size,
      },
      updateTab,
      showNotification,
      () => setChannelEditing(false)
    );
  };

  const handleSubmitTab = (data: CreateTabRequest | UpdateTabRequest) => {
    if (openTabModal === "create") {
      handleTabCreate(
        data as CreateTabRequest,
        createTab,
        showNotification,
        (tabId: number) => {
          setCurrentTab(tabId);
          setOpenTabModal(false);
        }
      );
    } else if (openTabModal === "edit" && currentTab) {
      handleTabUpdate(
        currentTab.id,
        data as UpdateTabRequest,
        updateTab,
        showNotification,
        () => setOpenTabModal(false)
      );
    }
  };

  const handleSetDefaultColor = () => {
    if (selectedMemo && selectedMemo.font_color) {
      setDefaultMemoColor(selectedMemo.font_color);
      showNotification(
        `Default color set to ${selectedMemo.font_color}`,
        "success"
      );
    }
  };

  const handleColorApplyAll = () => {
    if (!selectedMemo) return;

    modal.confirm({
      title: "Apply Color to All Memos",
      content: `Are you sure you want to apply the color "${
        selectedMemo.font_color || "#dcddde"
      }" to all memos in this tab?`,
      okText: "Apply",
      okType: "primary",
      cancelText: "Cancel",
      onOk: async () => {
        const targetColor = selectedMemo.font_color || "#dcddde";
        await applyColorToAllMemos(
          memos,
          targetColor,
          updateMemo,
          getMemos,
          currentTabId,
          showNotification
        );
      },
    });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#36393f",
        fontFamily: currentTab?.font_name || "inherit",
        fontSize: currentTab?.font_size || 15,
      }}
      onClick={() => setOpenMenuId(null)}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <MemoHeader
          currentTab={currentTab}
          tabs={tabs}
          currentTabId={currentTabId}
          channelEditing={channelEditing}
          channelNameDraft={channelNameDraft}
          onChannelNameChange={setChannelNameDraft}
          onChannelNameSave={saveChannelName}
          onChannelEditStart={() => {
            if (currentTab) {
              setChannelNameDraft(currentTab.tab_name);
              setChannelEditing(true);
            }
          }}
          onChannelEditCancel={() => setChannelEditing(false)}
          onTabChange={setCurrentTab}
          onEditTab={() => setOpenTabModal("edit")}
          onCreateTab={() => setOpenTabModal("create")}
        />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {memos.map((memo, index) => (
            <div
              key={memo.id}
              ref={(el) => {
                messageRefs.current[memo.id] = el;
              }}
              style={{
                marginTop: shouldShowMemoHeader(memo, index, memos) ? 16 : 0,
              }}
            >
              <MemoItem
                memo={memo}
                isSelected={selectedMemo?.id === memo.id}
                isHovered={hoveredMemo === memo.id}
                isEditing={editingMemoId === memo.id}
                editContent={editContent}
                openMenuId={openMenuId}
                currentTab={currentTab}
                currentUserId={user?.id}
                showHeader={shouldShowMemoHeader(memo, index, memos)}
                onSelect={() => setSelectedMemo(memo)}
                onHoverChange={(hovered) => {
                  if (hovered) setHoveredMemo(memo.id);
                  else if (openMenuId !== memo.id) setHoveredMemo(null);
                }}
                onEditChange={setEditContent}
                onEditSave={() => saveEditMemo(memo.id)}
                onEditCancel={() => {
                  setEditingMemoId(null);
                  setEditContent("");
                }}
                onMenuToggle={() =>
                  setOpenMenuId(openMenuId === memo.id ? null : memo.id)
                }
                onEdit={() => {
                  setEditingMemoId(memo.id);
                  setEditContent(memo.content);
                  setOpenMenuId(null);
                }}
                onCollect={
                  !memo.collected ? () => handleCollect(memo.id) : undefined
                }
                onUncollect={
                  memo.collected ? () => handleUncollect(memo.id) : undefined
                }
                onDelete={() => handleDelete(memo.id)}
                onMenuClose={() => setOpenMenuId(null)}
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            padding: 16,
            borderTop: "1px solid #202225",
            backgroundColor: "#2f3136",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="# Message"
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: "1px solid #202225",
                borderRadius: 6,
                padding: "12px 14px",
                color: "#dcddde",
                outline: "none",
                fontSize: 15,
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                padding: "0 16px",
                backgroundColor: "#5865f2",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <MemoSidebar
        panelTab={(panelTab as "details" | "collected") || "details"}
        selectedMemo={selectedMemo}
        collectedMemos={collectedMemos}
        currentTab={currentTab}
        onPanelTabChange={setPanelTab}
        onColorChange={(hex) =>
          setSelectedMemo(
            selectedMemo ? { ...selectedMemo, font_color: hex } : null
          )
        }
        onColorSave={() => {
          if (selectedMemo) {
            handleMemoColorUpdate(
              selectedMemo,
              selectedMemo.font_color,
              updateMemo,
              showNotification
            );
          }
        }}
        onSetDefaultColor={handleSetDefaultColor}
        onColorApplyAll={handleColorApplyAll}
        onCollectedMemoClick={(memo) => {
          scrollToMemo(memo.id, messageRefs.current);
          setSelectedMemo(memo);
          setPanelTab("details");
        }}
      />

      {loading && (
        <div className="global-loading">
          <div className="global-spinner" />
        </div>
      )}

      {openTabModal && (
        <TabModal
          isOpen={!!openTabModal}
          mode={openTabModal}
          initialData={
            openTabModal === "edit" && currentTab
              ? {
                  tab_name: currentTab.tab_name,
                  color: currentTab.color,
                  font_name: currentTab.font_name,
                  font_size: currentTab.font_size,
                }
              : undefined
          }
          onSubmit={handleSubmitTab}
          onClose={() => setOpenTabModal(false)}
        />
      )}
    </div>
  );
}
