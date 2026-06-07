# RealSaveFooding MVP - User Stories (Rewritten with user-story skill)

Source alignment:
- Product requirements: [3_PRD.md](3_PRD.md)
- System architecture: [../architecture/architecture.md](../architecture/architecture.md)
- Database model: [../db/database-model.md](../db/database-model.md)

## Scope and assumptions

- Scope is MVP only.
- Household collaboration is limited to basic invite and accept flow.
- Expiring threshold is fixed to 3 days.
- Price comparison uses a limited controlled dataset.
- Recipe generation is out of MVP scope.

## US-001

Title: Register and access account

User Story:
As a new user, I want to create an account and log in, so that my pantry data is private and persistent.

Context and assumptions:
- Authentication is email and password based.
- Protected backend routes require JWT.

Acceptance Criteria:
1. User can sign up using email and password.
2. User can log in with valid credentials.
3. Invalid credentials return a clear and consistent error.
4. Access to protected endpoints without JWT is rejected.

Test Scenarios:
1. Register with a valid new email and verify account creation.
2. Log in with correct credentials and verify token issuance.
3. Attempt login with wrong password and verify error handling.
4. Call protected endpoint without token and verify unauthorized response.

Implementation Tasks:
1. Implement signup and login handlers with input validation.
2. Implement password hashing and secure credential checks.
3. Implement JWT generation and middleware/guard validation.
4. Add integration tests for auth success and failure paths.

Non-Goals:
- Social login providers.
- Multi-factor authentication in MVP.

Open Questions:
- What token expiration and refresh policy should be used in MVP?

Readiness Check:
- [x] Clear actor and value.
- [x] Testable acceptance criteria.
- [x] Scope is small enough.
- [x] Dependencies identified.

## US-002

Title: Add pantry item manually

User Story:
As a user, I want to add pantry items manually, so that I can track products when no receipt is available.

Context and assumptions:
- Item creation is available only to authenticated users.
- Item belongs to the active household context.

Acceptance Criteria:
1. User can create an item with name and quantity.
2. Expiration date is optional at creation time.
3. Validation errors are shown for missing required fields.
4. Newly created item appears in the pantry list after save.

Test Scenarios:
1. Create item with valid required fields and verify persistence.
2. Create item with optional expiration date and verify stored value.
3. Submit empty required fields and verify validation messages.

Implementation Tasks:
1. Build item creation API with request validation.
2. Add UI form for manual item creation.
3. Refresh pantry list after successful save.
4. Add tests for required and optional field handling.

Non-Goals:
- Bulk import of manual items.
- Barcode scan entry in MVP.

Open Questions:
- Should quantity unit default be user-configurable in MVP?

Readiness Check:
- [x] Clear actor and value.
- [x] Testable acceptance criteria.
- [x] Scope is small enough.
- [x] Dependencies identified.

## US-003

Title: Upload receipt and extract products

User Story:
As a user, I want to upload a receipt image, so that products are detected automatically.

Context and assumptions:
- Receipt file is stored in object storage.
- OCR pipeline extracts candidate line items.

Acceptance Criteria:
1. User can upload a receipt image file successfully.
2. Backend stores file reference and metadata.
3. OCR processing returns at least one item when text quality is sufficient.
4. User can review extracted items before confirming pantry mapping.

Test Scenarios:
1. Upload valid image and verify storage metadata in RECEIPT.
2. Process readable receipt and verify RECEIPT_ITEM generation.
3. Upload unsupported file type and verify rejection.
4. Review extracted list and verify editable confirmation stage.

Implementation Tasks:
1. Implement file upload endpoint with type/size validation.
2. Persist receipt metadata and storage key.
3. Integrate OCR processing and map output to receipt items.
4. Build review UI for extracted lines before confirmation.

Non-Goals:
- Real-time OCR streaming.
- Perfect OCR precision guarantees.

Open Questions:
- Should OCR be synchronous for MVP or always asynchronous?

Readiness Check:
- [x] Clear actor and value.
- [x] Testable acceptance criteria.
- [x] Scope is small enough.
- [x] Dependencies identified.

## US-004

Title: Suggest expiration dates with confidence

User Story:
As a user, I want expiration date suggestions with confidence, so that I can track freshness with less manual effort.

