# Frontend Implementation Plan: US-D10 In-Progress Work Orders (Dashboard + List)

## Overview

Fill empty admin/mechanic dashboards with an **“Órdenes en curso”** widget (max **5** rows) and add a full list page at **`/work-orders/in-progress`** plus nav link **“En curso”**. Data from **`GET /api/work-orders/in-progress`** (US-D10 backend).

**Architecture principles:** feature folder `work-orders`; React Query; reuse `WorkOrderStatusBadge` / `getWorkOrderStatusLabel`; Spanish UI; English code; Playwright smoke; no new npm deps; shell already `AppChrome` (US-F1).

**User story:** [`us/Deseables/US-D10-ordenes-activas-dashboard.md`](../../us/Deseables/US-D10-ordenes-activas-dashboard.md)

**Backend plan:** [`docs/plans/US-D10_backend.md`](./US-D10_backend.md)

**Prerequisites:** US-D10 **backend** available (`GET /api/work-orders/in-progress`). Do not mock the list in production UI. Implement on **`finalproject-RFM` only**.

**Out of scope:** KPIs/charts, kanban, advanced filters, changing delivery panel, redesign of OT detail, new UI libraries.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router |
| Server state | React Query |
| HTTP | `apiClient` via `workOrdersApi` |
| Styling | Tailwind + `cn` |
| E2E | Playwright |

### Gap today

- Dashboards: greeting only.
- No FE client for global in-progress list.
- Nav (`nav-items.ts`) has no “En curso”.

### API contract (consume as-is)

`GET /api/work-orders/in-progress?limit=&offset=`

```ts
{
  items: InProgressWorkOrderItem[];
  total: number;
  limit: number;
  offset: number;
}
```

Role filtering is **server-side** (admin = all; mechanic = assigned). FE does not re-filter by role.

### Files to add/modify

```
apps/web/src/features/work-orders/
├── types/work-order.types.ts                 # + InProgress* types
├── services/workOrdersApi.ts                 # + getInProgress()
├── hooks/useInProgressWorkOrders.ts          # NEW
├── components/InProgressWorkOrdersWidget.tsx # NEW
├── components/InProgressWorkOrdersPage.tsx   # NEW
├── components/InProgressWorkOrderRow.tsx     # NEW optional shared row
├── utils/workOrderStatusLabel.ts             # REUSE (already exists)
├── utils/mapWorkOrdersError.ts               # reuse for load errors
└── index.ts                                  # export page/widget if useful

apps/web/src/app/admin/dashboard/page.tsx     # MOD — mount widget
apps/web/src/app/mechanic/dashboard/page.tsx  # MOD — mount widget
apps/web/src/app/work-orders/in-progress/page.tsx  # NEW

apps/web/src/shared/components/nav-items.ts   # MOD — En curso

apps/web/e2e/work-orders-in-progress.spec.ts  # NEW
apps/web/playwright.config.ts                 # MOD — project (optional)
apps/web/README.md                            # MOD
```

### Routing

| Route | Access | Purpose |
|-------|--------|---------|
| `/admin/dashboard` | ADMIN | Widget `limit=5` |
| `/mechanic/dashboard` | MECHANIC | Widget `limit=5` |
| `/work-orders/in-progress` | ADMIN + MECHANIC | Full list, paginated |
| `/work-orders/[id]` | existing | Row target |

Page lives under existing `work-orders/layout.tsx` (`ProtectedRoute` ADMIN|MECHANIC + `AppChrome`).

### State management

- React Query key: `['work-orders', 'in-progress', { limit, offset }]`
- No global store; invalidate on OT create (optional nice-to-have: invalidate after create wizard success).

---

## Implementation Steps

### Step 0: Stay on `finalproject-RFM`

- **Action:** Do **not** create `feature/US-D10-frontend`.
- **Steps:** Confirm `git branch --show-current` → `finalproject-RFM`.
- **Notes:** Same mandate as US-F1 / US-D10 backend plan.

---

### Step 1: Types + API client

- **Files:** `types/work-order.types.ts`, `services/workOrdersApi.ts`
- **Action:** Mirror backend DTO in TypeScript.
- **Signatures:**

