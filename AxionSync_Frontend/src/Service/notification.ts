import type {
  TodoNotification,
  UserDeviceToken,
  UpcomingNotification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  RegisterDeviceTokenRequest,
  UpdateDeviceTokenRequest,
  NotificationQueryParams,
} from "@/Types/Notification";
import http from "./http";

// ===========================
//    NOTIFICATIONS
// ===========================

function getNotifications(params?: NotificationQueryParams) {
  return http.get<TodoNotification[]>("/notifications/", { params });
}

function getNotification(id: number) {
  return http.get<TodoNotification>(`/notifications/${id}`);
}

function createNotification(data: CreateNotificationRequest) {
  return http.post<TodoNotification>("/notifications/", data);
}

function updateNotification(id: number, data: UpdateNotificationRequest) {
  return http.put<TodoNotification>(`/notifications/${id}`, data);
}

function deleteNotification(id: number) {
  return http.delete(`/notifications/${id}`);
}

function getUpcomingNotifications(hours?: number) {
  const params = hours !== undefined ? { hours } : {};
  return http.get<UpcomingNotification[]>("/notifications/upcoming", {
    params,
  });
}

function getNotificationsByTodo(todoId: number) {
  return http.get<TodoNotification[]>(`/notifications/by-todo/${todoId}`);
}

function markNotificationSent(id: number) {
  return http.patch<TodoNotification>(`/notifications/${id}/sent`);
}

// ===========================
//    DEVICE TOKENS
// ===========================

function getDeviceTokens() {
  return http.get<UserDeviceToken[]>("/notifications/devices/");
}

function registerDeviceToken(data: RegisterDeviceTokenRequest) {
  return http.post<UserDeviceToken>("/notifications/devices/", data);
}

function updateDeviceToken(tokenId: number, data: UpdateDeviceTokenRequest) {
  return http.put<UserDeviceToken>(`/notifications/devices/${tokenId}`, data);
}

function deleteDeviceToken(tokenId: number) {
  return http.delete(`/notifications/devices/${tokenId}`);
}

function deactivateDeviceToken(tokenId: number) {
  return http.patch<UserDeviceToken>(
    `/notifications/devices/${tokenId}/deactivate`
  );
}

// ===========================
//    IN-APP NOTIFICATIONS
// ===========================

function getUnreadCount() {
  return http.get<{ count: number }>("/notifications/unread-count");
}

function markAsRead(id: number) {
  return http.patch<TodoNotification>(`/notifications/${id}/read`);
}

function markAllAsRead() {
  return http.patch<{ success: boolean }>("/notifications/mark-all-read");
}

// ===========================
//    EXPORT SERVICE
// ===========================

const NotificationService = {
  // Notifications
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  getUpcomingNotifications,
  getNotificationsByTodo,
  markNotificationSent,

  // Device Tokens
  getDeviceTokens,
  registerDeviceToken,
  updateDeviceToken,
  deleteDeviceToken,
  deactivateDeviceToken,

  // In-App Notifications
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};

export default NotificationService;
