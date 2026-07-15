# Backend Implementation Plan: US-D4 Maintenance Reminder Panel

## Overview

Add an **ADMIN-only `reminders` module** that lists vehicles eligible for preventive maintenance outreach (last **delivered** visit older than N days, no active WO, not opted out), supports **opt-out/opt-in**, and **batch-sends** Spanish reminder emails via the shared **`EmailPort`** (US-D2). Use existing `Vehicle` columns (`excludeFromReminders`, `excludedAt`, `excludedById`, `lastReminderSentAt`). Eligibility is computed **in real time** (no cron in V2).

**Architecture principles:** new Nest module `reminders`; Controller → Service → Prisma; reuse `notifications` / `EmailPort`; TDD; English API messages; Spanish email body; partial success on batch send.

**User story reference:** [`us/Deseables/US-D4-panel-recordatorios-mantenimiento.md`](../../us/Deseables/US-D4-panel-recordatorios-mantenimiento.md)

**Prerequisites:** US-008 (`ENTREGADA` + `deliveredAt`); US-D1 active statuses include `OWNER_CONTACTED`; **US-D2 `EmailPort` + NotificationsModule** on `feature-entrega2-RFM`; US-003 `Client.email`; US-004 ownership.

**Out of scope:** Frontend, SMS, auto cron without confirmation, Bull queues, `ReminderSendLog` table (V2.1), brand/service segmentation.

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D4 artifacts |
|-------|----------------|-----------------|
| **Presentation** | `/api/reminders/*`, ADMIN only | `RemindersController` |
| **Application** | Eligibility, opt-out/in, batch send orchestration | `RemindersService`, `MaintenanceReminderEmailService` |
| **Domain** | Eligibility predicate; threshold days | Pure helpers + constants |
| **Infrastructure** | Prisma queries; `EmailPort` adapters (from D2) | `Vehicle`, `WorkOrder`, `VehicleOwnership`, `Client` |

### Files to add/modify

```
apps/api/src/modules/reminders/
├── reminders.module.ts                         # NEW
├── reminders.controller.ts                     # NEW
├── reminders.service.ts                        # NEW
├── reminders.service.spec.ts                   # NEW
├── constants/reminder-inactive-days.ts         # NEW
├── utils/eligibility.ts                        # NEW (optional pure helpers)
└── dto/
    ├── eligible-reminders-query.dto.ts
    ├── eligible-reminders-response.dto.ts
    ├── send-reminders.dto.ts
    ├── send-reminders-response.dto.ts
    └── opted-out-reminders-response.dto.ts

apps/api/src/modules/notifications/
├── templates/maintenance-reminder.ts           # NEW
├── templates/maintenance-reminder.spec.ts      # NEW
└── maintenance-reminder-email.service.ts       # NEW (+ spec)

apps/api/src/modules/work-orders/constants/work-order-status.ts
  # ACTIVE_WORK_ORDER_STATUSES must include OWNER_CONTACTED (US-D1) — verify

apps/api/src/app.module.ts                      # import RemindersModule
apps/api/.env.example                           # REMINDER_INACTIVE_DAYS
apps/api/README.md
docs/api-spec.reminders.yml                     # NEW or section in api docs
test/reminders.e2e-spec.ts                      # NEW
```

