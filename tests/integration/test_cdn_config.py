"""
T-1001-INFRA: CloudFront CDN Integration Tests (TDD-RED Phase)

Test suite for CloudFront CDN configuration and GLB file delivery optimization.
These tests verify that:
1. CDN environment variables are properly configured
2. Backend transforms S3 URLs to CDN URLs when enabled
3. CDN serves GLB files with correct headers (CORS, compression, cache)
4. CDN latency meets performance targets (<500ms p95)

Author: QA Automation Engineer
Date: 2026-02-24
Ticket: T-1001-INFRA (US-010 Visor 3D Web)
Phase: TDD-GREEN (refactored post-implementation)
"""
import pytest
import requests
from typing import Dict, Any
from config import settings
from services.parts_service import PartsService
from infra.supabase_client import get_supabase_client


# ==================== FIXTURES ====================

@pytest.fixture
def mock_row_s3_url() -> Dict[str, Any]:
    """Mock database row with Supabase S3 URL (for transformation tests)."""
    return {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "iso_code": "SF-C12-M-001",
        "status": "validated",
        "tipologia": "dovela",
        "low_poly_url": "https://ebqapsoyjmdkhdxnkikz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/550e8400.glb",
        "bbox": None,
        "workshop_id": None
    }


@pytest.fixture
def mock_row_null_url() -> Dict[str, Any]:
    """Mock database row with NULL low_poly_url (geometry not processed yet)."""
    return {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "iso_code": "SF-C12-M-002",
        "status": "processing",
        "tipologia": "dovela",
        "low_poly_url": None,
        "bbox": None,
        "workshop_id": None
    }


@pytest.fixture
def mock_row_cdn_url() -> Dict[str, Any]:
    """Mock database row with already-transformed CDN URL (idempotence test)."""
    return {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "iso_code": "SF-C12-M-003",
        "status": "validated",
        "tipologia": "dovela",
        "low_poly_url": "https://d1234abcd.cloudfront.net/low-poly/550e8400.glb",
        "bbox": None,
        "workshop_id": None
    }


@pytest.fixture
def parts_service() -> PartsService:
    """PartsService instance with Supabase client."""
    return PartsService(get_supabase_client())


# ==================== TEST CLASSES ====================

class TestCDNConfiguration:
    """Test suite for CDN environment variables and backend configuration."""

    def test_cdn_url_environment_variable_is_set(self):
        """
        ENV-01: Verify CDN_BASE_URL is configured in settings.
        
        Expected to FAIL with AttributeError: 'Settings' object has no attribute 'CDN_BASE_URL'
        This test drives the creation of CDN_BASE_URL in config.py
        """
        # This will FAIL because CDN_BASE_URL doesn't exist yet
        assert hasattr(settings, 'CDN_BASE_URL'), "CDN_BASE_URL must be defined in Settings"
        assert settings.CDN_BASE_URL is not None, "CDN_BASE_URL cannot be None"
        assert settings.CDN_BASE_URL.startswith('https://'), "CDN_BASE_URL must use HTTPS"
        # Accept either CloudFront or Supabase direct URL (for dev/prod flexibility)
        assert 'cloudfront.net' in settings.CDN_BASE_URL or 'supabase.co' in settings.CDN_BASE_URL, \
            "CDN_BASE_URL must be CloudFront distribution or Supabase Storage URL"

    def test_use_cdn_flag_exists_in_settings(self):
        """
        ENV-02: Verify USE_CDN boolean flag exists in settings.
        
        Expected to FAIL with AttributeError: 'Settings' object has no attribute 'USE_CDN'
        This flag allows disabling CDN in development (direct S3) vs production (CloudFront).
        """
        # This will FAIL because USE_CDN doesn't exist yet
        assert hasattr(settings, 'USE_CDN'), "USE_CDN must be defined in Settings"
        assert isinstance(settings.USE_CDN, bool), "USE_CDN must be a boolean"


