"""Application configuration package."""

from config.development import DevelopmentConfig
from config.production import ProductionConfig
from config.staging import StagingConfig
from config.testing import TestingConfig

CONFIG_BY_ENV = {
	"development": DevelopmentConfig,
	"staging": StagingConfig,
	"production": ProductionConfig,
	"testing": TestingConfig,
}

