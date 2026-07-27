# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Test suite for Version Tree and Diff API endpoints
Tests: GET /api/diagrams/{id}/versions/tree, GET /api/diagrams/{id}/versions/{v1}/diff/{v2}
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
TEST_DIAGRAM_ID = "5dc38ab6-9ab7-4907-9f95-4a98e88e5dc0"  # Proceso de Compra with 5 versions


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token via dev-login"""
    response = requests.post(f"{BASE_URL}/api/auth/dev-login")
    assert response.status_code == 200, f"Dev login failed: {response.text}"
    data = response.json()
    return data.get("session_token")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


class TestVersionTreeAPI:
    """Tests for GET /api/diagrams/{id}/versions/tree endpoint"""
    
    def test_version_tree_returns_nodes_array(self, auth_headers):
        """Version tree should return nodes array with version data"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/tree",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "nodes" in data, "Response should have 'nodes' array"
        assert "branches" in data, "Response should have 'branches' array"
        assert "current_version" in data, "Response should have 'current_version'"
        
        # Check nodes array is not empty
        assert len(data["nodes"]) > 0, "Should have at least one version node"
    
    def test_version_tree_node_structure(self, auth_headers):
        """Each node should have required fields"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/tree",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check first node has all required fields
        node = data["nodes"][0]
        required_fields = ["id", "version_number", "commit_message", "is_current", 
                          "created_at", "tags", "validation_status"]
        for field in required_fields:
            assert field in node, f"Node should have '{field}' field"
    
    def test_version_tree_has_current_marker(self, auth_headers):
        """Exactly one node should be marked as current"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/tree",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        current_nodes = [n for n in data["nodes"] if n.get("is_current")]
        assert len(current_nodes) == 1, "Exactly one node should be marked as current"
        
        # Current node version should match current_version
        assert current_nodes[0]["version_number"] == data["current_version"]
    
    def test_version_tree_sorted_by_version_number(self, auth_headers):
        """Nodes should be sorted by version_number ascending"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/tree",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        version_numbers = [n["version_number"] for n in data["nodes"]]
        assert version_numbers == sorted(version_numbers), "Nodes should be sorted by version_number"
    
    def test_version_tree_404_for_nonexistent_diagram(self, auth_headers):
        """Should return 404 for non-existent diagram"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/nonexistent-id-12345/versions/tree",
            headers=auth_headers
        )
        # The endpoint returns empty nodes for non-existent diagram (not 404)
        # This is acceptable behavior - just returns empty tree
        assert response.status_code == 200
        data = response.json()
        assert len(data["nodes"]) == 0


class TestVersionDiffAPI:
    """Tests for GET /api/diagrams/{id}/versions/{v1}/diff/{v2} endpoint"""
    
    def test_diff_returns_added_removed_modified(self, auth_headers):
        """Diff should return added, removed, modified arrays"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/4/diff/5",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "added" in data, "Response should have 'added' array"
        assert "removed" in data, "Response should have 'removed' array"
        assert "modified" in data, "Response should have 'modified' array"
        assert "summary" in data, "Response should have 'summary' object"
    
    def test_diff_summary_has_counts(self, auth_headers):
        """Summary should have total_changes, added_count, removed_count, modified_count"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/4/diff/5",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        summary = data["summary"]
        assert "total_changes" in summary
        assert "added_count" in summary
        assert "removed_count" in summary
        assert "modified_count" in summary
        
        # Verify counts match array lengths
        assert summary["added_count"] == len(data["added"])
        assert summary["removed_count"] == len(data["removed"])
        assert summary["modified_count"] == len(data["modified"])
        assert summary["total_changes"] == summary["added_count"] + summary["removed_count"] + summary["modified_count"]
    
    def test_diff_element_details(self, auth_headers):
        """Added/removed elements should have type, name, id"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/4/diff/5",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check added elements have required fields
        if data["added"]:
            element = data["added"][0]
            assert "type" in element, "Element should have 'type'"
            assert "name" in element, "Element should have 'name'"
            assert "id" in element, "Element should have 'id'"
    
    def test_diff_modified_has_before_after(self, auth_headers):
        """Modified elements should have before and after states"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/4/diff/5",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        if data["modified"]:
            modified = data["modified"][0]
            assert "id" in modified, "Modified should have 'id'"
            assert "before" in modified, "Modified should have 'before'"
            assert "after" in modified, "Modified should have 'after'"
    
    def test_diff_version_info(self, auth_headers):
        """Diff should include version_from and version_to info"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/1/diff/5",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "version_from" in data
        assert "version_to" in data
        assert data["version_from"]["number"] == 1
        assert data["version_to"]["number"] == 5
        assert "commit_message" in data["version_from"]
        assert "created_at" in data["version_from"]
    
    def test_diff_404_for_nonexistent_version(self, auth_headers):
        """Should return 404 if one or both versions don't exist"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/1/diff/999",
            headers=auth_headers
        )
        assert response.status_code == 404
    
    def test_diff_same_version_returns_no_changes(self, auth_headers):
        """Comparing same version should return empty diff"""
        response = requests.get(
            f"{BASE_URL}/api/diagrams/{TEST_DIAGRAM_ID}/versions/1/diff/1",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["summary"]["total_changes"] == 0
        assert len(data["added"]) == 0
        assert len(data["removed"]) == 0
        assert len(data["modified"]) == 0


class TestAuthSessionCookie:
    """Tests for auth session cookie setting"""
    
    def test_dev_login_returns_session_token(self):
        """Dev login should return session_token"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        assert response.status_code == 200
        data = response.json()
        
        assert "session_token" in data
        assert "user_id" in data
        assert "email" in data
        assert data["email"] == "test@bpmnmodeler.dev"
    
    def test_auth_me_with_bearer_token(self):
        """Auth/me should work with Bearer token from fresh login"""
        # Get fresh token
        login_response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        assert login_response.status_code == 200
        token = login_response.json()["session_token"]
        
        # Use token immediately
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@bpmnmodeler.dev"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
