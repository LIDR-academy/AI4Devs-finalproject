# Backend Implementation Plan: US-D4 Maintenance Reminder Panel

## Overview

Add an **ADMIN-only `reminders` module** that:

1. Lists vehicles eligible for preventive maintenance outreach (last **delivered** visit older than N days, no active WO, not opted out) with **`limit` / `offset`** (dashboard uses `limit=5`).
2. Supports **opt-out / opt-in** and **batch-sends** Spanish reminder emails via shared **`EmailPort`**.
3. Uses existing `Vehicle` columns (`excludeFromReminders`, `excludedAt`, `excludedById`, `lastReminderSentAt`).

Eligibility is computed **in real time** (no cron in V2). No schema migration expected.

**Architecture principles:** Nest modular monolith (`RemindersController` → `RemindersService` → Prisma); reuse/create `notifications` + `EmailPort`; TDD; English API messages / `warning` strings; Spanish email body; partial success on batch send.

**User story:** [`us/Deseables/US-D4-panel-recordatorios-mantenimiento.md`](../../us/Deseables/US-D4-panel-recordatorios-mantenimiento.md) (enhanced 2026-08-13: dashboard widget)

**Frontend plan:** [`docs/plans/US-D4_frontend.md`](./US-D4_frontend.md) (separate; consumes this API)

**Prerequisites:** US-008 (`ENTREGADA` + `deliveredAt`); `ACTIVE_WORK_ORDER_STATUSES` includes `OWNER_CONTACTED` (present); US-003 `Client.email`; active ownership (US-004/D3). **`EmailPort` / `NotificationsModule` are not in the repo yet** — see Step 1 (minimal shared mail infra).

**Out of scope (backend):** Dashboard/nav/Playwright UI; SMS; auto cron; Bull; `ReminderSendLog` table; brand/service filters; full US-D2 owner-ready delivery email flow (only the shared port/adapters needed here).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D4 artifacts |
|-------|----------------|-----------------|
| **Presentation** | `/api/reminders/*`, ADMIN only, query validation | `RemindersController` |
| **Application** | Eligibility, pagination, opt-out/in, batch send | `RemindersService`, `MaintenanceReminderEmailService` |
| **Domain** | Threshold days; eligibility rules | constants + pure helpers |
| **Infrastructure** | Prisma; `EmailPort` adapters | `Vehicle`, `WorkOrder`, `VehicleOwnership`, `Client` |

### Files to add/modify

```
# Minimal shared mail (if missing — subset of US-D2)
apps/api/src/modules/notifications/
├── notifications.module.ts                   # NEW (export EMAIL_PORT)
├── ports/email.port.ts                       # NEW
├── adapters/console-email.adapter.ts         # NEW
└── adapters/smtp-email.adapter.ts            # NEW (optional; wire behind EMAIL_PROVIDER)

# US-D4 reminders
apps/api/src/modules/reminders/
├── reminders.module.ts                       # NEW
├── reminders.controller.ts                   # NEW
├── reminders.service.ts                      # NEW
├── reminders.service.spec.ts                 # NEW
├── constants/reminder-inactive-days.ts       # NEW
└── dto/
    ├── eligible-reminders-query.dto.ts       # NEW (limit, offset, days?, q?)
    ├── eligible-reminder-item.dto.ts         # NEW
    ├── eligible-reminders-response.dto.ts    # NEW
    ├── send-reminders.dto.ts                 # NEW
    ├── send-reminders-response.dto.ts        # NEW
    └── opted-out-reminders-response.dto.ts   # NEW

apps/api/src/modules/notifications/
├── templates/maintenance-reminder.ts         # NEW
├── templates/maintenance-reminder.spec.ts    # NEW
└── maintenance-reminder-email.service.ts     # NEW (+ spec)

apps/api/src/app.module.ts                    # import RemindersModule (+ NotificationsModule)
apps/api/.env.example                         # REMINDER_INACTIVE_DAYS (+ EMAIL_* if new)
apps/api/README.md
docs/api-spec.reminders.yml                   # NEW
apps/api/test/reminders.e2e-spec.ts           # NEW
```

**Verify only (no change expected):**

- `prisma/schema.prisma` — Vehicle reminder fields
- `work-orders/constants/work-order-status.ts` — `ACTIVE_WORK_ORDER_STATUSES`

