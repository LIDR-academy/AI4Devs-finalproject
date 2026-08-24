import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_admin_can_edit_role_permissions(
   user_factory, role_administrador, role_operador, permission_cliente_crear
):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.patch(
      reverse("role-detail", args=[role_operador.pk]),
      {"permissions": ["cliente.crear"]},
      format="json",
   )

   assert response.status_code == 200
   role_operador.refresh_from_db()
   assert role_operador.has_permission("cliente.crear")


@pytest.mark.django_db
def test_non_admin_cannot_edit_roles(user_factory, role_operador):
   caller = user_factory(email="op@example.com", password="s3cret-pass!", rol=role_operador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.get(reverse("role-list"))

   assert response.status_code == 403
