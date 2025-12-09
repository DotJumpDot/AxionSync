import type { Memo } from "@/Types/Memo";

export interface MemoGroup {
  id: string; // Unique identifier for the group
  memos: Memo[]; // All memos in this group
  user: Memo["user"]; // The user who created this group
  created_at: string; // Created time of the first memo
  updated_at: string | null; // Updated time of the last memo
  font_color: string | null; // Font color of the group (from first memo)
}

const TWO_MINUTES_MS = 2 * 60 * 1000;

/**
 * Group memos by user and time (within 2 minutes)
 * Returns an array of MemoGroup objects
 */
export const groupMemos = (memos: Memo[]): MemoGroup[] => {
  if (memos.length === 0) return [];

  const groups: MemoGroup[] = [];
  let currentGroup: MemoGroup | null = null;

  for (const memo of memos) {
    const memoTime = new Date(memo.created_at).getTime();

    if (
      !currentGroup ||
      currentGroup.user.id !== memo.user.id ||
      memoTime - new Date(currentGroup.created_at).getTime() > TWO_MINUTES_MS
    ) {
      // Start a new group
      currentGroup = {
        id: `group-${memo.id}`,
        memos: [memo],
        user: memo.user,
        created_at: memo.created_at,
        updated_at: memo.updated_at,
        font_color: memo.font_color,
      };
      groups.push(currentGroup);
    } else {
      // Add to current group
      currentGroup.memos.push(memo);
      currentGroup.updated_at = memo.updated_at;
    }
  }

  return groups;
};

/**
 * Find which group a memo belongs to
 */
export const findMemoGroup = (
  memoId: number,
  groups: MemoGroup[]
): MemoGroup | null => {
  return (
    groups.find((group) => group.memos.some((m) => m.id === memoId)) || null
  );
};

/**
 * Check if we should show the header (time + user) for a memo
 * Show header only for the first memo in each group
 */
export const shouldShowGroupHeader = (
  memoId: number,
  groups: MemoGroup[]
): boolean => {
  const group = findMemoGroup(memoId, groups);
  if (!group) return false;
  return group.memos[0].id === memoId;
};
