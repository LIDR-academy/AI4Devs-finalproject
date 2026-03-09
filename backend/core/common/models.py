"""Shared SQLModel entities for cross-domain concerns."""

from datetime import datetime
from typing import ClassVar, TYPE_CHECKING

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
    timestamp: datetime = Field(default_factory=lambda: arrow.utcnow().datetime, nullable=False, index=True)
    details: str = Field(default="{}", nullable=False)

    user: "User" = Relationship(back_populates="audit_logs")
