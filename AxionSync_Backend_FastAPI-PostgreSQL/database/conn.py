import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()  # โหลดค่าจาก .env

print(os.getenv("DB_HOST"))
print(os.getenv("DB_NAME"))
print(os.getenv("DB_USER"))
print(os.getenv("DB_PASSWORD"))
print(os.getenv("DB_PORT"))

class Database:
    def __init__(self):
        self.connection = None
        self.cursor = None
        try:
            self.connection = psycopg2.connect(
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                port=os.getenv("DB_PORT")
            )
            self.connection.autocommit = True
            self.cursor = self.connection.cursor()
            print("Database connected")
        except Exception as e:
            print(f"Cannot connect to database: {e}")


    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
            print("Database connection closed")
            
    def fetch_users(self):
        try:
            self.cursor.execute("SELECT id, username, firstname, lastname, nickname, role, tel FROM users;")
            rows = self.cursor.fetchall()
            # แปลงเป็น list ของ dict เพื่อให้ FastAPI return JSON ได้ง่าย
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
