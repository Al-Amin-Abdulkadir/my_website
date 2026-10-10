# Forgot password → 6-digit code by email → enter the code → new password.
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import update

import app.routes.auth as auth_routes
from app.database.db import engine
from app.database.models import AdminAccount
from tests.conftest import TEST_EMAIL, TEST_PASSWORD


@pytest.fixture
def sent_codes(monkeypatch):
    """Catches the emailed codes instead of sending them; each is (to, code)."""
    sent = []
    monkeypatch.setattr(auth_routes, "send_password_reset_code", lambda to, code: sent.append((to, code)))
    return sent


def ask_for_code(client, sent_codes, email=TEST_EMAIL):
    assert client.post("/api/auth/forgot-password", json={"email": email}).status_code == 200
    return sent_codes[-1][1] if sent_codes else None


def enter_code(client, code, email=TEST_EMAIL):
    return client.post("/api/auth/verify-reset-code", json={"email": email, "code": code})


def wrong_code_for(code):
    return f"{(int(code) + 1) % 1_000_000:06d}"


def full_reset(client, sent_codes, new_password="a-brand-new-password"):
    token = enter_code(client, ask_for_code(client, sent_codes)).json()["resetToken"]
    return client.post("/api/auth/reset-password", json={"token": token, "newPassword": new_password})


def test_the_admin_gets_a_six_digit_code(client, sent_codes):
    code = ask_for_code(client, sent_codes)
    assert sent_codes[0][0] == TEST_EMAIL
    assert len(code) == 6 and code.isdigit()


def test_a_wrong_email_gets_the_same_answer_and_no_code(client, sent_codes):
    admin_answer = client.post("/api/auth/forgot-password", json={"email": TEST_EMAIL}).json()
    stranger_answer = client.post("/api/auth/forgot-password", json={"email": "someone@else.com"}).json()
    assert admin_answer == stranger_answer          # nothing reveals which email is the admin's
    assert len(sent_codes) == 1


