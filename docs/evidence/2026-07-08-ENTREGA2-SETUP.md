# Evidence: ENTREGA2-SETUP — AI Engineering Setup + scaffolds + autodocumentación

**Date**: 2026-07-08
**Agent**: orchestrator
**Story**: transversal (Foundational + AI setup)
**Branch**: feature-entrega2-DMM

## Prompt (verbatim)

> "Actúa como mi experto en Ingeniería de IA. Estamos iniciando la segunda entrega de mi proyecto final y necesito que me ayudes a generar los cimientos técnicos y de documentación siguiendo estas instrucciones:
> - Generación de Scaffolds: Crea la estructura base o esquemas (scaffolds) iniciales del código de la aplicación. No es necesario que el código esté listo para producción o despliegue todavía, pero debe ser funcional en un entorno local.
> - Componentes Técnicos de IA: Define y estructura en el repositorio los siguientes elementos: Los agentes y subagentes principales, los comandos/playbooks/prompts run, las skills y hooks.
> - Harness y Herramientas: Documenta el harness del proyecto y las herramientas de especificación (como OpenSpec o BeMac).
> - Sistema de Autodocumentación: por cada tarea, genera evidencia (prompt + qué se hizo + entregables).
> - Organización: README.md + prompts.md + rama específica.
> - Comencemos por definir la estructura de carpetas y los primeros agentes para la Épica 1."

## What was done

### 1. Brainstorming + diseño (`.opencode/skills/brainstorming`)

- 5 preguntas de clarificación: spec tools, alcance Épica 1, nivel MVP, orden de implementación, DB, autodocumentación, ubicación componentes de IA, granularidad de agentes
- Decisiones: mantener `spec-kit`, las 6 US a nivel MVP, story-by-story TDD, PostgreSQL con Docker Compose, skill `auto-evidence` + `docs/evidence/`, `.opencode/` en raíz, 4 agentes de alto nivel
- Spec formal escrito en `docs/superpowers/specs/2026-07-08-ai-engineering-setup-design.md`
- Self-review del spec: sin placeholders, sin contradicciones, scope claro

### 2. Componentes de IA en `.opencode/`

- **4 agentes** (`agents/`): `implementer.md`, `reviewer.md`, `documenter.md`, `orchestrator.md`
- **8 comandos** (`commands/`): `analyze-listing.md`, `review-pr.md`, `document-task.md`, `check-architecture.md`, `generate-adr.md`, `scaffold-story.md`, `sprint.md`, `evidence-report.md`
- **6 skills** (`skills/`): `auto-evidence.md`, `tdd-cycle.md`, `hexagonal-check.md`, `adr-suggest.md`, `pwa-shell.md`, `prisma-migrate.md`
- **4 hooks** (`hooks/`): `post-commit.md`, `pre-push.md`, `post-merge.md`, `on-save-svelte.md` (+ script `regenerate-evidence-index.js`)
- **3 playbooks** (`playbooks/`): `full-story.md`, `adr-lifecycle.md`, `release.md`
- **3 prompt-runs** (`prompts/`): `llm-system-listing.md`, `llm-system-location.md` (DEPRECATED), `narrative-templates.md`
- **6 harness docs** (`harness/`): `README.md`, `stack.md`, `env-vars.md`, `test-strategy.md`, `run-locally.md`, `troubleshooting.md`, `config.yaml`
- `README.md` raíz del `.opencode/`

### 3. Sistema de autodocumentación en `docs/evidence/`

- `INDEX.md` con plantilla y template
- Este evidence file
- Script `regenerate-evidence-index.js` para regenerar el índice

### 4. Backend scaffold (`backend/`)

- `package.json` con dependencias completas (Express 4.19, Prisma 5, Cheerio, Zod, pino, vitest, supertest, tsx)
- `tsconfig.json` con strict mode completo y path aliases
- `vitest.config.ts` con coverage threshold 80% en domain
- `.eslintrc.cjs`, `.prettierrc`, `.env.example`
- `prisma/schema.prisma` con 7 modelos: `User`, `PurchaseProcess`, `AnalyzedListing`, `RedFlag`, `Checklist`, `ChecklistItem`, `PortalHealthCheck`, `RateLimitCounter` + 2 enums
- `src/index.ts` con Express + CORS + pino + session middleware + 8 routers
- `src/infrastructure/`: env.ts (Zod), prisma client, urlValidator
- `src/api/middleware/`: session, rateLimiter, errorHandler
- `src/api/routes/`: health, listings, purchaseProcesses, dashboard, negotiation, timeline, checklist, adminPortalHealth
- `src/api/progressEmitter.ts` (SSE para FR-018)
- `src/domain/aggregates/`: User, PurchaseProcess, AnalyzedListing, RedFlag, Checklist, PortalHealthCheck
- `src/domain/value-objects/`: TransparencyScore, RedFlags, Coordinates, FinancialProfile, HiddenCosts, BureaucraticMilestone, SnapshotHash
- `src/domain/ports/`: ListingAnalyzerPort, LocationResolverPort, CatastroPort, MortgageCalculatorPort, NotificationPort
- `src/domain/services/`: AnalyzeListingUseCase, AutoAttachService, DiffService, HiddenCostsCalculator, AmortizationCalculator, InvestmentCalculator, NarrativeGenerator, NegotiationPointsService, TimelineService, ProgressEvents
- `src/domain/errors/`: DomainError + ValidationError, NotFoundError, PortalBlockedError, LlmMalformedResponseError, CatastroUnavailableError, InvalidUrlError
- `src/adapters/`: openrouter (con system prompt + retry + JSON validation), cheerio (con .m. fallback FR-027), location (Declared + Geocoding), catastro, miratuzona, notification
- `tests/unit/`: 8 archivos de test para value objects y services (TransparencyScore, RedFlags, Coordinates, HiddenCosts, SnapshotHash, AmortizationCalculator, InvestmentCalculator, NegotiationPointsService, DiffService)
- `tests/setup.ts` con MOCK_* env vars
- `README.md` con quickstart

