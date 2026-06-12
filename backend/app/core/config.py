from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://auditcare:auditcare@localhost:5432/auditcare"
    openai_api_key: str = ""
    statewave_url: str = "http://localhost:8100"

    class Config:
        env_file = ".env"


settings = Settings()
