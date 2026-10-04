# Loads seed/site_content.json (made by scripts/export_site_content.mjs) into the database.
#   python -m app.seed            → only runs on an empty database
#   python -m app.seed --replace  → wipes CMS content first, then loads (careful!)
import json
import sys

from sqlalchemy import delete, select

from app.config import BASE_DIR
from app.database.db import SessionLocal
from app.database.models import Entry, EntryBlock, HomePhoto, ProjectsPageRow

SEED_FILE = BASE_DIR / "seed" / "site_content.json"


def seed(replace_existing: bool):
    content = json.loads(SEED_FILE.read_text())
    db = SessionLocal()
    try:
        has_content = db.scalar(select(Entry.id).where(Entry.kind == "project").limit(1)) is not None
        if has_content and not replace_existing:
            print("The database already has projects. Run with --replace to wipe and reload.")
            return
        if replace_existing:
            for table in (ProjectsPageRow, EntryBlock, Entry, HomePhoto):
                db.execute(delete(table))

        projects_by_slug = {}
        for item in content["projects"]:
            project = Entry(
                kind="project", slug=item["slug"], title=item["title"], category=item["category"],
                description=item["description"], tags=item["tags"], cover_url=item["cover_url"],
                cover_position=item["cover_position"], year=item["year"], github_url=item["github_url"],
            )
            project.blocks = [
                EntryBlock(position=index, type=block["type"], content=block["content"])
                for index, block in enumerate(item["blocks"])
            ]
            db.add(project)
            projects_by_slug[project.slug] = project
        db.flush()   # gives every project its id, which the rows below need

        for index, row in enumerate(content["projects_page_rows"]):
            is_feature = row["type"] == "feature"
            db.add(ProjectsPageRow(
                position=index,
                type=row["type"],
                main_project_id=projects_by_slug[row["project"] if is_feature else row["large"]].id,
                second_project_id=None if is_feature else projects_by_slug[row["small"]].id,
                large_side=None if is_feature else row["largeSide"],
            ))

        for index, photo in enumerate(content["home_photos"]):
            link = photo.get("link")
            db.add(HomePhoto(
                position=index, image_url=photo["src"], alt=photo["alt"], caption=photo["caption"],
                link_label=link["label"] if link else None, link_url=link["url"] if link else None,
            ))

        # The About page always exists, as a draft ready to be written in the editor.
        # The migration that created `entries` already adds it, so only add it if it's missing
        # (adding it twice would break the one-address-per-kind rule and fail the whole import).
        about_exists = db.scalar(select(Entry.id).where(Entry.kind == "page", Entry.slug == "about")) is not None
        if not about_exists:
            db.add(Entry(kind="page", slug="about", title="About Me", tags=[], is_published=False))

        db.commit()
        print(f"Loaded {len(content['projects'])} projects, "
              f"{len(content['projects_page_rows'])} page rows, {len(content['home_photos'])} home photos")
    finally:
        db.close()


if __name__ == "__main__":
    seed(replace_existing="--replace" in sys.argv)
