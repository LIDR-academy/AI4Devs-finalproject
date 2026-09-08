# [0002] Seed Super Admin & Administrator roles, the module permission catalog, and register role/permission middleware

## Description
Turn `spatie/laravel-permission` from "installed but inert" into a working authorization
foundation. Today `HasRoles` is attached to `App\Models\User` and the five permission tables
exist, but the `roles` / `permissions` tables are empty, no middleware alias is registered, and
nothing in the app calls the package API. This story seeds the two baseline roles (**Super
Admin**, **Administrator**) and the full granular permission catalog for the nine PRD modules,
registers the package's `role` / `permission` / `role_or_permission` middleware aliases, and adds
the `Gate::before` hook that lets the Super Admin bypass every permission check. It is the
infrastructure prerequisite that Epic 1's Users and Roles & Permissions screens — and every
permission gate in Epics 2–5 — build on.

> 🔁 **Phase 4 return loop — 2026-08-09.** This story reached green in Phase 3 and then **failed
> the `appsec-auditor` security audit** (1 High, 3 Medium, 3 Low/Informational). All seven findings
> were approved for remediation, so the story is back in Phase 3 with this spec amended. The
> findings are tagged **F1–F7** inline below wherever they change the spec; `backend-qa` re-reds the
> affected tests first, then `backend-expert` implements. One of them (**F3**) is a deliberate
> *behavior* change decided by the user, not a hardening — read it in full rather than skimming.
>
> | # | Severity | Change | Status |
> |---|---|---|---|
> | F1 | High | Environment-guard the `test@example.com` fixture user in `DatabaseSeeder` | ✅ verified closed (2nd audit) — **narrowed further by N4** |
> | F2 | Medium | Flush the permission cache **after commit** as well as inside the transaction | ✅ verified closed (2nd audit) |
> | F3 | Medium | Provision (create) the Super Admin account instead of warn-and-skip | ✅ verified closed (2nd audit) — **extended by N1–N3** |
> | F4 | Medium | Document the `Gate::before` bypass-coverage gap; gate on permissions, never role names | ✅ verified closed (2nd audit) |
> | F5 | Low | Pass the `web` guard explicitly to `hasRole()` | ✅ verified closed (2nd audit) |
> | F6 | Low | Give `config('auth.super_admin.role')` a literal fallback default | ✅ verified closed (2nd audit) |
> | F7 | Low | Type-check `$user instanceof User` inside the gate closure | ✅ verified closed (2nd audit) |
>
> 🔁 **Second Phase 4 return loop — 2026-08-09 (re-audit: FAIL, narrower).** The `appsec-auditor`
> re-audit confirmed **F1–F7 are all closed**, but found **4 new items**, three of them inside the
> same F3 Super Admin bootstrap block that F3 introduced, plus one narrowing of F1's guard. All four
> were approved by the user for remediation, so the story returns to Phase 3 once more. They are
> tagged **N1–N4** inline below. **N1 is a behavior change** (a new abort branch), not just
> hardening — read it in full.
>
> | # | Severity | Change |
> |---|---|---|
> | N1 | Medium | Require `email_verified_at` before granting Super Admin to a matched account; **abort loudly** when the address is occupied by an unverified row |
> | N2 | Low | Format-validate `SUPER_ADMIN_EMAIL` with `filter_var(...)`; abort the bootstrap on a malformed value |
> | N3 | Low | Persist a `Log` entry for every grant/provision event, and `report($e)` the `sendResetLink` failure instead of swallowing it |
> | N4 | Low | Narrow F1's fixture-user guard from "not production" to an explicit `['local', 'testing']` allow-list (staging/demo are often internet-reachable) |
>
> ✅ **Resolved (F3, follow-up) — canonical lowercase, no collision guard.** The earlier open
> question about case-variant addresses is closed. Both offered options (throw on collision /
> fall back to a collation-insensitive match) were rejected in favour of **normalization**: every
> email address is lowercase and in standard email format, and `Str::lower()` is applied before any
> address is used. `SUPER_ADMIN_EMAIL` is therefore normalized on read, and a plain
> `where('email', $normalized)` is correct — see
> [Canonical lowercase normalization](#canonical-lowercase-normalization-f3-follow-up). No
> `RuntimeException` guard, no binary-collation trick, no PHP-side re-comparison.

**Confirmed decisions** (resolved during the Three Amigos debate; re-verify at Phase 2):

- **Permission naming**: `<module-slug>.<action>` dot notation, matching this repo's documented
  `<resource>.<action>` route-naming convention in
  [`docs/conventions/naming.md`](../../../docs/conventions/naming.md#route-names).
- **`users.*` and `roles.*` are separate namespaces**, because the PRD gates them separately with
  different default holders.
- **Coarse per-module granularity**: `products.*` covers categories & variants, `blog.*` covers
  categories & tags — matching the PRD's own nine-module bullet list verbatim rather than
  splitting sub-resources.
- **Administrator holds every permission except `roles.manage-administrators`** (37 of 38).
- **Super Admin holds zero explicit permission rows**; the `Gate::before` bypass is its single
  source of truth, keyed on the role **name** string.
- **Super Admin bootstrap is env-driven and *provisioning*, not merely assigning** (**F3** —
  changed in the Phase 4 return loop by explicit user decision; the previous "warn and assign to
  nobody" behavior is withdrawn). The seeder reads `SUPER_ADMIN_EMAIL` through
  `config('auth.super_admin.email')` and takes exactly one of these branches:
  1. **Unset/blank** → total no-op. No user is created, no role is assigned, nothing is emitted.
     CI and the test suite are unaffected. *(unchanged)*
  2. **Set, but not a syntactically valid address** → **abort loudly, no-op** (**N2**). Emit an
     error naming the offending value and skip the Super Admin bootstrap entirely: no user created,
     no role assigned, no mail. The rest of the seeder (roles + catalog) still runs. *(new)*
  3. **Set, and it matches an existing user whose `email_verified_at` is not null** → assign the
     `Super Admin` role to that **verified** user. *(narrowed by **N1** — verification is now part
     of the match condition, not an afterthought)*
  4. **Set, and it matches an existing user that is *unverified*** → **abort loudly, no-op**
     (**N1**). This is neither a safe match (an unverified row proves nothing about mailbox
     ownership) nor a safe create (the row already exists, so an insert would violate the unique
     index on `users.email`). Emit an error explaining that an unverified account occupies the
     address and that the operator must resolve it manually — have that user verify their email, or
     free up the address — then skip Super Admin assignment entirely. **No role is granted to
     anyone** in this branch, and the seeder does not crash. *(new)*
  5. **Set, and it matches no existing user at all** → **create** the account: a new `User` with
     that email, a cryptographically random unguessable password, and a verified email; assign it
     the `Super Admin` role; then trigger the app's existing Fortify password-reset flow so the real
     operator claims the account by choosing their own password. *(unchanged from F3)*

  Before any of the branches after the first runs, the configured address is **normalized to
  lowercase** with `Str::lower()` and then **format-validated** with `filter_var(...,
  FILTER_VALIDATE_EMAIL)` (**N2**). Email addresses in this system are canonically lowercase and in
  standard email format, so `admin@example.com` and `Admin@Example.com` are the same address by
  definition rather than two candidates to disambiguate — which is what removes the original
  impersonation concern (an attacker cannot register a case-variant "lookalike" of the operator's
  address, because it is not a distinct address). This is the PRD-sanctioned "direct database access
  **or a seeder**" path; it remains the *only* way the Super Admin role is ever assigned.

  **Why verification is load-bearing (N1).** Granting on the sole basis that *a `users` row carries
  this address* is a privilege-escalation path, because an unset `SUPER_ADMIN_EMAIL` at first deploy
  is a documented, supported state. In that window, with self-registration enabled, an attacker can
  register the address the operator intends to use later — or an existing low-privilege user can
  point their own account at it via `App\Livewire\Settings\Profile`, which nulls `email_verified_at`
  **without** requiring re-verification (see the follow-up at the end of this file). Either way they
  win Super Admin the moment an operator sets the config and reseeds. Requiring
  `whereNotNull('email_verified_at')` turns the match into proof of mailbox ownership.

- **Every grant and every provision is logged, not merely echoed to the console** (**N3**). The
  seeder's `$this->command` is `null` whenever it runs outside an Artisan context (e.g. invoked
  programmatically), so console output alone leaves no trace of a privilege grant. Both the grant
  branch and the provisioning branch write a structured `Log` entry **in addition to** their console
  message, and the `catch` around `sendResetLink()` calls `report($e)` so the delivery failure
  reaches the app's error tracking instead of being swallowed.
- **Authorization is gated on permissions, never on role names** (**F4**). The `Gate::before`
  bypass only intercepts checks that route through the Gate — `can()`, `authorize()`, `@can`, and
  the `permission:` / `role_or_permission:` middleware. It does **not** intercept bare `role:`
  middleware, `hasRole()`, or `@role`, which call `hasAnyRole()` directly. Every route, component
  and Blade gate written in this story and in Epics 2–5 must therefore be keyed on a permission
  (`can:` / `permission:`); where a role-based check is genuinely unavoidable, use
  `role_or_permission:Super Admin|<permission>` rather than bare `role:`. See
  [Bypass coverage](#bypass-coverage-f4) for the full statement of the rule.
- **This story owns the canonical permission slugs.** The strings defined by
  `RolePermissionSeeder::MODULES`, `::ACTIONS` and `::ROLE_PERMISSIONS` are the *only* permission
  names that exist in the database. Every other story that references a role or permission —
  0003–0007, 0009–0011, and everything in Epics 2–5 — must use those slugs verbatim
  (`roles.manage`, `roles.manage-administrators`, `products.delete`, …), never a prose restatement
  of the same concept. A `can()` / `hasPermissionTo()` call against an unseeded string throws
  `PermissionDoesNotExist`, so a mismatched literal is a runtime failure, not a naming preference.

**Out of scope — owned by sibling stories.** Do not implement these here:

- The Super Admin role's dashboard invariants (undeletable, uneditable, invisible in the roles
  list and user role selector) → **story 0008**. The dependency runs that way round: this story is
  self-sufficient and 0008 *later hardens* the `"Super Admin"` role it creates, adding the
  dashboard-level invariants on top of the role-name string the bypass is keyed on.
- Enforcement of `roles.manage-administrators` and its "only the Super Admin can see the grant
  control" meta-rule → **story 0009** (`0009-administrator-level-permission-grant.md`). This story
  only seeds the permission.
- The Roles & Permissions management UI, the Users screen, user `status`, and user soft-deletes →
  stories 0003–0007, 0010 and 0011. The `users` table has no `status` or `deleted_at` column yet; nothing here
  may depend on them.

## Type
backend | includes database-expert: **yes** (seeder/config review — **no migration**)

## Gherkin
```gherkin
Feature: Seeded roles, module permission catalog and authorization middleware

  # --- Seeded roles ---

  Scenario: Seeding creates exactly one Super Admin role
    Given a platform operator with no roles yet defined
    When they run the role and permission seeder
    Then exactly one role named "Super Admin" exists

  Scenario: Seeding creates the baseline Administrator role
    Given a platform operator with no roles yet defined
    When they run the role and permission seeder
    Then exactly one role named "Administrator" exists

  Scenario: Seeding creates no roles beyond the two baseline ones
    Given a platform operator with no roles yet defined
    When they run the role and permission seeder
    Then the only roles that exist are "Super Admin" and "Administrator"

  # --- Default permission sets ---

  Scenario: The Administrator role can manage roles and permissions
    Given a platform operator who has run the role and permission seeder
    When the Administrator role's granted permissions are read
    Then they include the permission to manage roles and permissions

  Scenario: The Administrator role cannot manage administrator-level roles and users
    Given a platform operator who has run the role and permission seeder
    When the Administrator role's granted permissions are read
    Then they exclude the permission to manage administrator-level roles and users

  Scenario: The Administrator role holds every other module permission
    Given a platform operator who has run the role and permission seeder
    When the Administrator role's granted permissions are read
    Then they include every permission in the catalog except the one to manage
      administrator-level roles and users

  Scenario: The Super Admin role is granted no permissions explicitly
    Given a platform operator who has run the role and permission seeder
    When the Super Admin role's granted permissions are read
    Then it holds none, because it bypasses permission checks instead of being granted them

  # --- Permission catalog coverage ---

  Scenario Outline: The catalog covers every managed module
    Given a platform operator who has run the role and permission seeder
    When the catalog entries for the "<module>" module are read
    Then it offers a view, a create, an edit and a delete permission for that module

    Examples:
      | module          |
      | users           |
      | products        |
      | sales-regions   |
      | shipping        |
      | payment-methods |
      | customers       |
      | orders          |
      | blog            |
      | store-languages |

  Scenario: The catalog carries the two role-management permissions
    Given a platform operator who has run the role and permission seeder
    When the role-management entries of the catalog are read
    Then it offers a permission to manage roles and permissions
    And it offers a distinct permission to manage administrator-level roles and users

  Scenario: The catalog holds no entries beyond the agreed modules
    Given a platform operator who has run the role and permission seeder
    When the whole permission catalog is read
    Then it contains exactly the nine modules' entries plus the two role-management permissions

  # --- Idempotency ---

  Scenario: Re-running the seeder duplicates nothing
    Given a platform operator who has already run the role and permission seeder once
    When they run the role and permission seeder again
    Then the roles, the catalog entries and their grants are unchanged in number

  Scenario: Re-running the seeder restores a permission removed from the Administrator role
    Given a platform operator who has run the seeder and then revoked one of the
      Administrator role's permissions
    When they run the role and permission seeder again
    Then the Administrator role holds its full default permission set again

  # --- Super Admin bootstrap (F3) ---

  Scenario: Bootstrapping the Super Admin from the configured address
    Given a platform operator with a super admin address configured that matches a registered
      user whose address is verified
    When they run the role and permission seeder
    Then that user holds the Super Admin role

  Scenario: Bootstrapping an existing user sends them no password-reset email
    Given a platform operator with a super admin address configured that matches a registered
      user whose address is verified
    When they run the role and permission seeder
    Then no password-reset email is sent, because the account already has an owner

  Scenario: Seeding without a configured address assigns the Super Admin role to nobody
    Given a platform operator with no super admin address configured
    When they run the role and permission seeder
    Then no user holds the Super Admin role

  Scenario: Seeding without a configured address creates no account
    Given a platform operator with no super admin address configured
    When they run the role and permission seeder
    Then no account is created for a super admin

  Scenario: A configured address matching no user provisions a new Super Admin account
    Given a platform operator with a super admin address configured that matches no registered user
    When they run the role and permission seeder
    Then an account exists for that address and holds the Super Admin role

  Scenario: A provisioned Super Admin account is created already verified
    Given a platform operator with a super admin address configured that matches no registered user
    When they run the role and permission seeder
    Then the newly created account's address is already verified, because the operator
      provisioned it through trusted server configuration

  Scenario: A provisioned Super Admin account is claimed through the password-reset flow
    Given a platform operator with a super admin address configured that matches no registered user
    When they run the role and permission seeder
    Then a password-reset email is sent to that address so the operator can choose their own password

  Scenario: A provisioned Super Admin account is never given a guessable password
    Given a platform operator with a super admin address configured that matches no registered user
    When they run the role and permission seeder
    Then the account cannot be signed into with any password the seeder disclosed,
      because the generated password is random and is never printed, logged or returned

  Scenario: Provisioning the Super Admin account informs the operator
    Given a platform operator with a super admin address configured that matches no registered user
    When they run the role and permission seeder
    Then the operator is told the account was created and a reset link was sent

  Scenario: Re-seeding after provisioning creates no second account
    Given a platform operator who has already provisioned the Super Admin account by seeding
    When they run the role and permission seeder again with the same configured address
    Then exactly one account exists for that address

  Scenario: Re-seeding after provisioning sends no further reset email
    Given a platform operator who has already provisioned the Super Admin account by seeding
    When they run the role and permission seeder again with the same configured address
    Then no further password-reset email is sent, because the address now matches an existing user

  Scenario: A configured address differing only in letter case matches the registered user
    Given a platform operator whose configured super admin address differs only in letter case
      from a verified registered user's address
    When they run the role and permission seeder
    Then that registered user holds the Super Admin role, because addresses are canonically lowercase

  Scenario: A configured address in mixed case is stored in lowercase when provisioned
    Given a platform operator whose configured super admin address is in mixed case
      and matches no registered user
    When they run the role and permission seeder
    Then the newly created account's address is stored in lowercase

  # --- Unverified occupant of the configured address (N1) ---
  # An unverified row is proof of nothing: anyone can register an address, and a signed-in
  # user can point their own account at one. It must not be treated as the operator.

  Scenario: An unverified account occupying the configured address is not granted the role
    Given a platform operator whose configured super admin address belongs to a registered user
      whose address has never been verified
    When they run the role and permission seeder
    Then that user does not hold the Super Admin role

  Scenario: An unverified occupant leaves the Super Admin role assigned to nobody
    Given a platform operator whose configured super admin address belongs to a registered user
      whose address has never been verified
    When they run the role and permission seeder
    Then no user at all holds the Super Admin role

  Scenario: An unverified occupant is reported to the operator
    Given a platform operator whose configured super admin address belongs to a registered user
      whose address has never been verified
    When they run the role and permission seeder
    Then the operator is told an unverified account occupies that address and must be resolved
      manually before the Super Admin can be bootstrapped

  Scenario: An unverified occupant does not abort the rest of the seed
    Given a platform operator whose configured super admin address belongs to a registered user
      whose address has never been verified
    When they run the role and permission seeder
    Then the roles and the whole permission catalog are still seeded, because the bootstrap is
      skipped rather than the seeder failing

  Scenario: An unverified occupant creates no second account for the same address
    Given a platform operator whose configured super admin address belongs to a registered user
      whose address has never been verified
    When they run the role and permission seeder
    Then exactly one account exists for that address

  Scenario: An address becomes usable once its owner verifies it
    Given a platform operator who was told an unverified account occupies the configured address,
      and that account's owner has since verified their address
    When they run the role and permission seeder again
    Then that user holds the Super Admin role

  # --- Malformed configured address (N2) ---

  Scenario: A malformed super admin address is refused
    Given a platform operator whose configured super admin address is not a valid email address
    When they run the role and permission seeder
    Then no user holds the Super Admin role

  Scenario: A malformed super admin address provisions no account
    Given a platform operator whose configured super admin address is not a valid email address
    When they run the role and permission seeder
    Then no account is created for it, because an unclaimable account would be left behind
      when the reset email cannot be delivered

  Scenario: A malformed super admin address is reported to the operator
    Given a platform operator whose configured super admin address is not a valid email address
    When they run the role and permission seeder
    Then the operator is told which configured value was rejected

  Scenario: A malformed super admin address does not abort the rest of the seed
    Given a platform operator whose configured super admin address is not a valid email address
    When they run the role and permission seeder
    Then the roles and the whole permission catalog are still seeded

  # --- Audit trail (N3) ---

  Scenario: Granting the Super Admin role to an existing account is recorded in the log
    Given a platform operator with a super admin address configured that matches a registered
      user whose address is verified
    When they run the role and permission seeder
    Then the grant is written to the application log with the address and the account identifier

  Scenario: Provisioning a Super Admin account is recorded in the log
    Given a platform operator with a super admin address configured that matches no registered user
    When they run the role and permission seeder
    Then the provisioning is written to the application log with the address and the account identifier

  Scenario: A grant is recorded even when the seeder runs outside a console context
    Given a platform operator running the seeder programmatically, with no console attached
    When the Super Admin role is granted
    Then the event is still recorded in the application log, because console output is unavailable

  Scenario: A failed password-reset delivery is reported to error tracking
    Given a platform operator provisioning a Super Admin account while mail delivery is failing
    When they run the role and permission seeder
    Then the delivery failure is reported to the application's error tracking rather than discarded

  # --- Seeded fixture account (F1, narrowed by N4) ---

  Scenario: Seeding a production environment creates no demonstration account
    Given a platform operator seeding a production environment
    When they run the full database seeder
    Then no demonstration account with a shared well-known password exists

  Scenario: Seeding a production environment still populates the permission catalog
    Given a platform operator seeding a production environment
    When they run the full database seeder
    Then the roles and the permission catalog are populated

  Scenario: Seeding a local environment keeps the demonstration account
    Given a developer seeding a local environment
    When they run the full database seeder
    Then the demonstration account is available for signing in

  Scenario: Seeding a staging environment creates no demonstration account
    Given a platform operator seeding a staging environment
    When they run the full database seeder
    Then no demonstration account with a shared well-known password exists, because staging
      is internet-reachable even though it is not production

  Scenario: Seeding a staging environment still populates the permission catalog
    Given a platform operator seeding a staging environment
    When they run the full database seeder
    Then the roles and the permission catalog are populated

  # --- Super Admin bypass ---

  Scenario: The Super Admin passes a permission check that was never granted to them
    Given a signed-in Super Admin
    When they are checked for the permission to delete products
    Then the check passes, because the Super Admin bypasses permission checks entirely

  Scenario: The Super Admin passes a check for an ability outside the catalog
    Given a signed-in Super Admin
    When they are checked for an ability that the permission catalog does not define
    Then the check passes

  Scenario: An administrator is refused a permission their role does not hold
    Given a signed-in Administrator
    When they are checked for the permission to manage administrator-level roles and users
    Then the check fails

  Scenario: A blog editor is refused a permission outside their role
    Given a signed-in blog editor whose role grants only the Blog permissions
    When they are checked for the permission to delete products
    Then the check fails

  # --- Middleware aliases ---

  Scenario: A permission-gated route refuses a role without that permission
    Given a signed-in blog editor whose role grants only the Blog permissions
    When they request a route gated by the permission to delete products
    Then access is refused server-side

  Scenario: A permission-gated route admits a role holding that permission
    Given a signed-in Administrator
    When they request a route gated by the permission to delete products
    Then access is granted

  Scenario: A permission-gated route admits the Super Admin without the permission
    Given a signed-in Super Admin
    When they request a route gated by the permission to delete products
    Then access is granted

  Scenario: A role-gated route refuses a user without that role
    Given a signed-in blog editor
    When they request a route gated by the Administrator role
    Then access is refused server-side

  # F4 — this pins the documented limit of the bypass. It is the specified behavior,
  # not a defect: it is exactly why routes must be gated on permissions, never role names.
  Scenario: A role-gated route refuses even the Super Admin
    Given a signed-in Super Admin
    When they request a route gated by the Administrator role alone
    Then access is refused server-side, because a bare role check never reaches the bypass

  Scenario: A role-or-permission-gated route admits the Super Admin by role name
    Given a signed-in Super Admin
    When they request a route gated by either the Super Admin role or the permission
      to manage roles and permissions
    Then access is granted

  Scenario: A role-or-permission-gated route admits a user holding only the permission
    Given a signed-in Administrator
    When they request a route gated by either the Super Admin role or the permission
      to manage roles and permissions
    Then access is granted
```

## Files to create/modify

### `database/seeders/RolePermissionSeeder.php` — **create**
Holds the catalog as public constants so later stories (the Roles & Permissions UI) reuse one
definition instead of restating it. Uses `firstOrCreate` with an explicit `guard_name` for
idempotency, `syncPermissions()` **on the `Administrator` role only** so a re-run repairs drift on
that role, and flushes the permission cache explicitly (see the `WithoutModelEvents` trap below).
Wrap the database work in a transaction.

#### Cache flushes — two of them, and the second one is outside the transaction (F2)

`app(PermissionRegistrar::class)->forgetCachedPermissions()` must be called **twice**, at two
structurally different places. Both are required; neither substitutes for the other.

```php
public function run(): void
{
    $provisionedEmail = DB::transaction(function (): ?string {
        // ... firstOrCreate the two roles, then the 38 permissions ...

        // (a) INSIDE the transaction, after the permission-creation loop and BEFORE
        // syncPermissions(), so the sync resolves the rows just created rather than a
        // stale (possibly empty) cache. Already implemented in Phase 3.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $administratorRole->syncPermissions(/* 37 names */);

        return $this->bootstrapSuperAdmin($superAdminRole);
    });

    // (b) AFTER the transaction closure returns — i.e. after COMMIT.
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    // Post-commit side effects (F3) live here too — see below.
}
```

Why (b) is not redundant with (a): flushing *before* `COMMIT` opens a window in which a concurrent
request on **another worker** can miss the cache, read the not-yet-committed (i.e. old) state, and
re-populate the shared `database` cache store with that pre-commit snapshot — which then persists
for Spatie's 24-hour TTL. The worst case is an operator re-running the seeder to *repair* a revoked
permission and the revocation staying live on another worker afterwards. Flushing again after commit
closes the window. Note this makes `run()` no longer a single `DB::transaction(...)` call: the
closure returns a value that the post-commit block consumes.

> ⚠️ **Do not "simplify" this back to one flush.** A reviewer seeing two identical-looking calls may
> read the second as copy-paste. It is load-bearing; keep the comment explaining why in the code.

> ⚠️ **`Super Admin` is created and then left alone.** It is `firstOrCreate`'d and nothing else:
> its permissions are never synced, granted, revoked, or reset — not even with an explicit
> `syncPermissions([])` to "prove" it holds zero. Its zero-permission state is a consequence of
> never being granted anything, not of an empty sync. This is not cosmetic: sibling story **0007**
> makes `Role::syncPermissions()` (and `givePermissionTo()` / `revokePermissionTo()`) **throw** for
> the Super Admin role, so an unscoped sync that works today starts throwing the moment 0007 lands.
> `syncPermissions()` in this seeder therefore has exactly one call site: the `Administrator` role.

```php
public const MODULES = [
    'users', 'products', 'sales-regions', 'shipping', 'payment-methods',
    'customers', 'orders', 'blog', 'store-languages',
];

public const ACTIONS = ['view', 'create', 'edit', 'delete'];

/** Non-CRUD permissions that sit outside the module × action grid. */
public const ROLE_PERMISSIONS = ['roles.manage', 'roles.manage-administrators'];
```

> 📌 **These constants are canonical** (see *Confirmed decisions* above). `roles.manage` and
> `roles.manage-administrators` in particular are already referenced by stories 0004, 0009 and
> 0010; those stories consume these exact literals rather than defining their own. Any story that
> needs a new permission adds it *here*, in this catalog, rather than introducing a string only its
> own code knows about.

Resulting catalog is **38** permissions: 9 modules × 4 actions = 36, plus the 2 above.
`Administrator` is granted all of them **except** `roles.manage-administrators` (37).
`Super Admin` is granted **none**.

#### Super Admin bootstrap — provision, don't warn (F3), and only for a *proven* mailbox (N1/N2/N3)

From config (never `env()` outside `config/`, so `config:cache` is safe). This **replaces** the
Phase 3 warn-and-skip implementation. `bootstrapSuperAdmin()` returns the email it newly provisioned
(or `null`), so the caller can run the mail side effect after commit:

```php
/**
 * Assign the Super Admin role to the user configured via SUPER_ADMIN_EMAIL, provisioning
 * the account when the address matches no existing user.
 *
 * @return string|null the address of a newly provisioned account, or null when nothing was created
 */
protected function bootstrapSuperAdmin(Role $superAdminRole): ?string
{
    $email = config('auth.super_admin.email');

    if (! filled($email)) {
        return null;                                   // branch 1 — total no-op
    }

    // Canonical form: every address in this system is lowercase. Normalize before the
    // lookup AND before the insert, so both see the same string.
    $email = Str::lower($email);

    // N2 — branch 2: a malformed value ('admin', '0', 'admin@') otherwise provisions an
    // unclaimable "ghost" Super Admin: the reset mail cannot be delivered, and the next
    // reseed with a corrected value creates a *second* Super Admin, orphaning the first.
    // Refuse to bootstrap at all, loudly. The rest of the seed continues.
    if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $this->command?->error("SUPER_ADMIN_EMAIL [{$email}] is not a valid email address. Skipping the Super Admin bootstrap; fix the value and re-run the seeder.");
        Log::warning('Super Admin bootstrap skipped: SUPER_ADMIN_EMAIL is not a valid email address.', [
            'email' => $email,
        ]);

        return null;
    }

    // N1 — an unverified row proves nothing about mailbox ownership, so verification is
    // part of the match condition, not a check bolted on after the fact.
    $user = User::where('email', $email)
        ->whereNotNull('email_verified_at')
        ->first();

    if ($user !== null) {
        $user->assignRole($superAdminRole);            // branch 3 — existing verified user

        // N3 — persist the grant. $this->command is null outside an Artisan context, so
        // console output alone can leave a privilege grant with no trace at all.
        Log::warning('Super Admin role granted to an existing verified account.', [
            'email' => $email,
            'user_id' => $user->id,
            'outcome' => 'granted',
        ]);
        $this->command?->info("Granted the Super Admin role to the existing verified account [{$email}].");

        return null;                                   // no account created, no mail
    }

    // N1 — branch 4: the address exists but is UNVERIFIED. Neither a safe match (see above)
    // nor a safe create (the row exists, so the insert would violate the unique index on
    // users.email). Abort this bootstrap loudly and grant the role to nobody.
    if (User::where('email', $email)->exists()) {
        $this->command?->error("An unverified account already occupies [{$email}], so the Super Admin role was NOT assigned to anyone. Resolve it manually — have that account's owner verify their email address, or free up the address — then re-run the seeder.");
        Log::warning('Super Admin bootstrap aborted: the configured address is occupied by an unverified account.', [
            'email' => $email,
            'outcome' => 'aborted_unverified_occupant',
        ]);

        return null;
    }

    // branch 5 — provision. Password is random and never surfaced anywhere; the
    // 'hashed' cast on User::$password hashes it on assignment.
    $user = User::create([
        'name' => 'Super Admin',
        'email' => $email,
        'password' => Str::password(32),
    ]);

    // email_verified_at is not in User's #[Fillable] attribute, so force it. The address
    // came from server configuration, not from user input, so it is trusted.
    $user->forceFill(['email_verified_at' => now()])->save();

    $user->assignRole($superAdminRole);

    // N3 — persist the provisioning event alongside the console message emitted after commit.
    Log::warning('Super Admin account provisioned by the seeder.', [
        'email' => $email,
        'user_id' => $user->id,
        'outcome' => 'provisioned',
    ]);

    return $email;
}
```

Then, in `run()`, **after** the transaction commits (same post-commit block as F2's second flush):

```php
if ($provisionedEmail !== null) {
    try {
        Password::broker()->sendResetLink(['email' => $provisionedEmail]);

        $this->command?->info("Provisioned Super Admin account [{$provisionedEmail}] and sent a password-reset link; the operator must claim it via 'Forgot password'.");
    } catch (\Throwable $e) {
        // N3 — the cause used to be discarded here, leaving the operator with a warning
        // and no way to find out *why* delivery failed. report() routes it to the app's
        // configured error tracking without re-throwing, so the seed still completes.
        report($e);

        $this->command?->warn("Provisioned Super Admin account [{$provisionedEmail}], but the password-reset link could not be sent. Trigger 'Forgot password' for that address manually.");
    }
}
```

`Log` is `Illuminate\Support\Facades\Log`; `report()` is the global helper — no import needed.

**Log level.** `Log::warning` is specified for all four events above (grant, provision, invalid
value, unverified-occupant abort). All four are rare, security-relevant and worth surfacing in a
default `LOG_LEVEL=debug`/`info` production channel; a Super Admin privilege grant is not routine
traffic. `backend-expert` may drop the two success paths to `Log::info` if a reviewer prefers, but
they must remain **persisted to the log**, never console-only — that is the part N3 requires.

Points that are load-bearing, not stylistic:

- **The generated password is never printed, logged, returned, or written anywhere but the hashed
  column.** The account is unusable until the operator completes the reset flow. Do not add a
  "here is the temporary password" console line as a convenience — that would put a live production
  credential into shell history and CI logs, which is the whole class of problem F1 also addresses.
- **The reset link uses the app's already-implemented Fortify flow** — `Password::broker()
  ->sendResetLink(...)`, the same broker behind the `password.request` route documented in
  [`docs/architecture/authentication.md`](../../../docs/architecture/authentication.md#registration--password-reset).
  No bespoke invite token, no new route, no new notification class.
- **The send happens after `COMMIT`, never inside the transaction.** Mail dispatched inside a
  transaction that later rolls back produces a live reset email whose token no longer exists.
- **A mail-transport failure must not fail the seed.** In production `db:seed` also populates the
  permission catalog; losing the whole catalog because SMTP was misconfigured would be a worse
  outcome than an un-emailed reset link the operator can trigger themselves.
- **Import the right `Password`.** The seeder needs `Illuminate\Support\Facades\Password` (the
  broker), *not* `Illuminate\Validation\Rules\Password` — the latter is what
  `AppServiceProvider` imports, and the two are easy to confuse. `Str` is
  `Illuminate\Support\Str`.
- **Idempotency.** On every run after the first, the address now matches an existing user *whose
  `email_verified_at` the seeder itself set*, so the verified-match branch (3) applies: no second
  account, no second reset email, and `assignRole()` on a user who already holds the role is itself
  a no-op. Re-running the seeder any number of times converges. Note this is precisely why N1's
  verification requirement does **not** break the provisioning round-trip — the account is created
  verified, so it is still a match on the next run.
- **The unverified-occupant abort is a dead end by design (N1).** The seeder deliberately offers no
  automatic way out of it: it will not verify the occupying account, will not rename or delete it,
  and will not grant the role to some other user instead. All three would be an authorization
  decision made on the seeder's own initiative about an account it cannot vouch for. The operator
  resolves it out-of-band and re-runs — at which point branch 3 or 5 applies normally.

##### Canonical lowercase normalization (F3, follow-up)

**Rule:** all email addresses in this system are lowercase and in standard email format. Always call
`Str::lower()` on an address before using it. In this seeder that means normalizing
`config('auth.super_admin.email')` the moment it is read, before the lookup and before the insert.

With both sides canonically lowercase, a plain `User::where('email', $normalized)->first()` is
correct and sufficient — no PHP-side re-comparison, no `COLLATE utf8mb4_bin` trick, no collision
guard. MySQL's case-insensitive collation stops mattering once no two addresses can differ by case
alone.

This is also what makes the provisioning branch (5) safe to insert blindly. The lookups and the
unique index on `users.email` now use **identical comparison semantics** — the same column, the same
collation — so if a row would collide with the insert, one of the two preceding lookups has already
found it: the verified one (branch 3, grant) or, since **N1**, the `exists()` one (branch 4, abort).
Branch 5 is only reachable when *no* row carries that address at all, which is exactly when the
insert cannot violate the index. The crash scenario that motivated the withdrawn guard is
structurally impossible, not merely unlikely.

> ⚠️ **N1 makes the second lookup load-bearing — do not "optimize" it away.** It is tempting to
> collapse branches 3 and 4 into a single `User::where('email', $email)->first()` plus an
> `email_verified_at` check on the result. That is in fact equivalent and acceptable; what is **not**
> acceptable is dropping the unverified case altogether and letting branch 5 run when the verified
> lookup misses. That reintroduces exactly the duplicate-insert crash this section argues is
> impossible — because with N1 the verified lookup missing no longer implies the row is absent.

> **On accents — the reasoning corrected.** It is true that lowercasing does not by itself defeat
> accent-insensitive collation: this app's connection is `utf8mb4_unicode_ci`
> (`config/database.php`), under which `josé@example.com` and `jose@example.com` compare **equal**.
> But the proposed mitigation — "`Str::lower()` is not diacritic-stripping, so `é` and `e` stay
> distinct strings" — does not hold, and it is worth being precise about why, so nobody later
> "restores" a PHP-side comparison believing it protects something. PHP-level distinctness is
> irrelevant here, because the comparison is delegated to MySQL, not performed in PHP. Under
> `utf8mb4_unicode_ci`, `where('email', 'josé@example.com')` matches a stored `jose@example.com`
> regardless of how the two strings compare in PHP. (PHP-side distinctness *did* matter in the
> withdrawn `findUserByExactEmail()` design — removing that comparison is precisely what hands the
> semantics back to the database.)
>
> The accurate position, which supports the same implementation:
> - **The case-only collision — the scenario actually in play — is fully solved** by normalization,
>   since both sides are canonically lowercase and CI-vs-CS becomes moot.
> - **The accent collision survives, and is bounded rather than dangerous.** Because the *unique
>   index* is accent-insensitive too, `jose@` and `josé@` can never coexist as two rows: the second
>   registration is rejected at signup. So there is no pair of lookalike accounts to disambiguate,
>   and branch 5 still cannot crash.
> - **Residual risk, accepted and documented — and now materially reduced by N1:** if an attacker
>   registers `jose@example.com` *before* the operator seeds `SUPER_ADMIN_EMAIL=josé@example.com`,
>   the lookup matches the attacker's row. Since **N1**, that only escalates if the attacker's row is
>   *verified* — i.e. they control that mailbox — and otherwise hits the abort branch (4), which
>   grants nothing and tells the operator. This requires a diacritic in the local part (needs SMTPUTF8;
>   vanishingly rare in practice) and pre-registration ahead of the operator. Mitigation is
>   operational, not code: `.env.example` should recommend an **ASCII-only** address for
>   `SUPER_ADMIN_EMAIL`. Do not add a code guard for this — it would reintroduce exactly the
>   PHP-side comparison this section removes.

##### Does the lowercase invariant actually hold upstream? (verified — one real gap)

The "all addresses are lowercase" rule is only load-bearing if the app's own write paths honour it.
Checked against the real code rather than assumed:

| Write path | Normalizes? | Where |
| --- | --- | --- |
| Registration (`POST /register`) | ✅ yes | Fortify's `RegisteredUserController::store()` merges `Str::lower(...)` **before** calling `CreateNewUser::create()`, because `config('fortify.lowercase_usernames')` is `true` |
| Login | ✅ yes | `AuthenticatedSessionController` inserts the `CanonicalizeUsername` pipe under the same config flag |
| Forgot-password | ✅ yes | `PasswordResetLinkController::store()` lowercases under the same flag |
| Fortify's `ProfileInformationController` | ✅ yes | same flag — but **this app does not route through it** (see below) |
| **Profile email change (`App\Livewire\Settings\Profile::updateProfileInformation()`)** | ❌ **no** | this app's own Livewire component; `$user->fill($validated)` writes the raw submitted address |

So `config/fortify.php`'s `'lowercase_usernames' => true` already confirms the invariant on every
Fortify-owned path — note that `app/Actions/Fortify/CreateNewUser.php` itself does *not* call
`Str::lower()`, and does not need to: it receives an address the controller already normalized.
`app/Concerns/ProfileValidationRules::emailRules()` does not normalize either.

**The gap:** `App\Livewire\Settings\Profile` bypasses Fortify's `ProfileInformationController`
entirely, so a signed-in user can currently save `Admin@Example.com` as their address and break the
invariant. This does not affect 0002's correctness — the seeder normalizes its own input, and the
accent analysis above shows branch 5 cannot crash regardless — but the invariant is weaker than
"always true" until that path is fixed.

> 🔐 **The same component is why N1 exists.** `Profile::updateProfileInformation()` also **nulls
> `email_verified_at`** when the address changes, and does not force re-verification before the new
> address is live on the row. So any signed-in low-privilege user can park their account on the
> address an operator intends to use for `SUPER_ADMIN_EMAIL` — and, before N1, would have been handed
> the Super Admin role on the next reseed. N1's `whereNotNull('email_verified_at')` requirement closes
> that regardless of whether the follow-up story ever lands; **do not** treat fixing `Profile` as a
> reason to relax the verified-match condition later.

**Out of scope for 0002**, which only seeds; changing registration/profile email handling is a
separate concern with its own tests and its own migration question (whether to backfill existing
rows with `LOWER(email)`). Recorded as a follow-up below. `backend-expert` must **not** modify
`app/Livewire/Settings/Profile.php` as part of this story.

### `database/seeders/DatabaseSeeder.php` — **modify**
Call the new seeder **after** the existing `User::factory()->create(...)` line. The Super Admin
bootstrap lives *inside* `RolePermissionSeeder` and resolves its target by looking up an existing
user, so the users it can match must already exist when it runs — otherwise a `SUPER_ADMIN_EMAIL`
pointing at the seeded test user would never resolve on a single `db:seed` run, and the "matching an
existing user" acceptance test below could not be satisfied.

**F1 (High) — the fixture user must be environment-guarded.** That `User::factory()->create(...)`
line produces `test@example.com` with the factory's well-known `password` and a verified email. It
was harmless while `db:seed` was a developer convenience — but *this story makes `db:seed` a
required production step*, because it is what populates the permission catalog. Unguarded, it turns
a publicly-known credential into a live production account. Wrap it in an environment check; the
`$this->call(RolePermissionSeeder::class)` line stays **unconditional** and runs in every
environment, production included.

**N4 (Low) — narrow the guard from a deny-list to an allow-list.** The Phase 3 shape was
`if (! app()->isProduction())`, which is "anywhere that isn't production" — and therefore still
creates a publicly-known credential in `staging`, `demo`, `qa`, `uat` or any other environment name
someone invents, all of which are commonly internet-reachable. Invert it into an explicit allow-list
of the only two environments that actually need the fixture:

```php
public function run(): void
{
    // N4 — allow-list, not "not production": staging/demo/qa are internet-reachable too.
    if (app()->environment(['local', 'testing'])) {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }

    $this->call(RolePermissionSeeder::class);
}
```

`app()->environment([...])` is Laravel's own multi-environment check and is exact-match on
`APP_ENV`, so a new environment name is excluded by default — which is the property N4 is buying.
Note this is a deliberate divergence from `AppServiceProvider::configureDefaults()`, which uses
`app()->isProduction()` for `DB::prohibitDestructiveCommands` / `Password::defaults`: that check is
protecting *production* specifically, whereas this one is deciding where a shared credential may
exist, and defaults must fall the other way. `testing` must stay in the list — the F1 regression
tests and any future test that assumes the fixture user run under it.

> 📌 **Runbook note — prefer the targeted invocation in production.** Production deploy scripts and
> runbooks should call `php artisan db:seed --class=RolePermissionSeeder`, not a bare
> `php artisan db:seed`. The guard above protects today's `DatabaseSeeder`; the targeted invocation
> protects against *tomorrow's* — any demo/fixture seeder a future story adds to `DatabaseSeeder::run()`
> cannot leak into production if production never runs `DatabaseSeeder` at all. `docs-keeper` should
> carry this into the deployment/authorization docs in Phase 6.

> ⚠️ **Verified trap — `WithoutModelEvents`.** `DatabaseSeeder` uses the `WithoutModelEvents`
> trait, which suppresses model events for everything reached through `$this->call(...)`. Spatie
> flushes its permission cache from `Role`/`Permission` **model events**
> (`RefreshesPermissionCache`), so seeding this way would silently leave a **stale 24-hour cache**
> on this app's `database` cache store. `RolePermissionSeeder` must therefore call
> `app(PermissionRegistrar::class)->forgetCachedPermissions()` explicitly — at **both** of the two
> placements specified in [Cache flushes](#cache-flushes--two-of-them-and-the-second-one-is-outside-the-transaction-f2)
> above (F2). (`assignRole()` / `syncPermissions()` are unaffected — they invoke the registrar
> directly rather than via events.)

### `bootstrap/app.php` — **modify**
The `withMiddleware` closure is currently empty (`//`). Register the three aliases:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
        'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
    ]);
})
```

### `app/Providers/AppServiceProvider.php` — **modify**
Add a `configureAuthorization()` method called from `boot()`, mirroring the existing
`configureDefaults()` pattern:

The Phase 3 implementation was:

```php
// superseded — do not ship this shape
Gate::before(fn (User $user): ?bool => $user->hasRole(config('auth.super_admin.role')) ? true : null);
```

It must become (F5 + F6 + F7):

```php
protected function configureAuthorization(): void
{
    Gate::before(function (mixed $user): ?bool {
        // F7 — Gate::before invokes the closure without consulting its type hint
        // (canBeCalledWithUser() does not), so any non-User authenticatable would
        // otherwise reach ->hasRole() and fatal. Decline instead of assuming.
        if (! $user instanceof User) {
            return null;
        }

        // F6 — literal fallback: a missing or renamed config key must fail *safe*
        // (no bypass), not throw a TypeError that breaks every check app-wide.
        // F5 — the 'web' guard is explicit, so a same-named role created on another
        // guard can never satisfy the bypass.
        return $user->hasRole(config('auth.super_admin.role', 'Super Admin'), 'web') ? true : null;
    });
}
```

Each of the three is small and each closes a distinct failure mode:

- **F5 — pass the guard.** `hasRole('Super Admin')` without a guard resolves against the *default*
  guard, so a `Super Admin` role created on a different guard (`api`, or any guard a future story
  adds) could satisfy the bypass. Pin it to `'web'`, which is the guard everything in this story
  seeds.
- **F6 — fallback default.** `config('auth.super_admin.role')` returning `null` (key missing, config
  cache stale after a deploy, key renamed) makes `hasRole(null, 'web')` throw a `TypeError`. Because
  this closure runs on *every* Gate check, that is not a Super-Admin-only outage — it takes down
  authorization application-wide. The literal `'Super Admin'` second argument degrades to "the
  bypass simply doesn't match" instead.
- **F7 — instance check.** The `User` type hint on the old closure looked like a guarantee. It is
  not: Laravel calls the `before` callback without first checking the hint, so a non-`User`
  authenticatable produces a fatal rather than a clean deny. Returning `null` for anything that is
  not a `User` keeps the check falling through to the normal permission path.

Returning `true` or `null` — **never `false`** — remains load-bearing: `false` would hard-deny every
other user before their real permissions were consulted. This is order-independent with respect to
Spatie's own `Gate::before`, since both only ever emit `true` or `null`.

**Documented consequence:** this also short-circuits `denies()` / `cannot()` and every *future*
Policy, which is what the PRD's "bypasses permission checks entirely" calls for. Record it so it
is a deliberate choice rather than a later surprise. For what the bypass does **not** cover, see
[Bypass coverage](#bypass-coverage-f4).

### `config/auth.php` — **modify**
Single home for both values the seeder and the gate read, keeping the role-name string in one
place and the `env()` call inside `config/`:

```php
'super_admin' => [
    'role' => 'Super Admin',
    'email' => env('SUPER_ADMIN_EMAIL'),
],
```

### `.env.example` — **modify**
Add a commented `SUPER_ADMIN_EMAIL=` entry documenting every branch (F3, extended by N1/N2):
leaving it unset is a no-op and assigns the role to nobody; setting it to an existing **verified**
user's address grants that user the role; setting it to an unknown address **provisions a new
account** with a random password and emails a password-reset link so the operator can claim it.
Document the two abort cases too, since both are operator-actionable: a value that is **not a valid
email address** is rejected outright (**N2**), and an address already occupied by an **unverified**
account is refused with an error telling the operator to have that account verify its address or free
the address up (**N1**) — in neither case is the role granted to anyone, and in neither case does the
rest of the seed fail. Say explicitly that the value is normalized to lowercase before use (so
`Admin@Example.com` and `admin@example.com` are the same address), and recommend an **ASCII-only**
address — see the accent note in the F3 section.

### `config/permission.php` — **no change**
`teams => false` and `model_morph_key => 'model_uuid'` are already correct from story 0001.

### No migration
`database-expert` verdict: all five Spatie tables already exist with the correct UUID-aware
`model_uuid` morph key. "Exactly one Super Admin role" cannot be expressed in MySQL and is an
application-layer invariant (story 0008); Spatie's existing `unique(name, guard_name)` index plus
`firstOrCreate` is the right level here. The 38-row catalog needs no additional index.

### Test files — **create**
- `tests/Feature/Seeders/RolePermissionSeederTest.php` — extended in the first Phase 4 pass with the
  F3 provisioning/idempotency/exact-match cases and the F2 post-commit flush case; extended again in
  **this second pass** with the N1 verified-match / unverified-occupant-abort cases, the N2
  invalid-format abort cases, and the N3 log-entry and `report()` assertions
- `tests/Feature/Seeders/DatabaseSeederTest.php` — added in the first Phase 4 pass for the F1
  environment guard (fixture user absent in production, catalog still seeded, fixture user present
  locally); extended in **this pass** with the N4 allow-list case (fixture user absent in `staging`)
- `tests/Feature/Authorization/SuperAdminBypassTest.php` — extended with the F5/F6/F7 gate-closure
  guards
- `tests/Feature/Authorization/PermissionMiddlewareTest.php` — extended with the F4
  bare-`role:`-refuses-the-Super-Admin case

## Tests to perform

**Seeder — happy path**
- [x] Feature: seeding creates exactly one `Super Admin` role and one `Administrator` role, and no others.
- [x] Feature: seeding creates exactly 38 permissions.
- [x] Feature (dataset, one row per module): each of the nine modules has `view`, `create`, `edit`, `delete` entries.
- [x] Feature: `roles.manage` and `roles.manage-administrators` both exist.
- [x] Feature: every seeded role and permission has `guard_name` `web`.
- [x] Feature: `Administrator` holds exactly 37 permissions.
- [x] Feature: `Super Admin` holds exactly 0 permissions.

**Seeder — edge cases**
- [x] Feature: running the seeder twice leaves role, permission and `role_has_permissions` row counts unchanged.
- [x] Feature: revoking a permission from `Administrator` and re-running the seeder restores its full set.
- [x] Feature: with `SUPER_ADMIN_EMAIL` matching an existing **verified** user, that user holds `Super Admin`, and the `model_has_roles` row is written against the **`model_uuid`** morph column (first story to exercise it since the UUID conversion).
- [x] Feature: with `SUPER_ADMIN_EMAIL` unset, no user holds `Super Admin`.
- [x] Feature: the permission cache is not stale after seeding through `DatabaseSeeder` — assert a permission check reflects the seeded state immediately (guards the `WithoutModelEvents` trap).

**Super Admin provisioning (F3 — replaces the old warn-and-skip tests)**
- [x] Feature: with `SUPER_ADMIN_EMAIL` unset, the seeder creates **no** user at all for it (row count unchanged).
- [x] Feature: with `SUPER_ADMIN_EMAIL` matching no user, a `User` with that email now exists and holds `Super Admin`.
- [x] Feature: the provisioned user's `email_verified_at` is not null.
- [x] Feature: the provisioned user's stored `password` is a hash that does **not** verify against `'password'` or against the email itself, and the seeder's console output contains no password-looking string (assert the generated secret is never disclosed).
- [x] Feature: provisioning sends a `ResetPassword` notification to the provisioned address (`Notification::fake()` + `Notification::assertSentTo(...)`).
- [x] Feature: with `SUPER_ADMIN_EMAIL` matching an **existing verified** user, **no** `ResetPassword` notification is sent (`Notification::assertNothingSent()` / `assertNotSentTo`).
- [x] Feature (idempotency): running the seeder twice with the same unmatched `SUPER_ADMIN_EMAIL` yields exactly **one** user with that email.
- [x] Feature (idempotency): the second run sends **no** further `ResetPassword` notification — assert the count is 1 across both runs, not 2.
- [x] Feature: the seeder emits an informational message (not a warning about "assigned to nobody" — that outcome no longer exists) when it provisions.
- [x] Feature: `SUPER_ADMIN_EMAIL` set as `Admin@Example.com` while user `admin@example.com` exists **does** grant that existing user `Super Admin`, and creates **no** second account — pins the normalization rule (the configured value is lowercased before lookup, so the two are the same address).
- [x] Feature: `SUPER_ADMIN_EMAIL` set as `Admin@Example.com` with **no** matching user provisions an account whose stored `email` is `admin@example.com` (lowercase), not the mixed-case configured value — pins that normalization happens before the insert, not only before the lookup.
- [x] Feature: a mail-transport failure during `sendResetLink` does not abort the seed — the roles and the 38-permission catalog are still committed (fake a throwing mailer/broker).

**Verified-mailbox requirement and unverified-occupant abort (N1)**
- [x] Feature: with `SUPER_ADMIN_EMAIL` matching an existing user whose `email_verified_at` is **null**, that user does **not** hold `Super Admin` after seeding.
- [x] Feature: same setup — **no** user at all holds `Super Admin` (proves the role was not granted to some other account as a fallback).
- [x] Feature: same setup — the seeder emits an **error** (`$this->command->error(...)`) naming the address and telling the operator to resolve it manually; assert on the console output.
- [x] Feature: same setup — the seeder **does not throw**: `RolePermissionSeeder::run()` completes, and the two roles plus all 38 permissions are still committed (the abort skips only the bootstrap). This is the case that would otherwise surface as a `QueryException` on the `users.email` unique index, so assert explicitly that no exception escapes.
- [x] Feature: same setup — exactly **one** user row exists for that address afterwards (no second account was inserted alongside the unverified one).
- [x] Feature: same setup — **no** `ResetPassword` notification is sent (the abort path sends no mail).
- [x] Feature (recovery): with the previously-unverified occupant's `email_verified_at` now set, re-running the seeder grants that user `Super Admin` — proves the abort is a retryable state, not a permanent lockout.
- [x] Feature (regression guard for the provisioning round-trip): running the seeder twice against an unmatched address still yields one account holding the role — i.e. N1's `whereNotNull` did not break F3's idempotency, because the provisioned account is created verified.

**Configured-address format validation (N2)**
- [x] Feature (dataset over malformed values — e.g. `admin`, `0`, `admin@`, `@example.com`, `a b@example.com`): no user holds `Super Admin` after seeding.
- [x] Feature (same dataset): **no** user row is created for the malformed value (the "ghost account" outcome is what N2 exists to prevent).
- [x] Feature (same dataset): the seeder emits an **error** naming the rejected value; assert on the console output.
- [x] Feature (same dataset): the seeder does not throw, and the roles and 38-permission catalog are still committed.
- [x] Feature (same dataset): **no** `ResetPassword` notification is sent.

**Audit logging and error reporting (N3)**
- [x] Feature: the **grant** branch (existing verified user) writes a persisted log entry containing the address and the granted user's id — not console output only. *(QA decision: assert via `Log::shouldReceive('warning')->once()->withArgs(...)` on the facade, or `Log::spy()` + `shouldHaveReceived`, whichever reads better alongside this repo's existing fake/spy usage in `tests/Feature/Auth/`. Do not assert on the raw log file.)*
- [x] Feature: the **provisioning** branch writes a persisted log entry containing the address and the new user's id, distinguishable from the grant entry (e.g. by its `outcome` context key).
- [x] Feature: the log entry is written even when the seeder runs **without** a console — instantiate/run the seeder so `$this->command` is `null` and assert the log entry is still recorded. This is the specific gap N3 closes; a test that always runs through `$this->seed(...)` with a command attached would not catch a regression to console-only reporting.
- [x] Feature: a throwing `sendResetLink` causes `report($e)` to be called — the exception reaches the app's error handler rather than being swallowed. *(QA decision: the natural fit is `Exceptions::fake()` + `Exceptions::assertReported(...)` (Laravel 11+/13 `Illuminate\Support\Facades\Exceptions`); a handler-level mock (`$this->mock(ExceptionHandler::class)`) is an acceptable alternative. Pick whichever matches what the suite already does — not prescribed here.)*
- [x] Feature: that same throwing-`sendResetLink` run still emits the operator-facing console warning **and** still commits the catalog (extends the existing F3 mail-failure test rather than replacing it).

**Fixture-user environment guard (F1, narrowed by N4)**
- [x] Feature: with the app faked as production (`app()->detectEnvironment(fn () => 'production')` or equivalent), running `DatabaseSeeder` creates **no** user with email `test@example.com`.
- [x] Feature: with the app faked as production, running `DatabaseSeeder` still seeds both roles and all 38 permissions (proves the guard wraps only the fixture user, not the `$this->call(...)`).
- [x] **(N4)** Feature: with the app faked as **`staging`**, running `DatabaseSeeder` creates **no** user with email `test@example.com`. This is the one case that distinguishes the allow-list from the old `! app()->isProduction()` deny-list: under the old guard the fixture **would** be created in `staging`, so this test fails if anyone reverts the change. Every other row in this block passes under both guards — this is the load-bearing test of N4.
- [x] **(N4)** Feature: with the app faked as `staging`, `DatabaseSeeder` still seeds both roles and all 38 permissions.
- [x] Feature: in the `testing` environment (the suite's default), `DatabaseSeeder` still creates `test@example.com` (no regression for the existing tests that rely on the fixture).
- [x] **(N4)** Feature: with the app faked as `local`, `DatabaseSeeder` creates `test@example.com` (no regression for local development — the other half of the allow-list).

**Cache-flush placement (F2)**
- [x] Feature: after `RolePermissionSeeder::run()` returns, a freshly resolved `PermissionRegistrar` reports no cached permission set (assert the cache key is absent / the registrar re-reads from the database), proving the post-commit flush ran and not only the in-transaction one.

**Negative cases**
- [x] Feature: `Administrator` does **not** hold `roles.manage-administrators`.
- [x] Feature: a role granted only `blog.*` fails a `products.delete` check.
- [x] Feature: a user with no role fails every catalog permission check.

**Super Admin bypass**
- [x] Feature: a Super Admin passes a `products.delete` check despite holding no permission rows.
- [x] Feature: a Super Admin passes a check for an ability absent from the catalog entirely.
- [x] Unit: the gate closure returns `null` (not `false`) for a non-Super-Admin, so normal checks still run.
- [x] Feature: a non-Super-Admin's own granted permissions still pass after the hook is installed (no regression).

**Middleware aliases**
- [x] Feature: a throwaway route gated by `permission:products.delete` returns 403 for a blog editor and 200 for an Administrator.
- [x] Feature: a throwaway route gated by `role:Administrator` returns 403 for a blog editor.
- [x] Feature: a throwaway route gated by `role_or_permission:Super Admin|roles.manage` returns 200 for an Administrator.
- [x] Feature: a throwaway route gated by `role_or_permission:Super Admin|roles.manage` returns 200 for a Super Admin (matched on the role name, since the bypass does not apply here).
- [x] Feature: a Super Admin reaches a `permission:products.delete` route without holding the permission.
- [x] **(F4)** Feature: a Super Admin is **refused (403)** by a throwaway route gated by `role:Administrator` alone. This asserts the *documented* limit of the bypass, not a bug — bare `role:` middleware calls `hasAnyRole()` without touching the Gate, so `Gate::before` never runs. Pinning it deliberately turns a latent surprise into a regression-guarded fact, and gives any future reader a test to point at when they wonder why the convention forbids bare `role:` gates.

**Gate closure guards (F5/F6/F7)**
- [x] Unit/Feature **(F7)**: the gate closure returns `null` for a non-`User` authenticatable (pass an anonymous `Illuminate\Contracts\Auth\Authenticatable` implementation) instead of throwing.
- [x] Feature **(F6)**: with `auth.super_admin.role` unset (`config()->set('auth.super_admin.role', null)`), authorization still functions — a normal permission check for an Administrator resolves without a `TypeError`, and the fallback `'Super Admin'` literal still lets a real Super Admin bypass.
- [x] Feature **(F5)**: a user holding a `Super Admin` role created on a **different guard** does **not** bypass a `web`-guard permission check.

> **QA constraint (`backend-qa`):** these tests must register only a throwaway **route**, never
> stub or re-alias the middleware themselves — otherwise they would pass even if the
> `bootstrap/app.php` change were missing, which is the single thing they exist to prove.
>
> **QA constraint:** with `RefreshDatabase`, call
> `app(PermissionRegistrar::class)->forgetCachedPermissions()` in `beforeEach`, or role/permission
> lookups leak across tests through the shared cache store.
>
> **QA constraint (F3 — no real mail):** the seeder now sends a password-reset notification, so
> every test that can reach the provisioning branch must fake the transport first —
> `Notification::fake()` (and `Mail::fake()` where a mailable is asserted). Follow the pattern
> already established in `tests/Feature/Auth/PasswordResetTest.php`, which fakes with
> `Notification::fake()` and asserts `Illuminate\Auth\Notifications\ResetPassword` via
> `Notification::assertSentTo($user, ResetPassword::class)`. Reuse that notification class and that
> assertion style rather than inventing a new one. No seeder test may attempt a real send.
>
> **QA constraint (N1 — be explicit about verification state):** every seeder test that sets
> `SUPER_ADMIN_EMAIL` to a *matching* address must now state the target's verification state
> deliberately, because it is what selects the branch. Use `User::factory()->unverified()` for the
> abort cases and the plain factory (which sets `email_verified_at`) for the grant cases — never
> rely on the factory default being "whatever it currently is". A test that leaves this implicit
> will keep passing while asserting the wrong branch.
>
> **QA constraint (N3 — assertion mechanism is QA's call):** the log-entry and `report()` assertions
> above are stated as *outcomes* on purpose. Whether they are pinned with `Log::spy()`,
> `Log::shouldReceive(...)`, `Exceptions::fake()`, or a handler mock is `backend-qa`'s decision,
> made to match what the suite already does — this spec does not prescribe it. What is **not**
> negotiable: the assertion must prove the event was *persisted through the logging/reporting
> facade*, not that a console line was printed, since console-only reporting is the exact defect N3
> closes.

## Expected outcome
After `php artisan migrate:fresh --seed`, the `roles` table holds exactly `Super Admin` and
`Administrator`, and `permissions` holds the 38-entry catalog. `Administrator` is granted 37 of
them; `Super Admin` is granted none but passes every `can()` / `hasPermissionTo()` check through
the `Gate::before` hook. If `SUPER_ADMIN_EMAIL` names a registered user **whose address is
verified**, that user is a working Super Admin (N1); if it names an address with no account at all,
the seeder **provisions** that account, marks it verified, assigns it the role and emails a
password-reset link the operator uses to claim it (F3); if it is unset, the role exists unassigned.
Two configurations now stop the bootstrap with a clear operator-facing error and grant the role to
nobody, without failing the rest of the seed: a value that is not a valid email address (N2), and an
address already occupied by an **unverified** account (N1). Every grant, provision and abort leaves a
structured entry in the application log regardless of whether a console is attached, and a failed
reset-link delivery is `report()`ed to error tracking (N3). The `test@example.com` fixture account is
created **only** in `local` and `testing` — not in production, and not in staging/demo/qa either
(F1 + N4). `role`, `permission`, and `role_or_permission` are resolvable middleware aliases that
return 403 server-side for a user lacking the requirement — so every subsequent Epic 1–5 story can
gate a route or component without further plumbing.

### Bypass coverage (F4)

The `Gate::before` hook is **not** a universal role check. It fires only for authorization that is
routed through the Gate. Know which side of this line any given check falls on before writing it:

| Check | Reaches `Gate::before`? | Why |
| --- | --- | --- |
| `$user->can('products.delete')` | ✅ yes | goes through the Gate |
| `$this->authorize('products.delete')` | ✅ yes | Gate |
| `@can('products.delete')` | ✅ yes | Gate |
| `permission:products.delete` middleware | ✅ yes | resolves via `canAny()` → Gate |
| `role_or_permission:Super Admin\|roles.manage` middleware | ✅ yes | resolves via `canAny()` → Gate |
| `role:Administrator` middleware | ❌ **no** | calls `hasAnyRole()` directly |
| `$user->hasRole('Administrator')` | ❌ **no** | direct model query |
| `@role('Administrator')` | ❌ **no** | direct model query |

Consequence: a Super Admin **is refused** by a route or Blade block gated on a bare role name, even
though they bypass every permission. That is the specified behavior (pinned by a test in the
middleware block above), not a defect to be "fixed" by teaching the bypass about roles — doing that
would mean intercepting `hasRole()` itself, which would in turn break story **0008**'s Super Admin
invariants and any legitimate "does this user literally hold role X" query the roles UI needs.

**Hard convention for this story and all of Epics 2–5:** gate routes, middleware and UI on
**permissions** (`can:` / `permission:`) — never on role names. Where a role check is genuinely
unavoidable, write `role_or_permission:Super Admin|<permission>` instead of bare `role:`, so the
Super Admin is admitted by the role branch and everyone else by the permission branch. `docs-keeper`
must carry this table and this rule into
[`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md) in Phase 6 — it is
the kind of gap that is invisible until it silently locks the Super Admin out of a screen.

