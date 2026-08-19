# [0009] Roles & Permissions management — backend (component logic, CRUD, cascading permission changes)

## Description
Build the Livewire component class that backs the Roles & Permissions management area: create,
rename, delete custom roles and sync each role's granular per-module permissions. Permission
changes must take effect immediately for every holder of the role, deletion is hard-blocked
while the role still has holders (message states the exact count), and the whole area is gated
server-side on the `roles.manage` permission.

## Type
backend | fullstack (related_task_id: 0011 — the Blade view / UI sibling) | includes database-expert: no

Depends on **0002** (roles & permission catalog seeder, which defines the `<module-slug>.<action>`
permission naming convention, the `roles.manage` and `roles.manage-administrators` permissions, the
seeded baseline `Administrator` role and the `Super Admin` role) — assumed done.

Boundaries with siblings, referenced and never redefined here:
- **0011** owns the Blade view, the component's UI shape, and browser tests.
- **0008** owns `app/Models/Role.php`, the shared `selectable()` scope, the `config/permission.php`
  model repoint, and every Super Admin invariant (undeletable / uneditable / non-downgradable,
  enforced via model events and overrides of `syncPermissions()`/`givePermissionTo()`/
  `revokePermissionTo()`).
- **0010** owns the authorization rule for who may grant `roles.manage-administrators`.
- **0004** owns requiring `roles.manage-administrators` to promote a user to `Administrator`.
- **0013** owns the sidebar entry; until it lands the screen is reached directly at `/roles`.

> Note on vocabulary: the PRD's human phrase "manage roles & permissions" is Gherkin prose. The
> **technical permission name is `roles.manage`**, per 0002's confirmed `<module-slug>.<action>`
> convention — that is the string used in middleware and `can()` checks.

## Gherkin
```gherkin
Feature: Roles and permissions management

  Scenario: Create a custom role with scoped permissions
    Given a user administrator holding the "manage roles & permissions" permission
    When they create a role "Blog Editor" granted only the Blog module permissions
    Then the role is saved with exactly those permissions
    And it becomes selectable when assigning a role to a user

  Scenario: Create a role with no permissions granted
    Given a user administrator holding the "manage roles & permissions" permission
    When they create a role "Placeholder" with no permissions granted
    Then the role is saved as a legal, inert role with no permissions

  Scenario: Rename a custom role
    Given a user administrator holding the "manage roles & permissions" permission, with an existing role "Blog Editor"
    When they rename that role to "Content Editor"
    Then the role is saved under the new name
    And its granted permissions are unchanged

  Scenario: Editing a role updates all of its holders
    Given a user administrator holding the "manage roles & permissions" permission, with three users sharing the role "Blog Editor" who have already exercised their blog permissions
    When they remove the "delete blog content" permission from that role
    Then none of those three users can delete blog content afterwards
    And those three users keep the role's remaining blog permissions

  Scenario: Granting a permission to a role reaches all of its holders
    Given a user administrator holding the "manage roles & permissions" permission, with three users sharing the role "Blog Editor" that has no product permissions
    When they grant that role the "view products" permission
    Then all three users can view products afterwards

  Scenario: Editing one role leaves other roles' holders untouched
    Given a user administrator holding the "manage roles & permissions" permission, with a role "Blog Editor" and an unrelated role "Store Manager" whose holder can delete products
    When they remove a permission from the "Blog Editor" role
    Then the "Store Manager" holder can still delete products

  Scenario: Delete a role that nobody holds
    Given a user administrator holding the "manage roles & permissions" permission, with the role "Blog Editor" held by no users
    When they delete the "Blog Editor" role
    Then the role is removed together with its permission grants
    And it is no longer selectable when assigning a role to a user

  Scenario: Deleting a role still assigned to users is hard-blocked with a count
    Given a user administrator holding the "manage roles & permissions" permission, with the role "Blog Editor" assigned to 3 users
    When they try to delete the "Blog Editor" role
    Then deletion is always blocked, with no confirm-and-proceed path
    And the message states that 3 users hold it
    And the role still exists with its 3 holders

  Scenario Outline: Saving a role with invalid details is refused
    Given a user administrator holding the "manage roles & permissions" permission
    When they save a role with <invalid_detail>
    Then the role is not saved and the reason is shown

    Examples:
      | invalid_detail                                     |
      | a blank name                                       |
      | a name already used by another role                |
      | a name differing from an existing role only by case|
      | a name differing from an existing role only by surrounding spaces |
      | a permission that does not exist in the catalog    |

  Scenario: "Blog Editor" cannot manage roles at all
    Given a blog editor whose role was not granted the "manage roles & permissions" permission
    When they navigate directly to the Roles & Permissions management area
    Then access is denied server-side, not merely hidden in the UI

  Scenario: A user without role-management permission cannot change a role directly
    Given a blog editor whose role was not granted the "manage roles & permissions" permission
    When they attempt to save a change to a role without going through the management area
    Then the change is denied server-side
    And that role's permissions are unchanged

  Scenario: A user without role-management permission cannot delete a role directly
    Given a blog editor whose role was not granted the "manage roles & permissions" permission
    When they attempt to delete a role without going through the management area
    Then the deletion is denied server-side
    And that role still exists

  Scenario: The roles list excludes the Super Admin role
    Given a user administrator holding the "manage roles & permissions" permission
    When they view the roles list
    Then the Super Admin role does not appear in it

  Scenario: The role selector excludes the Super Admin role
    Given a user administrator holding the "manage roles & permissions" permission
    When they open the role selector used to assign a role to a user
    Then the Super Admin role is not offered
```

