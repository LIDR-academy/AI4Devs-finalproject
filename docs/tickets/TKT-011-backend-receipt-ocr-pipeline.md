# TKT-011 - Backend Receipt Upload and OCR Pipeline

## 1. Ticket metadata
- Type: Backend
- Priority: P0
- Related user stories: US-003, US-004
- Related FR: FR-3, FR-4, FR-20, FR-23
- Owner profile: Backend engineer

## 2. Objective
Implement the backend flow for receipt upload, storage metadata persistence, OCR processing, and extracted line item confirmation support.

## 3. Business value
Reduce manual entry workload and accelerate pantry population by converting receipt images into candidate pantry items.

## 4. Scope
In scope:
- Receipt upload endpoint.
- Object storage integration and metadata persistence.
- OCR invocation and extraction mapping.
- Retrieval endpoint for receipt processing status and extracted lines.
- Confirmation endpoint to persist user-reviewed mappings.

Out of scope:
- OCR model training.
- Advanced document correction UI logic (frontend).
- Live retry dashboards.

## 5. Technical context
- Modules: Receipts module, Storage adapter, OCR adapter.
- Data entities: RECEIPT, RECEIPT_ITEM, optional PANTRY_ITEM mapping.
- Integrations: S3-compatible object storage, Textract-compatible OCR service.

## 6. Functional requirements for implementation
1. Authenticated users can upload a valid receipt image.
2. System stores object reference and receipt metadata in RECEIPT.
3. OCR pipeline processes receipt and creates RECEIPT_ITEM records.
4. System supports nullable pantry mapping until explicit confirmation.
5. Confirmation endpoint updates reviewed line items and mapping status.

## 7. API contract draft
- POST /api/receipts/upload
  - Request: multipart/form-data with image file and householdId.
  - Response 201: receiptId, ocrStatus, createdAt.
- GET /api/receipts/:id
  - Response 200: receipt metadata, ocrStatus, extracted items.
- POST /api/receipts/:id/confirm-items
  - Request: list of reviewed lines and optional pantryItemId mappings.
  - Response 200: confirmation summary.

## 8. Data and persistence details
- RECEIPT fields to populate:
  - household_id, uploaded_by_user_id, storage_bucket, storage_key, ocr_status, created_at.
- RECEIPT_ITEM fields to populate:
  - receipt_id, raw_name, normalized_name, quantity, quantity_unit, unit_price_eur, line_total_eur, user_confirmed.
- Constraints:
  - storage_key NOT NULL.
  - quantity > 0 when quantity is present.
  - price fields >= 0.

## 9. Implementation plan
1. Create DTOs and validation rules for upload and confirmation payloads.
2. Implement upload service:
   - Validate file type and size.
   - Store file in object storage.
   - Create RECEIPT with ocr_status PENDING.
3. Implement OCR worker or async handler:
   - Update status PROCESSING.
   - Parse OCR output into normalized receipt lines.
   - Persist RECEIPT_ITEM entries.
   - Update status COMPLETED or FAILED.
4. Implement receipt detail query endpoint.
5. Implement confirm-items endpoint with transaction handling.
6. Add structured logging and metrics counters.

## 10. Error handling
- 400: invalid file type/size, malformed payload.
- 401/403: unauthorized user or household access denied.
- 404: receipt not found.
- 409: confirmation conflict (already finalized).
- 502/503: OCR or storage upstream dependency failure.

## 11. Security and compliance
- JWT required for all endpoints.
- Household membership must be verified before read/write.
- Uploaded files must be private by default.
- No sensitive OCR raw payloads should be logged.

## 12. Testing strategy
Unit tests:
- Upload validation service.
- OCR mapping parser.
- Confirmation service conflict logic.

Integration tests:
- Upload happy path and metadata persistence.
- OCR status transitions PENDING -> PROCESSING -> COMPLETED/FAILED.
- Confirm-items transaction consistency.

Contract tests:
- Response schemas for the 3 endpoints.

## 13. Observability and operations
- Metrics:
  - receipt_upload_success_total
  - receipt_upload_failure_total
  - ocr_processing_duration_ms
  - ocr_failure_total
  - receipt_confirmation_total
- Logs:
  - Correlation id, receipt id, household id, status transitions.

## 14. Dependencies
- Auth middleware and household authorization policy.
- DB migrations for RECEIPT and RECEIPT_ITEM (if pending).
- Valid cloud credentials/config in environment variables.

## 15. Risks and mitigations
- OCR latency spikes:
  - Mitigation: async processing with polling status endpoint.
- Bad extraction quality:
  - Mitigation: always require user review before final mapping.
- Storage write failures:
  - Mitigation: retry policy and clear failure state.

## 16. Acceptance criteria
1. Upload endpoint accepts valid images and persists receipt metadata.
2. OCR creates at least one RECEIPT_ITEM for readable receipts.
3. Receipt detail endpoint returns status and extracted lines.
4. Confirmation endpoint persists reviewed mappings atomically.
5. Household access control is enforced in all flows.

## 17. Definition of done
- Code merged with passing lint/typecheck/tests.
- API docs updated in docs/api.
- Metrics/logs visible in local or dev environment.
- Manual QA script executed for upload, OCR, and confirmation flow.
