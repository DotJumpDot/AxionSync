"use client";

import { Select, Checkbox, Button } from "antd";
import {
  BOOKMARK_TYPES,
  BOOKMARK_STATUSES,
  BOOKMARK_MOODS,
  BookmarkType,
  BookmarkStatus,
  BookmarkMood,
} from "@/Types/Bookmark";

type SortByOption = "created" | "rating" | "name" | "lastViewed" | "mood";

type BookmarkFiltersProps = {
  filterType: BookmarkType | null;
  filterStatus: BookmarkStatus | null;
  filterMood: BookmarkMood | null;
  filterTag: number | null;
  sortBy: SortByOption;
  includeDeleted: boolean;
  onTypeChange: (type: BookmarkType | null) => void;
  onStatusChange: (status: BookmarkStatus | null) => void;
  onMoodChange: (mood: BookmarkMood | null) => void;
  onTagChange: (tagId: number | null) => void;
  onSortByChange: (sortBy: SortByOption) => void;
  onIncludeDeletedChange: (include: boolean) => void;
  onClearFilters: () => void;
  t: (key: string) => string;
  tags?: Array<{ id: number; name: string }>;
};

export default function BookmarkFilters({
  filterType,
  filterStatus,
  filterMood,
  filterTag,
  sortBy,
  includeDeleted,
  onTypeChange,
  onStatusChange,
  onMoodChange,
  onTagChange,
  onSortByChange,
  onIncludeDeletedChange,
  onClearFilters,
  t,
  tags = [],
}: BookmarkFiltersProps) {
  const hasActiveFilters =
    filterType !== null ||
    filterStatus !== null ||
    filterMood !== null ||
    filterTag !== null ||
    includeDeleted ||
    sortBy !== "created";

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-[#2f3136] rounded-lg">
      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">
          {t("filters.filterByType")}:
        </span>
        <Select
          value={filterType}
          onChange={onTypeChange}
          allowClear
          placeholder={t("filters.all")}
          className="min-w-[140px]"
          classNames={{ popup: { root: "dark-dropdown" } }}
          options={[
            ...BOOKMARK_TYPES.map((type) => ({
              value: type,
              label: t(`types.${type}`),
            })),
          ]}
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">
          {t("filters.filterByStatus")}:
        </span>
        <Select
          value={filterStatus}
          onChange={onStatusChange}
          allowClear
          placeholder={t("filters.all")}
          className="min-w-[140px]"
          classNames={{ popup: { root: "dark-dropdown" } }}
          options={[
            ...BOOKMARK_STATUSES.map((status) => ({
              value: status,
              label: t(`statuses.${status}`),
            })),
          ]}
        />
      </div>

      {/* Mood Filter */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">
          {t("filters.filterByMood") || "Mood"}:
        </span>
        <Select
          value={filterMood}
          onChange={onMoodChange}
          allowClear
          placeholder={t("filters.all")}
          className="min-w-[140px]"
          classNames={{ popup: { root: "dark-dropdown" } }}
          options={[
            ...BOOKMARK_MOODS.map((mood) => ({
              value: mood,
              label: t(`moods.${mood}`) || mood,
            })),
          ]}
        />
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">
            {t("filters.filterByTag") || "Tag"}:
          </span>
          <Select
            value={filterTag}
            onChange={onTagChange}
            allowClear
            placeholder={t("filters.all")}
            className="min-w-[140px]"
            classNames={{ popup: { root: "dark-dropdown" } }}
            options={[
              ...tags.map((tag) => ({
                value: tag.id,
                label: tag.name,
              })),
            ]}
          />
        </div>
      )}

      {/* Sort By */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">
          {t("filters.sortBy") || "Sort by"}:
        </span>
        <Select
          value={sortBy}
          onChange={onSortByChange}
          className="min-w-[140px]"
          classNames={{ popup: { root: "dark-dropdown" } }}
          options={[
            {
              value: "created",
              label: t("filters.sortOptions.created") || "Created",
            },
            {
              value: "rating",
              label: t("filters.sortOptions.rating") || "Rating",
            },
            { value: "name", label: t("filters.sortOptions.name") || "Name" },
            {
              value: "lastViewed",
              label: t("filters.sortOptions.lastViewed") || "Last Viewed",
            },
            { value: "mood", label: t("filters.sortOptions.mood") || "Mood" },
          ]}
        />
      </div>

      {/* Include Deleted */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={includeDeleted}
          onChange={(e) => onIncludeDeletedChange(e.target.checked)}
        >
          <span className="text-gray-400 text-sm">
            {t("filters.showDeleted")}
          </span>
        </Checkbox>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          type="link"
          onClick={onClearFilters}
          className="text-blue-400 hover:text-blue-300"
        >
          {t("filters.clearFilters")}
        </Button>
      )}
    </div>
  );
}
