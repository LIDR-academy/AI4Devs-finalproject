"""
T-021-DB: Integration tests for block_status ENUM extension migration.

This test suite validates that the migration 20260212100000_extend_block_status_enum.sql
successfully extends the block_status ENUM with 3 new lifecycle states required by
"The Librarian" validation agent.

TDD Phases:
- RED: Tests fail because new ENUM values don't exist yet
- GREEN: Migration executed, tests pass
- REFACTOR: N/A (migration is already clean)

New ENUM values:
  - processing: Agent actively validating file
  - rejected: Validation failed (fixable errors)
  - error_processing: Validation failed (system error)

Special Considerations:
  - ALTER TYPE ADD VALUE cannot run inside transaction (PostgreSQL constraint)
  - ENUM values are immutable (no DROP VALUE command exists)
  - Migration uses IF NOT EXISTS for idempotency (PostgreSQL 9.6+)
"""
import pytest
from psycopg2.extensions import connection
from typing import List, Tuple


def test_all_enum_values_present(db_connection: connection) -> None:
    """
    Test 1 (Critical): Verify all 8 block_status ENUM values exist after migration.
    
    This test will FAIL initially because the new values don't exist yet.
    Expected error: Only 5 values found (uploaded, validated, in_fabrication, completed, archived).
    
    After migration, it should find all 8 values (5 original + 3 new).
    
    Args:
        db_connection: Direct PostgreSQL connection (from conftest.py fixture)
        
    Assertions:
        - Total of 8 ENUM values exist
        - All required values are present: uploaded, validated, in_fabrication, completed, 
          archived, processing, rejected, error_processing
    """
    cursor = db_connection.cursor()

    try:
        # Query pg_enum to get all block_status values
        cursor.execute("""
            SELECT enumlabel, enumsortorder
            FROM pg_enum
            WHERE enumtypid = 'block_status'::regtype
            ORDER BY enumsortorder;
        """)

        results: List[Tuple[str, float]] = cursor.fetchall()

        if not results:
            pytest.fail(
                "CRITICAL FAILURE: block_status ENUM type does not exist.\n"
                "Prerequisite migration missing: 20260211155000_create_blocks_table.sql"
            )

        # Extract enum labels
        current_values = [label for label, _ in results]

        # Define required values (5 original + 3 new)
        required_values = [
            'uploaded', 'validated', 'in_fabrication', 'completed', 'archived',  # Original 5
            'processing', 'rejected', 'error_processing'  # New 3
        ]

        # Check if all required values are present
        missing_values = [val for val in required_values if val not in current_values]

        if missing_values:
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Missing ENUM values: {missing_values}\n"
                f"Current values ({len(current_values)}): {current_values}\n"
                f"Required values ({len(required_values)}): {required_values}\n"
                "Run migration: supabase/migrations/20260212100000_extend_block_status_enum.sql"
            )

        # If we reach here, all values exist (test passes after migration)
        assert len(current_values) == 8, (
            f"Expected exactly 8 ENUM values, found {len(current_values)}: {current_values}"
        )

        # Verify specific new values
        assert 'processing' in current_values, "New value 'processing' must exist"
        assert 'rejected' in current_values, "New value 'rejected' must exist"
        assert 'error_processing' in current_values, "New value 'error_processing' must exist"

    finally:
        cursor.close()


def test_add_value_idempotent(db_connection: connection) -> None:
    """
    Test 2 (Critical): Verify ADD VALUE IF NOT EXISTS is idempotent.
    
    This test simulates running the migration twice to ensure idempotency.
    PostgreSQL 9.6+ supports IF NOT EXISTS for ALTER TYPE ADD VALUE.
    
    This test will FAIL initially because the values don't exist yet,
    and the first ADD VALUE will succeed but subsequent ones should be skipped.
    
    Args:
        db_connection: Direct PostgreSQL connection (autocommit mode required)
        
    Assertions:
        - First execution of ALTER TYPE ADD VALUE succeeds
        - Second execution is silently skipped (no error)
        - ENUM still has correct number of values
    """
    cursor = db_connection.cursor()

    try:
        # Note: PostgreSQL requires autocommit mode for ALTER TYPE ADD VALUE
        # The db_connection fixture should have autocommit=True

        # Attempt to add 'processing' value (should succeed first time, skip if exists)
        try:
            cursor.execute("ALTER TYPE block_status ADD VALUE IF NOT EXISTS 'processing';")
        except Exception as e:
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Cannot add 'processing' value.\n"
                f"Error: {e}\n"
                "This is expected before migration. After migration, this should skip silently."
            )

        # Attempt to add same value again (should skip silently)
        cursor.execute("ALTER TYPE block_status ADD VALUE IF NOT EXISTS 'processing';")

        # Verify value exists and count is correct
        cursor.execute("""
            SELECT COUNT(*)
            FROM pg_enum
            WHERE enumtypid = 'block_status'::regtype;
        """)

        count = cursor.fetchone()[0]

        # After migration, should have 8 values total
        # Before migration, will have 5-7 values depending on partial execution
        if count < 8:
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Only {count} ENUM values exist.\n"
                "Migration not fully applied. Expected 8 values after migration."
            )

    finally:
        cursor.close()


