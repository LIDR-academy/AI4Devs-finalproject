# Realista — Agent Guidance

## Project Status
MVP complete. Final delivery phase. Deployed on Railway. See `specs/001-realista-mvp/spec.md`.

## Stack
- **Frontend:** SvelteKit + Vite + PWA (mobile-first SPA)
- **Backend:** Node.js + Express, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Analysis:** LLM system prompt (primary, via OpenRouter) → manual text paste (fallback)
- **Testing:** Vitest (unit + integration), Playwright (E2E)
- **Deployment:** Railway (backend + frontend + PostgreSQL)

## Architecture
Hexagonal + DDD tactical. Domain has zero framework dependencies.

**Aggregates:** `User`, `PurchaseProcess`, `AnalyzedListing`, `Checklist`

**Ports (English names, canonical across all artifacts):**
- `ListingAnalyzerPort`
- `LocationResolverPort`
- `CatastroPort`
- `MortgageCalculatorPort`
- `NotificationPort`

**Value Objects:** `TransparencyScore`, `Coordinates`, `RedFlags`, `FinancialProfile`, `BureaucraticMilestone`, `SnapshotHash`

## Listing Lens Flow
1. User pastes URL → server-side fetch (Cheerio)
2. LLM system prompt analyzes listing text for red flags, omissions, manipulative language
3. Location resolved via chain: `DeclaredLocationAdapter` (Cheerio) → `GeocodingAdapter` (Nominatim) → `LLMVisionLocationAdapter` (OpenRouter multimodal, fallback)
4. Catastral API cross-reference: compare listed m² vs official data
5. Backend computes `diff` vs previous snapshot (FR-022)
6. Return `TransparencyReport` + `processSummary` with auto-attach to `PurchaseProcess`

## Mortgage Compass Flow
1. User enters property price (pre-filled from listing), savings, income, debts
2. System calculates hidden costs (ITP/IVA, notaría, registro, gestoría, tasación)
3. Persona questions (risk tolerance, priorities)
4. Strategy playground: 30-year mortgage with 4 amortization scenarios (baseline, light €100/mo, moderate €300/mo, aggressive €500/mo) + 3 investment scenarios (conservative 4%, moderate 6%, aggressive 8%) with inflation-adjusted real value
5. Educational narrative from hardcoded templates — never financial advice

## Key Conventions
- **No storage of third-party content** — only analysis results stored (FR-011)
- **User-Agent:** `Realista/1.0 (analizador educativo)` (FR-012)
- **Rate limiting:** max 20 analyses/day per session UUID (FR-010). Known limitation: clearing localStorage resets the limit (POC-acceptable).
- **No auth for MVP** — anonymous session UUID. `userId` nullable for future.
- **Anonymous UUID only** — no cookies, no PII. Stored browser-side.
- **SLA:** Listing analysis <15s with progress events
- **AI disclaimer** persistent in any view with AI-generated content
- MIT license
- Test-first: TDD per feature slice, 80%+ domain coverage target

## Glossary (Canonical Names)

Always use these English names in code and docs:

| Concept | Name |
|---------|------|
| Listing analysis | `ListingAnalyzerPort`, `ListingLens` |
| Location resolution | `LocationResolverPort`, `Coordinates` |
| Cadastral API | `CatastroPort` (NOT Cadastro), `CatastroAdapter` |
| Mortgage | `MortgageCalculatorPort` |
| Score | `TransparencyScore` (0-100) |
| Red flags | `RedFlags` |
| Hash | `SnapshotHash` (SHA-256 of canonical listing content) |

## File Layout
```
docs/
├── constitution.md            # Project principles (constitución)
├── adr/                       # Architecture Decision Records
└── domain-events.md           # Catálogo de eventos de dominio

.specify/                      # Toolkit spec-kit (regenerable con 'specify init')
├── templates/                 # Spec/plan/tasks templates
├── scripts/                   # SDD workflow scripts
└── extensions/                # Installed extensions
specs/
└── 001-realista-mvp/
    ├── spec.md                # Feature specification
    ├── plan.md                # Implementation plan
    ├── data-model.md          # Prisma models + value objects
    ├── contracts/             # API design
    ├── research.md            # 8 technical decisions
    └── tasks.md               # 127 tasks, 8 phases
docs/
├── domain-events.md           # 16 domain events identified
└── adr/                       # Architecture Decision Records
    ├── 001-hexagonal.md
    ├── 002-avena-score.md          # (deprecated — see ADR-004)
    ├── 003-no-scraping.md
```

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at:
`specs/001-realista-mvp/plan.md`
<!-- SPECKIT END -->
