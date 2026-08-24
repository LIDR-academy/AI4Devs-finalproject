import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_user_with_permission_can_create_user(user_factory, role_administrador):
   caller = user_factory(email="admin@example.com", password="s3cret-pass!", rol=role_administrador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.post(
      reverse("user-list"),
      {
         "email": "new@example.com",
         "nombre": "Nuevo",
         "password": "s3cret-pass!",
         "rol": "operador",
      },
   )

   assert response.status_code == 201


@pytest.mark.django_db
def test_user_without_permission_gets_403(user_factory, role_operador):
   caller = user_factory(email="op@example.com", password="s3cret-pass!", rol=role_operador)
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.post(
      reverse("user-list"),
      {
         "email": "new@example.com",
         "nombre": "Nuevo",
         "password": "s3cret-pass!",
         "rol": "operador",
      },
   )

   assert response.status_code == 403


@pytest.mark.django_db
def test_duplicate_email_rejected(user_factory, role_administrador):
   user_factory(email="dup@example.com", password="s3cret-pass!")
   caller = user_factory(
      email="admin2@example.com", password="s3cret-pass!", rol=role_administrador
   )
   client = APIClient()
   client.force_authenticate(user=caller)

   response = client.post(
      reverse("user-list"),
      {
         "email": "dup@example.com",
         "nombre": "Nuevo",
         "password": "s3cret-pass!",
         "rol": "operador",
      },
   )

   assert response.status_code == 400
