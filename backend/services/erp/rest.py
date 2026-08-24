"""
Real ERP Gateway: consumes the ADMIN and PEOPLE REST/JSON webservices over
HTTPS with token auth, a request timeout, bounded retries on transient
failures, and a per-ERP circuit breaker that short-circuits calls during
sustained outages. See services/erp/CONTRACT.md for the assumed
request/response shapes. Used when ERP_MODE=real.
"""

import time

import httpx
from django.conf import settings

from services.erp.dto import (
   BillingCycleDTO,
   ClientDTO,
   CompanyDTO,
   PaymentDTO,
   PlanSubscriptionDTO,
)
from services.erp.errors import ERPUnavailableError, ERPValidationError
from services.erp.gateway import ERPGateway

_ERP_URLS = {
   "ADMIN": lambda: settings.ADMIN_API_URL,
   "PEOPLE": lambda: settings.PEOPLE_API_URL,
}
_ERP_TOKENS = {
   "ADMIN": lambda: settings.ADMIN_API_TOKEN,
   "PEOPLE": lambda: settings.PEOPLE_API_TOKEN,
}


class _BreakerState:
   def __init__(self):
      self.consecutive_failures = 0
      self.opened_at: float | None = None


class RestGateway(ERPGateway):
   def __init__(self, client: httpx.Client | None = None, clock=time.monotonic):
      self._client = client or httpx.Client(timeout=settings.ERP_HTTP_TIMEOUT_SECONDS)
      self._max_retries = settings.ERP_HTTP_MAX_RETRIES
      self._clock = clock
      self._breaker_threshold = settings.ERP_CIRCUIT_BREAKER_THRESHOLD
      self._breaker_cooldown = settings.ERP_CIRCUIT_BREAKER_COOLDOWN_SECONDS
      self._breakers: dict[str, _BreakerState] = {
         "ADMIN": _BreakerState(),
         "PEOPLE": _BreakerState(),
      }

   def _breaker_for(self, proyecto: str) -> _BreakerState:
      return self._breakers[proyecto]

   def _ensure_breaker_closed(self, proyecto: str) -> None:
      breaker = self._breaker_for(proyecto)
      if breaker.opened_at is None:
         return
      if self._clock() - breaker.opened_at >= self._breaker_cooldown:
         # cooldown elapsed: allow one attempt through; it will reopen the
         # breaker on failure or reset it on success.
         breaker.opened_at = None
         return
      raise ERPUnavailableError(
         f"{proyecto} circuit breaker open; failing fast without a network call"
      )

   def _record_success(self, proyecto: str) -> None:
      breaker = self._breaker_for(proyecto)
      breaker.consecutive_failures = 0
      breaker.opened_at = None

   def _record_failure(self, proyecto: str) -> None:
      breaker = self._breaker_for(proyecto)
      breaker.consecutive_failures += 1
      if breaker.consecutive_failures >= self._breaker_threshold:
         breaker.opened_at = self._clock()

   def search_companies(self, proyecto: str, query: str) -> list[CompanyDTO]:
      data = self._get(proyecto, "/companies", params={"query": query})
      return [self._to_company_dto(proyecto, item) for item in data["results"]]

   def get_company(self, proyecto: str, id_externo: str) -> CompanyDTO | None:
      try:
         data = self._get(proyecto, f"/companies/{id_externo}")
      except ERPValidationError as exc:
         if exc.status_code == 404:
            return None
         raise
      return self._to_company_dto(proyecto, data)

   def get_plans(self, proyecto: str, id_externo: str) -> list[PlanSubscriptionDTO]:
      data = self._get(proyecto, f"/companies/{id_externo}/plans")
      return [PlanSubscriptionDTO(proyecto=proyecto, **item) for item in data["results"]]

   def get_payments(self, proyecto: str, id_externo: str) -> list[PaymentDTO]:
      data = self._get(proyecto, f"/companies/{id_externo}/payments")
      return [PaymentDTO(proyecto=proyecto, **item) for item in data["results"]]

   def get_billing_cycles(self, proyecto: str, id_externo: str) -> list[BillingCycleDTO]:
      data = self._get(proyecto, f"/companies/{id_externo}/billing-cycles")
      return [BillingCycleDTO(proyecto=proyecto, **item) for item in data["results"]]

   def search_client(self, rfc: str) -> ClientDTO | None:
      data = self._get("ADMIN", "/clients", params={"rfc": rfc})
      if not data.get("found"):
         return None
      return ClientDTO(**data["client"])

   def create_client(self, rfc: str, razon_social: str) -> ClientDTO:
      data = self._post("ADMIN", "/clients", json={"rfc": rfc, "razon_social": razon_social})
      return ClientDTO(**data)

   # -- transport ---------------------------------------------------------

   def _get(self, proyecto: str, path: str, params: dict | None = None) -> dict:
      return self._request("GET", proyecto, path, params=params)

   def _post(self, proyecto: str, path: str, json: dict) -> dict:
      return self._request("POST", proyecto, path, json=json)

   def _request(self, method: str, proyecto: str, path: str, **kwargs) -> dict:
      self._ensure_breaker_closed(proyecto)

      base_url = _ERP_URLS[proyecto]()
      token = _ERP_TOKENS[proyecto]()
      url = f"{base_url.rstrip('/')}{path}"
      headers = {"Authorization": f"Bearer {token}"}

      attempt = 0
      while True:
         attempt += 1
         try:
            response = self._client.request(method, url, headers=headers, **kwargs)
         except httpx.RequestError as exc:
            if attempt > self._max_retries:
               self._record_failure(proyecto)
               raise ERPUnavailableError(
                  f"{proyecto} webservice unreachable after {attempt} attempt(s): {exc}"
               ) from exc
            continue

         if response.status_code >= 500:
            if attempt > self._max_retries:
               self._record_failure(proyecto)
               raise ERPUnavailableError(
                  f"{proyecto} webservice returned {response.status_code} "
                  f"after {attempt} attempt(s)"
               )
            continue

         if response.status_code >= 400:
            message = self._extract_error_message(response)
            raise ERPValidationError(message, status_code=response.status_code)

         self._record_success(proyecto)
         return response.json()

   @staticmethod
   def _extract_error_message(response: httpx.Response) -> str:
      try:
         body = response.json()
         return body.get("error", response.text)
      except ValueError:
         return response.text

   @staticmethod
   def _to_company_dto(proyecto: str, record: dict) -> CompanyDTO:
      return CompanyDTO(
         proyecto=proyecto,
         id_externo=record["id_externo"],
         app=record["app"],
         razon_social=record["razon_social"],
         nombre_comercial=record["nombre_comercial"],
         estado=record["estado"],
      )
