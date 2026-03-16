"""Database metadata imports used by migrations and app startup."""

# Import models so SQLModel metadata is complete for Alembic autogenerate.
from core.common.models import AuditLog  # noqa: F401
from core.files.models import File  # noqa: F401
from core.users.models import User  # noqa: F401
