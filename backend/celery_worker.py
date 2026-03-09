"""Celery worker bootstrap module."""

from __future__ import annotations

import os

from celery import Celery

from core import create_app

flask_config = os.environ.get("FLASK_CONFIG", "config.production.ProductionConfig")
flask_app = create_app(flask_config)

celery = Celery(
	flask_app.import_name,
	broker=flask_app.config["CELERY_BROKER_URL"],
	backend=flask_app.config["CELERY_RESULT_BACKEND"],
)
celery.conf.update(flask_app.config)


class ContextTask(celery.Task):
	"""Task subclass that pushes Flask app context before execution."""
	
	def __call__(self, *args, **kwargs):
		"""Execute task within Flask app context."""
		with flask_app.app_context():
			return self.run(*args, **kwargs)


celery.Task = ContextTask

