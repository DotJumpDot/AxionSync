from fastapi import APIRouter, Body, Depends
from src.models.entity.en_user import User
from src.services.sv_user import UserService
from src.api.api_auth import require_bearer

router = APIRouter(prefix="/users", tags=["Users"])
sv_user = UserService()


@router.get("/users", response_model=list[User])
def get_users(_: dict = Depends(require_bearer)):
    return sv_user.get_users()


@router.get("/{user_id}", response_model=User | None)
def get_user(user_id: int, _: dict = Depends(require_bearer)):
    return sv_user.get_user_by_id(user_id)


@router.post("/get_by_id")
def get_user_post(id: int = Body(..., embed=True), _: dict = Depends(require_bearer)):
    return sv_user.get_user_by_id(id)
