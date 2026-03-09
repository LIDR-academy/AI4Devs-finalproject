"""Runtime configuration validation utilities."""

from __future__ import annotations

import os

from config.default import DEFAULT_SECRET_KEY

from core.common.exceptions import ValidationError

VALID_ENVS = {"development", "staging", "production", "testing"}
REQUIRED_SETTINGS = {"SECRET_KEY", "DATABASE_URL", "APP_ENV"}

# Dev defaults that should not be used in production
DEV_INTERNAL_API_KEY = "dev-internal-api-key"
DEV_ADMIN_TOKEN = "dev-admin-token"


def validate_env_config(config: dict) -> None:
	"""Validate required configuration keys and supported environment values."""
	missing = [key for key in REQUIRED_SETTINGS if not config.get(key)]
	if missing:
		missing_list = ", ".join(sorted(missing))
		raise ValidationError(f"Missing required configuration values: {missing_list}")

	app_env = config.get("APP_ENV")
	if app_env not in VALID_ENVS:
		raise ValidationError(f"APP_ENV '{app_env}' is not valid")

	env_app_env = (os.getenv("APP_ENV") or "").lower()
	config_app_env = (app_env or "").lower()
	if env_app_env == "production" or config_app_env == "production":
		secret_key = config.get("SECRET_KEY")
		if not secret_key or secret_key == DEFAULT_SECRET_KEY:
			raise ValidationError(
				"Invalid SECRET_KEY for production: SECRET_KEY is missing or uses the insecure default value"
			)

		# Validate INTERNAL_API_KEY is not using dev default in production
		internal_key = config.get("INTERNAL_API_KEY") or os.getenv("INTERNAL_API_KEY")
		if not internal_key or internal_key == DEV_INTERNAL_API_KEY:
			raise ValidationError(
				"Invalid INTERNAL_API_KEY for production: INTERNAL_API_KEY is missing or uses the insecure dev default"
			)

		# Validate ADMIN_TOKEN is not using dev default in production
		admin_token = config.get("ADMIN_TOKEN") or os.getenv("ADMIN_TOKEN")
		if not admin_token or admin_token == DEV_ADMIN_TOKEN:
			raise ValidationError(
				"Invalid ADMIN_TOKEN for production: ADMIN_TOKEN is missing or uses the insecure dev default"
			)

	if config.get("api_key_required") and not config.get("INTERNAL_API_KEY"):
		raise ValidationError(
			"Missing INTERNAL_API_KEY while api_key_required is enabled"
		)

