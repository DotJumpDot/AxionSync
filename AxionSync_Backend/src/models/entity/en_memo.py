from pydantic import BaseModel

from src.models.entity.en_user import User

try:
    from pydantic import ConfigDict  # pydantic v2
except ImportError:  # fallback pydantic v1
    ConfigDict = None  # type: ignore
from datetime import datetime


class Memo(BaseModel):
    id: int
    title: str
    content: str
    user: User
    deleted_status: bool = False
    created_at: datetime
    updated_at: datetime | None = None


class CreateMemoRequest(BaseModel):
    title: str
    content: str


class UpdateMemoRequest(BaseModel):
    title: str
    content: str
