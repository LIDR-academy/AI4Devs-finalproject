# MecaTrack Web

Next.js frontend for MecaTrack (US-001: authentication, US-002: user management, US-003: client registration, US-004: vehicle registration, US-005: work order creation, US-006: work order task management, US-007: technical notes, US-008: delivery panel, US-009: vehicle and client history).

## Prerequisites

- Node.js 20+
- US-001 backend running at `http://localhost:4000`

## Environment

Copy `.env.local.example` to `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

API requests are proxied to the backend via `src/app/api/[...path]/route.ts` so refresh cookies work same-origin on port 3000.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Seed users (via API)

| Email | Password | Role |
|-------|----------|------|
| `admin@taller.com` | `AdminPass123` | ADMIN |
| `mechanic@taller.com` | `MechanicPass123` | MECHANIC |
| `inactive@taller.com` | `InactivePass123` | MECHANIC (inactive) |

## Auth flow

1. User submits login form → `POST /api/auth/login`
2. Access token stored **in memory**; refresh token in `httpOnly` cookie
3. On app load, `AuthProvider` calls `POST /api/auth/refresh` then `GET /api/auth/me`
4. On API `401`, `apiClient` retries once after refresh; failure → `/login?session=expired`
5. Logout → `POST /api/auth/logout` and clear local session

## Responsive navigation (US-F1)

Authenticated layouts use `AppChrome` (`AppHeader` + `RoleNav` + `MobileNavDrawer`):

- **`< md` (768px):** hamburger in the header opens a left drawer with the same role links; the horizontal strip is hidden (avoids nav horizontal scroll).
- **`≥ md`:** existing horizontal role tabs; hamburger and drawer are hidden.
- Implemented with React state + Tailwind only (no new UI dependencies).
- Playwright smoke: `e2e/mobile-nav.spec.ts`.
- Project overview (English): [`docs/responsive-navigation.md`](../../docs/responsive-navigation.md).

## Dashboard in-progress work orders (US-D10)

Authenticated dashboards (`/admin/dashboard`, `/mechanic/dashboard`) show an **Órdenes en curso** widget (max 5 rows) fed by `GET /api/work-orders/in-progress`. **Ver todas** and nav **En curso** open `/work-orders/in-progress` (paginated list). Mechanics only receive OTs assigned to them (enforced by the API).

Playwright smoke: `e2e/work-orders-in-progress.spec.ts`.

## Maintenance reminders (US-D4)

Admin dashboard shows a **Recordatorios** widget (max 5 eligible vehicles) from `GET /api/reminders/eligible?limit=5`. **Ver más** and nav **Recordatorios** open `/admin/reminders` (eligible list, batch send, opt-out/in). ADMIN only — not shown on the mechanic dashboard.

Playwright smoke: `e2e/reminders.spec.ts`.

## E2E tests

Requires API + database running:

```bash
# Terminal 1 — API
cd ../api && npm run dev

