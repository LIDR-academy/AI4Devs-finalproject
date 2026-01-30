# TASK-US-005-02: Implement Filebase Service

## Parent User Story
[US-005: File Upload to IPFS](../../user-stories/backend/US-005-file-upload-ipfs.md)

## Description
Create the IPFS service layer that integrates with Filebase's S3-compatible API using boto3. Implement circuit breaker and retry patterns for resilience.

## Priority
🔴 Critical

## Estimated Time
4 hours

## Detailed Steps

### 1. Create core/services/ipfs_service.py
```python
"""IPFS Service for Filebase S3-compatible API integration."""

import logging
from typing import BinaryIO, Optional
from dataclasses import dataclass

import boto3
from botocore.exceptions import ClientError, BotoCoreError
from pybreaker import CircuitBreaker
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from config.default import (
    FILEBASE_ENDPOINT_URL,
    FILEBASE_IPFS_API_KEY,
    FILEBASE_IPFS_API_SECRET,
    FILEBASE_BUCKET_NAME,
    CIRCUIT_BREAKER_FAIL_MAX,
    CIRCUIT_BREAKER_RESET_TIMEOUT,
)

logger = logging.getLogger(__name__)


@dataclass
class UploadResult:
    """Result of a file upload operation."""
    cid: str
    size: int
    key: str


@dataclass
class RetrieveResult:
    """Result of a file retrieval operation."""
    content: bytes
    content_type: str
    size: int
    filename: str


class IPFSServiceError(Exception):
    """Base exception for IPFS service errors."""
    pass


class UploadError(IPFSServiceError):
    """Exception raised when file upload fails."""
    pass


class RetrieveError(IPFSServiceError):
    """Exception raised when file retrieval fails."""
    pass


class PinningError(IPFSServiceError):
    """Exception raised when pinning operation fails."""
    pass


# Circuit breaker for Filebase API
filebase_circuit_breaker = CircuitBreaker(
    fail_max=CIRCUIT_BREAKER_FAIL_MAX,
    reset_timeout=CIRCUIT_BREAKER_RESET_TIMEOUT,
    exclude=[ValueError],  # Don't count validation errors
)


class IPFSService:
    """Service for interacting with Filebase IPFS via S3 API."""
    
    def __init__(self):
        """Initialize the IPFS service with S3 client."""
        self._client = None
    
    @property
    def client(self):
        """Lazy initialization of S3 client."""
        if self._client is None:
            self._client = boto3.client(
                "s3",
                endpoint_url=FILEBASE_ENDPOINT_URL,
                aws_access_key_id=FILEBASE_IPFS_API_KEY,
                aws_secret_access_key=FILEBASE_IPFS_API_SECRET,
            )
        return self._client
    
    @filebase_circuit_breaker
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((ClientError, BotoCoreError)),
        before_sleep=lambda retry_state: logger.warning(
            f"Retrying upload, attempt {retry_state.attempt_number}"
        ),
    )
    def upload_file(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str = "application/octet-stream",
        metadata: Optional[dict] = None,
    ) -> UploadResult:
        """Upload a file to IPFS via Filebase.
        
        Args:
            file: File-like object to upload.
            filename: Safe filename for the upload.
            content_type: MIME type of the file.
            metadata: Optional metadata to store with the file.
            
        Returns:
            UploadResult: Contains CID, size, and key.
            
        Raises:
            UploadError: If upload fails after retries.
        """
        try:
            # Get file size
            file.seek(0, 2)  # Seek to end
            size = file.tell()
            file.seek(0)  # Seek back to start
            
            extra_args = {
                "ContentType": content_type,
            }
            if metadata:
                extra_args["Metadata"] = metadata
            
            logger.info(f"Uploading file: {filename}, size: {size}")
            
            # Upload to Filebase
            self.client.upload_fileobj(
                file,
                FILEBASE_BUCKET_NAME,
                filename,
                ExtraArgs=extra_args,
            )
            
            # Get the CID from response headers
            response = self.client.head_object(
                Bucket=FILEBASE_BUCKET_NAME,
                Key=filename,
            )
            
            cid = response["Metadata"].get("cid", "")
            
            if not cid:
                # Fallback: CID might be in different location
                cid = response.get("ResponseMetadata", {}).get(
                    "HTTPHeaders", {}
                ).get("x-amz-meta-cid", "")
            
            logger.info(f"Upload successful. CID: {cid}")
            
            return UploadResult(cid=cid, size=size, key=filename)
            
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Upload failed: {e}")
            raise UploadError(f"Failed to upload file: {e}") from e
    
    @filebase_circuit_breaker
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((ClientError, BotoCoreError)),
    )
    def retrieve_file(self, key: str) -> RetrieveResult:
        """Retrieve a file from IPFS via Filebase.
        
        Args:
            key: The object key (filename) in the bucket.
            
        Returns:
            RetrieveResult: Contains content, content_type, size, filename.
            
        Raises:
            RetrieveError: If retrieval fails.
        """
        try:
            logger.info(f"Retrieving file: {key}")
            
            response = self.client.get_object(
                Bucket=FILEBASE_BUCKET_NAME,
                Key=key,
            )
            
            content = response["Body"].read()
            content_type = response.get("ContentType", "application/octet-stream")
            size = response.get("ContentLength", len(content))
            
            logger.info(f"Retrieved file: {key}, size: {size}")
            
            return RetrieveResult(
                content=content,
                content_type=content_type,
                size=size,
                filename=key,
            )
            
        except ClientError as e:
            if e.response["Error"]["Code"] == "NoSuchKey":
                raise RetrieveError("File not found") from e
            raise RetrieveError(f"Failed to retrieve file: {e}") from e
        except BotoCoreError as e:
            raise RetrieveError(f"Failed to retrieve file: {e}") from e
    
    @filebase_circuit_breaker
    def pin_content(self, cid: str) -> bool:
        """Pin content on IPFS.
        
        Note: Filebase automatically pins content on upload.
        This method is for explicit pinning operations if needed.
        
        Args:
            cid: The IPFS content identifier.
            
        Returns:
            bool: True if pinning successful.
        """
        # Filebase automatically pins on upload
        # Implement additional pinning logic if needed
        logger.info(f"Content pinned: {cid}")
        return True
    
    @filebase_circuit_breaker
    def unpin_content(self, key: str) -> bool:
        """Unpin/delete content from Filebase.
        
        Args:
            key: The object key to unpin/delete.
            
        Returns:
            bool: True if unpinning successful.
        """
        try:
            self.client.delete_object(
                Bucket=FILEBASE_BUCKET_NAME,
                Key=key,
            )
            logger.info(f"Content unpinned: {key}")
            return True
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Unpin failed: {e}")
            raise PinningError(f"Failed to unpin content: {e}") from e
    
    def check_circuit_breaker_state(self) -> str:
        """Get the current state of the circuit breaker.
        
        Returns:
            str: Circuit breaker state (closed, open, half-open).
        """
        return filebase_circuit_breaker.current_state


# Singleton instance
ipfs_service = IPFSService()
```

