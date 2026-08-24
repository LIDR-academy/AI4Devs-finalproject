"""
readme.md Ticket 1 (TK-08-02) targets < 500ms for a distributor with 1000
companies in a production Postgres environment. Under SQLite/CI that
wall-clock figure isn't meaningful, so this asserts the real invariant
instead: the aggregate query shape is bounded (O(1) roundtrips per
distributor's direct companies), not O(n) per company.
"""

import datetime

import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext

from apps.comercial.models import Assignment
from apps.empresas.models import Company
from apps.financiero.adeudo_service import adeudo_por_distribuidor
from apps.financiero.models import Pago


@pytest.mark.django_db
def test_distributor_balance_query_count_bounded_for_many_direct_companies(user_factory):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   distribuidor_id = 1

   companies = [
      Company.objects.create(proyecto="ADMIN", id_externo=f"perf-{i}", razon_social=f"E{i}")
      for i in range(200)
   ]
   for company in companies:
      Pago.objects.create(
         empresa=company,
         id_externo=f"pago-{company.pk}",
         estatus=Pago.ESTATUS_PENDIENTE,
         subtotal="10.00",
         importe_descuento="0.00",
         impuesto="0.00",
         total="10.00",
         fecha=datetime.date(2026, 1, 1),
      )
      Assignment.objects.create(
         tipo=Assignment.TIPO_EMPRESA_DIST,
         origen_id=company.pk,
         destino_id=distribuidor_id,
         usuario=actor,
         accion=Assignment.ACCION_ASIGNAR,
      )

   with CaptureQueriesContext(connection) as ctx:
      result = adeudo_por_distribuidor(distribuidor_id)

   assert result == 2000
   # bounded: a handful of queries regardless of company count (no
   # per-company loop) — well under 200 (one per company would indicate N+1)
   assert len(ctx.captured_queries) < 10
