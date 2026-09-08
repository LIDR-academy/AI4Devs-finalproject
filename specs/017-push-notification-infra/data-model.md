# Data Model: Push Notification Infrastructure (017)

**Date**: 2026-08-21 | **Storage**: PostgreSQL (Prisma) | **Migration**: `<timestamp>_add_device_tokens`

## Entities

### DeviceToken (NEW)

One device's push credential bound to exactly one account.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default uuid() | |
| `token` | String | **UNIQUE**, not null | FCM registration token; upsert key |
| `user_id` | UUID | FK → User.id, not null | Owning account; reassigned on latecomer registration |
| `platform` | DevicePlatform enum | default `WEB` | Only WEB in this story; extensible |
| `is_active` | Boolean | default `true` | `false` ⇒ skipped by dispatch (stale token) |
| `created_at` / `updated_at` | DateTime | default(now()) / @updatedAt | |

Relations: `DeviceToken.user ↔ User.deviceTokens[]`.

**Validation rules** (domain + endpoint): token length 32–4096, platform ∈ {WEB}; ownership reassignment on upsert by unique token (latecomer wins).

**State transitions**: `active → inactive` when the provider reports the token permanently invalid (`messaging/registration-token-not-registered`) — one-way in this story (no admin UI); re-registration of the same token flips it back to active.

```
             register(token, user)                     dispatch failure
[none] ─────────────────────────▶ [ACTIVE] ─────────────────────────▶ [INACTIVE]
                                        ▲                                   │
                                        └──── same token re-registered ─────┘
```

### Notification (EXISTING — reused verbatim)

Already in `schema.prisma:192-204`; no changes.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `notification_type` | Int | Catalog #1–#12 from PRD §7 (validated at domain level, not DB) |
| `recipient_id` | UUID FK → User | One row per recipient (fan-out creates N rows) |
| `class_id` | UUID FK → TrainingClass? | Nullable — e.g., #11 level-change has no class |
| `content` | String | Rendered push text (single line, PRD catalog wording) |
| `is_read` | Boolean | Default `false`; read-marking UI arrives with US-4.5 |
| `sent_at` / `created_at` / `updated_at` | DateTime | |

**Creation order guarantee (spec FR-008)**: a `Notification` row is committed **before** any FCM send is attempted for it; delivery outcome never affects the record's existence.

## Access patterns

| Operation | Where | Pattern |
|---|---|---|
| Register/upsert device token | POST /notifications/device-token | `upsert` by unique `token`; update `user_id`, `platform`, `is_active=true` on match |
| List active tokens for recipient | SendNotification fan-out | `findMany({ user_id, is_active: true })` → select `token` |
| Deactivate stale token | post-dispatch cleanup | `updateMany({ where: { token }, data: { is_active: false } })` |
| Create notification record | SendNotification step 1 | `create` (recipient, type, content, classId?) |
| Read notifications (US-4.5, later) | GET /notifications stub | Out of scope this story — route stays 501 |

## Indexing & integrity notes

- `token @unique` doubles as the upsert lookup index and the dispatch deactivation lookup.
- `(user_id, is_active)` would serve the fan-out query at gym scale (tens of users); no explicit index required now — revisit only if device counts grow orders of magnitude.
- All access via Prisma parameterized client methods (Constitution §V — no raw SQL).
