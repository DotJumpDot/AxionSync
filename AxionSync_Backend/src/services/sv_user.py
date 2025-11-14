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
