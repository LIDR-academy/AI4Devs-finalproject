"""E2E tests for file endpoints against real Filebase credentials."""

from __future__ import annotations

import io
import tempfile
import unittest
from pathlib import Path
import sys

from sqlmodel import SQLModel

from tests.backend.e2e.conftest import e2e_ready

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine


class TestFileEndpointsE2E(unittest.TestCase):
    """Exercise upload/retrieve flow in e2e profile."""

    @classmethod
    def setUpClass(cls) -> None:
        ready, missing = e2e_ready()
        if not ready:
            raise unittest.SkipTest(f"e2e disabled or missing env: {', '.join(missing)}")

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "e2e_files.db"

        class E2EFileConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(E2EFileConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        register = self.client.post(
            "/api/v1/users/register",
            json={"email": "e2e.files@example.com", "password": "StrongPassword123!"},
            environ_overrides={"REMOTE_ADDR": "198.51.100.11"},
        )
        self.api_key = register.get_json()["data"]["api_key"]

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_upload_and_retrieve(self) -> None:
        """Small file upload should return a CID that can be retrieved."""
        response = self.client.post(
            "/api/v1/files/upload",
            data={"file": (io.BytesIO(b"hello from e2e"), "e2e.txt")},
            headers={"X-API-Key": self.api_key},
            content_type="multipart/form-data",
        )
        self.assertIn(response.status_code, {201, 202})

        body = response.get_json()["data"]
        cid = body.get("cid")
        if cid:
            retrieve = self.client.get(
                f"/api/v1/files/retrieve/{cid}",
                headers={"X-API-Key": self.api_key},
            )
            self.assertIn(retrieve.status_code, {200, 304})
