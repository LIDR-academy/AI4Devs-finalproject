"""Shared SQLModel entities for cross-domain concerns."""

from datetime import datetime
from typing import ClassVar, TYPE_CHECKING, Optional

import arrow
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from core.users.models import User


class AuditLog(SQLModel, table=True):
    """Audit event persisted for security and traceability."""

    __tablename__: ClassVar[str] = "audit_logs"  # pyright: ignore[reportIncompatibleVariableOverride]

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    action: str = Field(nullable=False, max_length=120, index=True)
    resource_type: Optional[str] = Field(default=None, max_length=50, index=True)
    resource_id: Optional[int] = Field(default=None, index=True)
    timestamp: datetime = Field(default_factory=lambda: arrow.utcnow().datetime, nullable=False, index=True)
    details: str = Field(default="{}", nullable=False)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=255)
    request_id: Optional[str] = Field(default=None, max_length=128, index=True)
    ip_redacted: bool = Field(default=False, nullable=False, index=True)
    ip_redaction_method: Optional[str] = Field(default=None, max_length=64)
    ip_redacted_at: Optional[datetime] = Field(default=None)

    user: "User" = Relationship(back_populates="audit_logs")
