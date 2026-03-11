"""Tests for async pinning routes."""

import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
import sys

from sqlmodel import SQLModel, Session

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.users.models import User


class TestPinningRoutes(unittest.TestCase):
    """Ensure pin and unpin routes queue Celery tasks correctly."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "pinning_routes_test.db"

        class PinningRouteConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(PinningRouteConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        with Session(get_engine()) as session:
            session.add(
                User(
                    email="pinning@test.com",
                    password_hash="hashed",
                    api_key="ipfs_gw_pinning_key",
                    is_active=True,
                )
            )
            session.commit()

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def _headers(self) -> dict[str, str]:
        return {"X-API-Key": "ipfs_gw_pinning_key"}

    @patch("core.files.routes.pinning.pin_content_async")
    def test_pin_route_queues_task(self, pin_task) -> None:
        """Pin endpoint should queue pin task and return status URL."""
        pin_task.delay.return_value = SimpleNamespace(id="pin-task-1")

        response = self.client.post("/api/v1/files/pin/QmPin123", headers=self._headers())

        self.assertEqual(response.status_code, 202)
        data = response.get_json()["data"]
        self.assertEqual(data["task_id"], "pin-task-1")
        self.assertIn("/api/v1/tasks/pin-task-1/status", data["status_url"])

    @patch("core.files.routes.pinning.unpin_content_async")
    def test_unpin_route_queues_task(self, unpin_task) -> None:
        """Unpin endpoint should queue unpin task and return status URL."""
        unpin_task.delay.return_value = SimpleNamespace(id="unpin-task-1")

        response = self.client.post("/api/v1/files/unpin/QmPin123", headers=self._headers())

        self.assertEqual(response.status_code, 202)
        data = response.get_json()["data"]
        self.assertEqual(data["task_id"], "unpin-task-1")
        self.assertIn("/api/v1/tasks/unpin-task-1/status", data["status_url"])


if __name__ == "__main__":
    unittest.main()
