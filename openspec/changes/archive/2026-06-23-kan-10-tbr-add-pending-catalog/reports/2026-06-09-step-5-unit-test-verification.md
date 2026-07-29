# Step 5–6 verification — kan-10-tbr-add-pending-catalog

**Date:** 2026-06-09  
**Branch:** `feature/KAN-10-tbr-add-pending-catalog`

## Unit / integration tests

```text
cd backend && npm run test:integration
→ 2 suites, 16 tests passed (includes new TBR_BOOK_NOT_PENDING test)

cd backend && npm test
→ 5 suites, 15 tests passed

cd frontend && npm run build
→ success
```

**Regression fix:** `books.integration-spec.ts` — TBR entry is added after resetting book to `pendiente` (required by new guard).

## Curl (6.1–6.2)

User: `tbr-add-flow@test.com`, month `2026-06`.

| Step | Action | Result |
|------|--------|--------|
| 6.1 | `POST /v1/tbr/2026/6/entries` with `pendiente` book | **201** — entry created |
| 6.2 | `PATCH` book → `leyendo`, `POST` same entry again | **422** `TBR_BOOK_NOT_PENDING` |

## UI (7.x)

Manual scenarios documented in `MANUAL-TEST-KAN-10-ADD-FLOW.md`. Agent did not run browser automation; verify locally on `:5173`.
