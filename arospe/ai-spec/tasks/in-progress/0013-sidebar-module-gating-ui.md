# [0013] Module/sidebar access gating — UI (hide inaccessible modules)

## Description
Make the dashboard sidebar's per-module entries permission-gated: each nav entry renders only when
the signed-in user's role grants that entry's configured permission, driven by a single declarative
registry rather than permission checks scattered through Blade. A group whose every entry is hidden
renders no heading at all. Epic 1 delivers the generic, registry-driven gating **mechanism** plus the
two entries that can be meaningfully gated today (Users, Roles & Permissions); later epics plug their
modules into the same registry. Server-side denial of direct URL access is **not** in this story — see
closed task 0012.

**Corrected 2026-08-21 (Phase 2 review) — this is a gating *retrofit*, not a greenfield replacement.**
The Phase 1 draft below (dated 2026-08-07) was written before stories 0006, 0011, 0040 and 0012 shipped
and described replacing "the starter-kit `Platform` group / `Dashboard` item" with a fresh component.
That starter-kit shell no longer exists: [`resources/views/layouts/app/sidebar.blade.php`](../../../resources/views/layouts/app/sidebar.blade.php)
already renders two real, correctly-routed groups —

```blade
{{-- real, current file --}}
<flux:sidebar.group :heading="__('Platform')" class="grid">
    <flux:sidebar.item icon="home" :href="route('dashboard')" :current="request()->routeIs('dashboard')" wire:navigate>
        {{ __('Dashboard') }}
    </flux:sidebar.item>
    <flux:sidebar.item icon="users" :href="route('users.index')" :current="request()->routeIs('users.*')" wire:navigate>
        {{ __('Users') }}
    </flux:sidebar.item>
</flux:sidebar.group>

<flux:sidebar.group expandable icon="cog-6-tooth" :heading="__('Settings')" :expanded="request()->routeIs('roles.*')">
    <flux:sidebar.item icon="shield-check" :href="route('roles.index')" :current="request()->routeIs('roles.*')" wire:navigate>
        {{ __('Roles & permissions') }}
    </flux:sidebar.item>
</flux:sidebar.group>
```

— with both `/users` and `/roles` rendered **unconditionally** for every authenticated user (see
[`docs/api/routes.md`](../../../docs/api/routes.md)'s "linked from the sidebar with no permission gating"
bullets on both routes, which name this story as the one that closes that gap). This story's real job
is narrower than the original draft: extract this exact structure into a registry, then make each
item's (and each group's) rendering conditional on the Gate. Nothing about the shipped visual result —
the "Platform" plain heading, the "Settings" expandable icon-carrying dropdown that auto-expands on
`roles.*` — may regress.

## Type
frontend (related_task_id: 0012) | includes database-expert: no

**Confirmed product decisions (2026-08-21, human-confirmed before Phase 3, resolving three of the
open questions below):**
1. **The Dashboard item keeps its shipped name and route** (`{{ __('Dashboard') }}` → `route('dashboard')`).
   The original draft's "Home entry" was an unflagged rename with no product ask behind it — every
   Gherkin scenario and acceptance criterion below says "Dashboard", not "Home".
