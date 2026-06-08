# Entity Specifications

Detailed column-level specifications, business rules, lifecycle states, and GDPR handling for each entity in the Aura Planning data model.

---

## Users

Host accounts — the primary users who create and manage events.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | ULID-compatible format for URL safety |
| Email | varchar(320) | No | — | UNIQUE, case-insensitive collation | Validated per RFC 5322; normalized to lowercase before storage |
| Name | varchar(200) | No | — | Min 2 chars, max 200 | Set during first-login profile setup |
| HashedMagicLinkToken | varchar(256) | Yes | NULL | — | SHA-256 hash of plaintext token; cleared after use |
| TokenExpiresAt | timestamptz | Yes | NULL | — | 15 minutes from token generation |
| CreatedAt | timestamptz | No | NOW() | — | Set on account creation |
| LastLoginAt | timestamptz | Yes | NULL | — | Updated on each successful login |
| Status | varchar(20) | No | 'pending' | CHECK IN ('pending','active','suspended','anonymized') | 'pending' until first login, 'active' after profile setup |
| Timezone | varchar(64) | No | 'Europe/Madrid' | Valid IANA timezone | Auto-detected from browser, editable in profile |
| Locale | varchar(10) | No | 'es-ES' | BCP 47 format | Determines date/time formatting, language |
| IsAnonymized | boolean | No | false | — | Set to true on GDPR erasure |
| AnonymizedAt | timestamptz | Yes | NULL | — | Timestamp of anonymization |

### Lifecycle States

```
pending → active → (suspended) → anonymized
```

| State | Trigger | Effect |
|-------|---------|--------|
| `pending` | User requests magic link | Cannot create events; must verify email |
| `active` | User completes profile setup on first login | Full access to all features |
| `suspended` | Admin action or abuse detection | Login blocked; events still accessible to guests |
| `anonymized` | GDPR erasure request processed | PII removed; audit data retained |

### Business Rules

1. Email uniqueness is case-insensitive (`LOWER(Email)` comparison)
2. Magic link token is one-time use — cleared after successful verification
3. Rate limit: 3 magic link requests per email per hour (tracked in Dragonfly)
4. Same response for new and existing users (anti-enumeration)
5. Old tokens invalidated when new magic link is requested
6. Single active session per user — new login invalidates previous JWT

### GDPR Handling

| Field | On Erasure Request |
|-------|-------------------|
| Email | Replaced with `deleted-{uuid}@anonymous.invalid` |
| Name | Replaced with `[Deleted User]` |
| HashedMagicLinkToken | Set to NULL |
| TokenExpiresAt | Set to NULL |
| Status | Changed to `anonymized` |
| IsAnonymized | Set to `true` |
| AnonymizedAt | Set to `NOW()` |
| CreatedAt, LastLoginAt, Timezone, Locale | Retained (no PII) |

---

## UserConsents

Tracks user consent for terms of service, marketing, and data processing. Required for GDPR compliance.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| UserId | uuid | No | — | FK → Users(Id), indexed | References the consenting user |
| ConsentType | varchar(50) | No | — | CHECK IN ('terms','marketing','data_processing') | Type of consent given |
| TermsVersion | varchar(20) | No | — | Semantic versioning (e.g., '1.0.0') | Tracks which version was accepted |
| IsAccepted | boolean | No | false | — | True if consent was given |
| AcceptedAt | timestamptz | No | NOW() | — | Timestamp of consent |
| WithdrawnAt | timestamptz | Yes | NULL | — | Set when consent is withdrawn |

### Business Rules

1. Users must accept `terms` and `data_processing` before creating events
2. `marketing` consent is optional (opt-in)
3. When terms are updated, users must re-accept before continuing
4. Withdrawing `data_processing` consent triggers account anonymization
5. Consent records are never deleted — only `WithdrawnAt` is set

### GDPR Handling

- Consent records are **never deleted** — they serve as legal proof of consent
- When consent is withdrawn, `WithdrawnAt` is set to `NOW()`
- `IsAccepted` is NOT changed to false — historical accuracy must be preserved

---

## Events

