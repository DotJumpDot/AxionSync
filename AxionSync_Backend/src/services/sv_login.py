from src.sql_query.sql_login import SQLLogin

from src.models.entity.en_user import User


class LoginService:
    def __init__(self):
        self.sqlLogin = SQLLogin()

    def login(self, username: str, password: str):
        row = self.sqlLogin.login(username, password)
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
