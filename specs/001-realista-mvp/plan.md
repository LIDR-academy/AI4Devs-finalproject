# Plan de Implementación: Realista MVP

**Rama**: `001-realista-mvp` | **Fecha**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Especificación de funcionalidad desde `/specs/001-realista-mvp/spec.md`

## Resumen

PWA mobile-first para compradores primerizos de vivienda en España. Tres funcionalidades principales: **Listing Lens** (análisis de anuncios con IA vía OpenRouter + cruce catastral), **Mortgage Compass** (perfil financiero + gastos ocultos + simulador de amortización vs inversión), y **Dashboard** (seguimiento del proceso). Arquitectura hexagonal + DDD táctico. SvelteKit en frontend, Node.js/Express en backend, PostgreSQL + Prisma ORM como capa de datos.

## Contexto Técnico

**Lenguaje/Version**: TypeScript 5.x

**Dependencias principales**: SvelteKit (frontend), Express + node-fetch + cheerio (backend), Prisma ORM, @avena/score (scoring numérico), OpenRouter SDK (LLM gateway)

**Almacenamiento**: PostgreSQL 16 + Prisma ORM

**Testing**: Vitest (unitarios + integración), Playwright (E2E)

**Plataforma objetivo**: Web mobile-first (PWA instalable), iOS Safari + Android Chrome

**Tipo de proyecto**: Web application (monorepo: frontend SvelteKit + backend Express)

**Objetivos de rendimiento**: Análisis de anuncio <10s, respuesta de API <500ms p95, carga inicial de PWA <3s

**Restricciones**: Rate limit 20 análisis/día/sesión, sin almacenar contenido de terceros, sin autenticación (MVP)

**Escala/Alcance**: POC educativa, ~5 pantallas, 3 features principales

## Verificación de la Constitución

*PUERTA: Debe pasar antes de la investigación de Fase 0. Re-verificar tras el diseño de Fase 1.*

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Arquitectura Hexagonal | ✅ PASA | Capa de dominio planificada con puertos/adaptadores. Cero dependencias de frameworks en el dominio |
| II. Test-First | ✅ PASA | Vitest + Playwright en stack. TDD feature-slice planificado por historia de usuario |
| III. Educativo, No Comercial | ✅ PASA | FR-013 prohíbe consejo financiero. Plantillas no LLM para narrativas. Disclaimers planificados |
| IV. Privacidad y Cumplimiento Legal | ✅ PASA | FR-011: sin almacenamiento de contenido de terceros. FR-012: User-Agent honesto. FR-010: rate limiting |
| V. PWA Mobile-First | ✅ PASA | SvelteKit + @vite-pwa/sveltekit. Target: 375px+ |
| VI. YAGNI & Future-Proof | ✅ PASA | Sin auth para MVP, userId nullable en schema. Solo 3 features principales. Sin trabajo especulativo |

## Estructura del Proyecto

### Documentación (esta feature)

```text
specs/001-realista-mvp/
├── plan.md              # Este archivo
├── research.md          # Output de Fase 0
├── data-model.md        # Output de Fase 1
├── quickstart.md        # Output de Fase 1
├── contracts/           # Output de Fase 1 (contratos API)
└── tasks.md             # Output de Fase 2 (/speckit.tasks)
```

### Código Fuente (raíz del repositorio)

Frontend + backend co-localizados para simplicidad del monorepo:

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
│   │   ├── location/           # DeclaredLocationAdapter, GeocodingAdapter, LLMVisionLocationAdapter
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
│   │   ├── components/         # Shared components (AIDisclaimer, LoadingState)
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

**Decisión de estructura**: Monorepo con directorios separados `backend/` y `frontend/`. El backend usa arquitectura hexagonal con capas domain/adapters/api/infrastructure. El frontend usa routing basado en archivos de SvelteKit. Tests E2E en raíz para integración cross-stack.

## Tracking de Complejidad

> No se detectan violaciones. Todos los principios constitucionales pasan.
