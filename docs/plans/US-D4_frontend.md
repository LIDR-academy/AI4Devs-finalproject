# Frontend Implementation Plan: US-D4 Maintenance Reminders (Dashboard + Panel)

## Overview

Add an **ADMIN-only** maintenance reminders experience:

1. **Dashboard widget** on `/admin/dashboard` — title **Recordatorios**, max **5** eligible vehicles, link **Ver más** → `/admin/reminders` (same pattern as US-D10 “Órdenes en curso”).
2. **Full panel** at `/admin/reminders` — eligible table with multi-select + batch send, opt-out/in exclusions tab, pagination (`limit`/`offset`).
3. **Nav** item **Recordatorios** in `ADMIN_NAV` via `nav-items.ts` (desktop + mobile drawer).

Data from **`GET /api/reminders/eligible`** and related send/opt endpoints (US-D4 backend).

**Architecture principles:** feature folder `reminders`; React Query; Spanish UI / English code; Playwright (not Cypress); no new npm deps; shell already `AppChrome` (US-F1); mirror D10 widget styling.

**User story:** [`us/Deseables/US-D4-panel-recordatorios-mantenimiento.md`](../../us/Deseables/US-D4-panel-recordatorios-mantenimiento.md)

**Backend plan:** [`docs/plans/US-D4_backend.md`](./US-D4_backend.md)

**Prerequisites:** US-D4 backend available (`/api/reminders/*`). Console/disabled email OK for send UI (summary statuses). Implement on **`finalproject-RFM` only**.

**Out of scope:** Mechanic dashboard widget; KPIs/charts; SMS; auto-send without confirm; template editor; `ReminderSendLog` UI; new UI libraries.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router |
| Server state | React Query |
| HTTP | `apiClient` via `remindersApi` |
| Styling | Tailwind + existing bordered sections |
| E2E | Playwright |

### Gap today

- Admin dashboard: welcome + D10 OT widget only — **no** reminders block.
- No `features/reminders` folder / API client.
- `ADMIN_NAV` has no **Recordatorios**.

### API contract (consume as-is)

`GET /api/reminders/eligible?limit=&offset=&days=&q=`

```ts
{
  items: EligibleReminderItem[];
  total: number;
  limit: number;
  offset: number;
  thresholdDays: number;
}
```

Also: `POST /reminders/send`, `POST /reminders/:id/opt-out|opt-in`, `GET /reminders/opted-out`.

### Files to add/modify

```
apps/web/src/features/reminders/
├── types/reminders.types.ts
├── services/remindersApi.ts
├── hooks/
│   ├── useEligibleReminders.ts
│   ├── useOptedOutReminders.ts
│   ├── useSendReminders.ts
│   ├── useReminderOptOut.ts
│   └── useReminderOptIn.ts
├── utils/
│   ├── mapRemindersError.ts
│   ├── mapReminderEmailStatus.ts
│   └── formatReminderDate.ts
├── components/
│   ├── RemindersDashboardWidget.tsx          # NEW — dashboard only
│   ├── RemindersPage.tsx
│   ├── EligibleRemindersTable.tsx
│   ├── OptedOutRemindersTable.tsx
│   ├── SendRemindersDialog.tsx
│   └── OptOutReminderDialog.tsx
└── index.ts                                  # optional exports

apps/web/src/app/admin/dashboard/page.tsx     # MOD — mount widget below D10
apps/web/src/app/admin/reminders/page.tsx     # NEW

apps/web/src/shared/components/nav-items.ts   # MOD — Recordatorios

apps/web/e2e/reminders.spec.ts                # NEW
apps/web/README.md                            # MOD
```

### Routing

| Route | Access | Purpose |
|-------|--------|---------|
| `/admin/dashboard` | ADMIN | Widget `limit=5` |
| `/admin/reminders` | ADMIN | Full panel |
| `/mechanic/dashboard` | MECHANIC | **No** reminders widget |

Inherits `admin/layout.tsx` (`ProtectedRoute` ADMIN + `AppChrome`).

### State management

