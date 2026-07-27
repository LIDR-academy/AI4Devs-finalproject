# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
BPMN Modeler API Tests
Tests for: Auth, Diagrams CRUD, Versions, OOP Classes, Components
Focus: Bug fixes for BPMN Editor crash and auth flow
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test diagram IDs from the review request
INVALID_XML_DIAGRAM_ID = "d261a9af-8cfc-44fc-8aa8-417b0e00c60d"
VALID_XML_DIAGRAM_ID = "5dc38ab6-9ab7-4907-9f95-4a98e88e5dc0"


class TestHealthAndBasics:
    """Basic health check and API availability tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "BPMN Modeler API" in data["message"]
        print("✓ API root endpoint working")


class TestDevLogin:
    """Test dev login endpoint for creating test sessions"""
    
    def test_dev_login_creates_session(self):
        """Test POST /api/auth/dev-login creates a valid session"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "user_id" in data
        assert "email" in data
        assert "name" in data
        assert "session_token" in data
        
        # Verify expected values
        assert data["email"] == "test@bpmnmodeler.dev"
        assert data["name"] == "Dev Tester"
        assert len(data["session_token"]) > 0
        print(f"✓ Dev login successful, token: {data['session_token'][:8]}...")
        
        return data["session_token"]
    
    def test_auth_me_with_dev_token(self):
        """Test /api/auth/me validates dev session correctly"""
        # First get a token
        login_response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        assert login_response.status_code == 200
        token = login_response.json()["session_token"]
        
        # Now test /auth/me
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_response.status_code == 200
        
        data = me_response.json()
        assert data["email"] == "test@bpmnmodeler.dev"
        print("✓ Auth /me endpoint validates session correctly")
    
    def test_auth_me_without_token_fails(self):
        """Test /api/auth/me returns 401 without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Auth /me correctly rejects unauthenticated requests")


class TestDiagramBugFixes:
    """Tests for the BPMN Editor crash bug fixes"""
    
    def test_invalid_xml_diagram_returns_fallback(self):
        """
        BUG FIX TEST: Diagram with invalid XML should return valid fallback BPMN
        Diagram d261a9af-8cfc-44fc-8aa8-417b0e00c60d had '<test/>' which caused 'root-0' crash
        """
        response = requests.get(f"{BASE_URL}/api/diagrams/{INVALID_XML_DIAGRAM_ID}")
        assert response.status_code == 200
        
        data = response.json()
        xml = data.get("current_xml", "")
        
        # Verify XML is valid BPMN (not the original invalid '<test/>')
        assert len(xml) > 50, "XML should be longer than 50 chars"
        assert "definitions" in xml, "XML should contain 'definitions'"
        assert "bpmn" in xml.lower(), "XML should contain BPMN namespace"
        assert "<test/>" not in xml, "XML should NOT be the invalid '<test/>'"
        
        print(f"✓ Invalid XML diagram returns valid fallback BPMN ({len(xml)} chars)")
    
    def test_valid_xml_diagram_returns_original(self):
        """Test that valid BPMN diagrams return their original XML"""
        response = requests.get(f"{BASE_URL}/api/diagrams/{VALID_XML_DIAGRAM_ID}")
        assert response.status_code == 200
        
        data = response.json()
        xml = data.get("current_xml", "")
        
        # Verify it's valid BPMN
        assert len(xml) > 50
        assert "definitions" in xml
        assert "Process_1" in xml  # Original diagram has this
        assert "Verificar Stock" in xml or "Pedido" in xml  # Spanish task names
        
        print(f"✓ Valid XML diagram returns original BPMN ({len(xml)} chars)")
    
    def test_nonexistent_diagram_returns_404(self):
        """Test that non-existent diagram returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/diagrams/{fake_id}")
        assert response.status_code == 404
        print("✓ Non-existent diagram returns 404")


