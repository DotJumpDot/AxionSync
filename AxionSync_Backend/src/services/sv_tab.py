from src.models.entity.en_tab import Tab
from src.sql_query.sql_tab import SQLTab


class TabService:
    def __init__(self):
        self.sql = SQLTab()

    def get_tabs(self, user_id: int) -> list[Tab]:
        """Get all tabs for a user"""
        rows = self.sql.get_tabs(user_id)
        tabs = []
        for row in rows:
            tabs.append(
                Tab(
                    id=row[0],
                    tab_name=row[1],
                    color=row[2],
                    user_id=row[3],
                    font_name=row[4],
                    font_size=row[5],
                )
            )
        return tabs

    def get_tab_by_id(self, tab_id: int) -> Tab | None:
        """Get a single tab by ID"""
        row = self.sql.get_tab_by_id(tab_id)
        if not row:
            return None
        return Tab(
            id=row[0],
            tab_name=row[1],
            color=row[2],
            user_id=row[3],
            font_name=row[4],
            font_size=row[5],
        )

    def create_tab(
        self, tab_name: str, color: str, user_id: int, font_name: str, font_size: int
    ) -> Tab:
        """Create a new tab"""
        row = self.sql.create_tab(tab_name, color, user_id, font_name, font_size)
        return Tab(
            id=row[0],
            tab_name=row[1],
            color=row[2],
            user_id=row[3],
            font_name=row[4],
            font_size=row[5],
        )

    def update_tab(
        self, tab_id: int, tab_name: str, color: str, font_name: str, font_size: int
    ) -> Tab | None:
        """Update an existing tab"""
        row = self.sql.update_tab(tab_id, tab_name, color, font_name, font_size)
        if not row:
            return None
        return Tab(
            id=row[0],
            tab_name=row[1],
            color=row[2],
            user_id=row[3],
            font_name=row[4],
            font_size=row[5],
        )

    def delete_tab(self, tab_id: int) -> bool:
        """Delete a tab"""
        row = self.sql.delete_tab(tab_id)
        return row is not None