### API endpoints

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/reminders/eligible` | Bearer | `ADMIN` | Paginated eligible list **(dashboard: `limit=5`)** |
| `POST` | `/api/reminders/send` | Bearer | `ADMIN` | Batch send reminders |
| `POST` | `/api/reminders/:vehicleId/opt-out` | Bearer | `ADMIN` | Never remind |
| `POST` | `/api/reminders/:vehicleId/opt-in` | Bearer | `ADMIN` | Clear opt-out |
| `GET` | `/api/reminders/opted-out` | Bearer | `ADMIN` | Exclusions list |

**Route order:** declare `eligible`, `send`, `opted-out` **before** `:vehicleId/...`.

### Query / response contracts (locked)

#### `GET /api/reminders/eligible`

| Param | Default | Rules |
|-------|---------|--------|
| `limit` | `50` | `@Min(1)`, `@Max(100)` — dashboard uses **`5`** |
| `offset` | `0` | `@Min(0)` |
| `days` | env / 180 | Optional; clamp `[30, 730]` |
| `q` | — | Optional; contains plate or owner name |

**Response `200`:**

```ts
{
  items: EligibleReminderItemDto[];
  total: number;          // full eligible count (not page length)
  limit: number;          // echoed
  offset: number;         // echoed
  thresholdDays: number;  // effective threshold used
}
```

**Item fields:**

| Field | Type | Notes |
|-------|------|-------|
| `vehicleId` | string (uuid) | |
| `licensePlate` | string | |
| `vehicleLabel` | string | e.g. `"Toyota Corolla 2018"` |
| `ownerName` | string | Active ownership client |
| `ownerEmail` | string \| null | |
| `ownerClientId` | string (uuid) | |
| `lastVisitAt` | Date (ISO) | `max(deliveredAt)` |
| `daysSinceVisit` | number | floor days since `lastVisitAt` |
| `lastReminderSentAt` | Date \| null | |
| `canEmail` | boolean | `Boolean(ownerEmail)` |

**Ordering:** `lastVisitAt` **ASC** (oldest visit first), then `vehicleId` ASC for stability.

#### `POST /api/reminders/send`

**Request:** `{ "vehicleIds": string[] }` — `@ArrayMinSize(1)`, `@ArrayMaxSize(100)`, UUID each.

**Response `200`:** `{ results: [...], summary: { requested, sent, skipped, failed } }`

Per-item `emailStatus`: `sent` | `skipped_no_email` | `skipped_not_eligible` | `skipped_disabled` | `failed`.

Only `sent` updates `Vehicle.lastReminderSentAt`.

---

## Implementation Steps

### Step 0: Stay on `finalproject-RFM` (no feature branch)

- **Action:** Implement on **`finalproject-RFM`**. Do **not** create `feature/US-D4-backend`.
- **Implementation Steps:**
  1. `git checkout finalproject-RFM`
  2. `git pull origin finalproject-RFM` (if needed)
  3. `git branch --show-current` → must be `finalproject-RFM`
- **Notes:** Product mandate for this delivery line. Overrides generic ai-specs Step 0 naming. Older plan drafts mentioning `feature-entrega2-RFM` are obsolete.

---

### Step 1: Prerequisite — minimal `EmailPort` (if missing)

- **Gap:** `apps/api/src/modules/notifications/` does **not** exist yet (US-D2 not implemented).
- **Action:** Add the **minimal shared mail stack** so D4 can send (console / disabled). Do **not** implement full US-D2 delivery mark-contacted email in this ticket unless already doing D2 in the same effort.
- **Files:** `ports/email.port.ts`, `adapters/console-email.adapter.ts`, optional `smtp-email.adapter.ts`, `notifications.module.ts`
- **Port contract (align with `docs/plans/US-D2_backend.md`):**

```ts
export const EMAIL_PORT = Symbol('EMAIL_PORT');

export type SendEmailInput = {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  text: string;
};

