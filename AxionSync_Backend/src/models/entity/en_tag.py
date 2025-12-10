from pydantic import BaseModel

try:
    from pydantic import ConfigDict  # pydantic v2
except ImportError:  # fallback pydantic v1
    ConfigDict = None  # type: ignore


class Tag(BaseModel):
    """
    Tag entity model

    Fields:
    - id: int - Primary key, auto-incremented
    - name: str - Unique tag name
    - tag_priority: int - Priority for ordering (default: 0)
    """

    id: int
    name: str
    tag_priority: int = 0


class CreateTagRequest(BaseModel):
    """
    Request model for creating a tag

    Fields:
    - name: str (required) - Unique tag name
    - tag_priority: int (optional) - Priority for ordering (default: 0)
    """

    name: str
    tag_priority: int = 0


class UpdateTagRequest(BaseModel):
    """
    Request model for updating a tag

    Fields:
    - name: str (optional) - New tag name
    - tag_priority: int (optional) - New priority value
    """

    name: str | None = None
    tag_priority: int | None = None
