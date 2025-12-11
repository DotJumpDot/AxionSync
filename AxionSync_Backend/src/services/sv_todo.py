from src.sql_query.sql_todo import SQLTodo
from src.models.entity.en_todo import (
    Todo,
    TodoItem,
    TodoTag,
    TodoShare,
    TodoStatusHistory,
    StreakSummary,
    TodoAnalytics,
    TODO_STATUSES,
    TODO_PRIORITIES,
    TODO_REPEAT_TYPES,
    TODO_MOODS,
)
from src.models.entity.en_user import User
from datetime import datetime, date


class TodoService:
    def __init__(self):
        self.sqlTodo = SQLTodo()

    # ===========================
    #    HELPER: ROW TO MODEL
    # ===========================
    def _row_to_user(self, row, offset: int = 14) -> User:
        """Convert row data to User model (offset is where user data starts)"""
        if len(row) < offset + 9:
            print(
                f"Warning: User row has {len(row)} columns, expected at least {offset + 9}: {row}"
            )
            # Return a minimal user object with defaults
            from datetime import datetime

            return User(
                id=row[offset] if len(row) > offset else 0,
                username=row[offset + 1] if len(row) > offset + 1 else "unknown",
                firstname=row[offset + 2] if len(row) > offset + 2 else "",
                lastname=row[offset + 3] if len(row) > offset + 3 else "",
                nickname=row[offset + 4] if len(row) > offset + 4 else "",
                role=row[offset + 5] if len(row) > offset + 5 else "user",
                tel=row[offset + 6] if len(row) > offset + 6 else "",
                created_at=row[offset + 7] if len(row) > offset + 7 else datetime.now(),
                picture_url=(
                    row[offset + 8]
                    if len(row) > offset + 8 and row[offset + 8]
                    else "unidentified.jpg"
                ),
            )
        return User(
            id=row[offset],
            username=row[offset + 1],
            firstname=row[offset + 2],
            lastname=row[offset + 3],
            nickname=row[offset + 4],
            role=row[offset + 5],
            tel=row[offset + 6],
            created_at=row[offset + 7],
            picture_url=row[offset + 8] or "unidentified.jpg",
        )

    def _row_to_todo(
        self, row, items: list = [], tags: list = [], shares: list = []
    ) -> Todo:
        """Convert row data to Todo model"""
        if len(row) < 23:
            print(
                f"Warning: todo row has {len(row)} columns, expected at least 23: {row[:5] if len(row) > 5 else row}..."
            )
            return None

        user = self._row_to_user(row, offset=14)
        return Todo(
            id=row[0],
            title=row[1],
            description=row[2],
            status=row[3],
            priority=row[4],
            due_date=row[5],
            completed_at=row[6],
            is_repeat=row[7],
            repeat_type=row[8],
            mood=row[9],
            user=user,
            deleted_status=row[11],
            created_at=row[12],
            updated_at=row[13],
            items=items,
            tags=tags,
            shares=shares,
        )

    def _row_to_todo_item(self, row) -> TodoItem:
        """Convert row data to TodoItem model"""
        from datetime import datetime

        # Handle rows with different column counts
        if len(row) < 6:
            print(f"Warning: todo_item row has {len(row)} columns, expected 6: {row}")
        return TodoItem(
            id=row[0],
            todo_id=row[1],
            content=row[2],
            is_done=row[3],
            created_at=row[4] if len(row) > 4 else datetime.now(),
            updated_at=row[5] if len(row) > 5 else None,
        )

    def _row_to_todo_tag(self, row) -> TodoTag:
        """Convert row data to TodoTag model"""
        from datetime import datetime

        # SQL returns: id, name, color, user_id, created_at
        if len(row) < 5:
            print(f"Warning: todo_tag row has {len(row)} columns, expected 5: {row}")
        return TodoTag(
            id=row[0] if len(row) > 0 else 0,
            name=row[1] if len(row) > 1 else "Unknown",
            color=row[2] if len(row) > 2 else "#808080",
            user_id=row[3] if len(row) > 3 else 0,
            created_at=row[4] if len(row) > 4 else datetime.now(),
        )

    def _row_to_todo_share(self, row) -> TodoShare:
        """Convert row data to TodoShare model"""
        from datetime import datetime

        if len(row) < 14:
            print(f"Warning: todo_share row has {len(row)} columns, expected 14: {row}")
            # Return minimal share object
            return TodoShare(
                id=row[0] if len(row) > 0 else 0,
                todo_id=row[1] if len(row) > 1 else 0,
                shared_with_user_id=row[2] if len(row) > 2 else 0,
                permission=row[3] if len(row) > 3 else "view",
                created_at=row[4] if len(row) > 4 else datetime.now(),
                shared_with_user=User(
                    id=row[5] if len(row) > 5 else 0,
                    username=row[6] if len(row) > 6 else "unknown",
                    firstname=row[7] if len(row) > 7 else "",
                    lastname=row[8] if len(row) > 8 else "",
                    nickname=row[9] if len(row) > 9 else "",
                    role=row[10] if len(row) > 10 else "user",
                    tel=row[11] if len(row) > 11 else "",
                    created_at=row[12] if len(row) > 12 else datetime.now(),
                    picture_url=(
                        row[13] if len(row) > 13 and row[13] else "unidentified.jpg"
                    ),
                ),
            )
        shared_with_user = User(
            id=row[5],
            username=row[6],
            firstname=row[7],
            lastname=row[8],
            nickname=row[9],
            role=row[10],
            tel=row[11],
            created_at=row[12],
            picture_url=row[13] or "unidentified.jpg",
        )
        return TodoShare(
            id=row[0],
            todo_id=row[1],
            shared_with_user_id=row[2],
            permission=row[3],
            created_at=row[4],
            shared_with_user=shared_with_user,
        )

    def _row_to_status_history(self, row) -> TodoStatusHistory:
        """Convert row data to TodoStatusHistory model"""
        changed_by_user = User(
            id=row[6],
            username=row[7],
            firstname=row[8],
            lastname=row[9],
            nickname=row[10],
            role=row[11],
            tel=row[12],
            created_at=row[13],
            picture_url=row[14] or "unidentified.jpg",
        )
        return TodoStatusHistory(
            id=row[0],
            todo_id=row[1],
            old_status=row[2],
            new_status=row[3],
            changed_by=row[4],
            changed_at=row[5],
            changed_by_user=changed_by_user,
        )

    def _get_todo_with_relations(self, todo_row) -> Todo | None:
        """Get todo with all relations (items, tags, shares)"""
        if not todo_row:
            return None

        todo_id = todo_row[0]

        # Get items
        try:
            item_rows = self.sqlTodo.get_todo_items(todo_id)
            items = []
            if item_rows:
                for row in item_rows:
                    try:
                        item = self._row_to_todo_item(row)
                        if item:
                            items.append(item)
                    except Exception as e:
                        print(f"Error converting item row: {e}")
                        continue
        except Exception as e:
            print(f"Error getting items for todo {todo_id}: {e}")
            items = []

        # Get tags
        try:
            tag_rows = self.sqlTodo.get_tags_for_todo(todo_id)
            tags = []
            if tag_rows:
                for row in tag_rows:
                    try:
                        tag = self._row_to_todo_tag(row)
                        if tag and tag.id > 0:
                            tags.append(tag)
                    except Exception as e:
                        print(f"Error converting tag row: {e}")
                        continue
        except Exception as e:
            print(f"Error getting tags for todo {todo_id}: {e}")
            tags = []

        # Get shares
        try:
            share_rows = self.sqlTodo.get_todo_shares(todo_id)
            shares = []
            if share_rows:
                for row in share_rows:
                    try:
                        share = self._row_to_todo_share(row)
                        if share:
                            shares.append(share)
                    except Exception as e:
                        print(f"Error converting share row: {e}")
                        continue
        except Exception as e:
            print(f"Error getting shares for todo {todo_id}: {e}")
            shares = []

        return self._row_to_todo(todo_row, items, tags, shares)

    # ===========================
    #    TODO CRUD
    # ===========================
    def get_todos(
        self,
        user_id: int,
        status: str | None = None,
        priority: str | None = None,
        include_deleted: bool = False,
    ) -> list[Todo]:
        """Get all todos for a user"""
        rows = self.sqlTodo.get_todos(
            user_id,
            status=status,
            priority=priority,
            include_deleted=include_deleted,
        )
        todos = []
        for row in rows:
            todo = self._get_todo_with_relations(row)
            if todo:
                todos.append(todo)
        return todos

    def get_todo_by_id(
        self, todo_id: int, include_deleted: bool = False
    ) -> Todo | None:
        """Get a single todo by ID"""
        row = self.sqlTodo.get_todo_by_id(todo_id, include_deleted)
        return self._get_todo_with_relations(row)

    def create_todo(
        self,
        title: str,
        user_id: int,
        user: User,
        description: str | None = None,
        status: str = "pending",
        priority: str = "medium",
        due_date: datetime | None = None,
        is_repeat: bool = False,
        repeat_type: str | None = None,
        mood: str | None = None,
        tag_ids: list[int] | None = None,
    ) -> Todo | None:
        """Create a new todo"""
        row = self.sqlTodo.create_todo(
            title=title,
            user_id=user_id,
            description=description,
            status=status,
            priority=priority,
            due_date=due_date,
            is_repeat=is_repeat,
            repeat_type=repeat_type,
            mood=mood,
        )
        if not row:
            return None

        todo_id = row[0]

        # Add tags if provided
        if tag_ids:
            self.sqlTodo.set_tags_for_todo(todo_id, tag_ids)

        # Add initial status history
        self.sqlTodo.add_status_history(todo_id, "", status, user_id)

        return self.get_todo_by_id(todo_id)

    def update_todo(
        self,
        todo_id: int,
        user_id: int,
        title: str | None = None,
        description: str | None = None,
        status: str | None = None,
        priority: str | None = None,
        due_date: datetime | None = None,
        is_repeat: bool | None = None,
        repeat_type: str | None = None,
        mood: str | None = None,
        tag_ids: list[int] | None = None,
    ) -> Todo | None:
        """Update a todo"""
        # Get current status for history
        current_todo = self.get_todo_by_id(todo_id)
        if not current_todo:
            return None

        old_status = current_todo.status

        row = self.sqlTodo.update_todo(
            todo_id=todo_id,
            title=title,
            description=description,
            status=status,
            priority=priority,
            due_date=due_date,
            is_repeat=is_repeat,
            repeat_type=repeat_type,
            mood=mood,
        )
        if not row:
            return None

        # Update tags if provided
        if tag_ids is not None:
            self.sqlTodo.set_tags_for_todo(todo_id, tag_ids)

        # Add status history if status changed
        if status and status != old_status:
            self.sqlTodo.add_status_history(todo_id, old_status, status, user_id)

        return self.get_todo_by_id(todo_id)

    def delete_todo(self, todo_id: int) -> bool:
        """Soft delete a todo"""
        result = self.sqlTodo.delete_todo(todo_id)
        return result is not None

    def delete_todo_permanent(self, todo_id: int) -> bool:
        """Hard delete a todo"""
        result = self.sqlTodo.delete_todo_permanent(todo_id)
        return result is not None

    def restore_todo(self, todo_id: int) -> Todo | None:
        """Restore a soft-deleted todo"""
        self.sqlTodo.restore_todo(todo_id)
        return self.get_todo_by_id(todo_id, include_deleted=True)

    def update_todo_status(
        self, todo_id: int, new_status: str, user_id: int
    ) -> Todo | None:
        """Update todo status with history tracking"""
        current_todo = self.get_todo_by_id(todo_id)
        if not current_todo:
            return None

        old_status = current_todo.status

        row = self.sqlTodo.update_todo_status(todo_id, new_status)
        if not row:
            return None

        # Add status history
        if new_status != old_status:
            self.sqlTodo.add_status_history(todo_id, old_status, new_status, user_id)

        return self.get_todo_by_id(todo_id)

    def set_todo_mood(self, todo_id: int, mood: str) -> Todo | None:
        """Set mood for a todo"""
        row = self.sqlTodo.update_todo(todo_id, mood=mood)
        if not row:
            return None
        return self.get_todo_by_id(todo_id)

    # ===========================
    #    TODO ITEMS (CHECKLIST)
    # ===========================
    def get_todo_items(self, todo_id: int) -> list[TodoItem]:
        """Get all checklist items for a todo"""
        rows = self.sqlTodo.get_todo_items(todo_id)
        return [self._row_to_todo_item(row) for row in rows]

    def create_todo_item(self, todo_id: int, content: str) -> TodoItem | None:
        """Create a checklist item"""
        row = self.sqlTodo.create_todo_item(todo_id, content)
        if not row:
            return None
        return self._row_to_todo_item(row)

    def update_todo_item(
        self,
        item_id: int,
        content: str | None = None,
        is_done: bool | None = None,
    ) -> TodoItem | None:
        """Update a checklist item"""
        row = self.sqlTodo.update_todo_item(item_id, content, is_done)
        if not row:
            return None
        return self._row_to_todo_item(row)

    def delete_todo_item(self, item_id: int) -> bool:
        """Delete a checklist item"""
        result = self.sqlTodo.delete_todo_item(item_id)
        return result is not None

    def toggle_todo_item(self, item_id: int) -> TodoItem | None:
        """Toggle checklist item status"""
        row = self.sqlTodo.toggle_todo_item(item_id)
        if not row:
            return None
        return self._row_to_todo_item(row)

    # ===========================
    #    TODO TAGS
    # ===========================
    def get_todo_tags(self, user_id: int) -> list[TodoTag]:
        """Get all tags for a user"""
        rows = self.sqlTodo.get_todo_tags(user_id)
        if not rows:
            return []
        tags = []
        for row in rows:
            try:
                tag = self._row_to_todo_tag(row)
                if tag and tag.id > 0:  # Only add valid tags
                    tags.append(tag)
            except Exception as e:
                print(f"Error converting row to tag: {e}, row: {row}")
                continue
        return tags

    def get_todo_tag_by_id(self, tag_id: int) -> TodoTag | None:
        """Get a single tag by ID"""
        row = self.sqlTodo.get_todo_tag_by_id(tag_id)
        if not row:
            return None
        return self._row_to_todo_tag(row)

    def create_todo_tag(
        self, name: str, user_id: int, color: str | None = None
    ) -> TodoTag | None:
        """Create a todo tag"""
        row = self.sqlTodo.create_todo_tag(name, user_id, color)
        if not row:
            return None
        return self._row_to_todo_tag(row)

    def update_todo_tag(
        self,
        tag_id: int,
        name: str | None = None,
        color: str | None = None,
    ) -> TodoTag | None:
        """Update a todo tag"""
        row = self.sqlTodo.update_todo_tag(tag_id, name, color)
        if not row:
            return None
        return self._row_to_todo_tag(row)

    def delete_todo_tag(self, tag_id: int) -> bool:
        """Delete a todo tag"""
        result = self.sqlTodo.delete_todo_tag(tag_id)
        return result is not None

    def add_tag_to_todo(self, todo_id: int, tag_id: int) -> bool:
        """Add a tag to a todo"""
        result = self.sqlTodo.add_tag_to_todo(todo_id, tag_id)
        return result is not None

    def remove_tag_from_todo(self, todo_id: int, tag_id: int) -> bool:
        """Remove a tag from a todo"""
        result = self.sqlTodo.remove_tag_from_todo(todo_id, tag_id)
        return result is not None

    def get_todos_by_tag(self, tag_id: int, user_id: int) -> list[Todo]:
        """Get todos by tag"""
        rows = self.sqlTodo.get_todos_by_tag(tag_id, user_id)
        todos = []
        for row in rows:
            todo = self._get_todo_with_relations(row)
            if todo:
                todos.append(todo)
        return todos

    # ===========================
    #    TODO SHARING
    # ===========================
    def share_todo(
        self,
        todo_id: int,
        shared_with_user_id: int,
        permission: str = "view",
    ) -> TodoShare | None:
        """Share a todo with another user"""
        row = self.sqlTodo.share_todo(todo_id, shared_with_user_id, permission)
        if not row:
            return None
        # Fetch full share with user info
        share_row = self.sqlTodo.get_share_by_id(row[0])
        if not share_row:
            return None
        return self._row_to_todo_share(share_row)

    def update_share_permission(
        self, share_id: int, permission: str
    ) -> TodoShare | None:
        """Update share permission"""
        row = self.sqlTodo.update_share_permission(share_id, permission)
        if not row:
            return None
        share_row = self.sqlTodo.get_share_by_id(row[0])
        if not share_row:
            return None
        return self._row_to_todo_share(share_row)

    def unshare_todo(self, todo_id: int, shared_with_user_id: int) -> bool:
        """Remove share access from a user"""
        result = self.sqlTodo.unshare_todo(todo_id, shared_with_user_id)
        return result is not None

    def get_todo_shares(self, todo_id: int) -> list[TodoShare]:
        """Get all shares for a todo"""
        rows = self.sqlTodo.get_todo_shares(todo_id)
        return [self._row_to_todo_share(row) for row in rows]

    def check_todo_access(self, todo_id: int, user_id: int) -> tuple[bool, str | None]:
        """
        Check if user has access to a todo.
        Returns (has_access, permission) where permission is 'owner', 'edit', 'view', or None
        """
        result = self.sqlTodo.check_todo_access(todo_id, user_id)
        if not result:
            return (False, None)

        owner_id = result[0]
        share_permission = result[1]

        if owner_id == user_id:
            return (True, "owner")
        elif share_permission:
            return (True, share_permission)
        else:
            return (False, None)

    # ===========================
    #    STATUS HISTORY
    # ===========================
    def get_status_history(self, todo_id: int) -> list[TodoStatusHistory]:
        """Get status history for a todo"""
        rows = self.sqlTodo.get_status_history(todo_id)
        return [self._row_to_status_history(row) for row in rows]

    # ===========================
    #    STREAK & ANALYTICS
    # ===========================
    def get_streak_summary(self, user_id: int) -> StreakSummary:
        """Get streak summary for a user"""
        try:
            row = self.sqlTodo.get_streak_summary_raw(user_id)
            if not row or len(row) < 4:
                return StreakSummary(
                    current_streak=0,
                    longest_streak=0,
                    total_completed=0,
                    last_completed_date=None,
                )

            # Safe conversion function
            def safe_int(value):
                if value is None:
                    return 0
                try:
                    return int(value)
                except (ValueError, TypeError):
                    print(
                        f"Warning: Could not convert streak value '{value}' to int, using 0"
                    )
                    return 0

            return StreakSummary(
                current_streak=safe_int(row[0]),
                longest_streak=safe_int(row[1]),
                total_completed=safe_int(row[2]),
                last_completed_date=row[3] if row[3] else None,
            )
        except Exception as e:
            print(f"Error in get_streak_summary: {e}")
            return StreakSummary(
                current_streak=0,
                longest_streak=0,
                total_completed=0,
                last_completed_date=None,
            )

    def get_analytics(self, user_id: int) -> TodoAnalytics:
        """Get todo analytics for a user"""
        stats_row = self.sqlTodo.get_todo_stats(user_id)
        streak = self.get_streak_summary(user_id)

        if not stats_row or len(stats_row) < 5:
            return TodoAnalytics(
                total_todos=0,
                completed_todos=0,
                pending_todos=0,
                in_progress_todos=0,
                cancelled_todos=0,
                completion_rate=0.0,
                streak=streak,
            )

        try:
            # Safe conversion function for database values
            def safe_int(value):
                if value is None:
                    return 0
                try:
                    return int(value)
                except (ValueError, TypeError):
                    print(f"Warning: Could not convert '{value}' to int, using 0")
                    return 0

            total = safe_int(stats_row[0])
            completed = safe_int(stats_row[1])
            completion_rate = (completed / total * 100) if total > 0 else 0.0

            return TodoAnalytics(
                total_todos=total,
                completed_todos=completed,
                pending_todos=safe_int(stats_row[2]),
                in_progress_todos=safe_int(stats_row[3]),
                cancelled_todos=safe_int(stats_row[4]),
                completion_rate=round(completion_rate, 2),
                streak=streak,
            )
        except Exception as e:
            print(f"Error in get_analytics: {e}")
            return TodoAnalytics(
                total_todos=0,
                completed_todos=0,
                pending_todos=0,
                in_progress_todos=0,
                cancelled_todos=0,
                completion_rate=0.0,
                streak=streak,
            )

    # ===========================
    #    SPECIAL QUERIES
    # ===========================
    def get_todos_by_due_date(
        self,
        user_id: int,
        start_date: datetime,
        end_date: datetime,
    ) -> list[Todo]:
        """Get todos within a date range"""
        rows = self.sqlTodo.get_todos_by_due_date(user_id, start_date, end_date)
        todos = []
        for row in rows:
            todo = self._get_todo_with_relations(row)
            if todo:
                todos.append(todo)
        return todos

    def get_overdue_todos(self, user_id: int) -> list[Todo]:
        """Get overdue todos"""
        rows = self.sqlTodo.get_overdue_todos(user_id)
        todos = []
        for row in rows:
            todo = self._get_todo_with_relations(row)
            if todo:
                todos.append(todo)
        return todos
