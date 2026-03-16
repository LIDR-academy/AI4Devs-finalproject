# 🧪 Testing Strategy - Nura System

## 🧪 Estrategia de Testing Integral

**Testing Philosophy**: Pyramid testing con énfasis en testing automatizado, TDD principles, y testing en production con feature flags.

**Coverage Goals**:
- **Unit Tests**: 90%+ coverage en business logic
- **Integration Tests**: 80%+ coverage en API endpoints y database interactions
- **E2E Tests**: 70%+ coverage en user journeys críticos
- **Performance Tests**: 100% coverage en endpoints críticos

---

## 🧪 Testing Pyramid Architecture

```mermaid
graph TB
    subgraph "Testing Pyramid - Nura System"
        subgraph "E2E Tests (10%)"
            E2E_BROWSER[Browser E2E<br/>Playwright]
            E2E_API[API E2E<br/>Postman/Newman]
            E2E_MOBILE[Mobile E2E<br/>Appium]
        end
        
        subgraph "Integration Tests (20%)"
            INT_API[API Integration<br/>FastAPI TestClient]
            INT_DB[Database Integration<br/>pytest-postgresql]
            INT_EXT[External Services<br/>Mock/Contract Testing]
            INT_AGENT[Agent Integration<br/>Multi-agent workflows]
        end
        
        subgraph "Unit Tests (70%)"
            UNIT_DOMAIN[Domain Logic<br/>pytest + pytest-cov]
            UNIT_SERVICE[Service Layer<br/>Mock dependencies]
            UNIT_UTILS[Utilities<br/>Property-based testing]
            UNIT_PLUGIN[Plugin Testing<br/>Isolated plugin tests]
        end
    end
    
    subgraph "Testing Infrastructure"
        CI[GitHub Actions CI]
        TESTENV[Test Environment]
        MOCK[Mock Services]
        DATA[Test Data Factory]
    end
    
    E2E_BROWSER --> CI
    INT_API --> TESTENV
    UNIT_DOMAIN --> DATA
    INT_EXT --> MOCK
```

---

## Unit Testing Strategy

### Test Organization

```text
tests/
├── unit/                           # Unit tests (fast, isolated)
│   ├── test_domain/
│   │   ├── test_conversation.py    # Domain entity tests
│   │   ├── test_user.py
│   │   └── test_learning_path.py
│   ├── test_services/
│   │   ├── test_chat_service.py    # Service layer tests
│   │   ├── test_orchestration.py
│   │   └── test_knowledge_service.py
│   ├── test_plugins/
│   │   ├── test_dev_agent.py       # Plugin unit tests
│   │   ├── test_oauth_plugin.py
│   │   └── test_rag_plugins.py
│   └── test_utils/
│       ├── test_formatters.py      # Utility function tests
│       └── test_validators.py
├── integration/                    # Integration tests (database, API)
│   ├── test_api/
│   │   ├── test_chat_endpoints.py
│   │   ├── test_auth_endpoints.py
│   │   └── test_orchestration_endpoints.py
│   ├── test_database/
│   │   ├── test_repositories.py
│   │   ├── test_migrations.py
│   │   └── test_vector_search.py
│   └── test_external/
│       ├── test_aws_bedrock.py
│       ├── test_oauth_providers.py
│       └── test_vector_storage.py
├── e2e/                           # End-to-end tests
│   ├── test_user_journeys/
│   │   ├── test_onboarding_flow.py
│   │   ├── test_chat_conversation.py
│   │   └── test_oauth_login.py
│   ├── test_admin_workflows/
│   │   └── test_system_monitoring.py
│   └── test_performance/
│       ├── test_load_testing.py
│       └── test_stress_testing.py
├── fixtures/                      # Test data and fixtures
│   ├── data/
│   │   ├── conversations.json
│   │   ├── users.json
│   │   └── documents.json
│   ├── factories.py              # Test data factories
│   └── mocks.py                  # Mock objects
└── conftest.py                   # pytest configuration
```

### Unit Test Implementation

