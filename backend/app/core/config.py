# -*- coding: utf-8 -*-
"""
Application configuration settings for SEPE Templates Comparator.

This module handles all configuration settings using Pydantic BaseSettings
for environment variable management and validation.
"""

import os
from typing import List, Optional
from datetime import datetime
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application settings
    APP_NAME: str = "SEPE Templates Comparator"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "API for comparing SEPE PDF templates"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",  # Vite dev server
        "http://frontend:3000",
        "localhost",
        "127.0.0.1",
        "frontend",
        "0.0.0.0"
    ]
    
    # Database settings
    DATABASE_URL: str = "postgresql://sepe_user:sepe_password@localhost:5432/sepe_comparator"
    DATABASE_ECHO: bool = False
    
    # File upload settings
    MAX_FILE_SIZE_MB: int = 50
    UPLOAD_DIRECTORY: str = "./uploads"
    ALLOWED_EXTENSIONS: List[str] = [".pdf"]
    
    # JWT settings
    JWT_SECRET_KEY: str = "jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # Logging settings
    LOG_LEVEL: str = "INFO"
    
    # External services
    SEPE_BASE_URL: str = "https://www.sepe.es"
    
    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        """Validate environment setting."""
        allowed_environments = ["development", "testing", "staging", "production"]
        if v not in allowed_environments:
            raise ValueError(f"Environment must be one of: {allowed_environments}")
        return v
    
    @validator("ALLOWED_HOSTS", pre=True)
    def parse_allowed_hosts(cls, v):
        """Parse allowed hosts from string or list."""
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v
    
    @validator("ALLOWED_EXTENSIONS", pre=True)
    def parse_allowed_extensions(cls, v):
        """Parse allowed extensions from string or list."""
        if isinstance(v, str):
            return [ext.strip() for ext in v.split(",")]
        return v
    
    @property
    def max_file_size_bytes(self) -> int:
        """Get maximum file size in bytes."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024
    
    @staticmethod
    def get_current_timestamp() -> str:
        """Get current timestamp in ISO format."""
        return datetime.utcnow().isoformat() + "Z"
    
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT == "development"
    
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT == "production"
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


# Create settings instance
settings = Settings()
