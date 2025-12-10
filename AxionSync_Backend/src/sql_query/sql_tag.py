from src.database.connect import Database


class SQLTag:
    def __init__(self):
        self.db = Database()

    def get_tags(self):
        """Fetch all tags ordered by priority and name"""
        self.db.cursor.execute(
            """
            SELECT id, name, tag_priority
            FROM tag
            ORDER BY tag_priority DESC, name ASC;
        """
        )
        return self.db.cursor.fetchall()

    def get_tag_by_id(self, tag_id: int):
        """Fetch a single tag by ID"""
        self.db.cursor.execute(
            """
            SELECT id, name, tag_priority
            FROM tag
            WHERE id = %s;
        """,
            (tag_id,),
        )
        return self.db.cursor.fetchone()

    def get_tag_by_name(self, name: str):
        """Fetch a single tag by name"""
        self.db.cursor.execute(
            """
            SELECT id, name, tag_priority
            FROM tag
            WHERE name = %s;
        """,
            (name,),
        )
        return self.db.cursor.fetchone()

    def create_tag(self, name: str, tag_priority: int = 0):
        """Create a new tag and return the created row"""
        self.db.cursor.execute(
            """
            INSERT INTO tag (name, tag_priority)
            VALUES (%s, %s)
            RETURNING id, name, tag_priority;
        """,
            (name, tag_priority),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def update_tag(
        self, tag_id: int, name: str | None = None, tag_priority: int | None = None
    ):
        """Update an existing tag"""
        # Build dynamic update query
        updates = []
        params = []

        if name is not None:
            updates.append("name = %s")
            params.append(name)

        if tag_priority is not None:
            updates.append("tag_priority = %s")
            params.append(tag_priority)

        if not updates:
            return self.get_tag_by_id(tag_id)

        params.append(tag_id)
        query = f"""
            UPDATE tag
            SET {", ".join(updates)}
            WHERE id = %s
            RETURNING id, name, tag_priority;
        """

        self.db.cursor.execute(query, tuple(params))
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def delete_tag(self, tag_id: int):
        """Hard delete a tag"""
        self.db.cursor.execute(
            """
            DELETE FROM tag
            WHERE id = %s
            RETURNING id;
        """,
            (tag_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def get_tags_for_bookmark(self, bookmark_id: int):
        """Get all tags for a specific bookmark"""
        self.db.cursor.execute(
            """
            SELECT t.id, t.name, t.tag_priority
            FROM tag t
            INNER JOIN bookmark_tag bt ON t.id = bt.tag_id
            WHERE bt.bookmark_id = %s
            ORDER BY t.tag_priority DESC, t.name ASC;
        """,
            (bookmark_id,),
        )
        return self.db.cursor.fetchall()
