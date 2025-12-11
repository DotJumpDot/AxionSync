from fastapi import APIRouter, Depends, HTTPException, status
from src.models.entity.en_notification import (
    TodoNotification,
    UserDeviceToken,
    UpcomingNotification,
    CreateNotificationRequest,
    UpdateNotificationRequest,
    RegisterDeviceTokenRequest,
    UpdateDeviceTokenRequest,
    NOTIFICATION_CHANNELS,
    DEVICE_PLATFORMS,
)
from src.models.entity.en_user import User
from src.services.sv_notification import NotificationService
from src.services.sv_todo import TodoService
from src.api.api_auth import require_bearer
from src.workers.redis_queue import RedisQueue
from datetime import datetime, timezone

router = APIRouter(prefix="/notifications", tags=["Notification"])
sv_notification = NotificationService()
sv_todo = TodoService()


# ===========================
#    VALIDATION HELPERS
# ===========================
def validate_channel(channel: str | None):
    """Validate notification channel"""
    if channel and channel not in NOTIFICATION_CHANNELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid channel. Must be one of: {', '.join(NOTIFICATION_CHANNELS)}",
        )


def validate_platform(platform: str):
    """Validate device platform"""
    if platform not in DEVICE_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid platform. Must be one of: {', '.join(DEVICE_PLATFORMS)}",
        )


# ===========================
#    NOTIFICATION ENDPOINTS
# ===========================
@router.get("/", response_model=list[TodoNotification])
def get_notifications(
    include_sent: bool = False, claims: dict = Depends(require_bearer)
):
    """Get all notifications for the authenticated user"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return sv_notification.get_notifications(user_id, include_sent)


@router.get("/upcoming", response_model=list[UpcomingNotification])
def get_upcoming_notifications(hours: int = 24, claims: dict = Depends(require_bearer)):
    """Get upcoming notifications within the next N hours"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return sv_notification.get_upcoming_notifications(user_id, hours)


@router.get("/{notification_id}", response_model=TodoNotification | None)
def get_notification(notification_id: int, claims: dict = Depends(require_bearer)):
    """Get a single notification by ID"""
    user_id = claims.get("uid")

    notification = sv_notification.get_notification_by_id(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    return notification


@router.get("/todo/{todo_id}", response_model=list[TodoNotification])
def get_notifications_for_todo(todo_id: int, claims: dict = Depends(require_bearer)):
    """Get all notifications for a todo"""
    user_id = claims.get("uid")

    # Verify user has access to the todo
    todo = sv_todo.get_todo_by_id(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    has_access, _ = sv_todo.check_todo_access(todo_id, user_id)
    if not has_access:
        raise HTTPException(status_code=403, detail="Forbidden")

    return sv_notification.get_notifications_for_todo(todo_id)


@router.post("/", response_model=TodoNotification)
def create_notification(
    req: CreateNotificationRequest, claims: dict = Depends(require_bearer)
):
    """Create a new notification and schedule it in Redis"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    validate_channel(req.channel)

    # Verify user has access to the todo
    todo = sv_todo.get_todo_by_id(req.todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    has_access, _ = sv_todo.check_todo_access(req.todo_id, user_id)
    if not has_access:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Validate notify_time is in the future
    if req.notify_time <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="notify_time must be in the future",
        )

    notification = sv_notification.create_notification(
        todo_id=req.todo_id,
        user_id=user_id,
        notify_time=req.notify_time,
        channel=req.channel,
        message=req.message,
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification",
        )

    # Schedule notification in Redis queue
    try:
        redis_queue = RedisQueue()
        payload = sv_notification.create_notification_job_payload(notification)
        delay_seconds = (req.notify_time - datetime.now(timezone.utc)).total_seconds()
        redis_queue.schedule_notification(payload, int(delay_seconds))
    except Exception as e:
        # Log error but don't fail the request
        print(f"Warning: Failed to schedule notification in Redis: {e}")

    return notification


@router.put("/{notification_id}", response_model=TodoNotification)
def update_notification(
    notification_id: int,
    req: UpdateNotificationRequest,
    claims: dict = Depends(require_bearer),
):
    """Update a notification"""
    user_id = claims.get("uid")
    validate_channel(req.channel)

    # Check ownership
    existing = sv_notification.get_notification_by_id(notification_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Notification not found")
    if existing.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if existing.is_sent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a sent notification",
        )

    # Validate notify_time if provided
    if req.notify_time and req.notify_time <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="notify_time must be in the future",
        )

    notification = sv_notification.update_notification(
        notification_id=notification_id,
        notify_time=req.notify_time,
        channel=req.channel,
        message=req.message,
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification",
        )

    # Reschedule in Redis if notify_time changed
    if req.notify_time:
        try:
            redis_queue = RedisQueue()
            redis_queue.cancel_notification(notification_id)
            payload = sv_notification.create_notification_job_payload(notification)
            delay_seconds = (
                req.notify_time - datetime.now(timezone.utc)
            ).total_seconds()
            redis_queue.schedule_notification(payload, int(delay_seconds))
        except Exception as e:
            print(f"Warning: Failed to reschedule notification in Redis: {e}")

    return notification


@router.delete("/{notification_id}")
def delete_notification(notification_id: int, claims: dict = Depends(require_bearer)):
    """Delete a notification"""
    user_id = claims.get("uid")

    # Check ownership
    existing = sv_notification.get_notification_by_id(notification_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Notification not found")
    if existing.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Cancel Redis job
    try:
        redis_queue = RedisQueue()
        redis_queue.cancel_notification(notification_id)
    except Exception as e:
        print(f"Warning: Failed to cancel notification in Redis: {e}")

    success = sv_notification.delete_notification(notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification",
        )
    return {"success": True, "message": "Notification deleted"}


# ===========================
#    DEVICE TOKEN ENDPOINTS
# ===========================
@router.get("/devices/", response_model=list[UserDeviceToken])
def get_device_tokens(active_only: bool = True, claims: dict = Depends(require_bearer)):
    """Get device tokens for the authenticated user"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return sv_notification.get_device_tokens(user_id, active_only)


@router.post("/devices/register", response_model=UserDeviceToken)
def register_device_token(
    req: RegisterDeviceTokenRequest, claims: dict = Depends(require_bearer)
):
    """Register a device token for push notifications"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    validate_platform(req.platform)

    token = sv_notification.register_device_token(
        user_id=user_id,
        device_token=req.device_token,
        platform=req.platform,
    )
    if not token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register device token",
        )
    return token


@router.put("/devices/{token_id}", response_model=UserDeviceToken)
def update_device_token(
    token_id: int,
    req: UpdateDeviceTokenRequest,
    claims: dict = Depends(require_bearer),
):
    """Update a device token"""
    user_id = claims.get("uid")

    # Note: Ownership verification should be done at service level
    token = sv_notification.update_device_token(
        token_id=token_id,
        device_token=req.device_token,
        is_active=req.is_active,
    )
    if not token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update device token",
        )
    return token


@router.delete("/devices/{token_id}")
def delete_device_token(token_id: int, claims: dict = Depends(require_bearer)):
    """Delete a device token"""
    success = sv_notification.delete_device_token(token_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete device token",
        )
    return {"success": True, "message": "Device token deleted"}


@router.post("/devices/deactivate")
def deactivate_device_token_endpoint(
    device_token: str, claims: dict = Depends(require_bearer)
):
    """Deactivate a device token by token string"""
    success = sv_notification.deactivate_device_token(device_token)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate device token",
        )
    return {"success": True, "message": "Device token deactivated"}
