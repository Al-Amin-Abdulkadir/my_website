"""cover fit

Revision ID: 0aae79a18c41
Revises: 94a42837db4f
Create Date: 2026-10-10 17:12:33.245328

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0aae79a18c41'
down_revision: Union[str, Sequence[str], None] = '94a42837db4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """A cover can show whole in its Projects list card. Existing covers stay cropped to the card."""
    op.add_column("entries", sa.Column("cover_fit", sa.String(length=10), nullable=False, server_default="card"))


def downgrade() -> None:
    op.drop_column("entries", "cover_fit")
