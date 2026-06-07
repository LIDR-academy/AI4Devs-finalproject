# TKT-002 - Pantry Manual Add Item

## Metadata
- Type: Frontend + Backend
- Priority: P0
- User Story: US-002
- Main domains: Pantry

## Objective
Enable manual pantry item creation with fast feedback and robust validation.

## Scope
In scope:
- Add-item form.
- Create item endpoint integration.
- Pantry list refresh behavior.

Out of scope:
- Barcode scan.
- Bulk upload.

## API
- POST /api/pantry/items
- GET /api/pantry/items

## Data
- PANTRY_ITEM
- Authorization through HOUSEHOLD_MEMBER

## Technical tasks
1. Implement backend validation for name/quantity/unit.
2. Enforce household membership before create/list.
3. Build frontend add-item form and submit flow.
4. Handle loading/success/error states.
5. Refresh list on successful create.

## Error handling
- Invalid payload -> 400.
- Unauthorized household access -> 403.
- Server failures -> retryable UI feedback.

## Testing
- Unit: form validation rules.
- Integration: create endpoint and list refresh.
- E2E: add item from UI and verify list visibility.

## Acceptance criteria
1. Required fields are validated.
2. Optional expiration date is supported.
3. Created item appears in pantry list.

## Definition of done
- Flow works on mobile and desktop viewport.
- API and UI tests pass.
