# Main Entities Specification (MVP)

This document complements the conceptual model in [database-model.md](./database-model.md) with implementation-oriented detail for primary entities, including attribute types, keys, constraints, and relationships.

Type notation is aligned with PostgreSQL and Prisma usage in this project.

## 1. USER

Purpose: Account identity and authentication principal.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique user identifier. |
| email | VARCHAR(320) | Yes | Login and identity email. |
| password_hash | TEXT | Yes | Password hash (never plain text). |
| full_name | VARCHAR(150) | No | Display name. |
| created_at | TIMESTAMPTZ | Yes | Record creation time. |
| updated_at | TIMESTAMPTZ | Yes | Last update time. |
| deleted_at | TIMESTAMPTZ | No | Soft-delete timestamp. |

- Primary key: id.
- Foreign keys: none.
- Unique constraints:
  - email case-insensitive uniqueness via unique index on LOWER(email).
- Additional constraints:
  - email NOT NULL.
  - password_hash NOT NULL.
- Relationships:
  - 1:N with HOUSEHOLD_MEMBER.
  - 1:N with PANTRY_ITEM (creator).
  - 1:N with RECEIPT (uploader).
  - 1:1 with NOTIFICATION_PREFERENCE.

## 2. HOUSEHOLD

Purpose: Shared pantry boundary for collaboration.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique household identifier. |
| name | VARCHAR(120) | Yes | Household display name. |
| created_by_user_id | UUID | Yes | User who created the household. |
| created_at | TIMESTAMPTZ | Yes | Record creation time. |
| updated_at | TIMESTAMPTZ | Yes | Last update time. |

- Primary key: id.
- Foreign keys:
  - created_by_user_id -> USER.id.
- Additional constraints:
  - name NOT NULL.
- Relationships:
  - 1:N with HOUSEHOLD_MEMBER.
  - 1:N with PANTRY_ITEM.
  - 1:N with RECEIPT.
  - 1:N with HOUSEHOLD_INVITATION.

## 3. HOUSEHOLD_MEMBER

Purpose: Membership and authorization context.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique membership identifier. |
| household_id | UUID | Yes | Related household. |
| user_id | UUID | Yes | Related user. |
| role | household_member_role (ENUM) | Yes | Membership role: OWNER, MEMBER. |
| status | membership_status (ENUM) | Yes | Membership lifecycle status. |
| joined_at | TIMESTAMPTZ | Yes | Join timestamp. |
| left_at | TIMESTAMPTZ | No | Leave/removal timestamp. |

- Primary key: id.
- Foreign keys:
  - household_id -> HOUSEHOLD.id.
  - user_id -> USER.id.
- Unique constraints:
  - unique(household_id, user_id).
- Additional constraints:
  - role in (OWNER, MEMBER).
  - status in (ACTIVE, LEFT, REMOVED).
- Relationships:
  - N:1 with HOUSEHOLD.
  - N:1 with USER.

## 4. HOUSEHOLD_INVITATION

Purpose: Invitation flow to join shared households.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique invitation identifier. |
| household_id | UUID | Yes | Target household. |
| invited_by_user_id | UUID | Yes | Inviter user. |
| invitee_email | VARCHAR(320) | Yes | Email invited to join. |
| status | invitation_status (ENUM) | Yes | Invitation status lifecycle. |
| expires_at | TIMESTAMPTZ | No | Expiration timestamp. |
| responded_at | TIMESTAMPTZ | No | Acceptance/rejection timestamp. |
| created_at | TIMESTAMPTZ | Yes | Creation timestamp. |

- Primary key: id.
- Foreign keys:
  - household_id -> HOUSEHOLD.id.
  - invited_by_user_id -> USER.id.
- Additional constraints:
  - invitee_email NOT NULL.
  - status in (PENDING, ACCEPTED, REVOKED, EXPIRED).
- Relationships:
  - N:1 with HOUSEHOLD.
  - N:1 with USER (inviter).

## 5. PANTRY_ITEM

Purpose: Core inventory item tracked in pantry.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique pantry item identifier. |
| household_id | UUID | Yes | Owner household. |
| created_by_user_id | UUID | Yes | Creator user. |
| name | VARCHAR(180) | Yes | Raw item name. |
| normalized_name | VARCHAR(180) | Yes | Normalized name for matching/search. |
| quantity | NUMERIC(10,3) | Yes | Stored quantity. |
| quantity_unit | VARCHAR(30) | Yes | Quantity unit (kg, l, unit, etc.). |
| purchase_date | DATE | No | Purchase date. |
| expiration_date | DATE | No | Estimated or user-defined expiration date. |
| expiration_source | expiration_source (ENUM) | Yes | USER or OCR_ESTIMATE. |
| status | pantry_item_status (ENUM) | Yes | Lifecycle state (fresh/expiring/expired/etc.). |
| created_at | TIMESTAMPTZ | Yes | Creation timestamp. |
| updated_at | TIMESTAMPTZ | Yes | Last update timestamp. |

- Primary key: id.
- Foreign keys:
  - household_id -> HOUSEHOLD.id.
  - created_by_user_id -> USER.id.
