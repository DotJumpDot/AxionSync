"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { useTranslations } from "next-intl";
import { useMemoStore } from "@/Store/memo";
import { useTabStore } from "@/Store/tab";
import { useNotification } from "@/Functions/Notification/useNotification";
import MemoHeader from "@/Components/Memo/MemoHeader";
import MemoSidebar from "@/Components/Memo/MemoSidebar";
import MemoMessageGroup from "@/Components/Memo/MemoMessageGroup";
import TabModal from "@/Components/Memo/TabModal";
import type { Memo } from "@/Types/Memo";
import type { CreateTabRequest, UpdateTabRequest } from "@/Types/Tab";
import {
  scrollToMemo,
  scrollToBottom,
} from "@/Functions/Memo/memo_function_scroll";
import { filterCollectedMemos } from "@/Functions/Memo/memo_function_filters";
import { applyColorToAllMemos } from "@/Functions/Memo/memo_function_helpers";
import { groupMemos } from "@/Functions/Memo/memo_function_grouping";
import {
  handleMemoDelete,
  handleMemoCollect,
  handleMemoUncollect,
  handleMemoUpdate,
  handleMemoColorUpdate,
  handleTabUpdate,
  handleTabCreate,
} from "@/Functions/Memo/memo_function_handlers";
import useShowDeleteConfirm from "@/Components/Modal/DeleteConfirmModal";
import useShowConfirmAllColorModal from "@/Components/Modal/Memo_ConfirmAllColorModal";

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
  const { showNotification: baseShowNotification, modal } = useNotification();
  const tMemo = useTranslations("memo");
  const tCommon = useTranslations("common");
  const showDeleteConfirm = useShowDeleteConfirm();
  const showConfirmAllColorModal = useShowConfirmAllColorModal();

  // Wrap notification to use topLeft placement for memo page (error only)
  const showNotification = (
    msg: string,
    type?: "error" | "warning" | "info"
  ) => {
    baseShowNotification(msg, type, 3000, "topLeft");
  };

  const [input, setInput] = useState("");
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [panelTab, setPanelTab] = useQueryState("panel", {
    defaultValue: "details" as "details" | "collected",
  });
  const [hoveredMemoId, setHoveredMemoId] = useState<number | null>(null);
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
  const inputRef = useRef<HTMLInputElement>(null);

  const currentTab = useMemo(
    () => tabs.find((t) => t.id === currentTabId) || null,
    [tabs, currentTabId]
  );
  const collectedMemos = useMemo(() => filterCollectedMemos(memos), [memos]);
  const memoGroups = useMemo(() => groupMemos(memos), [memos]);

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
        setInput("");
        setTimeout(() => {
          scrollToBottom(messagesEndRef);
          inputRef.current?.focus(); // Keep focus on input
        }, 50);
      } else {
        showNotification(
          result.message || tMemo("messages.sendFailed"),
          "error"
        );
      }
    });
  };

  const handleDelete = (id: number) => {
    showDeleteConfirm(modal, {
      title: "Delete Memo",
      content:
        "Are you sure you want to delete this memo? This action cannot be undone.",
      okText: "Delete",
      cancelText: tCommon("cancel") || "Cancel",
      onConfirm: async () => {
        await handleMemoDelete(
          id,
          deleteMemo,
          showNotification,
          (deletedId: number) => {
            if (selectedMemo?.id === deletedId) setSelectedMemo(null);
            setOpenMenuId(null);
          },
          {
            error: tMemo("messages.deleteFail"),
          }
        );
      },
    });
  };

  const handleCollect = (id: number) =>
    handleMemoCollect(
      id,
      collectMemo,
      showNotification,
      () => setOpenMenuId(null),
      {
        error: tMemo("messages.collectFail"),
      }
    );

  const handleUncollect = (id: number) =>
    handleMemoUncollect(
      id,
      uncollectMemo,
      showNotification,
      () => setOpenMenuId(null),
      {
        error: tMemo("messages.uncollectFail"),
      }
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
      },
      {
        error: tMemo("messages.updateFail"),
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
        ...currentTab,
        tab_name: channelNameDraft,
      },
      updateTab,
      showNotification,
      () => setChannelEditing(false),
      {
        error: tMemo("messages.tabUpdateFail"),
      }
    );
  };

  const handleSetDefaultColor = () => {
    if (!selectedMemo?.font_color) return;
    setDefaultMemoColor(selectedMemo.font_color);
  };

  const handleSubmitTab = (
    data: CreateTabRequest | UpdateTabRequest
  ): Promise<void> => {
    if (openTabModal === "edit" && currentTab) {
      return handleTabUpdate(
        currentTab.id,
        data,
        updateTab,
        showNotification,
        () => setOpenTabModal(false)
      );
    }

    return handleTabCreate(
      data,
      createTab,
      showNotification,
      (newTabId) => {
        setOpenTabModal(false);
        getTabs();
        setCurrentTab(newTabId);
      },
      {
        error: tMemo("messages.tabCreateFail"),
      }
    );
  };

  const handleColorApplyAll = () => {
    if (!selectedMemo) return;

    const targetColor = selectedMemo.font_color || "#dcddde";

    showConfirmAllColorModal(modal, {
      color: targetColor,
      onConfirm: async () => {
        await applyColorToAllMemos(
          memos,
          targetColor,
          updateMemo,
          getMemos,
          currentTabId,
          showNotification,
          {
            error: tMemo("messages.colorFailed"),
          }
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
          className="memo-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px",
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              minHeight: "100%",
            }}
          >
            {memoGroups.map((group, groupIndex) => (
              <div
                key={group.id}
                style={{
                  marginBottom: groupIndex < memoGroups.length - 1 ? 16 : 0,
                }}
              >
                <MemoMessageGroup
                  group={group}
                  hoveredMemoId={hoveredMemoId}
                  openMenuId={openMenuId}
                  editingMemoId={editingMemoId}
                  editContent={editContent}
                  currentTabFontSize={currentTab?.font_size}
                  currentTabFontName={currentTab?.font_name}
                  onHoverMemo={setHoveredMemoId}
                  onMenuToggle={setOpenMenuId}
                  onEdit={(id, content) => {
                    setEditingMemoId(id);
                    setEditContent(content);
                    setOpenMenuId(null);
                  }}
                  onEditContentChange={setEditContent}
                  onEditSave={saveEditMemo}
                  onEditCancel={() => {
                    setEditingMemoId(null);
                    setEditContent("");
                  }}
                  onCollect={handleCollect}
                  onUncollect={handleUncollect}
                  onDelete={handleDelete}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
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
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={tMemo("input.placeholder")}
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
              {tCommon("send")}
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
              showNotification,
              {
                error: tMemo("messages.colorUpdateFail"),
              }
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
