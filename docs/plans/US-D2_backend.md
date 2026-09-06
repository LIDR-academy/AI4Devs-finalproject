# Backend Implementation Plan: US-D2 Owner Ready Email Notification

## Overview

After US-D1 marks a work order as **owner contacted**, send a **best-effort transactional email** to the owner (`Client.email` from OT snapshot) with WO summary (vehicle, completed tasks, total CRC), CC workshop admin + acting admin. Contact persistence must **never roll back** if mail fails. Expose `emailStatus` on mark-contacted response, persist `ownerNotifiedAt` on success, and add **resend** endpoint. Introduce a reusable **`EmailPort`** under `notifications` (shared later with US-D4).

**Architecture principles:** Hexagonal port/adapter for email; Delivery orchestrates after contact commit; TDD; ConfigModule feature flags; English API messages; Spanish email body content (product requirement).

**User story reference:** [`us/Deseables/US-D2-notificacion-correo-propietario.md`](../../us/Deseables/US-D2-notificacion-correo-propietario.md)

**Prerequisites:** US-D1 backend (`markContacted`) on `feature-entrega2-RFM`; US-006 totals; US-003 `Client.email`.

**Out of scope:** Frontend (`plan-frontend-ticket`), SMS, PDF attachments, Bull queues, full `NotificationLog` table, US-D4 reminder panel (only share `EmailPort`).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-D2 artifacts |
|-------|----------------|-----------------|
| **Presentation** | mark-contacted response fields; resend route | `DeliveryController` |
| **Application** | Orchestrate contact→email; resend rules | `DeliveryService`, `OwnerReadyEmailService` |
| **Domain / port** | `EmailPort` contract; email status enum | `ports/email.port.ts` |
| **Infrastructure** | Console + one real provider adapter | `adapters/*-email.adapter.ts` |
| **Templates** | Pure HTML/text builders | `templates/owner-ready-for-pickup.ts` |

### Files to add/modify

```
apps/api/prisma/
├── schema.prisma                              # WorkOrder.ownerNotifiedAt
└── migrations/<ts>_add_owner_notified_at/

apps/api/src/modules/notifications/
├── notifications.module.ts                    # NEW — exports EmailPort + OwnerReadyEmailService
├── ports/email.port.ts                        # NEW
├── adapters/console-email.adapter.ts          # NEW
├── adapters/smtp-email.adapter.ts             # NEW (chosen prod path — see Notes)
├── templates/owner-ready-for-pickup.ts        # NEW
├── templates/owner-ready-for-pickup.spec.ts   # NEW
├── owner-ready-email.service.ts               # NEW
├── owner-ready-email.service.spec.ts          # NEW
└── utils/format-crc.ts                        # NEW (or shared)

apps/api/src/modules/delivery/
├── delivery.module.ts                         # import NotificationsModule
├── delivery.service.ts                        # after markContacted → send; resendOwnerEmail
├── delivery.controller.ts                     # POST resend-owner-email
├── delivery.service.spec.ts
├── dto/mark-contacted-response.dto.ts         # + emailStatus, emailWarning, ownerNotifiedAt
└── dto/resend-owner-email-response.dto.ts     # NEW

apps/api/src/app.module.ts                     # import NotificationsModule (or only via Delivery)

apps/api/.env.example
apps/api/README.md
docs/api-spec.delivery.yml
test/delivery.e2e-spec.ts
```

### API endpoints (US-D2)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `PATCH` | `/api/delivery/ready/:workOrderId/mark-contacted` | Bearer | `ADMIN` | US-D1 + email attempt; always 200 if contact OK |
| `POST` | `/api/delivery/ready/:workOrderId/resend-owner-email` | Bearer | `ADMIN` | Resend summary email **(new)** |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Action:** Implement on delivery branch only.
- **Branch (required):** `feature-entrega2-RFM`
- **Implementation Steps:**
  1. `git checkout feature-entrega2-RFM`
  2. Pull if needed; confirm branch name.
  3. Do **not** create `feature/US-D2-backend`.
  4. Confirm US-D1 `markContacted` exists (or implement D1 first per `docs/plans/US-D1_backend.md`).
