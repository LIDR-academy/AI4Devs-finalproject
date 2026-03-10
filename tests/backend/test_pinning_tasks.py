"""Tests for pin/unpin Celery tasks behavior (US-008)."""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import sys

from sqlmodel import SQLModel, Session, select

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.common.models import AuditLog
from core.files.models import File
from core.services.ipfs_service import UploadError
from core.tasks.pinning_tasks import pin_content_async, unpin_content_async
from core.users.models import User


class TestPinningTasks(unittest.TestCase):
    """Validate async pin/unpin tasks update storage and DB correctly."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "pinning_tasks_test.db"

        class PinningTaskConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(PinningTaskConfig)
        SQLModel.metadata.create_all(get_engine())

        with Session(get_engine()) as session:
            user = User(
                email="task-user@test.com",
                password_hash="hashed",
                api_key="ipfs_gw_task_user_key",
                is_active=True,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            self.user_id = user.id

            session.add(
                File(
                    cid="QmTaskPinMe",
                    user_id=self.user_id,
                    original_filename="pin_me.txt",
                    safe_filename="pin_me.txt",
                    storage_key="pin_me.txt",
                    size=123,
                    pinned=False,
                )
            )
            session.add(
                File(
                    cid="QmTaskUnpinMe",
                    user_id=self.user_id,
                    original_filename="unpin_me.txt",
                    safe_filename="unpin_me.txt",
                    storage_key="unpin_me.txt",
                    size=123,
                    pinned=True,
                )
            )
            session.commit()

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    @patch("core.tasks.pinning_tasks.ipfs_service.pin_content", return_value=True)
    def test_pin_task_sets_file_to_pinned(self, _pin_content) -> None:
        """Pin task should pin the file and write a completion audit log."""
        result = pin_content_async.run(self.user_id, "QmTaskPinMe")

        self.assertEqual(result["status"], "completed")
        self.assertTrue(result["pinned"])

        with Session(get_engine()) as session:
            db_file = session.exec(select(File).where(File.cid == "QmTaskPinMe")).first()
            self.assertIsNotNone(db_file)
            self.assertTrue(db_file.pinned)

            audits = session.exec(
                select(AuditLog).where(AuditLog.user_id == self.user_id, AuditLog.action == "file_pin")
            ).all()
            self.assertGreaterEqual(len(audits), 1)

    @patch("core.tasks.pinning_tasks.ipfs_service.unpin_content", return_value=True)
    def test_unpin_task_sets_file_to_unpinned_without_delete(self, _unpin_content) -> None:
        """Unpin task should soft-unpin file and keep DB record."""
        result = unpin_content_async.run(self.user_id, "QmTaskUnpinMe")

        self.assertEqual(result["status"], "completed")
        self.assertFalse(result["pinned"])

        with Session(get_engine()) as session:
            db_file = session.exec(select(File).where(File.cid == "QmTaskUnpinMe")).first()
            self.assertIsNotNone(db_file)
            self.assertFalse(db_file.pinned)
            self.assertIsNone(db_file.deleted_at)

    @patch("core.tasks.pinning_tasks.ipfs_service.pin_content")
    def test_pin_task_idempotent_when_already_pinned(self, pin_content) -> None:
        """Pin task should return success and skip provider call for already pinned file."""
        with Session(get_engine()) as session:
            db_file = session.exec(select(File).where(File.cid == "QmTaskPinMe")).first()
            db_file.pinned = True
            session.add(db_file)
            session.commit()

        result = pin_content_async.run(self.user_id, "QmTaskPinMe")

        self.assertEqual(result["status"], "completed")
        self.assertTrue(result["pinned"])
        pin_content.assert_not_called()

    @patch("core.tasks.pinning_tasks.ipfs_service.pin_content", side_effect=UploadError("provider failure"))
    @patch.object(pin_content_async, "retry", side_effect=RuntimeError("retry called"))
    def test_pin_task_retries_on_upload_error(self, retry_mock, _pin_content) -> None:
        """Pin task should trigger Celery retry on transient provider failure."""
        with self.assertRaisesRegex(RuntimeError, "retry called"):
            pin_content_async.run(self.user_id, "QmTaskPinMe")

        retry_mock.assert_called_once()
        retry_kwargs = retry_mock.call_args.kwargs
        self.assertIn("countdown", retry_kwargs)
        self.assertEqual(retry_kwargs["countdown"], 2)


if __name__ == "__main__":
    unittest.main()
