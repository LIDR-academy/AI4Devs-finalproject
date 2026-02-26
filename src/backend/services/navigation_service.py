"""
T-1003-BACK: Part Navigation Service
Business logic for fetching adjacent part IDs for prev/next navigation.

This module provides navigation functionality for the 3D viewer modal,
allowing users to browse through parts sequentially without closing the modal.
"""
import re
import json
from typing import Optional, Tuple, List, Dict, Any
from uuid import UUID
from schemas import PartNavigationResponse
from infra.supabase_client import get_supabase_client
from infra.redis_client import get_redis_client


# UUID regex for standard format validation (reused from T-1002-BACK pattern)
UUID_PATTERN = re.compile(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    re.IGNORECASE
)


class NavigationService:
    """Service for fetching adjacent part IDs with caching and RLS enforcement.

    This service handles navigation between parts in the 3D viewer modal,
    supporting optional filters (workshop_id, status, tipologia) and
    ordered traversal by created_at timestamp.
    """

    def __init__(self, supabase_client=None, redis_client=None):
        """Initialize NavigationService with database and cache clients.

        Args:
            supabase_client: Optional Supabase client instance (for testing/DI).
                            Defaults to get_supabase_client() singleton.
            redis_client: Optional Redis client for caching (for testing/DI).
                         Defaults to get_redis_client() singleton.
                         If None passed explicitly, caching is disabled.
        """
        self.client = supabase_client or get_supabase_client()
        # Only get Redis client if not explicitly set to None
        if redis_client is None and supabase_client is None:
            # Production mode: try to get Redis
            self.redis = get_redis_client()
        else:
            # Test mode: use provided client (could be Mock or None)
            self.redis = redis_client

    def get_adjacent_parts(
        self,
        part_id: str,
        workshop_id: Optional[str] = None,
        status: Optional[str] = None,
        tipologia: Optional[str] = None
    ) -> Tuple[bool, Optional[PartNavigationResponse], Optional[str]]:
        """Fetch prev/next part IDs for navigation in filtered set.

        Implements the main orchestration logic for adjacent part navigation.
        Validates UUID, queries database with filters, calculates adjacent positions,
        and constructs response following Clean Architecture pattern.

        Algorithm:
            1. Validate part_id UUID format (regex + UUID class)
            2. Query blocks table with filters + order by created_at ASC
            3. Extract list of IDs only (minimal payload)
            4. Find index of current part_id in ordered list
            5. Calculate prev_id (index-1) and next_id (index+1)
            6. Construct PartNavigationResponse with 1-based index

        Args:
            part_id: UUID of current part to find neighbors for.
            workshop_id: Optional filter by workshop UUID (RLS enforcement).
            status: Optional filter by lifecycle status (e.g., "validated").
            tipologia: Optional filter by part type (e.g., "capitel").

        Returns:
            Tuple of (success, data, error):
                success (bool): True if operation succeeded, False otherwise.
                data (PartNavigationResponse | None): Response with prev/next IDs if success.
                error (str | None): Error message if success=False.

        Examples:
            >>> service = NavigationService()
            >>> success, data, error = service.get_adjacent_parts(
            ...     part_id="550e8400-e29b-41d4-a716-446655440000",
            ...     workshop_id="granollers"
            ... )
            >>> if success:
            ...     print(f"Prev: {data.prev_id}, Next: {data.next_id}")
        """
        # 1. Validate UUID format
        if not part_id or not UUID_PATTERN.match(part_id):
            return False, None, "Invalid UUID format"

        try:
            UUID(part_id)
        except (ValueError, AttributeError, TypeError):
            return False, None, "Invalid UUID format"

        # 2. Build filters dict
        filters = {}
        if status is not None:
            filters['status'] = status
        if tipologia is not None:
            filters['tipologia'] = tipologia

        # 3. Try cache hit (if Redis available)
        cache_key = self._build_cache_key(workshop_id, filters)
        ordered_ids = None

        if self.redis:
            try:
                cached = self.redis.get(cache_key)
                if cached:
                    ordered_ids = json.loads(cached)
            except Exception:
                # Cache read failed, continue to DB query
                pass

        # 4. Cache miss: Fetch ordered list of IDs from database
        if ordered_ids is None:
            try:
                ordered_ids = self._fetch_ordered_ids(workshop_id, filters)

                # Store in cache with 5min TTL (if Redis available)
                if self.redis and ordered_ids:
                    try:
                        self.redis.setex(
                            cache_key,
                            300,  # 5 minutes TTL
                            json.dumps(ordered_ids)
                        )
                    except Exception:
                        # Cache write failed, continue anyway (graceful degradation)
                        pass
            except Exception as e:
                return False, None, f"Database error: {str(e)}"

        # 5. Check if part exists in filtered set
        if not ordered_ids:
            return False, None, "Part not found in filtered set"

        # 6. Find adjacent positions
        prev_id, next_id, current_index, total_count = self._find_adjacent_positions(
            ordered_ids, part_id
        )

        # Check if part was found (current_index == 0 means not found)
        if current_index == 0:
            return False, None, "Part not found in filtered set"

        # 7. Build response
        from uuid import UUID as UUIDType
        response = PartNavigationResponse(
            prev_id=UUIDType(prev_id) if prev_id else None,
            next_id=UUIDType(next_id) if next_id else None,
            current_index=current_index,
            total_count=total_count
        )

        return True, response, None

    def _build_cache_key(self, workshop_id: Optional[str], filters: Dict[str, Any]) -> str:
        """Build deterministic cache key from workshop_id and filters.

        Args:
            workshop_id: Workshop UUID (optional).
            filters: Dict with optional status, tipologia keys.

        Returns:
            str: Cache key in format "nav:{ws}:{status}:{tipologia}".

        Examples:
            >>> service._build_cache_key("ws1", {"status": "validated"})
            'nav:ws1:validated:null'
        """
        # Build deterministic key from filters (sorted for consistency)
        ws = workshop_id or 'null'
        status = filters.get('status', 'null')
        tipologia = filters.get('tipologia', 'null')
        return f"nav:{ws}:{status}:{tipologia}"

    def _fetch_ordered_ids(
        self,
        workshop_id: Optional[str],
        filters: Dict[str, Any]
    ) -> List[str]:
        """Fetch list of part IDs with filters applied, ordered by created_at ASC.

        Reuses filter logic pattern from PartsService (T-0501-BACK).
        Always filters out archived parts (is_archived=false).

        Args:
            workshop_id: Optional filter by workshop UUID.
            filters: Dict with optional 'status' and 'tipologia' keys.

        Returns:
            List[str]: Part IDs as UUID strings, ordered by created_at ascending.

        Raises:
            Exception: Database query errors propagate to caller for handling.
        """
        # Start with base query: select id, exclude archived parts
        query = self.client.table("blocks").select("id").eq("is_archived", False)

        # Apply optional filters dynamically
        if workshop_id is not None:
            query = query.eq("workshop_id", workshop_id)
        if filters.get('status') is not None:
            query = query.eq("status", filters['status'])
        if filters.get('tipologia') is not None:
            query = query.eq("tipologia", filters['tipologia'])

        # Execute with ordering (created_at ASC for chronological navigation)
        result = query.order("created_at", desc=False).execute()

        # Extract IDs as list of strings
        return [row["id"] for row in result.data]

    def _find_adjacent_positions(
        self,
        ordered_ids: List[str],
        current_id: str
    ) -> Tuple[Optional[str], Optional[str], int, int]:
        """Find prev_id, next_id, current_index (1-based), total_count.

        Calculates adjacent positions for navigation, handling edge cases
        (first part has no prev, last part has no next).

        Args:
            ordered_ids: List of all part IDs in filtered set (ordered by created_at).
            current_id: UUID string of current part to find neighbors for.

        Returns:
            Tuple of (prev_id, next_id, current_index, total_count):
                prev_id (str | None): Previous part UUID, None if first.
                next_id (str | None): Next part UUID, None if last.
                current_index (int): 1-based position (0 if not found).
                total_count (int): Total parts in filtered set.

        Examples:
            >>> service._find_adjacent_positions(["id1", "id2", "id3"], "id2")
            ('id1', 'id3', 2, 3)
            >>> service._find_adjacent_positions(["id1"], "id1")
            (None, None, 1, 1)
        """
        try:
            # Find 0-based index of current part
            index = ordered_ids.index(current_id)
        except ValueError:
            # Part not found in filtered set (filtered out by applied filters)
            return (None, None, 0, len(ordered_ids))

        # Calculate adjacent IDs (boundary-safe)
        prev_id = ordered_ids[index - 1] if index > 0 else None
        next_id = ordered_ids[index + 1] if index < len(ordered_ids) - 1 else None

        # Return 1-based index and total count
        return (prev_id, next_id, index + 1, len(ordered_ids))
