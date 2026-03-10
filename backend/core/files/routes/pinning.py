"""File pinning routes."""

import json

from flask import Blueprint, jsonify
from sqlmodel import Session, select

from core import get_engine
from core.auth.decorators import get_current_user, require_api_key
from core.common.models import AuditLog
from core.files.models import File
from core.tasks.pinning_tasks import pin_content_async, unpin_content_async


def _get_file_by_cid(session: Session, cid: str) -> File | None:
	"""Return non-deleted file by CID."""
	return session.exec(
		select(File).where(
			File.cid == cid,
			File.deleted_at == None,
		)
	).first()


def register_routes(bp: Blueprint) -> None:
	"""Register async pinning endpoints."""

	@bp.post("/pin/<string:cid>")
	@require_api_key
	def pin_file(cid: str):
		"""Queue async pin operation for content CID."""
		user = get_current_user()
		with Session(get_engine()) as session:
			db_file = _get_file_by_cid(session, cid)
			if db_file is None:
				return jsonify({"status": 404, "message": "Content not found"}), 404

			if db_file.user_id != user.id:
				session.add(
					AuditLog(
						user_id=user.id,
						action="file_pin_forbidden",
						resource_type="file",
						resource_id=db_file.id,
						details=json.dumps({"cid": cid, "reason": "ownership_mismatch"}),
					)
				)
				session.commit()
				return jsonify({"status": 403, "message": "Access denied to this content"}), 403

			if db_file.pinned:
				return jsonify({"status": 409, "message": "Content is already pinned"}), 409

			task = pin_content_async.delay(user.id, cid)
			session.add(
				AuditLog(
					user_id=user.id,
					action="file_pin_queued",
					resource_type="file",
					resource_id=db_file.id,
					details=json.dumps({"cid": cid, "task_id": str(task.id)}),
				)
			)
			session.commit()
		return jsonify(
			{
				"status": 202,
				"message": "Pinning request queued",
				"data": {
					"task_id": str(task.id),
					"status_url": f"/api/v1/tasks/{task.id}/status",
					"cid": cid,
				},
			}
		), 202

	@bp.post("/unpin/<string:cid>")
	@require_api_key
	def unpin_file(cid: str):
		"""Queue async unpin operation for content CID."""
		user = get_current_user()
		with Session(get_engine()) as session:
			db_file = _get_file_by_cid(session, cid)
			if db_file is None:
				return jsonify({"status": 404, "message": "Content not found"}), 404

			if db_file.user_id != user.id:
				session.add(
					AuditLog(
						user_id=user.id,
						action="file_unpin_forbidden",
						resource_type="file",
						resource_id=db_file.id,
						details=json.dumps({"cid": cid, "reason": "ownership_mismatch"}),
					)
				)
				session.commit()
				return jsonify({"status": 403, "message": "Access denied to this content"}), 403

			if not db_file.pinned:
				return jsonify({"status": 409, "message": "Content is already unpinned"}), 409

			task = unpin_content_async.delay(user.id, cid)
			session.add(
				AuditLog(
					user_id=user.id,
					action="file_unpin_queued",
					resource_type="file",
					resource_id=db_file.id,
					details=json.dumps({"cid": cid, "task_id": str(task.id)}),
				)
			)
			session.commit()
		return jsonify(
			{
				"status": 202,
				"message": "Unpinning request queued",
				"data": {
					"task_id": str(task.id),
					"status_url": f"/api/v1/tasks/{task.id}/status",
					"cid": cid,
				},
			}
		), 202

