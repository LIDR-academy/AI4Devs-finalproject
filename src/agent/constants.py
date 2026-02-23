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

# Validation Patterns
# ISO-19650 nomenclature:  [PREFIX]-[ZONE/CODE]-[TYPE]-[ID]
# Examples: SF-NAV-CO-001, SFC-NAV1-A-999, AB-CD12-XY-123
# Pattern breakdown:
#   - [A-Z]{2,3}: 2-3 uppercase letters (project prefix)
#   - [A-Z0-9]{3,4}: 3-4 alphanumeric uppercase (zone/code)
#   - [A-Z]{1,2}: 1-2 uppercase letters (element type)
#   - \d{3}: exactly 3 digits (sequential ID)
ISO_19650_LAYER_NAME_PATTERN = r"^[A-Z]{2,3}-[A-Z0-9]{3,4}-[A-Z]{1,2}-\d{3}$"
ISO_19650_PATTERN_DESCRIPTION = "[PREFIX]-[ZONE]-[TYPE]-[ID] (e.g., SF-NAV-CO-001)"

# Geometry Validation
GEOMETRY_CATEGORY_NAME = "geometry"
MIN_VALID_VOLUME = 1e-6  # Minimum volume in cubic units (avoid near-zero volumes)
MAX_3DM_FILE_SIZE_MB = 500  # Maximum file size for .3dm files (prevent zip bomb DoS)

# Geometry Error Messages Templates
GEOMETRY_ERROR_INVALID = "Geometry is marked as invalid by Rhino (obj.Geometry.IsValid = False)"
GEOMETRY_ERROR_NULL = "Geometry is null or missing"
GEOMETRY_ERROR_DEGENERATE_BBOX = "Bounding box is degenerate or invalid"
GEOMETRY_ERROR_ZERO_VOLUME = "Solid geometry has zero or near-zero volume (< {min_volume} cubic units)"

# ===== T-0502-AGENT: Geometry Processing =====

# Task Names
TASK_GENERATE_LOW_POLY_GLB = "agent.generate_low_poly_glb"

# Decimation Targets
DECIMATION_TARGET_FACES = 1000  # ~1000 triangles for Low-Poly (POC validated 60 FPS with 1197 meshes = 39,360 tris)
MAX_ORIGINAL_FACES_WARNING = 100_000  # Log warning if geometry exceeds 100K faces (timeout risk)

# File Size Limits
MAX_GLB_SIZE_KB = 500  # Target: <500KB with Draco compression (POC: 778KB uncompressed → 300-400KB expected)
MAX_3DM_DOWNLOAD_SIZE_MB = 500  # Reject .3dm files >500MB (timeout risk)

# S3/Storage Configuration
PROCESSED_GEOMETRY_BUCKET = "processed-geometry"
LOW_POLY_PREFIX = "low-poly/"
RAW_UPLOADS_BUCKET = "raw-uploads"

# Temp File Paths
TEMP_DIR = "/tmp"  # Docker container temp directory

# Error Messages
ERROR_MSG_NO_MESHES_FOUND = "No meshes found in {iso_code}"
ERROR_MSG_BLOCK_NOT_FOUND = "Block {block_id} not found in database"
ERROR_MSG_FAILED_PARSE_3DM = "Failed to parse .3dm file for {iso_code}"
ERROR_MSG_S3_DOWNLOAD_FAILED = "S3 download failed after {retries} retries"
