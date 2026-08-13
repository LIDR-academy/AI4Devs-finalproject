# Frontend Implementation Plan: US-O3 Prometheus Compose

## Overview

US-O3 adds a **Prometheus** service under Compose profile `observability`. There is **no Next.js feature work**.

**User story:** [`us/monitoreo y observabilidad/US-O3-prometheus-scrape-compose.md`](../../us/monitoreo%20y%20observabilidad/US-O3-prometheus-scrape-compose.md)  
**Backend/ops plan:** [`docs/plans/US-O3_backend.md`](./US-O3_backend.md)

**Out of scope:** Embedding Prometheus UI in MecaTrack, reverse-proxying `:9090` through Next.js.

---

## Architecture Context

| Surface | URL / location |
|---------|----------------|
| Prometheus UI | `http://127.0.0.1:9090` (loopback) |
| MecaTrack web | `http://localhost:3000` (unchanged) |

### Files to add/modify

```
(none under apps/web)
```

Port **3000** remains the workshop UI; Prometheus must stay on **9090** to avoid collisions.

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Action:** **Do not create** `feature/US-O3-frontend`.

### Step 1: Document-only awareness (optional)

- **Action:** If product owners confuse ports, point them to `infra/observability/README.md` — not a new nav item in the app.

### Step 2: Update Technical Documentation

- Covered by ops docs / `docs/observability.md`. No `frontend-standards.mdc` change.

---

## Implementation Order

1. Skip Next.js.
2. Ops verification of Prometheus targets UI.

---

## Testing Checklist

- [ ] N/A for Playwright
- [ ] Ops: targets UP at `:9090/targets`

---

## Error Handling Patterns

N/A.

---

## UI/UX Considerations

Prometheus UI is third-party; not restyled inside MecaTrack.

---

## Dependencies

None in `apps/web`.

---

## Notes

- Do not publish Prometheus on `0.0.0.0` via the Next app.

---

## Next Steps After Implementation

No `/develop-frontend` for US-O3. Grafana UI is US-O4 (still not Next.js).

---

## Implementation Verification

- [x] Confirmed no `apps/web` deliverable
