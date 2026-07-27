# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Phase D - AI Code Generation tests.
Covers POST /api/ai-projects/{pid}/generate-code + GET history/detail/download, DELETE, and project tree integration.
Uses the existing successful codegen (ce7b7e93-...) for read-only flows to avoid new LLM calls.
"""
import os
import io
import zipfile
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
PROJECT_ID = "5ad98a45-a536-4fd8-a9e0-051f40d26ce4"  # LTI
SPEC_ID = "lti-spec-onboarding"
EXISTING_CG_ID = "ce7b7e93-9d98-4a9d-934e-c0df5f129b8c"  # ready, 12 files


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/dev-login", timeout=20)
    assert r.status_code == 200, r.text
    return r.json()["session_token"]


@pytest.fixture(scope="module")
def H(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Auth ----------
class TestAuth:
    def test_no_auth_generate_returns_401(self):
        r = requests.post(
            f"{BASE_URL}/api/ai-projects/{PROJECT_ID}/generate-code",
            json={"spec_id": SPEC_ID},
            timeout=20,
        )
        assert r.status_code == 401, r.text

    def test_no_auth_get_detail_returns_401(self):
        r = requests.get(
            f"{BASE_URL}/api/ai-projects/code-generations/{EXISTING_CG_ID}",
            timeout=20,
        )
        assert r.status_code == 401

    def test_no_auth_list_returns_401(self):
        r = requests.get(
            f"{BASE_URL}/api/ai-projects/{PROJECT_ID}/code-generations",
            timeout=20,
        )
        assert r.status_code == 401

    def test_no_auth_download_returns_401(self):
        r = requests.get(
            f"{BASE_URL}/api/ai-projects/code-generations/{EXISTING_CG_ID}/download",
            timeout=20,
        )
        assert r.status_code == 401


# ---------- Rejections ----------
class TestRejections:
    def test_generate_unknown_project_404(self, H):
        r = requests.post(
            f"{BASE_URL}/api/ai-projects/no-such-project/generate-code",
            headers=H, json={"spec_id": SPEC_ID}, timeout=20,
        )
        assert r.status_code == 404

    def test_generate_unknown_spec_404(self, H):
        r = requests.post(
            f"{BASE_URL}/api/ai-projects/{PROJECT_ID}/generate-code",
            headers=H, json={"spec_id": "spec-does-not-exist"}, timeout=20,
        )
        assert r.status_code == 404

    def test_generate_spec_other_project_400(self, H):
        # create a spec in a different project then use its id vs LTI project
        # easier: find any spec whose project != LTI
        r = requests.get(f"{BASE_URL}/api/specs/specifications", headers=H, timeout=20)
        if r.status_code != 200:
            pytest.skip("specifications list not available")
        other_specs = [s for s in r.json() if s.get("project_id") and s["project_id"] != PROJECT_ID]
        if not other_specs:
            pytest.skip("no spec belonging to a different project available")
        bad_spec_id = other_specs[0]["id"]
        r2 = requests.post(
            f"{BASE_URL}/api/ai-projects/{PROJECT_ID}/generate-code",
            headers=H, json={"spec_id": bad_spec_id}, timeout=20,
        )
        assert r2.status_code == 400, r2.text

    def test_get_unknown_codegen_404(self, H):
        r = requests.get(
            f"{BASE_URL}/api/ai-projects/code-generations/nonexistent-id",
            headers=H, timeout=20,
        )
        assert r.status_code == 404

    def test_download_unknown_codegen_404(self, H):
        r = requests.get(
            f"{BASE_URL}/api/ai-projects/code-generations/nope-id/download",
            headers=H, timeout=20,
        )
        assert r.status_code == 404

    def test_delete_unknown_codegen_404(self, H):
        r = requests.delete(
            f"{BASE_URL}/api/ai-projects/code-generations/nope-id",
            headers=H, timeout=20,
        )
        assert r.status_code == 404


# ---------- Read-only flows on the existing codegen ----------
class TestExistingCodegen:
    def test_get_detail_with_content(self, H):
        r = requests.get(
            f"{BASE_URL}/api/ai-projects/code-generations/{EXISTING_CG_ID}",
            headers=H, timeout=20,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == EXISTING_CG_ID
        assert data["status"] == "ready"
        assert data["target"] in ("backend", "fullstack", "frontend")
        assert isinstance(data.get("files"), list) and len(data["files"]) > 0
        # each file has path + content
        for f in data["files"]:
            assert "path" in f and "content" in f

    def test_get_detail_include_content_false(self, H):
        r = requests.get(
            f"{BASE_URL}/api/ai-projects/code-generations/{EXISTING_CG_ID}",
            headers=H, params={"include_content": "false"}, timeout=20,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == EXISTING_CG_ID
        # files must be absent when include_content=false
        assert "files" not in data or data.get("files") in (None, [], )

    def test_list_history_no_files_payload(self, H):
        r = requests.get(
            f"{BASE_URL}/api/ai-projects/{PROJECT_ID}/code-generations",
            headers=H, timeout=20,
        )
        assert r.status_code == 200
        body = r.json()
        assert "items" in body and isinstance(body["items"], list)
        found = False
        for it in body["items"]:
            assert "files" not in it  # excluded from list
            if it.get("id") == EXISTING_CG_ID:
                found = True
        assert found, "existing codegen missing from history"

    def test_download_zip(self, H):
        r = requests.get(
            f"{BASE_URL}/api/ai-projects/code-generations/{EXISTING_CG_ID}/download",
            headers=H, timeout=30,
        )
        assert r.status_code == 200
        assert r.headers.get("content-type") == "application/zip"
        cd = r.headers.get("content-disposition", "")
        assert "codegen-" in cd and ".zip" in cd
        zf = zipfile.ZipFile(io.BytesIO(r.content))
        names = zf.namelist()
        assert "MANIFEST.json" in names
        assert len(names) >= 2  # manifest + files
        import json
        manifest = json.loads(zf.read("MANIFEST.json").decode("utf-8"))
        assert manifest["code_gen_id"] == EXISTING_CG_ID
        assert manifest["files_count"] == len(names) - 1


# ---------- Tree integration ----------
class TestTreeIntegration:
    def test_tree_includes_code_phase(self, H):
        r = requests.get(f"{BASE_URL}/api/projects/{PROJECT_ID}/tree", headers=H, timeout=20)
        assert r.status_code == 200
        data = r.json()
        phases = data.get("phases") or {}
        assert "code" in phases, f"phases.code missing from tree: {list(phases.keys())}"
        assert isinstance(phases["code"], list)
        assert len(phases["code"]) >= 1
        # find the snapshot pointing to EXISTING_CG_ID
        matching = [s for s in phases["code"] if s.get("resource_id") == EXISTING_CG_ID or s.get("code_gen_id") == EXISTING_CG_ID]
        # snapshots in tree may have code_gen_id under payload or resource_id
        assert matching or any(EXISTING_CG_ID in str(s) for s in phases["code"]), \
            f"snapshot for {EXISTING_CG_ID} not found in phases.code"


# ---------- Authorization: delete ----------
class TestDeleteAuthorization:
    def test_other_user_cannot_delete_existing(self, H):
        """Existing codegen was created by someone else (main agent). Dev user can delete own, not others."""
        r = requests.get(
            f"{BASE_URL}/api/ai-projects/code-generations/{EXISTING_CG_ID}",
            headers=H, params={"include_content": "false"}, timeout=20,
        )
        assert r.status_code == 200
        cg = r.json()
        # get my email
        me = requests.post(f"{BASE_URL}/api/auth/dev-login", timeout=10).json()
        my_email = me.get("email")
        if cg.get("created_by") == my_email:
            pytest.skip("existing codegen was created by dev user, cannot test 403")
        # user is not admin, different author → 403
        r2 = requests.delete(
            f"{BASE_URL}/api/ai-projects/code-generations/{EXISTING_CG_ID}",
            headers=H, timeout=20,
        )
        assert r2.status_code == 403, f"expected 403 got {r2.status_code}: {r2.text}"
