# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Test suite for Project Code Generation API endpoints
Tests: POST /api/projects/{id}/generate-prompt and POST /api/projects/{id}/generate-code
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test project with diagrams (from seed data)
TEST_PROJECT_ID = "34cdbb9e-656c-4bc6-a403-45cc2b81721f"  # Sistema de Ventas
TEST_DIAGRAM_1 = "d261a9af-8cfc-44fc-8aa8-417b0e00c60d"  # Test Diagram
TEST_DIAGRAM_2 = "5dc38ab6-9ab7-4907-9f95-4a98e88e5dc0"  # Proceso de Compra


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token via dev-login"""
    response = requests.post(f"{BASE_URL}/api/auth/dev-login")
    assert response.status_code == 200, f"Dev login failed: {response.text}"
    data = response.json()
    return data["session_token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


class TestGeneratePromptEndpoint:
    """Tests for POST /api/projects/{id}/generate-prompt"""
    
    def test_generate_prompt_all_diagrams_api_python(self, auth_headers):
        """Generate prompt for all diagrams with API type and Python language"""
        response = requests.post(
            f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-prompt",
            headers=auth_headers,
            json={
                "diagram_ids": [],  # empty = all diagrams
                "code_type": "api",
                "language": "python"
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "prompt" in data
        assert "project_name" in data
        assert "diagrams_count" in data
        assert "code_type" in data
        assert "language" in data
        
        # Verify values
        assert data["project_name"] == "Sistema de Ventas"
        assert data["diagrams_count"] == 2
        assert data["code_type"] == "api"
        assert data["language"] == "python"
        
        # Verify prompt content
        prompt = data["prompt"]
        assert "Generacion de Codigo desde Procesos BPMN" in prompt
        assert "Sistema de Ventas" in prompt
        assert "API Backend" in prompt
        assert "Python" in prompt
        print(f"✓ Generated prompt with {len(prompt)} characters for all diagrams")
    
    def test_generate_prompt_specific_diagram(self, auth_headers):
        """Generate prompt for a specific diagram only"""
        response = requests.post(
            f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-prompt",
            headers=auth_headers,
            json={
                "diagram_ids": [TEST_DIAGRAM_2],  # Only Proceso de Compra
                "code_type": "api",
                "language": "python"
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert data["diagrams_count"] == 1
        assert "Proceso de Compra" in data["prompt"]
        print(f"✓ Generated prompt for specific diagram")
    
    def test_generate_prompt_automation_type(self, auth_headers):
        """Generate prompt with automation code type"""
        response = requests.post(
            f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-prompt",
            headers=auth_headers,
            json={
                "diagram_ids": [],
                "code_type": "automation",
                "language": "python"
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert data["code_type"] == "automation"
        assert "Automatizacion" in data["prompt"]
        assert "workflow" in data["prompt"].lower()
        print(f"✓ Generated automation prompt")
    
    def test_generate_prompt_custom_type_with_instructions(self, auth_headers):
        """Generate prompt with custom type and custom instructions"""
        custom_instructions = "Genera un microservicio con RabbitMQ para eventos"
        response = requests.post(
            f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-prompt",
            headers=auth_headers,
            json={
                "diagram_ids": [],
                "code_type": "custom",
                "language": "nodejs",
                "custom_instructions": custom_instructions
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert data["code_type"] == "custom"
        assert data["language"] == "nodejs"
        assert custom_instructions in data["prompt"]
        assert "Node.js" in data["prompt"]
        print(f"✓ Generated custom prompt with instructions")
    
    def test_generate_prompt_all_languages(self, auth_headers):
        """Test all supported languages"""
        languages = ["python", "nodejs", "java", "csharp", "go"]
        expected_names = ["Python", "Node.js", "Java", "C#", "Go"]
        
        for lang, expected_name in zip(languages, expected_names):
            response = requests.post(
                f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-prompt",
                headers=auth_headers,
                json={
                    "diagram_ids": [],
                    "code_type": "api",
                    "language": lang
                }
            )
            assert response.status_code == 200, f"Failed for {lang}: {response.text}"
            data = response.json()
            assert data["language"] == lang
            assert expected_name in data["prompt"]
            print(f"✓ Language {lang} ({expected_name}) works")
    
    def test_generate_prompt_project_not_found(self, auth_headers):
        """Test with non-existent project"""
        response = requests.post(
            f"{BASE_URL}/api/projects/non-existent-id/generate-prompt",
            headers=auth_headers,
            json={
                "diagram_ids": [],
                "code_type": "api",
                "language": "python"
            }
        )
        assert response.status_code == 404
        print(f"✓ Returns 404 for non-existent project")
    
    def test_generate_prompt_empty_project(self, auth_headers):
        """Test with project that has no diagrams"""
        # Use Gestion de RRHH project which has 0 diagrams
        empty_project_id = "40014cba-271f-4757-ab79-2ab3bb673484"
        response = requests.post(
            f"{BASE_URL}/api/projects/{empty_project_id}/generate-prompt",
            headers=auth_headers,
            json={
                "diagram_ids": [],
                "code_type": "api",
                "language": "python"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "No diagrams" in data["detail"]
        print(f"✓ Returns 400 for project with no diagrams")


class TestGenerateCodeEndpoint:
    """Tests for POST /api/projects/{id}/generate-code (calls Gemini LLM)"""
    
    def test_generate_code_python_api(self, auth_headers):
        """Generate Python API code from prompt (calls Gemini)"""
        # First generate a prompt
        prompt_response = requests.post(
            f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-prompt",
            headers=auth_headers,
            json={
                "diagram_ids": [],
                "code_type": "api",
                "language": "python"
            }
        )
        assert prompt_response.status_code == 200
        prompt = prompt_response.json()["prompt"]
        
        # Now generate code (this calls Gemini - may take 5-10 seconds)
        response = requests.post(
            f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-code",
            headers=auth_headers,
            json={
                "prompt": prompt,
                "code_type": "api",
                "language": "python"
            },
            timeout=60  # Longer timeout for LLM call
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "code" in data
        assert "language" in data
        assert "code_type" in data
        assert "project_name" in data
        
        # Verify values
        assert data["language"] == "python"
        assert data["code_type"] == "api"
        assert data["project_name"] == "Sistema de Ventas"
        
        # Verify code content (should be Python code)
        code = data["code"]
        assert len(code) > 50, "Code should not be empty"
        # Python code typically has def, class, import, etc.
        has_python_keywords = any(kw in code for kw in ["def ", "class ", "import ", "from "])
        assert has_python_keywords, f"Generated code doesn't look like Python: {code[:200]}"
        print(f"✓ Generated {len(code)} characters of Python code")
    
    def test_generate_code_nodejs(self, auth_headers):
        """Generate Node.js/TypeScript code"""
        # Generate a simple prompt
        prompt_response = requests.post(
            f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-prompt",
            headers=auth_headers,
            json={
                "diagram_ids": [TEST_DIAGRAM_2],  # Just one diagram for faster response
                "code_type": "api",
                "language": "nodejs"
            }
        )
        assert prompt_response.status_code == 200
        prompt = prompt_response.json()["prompt"]
        
        response = requests.post(
            f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-code",
            headers=auth_headers,
            json={
                "prompt": prompt,
                "code_type": "api",
                "language": "nodejs"
            },
            timeout=60
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert data["language"] == "nodejs"
        code = data["code"]
        assert len(code) > 50
        # TypeScript/JS code typically has function, const, interface, export, etc.
        has_ts_keywords = any(kw in code for kw in ["function", "const ", "interface ", "export ", "import ", "async "])
        assert has_ts_keywords, f"Generated code doesn't look like TypeScript: {code[:200]}"
        print(f"✓ Generated {len(code)} characters of Node.js/TypeScript code")
    
    def test_generate_code_project_not_found(self, auth_headers):
        """Test with non-existent project"""
        response = requests.post(
            f"{BASE_URL}/api/projects/non-existent-id/generate-code",
            headers=auth_headers,
            json={
                "prompt": "Test prompt",
                "code_type": "api",
                "language": "python"
            }
        )
        assert response.status_code == 404
        print(f"✓ Returns 404 for non-existent project")


class TestBpmnParsing:
    """Tests to verify BPMN XML parsing in prompt generation"""
    
    def test_prompt_contains_process_elements(self, auth_headers):
        """Verify prompt contains parsed BPMN elements"""
        response = requests.post(
            f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-prompt",
            headers=auth_headers,
            json={
                "diagram_ids": [TEST_DIAGRAM_2],  # Proceso de Compra has valid BPMN
                "code_type": "api",
                "language": "python"
            }
        )
        assert response.status_code == 200
        prompt = response.json()["prompt"]
        
        # The prompt should contain process description
        assert "Proceso" in prompt
        # Should have some structure indicators
        assert any(indicator in prompt for indicator in ["Tareas", "Eventos", "Flujo", "Inicio", "Fin"])
        print(f"✓ Prompt contains parsed BPMN elements")
    
    def test_prompt_handles_invalid_xml_gracefully(self, auth_headers):
        """Verify prompt handles diagrams with invalid XML"""
        response = requests.post(
            f"{BASE_URL}/api/projects/{TEST_PROJECT_ID}/generate-prompt",
            headers=auth_headers,
            json={
                "diagram_ids": [TEST_DIAGRAM_1],  # Test Diagram has invalid XML
                "code_type": "api",
                "language": "python"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should still generate a prompt even with invalid XML
        assert "prompt" in data
        assert len(data["prompt"]) > 100
        print(f"✓ Handles invalid XML gracefully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
