# [0012] Module/sidebar access gating — backend (server-side route denial)

## Description
Gate the two Epic-1 module routes (`users.index`, `roles.index`) with Laravel's `can:` authorization
middleware, so a user who types either URL directly is refused server-side regardless of
whether the sidebar hides the link. This is the security half of the PRD criterion whose UI half is
task 0013 — hiding a nav entry is presentation, not a control. The story also fixes the per-route
middleware wiring **pattern** that every later epic's module routes will copy.

## Type
backend (related_task_id: 0013) | includes database-expert: no

**Confirmed product decisions (2026-08-21, human-confirmed before Phase 3, resolving open questions
2 and 6 below — both recommended options taken):**
1. **`users.index` gates on the single ability `can:users.view`** — already what ships today, needs
   no new code, and keeps the two gates independent. The Gherkin below and the acceptance criteria
   are written accordingly (`"users.view"`, not "a Users & Roles permission"); the composite
   `Gate::define('users.access', …)` alternative is rejected — it would add an out-of-scope
   `app/Providers/` change and a permission name outside 0002's seeded catalog.
2. **`roles.manage` and `users.view` are fully disjoint gates** — holding one never implies the
   other. This is what makes the cross-gate independence scenarios below meaningful, and matches
   0013's two-independent-lists sidebar design.

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
    Given a user administrator whose role grants the "users.view" permission
    When they navigate directly to the Users URL
    Then the Users screen is served to them

  Scenario: A role administrator reaches the Roles & Permissions area
    Given an administrator whose role grants the "manage roles & permissions" permission
    When they navigate directly to the Roles & Permissions URL
    Then the Roles & Permissions area is served to them

  Scenario: Holding the Users view permission does not open the Roles & Permissions area
    Given an administrator whose role grants "users.view" but not
      "manage roles & permissions"
    When they navigate directly to the Roles & Permissions URL
    Then access is denied server-side

  Scenario: Holding role-management permission does not open the Users screen
    Given an administrator whose role grants "manage roles & permissions" but not
      "users.view"
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
      whose role has since had "users.view" revoked
    When they navigate directly to the Users URL again
    Then access is denied server-side

  Scenario: Granting a module permission opens the module on the next visit
    Given an administrator who was refused the Users screen and whose role has since been
      granted "users.view"
    When they navigate directly to the Users URL again
    Then the Users screen is served to them

  Scenario: The denial does not disclose which permission was missing
    Given a blog editor whose role grants only Blog permissions
    When they navigate directly to the Users URL
    Then the refusal names no permission, so the permission catalog is not disclosed
