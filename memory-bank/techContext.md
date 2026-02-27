# Tech Context

## Development Environment
- **IDE**: VS Code
- **AI Assistant**: Claude Code (claude-sonnet-4-6)
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
- **trimesh** 4.0.5 - Mesh decimation (`simplify_quadric_decimation`) for low-poly GLB generation (T-0502-AGENT)
- **open3d** 0.18.0 - Backend engine for trimesh decimation algorithm (required dependency)
- **numpy** <2.0 - Pinned to 1.x for trimesh 4.0.5 compatibility (`ptp()` removed in numpy 2.0)
- **rtree** 1.1.0 - Spatial index for trimesh (required dependency)

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

## Security Stack
*Last Audit: 2026-02-20 (OWASP Top 10 Full Assessment)*

### Authentication & Authorization
- **Framework**: Supabase Auth (OAuth 2.0, JWT)
- **RLS Policies**: Row-Level Security enforced at database layer (workshop-level isolation)
- **Session Management**: Short-lived tokens (1h), refresh token rotation

### API Security
- **Input Validation**: Pydantic schemas + custom validators (UUID format, enum checks)
- **SQL Injection Protection**: psycopg2 parameterized queries (100% coverage - 2026-02-20 audit ✅)
- **Rate Limiting**: slowapi (10 req/min per IP on presigned URL generation)
- **CORS**: Strict whitelist (`localhost:5173`, `localhost:3000`), no wildcards with credentials

### Transport Security
- **TLS**: Required on all Supabase connections (`sslmode=require` in DATABASE_URL)
- **HSTS**: Enabled in production (max-age=31536000)
- **Headers**: CSP, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection configured
- **Content Security Policy (CSP)**: Three.js-compatible directives with media-src restrictions

### File Upload Security
- **Extension Validation**: `.3dm` only (ALLOWED_EXTENSION constant)
- **Content Validation**: Magic bytes verification (Rhino 3DM signatures) - Added 2026-02-20
- **Size Limits**: 500MB hard limit (HEAD request before download)
- **Malware Scanning**: ClamAV integration (optional, production recommended)
- **UUID-Based IDs**: Server-generated, prevents path traversal attacks

### Container Security
- **Base Images**: Pinned versions (python:3.11.14-slim, node:20-bookworm)
- **Non-Root Users**: All containers run as non-root (USER node/nonroot)
- **Resource Limits**: Memory caps (backend: 4GB, frontend: 512MB, redis: 256MB)
- **Vulnerability Scanning**: Trivy on every Docker build (CI/CD pipeline)

### Dependency Management
- **CVE Monitoring**: Dependabot weekly scans
- **Pinned Versions**: All dependencies locked in requirements.txt/package-lock.json
- **Audit Frequency**: npm audit + pip-audit on CI/CD pipeline (as of 2026-02-20)
- **Known Vulnerabilities**: esbuild GHSA-67mh-4wv8-2f99 (moderate, dev-only) - tracked for upgrade

### Logging & Monitoring
- **Structured Logs**: structlog with sanitized URLs (no tokens in logs)
- **Secret Detection**: git-secrets pre-commit hooks
- **Audit Trail**: All writes logged with user context
- **Error Handling**: Generic messages to users, detailed stack traces in logs only

### Credentials Management
- **Setup Script**: `setup-env.sh` generates cryptographically secure passwords (openssl rand -base64 32)
- **Environment Variables**: All credentials externalized (${DATABASE_PASSWORD}, ${REDIS_PASSWORD}, ${SUPABASE_KEY})
- **Git Ignore**: `.env` never committed, `.env.example` provides template
- **Historical P0 Fixes**: 2026-02-18 audit eliminated hardcoded credentials (DATABASE_PASSWORD, REDIS_PASSWORD)

### Compliance Status
- **OWASP A03 (Injection)**: ✅ MITIGATED (100% parameterized queries)
- **OWASP A07 (XSS)**: ✅ MITIGATED (0 dangerouslySetInnerHTML usage, React auto-escaping)
- **OWASP A05 (Misconfiguration)**: 🟡 PARTIAL (CSP added, CORS tightened, DELETE method needs review)
- **OWASP A06 (Vulnerable Components)**: 🟡 PARTIAL (4 moderate frontend CVEs tracked, backend audit complete)
- **OWASP A01 (Broken Access Control)**: 🟢 VALIDATED (RLS policies active, UUID validation enforced)

### Incident Response
- **Security Contacts**: security@sf-pm.example.com
- **Responsible Disclosure**: `/.well-known/security.txt` (as of 2026-02-20)
- **Escalation Path**: DevOps (24h) → CTO (12h) → CISO (immediate for data breach)
