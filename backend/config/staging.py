"""Staging environment configuration."""

from config.default import DefaultConfig


class StagingConfig(DefaultConfig):
	"""Configuration used for staging validation."""

	APP_ENV = "staging"
	DEBUG = False

