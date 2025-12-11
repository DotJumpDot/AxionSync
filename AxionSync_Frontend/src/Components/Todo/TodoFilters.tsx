"use client";

import { Select, Checkbox, Button } from "antd";
import {
  TODO_STATUSES,
  TODO_PRIORITIES,
  TODO_MOODS,
  TodoStatus,
  TodoPriority,
  TodoMood,
  TodoTag,
} from "@/Types/Todo";

type SortByOption = "created" | "due_date" | "priority" | "title" | "status";

type TodoFiltersProps = {
  filterStatus: TodoStatus | null;
  filterPriority: TodoPriority | null;
  filterMood: TodoMood | null;
  filterTag: number | null;
  sortBy: SortByOption;
  includeDeleted: boolean;
  onStatusChange: (status: TodoStatus | null) => void;
  onPriorityChange: (priority: TodoPriority | null) => void;
  onMoodChange: (mood: TodoMood | null) => void;
  onTagChange: (tagId: number | null) => void;
  onSortByChange: (sortBy: SortByOption) => void;
  onIncludeDeletedChange: (include: boolean) => void;
  onClearFilters: () => void;
  t: (key: string) => string;
  tags?: TodoTag[];
};

export default function TodoFilters({
  filterStatus,
  filterPriority,
  filterMood,
  filterTag,
  sortBy,
  includeDeleted,
  onStatusChange,
  onPriorityChange,
  onMoodChange,
  onTagChange,
  onSortByChange,
  onIncludeDeletedChange,
  onClearFilters,
  t,
  tags = [],
}: TodoFiltersProps) {
  const hasActiveFilters =
    filterStatus !== null ||
    filterPriority !== null ||
    filterMood !== null ||
    filterTag !== null ||
    includeDeleted ||
    sortBy !== "created";

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-[#2f3136] rounded-lg">
      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">{t("status")}:</span>
        <Select
          value={filterStatus}
          onChange={onStatusChange}
          allowClear
          placeholder={t("filters.all")}
          className="min-w-[130px]"
          classNames={{ popup: { root: "dark-dropdown" } }}
          options={[
            ...TODO_STATUSES.map((status) => ({
              value: status,
              label: t(`statuses.${status}`),
            })),
          ]}
        />
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">{t("priority")}:</span>
        <Select
          value={filterPriority}
          onChange={onPriorityChange}
          allowClear
          placeholder={t("filters.all")}
          className="min-w-[130px]"
          classNames={{ popup: { root: "dark-dropdown" } }}
          options={[
            ...TODO_PRIORITIES.map((priority) => ({
              value: priority,
              label: t(`priorities.${priority}`),
            })),
          ]}
        />
      </div>

      {/* Mood Filter */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">{t("mood")}:</span>
        <Select
          value={filterMood}
          onChange={onMoodChange}
          allowClear
          placeholder={t("filters.all")}
          className="min-w-[130px]"
          classNames={{ popup: { root: "dark-dropdown" } }}
          options={[
            ...TODO_MOODS.map((mood) => ({
              value: mood,
              label: t(`moods.${mood}`),
            })),
          ]}
        />
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">{t("tags")}:</span>
          <Select
            value={filterTag}
            onChange={onTagChange}
            allowClear
            placeholder={t("filters.all")}
            className="min-w-[130px]"
            classNames={{ popup: { root: "dark-dropdown" } }}
            options={tags.map((tag) => ({
              value: tag.id,
              label: tag.name,
            }))}
          />
        </div>
      )}

      {/* Sort By */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">{t("sort.created")}:</span>
        <Select
          value={sortBy}
          onChange={onSortByChange}
          className="min-w-[140px]"
          classNames={{ popup: { root: "dark-dropdown" } }}
          options={[
            { value: "created", label: t("sort.created") },
            { value: "due_date", label: t("sort.dueDate") },
            { value: "priority", label: t("sort.priority") },
            { value: "title", label: t("sort.title") },
            { value: "status", label: t("sort.status") },
          ]}
        />
      </div>

      {/* Include Deleted */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={includeDeleted}
          onChange={(e) => onIncludeDeletedChange(e.target.checked)}
          className="dark-checkbox"
        >
          <span className="text-gray-400 text-sm">{t("filters.deleted")}</span>
        </Checkbox>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          type="link"
          onClick={onClearFilters}
          className="text-blue-400 hover:text-blue-300 p-0"
        >
          {t("filters.all")} ✕
        </Button>
      )}
    </div>
  );
}
