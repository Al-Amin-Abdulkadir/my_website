# The database connection. get_db() hands each request its own session and
# always closes it afterwards (same pattern as MyLife).
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import NullPool
from app.config import DATABASE_URL, IS_ON_VERCEL

if IS_ON_VERCEL:
    # Vercel functions start and stop all the time, so a pool of open connections
    # would be left dangling. Each request opens one and closes it; Neon's own
    # connection pooler (the "-pooler" address) does the pooling instead.
    engine = create_engine(DATABASE_URL, poolclass=NullPool)
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
