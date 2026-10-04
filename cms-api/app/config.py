# Settings for the CMS API, read from cms-api/.env (see .env.example).
from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://alamin@localhost/portfolio_cms")
# Hosts like Railway hand out postgres:// or postgresql:// — SQLAlchemy needs to be told
# to use the psycopg (v3) driver we installed, which is spelled postgresql+psycopg://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

SECRET_KEY = os.getenv("SECRET_KEY", "")

# The one admin who can use the editor. ADMIN_PASSWORD_HASH is a bcrypt hash —
# set it with:  python -m app.set_admin_password
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")

# Where uploaded images are kept (served at /uploads). Moves to Cloudinary when deployed.
UPLOADS_DIR = BASE_DIR / "uploads"

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing — add it to cms-api/.env (see .env.example)")
