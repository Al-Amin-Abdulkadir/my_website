# The rules about what content is allowed in (schemas.py) — checked without the database.
import pytest
from pydantic import ValidationError

from app.database.schemas import BlockIn, ProjectsPageRowIn, SiteSettingsData


def test_an_image_block_gets_its_missing_settings_filled_in():
    block = BlockIn(type="image", content={"src": "/photo.jpg"})
    assert block.content == {
        "src": "/photo.jpg", "alt": "", "align": "center", "width": 100, "height": None,
        "fit": "fill", "focus": {"x": 50, "y": 50}, "zoom": 1,
    }


def test_a_text_block_keeps_what_was_written():
    block = BlockIn(type="text", content={"body": "Hello", "align": "right"})
    assert block.content == {"body": "Hello", "align": "right"}


@pytest.mark.parametrize("content", [
    {"body": "x", "align": "middle"},        # the word is "center", not "middle"
    {"body": "x", "align": "LEFT"},
])
def test_a_block_with_an_unknown_position_is_refused(content):
    with pytest.raises(ValidationError):
        BlockIn(type="text", content=content)


@pytest.mark.parametrize("width", [3, 0, 101, -50])
def test_media_width_must_be_between_10_and_100_percent(width):
    with pytest.raises(ValidationError):
        BlockIn(type="image", content={"src": "/a.jpg", "width": width})


def test_an_image_block_without_a_file_is_refused():
    with pytest.raises(ValidationError):
        BlockIn(type="image", content={"alt": "no src"})


def test_an_unknown_block_type_is_refused():
    with pytest.raises(ValidationError):
        BlockIn(type="carousel", content={})


def test_a_pair_row_cannot_use_the_same_project_twice():
    with pytest.raises(ValidationError, match="two different projects"):
        ProjectsPageRowIn(type="pair", main_project_id=1, second_project_id=1, large_side="left")


def test_a_feature_row_drops_pair_only_settings():
    row = ProjectsPageRowIn(type="feature", main_project_id=1, second_project_id=2, large_side="left")
    assert (row.second_project_id, row.large_side) == (None, None)


def test_text_and_background_cannot_be_the_same_colour():
    with pytest.raises(ValidationError, match="must be different"):
        SiteSettingsData(background_color="sage-moss", text_color="sage-moss")


def test_only_palette_colours_are_allowed():
    with pytest.raises(ValidationError):
        SiteSettingsData(background_color="#ff0000", text_color="obsidian-ink")


# ── Layout blocks (a row split into columns) ─────────────

def layout(columns, **extra):
    return {"columns": columns, **extra}


def test_a_layout_fills_in_the_settings_of_the_items_inside_it():
    block = BlockIn(type="layout", content=layout([
        {"width": 40, "items": [{"type": "text", "content": {"body": "Hi"}}]},
        {"width": 60, "items": [{"type": "image", "content": {"src": "/a.jpg"}}]},
    ]))
    left, right = block.content["columns"]
    assert block.content["vertical"] == "top"
    assert block.content["gap"] == "medium"
    assert left["items"][0]["content"] == {"body": "Hi", "align": "left"}
    assert right["items"][0]["content"]["width"] == 100


def test_a_layout_column_can_be_empty_while_you_build_it():
    BlockIn(type="layout", content=layout([{"width": 50}, {"width": 50}]))


@pytest.mark.parametrize("widths", [[50, 40], [60, 60], [34, 33, 34]])
def test_layout_column_widths_must_add_up_to_100(widths):
    with pytest.raises(ValidationError, match="add up to 100"):
        BlockIn(type="layout", content=layout([{"width": width} for width in widths]))


@pytest.mark.parametrize("count", [1, 5])
def test_a_layout_has_two_to_four_columns(count):
    with pytest.raises(ValidationError):
        BlockIn(type="layout", content=layout([{"width": 100 // count}] * count))


def test_items_inside_a_layout_are_checked_like_normal_blocks():
    with pytest.raises(ValidationError):   # an image with no file
        BlockIn(type="layout", content=layout([{"width": 50, "items": [{"type": "image", "content": {}}]}, {"width": 50}]))


def test_a_layout_cannot_hold_another_layout():
    inner = {"type": "layout", "content": layout([{"width": 50}, {"width": 50}])}
    with pytest.raises(ValidationError):
        BlockIn(type="layout", content=layout([{"width": 50, "items": [inner]}, {"width": 50}]))


# ── Fit / Fill / Crop ─────────────────────────────────────

def test_a_cropped_photo_keeps_its_focus_point_and_zoom():
    block = BlockIn(type="image", content={"src": "/a.jpg", "fit": "crop", "focus": {"x": 20, "y": 75.5}, "zoom": 2.5})
    assert (block.content["fit"], block.content["focus"], block.content["zoom"]) == ("crop", {"x": 20, "y": 75.5}, 2.5)


@pytest.mark.parametrize("framing", [
    {"fit": "stretch"},                  # not one of fit / fill / crop
    {"zoom": 0.5},                       # zooming out would leave gaps in the box
    {"zoom": 10},
    {"focus": {"x": 120, "y": 50}},      # the focus point must be on the photo
])
def test_impossible_framing_is_refused(framing):
    with pytest.raises(ValidationError):
        BlockIn(type="video", content={"src": "/a.mp4", **framing})


def test_a_layout_gap_must_be_one_of_the_named_sizes():
    BlockIn(type="layout", content=layout([{"width": 50}, {"width": 50}], gap="none"))
    with pytest.raises(ValidationError):
        BlockIn(type="layout", content=layout([{"width": 50}, {"width": 50}], gap="12px"))