## Acceptance criteria
- [x] A dedicated `RolePermissionSeeder` seeds exactly one `Super Admin` and one `Administrator`
      role, and is idempotent across repeated runs.
- [x] The permission catalog covers all nine PRD modules — Users & Roles, Products (categories &
      variants), Sales Regions & Taxes, Shipping, Payment Methods, Customers, Orders, Blog
      (categories & tags), Store Languages — under the `<module-slug>.<action>` convention.
- [x] `roles.manage` is held by default by the `Administrator` role and by no other seeded role.
- [x] `roles.manage-administrators` is seeded and held by **no** role — only the Super Admin can
      exercise it, and it does so via the bypass, not a grant.
- [x] The `Super Admin` role holds zero explicit permission rows and passes every permission check
      via a `Gate::before` hook that returns `true` or `null`, never `false`.
- [x] `role`, `permission`, and `role_or_permission` are registered in `bootstrap/app.php` and
      demonstrably enforce access **server-side** (403), not merely in the UI.
- [x] The Super Admin role is assignable only via seeder/direct DB access — nothing in this story
      exposes it to the dashboard.
- [x] `SUPER_ADMIN_EMAIL` is read through `config/auth.php` (not a direct `env()` call outside
      `config/`), and an unset value is a safe, silent no-op.
