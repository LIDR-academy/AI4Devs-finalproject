"""Celery bootstrap integrated with Flask app context and failure capture."""

from __future__ import annotations

import os

from celery import Celery
from celery.signals import task_failure

from core import create_app

settings_module = os.getenv("APP_SETTINGS_MODULE", os.getenv("FLASK_CONFIG", "config.production.ProductionConfig"))
flask_app = create_app(settings_module)

celery = Celery(
    flask_app.import_name,
    broker=flask_app.config["CELERY_BROKER_URL"],
    backend=flask_app.config["CELERY_RESULT_BACKEND"],
)
celery.conf.update(
    task_serializer=flask_app.config.get("CELERY_TASK_SERIALIZER", "json"),
    result_serializer=flask_app.config.get("CELERY_RESULT_SERIALIZER", "json"),
    accept_content=flask_app.config.get("CELERY_ACCEPT_CONTENT", ["json"]),
    timezone=flask_app.config.get("CELERY_TIMEZONE", "UTC"),
    task_track_started=flask_app.config.get("CELERY_TASK_TRACK_STARTED", True),
    task_time_limit=flask_app.config.get("CELERY_TASK_TIME_LIMIT", 300),
    task_soft_time_limit=flask_app.config.get("CELERY_TASK_SOFT_TIME_LIMIT", 270),
    task_default_queue=flask_app.config.get("CELERY_TASK_DEFAULT_QUEUE", "default"),
    task_routes=flask_app.config.get("CELERY_TASK_ROUTES", {}),
    beat_schedule=flask_app.config.get("CELERY_BEAT_SCHEDULE", {}),
)
celery.autodiscover_tasks(["core.tasks"])


class ContextTask(celery.Task):
    """Run every task inside Flask app context."""

    def __call__(self, *args, **kwargs):
        with flask_app.app_context():
            return self.run(*args, **kwargs)


celery.Task = ContextTask


@task_failure.connect
def on_task_failure(sender=None, task_id=None, exception=None, args=None, kwargs=None, einfo=None, **_extra):
    """Capture task failures in app-level failed-task queue."""
    from core.tasks.failed_tasks import record_failed_task

    request_obj = getattr(sender, "request", None)
    retries = getattr(request_obj, "retries", 0)
    delivery_info = getattr(request_obj, "delivery_info", {}) or {}
    queue = delivery_info.get("routing_key")

    record_failed_task(
        task_id=task_id,
        task_name=getattr(sender, "name", None),
        args=args,
        kwargs=kwargs,
        exception=str(exception),
        traceback=str(einfo) if einfo else None,
        retries=retries,
        queue=queue,
    )
