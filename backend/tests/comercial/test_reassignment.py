import pytest

from apps.comercial.models import Assignment
from apps.comercial.services import asignar_cliente


@pytest.mark.django_db
def test_reassignment_closes_previous_and_opens_new(
   user_factory, company_factory, client_record_factory
):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = company_factory()
   client_a = client_record_factory()
   client_b = client_record_factory()

   first = asignar_cliente(company.pk, client_a.pk, actor)
   second = asignar_cliente(company.pk, client_b.pk, actor)

   first.refresh_from_db()
   assert first.fecha_fin is not None
   assert second.fecha_fin is None
   assert second.destino_id == client_b.pk

   # previous row still exists (no physical deletion, R-EST-06)
   assert Assignment.objects.filter(pk=first.pk).exists()
   assert Assignment.objects.filter(
      origen_id=company.pk, tipo=Assignment.TIPO_EMPRESA_CLIENTE, fecha_fin__isnull=True
   ).count() == 1
