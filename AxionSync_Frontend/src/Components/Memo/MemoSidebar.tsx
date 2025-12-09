"use client";

import type { Memo } from "@/Types/Memo";
import type { Tab } from "@/Types/Tab";
import ColorPicker from "./ColorPicker";
import ColorActions from "./ColorActions";
import { useTranslations } from "next-intl";

interface MemoSidebarProps {
  panelTab: "details" | "collected";
  selectedMemo: Memo | null;
  collectedMemos: Memo[];
  currentTab: Tab | null;
  onPanelTabChange: (tab: "details" | "collected") => void;
  onColorChange: (hex: string) => void;
  onColorSave: () => void;
  onSetDefaultColor: () => void;
  onColorApplyAll: () => void;
  onCollectedMemoClick: (memo: Memo) => void;
}

export default function MemoSidebar({
  panelTab,
  selectedMemo,
  collectedMemos,
  currentTab,
  onPanelTabChange,
  onColorChange,
  onColorSave,
  onSetDefaultColor,
  onColorApplyAll,
  onCollectedMemoClick,
}: MemoSidebarProps) {
  const tMemo = useTranslations("memo");
  const tCommon = useTranslations("common");

  return (
    <div
      style={{
        width: 300,
        backgroundColor: "#2f3136",
        borderLeft: "1px solid #202225",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          height: 50,
          borderBottom: "1px solid #202225",
        }}
      >
        <div
          onClick={() => onPanelTabChange("collected")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: panelTab === "collected" ? "#40444b" : "transparent",
            color: "#fff",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            borderRight: "1px solid #202225",
            transition: "background 0.2s ease",
          }}
        >
          {tMemo("tabs.collected")}
        </div>
        <div
          onClick={() => onPanelTabChange("details")}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: panelTab === "details" ? "#40444b" : "transparent",
            color: "#fff",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            transition: "background 0.2s ease",
          }}
        >
          {tMemo("tabs.details")}
        </div>
      </div>

      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        {panelTab === "details" ? (
          selectedMemo ? (
            <div>
              <ColorPicker
                label={tMemo("fields.fontColor")}
                value={selectedMemo.font_color || "#dcddde"}
                onChange={onColorChange}
              />
              <ColorActions
                saveLabel={tMemo("actions.saveColor")}
                setDefaultLabel={tMemo("actions.setDefault")}
                applyAllLabel={tMemo("actions.applyAll")}
                onSave={onColorSave}
                onSetDefault={onSetDefaultColor}
                onApplyAll={onColorApplyAll}
              />

              <DetailField
                label={tMemo("fields.author")}
                value={selectedMemo.user.username}
              />
              <DetailField
                label={tMemo("fields.created")}
                value={new Date(selectedMemo.created_at).toLocaleString()}
              />
              {selectedMemo.updated_at && (
                <DetailField
                  label={tMemo("fields.updated")}
                  value={new Date(selectedMemo.updated_at).toLocaleString()}
                />
              )}
              {selectedMemo.collected && selectedMemo.collected_time && (
                <DetailField
                  label={tMemo("fields.collected")}
                  value={new Date(selectedMemo.collected_time).toLocaleString()}
                  valueColor="#43b581"
                />
              )}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    color: "#b9bbbe",
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {tMemo("fields.content")}
                </div>
                <div
                  style={{
                    color: selectedMemo.font_color || "#dcddde",
                    fontSize: 14,
                    backgroundColor: "#202225",
                    padding: 12,
                    borderRadius: 4,
                    wordWrap: "break-word",
                  }}
                >
                  {selectedMemo.content}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState message={tMemo("empty.selectMemo")} />
          )
        ) : (
          <div>
            {collectedMemos.length === 0 ? (
              <EmptyState message={tMemo("empty.noCollected")} />
            ) : (
              collectedMemos.map((memo) => (
                <CollectedMemoCard
                  key={memo.id}
                  memo={memo}
                  tCommon={tCommon}
                  onClick={() => onCollectedMemoClick(memo)}
                />
              ))
            )}
          </div>
        )}
      </div>

      <div
        style={{
          padding: 12,
          borderTop: "1px solid #202225",
          color: "#b9bbbe",
          fontSize: 12,
        }}
      >
        {currentTab
          ? tMemo("sidebar.tabPrefix", { name: currentTab.tab_name })
          : tMemo("sidebar.noTab")}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  valueColor = "#fff",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          color: "#b9bbbe",
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ color: valueColor, fontSize: 14 }}>{value}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        color: "#72767d",
        fontSize: 14,
        textAlign: "center",
        marginTop: 40,
      }}
    >
      {message}
    </div>
  );
}

function CollectedMemoCard({
  memo,
  tCommon,
  onClick,
}: {
  memo: Memo;
  tCommon: ReturnType<typeof useTranslations>;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        marginBottom: 12,
        padding: 12,
        backgroundColor: "#202225",
        borderRadius: 4,
        borderLeft: "3px solid #43b581",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <div style={{ color: "#b9bbbe", fontSize: 11, marginBottom: 4 }}>
        {memo.collected_time
          ? new Date(memo.collected_time).toLocaleString()
          : new Date(memo.created_at).toLocaleString()}
      </div>
      <div
        style={{
          color: memo.font_color || "#dcddde",
          fontSize: 14,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {memo.content}
      </div>
      <div style={{ color: "#72767d", fontSize: 12, marginTop: 4 }}>
        {tCommon("byAuthor", { username: memo.user.username })}
      </div>
    </div>
  );
}
