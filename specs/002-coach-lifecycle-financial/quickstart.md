# Quickstart Validation Guide: Coach Lifecycle & Financial Data

## Prerequisites

- Backend running on `http://localhost:3001` with database migrated and seeded
- Admin JWT token (login as `admin@coacher.com` / `Admin123!`)
- `ENCRYPTION_KEY` environment variable set (hex-encoded 256-bit key)

## Setup Commands

```bash
# From project root
cd backend

# Run database migrations (if not already done)
npx prisma migrate dev

# Regenerate Prisma client
npm run db:generate

# Start dev server
npm run dev
```

## Validation Scenarios

### 1. Create a Coach

```bash
curl -X POST http://localhost:3001/api/v1/coaches \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Ruiz",
    "email": "carlos@example.com",
    "phone": "+34 600 111 222",
    "specialities": "Yoga, Pilates",
    "bankAccount": "ES91 2100 0418 4502 0005 1332",
    "ssn": "123-45-6789",
    "dni": "12345678Z"
  }'
```

**Expected**: HTTP 201 — response with coach profile (NO bankAccount/ssn/dni fields).

### 2. List Coaches with Pagination

```bash
curl "http://localhost:3001/api/v1/coaches?page=1&limit=10&status=active" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected**: HTTP 200 — paginated array with no financial fields.

### 3. Get Coach Detail

```bash
curl http://localhost:3001/api/v1/coaches/$COACH_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected**: HTTP 200 — full profile without financial data.

### 4. Access Financial Data (Dedicated Endpoint)

```bash
curl http://localhost:3001/api/v1/coaches/$COACH_ID/financial \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected**: HTTP 200 — JSON with `bankAccount`, `ssn`, `dni` in plaintext.

**Verification**: Check the `security_audit_logs` table — should contain a row with `action = "FINANCIAL_DATA_ACCESS"`.

### 5. Non-Admin Access to Financial Endpoint

```bash
curl http://localhost:3001/api/v1/coaches/$COACH_ID/financial \
  -H "Authorization: Bearer $COACH_TOKEN"
```

**Expected**: HTTP 403 — `{ error: { code: "FORBIDDEN", ... } }`.

### 6. Update Coach Profile

```bash
curl -X PUT http://localhost:3001/api/v1/coaches/$COACH_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"specialities": "CrossFit, HIIT"}'
```

**Expected**: HTTP 200 — updated coach profile.

### 7. Toggle Coach Status

```bash
# Deactivate
curl -X PATCH http://localhost:3001/api/v1/coaches/$COACH_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'

# Expected: HTTP 200 - status: "inactive"

# Reactivate
curl -X PATCH http://localhost:3001/api/v1/coaches/$COACH_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'

# Expected: HTTP 200 - status: "active"
```

### 8. Run Tests

```bash
cd backend
npm test
```

**Expected**: All coach-related tests pass (create, list, detail, update, status, financial access, audit logging, auth enforcement).

## API Contract Reference

See [contracts/api-contracts.md](contracts/api-contracts.md) for full request/response schemas.

## Data Model Reference

See [data-model.md](data-model.md) for entity definitions and relationships.