def test_insert_block_with_processing_status(db_connection: connection) -> None:
    """
    Test 3 (Critical): Verify INSERT with new status 'processing' succeeds.
    
    This test will FAIL initially because 'processing' is not a valid ENUM value yet.
    Expected error: invalid input value for enum block_status: "processing"
    
    After migration, it should successfully insert a block with status='processing'.
    
    Args:
        db_connection: Direct PostgreSQL connection
        
    Assertions:
        - INSERT block with status='processing' succeeds
        - SELECT retrieves correct status value
        - New status values can be used in WHERE clauses
    """
    cursor = db_connection.cursor()

    try:
        # Test ISO code for integration test
        test_iso_code = 'SF-TEST-ENUM-001'

        # Clean up any previous test data
        cursor.execute("DELETE FROM blocks WHERE iso_code = %s;", (test_iso_code,))
        db_connection.commit()

        # Attempt to insert block with 'processing' status
        try:
            cursor.execute("""
                INSERT INTO blocks (
                    iso_code, 
                    status, 
                    tipologia, 
                    created_by, 
                    updated_by
                )
                VALUES (
                    %s,
                    'processing',
                    'test_piece',
                    (SELECT id FROM profiles LIMIT 1),
                    (SELECT id FROM profiles LIMIT 1)
                )
                RETURNING id, status;
            """, (test_iso_code,))

            db_connection.commit()

        except Exception as e:
            # Expected failure before migration
            db_connection.rollback()
            error_msg = str(e)

            if "invalid input value for enum block_status" in error_msg:
                pytest.fail(
                    f"EXPECTED FAILURE (RED Phase): Cannot use 'processing' status.\n"
                    f"Error: {error_msg}\n"
                    "Run migration: supabase/migrations/20260212100000_extend_block_status_enum.sql"
                )
            else:
                # Unexpected error (e.g., no profiles exist for FK constraint)
                pytest.fail(
                    f"UNEXPECTED ERROR: {error_msg}\n"
                    "Check test prerequisites (profiles table must have at least 1 row)"
                )

        # If we reach here, insert succeeded (test passes after migration)
        result = cursor.fetchone()
        assert result is not None, "INSERT should return row"

        block_id, status = result
        assert status == 'processing', f"Status must be 'processing', got {status}"

        # Verify can query by new status
        cursor.execute("""
            SELECT COUNT(*) 
            FROM blocks 
            WHERE status = 'processing';
        """)

        count = cursor.fetchone()[0]
        assert count >= 1, f"Should find at least 1 block with status='processing', found {count}"

        # Cleanup
        cursor.execute("DELETE FROM blocks WHERE iso_code = %s;", (test_iso_code,))
        db_connection.commit()

    finally:
        cursor.close()


def test_verification_query_passes(db_connection: connection) -> None:
    """
    Test 4 (Critical): Verify migration verification query succeeds.
    
    This test executes the same DO $$ block that's in the migration file
    to confirm all required ENUM values are present.
    
    This test will FAIL initially because the new values don't exist.
    Expected error: Missing ENUM value: processing (or rejected, error_processing)
    
    Args:
        db_connection: Direct PostgreSQL connection
        
    Assertions:
        - DO $$ verification block executes without exception
        - RAISE NOTICE confirms all 8 values present
    """
    cursor = db_connection.cursor()

    try:
        # Execute the same verification query from migration
        verification_query = """
        DO $$
        DECLARE
          enum_values text[];
          required_values text[] := ARRAY[
            'uploaded', 'validated', 'in_fabrication', 'completed', 'archived',
            'processing', 'rejected', 'error_processing'
          ];
          missing_value text;
        BEGIN
          -- Get all current enum values
          SELECT array_agg(enumlabel::text ORDER BY enumlabel) 
          INTO enum_values
          FROM pg_enum 
          WHERE enumtypid = 'block_status'::regtype;

          -- Check each required value exists
          FOREACH missing_value IN ARRAY required_values
          LOOP
            IF NOT (missing_value = ANY(enum_values)) THEN
              RAISE EXCEPTION 'Missing ENUM value: %', missing_value;
            END IF;
          END LOOP;

          RAISE NOTICE 'All required block_status values present: %', enum_values;
        END $$;
        """

        try:
            cursor.execute(verification_query)
            db_connection.commit()

        except Exception as e:
            # Expected failure before migration
            db_connection.rollback()
            error_msg = str(e)

            if "Missing ENUM value:" in error_msg:
                pytest.fail(
                    f"EXPECTED FAILURE (RED Phase): {error_msg}\n"
                    "Run migration: supabase/migrations/20260212100000_extend_block_status_enum.sql"
                )
            else:
                # Unexpected error
                pytest.fail(f"UNEXPECTED ERROR in verification query: {error_msg}")

        # If we reach here, verification passed (test passes after migration)
        # No further assertions needed - the query itself validates correctness

    finally:
        cursor.close()