- [x] **(F3)** A `SUPER_ADMIN_EMAIL` matching no existing user **provisions** the account: a `User`
      is created with a cryptographically random password that is never printed, logged or returned,
      with `email_verified_at` set, holding the `Super Admin` role, and a Fortify password-reset link
      is emailed so the operator can claim it. The operator is informed via an *informational*
      console message — the old "assigned to nobody" warning no longer exists for this branch.
- [x] **(N1)** The role is granted to a matched existing account **only** when that account's
      `email_verified_at` is not null — the lookup itself carries `whereNotNull('email_verified_at')`,
      so an unverified row is not a match.
- [x] **(N1)** A `SUPER_ADMIN_EMAIL` occupied by an **unverified** account aborts the bootstrap
      loudly: an error explains that an unverified account holds the address and that the operator
      must resolve it manually (have the owner verify, or free the address), **no** role is granted to
      anyone, **no** second account is inserted, **no** mail is sent, and the seeder does not throw —
      the roles and the 38-permission catalog still commit.
- [x] **(N1)** The abort is recoverable: once the occupying account verifies its address, re-running
      the seeder grants it the `Super Admin` role normally.
- [x] **(N2)** `SUPER_ADMIN_EMAIL` is format-validated with `filter_var($email,
      FILTER_VALIDATE_EMAIL)` immediately after the `filled()` check and `Str::lower()`
      normalization. A malformed value skips the Super Admin bootstrap entirely with an error naming
      the rejected value — no ghost account is provisioned, no mail is attempted, and the rest of the
      seed still runs.
