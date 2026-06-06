# PRD: RealSaveFooding MVP (Refined)

## 1. Introduction / Overview
RealSaveFooding helps households reduce food waste and save money by combining pantry tracking, receipt ingestion, expiration intelligence, and actionable guidance.

The MVP solves three concrete problems:
- Users do not know what they currently have at home.
- Users do not maintain expiration dates manually.
- Users do not get clear next actions to consume food before spoilage.

### Problem statement
Users lose money and waste food because inventory visibility is low, expiry tracking is inconsistent, and shared households are poorly coordinated.

## 2. Goals
- Reduce avoidable food waste for active households in the first month of use.
- Reduce duplicate purchases caused by missing pantry visibility.
- Minimize manual data entry through receipt scan + OCR + assisted expiry defaults.
- Provide clear daily prioritization for what to consume next.
- Enable two-user shared pantry coordination for MVP.

## 3. User Stories

### US-001: Register and access account
**Description:** As a new user, I want to create an account and log in so that my pantry data is private and persistent.

**Acceptance Criteria:**
- [ ] User can sign up with email and password.
- [ ] User can log in with valid credentials.
- [ ] Invalid credentials return a clear error message.
- [ ] JWT-based session is required for protected API routes.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-002: Add pantry item manually
**Description:** As a user, I want to add food items manually so that I can track products when no receipt is available.

**Acceptance Criteria:**
- [ ] User can create an item with name, quantity, and optional expiry date.
- [ ] New item appears in pantry list immediately after save.
- [ ] Required field validation is shown in the form.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-003: Upload receipt and extract products
**Description:** As a user, I want to upload a receipt so that products are detected automatically.

**Acceptance Criteria:**
- [ ] User can upload a receipt image successfully.
- [ ] Backend stores receipt file in S3.
- [ ] OCR pipeline returns at least one extracted item when text is readable.
- [ ] User can review extracted items before final confirmation.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-004: Suggest expiration dates with confidence
**Description:** As a user, I want estimated expiry suggestions so that I can track freshness with less manual effort.

**Acceptance Criteria:**
- [ ] System generates expiry estimate for extracted or manual items.
- [ ] Each estimate includes a confidence level.
- [ ] Low-confidence values are labeled as estimate and require user confirmation.
- [ ] User can edit expiry date before saving.
- [ ] Expiry learning is not persisted in MVP (no automatic default-learning loop).
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-005: Receive expiring-soon notifications
**Description:** As a user, I want expiration alerts so that I can consume food before it goes bad.

**Acceptance Criteria:**
- [ ] Expiring-soon threshold is fixed to 3 days in MVP.
- [ ] Notification event is generated for items within threshold.
- [ ] User can enable or disable expiration notifications.
- [ ] Typecheck/lint passes.

### US-006: Compare prices with limited MVP dataset
**Description:** As a user, I want a simple price comparison view so that I can make basic purchasing decisions.

**Acceptance Criteria:**
- [ ] Long-press action opens Compare prices view.
- [ ] View shows comparison values from a limited predefined dataset.
- [ ] If no dataset entry exists, UI shows a clear "data unavailable" state.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-007: View dashboard with active and expiring items
**Description:** As a user, I want a dashboard summary so that I can quickly decide what to use next.

**Acceptance Criteria:**
- [ ] Dashboard shows active pantry item count.
- [ ] Dashboard shows expiring-soon item count.
- [ ] Dashboard lists prioritized items to consume first.
- [ ] Dashboard does not require recipe integration in MVP.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-008: Share pantry with one household member
**Description:** As a user, I want to share my pantry with another account so that both users see the same inventory.

**Acceptance Criteria:**
- [ ] User can invite another user by email.
- [ ] Invited user can accept invitation.
- [ ] Both users see synchronized pantry data.
- [ ] Consumption events show actor and timestamp.
- [ ] Typecheck/lint passes.

### US-009: Track waste in quantity and estimated value
**Description:** As a user, I want to track wasted items so that I can understand financial and food impact.

**Acceptance Criteria:**
- [ ] User can mark item as consumed or wasted.
- [ ] System can suggest waste for far-past-expiry items and requires explicit user confirmation.
- [ ] Waste metrics include count and estimated monetary value.
- [ ] Dashboard updates after event registration.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-010: Use-next prioritization without recipe engine
**Description:** As a user, I want to see what to consume first so that I can reduce spoilage.