Context and assumptions:
- Rule-based expiration logic is used in MVP.
- Low-confidence suggestions require user confirmation.

Acceptance Criteria:
1. System proposes an expiration date for eligible items.
2. Each proposal includes confidence and method metadata.
3. Low-confidence proposals are marked as estimates.
4. User can edit suggested expiration before saving.
5. Learning loop from user edits is not persisted in MVP.

Test Scenarios:
1. Create item from OCR line and verify expiration suggestion exists.
2. Verify confidence value and method are stored with assessment.
3. Edit suggested date and verify final stored value reflects user choice.
4. Verify no automatic default-learning behavior after repeated edits.

Implementation Tasks:
1. Implement rules-based expiration service.
2. Persist assessment data in EXPIRATION_ASSESSMENT.
3. Add UI indicators for confidence and estimate state.
4. Add API/UI flow to confirm or override suggestion.

Non-Goals:
- ML training/prediction loop in MVP.
- Category-specific advanced heuristics beyond baseline rules.

Open Questions:
- What is the exact confidence threshold for mandatory confirmation?

Readiness Check:
- [x] Clear actor and value.
- [x] Testable acceptance criteria.
- [x] Scope is small enough.
- [x] Dependencies identified.

## US-005

Title: Receive expiring-soon notifications

User Story:
As a user, I want expiring-soon alerts, so that I can consume food before it goes bad.

Context and assumptions:
- Threshold is fixed to 3 days for MVP.
- User can enable or disable expiry alerts.

Acceptance Criteria:
1. Items within 3-day threshold trigger a notification event.
2. User can toggle expiration alerts on or off.
3. Disabled alerts prevent delivery while preserving item state logic.

Test Scenarios:
1. Set item to 2 days before expiration and verify notification event generation.
2. Disable alerts and verify no notification is delivered.
3. Re-enable alerts and verify events are delivered again.

Implementation Tasks:
1. Implement threshold evaluation job/service.
2. Implement notification preference checks.
3. Integrate with SNS-compatible publisher.
4. Add tests for enabled and disabled preference states.

Non-Goals:
- Personalized threshold per item category.
- Advanced quiet-hour schedules in MVP.

Open Questions:
- Should duplicate alert suppression be added in MVP?

Readiness Check:
- [x] Clear actor and value.
- [x] Testable acceptance criteria.
- [x] Scope is small enough.
- [x] Dependencies identified.

## US-006

Title: Compare prices with limited MVP dataset

User Story:
As a user, I want a basic price comparison view, so that I can make better purchase decisions.

Context and assumptions:
- Comparison source is a controlled internal dataset.
- If data is missing, system provides explicit unavailable state.

Acceptance Criteria:
1. Long-press on pantry item opens compare prices view.
2. View shows reference values when dataset entry exists.
3. View shows data unavailable state when no reference exists.

Test Scenarios:
1. Open comparison for item with dataset match and verify value display.
2. Open comparison for unmatched item and verify unavailable message.
3. Validate that no live third-party pricing call is required.

Implementation Tasks:
1. Implement lookup endpoint against PRICE_CATALOG_ITEM.
2. Add long-press UI action and comparison screen.
3. Implement fallback UI state for missing entries.
4. Add tests for matched and unmatched lookups.

Non-Goals:
- Live supermarket integrations.
- Cross-store promotion engine.

Open Questions:
- What minimum categories must be present in the MVP price catalog?

Readiness Check:
- [x] Clear actor and value.
- [x] Testable acceptance criteria.
- [x] Scope is small enough.
- [x] Dependencies identified.

## US-007

Title: View dashboard with active and expiring items

User Story:
As a user, I want a dashboard summary, so that I can quickly decide what to use next.

Context and assumptions:
- Dashboard focuses on concise operational metrics for MVP.
- Prioritization is based on expiry risk and current status.

Acceptance Criteria:
1. Dashboard shows count of active pantry items.
2. Dashboard shows count of expiring-soon items.
3. Dashboard shows prioritized consume-next list.
4. Recipe integration is not required.

Test Scenarios:
1. Populate pantry with mixed statuses and verify displayed counts.
2. Verify ordering of consume-next list by expiry risk.
3. Verify dashboard updates after item status change.

Implementation Tasks:
1. Build summary aggregation endpoint.
2. Build consume-next prioritization query/service.
3. Implement dashboard UI cards and prioritized list.
4. Add tests for count accuracy and ordering rules.

