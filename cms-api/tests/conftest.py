# Shared setup for every test (pytest reads this file first).
#
# The tests use their OWN database (portfolio_cms_test), so they can wipe and
# refill everything without touching real content.
# These settings must be in place before the app is imported, because app/config.py
# reads them the moment it loads.
import os

import bcrypt

os.environ["DATABASE_URL"] = "postgresql://alamin@localhost/portfolio_cms_test"
os.environ["SECRET_KEY"] = "test-secret-key-not-used-anywhere-real"

TEST_EMAIL = "admin@example.com"
TEST_PASSWORD = "correct-horse-battery"
TEST_PASSWORD_HASH = bcrypt.hashpw(TEST_PASSWORD.encode(), bcrypt.gensalt()).decode()

import pytest  # noqa: E402
from alembic import command  # noqa: E402  (imports below must come after the settings above)
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.config import BASE_DIR, DATABASE_URL  # noqa: E402
from app.database.db import engine  # noqa: E402
from app.main import app  # noqa: E402

assert DATABASE_URL.endswith("/portfolio_cms_test"), "Refusing to run tests against a non-test database"


@pytest.fixture(scope="session", autouse=True)
def migrated_database():
    """Once per test run: build the test database from scratch with the real migrations
    (so the migrations themselves get tested too)."""
    alembic_config = Config(str(BASE_DIR / "alembic.ini"))
    alembic_config.set_main_option("script_location", str(BASE_DIR / "alembic"))
    command.downgrade(alembic_config, "base")
    command.upgrade(alembic_config, "head")
    yield


@pytest.fixture(autouse=True)
def clean_database():
    """Before every test: empty the tables, then put back the rows a fresh install has
    (the About page, the site colours) plus a test admin login, so each test starts
    from the same known state."""
    with engine.begin() as connection:
        connection.execute(text(
            "TRUNCATE entries, entry_blocks, projects_page_rows, home_photos, site_settings, admin_account "
            "RESTART IDENTITY CASCADE"))
        connection.execute(
            text("INSERT INTO admin_account (id, email, password_hash) VALUES (1, :email, :hash)"),
            {"email": TEST_EMAIL, "hash": TEST_PASSWORD_HASH})
        connection.execute(text(
            "INSERT INTO entries (kind, slug, title, tags, cover_position, is_published) "
            "VALUES ('page', 'about', 'About Me', '[]', 'center', false)"))
        connection.execute(text(
            "INSERT INTO site_settings (id, background_color, text_color) VALUES (1, 'parchment', 'obsidian-ink')"))
    yield


@pytest.fixture
def client():
    """A pretend browser that talks to the API (no login)."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def admin():
    """A second pretend browser, logged in as the editor. It's separate from `client`
    on purpose: a test that uses both is then really checking what a logged-out
    visitor sees, and can catch a public page that only works when logged in."""
    with TestClient(app) as admin_client:
        response = admin_client.post("/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        assert response.status_code == 200, response.text
        yield admin_client


@pytest.fixture
def make_project(admin):
    """Creates a project through the API and returns its id: make_project("Nomad", published=True)."""
    def make(title, published=True):
        project = admin.post("/api/admin/entries", json={"kind": "project", "title": title}).json()
        if published:
            saved = admin.put(f"/api/admin/entries/{project['id']}", json={
                "slug": project["slug"], "title": title, "isPublished": True, "blocks": []})
            assert saved.status_code == 200, saved.text
        return project["id"]
    return make
