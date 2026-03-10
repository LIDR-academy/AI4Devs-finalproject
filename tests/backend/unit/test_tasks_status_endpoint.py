"""Tests for Celery task status and failed-task API endpoints."""

import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
import sys

from sqlmodel import SQLModel, Session

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.users.models import User


class TestTaskEndpoints(unittest.TestCase):
    """Validate task status, failed-task list, and replay endpoints."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "tasks_endpoint_test.db"

        class TaskEndpointConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(TaskEndpointConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        with Session(get_engine()) as session:
            session.add(
                User(
                    email="tasks@test.com",
                    password_hash="hashed",
                    api_key="ipfs_gw_tasks_key",
                    is_active=True,
                )
            )
            session.commit()

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def _headers(self) -> dict[str, str]:
        return {"X-API-Key": "ipfs_gw_tasks_key"}

    @patch("core.tasks.routes.AsyncResult")
    def test_status_returns_success_payload(self, async_result_cls) -> None:
        """SUCCESS state should include result and progress 100."""
        async_result_cls.return_value = SimpleNamespace(
            state="SUCCESS",
            info=None,
            result={"cid": "Qm123", "filename": "doc.pdf"},
        )

        response = self.client.get("/api/v1/tasks/task-1/status", headers=self._headers())

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()["data"]
        self.assertEqual(payload["state"], "SUCCESS")
        self.assertEqual(payload["progress"], 100)
        self.assertEqual(payload["result"]["cid"], "Qm123")

    @patch("core.tasks.routes.AsyncResult")
    def test_status_returns_progress_payload(self, async_result_cls) -> None:
        """STARTED/PROGRESS state should expose progress and message."""
        async_result_cls.return_value = SimpleNamespace(
            state="STARTED",
            info={"progress": 65, "message": "Uploading to IPFS..."},
            result=None,
        )

        response = self.client.get("/api/v1/tasks/task-2/status", headers=self._headers())

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()["data"]
        self.assertEqual(payload["state"], "STARTED")
        self.assertEqual(payload["progress"], 65)
        self.assertEqual(payload["message"], "Uploading to IPFS...")

    @patch("core.tasks.routes.list_failed_tasks")
    def test_list_failed_tasks_endpoint(self, list_failed_tasks_fn) -> None:
        """Failed-task listing endpoint should return paginated data payload."""
        list_failed_tasks_fn.return_value = [{"failure_id": "f-1", "task_name": "core.tasks.file_tasks.upload_file_async"}]

        response = self.client.get("/api/v1/tasks/failed?limit=10&offset=0", headers=self._headers())

        self.assertEqual(response.status_code, 200)
        data = response.get_json()["data"]
        self.assertEqual(data["limit"], 10)
        self.assertEqual(len(data["items"]), 1)

    @patch("core.tasks.routes.replay_failed_task")
    def test_replay_failed_task_endpoint(self, replay_failed_task_fn) -> None:
        """Replay endpoint should queue task and return 202 response."""
        replay_failed_task_fn.return_value = {
            "failure_id": "f-1",
            "replay_task_id": "task-replay-1",
            "status": "queued",
        }

        response = self.client.post("/api/v1/tasks/failed/f-1/replay", headers=self._headers())

        self.assertEqual(response.status_code, 202)
        body = response.get_json()
        self.assertEqual(body["status"], 202)
        self.assertEqual(body["data"]["replay_task_id"], "task-replay-1")


if __name__ == "__main__":
    unittest.main()