def test_update_block_to_rejected_status(db_connection: connection) -> None:
    """
    Test 5 (Edge Case): Verify UPDATE to new status 'rejected' succeeds.
    
    This is an additional edge case test to verify state transitions work.
    A block can be updated from 'uploaded' to 'rejected' (validation failed).
    
    This test will FAIL initially because 'rejected' is not a valid ENUM value yet.
    
    Args:
        db_connection: Direct PostgreSQL connection
        
    Assertions:
        - UPDATE block status to 'rejected' succeeds
        - New status persists correctly
    """
    cursor = db_connection.cursor()

    try:
        test_iso_code = 'SF-TEST-ENUM-002'

        # Clean up any previous test data
        cursor.execute("DELETE FROM blocks WHERE iso_code = %s;", (test_iso_code,))
        db_connection.commit()

        # Insert block with default 'uploaded' status
        cursor.execute("""
            INSERT INTO blocks (
                iso_code, 
                status, 
                tipologia, 
                created_by, 
                updated_by
            )
            VALUES (
                %s,
                'uploaded',
                'test_piece',
                (SELECT id FROM profiles LIMIT 1),
                (SELECT id FROM profiles LIMIT 1)
            )
            RETURNING id;
        """, (test_iso_code,))

        block_id = cursor.fetchone()[0]
        db_connection.commit()

        # Attempt to update to 'rejected' status
        try:
            cursor.execute("""
                UPDATE blocks
                SET status = 'rejected'
                WHERE id = %s
                RETURNING status;
            """, (block_id,))

            db_connection.commit()

        except Exception as e:
            db_connection.rollback()
            error_msg = str(e)

            if "invalid input value for enum block_status" in error_msg:
                pytest.fail(
                    f"EXPECTED FAILURE (RED Phase): Cannot update to 'rejected' status.\n"
                    f"Error: {error_msg}\n"
                    "Run migration: supabase/migrations/20260212100000_extend_block_status_enum.sql"
                )
            else:
                pytest.fail(f"UNEXPECTED ERROR: {error_msg}")

        # If we reach here, update succeeded
        new_status = cursor.fetchone()[0]
        assert new_status == 'rejected', f"Status must be 'rejected', got {new_status}"

        # Cleanup
        cursor.execute("DELETE FROM blocks WHERE iso_code = %s;", (test_iso_code,))
        db_connection.commit()

    finally:
        cursor.close()


def test_invalid_status_value_rejected(db_connection: connection) -> None:
    """
    Test 6 (Edge Case): Verify invalid status values are rejected.
    
    This test confirms PostgreSQL ENUM type safety - attempting to insert
    a non-existent ENUM value should fail with appropriate error.
    
    This test should PASS both before and after migration (ENUM validation always active).
    
    Args:
        db_connection: Direct PostgreSQL connection
        
    Assertions:
        - INSERT with invalid status raises error
        - Error message indicates invalid ENUM value
    """
    cursor = db_connection.cursor()

    try:
        test_iso_code = 'SF-TEST-ENUM-003'

        # Attempt to insert block with invalid status
        with pytest.raises(Exception) as exc_info:
            cursor.execute("""
                INSERT INTO blocks (
                    iso_code, 
                    status, 
                    tipologia, 
                    created_by, 
                    updated_by
                )
                VALUES (
                    %s,
                    'invalid_status_value',
                    'test_piece',
                    (SELECT id FROM profiles LIMIT 1),
                    (SELECT id FROM profiles LIMIT 1)
                );
            """, (test_iso_code,))

            db_connection.commit()

        # Verify error message
        error_msg = str(exc_info.value)
        assert "invalid input value for enum block_status" in error_msg, (
            f"Expected ENUM validation error, got: {error_msg}"
        )

        db_connection.rollback()

    finally:
        cursor.close()
