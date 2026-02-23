"""
Test Helpers for Parts API Integration Tests

Shared utilities to reduce duplication across 5 test suites.

Functions:
- cleanup_test_blocks(): Delete test blocks by ID list
- create_realistic_block(): Generate block with realistic data
- assert_execution_time(): Decorator for performance assertions
- get_query_plan(): Execute EXPLAIN ANALYZE and parse plan
- generate_jwt_token(): Create test JWT for RLS tests (future)

Status: ✅ Helper utilities (used across all 5 suites)
Author: AI Assistant (T-0510-TEST-BACK TDD-RED Phase)
Date: 2026-02-23
"""
import time
import functools
from typing import Dict, List, Any, Optional
from uuid import uuid4
from datetime import datetime

from supabase import Client


def cleanup_test_blocks(supabase_client: Client, block_ids: List[str]) -> None:
    """
    Delete test blocks by ID list (idempotent cleanup).
    
    Args:
        supabase_client: Supabase client instance
        block_ids: List of block UUIDs to delete
    
    Example:
        >>> cleanup_test_blocks(client, ["uuid1", "uuid2", "uuid3"])
    """
    for block_id in block_ids:
        try:
            supabase_client.table("blocks").delete().eq("id", block_id).execute()
        except Exception:
            pass  # Idempotent: ignore if already deleted


def cleanup_test_blocks_by_pattern(supabase_client: Client, iso_code_pattern: str) -> None:
    """
    Delete test blocks matching an iso_code pattern (idempotent cleanup).
    
    Uses SELECT+DELETE pattern (Supabase .like() doesn't work reliably for DELETE).
    
    Args:
        supabase_client: Supabase client instance
        iso_code_pattern: ISO code pattern for ILIKE match (e.g., "TEST-PERF01%")
    
    Example:
        >>> cleanup_test_blocks_by_pattern(client, "TEST-PERF01%")
        >>> cleanup_test_blocks_by_pattern(client, "ACTIVE%")
    
    Note:
        This pattern is required because supabase_client.table("blocks").delete().like() 
        does not work correctly. We must SELECT first, then DELETE by ID.
    """
    try:
        existing = supabase_client.table("blocks").select("id").ilike("iso_code", iso_code_pattern).execute()
        if existing.data:
            block_ids = [b["id"] for b in existing.data]
            for block_id in block_ids:
                supabase_client.table("blocks").delete().eq("id", block_id).execute()
    except Exception:
        pass  # Idempotent: ignore if no blocks to delete


