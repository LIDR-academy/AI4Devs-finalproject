from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Project settings and environment variables management.
    Uses pydantic-settings to automatically load vars from .env and environment.
    """
    # Database
    DATABASE_URL: str = "postgresql://user:password@db:5432/sfpm_db"

    # Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    # T-1001-INFRA: CloudFront CDN for GLB files
    CDN_BASE_URL: str = "https://tqduceanvyckaztgpcmw.supabase.co/storage/v1/object/public/processed-geometry"
    USE_CDN: bool = False

    # Celery (Task Queue)
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"

    # App Settings
    PROJECT_NAME: str = "SF-PM"
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate settings
settings = Settings()
