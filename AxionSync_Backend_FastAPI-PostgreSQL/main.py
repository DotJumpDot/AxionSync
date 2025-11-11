# fastapi dev main.py
# uvicorn main:app --reload

# python -m venv venv
# venv\Scripts\activate
# pip install fastapi uvicorn
# deactivate

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.user_service import UserService

from database.conn import Database
from models.login_request import LoginRequest

import uvicorn

app = FastAPI()
user_service = UserService()

db_con = Database() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello AxionSync API"}

@app.get("/users")
def get_users():
    return user_service.get_users()

@app.get("/users/{user_id}")
def get_user_by_id(user_id: int):
    return user_service.get_user_by_id(user_id)

@app.post("/login")
def login_user(data: LoginRequest):
    return user_service.login(data.username, data.password)



if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=80, reload=True)
