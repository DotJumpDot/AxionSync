from src.sql_query.sql_memo import SQLMemo
from src.models.entity.en_memo import Memo
from src.models.entity.en_user import User


class MemoService:
    def __init__(self):
        self.sqlMemo = SQLMemo()

    def get_memos(self, user_id: int, limit: int = 100):
        """Get all memos for a user"""
        rows = self.sqlMemo.get_memos(user_id, limit)
        memos = []

        for row in rows:
            user = User(
                id=row[7],
                username=row[8],
                firstname=row[9],
                lastname=row[10],
                nickname=row[11],
                role=row[12],
                tel=row[13],
                created_at=row[14],
            )
            memos.append(
                Memo(
                    id=row[0],
                    title=row[1],
                    content=row[2],
                    user=user,
                    deleted_status=row[4],
                    created_at=row[5],
                    updated_at=row[6],
                )
            )

        return memos

    def get_memo_by_id(self, memo_id: int):
        """Get a single memo by ID"""
        row = self.sqlMemo.get_memo_by_id(memo_id)
        if not row:
            return None

        user = User(
            id=row[7],
            username=row[8],
            firstname=row[9],
            lastname=row[10],
            nickname=row[11],
            role=row[12],
            tel=row[13],
            created_at=row[14],
        )

        return Memo(
            id=row[0],
            title=row[1],
            content=row[2],
            user=user,
            deleted_status=row[4],
            created_at=row[5],
            updated_at=row[6],
        )

    def create_memo(self, title: str, content: str, user_id: int, user: User):
        """Create a new memo"""
        row = self.sqlMemo.create_memo(title, content, user_id)
        if not row:
            return None

        return Memo(
            id=row[0],
            title=row[1],
            content=row[2],
            user=user,
            deleted_status=row[4],
            created_at=row[5],
            updated_at=row[6],
        )

    def update_memo(self, memo_id: int, title: str, content: str, user: User):
        """Update an existing memo"""
        row = self.sqlMemo.update_memo(memo_id, title, content)
        if not row:
            return None

        return Memo(
            id=row[0],
            title=row[1],
            content=row[2],
            user=user,
            deleted_status=row[4],
            created_at=row[5],
            updated_at=row[6],
        )

    def delete_memo(self, memo_id: int):
        """Soft delete a memo"""
        row = self.sqlMemo.delete_memo(memo_id)
        return row is not None
