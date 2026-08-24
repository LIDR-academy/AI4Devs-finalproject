"""
Mock ERP Gateway: simulates both the request and the response of the ERP
webservices by reading local JSON fixtures. No network call is ever made.
Used while ERP_MODE=mock (the default until the real webservices exist).
"""

import json
from pathlib import Path

from services.erp.dto import (
    BillingCycleDTO,
    ClientDTO,
    CompanyDTO,
    PaymentDTO,
    PlanSubscriptionDTO,
)
from services.erp.gateway import ERPGateway

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


def _load(filename: str):
   with open(FIXTURES_DIR / filename, encoding="utf-8") as f:
      return json.load(f)


class MockGateway(ERPGateway):
   def __init__(self):
      self._companies = {
         "ADMIN": _load("admin_companies.json"),
         "PEOPLE": _load("people_companies.json"),
      }
      self._plans = {
         "ADMIN": _load("admin_plans.json"),
         "PEOPLE": _load("people_plans.json"),
      }
      self._payments = {
         "ADMIN": _load("admin_payments.json"),
         "PEOPLE": _load("people_payments.json"),
      }
      self._billing_cycles = {
         "ADMIN": _load("admin_billing_cycles.json"),
         "PEOPLE": _load("people_billing_cycles.json"),
      }
      self._clients = _load("admin_clients.json")
      self._next_client_seq = len(self._clients) + 1

   def search_companies(self, proyecto: str, query: str) -> list[CompanyDTO]:
      query_lower = query.lower()
      matches = [
         c
         for c in self._companies[proyecto]
         if query_lower in c["id_externo"].lower()
         or query_lower in c["razon_social"].lower()
         or query_lower in c["nombre_comercial"].lower()
      ]
      return [self._to_company_dto(proyecto, c) for c in matches]

   def get_company(self, proyecto: str, id_externo: str) -> CompanyDTO | None:
      for c in self._companies[proyecto]:
         if c["id_externo"] == id_externo:
            return self._to_company_dto(proyecto, c)
      return None

   def get_plans(self, proyecto: str, id_externo: str) -> list[PlanSubscriptionDTO]:
      records = self._plans[proyecto].get(id_externo, [])
      return [
         PlanSubscriptionDTO(proyecto=proyecto, **record) for record in records
      ]

   def get_payments(self, proyecto: str, id_externo: str) -> list[PaymentDTO]:
      records = self._payments[proyecto].get(id_externo, [])
      return [PaymentDTO(proyecto=proyecto, **record) for record in records]

   def get_billing_cycles(self, proyecto: str, id_externo: str) -> list[BillingCycleDTO]:
      records = self._billing_cycles[proyecto].get(id_externo, [])
      return [BillingCycleDTO(proyecto=proyecto, **record) for record in records]

   def search_client(self, rfc: str) -> ClientDTO | None:
      for client in self._clients:
         if client["rfc"] == rfc:
            return ClientDTO(**client)
      return None

   def create_client(self, rfc: str, razon_social: str) -> ClientDTO:
      id_externo = f"cli-{self._next_client_seq:03d}"
      self._next_client_seq += 1
      record = {"id_externo": id_externo, "rfc": rfc, "razon_social": razon_social}
      self._clients.append(record)
      return ClientDTO(**record)

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
