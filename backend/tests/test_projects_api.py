# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Projects API Tests
Tests for: Projects CRUD, Add/Remove diagrams from projects
New feature: Projects system for grouping BPMN diagrams
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test project IDs from the review request
TEST_PROJECT_VENTAS = "34cdbb9e-656c-4bc6-a403-45cc2b81721f"  # Sistema de Ventas (has 2 diagrams)
TEST_PROJECT_RRHH = "40014cba-271f-4757-ab79-2ab3bb673484"  # Gestion de RRHH
TEST_PROJECT_DEVOPS = "dda651a1-8c60-4245-89c3-5bd1978196ac"  # DevOps Pipeline

# Test diagram IDs
TEST_DIAGRAM_1 = "d261a9af-8cfc-44fc-8aa8-417b0e00c60d"
TEST_DIAGRAM_2 = "5dc38ab6-9ab7-4907-9f95-4a98e88e5dc0"


@pytest.fixture
def auth_headers():
    """Get auth headers with dev token"""
    response = requests.post(f"{BASE_URL}/api/auth/dev-login")
    assert response.status_code == 200, f"Dev login failed: {response.text}"
    token = response.json()["session_token"]
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


class TestProjectsList:
    """Test GET /api/projects - list all projects"""
    
    def test_list_projects(self, auth_headers):
        """Test GET /api/projects returns list of projects"""
        response = requests.get(f"{BASE_URL}/api/projects", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ List projects returned {len(data)} projects")
        
        # Verify project structure
        if len(data) > 0:
            project = data[0]
            assert "id" in project
            assert "name" in project
            assert "color" in project
            assert "icon" in project
            assert "diagram_count" in project
            print(f"✓ Project structure verified: {project['name']}")
    
    def test_list_projects_with_search(self, auth_headers):
        """Test GET /api/projects with search parameter"""
        response = requests.get(f"{BASE_URL}/api/projects?search=Ventas", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should find "Sistema de Ventas" project
        print(f"✓ Search returned {len(data)} projects matching 'Ventas'")
    
    def test_list_projects_with_tag(self, auth_headers):
        """Test GET /api/projects with tag filter"""
        response = requests.get(f"{BASE_URL}/api/projects?tag=test", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Tag filter returned {len(data)} projects")


class TestProjectCreate:
    """Test POST /api/projects - create project"""
    
    def test_create_project_basic(self, auth_headers):
        """Test creating a project with basic fields"""
        payload = {
            "name": f"TEST_Project_{uuid.uuid4().hex[:8]}",
            "description": "Test project for API testing",
            "color": "#2563EB",
            "icon": "rocket",
            "tags": ["test", "automated"]
        }
        
        response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=payload)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        assert data["description"] == payload["description"]
        assert data["color"] == payload["color"]
        assert data["icon"] == payload["icon"]
        assert data["tags"] == payload["tags"]
        assert data["diagram_count"] == 0
        
        print(f"✓ Created project: {data['id']}")
        
        # Cleanup
        delete_response = requests.delete(f"{BASE_URL}/api/projects/{data['id']}", headers=auth_headers)
        assert delete_response.status_code == 200
        print("✓ Cleaned up test project")
    
    def test_create_project_minimal(self, auth_headers):
        """Test creating a project with only required fields"""
        payload = {
            "name": f"TEST_Minimal_{uuid.uuid4().hex[:8]}"
        }
        
        response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == payload["name"]
        # Should have default values
        assert data["color"] == "#7C3AED"  # Default color
        assert data["icon"] == "folder"  # Default icon
        
        print(f"✓ Created minimal project with defaults")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{data['id']}", headers=auth_headers)
    
    def test_create_project_all_colors(self, auth_headers):
        """Test creating projects with all available colors"""
        colors = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#DB2777", "#4F46E5", "#0891B2"]
        
        for color in colors:
            payload = {
                "name": f"TEST_Color_{color.replace('#', '')}",
                "color": color
            }
            response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["color"] == color
            # Cleanup
            requests.delete(f"{BASE_URL}/api/projects/{data['id']}", headers=auth_headers)
        
        print(f"✓ All {len(colors)} colors work correctly")
    
    def test_create_project_all_icons(self, auth_headers):
        """Test creating projects with all available icons"""
        icons = ["folder", "briefcase", "building", "rocket", "zap", "target", "globe", "layers"]
        
        for icon in icons:
            payload = {
                "name": f"TEST_Icon_{icon}",
                "icon": icon
            }
            response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["icon"] == icon
            # Cleanup
            requests.delete(f"{BASE_URL}/api/projects/{data['id']}", headers=auth_headers)
        
        print(f"✓ All {len(icons)} icons work correctly")


class TestProjectDetail:
    """Test GET /api/projects/{id} - get project detail"""
    
    def test_get_project_detail(self, auth_headers):
        """Test getting project detail with diagrams populated"""
        response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_VENTAS}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == TEST_PROJECT_VENTAS
        assert "name" in data
        assert "diagrams" in data
        assert "diagram_count" in data
        assert isinstance(data["diagrams"], list)
        
        print(f"✓ Project detail: {data['name']} with {data['diagram_count']} diagrams")
        
        # Verify diagram structure if any exist
        if len(data["diagrams"]) > 0:
            diagram = data["diagrams"][0]
            assert "id" in diagram
            assert "name" in diagram
            # current_xml should be excluded for performance
            assert "current_xml" not in diagram
            print(f"✓ Diagram structure verified (XML excluded)")
    
    def test_get_nonexistent_project(self, auth_headers):
        """Test getting non-existent project returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/projects/{fake_id}", headers=auth_headers)
        assert response.status_code == 404
        print("✓ Non-existent project returns 404")


class TestProjectUpdate:
    """Test PUT /api/projects/{id} - update project"""
    
    def test_update_project_name(self, auth_headers):
        """Test updating project name"""
        # Create a project first
        create_payload = {"name": f"TEST_Update_{uuid.uuid4().hex[:8]}"}
        create_response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=create_payload)
        project_id = create_response.json()["id"]
        
        # Update name
        update_payload = {"name": "TEST_Updated_Name"}
        update_response = requests.put(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers, json=update_payload)
        assert update_response.status_code == 200
        
        data = update_response.json()
        assert data["name"] == "TEST_Updated_Name"
        
        # Verify with GET
        get_response = requests.get(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
        assert get_response.json()["name"] == "TEST_Updated_Name"
        
        print(f"✓ Updated project name and verified persistence")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
    
    def test_update_project_all_fields(self, auth_headers):
        """Test updating all project fields"""
        # Create a project
        create_payload = {"name": f"TEST_FullUpdate_{uuid.uuid4().hex[:8]}"}
        create_response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=create_payload)
        project_id = create_response.json()["id"]
        
        # Update all fields
        update_payload = {
            "name": "TEST_Fully_Updated",
            "description": "Updated description",
            "color": "#DC2626",
            "icon": "zap",
            "tags": ["updated", "test"]
        }
        update_response = requests.put(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers, json=update_payload)
        assert update_response.status_code == 200
        
        data = update_response.json()
        assert data["name"] == update_payload["name"]
        assert data["description"] == update_payload["description"]
        assert data["color"] == update_payload["color"]
        assert data["icon"] == update_payload["icon"]
        assert data["tags"] == update_payload["tags"]
        
        print(f"✓ Updated all project fields")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
    
    def test_update_nonexistent_project(self, auth_headers):
        """Test updating non-existent project returns 404"""
        fake_id = str(uuid.uuid4())
        update_payload = {"name": "Should Fail"}
        response = requests.put(f"{BASE_URL}/api/projects/{fake_id}", headers=auth_headers, json=update_payload)
        assert response.status_code == 404
        print("✓ Update non-existent project returns 404")


class TestProjectDelete:
    """Test DELETE /api/projects/{id} - delete project"""
    
    def test_delete_project(self, auth_headers):
        """Test deleting a project"""
        # Create a project
        create_payload = {"name": f"TEST_Delete_{uuid.uuid4().hex[:8]}"}
        create_response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=create_payload)
        project_id = create_response.json()["id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
        assert get_response.status_code == 404
        
        print(f"✓ Deleted project and verified removal")
    
    def test_delete_nonexistent_project(self, auth_headers):
        """Test deleting non-existent project returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/projects/{fake_id}", headers=auth_headers)
        assert response.status_code == 404
        print("✓ Delete non-existent project returns 404")


class TestProjectDiagrams:
    """Test adding/removing diagrams from projects"""
    
    def test_add_diagram_to_project(self, auth_headers):
        """Test POST /api/projects/{id}/diagrams/{diagram_id}"""
        # Create a project
        create_payload = {"name": f"TEST_AddDiagram_{uuid.uuid4().hex[:8]}"}
        create_response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=create_payload)
        project_id = create_response.json()["id"]
        
        # Add diagram to project
        add_response = requests.post(
            f"{BASE_URL}/api/projects/{project_id}/diagrams/{TEST_DIAGRAM_2}",
            headers=auth_headers
        )
        assert add_response.status_code == 200
        
        # Verify diagram is in project
        get_response = requests.get(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
        project_data = get_response.json()
        assert TEST_DIAGRAM_2 in project_data["diagram_ids"]
        assert project_data["diagram_count"] == 1
        
        print(f"✓ Added diagram to project and verified")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
    
    def test_add_diagram_twice_is_idempotent(self, auth_headers):
        """Test adding same diagram twice doesn't duplicate"""
        # Create a project
        create_payload = {"name": f"TEST_Idempotent_{uuid.uuid4().hex[:8]}"}
        create_response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=create_payload)
        project_id = create_response.json()["id"]
        
        # Add diagram twice
        requests.post(f"{BASE_URL}/api/projects/{project_id}/diagrams/{TEST_DIAGRAM_2}", headers=auth_headers)
        requests.post(f"{BASE_URL}/api/projects/{project_id}/diagrams/{TEST_DIAGRAM_2}", headers=auth_headers)
        
        # Verify only one entry
        get_response = requests.get(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
        project_data = get_response.json()
        assert project_data["diagram_ids"].count(TEST_DIAGRAM_2) == 1
        
        print(f"✓ Adding diagram twice is idempotent")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
    
    def test_add_nonexistent_diagram_fails(self, auth_headers):
        """Test adding non-existent diagram returns 404"""
        # Create a project
        create_payload = {"name": f"TEST_BadDiagram_{uuid.uuid4().hex[:8]}"}
        create_response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=create_payload)
        project_id = create_response.json()["id"]
        
        # Try to add non-existent diagram
        fake_diagram_id = str(uuid.uuid4())
        add_response = requests.post(
            f"{BASE_URL}/api/projects/{project_id}/diagrams/{fake_diagram_id}",
            headers=auth_headers
        )
        assert add_response.status_code == 404
        
        print(f"✓ Adding non-existent diagram returns 404")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
    
    def test_remove_diagram_from_project(self, auth_headers):
        """Test DELETE /api/projects/{id}/diagrams/{diagram_id}"""
        # Create a project and add a diagram
        create_payload = {"name": f"TEST_RemoveDiagram_{uuid.uuid4().hex[:8]}"}
        create_response = requests.post(f"{BASE_URL}/api/projects", headers=auth_headers, json=create_payload)
        project_id = create_response.json()["id"]
        
        requests.post(f"{BASE_URL}/api/projects/{project_id}/diagrams/{TEST_DIAGRAM_2}", headers=auth_headers)
        
        # Remove diagram
        remove_response = requests.delete(
            f"{BASE_URL}/api/projects/{project_id}/diagrams/{TEST_DIAGRAM_2}",
            headers=auth_headers
        )
        assert remove_response.status_code == 200
        
        # Verify diagram is removed
        get_response = requests.get(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
        project_data = get_response.json()
        assert TEST_DIAGRAM_2 not in project_data["diagram_ids"]
        assert project_data["diagram_count"] == 0
        
        print(f"✓ Removed diagram from project and verified")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{project_id}", headers=auth_headers)
    
    def test_diagram_in_multiple_projects(self, auth_headers):
        """Test that a diagram can be in multiple projects"""
        # Create two projects
        project1_response = requests.post(
            f"{BASE_URL}/api/projects",
            headers=auth_headers,
            json={"name": f"TEST_Multi1_{uuid.uuid4().hex[:8]}"}
        )
        project1_id = project1_response.json()["id"]
        
        project2_response = requests.post(
            f"{BASE_URL}/api/projects",
            headers=auth_headers,
            json={"name": f"TEST_Multi2_{uuid.uuid4().hex[:8]}"}
        )
        project2_id = project2_response.json()["id"]
        
        # Add same diagram to both projects
        requests.post(f"{BASE_URL}/api/projects/{project1_id}/diagrams/{TEST_DIAGRAM_2}", headers=auth_headers)
        requests.post(f"{BASE_URL}/api/projects/{project2_id}/diagrams/{TEST_DIAGRAM_2}", headers=auth_headers)
        
        # Verify diagram is in both
        get1 = requests.get(f"{BASE_URL}/api/projects/{project1_id}", headers=auth_headers)
        get2 = requests.get(f"{BASE_URL}/api/projects/{project2_id}", headers=auth_headers)
        
        assert TEST_DIAGRAM_2 in get1.json()["diagram_ids"]
        assert TEST_DIAGRAM_2 in get2.json()["diagram_ids"]
        
        print(f"✓ Diagram can be in multiple projects")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{project1_id}", headers=auth_headers)
        requests.delete(f"{BASE_URL}/api/projects/{project2_id}", headers=auth_headers)


class TestStatsIncludesProjects:
    """Test that stats endpoint includes total_projects"""
    
    def test_stats_has_total_projects(self, auth_headers):
        """Test GET /api/stats includes total_projects"""
        response = requests.get(f"{BASE_URL}/api/stats", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_projects" in data
        assert isinstance(data["total_projects"], int)
        
        print(f"✓ Stats includes total_projects: {data['total_projects']}")


class TestExistingProjects:
    """Test the pre-seeded projects from the review request"""
    
    def test_sistema_ventas_project_exists(self, auth_headers):
        """Test Sistema de Ventas project exists and has diagrams"""
        response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_VENTAS}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "Sistema" in data["name"] or "Ventas" in data["name"]
        print(f"✓ Sistema de Ventas project exists: {data['name']} with {data['diagram_count']} diagrams")
    
    def test_gestion_rrhh_project_exists(self, auth_headers):
        """Test Gestion de RRHH project exists"""
        response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_RRHH}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        print(f"✓ Gestion de RRHH project exists: {data['name']}")
    
    def test_devops_pipeline_project_exists(self, auth_headers):
        """Test DevOps Pipeline project exists"""
        response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_DEVOPS}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        print(f"✓ DevOps Pipeline project exists: {data['name']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
