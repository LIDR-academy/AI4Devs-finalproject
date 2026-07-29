"""initial schema: patients, encounters, clinical_events, audit_logs

Revision ID: 0001
Revises:
Create Date: 2026-07-08
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_now = sa.text("now()")


def upgrade() -> None:
    op.create_table(
        "patients",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("sex", sa.String(16), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=_now, nullable=False),
    )

    op.create_table(
        "encounters",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "patient_id",
            sa.String(36),
            sa.ForeignKey("patients.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("date", sa.Date(), nullable=True),
        sa.Column("type", sa.String(64), nullable=True),
        sa.Column("note_text", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=_now, nullable=False),
    )

    op.create_table(
        "clinical_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "encounter_id",
            sa.String(36),
            sa.ForeignKey("encounters.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "patient_id",
            sa.String(36),
            sa.ForeignKey("patients.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("category", sa.String(32), nullable=False, server_default="other"),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("event_date", sa.Date(), nullable=True),
        sa.Column("source_quote", sa.Text(), nullable=False, server_default=""),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0"),
        sa.Column("extraction_source", sa.String(32), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=_now, nullable=False),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("entity_type", sa.String(64), nullable=False),
        sa.Column("entity_id", sa.String(36), nullable=False),
        sa.Column("action", sa.String(64), nullable=False),
        sa.Column("actor", sa.String(64), nullable=False, server_default="system"),
        sa.Column("details", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=_now, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("clinical_events")
    op.drop_table("encounters")
    op.drop_table("patients")
