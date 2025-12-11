import type { TodoStatus, TodoPriority, TodoMood } from "@/Types/Todo";

/**
 * Get color for status badge
 */
export function getStatusColor(status: TodoStatus): string {
  const colors: Record<TodoStatus, string> = {
    pending: "#d9d9d9", // gray
    in_progress: "#1890ff", // blue
    completed: "#52c41a", // green
    cancelled: "#ff4d4f", // red
  };
  return colors[status] || "#d9d9d9";
}

/**
 * Get Tailwind class for status
 */
export function getStatusClass(status: TodoStatus): string {
  const classes: Record<TodoStatus, string> = {
    pending: "bg-gray-500/20 text-gray-300",
    in_progress: "bg-blue-500/20 text-blue-400",
    completed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };
  return classes[status] || "bg-gray-500/20 text-gray-300";
}

/**
 * Get color for priority badge
 */
export function getPriorityColor(priority: TodoPriority): string {
  const colors: Record<TodoPriority, string> = {
    low: "#d9d9d9", // gray
    medium: "#1890ff", // blue
    high: "#fa8c16", // orange
    urgent: "#ff4d4f", // red
  };
  return colors[priority] || "#d9d9d9";
}

/**
 * Get Tailwind class for priority
 */
export function getPriorityClass(priority: TodoPriority): string {
  const classes: Record<TodoPriority, string> = {
    low: "bg-gray-500/20 text-gray-300",
    medium: "bg-blue-500/20 text-blue-400",
    high: "bg-orange-500/20 text-orange-400",
    urgent: "bg-red-500/20 text-red-400",
  };
  return classes[priority] || "bg-gray-500/20 text-gray-300";
}

/**
 * Get priority icon
 */
export function getPriorityIcon(priority: TodoPriority): string {
  const icons: Record<TodoPriority, string> = {
    low: "↓",
    medium: "→",
    high: "↑",
    urgent: "⚡",
  };
  return icons[priority] || "→";
}

/**
 * Get color for mood badge
 */
export function getMoodColor(mood: TodoMood): string {
  const colors: Record<TodoMood, string> = {
    motivated: "#52c41a", // green
    lazy: "#d9d9d9", // gray
    focused: "#1890ff", // blue
    stressed: "#fa8c16", // orange
    excited: "#eb2f96", // magenta
  };
  return colors[mood] || "#d9d9d9";
}

/**
 * Get Tailwind class for mood
 */
export function getMoodClass(mood: TodoMood): string {
  const classes: Record<TodoMood, string> = {
    motivated: "bg-green-500/20 text-green-400",
    lazy: "bg-gray-500/20 text-gray-300",
    focused: "bg-blue-500/20 text-blue-400",
    stressed: "bg-orange-500/20 text-orange-400",
    excited: "bg-pink-500/20 text-pink-400",
  };
  return classes[mood] || "bg-gray-500/20 text-gray-300";
}

/**
 * Get emoji for mood
 */
export function getMoodEmoji(mood: TodoMood): string {
  const emojis: Record<TodoMood, string> = {
    motivated: "🔥",
    lazy: "😴",
    focused: "🎯",
    stressed: "😰",
    excited: "🎉",
  };
  return emojis[mood] || "😐";
}
