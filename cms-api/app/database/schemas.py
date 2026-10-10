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


class FocusPoint(BaseModel):
    """The part of a photo/video that stays in view when it's cropped to its box,
    as % from the left and from the top (50, 50 = the middle)."""
    x: float = Field(default=50, ge=0, le=100)
    y: float = Field(default=50, ge=0, le=100)


# How a photo/video sits in its box, like Figma:
#   fit  → the whole thing shows, leaving empty space if the shapes differ
#   fill → covers the box; `focus` picks which part stays in view
#   crop → fill, zoomed in by `zoom` around the focus point
# Only this framing is saved — the uploaded file itself is never changed.
Fit = Literal["fit", "fill", "crop"]


class ImageContent(BaseModel):
    src: str
    alt: str = ""
    align: Align = "center"
    width: int = Field(default=100, ge=10, le=100)      # % of the page width
    height: int | None = Field(default=None, ge=50, le=3000)   # px; empty = the image's own shape
    fit: Fit = "fill"
    focus: FocusPoint = FocusPoint()
    zoom: float = Field(default=1, ge=1, le=4)


class VideoContent(BaseModel):
    src: str
    align: Align = "center"
    width: int = Field(default=100, ge=10, le=100)
    height: int | None = Field(default=None, ge=50, le=3000)
    fit: Fit = "fill"
    focus: FocusPoint = FocusPoint()
    zoom: float = Field(default=1, ge=1, le=4)
    # "loop" plays silently on repeat like a moving image; "controls" shows play/pause/sound
    playback: Literal["loop", "controls"] = "loop"


# The blocks that can also sit inside a layout's columns
ITEM_CONTENT = {"heading": HeadingContent, "text": TextContent, "image": ImageContent, "video": VideoContent}


class LayoutItem(BaseModel):
    """One heading, text, image or video inside a layout column."""
    type: Literal["heading", "text", "image", "video"]
    content: dict

    @model_validator(mode="after")
    def check_content_for_its_type(self):
        self.content = ITEM_CONTENT[self.type].model_validate(self.content).model_dump()
        return self


class LayoutColumn(BaseModel):
    width: int = Field(ge=10, le=90)            # % of the row
    items: list[LayoutItem] = []                # stacked top to bottom


class LayoutContent(BaseModel):
    """A row split into columns, e.g. text on the left and an image on the right.
    Layouts can't hold other layouts, so a page is never more than two levels deep."""
    columns: list[LayoutColumn] = Field(min_length=2, max_length=4)
    vertical: Literal["top", "center", "bottom"] = "top"   # how shorter columns line up against taller ones
    # Space between columns AND between items stacked in a column (sizes in blocks.css)
    gap: Literal["none", "small", "medium", "large"] = "medium"

    @model_validator(mode="after")
    def widths_fill_the_row(self):
        total = sum(column.width for column in self.columns)
        if total != 100:
            raise ValueError(f"The column widths must add up to 100%, not {total}%")
        return self


BLOCK_CONTENT = {**ITEM_CONTENT, "layout": LayoutContent}


class BlockIn(ApiModel):
    type: Literal["heading", "text", "image", "video", "layout"]
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
    tags: list[str]                  # for filtering search by tag


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
    new_password: str

    @model_validator(mode="after")
    def password_must_be_usable(self):
        from app.core.security import password_problem
        problem = password_problem(self.new_password)
        if problem:
            raise ValueError(problem)
        return self
