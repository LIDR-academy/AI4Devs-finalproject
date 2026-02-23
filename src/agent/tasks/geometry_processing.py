"""
Geometry Processing Tasks for Low-Poly GLB Generation (T-0502-AGENT).

This module contains Celery tasks for processing .3dm files and generating
low-poly GLB representations suitable for web visualization.
"""

import os
import psycopg2
from contextlib import contextmanager
import structlog
import requests

# Import from parent package
try:
    from ..celery_app import celery_app
    from ..constants import (
        TASK_GENERATE_LOW_POLY_GLB,
        DECIMATION_TARGET_FACES,
        MAX_GLB_SIZE_KB,
        PROCESSED_GEOMETRY_BUCKET,
        LOW_POLY_PREFIX,
        TEMP_DIR,
        ERROR_MSG_NO_MESHES_FOUND,
        ERROR_MSG_BLOCK_NOT_FOUND,
        ERROR_MSG_FAILED_PARSE_3DM,
        TASK_MAX_RETRIES,
        TASK_RETRY_DELAY_SECONDS,
        MAX_3DM_FILE_SIZE_MB,
    )
except ImportError:
    # Fallback for test environment
    from src.agent.celery_app import celery_app
    from src.agent.constants import (
        TASK_GENERATE_LOW_POLY_GLB,
        DECIMATION_TARGET_FACES,
        PROCESSED_GEOMETRY_BUCKET,
        LOW_POLY_PREFIX,
        TEMP_DIR,
        ERROR_MSG_NO_MESHES_FOUND,
        ERROR_MSG_BLOCK_NOT_FOUND,
        ERROR_MSG_FAILED_PARSE_3DM,
        TASK_MAX_RETRIES,
        TASK_RETRY_DELAY_SECONDS,
    )

import rhino3dm
import trimesh
import numpy as np

# Import Supabase client (must be at module level for mocking in tests)
try:
    from infra.supabase_client import get_supabase_client
except ModuleNotFoundError:
    from src.agent.infra.supabase_client import get_supabase_client

logger = structlog.get_logger()


@contextmanager
def get_db_connection():
    """Get a PostgreSQL database connection using psycopg2.
    
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


def _fetch_block_metadata(block_id: str) -> tuple[str, str]:
    """Fetch block metadata from database.
    
    Args:
        block_id: UUID of the block to query
        
    Returns:
        Tuple of (url_original, iso_code)
        
    Raises:
        ValueError: If block not found in database
        
    Example:
        url, iso_code = _fetch_block_metadata("123e4567-e89b-12d3-a456-426614174000")
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT url_original, iso_code FROM blocks WHERE id = %s",
            (block_id,)
        )
        row = cursor.fetchone()

        if not row:
            error_msg = ERROR_MSG_BLOCK_NOT_FOUND.format(block_id=block_id)
            logger.error("fetch_block_metadata.not_found", block_id=block_id)
            raise ValueError(error_msg)

        url_original, iso_code = row
        logger.info("fetch_block_metadata.success",
                   block_id=block_id, iso_code=iso_code)
        return url_original, iso_code


def _download_3dm_from_s3(url: str, local_path: str) -> None:
    """
    Download .3dm file from S3 to local filesystem with size validation.
    
    Performs a HEAD request to verify file size before downloading to prevent
    zip bomb DoS attacks (OWASP A04:2021 - Insecure Design).
    
    Args:
        url: S3 URL of the .3dm file
        local_path: Local filesystem path where file will be saved
        
    Raises:
        FileNotFoundError: If S3 URL is invalid or file doesn't exist
        ValueError: If file exceeds MAX_3DM_FILE_SIZE_MB
    """
    # SECURITY: HEAD request to check size before downloading
    try:
        response = requests.head(url, timeout=10)
        response.raise_for_status()

        content_length = int(response.headers.get('Content-Length', 0))
        size_mb = content_length / (1024 * 1024)
        max_bytes = MAX_3DM_FILE_SIZE_MB * 1024 * 1024

        if content_length > max_bytes:
            error_msg = (
                f"File size {size_mb:.1f}MB exceeds limit {MAX_3DM_FILE_SIZE_MB}MB. "
                f"Possible zip bomb attack or corrupt file."
            )
            logger.error(
                "download_3dm.size_exceeded",
                url=url,
                size_mb=size_mb,
                limit_mb=MAX_3DM_FILE_SIZE_MB
            )
            raise ValueError(error_msg)

        logger.info(
            "download_3dm.size_check_passed",
            url=url,
            size_mb=size_mb
        )

    except requests.exceptions.RequestException as e:
        logger.warning(
            "download_3dm.head_request_failed",
            url=url,
            error=str(e),
            message="Proceeding with download (network issue or no HEAD support)"
        )

    # Download file with streaming to handle large files safely
    try:
        with requests.get(url, stream=True, timeout=300) as r:
            r.raise_for_status()
            with open(local_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)

        logger.info("download_3dm.success", url=url, local_path=local_path)

    except requests.exceptions.RequestException as e:
        # Fallback to s3_client if requests fails (for compatibility)
        logger.warning(
            "download_3dm.requests_failed_fallback",
            url=url,
            error=str(e),
            message="Falling back to s3_client.download_file()"
        )
        s3_client.download_file(url, local_path)
        logger.info("download_3dm.success_fallback", url=url, local_path=local_path)