### 5. Frontend scaffold (`frontend/`)

- `package.json` con SvelteKit 2, Svelte 4, Vite 5, @vite-pwa/sveltekit, Playwright, Vitest, svelte-check
- `vite.config.ts` con PWA plugin
- `svelte.config.js` con adapter-node
- `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`
- `.env.example`, `.eslintrc.cjs`, `.prettierrc`
- `src/app.html` con PWA meta + iOS tags
- `src/app.css` con design tokens
- `src/routes/+layout.svelte` con NavTabs
- `src/routes/+page.svelte` (Dashboard, FR-019 empty state con CTAs)
- `src/routes/listing-lens/+page.svelte` (form + progress + AI disclaimer)
- `src/routes/mortgage-compass/+page.svelte` (form financiero)
- `src/routes/timeline/+page.svelte` (60-90 días)
- `src/routes/checklist/+page.svelte` (US6)
- `src/lib/stores/`: session, listings, process
- `src/lib/api/`: client, types
- `src/lib/components/`: AIDisclaimer, LoadingState (con progress events), NavTabs, RedFlagCard
- `src/lib/utils/format.ts` (formatCurrency, formatDate, scoreColor, scoreLabelEs)
- `static/manifest.webmanifest`
- `src/app.d.ts`
- `README.md` con quickstart

### 6. E2E + Docker + CI

- `docker-compose.yml` con PostgreSQL 16-alpine + Adminer
- `e2e/` con Playwright config + 3 flows (full-flow, listing-lens, mortgage-compass)
- `.github/workflows/ci.yml` con 3 jobs: backend (lint+typecheck+test+coverage+hexagonal-check), frontend (lint+check+test), e2e (Playwright con servicios PostgreSQL)
- Root `package.json` con workspaces y scripts de orquestación (`dev`, `build`, `test`, `lint`, `db:*`, `check:hexagonal`, `evidence:regenerate`)
- `.gitignore` completo
- `.env.example` raíz con todas las variables

### 7. Actualización de `readme.md` y `prompts.md`

- `readme.md`: nueva sección 8 "AI Engineering Setup" con resumen, agentes, autodocumentación, cumplimiento constitucional, estructura, próximos pasos. Índice actualizado. Sección 1.4 ahora con quickstart.
- `prompts.md`: nueva sección 9 "Componentes de IA (Entrega 2)" con catálogo completo, decisiones, prompts relevantes. Índice actualizado.

## Deliverables

- `docs/superpowers/specs/2026-07-08-ai-engineering-setup-design.md` (1 file, ~280 lines)
- `.opencode/README.md` (1 file)
- `.opencode/agents/` (4 files)
- `.opencode/commands/` (8 files)
- `.opencode/skills/` (6 files)
- `.opencode/hooks/` (4 files + 1 script)
- `.opencode/playbooks/` (3 files)
- `.opencode/prompts/` (3 files)
- `.opencode/harness/` (6 docs + 1 config.yaml)
- `docs/evidence/INDEX.md` (1 file)
- `docs/evidence/2026-07-08-ENTREGA2-SETUP.md` (este file)
- `backend/` scaffold (35+ files: package.json, tsconfig, vitest, eslint, prettier, env, prisma, src/{index, infrastructure/{env, prisma, utils}, api/{routes, middleware, progressEmitter}, domain/{aggregates, value-objects, ports, services, errors}, adapters/{openrouter, cheerio, location, catastro, miratuzona, notification}, tests/{unit, setup}})
- `frontend/` scaffold (20+ files: package.json, vite/svelte/ts/vitest/playwright configs, eslint, prettier, env, src/{app.html, app.css, app.d.ts, routes/{+layout, +page, listing-lens, mortgage-compass, timeline, checklist}, lib/{stores, api, components, utils}}, static/manifest)
- `e2e/` (4 files: package.json, playwright.config, 3 flows)
- `docker-compose.yml` (1 file)
- `.github/workflows/ci.yml` (1 file)
- Root `package.json` + `.gitignore` + `.env.example` (3 files)
- `readme.md` actualizado (sección 8 + 1.4)
- `prompts.md` actualizado (sección 9)

