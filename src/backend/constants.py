"""
Application constants for the Sagrada Familia Parts Manager.

This module centralizes all hardcoded values used across the backend
to improve maintainability and avoid magic strings.
"""

# ===== Storage Configuration =====
STORAGE_BUCKET_RAW_UPLOADS = "raw-uploads"
STORAGE_BUCKET_PROCESSED = "processed-files"

# ===== Event Types =====
EVENT_TYPE_UPLOAD_CONFIRMED = "upload.confirmed"
EVENT_TYPE_PROCESSING_STARTED = "processing.started"
EVENT_TYPE_PROCESSING_COMPLETED = "processing.completed"
EVENT_TYPE_PROCESSING_FAILED = "processing.failed"
EVENT_TYPE_VALIDATION_PASSED = "validation.passed"
EVENT_TYPE_VALIDATION_FAILED = "validation.failed"

# ===== Database Tables =====
TABLE_EVENTS = "events"
TABLE_FILES = "files"
TABLE_PARTS = "parts"

# ===== File Validation =====
ALLOWED_EXTENSION = ".3dm"
MAX_FILE_SIZE_MB = 500
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# ===== Upload Configuration =====
STORAGE_UPLOAD_PATH_PREFIX = "uploads"
PRESIGNED_URL_EXPIRATION_SECONDS = 300  # 5 minutes