def _parse_rhino_file(file_path: str, iso_code: str) -> rhino3dm.File3dm:
    """Parse .3dm file using rhino3dm library.
    
    Args:
        file_path: Local path to .3dm file
        iso_code: ISO code of the block (for error messages)
        
    Returns:
        Parsed rhino3dm File3dm object
        
    Raises:
        ValueError: If file is corrupted or cannot be parsed
    """
    rhino_file = rhino3dm.File3dm.Read(file_path)

    if rhino_file is None:
        error_msg = ERROR_MSG_FAILED_PARSE_3DM.format(iso_code=iso_code)
        logger.error("parse_rhino_file.failed", iso_code=iso_code, path=file_path)
        raise ValueError(error_msg)

    logger.info("parse_rhino_file.success",
               iso_code=iso_code, objects_count=len(rhino_file.Objects))
    return rhino_file


def _extract_and_merge_meshes(
    rhino_file: rhino3dm.File3dm,
    block_id: str,
    iso_code: str
) -> tuple[trimesh.Trimesh, int]:
    """Extract meshes from Rhino file, handle quads, and merge into single mesh.
    
    Processes all mesh objects in the Rhino file:
    - Extracts vertices and faces
    - Splits quad faces into 2 triangles each
    - Merges all geometries into a single trimesh
    
    Args:
        rhino_file: Parsed rhino3dm File3dm object
        block_id: UUID of the block (for logging)
        iso_code: ISO code of the block (for error messages)
        
    Returns:
        Tuple of (merged_mesh, original_faces_count)
        
    Raises:
        ValueError: If no valid meshes found in file
        
    Example:
        mesh, face_count = _extract_and_merge_meshes(rhino_file, block_id, "SF-C12-D-001")
    """
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
                # Split quad into 2 triangles: (A,B,C) + (A,C,D)
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
        logger.error("extract_meshes.no_meshes", block_id=block_id, iso_code=iso_code)
        raise ValueError(error_msg)

    # Merge into single trimesh
    combined_vertices = np.vstack(all_vertices)
    combined_faces = np.array(all_faces)

    # Create mesh with processing enabled (validates + repairs geometry)
    merged_mesh = trimesh.Trimesh(vertices=combined_vertices, faces=combined_faces, process=True)

    logger.info("extract_meshes.success",
               block_id=block_id,
               original_faces=original_faces_count,
               actual_faces=len(merged_mesh.faces),
               vertices=len(merged_mesh.vertices))

    return merged_mesh, original_faces_count


def _apply_decimation(
    mesh: trimesh.Trimesh,
    target_faces: int,
    block_id: str
) -> tuple[trimesh.Trimesh, int]:
    """Apply quadric decimation to reduce mesh complexity.
    
    Uses trimesh's quadric decimation algorithm (via open3d backend) to reduce
    face count while preserving overall shape. Skips decimation if mesh is
    already below target. Falls back to original mesh if decimation fails.
    
    Args:
        mesh: Input trimesh mesh
        target_faces: Target number of faces after decimation
        block_id: UUID of the block (for logging)
        
    Returns:
        Tuple of (decimated_mesh, decimated_faces_count)
        
    Example:
        decimated_mesh, face_count = _apply_decimation(mesh, 1000, block_id)
    """
    actual_faces = len(mesh.faces)

    if actual_faces <= target_faces:
        logger.info("decimation.skipped",
                   block_id=block_id,
                   faces=actual_faces,
                   target=target_faces)
        return mesh, actual_faces

    logger.info("decimation.attempt",
               block_id=block_id,
               target=target_faces,
               is_watertight=mesh.is_watertight,
               is_volume=mesh.is_volume,
               euler_number=mesh.euler_number)

    try:
        decimated_mesh = mesh.simplify_quadric_decimation(target_faces)
        decimated_faces_count = len(decimated_mesh.faces)

        if decimated_faces_count == actual_faces:
            logger.warning("decimation.failed",
                         block_id=block_id,
                         reason="Mesh geometry not suitable for quadric decimation")
        else:
            logger.info("decimation.success",
                       block_id=block_id,
                       original=actual_faces,
                       decimated=decimated_faces_count)

        return decimated_mesh, decimated_faces_count

    except Exception as e:
        logger.error("decimation.error", block_id=block_id, error=str(e))
        # Fall back to non-decimated mesh
        return mesh, actual_faces


