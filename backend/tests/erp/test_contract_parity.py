"""
Asserts that mock and real gateways expose the exact same DTO shape for the
same logical company, so callers never need to branch on ERP_MODE.
"""

import dataclasses

import httpx
from django.test import override_settings

from services.erp.mock import MockGateway
from services.erp.rest import RestGateway


@override_settings(
   ADMIN_API_URL="https://admin.erp.test",
   ADMIN_API_TOKEN="t",
   PEOPLE_API_URL="https://people.erp.test",
   PEOPLE_API_TOKEN="t",
   ERP_HTTP_TIMEOUT_SECONDS=1,
   ERP_HTTP_MAX_RETRIES=1,
)
def test_company_dto_shape_matches_between_mock_and_real():
   mock_gateway = MockGateway()
   mock_company = mock_gateway.get_company("ADMIN", "1001")

   def handler(request: httpx.Request) -> httpx.Response:
      return httpx.Response(
         200,
         json={
            "id_externo": "1001",
            "app": "SUITE_A",
            "razon_social": "Comercializadora Demo SA de CV",
            "nombre_comercial": "Demo Norte",
            "estado": "activa",
         },
      )

   real_gateway = RestGateway(client=httpx.Client(transport=httpx.MockTransport(handler)))
   real_company = real_gateway.get_company("ADMIN", "1001")

   assert dataclasses.fields(mock_company) == dataclasses.fields(real_company)
   assert mock_company == real_company
