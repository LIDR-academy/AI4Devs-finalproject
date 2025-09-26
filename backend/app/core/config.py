"""
Configuration management for the Personal Finance Tracker API.

This module provides centralized configuration using Pydantic Settings,
supporting environment variables and .env files.
"""

from typing import Literal
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Settings are loaded in the following order:
    1. Environment variables
    2. .env file (if present)
    3. Default values (defined below)
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        env_nested_delimiter="__"
    )
    
    # Application settings
    app_name: str = Field(
        default="Personal Finance Tracker API",
        description="Name of the application"
    )
    
    debug: bool = Field(
        default=False,
        description="Enable debug mode for development"
    )
    
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO",
        description="Logging level for the application"
    )
    
    # API settings
    api_v1_prefix: str = Field(
        default="/api/v1",
        description="API version 1 prefix for all endpoints"
    )
    
    # Server settings
    host: str = Field(
        default="0.0.0.0",
        description="Host address for the server"
    )
    
    port: int = Field(
        default=8000,
        ge=1,
        le=65535,
        description="Port number for the server (1-65535)"
    )
    
    # CORS settings
    cors_origins: str = Field(
        default="*",
        description="Allowed CORS origins (comma-separated)"
    )
    
    cors_allow_credentials: bool = Field(
        default=True,
        description="Allow credentials in CORS requests"
    )
    
    cors_allow_methods: str = Field(
        default="*",
        description="Allowed HTTP methods for CORS (comma-separated)"
    )
    
    cors_allow_headers: str = Field(
        default="*",
        description="Allowed headers for CORS (comma-separated)"
    )
    
    @field_validator('cors_origins', 'cors_allow_methods', 'cors_allow_headers', mode='after')
    @classmethod
    def parse_comma_separated(cls, v):
        """Parse comma-separated string into a list."""
        if isinstance(v, str):
            return [item.strip() for item in v.split(',') if item.strip()]
        return v


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """
    Get the application settings instance.
    
    Returns:
        Settings: The configured settings instance
    """
    return settings
