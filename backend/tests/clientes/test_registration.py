from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.clientes.models import Client


@pytest.mark.django_db
def test_registration_links_existing_client(user_factory, role_administrador):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.post(
      reverse("cliente-list"),
      {"rfc": "XAXX010101000", "razon_social": "Comercializadora Demo SA de CV"},
   )

   assert response.status_code == 201
   assert response.data["origen"] == "existente"
   assert response.data["estado_sync"] == "sincronizado"


@pytest.mark.django_db
def test_registration_creates_client_when_not_found(user_factory, role_administrador):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.post(
      reverse("cliente-list"),
      {"rfc": "NOEX010101XXX", "razon_social": "Nueva Empresa SA de CV"},
   )

   assert response.status_code == 201
   assert response.data["origen"] == "creado"
   assert response.data["estado_sync"] == "sincronizado"
   assert response.data["id_admin_catalogo_clientes"]


@pytest.mark.django_db
def test_duplicate_rfc_rejected_without_calling_gateway(user_factory, role_administrador):
   Client.objects.create(rfc="DUPX010101XXX", razon_social="Ya existe SA de CV")
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)

   with patch("apps.clientes.services.get_erp_gateway") as spy:
      response = client.post(
         reverse("cliente-list"),
         {"rfc": "DUPX010101XXX", "razon_social": "Ya existe SA de CV"},
      )
      spy.assert_not_called()

   assert response.status_code == 409


@pytest.mark.django_db
def test_missing_permission_is_forbidden(user_factory, role_ejecutivo):
   caller = user_factory(email="noop@example.com", password="s3cret-pass!", rol=role_ejecutivo)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.post(
      reverse("cliente-list"),
      {"rfc": "NOEX010101XXX", "razon_social": "Nueva Empresa SA de CV"},
   )

   assert response.status_code == 403
