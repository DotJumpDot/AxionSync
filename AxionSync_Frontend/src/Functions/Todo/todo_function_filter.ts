import type { Todo, TodoStatus, TodoPriority } from "@/Types/Todo";
import { isDueToday, isOverdue } from "./todo_function_date";
import dayjs from "dayjs";

/**
 * Sort todos by various criteria
 */
export function sortTodos(
  todos: Todo[],
  sortBy: "created" | "due_date" | "priority" | "title" | "status"
): Todo[] {
  const priorityOrder: Record<TodoPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const statusOrder: Record<TodoStatus, number> = {
    in_progress: 0,
    pending: 1,
    completed: 2,
    cancelled: 3,
  };

  return [...todos].sort((a, b) => {
    switch (sortBy) {
      case "created":
        return dayjs(b.created_at).unix() - dayjs(a.created_at).unix();

      case "due_date":
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return dayjs(a.due_date).unix() - dayjs(b.due_date).unix();

      case "priority":
        return priorityOrder[a.priority] - priorityOrder[b.priority];

      case "title":
        return a.title.localeCompare(b.title);

      case "status":
        return statusOrder[a.status] - statusOrder[b.status];

      default:
        return 0;
    }
  });
}

/**
 * Filter todos by various criteria
 */
export function filterTodos(
  todos: Todo[],
  filters: {
    status?: TodoStatus | null;
    priority?: TodoPriority | null;
    mood?: string | null;
    tagId?: number | null;
    includeDeleted?: boolean;
    dueToday?: boolean;
    overdue?: boolean;
  }
): Todo[] {
  return todos.filter((todo) => {
    // Filter by deleted status
    if (!filters.includeDeleted && todo.deleted_status) {
      return false;
    }

    // Filter by status
    if (filters.status && todo.status !== filters.status) {
      return false;
    }

    // Filter by priority
    if (filters.priority && todo.priority !== filters.priority) {
      return false;
    }

    // Filter by mood
    if (filters.mood && todo.mood !== filters.mood) {
      return false;
    }

    // Filter by tag
    if (filters.tagId && !todo.tags.some((tag) => tag.id === filters.tagId)) {
      return false;
    }

    // Filter by due today
    if (filters.dueToday && !isDueToday(todo)) {
      return false;
    }

    // Filter by overdue
    if (filters.overdue && !isOverdue(todo)) {
      return false;
    }

    return true;
  });
}
