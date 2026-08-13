# Frontend Implementation Plan: US-008 Delivery Panel

## Overview

Implement the **admin-only delivery panel** for MecaTrack (US-008): list work orders in `LISTA_PARA_ENTREGA` with owner phone visible in the main table, expandable billing detail, and **mark as delivered** confirmation. Closes the operational cycle started in US-005–US-006.

**Architecture principles:** feature-folder `delivery-panel`, admin route under `/admin/delivery`, React Query with manual refetch and optional polling, reuse `formatCurrency` from work-orders, Spanish UI.

**User story reference:** [`us/US-008-panel-entrega.md`](../../us/US-008-panel-entrega.md)

**Prerequisites:** US-001 frontend (admin layout, `ProtectedRoute`), US-006 frontend (`formatCurrency`), US-008 backend.

**Out of scope:** mark owner contacted (D1), email (D2), WebSockets, mechanic access.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ App Router |
| Server state | React Query |
| Styling | Tailwind CSS |
| HTTP | Shared `apiClient` |

### Feature files

```
apps/web/src/features/delivery-panel/
├── components/
│   ├── DeliveryPanelPage.tsx
│   ├── DeliveryReadyTable.tsx
│   ├── OwnerPhoneCell.tsx
│   ├── DeliveryReadyDetail.tsx
│   ├── DeliveryTaskBreakdown.tsx
│   └── MarkDeliveredDialog.tsx
├── hooks/
│   ├── useDeliveryReadyList.ts
│   ├── useDeliveryReadyDetail.ts
│   └── useMarkDelivered.ts
├── services/
│   └── deliveryApi.ts
└── types/
    └── delivery.types.ts

apps/web/src/app/admin/delivery/
└── page.tsx

apps/web/src/app/admin/layout.tsx    # nav "Listos para entrega" (ADMIN only)
```

### Routing

| Route | Access | Purpose |
|-------|--------|---------|
| `/admin/delivery` | `ADMIN` only | Ready-for-delivery panel |

- Page inherits `ProtectedRoute allowedRoles={['ADMIN']}` from `admin/layout.tsx` (same as US-002).
- `MECHANIC` visiting URL → `/403`.

### State management

| Concern | Approach |
|---------|----------|
| List | `useDeliveryReadyList` — key `['delivery', 'ready']` |
| Detail | `useDeliveryReadyDetail(workOrderId)` — enabled when row expanded |
| Deliver | `useMarkDelivered` → remove from list / invalidate queries |
| Selected row | Local `useState<string \| null>` for expanded `workOrderId` |
| Polling | Optional `refetchInterval: 60_000` when tab visible |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-008-frontend`
- **Base:** US-006 frontend merged (OTs can reach `LISTA_PARA_ENTREGA`).
- `git checkout -b feature/US-008-frontend`

---

### Step 1: Types — `delivery.types.ts`

```typescript
export interface DeliveryReadyItem {
  workOrderId: string;
  licensePlate: string;
  vehicleLabel: string;
  ownerName: string;
  ownerPhone: string | null;
  ownerPhoneDisplay: string | null;
  ownerEmail: string | null;
  totalAmount: number;
  checkedInAt: string;
  elapsedLabel: string;
}

export interface DeliveryReadyListResponse {
  items: DeliveryReadyItem[];
  total: number;
}

export interface DeliveryReadyDetail {
  workOrderId: string;
  status: string;
  entryReason: string;
  mileage: number;
  checkedInAt: string;
  elapsedLabel: string;
  totalAmount: number;
  vehicle: {
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
  };
  owner: {
    fullName: string;
    phone: string | null;
    email: string | null;
  };
  tasks: Array<{
    id: string;
    description: string;
    status: string;
    cost: number;
    costNotes: string | null;
  }>;
}

