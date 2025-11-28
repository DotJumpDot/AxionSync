from src.database.connect import Database


class SQLMemo:
    def __init__(self):
        self.db = Database()

    def get_memos(self, user_id: int, limit: int = 100):
        """Fetch recent memos for a user, ordered newest first"""
        self.db.cursor.execute(
            """
            SELECT m.id, m.title, m.content, m.user_id, m.deleted_status, m.created_at, m.updated_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, u.role, u.tel, u.created_at
            FROM memos m
            INNER JOIN users u ON m.user_id = u.id
            WHERE m.user_id = %s AND m.deleted_status = FALSE
            ORDER BY m.created_at DESC
            LIMIT %s;
        """,
            (user_id, limit),
        )
        return self.db.cursor.fetchall()

    def get_memo_by_id(self, memo_id: int):
        """Fetch a single memo by ID with user info"""
        self.db.cursor.execute(
            """
            SELECT m.id, m.title, m.content, m.user_id, m.deleted_status, m.created_at, m.updated_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, u.role, u.tel, u.created_at
            FROM memos m
            INNER JOIN users u ON m.user_id = u.id
            WHERE m.id = %s AND m.deleted_status = FALSE;
        """,
            (memo_id,),
        )
        return self.db.cursor.fetchone()

    def create_memo(self, title: str, content: str, user_id: int):
        """Create a new memo and return the created row"""
        self.db.cursor.execute(
            """
            INSERT INTO memos (title, content, user_id, deleted_status, created_at)
            VALUES (%s, %s, %s, FALSE, NOW())
            RETURNING id, title, content, user_id, deleted_status, created_at, updated_at;
        """,
            (title, content, user_id),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def update_memo(self, memo_id: int, title: str, content: str):
        """Update an existing memo"""
        self.db.cursor.execute(
            """
            UPDATE memos
            SET title = %s, content = %s, updated_at = NOW()
            WHERE id = %s AND deleted_status = FALSE
            RETURNING id, title, content, user_id, deleted_status, created_at, updated_at;
        """,
            (title, content, memo_id),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def delete_memo(self, memo_id: int):
        """Soft delete a memo"""
        self.db.cursor.execute(
            """
            UPDATE memos
            SET deleted_status = TRUE
            WHERE id = %s
            RETURNING id;
        """,
            (memo_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()
