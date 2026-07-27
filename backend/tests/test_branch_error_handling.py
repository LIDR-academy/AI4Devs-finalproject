# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Tests for branch creation error handling."""

import pytest
import requests
import uuid
import sys
import os

# Add parent directory to path to import conftest
sys.path.insert(0, os.path.dirname(__file__))

from conftest import BASE_URL


class TestBranchErrorHandling:
    """Test branch creation with error scenarios"""

    def test_branch_creates_successfully(self):
        """Test basic branch creation works"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json()["session_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Get a project
        projects_resp = requests.get(f"{BASE_URL}/api/projects", headers=headers)
        projects = projects_resp.json()

        if not projects:
            pytest.skip("No projects available")

        project = projects[0]
        branch_data = {
            "name": f"test_{uuid.uuid4().hex[:8]}",
            "description": "Error handling test"
        }

        response = requests.post(
            f"{BASE_URL}/api/projects/{project['id']}/branches",
            json=branch_data,
            headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert data["name"] == branch_data["name"]
        print(f"✓ Branch creation successful")

    def test_branch_duplicate_name_fails(self):
        """Test duplicate branch name is rejected"""
        login_resp = requests.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json()["session_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Get a project
        projects_resp = requests.get(f"{BASE_URL}/api/projects", headers=headers)
        projects = projects_resp.json()

        if not projects:
            pytest.skip("No projects available")

        project = projects[0]
        branch_name = f"test_duplicate_{uuid.uuid4().hex[:8]}"
        branch_data = {
            "name": branch_name,
            "description": "Duplicate name test"
        }

        # Create first branch
        response1 = requests.post(
            f"{BASE_URL}/api/projects/{project['id']}/branches",
            json=branch_data,
            headers=headers
        )
        assert response1.status_code == 200

        # Try to create duplicate
        response2 = requests.post(
            f"{BASE_URL}/api/projects/{project['id']}/branches",
            json=branch_data,
            headers=headers
        )

        # Should fail with 409 Conflict
        assert response2.status_code == 409
        print(f"✓ Duplicate name correctly rejected")
