import pytest

from apps.auditoria.models import Bitacora
from apps.auditoria.services import record_event


@pytest.mark.django_db
def test_record_event_persists_expected_fields(user_factory):
   user = user_factory(email="actor@example.com", password="s3cret-pass!")

   record = record_event(
      user, "login", entidad="Usuario", entidad_id=user.pk, detalle="ok"
   )

   stored = Bitacora.objects.get(pk=record.pk)
   assert stored.usuario == user
   assert stored.accion == "login"
   assert stored.entidad == "Usuario"
   assert stored.entidad_id == str(user.pk)
   assert stored.detalle == "ok"
   assert stored.fecha is not None