export interface DeliverResponse {
  workOrderId: string;
  status: string;
  deliveredAt: string;
}
```

---

### Step 2: Delivery API Service

- **File:** `apps/web/src/features/delivery-panel/services/deliveryApi.ts`

```typescript
export const deliveryApi = {
  listReady(params?: { sort?: string; order?: 'asc' | 'desc' }): Promise<DeliveryReadyListResponse>;
  getReadyDetail(workOrderId: string): Promise<DeliveryReadyDetail>;
  markDelivered(workOrderId: string): Promise<DeliverResponse>;
};
```

| Method | Endpoint |
|--------|----------|
| `listReady` | `GET /delivery/ready` |
| `getReadyDetail` | `GET /delivery/ready/:workOrderId` |
| `markDelivered` | `PATCH /delivery/ready/:workOrderId/deliver` |

- **403 for mechanic:** Handled by `apiClient`; UI should not expose route to mechanics.

---

### Step 3: `useDeliveryReadyList` Hook

```typescript
export function useDeliveryReadyList(options?: { enablePolling?: boolean }) {
  return useQuery({
    queryKey: ['delivery', 'ready'],
    queryFn: () => deliveryApi.listReady({ sort: 'checkedInAt', order: 'asc' }),
    refetchInterval: options?.enablePolling ? 60_000 : false,
    refetchIntervalInBackground: false,
  });
}
```

- Default sort matches US-008 (oldest check-in first).

---

### Step 4: `useDeliveryReadyDetail` and `useMarkDelivered`

```typescript
export function useDeliveryReadyDetail(workOrderId: string | null) {
  return useQuery({
    queryKey: ['delivery', 'ready', workOrderId],
    queryFn: () => deliveryApi.getReadyDetail(workOrderId!),
    enabled: !!workOrderId,
  });
}

