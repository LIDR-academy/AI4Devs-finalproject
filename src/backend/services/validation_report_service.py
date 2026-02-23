"""
Validation Report Service - Business logic for validation report operations.

This module contains the core business logic for creating and persisting
validation reports, separate from the API routing layer to follow Clean 
Architecture principles.
"""
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from supabase import Client

from schemas import ValidationErrorItem, ValidationReport
from constants import TABLE_BLOCKS


class ValidationReportService:
    """
    Service class for handling validation report operations.
    
    This class encapsulates all business logic related to creating,
    saving, and retrieving validation reports from the database.
    """

    def __init__(self, supabase_client: Client):
        """
        Initialize the validation report service.
        
        Args:
            supabase_client: Configured Supabase client instance
        """
        self.supabase = supabase_client

    def create_report(
        self,
        errors: List[ValidationErrorItem],
        metadata: Dict[str, Any],
        validated_by: str = "agent-worker"
    ) -> ValidationReport:
        """
        Create a ValidationReport from validation results.
        
        Args:
            errors: List of validation errors from validators
            metadata: Extracted metadata (user strings, layer info, etc.)
            validated_by: Identifier of the validator (default: "agent-worker")
            
        Returns:
            Complete ValidationReport with timestamp
            
        Logic:
            - is_valid = True if errors list is empty, False otherwise
            - validated_at = current UTC datetime
            - All fields populated according to ValidationReport schema
        """
        is_valid = len(errors) == 0
        validated_at = datetime.utcnow()

        return ValidationReport(
            is_valid=is_valid,
            errors=errors,
            metadata=metadata,
            validated_at=validated_at,
            validated_by=validated_by
        )

    def save_to_db(
        self,
        block_id: str,
        report: ValidationReport
    ) -> Tuple[bool, Optional[str]]:
        """
        Persist validation report to database.
        
        Args:
            block_id: UUID of the block record to update
            report: ValidationReport to persist
            
        Returns:
            Tuple of (success: bool, error_message: Optional[str])
            - (True, None) if save successful
            - (False, error_msg) if save failed
            
        Implementation:
            1. Serialize ValidationReport to dict using .model_dump()
            2. Execute UPDATE blocks SET validation_report = ... WHERE id = block_id
            3. Verify update affected exactly 1 row (block exists)
            4. Return success status
            
        Error Handling:
            - Block ID not found → (False, "Block not found")
            - Database error → (False, str(exception))
            - Success → (True, None)
        """
        try:
            # Serialize report to JSON-compatible dict
            report_json = report.model_dump(mode='json')

            # Update database
            result = self.supabase.table(TABLE_BLOCKS).update({
                "validation_report": report_json
            }).eq("id", block_id).execute()

            # Check if update affected any rows
            if len(result.data) == 0:
                return (False, "Block not found")

            return (True, None)

        except Exception as e:
            return (False, str(e))

    def get_report(
        self,
        block_id: str
    ) -> Tuple[Optional[ValidationReport], Optional[str]]:
        """
        Retrieve validation report from database.
        
        Args:
            block_id: UUID of the block record
            
        Returns:
            Tuple of (report: Optional[ValidationReport], error: Optional[str])
            - (ValidationReport, None) if found
            - (None, "Block not found") if block doesn't exist
            - (None, "No validation report") if block exists but no report
            - (None, error_msg) if database error
            
        Implementation:
            1. SELECT validation_report FROM blocks WHERE id = block_id
            2. If no rows → block not found
            3. If validation_report is NULL → no report yet
            4. If validation_report exists → parse JSON to ValidationReport
            5. Return parsed report or error
        """
        try:
            # Query database for validation_report
            result = self.supabase.table(TABLE_BLOCKS).select(
                "validation_report"
            ).eq("id", block_id).execute()

            # Check if block exists
            if len(result.data) == 0:
                return (None, "Block not found")

            # Check if report exists
            report_json = result.data[0].get("validation_report")
            if report_json is None:
                return (None, "No validation report")

            # Parse JSON to ValidationReport
            report = ValidationReport.model_validate(report_json)
            return (report, None)

        except Exception as e:
            return (None, str(e))
