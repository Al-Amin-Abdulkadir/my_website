# Editing endpoints — every route here requires the admin login.
import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import UPLOADS_DIR
from app.database.db import get_db
from app.database.models import Entry, EntryBlock, HomePhoto, ProjectsPageRow, SiteSettings
from app.database.schemas import (
    EntryCreate, EntryOut, EntrySave, EntrySummaryOut, HomePhotoData,
    Kind, ProjectsPageRowIn, ProjectsPageRowOut, SiteSettingsData,
)
from app.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])

# What can be uploaded, and the biggest file allowed for each kind
UPLOAD_TYPES = {
    "image/jpeg": (".jpg", "image"), "image/png": (".png", "image"),
    "image/webp": (".webp", "image"), "image/gif": (".gif", "image"),
    "video/mp4": (".mp4", "video"), "video/webm": (".webm", "video"), "video/quicktime": (".mov", "video"),
}
MAX_UPLOAD_MB = {"image": 15, "video": 200}
# The biggest request the upload route will even start reading (largest file + room
# for the form's own wrapping). Checked in main.py before the body is read.
MAX_UPLOAD_REQUEST_BYTES = (MAX_UPLOAD_MB["video"] + 1) * 1024 * 1024


def find_entry(db: Session, entry_id: int) -> Entry:
    entry = db.get(Entry, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail=f"No entry with id {entry_id}")
    return entry


# ── Entries: projects, case studies, pages ────────────

@router.get("/entries", response_model=list[EntrySummaryOut])
def list_entries(kind: Kind = Query(...), db: Session = Depends(get_db)):
    """Every entry of one kind, drafts included."""
    return db.scalars(select(Entry).where(Entry.kind == kind).order_by(Entry.id)).all()


@router.get("/entries/{entry_id}", response_model=EntryOut)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    return find_entry(db, entry_id)


@router.get("/pages/{slug}", response_model=EntryOut)
def get_page(slug: str, db: Session = Depends(get_db)):
    """Standalone pages (About) are opened by their address rather than an id."""
    page = db.scalar(select(Entry).where(Entry.kind == "page", Entry.slug == slug))
    if page is None:
        raise HTTPException(status_code=404, detail=f"No page called '{slug}'")
    return page


@router.post("/entries", response_model=EntryOut, status_code=status.HTTP_201_CREATED)
def create_entry(new: EntryCreate, db: Session = Depends(get_db)):
    """A new project or case study starts as an unpublished draft, its address made from the title."""
    base_slug = re.sub(r"[^a-z0-9]+", "-", new.title.lower()).strip("-") or "untitled"
    slug, number = base_slug, 2
    while db.scalar(select(Entry.id).where(Entry.kind == new.kind, Entry.slug == slug)) is not None:
        slug, number = f"{base_slug}-{number}", number + 1

    entry = Entry(kind=new.kind, slug=slug, title=new.title, tags=[], is_published=False)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/entries/{entry_id}", response_model=EntryOut)
def save_entry(entry_id: int, saved: EntrySave, db: Session = Depends(get_db)):
    """Save the whole entry at once: its details and its full, ordered list of blocks.
    The old blocks are replaced — whatever order the editor sends is the new order."""
    entry = find_entry(db, entry_id)
    if entry.kind == "page" and saved.slug != entry.slug:
        raise HTTPException(status_code=400, detail="A page’s address can’t be changed (the site links to it)")

    address_taken = db.scalar(select(Entry.id).where(
        Entry.kind == entry.kind, Entry.slug == saved.slug, Entry.id != entry.id))
    if address_taken is not None:
        raise HTTPException(status_code=409, detail=f"Another entry already uses the address '{saved.slug}'")

    for field in ("slug", "title", "category", "description", "tags", "cover_url",
                  "cover_position", "year", "github_url", "is_published"):
        setattr(entry, field, getattr(saved, field))

    db.execute(delete(EntryBlock).where(EntryBlock.entry_id == entry.id))
    entry.blocks = [
        EntryBlock(position=index, type=block.type, content=block.content)
        for index, block in enumerate(saved.blocks)
    ]
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = find_entry(db, entry_id)
    if entry.kind == "page":
        raise HTTPException(status_code=400, detail="Pages like About can be emptied or unpublished, but not deleted")
    db.delete(entry)
    db.commit()


