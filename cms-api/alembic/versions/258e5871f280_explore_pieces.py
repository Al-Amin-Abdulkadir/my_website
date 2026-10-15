"""explore pieces

Revision ID: 258e5871f280
Revises: 70f5d1a68485
Create Date: 2026-10-15 23:01:06.147043

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '258e5871f280'
down_revision: Union[str, Sequence[str], None] = '70f5d1a68485'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """The Explore page's pieces (it replaces Case Studies on the site)."""
    op.create_table('explore_pieces',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('media_url', sa.String(length=500), nullable=False),
    sa.Column('shape', sa.String(length=20), nullable=False),
    sa.Column('width', sa.Integer(), nullable=True),
    sa.Column('height', sa.Integer(), nullable=True),
    sa.Column('category', sa.String(length=20), nullable=True),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('caption', sa.Text(), nullable=True),
    sa.Column('link_label', sa.String(length=100), nullable=True),
    sa.Column('link_url', sa.String(length=500), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('explore_pieces')