Wedding/event details — the central entity that all other data is scoped to.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| UserId | uuid | No | — | FK → Users(Id), indexed | Owner of the event |
| Name | varchar(200) | No | — | Min 2 chars, max 200 | Display name for the event |
| Slug | varchar(200) | No | — | UNIQUE, URL-safe characters | Auto-generated from Name + date; e.g., `maria-y-juan-2026` |
| TemplateId | uuid | Yes | NULL | FK → Templates(Id) | Selected invitation template |
| PrimaryColor | varchar(7) | No | '#4F46E5' | Hex color format | Primary theme color |
| SecondaryColor | varchar(7) | No | '#7C3AED' | Hex color format | Secondary theme color |
| FontFamily | varchar(100) | No | 'Inter' | From allowed font list | Heading font family |
| HeroImageUrl | varchar(500) | Yes | NULL | Valid URL or MinIO path | Cover image for invitation |
| CoupleNames | varchar(200) | No | — | Min 2 chars, max 200 | Names displayed on invitation |
| EventDate | timestamptz | No | — | Must be in the future at creation | Date and time of the event |
| VenueName | varchar(200) | No | — | Min 2 chars, max 200 | Venue display name |
| VenueAddress | varchar(500) | No | — | Min 5 chars, max 500 | Full venue address |
| VenueLat | decimal(9,6) | Yes | NULL | Range: -90 to 90 | Latitude from Google Maps geocoding |
| VenueLng | decimal(9,6) | Yes | NULL | Range: -180 to 180 | Longitude from Google Maps geocoding |
| Status | varchar(20) | No | 'draft' | CHECK IN ('draft','published','completed','archived') | Event lifecycle state |
| PublishedAt | timestamptz | Yes | NULL | — | Set when payment succeeds |
| CreatedAt | timestamptz | No | NOW() | — | Event creation timestamp |
| UpdatedAt | timestamptz | No | NOW() | — | Updated on every change |
| EventEndDate | timestamptz | No | EventDate + 1 day | Generated column | Used for 30-day retention calculation |

### Lifecycle States

```
draft → published → completed → archived
```

| State | Trigger | Effect |
|-------|---------|--------|
| `draft` | Event created | Free mode: max 5 guests; no public microsite |
| `published` | Payment succeeds via Stripe | Unlimited guests; microsite generated and CDN-published |
| `completed` | EventDate has passed | Read-only; thank you cards sent; accomplice access expired |
| `archived` | 30 days after EventEndDate | Scheduled for hard deletion by DataRetentionJob |

### Business Rules

1. **Slug generation**: Lowercase, replace spaces with hyphens, remove special chars, append year. If duplicate, append `-2`, `-3`, etc.
2. **Free mode limit**: Draft events can have max 5 guests (enforced at API level)
3. **Publishing requires payment**: Status transitions to `published` only after Stripe `payment_intent.succeeded`
4. **Venue geocoding**: Address sent to Google Maps Geocoding API; lat/lng stored if successful
5. **Auto-save**: Template changes auto-save with 2-second debounce
6. **Static site regeneration**: On event update after publishing, SSG regenerates and invalidates CDN cache
7. **EventEndDate**: Computed as `EventDate + 1 day`; drives retention schedule

### GDPR Handling

| Field | On Erasure Request |
|-------|-------------------|
| Name | Replaced with `[Deleted Event]` |
| CoupleNames | Replaced with `[Redacted]` |
| VenueName | Replaced with `[Redacted]` |
| VenueAddress | Replaced with `[Redacted]` |
| HeroImageUrl | Set to NULL |
| Slug | Retained (URL stability for guests) |
| All other fields | Retained (no PII) |

---

## Templates

Pre-designed invitation templates available for hosts to select and customize.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| Name | varchar(100) | No | — | Min 2 chars, max 100 | Template display name |
| Description | text | Yes | NULL | Max 500 chars | Template description |
| PreviewUrl | varchar(500) | No | — | Valid URL or MinIO path | Preview image path |
| Category | varchar(50) | No | 'wedding' | indexed | Template category |
| IsPremium | boolean | No | false | — | Requires premium tier |
| LayoutJson | jsonb | No | '{}' | Valid JSON | Template layout configuration |
| CreatedAt | timestamptz | No | NOW() | — | Template creation timestamp |

### Business Rules

1. MVP ships with 3 preset wedding templates (seeded data)
2. `LayoutJson` defines sections, default colors, font pairings, and asset references
3. Templates are system-managed — users cannot create custom templates in MVP
4. `IsPremium` templates only available for Premium Publish tier (V2+)

### LayoutJson Schema

