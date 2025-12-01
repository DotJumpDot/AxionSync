from src.sql_query.sql_user import SQLUser

from src.models.entity.en_user import User


class UserService:
    def __init__(self):
        self.sqlUser = SQLUser()

    def get_users(self):
        rows = self.sqlUser.get_users()
        users = []

        for row in rows:
            users.append(
                User(
                    id=row[0],
                    username=row[1],
                    firstname=row[2],
                    lastname=row[3],
                    nickname=row[4],
                    role=row[5],
                    tel=row[6],
                    created_at=row[7],
                )
            )

        return users

    def get_user_by_id(self, user_id: int):
        row = self.sqlUser.get_user_by_id(user_id)
        if not row:
            return None

        return User(
            id=row[0],
            username=row[1],
            firstname=row[2],
            lastname=row[3],
            nickname=row[4],
            role=row[5],
            tel=row[6],
            created_at=row[7],
        )

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
        row = self.sqlUser.create_user(
            username, password_hash, firstname, lastname, nickname, role, tel
        )
        if not row:
            return None
        return User(
            id=row[0],
            username=row[1],
            firstname=row[2],
            lastname=row[3],
            nickname=row[4],
            role=row[5],
            tel=row[6],
            created_at=row[7],
        )

    def update_user(
        self,
        user_id: int,
        firstname=None,
        lastname=None,
        nickname=None,
        role=None,
        tel=None,
    ):
        row = self.sqlUser.update_user(
            user_id, firstname, lastname, nickname, role, tel
        )
        if not row:
            return None
        return User(
            id=row[0],
            username=row[1],
            firstname=row[2],
            lastname=row[3],
            nickname=row[4],
            role=row[5],
            tel=row[6],
            created_at=row[7],
            updated_at=row[8],
        )

    def delete_user(self, user_id: int):
        row = self.sqlUser.delete_user(user_id)
        return row is not None
