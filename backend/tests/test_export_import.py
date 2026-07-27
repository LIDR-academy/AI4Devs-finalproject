# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Export/Import API Tests
Tests for: Project export (GET /api/projects/{id}/export) and import (POST /api/projects/import)
New feature: Export/Import complete projects with diagrams, versions, branches
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test project ID from the review request - LTI project with 3 diagrams
TEST_PROJECT_LTI = "5ad98a45-a536-4fd8-a9e0-051f40d26ce4"


@pytest.fixture
def auth_headers():
    """Get auth headers with dev token"""
    response = requests.post(f"{BASE_URL}/api/auth/dev-login")
    assert response.status_code == 200, f"Dev login failed: {response.text}"
    token = response.json()["session_token"]
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


class TestProjectExport:
    """Test GET /api/projects/{id}/export - export project with all data"""
    
    def test_export_project_returns_correct_format(self, auth_headers):
        """Test export returns JSON with format='bpmn-modeler-export'"""
        response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_LTI}/export", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["format"] == "bpmn-modeler-export"
        assert data["version"] == "1.0"
        assert "exported_at" in data
        print(f"✓ Export format: {data['format']}, version: {data['version']}")
    
    def test_export_project_includes_project_data(self, auth_headers):
        """Test export includes project name and metadata"""
        response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_LTI}/export", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        project = data["project"]
        assert project["id"] == TEST_PROJECT_LTI
        assert "name" in project
        assert "description" in project
        assert "color" in project
        assert "icon" in project
        assert "tags" in project
        assert "diagram_ids" in project
        print(f"✓ Project data: {project['name']} with {len(project['diagram_ids'])} diagram IDs")
    
    def test_export_project_includes_diagrams_with_xml(self, auth_headers):
        """Test export includes diagrams array with current_xml"""
        response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_LTI}/export", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        diagrams = data["diagrams"]
        assert isinstance(diagrams, list)
        assert len(diagrams) > 0, "LTI project should have diagrams"
        
        # Verify diagram structure
        for diagram in diagrams:
            assert "id" in diagram
            assert "name" in diagram
            assert "current_xml" in diagram, "Export must include current_xml"
            assert "current_version" in diagram
            assert "tags" in diagram
        
        print(f"✓ Exported {len(diagrams)} diagrams with XML content")
    
    def test_export_project_includes_versions(self, auth_headers):
        """Test export includes versions array"""
        response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_LTI}/export", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        versions = data["versions"]
        assert isinstance(versions, list)
        print(f"✓ Exported {len(versions)} versions")
    
    def test_export_project_includes_branches(self, auth_headers):
        """Test export includes branches array"""
        response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_LTI}/export", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        branches = data["branches"]
        assert isinstance(branches, list)
        print(f"✓ Exported {len(branches)} branches")
    
    def test_export_nonexistent_project_returns_404(self, auth_headers):
        """Test export of non-existent project returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/projects/{fake_id}/export", headers=auth_headers)
        assert response.status_code == 404
        print("✓ Non-existent project export returns 404")


class TestProjectImport:
    """Test POST /api/projects/import - import project from exported JSON"""
    
    def test_import_project_creates_new_project(self, auth_headers):
        """Test import creates new project with '(importado)' suffix"""
        # First export the LTI project
        export_response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_LTI}/export", headers=auth_headers)
        assert export_response.status_code == 200
        export_data = export_response.json()
        
        # Import it
        import_response = requests.post(
            f"{BASE_URL}/api/projects/import",
            headers=auth_headers,
            json=export_data
        )
        assert import_response.status_code == 200
        
        import_result = import_response.json()
        assert "project_id" in import_result
        assert "project_name" in import_result
        assert "(importado)" in import_result["project_name"]
        assert import_result["imported_diagrams"] > 0
        
        print(f"✓ Imported project: {import_result['project_name']}")
        print(f"  - Diagrams: {import_result['imported_diagrams']}")
        print(f"  - Versions: {import_result['imported_versions']}")
        
        # Cleanup - delete the imported project
        delete_response = requests.delete(
            f"{BASE_URL}/api/projects/{import_result['project_id']}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        print("✓ Cleaned up imported test project")
    
    def test_import_project_creates_new_ids(self, auth_headers):
        """Test import creates new IDs for project and diagrams"""
        # Export
        export_response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_LTI}/export", headers=auth_headers)
        export_data = export_response.json()
        original_project_id = export_data["project"]["id"]
        original_diagram_ids = [d["id"] for d in export_data["diagrams"]]
        
        # Import
        import_response = requests.post(
            f"{BASE_URL}/api/projects/import",
            headers=auth_headers,
            json=export_data
        )
        import_result = import_response.json()
        new_project_id = import_result["project_id"]
        
        # Verify new project ID is different
        assert new_project_id != original_project_id
        
        # Get the new project and verify diagram IDs are different
        get_response = requests.get(f"{BASE_URL}/api/projects/{new_project_id}", headers=auth_headers)
        new_project = get_response.json()
        new_diagram_ids = new_project["diagram_ids"]
        
        for new_id in new_diagram_ids:
            assert new_id not in original_diagram_ids, "Imported diagrams should have new IDs"
        
        print(f"✓ New project ID: {new_project_id} (original: {original_project_id})")
        print(f"✓ All {len(new_diagram_ids)} diagrams have new IDs")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{new_project_id}", headers=auth_headers)
    
    def test_import_invalid_format_returns_400(self, auth_headers):
        """Test import with invalid format returns 400"""
        invalid_data = {
            "format": "invalid-format",
            "project": {"name": "Test"}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/projects/import",
            headers=auth_headers,
            json=invalid_data
        )
        assert response.status_code == 400
        assert "Formato de archivo no valido" in response.json()["detail"]
        print("✓ Invalid format returns 400 with correct error message")
    
    def test_import_missing_format_returns_400(self, auth_headers):
        """Test import without format field returns 400"""
        invalid_data = {
            "project": {"name": "Test"}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/projects/import",
            headers=auth_headers,
            json=invalid_data
        )
        assert response.status_code == 400
        print("✓ Missing format returns 400")
    
    def test_import_requires_authentication(self):
        """Test import without auth returns 401"""
        export_data = {
            "format": "bpmn-modeler-export",
            "project": {"name": "Test"}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/projects/import",
            headers={"Content-Type": "application/json"},
            json=export_data
        )
        assert response.status_code == 401
        print("✓ Import without auth returns 401")
    
    def test_import_preserves_diagram_content(self, auth_headers):
        """Test imported diagrams have the same XML content"""
        # Export
        export_response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_LTI}/export", headers=auth_headers)
        export_data = export_response.json()
        original_diagrams = {d["name"]: d["current_xml"] for d in export_data["diagrams"]}
        
        # Import
        import_response = requests.post(
            f"{BASE_URL}/api/projects/import",
            headers=auth_headers,
            json=export_data
        )
        import_result = import_response.json()
        new_project_id = import_result["project_id"]
        
        # Get imported diagrams
        get_response = requests.get(f"{BASE_URL}/api/projects/{new_project_id}", headers=auth_headers)
        new_project = get_response.json()
        
        # Fetch each diagram to check XML
        for diagram_id in new_project["diagram_ids"]:
            diag_response = requests.get(f"{BASE_URL}/api/diagrams/{diagram_id}", headers=auth_headers)
            if diag_response.status_code == 200:
                diag_data = diag_response.json()
                diag_name = diag_data["name"]
                if diag_name in original_diagrams:
                    assert diag_data["current_xml"] == original_diagrams[diag_name], f"XML mismatch for {diag_name}"
        
        print(f"✓ Diagram XML content preserved for {len(new_project['diagram_ids'])} diagrams")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{new_project_id}", headers=auth_headers)


class TestExportImportRoundTrip:
    """Test full export -> import -> verify cycle"""
    
    def test_full_roundtrip(self, auth_headers):
        """Test complete export and import cycle"""
        # Step 1: Export
        export_response = requests.get(f"{BASE_URL}/api/projects/{TEST_PROJECT_LTI}/export", headers=auth_headers)
        assert export_response.status_code == 200
        export_data = export_response.json()
        
        original_name = export_data["project"]["name"]
        original_diagram_count = len(export_data["diagrams"])
        original_version_count = len(export_data["versions"])
        
        print(f"✓ Exported: {original_name}")
        print(f"  - {original_diagram_count} diagrams")
        print(f"  - {original_version_count} versions")
        
        # Step 2: Import
        import_response = requests.post(
            f"{BASE_URL}/api/projects/import",
            headers=auth_headers,
            json=export_data
        )
        assert import_response.status_code == 200
        import_result = import_response.json()
        
        assert import_result["imported_diagrams"] == original_diagram_count
        print(f"✓ Imported: {import_result['project_name']}")
        print(f"  - {import_result['imported_diagrams']} diagrams")
        print(f"  - {import_result['imported_versions']} versions")
        
        # Step 3: Verify imported project
        get_response = requests.get(f"{BASE_URL}/api/projects/{import_result['project_id']}", headers=auth_headers)
        assert get_response.status_code == 200
        imported_project = get_response.json()
        
        assert len(imported_project["diagram_ids"]) == original_diagram_count
        assert imported_project["diagram_count"] == original_diagram_count
        print(f"✓ Verified imported project has {imported_project['diagram_count']} diagrams")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{import_result['project_id']}", headers=auth_headers)
        print("✓ Cleaned up imported project")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
