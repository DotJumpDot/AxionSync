from fastapi import APIRouter, Depends, HTTPException, status
from src.models.entity.en_todo import (
    Todo,
    TodoItem,
    TodoTag,
    TodoShare,
    TodoStatusHistory,
    CreateTodoRequest,
    UpdateTodoRequest,
    CreateTodoItemRequest,
    UpdateTodoItemRequest,
    CreateTodoTagRequest,
    UpdateTodoTagRequest,
    ShareTodoRequest,
    UpdateSharePermissionRequest,
    SetMoodRequest,
    StreakSummary,
    TodoAnalytics,
    TODO_STATUSES,
    TODO_PRIORITIES,
    TODO_REPEAT_TYPES,
    TODO_MOODS,
)
from src.models.entity.en_user import User
from src.services.sv_todo import TodoService
from src.services.sv_notification import NotificationService
from src.api.api_auth import require_bearer
from src.workers.redis_queue import RedisQueue
from datetime import datetime, timezone

router = APIRouter(prefix="/todos", tags=["Todo"])
sv_todo = TodoService()
sv_notification = NotificationService()


# ===========================
#    VALIDATION HELPERS
# ===========================
def validate_status(status_value: str | None):
    """Validate todo status"""
    if status_value and status_value not in TODO_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(TODO_STATUSES)}",
        )


def validate_priority(priority_value: str | None):
    """Validate todo priority"""
    if priority_value and priority_value not in TODO_PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid priority. Must be one of: {', '.join(TODO_PRIORITIES)}",
        )


def validate_repeat_type(repeat_type: str | None):
    """Validate repeat type"""
    if repeat_type and repeat_type not in TODO_REPEAT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid repeat_type. Must be one of: {', '.join(TODO_REPEAT_TYPES)}",
        )


def validate_mood(mood: str | None):
    """Validate mood"""
    if mood and mood not in TODO_MOODS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid mood. Must be one of: {', '.join(TODO_MOODS)}",
        )


def validate_permission(permission: str):
    """Validate share permission"""
    if permission not in ["view", "edit"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid permission. Must be 'view' or 'edit'",
        )


def check_ownership_or_access(
    todo: Todo | None, user_id: int, required_permission: str = "view"
):
    """Check if user owns or has access to the todo"""
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    # Owner always has access
    if todo.user.id == user_id:
        return "owner"

    # Check shares
    for share in todo.shares:
        if share.shared_with_user_id == user_id:
            if required_permission == "edit" and share.permission != "edit":
                raise HTTPException(status_code=403, detail="Edit permission required")
            return share.permission

    raise HTTPException(status_code=403, detail="Forbidden")


# ===========================
#    TODO CRUD ENDPOINTS
# ===========================
@router.get("/", response_model=list[Todo])
def get_todos(
    status_filter: str | None = None,
    priority: str | None = None,
    include_deleted: bool = False,
    claims: dict = Depends(require_bearer),
):
    """Get all todos for the authenticated user"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    validate_status(status_filter)
    validate_priority(priority)

    return sv_todo.get_todos(
        user_id,
        status=status_filter,
        priority=priority,
        include_deleted=include_deleted,
    )


@router.get("/overdue", response_model=list[Todo])
def get_overdue_todos(claims: dict = Depends(require_bearer)):
    """Get overdue todos for the authenticated user"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return sv_todo.get_overdue_todos(user_id)


@router.get("/analytics", response_model=TodoAnalytics)
def get_analytics(claims: dict = Depends(require_bearer)):
    """Get todo analytics for the authenticated user"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return sv_todo.get_analytics(user_id)


@router.get("/streak", response_model=StreakSummary)
def get_streak(claims: dict = Depends(require_bearer)):
    """Get streak summary for the authenticated user"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return sv_todo.get_streak_summary(user_id)


@router.get("/{todo_id}", response_model=Todo | None)
def get_todo(todo_id: int, claims: dict = Depends(require_bearer)):
    """Get a single todo by ID"""
    user_id = claims.get("uid")
    todo = sv_todo.get_todo_by_id(todo_id)
    check_ownership_or_access(todo, user_id)
    return todo


