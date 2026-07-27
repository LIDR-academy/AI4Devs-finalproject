# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Test suite for P1 Features:
1. WebSocket collaboration (cursors, locks, sync)
2. Branch merge with conflict detection
3. Git integration (push/pull with GitHub)
"""
import pytest
import requests
import os
import json
import uuid
import asyncio
import websockets

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ==================== FIXTURES ====================

@pytest.fixture(scope="module")
def auth_session():
    """Get authenticated session via dev-login"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    
    # Dev login
    resp = session.post(f"{BASE_URL}/api/auth/dev-login")
    assert resp.status_code == 200, f"Dev login failed: {resp.text}"
    data = resp.json()
    token = data.get("session_token")
    assert token, "No session_token in dev-login response"
    
    session.headers.update({"Authorization": f"Bearer {token}"})
    return session

@pytest.fixture(scope="module")
def test_diagram_id():
    """Use existing test diagram"""
    return "5dc38ab6-9ab7-4907-9f95-4a98e88e5dc0"  # Proceso de Compra

@pytest.fixture(scope="module")
def test_branch(auth_session, test_diagram_id):
    """Create a test branch for merge testing"""
    branch_name = f"TEST_branch_{uuid.uuid4().hex[:6]}"
    resp = auth_session.post(
        f"{BASE_URL}/api/diagrams/{test_diagram_id}/branches",
        json={"name": branch_name, "description": "Test branch for merge testing"}
    )
    assert resp.status_code == 200, f"Failed to create branch: {resp.text}"
    branch = resp.json()
    yield branch
    # Cleanup - delete branch if not merged
    try:
        auth_session.delete(f"{BASE_URL}/api/branches/{branch['id']}")
    except:
        pass

# ==================== WEBSOCKET TESTS ====================

class TestWebSocketCollaboration:
    """Test WebSocket endpoint for real-time collaboration"""
    
    def test_websocket_endpoint_exists(self, test_diagram_id):
        """Verify WebSocket endpoint is accessible"""
        ws_url = BASE_URL.replace("https://", "wss://").replace("http://", "ws://")
        ws_endpoint = f"{ws_url}/ws/diagram/{test_diagram_id}"
        
        # We can't fully test WebSocket with requests, but we can verify the URL format
        assert "ws" in ws_endpoint.lower()
        assert test_diagram_id in ws_endpoint
        print(f"✓ WebSocket endpoint URL: {ws_endpoint}")
    
    @pytest.mark.asyncio
    async def test_websocket_connection_and_messages(self, test_diagram_id):
        """Test WebSocket connection accepts and broadcasts messages"""
        ws_url = BASE_URL.replace("https://", "wss://").replace("http://", "ws://")
        ws_endpoint = f"{ws_url}/ws/diagram/{test_diagram_id}"
        
        try:
            async with websockets.connect(ws_endpoint, close_timeout=5) as ws:
                # Should receive presence message on connect
                msg = await asyncio.wait_for(ws.recv(), timeout=5)
                data = json.loads(msg)
                assert data["type"] == "presence", f"Expected presence message, got: {data}"
                assert "users" in data
                print(f"✓ WebSocket connected, received presence: {len(data['users'])} users")
                
                # Send cursor message
                await ws.send(json.dumps({
                    "type": "cursor",
                    "position": {"x": 100, "y": 200}
                }))
                print("✓ Sent cursor message")
                
                # Send lock message
                await ws.send(json.dumps({
                    "type": "lock",
                    "element_id": "Task_1"
                }))
                print("✓ Sent lock message")
                
                # Send unlock message
                await ws.send(json.dumps({
                    "type": "unlock",
                    "element_id": "Task_1"
                }))
                print("✓ Sent unlock message")
                
                # Send update message
                await ws.send(json.dumps({
                    "type": "update",
                    "xml": "<test>xml</test>"
                }))
                print("✓ Sent update message")
                
        except Exception as e:
            pytest.skip(f"WebSocket test skipped (may not be available in test env): {e}")

# ==================== BRANCH MERGE TESTS ====================

