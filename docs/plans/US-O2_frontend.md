# Frontend Implementation Plan: US-O2 Metrics Instrumentation

## Overview

US-O2 exposes **`GET /api/metrics`** (Prometheus text) from NestJS. The Next.js workshop app (`apps/web`) must **not** scrape or render Prometheus exposition.

**User story:** [`us/monitoreo y observabilidad/US-O2-instrumentacion-metricas-api.md`](../../us/monitoreo%20y%20observabilidad/US-O2-instrumentacion-metricas-api.md)  
**Backend plan:** [`docs/plans/US-O2_backend.md`](./US-O2_backend.md)

**Out of scope:** Metrics dashboards inside Next.js, chart libraries for RED metrics, calling `/api/metrics` from the browser (security + cardinality + wrong consumer).

---

## Architecture Context

| Consumer | Role |
|----------|------|
| Prometheus (US-O3) | Scrapes `http://api:4000/api/metrics` on Docker network |
| Grafana (US-O4) | Visualizes series |
| `apps/web` | **No changes** |

### Files to add/modify

```
(none under apps/web)
```

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Action:** **Do not create** `feature/US-O2-frontend`.

### Step 1: Ensure web does not depend on `/api/metrics`

- **Action:** Confirm API proxy in Next (`API_PROXY_TARGET`) is for business `/api/*` only; do not add a metrics page that would expose scrape output via `localhost:3000`.
- **Implementation notes:** Public internet exposure of metrics via the web container would violate US-O2 security posture.

### Step 2: Update Technical Documentation

- **Action:** No FE standards change. Point operators to `docs/observability.md`.

---

## Implementation Order

1. Skip Next.js work.
2. Verify backend metrics + Prometheus scrape (ops).

---

## Testing Checklist

- [ ] N/A Playwright for metrics UI
- [ ] Ops: `curl` DEV `http://localhost:4010/api/metrics` (API host, not web)

---

## Error Handling Patterns

N/A in `apps/web`.

---

## UI/UX Considerations

N/A. Visualization is Grafana (US-O4), not MecaTrack Next.js.

---

## Dependencies

None for frontend. Do **not** add `prom-client` or chart deps to `apps/web` for this US.

---

## Notes

- Instrumenting Next.js itself is explicitly out of epic scope (story README).

---

## Next Steps After Implementation

No `/develop-frontend` for US-O2.

---

## Implementation Verification

- [x] Zero `apps/web` code changes required
- [x] No browser scrape of `/api/metrics`