- Additional constraints:
  - quantity > 0.
  - status in (FRESH, EXPIRING_SOON, EXPIRED, CONSUMED, WASTED).
  - expiration_source in (USER, OCR_ESTIMATE).
- Relationships:
  - N:1 with HOUSEHOLD.
  - N:1 with USER (creator).
  - 1:N with CONSUMPTION_EVENT.
  - 1:0..1 with EXPIRATION_ASSESSMENT.

## 6. RECEIPT

Purpose: Receipt ingestion metadata and OCR lifecycle.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique receipt identifier. |
| household_id | UUID | Yes | Household context. |
| uploaded_by_user_id | UUID | Yes | Uploader user. |
| storage_bucket | VARCHAR(120) | Yes | S3 bucket name. |
| storage_key | TEXT | Yes | S3 object key/path. |
| purchased_at | TIMESTAMPTZ | No | Purchase datetime from receipt. |
| ocr_status | ocr_status (ENUM) | Yes | OCR processing state. |
| processed_at | TIMESTAMPTZ | No | OCR completion time. |
| created_at | TIMESTAMPTZ | Yes | Creation timestamp. |

- Primary key: id.
- Foreign keys:
  - household_id -> HOUSEHOLD.id.
  - uploaded_by_user_id -> USER.id.
- Additional constraints:
  - storage_key NOT NULL.
  - ocr_status in (PENDING, PROCESSING, COMPLETED, FAILED).
- Relationships:
  - N:1 with HOUSEHOLD.
  - N:1 with USER (uploader).
  - 1:N with RECEIPT_ITEM.

## 7. RECEIPT_ITEM

Purpose: OCR line items and mapping to pantry inventory.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique line identifier. |
| receipt_id | UUID | Yes | Parent receipt. |
| pantry_item_id | UUID | No | Optional mapped pantry item (after confirmation). |
| raw_name | VARCHAR(220) | Yes | OCR raw item string. |
| normalized_name | VARCHAR(180) | No | Normalized item name. |
| quantity | NUMERIC(10,3) | No | Parsed quantity. |
| quantity_unit | VARCHAR(30) | No | Quantity unit. |
| unit_price_eur | NUMERIC(10,2) | No | Unit price in EUR. |
| line_total_eur | NUMERIC(10,2) | No | Total line amount in EUR. |
| user_confirmed | BOOLEAN | Yes | User confirmation flag. |
| created_at | TIMESTAMPTZ | Yes | Creation timestamp. |

- Primary key: id.
- Foreign keys:
  - receipt_id -> RECEIPT.id.
  - pantry_item_id -> PANTRY_ITEM.id (nullable).
- Additional constraints:
  - quantity > 0 when quantity is present.
  - unit_price_eur >= 0.
  - line_total_eur >= 0.
- Relationships:
  - N:1 with RECEIPT.
  - N:0..1 with PANTRY_ITEM mapping.

## 8. EXPIRATION_ASSESSMENT

Purpose: Estimated expiry and confidence audit trail.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique assessment identifier. |
| pantry_item_id | UUID | Yes | Related pantry item. |
| suggested_expiration_date | DATE | Yes | Suggested expiration date. |
| confidence | NUMERIC(3,2) | Yes | Confidence score between 0 and 1. |
| method | expiration_method (ENUM) | Yes | RULE_BASED_SPAIN or MANUAL_OVERRIDE. |
| user_confirmed | BOOLEAN | Yes | Whether user confirmed the suggestion. |
| confirmed_by_user_id | UUID | No | User confirming override/acceptance. |
| created_at | TIMESTAMPTZ | Yes | Creation timestamp. |

- Primary key: id.
- Foreign keys:
  - pantry_item_id -> PANTRY_ITEM.id.
  - confirmed_by_user_id -> USER.id (nullable).
- Unique constraints:
  - unique(pantry_item_id) for MVP single active assessment.
- Additional constraints:
  - confidence between 0 and 1.
  - method in (RULE_BASED_SPAIN, MANUAL_OVERRIDE).
- Relationships:
  - 1:1 with PANTRY_ITEM in MVP.

## 9. CONSUMPTION_EVENT

Purpose: Event-based consumption and waste tracking.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique event identifier. |
| pantry_item_id | UUID | Yes | Related pantry item. |
| actor_user_id | UUID | Yes | User who triggered event. |
| event_type | consumption_event_type (ENUM) | Yes | CONSUMED, WASTED, SUGGESTED_WASTE, CONFIRMED_WASTE. |
| quantity | NUMERIC(10,3) | Yes | Affected quantity. |
| estimated_value_eur | NUMERIC(10,2) | No | Estimated monetary value impact. |
| notes | TEXT | No | User/system notes. |
| event_at | TIMESTAMPTZ | Yes | Event occurrence timestamp. |

- Primary key: id.
- Foreign keys:
  - pantry_item_id -> PANTRY_ITEM.id.
  - actor_user_id -> USER.id.
- Additional constraints:
  - event_type in (CONSUMED, WASTED, SUGGESTED_WASTE, CONFIRMED_WASTE).
  - quantity > 0.
  - estimated_value_eur >= 0.
