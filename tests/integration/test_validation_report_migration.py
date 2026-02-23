"""
T-020-DB: Integration tests for validation_report column migration.

This test suite validates that the migration 20260211160000_add_validation_report.sql
successfully adds the validation_report JSONB column to the blocks table with proper
indexes and constraints.

TDD Phases:
- RED: Tests fail because validation_report column doesn't exist yet
- GREEN: Migration executed, tests pass
- REFACTOR: N/A (migration code is already clean)
"""
import pytest
from psycopg2.extensions import connection
import json


def test_validation_report_column_exists(db_connection: connection) -> None:
    """
    Verify validation_report column exists in blocks table.

    This test will FAIL initially because the migration hasn't been run yet.
    Expected error: Column "validation_report" not found in blocks table.

    Args:
        db_connection: Direct PostgreSQL connection (from conftest.py fixture)

    Assertions:
        - validation_report column exists in information_schema.columns
    """
    cursor = db_connection.cursor()

    try:
        # Query information_schema to check if column exists
        cursor.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'blocks'
              AND column_name = 'validation_report'
        """)

        result = cursor.fetchone()

        if result is None:
            pytest.fail(
                "EXPECTED FAILURE (RED Phase): validation_report column does not exist yet.\n"
                "Run migration: supabase/migrations/20260211160000_add_validation_report.sql"
            )

        # If we reach here, column exists (test passes after migration)
        column_name, data_type = result
        assert column_name == "validation_report", f"Column name must be 'validation_report', got {column_name}"
        assert data_type == "jsonb", f"Column type must be 'jsonb', got {data_type}"

    finally:
        cursor.close()


def test_insert_block_with_validation_report(db_connection: connection) -> None:
    """
    Verify blocks table accepts JSONB data in validation_report column.

    This test will FAIL initially because the column doesn't exist.
    After migration, it should INSERT a test block with a validation report
    and verify the data persists correctly.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Insert with validation_report succeeds
        - Retrieved data matches inserted structure
        - JSONB fields can be queried with -> and ->> operators
    """
    cursor = db_connection.cursor()

    test_validation_report = {
        "is_valid": False,
        "validated_at": "2026-02-11T16:00:00Z",
        "validated_by": "librarian-v1.0-test",
        "errors": [
            {
                "type": "nomenclature",
                "severity": "error",
                "location": "layer:test_layer",
                "message": "Layer name 'test_layer' does not match ISO-19650 pattern"
            },
            {
                "type": "geometry",
                "severity": "warning",
                "location": "object:uuid-test-123",
                "message": "Object geometry has zero volume"
            }
        ],
        "metadata": {
            "total_objects": 10,
            "valid_objects": 8,
            "invalid_objects": 2
        },
        "warnings": []
    }

    inserted_id = None

    try:
        # Attempt to insert block with validation_report
        cursor.execute("""
            INSERT INTO blocks (iso_code, status, tipologia, rhino_metadata, validation_report)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, validation_report
        """, (
            "TEST-020-DB-001",
            "uploaded",
            "test_stone",
            json.dumps({}),
            json.dumps(test_validation_report)
        ))

        result = cursor.fetchone()
        assert result is not None, "INSERT must return a row"

        inserted_id, retrieved_report = result

        # Verify JSONB structure persisted correctly
        assert retrieved_report is not None, "validation_report must not be None"
        assert retrieved_report["is_valid"] is False, "is_valid must be False"
        assert len(retrieved_report["errors"]) == 2, "Must have 2 errors"
        assert retrieved_report["errors"][0]["type"] == "nomenclature", "First error must be nomenclature type"

        # Test JSONB operators: Query blocks with nomenclature errors
        cursor.execute("""
            SELECT id, validation_report->'errors' AS errors
            FROM blocks
            WHERE validation_report @> '{"errors": [{"type": "nomenclature"}]}'::jsonb
              AND id = %s
        """, (inserted_id,))

        query_result = cursor.fetchone()
        assert query_result is not None, "JSONB containment query must find the record"

        db_connection.commit()

    except Exception as e:
        db_connection.rollback()

        error_message = str(e)

        # Expected failure before migration
        if "column" in error_message.lower() and "validation_report" in error_message.lower():
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Cannot insert validation_report - column missing.\n"
                f"Run migration: supabase/migrations/20260211160000_add_validation_report.sql\n"
                f"Error: {error_message}"
            )
        else:
            # Unexpected error
            raise

    finally:
        # Cleanup: remove test block if insertion succeeded
        if inserted_id:
            try:
                cursor.execute("DELETE FROM blocks WHERE id = %s", (inserted_id,))
                db_connection.commit()
            except Exception:
                db_connection.rollback()

        cursor.close()


def test_validation_report_accepts_null(db_connection: connection) -> None:
    """
    Verify validation_report column accepts NULL values.

    Blocks that haven't been validated yet should have NULL in validation_report,
    not an empty object. This distinguishes "not validated" from "validation pending".

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Insert with validation_report=NULL succeeds
        - Retrieved value is NULL
    """
    cursor = db_connection.cursor()
    inserted_id = None

    try:
        # Insert block without validation report (NULL)
        cursor.execute("""
            INSERT INTO blocks (iso_code, status, tipologia, rhino_metadata, validation_report)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, validation_report
        """, (
            "TEST-020-DB-002",
            "uploaded",
            "test_concrete",
            json.dumps({}),
            None  # Explicitly NULL
        ))

        result = cursor.fetchone()
        assert result is not None, "INSERT must return a row"

        inserted_id, validation_report = result

        # Verify NULL persisted correctly
        assert validation_report is None, "validation_report must be NULL for unvalidated blocks"

        db_connection.commit()

    except Exception as e:
        db_connection.rollback()

        error_message = str(e)

        if "column" in error_message.lower() and "validation_report" in error_message.lower():
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): validation_report column missing.\n"
                f"Error: {error_message}"
            )
        else:
            raise

    finally:
        if inserted_id:
            try:
                cursor.execute("DELETE FROM blocks WHERE id = %s", (inserted_id,))
                db_connection.commit()
            except Exception:
                db_connection.rollback()

        cursor.close()


def test_gin_index_exists(db_connection: connection) -> None:
    """
    Verify GIN indexes on validation_report exist.

    This test queries PostgreSQL system catalogs to confirm:
    1. idx_blocks_validation_errors (GIN index on errors array) exists
    2. idx_blocks_validation_failed (partial index for is_valid=false) exists

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Both indexes exist in pg_indexes
    """
    cursor = db_connection.cursor()

    try:
        # Check for GIN index on errors array
        cursor.execute("""
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND tablename = 'blocks'
              AND indexname = 'idx_blocks_validation_errors'
        """)

        gin_index = cursor.fetchone()

        if gin_index is None:
            pytest.fail(
                "EXPECTED FAILURE (RED Phase): idx_blocks_validation_errors index does not exist.\n"
                "Run migration: supabase/migrations/20260211160000_add_validation_report.sql"
            )

        indexname, indexdef = gin_index
        assert "gin" in indexdef.lower(), f"Index must be GIN type, got: {indexdef}"
        assert "validation_report" in indexdef, "Index must reference validation_report column"
        assert "errors" in indexdef, "Index must reference errors field"

        # Check for partial index on is_valid=false
        cursor.execute("""
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND tablename = 'blocks'
              AND indexname = 'idx_blocks_validation_failed'
        """)

        partial_index = cursor.fetchone()

        if partial_index is None:
            pytest.fail(
                "EXPECTED FAILURE (RED Phase): idx_blocks_validation_failed index does not exist.\n"
                "Run migration: supabase/migrations/20260211160000_add_validation_report.sql"
            )

        indexname, indexdef = partial_index
        assert "where" in indexdef.lower(), "Index must be partial (have WHERE clause)"
        assert "is_valid" in indexdef, "Index must reference is_valid field"

    finally:
        cursor.close()

