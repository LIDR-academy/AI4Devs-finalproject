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
- FR-18: The system must persist household membership as an explicit relational structure (user-household association), not as denormalized JSON fields.
- FR-19: The system must persist invitation lifecycle states (pending, accepted, revoked, expired) with timestamps.
- FR-20: The system must persist receipt metadata separately from receipt line items.
- FR-21: The system must persist consumption and waste actions as timestamped events, not only as final item states.
- FR-22: The system must store expiry estimation metadata (confidence and method) separately from pantry item core attributes.
- FR-23: The system must support nullable mapping between OCR receipt lines and pantry items until user confirmation.
- FR-24: The system must support case-insensitive uniqueness for user email identities.
- FR-25: The system must support soft-delete behavior for user accounts to preserve audit and analytics consistency in MVP.
- FR-26: The system must support a controlled MVP price catalog dataset with effective date tracking.

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

## 7.1 Non-Functional Requirements (Data Model and Persistence)

### 7.1.1 Integrity and consistency
- NFR-DM-1: All core entities must have stable primary keys and explicit foreign keys.
- NFR-DM-2: Referential integrity must be enforced for pantry, household, receipt, and event data.
- NFR-DM-3: Domain states with constrained values must be enforced through enums/check constraints.
- NFR-DM-4: Monetary and quantity fields must use precise decimal types (no floating-point storage for money).
- NFR-DM-5: Timestamps must be timezone-aware for all auditable events.

### 7.1.2 Performance and scalability
- NFR-DM-6: Foreign key columns must be indexed to protect join performance and mutation safety.
- NFR-DM-7: Pantry listing and expiring-item queries must be covered by composite indexes.
- NFR-DM-8: Event tables must support time-ordered retrieval for analytics and audit traces.

### 7.1.3 Evolvability and migration safety
- NFR-DM-9: MVP schema changes must be backward-compatible whenever possible, avoiding destructive table rewrites.
- NFR-DM-10: New features (barcode, recipes, ML prediction) must be additive via new tables/nullable FKs.
- NFR-DM-11: Shared pantry authorization changes must be implementable through membership/policy tables without breaking existing data contracts.

### 7.1.4 Operational requirements for developers before implementation
- NFR-DM-12: Migration order must follow dependency sequence (identity -> household -> pantry -> receipts -> events).
- NFR-DM-13: Seed data must include realistic household-sharing and receipt scenarios for local testing.
- NFR-DM-14: Data retention and deletion rules must be explicitly defined for users, receipts, and events before production deployment.
- NFR-DM-15: Database constraints, indexes, and Prisma schema must stay synchronized in each migration cycle.

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

## 10. Non-Functional Requirements (Security)

### 10.1 Authentication and Authorization
- NFR-SEC-1: All protected API endpoints must require a valid JWT.
- NFR-SEC-2: JWT secret must not be hardcoded in source code and must be provided via environment configuration.
- NFR-SEC-3: Authorization checks must enforce pantry ownership/household membership before read/write operations.
- NFR-SEC-4: Sensitive account operations (password change, account deletion) must require recent authentication.

### 10.2 Data Protection
- NFR-SEC-5: All client to API communication must use HTTPS in deployed environments.
- NFR-SEC-6: Receipt images in object storage must not be public by default.
- NFR-SEC-7: Personally identifiable information (email, profile, household links) must be stored with least-access principles.
- NFR-SEC-8: Credentials, cloud keys, and tokens must be managed through environment secrets, never in repository files.

### 10.3 Input and API Security
- NFR-SEC-9: Backend input validation must be applied to all external payloads (auth, pantry, receipt, sharing flows).
- NFR-SEC-10: File upload endpoint must validate file type and size before processing.
- NFR-SEC-11: API must reject malformed or unauthorized requests with consistent error handling that does not leak internal details.

### 10.4 Auditability and Abuse Protection
- NFR-SEC-12: Consumption/waste events and critical account actions must include actor and timestamp for traceability.
- NFR-SEC-13: System should log authentication failures and suspicious access attempts.
- NFR-SEC-14: API should support baseline abuse controls (rate-limit strategy and request throttling policy), even if minimal in MVP.

### 10.5 Third-Party and Integration Security
- NFR-SEC-15: Integrations with Textract, S3, and SNS must use scoped IAM permissions (least privilege).
- NFR-SEC-16: OCR output must be treated as untrusted input and validated before persistence.
- NFR-SEC-17: Notification payloads must avoid exposing unnecessary personal data.

## 11. Security Risks Identified in Current MVP Architecture (Documented, Not Fixed)

1. Single environment concentration risk
- Current architecture is centered on one cloud environment (`dev`) for MVP.
- Risk: accidental mixing of development data and production-like usage.

2. JWT session risk without explicit token lifecycle policy
- Current docs state JWT usage but do not define rotation, revocation, or short-lived access policy.
- Risk: longer exposure window if tokens are leaked.

3. Receipt data sensitivity risk
- Receipt images can contain personal and financial data.
- Risk: exposure if bucket policy, object ACLs, or retention policies are misconfigured.

4. Shared pantry authorization risk
- Household sharing is core MVP behavior but fine-grained authorization rules are not fully specified.
- Risk: horizontal privilege issues (user accessing another household's items).

5. External service dependency risk
- Textract and SNS are critical-path dependencies.
- Risk: degraded feature behavior, queueing failures, or silent drop in notifications when integration errors occur.

6. Abuse and brute-force risk
- Current architecture docs do not define authentication throttling controls.
- Risk: credential stuffing or brute-force attempts against auth endpoints.

7. Logging and privacy balance risk
- Need operational logs for troubleshooting and auditing.
- Risk: accidental logging of sensitive payloads unless log redaction policy is enforced.

## 12. Security Readiness Checklist Before Implementation
- Define role and ownership matrix for all pantry and sharing operations.
- Define JWT expiration and refresh/re-authentication policy.
- Define secure upload constraints (mime types, size limits, retention window).
- Define S3 bucket policy baseline (private objects, server-side encryption, scoped IAM).
- Define minimum auth protection controls (rate limiting policy and lockout thresholds).
- Define incident logging and redaction policy for PII and receipt content.
- Define data deletion behavior for account deletion and shared household membership changes.

## 13. Appendix: Delivery Slices (MVP)
- Slice A: Auth + pantry CRUD
- Slice B: Receipt upload + OCR + confirmation
- Slice C: Expiry estimation + notification trigger
- Slice D: Dashboard + waste events + basic sharing
