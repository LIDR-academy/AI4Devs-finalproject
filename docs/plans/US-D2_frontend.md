# Frontend Implementation Plan: US-D2 Owner Ready Email Notification

## Overview

Extend the delivery panel **mark-contacted** flow (US-D1) so the UI reflects **best-effort email** results from the API: warn **before** contact if the owner has no email, show toasts by `emailStatus` after contact, display `ownerNotifiedAt` / “correo no enviado” in detail, and offer **Reenviar correo** via `POST .../resend-owner-email`. Contact success remains independent of email outcome (HTTP 200 with non-`sent` statuses).

**Architecture principles:** extend `delivery-panel` only; React Query mutations; Spanish UI strings; map English API warnings to Spanish; Playwright e2e; no secrets in the browser.

**User story reference:** [`us/Deseables/US-D2-notificacion-correo-propietario.md`](../../us/Deseables/US-D2-notificacion-correo-propietario.md)

**Backend plan:** [`docs/plans/US-D2_backend.md`](./US-D2_backend.md)

**Prerequisites:** US-D1 frontend (`MarkContactedDialog`, `useMarkContacted`) and US-D2 backend (`emailStatus` on mark-contacted + resend endpoint) on `feature-entrega2-RFM`.

**Out of scope:** Building/editing email HTML in the browser, SMTP config UI, US-D4 reminders panel, mechanic access.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router |
| Server state | React Query |
| Styling | Tailwind CSS |
| HTTP | `apiClient` |
| E2E | Playwright |

### Files to add/modify

```
apps/web/src/features/delivery-panel/
├── types/delivery.types.ts
│     # EmailStatus, MarkContactedResponse email fields, ResendOwnerEmailResponse
├── services/deliveryApi.ts
│     # resendOwnerEmail()
├── hooks/useMarkContacted.ts          # return/handle emailStatus from response
├── hooks/useResendOwnerEmail.ts       # NEW
├── utils/mapEmailStatus.ts            # NEW — toast copy from emailStatus
├── utils/mapDeliveryError.ts          # 422 CLIENT_EMAIL_MISSING
├── components/
│   ├── MarkContactedDialog.tsx        # pre-warn no email / will send to {email}
│   ├── DeliveryReadyDetail.tsx        # ownerNotifiedAt + Reenviar CTA
│   └── DeliveryPanelPage.tsx          # toast variants after contact/resend
└── (optional) components/EmailStatusBanner.tsx

apps/web/e2e/delivery-panel.spec.ts    # email warning + status toasts + resend
apps/web/README.md
```

### Routing

No new routes — remains `/admin/delivery`.

### State management

| Concern | Approach |
|---------|----------|
| Contact + email side-effect | Existing `useMarkContacted`; read `emailStatus` from mutation result |
| Resend | `useResendOwnerEmail` → invalidate delivery queries |
| Pre-contact warning | Derived from `target.ownerEmail` in dialog (list/detail already expose email) |
| Toast message | Page-level `toastMessage` + optional `toastVariant: 'success' \| 'warning'` |

---

## Implementation Steps

### Step 0: Stay on Entrega 2 Branch

- **Action:** Implement on delivery branch (no `feature/US-D2-frontend`).
- **Branch (required):** `feature-entrega2-RFM`
- **Implementation Steps:**
  1. `git checkout feature-entrega2-RFM`
  2. Confirm US-D1 UI + US-D2 API are available on this branch.
  3. Do not split a separate frontend ticket branch during entrega 2.
- **Notes:** Align with `us/Deseables/README.md` and `docs/plans/US-D1_frontend.md` Step 0.

---

### Step 1: Extend Types

- **File:** `types/delivery.types.ts`
- **Action:** Model email outcome fields from backend.
- **Implementation Steps:**
  1. Add:

```typescript
export type EmailStatus =
  | 'sent'
  | 'skipped_no_email'
  | 'skipped_disabled'
  | 'failed';

export interface MarkContactedResponse {
  workOrderId: string;
  status: string;
  ownerContactedAt: string;
  ownerContactedBy: { id: string; fullName: string };
  emailStatus: EmailStatus;
  emailWarning: string | null;
  ownerNotifiedAt: string | null;
}

export interface ResendOwnerEmailResponse {
  workOrderId: string;
  emailStatus: EmailStatus;
  emailWarning: string | null;
  ownerNotifiedAt: string | null;
}
```

  2. Add optional `ownerNotifiedAt: string | null` to `DeliveryReadyDetail` (and list item if backend includes it — prefer detail for display).
