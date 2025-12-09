from fastapi import APIRouter, Body, Depends, UploadFile, File, HTTPException
from src.models.entity.en_user import User, UserUpdate, UserCreate
from src.services.sv_user import UserService
from src.api.api_auth import require_bearer, require_api_key
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/users", tags=["User"])
sv_user = UserService()

# Directory for profile pictures (in frontend public folder)
# Path: AxionSync/AxionSync_Frontend/public/userProfilePicture
UPLOAD_DIR = (
    Path(__file__).resolve().parent.parent.parent.parent.parent
    / "AxionSync_Frontend"
    / "public"
    / "userProfilePicture"
)

print(f"[INIT] Profile picture upload directory: {UPLOAD_DIR}")


@router.get("/users", response_model=list[User])
def get_users(_: dict = Depends(require_bearer)):
    return sv_user.get_users()


@router.post("/register", response_model=User)
def register_user(data: UserCreate, _: bool = Depends(require_api_key)):
    """
    Register a new user with password hashing.
    - username: required, must be unique
    - password: required, will be hashed with bcrypt
    - firstname, lastname, nickname, tel: optional
    - role: optional, defaults to "user"
    - picture_url: optional, defaults to "unidentified.jpg"
    """
    # Check if username already exists
    if sv_user.check_username_exists(data.username):
        raise HTTPException(status_code=400, detail="Username already exists")

    # Create user with hashed password
    user = sv_user.create_user(
        username=data.username,
        password=data.password,
        firstname=data.firstname,
        lastname=data.lastname,
        nickname=data.nickname,
        role=data.role,
        tel=data.tel,
        picture_url=data.picture_url,
    )

    if not user:
        raise HTTPException(status_code=500, detail="Failed to create user")

    return user


@router.get("/{user_id}", response_model=User | None)
def get_user(user_id: int, _: dict = Depends(require_bearer)):
    return sv_user.get_user_by_id(user_id)


@router.post("/get_by_id")
def get_user_post(id: int = Body(..., embed=True), _: dict = Depends(require_bearer)):
    return sv_user.get_user_by_id(id)


@router.put("/{user_id}/profile", response_model=User | None)
def update_user_profile(
    user_id: int, data: UserUpdate, auth: dict = Depends(require_bearer)
):
    # Users can only update their own profile
    if auth.get("uid") != user_id:
        raise HTTPException(
            status_code=403, detail="Cannot update other user's profile"
        )

    return sv_user.update_user_profile(
        user_id,
        firstname=data.firstname,
        lastname=data.lastname,
        nickname=data.nickname,
        tel=data.tel,
    )


@router.post("/{user_id}/picture")
async def upload_profile_picture(
    user_id: int, file: UploadFile = File(...), auth: dict = Depends(require_bearer)
):
    # Users can only update their own picture
    if auth.get("uid") != user_id:
        raise HTTPException(
            status_code=403, detail="Cannot update other user's picture"
        )

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, detail="Invalid file type. Use JPEG, PNG, GIF, or WebP"
        )

    # Create unique filename
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    unique_filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{ext}"

    print(
        f"[UPLOAD] User {user_id} uploading file: {file.filename} -> {unique_filename}"
    )

    # Ensure upload directory exists
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = UPLOAD_DIR / unique_filename

    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        print(f"[UPLOAD] File saved to: {file_path}")
    except Exception as e:
        print(f"[UPLOAD] Error saving file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Update user's picture_url in database
    updated_user = sv_user.update_user_picture(user_id, unique_filename)

    print(f"[UPLOAD] Updated user picture in database: {updated_user}")

    if not updated_user:
        # Clean up file if database update fails
        if file_path.exists():
            os.remove(file_path)
        print(f"[UPLOAD] Database update failed, cleaning up file")
        raise HTTPException(status_code=500, detail="Failed to update user picture")

    print(f"[UPLOAD] Success! New picture_url: {unique_filename}")
    return {"success": True, "picture_url": unique_filename, "user": updated_user}