def create_realistic_block(
    iso_code: str,
    status: str = "validated",
    tipologia: str = "capitel",
    workshop_id: Optional[str] = None,
    is_archived: bool = False,
    include_bbox: bool = True,
    include_low_poly_url: bool = False
) -> Dict[str, Any]:
    """
    Generate a block dictionary with realistic field values.
    
    Args:
        iso_code: Unique ISO code (e.g., "TEST-F01-001")
        status: Block status (validated, completed, pending, etc.)
        tipologia: Block type (capitel, columna, basa, fuste)
        workshop_id: Optional workshop UUID (for RLS tests)
        is_archived: Whether block is archived (default: False)
        include_bbox: Include bounding box field (default: True)
        include_low_poly_url: Include low-poly URL field (default: False)
    
    Returns:
        Dictionary ready for Supabase insert
    
    Example:
        >>> block = create_realistic_block("TEST-001", status="completed")
        >>> supabase_client.table("blocks").insert(block).execute()
    """
    block = {
        "id": str(uuid4()),
        "iso_code": iso_code,
        "status": status,
        "tipologia": tipologia,
        "is_archived": is_archived,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    if workshop_id:
        block["workshop_id"] = workshop_id
    
    if include_bbox:
        block["bbox"] = {
            "min": [-2.5, 0.0, -2.5],
            "max": [2.5, 5.0, 2.5]
        }
    
    if include_low_poly_url:
        block["low_poly_url"] = (
            f"https://example.supabase.co/storage/v1/object/public/"
            f"processed-geometry/low-poly/{block['id']}.glb"
        )
    
    return block


def assert_execution_time(max_duration_ms: float):
    """
    Decorator to assert function execution time is under threshold.
    
    Args:
        max_duration_ms: Maximum allowed execution time in milliseconds
    
    Example:
        >>> @assert_execution_time(500)
        >>> def test_fast_query():
        >>>     response = client.get("/api/parts")
        >>>     assert response.status_code == 200
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.perf_counter()
            result = func(*args, **kwargs)
            end_time = time.perf_counter()
            
            duration_ms = (end_time - start_time) * 1000
            assert duration_ms < max_duration_ms, (
                f"Function {func.__name__} took {duration_ms:.2f}ms "
                f"(limit: {max_duration_ms}ms)"
            )
            return result
        return wrapper
    return decorator


def get_query_plan(
    sql_query: str,
    db_connection
) -> Dict[str, Any]:
    """
    Execute EXPLAIN ANALYZE and return parsed query plan.
    
    Args:
        sql_query: SQL query to analyze
        db_connection: psycopg2 connection object
    
    Returns:
        Parsed query plan as dictionary (from JSON format)
    
    Example:
        >>> conn = get_direct_db_connection()
        >>> plan = get_query_plan("SELECT * FROM blocks WHERE status = 'validated'", conn)
        >>> assert "Index Scan" in str(plan)
    """
    cursor = db_connection.cursor()
    
    explain_query = f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {sql_query}"
    cursor.execute(explain_query)
    query_plan = cursor.fetchone()[0]
    
    cursor.close()
    
    return query_plan


def generate_jwt_token(
    role: str = "workshop_user",
    workshop_id: Optional[str] = None,
    user_id: Optional[str] = None
) -> str:
    """
    Generate test JWT token for RLS policy testing (placeholder).
    
    ⚠️ NOT IMPLEMENTED - Requires JWT signing infrastructure
    
    Args:
        role: User role (workshop_user, bim_manager, admin)
        workshop_id: Workshop UUID (for tenant isolation tests)
        user_id: User UUID
    
    Returns:
        Signed JWT token string
    
    Example:
        >>> token = generate_jwt_token(role="bim_manager")
        >>> headers = {"Authorization": f"Bearer {token}"}
        >>> response = client.get("/api/parts", headers=headers)
    
    TODO: Implement JWT signing with Supabase secret key
    """
    raise NotImplementedError(
        "JWT token generation not yet implemented. "
        "Required for RLS policy tests (T-0510-TEST-BACK Phase GREEN)."
    )


def batch_insert_blocks(
    supabase_client: Client,
    blocks: List[Dict[str, Any]],
    chunk_size: int = 500
) -> None:
    """
    Insert large number of blocks in chunks (avoids Supabase 1000-row limit).
    
    Args:
        supabase_client: Supabase client instance
        blocks: List of block dictionaries to insert
        chunk_size: Number of blocks per batch (default: 500)
    
    Example:
        >>> blocks = [create_realistic_block(f"TEST-{i:04d}") for i in range(1000)]
        >>> batch_insert_blocks(supabase_client, blocks)
    """
    for i in range(0, len(blocks), chunk_size):
        chunk = blocks[i:i + chunk_size]
        try:
            supabase_client.table("blocks").insert(chunk).execute()
        except Exception as e:
            raise Exception(f"Failed to insert chunk {i}-{i+len(chunk)}: {e}")


def calculate_percentiles(
    latencies: List[float],
    percentiles: List[int] = [50, 95, 99]
) -> Dict[str, float]:
    """
    Calculate latency percentiles from list of measurements.
    
    Args:
        latencies: List of latency measurements (milliseconds)
        percentiles: List of percentile values to calculate (default: [50, 95, 99])
    
    Returns:
        Dictionary mapping percentile labels to values (e.g., {"p50": 123.45})
    
    Example:
        >>> latencies = [100, 150, 200, 250, 300]
        >>> stats = calculate_percentiles(latencies)
        >>> assert stats["p50"] < 200  # Median latency
        >>> assert stats["p95"] < 300  # 95th percentile
    """
    sorted_latencies = sorted(latencies)
    results = {}
    
    for p in percentiles:
        index = int(len(sorted_latencies) * (p / 100))
        results[f"p{p}"] = sorted_latencies[index]
    
    return results


def assert_response_schema(
    response_data: Dict[str, Any],
    expected_fields: List[str]
) -> None:
    """
    Assert API response contains all expected fields.
    
    Args:
        response_data: JSON response from API
        expected_fields: List of required field names
    
    Example:
        >>> data = response.json()
        >>> assert_response_schema(data, ["parts", "count", "filters_applied"])
    """
    missing_fields = [field for field in expected_fields if field not in response_data]
    
    assert not missing_fields, (
        f"Response missing required fields: {missing_fields}. "
        f"Actual fields: {list(response_data.keys())}"
    )


def print_test_summary(
    test_name: str,
    metrics: Dict[str, Any]
) -> None:
    """
    Print formatted test summary (for debugging/logs).
    
    Args:
        test_name: Name of test being executed
        metrics: Dictionary of metrics to display
    
    Example:
        >>> print_test_summary("PERF-03", {
        >>>     "blocks_created": 1000,
        >>>     "p50_latency": 345.67,
        >>>     "p95_latency": 678.90
        >>> })
    """
    print(f"\n{'='*60}")
    print(f"Test Summary: {test_name}")
    print(f"{'='*60}")
    for key, value in metrics.items():
        if isinstance(value, float):
            print(f"  {key}: {value:.2f}")
        else:
            print(f"  {key}: {value}")
    print(f"{'='*60}\n")
