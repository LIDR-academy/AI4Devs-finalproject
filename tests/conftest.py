"""
Pytest configuration and shared fixtures.

This file contains pytest fixtures that are shared across
multiple test modules in the integration and unit test suites.
"""
import os
import pytest
from supabase import create_client, Client


@pytest.fixture(scope="session")
def supabase_client() -> Client:
    """
    Create a Supabase client instance using environment variables.
    
    This fixture is scoped to the session level to reuse the same
    client instance across all tests within the test session, reducing
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


@pytest.fixture(scope="session", autouse=True)
def setup_events_table(supabase_client: Client):
    """
    Create events table if it doesn't exist.
    
    This fixture runs once per test session and ensures the events
    table is available for T-004-BACK tests.
    
    The table is created with the following schema:
    - id: UUID primary key
    - file_id: UUID reference to uploaded file
    - event_type: VARCHAR(100) event classification
    - metadata: JSONB for flexible event data
    - created_at: TIMESTAMP with timezone
    """
    # SQL to create events table (idempotent)
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        file_id UUID NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_events_file_id ON events(file_id);
    CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
    """
    
    # Note: Supabase Python client v2 doesn't support direct SQL execution
    # The table must be created manually in Supabase SQL Editor or via API
    # This fixture serves as documentation of the required schema
    
    # For test purposes, we'll attempt to query the table to verify it exists
    try:
        # Try to query events table (will fail if doesn't exist)
        supabase_client.table("events").select("*").limit(1).execute()
    except Exception as e:
        pytest.skip(
            f"Events table not found. Please run the SQL in infra/create_events_table.sql\n"
            f"Error: {str(e)}"
        )
    
    yield
    
    # Cleanup: optionally delete test events after session
    # Note: In production, events should be append-only for audit trail