## Files to create/modify
- `app/Livewire/Roles/Index.php` — **create**. The component class this story owns. Class name and
  namespace are **fixed by sibling 0011**, which registers `Route::livewire('roles', Index::class)`
  and owns the paired view `resources/views/livewire/roles/index.blade.php`. Class-based (not
  single-file) per `docs/conventions/base-standards.md`, declares `#[Title(...)]`, `#[Locked]` on
  everything the browser must not set, boolean naming per `docs/conventions/naming.md`.

  **Ids are `int`, not UUID.** `roles.id` / `permissions.id` are bigint autoincrement
  (`$table->id()` in `2026_07_12_181045_create_permission_tables.php`); only `users` and the
  `model_uuid` morph key are UUID. So:
  ```php
  public string $name = '';
  /** @var array<int, int> */
  public array $selectedPermissionIds = [];
  #[Locked] public ?int $editingRoleId = null;   // null => create mode
  #[Locked] public ?int $deletingRoleId = null;
  #[Locked] public bool $canGrantAdministratorLevel = false; // passthrough for story 0010
  ```
  Actions: `openCreateModal()`, `openEditModal(int $roleId)`, `saveRole()`, `confirmDeleteRole(int $roleId)`,
  `deleteRole()`, `closeModal()`/`closeDeleteModal()`. A `#[Computed] roles()` property backs the
  list, built through `Role::query()->selectable()->withCount('users')` so one query serves both the
  listing's holder badge and the delete-block check.
- `routes/roles.php` — **create** (shared with 0011; whichever lands first creates it). Mirrors
  `routes/settings.php`: an `['auth', 'verified']` group containing
  `Route::livewire('roles', Index::class)->middleware('can:roles.manage')->name('roles.index');`
- `routes/web.php` — **modify**. Add `require __DIR__.'/roles.php';` beside the existing
  `require __DIR__.'/settings.php';`.
