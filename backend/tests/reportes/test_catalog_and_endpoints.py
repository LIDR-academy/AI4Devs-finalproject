import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import Role
from apps.comercial.models import Assignment
from apps.empresas.models import Company
from apps.financiero.models import Pago
from apps.reportes.catalog import CATALOG
from apps.reportes.engine import run_report


def _authenticated_client(user_factory, role):
   caller = user_factory(email="caller@example.com", password="s3cret-pass!", rol=role)
   client = APIClient()
   client.force_authenticate(user=caller)
   return client


@pytest.mark.django_db
def test_catalog_endpoint_lists_entries(user_factory, role_administrador):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.get(reverse("reportes-catalogo"))

   assert response.status_code == 200
   assert {entry["key"] for entry in response.data} == {entry["key"] for entry in CATALOG}


@pytest.mark.django_db
def test_catalog_entry_matches_direct_consulta_call(user_factory, role_administrador):
   actor = user_factory(email="setup@example.com", password="s3cret-pass!", rol=role_administrador)
   company = Company.objects.create(proyecto="ADMIN", id_externo="cat1", razon_social="E1")
   Pago.objects.create(
      empresa=company,
      id_externo="pago-cat-1",
      estatus=Pago.ESTATUS_PENDIENTE,
      subtotal="10.00",
      importe_descuento="0.00",
      impuesto="0.00",
      total="10.00",
      fecha="2026-01-01",
   )
   Assignment.objects.create(
      tipo=Assignment.TIPO_EMPRESA_GRUPO,
      origen_id=company.pk,
      destino_id=1,
      usuario=actor,
      accion="asignar",
   )

   entry = next(e for e in CATALOG if e["key"] == "grupo_empresas_adeudo")
   direct_result = run_report(entry["medida"], entry["dimensiones"], entry["filtros"])

   client = _authenticated_client(user_factory, role_administrador)
   response = client.post(
      reverse("reportes-consulta"),
      {"medida": entry["medida"], "dimensiones": entry["dimensiones"], "filtros": entry["filtros"]},
      format="json",
   )

   assert response.status_code == 200
   assert response.data["filas"] == direct_result["filas"]
   assert response.data["total"] == direct_result["total"]


@pytest.mark.django_db
def test_consulta_endpoint_400_on_invalid_combination(user_factory, role_administrador):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.post(
      reverse("reportes-consulta"),
      {"medida": "pagado", "dimensiones": ["distribuidor"], "filtros": {}},
      format="json",
   )

   assert response.status_code == 400


@pytest.mark.django_db
def test_missing_permission_forbidden(user_factory):
   role_sin_permisos = Role.objects.create(nombre="rol-sin-reportes")
   client = _authenticated_client(user_factory, role_sin_permisos)

   response = client.get(reverse("reportes-catalogo"))

   assert response.status_code == 403
