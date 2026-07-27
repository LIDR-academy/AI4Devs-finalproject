# Changelog

## v1.0.0 — Entrega Final (2026-07-29)

### Features
- **Listing Lens**: Análisis de anuncios inmobiliarios con LLM (OpenRouter), detección de red flags con razonamiento, cruce catastral (m² declarados vs oficiales), diff de re-análisis
- **Mortgage Compass**: Cálculo de gastos ocultos (ITP/IVA, notaría, registro, gestoría, tasación), 4 escenarios de amortización vs 3 alternativas de inversión con valor real ajustado a inflación
- **Dashboard**: Vista agregada en una sola llamada, estado vacío con CTAs, diff de re-análisis, stats
- **Negotiation Assistant**: 5-8 preguntas concretas basadas en red flags para hacer al inmobiliario
- **Timeline**: Cronograma interactivo del proceso de compra (60-90 días)
- **Checklist**: Documentos por etapa con progreso y sugerencia de avance

### Architecture
- Hexagonal + DDD táctico (dominio sin dependencias de frameworks)
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL
- Frontend: SvelteKit + Vite + PWA (mobile-first, instalable)
- 8 adaptadores: OpenRouter, Cheerio, Playwright (BrowserPool), fetch chain, Catastro, Geocoding, DeclaredLocation, MiraTuZona

### AI Engineering
- 4 agentes (implementer, reviewer, documenter, orchestrator)
- 6 skills (auto-evidence, tdd-cycle, hexagonal-check, adr-suggest, pwa-shell, prisma-migrate)
- 8 comandos slash reutilizables
- 4 hooks de automatización
- 3 playbooks multi-paso
- Sistema de autodocumentación con evidence files

### Testing
- 99 tests backend (23 archivos) — Vitest
- 51 tests frontend (12 archivos) — Vitest + happy-dom
- 13 tests E2E (4 flows) — Playwright
- 3 tests de contrato — Vitest + supertest
- Cobertura 80%+ en capa de dominio
- CI/CD con GitHub Actions

### Deployment
- Railway: 2 servicios Node.js (backend + frontend) + PostgreSQL plugin
- Backend: https://realista-backend.up.railway.app
- Frontend: https://realista-frontend.up.railway.app

### Documentation
- 7 ADRs (hexagonal, fallback, no-scraping, location-resolver, playwright, SSE, PWA)
- Spec completa (spec.md, plan.md, data-model.md, research.md, tasks.md, contracts/api.md)
- prompts.md (9 secciones documentando uso de IA)
- readme.md (8 secciones)
- quickstart.md
- CHANGELOG.md

---

## v0.2.0 — Entrega 2 (2026-07-09)

- MVP funcional completo
- 236 archivos, +33,290 líneas
- 6 US implementadas
- CI/CD operativo
- Sistema de AI Engineering (.opencode/)

## v0.1.0 — Entrega 1 (2026-06-04)

- Fase de planificación
- Spec, plan, research, data-model, contracts, tasks
- 3 ADRs iniciales
- prompts.md y readme.md
