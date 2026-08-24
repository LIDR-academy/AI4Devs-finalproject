"""
Single entry point to the external ERPs (ADMIN, PEOPLE). Every module that
needs ERP data or client registration MUST go through an ERPGateway instance
obtained from get_erp_gateway() — never construct HTTP requests or DB
connections to the ERPs elsewhere.
"""

from abc import ABC, abstractmethod

from django.conf import settings

from services.erp.dto import (
    BillingCycleDTO,
    ClientDTO,
    CompanyDTO,
    PaymentDTO,
    PlanSubscriptionDTO,
)

PROYECTO_ADMIN = "ADMIN"
PROYECTO_PEOPLE = "PEOPLE"
PROYECTOS = (PROYECTO_ADMIN, PROYECTO_PEOPLE)


class ERPGateway(ABC):
   """Contract every ERP Gateway implementation (mock, real) must satisfy."""

   @abstractmethod
   def search_companies(self, proyecto: str, query: str) -> list[CompanyDTO]:
      """Search companies by name or external id within one ERP."""

   @abstractmethod
   def get_company(self, proyecto: str, id_externo: str) -> CompanyDTO | None:
      """Fetch a single company by its external id. None if not found."""

   @abstractmethod
   def get_plans(self, proyecto: str, id_externo: str) -> list[PlanSubscriptionDTO]:
      """List plan subscriptions (empresa_plan) for a company."""

   @abstractmethod
   def get_payments(self, proyecto: str, id_externo: str) -> list[PaymentDTO]:
      """List payments for a company."""

   @abstractmethod
   def get_billing_cycles(self, proyecto: str, id_externo: str) -> list[BillingCycleDTO]:
      """List billing cycles (corte_plan) for a company."""

   @abstractmethod
   def search_client(self, rfc: str) -> ClientDTO | None:
      """Search a client by RFC in ADMIN's catalogo_clientes. None if not found."""

   @abstractmethod
   def create_client(self, rfc: str, razon_social: str) -> ClientDTO:
      """Create a client in ADMIN's catalogo_clientes. The only write operation."""


_gateway_instance: ERPGateway | None = None


def get_erp_gateway() -> ERPGateway:
   """Resolve the ERPGateway implementation from the ERP_MODE setting.

   Cached per-process: the mode does not change at runtime.
   """
   global _gateway_instance
   if _gateway_instance is not None:
      return _gateway_instance

   mode = getattr(settings, "ERP_MODE", "mock")
   if mode == "mock":
      from services.erp.mock import MockGateway

      _gateway_instance = MockGateway()
   elif mode == "real":
      from services.erp.rest import RestGateway

      _gateway_instance = RestGateway()
   else:
      raise RuntimeError(f"Unknown ERP_MODE: {mode!r} (expected 'mock' or 'real')")

   return _gateway_instance


def reset_erp_gateway_cache() -> None:
   """Test helper: forces the next get_erp_gateway() call to re-resolve."""
   global _gateway_instance
   _gateway_instance = None
