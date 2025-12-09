from src.sql_query.sql_user import SQLUser
from src.models.entity.en_user import User
from passlib.hash import bcrypt


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
                    picture_url=row[7] or "unidentified.jpg",
                    created_at=row[8],
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
            picture_url=row[7] or "unidentified.jpg",
            created_at=row[8],
            updated_at=row[9] if len(row) > 9 else None,
        )

    def create_user(
        self,
        username: str,
        password: str,
        firstname=None,
        lastname=None,
        nickname=None,
        role="user",
        tel=None,
        picture_url=None,
    ):
        # Hash the password before storing
        password_hash = bcrypt.hash(password)
        row = self.sqlUser.create_user(
            username,
            password_hash,
            firstname,
            lastname,
            nickname,
            role,
            tel,
            picture_url,
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
            picture_url=row[7] or "unidentified.jpg",
            created_at=row[8],
        )

    def check_username_exists(self, username: str) -> bool:
        return self.sqlUser.check_username_exists(username)

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
            picture_url=row[7] or "unidentified.jpg",
            created_at=row[8],
            updated_at=row[9],
        )

    def update_user_profile(
        self,
        user_id: int,
        firstname=None,
        lastname=None,
        nickname=None,
        tel=None,
    ):
        row = self.sqlUser.update_user_profile(
            user_id, firstname, lastname, nickname, tel
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
            picture_url=row[7] or "unidentified.jpg",
            created_at=row[8],
            updated_at=row[9],
        )

    def update_user_picture(self, user_id: int, picture_url: str):
        row = self.sqlUser.update_user_picture(user_id, picture_url)
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
            picture_url=row[7] or "unidentified.jpg",
            created_at=row[8],
            updated_at=row[9],
        )

    def delete_user(self, user_id: int):
        row = self.sqlUser.delete_user(user_id)
        return row is not None
