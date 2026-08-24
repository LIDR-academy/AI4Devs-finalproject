import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.empresas.models import Company
from apps.empresas.services import is_eligible_for_assignment


def _authenticated_client(user_factory, role_administrador):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)
   return client


@pytest.mark.django_db
def test_search_returns_erp_results_without_persisting(user_factory, role_administrador):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.get(reverse("empresa-buscar"), {"proyecto": "ADMIN", "query": "Demo"})

   assert response.status_code == 200
   assert any(r["id_externo"] == "1001" for r in response.data)
   assert Company.objects.count() == 0


@pytest.mark.django_db
def test_search_no_matches_returns_empty_list(user_factory, role_administrador):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.get(
      reverse("empresa-buscar"), {"proyecto": "ADMIN", "query": "no-such-company"}
   )

   assert response.status_code == 200
   assert response.data == []


@pytest.mark.django_db
def test_first_retrieval_creates_mirror(user_factory, role_administrador):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.post(
      reverse("empresa-recuperar"), {"proyecto": "ADMIN", "id_externo": "1001"}
   )

   assert response.status_code == 200
   assert Company.objects.count() == 1
   company = Company.objects.get()
   assert company.proyecto == "ADMIN"
   assert company.id_externo == "1001"
   assert company.ultima_sync is not None


@pytest.mark.django_db
def test_repeated_retrieval_updates_same_record(user_factory, role_administrador):
   client = _authenticated_client(user_factory, role_administrador)

   client.post(reverse("empresa-recuperar"), {"proyecto": "ADMIN", "id_externo": "1001"})
   first_pk = Company.objects.get().pk
   client.post(reverse("empresa-recuperar"), {"proyecto": "ADMIN", "id_externo": "1001"})

   assert Company.objects.count() == 1
   assert Company.objects.get().pk == first_pk


@pytest.mark.django_db
def test_id_collision_across_erps_produces_distinct_records(user_factory, role_administrador):
   client = _authenticated_client(user_factory, role_administrador)

   client.post(reverse("empresa-recuperar"), {"proyecto": "ADMIN", "id_externo": "2001"})
   client.post(reverse("empresa-recuperar"), {"proyecto": "PEOPLE", "id_externo": "2001"})

   assert Company.objects.count() == 2
   proyectos = set(Company.objects.values_list("proyecto", flat=True))
   assert proyectos == {"ADMIN", "PEOPLE"}


@pytest.mark.django_db
def test_retrieval_reflects_baja_erp_state(user_factory, role_administrador):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.post(
      reverse("empresa-recuperar"), {"proyecto": "ADMIN", "id_externo": "1003"}
   )

   assert response.status_code == 200
   company = Company.objects.get()
   assert company.estado == Company.ESTADO_BAJA_ERP
   assert is_eligible_for_assignment(company) is False


@pytest.mark.django_db
def test_is_eligible_true_for_active_company():
   company = Company(estado=Company.ESTADO_ACTIVA)
   assert is_eligible_for_assignment(company) is True


@pytest.mark.django_db
def test_retrieval_not_found_returns_404(user_factory, role_administrador):
   client = _authenticated_client(user_factory, role_administrador)

   response = client.post(
      reverse("empresa-recuperar"), {"proyecto": "ADMIN", "id_externo": "no-such-id"}
   )

   assert response.status_code == 404


@pytest.mark.django_db
def test_missing_permission_forbidden_on_search(user_factory, role_ejecutivo):
   caller = user_factory(email="ex@example.com", password="s3cret-pass!", rol=role_ejecutivo)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.get(reverse("empresa-buscar"), {"proyecto": "ADMIN", "query": "Demo"})

   assert response.status_code == 403
