# Roadmap de changes — EyeMaster V2

Conducimos la implementación con OpenSpec. Cada fase del plan
(`docs/plan-implementacion.md`) es un **change** con sus artefactos
(`proposal.md` → `design.md` + `specs/` → `tasks.md`).

## Flujo por change

```bash
openspec new change <name>                 # scaffold
# autorar proposal → specs → design → tasks
openspec validate <name> --strict          # verificar
# implementar (los tasks.md guían el desarrollo)
openspec archive <name>                     # al terminar: promueve specs/ a openspec/specs/
```

Comandos útiles: `openspec list`, `openspec status --change <name>`, `openspec view`.

## Pipeline

Orden por dependencias de build (ver camino crítico en el plan).

| # | Change | Fase | Capability | Depende de | Estado |
|---|---|---|---|---|---|
| 1 | `add-erp-gateway` | F1 | `erp-integration` | — | ✅ propuesto (4/4) |
| 2 | `bootstrap-project` | F0 | — (setup) | — | ⬜ pendiente |
| 3 | `add-auth-rbac` | F2 | `auth` | bootstrap | ⬜ pendiente |
| 4 | `add-audit-log` | F3 | `audit` | auth | ⬜ pendiente |
| 5 | `add-client-registration` | F4 | `clients` | erp-gateway, auth, audit | ⬜ pendiente |
| 6 | `add-company-retrieval` | F5 | `companies` | erp-gateway, auth | ⬜ pendiente |
| 7 | `add-commercial-structure` | F6 | `commercial-structure` | companies | ⬜ pendiente |
| 8 | `add-financial-cache` | F7 | `financial-cache` | erp-gateway, companies | ⬜ pendiente |
| 9 | `add-status-and-balance` | F8 | `financial-status` | financial-cache, commercial-structure | ⬜ pendiente |
| 10 | `add-reporting-engine` | F9 | `reporting` | status-and-balance | ⬜ pendiente |
| 11 | `harden-and-deploy` | F10 | — (ops) | todo | ⬜ pendiente |

> `bootstrap-project` (F0) es setup sin comportamiento observable: se autora con
> `tasks.md` (y `proposal.md` mínimo), sin `specs/`.

## Nota sobre el orden

Aunque `add-erp-gateway` es el change #1 por criticidad (desbloquea F4/F5/F7), en la
práctica `bootstrap-project` se implementa primero para tener el esqueleto Django/React
donde vive el gateway. El gateway se especificó antes por ser el mayor riesgo técnico
(contrato WS + simulación).
