# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Regression tests for BPMN Modeler API after server.py refactoring.
Tests all endpoints extracted to routers/ directory.
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndRoot:
    """Health check and root endpoint tests"""
    
    def test_health_check(self):
        """GET /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_root_endpoint(self):
        """GET /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "BPMN" in data["message"]
        print("✓ Root endpoint passed")


class TestAuthRouter:
    """Auth endpoints from routers/auth.py"""
    
    def test_dev_login(self):
        """POST /api/auth/dev-login creates session"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        assert data["email"] == "test@bpmnmodeler.dev"
        assert data["name"] == "Dev Tester"
        print("✓ Dev login passed")
    
    def test_get_me_authenticated(self):
        """GET /api/auth/me with valid token"""
        # First login
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json()["session_token"]
        
        # Then get me
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@bpmnmodeler.dev"
        print("✓ Get me (authenticated) passed")
    
    def test_get_me_unauthenticated(self):
        """GET /api/auth/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Get me (unauthenticated) returns 401")


class TestDiagramsRouter:
    """Diagrams CRUD from routers/diagrams.py"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        self.token = login_resp.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_diagrams(self):
        """GET /api/diagrams returns list"""
        response = requests.get(f"{BASE_URL}/api/diagrams")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get diagrams passed ({len(data)} diagrams)")
    
    def test_get_diagram_by_id(self):
        """GET /api/diagrams/{id} returns diagram"""
        # First get list
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            response = requests.get(f"{BASE_URL}/api/diagrams/{diagram_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == diagram_id
            assert "current_xml" in data
            print(f"✓ Get diagram by ID passed")
        else:
            pytest.skip("No diagrams to test")
    
    def test_get_diagram_not_found(self):
        """GET /api/diagrams/{id} returns 404 for non-existent"""
        response = requests.get(f"{BASE_URL}/api/diagrams/non-existent-id")
        assert response.status_code == 404
        print("✓ Get diagram 404 passed")
    
    def test_create_update_delete_diagram(self):
        """Full CRUD cycle for diagram"""
        # CREATE
        create_data = {
            "name": f"TEST_Regression_{uuid.uuid4().hex[:8]}",
            "description": "Test diagram for regression",
            "current_xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/diagrams",
            json=create_data,
            headers=self.headers
        )
        assert create_resp.status_code == 200
        created = create_resp.json()
        diagram_id = created["id"]
        assert created["name"] == create_data["name"]
        print(f"✓ Create diagram passed (id: {diagram_id})")
        
        # UPDATE
        update_data = {"name": f"TEST_Updated_{uuid.uuid4().hex[:8]}"}
        update_resp = requests.put(
            f"{BASE_URL}/api/diagrams/{diagram_id}",
            json=update_data,
            headers=self.headers
        )
        assert update_resp.status_code == 200
        updated = update_resp.json()
        assert updated["name"] == update_data["name"]
        print("✓ Update diagram passed")
        
        # DELETE
        delete_resp = requests.delete(f"{BASE_URL}/api/diagrams/{diagram_id}")
        assert delete_resp.status_code == 200
        print("✓ Delete diagram passed")
        
        # Verify deleted
        get_resp = requests.get(f"{BASE_URL}/api/diagrams/{diagram_id}")
        assert get_resp.status_code == 404
        print("✓ Verify deletion passed")


class TestVersionsRouter:
    """Version endpoints from routers/diagrams.py"""
    
    def test_get_versions(self):
        """GET /api/diagrams/{id}/versions returns list"""
        # Get a diagram first
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            response = requests.get(f"{BASE_URL}/api/diagrams/{diagram_id}/versions")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            print(f"✓ Get versions passed ({len(data)} versions)")
        else:
            pytest.skip("No diagrams to test")
    
    def test_get_version_tree(self):
        """GET /api/diagrams/{id}/versions/tree returns tree structure"""
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            response = requests.get(f"{BASE_URL}/api/diagrams/{diagram_id}/versions/tree")
            assert response.status_code == 200
            data = response.json()
            assert "nodes" in data
            assert "branches" in data
            assert "current_version" in data
            print("✓ Get version tree passed")
        else:
            pytest.skip("No diagrams to test")
    
    def test_create_version(self):
        """POST /api/diagrams/{id}/versions creates new version"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json()["session_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            version_data = {"commit_message": "TEST_Regression version"}
            response = requests.post(
                f"{BASE_URL}/api/diagrams/{diagram_id}/versions",
                json=version_data,
                headers=headers
            )
            assert response.status_code == 200
            data = response.json()
            assert "version_number" in data
            assert data["commit_message"] == version_data["commit_message"]
            print(f"✓ Create version passed (v{data['version_number']})")
        else:
            pytest.skip("No diagrams to test")


