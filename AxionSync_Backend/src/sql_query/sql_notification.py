from src.database.connect import Database
from typing import Any
from datetime import datetime


class SQLNotification:
    def __init__(self):
        self.db = Database()

    # ===========================
    #    TODO NOTIFICATION OPERATIONS
    # ===========================
    def get_notifications(
        self, user_id: int, include_sent: bool = False, limit: int = 100
    ):
        """Fetch notifications for a user"""
        query = """
            SELECT tn.id, tn.todo_id, tn.user_id, tn.notify_time, tn.is_sent, 
                   tn.channel, tn.message, tn.created_at,
                   t.title as todo_title,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at as user_created_at, u.picture_url
            FROM todo_notification tn
            INNER JOIN todo t ON tn.todo_id = t.id
            INNER JOIN "user" u ON tn.user_id = u.id
            WHERE tn.user_id = %s
        """
        params: list[Any] = [user_id]

        if not include_sent:
            query += " AND tn.is_sent = FALSE"

        query += " ORDER BY tn.notify_time ASC LIMIT %s;"
        params.append(limit)

        self.db.cursor.execute(query, tuple(params))
        return self.db.cursor.fetchall()

    def get_notification_by_id(self, notification_id: int):
        """Fetch a single notification by ID"""
        self.db.cursor.execute(
            """
            SELECT tn.id, tn.todo_id, tn.user_id, tn.notify_time, tn.is_sent, 
                   tn.channel, tn.message, tn.created_at,
                   t.title as todo_title,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at as user_created_at, u.picture_url
            FROM todo_notification tn
            INNER JOIN todo t ON tn.todo_id = t.id
            INNER JOIN "user" u ON tn.user_id = u.id
            WHERE tn.id = %s;
        """,
            (notification_id,),
        )
        return self.db.cursor.fetchone()

    def get_notifications_for_todo(self, todo_id: int):
        """Fetch all notifications for a todo"""
        self.db.cursor.execute(
            """
            SELECT tn.id, tn.todo_id, tn.user_id, tn.notify_time, tn.is_sent, 
                   tn.channel, tn.message, tn.created_at,
                   t.title as todo_title,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at as user_created_at, u.picture_url
            FROM todo_notification tn
            INNER JOIN todo t ON tn.todo_id = t.id
            INNER JOIN "user" u ON tn.user_id = u.id
            WHERE tn.todo_id = %s
            ORDER BY tn.notify_time ASC;
        """,
            (todo_id,),
        )
        return self.db.cursor.fetchall()

    def create_notification(
        self,
        todo_id: int,
        user_id: int,
        notify_time: datetime,
        channel: str = "in_app",
        message: str | None = None,
    ):
        """Create a new notification"""
        self.db.cursor.execute(
            """
            INSERT INTO todo_notification (todo_id, user_id, notify_time, is_sent, channel, message, created_at)
            VALUES (%s, %s, %s, FALSE, %s, %s, NOW())
            RETURNING id, todo_id, user_id, notify_time, is_sent, channel, message, created_at;
        """,
            (todo_id, user_id, notify_time, channel, message),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def update_notification(
        self,
        notification_id: int,
        notify_time: datetime | None = None,
        channel: str | None = None,
        message: str | None = None,
    ):
        """Update a notification"""
        updates = []
        params: list[Any] = []

        if notify_time is not None:
            updates.append("notify_time = %s")
            params.append(notify_time)
        if channel is not None:
            updates.append("channel = %s")
            params.append(channel)
        if message is not None:
            updates.append("message = %s")
            params.append(message)

        if not updates:
            return self.get_notification_by_id(notification_id)

        params.append(notification_id)

        query = f"""
            UPDATE todo_notification
            SET {', '.join(updates)}
            WHERE id = %s AND is_sent = FALSE
            RETURNING id, todo_id, user_id, notify_time, is_sent, channel, message, created_at;
        """

        self.db.cursor.execute(query, tuple(params))
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def delete_notification(self, notification_id: int):
        """Delete a notification"""
        self.db.cursor.execute(
            """
            DELETE FROM todo_notification WHERE id = %s RETURNING id;
        """,
            (notification_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def mark_notification_sent(self, notification_id: int):
        """Mark a notification as sent"""
        self.db.cursor.execute(
            """
            UPDATE todo_notification
            SET is_sent = TRUE
            WHERE id = %s
            RETURNING id, todo_id, user_id, notify_time, is_sent, channel, message, created_at;
        """,
            (notification_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def get_pending_notifications(
        self, before_time: datetime | None = None, limit: int = 100
    ):
        """Fetch pending notifications that need to be sent"""
        query = """
            SELECT tn.id, tn.todo_id, tn.user_id, tn.notify_time, tn.is_sent, 
                   tn.channel, tn.message, tn.created_at,
                   t.title as todo_title,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at as user_created_at, u.picture_url
            FROM todo_notification tn
            INNER JOIN todo t ON tn.todo_id = t.id
            INNER JOIN "user" u ON tn.user_id = u.id
            WHERE tn.is_sent = FALSE
        """
        params: list[Any] = []

        if before_time is not None:
            query += " AND tn.notify_time <= %s"
            params.append(before_time)

        query += " ORDER BY tn.notify_time ASC LIMIT %s;"
        params.append(limit)

        self.db.cursor.execute(query, tuple(params))
        return self.db.cursor.fetchall()

    def get_upcoming_notifications(self, user_id: int, hours: int = 24):
        """Fetch upcoming notifications within the next N hours"""
        self.db.cursor.execute(
            """
            SELECT tn.id, tn.todo_id, t.title as todo_title, tn.notify_time, 
                   tn.channel, tn.message,
                   EXTRACT(EPOCH FROM (tn.notify_time - NOW()))::int as time_until
            FROM todo_notification tn
            INNER JOIN todo t ON tn.todo_id = t.id
            WHERE tn.user_id = %s 
              AND tn.is_sent = FALSE
              AND tn.notify_time <= NOW() + INTERVAL '%s hours'
              AND tn.notify_time > NOW()
            ORDER BY tn.notify_time ASC;
        """,
            (user_id, hours),
        )
        return self.db.cursor.fetchall()

    # ===========================
    #    USER DEVICE TOKEN OPERATIONS
    # ===========================
    def get_device_tokens(self, user_id: int, active_only: bool = True):
        """Fetch device tokens for a user"""
        query = """
            SELECT id, user_id, device_token, platform, is_active, created_at, updated_at
            FROM user_device_token
            WHERE user_id = %s
        """
        params: list[Any] = [user_id]

        if active_only:
            query += " AND is_active = TRUE"

        query += " ORDER BY created_at DESC;"

        self.db.cursor.execute(query, tuple(params))
        return self.db.cursor.fetchall()

    def get_device_token_by_id(self, token_id: int):
        """Fetch a single device token by ID"""
        self.db.cursor.execute(
            """
            SELECT id, user_id, device_token, platform, is_active, created_at, updated_at
            FROM user_device_token
            WHERE id = %s;
        """,
            (token_id,),
        )
        return self.db.cursor.fetchone()

    def get_device_token_by_token(self, device_token: str):
        """Fetch a device token by token string"""
        self.db.cursor.execute(
            """
            SELECT id, user_id, device_token, platform, is_active, created_at, updated_at
            FROM user_device_token
            WHERE device_token = %s;
        """,
            (device_token,),
        )
        return self.db.cursor.fetchone()

    def register_device_token(self, user_id: int, device_token: str, platform: str):
        """Register a new device token (upsert)"""
        self.db.cursor.execute(
            """
            INSERT INTO user_device_token (user_id, device_token, platform, is_active, created_at)
            VALUES (%s, %s, %s, TRUE, NOW())
            ON CONFLICT (device_token) DO UPDATE 
            SET user_id = %s, platform = %s, is_active = TRUE, updated_at = NOW()
            RETURNING id, user_id, device_token, platform, is_active, created_at, updated_at;
        """,
            (user_id, device_token, platform, user_id, platform),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def update_device_token(
        self,
        token_id: int,
        device_token: str | None = None,
        is_active: bool | None = None,
    ):
        """Update a device token"""
        updates = []
        params: list[Any] = []

        if device_token is not None:
            updates.append("device_token = %s")
            params.append(device_token)
        if is_active is not None:
            updates.append("is_active = %s")
            params.append(is_active)

        if not updates:
            return self.get_device_token_by_id(token_id)

        updates.append("updated_at = NOW()")
        params.append(token_id)

        query = f"""
            UPDATE user_device_token
            SET {', '.join(updates)}
            WHERE id = %s
            RETURNING id, user_id, device_token, platform, is_active, created_at, updated_at;
        """

        self.db.cursor.execute(query, tuple(params))
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def deactivate_device_token(self, device_token: str):
        """Deactivate a device token"""
        self.db.cursor.execute(
            """
            UPDATE user_device_token
            SET is_active = FALSE, updated_at = NOW()
            WHERE device_token = %s
            RETURNING id;
        """,
            (device_token,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def delete_device_token(self, token_id: int):
        """Delete a device token"""
        self.db.cursor.execute(
            """
            DELETE FROM user_device_token WHERE id = %s RETURNING id;
        """,
            (token_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def get_all_active_tokens_for_user(self, user_id: int, platform: str | None = None):
        """Fetch all active device tokens for a user, optionally filtered by platform"""
        query = """
            SELECT id, user_id, device_token, platform, is_active, created_at, updated_at
            FROM user_device_token
            WHERE user_id = %s AND is_active = TRUE
        """
        params: list[Any] = [user_id]

        if platform is not None:
            query += " AND platform = %s"
            params.append(platform)

        query += ";"

        self.db.cursor.execute(query, tuple(params))
        return self.db.cursor.fetchall()