**Acceptance Criteria:**
- [ ] System prioritizes items by expiry risk and shows ordered list.
- [ ] List is available from pantry and dashboard context.
- [ ] No recipe generation or external recipe integration is required in MVP.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## 4. Functional Requirements
- FR-1: The system must support account registration, login, and JWT authorization.
- FR-2: The system must provide pantry CRUD operations for authenticated users.
- FR-3: The system must support receipt image upload and metadata persistence.
- FR-4: The system must extract purchasable items from receipts using OCR.
- FR-5: The system must generate rules-based expiration estimates localized to Spain.
- FR-6: The system must mark low-confidence expiration outputs as estimates requiring confirmation.
- FR-7: The system must allow users to edit expiry values, but must not persist learned default expiry behavior in MVP.
- FR-8: The system must compute item freshness states: fresh, expiring soon, expired.
- FR-9: The system must use a fixed 3-day threshold for expiring-soon state in MVP.
- FR-10: The system must trigger expiring-soon notifications via SNS-compatible flow.
- FR-11: The system must provide a dashboard with active items and prioritized expiring items.
- FR-12: The system must provide a price comparison screen backed by a limited predefined dataset.
- FR-13: The system must support basic two-user pantry sharing with invite/accept flow.
- FR-14: The system must record consumption and waste events with timestamp and actor.
- FR-15: The system must provide waste analytics in quantity and estimated monetary value.
- FR-16: The system must support suggested waste classification for far-past-expiry items requiring explicit confirmation.
- FR-17: The system must provide "use next" prioritization without recipe engine integration in MVP.

## 5. Non-Goals (Out of Scope)
- Full weekly meal planning engine.
- Advanced price comparison with live supermarket integrations beyond a limited predefined dataset.
- Guaranteed exact expiry prediction for every product.
- Multi-role household permissions beyond basic shared access.
- Benchmarking against other users (cross-user analytics).
- Production-grade multi-environment deployment hardening.
- Recipe recommendation engine or external recipe API integration.
- Automatic expiry learning loop from user edits.

## 6. Design Considerations
- Design language: clean, minimal, mobile-first, low cognitive load.
- Pantry list must make expiring-soon items visually obvious.
- Receipt confirmation flow must clearly separate extracted values from user-confirmed values.
- Use-next UI must be present as a simple prioritized list, not as recipe cards.
- Long-press item actions should include:
  - Compare prices (MVP: limited predefined dataset)
  - Alternatives
  - Change expiration date
  - Change default expiration window (visible but learning behavior out of MVP)

## 7. Technical Considerations
- Frontend stack: React + TypeScript + Tailwind + Radix in front.
- Backend stack: NestJS + Prisma + PostgreSQL in back.
- OCR and integrations: AWS Textract, S3, SNS.
- Data model must include entities for user, pantry item, receipt, consumption event, and expiry metadata.
- Price comparison source for MVP is a controlled limited dataset (not live market integration).
- Expiration learning model updates are deferred to post-MVP.
- For MVP, keep architecture as modular monolith with clear domain modules.
- Keep infrastructure scope to dev environment and reproducible setup.

## 8. Success Metrics
- At least 70% of onboarding users complete first pantry item creation within first session.
- At least 50% of active users upload at least one receipt in first week.
- At least 40% of expiring-soon notifications lead to a consume/waste event within 48 hours.
- Reduction trend in wasted estimated value for returning users over 4 weeks.
- At least 80% of OCR-derived entries are accepted with minor or no user edits.
- At least 60% of far-past-expiry suggestions receive explicit user confirmation (consume or waste).

## 9. Open Questions
1. Should OCR run server-side only in MVP, or should we keep the architecture open for future on-device fallback?
2. For the limited price dataset, what categories must be included in MVP (for example dairy, produce, meat, pantry staples)?
3. What rule should define "far-past-expiry" for waste suggestion (for example 3 days, 7 days, or category-based)?

## Appendix: Delivery Slices (MVP)
- Slice A: Auth + pantry CRUD
- Slice B: Receipt upload + OCR + confirmation
- Slice C: Expiry estimation + notification trigger
- Slice D: Dashboard + waste events + basic sharing
