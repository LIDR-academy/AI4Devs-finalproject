# Frontend Implementation Plan: US-D4 Maintenance Reminder Panel

## Overview

Add an **ADMIN-only reminders panel** at `/admin/reminders` that lists vehicles eligible for preventive maintenance outreach, supports **multi-select + batch send** with confirmation and post-send summary, shows `lastReminderSentAt`, and manages **opt-out / opt-in** exclusions in a secondary tab. Spanish UI; React Query for server state; reuse table/modal/toast patterns from delivery and users panels.

**Architecture principles:** new feature folder `reminders`; thin page route in App Router; `remindersApi` + typed hooks; local UI state for selection and tabs; map English API warnings to Spanish; Playwright e2e (not Cypress).

**User story reference:** [`us/Deseables/US-D4-panel-recordatorios-mantenimiento.md`](../../us/Deseables/US-D4-panel-recordatorios-mantenimiento.md)

**Backend plan:** [`docs/plans/US-D4_backend.md`](./US-D4_backend.md) — implement or merge API first (`/api/reminders/*` + US-D2 `EmailPort`).

**Prerequisites:** US-D4 backend on `feature-entrega2-RFM`; US-D2 email infrastructure (console/disabled OK in dev); admin layout + `ProtectedRoute` already restrict `/admin/*` to `ADMIN`.

**Out of scope:** SMS/WhatsApp, cron/auto-send UI, `ReminderSendLog` history, server-side pagination beyond V2 note (load full list if ≤500), mechanic access, editing email templates in browser.

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
apps/web/src/app/admin/reminders/page.tsx              # NEW — thin route + metadata

apps/web/src/features/reminders/
├── types/reminders.types.ts                           # NEW
├── services/remindersApi.ts                           # NEW
├── hooks/
│   ├── useEligibleReminders.ts                        # NEW
│   ├── useOptedOutReminders.ts                        # NEW
│   ├── useSendReminders.ts                            # NEW
│   ├── useReminderOptOut.ts                           # NEW
│   └── useReminderOptIn.ts                            # NEW
├── utils/
│   ├── mapRemindersError.ts                           # NEW
│   ├── mapReminderEmailStatus.ts                      # NEW (batch item statuses)
│   └── formatReminderDate.ts                          # NEW or inline es-CR helper
└── components/
    ├── RemindersPage.tsx                              # NEW — tabs, toolbar, toasts
    ├── EligibleRemindersTable.tsx                     # NEW — checkboxes + row actions
    ├── OptedOutRemindersTable.tsx                     # NEW — reactivate action
    ├── SendRemindersDialog.tsx                        # NEW — confirm + summary modal
    └── OptOutReminderDialog.tsx                       # NEW — confirm opt-out

apps/web/src/shared/components/RoleNav.tsx             # + Recordatorios link (ADMIN only)