```python
# tests/unit/test_domain/test_conversation.py
import pytest
from datetime import datetime, timezone
from uuid import uuid4

from src.domain.entities.conversation import Conversation, ConversationType
from src.domain.entities.message import Message, MessageRole
from src.domain.value_objects.user_id import UserId
from src.domain.exceptions import InvalidOperationError


class TestConversation:
    """Unit tests for Conversation domain entity"""
    
    @pytest.fixture
    def valid_conversation_data(self):
        return {
            'user_id': UserId(uuid4()),
            'title': 'Test Conversation',
            'conversation_type': ConversationType.GENERAL
        }
    
    @pytest.fixture
    def conversation(self, valid_conversation_data):
        return Conversation.create(**valid_conversation_data)
    
    def test_create_conversation_success(self, valid_conversation_data):
        """Test successful conversation creation"""
        conversation = Conversation.create(**valid_conversation_data)
        
        assert conversation.id is not None
        assert conversation.user_id == valid_conversation_data['user_id']
        assert conversation.title == valid_conversation_data['title']
        assert conversation.conversation_type == valid_conversation_data['conversation_type']
        assert conversation.created_at <= datetime.now(timezone.utc)
        assert conversation.messages == []
        assert conversation.is_active is True
    
    def test_create_conversation_with_invalid_title(self, valid_conversation_data):
        """Test conversation creation with invalid title"""
        valid_conversation_data['title'] = ''
        
        with pytest.raises(ValueError, match="Title cannot be empty"):
            Conversation.create(**valid_conversation_data)
    
    def test_add_message_success(self, conversation):
        """Test adding message to conversation"""
        message_content = "Hello, Nura!"
        
        message = conversation.add_message(
            content=message_content,
            role=MessageRole.USER
        )
        
        assert len(conversation.messages) == 1
        assert conversation.messages[0] == message
        assert message.content == message_content
        assert message.role == MessageRole.USER
        assert message.conversation_id == conversation.id
    
    def test_add_message_to_inactive_conversation(self, conversation):
        """Test adding message to inactive conversation fails"""
        conversation.deactivate()
        
        with pytest.raises(InvalidOperationError, match="Cannot add message to inactive conversation"):
            conversation.add_message("Test message", MessageRole.USER)
    
    def test_get_last_user_message(self, conversation):
        """Test getting last user message"""
        # Add some messages
        conversation.add_message("First user message", MessageRole.USER)
        conversation.add_message("Assistant response", MessageRole.ASSISTANT)
        conversation.add_message("Second user message", MessageRole.USER)
        
        last_user_message = conversation.get_last_user_message()
        
        assert last_user_message is not None
        assert last_user_message.content == "Second user message"
        assert last_user_message.role == MessageRole.USER
    
    def test_get_last_user_message_when_none_exists(self, conversation):
        """Test getting last user message when none exists"""
        conversation.add_message("Assistant message", MessageRole.ASSISTANT)
        
        last_user_message = conversation.get_last_user_message()
        
        assert last_user_message is None
    
    def test_conversation_statistics(self, conversation):
        """Test conversation statistics calculation"""
        # Add messages
        conversation.add_message("User message 1", MessageRole.USER)
        conversation.add_message("Assistant response 1", MessageRole.ASSISTANT)
        conversation.add_message("User message 2", MessageRole.USER)
        
        stats = conversation.get_statistics()
        
        assert stats['total_messages'] == 3
        assert stats['user_messages'] == 2
        assert stats['assistant_messages'] == 1
        assert stats['conversation_duration'] >= 0
    
    @pytest.mark.parametrize("conversation_type,expected_max_messages", [
        (ConversationType.GENERAL, 100),
        (ConversationType.ONBOARDING, 50),
        (ConversationType.DEBUGGING, 200)
    ])
    def test_message_limit_by_conversation_type(self, valid_conversation_data, conversation_type, expected_max_messages):
        """Test message limits based on conversation type"""
        valid_conversation_data['conversation_type'] = conversation_type
        conversation = Conversation.create(**valid_conversation_data)
        
        assert conversation.get_max_messages() == expected_max_messages


# tests/unit/test_services/test_chat_service.py
import pytest
from unittest.mock import Mock, AsyncMock
from uuid import uuid4

from src.application.services.chat_service import ChatService
from src.domain.entities.conversation import Conversation
from src.domain.repositories.conversation_repository import ConversationRepository
from src.application.dtos.chat_dtos import SendMessageRequest, SendMessageResponse
from src.infrastructure.llm.llm_gateway import LLMGateway


class TestChatService:
    """Unit tests for ChatService application service"""
    
    @pytest.fixture
    def mock_conversation_repo(self):
        return Mock(spec=ConversationRepository)
    
    @pytest.fixture
    def mock_llm_gateway(self):
        return Mock(spec=LLMGateway)
    
    @pytest.fixture
    def chat_service(self, mock_conversation_repo, mock_llm_gateway):
        return ChatService(
            conversation_repository=mock_conversation_repo,
            llm_gateway=mock_llm_gateway
        )
    
    @pytest.fixture
    def sample_conversation(self):
        return Conversation.create(
            user_id=uuid4(),
            title="Test Conversation",
            conversation_type="general"
        )
    
    @pytest.fixture
    def send_message_request(self):
        return SendMessageRequest(
            conversation_id=uuid4(),
            content="What is the best way to implement authentication?",
            user_id=uuid4()
        )
    
    @pytest.mark.asyncio
    async def test_send_message_success(self, chat_service, mock_conversation_repo, 
                                      mock_llm_gateway, sample_conversation, send_message_request):
        """Test successful message sending"""
        # Arrange
        mock_conversation_repo.get_by_id.return_value = sample_conversation
        mock_conversation_repo.save.return_value = sample_conversation
        
        mock_llm_response = {
            'content': 'For authentication, I recommend using OAuth 2.0...',
            'model': 'claude-3-sonnet',
            'tokens_used': 150,
            'cost_usd': 0.0045
        }
        mock_llm_gateway.generate_response.return_value = mock_llm_response
        
        # Act
        response = await chat_service.send_message(send_message_request)
        
        # Assert
        assert isinstance(response, SendMessageResponse)
        assert response.success is True
        assert response.conversation_id == send_message_request.conversation_id
        assert response.user_message.content == send_message_request.content
        assert response.assistant_message.content == mock_llm_response['content']
        assert response.llm_metadata.model == mock_llm_response['model']
        
        # Verify repository interactions
        mock_conversation_repo.get_by_id.assert_called_once_with(send_message_request.conversation_id)
        mock_conversation_repo.save.assert_called_once()
        
        # Verify LLM gateway interaction
        mock_llm_gateway.generate_response.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_send_message_conversation_not_found(self, chat_service, mock_conversation_repo, send_message_request):
        """Test sending message to non-existent conversation"""
        # Arrange
        mock_conversation_repo.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(ValueError, match="Conversation not found"):
            await chat_service.send_message(send_message_request)
    
    @pytest.mark.asyncio
    async def test_send_message_llm_failure(self, chat_service, mock_conversation_repo, 
                                          mock_llm_gateway, sample_conversation, send_message_request):
        """Test handling LLM service failure"""
        # Arrange
        mock_conversation_repo.get_by_id.return_value = sample_conversation
        mock_llm_gateway.generate_response.side_effect = Exception("LLM service unavailable")
        
        # Act
        response = await chat_service.send_message(send_message_request)
        
        # Assert
        assert response.success is False
        assert "LLM service unavailable" in response.error_message
        assert response.assistant_message.content.startswith("I apologize")


# tests/unit/test_plugins/test_oauth_plugin.py
import pytest
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime, timedelta

from src.plugins.oauth.oauth_plugin import CorporateOAuthPlugin
from src.plugins.oauth.models import OAuthConfig, CallbackRequest
from src.core.kernel_context import KernelContext


class TestCorporateOAuthPlugin:
    """Unit tests for Corporate OAuth Plugin"""
    
    @pytest.fixture
    def mock_kernel_context(self):
        context = Mock(spec=KernelContext)
        context.db_session = AsyncMock()
        context.cache = Mock()
        context.logger = Mock()
        context.config = {'OAUTH_ENCRYPTION_KEY': 'test-encryption-key'}
        return context
    
    @pytest.fixture
    def oauth_plugin(self, mock_kernel_context):
        plugin = CorporateOAuthPlugin()
        plugin.kernel_context = mock_kernel_context
        plugin.db = mock_kernel_context.db_session
        plugin.cache = mock_kernel_context.cache
        plugin.logger = mock_kernel_context.logger
        return plugin
    
    @pytest.fixture
    def sample_oauth_config(self):
        return OAuthConfig(
            client_id="test-client-id",
            client_secret="test-client-secret",
            redirect_uri="http://localhost:3000/auth/callback"
        )
    
    def test_plugin_info(self, oauth_plugin):
        """Test plugin metadata"""
        info = oauth_plugin.get_plugin_info()
        
        assert info['name'] == 'corporate-oauth'
        assert info['version'] == '1.0.0'
        assert 'oauth2_pkce' in info['capabilities']
        assert 'google_workspace' in info['capabilities']
    
    def test_generate_pkce_pair(self, oauth_plugin):
        """Test PKCE code verifier and challenge generation"""
        verifier, challenge = oauth_plugin._generate_pkce_pair()
        
        assert len(verifier) >= 32
        assert len(challenge) >= 32
        assert verifier != challenge
        # Verify base64url encoding (no padding)
        assert '=' not in verifier
        assert '=' not in challenge
    
    @pytest.mark.asyncio
    async def test_initiate_oauth_success(self, oauth_plugin):
        """Test OAuth initiation with PKCE"""
        oauth_plugin.oauth_config = OAuthConfig(
            client_id="test-client-id",
            client_secret="test-secret",
            redirect_uri="http://localhost:3000/auth/callback"
        )
        
        request = Mock()
        request.domain = "company.com"
        request.redirect_uri = None
        
        with patch.object(oauth_plugin, '_generate_pkce_pair') as mock_pkce:
            mock_pkce.return_value = ("test-verifier", "test-challenge")
            
            result = await oauth_plugin.initiate_oauth(request)
        
        assert 'authorization_url' in result
        assert 'state' in result
        assert 'expires_at' in result
        assert 'https://accounts.google.com/o/oauth2/v2/auth' in result['authorization_url']
        assert 'code_challenge=test-challenge' in result['authorization_url']
        assert 'hd=company.com' in result['authorization_url']
    
    @pytest.mark.asyncio
    async def test_validate_corporate_domain_success(self, oauth_plugin):
        """Test corporate domain validation"""
        # Mock database response
        oauth_plugin.db.fetch_one.return_value = {
            'domain': 'company.com',
            'organization_name': 'Test Company',
            'authorized_roles': ['user', 'developer'],
            'google_workspace_config': {}
        }
        
        result = await oauth_plugin._validate_corporate_domain('user@company.com')
        
        assert result is not None
        assert result['domain'] == 'company.com'
        assert result['organization_name'] == 'Test Company'
        oauth_plugin.db.fetch_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_validate_corporate_domain_unauthorized(self, oauth_plugin):
        """Test corporate domain validation with unauthorized domain"""
        # Mock database response - no domain found
        oauth_plugin.db.fetch_one.return_value = None
        
        result = await oauth_plugin._validate_corporate_domain('user@unauthorized.com')
        
        assert result is None
    
    def test_map_groups_to_role(self, oauth_plugin):
        """Test Google Groups to application role mapping"""
        # Test admin role mapping
        admin_groups = ['admin@company.com', 'users@company.com']
        role = oauth_plugin._map_groups_to_role(admin_groups, ['user', 'admin'])
        assert role == 'admin'
        
        # Test developer role mapping
        dev_groups = ['developers@company.com', 'users@company.com']
        role = oauth_plugin._map_groups_to_role(dev_groups, ['user', 'developer'])
        assert role == 'developer'
        
        # Test fallback to default role
        user_groups = ['users@company.com']
        role = oauth_plugin._map_groups_to_role(user_groups, ['user'])
        assert role == 'user'
        
        # Test fallback to first authorized role
        unknown_groups = ['unknown@company.com']
        role = oauth_plugin._map_groups_to_role(unknown_groups, ['viewer', 'user'])
        assert role == 'viewer'
    
    @pytest.mark.asyncio
    async def test_store_oauth_tokens(self, oauth_plugin):
        """Test OAuth token storage with encryption"""
        oauth_plugin._encrypt_token = Mock(side_effect=lambda x: f"encrypted_{x}")
        oauth_plugin.db.fetch_one.return_value = {'id': 'provider-id'}
        oauth_plugin.db.execute.return_value = None
        
        token_data = {
            'access_token': 'test-access-token',
            'refresh_token': 'test-refresh-token',
            'expires_in': 3600,
            'scope': 'openid email profile'
        }
        
        await oauth_plugin._store_oauth_tokens('user-id', token_data)
        
        # Verify encryption was called
        oauth_plugin._encrypt_token.assert_any_call('test-access-token')
        oauth_plugin._encrypt_token.assert_any_call('test-refresh-token')
        
        # Verify database call
        oauth_plugin.db.execute.assert_called_once()


# tests/fixtures/factories.py
import factory
from datetime import datetime, timezone
from uuid import uuid4

from src.domain.entities.user import User
from src.domain.entities.conversation import Conversation, ConversationType
from src.domain.entities.message import Message, MessageRole


class UserFactory(factory.Factory):
    """Factory for creating test User entities"""
    
    class Meta:
        model = User
    
    id = factory.LazyFunction(uuid4)
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    name = factory.Faker('name')
    role = factory.Iterator(['user', 'developer', 'admin'])
    preferences = factory.LazyFunction(lambda: {
        'language': 'en',
        'domain': 'backend',
        'experience_level': 'intermediate'
    })
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class ConversationFactory(factory.Factory):
    """Factory for creating test Conversation entities"""
    
    class Meta:
        model = Conversation
    
    id = factory.LazyFunction(uuid4)
    user_id = factory.LazyFunction(uuid4)
    title = factory.Faker('sentence', nb_words=4)
    conversation_type = factory.Iterator([t.value for t in ConversationType])
    is_active = True
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    updated_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class MessageFactory(factory.Factory):
    """Factory for creating test Message entities"""
    
    class Meta:
        model = Message
    
    id = factory.LazyFunction(uuid4)
    conversation_id = factory.LazyFunction(uuid4)
    content = factory.Faker('text', max_nb_chars=500)
    role = factory.Iterator([r.value for r in MessageRole])
    llm_metadata = factory.LazyFunction(lambda: {
        'model': 'claude-3-sonnet',
        'tokens_total': 150,
        'cost_usd': 0.0045
    })
    created_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


# Test data fixtures
class TestDataFixtures:
    """Centralized test data fixtures"""
    
    @staticmethod
    def get_sample_conversation_data():
        return {
            'id': uuid4(),
            'user_id': uuid4(),
            'title': 'Sample Conversation',
            'conversation_type': ConversationType.GENERAL,
            'messages': [
                {
                    'content': 'Hello, how can I implement authentication?',
                    'role': MessageRole.USER
                },
                {
                    'content': 'I recommend using OAuth 2.0 with PKCE...',
                    'role': MessageRole.ASSISTANT,
                    'llm_metadata': {
                        'model': 'claude-3-sonnet',
                        'tokens_total': 200,
                        'cost_usd': 0.006
                    }
                }
            ]
        }
    
    @staticmethod
    def get_oauth_test_data():
        return {
            'valid_oauth_config': {
                'client_id': 'test-client-id',
                'client_secret': 'test-client-secret',
                'redirect_uri': 'http://localhost:3000/auth/callback',
                'scope': 'openid email profile'
            },
            'google_user_info': {
                'id': '123456789',
                'email': 'user@company.com',
                'name': 'Test User',
                'picture': 'https://example.com/avatar.jpg',
                'verified_email': True,
                'hd': 'company.com'
            },
            'corporate_domain': {
                'domain': 'company.com',
                'organization_name': 'Test Company',
                'domain_status': 'active',
                'authorized_roles': ['user', 'developer']
            }
        }
```

