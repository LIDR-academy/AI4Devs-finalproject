import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import Role
from apps.empresas.models import Company


@pytest.fixture
def admin_company_1001(db):
   return Company.objects.create(
      proyecto="ADMIN", id_externo="1001", razon_social="Comercializadora Demo SA de CV"
   )


def _authenticated_client(user_factory, role):
   caller = user_factory(email="caller@example.com", password="s3cret-pass!", rol=role)
   client = APIClient()
   client.force_authenticate(user=caller)
   return client


@pytest.mark.django_db
def test_company_status_endpoint(user_factory, role_administrador, admin_company_1001):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.get(reverse("empresa-estado", args=[admin_company_1001.pk]))

   assert response.status_code == 200
   assert response.data["estado_derivado"] in ("vigente", "vencido", "bloqueado")


@pytest.mark.django_db
def test_company_balance_endpoint(user_factory, role_administrador, admin_company_1001):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.get(reverse("empresa-adeudo", args=[admin_company_1001.pk]))

   assert response.status_code == 200
   assert "adeudo" in response.data


@pytest.mark.django_db
def test_a_fecha_query_param_accepted(user_factory, role_administrador, admin_company_1001):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.get(
      reverse("empresa-adeudo", args=[admin_company_1001.pk]), {"a_fecha": "2026-01-01"}
   )

   assert response.status_code == 200


@pytest.mark.django_db
def test_missing_permission_forbidden(user_factory, admin_company_1001):
   role_sin_permisos = Role.objects.create(nombre="rol-sin-permisos-balance")
   client = _authenticated_client(user_factory, role_sin_permisos)

   response = client.get(reverse("empresa-adeudo", args=[admin_company_1001.pk]))

   assert response.status_code == 403
