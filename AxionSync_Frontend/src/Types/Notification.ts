import type { User } from "./User";

// Enum-like constants for validation
export const NOTIFICATION_CHANNELS = ["in_app", "email", "push"] as const;
export const DEVICE_PLATFORMS = ["ios", "android", "web"] as const;

// Derived types from constants
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
export type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];

// Color mappings for UI display
export const CHANNEL_COLORS: Record<NotificationChannel, string> = {
  in_app: "blue",
  email: "purple",
  push: "green",
};

export const CHANNEL_ICONS: Record<NotificationChannel, string> = {
  in_app: "bell",
  email: "mail",
  push: "mobile",
};

// ===========================
//    ENTITY INTERFACES
// ===========================

/**
 * TodoNotification - Notification entity
 */
export interface TodoNotification {
  id: number;
  todo_id: number;
  user_id: number;
  notify_time: string;
  is_sent: boolean;
  channel: NotificationChannel;
  message: string | null;
  user: User | null;
  created_at: string;
}

/**
 * UserDeviceToken - Device token for push notifications
 */
export interface UserDeviceToken {
  id: number;
  user_id: number;
  device_token: string;
  platform: DevicePlatform;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// ===========================
//    REQUEST INTERFACES
// ===========================

/**
 * CreateNotificationRequest - Request for creating a notification
 */
export interface CreateNotificationRequest {
  todo_id: number;
  notify_time: string;
  channel?: NotificationChannel;
  message?: string | null;
}

/**
 * UpdateNotificationRequest - Request for updating a notification
 */
export interface UpdateNotificationRequest {
  notify_time?: string | null;
  channel?: NotificationChannel | null;
  message?: string | null;
}

/**
 * RegisterDeviceTokenRequest - Request for registering device token
 */
export interface RegisterDeviceTokenRequest {
  device_token: string;
  platform: DevicePlatform;
}

/**
 * UpdateDeviceTokenRequest - Request for updating device token
 */
export interface UpdateDeviceTokenRequest {
  device_token?: string | null;
  is_active?: boolean | null;
}

// ===========================
//    RESPONSE INTERFACES
// ===========================

/**
 * NotificationJobPayload - Redis job payload (for internal use)
 */
export interface NotificationJobPayload {
  notification_id: number;
  todo_id: number;
  user_id: number;
  channel: NotificationChannel;
  message: string | null;
  scheduled_at: string;
  retry_count: number;
  max_retries: number;
}

/**
 * UpcomingNotification - Response for upcoming notifications
 */
export interface UpcomingNotification {
  id: number;
  todo_id: number;
  todo_title: string;
  notify_time: string;
  channel: NotificationChannel;
  message: string | null;
  time_until: number; // seconds until notification
}

/**
 * InAppNotificationItem - Notification item for in-app display
 */
export interface InAppNotificationItem {
  id: number;
  todo_id: number;
  todo_title: string;
  message: string | null;
  channel: NotificationChannel;
  created_at: string;
  is_read: boolean;
}

// ===========================
//    QUERY PARAMETERS
// ===========================

/**
 * NotificationQueryParams - Query parameters for fetching notifications
 */
export interface NotificationQueryParams {
  todo_id?: number;
  channel?: NotificationChannel;
  is_sent?: boolean;
  upcoming_only?: boolean;
}
