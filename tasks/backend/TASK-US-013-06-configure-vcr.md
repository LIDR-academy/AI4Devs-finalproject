# TASK-US-013-06: Configure VCRpy for HTTP recording

[Trello Card](https://trello.com/c/7HNiAhJj)

## Parent User Story
[US-013: Backend Testing Suite](../../user-stories/backend/US-013-backend-testing.md)

## Description
Install and configure VCRpy to record real HTTP interactions with the Filebase S3 API and replay them in subsequent test runs. This allows the integration test suite to run without live credentials after the initial recording pass. Store cassettes in `tests/backend/cassettes/`. Integrate VCR decorators into the relevant unit and integration tests that hit external HTTP endpoints.

## Priority
🟡 **Medium** - Enables deterministic and credential-free re-runs of integration tests.

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Install VCRpy
Add to `backend/requirements.txt`:
```
vcrpy>=6.0.0
```

### 2. Create `tests/backend/cassettes/` directory
```bash
mkdir -p tests/backend/cassettes
touch tests/backend/cassettes/.gitkeep
```
- **Commit the `.gitkeep`** to track the directory in git.
- **Do NOT commit cassette YAML files** that contain credentials; add `tests/backend/cassettes/*.yaml` to `.gitignore` (or scrub credentials before committing using VCR's `filter_headers` option).

### 3. Create VCR configuration in `tests/backend/conftest.py`
```python
import vcr

# Shared VCR instance with credential scrubbing
ipfs_vcr = vcr.VCR(
    cassette_library_dir="tests/backend/cassettes",
    record_mode="none",          # "new_episodes" during initial recording, "none" in CI
    match_on=["method", "scheme", "host", "port", "path", "query"],
    filter_headers=["Authorization", "X-Amz-Security-Token"],
    filter_query_parameters=["AWSAccessKeyId", "Signature"],
    decode_compressed_response=True,
)
```

### 4. Apply VCR to relevant tests in `test_ipfs_service.py`
```python
import pytest
from tests.backend.conftest import ipfs_vcr

class TestIPFSServiceWithVCR:
    @ipfs_vcr.use_cassette("upload_small_file.yaml")
    def test_upload_records_and_replays(self):
        """Upload a small file; cassette records the real S3 call."""
        from core.services.ipfs_service import upload_file
        cid = upload_file(b"hello ipfs", "test.txt", "text/plain")
        assert cid is not None
        assert len(cid) > 10  # basic CID sanity check

    @ipfs_vcr.use_cassette("download_file.yaml")
    def test_download_recorded(self):
        """Download a file CID via Filebase; cassette is replayed in CI."""
        from core.services.ipfs_service import download_file
        data = download_file("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG")
        assert data is not None
```

### 5. Configure recording mode via environment variable
To switch between `record` and `replay` modes without code changes:
```python
import os

RECORD_MODE = os.environ.get("VCR_RECORD_MODE", "none")

ipfs_vcr = vcr.VCR(
    cassette_library_dir="tests/backend/cassettes",
    record_mode=RECORD_MODE,
    ...
)
```
- To record: `VCR_RECORD_MODE=new_episodes .venv/bin/python -m pytest tests/ -k "WithVCR"`
- To replay (default in CI): run `pytest` normally

### 6. Add `.gitignore` rule for cassettes with credentials
```gitignore
# VCR cassettes may contain S3 auth tokens — review before committing
# tests/backend/cassettes/*.yaml
```
Alternatively, scrub cassettes using VCR's `before_record_response` hook:
```python
def scrub_response(response):
    # Remove any leaked credentials from recorded responses
    response["headers"].pop("Set-Cookie", None)
    return response

ipfs_vcr = vcr.VCR(
    ...
    before_record_response=scrub_response,
)
```

### 7. Verify replay works in CI (no credentials)
```bash
# Assuming cassette files have been recorded and committed
VCR_RECORD_MODE=none .venv/bin/python -m pytest tests/backend/unit/ -k "VCR" -v
```

## Acceptance Criteria
- [x] `vcrpy` is listed in `backend/requirements.txt`
- [x] `tests/backend/cassettes/` directory exists with a `.gitkeep`
- [x] VCR configuration in `conftest.py` filters `Authorization` and AWS signature headers/params
- [x] At least `test_upload_records_and_replays` and `test_download_recorded` cassette-based tests exist
- [x] `VCR_RECORD_MODE` environment variable controls recording vs. replay mode
- [x] CI runs with `VCR_RECORD_MODE=none` (replay only, no credentials needed)
- [x] Cassette files do not contain plaintext AWS credentials after scrubbing

## Notes
- VCRpy intercepts `urllib3` and `requests` at the socket level; it is compatible with `boto3` (which uses `botocore`/`urllib3` under the hood).
- Some AWS SDK calls use chunked transfer encoding; set `decode_compressed_response=True` to avoid cassette mismatch errors.
- If using `botocore` event hooks, VCRpy may need the `boto` extras: `pip install vcrpy[boto]`.
- Keep cassette files small; only record the specific service calls needed for the test, not full S3 multipart uploads.

## Completion Status
- [x] 100% - Completed
