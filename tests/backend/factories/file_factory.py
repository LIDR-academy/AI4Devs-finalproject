"""Factory Boy helpers for file metadata and upload payloads."""

from __future__ import annotations

import io

import factory


class FileFactory(factory.Factory):
    """Generate deterministic file metadata for tests."""

    class Meta:
        model = dict

    cid = factory.Sequence(lambda n: f"QmTestCID{n:05d}")
    original_filename = factory.Sequence(lambda n: f"test-file-{n}.txt")
    safe_filename = factory.SelfAttribute("original_filename")
    mime_type = "text/plain"
    size = 11
    pinned = True

    @classmethod
    def upload_form(cls, content: bytes = b"hello ipfs", filename: str = "upload.txt"):
        """Return multipart form dict for Flask test client upload requests."""
        return {"file": (io.BytesIO(content), filename)}
