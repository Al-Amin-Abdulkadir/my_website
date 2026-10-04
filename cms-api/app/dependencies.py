# Guards for routes. Add `_: str = Depends(require_admin)` to any route that edits content.
from fastapi import HTTPException, Request, status

from app.config import ADMIN_EMAIL
from app.core.security import read_token


def require_admin(request: Request) -> str:
    email = read_token(request.cookies.get("access_token", ""))
    if email is None or email != ADMIN_EMAIL:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please log in to the editor")
    return email
