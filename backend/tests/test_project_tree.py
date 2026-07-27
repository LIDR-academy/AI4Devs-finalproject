# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Tests for Project Tree & Versioning System (project_tree.py router)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://process-mapper-ai.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

PROJECT_ID = "5ad98a45-a536-4fd8-a9e0-051f40d26ce4"
SPEC_ID = "lti-spec-onboarding"
DIAGRAM_ID = "0dac3518-e16d-4baf-a575-45a8e7970433"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/dev-login", timeout=20)
    assert r.status_code == 200, f"dev-login failed: {r.status_code} {r.text}"
    return r.json()["session_token"]


@pytest.fixture(scope="module")
def headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---- AUTH ----

class TestAuth:
    def test_tree_unauthorized(self):
        r = requests.get(f"{API}/projects/{PROJECT_ID}/tree", timeout=15)
        assert r.status_code == 401

    def test_snapshot_unauthorized(self):
        r = requests.post(
            f"{API}/projects/{PROJECT_ID}/snapshots",
            json={"phase": "specification", "resource_id": SPEC_ID},
            timeout=15,
        )
        assert r.status_code == 401

    def test_compare_unauthorized(self):
        r = requests.get(f"{API}/projects/snapshots/compare?a=x&b=y", timeout=15)
        assert r.status_code == 401


# ---- TREE ----

