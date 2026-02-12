# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sagrada Família Parts Manager (SF-PM)** — An enterprise system that transforms static CAD files (Rhino .3dm) into an active digital twin for managing inventory of unique architectural pieces from Barcelona's Sagrada Familia. Features AI-powered validation via a LangGraph agent ("The Librarian"), 3D browser visualization (Three.js), and presigned-URL file uploads through Supabase Storage.

## Build & Run Commands

All development runs through Docker. The Makefile wraps `docker compose` commands:

```bash
# Setup
cp .env.example .env              # Then fill in SUPABASE_URL, SUPABASE_KEY, SUPABASE_DATABASE_URL
make build                        # Build Docker images
make up                           # Start database (postgres:15)
make init-db                      # Initialize Supabase buckets & policies
make setup-events                 # Create events table (T-004-BACK)

# Frontend (React/Vite on :5173)
make front-dev                    # Start dev server
make front-install                # npm install in container
make front-shell                  # Shell into frontend container

# Backend (FastAPI on :8000)
make shell                        # Shell into backend container
make up-all                       # Start all services (db + backend + frontend)

# Teardown
make down                         # Stop services (keep volumes)
make clean                        # Stop + remove volumes + prune
```

## Testing

```bash
# Backend (pytest)
make test                         # All backend tests
make test-unit                    # Unit tests only (tests/unit/)
make test-infra                   # Integration tests only (tests/integration/)
make test-storage                 # Storage-specific integration test

# Frontend (Vitest)
make test-front                   # Run once
# Inside container: npm run test:watch for watch mode
```

To run a single backend test file:
```bash
docker compose run --rm backend pytest tests/integration/test_storage_config.py -v
```

To run a single frontend test:
```bash
docker compose run --rm frontend bash -c "npm install && npx vitest run src/components/FileUploader.test.tsx"
```

## Architecture

**Monorepo** with four modules under `src/`:

- **`src/backend/`** — Python 3.11, FastAPI. Entry point: `main.py`. Routes in `api/`, business logic in `services/`, Pydantic schemas in `schemas.py`, centralized constants in `constants.py`, settings via pydantic-settings in `config.py`. Supabase client singleton in `infra/supabase_client.py`.
- **`src/frontend/`** — React 18, TypeScript (strict), Vite. Components in `src/components/` with co-located `.constants.ts` files, API service layer in `src/services/`, shared types in `src/types/`.
- **`src/agent/`** — LangGraph AI agent (planned, not yet implemented).
- **`src/shared/`** — Shared utilities (planned).

**Key patterns:**
- **Presigned URL uploads**: Backend generates Supabase Storage presigned URLs → frontend uploads directly to storage, bypassing the backend for file data.
- **Contract-first**: Backend Pydantic models (`schemas.py`) define the API contract. Frontend TypeScript interfaces in `src/types/` must match exactly (e.g., `file_id`, `filename` fields).
- **Service layer separation**: Frontend API calls isolated in `src/services/upload.service.ts`, not in components.

**Infrastructure:**
- Docker Compose runs three services: `backend` (python:3.11-slim), `db` (postgres:15-alpine), `frontend` (node:20-bookworm).
- Frontend uses `node:20-bookworm` (NOT Alpine) because Alpine causes jsdom memory errors in tests.
- Vite dev server proxies `/api` requests to the backend at `:8000`.

## Memory Bank System

This project uses a **Memory Bank** (`memory-bank/`) for multi-agent coordination.

### On session start (read 2 files):
1. `memory-bank/activeContext.md` — Current ticket and next steps (~40 lines)
2. `memory-bank/techContext.md` — Stack and tooling (~80 lines)

### On ticket completion (update 2 files):
1. `memory-bank/activeContext.md` — Move ticket to "Recently Completed", update "Active Ticket"
2. `memory-bank/progress.md` — Add 1-2 line entry in current sprint section

### On architecture change (update additionally):
- `memory-bank/systemPatterns.md` — New patterns or structural changes
- `memory-bank/decisions.md` — Record ADR for significant decisions

### Reference files (read only when relevant):
- `memory-bank/productContext.md` — Product identity, personas, constraints
- `memory-bank/decisions.md` — Historical architectural decisions
- `docs/09-mvp-backlog.md` — Full ticket specs and acceptance criteria

### DO NOT:
- Duplicate ticket details from backlog into activeContext
- Copy test counts or migration filenames into multiple files
- Update `docs/00-index.md` on every ticket (only on US completion)
- Update US README files with narrative content (keep as TOCs)
- Work on more than one ticket at a time (Single Ticket Mode)

## Agent Rules (AGENTS.md)

- Register complex prompts in `prompts.md` at the repo root.
- Present a plan and get user approval before writing code.
- On task completion, update memory-bank files per the protocol above.
- Do not invent commands not listed in `techContext.md` or modify architecture without updating `systemPatterns.md`.

## Environment Variables

Required in `.env` (see `.env.example`):
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_KEY` — Supabase service role key
- `SUPABASE_DATABASE_URL` — Direct PostgreSQL connection to Supabase (used by `setup-events`)
- `DATABASE_URL` — Overridden in Docker to `postgresql://user:password@db:5432/sfpm_db`

## Documentation

Comprehensive docs in `docs/` covering strategy, PRD, data model (8 PostgreSQL tables with RLS), C4 architecture, LangGraph agent design, and sprint roadmap. Index at `docs/00-index.md`.
