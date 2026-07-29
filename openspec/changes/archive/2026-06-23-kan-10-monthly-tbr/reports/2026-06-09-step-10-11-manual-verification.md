# Step 10–11 Report — Unit Tests, Database Verification, and curl Manual Tests

- Date: 2026-06-09
- Change: kan-10-monthly-tbr
- Agent: Auto

## Commands Executed

- `cd backend && npm test`
- `cd backend && npm run test:integration`
- `cd backend && npm run migration:run`
- `docker exec reading-analytics-db psql -U postgres -d reading_analytics -c "\dt monthly_tbr_lists"`
- Full curl flow (sections 11.1–11.6) against `http://localhost:3000/v1`
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/lists`

## Unit Test Results

- Targeted integration: **15 passed**, 0 failed (tbr + books integration specs)
- Full unit suite: **15 passed**, 0 failed
- Runtime: ~3s integration, ~2s unit

## Database State Verification

### Pre-test baseline (PostgreSQL via Docker)

| Table | Row count |
|-------|-----------|
| `monthly_tbr_lists` | 1 (from prior smoke test user) |
| `tbr_entries` | 0 |
| `migrations` | 2 rows |

### Post-migration validation

| Table | Exists |
|-------|--------|
| `monthly_tbr_lists` | Yes |
| `tbr_entries` | Yes |
| `migrations` | `CreateMonthlyTbrTables1749500000000` registered |

### Post curl-test validation

- Test user `kan10-curl-test@example.com`: TBR entry **deleted** (cleanup step 11.6)
- Test book remains in library with `status: leido` (acceptable test artifact)
- `tbr_entries` count for test list: **0** after cleanup

State restored for TBR entries: **Yes** (entry removed; list row retained)

## curl Manual Tests (11.1–11.6)

User: `kan10-curl-test@example.com` | Month: **2026/6**

| Step | Request | Result |
|------|---------|--------|
| 11.1 | `POST /v1/auth/dev-login` | **201** — JWT obtained |
| 11.2 | `GET /v1/tbr/2026/6` | **200** — lazy create, `entries: []` |
| 11.3a | `POST /v1/tbr/2026/6/entries` | **201** — entry created, `completed: false` |
| 11.3b | `POST` duplicate book | **409** |
| 11.4 | `PATCH /v1/books/{id}/reading-record` `{status: leido}` | **200** — `meta.tbrAutoCompleted: true` |
| 11.5 | `GET /v1/tbr/2026/6` | **200** — `entry.completed: true` |
| 11.6 | `DELETE /v1/tbr/2026/6/entries/{entryId}` | **204** — entries count 0 |

**Outcome:** PASS

## UI Smoke (12.x)

- Frontend dev server: **200** on `http://localhost:5173/lists`
- Frontend production build: **pass** (`npm run build`)
- Browser E2E (Playwright): not available in agent environment; API contracts for MANUAL-TEST-KAN-10 scenarios 1–3 verified via curl above

### Scenario mapping

| MANUAL-TEST scenario | Verified via |
|----------------------|--------------|
| 1 — Auto-created list | GET /tbr 200 + lazy create |
| 2 — Add books flow | POST entry 201 (UI uses same endpoint) |
| 3 — Auto-complete on read | PATCH leido + tbrAutoCompleted + GET completed |

## Outcome

- Step 10 status: **PASS**
- Step 11 status: **PASS**
- Step 12 status: **PARTIAL** (frontend reachable; full browser pass delegated to human using `MANUAL-TEST-KAN-10.md`)
- Blocking issues: none
