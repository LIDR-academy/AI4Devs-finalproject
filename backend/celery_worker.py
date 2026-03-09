"""Celery worker bootstrap module."""

from __future__ import annotations

from celery import Celery

from core import create_app

flask_app = create_app()

celery = Celery(
	flask_app.import_name,
	broker=flask_app.config["CELERY_BROKER_URL"],
	backend=flask_app.config["CELERY_RESULT_BACKEND"],
)
celery.conf.update(flask_app.config)

