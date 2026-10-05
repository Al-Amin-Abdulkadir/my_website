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

# The editor's login lives in the database (table admin_account), so the password
# can be reset from the site. Set or change it with:  python -m app.set_admin_password

# Password-reset emails go out through Resend (resend.com, free tier). Without a key,
# local development prints the reset code in the API's terminal instead.
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "Portfolio CMS <onboarding@resend.dev>")

# Running on Vercel? (Vercel sets VERCEL=1.) A few things only make sense on the live server.
IS_ON_VERCEL = os.getenv("VERCEL") == "1"

# Photos and videos are uploaded by the editor straight to Cloudinary (Vercel functions
# refuse requests over 4.5 MB). The API only signs uploads, so the secret stays here.
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")
CLOUDINARY_FOLDER = "portfolio-cms"

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing — add it to cms-api/.env (see .env.example)")
