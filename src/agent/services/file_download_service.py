"""
File Download Service

Handles downloading files from Supabase Storage (S3-compatible).
Downloads .3dm files to temporary directory for processing.
"""

import os
from pathlib import Path
import tempfile
import structlog
from infra.supabase_client import get_supabase_client

logger = structlog.get_logger()

# Storage bucket constant
STORAGE_BUCKET_RAW_UPLOADS = "raw-uploads"


class FileDownloadService:
    """
    Service for downloading files from Supabase Storage.
    
    Handles S3 download operations with error handling and cleanup.
    """
    
    def __init__(self):
        """Initialize service with Supabase client."""
        self.supabase = get_supabase_client()
        self.temp_dir = Path("/tmp/sf-pm-agent")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
    
    def download_from_s3(self, s3_key: str) -> tuple[bool, str, str]:
        """
        Download file from S3 to temporary directory.
        
        Args:
            s3_key: S3 key/path of the file (e.g., "uploads/file.3dm")
            
        Returns:
            Tuple of (success, local_path, error_message)
            - success: Whether download succeeded
            - local_path: Absolute path to downloaded file if success=True
            - error_message: Error description if success=False
        """
        logger.info("file_download.download_from_s3.started", s3_key=s3_key)
        
        try:
            # Generate unique temp filename
            filename = Path(s3_key).name
            local_path = self.temp_dir / filename
            
            # Download file from Supabase Storage
            response = self.supabase.storage.from_(STORAGE_BUCKET_RAW_UPLOADS).download(s3_key)
            
            if response is None:
                error_msg = f"S3 download failed: File not found for key {s3_key}"
                logger.error("file_download.download_from_s3.not_found", s3_key=s3_key)
                return False, "", error_msg
            
            # Write to disk
            with open(local_path, 'wb') as f:
                f.write(response)
            
            logger.info(
                "file_download.download_from_s3.success",
                s3_key=s3_key,
                local_path=str(local_path),
                size_bytes=len(response)
            )
            
            return True, str(local_path), ""
            
        except Exception as e:
            error_msg = f"S3 download error: {str(e)}"
            logger.exception("file_download.download_from_s3.error", s3_key=s3_key, error=str(e))
            return False, "", error_msg
    
    def cleanup_temp_file(self, file_path: str) -> None:
        """
        Delete temporary file after processing.
        
        Args:
            file_path: Path to temporary file
        """
        try:
            path = Path(file_path)
            if path.exists():
                path.unlink()
                logger.info("file_download.cleanup_temp_file.success", file_path=file_path)
        except Exception as e:
            logger.warning("file_download.cleanup_temp_file.error", file_path=file_path, error=str(e))
