# Technical Context & Stack

## Technology Stack Overview

### 🎯 Core Technology Philosophy

**Python-First Strategy**: Unified development ecosystem
- Single language across frontend (Streamlit), backend (FastAPI), AI (DSPy)
- Reduced context switching and cognitive load
- Faster development cycles and easier team coordination
- Rich AI/ML ecosystem integration

**Hybrid Model Strategy**: Local + Commercial flexibility
- Primary: Opensource models for cost optimization
- Fallback: Commercial APIs for quality assurance
- Configurable: API keys OR local model server deployment

## Frontend Technology Evolution

### 📱 Phase 1: Streamlit MVP (Months 1-3)

**Technology**: `Streamlit 1.28.2`

**Advantages**:
- **10x Faster Development**: Functional interface in weeks vs months
- **Python Native**: Zero context switching from backend
- **AI-Ready Components**: Built-in chat, file upload, visualizations
- **Direct Integration**: Zero latency with Python backend

**Limitations & Migration Path**:
- Limited UI customization → React migration planned (Months 4-5)
- Mobile responsiveness → shadcn responsive components
- Advanced interactions → AI SDK streaming features

### 🚀 Phase 2: React Evolution (Months 4-5)

**Technology**: `React + shadcn + AI SDK`

**Migration Strategy**:
- Component reusability for future VS Code plugin
- Streaming responses for real-time AI interaction
- Multi-device responsive design
- Advanced UI patterns for multi-agent visualization

## Backend Stack

### 🔧 Core Framework

**Web Framework**: `FastAPI 0.104.1`
- Async native for high concurrency
- Automatic OpenAPI documentation
- Type hints integration with Pydantic
- High performance (comparable to NodeJS/Go)

**Database ORM**: `SQLAlchemy 2.0` with async support
- PostgreSQL optimized queries
- Vector extension compatibility
- Connection pooling and async operations
- Migration management with Alembic

**Database Driver**: `asyncpg`
- PostgreSQL native async driver
- Connection pooling optimization
- Vector operations support
- Performance optimized for embedding queries

### 📦 Complete Dependencies

```txt
# Web Framework & Server
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy[asyncio]==2.0.23
asyncpg==0.29.0
pydantic[email]==2.5.0

# AI/ML Core
dspy-ai==2.4.0
sentence-transformers==2.2.2
langgraph==0.0.25
langchain==0.1.0
langchain-community==0.1.0

# LLM Providers
openai==1.3.0
anthropic==0.7.7

# Local Model Serving
vllm==0.2.1
torch==2.1.0
transformers==4.35.0
bitsandbytes==0.41.3
accelerate==0.25.0

# Vector & Document Processing
pgvector==0.2.4
pypdf==3.17.4
faiss-cpu==1.7.4

# Background Tasks & Cache
celery[redis]==5.3.4
redis==5.0.1

# Security & Auth
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Monitoring & Quality
loguru==0.7.2
prometheus-client==0.19.0
pytest==7.4.3
ruff==0.1.6
mypy==1.7.1

# Streamlit Integration
streamlit==1.28.2
streamlit-extras==0.3.5
```

## AI/ML Technology Stack

### 🤖 Framework Architecture

**Primary Framework**: `DSPy 2.4+`
- Auto-optimization of prompts and reasoning chains
- Multi-model compatibility (local + commercial)
- Composable signatures for consistent AI operations
- Built-in evaluation and improvement loops

**Orchestration**: `LangGraph 0.0.25`
- Graph-based multi-agent workflows
- State management for complex interactions
- Production-ready scaling capabilities
- Event-driven agent coordination

**Ecosystem Integration**: `LangChain Community`
- Rich tool ecosystem for external integrations
- Memory management for conversation context
- Document processing and transformation utilities

### 🔍 Embedding Strategy

**Primary Model**: `BGE-M3` (BAAI/bge-m3)
- **Dimensions**: 1024 (fixed for consistency)
- **Deployment**: AWS SageMaker endpoint
- **Instance**: ml.g4dn.large with auto-scaling (0-5 instances)
- **Performance**: <100ms embedding generation target

**Critical Design Decision**: Unified model across all domains
```python
# ANTI-PATTERN: Different models per domain
# code_embeddings = CodeBERT.encode(code)  # 768 dimensions
# doc_embeddings = E5Large.encode(docs)    # 1024 dimensions
# → Incompatible vector spaces!

# CORRECT PATTERN: Unified BGE-M3
unified_embeddings = BGE_M3.encode([code, docs, business])  # 1024 dimensions
# → Single vector space, guaranteed consistency
```

**Fallback Strategy**: `OpenAI text-embedding-3-large`
- Used only for critical operations when BGE-M3 unavailable
- Higher cost but enterprise reliability
- Same semantic search interface

### 🧠 LLM Configuration

**Model Selection by Function**:

| Agent | Primary Model | Fallback | Use Case | Justification |
|-------|---------------|----------|----------|---------------|
| **Dev Agent** | CodeLlama-70B (AWS Bedrock) | GPT-4 Turbo | Code analysis | Code-specialized, AWS managed |
| **PM Agent** | Llama-3.1-70B (Bedrock) | Claude-3.5-Sonnet | Business context | Reasoning + business analysis |
| **Architect Agent** | Claude-3.5-Sonnet | Llama-3.1-70B | System design | Superior architectural thinking |

