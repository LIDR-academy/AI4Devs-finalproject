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
from core.files.models import File
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
            owner = User(
                email="pinning@test.com",
                password_hash="hashed",
                api_key="ipfs_gw_pinning_key",
                is_active=True,
            )
            other_user = User(
                email="other@test.com",
                password_hash="hashed",
                api_key="ipfs_gw_other_key",
                is_active=True,
            )
            session.add(
                owner
            )
            session.add(other_user)
            session.commit()

            session.add(
                File(
                    cid="QmOwnerUnpinned",
                    user_id=owner.id,
                    original_filename="owner_unpinned.txt",
                    safe_filename="owner_unpinned.txt",
                    size=128,
                    pinned=False,
                )
            )
            session.add(
                File(
                    cid="QmOwnerPinned",
                    user_id=owner.id,
                    original_filename="owner_pinned.txt",
                    safe_filename="owner_pinned.txt",
                    size=128,
                    pinned=True,
                )
            )
            session.add(
                File(
                    cid="QmOtherPinned",
                    user_id=other_user.id,
                    original_filename="other_pinned.txt",
                    safe_filename="other_pinned.txt",
                    size=128,
                    pinned=True,
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

        response = self.client.post("/api/v1/files/pin/QmOwnerUnpinned", headers=self._headers())

        self.assertEqual(response.status_code, 202)
        data = response.get_json()["data"]
        self.assertEqual(data["task_id"], "pin-task-1")
        self.assertIn("/api/v1/tasks/pin-task-1/status", data["status_url"])
        pin_task.delay.assert_called_once_with(1, "QmOwnerUnpinned")

    @patch("core.files.routes.pinning.unpin_content_async")
    def test_unpin_route_queues_task(self, unpin_task) -> None:
        """Unpin endpoint should queue unpin task and return status URL."""
        unpin_task.delay.return_value = SimpleNamespace(id="unpin-task-1")

        response = self.client.post("/api/v1/files/unpin/QmOwnerPinned", headers=self._headers())

        self.assertEqual(response.status_code, 202)
        data = response.get_json()["data"]
        self.assertEqual(data["task_id"], "unpin-task-1")
        self.assertIn("/api/v1/tasks/unpin-task-1/status", data["status_url"])
        unpin_task.delay.assert_called_once_with(1, "QmOwnerPinned")

    def test_pin_route_returns_404_when_cid_not_found(self) -> None:
        """Pin endpoint should return 404 when CID does not exist."""
        response = self.client.post("/api/v1/files/pin/QmMissing", headers=self._headers())
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["message"], "Content not found")

    def test_unpin_route_returns_404_when_cid_not_found(self) -> None:
        """Unpin endpoint should return 404 when CID does not exist."""
        response = self.client.post("/api/v1/files/unpin/QmMissing", headers=self._headers())
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["message"], "Content not found")

    def test_pin_route_returns_403_for_non_owned_content(self) -> None:
        """Pin endpoint should deny access when file belongs to another user."""
        response = self.client.post("/api/v1/files/pin/QmOtherPinned", headers=self._headers())
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["message"], "Access denied to this content")

    def test_unpin_route_returns_403_for_non_owned_content(self) -> None:
        """Unpin endpoint should deny access when file belongs to another user."""
        response = self.client.post("/api/v1/files/unpin/QmOtherPinned", headers=self._headers())
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["message"], "Access denied to this content")

    def test_pin_route_returns_409_when_already_pinned(self) -> None:
        """Pin endpoint should return 409 if content is already pinned."""
        response = self.client.post("/api/v1/files/pin/QmOwnerPinned", headers=self._headers())
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json()["message"], "Content is already pinned")

    def test_unpin_route_returns_409_when_already_unpinned(self) -> None:
        """Unpin endpoint should return 409 if content is already unpinned."""
        response = self.client.post("/api/v1/files/unpin/QmOwnerUnpinned", headers=self._headers())
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json()["message"], "Content is already unpinned")


if __name__ == "__main__":
    unittest.main()
