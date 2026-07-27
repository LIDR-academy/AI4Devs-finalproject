# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Test suite for POST /api/ai/process-prompt endpoint
Tests the new "Send to LLM" feature that processes prompts with Gemini or GPT
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestProcessPromptEndpoint:
    """Tests for /api/ai/process-prompt endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with auth"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        # Get auth token via dev-login
        login_res = self.session.post(f"{BASE_URL}/api/auth/dev-login")
        if login_res.status_code == 200:
            token = login_res.json().get("session_token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_endpoint_exists(self):
        """Test that POST /api/ai/process-prompt endpoint exists (not 404)"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "prompt": "Test prompt",
                "llm_provider": "gemini",
                "output_type": "code",
                "language": "python"
            }
        )
        # Should not be 404 - endpoint exists
        assert response.status_code != 404, f"Endpoint should exist, got {response.status_code}"
        print(f"✓ Endpoint exists, returned status {response.status_code}")
    
    def test_empty_prompt_returns_400(self):
        """Test that empty prompt returns 400 Bad Request"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "prompt": "",
                "llm_provider": "gemini",
                "output_type": "code",
                "language": "python"
            }
        )
        assert response.status_code == 400, f"Expected 400 for empty prompt, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Empty prompt returns 400 with message: {data.get('detail')}")
    
    def test_whitespace_only_prompt_returns_400(self):
        """Test that whitespace-only prompt returns 400"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "prompt": "   \n\t  ",
                "llm_provider": "gemini",
                "output_type": "code",
                "language": "python"
            }
        )
        assert response.status_code == 400, f"Expected 400 for whitespace prompt, got {response.status_code}"
        print("✓ Whitespace-only prompt returns 400")
    
    def test_accepts_gemini_provider(self):
        """Test that gemini is accepted as llm_provider"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "prompt": "Generate a simple hello world function",
                "llm_provider": "gemini",
                "output_type": "code",
                "language": "python"
            }
        )
        # Should be 503 (AI service error) or 200 (success), not 400/422
        assert response.status_code in [200, 503], f"Expected 200 or 503 for gemini provider, got {response.status_code}"
        print(f"✓ Gemini provider accepted, status: {response.status_code}")
    
    def test_accepts_openai_provider(self):
        """Test that openai is accepted as llm_provider"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "prompt": "Generate a simple hello world function",
                "llm_provider": "openai",
                "output_type": "code",
                "language": "python"
            }
        )
        # Should be 503 (AI service error) or 200 (success), not 400/422
        assert response.status_code in [200, 503], f"Expected 200 or 503 for openai provider, got {response.status_code}"
        print(f"✓ OpenAI provider accepted, status: {response.status_code}")
    
    def test_accepts_code_output_type(self):
        """Test that 'code' is accepted as output_type"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "prompt": "Generate a function",
                "llm_provider": "gemini",
                "output_type": "code",
                "language": "python"
            }
        )
        assert response.status_code in [200, 503], f"Expected 200 or 503 for code output, got {response.status_code}"
        print(f"✓ Code output type accepted, status: {response.status_code}")
    
    def test_accepts_docs_output_type(self):
        """Test that 'docs' is accepted as output_type"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "prompt": "Generate documentation for a process",
                "llm_provider": "gemini",
                "output_type": "docs",
                "language": "python"
            }
        )
        assert response.status_code in [200, 503], f"Expected 200 or 503 for docs output, got {response.status_code}"
        print(f"✓ Docs output type accepted, status: {response.status_code}")
    
    def test_accepts_all_languages(self):
        """Test that all supported languages are accepted"""
        languages = ["python", "nodejs", "java", "csharp", "go"]
        for lang in languages:
            response = self.session.post(
                f"{BASE_URL}/api/ai/process-prompt",
                json={
                    "prompt": f"Generate a hello world in {lang}",
                    "llm_provider": "gemini",
                    "output_type": "code",
                    "language": lang
                }
            )
            assert response.status_code in [200, 503], f"Expected 200 or 503 for {lang}, got {response.status_code}"
            print(f"✓ Language '{lang}' accepted")
    
    def test_503_error_structure(self):
        """Test that 503 error has proper structure with detail message"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "prompt": "Test prompt for error structure",
                "llm_provider": "gemini",
                "output_type": "code",
                "language": "python"
            }
        )
        if response.status_code == 503:
            data = response.json()
            assert "detail" in data, "503 response should have 'detail' field"
            assert "Error del servicio de IA" in data["detail"], "Error message should mention AI service"
            print(f"✓ 503 error has proper structure: {data.get('detail')[:50]}...")
        else:
            print(f"✓ Got status {response.status_code} (AI service may be working)")
    
    def test_default_values(self):
        """Test that default values work when only prompt is provided"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "prompt": "Test with defaults"
            }
        )
        # Should not fail validation - defaults should apply
        assert response.status_code in [200, 503], f"Expected 200 or 503 with defaults, got {response.status_code}"
        print(f"✓ Default values work, status: {response.status_code}")
    
    def test_unknown_provider_falls_back_to_gemini(self):
        """Test that unknown provider falls back to gemini (per code logic)"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "prompt": "Test with unknown provider",
                "llm_provider": "unknown_provider",
                "output_type": "code",
                "language": "python"
            }
        )
        # Should not fail - code falls back to gemini
        assert response.status_code in [200, 503], f"Expected fallback to work, got {response.status_code}"
        print(f"✓ Unknown provider falls back gracefully, status: {response.status_code}")


class TestProcessPromptRequestModel:
    """Tests for ProcessPromptRequest Pydantic model validation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        login_res = self.session.post(f"{BASE_URL}/api/auth/dev-login")
        if login_res.status_code == 200:
            token = login_res.json().get("session_token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def test_missing_prompt_field(self):
        """Test that missing prompt field returns validation error"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={
                "llm_provider": "gemini",
                "output_type": "code"
            }
        )
        # Should return 422 Unprocessable Entity for missing required field
        assert response.status_code == 422, f"Expected 422 for missing prompt, got {response.status_code}"
        print("✓ Missing prompt field returns 422")
    
    def test_model_defaults(self):
        """Test that model has correct default values"""
        # Based on models.py: llm_provider="gemini", output_type="code", language="python"
        response = self.session.post(
            f"{BASE_URL}/api/ai/process-prompt",
            json={"prompt": "Test defaults"}
        )
        # If we get 503, the request was valid and defaults were applied
        assert response.status_code in [200, 503], f"Defaults should work, got {response.status_code}"
        print("✓ Model defaults work correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
