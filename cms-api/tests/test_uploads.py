# Uploads: the editor sends files straight to Cloudinary; the API only signs them.
import hashlib
import time

import app.routes.admin as admin_routes


def use_cloudinary_settings(monkeypatch):
    # Pretend Cloudinary is configured (tests never hold real keys)
    monkeypatch.setattr(admin_routes, "CLOUDINARY_CLOUD_NAME", "demo-cloud")
    monkeypatch.setattr(admin_routes, "CLOUDINARY_API_KEY", "123456")
    monkeypatch.setattr(admin_routes, "CLOUDINARY_API_SECRET", "test-secret")


def test_signing_an_upload_needs_a_login(client, monkeypatch):
    use_cloudinary_settings(monkeypatch)
    assert client.post("/api/admin/uploads/signature").status_code == 401


def test_a_clear_message_when_cloudinary_is_not_set_up(admin, monkeypatch):
    monkeypatch.setattr(admin_routes, "CLOUDINARY_API_SECRET", "")
    response = admin.post("/api/admin/uploads/signature")
    assert response.status_code == 503
    assert "CLOUDINARY" in response.json()["detail"]


def test_the_signature_follows_cloudinarys_formula(admin, monkeypatch):
    use_cloudinary_settings(monkeypatch)
    response = admin.post("/api/admin/uploads/signature")
    assert response.status_code == 200, response.text
    body = response.json()
    fields = body["fields"]

    assert body["uploadUrl"] == "https://api.cloudinary.com/v1_1/demo-cloud/auto/upload"
    assert fields["api_key"] == "123456"
    assert fields["folder"] == "portfolio-cms"
    assert abs(fields["timestamp"] - time.time()) < 60

    # Cloudinary's rule: sorted "name=value" pairs joined by "&", plus the secret, SHA-1
    expected = hashlib.sha1(
        f"allowed_formats={fields['allowed_formats']}&folder=portfolio-cms&timestamp={fields['timestamp']}test-secret".encode()
    ).hexdigest()
    assert fields["signature"] == expected


def test_the_secret_itself_is_never_sent(admin, monkeypatch):
    use_cloudinary_settings(monkeypatch)
    assert "test-secret" not in admin.post("/api/admin/uploads/signature").text


def test_only_photo_and_video_formats_are_allowed(admin, monkeypatch):
    use_cloudinary_settings(monkeypatch)
    formats = admin.post("/api/admin/uploads/signature").json()["fields"]["allowed_formats"].split(",")
    assert set(formats) == {"jpg", "jpeg", "png", "webp", "gif", "mp4", "webm", "mov"}
