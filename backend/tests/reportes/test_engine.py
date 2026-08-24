import datetime

import pytest
from django.utils import timezone

from apps.comercial.models import Assignment
from apps.empresas.models import Company
from apps.financiero.models import Pago
from apps.reportes.engine import ReportValidationError, run_report


def _company(n, proyecto="ADMIN", app="SUITE_A"):
   return Company.objects.create(
      proyecto=proyecto, id_externo=f"rc{n}", app=app, razon_social=f"Empresa {n}"
   )


def _pago(company, total, estatus=Pago.ESTATUS_PENDIENTE, fecha=None):
   return Pago.objects.create(
      empresa=company,
      id_externo=f"pago-{Pago.objects.count() + 1}",
      estatus=estatus,
      subtotal=total,
      importe_descuento="0.00",
      impuesto="0.00",
      total=total,
      fecha=fecha or datetime.date(2026, 1, 1),
   )


def _assignment(tipo, origen_id, destino_id, usuario):
   return Assignment.objects.create(
      tipo=tipo, origen_id=origen_id, destino_id=destino_id, usuario=usuario, accion="asignar"
   )


def _without_names(rows):
   """Every row now also carries "<dimension>_nombre" keys (see
   test_names_are_attached_to_rows); strip them here so tests that only
   care about ids/measures stay focused on that."""
   return [{k: v for k, v in row.items() if not k.endswith("_nombre")} for row in rows]


@pytest.mark.django_db
def test_adeudo_by_distribuidor_and_empresa(user_factory):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = _company(1)
   _pago(company, "100.00")
   distribuidor_id = 10
   _assignment(Assignment.TIPO_EMPRESA_DIST, company.pk, distribuidor_id, actor)

   result = run_report("adeudo", ["distribuidor", "empresa"], {})

   assert result["total"] == "100.00"
   assert _without_names(result["filas"]) == [
      {"distribuidor": distribuidor_id, "empresa": company.pk, "adeudo": "100.00"}
   ]


@pytest.mark.django_db
def test_pagado_by_empresa_only_paid():
   company = _company(1)
   _pago(company, "50.00", estatus=Pago.ESTATUS_PAGADO)
   _pago(company, "999.00", estatus=Pago.ESTATUS_PENDIENTE)

   result = run_report("pagado", ["empresa"], {})

   assert _without_names(result["filas"]) == [{"empresa": company.pk, "pagado": "50.00"}]
   assert result["total"] == "50.00"


@pytest.mark.django_db
def test_unsupported_measure_dimension_combination_raises():
   with pytest.raises(ReportValidationError):
      run_report("pagado", ["distribuidor"], {})


@pytest.mark.django_db
def test_unknown_measure_raises():
   with pytest.raises(ReportValidationError):
      run_report("no-existe", ["empresa"], {})


@pytest.mark.django_db
def test_malformed_filter_raises():
   with pytest.raises(ReportValidationError):
      run_report("adeudo", ["empresa"], {"adeudo_min": "not-a-number"})


@pytest.mark.django_db
def test_no_matches_returns_empty_with_zero_total():
   result = run_report("adeudo", ["cliente"], {})
   assert result["filas"] == []
   assert result["total"] == "0.00"


@pytest.mark.django_db
def test_proyecto_filter_scopes_empresa_dimension():
   admin_company = _company(1, proyecto="ADMIN")
   people_company = _company(2, proyecto="PEOPLE")
   _pago(admin_company, "10.00")
   _pago(people_company, "20.00")

   result = run_report("adeudo", ["empresa"], {"proyecto": "ADMIN"})

   assert _without_names(result["filas"]) == [{"empresa": admin_company.pk, "adeudo": "10.00"}]


@pytest.mark.django_db
def test_adeudo_min_filters_post_aggregation():
   low = _company(1)
   high = _company(2)
   _pago(low, "5.00")
   _pago(high, "500.00")

   result = run_report("adeudo", ["empresa"], {"adeudo_min": "100"})

   assert _without_names(result["filas"]) == [{"empresa": high.pk, "adeudo": "500.00"}]


@pytest.mark.django_db
def test_as_of_date_reconstructs_historical_distributor(user_factory):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = _company(1)
   _pago(company, "100.00")

   distribuidor_a, distribuidor_b = 1, 2
   switch = timezone.make_aware(datetime.datetime(2026, 6, 1))

   old = Assignment.objects.create(
      tipo=Assignment.TIPO_EMPRESA_DIST,
      origen_id=company.pk,
      destino_id=distribuidor_a,
      usuario=actor,
      accion="asignar",
   )
   Assignment.objects.filter(pk=old.pk).update(
      fecha_inicio=timezone.make_aware(datetime.datetime(2026, 1, 1))
   )
   old.fecha_fin = switch
   old.save(update_fields=["fecha_fin"])
   Assignment.objects.create(
      tipo=Assignment.TIPO_EMPRESA_DIST,
      origen_id=company.pk,
      destino_id=distribuidor_b,
      usuario=actor,
      accion="reasignar",
   )

   before = datetime.date(2026, 3, 1)
   result_a = run_report("adeudo", ["distribuidor", "empresa"], {}, a_fecha=before)
   result_b = run_report(
      "adeudo", ["distribuidor", "empresa"], {}, a_fecha=datetime.date.today()
   )

   assert _without_names(result_a["filas"]) == [
      {"distribuidor": distribuidor_a, "empresa": company.pk, "adeudo": "100.00"}
   ]
   assert _without_names(result_b["filas"]) == [
      {"distribuidor": distribuidor_b, "empresa": company.pk, "adeudo": "100.00"}
   ]


@pytest.mark.django_db
def test_names_are_attached_to_rows(user_factory):
   from apps.comercial.models import Distributor

   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = _company(1)
   _pago(company, "100.00")
   distributor = Distributor.objects.create(nombre="Distribuidor Real")
   _assignment(Assignment.TIPO_EMPRESA_DIST, company.pk, distributor.pk, actor)

   result = run_report("adeudo", ["distribuidor", "empresa"], {})

   row = result["filas"][0]
   assert row["distribuidor_nombre"] == "Distribuidor Real"
   assert row["empresa_nombre"] == "Empresa 1"


@pytest.mark.django_db
def test_unknown_entity_id_falls_back_to_hash_id(user_factory):
   """A dimension value with no matching row (e.g. a distributor id that
   only exists as an Assignment.destino_id, never created as a real
   Distributor) still gets a readable fallback instead of crashing."""
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = _company(1)
   _pago(company, "100.00")
   _assignment(Assignment.TIPO_EMPRESA_DIST, company.pk, 999, actor)

   result = run_report("adeudo", ["distribuidor", "empresa"], {})

   assert result["filas"][0]["distribuidor_nombre"] == "#999"


@pytest.mark.django_db
def test_engine_performs_no_writes(user_factory):
   """R-REP-04: reporting is read-only."""
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = _company(1)
   _pago(company, "10.00")
   _assignment(Assignment.TIPO_EMPRESA_GRUPO, company.pk, 1, actor)

   before_count_pago = Pago.objects.count()
   before_count_assignment = Assignment.objects.count()

   run_report("adeudo", ["grupo", "empresa"], {})

   assert Pago.objects.count() == before_count_pago
   assert Assignment.objects.count() == before_count_assignment