- [x] **(N3)** Every grant, provision and abort writes a **persisted** structured log entry (`email`,
      `user_id` where one exists, and whether it was a grant, a provision or an abort) **in addition
      to** the console message — so the event is recorded even when `$this->command` is `null`
      because the seeder ran outside an Artisan context.
- [x] **(N3)** The `catch (Throwable $e)` around `Password::broker()->sendResetLink(...)` calls
      `report($e)`, so a delivery failure reaches the app's error tracking instead of being silently
      swallowed; it still must not fail the seed.
- [x] **(F3)** The bootstrap is idempotent: re-running the seeder with the same `SUPER_ADMIN_EMAIL`
      creates no second account and sends no second reset email.
- [x] **(F3)** `SUPER_ADMIN_EMAIL` is normalized with `Str::lower()` before it is used, so both the
      lookup and any provisioned row are canonically lowercase. No collision guard, no binary
      collation, no PHP-side re-comparison.
- [x] **(F1 + N4)** `DatabaseSeeder`'s `test@example.com` fixture user is created only when
      `app()->environment(['local', 'testing'])` — an explicit allow-list, **not** the broader
      `! app()->isProduction()` deny-list, so `staging`/`demo`/`qa` and any future environment name
      are excluded by default. `$this->call(RolePermissionSeeder::class)` still runs unconditionally
      in every environment, production included.
