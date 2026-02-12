"""
Agent Worker Constants

Centralized configuration values for Celery worker and task execution.
Following Clean Architecture pattern (separation from config.py which handles env vars).
"""

# Celery Worker Configuration
CELERY_APP_NAME = "sf_pm_agent"

# Task Execution Timeouts
# Large .3dm files (up to 500MB) can take several minutes to parse with rhino3dm
TASK_TIME_LIMIT_SECONDS = 600  # 10 minutes hard kill
TASK_SOFT_TIME_LIMIT_SECONDS = 540  # 9 minutes warning (allows cleanup)

# Worker Behavior
WORKER_PREFETCH_MULTIPLIER = 1  # One task at a time (isolate large file processing)

# Result Storage
RESULT_EXPIRES_SECONDS = 3600  # 1 hour (results cleaned up automatically)

# Task Retry Policy
TASK_MAX_RETRIES = 3
TASK_RETRY_DELAY_SECONDS = 60  # 1 minute between retries

# Task Names (for type safety and refactoring)
TASK_HEALTH_CHECK = "agent.tasks.health_check"
TASK_VALIDATE_FILE = "agent.tasks.validate_file"