class TestBranchesRouter:
    """Branch endpoints from routers/diagrams.py"""
    
    def test_get_branches(self):
        """GET /api/diagrams/{id}/branches returns list"""
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            response = requests.get(f"{BASE_URL}/api/diagrams/{diagram_id}/branches")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            print(f"✓ Get branches passed ({len(data)} branches)")
        else:
            pytest.skip("No diagrams to test")
    
    def test_create_branch(self):
        """POST /api/diagrams/{id}/branches creates new branch"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json()["session_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            branch_data = {
                "name": f"TEST_branch_{uuid.uuid4().hex[:8]}",
                "description": "Test branch for regression"
            }
            response = requests.post(
                f"{BASE_URL}/api/diagrams/{diagram_id}/branches",
                json=branch_data,
                headers=headers
            )
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == branch_data["name"]
            print(f"✓ Create branch passed ({data['name']})")
        else:
            pytest.skip("No diagrams to test")


class TestOOPClassesRouter:
    """OOP Classes CRUD from routers/oop_classes.py"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        self.token = login_resp.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_oop_classes(self):
        """GET /api/oop-classes returns list"""
        response = requests.get(f"{BASE_URL}/api/oop-classes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get OOP classes passed ({len(data)} classes)")
    
    def test_create_update_delete_oop_class(self):
        """Full CRUD cycle for OOP class"""
        # CREATE
        create_data = {
            "name": f"TEST_Class_{uuid.uuid4().hex[:8]}",
            "description": "Test class for regression",
            "category": "entity",
            "properties": [
                {"name": "id", "type": "string", "required": True},
                {"name": "name", "type": "string", "required": True}
            ]
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/oop-classes",
            json=create_data,
            headers=self.headers
        )
        assert create_resp.status_code == 200
        created = create_resp.json()
        class_id = created["id"]
        assert created["name"] == create_data["name"]
        print(f"✓ Create OOP class passed (id: {class_id})")
        
        # UPDATE
        update_data = {"description": "Updated description"}
        update_resp = requests.put(
            f"{BASE_URL}/api/oop-classes/{class_id}",
            json=update_data,
            headers=self.headers
        )
        assert update_resp.status_code == 200
        updated = update_resp.json()
        assert updated["description"] == update_data["description"]
        print("✓ Update OOP class passed")
        
        # DELETE
        delete_resp = requests.delete(f"{BASE_URL}/api/oop-classes/{class_id}")
        assert delete_resp.status_code == 200
        print("✓ Delete OOP class passed")