```json
{
  "sections": ["hero", "details", "venue", "rsvp"],
  "colors": {
    "primary": "#4F46E5",
    "secondary": "#7C3AED"
  },
  "fonts": {
    "heading": "Playfair Display",
    "body": "Inter"
  },
  "assets": {
    "background": "/templates/classic/bg.png",
    "divider": "/templates/classic/divider.svg"
  }
}
```

### GDPR Handling

- No PII stored — templates are system content
- No anonymization needed

---

## Guests

Event attendees — imported via CSV or added manually by the host.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), indexed | Parent event |
| Name | varchar(200) | No | — | Min 1 char, max 200 | Guest display name |
| Email | varchar(320) | Yes | NULL | Valid email format | Normalized to lowercase |
| Phone | varchar(30) | Yes | NULL | E.164 format preferred | For WhatsApp invitations |
| Category | varchar(30) | No | 'other' | CHECK IN ('family','friends','colleagues','other') | Guest segmentation |
| InviteStatus | varchar(20) | No | 'pending' | CHECK IN ('pending','sent','delivered','opened','failed','bounced') | Invitation delivery state |
| IsDeleted | boolean | No | false | — | Soft delete flag |
| DeletedAt | timestamptz | Yes | NULL | — | Soft delete timestamp |
| IsAnonymized | boolean | No | false | — | GDPR anonymization flag |
| AnonymizedAt | timestamptz | Yes | NULL | — | Anonymization timestamp |
| CreatedAt | timestamptz | No | NOW() | — | Guest creation timestamp |

### Business Rules

1. **Duplicate detection**: Email uniqueness per event — `WHERE EventId = @eventId AND Email = @email AND IsDeleted = false`
2. **CSV import validation**: Name required; email/phone optional but at least one contact method required
3. **Category default**: Defaults to 'other' if not specified in CSV
4. **Free mode limit**: Max 5 guests for draft events (enforced at service layer)
5. **Soft delete cascade**: When a guest is soft-deleted, their invitations are also soft-deleted
6. **Email normalization**: All emails stored lowercase for consistent lookups
7. **Phone format**: Stored in E.164 format (+34612345678) for WhatsApp API compatibility

### GDPR Handling

| Field | On Erasure Request |
|-------|-------------------|
| Name | Replaced with `[Deleted Guest]` |
| Email | Replaced with `deleted-{uuid}@anonymous.invalid` |
| Phone | Set to NULL |
| IsAnonymized | Set to `true` |
| AnonymizedAt | Set to `NOW()` |
| Category, InviteStatus, CreatedAt | Retained (no PII) |

---

## Invitations

Per-guest invitation records — tracks delivery status and provides RSVP access via token.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| GuestId | uuid | No | — | FK → Guests(Id), indexed | Target guest |
| EventId | uuid | No | — | FK → Events(Id), indexed | Parent event (denormalized for query performance) |
| TokenHash | varchar(256) | No | — | UNIQUE, indexed | SHA-256 hash of invitation token |
| SentVia | varchar(20) | Yes | NULL | CHECK IN ('email','whatsapp','both') | Channel used to send |
| SentAt | timestamptz | Yes | NULL | — | First send timestamp |
| DeliveryStatus | varchar(20) | No | 'pending' | CHECK IN ('pending','sent','delivered','failed','bounced') | Current delivery state |
| RetryCount | int | No | 0 | DEFAULT 0, max 2 | Number of retry attempts |
| IsDeleted | boolean | No | false | — | Soft delete flag |
| DeletedAt | timestamptz | Yes | NULL | — | Soft delete timestamp |
| CreatedAt | timestamptz | No | NOW() | — | Invitation creation timestamp |

### Business Rules

1. **Token generation**: 256-bit random string, hashed with SHA-256 before storage
2. **One invitation per guest**: Enforced at service layer; guest can have only one active invitation
3. **Delivery tracking**: Status updated via webhooks (WhatsApp) or tracking pixels (email)
4. **Retry logic**: Max 2 retries for WhatsApp failures before falling back to email
5. **Bounce handling**: Hard bounces set status to 'bounced' and flag guest email as suspended
6. **Token expiry**: Invitation tokens expire at RSVP deadline (7 days before EventDate)
7. **Denormalized EventId**: Stored for efficient queries without joining through Guests

### GDPR Handling