| Concern | Approach |
|---------|----------|
| Eligible list | `useEligibleReminders({ limit, offset, q? })` — key `['reminders', 'eligible', params]` |
| Dashboard widget | Same hook with `{ limit: 5, offset: 0 }` |
| Opted-out | `useOptedOutReminders({ enabled })` — key `['reminders', 'opted-out']` |
| Send / opt | Mutations → invalidate eligible + opted-out (+ dashboard shares eligible key prefix) |
| Selection / tabs / dialogs | Local `useState` on `RemindersPage` only |

**Select-all:** visible page rows only — helper *“Selección de la lista visible”*.

---

## Implementation Steps

### Step 0: Stay on `finalproject-RFM`

- **Action:** Do **not** create `feature/US-D4-frontend`.
- **Steps:** `git branch --show-current` → `finalproject-RFM`.
- **Notes:** Same mandate as US-D10 / US-D4 backend. Older drafts mentioning `feature-entrega2-RFM` are obsolete.

---

### Step 1: Types

- **File:** `types/reminders.types.ts`
- **Action:** Mirror backend DTOs.

```ts
export type EligibleReminderItem = {
  vehicleId: string;
  licensePlate: string;
  vehicleLabel: string;
  ownerName: string;
  ownerEmail: string | null;
  ownerClientId: string;
  lastVisitAt: string;
  daysSinceVisit: number;
  lastReminderSentAt: string | null;
  canEmail: boolean;
};

export type EligibleRemindersResponse = {
  items: EligibleReminderItem[];
  total: number;
  limit: number;
  offset: number;
  thresholdDays: number;
};

export type ReminderEmailStatus =
  | 'sent'
  | 'skipped_no_email'
  | 'skipped_disabled'
  | 'skipped_not_eligible'
  | 'failed';

// + SendRemindersResponse, OptedOut*, ReminderOptResponse (as prior plan)
```

- **Notes:** Response **must** include `limit` / `offset` (updated BE contract).

---

### Step 2: API client — `remindersApi`

- **File:** `services/remindersApi.ts`
- **Signatures:**

```ts
export const remindersApi = {
  listEligible(params?: {
    limit?: number;
    offset?: number;
    days?: number;
    q?: string;
  }): Promise<EligibleRemindersResponse>;
  listOptedOut(): Promise<OptedOutRemindersResponse>;
  sendReminders(vehicleIds: string[]): Promise<SendRemindersResponse>;
  optOut(vehicleId: string): Promise<ReminderOptResponse>;
  optIn(vehicleId: string): Promise<ReminderOptResponse>;
};
```

- **Steps:**
  1. Build query string only for defined params (`limit`, `offset`, `days`, `q`).
  2. Paths relative to `/api` base via `apiClient` (same as `workOrdersApi` / `deliveryApi`).

---

### Step 3: React Query hooks

- **`useEligibleReminders`**

```ts
export function useEligibleReminders(options: {
  limit: number;
  offset?: number;
  days?: number;
  q?: string;
  enabled?: boolean;
})
```

  - Key: `['reminders', 'eligible', { limit, offset, days, q }]`
  - Widget: `{ limit: 5, offset: 0 }`
  - Full page: `{ limit: 50, offset }` (local page state)

- **`useOptedOutReminders({ enabled })`**, **`useSendReminders`**, **`useReminderOptOut`**, **`useReminderOptIn`**
  - Mutations invalidate `['reminders', 'eligible']` and `['reminders', 'opted-out']` (prefix invalidate so dashboard widget refreshes after send/opt).

---

### Step 4: Error + status + date helpers

- **Files:** `mapRemindersError.ts`, `mapReminderEmailStatus.ts`, `formatReminderDate.ts`
- **Spanish mappings (locked):**

| Condition | Copy |
|-----------|------|
| Load fail (widget) | *No se pudieron cargar los recordatorios.* |
| Load fail (page) | via `mapRemindersError` |
| `403` | *No tienes permiso para acceder a recordatorios.* |
| `sent` | *Enviado* |
| `skipped_no_email` | *Omitido — sin correo* |
| `skipped_disabled` | *Omitido — correo deshabilitado* |
| `skipped_not_eligible` | *Omitido — ya no elegible* |
| `failed` | *Error al enviar* |

