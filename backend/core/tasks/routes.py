"""Task status and failed-task management API routes."""

from __future__ import annotations

from typing import Any

from celery.result import AsyncResult
from flask import Blueprint, jsonify, request

from core.auth.decorators import require_api_key
from core.tasks.failed_tasks import list_failed_tasks, replay_failed_task


def _extract_progress_and_message(task_result: AsyncResult) -> tuple[int, str | None]:
    """Extract progress/message metadata from AsyncResult info payload."""
    info: Any = task_result.info
    if isinstance(info, dict):
        progress = info.get("progress")
        message = info.get("message")
        if isinstance(progress, int):
            return max(0, min(progress, 100)), message
    return 0, None


def create_tasks_blueprint() -> Blueprint:
    """Create and return tasks API blueprint."""
    bp = Blueprint("tasks", __name__, url_prefix="/api/v1/tasks")

    @bp.get("/<string:task_id>/status")
    @require_api_key
    def get_task_status(task_id: str):
        """Return Celery task state and result details."""
        celery_app = None
        try:
            from core.celery_worker import celery as celery_app
        except Exception:
            celery_app = None

        task_result = AsyncResult(task_id, app=celery_app)
        progress, message = _extract_progress_and_message(task_result)

        state = task_result.state
        payload: dict[str, Any] = {
            "task_id": task_id,
            "state": state,
        }

        if state == "PENDING":
            payload["progress"] = 0
            payload["message"] = "Task is pending"
        elif state in {"STARTED", "PROGRESS", "RETRY"}:
            payload["progress"] = progress or 10
            payload["message"] = message or "Task is in progress"
        elif state == "SUCCESS":
            payload["progress"] = 100
            payload["result"] = task_result.result
        elif state == "FAILURE":
            payload["progress"] = progress
            payload["error"] = str(task_result.info)
        else:
            payload["progress"] = progress
            if message:
                payload["message"] = message

        return jsonify({"status": 200, "data": payload}), 200

    @bp.get("/failed")
    @require_api_key
    def get_failed_tasks():
        """List failed tasks captured in the application-level failed queue."""
        limit = request.args.get("limit", default=50, type=int)
        offset = request.args.get("offset", default=0, type=int)
        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        items = list_failed_tasks(limit=limit, offset=offset)
        return jsonify({"status": 200, "data": {"items": items, "limit": limit, "offset": offset}}), 200

    @bp.post("/failed/<string:failure_id>/replay")
    @require_api_key
    def replay_failed_task_route(failure_id: str):
        """Replay a failed task by failure identifier."""
        try:
            replay_info = replay_failed_task(failure_id)
            return (
                jsonify(
                    {
                        "status": 202,
                        "message": "Failed task replay queued",
                        "data": replay_info,
                    }
                ),
                202,
            )
        except KeyError:
            return jsonify({"status": 404, "message": "Failed task not found"}), 404

    return bp
