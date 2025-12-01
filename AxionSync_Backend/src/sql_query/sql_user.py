from src.database.connect import Database


class SQLUser:
    def __init__(self):
        self.db = Database()

    def get_users(self):
        self.db.cursor.execute(
            """
            SELECT id, username, firstname, lastname, nickname, role, tel, created_at
            FROM "user";
        """
        )
        return self.db.cursor.fetchall()

    def get_user_by_id(self, user_id: int):
        self.db.cursor.execute(
            """
            SELECT id, username, firstname, lastname, nickname, role, tel, created_at
            FROM "user"
            WHERE id = %s;
        """,
            (user_id,),
        )
        return self.db.cursor.fetchone()

    def create_user(
        self,
        username: str,
        password_hash: str,
        firstname=None,
        lastname=None,
        nickname=None,
        role="user",
        tel=None,
    ):
        self.db.cursor.execute(
            """
                INSERT INTO "user" (username, password_hash, firstname, lastname, nickname, role, tel, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id, username, firstname, lastname, nickname, role, tel, created_at;
                """,
            (username, password_hash, firstname, lastname, nickname, role, tel),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def update_user(
        self,
        user_id: int,
        firstname=None,
        lastname=None,
        nickname=None,
        role=None,
        tel=None,
    ):
        self.db.cursor.execute(
            """
                UPDATE "user"
                SET firstname = %s, lastname = %s, nickname = %s, role = %s, tel = %s, updated_at = NOW()
                WHERE id = %s
                RETURNING id, username, firstname, lastname, nickname, role, tel, created_at, updated_at;
                """,
            (firstname, lastname, nickname, role, tel, user_id),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def delete_user(self, user_id: int):
        self.db.cursor.execute(
            """
                DELETE FROM "user"
                WHERE id = %s
                RETURNING id;
                """,
            (user_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()
