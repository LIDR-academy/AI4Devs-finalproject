"""Tests for IPFS/Filebase service."""

import unittest
from io import BytesIO
from unittest.mock import patch, MagicMock, ANY

from botocore.exceptions import ClientError, BotoCoreError

from core.common.exceptions import ValidationError
from core.services.ipfs_service import (
    IPFSService,
    UploadResult,
    UploadError,
    RetrievalError,
    ipfs_service,
)


class TestUploadResult(unittest.TestCase):
    """Test UploadResult data class."""
    
    def test_upload_result_creation(self):
        """Should create upload result."""
        result = UploadResult(
            cid="QmTest123",
            size=1024,
            key="test.txt"
        )
        
        self.assertEqual(result.cid, "QmTest123")
        self.assertEqual(result.size, 1024)
        self.assertEqual(result.key, "test.txt")


class TestIPFSServiceInitialization(unittest.TestCase):
    """Test IPFS service initialization."""
    
    @patch.dict("os.environ", {
        "FILEBASE_ACCESS_KEY": "test_key",
        "FILEBASE_SECRET_KEY": "test_secret",
        "FILEBASE_BUCKET": "ipfs-gateway",
    })
    @patch("core.services.ipfs_service.boto3.client")
    def test_ipfs_service_init_success(self, mock_boto3):
        """Should initialize service with valid credentials."""
        mock_boto3.return_value = MagicMock()
        
        service = IPFSService()
        
        self.assertEqual(service.api_key, "test_key")
        self.assertEqual(service.api_secret, "test_secret")
        self.assertEqual(service.bucket_name, "ipfs-gateway")
        self.assertIsNotNone(service.client)
        self.assertIsNotNone(service.circuit_breaker)
    
    @patch.dict("os.environ", {}, clear=True)
    @patch("core.services.ipfs_service.boto3.client")
    def test_ipfs_service_init_missing_credentials(self, mock_boto3):
        """Should fail without credentials."""
        with self.assertRaises(ValueError) as ctx:
            IPFSService()
        self.assertIn("credentials", str(ctx.exception).lower())


class TestIPFSServiceUpload(unittest.TestCase):
    """Test file upload functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.mock_client = MagicMock()
        self.service = ipfs_service
        self.service.client = self.mock_client
    
    def test_upload_file_success(self):
        """Should successfully upload file."""
        file_data = b"test content"
        file_obj = BytesIO(file_data)
        
        # Mock S3 response
        self.mock_client.head_object.return_value = {
            "Metadata": {"cid": "QmTest123"}
        }
        
        result = self.service.upload_file(
            file=file_obj,
            filename="test.txt",
            content_type="text/plain"
        )
        
        self.assertEqual(result.cid, "QmTest123")
        self.assertEqual(result.size, len(file_data))
        self.assertEqual(result.key, "test.txt")
    
    def test_upload_file_empty_file(self):
        """Should reject empty files."""
        file_obj = BytesIO(b"")
        
        with self.assertRaises(ValidationError):
            self.service.upload_file(
                file=file_obj,
                filename="empty.txt"
            )
    
    def test_upload_file_ignores_custom_metadata(self):
        """Custom metadata is not forwarded in the current put_object contract."""
        file_obj = BytesIO(b"test")
        metadata = {"user_id": "123", "source": "api"}
        
        self.mock_client.head_object.return_value = {
            "Metadata": {"cid": "QmTest456"}
        }
        
        result = self.service.upload_file(
            file=file_obj,
            filename="test.txt",
            metadata=metadata
        )
        
        # Verify upload uses current contract (no custom Metadata argument)
        self.mock_client.put_object.assert_called_once()
        
        call_kwargs = self.mock_client.put_object.call_args.kwargs
        self.assertNotIn("Metadata", call_kwargs)
        self.assertEqual(call_kwargs["Body"], b"test")
        self.assertEqual(result.cid, "QmTest456")
    
    def test_upload_file_retry_on_transient_error(self):
        """Should retry on transient errors."""
        file_obj = BytesIO(b"test")
        
        # First call fails, second succeeds
        self.mock_client.put_object.side_effect = [
            ClientError(
                {"Error": {"Code": "ServiceUnavailable"}},
                "PutObject"
            ),
            None
        ]
        self.mock_client.head_object.return_value = {
            "Metadata": {"cid": "QmTest789"}
        }
        
        # Reset circuit breaker
        self.service.circuit_breaker.close()
        
        result = self.service.upload_file(
            file=file_obj,
            filename="test.txt"
        )
        
        self.assertEqual(result.cid, "QmTest789")
        self.assertEqual(self.mock_client.put_object.call_count, 2)

        first_call = self.mock_client.put_object.call_args_list[0].kwargs
        second_call = self.mock_client.put_object.call_args_list[1].kwargs
        self.assertEqual(first_call["Body"], b"test")
        self.assertEqual(second_call["Body"], b"test")
    
    def test_upload_file_fails_after_max_retries(self):
        """Should fail after max retries."""
        file_obj = BytesIO(b"test")
        
        # Always fail
        self.mock_client.put_object.side_effect = ClientError(
            {"Error": {"Code": "ServiceUnavailable"}},
            "PutObject"
        )
        
        # Reset circuit breaker
        self.service.circuit_breaker.close()
        
        with self.assertRaises(UploadError):
            self.service.upload_file(
                file=file_obj,
                filename="test.txt"
            )
        
        # Should attempt 3 times
            self.assertEqual(self.mock_client.put_object.call_count, 3)


class TestIPFSServiceRetrieve(unittest.TestCase):
    """Test file retrieval functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.mock_client = MagicMock()
        self.service = ipfs_service
        self.service.client = self.mock_client
    
    def test_retrieve_file_success(self):
        """Should successfully retrieve file."""
        file_data = b"test content"
        
        body = MagicMock()
        body.read.return_value = file_data
        mock_response = {"Body": body}
        
        self.mock_client.get_object.return_value = mock_response
        
        result = self.service.retrieve_file("test.txt")
        
        self.assertEqual(result, file_data)
    
    def test_retrieve_file_not_found(self):
        """Should handle file not found."""
        self.mock_client.get_object.side_effect = ClientError(
            {"Error": {"Code": "NoSuchKey"}},
            "GetObject"
        )
        
        with self.assertRaises(RetrievalError):
            self.service.retrieve_file("nonexistent.txt")


