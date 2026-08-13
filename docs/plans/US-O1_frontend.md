# Frontend Implementation Plan: US-O1 Health Checks (Liveness / Readiness)

## Overview

US-O1 adds **public NestJS health probes** (`GET /api/health/live`, `GET /api/health/ready`) for Docker/Prometheus. There is **no workshop UI** in Next.js (`apps/web`).

**Architecture principles:** Health is an ops/API concern; the Next.js app must not call these endpoints in normal user flows (login, clients, OT). Probes are for Compose healthchecks and operators via `curl` / orchestration.

**User story:** [`us/monitoreo y observabilidad/US-O1-health-readiness-liveness.md`](../../us/monitoreo%20y%20observabilidad/US-O1-health-readiness-liveness.md)  
**Backend plan:** [`docs/plans/US-O1_backend.md`](./US-O1_backend.md) (implemented on `feature/US-O5-backend`)

**Out of scope for frontend:** Any page, nav link, React Query hook, or Playwright scenario that surfaces live/ready status inside MecaTrack web.

---

## Architecture Context

| Layer | Involved? |
|-------|-----------|
| `apps/web` pages / features | **No** |
| API client / services | **No** |
| Routing | **No** |
| Grafana / Prometheus | Consumers outside Next.js |

### Files to add/modify

```
(none under apps/web)
```

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Action:** **Do not create** `feature/US-O1-frontend`. There is no frontend delivery for this ticket.
- **Notes:** Backend lives on `feature/US-O*-backend`. Skip Step 0–N for Next.js.

### Step 1: Confirm no UI coupling

- **Action:** Grep `apps/web` for `health/live`, `health/ready` — expect no matches (or only docs).
- **Implementation notes:** Do not add a “system status” widget unless a future product US explicitly requires it.

### Step 2: Update Technical Documentation

- **Action:** No `apps/web` README changes required for US-O1 alone.
- **Notes:** Ops docs already cover probes (`apps/api/README.md`, `docs/observability.md`).

---

## Implementation Order

1. Skip Next.js branch/implementation.
2. Rely on backend DoD + ops smoke (`curl` live/ready).

---

## Testing Checklist

- [ ] N/A — no Playwright / component tests in `apps/web`
- [ ] Manual ops: `curl` live → 200; ready → 200/503 (backend)

---

## Error Handling Patterns

N/A in Next.js. Probe JSON contracts are owned by the API (`status` / `checks`).

---

## UI/UX Considerations

N/A. Operators use CLI / Compose / Prometheus, not the taller UI.

---

## Dependencies

None for frontend.

---

## Notes

- English for technical artifacts; no Spanish UI copy to add.
- Do **not** proxy `/api/health/*` through a logged-in-only Next layout in a way that breaks Docker healthchecks (probes hit the API container directly).

---

## Next Steps After Implementation

1. No `/develop-frontend` for US-O1.
2. Continue ops stack (US-O2…O5 backend/infra already planned/implemented).

---

## Implementation Verification

- [x] Scope confirmed: zero `apps/web` changes
- [ ] Backend US-O1 available (separate ticket)
- [x] Documentation points to API/ops docs, not a fake FE plan of work
