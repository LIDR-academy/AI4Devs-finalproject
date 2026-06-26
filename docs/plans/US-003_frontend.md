# Frontend Implementation Plan: US-003 Client Registration

## Overview

Implement the **client search, registration, and edit UI** for MecaTrack (US-003): search-first flow on `/clients`, create form on `/clients/new`, edit form on `/clients/[id]/edit`, duplicate detection on `nationalId`, and post-create navigation toward vehicle registration (US-004). Accessible to both `ADMIN` and `MECHANIC`.

**Architecture principles:** feature-folder `clients`, debounced search with React Query, form validation with `zod`, Spanish UI, cache invalidation on create, exportable `ClientSearchBar` for US-004.

**User story reference:** [`us/US-003-registro-clientes.md`](../../us/US-003-registro-clientes.md)

**Prerequisites:** US-001 frontend (auth, `apiClient`, `ProtectedRoute`) and US-003 backend (`GET /clients/search`, `GET /clients/:id`, `POST /clients`, `PATCH /clients/:id`).

**Out of scope:** delete clients, merge duplicates, change `nationalId`, full client profile page `/clients/[id]` (US-009 extends profile), pagination.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ App Router |
| Server state | React Query |
| Forms | `react-hook-form` + `zod` |
| Debounce | `useDebouncedValue` hook (300 ms) |
| Styling | Tailwind CSS |

### Feature files

```
apps/web/src/features/clients/
├── components/
│   ├── ClientSearchBar.tsx
│   ├── ClientSearchResults.tsx
│   ├── ClientResultCard.tsx
│   ├── ClientForm.tsx
│   ├── ClientEditForm.tsx
│   └── ExistingClientAlert.tsx
├── hooks/
│   ├── useClientSearch.ts
│   ├── useClient.ts
│   ├── useCreateClient.ts
│   ├── useUpdateClient.ts
│   └── useDebouncedValue.ts
├── services/
│   └── clientsApi.ts
├── types/
│   └── client.types.ts
└── utils/
    └── phoneNormalizer.ts          # strip spaces/dashes for display/submit

apps/web/src/app/clients/
├── layout.tsx                      # ProtectedRoute ADMIN + MECHANIC
├── page.tsx                        # search hub
├── new/page.tsx                    # create form
└── [id]/edit/page.tsx              # edit form

apps/web/src/app/admin/layout.tsx   # nav "Clientes" → /clients
apps/web/src/app/mechanic/layout.tsx
```

### Routing

| Route | Roles | Purpose |
|-------|-------|---------|
| `/clients` | `ADMIN`, `MECHANIC` | Search + results + **Nuevo cliente** |
| `/clients/new` | `ADMIN`, `MECHANIC` | Registration form |
| `/clients/[id]/edit` | `ADMIN`, `MECHANIC` | Edit form (`nationalId` read-only) |

**Layout pattern:** Shared `/clients/*` routes (not under `/admin` or `/mechanic`) with `ProtectedRoute allowedRoles={['ADMIN', 'MECHANIC']}` so both roles share the same URLs.

### State management

| Concern | Approach |
|---------|----------|
| Search | `useClientSearch(q)` — enabled when `q.length >= 2` |
| Create | `useMutation` → invalidate `['clients']` |
| Update | `useMutation` → invalidate `['clients']` and `['clients', id]` |
| Duplicate check | `onBlur` nationalId → `searchByNationalId` |
| 409 conflict | Parse `existingClient` from error body → `ExistingClientAlert` |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-003-frontend`
- **Implementation Steps:**
  1. Base: `feature-entrega2-RFM` with US-001 frontend merged.
  2. `git checkout -b feature/US-003-frontend`

---

### Step 1: Types — `client.types.ts`

- **File:** `apps/web/src/features/clients/types/client.types.ts`

```typescript
export interface Client {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string | null;
  email: string | null;
}

export interface ClientSearchResponse {
  items: Client[];
  total: number;
}

export interface CreateClientRequest {
  fullName: string;
  nationalId: string;
  phone?: string;
  email?: string;
}

