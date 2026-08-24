from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.empresas.models import Company
from apps.financiero.models import Complemento, EmpresaPlan, Plan


def _authenticated_client(user_factory, role):
   caller = user_factory(
      email=f"caller-{role.nombre}@example.com", password="s3cret-pass!", rol=role
   )
   client = APIClient()
   client.force_authenticate(user=caller)
   return client


@pytest.mark.django_db
def test_create_complemento(user_factory, role_administrador):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.post(
      reverse("complemento-list"), {"clave": "COMP-Z", "nombre": "Recurso Z"}, format="json"
   )

   assert response.status_code == 201
   assert Complemento.objects.filter(clave="COMP-Z").exists()


@pytest.mark.django_db
def test_list_complementos(user_factory, role_administrador):
   Complemento.objects.create(clave="COMP-Y", nombre="Recurso Y")
   client = _authenticated_client(user_factory, role_administrador)

   response = client.get(reverse("complemento-list"))

   assert response.status_code == 200
   assert any(c["clave"] == "COMP-Y" for c in response.data)


@pytest.mark.django_db
def test_create_plan_with_complementos(user_factory, role_administrador):
   complemento = Complemento.objects.create(clave="COMP-W", nombre="Recurso W")
   client = _authenticated_client(user_factory, role_administrador)

   response = client.post(
      reverse("plan-catalog"),
      {
         "nombre": "Plan Corporativo",
         "precio_base": "1500.00",
         "complementos": [{"complemento_id": complemento.pk, "limite": "1000.00"}],
      },
      format="json",
   )

   assert response.status_code == 201
   assert response.data["nombre"] == "Plan Corporativo"
   assert len(response.data["complementos"]) == 1
   assert response.data["complementos"][0]["limite"] == "1000.00"


@pytest.mark.django_db
def test_create_plan_requires_financiero_crear_plan_permission(user_factory, role_ejecutivo):
   client = _authenticated_client(user_factory, role_ejecutivo)

   response = client.post(
      reverse("plan-catalog"), {"nombre": "Plan X", "precio_base": "10.00"}, format="json"
   )

   assert response.status_code == 403


@pytest.mark.django_db
def test_list_plan_catalog(user_factory, role_administrador):
   Plan.objects.create(nombre="Plan Cache", origen=Plan.ORIGEN_EYEMASTER, precio_base="1.00")
   client = _authenticated_client(user_factory, role_administrador)

   response = client.get(reverse("plan-catalog"))

   assert response.status_code == 200
   assert any(p["nombre"] == "Plan Cache" for p in response.data)


@pytest.mark.django_db
def test_assign_plan_to_company(user_factory, role_administrador):
   company = Company.objects.create(proyecto="ADMIN", id_externo="ep1", razon_social="E1")
   plan = Plan.objects.create(
      nombre="Plan Local", origen=Plan.ORIGEN_EYEMASTER, precio_base="200.00"
   )
   client = _authenticated_client(user_factory, role_administrador)

   response = client.post(
      reverse("empresa-asignar-plan", args=[company.pk]),
      {
         "plan_id": plan.pk,
         "fecha_inicio": "2026-01-01",
         "fecha_final": "2026-02-01",
         "tipo_contrato": EmpresaPlan.TIPO_CONTRATO_PAGADO,
         "precio_unitario": "200.00",
      },
      format="json",
   )

   assert response.status_code == 201
   assert response.data["origen"] == "eyemaster"
   assert EmpresaPlan.objects.filter(empresa=company, plan=plan).exists()


@pytest.mark.django_db
def test_assign_plan_requires_permission(user_factory, role_ejecutivo):
   company = Company.objects.create(proyecto="ADMIN", id_externo="ep2", razon_social="E2")
   plan = Plan.objects.create(nombre="Plan Local", origen=Plan.ORIGEN_EYEMASTER, precio_base="1.00")
   client = _authenticated_client(user_factory, role_ejecutivo)

   response = client.post(
      reverse("empresa-asignar-plan", args=[company.pk]),
      {
         "plan_id": plan.pk,
         "fecha_inicio": "2026-01-01",
         "fecha_final": "2026-02-01",
         "tipo_contrato": EmpresaPlan.TIPO_CONTRATO_PAGADO,
         "precio_unitario": "1.00",
      },
      format="json",
   )

   assert response.status_code == 403


@pytest.mark.django_db
def test_assign_plan_unknown_plan_returns_404(user_factory, role_administrador):
   company = Company.objects.create(proyecto="ADMIN", id_externo="ep3", razon_social="E3")
   client = _authenticated_client(user_factory, role_administrador)

   response = client.post(
      reverse("empresa-asignar-plan", args=[company.pk]),
      {
         "plan_id": 999999,
         "fecha_inicio": "2026-01-01",
         "fecha_final": "2026-02-01",
         "tipo_contrato": EmpresaPlan.TIPO_CONTRATO_PAGADO,
         "precio_unitario": "1.00",
      },
      format="json",
   )

   assert response.status_code == 404


@pytest.mark.django_db
def test_company_plans_endpoint_shows_local_and_synced(user_factory, role_administrador):
   company = Company.objects.create(
      proyecto="ADMIN", id_externo="9999", razon_social="No ERP match"
   )
   plan = Plan.objects.create(
      nombre="Plan Local", origen=Plan.ORIGEN_EYEMASTER, precio_base=Decimal("1.00")
   )
   EmpresaPlan.objects.create(
      empresa=company,
      id_externo=None,
      origen=Plan.ORIGEN_EYEMASTER,
      plan=plan,
      tipo_contrato=EmpresaPlan.TIPO_CONTRATO_PAGADO,
      estatus=EmpresaPlan.ESTATUS_VIGENTE,
      fecha_inicio="2026-01-01",
      fecha_final="2026-02-01",
      precio_unitario="1.00",
   )
   client = _authenticated_client(user_factory, role_administrador)

   response = client.get(reverse("empresa-planes", args=[company.pk]))

   assert response.status_code == 200
   assert any(p["origen"] == "eyemaster" for p in response.data)
