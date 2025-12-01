import type { Memo } from "@/Types/Memo";
import type { UpdateTabRequest, CreateTabRequest } from "@/Types/Tab";

type ApiResult<T = void> = { success: boolean; message?: string; tab?: T };
type NotificationType = "success" | "error" | "info" | "warning";
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
  }) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: () => void
) => {
  if (!input.trim()) return;
  const result = await createMemo({
    title: "Memo",
    content: input.trim(),
    tab_id: currentTabId ?? undefined,
  });
  if (result.success) {
    showNotification("Memo sent!", "success");
    onSuccess();
  } else {
    showNotification(result.message || "Failed to send memo", "error");
  }
};

export const handleMemoDelete = async (
  id: number,
  deleteMemo: (id: number) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: (id: number) => void
) => {
  const result = await deleteMemo(id);
  if (result.success) {
    showNotification("Memo deleted", "success");
    onSuccess(id);
  } else {
    showNotification(result.message || "Failed to delete", "error");
  }
};

export const handleMemoCollect = async (
  id: number,
  collectMemo: (id: number) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: () => void
) => {
  const result = await collectMemo(id);
  if (result.success) {
    showNotification("Memo collected!", "success");
    onSuccess();
  } else {
    showNotification(result.message || "Failed to collect", "error");
  }
};

export const handleMemoUncollect = async (
  id: number,
  uncollectMemo: (id: number) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: () => void
) => {
  const result = await uncollectMemo(id);
  if (result.success) {
    showNotification("Memo uncollected!", "success");
    onSuccess();
  } else {
    showNotification(result.message || "Failed to uncollect", "error");
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
  onSuccess: () => void
) => {
  if (!content.trim()) return;
  const result = await updateMemo(id, { title, content });
  if (result.success) {
    showNotification("Memo updated!", "success");
    onSuccess();
  } else {
    showNotification(result.message || "Failed to update", "error");
  }
};

export const handleMemoColorUpdate = async (
  memo: Memo,
  fontColor: string | null | undefined,
  updateMemo: (
    id: number,
    data: { title: string; content: string; font_color?: string }
  ) => Promise<ApiResult>,
  showNotification: ShowNotification
) => {
  const res = await updateMemo(memo.id, {
    title: memo.title,
    content: memo.content,
    font_color: fontColor ?? undefined,
  });
  if (res.success) {
    showNotification("Color updated", "success");
  } else {
    showNotification(res.message || "Failed to update", "error");
  }
};

export const handleTabUpdate = async (
  tabId: number,
  data: UpdateTabRequest,
  updateTab: (id: number, data: UpdateTabRequest) => Promise<ApiResult>,
  showNotification: ShowNotification,
  onSuccess: () => void
) => {
  const res = await updateTab(tabId, data);
  if (res.success) {
    showNotification("Tab updated", "success");
    onSuccess();
  } else {
    showNotification(res.message || "Failed to update tab", "error");
  }
};

export const handleTabCreate = async (
  data: CreateTabRequest,
  createTab: (data: CreateTabRequest) => Promise<ApiResult<{ id: number }>>,
  showNotification: ShowNotification,
  onSuccess: (tabId: number) => void
) => {
  const res = await createTab(data);
  if (res.success && res.tab) {
    showNotification("Tab created", "success");
    onSuccess(res.tab.id);
  } else {
    showNotification(res.message || "Failed to create tab", "error");
  }
};
