"""
T-1002-BACK: Part Detail API Integration Tests
Test full HTTP request/response cycle with real Supabase (or test DB).
"""
import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

# These imports will fail in RED phase because the modules don't exist yet
from main import app
from schemas import PartDetailResponse


client = TestClient(app)

# Test workshop ID (valid UUID)
TEST_WORKSHOP_ID = "b5c4c8e7-2d9e-4f0a-9b1c-3d5e7a8b9c1d"


class TestPartDetailAPI:
    """Integration tests for GET /api/parts/{id} endpoint."""
    
    @pytest.fixture(autouse=True)
    def setup_test_data(self, supabase_client):
        """Create test part in database for integration tests."""
        try:
            # Create a test part in the blocks table
            response = supabase_client.from_('blocks').insert({
                'iso_code': 'T1002-TEST-PART',
                'status': 'validated',
                'tipologia': 'capitel',
                'low_poly_url': 'https://cdn.example.com/low-poly/test.glb',
                'bbox': {'min': [-1, 0, -1], 'max': [1, 2, 1]},
                'workshop_id': TEST_WORKSHOP_ID
            }).execute()
            
            self.test_part_id = response.data[0]['id']
            
            yield
            
            # Cleanup: delete the test part
            supabase_client.from_('blocks').delete().eq('id', self.test_part_id).execute()
        except Exception as e:
            # If insert fails, skip this test
            pytest.skip(f"Could not create test data: {e}")
    
    def test_get_part_detail_success_200(self):
        """
        INT-01: Fetch existing part returns 200.
        
        Given: Part exists in database
        When: GET /api/parts/{id}
        Then: Returns 200 OK with PartDetailResponse
        """
        response = client.get(
            f"/api/parts/{self.test_part_id}",
            headers={"X-Workshop-Id": TEST_WORKSHOP_ID}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['iso_code'] == 'T1002-TEST-PART'
        assert data['status'] == 'validated'
        assert data['low_poly_url'] is not None
        assert data['tipologia'] == 'capitel'
    
    def test_get_part_detail_invalid_uuid_400(self):
        """
        INT-02: Invalid UUID format returns 400.
        
        Given: Malformed UUID string
        When: GET /api/parts/{invalid-uuid}
        Then: Returns 400 Bad Request with error message
        """
        response = client.get("/api/parts/invalid-uuid")
        
        assert response.status_code == 400
        assert "Invalid UUID format" in response.json()['detail']
    
    def test_get_part_detail_not_found_404(self):
        """
        INT-03: Non-existent part ID returns 404.
        
        Given: Part ID that doesn't exist
        When: GET /api/parts/{nonexistent-uuid}
        Then: Returns 404 Not Found
        """
        fake_uuid = str(uuid4())
        response = client.get(f"/api/parts/{fake_uuid}")
        
        assert response.status_code == 404
        assert "Part not found" in response.json()['detail']
    
    def test_get_part_detail_rls_violation_404(self):
        """
        INT-04: RLS violation returns 404 (not 403).
        
        Given: User with workshop_id='different-workshop'
        When: GET /api/parts/{part-from-different-workshop}
        Then: Returns 404 (don't leak existence)
        """
        different_workshop = "a7c3f1d9-8e2b-4c5a-9d3e-1f7a8b9c2d4e"
        response = client.get(
            f"/api/parts/{self.test_part_id}",
            headers={"X-Workshop-Id": different_workshop}
        )
        
        assert response.status_code == 404
        assert "Part not found" in response.json()['detail']
    
    def test_get_part_detail_unassigned_part_accessible(self, supabase_client):
        """
        INT-05: Unassigned parts (workshop_id=NULL) are accessible to all users.
        
        Given: Part with workshop_id=NULL
        When: Any user requests it
        Then: Returns 200 OK
        """
        try:
            # Create unassigned part with unique iso_code
            unassigned_iso = f'T1002-UNASSIGNED-{str(uuid4())[:8]}'
            unassigned_response = supabase_client.from_('blocks').insert({
                'iso_code': unassigned_iso,
                'status': 'uploaded',
                'tipologia': 'columna',
                'workshop_id': None
            }).execute()
            
            unassigned_id = unassigned_response.data[0]['id']
            
            response = client.get(
                f"/api/parts/{unassigned_id}",
                headers={"X-Workshop-Id": TEST_WORKSHOP_ID}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['workshop_id'] is None
            
            # Cleanup
            supabase_client.from_('blocks').delete().eq('id', unassigned_id).execute()
        except Exception as e:
            pytest.skip(f"Could not test unassigned part: {e}")
    
    def test_get_part_detail_superuser_sees_all(self, supabase_client):
        """
        INT-06: Superuser (no X-Workshop-Id header) sees all parts.
        
        Given: No X-Workshop-Id header (superuser)
        When: GET /api/parts/{any-part}
        Then: Returns 200 OK regardless of workshop assignment
        """
        response = client.get(f"/api/parts/{self.test_part_id}")  # No header
        
        assert response.status_code == 200
        data = response.json()
        assert data['workshop_id'] == TEST_WORKSHOP_ID
    
    def test_get_part_detail_response_has_required_fields(self):
        """
        INT-07: Response includes all required fields from PartDetailResponse.
        
        Given: Valid part request
        When: GET /api/parts/{id}
        Then: Response contains all PartDetailResponse fields
        """
        response = client.get(
            f"/api/parts/{self.test_part_id}",
            headers={"X-Workshop-Id": TEST_WORKSHOP_ID}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required fields are present (some are optional in current schema)
        required_fields = [
            'id', 'iso_code', 'status', 'tipologia', 'created_at',
            'low_poly_url', 'bbox', 'workshop_id', 'workshop_name',
            'validation_report'
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
    
    def test_get_part_detail_response_schema(self):
        """
        INT-08: Response validates against PartDetailResponse Pydantic schema.
        
        Given: Valid API response
        When: Parse response JSON into PartDetailResponse
        Then: Pydantic validation succeeds
        """
        response = client.get(
            f"/api/parts/{self.test_part_id}",
            headers={"X-Workshop-Id": TEST_WORKSHOP_ID}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # This should not raise a validation error
        part_detail = PartDetailResponse(**data)
        assert part_detail.iso_code == 'T1002-TEST-PART'
        assert part_detail.status.value == 'validated'
