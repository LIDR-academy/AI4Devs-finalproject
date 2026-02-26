"""
Redis client configuration and utilities.

This module provides a singleton Redis client instance with graceful
degradation. If Redis is unavailable, operations fail silently and
the application continues without caching.
"""
import redis
from typing import Optional
import logging
import os

logger = logging.getLogger(__name__)

_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> Optional[redis.Redis]:
    """
    Get or create a Redis client instance.

    This function implements a singleton pattern to reuse the same
    client instance across the application. If Redis connection fails,
    returns None to enable graceful degradation.

    Returns:
        Optional[Redis]: Configured Redis client, or None if unavailable.

    Examples:
        >>> client = get_redis_client()
        >>> if client:
        ...     client.set("key", "value", ex=300)
        >>> # If Redis unavailable, client is None and code continues

    Notes:
        - Connection timeout: 2 seconds
        - Socket timeout: 2 seconds
        - decode_responses: True (returns strings, not bytes)
        - Graceful degradation: Returns None on connection failure
    """
    global _redis_client

    if _redis_client is None:
        try:
            _redis_client = redis.Redis(
                host='redis',
                port=6379,
                db=0,
                password=os.getenv('REDIS_PASSWORD'),
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
                socket_keepalive=True,
                health_check_interval=30
            )
            # Test connection
            _redis_client.ping()
            logger.info("Redis client initialized successfully")
        except (redis.ConnectionError, redis.TimeoutError) as e:
            logger.warning(f"Redis unavailable, caching disabled: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error initializing Redis: {e}")
            return None

    return _redis_client
