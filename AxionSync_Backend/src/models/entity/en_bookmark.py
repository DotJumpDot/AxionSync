from pydantic import BaseModel, Field
from typing import Any
from datetime import datetime

from src.models.entity.en_tag import Tag
from src.models.entity.en_user import User

try:
    from pydantic import ConfigDict  # pydantic v2
except ImportError:  # fallback pydantic v1
    ConfigDict = None  # type: ignore


# Enum-like constants for type and status validation
BOOKMARK_TYPES = ["Game", "Movie", "Novel", "Manga", "Manhwa", "Anime", "Series"]
BOOKMARK_STATUSES = ["onGoing", "Finished", "PreWatch", "Dropped"]
BOOKMARK_MOODS = [
    "happy",
    "sad",
    "excited",
    "boring",
    "fun",
    "serious",
    "mind-blown",
    "emotional",
    "heartwarming",
    "tragic",
    "thrilling",
    "suspenseful",
    "scary",
    "satisfied",
    "unsatisfied",
    "disappointed",
    "impressed",
    "addicted",
    "confusing",
    "thought-provoking",
    "deep",
    "chill",
    "feel-good",
]

# Fields applicable per type - used for filtering form fields
TYPE_FIELDS = {
    "Game": [
        "rating",
        "story_rating",
        "action_rating",
        "graphic_rating",
        "sound_rating",
        "time_used",
        "chapter",
        "mood",
        "review",
        "short_review",
    ],
    "Movie": [
        "rating",
        "story_rating",
        "action_rating",
        "graphic_rating",
        "sound_rating",
        "time_used",
        "mood",
        "review",
        "short_review",
    ],
    "Novel": ["rating", "story_rating", "chapter", "mood", "review", "short_review"],
    "Manga": [
        "rating",
        "story_rating",
        "graphic_rating",
        "chapter",
        "mood",
        "review",
        "short_review",
    ],
    "Manhwa": [
        "rating",
        "story_rating",
        "graphic_rating",
        "chapter",
        "mood",
        "review",
        "short_review",
    ],
    "Anime": [
        "rating",
        "story_rating",
        "action_rating",
        "graphic_rating",
        "sound_rating",
        "chapter",
        "mood",
        "review",
        "short_review",
    ],
    "Series": [
        "rating",
        "story_rating",
        "action_rating",
        "graphic_rating",
        "sound_rating",
        "chapter",
        "mood",
        "review",
        "short_review",
    ],
}


class Bookmark(BaseModel):
    """
    Bookmark entity model
    """

    id: int  # Primary key
    name: str  # Name of the bookmark item
    type: str  # Type enum: Game, Movie, Novel, Manga, Manhwa, Anime, Series
    review: str | None = None  # Full review text
    watch_from: dict[str, Any] | None = None  # JSONB field for platform info
    release_time: datetime | None = None  # Release date of the content
    time_used: int | None = None  # Time spent in minutes
    rating: float | None = Field(None, ge=0, le=10)  # Overall rating 0-10
    story_rating: float | None = Field(None, ge=0, le=10)  # Story rating 0-10
    action_rating: float | None = Field(None, ge=0, le=10)  # Action rating 0-10
    graphic_rating: float | None = Field(
        None, ge=0, le=10
    )  # Graphics/visuals rating 0-10
    sound_rating: float | None = Field(None, ge=0, le=10)  # Sound/music rating 0-10
    chapter: str | None = None  # Current chapter/episode
    mood: list[str] | None = None  # Mood tags (max 5, from BOOKMARK_MOODS)
    review_version: int = 1  # Auto-incremented version number
    short_review: str | None = None  # Brief summary review
    status: str = "PreWatch"  # Status enum: onGoing, Finished, PreWatch, Dropped
    public: bool = False  # Whether bookmark is public
    user: User  # Owner of the bookmark
    created_at: datetime  # Creation timestamp
    updated_at: datetime | None = None  # Last update timestamp
    cover_image: str | None = None  # Cover image filename
    deleted_status: bool = False  # Soft delete flag
    last_viewed_at: datetime | None = None  # Last time user viewed this bookmark
    tags: list[Tag] = []  # Associated tags


class CreateBookmarkRequest(BaseModel):
    """
    Request model for creating a bookmark
    """

    name: str  # (required) - Name of the bookmark item
    type: (
        str  # (required) - Type enum: Game, Movie, Novel, Manga, Manhwa, Anime, Series
    )
    review: str | None = None  # (optional) - Full review text
    watch_from: dict[str, Any] | None = (
        None  # (optional) - JSONB field for platform info
    )
    release_time: datetime | None = None  # (optional) - Release date
    time_used: int | None = None  # (optional) - Time spent in minutes
    rating: float | None = Field(None, ge=0, le=10)  # (optional) - Overall rating 0-10
    story_rating: float | None = Field(
        None, ge=0, le=10
    )  # (optional) - Story rating 0-10
    action_rating: float | None = Field(
        None, ge=0, le=10
    )  # (optional) - Action rating 0-10
    graphic_rating: float | None = Field(
        None, ge=0, le=10
    )  # (optional) - Graphics/visuals rating 0-10
    sound_rating: float | None = Field(
        None, ge=0, le=10
    )  # (optional) - Sound/music rating 0-10
    chapter: str | None = None  # (optional) - Current chapter/episode
    mood: list[str] | None = None  # (optional) - Mood tags (max 5, from BOOKMARK_MOODS)
    short_review: str | None = None  # (optional) - Brief summary review
    status: str = "PreWatch"  # (optional, default: "PreWatch") - Status enum
    public: bool = False  # (optional, default: false) - Whether bookmark is public
    cover_image: str | None = None  # (optional) - Cover image filename
    tag_ids: list[int] = []  # (optional) - List of tag IDs to associate


class UpdateBookmarkRequest(BaseModel):
    """
    Request model for updating a bookmark

    All fields are optional - only provided fields will be updated
    """

    name: str | None = None
    type: str | None = None
    review: str | None = None
    watch_from: dict[str, Any] | None = None
    release_time: datetime | None = None
    time_used: int | None = None
    rating: float | None = Field(None, ge=0, le=10)
    story_rating: float | None = Field(None, ge=0, le=10)
    action_rating: float | None = Field(None, ge=0, le=10)
    graphic_rating: float | None = Field(None, ge=0, le=10)
    sound_rating: float | None = Field(None, ge=0, le=10)
    chapter: str | None = None
    mood: list[str] | None = None  # (optional) - Mood tags (max 5)
    short_review: str | None = None
    status: str | None = None
    public: bool | None = None
    cover_image: str | None = None
    tag_ids: list[int] | None = None
