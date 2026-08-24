import pytest

from apps.accounts.models import Permission, Role, User
from services.erp.gateway import reset_erp_gateway_cache


@pytest.fixture(autouse=True)
def _reset_erp_gateway_cache():
   reset_erp_gateway_cache()
   yield
   reset_erp_gateway_cache()


@pytest.fixture
def role_operador(db):
   role, _ = Role.objects.get_or_create(nombre="operador")
   return role


@pytest.fixture
def role_administrador(db):
   role, _ = Role.objects.get_or_create(nombre="administrador")
   return role


@pytest.fixture
def role_ejecutivo(db):
   role, _ = Role.objects.get_or_create(nombre="ejecutivo")
   return role


@pytest.fixture
def permission_cliente_crear(db):
   permission, _ = Permission.objects.get_or_create(
      codigo="cliente.crear", defaults={"descripcion": "Registrar clientes"}
   )
   return permission


@pytest.fixture
def user_factory(db):
   def make(email="user@example.com", password="s3cret-pass!", rol=None, activo=True):
      user = User.objects.create_user(
         email=email, password=password, nombre="Test User", rol=rol, activo=activo
      )
      return user

   return make