---

## Integration Testing Strategy

### API Integration Tests

```python
# tests/integration/test_api/test_chat_endpoints.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import asyncio

from src.main import app
from src.infrastructure.database.database import get_db
from src.infrastructure.database.models import Base
from tests.fixtures.factories import UserFactory, ConversationFactory


# Test database setup
SQLALCHEMY_DATABASE_URL = "postgresql://test:test@localhost/nura_test"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def test_db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    """Test client with database"""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def test_user(client):
    """Create test user"""
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "role": "developer"
    }
    response = client.post("/users", json=user_data)
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def test_conversation(client, test_user):
    """Create test conversation"""
    conversation_data = {
        "title": "Test Conversation",
        "conversation_type": "general"
    }
    headers = {"Authorization": f"Bearer {test_user['access_token']}"}
    response = client.post("/conversations", json=conversation_data, headers=headers)
    assert response.status_code == 201
    return response.json()


class TestChatEndpoints:
    """Integration tests for chat API endpoints"""
    
    def test_send_message_success(self, client, test_conversation, test_user):
        """Test successful message sending via API"""
        message_data = {
            "conversation_id": test_conversation["id"],
            "content": "What is the best way to implement caching?"
        }
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        
        response = client.post("/chat/message", json=message_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user_message"]["content"] == message_data["content"]
        assert data["assistant_message"]["content"] is not None
        assert data["llm_metadata"]["model"] is not None
    
    def test_send_message_invalid_conversation(self, client, test_user):
        """Test sending message to invalid conversation"""
        message_data = {
            "conversation_id": "invalid-uuid",
            "content": "Test message"
        }
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        
        response = client.post("/chat/message", json=message_data, headers=headers)
        
        assert response.status_code == 404
        assert "Conversation not found" in response.json()["detail"]
    
    def test_send_message_unauthorized(self, client, test_conversation):
        """Test sending message without authentication"""
        message_data = {
            "conversation_id": test_conversation["id"],
            "content": "Test message"
        }
        
        response = client.post("/chat/message", json=message_data)
        
        assert response.status_code == 401
    
    def test_get_conversation_history(self, client, test_conversation, test_user):
        """Test retrieving conversation history"""
        # First, send a few messages
        for i in range(3):
            message_data = {
                "conversation_id": test_conversation["id"],
                "content": f"Test message {i + 1}"
            }
            headers = {"Authorization": f"Bearer {test_user['access_token']}"}
            client.post("/chat/message", json=message_data, headers=headers)
        
        # Get conversation history
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = client.get(f"/conversations/{test_conversation['id']}/messages", headers=headers)
        
        assert response.status_code == 200
        messages = response.json()
        assert len(messages) == 6  # 3 user messages + 3 assistant responses
    
    def test_conversation_metrics(self, client, test_conversation, test_user):
        """Test conversation metrics endpoint"""
        # Send some messages first
        message_data = {
            "conversation_id": test_conversation["id"],
            "content": "Test message for metrics"
        }
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        client.post("/chat/message", json=message_data, headers=headers)
        
        # Get metrics
        response = client.get(f"/conversations/{test_conversation['id']}/metrics", headers=headers)
        
        assert response.status_code == 200
        metrics = response.json()
        assert "total_messages" in metrics
        assert "total_tokens" in metrics
        assert "total_cost_usd" in metrics
        assert metrics["total_messages"] >= 2  # At least user + assistant message


# tests/integration/test_database/test_vector_search.py
import pytest
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.infrastructure.database.repositories.knowledge_repository import KnowledgeRepository
from src.domain.entities.document import Document
from src.infrastructure.vector.vector_service import VectorService


@pytest.fixture
async def async_session():
    """Async database session for testing"""
    engine = create_async_engine("postgresql+asyncpg://test:test@localhost/nura_test")
    async_session = sessionmaker(engine, class_=AsyncSession)
    
    async with async_session() as session:
        yield session


@pytest.fixture
def knowledge_repo(async_session):
    return KnowledgeRepository(async_session)


@pytest.fixture
def vector_service():
    return VectorService()


class TestVectorSearch:
    """Integration tests for vector search functionality"""
    
    @pytest.mark.asyncio
    async def test_document_embedding_and_search(self, knowledge_repo, vector_service):
        """Test document embedding and semantic search"""
        # Create test document
        document = Document.create(
            title="Authentication Best Practices",
            content="OAuth 2.0 is a secure authentication protocol. It uses PKCE for enhanced security.",
            domain="technical",
            content_type="documentation"
        )
        
        # Store document and generate embeddings
        await knowledge_repo.save_document(document)
        await vector_service.generate_embeddings(document)
        
        # Search for related content
        search_results = await vector_service.semantic_search(
            query="authentication security",
            domain="technical",
            limit=5
        )
        
        assert len(search_results) > 0
        assert search_results[0]['document_id'] == document.id
        assert search_results[0]['similarity_score'] > 0.7
    
    @pytest.mark.asyncio
    async def test_contextual_retrieval_with_bm25(self, knowledge_repo, vector_service):
        """Test hybrid BM25 + vector search"""
        # Create multiple test documents
        documents = [
            Document.create(
                title="OAuth Implementation",
                content="OAuth 2.0 implementation requires client credentials and redirect URIs.",
                domain="technical"
            ),
            Document.create(
                title="Authentication Patterns",
                content="Common authentication patterns include JWT tokens and session-based auth.",
                domain="technical"
            ),
            Document.create(
                title="Security Guidelines",
                content="Security best practices for web applications include HTTPS and CSRF protection.",
                domain="technical"
            )
        ]
        
        # Store documents and generate embeddings
        for doc in documents:
            await knowledge_repo.save_document(doc)
            await vector_service.generate_embeddings(doc)
        
        # Perform hybrid search
        hybrid_results = await vector_service.hybrid_search(
            query="OAuth implementation authentication",
            domain="technical",
            bm25_weight=0.3,
            vector_weight=0.7
        )
        
        assert len(hybrid_results) >= 2
        # OAuth implementation document should rank highest
        assert "OAuth" in hybrid_results[0]['title']
        assert hybrid_results[0]['hybrid_score'] > hybrid_results[1]['hybrid_score']
    
    @pytest.mark.asyncio
    async def test_late_chunking_expansion(self, knowledge_repo, vector_service):
        """Test late chunking chunk expansion"""
        # Create document with multiple chunks
        long_document = Document.create(
            title="Comprehensive Authentication Guide",
            content="""
            Authentication is the process of verifying user identity.
            
            OAuth 2.0 Protocol:
            OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts.
            
            Implementation Steps:
            1. Register your application with the OAuth provider
            2. Redirect users to the authorization server
            3. Handle the authorization callback
            4. Exchange authorization code for access tokens
            
            Security Considerations:
            Always use HTTPS for OAuth flows and implement PKCE for public clients.
            """,
            domain="technical"
        )
        
        await knowledge_repo.save_document(long_document)
        await vector_service.generate_embeddings(long_document)
        
        # Search and get chunk IDs
        search_results = await vector_service.semantic_search(
            query="OAuth implementation steps",
            domain="technical",
            limit=3
        )
        
        chunk_ids = [result['chunk_id'] for result in search_results]
        
        # Test late chunking expansion
        expanded_chunks = await vector_service.late_chunking_expand(
            chunk_ids=chunk_ids,
            expansion_level=1
        )
        
        assert len(expanded_chunks) == len(chunk_ids)
        # Expanded text should be longer than original chunks
        for expanded in expanded_chunks:
            assert len(expanded['expanded_text']) > 100
            assert expanded['context_score'] > 0
```

