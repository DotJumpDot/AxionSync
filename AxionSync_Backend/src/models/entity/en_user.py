from pydantic import BaseModel

try:
    from pydantic import ConfigDict  # pydantic v2
except ImportError:  # fallback pydantic v1
    ConfigDict = None  # type: ignore
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

    # Pydantic v2 config
    if ConfigDict is not None:
        model_config = ConfigDict(from_attributes=True)
    else:

        class Config:  # type: ignore
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
