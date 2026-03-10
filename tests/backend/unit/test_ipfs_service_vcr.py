"""Optional VCR-backed integration-style test for Filebase transport."""

from __future__ import annotations

import os
import sys
import unittest
from io import BytesIO
from pathlib import Path

import vcr

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from core.services.ipfs_service import ipfs_service

ipfs_vcr = vcr.VCR(
    cassette_library_dir=str(ROOT / "tests" / "backend" / "cassettes"),
    record_mode=os.getenv("VCR_RECORD_MODE", "none"),
    match_on=["method", "scheme", "host", "port", "path", "query"],
    filter_headers=["Authorization", "X-Amz-Security-Token"],
    filter_query_parameters=["AWSAccessKeyId", "Signature"],
    decode_compressed_response=True,
)


class TestIPFSServiceWithVCR(unittest.TestCase):
    """Record/replay HTTP calls to Filebase when explicitly enabled."""

    @classmethod
    def setUpClass(cls) -> None:
        if os.getenv("RUN_VCR_TESTS", "0") != "1":
            raise unittest.SkipTest("VCR tests disabled. Set RUN_VCR_TESTS=1 to enable.")

        required = ["FILEBASE_ACCESS_KEY", "FILEBASE_SECRET_KEY", "FILEBASE_BUCKET"]
        missing = [key for key in required if not os.getenv(key)]
        if missing:
            raise unittest.SkipTest(f"missing env vars for VCR test: {', '.join(missing)}")

    @ipfs_vcr.use_cassette("upload_small_file.yaml")
    def test_upload_records_or_replays(self) -> None:
        """Upload a tiny object and validate CID metadata path."""
        file_obj = BytesIO(b"vcr test content")
        result = ipfs_service.upload_file(file=file_obj, filename="vcr-test.txt", content_type="text/plain")
        self.assertTrue(result.cid)
        self.assertEqual(result.key, "vcr-test.txt")
