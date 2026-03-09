"""User SQLModel definition and domain helpers."""

import secrets
from datetime import datetime
from typing import TYPE_CHECKING, List

import arrow
from sqlmodel import Field, Relationship, SQLModel
from werkzeug.security import check_password_hash, generate_password_hash

if TYPE_CHECKING:
	from core.common.models import AuditLog
	from core.files.models import File


class User(SQLModel, table=True):
	"""User account persisted in the database."""

	__tablename__ = "users"

	id: int | None = Field(default=None, primary_key=True)
	email: str = Field(index=True, unique=True, nullable=False, max_length=255)
	password_hash: str = Field(nullable=False, max_length=255)
	api_key: str = Field(index=True, unique=True, nullable=False, max_length=100)
	is_active: bool = Field(default=True, nullable=False)
	is_admin: bool = Field(default=False, nullable=False)
	is_deleted: bool = Field(default=False, nullable=False)
	usage_count: int = Field(default=0, nullable=False)
	created_at: datetime = Field(default_factory=lambda: arrow.utcnow().datetime, nullable=False)
	updated_at: datetime = Field(default_factory=lambda: arrow.utcnow().datetime, nullable=False)
	last_renewed_at: datetime | None = Field(default=None, nullable=True)

	files: List["File"] = Relationship(back_populates="user")
	audit_logs: List["AuditLog"] = Relationship(back_populates="user")

	def set_password(self, password: str) -> None:
		"""Hash and persist a plain text password."""
		self.password_hash = generate_password_hash(password)
		self.updated_at = arrow.utcnow().datetime

	def verify_password(self, password: str) -> bool:
		"""Verify a plain text password against the stored hash."""
		return check_password_hash(self.password_hash, password)

	@staticmethod
	def generate_api_key() -> str:
		"""Generate a gateway API key with project prefix."""
		return f"ipfs_gw_{secrets.token_hex(32)}"

	def renew_api_key(self) -> str:
		"""Rotate API key and return the newly generated value."""
		self.api_key = self.generate_api_key()
		now = arrow.utcnow().datetime
		self.last_renewed_at = now
		self.updated_at = now
		return self.api_key

	def increment_usage(self) -> None:
		"""Increment the API usage counter."""
		self.usage_count += 1
		self.updated_at = arrow.utcnow().datetime

	def soft_delete(self) -> None:
		"""Mark user as deleted while keeping historical data."""
		self.is_deleted = True
		self.is_active = False
		self.updated_at = arrow.utcnow().datetime

	def revoke(self) -> None:
		"""Revoke current key by rotating credentials and disabling user."""
		self.api_key = self.generate_api_key()
		self.is_active = False
		self.updated_at = arrow.utcnow().datetime

	def reactivate(self) -> None:
		"""Reactivate a revoked user account."""
		self.is_active = True
		self.updated_at = arrow.utcnow().datetime


class UserCreate(SQLModel):
	"""Input payload for user registration."""

	email: str
	password: str


class UserResponse(SQLModel):
	"""Public response payload for user account details."""

	id: int
	email: str
	api_key: str
	is_active: bool


class UserStatus(SQLModel):
	"""Response payload for key/account status endpoints."""

	api_key_status: str
	created_at: datetime
	last_renewed_at: datetime | None
	usage_count: int

