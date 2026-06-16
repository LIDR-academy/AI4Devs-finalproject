# TKT-014 - MVP Hardening: Database Schema, Backend Receipts, and Frontend Pantry

## 1. Ticket metadata
- Type: Full-Stack (Database + Backend + Frontend)
- Priority: P0
- Related user stories: US-002, US-003, US-004, US-008, US-009, US-010
- Related FR: FR-2, FR-3, FR-4, FR-18, FR-19, FR-20, FR-21, FR-22, FR-23, FR-24, FR-25
- Consolidates: TKT-011, TKT-012, TKT-013

## 2. Objective
Complete the remaining gaps across database schema, backend receipt pipeline, and frontend pantry add-item flow to bring the Functional MVP deliverable to full definition-of-done compliance.

## 3. Business value
Closes the correctness, integrity, observability, and test-coverage gaps that exist across all three layers. A complete schema ensures shared household workflows are data-safe; a hardened receipt pipeline prevents re-confirmation bugs and enables household-scoped access; frontend hardening guarantees clean stored data, field-level feedback, and a full test suite.

## 4. Scope

### 4.A Database — Core schema and migrations (from TKT-013)

#### Phase 1 — Collaboration core
- Create `HOUSEHOLD`, `HOUSEHOLD_MEMBER`, `HOUSEHOLD_INVITATION` tables.
- Add `UNIQUE(household_id, user_id)` for membership.

#### Phase 2 — Pantry and expiry
- Create `PANTRY_ITEM` and `EXPIRATION_ASSESSMENT` tables.
- Add constraints for quantity, status, and expiration source/method.

#### Phase 3 — Events and notifications
- Create `CONSUMPTION_EVENT` and `NOTIFICATION_PREFERENCE` tables.
- Add uniqueness on `NOTIFICATION_PREFERENCE.user_id`.

#### Phase 4 — Hardening
- Add FK indexes for all foreign keys.
- Add composite pantry query index: `(household_id, status, expiration_date)`.
- Add event timeline index: `(pantry_item_id, event_at DESC)`.
- Add invitation lookup index: `(lower(invitee_email), status)`.
- Validate migration rollback in dev.

**Prisma alignment requirements:**
- Keep Prisma models synchronized with SQL migrations.
- Use model-level indexes and unique constraints in Prisma schema.
- Enforce enum values consistently between Prisma and DB check constraints.
- Use `Decimal` mapping for quantity and monetary fields.

**Data integrity policies:**
- User identity uses a case-insensitive unique email index.
- User soft-delete must preserve event history.
- Household access enforced by membership relation at query level.
- Event records are append-only for auditability.

**Performance targets:**
- Pantry list query p95 under 250 ms in dev baseline dataset.
- Event insertion under 100 ms p95.

---

### 4.B Backend — Receipt pipeline gaps (from TKT-011)

#### B.1 Household association on Receipt
- Add `householdId String?` to `Receipt` in Prisma (nullable to avoid breaking existing rows; required on create).
- In `uploadAndProcess`: resolve the caller's active household from `userId` and persist `householdId`.
- In `getById` / `getStatus` / `confirmItems`: allow access if `receipt.userId` belongs to any active member of the caller's household, not just the original uploader.

#### B.2 `normalizedName` field on ReceiptItem
- Add `normalizedName String` to `ReceiptItem` in Prisma schema.
- Update `mapExtractedLineToCreateInput` to populate `rawName` (original OCR text) and `normalizedName` (whitespace-collapsed, trimmed).

#### B.3 `PENDING` status in `ReceiptProcessingStatus` enum
- Add `PENDING` to the enum so the full lifecycle is `PENDING → PROCESSING → COMPLETED | FAILED`.
- Create receipts with `ocrStatus: PENDING`.
- Transition to `PROCESSING` immediately before calling the OCR adapter inside `extractLinesWithRetry`.

#### B.4 409 conflict for already-confirmed receipts
- Track confirmed state via `confirmedAt DateTime?` on `Receipt` or by checking all items are `userConfirmed`.
- Throw `ConflictException` with a meaningful message when `confirmItems` is called on an already-finalized receipt.

#### B.5 Local dev adapters (no AWS credentials required)
- Create `back/src/integrations/aws-s3/local-receipt-storage.service.ts`: saves files to `tmp/receipts/`, returns a fake bucket/key pair.
- Create `back/src/integrations/aws-textract/local-receipt-ocr.service.ts`: returns a hardcoded `OcrExtractedLine[]` (e.g. `[{ rawName: "Local test item", quantity: 1, unit: "unit" }]`).
- Wire `receipts.module.ts` to use local adapters when `NODE_ENV !== production` or `USE_LOCAL_ADAPTERS=true`.

#### B.6 Missing unit tests
| Test file | Coverage |
|-----------|----------|
| `receipts.service.spec.ts` | `requireValidFile`: rejects missing file, wrong MIME type, oversized file |
| `aws-textract-receipt-ocr.service.spec.ts` | `extractLineItems` happy path, `extractPlainLines` fallback, `parseMoneyValue` edge cases (comma decimal, EUR symbol), transient/timeout error classification |
| `receipts.service.spec.ts` (confirm block) | 409 thrown when receipt already confirmed; 400 when `itemId` does not belong to receipt |
| Contract tests | Response shapes for `POST /upload`, `GET /:id`, `POST /:id/confirm-items` match OpenAPI schemas |

#### B.7 Metrics counters
| Counter | Increment point |
|---------|-----------------|
| `receipt_upload_success_total` | After OCR completes successfully |
| `receipt_upload_failure_total` | After OCR fails (FAILED status set) |
| `ocr_processing_duration_ms` | Duration of `extractLinesWithRetry` |
| `ocr_failure_total` | Each failed OCR attempt including retried ones |
| `receipt_confirmation_total` | After `confirmItems` succeeds |