```ts
export type InProgressWorkOrderItem = {
  id: string;
  status: WorkOrderStatus;
  entryReason: string;
  checkedInAt: string;
  updatedAt: string;
  vehicle: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
  };
  owner: { fullName: string; nationalId: string } | null;
  broughtByName: string | null;
  intakeMode: 'OWNER' | 'THIRD_PARTY';
  assignedMechanic: AssignedMechanicSummary | null;
};

export type InProgressWorkOrdersResponse = {
  items: InProgressWorkOrderItem[];
  total: number;
  limit: number;
  offset: number;
};

// workOrdersApi
getInProgress(params?: { limit?: number; offset?: number }): Promise<InProgressWorkOrdersResponse>
```

- **Implementation Steps:**
  1. Build query string only for defined params (`limit`, `offset`).
  2. `apiClient<InProgressWorkOrdersResponse>(\`/work-orders/in-progress?...\`)`.
- **Notes:** Reuse existing `AssignedMechanicSummary` / `WorkOrderStatus` if present.

---

### Step 2: React Query hook

- **File:** `hooks/useInProgressWorkOrders.ts`
- **Signature:**

```ts
export function useInProgressWorkOrders(options: {
  limit: number;
  offset?: number;
  enabled?: boolean;
})
```

- **Implementation Steps:**
  1. `useQuery` with key including `limit`/`offset`.
  2. `queryFn` → `workOrdersApi.getInProgress`.
  3. Sensible `staleTime` (e.g. 15–30s) optional; default OK.
- **Dependencies:** `@tanstack/react-query`, `workOrdersApi`.

---

### Step 3: Shared row / owner display helper

- **File:** optional `InProgressWorkOrderRow.tsx` or inline in widget/page
- **Action:** Consistent row UI for widget and list.
- **Display rules (ES):**
  - Plate: `vehicle.licensePlate` (emphasis)
  - Vehicle: `{brand} {model}`
  - Status: `<WorkOrderStatusBadge status={...} />` (uses `getWorkOrderStatusLabel`)
  - Party: if `owner` → `owner.fullName`; else if `broughtByName` → `Traído por {broughtByName}`; else `Sin propietario`
  - Mechanic (show on admin list/widget): `assignedMechanic?.fullName ?? 'Sin asignar'`
  - Link: `href={`/work-orders/${id}`}` text **Ver** or whole-row click
- **Notes:** Keep layout simple — list/table, not cards-in-hero. Match existing slate/blue workshop UI.

---

### Step 4: Dashboard widget

- **File:** `components/InProgressWorkOrdersWidget.tsx`
- **Action:** Block for both dashboards.
- **Props:** none required (`limit` fixed at 5) or `limit?: number` default 5.
- **UI copy (locked):**

| State | UI |
|-------|-----|
| Loading | *Cargando órdenes…* |
| Error | *No se pudieron cargar las órdenes.* (+ optional retry button) |
| Empty (`total === 0`) | *No hay órdenes en curso.* + link **Nueva OT** → `/work-orders/new` |
| Data | Title **Órdenes en curso**; up to 5 rows; if `total > 0` show **Ver todas** → `/work-orders/in-progress` |

- **Implementation Steps:**
  1. `useInProgressWorkOrders({ limit: 5, offset: 0 })`.
  2. Render section with `rounded-xl border …` consistent with current dashboard card.
  3. Do not paginate inside widget.
- **Wire:**
  - `admin/dashboard/page.tsx` — keep welcome; add `<InProgressWorkOrdersWidget />` below.
  - `mechanic/dashboard/page.tsx` — same.

---

### Step 5: Full list page

- **Files:**
  - `components/InProgressWorkOrdersPage.tsx`
  - `app/work-orders/in-progress/page.tsx` → export page component
- **Action:** Title **Órdenes de trabajo en curso**; table/list; pagination.
- **Pagination:**
  - Page size `limit = 20`
  - Local state `offset` (or page index → `offset = page * 20`)
  - Show *Anterior* / *Siguiente* disabled at bounds; optional *Mostrando X–Y de total*
- **Implementation Steps:**
  1. Hook with `{ limit: 20, offset }`.
  2. Empty/error same copy as widget.
  3. Prefer showing mechanic column for everyone (mechanic sees mostly self — OK).
- **Notes:** No new layout file; inherit `work-orders/layout.tsx`.

---

### Step 6: Nav item “En curso”

