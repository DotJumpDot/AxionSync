from src.database.connect import Database


class SQLTab:
    def __init__(self):
        self.db = Database()

    def get_tabs(self, user_id: int):
        """Fetch all tabs for a user"""
        self.db.cursor.execute(
            """
            SELECT id, tab_name, color, user_id, font_name, font_size
            FROM tab
            WHERE user_id = %s
            ORDER BY id ASC;
        """,
            (user_id,),
        )
        return self.db.cursor.fetchall()

    def get_tab_by_id(self, tab_id: int):
        """Fetch a single tab by ID"""
        self.db.cursor.execute(
            """
            SELECT id, tab_name, color, user_id, font_name, font_size
            FROM tab
            WHERE id = %s;
        """,
            (tab_id,),
        )
        return self.db.cursor.fetchone()

    def create_tab(
        self, tab_name: str, color: str, user_id: int, font_name: str, font_size: int
    ):
        """Create a new tab and return the created row"""
        self.db.cursor.execute(
            """
            INSERT INTO tab (tab_name, color, user_id, font_name, font_size)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, tab_name, color, user_id, font_name, font_size;
        """,
            (tab_name, color, user_id, font_name, font_size),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def update_tab(
        self, tab_id: int, tab_name: str, color: str, font_name: str, font_size: int
    ):
        """Update an existing tab"""
        self.db.cursor.execute(
            """
            UPDATE tab
            SET tab_name = %s, color = %s, font_name = %s, font_size = %s
            WHERE id = %s
            RETURNING id, tab_name, color, user_id, font_name, font_size;
        """,
            (tab_name, color, font_name, font_size, tab_id),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def delete_tab(self, tab_id: int):
        """Delete a tab"""
        self.db.cursor.execute(
            """
            DELETE FROM tab
            WHERE id = %s
            RETURNING id;
        """,
            (tab_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()
