"""Unit tests for configuration validation helpers."""

import unittest
from pathlib import Path
import sys

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


if __name__ == "__main__":
    unittest.main()
