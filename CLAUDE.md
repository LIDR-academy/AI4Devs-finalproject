# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BPMN Modeler — a web application for BPMN diagram modeling with AI-powered generation, versioning, collaboration, and code generation. Deployed at sdd-ia.com.

Stack: **FastAPI (Python 3.11)** + **React 19 (CRA+CRACO)** + **MongoDB (Motor)** + **Redis (optional cache)** + **Multiple LLM providers** + **Nginx/Supervisor** on Ubuntu VPS.

## Commands

### Backend (Python/FastAPI)
```bash
# Activate venv first
source backend/.venv/bin/activate

# Run server (dev)
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Run all tests
cd backend && pytest -v

# Run a single test file
cd backend && pytest tests/test_bpmn_api.py -v

# Run a single test
cd backend && pytest tests/test_bpmn_api.py::test_name -v

# Lint
cd backend && flake8 .
cd backend && mypy .

# Install deps
pip install -r backend/requirements.txt
```

### Frontend (React/CRACO)
```bash
cd frontend

# Dev server (port 3000)
yarn start

# Production build
yarn build

# Tests
yarn test
```

### Deployment
```bash
# On the server, from /opt/bpmn-modeler:
sudo ./update.sh          # updates from dev branch
sudo ./update.sh main     # updates from main branch
```

## Project Structure

### Backend (`backend/`)

- **`server.py`** — Main FastAPI app. Mounts all routers under `/api`, sets up CORS, security headers, MongoDB indexes on startup, seeds demo data, and runs a WebSocket endpoint (`/api/ws/diagram/{id}`) for real-time collaboration.
- **`database.py`** — MongoDB connection via `motor` (async). Exports `db` (database handle) and `client`. Logging configured here.
- **`models.py`** — Pydantic models for all entities: User, BpmnDiagram, BpmnVersion, OOPClass, Branch, Comment, Notification, Favorite, BpmnComponent, GitRepository, Project, ProjectFileNode, AI requests.
- **`limits.py`** — Free-tier plan limits (max diagrams, AI calls, OOP classes, etc.) and checking utilities.
- **`cache.py`** — TTL cache: Redis when available, in-memory dict fallback. Used for LLM results, LLM circuit-breaker state and low-cardinality reads.
- **`email_service.py`** — Transactional email via Resend. Fire-and-forget (errors logged, never thrown).
- **`templates.py`** — Predefined project templates (purchase order, employee onboarding, etc.) with full BPMN XML.

#### LLM Gateway (`backend/llm_gateway/`)

Multi-provider LLM gateway (OmniRoute-style) — all LLM calls funnel through it:

- **`metering.py`** — `run_metered()` wraps every provider call: captures token usage, latency and cost into the `llm_usage` collection (never breaks the call). `run_metered_cached()` adds a response cache for idempotent requests (hits metered as `status="cache_hit"`, zero cost).
- **`router.py`** — `call_pinned()` (explicit provider; resolves aliases `auto`/`cheap`/`fast`) and `call_with_fallback()` (ordered chain, skips unconfigured/disabled/circuit-broken providers, falls through only on retryable errors: 429/5xx/timeout). Default chain comes from Mongo `priority` ordering, static `TASK_ROUTES` as fallback.
- **`health.py`** — Per-provider circuit breaker: 3 consecutive failures → 60s cooldown. State in `cache.py` (Redis-shared across instances).
- **`registry.py`** — Provider registry; `routers/ai.py` registers its 5 providers (deepseek, minimax, mimo, opencode, opencode-go) at import time.
- **`config_store.py`** — Provider configs in Mongo `llm_providers` (30s cached reads). Seeded from env on first startup (`LLM_PROVIDER_SEEDS` in `ai.py`); afterwards Mongo overrides env (api_key, base_url, default_model, enabled, priority, pricing).
- **`crypto.py`** — Fernet encryption for API keys at rest. Key derived from `LLM_KEYS_SECRET` (fallback `SESSION_SECRET`). Keys never leave the backend (masked `••••last4`).
- **`pricing.py`** — Static USD/1M-token price table used for cost estimation.
- **`context.py`** — contextvars (`user_id`, `endpoint`) propagated from middleware + auth helpers into metering, including background tasks.

Key env var: **`LLM_KEYS_SECRET`** — set in supervisor conf on the VPS (outside git); required to encrypt provider keys in the seed.