class TestTree:
    def test_tree_shape(self, headers):
        r = requests.get(f"{API}/projects/{PROJECT_ID}/tree", headers=headers, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "phases" in data and "project" in data
        for k in ("descripcion", "requirements", "specification", "bpmn"):
            assert k in data["phases"], f"missing phase {k}"
        # Tree must have at least one spec snapshot and at least one bpmn diagram
        assert isinstance(data["phases"]["specification"], list)
        assert isinstance(data["phases"]["bpmn"], list)
        # Project LTI is expected to have specs and bpmn populated
        assert len(data["phases"]["specification"]) >= 1, "Expected specs populated for LTI"
        assert len(data["phases"]["bpmn"]) >= 1, "Expected bpmn populated for LTI"

    def test_tree_unknown_project(self, headers):
        r = requests.get(f"{API}/projects/unknown-xxx-zzz/tree", headers=headers, timeout=15)
        assert r.status_code == 404


# ---- MANUAL SNAPSHOT ----

class TestManualSnapshots:
    def test_create_spec_snapshot_monotonic(self, headers):
        # Read existing version
        r = requests.get(f"{API}/projects/{PROJECT_ID}/tree", headers=headers, timeout=20)
        specs = r.json()["phases"]["specification"]
        prev_version = specs[0]["version"] if specs else 0

        r = requests.post(
            f"{API}/projects/{PROJECT_ID}/snapshots",
            headers=headers,
            json={"phase": "specification", "resource_id": SPEC_ID, "label": "TEST_pytest_spec"},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["status"] == "ok"
        snap = body["snapshot"]
        assert "_id" not in snap, f"_id leak: {snap.keys()}"
        assert snap["phase"] == "specification"
        assert snap["resource_id"] == SPEC_ID
        assert snap["trigger"] == "manual"
        assert snap["version"] == prev_version + 1
        # Verify it appears in tree
        r2 = requests.get(f"{API}/projects/{PROJECT_ID}/tree", headers=headers, timeout=20)
        new_specs = r2.json()["phases"]["specification"]
        assert any(s["snapshot_id"] == snap["id"] for s in new_specs)

    def test_create_bpmn_snapshot_no_id_leak(self, headers):
        r = requests.post(
            f"{API}/projects/{PROJECT_ID}/snapshots",
            headers=headers,
            json={"phase": "bpmn", "resource_id": DIAGRAM_ID, "label": "TEST_pytest_bpmn"},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "_id" not in body
        v = body["version"]
        assert "_id" not in v
        assert v["diagram_id"] == DIAGRAM_ID
        assert isinstance(v["version_number"], int)
        # Confirm JSON-serializable end-to-end: the requests json() above already proves it

    def test_spec_phase_requires_resource_id(self, headers):
        r = requests.post(
            f"{API}/projects/{PROJECT_ID}/snapshots",
            headers=headers,
            json={"phase": "specification"},
            timeout=15,
        )
        assert r.status_code == 400


# ---- READ SNAPSHOT (route ordering: /compare must NOT match /{id}) ----

class TestReadSnapshot:
    def test_read_phase_kind(self, headers):
        # Create a fresh phase snapshot then read it back
        r = requests.post(
            f"{API}/projects/{PROJECT_ID}/snapshots",
            headers=headers,
            json={"phase": "specification", "resource_id": SPEC_ID},
            timeout=20,
        )
        snap_id = r.json()["snapshot"]["id"]
        rr = requests.get(f"{API}/projects/snapshots/{snap_id}", headers=headers, timeout=15)
        assert rr.status_code == 200, rr.text
        body = rr.json()
        assert body["kind"] == "phase"
        assert body["id"] == snap_id
        assert "_id" not in body

    def test_read_bpmn_kind(self, headers):
        r = requests.post(
            f"{API}/projects/{PROJECT_ID}/snapshots",
            headers=headers,
            json={"phase": "bpmn", "resource_id": DIAGRAM_ID},
            timeout=20,
        )
        version_id = r.json()["version"]["id"]
        rr = requests.get(f"{API}/projects/snapshots/{version_id}", headers=headers, timeout=15)
        assert rr.status_code == 200, rr.text
        body = rr.json()
        assert body["kind"] == "bpmn"
        assert body["id"] == version_id

    def test_read_unknown_returns_404(self, headers):
        r = requests.get(f"{API}/projects/snapshots/does-not-exist-uuid", headers=headers, timeout=15)
        assert r.status_code == 404


# ---- COMPARE ----

class TestCompare:
    def _two_phase_snaps(self, headers):
        a = requests.post(f"{API}/projects/{PROJECT_ID}/snapshots", headers=headers,
                          json={"phase": "specification", "resource_id": SPEC_ID}, timeout=20).json()["snapshot"]["id"]
        b = requests.post(f"{API}/projects/{PROJECT_ID}/snapshots", headers=headers,
                          json={"phase": "specification", "resource_id": SPEC_ID}, timeout=20).json()["snapshot"]["id"]
        return a, b

    def test_compare_phase(self, headers):
        a, b = self._two_phase_snaps(headers)
        r = requests.get(f"{API}/projects/snapshots/compare?a={a}&b={b}", headers=headers, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["kind"] == "phase"
        assert "spec_diff" in body and "requirements_diff" in body and "speckit_diff" in body

    def test_compare_same_id_400(self, headers):
        a, _ = self._two_phase_snaps(headers)
        r = requests.get(f"{API}/projects/snapshots/compare?a={a}&b={a}", headers=headers, timeout=15)
        assert r.status_code == 400

    def test_compare_bpmn(self, headers):
        a = requests.post(f"{API}/projects/{PROJECT_ID}/snapshots", headers=headers,
                          json={"phase": "bpmn", "resource_id": DIAGRAM_ID}, timeout=20).json()["version"]["id"]
        b = requests.post(f"{API}/projects/{PROJECT_ID}/snapshots", headers=headers,
                          json={"phase": "bpmn", "resource_id": DIAGRAM_ID}, timeout=20).json()["version"]["id"]
        r = requests.get(f"{API}/projects/snapshots/compare?a={a}&b={b}", headers=headers, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["kind"] == "bpmn"
        assert "summary" in body and "delta_chars" in body["summary"]

    def test_compare_unknown_404(self, headers):
        r = requests.get(f"{API}/projects/snapshots/compare?a=nope1&b=nope2", headers=headers, timeout=15)
        assert r.status_code == 404


# ---- RESTORE ----

class TestRestore:
    def test_restore_phase(self, headers):
        snap_id = requests.post(f"{API}/projects/{PROJECT_ID}/snapshots", headers=headers,
                                json={"phase": "specification", "resource_id": SPEC_ID},
                                timeout=20).json()["snapshot"]["id"]
        r = requests.post(f"{API}/projects/snapshots/{snap_id}/restore",
                          headers=headers, json={"confirm": True}, timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["kind"] == "specification"
        assert body["spec_id"] == SPEC_ID
        assert "requirements_restored" in body

    def test_restore_bpmn(self, headers):
        v_id = requests.post(f"{API}/projects/{PROJECT_ID}/snapshots", headers=headers,
                             json={"phase": "bpmn", "resource_id": DIAGRAM_ID},
                             timeout=20).json()["version"]["id"]
        r = requests.post(f"{API}/projects/snapshots/{v_id}/restore",
                          headers=headers, json={"confirm": True}, timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["kind"] == "bpmn"
        assert "new_version" in body

    def test_restore_requires_confirm(self, headers):
        snap_id = requests.post(f"{API}/projects/{PROJECT_ID}/snapshots", headers=headers,
                                json={"phase": "specification", "resource_id": SPEC_ID},
                                timeout=20).json()["snapshot"]["id"]
        r = requests.post(f"{API}/projects/snapshots/{snap_id}/restore",
                          headers=headers, json={"confirm": False}, timeout=20)
        assert r.status_code == 400
