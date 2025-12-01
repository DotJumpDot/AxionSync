import type { Memo } from "@/Types/Memo";

export const filterCollectedMemos = (memos: Memo[]): Memo[] => {
  return memos.filter((m) => m.collected);
};

export const filterMemosByTab = (
  memos: Memo[],
  tabId: number | null
): Memo[] => {
  if (tabId === null) return memos;
  return memos.filter((m) => m.tab_id === tabId);
};