### API endpoints

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/reminders/eligible` | Bearer | `ADMIN` | List eligible vehicles |
| `POST` | `/api/reminders/send` | Bearer | `ADMIN` | Batch send reminders |
| `POST` | `/api/reminders/:vehicleId/opt-out` | Bearer | `ADMIN` | Never remind |
| `POST` | `/api/reminders/:vehicleId/opt-in` | Bearer | `ADMIN` | Reactivate |
| `GET` | `/api/reminders/opted-out` | Bearer | `ADMIN` | Manage exclusions |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Action:** Implement on delivery branch only.
- **Branch (required):** `feature-entrega2-RFM`
- **Implementation Steps:**
  1. `git checkout feature-entrega2-RFM`
  2. Confirm US-D2 `EmailPort` exists (or implement D2 notifications module first per `docs/plans/US-D2_backend.md`).
  3. Do **not** create `feature/US-D4-backend`.
- **Notes:** Entrega 2 single-branch workflow.

---

### Step 1: Verify Schema + Active Statuses (No Migration Expected)

- **Files:** `prisma/schema.prisma`, `work-order-status.ts`
- **Action:** Confirm vehicle reminder fields and active WO set.
- **Implementation Steps:**
  1. Verify `Vehicle.excludeFromReminders`, `excludedAt`, `excludedById`, `lastReminderSentAt`.
  2. Verify `ACTIVE_WORK_ORDER_STATUSES` includes `EN_PROCESO`, `LISTA_PARA_ENTREGA`, `OWNER_CONTACTED` (US-D1). If D1 not merged yet, include `OWNER_CONTACTED` here as part of eligibility correctness.
  3. No migration unless a field is missing in an older DB.
- **Dependencies:** Prisma.
- **Implementation Notes:** Do not invent `reminderOptOut` column names.

---

### Step 2: Constants + Config

- **File:** `constants/reminder-inactive-days.ts`
- **Action:** Default threshold and env override helper.
- **Implementation Steps:**

```typescript
export const DEFAULT_REMINDER_INACTIVE_DAYS = 180;
export const MIN_REMINDER_INACTIVE_DAYS = 30;
export const MAX_REMINDER_INACTIVE_DAYS = 730;
export const MAX_REMINDER_BATCH_SIZE = 100;

export function resolveReminderInactiveDays(
  envValue: string | undefined,
  queryDays?: number,
): number
```

- Clamp query `days` and env `REMINDER_INACTIVE_DAYS` into [30, 730]; default 180.
- Document in `.env.example`.
- **Dependencies:** `ConfigService` at call site.

---

### Step 3: Eligibility Query (Core) — TDD First Recommended

- **File:** `reminders.service.ts` (+ spec)
- **Action:** Implement `listEligible` predicate.
- **Function Signature:**

```typescript
async listEligible(query: EligibleRemindersQueryDto): Promise<EligibleRemindersResponseDto>
```

- **Eligibility (all must hold):**
  1. `excludeFromReminders === false`
  2. Has ≥1 WO with `status = ENTREGADA` and `deliveredAt != null`
  3. `lastDeliveredAt = max(deliveredAt)` ≤ `now - thresholdDays`
  4. No WO with `status IN ACTIVE_WORK_ORDER_STATUSES`
  5. Active ownership `validTo IS NULL` with client (else **exclude** vehicle)
- **Implementation approach (pick one, document in code):**
  - **Preferred for clarity:** Prisma raw SQL / `$queryRaw` with grouped subquery for last delivery + anti-join active WOs; or
  - Fetch candidate vehicles with relations and filter in service (OK for small N; add limit note).
  - For V2 course scale, a two-step approach is acceptable:
    1. Group delivered WOs by `vehicleId` having `max(deliveredAt)`.
    2. Filter vehicles by opt-out, active WO absence, ownership.
- **DTO item fields:** as US — `vehicleId`, `licensePlate`, `vehicleLabel`, `ownerName`, `ownerEmail`, `ownerClientId`, `lastVisitAt`, `daysSinceVisit`, `lastReminderSentAt`, `canEmail`.
- **Order:** `lastVisitAt` **asc** (oldest visit first).
- **Optional `q`:** case-insensitive contains on plate or owner name (apply after or in WHERE).
- **Response:** `{ items, total, thresholdDays }`.
- **Unit tests:**
  - 181 days since deliver → included
  - 179 days → excluded
  - opt-out → excluded
  - active WO present → excluded
  - never delivered → excluded
  - no ownership → excluded
  - no email → still listed, `canEmail: false`
  - OWNER_CONTACTED counts as active → excluded
- **Dependencies:** `ACTIVE_WORK_ORDER_STATUSES`, Prisma.
- **Implementation Notes:** Current owner = active ownership client (D3-aware), not WO snapshot.

---

### Step 4: Opt-Out / Opt-In / Opted-Out List

- **File:** `reminders.service.ts`, controller, DTOs
- **Action:** Manage exclusions using existing columns.
- **Function Signatures:**

```typescript
async optOut(vehicleId: string, actorUserId: string): Promise<{ vehicleId: string; excludeFromReminders: true }>
async optIn(vehicleId: string): Promise<{ vehicleId: string; excludeFromReminders: false }>
async listOptedOut(): Promise<OptedOutRemindersResponseDto>
```

- **Implementation Steps:**
  1. **optOut:** vehicle exists; set `excludeFromReminders=true`, `excludedAt=now()`, `excludedById=actor`; idempotent if already true → 200.
  2. **optIn:** clear flags (`false` / `null` / `null`).
  3. **listOptedOut:** `where: { excludeFromReminders: true }`, include current owner if any + `excludedBy` `{ id, fullName }`, order by `excludedAt` desc.
  4. Missing vehicle → `404` `Not Found`.
- **Unit tests:** idempotent opt-out; opt-in clears; opted-out list shape.
- **Dependencies:** `CurrentUser` on controller.

---

### Step 5: Maintenance Reminder Template + Email Service

- **Files:** `notifications/templates/maintenance-reminder.ts`, `maintenance-reminder-email.service.ts`
- **Action:** Spanish template without costs; send via `EmailPort`.
- **Function Signature (template):**

```typescript
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
- Escape user strings; no OT amounts.
- **Email service:** resolve CC like US-D2 (`WORKSHOP_ADMIN_EMAIL` + actor email deduped); honor `EMAIL_ENABLED`; return status union compatible with D2 (`sent` | `skipped_no_email` | `skipped_disabled` | `failed`) — plus batch-only `skipped_not_eligible` handled in RemindersService before calling mail.
- **Unit tests:** template contains plate + greeting; mail service skip/fail/sent behavior with mocked port.
- **Dependencies:** US-D2 `EMAIL_PORT`, ConfigService.
- **Implementation Notes:** If D2 module not present, **block** — implement D2 port first rather than duplicating adapters.