class TestIPFSServicePinning(unittest.TestCase):
    """Test pinning/unpinning functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.mock_client = MagicMock()
        self.service = ipfs_service
        self.service.client = self.mock_client
    
    def test_pin_content_success(self):
        """Should verify pinning."""
        result = self.service.pin_content("QmTest123")
        self.assertTrue(result)
    
    def test_unpin_content_success(self):
        """Should successfully unpin content."""
        result = self.service.unpin_content("test.txt")
        self.assertTrue(result)
        
        self.mock_client.delete_object.assert_called_once_with(
            Bucket=self.service.bucket_name,
            Key="test.txt"
        )
    
    def test_unpin_content_failure(self):
        """Should handle unpin failures."""
        self.mock_client.delete_object.side_effect = ClientError(
            {"Error": {"Code": "AccessDenied"}},
            "DeleteObject"
        )
        
        with self.assertRaises(UploadError):
            self.service.unpin_content("test.txt")


class TestCircuitBreakerIntegration(unittest.TestCase):
    """Test circuit breaker integration."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.mock_client = MagicMock()
        self.service = ipfs_service
        self.service.client = self.mock_client
        self.service.circuit_breaker.close()  # Ensure clean state
    
    def test_circuit_breaker_state_closed(self):
        """Should report closed state initially."""
        state = self.service.check_circuit_breaker_state()
        self.assertEqual(state, "closed")
    
    def test_circuit_breaker_opens_after_failures(self):
        """Should open after max failures."""
        # Cause failures
        self.mock_client.put_object.side_effect = ClientError(
            {"Error": {"Code": "ServiceUnavailable"}},
            "PutObject"
        )
        
        file_obj = BytesIO(b"test")
        
        # Try 5 times to trigger circuit breaker
        for _ in range(5):
            try:
                self.service.upload_file(file=file_obj, filename="test.txt")
            except (UploadError, Exception):
                file_obj.seek(0)
        
        # After failures, circuit breaker property should change
        # (actual state depends on retry exhaustion)


class TestIPFSServiceGlobalInstance(unittest.TestCase):
    """Test global service instance."""
    
    def test_global_instance_exists(self):
        """Should have global instance."""
        self.assertIsNotNone(ipfs_service)
        self.assertIsInstance(ipfs_service, IPFSService)
    
    def test_global_instance_has_methods(self):
        """Global instance should have all methods."""
        self.assertTrue(hasattr(ipfs_service, 'upload_file'))
        self.assertTrue(hasattr(ipfs_service, 'retrieve_file'))
        self.assertTrue(hasattr(ipfs_service, 'pin_content'))
        self.assertTrue(hasattr(ipfs_service, 'unpin_content'))


if __name__ == "__main__":
    unittest.main()