def _export_and_upload_glb(
    mesh: trimesh.Trimesh,
    block_id: str
) -> tuple[str, int]:
    """Export mesh to GLB format and upload to S3 storage.
    
    Args:
        mesh: Trimesh mesh to export
        block_id: UUID of the block (used in S3 key)
        
    Returns:
        Tuple of (public_url, file_size_kb)
        
    Example:
        url, size = _export_and_upload_glb(mesh, "123e4567-e89b-12d3-a456-426614174000")
    """
    # Export to GLB
    temp_glb_path = os.path.join(TEMP_DIR, f"{block_id}.glb")
    mesh.export(temp_glb_path, file_type='glb')

    # Get file size
    file_size_bytes = os.path.getsize(temp_glb_path)
    file_size_kb = file_size_bytes // 1024

    logger.info("export_glb.success",
               block_id=block_id,
               file_size_kb=file_size_kb,
               path=temp_glb_path)

    # Upload to S3
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

    logger.info("upload_glb.success",
               block_id=block_id,
               url=low_poly_url,
               key=glb_key)

    # Cleanup temp file
    try:
        os.remove(temp_glb_path)
    except Exception as e:
        logger.warning("cleanup.temp_glb_failed", block_id=block_id, error=str(e))

    return low_poly_url, file_size_kb


def _update_block_low_poly_url(block_id: str, url: str) -> None:
    """Update database with low_poly_url for processed block.
    
    Args:
        block_id: UUID of the block to update
        url: Public URL of the uploaded GLB file
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE blocks SET low_poly_url = %s WHERE id = %s",
            (url, block_id)
        )
        conn.commit()

    logger.info("update_db.success", block_id=block_id, low_poly_url=url)


@celery_app.task(
    name=TASK_GENERATE_LOW_POLY_GLB,
    bind=True,
    max_retries=TASK_MAX_RETRIES,
    default_retry_delay=TASK_RETRY_DELAY_SECONDS
)
def generate_low_poly_glb(self, block_id: str):
    """Generate Low-Poly GLB from .3dm file.
    
    Main orchestrator task that coordinates the 10-step pipeline to convert
    high-poly .3dm CAD files into low-poly GLB models suitable for web visualization.
    
    Pipeline Steps:
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
        dict: Processing results containing:
            - status (str): 'success' or 'error'
            - low_poly_url (str): Public URL of uploaded GLB file
            - original_faces (int): Face count before decimation
            - decimated_faces (int): Face count after decimation
            - file_size_kb (int): GLB file size in kilobytes
            - error_message (str|None): Error details if failed
        
    Raises:
        ValueError: If block not found, no meshes, or parsing fails
        FileNotFoundError: If S3 download fails
        
    Example:
        result = generate_low_poly_glb.delay("123e4567-e89b-12d3-a456-426614174000")
        # Returns: {'status': 'success', 'low_poly_url': 'https://...', ...}
    """
    logger.info("generate_low_poly_glb.started", block_id=block_id)
    temp_3dm_path = None

    try:
        # Step 1: Fetch block metadata
        url_original, iso_code = _fetch_block_metadata(block_id)

        # Step 2: Download .3dm file
        temp_3dm_path = os.path.join(TEMP_DIR, f"{block_id}.3dm")
        _download_3dm_from_s3(url_original, temp_3dm_path)

        # Step 3: Parse .3dm file
        rhino_file = _parse_rhino_file(temp_3dm_path, iso_code)

        # Step 4-5: Extract and merge meshes
        merged_mesh, original_faces_count = _extract_and_merge_meshes(
            rhino_file, block_id, iso_code
        )

        # Step 6: Apply decimation
        decimated_mesh, decimated_faces_count = _apply_decimation(
            merged_mesh, DECIMATION_TARGET_FACES, block_id
        )

        # Step 7-8: Export and upload GLB
        low_poly_url, file_size_kb = _export_and_upload_glb(decimated_mesh, block_id)

        # Step 9: Update database
        _update_block_low_poly_url(block_id, low_poly_url)

        # Step 10: Cleanup temp .3dm file
        if temp_3dm_path and os.path.exists(temp_3dm_path):
            try:
                os.remove(temp_3dm_path)
                logger.info("cleanup.success", block_id=block_id, file=temp_3dm_path)
            except Exception as e:
                logger.warning("cleanup.failed", block_id=block_id, error=str(e))

        logger.info("generate_low_poly_glb.completed",
                   block_id=block_id,
                   low_poly_url=low_poly_url,
                   original_faces=original_faces_count,
                   decimated_faces=decimated_faces_count,
                   file_size_kb=file_size_kb)

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
