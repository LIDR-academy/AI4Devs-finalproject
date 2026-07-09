# Project Guide for AI Assistants

## Project
Personal Training Management Platform — a gym class scheduling app with 3 roles (Admin, Coach, Coachee).

## Tech Stack
- **Backend:** Node.js 22 LTS + TypeScript + Express + Prisma + PostgreSQL
- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS v4 + React Router v6 + TanStack React Query v5
- **Testing:** Vitest + Supertest (unit/integration), Playwright (E2E)
- **Infra:** Docker Compose, Render (deployment)
- **Tooling:** Biome (lint/format)

## Architecture: Hexagonal (Ports & Adapters)
- `src/domain/` — Pure entities + domain services (zero external deps)
- `src/application/` — Use case orchestrators
- `src/infrastructure/` — Adapters (Prisma repos, Express controllers, auth, calendar, FCM)
- `src/config/` — DI container, env config

## Key Conventions
1. All files in PascalCase for components/entities, camelCase for utilities
2. Class duration is ALWAYS 60 minutes
3. Gym capacity: max 2 individual + 1 group simultaneous
4. Google Calendar event titles: class type + level only (no PII)
5. Error responses: `{ error: { code, message, ref } }` — no stack traces
6. All dependencies pinned to EXACT versions (no ranges)
7. No raw SQL — Prisma parameterized queries only
8. API under `/api/v1/` prefix

## Linear MCP
This project uses Linear for issue tracking. Issue IDs follow pattern COACHER-N.
