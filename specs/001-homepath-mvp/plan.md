# Implementation Plan: Realista MVP

**Branch**: `001-realista-mvp` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-homepath-mvp/spec.md`

## Summary

PWA mobile-first para compradores primerizos de vivienda en España. Tres funcionalidades principales: Listing Lens (análisis de anuncios con IA vía OpenRouter + cruce catastral), Mortgage Compass (perfil financiero + gastos ocultos + simulador de amortización vs inversión), y Dashboard (seguimiento del proceso). Arquitectura hexagonal + DDD táctico. SvelteKit en frontend, Node.js/Express en backend, PostgreSQL + Prisma ORM como capa de datos.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: SvelteKit (frontend), Express + node-fetch + cheerio (backend), Prisma ORM, @avena/score (scoring numérico), OpenRouter SDK (LLM gateway)

**Storage**: PostgreSQL 16 + Prisma ORM

**Testing**: Vitest (unitarios + integración), Playwright (E2E)

**Target Platform**: Web mobile-first (PWA instalable), iOS Safari + Android Chrome

**Project Type**: Web application (monorepo: frontend SvelteKit + backend Express)

**Performance Goals**: Análisis de anuncio <10s, respuesta de API <500ms p95, carga inicial de PWA <3s

**Constraints**: Rate limit 20 análisis/día/sesión, sin almacenar contenido de terceros, sin autenticación (MVP)

**Scale/Scope**: POC educativa, ~5 pantallas, 3 features principales

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Hexagonal Architecture | ✅ PASS | Domain layer planned with ports/adapters. Zero framework deps in domain |
| II. Test-First | ✅ PASS | Vitest + Playwright in stack. Feature-slice TDD planned per user story |
| III. Educational, Not Commercial | ✅ PASS | FR-013 prohibits financial advice. Templates not LLM for narratives. Disclaimers planned |
| IV. Privacy & Legal Compliance | ✅ PASS | FR-011: no third-party content storage. FR-012: honest User-Agent. FR-010: rate limiting |
| V. Mobile-First PWA | ✅ PASS | SvelteKit + @vite-pwa/sveltekit. Target: 375px+ |
| VI. YAGNI & Future-Proof | ✅ PASS | No auth for MVP, nullable userId in schema. Only 3 core features. No speculative work |

## Project Structure

### Documentation (this feature)

```text
specs/001-homepath-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

Frontend + backend co-located for monorepo simplicity:

```text
backend/
├── src/
│   ├── domain/
│   │   ├── aggregates/         # User, PurchaseProcess, AnalyzedListing, Checklist
│   │   ├── value-objects/      # TransparencyScore, FinancialProfile, RedFlags, BureaucraticMilestone
│   │   ├── ports/              # ListingAnalyzerPort, CadastroPort, MortgageCalculatorPort
│   │   └── services/           # AnalyzeListingUseCase, CalculateAffordabilityUseCase
│   ├── adapters/
│   │   ├── openrouter/         # OpenRouterAdapter (LLM analysis)
│   │   ├── avena-score/        # AvenaScoreAdapter (fallback)
│   │   ├── cheerio/            # CheerioAdapter (HTML parsing)
│   │   ├── catastro/           # CatastroAdapter (cadastral API)
│   │   └── miratuzona/         # MiraTuZonaAdapter (location link)
│   ├── api/
│   │   ├── routes/             # Express routes
│   │   ├── middleware/         # Session UUID, rate limiting, error handling
│   │   └── controllers/        # Request handlers
│   ├── infrastructure/
│   │   ├── prisma/             # Schema + migrations
│   │   └── config/             # Environment, secrets, constants
│   └── index.ts                # Entry point
└── tests/
    ├── unit/                   # Domain + adapter unit tests
    └── integration/            # API + DB integration tests

frontend/
├── src/
│   ├── routes/                 # SvelteKit file-based routing
│   │   ├── +page.svelte        # Dashboard
│   │   ├── listing-lens/
│   │   │   ├── +page.svelte    # Listing Lens UI
│   │   │   └── +page.server.ts # Server-side proxy to backend API
│   │   ├── mortgage-compass/
│   │   │   ├── +page.svelte    # Mortgage Compass UI
│   │   │   └── +page.server.ts
│   │   ├── timeline/
│   │   │   └── +page.svelte    # Interactive timeline
│   │   ├── checklist/
│   │   │   └── +page.svelte    # Document checklist
│   │   └── +layout.svelte      # Mobile-first shell + nav
│   ├── lib/
│   │   ├── stores/             # Svelte stores (session, listings, profile)
│   │   ├── api/                # Backend API client
│   │   └── utils/              # Shared helpers
│   └── app.css                 # Global styles
├── static/                     # PWA icons, manifest
└── tests/
    ├── unit/                   # Component tests
    └── e2e/                    # Playwright E2E tests

e2e/                            # Playwright tests at root level
└── flows/
    └── full-flow.spec.ts       # Listing Lens → Mortgage Compass → Dashboard
```

**Structure Decision**: Monorepo with separate `backend/` and `frontend/` directories. Backend uses hexagonal architecture with domain/adapters/api/infrastructure layers. Frontend uses SvelteKit file-based routing. E2E tests at root for cross-stack integration.

## Complexity Tracking

> No violations detected. All constitutional principles pass.