# Terminal 2 — Web + Playwright
npm run test:e2e
```

## Routes

| Route | Access |
|-------|--------|
| `/login` | Public |
| `/admin/dashboard` | ADMIN |
| `/admin/users` | ADMIN |
| `/admin/delivery` | ADMIN |
| `/clients` | ADMIN, MECHANIC |
| `/clients/new` | ADMIN, MECHANIC |
| `/clients/[id]` | ADMIN, MECHANIC |
| `/clients/[id]/edit` | ADMIN, MECHANIC |
| `/vehicles` | ADMIN, MECHANIC |
| `/vehicles/new` | ADMIN, MECHANIC (`?clientId=` prefill) |
| `/vehicles/[id]` | ADMIN, MECHANIC |
| `/work-orders/new` | ADMIN, MECHANIC (`?vehicleId=` prefill) |
| `/work-orders/in-progress` | ADMIN, MECHANIC (active OT list, US-D10) |
| `/admin/reminders` | ADMIN (maintenance reminders panel, US-D4) |
| `/work-orders/[id]` | ADMIN, MECHANIC (full task management detail) |
| `/mechanic/dashboard` | MECHANIC |
| `/403` | Forbidden |

## User management (US-002)

- **Route:** `/admin/users` (admin only; nav link **Usuarios** in admin layout)
- **Features:** list users, create employee (modal), **edit** (modal), soft-deactivate with confirmation
- **US-D6 edit:** `EditUserDialog` — `fullName`, `email`, `role`, optional password reset; confirmation when role/password changes (closes refresh sessions). Inactive rows have no Editar.
- **US-D8:** when role is Administrador, checkbox *También puede realizar trabajo de mecánico* on create **and** edit; list badge **Admin · Mecánico** when flag is true.
- **React Query keys:** `['users']` (invalidated after create/update/deactivate)
- **Requires:** US-002 / US-D6 / US-D8 backend (`GET/POST /api/users`, `PATCH /api/users/:id`, `PATCH /api/users/:id/deactivate`)

Mechanics do not see the Usuarios link and are redirected to `/403` if they open `/admin/users` directly.

## Client management (US-003)

- **Routes:** `/clients` (search hub), `/clients/new` (registration form), `/clients/[id]/edit` (edit form)
- **Access:** `ADMIN` and `MECHANIC` (shared routes outside role-specific layouts)
- **Nav:** **Clientes** link in admin and mechanic layouts
- **Features:** debounced search (300 ms), duplicate detection on national ID blur/submit, edit contact data (`nationalId` read-only), post-create link to `/vehicles/new?clientId=`
- **React Query keys:** `['clients', 'search', q]`, `['clients', id]` (invalidated after create/update)
- **409 handling:** `apiClient` attaches `existingClient` on conflict; UI shows `ExistingClientAlert`
- **Reusable export:** `ClientSearchBar` from `@/features/clients` (for US-004 `ClientPicker`)
- **Requires:** US-003 backend (`GET/POST /api/clients`, `GET /api/clients/search`, `PATCH /api/clients/:id`)

## Vehicle management (US-004)

- **Routes:** `/vehicles` (search hub), `/vehicles/new` (registration form), `/vehicles/[id]` (detail + visit history), `/vehicles/[id]/edit` (edit form)
- **Access:** `ADMIN` and `MECHANIC` (shared routes outside role-specific layouts)
- **Nav:** **Vehículos** link in admin and mechanic nav (`RoleNav`)
- **Query params:** `?clientId=` on `/vehicles/new` pre-fills read-only owner from US-003; success/detail CTAs link to `/work-orders/new?vehicleId=` (US-005)
- **Features:** debounced plate search (300 ms), embedded `ClientPicker` (reuses `ClientSearchBar` from US-003), duplicate plate detection on blur/submit, plate normalization to uppercase, **edit vehicle** (incl. plate correction), **delete vehicle** if no work orders
- **Ownerless registration (US-D9):** toggle **Registrar sin propietario** omits `clientId`; lists/detail show *Sin propietario*; can still open **Nueva OT**
- **React Query keys:** `['vehicles', 'search', q]`, `['vehicles', id]`, `['vehicles', id, 'history']` (invalidated after create)
- **409 handling:** `apiClient` attaches `existingVehicle` on conflict; UI shows `ExistingVehicleAlert`
- **Requires:** US-004 backend (`GET/POST/PATCH/DELETE /api/vehicles`, `GET /api/vehicles/search`, `GET /api/vehicles/:id/history`); US-D9 optional `clientId`

## Work order management (US-005)

- **Routes:** `/work-orders/new` (vehicle intake wizard), `/work-orders/[id]` (detail with task management)
- **Access:** `ADMIN` and `MECHANIC` (shared layout with `RoleNav`)
- **Nav:** **Nueva OT** link in admin and mechanic nav
- **Query params:** `?vehicleId=` on `/work-orders/new` pre-fills vehicle from US-004; vehicle create success links to `/work-orders/new?vehicleId=`
- **Wizard flow:** Step 1 — search/select vehicle (reuses `VehicleSearchBar`); Step 2 — entry reason, optional mileage (`null` when empty), optional mechanic, dynamic initial tasks (`useFieldArray`)
- **Intake mode (US-D9):** radios **Dueño / cliente** | **Traído por tercero**; third-party requires bringer name (phone optional); detail shows *Traído por…* and **Asociar propietario** via `LinkOwnerDialog` when `ownerClientId` is null
- **Assignable mechanics (US-D8):** `MechanicSelect` lists active mechanics and admins with `canActAsMechanic`, suffix `(Admin)` on admin options; detail header uses `assignedMechanic` from the API (not a client-side mechanics-list lookup)
- **Mileage (US-D7):** optional on create; edit from detail via `UpdateMileageDialog`; display *Sin registrar* when null (`formatMileage`); **lower-than-previous confirm** before create/update/deliver when new km < baseline (last visit / current WO)
- **Active WO guard:** `useActiveWorkOrder` shows `ActiveWorkOrderBanner` and disables form; vehicle detail shows **Ver orden activa** instead of **Nueva orden de trabajo**
- **React Query keys:** `['work-orders', 'mechanics']`, `['work-orders', 'active', vehicleId]`, `['work-orders', id]`; on create invalidates `['vehicles', vehicleId, 'history']` and `['work-orders', 'active', vehicleId]`
- **409 handling:** `activeWorkOrderId` in API error body; UI shows banner with link to existing work order
- **Requires:** US-005 backend (`GET/POST /api/work-orders`, `GET /api/work-orders/mechanics`, `GET /api/work-orders/active`, `GET /api/work-orders/:id`); US-D9 `intakeMode` / `broughtBy*` / `PATCH .../link-owner`

## Work order task management (US-006)

- **Route:** `/work-orders/[id]` — interactive detail when `EN_PROCESO`; read-only when `LISTA_PARA_ENTREGA` or `ENTREGADA`
- **Features:** add tasks, start (`PENDING` → `IN_PROGRESS`), complete with cost modal, live `totalAmount` in header, auto **Lista para entrega** banner when all tasks done
- **Task state machine:** `PENDING` → `IN_PROGRESS` | `COMPLETED` (shortcut); `IN_PROGRESS` → `COMPLETED`; `COMPLETED` is read-only
- **Currency:** `formatCurrency` displays CRC (`es-CR`, no decimals)
- **React Query:** `useAddTask` invalidates detail; `useUpdateTask` merges PATCH response (`task` + `workOrder`) into `['work-orders', id]` cache
- **Read-only modes:** no add/complete actions when OT is not `EN_PROCESO`; `403`/`409` trigger refetch
- **Requires:** US-006 backend (`POST/PATCH /api/work-orders/:id/tasks`)

## Technical notes (US-007)

- **Surfaces:** `/work-orders/[id]` (per-task + visit-level notes), `/vehicles/[id]#historial` (read-only)
- **Fields:** diagnosis, repair, parts, additional notes (task); visit diagnosis/summary/parts/notes (work order)
- **Edit rules:** task notes editable when OT `EN_PROCESO` and task not `COMPLETED`; visit notes editable only when OT `EN_PROCESO`
- **Save UX:** explicit **Guardar notas** / **Guardar notas de visita** (no autosave in MVP); toast on success
- **Empty state:** *Sin registro* for read-only empty fields; saving empty clears to `null`
- **Validation:** max 5000 characters per field with live counter (`TechnicalNotesField`)
- **React Query:** `useTaskTechnicalNotes`, `useVisitNotes` merge PATCH responses into `['work-orders', id]`
- **History:** `VehicleVisitTechnicalDetails` expandable **Detalle técnico** on visit cards (US-009 prep)
- **Requires:** US-007 backend (`PATCH .../technical-notes`, `PATCH .../visit-notes`, enriched `GET` history)

