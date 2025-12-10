from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from src.models.entity.en_bookmark import (
    Bookmark,
    CreateBookmarkRequest,
    UpdateBookmarkRequest,
    BOOKMARK_TYPES,
    BOOKMARK_STATUSES,
    BOOKMARK_MOODS,
)
from src.models.entity.en_user import User
from src.services.sv_bookmark import BookmarkService
from src.api.api_auth import require_bearer
from datetime import datetime, timezone
from pathlib import Path
import os
import uuid

router = APIRouter(prefix="/bookmarks", tags=["Bookmark"])
sv_bookmark = BookmarkService()

# Directory for bookmark cover images (in frontend public folder)
# __file__ -> .../AxionSync_Backend/src/api/api_bookmark.py
# parents[0]=.../api, [1]=.../src, [2]=.../AxionSync_Backend, [3]=.../AxionSync
UPLOAD_DIR = (
    Path(__file__).resolve().parents[3]
    / "AxionSync_Frontend"
    / "public"
    / "bookmark"
    / "cover"
)


# ===========================
#    API ENDPOINTS
# ===========================
@router.get("/", response_model=list[Bookmark])
def get_bookmarks(
    type: str | None = None,
    status: str | None = None,
    include_deleted: bool = False,
    claims: dict = Depends(require_bearer),
):
    """Get all bookmarks for the authenticated user"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    # Validate type if provided
    if type and type not in BOOKMARK_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid type. Must be one of: {', '.join(BOOKMARK_TYPES)}",
        )

    # Validate status if provided
    if status and status not in BOOKMARK_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(BOOKMARK_STATUSES)}",
        )

    return sv_bookmark.get_bookmarks(
        user_id, bookmark_type=type, status=status, include_deleted=include_deleted
    )


@router.get("/public", response_model=list[Bookmark])
def get_public_bookmarks(type: str | None = None, _: dict = Depends(require_bearer)):
    """Get all public bookmarks"""
    # Validate type if provided
    if type and type not in BOOKMARK_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid type. Must be one of: {', '.join(BOOKMARK_TYPES)}",
        )

    return sv_bookmark.get_public_bookmarks(bookmark_type=type)


@router.get("/{bookmark_id}", response_model=Bookmark | None)
def get_bookmark(bookmark_id: int, claims: dict = Depends(require_bearer)):
    """Get a single bookmark by ID"""
    bookmark = sv_bookmark.get_bookmark_by_id(bookmark_id)
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    # Check ownership or if public
    user_id = claims.get("uid")
    if bookmark.user.id != user_id and not bookmark.public:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Update last viewed timestamp
    sv_bookmark.update_last_viewed(bookmark_id)

    return bookmark


@router.post("/", response_model=Bookmark)
def create_bookmark(req: CreateBookmarkRequest, claims: dict = Depends(require_bearer)):
    """Create a new bookmark"""
    user_id = claims.get("uid")
    username = claims.get("sub")
    if not user_id or not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    # Validate type
    if req.type not in BOOKMARK_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid type. Must be one of: {', '.join(BOOKMARK_TYPES)}",
        )

    # Validate status
    if req.status not in BOOKMARK_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(BOOKMARK_STATUSES)}",
        )

    # Validate mood (if provided)
    if req.mood:
        if len(req.mood) > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 moods allowed",
            )
        for m in req.mood:
            if m not in BOOKMARK_MOODS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid mood '{m}'. Must be one of: {', '.join(BOOKMARK_MOODS)}",
                )

    # Build a minimal User object from claims
    user = User(
        id=user_id,
        username=username,
        role=claims.get("role", "user"),
        created_at=datetime.now(timezone.utc),
    )

    bookmark = sv_bookmark.create_bookmark(
        name=req.name,
        bookmark_type=req.type,
        user_id=user_id,
        user=user,
        review=req.review,
        watch_from=req.watch_from,
        release_time=req.release_time,
        time_used=req.time_used,
        rating=req.rating,
        story_rating=req.story_rating,
        action_rating=req.action_rating,
        graphic_rating=req.graphic_rating,
        sound_rating=req.sound_rating,
        chapter=req.chapter,
        mood=req.mood,
        short_review=req.short_review,
        status=req.status,
        public=req.public,
        cover_image=req.cover_image,
        tag_ids=req.tag_ids,
    )

    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create bookmark",
        )
    return bookmark


@router.put("/{bookmark_id}", response_model=Bookmark)
def update_bookmark(
    bookmark_id: int,
    req: UpdateBookmarkRequest,
    claims: dict = Depends(require_bearer),
):
    """Update an existing bookmark"""
    user_id = claims.get("uid")
    username = claims.get("sub")

    # Check ownership
    existing = sv_bookmark.get_bookmark_by_id(bookmark_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Validate type if provided
    if req.type and req.type not in BOOKMARK_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid type. Must be one of: {', '.join(BOOKMARK_TYPES)}",
        )

    # Validate status if provided
    if req.status and req.status not in BOOKMARK_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(BOOKMARK_STATUSES)}",
        )

    # Validate mood if provided
    if req.mood:
        if len(req.mood) > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 moods allowed",
            )
        for m in req.mood:
            if m not in BOOKMARK_MOODS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid mood '{m}'. Must be one of: {', '.join(BOOKMARK_MOODS)}",
                )

    user = User(
        id=user_id,
        username=username,
        role=claims.get("role", "user"),
        created_at=datetime.now(timezone.utc),
    )

    bookmark = sv_bookmark.update_bookmark(
        bookmark_id=bookmark_id,
        user=user,
        name=req.name,
        bookmark_type=req.type,
        review=req.review,
        watch_from=req.watch_from,
        release_time=req.release_time,
        time_used=req.time_used,
        rating=req.rating,
        story_rating=req.story_rating,
        action_rating=req.action_rating,
        graphic_rating=req.graphic_rating,
        sound_rating=req.sound_rating,
        chapter=req.chapter,
        mood=req.mood,
        short_review=req.short_review,
        status=req.status,
        public=req.public,
        cover_image=req.cover_image,
        tag_ids=req.tag_ids,
        update_watch_from=req.watch_from is not None,
        update_mood=req.mood is not None,
    )

    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update bookmark",
        )
    return bookmark


@router.delete("/{bookmark_id}")
def delete_bookmark(bookmark_id: int, claims: dict = Depends(require_bearer)):
    """Soft delete a bookmark"""
    user_id = claims.get("uid")

    # Check ownership
    existing = sv_bookmark.get_bookmark_by_id(bookmark_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    success = sv_bookmark.soft_delete_bookmark(bookmark_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete bookmark",
        )
    return {"success": True, "message": "Bookmark deleted"}


@router.delete("/{bookmark_id}/permanent")
def permanent_delete_bookmark(bookmark_id: int, claims: dict = Depends(require_bearer)):
    """Permanently delete a bookmark (hard delete)"""
    user_id = claims.get("uid")

    # Check ownership (including soft-deleted)
    existing = sv_bookmark.get_bookmark_by_id(bookmark_id, include_deleted=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    success = sv_bookmark.hard_delete_bookmark(bookmark_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to permanently delete bookmark",
        )
    return {"success": True, "message": "Bookmark permanently deleted"}


@router.patch("/{bookmark_id}/restore", response_model=Bookmark)
def restore_bookmark(bookmark_id: int, claims: dict = Depends(require_bearer)):
    """Restore a soft-deleted bookmark"""
    user_id = claims.get("uid")

    # Check ownership (including soft-deleted)
    existing = sv_bookmark.get_bookmark_by_id(bookmark_id, include_deleted=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    if not existing.deleted_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bookmark is not deleted",
        )

    bookmark = sv_bookmark.restore_bookmark(bookmark_id)
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restore bookmark",
        )
    return bookmark


@router.post("/{bookmark_id}/cover")
async def upload_cover_image(
    bookmark_id: int,
    file: UploadFile = File(...),
    claims: dict = Depends(require_bearer),
):
    """Upload cover image for a bookmark"""
    user_id = claims.get("uid")

    # Check ownership
    existing = sv_bookmark.get_bookmark_by_id(bookmark_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, detail="Invalid file type. Use JPEG, PNG, GIF, or WebP"
        )

    # Create unique filename
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    unique_filename = f"bookmark_{bookmark_id}_{uuid.uuid4().hex[:8]}.{ext}"

    # Ensure upload directory exists
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = UPLOAD_DIR / unique_filename

    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Update bookmark's cover_image in database
    updated_bookmark = sv_bookmark.update_cover_image(bookmark_id, unique_filename)

    if not updated_bookmark:
        # Clean up file if database update fails
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail="Failed to update bookmark cover")

    return {
        "success": True,
        "cover_image": unique_filename,
        "bookmark": updated_bookmark,
    }


@router.get("/by-tag/{tag_id}", response_model=list[Bookmark])
def get_bookmarks_by_tag(tag_id: int, claims: dict = Depends(require_bearer)):
    """Get all bookmarks with a specific tag"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    return sv_bookmark.get_bookmarks_by_tag(tag_id, user_id)
