"""Unit tests for configuration validation helpers."""

import os
import unittest
from pathlib import Path
import sys
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.validate_config import validate_env_config
from core.common.exceptions import ValidationError


class TestConfigValidation(unittest.TestCase):
    """Validate environment settings integrity checks."""

    def test_valid_config_passes(self) -> None:
        """A complete and valid config should pass validation."""
        config = {
            "SECRET_KEY": "secret",
            "DATABASE_URL": "sqlite:///test.db",
            "APP_ENV": "testing",
        }
        validate_env_config(config)

    def test_missing_required_key_raises_validation_error(self) -> None:
        """Missing settings should raise a ValidationError with key details."""
        config = {
            "SECRET_KEY": "secret",
            "DATABASE_URL": "sqlite:///test.db",
            "APP_ENV": "",
        }
        with self.assertRaises(ValidationError):
            validate_env_config(config)

    def test_invalid_env_raises_validation_error(self) -> None:
        """Unsupported APP_ENV values should be rejected."""
        config = {
            "SECRET_KEY": "secret",
            "DATABASE_URL": "sqlite:///test.db",
            "APP_ENV": "invalid",
        }
        with self.assertRaises(ValidationError):
            validate_env_config(config)

    def test_production_rejects_insecure_default_secret(self) -> None:
        """Production config must not accept the insecure default secret key value."""
        config = {
            "SECRET_KEY": "change-me-in-production",
            "DATABASE_URL": "sqlite:///test.db",
            "APP_ENV": "production",
        }
        with self.assertRaises(ValidationError) as ctx:
            validate_env_config(config)

        self.assertIn("Invalid SECRET_KEY for production", str(ctx.exception))

    def test_env_override_to_production_rejects_insecure_default_secret(self) -> None:
        """os.environ APP_ENV=production should enforce production key validation."""
        config = {
            "SECRET_KEY": "change-me-in-production",
            "DATABASE_URL": "sqlite:///test.db",
            "APP_ENV": "testing",
        }
        with patch.dict(os.environ, {"APP_ENV": "production"}, clear=False):
            with self.assertRaises(ValidationError) as ctx:
                validate_env_config(config)

        self.assertIn("Invalid SECRET_KEY for production", str(ctx.exception))

    def test_api_key_required_missing_internal_key_raises_validation_error(self) -> None:
        """Enabled API key guard must require INTERNAL_API_KEY in config."""
        config = {
            "SECRET_KEY": "secret",
            "DATABASE_URL": "sqlite:///test.db",
            "APP_ENV": "testing",
            "api_key_required": True,
            "INTERNAL_API_KEY": "",
        }

        with self.assertRaises(ValidationError) as ctx:
            validate_env_config(config)

        self.assertIn("Missing INTERNAL_API_KEY while api_key_required is enabled", str(ctx.exception))

    def test_api_key_not_required_does_not_require_internal_key(self) -> None:
        """When API key guard is disabled, INTERNAL_API_KEY may be omitted."""
        config = {
            "SECRET_KEY": "secret",
            "DATABASE_URL": "sqlite:///test.db",
            "APP_ENV": "testing",
            "api_key_required": False,
            "INTERNAL_API_KEY": "",
        }

        validate_env_config(config)


if __name__ == "__main__":
    unittest.main()
