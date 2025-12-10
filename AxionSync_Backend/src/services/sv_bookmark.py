from src.sql_query.sql_bookmark import SQLBookmark
from src.sql_query.sql_tag import SQLTag
from src.models.entity.en_bookmark import Bookmark
from src.models.entity.en_tag import Tag
from src.models.entity.en_user import User
from typing import Any
from datetime import datetime
import json


class BookmarkService:
    def __init__(self):
        self.sqlBookmark = SQLBookmark()
        self.sqlTag = SQLTag()

    def _row_to_bookmark(self, row, tags: list[Tag] | None = None) -> Bookmark:
        """Convert a database row to a Bookmark object"""
        user = User(
            id=row[24],
            username=row[25],
            firstname=row[26],
            lastname=row[27],
            nickname=row[28],
            role=row[29],
            tel=row[30],
            created_at=row[31],
            picture_url=row[32] or "unidentified.jpg",
        )

        # Parse JSON fields if they come back as strings
        watch_from = row[4]
        if isinstance(watch_from, str):
            try:
                watch_from = json.loads(watch_from)
            except (json.JSONDecodeError, TypeError):
                watch_from = None

        mood = row[13]
        if isinstance(mood, str):
            try:
                mood = json.loads(mood)
            except (json.JSONDecodeError, TypeError):
                mood = None

        return Bookmark(
            id=row[0],
            name=row[1],
            type=row[2],
            review=row[3],
            watch_from=watch_from,
            release_time=row[5],
            time_used=row[6],
            rating=float(row[7]) if row[7] is not None else None,
            story_rating=float(row[8]) if row[8] is not None else None,
            action_rating=float(row[9]) if row[9] is not None else None,
            graphic_rating=float(row[10]) if row[10] is not None else None,
            sound_rating=float(row[11]) if row[11] is not None else None,
            chapter=row[12],
            mood=mood,
            review_version=row[14] if row[14] is not None else 1,
            short_review=row[15],
            status=row[16],
            public=row[17],
            user=user,
            created_at=row[19],
            updated_at=row[20],
            cover_image=row[21],
            deleted_status=row[22],
            last_viewed_at=row[23],
            tags=tags or [],
        )

    def _get_tags_for_bookmark(self, bookmark_id: int) -> list[Tag]:
        """Get all tags for a bookmark"""
        rows = self.sqlTag.get_tags_for_bookmark(bookmark_id)
        tags = []
        for row in rows:
            tags.append(
                Tag(
                    id=row[0],
                    name=row[1],
                    tag_priority=row[2],
                )
            )
        return tags

    def get_bookmarks(
        self,
        user_id: int,
        limit: int = 100,
        bookmark_type: str | None = None,
        status: str | None = None,
        include_deleted: bool = False,
    ):
        """Get all bookmarks for a user"""
        rows = self.sqlBookmark.get_bookmarks(
            user_id, limit, bookmark_type, status, include_deleted
        )
        bookmarks = []

        for row in rows:
            tags = self._get_tags_for_bookmark(row[0])
            bookmarks.append(self._row_to_bookmark(row, tags))

        return bookmarks

    def get_public_bookmarks(self, limit: int = 100, bookmark_type: str | None = None):
        """Get public bookmarks"""
        rows = self.sqlBookmark.get_public_bookmarks(limit, bookmark_type)
        bookmarks = []

        for row in rows:
            tags = self._get_tags_for_bookmark(row[0])
            bookmarks.append(self._row_to_bookmark(row, tags))

        return bookmarks

    def get_bookmark_by_id(self, bookmark_id: int, include_deleted: bool = False):
        """Get a single bookmark by ID"""
        row = self.sqlBookmark.get_bookmark_by_id(bookmark_id, include_deleted)
        if not row:
            return None

        tags = self._get_tags_for_bookmark(bookmark_id)
        return self._row_to_bookmark(row, tags)

    def create_bookmark(
        self,
        name: str,
        bookmark_type: str,
        user_id: int,
        user: User,
        review: str | None = None,
        watch_from: dict[str, Any] | None = None,
        release_time: datetime | None = None,
        time_used: int | None = None,
        rating: float | None = None,
        story_rating: float | None = None,
        action_rating: float | None = None,
        graphic_rating: float | None = None,
        sound_rating: float | None = None,
        chapter: str | None = None,
        mood: list[str] | None = None,
        short_review: str | None = None,
        status: str = "PreWatch",
        public: bool = False,
        cover_image: str | None = None,
        tag_ids: list[int] = [],
    ):
        """Create a new bookmark"""
        row = self.sqlBookmark.create_bookmark(
            name=name,
            bookmark_type=bookmark_type,
            user_id=user_id,
            review=review,
            watch_from=watch_from,
            release_time=release_time,
            time_used=time_used,
            rating=rating,
            story_rating=story_rating,
            action_rating=action_rating,
            graphic_rating=graphic_rating,
            sound_rating=sound_rating,
            chapter=chapter,
            mood=mood,
            short_review=short_review,
            status=status,
            public=public,
            cover_image=cover_image,
        )
        if not row:
            return None

        bookmark_id = row[0]

        # Set tags if provided
        if tag_ids:
            self.sqlBookmark.set_bookmark_tags(bookmark_id, tag_ids)

        # Get the full bookmark with tags and user info
        return self.get_bookmark_by_id(bookmark_id)

    def update_bookmark(
        self,
        bookmark_id: int,
        user: User,
        name: str | None = None,
        bookmark_type: str | None = None,
        review: str | None = None,
        watch_from: dict[str, Any] | None = None,
        release_time: datetime | None = None,
        time_used: int | None = None,
        rating: float | None = None,
        story_rating: float | None = None,
        action_rating: float | None = None,
        graphic_rating: float | None = None,
        sound_rating: float | None = None,
        chapter: str | None = None,
        mood: list[str] | None = None,
        short_review: str | None = None,
        status: str | None = None,
        public: bool | None = None,
        cover_image: str | None = None,
        tag_ids: list[int] | None = None,
        update_watch_from: bool = False,
        update_mood: bool = False,
    ):
        """Update an existing bookmark"""
        row = self.sqlBookmark.update_bookmark(
            bookmark_id=bookmark_id,
            name=name,
            bookmark_type=bookmark_type,
            review=review,
            watch_from=watch_from,
            release_time=release_time,
            time_used=time_used,
            rating=rating,
            story_rating=story_rating,
            action_rating=action_rating,
            graphic_rating=graphic_rating,
            sound_rating=sound_rating,
            chapter=chapter,
            mood=mood,
            short_review=short_review,
            status=status,
            public=public,
            cover_image=cover_image,
            update_watch_from=update_watch_from,
            update_mood=update_mood,
        )
        if not row:
            return None

        # Update tags if provided
        if tag_ids is not None:
            self.sqlBookmark.set_bookmark_tags(bookmark_id, tag_ids)

        # Get the full bookmark with tags and user info
        return self.get_bookmark_by_id(bookmark_id)

    def soft_delete_bookmark(self, bookmark_id: int):
        """Soft delete a bookmark"""
        row = self.sqlBookmark.soft_delete_bookmark(bookmark_id)
        return row is not None

    def hard_delete_bookmark(self, bookmark_id: int):
        """Permanently delete a bookmark"""
        row = self.sqlBookmark.hard_delete_bookmark(bookmark_id)
        return row is not None

    def restore_bookmark(self, bookmark_id: int):
        """Restore a soft-deleted bookmark"""
        row = self.sqlBookmark.restore_bookmark(bookmark_id)
        if not row:
            return None

        return self.get_bookmark_by_id(bookmark_id, include_deleted=True)

    def update_last_viewed(self, bookmark_id: int):
        """Update the last_viewed_at timestamp"""
        row = self.sqlBookmark.update_last_viewed(bookmark_id)
        return row is not None

    def update_cover_image(self, bookmark_id: int, cover_image: str):
        """Update the cover image for a bookmark"""
        row = self.sqlBookmark.update_cover_image(bookmark_id, cover_image)
        if not row:
            return None

        return self.get_bookmark_by_id(bookmark_id)

    def add_tag_to_bookmark(self, bookmark_id: int, tag_id: int):
        """Add a tag to a bookmark"""
        row = self.sqlBookmark.add_tag_to_bookmark(bookmark_id, tag_id)
        return row is not None

    def remove_tag_from_bookmark(self, bookmark_id: int, tag_id: int):
        """Remove a tag from a bookmark"""
        row = self.sqlBookmark.remove_tag_from_bookmark(bookmark_id, tag_id)
        return row is not None

    def get_bookmarks_by_tag(
        self, tag_id: int, user_id: int | None = None, limit: int = 100
    ):
        """Get all bookmarks with a specific tag"""
        rows = self.sqlBookmark.get_bookmarks_by_tag(tag_id, user_id, limit)
        bookmarks = []

        for row in rows:
            tags = self._get_tags_for_bookmark(row[0])
            bookmarks.append(self._row_to_bookmark(row, tags))

        return bookmarks
