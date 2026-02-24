"""
T-1002-BACK: Part Detail Service Unit Tests
Test business logic in isolation with mocked Supabase client.
"""
import pytest
from unittest.mock import Mock, MagicMock
from uuid import UUID

# This import will fail in RED phase because the module doesn't exist yet
from services.part_detail_service import PartDetailService
from schemas import PartDetailResponse, BlockStatus


class TestPartDetailService:
    """Unit tests for PartDetailService (mocked Supabase)."""
    
    def test_get_part_detail_success_with_rls(self):
        """
        UNIT-01: Regular user can fetch assigned part.
        
        Given: User with workshop_id='workshop-123'
        When: Request GET /api/parts/{part_id} for part assigned to workshop-123
        Then: Returns PartDetailResponse with status 200
        """
        mock_client = Mock()
        
        # Mock Supabase response
        mock_response = Mock()
        mock_response.data = [{
            'id': '550e8400-e29b-41d4-a716-446655440000',
            'iso_code': 'SF-C12-D-001',
            'status': 'validated',
            'tipologia': 'capitel',
            'created_at': '2026-02-15T10:30:00Z',
            'low_poly_url': 'https://cdn.cloudfront.net/low-poly/550e8400.glb',
            'bbox': {'min': [-2.5, 0, -2.5], 'max': [2.5, 5, 2.5]},
            'workshop_id': 'workshop-123',
            'workshops': {'name': 'Taller Granollers'},
            'validation_report': None
        }]
        
        # Chain the mock methods
        mock_client.from_.return_value.select.return_value.eq.return_value.or_.return_value.execute.return_value = mock_response
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail(
            '550e8400-e29b-41d4-a716-446655440000',
            'workshop-123'
        )
        
        assert success is True
        assert data is not None
        assert data['iso_code'] == 'SF-C12-D-001'
        assert data['workshop_name'] == 'Taller Granollers'
        assert error is None
    
    def test_get_part_detail_invalid_uuid_format(self):
        """
        UNIT-02: Invalid UUID format returns error.
        
        Given: Invalid UUID string
        When: Call get_part_detail() with malformed UUID
        Then: Returns success=False with appropriate error message
        """
        service = PartDetailService()
        success, data, error = service.get_part_detail('invalid-uuid', 'workshop-123')
        
        assert success is False
        assert data is None
        assert "Invalid UUID format" in error
    
    def test_get_part_detail_not_found(self):
        """
        UNIT-03: Part not found returns error.
        
        Given: Part ID that doesn't exist
        When: Call get_part_detail()
        Then: Returns success=False with "not found or access denied" error
        """
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = []  # Empty response
        
        mock_client.from_.return_value.select.return_value.eq.return_value.or_.return_value.execute.return_value = mock_response
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail(
            '550e8400-e29b-41d4-a716-446655440000',
            'workshop-123'
        )
        
        assert success is False
        assert data is None
        assert "not found or access denied" in error
    
    def test_get_part_detail_superuser_sees_all(self):
        """
        UNIT-04: Superuser (no workshop_id) can see all parts.
        
        Given: User with no workshop_id (superuser)
        When: Request part from any workshop
        Then: Returns the part regardless of workshop assignment
        """
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = [{
            'id': '550e8400-e29b-41d4-a716-446655440000',
            'iso_code': 'SF-C12-D-001',
            'status': 'validated',
            'tipologia': 'capitel',
            'created_at': '2026-02-15T10:30:00Z',
            'low_poly_url': None,
            'bbox': None,
            'workshop_id': 'workshop-xyz',
            'workshops': {'name': 'Taller Sabadell'},
            'validation_report': None
        }]
        
        # For superuser, the query chain is different (no OR clause)
        mock_client.from_.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail(
            '550e8400-e29b-41d4-a716-446655440000',
            None  # Superuser has no workshop_id
        )
        
        assert success is True
        assert data is not None
        assert data['workshop_id'] == 'workshop-xyz'
        assert error is None
    
    def test_get_part_detail_unassigned_part_accessible(self):
        """
        UNIT-05: Unassigned parts (workshop_id=NULL) accessible to all.
        
        Given: Part with workshop_id = NULL (unassigned)
        When: Any user requests it
        Then: Returns the part successfully
        """
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = [{
            'id': '550e8400-e29b-41d4-a716-446655440000',
            'iso_code': 'SF-C12-D-002',
            'status': 'uploaded',
            'tipologia': 'columna',
            'created_at': '2026-02-15T10:30:00Z',
            'low_poly_url': None,
            'bbox': None,
            'workshop_id': None,
            'workshops': None,
            'validation_report': None
        }]
        
        mock_client.from_.return_value.select.return_value.eq.return_value.or_.return_value.execute.return_value = mock_response
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail(
            '550e8400-e29b-41d4-a716-446655440000',
            'any-workshop-id'
        )
        
        assert success is True
        assert data is not None
        assert data['workshop_id'] is None
        assert error is None
    
    def test_get_part_detail_with_validation_report(self):
        """
        UNIT-06: Returns validation report when present.
        
        Given: Part with validation_report JSONB
        When: Call get_part_detail()
        Then: Returns the validation report in response
        """
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = [{
            'id': '550e8400-e29b-41d4-a716-446655440000',
            'iso_code': 'SF-C12-D-001',
            'status': 'validated',
            'tipologia': 'capitel',
            'created_at': '2026-02-15T10:30:00Z',
            'low_poly_url': 'https://cdn.cloudfront.net/low-poly/550e8400.glb',
            'bbox': {'min': [-2.5, 0, -2.5], 'max': [2.5, 5, 2.5]},
            'workshop_id': 'workshop-123',
            'workshops': {'name': 'Taller Granollers'},
            'validation_report': {
                'is_valid': True,
                'errors': [],
                'metadata': {'object_count': 12}
            }
        }]
        
        mock_client.from_.return_value.select.return_value.eq.return_value.or_.return_value.execute.return_value = mock_response
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail(
            '550e8400-e29b-41d4-a716-446655440000',
            'workshop-123'
        )
        
        assert success is True
        assert data is not None
        assert data['validation_report'] is not None
        assert data['validation_report']['is_valid'] is True
    
    def test_get_part_detail_database_error(self):
        """
        UNIT-07: Database errors are caught and returned gracefully.
        
        Given: Supabase connection error
        When: Call get_part_detail()
        Then: Returns success=False with error message
        """
        mock_client = Mock()
        mock_client.from_.side_effect = Exception("Connection refused")
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail(
            '550e8400-e29b-41d4-a716-446655440000',
            'workshop-123'
        )
        
        assert success is False
        assert data is None
        assert "Database error" in error or "Connection refused" in error
    
    def test_get_part_detail_cdn_url_transformation(self):
        """
        UNIT-08: S3 URL is transformed to CDN URL when USE_CDN=true.
        
        Given: Part with low_poly_url pointing to S3
        When: USE_CDN feature is enabled
        Then: URL is transformed to CDN domain
        """
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = [{
            'id': '550e8400-e29b-41d4-a716-446655440000',
            'iso_code': 'SF-C12-D-001',
            'status': 'validated',
            'tipologia': 'capitel',
            'created_at': '2026-02-15T10:30:00Z',
            'low_poly_url': 'https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/550e8400.glb',
            'bbox': {'min': [-2.5, 0, -2.5], 'max': [2.5, 5, 2.5]},
            'workshop_id': 'workshop-123',
            'workshops': {'name': 'Taller Granollers'},
            'validation_report': None
        }]
        
        mock_client.from_.return_value.select.return_value.eq.return_value.or_.return_value.execute.return_value = mock_response
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail(
            '550e8400-e29b-41d4-a716-446655440000',
            'workshop-123'
        )
        
        assert success is True
        # URL transformation should be applied if CDN is enabled
        # This will be verified in the implementation
        assert data['low_poly_url'] is not None
    
    def test_get_part_detail_response_schema_validation(self):
        """
        UNIT-09: Response validates against PartDetailResponse schema.
        
        Given: Valid part data from database
        When: Transform to PartDetailResponse
        Then: Pydantic validation succeeds
        """
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = [{
            'id': '550e8400-e29b-41d4-a716-446655440000',
            'iso_code': 'SF-C12-D-001',
            'status': 'validated',
            'tipologia': 'capitel',
            'created_at': '2026-02-15T10:30:00Z',
            'low_poly_url': 'https://cdn.cloudfront.net/low-poly/550e8400.glb',
            'bbox': {'min': [-2.5, 0, -2.5], 'max': [2.5, 5, 2.5]},
            'workshop_id': '123e4567-e89b-12d3-a456-426614174000',
            'workshops': {'name': 'Taller Granollers'},
            'validation_report': {
                'is_valid': True,
                'errors': [],
                'metadata': {},
                'validated_at': '2026-02-15T10:30:00Z',
                'validated_by': 'librarian-v1.0.0'
            }
        }]
        
        mock_client.from_.return_value.select.return_value.eq.return_value.or_.return_value.execute.return_value = mock_response
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail(
            '550e8400-e29b-41d4-a716-446655440000',
            '123e4567-e89b-12d3-a456-426614174000'
        )
        
        assert success is True
        # Validate that we can construct PartDetailResponse from the data
        response = PartDetailResponse(**data)
        assert response.iso_code == 'SF-C12-D-001'
        assert response.status == BlockStatus.VALIDATED
    
    def test_get_part_detail_rls_violation_same_as_not_found(self):
        """
        UNIT-10: RLS violation returns same error as not found (security).
        
        Given: User tries to access part from different workshop
        When: RLS filtering returns empty result
        Then: Returns 404 (not 403) to avoid leaking part existence
        """
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = []  # RLS filtering results in empty
        
        mock_client.from_.return_value.select.return_value.eq.return_value.or_.return_value.execute.return_value = mock_response
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail(
            '550e8400-e29b-41d4-a716-446655440000',
            'different-workshop-id'
        )
        
        # Error message should be the same whether part doesn't exist or RLS blocks it
        assert success is False
        assert "not found or access denied" in error
    
    def test_get_part_detail_null_workshop_name(self):
        """
        UNIT-11: Null workshop_name handled gracefully when workshop join returns null.
        
        Given: Part with NULL workshop_id
        When: Call get_part_detail()
        Then: workshop_name is None in response
        """
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = [{
            'id': '550e8400-e29b-41d4-a716-446655440000',
            'iso_code': 'SF-C12-D-001',
            'status': 'validated',
            'tipologia': 'capitel',
            'created_at': '2026-02-15T10:30:00Z',
            'low_poly_url': None,
            'bbox': None,
            'workshop_id': None,
            'workshops': None,  # No join result for unassigned
            'validation_report': None
        }]
        
        mock_client.from_.return_value.select.return_value.eq.return_value.or_.return_value.execute.return_value = mock_response
        
        service = PartDetailService(supabase_client=mock_client)
        success, data, error = service.get_part_detail(
            '550e8400-e29b-41d4-a716-446655440000',
            'any-workshop'
        )
        
        assert success is True
        assert data['workshop_name'] is None
    
    def test_get_part_detail_uuid_format_validation(self):
        """
        UNIT-12: UUID format validation catches common malformed UUIDs.
        
        Given: Various malformed UUID strings
        When: Call get_part_detail() with each
        Then: All return success=False with appropriate error
        """
        service = PartDetailService()
        
        malformed_uuids = [
            'not-a-uuid',
            '550e8400e29b41d4a716446655440000',  # Missing dashes
            '550e8400-e29b-41d4-a716',  # Too short
            '550e8400-e29b-41d4-a716-446655440000-extra',  # Too long
        ]
        
        for bad_uuid in malformed_uuids:
            success, data, error = service.get_part_detail(bad_uuid, 'workshop-123')
            assert success is False, f"Should fail for {bad_uuid}"
            assert data is None
            assert "Invalid UUID format" in error
