from fastapi import APIRouter, Body, Header, HTTPException, status, Depends
from src.models.entity.en_user import User
from src.models.function.ft_auth import LoginRequest
from src.services.sv_user import UserService
from jwcrypto import jwt, jwk
from datetime import datetime, timezone
import os, ast, base64, json

router = APIRouter(prefix="/users", tags=["Users"])
sv_user = UserService()


def _parse_api_keys(raw: str | None):
    if not raw:
        return []
    raw = raw.strip()
    try:
        parsed = ast.literal_eval(raw)
        if isinstance(parsed, list):
            return [str(x) for x in parsed]
    except Exception:
        pass
    if raw.startswith("[") and raw.endswith("]"):
        raw = raw[1:-1]
    return [x.strip().strip("'").strip('"') for x in raw.split(",") if x.strip()]


def _jwt_key():
    keys = _parse_api_keys(os.getenv("X_API_KEY"))
    secret = (keys[0] if keys else "default-dev-secret-change-me").encode()
    k_b64u = base64.urlsafe_b64encode(secret).rstrip(b"=")
    return jwk.JWK(kty="oct", k=k_b64u.decode())


def require_bearer(
    authorization: str | None = Header(default=None, alias="Authorization")
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token_str = authorization[7:]
    try:
        key = _jwt_key()
        verified = jwt.JWT(key=key, jwt=token_str)
        claims = json.loads(verified.claims)
        # exp is in seconds; ensure still valid
        if int(claims.get("exp", 0)) <= int(datetime.now(timezone.utc).timestamp()):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired"
            )
        return claims
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )


@router.get("/users", response_model=list[User])
def get_users(_: dict = Depends(require_bearer)):
    return sv_user.get_users()


@router.get("/{user_id}", response_model=User | None)
def get_user(user_id: int, _: dict = Depends(require_bearer)):
    return sv_user.get_user_by_id(user_id)


@router.post("/get_by_id")
def get_user_post(id: int = Body(..., embed=True), _: dict = Depends(require_bearer)):
    return sv_user.get_user_by_id(id)
