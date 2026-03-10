"""Celery tasks for asynchronous pinning and unpinning operations."""

from __future__ import annotations

import json
import logging

from celery import shared_task
from sqlmodel import Session, select

from core import get_engine
from core.common.models import AuditLog
from core.files.models import File
from core.services.ipfs_service import UploadError, ipfs_service

logger = logging.getLogger(__name__)


def _safe_update_state(task, *, state: str, meta: dict) -> None:
	"""Update task state only when a valid task request ID is available."""
	request = getattr(task, "request", None)
	if request is None or not getattr(request, "id", None):
		return
	task.update_state(state=state, meta=meta)


def _get_user_file(session: Session, user_id: int, cid: str) -> File | None:
	"""Return file record for the owner/cid pair, excluding soft-deleted files."""
	return session.exec(
		select(File).where(
			File.user_id == user_id,
			File.cid == cid,
			File.deleted_at == None,
		)
	).first()


@shared_task(bind=True, max_retries=3, track_started=True)
def pin_content_async(self, user_id: int, cid: str) -> dict:
	"""Pin content asynchronously for a user-owned file."""
	try:
		_safe_update_state(self, state="PROGRESS", meta={"progress": 20, "message": "Resolving file metadata"})

		with Session(get_engine()) as session:
			db_file = _get_user_file(session, user_id, cid)
			if db_file is None:
				raise ValueError("File not found or access denied")

			if db_file.pinned:
				return {"status": "completed", "cid": cid, "pinned": True, "progress": 100}

			_safe_update_state(self, state="PROGRESS", meta={"progress": 60, "message": "Pinning content"})
			ipfs_service.pin_content(cid)

			db_file.pinned = True
			session.add(db_file)
			session.add(
				AuditLog(
					user_id=user_id,
					action="file_pin",
					details=json.dumps({"cid": cid, "status": "completed", "task_id": self.request.id}),
				)
			)
			session.commit()

		return {"status": "completed", "cid": cid, "pinned": True, "progress": 100}

	except UploadError as exc:
		logger.warning("Pin task retry for cid=%s: %s", cid, exc)
		raise self.retry(exc=exc, countdown=min(10, 2 ** max(self.request.retries + 1, 1)))
	except ValueError:
		# Non-transient validation/ownership issue; do not retry.
		raise


@shared_task(bind=True, max_retries=3, track_started=True)
def unpin_content_async(self, user_id: int, cid: str) -> dict:
	"""Unpin content asynchronously for a user-owned file."""
	try:
		_safe_update_state(self, state="PROGRESS", meta={"progress": 20, "message": "Resolving file metadata"})

		with Session(get_engine()) as session:
			db_file = _get_user_file(session, user_id, cid)
			if db_file is None:
				raise ValueError("File not found or access denied")

			if not db_file.pinned:
				return {"status": "completed", "cid": cid, "pinned": False, "progress": 100}

			storage_key = db_file.storage_key or db_file.safe_filename or cid
			_safe_update_state(self, state="PROGRESS", meta={"progress": 60, "message": "Unpinning content"})
			ipfs_service.unpin_content(storage_key)

			db_file.pinned = False
			session.add(db_file)
			session.add(
				AuditLog(
					user_id=user_id,
					action="file_unpin",
					details=json.dumps({"cid": cid, "status": "completed", "task_id": self.request.id}),
				)
			)
			session.commit()

		return {"status": "completed", "cid": cid, "pinned": False, "progress": 100}

	except UploadError as exc:
		logger.warning("Unpin task retry for cid=%s: %s", cid, exc)
		raise self.retry(exc=exc, countdown=min(10, 2 ** max(self.request.retries + 1, 1)))
	except ValueError:
		# Non-transient validation/ownership issue; do not retry.
		raise

