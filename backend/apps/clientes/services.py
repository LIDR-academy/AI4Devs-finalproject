"""
Client registration service: local uniqueness check, then search-or-create
against ADMIN's catalogo_clientes through the ERP Gateway, matching the flow
documented in documentacion-funcional.md §6.2.
"""

from apps.clientes.models import Client
from services.erp.errors import ERPUnavailableError, ERPValidationError
from services.erp.gateway import get_erp_gateway


class DuplicateRfcError(Exception):
   pass


class ErpRejectedClientError(Exception):
   def __init__(self, message: str):
      super().__init__(message)
      self.message = message


def register_client(rfc: str, razon_social: str) -> Client:
   """Creates a new local Client, enforcing uniqueness before ever calling
   the ERP. Raises DuplicateRfcError without any gateway call."""
   if Client.objects.filter(rfc=rfc).exists():
      raise DuplicateRfcError(rfc)

   client = Client(rfc=rfc, razon_social=razon_social)
   return _sync_with_erp(client)


def retry_sync(client: Client) -> Client:
   """Re-runs the search-or-create flow for an existing pending/error
   client, reusing its stored razon_social."""
   return _sync_with_erp(client)


def _sync_with_erp(client: Client) -> Client:
   gateway = get_erp_gateway()

   try:
      existing = gateway.search_client(client.rfc)
      if existing is not None:
         client.id_admin_catalogo_clientes = existing.id_externo
         client.origen = Client.ORIGEN_EXISTENTE
      else:
         created = gateway.create_client(client.rfc, client.razon_social)
         client.id_admin_catalogo_clientes = created.id_externo
         client.origen = Client.ORIGEN_CREADO
   except ERPUnavailableError:
      client.estado_sync = Client.ESTADO_PENDIENTE
      client.save()
      return client
   except ERPValidationError as exc:
      if client.pk is not None:
         client.estado_sync = Client.ESTADO_ERROR
         client.save()
      raise ErpRejectedClientError(str(exc)) from exc

   client.estado_sync = Client.ESTADO_SINCRONIZADO
   client.save()
   return client