---

### Step 6: Batch Send

- **File:** `reminders.service.ts` `sendReminders`
- **Function Signature:**

```typescript
async sendReminders(
  dto: SendRemindersDto,
  actor: { userId: string; email: string },
): Promise<SendRemindersResponseDto>
```

- **Implementation Steps:**
  1. Validate `vehicleIds`: non-empty array, max `MAX_REMINDER_BATCH_SIZE` → else `400`.
  2. Deduplicate IDs preserving order.
  3. For each id:
     a. Re-evaluate eligibility (or load row + check). If not eligible → `{ emailStatus: 'skipped_not_eligible', warning: '...' }`.
     b. If no owner email → `skipped_no_email`.
     c. Else call maintenance email sender.
     d. On `sent` only → update `lastReminderSentAt = now()`.
  4. Concurrency: sequential or pool of 3; never abort whole batch on one failure.
  5. Build `summary: { requested, sent, skipped, failed }` where `skipped` counts all skip_* statuses.
  6. HTTP **200** always when request valid (partial success).
- **DTO:**

```typescript
export class SendRemindersDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100) @IsUUID('4', { each: true })
  vehicleIds!: string[];
}
```

- **Unit tests:** mixed batch (sent + no email + not eligible + failed); `lastReminderSentAt` only on sent; batch >100 → 400; empty → 400.
- **Dependencies:** Step 3–5.
- **Implementation Notes:** API `warning` strings in **English** (FE maps to Spanish), consistent with D2 plan — e.g. `Owner has no email registered`.

---

### Step 7: Controller + Module Wiring

- **Files:** `reminders.controller.ts`, `reminders.module.ts`, `app.module.ts`
- **Action:** Expose routes with ADMIN guard.
- **Implementation Steps:**
  1. `@Controller('reminders')` + `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)`.
  2. Wire methods to service; pass `CurrentUser` for opt-out/send.
  3. Import `NotificationsModule`, `PrismaModule`.
  4. Register `RemindersModule` in `AppModule`.
  5. Route order: declare `eligible`, `send`, `opted-out` **before** `:vehicleId/...` parameterized routes.
- **Dependencies:** Auth commons.
- **Implementation Notes:** MECHANIC → 403 on all.

---

### Step 8: E2E Tests

