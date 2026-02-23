"""
Celery task definitions for SF-PM Agent.

This module contains all async tasks executed by the Celery worker,
including health checks and file validation workflows.
"""

import os

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


# ===== T-0502-AGENT: Low-Poly GLB Generation =====

import psycopg2  # noqa: E402
from contextlib import contextmanager  # noqa: E402

# Additional imports for geometry processing
try:
    import constants
    if hasattr(constants, 'TASK_GENERATE_LOW_POLY_GLB'):
        from constants import (
            TASK_GENERATE_LOW_POLY_GLB,
            DECIMATION_TARGET_FACES,
            PROCESSED_GEOMETRY_BUCKET,
            LOW_POLY_PREFIX,
            TEMP_DIR,
            ERROR_MSG_NO_MESHES_FOUND,
            ERROR_MSG_BLOCK_NOT_FOUND,
            ERROR_MSG_FAILED_PARSE_3DM,
        )
    else:
        raise ImportError("Wrong constants module")
except (ImportError, ModuleNotFoundError):
    from src.agent.constants import (
        TASK_GENERATE_LOW_POLY_GLB,
        DECIMATION_TARGET_FACES,
        PROCESSED_GEOMETRY_BUCKET,
        LOW_POLY_PREFIX,
        TEMP_DIR,
        ERROR_MSG_NO_MESHES_FOUND,
        ERROR_MSG_BLOCK_NOT_FOUND,
        ERROR_MSG_FAILED_PARSE_3DM,
    )

import rhino3dm  # noqa: E402
import trimesh  # noqa: E402
import numpy as np  # noqa: E402


@contextmanager
def get_db_connection():
    """
    Get a PostgreSQL database connection using psycopg2.

    Returns a context manager that yields a connection object.
    Connection is automatically closed after use.

    Yields:
        psycopg2.connection: Database connection
    """
    database_url = os.environ.get("DATABASE_URL", "postgresql://user:password@db:5432/sfpm_db")
    conn = psycopg2.connect(database_url)
    try:
        yield conn
    finally:
        conn.close()


# Mock S3 client for testing (will be replaced by real implementation)
class S3Client:
    """Mock S3 client for testing purposes."""

    def download_file(self, url: str, local_path: str):
        """Download file from S3 URL to local path."""
        pass

    def upload(self, bucket: str, key: str, file_path: str):
        """Upload file to S3 bucket."""
        pass


# Global S3 client instance (mocked in tests)
s3_client = S3Client()


