import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_health_returns_ok():
   client = APIClient()
   response = client.get(reverse("health"))
   assert response.status_code == 200
   assert response.data["service"] == "eyemaster-backend"
   assert response.data["database"] == "ok"
