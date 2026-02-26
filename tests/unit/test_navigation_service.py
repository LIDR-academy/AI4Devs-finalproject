"""
T-1003-BACK TDD RED Phase: NavigationService Unit Tests
=========================================================

Test coverage: 12 unit tests (NAV-01 to NAV-12)
Expected to FAIL with ImportError: services.navigation_service module doesn't exist yet

Test Strategy:
- Mock Supabase client to isolate service logic
- Test _fetch_ordered_ids() method (ID ordering + filtering)
- Test _find_adjacent_positions() method (prev/next ID calculation)
- Test _build_cache_key() method (Redis key generation)
- Test get_adjacent_parts() method (orchestration + RLS enforcement)
- Verify UUID validation, error handling, RLS policy

Patterns reused:
- UUID_PATTERN regex from T-1002-BACK (part_detail_service.py)
- Return tuple (success, data, error) pattern from service layer
- Mock structure from test_part_detail_service.py
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from uuid import UUID

# This import will FAIL with ImportError - NavigationService doesn't exist yet
from services.navigation_service import NavigationService


class TestNavigationServiceInit:
    """Test NavigationService initialization"""
    
    def test_service_initialization(self):
        """Verify NavigationService can be instantiated with Supabase client"""
        mock_client = Mock()
        service = NavigationService(mock_client)
        assert service is not None
        assert service.client == mock_client


class TestFetchOrderedIds:
    """Test _fetch_ordered_ids() method - fetches ordered part IDs with filters"""
    
    def test_nav_01_fetch_middle_part_with_adjacent(self):
        """
        NAV-01 HAPPY PATH: Middle part with prev+next exist
        Scenario: Part at index 2 in [id1, id2, id3] → prev=id1, next=id3
        """
        mock_client = Mock()
        mock_table = Mock()
        mock_select = Mock()
        mock_eq = Mock()
        mock_order = Mock()
        
        # Mock database response
        db_response = [
            {"id": "00000000-0000-0000-0000-000000000001"},
            {"id": "00000000-0000-0000-0000-000000000002"},
            {"id": "00000000-0000-0000-0000-000000000003"}
        ]
        
        # Set up explicit mock chain that supports intermediate variables
        mock_client.table.return_value = mock_table
        mock_table.select.return_value = mock_select
        mock_select.eq.return_value = mock_eq  # is_archived filter
        mock_eq.eq.return_value = mock_eq  # workshop_id filter (chainable)
        mock_eq.order.return_value = mock_order
        mock_order.execute.return_value = MagicMock(data=db_response)
        
        service = NavigationService(mock_client)
        
        # Execute
        ids = service._fetch_ordered_ids(workshop_id="ws1", filters={})
        
        # Assert
        assert len(ids) == 3
        assert ids[0] == "00000000-0000-0000-0000-000000000001"
        assert ids[1] == "00000000-0000-0000-0000-000000000002"
        assert ids[2] == "00000000-0000-0000-0000-000000000003"
    
    def test_nav_06_fetch_with_empty_filters(self):
        """
        NAV-06 EDGE CASE: No filters applied, all workshop parts returned
        Scenario: Only workshop_id filter, no status/tipologia → full set
        """
        mock_client = Mock()
        mock_table = Mock()
        mock_select = Mock()
        mock_eq = Mock()
        mock_order = Mock()
        
        db_response = [
            {"id": "00000000-0000-0000-0000-000000000001"},
            {"id": "00000000-0000-0000-0000-000000000002"}
        ]
        
        mock_client.table.return_value = mock_table
        mock_table.select.return_value = mock_select
        mock_select.eq.return_value = mock_eq
        mock_eq.eq.return_value = mock_eq  # Chainable for workshop_id
        mock_eq.order.return_value = mock_order
        mock_order.execute.return_value = MagicMock(data=db_response)
        
        service = NavigationService(mock_client)
        ids = service._fetch_ordered_ids(workshop_id="ws1", filters={})
        
        assert len(ids) == 2
        mock_table.select.assert_called_once_with("id")
        # Verify is_archived filter applied first, then workshop_id
        assert mock_select.eq.call_count == 1
        assert mock_eq.eq.call_count == 1
    
    def test_nav_07_fetch_with_multiple_filters(self):
        """
        NAV-07 EDGE CASE: Multiple filters applied (status + tipologia)
        Scenario: status=validated, tipologia=capitel → subset returned
        """
        mock_client = Mock()
        mock_table = Mock()
        mock_select = Mock()
        mock_eq = Mock()
        mock_order = Mock()
        
        db_response = [
            {"id": "00000000-0000-0000-0000-000000000001"}
        ]
        
        mock_client.table.return_value = mock_table
        mock_table.select.return_value = mock_select
        mock_select.eq.return_value = mock_eq  # is_archived filter
        mock_eq.eq.return_value = mock_eq  # Chainable for workshop_id, status, tipologia
        mock_eq.order.return_value = mock_order
        mock_order.execute.return_value = MagicMock(data=db_response)
        
        service = NavigationService(mock_client)
        ids = service._fetch_ordered_ids(
            workshop_id="ws1", 
            filters={"status": "validated", "tipologia": "capitel"}
        )
        
        assert len(ids) == 1
        # Verify .eq() called for each filter: is_archived + workshop_id + status + tipologia
        assert mock_select.eq.call_count == 1  # First .eq() on select
        assert mock_eq.eq.call_count == 3  # Three chained .eq() calls


class TestFindAdjacentPositions:
    """Test _find_adjacent_positions() method - calculates prev/next from ordered list"""
    
    def test_nav_02_first_part_prev_is_none(self):
        """
        NAV-02 HAPPY PATH: First part in list → prev_id=None
        Scenario: current_id=id1 in [id1, id2, id3] → prev=None, next=id2
        """
        mock_client = Mock()
        service = NavigationService(mock_client)
        
        ids = [
            "00000000-0000-0000-0000-000000000001",
            "00000000-0000-0000-0000-000000000002",
            "00000000-0000-0000-0000-000000000003"
        ]
        current_id = "00000000-0000-0000-0000-000000000001"
        
        prev_id, next_id, idx, total = service._find_adjacent_positions(ids, current_id)
        
        assert prev_id is None
        assert next_id == "00000000-0000-0000-0000-000000000002"
        assert idx == 1  # 1-based
        assert total == 3
    
    def test_nav_03_last_part_next_is_none(self):
        """
        NAV-03 HAPPY PATH: Last part in list → next_id=None
        Scenario: current_id=id3 in [id1, id2, id3] → prev=id2, next=None
        """
        mock_client = Mock()
        service = NavigationService(mock_client)
        
        ids = [
            "00000000-0000-0000-0000-000000000001",
            "00000000-0000-0000-0000-000000000002",
            "00000000-0000-0000-0000-000000000003"
        ]
        current_id = "00000000-0000-0000-0000-000000000003"
        
        prev_id, next_id, idx, total = service._find_adjacent_positions(ids, current_id)
        
        assert prev_id == "00000000-0000-0000-0000-000000000002"
        assert next_id is None
        assert idx == 3  # 1-based
        assert total == 3
    
    def test_nav_04_single_part_both_none(self):
        """
        NAV-04 HAPPY PATH: Only one part in set → prev=None, next=None
        Scenario: current_id=id1 in [id1] → prev=None, next=None
        """
        mock_client = Mock()
        service = NavigationService(mock_client)
        
        ids = ["00000000-0000-0000-0000-000000000001"]
        current_id = "00000000-0000-0000-0000-000000000001"
        
        prev_id, next_id, idx, total = service._find_adjacent_positions(ids, current_id)
        
        assert prev_id is None
        assert next_id is None
        assert idx == 1
        assert total == 1
    
    def test_nav_05_part_not_in_filtered_set(self):
        """
        NAV-05 EDGE CASE: Current part filtered out by applied filters
        Scenario: current_id=id5 but filters return [id1, id2, id3] → error
        """
        mock_client = Mock()
        service = NavigationService(mock_client)
        
        ids = [
            "00000000-0000-0000-0000-000000000001",
            "00000000-0000-0000-0000-000000000002",
            "00000000-0000-0000-0000-000000000003"
        ]
        current_id = "00000000-0000-0000-0000-000000000005"
        
        prev_id, next_id, idx, total = service._find_adjacent_positions(ids, current_id)
        
        # Should return None values indicating part not found in set
        assert prev_id is None
        assert next_id is None
        assert idx == 0  # Not found indicator
        assert total == 3


class TestBuildCacheKey:
    """Test _build_cache_key() method - generates Redis key from filters"""
    
    def test_nav_08_cache_key_with_filters(self):
        """
        NAV-08: Cache key generation with status + tipologia filters
        Scenario: ws1 + status=validated + tipologia=capitel → unique key
        """
        mock_client = Mock()
        service = NavigationService(mock_client)
        
        key = service._build_cache_key(
            workshop_id="ws1",
            filters={"status": "validated", "tipologia": "capitel"}
        )
        
        # Key should include all filter values in deterministic order
        assert "ws1" in key
        assert "validated" in key
        assert "capitel" in key
        assert key.startswith("nav:")  # Namespace prefix
    
    def test_nav_cache_key_no_filters(self):
        """Cache key generation with no filters should differ from filtered key"""
        mock_client = Mock()
        service = NavigationService(mock_client)
        
        key1 = service._build_cache_key(workshop_id="ws1", filters={})
        key2 = service._build_cache_key(
            workshop_id="ws1", 
            filters={"status": "validated"}
        )
        
        assert key1 != key2


class TestGetAdjacentParts:
    """Test get_adjacent_parts() method - main service orchestration"""
    
    def test_nav_09_invalid_uuid_format(self):
        """
        NAV-09 SECURITY: Invalid UUID format → validation error
        Scenario: part_id="not-a-uuid" → return (False, None, "Invalid UUID")
        """
        mock_client = Mock()
        service = NavigationService(mock_client)
        
        success, data, error = service.get_adjacent_parts(
            part_id="not-a-uuid",
            workshop_id="ws1"
        )
        
        assert success is False
        assert data is None
        assert "Invalid UUID" in error or "formato inválido" in error.lower()
    
    def test_nav_10_part_not_found_404(self):
        """
        NAV-10 ERROR HANDLING: Part ID not found in database → 404
        Scenario: Valid UUID but doesn't exist → return (False, None, "not found")
        """
        mock_client = Mock()
        mock_table = Mock()
        mock_select = Mock()
        mock_eq = Mock()
        mock_order = Mock()
        
        # Mock empty result
        db_response = []
        
        mock_client.table.return_value = mock_table
        mock_table.select.return_value = mock_select
        mock_select.eq.return_value = mock_eq
        mock_eq.eq.return_value = mock_eq  # Chainable
        mock_eq.order.return_value = mock_order
        mock_order.execute.return_value = MagicMock(data=db_response)
        
        service = NavigationService(mock_client)
        success, data, error = service.get_adjacent_parts(
            part_id="00000000-0000-0000-0000-000000000999",
            workshop_id="ws1"
        )
        
        assert success is False
        assert data is None
        assert "not found" in error.lower() or "no encontrado" in error.lower()
    
    def test_nav_11_database_error_handling(self):
        """
        NAV-11 ERROR HANDLING: Database query fails → graceful error
        Scenario: Supabase raises exception → return (False, None, error)
        """
        mock_client = Mock()
        service = NavigationService(mock_client)
        
        # Mock database error
        mock_client.table().select().eq().order().execute.side_effect = Exception("DB connection lost")
        
        success, data, error = service.get_adjacent_parts(
            part_id="00000000-0000-0000-0000-000000000001",
            workshop_id="ws1"
        )
        
        assert success is False
        assert data is None
        assert "error" in error.lower()
    
    def test_nav_12_rls_enforcement(self):
        """
        NAV-12 SECURITY: RLS policy enforced via workshop_id filter
        Scenario: workshop_id always passed to .eq() filter → only workshop parts returned
        """
        mock_client = Mock()
        mock_table = Mock()
        mock_select = Mock()
        mock_eq = Mock()
        mock_order = Mock()
        mock_redis = Mock()
        
        # Mock successful response
        db_response = [
            {"id": "00000000-0000-0000-0000-000000000001"},
            {"id": "00000000-0000-0000-0000-000000000002"}
        ]
        
        mock_client.table.return_value = mock_table
        mock_table.select.return_value = mock_select
        mock_select.eq.return_value = mock_eq
        mock_eq.eq.return_value = mock_eq  # Chainable
        mock_eq.order.return_value = mock_order
        mock_order.execute.return_value = MagicMock(data=db_response)
        mock_redis.get.return_value = None  # Cache miss
        
        service = NavigationService(mock_client, redis_client=mock_redis)
        success, data, error = service.get_adjacent_parts(
            part_id="00000000-0000-0000-0000-000000000001",
            workshop_id="ws_protected"
        )
        
        # Verify workshop_id filter was applied
        # is_archived filter in select.eq(), workshop_id in eq.eq()
        assert mock_eq.eq.call_count >= 1
        assert success is True
