"""cover zoom

Revision ID: 94a42837db4f
Revises: fda0038205a1
Create Date: 2026-10-10 16:47:54.167516

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '94a42837db4f'
down_revision: Union[str, Sequence[str], None] = 'fda0038205a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Covers can be zoomed in the Projects list. Existing covers start at 1 (no zoom)."""
    op.add_column("entries", sa.Column("cover_zoom", sa.Float(), nullable=False, server_default="1"))


def downgrade() -> None:
    op.drop_column("entries", "cover_zoom")
