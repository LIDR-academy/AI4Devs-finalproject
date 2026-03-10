"""Pytest fixtures and VCR configuration for backend tests."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest
import vcr

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app


@pytest.fixture(scope="session")
def app():
    """Create a Flask app configured for isolated testing."""
    app = create_app(TestingConfig)
    return app


@pytest.fixture(scope="session")
def client(app):
    """Return a Flask test client."""
    return app.test_client()


@pytest.fixture(scope="function")
def registered_user(client):
    """Register a user and return payload for auth-dependent tests."""
    response = client.post(
        "/api/v1/users/register",
        json={"email": "fixture.user@example.com", "password": "StrongPassword123!"},
        environ_overrides={"REMOTE_ADDR": "203.0.113.44"},
    )
    assert response.status_code == 201
    return response.get_json()["data"]


@pytest.fixture(scope="function")
def api_key(registered_user):
    """Return only the API key from the registered user fixture."""
    return registered_user["api_key"]


@pytest.fixture(scope="function")
def auth_headers(api_key):
    """Return API-key auth header."""
    return {"X-API-Key": api_key}


def _record_mode() -> str:
    """Resolve VCR mode from environment, defaulting to replay-only."""
    mode = os.getenv("VCR_RECORD_MODE", "none").strip().lower()
    if mode not in {"none", "once", "new_episodes", "all"}:
        return "none"
    return mode


ipfs_vcr = vcr.VCR(
    cassette_library_dir=str(ROOT / "tests" / "backend" / "cassettes"),
    record_mode=_record_mode(),
    match_on=["method", "scheme", "host", "port", "path", "query"],
    filter_headers=["Authorization", "X-Amz-Security-Token"],
    filter_query_parameters=["AWSAccessKeyId", "Signature"],
    decode_compressed_response=True,
)
