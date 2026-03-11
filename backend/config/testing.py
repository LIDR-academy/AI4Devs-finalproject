"""Testing environment configuration."""

from config.default import DefaultConfig


class TestingConfig(DefaultConfig):
	"""Configuration used in test runs."""

	APP_ENV = "testing"
	DEBUG = False
	TESTING = True
	DATABASE_URL = "sqlite:///:memory:"
	USE_MEMORY_VERIFICATION_STORE = True  # Use in-memory Redis adapter for tests
	USE_MEMORY_FAILED_TASK_STORE = True
	CELERY_TASK_ALWAYS_EAGER = True
	CELERY_TASK_EAGER_PROPAGATES = True