### 2. Update Configuration
Add to `config/default.py`:
```python
# Filebase Configuration
FILEBASE_ENDPOINT_URL = env.get("FILEBASE_ENDPOINT_URL", "https://s3.filebase.com")
FILEBASE_IPFS_API_KEY = env.get("FILEBASE_IPFS_API_KEY", "")
FILEBASE_IPFS_API_SECRET = env.get("FILEBASE_IPFS_API_SECRET", "")
FILEBASE_BUCKET_NAME = env.get("FILEBASE_BUCKET_NAME", "")

# Circuit Breaker Configuration
CIRCUIT_BREAKER_FAIL_MAX = int(env.get("CIRCUIT_BREAKER_FAIL_MAX", "5"))
CIRCUIT_BREAKER_RESET_TIMEOUT = int(env.get("CIRCUIT_BREAKER_RESET_TIMEOUT", "60"))
```

## Acceptance Criteria
- [ ] IPFSService class is implemented with all methods
- [ ] Circuit breaker is configured and working
- [ ] Retry logic handles transient errors
- [ ] Proper error handling and logging
- [ ] All methods have proper type hints and docstrings

## Notes
- Filebase uses S3-compatible API
- CID is returned in response headers
- Circuit breaker prevents cascading failures
- Tenacity provides configurable retry logic

## Completion Status
- [ ] 0% - Not Started
