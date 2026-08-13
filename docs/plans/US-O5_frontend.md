# Frontend Implementation Plan: US-O5 Basic Alerts

## Overview

US-O5 adds **Prometheus alert rules** and an operator **runbook**. Notification MVP is Prometheus/Grafana UI — **not** in-app toasts, badges, or notification center in Next.js.

**User story:** [`us/monitoreo y observabilidad/US-O5-alertas-basicas.md`](../../us/monitoreo%20y%20observabilidad/US-O5-alertas-basicas.md)  
**Ops plan:** [`docs/plans/US-O5_backend.md`](./US-O5_backend.md)

**Out of scope:** Alert inbox in MecaTrack web, email/SMS from Next, PagerDuty widgets, polling Prometheus from the browser.

---

## Architecture Context

| Surface | Role |
|---------|------|
| Prometheus `/alerts`, `/rules` | Rule evaluation + firing state |
| Grafana Alerting (optional view) | Same series / future unified alerting |
| Runbook markdown | `infra/observability/runbooks/alerts.md` (Spanish OK for operators) |
| `apps/web` | **No changes** |

### Files to add/modify

```
(none under apps/web)
```

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Action:** **Do not create** `feature/US-O5-frontend`.

### Step 1: Confirm product boundary

- Workshop users (admin/mechanic) continue using existing delivery/OT UIs.
- Operators diagnose outages via Prometheus/Grafana + runbook — outside the Next bundle.

### Step 2: Update Technical Documentation

- Runbook + `docs/observability.md` already cover alerts.
- No frontend standards / Cypress-Playwright updates.

---

## Implementation Order

1. Skip Next.js.
2. Ops: fire/resolve `MecaTrackApiDown` test from runbook.

---

## Testing Checklist

- [ ] N/A Playwright
- [ ] Ops alert fire/resolve per US-O5

---

## Error Handling Patterns

N/A in React. Do not map Prometheus alerts into React error boundaries.

---

## UI/UX Considerations

N/A for MecaTrack web. Future “status banner” would need a **new** user story.

---

## Dependencies

None in `apps/web`.

---

## Notes

- Epic README: stories do **not** change workshop business flows.

---

## Next Steps After Implementation

1. No `/develop-frontend` for this epic.
2. Close frontend planning with epic note: all O1–O5 FE plans are **N/A for `apps/web`**.
3. Recommended next ai-specs command: `/commit` (PR `feature/US-O5-backend` → `finalproject-RFM`).

---

## Implementation Verification

- [x] Zero Next.js deliverables for US-O5
- [x] Operator path documented (Prometheus/Grafana + runbook)