- [x] No migration is added by this story.
- [x] **(F2)** The permission cache is explicitly flushed by the seeder despite `WithoutModelEvents`
      — **twice**: once inside the transaction before `syncPermissions()`, and once after the
      transaction commits.
- [x] **(F4)** The bypass-coverage gap is documented (which checks the `Gate::before` hook does and
      does not intercept) and pinned by a test asserting a Super Admin is refused by a bare
      `role:Administrator` route; the "gate on permissions, never role names" convention is recorded
      for Epics 2–5.
- [x] **(F5)** The `Gate::before` closure passes the `'web'` guard explicitly to `hasRole()`.
- [x] **(F6)** `config('auth.super_admin.role', 'Super Admin')` carries a literal fallback, so a
      missing config key fails safe (no bypass) instead of throwing app-wide.
- [x] **(F7)** The `Gate::before` closure returns `null` for any non-`User` authenticatable rather
      than relying on the parameter type hint.
- [x] `appsec-auditor` re-audits and confirms F1–F7 are closed (Phase 4 must be re-run, not skipped).
      ✅ **Done — second audit, 2026-08-09: F1–F7 all verified closed.**
- [x] `appsec-auditor` re-audits a **third** time and confirms N1–N4 are closed (Phase 4 must be
      re-run again after this pass, not skipped).

