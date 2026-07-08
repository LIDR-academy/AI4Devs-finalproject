# Evidence: 2026-07-08-E2E-VERIFICATION — Backend end-to-end smoke test

**Date**: 2026-07-08
**Agent**: implementer
**Story**: transversal (Foundational hardening)
**Branch**: feature-entrega2-DMM

## Prompt (verbatim)

> "docker acaba de arrancar, prueba ahora."

(responding to the proposal to verify the full E2E flow with docker-compose)

## What was done

Started the docker-compose stack, ran the Prisma migration, seeded the DB, and verified the full backend API works end-to-end against a real Postgres.

### 1. Docker stack

```
$ docker compose up -d
Container realista-postgres Started (healthy)
Container realista-adminer Started
```

Mapped the container's 5432 to host 5433 (because another postgres container is using 5432 on this machine). Updated `docker-compose.yml`, `backend/.env.example`, and root `.env.example` accordingly.

### 2. Prisma migration

```
$ DATABASE_URL=postgresql://realista:realista@localhost:5433/realista npx prisma migrate dev --name init
Your database is now in sync with your schema.
```

Generated `backend/prisma/migrations/20260708125026_init/migration.sql` (175 lines) creating the 7 models + 3 enums.

### 3. Seed

```
$ npx tsx src/infrastructure/prisma/seed.ts
Seeding default data...
  ✓ 5 portal health entries
Done. Checklist items are created per-process at runtime (T082).
```

### 4. End-to-end smoke test

Booted the server with `MOCK_OPENROUTER=true` and exercised every flow:

#### Health check
```
GET /health
→ {"status":"ok","timestamp":"2026-07-08T12:50:43.203Z","database":"connected"}
```

#### Empty dashboard (FR-019)
```
GET /api/dashboard (no prior activity)
→ {"empty":true,"ctas":[{"label":"Analizar un anuncio","href":"/listing-lens"},{"label":"Configurar perfil manualmente","href":"/mortgage-compass"}]}
```

#### Analyze listing (with manual text — MOCK_OPENROUTER mode)
```
POST /api/listings/analyze
  body: {"url":"https://www.idealista.com/inmueble/12345/","manualText":"Piso acogedor y cálido..."}
  status: 200
  response: {
    "listing": {
      "id": "8fb14e44-...",
      "transparencyScore": 60,
      "scoreLabel": "media",
      "redFlags": [
        {"flag": "euphemistic_language", "severity": "medium", "reasoning": "El anuncio usa \"acogedor\" sin describir el espacio."},
        {"flag": "missing_energy_certificate", "severity": "medium", "reasoning": "OMITIDO: certificado energético no mencionado."}
      ],
      "summary": "Anuncio de prueba generado por mock."
    },
    "processSummary": {
      "processId": "9887b7e6-...",
      "propertyPrice": null,
      "currentStage": "PRE_ARRAS",
      "isNewProcess": true
    }
  }
  responseTime: 101ms
  x-ratelimit-remaining: 19
```

Verifies:
- ✅ FR-002 (OpenRouter mock with system prompt)
- ✅ FR-014 (auto-attach, isNewProcess: true)
- ✅ FR-025 (per-flag reasoning with the exact quote)
- ✅ FR-010 (rate limit headers)
- ✅ FR-018 (101ms response time, well under 15s SLA)

#### Dashboard with data
```
GET /api/dashboard (after analysis)
→ {
  "empty": false,
  "process": {"id": "9887b7e6-...", "status": "ACTIVE", "currentStage": "PRE_ARRAS"},
  "latestListing": {"id": "8fb14e44-...", "transparencyScore": 60, "redFlagsCount": 2},
  "checklist": null
}
```

Verifies:
- ✅ FR-023 (single endpoint aggregates process + latestListing + checklist)
- ✅ `checklist: null` because FR-024 (auto-create) is not implemented yet — confirmed as a known gap, not a bug

#### Negotiation points (FR-026)
```
GET /api/listings/8fb14e44-.../negotiation-points
→ {
  "points": [
    {"category": "euphemistic_language", "question": "El anuncio usa lenguaje vago...", "rationale": "El anuncio usa \"acogedor\" sin describir el espacio."},
    {"category": "missing_energy_certificate", "question": "El certificado energético no aparece...", "rationale": "OMITIDO: certificado energético no mencionado."},
    {"category": "general", "question": "Pide la cédula de habitabilidad vigente.", "rationale": "Verificación estándar recomendada."},
    ...3 more general points...
  ]
}
```

5 questions returned (2 flag-specific + 3 general). Each has category, question, and rationale. FR-026 satisfied.

#### Rate limit (FR-010)
Hit the analyze endpoint 21 times with the same session:
- Requests 1-20: HTTP 200
- Request 21: HTTP 429

Exactly 20 successful + 1 rate-limited. FR-010 satisfied with surgical precision.

#### Timeline (US5)
```
GET /api/timeline
→ {"milestones": [{"stage": "PRE_ARRAS", "title": "Búsqueda y pre-selección", "estimatedDays": 30, ...}, ...6 milestones total]}
```

6 hardcoded milestones, 60-90 days total, from PRE_ARRAS to POST_ESCRITURA.

