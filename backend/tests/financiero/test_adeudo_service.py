import datetime
from decimal import Decimal

import pytest
from django.utils import timezone

from apps.comercial.models import Assignment
from apps.empresas.models import Company
from apps.financiero.adeudo_service import (
    adeudo_por_cliente,
    adeudo_por_distribuidor,
    adeudo_por_empresa,
    adeudo_por_grupo,
)
from apps.financiero.models import Pago


def _company(n=1):
   return Company.objects.create(proyecto="ADMIN", id_externo=f"c{n}", razon_social=f"Empresa {n}")


def _pago(company, total, estatus=Pago.ESTATUS_PENDIENTE):
   return Pago.objects.create(
      empresa=company,
      id_externo=f"pago-{Pago.objects.count() + 1}",
      estatus=estatus,
      subtotal=total,
      importe_descuento="0.00",
      impuesto="0.00",
      total=total,
      fecha=datetime.date(2026, 1, 1),
   )


def _assignment(tipo, origen_id, destino_id, usuario, fecha_inicio=None, fecha_fin=None):
   assignment = Assignment.objects.create(
      tipo=tipo,
      origen_id=origen_id,
      destino_id=destino_id,
      usuario=usuario,
      accion=Assignment.ACCION_ASIGNAR,
   )
   if fecha_inicio is not None:
      Assignment.objects.filter(pk=assignment.pk).update(fecha_inicio=_aware(fecha_inicio))
   if fecha_fin is not None:
      assignment.fecha_fin = _aware(fecha_fin)
      assignment.save(update_fields=["fecha_fin"])
   return assignment


def _aware(value: datetime.date) -> datetime.datetime:
   return timezone.make_aware(datetime.datetime.combine(value, datetime.time.min))


@pytest.mark.django_db
def test_adeudo_por_empresa_sums_only_pending():
   company = _company()
   _pago(company, "100.00", estatus=Pago.ESTATUS_PENDIENTE)
   _pago(company, "50.00", estatus=Pago.ESTATUS_PAGADO)
   _pago(company, "25.00", estatus=Pago.ESTATUS_PENDIENTE)

   assert adeudo_por_empresa(company.pk) == Decimal("125.00")


@pytest.mark.django_db
def test_adeudo_por_empresa_zero_when_no_payments():
   company = _company()
   assert adeudo_por_empresa(company.pk) == Decimal("0.00")


@pytest.mark.django_db
def test_adeudo_por_cliente_sums_current_companies(user_factory):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company_a = _company(1)
   company_b = _company(2)
   _pago(company_a, "100.00")
   _pago(company_b, "200.00")

   cliente_id = 999
   _assignment(Assignment.TIPO_EMPRESA_CLIENTE, company_a.pk, cliente_id, actor)
   _assignment(Assignment.TIPO_EMPRESA_CLIENTE, company_b.pk, cliente_id, actor)

   assert adeudo_por_cliente(cliente_id) == Decimal("300.00")


@pytest.mark.django_db
def test_adeudo_por_distribuidor_includes_direct_and_group_inherited(user_factory):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   direct_company = _company(1)
   grouped_company = _company(2)
   _pago(direct_company, "100.00")
   _pago(grouped_company, "50.00")

   distribuidor_id = 500
   grupo_id = 700
   _assignment(Assignment.TIPO_EMPRESA_DIST, direct_company.pk, distribuidor_id, actor)
   _assignment(Assignment.TIPO_GRUPO_DIST, grupo_id, distribuidor_id, actor)
   _assignment(Assignment.TIPO_EMPRESA_GRUPO, grouped_company.pk, grupo_id, actor)

   assert adeudo_por_distribuidor(distribuidor_id) == Decimal("150.00")


@pytest.mark.django_db
def test_a_fecha_uses_historical_assignment(user_factory):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = _company()
   _pago(company, "100.00")

   distribuidor_a = 1
   distribuidor_b = 2
   switch_date = datetime.date(2026, 6, 1)

   old = _assignment(
      Assignment.TIPO_EMPRESA_DIST,
      company.pk,
      distribuidor_a,
      actor,
      fecha_inicio=datetime.date(2026, 1, 1),
      fecha_fin=switch_date,
   )
   assert old.fecha_fin.date() == switch_date
   _assignment(
      Assignment.TIPO_EMPRESA_DIST,
      company.pk,
      distribuidor_b,
      actor,
      fecha_inicio=switch_date,
   )

   before_switch = datetime.date(2026, 3, 1)
   assert adeudo_por_distribuidor(distribuidor_a, a_fecha=before_switch) == Decimal("100.00")
   assert adeudo_por_distribuidor(distribuidor_b, a_fecha=before_switch) == Decimal("0.00")


@pytest.mark.django_db
def test_omitting_a_fecha_matches_current_assignment(user_factory):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = _company()
   _pago(company, "100.00")
   grupo_id = 42
   _assignment(Assignment.TIPO_EMPRESA_GRUPO, company.pk, grupo_id, actor)

   assert adeudo_por_grupo(grupo_id) == adeudo_por_grupo(grupo_id, a_fecha=datetime.date.today())
