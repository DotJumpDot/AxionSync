from fastapi import APIRouter
from src.models.entity.en_user import User
from src.models.function.ft_auth import LoginRequest
from src.services.sv_auth import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
sv_auth = AuthService()


@router.post("/login")
def login(req: LoginRequest):
    user = sv_auth.login(req.username, req.password)

    if not user:
        return {"success": False, "message": "Invalid credentials"}

    return {"success": True, "user": user}
