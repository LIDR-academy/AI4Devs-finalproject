"""Security and rate-limiting regression tests for US-009."""

import tempfile
import unittest
from io import BytesIO
from pathlib import Path
from unittest.mock import patch
import sys

from sqlmodel import SQLModel, Session, select

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.files.models import File
from core.services.ipfs_service import UploadResult
from core.users.models import User


class SecurityControlsConfig(TestingConfig):
    """Testing configuration tuned for security-control verification."""

    ALLOWED_ORIGINS = "https://frontend.example.com"
    RATELIMIT_ENABLED = True
    RATELIMIT_HEADERS_ENABLED = True
    RATE_LIMIT_UPLOAD = "2/minute"
    RATE_LIMIT_STATUS = "4/minute"
    RATE_LIMIT_RENEW = "3/minute"
    RATE_LIMIT_ADMIN = "3/minute"
    RATE_LIMIT_TASKS = "3/minute"


class TinyPayloadConfig(TestingConfig):
    """Testing configuration with a tiny payload limit."""

    MAX_CONTENT_LENGTH = 32


class TestSecurityHeadersAndCors(unittest.TestCase):
    """Verify centralized response headers and CORS policy."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "security_controls.db"

        class AppConfig(SecurityControlsConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(AppConfig)
        self.client = self.app.test_client()
        self.engine = get_engine()
        self.assertIsNotNone(self.engine)
        engine = self.engine
        assert engine is not None
        SQLModel.metadata.create_all(engine)

        with Session(self.engine) as session:
            primary_user = User(
                email="security@test.com",
                password_hash="hashed",
                api_key="ipfs_gw_security_primary",
                is_active=True,
            )
            secondary_user = User(
                email="security-second@test.com",
                password_hash="hashed",
                api_key="ipfs_gw_security_secondary",
                is_active=True,
            )
            session.add(primary_user)
            session.add(secondary_user)
            session.commit()
            session.refresh(primary_user)
            session.refresh(secondary_user)
            self.assertIsNotNone(primary_user.id)
            self.assertIsNotNone(secondary_user.id)
            primary_user_id = primary_user.id
            assert primary_user_id is not None

            session.add(
                File(
                    cid="QmSecurityFile1",
                    user_id=primary_user_id,
                    original_filename="security.txt",
                    safe_filename="security.txt",
                    size=64,
                    pinned=True,
                )
            )
            session.commit()

        self.primary_headers = {"X-API-Key": "ipfs_gw_security_primary"}
        self.secondary_headers = {"X-API-Key": "ipfs_gw_security_secondary"}

    def tearDown(self) -> None:
        assert self.engine is not None
        SQLModel.metadata.drop_all(self.engine)
        self.engine.dispose()
        self.temp_dir.cleanup()

    def test_status_response_includes_security_headers_and_request_id(self) -> None:
        """Responses should carry the hardened security header set and request ID."""
        response = self.client.get(
            "/api/v1/users/status",
            headers={
                "Origin": "https://frontend.example.com",
                "X-Request-ID": "trace-security-123",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["X-Request-ID"], "trace-security-123")
        self.assertEqual(response.headers["X-Content-Type-Options"], "nosniff")
        self.assertEqual(response.headers["X-Frame-Options"], "DENY")
        self.assertEqual(response.headers["Referrer-Policy"], "no-referrer")
        self.assertIn("default-src 'none'", response.headers["Content-Security-Policy"])
        self.assertEqual(
            response.headers["Access-Control-Allow-Origin"],
            "https://frontend.example.com",
        )
        self.assertIn("X-Request-ID", response.headers["Access-Control-Expose-Headers"])

    def test_cors_preflight_allows_configured_origin(self) -> None:
        """Preflight requests from configured origins should receive CORS allow headers."""
        response = self.client.open(
            "/api/v1/files/upload",
            method="OPTIONS",
            headers={
                "Origin": "https://frontend.example.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type, X-API-Key, X-Request-ID",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers["Access-Control-Allow-Origin"],
            "https://frontend.example.com",
        )
        self.assertIn("X-API-Key", response.headers["Access-Control-Allow-Headers"])
        self.assertIn("POST", response.headers["Access-Control-Allow-Methods"])

    def test_cors_rejects_unknown_origin(self) -> None:
        """Unknown origins should not receive an allow-origin header."""
        response = self.client.get(
            "/api/v1/users/status",
            headers={"Origin": "https://evil.example.com"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("Access-Control-Allow-Origin", response.headers)

    @patch("core.files.routes.upload.ipfs_service.upload_file")
    def test_upload_rate_limit_uses_api_key_and_returns_headers(self, upload_file_mock) -> None:
        """Upload throttling should key on API key and expose rate-limit headers."""
        upload_file_mock.side_effect = [
            UploadResult(cid="QmUpload1", size=5, key="safe-1.txt"),
            UploadResult(cid="QmUpload2", size=5, key="safe-2.txt"),
        ]

        first = self.client.post(
            "/api/v1/files/upload",
            headers=self.primary_headers,
            data={"file": (BytesIO(b"hello"), "doc1.txt", "text/plain")},
            content_type="multipart/form-data",
        )
        second = self.client.post(
            "/api/v1/files/upload",
            headers=self.primary_headers,
            data={"file": (BytesIO(b"world"), "doc2.txt", "text/plain")},
            content_type="multipart/form-data",
        )
        limited = self.client.post(
            "/api/v1/files/upload",
            headers=self.primary_headers,
            data={"file": (BytesIO(b"again"), "doc3.txt", "text/plain")},
            content_type="multipart/form-data",
        )

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 201)
        self.assertEqual(limited.status_code, 429)
        self.assertIn("X-RateLimit-Limit", first.headers)
        self.assertIn("X-RateLimit-Remaining", first.headers)
        self.assertIn("X-RateLimit-Reset", first.headers)
        self.assertIn("Retry-After", limited.headers)

    @patch("core.files.routes.upload.ipfs_service.upload_file")
    def test_upload_rate_limit_isolated_between_api_keys(self, upload_file_mock) -> None:
        """Rate limiting for authenticated uploads should isolate one API key from another."""
        upload_file_mock.side_effect = [
            UploadResult(cid="QmUploadA", size=5, key="safe-a.txt"),
            UploadResult(cid="QmUploadB", size=5, key="safe-b.txt"),
            UploadResult(cid="QmUploadC", size=5, key="safe-c.txt"),
        ]

        first = self.client.post(
            "/api/v1/files/upload",
            headers=self.primary_headers,
            data={"file": (BytesIO(b"hello"), "owner-a.txt", "text/plain")},
            content_type="multipart/form-data",
        )
        second = self.client.post(
            "/api/v1/files/upload",
            headers=self.primary_headers,
            data={"file": (BytesIO(b"world"), "owner-b.txt", "text/plain")},
            content_type="multipart/form-data",
        )
        other_user = self.client.post(
            "/api/v1/files/upload",
            headers=self.secondary_headers,
            data={"file": (BytesIO(b"other"), "owner-c.txt", "text/plain")},
            content_type="multipart/form-data",
        )

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 201)
        self.assertEqual(other_user.status_code, 201)

    @patch("core.files.routes.upload.ipfs_service.upload_file")
    def test_upload_duplicate_cid_returns_conflict(self, upload_file_mock) -> None:
        """Uploading the same CID twice for one user should return 409 instead of 500."""
        upload_file_mock.return_value = UploadResult(cid="QmDuplicateCid", size=5, key="safe.txt")

        first = self.client.post(
            "/api/v1/files/upload",
            headers=self.primary_headers,
            data={"file": (BytesIO(b"hello"), "doc1.txt", "text/plain")},
            content_type="multipart/form-data",
        )
        duplicate = self.client.post(
            "/api/v1/files/upload",
            headers=self.primary_headers,
            data={"file": (BytesIO(b"world"), "doc2.txt", "text/plain")},
            content_type="multipart/form-data",
        )

        self.assertEqual(first.status_code, 201)
        self.assertEqual(duplicate.status_code, 409)

        payload = duplicate.get_json()
        self.assertEqual(payload["code"], "FILE_ALREADY_EXISTS")
        self.assertEqual(payload["message"], "File already exists. Duplicate uploads are not allowed.")
        self.assertEqual(payload["details"]["cid"], "QmDuplicateCid")

    @patch("core.files.routes.upload.ipfs_service.upload_file")
    def test_reupload_after_soft_delete_restores_file(self, upload_file_mock) -> None:
        """Re-uploading a soft-deleted CID should restore the file row and return success."""
        upload_file_mock.return_value = UploadResult(cid="QmReuploadCid", size=5, key="safe.txt")

        first_upload = self.client.post(
            "/api/v1/files/upload",
            headers=self.primary_headers,
            data={"file": (BytesIO(b"hello"), "doc1.txt", "text/plain")},
            content_type="multipart/form-data",
        )
        delete_response = self.client.delete(
            "/api/v1/files/QmReuploadCid",
            headers=self.primary_headers,
        )
        second_upload = self.client.post(
            "/api/v1/files/upload",
            headers=self.primary_headers,
            data={"file": (BytesIO(b"world"), "doc2.txt", "text/plain")},
            content_type="multipart/form-data",
        )

        self.assertEqual(first_upload.status_code, 201)
        self.assertEqual(delete_response.status_code, 200)
        self.assertEqual(second_upload.status_code, 201)

        with Session(self.engine) as session:
            owner = session.exec(
                select(User).where(User.api_key == "ipfs_gw_security_primary")
            ).first()
            self.assertIsNotNone(owner)
            assert owner is not None
            restored_files = session.exec(
                select(File).where(
                    File.user_id == owner.id,
                    File.cid == "QmReuploadCid",
                )
            ).all()
            self.assertEqual(len(restored_files), 1)
            self.assertIsNone(restored_files[0].deleted_at)


class TestPayloadSizeLimit(unittest.TestCase):
    """Verify request payload limits are enforced centrally."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "tiny_payload.db"

        class AppConfig(TinyPayloadConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(AppConfig)
        self.client = self.app.test_client()
        self.engine = get_engine()
        self.assertIsNotNone(self.engine)
        engine = self.engine
        assert engine is not None
        SQLModel.metadata.create_all(engine)

    def tearDown(self) -> None:
        assert self.engine is not None
        SQLModel.metadata.drop_all(self.engine)
        self.engine.dispose()
        self.temp_dir.cleanup()

    def test_large_request_body_returns_413_with_request_id(self) -> None:
        """Oversized request bodies should be rejected before route processing."""
        response = self.client.post(
            "/api/v1/users/register",
            data='{"email":"big@example.com","password":"StrongPassword123!"}',

            content_type="application/json",
            headers={"X-Request-ID": "too-large-req"},
        )

        self.assertEqual(response.status_code, 413)
        body = response.get_json()
        self.assertEqual(body["status"], 413)
        self.assertEqual(body["request_id"], "too-large-req")


if __name__ == "__main__":
    unittest.main()
