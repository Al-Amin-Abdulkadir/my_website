# Entry point for the portfolio CMS API.
# Run (from cms-api/):  .venv/bin/uvicorn app.main:app --reload --port 8000
# Interactive docs:      http://localhost:8000/docs
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import ADMIN_EMAIL, UPLOADS_DIR
from app.core.security import read_token
from app.routes import admin, auth, public
from app.routes.admin import MAX_UPLOAD_REQUEST_BYTES

app = FastAPI(title="Portfolio CMS")

app.include_router(public.router)
app.include_router(auth.router)
app.include_router(admin.router)

@app.middleware("http")
async def check_uploads_before_reading_them(request: Request, call_next):
    """FastAPI reads an upload's whole body before the route's login check runs, so
    without this anyone could send an endless file and fill the disk. Here we look
    at the request's headers first and turn it away before reading the body."""
    if request.url.path == "/api/admin/uploads" and request.method == "POST":
        if read_token(request.cookies.get("access_token", "")) != ADMIN_EMAIL:
            return JSONResponse({"detail": "Please log in to the editor"}, status_code=401)

        declared_size = request.headers.get("content-length")
        if declared_size is None or not declared_size.isdigit():
            return JSONResponse({"detail": "Uploads must say how big they are (Content-Length)"}, status_code=411)
        if int(declared_size) > MAX_UPLOAD_REQUEST_BYTES:
            return JSONResponse({"detail": "That file is too big — videos can be up to 200 MB"}, status_code=413)

    return await call_next(request)


UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"ok": True}
