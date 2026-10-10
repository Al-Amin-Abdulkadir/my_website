# The CMS's tables. Everything the public site shows that Alamin should be able
# to edit without touching code lives here.
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base

# The kinds of entry, and the address each one lives at on the site
ENTRY_KINDS = {
    "project": "/project/",
    "case_study": "/case-study/",
    "page": "/",              # standalone pages like About (/about)
}


class Entry(Base):
    """A page made of blocks: a project, a case study, or a standalone page (About).
    They share one table and one editor because they're built the same way."""
    __tablename__ = "entries"
    __table_args__ = (UniqueConstraint("kind", "slug", name="uq_entries_kind_slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(20), default="project", index=True)
    slug: Mapped[str] = mapped_column(String(120))   # the address: /project/<slug>, /case-study/<slug>, /<slug>
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list[str]] = mapped_column(JSONB, default=list)
    cover_url: Mapped[str | None] = mapped_column(String(500))
    cover_position: Mapped[str] = mapped_column(String(20), default="center")  # which part of the cover stays visible: "top"/"center"/"bottom" or a focus point "40% 25%"
    cover_zoom: Mapped[float] = mapped_column(Float, default=1.0, server_default="1")  # 1 = no zoom, up to 4
    year: Mapped[str | None] = mapped_column(String(10))
    github_url: Mapped[str | None] = mapped_column(String(500))
    is_published: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    blocks: Mapped[list["EntryBlock"]] = relationship(
        back_populates="entry",
        order_by="EntryBlock.position",
        cascade="all, delete-orphan",   # deleting an entry deletes its blocks
    )


class EntryBlock(Base):
    """One piece of an entry's page, in order — like a block in Behance's editor.

    `content` depends on `type` (see BlockIn in schemas.py for the full list):
        heading → {"text", "align"}
        text    → {"body", "align"}
        image   → {"src", "alt", "align", "width", "height"}
        video   → {"src", "align", "width", "height", "playback"}
    align is "left" | "center" | "right". New block types only need a new `type`
    value, not a new table.
    """
    __tablename__ = "entry_blocks"

    id: Mapped[int] = mapped_column(primary_key=True)
    entry_id: Mapped[int] = mapped_column(ForeignKey("entries.id", ondelete="CASCADE"), index=True)
    position: Mapped[int]
    type: Mapped[str] = mapped_column(String(20))
    content: Mapped[dict] = mapped_column(JSONB, default=dict)

    entry: Mapped[Entry] = relationship(back_populates="blocks")


class ProjectsPageRow(Base):
    """One row of the Projects page grid, top to bottom.

    feature → one big project (main_project)
    pair    → a large project (main_project) beside a small one (second_project);
              large_side says which side the large one sits on
    """
    __tablename__ = "projects_page_rows"

    id: Mapped[int] = mapped_column(primary_key=True)
    position: Mapped[int]
    type: Mapped[str] = mapped_column(String(20))
    main_project_id: Mapped[int] = mapped_column(ForeignKey("entries.id", ondelete="CASCADE"))
    second_project_id: Mapped[int | None] = mapped_column(ForeignKey("entries.id", ondelete="CASCADE"))
    large_side: Mapped[str | None] = mapped_column(String(10))

    main_project: Mapped[Entry] = relationship(foreign_keys=[main_project_id])
    second_project: Mapped[Entry | None] = relationship(foreign_keys=[second_project_id])


class HomePhoto(Base):
    """A photo or video in the Home page cloud, with the caption/link shown when
    it's brought forward. `image_url` may point at a video file."""
    __tablename__ = "home_photos"

    id: Mapped[int] = mapped_column(primary_key=True)
    position: Mapped[int]
    image_url: Mapped[str] = mapped_column(String(500))
    alt: Mapped[str] = mapped_column(String(300), default="")
    caption: Mapped[str | None] = mapped_column(Text)
    link_label: Mapped[str | None] = mapped_column(String(100))
    link_url: Mapped[str | None] = mapped_column(String(500))


class SiteSettings(Base):
    """Site-wide choices made in the CMS. There is only ever one row (id 1).

    Colours are stored by palette name ("parchment", "dusty-blue"…), not hex codes,
    so only colours from the site's muted palette can be chosen.
    """
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    background_color: Mapped[str] = mapped_column(String(30), default="parchment")
    text_color: Mapped[str] = mapped_column(String(30), default="obsidian-ink")


class AdminAccount(Base):
    """The one person who can use the editor. It lives in the database (not .env)
    so the password can be reset from the site itself. There is only ever one row (id 1)."""
    __tablename__ = "admin_account"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254))
    password_hash: Mapped[str] = mapped_column(String(100))
    password_changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # "Forgot password?" emails a 6-digit code. Only its hash is kept, with when it
    # stops working and how many wrong guesses have been made (5 kills it).
    reset_code_hash: Mapped[str | None] = mapped_column(String(64))
    reset_code_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reset_code_wrong_tries: Mapped[int] = mapped_column(default=0, server_default="0")