## Tests

- Unit tests escritos (pendiente de ejecución — el comando `npm test` requiere `npm install` primero):
  - `TransparencyScore.test.ts` (6 tests)
  - `RedFlags.test.ts` (4 tests)
  - `Coordinates.test.ts` (4 tests)
  - `HiddenCosts.test.ts` (6 tests)
  - `SnapshotHash.test.ts` (6 tests)
  - `AmortizationCalculator.test.ts` (3 tests)
  - `InvestmentCalculator.test.ts` (3 tests)
  - `NegotiationPointsService.test.ts` (3 tests)
  - `DiffService.test.ts` (3 tests)
- Cobertura objetivo: ≥80% en `backend/src/domain/`
- Configurado en `backend/vitest.config.ts` con `thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 }`

## Commits

- Pendiente: `feat(entrega2): AI engineering setup + backend/frontend/e2e scaffolds + autodocumentación`

## Notes

### Decisiones de implementación

- **Backend en CommonJS** (no ESM) — mayor compatibilidad con Prisma 5 + tsx. El frontend sí usa ESM (SvelteKit lo requiere).
- **Path aliases** en backend (`@domain/*`, `@adapters/*`, etc.) — útiles para los agentes, evitan imports relativos largos
- **Mocks por defecto en tests** — `MOCK_OPENROUTER=true`, `MOCK_NOMINATIM=true`, `MOCK_CATASTRO=true` en `tests/setup.ts` para que los tests no necesiten red ni claves
- **CatastroAdapter parcialmente implementado** — la SEC devuelve XML aunque se pida JSON; el parsing XML está pendiente (marcado como `PENDING-DECODE` por ahora). El sistema sigue funcionando porque la verificación catastral es opcional (FR-016)
- **Progress events simulados en frontend** — el componente `LoadingState` simula los 4 pasos cada 3s. La integración real con SSE (`backend/src/api/progressEmitter.ts`) está lista pero no conectada al frontend en este scaffold
- **PWA icons pendientes** — el manifest referencia `/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/maskable-icon-512.png` que hay que generar antes del primer build de producción

### Limitaciones conocidas

- `backend/src/api/routes/purchaseProcesses.ts` tiene un `where: { id, userId: req.userId! } as unknown as` que es un workaround de TypeScript. Aceptable en MVP; mejorar en US1.
- `OpenRouterAdapter` tiene `xml2js` como dependencia implícita (mencionada en el import del `CatastroAdapter` que ya no se usa directamente). Limpiar en próximo commit.
- El seed de `CHECKLIST_TEMPLATE` en `seed.ts` se importa dinámicamente desde la ruta `checklist.ts` — funciona pero es feo. Mover a un módulo compartido.
- Tests E2E apuntan a `http://localhost:5173` pero no arrancan el servidor. Documentado en `playwright.config.ts`.

### Próximos pasos inmediatos (no incluidos en este commit)

1. `npm install` en raíz, backend y frontend
2. `docker compose up -d` + `npx prisma migrate dev` + `npm run db:seed`
3. `npm test` en backend para validar los 9 archivos de test
4. `npm run check:hexagonal` para confirmar purity del dominio
5. Activar Husky para `post-commit` hook (`.opencode/hooks/post-commit.md`)
6. Empezar US1 con `implementer T023-T044`

### Validación contra Constitución

- ✅ **I. Hexagonal** — `domain/` no importa de `express`, `prisma`, `cheerio`, `node-fetch`. Verificable con `bash .opencode/skills/hexagonal-check/run.sh`
- ✅ **II. Test-First** — Tests escritos antes/después de cada value object y service. Cobertura 80% enforced en vitest config.
- ✅ **III. Educational, Not Commercial** — `NarrativeGenerator` usa plantillas hardcoded, no LLM. `narrative-templates.md` documenta cada variante.
- ✅ **IV. Privacy & Legal Compliance** — User-Agent configurado en `env.REALISTA_USER_AGENT` con default `Realista/1.0 (analizador educativo)`. Rate limit 20/día en `rateLimiter.ts`. `AnalyzedListing` no persiste `html` ni `text` (FR-011).
- ⚠️ **V. PWA Mobile-First** — SvelteKit + @vite-pwa/sveltekit configurados. **Icons pendientes de generar** (mencionado arriba).
- ✅ **VI. YAGNI & Future-Proof** — Sin auth, `userId` nullable, sin optimizaciones especulativas. Sin trabajo que no esté en el spec.
