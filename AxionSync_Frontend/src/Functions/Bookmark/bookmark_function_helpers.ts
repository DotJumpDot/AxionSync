import type {
  Bookmark,
  BookmarkType,
  BookmarkStatus,
  BookmarkMood,
} from "@/Types/Bookmark";

/**
 * Format time used from minutes to a readable string
 */
export function formatTimeUsed(minutes: number | null): string {
  if (minutes === null || minutes === 0) return "-";

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format rating to display string
 */
export function formatRating(rating: number | null): string {
  if (rating === null) return "-";
  return rating.toFixed(1);
}

// Color functions moved to bookmark_function_color

/**
 * Calculate average rating from individual ratings
 */
export function calculateAverageRating(bookmark: Bookmark): number | null {
  const ratings = [
    bookmark.story_rating,
    bookmark.action_rating,
    bookmark.graphic_rating,
    bookmark.sound_rating,
  ].filter((r): r is number => r !== null);

  if (ratings.length === 0) return bookmark.rating;

  const sum = ratings.reduce((acc, r) => acc + r, 0);
  return parseFloat((sum / ratings.length).toFixed(1));
}

/**
 * Filter bookmarks by type, status, mood, and tag
 */
export function filterBookmarks(
  bookmarks: Bookmark[],
  type: BookmarkType | null,
  status: BookmarkStatus | null,
  includeDeleted: boolean,
  mood: BookmarkMood | null = null,
  tagId: number | null = null
): Bookmark[] {
  return bookmarks.filter((b) => {
    if (!includeDeleted && b.deleted_status) return false;
    if (type && b.type !== type) return false;
    if (status && b.status !== status) return false;
    if (mood && (!b.mood || !b.mood.includes(mood))) return false;
    if (tagId && (!b.tags || !b.tags.some((t) => t.id === tagId))) return false;
    return true;
  });
}

/**
 * Sort bookmarks by various criteria
 */
export function sortBookmarks(
  bookmarks: Bookmark[],
  sortBy: "created" | "rating" | "name" | "lastViewed" | "mood" = "created"
): Bookmark[] {
  return [...bookmarks].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        const ratingA = a.rating ?? -1;
        const ratingB = b.rating ?? -1;
        return ratingB - ratingA;
      case "name":
        return a.name.localeCompare(b.name);
      case "lastViewed":
        const viewA = a.last_viewed_at
          ? new Date(a.last_viewed_at).getTime()
          : 0;
        const viewB = b.last_viewed_at
          ? new Date(b.last_viewed_at).getTime()
          : 0;
        return viewB - viewA;
      case "mood":
        // Sort by first mood or empty string if no moods
        const moodA = a.mood?.[0] ?? "";
        const moodB = b.mood?.[0] ?? "";
        return moodA.localeCompare(moodB);
      case "created":
      default:
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  });
}

/**
 * Group bookmarks by type
 */
export function groupBookmarksByType(
  bookmarks: Bookmark[]
): Record<BookmarkType, Bookmark[]> {
  const grouped: Record<string, Bookmark[]> = {};

  bookmarks.forEach((bookmark) => {
    if (!grouped[bookmark.type]) {
      grouped[bookmark.type] = [];
    }
    grouped[bookmark.type].push(bookmark);
  });

  return grouped as Record<BookmarkType, Bookmark[]>;
}

/**
 * Group bookmarks by status
 */
export function groupBookmarksByStatus(
  bookmarks: Bookmark[]
): Record<BookmarkStatus, Bookmark[]> {
  const grouped: Record<string, Bookmark[]> = {};

  bookmarks.forEach((bookmark) => {
    if (!grouped[bookmark.status]) {
      grouped[bookmark.status] = [];
    }
    grouped[bookmark.status].push(bookmark);
  });

  return grouped as Record<BookmarkStatus, Bookmark[]>;
}

/**
 * Search bookmarks by name, review, or short_review
 */
export function searchBookmarks(
  bookmarks: Bookmark[],
  query: string
): Bookmark[] {
  if (!query.trim()) return bookmarks;

  const lowerQuery = query.toLowerCase();

  return bookmarks.filter((b) => {
    return (
      b.name.toLowerCase().includes(lowerQuery) ||
      b.review?.toLowerCase().includes(lowerQuery) ||
      b.short_review?.toLowerCase().includes(lowerQuery) ||
      (b.mood && b.mood.some((m) => m.toLowerCase().includes(lowerQuery))) ||
      b.tags.some((t) => t.name.toLowerCase().includes(lowerQuery))
    );
  });
}
