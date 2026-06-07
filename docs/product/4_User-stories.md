# RealSaveFooding MVP - User Stories (Engineering Refined)

Source alignment:
- Product requirements: [3_PRD.md](3_PRD.md)
- System architecture: [../architecture/architecture.md](../architecture/architecture.md)
- Database model: [../db/database-model.md](../db/database-model.md)
- UX references: [../design/02_Login.png](../design/02_Login.png), [../design/03_Create_account.png](../design/03_Create_account.png), [../design/04_Pantry.png](../design/04_Pantry.png), [../design/06_Add_items.png](../design/06_Add_items.png), [../design/07_Insights.png](../design/07_Insights.png), [../design/08_Shared_pantry.png](../design/08_Shared_pantry.png), [../design/09_Settings.png](../design/09_Settings.png)

## Scope and assumptions

- Scope is MVP only.
- Household collaboration is limited to basic invite and accept flow.
- Expiring threshold is fixed to 3 days.
- Price comparison uses a limited controlled dataset.
- Recipe generation is out of MVP scope.
- Architecture target is modular monolith with NestJS, Prisma, PostgreSQL and AWS integrations.

## US-001

Title: Register and access account

User Story:
As a new user, I want to create an account and log in, so that my pantry data is private and persistent.

Context and assumptions:
- Authentication is email and password based.
- Protected backend routes require JWT.
- UX entry points align with login and account creation screens.

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
3. Implement JWT generation and middleware or guard validation.
4. Add integration tests for auth success and failure paths.

Engineering Refinement:
- API contracts:
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/me
- Data touched:
  - USER with case-insensitive unique email policy.
- Backend components:
  - Auth module, Users module, JWT guard, validation pipe.
- Frontend components:
  - Login and create-account forms, error banner, token/session store.
- Failure modes:
  - Duplicate email, invalid credentials, expired token, malformed payload.
- Security and compliance:
  - Password hashing, JWT secret in env vars, generic auth error message.
- Observability:
  - Metrics for signup success, login success and login failure rate.
- Definition of Done:
  - Unit tests for auth service and integration tests for auth endpoints pass.
  - Protected route access validation is verified.

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
- UX entry points align with pantry and add-item flows.

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

Engineering Refinement:
- API contracts:
  - POST /api/pantry/items
  - GET /api/pantry/items
- Data touched:
  - PANTRY_ITEM, HOUSEHOLD_MEMBER authorization checks.
- Backend components:
  - Pantry module, DTO validation, household access policy middleware.
- Frontend components:
  - Add-item form, unit selector, optimistic list refresh.
- Failure modes:
  - Invalid quantity, unauthorized household access, duplicate submit.
- Security and compliance:
  - Verify household membership before create and list operations.
- Observability:
  - Metrics for item_create_success, validation_failures, create_latency.
- Definition of Done:
  - Create and list flows pass integration tests.
  - Pantry item appears in UI within one refresh cycle.

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
- UX entry points align with add-item and receipt capture flow.

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
1. Implement file upload endpoint with type and size validation.
2. Persist receipt metadata and storage key.
3. Integrate OCR processing and map output to receipt items.
4. Build review UI for extracted lines before confirmation.

Engineering Refinement:
- API contracts:
  - POST /api/receipts/upload
  - GET /api/receipts/:id
  - POST /api/receipts/:id/confirm-items
- Data touched:
  - RECEIPT, RECEIPT_ITEM, optional PANTRY_ITEM mapping.
- Backend components:
  - Receipts module, storage adapter, OCR adapter, mapping service.
- Frontend components:
  - Receipt uploader, extracted-lines review table, confirmation actions.
- Failure modes:
  - OCR service timeout, unreadable image, storage failure, partial extraction.
- Security and compliance:
  - File type whitelist, max size limit, private object ACL.
- Observability:
  - OCR processing duration, extraction_count per receipt, OCR failure rate.
- Definition of Done:
  - Upload and extraction flow works end to end.
  - Confirmed items can be mapped to pantry without data loss.

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
4. Add API or UI flow to confirm or override suggestion.

Engineering Refinement:
- API contracts:
  - POST /api/pantry/items/:id/estimate-expiration
  - PATCH /api/pantry/items/:id/expiration
- Data touched:
  - PANTRY_ITEM, EXPIRATION_ASSESSMENT.
- Backend components:
  - Expiration rules engine, confidence calculator, assessment repository.
- Frontend components:
  - Expiration suggestion card, confidence badge, manual override control.
- Failure modes:
  - Missing category or name normalization, low-confidence fallback path.
- Security and compliance:
  - Audit actor and timestamp when user overrides suggestion.
- Observability:
  - Estimate generation count, confidence distribution, override ratio.
- Definition of Done:
  - Suggestion with confidence is persisted and editable.
  - Override flow updates item expiration consistently.

Non-Goals:
- ML training and prediction loop in MVP.
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
- UX preferences align with settings screen.

Acceptance Criteria:
1. Items within 3-day threshold trigger a notification event.
2. User can toggle expiration alerts on or off.
3. Disabled alerts prevent delivery while preserving item state logic.

Test Scenarios:
1. Set item to 2 days before expiration and verify notification event generation.
2. Disable alerts and verify no notification is delivered.
3. Re-enable alerts and verify events are delivered again.

Implementation Tasks:
1. Implement threshold evaluation job or service.
2. Implement notification preference checks.
3. Integrate with SNS-compatible publisher.
4. Add tests for enabled and disabled preference states.

Engineering Refinement:
- API contracts:
  - GET /api/settings/notifications
  - PATCH /api/settings/notifications
