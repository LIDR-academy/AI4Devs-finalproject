# [0013] Module/sidebar access gating — UI (hide inaccessible modules)

## Description
Restructure the dashboard sidebar into permission-gated, grouped navigation: each nav entry
renders only when the signed-in user's role grants that entry's permission, and a group whose
every entry is hidden renders no heading at all. Epic 1 delivers the generic, registry-driven
gating **mechanism** plus the two entries that can be meaningfully gated today (Users, Roles &
Permissions); later epics plug their modules into the same registry. Server-side denial of direct
URL access is **not** in this story — see related task 0012.

## Type
frontend (related_task_id: 0012) | includes database-expert: no

## Gherkin
```gherkin
Feature: Sidebar module visibility

  Scenario Outline: A sidebar entry appears for a role holding its required permission
    Given a signed-in administrator whose role grants <permission>
    When they view the dashboard
    Then the sidebar shows the <entry> entry

    Examples:
      | permission                                  | entry               |
      | a Users & Roles permission                  | Users               |
      | the "manage roles & permissions" permission | Roles & Permissions |

  Scenario Outline: A sidebar entry is absent when its own permission was not granted
    Given a signed-in administrator whose role grants only <granted_permission>
    When they view the dashboard
    Then the sidebar does not show the <hidden_entry> entry

    Examples:
      | granted_permission                          | hidden_entry        |
      | a Users & Roles permission                  | Roles & Permissions |
      | the "manage roles & permissions" permission | Users               |

  Scenario: A role with no module permissions sees neither gated entry
    Given a signed-in administrator whose role grants no module permissions
    When they view the dashboard
    Then the sidebar shows neither the Users entry nor the Roles & Permissions entry

  Scenario: The Super Admin sees every registered module entry
    Given a signed-in Super Admin holding no permission rows of their own
    When they view the dashboard
    Then the sidebar shows every registered module entry, because the Super Admin bypasses
      permission checks

  Scenario: The home entry stays available to a role with no module permissions
    Given a signed-in administrator whose role grants no module permissions
    When they view the dashboard
    Then the sidebar still shows the Home entry, because Home is not a permission-gated module

  Scenario: Module gating does not affect the personal account menu
    Given a signed-in administrator whose role grants no module permissions
    When they view the dashboard
    Then their own account settings remain reachable from the user menu, which module
      permissions never gate

  Scenario: A revoked module permission removes its sidebar entry on the next page load
    Given a signed-in administrator whose role has just had its Users & Roles permission revoked
    When they load the dashboard again
    Then the sidebar no longer shows the Users entry
```

> **Deliberately not written yet: the "empty group heading" scenario.** With Epic 1's registry
> holding two ungrouped entries (see open question 1), there is no real group to exercise it
> against, so writing that scenario now would be a ghost scenario (gherkin-guidelines rule 6).
> The behavior is still an acceptance criterion below and still gets a mechanism-level test; the
> scenario gets written once the grouping question is answered. `frontend-qa` raised this and
> declined to write a scenario they could not honestly translate — recorded here as the reason.

## Files to create/modify

