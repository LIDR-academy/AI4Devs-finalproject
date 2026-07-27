# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Test global announcements module: public /active, dismiss, admin CRUD,
audience targeting, schedule windows, version-aware invalidation, idempotent seed."""
import os
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
DEMO_ID = "announcement-demo-version"


# ------ Fixtures ------
@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="module")
def admin_token(s):
    r = s.post(f"{BASE_URL}/api/auth/dev-login")
    assert r.status_code == 200, r.text
    data = r.json()
    return data["session_token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def free_token(s):
    # demo-login is read-only but should still authenticate; also try free user via admin reset
    r = s.post(f"{BASE_URL}/api/auth/demo-login", json={"email": "demo@bpmnmodeler.app", "password": "demo"})
    if r.status_code == 200:
        return r.json().get("session_token")
    return None


@pytest.fixture(scope="module", autouse=True)
def cleanup(s, admin_headers):
    yield
    # Delete any announcement with TEST_ in title
    r = s.get(f"{BASE_URL}/api/announcements", headers=admin_headers)
    if r.status_code == 200:
        for ann in r.json():
            if ann.get("title", "").startswith("TEST_"):
                s.delete(f"{BASE_URL}/api/announcements/{ann['id']}", headers=admin_headers)


# ------ Public /active ------
class TestPublicActive:
    def test_active_anonymous_returns_demo(self, s):
        r = s.get(f"{BASE_URL}/api/announcements/active")
        assert r.status_code == 200
        data = r.json()
        assert "items" in data and "count" in data
        ids = [it["id"] for it in data["items"]]
        assert DEMO_ID in ids
        demo = next(it for it in data["items"] if it["id"] == DEMO_ID)
        assert demo["severity"] == "warning"
        assert demo["cta_label"] == "Ver planes"
        assert demo["cta_url"] == "/pricing"
        assert demo["version"] >= 1
        assert demo["dismissible"] is True

    def test_active_with_admin_auth_returns_demo(self, s, admin_headers):
        r = s.get(f"{BASE_URL}/api/announcements/active", headers=admin_headers)
        assert r.status_code == 200
        ids = [it["id"] for it in r.json()["items"]]
        assert DEMO_ID in ids


# ------ Dismiss ------
class TestDismiss:
    def test_dismiss_requires_auth(self, s):
        r = s.post(f"{BASE_URL}/api/announcements/{DEMO_ID}/dismiss")
        assert r.status_code == 401

    def test_dismiss_unknown_404(self, s, admin_headers):
        r = s.post(f"{BASE_URL}/api/announcements/no-such-id/dismiss", headers=admin_headers)
        assert r.status_code == 404

    def test_dismiss_then_filtered_out(self, s, admin_headers):
        # Make sure demo is active first
        r0 = s.get(f"{BASE_URL}/api/announcements/active", headers=admin_headers)
        ids_before = [it["id"] for it in r0.json()["items"]]
        assert DEMO_ID in ids_before
        # Dismiss
        r = s.post(f"{BASE_URL}/api/announcements/{DEMO_ID}/dismiss", headers=admin_headers)
        assert r.status_code == 200
        # Verify filtered out for this user
        r2 = s.get(f"{BASE_URL}/api/announcements/active", headers=admin_headers)
        ids_after = [it["id"] for it in r2.json()["items"]]
        assert DEMO_ID not in ids_after, f"Should be dismissed but still present: {ids_after}"
        # Anonymous still sees it
        r3 = s.get(f"{BASE_URL}/api/announcements/active")
        ids_anon = [it["id"] for it in r3.json()["items"]]
        assert DEMO_ID in ids_anon

    def test_version_bump_reshows(self, s, admin_headers):
        # Demo is dismissed for admin. Now PUT with invalidate_dismissals=True.
        r = s.put(
            f"{BASE_URL}/api/announcements/{DEMO_ID}",
            headers=admin_headers,
            json={"invalidate_dismissals": True},
        )
        assert r.status_code == 200, r.text
        new_version = r.json().get("version")
        assert new_version >= 2
        # Now /active should re-show it
        r2 = s.get(f"{BASE_URL}/api/announcements/active", headers=admin_headers)
        ids = [it["id"] for it in r2.json()["items"]]
        assert DEMO_ID in ids, "Banner should be re-shown after version bump"


# ------ Admin CRUD ------
class TestAdminCRUD:
    def test_list_requires_admin_auth(self, s):
        r = s.get(f"{BASE_URL}/api/announcements")
        assert r.status_code in (401, 403)

    def test_admin_list(self, s, admin_headers):
        r = s.get(f"{BASE_URL}/api/announcements", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_update_delete_full_flow(self, s, admin_headers):
        payload = {
            "title": "TEST_CRUD basic",
            "body": "TEST_body",
            "severity": "info",
            "audience": "all",
            "active": True,
            "dismissible": True,
            "cta_label": "Mas info",
            "cta_url": "/x",
        }
        r = s.post(f"{BASE_URL}/api/announcements", headers=admin_headers, json=payload)
        assert r.status_code == 200, r.text
        doc = r.json()
        ann_id = doc["id"]
        assert doc["title"] == payload["title"]
        assert doc["severity"] == "info"
        assert doc["version"] == 1

        # Update title
        r2 = s.put(f"{BASE_URL}/api/announcements/{ann_id}", headers=admin_headers,
                   json={"title": "TEST_CRUD updated"})
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST_CRUD updated"

        # Delete
        r3 = s.delete(f"{BASE_URL}/api/announcements/{ann_id}", headers=admin_headers)
        assert r3.status_code == 200
        # Verify gone
        r4 = s.delete(f"{BASE_URL}/api/announcements/{ann_id}", headers=admin_headers)
        assert r4.status_code == 404

    def test_active_toggle_hides_banner(self, s, admin_headers):
        # Create new announcement, deactivate, ensure it's not in /active
        r = s.post(f"{BASE_URL}/api/announcements", headers=admin_headers, json={
            "title": "TEST_toggle", "body": "x", "severity": "info", "audience": "all", "active": True
        })
        ann_id = r.json()["id"]
        try:
            r1 = s.get(f"{BASE_URL}/api/announcements/active")
            assert ann_id in [it["id"] for it in r1.json()["items"]]
            # Deactivate
            s.put(f"{BASE_URL}/api/announcements/{ann_id}", headers=admin_headers, json={"active": False})
            r2 = s.get(f"{BASE_URL}/api/announcements/active")
            assert ann_id not in [it["id"] for it in r2.json()["items"]]
            # Reactivate
            s.put(f"{BASE_URL}/api/announcements/{ann_id}", headers=admin_headers, json={"active": True})
            r3 = s.get(f"{BASE_URL}/api/announcements/active")
            assert ann_id in [it["id"] for it in r3.json()["items"]]
        finally:
            s.delete(f"{BASE_URL}/api/announcements/{ann_id}", headers=admin_headers)


# ------ Audience targeting ------
class TestAudience:
    def test_admin_audience(self, s, admin_headers):
        r = s.post(f"{BASE_URL}/api/announcements", headers=admin_headers, json={
            "title": "TEST_admin_only", "body": "admins", "severity": "info",
            "audience": "admin", "active": True
        })
        ann_id = r.json()["id"]
        try:
            # Anonymous → not visible (admin audience requires auth)
            r1 = s.get(f"{BASE_URL}/api/announcements/active")
            assert ann_id not in [it["id"] for it in r1.json()["items"]]
            # Admin → visible
            r2 = s.get(f"{BASE_URL}/api/announcements/active", headers=admin_headers)
            assert ann_id in [it["id"] for it in r2.json()["items"]]
        finally:
            s.delete(f"{BASE_URL}/api/announcements/{ann_id}", headers=admin_headers)


# ------ Schedule ------
class TestSchedule:
    def test_future_starts_at_excluded(self, s, admin_headers):
        r = s.post(f"{BASE_URL}/api/announcements", headers=admin_headers, json={
            "title": "TEST_future", "body": "x", "severity": "info", "audience": "all",
            "active": True, "starts_at": "2099-01-01T00:00:00+00:00"
        })
        ann_id = r.json()["id"]
        try:
            r1 = s.get(f"{BASE_URL}/api/announcements/active")
            assert ann_id not in [it["id"] for it in r1.json()["items"]]
        finally:
            s.delete(f"{BASE_URL}/api/announcements/{ann_id}", headers=admin_headers)

    def test_past_ends_at_excluded(self, s, admin_headers):
        r = s.post(f"{BASE_URL}/api/announcements", headers=admin_headers, json={
            "title": "TEST_past", "body": "x", "severity": "info", "audience": "all",
            "active": True, "ends_at": "2000-01-01T00:00:00+00:00"
        })
        ann_id = r.json()["id"]
        try:
            r1 = s.get(f"{BASE_URL}/api/announcements/active")
            assert ann_id not in [it["id"] for it in r1.json()["items"]]
        finally:
            s.delete(f"{BASE_URL}/api/announcements/{ann_id}", headers=admin_headers)


# ------ Idempotent seed ------
class TestSeed:
    def test_demo_seed_present_and_unique(self, s, admin_headers):
        r = s.get(f"{BASE_URL}/api/announcements", headers=admin_headers)
        assert r.status_code == 200
        demos = [a for a in r.json() if a["id"] == DEMO_ID]
        assert len(demos) == 1, f"Expected exactly one demo, got {len(demos)}"
