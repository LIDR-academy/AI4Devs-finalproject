## Context

First domain module built on top of `bootstrap-project` and `add-erp-gateway`. No ERP interaction here — this is entirely local (EyeMaster's own users, roles, permissions). Every later change assumes an authenticated request and a way to check permissions by code.

## Goals / Non-Goals

**Goals:**
- Email-based auth with JWT, matching `readme.md` §2.5.
- Role → permissions model that is admin-editable, not hardcoded, per R-SEG-02.
- A single reusable DRF permission class other apps declare against (`RequiresPermission("cliente.crear")`).
- A minimal, working login screen and route guard on the frontend.

**Non-Goals:**
- Full user/role management UI polish (functional CRUD is enough; design pass is a later concern).
- Password reset / MFA (not in scope for this delivery; tracked as an open item if needed later).
- The audit log itself (a separate capability, `add-audit-log`, built next) — this change only emits events for it to consume.

## Decisions

- **Custom user model with `USERNAME_FIELD = "email"`**, extending `AbstractUser` but removing `username`. Must be set before the first migration since Django doesn't allow swapping user models later. *Alternative:* keep `username` and treat email as a profile field — rejected, contradicts R-SEG requirement that email is the login.
- **Own `Role`/`Permission` models, not Django's built-in `Group`/`Permission`.** Reuses only the auth engine (password hashing, user model), not Django admin's permission UI, per the documented architectural decision "RBAC with own views". Permission codes are free-form strings (`cliente.crear`), not tied to Django's `app_label.codename` convention, so any app can declare a code without a migration coupling to `accounts`.
- **`djangorestframework-simplejwt` for JWT**, already a dependency. Access token lifetime 15 min / refresh 7 days (already set in `core/settings.py` `SIMPLE_JWT`).
- **`RequiresPermission` DRF permission class** takes a permission code, checks it against `request.user.role.permissions`. Cached per-request via `request.user` to avoid repeated queries.
- **Audit emission via a lightweight synchronous hook function** (`emit_audit_event(user, action, ...)`) that, until `add-audit-log` lands, is a no-op logger; `add-audit-log` will replace its body to persist to `Bitacora`. Keeps this change from taking on the audit model's design.
- **Frontend:** tokens stored in memory + `localStorage` for the refresh token only (access token kept in memory to reduce XSS exposure); a small `AuthProvider` context wires `setAuthTokenProvider` from `httpClient.ts`.

## Risks / Trade-offs

- **Custom user model must be right the first time** → keep the model minimal (email, name, role, active) so later changes are additive, not migrations that alter `AUTH_USER_MODEL` fields destructively.
- **Own RBAC duplicates some of Django's permission machinery** → accepted trade-off, already decided architecturally; benefit is permissions manageable from product screens instead of Django admin.
- **In-memory access token means a page refresh loses it** → mitigated by silent refresh on load using the stored refresh token; acceptable for an internal tool.
- **No password policy enforced yet** (PD in `documentacion-funcional.md` §11) → use Django's default validators for now; revisit when the policy is defined.

## Migration Plan

Greenfield — `AUTH_USER_MODEL` is set before any migration is created, so no user-table migration risk. Seed roles/permissions via a data migration so `docker-compose up` + `migrate` leaves the system immediately usable with a bootstrap administrator (created via a management command, not committed credentials).

## Open Questions

- Exact password policy (length/characters) — open item PD, deferred.
- Whether `refresh` token rotation/blacklisting is needed for this delivery, or is acceptable to defer.