- Dates: `es-CR` medium; `lastReminderSentAt` null → *—*.

---

### Step 5: Dashboard widget — `RemindersDashboardWidget`

- **File:** `components/RemindersDashboardWidget.tsx`
- **Action:** Read-only summary for admin dashboard (pattern: `InProgressWorkOrdersWidget`).
- **Props:** `limit?: number` default **5**.
- **UI copy (locked):**

| State | UI |
|-------|-----|
| Loading | *Cargando recordatorios…* |
| Error | *No se pudieron cargar los recordatorios.* + **Reintentar** |
| Empty (`total === 0`) | *No hay vehículos pendientes de recordatorio.* (no Ver más required) |
| Data | Title **Recordatorios**; up to 5 rows; if `total > 0` show **Ver más** → `/admin/reminders` |

- **Row columns (compact):** Placa · Vehículo (`vehicleLabel`) · Días sin visita · optional *Sin correo* when `!canEmail`.
- **No** checkboxes, send, or opt-out on the widget.
- **Optional:** plate links to `/vehicles/[vehicleId]` (nice-to-have).
- **Wire:** `admin/dashboard/page.tsx` — keep welcome + `<InProgressWorkOrdersWidget />`; add `<RemindersDashboardWidget />` **below** OT widget.
- **Do not** mount on mechanic dashboard.

---

### Step 6: Eligible / opted-out tables

- **`EligibleRemindersTable`:** columns per US (checkbox, placa, modelo, propietario, correo, última visita, días, último recordatorio, acción **No volver a recordar**).
  - `!canEmail`: still selectable; show *Sin correo*.
  - Select-all = visible page only.
- **`OptedOutRemindersTable`:** placa, modelo, propietario, excluido el, excluido por, **Reactivar**.
- Match `DeliveryReadyTable` / D10 table styling (`rounded-xl border`, `thead bg-slate-50`).

---

### Step 7: Dialogs — send + opt-out

- **`SendRemindersDialog`:** two-step confirm → summary.
  - Confirm: *“Se intentará enviar recordatorio a {N} vehículo(s). {M} sin correo se omitirán automáticamente.”*
  - HTTP 200 with mixed results → always summary step (not error).
- **`OptOutReminderDialog`:** confirm *No volver a recordar* for plate; toast on success.

---

### Step 8: Full page — `RemindersPage` + route

- **Files:** `RemindersPage.tsx`, `app/admin/reminders/page.tsx`
- **H1:** **Recordatorios de mantenimiento**
- **Subtitle:** use `thresholdDays` — *“Vehículos con más de {thresholdDays} días sin visita entregada”*
- **Tabs:** *Elegibles* | *Exclusiones* (segmented control, no new lib)
- **Toolbar:** **Actualizar**; **Enviar recordatorio** disabled if selection empty; optional debounced `q`
- **Pagination:** `limit = 50`; *Anterior* / *Siguiente*; *Mostrando X–Y de total* when `total > 50`
- **Empty elegibles:** *No hay vehículos pendientes de recordatorio.*
- **Empty exclusions:** *No hay vehículos excluidos.*
- Metadata title: `Recordatorios — MecaTrack`

---

### Step 9: Nav — **Recordatorios**

- **File:** `nav-items.ts` (not only `RoleNav` — drawer reads shared list)
- **Action:** Insert after **En curso**:

```ts
{ href: '/admin/reminders', label: 'Recordatorios' },
```

- **Order (locked) ADMIN:** Panel → En curso → **Recordatorios** → Usuarios → Listos para entrega → …
- **MECHANIC_NAV:** unchanged (no reminders link).

---

### Step 10: Playwright smoke

- **File:** `e2e/reminders.spec.ts`
- **Prefer inline login** (throttle-safe; same idea as D10 / mobile-nav).
- **Cases (minimum):**
  1. Admin → `/admin/dashboard` → heading/text **Recordatorios** visible.
  2. Empty: *No hay vehículos pendientes de recordatorio.*; else **Ver más** → URL `/admin/reminders` and H1 **Recordatorios de mantenimiento**.
  3. Nav **Recordatorios** visible (desktop enough).
  4. If seed has eligibles: select → open send dialog → confirm text; or opt-out smoke (optional if data-dependent).
  5. Mechanic → `/admin/reminders` → blocked (`/403` or redirect) — optional one case.
