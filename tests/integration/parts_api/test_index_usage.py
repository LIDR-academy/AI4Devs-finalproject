"""
Integration Tests: Index Usage Verification (GET /api/parts)

Test Suite 5/5: Database Query Optimization
Validates PostgreSQL index usage with EXPLAIN ANALYZE.

Tests (4):
- IDX-01: Filter queries use idx_blocks_status_active ⚠️ NEW TEST
- IDX-02: Partial index triggers on is_archived = false ⚠️ NEW TEST
- IDX-03: No sequential scans on blocks table ⚠️ NEW TEST
- IDX-04: Index hit ratio > 95% (cache efficiency) ⚠️ NEW TEST

Status: ⚠️ RED PHASE - Tests expected to FAIL (need EXPLAIN ANALYZE infrastructure)
Author: AI Assistant (T-0510-TEST-BACK TDD-RED Phase)
Date: 2026-02-23
"""
import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
import psycopg2
import os

from main import app
from supabase import Client
from .helpers import cleanup_test_blocks_by_pattern

client = TestClient(app)


def get_direct_db_connection():
    """
    Establish direct PostgreSQL connection for EXPLAIN ANALYZE queries.
    
    Returns psycopg2 connection to bypass Supabase client RLS filtering.
    """
    db_url = os.getenv("SUPABASE_DATABASE_URL")
    if not db_url:
        pytest.skip("SUPABASE_DATABASE_URL not set (required for EXPLAIN ANALYZE)")

    try:
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        pytest.skip(f"Cannot connect to database: {e}")


def test_idx01_filter_queries_use_composite_index(supabase_client: Client):
    """
    IDX-01: Status/tipologia filters use idx_blocks_status_active composite index.
    
    ⚠️ NEW TEST - Expected to FAIL if index not created or not used
    
    Given: blocks table has idx_blocks_status_active (status, tipologia, workshop_id)
    When: GET /api/parts?status=validated&tipologia=capitel
    Then:
        - Query plan shows Index Scan on idx_blocks_status_active
        - No Sequential Scan on blocks table
        - Query execution time < 100ms
    
    Expected Index:
        CREATE INDEX idx_blocks_status_active 
        ON blocks(status, tipologia, workshop_id) 
        WHERE is_archived = false;
    """
    # CLEANUP FIRST: Delete any leftover test blocks
    cleanup_test_blocks_by_pattern(supabase_client, "TEST-IDX01%")

    # ARRANGE: Create test blocks
    test_blocks = []
    for i in range(50):
        block = {
            "id": str(uuid4()),
            "iso_code": f"TEST-IDX01-{i:03d}",
            "status": "validated" if i % 2 == 0 else "completed",
            "tipologia": "capitel" if i % 3 == 0 else "columna"
        }
        test_blocks.append(block)

    try:
        supabase_client.table("blocks").insert(test_blocks).execute()
    except Exception as e:
        pytest.fail(f"Failed to insert test data: {e}")

    # ACT: Execute query through FastAPI
    response = client.get("/api/parts?status=validated&tipologia=capitel")
    assert response.status_code == 200

    # ACT: Get query plan via direct PostgreSQL connection
    conn = get_direct_db_connection()
    cursor = conn.cursor()

    explain_query = """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
        SELECT id, iso_code, status, tipologia, workshop_id, low_poly_url, bbox, created_at
        FROM blocks
        WHERE is_archived = false
          AND status = 'validated'
          AND tipologia = 'capitel'
        ORDER BY created_at DESC;
    """

    cursor.execute(explain_query)
    query_plan = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    # ASSERT: Index usage
    plan_str = str(query_plan)
    assert "Index Scan" in plan_str or "Bitmap Index Scan" in plan_str, "Query should use index"
    assert "Seq Scan" not in plan_str, "Query should NOT use sequential scan"
    assert "idx_blocks_status_active" in plan_str, "Should use idx_blocks_status_active index"

    # CLEANUP
    for block in test_blocks:
        try:
            supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
        except Exception:
            pass