def test_the_right_code_then_a_new_password_works(client, sent_codes):
    assert full_reset(client, sent_codes).status_code == 200
    assert client.post("/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD}).status_code == 401
    assert client.post("/api/auth/login", json={"email": TEST_EMAIL, "password": "a-brand-new-password"}).status_code == 200


def test_a_wrong_code_is_refused(client, sent_codes):
    code = ask_for_code(client, sent_codes)
    assert enter_code(client, wrong_code_for(code)).status_code == 400


def test_a_code_works_only_once(client, sent_codes):
    code = ask_for_code(client, sent_codes)
    assert enter_code(client, code).status_code == 200
    assert enter_code(client, code).status_code == 400


def test_five_wrong_tries_kill_the_code(client, sent_codes):
    code = ask_for_code(client, sent_codes)
    for _ in range(5):
        enter_code(client, wrong_code_for(code))
    response = enter_code(client, code)            # even the right code is refused now
    assert response.status_code == 400


def test_the_fifth_wrong_try_says_to_ask_for_a_new_code(client, sent_codes):
    code = ask_for_code(client, sent_codes)
    for _ in range(4):
        enter_code(client, wrong_code_for(code))
    assert "Ask for a new code" in enter_code(client, wrong_code_for(code)).json()["detail"]


def test_a_code_stops_working_after_30_minutes(client, sent_codes):
    code = ask_for_code(client, sent_codes)
    with engine.begin() as connection:
        connection.execute(update(AdminAccount).values(
            reset_code_expires_at=datetime.now(timezone.utc) - timedelta(seconds=1)))
    assert enter_code(client, code).status_code == 400


def pretend_a_minute_has_passed():
    # Moves the current code's issue time back 61 seconds (past the cooldown)
    with engine.begin() as connection:
        connection.execute(update(AdminAccount).values(
            reset_code_expires_at=AdminAccount.reset_code_expires_at - timedelta(seconds=61)))


def test_asking_again_within_a_minute_sends_nothing_new(client, sent_codes):
    first = ask_for_code(client, sent_codes)
    response = client.post("/api/auth/forgot-password", json={"email": TEST_EMAIL})
    assert response.status_code == 200              # same friendly answer…
    assert len(sent_codes) == 1                     # …but no second email
    assert enter_code(client, first).status_code == 200   # and the first code still works


def test_after_a_minute_a_new_code_replaces_the_old_one(client, sent_codes):
    first = ask_for_code(client, sent_codes)
    pretend_a_minute_has_passed()
    second = ask_for_code(client, sent_codes)
    assert len(sent_codes) == 2
    if first != second:                             # (a one-in-a-million chance they match)
        assert enter_code(client, first).status_code == 400
    assert enter_code(client, second).status_code == 200


def test_a_password_over_72_bytes_is_refused_with_a_clear_message(client, sent_codes):
    token = enter_code(client, ask_for_code(client, sent_codes)).json()["resetToken"]
    too_long = "é" * 40                              # 40 letters, but 80 bytes
    response = client.post("/api/auth/reset-password", json={"token": token, "newPassword": too_long})
    assert response.status_code == 422
    assert "72 bytes" in response.text


def test_an_over_long_login_password_is_just_a_wrong_password(client):
    response = client.post("/api/auth/login", json={"email": TEST_EMAIL, "password": "é" * 40})
    assert response.status_code == 401


def test_the_code_must_be_six_digits(client, sent_codes):
    ask_for_code(client, sent_codes)
    assert enter_code(client, "12ab56").status_code == 422
    assert enter_code(client, "12345").status_code == 422


def test_a_right_code_with_the_wrong_email_is_refused(client, sent_codes):
    code = ask_for_code(client, sent_codes)
    assert enter_code(client, code, email="someone@else.com").status_code == 400


def test_the_new_password_must_be_at_least_10_characters(client, sent_codes):
    assert full_reset(client, sent_codes, new_password="short").status_code == 422


def test_a_login_cookie_cannot_be_used_to_reset(admin):
    login_token = admin.cookies.get("access_token")
    response = admin.post("/api/auth/reset-password", json={"token": login_token, "newPassword": "sneaky-new-password"})
    assert response.status_code == 400


def test_resetting_logs_out_every_other_session(admin, client, sent_codes):
    assert admin.get("/api/auth/me").status_code == 200
    full_reset(client, sent_codes)
    assert admin.get("/api/auth/me").status_code == 401


def test_a_clear_error_when_email_is_not_set_up_on_the_server(client, monkeypatch):
    def cannot_send(to, code):
        raise auth_routes.EmailNotSent("Email isn’t set up on the server — add RESEND_API_KEY")
    monkeypatch.setattr(auth_routes, "send_password_reset_code", cannot_send)
    response = client.post("/api/auth/forgot-password", json={"email": TEST_EMAIL})
    assert response.status_code == 503
    assert "RESEND_API_KEY" in response.json()["detail"]


def test_wrong_guesses_sent_at_the_same_moment_are_all_counted(sent_codes, monkeypatch):
    # The code review's blocker: guesses sent in parallel all read "0 wrong tries" and
    # all wrote "1", so a wave of guesses cost only one try. Each guess here comes from
    # its own browser (TestClient), all at once.
    import time
    from concurrent.futures import ThreadPoolExecutor
    from fastapi.testclient import TestClient
    from app.main import app

    # Make checking a code slow (as a busy server might be), so the guesses really
    # overlap between "read the wrong-try count" and "save the new count"
    real_check = auth_routes.reset_code_matches
    def slow_check(code, stored_hash):
        time.sleep(0.2)
        return real_check(code, stored_hash)
    monkeypatch.setattr(auth_routes, "reset_code_matches", slow_check)

    with TestClient(app) as asker:
        code = ask_for_code(asker, sent_codes)

    def guess_wrong(_):
        with TestClient(app) as guesser:
            return enter_code(guesser, wrong_code_for(code)).status_code

    with ThreadPoolExecutor(max_workers=20) as pool:
        list(pool.map(guess_wrong, range(20)))

    with TestClient(app) as owner:
        assert enter_code(owner, code).status_code == 400   # 20 wrong guesses kill the code
