import pytest
from django.urls import reverse
from rest_framework.test import APIClient


def _authenticated_client(user_factory, role):
   caller = user_factory(
      email=f"caller-{role.nombre}@example.com", password="s3cret-pass!", rol=role
   )
   client = APIClient()
   client.force_authenticate(user=caller)
   return client


@pytest.mark.django_db
def test_get_group_distributor_none_assigned(user_factory, role_administrador, group_factory):
   client = _authenticated_client(user_factory, role_administrador)
   group = group_factory()

   response = client.get(reverse("grupo-distribuidor", args=[group.pk]))

   assert response.status_code == 200
   assert response.data == {"grupo_id": group.pk, "distribuidor_id": None}


@pytest.mark.django_db
def test_put_assigns_distributor_to_group(
   user_factory, role_administrador, group_factory, distributor_factory
):
   client = _authenticated_client(user_factory, role_administrador)
   group = group_factory()
   distributor = distributor_factory()

   response = client.put(
      reverse("grupo-distribuidor", args=[group.pk]),
      {"distribuidor_id": distributor.pk},
      format="json",
   )

   assert response.status_code == 200

   read_back = client.get(reverse("grupo-distribuidor", args=[group.pk]))
   assert read_back.data == {"grupo_id": group.pk, "distribuidor_id": distributor.pk}


@pytest.mark.django_db
def test_put_unknown_distributor_404(user_factory, role_administrador, group_factory):
   client = _authenticated_client(user_factory, role_administrador)
   group = group_factory()

   response = client.put(
      reverse("grupo-distribuidor", args=[group.pk]), {"distribuidor_id": 999999}, format="json"
   )

   assert response.status_code == 404


@pytest.mark.django_db
def test_missing_permission_forbidden(user_factory, role_ejecutivo, group_factory):
   client = _authenticated_client(user_factory, role_ejecutivo)
   group = group_factory()

   response = client.get(reverse("grupo-distribuidor", args=[group.pk]))

   assert response.status_code == 403