#### Routers (`backend/routers/`)
30+ route modules, each a FastAPI `APIRouter`:
- **`auth.py`** — JWT auth (login, register, session management)
- **`google_auth.py`** / **`saml_auth.py`** — Social/SSO auth
- **`diagrams.py`** — CRUD for BPMN diagrams, versions, branches, comments, favorites
- **`projects.py`** — Full project CRUD, team membership, GitHub sync, RLS filtering
- **`ai.py`** — AI chat, BPMN generation, code analysis
- **`ai_generator.py`** / **`ai_codegen.py`** — Prompt-based BPMN generation and code generation from diagrams
- **`llm_admin.py`** — LLM gateway admin (`/admin/llm`: provider CRUD with encrypted keys, connection test, usage stats, breaker health) + public `/llm/models` catalog for frontend selectors
- **`admin.py`** / **`admin_billing.py`** — Admin panels
- **`payments.py`** — Stripe integration
- **`git.py`** — GitHub repo sync for diagrams
- **`specs.py`** — Specification/requirements management with version diff
- **`project_tree.py`** — Phase-based project tree (phases A-E: analysis, design, implementation)
- **`project_files.py`** — User-managed file/folder tree within projects
- **`components.py`** / **`oop_classes.py`** — Reusable BPMN components and OOP class definitions
- **`tools.py`** — Various utilities endpoint
- **`custom_schemas.py`** — Custom JSON schemas management
- **`issues.py`** / **`audit.py`** — Issue tracking and audit log
- **`announcements.py`** / **`news.py`** — Announcement banners and news posts
- **`landing_events.py`** — Landing page analytics events
- **`shares.py`** — Resource sharing between users
- **`i18n.py`** — Translation management
- **`scheduled_tasks.py`** — Cron-like background tasks
- **`social.py`** — Notifications

#### Tests (`backend/tests/`)
Pytest test files covering API endpoints, AI codegen, free user limits, BPMN sanitizer, project tree, etc.

### Frontend (`frontend/`)

React 19 SPA with CRACO (Create React App Configuration Override), Tailwind CSS, shadcn/ui-style components.

- **`src/App.js`** — Root component. BrowserRouter with all routes, AuthContext provider, I18nProvider, UpgradeModalProvider. Exports `API` constant (points to backend) and `AuthContext`.
- **`src/index.js`** — Entry point.

#### Pages (`frontend/src/pages/`)
- **`BpmnEditorPage.jsx`** (~96KB) — The main BPMN editor. Uses bpmn-js, properties panel, collaboration, version management.
- **`LandingPage.jsx`** (~58KB) — Public marketing/landing page (Spanish, brutalism design).
- **`ProjectDetailPage.jsx`** (~107KB) — Project detail with diagrams, specs, team, settings.
- **`ProjectsPage.jsx`** / **`Dashboard.jsx`** — Project listing and dashboard.
- **`CodeGenPage.jsx`** — Code generation from diagrams.
- **`OOPClassesManager.jsx`** — OOP class definitions editor.
- **`LoginPage.jsx`** / **`PricingPage.jsx`** — Auth and pricing.
- **`Admin*.jsx`** — Admin panels (users, billing, announcements, SSO, audit, etc.). Includes **`AdminLlmProvidersPage.jsx`** (`/admin/llm`) — LLM gateway: provider CRUD/on-off/priority, connection test, usage & cost dashboard, circuit-breaker health.
- **`SpecDetailPage.jsx`** / **`SpecsListPage.jsx`** — Specification management with version diff.
- **`CustomSchemasPage.jsx`** — Custom JSON schema builder.
- **`TranslationsPage.jsx`** — i18n translations editor.

#### Components
- **`components/ui/`** — Shadcn/ui-style Radix components (button, dialog, form, etc.) plus editor panels (PropertiesTab, CommentsTab, etc.).
- **`components/editor-panels/`** — BPMN editor side panels (AIGeneratorDialog, BranchManagementDialog, CommentsTab, ComponentsTab, etc.).

#### Hooks & Contexts
- **`hooks/`** — useCollaboration (WebSocket), useEditorNotifications, useEditorShortcuts, useElementIO, useLimits, useVersionDiff, useToast, **useLlmModels** (dynamic provider catalog from `/llm/models` with static fallback; used by model selectors).
- **`contexts/`** — I18nContext (Spanish/English), UpgradeModalContext.

#### Utilities (`frontend/src/lib/`)
- **`utils.js`** — Tailwind class merging utility (cn).
- **`landingTracker.js`** — Landing page analytics.
- **`downloadFile.js`** — File download helper.

## Key Architecture Decisions

1. **MongoDB is source of truth** — Redis is optional L2 cache. Never write critical data to cache.
2. **Free-tier limits** — Enforced server-side in `limits.py`, checked before writes.
3. **Multi-instance safe** — Redis cache + stateless JWT auth. Under Redis, cache invalidation works across instances.
4. **Real-time collaboration** — WebSocket endpoint in server.py for cursor presence, element locking, XML sync.
5. **Git-like versioning** — Diagrams have version history with branching, merging, diffing.
6. **RLS filtering** — Most queries filter by `created_by` for multi-tenant data isolation. Resource sharing via `shares` router.
7. **Multiple LLM providers via own gateway** — `backend/llm_gateway/` (not litellm, which is installed but unused): unified metering (`llm_usage`), priority-ordered fallback, per-provider circuit breaker, Mongo-backed provider configs (`llm_providers`, admin-editable at `/admin/llm`) with Fernet-encrypted keys. Providers: DeepSeek, MiniMax, MiMo, OpenCode Zen/Go. Aliases `auto`/`cheap`/`fast` resolvable in `call_pinned`.
8. **Brutalist design** — `design_guidelines.json` defines the visual style: sharp corners, solid shadows, Chivo/Work Sans/IBM Plex Mono fonts, Spanish UI.
9. **Admin emails** — Declared via `ADMIN_EMAILS` env var; enforced on startup.
10. **Security headers** — CSP, HSTS, X-Frame-Options, etc. set via middleware in server.py.
