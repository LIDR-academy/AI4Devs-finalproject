"""Create users, files and audit logs tables."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0001_initial_models"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("api_key", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("usage_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("last_renewed_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("api_key"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_api_key", "users", ["api_key"], unique=True)

    op.create_table(
        "files",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("cid", sa.String(length=255), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("safe_filename", sa.String(length=255), nullable=False),
        sa.Column("size", sa.Integer(), nullable=False),
        sa.Column("pinned", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("uploaded_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "cid", name="uq_files_user_id_cid"),
    )
    op.create_index("ix_files_cid", "files", ["cid"], unique=False)
    op.create_index("ix_files_user_id", "files", ["user_id"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("details", sa.Text(), nullable=False, server_default="{}"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"], unique=False)
    op.create_index("ix_audit_logs_timestamp", "audit_logs", ["timestamp"], unique=False)
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_audit_logs_user_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_timestamp", table_name="audit_logs")
    op.drop_index("ix_audit_logs_action", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index("ix_files_user_id", table_name="files")
    op.drop_index("ix_files_cid", table_name="files")
    op.drop_table("files")

    op.drop_index("ix_users_api_key", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