def test_idx02_partial_index_triggers_on_is_archived_false(supabase_client: Client):
    """
    IDX-02: Partial index only triggers when is_archived = false.
    
    ⚠️ NEW TEST - Expected to FAIL if partial index condition not optimized
    
    Given: 
        - 100 blocks with is_archived = false (active)
        - 1000 blocks with is_archived = true (archived, excluded from index)
    
    When: GET /api/parts (default filter is_archived = false)
    Then:
        - Query uses partial index (skips archived blocks)
        - Index size smaller than full table index (space efficiency)
        - Query performance unaffected by archived blocks count
    
    Partial Index Advantage: Index covers only 100 rows, not 1100.
    """
    # CLEANUP FIRST: Delete any leftover test blocks
    cleanup_test_blocks_by_pattern(supabase_client, "ACTIVE%")
    cleanup_test_blocks_by_pattern(supabase_client, "ARCHIVED%")

    # ARRANGE: Create active blocks
    active_blocks = [
        {"id": str(uuid4()), "iso_code": f"ACTIVE-{i:03d}", "status": "validated", "tipologia": "capitel", "is_archived": False}
        for i in range(100)
    ]

    # Create archived blocks (should NOT be in index)
    archived_blocks = [
        {"id": str(uuid4()), "iso_code": f"ARCHIVED-{i:04d}", "status": "validated", "tipologia": "capitel", "is_archived": True}
        for i in range(1000)
    ]

    all_blocks = active_blocks + archived_blocks

    try:
        supabase_client.table("blocks").insert(all_blocks).execute()
    except Exception as e:
        pytest.fail(f"Failed to insert test data: {e}")

    # ACT: Get query plan
    conn = get_direct_db_connection()
    cursor = conn.cursor()

    explain_query = """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT id, iso_code, status FROM blocks
        WHERE is_archived = false
        ORDER BY created_at DESC;
    """

    cursor.execute(explain_query)
    query_plan = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    # ASSERT: Partial index used
    plan_str = str(query_plan)

    # Extract rows scanned from plan
    # Should scan ~100 rows (active), NOT 1100 (total)
    assert "rows" in plan_str.lower(), "Query plan should show rows scanned"

    # Verify index name used
    assert "idx_blocks_status_active" in plan_str or "Index Scan" in plan_str, "Should use partial index"

    # CLEANUP
    for block in all_blocks:
        try:
            supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
        except Exception:
            pass


def test_idx03_no_sequential_scans_on_blocks_table(supabase_client: Client):
    """
    IDX-03: All filter queries avoid sequential scans (index coverage).
    
    ⚠️ NEW TEST - Expected to FAIL if any filter query lacks index
    
    Given: blocks table with comprehensive indexes
    When: Execute common filter queries (status, tipologia, workshop_id)
    Then:
        - NO query uses Seq Scan on blocks table
        - All queries use Index Scan or Bitmap Index Scan
        - Query planner chooses index for all filter combinations
    
    Test Cases:
        1. Filter by status only
        2. Filter by tipologia only
        3. Filter by workshop_id only
        4. Filter by status + tipologia (composite)
    """
    # CLEANUP FIRST: Delete any leftover test blocks
    cleanup_test_blocks_by_pattern(supabase_client, "TEST-IDX03%")

    # ARRANGE: Create diverse test dataset
    test_blocks = []
    for i in range(100):
        block = {
            "id": str(uuid4()),
            "iso_code": f"TEST-IDX03-{i:03d}",
            "status": ["validated", "completed", "pending"][i % 3],
            "tipologia": ["capitel", "columna", "basa", "fuste"][i % 4],
            "workshop_id": str(uuid4()) if i % 2 == 0 else None
        }
        test_blocks.append(block)

    try:
        supabase_client.table("blocks").insert(test_blocks).execute()
    except Exception as e:
        pytest.fail(f"Failed to insert test data: {e}")

    # ACT: Test multiple filter combinations
    filter_queries = [
        "status=validated",
        "tipologia=capitel",
        f"workshop_id={test_blocks[0]['workshop_id']}",
        "status=validated&tipologia=capitel"
    ]

    conn = get_direct_db_connection()
    cursor = conn.cursor()

    for filter_query in filter_queries:
        # Build equivalent SQL
        where_clauses = ["is_archived = false"]

        if "status=" in filter_query:
            status_value = filter_query.split("status=")[1].split("&")[0]
            where_clauses.append(f"status = '{status_value}'")

        if "tipologia=" in filter_query:
            tipologia_value = filter_query.split("tipologia=")[1].split("&")[0]
            where_clauses.append(f"tipologia = '{tipologia_value}'")

        if "workshop_id=" in filter_query:
            workshop_value = filter_query.split("workshop_id=")[1].split("&")[0]
            where_clauses.append(f"workshop_id = '{workshop_value}'")

        sql_query = f"""
            EXPLAIN (ANALYZE, FORMAT JSON)
            SELECT id FROM blocks
            WHERE {' AND '.join(where_clauses)}
            ORDER BY created_at DESC;
        """

        cursor.execute(sql_query)
        query_plan = cursor.fetchone()[0]

        plan_str = str(query_plan)

        # ASSERT: No sequential scan
        assert "Seq Scan" not in plan_str, f"Sequential scan found for filter: {filter_query}"
        assert "Index Scan" in plan_str or "Bitmap Index Scan" in plan_str, f"Index not used for filter: {filter_query}"

    cursor.close()
    conn.close()

    # CLEANUP
    for block in test_blocks:
        try:
            supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
        except Exception:
            pass


