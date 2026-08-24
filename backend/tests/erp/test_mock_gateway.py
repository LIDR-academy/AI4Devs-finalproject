from services.erp.mock import MockGateway


def test_search_companies_by_name():
   gateway = MockGateway()
   results = gateway.search_companies("ADMIN", "Demo")
   assert any(c.id_externo == "1001" for c in results)


def test_get_company_not_found_returns_none():
   gateway = MockGateway()
   assert gateway.get_company("ADMIN", "does-not-exist") is None


def test_id_collision_across_erps_stays_distinct():
   gateway = MockGateway()
   admin_company = gateway.get_company("ADMIN", "2001")
   people_company = gateway.get_company("PEOPLE", "2001")

   assert admin_company is not None
   assert people_company is not None
   assert admin_company.id_externo == people_company.id_externo == "2001"
   assert admin_company.proyecto != people_company.proyecto
   assert admin_company.razon_social != people_company.razon_social
   assert admin_company.identity != people_company.identity


def test_get_plans_and_payments_for_company():
   gateway = MockGateway()
   plans = gateway.get_plans("ADMIN", "1001")
   payments = gateway.get_payments("ADMIN", "1001")

   assert len(plans) == 1
   assert plans[0].estatus == 1
   assert len(payments) == 1
   assert payments[0].estatus == 2


def test_get_billing_cycles_for_company():
   gateway = MockGateway()
   cycles = gateway.get_billing_cycles("PEOPLE", "3001")
   assert len(cycles) == 1
   assert cycles[0].complemento_clave == "COMP-REC-D"


def test_search_client_found():
   gateway = MockGateway()
   client = gateway.search_client("XAXX010101000")
   assert client is not None
   assert client.id_externo == "cli-001"


def test_search_client_not_found():
   gateway = MockGateway()
   assert gateway.search_client("NOEX010101XXX") is None


def test_create_client_assigns_new_id():
   gateway = MockGateway()
   client = gateway.create_client("NOEX010101XXX", "Nuevo Cliente SA de CV")
   assert client.rfc == "NOEX010101XXX"

   found_again = gateway.search_client("NOEX010101XXX")
   assert found_again is not None
   assert found_again.id_externo == client.id_externo
