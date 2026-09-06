# Frontend Implementation Plan: US-009 Vehicle & Client History

## Overview

Implement **read-only consolidated history UI** for MecaTrack (US-009): full visit timeline on `/vehicles/[id]`, new client profile on `/clients/[id]` with active vehicles and history links, and navigation from existing search flows (US-003, US-004). Displays tasks, technical notes, amounts, and **owner-at-visit** snapshots (D3-safe).

**Architecture principles:** feature-folder `history`, read-only components only, reuse search entry points (no duplicate search API), extend vehicle detail from US-004/007, Spanish UI with status badges and CRC formatting.

**User story reference:** [`us/US-009-historial.md`](../../us/US-009-historial.md)

**Prerequisites:** US-003 frontend (client search), US-004 frontend (vehicle detail stub), US-006 (`formatCurrency`, status badges), US-007 (technical notes display patterns), US-009 backend (enriched history + client profile API).

**Out of scope:** PDF export, date filters, optional nav **Buscar historial** (reuse `/vehicles` and `/clients` search), sold-vehicle history under former owner on client page.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ App Router |
| Server state | React Query |
| Styling | Tailwind CSS |

### Feature files

```
apps/web/src/features/history/
├── components/
│   ├── VisitTimeline.tsx
│   ├── VisitCard.tsx
│   ├── VisitTasksList.tsx
│   ├── VisitTechnicalNotesReadOnly.tsx   # visit + task level (read-only)
│   ├── ClientProfileHeader.tsx
│   ├── ClientVehiclesList.tsx
│   └── ClientVehicleCard.tsx
├── hooks/
│   ├── useVehicleHistory.ts
│   └── useClientProfile.ts
├── services/
│   └── historyApi.ts
└── types/
    └── history.types.ts

apps/web/src/app/clients/
├── layout.tsx                            # ProtectedRoute ADMIN + MECHANIC (if not exists)
└── [id]/page.tsx                         # NEW client profile

apps/web/src/app/vehicles/[id]/page.tsx   # integrate VisitTimeline (#historial)
apps/web/src/features/clients/            # link search results → /clients/[id]
apps/web/src/features/vehicles/           # link search → /vehicles/[id]
```

### Routing

| Route | Roles | Purpose |
|-------|-------|---------|
| `/vehicles/[id]` | `ADMIN`, `MECHANIC` | Vehicle detail + **Historial de visitas** (`#historial`) |
| `/clients/[id]` | `ADMIN`, `MECHANIC` | Client profile + vehicles list |

### Entry points (no new search UI required)

| Flow | Path |
|------|------|
| Vehicle | `/vehicles` search → **Ver ficha** → `/vehicles/[id]` |
| Client | `/clients` search → **Ver / Usar cliente** → `/clients/[id]` |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-009-frontend`
- **Base:** US-007/008 frontend merged; backend US-009 available.
- `git checkout -b feature/US-009-frontend`

---

### Step 1: Types — `history.types.ts`

```typescript
export interface OwnerAtVisit {
  id: string;
  fullName: string;
  nationalId: string;
}

export interface VisitNotes {
  visitDiagnosis: string | null;
  visitRepairSummary: string | null;
  visitPartsUsed: string | null;
  visitAdditionalNotes: string | null;
}

export interface HistoryTask {
  id: string;
  description: string;
  status: string;
  cost: number | null;
  costNotes: string | null;
  diagnosis: string | null;
  repairPerformed: string | null;
  partsUsed: string | null;
  additionalNotes: string | null;
}

export interface VehicleVisit {
  workOrderId: string;
  checkedInAt: string;
  deliveredAt: string | null;
  status: string;
  statusLabel: string;
  entryReason: string;
  mileage: number;
  totalAmount: number;
  ownerAtVisit: OwnerAtVisit;
  visitNotes: VisitNotes;
  tasks: HistoryTask[];
}

export interface VehicleHistoryResponse {
  vehicleId: string;
  licensePlate: string;
  vehicleLabel: string;
  currentOwner: { id: string; fullName: string; nationalId: string };
  visits: VehicleVisit[];
  total: number;
}

export interface ClientVehicleSummary {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  lastVisitAt: string | null;
  lastVisitStatus: string | null;
}

