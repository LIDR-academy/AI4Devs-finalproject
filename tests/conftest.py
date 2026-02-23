"""
Pytest configuration and shared fixtures.

This file contains pytest fixtures that are shared across
multiple test modules in the integration and unit test suites.
"""
import os
import pytest
from supabase import create_client, Client
import psycopg2
from psycopg2.extensions import connection


@pytest.fixture(scope="session")
def celery_config():
    """
    Configure Celery for testing with eager mode.
    
    In eager mode, tasks execute synchronously instead of being
    sent to the broker, making tests deterministic and faster.
    """
    return {
        'task_always_eager': True,
        'task_eager_propagates': True,
    }


@pytest.fixture(scope="function", autouse=True)
def celery_eager_mode():
    """
    Enable Celery eager mode for all tests automatically.
    
    This makes validate_file.apply_async() execute synchronously,
    allowing tests to run without a background worker.
    """
    from src.agent.celery_app import celery_app

    # Store original config
    original_always_eager = celery_app.conf.task_always_eager
    original_eager_propagates = celery_app.conf.task_eager_propagates

    # Enable eager mode
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True

    yield

    # Restore original config
    celery_app.conf.task_always_eager = original_always_eager
    celery_app.conf.task_eager_propagates = original_eager_propagates


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


@pytest.fixture(scope="session")
def db_connection() -> connection:
    """
    Create a direct PostgreSQL connection to the local test database.
    
    This fixture provides a psycopg2 connection for tests that need
    to execute raw SQL or verify database schema directly.
    Useful for DB migration tests (e.g., T-020-DB).
    
    Environment variables:
        DATABASE_URL: PostgreSQL connection string (default: from docker-compose)
    
    Returns:
        psycopg2.connection: Active database connection
        
    Yields:
        connection: Connection object for test use
        
    Cleanup:
        Closes connection after test session ends
    """
    database_url = os.environ.get(
        "DATABASE_URL",
        "postgresql://user:password@db:5432/sfpm_db"
    )

    conn = psycopg2.connect(database_url)
    conn.autocommit = False  # Manual transaction control

    yield conn

    conn.close()


@pytest.fixture(scope="session", autouse=True)
def setup_database_schema(db_connection: connection):
    """
    Create essential database schema for integration tests.
    
    This fixture runs once per test session and ensures the basic
    tables (profiles, blocks) are available for tests that need them.
    """
    cursor = db_connection.cursor()

    try:
        # Create profiles table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID,
                name TEXT,
                email TEXT,
                role TEXT,
                workshop_id UUID,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)

        # Create block_status ENUM if not exists
        cursor.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'block_status') THEN
                    CREATE TYPE block_status AS ENUM (
                        'uploaded', 'validated', 'in_fabrication', 'completed', 'archived'
                    );
                END IF;
            END $$;
        """)

        # Create blocks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS blocks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                iso_code TEXT UNIQUE,
                status block_status DEFAULT 'uploaded',
                tipologia TEXT,
                zone_id UUID,
                workshop_id UUID,
                created_by UUID REFERENCES profiles(id),
                updated_by UUID REFERENCES profiles(id),
                url_original TEXT,
                url_glb TEXT,
                rhino_metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                is_archived BOOLEAN DEFAULT FALSE
            );
        """)

        # Insert a test profile for FK references
        cursor.execute("""
            INSERT INTO profiles (id, name, email, role)
            VALUES ('00000000-0000-0000-0000-000000000001', 'Test User', 'test@example.com', 'architect')
            ON CONFLICT (id) DO NOTHING;
        """)

        db_connection.commit()

    except Exception as e:
        db_connection.rollback()
        pytest.skip(f"Failed to setup database schema: {e}")

    yield

    # Cleanup: optionally drop tables after session (not recommended for integration tests)
    # cursor.execute("DROP TABLE IF EXISTS blocks;")
    # cursor.execute("DROP TABLE IF EXISTS profiles;")
    # cursor.execute("DROP TYPE IF EXISTS block_status;")
    # db_connection.commit()
