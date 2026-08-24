import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_login_success_returns_access_and_refresh(user_factory):
   user_factory(email="ok@example.com", password="s3cret-pass!")
   client = APIClient()

   response = client.post(
      reverse("auth-login"), {"email": "ok@example.com", "password": "s3cret-pass!"}
   )

   assert response.status_code == 200
   assert "access" in response.data
   assert "refresh" in response.data


@pytest.mark.django_db
def test_login_wrong_password_is_generic_401(user_factory):
   user_factory(email="ok@example.com", password="s3cret-pass!")
   client = APIClient()

   response = client.post(
      reverse("auth-login"), {"email": "ok@example.com", "password": "wrong"}
   )

   assert response.status_code == 401
   assert "credenciales" in str(response.data).lower()


@pytest.mark.django_db
def test_login_unknown_email_is_same_generic_401(user_factory):
   user_factory(email="ok@example.com", password="s3cret-pass!")
   client = APIClient()

   wrong_password_response = client.post(
      reverse("auth-login"), {"email": "ok@example.com", "password": "wrong"}
   )
   unknown_email_response = client.post(
      reverse("auth-login"), {"email": "nobody@example.com", "password": "wrong"}
   )

   assert unknown_email_response.status_code == 401
   assert str(unknown_email_response.data) == str(wrong_password_response.data)


@pytest.mark.django_db
def test_login_inactive_user_has_distinct_message(user_factory):
   user_factory(email="inactive@example.com", password="s3cret-pass!", activo=False)
   client = APIClient()

   response = client.post(
      reverse("auth-login"), {"email": "inactive@example.com", "password": "s3cret-pass!"}
   )

   assert response.status_code == 401
   assert "desactivado" in str(response.data).lower()


@pytest.mark.django_db
def test_refresh_renews_access_token(user_factory):
   user_factory(email="ok@example.com", password="s3cret-pass!")
   client = APIClient()

   login_response = client.post(
      reverse("auth-login"), {"email": "ok@example.com", "password": "s3cret-pass!"}
   )
   refresh_response = client.post(
      reverse("auth-refresh"), {"refresh": login_response.data["refresh"]}
   )

   assert refresh_response.status_code == 200
   assert "access" in refresh_response.data


@pytest.mark.django_db
def test_refresh_with_invalid_token_rejected():
   client = APIClient()
   response = client.post(reverse("auth-refresh"), {"refresh": "not-a-real-token"})
   assert response.status_code == 401
