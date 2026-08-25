# Quickstart: Level System & Role-Based UI

## Prerequisites

- Docker Compose running (PostgreSQL)
- `npm run db:migrate` completed
- `npm run db:seed` completed (seeds 5 levels)
- Backend running on port 3001: `npm run dev` (from `backend/`)
- Frontend running on port 5173: `npm run dev` (from `frontend/`)

## Validation Scenarios

### 1. Verify levels are seeded

```bash
# Backend health check
curl -s http://localhost:3001/api/v1/levels | jq '.data | length'
# Expected: 5
curl -s http://localhost:3001/api/v1/levels | jq '.data[].name'
# Expected: "Principiante", "Basico", "Intermedio", "Avanzado", "Experto"
```

### 2. Verify role-based layouts

| Role | URL | Expected Layout |
|------|-----|-----------------|
| Admin | `/admin/today` | Sidebar: Today, Calendar, Coachees, Coaches |
| Coach | `/coach/today` | Sidebar: Today, Calendar, Coachees (no Coaches) |
| Coachee | `/coachee/home` | Bottom nav: Home, Calendar, Notifications |

**Expected**: Each layout includes a bell icon in the header. Unauthorized routes redirect to `/unauthorized`.

### 3. Verify level assignment

**Admin path**:
1. Log in as Admin → navigate to Coachees → click a Coachee
2. Scroll to "Training Level" section → select level from dropdown → click "Change Level"
3. Verify toast "Level updated successfully"

**Coach path**:
1. Log in as Coach → navigate to Coachees → click a Coachee
2. Same level assignment UI as Admin

**API direct**:
```bash
COACHEE_ID="<uuid>"
LEVEL_ID=$(curl -s http://localhost:3001/api/v1/levels | jq -r '.data[0].id')
curl -s -X PATCH "http://localhost:3001/api/v1/coachees/$COACHEE_ID/level" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"levelId\": \"$LEVEL_ID\"}"
# Expected: 200 with updated level
```

### 4. Verify Coachee level visibility

1. Log in as a Coachee whose level has been set
2. Navigate to Home (`/coachee/home`)
3. Verify the Coachee's current level is displayed

### 5. Verify audit logging

```bash
# After a level change, check the SecurityAuditLog table
psql -d coacher -c "SELECT actor_id, action, resource, outcome FROM security_audit_log WHERE action = 'LEVEL_CHANGE';"
# Expected: 1 row with actor_id, action='LEVEL_CHANGE', resource='COACHEE', outcome='SUCCESS'
```

## Test Commands

```bash
# Run backend tests
cd backend && npm test

# Run linting
cd backend && npm run lint

# Type check
cd backend && npm run typecheck
```

## Contracts & Data Model

- API contracts: [contracts/README.md](contracts/README.md)
- Data model: [data-model.md](data-model.md)
- Full spec: [spec.md](spec.md)
