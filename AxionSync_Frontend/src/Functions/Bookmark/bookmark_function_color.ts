import type { BookmarkStatus, BookmarkType } from "@/Types/Bookmark";

/**
 * Get color for status badge
 */
export function getStatusColor(status: BookmarkStatus): string {
  const colors: Record<BookmarkStatus, string> = {
    onGoing: "#52c41a", // green
    Finished: "#1890ff", // blue
    PreWatch: "#faad14", // gold
    Dropped: "#ff4d4f", // red
  };
  return colors[status] || "#d9d9d9";
}

/**
 * Get color for type badge
 */
export function getTypeColor(type: BookmarkType): string {
  const colors: Record<BookmarkType, string> = {
    Game: "#722ed1", // purple
    Movie: "#eb2f96", // magenta
    Novel: "#13c2c2", // cyan
    Manga: "#fa541c", // orange
    Manhwa: "#52c41a", // green
    Anime: "#1890ff", // blue
    Series: "#faad14", // gold
  };
  return colors[type] || "#d9d9d9";
}
