from src.database.connect import Database


class SQLUser:
    def __init__(self):
        self.db = Database()

    def get_users(self):
        self.db.cursor.execute(
            """
            SELECT id, username, firstname, lastname, nickname, role, tel, created_at
            FROM users;
        """
        )
        return self.db.cursor.fetchall()

    def get_user_by_id(self, user_id: int):
        self.db.cursor.execute(
            """
            SELECT id, username, firstname, lastname, nickname, role, tel, created_at
            FROM users
            WHERE id = %s;
        """,
            (user_id,),
        )
        return self.db.cursor.fetchone()
