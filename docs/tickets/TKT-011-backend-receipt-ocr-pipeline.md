# TKT-011 - Backend Receipt Upload and OCR Pipeline

## 1. Ticket metadata
- Type: Backend
- Priority: P0
- Related user stories: US-003, US-004
- Related FR: FR-3, FR-4, FR-20, FR-23
- Owner profile: Backend engineer

## 2. Objective
Complete the remaining gaps in the backend receipt pipeline. Core upload, OCR processing, and confirmation flows are already implemented. This ticket covers the outstanding schema, access control, conflict handling, local dev support, tests, and observability items.

## 3. Remaining scope

### 3.1 Household association on Receipt (schema + access control)
The `Receipt` model only carries `userId`. The ticket requires `householdId` and enforced household membership checks across all flows.

**Schema changes needed:**
- Add `householdId String?` to `Receipt` (nullable to avoid breaking existing rows, require it on create).
- Populate `householdId` from the authenticated user's active household membership on upload.

**Access control changes needed:**
- `uploadAndProcess`: resolve household from `userId` and persist it.
- `getById` / `getStatus` / `confirmItems`: allow access if `receipt.userId` is any active member of the caller's household — not just the uploader.

**Acceptance criterion:** A household member who did not upload a receipt can still retrieve and confirm it.

### 3.2 `normalizedName` field on ReceiptItem (schema)
The data model specifies a `normalized_name` column distinct from `raw_name`. Currently the mapper normalizes whitespace and stores it back under `rawName` with no separate column.

**Change needed:**
- Add `normalizedName String` to `ReceiptItem` in the Prisma schema.
- Update `mapExtractedLineToCreateInput` to populate both `rawName` (original OCR text) and `normalizedName` (whitespace-collapsed, trimmed).

### 3.3 `PENDING` status in `ReceiptProcessingStatus` enum
The enum is `PROCESSING | COMPLETED | FAILED`. The intended lifecycle is `PENDING → PROCESSING → COMPLETED | FAILED`, but receipts are created directly as `PROCESSING`.

**Change needed:**
- Add `PENDING` to the `ReceiptProcessingStatus` enum in `schema.prisma`.
- Create receipts with `ocrStatus: PENDING`.
- Set to `PROCESSING` immediately before calling the OCR adapter (start of `extractLinesWithRetry`).

### 3.4 409 conflict for already-confirmed receipts
`confirmItems` has no guard against re-confirming the same receipt. The error contract requires 409 when the receipt is already finalized.

**Change needed:**
- Track confirmed state — either via a `confirmedAt DateTime?` on `Receipt` or by checking `items.every(item => item.userConfirmed)`.
- Throw `ConflictException` with a meaningful message when confirmation is attempted on an already-confirmed receipt.

### 3.5 Local dev adapters (no AWS credentials required)
`receipts.module.ts` is hardwired to `AwsS3ReceiptStorageService` and `AwsTextractReceiptOcrService`. Running locally without AWS credentials fails on any upload.

**Change needed:**
- Create `back/src/integrations/aws-s3/local-receipt-storage.service.ts` — saves files to a local `tmp/receipts/` directory, returns a fake bucket/key.
- Create `back/src/integrations/aws-textract/local-receipt-ocr.service.ts` — returns a hardcoded set of `OcrExtractedLine` entries (e.g., `[{ rawName: "Local test item", quantity: 1, unit: "unit" }]`).
- Wire the module to use local adapters when `NODE_ENV !== production` (or a dedicated `USE_LOCAL_ADAPTERS=true` env var).

### 3.6 Missing unit tests (§12 testing strategy)
Only `receipt-extraction.mapper.spec.ts` (3 tests) exists. Required but missing:

| Missing test file | What it must cover |
|---|---|
| `receipts.service.spec.ts` | `requireValidFile`: rejects missing file, wrong MIME type, oversized file. |
| `aws-textract-receipt-ocr.service.spec.ts` | `extractLineItems` happy path, `extractPlainLines` fallback, `parseMoneyValue` edge cases (comma decimal, EUR symbol), transient/timeout error classification. |
| `receipts.service.spec.ts` (confirm block) | 409 thrown when receipt already confirmed; 400 when `itemId` does not belong to receipt. |
| Contract tests | Response shapes for POST /upload, GET /:id, POST /:id/confirm-items match OpenAPI schemas. |

### 3.7 Metrics counters (§13 observability)
No instrumentation exists beyond `Logger` calls. Required counters:

| Counter | Increment point |
|---|---|
| `receipt_upload_success_total` | After OCR completes successfully |
| `receipt_upload_failure_total` | After OCR fails (FAILED status set) |
| `ocr_processing_duration_ms` | Duration of `extractLinesWithRetry` call |
| `ocr_failure_total` | Each failed OCR attempt (including retried ones) |
| `receipt_confirmation_total` | After `confirmItems` succeeds |

Use the existing NestJS metrics pattern (or a simple in-process counter if no metrics library is wired yet). Must be visible in local or dev environment.

## 4. Implementation plan
1. Add `PENDING` to enum and `normalizedName` to `ReceiptItem`, run migration.
2. Add `householdId` to `Receipt`, run migration.
3. Update `ReceiptsService.uploadAndProcess` to set `PENDING → PROCESSING`, persist `householdId`, and populate `normalizedName` via mapper.
4. Update `getById` / `getStatus` / `confirmItems` to allow household-scoped access.
5. Add 409 guard to `confirmItems`.
6. Create local dev adapters, update module wiring.
7. Write missing unit tests.
8. Add metrics counters.

## 5. Error handling (unchanged)
- 400: invalid file type/size, malformed payload, receipt not ready.
- 401/403: unauthorized user or household access denied.
- 404: receipt not found.
- 409: confirmation conflict (already finalized).
- 502/503: OCR or storage upstream dependency failure.

## 6. Acceptance criteria (outstanding)
1. A household member who did not upload a receipt can retrieve and confirm it.
2. `ReceiptItem` rows carry both `rawName` and `normalizedName`.
3. Receipt lifecycle transitions `PENDING → PROCESSING → COMPLETED | FAILED`.
4. Re-confirming a finalized receipt returns 409.
5. Local development works without AWS credentials.
6. All unit tests listed in §3.6 pass.
7. All 5 metrics counters increment in the happy path.

## 7. Definition of done
- Schema migrations applied and backwards-compatible.
- `receipts.module.ts` selects local vs AWS adapters based on environment.
- All new unit tests pass (`npm run test` in `/back`).
- Metrics counters visible in local or dev environment.
- No regressions in existing `receipts.e2e-spec.ts`.
