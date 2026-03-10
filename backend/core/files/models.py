"""File SQLModel definition."""

from datetime import datetime
from typing import TYPE_CHECKING

import arrow
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
	from core.users.models import User


class File(SQLModel, table=True):
	"""File metadata persisted for uploaded IPFS objects."""

	__tablename__ = "files"

	id: int | None = Field(default=None, primary_key=True)
	cid: str = Field(index=True, unique=True, nullable=False, max_length=255)
	user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
	original_filename: str = Field(nullable=False, max_length=255)
	safe_filename: str = Field(nullable=False, max_length=255)
	size: int = Field(nullable=False)
	pinned: bool = Field(default=True, nullable=False)
	uploaded_at: datetime = Field(default_factory=lambda: arrow.utcnow().datetime, nullable=False)

	user: "User" = Relationship(back_populates="files")


