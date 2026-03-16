"""Unit tests for Flask logging configuration."""

import tempfile
import unittest
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from flask import Flask

from server.config.logs import configure_logging


class TestLoggingConfiguration(unittest.TestCase):
    """Validate logging output target setup."""

    def test_configure_logging_creates_log_directory(self) -> None:
        """The logging helper should create missing parent directories."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            app = Flask(__name__)
            log_path = Path(tmp_dir) / "nested" / "app.log"
            app.config["LOG_FILE"] = str(log_path)
            app.config["LOG_LEVEL"] = "INFO"

            configure_logging(app)
            app.logger.info("logging configured")

            self.assertTrue(log_path.parent.exists())
            self.assertTrue(log_path.exists())


if __name__ == "__main__":
    unittest.main()
