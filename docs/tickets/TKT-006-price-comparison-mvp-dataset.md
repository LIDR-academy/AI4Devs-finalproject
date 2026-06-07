# TKT-006 - Price Comparison with MVP Dataset

## Metadata
- Type: Full-Stack
- Priority: P2
- User Story: US-006
- Main domains: Insights

## Objective
Implement a price comparison view backed by a controlled internal reference dataset.

## Scope
In scope:
- Comparison endpoint by normalized name.
- Frontend compare view and unavailable state.

Out of scope:
- Live external price integrations.

## API
- GET /api/insights/price-comparison?normalizedName=

## Data
- PRICE_CATALOG_ITEM
- Optional RECEIPT_ITEM context

## Technical tasks
1. Implement normalized-name lookup and latest-effective-date selection.
2. Build compare-prices UI view from item action.
3. Handle no-data state with user guidance.

## Testing
- Unit: matcher and fallback behavior.
- Integration: endpoint response for matched/unmatched cases.
- E2E: open comparison from pantry item and validate UI states.

## Acceptance criteria
1. Matched items show reference values.
2. Unmatched items show explicit unavailable state.
3. Feature works without external API dependencies.

## Definition of done
- Match and no-match scenarios tested and documented.
