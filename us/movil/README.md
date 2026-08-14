# Mobile (Android) — User Stories

Native Android client for MecaTrack that **reuses the existing REST API**. No duplicated workshop business logic.

**Refinement:** `/enrich-us` 2026-08-14 (local). No Jira MCP in this environment — stories live only as markdown (`[original]` + `[enhanced]`). Equivalent of “Pending refinement validation”.

**Spike leftover:** none for the native epic (US-M1–M3 implemented from plans).

## SDD order (native)

1. Enrich stories (done this folder).
2. **US-M1 backend** — `docs/plans/US-M1_backend.md` (**implemented** 2026-08-14).
3. **US-M1 Android** — `docs/plans/US-M1_android.md` (**implemented** 2026-08-14).
4. **US-M2 Android** — `docs/plans/US-M2_android.md` (**implemented** 2026-08-14).
5. **US-M3 Android** — `docs/plans/US-M3_android.md` (**implemented** 2026-08-14).

Native epic complete unless product adds another story.

## Story list

| ID | File | Title | Refinement |
|----|------|-------|------------|
| US-M1 | `US-M1-autenticacion-android.md` | Inicio de sesión en Android (misma API) | Enhanced 2026-08-14 |
| US-M2 | `US-M2-ordenes-en-curso-android.md` | Órdenes en curso en el teléfono | Enhanced 2026-08-14 |
| US-M3 | `US-M3-ingreso-ot-cliente-vehiculo-android.md` | Crear OT aunque el vehículo no exista | Enhanced 2026-08-14 |

## Product intent

- Same NestJS API as `apps/web`.
- Mechanic/admin on **Android**.
- Work-order intake must work when the plate is unknown: register **client + vehicle** in the same flow.

## Out of scope for this epic

- iOS, PWA, Capacitor
- US-006 tasks, US-007 notes, US-008 delivery, US-009 history
- US-002 user admin
- Push notifications

## Dependencies

| Story | Depends on |
|-------|------------|
| US-M1 | US-001, US-012, US-014. API delta: native refresh. |
| US-M2 | US-M1 DoD, US-D10 `GET /api/work-orders/in-progress` |
| US-M3 | US-M1, US-M2, US-003, US-004, US-005, US-D7, US-D8, US-D9 |

## Implementation plans

| ID | Backend | Android |
|----|---------|---------|
| US-M1 | `docs/plans/US-M1_backend.md` (**implemented**) | `docs/plans/US-M1_android.md` (**implemented**) |
| US-M2 | — | `docs/plans/US-M2_android.md` (**implemented**) |
| US-M3 | — | `docs/plans/US-M3_android.md` (**implemented**) |

Plans must use branch **`finalproject-RFM`** in Step 0 unless a later instruction says otherwise.
