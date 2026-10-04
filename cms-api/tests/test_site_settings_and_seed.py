# Site colours, and loading the original content into a fresh database.
import re
from typing import get_args

from sqlalchemy import func, select

from app.database.db import SessionLocal
from app.config import BASE_DIR
from app.database.models import Entry
from app.database.schemas import PaletteColor
from app.seed import seed


def test_the_site_starts_with_the_redesign_colours(client):
    assert client.get("/api/site-settings").json() == {"backgroundColor": "parchment", "textColor": "obsidian-ink"}


def test_changing_the_colours_needs_a_login(client):
    response = client.put("/api/admin/site-settings", json={"backgroundColor": "dusty-blue", "textColor": "obsidian-ink"})
    assert response.status_code == 401


def test_the_editor_can_change_the_colours(admin, client):
    response = admin.put("/api/admin/site-settings", json={"backgroundColor": "dusty-blue", "textColor": "obsidian-ink"})
    assert response.status_code == 200, response.text
    assert client.get("/api/site-settings").json()["backgroundColor"] == "dusty-blue"


def test_the_cms_and_the_site_know_the_same_colours():
    # The palette is listed twice: PaletteColor (schemas.py) and PALETTE (src/data/palette.js).
    # If one is edited and the other forgotten, this fails instead of the live site.
    palette_js = (BASE_DIR.parent / "src" / "data" / "palette.js").read_text()
    site_keys = set(re.findall(r"\{ key: '([a-z-]+)'", palette_js))
    assert site_keys == set(get_args(PaletteColor))


def test_pure_white_can_be_the_background(admin, client):
    response = admin.put("/api/admin/site-settings", json={"backgroundColor": "white", "textColor": "obsidian-ink"})
    assert response.status_code == 200
    assert client.get("/api/site-settings").json()["backgroundColor"] == "white"


def test_loading_the_original_content_into_a_fresh_database_works():
    # The review's first blocker: the migration already creates the About page, and
    # the import used to add it a second time and fail.
    seed(replace_existing=False)
    with SessionLocal() as db:
        about_pages = db.scalar(select(func.count()).select_from(Entry).where(Entry.kind == "page", Entry.slug == "about"))
        projects = db.scalar(select(func.count()).select_from(Entry).where(Entry.kind == "project"))
    assert about_pages == 1
    assert projects == 14
