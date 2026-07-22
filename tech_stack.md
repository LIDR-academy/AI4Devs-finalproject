# Tech Stack

## Stack Decision

The MVP uses a strict fullstack TypeScript baseline:

- frontend: React + TypeScript
- backend: Node.js + TypeScript
- database: PostgreSQL

This keeps delivery simple, consistent, and fast.

---

## Frontend

| Technology | Purpose |
|---|---|
| React | UI components and step-by-step workflow |
| TypeScript | Type safety in forms, state, and API contracts |
| Vite | Fast local development and build |

Frontend rules:

- functional components only
- stable test IDs for automation readiness
- explicit loading, error, and empty states

---

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime for API and estimation logic |
| TypeScript | Shared types and compile-time safety |
| Express | REST API routing and middleware |
| Prisma | Data access and schema typing |

Backend rules:

- functional modules only (no class-based architecture)
- route handlers remain thin
- use-case functions orchestrate business logic
- deterministic parser/validator for AI output

---

## Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Relational persistence for projects and estimations |
| Prisma Migrate | Migration versioning and schema evolution |

MVP entities:

- Project
- UseCase
- Estimation
- Phase
- RoleEstimate
- TokenEstimate

---

## AI and Integration

| Technology | Purpose |
|---|---|
| Azure OpenAI | Roadmap, effort estimate, token projection |
| MCP Adapter Boundary | Future integrations without core refactor |

Integration rules:

- AI access from backend only
- prompts never exposed to frontend
- MCP clients isolated behind adapter functions

---

## Testing Stack

| Level | Tooling |
|---|---|
| Unit | Vitest |
| Integration | Supertest |
| End-to-End | Playwright |

Testing emphasis:

- protect critical estimation flow
- validate API contracts and persistence
- validate frontend behavior with stable test IDs

---

## Infrastructure (MVP)

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Managed PostgreSQL |

Deployment basics:

- automatic deploy from main
- environment variables per environment
- no secrets in repository

---

## Environment Variables

Required:

- `DATABASE_URL`

Required only when `AZURE_OPENAI_ENABLED=true`:

- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`

---

## Non-Goals for MVP

Not included initially:

- microservices split
- class-based backend patterns
- complex orchestration queues
- multi-region deployment
- heavy observability stack

These can be added after MVP validation.
