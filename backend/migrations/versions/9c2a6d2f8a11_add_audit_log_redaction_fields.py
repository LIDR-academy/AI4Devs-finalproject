"""Add audit-log request correlation and IP redaction fields for US-010."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "9c2a6d2f8a11"
down_revision = "e34822ef5117"
branch_labels = None
depends_on = None


def upgrade() -> None:
	op.add_column("audit_logs", sa.Column("request_id", sa.String(length=128), nullable=True))
	op.add_column(
		"audit_logs",
		sa.Column("ip_redacted", sa.Boolean(), nullable=False, server_default=sa.false()),
	)
	op.add_column("audit_logs", sa.Column("ip_redaction_method", sa.String(length=64), nullable=True))
	op.add_column("audit_logs", sa.Column("ip_redacted_at", sa.DateTime(), nullable=True))
	op.create_index(op.f("ix_audit_logs_request_id"), "audit_logs", ["request_id"], unique=False)
	op.create_index(op.f("ix_audit_logs_ip_redacted"), "audit_logs", ["ip_redacted"], unique=False)


def downgrade() -> None:
	op.drop_index(op.f("ix_audit_logs_ip_redacted"), table_name="audit_logs")
	op.drop_index(op.f("ix_audit_logs_request_id"), table_name="audit_logs")
	op.drop_column("audit_logs", "ip_redacted_at")
	op.drop_column("audit_logs", "ip_redaction_method")
	op.drop_column("audit_logs", "ip_redacted")
	op.drop_column("audit_logs", "request_id")