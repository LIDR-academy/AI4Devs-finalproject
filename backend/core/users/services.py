"""User domain services."""

from __future__ import annotations

from sqlmodel import Session, select

from core import get_engine
from core.common.exceptions import ValidationError
from core.common.models import AuditLog
from core.common.validators import validate_email, validate_password
from core.users.models import User


def register_user(email: str, password: str) -> dict[str, str]:
	"""Register a new user account and return API key credentials."""
	engine = get_engine()
	if engine is None:
		raise ValidationError("Database engine is not initialized")

	normalized_email = validate_email(email)
	validated_password = validate_password(password)

	with Session(engine) as session:
		existing = session.exec(select(User).where(User.email == normalized_email)).first()
		if existing is not None:
			raise ValidationError("Email already registered")

		api_key = _generate_unique_api_key(session)
		user = User(email=normalized_email, password_hash="", api_key=api_key, is_active=True)
		user.set_password(validated_password)

		session.add(user)
		session.flush()

		audit = AuditLog(
			user_id=user.id,
			action="user_registered",
			details=f'{{"email": "{normalized_email}"}}',
		)
		session.add(audit)
		session.commit()

		return {"email": user.email, "api_key": user.api_key}


def _generate_unique_api_key(session: Session) -> str:
	"""Generate a unique API key value, retrying on collision."""
	for _ in range(5):
		candidate = User.generate_api_key()
		exists = session.exec(select(User).where(User.api_key == candidate)).first()
		if exists is None:
			return candidate
	raise ValidationError("Unable to generate unique API key")

