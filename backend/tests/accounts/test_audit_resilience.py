from unittest.mock import patch

from apps.accounts.audit import emit_audit_event


def test_emit_audit_event_swallows_persistence_failure():
   with patch("apps.auditoria.services.record_event", side_effect=RuntimeError("db down")):
      emit_audit_event(None, "login")  # must not raise