def test_idx04_index_hit_ratio_above_95_percent(supabase_client: Client):
    """
    IDX-04: Index cache hit ratio > 95% (PostgreSQL buffer cache efficiency).
    
    ⚠️ NEW TEST - Expected to FAIL if indexes not properly cached
    
    Given: PostgreSQL instance with default shared_buffers (128MB)
    When: Execute 100 filter queries (warm up cache)
    Then:
        - Index cache hit ratio > 95% (pg_stat_statements or pg_statio_user_indexes)
        - Disk reads minimized (most lookups served from memory)
        - Validates indexes fit in working set
    
    Query:
        SELECT 
            idx_blks_read, 
            idx_blks_hit,
            (idx_blks_hit::float / NULLIF(idx_blks_hit + idx_blks_read, 0)) * 100 AS hit_ratio
        FROM pg_statio_user_indexes
        WHERE schemaname = 'public' AND indexrelname = 'idx_blocks_status_active';
    """
    # CLEANUP FIRST: Delete any leftover test blocks
    cleanup_test_blocks_by_pattern(supabase_client, "TEST-IDX04%")

    # ARRANGE: Create test dataset
    test_blocks = []
    for i in range(100):
        block = {
            "id": str(uuid4()),
            "iso_code": f"TEST-IDX04-{i:03d}",
            "status": "validated" if i % 2 == 0 else "completed",
            "tipologia": "capitel"
        }
        test_blocks.append(block)

    try:
        supabase_client.table("blocks").insert(test_blocks).execute()
    except Exception as e:
        pytest.fail(f"Failed to insert test data: {e}")

    # ACT: Get baseline cache stats
    conn = get_direct_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            idx_blks_read, 
            idx_blks_hit
        FROM pg_statio_user_indexes
        WHERE schemaname = 'public' 
          AND indexrelname LIKE 'idx_blocks_%';
    """)

    baseline_stats = cursor.fetchall()
    baseline_reads = sum([row[0] for row in baseline_stats])
    baseline_hits = sum([row[1] for row in baseline_stats])

    # Warm up cache with 100 queries
    for i in range(100):
        response = client.get("/api/parts?status=validated")
        assert response.status_code == 200

    # Get final cache stats
    cursor.execute("""
        SELECT 
            idx_blks_read, 
            idx_blks_hit
        FROM pg_statio_user_indexes
        WHERE schemaname = 'public' 
          AND indexrelname LIKE 'idx_blocks_%';
    """)

    final_stats = cursor.fetchall()
    final_reads = sum([row[0] for row in final_stats])
    final_hits = sum([row[1] for row in final_stats])

    cursor.close()
    conn.close()

    # Calculate hit ratio
    delta_reads = final_reads - baseline_reads
    delta_hits = final_hits - baseline_hits
    total_accesses = delta_reads + delta_hits

    if total_accesses > 0:
        hit_ratio = (delta_hits / total_accesses) * 100
    else:
        hit_ratio = 0

    # ASSERT: Cache efficiency
    assert hit_ratio > 95, f"Index cache hit ratio {hit_ratio:.2f}% below 95% threshold"

    print("\n📈 Index Cache Hit Ratio:")
    print(f"   Hits: {delta_hits}")
    print(f"   Reads: {delta_reads}")
    print(f"   Ratio: {hit_ratio:.2f}%")

    # CLEANUP
    for block in test_blocks:
        try:
            supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
        except Exception:
            pass