export interface ClientConflictError {
  statusCode: 409;
  message: string;
  existingClient: Client;
}
```

---

### Step 2: Clients API Service

- **File:** `apps/web/src/features/clients/services/clientsApi.ts`

```typescript
export const clientsApi = {
  search(params: { q?: string; nationalId?: string }): Promise<ClientSearchResponse>;
  getById(id: string): Promise<Client>;
  create(data: CreateClientRequest): Promise<Client>;
  update(id: string, data: UpdateClientRequest): Promise<Client>;
};
```

| Method | Endpoint | Notes |
|--------|----------|-------|
| `search` | `GET /clients/search?q=` or `?nationalId=` | Build query string |
| `getById` | `GET /clients/:id` | For future pickers / US-009 |
| `create` | `POST /clients` | Throw typed error on 409 with `existingClient` |
| `update` | `PATCH /clients/:id` | Update contact fields |

- **409 handling:** Extend `apiClient` or wrap in `clientsApi.create` to parse JSON body and attach `existingClient` to thrown error for UI.

---

### Step 3: `useDebouncedValue` Hook

- **File:** `apps/web/src/features/clients/hooks/useDebouncedValue.ts`

```typescript
export function useDebouncedValue<T>(value: T, delayMs = 300): T
```

- Reusable across search features (vehicles US-004).

---

### Step 4: `useClientSearch` Hook

- **File:** `apps/web/src/features/clients/hooks/useClientSearch.ts`

```typescript
export function useClientSearch(query: string) {
  const debouncedQ = useDebouncedValue(query, 300);
  return useQuery({
    queryKey: ['clients', 'search', debouncedQ],
    queryFn: () => clientsApi.search({ q: debouncedQ }),
    enabled: debouncedQ.length >= 2,
  });
}

