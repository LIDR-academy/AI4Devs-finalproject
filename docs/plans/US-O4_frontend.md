# Frontend Implementation Plan: US-O4 Grafana Dashboards

## Overview

US-O4 delivers operator dashboards via **Grafana** (Compose profile `observability`, host `127.0.0.1:3001`), not via the Next.js workshop app.

**User story:** [`us/monitoreo y observabilidad/US-O4-grafana-dashboards.md`](../../us/monitoreo%20y%20observabilidad/US-O4-grafana-dashboards.md)  
**Ops plan:** [`docs/plans/US-O4_backend.md`](./US-O4_backend.md)

**“Frontend” in this ticket = Grafana provisioning JSON/YAML**, already owned by the ops/backend track. **`apps/web` changes: none.**

**Out of scope:** Rebuilding RED charts in React, iframe-embedding Grafana inside MecaTrack admin, SSO into Grafana from Next auth.

---

## Architecture Context

| UI | Port | Audience |
|----|------|----------|
| MecaTrack Next.js | `3000` / DEV `3010` | Admin / mechanic workshop flows |
| Grafana | `127.0.0.1:3001` | Operator / developer |

### Files (ops — not Next.js)

```
infra/observability/grafana/
  provisioning/datasources/datasource.yml
  provisioning/dashboards/dashboards.yml
  dashboards/mecatrack-api-overview.json
```

### Files under `apps/web`

```
(none)
```

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Action:** **Do not create** `feature/US-O4-frontend` for Next.js.
- **Notes:** If any residual ops work remains, it belongs on `feature/US-O4-backend` / `feature/US-O5-backend`, not a frontend branch.

### Step 1: Explicit non-goals for Next.js

1. No route `/admin/monitoring`.
2. No “Abrir Grafana” link unless a **future** product US requests it (would be a simple external link to `http://127.0.0.1:3001` — still not this ticket).
3. Do not change Next `WEB_PORT` / `3000` mapping to free Grafana — Grafana already uses `3001`.

### Step 2: Update Technical Documentation

- Operator UX lives in Grafana panel titles (Spanish) + `infra/observability/README.md`.
- No `docs/frontend-standards.mdc` update required.

---

## Implementation Order

1. Skip `/develop-frontend`.
2. Validate Grafana login + **MecaTrack API Overview** (ops checklist in US-O4).

---

## Testing Checklist

- [ ] N/A Playwright against Grafana
- [ ] Ops: Grafana `:3001` → provisioned dashboard visible
- [ ] Confirm workshop UI on `:3000` still loads (port isolation)

---

## Error Handling Patterns

N/A in Next.js. Grafana auth errors are Grafana’s admin password / env (`GRAFANA_ADMIN_*`).

---

## UI/UX Considerations

- Grafana panels use Spanish titles for taller operators (“API arriba”, “Peticiones/s”, etc.) — configured in dashboard JSON, not in React.
- Accessibility of Grafana UI is upstream; MecaTrack a11y standards do not apply inside Grafana.

---

## Dependencies

None for `apps/web`. Do not add Grafana JS SDK to Next for this US.

---

## Notes

- Colliding Grafana with web on port `3000` is a regression; keep `3001`.

---

## Next Steps After Implementation

No Next.js PR. Alerts UI awareness → US-O5 (still Prometheus/Grafana, not Next).

---

## Implementation Verification

- [x] No `apps/web` implementation plan of work
- [x] Operator UI = Grafana (documented)
