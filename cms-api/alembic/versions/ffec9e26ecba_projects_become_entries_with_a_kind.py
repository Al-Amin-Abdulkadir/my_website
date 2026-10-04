"""projects become entries with a kind

Revision ID: ffec9e26ecba
Revises: 2efee6e2ba04
Create Date: 2026-10-04 20:02:36.516889

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ffec9e26ecba'
down_revision: Union[str, Sequence[str], None] = '2efee6e2ba04'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Projects, case studies and pages (About) are all "a page made of blocks",
    so `projects` becomes `entries` with a `kind`. Renaming (not drop + create)
    keeps every existing row."""
    op.rename_table("projects", "entries")
    op.rename_table("project_blocks", "entry_blocks")
    op.alter_column("entry_blocks", "project_id", new_column_name="entry_id")

    # Tidy the names Postgres made for the old tables so they match the new ones
    op.execute("ALTER SEQUENCE projects_id_seq RENAME TO entries_id_seq")
    op.execute("ALTER SEQUENCE project_blocks_id_seq RENAME TO entry_blocks_id_seq")
    op.execute("ALTER INDEX projects_pkey RENAME TO entries_pkey")
    op.execute("ALTER INDEX project_blocks_pkey RENAME TO entry_blocks_pkey")
    op.execute("ALTER INDEX ix_project_blocks_project_id RENAME TO ix_entry_blocks_entry_id")

    op.add_column("entries", sa.Column("kind", sa.String(20), nullable=False, server_default="project"))
    op.create_index("ix_entries_kind", "entries", ["kind"])

    # An address only has to be unique within its kind (a project and a case study may share one)
    op.drop_index("ix_projects_slug", table_name="entries")
    op.create_unique_constraint("uq_entries_kind_slug", "entries", ["kind", "slug"])

    # The About page exists from the start, as an empty draft ready to be written
    op.execute(
        "INSERT INTO entries (kind, slug, title, tags, cover_position, is_published) "
        "VALUES ('page', 'about', 'About Me', '[]', 'center', false)"
    )


def downgrade() -> None:
    op.execute("DELETE FROM entries WHERE kind <> 'project'")
    op.drop_constraint("uq_entries_kind_slug", "entries", type_="unique")
    op.create_index("ix_projects_slug", "entries", ["slug"], unique=True)
    op.drop_index("ix_entries_kind", table_name="entries")
    op.drop_column("entries", "kind")

    op.execute("ALTER INDEX ix_entry_blocks_entry_id RENAME TO ix_project_blocks_project_id")
    op.execute("ALTER INDEX entry_blocks_pkey RENAME TO project_blocks_pkey")
    op.execute("ALTER INDEX entries_pkey RENAME TO projects_pkey")
    op.execute("ALTER SEQUENCE entry_blocks_id_seq RENAME TO project_blocks_id_seq")
    op.execute("ALTER SEQUENCE entries_id_seq RENAME TO projects_id_seq")

    op.alter_column("entry_blocks", "entry_id", new_column_name="project_id")
    op.rename_table("entry_blocks", "project_blocks")
    op.rename_table("entries", "projects")