class TestProjectsRouter:
    """Projects CRUD from routers/projects.py"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        self.token = login_resp.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_projects(self):
        """GET /api/projects returns list"""
        response = requests.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get projects passed ({len(data)} projects)")
    
    def test_get_project_by_id(self):
        """GET /api/projects/{id} returns project with diagrams"""
        list_resp = requests.get(f"{BASE_URL}/api/projects")
        projects = list_resp.json()
        if projects:
            project_id = projects[0]["id"]
            response = requests.get(f"{BASE_URL}/api/projects/{project_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == project_id
            assert "diagrams" in data
            print(f"✓ Get project by ID passed")
        else:
            pytest.skip("No projects to test")
    
    def test_create_project(self):
        """POST /api/projects creates new project"""
        create_data = {
            "name": f"TEST_Project_{uuid.uuid4().hex[:8]}",
            "description": "Test project for regression"
        }
        response = requests.post(
            f"{BASE_URL}/api/projects",
            json=create_data,
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == create_data["name"]
        print(f"✓ Create project passed (id: {data['id']})")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{data['id']}")


class TestComponentsRouter:
    """Components CRUD from routers/components.py"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        self.token = login_resp.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_components(self):
        """GET /api/components returns list"""
        response = requests.get(f"{BASE_URL}/api/components")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get components passed ({len(data)} components)")
    
    def test_create_component(self):
        """POST /api/components creates new component"""
        create_data = {
            "name": f"TEST_Component_{uuid.uuid4().hex[:8]}",
            "description": "Test component",
            "category": "task",
            "xml_fragment": "<bpmn:task id='test' name='Test'/>"
        }
        response = requests.post(
            f"{BASE_URL}/api/components",
            json=create_data,
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == create_data["name"]
        print(f"✓ Create component passed (id: {data['id']})")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/components/{data['id']}")


class TestSocialRouter:
    """Social features from routers/social.py"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        self.token = login_resp.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_notifications(self):
        """GET /api/notifications returns list"""
        response = requests.get(
            f"{BASE_URL}/api/notifications",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get notifications passed ({len(data)} notifications)")
    
    def test_get_unread_count(self):
        """GET /api/notifications/unread-count returns count"""
        response = requests.get(
            f"{BASE_URL}/api/notifications/unread-count",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        print(f"✓ Get unread count passed (count: {data['count']})")
    
    def test_get_favorites(self):
        """GET /api/favorites returns list"""
        response = requests.get(
            f"{BASE_URL}/api/favorites",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get favorites passed ({len(data)} favorites)")


class TestGitRouter:
    """Git integration from routers/git.py"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        self.token = login_resp.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_git_repos(self):
        """GET /api/git-repos returns list"""
        response = requests.get(
            f"{BASE_URL}/api/git-repos",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get git repos passed ({len(data)} repos)")


class TestToolsRouter:
    """Tools endpoints from routers/tools.py"""
    
    def test_validate_diagram(self):
        """POST /api/diagrams/{id}/validate returns validation result"""
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            response = requests.post(f"{BASE_URL}/api/diagrams/{diagram_id}/validate")
            assert response.status_code == 200
            data = response.json()
            assert "valid" in data
            assert "score" in data
            assert "errors" in data
            assert "warnings" in data
            print(f"✓ Validate diagram passed (score: {data['score']})")
        else:
            pytest.skip("No diagrams to test")
    
    def test_simulate_diagram(self):
        """POST /api/diagrams/{id}/simulate returns simulation steps"""
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            response = requests.post(f"{BASE_URL}/api/diagrams/{diagram_id}/simulate")
            assert response.status_code == 200
            data = response.json()
            assert "steps" in data
            assert "total_steps" in data
            print(f"✓ Simulate diagram passed ({data['total_steps']} steps)")
        else:
            pytest.skip("No diagrams to test")
    
    def test_generate_uml(self):
        """POST /api/diagrams/{id}/generate-uml returns UML data"""
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            response = requests.post(f"{BASE_URL}/api/diagrams/{diagram_id}/generate-uml")
            assert response.status_code == 200
            data = response.json()
            assert "classes" in data
            assert "relationships" in data
            print(f"✓ Generate UML passed ({len(data['classes'])} classes)")
        else:
            pytest.skip("No diagrams to test")
    
    def test_generate_docs(self):
        """POST /api/diagrams/{id}/generate-docs returns markdown"""
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            response = requests.post(f"{BASE_URL}/api/diagrams/{diagram_id}/generate-docs")
            assert response.status_code == 200
            data = response.json()
            assert "markdown" in data
            assert "diagram_name" in data
            print(f"✓ Generate docs passed")
        else:
            pytest.skip("No diagrams to test")
    
    def test_analytics(self):
        """POST /api/diagrams/{id}/analytics returns metrics"""
        list_resp = requests.get(f"{BASE_URL}/api/diagrams")
        diagrams = list_resp.json()
        if diagrams:
            diagram_id = diagrams[0]["id"]
            response = requests.post(f"{BASE_URL}/api/diagrams/{diagram_id}/analytics")
            assert response.status_code == 200
            data = response.json()
            assert "tasks" in data
            assert "gateways" in data
            assert "complexity_score" in data
            assert "complexity_level" in data
            print(f"✓ Analytics passed (complexity: {data['complexity_score']})")
        else:
            pytest.skip("No diagrams to test")
    
    def test_get_stats(self):
        """GET /api/stats returns global statistics"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_diagrams" in data
        assert "total_versions" in data
        assert "total_projects" in data
        print(f"✓ Get stats passed (diagrams: {data['total_diagrams']})")
    
    def test_get_tags(self):
        """GET /api/tags returns tag list"""
        response = requests.get(f"{BASE_URL}/api/tags")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get tags passed ({len(data)} tags)")


class TestToolsNotFound:
    """Test 404 responses for tools endpoints"""
    
    def test_validate_not_found(self):
        """POST /api/diagrams/{id}/validate returns 404 for non-existent"""
        response = requests.post(f"{BASE_URL}/api/diagrams/non-existent/validate")
        assert response.status_code == 404
        print("✓ Validate 404 passed")
    
    def test_simulate_not_found(self):
        """POST /api/diagrams/{id}/simulate returns 404 for non-existent"""
        response = requests.post(f"{BASE_URL}/api/diagrams/non-existent/simulate")
        assert response.status_code == 404
        print("✓ Simulate 404 passed")
    
    def test_uml_not_found(self):
        """POST /api/diagrams/{id}/generate-uml returns 404 for non-existent"""
        response = requests.post(f"{BASE_URL}/api/diagrams/non-existent/generate-uml")
        assert response.status_code == 404
        print("✓ UML 404 passed")
    
    def test_docs_not_found(self):
        """POST /api/diagrams/{id}/generate-docs returns 404 for non-existent"""
        response = requests.post(f"{BASE_URL}/api/diagrams/non-existent/generate-docs")
        assert response.status_code == 404
        print("✓ Docs 404 passed")
    
    def test_analytics_not_found(self):
        """POST /api/diagrams/{id}/analytics returns 404 for non-existent"""
        response = requests.post(f"{BASE_URL}/api/diagrams/non-existent/analytics")
        assert response.status_code == 404
        print("✓ Analytics 404 passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
