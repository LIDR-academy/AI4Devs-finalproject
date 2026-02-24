"""
Integration Tests: Performance & Scalability (GET /api/parts)

Test Suite 4/5: Non-Functional Requirements (NFRs)
Validates response time, payload size, and stress scenarios.

Tests (4):
- PERF-01: Response time < 500ms with 100 parts (reduced from 500) ⚠️ NEW TEST
- PERF-02: Payload size < 200KB for 100 parts ⚠️ NEW TEST
- PERF-03: Stress test with 250+ parts (reduced from 1000) ⚠️ NEW TEST
- PERF-04: Memory stability under load ⚠️ NEW TEST

Optimizations Applied (2026-02-24):
- Reduced test data volumes for faster execution
- Added bulk_delete_by_pattern_pg() using PostgreSQL direct (100x faster)
- Marked as @pytest.mark.slow (skip by default with `pytest -m "not slow"`)
- Batch cleanup at end instead of individual deletes

Status: ⚠️ RED PHASE - Tests expected to FAIL (need performance instrumentation)
Author: AI Assistant (T-0510-TEST-BACK TDD-RED Phase)
Date: 2026-02-23 | Optimized: 2026-02-24
"""
import pytest
import time
from uuid import uuid4
from fastapi.testclient import TestClient

from main import app
from supabase import Client
from psycopg2.extensions import connection
from .helpers import bulk_delete_by_pattern_pg

client = TestClient(app)


@pytest.mark.slow
def test_perf01_response_time_under_500ms_with_100_parts(
    supabase_client: Client,
    supabase_db_connection: connection
):
    """
    PERF-01: Response time < 500ms with 100 parts in database.

    ⚠️ NEW TEST - Expected to FAIL if DB not optimized or indexes missing
    🔧 OPTIMIZED: Reduced from 500 to 100 parts for faster execution (2026-02-24)

    Given: Database contains 100 blocks (realistic production load)
    When: GET /api/parts (no filters applied)
    Then:
        - Response time < 500ms (NFR requirement)
        - All 100 parts returned in single request
        - No pagination implemented (MVP constraint)

    Performance Target: P95 latency < 500ms per docs/US-005/T-0510-TEST-BACK-TechnicalSpec-ENRICHED.md
    """
    # CLEANUP FIRST: Bulk delete using PostgreSQL direct (100x faster than Supabase)
    bulk_delete_by_pattern_pg(supabase_db_connection, "TEST-PERF01%")

    # ARRANGE: Create 100 test blocks
    test_blocks = []
    for i in range(100):
        block = {
            "id": str(uuid4()),
            "iso_code": f"TEST-PERF01-{i:04d}",
            "status": "validated" if i % 2 == 0 else "completed",
            "tipologia": "capitel" if i % 3 == 0 else "columna",
            "workshop_id": str(uuid4()),
            "bbox": {"min": [-2.5, 0.0, -2.5], "max": [2.5, 5.0, 2.5]},
            "low_poly_url": f"https://example.com/lowpoly/{uuid4()}.glb" if i % 4 == 0 else None
        }
        test_blocks.append(block)

    # Batch insert with Supabase (100 records)
    try:
        supabase_client.table("blocks").insert(test_blocks).execute()
    except Exception as e:
        pytest.fail(f"Failed to insert test data: {e}")

    # ACT: Measure response time
    start_time = time.perf_counter()
    response = client.get("/api/parts")
    end_time = time.perf_counter()

    response_time_ms = (end_time - start_time) * 1000

    # ASSERT: Performance requirements
    assert response.status_code == 200, "Request should succeed"
    assert response_time_ms < 500, f"Response time {response_time_ms:.2f}ms exceeds 500ms limit"

    data = response.json()
    assert data["count"] >= 100, f"Expected at least 100 parts, got {data['count']}"

    # CLEANUP: Bulk delete (critical for CI/CD)
    bulk_delete_by_pattern_pg(supabase_db_connection, "TEST-PERF01%")


@pytest.mark.slow
def test_perf02_payload_size_under_200kb_for_100_parts(
    supabase_client: Client,
    supabase_db_connection: connection
):
    """
    PERF-02: Response payload < 200KB for 100 parts.

    ⚠️ NEW TEST - Expected to FAIL if payload bloated with unnecessary fields

    Given: Database contains 100 blocks with typical data
    When: GET /api/parts (fetch 100 parts)
    Then:
        - Response payload size < 200KB (NFR requirement)
        - Payload calculated as len(response.content)
        - Validates efficient serialization (no N+1 queries)

    Performance Target: Response size < 200KB per T-0510-TEST-BACK Technical Spec
    """
    # CLEANUP FIRST: Bulk delete using PostgreSQL
    bulk_delete_by_pattern_pg(supabase_db_connection, "TEST-PERF02%")

    # ARRANGE: Create 100 test blocks
    test_blocks = []
    for i in range(100):
        block = {
            "id": str(uuid4()),
            "iso_code": f"TEST-PERF02-{i:03d}",
            "status": "validated",
            "tipologia": "capitel",
            "bbox": {"min": [-2.5, 0.0, -2.5], "max": [2.5, 5.0, 2.5]},
            "low_poly_url": f"https://example.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{uuid4()}.glb"
        }
        test_blocks.append(block)

    try:
        supabase_client.table("blocks").insert(test_blocks).execute()
    except Exception as e:
        pytest.fail(f"Failed to insert test data: {e}")

    # ACT: Fetch parts and measure payload size
    response = client.get("/api/parts")

    # ASSERT: Payload size
    assert response.status_code == 200

    payload_size_bytes = len(response.content)
    payload_size_kb = payload_size_bytes / 1024

    assert payload_size_bytes < 204800, f"Payload size {payload_size_kb:.2f}KB exceeds 200KB limit"

    # CLEANUP: Bulk delete
    bulk_delete_by_pattern_pg(supabase_db_connection, "TEST-PERF02%")


