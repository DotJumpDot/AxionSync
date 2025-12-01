import type { Memo } from "@/Types/Memo";

type ShowNotification = (
  msg: string,
  type?: "success" | "error" | "info" | "warning",
  duration?: number,
  placement?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
) => void;

/**
 * Applies a color to all memos in the current tab
 * @param memos - Array of memos to update
 * @param targetColor - Color to apply
 * @param updateMemo - Function to update a single memo
 * @param getMemos - Function to refresh memos after update
 * @param currentTabId - Current tab ID
 * @param showNotification - Notification function
 */
export const applyColorToAllMemos = async (
  memos: Memo[],
  targetColor: string,
  updateMemo: (
    id: number,
    data: { title: string; content: string; font_color?: string }
  ) => Promise<{ success: boolean; message?: string }>,
  getMemos: (
    tabId?: number | null
  ) => Promise<{ success: boolean; message?: string }>,
  currentTabId: number | null,
  showNotification: ShowNotification
): Promise<void> => {
  const promises = memos.map((memo) =>
    updateMemo(memo.id, {
      title: memo.title,
      content: memo.content,
      font_color: targetColor,
    })
  );

  try {
    await Promise.all(promises);
    showNotification("Color applied to all memos!", "success");
    // Refresh memos
    if (currentTabId) await getMemos(currentTabId);
  } catch {
    showNotification("Failed to apply color to all memos", "error");
  }
};

/**
 * Determines if a memo should show the header (avatar, username, timestamp)
 * based on whether it's the first message or from a different user or time gap
 * @param memo - Current memo
 * @param index - Index in the memos array
 * @param memos - Full array of memos
 * @returns true if header should be shown
 */
export const shouldShowMemoHeader = (
  memo: Memo,
  index: number,
  memos: Memo[]
): boolean => {
  if (index === 0) return true;
  const prevMemo = memos[index - 1];
  if (prevMemo.user.id !== memo.user.id) return true;

  const prevTime = new Date(prevMemo.created_at).getTime();
  const currentTime = new Date(memo.created_at).getTime();
  const diffMinutes = (currentTime - prevTime) / (1000 * 60);

  return diffMinutes >= 2;
};
