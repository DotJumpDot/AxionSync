from src.sql_query.sql_auth import SQLAuth
from src.models.entity.en_user import User
from passlib.hash import bcrypt


class AuthService:
    def __init__(self):
        self.sqlAuth = SQLAuth()

    def login(self, username: str, password: str):
        # Fetch user row including stored password (hashed or plain)
        row = self.sqlAuth.get_user_with_password(username)
        if not row:
            return None

        stored_password = row[8]

        # Verify bcrypt hash if present; otherwise fallback to plain compare
        is_valid = False
        try:
            if isinstance(stored_password, str) and stored_password.startswith("$2"):
                is_valid = bcrypt.verify(password, stored_password)
            else:
                is_valid = stored_password == password
        except Exception:
            is_valid = False

        if not is_valid:
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
