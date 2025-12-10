from fastapi import APIRouter, Depends, HTTPException, status
from src.models.entity.en_tag import Tag, CreateTagRequest, UpdateTagRequest
from src.services.sv_tag import TagService
from src.api.api_auth import require_bearer

router = APIRouter(prefix="/tags", tags=["Tag"])
sv_tag = TagService()


# ===========================
#    API ENDPOINTS
# ===========================
@router.get("/", response_model=list[Tag])
def get_tags(_: dict = Depends(require_bearer)):
    """Get all tags ordered by priority"""
    return sv_tag.get_tags()


@router.get("/{tag_id}", response_model=Tag | None)
def get_tag(tag_id: int, _: dict = Depends(require_bearer)):
    """Get a single tag by ID"""
    tag = sv_tag.get_tag_by_id(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.post("/", response_model=Tag)
def create_tag(req: CreateTagRequest, _: dict = Depends(require_bearer)):
    """Create a new tag"""
    # Check if tag name already exists
    if sv_tag.check_tag_name_exists(req.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag name already exists",
        )

    tag = sv_tag.create_tag(req.name, req.tag_priority)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tag",
        )
    return tag


@router.put("/{tag_id}", response_model=Tag)
def update_tag(tag_id: int, req: UpdateTagRequest, _: dict = Depends(require_bearer)):
    """Update an existing tag"""
    # Check if tag exists
    existing = sv_tag.get_tag_by_id(tag_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Check if new name conflicts with existing tag
    if req.name and req.name != existing.name:
        if sv_tag.check_tag_name_exists(req.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tag name already exists",
            )

    tag = sv_tag.update_tag(tag_id, req.name, req.tag_priority)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update tag",
        )
    return tag


@router.delete("/{tag_id}")
def delete_tag(tag_id: int, _: dict = Depends(require_bearer)):
    """Hard delete a tag"""
    # Check if tag exists
    existing = sv_tag.get_tag_by_id(tag_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Tag not found")

    success = sv_tag.delete_tag(tag_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete tag",
        )
    return {"success": True, "message": "Tag deleted"}
