import httpx
import pytest
from django.test import override_settings

from services.erp.errors import ERPUnavailableError, ERPValidationError
from services.erp.rest import RestGateway

BASE_SETTINGS = {
   "ADMIN_API_URL": "https://admin.erp.test",
   "ADMIN_API_TOKEN": "admin-token",
   "PEOPLE_API_URL": "https://people.erp.test",
   "PEOPLE_API_TOKEN": "people-token",
   "ERP_HTTP_TIMEOUT_SECONDS": 1,
   "ERP_HTTP_MAX_RETRIES": 2,
}


def _client_with_handler(handler) -> httpx.Client:
   return httpx.Client(transport=httpx.MockTransport(handler))


@override_settings(**BASE_SETTINGS)
def test_search_companies_success():
   def handler(request: httpx.Request) -> httpx.Response:
      assert request.headers["Authorization"] == "Bearer admin-token"
      assert request.url.path == "/companies"
      return httpx.Response(
         200,
         json={
            "results": [
               {
                  "id_externo": "1001",
                  "app": "SUITE_A",
                  "razon_social": "Demo",
                  "nombre_comercial": "Demo",
                  "estado": "activa",
               }
            ]
         },
      )

   gateway = RestGateway(client=_client_with_handler(handler))
   results = gateway.search_companies("ADMIN", "Demo")
   assert len(results) == 1
   assert results[0].proyecto == "ADMIN"
   assert results[0].id_externo == "1001"


@override_settings(**BASE_SETTINGS)
def test_timeout_raises_unavailable():
   def handler(request: httpx.Request) -> httpx.Response:
      raise httpx.ConnectTimeout("simulated timeout", request=request)

   gateway = RestGateway(client=_client_with_handler(handler))
   with pytest.raises(ERPUnavailableError):
      gateway.search_companies("ADMIN", "Demo")


@override_settings(**BASE_SETTINGS)
def test_5xx_retries_then_raises_unavailable():
   attempts = {"count": 0}

   def handler(request: httpx.Request) -> httpx.Response:
      attempts["count"] += 1
      return httpx.Response(503, json={"error": "temporarily unavailable"})

   gateway = RestGateway(client=_client_with_handler(handler))
   with pytest.raises(ERPUnavailableError):
      gateway.search_companies("ADMIN", "Demo")

   # initial attempt + ERP_HTTP_MAX_RETRIES retries
   assert attempts["count"] == BASE_SETTINGS["ERP_HTTP_MAX_RETRIES"] + 1


@override_settings(**BASE_SETTINGS)
def test_4xx_does_not_retry_and_raises_validation_error():
   attempts = {"count": 0}

   def handler(request: httpx.Request) -> httpx.Response:
      attempts["count"] += 1
      return httpx.Response(400, json={"error": "rfc invalido"})

   gateway = RestGateway(client=_client_with_handler(handler))
   with pytest.raises(ERPValidationError) as exc_info:
      gateway.create_client("bad-rfc", "Nombre")

   assert attempts["count"] == 1
   assert exc_info.value.status_code == 400
   assert "rfc invalido" in str(exc_info.value)


@override_settings(**BASE_SETTINGS)
def test_client_search_or_create_flow():
   def handler(request: httpx.Request) -> httpx.Response:
      if request.method == "GET":
         return httpx.Response(200, json={"found": False})
      return httpx.Response(
         201,
         json={"id_externo": "cli-099", "rfc": "NOEX010101XXX", "razon_social": "Nueva"},
      )

   gateway = RestGateway(client=_client_with_handler(handler))
   assert gateway.search_client("NOEX010101XXX") is None
   created = gateway.create_client("NOEX010101XXX", "Nueva")
   assert created.id_externo == "cli-099"