---

## End-to-End Testing Strategy

### Playwright E2E Tests

```typescript
// tests/e2e/test_user_journeys/test_chat_conversation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Conversation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test data and navigate to app
    await page.goto('http://localhost:8501');
    
    // Mock user authentication
    await page.evaluate(() => {
      localStorage.setItem('user_token', 'test-jwt-token');
      localStorage.setItem('user_id', 'test-user-id');
    });
  });

  test('should send message and receive response', async ({ page }) => {
    // Wait for chat interface to load
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // Type a message
    const messageInput = page.locator('[data-testid="message-input"]');
    await messageInput.fill('What is the best way to implement authentication in FastAPI?');
    
    // Send message
    await page.locator('[data-testid="send-button"]').click();
    
    // Verify user message appears
    await expect(page.locator('[data-testid="user-message"]').last()).toContainText('authentication in FastAPI');
    
    // Wait for and verify assistant response
    await expect(page.locator('[data-testid="assistant-message"]').last()).toBeVisible({ timeout: 10000 });
    const assistantMessage = page.locator('[data-testid="assistant-message"]').last();
    await expect(assistantMessage).toContainText('FastAPI');
    
    // Verify LLM metadata is shown
    await page.locator('[data-testid="response-details-toggle"]').last().click();
    await expect(page.locator('[data-testid="llm-model"]')).toBeVisible();
    await expect(page.locator('[data-testid="token-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="cost-display"]')).toBeVisible();
  });

  test('should handle conversation context', async ({ page }) => {
    // Send first message
    await page.locator('[data-testid="message-input"]').fill('What is OAuth 2.0?');
    await page.locator('[data-testid="send-button"]').click();
    await expect(page.locator('[data-testid="assistant-message"]').last()).toBeVisible({ timeout: 10000 });
    
    // Send follow-up message that requires context
    await page.locator('[data-testid="message-input"]').fill('How do I implement it in Python?');
    await page.locator('[data-testid="send-button"]').click();
    await expect(page.locator('[data-testid="assistant-message"]').last()).toBeVisible({ timeout: 10000 });
    
    // Verify the response understands context (mentions OAuth and Python)
    const lastResponse = page.locator('[data-testid="assistant-message"]').last();
    await expect(lastResponse).toContainText(/OAuth|Python/);
  });

  test('should show agent status indicators', async ({ page }) => {
    // Verify agent status indicators are visible
    await expect(page.locator('[data-testid="agent-status"]')).toBeVisible();
    
    // Check individual agent statuses
    const agents = ['Dev Agent', 'PM Agent', 'Architect Agent'];
    for (const agent of agents) {
      await expect(page.locator(`[data-testid="agent-${agent.toLowerCase().replace(' ', '-')}"]`)).toBeVisible();
    }
  });

  test('should display usage metrics', async ({ page }) => {
    // Open metrics panel
    await page.locator('[data-testid="usage-metrics-toggle"]').click();
    
    // Verify metrics are displayed
    await expect(page.locator('[data-testid="messages-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="llm-calls"]')).toBeVisible();
    await expect(page.locator('[data-testid="cost-today"]')).toBeVisible();
  });

  test('should handle WebSocket connection status', async ({ page }) => {
    // Check initial connection status
    await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();
    
    // Simulate connection loss (mock WebSocket failure)
    await page.evaluate(() => {
      // Trigger WebSocket disconnect event
      window.dispatchEvent(new Event('websocket-disconnect'));
    });
    
    // Verify disconnected status is shown
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Disconnected');
    
    // Simulate reconnection
    await page.evaluate(() => {
      window.dispatchEvent(new Event('websocket-connect'));
    });
    
    // Verify connected status
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
  });
});


// tests/e2e/test_user_journeys/test_oauth_login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('OAuth Authentication Flow', () => {
  test('should complete Google OAuth login flow', async ({ page, context }) => {
    // Start OAuth flow
    await page.goto('http://localhost:8501');
    await page.locator('[data-testid="google-login-button"]').click();
    
    // Should redirect to Google OAuth
    await expect(page).toHaveURL(/accounts\.google\.com/);
    
    // Mock Google login (in real tests, this would be automated)
    // For demonstration, we'll mock the callback
    await page.goto('http://localhost:8501/auth/callback?code=test-auth-code&state=test-state');
    
    // Should be redirected back to app with user logged in
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });

  test('should handle OAuth error states', async ({ page }) => {
    // Navigate to callback with error
    await page.goto('http://localhost:8501/auth/callback?error=access_denied&state=test-state');
    
    // Should show error message
    await expect(page.locator('[data-testid="auth-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-error"]')).toContainText('Authentication failed');
  });

  test('should validate corporate domain', async ({ page }) => {
    // Mock OAuth callback with non-corporate email
    await page.goto('http://localhost:8501/auth/callback?code=test-code&state=test-state');
    
    // Mock the backend response for unauthorized domain
    await page.route('**/oauth/callback', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Email domain not authorized for corporate access'
        })
      });
    });
    
    // Should show domain not authorized error
    await expect(page.locator('[data-testid="domain-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="domain-error"]')).toContainText('not authorized');
  });
});
```

---

## Performance Testing Strategy