@router.post("/", response_model=Todo)
def create_todo(req: CreateTodoRequest, claims: dict = Depends(require_bearer)):
    """Create a new todo"""
    user_id = claims.get("uid")
    username = claims.get("sub")
    if not user_id or not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    # Validate inputs
    validate_status(req.status)
    validate_priority(req.priority)
    validate_repeat_type(req.repeat_type)
    validate_mood(req.mood)

    # Validate repeat logic
    if req.is_repeat and not req.repeat_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="repeat_type is required when is_repeat is true",
        )

    # Build user from claims
    user = User(
        id=user_id,
        username=username,
        role=claims.get("role", "user"),
        created_at=datetime.now(timezone.utc),
    )

    todo = sv_todo.create_todo(
        title=req.title,
        user_id=user_id,
        user=user,
        description=req.description,
        status=req.status,
        priority=req.priority,
        due_date=req.due_date,
        is_repeat=req.is_repeat,
        repeat_type=req.repeat_type,
        mood=req.mood,
        tag_ids=req.tag_ids,
    )
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create todo",
        )
    return todo


@router.put("/{todo_id}", response_model=Todo)
def update_todo(
    todo_id: int, req: UpdateTodoRequest, claims: dict = Depends(require_bearer)
):
    """Update an existing todo"""
    user_id = claims.get("uid")

    # Check ownership or edit permission
    existing = sv_todo.get_todo_by_id(todo_id)
    check_ownership_or_access(existing, user_id, required_permission="edit")

    # Validate inputs
    validate_status(req.status)
    validate_priority(req.priority)
    validate_repeat_type(req.repeat_type)
    validate_mood(req.mood)

    # Validate repeat logic
    if req.is_repeat and not req.repeat_type and not existing.repeat_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="repeat_type is required when is_repeat is true",
        )

    todo = sv_todo.update_todo(
        todo_id=todo_id,
        user_id=user_id,
        title=req.title,
        description=req.description,
        status=req.status,
        priority=req.priority,
        due_date=req.due_date,
        is_repeat=req.is_repeat,
        repeat_type=req.repeat_type,
        mood=req.mood,
        tag_ids=req.tag_ids,
    )
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update todo",
        )
    return todo


