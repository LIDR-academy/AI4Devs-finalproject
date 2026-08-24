from apps.auditoria.models import Bitacora


def record_event(
   user,
   accion: str,
   *,
   entidad: str = "",
   entidad_id=None,
   detalle: str = "",
   ip: str | None = None,
) -> Bitacora:
   """Persist one append-only audit record. Raises on failure; callers that
   must not let audit failures block their primary action (see
   apps.accounts.audit.emit_audit_event) are responsible for catching."""
   return Bitacora.objects.create(
      usuario=user if getattr(user, "is_authenticated", False) else None,
      accion=accion,
      entidad=entidad,
      entidad_id=str(entidad_id) if entidad_id is not None else None,
      detalle=detalle,
      ip=ip,
   )