### Load Testing with K6

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTrend = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests under 2s
    'errors': ['rate<0.1'],             // Error rate under 10%
    'http_req_failed': ['rate<0.05'],   // Failed requests under 5%
  },
};

// Test data
const BASE_URL = 'http://api.nura.ai';
const TEST_USER_TOKEN = 'test-jwt-token';

export function setup() {
  // Create test conversation
  const payload = {
    title: 'Load Test Conversation',
    conversation_type: 'general'
  };
  
  const response = http.post(`${BASE_URL}/conversations`, JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_USER_TOKEN}`,
    },
  });
  
  return { conversationId: response.json('id') };
}

export default function(data) {
  // Test sending chat messages
  const messagePayload = {
    conversation_id: data.conversationId,
    content: `Load test message ${Math.random()}: What is the best way to implement caching?`
  };
  
  const response = http.post(`${BASE_URL}/chat/message`, JSON.stringify(messagePayload), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_USER_TOKEN}`,
    },
  });
  
  // Check response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response has content': (r) => r.json('assistant_message.content') !== undefined,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });
  
  // Record metrics
  errorRate.add(!success);
  responseTrend.add(response.timings.duration);
  
  // Test conversation retrieval
  const getConversation = http.get(`${BASE_URL}/conversations/${data.conversationId}/messages`, {
    headers: {
      'Authorization': `Bearer ${TEST_USER_TOKEN}`,
    },
  });
  
  check(getConversation, {
    'conversation retrieval successful': (r) => r.status === 200,
    'conversation has messages': (r) => r.json().length > 0,
  });
  
  sleep(1); // 1 second delay between iterations
}

export function teardown(data) {
  // Cleanup test data if needed
  console.log(`Load test completed for conversation ${data.conversationId}`);
}
```

### Stress Testing

```python
# tests/performance/stress_test.py
import asyncio
import aiohttp
import time
from concurrent.futures import ThreadPoolExecutor
import statistics

class StressTestRunner:
    def __init__(self, base_url: str, max_concurrent: int = 500):
        self.base_url = base_url
        self.max_concurrent = max_concurrent
        self.results = []
        
    async def send_request(self, session: aiohttp.ClientSession, endpoint: str, payload: dict):
        """Send single HTTP request and measure response time"""
        start_time = time.time()
        try:
            async with session.post(f"{self.base_url}{endpoint}", json=payload) as response:
                response_time = time.time() - start_time
                status = response.status
                content = await response.text()
                
                return {
                    'status': status,
                    'response_time': response_time,
                    'success': status == 200,
                    'content_length': len(content)
                }
        except Exception as e:
            return {
                'status': 0,
                'response_time': time.time() - start_time,
                'success': False,
                'error': str(e)
            }
    
    async def run_stress_test(self, duration_seconds: int = 300):
        """Run stress test for specified duration"""
        print(f"Starting stress test for {duration_seconds} seconds with {self.max_concurrent} concurrent requests")
        
        # Test payload
        payload = {
            'conversation_id': 'test-conversation-id',
            'content': 'Stress test message: What is the performance of this system?'
        }
        
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        async with aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            connector=aiohttp.TCPConnector(limit=self.max_concurrent)
        ) as session:
            
            while time.time() < end_time:
                # Create batch of concurrent requests
                tasks = []
                for _ in range(self.max_concurrent):
                    task = self.send_request(session, '/chat/message', payload)
                    tasks.append(task)
                
                # Execute batch
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                self.results.extend([r for r in batch_results if isinstance(r, dict)])
                
                # Brief pause between batches
                await asyncio.sleep(0.1)
        
        self.analyze_results()
    
    def analyze_results(self):
        """Analyze stress test results"""
        if not self.results:
            print("No results to analyze")
            return
        
        total_requests = len(self.results)
        successful_requests = sum(1 for r in self.results if r['success'])
        failed_requests = total_requests - successful_requests
        
        response_times = [r['response_time'] for r in self.results if r['success']]
        
        if response_times:
            avg_response_time = statistics.mean(response_times)
            p95_response_time = statistics.quantiles(response_times, n=20)[18]  # 95th percentile
            p99_response_time = statistics.quantiles(response_times, n=100)[98]  # 99th percentile
        else:
            avg_response_time = p95_response_time = p99_response_time = 0
        
        # Calculate requests per second
        test_duration = max([r['response_time'] for r in self.results]) if self.results else 1
        rps = total_requests / test_duration
        
        print("\n=== Stress Test Results ===")
        print(f"Total Requests: {total_requests}")
        print(f"Successful Requests: {successful_requests}")
        print(f"Failed Requests: {failed_requests}")
        print(f"Error Rate: {(failed_requests / total_requests) * 100:.2f}%")
        print(f"Requests/Second: {rps:.2f}")
        print(f"Average Response Time: {avg_response_time:.3f}s")
        print(f"95th Percentile Response Time: {p95_response_time:.3f}s")
        print(f"99th Percentile Response Time: {p99_response_time:.3f}s")
        
        # Performance thresholds
        if avg_response_time > 2.0:
            print("⚠️  WARNING: Average response time exceeds 2s threshold")
        if p95_response_time > 5.0:
            print("⚠️  WARNING: 95th percentile response time exceeds 5s threshold")
        if (failed_requests / total_requests) > 0.01:
            print("⚠️  WARNING: Error rate exceeds 1% threshold")
        
        print("========================\n")


# Run stress test
async def main():
    runner = StressTestRunner(
        base_url="http://api.nura.ai",
        max_concurrent=100
    )
    await runner.run_stress_test(duration_seconds=300)  # 5 minute stress test

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Testing Configuration

### pytest Configuration

```ini
# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --strict-markers
    --strict-config
    --cov=src
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-report=xml:coverage.xml
    --cov-fail-under=80
    --junitxml=pytest-report.xml
    -ra
    -q
markers =
    unit: Unit tests
    integration: Integration tests
    e2e: End-to-end tests
    slow: Slow tests
    performance: Performance tests
    requires_db: Tests that require database
    requires_llm: Tests that require LLM services
filterwarnings =
    error
    ignore::UserWarning
    ignore::DeprecationWarning
env =
    DATABASE_URL = postgresql://test:test@localhost/nura_test
    REDIS_URL = redis://localhost:6379/1
    AWS_ACCESS_KEY_ID = test
    AWS_SECRET_ACCESS_KEY = test
    AWS_DEFAULT_REGION = us-east-1
    ENVIRONMENT = test
```

### GitHub Actions Test Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.11', '3.12']
    
    services:
      postgres:
        image: pgvector/pgvector:pg15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_USER: test
          POSTGRES_DB: nura_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r backend/requirements.txt
        pip install -r backend/requirements-test.txt
    
    - name: Run unit tests
      run: |
        cd backend
        pytest tests/unit -v --cov=src --cov-report=xml
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/nura_test
        REDIS_URL: redis://localhost:6379/1
    
    - name: Upload coverage reports to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage.xml
        flags: unittests
        name: codecov-umbrella

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    services:
      postgres:
        image: pgvector/pgvector:pg15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_USER: test
          POSTGRES_DB: nura_test
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r backend/requirements.txt
        pip install -r backend/requirements-test.txt
    
    - name: Run integration tests
      run: |
        cd backend
        pytest tests/integration -v --cov=src --cov-append
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/nura_test
        REDIS_URL: redis://localhost:6379/1

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install Playwright
      run: |
        cd frontend/react
        npm ci
        npx playwright install --with-deps
    
    - name: Start backend services
      run: |
        docker-compose -f docker-compose.test.yml up -d
        sleep 30  # Wait for services to start
    
    - name: Run E2E tests
      run: |
        cd frontend/react
        npx playwright test
    
    - name: Upload E2E test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: frontend/react/playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    needs: e2e-tests
    if: github.ref == 'refs/heads/main'  # Only run on main branch
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up k6
      run: |
        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6
    
    - name: Run performance tests
      run: |
        k6 run tests/performance/load-test.js
      env:
        K6_PROMETHEUS_RW_SERVER_URL: ${{ secrets.PROMETHEUS_URL }}
```

---

## AI Model & LLM Testing Strategy

### LLM Response Quality Testing

```python
# tests/ai_models/test_llm_quality.py
import pytest
from unittest.mock import Mock, AsyncMock
import asyncio

