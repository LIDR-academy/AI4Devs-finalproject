# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

# Shared database and helpers module
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from logging.handlers import RotatingFileHandler

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
_kwargs = {}
if "tls=true" in mongo_url.lower():
    _kwargs["tls"] = True
if "tlsallowinvalidcertificates=true" in mongo_url.lower():
    _kwargs["tlsAllowInvalidCertificates"] = True
if "tlscafile=" in mongo_url.lower():
    import re
    _m = re.search(r"tlscafile=([^&]+)", mongo_url, re.IGNORECASE)
    if _m:
        _kwargs["tlsCAFile"] = _m.group(1)
client = AsyncIOMotorClient(mongo_url, **_kwargs)
db = client[os.environ['DB_NAME']]

LOG_FILE = os.environ.get("LOG_FILE", str(ROOT_DIR / "logs" / "app.log")).strip()
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").strip().upper()
LOG_MAX_BYTES = int(os.environ.get("LOG_MAX_BYTES", 10 * 1024 * 1024))  # 10 MB
LOG_BACKUP_COUNT = int(os.environ.get("LOG_BACKUP_COUNT", 5))

_log_level = getattr(logging, LOG_LEVEL, logging.INFO)

# Ensure log directory exists
_log_dir = Path(LOG_FILE).parent
_log_dir.mkdir(parents=True, exist_ok=True)

# Root logger: console + rotating file
_root = logging.getLogger()
_root.setLevel(_log_level)

_fmt = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

# Console handler (stderr)
_ch = logging.StreamHandler()
_ch.setLevel(_log_level)
_ch.setFormatter(_fmt)
_root.addHandler(_ch)

# Rotating file handler
_fh = RotatingFileHandler(LOG_FILE, maxBytes=LOG_MAX_BYTES, backupCount=LOG_BACKUP_COUNT, encoding="utf-8")
_fh.setLevel(_log_level)
_fh.setFormatter(_fmt)
_root.addHandler(_fh)

logger = logging.getLogger(__name__)


# ── Shared helpers ──────────────────────────────────────────────────────────

async def get_active_project_version_id(project_id: str) -> str | None:
    """Return the active branch id for a project, or None.

    Since the migration to git-like branches, this returns the project's
    active_branch_id (or default_branch_id as fallback).
    """
    project = await db.projects.find_one(
        {"id": project_id},
        {"active_branch_id": 1, "default_branch_id": 1, "active_version_ids": 1},
    )
    if not project:
        return None

    # New branch-based system
    branch_id = project.get("active_branch_id") or project.get("default_branch_id")
    if branch_id:
        return branch_id

    # Fallback for projects not yet migrated
    active_ids = project.get("active_version_ids", [])
    if not active_ids:
        return None
    versions = await db.project_versions.find(
        {"id": {"$in": active_ids}, "project_id": project_id},
        {"_id": 0, "id": 1, "version_number": 1},
    ).sort("version_number", -1).to_list(1)
    if versions and versions[0].get("id"):
        return versions[0]["id"]
    return None
