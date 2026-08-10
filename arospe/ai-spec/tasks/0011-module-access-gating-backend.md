# [0011] Module/sidebar access gating — backend (server-side route denial)

## Description
Gate the two Epic-1 module routes (`users.index`, `roles.index`) with `spatie/laravel-permission`'s
permission middleware, so a user who types either URL directly is refused server-side regardless of
whether the sidebar hides the link. This is the security half of the PRD criterion whose UI half is
task 0012 — hiding a nav entry is presentation, not a control. The story also fixes the per-route
middleware wiring **pattern** that every later epic's module routes will copy.

## Type
backend (related_task_id: 0012) | includes database-expert: no

## Gherkin
```gherkin
Feature: Server-side module access gating

  Scenario Outline: A role without a module's permission is refused direct access to it
    Given a blog editor whose role grants only Blog permissions
    When they navigate directly to the <module> URL
    Then access is denied server-side, not merely hidden in the UI

    Examples:
      | module              |
      | Users               |
      | Roles & Permissions |

  Scenario: A user administrator reaches the Users screen
    Given a user administrator whose role grants a Users & Roles permission
    When they navigate directly to the Users URL
    Then the Users screen is served to them

  Scenario: A role administrator reaches the Roles & Permissions area
    Given an administrator whose role grants the "manage roles & permissions" permission
    When they navigate directly to the Roles & Permissions URL
    Then the Roles & Permissions area is served to them

  Scenario: Holding Users & Roles permissions does not open the Roles & Permissions area
    Given an administrator whose role grants Users & Roles permissions but not
      "manage roles & permissions"
    When they navigate directly to the Roles & Permissions URL
    Then access is denied server-side

  Scenario: Holding role-management permission does not open the Users screen
    Given an administrator whose role grants "manage roles & permissions" but no
      Users & Roles permission
    When they navigate directly to the Users URL
    Then access is denied server-side

  Scenario Outline: The Super Admin reaches every gated module
    Given a signed-in Super Admin holding no granted permission of their own
    When they navigate directly to the <module> URL
    Then the module is served to them, because the Super Admin bypasses permission checks

    Examples:
      | module              |
      | Users               |
      | Roles & Permissions |

  Scenario Outline: A visitor is sent to sign in rather than refused
    Given a visitor who is not signed in
    When they navigate directly to the <module> URL
    Then they are sent to the sign-in page instead of being told access is denied

    Examples:
      | module              |
      | Users               |
      | Roles & Permissions |

  Scenario: Revoking a module permission closes the module on the next visit
    Given a user administrator who has already opened the Users screen in this session and
      whose role has since had its Users & Roles permissions revoked
    When they navigate directly to the Users URL again
    Then access is denied server-side

  Scenario: Granting a module permission opens the module on the next visit
    Given an administrator who was refused the Users screen and whose role has since been
      granted a Users & Roles permission
    When they navigate directly to the Users URL again
    Then the Users screen is served to them

  Scenario: The denial does not disclose which permission was missing
    Given a blog editor whose role grants only Blog permissions
    When they navigate directly to the Users URL
    Then the refusal names no permission, so the permission catalog is not disclosed
```

## Files to create/modify

- `routes/web.php` — **modify**. Chain the permission middleware onto the two module routes
  **already registered by their own stories** (0003 for `users.index`, 0010/0008 for `roles.index`).
  This story adds the middleware only; it does not register, rename, or move either route.

  ```php
  // shape only — the users.index permission list is owned by story 0002's catalog
  Route::middleware(['auth', 'verified'])->group(function () {
      Route::livewire('users', Users::class)
          ->middleware(['permission:<users-and-roles-permission-a>|<...>'])
          ->name('users.index');

      Route::livewire('roles', RolesPermissions::class)
          ->middleware(['permission:manage roles & permissions'])
          ->name('roles.index');
  });
  ```

- **The pattern to document for later epics** (Products, Blog, Taxes, Shipping, …), and the reason
  it is this and not something else:
  - Keep the single existing `['auth', 'verified']` group; put `permission:` **per route**, chained
    after `Route::livewire(...)`, exactly as `security.edit` already chains
    `->middleware(['password.confirm'])` in `routes/settings.php`. Group-level permission middleware
    is rejected: every module has a *different* permission expression, so a blanket group would force
    sub-grouping by permission set and hide each route's requirement away from its declaration.
  - Use the **plain alias string** `'permission:…'`, not the `Route::permission(...)` macro and not
    the FQCN. Verified in `vendor/spatie/laravel-permission/src/PermissionServiceProvider.php`
    (≈ lines 100–105): the macro is sugar that builds the identical `'permission:'.implode('|', …)`
    string, so it adds no capability and would introduce a second syntax for one thing.
  - Use `permission:`, **not** `role_or_permission:`, for both routes — neither rule involves a role
    *name*. `PermissionMiddleware::handle()` parses the pipe-delimited list and calls
    `$user->canAny($permissions)`, which is already an OR, so `permission:a|b|c` is exactly the
    "any Users & Roles permission" gate; `roles.index` needs the single-permission form.
  - Future epics follow `routes/settings.php`'s precedent — extract a domain's routes into their own
    file only once that domain accumulates enough routes to justify it, rather than inventing a new
    per-module file convention.