from src.infrastructure.llm.bedrock_client import BedrockClient
from src.application.services.response_evaluator import ResponseQualityEvaluator
from src.domain.value_objects.llm_response import LLMResponse

class TestLLMResponseQuality:
    """Tests for LLM response quality and accuracy"""
    
    @pytest.fixture
    def bedrock_client(self):
        return BedrockClient(region='us-west-2')
    
    @pytest.fixture
    def quality_evaluator(self):
        return ResponseQualityEvaluator()
    
    @pytest.mark.asyncio
    async def test_response_relevance_technical_question(self, bedrock_client, quality_evaluator):
        """Test LLM response relevance for technical questions"""
        test_cases = [
            {
                'query': '¿Cómo implementar autenticación OAuth 2.0 en FastAPI?',
                'expected_keywords': ['oauth', 'fastapi', 'authentication', 'token'],
                'domain': 'technical',
                'minimum_relevance': 0.85
            },
            {
                'query': 'Explica el patrón Repository en DDD',
                'expected_keywords': ['repository', 'ddd', 'domain', 'pattern'],
                'domain': 'architectural',
                'minimum_relevance': 0.80
            }
        ]
        
        for case in test_cases:
            response = await bedrock_client.generate_response(
                prompt=case['query'],
                model='anthropic.claude-3-sonnet-20240229-v1:0'
            )
            
            # Evaluate response quality
            quality_score = await quality_evaluator.evaluate_relevance(
                query=case['query'],
                response=response.content,
                domain=case['domain']
            )
            
            assert quality_score.relevance >= case['minimum_relevance']
            assert quality_score.technical_accuracy > 0.7
            
            # Check for expected keywords
            response_lower = response.content.lower()
            found_keywords = sum(1 for keyword in case['expected_keywords'] 
                               if keyword in response_lower)
            assert found_keywords >= len(case['expected_keywords']) * 0.6
    
    @pytest.mark.asyncio
    async def test_response_consistency_across_models(self, bedrock_client):
        """Test response consistency across different LLM models"""
        query = "¿Cuáles son las mejores prácticas para testing de APIs?"
        models = [
            'anthropic.claude-3-haiku-20240307-v1:0',
            'anthropic.claude-3-sonnet-20240229-v1:0'
        ]
        
        responses = []
        for model in models:
            response = await bedrock_client.generate_response(
                prompt=query,
                model=model
            )
            responses.append(response)
        
        # Evaluate semantic similarity between responses
        similarity_score = await self._calculate_semantic_similarity(
            responses[0].content, 
            responses[1].content
        )
        
        # Responses should be semantically similar (>60%) but not identical
        assert similarity_score > 0.6
        assert similarity_score < 0.95  # Avoid identical responses
    
    async def _calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        # Mock implementation - in reality would use embeddings
        common_words = set(text1.lower().split()) & set(text2.lower().split())
        total_words = len(set(text1.lower().split()) | set(text2.lower().split()))
        return len(common_words) / total_words if total_words > 0 else 0


# tests/ai_models/test_prompt_engineering.py
import pytest
from src.application.services.prompt_engineering import PromptEngineer
from src.domain.entities.user_preferences import UserPreferences

class TestPromptEngineering:
    """Tests for prompt engineering and template generation"""
    
    @pytest.fixture
    def prompt_engineer(self):
        return PromptEngineer()
    
    def test_technical_prompt_generation_junior(self, prompt_engineer):
        """Test prompt generation for junior developers"""
        user_prefs = UserPreferences(
            role='junior_developer',
            domain='backend',
            experience_level='beginner',
            preferred_language='spanish'
        )
        
        prompt = prompt_engineer.create_technical_prompt(
            query="¿Cómo funciona async/await?",
            user_preferences=user_prefs,
            context=""
        )
        
        assert 'principiante' in prompt.system_message.lower()
        assert 'ejemplo' in prompt.system_message.lower()
        assert len(prompt.few_shot_examples) >= 2
        assert prompt.temperature <= 0.7  # More deterministic for beginners
    
    def test_architectural_prompt_generation_senior(self, prompt_engineer):
        """Test prompt generation for senior architects"""
        user_prefs = UserPreferences(
            role='architect',
            domain='system_design',
            experience_level='expert',
            preferred_language='spanish'
        )
        
        prompt = prompt_engineer.create_architectural_prompt(
            query="Diseña una arquitectura de microservicios para e-commerce",
            user_preferences=user_prefs,
            context="Sistema de alta disponibilidad, 1M+ users"
        )
        
        assert 'arquitectura' in prompt.system_message.lower()
        assert 'escalabilidad' in prompt.system_message.lower()
        assert 'patrones' in prompt.system_message.lower()
        assert prompt.temperature >= 0.8  # More creative for architects
    
    def test_prompt_token_optimization(self, prompt_engineer):
        """Test prompt token optimization"""
        base_prompt = "Explica el concepto de microservicios " * 100  # Very long
        
        optimized_prompt = prompt_engineer.optimize_prompt_tokens(
            base_prompt,
            max_tokens=1000,
            preserve_key_concepts=True
        )
        
        # Should be shorter but preserve key concepts
        assert len(optimized_prompt) < len(base_prompt)
        assert 'microservicios' in optimized_prompt
    
    @pytest.mark.parametrize("role,domain,expected_style", [
        ('junior_developer', 'frontend', 'tutorial'),
        ('senior_developer', 'backend', 'technical'),
        ('architect', 'system_design', 'strategic'),
        ('pm', 'business', 'executive')
    ])
    def test_prompt_style_adaptation(self, prompt_engineer, role, domain, expected_style):
        """Test prompt style adaptation based on role and domain"""
        user_prefs = UserPreferences(role=role, domain=domain)
        
        prompt = prompt_engineer.create_contextualized_prompt(
            query="Implementar sistema de cache",
            user_preferences=user_prefs
        )
        
        assert expected_style in prompt.metadata['style']


# tests/ai_models/test_embedding_quality.py
import pytest
import numpy as np
from src.infrastructure.embeddings.embedding_service import EmbeddingService

class TestEmbeddingQuality:
    """Tests for embedding generation and quality"""
    
    @pytest.fixture
    def embedding_service(self):
        return EmbeddingService()
    
    @pytest.mark.asyncio
    async def test_embedding_semantic_similarity(self, embedding_service):
        """Test semantic similarity in embeddings"""
        # Related technical concepts
        text_pairs = [
            ("OAuth 2.0 authentication", "JWT token authentication"),
            ("React components", "Vue.js components"),
            ("PostgreSQL database", "MySQL database"),
            ("API REST", "RESTful services")
        ]
        
        for text1, text2 in text_pairs:
            embedding1 = await embedding_service.generate_embedding(text1)
            embedding2 = await embedding_service.generate_embedding(text2)
            
            similarity = embedding_service.cosine_similarity(embedding1, embedding2)
            
            # Related concepts should have high similarity (>0.7)
            assert similarity > 0.7, f"Low similarity ({similarity}) between '{text1}' and '{text2}'"
    
    @pytest.mark.asyncio
    async def test_embedding_domain_separation(self, embedding_service):
        """Test that different domains have lower similarity"""
        technical_text = "Implementar autenticación OAuth 2.0 con PKCE en FastAPI"
        business_text = "Estrategia de marketing digital para aumentar conversiones"
        
        tech_embedding = await embedding_service.generate_embedding(technical_text)
        business_embedding = await embedding_service.generate_embedding(business_text)
        
        similarity = embedding_service.cosine_similarity(tech_embedding, business_embedding)
        
        # Different domains should have low similarity (<0.5)
        assert similarity < 0.5
    
    def test_embedding_dimension_consistency(self, embedding_service):
        """Test embedding dimension consistency"""
        texts = [
            "Short text",
            "This is a much longer text with more content to test embedding consistency across different text lengths",
            "¿Cómo implementar autenticación en español?"
        ]
        
        embeddings = [embedding_service.generate_embedding(text) for text in texts]
        dimensions = [len(emb) for emb in embeddings]
        
        # All embeddings should have same dimension
        assert len(set(dimensions)) == 1
        assert dimensions[0] == 1536  # Expected OpenAI embedding dimension