class TestDiagramsCRUD:
    """Test CRUD operations on diagrams"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get auth headers with dev token"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = response.json()["session_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_list_diagrams(self, auth_headers):
        """Test GET /api/diagrams returns list"""
        response = requests.get(f"{BASE_URL}/api/diagrams", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ List diagrams returned {len(data)} diagrams")
    
    def test_create_diagram(self, auth_headers):
        """Test POST /api/diagrams creates a new diagram"""
        test_xml = """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  id="Definitions_Test" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_Test" isExecutable="true">
    <bpmn:startEvent id="StartEvent_Test" name="Test Start" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Test">
    <bpmndi:BPMNPlane id="BPMNPlane_Test" bpmnElement="Process_Test">
      <bpmndi:BPMNShape id="StartEvent_Test_di" bpmnElement="StartEvent_Test">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
        
        payload = {
            "name": f"TEST_Diagram_{uuid.uuid4().hex[:8]}",
            "description": "Test diagram for API testing",
            "current_xml": test_xml,
            "tags": ["test", "automated"]
        }
        
        response = requests.post(f"{BASE_URL}/api/diagrams", headers=auth_headers, json=payload)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        assert "definitions" in data["current_xml"]
        
        print(f"✓ Created diagram with ID: {data['id']}")
        
        # Cleanup - delete the test diagram
        delete_response = requests.delete(f"{BASE_URL}/api/diagrams/{data['id']}", headers=auth_headers)
        assert delete_response.status_code == 200
        print("✓ Cleaned up test diagram")
    
    def test_update_diagram(self, auth_headers):
        """Test PUT /api/diagrams/{id} updates a diagram"""
        # First create a diagram
        create_payload = {
            "name": f"TEST_Update_{uuid.uuid4().hex[:8]}",
            "description": "Original description",
            "current_xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start" />
  </bpmn:process>
</bpmn:definitions>""",
            "tags": ["test"]
        }
        
        create_response = requests.post(f"{BASE_URL}/api/diagrams", headers=auth_headers, json=create_payload)
        assert create_response.status_code == 200
        diagram_id = create_response.json()["id"]
        
        # Update the diagram
        update_payload = {
            "name": "TEST_Updated_Name",
            "description": "Updated description"
        }
        
        update_response = requests.put(f"{BASE_URL}/api/diagrams/{diagram_id}", headers=auth_headers, json=update_payload)
        assert update_response.status_code == 200
        
        updated_data = update_response.json()
        assert updated_data["name"] == "TEST_Updated_Name"
        assert updated_data["description"] == "Updated description"
        
        print(f"✓ Updated diagram {diagram_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/diagrams/{diagram_id}", headers=auth_headers)
    
    def test_delete_diagram(self, auth_headers):
        """Test DELETE /api/diagrams/{id} deletes a diagram"""
        # Create a diagram to delete
        create_payload = {
            "name": f"TEST_Delete_{uuid.uuid4().hex[:8]}",
            "description": "To be deleted",
            "current_xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true" />
</bpmn:definitions>""",
            "tags": []
        }
        
        create_response = requests.post(f"{BASE_URL}/api/diagrams", headers=auth_headers, json=create_payload)
        diagram_id = create_response.json()["id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/diagrams/{diagram_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/api/diagrams/{diagram_id}", headers=auth_headers)
        assert get_response.status_code == 404
        
        print(f"✓ Deleted diagram {diagram_id} and verified removal")


