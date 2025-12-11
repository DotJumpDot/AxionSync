from pydantic import BaseModel
from datetime import datetime

from src.models.entity.en_user import User

try:
    from pydantic import ConfigDict  # pydantic v2
except ImportError:  # fallback pydantic v1
    ConfigDict = None  # type: ignore


# Enum-like constants for channel and platform validation
NOTIFICATION_CHANNELS = ["in_app", "email", "push"]
DEVICE_PLATFORMS = ["ios", "android", "web"]


class TodoNotification(BaseModel):
    """
    TodoNotification entity model

    Fields:
    - id: int - Primary key, auto-incremented
    - todo_id: int - FK to todo.id
    - user_id: int - FK to user.id
    - notify_time: datetime - When to send notification
    - is_sent: bool - Whether notification has been sent
    - channel: str - 'in_app' | 'email' | 'push'
    - message: str | None - Custom notification message
    - user: User | None - User to notify
    - created_at: datetime - Creation timestamp
    """

    id: int
    todo_id: int
    user_id: int
    notify_time: datetime
    is_sent: bool = False
    channel: str = "in_app"
    message: str | None = None
    user: User | None = None
    created_at: datetime


class UserDeviceToken(BaseModel):
    """
    UserDeviceToken entity model (For Push Notifications)

    Fields:
    - id: int - Primary key, auto-incremented
    - user_id: int - FK to user.id
    - device_token: str - Device token for push notifications
    - platform: str - 'ios' | 'android' | 'web'
    - is_active: bool - Whether device is active
    - created_at: datetime - Registration timestamp
    - updated_at: datetime | None - Last update timestamp
    """

    id: int
    user_id: int
    device_token: str
    platform: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime | None = None


# ===========================
#    REQUEST MODELS
# ===========================
class CreateNotificationRequest(BaseModel):
    """Request model for creating a notification"""

    todo_id: int
    notify_time: datetime
    channel: str = "in_app"  # 'in_app' | 'email' | 'push'
    message: str | None = None


class UpdateNotificationRequest(BaseModel):
    """Request model for updating a notification"""

    notify_time: datetime | None = None
    channel: str | None = None
    message: str | None = None


class RegisterDeviceTokenRequest(BaseModel):
    """Request model for registering device token"""

    device_token: str
    platform: str  # 'ios' | 'android' | 'web'


class UpdateDeviceTokenRequest(BaseModel):
    """Request model for updating device token"""

    device_token: str | None = None
    is_active: bool | None = None


# ===========================
#    RESPONSE MODELS
# ===========================
class NotificationJobPayload(BaseModel):
    """Redis job payload for notification processing"""

    notification_id: int
    todo_id: int
    user_id: int
    channel: str
    message: str | None = None
    scheduled_at: datetime
    retry_count: int = 0
    max_retries: int = 3


class UpcomingNotification(BaseModel):
    """Response model for upcoming notifications"""

    id: int
    todo_id: int
    todo_title: str
    notify_time: datetime
    channel: str
    message: str | None = None
    time_until: int  # seconds until notification
