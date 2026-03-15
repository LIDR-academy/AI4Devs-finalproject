"""Runtime configuration validation utilities."""

from __future__ import annotations

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