Use the existing NestJS metrics pattern or a simple in-process counter if no metrics library is wired yet.

---

### 4.C Frontend — Pantry add-item gaps (from TKT-012)

#### C.1 Observability events
Add a minimal `trackEvent(name, props?)` util under `front/src/shared/` that is a no-op when no analytics sink is configured. Wire these four events in `add.manual.tsx`:
- `pantry_add_item_opened` — when the form mounts.
- `pantry_add_item_submitted` — on submit attempt after client validation passes.
- `pantry_add_item_success` — after a successful create.
- `pantry_add_item_failed` — on create failure (coarse error reason only, never PII or tokens).

#### C.2 Unit/component tests (Vitest + RTL)
No unit/component test runner exists in the frontend (only Playwright e2e). Add Vitest + React Testing Library and cover:
- Validation rules: empty name, quantity < 1, non-integer quantity, negative price.
- Submit button disabled while a request is in flight.
- Successful create calls the API with a trimmed, correctly-typed payload.
- API failure renders a retry-friendly error state.
Add `"test": "vitest run"` to `front/package.json`.

#### C.3 Input sanitization before submit
`name` is validated with `.trim()` but submitted untrimmed. Trim `name` and all other free-text fields in the create payload before sending.

#### C.4 Field-level inline validation
Validation currently surfaces a single combined error banner. Show actionable, field-level messages adjacent to the offending inputs (name, quantity, price) and wire `aria-describedby` / `aria-invalid` for accessible error announcement.

#### C.5 Success toast and new-item highlight
- Use the already-installed `sonner` toast for the success confirmation.
- On return to `/pantry`, briefly highlight the newly created item (pass the new item id via navigation state/search param and apply a transient highlight style).

#### C.6 Preserve pantry filters and sort on return
Returning to `/pantry` currently resets the active filter/search. Persist filter, search, and sort state across the add round-trip via URL search params or a small store.

#### C.7 Full E2E journey
Add a Playwright scenario that starts on `/pantry`, navigates through the bottom-nav to manual add, completes a create, and verifies the new item appears in the pantry list.

#### C.8 403 household-access warning (low priority)
Map a 403 response from the create endpoint to an explicit household-access warning message instead of the generic error. Low priority for the single-household MVP.

---

## 5. Implementation plan

1. Run database migrations Phase 1–4 (§4.A); generate Prisma client.
2. Add `PENDING` to enum and `normalizedName` to `ReceiptItem`; run migration (§B.3, §B.2).
3. Add `householdId` to `Receipt`; run migration (§B.1).
4. Update `ReceiptsService`: `PENDING → PROCESSING` transition, `householdId` resolution, `normalizedName` population (§B.1–B.3).
5. Add 409 guard to `confirmItems` (§B.4).
6. Create local dev adapters and wire module conditionally (§B.5).
7. Write all missing backend unit tests (§B.6).
8. Add metrics counters (§B.7).
9. Implement `trackEvent` util and wire four events into `add.manual.tsx` (§C.1).
10. Add Vitest + RTL; write unit/component tests (§C.2).
11. Apply input trimming to create payload (§C.3).
12. Replace combined error banner with field-level validation messages and ARIA attrs (§C.4).
13. Add success toast and transient highlight for newly added item (§C.5).
14. Persist pantry filters/sort state across add round-trip (§C.6).
15. Add full Playwright E2E journey (§C.7).
16. Map 403 to household-access warning (§C.8).

## 6. Error handling reference
- 400: invalid file type/size, malformed payload, receipt not ready, field validation failure.
- 401: unauthorized; redirect to login (handled by route guard).
- 403: household access denied; show explicit household-access warning.
- 404: receipt or item not found.
- 409: re-confirmation of already-finalized receipt.
- 5xx: retryable generic error.

## 7. Acceptance criteria
1. All four migration phases applied and validated in dev without rollback errors.
2. Prisma schema and generated client match the migrated database.
3. Required indexes exist and appear in critical query plans via `EXPLAIN ANALYZE`.
4. A household member who did not upload a receipt can retrieve and confirm it.
5. `ReceiptItem` rows carry both `rawName` and `normalizedName`.
6. Receipt lifecycle transitions `PENDING → PROCESSING → COMPLETED | FAILED`.
7. Re-confirming a finalized receipt returns 409.
8. Local development works without AWS credentials.
9. All backend unit tests in §B.6 pass.
10. All five metrics counters increment in the happy path.
11. The four `pantry_add_item_*` events fire at the correct lifecycle points and never include tokens or PII.
12. Vitest + RTL are wired; all unit/component tests in §C.2 pass via `npm run test` in `front/`.
13. The create payload sends trimmed free-text values.
14. Validation errors appear inline at field level with ARIA-compliant announcements.
15. A success toast displays and the newly added item is highlighted on the pantry list.
16. Pantry filter/search/sort state is preserved across the add round-trip.
17. The full E2E journey (pantry → manual add → list verification) passes.

## 8. Definition of done
- All migration phases applied; Prisma migration history committed.
- DB validation test suite passes (FK constraints, unique constraints, query plans).
- `receipts.module.ts` selects local vs AWS adapters based on environment.
- All backend unit tests pass (`npm run test` in `/back`); no regressions in `receipts.e2e-spec.ts`.
- Metrics counters visible in local or dev environment.
- Analytics `trackEvent` util in place; no-op when sink is unconfigured.
- Vitest/RTL configured; frontend unit/component tests passing.
- Field-level validation, input trimming, success toast, new-item highlight, and filter preservation implemented.
- Full Playwright E2E journey passing alongside existing specs.
- `docs/db/database-model.md` updated if schema details changed.
