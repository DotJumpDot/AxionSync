from pydantic import BaseModel
from datetime import datetime


class User(BaseModel):
    id: int
    username: str
    firstname: str | None = None
    lastname: str | None = None
    nickname: str | None = None
    role: str = "user"
    tel: str | None = None
    created_at: datetime


class UserResponse(BaseModel):
    id: int
    username: str
    firstname: str | None = None
    lastname: str | None = None
    nickname: str | None = None
    role: str
    tel: str | None = None
    created_at: datetime

    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    username: str
    password: str
    firstname: str | None = None
    lastname: str | None = None
    nickname: str | None = None
    tel: str | None = None


class UserIdRequest(BaseModel):
    id: int