@celery_app.task(
    name=TASK_GENERATE_LOW_POLY_GLB,
    bind=True,
    max_retries=TASK_MAX_RETRIES,
    default_retry_delay=TASK_RETRY_DELAY_SECONDS
)
def generate_low_poly_glb(self, block_id: str):
    """
    Generate Low-Poly GLB from .3dm file.

    Algorithm:
    1. Fetch block metadata from database (url_original, iso_code)
    2. Download .3dm file from S3 to temp directory
    3. Parse .3dm with rhino3dm
    4. Extract meshes and handle quad faces
    5. Merge all meshes into single trimesh
    6. Decimate to target face count (~1000 triangles)
    7. Export to GLB format
    8. Upload GLB to S3 (processed-geometry/low-poly/)
    9. Update database with low_poly_url
    10. Cleanup temp files

    Args:
        block_id: UUID of the block to process

    Returns:
        dict with status, low_poly_url, original_faces, decimated_faces, file_size_kb

    Raises:
        ValueError: If block not found, no meshes, or parsing fails
        FileNotFoundError: If S3 download fails
    """
    logger.info("generate_low_poly_glb.started", block_id=block_id)

    try:
        # Import supabase client
        try:
            from infra.supabase_client import get_supabase_client
        except ModuleNotFoundError:
            from src.agent.infra.supabase_client import get_supabase_client

        # Step 1: Fetch block metadata from database
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT url_original, iso_code FROM blocks WHERE id = %s",
                (block_id,)
            )
            row = cursor.fetchone()

            if not row:
                error_msg = ERROR_MSG_BLOCK_NOT_FOUND.format(block_id=block_id)
                logger.error("generate_low_poly_glb.block_not_found", block_id=block_id)
                raise ValueError(error_msg)

            url_original, iso_code = row

        logger.info("generate_low_poly_glb.metadata_fetched",
                   block_id=block_id, iso_code=iso_code, url_original=url_original)

        # Step 2: Download .3dm file from S3
        temp_3dm_path = os.path.join(TEMP_DIR, f"{block_id}.3dm")
        s3_client.download_file(url_original, temp_3dm_path)

        logger.info("generate_low_poly_glb.downloaded", block_id=block_id, path=temp_3dm_path)

        # Step 3: Parse .3dm with rhino3dm
        rhino_file = rhino3dm.File3dm.Read(temp_3dm_path)

        if rhino_file is None:
            error_msg = ERROR_MSG_FAILED_PARSE_3DM.format(iso_code=iso_code)
            logger.error("generate_low_poly_glb.parse_failed", block_id=block_id, iso_code=iso_code)
            raise ValueError(error_msg)

        logger.info("generate_low_poly_glb.parsed", block_id=block_id,
                   objects_count=len(rhino_file.Objects))

        # Step 4: Extract meshes and handle quad faces
        all_vertices = []
        all_faces = []
        vertex_offset = 0
        original_faces_count = 0

        for obj in rhino_file.Objects:
            # Check if object is a mesh (ObjectType == 1)
            if hasattr(obj.Geometry, 'ObjectType') and obj.Geometry.ObjectType != 1:
                continue

            mesh = obj.Geometry

            # Extract vertices
            vertices = np.array([[v.X, v.Y, v.Z] for v in mesh.Vertices])

            # Extract faces and handle quads
            for face in mesh.Faces:
                if face.IsQuad:
                    # Split quad into 2 triangles
                    all_faces.append([face.A + vertex_offset, face.B + vertex_offset, face.C + vertex_offset])
                    all_faces.append([face.A + vertex_offset, face.C + vertex_offset, face.D + vertex_offset])
                    original_faces_count += 2
                else:
                    # Triangle
                    all_faces.append([face.A + vertex_offset, face.B + vertex_offset, face.C + vertex_offset])
                    original_faces_count += 1

            all_vertices.append(vertices)
            vertex_offset += len(vertices)

        if not all_vertices:
            error_msg = ERROR_MSG_NO_MESHES_FOUND.format(iso_code=iso_code)
            logger.error("generate_low_poly_glb.no_meshes", block_id=block_id, iso_code=iso_code)
            raise ValueError(error_msg)

        # Step 5: Merge into single trimesh
        combined_vertices = np.vstack(all_vertices)
        combined_faces = np.array(all_faces)

        merged_mesh = trimesh.Trimesh(vertices=combined_vertices, faces=combined_faces)

        logger.info("generate_low_poly_glb.merged", block_id=block_id,
                   original_faces=original_faces_count, vertices=len(combined_vertices))

        # Step 6: Decimate to target face count
        if original_faces_count > DECIMATION_TARGET_FACES:
            decimated_mesh = merged_mesh.simplify_quadric_decimation(DECIMATION_TARGET_FACES)
            decimated_faces_count = len(decimated_mesh.faces)
            logger.info("generate_low_poly_glb.decimated",
                       block_id=block_id,
                       original=original_faces_count,
                       decimated=decimated_faces_count)
        else:
            # Skip decimation if already below target
            decimated_mesh = merged_mesh
            decimated_faces_count = original_faces_count
            logger.info("generate_low_poly_glb.skip_decimation",
                       block_id=block_id,
                       faces=original_faces_count)

        # Step 7: Export to GLB
        temp_glb_path = os.path.join(TEMP_DIR, f"{block_id}.glb")
        decimated_mesh.export(temp_glb_path, file_type='glb')

        # Get file size
        file_size_bytes = os.path.getsize(temp_glb_path)
        file_size_kb = file_size_bytes // 1024

        logger.info("generate_low_poly_glb.exported",
                   block_id=block_id,
                   file_size_kb=file_size_kb)

        # Step 8: Upload to S3
        supabase = get_supabase_client()
        glb_key = f"{LOW_POLY_PREFIX}{block_id}.glb"

        with open(temp_glb_path, 'rb') as f:
            glb_data = f.read()

        supabase.storage.from_(PROCESSED_GEOMETRY_BUCKET).upload(
            glb_key,
            glb_data,
            {'content-type': 'model/gltf-binary'}
        )

        # Get public URL
        low_poly_url = supabase.storage.from_(PROCESSED_GEOMETRY_BUCKET).get_public_url(glb_key)

        logger.info("generate_low_poly_glb.uploaded",
                   block_id=block_id,
                   url=low_poly_url)

        # Step 9: Update database with low_poly_url
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE blocks SET low_poly_url = %s WHERE id = %s",
                (low_poly_url, block_id)
            )
            conn.commit()

        logger.info("generate_low_poly_glb.db_updated", block_id=block_id)

        # Step 10: Cleanup temp files
        try:
            os.remove(temp_3dm_path)
            os.remove(temp_glb_path)
        except Exception as e:
            logger.warning("generate_low_poly_glb.cleanup_failed", error=str(e))

        # Return result
        return {
            'status': 'success',
            'low_poly_url': low_poly_url,
            'original_faces': original_faces_count,
            'decimated_faces': decimated_faces_count,
            'file_size_kb': file_size_kb,
            'error_message': None
        }

    except Exception as e:
        logger.exception("generate_low_poly_glb.error", block_id=block_id, error=str(e))
        raise
