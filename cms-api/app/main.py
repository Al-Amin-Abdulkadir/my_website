# Entry point for the portfolio CMS API.
# Run (from cms-api/):  .venv/bin/uvicorn app.main:app --reload --port 8000
# Interactive docs:      http://localhost:8000/docs
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import UPLOADS_DIR
from app.routes import admin, auth, public

app = FastAPI(title="Portfolio CMS")

app.include_router(public.router)
app.include_router(auth.router)
app.include_router(admin.router)

UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"ok": True}
