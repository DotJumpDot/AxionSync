import type { Tab } from "@/Types/Tab";
import { getContrastColor } from "@/Functions/Memo/memo_function_color";

interface MemoHeaderProps {
  currentTab: Tab | null;
  tabs: Tab[];
  currentTabId: number | null;
  channelEditing: boolean;
  channelNameDraft: string;
  onChannelNameChange: (name: string) => void;
  onChannelNameSave: () => void;
  onChannelEditStart: () => void;
  onChannelEditCancel: () => void;
  onTabChange: (id: number | null) => void;
  onEditTab: () => void;
  onCreateTab: () => void;
}

export default function MemoHeader({
  currentTab,
  tabs,
  currentTabId,
  channelEditing,
  channelNameDraft,
  onChannelNameChange,
  onChannelNameSave,
  onChannelEditStart,
  onChannelEditCancel,
  onTabChange,
  onEditTab,
  onCreateTab,
}: MemoHeaderProps) {
  return (
    <div
      style={{
        height: "56px",
        backgroundColor: "#2f3136",
        borderBottom: "1px solid #202225",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#72767d", fontSize: 22 }}>#</span>
        {channelEditing ? (
          <input
            value={channelNameDraft}
            onChange={(e) => onChannelNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onChannelNameSave();
              if (e.key === "Escape") onChannelEditCancel();
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#40444b",
              border: "1px solid #5865f2",
              borderRadius: 4,
              color: "#fff",
              padding: "6px 8px",
              fontSize: 16,
            }}
            autoFocus
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChannelEditStart();
            }}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
            title="Click to rename channel"
          >
            {currentTab ? currentTab.tab_name : "memo-notes"}
          </button>
        )}
      </div>
      <div style={{ flex: 1 }} />
      <select
        value={currentTabId ?? ""}
        onChange={(e) => {
          const id = e.target.value ? parseInt(e.target.value, 10) : null;
          onTabChange(id);
        }}
        style={{
          background: currentTab?.color || "#202225",
          color: currentTab?.color
            ? getContrastColor(currentTab.color)
            : "#dcddde",
          border: `1px solid ${currentTab?.color || "#40444b"}`,
          borderRadius: 4,
          padding: "6px 8px",
          fontSize: 14,
          minWidth: 160,
          fontWeight: 600,
        }}
      >
        {tabs.map((t) => (
          <option key={t.id} value={t.id}>
            {t.tab_name}
          </option>
        ))}
      </select>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEditTab();
        }}
        style={{
          marginLeft: 8,
          background: "#40444b",
          color: "#dcddde",
          border: "1px solid #40444b",
          borderRadius: 4,
          padding: "6px 10px",
          cursor: "pointer",
        }}
        title="Edit tab"
      >
        ✏️
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCreateTab();
        }}
        style={{
          marginLeft: 8,
          background: "#5865f2",
          color: "#fff",
          border: "1px solid #5865f2",
          borderRadius: 4,
          padding: "6px 10px",
          cursor: "pointer",
          fontWeight: 600,
        }}
        title="Create tab"
      >
        +
      </button>
    </div>
  );
}