# tests/ai_models/test_rag_pipeline.py
import pytest
from src.application.services.rag_service import RAGService
from src.infrastructure.vector.vector_store import VectorStore

class TestRAGPipeline:
    """Tests for RAG pipeline functionality"""
    
    @pytest.fixture
    def rag_service(self):
        return RAGService()
    
    @pytest.fixture
    def vector_store(self):
        return VectorStore()
    
    @pytest.mark.asyncio
    async def test_contextual_retrieval_accuracy(self, rag_service):
        """Test contextual retrieval accuracy"""
        # Setup test knowledge base
        documents = [
            {
                'title': 'OAuth 2.0 Implementation',
                'content': 'OAuth 2.0 es un protocolo de autorización que permite...',
                'domain': 'technical',
                'tags': ['authentication', 'security', 'oauth']
            },
            {
                'title': 'JWT Token Management',
                'content': 'JSON Web Tokens son un estándar para transmitir información...',
                'domain': 'technical', 
                'tags': ['jwt', 'authentication', 'tokens']
            },
            {
                'title': 'Business Security Policies',
                'content': 'Las políticas de seguridad empresarial incluyen...',
                'domain': 'business',
                'tags': ['security', 'policy', 'business']
            }
        ]
        
        # Index documents
        for doc in documents:
            await rag_service.index_document(doc)
        
        # Test retrieval accuracy
        query = "¿Cómo implementar autenticación OAuth?"
        results = await rag_service.retrieve_context(
            query=query,
            domain_filter=['technical'],
            top_k=2
        )
        
        assert len(results) == 2
        assert results[0]['title'] == 'OAuth 2.0 Implementation'
        assert results[0]['relevance_score'] > 0.8
        assert 'OAuth' in results[0]['content']
    
    @pytest.mark.asyncio
    async def test_late_chunking_context_preservation(self, rag_service):
        """Test late chunking maintains context"""
        long_document = {
            'title': 'Complete Authentication Guide',
            'content': '''
            Authentication is the process of verifying user identity. There are several approaches:
            
            1. Session-based Authentication:
            Traditional approach using server-side sessions and cookies.
            
            2. Token-based Authentication:
            Uses JWT or similar tokens for stateless authentication.
            
            3. OAuth 2.0 Implementation:
            OAuth 2.0 provides a framework for authorization. It works by:
            - Client registers with authorization server
            - User is redirected to authorization server
            - User grants permission
            - Authorization code is exchanged for access token
            
            Security considerations include using HTTPS, implementing PKCE, and token expiration.
            ''',
            'domain': 'technical'
        }
        
        await rag_service.index_document(long_document)
        
        # Query for specific section
        results = await rag_service.retrieve_with_late_chunking(
            query="OAuth 2.0 implementation steps",
            expansion_context=2  # Expand 2 chunks around match
        )
        
        assert len(results) > 0
        expanded_content = results[0]['expanded_content']
        
        # Should contain context from surrounding chunks
        assert 'authorization server' in expanded_content
        assert 'PKCE' in expanded_content
        assert len(expanded_content) > len(results[0]['original_chunk'])
    
    @pytest.mark.asyncio
    async def test_multi_domain_retrieval(self, rag_service):
        """Test multi-domain retrieval and ranking"""
        query = "authentication security implementation"
        
        results = await rag_service.retrieve_context(
            query=query,
            domain_filter=['technical', 'business'],
            cross_domain_ranking=True
        )
        
        # Should return results from both domains
        domains = set(result['domain'] for result in results)
        assert 'technical' in domains
        assert 'business' in domains
        
        # Technical results should rank higher for implementation query
        technical_results = [r for r in results if r['domain'] == 'technical']
        business_results = [r for r in results if r['domain'] == 'business']
        
        if technical_results and business_results:
            assert technical_results[0]['relevance_score'] >= business_results[0]['relevance_score']


# tests/ai_models/test_response_validation.py
import pytest
from src.application.services.response_validator import ResponseValidator

class TestResponseValidation:
    """Tests for AI response validation and safety"""
    
    @pytest.fixture
    def response_validator(self):
        return ResponseValidator()
    
    def test_hallucination_detection(self, response_validator):
        """Test hallucination detection in AI responses"""
        test_cases = [
            {
                'query': '¿Qué es FastAPI?',
                'response': 'FastAPI es un framework web moderno para Python...',
                'context': 'FastAPI documentation and examples...',
                'expected_hallucination': False
            },
            {
                'query': '¿Qué es FastAPI?', 
                'response': 'FastAPI was created by Microsoft in 2010 and runs on .NET...',
                'context': 'FastAPI documentation and examples...',
                'expected_hallucination': True
            }
        ]
        
        for case in test_cases:
            validation_result = response_validator.detect_hallucination(
                query=case['query'],
                response=case['response'],
                context=case['context']
            )
            
            assert validation_result.has_hallucination == case['expected_hallucination']
            if case['expected_hallucination']:
                assert len(validation_result.identified_issues) > 0
    
    def test_toxicity_and_bias_detection(self, response_validator):
        """Test toxicity and bias detection"""
        test_responses = [
            {
                'content': 'Para implementar autenticación, recomiendo usar OAuth 2.0...',
                'expected_toxic': False,
                'expected_biased': False
            },
            {
                'content': 'Los desarrolladores de cierto país son menos competentes...',
                'expected_toxic': False,
                'expected_biased': True
            }
        ]
        
        for response in test_responses:
            safety_result = response_validator.validate_safety(response['content'])
            
            assert safety_result.is_toxic == response['expected_toxic']
            assert safety_result.has_bias == response['expected_biased']
    
    def test_technical_accuracy_validation(self, response_validator):
        """Test technical accuracy validation"""
        accurate_response = """
        Para implementar OAuth 2.0 en FastAPI:
        1. Instalar python-multipart y python-jose
        2. Configurar OAuth2PasswordBearer
        3. Crear endpoint para token generation
        4. Implementar dependency para validar tokens
        """
        
        inaccurate_response = """
        Para implementar OAuth 2.0 en FastAPI:
        1. Usar cookies para almacenar passwords
        2. Enviar credentials en plain text
        3. No usar HTTPS en producción
        """
        
        accurate_result = response_validator.validate_technical_accuracy(
            response=accurate_response,
            domain='authentication'
        )
        
        inaccurate_result = response_validator.validate_technical_accuracy(
            response=inaccurate_response,
            domain='authentication'
        )
        
        assert accurate_result.accuracy_score > 0.8
        assert inaccurate_result.accuracy_score < 0.5
        assert len(inaccurate_result.security_issues) > 0


# tests/ai_models/test_cost_optimization.py
import pytest
from src.infrastructure.llm.cost_optimizer import CostOptimizer
from src.domain.value_objects.llm_usage import LLMUsage

class TestCostOptimization:
    """Tests for LLM cost optimization"""
    
    @pytest.fixture
    def cost_optimizer(self):
        return CostOptimizer()
    
    def test_model_selection_based_on_complexity(self, cost_optimizer):
        """Test intelligent model selection based on query complexity"""
        test_queries = [
            {
                'query': '¿Qué es Python?',
                'expected_model': 'claude-3-haiku',
                'complexity': 'simple'
            },
            {
                'query': 'Diseña una arquitectura de microservicios para un sistema de e-commerce con alta disponibilidad',
                'expected_model': 'claude-3-sonnet',
                'complexity': 'complex'
            }
        ]
        
        for case in test_queries:
            recommended_model = cost_optimizer.select_optimal_model(
                query=case['query'],
                user_preferences={'role': 'developer'},
                context_length=100
            )
            
            assert case['expected_model'] in recommended_model.model_id
            assert recommended_model.complexity_match == case['complexity']
    
    def test_token_usage_prediction(self, cost_optimizer):
        """Test token usage prediction for cost estimation"""
        query = "Explica el patrón Repository en Domain-Driven Design"
        context = "DDD patterns and implementation examples..."
        
        prediction = cost_optimizer.predict_token_usage(
            query=query,
            context=context,
            response_complexity='medium'
        )
        
        assert prediction.input_tokens > 0
        assert prediction.output_tokens > 0
        assert prediction.total_cost_usd > 0
        assert prediction.confidence > 0.7
    
    def test_cost_budget_optimization(self, cost_optimizer):
        """Test cost budget optimization"""
        daily_budget = 10.0  # $10 per day
        current_usage = LLMUsage(
            total_calls=100,
            total_tokens=50000,
            total_cost_usd=8.50
        )
        
        optimization = cost_optimizer.optimize_for_budget(
            remaining_budget=daily_budget - current_usage.total_cost_usd,
            expected_queries=20,
            average_complexity='medium'
        )
        
        assert optimization.recommended_model_tier in ['basic', 'standard', 'premium']
        assert optimization.max_tokens_per_query > 0
        assert optimization.estimated_remaining_calls > 0
    
    def test_cost_alerting_thresholds(self, cost_optimizer):
        """Test cost alerting and threshold management"""
        usage_scenarios = [
            {'daily_cost': 5.0, 'budget': 10.0, 'expected_alert_level': 'normal'},
            {'daily_cost': 8.0, 'budget': 10.0, 'expected_alert_level': 'warning'},
            {'daily_cost': 12.0, 'budget': 10.0, 'expected_alert_level': 'critical'}
        ]
        
        for scenario in usage_scenarios:
            alert = cost_optimizer.evaluate_cost_threshold(
                current_cost=scenario['daily_cost'],
                budget_limit=scenario['budget'],
                time_period='daily'
            )
            
            assert alert.level == scenario['expected_alert_level']
            if alert.level == 'critical':
                assert alert.recommended_actions is not None


