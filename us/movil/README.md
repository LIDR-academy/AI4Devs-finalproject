# Mobile (Android) — User Stories

Native Android client for MecaTrack that **reuses the existing REST API**. No duplicated workshop business logic.

**Refinement:** `/enrich-us` 2026-08-14 (local). No Jira MCP — stories live as markdown (`[original]` + `[enhanced]`).

## SDD order (native)

1. Enrich stories (this folder).
2. **US-M1 backend** — `docs/plans/US-M1_backend.md` (**implemented**).
3. **US-M1 Android** — `docs/plans/US-M1_android.md` (**implemented**).
4. **US-M2 Android** — `docs/plans/US-M2_android.md` (**implemented**).
5. **US-M3 Android** — `docs/plans/US-M3_android.md` (**implemented**).
6. **US-M4 Android** — detail from home (**documented**; plan pending).
7. **US-M5 Android** — add tasks (**documented**; plan pending).
8. **US-M6 Android** — complete tasks → auto `LISTA_PARA_ENTREGA` (**documented**; plan pending).

## Story list

| ID | File | Title | Refinement |
|----|------|-------|------------|
| US-M1 | `US-M1-autenticacion-android.md` | Inicio de sesión en Android (misma API) | Enhanced 2026-08-14 |
| US-M2 | `US-M2-ordenes-en-curso-android.md` | Órdenes en curso en el teléfono | Enhanced 2026-08-14 |
| US-M3 | `US-M3-ingreso-ot-cliente-vehiculo-android.md` | Crear OT aunque el vehículo no exista | Enhanced 2026-08-14 |
| US-M4 | `US-M4-detalle-orden-trabajo-android.md` | Detalle de orden de trabajo | Enhanced 2026-08-14 |
| US-M5 | `US-M5-agregar-tareas-android.md` | Agregar tareas a la orden | Enhanced 2026-08-14 |
| US-M6 | `US-M6-completar-tareas-android.md` | Completar tareas (lista para entrega) | Enhanced 2026-08-14 |

## Product intent

- Same NestJS API as `apps/web`.
- Mechanic/admin on **Android**.
- Intake when plate is unknown (M3).
- After create: open detail, add tasks, complete tasks until the OT is **ready for delivery** (`LISTA_PARA_ENTREGA`).

## Out of scope (current mobile epic)

- iOS, PWA, Capacitor
- US-007 technical notes
- US-008 owner contact / physical delivery (`ENTREGADA`) from the phone
- US-009 history
- US-002 user admin
- Push notifications
- Reopening a completed task (API forbids it)

## Dependencies

| Story | Depends on |
|-------|------------|
| US-M1 | US-001, US-012, US-014. API delta: native refresh. |
| US-M2 | US-M1 DoD, US-D10 `GET /api/work-orders/in-progress` |
| US-M3 | US-M1, US-M2, US-003, US-004, US-005, US-D7, US-D8, US-D9 |
| US-M4 | US-M2 DoD, `GET /api/work-orders/:id` |
| US-M5 | US-M4, `POST /api/work-orders/:id/tasks` |
| US-M6 | US-M4 (+ M5 or existing tasks), `PATCH .../tasks/:taskId` (auto `LISTA_PARA_ENTREGA`) |

## Implementation plans

| ID | Backend | Android |
|----|---------|---------|
| US-M1 | `docs/plans/US-M1_backend.md` (**implemented**) | `docs/plans/US-M1_android.md` (**implemented**) |
| US-M2 | — | `docs/plans/US-M2_android.md` (**implemented**) |
| US-M3 | — | `docs/plans/US-M3_android.md` (**implemented**) |
| US-M4 | — (API exists) | `docs/plans/US-M4_android.md` (pending) |
| US-M5 | — (API exists) | `docs/plans/US-M5_android.md` (pending) |
| US-M6 | — (API exists) | `docs/plans/US-M6_android.md` (pending) |

Plans must use branch **`finalproject-RFM`** in Step 0 unless a later instruction says otherwise.
