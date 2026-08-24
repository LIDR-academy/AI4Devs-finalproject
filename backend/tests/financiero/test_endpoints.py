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


@pytest.mark.django_db
def test_get_plans_returns_synced_data(user_factory, role_administrador, admin_company_1001):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.get(reverse("empresa-planes", args=[admin_company_1001.pk]))

   assert response.status_code == 200
   assert len(response.data) == 1
   assert response.data[0]["precio_unitario"] == "499.00"


@pytest.mark.django_db
def test_get_payments_returns_synced_data(user_factory, role_administrador, admin_company_1001):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.get(reverse("empresa-pagos", args=[admin_company_1001.pk]))

   assert response.status_code == 200
   assert response.data[0]["total"] == "578.84"


@pytest.mark.django_db
def test_missing_permission_forbidden(user_factory, admin_company_1001):
   role_sin_permisos = Role.objects.create(nombre="rol-sin-permisos")
   caller = user_factory(
      email="noperm@example.com", password="s3cret-pass!", rol=role_sin_permisos
   )
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.get(reverse("empresa-planes", args=[admin_company_1001.pk]))

   assert response.status_code == 403