- `app/Models/Role.php` — **consume, created by 0008 (closed 2026-08-18 — the class exists now)**. This
  story uses its `selectable()` scope and `withCount('users')`. It additionally registers a
  `static::deleting()` holder-count guard **alongside** 0008's guards — Laravel allows multiple listeners
  on one model event, so these are additive and must not be written as competing/overwriting closures.

  > **⚠ Register this guard inside 0008's existing `boot()`, not in a second registration point — and
  > read the two docs below before writing it.** 0008's Phase 4 security audit found and fixed two
  > non-obvious bugs in exactly this kind of guard, and a new one written from scratch can reintroduce
  > either. Both are documented:
  >
  > 1. **Registration ordering.** 0008's listeners are registered in an overridden
  >    `protected static function boot()` **before** `parent::boot()`, and that placement is the whole
  >    point: `HasPermissions::bootHasPermissions()` registers its *own* `deleting` listener inside
  >    `parent::boot()`, and it unconditionally detaches every `role_has_permissions` **and**
  >    `model_has_roles` row for the role. A guard registered in `booted()`, in a separate observer, or
  >    anywhere after `parent::boot()`, fires *after* that detach — and `Model::delete()` opens no
  >    transaction, so the detach persists: the `roles` row survives (a naive "the role still exists"
  >    assertion passes) while the role has silently lost all its permissions and all its holders. For a
  >    holder-count guard that is doubly perverse, since the very holders it counts are what the
  >    package's listener has just removed. Put this story's `deleting` closure in the **same** `boot()`
  >    method, alongside 0008's, so registration order stays explicit and reviewable in one place. See
  >    [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md#layer-1-registration-order-is-the-whole-point)
  >    (which shows the real `boot()` body, plus the `booted()` anti-pattern) and the mechanism overview
  >    in the same page's
  >    [Super Admin role's invariants](../../docs/architecture/authorization.md#the-super-admin-roles-invariants)
  >    section.
  > 2. **Reading the row's protected identity.** 0008's re-audit (finding R1) found a working bypass in a
  >    guard that read an in-memory attribute where it needed the *persisted* one, and that used `??` to
  >    fall back — which cannot distinguish "the column was never selected" from "the column is null".
  >    A holder-count guard reads a relation rather than a name, so it is not the identical bug, but it
  >    is the same class: **be explicit about what state you are reading and whether it is actually
  >    hydrated.** `$role->users()->exists()` issues a fresh query and is the safe form; `$role->users`
  >    (the cached relation, possibly loaded before the holders changed) and a `users_count` attribute
  >    carried over from a `withCount()` on the *listing* query are both stale-by-construction inside a
  >    `deleting` listener. The rule and its worked example are in
  >    [`docs/security/authorization-patterns.md`](../../docs/security/authorization-patterns.md#a-guard-that-reads-a-rows-protected-identity-must-distinguish-not-hydrated-from-hydrated-but-null).
  >
  > A test for this guard must assert the same thing 0008's does: after a refused delete, the
  > `model_has_roles` rows are **still there**, not merely that the `roles` row is.
- `config/permission.php` — **not modified by this story**; 0008 repoints `models.role`.
- `app/Concerns/RoleValidationRules.php` — **create**. Follows the existing `<Noun>ValidationRules`
  + `<noun>Rules()` pattern of `app/Concerns/ProfileValidationRules.php`:
  ```php
  protected function roleNameRules(?int $roleId = null): array
  {
      return ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($roleId)];
  }

  protected function rolePermissionRules(): array
  {
      return [
          'selectedPermissionIds' => ['array'],
          'selectedPermissionIds.*' => ['integer', Rule::exists('permissions', 'id')],
      ];
  }
  ```
  `Rule::exists('permissions', 'id')` on each element means a forged/nonexistent permission id is
  rejected by `validate()` and never reaches `syncPermissions()`.
- `tests/Feature/Roles/IndexTest.php` — **create** (backend-qa, Phase 3).
- **No migration.** All five permission tables already exist; the catalog rows come from 0002.
- **No `bootstrap/app.php` change** — see the gating section below.

**Technical approach (verified against installed package source, not assumed):**

- **Cascading permission changes are automatic, on two independent layers.** In
  `vendor/spatie/laravel-permission/src/Traits/HasPermissions.php`, `givePermissionTo()` calls
  `$this->forgetCachedPermissions()` at lines 450–452 and `revokePermissionTo()` at lines 509–511,
  both guarded by `if ($this instanceof Role)`; `syncPermissions()` (lines 476–494) is a
  detach/revoke step that ends by calling into `givePermissionTo()`. Independently,
  `Spatie\Permission\Models\Role` uses `RefreshesPermissionCache`, which flushes on the model's own
  `saved`/`deleted` Eloquent events. So `$role->syncPermissions($ids)` is self-flushing —
  **the component must not call `forgetCachedPermissions()` itself.** The cache
  (`spatie.permission.cache`, 24 h TTL) holds the whole role/permission map globally rather than
  per-user, so once flushed the next check by *any* user re-hydrates from the database. Caveat: a
  `User` instance already resolved in the same request keeps its loaded relations; capability must
  be re-checked on a freshly resolved model, which is what a subsequent request does anyway.
- **Hard-blocked deletion.** `deleteRole()` reads the holder count off the same
  `withCount('users')` query and, when greater than zero, adds a validation error naming the exact
  count and returns — there is **no** confirm-and-proceed branch in the method at all. Defense in
  depth: the `static::deleting()` guard on `App\Models\Role` throws whenever `$role->users()->exists()`,
  so the block holds for any future call site that bypasses the component.
- **Server-side gating — `can:` middleware, not Spatie's.** Two verified facts drive this:
  1. Spatie's `PermissionServiceProvider` registers only `Route::macro('role'|'permission'|'roleOrPermission')`,
     **not** middleware aliases, and `bootstrap/app.php`'s `withMiddleware()` is empty — so
     `'permission:roles.manage'` is not a valid middleware string today.
  2. More decisively: Livewire 4 does **not** re-run the full route middleware stack on component
     action requests. `Livewire\Mechanisms\PersistentMiddleware\PersistentMiddleware::$persistentMiddleware`
     (lines 16–25) is a hardcoded allowlist that includes `Illuminate\Auth\Middleware\Authorize`
     but **not** Spatie's `PermissionMiddleware`. Aliasing Spatie's middleware would therefore
     protect only the initial GET; every later `saveRole()`/`deleteRole()` click would run through
     zero permission middleware, silently.

  Spatie already registers each permission name as a Gate ability (`PermissionRegistrar::registerPermissions($gate)`),
  and Laravel 13 ships `'can' => Authorize::class` as a default alias, so
  `->middleware('can:roles.manage')` works with **zero** `bootstrap/app.php` setup and *is* persisted
  across Livewire action requests. Middleware alone is still not sufficient — `mount()` runs once
  per page load (Livewire hydrates from the snapshot afterwards) and the allowlist is an internal
  implementation detail, not a documented contract — so `saveRole()` and `deleteRole()` each also
  assert `abort_unless(Auth::user()->can('roles.manage'), 403);`, matching the `abort_unless` style
  already used in `app/Livewire/Settings/Security.php`. Both layers are required; neither suffices alone.
- **Super Admin exclusion.** Every listing/selector query goes through 0008's shared
  `Role::query()->selectable()` scope; this component never targets that role for edit or delete.
  0008's model-layer guards are the actual enforcement against a forged id — the scope is defense
  in depth.
- **Administrator-level toggle.** The component exposes `#[Locked] public bool $canGrantAdministratorLevel`,
  computed in `mount()` from whatever check **0010** defines, purely so 0011's view can render the
  toggle conditionally. `saveRole()` additionally refuses to include `roles.manage-administrators`
  in the sync payload when the flag is false, as a tamper check against a forged `wire:model`
  payload. The authorization *rule* is entirely 0010's and is not reimplemented here.
- **No conflict with 0004.** This story writes only to `roles` and `role_has_permissions`;
  `syncPermissions()` never touches `model_has_roles`. 0004's rule — requiring
  `roles.manage-administrators` to promote a user to `Administrator` — only *reads* the acting
  user's permissions and writes role *assignments*, so the two stories touch disjoint tables. The
  one shared object is the `roles.manage-administrators` permission row, created by 0002 and
  read-only from 0004's side.

## Tests to perform
All are Feature tests (`RefreshDatabase`, real DB) unless noted — this domain is almost entirely
DB-backed, so genuine no-DB unit tests are rare here.

- [ ] Integration test: creating a role persists exactly the selected permissions — assert the full
      sorted permission-name set, not a superset/subset.
- [ ] Integration test: a newly created role appears immediately in `Role::selectable()`.
- [ ] Integration test: a role created with zero permissions is a legal, inert state (0011 decision 3).
- [ ] Integration test: renaming a role leaves its permission id set identical (compare against the
      pre-rename set captured beforehand, not just a count).
- [ ] Integration test (cache invalidation — revoke): 3 holders, **warm the cache first** by asserting
      `hasPermissionTo()` is `true` on each holder, drive the change through the component (never
      `syncPermissions()` directly), then re-assert on **freshly resolved** users. Both steps matter:
      without the warm-up there is no stale cache to catch, and without re-fetching, stale in-memory
      relations produce a false pass regardless of the cache.
- [ ] Integration test (cache invalidation — grant): same design, asserting `false` before and `true` after.
- [ ] Integration test: an unaffected permission on the same role survives the edit (guards against
      "sync wipes everything").
- [ ] Integration test: editing one role does not affect an unrelated role's warm-cached holder.
- [ ] Integration test: deleting a role with zero holders removes it and leaves no orphaned
      `role_has_permissions` rows.
- [ ] Negative test: deleting a role with 3 holders is refused, the message contains `3`, the role
      still exists, and all 3 users still hold it.
- [ ] Edge case test: the 1-holder case is refused with a correct singular message.
- [ ] Negative test: `$role->delete()` called directly on a role with holders — bypassing the
      component entirely — is also blocked by the model-event guard.
- [ ] Negative test (validation dataset): blank name; exact duplicate name; case-only duplicate;
      surrounding-whitespace duplicate (0011 decision 2); a permission id absent from the catalog.
      Each persists nothing — and for an edit, the role's existing permission set is provably
      **unchanged**, so a rejected payload never partially applies.
- [ ] Negative test: a guest visiting `/roles` is redirected to sign-in.
- [ ] Negative test: an authenticated user without `roles.manage` visiting `/roles` gets 403.
- [ ] Happy-path counterpart: a user holding `roles.manage` gets 200 and the component mounts.
- [ ] Negative test: a user without `roles.manage` calling `saveRole()` directly on the component —
      bypassing `mount()` — is refused, **and** `assertDatabaseMissing` proves no side effect. The
      absent side effect, not the exception, is what proves the check runs on the action itself.
- [ ] Negative test: same shape for `deleteRole()`; the role still exists afterwards.
- [ ] Edge case test: `Role::query()->selectable()` omits exactly the Super Admin role when both it
      and other roles exist (Feature, not Unit — `tests/Unit/` gets no DB trait in this repo).
- [ ] Edge case test: targeting the Super Admin role by forged id in `saveRole()`/`deleteRole()` is
      refused. Assert the refusal only — 0008 owns the invariant's mechanism and messaging.

**Test-arrangement notes for Phase 3:**
- Spatie's `Role`/`Permission` have no factories in this repo. Arrange directly
  (`Permission::create([...])`, `Role::create([...])->syncPermissions([...])`), or via a shared Pest
  helper under `tests/Feature/Roles/` — see open question C about requesting real factories.
- **Do not** invoke 0002's full seeder to arrange; create minimal fixture rows so this suite stays
  decoupled from the catalog's exact contents. The one place the real string matters is the gate
  itself — use `roles.manage`.
- A `beforeEach` calling `app(PermissionRegistrar::class)->forgetCachedPermissions()` is **required**:
  `config/permission.php` uses the `default` store, which is `array` under `phpunit.xml`, and
  `RefreshDatabase` rolls back the DB without clearing it — so a previous test's cache can otherwise
  bleed in and corrupt the warm-cache steps above. 0002's task file flags the same constraint.

## Expected outcome
A signed-in administrator holding `roles.manage` can create, rename and delete custom roles and
toggle their per-module permissions, with changes taking effect for every holder on their next
request. A role with holders can never be deleted, and the refusal names the exact number of
holders. Everyone without the permission is refused server-side, on page load and on every action.
The Super Admin role is absent from every list and selector this component produces.

## Acceptance criteria
- [ ] The component creates, renames and deletes custom roles and syncs their permissions via
      Spatie's `syncPermissions()`.
- [ ] A permission change on a role takes effect for all of its holders with no manual cache flush,
      covered by a test that would fail against a stale permission cache.
- [ ] A role with one or more holders cannot be deleted — hard block, no confirm-and-proceed path —
      and the error message states the exact holder count.
- [ ] The block is enforced by a model-event guard as well as in the component, additively with
      0008's guards on the same model.
- [ ] Access requires `roles.manage`, enforced by `can:` route middleware **and** by an explicit
      check inside every mutating component method.
- [ ] Every role listing/selector query in this component goes through 0008's `selectable()` scope.
- [ ] Role name is required, trimmed and unique; permission ids are validated against the catalog,
      so a forged id never reaches `syncPermissions()`.
- [ ] The component exposes 0010's administrator-level grant flag and refuses to sync
      `roles.manage-administrators` when it is false, implementing none of 0010's rule itself.
- [ ] No migration and no `bootstrap/app.php` change are introduced by this story.
- [ ] Pint clean and Larastan level 7 clean.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met

## Open questions
Resolved during this debate, recorded so they are not reopened: the route (`routes/roles.php`,
`/roles`, `roles.index`), the component class (`App\Livewire\Roles\Index`, fixed by 0011), the
gating mechanism (`can:roles.manage` + per-method `abort_unless`, no alias registration), and the
scope name (0008's `selectable()`, not a synonym). The following remain open and should be answered
before Phase 3 — none block Phase 2 INVEST review.

**A. Message language for the holder-count block** — literal English now, or `lang/` keys?
- **A1 (recommended)** — translation keys from the start: PRD assumption 14 requires an admin UI
  Spanish/English switcher (Epic 5), and retrofitting keys across every module later costs far more
  than adding them now. Tests then assert via the key with a count parameter, which also keeps them
  stable across the decision.
- A2 — literal strings now, extracted when Epic 5 lands.

**B. Singular/plural grammar for the 1-holder message** — the PRD says only "states how many users
hold it". Recommend the tests assert on the numeral and the non-zero branch rather than an exact
grammatical string until copy is confirmed; the wording itself is 0011's copy decision.

**C. Shared `RoleFactory` / `PermissionFactory`** — stories 0002, 0008, 0009 and 0010 will each
hand-roll near-identical `Role::create(...)->syncPermissions(...)` arrangement code.
- **C1 (recommended)** — ask `database-expert` to add thin `database/factories/RoleFactory.php` and
  `PermissionFactory.php` following the existing `UserFactory` pattern, once the first of these
  stories is scheduled, so all four suites share one definition.
- C2 — keep it inline / in a shared Pest helper under `tests/Feature/Roles/`; no app-code change,
  but four divergent copies.

**D. Case-insensitive uniqueness depends on live column collation.** MySQL 8.4's default
`utf8mb4_0900_ai_ci` makes `Rule::unique()` case-insensitive for free, but collation can be
overridden per table/connection. Verify the actual `roles.name` collation before Phase 3; if it is
case-sensitive, add an explicit lowercase comparison rather than relying on the driver.

**E. Who tests the role selector?** "Becomes selectable when assigning a role to a user" points at
the Users screen (0004/0006), not this component.
- **E1 (recommended)** — this story proves the `selectable()` scope is correct; each consumer tests its
  own use of it. Lowest coupling, matches this story never redefining siblings' concerns.
- E2 — this story also asserts a component-level selector list, in case 0004/0006 land later. Likely
  redundant once they exist.
- Either way, `code-reviewer` should check at Phase 5 that 0004/0006 reuse `selectable()` rather
  than reinventing a Super Admin filter — that is where a silent gap could open.
