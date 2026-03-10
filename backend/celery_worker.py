"""Compatibility entrypoint for Celery worker.

Use `core.celery_worker` as source of truth.
"""

from core.celery_worker import celery, flask_app  # noqa: F401

