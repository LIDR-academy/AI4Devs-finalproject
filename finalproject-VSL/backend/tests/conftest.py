"""
Shared pytest fixtures for all tests.
"""
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.shared.database import Base, get_db
from app.shared.models import PromptVersion
from app.main import app

# In-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    """Return a test DB session."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    """Return a FastAPI TestClient with DB override."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def seed_prompt(db):
    """Insert an active prompt version into the test DB."""
    prompt = PromptVersion(
        version_number=1,
        content="You are a helpful customer service assistant. Be concise and friendly.",
        is_active=True,
        created_by="system"
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


@pytest.fixture
def mock_openai():
    """Mock OpenAI client to avoid real API calls in tests."""
    with patch("app.modules.chatbot.router.client") as mock_chat, \
         patch("app.modules.meta_agent.router.client") as mock_meta:

        # Mock chat completion response
        mock_response = MagicMock()
        mock_response.choices[0].message.content = "Hello! How can I help you today?"
        mock_chat.chat.completions.create.return_value = mock_response
        mock_meta.chat.completions.create.return_value = mock_response

        yield mock_chat, mock_meta
