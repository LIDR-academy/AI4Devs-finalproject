"""E2E tests for Filebase operations via boto3."""

from __future__ import annotations

import os
import unittest
from pathlib import Path
import sys
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError, BotoCoreError

from tests.backend.e2e.conftest import e2e_ready

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

class TestFileEndpointsE2E(unittest.TestCase):
    """Exercise upload/list/retrieve flow directly against Filebase S3 API."""

    @classmethod
    def setUpClass(cls) -> None:
        ready, missing = e2e_ready()
        if not ready:
            raise unittest.SkipTest(f"e2e disabled or missing env: {', '.join(missing)}")

        cls.endpoint = os.getenv("FILEBASE_ENDPOINT", "https://s3.filebase.com")
        cls.bucket = os.getenv("FILEBASE_BUCKET")
        cls.client = boto3.client(
            "s3",
            endpoint_url=cls.endpoint,
            aws_access_key_id=os.getenv("FILEBASE_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("FILEBASE_SECRET_KEY"),
            region_name="us-east-1",
        )

    def setUp(self) -> None:
        self.object_key = (
            "e2e-tests/"
            + datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S-%f")
            + "-filebase-e2e.txt"
        )
        self.payload = b"hello from boto3 e2e"

    def tearDown(self) -> None:
        try:
            self.client.delete_object(Bucket=self.bucket, Key=self.object_key)
        except Exception:
            pass

    def test_upload_list_and_retrieve_with_boto3(self) -> None:
        """Upload, list, and retrieve an object using Filebase S3 API."""
        try:
            # Upload
            put_resp = self.client.put_object(
                Bucket=self.bucket,
                Key=self.object_key,
                Body=self.payload,
                ContentType="text/plain",
            )
            self.assertEqual(put_resp["ResponseMetadata"]["HTTPStatusCode"], 200)

            # List bucket and ensure object appears
            list_resp = self.client.list_objects_v2(Bucket=self.bucket, Prefix="e2e-tests/")
            self.assertEqual(list_resp["ResponseMetadata"]["HTTPStatusCode"], 200)
            keys = {item["Key"] for item in list_resp.get("Contents", [])}
            self.assertIn(self.object_key, keys)

            # Retrieve and validate contents
            get_resp = self.client.get_object(Bucket=self.bucket, Key=self.object_key)
            self.assertEqual(get_resp["ResponseMetadata"]["HTTPStatusCode"], 200)
            data = get_resp["Body"].read()
            self.assertEqual(data, self.payload)

        except (ClientError, BotoCoreError) as exc:
            self.fail(f"Filebase boto3 e2e failed: {exc}")
