from src.database.connect import Database
from typing import Any
from datetime import datetime
import json


class SQLTodo:
    def __init__(self):
        self.db = Database()

    def _safe_fetchall(self):
        """Safely fetch all rows, handling empty results"""
        try:
            results = self.db.cursor.fetchall()
            return results if results else []
        except Exception as e:
            print(f"Error in fetchall: {e}")
            return []

    def _safe_fetchone(self):
        """Safely fetch one row, handling empty results"""
        try:
            return self.db.cursor.fetchone()
        except Exception as e:
            print(f"Error in fetchone: {e}")
            return None

    # ===========================
    #    TODO CRUD OPERATIONS
    # ===========================
    def get_todos(
        self,
        user_id: int,
        limit: int = 100,
        status: str | None = None,
        priority: str | None = None,
        include_deleted: bool = False,
        include_shared: bool = True,
    ):
        """Fetch todos for a user with optional filters, including shared todos"""
        query = """
            SELECT DISTINCT t.id, t.title, t.description, t.status, t.priority, 
                   t.due_date, t.completed_at, t.is_repeat, t.repeat_type, t.mood,
                   t.user_id, t.deleted_status, t.created_at, t.updated_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM todo t
            INNER JOIN "user" u ON t.user_id = u.id
            LEFT JOIN todo_share ts ON t.id = ts.todo_id AND ts.shared_with_user_id = %s
            WHERE (t.user_id = %s OR ts.shared_with_user_id = %s)
        """
        params: list[Any] = [user_id, user_id, user_id]

        if not include_deleted:
            query += " AND t.deleted_status = FALSE"

        if status is not None:
            query += " AND t.status = %s"
            params.append(status)

        if priority is not None:
            query += " AND t.priority = %s"
            params.append(priority)

        query += " ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC LIMIT %s;"
        params.append(limit)

        try:
            self.db.cursor.execute(query, tuple(params))
            return self._safe_fetchall()
        except Exception as e:
            print(f"Error fetching todos: {e}")
            return []

    def get_todo_by_id(self, todo_id: int, include_deleted: bool = False):
        """Fetch a single todo by ID with user info"""
        query = """
            SELECT t.id, t.title, t.description, t.status, t.priority, 
                   t.due_date, t.completed_at, t.is_repeat, t.repeat_type, t.mood,
                   t.user_id, t.deleted_status, t.created_at, t.updated_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM todo t
            INNER JOIN "user" u ON t.user_id = u.id
            WHERE t.id = %s
        """
        if not include_deleted:
            query += " AND t.deleted_status = FALSE"
        query += ";"

        try:
            self.db.cursor.execute(query, (todo_id,))
            return self._safe_fetchone()
        except Exception as e:
            print(f"Error fetching todo by id: {e}")
            return None

    def create_todo(
        self,
        title: str,
        user_id: int,
        description: str | None = None,
        status: str = "pending",
        priority: str = "medium",
        due_date: datetime | None = None,
        is_repeat: bool = False,
        repeat_type: str | None = None,
        mood: str | None = None,
    ):
        """Create a new todo and return the created row"""
        self.db.cursor.execute(
            """
            INSERT INTO todo (
                title, description, status, priority, due_date,
                is_repeat, repeat_type, mood, user_id, deleted_status, created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE, NOW())
            RETURNING id, title, description, status, priority, due_date, 
                      completed_at, is_repeat, repeat_type, mood, user_id, 
                      deleted_status, created_at, updated_at;
        """,
            (
                title,
                description,
                status,
                priority,
                due_date,
                is_repeat,
                repeat_type,
                mood,
                user_id,
            ),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def update_todo(
        self,
        todo_id: int,
        title: str | None = None,
        description: str | None = None,
        status: str | None = None,
        priority: str | None = None,
        due_date: datetime | None = None,
        is_repeat: bool | None = None,
        repeat_type: str | None = None,
        mood: str | None = None,
    ):
        """Update an existing todo"""
        # Build dynamic update query
        updates = []
        params: list[Any] = []

        if title is not None:
            updates.append("title = %s")
            params.append(title)
        if description is not None:
            updates.append("description = %s")
            params.append(description)
        if status is not None:
            updates.append("status = %s")
            params.append(status)
            # If completed, set completed_at
            if status == "completed":
                updates.append("completed_at = NOW()")
        if priority is not None:
            updates.append("priority = %s")
            params.append(priority)
        if due_date is not None:
            updates.append("due_date = %s")
            params.append(due_date)
        if is_repeat is not None:
            updates.append("is_repeat = %s")
            params.append(is_repeat)
        if repeat_type is not None:
            updates.append("repeat_type = %s")
            params.append(repeat_type)
        if mood is not None:
            updates.append("mood = %s")
            params.append(mood)

        if not updates:
            return self.get_todo_by_id(todo_id)

        updates.append("updated_at = NOW()")
        params.append(todo_id)

        query = f"""
            UPDATE todo
            SET {', '.join(updates)}
            WHERE id = %s AND deleted_status = FALSE
            RETURNING id, title, description, status, priority, due_date, 
                      completed_at, is_repeat, repeat_type, mood, user_id, 
                      deleted_status, created_at, updated_at;
        """

        self.db.cursor.execute(query, tuple(params))
        self.db.connection.commit()
        return self._safe_fetchone()

    def delete_todo(self, todo_id: int):
        """Soft delete a todo"""
        self.db.cursor.execute(
            """
            UPDATE todo
            SET deleted_status = TRUE, updated_at = NOW()
            WHERE id = %s
            RETURNING id;
        """,
            (todo_id,),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def delete_todo_permanent(self, todo_id: int):
        """Hard delete a todo and all related data"""
        self.db.cursor.execute(
            """
            DELETE FROM todo WHERE id = %s RETURNING id;
        """,
            (todo_id,),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def restore_todo(self, todo_id: int):
        """Restore a soft-deleted todo"""
        self.db.cursor.execute(
            """
            UPDATE todo
            SET deleted_status = FALSE, updated_at = NOW()
            WHERE id = %s
            RETURNING id, title, description, status, priority, due_date, 
                      completed_at, is_repeat, repeat_type, mood, user_id, 
                      deleted_status, created_at, updated_at;
        """,
            (todo_id,),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def update_todo_status(self, todo_id: int, new_status: str):
        """Update only the status of a todo (for status transitions)"""
        completed_at_update = (
            ", completed_at = NOW()" if new_status == "completed" else ""
        )

        self.db.cursor.execute(
            f"""
            UPDATE todo
            SET status = %s, updated_at = NOW(){completed_at_update}
            WHERE id = %s AND deleted_status = FALSE
            RETURNING id, title, description, status, priority, due_date, 
                      completed_at, is_repeat, repeat_type, mood, user_id, 
                      deleted_status, created_at, updated_at;
        """,
            (new_status, todo_id),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def get_todos_by_due_date(
        self, user_id: int, start_date: datetime, end_date: datetime
    ):
        """Fetch todos within a date range"""
        self.db.cursor.execute(
            """
            SELECT t.id, t.title, t.description, t.status, t.priority, 
                   t.due_date, t.completed_at, t.is_repeat, t.repeat_type, t.mood,
                   t.user_id, t.deleted_status, t.created_at, t.updated_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM todo t
            INNER JOIN "user" u ON t.user_id = u.id
            WHERE t.user_id = %s 
              AND t.deleted_status = FALSE
              AND t.due_date BETWEEN %s AND %s
            ORDER BY t.due_date ASC;
        """,
            (user_id, start_date, end_date),
        )
        return self._safe_fetchall()

    def get_overdue_todos(self, user_id: int):
        """Fetch overdue todos (due_date < NOW() and not completed/cancelled)"""
        self.db.cursor.execute(
            """
            SELECT t.id, t.title, t.description, t.status, t.priority, 
                   t.due_date, t.completed_at, t.is_repeat, t.repeat_type, t.mood,
                   t.user_id, t.deleted_status, t.created_at, t.updated_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM todo t
            INNER JOIN "user" u ON t.user_id = u.id
            WHERE t.user_id = %s 
              AND t.deleted_status = FALSE
              AND t.due_date < NOW()
              AND t.status NOT IN ('completed', 'cancelled')
            ORDER BY t.due_date ASC;
        """,
            (user_id,),
        )
        return self._safe_fetchall()

    # ===========================
    #    TODO ITEM (CHECKLIST) OPERATIONS
    # ===========================
    def get_todo_items(self, todo_id: int):
        """Fetch all checklist items for a todo"""
        try:
            self.db.cursor.execute(
                """
                SELECT id, todo_id, content, is_done, created_at, COALESCE(updated_at, created_at) as updated_at
                FROM todo_item
                WHERE todo_id = %s
                ORDER BY created_at ASC;
            """,
                (todo_id,),
            )
            return self._safe_fetchall()
        except Exception as e:
            print(f"Error fetching todo items for todo_id {todo_id}: {e}")
            return []

    def create_todo_item(self, todo_id: int, content: str):
        """Create a checklist item"""
        self.db.cursor.execute(
            """
            INSERT INTO todo_item (todo_id, content, is_done, created_at)
            VALUES (%s, %s, FALSE, NOW())
            RETURNING id, todo_id, content, is_done, created_at, updated_at;
        """,
            (todo_id, content),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def update_todo_item(
        self, item_id: int, content: str | None = None, is_done: bool | None = None
    ):
        """Update a checklist item"""
        updates = []
        params: list[Any] = []

        if content is not None:
            updates.append("content = %s")
            params.append(content)
        if is_done is not None:
            updates.append("is_done = %s")
            params.append(is_done)

        if not updates:
            return None

        updates.append("updated_at = NOW()")
        params.append(item_id)

        query = f"""
            UPDATE todo_item
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING id, todo_id, content, is_done, created_at, updated_at;
        """

        self.db.cursor.execute(query, tuple(params))
        self.db.connection.commit()
        return self._safe_fetchone()

    def delete_todo_item(self, item_id: int):
        """Delete a checklist item"""
        self.db.cursor.execute(
            """
            DELETE FROM todo_item WHERE id = %s RETURNING id;
        """,
            (item_id,),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def toggle_todo_item(self, item_id: int):
        """Toggle the is_done status of a checklist item"""
        self.db.cursor.execute(
            """
            UPDATE todo_item
            SET is_done = NOT is_done, updated_at = NOW()
            WHERE id = %s
            RETURNING id, todo_id, content, is_done, created_at, updated_at;
        """,
            (item_id,),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    # ===========================
    #    TODO TAG OPERATIONS
    # ===========================
    def get_todo_tags(self, user_id: int):
        """Fetch all tags for a user"""
        try:
            self.db.cursor.execute(
                """
                SELECT id, name, COALESCE(color, '#808080') as color, user_id, 
                       COALESCE(created_at, CURRENT_TIMESTAMP) as created_at
                FROM todo_tag
                WHERE user_id = %s
                ORDER BY name ASC;
            """,
                (user_id,),
            )
            return self._safe_fetchall()
        except Exception as e:
            print(f"Error fetching todo tags: {e}")
            return []

    def get_todo_tag_by_id(self, tag_id: int):
        """Fetch a single tag by ID"""
        self.db.cursor.execute(
            """
            SELECT id, name, COALESCE(color, '#808080') as color, user_id, 
                   COALESCE(created_at, CURRENT_TIMESTAMP) as created_at
            FROM todo_tag
            WHERE id = %s;
        """,
            (tag_id,),
        )
        return self._safe_fetchone()

    def create_todo_tag(self, name: str, user_id: int, color: str | None = None):
        """Create a todo tag"""
        self.db.cursor.execute(
            """
            INSERT INTO todo_tag (name, color, user_id, created_at)
            VALUES (%s, %s, %s, NOW())
            RETURNING id, name, color, user_id, created_at;
        """,
            (name, color, user_id),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def update_todo_tag(
        self, tag_id: int, name: str | None = None, color: str | None = None
    ):
        """Update a todo tag"""
        updates = []
        params: list[Any] = []

        if name is not None:
            updates.append("name = %s")
            params.append(name)
        if color is not None:
            updates.append("color = %s")
            params.append(color)

        if not updates:
            return self.get_todo_tag_by_id(tag_id)

        params.append(tag_id)

        query = f"""
            UPDATE todo_tag
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING id, name, color, user_id, created_at;
        """

        self.db.cursor.execute(query, tuple(params))
        self.db.connection.commit()
        return self._safe_fetchone()

    def delete_todo_tag(self, tag_id: int):
        """Delete a todo tag"""
        self.db.cursor.execute(
            """
            DELETE FROM todo_tag WHERE id = %s RETURNING id;
        """,
            (tag_id,),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    # ===========================
    #    TODO TAG PIVOT OPERATIONS
    # ===========================
    def get_tags_for_todo(self, todo_id: int):
        """Fetch all tags associated with a todo"""
        try:
            self.db.cursor.execute(
                """
                SELECT tt.id, tt.name, COALESCE(tt.color, '#808080') as color, tt.user_id, 
                       COALESCE(tt.created_at, CURRENT_TIMESTAMP) as created_at
                FROM todo_tag tt
                INNER JOIN todo_tag_pivot ttp ON tt.id = ttp.tag_id
                WHERE ttp.todo_id = %s
                ORDER BY tt.name ASC;
            """,
                (todo_id,),
            )
            return self._safe_fetchall()
        except Exception as e:
            print(f"Error fetching tags for todo_id {todo_id}: {e}")
            return []

    def add_tag_to_todo(self, todo_id: int, tag_id: int):
        """Add a tag to a todo"""
        self.db.cursor.execute(
            """
            INSERT INTO todo_tag_pivot (todo_id, tag_id)
            VALUES (%s, %s)
            ON CONFLICT (todo_id, tag_id) DO NOTHING
            RETURNING todo_id, tag_id;
        """,
            (todo_id, tag_id),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def remove_tag_from_todo(self, todo_id: int, tag_id: int):
        """Remove a tag from a todo"""
        self.db.cursor.execute(
            """
            DELETE FROM todo_tag_pivot
            WHERE todo_id = %s AND tag_id = %s
            RETURNING todo_id, tag_id;
        """,
            (todo_id, tag_id),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def set_tags_for_todo(self, todo_id: int, tag_ids: list[int]):
        """Replace all tags for a todo with the given list"""
        # Remove existing tags
        self.db.cursor.execute(
            "DELETE FROM todo_tag_pivot WHERE todo_id = %s;",
            (todo_id,),
        )

        # Add new tags
        if tag_ids:
            values = [(todo_id, tag_id) for tag_id in tag_ids]
            self.db.cursor.executemany(
                "INSERT INTO todo_tag_pivot (todo_id, tag_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
                values,
            )

        self.db.connection.commit()

    def get_todos_by_tag(self, tag_id: int, user_id: int):
        """Fetch todos by tag"""
        self.db.cursor.execute(
            """
            SELECT t.id, t.title, t.description, t.status, t.priority, 
                   t.due_date, t.completed_at, t.is_repeat, t.repeat_type, t.mood,
                   t.user_id, t.deleted_status, t.created_at, t.updated_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM todo t
            INNER JOIN "user" u ON t.user_id = u.id
            INNER JOIN todo_tag_pivot ttp ON t.id = ttp.todo_id
            WHERE ttp.tag_id = %s AND t.user_id = %s AND t.deleted_status = FALSE
            ORDER BY t.due_date ASC NULLS LAST;
        """,
            (tag_id, user_id),
        )
        return self._safe_fetchall()

    # ===========================
    #    TODO SHARE OPERATIONS
    # ===========================
    def get_todo_shares(self, todo_id: int):
        """Fetch all shares for a todo"""
        try:
            self.db.cursor.execute(
                """
                SELECT ts.id, ts.todo_id, ts.shared_with_user_id, ts.permission, ts.created_at,
                       u.id, u.username, u.firstname, u.lastname, u.nickname, 
                       u.role, u.tel, u.created_at, u.picture_url
                FROM todo_share ts
                INNER JOIN "user" u ON ts.shared_with_user_id = u.id
                WHERE ts.todo_id = %s;
            """,
                (todo_id,),
            )
            return self._safe_fetchall()
        except Exception as e:
            print(f"Error fetching shares for todo_id {todo_id}: {e}")
            return []

    def get_share_by_id(self, share_id: int):
        """Fetch a single share by ID"""
        self.db.cursor.execute(
            """
            SELECT ts.id, ts.todo_id, ts.shared_with_user_id, ts.permission, ts.created_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM todo_share ts
            INNER JOIN "user" u ON ts.shared_with_user_id = u.id
            WHERE ts.id = %s;
        """,
            (share_id,),
        )
        return self._safe_fetchone()

    def share_todo(
        self, todo_id: int, shared_with_user_id: int, permission: str = "view"
    ):
        """Share a todo with another user"""
        self.db.cursor.execute(
            """
            INSERT INTO todo_share (todo_id, shared_with_user_id, permission, created_at)
            VALUES (%s, %s, %s, NOW())
            ON CONFLICT (todo_id, shared_with_user_id) DO UPDATE SET permission = %s
            RETURNING id, todo_id, shared_with_user_id, permission, created_at;
        """,
            (todo_id, shared_with_user_id, permission, permission),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def update_share_permission(self, share_id: int, permission: str):
        """Update share permission"""
        self.db.cursor.execute(
            """
            UPDATE todo_share
            SET permission = %s
            WHERE id = %s
            RETURNING id, todo_id, shared_with_user_id, permission, created_at;
        """,
            (permission, share_id),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def unshare_todo(self, todo_id: int, shared_with_user_id: int):
        """Remove share access from a user"""
        self.db.cursor.execute(
            """
            DELETE FROM todo_share
            WHERE todo_id = %s AND shared_with_user_id = %s
            RETURNING id;
        """,
            (todo_id, shared_with_user_id),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    def check_todo_access(self, todo_id: int, user_id: int):
        """Check if user has access to a todo (owner or shared)"""
        self.db.cursor.execute(
            """
            SELECT t.user_id, ts.permission
            FROM todo t
            LEFT JOIN todo_share ts ON t.id = ts.todo_id AND ts.shared_with_user_id = %s
            WHERE t.id = %s;
        """,
            (user_id, todo_id),
        )
        return self._safe_fetchone()

    # ===========================
    #    TODO STATUS HISTORY OPERATIONS
    # ===========================
    def get_status_history(self, todo_id: int):
        """Fetch status history for a todo"""
        self.db.cursor.execute(
            """
            SELECT tsh.id, tsh.todo_id, tsh.old_status, tsh.new_status, 
                   tsh.changed_by, tsh.changed_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM todo_status_history tsh
            INNER JOIN "user" u ON tsh.changed_by = u.id
            WHERE tsh.todo_id = %s
            ORDER BY tsh.changed_at DESC;
        """,
            (todo_id,),
        )
        return self._safe_fetchall()

    def add_status_history(
        self, todo_id: int, old_status: str, new_status: str, changed_by: int
    ):
        """Add a status change to history"""
        self.db.cursor.execute(
            """
            INSERT INTO todo_status_history (todo_id, old_status, new_status, changed_by, changed_at)
            VALUES (%s, %s, %s, %s, NOW())
            RETURNING id, todo_id, old_status, new_status, changed_by, changed_at;
        """,
            (todo_id, old_status, new_status, changed_by),
        )
        self.db.connection.commit()
        return self._safe_fetchone()

    # ===========================
    #    STREAK CALCULATION
    # ===========================
    def get_completion_dates(self, user_id: int, days: int = 365):
        """Fetch distinct dates when user completed todos (for streak calculation)"""
        self.db.cursor.execute(
            """
            SELECT DISTINCT DATE(tsh.changed_at) as completion_date
            FROM todo_status_history tsh
            INNER JOIN todo t ON tsh.todo_id = t.id
            WHERE t.user_id = %s 
              AND tsh.new_status = 'completed'
              AND tsh.changed_at >= NOW() - INTERVAL '%s days'
            ORDER BY completion_date DESC;
        """,
            (user_id, days),
        )
        return self._safe_fetchall()

    def get_streak_summary_raw(self, user_id: int):
        """
        Calculate streak directly in SQL for better performance.
        Returns: current_streak, longest_streak, total_completed, last_completed_date
        """
        self.db.cursor.execute(
            """
            WITH completion_dates AS (
                SELECT DISTINCT DATE(tsh.changed_at) as completion_date
                FROM todo_status_history tsh
                INNER JOIN todo t ON tsh.todo_id = t.id
                WHERE t.user_id = %s AND tsh.new_status = 'completed'
                ORDER BY completion_date DESC
            ),
            date_with_gaps AS (
                SELECT 
                    completion_date,
                    completion_date - (ROW_NUMBER() OVER (ORDER BY completion_date DESC))::int as grp
                FROM completion_dates
            ),
            streaks AS (
                SELECT 
                    grp,
                    COUNT(*) as streak_length,
                    MAX(completion_date) as streak_end,
                    MIN(completion_date) as streak_start
                FROM date_with_gaps
                GROUP BY grp
            ),
            current_streak AS (
                SELECT 
                    CASE 
                        WHEN MAX(completion_date) >= CURRENT_DATE - 1 THEN 
                            (SELECT streak_length FROM streaks ORDER BY streak_end DESC LIMIT 1)
                        ELSE 0
                    END as current_streak
                FROM completion_dates
            ),
            stats AS (
                SELECT 
                    (SELECT current_streak FROM current_streak) as current_streak,
                    COALESCE((SELECT MAX(streak_length) FROM streaks), 0) as longest_streak,
                    (SELECT COUNT(*) FROM todo_status_history tsh 
                     INNER JOIN todo t ON tsh.todo_id = t.id 
                     WHERE t.user_id = %s AND tsh.new_status = 'completed') as total_completed,
                    (SELECT MAX(completion_date) FROM completion_dates) as last_completed_date
            )
            SELECT current_streak, longest_streak, total_completed, last_completed_date FROM stats;
        """,
            (user_id, user_id),
        )
        try:
            result = self._safe_fetchone()
            return result if result else (0, 0, 0, None)
        except Exception:
            return (0, 0, 0, None)

    # ===========================
    #    ANALYTICS
    # ===========================
    def get_todo_stats(self, user_id: int):
        """Get todo statistics for a user"""
        try:
            self.db.cursor.execute(
                """
                SELECT 
                    COUNT(*) FILTER (WHERE deleted_status = FALSE) as total_todos,
                    COUNT(*) FILTER (WHERE status = 'completed' AND deleted_status = FALSE) as completed_todos,
                    COUNT(*) FILTER (WHERE status = 'pending' AND deleted_status = FALSE) as pending_todos,
                    COUNT(*) FILTER (WHERE status = 'in_progress' AND deleted_status = FALSE) as in_progress_todos,
                    COUNT(*) FILTER (WHERE status = 'cancelled' AND deleted_status = FALSE) as cancelled_todos
                FROM todo
                WHERE user_id = %s;
            """,
                (user_id,),
            )
            result = self._safe_fetchone()
            return result if result else (0, 0, 0, 0, 0)
        except Exception:
            return (0, 0, 0, 0, 0)
