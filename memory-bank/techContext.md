# Tech Context

## Development Environment
- **IDE**: VS Code / Google Antigravity
- **AI Assistant**: GitHub Copilot (Claude Sonnet 4.5)
- **Documentation Format**: Markdown
- **Version Control**: Git

## Backend Stack
### Core Framework
- **FastAPI** 0.109.2 - Web framework for building APIs
- **Uvicorn** 0.27.1 - ASGI server with hot-reload support
- **Pydantic** 2.6.1 - Data validation using Python type annotations

### Database & Storage
- **Supabase** 2.10.0 - Backend-as-a-Service (PostgreSQL + Storage + Auth)
- **psycopg2-binary** 2.9.9 - PostgreSQL adapter for Python (direct DB access)
- **PostgreSQL** 15 - Relational database (hosted on Supabase)

### Utilities
- **python-dotenv** 1.0.1 - Environment variable management

### Testing
- **pytest** 8.0.0 - Testing framework
- **pytest-asyncio** 0.23.5 - Async test support
- **httpx** 0.27.2 - HTTP client for testing API endpoints

## Agent Stack (Implemented - T-022-INFRA ✅)
### Task Queue & Orchestration
- **Celery** 5.3.4 - Distributed task queue system
  - Configuration: JSON serialization (security), task timeouts (600s hard, 540s soft)
  - Worker: Prefetch multiplier = 1 (isolate large file processing)
  - Result expiration: 1 hour (auto-cleanup)
- **Redis** 5.0.1 (Python client) - Message broker client library
- **Redis Server** 7-alpine - In-memory data store (message broker + result backend)
  - AOF persistence enabled
  - Port: 127.0.0.1:6379 (localhost only, security)
  - Docker health checks configured

### Configuration & Utilities
- **Pydantic** 2.6.1 - Config validation (mirrors backend)
- **pydantic-settings** 2.1.0 - Environment-based settings
- **structlog** 24.1.0 - Structured JSON logging

### Architecture Patterns
- **Constants Module** (`src/agent/constants.py`) - Centralized configuration values
  - Task timeouts, retry policies, task names
  - Following Clean Architecture pattern (separation from env-based config)
- **Conditional Imports** - Support both worker execution and module imports in tests

### File Processing
- **rhino3dm** 8.4.0 - Rhino .3dm file parsing and geometry validation (T-024/T-025/T-026/T-027)

### Future Dependencies (Not Yet Implemented)
- **flower** 2.0.1 - Celery monitoring UI (T-033-INFRA, optional)

## Frontend Stack
### Core Framework
- **React** 18 - UI library
- **TypeScript** (strict mode) - Type-safe JavaScript
- **Vite** - Build tool and dev server

### Real-Time Communication
- **@supabase/supabase-js** 2.39.0+ - Supabase client for Realtime subscriptions (T-031-FRONT)

### UI Components & File Handling
- **react-dropzone** 14.2.3 - Drag & drop file upload with validation (T-001-FRONT)

### Testing
- **Vitest** 1.6.1 - Unit and integration testing (Vite-native)
- **@testing-library/react** 14.1.2 - Component testing utilities
- **jsdom** - DOM environment for Node.js tests
  - **Limitation**: DataTransfer API incomplete, no drag & drop event simulation
  - **Workaround**: Tests focus on DOM structure, not interaction (see T-001-FRONT)

### 3D Visualization (NEW — T-0500-INFRA)
- **@react-three/fiber** ^8.15.0 - React renderer for Three.js
- **@react-three/drei** ^9.92.0 - Three.js helpers (useGLTF, OrbitControls, Html, etc.)
- **three** ^0.160.0 - 3D graphics engine (bundled as `three-vendor` chunk ~600KB)
- **zustand** ^4.4.7 - Lightweight global state management (parts store, filters)
- **@types/three** ^0.160.0 (devDep) - TypeScript types for Three.js
- **jsdom mock strategy**: `vi.mock('@react-three/fiber')` + `vi.mock('@react-three/drei')` in setup.ts replaces WebGL with testable DOM elements (see systemPatterns.md)

### Planned (Not Yet Implemented)
- **TanStack Query** - Server state management

## Infrastructure
### Containerization
- **Docker** - Containerization platform
- **Docker Compose** v2 - Multi-container orchestration (no `version` key)

### Container Images
- **Backend**: `python:3.11-slim` (multi-stage: base/dev/prod)
- **Frontend**: `node:20-bookworm` (multi-stage: dev/build/prod-nginx)
- **Database**: `postgres:15-alpine` (local development only)
- **Agent Worker**: `python:3.11-slim` (multi-stage: base/dev/prod) - NEW (T-022-INFRA)
- **Redis**: `redis:7-alpine` (message broker + result backend) - NEW (T-022-INFRA)

### Build Tools
- **GNU Make** - Task automation (Makefile for common commands)
- **Multi-stage Dockerfiles** - Optimized production builds

## Architecture Patterns
### Backend
- **Clean Architecture** - 3-layer separation (API → Service → Constants)

### Agent (NEW - T-022-INFRA)
- **Asynchronous Task Processing** - Celery workers for background jobs
- **Retry Policies** - Automatic task retries with exponential backoff
- **Task Isolation** - Prefetch multiplier = 1 (one task per worker at a time)
- **Structured Logging** - JSON logs via structlog for observability
- **Security-First Serialization** - JSON only (no pickle) to prevent code injection
- **12-Factor Apps** - Environment-agnostic configuration
- **Contract-First Development** - Pydantic schemas as source of truth

### Frontend
- **Component-Driven Design** - Atomic design pattern
- **Service Layer Pattern** - API calls abstracted from components
- **Type Safety** - Strict TypeScript + Pydantic schema alignment
- **Constants Extraction** - Configuration, styles, and messages separated from components (T-001-FRONT)
  - Pattern: `Component.tsx` + `Component.constants.ts` + `Component.test.tsx`
  - Benefits: DRY, Single Source of Truth, improved testability

## Development Tools
- **Standard shell commands** - bash/zsh for automation
- **Environment management** - `.env` files with `.env.example` templates
- **Dependency locking** - `requirements-lock.txt` for reproducible builds

## CI/CD Pipeline
### GitHub Actions
- **Workflow File**: `.github/workflows/ci.yml`
- **Triggers**: Push to `main` or `feature-*` branches; PRs to `main`
- **Jobs**:
  1. **backend-tests** - Runs all backend tests (unit + integration)
     - Services: `db`, `redis`, `agent-worker` (added in T-022-INFRA fix)
     - Healthchecks: PostgreSQL, Redis, Celery worker
     - Test command: `make test`
  2. **frontend-tests** - Runs Vitest tests
  3. **docker-validation** - Validates docker-compose config and builds prod images
  4. **lint-and-format** - Ruff (Python) + ESLint (TypeScript), non-blocking
  5. **security-scan** - Trivy vulnerability scanner (CRITICAL/HIGH), non-blocking

### Environment Variables in CI
- **Secrets**: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_DATABASE_URL` (GitHub Secrets)
- **Required for T-022-INFRA**: `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`
- **Created dynamically**: `.env` file generated in each job

### Service Dependencies
- Integration tests require **ALL infrastructure services** running:
  - Database (PostgreSQL)
  - Redis (message broker)
  - Celery worker (task executor)
- **Critical**: CI must replicate local docker-compose environment for test parity
