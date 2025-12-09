from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from src.models.entity.en_user import User
from src.models.function.ft_auth import LoginRequest
from src.services.sv_auth import AuthService
from datetime import datetime, timedelta, timezone
from jwcrypto import jwt, jwk
import base64
import os
import ast
import json

router = APIRouter(prefix="/auth", tags=["Authentication"])
sv_auth = AuthService()

# Security schemes - these integrate with Swagger UI "Authorize" button
bearer_scheme = HTTPBearer(auto_error=False, scheme_name="bearerAuth")
api_key_scheme = APIKeyHeader(name="X-API-KEY", auto_error=False, scheme_name="apiKey")


# ===========================
#    JWT HELPER FUNCTIONS
# ===========================
def _parse_api_keys(raw: str | None):
    if not raw:
        return []
    raw = raw.strip()
    try:
        # Support list-like env e.g. "['1234','abcd']"
        parsed = ast.literal_eval(raw)
        if isinstance(parsed, list):
            return [str(x) for x in parsed]
    except Exception:
        pass
    # Fallback: comma-separated or single value
    if raw.startswith("[") and raw.endswith("]"):
        raw = raw[1:-1]
    return [x.strip().strip("'").strip('"') for x in raw.split(",") if x.strip()]


def _jwt_secret_from_keys(keys: list[str]) -> str:
    # Use the first API key as the signing secret by request
    return keys[0] if keys else "default-dev-secret-change-me"


def _jwt_key():
    """Get JWT key for token signing/verification"""
    keys = _parse_api_keys(os.getenv("X_API_KEY"))
    secret = (keys[0] if keys else "default-dev-secret-change-me").encode()
    k_b64u = base64.urlsafe_b64encode(secret).rstrip(b"=")
    return jwk.JWK(kty="oct", k=k_b64u.decode())


def require_bearer(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """Dependency to extract and verify JWT, return claims with user info"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token_str = credentials.credentials
    try:
        key = _jwt_key()
        verified = jwt.JWT(key=key, jwt=token_str)
        claims = json.loads(verified.claims)
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


def require_api_key(x_api_key: str | None = Depends(api_key_scheme)):
    """Dependency to verify API key for public endpoints like registration"""
    allowed_keys = _parse_api_keys(os.getenv("X_API_KEY"))
    if not allowed_keys or (x_api_key not in allowed_keys):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key"
        )
    return True


@router.post("/login")
def login(req: LoginRequest, x_api_key: str | None = Depends(api_key_scheme)):
    allowed_keys = _parse_api_keys(os.getenv("X_API_KEY"))
    if not allowed_keys or (x_api_key not in allowed_keys):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key"
        )

    user = sv_auth.login(req.username, req.password)
    if not user:
        return {"success": False, "message": "Invalid credentials"}

    # Create JWT token with 1 hour expiry
    expire_minutes = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=expire_minutes)
    payload = {
        "sub": user.username,
        "uid": user.id,
        "role": user.role,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }

    secret = _jwt_secret_from_keys(allowed_keys).encode()
    k_b64u = base64.urlsafe_b64encode(secret).rstrip(b"=")
    key = jwk.JWK(kty="oct", k=k_b64u.decode())
    token = jwt.JWT(header={"alg": "HS256", "typ": "JWT"}, claims=payload)
    token.make_signed_token(key)
    serialized = token.serialize()

    return {
        "success": True,
        "user": user,
        "token": serialized,
        "expiresAt": exp.isoformat(),
    }
