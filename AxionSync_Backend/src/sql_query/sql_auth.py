from src.database.connect import Database


class SQLAuth:
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

    def get_user_with_password(self, username: str):
        """Fetch user and password hash for verification in service layer.
        Returns a tuple ordered to match AuthService expectations.
        """
        self.db.cursor.execute(
            """
            SELECT id, username, firstname, lastname, nickname, role, tel, created_at, password
            FROM users
            WHERE username = %s;
        """,
            (username,),
        )
        return self.db.cursor.fetchone()
