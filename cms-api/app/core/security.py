# Passwords and signed tokens.
# The admin password is never stored as-is — only its bcrypt hash (in the database).
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets

import bcrypt
import jwt

from app.config import SECRET_KEY

LOGIN_LIFETIME = timedelta(days=7)
RESET_CODE_LIFETIME = timedelta(minutes=30)        # the emailed 6-digit code
RESET_PERMISSION_LIFETIME = timedelta(minutes=10)  # after a correct code: time to choose the new password
MAX_WRONG_CODE_TRIES = 5


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def password_fingerprint(password_hash: str) -> str:
    """A short, one-way summary of the current password hash. Tokens carry it, so
    changing the password makes every older login and reset link stop working."""
    return hashlib.sha256(password_hash.encode()).hexdigest()[:16]


# ── Login ─────────────────────────────────────────────

def create_login_token(email: str, password_hash: str) -> str:
    claims = {
        "sub": email,
        "purpose": "login",
        "pwd": password_fingerprint(password_hash),
        "exp": datetime.now(timezone.utc) + LOGIN_LIFETIME,
    }
    return jwt.encode(claims, SECRET_KEY, algorithm="HS256")


# ── Password reset ────────────────────────────────────

def new_reset_code() -> str:
    """Six random digits, e.g. "048213". `secrets` is Python's module for
    unguessable numbers — the ordinary `random` module is predictable."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_reset_code(code: str) -> str:
    # Only this hash is stored, so the code can't be read out of the database
    return hashlib.sha256(code.encode()).hexdigest()


def reset_code_matches(code: str, stored_hash: str) -> bool:
    # compare_digest takes the same time whatever the input, so timing gives nothing away
    return hmac.compare_digest(hash_reset_code(code), stored_hash)


def create_reset_token(email: str, password_hash: str) -> str:
    """Given after a correct code: permission to set a new password for a few minutes."""
    claims = {
        "sub": email,
        "purpose": "password-reset",
        "pwd": password_fingerprint(password_hash),
        "exp": datetime.now(timezone.utc) + RESET_PERMISSION_LIFETIME,
    }
    return jwt.encode(claims, SECRET_KEY, algorithm="HS256")


def read_token(token: str, purpose: str) -> dict | None:
    """The claims inside a valid token made for `purpose` ("login" or "password-reset"),
    or None if it's missing, expired, forged, or made for something else."""
    try:
        claims = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    return claims if claims.get("purpose") == purpose else None


# ── Uploads ───────────────────────────────────────────

def sign_cloudinary_upload(params: dict, api_secret: str) -> str:
    """Cloudinary's upload signature: the parameters sorted by name as "a=1&b=2",
    with the API secret added on the end, hashed with SHA-1. Cloudinary does the
    same sum on its side; if they match, the upload was approved by us."""
    to_sign = "&".join(f"{key}={params[key]}" for key in sorted(params))
    return hashlib.sha1((to_sign + api_secret).encode()).hexdigest()
