import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_me_returns_role_and_permissions(user_factory, role_operador, permission_cliente_crear):
   role_operador.permissions.add(permission_cliente_crear)
   user = user_factory(email="me@example.com", password="s3cret-pass!", rol=role_operador)

   client = APIClient()
   client.force_authenticate(user=user)
   response = client.get(reverse("auth-me"))

   assert response.status_code == 200
   assert response.data["email"] == "me@example.com"
   assert response.data["rol"] == "operador"
   assert "cliente.crear" in response.data["permissions"]


@pytest.mark.django_db
def test_me_requires_authentication():
   client = APIClient()
   response = client.get(reverse("auth-me"))
   assert response.status_code == 401
