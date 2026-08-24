from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.empresas.models import Company


def _authenticated_client(user_factory, role):
   caller = user_factory(
      email=f"caller-{role.nombre}@example.com", password="s3cret-pass!", rol=role
   )
   client = APIClient()
   client.force_authenticate(user=caller)
   return client, caller


@pytest.mark.django_db
def test_assign_group_success(user_factory, role_administrador, company_factory, group_factory):
   client, _ = _authenticated_client(user_factory, role_administrador)
   company = company_factory()
   group = group_factory()

   response = client.put(
      reverse("empresa-asignar-grupo", args=[company.pk]), {"grupo_id": group.pk}, format="json"
   )

   assert response.status_code == 200


@pytest.mark.django_db
def test_assign_group_unknown_target_404(user_factory, role_administrador, company_factory):
   client, _ = _authenticated_client(user_factory, role_administrador)
   company = company_factory()

   response = client.put(
      reverse("empresa-asignar-grupo", args=[company.pk]), {"grupo_id": 999999}, format="json"
   )

   assert response.status_code == 404


@pytest.mark.django_db
def test_assign_group_on_baja_erp_company_409(
   user_factory, role_administrador, company_factory, group_factory
):
   client, _ = _authenticated_client(user_factory, role_administrador)
   company = company_factory(estado=Company.ESTADO_BAJA_ERP)
   group = group_factory()

   response = client.put(
      reverse("empresa-asignar-grupo", args=[company.pk]), {"grupo_id": group.pk}, format="json"
   )

   assert response.status_code == 409


@pytest.mark.django_db
def test_direct_distributor_conflicts_with_group(
   user_factory, role_administrador, company_factory, group_factory, distributor_factory
):
   client, _ = _authenticated_client(user_factory, role_administrador)
   company = company_factory()
   group = group_factory()
   distributor = distributor_factory()

   client.put(
      reverse("empresa-asignar-grupo", args=[company.pk]), {"grupo_id": group.pk}, format="json"
   )
   response = client.put(
      reverse("empresa-asignar-distribuidor", args=[company.pk]),
      {"distribuidor_id": distributor.pk},
      format="json",
   )

   assert response.status_code == 409


@pytest.mark.django_db
def test_distributor_inheritance_from_group(
   user_factory, role_administrador, company_factory, group_factory, distributor_factory
):
   client, _ = _authenticated_client(user_factory, role_administrador)
   company = company_factory()
   group = group_factory()
   distributor = distributor_factory()

   client.put(
      reverse("empresa-asignar-grupo", args=[company.pk]), {"grupo_id": group.pk}, format="json"
   )

   from apps.comercial.services import asignar_distribuidor_a_grupo, distribuidor_efectivo

   caller = user_factory(email="setup@example.com", password="s3cret-pass!", rol=role_administrador)
   asignar_distribuidor_a_grupo(group.pk, distributor.pk, caller)

   effective = distribuidor_efectivo(company.pk)
   assert effective is not None
   assert effective.pk == distributor.pk


@pytest.mark.django_db
def test_missing_permission_forbidden(user_factory, role_ejecutivo, company_factory, group_factory):
   client, _ = _authenticated_client(user_factory, role_ejecutivo)
   company = company_factory()
   group = group_factory()

   response = client.put(
      reverse("empresa-asignar-grupo", args=[company.pk]), {"grupo_id": group.pk}, format="json"
   )

   assert response.status_code == 403


@pytest.mark.django_db
def test_assignment_emits_audit_event(
   user_factory, role_administrador, company_factory, group_factory
):
   client, _ = _authenticated_client(user_factory, role_administrador)
   company = company_factory()
   group = group_factory()

   with patch("apps.comercial.views.emit_audit_event") as audit_spy:
      response = client.put(
         reverse("empresa-asignar-grupo", args=[company.pk]), {"grupo_id": group.pk}, format="json"
      )

   assert response.status_code == 200
   audit_spy.assert_called_once()
   assert audit_spy.call_args.args[1] == "empresa.asignar_grupo"