export interface EmailPort {
  send(input: SendEmailInput): Promise<{ ok: true } | { ok: false; error: string }>;
}
```

- **Implementation Steps:**
  1. `ConsoleEmailAdapter`: log subject/to (no secrets/bodies in prod logs at info); return `{ ok: true }` when `EMAIL_ENABLED=true` and provider=`console`.
  2. Module factory: if `EMAIL_ENABLED=false` → still provide port; callers treat as `skipped_disabled` **before** or **inside** mailer service (prefer service layer checks Config).
  3. Export `EMAIL_PORT` from `NotificationsModule`.
  4. Env keys in `.env.example`: `EMAIL_ENABLED`, `EMAIL_PROVIDER` (`console`|`smtp`), `WORKSHOP_NAME`, `WORKSHOP_PHONE`, `WORKSHOP_ADMIN_EMAIL` (reuse D2 naming).
- **Implementation Notes:** If D2 lands first with the same port, **skip this step** and import existing module. Prefer one shared port — no duplicate SMTP code in `reminders`.

---

### Step 2: Verify schema + active statuses (no migration expected)

- **Files:** `prisma/schema.prisma`, `work-order-status.ts`
- **Action:** Confirm Vehicle reminder fields and `ACTIVE_WORK_ORDER_STATUSES`.
- **Implementation Steps:**
  1. Confirm `excludeFromReminders`, `excludedAt`, `excludedById`, `lastReminderSentAt`.
  2. Confirm active set includes `EN_PROCESO`, `LISTA_PARA_ENTREGA`, `OWNER_CONTACTED`.
  3. No migration unless a field is missing on an older DB.
- **Notes:** Do not invent `reminderOptOut` column names.

---

### Step 3: Constants + config helpers

- **File:** `reminders/constants/reminder-inactive-days.ts`
- **Action:** Threshold and batch limits.

```ts
export const DEFAULT_REMINDER_INACTIVE_DAYS = 180;
export const MIN_REMINDER_INACTIVE_DAYS = 30;
export const MAX_REMINDER_INACTIVE_DAYS = 730;
export const MAX_REMINDER_BATCH_SIZE = 100;
export const DEFAULT_ELIGIBLE_LIMIT = 50;
export const MAX_ELIGIBLE_LIMIT = 100;

export function resolveReminderInactiveDays(
  envValue: string | undefined,
  queryDays?: number,
): number;
```

- Clamp env + query into `[30, 730]`; default `180`.
- Document `REMINDER_INACTIVE_DAYS` in `.env.example`.

---

### Step 4: Write failing unit tests for eligibility + pagination (TDD)

- **File:** `reminders.service.spec.ts`
- **Action:** Describe `listEligible` with Prisma mocks (or integration-style with test DB if project prefers — unit mocks OK if query is encapsulated).
- **Cases (minimum):**
  1. Delivered **181d** ago → included; **179d** → excluded.
  2. `excludeFromReminders=true` → excluded.
  3. Active WO present (incl. `OWNER_CONTACTED`) → excluded.
  4. Never `ENTREGADA` → excluded.
  5. No active ownership → excluded.
  6. No email → still listed, `canEmail: false`.
  7. **Pagination:** `limit=5`, `offset=0` → `take: 5`, `skip: 0`; `total` from full count, not `items.length`.
  8. Response echoes `limit`, `offset`, `thresholdDays`.
  9. Order: oldest `lastVisitAt` first.
- **Implementation Notes:** Run → **red** before service implementation.

---

### Step 5: DTOs for eligible list

- **Files:** `eligible-reminders-query.dto.ts`, `eligible-reminder-item.dto.ts`, `eligible-reminders-response.dto.ts`
- **Query signature:**

```ts
export class EligibleRemindersQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number; // service default 50

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  offset?: number; // default 0

  @IsOptional() @Type(() => Number) @IsInt() @Min(30) @Max(730)
  days?: number;

  @IsOptional() @IsString() @MaxLength(100)
  q?: string;
}
```

- Match existing DTO style (`@Type(() => Number)`). Service applies `limit ?? 50`, `offset ?? 0`.

---

### Step 6: Implement `RemindersService.listEligible`

- **File:** `reminders.service.ts`
- **Signature:**

```ts
async listEligible(query: EligibleRemindersQueryDto): Promise<EligibleRemindersResponseDto>
```

- **Eligibility (all must hold):**
  1. `excludeFromReminders === false`
  2. ≥1 WO `status = ENTREGADA` with `deliveredAt != null`
  3. `lastDeliveredAt = max(deliveredAt)` ≤ `now - thresholdDays`
  4. No WO with `status IN ACTIVE_WORK_ORDER_STATUSES`
  5. Active ownership (`validTo IS NULL`) with client — else **exclude**

- **Implementation approach (document choice in code comment):**
  - Preferred: Prisma multi-step or `$queryRaw` with last-delivery subquery + anti-join active WOs; then join ownership/client; then `skip`/`take` in memory **only if** N is tiny — for V2, prefer filtering IDs in SQL/Prisma then paginate.
  - Acceptable two-step:
    1. Aggregate last `deliveredAt` per `vehicleId` for `ENTREGADA`.
    2. Filter vehicles by opt-out, no active WO, ownership; sort; slice `offset..offset+limit`; separate `total`.
  - Current owner = **active ownership** client (D3-aware), not WO snapshot.

- **Map item:** `vehicleLabel = \`${brand} ${model} ${year}\``.
- **Dependencies:** `ACTIVE_WORK_ORDER_STATUSES`, `ConfigService` / env for threshold.

