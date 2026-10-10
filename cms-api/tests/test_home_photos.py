# The Home page photo cloud: at most 20 photos (more gets crowded on phones).
import re

from app.config import BASE_DIR
from app.routes.admin import MAX_HOME_PHOTOS


def photos(count):
    return [{"imageUrl": f"https://example.com/{number}.jpg", "alt": ""} for number in range(count)]


def test_up_to_20_photos_can_be_saved(admin):
    response = admin.put("/api/admin/home-photos", json=photos(20))
    assert response.status_code == 200, response.text
    assert len(response.json()) == 20


def test_a_21st_photo_is_refused_with_a_clear_reason_and_nothing_changes(admin):
    admin.put("/api/admin/home-photos", json=photos(3))
    response = admin.put("/api/admin/home-photos", json=photos(21))
    assert response.status_code == 422
    assert "at most 20 photos" in response.json()["detail"]
    assert len(admin.get("/api/admin/home-photos").json()) == 3     # the old list is untouched


def test_the_editor_shows_the_same_limit_as_the_api():
    # The limit is written twice: here and in the editor, which disables "+ Add" at the limit
    editor = (BASE_DIR.parent / "src" / "admin" / "HomePhotosEditor.jsx").read_text()
    assert re.search(r"const MAX_HOME_PHOTOS = (\d+)", editor).group(1) == str(MAX_HOME_PHOTOS)