## Open follow-ups (product-owner — do not block Phase 3 of this story)
- [x] **The Administrator-level permission-grant story — today 0009 — uses non-canonical permission
      literals.** `ai-spec/tasks/0009-administrator-level-permission-grant.md` (numbered 0009 when
      this follow-up was written, renumbered to 0010 when story 0003 was split — see that story's
      Provenance — and renumbered **back to 0009 on 2026-08-19** so it precedes the Roles &
      Permissions management backend story that hard-depends on it) currently hardcodes
      `'manage administrator-level roles/users'` and `'manage roles & permissions'` (e.g. its
      `ADMINISTRATOR_LEVEL_PERMISSION` constant and its Gherkin), which this catalog does not seed —
      any `can()` against them would throw `PermissionDoesNotExist`. That story must be corrected to
      `roles.manage-administrators` and `roles.manage` before *it* enters Phase 3. Out of scope for
      0002; recorded here because 0002 owns the canonical names.
      ✅ **Resolved — 2026-08-10, during the 0003 split.** `0009-administrator-level-permission-grant.md`
      now defines `public const ADMINISTRATOR_LEVEL_PERMISSION = 'roles.manage-administrators';`; the
      Gherkin's quoted prose (`"manage administrator-level roles/users"`) is business-readable phrasing
      in `Given`/`Then` steps, not a code-level literal — the canonical string is what the code uses.
