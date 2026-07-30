from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.repositories.interfaces import IHealthRepository
from app.repositories.sqlalchemy_repository import SQLAlchemyHealthRepository
from app.services.ai_orchestrator import AIOrchestratorService
from app.services.openai_client import IOpenAIClient, OpenAIClientWrapper


def get_repository(db: Session = Depends(get_db)) -> Generator[IHealthRepository, None, None]:
    yield SQLAlchemyHealthRepository(db)


def get_openai_client() -> IOpenAIClient:
    settings = get_settings()
    return OpenAIClientWrapper(api_key=settings.openai_api_key)


def get_ai_orchestrator(
    repository: IHealthRepository = Depends(get_repository),
    ai_client: IOpenAIClient = Depends(get_openai_client),
) -> AIOrchestratorService:
    return AIOrchestratorService(ai_client=ai_client, repository=repository)
