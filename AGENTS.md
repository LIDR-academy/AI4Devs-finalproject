# Realista — Agent Guidance

## Project Status
Greenfield project. Specification phase. See `specs/001-homepath-mvp/spec.md`.

## Stack
- **Frontend:** SvelteKit + Vite + PWA (mobile-first SPA)
- **Backend:** Node.js + Express, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Analysis:** LLM system prompt (primary) → `@avena/score` (fallback) → manual text paste
- **Testing:** Vitest (unit + integration), Playwright (E2E)
- **Deployment:** TBD (Vercel/Railway candidates)

## Architecture
Hexagonal + DDD tactical. Domain has zero framework dependencies.

**Aggregates:** `User`, `PurchaseProcess`, `AnalyzedListing`, `Checklist`

**Ports:** `AnuncioAnalyzerPort`, `CalculadoraHipotecariaPort`, `CatastroPort`, `NotificacionPort`

**Value Objects:** `TransparencyScore`, `EstimatedLocation`, `RedFlags`, `FinancialProfile`, `BureaucraticMilestone`

## Listing Lens Flow (formerly Desengatusador)
1. User pastes URL → server-side fetch
2. LLM system prompt analyzes listing text for red flags, omissions, manipulative language
3. Cadastral API cross-reference: compare listed m² vs official data
4. Fallback chain: LLM → `@avena/score` → manual text paste
5. Return `TransparencyReport`: score, red flags, location confidence, cadastral comparison, MiraTuZona link, snapshot hash

## Mortgage Compass Flow
1. User enters property price, savings, income, debts
2. System calculates hidden costs (ITP/IVA, notaría, registro, gestoría, tasación)
3. Persona questions (risk tolerance, priorities)
4. Strategy playground: 30-year mortgage with amortization scenarios (none/light/moderate/aggressive) vs investing alternative
5. Educational narrative — never financial advice

## Key Conventions
- **No storage of third-party content** — only analysis results stored
- **User-Agent:** `Realista/1.0 (analizador educativo)`
- **Rate limiting:** max 20 analyses/day per user
- **No auth for MVP** — anonymous session UUID. `userId` nullable for future.
- MIT license; include NOTICE.md credits for `@avena/score`
- Test-first: TDD per feature slice, 80%+ domain coverage target

## File Layout
```
.specify/
├── memory/constitution.md     # Project principles
├── templates/                 # Spec/plan/tasks templates
├── scripts/                   # SDD workflow scripts
└── extensions/                # Installed extensions
specs/
└── 001-homepath-mvp/
    ├── spec.md                # Feature specification
    ├── plan.md                # Implementation plan
    ├── data-model.md          # Prisma models
    ├── contracts/             # API design
    └── research.md            # LLM/Cadastro strategy decisions
docs/
├── arquitectura.md            # Technical decisions, diagrams
├── domain-events.md           # Identified domain events
└── adr/                       # Architecture Decision Records
    ├── 001-hexagonal.md
    ├── 002-avena-score.md
    └── 003-no-scraping.md
```
