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

## Frontend Stack
### Core Framework
- **React** 18 - UI library
- **TypeScript** (strict mode) - Type-safe JavaScript
- **Vite** - Build tool and dev server

### UI Components & File Handling
- **react-dropzone** 14.2.3 - Drag & drop file upload with validation (T-001-FRONT)

### Testing
- **Vitest** 1.6.1 - Unit and integration testing (Vite-native)
- **@testing-library/react** 14.1.2 - Component testing utilities
- **jsdom** - DOM environment for Node.js tests
  - **Limitation**: DataTransfer API incomplete, no drag & drop event simulation
  - **Workaround**: Tests focus on DOM structure, not interaction (see T-001-FRONT)

### Planned (Not Yet Implemented)
- **Zustand** - Global state management
- **Three.js** - 3D visualization for .3dm files
- **TanStack Query** - Server state management

## Infrastructure
### Containerization
- **Docker** - Containerization platform
- **Docker Compose** v2 - Multi-container orchestration (no `version` key)

### Container Images
- **Backend**: `python:3.11-slim` (multi-stage: base/dev/prod)
- **Frontend**: `node:20-bookworm` (multi-stage: dev/build/prod-nginx)
- **Database**: `postgres:15-alpine` (local development only)

### Build Tools
- **GNU Make** - Task automation (Makefile for common commands)
- **Multi-stage Dockerfiles** - Optimized production builds

## Architecture Patterns
### Backend
- **Clean Architecture** - 3-layer separation (API → Service → Constants)
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
