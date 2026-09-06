# Frontend Implementation Plan: Observability Epic (US-O1 … US-O5) — Scope Summary

## Verdict

**No Next.js (`apps/web`) implementation is required for the monitoreo / observabilidad epic.**

| ID | Frontend (`apps/web`) | Operator UI |
|----|----------------------|-------------|
| US-O1 | None | `curl` / Compose healthcheck |
| US-O2 | None | Prometheus scrape (not browser) |
| US-O3 | None | Prometheus UI `:9090` |
| US-O4 | None | Grafana `:3001` (provisioned dashboards) |
| US-O5 | None | Prometheus/Grafana alerts + runbook |

Per-ticket plans: `docs/plans/US-O1_frontend.md` … `US-O5_frontend.md`.

## Do not run

```
/develop-frontend @docs/plans/US-O*_frontend.md
```

Those plans exist to make the ai-specs workflow explicit and to prevent accidental React work.

## Optional future product US (out of this epic)

- Admin link “Abrir Grafana” → external URL  
- In-app status banner driven by ready probe  

Would need new enrichment + FE plan when requested.