class TestVersions:
    """Test version management for diagrams"""
    
    @pytest.fixture
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = response.json()["session_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_versions(self, auth_headers):
        """Test GET /api/diagrams/{id}/versions returns version list"""
        response = requests.get(f"{BASE_URL}/api/diagrams/{VALID_XML_DIAGRAM_ID}/versions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} versions for diagram")
    
    def test_create_version(self, auth_headers):
        """Test POST /api/diagrams/{id}/versions creates a new version"""
        # First update the diagram XML
        update_payload = {
            "current_xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Updated Start" />
  </bpmn:process>
</bpmn:definitions>"""
        }
        requests.put(f"{BASE_URL}/api/diagrams/{VALID_XML_DIAGRAM_ID}", headers=auth_headers, json=update_payload)
        
        # Create a version
        version_payload = {
            "commit_message": "Test version from automated tests",
            "tags": ["test"],
            "annotations": "Automated test version"
        }
        
        response = requests.post(f"{BASE_URL}/api/diagrams/{VALID_XML_DIAGRAM_ID}/versions", headers=auth_headers, json=version_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "version_number" in data
        assert data["commit_message"] == version_payload["commit_message"]
        
        print(f"✓ Created version {data['version_number']}")


class TestOOPClasses:
    """Test OOP Classes CRUD"""
    
    @pytest.fixture
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = response.json()["session_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_list_oop_classes(self, auth_headers):
        """Test GET /api/oop-classes returns list"""
        response = requests.get(f"{BASE_URL}/api/oop-classes", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} OOP classes")
    
    def test_create_oop_class(self, auth_headers):
        """Test POST /api/oop-classes creates a new class"""
        payload = {
            "name": f"TEST_Class_{uuid.uuid4().hex[:8]}",
            "description": "Test OOP class",
            "properties": [
                {"name": "id", "type": "string", "required": True},
                {"name": "value", "type": "number", "required": False}
            ],
            "category": "other",
            "tags": ["test"]
        }
        
        response = requests.post(f"{BASE_URL}/api/oop-classes", headers=auth_headers, json=payload)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        
        print(f"✓ Created OOP class: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/oop-classes/{data['id']}", headers=auth_headers)


class TestComponents:
    """Test BPMN Components CRUD"""
    
    @pytest.fixture
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = response.json()["session_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_list_components(self, auth_headers):
        """Test GET /api/components returns list"""
        response = requests.get(f"{BASE_URL}/api/components", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} components")
    
    def test_create_component(self, auth_headers):
        """Test POST /api/components creates a new component"""
        payload = {
            "name": f"TEST_Component_{uuid.uuid4().hex[:8]}",
            "xml_fragment": "<bpmn:task id='TestTask' name='Test Task' />",
            "description": "Test component",
            "category": "task",
            "tags": ["test"],
            "is_public": True
        }
        
        response = requests.post(f"{BASE_URL}/api/components", headers=auth_headers, json=payload)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        
        print(f"✓ Created component: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/components/{data['id']}", headers=auth_headers)


class TestBranches:
    """Test branch management"""
    
    @pytest.fixture
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = response.json()["session_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_list_branches(self, auth_headers):
        """Test GET /api/diagrams/{id}/branches returns list"""
        response = requests.get(f"{BASE_URL}/api/diagrams/{VALID_XML_DIAGRAM_ID}/branches", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} branches")
    
    def test_create_branch(self, auth_headers):
        """Test POST /api/diagrams/{id}/branches creates a branch"""
        payload = {
            "name": f"TEST_branch_{uuid.uuid4().hex[:8]}",
            "description": "Test branch"
        }
        
        response = requests.post(f"{BASE_URL}/api/diagrams/{VALID_XML_DIAGRAM_ID}/branches", headers=auth_headers, json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        
        print(f"✓ Created branch: {data['id']}")


class TestComments:
    """Test comments on diagrams"""
    
    @pytest.fixture
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = response.json()["session_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_list_comments(self, auth_headers):
        """Test GET /api/diagrams/{id}/comments returns list"""
        response = requests.get(f"{BASE_URL}/api/diagrams/{VALID_XML_DIAGRAM_ID}/comments", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} comments")
    
    def test_create_comment(self, auth_headers):
        """Test POST /api/diagrams/{id}/comments creates a comment"""
        payload = {
            "element_id": "StartEvent_1",
            "element_name": "Test Start Event",
            "content": "Test comment from automated tests",
            "mentions": []
        }
        
        response = requests.post(f"{BASE_URL}/api/diagrams/{VALID_XML_DIAGRAM_ID}/comments", headers=auth_headers, json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["content"] == payload["content"]
        
        print(f"✓ Created comment: {data['id']}")


class TestStats:
    """Test stats and dashboard endpoints"""
    
    @pytest.fixture
    def auth_headers(self):
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = response.json()["session_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_stats(self, auth_headers):
        """Test GET /api/stats returns dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/stats", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_diagrams" in data
        assert "total_versions" in data
        assert "total_classes" in data
        
        print(f"✓ Stats: {data['total_diagrams']} diagrams, {data['total_versions']} versions")
    
    def test_get_tags(self, auth_headers):
        """Test GET /api/tags returns tag list"""
        response = requests.get(f"{BASE_URL}/api/tags", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} tags")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
