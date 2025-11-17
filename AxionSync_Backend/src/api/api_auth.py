from fastapi import APIRouter
from src.models.entity.en_user import User
from src.models.function.ft_login import LoginRequest
from src.services.sv_login import LoginService

router = APIRouter(prefix="/auth", tags=["Authentication"])
sv_login = LoginService()


@router.post("/login")
def login(req: LoginRequest):
    user = sv_login.login(req.username, req.password)

    if not user:
        return {"success": False, "message": "Invalid credentials"}

    return {"success": True, "user": user}