- **Dependencies:** US-D2 API contract.
- **Implementation Notes:** If D1 types already defined `MarkContactedResponse` without email fields, extend in place (breaking for compile until backend ships — expected on same branch).

---

### Step 2: API — `resendOwnerEmail`

- **File:** `services/deliveryApi.ts`
- **Action:** Add resend call; ensure `markContacted` typing returns full D2 response.
- **Function Signature:**

```typescript
resendOwnerEmail(workOrderId: string): Promise<ResendOwnerEmailResponse>
```

- **Implementation Steps:**
  1. `POST /delivery/ready/${workOrderId}/resend-owner-email` with `apiClient` (empty body).
  2. Keep `markContacted` as `PATCH .../mark-contacted` returning `MarkContactedResponse`.
- **Dependencies:** Types from Step 1.
- **Implementation Notes:** No email credentials in requests.

---

### Step 3: `mapEmailStatus` Helper (Spanish Copy)

- **File:** `utils/mapEmailStatus.ts` (new)
- **Action:** Centralize user-facing messages (do not show raw English `emailWarning` unless as fallback).
- **Function Signature:**

```typescript
export function mapEmailStatusToToast(
  status: EmailStatus,
): { variant: 'success' | 'warning'; message: string }

export function mapEmailStatusToDetailLabel(
  status: EmailStatus | null,
  ownerNotifiedAt: string | null,
): string
```

- **Implementation Steps:**
  1. Map:

| `emailStatus` | Toast (Spanish) |
|---------------|-----------------|
| `sent` | *Contacto registrado y correo enviado.* |
| `skipped_no_email` | *Contacto registrado. El cliente no tiene correo; no se envió email.* |
| `skipped_disabled` | *Contacto registrado. El envío de correo está deshabilitado en este entorno.* |
| `failed` | *Contacto registrado, pero no se pudo enviar el correo. Puedes reintentar.* |

  2. Detail labels: if `ownerNotifiedAt` → *Correo enviado el {fecha}*; else *Correo no enviado*.
  3. Optional: append truncated API `emailWarning` only in `role="status"` for debugging — prefer pure Spanish map.
- **Dependencies:** None.
- **Implementation Notes:** Contact-without-email path must never look like a failure of the contact itself.

---

### Step 4: Enhance `MarkContactedDialog` (Pre-Send Warnings)

- **File:** `components/MarkContactedDialog.tsx`
- **Action:** Warn before confirming based on `ownerEmail`.
- **Component Signature:** Extend target type:

```typescript
target: Pick<
  DeliveryReadyItem,
  'workOrderId' | 'licensePlate' | 'ownerEmail'
> | null
```

- **Implementation Steps:**
  1. If `!ownerEmail`: amber alert box  
     *“Este cliente no tiene correo. Se registrará el contacto pero no se enviará email.”*  
     Primary button label: **Contactar de todos modos** (or keep Confirm + alert visible).
  2. If `ownerEmail` present: muted info  
     *“Se enviará un resumen al correo {ownerEmail} (con copia al taller).”*
  3. On success, pass mutation result upward: `onSuccess(result: MarkContactedResponse)` instead of void — so page can toast by `emailStatus`.
  4. Still treat contact `409` via existing conflict callback (US-D1).
  5. Do **not** block confirm when email missing.
- **Dependencies:** `useMarkContacted`, Tailwind alert styles.
- **Implementation Notes:** `ownerEmail` already on list items (`DeliveryReadyItem.ownerEmail` from US-008).

---

### Step 5: Wire Contact Success Toasts on Page

