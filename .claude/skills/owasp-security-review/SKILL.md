---
name: owasp-security-review
description: OWASP Top 10 security review of a RunMarket user story's changes. Walks trust boundaries, injection, XSS, CSRF, secrets, logging and dependencies, scores severity, records findings in the backlog, and loops remediation until no HIGH/CRITICAL remain. Used by the security agent.
---

# OWASP Security Review

Review the changes of an implemented user story against the OWASP Top 10, record
findings in `docs/backlog/<US-ID>.md` (Spanish), fix HIGH/CRITICAL with TDD, and
re-review until clean. Driven by the `security` agent.

---

## Scope & trust boundaries

The network boundary is the Express REST API and the React client. **Authentication
is N/A in this MVP** (anonymous purchase) — so the access-control focus is on
**object/route access and IDOR over `sessionId`**: a session must never read or mutate
another session's cart or orders.

Identify the changed files for the US tasks and review only that surface plus its
direct dependencies.

---

## Review walkthrough (OWASP Top 10 mapped to RunMarket)

1. **Broken access control / IDOR** — can a forged/guessed `sessionId` access another
   session's cart/order? Are list/detail endpoints scoped to the session?
2. **Injection** — Prisma used safely; any `$queryRaw` uses tagged templates; no
   string-built SQL; Zod `.strict()` rejects unexpected fields.
3. **XSS** — no `dangerouslySetInnerHTML`; dynamic content rendered as escaped JSX;
   URL filter params validated against domain enums.
4. **CSRF** — state-changing endpoints; same-site/cors posture; `FRONTEND_URL` origin.
5. **Security misconfiguration** — CORS not wildcard outside dev; rate limiting on
   mutation endpoints; safe error responses (no Prisma codes/stack to client).
6. **Secrets exposure** — no secrets in client bundle/localStorage; no card data
   persisted; env-based config.
7. **Sensitive data / logging** — no PII (`email`, `phone`, `shippingAddress`,
   `cardNumber`, `cardCVV`) in logs; checkout body excluded from Morgan.
8. **Vulnerable dependencies** — `npm audit` for HIGH/CRITICAL advisories.
9. **Integrity of business rules** — price/total read server-side; stock re-validated
   in a transaction at checkout.

---

## Severity rubric

| Severity | Meaning |
|---|---|
| CRITICAL | Remote data loss/leak or full bypass, trivially exploitable |
| HIGH | Exploitable vuln exposing data or integrity (IDOR, injection, secret leak) |
| MEDIUM | Requires unlikely conditions or limited impact |
| LOW | Hardening / defence-in-depth |

**HIGH and CRITICAL must be fixed before the US closes.**

---

## Security checklist (inline)

- [ ] No IDOR: session-scoped access enforced server-side.
- [ ] Zod `.strict()` on every input boundary.
- [ ] No raw SQL string building; tagged templates only.
- [ ] No `dangerouslySetInnerHTML`; filter params validated against enums.
- [ ] CORS origin from `FRONTEND_URL`; no wildcard in staging/prod.
- [ ] Rate limiting on `POST /api/checkout`, `POST/PUT /api/cart`.
- [ ] Error responses generic; Prisma details only in logs.
- [ ] No PII in logs; checkout body excluded.
- [ ] No secrets/card data in client state or localStorage.
- [ ] `sessionId` via `crypto.randomUUID()`.
- [ ] Price/total computed server-side; stock re-validated in transaction.
- [ ] `npm audit` shows no open HIGH/CRITICAL.

---

## Backlog integration

Append to the **OWASP security** section of `docs/backlog/<US-ID>.md`:

| ID | Severity | Component | Vector / Exploit | Fix | Status |
|---|---|---|---|---|---|
| SEC-01 | HIGH | cart.controller | … | … | open / fixed |

---

## Remediation loop

1. Review the US changes with the walkthrough + checklist.
2. Record every finding in the backlog table.
3. Fix HIGH/CRITICAL using **TDD**: write a regression test that reproduces the
   issue, then the fix, then confirm green (delegate edits to the developer skill/agent
   for the affected layer).
4. **Re-review** the changed surface; repeat until **zero open HIGH/CRITICAL**.
5. Mark `Revisión de seguridad aprobada` and check Phase 5 in the workflow state.

Scope modifier `security-only` runs this skill standalone against the current US.