- **File:** `test/reminders.e2e-spec.ts`
- **Action:** HTTP coverage with console/disabled email.
- **Implementation Steps:**
  1. Seed/fixture: vehicle with delivered WO >180 days ago, active ownership, email; not opted out.
  2. ADMIN `GET /reminders/eligible` includes it with `daysSinceVisit` ≥ threshold.
  3. Vehicle with recent delivery excluded.
  4. `POST opt-out` → disappears from eligible; appears in opted-out; `opt-in` reverses when still eligible.
  5. `POST /reminders/send` with ids → summary; on console+enabled expect `sent` or `skipped_disabled` per env — force console+enabled in test module if possible; assert `lastReminderSentAt` set only when sent.
  6. MECHANIC → 403.
  7. Batch with unknown id → `skipped_not_eligible` (or 404-as-skip — prefer skip status, not fail whole request).
- **Dependencies:** E2E bootstrap; email env.
- **Implementation Notes:** Do not require real SMTP.

---

### Step 9: Update Technical Documentation

- **Action:** Mandatory docs (English for `docs/*`).
- **Implementation Steps:**
  1. Review endpoints + eligibility rules.
  2. Update `apps/api/README.md` — Reminders section; env `REMINDER_INACTIVE_DAYS`.
  3. Add/update OpenAPI (`docs/api-spec.reminders.yml` or append to main spec).
  4. Note dependency on EmailPort (US-D2).
  5. Confirm Vehicle fields documented in data-model if applicable.
  6. Report files in commit notes.
- **References:** `docs/documentation-standards.mdc`, `docs/backend-standards.mdc`.

---

## Implementation Order

1. Step 0 — `feature-entrega2-RFM` (+ US-D2 EmailPort ready)
2. Step 1 — Schema / active statuses verify
3. Step 2 — Threshold constants
4. Step 3 — Eligibility list (+ unit tests)
5. Step 4 — Opt-out / opt-in / opted-out
6. Step 5 — Template + maintenance email service
7. Step 6 — Batch send
8. Step 7 — Controller + AppModule
9. Step 8 — E2E
10. Step 9 — Documentation

---

## Testing Checklist

- [ ] Eligibility rules match US (180d, opt-out, active WO including `OWNER_CONTACTED`, ownership required)
- [ ] `canEmail` false still lists vehicle
- [ ] Batch partial success; only `sent` updates `lastReminderSentAt`
- [ ] Opt-out/in idempotent / reversible
- [ ] ADMIN only
- [ ] Reuses EmailPort (no duplicate SMTP code)
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
| `400` | Empty / oversized `vehicleIds`; invalid query `days` | |
| `200` | Send with mixed per-item statuses | Partial success in body |

Per-item send statuses are **not** HTTP errors.

---

## Partial Update Support

Not applicable to vehicle attributes. Opt-out/in are dedicated actions. Send body is a list of IDs, not a PATCH.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-D2** | `EmailPort`, NotificationsModule, workshop/email env |
| **US-D1** | `OWNER_CONTACTED` in active statuses |
| **US-008** | Delivered WOs |
| **US-003/004** | Client email + ownership |
| **npm** | No new packages beyond D2’s nodemailer |

---

## Notes

- **Branch:** `feature-entrega2-RFM` only.
- **Current owner email** after D3 transfer — eligibility uses active ownership.
- **No ReminderSendLog** in V2 — `lastReminderSentAt` only.
- **Language:** API English; email Spanish; code English.
- **Performance:** Real-time query; if slow in prod, V2.1 materialization — out of scope.
- **Warning language:** English in API `warning` fields for consistency with D2 backend plan; FE maps to Spanish.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket @us/Deseables/US-D4-panel-recordatorios-mantenimiento.md`
2. Commit on `feature-entrega2-RFM`
3. Manual smoke with seeded old delivered WO + console email

---

## Implementation Verification

### Code Quality

- [ ] Existing Vehicle column names used
- [ ] Email only through EmailPort
- [ ] ADMIN guards on all routes

### Functionality

- [ ] Eligible list + send + opt-out/in complete

### Testing

- [ ] Eligibility/send unit matrix + e2e green

### Integration

- [ ] Ready for `/admin/reminders` FE
- [ ] NotificationsModule shared with delivery D2

### Documentation

- [ ] Step 9 completed
