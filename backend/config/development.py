"""Development environment configuration."""

from config.default import DefaultConfig


class DevelopmentConfig(DefaultConfig):
	"""Configuration used for local development."""

	APP_ENV = "development"
	DEBUG = True

