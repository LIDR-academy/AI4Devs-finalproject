"""
Celery task definitions for SF-PM Agent.

This module contains all async tasks executed by the Celery worker,
including health checks and file validation workflows.
"""

# Conditional import: support both direct execution and module import
try:
    from celery_app import celery_app  # When executed as worker from /app
except ModuleNotFoundError:
    from src.agent.celery_app import celery_app  # When imported as module in tests

# Import constants - check for agent-specific constants
try:
    import constants
    if hasattr(constants, 'TASK_HEALTH_CHECK'):
        from constants import (
            TASK_HEALTH_CHECK,
            TASK_VALIDATE_FILE,
            TASK_MAX_RETRIES,
            TASK_RETRY_DELAY_SECONDS,
        )
    else:
        raise ImportError("Wrong constants module")
except (ImportError, ModuleNotFoundError):
    from src.agent.constants import (
        TASK_HEALTH_CHECK,
        TASK_VALIDATE_FILE,
        TASK_MAX_RETRIES,
        TASK_RETRY_DELAY_SECONDS,
    )

import structlog
from datetime import datetime

logger = structlog.get_logger()


@celery_app.task(
    name=TASK_HEALTH_CHECK,
    bind=True,
    max_retries=0
)
def health_check(self):
    """
    Dummy task for infrastructure validation.
    
    Returns worker metadata to confirm Celery is operational.
    Used by integration tests to verify worker connectivity.
    
    Returns:
        dict: Status metadata including worker_id, hostname, timestamp
    """
    return {
        "status": "healthy",
        "worker_id": self.request.id,
        "hostname": self.request.hostname,
        "timestamp": datetime.utcnow().isoformat() if not self.request.eta else str(self.request.eta)
    }


@celery_app.task(
    name=TASK_VALIDATE_FILE,
    bind=True,
    max_retries=TASK_MAX_RETRIES,
    default_retry_delay=TASK_RETRY_DELAY_SECONDS
)
def validate_file(self, part_id: str, s3_key: str):
    """
    Validate .3dm file from S3.
    
    This task:
    1. Updates block status to 'processing'
    2. Downloads .3dm from S3 to /tmp
    3. Parses with rhino3dm.File3dm.Read()
    4. Extracts layer metadata
    5. Saves validation report to database
    6. Updates block status to 'validated' or 'error_processing'
    7. Cleans up temporary files
    
    Args:
        part_id: UUID of the part in database
        s3_key: S3 object key for the .3dm file
    
    Returns:
        dict: Result with success status and metadata
    """
    logger.info("validate_file.started", part_id=part_id, s3_key=s3_key)
    
    # Import services
    try:
        from services.file_download_service import FileDownloadService
        from services.rhino_parser_service import RhinoParserService
        from services.db_service import DBService
    except ModuleNotFoundError:
        from src.agent.services.file_download_service import FileDownloadService
        from src.agent.services.rhino_parser_service import RhinoParserService
        from src.agent.services.db_service import DBService
    
    # Initialize services
    file_download = FileDownloadService()
    rhino_parser = RhinoParserService()
    db_service = DBService()
    
    # Worker identifier for audit trail
    worker_id = self.request.hostname or "unknown-worker"
    
    try:
        # Step 1: Update status to processing
        db_service.update_block_status(part_id, "processing")
        
        # Step 2: Download file from S3
        success, local_path, download_error = file_download.download_from_s3(s3_key)
        
        if not success:
            logger.error("validate_file.download_failed", part_id=part_id, error=download_error)
            
            # Save error to validation report
            db_service.save_validation_report(
                part_id=part_id,
                is_valid=False,
                errors=[{
                    "category": "io",
                    "target": s3_key,
                    "message": download_error
                }],
                metadata={},
                validated_by=worker_id
            )
            
            # Update status to error
            db_service.update_block_status(part_id, "error_processing")
            
            return {
                "success": False,
                "error": download_error
            }
        
        # Step 3: Parse .3dm file
        parse_result = rhino_parser.parse_file(local_path)
        
        # Step 4: Cleanup temp file
        file_download.cleanup_temp_file(local_path)
        
        # Step 5: Process results
        if not parse_result.success:
            logger.error("validate_file.parse_failed", part_id=part_id, error=parse_result.error_message)
            
            # Save error to validation report
            db_service.save_validation_report(
                part_id=part_id,
                is_valid=False,
                errors=[{
                    "category": "io",
                    "target": s3_key,
                    "message": parse_result.error_message
                }],
                metadata={},
                validated_by=worker_id
            )
            
            # Update status to error
            db_service.update_block_status(part_id, "error_processing")
            
            return {
                "success": False,
                "error": parse_result.error_message
            }
        
        # Step 6: Build metadata from parsed layers
        layers_metadata = [
            {
                "name": layer.name,
                "index": layer.index,
                "object_count": layer.object_count,
                "color": layer.color,
                "is_visible": layer.is_visible
            }
            for layer in parse_result.layers
        ]
        
        metadata = {
            "layers": layers_metadata,
            **parse_result.file_metadata
        }
        
        # Step 7: Save validation report (no errors for MVP - T-026/T-027 add validation)
        db_service.save_validation_report(
            part_id=part_id,
            is_valid=True,
            errors=[],
            metadata=metadata,
            validated_by=worker_id
        )
        
        # Step 8: Update status to validated
        db_service.update_block_status(part_id, "validated")
        
        logger.info(
            "validate_file.success",
            part_id=part_id,
            layer_count=len(parse_result.layers)
        )
        
        return {
            "success": True,
            "part_id": part_id,
            "layer_count": len(parse_result.layers),
            "metadata": metadata
        }
        
    except Exception as e:
        logger.exception("validate_file.unexpected_error", part_id=part_id, error=str(e))
        
        # Save error to validation report
        try:
            db_service.save_validation_report(
                part_id=part_id,
                is_valid=False,
                errors=[{
                    "category": "io",
                    "target": s3_key,
                    "message": f"Unexpected error: {str(e)}"
                }],
                metadata={},
                validated_by=worker_id
            )
            
            db_service.update_block_status(part_id, "error_processing")
        except Exception as db_error:
            logger.exception("validate_file.db_error_during_error_handling", error=str(db_error))
        
        return {
            "success": False,
            "error": str(e)
        }
