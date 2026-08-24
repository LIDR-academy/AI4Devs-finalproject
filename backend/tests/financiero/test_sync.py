from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest

from apps.empresas.models import Company
from apps.financiero.models import CortePlan, EmpresaPlan, Pago
from apps.financiero.services import sync_company
from services.erp.errors import ERPUnavailableError


@pytest.fixture
def admin_company_1001(db):
   return Company.objects.create(
      proyecto="ADMIN", id_externo="1001", razon_social="Comercializadora Demo SA de CV"
   )


@pytest.mark.django_db
def test_sync_creates_cache_rows_with_decimal_amounts(admin_company_1001):
   sync_company(admin_company_1001)

   plan = EmpresaPlan.objects.get(empresa=admin_company_1001, id_externo="5001")
   assert plan.tipo_contrato == 2
   assert plan.estatus == 1
   assert plan.precio_unitario == Decimal("499.00")
   assert isinstance(plan.precio_unitario, Decimal)

   pago = Pago.objects.get(empresa=admin_company_1001, id_externo="9001")
   assert pago.total == Decimal("578.84")
   assert pago.estatus == 2

   corte = CortePlan.objects.get(empresa_plan=plan, id_externo="7001")
   assert corte.cantidad == Decimal("120.00")


@pytest.mark.django_db
def test_sync_only_calls_read_methods(admin_company_1001):
   fake_gateway = MagicMock()
   fake_gateway.get_plans.return_value = []
   fake_gateway.get_payments.return_value = []
   fake_gateway.get_billing_cycles.return_value = []

   with patch("apps.financiero.services.get_erp_gateway", return_value=fake_gateway):
      sync_company(admin_company_1001)

   fake_gateway.get_plans.assert_called_once()
   fake_gateway.get_payments.assert_called_once()
   fake_gateway.get_billing_cycles.assert_called_once()
   fake_gateway.create_client.assert_not_called()


@pytest.mark.django_db
def test_repeated_sync_updates_not_duplicates(admin_company_1001):
   sync_company(admin_company_1001)
   sync_company(admin_company_1001)

   assert EmpresaPlan.objects.filter(empresa=admin_company_1001, id_externo="5001").count() == 1
   assert Pago.objects.filter(empresa=admin_company_1001, id_externo="9001").count() == 1


@pytest.mark.django_db
def test_erp_unavailable_serves_existing_cache(admin_company_1001):
   sync_company(admin_company_1001)
   assert EmpresaPlan.objects.filter(empresa=admin_company_1001).exists()

   fake_gateway = MagicMock()
   fake_gateway.get_plans.side_effect = ERPUnavailableError("down")

   with patch("apps.financiero.services.get_erp_gateway", return_value=fake_gateway):
      sync_company(admin_company_1001)  # must not raise

   # cache from the earlier successful sync is untouched
   assert EmpresaPlan.objects.filter(empresa=admin_company_1001, id_externo="5001").exists()


@pytest.mark.django_db
def test_freemium_tipo_contrato_preserved(db):
   company = Company.objects.create(proyecto="ADMIN", id_externo="1002", razon_social="Freemium SA")
   sync_company(company)

   plan = EmpresaPlan.objects.get(empresa=company, id_externo="5002")
   assert plan.tipo_contrato == EmpresaPlan.TIPO_CONTRATO_FREEMIUM


@pytest.mark.django_db
def test_company_without_subscriptions_has_no_plans(db):
   company = Company.objects.create(proyecto="PEOPLE", id_externo="3002", razon_social="Sin plan")
   sync_company(company)

   assert EmpresaPlan.objects.filter(empresa=company).count() == 0