```

## Files to create/modify

**Corrected 2026-08-21 (Phase 2 review, F-1) — `users.index` no longer lives in `routes/web.php`.**
Story 0040 (closed, `done/`) relocated it into its own `routes/users.php`, mirroring
`routes/settings.php` and `routes/roles.php`; `routes/web.php` today holds only `home`, `dashboard`,
and three `require` lines. The two module routes live in **two different files**, each already
gated — this story confirms/documents that wiring, verifying against the real files below rather
than inventing new ones. It does not register, rename, or move either route.

- `routes/users.php` — **verify / document (corrected 2026-08-21, re-review N-4: no edit expected
  under open question 6's recommended resolution — `can:users.view` already stands, so this story
  may produce no diff to this file at all; widen the gate only if OQ6 is decided the other way).**
  Chain (or confirm) the authorization middleware onto
  `users.index`, **already registered by story 0004** and relocated here by story 0040, inside the
  existing `['auth', 'verified']` group — and already shipping gated on `can:users.view` (see
  [`docs/api/routes.md`](../../../docs/api/routes.md#usersindex--the-first-permission-gated-route)).
  This story confirms and, if open question 6 says so, widens that gate. Real, current file content
  (verified 2026-08-21 by reading `routes/users.php`), including the inline comment
  [`docs/api/routes.md`](../../../docs/api/routes.md) states must **not** be "normalised" away:

  ```php
  // routes/users.php — the real, current file
  Route::middleware(['auth', 'verified'])->group(function () {
      // `can:users.view`, not Spatie's `permission:` — Livewire 4's
      // PersistentMiddleware allowlist does not carry `permission:`, so every
      // /livewire/update round-trip (save(), deleteUser(), ...) would run
      // unauthorized. `can:` works because Spatie registers permissions as
      // Gate abilities. See docs/architecture/authorization.md.
      Route::livewire('users', UsersIndex::class)
          ->middleware(['can:users.view'])
          ->name('users.index');
  });
  ```

- `routes/roles.php` — **verify / document, not create; no edit expected.** `roles.index` lives here (created by story 0010,
  open question 3 below), mirroring `routes/settings.php`. This story chains/confirms the gate onto
  it *there*, not in `routes/users.php` or `routes/web.php`. Real, current file content:

  ```php
  // routes/roles.php — the real, current file
  Route::middleware(['auth', 'verified'])->group(function () {
      // `can:roles.manage`, not Spatie's `permission:` — same reason as
      // `users.index` in routes/users.php: Livewire 4's PersistentMiddleware
      // allowlist carries Laravel's `Authorize` (`can:`) but not Spatie's
      // `PermissionMiddleware`, so a `permission:`-gated route would protect
      // the initial GET only, leaving every saveRole()/deleteRole()
      // /livewire/update round-trip unauthorized. See
      // docs/architecture/authorization.md.
      Route::livewire('roles', RolesIndex::class)
          ->middleware(['can:roles.manage'])
          ->name('roles.index');
  });
  ```

  [Story 0010](../done/0010-role-permission-management-backend.md) already wrote exactly this gate
  (`->middleware('can:roles.manage')`) in its own *Files to create/modify*, having reached the
  `can:`-not-`permission:` conclusion independently. This story verifies and documents that wiring
  rather than introducing it — which is why the test-ownership split in open question 4 matters.

- **The pattern to document for later epics** (Products, Blog, Taxes, Shipping, …), and the reason
  it is this and not something else:
  - **Use Laravel's `can:`, never Spatie's `permission:`, on a `Route::livewire(...)` route.** This
    is not a preference this story invents — it is an already-documented, already-shipped project
    rule. [`docs/api/routes.md`](../../../docs/api/routes.md#usersindex--the-first-permission-gated-route)
    states it as *"`can:users.view`, not `permission:users.view`" — the two express the same rule but
    are not interchangeable on a `Route::livewire(...)` route*, and `routes/users.php` carries the
    same reasoning as an inline comment above `users.index` that must **not** be "normalised" away. The
    mechanism, verified at vendor source:
    `Livewire\Mechanisms\PersistentMiddleware\PersistentMiddleware::$persistentMiddleware` (lines
    16–25) is a hardcoded allow-list that carries `Illuminate\Auth\Middleware\Authorize` — the class
    behind `can:` — but **not** `Spatie\Permission\Middleware\PermissionMiddleware`. Route middleware
    is not re-applied to `/livewire/update` round-trips for anything off that list, so a route gated
    with `permission:` protects the initial `GET` only, and every later component action runs through
    zero permission middleware, silently. Also see
    [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md).
  - **No alias registration is needed, and none is in scope.** `can` is a **framework default alias**
    (`'can' => Illuminate\Auth\Middleware\Authorize::class`, in
    `Illuminate\Foundation\Configuration\Middleware`), and Spatie registers every permission name as
    a Gate ability through `PermissionRegistrar::registerPermissions($gate)`
    (`register_permission_check_method => true` in `config/permission.php`) — so a seeded permission
    name is usable as a `can:` ability with no wiring at all.
  - **`can:` gates exactly one ability, and that is the constraint to design around.**
    `Authorize::handle($request, $next, $ability, ...$models)` treats everything after the first
    argument as a **model binding**, not a second ability, so there is no `can:a|b` OR form the way
    `permission:a|b` was. A genuine any-of gate therefore needs either a single ability meaning "may
    reach this module" or a composite `Gate::define()` — see open question 6.
  - **A typo'd ability fails closed and silently under `can:`** — the opposite of `permission:`.
    Spatie's `Gate::before` hook calls `checkPermissionTo()`, which catches `PermissionDoesNotExist`
    and returns `false` (`vendor/spatie/laravel-permission/src/Traits/HasPermissions.php`, ≈ lines
    253–260), so an unseeded name yields a plain 403 rather than an exception naming the mistake.
    Consequence for Phase 3: every gate needs a **positive** test proving the right holder gets 200 —
    a negative-only test suite passes just as happily against a misspelled ability.
  - Gate on **permissions, never role names** — neither route's rule involves a role, which is why
    `can:` over a permission ability (not a role check) is the right expression for both.
  - Keep the single existing `['auth', 'verified']` group per file; put `can:` **per route**, chained
    after `Route::livewire(...)`, exactly as `security.edit` already chains
    `->middleware(['password.confirm'])` in `routes/settings.php`. Group-level authorization
    middleware is rejected: every module needs a *different* ability, so a blanket group would force
    sub-grouping by ability and hide each route's requirement away from its declaration.
  - Use the **plain alias string** `'can:…'` inside `->middleware([...])`, not Laravel's
    `->can($ability)` route sugar (`Illuminate\Routing\Route::can()`, ≈ line 1106) and not the FQCN.
    The sugar builds the identical `Authorize` middleware string, so it adds no capability and would
    introduce a second syntax for one thing — and the plain string is what the shipped `users.index`
    already uses.
  - **Route middleware is never the only layer.** That allow-list is an internal Livewire
    implementation detail rather than a documented contract, and `mount()` runs once per page load
    while later actions hydrate from a snapshot. Every component method that mutates *or discloses*
    re-authorizes for itself — `App\Livewire\Users\Index` already does, and 0010 specifies a
    `Gate::authorize()` call against `App\Policies\RolePolicy` as the first statement of every
    component method that mutates or discloses. (An earlier draft of 0010 wrote that as
    `abort_unless(Auth::user()->can('roles.manage'), 403);`, citing a precedent in
    `app/Livewire/Settings/Security.php` that does not exist — `abort_unless` appears nowhere in this
    repository. 0010 has been corrected; do not reintroduce the form here.) Writing those per-method
    checks belongs to the owning story, not this one; this story owns the route layer. See
    [`docs/security/livewire-authorization.md`](../../../docs/security/livewire-authorization.md).
  - Future epics follow `routes/settings.php`'s precedent — extract a domain's routes into their own
    file only once that domain accumulates enough routes to justify it, rather than inventing a new
    per-module file convention. `roles.index` already crossed that line (`routes/roles.php`).

- `bootstrap/app.php` — **not modified by this story, and not a dependency of it either.** An earlier
  draft listed story 0002's `permission` / `role` / `role_or_permission` alias registration as a
  **hard blocking dependency**; with `can:` it is not one. Those three aliases *are* registered in
  `withMiddleware()` today (verified in `bootstrap/app.php`), but nothing in this story uses them —
  `can` resolves as a framework default with zero setup.

- **No Super Admin special-casing anywhere in this story.** `can:` resolves through
  `Gate::authorize()`, and 0002's `Gate::before` bypass runs ahead of every Gate ability check — so
  the Super Admin passes both routes with no permission rows and no code here, mirroring how 0013's
  sidebar inherits the same bypass. This is the same reason 0013 must use `canAny()` and never
  `hasAnyPermission()`: only the Gate path sees the bypass.

- **No exception-rendering work is in scope.** `Gate::authorize()` throws
  `Illuminate\Auth\Access\AuthorizationException`, which Laravel renders as a **403** carrying the
  generic "This action is unauthorized." message — it names no ability, so the permission catalog is
  not disclosed and the no-disclosure criterion holds with no configuration at all. (Under Spatie's
  middleware that guarantee came instead from `display_permission_in_exception => false` in
  `config/permission.php`; that setting is simply irrelevant to these two routes now.) Laravel's
  stock error page renders it; a branded 403 view is a separate frontend story.

- **No test files listed here** — `backend-qa` writes them in Phase 3 (TDD, red first).

## Tests to perform
Feature tests only (`tests/Feature/`, real DB + real router + real middleware). Nothing here is
unit-testable: the behavior *is* the middleware wiring across the real route stack. Browser tests are
**not** appropriate — not because the suite doesn't exist (**corrected 2026-08-21, Phase 2 review,
F-3**: `tests/Browser/` has been wired up and running in CI since closed story 0006b, and `phpunit.xml`
declares a real `Browser` testsuite — the story's earlier citation of
`docs/testing/frontend/playwright-setup.md` "recording it does not exist" was stale and that page now
says the opposite) but because the whole surface this story tests is a status code / redirect target
with no rendering, no Livewire round-trip, and no DOM to assert against — the case
[`docs/testing/frontend/coverage-policy.md`](../../../docs/testing/frontend/coverage-policy.md)'s
"prefer fewer high-value critical-journey tests over many redundant ones" rule argues against
spending a browser test on. (**Corrected 2026-08-21, re-review N-1** — the earlier "small-ceiling
rule" phrase named a rule that page does not actually state; `grep -rn -i ceiling docs/` returns zero
hits repo-wide, the same citation failure class as F-3 itself.) Note also `tests/Browser/` already
holds `UsersIndexTest.php` and `RolesIndexTest.php`; neither exercises gating, so this conclusion
does not conflict with them. Suggested location:
`tests/Feature/Authorization/ModuleRouteAccessTest.php` — a dedicated authorization file, since this
story owns a cross-cutting pattern rather than either module's feature area.

**Corrected 2026-08-21 (Phase 2 review, F-4/F-5) — most of the list below already ships; this story's
real remaining scope is four numbered gaps (five checklist items, since cross-gate independence is one gap covering two directions).** Sibling stories 0010 and 0011 closed with their own Feature
suites, and grepping them (`tests/Feature/Users/IndexTest.php`, `tests/Feature/Roles/IndexTest.php`)
turns up nearly every case originally planned here, already green:

| planned case | already shipped at |
| --- | --- |
| a `users.view` holder gets 200 on `users.index` | `Users/IndexTest.php:1206` |
| a `roles.manage` holder gets 200 on `roles.index` | `Roles/IndexTest.php:420` |
| a zero-permission user gets 403 on each route | `Users/IndexTest.php:1198`, `Roles/IndexTest.php:414` |
| a guest is redirected to `login` on each route | `Users/IndexTest.php:1191`, `Roles/IndexTest.php:407` |
| Super Admin gets 200 on `users.index` | `Users/IndexTest.php:1214` |
| cache staleness on revoke (component/model level) | `Users/IndexTest.php:1169`, `Roles/IndexTest.php:152` |
| cache staleness on grant (component/model level) | `Roles/IndexTest.php:182` |
| a role's permission change reaches its holders | `Roles/IndexTest.php:152` / `:182` |

Open question 4 is re-resolved accordingly: its recommended option ("0010 narrows its own tests to
the component-method layer") is no longer available — 0010 is closed and shipped **both** the
HTTP/route layer (`Roles/IndexTest.php:406–421`) and the component-method layer (`:423` onward, the
"Component-level authorization —" section) in the same file — so this story
keeps both, accepting the deliberate redundancy (open question 4's second, non-recommended option),
and adds only what neither sibling suite covers:

1. **Super Admin → 200 on `roles.index`** — only `users.index` has this case today.
2. **Cross-gate independence, both directions** — nothing today asserts a `users.view` holder is 403
   on `/roles`, or a `roles.manage` holder is 403 on `/users`.
3. **Non-disclosure** — no existing test asserts the 403 body names no permission.
4. **Cache staleness proven through the HTTP route** — the shipped tests prove it at the
   component/model level; this story's contribution is the same transition observed through a real
   `$this->get(route(...))` round-trip, since that is the layer this story actually owns.

The full list below is kept as **regression evidence** (must stay green, not be re-written) except
where a bullet is marked new-scope.

**Regression (already shipped by 0010/0011 — re-run, do not rewrite):**
- [ ] A user holding `users.view` gets 200 on `users.index` (`Users/IndexTest.php:1206`).
- [ ] A user holding "manage roles & permissions" gets 200 on `roles.index` (`Roles/IndexTest.php:420`).
- [ ] A user with zero permissions gets `assertForbidden()` on each route
      (`Users/IndexTest.php:1198`, `Roles/IndexTest.php:414`).
- [ ] A guest gets `assertRedirect(route('login'))`, **not** 403, on each route — proves `auth` fires
      before the permission check (`Users/IndexTest.php:1191`, `Roles/IndexTest.php:407`).
- [ ] A Super Admin holding no permission rows gets 200 on `users.index` (exercises the real
      `Gate::before` bypass; do **not** fake the Gate) (`Users/IndexTest.php:1214`).
- [ ] Permission-cache staleness (revoke), at the component/model level
      (`Users/IndexTest.php:1169`, `Roles/IndexTest.php:152`).
- [ ] Permission-cache staleness (grant), the symmetric 403 → 200 transition, at the component/model
      level (`Roles/IndexTest.php:182`).
- [ ] Mutating the *role's* permission set (not the user's own row) reaches the holder on the next
      request (`Roles/IndexTest.php:152` / `:182`).
- [ ] Full regression run: `tests/Feature/DashboardTest.php`,
      `tests/Feature/Models/UserRolesAndPermissionsTest.php`, `tests/Feature/Settings/*` (notably
      `security.edit`'s `password.confirm`), plus a **full** `php artisan test --compact` run. The
      shared surface here is the **Gate** (Spatie's `Gate::before` hook plus 0002's Super Admin
      bypass), which every `can:`/`@can`/policy call site in the app resolves through — an app-wide
      regression risk, not a two-route one.

**New scope (2026-08-21, Phase 2 review F-4/F-5 — the four gaps neither sibling suite covers, five checklist items in all):**
- [ ] Edge: a Super Admin holding no permission rows gets 200 on `roles.index` too — only
      `users.index` has this case today.
- [ ] Negative: cross-gate independence — a user with `users.view` but not
      "manage roles & permissions" gets 200 on `users.index` and 403 on `roles.index`.
- [ ] Negative: cross-gate independence, reverse — a user with "manage roles & permissions" but not
      `users.view` gets 200 on `roles.index` and 403 on `users.index`.
- [ ] Negative: the 403 response body names no permission — assert against the rendered response,
      not just the status code, on at least one denied route.
- [ ] Edge: permission-cache staleness (revoke and grant), proven through the **HTTP route** —
      `$this->get(route('users.index'))` / `$this->get(route('roles.index'))` — rather than through
      the component or model layer the shipped tests already cover, since the route-middleware layer
      is what this story actually owns.

**Dropped 2026-08-21 (open questions 2 and 6 resolved, human-confirmed) — the any-of dataset test.**
`users.index` stays gated on the single ability `can:users.view` (already shipping), so a dataset
proving "2–3 different Users & Roles permissions each independently open `users.index`" would be
testing a gate this story does not build. See the "Confirmed product decisions" note near the top of
this file.

**Removed 2026-08-21 (Phase 2 review, F-2) — a planned `verified`-refusal test that cannot fail.**
`App\Models\User` does not implement `Illuminate\Contracts\Auth\MustVerifyEmail` (the import sits
commented out at the top of `app/Models/User.php`), so `EnsureEmailIsVerified` refuses nobody on any
route in this app — `verified` is a structural no-op here, not a control this story can prove "still
runs". This is exactly the case
[`docs/errors-log.md`](../../../docs/errors-log.md#a-planned-test-asserted-a-refusal-by-verified-a-middleware-that-refuses-nobody-in-this-app--2026-08-20)
already names forward: *"any future story that copies an `auth` + `verified` group into a new area
file … must not plan a `verified` test either."* Dropped rather than kept as dead coverage.

**Anti-patterns to avoid:**
- Asserting on sidebar markup (`assertSee` / `assertDontSee` on nav HTML) — that is 0013's job.
  This story asserts status and redirect target only.
- `assertStatus(403)` / `assertStatus(302)` instead of `assertForbidden()` / `assertRedirect(...)`.
- Inspecting `Route::current()->middleware()` for the literal middleware string — that tests how the
  result was produced, not the behavior.
- Faking `Gate` or the permission check — the middleware and the bypass must run for real.
- Hardcoding a guessed permission name instead of referencing story 0002's seeded catalog. Under
  `can:` this is *worse* than it was under `permission:`: an unseeded or misspelled ability is
  swallowed by `checkPermissionTo()` and simply denies, so the mistake looks exactly like a correct
  refusal. A negative-only test suite cannot catch it — every gate needs its positive 200 case too.

## Expected outcome
Typing `/users` or `/roles` without the required
permission returns a generic 403 that names no permission, whether or not the sidebar ever showed the
link; a guest is sent to sign in instead; the Super Admin reaches both with no permission rows. A
revoked permission closes the module on the very next request. Later epics gate a new module by
chaining one `can:<permission>` middleware onto its route — no new mechanism to invent, and no
middleware alias to register.

## Acceptance criteria
- [ ] `users.index` is gated on `can:users.view` and `roles.index` on the single "manage roles &
      permissions" permission (`roles.manage`), enforced by route middleware and independently of
      each other. **Resolved 2026-08-21 (open questions 2 and 6, human-confirmed)** — both gates are
      single-ability and fully disjoint; see "Confirmed product decisions" near the top of this file.
- [ ] A signed-in user lacking the required permission is refused server-side with 403 on a direct
      URL visit, with the sidebar playing no part in the outcome.
- [ ] The refusal discloses no permission name.
- [ ] A guest is redirected to sign-in rather than shown a denial — `auth` resolves before the
      permission check.
- [ ] The Super Admin passes both routes with no permission rows and no Super Admin-specific code in
      this story.
- [ ] Per-route (not group-level) `can:` middleware written as the plain alias string is the
      documented, copyable pattern for later epics, with the rejected alternatives recorded — Spatie's
      `permission:` (off Livewire's `PersistentMiddleware` allow-list, so it does not survive
      `/livewire/update`), a group-level gate, and Laravel's `->can()` route sugar.
- [ ] `bootstrap/app.php` is untouched by this story, and needs no change: `can` is a framework
      default alias, so no alias registration is consumed from 0002 or anywhere else.
- [ ] Neither module route is registered, renamed, or moved by this story.
- [ ] A revoked or granted permission takes effect on the holder's next request, covered by a test
      that would fail against a stale permission cache.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer) — **note (re-review N-4)**: under open question 6's recommended
      resolution this story produces no production-code diff (both routes already ship correctly
      gated), so this review is of the new tests and this file's own corrections, not of a route
      change
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met

## Dependencies
- **Task 0002** — the seeded permission catalog (`users.*`, `roles.manage`) and the Super Admin
  `Gate::before` bypass. Closed. **No longer a hard blocker on the middleware string**: that framing
  belonged to the `permission:` alias, and `can:` needs no alias registration. What this story still
  consumes is the permission **names** — Phase 3 must take them from
  `RolePermissionSeeder::MODULES` / `ACTIONS` / `ROLE_PERMISSIONS`, never invent one.
- **Task 0004** — registers `users.index`, already gated on `can:users.view`. **Corrected 2026-08-21
  (F-1)**: originally in `routes/web.php`; closed story 0040 relocated it to `routes/users.php`. This
  story only decorates/confirms it.
- **Task 0010** — created `routes/roles.php` and added `require __DIR__.'/roles.php';` to
  `routes/web.php`, already gated on `can:roles.manage` per 0010's own file list. Same.
- **Task 0040** — closed. Relocated `users.index` out of `routes/web.php` into its own
  `routes/users.php`, mirroring `routes/settings.php` and `routes/roles.php`; a pure relocation with
  no change to the route's URI, name, or gate. Added 2026-08-21 (re-review N-5) so the file this
  story quotes and cites throughout has a traceable dependency entry.
- **Task 0013** — the UI half of the same PRD criterion. 0013 must not be reviewed as if it enforced
  access, and this story must not be reviewed as if it hid anything. Neither is complete alone.

## Open questions
Resolve before Phase 3; none of them blocks Phase 2 INVEST review.

1. **~~Literal permission strings for `users.index`'s any-of list.~~ RESOLVED — story 0002 is closed
   and its catalog is the source of truth.** This question was written while 0002 was still
   unwritten; that is no longer the case. [Story 0002](../done/0002-seed-roles-permissions-catalog.md)
   shipped the real, seeded catalog in `database/seeders/RolePermissionSeeder.php`: a
   `<module-slug>.<action>` grid (`MODULES` × `ACTIONS`) plus two non-CRUD `ROLE_PERMISSIONS`. So the
   names are no longer open to invention — the Users module's are `users.view`, `users.create`,
   `users.edit`, `users.delete`, and role management is `roles.manage` /
   `roles.manage-administrators` (naming rule: [`docs/conventions/naming.md`](../../../docs/conventions/naming.md#permission-names)).
   Phase 3 must take the literals from that seeder's constants and must not introduce a name outside
   it. ⚠️ **Correction, now that the gate is `can:` and not `permission:`**: an unseeded name does
   **not** throw `PermissionDoesNotExist` — Spatie's `Gate::before` hook routes through
   `checkPermissionTo()`, which catches that exception and returns `false`, so a typo denies
   silently and looks identical to a legitimate refusal. What remains open is **which** `users.*`
   permission(s) compose this route's gate — question 2 below (whether `roles.manage` counts) and
   question 6 (how an any-of set can be expressed at all under `can:`), neither of which is a naming
   question. Note also that `users.index` already ships gated on `can:users.view` (see
   [`docs/api/routes.md`](../../../docs/api/routes.md#usersindex--the-first-permission-gated-route)), so
   this story adjusts an existing gate rather than adding the first one.
2. **~~Does "manage roles & permissions" count toward the Users gate?~~ RESOLVED 2026-08-21,
   human-confirmed.** Recommended option taken: **the two sets are fully disjoint** — matches 0013's
   two-independent-lists registry design and makes the cross-gate scenarios above meaningful. Gherkin
   and acceptance criteria are written accordingly.
3. **~~Where `roles.index` physically lives.~~ RESOLVED by 0010 — a new `routes/roles.php`.**
   [Story 0010](../done/0010-role-permission-management-backend.md) settled this in its own debate and lists
   it among the decisions "recorded so they are not reopened": the route is
   `Route::livewire('roles', Index::class)->name('roles.index')` in a **new `routes/roles.php`**
   mirroring `routes/settings.php`, `require`d from `routes/web.php` beside the existing
   `require __DIR__.'/settings.php';`, and created by story 0010.
   [Story 0011](../done/0011-role-permission-management-ui.md) already assumes exactly that. This story
   does not choose the location and does not create the file — as stated in *Files to create/modify*,
   it only chains middleware onto a route someone else registers, so the pattern documented above
   applies to `routes/roles.php` for `roles.index` and to `routes/users.php` for `users.index`.
   **Corrected 2026-08-21 (F-1):** `users.index` moved out of `routes/web.php` into its own
   `routes/users.php` by closed story 0040; both statements above are settled fact, not future tense.
4. **~~Test-ownership split with 0010 for the `roles.index` denial.~~ RE-RESOLVED 2026-08-21 (Phase 2
   review, F-4) — the recommended option is no longer available.** 0010 is closed and shipped **both**
   layers already: `tests/Feature/Roles/IndexTest.php:406–421` holds the HTTP/route-middleware
   assertions and `:423` onward holds the component-method assertions, in the same file, side by
   side. Nobody reopens a
   closed, done story to narrow its tests for a sibling story's convenience. Resolution: **keep both,
   accepting the deliberate redundancy** (the original second, non-recommended option) — this story's
   own HTTP-level tests in `tests/Feature/Authorization/ModuleRouteAccessTest.php` cover `roles.index`
   too, overlapping 0010's route-layer cases on purpose, because this story's job is the *pattern*
   (documented once, provable independently of any single module), not a claim that 0010 under-tested
   itself. See the re-scoped [Tests to perform](#tests-to-perform) list above, which lists 0010/0011's
   shipped cases as regression evidence rather than as gaps to fill.
5. **Super Admin identification in tests.** 0002 owns the literal role name / flag its `Gate::before`
   checks. Use 0002's actual constant or config value in the Super Admin test rather than a guessed
   string. **Corrected 2026-08-21 (cosmetic, Phase 2 review):** 0002 is closed; the substance stands,
   the "block on 0002 landing" framing does not.
6. **~~How is `users.index`'s any-of gate expressed under `can:`?~~ RESOLVED 2026-08-21,
   human-confirmed.** Recommended option taken: **`can:users.view`**, the single ability already
   shipping and already documented in `docs/api/routes.md`. It reads as "may see the Users module",
   mirrors `roles.index`'s single-ability shape, needs no new code, and keeps the two gates
   independent — acceptance criterion 1's real requirement. Consequence: this story narrows to
   confirming/documenting an existing gate rather than building an any-of one; the Gherkin above and
   the acceptance criteria below name `users.view` specifically, and the 2–3-permission dataset test
   is dropped (see [Tests to perform](#tests-to-perform)'s "Conditional on open question 6" list,
   removed accordingly). The two rejected alternatives, kept for the record:
   - A composite ability — `Gate::define('users.access', fn (User $u) => $u->canAny([...]))` in a
     service provider. Preserves any-of semantics exactly, but adds an out-of-scope `app/Providers/`
     change and an ability name **not** in 0002's seeded catalog, against the "never invent a
     permission name" rule in *Anti-patterns*.
   - `permission:users.view|users.create|...` for this one route. The exact thing
     `docs/api/routes.md` forbids on a `Route::livewire(...)` route — `App\Livewire\Users\Index`'s
     mutating methods would lose their route-layer protection on every `/livewire/update` round-trip.

## Phase 3 implementation record

**2026-08-21 — Phase 3, step 1 (`backend-qa`).** Wrote
[`tests/Feature/Authorization/ModuleRouteAccessTest.php`](../../tests/Feature/Authorization/ModuleRouteAccessTest.php),
covering exactly the five "New scope" checklist items above and nothing from the "Regression" list
(re-run, not duplicated): a Super Admin reaching `roles.index` with no permission rows; cross-gate
independence in both directions (`users.view` → 200 on `users.index` / 403 on `roles.index`, and the
mirror); the two 403 refusals asserted to name no permission in the rendered body (with
`config(['app.debug' => false])` set explicitly per test, so a developer's ambient `APP_DEBUG=true`
can't leak the middleware string through Laravel's debug error page — the same "pin the config
explicitly, don't trust the ambient environment" lesson as the `SUPER_ADMIN_EMAIL` errors-log entry);
and cache staleness (both revoke and grant) proven through a real `$this->get(route(...))` round-trip
with no `forgetCachedPermissions()` call between act and assert. Actors are built through fresh
custom roles via a `moduleAccessUserWith()` helper, deliberately never the seeded `Administrator`
role (which holds nearly the whole catalog and would silently defeat a cross-gate assertion), and
permission names are taken from the real seeded catalog (`users.view`, `roles.manage`, `blog.*`) —
never invented.

**Result: all 9 tests passed on the first run, with zero production-code changes.** This is the
outcome the task file's own "Files to create/modify" section anticipated (`routes/users.php` and
`routes/roles.php` labeled "verify / document" — see F-1/N-4's corrections above) rather than a TDD
failure: both routes already shipped correctly and independently gated (`can:users.view`,
`can:roles.manage`) by stories 0004/0040 and 0010. Phase 3 step 2 (implement minimal code) had
nothing to implement; step 3 (re-run, confirm green) is satisfied by the same run. Regression
confirmed by re-running the cited sibling suites unmodified —
`tests/Feature/Users/IndexTest.php` (65 passed) and `tests/Feature/Roles/IndexTest.php` (39 passed) —
plus the full unscoped suite (`vendor/bin/pint --format agent` clean, Larastan level 7 clean,
`php artisan test --compact` **618/618**, up from 609 before this story's 9 new tests).
