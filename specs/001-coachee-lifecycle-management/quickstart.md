# Quickstart: Coachee Lifecycle Management

**Phase**: 1 — Design & Contracts
**Date**: 2026-07-13

## Prerequisites

- Node.js 22 LTS
- PostgreSQL running (via `docker compose up -d` or local)
- Project dependencies installed: `npm install` (in `backend/`)
- Database migrated: `npm run db:migrate`
- Database seeded: `npm run db:seed`

## Setup

```bash
# From project root
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Validation Scenarios

### 1. Create a Coachee

```bash
# Login as Admin first (once auth is implemented, use the login endpoint)
# For now, tests use the dev bypass (see middleware)

# POST /api/v1/coachees
curl -X POST http://localhost:3001/api/v1/coachees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+34 600 000 000",
    "classTypePreference": "individual",
    "levelId": "<level-uuid-from-seed>"
  }'
```

**Expected**: `201 Created` with coachee object (no password, no financial fields).

### 2. List Coachees

```bash
curl -X GET "http://localhost:3001/api/v1/coachees?page=1&limit=10" \
  -H "Authorization: Bearer <admin-token>"
```

**Expected**: `200 OK` with paginated `{ data: [...], meta: {...} }` — no financial fields.

### 3. Filter by Status

```bash
curl -X GET "http://localhost:3001/api/v1/coachees?status=active" \
  -H "Authorization: Bearer <admin-token>"
```

**Expected**: `200 OK` — only active coachees returned.

### 4. Get Coachee Detail

```bash
curl -X GET "http://localhost:3001/api/v1/coachees/<coachee-uuid>" \
  -H "Authorization: Bearer <admin-token>"
```

**Expected**: `200 OK` with full profile (including additionalInfo, no financial fields).

### 5. Update Coachee

```bash
curl -X PUT "http://localhost:3001/api/v1/coachees/<coachee-uuid>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"name": "Juan Updated", "phone": "+34 600 000 001"}'
```

**Expected**: `200 OK` with updated fields.

### 6. Deactivate Coachee

```bash
curl -X PATCH "http://localhost:3001/api/v1/coachees/<coachee-uuid>/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"status": "inactive"}'
```

**Expected**: `200 OK` with `{ "id": "uuid", "status": "inactive" }`.

### 7. Change Level

```bash
curl -X PATCH "http://localhost:3001/api/v1/coachees/<coachee-uuid>/level" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"levelId": "<new-level-uuid>"}'
```

**Expected**: `200 OK` with updated level object.

### 8. Non-Admin Access (403)

```bash
# Using a Coachee or Coach token
curl -X POST "http://localhost:3001/api/v1/coachees" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <coachee-token>"
```

**Expected**: `403 FORBIDDEN`.

### 9. Duplicate Email (409)

```bash
# Create first coachee, then try same email again
curl -X POST "http://localhost:3001/api/v1/coachees" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Duplicate",
    "email": "juan@example.com",
    "classTypePreference": "individual"
  }'
```

**Expected**: `409 CONFLICT`.

## Test Execution

```bash
# Run all backend tests
cd backend && npm test

# Run specific coachee tests
cd backend && npx vitest run src/__tests__/coachees.test.ts
```

## Contracts Reference

See [contracts/api.md](./contracts/api.md) for full request/response schemas.
See [data-model.md](./data-model.md) for entity definitions and validation rules.
