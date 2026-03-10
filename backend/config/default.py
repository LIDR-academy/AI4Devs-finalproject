"""Base configuration values shared across all environments."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DEFAULT_SECRET_KEY = "change-me-in-production"


def _split_csv(value: str) -> list[str]:
	"""Split a comma-separated environment value into a clean list."""
	return [item.strip() for item in value.split(",") if item.strip()]


class DefaultConfig:
	"""Default Flask application configuration."""

	APP_NAME = "ipfs-gateway"
	APP_ENV = os.getenv("APP_ENV", "development")
	DEBUG = os.getenv("APP_DEBUG", "false").lower() == "true"
	TESTING = False

	HOST = os.getenv("HOST", "0.0.0.0")
	PORT = int(os.getenv("PORT", "5000"))

	SECRET_KEY = os.getenv("SECRET_KEY", DEFAULT_SECRET_KEY)
	DATABASE_NAME = os.getenv("DATABASE_NAME", "ipfs_gateway.db")
	DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_NAME}")
	SQLALCHEMY_ECHO = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"
	DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
	DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))

	REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
	CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
	CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)
	CELERY_TASK_SERIALIZER = os.getenv("CELERY_TASK_SERIALIZER", "json")
	CELERY_RESULT_SERIALIZER = os.getenv("CELERY_RESULT_SERIALIZER", "json")
	CELERY_ACCEPT_CONTENT = [
		c.strip() for c in os.getenv("CELERY_ACCEPT_CONTENT", "json").split(",") if c.strip()
	]
	CELERY_TIMEZONE = os.getenv("CELERY_TIMEZONE", "UTC")
	CELERY_TASK_TRACK_STARTED = os.getenv("CELERY_TASK_TRACK_STARTED", "true").lower() == "true"
	CELERY_TASK_TIME_LIMIT = int(os.getenv("CELERY_TASK_TIME_LIMIT", "300"))
	CELERY_TASK_SOFT_TIME_LIMIT = int(os.getenv("CELERY_TASK_SOFT_TIME_LIMIT", "270"))
	CELERY_TASK_DEFAULT_QUEUE = os.getenv("CELERY_TASK_DEFAULT_QUEUE", "default")
	CELERY_TASK_ROUTES = {
		"core.tasks.file_tasks.upload_file_async": {"queue": "upload"},
		"core.tasks.pinning_tasks.pin_content_async": {"queue": "pinning"},
		"core.tasks.pinning_tasks.unpin_content_async": {"queue": "pinning"},
	}

	CELERY_FAILED_TASKS_REDIS_URL = os.getenv("CELERY_FAILED_TASKS_REDIS_URL", "redis://localhost:6379/1")
	CELERY_FAILED_TASKS_KEY = os.getenv("CELERY_FAILED_TASKS_KEY", "celery:failed_tasks")

	FILEBASE_ACCESS_KEY = os.getenv("FILEBASE_ACCESS_KEY", "")
	FILEBASE_SECRET_KEY = os.getenv("FILEBASE_SECRET_KEY", "")
	FILEBASE_BUCKET = os.getenv("FILEBASE_BUCKET", "")
	FILEBASE_ENDPOINT = os.getenv("FILEBASE_ENDPOINT", "https://s3.filebase.com")

	INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "dev-internal-api-key")
	ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "dev-admin-token")
	ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
	CORS_METHODS = _split_csv(os.getenv("CORS_METHODS", "GET,POST,OPTIONS"))
	CORS_ALLOW_HEADERS = _split_csv(os.getenv("CORS_ALLOW_HEADERS", "Content-Type,X-API-Key,X-Request-ID"))
	CORS_EXPOSE_HEADERS = _split_csv(
		os.getenv(
			"CORS_EXPOSE_HEADERS",
			"X-RateLimit-Limit,X-RateLimit-Remaining,X-RateLimit-Reset,Retry-After,X-Request-ID",
		)
	)
	CORS_MAX_AGE = int(os.getenv("CORS_MAX_AGE", "3600"))
	CORS_SUPPORTS_CREDENTIALS = os.getenv("CORS_SUPPORTS_CREDENTIALS", "false").lower() == "true"

	MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", str(100 * 1024 * 1024)))

	RATE_LIMIT_DEFAULT = os.getenv("RATE_LIMIT_DEFAULT", "300/hour")
	RATE_LIMIT_REGISTRATION = os.getenv("RATE_LIMIT_REGISTRATION", "5/hour")
	RATE_LIMIT_UPLOAD = os.getenv("RATE_LIMIT_UPLOAD", "20/hour")
	RATE_LIMIT_RETRIEVE = os.getenv("RATE_LIMIT_RETRIEVE", "100/hour")
	RATE_LIMIT_PINNING = os.getenv("RATE_LIMIT_PINNING", "50/hour")
	RATE_LIMIT_STATUS = os.getenv("RATE_LIMIT_STATUS", "10/hour")
	RATE_LIMIT_RENEW = os.getenv("RATE_LIMIT_RENEW", "10/hour")
	RATE_LIMIT_ADMIN = os.getenv("RATE_LIMIT_ADMIN", "100/hour")
	RATE_LIMIT_TASKS = os.getenv("RATE_LIMIT_TASKS", "60/hour")
	RATELIMIT_STORAGE_URI = os.getenv(
		"RATELIMIT_STORAGE_URI",
		"memory://" if APP_ENV == "testing" else REDIS_URL,
	)
	RATELIMIT_HEADERS_ENABLED = os.getenv("RATELIMIT_HEADERS_ENABLED", "true").lower() == "true"
	RATELIMIT_STRATEGY = os.getenv("RATELIMIT_STRATEGY", "fixed-window")

	SECURITY_HEADER_X_CONTENT_TYPE_OPTIONS = os.getenv(
		"SECURITY_HEADER_X_CONTENT_TYPE_OPTIONS",
		"nosniff",
	)
	SECURITY_HEADER_X_FRAME_OPTIONS = os.getenv("SECURITY_HEADER_X_FRAME_OPTIONS", "DENY")
	SECURITY_HEADER_REFERRER_POLICY = os.getenv("SECURITY_HEADER_REFERRER_POLICY", "no-referrer")
	SECURITY_HEADER_CONTENT_SECURITY_POLICY = os.getenv(
		"SECURITY_HEADER_CONTENT_SECURITY_POLICY",
		"default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
	)
	REQUEST_ID_HEADER = os.getenv("REQUEST_ID_HEADER", "X-Request-ID")
	AUDIT_LOG_DEFERRED_WRITE = os.getenv("AUDIT_LOG_DEFERRED_WRITE", "true").lower() == "true"
	AUDIT_IP_RETENTION_DAYS = int(os.getenv("AUDIT_IP_RETENTION_DAYS", "90"))
	AUDIT_IP_REDACTION_MODE = os.getenv("AUDIT_IP_REDACTION_MODE", "mask")
	AUDIT_REDACTION_BATCH_SIZE = int(os.getenv("AUDIT_REDACTION_BATCH_SIZE", "200"))

	LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
	LOG_FILE = os.getenv("LOG_FILE", "logs/app.log")

