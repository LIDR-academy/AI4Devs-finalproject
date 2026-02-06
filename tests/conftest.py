"""
Pytest configuration and shared fixtures.

This file contains pytest fixtures that are shared across
multiple test modules in the integration and unit test suites.
"""
import os
import pytest
from supabase import create_client, Client


@pytest.fixture(scope="module")
def supabase_client() -> Client:
    """
    Create a Supabase client instance using environment variables.
    
    This fixture is scoped to the module level to reuse the same
    client instance across all tests within a test file, reducing
    connection overhead.
    
    Environment variables required:
        SUPABASE_URL: Your Supabase project URL (e.g., https://xxxxx.supabase.co)
        SUPABASE_KEY: Service role key or anon key from Supabase project settings
    
    Returns:
        Client: Configured Supabase client instance
        
    Raises:
        pytest.skip: If required environment variables are not set
    """
    url: str | None = os.environ.get("SUPABASE_URL")
    key: str | None = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        pytest.skip("SUPABASE_URL and SUPABASE_KEY must be configured in environment")
    
    return create_client(url, key)
