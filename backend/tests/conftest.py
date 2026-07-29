import json

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db
from app.core.deps import get_openai_client
from app.main import app
from app.models.base import Base
from app.repositories.sqlalchemy_repository import SQLAlchemyHealthRepository
from app.services.openai_client import IOpenAIClient


class FakeOpenAIClient(IOpenAIClient):
    """Test double for IOpenAIClient — scripted responses, no network calls."""

    def __init__(self):
        self.transcribe_response = "Transcripción de prueba."
        self.classification_response: str = json.dumps(
            {
                "routing": "TIMELINE",
                "baseline": None,
                "event": {
                    "title": "Evento de prueba",
                    "date": "2026-01-01",
                    "type": "Consulta",
                    "clinical_summary": "Resumen de prueba.",
                    "severity": "Baja",
                    "doctor": None,
                    "medical_center": None,
                    "department": None,
                },
                "red_flag": {"active": False, "justification": None},
            }
        )
        self.raise_error: Exception | None = None

    def transcribe_audio(self, audio_bytes: bytes, filename: str) -> str:
        if self.raise_error:
            raise self.raise_error
        return self.transcribe_response

    def classify_clinical_text(self, transcript: str, system_prompt: str) -> str:
        if self.raise_error:
            raise self.raise_error
        return self.classification_response

    def classify_clinical_image(self, image_base64: str, system_prompt: str) -> str:
        if self.raise_error:
            raise self.raise_error
        return self.classification_response


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session: Session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def repository(db_session):
    return SQLAlchemyHealthRepository(db_session)


@pytest.fixture()
def fake_openai_client():
    return FakeOpenAIClient()


@pytest.fixture()
def client(db_session, fake_openai_client):
    def override_get_db():
        yield db_session

    def override_get_openai_client():
        return fake_openai_client

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_openai_client] = override_get_openai_client
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
