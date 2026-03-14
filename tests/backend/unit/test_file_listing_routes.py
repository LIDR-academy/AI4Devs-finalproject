"""Tests for file listing routes (US-107)."""

import sys
import tempfile
import unittest
from pathlib import Path

from sqlmodel import SQLModel, Session

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.files.models import File
from core.users.models import User


class TestFileListingRoutes(unittest.TestCase):
    """Validate authenticated file listing behavior."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "file_listing_routes_test.db"

        class FileListingConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(FileListingConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        with Session(get_engine()) as session:
            owner = User(
                email="listing-owner@test.com",
                password_hash="hashed",
                api_key="ipfs_gw_listing_owner",
                is_active=True,
            )
            other = User(
                email="listing-other@test.com",
                password_hash="hashed",
                api_key="ipfs_gw_listing_other",
                is_active=True,
            )
            session.add(owner)
            session.add(other)
            session.commit()

            session.add(
                File(
                    cid="bafy-owner-001",
                    user_id=owner.id,
                    original_filename="alpha-report.pdf",
                    safe_filename="alpha-report.pdf",
                    size=4096,
                    mime_type="application/pdf",
                    pinned=True,
                )
            )
            session.add(
                File(
                    cid="bafy-owner-002",
                    user_id=owner.id,
                    original_filename="zeta-image.png",
                    safe_filename="zeta-image.png",
                    size=1024,
                    mime_type="image/png",
                    pinned=False,
                )
            )
            session.add(
                File(
                    cid="bafy-owner-003",
                    user_id=owner.id,
                    original_filename="notes.txt",
                    safe_filename="notes.txt",
                    size=512,
                    mime_type="text/plain",
                    pinned=True,
                )
            )
            session.add(
                File(
                    cid="bafy-other-001",
                    user_id=other.id,
                    original_filename="other-user.doc",
                    safe_filename="other-user.doc",
                    size=999,
                    mime_type="application/msword",
                    pinned=True,
                )
            )
            session.commit()

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def _headers(self) -> dict[str, str]:
        return {"X-API-Key": "ipfs_gw_listing_owner"}

    def test_list_files_returns_only_current_user_files(self) -> None:
        """Listing endpoint should exclude files owned by other users."""
        response = self.client.get("/api/v1/files", headers=self._headers())

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], 200)
        self.assertEqual(len(payload["data"]), 3)
        self.assertEqual(payload["meta"]["total"], 3)
        returned_cids = {item["cid"] for item in payload["data"]}
        self.assertNotIn("bafy-other-001", returned_cids)

    def test_list_files_supports_search_and_pinned_filter(self) -> None:
        """Listing endpoint should filter by search term and pin status."""
        response = self.client.get(
            "/api/v1/files?search=notes&pinned=true",
            headers=self._headers(),
        )

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["meta"]["total"], 1)
        self.assertEqual(payload["data"][0]["original_filename"], "notes.txt")
        self.assertTrue(payload["data"][0]["pinned"])

    def test_list_files_supports_sorting_and_pagination(self) -> None:
        """Listing endpoint should sort by name and paginate requested page size."""
        response = self.client.get(
            "/api/v1/files?sort_by=name&sort_order=asc&page=1&page_size=2",
            headers=self._headers(),
        )

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()

        self.assertEqual(payload["meta"]["page"], 1)
        self.assertEqual(payload["meta"]["page_size"], 2)
        self.assertEqual(payload["meta"]["total"], 3)
        self.assertEqual(payload["meta"]["total_pages"], 2)

        names = [item["original_filename"] for item in payload["data"]]
        self.assertEqual(names, ["alpha-report.pdf", "notes.txt"])

    def test_list_files_rejects_invalid_pinned_filter(self) -> None:
        """Listing endpoint should reject unsupported pin filter values."""
        response = self.client.get(
            "/api/v1/files?pinned=maybe",
            headers=self._headers(),
        )

        self.assertEqual(response.status_code, 422)
        payload = response.get_json()
        self.assertEqual(payload["code"], "INVALID_PINNED_FILTER")


if __name__ == "__main__":
    unittest.main()