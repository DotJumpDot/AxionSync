"use client";

import { Tag, Progress, Checkbox } from "antd";
import type { Todo } from "@/Types/Todo";
import {
  getStatusClass,
  getPriorityClass,
  getPriorityIcon,
  getMoodEmoji,
  formatDueDate,
  getDueDateClass,
  getChecklistProgress,
  getChecklistProgressText,
  isOverdue,
} from "@/Functions/Todo/";

type TodoCardProps = {
  todo: Todo;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onToggleComplete?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
  t: (key: string) => string;
};

export default function TodoCard({
  todo,
  onClick,
  onEdit,
  onDelete,
  onRestore,
  onToggleComplete,
  isSelected = false,
  showActions = true,
  t,
}: TodoCardProps) {
  const progress = getChecklistProgress(todo.items);
  const progressText = getChecklistProgressText(todo.items);
  const overdue = isOverdue(todo);

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-4 rounded-lg cursor-pointer transition-all
        ${
          isSelected
            ? "ring-2 ring-blue-500 bg-[#36393f]"
            : "bg-[#2f3136] hover:bg-[#36393f]"
        }
        ${todo.deleted_status ? "opacity-60" : ""}
        ${todo.status === "completed" ? "opacity-75" : ""}
      `}
    >
      {/* Top Row: Checkbox + Title + Priority */}
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.();
          }}
          className="mt-1"
        >
          <Checkbox
            checked={todo.status === "completed"}
            className={`
              custom-checkbox
              ${todo.status === "completed" ? "opacity-50" : ""}
            `}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`
              font-medium text-white text-base mb-1 truncate
              ${todo.status === "completed" ? "line-through text-gray-400" : ""}
            `}
            title={todo.title}
          >
            {todo.title}
          </h3>

          {/* Description Preview */}
          {todo.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-2">
              {todo.description}
            </p>
          )}

          {/* Meta Row: Due Date + Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Priority Badge */}
            <span
              className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
                ${getPriorityClass(todo.priority)}
              `}
            >
              {getPriorityIcon(todo.priority)}{" "}
              {t(`priorities.${todo.priority}`)}
            </span>

            {/* Status Badge */}
            <span
              className={`
                px-2 py-0.5 rounded text-xs font-medium
                ${getStatusClass(todo.status)}
              `}
            >
              {t(`statuses.${todo.status}`)}
            </span>

            {/* Due Date */}
            {todo.due_date && (
              <span
                className={`
                  inline-flex items-center gap-1 text-xs
                  ${getDueDateClass(todo.due_date)}
                  ${overdue ? "font-medium" : ""}
                `}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDueDate(todo.due_date)}
              </span>
            )}

            {/* Mood */}
            {todo.mood && (
              <span className="text-sm" title={t(`moods.${todo.mood}`)}>
                {getMoodEmoji(todo.mood)}
              </span>
            )}

            {/* Repeat Badge */}
            {todo.is_repeat && todo.repeat_type && (
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {t(`repeatTypes.${todo.repeat_type}`)}
              </span>
            )}
          </div>

          {/* Tags Row */}
          {todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {todo.tags.slice(0, 3).map((tag) => (
                <Tag
                  key={tag.id}
                  className="text-xs border-0"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : "#4a4d52",
                    color: tag.color || "#fff",
                  }}
                >
                  {tag.name}
                </Tag>
              ))}
              {todo.tags.length > 3 && (
                <Tag className="text-xs bg-[#4a4d52] border-0 text-gray-300">
                  +{todo.tags.length - 3}
                </Tag>
              )}
            </div>
          )}

          {/* Checklist Progress */}
          {todo.items.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{t("checklist")}</span>
                <span>{progressText}</span>
              </div>
              <Progress
                percent={progress}
                size="small"
                showInfo={false}
                strokeColor={progress === 100 ? "#52c41a" : "#1890ff"}
                trailColor="#4a4d52"
              />
            </div>
          )}

          {/* Sharing Info */}
          {todo.shares.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>
                {t("sharing.sharedWith")} {todo.shares.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Deleted overlay */}
      {todo.deleted_status && (
        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
          <span className="text-red-400 font-semibold text-sm">
            {t("filters.deleted").toUpperCase()}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {todo.deleted_status ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore?.();
              }}
              className="p-1.5 rounded bg-green-600/20 hover:bg-green-600/40 text-green-400"
              title={t("restore")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="p-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400"
                title={t("editTodo")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1.5 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400"
                title={t("deleteTodo")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