**Deployment Options**:
1. **Development**: API keys for rapid iteration
2. **Production**: Local model server + commercial fallback
3. **Enterprise**: AWS Bedrock managed models + optimization

**Local Model Server Configuration**:
```yaml
# docker-compose-models.yml
services:
  codellama-server:
    image: vllm/vllm-openai:v0.2.1
    command: ["--model", "CodeLlama/CodeLlama-70b-Instruct-hf", "--tensor-parallel-size", "4"]
    ports: ["8001:8001"]
    deploy:
      resources:
        reservations:
          devices: [{"driver": "nvidia", "count": "4", "capabilities": ["gpu"]}]

  llama-server:
    image: vllm/vllm-openai:v0.2.1
    command: ["--model", "meta-llama/Llama-3.1-70B-Instruct", "--tensor-parallel-size", "4"]
    ports: ["8002:8002"]
```

## Data Layer Architecture

### 🗄️ Vector Database: PostgreSQL + pgvector

**Database Configuration**:
```sql
-- Extension installation
CREATE EXTENSION IF NOT EXISTS vector;

-- Optimized table structure
CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL,  -- 'code', 'documentation', 'business'
    source_path TEXT,
    repository_id INTEGER,
    embedding vector(1024),  -- BGE-M3 dimensions
    metadata JSONB,
    embedding_model VARCHAR(50) DEFAULT 'bge-m3',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Optimized indexes
CREATE INDEX CONCURRENTLY knowledge_embedding_hnsw_idx ON knowledge_base 
USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE INDEX knowledge_content_type_idx ON knowledge_base (content_type);
CREATE INDEX knowledge_source_idx ON knowledge_base (source_path);
```

**Performance Optimizations**:
- **HNSW Index**: Hierarchical Navigable Small World for fast similarity search
- **Connection Pooling**: asyncpg with optimized pool size
- **Read Replicas**: Horizontal scaling for search operations
- **Materialized Views**: Pre-computed frequent queries

### 📊 Additional Data Stores

**Redis Cache**: `ElastiCache`
- Session management and user state
- Embedding cache for frequent queries
- Agent conversation context
- Rate limiting and API throttling

**Neo4j Community**: Knowledge graph relationships
- Code dependency mapping
- Business process relationships
- Cross-reference graphs between systems
- Architectural dependency visualization

## Infrastructure & Deployment

### ☁️ AWS Managed Services

**Container Orchestration**: `AWS EKS`
- Managed Kubernetes with auto-scaling
- Application Load Balancer integration
- Service mesh capabilities
- Rolling deployments with zero downtime

**Database Services**:
- **RDS PostgreSQL**: Primary database with pgvector
- **ElastiCache Redis**: Caching and session storage
- **OpenSearch**: Full-text search complement to vector search

**AI Services**:
- **AWS Bedrock**: Managed LLM serving (CodeLlama, Llama-3.1)
- **SageMaker**: BGE-M3 embedding model deployment
- **SageMaker Endpoints**: Auto-scaling model inference

### 🐳 Containerization Strategy

**Development Environment**:
```yaml
# docker-compose.yml
services:
  nura-backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/nura
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
    ports: ["8000:8000"]

  nura-frontend:
    build: ./frontend
    environment:
      - BACKEND_URL=http://nura-backend:8000
    ports: ["8501:8501"]
    
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      - POSTGRES_DB=nura
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

**Production Deployment**: Kubernetes manifests + Terraform IaC

### 🔧 Development Setup

**Local Development Requirements**:
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL with pgvector extension
- Redis for caching
- Git with LFS for model storage

**Development Workflow**:
1. **Environment Setup**: `make setup` (virtual environment + dependencies)
2. **Database Migration**: `alembic upgrade head`
3. **Service Start**: `docker-compose up -d`
4. **Development Server**: `uvicorn main:app --reload`
5. **Frontend**: `streamlit run app.py`

**Code Quality Pipeline**:
- **Linting**: `ruff check` (all-in-one linter)
- **Type Checking**: `mypy` (gradual typing)
- **Testing**: `pytest` with async support
- **Formatting**: `ruff format` (Black-compatible)

## Performance & Monitoring

### 📊 Observability Stack

**Application Monitoring**: `Prometheus + CloudWatch`
- Custom metrics for AI operations
- Vector search performance tracking
- Agent response time monitoring
- Cost tracking per operation

**AI-Specific Monitoring**: `LangSmith Integration`
- LLM call tracing and debugging
- Prompt performance optimization
- Agent interaction analytics
- Cost optimization insights

**Logging Strategy**: `Loguru` structured logging
- Async logging for performance
- JSON structured logs for analysis
- Distributed tracing correlation
- PII sanitization for compliance

### ⚡ Performance Targets

**Response Time SLAs**:
- Vector search: <100ms
- Simple queries: <2s
- Complex analysis: <5s
- Streaming responses: <200ms first token

**Scalability Targets**:
- 50+ concurrent users (MVP)
- 1000+ concurrent users (Production)
- 10+ tenants with data isolation
- 99.5% uptime with managed services

**Cost Optimization**:
- AWS Spot instances for development (70% savings)
- SageMaker auto-scaling (scale to zero)
- Bedrock optimized model selection
- Operational target: <$670/month

This technical foundation provides the robust, scalable, and cost-effective platform needed for Nura's success from MVP through enterprise deployment.