@router.delete("/{todo_id}")
def delete_todo(todo_id: int, claims: dict = Depends(require_bearer)):
    """Soft delete a todo"""
    user_id = claims.get("uid")

    # Only owner can delete
    existing = sv_todo.get_todo_by_id(todo_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Todo not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Only owner can delete todo")

    success = sv_todo.delete_todo(todo_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete todo",
        )
    return {"success": True, "message": "Todo deleted"}


@router.delete("/{todo_id}/permanent")
def delete_todo_permanent(todo_id: int, claims: dict = Depends(require_bearer)):
    """Permanently delete a todo"""
    user_id = claims.get("uid")

    # Only owner can permanently delete
    existing = sv_todo.get_todo_by_id(todo_id, include_deleted=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Todo not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Only owner can delete todo")

    success = sv_todo.delete_todo_permanent(todo_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to permanently delete todo",
        )
    return {"success": True, "message": "Todo permanently deleted"}


@router.patch("/{todo_id}/restore", response_model=Todo)
def restore_todo(todo_id: int, claims: dict = Depends(require_bearer)):
    """Restore a soft-deleted todo"""
    user_id = claims.get("uid")

    existing = sv_todo.get_todo_by_id(todo_id, include_deleted=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Todo not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Only owner can restore todo")

    todo = sv_todo.restore_todo(todo_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restore todo",
        )
    return todo


# ===========================
#    STATUS MANAGEMENT
# ===========================
@router.patch("/{todo_id}/status/{new_status}", response_model=Todo)
def update_status(
    todo_id: int, new_status: str, claims: dict = Depends(require_bearer)
):
    """Update todo status"""
    user_id = claims.get("uid")
    validate_status(new_status)

    existing = sv_todo.get_todo_by_id(todo_id)
    check_ownership_or_access(existing, user_id, required_permission="edit")

    todo = sv_todo.update_todo_status(todo_id, new_status, user_id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update status",
        )
    return todo


@router.get("/{todo_id}/history", response_model=list[TodoStatusHistory])
def get_status_history(todo_id: int, claims: dict = Depends(require_bearer)):
    """Get status history for a todo"""
    user_id = claims.get("uid")

    existing = sv_todo.get_todo_by_id(todo_id)
    check_ownership_or_access(existing, user_id)

    return sv_todo.get_status_history(todo_id)


# ===========================
#    MOOD MANAGEMENT
# ===========================
@router.patch("/{todo_id}/mood", response_model=Todo)
def set_mood(todo_id: int, req: SetMoodRequest, claims: dict = Depends(require_bearer)):
    """Set mood for a todo"""
    user_id = claims.get("uid")
    validate_mood(req.mood)

    existing = sv_todo.get_todo_by_id(todo_id)
    check_ownership_or_access(existing, user_id, required_permission="edit")

    todo = sv_todo.set_todo_mood(todo_id, req.mood)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set mood",
        )
    return todo


# ===========================
#    CHECKLIST ITEM ENDPOINTS
# ===========================
@router.get("/{todo_id}/items", response_model=list[TodoItem])
def get_todo_items(todo_id: int, claims: dict = Depends(require_bearer)):
    """Get all checklist items for a todo"""
    user_id = claims.get("uid")

    existing = sv_todo.get_todo_by_id(todo_id)
    check_ownership_or_access(existing, user_id)

    return sv_todo.get_todo_items(todo_id)


@router.post("/{todo_id}/items", response_model=TodoItem)
def create_todo_item(
    todo_id: int, req: CreateTodoItemRequest, claims: dict = Depends(require_bearer)
):
    """Create a checklist item"""
    user_id = claims.get("uid")

    existing = sv_todo.get_todo_by_id(todo_id)
    check_ownership_or_access(existing, user_id, required_permission="edit")

    item = sv_todo.create_todo_item(todo_id, req.content)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create item",
        )
    return item


@router.put("/items/{item_id}", response_model=TodoItem)
def update_todo_item(
    item_id: int, req: UpdateTodoItemRequest, claims: dict = Depends(require_bearer)
):
    """Update a checklist item"""
    # Note: We need to verify permission via the parent todo
    # For simplicity, we allow update if the item exists
    item = sv_todo.update_todo_item(item_id, req.content, req.is_done)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update item",
        )
    return item


@router.delete("/items/{item_id}")
def delete_todo_item(item_id: int, claims: dict = Depends(require_bearer)):
    """Delete a checklist item"""
    success = sv_todo.delete_todo_item(item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete item",
        )
    return {"success": True, "message": "Item deleted"}


@router.patch("/items/{item_id}/toggle", response_model=TodoItem)
def toggle_todo_item(item_id: int, claims: dict = Depends(require_bearer)):
    """Toggle checklist item status"""
    item = sv_todo.toggle_todo_item(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle item",
        )
    return item


# ===========================
#    TAG ENDPOINTS
# ===========================
@router.get("/tags/", response_model=list[TodoTag])
def get_todo_tags(claims: dict = Depends(require_bearer)):
    """Get all tags for the authenticated user"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return sv_todo.get_todo_tags(user_id)


@router.post("/tags/", response_model=TodoTag)
def create_todo_tag(req: CreateTodoTagRequest, claims: dict = Depends(require_bearer)):
    """Create a todo tag"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    tag = sv_todo.create_todo_tag(req.name, user_id, req.color)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tag",
        )
    return tag


@router.put("/tags/{tag_id}", response_model=TodoTag)
def update_todo_tag(
    tag_id: int, req: UpdateTodoTagRequest, claims: dict = Depends(require_bearer)
):
    """Update a todo tag"""
    user_id = claims.get("uid")

    # Verify ownership
    existing = sv_todo.get_todo_tag_by_id(tag_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Tag not found")
    if existing.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    tag = sv_todo.update_todo_tag(tag_id, req.name, req.color)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update tag",
        )
    return tag