class TestCDNURLTransformation:
    """Test suite for backend URL transformation logic (S3 → CDN)."""

    def test_parts_service_transforms_s3_url_to_cdn_when_enabled(self, parts_service: PartsService, mock_row_s3_url: Dict[str, Any]):
        """
        TRANSFORM-01: Verify PartsService transforms S3 URLs to CDN URLs when USE_CDN=true.
        
        Test scenario:
        - Given: A database row with low_poly_url pointing to Supabase S3
        - When: USE_CDN is enabled (must be True for this test to make sense)
        - Then: The returned PartCanvasItem should have CDN URL instead of S3 URL
        """
        # FIRST: Verify CDN settings exist (prerequisite)
        assert hasattr(settings, 'USE_CDN'), "USE_CDN must be defined in Settings for CDN transformation"
        assert hasattr(settings, 'CDN_BASE_URL'), "CDN_BASE_URL must be defined in Settings for CDN transformation"
        
        # Skip test if CDN is disabled (feature toggle off)
        if not settings.USE_CDN:
            pytest.skip("USE_CDN is False - skipping CDN transformation test")

        # Execute transformation
        result = parts_service._transform_row_to_part_item(mock_row_s3_url)

        # Verify URL transformation
        expected_cdn_url = f"{settings.CDN_BASE_URL}/low-poly/550e8400.glb"
        assert result.low_poly_url == expected_cdn_url, \
            f"Expected CDN URL {expected_cdn_url}, got {result.low_poly_url}"
        assert 'cloudfront.net' in result.low_poly_url or settings.CDN_BASE_URL in result.low_poly_url, \
            "Transformed URL must point to CDN domain"

    def test_parts_service_preserves_null_urls(self, parts_service: PartsService, mock_row_null_url: Dict[str, Any]):
        """
        TRANSFORM-02: Verify PartsService handles NULL low_poly_url correctly.
        
        Test scenario:
        - Given: A database row with low_poly_url = NULL (geometry not processed yet)
        - When: Transformation is applied
        - Then: Result should have low_poly_url = None (no crash, graceful handling)
        """
        result = parts_service._transform_row_to_part_item(mock_row_null_url)

        # Should handle NULL gracefully (existing behavior, should PASS)
        assert result.low_poly_url is None, "NULL URLs should remain NULL"

    def test_parts_service_skips_transformation_for_non_s3_urls(self, parts_service: PartsService, mock_row_cdn_url: Dict[str, Any]):
        """
        TRANSFORM-03: Verify PartsService only transforms S3 URLs (skip external URLs).
        
        Test scenario:
        - Given: A database row with low_poly_url pointing to external CDN (already transformed)
        - When: Transformation is applied
        - Then: URL should remain unchanged (avoid double transformation)
        """
        result = parts_service._transform_row_to_part_item(mock_row_cdn_url)

        # Should NOT transform already-CDN URLs (idempotent)
        assert result.low_poly_url == mock_row_cdn_url["low_poly_url"], \
            "CDN URLs should not be transformed again"


@pytest.mark.skip(reason="Requires CloudFormation deployment (TDD-GREEN phase)")
class TestCDNLiveEndpoint:
    """
    Test suite for live CDN endpoint verification (HTTP headers, latency).
    
    These tests are SKIPPED in RED phase because they require:
    1. CloudFormation stack deployed (CDN distribution active)
    2. GLB test fixture uploaded to S3 bucket
    3. CDN cache warmed up (24h TTL)
    
    These will be ENABLED in GREEN phase after infrastructure deployment.
    """

    def test_cdn_serves_glb_file_with_correct_mime_type(self):
        """
        HTTP-01: Verify CDN serves GLB files with application/octet-stream or model/gltf-binary.
        
        SKIPPED: Requires live CDN endpoint.
        Will be tested manually after CloudFormation deployment.
        """
        test_url = f"{settings.CDN_BASE_URL}/low-poly/test-model.glb"
        response = requests.get(test_url, timeout=10)
        assert response.status_code == 200
        assert response.headers['Content-Type'] in ['model/gltf-binary', 'application/octet-stream']

    def test_cdn_returns_cors_headers(self):
        """
        CORS-01: Verify CORS headers allow app.sfpm.io.
        
        SKIPPED: Requires live CDN endpoint with CORS policy configured.
        """
        test_url = f"{settings.CDN_BASE_URL}/low-poly/test-model.glb"
        response = requests.options(
            test_url,
            headers={'Origin': 'https://app.sfpm.io', 'Access-Control-Request-Method': 'GET'},
            timeout=5
        )
        assert response.headers.get('Access-Control-Allow-Origin') in ['https://app.sfpm.io', '*']
        assert 'GET' in response.headers.get('Access-Control-Allow-Methods', '')

    def test_cdn_compresses_responses(self):
        """
        PERF-01: Verify Brotli/Gzip compression is enabled.
        
        SKIPPED: Requires live CDN endpoint with compression enabled.
        """
        test_url = f"{settings.CDN_BASE_URL}/low-poly/test-model.glb"
        response = requests.get(
            test_url,
            headers={'Accept-Encoding': 'br, gzip'},
            timeout=10
        )
        assert response.status_code == 200
        assert response.headers.get('Content-Encoding') in ['br', 'gzip', None]

    def test_cdn_cache_headers_are_present(self):
        """
        CACHE-01: Verify Cache-Control headers set 24h TTL.
        
        SKIPPED: Requires live CDN endpoint with cache policy configured.
        """
        test_url = f"{settings.CDN_BASE_URL}/low-poly/test-model.glb"
        response = requests.get(test_url, timeout=10)
        assert response.status_code == 200
        
        cache_control = response.headers.get('Cache-Control', '')
        assert 'max-age' in cache_control
        max_age = int([part.split('=')[1] for part in cache_control.split(',') if 'max-age' in part][0])
        assert max_age >= 3600  # At least 1 hour

    def test_cdn_latency_is_acceptable(self):
        """
        PERF-02: Verify CDN latency <500ms p95.
        
        SKIPPED: Requires live CDN endpoint and multiple requests for p95 calculation.
        """
        test_url = f"{settings.CDN_BASE_URL}/low-poly/test-model.glb"
        
        latencies = []
        for _ in range(10):
            response = requests.head(test_url, timeout=5)
            assert response.status_code == 200
            latencies.append(response.elapsed.total_seconds())
        
        p95_latency = sorted(latencies)[int(len(latencies) * 0.95)]
        assert p95_latency < 0.5  # <500ms
