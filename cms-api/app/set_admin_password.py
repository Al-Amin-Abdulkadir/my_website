# Sets (or changes) the editor login. Run:  python -m app.set_admin_password
# Writes ADMIN_EMAIL and a bcrypt hash of the password into cms-api/.env.
from getpass import getpass

from app.config import BASE_DIR
from app.core.security import hash_password

ENV_FILE = BASE_DIR / ".env"


def set_env_value(lines: list[str], key: str, value: str) -> list[str]:
    kept = [line for line in lines if not line.startswith(f"{key}=")]
    return kept + [f"{key}={value}"]


if __name__ == "__main__":
    email = input("Admin email: ").strip()
    password = getpass("New password (min 10 characters): ")
    if len(password) < 10:
        raise SystemExit("Too short — use at least 10 characters.")
    if getpass("Type it again: ") != password:
        raise SystemExit("The two passwords didn't match — nothing was changed.")

    lines = ENV_FILE.read_text().splitlines()
    lines = set_env_value(lines, "ADMIN_EMAIL", email)
    lines = set_env_value(lines, "ADMIN_PASSWORD_HASH", hash_password(password))
    ENV_FILE.write_text("\n".join(lines) + "\n")
    print("Saved. Restart the API so it picks up the new login.")
