import pytest
from django.test import override_settings

from services.erp.gateway import get_erp_gateway
from services.erp.mock import MockGateway
from services.erp.rest import RestGateway


@override_settings(ERP_MODE="mock")
def test_default_mock_mode_resolves_mock_gateway():
   assert isinstance(get_erp_gateway(), MockGateway)


@override_settings(
   ERP_MODE="real",
   ADMIN_API_URL="https://admin.erp.test",
   ADMIN_API_TOKEN="t",
   PEOPLE_API_URL="https://people.erp.test",
   PEOPLE_API_TOKEN="t",
)
def test_real_mode_resolves_rest_gateway():
   assert isinstance(get_erp_gateway(), RestGateway)


@override_settings(ERP_MODE="bogus")
def test_unknown_mode_raises():
   with pytest.raises(RuntimeError):
      get_erp_gateway()


@override_settings(ERP_MODE="mock")
def test_gateway_instance_is_cached():
   first = get_erp_gateway()
   second = get_erp_gateway()
   assert first is second
