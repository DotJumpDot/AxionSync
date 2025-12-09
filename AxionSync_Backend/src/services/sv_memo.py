from src.sql_query.sql_memo import SQLMemo
from src.models.entity.en_memo import Memo
from src.models.entity.en_user import User


class MemoService:
    def __init__(self):
        self.sqlMemo = SQLMemo()

    def get_memos(self, user_id: int, limit: int = 100, tab_id: int | None = None):
        """Get all memos for a user"""
        rows = self.sqlMemo.get_memos(user_id, limit, tab_id)
        memos = []

        for row in rows:
            user = User(
                id=row[11],
                username=row[12],
                firstname=row[13],
                lastname=row[14],
                nickname=row[15],
                role=row[16],
                tel=row[17],
                picture_url=row[19] or "unidentified.jpg",
                created_at=row[18],
            )
            memos.append(
                Memo(
                    id=row[0],
                    title=row[1],
                    content=row[2],
                    user=user,
                    tab_id=row[4],
                    font_color=row[5],
                    deleted_status=row[6],
                    collected=row[7],
                    collected_time=row[8],
                    created_at=row[9],
                    updated_at=row[10],
                )
            )

        return memos

    def get_memo_by_id(self, memo_id: int):
        """Get a single memo by ID"""
        row = self.sqlMemo.get_memo_by_id(memo_id)
        if not row:
            return None

        user = User(
            id=row[11],
            username=row[12],
            firstname=row[13],
            lastname=row[14],
            nickname=row[15],
            role=row[16],
            tel=row[17],
            created_at=row[18],
        )

        return Memo(
            id=row[0],
            title=row[1],
            content=row[2],
            user=user,
            tab_id=row[4],
            font_color=row[5],
            deleted_status=row[6],
            collected=row[7],
            collected_time=row[8],
            created_at=row[9],
            updated_at=row[10],
        )

    def create_memo(
        self,
        title: str,
        content: str,
        user_id: int,
        user: User,
        tab_id: int | None = None,
        font_color: str | None = None,
    ):
        """Create a new memo"""
        row = self.sqlMemo.create_memo(title, content, user_id, tab_id, font_color)
        if not row:
            return None

        return Memo(
            id=row[0],
            title=row[1],
            content=row[2],
            user=user,
            tab_id=row[4],
            font_color=row[5],
            deleted_status=row[6],
            collected=row[7],
            collected_time=row[8],
            created_at=row[9],
            updated_at=row[10],
        )

    def update_memo(
        self,
        memo_id: int,
        title: str,
        content: str,
        user: User,
        font_color: str | None = None,
    ):
        """Update an existing memo"""
        row = self.sqlMemo.update_memo(memo_id, title, content, font_color)
        if not row:
            return None

        return Memo(
            id=row[0],
            title=row[1],
            content=row[2],
            user=user,
            tab_id=row[4],
            font_color=row[5],
            deleted_status=row[6],
            collected=row[7],
            collected_time=row[8],
            created_at=row[9],
            updated_at=row[10],
        )

    def collect_memo(self, memo_id: int, user: User):
        """Mark a memo as collected"""
        row = self.sqlMemo.collect_memo(memo_id)
        if not row:
            return None

        return Memo(
            id=row[0],
            title=row[1],
            content=row[2],
            user=user,
            tab_id=row[4],
            font_color=row[5],
            deleted_status=row[6],
            collected=row[7],
            collected_time=row[8],
            created_at=row[9],
            updated_at=row[10],
        )

    def uncollect_memo(self, memo_id: int, user: User):
        """Unmark a memo as collected"""
        row = self.sqlMemo.uncollect_memo(memo_id)
        if not row:
            return None

        return Memo(
            id=row[0],
            title=row[1],
            content=row[2],
            user=user,
            tab_id=row[4],
            font_color=row[5],
            deleted_status=row[6],
            collected=row[7],
            collected_time=row[8],
            created_at=row[9],
            updated_at=row[10],
        )

    def delete_memo(self, memo_id: int):
        """Soft delete a memo"""
        row = self.sqlMemo.delete_memo(memo_id)
        return row is not None
