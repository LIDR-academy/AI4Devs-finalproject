import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.auditoria.services import record_event


@pytest.mark.django_db
def test_list_requires_permission(user_factory, role_operador):
   caller = user_factory(email="op@example.com", password="s3cret-pass!", rol=role_operador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.get(reverse("auditoria-list"))

   assert response.status_code == 403


@pytest.mark.django_db
def test_list_with_permission_returns_records_most_recent_first(
   user_factory, role_administrador
):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   record_event(caller, "accion-1")
   record_event(caller, "accion-2")

   client = APIClient()
   client.force_authenticate(user=caller)
   response = client.get(reverse("auditoria-list"))

   assert response.status_code == 200
   actions = [row["accion"] for row in response.data]
   assert actions[0] == "accion-2"
   assert actions[1] == "accion-1"


@pytest.mark.django_db
def test_no_write_endpoints_exposed(user_factory, role_administrador):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.post(reverse("auditoria-list"), {"accion": "hack"})

   assert response.status_code == 405
