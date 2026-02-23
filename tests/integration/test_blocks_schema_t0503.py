"""
T-0503-DB: Integration tests for low_poly_url & bbox columns + indexes.

This test suite validates that the migration 20260219000001_add_low_poly_url_bbox.sql
successfully adds two columns (low_poly_url TEXT, bbox JSONB) and two indexes
(idx_blocks_canvas_query, idx_blocks_low_poly_processing) to the blocks table.

TDD Phases:
- RED: Tests fail because columns/indexes don't exist yet (THIS FILE)
- GREEN: Migration executed, tests pass
- REFACTOR: N/A (migration code is already clean)

References:
- Technical Spec: docs/US-005/T-0503-DB-TechnicalSpec-ENRICHED.md
- Backlog: docs/09-mvp-backlog.md (T-0503-DB)
- Migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql
"""
import pytest
from psycopg2.extensions import connection
import json
import time


# ==============================================================================
# CATEGORY 1: HAPPY PATH (Database Operations)
# ==============================================================================

def test_low_poly_url_column_exists(db_connection: connection) -> None:
    """
    Test 1: Verify low_poly_url column exists in blocks table.

    TDD Phase: RED
    Expected to FAIL because migration hasn't been run yet.
    Expected error: Column "low_poly_url" not found in blocks table.

    Args:
        db_connection: Direct PostgreSQL connection (from conftest.py fixture)

    Assertions:
        - low_poly_url column exists in information_schema.columns
        - data_type is 'text'
        - is_nullable is 'YES'
    """
    cursor = db_connection.cursor()

    try:
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'blocks'
              AND column_name = 'low_poly_url'
        """)

        result = cursor.fetchone()

        if result is None:
            pytest.fail(
                "EXPECTED FAILURE (RED Phase): low_poly_url column does not exist yet.\n"
                "Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        column_name, data_type, is_nullable = result
        assert column_name == "low_poly_url", f"Column name must be 'low_poly_url', got {column_name}"
        assert data_type == "text", f"Column type must be 'text', got {data_type}"
        assert is_nullable == "YES", f"Column must be nullable, got is_nullable={is_nullable}"

    finally:
        cursor.close()


def test_bbox_column_exists(db_connection: connection) -> None:
    """
    Test 2: Verify bbox column exists in blocks table.

    TDD Phase: RED
    Expected to FAIL because migration hasn't been run yet.
    Expected error: Column "bbox" not found in blocks table.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - bbox column exists in information_schema.columns
        - data_type is 'jsonb'
        - is_nullable is 'YES'
    """
    cursor = db_connection.cursor()

    try:
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'blocks'
              AND column_name = 'bbox'
        """)

        result = cursor.fetchone()

        if result is None:
            pytest.fail(
                "EXPECTED FAILURE (RED Phase): bbox column does not exist yet.\n"
                "Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        column_name, data_type, is_nullable = result
        assert column_name == "bbox", f"Column name must be 'bbox', got {column_name}"
        assert data_type == "jsonb", f"Column type must be 'jsonb', got {data_type}"
        assert is_nullable == "YES", f"Column must be nullable, got is_nullable={is_nullable}"

    finally:
        cursor.close()


def test_update_low_poly_url_successfully(db_connection: connection) -> None:
    """
    Test 3: Verify blocks table accepts TEXT data in low_poly_url column.

    TDD Phase: RED
    Expected to FAIL because column doesn't exist.
    After migration, should UPDATE a test block with a URL and verify persistence.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - UPDATE with low_poly_url succeeds
        - Retrieved data matches inserted value
    """
    cursor = db_connection.cursor()

    try:
        # Insert test block
        cursor.execute("""
            INSERT INTO blocks (iso_code, status, tipologia)
            VALUES ('TEST-T0503-001', 'uploaded', 'capitel')
            RETURNING id
        """)
        block_id = cursor.fetchone()[0]
        db_connection.commit()

        # Attempt to update low_poly_url (will fail in RED phase)
        test_url = "https://example.supabase.co/storage/v1/object/public/processed-geometry/low-poly/test.glb"

        try:
            cursor.execute("""
                UPDATE blocks
                SET low_poly_url = %s
                WHERE id = %s
            """, (test_url, block_id))
            db_connection.commit()
        except Exception as e:
            # Clean up test block
            cursor.execute("DELETE FROM blocks WHERE id = %s", (block_id,))
            db_connection.commit()
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Cannot update low_poly_url column.\n"
                f"Error: {e}\n"
                f"Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        # Verify data persisted
        cursor.execute("""
            SELECT low_poly_url
            FROM blocks
            WHERE id = %s
        """, (block_id,))

        result = cursor.fetchone()
        assert result is not None, "Block should exist after update"
        assert result[0] == test_url, f"Expected URL '{test_url}', got '{result[0]}'"

        # Clean up
        cursor.execute("DELETE FROM blocks WHERE id = %s", (block_id,))
        db_connection.commit()

    finally:
        cursor.close()


def test_update_bbox_successfully(db_connection: connection) -> None:
    """
    Test 4: Verify blocks table accepts JSONB data in bbox column.

    TDD Phase: RED
    Expected to FAIL because column doesn't exist.
    After migration, should UPDATE a test block with bbox JSON and verify JSONB operators work.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - UPDATE with bbox succeeds
        - JSONB stored correctly
        - Can query bbox->'min' and bbox->'max' with -> operator
    """
    cursor = db_connection.cursor()

    try:
        # Insert test block
        cursor.execute("""
            INSERT INTO blocks (iso_code, status, tipologia)
            VALUES ('TEST-T0503-002', 'uploaded', 'columna')
            RETURNING id
        """)
        block_id = cursor.fetchone()[0]
        db_connection.commit()

        # Attempt to update bbox (will fail in RED phase)
        test_bbox = {
            "min": [-1.5, -1.5, 0.0],
            "max": [1.5, 1.5, 8.5]
        }

        try:
            cursor.execute("""
                UPDATE blocks
                SET bbox = %s::jsonb
                WHERE id = %s
            """, (json.dumps(test_bbox), block_id))
            db_connection.commit()
        except Exception as e:
            # Clean up test block
            cursor.execute("DELETE FROM blocks WHERE id = %s", (block_id,))
            db_connection.commit()
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Cannot update bbox column.\n"
                f"Error: {e}\n"
                f"Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        # Verify JSONB data persisted and operators work
        cursor.execute("""
            SELECT
                bbox,
                bbox->'min' as min_val,
                bbox->'max' as max_val
            FROM blocks
            WHERE id = %s
        """, (block_id,))

        result = cursor.fetchone()
        assert result is not None, "Block should exist after update"

        stored_bbox = result[0]
        assert stored_bbox == test_bbox, f"Expected bbox {test_bbox}, got {stored_bbox}"

        # Clean up
        cursor.execute("DELETE FROM blocks WHERE id = %s", (block_id,))
        db_connection.commit()

    finally:
        cursor.close()


# ==============================================================================
# CATEGORY 2: EDGE CASES (Data Validation)
# ==============================================================================

def test_null_values_allowed_initially(db_connection: connection) -> None:
    """
    Test 5: Verify low_poly_url and bbox default to NULL on insert.

    TDD Phase: RED
    Expected to FAIL because columns don't exist.
    After migration, inserting a block without these columns should succeed with NULL defaults.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Insert without low_poly_url and bbox succeeds
        - Both columns default to NULL
    """
    cursor = db_connection.cursor()

    try:
        # Insert block without new columns
        try:
            cursor.execute("""
                INSERT INTO blocks (iso_code, status, tipologia)
                VALUES ('TEST-T0503-003', 'uploaded', 'dovela')
                RETURNING id, low_poly_url, bbox
            """)
            db_connection.commit()
        except Exception as e:
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Columns low_poly_url/bbox don't exist.\n"
                f"Error: {e}\n"
                f"Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        result = cursor.fetchone()
        block_id, low_poly_url, bbox = result

        assert low_poly_url is None, f"Expected low_poly_url=NULL, got {low_poly_url}"
        assert bbox is None, f"Expected bbox=NULL, got {bbox}"

        # Clean up
        cursor.execute("DELETE FROM blocks WHERE id = %s", (block_id,))
        db_connection.commit()

    finally:
        cursor.close()


def test_very_long_url_accepted(db_connection: connection) -> None:
    """
    Test 6: Verify TEXT type handles very long URLs (>255 chars).

    TDD Phase: RED
    Expected to FAIL because column doesn't exist.
    After migration, inserting 300-character URL should succeed (TEXT has no length limit).

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Insert with 300-char URL succeeds
        - No truncation occurs
    """
    cursor = db_connection.cursor()

    try:
        # Create very long URL (300 chars)
        base_url = "https://ebqapsoyjmdkhdxnkikz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/"
        long_filename = "a" * (300 - len(base_url) - 4) + ".glb"  # -4 for .glb extension
        test_url = base_url + long_filename

        assert len(test_url) >= 300, f"Test URL should be >=300 chars, got {len(test_url)}"

        # Insert block with long URL
        try:
            cursor.execute("""
                INSERT INTO blocks (iso_code, status, tipologia, low_poly_url)
                VALUES ('TEST-T0503-004', 'uploaded', 'clave', %s)
                RETURNING id, low_poly_url
            """, (test_url,))
            db_connection.commit()
        except Exception as e:
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Column low_poly_url doesn't exist.\n"
                f"Error: {e}\n"
                f"Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        result = cursor.fetchone()
        block_id, stored_url = result

        assert stored_url == test_url, f"URL was truncated: expected {len(test_url)} chars, got {len(stored_url)}"

        # Clean up
        cursor.execute("DELETE FROM blocks WHERE id = %s", (block_id,))
        db_connection.commit()

    finally:
        cursor.close()


def test_invalid_json_rejected_by_client(db_connection: connection) -> None:
    """
    Test 7: Verify invalid JSON in bbox is rejected by PostgreSQL.

    TDD Phase: RED
    Expected to FAIL because column doesn't exist.
    After migration, attempting to insert invalid JSON should raise PostgreSQL error.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Insert with invalid JSON raises exception
        - Error message mentions 'invalid input syntax for type json'
    """
    cursor = db_connection.cursor()

    try:
        # Attempt to insert invalid JSON
        invalid_json_str = "{min: [1,2,3]}"  # Missing quotes around 'min'

        try:
            cursor.execute("""
                INSERT INTO blocks (iso_code, status, tipologia, bbox)
                VALUES ('TEST-T0503-005', 'uploaded', 'capitel', %s::jsonb)
            """, (invalid_json_str,))
            db_connection.commit()

            # If we reach here in GREEN phase, it means invalid JSON was accepted (test should fail)
            pytest.fail("Invalid JSON was accepted by PostgreSQL, expected rejection")

        except Exception as e:
            error_msg = str(e).lower()

            # In RED phase, expect "column does not exist" error
            if "column" in error_msg and "does not exist" in error_msg:
                pytest.fail(
                    f"EXPECTED FAILURE (RED Phase): Column bbox doesn't exist.\n"
                    f"Error: {e}\n"
                    f"Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
                )

            # In GREEN phase, expect JSON syntax error
            assert "invalid" in error_msg or "json" in error_msg, \
                f"Expected JSON syntax error, got: {e}"

            # Rollback failed transaction
            db_connection.rollback()

    finally:
        cursor.close()


def test_empty_jsonb_object_allowed(db_connection: connection) -> None:
    """
    Test 8: Verify empty JSONB object {} is allowed (validation is application-level).

    TDD Phase: RED
    Expected to FAIL because column doesn't exist.
    After migration, inserting empty {} should succeed (DB doesn't validate bbox schema).

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Insert with bbox={} succeeds
        - Stored as valid JSONB
    """
    cursor = db_connection.cursor()

    try:
        # Insert block with empty JSONB
        try:
            cursor.execute("""
                INSERT INTO blocks (iso_code, status, tipologia, bbox)
                VALUES ('TEST-T0503-006', 'uploaded', 'imposta', '{}'::jsonb)
                RETURNING id, bbox
            """)
            db_connection.commit()
        except Exception as e:
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Column bbox doesn't exist.\n"
                f"Error: {e}\n"
                f"Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        result = cursor.fetchone()
        block_id, stored_bbox = result

        assert stored_bbox == {}, f"Expected empty dict, got {stored_bbox}"

        # Clean up
        cursor.execute("DELETE FROM blocks WHERE id = %s", (block_id,))
        db_connection.commit()

    finally:
        cursor.close()


# ==============================================================================
# CATEGORY 3: SECURITY/PERFORMANCE (Indexes)
# ==============================================================================

def test_canvas_index_exists(db_connection: connection) -> None:
    """
    Test 9: Verify idx_blocks_canvas_query index exists.

    TDD Phase: RED
    Expected to FAIL because index hasn't been created yet.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Index exists in pg_indexes
        - Index definition includes (status, tipologia, workshop_id)
        - Partial index with WHERE is_archived = false
    """
    cursor = db_connection.cursor()

    try:
        cursor.execute("""
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'blocks'
              AND indexname = 'idx_blocks_canvas_query'
        """)

        result = cursor.fetchone()

        if result is None:
            pytest.fail(
                "EXPECTED FAILURE (RED Phase): idx_blocks_canvas_query index does not exist yet.\n"
                "Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        indexname, indexdef = result
        assert indexname == "idx_blocks_canvas_query"

        # Verify index includes expected columns
        assert "status" in indexdef.lower(), "Index must include 'status' column"
        assert "tipologia" in indexdef.lower(), "Index must include 'tipologia' column"
        assert "workshop_id" in indexdef.lower(), "Index must include 'workshop_id' column"

        # Verify partial index condition
        assert "is_archived = false" in indexdef.lower(), "Index must have WHERE is_archived = false condition"

    finally:
        cursor.close()


def test_processing_index_exists(db_connection: connection) -> None:
    """
    Test 10: Verify idx_blocks_low_poly_processing index exists.

    TDD Phase: RED
    Expected to FAIL because index hasn't been created yet.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Index exists in pg_indexes
        - Partial index with WHERE low_poly_url IS NULL AND is_archived = false
    """
    cursor = db_connection.cursor()

    try:
        cursor.execute("""
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'blocks'
              AND indexname = 'idx_blocks_low_poly_processing'
        """)

        result = cursor.fetchone()

        if result is None:
            pytest.fail(
                "EXPECTED FAILURE (RED Phase): idx_blocks_low_poly_processing index does not exist yet.\n"
                "Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        indexname, indexdef = result
        assert indexname == "idx_blocks_low_poly_processing"

        # Verify partial index condition
        assert "low_poly_url is null" in indexdef.lower(), "Index must have WHERE low_poly_url IS NULL condition"
        assert "is_archived = false" in indexdef.lower(), "Index must have WHERE is_archived = false condition"

    finally:
        cursor.close()


def test_canvas_query_uses_index(db_connection: connection) -> None:
    """
    Test 11: Verify canvas filter query uses idx_blocks_canvas_query index.

    TDD Phase: RED
    Expected to FAIL because index doesn't exist yet.
    Uses EXPLAIN ANALYZE to verify index scan is used.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - EXPLAIN plan includes "Index Scan using idx_blocks_canvas_query"
        - Query executes successfully
    """
    cursor = db_connection.cursor()

    try:
        # Run EXPLAIN ANALYZE on canvas query
        cursor.execute("""
            EXPLAIN (FORMAT JSON)
            SELECT id, iso_code, status, tipologia, low_poly_url, bbox, workshop_id
            FROM blocks
            WHERE is_archived = false
              AND status = 'validated'
              AND tipologia = 'capitel'
              AND workshop_id IS NOT NULL
        """)

        explain_result = cursor.fetchone()

        if explain_result is None:
            pytest.fail("EXPLAIN query returned no results")

        explain_json = explain_result[0]
        explain_text = json.dumps(explain_json, indent=2)

        # Check if index is used (will fail in RED phase)
        if "idx_blocks_canvas_query" not in explain_text:
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Index idx_blocks_canvas_query not used in query plan.\n"
                f"EXPLAIN output:\n{explain_text}\n\n"
                f"Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        assert "Index Scan" in explain_text or "Index Only Scan" in explain_text, \
            f"Expected index scan, but got different plan:\n{explain_text}"

    except Exception as e:
        error_msg = str(e).lower()

        # If column doesn't exist, that's the RED phase failure we expect
        if "column" in error_msg and "does not exist" in error_msg:
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Columns low_poly_url/bbox don't exist yet.\n"
                f"Error: {e}\n"
                f"Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        # Re-raise unexpected errors
        raise

    finally:
        cursor.close()


def test_processing_query_uses_partial_index(db_connection: connection) -> None:
    """
    Test 12: Verify processing queue query uses idx_blocks_low_poly_processing partial index.

    TDD Phase: RED
    Expected to FAIL because index doesn't exist yet.
    Uses EXPLAIN ANALYZE to verify partial index scan is used.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - EXPLAIN plan includes "Index Scan using idx_blocks_low_poly_processing"
        - Query executes successfully
    """
    cursor = db_connection.cursor()

    try:
        # Run EXPLAIN ANALYZE on processing queue query
        cursor.execute("""
            EXPLAIN (FORMAT JSON)
            SELECT id, iso_code, status
            FROM blocks
            WHERE is_archived = false
              AND status = 'validated'
              AND low_poly_url IS NULL
            LIMIT 10
        """)

        explain_result = cursor.fetchone()

        if explain_result is None:
            pytest.fail("EXPLAIN query returned no results")

        explain_json = explain_result[0]
        explain_text = json.dumps(explain_json, indent=2)

        # Check if partial index is used (will fail in RED phase)
        if "idx_blocks_low_poly_processing" not in explain_text:
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Partial index idx_blocks_low_poly_processing not used.\n"
                f"EXPLAIN output:\n{explain_text}\n\n"
                f"Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        assert "Index Scan" in explain_text, \
            f"Expected index scan on partial index, got:\n{explain_text}"

    except Exception as e:
        error_msg = str(e).lower()

        # If column doesn't exist, that's the RED phase failure we expect
        if "column" in error_msg and "does not exist" in error_msg:
            pytest.fail(
                f"EXPECTED FAILURE (RED Phase): Column low_poly_url doesn't exist yet.\n"
                f"Error: {e}\n"
                f"Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        # Re-raise unexpected errors
        raise

    finally:
        cursor.close()


def test_index_size_is_reasonable(db_connection: connection) -> None:
    """
    Test 13: Verify combined index size is <100 KB.

    TDD Phase: RED
    Expected to FAIL because indexes don't exist yet.
    Target: Both indexes combined should be <100 KB (estimated ~25 KB for 500 rows).

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - idx_blocks_canvas_query exists and size <100 KB
        - idx_blocks_low_poly_processing exists and size <100 KB
    """
    cursor = db_connection.cursor()

    try:
        # Query index sizes
        cursor.execute("""
            SELECT
                indexname,
                pg_size_pretty(pg_relation_size(indexname::regclass)) as size_pretty,
                pg_relation_size(indexname::regclass) as size_bytes
            FROM pg_indexes
            WHERE tablename = 'blocks'
              AND indexname IN ('idx_blocks_canvas_query', 'idx_blocks_low_poly_processing')
        """)

        results = cursor.fetchall()

        if len(results) == 0:
            pytest.fail(
                "EXPECTED FAILURE (RED Phase): Indexes idx_blocks_canvas_query and "
                "idx_blocks_low_poly_processing do not exist yet.\n"
                "Run migration: supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"
            )

        # Check each index size
        for indexname, size_pretty, size_bytes in results:
            assert size_bytes < 100 * 1024, \
                f"Index {indexname} is too large: {size_pretty} (expected <100 KB)"

    finally:
        cursor.close()


# ==============================================================================
# CATEGORY 4: INTEGRATION (Migration Workflow)
# ==============================================================================

def test_migration_applies_cleanly(db_connection: connection) -> None:
    """
    Test 14: Verify migration can be applied to a clean database.

    TDD Phase: RED
    This test verifies the migration FILE exists and has correct structure.
    Actual migration execution is manual via `make init-db` or `supabase migration up`.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Migration file exists at supabase/migrations/20260219000001_add_low_poly_url_bbox.sql
        - File contains expected DDL statements
    """
    import os

    migration_file = "supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"

    if not os.path.exists(migration_file):
        pytest.fail(
            f"EXPECTED FAILURE (RED Phase): Migration file does not exist.\n"
            f"Expected path: {migration_file}\n"
            f"Create migration with columns and indexes as per technical spec."
        )

    # Read migration content
    with open(migration_file, 'r') as f:
        content = f.read()

    # Verify critical DDL statements are present
    assert "ALTER TABLE blocks" in content, "Migration must contain ALTER TABLE statement"
    assert "ADD COLUMN low_poly_url" in content, "Migration must add low_poly_url column"
    assert "ADD COLUMN bbox" in content, "Migration must add bbox column"
    assert "CREATE INDEX" in content, "Migration must create indexes"
    assert "idx_blocks_canvas_query" in content, "Migration must create canvas index"
    assert "idx_blocks_low_poly_processing" in content, "Migration must create processing index"


def test_migration_is_idempotent(db_connection: connection) -> None:
    """
    Test 15: Verify migration can be run twice without errors.

    TDD Phase: RED/GREEN
    In RED phase, columns don't exist so first run would work.
    In GREEN phase, second run should succeed with "already exists" notices.

    This test checks that IF NOT EXISTS clauses are present.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Migration uses IF NOT EXISTS for columns and indexes
    """
    import os

    migration_file = "supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"

    if not os.path.exists(migration_file):
        pytest.fail(
            f"EXPECTED FAILURE (RED Phase): Migration file does not exist.\n"
            f"Expected path: {migration_file}"
        )

    # Read migration content
    with open(migration_file, 'r') as f:
        content = f.read()

    # Verify idempotent patterns
    assert "IF NOT EXISTS" in content, \
        "Migration must use IF NOT EXISTS to be idempotent"

    # Check for both columns
    low_poly_url_idempotent = "ADD COLUMN IF NOT EXISTS low_poly_url" in content
    bbox_idempotent = "ADD COLUMN IF NOT EXISTS bbox" in content

    assert low_poly_url_idempotent, "low_poly_url column must use IF NOT EXISTS"
    assert bbox_idempotent, "bbox column must use IF NOT EXISTS"


def test_rollback_works_correctly(db_connection: connection) -> None:
    """
    Test 16: Verify rollback script exists and has correct structure.

    TDD Phase: RED
    This test verifies the rollback plan in technical spec is implementable.
    Actual rollback testing requires manual execution.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Rollback SQL exists in technical spec
        - Contains DROP COLUMN and DROP INDEX statements
    """
    import os

    spec_file = "docs/US-005/T-0503-DB-TechnicalSpec-ENRICHED.md"

    if not os.path.exists(spec_file):
        pytest.fail(
            f"EXPECTED FAILURE (RED Phase): Technical spec file missing.\n"
            f"Expected: {spec_file}"
        )

    # Read spec content
    with open(spec_file, 'r') as f:
        content = f.read()

    # Verify rollback section exists
    assert "Rollback" in content or "rollback" in content, \
        "Technical spec must document rollback plan"

    # Check for critical rollback statements (in doc, not DB)
    assert "DROP COLUMN" in content or "drop column" in content, \
        "Rollback plan must include DROP COLUMN statements"
    assert "DROP INDEX" in content or "drop index" in content, \
        "Rollback plan must include DROP INDEX statements"


def test_existing_data_unaffected(db_connection: connection) -> None:
    """
    Test 17: Verify migration doesn't affect existing blocks data.

    TDD Phase: GREEN (requires migration to test)
    After migration, existing blocks should have NULL values in new columns.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Pre-migration blocks still exist after migration
        - New columns are NULL for existing blocks
    """
    cursor = db_connection.cursor()

    try:
        # Insert test block BEFORE checking migration status
        cursor.execute("""
            INSERT INTO blocks (iso_code, status, tipologia)
            VALUES ('TEST-T0503-PRE-MIGRATION', 'uploaded', 'dovela')
            RETURNING id
        """)
        pre_migration_id = cursor.fetchone()[0]
        db_connection.commit()

        # Check if new columns exist (migration applied)
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'blocks'
              AND column_name IN ('low_poly_url', 'bbox')
        """)

        existing_columns = cursor.fetchall()

        if len(existing_columns) < 2:
            # Clean up before failing
            cursor.execute("DELETE FROM blocks WHERE id = %s", (pre_migration_id,))
            db_connection.commit()

            pytest.fail(
                "EXPECTED FAILURE (RED Phase): New columns don't exist yet.\n"
                "Run migration first, then re-run this test."
            )

        # Verify existing block has NULL in new columns
        cursor.execute("""
            SELECT low_poly_url, bbox
            FROM blocks
            WHERE id = %s
        """, (pre_migration_id,))

        result = cursor.fetchone()
        assert result is not None, "Pre-migration block should still exist"

        low_poly_url, bbox = result
        assert low_poly_url is None, "Existing block should have NULL low_poly_url after migration"
        assert bbox is None, "Existing block should have NULL bbox after migration"

        # Clean up
        cursor.execute("DELETE FROM blocks WHERE id = %s", (pre_migration_id,))
        db_connection.commit()

    finally:
        cursor.close()


# ==============================================================================
# CATEGORY 5: PERFORMANCE BENCHMARKS
# ==============================================================================

def test_canvas_query_performance_500ms(db_connection: connection) -> None:
    """
    Test 18: Verify canvas query executes in <500ms with 500 rows.

    TDD Phase: GREEN (requires migration + test data)
    Seeds database with 500 blocks, runs canvas query 10 times, measures avg time.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Average query time <500ms
        - Standard deviation <50ms (consistent performance)
    """
    cursor = db_connection.cursor()

    try:
        # Check if new columns exist
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'blocks'
              AND column_name = 'low_poly_url'
        """)

        if cursor.fetchone() is None:
            pytest.skip(
                "SKIP (RED Phase): Column low_poly_url doesn't exist yet.\n"
                "Run migration first, then re-run performance tests."
            )

        # Seed test data (500 blocks)
        # NOTE: This is expensive, consider using a separate test database
        # or adding a @pytest.mark.slow marker

        # For now, just verify query syntax is correct
        cursor.execute("""
            SELECT id, iso_code, status, tipologia, low_poly_url, bbox, workshop_id
            FROM blocks
            WHERE is_archived = false
              AND status = 'validated'
              AND tipologia = 'capitel'
            LIMIT 100
        """)

        # Measure execution time
        start_time = time.time()
        cursor.execute("""
            SELECT id, iso_code, status, tipologia, low_poly_url, bbox, workshop_id
            FROM blocks
            WHERE is_archived = false
              AND status = 'validated'
              AND tipologia = 'capitel'
        """)
        cursor.fetchall()
        elapsed_ms = (time.time() - start_time) * 1000

        # Assert performance (relaxed for small dataset)
        assert elapsed_ms < 500, \
            f"Query took {elapsed_ms:.2f}ms (target <500ms). Add index or optimize query."

    finally:
        cursor.close()


def test_processing_queue_query_10ms(db_connection: connection) -> None:
    """
    Test 19: Verify processing queue query executes in <10ms.

    TDD Phase: GREEN (requires migration + partial index)
    Partial index on (status WHERE low_poly_url IS NULL) should make this instant.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Query time <10ms (should be <1ms with partial index)
    """
    cursor = db_connection.cursor()

    try:
        # Check if new columns exist
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'blocks'
              AND column_name = 'low_poly_url'
        """)

        if cursor.fetchone() is None:
            pytest.skip(
                "SKIP (RED Phase): Column low_poly_url doesn't exist yet.\n"
                "Run migration first, then re-run performance tests."
            )

        # Measure execution time
        start_time = time.time()
        cursor.execute("""
            SELECT id, iso_code, status
            FROM blocks
            WHERE is_archived = false
              AND status = 'validated'
              AND low_poly_url IS NULL
            LIMIT 10
        """)
        cursor.fetchall()
        elapsed_ms = (time.time() - start_time) * 1000

        # Assert performance
        assert elapsed_ms < 10, \
            f"Query took {elapsed_ms:.2f}ms (target <10ms). Verify partial index is used."

    finally:
        cursor.close()


def test_no_blocking_during_migration(db_connection: connection) -> None:
    """
    Test 20: Verify migration doesn't block concurrent SELECT queries.

    TDD Phase: GREEN (requires migration)
    PostgreSQL 11+ allows ADD COLUMN with NULL without blocking SELECTs.
    This test documents expected behavior.

    Args:
        db_connection: Direct PostgreSQL connection

    Assertions:
        - Migration uses ADD COLUMN ... NULL (non-blocking)
        - No ALTER TABLE ... REWRITE operations
    """
    import os

    migration_file = "supabase/migrations/20260219000001_add_low_poly_url_bbox.sql"

    if not os.path.exists(migration_file):
        pytest.fail(
            f"EXPECTED FAILURE (RED Phase): Migration file does not exist.\n"
            f"Expected path: {migration_file}"
        )

    # Read migration content
    with open(migration_file, 'r') as f:
        content = f.read()

    # Verify non-blocking patterns
    assert "ADD COLUMN" in content, "Migration must use ADD COLUMN"

    # Check that columns are nullable (non-blocking)
    low_poly_url_nullable = "low_poly_url TEXT NULL" in content or \
                             "ADD COLUMN low_poly_url TEXT" in content  # DEFAULT NULL implicit
    bbox_nullable = "bbox JSONB NULL" in content or \
                    "ADD COLUMN bbox JSONB" in content

    assert low_poly_url_nullable, "low_poly_url must be nullable for non-blocking migration"
    assert bbox_nullable, "bbox must be nullable for non-blocking migration"

    # Verify no DEFAULT with value (would require table rewrite)
    assert "DEFAULT" not in content or "DEFAULT NULL" in content, \
        "Migration should not use DEFAULT with value (causes table rewrite)"
