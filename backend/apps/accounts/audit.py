"""
Sensitive-action audit hook. Persists to the append-only Bitacora table
(apps.auditoria). Persistence failures are logged, never raised, so a
transient audit-write problem cannot block the action being audited.
"""

import logging

logger = logging.getLogger("eyemaster.audit")


def emit_audit_event(user, action: str, **details) -> None:
   from apps.auditoria.services import record_event

   entidad_id = details.pop("target_id", None) or details.pop("entidad_id", None)
   entidad = details.pop("entidad", "")

   try:
      record_event(
         user,
         action,
         entidad=entidad,
         entidad_id=entidad_id,
         detalle=str(details) if details else "",
      )
   except Exception:
      identity = getattr(user, "email", "anonymous")
      logger.exception("Failed to persist audit event action=%s user=%s", action, identity)
