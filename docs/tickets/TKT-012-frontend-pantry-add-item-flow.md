# TKT-012 - Frontend Pantry Add Item Flow

## 1. Ticket metadata
- Type: Frontend
- Priority: P0
- Related user stories: US-002
- Related FR: FR-2
- Owner profile: Frontend engineer

## 2. Objective
Complete the remaining gaps in the manual add-item flow. The core flow is already
implemented: the `/add/manual` form (name, quantity, unit selector with default,
optional expiration with estimate, plus price, price-per-unit, category, location,
notes and emoji), the entry point from the pantry bottom-nav, the create-item API
integration with in-flight submit disabling, inline validation gating, and the
pantry list refresh on return. This ticket covers the outstanding observability,
testing, input-hygiene, validation-granularity, and UX-polish items.

## 3. Business value
Guarantees inventory tracking even without receipt upload and supports daily pantry
usage from first session. The remaining work hardens correctness, adds the test
coverage required by the DoD, and provides the product analytics needed to track
adoption and validation drop-off.

## 4. Remaining scope

### 4.1 Observability events (§13 — not implemented)
There is currently no client analytics layer. Add lightweight event emission for the
add-item flow:
- `pantry_add_item_opened` — when the manual add form mounts.
- `pantry_add_item_submitted` — on submit attempt (after client validation passes).
- `pantry_add_item_success` — after a successful create.
- `pantry_add_item_failed` — on create failure (include a coarse error reason, never PII or tokens).

Implement a minimal `trackEvent(name, props?)` util under `front/src/shared/` (or
`front/src/lib/`) that is a no-op when no analytics sink is configured, so it is safe
in all environments. Wire the four events into `add.manual.tsx`.

### 4.2 Frontend unit/component tests (§12 — no framework wired)
The frontend has no unit/component test runner (only Playwright e2e). Add Vitest +
React Testing Library and cover:
- Validation rules: empty name, quantity `< 1`, non-integer quantity, negative price.
- Submit button disabled while a request is in flight.
- Successful create calls the API with a trimmed, correctly-typed payload.
- API failure renders a retry-friendly error state.
Add the test script to `front/package.json` (e.g. `"test": "vitest run"`).

### 4.3 Input sanitization before submit (§11 — partial)
`name` is validated with `.trim()` but submitted untrimmed. Trim `name` (and any other
free-text fields sent to the API) in the create payload so stored data is clean.

### 4.4 Field-level inline validation (§6.4 / §10 — partial)
Validation currently surfaces a single combined error banner. Show actionable,
field-level messages adjacent to the offending input (name, quantity, price) and wire
`aria-describedby` / `aria-invalid` for accessible error announcement.

### 4.5 Success toast + highlight newly added item (§7 — not implemented)
- Use the already-installed `sonner` toast for the success confirmation (the current
  inline "Added to pantry" button state can remain as a secondary cue).
- On return to `/pantry`, briefly highlight the newly created item (e.g. pass the new
  item id via navigation state/search param and apply a transient highlight style).

### 4.6 Preserve pantry filters/sort on return (§8 — not implemented)
Returning to the pantry resets the active filter/search. Preserve the filter, search,
and sort state across the add round-trip (e.g. persist in URL search params or a small
store) so the user lands back where they were.

### 4.7 Full E2E journey (§12 — partial)
The existing e2e starts at `/add` and asserts the request payload. Add a scenario that
starts on `/pantry`, navigates through the bottom-nav to manual add, completes a
create, and verifies the new item appears in the pantry list.

### 4.8 403 household-access warning (§10 — minor)
A 403 from the create endpoint currently shows the generic error. Map it to an explicit
household-access warning message. Low priority for the single-household MVP.

## 5. Error handling (unchanged contract)
- Validation error (400): show field-level messages (see §4.4).
- Auth/session error (401): redirect to login (already handled by the route guard).
- Access denied (403): show household access warning (see §4.8).
- Server error (5xx): show retryable generic error.

## 6. Acceptance criteria (outstanding)
1. The four `pantry_add_item_*` events fire at the correct points and never include tokens/PII.
2. Vitest + RTL are wired and the unit/component tests in §4.2 pass via `npm run test` in `front/`.
3. The create payload sends trimmed free-text fields.
4. Validation errors render inline at the field level with accessible announcements.
5. A success toast is shown and the newly added item is highlighted on the pantry list.
6. Pantry filter/search/sort survive the add round-trip.
7. An e2e test covers pantry → manual add → list verification.

## 7. Definition of done
- Analytics events implemented behind a safe no-op `trackEvent` util.
- Vitest/RTL configured; unit/component tests passing.
- Field-level validation and input trimming in place.
- Success toast + new-item highlight + preserved filters implemented.
- Full e2e journey (pantry → add → list) passing alongside the existing manual/estimate specs.
- Linked to US-002 traceability section.