- `bootstrap/app.php` — **not modified by this story.** Registering the `permission` / `role` /
  `role_or_permission` aliases in `withMiddleware()` belongs to story 0002. That is a **hard blocking
  dependency**: until it lands, `'permission:…'` is not a valid middleware string, because the package
  registers only route macros.

- **No Super Admin special-casing anywhere in this story.** `PermissionMiddleware` resolves through
  `canAny()` → Laravel's `Gate`, and 0002's `Gate::before` bypass runs ahead of every Gate ability
  check — so the Super Admin passes both routes with no permission rows and no code here, mirroring
  how 0012's sidebar inherits the same bypass.

- **No exception-rendering work is in scope.** `UnauthorizedException::forPermissions()` extends
  Symfony's `HttpException` with status 403, and `config/permission.php` has
  `display_permission_in_exception => false`, so the refusal is generic and leaks no permission name.
  Laravel's stock error page renders it; a branded 403 view is a separate frontend story.

- **No test files listed here** — `backend-qa` writes them in Phase 3 (TDD, red first).

## Tests to perform
Feature tests only (`tests/Feature/`, real DB + real router + real middleware). Nothing here is
unit-testable: the behavior *is* the middleware wiring across the real route stack. Browser tests are
**not** appropriate — the whole surface is a status code / redirect target, and
`docs/testing/frontend/playwright-setup.md` records that `tests/Browser/` does not exist and
`phpunit.xml` declares no `Browser` testsuite. Suggested location:
`tests/Feature/Authorization/ModuleRouteAccessTest.php` — a dedicated authorization file, since this
story owns a cross-cutting pattern rather than either module's feature area.

- [ ] Integration: a user holding one Users & Roles permission gets 200 on `users.index`.
- [ ] Integration: a user holding "manage roles & permissions" gets 200 on `roles.index`.
- [ ] Integration: a dataset of 2–3 *different* Users & Roles permissions each independently opens
      `users.index` — proves a genuine any-of check, not a hardcoded single string. Two or three is
      enough; enumerating the whole catalog is decoration.
- [ ] Negative: a user with zero permissions gets `assertForbidden()` on each route.
- [ ] Negative: cross-gate independence — a user with a Users & Roles permission but not
      "manage roles & permissions" gets 200 on `users.index` and 403 on `roles.index`.
- [ ] Negative: cross-gate independence, reverse — a user with "manage roles & permissions" but no
      Users & Roles permission gets 200 on `roles.index` and 403 on `users.index`.
- [ ] Negative: a guest gets `assertRedirect(route('login'))`, **not** 403 — proves `auth` fires
      before the permission check.
- [ ] Edge: a Super Admin holding no permission rows gets 200 on both routes (exercises the real
      `Gate::before` bypass; do **not** fake the Gate).
- [ ] Edge: an authenticated but unverified user holding the right permission is redirected to the
      verification notice, not 403 — proves `verified` still runs and is not masked.
- [ ] Edge: permission-cache staleness (revoke) — allow one request to warm the cache, revoke via a
      real package method (`revokePermissionTo` / `syncPermissions` / role removal), assert the next
      request is 403.
- [ ] Edge: permission-cache staleness (grant) — the symmetric 403 → 200 transition.
- [ ] Edge: mutating the *role's* permission set (not the user's own row) reaches the holder on the
      next request.
