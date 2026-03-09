"""Base configuration values shared across all environments."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DEFAULT_SECRET_KEY = "change-me-in-production"


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

	FILEBASE_ACCESS_KEY = os.getenv("FILEBASE_ACCESS_KEY", "")
	FILEBASE_SECRET_KEY = os.getenv("FILEBASE_SECRET_KEY", "")
	FILEBASE_BUCKET = os.getenv("FILEBASE_BUCKET", "")
	FILEBASE_ENDPOINT = os.getenv("FILEBASE_ENDPOINT", "https://s3.filebase.com")

	INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "dev-internal-api-key")
	ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "dev-admin-token")
	ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")

	LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
	LOG_FILE = os.getenv("LOG_FILE", "logs/app.log")

