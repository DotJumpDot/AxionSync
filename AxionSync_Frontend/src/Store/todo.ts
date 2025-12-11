// stores/todoStore.ts
import { create } from "zustand";
import todoService from "@/Service/todo";
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
  TodoStatus,
  TodoPriority,
  TodoMood,
} from "@/Types/Todo";

type SortByOption = "created" | "due_date" | "priority" | "title" | "status";

type TodoStore = {
  todos: Todo[];
  sharedTodos: Todo[];
  tags: TodoTag[];
  loading: boolean;
  selectedTodo: Todo | null;
  filterStatus: TodoStatus | null;
  filterPriority: TodoPriority | null;
  filterMood: TodoMood | null;
  filterTag: number | null;
  sortBy: SortByOption;
  includeDeleted: boolean;
  analytics: TodoAnalytics | null;
  streak: StreakSummary | null;

  // Todo CRUD Actions
  getTodos: (params?: {
    status?: TodoStatus | null;
    priority?: TodoPriority | null;
    include_deleted?: boolean;
    tag_id?: number | null;
  }) => Promise<{ success: boolean; message?: string }>;
  getSharedTodos: () => Promise<{ success: boolean; message?: string }>;
  getTodo: (
    id: number
  ) => Promise<{ success: boolean; message?: string; todo?: Todo }>;
  createTodo: (
    data: CreateTodoRequest
  ) => Promise<{ success: boolean; message?: string; todo?: Todo }>;
  updateTodo: (
    id: number,
    data: UpdateTodoRequest
  ) => Promise<{ success: boolean; message?: string; todo?: Todo }>;
  deleteTodo: (id: number) => Promise<{ success: boolean; message?: string }>;
  permanentDeleteTodo: (
    id: number
  ) => Promise<{ success: boolean; message?: string }>;
  restoreTodo: (
    id: number
  ) => Promise<{ success: boolean; message?: string; todo?: Todo }>;
  updateTodoStatus: (
    id: number,
    status: TodoStatus
  ) => Promise<{ success: boolean; message?: string; todo?: Todo }>;
  updateTodoPriority: (
    id: number,
    priority: TodoPriority
  ) => Promise<{ success: boolean; message?: string; todo?: Todo }>;
  setTodoMood: (
    id: number,
    data: SetMoodRequest
  ) => Promise<{ success: boolean; message?: string; todo?: Todo }>;

  // Todo Items (Checklist) Actions
  createTodoItem: (
    todoId: number,
    data: CreateTodoItemRequest
  ) => Promise<{ success: boolean; message?: string; item?: TodoItem }>;
  updateTodoItem: (
    todoId: number,
    itemId: number,
    data: UpdateTodoItemRequest
  ) => Promise<{ success: boolean; message?: string; item?: TodoItem }>;
  deleteTodoItem: (
    todoId: number,
    itemId: number
  ) => Promise<{ success: boolean; message?: string }>;
  toggleTodoItem: (
    todoId: number,
    itemId: number
  ) => Promise<{ success: boolean; message?: string; item?: TodoItem }>;

  // Todo Tags Actions
  getTodoTags: () => Promise<{ success: boolean; message?: string }>;
  createTodoTag: (
    data: CreateTodoTagRequest
  ) => Promise<{ success: boolean; message?: string; tag?: TodoTag }>;
  updateTodoTag: (
    tagId: number,
    data: UpdateTodoTagRequest
  ) => Promise<{ success: boolean; message?: string; tag?: TodoTag }>;
  deleteTodoTag: (
    tagId: number
  ) => Promise<{ success: boolean; message?: string }>;
  getTodosByTag: (
    tagId: number
  ) => Promise<{ success: boolean; message?: string }>;
  addTagToTodo: (
    todoId: number,
    tagId: number
  ) => Promise<{ success: boolean; message?: string; todo?: Todo }>;
  removeTagFromTodo: (
    todoId: number,
    tagId: number
  ) => Promise<{ success: boolean; message?: string }>;

  // Sharing Actions
  shareTodo: (
    todoId: number,
    data: ShareTodoRequest
  ) => Promise<{ success: boolean; message?: string; share?: TodoShare }>;
  updateSharePermission: (
    todoId: number,
    shareId: number,
    data: UpdateSharePermissionRequest
  ) => Promise<{ success: boolean; message?: string; share?: TodoShare }>;
  removeTodoShare: (
    todoId: number,
    shareId: number
  ) => Promise<{ success: boolean; message?: string }>;

  // Analytics & Streak Actions
  getTodoAnalytics: () => Promise<{ success: boolean; message?: string }>;
  getStreak: () => Promise<{ success: boolean; message?: string }>;
  getTodoStatusHistory: (todoId: number) => Promise<{
    success: boolean;
    message?: string;
    history?: TodoStatusHistory[];
  }>;

  // UI State Setters
  setSelectedTodo: (todo: Todo | null) => void;
  setFilterStatus: (status: TodoStatus | null) => void;
  setFilterPriority: (priority: TodoPriority | null) => void;
  setFilterMood: (mood: TodoMood | null) => void;
  setFilterTag: (tagId: number | null) => void;
  setSortBy: (sortBy: SortByOption) => void;
  setIncludeDeleted: (include: boolean) => void;
  clearFilters: () => void;
};

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  sharedTodos: [],
  tags: [],
  loading: false,
  selectedTodo: null,
  filterStatus: null,
  filterPriority: null,
  filterMood: null,
  filterTag: null,
  sortBy: "created",
  includeDeleted: false,
  analytics: null,
  streak: null,

  // ===========================
  //    TODO CRUD
  // ===========================

  // 🔹 Get all todos for the user
  getTodos: async (params) => {
    set({ loading: true });
    try {
      const queryParams: Record<string, string | boolean | number> = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.priority) queryParams.priority = params.priority;
      if (params?.include_deleted) queryParams.include_deleted = true;
      if (params?.tag_id) queryParams.tag_id = params.tag_id;

      const res = await todoService.getTodos(queryParams);
      set({ todos: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch todos:", e);
      set({ loading: false });
      return { success: false, message: "Failed to get todos" };
    }
  },

  // 🔹 Get shared todos
  getSharedTodos: async () => {
    set({ loading: true });
    try {
      const res = await todoService.getSharedTodos();
      set({ sharedTodos: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch shared todos:", e);
      set({ loading: false });
      return { success: false, message: "Failed to get shared todos" };
    }
  },

  // 🔹 Get a single todo
  getTodo: async (id: number) => {
    try {
      const res = await todoService.getTodo(id);
      const todo = res.data;
      set({ selectedTodo: todo });
      return { success: true, todo };
    } catch (e) {
      console.error("Failed to fetch todo:", e);
      return { success: false, message: "Failed to get todo" };
    }
  },

  // 🔹 Create a new todo
  createTodo: async (data: CreateTodoRequest) => {
    try {
      const res = await todoService.createTodo(data);
      const newTodo = res.data;

      // Add to list (newest first)
      set((state) => ({
        todos: [newTodo, ...state.todos],
      }));

      return { success: true, todo: newTodo };
    } catch (e) {
      console.error("Failed to create todo:", e);
      return { success: false, message: "Failed to create todo" };
    }
  },

  // 🔹 Update a todo
  updateTodo: async (id: number, data: UpdateTodoRequest) => {
    try {
      const res = await todoService.updateTodo(id, data);
      const updatedTodo = res.data;

      // Update in list
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
        selectedTodo:
          state.selectedTodo?.id === id ? updatedTodo : state.selectedTodo,
      }));

      return { success: true, todo: updatedTodo };
    } catch (e) {
      console.error("Failed to update todo:", e);
      return { success: false, message: "Failed to update todo" };
    }
  },

  // 🔹 Soft delete a todo
  deleteTodo: async (id: number) => {
    try {
      await todoService.deleteTodo(id);

      // Remove from list (or mark as deleted if includeDeleted is true)
      const { includeDeleted } = get();
      if (includeDeleted) {
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, deleted_status: true } : t
          ),
        }));
      } else {
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        }));
      }

      return { success: true };
    } catch (e) {
      console.error("Failed to delete todo:", e);
      return { success: false, message: "Failed to delete todo" };
    }
  },

  // 🔹 Permanently delete a todo
  permanentDeleteTodo: async (id: number) => {
    try {
      await todoService.permanentDeleteTodo(id);

      // Remove from list
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
        selectedTodo: state.selectedTodo?.id === id ? null : state.selectedTodo,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to permanently delete todo:", e);
      return { success: false, message: "Failed to permanently delete todo" };
    }
  },

  // 🔹 Restore a soft-deleted todo
  restoreTodo: async (id: number) => {
    try {
      const res = await todoService.restoreTodo(id);
      const restoredTodo = res.data;

      // Update in list
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? restoredTodo : t)),
      }));

      return { success: true, todo: restoredTodo };
    } catch (e) {
      console.error("Failed to restore todo:", e);
      return { success: false, message: "Failed to restore todo" };
    }
  },

  // 🔹 Update todo status
  updateTodoStatus: async (id: number, status: TodoStatus) => {
    try {
      const res = await todoService.updateTodoStatus(id, status);
      const updatedTodo = res.data;

      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
        selectedTodo:
          state.selectedTodo?.id === id ? updatedTodo : state.selectedTodo,
      }));

      return { success: true, todo: updatedTodo };
    } catch (e) {
      console.error("Failed to update todo status:", e);
      return { success: false, message: "Failed to update status" };
    }
  },

  // 🔹 Update todo priority
  updateTodoPriority: async (id: number, priority: TodoPriority) => {
    try {
      const res = await todoService.updateTodoPriority(id, priority);
      const updatedTodo = res.data;

      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
        selectedTodo:
          state.selectedTodo?.id === id ? updatedTodo : state.selectedTodo,
      }));

      return { success: true, todo: updatedTodo };
    } catch (e) {
      console.error("Failed to update todo priority:", e);
      return { success: false, message: "Failed to update priority" };
    }
  },

  // 🔹 Set todo mood
  setTodoMood: async (id: number, data: SetMoodRequest) => {
    try {
      const res = await todoService.setTodoMood(id, data);
      const updatedTodo = res.data;

      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
        selectedTodo:
          state.selectedTodo?.id === id ? updatedTodo : state.selectedTodo,
      }));

      return { success: true, todo: updatedTodo };
    } catch (e) {
      console.error("Failed to set todo mood:", e);
      return { success: false, message: "Failed to set mood" };
    }
  },

  // ===========================
  //    TODO ITEMS (CHECKLIST)
  // ===========================

  // 🔹 Create a checklist item
  createTodoItem: async (todoId: number, data: CreateTodoItemRequest) => {
    try {
      const res = await todoService.createTodoItem(todoId, data);
      const newItem = res.data;

      // Update the todo's items in state
      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId ? { ...t, items: [...t.items, newItem] } : t
        ),
        selectedTodo:
          state.selectedTodo?.id === todoId
            ? {
                ...state.selectedTodo,
                items: [...state.selectedTodo.items, newItem],
              }
            : state.selectedTodo,
      }));

      return { success: true, item: newItem };
    } catch (e) {
      console.error("Failed to create todo item:", e);
      return { success: false, message: "Failed to create checklist item" };
    }
  },

  // 🔹 Update a checklist item
  updateTodoItem: async (
    todoId: number,
    itemId: number,
    data: UpdateTodoItemRequest
  ) => {
    try {
      const res = await todoService.updateTodoItem(todoId, itemId, data);
      const updatedItem = res.data;

      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                items: t.items.map((i) => (i.id === itemId ? updatedItem : i)),
              }
            : t
        ),
        selectedTodo:
          state.selectedTodo?.id === todoId
            ? {
                ...state.selectedTodo,
                items: state.selectedTodo.items.map((i) =>
                  i.id === itemId ? updatedItem : i
                ),
              }
            : state.selectedTodo,
      }));

      return { success: true, item: updatedItem };
    } catch (e) {
      console.error("Failed to update todo item:", e);
      return { success: false, message: "Failed to update checklist item" };
    }
  },

  // 🔹 Delete a checklist item
  deleteTodoItem: async (todoId: number, itemId: number) => {
    try {
      await todoService.deleteTodoItem(todoId, itemId);

      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId
            ? { ...t, items: t.items.filter((i) => i.id !== itemId) }
            : t
        ),
        selectedTodo:
          state.selectedTodo?.id === todoId
            ? {
                ...state.selectedTodo,
                items: state.selectedTodo.items.filter((i) => i.id !== itemId),
              }
            : state.selectedTodo,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to delete todo item:", e);
      return { success: false, message: "Failed to delete checklist item" };
    }
  },

  // 🔹 Toggle a checklist item
  toggleTodoItem: async (todoId: number, itemId: number) => {
    try {
      const res = await todoService.toggleTodoItem(todoId, itemId);
      const updatedItem = res.data;

      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                items: t.items.map((i) => (i.id === itemId ? updatedItem : i)),
              }
            : t
        ),
        selectedTodo:
          state.selectedTodo?.id === todoId
            ? {
                ...state.selectedTodo,
                items: state.selectedTodo.items.map((i) =>
                  i.id === itemId ? updatedItem : i
                ),
              }
            : state.selectedTodo,
      }));

      return { success: true, item: updatedItem };
    } catch (e) {
      console.error("Failed to toggle todo item:", e);
      return { success: false, message: "Failed to toggle checklist item" };
    }
  },

  // ===========================
  //    TODO TAGS
  // ===========================

  // 🔹 Get all tags
  getTodoTags: async () => {
    try {
      const res = await todoService.getTodoTags();
      set({ tags: res.data });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch todo tags:", e);
      return { success: false, message: "Failed to get tags" };
    }
  },

  // 🔹 Create a tag
  createTodoTag: async (data: CreateTodoTagRequest) => {
    try {
      const res = await todoService.createTodoTag(data);
      const newTag = res.data;

      set((state) => ({
        tags: [...state.tags, newTag],
      }));

      return { success: true, tag: newTag };
    } catch (e) {
      console.error("Failed to create todo tag:", e);
      return { success: false, message: "Failed to create tag" };
    }
  },

  // 🔹 Update a tag
  updateTodoTag: async (tagId: number, data: UpdateTodoTagRequest) => {
    try {
      const res = await todoService.updateTodoTag(tagId, data);
      const updatedTag = res.data;

      set((state) => ({
        tags: state.tags.map((t) => (t.id === tagId ? updatedTag : t)),
      }));

      return { success: true, tag: updatedTag };
    } catch (e) {
      console.error("Failed to update todo tag:", e);
      return { success: false, message: "Failed to update tag" };
    }
  },

  // 🔹 Delete a tag
  deleteTodoTag: async (tagId: number) => {
    try {
      await todoService.deleteTodoTag(tagId);

      set((state) => ({
        tags: state.tags.filter((t) => t.id !== tagId),
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to delete todo tag:", e);
      return { success: false, message: "Failed to delete tag" };
    }
  },

  // 🔹 Get todos by tag
  getTodosByTag: async (tagId: number) => {
    set({ loading: true });
    try {
      const res = await todoService.getTodosByTag(tagId);
      set({ todos: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch todos by tag:", e);
      set({ loading: false });
      return { success: false, message: "Failed to get todos by tag" };
    }
  },

  // 🔹 Add tag to todo
  addTagToTodo: async (todoId: number, tagId: number) => {
    try {
      const res = await todoService.addTagToTodo(todoId, tagId);
      const updatedTodo = res.data;

      set((state) => ({
        todos: state.todos.map((t) => (t.id === todoId ? updatedTodo : t)),
        selectedTodo:
          state.selectedTodo?.id === todoId ? updatedTodo : state.selectedTodo,
      }));

      return { success: true, todo: updatedTodo };
    } catch (e) {
      console.error("Failed to add tag to todo:", e);
      return { success: false, message: "Failed to add tag" };
    }
  },

  // 🔹 Remove tag from todo
  removeTagFromTodo: async (todoId: number, tagId: number) => {
    try {
      await todoService.removeTagFromTodo(todoId, tagId);

      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId
            ? { ...t, tags: t.tags.filter((tag) => tag.id !== tagId) }
            : t
        ),
        selectedTodo:
          state.selectedTodo?.id === todoId
            ? {
                ...state.selectedTodo,
                tags: state.selectedTodo.tags.filter((tag) => tag.id !== tagId),
              }
            : state.selectedTodo,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to remove tag from todo:", e);
      return { success: false, message: "Failed to remove tag" };
    }
  },

  // ===========================
  //    TODO SHARING
  // ===========================

  // 🔹 Share a todo
  shareTodo: async (todoId: number, data: ShareTodoRequest) => {
    try {
      const res = await todoService.shareTodo(todoId, data);
      const newShare = res.data;

      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId ? { ...t, shares: [...t.shares, newShare] } : t
        ),
        selectedTodo:
          state.selectedTodo?.id === todoId
            ? {
                ...state.selectedTodo,
                shares: [...state.selectedTodo.shares, newShare],
              }
            : state.selectedTodo,
      }));

      return { success: true, share: newShare };
    } catch (e) {
      console.error("Failed to share todo:", e);
      return { success: false, message: "Failed to share todo" };
    }
  },

  // 🔹 Update share permission
  updateSharePermission: async (
    todoId: number,
    shareId: number,
    data: UpdateSharePermissionRequest
  ) => {
    try {
      const res = await todoService.updateSharePermission(
        todoId,
        shareId,
        data
      );
      const updatedShare = res.data;

      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                shares: t.shares.map((s) =>
                  s.id === shareId ? updatedShare : s
                ),
              }
            : t
        ),
        selectedTodo:
          state.selectedTodo?.id === todoId
            ? {
                ...state.selectedTodo,
                shares: state.selectedTodo.shares.map((s) =>
                  s.id === shareId ? updatedShare : s
                ),
              }
            : state.selectedTodo,
      }));

      return { success: true, share: updatedShare };
    } catch (e) {
      console.error("Failed to update share permission:", e);
      return { success: false, message: "Failed to update permission" };
    }
  },

  // 🔹 Remove todo share
  removeTodoShare: async (todoId: number, shareId: number) => {
    try {
      await todoService.removeTodoShare(todoId, shareId);

      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId
            ? { ...t, shares: t.shares.filter((s) => s.id !== shareId) }
            : t
        ),
        selectedTodo:
          state.selectedTodo?.id === todoId
            ? {
                ...state.selectedTodo,
                shares: state.selectedTodo.shares.filter(
                  (s) => s.id !== shareId
                ),
              }
            : state.selectedTodo,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to remove todo share:", e);
      return { success: false, message: "Failed to remove share" };
    }
  },

  // ===========================
  //    ANALYTICS & STREAK
  // ===========================

  // 🔹 Get todo analytics
  getTodoAnalytics: async () => {
    try {
      const res = await todoService.getTodoAnalytics();
      set({ analytics: res.data });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch todo analytics:", e);
      return { success: false, message: "Failed to get analytics" };
    }
  },

  // 🔹 Get streak
  getStreak: async () => {
    try {
      const res = await todoService.getStreak();
      set({ streak: res.data });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch streak:", e);
      return { success: false, message: "Failed to get streak" };
    }
  },

  // 🔹 Get status history
  getTodoStatusHistory: async (todoId: number) => {
    try {
      const res = await todoService.getTodoStatusHistory(todoId);
      return { success: true, history: res.data };
    } catch (e) {
      console.error("Failed to fetch status history:", e);
      return { success: false, message: "Failed to get history" };
    }
  },

  // ===========================
  //    UI STATE SETTERS
  // ===========================

  setSelectedTodo: (todo) => set({ selectedTodo: todo }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterMood: (mood) => set({ filterMood: mood }),
  setFilterTag: (tagId) => set({ filterTag: tagId }),
  setSortBy: (sortBy) => set({ sortBy }),
  setIncludeDeleted: (include) => set({ includeDeleted: include }),
  clearFilters: () =>
    set({
      filterStatus: null,
      filterPriority: null,
      filterMood: null,
      filterTag: null,
      sortBy: "created",
      includeDeleted: false,
    }),
}));
