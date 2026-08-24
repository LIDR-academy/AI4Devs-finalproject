import pytest

from apps.clientes.models import Client
from apps.comercial.models import Distributor, Group
from apps.empresas.models import Company


@pytest.fixture
def company_factory(db):
   counter = {"n": 0}

   def make(estado=Company.ESTADO_ACTIVA):
      counter["n"] += 1
      return Company.objects.create(
         proyecto="ADMIN",
         id_externo=f"ext-{counter['n']}",
         app="SUITE_A",
         razon_social=f"Empresa {counter['n']}",
         estado=estado,
      )

   return make


@pytest.fixture
def client_record_factory(db):
   counter = {"n": 0}

   def make():
      counter["n"] += 1
      return Client.objects.create(
         rfc=f"RFC{counter['n']:07d}XXX", razon_social=f"Cliente {counter['n']}"
      )

   return make


@pytest.fixture
def group_factory(db):
   counter = {"n": 0}

   def make():
      counter["n"] += 1
      return Group.objects.create(nombre=f"Grupo {counter['n']}")

   return make


@pytest.fixture
def distributor_factory(db):
   counter = {"n": 0}

   def make():
      counter["n"] += 1
      return Distributor.objects.create(nombre=f"Distribuidor {counter['n']}")

   return make