apps/web/e2e/reminders.spec.ts                         # NEW
apps/web/README.md                                     # reminders section
```

### Routing

| Route | Access | Change |
|-------|--------|--------|
| `/admin/reminders` | `ADMIN` only | **New page** — inherits `apps/web/src/app/admin/layout.tsx` (`ProtectedRoute` + `RoleNav`) |

No changes to mechanic routes; mechanics must still get `/403` if they hit the URL directly.

### State management

| Concern | Approach |
|---------|----------|
| Eligible list | `useEligibleReminders` — key `['reminders', 'eligible', { days?, q? }]` |
| Opted-out list | `useOptedOutReminders` — key `['reminders', 'opted-out']` |
| Batch send | `useSendReminders` mutation → invalidate eligible + opted-out keys |
| Opt-out / opt-in | `useReminderOptOut` / `useReminderOptIn` → invalidate both list keys |
| Active tab | Local `useState<'eligible' \| 'exclusions'>` |
| Row selection | Local `Set<string>` of `vehicleId` on eligible tab only |
| Confirm send | Local `sendDialogOpen: boolean` |
| Opt-out target | Local `optOutTarget: EligibleReminderItem \| null` |
| Post-send summary | Local `SendRemindersResponse \| null` shown inside dialog step 2 |
| Search filter (optional V2) | Local `searchQuery` debounced → pass as `q` to eligible query |
| Threshold display | Read `thresholdDays` from eligible response (no env in browser) |

**Select-all scope (document in UI):** “Seleccionar todos” applies to **currently loaded rows** (full list in V2 when total ≤500; if backend paginates later, page-only). Helper text under checkbox header: *“Selección de la lista visible”*.

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Action:** Implement on the delivery branch (do **not** create `feature/US-D4-frontend`).
- **Branch (required):** `feature-entrega2-RFM`
- **Implementation Steps:**
  1. `git checkout feature-entrega2-RFM`
  2. `git pull origin feature-entrega2-RFM` if needed
  3. Verify `git branch --show-current` → `feature-entrega2-RFM`
  4. Confirm US-D4 backend endpoints are available (or stub-compatible) on this branch
  5. Confirm US-D2 `EmailPort` works in dev (console/disabled acceptable)
- **Notes:** Entrega 2 aggregates deseables on one branch; see `us/Deseables/README.md`.

---

### Step 1: Types

- **File:** `apps/web/src/features/reminders/types/reminders.types.ts` (new)
- **Action:** Mirror backend DTOs from US-D4 backend plan.
- **Implementation Steps:**
  1. Define:

```typescript
export interface EligibleReminderItem {
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
}

export interface EligibleRemindersResponse {
  items: EligibleReminderItem[];
  total: number;
  thresholdDays: number;
}

export type ReminderEmailStatus =
  | 'sent'
  | 'skipped_no_email'
  | 'skipped_disabled'
  | 'skipped_not_eligible'
  | 'failed';

export interface SendReminderResultItem {
  vehicleId: string;
  licensePlate: string;
  emailStatus: ReminderEmailStatus;
  warning: string | null;
}

export interface SendRemindersResponse {
  results: SendReminderResultItem[];
  summary: {
    requested: number;
    sent: number;
    skipped: number;
    failed: number;
  };
}

export interface OptedOutReminderItem {
  vehicleId: string;
  licensePlate: string;
  vehicleLabel: string;
  ownerName: string | null;
  excludedAt: string;
  excludedBy: { id: string; fullName: string } | null;
}

export interface OptedOutRemindersResponse {
  items: OptedOutReminderItem[];
  total: number;
}

