"""Runtime configuration validation utilities."""

from __future__ import annotations

import os

from config.default import DEFAULT_SECRET_KEY

from core.common.exceptions import ValidationError

VALID_ENVS = {"development", "staging", "production", "testing"}
REQUIRED_SETTINGS = {"SECRET_KEY", "DATABASE_URL", "APP_ENV"}


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

	if config.get("api_key_required") and not config.get("INTERNAL_API_KEY"):
		raise ValidationError(
			"Missing INTERNAL_API_KEY while api_key_required is enabled"
		)

