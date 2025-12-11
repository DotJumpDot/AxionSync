"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button, Empty, Spin, Input, Progress, Card } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useTodoStore } from "@/Store/todo";
import { useNotification } from "@/Functions/Notification/useNotification";
import { TodoCard, TodoFilters, TodoFormModal } from "@/Components/Todo";
import { filterTodos, sortTodos } from "@/Functions/Todo";
import useShowDeleteConfirm from "@/Components/Modal/DeleteConfirmModal";
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoStatus,
} from "@/Types/Todo";

// Type for translation function
type TranslateFunction = (key: string) => string;

export default function TodoPage() {
  const {
    todos,
    tags,
    loading,
    selectedTodo,
    filterStatus,
    filterPriority,
    filterMood,
    filterTag,
    sortBy,
    includeDeleted,
    analytics,
    streak,
    getTodos,
    getTodoTags,
    createTodo,
    updateTodo,
    deleteTodo,
    permanentDeleteTodo,
    restoreTodo,
    updateTodoStatus,
    getTodoAnalytics,
    getStreak,
    setSelectedTodo,
    setFilterStatus,
    setFilterPriority,
    setFilterMood,
    setFilterTag,
    setSortBy,
    setIncludeDeleted,
    clearFilters,
  } = useTodoStore();

  const { showNotification: baseShowNotification, modal } = useNotification();
  const tTodo = useTranslations("todo");
  const tCommon = useTranslations("common");
  const showDeleteConfirm = useShowDeleteConfirm();

  // Cast translation functions for component props
  const t = tTodo as TranslateFunction;
  const tc = tCommon as TranslateFunction;

  // Wrap notification to use topLeft placement and 1.5s duration
  const showNotification = (
    msg: string,
    type?: "error" | "warning" | "info"
  ) => {
    baseShowNotification(msg, type, 1.5, "topLeft");
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data on mount
  useEffect(() => {
    getTodos({ include_deleted: includeDeleted });
    getTodoTags();
    getTodoAnalytics();
    getStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change
  useEffect(() => {
    getTodos({
      status: filterStatus,
      priority: filterPriority,
      include_deleted: includeDeleted,
      tag_id: filterTag,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterPriority, includeDeleted, filterTag]);

  // Filter, search, and sort todos
  const displayedTodos = useMemo(() => {
    let filtered = filterTodos(todos, {
      status: filterStatus,
      priority: filterPriority,
      mood: filterMood,
      tagId: filterTag,
      includeDeleted,
    });

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          todo.description?.toLowerCase().includes(query) ||
          todo.tags.some((tag) => tag.name.toLowerCase().includes(query))
      );
    }

    return sortTodos(filtered, sortBy);
  }, [
    todos,
    filterStatus,
    filterPriority,
    filterMood,
    filterTag,
    includeDeleted,
    searchQuery,
    sortBy,
  ]);

  // Handlers
  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingTodo(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (todo: Todo) => {
    setModalMode("edit");
    setEditingTodo(todo);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTodo(null);
  };

  const handleCreate = async (data: CreateTodoRequest) => {
    const result = await createTodo(data);
    if (result.success) {
      showNotification(t("messages.todoCreated"), "info");
      getTodoAnalytics();
    } else {
      showNotification(t("errors.failedCreate"), "error");
    }
  };

  const handleUpdate = async (id: number, data: UpdateTodoRequest) => {
    const result = await updateTodo(id, data);
    if (result.success) {
      showNotification(t("messages.todoUpdated"), "info");
    } else {
      showNotification(t("errors.failedUpdate"), "error");
    }
  };

  const handleDelete = (todo: Todo) => {
    showDeleteConfirm(modal, {
      title: t("confirmDelete.title"),
      content: t("confirmDelete.message"),
      onConfirm: async () => {
        const result = await deleteTodo(todo.id);
        if (result.success) {
          showNotification(t("messages.todoDeleted"), "info");
          getTodoAnalytics();
        } else {
          showNotification(t("errors.failedDelete"), "error");
        }
      },
    });
  };

  const handlePermanentDelete = (todo: Todo) => {
    showDeleteConfirm(modal, {
      title: t("confirmDelete.permanentTitle"),
      content: t("confirmDelete.permanentMessage"),
      onConfirm: async () => {
        const result = await permanentDeleteTodo(todo.id);
        if (result.success) {
          showNotification(t("messages.todoPermanentDeleted"), "info");
          getTodoAnalytics();
        } else {
          showNotification(t("errors.failedDelete"), "error");
        }
      },
    });
  };

  const handleRestore = async (todo: Todo) => {
    const result = await restoreTodo(todo.id);
    if (result.success) {
      showNotification(t("messages.todoRestored"), "info");
      getTodoAnalytics();
    } else {
      showNotification(t("errors.failedRestore"), "error");
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    const newStatus: TodoStatus =
      todo.status === "completed" ? "pending" : "completed";
    const result = await updateTodoStatus(todo.id, newStatus);
    if (result.success) {
      // Get the translated status label
      const statusLabel = t(`statuses.${newStatus}`);
      // Build the message manually
      const message = `${t("messages.statusChangedPrefix")} ${statusLabel}`;
      showNotification(message, "info");
      getTodoAnalytics();
      getStreak();
    }
  };

  const handleCardClick = (todo: Todo) => {
    setSelectedTodo(todo);
    handleOpenEdit(todo);
  };

  // Calculate completion rate for display
  const completionRate = analytics?.completion_rate ?? 0;

  return (
    <div className="min-h-screen bg-[#1a1d21] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
            <p className="text-gray-400 text-sm mt-1">{t("myTodos")}</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            size="large"
          >
            {t("addTodo")}
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Completion Rate */}
          <Card className="bg-[#2f3136] border-0">
            <div className="text-center">
              <Progress
                type="circle"
                percent={completionRate}
                size={80}
                strokeColor="#52c41a"
                railColor="#4a4d52"
                format={(percent) => (
                  <span className="text-white font-semibold">{percent}%</span>
                )}
              />
              <p className="text-gray-400 text-sm mt-2">
                {t("analytics.completionRate")}
              </p>
            </div>
          </Card>

          {/* Current Streak */}
          <Card className="bg-[#2f3136] border-0">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">
                🔥 {streak?.current_streak ?? 0}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {t("analytics.currentStreak")} {t("analytics.days")}
              </p>
            </div>
          </Card>

          {/* Total Completed */}
          <Card className="bg-[#2f3136] border-0">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                ✓ {analytics?.completed_todos ?? 0}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {t("analytics.completed")}
              </p>
            </div>
          </Card>

          {/* Total Pending */}
          <Card className="bg-[#2f3136] border-0">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                ○ {analytics?.pending_todos ?? 0}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {t("analytics.pending")}
              </p>
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <Input
            placeholder={tc("search")}
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#2f3136] border-[#40444b] text-white max-w-md"
            allowClear
          />

          {/* Filters */}
          <TodoFilters
            filterStatus={filterStatus}
            filterPriority={filterPriority}
            filterMood={filterMood}
            filterTag={filterTag}
            sortBy={sortBy}
            includeDeleted={includeDeleted}
            onStatusChange={setFilterStatus}
            onPriorityChange={setFilterPriority}
            onMoodChange={setFilterMood}
            onTagChange={setFilterTag}
            onSortByChange={setSortBy}
            onIncludeDeletedChange={setIncludeDeleted}
            onClearFilters={clearFilters}
            t={t}
            tags={tags}
          />
        </div>

        {/* Todo List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : displayedTodos.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <p className="text-gray-400 text-lg">
                  {t("empty.noTodosTitle")}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {t("empty.noTodosMessage")}
                </p>
              </div>
            }
            className="py-20"
          >
            <Button type="primary" onClick={handleOpenCreate}>
              {t("addTodo")}
            </Button>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onClick={() => handleCardClick(todo)}
                onEdit={() => handleOpenEdit(todo)}
                onDelete={() =>
                  todo.deleted_status
                    ? handlePermanentDelete(todo)
                    : handleDelete(todo)
                }
                onRestore={() => handleRestore(todo)}
                onToggleComplete={() => handleToggleComplete(todo)}
                isSelected={selectedTodo?.id === todo.id}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <TodoFormModal
        open={modalOpen}
        mode={modalMode}
        todo={editingTodo}
        tags={tags}
        onClose={handleCloseModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        t={t}
      />
    </div>
  );
}
