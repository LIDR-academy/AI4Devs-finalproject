# Frontend Implementation Plan: US-004 Vehicle Registration

## Overview

Implement the **vehicle search, registration, and detail UI** for MecaTrack (US-004): plate search on `/vehicles`, create form with embedded client picker on `/vehicles/new`, vehicle detail with owner and visit history on `/vehicles/[id]`. Accessible to both `ADMIN` and `MECHANIC`. Integrates with US-003 (`ClientPicker`, `?clientId=` from client flow) and prepares US-005 (`?vehicleId=` on work order create).

**Architecture principles:** feature-folder `vehicles`, debounced search, reuse `ClientSearchBar` from `clients`, Spanish UI, React Query cache invalidation, duplicate plate handling mirroring US-003 pattern.

**User story reference:** [`us/US-004-registro-vehiculos.md`](../../us/US-004-registro-vehiculos.md)

**Prerequisites:** US-001 frontend, US-003 frontend (`ClientSearchBar`, `clientsApi.getById`), US-004 backend.

**Out of scope:** owner transfer (D3), populated visit timeline content beyond API contract (full US-009), `hasActiveWorkOrder` until US-005 backend (button can be hidden/stubbed).

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ App Router |
| Server state | React Query |
| Forms | `react-hook-form` + `zod` |
| Debounce | Reuse `useDebouncedValue` from `clients` or move to `shared/hooks` |
| Styling | Tailwind CSS |

### Feature files

```
apps/web/src/features/vehicles/
├── components/
│   ├── VehicleSearchBar.tsx
│   ├── VehicleSearchResults.tsx
│   ├── VehicleResultCard.tsx
│   ├── VehicleForm.tsx
│   ├── ClientPicker.tsx
│   ├── ExistingVehicleAlert.tsx
│   ├── VehicleDetailHeader.tsx
│   └── VehicleVisitHistory.tsx
├── hooks/
│   ├── useVehicleSearch.ts
│   ├── useVehicle.ts
│   ├── useVehicleHistory.ts
│   └── useCreateVehicle.ts
├── services/
│   └── vehiclesApi.ts
├── types/
│   └── vehicle.types.ts
└── utils/
    └── licensePlateNormalizer.ts

apps/web/src/app/vehicles/
├── layout.tsx                      # ProtectedRoute ADMIN + MECHANIC
├── page.tsx                        # search hub
├── new/page.tsx                    # create (+ ?clientId=)
└── [id]/page.tsx                   # detail + history

apps/web/src/shared/hooks/
└── useDebouncedValue.ts            # optional: promote from clients feature

apps/web/src/app/admin/layout.tsx   # nav "Vehículos"
apps/web/src/app/mechanic/layout.tsx
```

### Routing

| Route | Roles | Purpose |
|-------|-------|---------|
| `/vehicles` | `ADMIN`, `MECHANIC` | Plate search + **Nuevo vehículo** |
| `/vehicles/new` | `ADMIN`, `MECHANIC` | Create form; `?clientId=` prefill |
| `/vehicles/[id]/edit` | `ADMIN`, `MECHANIC` | Edit vehicle data (owner read-only) |

### State management

| Concern | Approach |
|---------|----------|
| Plate search | `useVehicleSearch(q)` — debounce 300 ms, min 2 chars |
| Vehicle detail | `useVehicle(id)` + `useVehicleHistory(id)` |
| Create | `useMutation` → invalidate `['vehicles']` |
| Client prefill | `useSearchParams().get('clientId')` → `clientsApi.getById` |
| Duplicate plate | Blur + `409` → `ExistingVehicleAlert` |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-004-frontend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` with US-001 + US-003 frontend merged.
  2. `git checkout -b feature/US-004-frontend`

---

### Step 1: Types — `vehicle.types.ts`

```typescript
export interface CurrentOwner {
  id: string;
  fullName: string;
  nationalId: string;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  currentOwner: CurrentOwner;
}

export interface VehicleSearchResponse {
  items: Vehicle[];
  total: number;
}

export interface CreateVehicleRequest {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  clientId: string;
}

export interface VehicleVisit {
  workOrderId: string;
  checkedInAt: string;
  status: string;
  entryReason: string;
  totalAmount: number | null;
  ownerAtVisit: { fullName: string; nationalId: string };
}

export interface VehicleHistoryResponse {
  vehicleId: string;
  visits: VehicleVisit[];
}

