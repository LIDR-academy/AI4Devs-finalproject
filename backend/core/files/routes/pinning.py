"""File pinning routes."""

from flask import Blueprint, jsonify

from core.auth.decorators import get_current_user, require_api_key
from core.tasks.pinning_tasks import pin_content_async, unpin_content_async


def register_routes(bp: Blueprint) -> None:
	"""Register async pinning endpoints."""

	@bp.post("/pin/<string:cid>")
	@require_api_key
	def pin_file(cid: str):
		"""Queue async pin operation for content CID."""
		user = get_current_user()
		task = pin_content_async.delay(user.id, cid)
		return jsonify(
			{
				"status": 202,
				"message": "Pinning task queued",
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
		task = unpin_content_async.delay(user.id, cid)
		return jsonify(
			{
				"status": 202,
				"message": "Unpinning task queued",
				"data": {
					"task_id": str(task.id),
					"status_url": f"/api/v1/tasks/{task.id}/status",
					"cid": cid,
				},
			}
		), 202

