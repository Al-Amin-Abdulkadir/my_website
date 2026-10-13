# Read-only endpoints the public website uses. Only published entries are shown.
# "Coming soon" entries are listed (title and cover) but can't be opened.
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Entry, HomePhoto, ProjectsPageRow, SiteSettings
from app.database.schemas import EntryOut, EntrySummaryOut, HomePhotoData, ProjectsPageRowOut, SearchItemOut, SiteSettingsData

router = APIRouter(prefix="/api", tags=["public"])


def published_entry(db: Session, kind: str, slug: str) -> Entry:
    """One entry's full page. A "coming soon" entry is refused here too, not only
    unlinked on the site, so typing its address can't open it early."""
    entry = db.scalar(select(Entry).where(Entry.kind == kind, Entry.slug == slug, Entry.is_published))
    if entry is None:
        raise HTTPException(status_code=404, detail=f"Nothing published at '{slug}'")
    if entry.is_coming_soon:
        raise HTTPException(status_code=404, detail=f"'{slug}' is coming soon")
    return entry


def published_entries(db: Session, kind: str) -> list[Entry]:
    return db.scalars(select(Entry).where(Entry.kind == kind, Entry.is_published).order_by(Entry.id)).all()


# ── Projects ──────────────────────────────────────────

@router.get("/projects", response_model=list[EntrySummaryOut])
def list_projects(db: Session = Depends(get_db)):
    return published_entries(db, "project")


@router.get("/projects/{slug}", response_model=EntryOut)
def get_project(slug: str, db: Session = Depends(get_db)):
    return published_entry(db, "project", slug)


@router.get("/projects-page", response_model=list[ProjectsPageRowOut])
def get_projects_page(db: Session = Depends(get_db)):
    """The Projects page grid. Rows with an unpublished project are skipped, and any
    published project that isn't placed in a row yet is added at the end as a
    feature row — so a new project can never go missing from the page."""
    rows = db.scalars(select(ProjectsPageRow).order_by(ProjectsPageRow.position)).all()
    visible_rows = [
        row for row in rows
        if row.main_project.is_published and (row.second_project is None or row.second_project.is_published)
    ]

    # Only rows that are actually shown count as "placed" — otherwise a published project
    # paired with a draft would be hidden with that row and never added at the end either
    placed_ids = {row.main_project_id for row in visible_rows} | {row.second_project_id for row in visible_rows}
    unplaced = [project for project in published_entries(db, "project") if project.id not in placed_ids]
    extra_rows = [
        {"type": "feature", "main_project": project, "second_project": None, "large_side": None}
        for project in unplaced
    ]
    return visible_rows + extra_rows


# ── Case studies ──────────────────────────────────────

@router.get("/case-studies", response_model=list[EntrySummaryOut])
def list_case_studies(db: Session = Depends(get_db)):
    return published_entries(db, "case_study")


@router.get("/case-studies/{slug}", response_model=EntryOut)
def get_case_study(slug: str, db: Session = Depends(get_db)):
    return published_entry(db, "case_study", slug)


# ── Standalone pages (About) ──────────────────────────

@router.get("/pages/{slug}", response_model=EntryOut)
def get_page(slug: str, db: Session = Depends(get_db)):
    return published_entry(db, "page", slug)


# ── Search ────────────────────────────────────────────

@router.get("/search-index", response_model=list[SearchItemOut])
def get_search_index(db: Session = Depends(get_db)):
    """Every published project, case study and page — just enough to search by name and tag.
    The site is small, so the browser filters this list itself as you type."""
    return db.scalars(select(Entry).where(Entry.is_published).order_by(Entry.kind, Entry.title)).all()


# ── Home photos ───────────────────────────────────────

@router.get("/home-photos", response_model=list[HomePhotoData])
def list_home_photos(db: Session = Depends(get_db)):
    return db.scalars(select(HomePhoto).order_by(HomePhoto.position)).all()


# ── Site colours ──────────────────────────────────────

@router.get("/site-settings", response_model=SiteSettingsData)
def get_site_settings(db: Session = Depends(get_db)):
    settings = db.get(SiteSettings, 1)
    if settings is None:
        raise HTTPException(status_code=500, detail="Site settings are missing — run the database migrations")
    return settings
