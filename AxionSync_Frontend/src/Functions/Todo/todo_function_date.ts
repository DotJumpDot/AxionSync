import type { Todo, TodoItem } from "@/Types/Todo";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/**
 * Format due date to readable string
 */
export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "";

  const due = dayjs(dueDate);
  const now = dayjs();
  const diffDays = due.diff(now, "day");

  if (due.isSame(now, "day")) {
    return "Today";
  }

  if (due.isSame(now.add(1, "day"), "day")) {
    return "Tomorrow";
  }

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days overdue`;
  }

  if (diffDays <= 7) {
    return due.format("dddd"); // e.g., "Monday"
  }

  return due.format("MMM D"); // e.g., "Dec 25"
}

/**
 * Get due date status class
 */
export function getDueDateClass(dueDate: string | null): string {
  if (!dueDate) return "text-gray-500";

  const due = dayjs(dueDate);
  const now = dayjs();

  if (due.isBefore(now, "day")) {
    return "text-red-400"; // Overdue
  }

  if (due.isSame(now, "day")) {
    return "text-orange-400"; // Due today
  }

  if (due.diff(now, "day") <= 3) {
    return "text-yellow-400"; // Due soon
  }

  return "text-gray-400";
}

/**
 * Check if todo is overdue
 */
export function isOverdue(todo: Todo): boolean {
  if (
    !todo.due_date ||
    todo.status === "completed" ||
    todo.status === "cancelled"
  ) {
    return false;
  }
  return dayjs(todo.due_date).isBefore(dayjs(), "day");
}

/**
 * Check if todo is due today
 */
export function isDueToday(todo: Todo): boolean {
  if (
    !todo.due_date ||
    todo.status === "completed" ||
    todo.status === "cancelled"
  ) {
    return false;
  }
  return dayjs(todo.due_date).isSame(dayjs(), "day");
}

/**
 * Format date for display
 */
export function formatDate(
  date: string | null,
  format = "MMM D, YYYY"
): string {
  if (!date) return "";
  return dayjs(date).format(format);
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: string | null): string {
  if (!date) return "";
  return dayjs(date).format("MMM D, YYYY h:mm A");
}

/**
 * Get relative time string from date
 */
export function getRelativeTime(date: string): string {
  return dayjs(date).fromNow();
}

/**
 * Calculate checklist progress percentage
 */
export function getChecklistProgress(items: TodoItem[]): number {
  if (items.length === 0) return 0;
  const completed = items.filter((item) => item.is_done).length;
  return Math.round((completed / items.length) * 100);
}

/**
 * Get checklist progress string
 */
export function getChecklistProgressText(items: TodoItem[]): string {
  if (items.length === 0) return "";
  const completed = items.filter((item) => item.is_done).length;
  return `${completed}/${items.length}`;
}
