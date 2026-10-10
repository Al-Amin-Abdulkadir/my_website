# Sets (or changes) the editor login in the database. Run from cms-api/:
#   python -m app.set_admin_password
# For the live database, point it there first:
#   DATABASE_URL='<neon url>' python -m app.set_admin_password
from getpass import getpass

from app.core.security import hash_password, password_problem
from app.database.db import SessionLocal
from app.database.models import AdminAccount

if __name__ == "__main__":
    email = input("Admin email: ").strip()
    password = getpass("New password (min 10 characters): ")
    problem = password_problem(password)
    if problem:
        raise SystemExit(problem)
    if getpass("Type it again: ") != password:
        raise SystemExit("The two passwords didn't match — nothing was changed.")

    with SessionLocal() as db:
        admin = db.get(AdminAccount, 1)
        if admin is None:
            db.add(AdminAccount(id=1, email=email, password_hash=hash_password(password)))
        else:
            admin.email, admin.password_hash = email, hash_password(password)
        db.commit()
    print("Saved. Log in with the new password (other sessions are logged out).")