- **File:** `nav-items.ts`
- **Action:** Insert after **Panel** on both roles:

```ts
{ href: '/work-orders/in-progress', label: 'En curso' },
```

- **Order (locked):**
  - ADMIN: Panel → **En curso** → Usuarios → Listos para entrega → …
  - MECHANIC: Panel → **En curso** → Clientes → …
- **Notes:** Drawer (US-F1) picks up items automatically via shared `nav-items`.

---

### Step 7: Playwright smoke

- **File:** `e2e/work-orders-in-progress.spec.ts`
- **Action:** Prefer **inline login** (same pattern as `mobile-nav.spec.ts`) to avoid storageState/throttle flakiness; or dedicated project with storageState if reliable.
- **Cases:**
  1. Admin login → `/admin/dashboard` → heading/text **Órdenes en curso** visible.
  2. If empty state: see *No hay órdenes en curso*; else see **Ver todas** → click → URL `/work-orders/in-progress` and H1 **Órdenes de trabajo en curso**.
  3. Nav link **En curso** visible (desktop or open hamburger on mobile — desktop enough).
- **Config:** Add `chromium-work-orders-in-progress` project **or** include in existing work-orders project `testMatch`. Keep throttle in mind (≤2 logins per run).
- **Notes:** Creating OT in e2e is optional; empty-state coverage is enough for MVP smoke if seed has no active OTs.

---

### Step 8: Update Technical Documentation

- **Action:** English notes.
- **Steps:**
  1. `apps/web/README.md` — routes table: `/work-orders/in-progress`; short “Dashboard in-progress widget (US-D10)”.
  2. Cross-link `docs/plans/US-D10_backend.md` if useful.
  3. No OpenAPI from FE (BE owns `api-spec.work-orders.yml`).
- **References:** `docs/documentation-standards.mdc`

---

## Implementation Order

1. Step 0 — `finalproject-RFM`
2. Step 1 — Types + `getInProgress`
3. Step 2 — Hook
4. Step 3 — Row/display helpers
5. Step 4 — Widget + dashboards
6. Step 5 — List page
7. Step 6 — Nav
8. Step 7 — Playwright
9. Step 8 — README

---

## Testing Checklist

- [ ] Admin dashboard: widget loads; empty vs populated
- [ ] Mechanic dashboard: only sees assigned (verify with BE data)
- [ ] `total > 5`: widget shows 5 + Ver todas
- [ ] Ver todas / nav → `/work-orders/in-progress`
- [ ] Pagination on list when `total > 20`
- [ ] Null owner / Traído por… renders without crash
- [ ] Mobile: nav item available via hamburger (US-F1)
- [ ] Playwright smoke green
- [ ] No new packages in `package.json`

---

## Error Handling Patterns

- Use `mapWorkOrdersError` or generic *No se pudieron cargar las órdenes.* for query failures.
- Do not toast-spam on dashboard load failure; inline alert is enough.
- 401 → existing `apiClient` session expiry redirect.

---

## UI/UX Considerations

- Keep welcome heading; widget is the operational content below.
- Reuse `WorkOrderStatusBadge` for status colors/labels (already ES).
- One job per section: dashboard widget = resumen; list page = inventario completo.
- Avoid card clutter; simple bordered section + table/list rows.
- Responsive: stack columns on narrow screens; plate first.

---

## Dependencies

| Dependency | Required? |
|------------|-----------|
| US-D10 backend endpoint | **Yes** |
| New npm packages | **No** |
| US-F1 AppChrome / nav-items | Already on branch |

---

## Notes

- Branch: **`finalproject-RFM` only**.
- UI Spanish / code English.
- Do not invent status labels — use `getWorkOrderStatusLabel`.
- Server enforces mechanic scope; FE must not call a different endpoint for roles.

---

## Next Steps After Implementation

1. Ensure BE `in-progress` is deployed/running on DEV.
2. `/develop-frontend` against this plan (no feature branch).
3. Manual smoke admin + mechanic.
4. Commit when user requests; prod rebuild **web** (and api if BE not yet live).

---

## Implementation Verification

- [ ] Types match BE contract
- [ ] Widget + page + nav complete AC
- [ ] Playwright smoke
- [ ] README updated
- [ ] Still on `finalproject-RFM`