- [x] **The lowercase-email invariant has one unguarded write path.**
      `App\Livewire\Settings\Profile::updateProfileInformation()` bypasses Fortify's
      `ProfileInformationController` (which *would* lowercase, since
      `config('fortify.lowercase_usernames')` is `true`) and writes the submitted address verbatim
      via `$user->fill($validated)`. Every other path — registration, login, forgot-password — is
      already normalized by Fortify. A signed-in user can therefore still save a mixed-case address
      and break the "all addresses are lowercase" rule that F3's normalization assumes system-wide.
      0002 is unaffected (the seeder normalizes its own input, and the accent analysis shows branch 5
      cannot crash either way), so this does **not** block Phase 3 here — but it should become its
      own story: normalize in `ProfileValidationRules`/`Profile` (or a `User` mutator so every write
      path is covered at once), plus a decision on backfilling existing rows with `LOWER(email)`.
      **Do not fix it inside 0002.**
      ✅ **Resolved — 2026-08-10, by story 0003** (`0003-users-status-and-email-verification-lifecycle.md`):
      the email is normalized to lowercase before validation on the profile path, and `App\Models\User`
      additionally exposes a read-only lowercasing accessor on `email` as a consistency layer.
- [x] **Changing your own email address does not require re-verifying it (N1's root cause).**
      Separately from the lowercase question above, `Profile::updateProfileInformation()` nulls
      `email_verified_at` on an address change but leaves the *new* address live on the row
      immediately — so any signed-in user can move their account onto an arbitrary address they do
      not control. N1 defends 0002 against the specific escalation this enables (an unverified
      squatter on `SUPER_ADMIN_EMAIL` is refused the role), but the underlying weakness is broader
      than this story: any future feature that keys on `users.email` inherits it. Candidate
      remedies for its own story — hold the change in a pending-email column until the new address
      is verified, or require password confirmation plus immediate re-verification. **Out of scope
      for 0002; do not fix it here**, and do not treat fixing it as grounds to relax N1.
      ✅ **Resolved — 2026-08-10, by story 0003** (`0003-users-status-and-email-verification-lifecycle.md`):
      implements the predicted "pending-email column" remedy exactly — an email change (self-service or
      administrative, any role) is held as `users.pending_email` and only applied to `users.email` /
      `email_verified_at` once its own signed verification link is used.

## Definition of Done
- [x] Tests written and green
- [x] Code reviewed (code-reviewer)
- [x] No security findings (appsec-auditor)
- [x] Documentation updated (docs-keeper) — `docs/architecture/authorization.md` must lose its
      "nothing exercises roles or permissions yet" current-state warning and gain the real seeded
      roles, the naming convention, the catalog, the middleware aliases and the bypass hook, plus
      (from this Phase 4 pass) the [bypass-coverage table and the "gate on permissions, never role
      names" convention](#bypass-coverage-f4) (F4), the Super Admin **provisioning** flow and how an
      operator claims the account (F3), and the production runbook note to seed with
      `--class=RolePermissionSeeder` (F1). `docs/architecture/authentication.md` gains a
      cross-reference for the seeder's reuse of the Fortify password-reset broker.
      **From this second Phase 4 pass**, the same doc must also carry: the full bootstrap decision
      tree including the two abort branches and what an operator does about each (N1 unverified
      occupant, N2 malformed value); the rule that the Super Admin role is only ever granted to a
      **verified** address (N1); the fact that grants/provisions/aborts are written to the
      application log for audit (N3); and the corrected environment allow-list for the fixture user —
      `local` and `testing` only, explicitly **not** staging (N4) — which supersedes any
      "non-production" wording. Worth an entry in
      [`docs/errors-log.md`](../../../docs/errors-log.md) too: "an existing row with the right email is
      not proof of mailbox ownership — bootstrap privilege grants must require `email_verified_at`."
- [x] Acceptance criteria met

## Closure — Phase 7 (2026-08-10)

Closed and moved to `ai-spec/tasks/done/`. The story took **three** `appsec-auditor` rounds: the
first failed with F1–F7 (1 High, 3 Medium, 3 Low) and the second, after remediation, confirmed those
closed but raised N1–N4 — three of them inside the Super Admin bootstrap that F3 had just
introduced, plus N4's narrowing of F1's environment guard. Both finding sets were folded into the
spec above and re-implemented through the Phase 3 loop, and the **third audit passed with no further
findings**. `code-reviewer` then approved Phase 5 with four minor, non-blocking findings, all fixed
before closure:

1. **Untested role branch of `role_or_permission`.** `role_or_permission:Super Admin|roles.manage`
   was only ever exercised through its *permission* branch, so the role-name branch — the one the
   [bypass-coverage rule](#bypass-coverage-f4) tells Epics 2–5 to rely on when a role check is
   unavoidable — had no coverage at all. `backend-qa` added a test driving it with a user who holds
   the `Super Admin` **role** rather than the permission.
2. **Inconsistent structured-log context.** The two abort branches (unverified occupant,
   invalid format) omitted the `user_id` / `outcome` keys that the grant and provision branches
   carried, which would have made N3's audit trail unqueryable by outcome. `backend-expert` gave all
   four log sites the same `email` / `user_id` / `outcome` shape — this is the change that
   introduced the `->value('id')` lookup noted below.
3. **A test that could not fail.** The test named *"emits an informational message, not a warning"*
   asserted `not->toContain('assigned to nobody')` — a string no branch of the seeder emits any
   more, so it passed regardless of whether the message was actually informational. `backend-qa`
   re-pointed it at the real current message text.
4. **`.env.example` documented 3 of 5 branches.** The unset / grant / provision cases were covered
   but the two operator-actionable aborts (N1 unverified occupant, N2 malformed value) were missing,
   which is precisely where an operator needs the guidance. `backend-expert` added both.

Two divergences from the code excerpts above are intentional and safe. `bootstrapSuperAdmin()` uses a
single `->value('id')` in place of `exists()` plus a separate fetch (from finding 2), which the
[normalization section](#canonical-lowercase-normalization-f3-follow-up) explicitly allows; and
`AppServiceProvider` carries an extra `?? 'Super Admin'` alongside `config(..., 'Super Admin')`,
because Laravel's `config()` default does not substitute for a present-but-**null** key, so F6's
fail-safe needs both. Final state: **144 tests passing, 293 assertions, full suite green**, no
migration added. Phase 6 documentation is complete — `docs/architecture/authorization.md` was rewritten around
the real seeded state (catalog, grants, five-branch bootstrap decision tree, bypass-coverage table
and the "gate on permissions, never role names" convention, `--class=RolePermissionSeeder` runbook
note), with supporting updates to `docs/README.md`, `docs/architecture/authentication.md`,
`docs/conventions/naming.md`, `docs/database/schema.md`, the new `docs/security/` guides, and an
`docs/errors-log.md` entry recording that a row carrying the configured address is not proof of
mailbox ownership.

The three items under [Open follow-ups](#open-follow-ups-product-owner--do-not-block-phase-3-of-this-story)
were **deliberately left unticked at the time of this closure (2026-08-10)** — all three were out of
scope for 0002 and were verified still open then: the Administrator-level permission-grant story
(numbered 0009 at the time, 0010 after the 0003 split, and 0009 again since the 2026-08-19
renumbering) still hardcoded
non-canonical permission literals, and `App\Livewire\Settings\Profile` still neither lowercased a
submitted address nor required re-verification after an email change. None blocked this story (the
seeder normalizes its own input and N1 defends the grant path regardless). All three were later
resolved by story 0003 (`0003-users-status-and-email-verification-lifecycle.md`, itself the result of
splitting the original story 0003) and by that Administrator-level permission-grant story
(`0009-administrator-level-permission-grant.md`) — see the ticked boxes above.