| Field | On Erasure Request |
|-------|-------------------|
| TokenHash | Re-hashed with random salt (invalidates the link) |
| SentVia, SentAt, DeliveryStatus, RetryCount | Retained (audit data) |
| IsDeleted, DeletedAt | Retained (reference data) |

---

## RSVPs

Guest responses to invitations — attendance, dietary needs, transport, and personal messages.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| InvitationId | uuid | No | — | FK → Invitations(Id), UNIQUE | One RSVP per invitation |
| GuestId | uuid | No | — | FK → Guests(Id), indexed | Responding guest |
| EventId | uuid | No | — | FK → Events(Id), indexed | Parent event (denormalized) |
| Attendance | varchar(10) | No | — | CHECK IN ('yes','no','maybe') | Guest attendance decision |
| DietaryRestrictions | text | Yes | NULL | Max 500 chars | Free-text dietary info |
| NeedsTransport | boolean | No | false | — | Transport requirement flag |
| PlusOne | boolean | No | false | — | Plus-one attendance flag |
| Message | text | Yes | NULL | Max 1000 chars | Personal message to hosts |
| SubmittedAt | timestamptz | No | NOW() | — | First submission timestamp |
| UpdatedAt | timestamptz | No | NOW() | — | Last update timestamp |

### Business Rules

1. **One RSVP per invitation**: UNIQUE constraint on InvitationId
2. **RSVP deadline**: Cannot submit or update RSVP less than 7 days before EventDate
3. **Update allowed**: Guests can modify their RSVP before the deadline
4. **Idempotent submission**: Double-click or network retry results in single RSVP
5. **Real-time dashboard**: Host dashboard updates within 5 seconds of RSVP submission (via polling or WebSocket)
6. **Denormalized GuestId and EventId**: Stored for efficient dashboard queries without joins

### GDPR Handling

| Field | On Erasure Request |
|-------|-------------------|
| DietaryRestrictions | Replaced with `[Redacted]` |
| Message | Replaced with `[Redacted]` |
| Attendance, NeedsTransport, PlusOne | Retained (audit data — needed for host planning) |
| SubmittedAt, UpdatedAt | Retained (audit timestamps) |

---

## Accomplices

Trusted persons with magic link access to send live event updates.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), indexed | Associated event |
| Email | varchar(320) | No | — | Valid email format | Accomplice contact email |
| TokenHash | varchar(256) | No | — | UNIQUE, indexed | SHA-256 hash of magic link token |
| Permissions | jsonb | No | '["send_messages","view_rsvps"]' | Valid JSON array | Scoped permissions |
| GrantedAt | timestamptz | No | NOW() | — | Access granted timestamp |
| ExpiresAt | timestamptz | No | — | Default: EventDate + 1 day | Access expiry |
| LastAccessedAt | timestamptz | Yes | NULL | — | Last panel access |
| IsRevoked | boolean | No | false | — | Revocation flag |
| IsAnonymized | boolean | No | false | — | GDPR anonymization flag |
| AnonymizedAt | timestamptz | Yes | NULL | — | Anonymization timestamp |

### Business Rules

1. **Magic link access**: No password required — single-use token for initial access, then JWT session
2. **Permissions**: JSON array of allowed actions (`send_messages`, `view_rsvps`)
3. **Auto-expiry**: Access expires EventDate + 1 day (configurable by host)
4. **Revocation**: Host can revoke access from dashboard at any time
5. **Resend**: Host can resend magic link if accomplice loses the email (generates new token, invalidates old)
6. **Multiple accomplices**: Supported — each has independent access and token
7. **No account required**: Accomplices access panel directly via magic link (MVP decision)

### Permissions Schema

```json
["send_messages", "view_rsvps"]
```

| Permission | Description |
|------------|-------------|
| `send_messages` | Can send live notifications via swipe-to-send |
| `view_rsvps` | Can view RSVP summary on the panel |

### GDPR Handling

| Field | On Erasure Request |
|-------|-------------------|
| Email | Replaced with `deleted-{uuid}@anonymous.invalid` |
| TokenHash | Re-hashed with random salt |
| IsAnonymized | Set to `true` |
| AnonymizedAt | Set to `NOW()` |
| Permissions, GrantedAt, ExpiresAt, LastAccessedAt | Retained (audit data) |

---

## MessageTemplates

