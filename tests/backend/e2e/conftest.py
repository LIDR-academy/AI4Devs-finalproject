"""Support utilities for e2e backend tests."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# e2e tests intentionally use backend/.env to hit real Filebase + Redis.
load_dotenv(BACKEND_DIR / ".env", override=True)

# Normalize common alias names to the variables consumed by backend services.
if not os.getenv("FILEBASE_ACCESS_KEY") and os.getenv("FILEBASE_ACCESS_KEY_ID"):
    os.environ["FILEBASE_ACCESS_KEY"] = os.environ["FILEBASE_ACCESS_KEY_ID"]

if not os.getenv("FILEBASE_SECRET_KEY") and os.getenv("FILEBASE_SECRET_ACCESS_KEY"):
    os.environ["FILEBASE_SECRET_KEY"] = os.environ["FILEBASE_SECRET_ACCESS_KEY"]

if not os.getenv("FILEBASE_ENDPOINT"):
    os.environ["FILEBASE_ENDPOINT"] = "https://s3.filebase.com"

REQUIRED_E2E_ENV = (
    "FILEBASE_ACCESS_KEY",
    "FILEBASE_SECRET_KEY",
    "FILEBASE_BUCKET",
    "REDIS_URL",
)


def e2e_ready() -> tuple[bool, list[str]]:
    """Return whether e2e tests can run and which env vars are missing."""
    if os.getenv("RUN_E2E_TESTS", "0") != "1":
        return False, ["RUN_E2E_TESTS"]
    missing = [key for key in REQUIRED_E2E_ENV if not os.getenv(key)]
    return len(missing) == 0, missing
