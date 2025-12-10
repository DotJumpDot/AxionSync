import type { User } from "./User";
import type { Tag } from "./Tag";

// Enum-like constants for type validation
export const BOOKMARK_TYPES = [
  "Game",
  "Movie",
  "Novel",
  "Manga",
  "Manhwa",
  "Anime",
  "Series",
] as const;

export const BOOKMARK_STATUSES = [
  "onGoing",
  "Finished",
  "PreWatch",
  "Dropped",
] as const;

export const BOOKMARK_MOODS = [
  "happy",
  "sad",
  "excited",
  "boring",
  "fun",
  "serious",
  "mind-blown",
  "emotional",
  "heartwarming",
  "tragic",
  "thrilling",
  "suspenseful",
  "scary",
  "satisfied",
  "unsatisfied",
  "disappointed",
  "impressed",
  "addicted",
  "confusing",
  "thought-provoking",
  "deep",
  "chill",
  "feel-good",
] as const;

// Fields applicable per type - used for filtering form fields
export const TYPE_FIELDS: Record<BookmarkType, string[]> = {
  Game: [
    "rating",
    "story_rating",
    "action_rating",
    "graphic_rating",
    "sound_rating",
    "time_used",
    "chapter",
    "mood",
    "review",
    "short_review",
  ],
  Movie: [
    "rating",
    "story_rating",
    "action_rating",
    "graphic_rating",
    "sound_rating",
    "time_used",
    "mood",
    "review",
    "short_review",
  ],
  Novel: [
    "rating",
    "story_rating",
    "chapter",
    "mood",
    "review",
    "short_review",
  ],
  Manga: [
    "rating",
    "story_rating",
    "graphic_rating",
    "chapter",
    "mood",
    "review",
    "short_review",
  ],
  Manhwa: [
    "rating",
    "story_rating",
    "graphic_rating",
    "chapter",
    "mood",
    "review",
    "short_review",
  ],
  Anime: [
    "rating",
    "story_rating",
    "action_rating",
    "graphic_rating",
    "sound_rating",
    "chapter",
    "mood",
    "review",
    "short_review",
  ],
  Series: [
    "rating",
    "story_rating",
    "action_rating",
    "graphic_rating",
    "sound_rating",
    "chapter",
    "mood",
    "review",
    "short_review",
  ],
};

export type BookmarkType = (typeof BOOKMARK_TYPES)[number];
export type BookmarkStatus = (typeof BOOKMARK_STATUSES)[number];
export type BookmarkMood = (typeof BOOKMARK_MOODS)[number];

// Watch from structure with separate fields
export type WatchFrom = {
  siteName: string;
  siteURL?: string;
};

export type Bookmark = {
  id: number;
  name: string;
  type: BookmarkType;
  review: string | null;
  watch_from: WatchFrom | null;
  release_time: string | null;
  time_used: number | null;
  rating: number | null;
  story_rating: number | null;
  action_rating: number | null;
  graphic_rating: number | null;
  sound_rating: number | null;
  chapter: string | null;
  mood: BookmarkMood[] | null;
  review_version: number;
  short_review: string | null;
  status: BookmarkStatus;
  public: boolean;
  user: User;
  created_at: string;
  updated_at: string | null;
  cover_image: string | null;
  deleted_status: boolean;
  last_viewed_at: string | null;
  tags: Tag[];
};

export type CreateBookmarkRequest = {
  name: string;
  type: BookmarkType;
  review?: string | null;
  watch_from?: WatchFrom | null;
  release_time?: string | null;
  time_used?: number | null;
  rating?: number | null;
  story_rating?: number | null;
  action_rating?: number | null;
  graphic_rating?: number | null;
  sound_rating?: number | null;
  chapter?: string | null;
  mood?: BookmarkMood[] | null;
  short_review?: string | null;
  status?: BookmarkStatus;
  public?: boolean;
  cover_image?: string | null;
  tag_ids?: number[];
};

export type UpdateBookmarkRequest = {
  name?: string;
  type?: BookmarkType;
  review?: string | null;
  watch_from?: WatchFrom | null;
  release_time?: string | null;
  time_used?: number | null;
  rating?: number | null;
  story_rating?: number | null;
  action_rating?: number | null;
  graphic_rating?: number | null;
  sound_rating?: number | null;
  chapter?: string | null;
  mood?: BookmarkMood[] | null;
  short_review?: string | null;
  status?: BookmarkStatus;
  public?: boolean;
  cover_image?: string | null;
  tag_ids?: number[];
};

export type BookmarkResponse = {
  success: boolean;
  message?: string;
  bookmark?: Bookmark;
};

export type CoverImageResponse = {
  success: boolean;
  cover_image: string;
  bookmark: Bookmark;
};
