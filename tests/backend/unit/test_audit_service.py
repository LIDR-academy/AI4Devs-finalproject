"""Unit tests for audit service helper functions."""

from __future__ import annotations

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
from core.common.models import AuditLog
from core.services.audit_service import add_audit_log, parse_audit_details, query_audit_logs
from core.users.models import User


class TestAuditService(unittest.TestCase):
    """Validate audit-service write and query helpers in isolation."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "audit_service_unit.db"

        class AuditServiceTestConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True
            AUDIT_LOG_DEFERRED_WRITE = False
            AUDIT_IP_RETENTION_DAYS = 90

        self.app = create_app(AuditServiceTestConfig)
        SQLModel.metadata.create_all(get_engine())

        with Session(get_engine()) as session:
            user = User(
                email="audit.service@example.com",
                password_hash="hashed",
                api_key="ipfs_gw_audit_unit_key",
                is_active=True,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            self.user_id = user.id

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_add_audit_log_persists_row(self) -> None:
        """add_audit_log should normalize details and persist a DB row."""
        with Session(get_engine()) as session:
            add_audit_log(
                session,
                user_id=self.user_id,
                action="unit_test_event",
                details={"k": "v"},
                request_id="req-audit-unit-1",
            )
            session.commit()

        with Session(get_engine()) as session:
            row = session.exec(select(AuditLog).where(AuditLog.action == "unit_test_event")).first()
            self.assertIsNotNone(row)
            self.assertEqual(parse_audit_details(row.details), {"k": "v"})

    def test_query_audit_logs_paginates(self) -> None:
        """query_audit_logs should return paginated payload and filters."""
        with Session(get_engine()) as session:
            add_audit_log(session, user_id=self.user_id, action="paged-action", details={"i": 1})
            add_audit_log(session, user_id=self.user_id, action="paged-action", details={"i": 2})
            session.commit()

        payload = query_audit_logs(
            page=1,
            per_page=1,
            user_id=self.user_id,
            action="paged-action",
        )
        self.assertEqual(payload["pagination"]["page"], 1)
        self.assertEqual(payload["pagination"]["per_page"], 1)
        self.assertEqual(payload["pagination"]["total"], 2)
        self.assertEqual(len(payload["logs"]), 1)
