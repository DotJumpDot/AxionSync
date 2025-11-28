from fastapi import APIRouter, Depends, HTTPException, status
from src.models.entity.en_memo import CreateMemoRequest, Memo, UpdateMemoRequest
from src.models.entity.en_user import User
from src.services.sv_memo import MemoService
from src.api.api_auth import require_bearer
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter(prefix="/memos", tags=["Memos"])
sv_memo = MemoService()


# ===========================
#    API ENDPOINTS
# ===========================
@router.get("/", response_model=list[Memo])
def get_memos(claims: dict = Depends(require_bearer)):
    """Get all memos for the authenticated user"""
    user_id = claims.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return sv_memo.get_memos(user_id)


@router.get("/{memo_id}", response_model=Memo | None)
def get_memo(memo_id: int, claims: dict = Depends(require_bearer)):
    """Get a single memo by ID"""
    memo = sv_memo.get_memo_by_id(memo_id)
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")
    # Ensure user owns the memo
    if memo.user.id != claims.get("uid"):
        raise HTTPException(status_code=403, detail="Forbidden")
    return memo


@router.post("/", response_model=Memo)
def create_memo(req: CreateMemoRequest, claims: dict = Depends(require_bearer)):
    """Create a new memo"""
    user_id = claims.get("uid")
    username = claims.get("sub")
    if not user_id or not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    # Build a minimal User object from claims
    user = User(
        id=user_id,
        username=username,
        role=claims.get("role", "user"),
        created_at=datetime.now(timezone.utc),
    )

    memo = sv_memo.create_memo(req.title, req.content, user_id, user)
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create memo",
        )
    return memo


@router.put("/{memo_id}", response_model=Memo)
def update_memo(
    memo_id: int, req: UpdateMemoRequest, claims: dict = Depends(require_bearer)
):
    """Update an existing memo"""
    user_id = claims.get("uid")
    username = claims.get("sub")

    # Check ownership
    existing = sv_memo.get_memo_by_id(memo_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Memo not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    user = User(
        id=user_id,
        username=username,
        role=claims.get("role", "user"),
        created_at=datetime.now(timezone.utc),
    )

    memo = sv_memo.update_memo(memo_id, req.title, req.content, user)
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update memo",
        )
    return memo


@router.delete("/{memo_id}")
def delete_memo(memo_id: int, claims: dict = Depends(require_bearer)):
    """Soft delete a memo"""
    user_id = claims.get("uid")

    # Check ownership
    existing = sv_memo.get_memo_by_id(memo_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Memo not found")
    if existing.user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    success = sv_memo.delete_memo(memo_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete memo",
        )
    return {"success": True, "message": "Memo deleted"}
