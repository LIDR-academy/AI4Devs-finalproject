# Frontend Implementation Plan: US-D5 Client Search by Email

## Overview

Update **`ClientSearchBar`** placeholder (and inherited pickers) to mention **correo**, and add Playwright coverage for email search. **No API client changes** — existing `clientsApi.search` already sends `q`; backend US-D5 widens matching.

**Architecture principles:** minimal UI diff; Spanish copy; Playwright e2e; all surfaces using `ClientSearchBar` inherit the change automatically.

**User story reference:** [`us/Deseables/US-D5-busqueda-clientes-correo.md`](../../us/Deseables/US-D5-busqueda-clientes-correo.md)

**Backend plan:** [`docs/plans/US-D5_backend.md`](./US-D5_backend.md)

**Prerequisites:** US-D5 backend merged on `feature-entrega2-RFM`.

**Out of scope:** New components, debounce changes, layout redesign, separate email search field.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router |
| Server state | React Query (existing `useClientSearch`) |
| E2E | Playwright |

### Files to modify

```
apps/web/src/features/clients/components/ClientSearchBar.tsx   # placeholder
apps/web/e2e/clients.spec.ts                                 # email search tests
apps/web/README.md                                           # search criteria note
```

### Surfaces affected (no code change beyond shared bar)

| Surface | Route / component |
|---------|-------------------|
| Client search page | `/clients` |
| Vehicle create picker | `ClientPicker` |
| Ownership transfer (D3) | `TransferOwnershipDialog` |

### State management

No change — existing debounce, min 2 chars, and query keys remain.

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Branch (required):** `feature-entrega2-RFM`
- **Implementation Steps:**
  1. Confirm US-D5 backend deployed locally or on branch.
  2. Do **not** create `feature/US-D5-frontend`.

---

### Step 1: Update Placeholder Copy

- **File:** `ClientSearchBar.tsx`
- **Action:** Reflect email in search hint.
- **Implementation Steps:**
  1. Change placeholder from *“Nombre, identificación o teléfono”* to *“Nombre, identificación, teléfono o correo”*.
  2. Keep label **Buscar cliente** unchanged (already accessible).
  3. Verify `ClientSearchHint` min-2-chars message unchanged.
- **Dependencies:** None.
- **Implementation Notes:** Grep for duplicate placeholder strings elsewhere — should only live in this component.

---

### Step 2: Verify ClientResultCard (no change expected)

- **File:** `ClientResultCard.tsx`
- **Action:** Confirm email already displayed when present.
- **Implementation Steps:**
  1. Read component — if email line exists, mark as verified in PR notes.
  2. Only change if email hidden today (US says it already shows).
- **Implementation Notes:** DoD does not require card changes.

---

### Step 3: Playwright E2E

- **File:** `e2e/clients.spec.ts`
- **Action:** Assert placeholder + email search.
- **Implementation Steps:**
  1. **Placeholder:** on `/clients`, assert input placeholder includes *correo* (or full string).
  2. **Search by email:** use seed client email (e.g. from seed `Juan Pérez` if email in DB) or create client with email in test:
     - Create client with `email: e2e-${suffix}@test.com`
     - Search `@test.com` or full email
     - Assert result card visible with client name
  3. **Regression:** search by name fragment `Ju` still works (existing test).
  4. Optional: mechanic role same search on `/clients` (if mechanic e2e project exists).
- **Dependencies:** Playwright admin `storageState`, API with D5 backend.
- **Implementation Notes:** Prefer reusing seed data over flaky hard-coded emails when possible.

---

### Step 4: Update Technical Documentation

- **File:** `apps/web/README.md`
- **Action:** Note email in client search criteria (Clients section).
- **Implementation Steps:**
  1. Update search description: unified bar matches name, ID, phone, **email**.
  2. Mention pickers inherit `ClientSearchBar`.
- **References:** `docs/documentation-standards.mdc`.

---

## Implementation Order

1. Step 0 — Branch + backend ready
2. Step 1 — Placeholder
3. Step 2 — Verify result card
4. Step 3 — Playwright
5. Step 4 — Documentation

---

## Testing Checklist

- [ ] Placeholder mentions correo on `/clients`
- [ ] Search by full email finds client
- [ ] Search by domain fragment finds client
- [ ] Name/phone search regression green
- [ ] `ClientPicker` on `/vehicles/new` shows updated placeholder
- [ ] Min 2 chars rule unchanged

---

## Error Handling Patterns

No change — existing `mapClientsError` and empty states apply.

---

## UI/UX Considerations

- **Language:** Spanish placeholder only change.
- **Accessibility:** Label unchanged; placeholder is supplementary.
- **No layout change.**

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-D5 backend | Required for email matches |
| US-003 frontend | Search bar exists |
| **No new npm packages** | |

---

## Notes

- **Branch:** `feature-entrega2-RFM`.
- **Quick win:** ~1 file + e2e + README.
- **Collaterally helps:** D2/D3/D4 flows without extra UI.

---

## Next Steps After Implementation

1. Commit on `feature-entrega2-RFM`
2. Proceed to US-D6 backend plan / implementation

---

## Implementation Verification

### Code Quality

- [ ] Single placeholder string updated

### Functionality

- [ ] Email search end-to-end with backend

### Testing

- [ ] E2E placeholder + email search green

### Documentation

- [ ] README updated