Non-Goals:
- Recipe suggestion cards.
- Advanced predictive analytics in MVP.

Open Questions:
- Should dashboard show household-level or user-level default scope first?

Readiness Check:
- [x] Clear actor and value.
- [x] Testable acceptance criteria.
- [x] Scope is small enough.
- [x] Dependencies identified.

## US-008

Title: Share pantry with one household member

User Story:
As a user, I want to share my pantry with one household member, so that both accounts can coordinate purchases and consumption.

Context and assumptions:
- MVP supports invite by email and accept flow.
- Shared pantry data must be visible to both accepted members.

Acceptance Criteria:
1. User can send invitation to another user email.
2. Invited user can accept invitation.
3. Both users see synchronized pantry items for the household.
4. Consumption events include actor and timestamp.

Test Scenarios:
1. Invite valid user and verify pending invitation record.
2. Accept invitation and verify membership creation.
3. Add pantry item as one member and verify visibility to the other.
4. Register consumption event and verify actor traceability.

Implementation Tasks:
1. Implement household invitation create and accept endpoints.
2. Implement membership and role/status persistence.
3. Enforce authorization by household membership.
4. Add tests for invite, accept, and shared visibility behavior.

Non-Goals:
- Multi-role granular permissions beyond OWNER and MEMBER.
- Large group household management in MVP.

Open Questions:
- Should invitation expiration be fixed or configurable in MVP?

Readiness Check:
- [x] Clear actor and value.
- [x] Testable acceptance criteria.
- [x] Scope is small enough.
- [x] Dependencies identified.

## US-009

Title: Track waste in quantity and estimated value

User Story:
As a user, I want to register consumption and waste, so that I can understand food and money impact.

Context and assumptions:
- Event model stores consumption and waste as auditable events.
- Far-past-expiry suggestion requires explicit user confirmation.

Acceptance Criteria:
1. User can mark an item as consumed or wasted.
2. System can suggest waste for far-past-expiry items.
3. Suggested waste requires explicit user confirmation.
4. Metrics include quantity and estimated monetary value.
5. Dashboard reflects updates after event registration.

Test Scenarios:
1. Mark item consumed and verify event insertion.
2. Mark item wasted and verify estimated value calculation.
3. Verify confirmation step for system-suggested waste.
4. Verify dashboard metric changes after events.

Implementation Tasks:
1. Implement consumption/waste event endpoints.
2. Implement waste suggestion rule and confirmation flow.
3. Implement aggregate metrics queries for dashboard.
4. Add tests for event lifecycle and analytics consistency.

Non-Goals:
- Cross-user gamification based on waste scores.
- Full financial accounting module.

Open Questions:
- What exact rule defines far-past-expiry in MVP?

Readiness Check:
- [x] Clear actor and value.
- [x] Testable acceptance criteria.
- [x] Scope is small enough.
- [x] Dependencies identified.

## US-010

Title: Use-next prioritization without recipe engine

User Story:
As a user, I want a prioritized list of what to consume next, so that I can reduce spoilage.

Context and assumptions:
- Prioritization is based on expiry risk signals.
- Feature is visible from pantry and dashboard contexts.

Acceptance Criteria:
1. System displays ordered list by highest expiry risk first.
2. List is accessible from pantry and dashboard.
3. No recipe generation is required.

Test Scenarios:
1. Create items with different expiration dates and verify ordering.
2. Confirm list appears in both pantry and dashboard entry points.
3. Confirm feature works without recipe API dependencies.

Implementation Tasks:
1. Implement risk scoring and ordering logic.
2. Expose prioritize endpoint/query for both screens.
3. Implement shared UI component for consume-next list.
4. Add tests for ranking determinism.

Non-Goals:
- Recipe recommendation engine.
- External recipe integrations.

Open Questions:
- Should prioritization include quantity and value weights in MVP or only expiration risk?

Readiness Check:
- [x] Clear actor and value.
- [x] Testable acceptance criteria.
- [x] Scope is small enough.
- [x] Dependencies identified.

## Delivery note

Recommended MVP sequence:
1. US-001, US-002.
2. US-003, US-004.
3. US-008, US-005.
4. US-007, US-009, US-010, US-006.
