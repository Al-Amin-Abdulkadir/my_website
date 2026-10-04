# Uploading photos and videos.
from pathlib import Path

from app.config import UPLOADS_DIR

TINY_GIF = b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"


def test_uploading_needs_a_login(client):
    response = client.post("/api/admin/uploads", files={"file": ("a.gif", TINY_GIF, "image/gif")})
    assert response.status_code == 401


def test_an_image_upload_is_saved_and_served(admin):
    response = admin.post("/api/admin/uploads", files={"file": ("a.gif", TINY_GIF, "image/gif")})
    assert response.status_code == 200
    uploaded = response.json()
    assert uploaded["kind"] == "image"
    assert (UPLOADS_DIR / Path(uploaded["url"]).name).read_bytes() == TINY_GIF
    assert admin.get(uploaded["url"]).content == TINY_GIF


def test_a_video_upload_is_recognised_as_a_video(admin):
    response = admin.post("/api/admin/uploads", files={"file": ("clip.mp4", b"not really a video", "video/mp4")})
    assert response.json()["kind"] == "video"


def test_other_file_types_are_refused(admin):
    response = admin.post("/api/admin/uploads", files={"file": ("notes.pdf", b"%PDF", "application/pdf")})
    assert response.status_code == 415


def test_a_too_big_upload_is_refused_before_it_is_read(admin):
    # The review found the size was only checked after the whole file had arrived.
    # Declaring 300 MB must be turned away straight from the headers.
    response = admin.post(
        "/api/admin/uploads",
        content=b"",
        headers={"Content-Length": str(300 * 1024 * 1024), "Content-Type": "multipart/form-data; boundary=x"},
    )
    assert response.status_code == 413
