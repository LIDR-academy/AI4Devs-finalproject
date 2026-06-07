# TKT-012 - Frontend Pantry Add Item Flow

## 1. Ticket metadata
- Type: Frontend
- Priority: P0
- Related user stories: US-002
- Related FR: FR-2
- Owner profile: Frontend engineer

## 2. Objective
Implement the manual add-item flow in the mobile-first UI so users can create pantry items quickly with clear validation and immediate list feedback.

## 3. Business value
Guarantees inventory tracking even without receipt upload and supports daily pantry usage from first session.

## 4. Scope
In scope:
- Add-item form UI and client validation.
- API integration for item creation.
- Pantry list refresh and success/error feedback.
- UX consistency with pantry and add item design screens.

Out of scope:
- Barcode scanning.
- Bulk import.
- Advanced nutrition metadata fields.

## 5. Technical context
- Main screens: Pantry and Add Item.
- Related components: form controls, unit selector, date picker, toast/inline error states.
- API: POST /api/pantry/items and GET /api/pantry/items.

## 6. Functional requirements for implementation
1. User can open add-item flow from pantry screen.
2. Required fields are name and quantity.
3. Expiration date is optional.
4. Validation messages are shown inline and are actionable.
5. Successful submission updates pantry list without full page reload.

## 7. UX and interaction details
- Field set:
  - Name (text, required)
  - Quantity (number, required, >0)
  - Unit (select, required with default)
  - Expiration date (optional date)
- Interaction behavior:
  - Save button disabled while request is in flight.
  - Show success toast on create.
  - Return user to pantry list and highlight newly added item.

## 8. State and data management
- Local form state with schema-based validation.
- Request state: idle/loading/success/error.
- Cache strategy:
  - Invalidate pantry list query on success.
  - Preserve filters/sort when returning to list.

## 9. Implementation plan
1. Build add-item form component with reusable input controls.
2. Add client validation schema matching backend DTO.
3. Integrate create-item mutation and loading/error states.
4. Refresh pantry list and ensure optimistic UX.
5. Add accessibility support for labels and error announcements.

## 10. Error handling
- Validation error (400): show field-level messages.
- Auth/session error (401): redirect to login.
- Access denied (403): show household access warning.
- Server error (5xx): show retryable generic error.

## 11. Security and privacy
- Never log auth tokens in client console.
- Sanitize and trim user input before submit.
- Respect authenticated session lifecycle.

## 12. Testing strategy
Unit tests:
- Form validation rules.
- Disabled submit behavior while loading.

Component/integration tests:
- Successful create flow updates pantry list.
- Invalid payload shows expected inline errors.
- API failure shows retry-friendly error state.

E2E tests:
- From pantry screen to add-item completion and list verification.

## 13. Observability
- UI events:
  - pantry_add_item_opened
  - pantry_add_item_submitted
  - pantry_add_item_success
  - pantry_add_item_failed
- Track form completion rate and validation drop-off.

## 14. Dependencies
- Auth/session provider.
- Pantry list query endpoint.
- Unit list/config for quantity units.

## 15. Risks and mitigations
- Excessive validation friction:
  - Mitigation: clear defaults and concise helper text.
- Double submit:
  - Mitigation: disable submit during loading and dedupe mutation.
- Inconsistent unit handling:
  - Mitigation: shared unit enum with backend.

## 16. Acceptance criteria
1. User can create pantry item with required fields.
2. Optional expiration date is persisted when provided.
3. Field validation errors are displayed correctly.
4. Pantry list refreshes and shows new item after success.
5. Flow remains usable on mobile viewport sizes.

## 17. Definition of done
- UI implemented with responsive behavior and accessibility checks.
- Unit/component tests passing.
- E2E happy path passing.
- Linked to US-002 traceability section.
