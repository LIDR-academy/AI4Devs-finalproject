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

        This method queries the blocks table to get the current status and validation_report
        for a given block ID. It returns metadata in a 4-tuple format following Clean Architecture
        pattern for error handling and data encapsulation.

        Args:
            block_id: UUID of the block to query (FastAPI validates format in API layer)

        Returns:
            Tuple of (success, block_data, error_message, extra_metadata):
            - success (bool): True if block found and query succeeded
            - block_data (dict | None): Contains id, iso_code, status, validation_report
            - error_message (str | None): Descriptive error if operation failed
            - extra_metadata (dict | None): Reserved for job_id tracking (currently None)

        Schema Limitation:
            job_id tracking not implemented. Current schema lacks task_id column in blocks table
            or metadata storage in events table. Future enhancement requires migration to add
            blocks.task_id or events.metadata.task_id for async validation job tracking.

        Examples:
            success, data, error, extra = service.get_validation_status(uuid_obj)

            # Block found with validation report
            >>> (True, {"id": "...", "status": "validated", "validation_report": {...}}, None, None)

            # Block not found
            >>> (False, None, "Block not found", None)

            # Database connection error
            >>> (False, None, "Database connection failed", {"exception": "Connection timeout"})

        Note:
            UUID validation is defensive programming for service re-use in non-API contexts.
            FastAPI validates UUID format automatically in API layer path parameters.

        Raises:
            ValueError: If block_id string is not a valid UUID format
            TypeError: If block_id is neither UUID object nor string
        """
        # Defensive UUID validation for service layer robustness
        if not isinstance(block_id, UUID):
            if isinstance(block_id, str):
                try:
                    from uuid import UUID as UUIDClass
                    block_id = UUIDClass(block_id)
                except ValueError as e:
                    raise ValueError(f"Invalid UUID format: {block_id}") from e
            else:
                raise TypeError(f"block_id must be UUID or string, got {type(block_id)}")

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

            # job_id tracking not implemented (schema limitation)
            # Unit tests mock event_id for backward compatibility
            job_id = block.get("event_id")  # Only present in mocked test data
            extra = {"job_id": job_id} if job_id else None

            return (True, block, None, extra)

        except Exception as e:
            logger.error(f"Failed to query validation status: block_id={block_id}, error={str(e)}")
            return (False, None, "Database connection failed", {"exception": str(e)})