export interface ClientProfileResponse {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string | null;
  email: string | null;
  vehicles: ClientVehicleSummary[];
}
```

---

### Step 2: History API Service

- **File:** `apps/web/src/features/history/services/historyApi.ts`

```typescript
export const historyApi = {
  getVehicleHistory(vehicleId: string): Promise<VehicleHistoryResponse>;
  getClientProfile(clientId: string): Promise<ClientProfileResponse>;
};
```

| Method | Endpoint |
|--------|----------|
| `getVehicleHistory` | `GET /vehicles/:id/history` |
| `getClientProfile` | `GET /clients/:id` |

- Thin wrapper over `apiClient`; can delegate to `vehiclesApi` / `clientsApi` if those are extended instead — prefer single `historyApi` for US-009 clarity.

---

### Step 3: React Query Hooks

```typescript
export function useVehicleHistory(vehicleId: string) {
  return useQuery({
    queryKey: ['vehicles', vehicleId, 'history'],
    queryFn: () => historyApi.getVehicleHistory(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useClientProfile(clientId: string) {
  return useQuery({
    queryKey: ['clients', clientId, 'profile'],
    queryFn: () => historyApi.getClientProfile(clientId),
    enabled: !!clientId,
  });
}
```

- Share query key with US-004 `useVehicleHistory` if it exists — merge to avoid duplicate fetches.

---

### Step 4: `VisitTimeline` Component

```typescript
export function VisitTimeline({
  visits,
  vehicleId,
}: {
  visits: VehicleVisit[];
  vehicleId: string;
}): JSX.Element
```

- Section `id="historial"` for anchor links from `/clients/[id]`.
- Title: *"Historial de visitas"*.
- Renders visits in API order (`checkedInAt` DESC).
- Empty: *"Este vehículo aún no tiene visitas registradas"* + CTA **Crear orden de trabajo** → `/work-orders/new?vehicleId={vehicleId}`.

---

### Step 5: `VisitCard` Component

- Collapsible accordion per visit (`aria-expanded`).
- **Header row:** date (`checkedInAt`), `statusLabel` badge, `formatCurrency(totalAmount)`.
- **Body (expanded):**
  - Propietario en la visita: `ownerAtVisit` (not `currentOwner` — show both labels if different from current owner for D3 clarity)
  - Motivo, kilometraje, `deliveredAt` if present
  - `VisitTasksList`
  - `VisitTechnicalNotesReadOnly` for `visitNotes`
  - **Actions (read-only rules):**
    - `EN_PROCESO` → link **Continuar OT** → `/work-orders/[workOrderId]`
    - Other statuses → link **Ver OT** → `/work-orders/[workOrderId]` (read-only detail)
  - **No** edit/delete buttons on history card

- Reuse `WorkOrderStatusBadge` from work-orders feature.

---

### Step 6: `VisitTasksList` and `VisitTechnicalNotesReadOnly`

#### `VisitTasksList`

- Table: Tarea | Estado | Costo | Detalle cobro.
- Expandable per-task technical fields (`diagnosis`, etc.) or nested `VisitTechnicalNotesReadOnly` variant for tasks.
- Empty task technical fields → *"Sin registro"* per field.

#### `VisitTechnicalNotesReadOnly`

- Reuse or import from US-007 `TaskTechnicalNotesReadOnly` / field display pattern.
- Four visit-level or four task-level labels in Spanish.

---

### Step 7: `ClientProfileHeader` and `ClientVehiclesList`

#### `ClientProfileHeader`

- `fullName`, `nationalId`, `phone` (or *"Sin teléfono"*), `email` (or *"Sin correo"*).
- `tel:` link on phone when present.

#### `ClientVehiclesList`

- Title: *"Vehículos del cliente"*.
- Empty: *"Sin vehículos registrados"*.
- `ClientVehicleCard` per vehicle:
  - Plate, brand/model/year
  - Last visit: `lastVisitAt` formatted + `lastVisitStatus` badge
  - **Ver historial** → `/vehicles/[id]#historial`

---

### Step 8: Client Profile Page — `/clients/[id]`

- **File:** `apps/web/src/app/clients/[id]/page.tsx`
- **Layout:** Extend `clients/layout.tsx` with `ProtectedRoute` if `/clients/[id]` not already under protected layout.
- Compose:
  - Back link → `/clients`
  - `ClientProfileHeader`
  - `ClientVehiclesList`
- Loading / 404 states.

---

### Step 9: Enhance Vehicle Detail Page — `/vehicles/[id]`

- **File:** `apps/web/src/app/vehicles/[id]/page.tsx`
- Keep `VehicleDetailHeader` (US-004).
- **Replace** basic `VehicleVisitHistory` with full `VisitTimeline` fed by `useVehicleHistory`.
- On mount: if `window.location.hash === '#historial'`, scroll to `#historial` section.
- Show `currentOwner` in header; timeline uses `ownerAtVisit` per visit.

---

### Step 10: Update Search Result Actions (US-003 / US-004)

#### `ClientResultCard` (US-003)

- **Ver cliente** → `/clients/[id]` (in addition to register vehicle CTA).

#### `VehicleResultCard` (US-004)

- **Ver ficha** → `/vehicles/[id]` (already planned; ensure history section loads).

---

### Step 11: D3 Integrity — Owner Display

- In `VisitCard`, when `ownerAtVisit.nationalId !== currentOwner.nationalId` (optional compare), show info note:
  - *"Propietario al momento de la visita (puede diferir del propietario actual)"*
- Never replace `ownerAtVisit` with `currentOwner` in timeline items.

---

### Step 12: Read-Only Enforcement

- History components export no mutation hooks.
- `VisitCard` only contains links (`Continuar OT` / `Ver OT`), never edit forms.
- Closed visits (`ENTREGADA`, `LISTA_PARA_ENTREGA`): no *Continuar* — only *Ver OT*.

---

### Step 13: E2E Tests

- **File:** `apps/web/e2e/history.spec.ts`

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Search vehicle → open ficha → historial | ≥1 visit or empty CTA |
| 2 | Expand visit | Tasks + technical notes visible |
| 3 | `ownerAtVisit` shown on visit card | Distinct from header current owner when fixture differs |
| 4 | Search client → `/clients/[id]` | Profile + vehicles list |
| 5 | **Ver historial** from client vehicle | Navigates to `#historial` |
| 6 | EN_PROCESO visit | **Continuar OT** link |
| 7 | ENTREGADA visit | **Ver OT** only, no edit affordances in timeline |
| 8 | Empty vehicle history | CTA create work order |
| 9 | ADMIN and MECHANIC access | Both roles |

---

### Step 14: Update Technical Documentation

1. Document `/clients/[id]` and `#historial` anchor.
2. Document entry flows from search pages.
3. Note read-only policy and D3 owner snapshot display.
4. Optional future: nav **Buscar historial** deferred.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Types
3. Step 2 — `historyApi`
4. Step 3 — Hooks
5. Step 6 — Technical notes read-only (reuse US-007)
6. Step 5 — `VisitCard` + `VisitTasksList`
7. Step 4 — `VisitTimeline`
8. Step 7 — Client profile components
9. Step 8 — `/clients/[id]` page
10. Step 9 — Enhance `/vehicles/[id]`
11. Step 10 — Search result links
12. Step 11–12 — D3 note + read-only audit
13. Step 13 — E2E
14. Step 14 — Documentation

---

## Testing Checklist

- [ ] Vehicle history DESC order
- [ ] All WO statuses shown with badges
- [ ] `ownerAtVisit` per visit; `currentOwner` in vehicle header
- [ ] Technical notes and tasks in expanded visit
- [ ] Empty sections show *"Sin registro"*
- [ ] `/clients/[id]` shows contact + active vehicles
- [ ] **Ver historial** scrolls to `#historial`
- [ ] **Continuar OT** only for `EN_PROCESO`
- [ ] No edit controls on closed visits in timeline
- [ ] Search → profile/history without extra steps
- [ ] ADMIN and MECHANIC access
- [ ] E2E green

---

## Error Handling Patterns

| HTTP | UI |
|------|-----|
| `404` | *"Vehículo no encontrado"* / *"Cliente no encontrado"* |
| `401` | Redirect login |
| Network | *"Error al cargar el historial. Intenta de nuevo."* |

---

## UI/UX Considerations

| Area | Requirement |
|------|-------------|
| **Timeline** | Accordion or vertical timeline; newest first |
| **Read-only** | No form inputs in history views |
| **Currency** | CRC via `formatCurrency` |
| **Dates** | `es-CR` locale (`checkedInAt`, `deliveredAt`) |
| **Status colors** | Consistent with work-orders badges |
| **Accessibility** | `aria-expanded` on visit cards; semantic headings |
| **Performance** | Single history fetch per vehicle page load |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| US-003 client search + layout | Entry + `/clients/[id]` |
| US-004 vehicle detail | Host timeline |
| US-006/007 display utils | Badges, currency, technical read-only |
| US-009 backend | Enriched APIs |
| `@tanstack/react-query` | Data fetching |

---

## Notes

- **`history` feature:** UI-only module; APIs remain on `/vehicles` and `/clients` paths.
- **US-007 overlap:** Replace stub `VehicleVisitHistory` with full `VisitTimeline`; deduplicate read-only note components.
- **Optional nav search:** Not in MVP — document in README as future enhancement.
- **Branch:** `feature/US-009-frontend`.
- **MVP complete:** With US-009 frontend, entrega 2 UI slice for US-001–US-009 is fully planned.

---

## Next Steps After Implementation

1. Full-stack E2E regression across US-001–US-009
2. Update `readme.md` §1.4 install/run docs when implementing
3. Merge `feature/US-009-frontend` → `feature-entrega2-RFM`

---

## Implementation Verification

### Code Quality

- [ ] History feature isolated; no mutation APIs
- [ ] Shared badges/currency from work-orders
- [ ] Single source for vehicle history query key

### Functionality

- [ ] Vehicle + client history flows complete
- [ ] D3 owner snapshot visible and correct

### Testing

- [ ] E2E search → history paths
- [ ] Both roles verified

### Integration

- [ ] All prior US entry points wired
- [ ] `#historial` deep link works

### Documentation

- [ ] Step 14 complete
