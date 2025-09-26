"""
Minimal test configuration and fixtures for current tests.

This provides only what's needed for:
- test_config.py (unit tests for configuration)
- test_main.py (integration tests for FastAPI app)
"""

import pytest
from typing import Generator
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import get_settings


# ============================================================
# Pytest Configuration
# ============================================================

def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests (fast, isolated)"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests (uses FastAPI TestClient)"
    )


# ============================================================
# Fixtures for test_main.py (Integration Tests)
# ============================================================

@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """
    Test client for FastAPI integration tests.
    
    Used by: test_main.py
    - TestHealthEndpoint
    - TestCORSHeaders
    """
    with TestClient(app) as test_client:
        yield test_client


# ============================================================
# Fixtures for test_config.py (Unit Tests)
# ============================================================

@pytest.fixture
def temp_env_file(tmp_path):
    """
    Create a temporary .env file for testing.
    
    Used by: test_config.py
    - TestSettingsWithEnvFile class
    
    Returns a path to a temporary directory where .env files can be created.
    """
    return tmp_path


# ============================================================
# Fixtures for Error Handling Tests
# ============================================================

@pytest.fixture
def mock_logger():
    """
    Mock logger for testing error logging behavior.
    
    Used by: test_main.py
    - TestErrorHandling class for testing log levels and messages
    
    Returns a mock logger instance that can be used to assert
    logging calls and inspect log messages.
    """
    # Mock the logger instance that's already created in main.py
    with patch('app.main.logger') as mock_logger_instance:
        yield mock_logger_instance
