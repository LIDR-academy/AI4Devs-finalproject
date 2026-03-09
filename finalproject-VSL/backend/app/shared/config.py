from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/chatbot_improvement"
    openai_api_key: str = ""
    admin_api_key: str = "admin-secret-key"
    secret_key: str = "dev-secret-key"
    environment: str = "development"
    openai_model: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
