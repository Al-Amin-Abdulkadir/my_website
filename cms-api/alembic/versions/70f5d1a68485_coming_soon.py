"""coming soon

Revision ID: 70f5d1a68485
Revises: 0aae79a18c41
Create Date: 2026-10-13 11:27:04.192424

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '70f5d1a68485'
down_revision: Union[str, Sequence[str], None] = '0aae79a18c41'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """An entry can be listed as "coming soon": shown on the site, but not openable. Existing entries open as before."""
    op.add_column("entries", sa.Column("is_coming_soon", sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    op.drop_column("entries", "is_coming_soon")
