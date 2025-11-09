from database.conn import Database

class UserService:
    def __init__(self):
        self.db = Database()

    def get_users(self):
        try:
            self.db.cursor.execute("""
                SELECT id, username, firstname, lastname, nickname, role, tel
                FROM users;
            """)
            rows = self.db.cursor.fetchall()
            users = []
            for row in rows:
                users.append({
                    "id": row[0],
                    "username": row[1],
                    "firstname": row[2],
                    "lastname": row[3],
                    "nickname": row[4],
                    "role": row[5],
                    "tel": row[6]
                })
            return users
        except Exception as e:
            print(f"Error fetching users: {e}")
            return []

    def get_user_by_id(self, user_id: int):
        try:
            self.db.cursor.execute("""
                SELECT id, username, firstname, lastname, nickname, role, tel
                FROM users
                WHERE id = %s;
            """, (user_id,))
            row = self.db.cursor.fetchone()
            if row:
                return {
                    "id": row[0],
                    "username": row[1],
                    "firstname": row[2],
                    "lastname": row[3],
                    "nickname": row[4],
                    "role": row[5],
                    "tel": row[6]
                }
            return {"message": "User not found"}
        except Exception as e:
            print(f"Error fetching user by ID: {e}")
            return {"message": "Error"}

    # ✅ ตรวจสอบล็อกอิน (username + password)
    def login(self, username: str, password: str):
        try:
            self.db.cursor.execute("""
                SELECT id, username, firstname, lastname, nickname, role, tel
                FROM users
                WHERE username = %s AND password = %s;
            """, (username, password))
            row = self.db.cursor.fetchone()
            if row:
                return {
                    "success": True,
                    "user": {
                        "id": row[0],
                        "username": row[1],
                        "firstname": row[2],
                        "lastname": row[3],
                        "nickname": row[4],
                        "role": row[5],
                        "tel": row[6]
                    }
                }
            return {"success": False, "message": "Invalid username or password"}
        except Exception as e:
            print(f"Error during login: {e}")
            return {"success": False, "message": "Error checking login"}
        