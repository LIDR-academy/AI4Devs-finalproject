# Frontend Implementation Plan: US-D1 Owner Contact Registration

## Overview

Extend the **admin delivery panel** (`/admin/delivery`) so administrators can **mark owner contacted**, see a status badge distinguishing *Lista para entrega* vs *Propietario contactado*, view contact audit (who / when), keep contacted vehicles on the panel until delivery, and still **mark as delivered** from either status. Client-side filter *Todos / Pendientes / Contactados* covers list segmentation without requiring a backend `contactFilter` query.

**Architecture principles:** extend feature folder `delivery-panel`; React Query mutations + list invalidation; reuse `getWorkOrderStatusLabel` / `WorkOrderStatusBadge`; Spanish UI; Playwright e2e (project standard, not Cypress).

**User story reference:** [`us/Deseables/US-D1-registro-contacto-propietario.md`](../../us/Deseables/US-D1-registro-contacto-propietario.md)

**Backend plan:** [`docs/plans/US-D1_backend.md`](./US-D1_backend.md) — implement or merge API first (mark-contacted + list fields).

**Prerequisites:** US-008 frontend panel; US-D1 backend responses available.

**Out of scope:** Email toast/send (US-D2), mechanic access, WebSockets, reversing contact status.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router |
| Server state | React Query (`@tanstack/react-query`) |
| Styling | Tailwind CSS |
| HTTP | `apiClient` |
| E2E | Playwright (`apps/web/e2e`) |

### Files to add/modify

```
apps/web/src/features/delivery-panel/
├── types/delivery.types.ts                 # + status, ownerContacted*, MarkContactedResponse
├── services/deliveryApi.ts                 # markContacted()
├── hooks/useMarkContacted.ts               # NEW
├── utils/mapDeliveryError.ts               # map contact 409 messages
├── components/
│   ├── DeliveryPanelPage.tsx               # filter state, contact success toast
│   ├── DeliveryReadyTable.tsx              # status column, filter input, onMarkContacted
│   ├── DeliveryReadyDetail.tsx             # contact button + audit; remove D1 placeholder
│   ├── MarkContactedDialog.tsx             # NEW (optional confirm)
│   └── ContactStatusBadge.tsx              # NEW or reuse WorkOrderStatusBadge
└── (existing MarkDeliveredDialog unchanged in behavior)

apps/web/src/features/work-orders/
├── utils/workOrderStatusLabel.ts           # already has OWNER_CONTACTED
└── components/WorkOrderStatusBadge.tsx     # reuse if styles OK

apps/web/e2e/
└── delivery-panel.spec.ts                  # extend contact → still listed → deliver

apps/web/README.md                          # D1 no longer “reserved”
```

### Routing

| Route | Access | Change |
|-------|--------|--------|
| `/admin/delivery` | `ADMIN` only | Same route; new UX inside panel |

No new pages.

### State management

| Concern | Approach |
|---------|----------|
| List | Existing `useDeliveryReadyList` — key `['delivery', 'ready']` |
| Detail | Existing `useDeliveryReadyDetail` |
| Contact | `useMarkContacted` mutation → invalidate `['delivery', 'ready']` (+ detail key) |
| Deliver | Existing `useMarkDelivered` (works for contacted WOs once backend widened) |
| Contact filter | Local `useState<'all' \| 'pending' \| 'contacted'>` — filter **client-side** |
| Confirm contact | Local state for dialog target `DeliveryReadyItem \| null` |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Action:** Implement on the existing delivery branch (do **not** create `feature/US-D1-frontend`).
- **Branch (required):** `feature-entrega2-RFM`
- **Implementation Steps:**
  1. `git checkout feature-entrega2-RFM`
  2. `git pull origin feature-entrega2-RFM` if needed
  3. Verify `git branch --show-current` → `feature-entrega2-RFM`
  4. Ensure US-D1 backend (or mock-compatible contract) is available on this branch before wiring UI
- **Notes:** Entrega 2 aggregates deseables on one branch; see `us/Deseables/README.md`.

---

### Step 1: Extend Types

- **File:** `apps/web/src/features/delivery-panel/types/delivery.types.ts`
- **Action:** Align types with US-D1 backend list/detail/mark-contacted responses.
- **Implementation Steps:**
  1. Add to `DeliveryReadyItem`:

