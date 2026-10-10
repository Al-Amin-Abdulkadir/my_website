# One-off: moves files uploaded before uploads went to Cloudinary (kept in
# cms-api/uploads and referenced as "/uploads/<file>") onto Cloudinary, and points
# the database at the new addresses. Safe to run again: moved files no longer
# start with /uploads/. The files in cms-api/uploads are left untouched.
#   python -m app.move_uploads_to_cloudinary
import base64
import json
import mimetypes
import time
import urllib.error
import urllib.parse
import urllib.request

from sqlalchemy import select

from app.config import (BASE_DIR, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
                        CLOUDINARY_CLOUD_NAME, CLOUDINARY_FOLDER)
from app.core.security import sign_cloudinary_upload
from app.database.db import SessionLocal
from app.database.models import Entry, EntryBlock, HomePhoto

OLD_UPLOADS_DIR = BASE_DIR / "uploads"


def upload_to_cloudinary(path) -> str:
    """Uploads one file and returns its Cloudinary address. Raises with the reason if it fails."""
    params = {"folder": CLOUDINARY_FOLDER, "timestamp": int(time.time())}
    file_as_data = f"data:{mimetypes.guess_type(path.name)[0]};base64,{base64.b64encode(path.read_bytes()).decode()}"
    body = urllib.parse.urlencode({
        **params,
        "file": file_as_data,
        "api_key": CLOUDINARY_API_KEY,
        "signature": sign_cloudinary_upload(params, CLOUDINARY_API_SECRET),
    }).encode()
    request = urllib.request.Request(
        f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/auto/upload",
        data=body,
        headers={"User-Agent": "portfolio-cms/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return json.load(response)["secure_url"]
    except urllib.error.HTTPError as problem:
        raise SystemExit(f"Cloudinary refused {path.name} ({problem.code}): {problem.read().decode(errors='replace')[:300]}")


def main():
    if not (CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET):
        raise SystemExit("Add the CLOUDINARY_* settings to cms-api/.env first.")

    moved = {}   # "/uploads/abc.mp4" → its new Cloudinary address (each file uploads once)

    def new_address(old: str) -> str:
        if old not in moved:
            path = OLD_UPLOADS_DIR / old.removeprefix("/uploads/")
            if not path.is_file():
                raise SystemExit(f"{old} is used in the database but the file isn't in {OLD_UPLOADS_DIR}")
            print(f"  uploading {path.name} ({path.stat().st_size / 1024 / 1024:.1f} MB)…", flush=True)
            moved[old] = upload_to_cloudinary(path)
        return moved[old]

    with SessionLocal() as db:
        changes = 0
        for block in db.scalars(select(EntryBlock)):
            src = block.content.get("src", "")
            if src.startswith("/uploads/"):
                block.content = {**block.content, "src": new_address(src)}   # a new dict, so the change is saved
                changes += 1
        for entry in db.scalars(select(Entry)):
            if (entry.cover_url or "").startswith("/uploads/"):
                entry.cover_url = new_address(entry.cover_url)
                changes += 1
        for photo in db.scalars(select(HomePhoto)):
            if photo.image_url.startswith("/uploads/"):
                photo.image_url = new_address(photo.image_url)
                changes += 1
        # Only saved once every file has uploaded, so a failure part-way changes nothing
        db.commit()

    print(f"Moved {len(moved)} file(s) to Cloudinary and updated {changes} place(s) in the database.")
    for old, new in moved.items():
        print(f"  {old}  →  {new}")


if __name__ == "__main__":
    main()
