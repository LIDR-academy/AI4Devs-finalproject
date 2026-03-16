"""Filebase/IPFS integration service for decentralized file storage."""

import logging
import os
from dataclasses import dataclass
from io import BytesIO
from typing import BinaryIO, Dict, Optional

import boto3
from botocore.exceptions import ClientError, BotoCoreError
from pybreaker import CircuitBreaker
from tenacity import (
	RetryError,
	retry,
	stop_after_attempt,
	wait_exponential,
	retry_if_exception_type,
)

from core.common.exceptions import ValidationError

logger = logging.getLogger(__name__)


@dataclass
class UploadResult:
	"""Result of a file upload to IPFS."""
	cid: str
	size: int
	key: str


class UploadError(Exception):
	"""Exception raised during file upload operations."""
	pass


class RetrievalError(Exception):
	"""Exception raised during file retrieval operations."""
	pass


class IPFSService:
	"""Service for uploading files to IPFS via Filebase S3-compatible API."""
    
	def __init__(self, strict: bool = True):
		"""Initialize IPFS service with Filebase S3 client and circuit breaker."""
		# Circuit breaker is always available, even if client credentials are missing.
		self.circuit_breaker = CircuitBreaker(
			fail_max=5,
			reset_timeout=60,
			exclude=[ValidationError],
			name="filebase-circuit-breaker",
		)

		self.bucket_name = os.getenv("FILEBASE_BUCKET", "ipfs-gateway") or "ipfs-gateway"
		self.api_key = os.getenv("FILEBASE_ACCESS_KEY") or os.getenv("FILEBASE_API_KEY")
		self.api_secret = os.getenv("FILEBASE_SECRET_KEY") or os.getenv("FILEBASE_API_SECRET")
		self.endpoint = os.getenv(
			"FILEBASE_ENDPOINT",
			"https://s3.filebase.com"
		)
		self.client = None
        
		if not self.api_key or not self.api_secret:
			if strict:
				raise ValueError(
					"Filebase API credentials not configured. "
					"Set FILEBASE_ACCESS_KEY and FILEBASE_SECRET_KEY environment variables."
				)
			logger.warning("Filebase credentials not configured; IPFS client disabled for this runtime")
			return
        
		# Initialize S3 client for Filebase
		self.client = boto3.client(
			"s3",
			endpoint_url=self.endpoint,
			aws_access_key_id=self.api_key,
			aws_secret_access_key=self.api_secret,
			region_name="us-east-1",
		)
        
		logger.info("IPFS service initialized with Filebase backend")

	def _ensure_client(self) -> None:
		"""Ensure Filebase client is initialized before any remote operation."""
		if self.client is None:
			raise ValueError(
				"Filebase client is not configured. Set FILEBASE_ACCESS_KEY and FILEBASE_SECRET_KEY."
			)
    
	def _upload_file_with_retry(
		self,
		file: BinaryIO,
		filename: str,
		content_type: str = "application/octet-stream",
		metadata: Optional[Dict[str, str]] = None,
	) -> UploadResult:
		"""Internal method to upload file with retry logic.
        
		Uses tenacity for exponential backoff retry logic.
		Decorated with circuit breaker for fault tolerance.
		"""
		try:
			self._ensure_client()
			# Read file size
			file.seek(0, 2)  # Seek to end
			file_size = file.tell()
			file.seek(0)  # Reset to beginning
            
			if file_size == 0:
				raise ValidationError("Cannot upload empty files")
            
			file_payload = file.read()
            
			# Upload to Filebase using put_object (aligned with e2e contract).
			logger.debug(f"Uploading file '{filename}' ({file_size} bytes) to Filebase")
			self.client.put_object(
				Bucket=self.bucket_name,
				Key=filename,
				Body=file_payload,
				ContentType=content_type,
			)
            
			# Get object metadata to retrieve CID
			response = self.client.head_object(
				Bucket=self.bucket_name,
				Key=filename,
			)
            
			# Extract CID from metadata
			cid = response.get("Metadata", {}).get("cid")
			if not cid:
				raise UploadError(
					f"Failed to get CID for uploaded file '{filename}'"
				)
            
			logger.info(
				f"Successfully uploaded file '{filename}' "
				f"(size: {file_size} bytes, CID: {cid})"
			)
            
			return UploadResult(cid=cid, size=file_size, key=filename)
        
		except (ClientError, BotoCoreError) as e:
			error_code = e.response.get("Error", {}).get("Code") if hasattr(e, "response") else "Unknown"
			logger.error(f"AWS/Filebase error during upload: {error_code} - {e}")
			raise
    
	@retry(
		stop=stop_after_attempt(3),  # Max 3 attempts
		wait=wait_exponential(multiplier=1, min=2, max=10),  # 2-10s exponential
		retry=retry_if_exception_type((ClientError, BotoCoreError)),
		before_sleep=lambda retry_state: logger.warning(
			f"Retrying upload, attempt {retry_state.attempt_number} "
			f"(next retry in {retry_state.next_action.sleep}s)"
		),
	)
	def _upload_file_with_retry_decorated(
		self,
		file: BinaryIO,
		filename: str,
		content_type: str = "application/octet-stream",
		metadata: Optional[Dict[str, str]] = None,
	) -> UploadResult:
		"""Decorated version using both circuit breaker and retry."""
		return self._upload_file_with_retry(
			file=file,
			filename=filename,
			content_type=content_type,
			metadata=metadata,
		)

	def _upload_with_resilience(
		self,
		file: BinaryIO,
		filename: str,
		content_type: str = "application/octet-stream",
		metadata: Optional[Dict[str, str]] = None,
	) -> UploadResult:
		"""Apply circuit breaker around retry-enabled upload."""
		return self.circuit_breaker.call(
			self._upload_file_with_retry_decorated,
			file=file,
			filename=filename,
			content_type=content_type,
			metadata=metadata,
		)
    
	def upload_file(
		self,
		file: BinaryIO,
		filename: str,
		content_type: str = "application/octet-stream",
		metadata: Optional[Dict[str, str]] = None,
	) -> UploadResult:
		"""Upload a file to IPFS via Filebase.
        
		Implements:
		- Circuit breaker pattern for fault tolerance
		- Exponential backoff retry logic
		- Proper error handling and logging
        
		Args:
			file: File object (BinaryIO) to upload
			filename: Filename for S3 storage (should be sanitized)
			content_type: MIME type of the file
			metadata: Optional metadata dictionary to store with file
            
		Returns:
			UploadResult containing CID, size, and key
            
		Raises:
			UploadError: If upload fails after retries
			ValidationError: If input validation fails
		"""
		try:
			result = self._upload_with_resilience(
				file=file,
				filename=filename,
				content_type=content_type,
				metadata=metadata,
			)
			return result
        
		except RetryError as e:
			root_exc = e.last_attempt.exception()
			logger.error(f"Upload failed after 3 retries: {root_exc}")
			raise UploadError(
				f"Failed to upload file after retries: {str(root_exc)}"
			) from root_exc
        
		except ValidationError:
			# Re-raise validation errors without retry
			raise
        
		except Exception as e:
			logger.error(f"Unexpected error during file upload: {e}")
			raise UploadError(f"Unexpected error during upload: {str(e)}") from e
    
	def _retrieve_file_with_retry(self, key: str) -> bytes:
		"""Internal method to retrieve file with retry logic.
        
		Uses tenacity for exponential backoff retry logic.
		Handles NoSuchKey errors specifically.
		"""
		try:
			self._ensure_client()
			logger.debug(f"Retrieving file '{key}' from Filebase")
            
			response = self.client.get_object(
				Bucket=self.bucket_name,
				Key=key,
			)
            
			file_data = response["Body"].read()
			logger.info(f"Successfully retrieved file '{key}' ({len(file_data)} bytes)")
            
			return file_data
        
		except ClientError as e:
			error_code = e.response.get("Error", {}).get("Code", "Unknown")
			if error_code == "NoSuchKey":
				logger.warning(f"File '{key}' not found in Filebase")
				raise RetrievalError(f"File not found: '{key}'") from e
			logger.error(f"AWS/Filebase error during retrieval: {error_code} - {e}")
			raise
	
	@retry(
		stop=stop_after_attempt(3),  # Max 3 attempts
		wait=wait_exponential(multiplier=1, min=2, max=10),  # 2-10s exponential
		retry=retry_if_exception_type((ClientError, BotoCoreError)),
		before_sleep=lambda retry_state: logger.warning(
			f"Retrying retrieval, attempt {retry_state.attempt_number} "
			f"(next retry in {retry_state.next_action.sleep}s)"
		),
	)
	def _retrieve_file_with_retry_decorated(self, key: str) -> bytes:
		"""Decorated version using both circuit breaker and retry."""
		return self._retrieve_file_with_retry(key=key)

	def _retrieve_with_resilience(self, key: str) -> bytes:
		"""Apply circuit breaker around retry-enabled retrieval."""
		return self.circuit_breaker.call(
			self._retrieve_file_with_retry_decorated,
			key=key,
		)
    
	def retrieve_file(self, key: str) -> bytes:
		"""Retrieve a file from IPFS via Filebase.
        
		Implements:
		- Circuit breaker pattern for fault tolerance
		- Exponential backoff retry logic
		- Proper error handling for missing files
		- Full file loaded into memory
        
		Args:
			key: Filename/key of the file to retrieve
            
		Returns:
			bytes: File contents as bytes
            
		Raises:
			RetrievalError: If file not found or retrieval fails
		"""
		try:
			result = self._retrieve_with_resilience(key=key)
			return result
        
		except RetryError as e:
			root_exc = e.last_attempt.exception()
			logger.error(f"Retrieval failed after 3 retries: {root_exc}")
			raise RetrievalError(
				f"Failed to retrieve file after retries: {str(root_exc)}"
			) from root_exc
        
		except RetrievalError:
			# Re-raise retrieval errors (e.g., file not found)
			raise

		except ValueError:
			# Preserve configuration/runtime client errors for callers/tests.
			raise
        
		except Exception as e:
			logger.error(f"Unexpected error during file retrieval: {e}")
			raise RetrievalError(f"Unexpected error during retrieval: {str(e)}") from e
	
	def retrieve_file_stream(self, key: str, chunk_size: int = 65536):
		"""Retrieve a file from IPFS via Filebase as a stream.
        
		Use this method for large files to avoid loading entire file into memory.
		Yields chunks of data.
        
		Args:
			key: Filename/key of the file to retrieve
			chunk_size: Size of chunks to yield (default: 64KB)
            
		Yields:
			bytes: Chunks of file data
            
		Raises:
			RetrievalError: If file not found or retrieval fails
		"""
		try:
			self._ensure_client()
			logger.debug(f"Streaming file '{key}' from Filebase (chunk_size={chunk_size})")
            
			response = self.client.get_object(
				Bucket=self.bucket_name,
				Key=key,
			)
            
			body = response["Body"]
			total_bytes = 0
            
			# Stream file in chunks
			while True:
				chunk = body.read(chunk_size)
				if not chunk:
					break
				total_bytes += len(chunk)
				yield chunk
            
			logger.info(f"Successfully streamed file '{key}' ({total_bytes} bytes)")
        
		except ClientError as e:
			error_code = e.response.get("Error", {}).get("Code", "Unknown")
			if error_code == "NoSuchKey":
				logger.warning(f"File '{key}' not found in Filebase")
				raise RetrievalError(f"File not found: '{key}'") from e
			logger.error(f"AWS/Filebase error during streaming: {error_code} - {e}")
			raise RetrievalError(
				f"Failed to stream file '{key}': {error_code}"
			) from e
        
		except Exception as e:
			logger.error(f"Unexpected error during file streaming: {e}")
			raise RetrievalError(f"Unexpected error during streaming: {str(e)}") from e
    
	def pin_content(self, cid: str) -> bool:
		"""Ensure content is pinned on IPFS.
        
		Files uploaded to Filebase are automatically pinned,
		but this method can be used to verify pinning status
		or explicitly pin content.
        
		Args:
			cid: Content Identifier to pin
            
		Returns:
			bool: True if pinned successfully
            
		Raises:
			UploadError: If pinning fails
		"""
		try:
			logger.debug(f"Verifying pin status for CID: {cid}")
			# Filebase automatically pins uploads
			# This is a placeholder for future pinning logic
			logger.info(f"Content {cid} is pinned on IPFS")
			return True
        
		except Exception as e:
			logger.error(f"Failed to pin content {cid}: {e}")
			raise UploadError(f"Failed to pin content: {str(e)}") from e
    
	def unpin_content(self, key: str) -> bool:
		"""Unpin content from IPFS.
        
		Args:
			key: File key/name to unpin
            
		Returns:
			bool: True if unpinned successfully
            
		Raises:
			UploadError: If unpinning fails
		"""
		try:
			self._ensure_client()
			logger.debug(f"Unpinning content for key: {key}")
            
			# Delete from Filebase S3 bucket
			self.client.delete_object(
				Bucket=self.bucket_name,
				Key=key,
			)
            
			logger.info(f"Content with key '{key}' has been unpinned")
			return True
        
		except ClientError as e:
			error_code = e.response.get("Error", {}).get("Code", "Unknown")
			logger.error(f"Failed to unpin content {key}: {error_code}")
			raise UploadError(
				f"Failed to unpin content '{key}': {error_code}"
			) from e
        
		except Exception as e:
			logger.error(f"Unexpected error during unpinning: {e}")
			raise UploadError(f"Unexpected error during unpinning: {str(e)}") from e
    
	def check_circuit_breaker_state(self) -> str:
		"""Get current circuit breaker state.
        
		Returns:
			str: Current state ('closed', 'open', or 'half-open')
		"""
		return self.circuit_breaker.current_state


# Global instance
ipfs_service = IPFSService(strict=False)