```typescript
status: 'LISTA_PARA_ENTREGA' | 'OWNER_CONTACTED' | string;
ownerContactedAt: string | null;
ownerContactedBy: { id: string; fullName: string } | null;
```

  2. Ensure `DeliveryReadyDetail` includes the same contact fields (status already present).
  3. Add:

```typescript
export interface MarkContactedResponse {
  workOrderId: string;
  status: string;
  ownerContactedAt: string;
  ownerContactedBy: { id: string; fullName: string };
}
```

  4. Keep `mileage` typing compatible with future US-D7 (`number | null` if backend already nullable; otherwise leave as today).
- **Dependencies:** None.
- **Implementation Notes:** Treat missing `status` from old mocks as `LISTA_PARA_ENTREGA` only during transition; production API must send `status`.

---

### Step 2: API Service — `markContacted`

- **File:** `apps/web/src/features/delivery-panel/services/deliveryApi.ts`
- **Action:** Call backend mark-contacted endpoint.
- **Function Signature:**

```typescript
markContacted(workOrderId: string): Promise<MarkContactedResponse>
```

- **Implementation Steps:**
  1. `PATCH /delivery/ready/${workOrderId}/mark-contacted` via `apiClient` (no body).
  2. Export alongside existing `listReady` / `getReadyDetail` / `markDelivered`.
- **Dependencies:** `MarkContactedResponse` type.
- **Implementation Notes:** Path must match backend: `/delivery/ready/:id/mark-contacted`.

---

### Step 3: Hook `useMarkContacted`

- **File:** `apps/web/src/features/delivery-panel/hooks/useMarkContacted.ts` (new)
- **Action:** Mutation with cache invalidation.
- **Function Signature:**

```typescript
export function useMarkContacted()
```

- **Implementation Steps:**
  1. `useMutation({ mutationFn: deliveryApi.markContacted })`.
  2. `onSuccess`: invalidate `['delivery', 'ready']` and detail keys `['delivery', 'ready', workOrderId]`.
  3. Do **not** remove the row from the list (unlike deliver).
- **Dependencies:** `@tanstack/react-query`, `deliveryApi`.
- **Implementation Notes:** Mirror structure of `useMarkDelivered.ts`.

---

### Step 4: Error Mapping

- **File:** `apps/web/src/features/delivery-panel/utils/mapDeliveryError.ts`
- **Action:** Distinguish contact vs deliver conflicts.
- **Implementation Steps:**
  1. For `409`, inspect `error.message` (English from API):
     - `Owner already contacted` → *“El propietario ya fue marcado como contactado”*
     - `Work order is not ready for contact` → *“Esta orden no está lista para marcar contacto”*
     - `Work order is already delivered` / default deliver → keep *“Esta orden ya fue entregada”*
     - `Work order is not ready for delivery` → *“Esta orden no está lista para entrega”*
  2. Optional helper `mapMarkContactedError` if cleaner than one fat switch.
- **Dependencies:** `ApiError`.
- **Implementation Notes:** Avoid mapping all 409 to “ya fue entregada” once contact exists.

---

### Step 5: Status Badge in Table

- **Files:** `DeliveryReadyTable.tsx`, optionally thin wrapper reusing `WorkOrderStatusBadge`
- **Action:** Show contact state without expanding the row.
- **Implementation Steps:**
  1. Add column **Estado** (after Propietario or before Acciones).
  2. Render label via `getWorkOrderStatusLabel(item.status as WorkOrderStatus)` or badge component.
  3. Visual distinction: contacted badge already purple in `WorkOrderStatusBadge`.
- **Dependencies:** `@/features/work-orders/utils/workOrderStatusLabel`, badge component.
- **Implementation Notes:** Do not drop Teléfono column (US-008 DoD).

---

### Step 6: Client-Side Contact Filter

- **File:** `DeliveryPanelPage.tsx` (+ pass filtered items to table)
- **Action:** Filter *Todos | Pendiente de contacto | Contactados*.
- **Implementation Steps:**
  1. State: `contactFilter: 'all' | 'pending' | 'contacted'` (default `'all'`).
  2. Segmented control or `<select>` above the table (Spanish labels).
  3. Derive:

```typescript
const filteredItems = useMemo(() => {
  const items = data?.items ?? [];
  if (contactFilter === 'pending') {
    return items.filter((i) => i.status === 'LISTA_PARA_ENTREGA');
  }
  if (contactFilter === 'contacted') {
    return items.filter((i) => i.status === 'OWNER_CONTACTED');
  }
  return items;
}, [data?.items, contactFilter]);
```

  4. Empty state copy when filter yields zero but raw list non-empty: *“No hay vehículos en este filtro”*.
