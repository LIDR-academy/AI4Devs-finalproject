import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_cannot_deactivate_last_active_administrator(user_factory, role_administrador):
   only_admin = user_factory(
      email="onlyadmin@example.com", password="s3cret-pass!", rol=role_administrador
   )
   client = APIClient()
   client.force_authenticate(user=only_admin)

   response = client.patch(
      reverse("user-detail", args=[only_admin.pk]), {"activo": False}, format="json"
   )

   assert response.status_code == 400
   only_admin.refresh_from_db()
   assert only_admin.activo is True


@pytest.mark.django_db
def test_cannot_delete_last_active_administrator(user_factory, role_administrador):
   only_admin = user_factory(
      email="onlyadmin@example.com", password="s3cret-pass!", rol=role_administrador
   )
   client = APIClient()
   client.force_authenticate(user=only_admin)

   response = client.delete(reverse("user-detail", args=[only_admin.pk]))

   assert response.status_code == 400


@pytest.mark.django_db
def test_can_deactivate_administrator_when_another_active_one_exists(
   user_factory, role_administrador
):
   first_admin = user_factory(
      email="admin1@example.com", password="s3cret-pass!", rol=role_administrador
   )
   second_admin = user_factory(
      email="admin2@example.com", password="s3cret-pass!", rol=role_administrador
   )
   client = APIClient()
   client.force_authenticate(user=first_admin)

   response = client.patch(
      reverse("user-detail", args=[second_admin.pk]), {"activo": False}, format="json"
   )

   assert response.status_code == 200
