#!/usr/bin/env python3
"""
T-004-BACK: Automated database migration script
Executes SQL migration to create events table in Supabase PostgreSQL

This script connects directly to PostgreSQL and executes the DDL migration.

Usage:
    python infra/setup_events_table.py
    
Environment variables required:
    SUPABASE_DATABASE_URL - PostgreSQL connection string for Supabase
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add parent directory to path to import backend modules if needed
sys.path.insert(0, str(Path(__file__).parent.parent / "src" / "backend"))

try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("❌ ERROR: psycopg2-binary not installed")
    print("   Run: pip install psycopg2-binary")
    print("   Or: make install (if using Docker)")
    sys.exit(1)


def load_sql_migration() -> str:
    """Load SQL migration from file"""
    sql_file = Path(__file__).parent / "create_events_table.sql"
    if not sql_file.exists():
        raise FileNotFoundError(f"SQL migration file not found: {sql_file}")

    with open(sql_file, 'r') as f:
        return f.read()


def get_database_url() -> str:
    """Get database URL from environment variables
    
    Follows 12-Factor App principles:
    - Loads .env file if it exists (local development)
    - Falls back to environment variables (production/Docker)
    - Validates the VARIABLE, not the file
    """
    # Try to load .env file if it exists (silent if not found)
    # This supports local development without breaking production
    project_root = Path(__file__).parent.parent
    env_file = project_root / ".env"
    load_dotenv(env_file)  # Silent if file doesn't exist

    # Try SUPABASE_DATABASE_URL first (primary)
    database_url = os.getenv("SUPABASE_DATABASE_URL")

    # Fallback to DATABASE_URL (secondary)
    if not database_url:
        database_url = os.getenv("DATABASE_URL")

    # If still not found, exit with clear error
    if not database_url:
        print("❌ ERROR: Database connection string not found")
        print("   Missing environment variable: SUPABASE_DATABASE_URL")
        print("")
        print("   Local development: Add SUPABASE_DATABASE_URL to .env file")
        print("   Production/Docker: Set SUPABASE_DATABASE_URL in environment")
        print("")
        print("   Format: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres")
        sys.exit(1)

    return database_url


def execute_migration(database_url: str, sql: str) -> None:
    """Execute SQL migration against PostgreSQL database"""
    print("🔄 Connecting to Supabase PostgreSQL...")

    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        conn.autocommit = True  # Execute DDL immediately

        with conn.cursor() as cursor:
            print("🔄 Executing migration...")
            cursor.execute(sql)
            print("✅ Migration executed successfully!")

            # Verify table was created
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'events'
                );
            """)
            table_exists = cursor.fetchone()[0]

            if table_exists:
                print("✅ Table 'events' verified in database")

                # Show table structure
                cursor.execute("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = 'events'
                    ORDER BY ordinal_position;
                """)
                columns = cursor.fetchall()

                print("\n📊 Table structure:")
                print("   Column Name       | Data Type            | Nullable")
                print("   " + "-" * 60)
                for col_name, data_type, nullable in columns:
                    print(f"   {col_name:18} | {data_type:20} | {nullable}")

                # Show indexes
                cursor.execute("""
                    SELECT indexname, indexdef
                    FROM pg_indexes
                    WHERE tablename = 'events';
                """)
                indexes = cursor.fetchall()

                if indexes:
                    print("\n🔑 Indexes created:")
                    for idx_name, idx_def in indexes:
                        print(f"   - {idx_name}")

            else:
                print("⚠️  WARNING: Table 'events' not found after migration")

        conn.close()
        print("\n✅ Database migration completed successfully!")
        print("   You can now run: make test")

    except psycopg2.OperationalError as e:
        print("❌ ERROR: Could not connect to database")
        print(f"   {str(e)}")
        print("\n   Check your SUPABASE_DATABASE_URL in .env")
        print("   Format: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres")
        sys.exit(1)
    except psycopg2.Error as e:
        print("❌ ERROR: Database error occurred")
        print(f"   {str(e)}")
        sys.exit(1)
    except Exception as e:
        print("❌ ERROR: Unexpected error")
        print(f"   {str(e)}")
        sys.exit(1)


def main():
    """Main execution"""
    print("=" * 70)
    print("T-004-BACK: Events Table Migration")
    print("=" * 70)
    print()

    # Load SQL migration
    try:
        sql = load_sql_migration()
        print(f"✅ Loaded SQL migration ({len(sql)} characters)")
    except Exception as e:
        print("❌ ERROR: Could not load SQL migration")
        print(f"   {str(e)}")
        sys.exit(1)

    # Get database URL
    database_url = get_database_url()
    print("✅ Database URL loaded from .env")
    print()

    # Execute migration
    execute_migration(database_url, sql)


if __name__ == "__main__":
    main()
