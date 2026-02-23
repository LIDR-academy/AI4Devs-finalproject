"""
T-005-INFRA: Integration test for Supabase Storage infrastructure.

This test validates that the 'raw-uploads' bucket exists and is
accessible with proper read/write permissions.

TDD Phases:
- RED: Test fails because bucket doesn't exist
- GREEN: Bucket created, test passes
- REFACTOR: Code cleanup and optimization (this file)
"""
import pytest
from supabase import Client


def test_upload_bucket_access(supabase_client: Client) -> None:
    """
    Verify 'raw-uploads' bucket exists and supports basic CRUD operations.

    This test confirms that:
    1. The bucket can accept file uploads
    2. Uploaded files can be listed
    3. Public/signed URLs can be generated for uploaded files
    4. Files can be deleted (cleanup)

    Args:
        supabase_client: Authenticated Supabase client (from conftest.py fixture)

    Assertions:
        - Upload response is not None
        - Uploaded file appears in bucket listing
        - Public URL can be generated and contains bucket name
    """
    bucket_name: str = "raw-uploads"
    test_filename: str = "test_infra.txt"
    test_content: bytes = b"TDD infrastructure validation file"

    uploaded: bool = False

    try:
        # Upload test file to bucket
        response = supabase_client.storage.from_(bucket_name).upload(
            path=test_filename,
            file=test_content,
            file_options={"content-type": "text/plain", "upsert": "true"}
        )

        assert response is not None, "Upload response must not be None"
        uploaded = True

        # Verify file appears in bucket listing
        files = supabase_client.storage.from_(bucket_name).list()
        file_names: list[str] = [f["name"] for f in files]
        assert test_filename in file_names, f"File '{test_filename}' must exist in bucket listing"

        # Verify URL generation
        public_url: str = supabase_client.storage.from_(bucket_name).get_public_url(test_filename)
        assert public_url, "Public URL must be generated"
        assert bucket_name in public_url, f"URL must contain bucket name '{bucket_name}'"

    finally:
        # Cleanup: Remove test file if upload succeeded
        if uploaded:
            try:
                supabase_client.storage.from_(bucket_name).remove([test_filename])
            except Exception as e:
                # Log cleanup failure but don't fail the test
                pytest.fail(f"Cleanup failed (non-critical): {e}", pytrace=False)
