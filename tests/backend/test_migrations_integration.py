"""Integration tests for Alembic migration upgrade and downgrade flow."""

from pathlib import Path
import sys
import tempfile
import unittest

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


class TestAlembicMigrations(unittest.TestCase):
    """Run migration lifecycle against isolated SQLite databases."""

    def _build_config(self, database_url: str) -> Config:
        """Create Alembic config bound to a temporary sqlite database URL."""
        config = Config(str(BACKEND_DIR / "alembic.ini"))
        config.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
        config.set_main_option("sqlalchemy.url", database_url)
        return config

    def test_upgrade_and_downgrade_cycle(self) -> None:
        """Alembic should create and remove schema cleanly through full cycle."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            db_path = Path(tmp_dir) / "migration_test.db"
            database_url = f"sqlite:///{db_path}"
            config = self._build_config(database_url)

            command.upgrade(config, "head")

            engine = create_engine(database_url)
            inspector = inspect(engine)
            tables_after_upgrade = set(inspector.get_table_names())
            self.assertTrue({"users", "files", "audit_logs"}.issubset(tables_after_upgrade))

            command.downgrade(config, "base")

            inspector_after_downgrade = inspect(engine)
            tables_after_downgrade = set(inspector_after_downgrade.get_table_names())
            self.assertFalse({"users", "files", "audit_logs"}.intersection(tables_after_downgrade))


if __name__ == "__main__":
    unittest.main()