- **Notes:** Entrega 2 single-branch workflow (`us/Deseables/README.md`).

---

### Step 1: Prisma — `ownerNotifiedAt`

- **File:** `apps/api/prisma/schema.prisma` + migration
- **Action:** Add nullable timestamp for last **successful** owner notification.
- **Implementation Steps:**
  1. On `WorkOrder`: `ownerNotifiedAt DateTime?`
  2. `npx prisma migrate dev --name add_owner_notified_at` (or create SQL migration in repo style).
  3. No backfill required.
- **Dependencies:** Prisma CLI.
- **Implementation Notes:** Do not add `NotificationLog` in V2 (nice-to-have V2.1 for D4).

---

### Step 2: Email Port + Config Contract

- **Files:** `ports/email.port.ts`, env docs
- **Action:** Define injectable port and env variables.
- **Function Signature:**

```typescript
export const EMAIL_PORT = Symbol('EMAIL_PORT');

export type EmailStatus =
  | 'sent'
  | 'skipped_no_email'
  | 'skipped_disabled'
  | 'failed';

export interface EmailMessage {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  text: string;
}

export interface EmailSendResult {
  messageId: string;
}

export interface EmailPort {
  send(message: EmailMessage): Promise<EmailSendResult>;
}
```

- **Implementation Steps:**
  1. Document env (English comments in `.env.example`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `EMAIL_ENABLED` | `false` | Master switch |
| `EMAIL_PROVIDER` | `console` | `console` \| `smtp` |
| `EMAIL_FROM` | — | Required if enabled + non-console |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | — | When `smtp` |
| `WORKSHOP_ADMIN_EMAIL` | — | CC |
| `WORKSHOP_NAME` | `Taller` | Subject/footer |
| `WORKSHOP_PHONE` | — | Footer optional |
| `EMAIL_SEND_TIMEOUT_MS` | `8000` | Abort/fail → `failed` |

  2. Fail-fast in **production** when `EMAIL_ENABLED=true` and provider smtp missing secrets; in development allow `console`.
- **Dependencies:** `@nestjs/config` (already global).
- **Implementation Notes:** Prefer **console + smtp (nodemailer)** as the single real path — no mandatory SendGrid account for the course. D4 reuses the same port.

---

### Step 3: Adapters — Console + SMTP

- **Files:** `adapters/console-email.adapter.ts`, `adapters/smtp-email.adapter.ts`, `notifications.module.ts`
- **Action:** Implement adapters; bind `EMAIL_PORT` by config.
- **Implementation Steps:**
  1. **ConsoleEmailAdapter:** log structured `{ to, cc, subject }` (not full HTML in prod log level; OK to log subject in dev); resolve `{ messageId: 'console-<uuid>' }`.
  2. **SmtpEmailAdapter:** use `nodemailer` createTransport; `sendMail`; map result `messageId`.
  3. Add dependency: `npm install nodemailer` + `@types/nodemailer` (dev).
  4. `NotificationsModule` factory:
     - If `EMAIL_ENABLED !== 'true'` → still provide Console (or Noop that throws/`skipped` handled above port).
     - Else switch `EMAIL_PROVIDER`.
  5. Export `EMAIL_PORT` and `OwnerReadyEmailService`.
- **Dependencies:** `nodemailer`.
- **Implementation Notes:** Unit tests should inject a mock `EmailPort`, never hit SMTP.

---

### Step 4: Template + CRC Helper (TDD)

- **Files:** `templates/owner-ready-for-pickup.ts`, `*.spec.ts`, `utils/format-crc.ts`
- **Action:** Pure functions building Spanish email content.
- **Function Signature:**

```typescript
export function formatCrc(amount: number): string

export function buildOwnerReadyEmail(input: {
  ownerFullName: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  tasks: Array<{ description: string; cost: number }>;
  totalAmount: number;
  workshopName: string;
  workshopPhone?: string | null;
}): { subject: string; html: string; text: string }
```

- **Implementation Steps:**
  1. Subject: `Vehículo listo para retiro — {placa} | {workshopName}`
  2. Body: greeting, vehicle line, task list with costs, total, pickup invitation, footer.
  3. Tasks input = same set as `calculateTotalAmount` (COMPLETED + cost != null) — build in service before calling template.
  4. Unit tests: snapshot or string contains for plate, total, owner name.
- **Dependencies:** None (pure).
- **Implementation Notes:** HTML escaping for user-provided names/descriptions (basic escape `<` `>` `&` `"`).

---

### Step 5: `OwnerReadyEmailService` (TDD)

- **File:** `owner-ready-email.service.ts` + spec
- **Action:** Resolve recipient, CC, call port, update `ownerNotifiedAt`.
- **Function Signature:**

```typescript
async sendForWorkOrder(params: {
  workOrderId: string;
  actorUserId: string;
  actorEmail: string | null;
}): Promise<{
  emailStatus: EmailStatus;
  emailWarning: string | null;
  ownerNotifiedAt: Date | null;
}>
```

- **Implementation Steps:**
  1. Load WO with `vehicle`, `ownerClient`, `tasks`, current `ownerNotifiedAt`.
  2. If missing WO → throw `NotFoundException` (for resend); for mark-contacted path caller already has WO — may pass loaded entity to avoid double fetch (optional overload).
  3. If `EMAIL_ENABLED` false → return `skipped_disabled` + Spanish warning string for UI (API may return English code + message field — prefer **English** `emailWarning` for API consistency with other endpoints, Spanish on frontend; **decide:** use English API warnings matching US table translated on FE, **or** Spanish in API as US sample — **plan choice: English machine codes + English short warning** for API; FE maps to Spanish).

     Recommended warnings:
     - `skipped_no_email`: `Client has no email; contact was recorded`
     - `skipped_disabled`: `Email sending is disabled in this environment`
     - `failed`: `Failed to send email; you can retry`

  4. Normalize owner email; if empty → `skipped_no_email` (no port call).
  5. Build CC: unique non-empty `[WORKSHOP_ADMIN_EMAIL, actorEmail]`.
  6. Build tasks via same filter as `calculateTotalAmount`; total via helper.
  7. Call `emailPort.send` with timeout (`Promise.race` or Abort if supported).
  8. On success: update `ownerNotifiedAt = now()`; return `sent` + timestamp.
  9. On throw: log `{ event: 'email.owner_ready.failed', workOrderId, error }`; return `failed` (**do not throw** to delivery orchestrator).
- **Dependencies:** `EMAIL_PORT`, `PrismaService`, `ConfigService`.
- **Implementation Notes:** Critical invariant — never throw after contact committed when called from markContacted.

---

### Step 6: Wire into `markContacted` (US-D1)

- **File:** `delivery.service.ts`, DTOs, `delivery.module.ts`
- **Action:** After successful contact update, attempt email; extend response.
- **Function Signature:** extend existing:

```typescript
async markContacted(
  workOrderId: string,
  actorUserId: string,
  actorEmail: string,
): Promise<MarkContactedResponseDto>
```

- **Implementation Steps:**
  1. Perform US-D1 contact update first (commit).
  2. Call `ownerReadyEmailService.sendForWorkOrder(...)`.
  3. Attach `emailStatus`, `emailWarning`, `ownerNotifiedAt` to response DTO.
  4. Controller: pass `user.email` from `AuthenticatedUser` (already on JWT payload).
  5. Import `NotificationsModule` into `DeliveryModule`.
- **Dependencies:** US-D1 markContacted implemented.
- **Implementation Notes:** HTTP **200** whenever contact succeeded, regardless of `emailStatus`.

---

### Step 7: Resend Endpoint

- **Files:** `delivery.controller.ts`, `delivery.service.ts`, `resend-owner-email-response.dto.ts`
- **Action:** Allow admin to retry email without re-contacting.
- **Function Signature:**

```typescript
@Post('ready/:workOrderId/resend-owner-email')
resendOwnerEmail(
  @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
  @CurrentUser() user: AuthenticatedUser,
): Promise<ResendOwnerEmailResponseDto>
```

- **Implementation Steps:**
  1. Load WO; if missing → `404`.
  2. Allowed statuses: `OWNER_CONTACTED` **or** `ENTREGADA` (minimum V2).
  3. If other status → `409` `Work order is not eligible for owner email resend`.
  4. If no client email → `422` with body:

```json
{
  "statusCode": 422,
  "message": "CLIENT_EMAIL_MISSING",
  "error": "Unprocessable Entity"
}
```

     (Nest `UnprocessableEntityException('CLIENT_EMAIL_MISSING')`.)

  5. Call same `sendForWorkOrder`; return `{ workOrderId, emailStatus, emailWarning, ownerNotifiedAt }`.
  6. Does **not** change `ownerContactedAt` / status.
- **Dependencies:** Same email service.
- **Implementation Notes:** Unlike mark-contacted, resend **may** return 422 when no email (explicit retry intent).

---

### Step 8: Unit Tests Matrix

- **Files:** template spec, owner-ready-email.service.spec, delivery.service.spec
- **Action:** TDD coverage.

#### OwnerReadyEmailService

1. No email → `skipped_no_email`; port not called; `ownerNotifiedAt` unchanged.
2. Email disabled → `skipped_disabled`.
3. Port success → `sent`; prisma update `ownerNotifiedAt`.
4. Port throws → `failed`; no `ownerNotifiedAt` update; no throw.
5. CC dedupes actor = workshop email.

#### DeliveryService.markContacted

6. After contact, email `sent` fields present on response.
7. Email `failed` still returns contact fields with `status OWNER_CONTACTED`.
8. Regression: contact rules from US-D1 still hold.

#### Resend

9. From `OWNER_CONTACTED` with email → sent/failed statuses.
10. No email → 422.
11. `EN_PROCESO` → 409.

- **Implementation Notes:** Mock `EMAIL_PORT`; never network.

---

### Step 9: E2E Tests

- **File:** `apps/api/test/delivery.e2e-spec.ts`
- **Action:** With `EMAIL_ENABLED=true` + `EMAIL_PROVIDER=console` (or false → skipped_disabled).
- **Implementation Steps:**
  1. Set test env in e2e setup for console provider.
  2. Mark-contacted with client email → `emailStatus` in (`sent`,`skipped_disabled`) depending on env — prefer force console+enabled in that test file.
  3. Client without email → `skipped_no_email`, contact `OWNER_CONTACTED`.
  4. Resend happy path; resend missing email → 422.
  5. MECHANIC → 403 on resend.
- **Dependencies:** Existing delivery e2e helpers.
- **Implementation Notes:** Assert contact not rolled back when mocking port failure via override provider in a dedicated e2e if feasible; unit tests already cover failed path deeply.

---

### Step 10: Update Technical Documentation

- **Action:** Mandatory documentation updates (English for `docs/*`).
- **Implementation Steps:**
  1. Review code: notifications module, env, endpoints.
  2. Update:
     - `apps/api/.env.example` — email/workshop vars
     - `apps/api/README.md` — Email section; mark-contacted response; resend
     - `docs/api-spec.delivery.yml` — schemas + resend path
     - `docs/data-model.md` — `ownerNotifiedAt` if WorkOrder documented there
     - Root `.env.example` if it mirrors API env
  3. Note shared `EmailPort` for US-D4.
  4. Verify docs match runtime.
  5. Report files in commit/PR notes.
- **References:** `docs/documentation-standards.mdc`, `docs/backend-standards.mdc`.

---

## Implementation Order

1. Step 0 — `feature-entrega2-RFM` (+ US-D1 present)
2. Step 1 — Migration `ownerNotifiedAt`
3. Step 2 — Email port + env contract
4. Step 3 — Console + SMTP adapters + module
5. Step 4 — Template + CRC (tests)
6. Step 5 — `OwnerReadyEmailService` (tests)
7. Step 6 — Wire `markContacted`
8. Step 7 — Resend endpoint
9. Step 8 — Unit tests complete
10. Step 9 — E2E
11. Step 10 — Documentation

---

## Testing Checklist

- [ ] Contact always persists even if email fails
- [ ] `emailStatus` values covered: sent / skipped_no_email / skipped_disabled / failed
- [ ] `ownerNotifiedAt` set only on `sent`
- [ ] Email uses snapshot `ownerClient`, not current vehicle owner
- [ ] Task list/total match `calculateTotalAmount`
- [ ] CC includes workshop + actor, deduped
- [ ] Resend works for `OWNER_CONTACTED` and `ENTREGADA`
- [ ] Resend without email → 422 `CLIENT_EMAIL_MISSING`
- [ ] ADMIN only; MECHANIC 403
- [ ] CI uses console / disabled (no real SMTP secrets required)
- [ ] Unit + e2e green

---

## Error Response Format

### mark-contacted (contact OK)

Always `200` with body including email fields (even when `failed`).

### Resend / hard failures

```json
{
  "statusCode": 422,
  "message": "CLIENT_EMAIL_MISSING",
  "error": "Unprocessable Entity"
}
```

| Status | Condition | `message` |
|--------|-----------|-----------|
| `401` | No JWT | `Unauthorized` |
| `403` | Non-ADMIN | `Forbidden` |
| `404` | WO not found | `Work order not found` |
| `409` | Resend wrong status | `Work order is not eligible for owner email resend` |
| `422` | Resend, no client email | `CLIENT_EMAIL_MISSING` |

---

## Partial Update Support

Not applicable. Resend has empty body. Email attempt is side effect of mark-contacted, not a patch of arbitrary fields.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| **US-D1** | `markContacted` orchestration hook |
| **US-006** | Task costs / COMPLETED |
| **US-003** | `Client.email` |
| **US-001** | `AuthenticatedUser.email` for CC |
| **npm** | `nodemailer`, `@types/nodemailer` |

US-D4 will import the same `NotificationsModule` / `EMAIL_PORT`.

---

## Notes

- **Branch:** `feature-entrega2-RFM` only.
- **Invariant:** Email never undoes `OWNER_CONTACTED`.
- **Provider choice for this plan:** `console` (dev/test) + `smtp` via nodemailer (prod). Alternatives (Resend/SES) can replace Smtp adapter later behind same port without changing Delivery.
- **Language:** API warnings English; email **body/subject Spanish**; code English.
- **Timeout:** Treat slow SMTP as `failed` after `EMAIL_SEND_TIMEOUT_MS`.
- **Security:** Never log SMTP passwords or full email HTML at `log` level in production; no secrets in responses.
- **D3-safe:** Recipient = `ownerClientId` snapshot email.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket @us/Deseables/US-D2-notificacion-correo-propietario.md` on same branch
2. Commit on `feature-entrega2-RFM`
3. Later: US-D4 reminders reuse `EmailPort` + new template

---

## Implementation Verification

### Code Quality

- [ ] Email behind `EmailPort` (no nodemailer calls inside DeliveryService)
- [ ] Templates pure / testable
- [ ] Feature flag defaults safe (`EMAIL_ENABLED=false`)

### Functionality

- [ ] mark-contacted + email path end-to-end with console
- [ ] Resend path end-to-end
- [ ] Failure path keeps contact

### Testing

- [ ] Unit matrix green
- [ ] E2E green without real mailbox

### Integration

- [ ] DeliveryModule imports NotificationsModule
- [ ] Response contract ready for frontend toasts

### Documentation

- [ ] Step 10 completed
