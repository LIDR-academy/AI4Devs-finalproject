---
description: Backend development standards for Reading Analytics Platform — NestJS, TypeORM, PostgreSQL, catalog integrations, testing, and API conventions
globs: ["backend/src/**/*.ts", "backend/test/**/*.ts", "backend/src/migrations/**/*.ts", "backend/tsconfig.json", "backend/package.json", "backend/eslint.config.mjs"]
alwaysApply: true
---

# Backend Project Standards

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Module Patterns](#module-patterns)
- [Coding Standards](#coding-standards)
- [API Design](#api-design)
- [Database and TypeORM](#database-and-typeorm)
- [Catalog Integrations](#catalog-integrations)
- [Authentication](#authentication)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Development Workflow](#development-workflow)

---

## Overview

The backend is a **NestJS 11** application for **Reading Analytics Platform**: user-scoped books, reading records, and external catalog search/covers. It uses **modular feature boundaries** (not a full DDD layered split). Business rules live in services; HTTP concerns stay in controllers and DTOs.

## Technology Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 20+ |
| Framework | NestJS 11 (`@nestjs/common`, `@nestjs/platform-express`) |
| Language | TypeScript (strict) |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL 16 |
| Validation | `class-validator` + `class-transformer` (global `ValidationPipe`) |
| Auth | `@nestjs/jwt`, `passport-jwt` |
| HTTP client | `@nestjs/axios` / `axios` for catalog providers |
| Tests | Jest 30, Supertest for E2E |

## Architecture

- **Feature modules:** `AuthModule`, `UsersModule`, `BooksModule` (includes `catalog/` subfolder).
- **Global prefix:** `/v1` in `main.ts`.
- **CORS:** `CORS_ORIGIN` env (default `http://localhost:5173`).
- **Config:** `@nestjs/config` — `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_BOOKS_API_KEY`, etc.

```
Request → Controller → Service → TypeORM Repository / Catalog client
                ↓
              DTO validation (pipe)
```

Controllers are thin. Services own transactions, duplicate checks, and metadata enrichment.

## Project Structure

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── data-source.ts          # TypeORM CLI data source
│   ├── auth/
│   ├── users/
│   ├── books/
│   │   ├── books.controller.ts
│   │   ├── books.service.ts
│   │   ├── books.module.ts
│   │   ├── entities/
│   │   ├── dto/
│   │   └── catalog/            # Open Library, Google Books, covers
│   └── migrations/
├── test/
│   ├── books.integration-spec.ts
│   └── app.e2e-spec.ts
├── package.json
└── .env.example
```

## Module Patterns

### Controllers

- Use `@Controller('books')` (path segment without `v1` — global prefix applies).
- Apply `@UseGuards(JwtAuthGuard)` for user-scoped routes.
- Inject services via constructor DI.
- Use `@Req() req: RequestWithUser` for `userId` from JWT (`sub`).

### Services

- `@Injectable()` classes; inject `@InjectRepository(Entity)` repositories.
- Return **snake_case** DTOs from private mappers (e.g. `toBookDto`) for API consistency.
- Throw Nest HTTP exceptions: `NotFoundException`, `ConflictException` with structured body when needed.

### DTOs

- Input: `class-validator` decorators; optional fields use `@IsOptional()`.
- Query DTOs: `@Type(() => Number)` for numeric query params.
- Keep request field names **snake_case** (`isbn_13`, `cover_image_url`) to match JSON API.

### Entities

- TypeORM decorators; UUID PKs; `snake_case` column names via `@Column({ name: '...' })`.
- Relations: `ManyToOne` User → Book, `OneToOne` Book → ReadingRecord with `onDelete: 'CASCADE'`.

## Coding Standards

### Language and naming

- **English only** for code, comments, errors, and logs (`docs/standards/base-standards.md`).
- TypeScript: explicit types on public methods; avoid `any`.
- Files: `kebab-case` or Nest convention (`books.service.ts`, `book.entity.ts`).
- Enums in DB/API: reading `status`, `data_source`, `read_format` — keep aligned with migration CHECK constraints.

### Validation

Global pipe in `main.ts`:

```typescript
new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
});
```

### Logging

Use Nest `Logger` for catalog failures; do not log JWTs or secrets.

## API Design

- Document contracts in `docs/api-spec.yml`; implement in `books.controller.ts` and `auth.controller.ts`.
- **JSON snake_case** on wire; map to camelCase only inside entities/services.
- Success codes: `200` GET, `201` POST create/login.
- Errors: standard Nest shape `{ statusCode, message }`; duplicates include `code: 'BOOK_DUPLICATE'` and `existingBookId`.

### Current endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/v1/auth/dev-login` | No | MVP login |
| GET | `/v1/books` | JWT | List library |
| POST | `/v1/books` | JWT | Create book + reading record |
| GET | `/v1/books/catalog/search` | JWT | Catalog search |
| GET | `/v1/books/catalog/covers` | JWT | Edition cover options |

## Database and TypeORM

- Schema defined in entities + migrations (prefer migrations over `synchronize` in shared environments).
- Run migrations: `npm run migration:run` from `backend/`.
- See `docs/data-model.md` for tables and enums.
- Index `user_id` on `books` for list queries.
- Use `relations: ['readingRecord']` when returning list items with `reading_status`.

## Catalog Integrations

Located under `backend/src/books/catalog/`:

| Component | Role |
|-----------|------|
| `CatalogService` | Search orchestration (Open Library → Google Books fallback) |
| `OpenLibraryClient` / enrichment | Edition metadata |
| `GoogleBooksClient` | Fallback search and volume details |
| `EditionCoversService` | Aggregate cover URLs per edition |

Rules:

- Catalog search checks `catalog_editions` locally before external APIs; API hits are upserted into shared catalog.
- `BookMetadataResolver` merges `catalog_editions` + `user_book_overrides` for all library reads; user PATCH writes overrides only.
- Handle upstream timeouts/errors gracefully; return empty `items` or partial covers when appropriate.
- Unit-test pure helpers (`cover-utils`, enrichment) with mocks for HTTP.

## Authentication

- MVP: `POST /auth/dev-login` with email only; `UsersService.findOrCreateByEmail`.
- JWT payload: `{ sub: userId, email }`; validate in `JwtStrategy`.
- Guard: `JwtAuthGuard` on `BooksController`.
- Production evolution: password/OAuth — keep auth isolated in `auth/` module.

## Testing

| Type | Location | Command |
|------|----------|---------|
| Unit | `*.spec.ts` next to source | `npm test` |
| Integration | `test/*.integration-spec.ts` | `npm run test:integration` |
| E2E | `test/app.e2e-spec.ts` | `npm run test:e2e` |

Practices (aligned with `docs/standards/base-standards.md`):

- **TDD** for new behavior: failing test first when tasks require it.
- Mock external catalog HTTP in unit tests.
- Integration tests use real Postgres when configured in `DATABASE_URL`.
- Descriptive `describe` / `it` names in English.

Coverage: aim for meaningful coverage on services and catalog logic; no fixed 90% gate in `package.json` today — prefer quality over arbitrary thresholds.

## Error Handling

| Case | Exception | Notes |
|------|-----------|-------|
| Book not found | `NotFoundException` | User-scoped lookups |
| Duplicate library entry | `ConflictException` | `BOOK_DUPLICATE` + `existingBookId` |
| Invalid body/query | `BadRequestException` | ValidationPipe |
| Unauthorized | `UnauthorizedException` | Missing/invalid JWT |

## Development Workflow

### Git

- Feature branches; descriptive commits in English.
- Optional ticket prefix: `KAN-9: ...`
- Do not commit `.env` or secrets.

### Scripts

```bash
npm run start:dev      # watch
npm run build
npm run migration:run
npm test
npm run test:integration
```

### When changing the API

1. Update `docs/api-spec.yml`
2. Update `docs/data-model.md` if schema changes
3. Update `frontend/src/api/types.ts` and `client.ts` in the same change when possible

## Related documentation

- `docs/development_guide.md` — local setup
- `docs/data-model.md` — entities
- `ai-specs/agents/backend-developer.md` — planning agent
