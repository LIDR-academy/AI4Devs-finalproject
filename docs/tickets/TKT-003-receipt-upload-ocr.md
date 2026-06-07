# TKT-003 - Receipt Upload and OCR Extraction

## Metadata
- Type: Backend-focused Full-Stack
- Priority: P0
- User Story: US-003
- Main domains: Receipts, OCR

## Objective
Implement receipt upload and OCR extraction flow with reviewable extracted lines.

## Scope
In scope:
- Upload endpoint.
- Receipt metadata persistence.
- OCR processing and line extraction.
- Review/confirm endpoint.

Out of scope:
- OCR model tuning.
- Advanced correction UX.

## API
- POST /api/receipts/upload
- GET /api/receipts/:id
- POST /api/receipts/:id/confirm-items

## Data
- RECEIPT
- RECEIPT_ITEM
- Optional link to PANTRY_ITEM

## Technical tasks
1. Validate uploaded file type and size.
2. Persist storage metadata and processing status.
3. Integrate OCR adapter and map extracted lines.
4. Provide receipt status polling endpoint.
5. Persist user confirmations atomically.

## Error handling
- Unsupported file -> 400.
- OCR timeout/failure -> 502/503 with safe retry strategy.
- Receipt not found -> 404.

## Security
- Private storage ACL by default.
- Household access checks for every operation.

## Testing
- Unit: extraction mapper.
- Integration: upload -> process -> confirm lifecycle.
- E2E: upload and review flow.

## Acceptance criteria
1. Upload creates receipt with processing state.
2. OCR generates extracted line items for readable receipts.
3. User can confirm reviewed items.

## Definition of done
- Receipt lifecycle instrumentation and logs in place.
- End-to-end flow validated.
