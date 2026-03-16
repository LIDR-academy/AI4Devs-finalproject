"""Unit tests for failed-task store helpers."""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import sys

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app
from core.tasks.failed_tasks import (
    clear_failed_tasks,
    get_failed_task,
    list_failed_tasks,
    record_failed_task,
    replay_failed_task,
)


class TestFailedTasksStore(unittest.TestCase):
    """Validate recording, listing, and replaying failed tasks."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "failed_tasks_test.db"

        class FailedTaskConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True
            USE_MEMORY_FAILED_TASK_STORE = True

        self.app = create_app(FailedTaskConfig)
        self.ctx = self.app.app_context()
        self.ctx.push()
        clear_failed_tasks()

    def tearDown(self) -> None:
        clear_failed_tasks()
        self.ctx.pop()
        self.temp_dir.cleanup()

    def test_record_and_list_failed_task(self) -> None:
        """Recorded failed task should be available in listing and by id."""
        entry = record_failed_task(
            task_id="task-1",
            task_name="core.tasks.file_tasks.upload_file_async",
            args=[1, "safe-name", "origin.txt", b"data"],
            kwargs={"content_type": "text/plain"},
            exception="boom",
            traceback="trace",
            retries=2,
            queue="upload",
        )

        listed = list_failed_tasks(limit=10, offset=0)
        fetched = get_failed_task(entry["failure_id"])

        self.assertEqual(len(listed), 1)
        self.assertEqual(listed[0]["failure_id"], entry["failure_id"])
        self.assertEqual(fetched["task_id"], "task-1")
        self.assertEqual(fetched["status"], "failed")

    @patch("core.tasks.failed_tasks._dispatch_task")
    def test_replay_failed_task(self, dispatch_task) -> None:
        """Replay should enqueue the original task and update stored payload."""
        entry = record_failed_task(
            task_id="task-2",
            task_name="core.tasks.pinning_tasks.pin_content_async",
            args=[7, "QmCid"],
            kwargs={},
            exception="temporary failure",
            retries=1,
            queue="pinning",
        )

        dispatch_task.return_value.id = "replayed-123"
        replay_info = replay_failed_task(entry["failure_id"])
        updated = get_failed_task(entry["failure_id"])

        self.assertEqual(replay_info["status"], "queued")
        self.assertEqual(replay_info["replay_task_id"], "replayed-123")
        self.assertEqual(updated["status"], "replayed")
        self.assertEqual(updated["replay_task_id"], "replayed-123")


if __name__ == "__main__":
    unittest.main()
