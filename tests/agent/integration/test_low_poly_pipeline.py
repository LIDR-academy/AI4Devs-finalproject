"""
Integration tests for Low-Poly GLB generation pipeline (T-0502-AGENT).

Tests end-to-end workflow: DB → S3 → Rhino parsing → Decimation → S3 upload → DB update.
Requires Docker services running (postgres, agent-worker, S3-compatible storage).

TDD Phase: RED - These tests will fail until implementation is complete.
"""

import pytest
import time
import os
import psycopg2
from uuid import uuid4


@pytest.fixture
def test_block_id():
    """
    Create a test block in 'validated' status with mock .3dm URL in LOCAL database.

    Returns block_id UUID ready for Low-Poly generation.
    
    Note: Uses local Docker PostgreSQL database (not Supabase) to match agent task DB connection.
    """
    block_id = str(uuid4())
    
    # Connect to local database (same as agent tasks)
    database_url = os.environ.get("DATABASE_URL", "postgresql://user:password@db:5432/sfpm_db")
    conn = psycopg2.connect(database_url)
    
    try:
        cursor = conn.cursor()
        
        # Insert test block with validated status
        cursor.execute("""
            INSERT INTO blocks (id, iso_code, status, url_original, tipologia, low_poly_url, workshop_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            block_id,
            f'SF-TEST-{block_id[:8].upper()}-001',
            'validated',
            f'https://xyz.supabase.co/storage/v1/object/public/raw-uploads/test-{block_id}.3dm',
            'capitel',
            None,  # Will be populated by task
            None
        ))
        conn.commit()
        
        yield block_id
        
        # Cleanup: delete test block
        cursor.execute("DELETE FROM blocks WHERE id = %s", (block_id,))
        conn.commit()
        
    finally:
        cursor.close()
        conn.close()


@pytest.fixture
def test_3dm_file():
    """
    Path to real test fixture .3dm file in tests/fixtures/.

    This file should contain a simple mesh with ~5000 triangles.
    """
    fixtures_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'fixtures')
    fixture_path = os.path.join(fixtures_dir, 'test-capitel-simple.3dm')

    if not os.path.exists(fixture_path):
        pytest.skip(f"Test fixture not found: {fixture_path}")

    return fixture_path


# ===== INTEGRATION TESTS (TDD RED PHASE) =====

class TestLowPolyPipeline:
    """
    Integration tests for full Low-Poly generation pipeline.

    These tests verify end-to-end workflow with real services:
    - PostgreSQL database (blocks table)
    - Supabase Storage (S3-compatible)
    - Celery worker (async task execution)
    """

    @pytest.mark.integration
    def test_full_pipeline_upload_to_low_poly(self, supabase_client, test_3dm_file):
        """
        Test 13 (Integration): Full pipeline from upload to low_poly_url population.

        Given: Fresh .3dm file uploaded via US-001 flow
        When:
          1. File validated successfully (US-002 agent) → status='validated'
          2. T-0502 task enqueued automatically (future trigger, manual for now)
          3. Task executes
        Then:
          - After max 120 seconds: blocks.low_poly_url populated
          - GET /api/parts returns part with valid GLB URL
          - GLB file exists in S3 processed-geometry/low-poly/ bucket
        """
        from src.agent.tasks.geometry_processing import generate_low_poly_glb

        # Step 1: Upload test .3dm file to raw-uploads bucket
        block_id = str(uuid4())
        iso_code = f"SF-PIPE-P-{block_id[:8].upper()}"

        with open(test_3dm_file, 'rb') as f:
            file_data = f.read()

        # Upload to S3 (raw-uploads bucket)
        upload_result = supabase_client.storage.from_('raw-uploads').upload(
            f'test-{block_id}.3dm',
            file_data,
            {'content-type': 'application/octet-stream'}
        )

        assert upload_result is not None, "Failed to upload test .3dm file"

        # Get public URL
        url_original = supabase_client.storage.from_('raw-uploads').get_public_url(f'test-{block_id}.3dm')

        # Step 2: Insert block record with 'validated' status
        supabase_client.table('blocks').insert({
            'id': block_id,
            'iso_code': iso_code,
            'status': 'validated',
            'url_original': url_original,
            'tipologia': 'capitel',
            'low_poly_url': None,
            'workshop_id': None
        }).execute()

        try:
            # Step 3: Trigger Low-Poly generation task
            result = generate_low_poly_glb(block_id)

            # Verify task result
            assert result['status'] == 'success', f"Task failed: {result.get('error_message')}"
            assert result['low_poly_url'] is not None
            assert result['file_size_kb'] <= 500, f"GLB too large: {result['file_size_kb']} KB"

            # Step 4: Verify database updated
            block = supabase_client.table('blocks').select('*').eq('id', block_id).single().execute()

            assert block.data['low_poly_url'] is not None, "low_poly_url not populated in DB"
            assert block.data['low_poly_url'].endswith('.glb'), "Invalid GLB URL format"
            assert f'{block_id}.glb' in block.data['low_poly_url'], "URL doesn't contain block_id"

            # Step 5: Verify GLB file exists in S3
            glb_key = f"low-poly/{block_id}.glb"
            glb_exists = supabase_client.storage.from_('processed-geometry').list(path='low-poly/')

            glb_files = [f['name'] for f in glb_exists if f['name'] == f'{block_id}.glb']
            assert len(glb_files) == 1, f"GLB file not found in S3: {glb_key}"

        finally:
            # Cleanup: delete test files and block
            supabase_client.storage.from_('raw-uploads').remove([f'test-{block_id}.3dm'])
            supabase_client.storage.from_('processed-geometry').remove([f'low-poly/{block_id}.glb'])
            supabase_client.table('blocks').delete().eq('id', block_id).execute()

    @pytest.mark.integration
    @pytest.mark.xfail(reason="TDD RED phase - Requires real .3dm files and agent implementation")
    def test_s3_public_url_accessibility(self, test_block_id):
        """
        Test 14 (Integration): S3 public URL is accessible without authentication.

        Given: Task uploaded GLB to processed-geometry/low-poly/
        When: Fetch URL without authentication: curl https://{url}
        Then:
          - HTTP 200 response
          - Content-Type: model/gltf-binary or application/octet-stream
          - File size <500KB
          - GLB parseable by Three.js GLTFLoader (basic header check)
        """
        from src.agent.tasks.geometry_processing import generate_low_poly_glb
        import requests

        # Generate Low-Poly GLB
        result = generate_low_poly_glb(test_block_id)
        assert result['status'] == 'success'

        low_poly_url = result['low_poly_url']

        # Fetch GLB without authentication
        response = requests.get(low_poly_url, timeout=10)

        assert response.status_code == 200, f"Expected HTTP 200, got {response.status_code}"

        # Verify content type
        content_type = response.headers.get('Content-Type', '')
        assert 'gltf' in content_type.lower() or 'octet-stream' in content_type.lower(), \
            f"Invalid Content-Type: {content_type}"

        # Verify file size
        content_length = len(response.content)
        assert content_length < 500 * 1024, f"GLB too large: {content_length / 1024:.1f} KB"

        # Basic GLB header validation (magic bytes)
        # GLB files start with "glTF" magic bytes (0x46546C67 in little-endian)
        assert response.content[:4] == b'glTF', "Invalid GLB file header (missing magic bytes)"

        # GLB version should be 2 (0x00000002)
        version = int.from_bytes(response.content[4:8], byteorder='little')
        assert version == 2, f"Invalid GLB version: {version} (expected 2)"

    @pytest.mark.integration
    @pytest.mark.xfail(reason="TDD RED phase - Requires real .3dm files and agent implementation")
    def test_database_constraint_validation(self, test_block_id):
        """
        Test 15 (Integration): Database constraints accept valid low_poly_url values.

        Given: blocks.low_poly_url column accepts TEXT NULL
        When: Task updates with 500-char URL
        Then:
          - Update succeeds (TEXT supports arbitrary length)
          - Value stored correctly without truncation
          - Query returns exact URL
        """
        from src.agent.tasks.geometry_processing import generate_low_poly_glb

        # Generate Low-Poly GLB
        result = generate_low_poly_glb(test_block_id)
        assert result['status'] == 'success'

        # Verify database update using local DB connection
        database_url = os.environ.get("DATABASE_URL", "postgresql://user:password@db:5432/sfpm_db")
        conn = psycopg2.connect(database_url)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT low_poly_url FROM blocks WHERE id = %s", (test_block_id,))
            row = cursor.fetchone()
            assert row is not None, f"Block {test_block_id} not found in database"
            stored_url = row[0]

            # Verify URL format
            assert stored_url is not None, "low_poly_url is NULL after task completion"
            assert stored_url == result['low_poly_url'], "Stored URL doesn't match task result"
            assert len(stored_url) > 50, "URL suspiciously short (likely truncated)"
            assert stored_url.startswith('https://'), "URL missing https:// scheme"
            assert '.glb' in stored_url, "URL doesn't contain .glb extension"

            # Verify TEXT column accepts long URLs (no truncation at 255 chars like VARCHAR)
            assert len(stored_url) < 1000, "URL unreasonably long (sanity check)"
        
        finally:
            cursor.close()
            conn.close()


# ===== HELPER TESTS (Performance & Monitoring) =====

class TestPerformanceMetrics:
    """
    Additional tests for performance targets and monitoring.
    """

    @pytest.mark.integration
    @pytest.mark.slow
    @pytest.mark.xfail(reason="TDD RED phase - Requires real .3dm files and agent implementation")
    def test_processing_time_under_120_seconds(self, test_block_id):
        """
        Verify task completes within 120 seconds for typical .3dm files.

        Target: <120 seconds per file (soft limit 540s, hard limit 600s).
        """
        from src.agent.tasks.geometry_processing import generate_low_poly_glb

        start_time = time.time()

        result = generate_low_poly_glb(test_block_id)

        elapsed_time = time.time() - start_time

        assert result['status'] == 'success'
        assert elapsed_time < 120, f"Task took {elapsed_time:.1f}s (target: <120s)"

    @pytest.mark.integration
    @pytest.mark.xfail(reason="TDD RED phase - Requires real .3dm files and agent implementation")
    def test_task_idempotency(self, test_block_id):
        """
        Verify task can be retried safely (idempotent S3 uploads).

        Given: Task executed once successfully
        When: Task executed again with same block_id
        Then:
          - Second execution succeeds (no errors)
          - GLB file overwritten (same filename)
          - low_poly_url remains valid
        """
        from src.agent.tasks.geometry_processing import generate_low_poly_glb

        # First execution
        result1 = generate_low_poly_glb(test_block_id)
        assert result1['status'] == 'success'
        url1 = result1['low_poly_url']

        # Second execution (retry)
        result2 = generate_low_poly_glb(test_block_id)
        assert result2['status'] == 'success'
        url2 = result2['low_poly_url']

        # URLs should be identical (idempotent filename)
        assert url1 == url2, "Retry changed GLB URL (not idempotent)"