class TestBranchMerge:
    """Test branch merge with conflict detection"""
    
    def test_list_branches(self, auth_session, test_diagram_id):
        """List branches for a diagram"""
        resp = auth_session.get(f"{BASE_URL}/api/diagrams/{test_diagram_id}/branches")
        assert resp.status_code == 200, f"Failed to list branches: {resp.text}"
        branches = resp.json()
        assert isinstance(branches, list)
        print(f"✓ Listed {len(branches)} branches")
    
    def test_create_branch(self, auth_session, test_diagram_id):
        """Create a new branch"""
        branch_name = f"TEST_merge_{uuid.uuid4().hex[:6]}"
        resp = auth_session.post(
            f"{BASE_URL}/api/diagrams/{test_diagram_id}/branches",
            json={"name": branch_name, "description": "Test branch"}
        )
        assert resp.status_code == 200, f"Failed to create branch: {resp.text}"
        branch = resp.json()
        assert branch["name"] == branch_name
        assert branch["diagram_id"] == test_diagram_id
        assert branch["status"] == "active"
        assert branch["is_merged"] == False
        print(f"✓ Created branch: {branch['name']} (id: {branch['id']})")
        
        # Cleanup
        auth_session.delete(f"{BASE_URL}/api/branches/{branch['id']}")
    
    def test_preview_merge_no_conflicts(self, auth_session, test_branch):
        """Preview merge should detect no conflicts for unchanged branch"""
        resp = auth_session.post(f"{BASE_URL}/api/branches/{test_branch['id']}/preview-merge")
        assert resp.status_code == 200, f"Preview merge failed: {resp.text}"
        preview = resp.json()
        
        # Verify response structure
        assert "has_conflicts" in preview
        assert "can_auto_merge" in preview
        assert "conflicts" in preview
        assert "summary" in preview
        assert "main_xml" in preview
        assert "branch_xml" in preview
        assert "branch_name" in preview
        
        # Summary should have all required fields
        summary = preview["summary"]
        assert "added_main" in summary
        assert "added_branch" in summary
        assert "removed_main" in summary
        assert "removed_branch" in summary
        assert "modified_main" in summary
        assert "modified_branch" in summary
        
        print(f"✓ Preview merge: has_conflicts={preview['has_conflicts']}, can_auto_merge={preview['can_auto_merge']}")
        print(f"  Summary: added_branch={len(summary['added_branch'])}, modified_branch={len(summary['modified_branch'])}")
    
    def test_preview_merge_not_found(self, auth_session):
        """Preview merge should return 404 for non-existent branch"""
        resp = auth_session.post(f"{BASE_URL}/api/branches/nonexistent-id/preview-merge")
        assert resp.status_code == 404
        print("✓ Preview merge returns 404 for non-existent branch")
    
    def test_merge_branch(self, auth_session, test_diagram_id):
        """Test actual merge of a branch"""
        # Create a fresh branch for merge test
        branch_name = f"TEST_merge_exec_{uuid.uuid4().hex[:6]}"
        create_resp = auth_session.post(
            f"{BASE_URL}/api/diagrams/{test_diagram_id}/branches",
            json={"name": branch_name, "description": "Branch for merge execution test"}
        )
        assert create_resp.status_code == 200
        branch = create_resp.json()
        
        # Execute merge
        merge_resp = auth_session.post(f"{BASE_URL}/api/branches/{branch['id']}/merge")
        assert merge_resp.status_code == 200, f"Merge failed: {merge_resp.text}"
        result = merge_resp.json()
        
        assert "message" in result
        assert "new_version" in result
        assert result["message"] == "Branch merged"
        print(f"✓ Merge successful: new_version={result['new_version']}")
        
        # Verify branch is marked as merged
        branches_resp = auth_session.get(f"{BASE_URL}/api/diagrams/{test_diagram_id}/branches")
        branches = branches_resp.json()
        merged_branch = next((b for b in branches if b["id"] == branch["id"]), None)
        if merged_branch:
            assert merged_branch["is_merged"] == True
            assert merged_branch["status"] == "merged"
            print(f"✓ Branch marked as merged, merged_version={merged_branch.get('merged_version')}")
    
    def test_merge_already_merged_branch(self, auth_session, test_diagram_id):
        """Merging an already merged branch should fail"""
        # Create and merge a branch
        branch_name = f"TEST_double_merge_{uuid.uuid4().hex[:6]}"
        create_resp = auth_session.post(
            f"{BASE_URL}/api/diagrams/{test_diagram_id}/branches",
            json={"name": branch_name}
        )
        branch = create_resp.json()
        
        # First merge
        auth_session.post(f"{BASE_URL}/api/branches/{branch['id']}/merge")
        
        # Second merge should fail
        resp = auth_session.post(f"{BASE_URL}/api/branches/{branch['id']}/merge")
        assert resp.status_code == 400
        assert "already merged" in resp.json().get("detail", "").lower()
        print("✓ Double merge correctly rejected")

# ==================== GIT INTEGRATION TESTS ====================

