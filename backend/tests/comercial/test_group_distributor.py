import pytest

from apps.comercial.models import Assignment
from apps.comercial.services import asignar_distribuidor_a_grupo, current_assignment


@pytest.mark.django_db
def test_group_has_at_most_one_current_distributor(
   user_factory, group_factory, distributor_factory
):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   group = group_factory()
   distributor_a = distributor_factory()
   distributor_b = distributor_factory()

   first = asignar_distribuidor_a_grupo(group.pk, distributor_a.pk, actor)
   second = asignar_distribuidor_a_grupo(group.pk, distributor_b.pk, actor)

   first.refresh_from_db()
   assert first.fecha_fin is not None
   assert second.fecha_fin is None

   current = current_assignment(group.pk, Assignment.TIPO_GRUPO_DIST)
   assert current.destino_id == distributor_b.pk
