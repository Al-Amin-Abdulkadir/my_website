# The rules about what content is allowed in (schemas.py) — checked without the database.
import pytest
from pydantic import ValidationError

from app.database.schemas import BlockIn, ProjectsPageRowIn, SiteSettingsData


def test_an_image_block_gets_its_missing_settings_filled_in():
    block = BlockIn(type="image", content={"src": "/photo.jpg"})
    assert block.content == {"src": "/photo.jpg", "alt": "", "align": "center", "width": 100, "height": None}


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