2. **The registry is extended to carry group-level metadata** (`icon`, `expandable`, `expanded_when`),
   not simplified to plain headings. Collapsing the shipped "Settings" dropdown into a flat heading
   would be a visible, unrequested regression — see [the registry schema](#files-to-createmodify)
   below.
3. **Sidebar labels move into translation files** — `lang/en/navigation.php` +
   `lang/es/navigation.php`, snake_case leaves grouped `groups`/`items`, per
   [`docs/conventions/naming.md`](../../../docs/conventions/naming.md#translation-keys) — rather than
   staying as bare `__('Dashboard')`-style English string keys. This is the larger-scope option: it
   adds two new lang files this story must create and keep key-for-key identical, matching the
   convention every other domain in this repo already follows (`lang/en/{roles,users}.php`).

**Open question 3 (mid-session reactivity) is resolved as originally proposed, not re-asked**: nothing
in this project uses websockets or polling (verified — no such dependency in `composer.json` or
`package.json`), so "the sidebar reflects a permission change on the *next page load*, not live" is the
correct and only sensible semantic. No Livewire polling, no broadcast channel, is in scope.

## Gherkin
```gherkin
Feature: Sidebar module visibility

  Scenario Outline: A sidebar entry appears for a role holding its required permission
    Given a signed-in administrator whose role grants <permission>
    When they view the dashboard
    Then the sidebar shows the <entry> entry

    Examples:
      | permission                   | entry               |
      | the "users.view" permission  | Users               |
      | the "roles.manage" permission | Roles & Permissions |

  Scenario Outline: A sidebar entry is absent when its own permission was not granted
    Given a signed-in administrator whose role grants only <granted_permission>
    When they view the dashboard
    Then the sidebar does not show the <hidden_entry> entry

    Examples:
      | granted_permission           | hidden_entry        |
      | the "users.view" permission  | Roles & Permissions |
      | the "roles.manage" permission | Users               |

  Scenario: A role with no module permissions sees neither gated entry
    Given a signed-in administrator whose role grants no module permissions
    When they view the dashboard
    Then the sidebar shows neither the Users entry nor the Roles & Permissions entry

  Scenario: A role holding a related-but-wrong permission still cannot see the Users entry
    Given a signed-in administrator whose role grants "users.create" but not "users.view"
    When they view the dashboard
    Then the sidebar does not show the Users entry, because the Users route itself refuses that
      role and the sidebar must never advertise a link its own route would 403

  Scenario: The Settings group renders no heading when its only entry is hidden
    Given a signed-in administrator whose role grants "users.view" but not
      "roles.manage"
    When they view the dashboard
    Then the Settings group heading is not shown at all, not merely emptied of its entry

  Scenario: The Super Admin sees every registered module entry
    Given a signed-in Super Admin holding no permission rows of their own
    When they view the dashboard
    Then the sidebar shows every registered module entry, because the Super Admin bypasses
      permission checks

  Scenario: The Dashboard entry stays available to a role with no module permissions
    Given a signed-in administrator whose role grants no module permissions
    When they view the dashboard
    Then the sidebar still shows the Dashboard entry, because it is not a permission-gated module

  Scenario: Module gating does not affect the personal account menu
    Given a signed-in administrator whose role grants no module permissions
    When they view the dashboard
    Then their own account settings remain reachable from the user menu, which module
      permissions never gate

  Scenario: A revoked module permission removes its sidebar entry on the next page load
    Given a signed-in administrator whose role has just had its "users.view" permission revoked
    When they load the dashboard again
    Then the sidebar no longer shows the Users entry
```

> **Corrected 2026-08-21 (Phase 2 review, F-3/F-7).** Two changes from the original draft. First,
> every permission reference is now the literal ability name (`users.view`, `roles.manage`) rather
> than the vague "a Users & Roles permission" — closed task 0012 settled `users.index`'s gate as the
> **single** ability `can:users.view`, not an OR'd set, and this story's sidebar gate must be exactly
> that ability or it can advertise a link the route then refuses (see the new scenario above and the
> rule in [Files to create/modify](#files-to-createmodify)). Second, the original draft deliberately
> left the "empty group heading" scenario unwritten, reasoning that Epic 1's registry held two
> *ungrouped* entries so there was no real group to exercise it against (gherkin-guidelines rule 6,
> "no ghost scenarios"). That reasoning no longer holds: the shipped sidebar already has a real
> "Settings" group with exactly one entry (`roles.index`), so the scenario above is a genuine
> end-to-end journey with Epic 1's real permissions, not a stub.

## Files to create/modify

- `config/modules.php` — **new**. Declarative registry, split into `groups` and `items` — extended
  from the original single-`group`-string draft (**Confirmed product decision 2** above) so the
  shipped "Settings" dropdown's icon/expandable/auto-expand behaviour survives the retrofit. **No
  closures anywhere in this file** — it must survive `config:cache`.

  ```php
  // config/modules.php — Epic 1 holds exactly these two groups and three items
  return [
      'groups' => [
          'platform' => [
              'heading' => 'navigation.groups.platform',
              'icon' => null,
              'expandable' => false,
              'expanded_when' => null,
              'class' => 'grid',              // matches the shipped group's class="grid" exactly
          ],
          'settings' => [
              'heading' => 'navigation.groups.settings',
              'icon' => 'cog-6-tooth',
              'expandable' => true,
              'expanded_when' => 'roles.*',   // route-name pattern passed to request()->routeIs()
              'class' => null,
          ],
      ],
      'items' => [
          'dashboard' => [
              'group' => 'platform',
              'label' => 'navigation.items.dashboard',
              'icon' => 'home',
              'route' => 'dashboard',
              'current_when' => 'dashboard',
              'permissions' => [],             // ungated -- see the empty-permissions rule below
          ],
          'users' => [
              'group' => 'platform',
              'label' => 'navigation.items.users',
              'icon' => 'users',
              'route' => 'users.index',
              'current_when' => 'users.*',
              'permissions' => ['users.view'],
          ],
          'roles' => [
              'group' => 'settings',
              'label' => 'navigation.items.roles',
              'icon' => 'shield-check',
              'route' => 'roles.index',
              'current_when' => 'roles.*',
              'permissions' => ['roles.manage'],
          ],
      ],
  ];
  ```

  **`groups` carries a nullable `class` key (added 2026-08-21, Phase 2 re-review R-3).** The shipped
  "Platform" group renders `class="grid"`; the registry's `heading`/`icon`/`expandable`/`expanded_when`
  alone cannot express it, and "nothing about the shipped visual result may regress" (Description
  above) is written in absolute terms. Pass it straight through as `:class="$group['class']"` — `null`
  renders no `class` attribute at all, matching "Settings"'s shipped markup, which has none.

  **Scope boundary, unchanged from the original draft:** this file is **not** the permission catalog.
  The catalog — every permission across all epics, most with no screen yet — is owned by story 0002's
  seeder. `config/modules.php` lists only entries that have a real route to link to *today*; an epic
  appends a line when its screen ships, not when its permissions are seeded.

  **A registry entry's `permissions` must be exactly the ability its route's `can:` middleware
  enforces — never a broader or related set.** (**Corrected 2026-08-21, Phase 2 review F-3**, replacing
  the original draft's "the Users & Roles permission set, OR'd" design, which is now closed task
  0012's own rejected alternative.) `users` is `['users.view']` because `routes/users.php` gates
  `users.index` on exactly `can:users.view`; `roles` is `['roles.manage']` because `routes/roles.php`
  gates `roles.index` on exactly `can:roles.manage`. A broader list (e.g. adding `users.create`)
  would show the Users entry to a role that the route itself then 403s — see
  [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#the-copyable-module-gate-pattern-and-the-three-alternatives-rejected)'s
  ⚠️ on this exact misconfiguration, which this story is the first to actually build the surface for.
  The two gates stay **independent** either way — that half of the original design is unchanged and
  still load-bearing; reject any Phase 3 simplification that collapses the two gates into one.

  **`permissions: []` means "always visible", checked explicitly — never passed to `canAny()`.**
  Laravel's `Gate::any(array $abilities, ...)` iterates the array and returns `false` when it is
  empty (there is nothing to iterate to `true`), so a naive `Gate::canAny($item['permissions'])` would
  make the **Dashboard** entry disappear for everyone. The component must branch:
  `empty($item['permissions']) || Gate::any($item['permissions'])`.

- `resources/views/components/sidebar-nav.blade.php` — **new anonymous** Blade component (no
  companion PHP class), matching the existing anonymous-component precedent in this layout
  (`x-app-logo`, `x-desktop-user-menu`, `resources/views/components/settings/layout.blade.php`).
  Reads `config('modules.items')`, filters by the empty-permissions-or-`canAny()` rule above, groups
  the survivors by their `group` key, and — for each of `config('modules.groups')` that has at least
  one surviving item — renders a `<flux:sidebar.group>` carrying that group's `heading` (translated),
  `icon`, `expandable`, and `:expanded="request()->routeIs($group['expanded_when'])"` (only when
  `expanded_when` is non-null), with each surviving item rendered as a `<flux:sidebar.item>` carrying
  its `icon`, translated `label`, `:href="route($item['route'])"`,
  `:current="request()->routeIs($item['current_when'])"`, and `wire:navigate`.

  **Filter first, group second** — `collect(config('modules.items'))->filter(...)->groupBy('group')`
  structurally cannot produce a group key with zero members, because `groupBy` only creates a bucket
  for items that survived the filter. Then iterate `config('modules.groups')` and skip any group key
  absent from that grouped collection — this is what makes the "Settings" heading disappear entirely
  (not merely render empty) when its one item is hidden.

  **Use `canAny()`, never `hasAnyPermission()`.** Verified against
  `vendor/spatie/laravel-permission/src/PermissionRegistrar.php::registerPermissions()`, which
  registers a `Gate::before` hook (`register_permission_check_method => true` in
  `config/permission.php`, confirmed still the shipped value). Consequences:
  - Every Spatie permission name is already a valid Gate ability — no `Gate::define()` per
    permission.
  - `canAny()` / `@can` / `@canany` / `Gate::allows()` run the whole `before`-callback chain, so
    they inherit story 0002's Super Admin bypass **for free**.
  - `hasAnyPermission()` / `hasPermissionTo()` / `hasRole()` are trait methods that query the
    model's own relations and **never touch the Gate at all**. Since the Super Admin holds *zero*
    permission rows and bypasses permission checks entirely (`Role::superAdminName()`-keyed
    `Gate::before`, [architecture/authorization.md](../../../docs/architecture/authorization.md#the-super-admin-bypass)),
    a sidebar built on `hasAnyPermission()` would show the Super Admin **nothing** — the exact
    inverse of the requirement. This is a correctness fork, not a style preference. (With today's
    single-ability entries `can()` would work identically to `canAny()`; `canAny()` is chosen because
    a future entry may legitimately need more than one ability, and using it uniformly means no
    branch in the component between one-ability and many-ability entries.)

  **Add `data-test="sidebar-link-{{ $key }}"` per rendered item, and `data-test="sidebar-group-{{
  $groupKey }}"` on each rendered group's heading region.** (**Extended 2026-08-21, Phase 2 review
  F-12** — the group hook is new; the item hook is the original draft's.) The group hook exists so the
  "no heading at all" acceptance criterion has an unambiguous absence target: `assertDontSee('Settings')`
  would collide with the *personal* Settings menu item already in the user-menu dropdown
  (`resources/views/layouts/app/sidebar.blade.php`'s mobile header, and
  `resources/views/components/desktop-user-menu.blade.php`), producing a false-passing test. The repo
  already uses this hook convention (`data-test="logout-button"`, `data-test="sidebar-menu-button"`
  in `desktop-user-menu.blade.php`); confirm at implementation time whether Flux's `flux:sidebar.group`
  forwards an arbitrary `data-test` attribute onto its rendered wrapper the way `flux:tooltip` does
  (see the two Flux/Blaze markup traps already recorded in
  [`docs/errors-log.md`](../../../docs/errors-log.md), 2026-08-16 — a bound prop can be "present" under
  Blaze even when falsy, and some Flux components need the attribute on a specific wrapper, not the
  outer tag) — do not assume it forwards cleanly without checking the rendered HTML.

  ⚠️ **A third Flux trap, specific to this story (added 2026-08-21, Phase 2 re-review R-4): a group
  that is both `expandable` and carries an `icon` — exactly "Settings" — renders its slot content
  *twice*.** Verified against `vendor/livewire/flux/stubs/resources/views/flux/sidebar/group.blade.php`:
  that combination renders `{{ $slot }}` once inside the desktop `<ui-disclosure>` and again inside a
  collapsed-sidebar `<flux:dropdown><flux:menu>` duplicate for when the sidebar is collapsed to icons
  only. So `data-test="sidebar-link-roles"` appears **twice** in the rendered HTML, while
  `data-test="sidebar-group-settings"` appears once (the group's own `$attributes` land only on the
  `<ui-disclosure>` wrapper). Presence/absence assertions (`assertSee`, `assertDontSee`,
  `Selector::getByTestId()`-style single-match helpers) are unaffected; a **count**-based assertion
  would silently be off by a constant and read as correct — the exact failure mode
  [`docs/errors-log.md`](../../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21)
  already records. Do not write a count-based test against this component without first confirming
  the real occurrence count from rendered HTML.

- `resources/views/layouts/app/sidebar.blade.php` — **modify, not replace.** Retrofit the two shipped
  groups (quoted in full in the Description above) into `<x-sidebar-nav />`, placed exactly where the
  `<flux:sidebar.nav>` block's two `<flux:sidebar.group>` elements are today. Everything else in this
  file — the header logo, `<flux:spacer />`, the desktop user menu, the mobile `<flux:header>`
  dropdown, `@persist('toast')`, `@fluxScripts` — is **out of scope and must not change.**

- `lang/en/navigation.php` and `lang/es/navigation.php` — **new** (**Confirmed product decision 3**
  above). Two top-level arrays, `groups` and `items`, snake_case leaves matching the registry's own
  keys, key-for-key identical between the two files per
  [`docs/conventions/naming.md`](../../../docs/conventions/naming.md#translation-keys):

  ```php
  // lang/en/navigation.php
  return [
      'groups' => [
          'platform' => 'Platform',
          'settings' => 'Settings',
      ],
      'items' => [
          'dashboard' => 'Dashboard',
          'users' => 'Users',
          'roles' => 'Roles & permissions',
      ],
  ];
  ```

  The component resolves a label with `__($item['label'])` (e.g. `__('navigation.items.users')`), not
  a hardcoded string — the registry stores the *key*, the lang file stores the *copy*. Spanish values
  are real translations, not placeholders (`APP_LOCALE=en` today, so nothing in the running app
  renders them yet, but the file must not ship untranslated English-in-Spanish-clothing).

- **Nothing else.** No `app/Providers/*` change (the Super Admin `Gate::before` is 0002's job), no
  `bootstrap/app.php` change, no new `app/View/` or `app/Support/` base folder.

- ⚠️ **`resources/views/layouts/app/header.blade.php` is dead code — do not touch it.**
  `layouts/app.blade.php` unconditionally renders `<x-layouts::app.sidebar>` and never
  `<x-layouts::app.header>`; the header file is an unused alternative shell from the Livewire
  starter kit. Verified 2026-08-21: still true, zero references to it anywhere in `resources/` or
  `app/`. Recorded so nobody in Phase 3 "helpfully" duplicates the gating logic into it.

- `docs/arospe-handoff/project/` is a **style guide only** — the `NAV` array specifically lives in
  `docs/arospe-handoff/project/js/common.js` (named explicitly, 2026-08-21 re-review, so there is no
  doubt this JS file is the one thing worth opening there). Take the grouping/heading pattern from it
  and nothing else — no prototype markup, CSS, or JS is ported.

- **No test files listed** — `frontend-qa` writes them in Phase 3 (TDD red first).

## Tests to perform

**Feature tests under `tests/Feature/`, not browser tests.** **Corrected 2026-08-21 (Phase 2 review,
F-4):** the original draft's reason was that `tests/Browser/` "does not exist" — false since closed
story 0006b; the suite exists and runs in CI (`docs/testing/frontend/playwright-setup.md`,
`phpunit.xml`'s `Browser` testsuite). The real, sufficient reason is the one the draft also gave: the
behavior is pure server-rendered conditional markup with no JS, Alpine, or Livewire round-trip, so a
Feature test asserting on rendered HTML observes everything a browser test would, while adding flake
and runtime a browser test would not justify — the anti-pattern
[`docs/testing/frontend/test-quality-checklist.md`](../../../docs/testing/frontend/test-quality-checklist.md)
and [`docs/testing/frontend/coverage-policy.md`](../../../docs/testing/frontend/coverage-policy.md)'s
"prefer fewer high-value critical-journey tests" rule both argue against.

**Asserting absence:** never `assertDontSee('Users')` or `assertDontSee('Settings')` — those words
collide with page titles and the personal-account Settings menu item. Assert on the entry's/group's
`data-test` hook, or the entry's resolved route URL (`assertDontSee(route('users.index'),
escape: false)`).

- [ ] Happy path: a role holding `users.view` sees the Users entry.
- [ ] Happy path: a role holding `roles.manage` sees the Roles & Permissions entry.
- [ ] Negative: a role holding no `users.view` never sees the Users entry.
- [ ] Negative: a role holding a related-but-different Users permission (`users.create`, say) and
      not `users.view` never sees the Users entry — the regression test for the "never advertise a
      link the route would refuse" rule (Phase 2 review F-3); the highest-value new case in this
      story.
- [ ] **Gate-independence, direction 1**: a role holding `users.view` but **not** `roles.manage`
      never sees the Roles & Permissions entry.
- [ ] **Gate-independence, direction 2**: a role holding **only** `roles.manage` never sees the
      Users entry. This is the direction most likely to be skipped, and the only one that proves the
      gates are genuinely independent rather than one being a subset of the other. A single test
      granting both permissions together would pass even if someone wired both entries to the same
      permission list — it must not be the only coverage.
- [ ] Negative: a role holding neither permission sees neither entry.
- [ ] **Mechanism, real journey (corrected 2026-08-21, Phase 2 review F-7 — no longer a stubbed-registry
      test):** a role holding `users.view` but not `roles.manage` sees no "Settings" group heading at
      all, asserted via the group's `data-test` hook — proving filter-before-group against the real,
      shipped registry rather than a test double.
- [ ] Edge — Super Admin: a Super Admin with **zero** rows in `model_has_permissions` /
      `role_has_permissions` sees every registered entry, both groups. The fixture must assign no
      permissions "just in case", or the test proves a broad grant rather than the bypass path.
      Resolve the Super Admin role via `Role::superAdminName()`, never a hardcoded string or the
      `RoleName` enum's compiled-in default directly (**added 2026-08-21, Phase 2 review F-6** — see
      `App\Enums\RoleName`'s own docblock on why), and pin `config(['auth.super_admin.email' =>
      null])` in the test's setup so a developer's ambient `SUPER_ADMIN_EMAIL` cannot provision a
      second, unaccounted-for account (`docs/errors-log.md`, 2026-08-12 entry).
- [ ] Edge: a user with zero module permissions still sees the Dashboard entry.
- [ ] Reactivity: revoking a role's `users.view` permission removes the entry on the **next**
      request. Spatie's registrar cache is flushed internally by `syncPermissions()` /
      `revokePermissionTo()`, and `Gate::before` re-resolves per request, so no manual cache-busting
      is needed in the test.
- [ ] Regression — `tests/Feature/DashboardTest.php`: the only existing test rendering this layout
      for an authenticated factory user with no roles or permissions. `canAny()` degrades safely
      (no `PermissionDoesNotExist` throw) for such a user, but this is the sharpest regression risk
      in the suite — a zero-permission user must still get a 200, now showing only the Dashboard
      entry.
- [ ] Regression — `tests/Feature/Settings/ProfileUpdateTest.php` and
      `tests/Feature/Settings/SecurityTest.php`: both render the same app shell.
- [ ] Regression (**added 2026-08-21, Phase 2 review F-11**) — `tests/Feature/Users/IndexRenderingTest.php`,
      `tests/Feature/Roles/IndexUiTest.php` and `tests/Feature/Authorization/ModuleRouteAccessTest.php`
      all render this same shell for a permission-holding actor and must stay green.
- [ ] Regression, verified-safe rather than left unexamined (**added 2026-08-21, F-11**) —
      `tests/Browser/UsersIndexTest.php` and `tests/Browser/RolesIndexTest.php` render this shell in a
      real browser; neither asserts on sidebar markup today, so they are expected to be unaffected —
      confirm they still pass rather than assuming it.
- [ ] Mechanism: `php artisan config:cache` succeeds with `config/modules.php` present (**added
      2026-08-21, Phase 2 re-review note**) — the acceptance criterion "contains no closures and
      survives `config:cache`" otherwise has no test backing it beyond code review. Run it and confirm
      the app still boots (e.g. the existing regression tests still pass) with the config cached, then
      `php artisan config:clear` to leave the working tree as it started.

## Expected outcome
After sign-in, the sidebar shows exactly the module entries the signed-in user's role permits, with
no empty group headings and the "Settings" group's icon/expand behaviour preserved exactly as shipped.
A user without `users.view` never sees the Users entry; a user without `roles.manage` never sees the
Roles & Permissions entry; a Super Admin sees both via the Gate bypass. Adding a future module means
appending one entry to `config/modules.php` (and, if it needs a new group, one entry to `groups`) —
no change to the component.
**Hiding an entry is presentation only** — the server-side denial that makes it real is closed task
**0012**; neither story is complete without the other.

## Acceptance criteria
- [ ] Sidebar entries and group headings are driven by a single declarative registry
      (`config/modules.php`), not by permission checks scattered through Blade.
- [ ] An entry renders only when the signed-in user's role grants that entry's **exact** configured
      permission — the same ability its own route's `can:` middleware enforces, never a broader or
      related set (**corrected 2026-08-21, Phase 2 review F-3**).
- [ ] The Users entry and the Roles & Permissions entry are gated **independently** — `users.view`
      and `roles.manage` respectively.
- [ ] Visibility is resolved through the Gate (`canAny()`), so the Super Admin bypass is inherited
      with no sidebar-local special case; `hasAnyPermission()` is **not** used.
- [ ] A group whose entries are all hidden renders no heading at all — verified against the real
      shipped "Settings" group, not a stub (**corrected 2026-08-21, F-7**).
- [ ] The "Settings" group's icon and expandable/auto-expand-on-`roles.*` behaviour is preserved
      exactly as it ships today (**added 2026-08-21, Confirmed product decision 2**).
- [ ] Dashboard and the personal account menu are **not** permission-gated; Dashboard keeps its
      shipped name and route (**corrected 2026-08-21, Confirmed product decision 1** — not renamed to
      "Home").
- [ ] Each rendered entry carries a `data-test="sidebar-link-{key}"` hook, and each rendered group
      carries a `data-test="sidebar-group-{key}"` hook (**extended 2026-08-21, F-12**).
- [ ] Adding a later epic's module requires only a new registry entry — no change to the component.
- [ ] Labels are resolved via `__()` against real translation keys in `lang/en/navigation.php` +
      `lang/es/navigation.php`, key-for-key identical between the two files — not bare English string
      literals (**corrected 2026-08-21, Confirmed product decision 3**).
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

**Corrected 2026-08-21 (Phase 2 review, F-5) — every dependency below is closed; the original draft's
"blocking, not advisory" framing described work that has since shipped.**

- **Task 0002** (closed) — seeded role/permission catalog **and** the Super Admin `Gate::before`
  bypass, keyed through `Role::superAdminName()` since stories 0008/0008a. This story consumes both
  and registers neither.
- **Task 0004** (closed) — registered `users.index`.
- **Task 0040** (closed) — relocated `users.index` from `routes/web.php` into its own
  `routes/users.php`, still gated `can:users.view`. The original draft's citations of
  `routes/web.php` for this route are stale; this story's registry links to it by **route name**
  (`users.index`), which is unaffected by which file declares it.
- **Task 0010** (closed) — registered `roles.index` in a new `routes/roles.php`, gated
  `can:roles.manage`, and added `require __DIR__.'/roles.php';` to `routes/web.php` — the original
  draft's ⚠️ asking whether this had happened is resolved; verified present.
- **Task 0006** (closed) — put the Users entry in the sidebar (ungated, per that story's own
  documented "permission-aware navigation is owned by story 0013" note).
- **Task 0011**, plus its post-closure follow-up in this same session (commit `23f0056`) — put the
  Roles & Permissions entry in the sidebar and restructured it into the "Settings" expandable group
  this story now retrofits gating onto.
- **Task 0012** (closed) — the server-side half of the same PRD criterion. `users.index` and
  `roles.index` are already independently and correctly gated server-side; this story is UI-only and
  must not be reviewed as if it enforced access — 0012's own suite is the enforcement evidence.

No dependency in this list blocks Phase 3: every route name this story links to resolves today, and
every permission name it gates on is in the seeded catalog.

## Open questions

Three of the original five are resolved above as **Confirmed product decisions**; the two genuinely
open ones from the original draft were found moot on inspection:

- ~~**Starter-kit external links** (original OQ2).~~ **Moot.** There are no `Repository` /
  `Documentation` links in the shipped sidebar to remove — verified 2026-08-21.
- ~~**Icon names** (original OQ5).~~ **Moot.** `home`, `users`, `shield-check` and `cog-6-tooth` all
  already render correctly in the shipped sidebar — verified 2026-08-21, nothing to confirm or swap.

No open questions remain that block Phase 3.

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

_Phase 2 review, 2026-08-21 (code-reviewer, FAIL then corrected in this pass): found the file
substantially stale against two weeks of shipped work it predates — the sidebar it planned to build
from scratch already exists and needed a gating retrofit instead (F-1), the registry schema couldn't
express the shipped "Settings" group's icon/expandable/auto-expand behaviour (F-2), the `users` gate
contradicted closed story 0012's human-confirmed single-ability decision in a way that could advertise
a link the route then refuses (F-3), the browser-testing justification cited a doc stating the
opposite of what it actually says — the third occurrence of this exact citation mistake across
0012/0040 (F-4), the entire Dependencies section described closed work as pending (F-5), Super Admin
identification was resolvable via `Role::superAdminName()` (F-6), the "ghost scenario" caveat was
obsolete now that a real "Settings" group exists to test against (F-7), two open questions were moot
(F-8/F-9), the "no `lang/` directory" claim was false and contradicted the shipped translation-key
convention (F-10), the regression test list was thin (F-11), and the `data-test` convention needed
extending to groups so the "no heading" criterion has an unambiguous, collision-free assertion target
(F-12). Three genuine product/scope decisions (Dashboard naming, registry schema shape, translation
file placement) were escalated and human-confirmed rather than assumed; all other findings were
corrections of stale fact and were fixed directly in this rewrite._

_Phase 2 re-review, 2026-08-21 (code-reviewer, PASS): confirmed all twelve corrections landed
accurately, then found four small residuals in the rewrite itself, all fixed in this pass — a dangling
anchor to a heading that had been renamed (R-1); three leftover "manage roles & permissions" prose
references that reintroduced F-3's exact ambiguity, since `roles.manage` and
`roles.manage-administrators` are both seeded permissions (R-2); the shipped "Platform" group's
`class="grid"` had no slot in the `groups` schema despite the story's own "nothing may regress"
wording, closed by adding a nullable `class` key (R-3); and an unrecorded Flux rendering fact — an
`expandable` group carrying an `icon` (exactly "Settings") renders its slot content twice, so a
count-based test against it would silently be off by a constant, recorded as a ⚠️ next to the
`data-test` hook guidance it directly affects (R-4). Two non-blocking notes were also folded in: a
test case for the `config:cache`-survival acceptance criterion, which previously had none, and naming
the exact `docs/arospe-handoff/project/js/common.js` file the `NAV` array lives in._