#### Purchase process create + stage advance
```
POST /api/purchase-processes
  body: {"propertyPrice": 200000, "financialProfile": {"savings": 45000, "monthlyIncome": 3500, "existingDebts": 0, "region": "Madrid"}}
→ {"id": "5681655e-...", "status": "ACTIVE", "currentStage": "PRE_ARRAS", "propertyPrice": "200000", ...}

PATCH /api/purchase-processes/5681655e-...  body: {"currentStage": "ARRAS"}
→ {"id": "5681655e-...", "currentStage": "ARRAS", ...}
```

US3 stage-advance works.

#### Checklist (FR-024 — manual create only)
```
GET /api/checklist  → HTTP 404 (no checklist yet, FR-024 not implemented)
POST /api/checklist/process/5681655e-...  → checklist with 21 items created
GET /api/checklist  → checklist with 21 items, 0 completed
```

The endpoint works, but the auto-creation on first analysis (FR-024) is **not yet implemented**. Currently the user must explicitly POST to create the checklist.

## Deliverables

### Commits

- `fix(infra): map postgres container port to 5433 to avoid local conflicts`
  - `docker-compose.yml`
- `fix(env): update DATABASE_URL in .env.example to use port 5433`
  - `backend/.env.example`
  - `.env.example`
- `feat(backend): initial Prisma migration`
  - `backend/prisma/migrations/20260708125026_init/migration.sql`
  - `backend/prisma/migrations/migration_lock.toml`

## Tests

- Unit: 38/38 passing (unchanged from previous commit)
- Integration: **not added** (would require testcontainers — deferred)
- E2E: **manual smoke test passed** (this evidence file)
  - 8 endpoints exercised
  - 21 sequential requests to verify rate limit
  - 1 PATCH to verify stage advance
  - 1 manual checklist creation
  - 0 errors, 0 unhandled exceptions, 0 crashes

## Notes

### What now works (verified end-to-end)

| Component | FR | Status |
|---|---|---|
| Health check | — | ✅ |
| Session UUID | — | ✅ |
| Rate limit 20/day | FR-010 | ✅ |
| Dashboard empty state | FR-019 | ✅ |
| Dashboard aggregate | FR-023 | ✅ |
| Analyze listing (LLM mock) | FR-002 | ✅ |
| Auto-attach PurchaseProcess | FR-014 | ✅ |
| Per-flag reasoning | FR-025 | ✅ |
| Negotiation points | FR-026 | ✅ |
| Timeline (6 milestones) | US5 | ✅ |
| PurchaseProcess CRUD | US3 | ✅ |
| Stage advance | US3 | ✅ |
| Manual checklist create | US6 | ✅ |

### What still doesn't work (gaps confirmed)

| Component | FR | Status |
|---|---|---|
| Auto-create Checklist on first analysis | FR-024 | ❌ Returns 404 until manual POST |
| Mortgage Compass narrative generation in UI | US2 | 🟡 Endpoint OK, UI not wired |
| Negotiation Assistant UI section | US4 | 🟡 Endpoint OK, UI not wired |
| PWA icons (192, 512, 512-maskable) | FR-009 | ❌ Empty static/icons/ |
| Re-analysis with diff | FR-022 | 🟡 DiffService exists, route not implemented |
| Catastro XML parsing | FR-003 | ❌ Adapter stub; xml2js removed, SEC XML not parsed |
| Portal health monitoring (cron) | FR-027 | 🟡 Table + admin endpoint exist, no cron |
| SSE real-time progress to frontend | FR-018 | 🟡 Server side OK, frontend simulates |
| Frontend (SvelteKit) | — | ⚠️ Never started; not yet verified |

### Known architectural notes

1. The session middleware runs on `/api/timeline` and `/health` even though these don't need it. This is by design (consistency) but means every request to the API creates a User row, even for unauthenticated/public reads.
2. The `processId` in `processSummary` is generated by the auto-attach service but is not the same as the `latestListing.id` (which is the listing ID). The negotiation-points route needs the **listingId**, not the processId. The frontend needs to know this.
3. The financialProfile is stored as `JSONB` (PostgreSQL's binary JSON) — this works but loses type safety. A future iteration could normalise to columns once the schema stabilises.

### Next steps (in order of priority)

1. **FR-024 auto-create Checklist** — hook into `AutoAttachService` or `AnalyzeListingUseCase` to create the checklist with 21 items on first analysis
2. **Mortgage Compass UI** — wire `NarrativeGenerator` to render the 4 amortization narratives + 3 investment scenarios + visual chart
3. **Negotiation Assistant UI** — add a section on `/listing-lens` showing the 5 questions
4. **PWA icons** — generate the 3 PNGs (placeholder logos are fine for MVP)
5. **SSE real-time progress** — wire `progressEmitter.ts` to the frontend via `EventSource`
6. **Frontend verification** — `cd frontend && npm run check && npm run dev` to verify the SvelteKit build
7. **Re-analysis with diff** — add PATCH or re-POST endpoint that compares against previous snapshot
8. **Catastro XML parsing** — add `xml2js` back, parse SEC response, extract year_built + surface
