# Guards for routes. Add `Depends(require_admin)` to any route that edits content.
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.security import password_fingerprint, read_token
from app.database.db import get_db
from app.database.models import AdminAccount


def require_admin(request: Request, db: Session = Depends(get_db)) -> str:
    """Lets the request through only with a valid login cookie for the current admin,
    issued since the password last changed (a reset logs out every older session)."""
    claims = read_token(request.cookies.get("access_token", ""), purpose="login")
    admin = db.get(AdminAccount, 1)
    is_current_login = (
        claims is not None
        and admin is not None
        and claims["sub"] == admin.email
        and claims.get("pwd") == password_fingerprint(admin.password_hash)
    )
    if not is_current_login:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please log in to the editor")
    return admin.email
