# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Test suite for i18n (internationalization) API endpoints
Tests: GET /api/i18n/translations, PUT /api/i18n/translations/{lang}, POST /api/i18n/translations/bulk
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestI18nTranslations:
    """Tests for i18n translation endpoints"""

    def test_get_translations_returns_200(self):
        """GET /api/i18n/translations should return 200 with translations object"""
        response = requests.get(f"{BASE_URL}/api/i18n/translations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, dict), "Response should be a dictionary"
        print(f"✓ GET /api/i18n/translations returns 200 with {len(data)} languages")

    def test_put_translations_spanish(self):
        """PUT /api/i18n/translations/es should update Spanish translations"""
        test_key = f"test.key_{uuid.uuid4().hex[:8]}"
        test_value = "Valor de prueba"
        
        response = requests.put(
            f"{BASE_URL}/api/i18n/translations/es",
            json={"translations": {test_key: test_value}}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok", "Response should have status 'ok'"
        assert data.get("lang") == "es", "Response should confirm language 'es'"
        
        # Verify the translation was saved
        get_response = requests.get(f"{BASE_URL}/api/i18n/translations")
        assert get_response.status_code == 200
        translations = get_response.json()
        assert translations.get("es", {}).get(test_key) == test_value, "Translation should be persisted"
        print(f"✓ PUT /api/i18n/translations/es updates Spanish translations correctly")

    def test_put_translations_english(self):
        """PUT /api/i18n/translations/en should update English translations"""
        test_key = f"test.key_{uuid.uuid4().hex[:8]}"
        test_value = "Test value"
        
        response = requests.put(
            f"{BASE_URL}/api/i18n/translations/en",
            json={"translations": {test_key: test_value}}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok"
        assert data.get("lang") == "en"
        print(f"✓ PUT /api/i18n/translations/en updates English translations correctly")

    def test_put_translations_french(self):
        """PUT /api/i18n/translations/fr should update French translations"""
        test_key = f"test.key_{uuid.uuid4().hex[:8]}"
        test_value = "Valeur de test"
        
        response = requests.put(
            f"{BASE_URL}/api/i18n/translations/fr",
            json={"translations": {test_key: test_value}}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok"
        assert data.get("lang") == "fr"
        print(f"✓ PUT /api/i18n/translations/fr updates French translations correctly")

    def test_put_translations_italian(self):
        """PUT /api/i18n/translations/it should update Italian translations"""
        test_key = f"test.key_{uuid.uuid4().hex[:8]}"
        test_value = "Valore di prova"
        
        response = requests.put(
            f"{BASE_URL}/api/i18n/translations/it",
            json={"translations": {test_key: test_value}}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok"
        assert data.get("lang") == "it"
        print(f"✓ PUT /api/i18n/translations/it updates Italian translations correctly")

    def test_put_translations_chinese(self):
        """PUT /api/i18n/translations/zh should update Chinese translations"""
        test_key = f"test.key_{uuid.uuid4().hex[:8]}"
        test_value = "测试值"
        
        response = requests.put(
            f"{BASE_URL}/api/i18n/translations/zh",
            json={"translations": {test_key: test_value}}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok"
        assert data.get("lang") == "zh"
        print(f"✓ PUT /api/i18n/translations/zh updates Chinese translations correctly")

    def test_put_translations_japanese(self):
        """PUT /api/i18n/translations/ja should update Japanese translations"""
        test_key = f"test.key_{uuid.uuid4().hex[:8]}"
        test_value = "テスト値"
        
        response = requests.put(
            f"{BASE_URL}/api/i18n/translations/ja",
            json={"translations": {test_key: test_value}}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok"
        assert data.get("lang") == "ja"
        print(f"✓ PUT /api/i18n/translations/ja updates Japanese translations correctly")

    def test_bulk_update_translations(self):
        """POST /api/i18n/translations/bulk should update multiple languages at once"""
        test_key = f"test.bulk_{uuid.uuid4().hex[:8]}"
        
        bulk_data = {
            "es": {test_key: "Valor masivo"},
            "en": {test_key: "Bulk value"},
            "fr": {test_key: "Valeur en masse"}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/i18n/translations/bulk",
            json=bulk_data
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok"
        assert set(data.get("languages_updated", [])) == {"es", "en", "fr"}, "Should update all 3 languages"
        
        # Verify all translations were saved
        get_response = requests.get(f"{BASE_URL}/api/i18n/translations")
        assert get_response.status_code == 200
        translations = get_response.json()
        assert translations.get("es", {}).get(test_key) == "Valor masivo"
        assert translations.get("en", {}).get(test_key) == "Bulk value"
        assert translations.get("fr", {}).get(test_key) == "Valeur en masse"
        print(f"✓ POST /api/i18n/translations/bulk updates multiple languages correctly")


class TestI18nUserLanguage:
    """Tests for user language preference endpoints (requires authentication)"""

    @pytest.fixture
    def auth_token(self):
        """Get authentication token via dev-login"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        if response.status_code == 200:
            data = response.json()
            return data.get("session_token")
        pytest.skip("Dev login not available")

    def test_get_user_language_unauthenticated(self):
        """GET /api/i18n/user-language should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/i18n/user-language")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ GET /api/i18n/user-language returns 401 without auth")

    def test_get_user_language_authenticated(self, auth_token):
        """GET /api/i18n/user-language should return language preference for authenticated user"""
        response = requests.get(
            f"{BASE_URL}/api/i18n/user-language",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "language" in data, "Response should contain 'language' field"
        assert data["language"] in ["es", "en", "fr", "it", "zh", "ja"], "Language should be one of supported languages"
        print(f"✓ GET /api/i18n/user-language returns language preference: {data['language']}")

    def test_set_user_language_unauthenticated(self):
        """PUT /api/i18n/user-language should return 401 without auth"""
        response = requests.put(
            f"{BASE_URL}/api/i18n/user-language",
            json={"language": "en"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ PUT /api/i18n/user-language returns 401 without auth")

    def test_set_user_language_authenticated(self, auth_token):
        """PUT /api/i18n/user-language should update language preference"""
        # Set to English
        response = requests.put(
            f"{BASE_URL}/api/i18n/user-language",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"language": "en"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("status") == "ok"
        assert data.get("language") == "en"
        
        # Verify it was saved
        get_response = requests.get(
            f"{BASE_URL}/api/i18n/user-language",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert get_response.status_code == 200
        assert get_response.json().get("language") == "en"
        print(f"✓ PUT /api/i18n/user-language updates language preference correctly")

    def test_set_user_language_invalid(self, auth_token):
        """PUT /api/i18n/user-language should reject invalid language codes"""
        response = requests.put(
            f"{BASE_URL}/api/i18n/user-language",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"language": "invalid"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✓ PUT /api/i18n/user-language rejects invalid language codes")

    def test_set_user_language_all_supported(self, auth_token):
        """PUT /api/i18n/user-language should accept all 6 supported languages"""
        supported = ["es", "en", "fr", "it", "zh", "ja"]
        for lang in supported:
            response = requests.put(
                f"{BASE_URL}/api/i18n/user-language",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={"language": lang}
            )
            assert response.status_code == 200, f"Expected 200 for {lang}, got {response.status_code}"
        print(f"✓ PUT /api/i18n/user-language accepts all 6 supported languages")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
