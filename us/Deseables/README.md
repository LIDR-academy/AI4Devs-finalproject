# Deseables (V2) — User Stories

This folder contains the high-priority V2 desirable features documented in `readme.md` (§ Funcionalidades Deseables).

## Story List

| ID | File | Title |
|----|------|-------|
| US-D1 | `US-D1-registro-contacto-propietario.md` | Registro de Contacto al Propietario |
| US-D2 | `US-D2-notificacion-correo-propietario.md` | Notificación por Correo Electrónico al Propietario |
| US-D3 | `US-D3-transferencia-propietario-vehiculo.md` | Transferencia de Propietario de Vehículo |
| US-D4 | `US-D4-panel-recordatorios-mantenimiento.md` | Panel de Recordatorios de Mantenimiento Preventivo |
| US-D5 | `US-D5-busqueda-clientes-correo.md` | Búsqueda de Clientes por Correo Electrónico |
| US-D6 | `US-D6-edicion-usuarios-taller.md` | Edición de Usuarios del Taller |
| US-D7 | `US-D7-kilometraje-opcional-orden-trabajo.md` | Kilometraje Opcional en la Orden de Trabajo |
| US-D8 | `US-D8-administradores-capacidad-mecanico.md` | Administradores con Capacidad de Mecánico |
| US-D9 | `US-D9-ingreso-sin-propietario-mecanico-externo.md` | Ingreso sin Propietario (Vehículo Traído por Mecánico Externo) |
| US-D10 | `US-D10-ordenes-activas-dashboard.md` | Órdenes Activas en el Dashboard (Resumen + Lista en Curso) |

## Delivery branch (entrega 2)

All desirable implementation for this delivery happens on **`feature-entrega2-RFM`** (not per-US `feature/US-D*-backend` branches). Plans under `docs/plans/US-D*_backend.md` and `docs/plans/US-D*_frontend.md` must use that branch in Step 0.

## Implementation plans

For each story, implement **backend first**, then **frontend** (same branch):

| ID | Backend | Frontend |
|----|---------|----------|
| US-D1 | `docs/plans/US-D1_backend.md` | `docs/plans/US-D1_frontend.md` |
| US-D2 | `docs/plans/US-D2_backend.md` | `docs/plans/US-D2_frontend.md` |
| US-D3 | `docs/plans/US-D3_backend.md` | `docs/plans/US-D3_frontend.md` |
| US-D4 | `docs/plans/US-D4_backend.md` | `docs/plans/US-D4_frontend.md` |
| US-D5 | `docs/plans/US-D5_backend.md` | `docs/plans/US-D5_frontend.md` |
| US-D6 | `docs/plans/US-D6_backend.md` | `docs/plans/US-D6_frontend.md` |
| US-D7 | `docs/plans/US-D7_backend.md` | `docs/plans/US-D7_frontend.md` |
| US-D8 | `docs/plans/US-D8_backend.md` | `docs/plans/US-D8_frontend.md` |
| US-D9 | `docs/plans/US-D9_backend.md` | `docs/plans/US-D9_frontend.md` |
| US-D10 | `docs/plans/US-D10_backend.md` | `docs/plans/US-D10_frontend.md` |

## Suggested delivery order (business priority)

1. **US-D7** — Unblocks daily intake of stranded vehicles; touches create OT + delivery UX.
2. **US-D5** — Small search extension; helps D2/D4 contact flows.
3. **US-D6** — Independent admin UX improvement.
4. **US-D8** — Admin mechanic flag; extends user edit + OT assignee list (pairs well with D6).
5. **US-D1** — Extends delivery panel (depends on US-008).
6. **US-D2** — Builds on D1 + email provider.
7. **US-D3** — Ownership historicity (model may already exist from V1).
8. **US-D4** — Reminders panel + email (shares mail stack with D2); admin dashboard widget (~5) + Ver más (enriched 2026-08-13).
9. **US-D9** — Third-party intake without owner; nullable `ownerClientId` + `broughtBy*`; coordinates with D1/D3.
10. **US-D10** — Dashboard “Órdenes en curso” (max 5) + full in-progress list page; fills empty admin/mechanic home.

## Delivery status (snapshot)

| ID | Status (codebase) |
|----|-------------------|
| US-D1, D6, D7, D8, D9 | Implemented |
| US-D2, D3, D4, D5, D10 | Pending |

## Cross-cutting Dependencies

- **Email (D2, D4):** transactional mail provider (SendGrid, Mailgun, SES, or equivalent) behind a port/adapter.
- **Work order status (D1):** use `OWNER_CONTACTED` and contact audit fields reserved in US-008 / model.
- **Mileage nullability (D7):** migration on `WorkOrder.mileage`.
- **Admin-as-mechanic (D8):** `User.canActAsMechanic`; widen assignee eligibility beyond `role = MECHANIC`.
- **Ownerless intake (D9):** `WorkOrder.ownerClientId` nullable; `broughtByName` / `broughtByPhone`; vehicle create without `clientId`; D1 gated when no owner; does not silently transfer ownership (D3).
