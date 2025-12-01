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
    tab_id: int | None = None
    font_color: str | None = None
    deleted_status: bool = False
    collected: bool = False
    collected_time: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None


class CreateMemoRequest(BaseModel):
    title: str
    content: str
    tab_id: int | None = None
    font_color: str | None = None


class UpdateMemoRequest(BaseModel):
    title: str
    content: str
    font_color: str | None = None
