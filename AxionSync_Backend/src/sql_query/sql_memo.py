from src.database.connect import Database


class SQLMemo:
    def __init__(self):
        self.db = Database()

    def get_memos(self, user_id: int, limit: int = 100, tab_id: int | None = None):
        """Fetch recent memos for a user, ordered by oldest first (newest at bottom)"""
        if tab_id is not None:
            self.db.cursor.execute(
                """
                SELECT m.id, m.title, m.content, m.user_id, m.tab_id, m.font_color, m.deleted_status, m.collected, m.collected_time, m.created_at, m.updated_at,
                       u.id, u.username, u.firstname, u.lastname, u.nickname, u.role, u.tel, u.created_at, u.picture_url
                FROM memo m
                INNER JOIN "user" u ON m.user_id = u.id
                WHERE m.user_id = %s AND m.tab_id = %s AND m.deleted_status = FALSE
                ORDER BY  m.created_at ASC
                LIMIT %s;
            """,
                (user_id, tab_id, limit),
            )
        else:
            self.db.cursor.execute(
                """
                SELECT m.id, m.title, m.content, m.user_id, m.tab_id, m.font_color, m.deleted_status, m.collected, m.collected_time, m.created_at, m.updated_at,
                       u.id, u.username, u.firstname, u.lastname, u.nickname, u.role, u.tel, u.created_at, u.picture_url
                FROM memo m
                INNER JOIN "user" u ON m.user_id = u.id
                WHERE m.user_id = %s AND m.deleted_status = FALSE
                ORDER BY  m.created_at ASC
                LIMIT %s;
            """,
                (user_id, limit),
            )
        return self.db.cursor.fetchall()

    def get_memo_by_id(self, memo_id: int):
        """Fetch a single memo by ID with user info"""
        self.db.cursor.execute(
            """
            SELECT m.id, m.title, m.content, m.user_id, m.tab_id, m.font_color, m.deleted_status, m.collected, m.collected_time, m.created_at, m.updated_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, u.role, u.tel, u.created_at, u.picture_url
            FROM memo m
            INNER JOIN "user" u ON m.user_id = u.id
            WHERE m.id = %s AND m.deleted_status = FALSE;
        """,
            (memo_id,),
        )
        return self.db.cursor.fetchone()

    def create_memo(
        self,
        title: str,
        content: str,
        user_id: int,
        tab_id: int | None = None,
        font_color: str | None = None,
    ):
        """Create a new memo and return the created row"""
        self.db.cursor.execute(
            """
            INSERT INTO memo (title, content, user_id, tab_id, font_color, deleted_status, collected, created_at)
            VALUES (%s, %s, %s, %s, %s, FALSE, FALSE, NOW())
            RETURNING id, title, content, user_id, tab_id, font_color, deleted_status, collected, collected_time, created_at, updated_at;
        """,
            (title, content, user_id, tab_id, font_color),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def update_memo(
        self, memo_id: int, title: str, content: str, font_color: str | None = None
    ):
        """Update an existing memo"""
        self.db.cursor.execute(
            """
            UPDATE memo
            SET title = %s, content = %s, font_color = %s, updated_at = NOW()
            WHERE id = %s AND deleted_status = FALSE
            RETURNING id, title, content, user_id, tab_id, font_color, deleted_status, collected, collected_time, created_at, updated_at;
        """,
            (title, content, font_color, memo_id),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def collect_memo(self, memo_id: int):
        """Mark a memo as collected"""
        self.db.cursor.execute(
            """
            UPDATE memo
            SET collected = TRUE, collected_time = NOW(), updated_at = NOW()
            WHERE id = %s AND deleted_status = FALSE
            RETURNING id, title, content, user_id, tab_id, font_color, deleted_status, collected, collected_time, created_at, updated_at;
        """,
            (memo_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def uncollect_memo(self, memo_id: int):
        """Unmark a memo as collected"""
        self.db.cursor.execute(
            """
            UPDATE memo
            SET collected = FALSE, collected_time = NULL, updated_at = NOW()
            WHERE id = %s AND deleted_status = FALSE
            RETURNING id, title, content, user_id, tab_id, font_color, deleted_status, collected, collected_time, created_at, updated_at;
        """,
            (memo_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def delete_memo(self, memo_id: int):
        """Soft delete a memo"""
        self.db.cursor.execute(
            """
            UPDATE memo
            SET deleted_status = TRUE
            WHERE id = %s
            RETURNING id;
        """,
            (memo_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()
