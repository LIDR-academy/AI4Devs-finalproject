"""
Geometry Processing Tasks for Low-Poly GLB Generation (T-0502-AGENT).

This module contains Celery tasks for processing .3dm files and generating
low-poly GLB representations suitable for web visualization.
"""

import os
import psycopg2
from contextlib import contextmanager
import structlog

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
    )
except ImportError:
    # Fallback for test environment
    from src.agent.celery_app import celery_app
    from src.agent.constants import (
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
        
        # Create mesh with processing enabled (validates + repairs geometry)
        merged_mesh = trimesh.Trimesh(vertices=combined_vertices, faces=combined_faces, process=True)
        
        # Get actual face count after mesh processing (may differ from original_faces_count)
        actual_faces = len(merged_mesh.faces)
        
        logger.info("generate_low_poly_glb.merged", block_id=block_id, 
                   original_faces=original_faces_count, 
                   actual_faces=actual_faces,
                   vertices=len(merged_mesh.vertices))
        
        # Step 6: Decimate to target face count
        if actual_faces > DECIMATION_TARGET_FACES:
            logger.info("generate_low_poly_glb.decimation_attempt", 
                       block_id=block_id,
                       target=DECIMATION_TARGET_FACES,
                       is_watertight=merged_mesh.is_watertight,
                       is_volume=merged_mesh.is_volume,
                       euler_number=merged_mesh.euler_number)
            
            try:
                decimated_mesh = merged_mesh.simplify_quadric_decimation(DECIMATION_TARGET_FACES)
                decimated_faces_count = len(decimated_mesh.faces)
                
                if decimated_faces_count == actual_faces:
                    logger.warning("generate_low_poly_glb.decimation_failed",
                                 block_id=block_id,
                                 reason="Mesh geometry not suitable for quadric decimation")
                
                logger.info("generate_low_poly_glb.decimated", 
                           block_id=block_id, 
                           original=actual_faces, 
                           decimated=decimated_faces_count)
            except Exception as e:
                logger.error("generate_low_poly_glb.decimation_error",
                           block_id=block_id,
                           error=str(e))
                # Fall back to non-decimated mesh
                decimated_mesh = merged_mesh
                decimated_faces_count = actual_faces
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
