# Editing endpoints — every route here requires the admin login.
import re
import time

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_FOLDER
from app.core.security import sign_cloudinary_upload
from app.database.db import get_db
from app.database.models import Entry, EntryBlock, HomePhoto, ProjectsPageRow, SiteSettings
from app.database.schemas import (
    EntryCreate, EntryOut, EntrySave, EntrySummaryOut, HomePhotoData,
    Kind, ProjectsPageRowIn, ProjectsPageRowOut, SiteSettingsData,
)
from app.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])

# What the editor may upload (Cloudinary refuses anything else in a signed upload)
ALLOWED_UPLOAD_FORMATS = "jpg,jpeg,png,webp,gif,mp4,webm,mov"


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


# Measured: past 20 photos the cloud gets crowded on phones (a third of the photos
# mostly hidden at 40). The editor (HomePhotosEditor.jsx) shows the same limit.
MAX_HOME_PHOTOS = 20


@router.put("/home-photos", response_model=list[HomePhotoData])
def save_home_photos(photos: list[HomePhotoData], db: Session = Depends(get_db)):
    """Replace the whole list of Home photos (in the order sent)."""
    if len(photos) > MAX_HOME_PHOTOS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"The Home cloud holds at most {MAX_HOME_PHOTOS} photos — you sent {len(photos)}. "
                   "Remove some before saving.",
        )
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

@router.post("/uploads/signature")
def sign_upload():
    """The editor uploads photos and videos straight to Cloudinary, because Vercel
    functions refuse requests over 4.5 MB. This hands the editor a signed permission
    slip — proof it came from a logged-in editor — without ever sharing the Cloudinary
    secret. Cloudinary accepts it for any number of uploads for about an hour, which is
    fine because only the logged-in editor can get one."""
    if not (CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET):
        raise HTTPException(
            status_code=503,
            detail="Uploads aren’t set up yet — add the CLOUDINARY_* settings to the API (see cms-api/.env.example)",
        )

    signed_params = {
        "allowed_formats": ALLOWED_UPLOAD_FORMATS,
        "folder": CLOUDINARY_FOLDER,
        "timestamp": int(time.time()),
    }
    return {
        "uploadUrl": f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/auto/upload",
        # Exactly the form fields Cloudinary expects alongside the file
        "fields": {
            **signed_params,
            "api_key": CLOUDINARY_API_KEY,
            "signature": sign_cloudinary_upload(signed_params, CLOUDINARY_API_SECRET),
        },
    }


# TEMPORARY (2026-10-10): uploads fail live with "Invalid Signature" and Vercel won't
# show the stored values. This asks Cloudinary whether the key + secret this server
# actually has are a valid pair, and gives each value's length and a short fingerprint
# (the first 8 characters of its SHA-256 hash, which can't be turned back into the
# value) to compare with cms-api/.env. Remove once uploads work.
@router.get("/uploads/check")
def check_upload_settings():
    import base64
    import hashlib
    import urllib.error
    import urllib.request

    def describe(value: str) -> dict:
        return {
            "length": len(value),
            "fingerprint": hashlib.sha256(value.encode()).hexdigest()[:8],
            "hasSpacesAtEnds": value != value.strip(),
        }

    credentials = base64.b64encode(f"{CLOUDINARY_API_KEY}:{CLOUDINARY_API_SECRET}".encode()).decode()
    ping = urllib.request.Request(
        f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/ping",
        headers={"Authorization": f"Basic {credentials}"},
    )
    try:
        with urllib.request.urlopen(ping, timeout=15) as response:
            cloudinary_says = f"accepted ({response.status})"
    except urllib.error.HTTPError as error:
        cloudinary_says = f"refused ({error.code})"
    except urllib.error.URLError as error:
        cloudinary_says = f"could not reach Cloudinary: {error.reason}"

    return {
        "cloudinarySays": cloudinary_says,
        "cloudName": describe(CLOUDINARY_CLOUD_NAME),
        "apiKey": describe(CLOUDINARY_API_KEY),
        "apiSecret": describe(CLOUDINARY_API_SECRET),
    }