- [ ] Regression (stay green): `tests/Feature/DashboardTest.php`,
      `tests/Feature/Models/UserRolesAndPermissionsTest.php`, `tests/Feature/Settings/*` (notably
      `security.edit`'s `password.confirm`), plus a **full** `php artisan test --compact` run —
      story 0002's shared `bootstrap/app.php` alias registration is an app-wide regression risk, not
      a two-route one.

**Anti-patterns to avoid:**
- Asserting on sidebar markup (`assertSee` / `assertDontSee` on nav HTML) — that is 0012's job.
  This story asserts status and redirect target only.
- `assertStatus(403)` / `assertStatus(302)` instead of `assertForbidden()` / `assertRedirect(...)`.
- Inspecting `Route::current()->middleware()` for the literal middleware string — that tests how the
  result was produced, not the behavior.
- Faking `Gate` or the permission check — the middleware and the bypass must run for real.
- Hardcoding a guessed permission name instead of referencing story 0002's seeded catalog.

## Expected outcome
Typing `/users` or `/roles` (or whatever URIs 0003 and 0010/0008 settle on) without the required
permission returns a generic 403 that names no permission, whether or not the sidebar ever showed the
link; a guest is sent to sign in instead; the Super Admin reaches both with no permission rows. A
revoked permission closes the module on the very next request. Later epics gate a new module by
chaining one `permission:` middleware onto its route — no new mechanism to invent.

## Acceptance criteria
- [ ] `users.index` is gated on *any* Users & Roles permission and `roles.index` on the single
      "manage roles & permissions" permission, enforced by route middleware and independently of each
      other.
- [ ] A signed-in user lacking the required permission is refused server-side with 403 on a direct
      URL visit, with the sidebar playing no part in the outcome.
- [ ] The refusal discloses no permission name.
- [ ] A guest is redirected to sign-in rather than shown a denial — `auth` resolves before the
      permission check.
- [ ] The `verified` requirement still applies and is not masked by the permission check.
- [ ] The Super Admin passes both routes with no permission rows and no Super Admin-specific code in
      this story.
- [ ] Per-route (not group-level) `permission:` middleware using the plain alias string is the
      documented, copyable pattern for later epics, with the rejected alternatives recorded.
- [ ] `bootstrap/app.php` is untouched by this story; the alias registration is consumed from 0002.
- [ ] Neither module route is registered, renamed, or moved by this story.
- [ ] A revoked or granted permission takes effect on the holder's next request, covered by a test
      that would fail against a stale permission cache.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met

## Dependencies
- **Task 0002** — seeded permission catalog, the `permission` / `role` / `role_or_permission`
  middleware aliases in `bootstrap/app.php`, and the Super Admin `Gate::before` bypass. **Hard
  blocker**: without the alias registration the middleware string does not resolve at all.
- **Task 0003** — registers `users.index`. This story only decorates it.
- **Task 0010 / 0008** — registers `roles.index`. Same.
- **Task 0012** — the UI half of the same PRD criterion. 0012 must not be reviewed as if it enforced
  access, and this story must not be reviewed as if it hid anything. Neither is complete alone.

## Open questions
Resolve before Phase 3; none of them blocks Phase 2 INVEST review.

1. **Literal permission strings for `users.index`'s any-of list.** The PRD names the "Users & Roles"
   module but only ever spells out "manage roles & permissions" and "manage administrator-level
   roles/users" literally, and story 0002 has no file yet.
   - **(recommended)** This story references "the same permission set 0012's `config/modules.php`
     `users` entry uses" and both stories bind the literal strings to 0002's catalog at Phase 3.
     Keeps one source of truth and prevents two stories drifting apart on invented names.
   - Fix literal strings now in this story. Rejected: it would pre-empt 0002's catalog design and
     guarantee a rename.
2. **Does "manage roles & permissions" count toward the "any Users & Roles permission" gate?** This
   story is written assuming **not**.
   - **(recommended)** Keep the two sets fully disjoint — matches 0012's two-independent-lists
     registry design and makes the cross-gate scenarios above meaningful.
   - Treat role management as a superset that implies user-module access. This would invalidate the
     "role-management permission does not open the Users screen" scenario, so it must be settled
     explicitly with 0002, not discovered in Phase 3.
3. **Where `roles.index` physically lives.** Story 0008's own open question A recommends **A1,
   `routes/web.php`**; the brief for this story mentioned a new `routes/roles.php`. The pattern
   documented above is written assuming `routes/web.php`.
   - **(recommended)** Confirm 0008's A1 (`routes/web.php`) and let this story simply follow it —
     the repo has only `web.php` + `settings.php` today, and one file per domain is not yet earned.
   - Extract `routes/roles.php`. Workable, but it is 0008's decision to make, not this story's; 0011
     adopts whatever lands and only needs the middleware chained onto the route.
4. **Test-ownership split with 0008 for the `roles.index` denial.** 0008's test list already contains
   "a user without 'manage roles & permissions' gets a 403 on the area's route."
   - **(recommended)** 0011 owns the HTTP/route-middleware assertion for both routes; 0008 narrows
     its own to the *component-method* layer (e.g. an unauthorized `Livewire::test(...)->call(...)`),
     so the two cover the two defense-in-depth layers instead of duplicating one.
   - Keep both as-is, accepting deliberate redundancy. Functionally fine — flagged so it is a
     conscious choice rather than accidental copy-paste.
5. **Super Admin identification in tests.** 0002 owns the literal role name / flag its `Gate::before`
   checks. Use 0002's actual constant or config value in the Super Admin test rather than a guessed
   string; block finalizing that test case on 0002 landing.
