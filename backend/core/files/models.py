"""File SQLModel definition."""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

import arrow
from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
	from core.users.models import User


class File(SQLModel, table=True):
	"""File metadata persisted for uploaded IPFS objects."""

	__tablename__ = "files"
	__table_args__ = (UniqueConstraint("user_id", "cid", name="uq_files_user_id_cid"),)

	id: int | None = Field(default=None, primary_key=True)
	cid: str = Field(index=True, nullable=False, max_length=255)
	user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
	original_filename: str = Field(nullable=False, max_length=255)
	safe_filename: str = Field(nullable=False, max_length=255)
	storage_key: Optional[str] = Field(default=None, max_length=255)
	size: int = Field(nullable=False)
	mime_type: Optional[str] = Field(default=None, max_length=255)
	pinned: bool = Field(default=True, nullable=False)
	uploaded_at: datetime = Field(default_factory=lambda: arrow.utcnow().datetime, nullable=False)
	retrieval_count: int = Field(default=0, nullable=False)
	last_retrieved_at: Optional[datetime] = Field(default=None)
	deleted_at: Optional[datetime] = Field(default=None, index=True)

	user: "User" = Relationship(back_populates="files")