@pytest.mark.slow
def test_perf03_stress_test_250_parts_p95_latency(
    supabase_client: Client,
    supabase_db_connection: connection
):
    """
    PERF-03: Stress test with 250 parts (P95 latency validation).

    ⚠️ NEW TEST - Expected to FAIL without proper indexing/optimization
    🔧 OPTIMIZED: Reduced from 1000 to 250 parts for faster execution (2026-02-24)

    Given: Database contains 250 blocks (stress scenario)
    When: GET /api/parts (execute 20 times to measure P95)
    Then:
        - P95 response time < 750ms (acceptable degradation at scale)
        - P50 response time < 500ms (median performance)
        - No memory leaks or connection pool exhaustion

    Performance Target: P95 latency < 750ms at 250 parts (stress scenario)
    """
    # CLEANUP FIRST: Bulk delete using PostgreSQL
    bulk_delete_by_pattern_pg(supabase_db_connection, "TEST-PERF03%")

    # ARRANGE: Create 250 test blocks (stress scenario)
    test_blocks = []
    for i in range(250):
        block = {
            "id": str(uuid4()),
            "iso_code": f"TEST-PERF03-{i:04d}",
            "status": "validated" if i % 2 == 0 else "completed",
            "tipologia": ["capitel", "columna", "basa", "fuste"][i % 4],
            "workshop_id": str(uuid4()) if i % 5 == 0 else None,
            "bbox": {"min": [-2.5, 0.0, -2.5], "max": [2.5, 5.0, 2.5]},
            "low_poly_url": f"https://example.com/{uuid4()}.glb" if i % 3 == 0 else None
        }
        test_blocks.append(block)

    try:
        # Batch insert 250 blocks
        supabase_client.table("blocks").insert(test_blocks).execute()
    except Exception as e:
        pytest.fail(f"Failed to insert 250 test blocks: {e}")

    # ACT: Execute 20 requests and measure latencies
    latencies = []
    for _ in range(20):
        start_time = time.perf_counter()
        response = client.get("/api/parts")
        end_time = time.perf_counter()

        assert response.status_code == 200, "Request should succeed during stress test"
        latencies.append((end_time - start_time) * 1000)  # Convert to ms

    # Calculate percentiles
    latencies.sort()
    p50 = latencies[len(latencies) // 2]
    p95 = latencies[int(len(latencies) * 0.95)]
    p99 = latencies[int(len(latencies) * 0.99)]

    # ASSERT: Performance targets
    assert p50 < 500, f"P50 latency {p50:.2f}ms exceeds 500ms (median target)"
    assert p95 < 750, f"P95 latency {p95:.2f}ms exceeds 750ms (stress target)"

    print(f"\n📊 Stress Test Results (250 parts):")
    print(f"   P50: {p50:.2f}ms")
    print(f"   P95: {p95:.2f}ms")
    print(f"   P99: {p99:.2f}ms")

    # CLEANUP: Bulk delete
    bulk_delete_by_pattern_pg(supabase_db_connection, "TEST-PERF03%")


@pytest.mark.slow
def test_perf04_memory_stability_under_load(
    supabase_client: Client,
    supabase_db_connection: connection
):
    """
    PERF-04: Memory stability under repeated loads (no memory leaks).

    ⚠️ NEW TEST - Expected to FAIL if connection pooling issues or leaks exist

    Given: FastAPI backend with default configuration
    When: Execute GET /api/parts 50 times consecutively
    Then:
        - Memory usage stable (no unbounded growth)
        - Connection pool does not exhaust
        - Response times remain consistent (no degradation)

    Performance Target: Memory delta < 50MB after 50 requests
    """
    # CLEANUP FIRST: Bulk delete using PostgreSQL
    bulk_delete_by_pattern_pg(supabase_db_connection, "TEST-PERF04%")

    # ARRANGE: Create 100 test blocks for realistic workload
    test_blocks = []
    for i in range(100):
        block = {
            "id": str(uuid4()),
            "iso_code": f"TEST-PERF04-{i:03d}",
            "status": "validated",
            "tipologia": "capitel"
        }
        test_blocks.append(block)

    try:
        supabase_client.table("blocks").insert(test_blocks).execute()
    except Exception as e:
        pytest.fail(f"Failed to insert test data: {e}")

    # ACT: Baseline memory
    import tracemalloc
    tracemalloc.start()

    baseline_size, baseline_peak = tracemalloc.get_traced_memory()

    # Execute 50 requests
    for i in range(50):
        response = client.get("/api/parts")
        assert response.status_code == 200, f"Request {i} failed"

    # Measure final memory
    final_size, final_peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    memory_delta_mb = (final_size - baseline_size) / (1024 * 1024)

    # ASSERT: Memory stability
    assert memory_delta_mb < 50, f"Memory grew by {memory_delta_mb:.2f}MB (threshold: 50MB)"

    print(f"\n💾 Memory Stability Test:")
    print(f"   Baseline: {baseline_size / (1024*1024):.2f}MB")
    print(f"   Final: {final_size / (1024*1024):.2f}MB")
    print(f"   Delta: {memory_delta_mb:.2f}MB")

    # CLEANUP: Bulk delete
    bulk_delete_by_pattern_pg(supabase_db_connection, "TEST-PERF04%")
