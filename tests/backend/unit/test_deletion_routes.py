"""Tests for file deletion routes (single and bulk soft delete)."""

import tempfile
import unittest
from pathlib import Path
import sys

from sqlmodel import SQLModel, Session, select

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.files.models import File
from core.users.models import User


class TestDeletionRoutes(unittest.TestCase):
    """Ensure delete endpoints soft-delete only authenticated owner files."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "deletion_routes_test.db"

        class DeletionRouteConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(DeletionRouteConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        with Session(get_engine()) as session:
            owner = User(
                email="owner-delete@test.com",
                password_hash="hashed",
                api_key="ipfs_gw_delete_owner",
                is_active=True,
            )
            other = User(
                email="other-delete@test.com",
                password_hash="hashed",
                api_key="ipfs_gw_delete_other",
                is_active=True,
            )
            session.add(owner)
            session.add(other)
            session.commit()

            session.add(
                File(
                    cid="bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca",
                    user_id=owner.id,
                    original_filename="owner-1.txt",
                    safe_filename="owner-1.txt",
                    size=128,
                    pinned=True,
                )
            )
            session.add(
                File(
                    cid="bafybeia6z4j6plm6rvs6m4xzpkx3b3w22x6d7bh6r7odqldl4l6q2m4xpe",
                    user_id=owner.id,
                    original_filename="owner-2.txt",
                    safe_filename="owner-2.txt",
                    size=128,
                    pinned=True,
                )
            )
            session.add(
                File(
                    cid="bafybeib2e3a4e5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0m1n2b3c4d5e6f",
                    user_id=other.id,
                    original_filename="other-1.txt",
                    safe_filename="other-1.txt",
                    size=128,
                    pinned=True,
                )
            )
            session.commit()

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def _headers(self) -> dict[str, str]:
        return {"X-API-Key": "ipfs_gw_delete_owner"}

    def test_single_delete_soft_deletes_file(self) -> None:
        """Single delete should set deleted_at and return 200."""
        cid = "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca"

        response = self.client.delete(f"/api/v1/files/{cid}", headers=self._headers())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["message"], "File deleted successfully")

        with Session(get_engine()) as session:
            db_file = session.exec(select(File).where(File.cid == cid)).first()
            self.assertIsNotNone(db_file)
            self.assertIsNotNone(db_file.deleted_at)

    def test_single_delete_returns_404_for_non_owned_file(self) -> None:
        """Single delete should not delete files owned by another user."""
        other_cid = "bafybeib2e3a4e5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0m1n2b3c4d5e6f"

        response = self.client.delete(f"/api/v1/files/{other_cid}", headers=self._headers())

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["code"], "FILE_NOT_FOUND")

    def test_bulk_delete_soft_deletes_owned_files_only(self) -> None:
        """Bulk delete should delete owner files and report missing/non-owned CIDs."""
        owner_cid_1 = "bafybeigdyrzt5x6z6xj5ir3f6m42cdbw2m5g3m6twjv7mmyr4y6nblfuca"
        owner_cid_2 = "bafybeia6z4j6plm6rvs6m4xzpkx3b3w22x6d7bh6r7odqldl4l6q2m4xpe"
        other_cid = "bafybeib2e3a4e5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0m1n2b3c4d5e6f"

        response = self.client.post(
            "/api/v1/files/delete/bulk",
            headers=self._headers(),
            json={"cids": [owner_cid_1, owner_cid_2, other_cid, "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku"]},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()["data"]
        self.assertEqual(payload["deleted_count"], 2)
        self.assertIn(owner_cid_1, payload["deleted_cids"])
        self.assertIn(owner_cid_2, payload["deleted_cids"])
        self.assertIn(other_cid, payload["not_found_cids"])

        with Session(get_engine()) as session:
            files = session.exec(select(File)).all()
            owner_deleted_1 = next(f for f in files if f.cid == owner_cid_1)
            owner_deleted_2 = next(f for f in files if f.cid == owner_cid_2)
            self.assertIsNotNone(owner_deleted_1.deleted_at)
            self.assertIsNotNone(owner_deleted_2.deleted_at)
            other_file = next(f for f in files if f.cid == other_cid)
            self.assertIsNone(other_file.deleted_at)

    def test_bulk_delete_requires_non_empty_cids(self) -> None:
        """Bulk delete should validate request payload."""
        response = self.client.post(
            "/api/v1/files/delete/bulk",
            headers=self._headers(),
            json={"cids": []},
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.get_json()["code"], "CIDS_REQUIRED")


if __name__ == "__main__":
    unittest.main()
