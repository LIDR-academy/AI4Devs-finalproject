# TKT-004 - Expiration Suggestion with Confidence

## Metadata
- Type: Backend + Frontend
- Priority: P0
- User Story: US-004
- Main domains: Expiration intelligence

## Objective
Provide rules-based expiration suggestions with confidence and user override.

## Scope
In scope:
- Suggestion generation endpoint.
- Confidence and method persistence.
- User confirmation/override flow.

Out of scope:
- ML-based auto-learning.

## API
- POST /api/pantry/items/:id/estimate-expiration
- PATCH /api/pantry/items/:id/expiration

## Data
- PANTRY_ITEM
- EXPIRATION_ASSESSMENT

## Technical tasks
1. Implement rules engine by normalized product category.
2. Compute confidence score and estimation method.
3. Persist assessment records.
4. Build UI for confidence labels and override.

## Testing
- Unit: rules and confidence calculator.
- Integration: estimate and override endpoints.
- E2E: user edits suggested expiration date.

## Acceptance criteria
1. Suggestion contains date, confidence, and method.
2. Low-confidence suggestions are clearly marked.
3. User override updates final expiration value.

## Definition of done
- Consistent estimate/override behavior for OCR and manual items.
- Test coverage for low-confidence branch.