- **Notes:** CI may get `skipped_disabled` on send — assert summary UI, not SMTP. Keep ≤2 logins per run if throttle applies.

---

### Step 11: Update Technical Documentation

- **Action:** English notes in `apps/web/README.md`.
- **Steps:**
  1. Routes: `/admin/reminders`; dashboard widget US-D4.
  2. Note ADMIN-only; React Query keys `['reminders', ...]`.
  3. Cross-link backend plan; no OpenAPI from FE.
- **References:** `docs/documentation-standards.mdc`

---

## Implementation Order

1. Step 0 — `finalproject-RFM`
2. Step 1 — Types (+ `limit`/`offset` on response)
3. Step 2 — `remindersApi`
4. Step 3 — Hooks
5. Step 4 — Mappers / dates
6. Step 5 — Dashboard widget + admin dashboard mount
7. Step 6 — Tables
8. Step 7 — Dialogs
9. Step 8 — Full page + route
10. Step 9 — Nav
11. Step 10 — Playwright
12. Step 11 — README

---

## Testing Checklist

- [ ] Admin dashboard: widget below OT; empty vs populated; **Ver más** when `total > 0`
- [ ] `total > 5`: widget shows ≤5 rows + Ver más
- [ ] Mechanic dashboard: **no** reminders widget
- [ ] `/admin/reminders`: columns, select, send confirm/summary, opt-out/in
- [ ] Pagination when `total > 50`
- [ ] Rows without email: *Sin correo*, selectable → skipped in summary
- [ ] Nav **Recordatorios** in desktop + hamburger (US-F1)
- [ ] After send/opt, dashboard widget refetches (shared query invalidation)
- [ ] Playwright smoke green
- [ ] No new packages in `package.json`

---

## Error Handling Patterns

- Widget: inline alert + Reintentar (do not toast-spam on dashboard load).
- Page: banner via `mapRemindersError`.
- Send 200 mixed → summary step; map statuses to Spanish labels (never raw English `warning` as primary copy).
- 401 → existing `apiClient` session handling.

---

## UI/UX Considerations

- Match D10 section: `rounded-xl border border-slate-200 bg-white p-6 shadow-sm`.
- One job per block: widget = resumen; page = campaña completa.
- No send actions on dashboard.
- Responsive: `overflow-x-auto` tables; plate first.
- Accessibility: checkbox `aria-label`, dialog roles, *Sin correo* as text not color-only.
- No auto-send on load.

---

## Dependencies

| Dependency | Required? |
|------------|-----------|
| US-D4 backend `/reminders/*` | **Yes** |
| EmailPort (console/disabled OK) | For send statuses |
| US-D10 widget / AppChrome / nav-items | Already on branch |
| New npm packages | **No** |

---

## Notes

- Branch: **`finalproject-RFM` only**.
- UI Spanish / code English.
- Owner fields come from API (active ownership) — no FE D3 special case.
- `EMAIL_ENABLED=false` → `skipped_disabled` in summary is success path for UI.
- Widget link copy is **Ver más** (US); D10 uses **Ver todas** — keep as specified per product.
- Completing FE does not implement EmailPort — that is backend Step 1 / US-D2.

---

## Next Steps After Implementation

1. Ensure BE reminders API running on DEV.
2. `/develop-frontend` against this plan (no feature branch).
3. Manual smoke: dashboard → Ver más → send (console) → opt-out.
4. Commit when user requests; prod rebuild **web** (and api if BE not live).

---

## Implementation Verification

- [ ] Types match BE (incl. pagination fields)
- [ ] Widget + full panel + nav complete AC
- [ ] Playwright smoke
- [ ] README updated
- [ ] Still on `finalproject-RFM`
- [ ] Mechanic surfaces unchanged for reminders
