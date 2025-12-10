from src.database.connect import Database
from typing import Any
from datetime import datetime
import json


class SQLBookmark:
    def __init__(self):
        self.db = Database()

    def get_bookmarks(
        self,
        user_id: int,
        limit: int = 100,
        bookmark_type: str | None = None,
        status: str | None = None,
        include_deleted: bool = False,
    ):
        """Fetch bookmarks for a user with optional filters"""
        query = """
            SELECT b.id, b.name, b.type, b.review, b.watch_from, b.release_time, 
                   b.time_used, b.rating, b.story_rating, b.action_rating, 
                   b.graphic_rating, b.sound_rating, b.chapter, b.mood, 
                   b.review_version, b.short_review, b.status, b.public, 
                   b.user_id, b.created_at, b.updated_at, b.cover_image, 
                   b.deleted_status, b.last_viewed_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM bookmark b
            INNER JOIN "user" u ON b.user_id = u.id
            WHERE b.user_id = %s
        """
        params: list[Any] = [user_id]

        if not include_deleted:
            query += " AND b.deleted_status = FALSE"

        if bookmark_type is not None:
            query += " AND b.type = %s"
            params.append(bookmark_type)

        if status is not None:
            query += " AND b.status = %s"
            params.append(status)

        query += " ORDER BY b.created_at DESC LIMIT %s;"
        params.append(limit)

        self.db.cursor.execute(query, tuple(params))
        return self.db.cursor.fetchall()

    def get_public_bookmarks(self, limit: int = 100, bookmark_type: str | None = None):
        """Fetch public bookmarks"""
        query = """
            SELECT b.id, b.name, b.type, b.review, b.watch_from, b.release_time, 
                   b.time_used, b.rating, b.story_rating, b.action_rating, 
                   b.graphic_rating, b.sound_rating, b.chapter, b.mood, 
                   b.review_version, b.short_review, b.status, b.public, 
                   b.user_id, b.created_at, b.updated_at, b.cover_image, 
                   b.deleted_status, b.last_viewed_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM bookmark b
            INNER JOIN "user" u ON b.user_id = u.id
            WHERE b.public = TRUE AND b.deleted_status = FALSE
        """
        params: list[Any] = []

        if bookmark_type is not None:
            query += " AND b.type = %s"
            params.append(bookmark_type)

        query += " ORDER BY b.created_at DESC LIMIT %s;"
        params.append(limit)

        self.db.cursor.execute(query, tuple(params))
        return self.db.cursor.fetchall()

    def get_bookmark_by_id(self, bookmark_id: int, include_deleted: bool = False):
        """Fetch a single bookmark by ID with user info"""
        query = """
            SELECT b.id, b.name, b.type, b.review, b.watch_from, b.release_time, 
                   b.time_used, b.rating, b.story_rating, b.action_rating, 
                   b.graphic_rating, b.sound_rating, b.chapter, b.mood, 
                   b.review_version, b.short_review, b.status, b.public, 
                   b.user_id, b.created_at, b.updated_at, b.cover_image, 
                   b.deleted_status, b.last_viewed_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM bookmark b
            INNER JOIN "user" u ON b.user_id = u.id
            WHERE b.id = %s
        """
        if not include_deleted:
            query += " AND b.deleted_status = FALSE"
        query += ";"

        self.db.cursor.execute(query, (bookmark_id,))
        return self.db.cursor.fetchone()

    def create_bookmark(
        self,
        name: str,
        bookmark_type: str,
        user_id: int,
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
    ):
        """Create a new bookmark and return the created row"""
        watch_from_json = json.dumps(watch_from) if watch_from else None
        mood_json = json.dumps(mood) if mood else None

        self.db.cursor.execute(
            """
            INSERT INTO bookmark (
                name, type, review, watch_from, release_time, time_used,
                rating, story_rating, action_rating, graphic_rating, sound_rating,
                chapter, mood, review_version, short_review, status, public,
                user_id, cover_image, deleted_status, created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, %s, %s, %s, %s, %s, FALSE, NOW())
            RETURNING id, name, type, review, watch_from, release_time, 
                      time_used, rating, story_rating, action_rating, 
                      graphic_rating, sound_rating, chapter, mood, 
                      review_version, short_review, status, public, 
                      user_id, created_at, updated_at, cover_image, 
                      deleted_status, last_viewed_at;
        """,
            (
                name,
                bookmark_type,
                review,
                watch_from_json,
                release_time,
                time_used,
                rating,
                story_rating,
                action_rating,
                graphic_rating,
                sound_rating,
                chapter,
                mood_json,
                short_review,
                status,
                public,
                user_id,
                cover_image,
            ),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def update_bookmark(
        self,
        bookmark_id: int,
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
        update_watch_from: bool = False,
        update_mood: bool = False,
    ):
        """Update an existing bookmark - auto increments review_version"""
        updates = ["updated_at = NOW()", "review_version = review_version + 1"]
        params: list[Any] = []

        if name is not None:
            updates.append("name = %s")
            params.append(name)

        if bookmark_type is not None:
            updates.append("type = %s")
            params.append(bookmark_type)

        if review is not None:
            updates.append("review = %s")
            params.append(review)

        if update_watch_from:
            updates.append("watch_from = %s")
            params.append(json.dumps(watch_from) if watch_from else None)

        if release_time is not None:
            updates.append("release_time = %s")
            params.append(release_time)

        if time_used is not None:
            updates.append("time_used = %s")
            params.append(time_used)

        if rating is not None:
            updates.append("rating = %s")
            params.append(rating)

        if story_rating is not None:
            updates.append("story_rating = %s")
            params.append(story_rating)

        if action_rating is not None:
            updates.append("action_rating = %s")
            params.append(action_rating)

        if graphic_rating is not None:
            updates.append("graphic_rating = %s")
            params.append(graphic_rating)

        if sound_rating is not None:
            updates.append("sound_rating = %s")
            params.append(sound_rating)

        if chapter is not None:
            updates.append("chapter = %s")
            params.append(chapter)

        if update_mood:
            updates.append("mood = %s")
            params.append(json.dumps(mood) if mood else None)

        if short_review is not None:
            updates.append("short_review = %s")
            params.append(short_review)

        if status is not None:
            updates.append("status = %s")
            params.append(status)

        if public is not None:
            updates.append("public = %s")
            params.append(public)

        if cover_image is not None:
            updates.append("cover_image = %s")
            params.append(cover_image)

        params.append(bookmark_id)

        query = f"""
            UPDATE bookmark
            SET {", ".join(updates)}
            WHERE id = %s AND deleted_status = FALSE
            RETURNING id, name, type, review, watch_from, release_time, 
                      time_used, rating, story_rating, action_rating, 
                      graphic_rating, sound_rating, chapter, mood, 
                      review_version, short_review, status, public, 
                      user_id, created_at, updated_at, cover_image, 
                      deleted_status, last_viewed_at;
        """

        self.db.cursor.execute(query, tuple(params))
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def soft_delete_bookmark(self, bookmark_id: int):
        """Soft delete a bookmark"""
        self.db.cursor.execute(
            """
            UPDATE bookmark
            SET deleted_status = TRUE, updated_at = NOW()
            WHERE id = %s
            RETURNING id;
        """,
            (bookmark_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def hard_delete_bookmark(self, bookmark_id: int):
        """Permanently delete a bookmark"""
        self.db.cursor.execute(
            """
            DELETE FROM bookmark
            WHERE id = %s
            RETURNING id;
        """,
            (bookmark_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def restore_bookmark(self, bookmark_id: int):
        """Restore a soft-deleted bookmark"""
        self.db.cursor.execute(
            """
            UPDATE bookmark
            SET deleted_status = FALSE, updated_at = NOW()
            WHERE id = %s
            RETURNING id, name, type, review, watch_from, release_time, 
                      time_used, rating, story_rating, action_rating, 
                      graphic_rating, sound_rating, chapter, mood, 
                      review_version, short_review, status, public, 
                      user_id, created_at, updated_at, cover_image, 
                      deleted_status, last_viewed_at;
        """,
            (bookmark_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def update_last_viewed(self, bookmark_id: int):
        """Update the last_viewed_at timestamp"""
        self.db.cursor.execute(
            """
            UPDATE bookmark
            SET last_viewed_at = NOW()
            WHERE id = %s AND deleted_status = FALSE
            RETURNING id;
        """,
            (bookmark_id,),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def update_cover_image(self, bookmark_id: int, cover_image: str):
        """Update the cover image for a bookmark"""
        self.db.cursor.execute(
            """
            UPDATE bookmark
            SET cover_image = %s, updated_at = NOW()
            WHERE id = %s AND deleted_status = FALSE
            RETURNING id, name, type, review, watch_from, release_time, 
                      time_used, rating, story_rating, action_rating, 
                      graphic_rating, sound_rating, chapter, mood, 
                      review_version, short_review, status, public, 
                      user_id, created_at, updated_at, cover_image, 
                      deleted_status, last_viewed_at;
        """,
            (cover_image, bookmark_id),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    # ===========================
    #    BOOKMARK-TAG OPERATIONS
    # ===========================

    def add_tag_to_bookmark(self, bookmark_id: int, tag_id: int):
        """Add a tag to a bookmark"""
        self.db.cursor.execute(
            """
            INSERT INTO bookmark_tag (bookmark_id, tag_id)
            VALUES (%s, %s)
            ON CONFLICT (bookmark_id, tag_id) DO NOTHING
            RETURNING bookmark_id, tag_id;
        """,
            (bookmark_id, tag_id),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def remove_tag_from_bookmark(self, bookmark_id: int, tag_id: int):
        """Remove a tag from a bookmark"""
        self.db.cursor.execute(
            """
            DELETE FROM bookmark_tag
            WHERE bookmark_id = %s AND tag_id = %s
            RETURNING bookmark_id, tag_id;
        """,
            (bookmark_id, tag_id),
        )
        self.db.connection.commit()
        return self.db.cursor.fetchone()

    def set_bookmark_tags(self, bookmark_id: int, tag_ids: list[int]):
        """Set all tags for a bookmark (replaces existing tags)"""
        # First, remove all existing tags
        self.db.cursor.execute(
            """
            DELETE FROM bookmark_tag
            WHERE bookmark_id = %s;
        """,
            (bookmark_id,),
        )

        # Then, add new tags
        if tag_ids:
            values = [(bookmark_id, tag_id) for tag_id in tag_ids]
            self.db.cursor.executemany(
                """
                INSERT INTO bookmark_tag (bookmark_id, tag_id)
                VALUES (%s, %s)
                ON CONFLICT (bookmark_id, tag_id) DO NOTHING;
            """,
                values,
            )

        self.db.connection.commit()

    def get_bookmarks_by_tag(
        self, tag_id: int, user_id: int | None = None, limit: int = 100
    ):
        """Get all bookmarks with a specific tag"""
        query = """
            SELECT b.id, b.name, b.type, b.review, b.watch_from, b.release_time, 
                   b.time_used, b.rating, b.story_rating, b.action_rating, 
                   b.graphic_rating, b.sound_rating, b.chapter, b.mood, 
                   b.review_version, b.short_review, b.status, b.public, 
                   b.user_id, b.created_at, b.updated_at, b.cover_image, 
                   b.deleted_status, b.last_viewed_at,
                   u.id, u.username, u.firstname, u.lastname, u.nickname, 
                   u.role, u.tel, u.created_at, u.picture_url
            FROM bookmark b
            INNER JOIN "user" u ON b.user_id = u.id
            INNER JOIN bookmark_tag bt ON b.id = bt.bookmark_id
            WHERE bt.tag_id = %s AND b.deleted_status = FALSE
        """
        params: list[Any] = [tag_id]

        if user_id is not None:
            query += " AND b.user_id = %s"
            params.append(user_id)

        query += " ORDER BY b.created_at DESC LIMIT %s;"
        params.append(limit)

        self.db.cursor.execute(query, tuple(params))
        return self.db.cursor.fetchall()