export interface ReminderOptResponse {
  vehicleId: string;
  excludeFromReminders: boolean;
}
```

  2. Export all types from a barrel `index.ts` only if other features need them (optional).
- **Dependencies:** None.
- **Implementation Notes:** `canEmail` is derived server-side; still allow selecting rows with `canEmail: false` (they become `skipped_no_email` on send).

---

### Step 2: API Service — `remindersApi`

- **File:** `apps/web/src/features/reminders/services/remindersApi.ts` (new)
- **Action:** Wrap all `/reminders/*` endpoints.
- **Function Signatures:**

```typescript
export const remindersApi = {
  listEligible(params?: { days?: number; q?: string }): Promise<EligibleRemindersResponse>;
  listOptedOut(): Promise<OptedOutRemindersResponse>;
  sendReminders(vehicleIds: string[]): Promise<SendRemindersResponse>;
  optOut(vehicleId: string): Promise<ReminderOptResponse>;
  optIn(vehicleId: string): Promise<ReminderOptResponse>;
};
```

- **Implementation Steps:**
  1. `GET /reminders/eligible` — build `URLSearchParams` for optional `days`, `q`.
  2. `GET /reminders/opted-out`.
  3. `POST /reminders/send` — body `{ vehicleIds }`.
  4. `POST /reminders/:vehicleId/opt-out` — empty body.
  5. `POST /reminders/:vehicleId/opt-in` — empty body.
  6. Use `apiClient` like `deliveryApi` / `usersApi`.
- **Dependencies:** Types from Step 1, `apiClient`.
- **Implementation Notes:** Paths are relative to `/api` base (no double prefix).

---

### Step 3: React Query Hooks

- **Files:** `hooks/useEligibleReminders.ts`, `useOptedOutReminders.ts`, `useSendReminders.ts`, `useReminderOptOut.ts`, `useReminderOptIn.ts` (new)
- **Action:** Server state + cache invalidation.
- **Implementation Steps:**

**`useEligibleReminders`**

```typescript
export function useEligibleReminders(params?: { days?: number; q?: string })
```

  1. `queryKey: ['reminders', 'eligible', params ?? {}]`.
  2. `queryFn: () => remindersApi.listEligible(params)`.
  3. `staleTime`: default (0) — admin operational panel; refetch on focus OK.

**`useOptedOutReminders`**

```typescript
export function useOptedOutReminders()
```

  1. `queryKey: ['reminders', 'opted-out']`.
  2. `enabled` only when exclusions tab active (pass `enabled` option from page).

**`useSendReminders`**

```typescript
export function useSendReminders()
```

  1. `mutationFn: (vehicleIds: string[]) => remindersApi.sendReminders(vehicleIds)`.
  2. `onSuccess`: invalidate `['reminders', 'eligible']` and `['reminders', 'opted-out']`.

**`useReminderOptOut` / `useReminderOptIn`**

  1. Single-vehicle mutations.
  2. `onSuccess`: invalidate both reminder list keys.
  3. Opt-out removes from eligible; opt-in may not re-add until eligibility rules met (backend truth).

- **Dependencies:** `@tanstack/react-query`, `remindersApi`.
- **Implementation Notes:** Mirror `useMarkDelivered` / `useDeactivateUser` structure.

---

### Step 4: Error + Email Status Mapping

- **Files:** `utils/mapRemindersError.ts`, `utils/mapReminderEmailStatus.ts` (new)
- **Action:** Spanish user messages; never show raw English API strings in UI.
- **Function Signatures:**

```typescript
export function mapRemindersError(error: unknown): string

export function mapReminderEmailStatusLabel(status: ReminderEmailStatus): string

export function mapSendSummaryToToast(summary: SendRemindersResponse['summary']): string
```

- **Implementation Steps:**

**`mapRemindersError`**

| Condition | Spanish |
|-----------|---------|
| `403` | *No tienes permiso para acceder a recordatorios.* |
| `404` on opt | *Vehículo no encontrado.* |
| `400` empty batch | *Selecciona al menos un vehículo.* |
| `400` batch too large | *Demasiados vehículos seleccionados (máximo 100).* |
| Network / 5xx | *No se pudo completar la operación. Intenta de nuevo.* |

**`mapReminderEmailStatusLabel`** (per-row in summary table)

| Status | Label |
|--------|-------|
| `sent` | *Enviado* |
| `skipped_no_email` | *Omitido — sin correo* |
| `skipped_disabled` | *Omitido — correo deshabilitado* |
| `skipped_not_eligible` | *Omitido — ya no elegible* |
| `failed` | *Error al enviar* |

**`mapSendSummaryToToast`**

  Example: *“Recordatorios: 3 enviados, 1 omitido, 0 con error.”*

  3. Optional helper `countSelectedWithoutEmail(items, selectedIds)` for confirm dialog copy.
- **Dependencies:** `ApiError`.
- **Implementation Notes:** Do not reuse `mapEmailStatus.ts` from D2 directly — reminder batch adds `skipped_not_eligible`; either extend shared union in a follow-up or keep separate to minimize D2 coupling.

---

### Step 5: Date Formatting Helper

- **File:** `utils/formatReminderDate.ts` (new) or inline in table components
- **Action:** Display ISO dates in `es-CR` locale.
- **Function Signature:**

```typescript
export function formatReminderDate(iso: string | null): string
```

- **Implementation Steps:**
  1. `null` → *“—”* or *“Nunca”* for `lastReminderSentAt` column (prefer *“—”* when null, *“Nunca”* only in empty-state copy if needed).
  2. Use `toLocaleDateString('es-CR', { dateStyle: 'medium' })` + optional time for audit fields (`excludedAt`).
- **Dependencies:** None.

---

### Step 6: Eligible Reminders Table

- **File:** `components/EligibleRemindersTable.tsx` (new)
- **Action:** Checkbox selection, columns per US, row opt-out action.
- **Component Signature:**

```typescript
export function EligibleRemindersTable({
  items,
  selectedIds,
  onToggleRow,
  onToggleAllVisible,
  allVisibleSelected,
  someVisibleSelected,
  onOptOut,
}: { /* props */ })
```

- **Implementation Steps:**
  1. Table styling: match `DeliveryReadyTable` / `UserTable` (`rounded-xl border`, `thead bg-slate-50`).
  2. Columns:

| Column | Source |
|--------|--------|
| Checkbox | header select-all + row checkbox |
| Placa | `licensePlate` |
| Modelo | `vehicleLabel` |
| Propietario | `ownerName` |
| Correo | `ownerEmail` or *Sin correo* (amber/muted) |
| Última visita | `formatReminderDate(lastVisitAt)` |
| Días sin visita | `daysSinceVisit` |
| Último recordatorio | `formatReminderDate(lastReminderSentAt)` or *—* |
| Acciones | **No volver a recordar** (ghost/danger) |

  3. Rows with `!canEmail`: still selectable; show *Sin correo* badge/text in Correo cell.
  4. Header checkbox: `indeterminate` when `someVisibleSelected && !allVisibleSelected` (set via ref on input if needed).
  5. Link placa to `/vehicles/[vehicleId]` (optional but useful — match other admin tables).
  6. `onOptOut(item)` opens confirm dialog (Step 9).
- **Dependencies:** `Button`, checkbox inputs, format helper.
- **Implementation Notes:** Accessible labels: `aria-label={`Seleccionar ${licensePlate}`}`.

---

### Step 7: Opted-Out Table

- **File:** `components/OptedOutRemindersTable.tsx` (new)
- **Action:** List exclusions with reactivate action.
- **Component Signature:**

```typescript
export function OptedOutRemindersTable({
  items,
  onOptIn,
  isOptInPending,
}: { /* props */ })
```

- **Implementation Steps:**
  1. Columns: Placa, Modelo, Propietario, Excluido el, Excluido por, Acciones (**Reactivar**).
  2. `ownerName` null-safe → *—*.
  3. `excludedBy` null → *—*.
  4. Empty state handled by parent when `items.length === 0`.
- **Dependencies:** format helper, `Button`.

---

### Step 8: Send Reminders Dialog (Confirm + Summary)

- **File:** `components/SendRemindersDialog.tsx` (new)
- **Action:** Two-step modal: confirm counts → execute → show summary.
- **Component Signature:**

```typescript
export function SendRemindersDialog({
  open,
  onOpenChange,
  selectedItems,
  onCompleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: EligibleReminderItem[];
  onCompleted: (response: SendRemindersResponse) => void;
})
```

- **Implementation Steps:**
  1. **Step `confirm`:**  
     - Copy: *“Se intentará enviar recordatorio a {N} vehículo(s). {M} sin correo se omitirán automáticamente.”*  
     - Compute `M = selectedItems.filter(i => !i.canEmail).length`.  
     - Primary **Enviar recordatorios**; secondary Cancelar.
  2. On confirm: `useSendReminders.mutateAsync(selectedIds)`.
  3. **Step `summary`:**  
     - Show counts from `response.summary` (sent / skipped / failed).  
     - Optional compact table of `results` with plate + `mapReminderEmailStatusLabel`.  
     - Button **Cerrar** → reset step, close, call `onCompleted`.
  4. On error before summary: show `mapRemindersError` inside modal; stay on confirm step.
  5. Disable buttons while `isPending`; label *Enviando...*.
  6. Reset internal step when `open` becomes false (`useEffect`).
- **Dependencies:** `Modal`, `useSendReminders`, mapping helpers.
- **Implementation Notes:** HTTP 200 with partial failures is success — always show summary step, not error toast only.

---

### Step 9: Opt-Out Confirm Dialog

- **File:** `components/OptOutReminderDialog.tsx` (new)
- **Action:** Confirm permanent exclusion (reversible in exclusions tab).
- **Component Signature:**

```typescript
export function OptOutReminderDialog({
  target,
  open,
  onOpenChange,
  onSuccess,
}: {
  target: Pick<EligibleReminderItem, 'vehicleId' | 'licensePlate'> | null;
  /* ... */
})
```

- **Implementation Steps:**
  1. Copy: *“¿Marcar {placa} como «No volver a recordar»? El vehículo dejará de aparecer en la lista de elegibles.”*
  2. Confirm → `useReminderOptOut.mutateAsync(vehicleId)`.
  3. Success: close, toast *“Vehículo excluido de recordatorios”*, clear selection for that id, parent refetches.
  4. `404` → Spanish not found via `mapRemindersError`.
- **Dependencies:** Mirror `MarkDeliveredDialog` / `DeactivateUserDialog` patterns.

---

### Step 10: Reminders Page Shell

- **File:** `components/RemindersPage.tsx` (new)
- **Action:** Orchestrate tabs, toolbar, selection state, dialogs, toasts.
- **Component Signature:**

```typescript
export function RemindersPage()
```

- **Implementation Steps:**
  1. **Header:** title *Recordatorios de mantenimiento*; subtitle explaining 6-month inactivity (use `thresholdDays` from API when loaded: *“Vehículos con más de {thresholdDays} días sin visita entregada”*).
  2. **Toolbar:** **Actualizar** button (`refetch` active query); optional search input → debounced `q` (300ms) if implementing V2 filter.
  3. **Tabs:** simple button group (no new dependency):
     - *Elegibles* (default)
     - *Exclusiones*
     Style like D1 contact filter segmented control (`border rounded-lg p-1`).
  4. **Eligible tab:**
     - `useEligibleReminders({ q })`
     - Selection state: `Set<string>` helpers `toggleRow`, `toggleAllVisible`, `clearSelection`
     - **Enviar recordatorio** primary button — `disabled` when `selectedIds.size === 0`
     - Render `EligibleRemindersTable` or `EmptyState`: *“No hay vehículos pendientes de recordatorio.”*
     - Loading / error banners (same patterns as `DeliveryPanelPage`)
  5. **Exclusions tab:**
     - `useOptedOutReminders({ enabled: activeTab === 'exclusions' })`
     - `OptedOutRemindersTable`; empty: *“No hay vehículos excluidos.”*
     - **Reactivar** → `useReminderOptIn` with confirm optional (lightweight: direct call + toast *“Vehículo reactivado”* — add confirm if product prefers)
  6. Wire `SendRemindersDialog` + `OptOutReminderDialog`.
  7. On send complete: `clearSelection()`, toast via `mapSendSummaryToToast`, refetch eligible list.
  8. Toast auto-dismiss 3s (`useEffect` pattern from `DeliveryPanelPage`).
- **Dependencies:** Steps 3–9, shared UI components.
- **Implementation Notes:** Keep all user-facing strings in Spanish.

---

### Step 11: App Router Page + Nav

- **Files:**
  - `apps/web/src/app/admin/reminders/page.tsx` (new)
  - `apps/web/src/shared/components/RoleNav.tsx`
- **Action:** Register route and admin nav link.
- **Implementation Steps:**
  1. **page.tsx:**

```typescript
import type { Metadata } from 'next';
import { RemindersPage } from '@/features/reminders/components/RemindersPage';