---

### Step 7: Opt-out / opt-in / opted-out list

- **Signatures:**

```ts
async optOut(vehicleId: string, actorUserId: string): Promise<{ vehicleId: string; excludeFromReminders: true }>
async optIn(vehicleId: string): Promise<{ vehicleId: string; excludeFromReminders: false }>
async listOptedOut(): Promise<OptedOutRemindersResponseDto>
```

- **Steps:**
  1. **optOut:** set flags + `excludedAt` + `excludedById`; idempotent if already true → `200`.
  2. **optIn:** clear to `false` / `null` / `null`.
  3. **listOptedOut:** `excludeFromReminders=true`; include current owner if any + `excludedBy` `{ id, fullName }`; order `excludedAt` desc.
  4. Missing vehicle → `404` `Not Found`.
- **Unit tests:** idempotent opt-out; opt-in clears; list shape.

---

### Step 8: Maintenance reminder template + email service

- **Files:** `templates/maintenance-reminder.ts`, `maintenance-reminder-email.service.ts` (+ specs)
- **Template signature:**

```ts
buildMaintenanceReminderEmail(input: {
  ownerFullName: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  daysSinceVisit: number;
  workshopName: string;
  workshopPhone?: string | null;
}): { subject: string; html: string; text: string }
```

- Subject: `Te esperamos de nuevo — mantenimiento {placa} | {workshopName}`
- Escape user strings; **no** OT amounts (unlike D2 owner-ready).
- **Mailer service:** resolve CC (`WORKSHOP_ADMIN_EMAIL` + actor email, dedupe); if `EMAIL_ENABLED=false` → `skipped_disabled`; if no email → caller returns `skipped_no_email`; call `EmailPort.send`; map failures to `failed`.
- **Unit tests:** template contains plate + greeting; skip/fail/sent with mocked port.

---

### Step 9: Batch send

- **Signature:**

```ts
async sendReminders(
  dto: SendRemindersDto,
  actor: { userId: string; email: string },
): Promise<SendRemindersResponseDto>
```

- **Steps:**
  1. Validate non-empty, ≤100 IDs → else `400`.
  2. Deduplicate preserving order.
  3. Per id: re-check eligibility → `skipped_not_eligible`; no email → `skipped_no_email`; else send; on `sent` only → `lastReminderSentAt = now()`.
  4. Concurrency: sequential or pool of 3; never abort whole batch on one failure.
  5. `summary.skipped` = all `skip_*` statuses.
  6. HTTP **200** when request valid (partial success).
- **API `warning` strings:** English (FE maps to Spanish), e.g. `Owner has no email registered`.
- **Unit tests:** mixed batch; timestamp only on sent; empty/>100 → 400.

---

### Step 10: Controller + module wiring

- **Files:** `reminders.controller.ts`, `reminders.module.ts`, `app.module.ts`
- **Steps:**
  1. `@Controller('reminders')` + `JwtAuthGuard` + `RolesGuard` + `@Roles(UserRole.ADMIN)`.
  2. Wire `listEligible`, `send`, `optOut`, `optIn`, `listOptedOut`; pass `CurrentUser` for send/opt-out.
  3. Import `NotificationsModule`, `PrismaModule`.
  4. Register `RemindersModule` in `AppModule`.
  5. Static paths before `:vehicleId`.
- **MECHANIC** → `403` on all.

---

### Step 11: Make unit tests green

- **Action:** Implement until Step 4/7/9 specs pass.
- **Command:** `npm test -- --testPathPattern=reminders` (from `apps/api`).
- **Notes:** Keep mocks focused on where/skip/take and status mapping.

---

### Step 12: E2E API

- **File:** `apps/api/test/reminders.e2e-spec.ts`
- **Cases (minimum):**
  1. Fixture: vehicle + `ENTREGADA` with `deliveredAt` >180d, active ownership + email, not opted out.
  2. ADMIN `GET /api/reminders/eligible` → includes it; `daysSinceVisit` ≥ threshold.
  3. `GET .../eligible?limit=5&offset=0` → `limit === 5`, `items.length <= 5`, `total` ≥ items.
  4. Recent delivery excluded.
  5. `POST opt-out` → leaves eligible; appears in opted-out; `opt-in` when still eligible returns to list.
  6. `POST /send` → summary; `lastReminderSentAt` only when `sent` (force `EMAIL_ENABLED=true` + console in test if possible).
  7. MECHANIC → `403`.
  8. Unauthenticated → `401`.
  9. Unknown id in batch → `skipped_not_eligible` (do not fail whole request).
