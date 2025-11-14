from src.database.connect import Database


class SQLLogin:
    def __init__(self):
        self.db = Database()

    def login(self, username: str, password: str):
        self.db.cursor.execute(
            """
            SELECT id, username, firstname, lastname, nickname, role, tel, created_at
            FROM users
            WHERE username = %s AND password = %s;
        """,
            (username, password),
        )
        return self.db.cursor.fetchone()
