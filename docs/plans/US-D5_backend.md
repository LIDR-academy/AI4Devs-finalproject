# Backend Implementation Plan: US-D5 Client Search by Email

## Overview

Extend **`GET /api/clients/search?q=`** so the existing unified search also matches **`Client.email`** with case-insensitive `contains` (full address or fragment such as `@email.com`). No new endpoint, no response shape change — only widen the Prisma `OR` clause in `ClientsService.search`.

**Architecture principles:** minimal diff in `clients` module; TDD (failing unit test first); English API messages; preserve all existing search rules (`q.length < 2`, `nationalId=` exact path, phone digits branch, `take: 20`).

**User story reference:** [`us/Deseables/US-D5-busqueda-clientes-correo.md`](../../us/Deseables/US-D5-busqueda-clientes-correo.md)

**Prerequisites:** US-003 (`Client.email` nullable field exists).

**Out of scope:** Frontend, dedicated email-only endpoint, fuzzy search, unique email constraint, mandatory DB index (optional if perf issues).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D5 artifacts |
|-------|----------------|-----------------|
| **Presentation** | Unchanged route | `ClientsController.search` |
| **Application** | Widen search OR | `ClientsService.search` |
| **Infrastructure** | Prisma `Client` | No schema change required |

### Files to modify

```
apps/api/src/modules/clients/
├── clients.service.ts              # add email branch to OR
└── clients.service.spec.ts         # email + regression tests

apps/api/test/clients.e2e-spec.ts   # extend if search e2e exists
apps/api/README.md                  # document email in search criteria
```

### API endpoint (unchanged)

| Method | Path | Auth | Roles | Change |
|--------|------|------|-------|--------|
| `GET` | `/api/clients/search?q=` | Bearer | `ADMIN`, `MECHANIC` | OR includes `email` |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Branch (required):** `feature-entrega2-RFM`
- **Implementation Steps:**
  1. `git checkout feature-entrega2-RFM`
  2. Do **not** create `feature/US-D5-backend`.
- **Notes:** Quick win on shared delivery branch per `us/Deseables/README.md`.

---

### Step 1: Unit Tests First (TDD)

- **File:** `clients.service.spec.ts`
- **Action:** Add failing tests before changing service.
- **Implementation Steps:**
  1. **Full email:** seed/mock client with `email: 'juan@email.com'`; `search({ q: 'juan@email.com' })` → includes client.
  2. **Domain fragment:** `q: '@email.com'` → includes matching clients.
  3. **Case-insensitive:** stored lowercase, query `JUAN@EMAIL.COM` → match.
  4. **Null email:** client with `email: null` does not match email-only query `q: 'zzz@'` unless name/phone/nationalId matches.
  5. **Duplicate emails:** two clients same email both returned when term matches.
  6. **Regressions:** name contains, nationalId contains, phone digits, `q: 'a'` → empty, `nationalId=` exact path unchanged.
- **Dependencies:** Existing spec fixtures/mocks.
- **Implementation Notes:** Use same mock patterns as existing `search` tests (lines ~55–114 in current spec).

---

### Step 2: Extend Search OR Clause

- **File:** `clients.service.ts`
- **Action:** Add email branch to existing `OR` array.
- **Implementation Steps:**
  1. After phone digits spread, append:

```typescript
{
  email: {
    contains: searchTerm,
    mode: 'insensitive',
  },
},
```

  2. Keep `searchTerm = query.q.trim()` (already trimmed).
  3. Do **not** change `SEARCH_LIMIT`, `orderBy`, or `nationalId` shortcut branch.
  4. Run unit tests → green.
- **Dependencies:** Step 1.
- **Implementation Notes:** Prisma `contains` on nullable field naturally excludes nulls for email-only matches.

---

### Step 3: E2E API (if applicable)

- **File:** `test/clients.e2e-spec.ts` (or create minimal search case)
- **Action:** HTTP-level smoke for email search.
- **Implementation Steps:**
  1. Seed client with known email (or use seed data `juan@...`).
  2. ADMIN/MECHANIC `GET /clients/search?q=juan@` → `200`, item with email present.
  3. Regression: `GET /clients/search?q=Juan` still finds by name.
- **Dependencies:** E2E bootstrap.

---

### Step 4: Update Technical Documentation

- **File:** `apps/api/README.md`
- **Action:** Document email as search criterion under Clients / Search section.
- **Implementation Steps:**
  1. Add bullet: `q` matches `fullName`, `nationalId`, phone digits, and **`email`** (case-insensitive substring).
  2. Note optional `@@index([email])` only if perf measured — not required for DoD.
- **References:** `docs/documentation-standards.mdc`.

---

## Implementation Order

1. Step 0 — `feature-entrega2-RFM`
2. Step 1 — Failing unit tests
3. Step 2 — Service OR change
4. Step 3 — E2E API (if present)
5. Step 4 — Documentation

---

## Testing Checklist

- [ ] Full email search works
- [ ] Fragment `@domain.com` works
- [ ] Case-insensitive match
- [ ] Name / nationalId / phone regressions green
- [ ] `q.length < 2` still returns empty
- [ ] `nationalId=` exact path unchanged
- [ ] Duplicate emails both listed
- [ ] Unit spec green; e2e if applicable

---

## Error Response Format

No change from US-003:

| Status | Condition |
|--------|-----------|
| `400` | Missing search params (controller validation) |
| `401` | No JWT |
| `403` | Unauthorized role |

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-003 | `Client.email` field |
| **No new npm packages** | |
| **No migration** | Unless optional index added later |

---

## Notes

- **Branch:** `feature-entrega2-RFM` only.
- **Enables UX for:** US-D2, US-D3, US-D4 (locate clients by email).
- **Index:** Defer `@@index([email])` unless staging shows p95 regression.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` → `docs/plans/US-D5_frontend.md`
2. Commit on `feature-entrega2-RFM`

---

## Implementation Verification

### Code Quality

- [ ] Single-line OR addition; no duplicate search logic

### Functionality

- [ ] Email search matches US-D5 acceptance criteria

### Testing

- [ ] Unit matrix + regression green

### Integration

- [ ] Ready for `ClientSearchBar` placeholder update (FE)

### Documentation

- [ ] README updated
