import httpx
import pytest
from django.test import override_settings

from services.erp.errors import ERPUnavailableError
from services.erp.rest import RestGateway

BASE_SETTINGS = {
   "ADMIN_API_URL": "https://admin.erp.test",
   "ADMIN_API_TOKEN": "admin-token",
   "PEOPLE_API_URL": "https://people.erp.test",
   "PEOPLE_API_TOKEN": "people-token",
   "ERP_HTTP_TIMEOUT_SECONDS": 1,
   "ERP_HTTP_MAX_RETRIES": 0,
   "ERP_CIRCUIT_BREAKER_THRESHOLD": 2,
   "ERP_CIRCUIT_BREAKER_COOLDOWN_SECONDS": 10,
}


def _failing_client() -> httpx.Client:
   def handler(request: httpx.Request) -> httpx.Response:
      return httpx.Response(503, json={"error": "down"})

   return httpx.Client(transport=httpx.MockTransport(handler))


class _FakeClock:
   def __init__(self, start=0.0):
      self.now = start

   def __call__(self) -> float:
      return self.now

   def advance(self, seconds: float) -> None:
      self.now += seconds


@override_settings(**BASE_SETTINGS)
def test_breaker_opens_after_threshold_and_short_circuits():
   clock = _FakeClock()
   attempts = {"count": 0}

   def handler(request: httpx.Request) -> httpx.Response:
      attempts["count"] += 1
      return httpx.Response(503, json={"error": "down"})

   gateway = RestGateway(client=httpx.Client(transport=httpx.MockTransport(handler)), clock=clock)

   with pytest.raises(ERPUnavailableError):
      gateway.search_companies("ADMIN", "x")
   with pytest.raises(ERPUnavailableError):
      gateway.search_companies("ADMIN", "x")

   assert attempts["count"] == 2  # threshold reached, breaker now open

   with pytest.raises(ERPUnavailableError, match="circuit breaker open"):
      gateway.search_companies("ADMIN", "x")

   assert attempts["count"] == 2  # no network call made on the 3rd attempt


@override_settings(**BASE_SETTINGS)
def test_breaker_scoped_per_erp():
   clock = _FakeClock()

   def admin_handler(request: httpx.Request) -> httpx.Response:
      return httpx.Response(503, json={"error": "down"})

   people_calls = {"count": 0}

   def people_handler(request: httpx.Request) -> httpx.Response:
      people_calls["count"] += 1
      return httpx.Response(200, json={"results": []})

   def router(request: httpx.Request) -> httpx.Response:
      if "admin" in str(request.url):
         return admin_handler(request)
      return people_handler(request)

   gateway = RestGateway(client=httpx.Client(transport=httpx.MockTransport(router)), clock=clock)

   for _ in range(2):
      with pytest.raises(ERPUnavailableError):
         gateway.search_companies("ADMIN", "x")

   # ADMIN breaker is open, PEOPLE is unaffected
   gateway.search_companies("PEOPLE", "x")
   assert people_calls["count"] == 1


@override_settings(**BASE_SETTINGS)
def test_breaker_closes_after_cooldown():
   clock = _FakeClock()
   state = {"fail": True}

   def handler(request: httpx.Request) -> httpx.Response:
      if state["fail"]:
         return httpx.Response(503, json={"error": "down"})
      return httpx.Response(200, json={"results": []})

   gateway = RestGateway(client=httpx.Client(transport=httpx.MockTransport(handler)), clock=clock)

   for _ in range(2):
      with pytest.raises(ERPUnavailableError):
         gateway.search_companies("ADMIN", "x")

   with pytest.raises(ERPUnavailableError, match="circuit breaker open"):
      gateway.search_companies("ADMIN", "x")

   clock.advance(11)  # past the 10s cooldown
   state["fail"] = False

   result = gateway.search_companies("ADMIN", "x")  # allowed through, succeeds
   assert result == []


@override_settings(**BASE_SETTINGS)
def test_successful_call_resets_failure_counter():
   clock = _FakeClock()
   state = {"fail": True}

   def handler(request: httpx.Request) -> httpx.Response:
      if state["fail"]:
         return httpx.Response(503, json={"error": "down"})
      return httpx.Response(200, json={"results": []})

   gateway = RestGateway(client=httpx.Client(transport=httpx.MockTransport(handler)), clock=clock)

   with pytest.raises(ERPUnavailableError):
      gateway.search_companies("ADMIN", "x")  # 1 failure

   state["fail"] = False
   gateway.search_companies("ADMIN", "x")  # success resets counter

   state["fail"] = True
   with pytest.raises(ERPUnavailableError):
      gateway.search_companies("ADMIN", "x")  # 1 failure again, not 2 -> breaker still closed

   # breaker not open yet (threshold=2, only 1 consecutive failure since reset)
   with pytest.raises(ERPUnavailableError) as exc_info:
      gateway.search_companies("ADMIN", "x")
   assert "circuit breaker open" not in str(exc_info.value)