Pre-configured live message templates for the accomplice panel.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), indexed | Associated event |
| Label | varchar(100) | No | — | Min 1 char, max 100 | Button display label |
| DefaultMessage | text | No | — | Min 1 char, max 500 | Message text sent to guests |
| Icon | varchar(50) | No | — | From allowed icon set | Button icon identifier |
| RequiresSwipe | boolean | No | true | — | Whether swipe gesture is required |
| IsDeleted | boolean | No | false | — | Soft delete flag |

### Default Templates (MVP)

| Label | DefaultMessage | Icon |
|-------|---------------|------|
| Bride Leaving | "The bride is leaving the hotel!" | Bride |
| Ceremony Starting | "The ceremony is about to begin!" | Church |
| They Said Yes | "They said YES!" | Ring |
| Cocktail Hour | "Cocktail hour is starting!" | Champagne |
| Dinner Time | "Dinner is served!" | Plate |
| First Dance | "The first dance is starting!" | Dance |
| Cake Cutting | "Time for the cake!" | Cake |
| Party Time | "Let the dancing begin!" | Music |

### Business Rules

1. **Host customization**: Host can edit labels and messages before the event
2. **Soft delete**: Hosts can remove templates; sent LiveMessages retain reference
3. **Icon set**: Limited to predefined icon set (no custom uploads in MVP)
4. **Default set**: 8 templates created automatically when event is published

### GDPR Handling

| Field | On Erasure Request |
|-------|-------------------|
| DefaultMessage | Replaced with `[Redacted]` |
| Label, Icon, RequiresSwipe | Retained (no PII) |

---

## LiveMessages

Sent live notifications — tracks delivery of accomplice messages to guests.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), indexed | Associated event |
| AccompliceId | uuid | No | — | FK → Accomplices(Id), indexed | Sending accomplice |
| MessageTemplateId | uuid | No | — | FK → MessageTemplates(Id) | Source template |
| CustomMessage | text | Yes | NULL | Max 500 chars | Customized message text |
| SentVia | varchar(20) | No | 'whatsapp' | CHECK IN ('email','whatsapp','both') | Delivery channel |
| SentAt | timestamptz | No | NOW() | — | Message send timestamp |
| DeliveryStatus | varchar(20) | No | 'pending' | CHECK IN ('pending','queued','sent','delivered','failed') | Current delivery state |
| RetryCount | int | No | 0 | DEFAULT 0, max 2 | Retry attempt count |

### Business Rules

1. **Swipe-to-send**: Messages require swipe gesture (80% threshold) to prevent accidental sends
2. **Queue-based**: Messages enqueued in Dragonfly for async processing by WhatsApp Dispatcher
3. **Rate limiting**: Max messages per accomplice per hour (prevent spam)
4. **Delivery tracking**: Status updated via WhatsApp webhook callbacks
5. **Custom messages**: Accomplice can customize template message before sending (V2+)

### GDPR Handling

| Field | On Erasure Request |
|-------|-------------------|
| CustomMessage | Replaced with `[Redacted]` |
| SentVia, SentAt, DeliveryStatus, RetryCount | Retained (audit data) |

---

## Payments

Stripe payment records for event publishing.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), UNIQUE | One payment per event |
| StripePaymentIntentId | varchar(255) | Yes | NULL | UNIQUE | Stripe Payment Intent ID |
| StripeCustomerId | varchar(255) | Yes | NULL | — | Stripe Customer ID |
| Amount | decimal(10,2) | No | — | CHECK > 0 | Payment amount in EUR |
| Currency | varchar(3) | No | 'EUR' | ISO 4217 | Always EUR for MVP |
| Status | varchar(20) | No | 'pending' | CHECK IN ('pending','succeeded','failed','refunded') | Payment state |
| Tier | varchar(20) | No | — | CHECK IN ('standard','premium') | Publishing tier |
| CreatedAt | timestamptz | No | NOW() | — | Payment initiation timestamp |
| CompletedAt | timestamptz | Yes | NULL | — | Payment completion timestamp |

### Business Rules

1. **One payment per event**: UNIQUE constraint on EventId
2. **Tier pricing**: Standard = EUR 19, Premium = EUR 29 (configurable)
3. **Webhook-driven**: Status updated via Stripe `payment_intent.succeeded` / `payment_intent.failed` webhooks
4. **Idempotent webhook**: Same webhook event processed multiple times produces same result
5. **No card data**: PCI compliance — no card numbers stored (Stripe Elements handles card input)
6. **Publishing trigger**: Event status changes to `published` only after payment succeeds

### GDPR Handling

