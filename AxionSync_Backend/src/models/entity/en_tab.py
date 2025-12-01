from pydantic import BaseModel

try:
    from pydantic import ConfigDict  # pydantic v2
except ImportError:  # fallback pydantic v1
    ConfigDict = None  # type: ignore


class Tab(BaseModel):
    id: int
    tab_name: str
    color: str
    user_id: int
    font_name: str
    font_size: int


class CreateTabRequest(BaseModel):
    tab_name: str
    color: str
    font_name: str
    font_size: int


class UpdateTabRequest(BaseModel):
    tab_name: str
    color: str
    font_name: str
    font_size: int