- **File:** `DeliveryPanelPage.tsx` (and any parent handling contact success)
- **Action:** Branch toast by `emailStatus`.
- **Implementation Steps:**
  1. Change `handleContactSuccess` to accept `MarkContactedResponse`.
  2. `const { variant, message } = mapEmailStatusToToast(result.emailStatus)`.
  3. Support warning styling (e.g. `bg-amber-800` vs `bg-slate-900`) via `toastVariant` state.
  4. Invalidate/refetch list (mutation `onSuccess` already) so detail can show `ownerNotifiedAt` after expand.
- **Dependencies:** Step 3 helper.
- **Implementation Notes:** Always refresh list after contact so status badge updates even when email skipped.

---

### Step 6: Hook `useResendOwnerEmail`

- **File:** `hooks/useResendOwnerEmail.ts` (new)
- **Action:** Mutation for resend.
- **Function Signature:**

```typescript
export function useResendOwnerEmail()
```

- **Implementation Steps:**
  1. `mutationFn: deliveryApi.resendOwnerEmail`.
  2. Invalidate `['delivery', 'ready']` and detail key on settled success.
  3. Surface `ApiError` for 422/409 to callers.
- **Dependencies:** React Query, `deliveryApi`.
- **Implementation Notes:** Mirror `useMarkContacted` patterns.

---

### Step 7: Detail Panel — Notification Status + Resend CTA

- **File:** `DeliveryReadyDetail.tsx`
- **Action:** Show email outcome and allow retry when contacted (or delivered if still on panel — normally contacted only).
- **Implementation Steps:**
  1. When `status === 'OWNER_CONTACTED'` (and optionally always when `ownerNotifiedAt`/`ownerEmail` meaningful):
     - Show audit contact block (US-D1).
     - Show email line via `mapEmailStatusToDetailLabel` using detail’s `ownerNotifiedAt`.
  2. Show button **Reenviar correo** when:
     - `ownerEmail` present AND
     - (`ownerNotifiedAt` is null OR user wants explicit retry — always show if email present and status contacted).
  3. Hide resend when `!ownerEmail` (show only *Sin correo registrado*).
  4. On click: call `useResendOwnerEmail`; toast via same `mapEmailStatusToToast` (for resend, tweak copy slightly if needed: *Correo reenviado.* / warnings without “Contacto registrado”).
  5. Add `mapResendEmailStatusToToast` or parameter `context: 'contact' | 'resend'` in helper.
  6. Handle `422` → *“El cliente no tiene correo registrado.”*; `409` → eligibility message in Spanish.
- **Dependencies:** Steps 3, 6; detail must include `ownerNotifiedAt` from API (extend detail fetch typing; if backend only returns it on mark/resend, refetch detail after mutations or add field to list/detail GET in backend — **backend plan includes field on WO**; ensure GET detail serializes it — if missing, ask backend to add to detail DTO as small follow-up).
- **Implementation Notes:** Prefer extending detail DTO in same entrega if not already planned — note in Backend verification. For FE plan: assume `ownerNotifiedAt` on detail once WO column exists; if GET omits it, add backend mapping task.

---

### Step 8: Error Mapping Updates

- **File:** `utils/mapDeliveryError.ts`
- **Action:** Map resend errors.
- **Implementation Steps:**
  1. `422` + message `CLIENT_EMAIL_MISSING` → Spanish no-email message.
  2. `409` resend eligibility → *“No se puede reenviar el correo para esta orden.”*
  3. Keep US-D1 contact 409 mappings intact.
- **Dependencies:** `ApiError`.

---

### Step 9: Playwright E2E

- **File:** `e2e/delivery-panel.spec.ts` (extend)
- **Action:** Cover pre-warn, post-status, resend (with console/disabled backend).
- **Implementation Steps:**
  1. Owner **with** email: open contact dialog → see “Se enviará un resumen al correo…”.
  2. Confirm → toast includes enviado **or** deshabilitado (env-dependent); assert contact badge still *Propietario contactado*.
  3. Owner **without** email: dialog shows amber warning; confirm → toast about no email; status contacted.
  4. On contacted row with email: **Reenviar correo** visible; click → success/warning toast; no status regression.
  5. Regression: deliver after contact still works.
- **Dependencies:** Seed clients with/without email; API `EMAIL_PROVIDER=console` or disabled.
- **Implementation Notes:** Avoid asserting real inbox delivery; assert UI + `emailStatus`-driven copy.

