# Passwords and login tokens.
# The admin password is never stored as-is — only its bcrypt hash (in .env).
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import SECRET_KEY

TOKEN_LIFETIME = timedelta(days=7)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_token(email: str) -> str:
    expires = datetime.now(timezone.utc) + TOKEN_LIFETIME
    return jwt.encode({"sub": email, "exp": expires}, SECRET_KEY, algorithm="HS256")


def read_token(token: str) -> str | None:
    """Returns the email inside a valid token, or None if it's missing, expired or forged."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])["sub"]
    except jwt.PyJWTError:
        return None
