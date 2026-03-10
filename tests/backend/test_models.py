"""Unit tests for SQLModel entities and domain helpers."""

from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from core.common.models import AuditLog
from core.files.models import File
from core.users.models import User


class TestUserModel(unittest.TestCase):
    """Validate User model helper methods and defaults."""

    def setUp(self) -> None:
        self.user = User(
            email="user@example.com",
            password_hash="",
            api_key=User.generate_api_key(),
        )

    def test_password_hashing_and_verification(self) -> None:
        """User password helper should hash and verify values."""
        self.user.set_password("StrongPassword123")
        self.assertNotEqual(self.user.password_hash, "StrongPassword123")
        self.assertTrue(self.user.verify_password("StrongPassword123"))
        self.assertFalse(self.user.verify_password("wrong-password"))

    def test_generated_api_key_has_expected_prefix_and_size(self) -> None:
        """Generated API key should keep project prefix and expected token length."""
        key = User.generate_api_key()
        self.assertTrue(key.startswith("ipfs_gw_"))
        self.assertEqual(len(key), len("ipfs_gw_") + 64)

    def test_soft_delete_and_reactivation_helpers(self) -> None:
        """Soft delete and reactivation helper methods should update user flags."""
        self.user.soft_delete()
        self.assertTrue(self.user.is_deleted)
        self.assertFalse(self.user.is_active)

        self.user.reactivate()
        self.assertTrue(self.user.is_active)

    def test_revoke_rotates_api_key(self) -> None:
        """Revoking should rotate API key and disable account."""
        previous_key = self.user.api_key
        self.user.revoke()
        self.assertNotEqual(previous_key, self.user.api_key)
        self.assertFalse(self.user.is_active)


class TestModelRelationships(unittest.TestCase):
    """Validate core table metadata constraints and relationships."""

    def test_file_has_user_foreign_key(self) -> None:
        """File table should include a foreign key to users.id."""
        file_table = getattr(File, "__table__")
        foreign_key_targets = {fk.target_fullname for fk in file_table.foreign_keys}
        self.assertIn("users.id", foreign_key_targets)

    def test_audit_log_has_user_foreign_key(self) -> None:
        """Audit log table should include a foreign key to users.id."""
        audit_table = getattr(AuditLog, "__table__")
        foreign_key_targets = {fk.target_fullname for fk in audit_table.foreign_keys}
        self.assertIn("users.id", foreign_key_targets)


if __name__ == "__main__":
    unittest.main()
