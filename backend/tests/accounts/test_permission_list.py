import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_admin_can_list_all_permissions(user_factory, role_administrador):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.get(reverse("permiso-list"))

   assert response.status_code == 200
   codes = {p["codigo"] for p in response.data}
   assert "cliente.crear" in codes
   assert "rol.editar" in codes


@pytest.mark.django_db
def test_non_admin_cannot_list_permissions(user_factory, role_operador):
   caller = user_factory(email="op@example.com", password="s3cret-pass!", rol=role_operador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.get(reverse("permiso-list"))

   assert response.status_code == 403
