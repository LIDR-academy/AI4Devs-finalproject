"""
Celery application configuration for SF-PM Agent.

This module initializes the Celery application instance with secure
configurations for distributed task processing.
"""

from celery import Celery


# Conditional import: support both direct execution and module import
try:
    from config import settings  # When executed as worker from /app
except ModuleNotFoundError:
    from src.agent.config import settings  # When imported as module in tests

# Import constants - check for agent-specific constants to avoid backend/constants.py collision
try:
    import constants
    # Verify this is agent constants by checking for agent-specific attribute
    if hasattr(constants, 'CELERY_APP_NAME'):
        from constants import (
            CELERY_APP_NAME,
            TASK_TIME_LIMIT_SECONDS,
            TASK_SOFT_TIME_LIMIT_SECONDS,
            WORKER_PREFETCH_MULTIPLIER,
            RESULT_EXPIRES_SECONDS,
        )
    else:
        # Backend constants loaded, fallback to full path
        raise ImportError("Wrong constants module")
except (ImportError, ModuleNotFoundError):
    # Use full module path when imported as module in tests or when wrong constants found
    from src.agent.constants import (
        CELERY_APP_NAME,
        TASK_TIME_LIMIT_SECONDS,
        TASK_SOFT_TIME_LIMIT_SECONDS,
        WORKER_PREFETCH_MULTIPLIER,
        RESULT_EXPIRES_SECONDS,
    )

# Initialize Celery application
celery_app = Celery(
    CELERY_APP_NAME,
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

# Configuration
celery_app.conf.update(
    # Serialization (Security: no pickle to prevent code injection)
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],

    # Timezone
    timezone="UTC",
    enable_utc=True,

    # Task tracking
    task_track_started=True,

    # Timeouts (protection against OOM with large .3dm files)
    task_time_limit=TASK_TIME_LIMIT_SECONDS,
    task_soft_time_limit=TASK_SOFT_TIME_LIMIT_SECONDS,

    # Worker behavior
    worker_prefetch_multiplier=WORKER_PREFETCH_MULTIPLIER,

    # Result expiration
    result_expires=RESULT_EXPIRES_SECONDS,

    # Task acknowledgment
    task_acks_late=True,  # Acknowledge after task completion
)

# Import tasks to register them with Celery
# This MUST happen after celery_app is configured
try:
    import tasks  # When executed as worker from /app
except ModuleNotFoundError:
    pass  # When imported as module in tests
