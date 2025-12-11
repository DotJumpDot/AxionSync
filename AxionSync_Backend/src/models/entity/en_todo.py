from pydantic import BaseModel, Field
from typing import Any
from datetime import datetime

from src.models.entity.en_user import User

try:
    from pydantic import ConfigDict  # pydantic v2
except ImportError:  # fallback pydantic v1
    ConfigDict = None  # type: ignore


# Enum-like constants for status, priority, repeat_type, mood validation
TODO_STATUSES = ["pending", "in_progress", "completed", "cancelled"]
TODO_PRIORITIES = ["low", "medium", "high", "urgent"]
TODO_REPEAT_TYPES = ["daily", "weekly", "monthly"]
TODO_MOODS = ["motivated", "lazy", "focused", "stressed", "excited"]


class TodoItem(BaseModel):
    """
    TodoItem entity model (Sub-task / Checklist item)

    Fields:
    - id: int - Primary key, auto-incremented
    - todo_id: int - FK to todo.id
    - content: str - Checklist item content
    - is_done: bool - Whether item is completed
    - created_at: datetime - Creation timestamp
    - updated_at: datetime | None - Last update timestamp
    """

    id: int
    todo_id: int
    content: str
    is_done: bool = False
    created_at: datetime
    updated_at: datetime | None = None


class TodoTag(BaseModel):
    """
    TodoTag entity model

    Fields:
    - id: int - Primary key, auto-incremented
    - name: str - Unique tag name
    - color: str | None - Tag color in hex format (#RRGGBB)
    - user_id: int - FK to user.id (owner of the tag)
    - created_at: datetime - Creation timestamp
    """

    id: int
    name: str
    color: str | None = None
    user_id: int
    created_at: datetime


class TodoShare(BaseModel):
    """
    TodoShare entity model (Shared Todo with other users)

    Fields:
    - id: int - Primary key, auto-incremented
    - todo_id: int - FK to todo.id
    - shared_with_user_id: int - FK to user.id
    - permission: str - 'view' | 'edit'
    - shared_by_user: User - User who shared the todo
    - shared_with_user: User - User who received the share
    - created_at: datetime - Share creation timestamp
    """

    id: int
    todo_id: int
    shared_with_user_id: int
    permission: str = "view"
    shared_by_user: User | None = None
    shared_with_user: User | None = None
    created_at: datetime


class TodoStatusHistory(BaseModel):
    """
    TodoStatusHistory entity model (For Streak & Analytics)

    Fields:
    - id: int - Primary key, auto-incremented
    - todo_id: int - FK to todo.id
    - old_status: str - Previous status
    - new_status: str - New status
    - changed_by: int - FK to user.id who made the change
    - changed_by_user: User | None - User who made the change
    - changed_at: datetime - When the change was made
    """

    id: int
    todo_id: int
    old_status: str
    new_status: str
    changed_by: int
    changed_by_user: User | None = None
    changed_at: datetime


class Todo(BaseModel):
    """
    Todo entity model

    Fields:
    - id: int - Primary key, auto-incremented
    - title: str - Todo title
    - description: str | None - Detailed description
    - status: str - 'pending' | 'in_progress' | 'completed' | 'cancelled'
    - priority: str - 'low' | 'medium' | 'high' | 'urgent'
    - due_date: datetime | None - Deadline
    - completed_at: datetime | None - When todo was completed
    - is_repeat: bool - Whether todo repeats
    - repeat_type: str | None - 'daily' | 'weekly' | 'monthly'
    - mood: str | None - 'motivated' | 'lazy' | 'focused' | 'stressed' | 'excited'
    - user: User - Owner of the todo
    - items: list[TodoItem] - Checklist items
    - tags: list[TodoTag] - Associated tags
    - shares: list[TodoShare] - Share info
    - deleted_status: bool - Soft delete flag
    - created_at: datetime - Creation timestamp
    - updated_at: datetime | None - Last update timestamp
    """

    id: int
    title: str
    description: str | None = None
    status: str = "pending"
    priority: str = "medium"
    due_date: datetime | None = None
    completed_at: datetime | None = None
    is_repeat: bool = False
    repeat_type: str | None = None
    mood: str | None = None
    user: User
    items: list[TodoItem] = []
    tags: list[TodoTag] = []
    shares: list[TodoShare] = []
    deleted_status: bool = False
    created_at: datetime
    updated_at: datetime | None = None


# ===========================
#    REQUEST MODELS
# ===========================
class CreateTodoRequest(BaseModel):
    """Request model for creating a todo"""

    title: str
    description: str | None = None
    status: str = "pending"
    priority: str = "medium"
    due_date: datetime | None = None
    is_repeat: bool = False
    repeat_type: str | None = None
    mood: str | None = None
    tag_ids: list[int] | None = None


class UpdateTodoRequest(BaseModel):
    """Request model for updating a todo"""

    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    due_date: datetime | None = None
    is_repeat: bool | None = None
    repeat_type: str | None = None
    mood: str | None = None
    tag_ids: list[int] | None = None


class CreateTodoItemRequest(BaseModel):
    """Request model for creating a checklist item"""

    content: str


class UpdateTodoItemRequest(BaseModel):
    """Request model for updating a checklist item"""

    content: str | None = None
    is_done: bool | None = None


class CreateTodoTagRequest(BaseModel):
    """Request model for creating a todo tag"""

    name: str
    color: str | None = None


class UpdateTodoTagRequest(BaseModel):
    """Request model for updating a todo tag"""

    name: str | None = None
    color: str | None = None


class ShareTodoRequest(BaseModel):
    """Request model for sharing a todo"""

    shared_with_user_id: int
    permission: str = "view"  # 'view' | 'edit'


class UpdateSharePermissionRequest(BaseModel):
    """Request model for updating share permission"""

    permission: str  # 'view' | 'edit'


class SetMoodRequest(BaseModel):
    """Request model for setting todo mood"""

    mood: str  # 'motivated' | 'lazy' | 'focused' | 'stressed' | 'excited'


# ===========================
#    RESPONSE MODELS
# ===========================
class StreakSummary(BaseModel):
    """Response model for streak summary"""

    current_streak: int = 0
    longest_streak: int = 0
    total_completed: int = 0
    last_completed_date: datetime | None = None


class TodoAnalytics(BaseModel):
    """Response model for todo analytics"""

    total_todos: int = 0
    completed_todos: int = 0
    pending_todos: int = 0
    in_progress_todos: int = 0
    cancelled_todos: int = 0
    completion_rate: float = 0.0
    streak: StreakSummary = StreakSummary()
