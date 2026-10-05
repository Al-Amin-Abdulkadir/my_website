# The reset email itself — checked without actually sending anything.
import json

import pytest

import app.core.email as email


class CaughtRequest:
    """Stands in for urllib's urlopen and remembers the request instead of sending it."""
    def __init__(self):
        self.request = None

    def __call__(self, request, timeout):
        self.request = request
        return self

    def __enter__(self):
        return self

    def __exit__(self, *problem):
        return False


@pytest.fixture
def caught(monkeypatch):
    monkeypatch.setattr(email, "RESEND_API_KEY", "re_test_key")
    caught = CaughtRequest()
    monkeypatch.setattr(email.urllib.request, "urlopen", caught)
    return caught


def test_the_email_goes_to_resend_with_the_code(caught):
    email.send_password_reset_code("me@example.com", "048213")
    body = json.loads(caught.request.data)
    assert caught.request.full_url == "https://api.resend.com/emails"
    assert body["to"] == ["me@example.com"]
    assert "048213" in body["subject"] and "048213" in body["text"]


def test_the_request_names_itself_so_cloudflare_lets_it_through(caught):
    # Without this, Resend's Cloudflare blocks Python's default "Python-urllib" name (error 1010)
    email.send_password_reset_code("me@example.com", "123456")
    assert caught.request.get_header("User-agent") == "portfolio-cms/1.0"


def test_without_a_key_the_live_server_says_so(monkeypatch):
    monkeypatch.setattr(email, "RESEND_API_KEY", "")
    monkeypatch.setattr(email, "IS_ON_VERCEL", True)
    with pytest.raises(email.EmailNotSent, match="RESEND_API_KEY"):
        email.send_password_reset_code("me@example.com", "123456")
