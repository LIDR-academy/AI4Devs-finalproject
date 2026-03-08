"""Production environment configuration."""

from config.default import DefaultConfig


class ProductionConfig(DefaultConfig):
	"""Configuration used for production deployments."""

	APP_ENV = "production"
	DEBUG = False

