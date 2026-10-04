# Logging in and out of the editor. The login token lives in an httpOnly cookie,
# so JavaScript on the page can't read it (protects it from stolen-script attacks).
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.config import ADMIN_EMAIL, ADMIN_PASSWORD_HASH
from app.core.security import TOKEN_LIFETIME, create_token, verify_password
from app.database.schemas import LoginIn
from app.dependencies import require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login(credentials: LoginIn, response: Response):
    is_admin = (
        ADMIN_EMAIL and ADMIN_PASSWORD_HASH
        and credentials.email.strip().lower() == ADMIN_EMAIL.lower()
        and verify_password(credentials.password, ADMIN_PASSWORD_HASH)
    )
    if not is_admin:
        # Same message either way, so it doesn't reveal whether the email was right
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong email or password")

    response.set_cookie(
        "access_token", create_token(ADMIN_EMAIL),
        httponly=True, samesite="lax", max_age=int(TOKEN_LIFETIME.total_seconds()),
    )
    return {"email": ADMIN_EMAIL}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"loggedOut": True}


@router.get("/me")
def who_am_i(email: str = Depends(require_admin)):
    return {"email": email}