export const metadata: Metadata = {
  title: 'Recordatorios — MecaTrack',
};

export default function AdminRemindersPage() {
  return <RemindersPage />;
}
```

  2. **RoleNav:** add to `ADMIN_NAV` after delivery link (or before Clientes):

```typescript
{ href: '/admin/reminders', label: 'Recordatorios' },
```

  3. Verify active state highlights for `/admin/reminders`.
  4. Mechanic nav unchanged — no link.
- **Dependencies:** Step 10.
- **Implementation Notes:** Admin layout already wraps `ProtectedRoute allowedRoles={['ADMIN']}` — no layout change required.

---

### Step 12: Playwright E2E

- **File:** `apps/web/e2e/reminders.spec.ts` (new)
- **Action:** Cover happy paths with API-backed UI (seed or test helpers).
- **Implementation Steps:**
  1. **Setup strategy:** Prefer API seed/fixture if project has one; otherwise document dependency on seeded DB with a vehicle delivered >180 days ago. Minimal approach:
     - Use admin `storageState`
     - Call API directly in test `request` context to deliver old WO OR rely on pre-seeded data + skip if empty (avoid flaky skip — add seed script note in test comment)
  2. **Admin access:** Navigate to `/admin/reminders`; heading visible; nav link **Recordatorios** present.
  3. **List:** If eligible rows exist, assert column headers (Placa, Modelo, Propietario, Correo, Última visita, Días sin visita, Último recordatorio).
  4. **Selection:** Check one row → **Enviar recordatorio** enabled; select-all header selects visible rows.
  5. **Send flow:** Open dialog → confirm text mentions count → confirm → summary shows sent/skipped counts → close.
  6. **Opt-out:** Row action **No volver a recordar** → confirm → row disappears; switch to **Exclusiones** tab → vehicle listed → **Reactivar**.
  7. **Mechanic regression:** Mechanic session → `/admin/reminders` → `/403` or redirect (match existing admin guard behavior).
  8. **Empty state:** If no eligibles, assert empty copy (may run as separate test with isolated env).
- **Dependencies:** Playwright admin auth, running API + web.
- **Implementation Notes:** Email may be `skipped_disabled` in CI — assert summary UI, not real SMTP.

---

### Step 13: Update Technical Documentation

- **Action:** Mandatory docs update.
- **Implementation Steps:**
  1. **Review changes:** route, nav, feature folder, API client, e2e.
  2. **Update `apps/web/README.md`:**
     - Add **Reminders (US-D4)** section: route `/admin/reminders`, ADMIN only, features (eligible list, batch send, exclusions), React Query keys `['reminders', 'eligible']`, `['reminders', 'opted-out']`.
     - Add row to routes table if present.
  3. Keep `docs/plans/US-D4_frontend.md` aligned if behavior drifts during implementation.
  4. No frontend OpenAPI unless project dual-docs — backend owns API spec.
  5. Report updated files in PR/commit notes.
- **References:** `docs/documentation-standards.mdc`, `docs/frontend-standards.mdc`.
- **Notes:** Do not skip.

---

## Implementation Order

1. Step 0 — Ensure `feature-entrega2-RFM` + backend ready
2. Step 1 — Types
3. Step 2 — `remindersApi`
4. Step 3 — React Query hooks
5. Step 4 — Error + email status mapping
6. Step 5 — Date formatting helper
7. Step 6 — `EligibleRemindersTable`
8. Step 7 — `OptedOutRemindersTable`
9. Step 8 — `SendRemindersDialog`
10. Step 9 — `OptOutReminderDialog`
11. Step 10 — `RemindersPage`
12. Step 11 — Route + `RoleNav`
13. Step 12 — Playwright e2e
14. Step 13 — Documentation

---

## Testing Checklist

- [ ] `/admin/reminders` loads for ADMIN; mechanic blocked
- [ ] **Recordatorios** nav link visible only for admin
- [ ] Eligible table columns match US; `daysSinceVisit` and dates formatted
- [ ] Rows without email show *Sin correo* but remain selectable
- [ ] Select one / select all visible / deselect works
- [ ] **Enviar recordatorio** disabled when none selected
- [ ] Confirm dialog shows N and M (no email) counts
- [ ] Post-send summary shows sent/skipped/failed; partial success does not throw UI error
- [ ] `lastReminderSentAt` updates in list after successful send (refetch)
- [ ] Opt-out removes row from eligible; appears under Exclusiones
- [ ] Opt-in from exclusions removes from exclusions list; reappears in eligible only if backend rules allow
- [ ] **Actualizar** refetches active tab
- [ ] Empty states for both tabs
- [ ] API errors mapped to Spanish
- [ ] Playwright scenarios green (or documented seed requirement)

---

## Error Handling Patterns

| Source | UI behavior |
|--------|-------------|
| Eligible/opted-out query error | Alert banner on page via `mapRemindersError` |
| Send mutation error (400/5xx before results) | Inline error in dialog; keep dialog open |
| Send mutation 200 with mixed results | Summary step — not an error |
| Opt-out/in 404 | Toast or dialog alert; refetch lists |
| Opt-out/in pending | Disable confirm buttons |
| Selection cleared after successful send | Prevent accidental resend |

Never display raw English `warning` from API in primary UI — use `mapReminderEmailStatusLabel`.

---

## UI/UX Considerations

- **Language:** All user-facing strings in **Spanish**; dates `es-CR`.
- **Accessibility:** Checkbox labels; dialog `role="dialog"` via `Modal`; table headers `scope="col"`; status not color-only (text labels for *Sin correo*).
- **Responsive:** `overflow-x-auto` on tables; toolbar wraps on small screens.
- **Feedback:** Toasts for opt-out/in and send summary; loading spinners on initial fetch; button pending labels.
- **Select-all clarity:** Subtitle or helper text that selection is **lista visible** only.
- **No auto-send:** User must confirm batch — no background sending on page load.
- **Visual hierarchy:** Primary CTA **Enviar recordatorio** in eligible tab toolbar; destructive opt-out as row-level ghost button.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-D4 backend | All `/reminders/*` endpoints |
| US-D2 backend | Email sending (`EmailPort`); FE only displays statuses |
| US-008 patterns | Table/modal/toast conventions |
| Admin layout | Existing `ProtectedRoute` |
| React Query | Already in app |
| Playwright | E2e |
| **No new npm packages** | Button group tabs inline; no headless UI tab library required |

---

## Notes

- **Branch:** Always `feature-entrega2-RFM` for this delivery.
- **Code vs UI language:** TypeScript identifiers English; UI Spanish.
- **Current owner:** List shows active ownership email/name (D3-aware) — no FE special case beyond displaying API fields.
- **Batch limit:** 100 IDs — if user selects more (future pagination), disable send or truncate with message; V2 full list unlikely to exceed 100 in workshop scale.
- **EMAIL_ENABLED=false:** Expect `skipped_disabled` in summary — not a frontend error.
- **Optional search `q`:** Implement if time permits; not blocking DoD if backend supports but UI skips — document in README either way.
- **Reuse with D2:** Consider extracting shared `EmailStatus` base type later; keep D4 mapper separate initially to avoid blocking on D2 merge order.

---

## Next Steps After Implementation

1. Commit on `feature-entrega2-RFM` (with backend D4 if not already committed).
2. Manual smoke: seed old delivered WO → send with console email → opt-out → opt-in.
3. Plan/implement US-D5 (client email search) to help fix *Sin correo* rows from client profile.

---

## Implementation Verification

### Code Quality

- [ ] Feature isolated under `features/reminders/`
- [ ] Playwright only (no Cypress)
- [ ] Query keys namespaced `['reminders', ...]`
- [ ] Matches existing table/modal styling

### Functionality

- [ ] Eligible list + batch send + summary complete
- [ ] Opt-out/in + exclusions tab complete
- [ ] Selection + confirm copy accurate

### Testing

- [ ] E2E covers send + opt-out/in + admin guard
- [ ] Manual partial-batch scenario verified

### Integration

- [ ] Contracts match `docs/plans/US-D4_backend.md`
- [ ] Works with US-D2 email disabled/console modes

### Documentation

- [ ] Step 13 completed (`apps/web/README.md` updated)
