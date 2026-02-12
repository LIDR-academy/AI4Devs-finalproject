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
    PLACEHOLDER - To be implemented in T-024-AGENT.
    
    This task will:
    1. Download .3dm from S3 to /tmp
    2. Parse with rhino3dm.File3dm.Read()
    3. Extract metadata (T-025)
    4. Validate nomenclature (T-026)
    5. Validate geometry (T-027)
    6. Update blocks table with validation_report
    
    Args:
        part_id: UUID of the part in database
        s3_key: S3 object key for the .3dm file
    
    Raises:
        NotImplementedError: Placeholder for T-024-AGENT
    """
    logger.info("validate_file.started", part_id=part_id, s3_key=s3_key)
    # Implementation in T-024
    raise NotImplementedError("Placeholder for T-024-AGENT")
