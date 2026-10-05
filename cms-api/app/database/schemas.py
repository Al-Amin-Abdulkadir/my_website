# The shapes of data going in and out of the API (Pydantic models).
# Field names are snake_case in Python but sent as camelCase (coverUrl) so the
# JavaScript side reads naturally — that's what the alias_generator does.
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.alias_generators import to_camel


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


Kind = Literal["project", "case_study", "page"]
Align = Literal["left", "center", "right"]


# ── Blocks ────────────────────────────────────────────
# Each block type's content, with defaults. The editor sends `content` as a
# plain object; it's checked against the matching model below and cleaned up
# (missing fields get their defaults) before it reaches the database.

class HeadingContent(BaseModel):
    text: str = ""
    align: Align = "left"


class TextContent(BaseModel):
    body: str = ""
    align: Align = "left"


class ImageContent(BaseModel):
    src: str
    alt: str = ""
    align: Align = "center"
    width: int = Field(default=100, ge=10, le=100)      # % of the page width
    height: int | None = Field(default=None, ge=50, le=3000)   # px; empty = the image's own shape


class VideoContent(BaseModel):
    src: str
    align: Align = "center"
    width: int = Field(default=100, ge=10, le=100)
    height: int | None = Field(default=None, ge=50, le=3000)
    # "loop" plays silently on repeat like a moving image; "controls" shows play/pause/sound
    playback: Literal["loop", "controls"] = "loop"


BLOCK_CONTENT = {"heading": HeadingContent, "text": TextContent, "image": ImageContent, "video": VideoContent}


class BlockIn(ApiModel):
    type: Literal["heading", "text", "image", "video"]
    content: dict

    @model_validator(mode="after")
    def check_content_for_its_type(self):
        self.content = BLOCK_CONTENT[self.type].model_validate(self.content).model_dump()
        return self


class BlockOut(ApiModel):
    type: str
    content: dict


# ── Entries (projects, case studies, pages) ───────────

class EntrySummaryOut(ApiModel):
    id: int
    kind: str
    slug: str
    title: str
    category: str | None
    description: str | None
    tags: list[str]
    cover_url: str | None
    cover_position: str
    year: str | None
    is_published: bool


class EntryOut(EntrySummaryOut):
    github_url: str | None
    blocks: list[BlockOut]


class EntryCreate(ApiModel):
    kind: Literal["project", "case_study"]          # pages (About) already exist; they aren't created
    title: str = Field(min_length=1, max_length=200)


class EntrySave(ApiModel):
    """Everything the editor sends when you press Save — the whole entry at once."""
    slug: str = Field(pattern="^[a-z0-9]+(-[a-z0-9]+)*$", max_length=120)
    title: str = Field(min_length=1, max_length=200)
    category: str | None = None
    description: str | None = None
    tags: list[str] = []
    cover_url: str | None = None
    cover_position: Literal["center", "top", "bottom"] = "center"
    year: str | None = None
    github_url: str | None = None
    is_published: bool = True
    blocks: list[BlockIn] = []


class SearchItemOut(ApiModel):
    kind: str
    slug: str
    title: str
    category: str | None
    cover_url: str | None            # shown as a small preview beside the name
    cover_position: str


# ── Projects page rows ────────────────────────────────

class ProjectsPageRowOut(ApiModel):
    type: str
    main_project: EntrySummaryOut
    second_project: EntrySummaryOut | None
    large_side: str | None


class ProjectsPageRowIn(ApiModel):
    type: Literal["feature", "pair"]
    main_project_id: int
    second_project_id: int | None = None
    large_side: Literal["left", "right"] | None = None

    @model_validator(mode="after")
    def pair_needs_two_projects(self):
        if self.type == "pair" and (self.second_project_id is None or self.large_side is None):
            raise ValueError("A pair row needs a second project and a side for the large one")
        if self.type == "pair" and self.second_project_id == self.main_project_id:
            raise ValueError("A pair row needs two different projects")
        if self.type == "feature":
            self.second_project_id, self.large_side = None, None
        return self


# ── Home photos ───────────────────────────────────────

class HomePhotoData(ApiModel):
    image_url: str          # a photo or a video file
    alt: str = ""
    caption: str | None = None
    link_label: str | None = None
    link_url: str | None = None


# ── Site colours ──────────────────────────────────────

# The muted palette from the redesign (Personal Website Redesign/ColorType), plus pure white.
# The site maps each name to its colour in src/data/palette.js.
PaletteColor = Literal[
    "white",                                     # pure white — a plain option, not from the redesign
    "parchment", "old-paper", "weathered-stone", "stone-grey", "warm-charcoal", "obsidian-ink",
    "dusty-blue", "dusty-rose", "washed-lilac", "faded-ochre", "faded-plum", "weathered-teal",
    "sage-moss", "dried-olive", "burnt-clay", "faded-apricot",
]


class SiteSettingsData(ApiModel):
    background_color: PaletteColor
    text_color: PaletteColor

    @model_validator(mode="after")
    def text_must_differ_from_background(self):
        if self.background_color == self.text_color:
            raise ValueError("The text colour must be different from the background, or the words disappear")
        return self


# ── Login ─────────────────────────────────────────────

class LoginIn(ApiModel):
    email: str
    password: str


class ForgotPasswordIn(ApiModel):
    email: str


class VerifyResetCodeIn(ApiModel):
    email: str
    code: str = Field(pattern=r"^\d{6}$")    # exactly six digits


class ResetPasswordIn(ApiModel):
    token: str
    new_password: str = Field(min_length=10, max_length=72)   # bcrypt only reads the first 72 bytes