- **Dependencies:** `useMemo`.
- **Implementation Notes:** Prefer client filter; backend `contactFilter` is optional (backend plan Step 9).

---

### Step 7: Mark Contacted Dialog + Detail CTA

- **Files:**
  - `MarkContactedDialog.tsx` (new)
  - `DeliveryReadyDetail.tsx`
  - `DeliveryPanelPage.tsx` / `DeliveryReadyTable.tsx` wiring
- **Action:** Confirm contact; show button only when pending; show audit when contacted.
- **Component Signature:**

```typescript
export function MarkContactedDialog({
  target,
  open,
  onOpenChange,
  onSuccess,
  onConflict,
}: { /* mirror MarkDeliveredDialog patterns */ })
```

- **Implementation Steps:**
  1. Remove placeholder comment in `DeliveryReadyDetail`.
  2. If `status === 'LISTA_PARA_ENTREGA'`: button **Marcar propietario contactado** → opens dialog (or calls mutation with confirm).
  3. Dialog copy: *“¿Confirmas que ya contactaste al propietario de {placa}?”*
  4. On confirm: `useMarkContacted`; success toast *“Propietario marcado como contactado”*; keep row expanded if desired; **do not** clear expanded unless UX prefers refresh.
  5. If `status === 'OWNER_CONTACTED'`: hide contact button; show:
     - *Contactado el {formatLocalDateTime(ownerContactedAt)}*
     - *por {ownerContactedBy.fullName}*
  6. Always keep **Marcar como entregada** for both statuses.
  7. Pending mutation disables buttons; show loading on primary.
- **Dependencies:** `Button`, `Modal` (same as MarkDeliveredDialog), `useMarkContacted`.
- **Implementation Notes:** Mirror accessibility: `role="dialog"`, focus trap if Modal already provides it.

---

### Step 8: Wire Table / Page Callbacks

- **Files:** `DeliveryReadyTable.tsx`, `DeliveryPanelPage.tsx`
- **Action:** Pass `onMarkContacted` similar to `onMarkDelivered`.
- **Implementation Steps:**
  1. Extend table props with `onMarkContacted: (item: DeliveryReadyItem) => void`.
  2. Detail receives status + contact fields from list item **and/or** detail query (prefer detail query as source of truth when expanded; merge list status for badge before detail loads).
  3. After successful contact, `refetch()` list so badge/filter update immediately.
- **Implementation Notes:** If detail query 404s briefly after race with deliver, reuse existing conflict handling.

---

### Step 9: Date/Time Formatting Helper

- **File:** optional `utils/formatContactedAt.ts` or inline `toLocaleString('es-CR', …)`
- **Action:** Display `ownerContactedAt` in Costa Rica-friendly local time.
- **Implementation Steps:**
  1. Format ISO string from API with `es-CR` locale.
  2. Handle null safely (should not show audit block if null).

---

### Step 10: Playwright E2E

- **File:** `apps/web/e2e/delivery-panel.spec.ts` (extend or add cases)
- **Action:** Cover contact flow end-to-end (API + UI).
- **Implementation Steps:**
  1. As admin: reach a WO in `LISTA_PARA_ENTREGA` (seed/helper from existing delivery e2e).
  2. Expand row → **Marcar propietario contactado** → confirm.
  3. Assert badge/label *Propietario contactado*; row still visible.
  4. Filter *Contactados* shows it; *Pendientes* hides it.
  5. **Marcar como entregada** → row leaves panel; toast success.
  6. Optional: second contact attempt shows Spanish conflict (if UI exposes).
  7. Mechanic still cannot open `/admin/delivery` (regression).
- **Dependencies:** Playwright admin `storageState`, API running.
- **Implementation Notes:** Project uses Playwright, not Cypress — ignore Cypress paths from the generic command template.

---

### Step 11: Update Technical Documentation

- **Action:** Mandatory docs update in English for technical specs / Spanish OK only where product UI docs are Spanish.
- **Implementation Steps:**
  1. **Review Changes:** contact CTA, filter, types, API client.
  2. **Identify files:**
     - `apps/web/README.md` — remove “V2 D1 reserved — not implemented”; describe contact UX briefly.
     - `docs/plans/US-D1_frontend.md` — this file (keep in sync if behavior drifts).
     - OpenAPI already backend-owned; no frontend OpenAPI unless project dual-docs.
  3. Update in English where `documentation-standards.mdc` applies to `docs/*`.
  4. Verify README matches shipped UI strings.
  5. Report updated files in PR/commit notes.
