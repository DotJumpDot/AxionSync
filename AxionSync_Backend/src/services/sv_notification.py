from src.sql_query.sql_notification import SQLNotification
from src.models.entity.en_notification import (
    TodoNotification,
    UserDeviceToken,
    UpcomingNotification,
    NotificationJobPayload,
    NOTIFICATION_CHANNELS,
    DEVICE_PLATFORMS,
)
from src.models.entity.en_user import User
from datetime import datetime, timezone
import json


class NotificationService:
    def __init__(self):
        self.sqlNotification = SQLNotification()

    # ===========================
    #    HELPER: ROW TO MODEL
    # ===========================
    def _row_to_notification(self, row) -> TodoNotification:
        """Convert row data to TodoNotification model"""
        user = User(
            id=row[9],
            username=row[10],
            firstname=row[11],
            lastname=row[12],
            nickname=row[13],
            role=row[14],
            tel=row[15],
            created_at=row[16],
            picture_url=row[17] or "unidentified.jpg",
        )
        return TodoNotification(
            id=row[0],
            todo_id=row[1],
            user_id=row[2],
            notify_time=row[3],
            is_sent=row[4],
            channel=row[5],
            message=row[6],
            created_at=row[7],
            user=user,
        )

    def _row_to_device_token(self, row) -> UserDeviceToken:
        """Convert row data to UserDeviceToken model"""
        return UserDeviceToken(
            id=row[0],
            user_id=row[1],
            device_token=row[2],
            platform=row[3],
            is_active=row[4],
            created_at=row[5],
            updated_at=row[6],
        )

    def _row_to_upcoming_notification(self, row) -> UpcomingNotification:
        """Convert row data to UpcomingNotification model"""
        return UpcomingNotification(
            id=row[0],
            todo_id=row[1],
            todo_title=row[2],
            notify_time=row[3],
            channel=row[4],
            message=row[5],
            time_until=row[6],
        )

    # ===========================
    #    NOTIFICATION CRUD
    # ===========================
    def get_notifications(
        self,
        user_id: int,
        include_sent: bool = False,
    ) -> list[TodoNotification]:
        """Get all notifications for a user"""
        rows = self.sqlNotification.get_notifications(user_id, include_sent)
        return [self._row_to_notification(row) for row in rows]

    def get_notification_by_id(self, notification_id: int) -> TodoNotification | None:
        """Get a single notification by ID"""
        row = self.sqlNotification.get_notification_by_id(notification_id)
        if not row:
            return None
        return self._row_to_notification(row)

    def get_notifications_for_todo(self, todo_id: int) -> list[TodoNotification]:
        """Get all notifications for a todo"""
        rows = self.sqlNotification.get_notifications_for_todo(todo_id)
        return [self._row_to_notification(row) for row in rows]

    def create_notification(
        self,
        todo_id: int,
        user_id: int,
        notify_time: datetime,
        channel: str = "in_app",
        message: str | None = None,
    ) -> TodoNotification | None:
        """Create a new notification"""
        row = self.sqlNotification.create_notification(
            todo_id=todo_id,
            user_id=user_id,
            notify_time=notify_time,
            channel=channel,
            message=message,
        )
        if not row:
            return None

        # Fetch full notification with user info
        return self.get_notification_by_id(row[0])

    def update_notification(
        self,
        notification_id: int,
        notify_time: datetime | None = None,
        channel: str | None = None,
        message: str | None = None,
    ) -> TodoNotification | None:
        """Update a notification"""
        row = self.sqlNotification.update_notification(
            notification_id=notification_id,
            notify_time=notify_time,
            channel=channel,
            message=message,
        )
        if not row:
            return None
        return self.get_notification_by_id(notification_id)

    def delete_notification(self, notification_id: int) -> bool:
        """Delete a notification"""
        result = self.sqlNotification.delete_notification(notification_id)
        return result is not None

    def mark_notification_sent(self, notification_id: int) -> TodoNotification | None:
        """Mark a notification as sent"""
        row = self.sqlNotification.mark_notification_sent(notification_id)
        if not row:
            return None
        return self.get_notification_by_id(notification_id)

    def get_upcoming_notifications(
        self, user_id: int, hours: int = 24
    ) -> list[UpcomingNotification]:
        """Get upcoming notifications within the next N hours"""
        rows = self.sqlNotification.get_upcoming_notifications(user_id, hours)
        return [self._row_to_upcoming_notification(row) for row in rows]

    def get_pending_notifications(
        self, before_time: datetime | None = None
    ) -> list[TodoNotification]:
        """Get pending notifications that need to be sent"""
        rows = self.sqlNotification.get_pending_notifications(before_time)
        return [self._row_to_notification(row) for row in rows]

    # ===========================
    #    DEVICE TOKEN CRUD
    # ===========================
    def get_device_tokens(
        self, user_id: int, active_only: bool = True
    ) -> list[UserDeviceToken]:
        """Get device tokens for a user"""
        rows = self.sqlNotification.get_device_tokens(user_id, active_only)
        return [self._row_to_device_token(row) for row in rows]

    def register_device_token(
        self,
        user_id: int,
        device_token: str,
        platform: str,
    ) -> UserDeviceToken | None:
        """Register a new device token"""
        row = self.sqlNotification.register_device_token(
            user_id, device_token, platform
        )
        if not row:
            return None
        return self._row_to_device_token(row)

    def update_device_token(
        self,
        token_id: int,
        device_token: str | None = None,
        is_active: bool | None = None,
    ) -> UserDeviceToken | None:
        """Update a device token"""
        row = self.sqlNotification.update_device_token(
            token_id, device_token, is_active
        )
        if not row:
            return None
        return self._row_to_device_token(row)

    def deactivate_device_token(self, device_token: str) -> bool:
        """Deactivate a device token"""
        result = self.sqlNotification.deactivate_device_token(device_token)
        return result is not None

    def delete_device_token(self, token_id: int) -> bool:
        """Delete a device token"""
        result = self.sqlNotification.delete_device_token(token_id)
        return result is not None

    # ===========================
    #    JOB PAYLOAD CREATION
    # ===========================
    def create_notification_job_payload(
        self,
        notification: TodoNotification,
        scheduled_at: datetime | None = None,
    ) -> NotificationJobPayload:
        """Create a job payload for Redis queue"""
        return NotificationJobPayload(
            notification_id=notification.id,
            todo_id=notification.todo_id,
            user_id=notification.user_id,
            channel=notification.channel,
            message=notification.message,
            scheduled_at=scheduled_at or notification.notify_time,
            retry_count=0,
            max_retries=3,
        )

    def serialize_job_payload(self, payload: NotificationJobPayload) -> str:
        """Serialize job payload to JSON string for Redis"""
        return json.dumps(
            {
                "notification_id": payload.notification_id,
                "todo_id": payload.todo_id,
                "user_id": payload.user_id,
                "channel": payload.channel,
                "message": payload.message,
                "scheduled_at": (
                    payload.scheduled_at.isoformat() if payload.scheduled_at else None
                ),
                "retry_count": payload.retry_count,
                "max_retries": payload.max_retries,
            }
        )

    def deserialize_job_payload(self, data: str) -> NotificationJobPayload:
        """Deserialize JSON string to job payload"""
        obj = json.loads(data)
        return NotificationJobPayload(
            notification_id=obj["notification_id"],
            todo_id=obj["todo_id"],
            user_id=obj["user_id"],
            channel=obj["channel"],
            message=obj.get("message"),
            scheduled_at=(
                datetime.fromisoformat(obj["scheduled_at"])
                if obj.get("scheduled_at")
                else datetime.now(timezone.utc)
            ),
            retry_count=obj.get("retry_count", 0),
            max_retries=obj.get("max_retries", 3),
        )