- Data touched:
  - PANTRY_ITEM, NOTIFICATION_PREFERENCE.
- Backend components:
  - Notifications module, scheduler, preference service, publisher adapter.
- Frontend components:
  - Settings toggles, alert preview state, preference save feedback.
- Failure modes:
  - Duplicate alerts, delayed scheduler execution, downstream publisher outage.
- Security and compliance:
  - Enforce user-level access for preferences and no cross-account reads.
- Observability:
  - alerts_generated, alerts_delivered, alerts_suppressed, delivery_errors.
- Definition of Done:
  - Preference changes are persisted and respected by notification pipeline.
  - Alert generation tests pass for threshold boundary conditions.

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
- UX alignment with insights view.

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

Engineering Refinement:
- API contracts:
  - GET /api/insights/price-comparison?normalizedName=
- Data touched:
  - PRICE_CATALOG_ITEM, RECEIPT_ITEM optional context.
- Backend components:
  - Insights module, normalized-name matcher, currency formatting helper.
- Frontend components:
  - Item action sheet entry, comparison panel, unavailable-state component.
- Failure modes:
  - No catalog match, malformed normalized name, stale reference date.
- Security and compliance:
  - Read-only endpoint protected by JWT and household context.
- Observability:
  - comparison_requests, match_rate, unavailable_rate, p95 latency.
- Definition of Done:
  - Matched and unmatched states are both implemented and tested.
  - No dependency on external market APIs is introduced.

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
- UX alignment with main and insights screens.

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
2. Build consume-next prioritization query or service.
3. Implement dashboard UI cards and prioritized list.
4. Add tests for count accuracy and ordering rules.

Engineering Refinement:
- API contracts:
  - GET /api/dashboard/summary
  - GET /api/dashboard/use-next
- Data touched:
  - PANTRY_ITEM, CONSUMPTION_EVENT.
- Backend components:
  - Dashboard module, aggregation query layer, ordering strategy.
- Frontend components:
  - Summary KPI cards, consume-next list component, refresh interaction.
- Failure modes:
  - Outdated cache, inconsistent counts after rapid updates.
- Security and compliance:
  - Summary is limited to authorized household scope.
- Observability:
  - dashboard_load_time, summary_query_time, stale_data_incidents.
- Definition of Done:
  - Counts and ranking are deterministic in tests for fixed seed data.
  - Dashboard updates correctly after create, consume, and waste events.

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
- UX alignment with shared pantry screen.

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
2. Implement membership and role and status persistence.
3. Enforce authorization by household membership.
4. Add tests for invite, accept, and shared visibility behavior.

Engineering Refinement:
- API contracts:
  - POST /api/households/:id/invitations
  - POST /api/invitations/:id/accept
  - GET /api/households/:id/members
- Data touched:
  - HOUSEHOLD, HOUSEHOLD_MEMBER, HOUSEHOLD_INVITATION.
- Backend components:
  - Sharing module, invitation lifecycle service, membership policy checks.
- Frontend components:
  - Invite form, invitation status list, member list, accept action entry.
- Failure modes:
  - Invitation expired, invitee not registered, duplicate active invitation.
- Security and compliance:
  - Household access checks on all member and invitation operations.
- Observability:
  - invitation_sent, invitation_accepted, invitation_expired, access_denied.
- Definition of Done:
  - Invite and accept flow is verified in integration tests.
  - Shared inventory view stays consistent for both members.

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
- UX alignment with pantry and insights flows.

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
1. Implement consumption or waste event endpoints.
2. Implement waste suggestion rule and confirmation flow.
3. Implement aggregate metrics queries for dashboard.
4. Add tests for event lifecycle and analytics consistency.

Engineering Refinement:
- API contracts:
  - POST /api/pantry/items/:id/events
  - GET /api/insights/waste
- Data touched:
  - CONSUMPTION_EVENT, PANTRY_ITEM.
- Backend components:
  - Events module, waste rule evaluator, value estimator.
- Frontend components:
  - Consume or waste action controls, confirmation modal, metrics widgets.
- Failure modes:
  - Double-submit event, stale item state, negative estimated value input.
- Security and compliance:
  - Actor identity required for every event, immutable event timestamp policy.
- Observability:
  - event_write_rate, waste_suggestion_rate, confirm_vs_reject_ratio.
- Definition of Done:
  - Event creation is idempotency-safe for repeated taps.
  - Metrics update is validated in end-to-end flow.

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
2. Expose prioritize endpoint or query for both screens.
3. Implement shared UI component for consume-next list.
4. Add tests for ranking determinism.

Engineering Refinement:
- API contracts:
  - GET /api/pantry/use-next
- Data touched:
  - PANTRY_ITEM, EXPIRATION_ASSESSMENT, optional CONSUMPTION_EVENT recency signal.
- Backend components:
  - Prioritization service with deterministic tie-break rules.
- Frontend components:
  - Reusable use-next list for pantry and dashboard views.
- Failure modes:
  - Missing expiration dates, tie scores, inconsistent ordering across pages.
- Security and compliance:
  - Query constrained to user household scope only.
- Observability:
  - use_next_request_count, ranking_generation_time, list_interaction_rate.
- Definition of Done:
  - Ranking algorithm has explicit tie-break specification and test fixtures.
  - Pantry and dashboard consume-next views produce equivalent ordering.

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

Cross-story engineering dependencies:
- Auth and household authorization policies must be finalized before US-002, US-003, US-008, US-009 and US-010.
- Receipt and OCR pipeline (US-003) must be stable before confidence-based expiration flow (US-004).
- Event model consistency (US-009) is a prerequisite for dashboard quality (US-007) and prioritization trust (US-010).
