# TASK-US-005-03: Implement Circuit Breaker

[Trello Card](https://trello.com/c/LUWf5pMe)

## Parent User Story
[US-005: File Upload to IPFS](../../user-stories/backend/US-005-file-upload-ipfs.md)

## Description
Configure and test the circuit breaker pattern (pybreaker library) for the Filebase API. Implement proper state transitions and error handling to prevent cascading failures.

## Priority
🟠 High

## Estimated Time
2 hours

## Detailed Steps

### 1. Circuit Breaker Configuration
In `backend/core/services/ipfs_service.py`, the circuit breaker is already configured:

```python
from pybreaker import CircuitBreaker

# Circuit breaker for Filebase API
filebase_circuit_breaker = CircuitBreaker(
    fail_max=5,  # Open after 5 failures
    reset_timeout=60,  # Try half-open after 60 seconds
    exclude=[ValueError],  # Don't count validation errors
)
```

### 2. Apply Circuit Breaker to Methods
All methods in IPFSService that call Filebase API use the `@filebase_circuit_breaker` decorator:

```python
@filebase_circuit_breaker
@retry(...)
def _upload_file_with_retry(self, ...):
    """Upload with circuit breaker protection."""
    pass

@filebase_circuit_breaker
@retry(...)
def retrieve_file(self, key: str):
    """Retrieve with circuit breaker protection."""
    pass

@filebase_circuit_breaker
def pin_content(self, cid: str):
    """Pin with circuit breaker protection."""
    pass

@filebase_circuit_breaker
def unpin_content(self, key: str):
    """Unpin with circuit breaker protection."""
    pass
```

### 3. Create Circuit Breaker Health Check Endpoint
Add to `backend/core/files/routes/health.py`:

```python
"""Health check endpoint for IPFS service."""

from flask import Blueprint, jsonify

from core.services.ipfs_service import ipfs_service

bp = Blueprint("health", __name__, url_prefix="/api/v1/health")


@bp.get("/circuit-breaker")
def circuit_breaker_status():
    """Get circuit breaker status.
    
    Returns:
        200 OK: Circuit breaker is in closed state
        503 Service Unavailable: Circuit breaker is open
    """
    state = ipfs_service.check_circuit_breaker_state()
    
    if state == "open":
        return jsonify({
            "status": "unavailable",
            "message": "IPFS service circuit breaker is open",
            "state": "open",
            "retry_after": 60
        }), 503
    
    return jsonify({
        "status": "available",
        "message": "IPFS service is available",
        "state": state
    }), 200
```

### 4. Handle Circuit Breaker Exceptions
Update upload endpoint to catch `CircuitBreakerListener`:

```python
from pybreaker import CircuitBreakerListener

try:
    result = ipfs_service.upload_file(...)
except CircuitBreakerListener:
    logger.error("Circuit breaker is open - IPFS service unavailable")
    return jsonify({
        "status": 503,
        "message": "IPFS service temporarily unavailable",
        "error": "service_unavailable",
        "retry_after": 60
    }), 503
```

### 5. Create Circuit Breaker Tests
Create `backend/tests/backend/test_circuit_breaker.py`:

```python
"""Tests for circuit breaker functionality."""

import unittest
from unittest.mock import patch, MagicMock

from botocore.exceptions import ClientError, BotoCoreError

from core.services.ipfs_service import (
    ipfs_service,
    filebase_circuit_breaker,
    UploadError,
)


class TestCircuitBreaker(unittest.TestCase):
    """Test circuit breaker pattern."""
    
    def setUp(self):
        """Reset circuit breaker before each test."""
        filebase_circuit_breaker.close()
    
    def test_circuit_breaker_closes_after_success(self):
        """Circuit breaker should close after successful call."""
        with patch.object(ipfs_service, 'client') as mock_client:
            mock_client.upload_fileobj.return_value = None
            mock_client.head_object.return_value = {
                "Metadata": {"cid": "QmTest123"}
            }
            
            # Should succeed
            file = MagicMock()
            file.read.return_value = b"test"
            file.seek.return_value = None
            file.tell.return_value = 4
            
            result = ipfs_service.upload_file(
                file=file,
                filename="test.txt"
            )
            
            self.assertEqual(filebase_circuit_breaker.current_state, "closed")
    
    def test_circuit_breaker_opens_after_failures(self):
        """Circuit breaker should open after fail_max failures."""
        with patch.object(ipfs_service, 'client') as mock_client:
            mock_client.upload_fileobj.side_effect = ClientError(
                {"Error": {"Code": "ServiceUnavailable"}},
                "PutObject"
            )
            
            file = MagicMock()
            file.read.return_value = b"test"
            file.seek.return_value = None
            file.tell.return_value = 4
            
            # Should fail 5 times and open circuit breaker
            for i in range(5):
                try:
                    ipfs_service.upload_file(
                        file=file,
                        filename="test.txt"
                    )
                except UploadError:
                    pass
            
            self.assertEqual(filebase_circuit_breaker.current_state, "open")
    
    def test_circuit_breaker_half_open_after_reset_timeout(self):
        """Circuit breaker should transition to half-open after reset_timeout."""
        import time
        
        with patch.object(ipfs_service, 'client') as mock_client:
            # Trigger failures to open circuit
            mock_client.upload_fileobj.side_effect = ClientError(
                {"Error": {"Code": "ServiceUnavailable"}},
                "PutObject"
            )
            
            file = MagicMock()
            file.read.return_value = b"test"
            file.seek.return_value = None
            file.tell.return_value = 4
            
            for i in range(5):
                try:
                    ipfs_service.upload_file(file=file, filename="test.txt")
                except UploadError:
                    pass
            
            # Circuit should be open
            self.assertEqual(filebase_circuit_breaker.current_state, "open")
            
            # Wait for reset timeout + small buffer
            time.sleep(61)
            
            # Circuit should transition to half-open on next call
            mock_client.upload_fileobj.return_value = None
            mock_client.head_object.return_value = {
                "Metadata": {"cid": "QmTest123"}
            }
            
            try:
                ipfs_service.upload_file(file=file, filename="test.txt")
                # If successful, circuit should close
                self.assertEqual(filebase_circuit_breaker.current_state, "closed")
            except Exception:
                # Circuit might be half-open
                self.assertIn(
                    filebase_circuit_breaker.current_state,
                    ["half-open", "open"]
                )


if __name__ == "__main__":
    unittest.main()
```

## Acceptance Criteria
- [ ] Circuit breaker is configured with fail_max=5 and reset_timeout=60
- [ ] All Filebase API calls are decorated with @filebase_circuit_breaker
- [ ] Circuit correctly transitions: closed → open → half-open → closed
- [ ] Exceptions are counted for state transitions
- [ ] ValidationError is excluded from failure count
- [ ] Health check endpoint returns correct status
- [ ] Upload endpoint handles CircuitBreakerListener exceptions
- [ ] All circuit breaker tests pass
- [ ] State transitions are logged

## Notes
- pybreaker states: "closed" (normal), "open" (failing), "half-open" (testing recovery)
- Circuit breaker should prevent cascading failures to Filebase
- Half-open state allows one request to test if service recovered
- Use health check endpoint for monitoring

## Completion Status
- [x] 100% - Completed