export interface ExistingVehicleSummary {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
}
```

---

### Step 2: Vehicles API Service

- **File:** `apps/web/src/features/vehicles/services/vehiclesApi.ts`

```typescript
export const vehiclesApi = {
  search(params: { q?: string; licensePlate?: string }): Promise<VehicleSearchResponse>;
  getById(id: string): Promise<Vehicle>;
  getHistory(id: string): Promise<VehicleHistoryResponse>;
  create(data: CreateVehicleRequest): Promise<Vehicle>;
};
```

| Method | Endpoint |
|--------|----------|
| `search` | `GET /vehicles/search` |
| `getById` | `GET /vehicles/:id` |
| `getHistory` | `GET /vehicles/:id/history` |
| `create` | `POST /vehicles` |

- Parse `409` body for `existingVehicle` (same pattern as US-003 `existingClient`).

---

### Step 3: License Plate Normalizer

- **File:** `apps/web/src/features/vehicles/utils/licensePlateNormalizer.ts`

```typescript
export function normalizeLicensePlate(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase();
}
```

- Display plates uppercase in UI after normalize.
- Optional: auto-uppercase on input `onChange`.

---

### Step 4: React Query Hooks

#### `useVehicleSearch.ts`

- Debounce 300 ms; `enabled: q.length >= 2`.
- Query key: `['vehicles', 'search', debouncedQ]`.

#### `useVehicle.ts`

```typescript
export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehiclesApi.getById(id),
    enabled: !!id,
  });
}
```

#### `useVehicleHistory.ts`

```typescript
export function useVehicleHistory(id: string) {
  return useQuery({
    queryKey: ['vehicles', id, 'history'],
    queryFn: () => vehiclesApi.getHistory(id),
    enabled: !!id,
  });
}
```

#### `useCreateVehicle.ts`

- `onSuccess`: invalidate `['vehicles']`.

---

### Step 5: `VehicleSearchBar` and `VehicleSearchResults`

#### `VehicleSearchBar.tsx`

- Label *"Buscar por placa"*, placeholder *"Ej. ABC123"*.
- Loading indicator prop.

#### `VehicleResultCard.tsx`

- Shows: plate, `{brand} {model} {year}`, current owner name.
- Action **Ver ficha** → `/vehicles/[id]`.

#### `VehicleSearchResults.tsx`

- Empty: *"No se encontraron vehículos"* + **Crear nuevo vehículo** → `/vehicles/new`.
- Hint when query < 2 chars.

---

### Step 6: `ClientPicker` Component

- **File:** `apps/web/src/features/vehicles/components/ClientPicker.tsx`

```typescript
export function ClientPicker({
  value,
  onChange,
  readOnlyClient?: Client | null,
}: {
  value: string | null;          // clientId
  onChange: (client: Client) => void;
  readOnlyClient?: Client | null; // when ?clientId= prefilled
}): JSX.Element
```

- **Modes:**
  1. **Prefilled (`readOnlyClient`):** Show name + `nationalId` read-only; hidden `clientId`.
  2. **Picker:** Modal or expandable panel with `ClientSearchBar` + `ClientSearchResults` from US-003; on select → `onChange(client)`.
- Button **Buscar propietario** opens modal if no client selected.

---

### Step 7: `ExistingVehicleAlert` Component

- Message: *"Ya existe un vehículo con esta placa"*.
- Summary card from `existingVehicle`.
- Actions: **Ver ficha** → `/vehicles/[id]`; **Volver a búsqueda** → `/vehicles`.

---

### Step 8: `VehicleForm` Component

| Field | zod validation |
|-------|----------------|
| `licensePlate` | required, 2–15 chars; normalize on submit |
| `brand` | required, 1–60 |
| `model` | required, 1–60 |
| `year` | int 1900 … currentYear + 1 |
| `color` | optional, max 40 |
| `clientId` | required UUID |

- **`onBlur` licensePlate:** `vehiclesApi.search({ licensePlate: normalized })` → alert if match.
- **Submit:** `useCreateVehicle`.
- **Success panel:**
  - *"Vehículo registrado"*
  - **Crear orden de trabajo** → `/work-orders/new?vehicleId={id}` (stub OK until US-005)
  - **Ver ficha** → `/vehicles/[id]`

---

### Step 9: Vehicle Detail — `VehicleDetailHeader` and `VehicleVisitHistory`

#### `VehicleDetailHeader.tsx`

- Plate (prominent), brand/model/year, color (or *"Sin color"*).
- **Propietario actual:** `currentOwner.fullName`, `nationalId`.
- **Nueva orden de trabajo** button:
  - **US-004 MVP:** Always show link to `/work-orders/new?vehicleId=` OR hide until US-005 adds `hasActiveWorkOrder` check.
  - Document: call `GET /work-orders/active?vehicleId=` when US-005 exists; disable if active WO.

#### `VehicleVisitHistory.tsx`

- Section title *"Historial de visitas"*.
- List visits from `useVehicleHistory` (newest first — API order).
- Each item: date, status badge, `entryReason`, `totalAmount` (CRC format).
- Empty: *"Este vehículo aún no tiene visitas registradas"*.
- Anchor `id="historial"` for US-009 deep links.

---

### Step 10: Pages and Layout

#### `vehicles/layout.tsx`

```typescript
<ProtectedRoute allowedRoles={['ADMIN', 'MECHANIC']}>{children}</ProtectedRoute>
```

#### `vehicles/page.tsx`

- Search hub: `VehicleSearchBar` + results + **Nuevo vehículo**.

#### `vehicles/new/page.tsx`

- Read `clientId` from `useSearchParams()`.
- If present: `useQuery` → `clientsApi.getById(clientId)` → pass to `VehicleForm` as `readOnlyClient`.
- Invalid/missing client: show error + link to `/clients`.

#### `vehicles/[id]/page.tsx`

- `useVehicle(params.id)` + `useVehicleHistory(params.id)`.
- Compose `VehicleDetailHeader` + `VehicleVisitHistory`.
- Loading / 404 states.

---

### Step 11: Navigation

- Add **Vehículos** → `/vehicles` in `admin/layout.tsx` and `mechanic/layout.tsx`.

---

### Step 12: Promote Shared `useDebouncedValue` (optional refactor)

- Move `useDebouncedValue` from `features/clients/hooks` to `shared/hooks/useDebouncedValue.ts`.
- Update US-003 imports — do in same PR or follow-up.

---

### Step 13: E2E Tests

- **File:** `apps/web/e2e/vehicles.spec.ts`

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Search by plate (2+ chars) | Results or empty |
| 2 | Create vehicle with client picker | Success |
| 3 | `/vehicles/new?clientId=` | Owner prefilled read-only |
| 4 | Duplicate plate | Existing vehicle alert |
| 5 | Open vehicle detail | Header + empty history message |
| 6 | Flow: create client → register vehicle | From US-003 link |
| 7 | Admin and mechanic access | Both can use `/vehicles` |

---

### Step 14: Update Technical Documentation

1. Document `/vehicles` routes and query params (`clientId`, future `vehicleId`).
2. Note `ClientPicker` dependency on US-003 exports.
3. Document 409 `existingVehicle` handling.
4. Cross-link US-003 success CTA `/vehicles/new?clientId=`.

---

## Implementation Order

1. Step 0 — Branch `feature/US-004-frontend`
2. Step 1 — Types
3. Step 2 — `vehiclesApi`
4. Step 3 — License plate normalizer
5. Step 4 — React Query hooks
6. Step 5 — Search components
7. Step 6 — `ClientPicker`
8. Step 7 — `ExistingVehicleAlert`
9. Step 8 — `VehicleForm`
10. Step 9 — Detail components
11. Step 10 — Pages + layout
12. Step 11 — Nav links
13. Step 12 — Shared debounce refactor (optional)
14. Step 13 — E2E tests
15. Step 14 — Documentation

---

## Testing Checklist

- [ ] `/vehicles` search debounced; min 2 chars
- [ ] Create form validates all fields
- [ ] `ClientPicker` works in modal; US-003 search reused
- [ ] `?clientId=` prefill read-only
- [ ] Plate normalized to uppercase on display/submit
- [ ] Blur + 409 duplicate plate shows alert with link to ficha
- [ ] Success CTAs: work order + ver ficha
- [ ] Detail page shows owner + empty history
- [ ] Nav **Vehículos** in both role layouts
- [ ] Cache invalidation after create
- [ ] E2E green

---

## Error Handling Patterns

| HTTP | UI message (ES) |
|------|-----------------|
| `400` | Field validation |
| `404` | Client/vehicle not found |
| `409` | *Ya existe un vehículo con esta placa* + `ExistingVehicleAlert` |
| Network | *Error de conexión. Intenta de nuevo.* |

```typescript
export function isVehicleConflictError(error: unknown): error is { existingVehicle: ExistingVehicleSummary }
```

---

## UI/UX Considerations

| Area | Requirement |
|------|-------------|
| **Search-first** | `/vehicles` leads with plate search |
| **Plate display** | Always uppercase, no spaces |
| **Client in form** | No leave flow — embedded picker |
| **Language** | Spanish UI |
| **Currency** | Format `totalAmount` as CRC in history (when visits exist) |
| **Accessibility** | Form labels; `aria-live` on search results |
| **Empty history** | Friendly message, not hidden section |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| US-003 `ClientSearchBar`, `clientsApi` | `ClientPicker` |
| US-001 `apiClient`, `ProtectedRoute` | Auth |
| `@tanstack/react-query` | Data fetching |
| `react-hook-form`, `zod` | Form |

---

## Notes

- **US-005 prep:** Success CTA and detail button use `/work-orders/new?vehicleId=`; page may 404 until US-005.
- **Active WO:** Hide **Nueva OT** when US-005 `GET /work-orders/active` returns active — optional in US-004, required before production US-005.
- **US-009 prep:** `VehicleVisitHistory` on `/vehicles/[id]` will be enriched later; keep component extensible.
- **Shared routes:** `/vehicles` same pattern as `/clients`.
- **Branch:** `feature/US-004-frontend`.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` for US-005
2. Verify US-003 → `/vehicles/new?clientId=` integration E2E
3. Merge after US-004 backend available

---

## Implementation Verification

### Code Quality

- [ ] `ClientPicker` reuses US-003 without duplicating search logic
- [ ] Plate normalization in one utility
- [ ] 409 handling typed

### Functionality

- [ ] Search → create → detail flow complete
- [ ] Client prefill from US-003 works

### Testing

- [ ] E2E client → vehicle flow

### Integration

- [ ] Links to US-005 work order create ready
- [ ] History section ready for US-005 data

### Documentation

- [ ] Step 14 complete
