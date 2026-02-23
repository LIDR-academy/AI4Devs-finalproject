"""
Business logic for parts listing operations.

Handles querying and transformation of parts data for 3D canvas rendering.
Implements GET /api/parts endpoint business logic (T-0501-BACK).
"""

from typing import Optional, Dict, Any
from supabase import Client

from schemas import PartCanvasItem, PartsListResponse, BoundingBox
from constants import (
    TABLE_BLOCKS,
    PARTS_LIST_SELECT_FIELDS,
    QUERY_FIELD_IS_ARCHIVED,
    QUERY_FIELD_CREATED_AT,
    QUERY_ORDER_DESC,
)


class PartsService:
    """
    Service for parts listing operations.
    
    Provides business logic for fetching parts with dynamic filtering,
    optimized for 3D canvas rendering in Dashboard (US-005).
    """
    
    def __init__(self, supabase_client: Client):
        """
        Initialize PartsService with database client.
        
        Args:
            supabase_client: Supabase client instance for database operations
        """
        self.supabase = supabase_client
    
    def _transform_row_to_part_item(self, row: Dict[str, Any]) -> PartCanvasItem:
        """
        Transform database row to PartCanvasItem Pydantic model.
        
        Handles NULL-safe extraction of optional fields (low_poly_url, bbox, workshop_id)
        and JSONB parsing for bounding box data.
        
        Args:
            row: Database row dictionary from Supabase query result
        
        Returns:
            PartCanvasItem with all fields populated from row
        """
        # Parse bbox from JSONB to Pydantic model (NULL-safe)
        bbox_data = row.get("bbox")
        bbox = None
        if bbox_data is not None:
            bbox = BoundingBox(
                min=bbox_data["min"],
                max=bbox_data["max"]
            )
        
        return PartCanvasItem(
            id=row["id"],
            iso_code=row["iso_code"],
            status=row["status"],
            tipologia=row["tipologia"],
            low_poly_url=row.get("low_poly_url"),  # NULL-safe
            bbox=bbox,
            workshop_id=row.get("workshop_id")  # NULL-safe
        )
    
    def _build_filters_applied(self, status: Optional[str], tipologia: Optional[str], workshop_id: Optional[str]) -> Dict[str, str]:
        """
        Build filters_applied dictionary from non-NULL filter parameters.
        
        Args:
            status: Status filter value
            tipologia: Tipologia filter value
            workshop_id: Workshop ID filter value
        
        Returns:
            Dictionary with only non-NULL filters included
        """
        filters = {}
        if status is not None:
            filters["status"] = status
        if tipologia is not None:
            filters["tipologia"] = tipologia
        if workshop_id is not None:
            filters["workshop_id"] = workshop_id
        return filters
    
    def list_parts(
        self,
        status: Optional[str] = None,
        tipologia: Optional[str] = None,
        workshop_id: Optional[str] = None
    ) -> PartsListResponse:
        """
        List all parts with optional filtering.
        
        Query optimization:
        - Uses composite index idx_blocks_canvas_query (status, tipologia, workshop_id)
        - Always filters is_archived=false
        - Returns minimal fields for 3D rendering (no heavy blobs)
        
        Args:
            status: Filter by lifecycle status (validated, in_fabrication, etc.)
            tipologia: Filter by part type (capitel, columna, dovela, etc.)
            workshop_id: Filter by assigned workshop UUID
        
        Returns:
            PartsListResponse with parts array, count, and filters_applied
        
        Raises:
            Exception: If database query fails (handled by API layer)
        """
        # Build query with dynamic filters
        query = self.supabase.table(TABLE_BLOCKS).select(PARTS_LIST_SELECT_FIELDS)
        
        # Always filter archived blocks
        query = query.eq(QUERY_FIELD_IS_ARCHIVED, False)
        
        # Apply optional filters
        if status is not None:
            query = query.eq("status", status)
        
        if tipologia is not None:
            query = query.eq("tipologia", tipologia)
        
        if workshop_id is not None:
            query = query.eq("workshop_id", workshop_id)
        
        # Apply ordering (newest first)
        query = query.order(QUERY_FIELD_CREATED_AT, desc=QUERY_ORDER_DESC)
        
        # Execute query
        result = query.execute()
        
        # Transform DB rows to Pydantic models
        parts = [self._transform_row_to_part_item(row) for row in result.data]
        
        # Build filters_applied dict for transparency
        filters_applied = self._build_filters_applied(status, tipologia, workshop_id)
        
        return PartsListResponse(
            parts=parts,
            count=len(parts),
            filters_applied=filters_applied
        )