---

### Step 10: Update Technical Documentation

- **Action:** Mandatory docs update.
- **Implementation Steps:**
  1. Review UI strings and API usage.
  2. Update `apps/web/README.md` — delivery panel: contact emails, resend, env dependence on API mail flags.
  3. Cross-link `docs/plans/US-D2_backend.md` / this file.
  4. Verify English technical docs; Spanish only for UI examples if needed.
  5. Report updated files in commit notes.
- **References:** `docs/documentation-standards.mdc`, `docs/frontend-standards.mdc`.

---

## Implementation Order

1. Step 0 — `feature-entrega2-RFM` (+ D1 UI + D2 API)
2. Step 1 — Types
3. Step 2 — `resendOwnerEmail` API
4. Step 3 — `mapEmailStatus` helpers
5. Step 4 — `MarkContactedDialog` pre-warnings + `onSuccess(result)`
6. Step 5 — Page toasts by `emailStatus`
7. Step 6 — `useResendOwnerEmail`
8. Step 7 — Detail status + resend CTA
9. Step 8 — Error map 422/409
10. Step 9 — Playwright
11. Step 10 — Documentation

---

## Testing Checklist

- [ ] No-email dialog warning; contact still allowed
- [ ] With-email info line before confirm
- [ ] Toasts match `sent` / `skipped_*` / `failed`
- [ ] Contact badge/state never rolled back on email failure
- [ ] Resend shown when email exists on contacted WO
- [ ] Resend hidden / explained when no email
- [ ] 422/409 mapped to Spanish
- [ ] Deliver still works
- [ ] No SMTP secrets in network tab payloads
- [ ] Playwright cases green

---

## Error Handling Patterns

| Case | UI |
|------|-----|
| mark-contacted 200 + `failed` | Warning toast + keep contacted + offer resend |
| mark-contacted 409 | Existing D1 conflict handling |
| resend 422 | Alert *sin correo* |
| resend 409 | Alert *no elegible* |
| resend network error | Generic delivery error string |
| Mutation pending | Disable confirm/resend buttons |

Prefer `role="status"` / `role="alert"` for toasts and dialog errors (a11y).

---

## UI/UX Considerations

- **Spanish** for all user-visible strings.
- **Amber** for skip/fail warnings; **neutral/dark** toast for full success.
- Do not imply the contact failed when only email failed.
- Resend button: secondary variant; place near contact audit block.
- Responsive: warning boxes full width in dialog; wrap email text.
- Accessibility: do not rely on color alone; include text.

---

## Dependencies

| Dependency | Notes |
|------------|-------|
| US-D1 frontend | Dialog + mark contacted mutation |
| US-D2 backend | `emailStatus`, resend, `ownerNotifiedAt` |
| Existing UI | `Modal`, `Button`, toast pattern on `DeliveryPanelPage` |
| **No new npm packages** | |

**Backend follow-up if needed:** Ensure `GET /delivery/ready/:id` returns `ownerNotifiedAt` for detail display (column on WO is not enough until mapper includes it).

---

## Notes

- **Branch:** `feature-entrega2-RFM` only.
- **Code English / UI Spanish.**
- **Security:** Browser never configures `EMAIL_*`; only displays outcomes.
- **US-D4:** Do not build reminders UI here; only patterns for email status toasts may be reused later.
- **Env:** Local may show `skipped_disabled` often — acceptable; e2e should tolerate or force console-enabled API.

---

## Next Steps After Implementation

1. Commit on `feature-entrega2-RFM`
2. Manual smoke: contact with/without email; resend; deliver
3. Proceed to next deseable (e.g. D5 / D7) per delivery order

---

## Implementation Verification

### Code Quality

- [ ] Email UX confined to `delivery-panel`
- [ ] Shared toast mapping helper (no duplicated strings)
- [ ] Playwright, not Cypress

### Functionality

- [ ] Pre-warn + post-status + resend paths work
- [ ] Contact integrity preserved in UI messaging

### Testing

- [ ] E2E covers with/without email and resend

### Integration

- [ ] Types match `docs/plans/US-D2_backend.md` responses

### Documentation

- [ ] Step 10 completed
