from fastapi import APIRouter, Depends, HTTPException
from src.api.api_auth import require_bearer
from src.models.entity.en_tab import Tab, CreateTabRequest, UpdateTabRequest
from src.services.sv_tab import TabService

router = APIRouter(prefix="/tabs", tags=["tabs"])


@router.get("", response_model=list[Tab])
def get_tabs(claims: dict = Depends(require_bearer)):
    """Get all tabs for the authenticated user"""
    tab_service = TabService()
    return tab_service.get_tabs(claims["uid"])


@router.get("/{tab_id}", response_model=Tab)
def get_tab(tab_id: int, claims: dict = Depends(require_bearer)):
    """Get a single tab by ID"""
    tab_service = TabService()
    tab = tab_service.get_tab_by_id(tab_id)

    if not tab:
        raise HTTPException(status_code=404, detail="Tab not found")

    # Ensure the tab belongs to the user
    if tab.user_id != claims["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    return tab


@router.post("", response_model=Tab, status_code=201)
def create_tab(data: CreateTabRequest, claims: dict = Depends(require_bearer)):
    """Create a new tab"""
    tab_service = TabService()
    return tab_service.create_tab(
        data.tab_name, data.color, claims["uid"], data.font_name, data.font_size
    )


@router.put("/{tab_id}", response_model=Tab)
def update_tab(
    tab_id: int, data: UpdateTabRequest, claims: dict = Depends(require_bearer)
):
    """Update an existing tab"""
    tab_service = TabService()

    # Check if tab exists and belongs to user
    existing_tab = tab_service.get_tab_by_id(tab_id)
    if not existing_tab:
        raise HTTPException(status_code=404, detail="Tab not found")
    if existing_tab.user_id != claims["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated_tab = tab_service.update_tab(
        tab_id, data.tab_name, data.color, data.font_name, data.font_size
    )

    if not updated_tab:
        raise HTTPException(status_code=404, detail="Tab not found")

    return updated_tab


@router.delete("/{tab_id}", status_code=204)
def delete_tab(tab_id: int, claims: dict = Depends(require_bearer)):
    """Delete a tab"""
    tab_service = TabService()

    # Check if tab exists and belongs to user
    existing_tab = tab_service.get_tab_by_id(tab_id)
    if not existing_tab:
        raise HTTPException(status_code=404, detail="Tab not found")
    if existing_tab.user_id != claims["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    success = tab_service.delete_tab(tab_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tab not found")
