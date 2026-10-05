# Logging in and out of the editor, and resetting a forgotten password with a
# 6-digit code sent by email.
# The login token lives in an httpOnly cookie, so JavaScript on the page can't
# read it (protects it from stolen-script attacks).
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import IS_ON_VERCEL
from app.core.email import EmailNotSent, send_password_reset_code
from app.core.security import (
    LOGIN_LIFETIME, MAX_WRONG_CODE_TRIES, RESET_CODE_LIFETIME, create_login_token, create_reset_token,
    hash_password, hash_reset_code, new_reset_code, password_fingerprint, read_token, reset_code_matches,
    verify_password,
)
from app.database.db import get_db
from app.database.models import AdminAccount
from app.database.schemas import ForgotPasswordIn, LoginIn, ResetPasswordIn, VerifyResetCodeIn
from app.dependencies import require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])


def is_admin_email(admin: AdminAccount | None, email: str) -> bool:
    return admin is not None and email.strip().lower() == admin.email.lower()


@router.post("/login")
def login(credentials: LoginIn, response: Response, db: Session = Depends(get_db)):
    admin = db.get(AdminAccount, 1)
    if not (is_admin_email(admin, credentials.email) and verify_password(credentials.password, admin.password_hash)):
        # Same message either way, so it doesn't reveal whether the email was right
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong email or password")

    response.set_cookie(
        "access_token", create_login_token(admin.email, admin.password_hash),
        httponly=True, samesite="lax", max_age=int(LOGIN_LIFETIME.total_seconds()),
        secure=IS_ON_VERCEL,   # on the live site the cookie only travels over HTTPS
    )
    return {"email": admin.email}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"loggedOut": True}


@router.get("/me")
def who_am_i(email: str = Depends(require_admin)):
    return {"email": email}


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordIn, db: Session = Depends(get_db)):
    """Emails a 6-digit code to the admin (a new code replaces any earlier one).
    The answer is the same whatever email is typed, so this can't be used to find
    out which email is the admin's."""
    admin = db.get(AdminAccount, 1)
    if is_admin_email(admin, request.email):
        code = new_reset_code()
        admin.reset_code_hash = hash_reset_code(code)
        admin.reset_code_expires_at = datetime.now(timezone.utc) + RESET_CODE_LIFETIME
        admin.reset_code_wrong_tries = 0
        db.commit()
        try:
            send_password_reset_code(admin.email, code)
        except EmailNotSent as problem:
            raise HTTPException(status_code=503, detail=str(problem))
    return {"message": "If that’s the CMS email, a 6-digit code is on its way. It works once, for 30 minutes."}


@router.post("/verify-reset-code")
def verify_reset_code(request: VerifyResetCodeIn, db: Session = Depends(get_db)):
    """Checks the emailed code. A correct code is used up and swapped for a short-lived
    permission to set a new password; 5 wrong guesses kill the code, so it can't be
    guessed by trying all million combinations."""
    admin = db.get(AdminAccount, 1)
    wrong_or_expired = HTTPException(
        status_code=400, detail="That code is wrong or has expired. Check the email, or ask for a new code.")

    has_live_code = (
        is_admin_email(admin, request.email)
        and admin.reset_code_hash is not None
        and admin.reset_code_expires_at > datetime.now(timezone.utc)
        and admin.reset_code_wrong_tries < MAX_WRONG_CODE_TRIES
    )
    if not has_live_code:
        raise wrong_or_expired

    if not reset_code_matches(request.code, admin.reset_code_hash):
        admin.reset_code_wrong_tries += 1
        db.commit()
        if admin.reset_code_wrong_tries >= MAX_WRONG_CODE_TRIES:
            raise HTTPException(status_code=400, detail="Too many wrong codes. Ask for a new code.")
        raise wrong_or_expired

    # Used up: the same code can't be used again
    admin.reset_code_hash, admin.reset_code_expires_at = None, None
    db.commit()
    return {"resetToken": create_reset_token(admin.email, admin.password_hash)}


@router.post("/reset-password")
def reset_password(request: ResetPasswordIn, db: Session = Depends(get_db)):
    """Sets the new password, using the permission given for a correct code. It carries
    a fingerprint of the password at the time, so once the password changes it (and
    every older login) stops working."""
    claims = read_token(request.token, purpose="password-reset")
    admin = db.get(AdminAccount, 1)
    link_is_valid = (
        claims is not None
        and admin is not None
        and claims["sub"] == admin.email
        and claims.get("pwd") == password_fingerprint(admin.password_hash)
    )
    if not link_is_valid:
        raise HTTPException(
            status_code=400,
            detail="This reset has expired or was already used. Ask for a new code from the login page.",
        )

    admin.password_hash = hash_password(request.new_password)
    admin.password_changed_at = func.now()
    db.commit()
    return {"message": "Password changed. Log in with your new password."}