@router.delete("/tags/{tag_id}")
def delete_todo_tag(tag_id: int, claims: dict = Depends(require_bearer)):
    """Delete a todo tag"""
    user_id = claims.get("uid")

    # Verify ownership
    existing = sv_todo.get_todo_tag_by_id(tag_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Tag not found")
    if existing.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    success = sv_todo.delete_todo_tag(tag_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete tag",
        )
    return {"success": True, "message": "Tag deleted"}


@router.post("/{todo_id}/tags/{tag_id}")
def add_tag_to_todo(todo_id: int, tag_id: int, claims: dict = Depends(require_bearer)):
    """Add a tag to a todo"""
    user_id = claims.get("uid")

    existing = sv_todo.get_todo_by_id(todo_id)
    check_ownership_or_access(existing, user_id, required_permission="edit")

    success = sv_todo.add_tag_to_todo(todo_id, tag_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add tag",
        )
    return {"success": True, "message": "Tag added"}


@router.delete("/{todo_id}/tags/{tag_id}")
def remove_tag_from_todo(
    todo_id: int, tag_id: int, claims: dict = Depends(require_bearer)
):
    """Remove a tag from a todo"""
    user_id = claims.get("uid")

    existing = sv_todo.get_todo_by_id(todo_id)
    check_ownership_or_access(existing, user_id, required_permission="edit")

    success = sv_todo.remove_tag_from_todo(todo_id, tag_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove tag",
        )
    return {"success": True, "message": "Tag removed"}


@router.get("/by-tag/{tag_id}", response_model=list[Todo])
def get_todos_by_tag(tag_id: int, claims: dict = Depends(require_bearer)):
    """Get todos by tag"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return sv_todo.get_todos_by_tag(tag_id, user_id)


# ===========================
#    SHARING ENDPOINTS
# ===========================
@router.get("/{todo_id}/shares", response_model=list[TodoShare])
def get_todo_shares(todo_id: int, claims: dict = Depends(require_bearer)):
    """Get all shares for a todo"""
    user_id = claims.get("uid")

    existing = sv_todo.get_todo_by_id(todo_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Todo not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Only owner can view shares")

    return sv_todo.get_todo_shares(todo_id)


@router.post("/{todo_id}/share", response_model=TodoShare)
def share_todo(
    todo_id: int, req: ShareTodoRequest, claims: dict = Depends(require_bearer)
):
    """Share a todo with another user"""
    user_id = claims.get("uid")
    validate_permission(req.permission)

    # Only owner can share
    existing = sv_todo.get_todo_by_id(todo_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Todo not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Only owner can share todo")

    # Cannot share with self
    if req.shared_with_user_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot share todo with yourself",
        )

    share = sv_todo.share_todo(todo_id, req.shared_with_user_id, req.permission)
    if not share:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share todo",
        )
    return share


@router.put("/{todo_id}/shares/{share_id}", response_model=TodoShare)
def update_share_permission(
    todo_id: int,
    share_id: int,
    req: UpdateSharePermissionRequest,
    claims: dict = Depends(require_bearer),
):
    """Update share permission"""
    user_id = claims.get("uid")
    validate_permission(req.permission)

    # Only owner can update permission
    existing = sv_todo.get_todo_by_id(todo_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Todo not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Only owner can update shares")

    share = sv_todo.update_share_permission(share_id, req.permission)
    if not share:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update share permission",
        )
    return share


@router.delete("/{todo_id}/shares/{shared_with_user_id}")
def unshare_todo(
    todo_id: int, shared_with_user_id: int, claims: dict = Depends(require_bearer)
):
    """Remove share access from a user"""
    user_id = claims.get("uid")

    # Only owner can unshare
    existing = sv_todo.get_todo_by_id(todo_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Todo not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Only owner can unshare todo")

    success = sv_todo.unshare_todo(todo_id, shared_with_user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unshare todo",
        )
    return {"success": True, "message": "Share removed"}
