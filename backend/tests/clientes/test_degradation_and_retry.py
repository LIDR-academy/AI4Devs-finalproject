from unittest.mock import MagicMock, patch

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.clientes.models import Client
from services.erp.errors import ERPUnavailableError, ERPValidationError


def _authenticated_client(user_factory, role_administrador):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)
   return client


@pytest.mark.django_db
def test_registration_saved_pending_when_erp_unavailable(user_factory, role_administrador):
   api_client = _authenticated_client(user_factory, role_administrador)
   fake_gateway = MagicMock()
   fake_gateway.search_client.side_effect = ERPUnavailableError("down")

   with patch("apps.clientes.services.get_erp_gateway", return_value=fake_gateway):
      response = api_client.post(
         reverse("cliente-list"),
         {"rfc": "PEND010101XXX", "razon_social": "Pendiente SA de CV"},
      )

   assert response.status_code == 202
   assert response.data["estado_sync"] == "pendiente"
   assert Client.objects.get(rfc="PEND010101XXX").estado_sync == Client.ESTADO_PENDIENTE


@pytest.mark.django_db
def test_registration_rejected_by_erp_validation_creates_no_record(
   user_factory, role_administrador
):
   api_client = _authenticated_client(user_factory, role_administrador)
   fake_gateway = MagicMock()
   fake_gateway.search_client.return_value = None
   fake_gateway.create_client.side_effect = ERPValidationError("rfc invalido", status_code=400)

   with patch("apps.clientes.services.get_erp_gateway", return_value=fake_gateway):
      response = api_client.post(
         reverse("cliente-list"),
         {"rfc": "BAD0101010XX", "razon_social": "Invalido SA de CV"},
      )

   assert response.status_code == 400
   assert not Client.objects.filter(rfc="BAD0101010XX").exists()


@pytest.mark.django_db
def test_retry_succeeds_after_erp_recovers(user_factory, role_administrador):
   api_client = _authenticated_client(user_factory, role_administrador)
   pending = Client.objects.create(
      rfc="RETRY10101XX", razon_social="Reintento SA de CV", estado_sync=Client.ESTADO_PENDIENTE
   )

   response = api_client.post(reverse("cliente-retry", args=[pending.pk]))

   assert response.status_code == 200
   assert response.data["estado_sync"] == "sincronizado"


@pytest.mark.django_db
def test_registration_emits_audit_event(user_factory, role_administrador):
   api_client = _authenticated_client(user_factory, role_administrador)

   with patch("apps.clientes.views.emit_audit_event") as audit_spy:
      response = api_client.post(
         reverse("cliente-list"),
         {"rfc": "AUDIT010101X", "razon_social": "Auditada SA de CV"},
      )

   assert response.status_code == 201
   audit_spy.assert_called_once()
   assert audit_spy.call_args.args[1] == "cliente.crear"
