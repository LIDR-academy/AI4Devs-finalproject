# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Backend tests for Custom Schemas Enterprise feature."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://process-mapper-ai.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

FREE_TOKEN = "2d4177f7-212e-406a-b389-0fee5abd0df2"  # free user (plan=null) — expect 403


@pytest.fixture(scope="module")
def enterprise_token():
    """Dev login user (test@bpmnmodeler.dev) — was upgraded to plan=enterprise per session note."""
    r = requests.post(f"{API}/auth/dev-login", timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["session_token"]


@pytest.fixture(scope="module")
def free_token():
    return FREE_TOKEN


# ---------- Auth gate ----------
def test_no_auth_returns_401():
    r = requests.get(f"{API}/custom-schemas", timeout=30)
    assert r.status_code == 401, r.text


def test_free_user_returns_403(free_token):
    r = requests.get(f"{API}/custom-schemas", headers={"Authorization": f"Bearer {free_token}"}, timeout=30)
    assert r.status_code == 403, r.text
    assert "Enterprise" in r.json().get("detail", "")


# ---------- /auth/me returns plan ----------
def test_auth_me_returns_plan_field(enterprise_token):
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {enterprise_token}"}, timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert "plan" in data, f"plan field missing in /auth/me response: {data}"


def test_auth_me_free_plan_null(free_token):
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {free_token}"}, timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert "plan" in data
    assert data["plan"] is None or data["plan"] != "enterprise"


# ---------- CRUD ----------
class TestCustomSchemasCRUD:
    @pytest.fixture(autouse=True)
    def _setup(self, enterprise_token):
        self.headers = {"Authorization": f"Bearer {enterprise_token}", "Content-Type": "application/json"}
        self.created_ids = []
        yield
        # teardown
        for sid in self.created_ids:
            try:
                requests.delete(f"{API}/custom-schemas/{sid}", headers=self.headers, timeout=10)
            except Exception:
                pass

    def test_list_empty_or_existing(self):
        r = requests.get(f"{API}/custom-schemas", headers=self.headers, timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_and_get(self):
        payload = {
            "name": "TEST_Procurement",
            "description": "test",
            "scope": "oop_class",
            "schema": {
                "type": "object",
                "properties": {
                    "vendor": {"type": "string"},
                    "amount": {"type": "number"},
                    "category": {"type": "string", "enum": ["A", "B"]},
                },
                "required": ["vendor"],
            },
        }
        r = requests.post(f"{API}/custom-schemas", headers=self.headers, json=payload, timeout=30)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["name"] == "TEST_Procurement"
        assert created["scope"] == "oop_class"
        assert "id" in created
        sid = created["id"]
        self.created_ids.append(sid)

        # GET
        g = requests.get(f"{API}/custom-schemas/{sid}", headers=self.headers, timeout=30)
        assert g.status_code == 200
        fetched = g.json()
        assert fetched["name"] == "TEST_Procurement"
        assert fetched["schema"]["properties"]["vendor"]["type"] == "string"

    def test_invalid_schema_400(self):
        payload = {
            "name": "TEST_BadSchema",
            "scope": "oop_class",
            "schema": {"type": "object", "properties": {"x": {"type": "unknownType"}}},
        }
        r = requests.post(f"{API}/custom-schemas", headers=self.headers, json=payload, timeout=30)
        assert r.status_code == 400, r.text
        body = r.json()
        # detail may be a dict with 'errors' list
        detail = body.get("detail")
        if isinstance(detail, dict):
            assert "errors" in detail
            assert any("unknownType" in e for e in detail["errors"])

    def test_update_and_persistence(self):
        # create
        c = requests.post(
            f"{API}/custom-schemas",
            headers=self.headers,
            json={"name": "TEST_Update1", "scope": "oop_class", "schema": {"type": "object", "properties": {}}},
            timeout=30,
        )
        assert c.status_code == 200
        sid = c.json()["id"]
        self.created_ids.append(sid)

        # update name
        u = requests.put(
            f"{API}/custom-schemas/{sid}",
            headers=self.headers,
            json={"name": "TEST_Update2"},
            timeout=30,
        )
        assert u.status_code == 200, u.text
        assert u.json()["name"] == "TEST_Update2"

        # verify GET
        g = requests.get(f"{API}/custom-schemas/{sid}", headers=self.headers, timeout=30)
        assert g.status_code == 200
        assert g.json()["name"] == "TEST_Update2"

    def test_delete_and_404(self):
        c = requests.post(
            f"{API}/custom-schemas",
            headers=self.headers,
            json={"name": "TEST_Delete", "scope": "oop_class", "schema": {"type": "object", "properties": {}}},
            timeout=30,
        )
        sid = c.json()["id"]
        d = requests.delete(f"{API}/custom-schemas/{sid}", headers=self.headers, timeout=30)
        assert d.status_code == 200
        assert d.json().get("ok") is True

        # confirm gone
        g = requests.get(f"{API}/custom-schemas/{sid}", headers=self.headers, timeout=30)
        assert g.status_code == 404


# ---------- Apply schema validation ----------
class TestApplySchema:
    @pytest.fixture(autouse=True)
    def _setup(self, enterprise_token):
        self.headers = {"Authorization": f"Bearer {enterprise_token}", "Content-Type": "application/json"}
        # Create schema
        r = requests.post(
            f"{API}/custom-schemas",
            headers=self.headers,
            json={
                "name": "TEST_Apply",
                "scope": "oop_class",
                "schema": {
                    "type": "object",
                    "properties": {
                        "tier": {"type": "string", "enum": ["gold", "silver"]},
                        "score": {"type": "number"},
                    },
                    "required": ["tier"],
                },
            },
            timeout=30,
        )
        assert r.status_code == 200
        self.schema_id = r.json()["id"]

        # find or create OOP class
        oop_list = requests.get(f"{API}/oop-classes", headers=self.headers, timeout=30)
        if oop_list.status_code == 200 and isinstance(oop_list.json(), list) and oop_list.json():
            self.class_id = oop_list.json()[0].get("id")
        else:
            self.class_id = None
        yield
        try:
            requests.delete(f"{API}/custom-schemas/{self.schema_id}", headers=self.headers, timeout=10)
        except Exception:
            pass

    def test_apply_invalid_metadata_returns_400(self):
        if not self.class_id:
            pytest.skip("No OOP classes available")
        # missing required + bad enum
        r = requests.post(
            f"{API}/oop-classes/{self.class_id}/apply-custom-schema",
            headers=self.headers,
            json={"schema_id": self.schema_id, "metadata": {"tier": "platinum"}},
            timeout=30,
        )
        assert r.status_code == 400, r.text
        detail = r.json().get("detail")
        if isinstance(detail, dict):
            assert any("tier" in e or "enum" in e or "one of" in e for e in detail.get("errors", []))

    def test_apply_valid_metadata(self):
        if not self.class_id:
            pytest.skip("No OOP classes available")
        r = requests.post(
            f"{API}/oop-classes/{self.class_id}/apply-custom-schema",
            headers=self.headers,
            json={"schema_id": self.schema_id, "metadata": {"tier": "gold", "score": 95.5}},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("ok") is True
        assert "custom_metadata" in body