## Delivery panel (US-008 + US-D1)

- **Route:** `/admin/delivery` (admin only; nav link **Listos para entrega** in admin layout)
- **Features:** table of ready OTs (`LISTA_PARA_ENTREGA` + `OWNER_CONTACTED`) with **Teléfono** and **Estado** columns; expandable billing detail; mark delivered; optional mileage at deliver (US-D7)
- **Ownerless visits (US-D9):** list/detail show *Sin propietario* and *Traído por…*; **Marcar propietario contactado** hidden when there is no owner; deliver still allowed
- **US-D1 contact:** **Marcar propietario contactado** (confirm dialog) → badge *Propietario contactado*; audit who/when; filters *Todos / Pendiente de contacto / Contactados*; deliver still works from either status
- **Phone column:** `tel:` link when owner has phone (`ownerPhoneDisplay` e.g. `8888-7777`); *Sin teléfono* when null (snapshot from check-in, not live client record)
- **Refresh:** **Actualizar** button; optional **Actualizar automáticamente** checkbox enables 60s polling (no WebSockets in MVP)
- **React Query keys:** `['delivery', 'ready']`, `['delivery', 'ready', workOrderId]`; contact/deliver invalidate ready list (+ vehicles/work-orders on deliver)
- **Requires:** US-008 / US-D1 backend (`GET/PATCH /api/delivery/ready`, `PATCH .../mark-contacted`)

Mechanics do not see the **Listos para entrega** link and are redirected to `/403` if they open `/admin/delivery` directly.

## History (US-009)

- **Routes:** `/vehicles/[id]` (full visit timeline at `#historial`), `/clients/[id]` (client profile + active vehicles)
- **Entry flows:** `/vehicles` search → **Ver ficha**; `/clients` search → **Ver cliente**; client profile → **Ver historial** → `/vehicles/[id]#historial`
- **Read-only:** timeline shows tasks, technical notes, amounts, and `ownerAtVisit` snapshots — no edit forms in history views
- **D3:** visit cards show owner-at-visit; note when it differs from current vehicle owner
- **Actions:** **Continuar OT** only for `EN_PROCESO`; **Ver OT** for closed visits
- **React Query keys:** `['vehicles', id, 'history']`, `['clients', id, 'profile']`
- **Requires:** US-009 backend (enriched `GET /vehicles/:id/history`, extended `GET /clients/:id`)

Optional nav **Buscar historial** deferred — reuse existing search pages.