# ── Projects page layout ──────────────────────────────

@router.get("/projects-page-rows", response_model=list[ProjectsPageRowOut])
def list_projects_page_rows(db: Session = Depends(get_db)):
    return db.scalars(select(ProjectsPageRow).order_by(ProjectsPageRow.position)).all()


@router.put("/projects-page-rows", response_model=list[ProjectsPageRowOut])
def save_projects_page_rows(rows: list[ProjectsPageRowIn], db: Session = Depends(get_db)):
    """Replace the whole Projects page layout (rows in the order sent)."""
    project_ids = set(db.scalars(select(Entry.id).where(Entry.kind == "project")).all())
    for number, row in enumerate(rows, start=1):
        for project_id in (row.main_project_id, row.second_project_id):
            if project_id is not None and project_id not in project_ids:
                raise HTTPException(status_code=400, detail=f"Row {number} points at something that isn’t a project")

    db.execute(delete(ProjectsPageRow))
    for index, row in enumerate(rows):
        db.add(ProjectsPageRow(position=index, **row.model_dump()))
    db.commit()
    return db.scalars(select(ProjectsPageRow).order_by(ProjectsPageRow.position)).all()


# ── Home photos ───────────────────────────────────────

@router.get("/home-photos", response_model=list[HomePhotoData])
def list_home_photos(db: Session = Depends(get_db)):
    return db.scalars(select(HomePhoto).order_by(HomePhoto.position)).all()


@router.put("/home-photos", response_model=list[HomePhotoData])
def save_home_photos(photos: list[HomePhotoData], db: Session = Depends(get_db)):
    """Replace the whole list of Home photos (in the order sent)."""
    db.execute(delete(HomePhoto))
    for index, photo in enumerate(photos):
        db.add(HomePhoto(position=index, **photo.model_dump()))
    db.commit()
    return db.scalars(select(HomePhoto).order_by(HomePhoto.position)).all()


# ── Site colours ──────────────────────────────────────

@router.put("/site-settings", response_model=SiteSettingsData)
def save_site_settings(chosen: SiteSettingsData, db: Session = Depends(get_db)):
    settings = db.get(SiteSettings, 1)
    if settings is None:
        raise HTTPException(status_code=500, detail="Site settings are missing — run the database migrations")
    settings.background_color = chosen.background_color
    settings.text_color = chosen.text_color
    db.commit()
    return settings


# ── Uploads: images and videos ────────────────────────

@router.post("/uploads")
async def upload_file(file: UploadFile):
    upload_type = UPLOAD_TYPES.get(file.content_type or "")
    if upload_type is None:
        raise HTTPException(status_code=415, detail="Upload a JPG, PNG, WebP or GIF image, or an MP4, WebM or MOV video")
    extension, kind = upload_type
    max_bytes = MAX_UPLOAD_MB[kind] * 1024 * 1024

    UPLOADS_DIR.mkdir(exist_ok=True)
    destination = UPLOADS_DIR / f"{uuid.uuid4().hex}{extension}"   # random name: no clashes, no unsafe characters

    # Saved in 1 MB pieces, so a big video never sits in this function's memory all at once.
    # (The login and overall-size checks happen earlier, in main.py, before the body is read.)
    written = 0
    with destination.open("wb") as output:
        while chunk := await file.read(1024 * 1024):
            written += len(chunk)
            if written > max_bytes:
                output.close()
                destination.unlink()
                raise HTTPException(status_code=413, detail=f"That {kind} is over {MAX_UPLOAD_MB[kind]} MB — please export a smaller one")
            output.write(chunk)

    return {"url": f"/uploads/{destination.name}", "kind": kind}