- **Notes:** No real SMTP.

---

### Step 13: Update Technical Documentation

- **Action:** Mandatory English docs.
- **Steps:**
  1. Add `docs/api-spec.reminders.yml` — all five endpoints; query `limit`/`offset`; schemas; `400`/`401`/`403`/`404`.
  2. Update `apps/api/README.md` — Reminders section; env `REMINDER_INACTIVE_DAYS`; note dashboard uses `limit=5`.
  3. If Step 1 added mail: document `EMAIL_*` / workshop env briefly (or point to D2 section once present).
  4. No Prisma schema doc change if columns unchanged.
- **References:** `docs/documentation-standards.mdc`

---

## Implementation Order

1. Step 0 — Stay on `finalproject-RFM`
2. Step 1 — Minimal `EmailPort` (skip if already present)
3. Step 2 — Schema / active statuses verify
4. Step 3 — Threshold constants
5. Step 4 — Failing unit tests (eligibility + pagination)
6. Step 5 — Eligible DTOs
7. Step 6 — `listEligible`
8. Step 7 — Opt-out / opt-in / opted-out
9. Step 8 — Template + maintenance email service
10. Step 9 — Batch send
11. Step 10 — Controller + AppModule
12. Step 11 — Unit tests green
13. Step 12 — E2E
14. Step 13 — OpenAPI + API README

---

## Testing Checklist

- [ ] Eligibility: 180d threshold, opt-out, active WO incl. `OWNER_CONTACTED`, ownership required
- [ ] `canEmail: false` still listed
- [ ] Pagination: `limit`/`offset` echoed; `total` is full count; dashboard contract `limit=5`
- [ ] Batch partial success; only `sent` updates `lastReminderSentAt`
- [ ] Opt-out/in idempotent / reversible
- [ ] ADMIN only (`403` mechanic)
- [ ] Reuses `EmailPort` (no duplicate SMTP in reminders)
- [ ] CI works with email disabled/console
- [ ] Unit + e2e green

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "vehicleIds must contain at most 100 items",
  "error": "Bad Request"
}
```

| Status | Condition | Notes |
|--------|-----------|-------|
| `401` | No JWT | |
| `403` | Non-ADMIN | |
| `404` | Opt-out/in unknown vehicle | `Not Found` |
| `400` | Empty / oversized `vehicleIds`; invalid `limit`/`offset`/`days` | ValidationPipe |
| `200` | Eligible empty list | `{ items: [], total: 0, ... }` |
| `200` | Send with mixed per-item statuses | Partial success in body |

Per-item send statuses are **not** HTTP errors.

---

## Partial Update Support

N/A — no PATCH of vehicle attributes. Opt-out/in are dedicated POSTs. Send body is a list of IDs.

---

## Dependencies

| Dependency | Required? |
|------------|-----------|
| New npm packages | **No** (unless D2 SMTP already chose `nodemailer` — reuse) |
| Prisma migration | **No** (expected) |
| `EmailPort` | **Yes** — Step 1 minimal or full US-D2 |
| Existing | `JwtAuthGuard`, `RolesGuard`, `ACTIVE_WORK_ORDER_STATUSES`, Prisma |

---

## Notes

- **Branch:** `finalproject-RFM` only.
- **Dashboard is FE-only** for layout; backend must support `GET .../eligible?limit=5&offset=0` with correct `total` so “Ver más” can show when `total > 5`.
- **Current owner email** after transfer — use active ownership (D3-aware).
- **No ReminderSendLog** in V2 — `lastReminderSentAt` only.
- **Language:** API English; email Spanish; code English.
- **Performance:** Real-time query; materialization = V2.1 out of scope.
- **Warning language:** English in API `warning` fields; FE maps to Spanish.
- Completing Step 1 does **not** close US-D2; owner-ready email remains a separate ticket.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` for US-D4 (widget + `/admin/reminders` + nav) if not done.
2. `/develop-backend` against this plan on `finalproject-RFM`.
3. Commit when user requests (no auto-commit).
4. Prod: rebuild **api**; backup DB first; no volume wipe; migrate only if a migration was added.

---

## Implementation Verification

- [ ] Code quality: typed DTOs, TDD, ADMIN guards, no dead code
- [ ] Functionality: contract matches enhanced US-D4 (incl. pagination)
- [ ] Testing: unit + e2e green
- [ ] Integration: does not break delivery / work-orders
- [ ] Documentation: `api-spec.reminders.yml` + `apps/api/README.md`
- [ ] Branch still `finalproject-RFM`
- [ ] Ready for FE widget (`limit=5`) + full panel
