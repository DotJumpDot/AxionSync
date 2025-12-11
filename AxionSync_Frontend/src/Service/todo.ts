import type {
  Todo,
  TodoItem,
  TodoTag,
  TodoShare,
  TodoStatusHistory,
  TodoAnalytics,
  StreakSummary,
  CreateTodoRequest,
  UpdateTodoRequest,
  CreateTodoItemRequest,
  UpdateTodoItemRequest,
  CreateTodoTagRequest,
  UpdateTodoTagRequest,
  ShareTodoRequest,
  UpdateSharePermissionRequest,
  SetMoodRequest,
  TodoQueryParams,
  TodoStatus,
  TodoPriority,
} from "@/Types/Todo";
import http from "./http";

// ===========================
//    TODO CRUD
// ===========================

function getTodos(params?: TodoQueryParams) {
  return http.get<Todo[]>("/todos/", { params });
}

function getSharedTodos() {
  return http.get<Todo[]>("/todos/shared");
}

function getTodo(id: number) {
  return http.get<Todo>(`/todos/${id}`);
}

function createTodo(data: CreateTodoRequest) {
  return http.post<Todo>("/todos/", data);
}

function updateTodo(id: number, data: UpdateTodoRequest) {
  return http.put<Todo>(`/todos/${id}`, data);
}

function deleteTodo(id: number) {
  return http.delete(`/todos/${id}`);
}

function permanentDeleteTodo(id: number) {
  return http.delete(`/todos/${id}/permanent`);
}

function restoreTodo(id: number) {
  return http.patch<Todo>(`/todos/${id}/restore`);
}

function updateTodoStatus(id: number, status: TodoStatus) {
  return http.patch<Todo>(`/todos/${id}/status/${status}`);
}

function updateTodoPriority(id: number, priority: TodoPriority) {
  return http.patch<Todo>(`/todos/${id}/priority`, { priority });
}

// ===========================
//    TODO ITEMS (CHECKLIST)
// ===========================

function getTodoItems(todoId: number) {
  return http.get<TodoItem[]>(`/todos/${todoId}/items`);
}

function createTodoItem(todoId: number, data: CreateTodoItemRequest) {
  return http.post<TodoItem>(`/todos/${todoId}/items`, data);
}

function updateTodoItem(
  todoId: number,
  itemId: number,
  data: UpdateTodoItemRequest
) {
  return http.put<TodoItem>(`/todos/${todoId}/items/${itemId}`, data);
}

function deleteTodoItem(todoId: number, itemId: number) {
  return http.delete(`/todos/${todoId}/items/${itemId}`);
}

function toggleTodoItem(todoId: number, itemId: number) {
  return http.patch<TodoItem>(`/todos/${todoId}/items/${itemId}/toggle`);
}

// ===========================
//    TODO TAGS
// ===========================

function getTodoTags() {
  return http.get<TodoTag[]>("/todos/tags/");
}

function createTodoTag(data: CreateTodoTagRequest) {
  return http.post<TodoTag>("/todos/tags/", data);
}

function updateTodoTag(tagId: number, data: UpdateTodoTagRequest) {
  return http.put<TodoTag>(`/todos/tags/${tagId}`, data);
}

function deleteTodoTag(tagId: number) {
  return http.delete(`/todos/tags/${tagId}`);
}

function getTodosByTag(tagId: number) {
  return http.get<Todo[]>(`/todos/by-tag/${tagId}`);
}

function addTagToTodo(todoId: number, tagId: number) {
  return http.post<Todo>(`/todos/${todoId}/tags/${tagId}`);
}

function removeTagFromTodo(todoId: number, tagId: number) {
  return http.delete(`/todos/${todoId}/tags/${tagId}`);
}

// ===========================
//    TODO SHARING
// ===========================

function shareTodo(todoId: number, data: ShareTodoRequest) {
  return http.post<TodoShare>(`/todos/${todoId}/share`, data);
}

function updateSharePermission(
  todoId: number,
  shareId: number,
  data: UpdateSharePermissionRequest
) {
  return http.patch<TodoShare>(`/todos/${todoId}/share/${shareId}`, data);
}

function removeTodoShare(todoId: number, shareId: number) {
  return http.delete(`/todos/${todoId}/share/${shareId}`);
}

function getTodoShares(todoId: number) {
  return http.get<TodoShare[]>(`/todos/${todoId}/shares`);
}

// ===========================
//    TODO MOOD
// ===========================

function setTodoMood(todoId: number, data: SetMoodRequest) {
  return http.patch<Todo>(`/todos/${todoId}/mood`, data);
}

// ===========================
//    STATUS HISTORY
// ===========================

function getTodoStatusHistory(todoId: number) {
  return http.get<TodoStatusHistory[]>(`/todos/${todoId}/history`);
}

// ===========================
//    ANALYTICS & STREAK
// ===========================

function getTodoAnalytics() {
  return http.get<TodoAnalytics>("/todos/analytics");
}

function getStreak() {
  return http.get<StreakSummary>("/todos/streak");
}

// ===========================
//    EXPORT SERVICE
// ===========================

const TodoService = {
  // Todo CRUD
  getTodos,
  getSharedTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  permanentDeleteTodo,
  restoreTodo,
  updateTodoStatus,
  updateTodoPriority,

  // Todo Items (Checklist)
  getTodoItems,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
  toggleTodoItem,

  // Todo Tags
  getTodoTags,
  createTodoTag,
  updateTodoTag,
  deleteTodoTag,
  getTodosByTag,
  addTagToTodo,
  removeTagFromTodo,

  // Todo Sharing
  shareTodo,
  updateSharePermission,
  removeTodoShare,
  getTodoShares,

  // Mood
  setTodoMood,

  // Status History
  getTodoStatusHistory,

  // Analytics & Streak
  getTodoAnalytics,
  getStreak,
};

export default TodoService;
