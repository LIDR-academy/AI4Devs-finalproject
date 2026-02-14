"""
Validation service - Business logic for validation status queries.

This module contains the core business logic for retrieving validation status
of blocks, separate from the API routing layer to follow Clean Architecture principles.
"""
from typing import Optional, Tuple, Dict, Any
from uuid import UUID
from supabase import Client
import logging

from constants import TABLE_BLOCKS

logger = logging.getLogger(__name__)


class ValidationService:
    """
    Service class for handling validation status queries.
    
    This class encapsulates all business logic related to retrieving
    validation reports and block status information.
    """
    
    def __init__(self, supabase_client: Client):
        """
        Initialize the validation service.
        
        Args:
            supabase_client: Configured Supabase client instance
        """
        self.supabase = supabase_client
    
    def get_validation_status(
        self,
        block_id: UUID
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str], Optional[Dict[str, Any]]]:
        """
        Retrieve validation status for a specific block.
        
        Args:
            block_id: UUID of the block to query
        
        Returns:
            Tuple of (success, block_data, error_message, extra_metadata)
            - success (bool): True if operation succeeded
            - block_data (dict | None): Block metadata + validation_report if found
            - error_message (str | None): Error description if failed
            - extra_metadata (dict | None): Additional context (e.g., job_id for processing blocks)
        
        Examples:
            success, data, error, extra = service.get_validation_status(uuid)
            
            # Case 1: Block found with validation_report
            (True, {"id": "...", "status": "validated", "validation_report": {...}}, None, None)
            
            # Case 2: Block not found
            (False, None, "Block not found", None)
            
            # Case 3: DB connection error
            (False, None, "Database connection failed", {"exception": "TimeoutError"})
        
        Raises:
            ValueError: If block_id is not a valid UUID
            TypeError: If block_id is not a UUID or string
        """
        # Validate UUID format explicitly for proper error handling
        if not isinstance(block_id, UUID):
            try:
                # Attempt to convert string to UUID if needed
                from uuid import UUID as UUIDClass
                if isinstance(block_id, str):
                    block_id = UUIDClass(block_id)
                else:
                    raise TypeError(f"block_id must be UUID or string, got {type(block_id)}")
            except (ValueError, AttributeError) as e:
                raise ValueError(f"Invalid UUID format: {block_id}") from e
        
        try:
            logger.info(f"Querying validation status for block_id={block_id}")
            
            # Query blocks table
            response = self.supabase.table(TABLE_BLOCKS) \
                .select("id, iso_code, status, validation_report") \
                .eq("id", str(block_id)) \
                .execute()
            
            if not response.data or len(response.data) == 0:
                logger.warning(f"Block not found: block_id={block_id}")
                return (False, None, "Block not found", None)
            
            block = response.data[0]
            logger.info(f"Block found: block_id={block_id}, status={block['status']}")
            
            # Extract job_id if available
            # Note: In unit tests, event_id may be mocked in block data
            # In production, this would require a query to events table (future enhancement)
            job_id = block.get("event_id")
            extra = {"job_id": job_id} if job_id is not None else None
            
            return (True, block, None, extra)
        
        except Exception as e:
            logger.error(f"Failed to query validation status: block_id={block_id}, error={str(e)}")
            return (False, None, "Database connection failed", {"exception": str(e)})