- Relationships:
  - N:1 with PANTRY_ITEM.
  - N:1 with USER.

## 10. NOTIFICATION_PREFERENCE

Purpose: User-level alert configuration.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique preference row identifier. |
| user_id | UUID | Yes | Associated user. |
| expiry_alert_enabled | BOOLEAN | Yes | Expiration alert toggle. |
| consumption_alert_enabled | BOOLEAN | Yes | Consumption reminder toggle. |
| price_drop_alert_enabled | BOOLEAN | Yes | Price-related alert toggle. |
| expiry_threshold_days | INTEGER | Yes | Days threshold for expiration notifications. |
| updated_at | TIMESTAMPTZ | Yes | Last update time. |

- Primary key: id.
- Foreign keys:
  - user_id -> USER.id.
- Unique constraints:
  - unique(user_id).
- Additional constraints:
  - expiry_threshold_days >= 1.
- Relationships:
  - 1:1 with USER.

## 11. USER_POINTS

Purpose: Ledger of gamification point deltas earned/deducted per user.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique ledger row identifier. |
| user_id | UUID | Yes | Owning user. |
| delta | INTEGER | Yes | Points awarded (positive) or deducted (negative). |
| reason | VARCHAR | Yes | Reason code (e.g. CONSUMED_BEFORE_EXPIRY, WASTED). |
| reference_id | VARCHAR | No | Optional reference to the source event/item. |
| occurred_at | TIMESTAMPTZ | Yes | When the points event occurred. |

- Primary key: id.
- Foreign keys: user_id -> USER.id.
- Relationships:
  - N:1 with USER.

## 12. USER_BADGE

Purpose: Achievement badges earned by a user in the gamification system.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique badge-award identifier. |
| user_id | UUID | Yes | Owning user. |
| code | VARCHAR | Yes | Badge code from the badge catalog. |
| earned_at | TIMESTAMPTZ | Yes | Timestamp the badge was earned. |

- Primary key: id.
- Foreign keys: user_id -> USER.id.
- Unique constraints: unique(user_id, code).
- Relationships:
  - N:1 with USER.

## 13. AUTO_EXPIRY_DIGEST

Purpose: Tracks consumption-automation digests sent to users for long-expired items awaiting resolution.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique digest identifier. |
| user_id | UUID | Yes | Recipient user. |
| sent_at | TIMESTAMPTZ | Yes | Digest send timestamp. |
| resolved_at | TIMESTAMPTZ | No | Timestamp the digest was resolved (if any). |
| status | VARCHAR | Yes | Digest lifecycle status. |

- Primary key: id.
- Foreign keys: user_id -> USER.id.
- Relationships:
  - N:1 with USER.

## 14. NOTIFICATION_LOG

Purpose: Delivery audit log for outbound notifications (email/push).

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique log entry identifier. |
| user_id | UUID | Yes | Recipient user. |
| type | VARCHAR | Yes | Notification type. |
| channel | VARCHAR | Yes | Delivery channel (EMAIL, PUSH). |
| status | VARCHAR | Yes | Delivery outcome status. |
| fail_reason | VARCHAR | No | Failure reason, when status indicates failure. |
| sent_at | TIMESTAMPTZ | Yes | Delivery attempt timestamp. |

- Primary key: id.
- Foreign keys: user_id -> USER.id.
- Relationships:
  - N:1 with USER.

## 15. PUSH_SUBSCRIPTION

Purpose: Web Push subscription credentials for browser push notifications.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique subscription identifier. |
| user_id | UUID | Yes | Owning user. |
| endpoint | TEXT | Yes | Push service endpoint URL. |
| p256dh | TEXT | Yes | Subscription public key. |
| auth | TEXT | Yes | Subscription auth secret. |
| created_at | TIMESTAMPTZ | Yes | Creation timestamp. |

- Primary key: id.
- Foreign keys: user_id -> USER.id.
- Unique constraints: unique(user_id) — one active subscription per user.
- Relationships:
  - 1:1 with USER.

## 16. USER_CATEGORY_EXPIRY_PREFERENCE

Purpose: Learned per-user, per-category expiry offset used to auto-adjust future expiration suggestions from confirmed overrides.

| Attribute | Type | Required | Description |
|---|---|---|---|
| id | UUID | Yes | Unique preference row identifier. |
| user_id | UUID | Yes | Owning user. |
| category | VARCHAR | Yes | Product category key. |
| deltas | FLOAT[] | Yes | Recent observed day-deltas used to compute the average. |
| average_delta | FLOAT | Yes | Rolling average day-delta applied to suggestions. |
| sample_count | INTEGER | Yes | Number of samples contributing to the average. |
| updated_at | TIMESTAMPTZ | Yes | Last update timestamp. |

- Primary key: id.
- Foreign keys: user_id -> USER.id.
- Unique constraints: unique(user_id, category).
- Relationships:
  - N:1 with USER.

## References

- Conceptual and ER model: [database-model.md](./database-model.md)
- Architecture context: [../architecture/architecture.md](./../architecture/architecture.md)
- Product requirements: [../product/3_PRD.md](./../product/3_PRD.md)
