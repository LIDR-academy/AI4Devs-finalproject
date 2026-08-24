import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.auditoria.models import Bitacora


@pytest.mark.django_db
def test_login_creates_bitacora_record(user_factory):
   user = user_factory(email="ok@example.com", password="s3cret-pass!")
   client = APIClient()

   client.post(reverse("auth-login"), {"email": "ok@example.com", "password": "s3cret-pass!"})

   record = Bitacora.objects.get(accion="login", usuario=user)
   assert record is not None
