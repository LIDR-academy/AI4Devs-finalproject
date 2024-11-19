from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # Database settings
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "cartera_db"
    db_user: str = "admin"
    db_password: str = "admin123"

    # API Settings
    api_version: str = "v1"
    api_title: str = "Servicio de Clasificación de Contribuyentes"
    api_description: str = "API para el análisis y clasificación de contribuyentes"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        case_sensitive=False
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()