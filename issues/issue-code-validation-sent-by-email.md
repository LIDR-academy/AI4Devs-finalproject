# [Enhancement] Send API key renewal verification code via email (async Celery task)

| Field       | Value |
|-------------|-------|
| **Status**  | Backlog |
| **Type**    | Enhancement |
| **Labels**  | backend, frontend, email, celery |
| **Trello**  | https://trello.com/c/TW615IyX/263-enhancement-send-api-key-renewal-verification-code-via-email-async-celery-task |
| **GitHub issue** | https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/issues/18 |

---

## Summary

Currently, `POST /api/v1/users/renew/challenge` returns the one-time verification code **directly in the API response** (`data.verification_code`). This is a temporary workaround because no SMTP server is configured yet.

The intended behaviour once SMTP is in place:
- The backend sends the verification code to the user's registered email address via an **asynchronous Celery task**.
- The frontend stops displaying the raw code to the end user.

---

## Context

| Location | Details |
|----------|---------|
| `backend/core/users/routes/renew.py` | Challenge endpoint — contains `# TODO: Replace with email delivery once SMTP is configured.` |
| `frontend/src/app/api/auth/renew/route.ts` | Next.js proxy route — currently forwards `verificationCode` from the backend response to the browser |
| `frontend/src/components/auth/dashboard-view.tsx` | Dashboard UI — renders an amber banner with the raw code and auto-fills the verification input |
| PR #17 | https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/17 |

---

## Acceptance Criteria

- [ ] SMTP configuration (host, port, credentials, TLS flag) added to the backend config layer, loaded exclusively from environment variables — never hard-coded or committed to version control.
- [ ] A Celery task `send_renewal_verification_email(user_id, code)` is created in the backend tasks module. The user's email address is fetched from the database inside the task.
- [ ] The `renew_challenge` endpoint dispatches the Celery task asynchronously instead of returning the code in the response body.
- [ ] `POST /api/v1/users/renew/challenge` response no longer includes `data.verification_code`.
- [ ] `frontend/src/app/api/auth/renew/route.ts` — remove the forwarding of `verificationCode` from the challenge action response.
- [ ] `frontend/src/components/auth/dashboard-view.tsx` — remove the `challengeCode` state, the amber verification code banner, and the input auto-fill logic introduced as the temporary fix.
- [ ] Unit tests cover the Celery task using a mocked email client (no real SMTP connection required in tests).
- [ ] Integration test verifies that the challenge endpoint response body contains no `data.verification_code` field.

---

## Implementation notes

- The Celery task should use a retry policy with exponential back-off in case the SMTP server is temporarily unavailable.
- The email template should include the code, the expiry window, and a clear warning not to share it.
- Consider using `flask-mail` or a dedicated `smtplib`-based helper; keep the transport layer injectable for testing.
- The `.env.example` file should document all required SMTP variables (e.g. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_TLS`).
