from src.sql_query.sql_tag import SQLTag
from src.models.entity.en_tag import Tag


class TagService:
    def __init__(self):
        self.sqlTag = SQLTag()

    def get_tags(self):
        """Get all tags"""
        rows = self.sqlTag.get_tags()
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

    def get_tag_by_id(self, tag_id: int):
        """Get a single tag by ID"""
        row = self.sqlTag.get_tag_by_id(tag_id)
        if not row:
            return None

        return Tag(
            id=row[0],
            name=row[1],
            tag_priority=row[2],
        )

    def get_tag_by_name(self, name: str):
        """Get a single tag by name"""
        row = self.sqlTag.get_tag_by_name(name)
        if not row:
            return None

        return Tag(
            id=row[0],
            name=row[1],
            tag_priority=row[2],
        )

    def create_tag(self, name: str, tag_priority: int = 0):
        """Create a new tag"""
        row = self.sqlTag.create_tag(name, tag_priority)
        if not row:
            return None

        return Tag(
            id=row[0],
            name=row[1],
            tag_priority=row[2],
        )

    def update_tag(
        self, tag_id: int, name: str | None = None, tag_priority: int | None = None
    ):
        """Update an existing tag"""
        row = self.sqlTag.update_tag(tag_id, name, tag_priority)
        if not row:
            return None

        return Tag(
            id=row[0],
            name=row[1],
            tag_priority=row[2],
        )

    def delete_tag(self, tag_id: int):
        """Hard delete a tag"""
        row = self.sqlTag.delete_tag(tag_id)
        return row is not None

    def get_tags_for_bookmark(self, bookmark_id: int):
        """Get all tags for a specific bookmark"""
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

    def check_tag_name_exists(self, name: str) -> bool:
        """Check if a tag with given name already exists"""
        return self.get_tag_by_name(name) is not None
