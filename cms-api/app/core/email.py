# Sending email (only the password-reset code, for now) through Resend's API.
# Uses Python's built-in urllib, so there's no extra package to install.
import json
import urllib.error
import urllib.request

from app.config import EMAIL_FROM, IS_ON_VERCEL, RESEND_API_KEY


class EmailNotSent(Exception):
    """The email couldn't be sent; the message says why."""


def send_password_reset_code(to: str, code: str) -> None:
    if not RESEND_API_KEY:
        if IS_ON_VERCEL:
            raise EmailNotSent("Email isn’t set up on the server — add RESEND_API_KEY (see cms-api/.env.example)")
        # Local development without a Resend key: show the code in the API's terminal instead
        print(f"\n[password reset] No RESEND_API_KEY set, so here is the code instead of an email: {code}\n", flush=True)
        return

    message = {
        "from": EMAIL_FROM,
        "to": [to],
        "subject": f"Your CMS reset code: {code}",
        "text": (
            "Someone (hopefully you) asked to reset the password for your portfolio CMS.\n\n"
            f"Your code is:  {code}\n\n"
            "Type it into the CMS. It works once, for 30 minutes.\n\n"
            "If this wasn’t you, ignore this email; your password stays the same."
        ),
    }
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(message).encode(),
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            # Resend sits behind Cloudflare, which blocks Python's default name
            # ("Python-urllib/…", common among spam bots) with error 1010
            "User-Agent": "portfolio-cms/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=10):
            pass
    except urllib.error.HTTPError as problem:
        raise EmailNotSent(f"Resend refused the email ({problem.code}): {problem.read().decode(errors='replace')[:200]}")
    except urllib.error.URLError as problem:
        raise EmailNotSent(f"Couldn’t reach Resend: {problem.reason}")
