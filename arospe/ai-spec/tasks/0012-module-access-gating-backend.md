# [0012] Module/sidebar access gating — backend (server-side route denial)

## Description
Gate the two Epic-1 module routes (`users.index`, `roles.index`) with Laravel's `can:` authorization
middleware, so a user who types either URL directly is refused server-side regardless of
whether the sidebar hides the link. This is the security half of the PRD criterion whose UI half is
task 0013 — hiding a nav entry is presentation, not a control. The story also fixes the per-route
middleware wiring **pattern** that every later epic's module routes will copy.

## Type
backend (related_task_id: 0013) | includes database-expert: no

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

The two routes live in **two different files** — open question 3 is resolved, and `roles.index` is
not in `routes/web.php`. Either way this story adds the middleware only; it does not register,
rename, or move either route.

- `routes/web.php` — **modify**. Chain the authorization middleware onto `users.index`, **already
  registered by story 0004** inside the existing `['auth', 'verified']` group — and already shipping
  gated on `can:users.view` (see [`docs/api/routes.md`](../../docs/api/routes.md#usersindex--the-first-permission-gated-route)).
  This story confirms and, if open question 6 says so, widens that gate.

  ```php
  // routes/web.php — the existing ['auth', 'verified'] group, unchanged apart from the gate
  Route::middleware(['auth', 'verified'])->group(function () {
      Route::livewire('users', UsersIndex::class)
          // Ships today as the single ability `can:users.view`. The "any Users & Roles
          // permission" gate acceptance criterion 1 asks for cannot be written as a pipe
          // list -- `can:` takes exactly one ability. See open question 6.
          ->middleware(['can:users.view'])
          ->name('users.index');
  });
  ```

- `routes/roles.php` — **modify, not create.** `roles.index` lives here, in a new file mirroring
  `routes/settings.php` and `require`d from `routes/web.php`, created by whichever of 0009 / 0011
  lands first (open question 3 below). This story chains the gate onto it *there*, not in
  `routes/web.php`.

  ```php
  // routes/roles.php -- the file is 0009/0011's to create; this story owns only the middleware chain
  Route::middleware(['auth', 'verified'])->group(function () {
      Route::livewire('roles', RolesIndex::class)
          ->middleware(['can:roles.manage'])
          ->name('roles.index');
  });
  ```

  [Story 0009](0009-role-permission-management-backend.md) already writes exactly this gate
  (`->middleware('can:roles.manage')`) in its own *Files to create/modify*, having reached the
  `can:`-not-`permission:` conclusion independently. In practice this story verifies and documents
  that wiring rather than introducing it — which is why the test-ownership split in open question 4
  matters.

- **The pattern to document for later epics** (Products, Blog, Taxes, Shipping, …), and the reason
  it is this and not something else:
  - **Use Laravel's `can:`, never Spatie's `permission:`, on a `Route::livewire(...)` route.** This
    is not a preference this story invents — it is an already-documented, already-shipped project
    rule. [`docs/api/routes.md`](../../docs/api/routes.md#usersindex--the-first-permission-gated-route)
    states it as *"`can:users.view`, not `permission:users.view`" — the two express the same rule but
    are not interchangeable on a `Route::livewire(...)` route*, and `routes/web.php` carries the same
    reasoning as an inline comment above `users.index` that must **not** be "normalised" away. The
    mechanism, verified at vendor source:
    `Livewire\Mechanisms\PersistentMiddleware\PersistentMiddleware::$persistentMiddleware` (lines
    16–25) is a hardcoded allow-list that carries `Illuminate\Auth\Middleware\Authorize` — the class
    behind `can:` — but **not** `Spatie\Permission\Middleware\PermissionMiddleware`. Route middleware
    is not re-applied to `/livewire/update` round-trips for anything off that list, so a route gated
    with `permission:` protects the initial `GET` only, and every later component action runs through
    zero permission middleware, silently. Also see
    [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md).
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
    re-authorizes for itself — `App\Livewire\Users\Index` already does, and 0009 specifies
    `abort_unless(Auth::user()->can('roles.manage'), 403);` per method. Writing those per-method
    checks belongs to the owning story, not this one; this story owns the route layer. See
    [`docs/security/livewire-authorization.md`](../../docs/security/livewire-authorization.md).
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
**not** appropriate — the whole surface is a status code / redirect target, and
`docs/testing/frontend/playwright-setup.md` records that `tests/Browser/` does not exist and
`phpunit.xml` declares no `Browser` testsuite. Suggested location:
`tests/Feature/Authorization/ModuleRouteAccessTest.php` — a dedicated authorization file, since this
story owns a cross-cutting pattern rather than either module's feature area.

- [ ] Integration: a user holding one Users & Roles permission gets 200 on `users.index`.
- [ ] Integration: a user holding "manage roles & permissions" gets 200 on `roles.index`.
- [ ] Integration: a dataset of 2–3 *different* Users & Roles permissions each independently opens
      `users.index` — proves a genuine any-of check, not a hardcoded single string. Two or three is
      enough; enumerating the whole catalog is decoration. **Conditional on open question 6**: this
      case only exists if the any-of gate survives; a single-ability `can:users.view` gate makes it
      wrong to write.
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
      `security.edit`'s `password.confirm`), plus a **full** `php artisan test --compact` run. The
      shared surface here is the **Gate** (Spatie's `Gate::before` hook plus 0002's Super Admin
      bypass), which every `can:`/`@can`/policy call site in the app resolves through — an app-wide
      regression risk, not a two-route one.

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
Typing `/users` or `/roles` (or whatever URIs 0004 and 0009/0011 settle on) without the required
permission returns a generic 403 that names no permission, whether or not the sidebar ever showed the
link; a guest is sent to sign in instead; the Super Admin reaches both with no permission rows. A
revoked permission closes the module on the very next request. Later epics gate a new module by
chaining one `can:<permission>` middleware onto its route — no new mechanism to invent, and no
middleware alias to register.

## Acceptance criteria
- [ ] `users.index` is gated on *any* Users & Roles permission and `roles.index` on the single
      "manage roles & permissions" permission (`roles.manage`), enforced by route middleware and
      independently of each other. **The `users.index` half is pending open question 6** — `can:`
      takes one ability, so the any-of form needs a decision before Phase 3; the independence
      requirement stands either way.
- [ ] A signed-in user lacking the required permission is refused server-side with 403 on a direct
      URL visit, with the sidebar playing no part in the outcome.
- [ ] The refusal discloses no permission name.
- [ ] A guest is redirected to sign-in rather than shown a denial — `auth` resolves before the
      permission check.
- [ ] The `verified` requirement still applies and is not masked by the permission check.
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
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met

## Dependencies
- **Task 0002** — the seeded permission catalog (`users.*`, `roles.manage`) and the Super Admin
  `Gate::before` bypass. Closed. **No longer a hard blocker on the middleware string**: that framing
  belonged to the `permission:` alias, and `can:` needs no alias registration. What this story still
  consumes is the permission **names** — Phase 3 must take them from
  `RolePermissionSeeder::MODULES` / `ACTIONS` / `ROLE_PERMISSIONS`, never invent one.
- **Task 0004** — registers `users.index` in `routes/web.php`, already gated on `can:users.view`.
  This story only decorates it.
- **Task 0009 / 0011** — registers `roles.index` in a new `routes/roles.php` (whichever lands first
  creates the file and adds `require __DIR__.'/roles.php';` to `routes/web.php`), already gated on
  `can:roles.manage` per 0009's own file list. Same.
- **Task 0013** — the UI half of the same PRD criterion. 0013 must not be reviewed as if it enforced
  access, and this story must not be reviewed as if it hid anything. Neither is complete alone.

## Open questions
Resolve before Phase 3; none of them blocks Phase 2 INVEST review.

1. **~~Literal permission strings for `users.index`'s any-of list.~~ RESOLVED — story 0002 is closed
   and its catalog is the source of truth.** This question was written while 0002 was still
   unwritten; that is no longer the case. [Story 0002](done/0002-seed-roles-permissions-catalog.md)
   shipped the real, seeded catalog in `database/seeders/RolePermissionSeeder.php`: a
   `<module-slug>.<action>` grid (`MODULES` × `ACTIONS`) plus two non-CRUD `ROLE_PERMISSIONS`. So the
   names are no longer open to invention — the Users module's are `users.view`, `users.create`,
   `users.edit`, `users.delete`, and role management is `roles.manage` /
   `roles.manage-administrators` (naming rule: [`docs/conventions/naming.md`](../../docs/conventions/naming.md#permission-names)).
   Phase 3 must take the literals from that seeder's constants and must not introduce a name outside
   it. ⚠️ **Correction, now that the gate is `can:` and not `permission:`**: an unseeded name does
   **not** throw `PermissionDoesNotExist` — Spatie's `Gate::before` hook routes through
   `checkPermissionTo()`, which catches that exception and returns `false`, so a typo denies
   silently and looks identical to a legitimate refusal. What remains open is **which** `users.*`
   permission(s) compose this route's gate — question 2 below (whether `roles.manage` counts) and
   question 6 (how an any-of set can be expressed at all under `can:`), neither of which is a naming
   question. Note also that `users.index` already ships gated on `can:users.view` (see
   [`docs/api/routes.md`](../../docs/api/routes.md#usersindex--the-first-permission-gated-route)), so
   this story adjusts an existing gate rather than adding the first one.
2. **Does "manage roles & permissions" count toward the "any Users & Roles permission" gate?** This
   story is written assuming **not**.
   - **(recommended)** Keep the two sets fully disjoint — matches 0013's two-independent-lists
     registry design and makes the cross-gate scenarios above meaningful.
   - Treat role management as a superset that implies user-module access. This would invalidate the
     "role-management permission does not open the Users screen" scenario, so it must be settled
     explicitly with 0002, not discovered in Phase 3.
3. **~~Where `roles.index` physically lives.~~ RESOLVED by 0009 — a new `routes/roles.php`.**
   [Story 0009](0009-role-permission-management-backend.md) settled this in its own debate and lists
   it among the decisions "recorded so they are not reopened": the route is
   `Route::livewire('roles', Index::class)->name('roles.index')` in a **new `routes/roles.php`**
   mirroring `routes/settings.php`, `require`d from `routes/web.php` beside the existing
   `require __DIR__.'/settings.php';`, and created by whichever of 0009 / 0011 lands first.
   [Story 0011](0011-role-permission-management-ui.md) already assumes exactly that. This story does
   not choose the location and does not create the file — as stated in *Files to create/modify*, it
   only chains middleware onto a route someone else registers, so the pattern documented above
   applies to `routes/roles.php` for `roles.index` and to `routes/web.php` for `users.index`.
4. **Test-ownership split with 0009 for the `roles.index` denial.** 0009's test list already contains
   "a user without 'manage roles & permissions' gets a 403 on the area's route."
   - **(recommended)** 0012 owns the HTTP/route-middleware assertion for both routes; 0009 narrows
     its own to the *component-method* layer (e.g. an unauthorized `Livewire::test(...)->call(...)`),
     so the two cover the two defense-in-depth layers instead of duplicating one.
   - Keep both as-is, accepting deliberate redundancy. Functionally fine — flagged so it is a
     conscious choice rather than accidental copy-paste.
5. **Super Admin identification in tests.** 0002 owns the literal role name / flag its `Gate::before`
   checks. Use 0002's actual constant or config value in the Super Admin test rather than a guessed
   string; block finalizing that test case on 0002 landing.
6. **How is `users.index`'s "any Users & Roles permission" gate expressed, now that the middleware is
   `can:` and not `permission:`?** ⚠️ **New, and it blocks Phase 3 for `users.index` only** —
   `roles.index` is unaffected (a single ability, `can:roles.manage`, already settled by 0009).
   Laravel's `Authorize` middleware takes **exactly one** ability; everything after it in the
   middleware string is parsed as a model binding, so the `permission:a|b|c` OR form this story was
   originally written around has no `can:` equivalent. Three ways out:
   - **(recommended)** Gate on the single ability `can:users.view`, which is what already ships and
     what `docs/api/routes.md` documents. It reads as "may see the Users module", mirrors
     `roles.index`'s single-ability shape, needs no new code, and keeps the two gates independent —
     acceptance criterion 1's real requirement. It does narrow the story: the any-of Gherkin
     ("a Users & Roles permission") and the 2–3-permission dataset test would be rewritten to name
     `users.view` specifically. Note the catalog makes this coherent — an actor granted
     `users.edit` but not `users.view` is not a configuration 0002 intends.
   - Define a composite ability — `Gate::define('users.access', fn (User $u) => $u->canAny([...]))`
     in a service provider — and gate on `can:users.access`. Preserves the any-of semantics exactly,
     but adds an `app/Providers/` change this story currently declares out of scope, and introduces
     an ability name that is **not** in 0002's seeded catalog, which cuts against the
     "never invent a permission name" rule in *Anti-patterns*.
   - Keep `permission:users.view|users.create|...` for this one route. **Rejected** — it is the exact
     thing `docs/api/routes.md` forbids on a `Route::livewire(...)` route, and `App\Livewire\Users\Index`'s
     mutating methods would lose their route-layer protection on every `/livewire/update` round-trip.
     Recorded only so it is visibly a rejected option rather than an overlooked one.
