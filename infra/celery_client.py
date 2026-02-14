"""
Celery client singleton for the backend.

This module provides a Celery client for sending tasks to the agent worker.
The backend does NOT run tasks — it only sends them via send_task().
"""

import os
from celery import Celery
from typing import Optional


_celery_client: Optional[Celery] = None


def get_celery_client() -> Celery:
    """
    Get or create a singleton Celery client for sending tasks.

    Returns:
        Celery: Configured Celery client
    """
    global _celery_client

    if _celery_client is None:
        broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")

        _celery_client = Celery(
            "sf-pm-backend",
            broker=broker_url,
        )
        _celery_client.conf.update(
            task_serializer="json",
            result_serializer="json",
            accept_content=["json"],
        )

    return _celery_client
