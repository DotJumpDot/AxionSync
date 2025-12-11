// stores/notificationStore.ts
import { create } from "zustand";
import notificationService from "@/Service/notification";
import type {
  TodoNotification,
  UserDeviceToken,
  UpcomingNotification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  RegisterDeviceTokenRequest,
  UpdateDeviceTokenRequest,
  NotificationChannel,
} from "@/Types/Notification";

type NotificationStore = {
  notifications: TodoNotification[];
  upcomingNotifications: UpcomingNotification[];
  deviceTokens: UserDeviceToken[];
  loading: boolean;
  unreadCount: number;
  selectedNotification: TodoNotification | null;
  filterChannel: NotificationChannel | null;

  // Notification Actions
  getNotifications: (params?: {
    todo_id?: number;
    channel?: NotificationChannel | null;
    is_sent?: boolean;
  }) => Promise<{ success: boolean; message?: string }>;
  getNotification: (id: number) => Promise<{
    success: boolean;
    message?: string;
    notification?: TodoNotification;
  }>;
  createNotification: (data: CreateNotificationRequest) => Promise<{
    success: boolean;
    message?: string;
    notification?: TodoNotification;
  }>;
  updateNotification: (
    id: number,
    data: UpdateNotificationRequest
  ) => Promise<{
    success: boolean;
    message?: string;
    notification?: TodoNotification;
  }>;
  deleteNotification: (
    id: number
  ) => Promise<{ success: boolean; message?: string }>;
  getUpcomingNotifications: (
    hours?: number
  ) => Promise<{ success: boolean; message?: string }>;
  getNotificationsByTodo: (
    todoId: number
  ) => Promise<{ success: boolean; message?: string }>;

  // Device Token Actions
  getDeviceTokens: () => Promise<{ success: boolean; message?: string }>;
  registerDeviceToken: (data: RegisterDeviceTokenRequest) => Promise<{
    success: boolean;
    message?: string;
    deviceToken?: UserDeviceToken;
  }>;
  updateDeviceToken: (
    tokenId: number,
    data: UpdateDeviceTokenRequest
  ) => Promise<{
    success: boolean;
    message?: string;
    deviceToken?: UserDeviceToken;
  }>;
  deleteDeviceToken: (
    tokenId: number
  ) => Promise<{ success: boolean; message?: string }>;
  deactivateDeviceToken: (tokenId: number) => Promise<{
    success: boolean;
    message?: string;
    deviceToken?: UserDeviceToken;
  }>;

  // In-App Notification Actions
  getUnreadCount: () => Promise<{ success: boolean; message?: string }>;
  markAsRead: (id: number) => Promise<{
    success: boolean;
    message?: string;
    notification?: TodoNotification;
  }>;
  markAllAsRead: () => Promise<{ success: boolean; message?: string }>;

  // UI State Setters
  setSelectedNotification: (notification: TodoNotification | null) => void;
  setFilterChannel: (channel: NotificationChannel | null) => void;
  clearFilters: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  upcomingNotifications: [],
  deviceTokens: [],
  loading: false,
  unreadCount: 0,
  selectedNotification: null,
  filterChannel: null,

  // ===========================
  //    NOTIFICATIONS
  // ===========================

  // 🔹 Get all notifications
  getNotifications: async (params) => {
    set({ loading: true });
    try {
      const queryParams: Record<string, string | boolean | number> = {};
      if (params?.todo_id) queryParams.todo_id = params.todo_id;
      if (params?.channel) queryParams.channel = params.channel;
      if (params?.is_sent !== undefined) queryParams.is_sent = params.is_sent;

      const res = await notificationService.getNotifications(queryParams);
      set({ notifications: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
      set({ loading: false });
      return { success: false, message: "Failed to get notifications" };
    }
  },

  // 🔹 Get a single notification
  getNotification: async (id: number) => {
    try {
      const res = await notificationService.getNotification(id);
      const notification = res.data;
      set({ selectedNotification: notification });
      return { success: true, notification };
    } catch (e) {
      console.error("Failed to fetch notification:", e);
      return { success: false, message: "Failed to get notification" };
    }
  },

  // 🔹 Create a notification
  createNotification: async (data: CreateNotificationRequest) => {
    try {
      const res = await notificationService.createNotification(data);
      const newNotification = res.data;

      set((state) => ({
        notifications: [newNotification, ...state.notifications],
      }));

      return { success: true, notification: newNotification };
    } catch (e) {
      console.error("Failed to create notification:", e);
      return { success: false, message: "Failed to create notification" };
    }
  },

  // 🔹 Update a notification
  updateNotification: async (id: number, data: UpdateNotificationRequest) => {
    try {
      const res = await notificationService.updateNotification(id, data);
      const updatedNotification = res.data;

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? updatedNotification : n
        ),
        selectedNotification:
          state.selectedNotification?.id === id
            ? updatedNotification
            : state.selectedNotification,
      }));

      return { success: true, notification: updatedNotification };
    } catch (e) {
      console.error("Failed to update notification:", e);
      return { success: false, message: "Failed to update notification" };
    }
  },

  // 🔹 Delete a notification
  deleteNotification: async (id: number) => {
    try {
      await notificationService.deleteNotification(id);

      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        selectedNotification:
          state.selectedNotification?.id === id
            ? null
            : state.selectedNotification,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to delete notification:", e);
      return { success: false, message: "Failed to delete notification" };
    }
  },

  // 🔹 Get upcoming notifications
  getUpcomingNotifications: async (hours?: number) => {
    set({ loading: true });
    try {
      const res = await notificationService.getUpcomingNotifications(hours);
      set({ upcomingNotifications: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch upcoming notifications:", e);
      set({ loading: false });
      return {
        success: false,
        message: "Failed to get upcoming notifications",
      };
    }
  },

  // 🔹 Get notifications by todo
  getNotificationsByTodo: async (todoId: number) => {
    set({ loading: true });
    try {
      const res = await notificationService.getNotificationsByTodo(todoId);
      set({ notifications: res.data, loading: false });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch notifications by todo:", e);
      set({ loading: false });
      return { success: false, message: "Failed to get notifications" };
    }
  },

  // ===========================
  //    DEVICE TOKENS
  // ===========================

  // 🔹 Get device tokens
  getDeviceTokens: async () => {
    try {
      const res = await notificationService.getDeviceTokens();
      set({ deviceTokens: res.data });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch device tokens:", e);
      return { success: false, message: "Failed to get device tokens" };
    }
  },

  // 🔹 Register device token
  registerDeviceToken: async (data: RegisterDeviceTokenRequest) => {
    try {
      const res = await notificationService.registerDeviceToken(data);
      const newToken = res.data;

      set((state) => ({
        deviceTokens: [...state.deviceTokens, newToken],
      }));

      return { success: true, deviceToken: newToken };
    } catch (e) {
      console.error("Failed to register device token:", e);
      return { success: false, message: "Failed to register device" };
    }
  },

  // 🔹 Update device token
  updateDeviceToken: async (
    tokenId: number,
    data: UpdateDeviceTokenRequest
  ) => {
    try {
      const res = await notificationService.updateDeviceToken(tokenId, data);
      const updatedToken = res.data;

      set((state) => ({
        deviceTokens: state.deviceTokens.map((t) =>
          t.id === tokenId ? updatedToken : t
        ),
      }));

      return { success: true, deviceToken: updatedToken };
    } catch (e) {
      console.error("Failed to update device token:", e);
      return { success: false, message: "Failed to update device" };
    }
  },

  // 🔹 Delete device token
  deleteDeviceToken: async (tokenId: number) => {
    try {
      await notificationService.deleteDeviceToken(tokenId);

      set((state) => ({
        deviceTokens: state.deviceTokens.filter((t) => t.id !== tokenId),
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to delete device token:", e);
      return { success: false, message: "Failed to delete device" };
    }
  },

  // 🔹 Deactivate device token
  deactivateDeviceToken: async (tokenId: number) => {
    try {
      const res = await notificationService.deactivateDeviceToken(tokenId);
      const updatedToken = res.data;

      set((state) => ({
        deviceTokens: state.deviceTokens.map((t) =>
          t.id === tokenId ? updatedToken : t
        ),
      }));

      return { success: true, deviceToken: updatedToken };
    } catch (e) {
      console.error("Failed to deactivate device token:", e);
      return { success: false, message: "Failed to deactivate device" };
    }
  },

  // ===========================
  //    IN-APP NOTIFICATIONS
  // ===========================

  // 🔹 Get unread count
  getUnreadCount: async () => {
    try {
      const res = await notificationService.getUnreadCount();
      set({ unreadCount: res.data.count });
      return { success: true };
    } catch (e) {
      console.error("Failed to fetch unread count:", e);
      return { success: false, message: "Failed to get unread count" };
    }
  },

  // 🔹 Mark notification as read
  markAsRead: async (id: number) => {
    try {
      const res = await notificationService.markAsRead(id);
      const updatedNotification = res.data;

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? updatedNotification : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));

      return { success: true, notification: updatedNotification };
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
      return { success: false, message: "Failed to mark as read" };
    }
  },

  // 🔹 Mark all as read
  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_sent: true,
        })),
        unreadCount: 0,
      }));

      return { success: true };
    } catch (e) {
      console.error("Failed to mark all as read:", e);
      return { success: false, message: "Failed to mark all as read" };
    }
  },

  // ===========================
  //    UI STATE SETTERS
  // ===========================

  setSelectedNotification: (notification) =>
    set({ selectedNotification: notification }),
  setFilterChannel: (channel) => set({ filterChannel: channel }),
  clearFilters: () =>
    set({
      filterChannel: null,
    }),
}));
