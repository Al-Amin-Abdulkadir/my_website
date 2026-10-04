"""fill in block defaults

Revision ID: fa3419f9f0f3
Revises: ffec9e26ecba
Create Date: 2026-10-04 20:08:05.858508

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fa3419f9f0f3'
down_revision: Union[str, Sequence[str], None] = 'ffec9e26ecba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Blocks saved before alignment/size existed only have {src, alt} or {body}.
    Run each one through the same checks the editor's Save uses, so every block
    in the database has the full shape (e.g. images: align center, width 100)."""
    import json

    # The defaults as they were when this migration was written — copied here (not
    # imported from the app) so running it later can never give different results
    defaults = {
        "heading": {"text": "", "align": "left"},
        "text": {"body": "", "align": "left"},
        "image": {"alt": "", "align": "center", "width": 100, "height": None},
        "video": {"align": "center", "width": 100, "height": None, "playback": "loop"},
    }

    connection = op.get_bind()
    blocks = connection.execute(sa.text("SELECT id, type, content FROM entry_blocks")).all()
    for block_id, block_type, content in blocks:
        complete = {**defaults[block_type], **content}
        connection.execute(
            sa.text("UPDATE entry_blocks SET content = CAST(:content AS jsonb) WHERE id = :id"),
            {"content": json.dumps(complete), "id": block_id},
        )


def downgrade() -> None:
    # Nothing to undo: the extra fields are just defaults the site already assumed
    pass