# tests/ai_models/test_model_performance.py
import pytest
import time
from src.infrastructure.llm.performance_monitor import LLMPerformanceMonitor

class TestModelPerformance:
    """Tests for LLM model performance monitoring"""
    
    @pytest.fixture
    def performance_monitor(self):
        return LLMPerformanceMonitor()
    
    @pytest.mark.asyncio
    async def test_response_latency_requirements(self, performance_monitor):
        """Test LLM response latency meets requirements"""
        latency_requirements = {
            'simple_query': 3.0,  # 3 seconds max
            'medium_query': 8.0,  # 8 seconds max
            'complex_query': 15.0  # 15 seconds max
        }
        
        test_queries = [
            {'query': '¿Qué es REST?', 'type': 'simple_query'},
            {'query': '¿Cómo implementar autenticación OAuth 2.0?', 'type': 'medium_query'},
            {'query': 'Diseña una arquitectura completa para un sistema distribuido de e-commerce', 'type': 'complex_query'}
        ]
        
        for test_case in test_queries:
            start_time = time.time()
            
            # Mock LLM call with realistic delay
            await performance_monitor.measure_response_time(
                query=test_case['query'],
                model='claude-3-sonnet'
            )
            
            end_time = time.time()
            latency = end_time - start_time
            
            required_latency = latency_requirements[test_case['type']]
            assert latency <= required_latency, f"Query type {test_case['type']} exceeded latency requirement"
    
    def test_concurrent_request_handling(self, performance_monitor):
        """Test system performance under concurrent LLM requests"""
        import asyncio
        from concurrent.futures import ThreadPoolExecutor
        
        async def make_concurrent_requests(num_requests=10):
            tasks = []
            for i in range(num_requests):
                task = performance_monitor.measure_response_time(
                    query=f"Test query {i}",
                    model='claude-3-haiku'
                )
                tasks.append(task)
            
            results = await asyncio.gather(*tasks)
            return results
        
        # Run concurrent requests
        results = asyncio.run(make_concurrent_requests())
        
        # All requests should complete successfully
        assert len(results) == 10
        assert all(result['status'] == 'success' for result in results)
        
        # Average response time should remain reasonable
        avg_latency = sum(result['latency'] for result in results) / len(results)
        assert avg_latency < 5.0  # Should maintain performance under load
    
    def test_model_degradation_detection(self, performance_monitor):
        """Test detection of model performance degradation"""
        # Simulate performance history
        historical_performance = [
            {'timestamp': '2024-01-01', 'avg_latency': 2.1, 'success_rate': 0.98},
            {'timestamp': '2024-01-02', 'avg_latency': 2.3, 'success_rate': 0.97},
            {'timestamp': '2024-01-03', 'avg_latency': 4.2, 'success_rate': 0.85},  # Degradation
        ]
        
        degradation_alert = performance_monitor.detect_performance_degradation(
            historical_data=historical_performance,
            degradation_threshold=0.5,  # 50% increase in latency
            success_rate_threshold=0.90
        )
        
        assert degradation_alert.is_degraded == True
        assert 'latency' in degradation_alert.degraded_metrics
        assert 'success_rate' in degradation_alert.degraded_metrics
    
    @pytest.mark.asyncio
    async def test_failover_mechanism(self, performance_monitor):
        """Test failover to backup models when primary fails"""
        # Mock primary model failure
        primary_model = 'claude-3-sonnet'
        backup_models = ['claude-3-haiku', 'claude-2']
        
        failover_result = await performance_monitor.test_failover_mechanism(
            primary_model=primary_model,
            backup_models=backup_models,
            test_query="Test failover query"
        )
        
        assert failover_result.failover_triggered == True
        assert failover_result.successful_backup_model in backup_models
        assert failover_result.total_failover_time < 10.0  # Should failover quickly
```

---

## Testing Best Practices for AI Systems

### **1. Non-Deterministic Response Handling**
- Use semantic similarity scoring instead of exact string matching
- Implement fuzzy matching for technical concepts
- Create test cases with acceptable response variations

### **2. Cost Management in Testing**
- Mock expensive LLM calls in unit and integration tests
- Use lower-cost models for testing when possible
- Implement test budgets and spending alerts

### **3. Quality Assurance**
- Validate technical accuracy against known facts
- Test for hallucinations using context verification
- Implement bias and toxicity detection in responses

### **4. Performance Testing**
- Set realistic latency requirements for different query types
- Test concurrent request handling capabilities
- Monitor token usage and cost per request

### **5. RAG Pipeline Validation**
- Verify retrieval accuracy and relevance scoring
- Test late chunking context preservation
- Validate cross-domain search and ranking

---

## Continuous Integration for AI Systems

### Enhanced GitHub Actions Workflow

```yaml
# .github/workflows/ai-model-tests.yml
name: AI Model Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ai-model-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install AI testing dependencies
      run: |
        pip install pytest pytest-asyncio
        pip install sentence-transformers  # For semantic similarity
        pip install evaluate  # For response quality metrics
        
    - name: Run AI model unit tests
      run: |
        pytest tests/ai_models/ -v --tb=short
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_TEST_KEY }}
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_TEST_ACCESS_KEY }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_TEST_SECRET_KEY }}
    
    - name: Run LLM integration tests
      run: |
        pytest tests/integration/test_llm_integration.py -v
      env:
        LLM_TEST_BUDGET_LIMIT: "5.00"  # $5 test budget limit
    
    - name: Generate AI testing report
      run: |
        python scripts/generate_ai_test_report.py
        
    - name: Upload AI test results
      uses: actions/upload-artifact@v3
      with:
        name: ai-test-report
        path: reports/ai-testing-report.html
```

Esta estrategia de testing proporciona:

1. **✅ Testing Pyramid Completo**: 70% unit, 20% integration, 10% E2E para máxima cobertura y eficiencia
2. **✅ Automated Testing**: CI/CD pipeline con testing automático en cada commit
3. **✅ Performance Testing**: Load testing y stress testing para validar escalabilidad
4. **✅ Quality Gates**: Coverage thresholds y quality metrics obligatorios
5. **✅ Test Data Management**: Factories y fixtures para data consistency
6. **✅ Mock & Contract Testing**: External service mocking para testing aislado
7. **✅ E2E User Journeys**: Complete user workflow testing con Playwright
8. **✅ Database Testing**: Integration testing con PostgreSQL y vector search
9. **✅ AI Model Testing**: Specialized testing for LLM responses, embeddings, and RAG pipeline
10. **✅ Cost Optimization**: Budget management and intelligent model selection testing
11. **✅ Response Quality Validation**: Hallucination detection, technical accuracy, and bias testing
12. **✅ Performance Monitoring**: Latency requirements, concurrent handling, and degradation detection

El sistema garantiza **90%+ code coverage** con **automated quality gates**, **AI-specific validation**, y **performance monitoring** en cada deployment del sistema Nura AI.