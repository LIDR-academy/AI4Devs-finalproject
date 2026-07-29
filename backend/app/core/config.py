from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Persistence (dedicated app database, separate from Statewave's).
    database_url: str = "postgresql://auditcare:auditcare@localhost:5433/auditcare_app"

    # Statewave contextual memory layer (see https://www.statewave.ai/developers)
    statewave_url: str = "http://localhost:8100"
    statewave_api_key: str = ""
    statewave_tenant_id: str = ""
    statewave_episode_path: str = "/v1/episodes"
    statewave_compile_path: str = "/v1/memories/compile"
    statewave_context_path: str = "/v1/context"
    statewave_subject_prefix: str = "patient"
    statewave_context_max_tokens: int = 1800
    statewave_timeout_seconds: float = 10.0

    # LLM used for clinical event extraction.
    # Any OpenAI-compatible endpoint works (OpenAI, a local LiteLLM proxy, etc.).
    # If left unset the backend falls back to a deterministic rule-based extractor
    # so the MVP remains fully executable offline.
    llm_base_url: str = ""
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    llm_timeout_seconds: float = 30.0


settings = Settings()