- `config/modules.php` — **new**. Declarative registry, one entry per sidebar item: `group`
  (nullable string), `label`, `icon`, `route` (a route **name**, not a URI), `permissions` (array
  of permission names, OR'd). **No closures** — this file must survive `config:cache`.

  ```php
  // config/modules.php — Epic 1 holds exactly these two entries
  'users' => ['group' => null, 'label' => 'Users', 'icon' => 'users',
              'route' => 'users.index',  'permissions' => [/* Users & Roles permission set */]],
  'roles' => ['group' => null, 'label' => 'Roles & Permissions', 'icon' => 'shield-check',
              'route' => 'roles.index',  'permissions' => ['roles.manage']],
  ```

  **Scope boundary:** this file is **not** the permission catalog. The catalog — every permission
  across all epics, most with no screen yet — is owned by story 0002's seeder. `config/modules.php`
  lists only entries that have a real route to link to *today*; an epic appends a line when its
  screen ships, not when its permissions are seeded.

  **The two entries are gated differently, and this is load-bearing.** `users` is gated on the
  Users & Roles permission set; `roles` on exactly the single distinct `roles.manage`
  permission. Required by the PRD's "Managing roles at all is a gated permission" paragraph and
  its `"Blog Editor" cannot manage roles at all` scenario. A coarse per-module blanket check would
  wrongly show the Roles & Permissions entry to a plain user-manager — reject any Phase 3
  simplification that collapses the two gates into one.

- `resources/views/components/sidebar-nav.blade.php` — **new anonymous** Blade component (no
  companion PHP class). Filters `config('modules')`, groups the survivors, renders
  `<flux:sidebar.group>` / `<flux:sidebar.item>`. Matches the existing anonymous-component
  precedent in this very layout (`x-app-logo`, `x-desktop-user-menu`,
  `resources/views/components/settings/layout.blade.php`).

  **Filter first, group second** — `collect(config('modules'))->filter(...)->groupBy('group')`
  structurally cannot produce a group key with zero members, because `groupBy` only creates a
  bucket for items that survived the filter. This eliminates the bug class where a template opens
  a `<flux:sidebar.group heading="...">` and only then discovers the loop body is empty.

  **Use `canAny()`, never `hasAnyPermission()`.** Both amigos verified this independently against
  `vendor/spatie/laravel-permission/src/PermissionRegistrar.php::registerPermissions()`, which
  registers a `Gate::before` hook (enabled by `register_permission_check_method => true` in
  `config/permission.php`). Consequences:
  - Every Spatie permission name is already a valid Gate ability — no `Gate::define()` per
    permission.
  - `canAny()` / `@can` / `@canany` / `Gate::allows()` run the whole `before`-callback chain, so
    they inherit story 0002's Super Admin bypass **for free**.
  - `hasAnyPermission()` / `hasPermissionTo()` / `hasRole()` are trait methods that query the
    model's own relations and **never touch the Gate at all**. Since the PRD says the Super Admin
    holds *zero* permission rows and "bypasses permission checks entirely", a sidebar built on
    `hasAnyPermission()` would show the Super Admin **nothing** — the exact inverse of the
    requirement. This is a correctness fork, not a style preference.

  **Add `data-test="sidebar-link-{{ $key }}"` per rendered item.** The repo already uses this hook
  convention (`data-test="logout-button"`, `data-test="update-password-button"`), the component is
  new so the marginal cost is zero, and it gives QA an unambiguous absence assertion.

- `resources/views/layouts/app/sidebar.blade.php` — **modify**. Replace the starter-kit `Platform`
  group / `Dashboard` item with an ungated Home item (`route('dashboard')`) plus
  `<x-sidebar-nav />`. Everything from `<flux:spacer />` down — the desktop user menu, the mobile
  `<flux:header>` dropdown, `@persist('toast')`, `@fluxScripts` — is **out of scope and must not
  change**.

- **Nothing else.** No `app/Providers/*` change (the Super Admin `Gate::before` is 0002's job), no
  `bootstrap/app.php` change, no new `app/View/` or `app/Support/` base folder.

- ⚠️ **`resources/views/layouts/app/header.blade.php` is dead code — do not touch it.**
  `layouts/app.blade.php` unconditionally renders `<x-layouts::app.sidebar>` and never
  `<x-layouts::app.header>`; the header file is an unused alternative shell from the Livewire
  starter kit. Recorded so nobody in Phase 3 "helpfully" duplicates the gating logic into it.

- Labels use `__()` with **English source strings**, matching the file's existing `__('Dashboard')`.
  There is **no `lang/` directory in the repo at all** and `APP_LOCALE=en`, so `__()` echoes its
  argument verbatim today. Epic 5 drops in `lang/es.json` without touching this component. No
  Spanish is hardcoded here.

- `docs/arospe-handoff/project/` is a **style guide only** — take the grouping/heading pattern from
  its `NAV` array and nothing else. No prototype markup, CSS, or JS is ported.

- **No test files listed** — `frontend-qa` writes them in Phase 3 (TDD red first).

## Tests to perform

**Feature tests under `tests/Feature/`, not browser tests.** Two independent reasons:
`docs/testing/frontend/playwright-setup.md` records that `tests/Browser/` does not exist and
`phpunit.xml` declares no `Browser` testsuite; and the behavior is pure server-rendered
conditional rendering with no JS, no Alpine, no Livewire round-trip — so a browser test would
observe nothing extra while adding flake and runtime, which `test-quality-checklist.md` treats as
an anti-pattern.

**Asserting absence:** never `assertDontSee('Users')` — that word will collide with page titles and
copy other Epic 1 stories add. Assert on the entry's resolved route URL
(`assertDontSee(route('users.index'), escape: false)`) or, preferably, the
`data-test="sidebar-link-users"` hook.

- [ ] Happy path: a role holding any Users & Roles permission sees the Users entry.
- [ ] Happy path: a role holding `roles.manage` sees the Roles & Permissions entry.
- [ ] Negative: a role holding no Users & Roles permission never sees the Users entry.
- [ ] **Gate-independence, direction 1**: a role holding Users & Roles permissions but **not**
      `roles.manage` never sees the Roles & Permissions entry.
- [ ] **Gate-independence, direction 2**: a role holding **only** `roles.manage`
      never sees the Users entry. This is the direction most likely to be skipped, and the only
      one that proves the gates are genuinely independent rather than one being a subset of the
      other. A single test granting both permissions together would pass even if someone wired
      both entries to the same permission list — it must not be the only coverage.
- [ ] Negative: a role holding neither permission sees neither entry.
- [ ] Edge — Super Admin: a Super Admin with **zero** rows in `model_has_permissions` /
      `role_has_permissions` sees every registered entry. The fixture must assign no permissions
      "just in case", or the test proves a broad grant rather than the bypass path.
- [ ] Edge: a user with zero module permissions still sees the Home entry.
- [ ] Edge — mechanism: a group whose entries are all filtered out renders no heading. Until open
      question 1 is resolved this is a **component-level test against a stubbed registry**, which
      is legitimate but weaker and more implementation-coupled than a real journey test — label it
      honestly as testing the mechanism in isolation.
- [ ] Reactivity: revoking a role's Users & Roles permission removes the entry on the **next**
      request. Spatie's registrar cache is flushed internally by `syncPermissions()` /
      `revokePermissionTo()`, and `Gate::before` re-resolves per request, so no manual cache-busting
      is needed in the test.
- [ ] Regression — `tests/Feature/DashboardTest.php`: the only existing test rendering this layout
      for an authenticated factory user with no roles or permissions. `canAny()` degrades safely
      (no `PermissionDoesNotExist` throw) for such a user, but this is the sharpest regression risk
      in the suite.
- [ ] Regression — `tests/Feature/Settings/ProfileUpdateTest.php` and
      `tests/Feature/Settings/SecurityTest.php`: both render the same app shell.

## Expected outcome
After sign-in, the sidebar shows exactly the module entries the signed-in user's role permits, with
no empty group headings and no leftover starter-kit nav. A user without the relevant permission
never sees the entry; a Super Admin sees them all via the Gate bypass. Adding a future module means
appending one entry to `config/modules.php`.
**Hiding an entry is presentation only** — the server-side denial that makes it real is task
**0012**; neither story is complete without the other.

## Acceptance criteria
- [ ] Sidebar entries and group headings are driven by a single declarative registry, not by
      permission checks scattered through Blade.
- [ ] An entry renders only when the signed-in user's role grants that entry's configured
      permissions; a user without them never sees it.
- [ ] The Users entry and the Roles & Permissions entry are gated **independently** — the latter on
      the distinct `roles.manage` permission.
- [ ] Visibility is resolved through the Gate (`canAny()`), so the Super Admin bypass is inherited
      with no sidebar-local special case; `hasAnyPermission()` is **not** used.
- [ ] A group whose entries are all hidden renders no heading (filter-before-group).
- [ ] Home and the personal account menu are **not** permission-gated.
- [ ] Each rendered entry carries a `data-test="sidebar-link-{key}"` hook.
- [ ] Adding a later epic's module requires only a new registry entry — no change to the component.
- [ ] Labels are translated via `__()` with English source strings; no Spanish is hardcoded.
- [ ] `config/modules.php` contains no closures and survives `config:cache`.
- [ ] No prototype markup, CSS, or JS from `docs/arospe-handoff/` is ported.
- [ ] The user menu, mobile header dropdown, and toast/script blocks are unchanged;
      `layouts/app/header.blade.php` is untouched.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met

## Dependencies
- **Task 0002** — seeded role/permission catalog **and** the Super Admin `Gate::before` bypass.
  This story consumes both and registers neither.
- **Task 0004** — must land `users.index` in `routes/web.php`.
- **Task 0009** — must land `roles.index` in a new `routes/roles.php`.
- **Blocking, not advisory:** `route('users.index')` / `route('roles.index')` throw
  `RouteNotFoundException` at render time if unregistered — a hard failure, not a soft one. A
  red-then-green TDD cycle for 0013 **cannot execute** until 0004 and 0009 have landed both route
  names. Schedule 0013 after them.
- ⚠️ If `roles.index` truly lives in a new `routes/roles.php`, task 0009 must also add
  `require __DIR__.'/roles.php';` to `routes/web.php` (mirroring the existing `settings.php`
  require). `frontend-expert` read 0009's current draft and found it still lists `routes/web.php`
  as the file to modify, with no `routes/roles.php` mentioned. That is 0009's file to fix, but
  0013's registry entry stays inert until it is — flagged so it isn't lost between the two stories.
- **Task 0012** — the server-side half of the same PRD criterion. This story is UI-only and must
  not be reviewed as if it enforced access.

## Open questions
1. **Should Users and Roles & Permissions sit under a shared group heading, or stay ungrouped?**
   The amigos split on how much this matters:
   - `frontend-expert`: mechanically the registry supports either (`'group' => null` vs a heading
     string); it is a pure information-architecture call, not a technical blocker, and the
     prototype's `NAV` array has "Usuarios" ungrouped alongside "Inicio" with no Roles entry to
     take a cue from.
   - `frontend-qa` **(recommends grouping them)**: with both entries ungrouped, Epic 1 contains no
     real group at all, so the "no empty heading" criterion can only be tested against a stubbed
     registry rather than a real sign-in journey. Grouping them makes that criterion testable
     end-to-end with only Epic 1's real permissions.
   Product owner / design call. It changes test strength, not feasibility.
2. **The starter-kit external links.** The current sidebar carries `Repository` and `Documentation`
   links to `laravel/livewire-starter-kit` and the Laravel docs — boilerplate with no Arospe
   meaning. Remove them as part of this restructure, or leave them? Removal looks like the obvious
   intent but is a scope call the product owner should confirm rather than the story assume.
3. **Mid-session reactivity semantics.** The Gherkin specifies "on the next page load", matching
   server-rendered nav and the PRD's "Editing a role updates all of its holders". Confirm no
   real-time/push requirement is intended — nothing in this project uses websockets or polling.
   Both amigos agree this is still open.
4. **Super Admin identification.** Task 0002 owns whether the Super Admin is identified by role
   name or a dedicated flag; the Super Admin test fixture cannot be built correctly until that is
   pinned down.
5. **Icon names.** `users` / `shield-check` have not been checked against Flux's actual icon set —
   trivial to confirm or swap during implementation, not worth blocking on.

---

_Phase 1 debate: convened `frontend-expert` and `frontend-qa` as independent agents (2026-08-07).
An earlier round could not reach them — the harness hit its 20-concurrent-subagent cap during the
parallel Epic 1 run — and was self-derived; this document supersedes it with real contributions.
The two amigos converged on the architecture (config registry + anonymous Blade component +
`canAny()`) and both independently verified the `Gate::before` inheritance at vendor source. Their
substantive additions over the self-derived draft: the `canAny()` vs `hasAnyPermission()`
correctness fork, gate-independence direction 2, the zero-permission-rows Super Admin fixture, the
`data-test` hooks, the dead `header.blade.php` file, filter-before-group, and the correction that
personal settings live in the user menu rather than the left nav._
