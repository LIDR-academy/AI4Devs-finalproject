# TASK-US-005-04: Implement Retry Logic

[Trello Card](https://trello.com/c/XpDNmBX9)

## Parent User Story
[US-005: File Upload to IPFS](../../user-stories/backend/US-005-file-upload-ipfs.md)

## Description
Configure retry logic using the tenacity library with exponential backoff. Handle transient errors from boto3 (ClientError, BotoCoreError) with proper logging and gradual delay increases.

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Retry Configuration in IPFSService
The retry logic is already configured in `backend/core/services/ipfs_service.py`:

```python
from tenacity import (
    RetryError,
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

@filebase_circuit_breaker
@retry(
    stop=stop_after_attempt(3),  # Max 3 attempts
    wait=wait_exponential(multiplier=1, min=2, max=10),  # 2-10s exponential backoff
    retry=retry_if_exception_type((ClientError, BotoCoreError)),
    before_sleep=lambda retry_state: logger.warning(
        f"Retrying upload, attempt {retry_state.attempt_number}"
    ),
)
def _upload_file_with_retry(self, ...):
    """Upload with retry logic."""
    pass
```

### 2. Backoff Strategy Details
- **First retry**: 2 seconds (min)
- **Second retry**: 4-10 seconds (exponential)
- **Third retry**: Up to 10 seconds (max cap)
- **After 3 failures**: Return UploadError to caller

### 3. Error Handling in Upload Method
The `upload_file()` method wraps the retry logic and converts exceptions:

```python
def upload_file(self, file: BinaryIO, filename: str, ...) -> UploadResult:
    """Upload with proper error handling."""
    try:
        return self._upload_file_with_retry(
            file=file,
            filename=filename,
            content_type=content_type,
            metadata=metadata,
        )
    except RetryError as e:
        root_exc = e.last_attempt.exception()
        logger.error(f"Upload failed after retries: {root_exc}")
        raise UploadError(
            f"Failed to upload file after retries: {root_exc}"
        ) from root_exc
```

### 4. Logging Configuration
Add detailed retry logging to `backend/server/config/logs.py`:

```python
# Configure tenacity retry logging
logging.getLogger("tenacity").setLevel(logging.WARNING)

# Example log output:
# WARNING [tenacity] Retrying upload, attempt 1
# WARNING [tenacity] Retrying upload, attempt 2
# ERROR [core.services.ipfs_service] Upload failed after retries: ...
```

### 5. Create Retry Logic Tests
Create `backend/tests/backend/test_retry_logic.py`:

```python
"""Tests for retry logic with exponential backoff."""

import time
import unittest
from unittest.mock import patch, MagicMock

from botocore.exceptions import ClientError
from tenacity import RetryError

from core.services.ipfs_service import ipfs_service, UploadError


class TestRetryLogic(unittest.TestCase):
    """Test retry mechanism."""
    
    def test_retry_succeeds_on_second_attempt(self):
        """Retry should succeed if error is transient."""
        with patch.object(ipfs_service, 'client') as mock_client:
            # Fail first, succeed second
            mock_client.upload_fileobj.side_effect = [
                ClientError({"Error": {"Code": "ServiceUnavailable"}}, "PutObject"),
                None
            ]
            mock_client.head_object.return_value = {
                "Metadata": {"cid": "QmTest123"}
            }
            
            file = MagicMock()
            file.read.return_value = b"test data"
            file.seek.return_value = None
            file.tell.return_value = 9
            
            result = ipfs_service.upload_file(file=file, filename="test.txt")
            
            self.assertEqual(result.cid, "QmTest123")
            self.assertEqual(mock_client.upload_fileobj.call_count, 2)
    
    def test_retry_fails_after_max_attempts(self):
        """Should fail after max retries."""
        with patch.object(ipfs_service, 'client') as mock_client:
            # Always fail
            mock_client.upload_fileobj.side_effect = ClientError(
                {"Error": {"Code": "ServiceUnavailable"}},
                "PutObject"
            )
            
            file = MagicMock()
            file.read.return_value = b"test data"
            file.seek.return_value = None
            file.tell.return_value = 9
            
            with self.assertRaises(UploadError):
                ipfs_service.upload_file(file=file, filename="test.txt")
            
            # Should attempt 3 times
            self.assertEqual(mock_client.upload_fileobj.call_count, 3)
    
    def test_retry_exponential_backoff(self):
        """Verify exponential backoff timing."""
        start_times = []
        
        def track_call(*args, **kwargs):
            start_times.append(time.time())
            raise ClientError(
                {"Error": {"Code": "ServiceUnavailable"}},
                "PutObject"
            )
        
        with patch.object(ipfs_service, 'client') as mock_client:
            mock_client.upload_fileobj.side_effect = track_call
            
            file = MagicMock()
            file.read.return_value = b"test"
            file.seek.return_value = None
            file.tell.return_value = 4
            
            start = time.time()
            
            try:
                ipfs_service.upload_file(file=file, filename="test.txt")
            except UploadError:
                pass
            
            total_time = time.time() - start
            
            # Should take at least 2 seconds (first retry delay)
            # and at most ~15 seconds (2 + ~4 + ~10)
            self.assertGreaterEqual(total_time, 2)
            self.assertLess(total_time, 20)
    
    def test_non_transient_errors_raise_immediately(self):
        """ValueError should not be retried."""
        with patch.object(ipfs_service, 'client') as mock_client:
            mock_client.upload_fileobj.side_effect = ValueError("Invalid config")
            
            file = MagicMock()
            file.read.return_value = b"test"
            file.seek.return_value = None
            file.tell.return_value = 4
            
            with self.assertRaises(ValueError):
                ipfs_service.upload_file(file=file, filename="test.txt")
            
            # Should only try once
            self.assertEqual(mock_client.upload_fileobj.call_count, 1)


if __name__ == "__main__":
    unittest.main()
```

### 6. Configure Tenacity Options
Update `backend/config/default.py`:

```python
# Retry configuration
RETRY_MAX_ATTEMPTS = int(os.getenv("RETRY_MAX_ATTEMPTS", "3"))
RETRY_BACKOFF_MIN = int(os.getenv("RETRY_BACKOFF_MIN", "2"))
RETRY_BACKOFF_MAX = int(os.getenv("RETRY_BACKOFF_MAX", "10"))
RETRY_BACKOFF_MULTIPLIER = float(os.getenv("RETRY_BACKOFF_MULTIPLIER", "1"))
```

## Acceptance Criteria
- [ ] Retry logic uses tenacity with stop_after_attempt(3)
- [ ] Exponential backoff is configured with multiplier=1, min=2, max=10
- [ ] ClientError and BotoCoreError trigger retries
- [ ] ValueError and other exceptions don't trigger retries
- [ ] Retry attempts are logged before each sleep
- [ ] UploadError is raised after final failure
- [ ] All retry tests pass
- [ ] Backoff timing is approximately 2s + 4-10s delays
- [ ] Configuration is environment variable driven

## Notes
- Exponential backoff prevents overwhelming failing service
- Tenacity is already in requirements (installed via pybreaker/boto3)
- Retries work in conjunction with circuit breaker
- Log levels: WARNING for retries, ERROR for final failure
- Total time for 3 attempts: ~10-20 seconds

## Completion Status
- [x] 100% - Completed