export function useClientSearchByNationalId(nationalId: string) {
  return useQuery({
    queryKey: ['clients', 'search', 'nationalId', nationalId],
    queryFn: () => clientsApi.search({ nationalId }),
    enabled: nationalId.length >= 5,
  });
}
```

- When `query.length < 2`: show hint *"Escribe al menos 2 caracteres para buscar"* — no API call.

---

### Step 5: `useCreateClient` Hook

```typescript
export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
```

---

### Step 6: `ClientSearchBar` Component

- **File:** `apps/web/src/features/clients/components/ClientSearchBar.tsx`

```typescript
export function ClientSearchBar({
  value,
  onChange,
  isLoading,
}: {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}): JSX.Element
```

- Search input with label *"Buscar cliente"*, placeholder *"Nombre, identificación o teléfono"*.
- `aria-live="polite"` region for result count (announced by `ClientSearchResults`).
- **Export** from feature index for US-004 `ClientPicker`.

---

### Step 7: `ClientSearchResults` and `ClientResultCard`

#### `ClientResultCard.tsx`

- Displays: `fullName`, `nationalId`, `phone` (or *"Sin teléfono"*), `email` (if present).
- Action **Ver / Usar cliente** → `router.push(`/clients/${id}`)` stub or link to `/vehicles/new?clientId=` for US-004 prep.
- **MVP:** Buttons **Editar cliente** → `/clients/{id}/edit` and **Registrar vehículo** → `/vehicles/new?clientId={id}`.

#### `ClientSearchResults.tsx`

- Props: `items`, `isLoading`, `isEmpty`, `hasQuery`.
- Loading spinner while `isLoading`.
- Empty with query ≥ 2: *"No se encontraron clientes"* + link **Crear nuevo cliente** → `/clients/new`.
- List/grid of `ClientResultCard`.

---

### Step 8: `ExistingClientAlert` Component

- **File:** `apps/web/src/features/clients/components/ExistingClientAlert.tsx`

- Shown on blur duplicate or `409` on submit.
- Message: *"Ya existe un cliente con esta identificación"*.
- Card with existing client data + actions:
  - **Usar este cliente** → `/vehicles/new?clientId=...`
  - **Volver a búsqueda** → `/clients`

---

### Step 9: `ClientForm` and `ClientEditForm` Components

- **File:** `apps/web/src/features/clients/components/ClientForm.tsx`

| Field | zod rules |
|-------|-----------|
| `fullName` | required, 2–150 chars, trim |
| `nationalId` | required, 5–20 alphanumeric + hyphen |
| `phone` | optional; if set, 8–15 digits after normalize |
| `email` | optional; valid email |

- **Submit:** disabled when invalid or `isPending`.
- **`onBlur` nationalId:** call `clientsApi.search({ nationalId })`; if match → show `ExistingClientAlert`.
- **On success:** toast *"Cliente registrado"* + success panel:
  - **Registrar vehículo** → `/vehicles/new?clientId={id}`
  - **Volver a búsqueda** → `/clients`
- **On 409:** render `ExistingClientAlert` with `existingClient` from error.

#### `ClientEditForm.tsx`

- Loads client via `useClient(id)`; shows loading/error states.
- Same fields as create except `nationalId` disabled/read-only.
- **On success:** message *"Cliente actualizado"* + links to search or register vehicle.
- Uses `useUpdateClient` mutation.

---

### Step 10: Pages and Layout

#### `clients/layout.tsx`

```typescript
export default function ClientsLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MECHANIC']}>
      {children}
    </ProtectedRoute>
  );
}
```

- Optional: wrap with shared chrome (breadcrumb back to role dashboard).

#### `clients/page.tsx`

- State: `searchQuery`.
- Render `ClientSearchBar` + `ClientSearchResults` + header with **Nuevo cliente** button → `/clients/new`.
- Page title: *"Clientes"*.

#### `clients/[id]/edit/page.tsx`

- Render `ClientEditForm`.
- Link **Cancelar** → `/clients`.

---

### Step 11: Navigation — Admin and Mechanic Layouts

- **Files:** `apps/web/src/app/admin/layout.tsx`, `apps/web/src/app/mechanic/layout.tsx`
- Add nav item **Clientes** → `/clients`.
- Same href for both roles.

---

### Step 12: Phone Normalizer Utility

```typescript
export function normalizePhoneInput(value: string): string {
  return value.replace(/[\s-]/g, '');
}
```

- Apply on submit; optional live format in input.

---

### Step 13: E2E Tests

- **File:** `apps/web/e2e/clients.spec.ts`

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Admin visits `/clients` | Search bar visible |
| 2 | Mechanic visits `/clients` | Search bar visible |
| 3 | Search with 2+ chars | Results or empty state |
| 4 | Create new client | Success + link to register vehicle |
| 5 | Duplicate nationalId | Existing client alert |
| 6 | New client appears in search after create | Refetch shows client |
| 7 | Edit existing client | Success + updated name in search |
| 8 | Unauthenticated `/clients` | Redirect login |

---

### Step 14: Update Technical Documentation

1. Document `/clients` routes in `apps/web/README.md`.
2. Note `ClientSearchBar` export for US-004.
3. Document React Query keys: `['clients', 'search', q]`.
4. Document 409 error shape handling.

---

## Implementation Order

1. Step 0 — Branch `feature/US-003-frontend`
2. Step 1 — Types
3. Step 2 — `clientsApi` (+ 409 parsing)
4. Step 3 — `useDebouncedValue`
5. Step 4 — `useClientSearch`
6. Step 5 — `useCreateClient`
7. Step 12 — Phone normalizer
8. Step 6 — `ClientSearchBar`
9. Step 7 — `ClientSearchResults` + `ClientResultCard`
10. Step 8 — `ExistingClientAlert`
11. Step 9 — `ClientForm`
12. Step 10 — Pages + layout
13. Step 11 — Nav links
14. Step 13 — E2E tests
15. Step 14 — Documentation

---

## Testing Checklist

- [ ] `/clients` accessible to ADMIN and MECHANIC
- [ ] Search debounced 300 ms; no request until ≥ 2 chars
- [ ] Results show name, id, phone, email
- [ ] Empty state + CTA create
- [ ] **Nuevo cliente** navigates to `/clients/new`
- [ ] Form validation blocks invalid submit
- [ ] Blur on nationalId shows duplicate alert
- [ ] 409 on submit shows `ExistingClientAlert`
- [ ] Success invalidates cache; new client in search
- [ ] **Editar cliente** navigates to `/clients/[id]/edit`
- [ ] Edit form keeps nationalId read-only
- [ ] Nav **Clientes** in admin and mechanic layouts
- [ ] `aria-live` on search results
- [ ] E2E flow green

---

## Error Handling Patterns

| HTTP | UI message (ES) |
|------|-----------------|
| `400` | Field validation errors |
| `401` | Redirect login (apiClient) |
| `409` | *Ya existe un cliente con esta identificación* + `ExistingClientAlert` |
| Network | *Error de conexión. Intenta de nuevo.* |

### Typed conflict helper

```typescript
export function isClientConflictError(error: unknown): error is { existingClient: Client }
```

---

## UI/UX Considerations

| Area | Requirement |
|------|-------------|
| **Search-first** | `/clients` leads with search, not create form |
| **Debounce** | 300 ms; loading indicator during fetch |
| **Language** | Spanish labels and messages |
| **Accessibility** | Labels, `aria-live` for results, focus on first result optional |
| **Responsive** | Cards stack on mobile |
| **Accents** | Allow accented characters in `fullName` |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Search + create mutations |
| `react-hook-form`, `zod` | Client form |
| US-001 `apiClient`, `ProtectedRoute` | Auth |

Optional: `use-debounce` package — prefer local `useDebouncedValue` to minimize deps.

---

## Notes

- **Shared routes:** `/clients` outside `/admin` and `/mechanic` avoids duplicate pages.
- **US-004 prep:** Export `ClientSearchBar`; success CTA uses `?clientId=` query param.
- **US-009 prep:** `GET /clients/:id` wired in API service; full ficha deferred.
- **Email duplicate:** Allowed — no UI warning in MVP.
- **Branch:** `feature/US-003-frontend`.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` for US-004 (vehicles)
2. Integrate `ClientPicker` in vehicle form using exported search components
3. Merge after US-003 backend available

---

## Implementation Verification

### Code Quality

- [ ] Feature folder per readme §2.3
- [ ] `ClientSearchBar` exported for reuse
- [ ] 409 handling centralized

### Functionality

- [ ] Search-first + create + edit + anti-duplicate flow complete
- [ ] Both roles can access all client routes

### Testing

- [ ] E2E search → create → search again

### Integration

- [ ] Links to `/vehicles/new?clientId=` ready for US-004
- [ ] Cache invalidation verified

### Documentation

- [ ] Step 14 complete