- No PII stored — Stripe IDs are opaque references, not personal data
- Payment records retained indefinitely for financial audit and tax compliance
- No anonymization needed

---

## DataRetentionJobs

Scheduled data deletion jobs — triggers hard deletion 30 days after EventEndDate.

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), UNIQUE | Associated event |
| ScheduledDeleteAt | timestamptz | No | — | — | EventEndDate + 30 days |
| Status | varchar(20) | No | 'scheduled' | CHECK IN ('scheduled','running','completed','failed') | Job state |
| ExecutedAt | timestamptz | Yes | NULL | — | Actual execution timestamp |
| FailureReason | text | Yes | NULL | Max 1000 chars | Error message if failed |
| CreatedAt | timestamptz | No | NOW() | — | Job creation timestamp |

### Business Rules

1. **Auto-created**: Job created when event is created, with `ScheduledDeleteAt = EventDate + 30 days`
2. **Daily execution**: CronJob runs at 02:00 UTC, queries `WHERE ScheduledDeleteAt <= NOW() AND Status = 'scheduled'`
3. **Atomic deletion**: All-or-nothing per event within a transaction
4. **FK-safe order**: Deletes in dependency order (RSVPs → LiveMessages → ... → Events)
5. **Retry on failure**: Failed jobs retried next day; max 3 retries before alerting
6. **Concurrency**: Single pod execution (`concurrencyPolicy: Forbid`)

### Deletion Order

```
1. RSVPs
2. LiveMessages
3. MessageTemplates
4. Accomplices
5. Invitations
6. Guests
7. Events
8. DataRetentionJobs (self)
```

**Not deleted**: Payments, DeliveryLogs (no PII, retained for audit)

### GDPR Handling

- No PII stored — all fields are reference/audit
- No anonymization needed

---

## DeliveryLogs

Audit trail for all message deliveries (email, WhatsApp, magic links, reminders, thank you cards).

### Columns

| Column | Type | Nullable | Default | Constraints | Business Rule |
|--------|------|----------|---------|-------------|---------------|
| Id | uuid | No | gen_random_uuid() | PK | — |
| EventId | uuid | No | — | FK → Events(Id), indexed | Associated event |
| EntityType | varchar(30) | No | — | CHECK IN ('invitation','live_message','reminder','thank_you','magic_link') | Type of entity being delivered |
| EntityId | uuid | No | — | — | ID of the entity |
| Channel | varchar(20) | No | — | CHECK IN ('email','whatsapp') | Delivery channel |
| MessageType | varchar(50) | No | — | — | Specific message type |
| DeliveryStatus | varchar(20) | No | 'pending' | CHECK IN ('pending','sent','delivered','opened','failed','bounced') | Current delivery state |
| ProviderMessageId | varchar(255) | Yes | NULL | — | WhatsApp message ID or email message ID |
| SentAt | timestamptz | Yes | NULL | — | Message sent timestamp |
| DeliveredAt | timestamptz | Yes | NULL | — | Message delivered timestamp |
| FailedAt | timestamptz | Yes | NULL | — | Message failure timestamp |
| RetryCount | int | No | 0 | DEFAULT 0 | Number of retries |
| FailureReason | text | Yes | NULL | Max 500 chars | Error description |

### Business Rules

1. **Created for every send**: Every email, WhatsApp message, magic link, reminder, and thank you card creates a DeliveryLog
2. **Status transitions**: `pending → sent → delivered` or `pending → sent → failed`
3. **Webhook updates**: WhatsApp webhooks update `DeliveryStatus` and `DeliveredAt`/`FailedAt`
4. **No PII**: DeliveryLogs reference entities by ID only — no personal data stored
5. **Retention**: Never deleted — serves as operational audit trail
6. **Metrics source**: Dashboard delivery rates, channel performance, and failure analysis queries this table

### Message Types

| EntityType | MessageType Values |
|------------|-------------------|
| `invitation` | `invitation_email`, `invitation_whatsapp` |
| `live_message` | `live_update` |
| `reminder` | `rsvp_reminder_email`, `rsvp_reminder_whatsapp` |
| `thank_you` | `thank_you_email`, `thank_you_whatsapp` |
| `magic_link` | `login_magic_link`, `accomplice_magic_link` |

### GDPR Handling

- No PII stored — all fields are reference/audit
- No anonymization needed
- Retained indefinitely for operational audit