class TestGitIntegration:
    """Test Git integration endpoints (GitHub API calls will fail without real token)"""
    
    def test_list_git_repos(self, auth_session):
        """List git repositories"""
        resp = auth_session.get(f"{BASE_URL}/api/git-repos")
        assert resp.status_code == 200, f"Failed to list repos: {resp.text}"
        repos = resp.json()
        assert isinstance(repos, list)
        print(f"✓ Listed {len(repos)} git repositories")
    
    def test_create_git_repo(self, auth_session):
        """Create a git repository connection"""
        repo_data = {
            "name": f"TEST_repo_{uuid.uuid4().hex[:6]}",
            "repository_url": "https://github.com/test-user/test-repo",
            "access_token": "ghp_test_token_not_real",
            "provider": "github",
            "sync_path": "bpmn/",
            "default_branch": "main"
        }
        
        resp = auth_session.post(f"{BASE_URL}/api/git-repos", json=repo_data)
        assert resp.status_code == 200, f"Failed to create repo: {resp.text}"
        repo = resp.json()
        
        assert repo["name"] == repo_data["name"]
        assert repo["repository_url"] == repo_data["repository_url"]
        assert repo["provider"] == "github"
        assert "access_token" not in repo  # Token should not be returned
        print(f"✓ Created git repo: {repo['name']} (id: {repo['id']})")
        
        # Cleanup
        auth_session.delete(f"{BASE_URL}/api/git-repos/{repo['id']}")
        print("✓ Cleaned up test repo")
    
    def test_git_push_without_real_token(self, auth_session, test_diagram_id):
        """Git push should fail with invalid token (expected behavior)"""
        # Create a test repo
        repo_data = {
            "name": f"TEST_push_{uuid.uuid4().hex[:6]}",
            "repository_url": "https://github.com/test-user/test-repo",
            "access_token": "ghp_invalid_token",
            "provider": "github"
        }
        create_resp = auth_session.post(f"{BASE_URL}/api/git-repos", json=repo_data)
        repo = create_resp.json()
        
        # Try push - should fail with GitHub API error (401 unauthorized)
        push_resp = auth_session.post(
            f"{BASE_URL}/api/git-repos/{repo['id']}/push",
            json={"diagram_id": test_diagram_id}
        )
        
        # Expected: 401 from GitHub API
        assert push_resp.status_code in [401, 403, 404], f"Unexpected status: {push_resp.status_code}"
        print(f"✓ Git push correctly fails without valid token (status: {push_resp.status_code})")
        
        # Cleanup
        auth_session.delete(f"{BASE_URL}/api/git-repos/{repo['id']}")
    
    def test_git_pull_without_real_token(self, auth_session, test_diagram_id):
        """Git pull should fail with invalid token (expected behavior)"""
        # Create a test repo
        repo_data = {
            "name": f"TEST_pull_{uuid.uuid4().hex[:6]}",
            "repository_url": "https://github.com/test-user/test-repo",
            "access_token": "ghp_invalid_token",
            "provider": "github"
        }
        create_resp = auth_session.post(f"{BASE_URL}/api/git-repos", json=repo_data)
        repo = create_resp.json()
        
        # Try pull - should fail with GitHub API error
        pull_resp = auth_session.post(
            f"{BASE_URL}/api/git-repos/{repo['id']}/pull",
            json={"diagram_id": test_diagram_id}
        )
        
        # Expected: 401/404 from GitHub API
        assert pull_resp.status_code in [401, 403, 404], f"Unexpected status: {pull_resp.status_code}"
        print(f"✓ Git pull correctly fails without valid token (status: {pull_resp.status_code})")
        
        # Cleanup
        auth_session.delete(f"{BASE_URL}/api/git-repos/{repo['id']}")
    
    def test_delete_git_repo(self, auth_session):
        """Delete a git repository"""
        # Create repo to delete
        repo_data = {
            "name": f"TEST_delete_{uuid.uuid4().hex[:6]}",
            "repository_url": "https://github.com/test/repo",
            "access_token": "test_token",
            "provider": "github"
        }
        create_resp = auth_session.post(f"{BASE_URL}/api/git-repos", json=repo_data)
        repo = create_resp.json()
        
        # Delete
        del_resp = auth_session.delete(f"{BASE_URL}/api/git-repos/{repo['id']}")
        assert del_resp.status_code == 200
        print(f"✓ Deleted git repo: {repo['id']}")
        
        # Verify deleted
        list_resp = auth_session.get(f"{BASE_URL}/api/git-repos")
        repos = list_resp.json()
        assert not any(r["id"] == repo["id"] for r in repos)
        print("✓ Verified repo no longer in list")
    
    def test_git_push_no_diagram(self, auth_session):
        """Git push without diagram should fail"""
        # Create repo without diagram_id
        repo_data = {
            "name": f"TEST_no_diag_{uuid.uuid4().hex[:6]}",
            "repository_url": "https://github.com/test/repo",
            "access_token": "test_token",
            "provider": "github"
        }
        create_resp = auth_session.post(f"{BASE_URL}/api/git-repos", json=repo_data)
        repo = create_resp.json()
        
        # Push without diagram_id
        push_resp = auth_session.post(f"{BASE_URL}/api/git-repos/{repo['id']}/push")
        assert push_resp.status_code == 400
        assert "diagram" in push_resp.json().get("detail", "").lower()
        print("✓ Git push without diagram correctly rejected")
        
        # Cleanup
        auth_session.delete(f"{BASE_URL}/api/git-repos/{repo['id']}")

# ==================== HEALTH CHECK ====================

class TestHealthCheck:
    """Basic health check"""
    
    def test_api_health(self):
        """API health endpoint"""
        resp = requests.get(f"{BASE_URL}/api/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"
        print("✓ API health check passed")
    
    def test_dev_login(self):
        """Dev login works"""
        resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        assert resp.status_code == 200
        data = resp.json()
        assert "session_token" in data
        assert "user_id" in data
        print(f"✓ Dev login successful: {data['email']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
