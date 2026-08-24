"""
Company search (pure ERP passthrough, no persistence) and retrieval
(idempotent local mirror upsert), per documentacion-funcional.md §6.3.
"""

from apps.empresas.models import Company
from services.erp.dto import CompanyDTO
from services.erp.gateway import get_erp_gateway


class CompanyNotFoundError(Exception):
   pass


def search_companies(proyecto: str, query: str) -> list[CompanyDTO]:
   gateway = get_erp_gateway()
   return gateway.search_companies(proyecto, query)


def retrieve_company(proyecto: str, id_externo: str) -> Company:
   """Reads the company from the ERP and upserts the local mirror, keyed by
   the (proyecto, id_externo) composite identity. Never writes to the ERP."""
   gateway = get_erp_gateway()
   dto = gateway.get_company(proyecto, id_externo)
   if dto is None:
      raise CompanyNotFoundError((proyecto, id_externo))

   company, _created = Company.objects.update_or_create(
      proyecto=dto.proyecto,
      id_externo=dto.id_externo,
      defaults={
         "app": dto.app,
         "razon_social": dto.razon_social,
         "nombre_comercial": dto.nombre_comercial,
         "estado": dto.estado,
      },
   )
   return company


def is_eligible_for_assignment(company: Company) -> bool:
   return company.estado != Company.ESTADO_BAJA_ERP
