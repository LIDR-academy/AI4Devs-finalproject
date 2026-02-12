"""
Configuration module for SF-PM Agent.

Uses pydantic-settings for environment-based configuration management,
mirroring the backend pattern for consistency.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """
    Agent-specific configuration.
    Mirrors backend pattern for consistency.
    """
    # Celery
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"
    
    # Database (for direct writes)
    DATABASE_URL: str = "postgresql://user:password@db:5432/sfpm_db"
    
    # Supabase (for S3 downloads)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    
    # File Processing Limits
    MAX_FILE_SIZE_MB: int = 500
    TEMP_DIR: str = "/tmp/sf-pm-agent"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Instantiate settings
settings = Settings()