- **References:** `docs/documentation-standards.mdc`, `docs/frontend-standards.mdc`.
- **Notes:** Do not skip.

---

## Implementation Order

1. Step 0 — Ensure `feature-entrega2-RFM`
2. Step 1 — Types
3. Step 2 — `deliveryApi.markContacted`
4. Step 3 — `useMarkContacted`
5. Step 4 — `mapDeliveryError` updates
6. Step 5 — Status column/badge
7. Step 6 — Client filter
8. Step 7 — Dialog + detail CTA + audit
9. Step 8 — Page/table wiring + toasts
10. Step 9 — Date formatting
11. Step 10 — Playwright e2e
12. Step 11 — Documentation

---

## Testing Checklist

- [ ] Contact button only when `LISTA_PARA_ENTREGA`
- [ ] After contact, badge shows *Propietario contactado*; row remains
- [ ] Audit line shows date/time + admin name
- [ ] Filters all / pending / contacted work
- [ ] Deliver still works from pending and from contacted
- [ ] 409 already contacted shows Spanish message (not “ya entregada”)
- [ ] Phone column still always visible
- [ ] Mechanic blocked from `/admin/delivery`
- [ ] No email UI (US-D2)
- [ ] Playwright scenarios green

---

## Error Handling Patterns

| Source | UI behavior |
|--------|-------------|
| Mutation pending | Disable confirm / contact buttons; show loading label |
| `409` contact | Toast or dialog alert via `mapDeliveryError`; refetch list |
| `404` detail | Soft message *orden ya no está disponible*; collapse row + refetch |
| Network / 5xx | Generic Spanish panel error |
| List fetch error | Existing alert banner on `DeliveryPanelPage` |

Do not use English raw API messages in the UI.

---

## UI/UX Considerations

- **Language:** User-facing strings in **Spanish** (es-CR conventions for dates/currency already in panel).
- **Accessibility:** Status as text+badge (not color alone); dialog labelled; buttons with clear names for Playwright/`getByRole`.
- **Responsive:** Table already scrollable; filter control wraps on small screens (`flex-wrap`).
- **Feedback:** Toasts for contact success and deliver success (existing toast pattern).
- **No cards in hero:** N/A — admin operational table; keep existing table/detail pattern (design-system continuity).
- **Loading:** Reuse `LoadingSpinner` for initial list; detail retains its own loading if present.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-D1 backend | Required for real mark-contacted + list fields |
| US-008 frontend | Panel shell |
| Existing UI kit | `Button`, `Modal`/`MarkDeliveredDialog` patterns |
| React Query | Already in app |
| Playwright | E2E |
| **No new npm packages** | Prefer reuse |

---

## Notes

- **Branch:** Always `feature-entrega2-RFM` for this delivery.
- **Code vs UI language:** TypeScript/code identifiers English; UI Spanish.
- **Contact optional:** User can deliver without contacting (button order: both available when pending).
- **US-D2 prep:** Leave a single extension point (e.g. read `emailStatus` later) but **do not** implement mail UI now.
- **Mileage:** Do not block on US-D7; if `mileage` is number and null crashes UI, null-safe display as quick fix while touching detail (`Sin registrar`) — optional opportunistic fix, not DoD of D1.

---

## Next Steps After Implementation

1. Commit on `feature-entrega2-RFM` (backend+frontend D1 together or sequential commits).
2. Plan/implement US-D2 frontend (email warnings on same contact dialog).
3. Manual smoke on DEV: admin contact → filter → deliver.

---

## Implementation Verification

### Code Quality

- [ ] Feature stays under `delivery-panel/`
- [ ] No Cypress; Playwright only
- [ ] Errors mapped to Spanish
- [ ] Query keys consistent with US-008

### Functionality

- [ ] Ready → Contacted → Delivered happy path
- [ ] Ready → Delivered without contact
- [ ] Filters and badge accurate

### Testing

- [ ] E2E coverage for contact + deliver
- [ ] Mechanic access regression

### Integration

- [ ] Contracts match `docs/plans/US-D1_backend.md` responses

### Documentation

- [ ] Step 11 completed (`apps/web/README.md` updated)