export function useMarkDelivered() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workOrderId: string) => deliveryApi.markDelivered(workOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'ready'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}
```

---

### Step 5: `OwnerPhoneCell` Component

```typescript
export function OwnerPhoneCell({
  phone,
  phoneDisplay,
}: {
  phone: string | null;
  phoneDisplay?: string | null;
}): JSX.Element
```

- If `phone` present: `<a href={`tel:${phone}`}>{phoneDisplay ?? phone}</a>`
- Else: *"Sin teléfono"* in muted/italic text.
- **Critical DoD:** column always rendered in table (never hidden).

---

### Step 6: `DeliveryReadyTable` Component

| Column | Content |
|--------|---------|
| Placa | `licensePlate` |
| Modelo | `vehicleLabel` |
| Propietario | `ownerName` |
| **Teléfono** | `OwnerPhoneCell` |
| Monto total | `formatCurrency(totalAmount)` |
| Acciones | Expand / Ver detalle |

- Semantic `<table>` with `<th scope="col">`.
- Row click or chevron toggles expanded detail.
- Empty state: *"No hay vehículos listos para entrega"*.
- Header toolbar: **Actualizar** button → `refetch()`.
- Optional checkbox *"Actualizar automáticamente"* → enable 60s polling.

- Reuse `formatCurrency` from `@/features/work-orders/utils/formatCurrency`.

---

### Step 7: `DeliveryReadyDetail` Component

- Expandable row panel or side drawer below selected row.
- Sections:
  - Vehicle + owner (phone `tel:`, email if present)
  - Ingreso: `checkedInAt` formatted `es-CR` + `elapsedLabel`
  - Motivo: `entryReason`; kilometraje
  - `DeliveryTaskBreakdown` table: description, cost, `costNotes`
  - **Total a cobrar** highlighted
  - **Ver OT completa** → `/work-orders/[workOrderId]` (read-only view)
  - **Marcar como entregada** → opens `MarkDeliveredDialog`

---

### Step 8: `DeliveryTaskBreakdown` Component

- Simple table: Tarea | Costo | Detalle cobro.
- All tasks should be `COMPLETED` in this panel context.

---

### Step 9: `MarkDeliveredDialog` Component

- Confirmation: *"¿Confirmar retiro del vehículo {licensePlate}?"*
- **Confirmar** → `useMarkDelivered.mutate(workOrderId)`.
- On success: close dialog, collapse row, toast *"Vehículo marcado como entregado"*.
- **409:** *"Esta orden ya fue entregada"* + refetch list.
- Disable confirm while `isPending`.

---

### Step 10: `DeliveryPanelPage` and Admin Route

#### `DeliveryPanelPage.tsx`

- Composes table + detail state + refetch controls.
- Title: *"Listos para entrega"*.

#### `apps/web/src/app/admin/delivery/page.tsx`

```typescript
export default function AdminDeliveryPage() {
  return <DeliveryPanelPage />;
}
```

- Metadata: `title: "Listos para entrega — MecaTrack"`.

---

### Step 11: Admin Navigation

- **File:** `apps/web/src/app/admin/layout.tsx`
- Add nav item **Listos para entrega** → `/admin/delivery`.
- **Do not** add to `mechanic/layout.tsx`.

---

### Step 12: E2E Tests

- **File:** `apps/web/e2e/delivery-panel.spec.ts`

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Admin opens `/admin/delivery` | Table visible |
| 2 | Mechanic opens `/admin/delivery` | `/403` |
| 3 | Row shows phone column with `tel:` link | When phone exists |
| 4 | Row without phone | *"Sin teléfono"* |
| 5 | Expand row | Task breakdown + total |
| 6 | Mark delivered | Row removed from list |
| 7 | Refetch button | Updates list |
| 8 | `totalAmount` zero | Shows `₡0` |

- **Setup:** Complete all tasks on OT as admin/mechanic → OT appears in delivery list.

---

### Step 13: Update Technical Documentation

1. Document `/admin/delivery` admin-only access.
2. Note polling option and no WebSockets in MVP.
3. Document `ownerPhone` column requirement.
4. D1 placeholder comment for future *Contactar propietario* button.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Types
3. Step 2 — `deliveryApi`
4. Step 3–4 — Hooks
5. Step 5 — `OwnerPhoneCell`
6. Step 6 — `DeliveryReadyTable`
7. Step 7–8 — Detail + task breakdown
8. Step 9 — `MarkDeliveredDialog`
9. Step 10 — Page + route
10. Step 11 — Admin nav
11. Step 12 — E2E
12. Step 13 — Documentation

---

## Testing Checklist

- [ ] `/admin/delivery` ADMIN only; mechanic blocked
- [ ] Table columns include **Teléfono** without expanding row
- [ ] `tel:` link when phone present; *Sin teléfono* when null
- [ ] CRC formatting on amounts
- [ ] Default sort oldest `checkedInAt` first
- [ ] Expand shows tasks, total, elapsed time
- [ ] Mark delivered removes OT from list
- [ ] **Actualizar** refetches data
- [ ] Optional 60s polling works
- [ ] Double deliver shows error gracefully
- [ ] Link to `/work-orders/[id]` works
- [ ] E2E green

---

## Error Handling Patterns

| HTTP | UI message (ES) |
|------|-----------------|
| `403` | Redirect `/403` (mechanic) |
| `404` | *"La orden ya no está disponible en el panel"* |
| `409` | *"Esta orden ya fue entregada"* |
| Network | *"Error al cargar el panel. Intenta de nuevo."* |

---

## UI/UX Considerations

| Area | Requirement |
|------|-------------|
| **Phone visibility** | Primary contact column — key US-008 differentiator |
| **Billing clarity** | Total prominent in detail; per-task costs visible |
| **Time context** | `elapsedLabel` helps prioritize older vehicles |
| **No WebSockets** | **Actualizar** button + optional polling documented |
| **Language** | Spanish |
| **Accessibility** | Table headers; dialog focus trap; `tel:` links labeled |
| **Mobile** | Horizontal scroll on table; `tel:` works on mobile admin devices |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| US-001 admin layout + `ProtectedRoute` | ADMIN guard |
| US-006 `formatCurrency` | CRC display |
| US-008 backend | Delivery API |
| `@tanstack/react-query` | List/detail/mutations |

---

## Notes

- **First admin-only operational panel** besides US-002 users.
- **Snapshot owner:** Phone from `ownerClientId` at check-in, not current vehicle owner.
- **US-005 after deliver:** Vehicle eligible for new WO — no UI change required here.
- **D1 prep:** Comment placeholder for `OWNER_CONTACTED` filter extension.
- **Branch:** `feature/US-008-frontend`.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` for US-009 (history)
2. E2E full cycle: create OT → complete tasks → delivery panel → deliver → new OT
3. Merge after US-008 backend integrated

---

## Implementation Verification

### Code Quality

- [ ] `delivery-panel` feature folder isolated
- [ ] Phone cell reusable and tested
- [ ] Cache invalidation on deliver covers vehicles/work-orders

### Functionality

- [ ] Full delivery close cycle in UI
- [ ] Admin-only enforcement in route + nav

### Testing

- [ ] E2E deliver flow
- [ ] Mechanic access denial

### Integration

- [ ] Panel populates when US-006 transitions OT to `LISTA_PARA_ENTREGA`

### Documentation

- [ ] Step 13 complete
