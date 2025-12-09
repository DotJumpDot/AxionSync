import type { Memo } from "@/Types/Memo";
import type { UpdateTabRequest, CreateTabRequest } from "@/Types/Tab";

type ApiResult<T = void> = { success: boolean; message?: string; tab?: T };
type NotificationType = "error" | "info" | "warning";
type ShowNotification = (
  msg: string,
  type?: NotificationType,
  duration?: number,
  placement?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
) => void;

export const handleMemoSend = async (
  input: string,
  currentTabId: number | null,
  createMemo: (data: {
    title: string;
    content: string;
    tab_id?: number;
    font_color?: string;
  }) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: () => void,
  messages?: { error: string }
) => {
  if (!input.trim()) return;
  const result = await createMemo({
    title: "Memo",
    content: input.trim(),
    tab_id: currentTabId ?? undefined,
  });
  if (result.success) {
    onSuccess();
  } else {
    showNotification(
      result.message || messages?.error || "Failed to send memo",
      "error"
    );
  }
};

export const handleMemoDelete = async (
  id: number,
  deleteMemo: (id: number) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: (id: number) => void,
  messages?: { error: string }
) => {
  const result = await deleteMemo(id);
  if (!result.success) {
    showNotification(
      result.message || messages?.error || "Failed to delete",
      "error"
    );
  } else {
    onSuccess(id);
  }
};

export const handleMemoCollect = async (
  id: number,
  collectMemo: (id: number) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: () => void,
  messages?: { error: string }
) => {
  const result = await collectMemo(id);
  if (!result.success) {
    showNotification(
      result.message || messages?.error || "Failed to collect",
      "error"
    );
  } else {
    onSuccess();
  }
};

export const handleMemoUncollect = async (
  id: number,
  uncollectMemo: (id: number) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: () => void,
  messages?: { error: string }
) => {
  const result = await uncollectMemo(id);
  if (!result.success) {
    showNotification(
      result.message || messages?.error || "Failed to uncollect",
      "error"
    );
  } else {
    onSuccess();
  }
};

export const handleMemoUpdate = async (
  id: number,
  title: string,
  content: string,
  updateMemo: (
    id: number,
    data: { title: string; content: string }
  ) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: () => void,
  messages?: { error: string }
) => {
  if (!content.trim()) return;
  const result = await updateMemo(id, { title, content });
  if (!result.success) {
    showNotification(
      result.message || messages?.error || "Failed to update",
      "error"
    );
  } else {
    onSuccess();
  }
};

export const handleMemoColorUpdate = async (
  memo: Memo,
  fontColor: string | null | undefined,
  updateMemo: (
    id: number,
    data: { title: string; content: string; font_color?: string }
  ) => Promise<ApiResult>,
  showNotification: ShowNotification,
  messages?: { error: string }
) => {
  const res = await updateMemo(memo.id, {
    title: memo.title,
    content: memo.content,
    font_color: fontColor ?? undefined,
  });
  if (!res.success) {
    showNotification(
      res.message || messages?.error || "Failed to update",
      "error"
    );
  }
};

export const handleTabUpdate = async (
  tabId: number,
  data: UpdateTabRequest,
  updateTab: (id: number, data: UpdateTabRequest) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: () => void,
  messages?: { error: string }
) => {
  const res = await updateTab(tabId, data);
  if (!res.success) {
    showNotification(
      res.message || messages?.error || "Failed to update tab",
      "error"
    );
  } else {
    onSuccess();
  }
};

export const handleTabCreate = async (
  data: CreateTabRequest,
  createTab: (data: CreateTabRequest) => Promise<ApiResult<{ id: number }>>,
  showNotification: ShowNotification,
  onSuccess: (tabId: number) => void,
  messages?: { error: string }
) => {
  const res = await createTab(data);
  if (!res.success) {
    showNotification(
      res.message || messages?.error || "Failed to create tab",
      "error"
    );
  } else if (res.tab) {
    onSuccess(res.tab.id);
  }
};
