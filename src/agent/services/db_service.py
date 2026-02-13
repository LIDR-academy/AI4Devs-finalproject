"""
Database Service

Handles database operations for agent worker.
Updates block status and saves validation reports.
"""

from datetime import datetime
from typing import Dict, Any, Optional
import structlog
from infra.supabase_client import get_supabase_client

logger = structlog.get_logger()


class DBService:
    """
    Service for database operations during file validation.
    
    Handles block status updates and validation report persistence.
    """
    
    def __init__(self):
        """Initialize service with Supabase client."""
        self.supabase = get_supabase_client()
    
    def update_block_status(self, part_id: str, status: str) -> bool:
        """
        Update block status in database.
        
        Args:
            part_id: Block ID
            status: New status value (e.g., 'processing', 'validated', 'error_processing')
            
        Returns:
            True if update succeeded, False otherwise
        """
        logger.info("db_service.update_block_status", part_id=part_id, status=status)
        
        try:
            result = self.supabase.table("blocks").update({
                "status": status
            }).eq("id", part_id).execute()
            
            if result.data:
                logger.info("db_service.update_block_status.success", part_id=part_id, status=status)
                return True
            else:
                logger.error("db_service.update_block_status.no_rows_affected", part_id=part_id)
                return False
                
        except Exception as e:
            logger.exception("db_service.update_block_status.error", part_id=part_id, error=str(e))
            return False
    
    def save_validation_report(
        self,
        part_id: str,
        is_valid: bool,
        errors: list,
        metadata: Dict[str, Any],
        validated_by: str
    ) -> bool:
        """
        Save validation report to database.
        
        Args:
            part_id: Block ID
            is_valid: Whether validation passed
            errors: List of validation errors
            metadata: Extracted metadata
            validated_by: Worker identifier
            
        Returns:
            True if save succeeded, False otherwise
        """
        logger.info("db_service.save_validation_report", part_id=part_id, is_valid=is_valid)
        
        try:
            # Build validation report JSON
            validation_report = {
                "is_valid": is_valid,
                "errors": errors,
                "metadata": metadata,
                "validated_at": datetime.utcnow().isoformat() + "Z",
                "validated_by": validated_by
            }
            
            # Update blocks table
            result = self.supabase.table("blocks").update({
                "validation_report": validation_report
            }).eq("id", part_id).execute()
            
            if result.data:
                logger.info("db_service.save_validation_report.success", part_id=part_id)
                return True
            else:
                logger.error("db_service.save_validation_report.no_rows_affected", part_id=part_id)
                return False
                
        except Exception as e:
            logger.exception("db_service.save_validation_report.error", part_id=part_id, error=str(e))
            return False
    
    def get_block(self, part_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch block record from database.
        
        Args:
            part_id: Block ID
            
        Returns:
            Block record as dict, or None if not found
        """
        logger.info("db_service.get_block", part_id=part_id)
        
        try:
            result = self.supabase.table("blocks").select("*").eq("id", part_id).execute()
            
            if result.data and len(result.data) > 0:
                logger.info("db_service.get_block.success", part_id=part_id)
                return result.data[0]
            else:
                logger.warning("db_service.get_block.not_found", part_id=part_id)
                return None
                
        except Exception as e:
            logger.exception("db_service.get_block.error", part_id=part_id, error=str(e))
            return None
