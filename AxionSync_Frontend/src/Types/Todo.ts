import type { User } from "./User";

// Enum-like constants for type validation
export const TODO_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const TODO_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const TODO_REPEAT_TYPES = ["daily", "weekly", "monthly"] as const;

export const TODO_MOODS = [
  "motivated",
  "lazy",
  "focused",
  "stressed",
  "excited",
] as const;

export const TODO_SHARE_PERMISSIONS = ["view", "edit"] as const;

// Derived types from constants
export type TodoStatus = (typeof TODO_STATUSES)[number];
export type TodoPriority = (typeof TODO_PRIORITIES)[number];
export type TodoRepeatType = (typeof TODO_REPEAT_TYPES)[number];
export type TodoMood = (typeof TODO_MOODS)[number];
export type TodoSharePermission = (typeof TODO_SHARE_PERMISSIONS)[number];

// Color mappings for UI display
export const STATUS_COLORS: Record<TodoStatus, string> = {
  pending: "default",
  in_progress: "processing",
  completed: "success",
  cancelled: "error",
};

export const PRIORITY_COLORS: Record<TodoPriority, string> = {
  low: "default",
  medium: "blue",
  high: "orange",
  urgent: "red",
};

export const MOOD_COLORS: Record<TodoMood, string> = {
  motivated: "green",
  lazy: "default",
  focused: "blue",
  stressed: "orange",
  excited: "magenta",
};

// ===========================
//    ENTITY INTERFACES
// ===========================

/**
 * TodoItem - Checklist item within a todo
 */
export interface TodoItem {
  id: number;
  todo_id: number;
  content: string;
  is_done: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * TodoTag - Tag for categorizing todos
 */
export interface TodoTag {
  id: number;
  name: string;
  color: string | null;
  user_id: number;
  created_at: string;
}

/**
 * TodoShare - Shared todo with other users
 */
export interface TodoShare {
  id: number;
  todo_id: number;
  shared_with_user_id: number;
  permission: TodoSharePermission;
  shared_by_user: User | null;
  shared_with_user: User | null;
  created_at: string;
}

/**
 * TodoStatusHistory - Status change history for analytics
 */
export interface TodoStatusHistory {
  id: number;
  todo_id: number;
  old_status: TodoStatus;
  new_status: TodoStatus;
  changed_by: number;
  changed_by_user: User | null;
  changed_at: string;
}

/**
 * Todo - Main todo entity
 */
export interface Todo {
  id: number;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  due_date: string | null;
  completed_at: string | null;
  is_repeat: boolean;
  repeat_type: TodoRepeatType | null;
  mood: TodoMood | null;
  user: User;
  items: TodoItem[];
  tags: TodoTag[];
  shares: TodoShare[];
  deleted_status: boolean;
  created_at: string;
  updated_at: string | null;
}

// ===========================
//    REQUEST INTERFACES
// ===========================

/**
 * CreateTodoRequest - Request for creating a todo
 */
export interface CreateTodoRequest {
  title: string;
  description?: string | null;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_date?: string | null;
  is_repeat?: boolean;
  repeat_type?: TodoRepeatType | null;
  mood?: TodoMood | null;
  tag_ids?: number[] | null;
}

/**
 * UpdateTodoRequest - Request for updating a todo
 */
export interface UpdateTodoRequest {
  title?: string | null;
  description?: string | null;
  status?: TodoStatus | null;
  priority?: TodoPriority | null;
  due_date?: string | null;
  is_repeat?: boolean | null;
  repeat_type?: TodoRepeatType | null;
  mood?: TodoMood | null;
  tag_ids?: number[] | null;
}

/**
 * CreateTodoItemRequest - Request for creating a checklist item
 */
export interface CreateTodoItemRequest {
  content: string;
}

/**
 * UpdateTodoItemRequest - Request for updating a checklist item
 */
export interface UpdateTodoItemRequest {
  content?: string | null;
  is_done?: boolean | null;
}

/**
 * CreateTodoTagRequest - Request for creating a todo tag
 */
export interface CreateTodoTagRequest {
  name: string;
  color?: string | null;
}

/**
 * UpdateTodoTagRequest - Request for updating a todo tag
 */
export interface UpdateTodoTagRequest {
  name?: string | null;
  color?: string | null;
}

/**
 * ShareTodoRequest - Request for sharing a todo
 */
export interface ShareTodoRequest {
  shared_with_user_id: number;
  permission?: TodoSharePermission;
}

/**
 * UpdateSharePermissionRequest - Request for updating share permission
 */
export interface UpdateSharePermissionRequest {
  permission: TodoSharePermission;
}

/**
 * SetMoodRequest - Request for setting todo mood
 */
export interface SetMoodRequest {
  mood: TodoMood;
}

// ===========================
//    RESPONSE INTERFACES
// ===========================

/**
 * StreakSummary - Response for streak info
 */
export interface StreakSummary {
  current_streak: number;
  longest_streak: number;
  total_completed: number;
  last_completed_date: string | null;
}

/**
 * TodoAnalytics - Response for todo analytics
 */
export interface TodoAnalytics {
  total_todos: number;
  completed_todos: number;
  pending_todos: number;
  in_progress_todos: number;
  cancelled_todos: number;
  completion_rate: number;
  streak: StreakSummary;
}

// ===========================
//    QUERY PARAMETERS
// ===========================

/**
 * TodoQueryParams - Query parameters for fetching todos
 */
export interface TodoQueryParams {
  status?: TodoStatus;
  priority?: TodoPriority;
  include_deleted?: boolean;
  tag_id?: number;
  due_before?: string;
  due_after?: string;
}
