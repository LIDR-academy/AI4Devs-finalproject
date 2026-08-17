# [0008] Super Admin role invariants — categorically undeletable, uneditable, non-downgradable, invisible

## Description
Enforce, at the model/policy/authorization layer rather than by hiding controls in the UI, that the
**Super Admin** role can never be deleted, renamed, or have its permissions changed through the
application — including by a crafted request that never touches the dashboard. Also provide the one
shared query mechanism that every roles list and role selector in the app must use, so the Super
Admin role is never returned to the frontend. This story does **not** seed the Super Admin role
(story 0002) and does **not** build the roles CRUD screens (stories 0009/0011); it builds the
guarantees those code paths cannot violate.

## Type
backend | includes database-expert: **no**

## Gherkin
```gherkin
Feature: Super Admin role invariants

  # --- Immutability: deletion ---

  Scenario: Deleting the Super Admin role from the dashboard is refused
    Given a role administrator holding the "manage roles & permissions" permission
    When they attempt to delete the Super Admin role
    Then the attempt is refused server-side and the Super Admin role still exists

  Scenario: Deleting the Super Admin role outside the dashboard is refused
    Given a role administrator whose request bypasses the dashboard entirely
    When they attempt to delete the Super Admin role directly
    Then the attempt is refused server-side and the Super Admin role still exists

  Scenario: The Super Admin cannot delete their own role
    Given a signed-in Super Admin
    When they attempt to delete the Super Admin role
    Then the attempt is refused server-side and the Super Admin role still exists

  # --- Immutability: edit and downgrade ---

  Scenario: Renaming the Super Admin role is refused
    Given a role administrator holding the "manage roles & permissions" permission
    When they attempt to rename the Super Admin role
    Then the attempt is refused server-side and the role's name is unchanged

  Scenario: Revoking one of the Super Admin role's permissions is refused
    Given a role administrator holding the "manage roles & permissions" permission
    When they attempt to revoke a single permission from the Super Admin role
    Then the attempt is refused server-side and the role's permissions are unchanged

  Scenario: Stripping the Super Admin role of every permission is refused
    Given a role administrator holding the "manage roles & permissions" permission
    When they attempt to replace the Super Admin role's permissions with an empty set
    Then the attempt is refused server-side and the role's permissions are unchanged

  Scenario: Granting the Super Admin role an additional permission is refused
    Given a role administrator holding the "manage roles & permissions" permission
    When they attempt to grant an extra permission to the Super Admin role
    Then the attempt is refused server-side, because the role is categorically unmodifiable
      and not merely protected against downgrades

  Scenario: The Super Admin cannot edit their own role
    Given a signed-in Super Admin
    When they attempt to change the Super Admin role's permissions
    Then the attempt is refused server-side and the role's permissions are unchanged

  Scenario: Retargeting an edit meant for another role at the Super Admin role is refused
    Given a role administrator editing a custom role "Blog Editor"
    When they retarget that edit at the Super Admin role by forging its identifier
    Then the attempt is refused server-side and neither the Super Admin role
      nor "Blog Editor" is modified

  # --- Invisibility ---

  Scenario: The Super Admin role is absent from the roles list
    Given a role administrator using the dashboard
    When they view the roles list
    Then the Super Admin role is not among the roles returned

  Scenario: The Super Admin role is absent from the user role selector
    Given a user administrator assigning a role to a user
    When they open the role selector
    Then the Super Admin role is not among the roles offered

  Scenario: A custom role whose name merely resembles the Super Admin role stays visible
    Given a user administrator, with a custom role named "Super Admin Assistant"
    When they view the roles list
    Then "Super Admin Assistant" is among the roles returned,
      because only the exact Super Admin role is hidden

  # --- The guard stays narrow (must not over-block) ---

  Scenario: An ordinary role remains deletable
    Given a role administrator, with a custom role "Blog Editor" held by no user
    When they delete the "Blog Editor" role
    Then the role is deleted

  Scenario: An ordinary role remains editable
    Given a role administrator, with a custom role "Blog Editor"
    When they revoke a permission from the "Blog Editor" role
    Then the role's permissions are updated

  Scenario: Role management is unaffected before the Super Admin role has been seeded
    Given a role administrator working on a fresh installation
      where the Super Admin role has not been seeded yet
    When they view the roles list
    Then the list is returned without error, and no role is wrongly withheld or blocked

  # --- What the invisibility mechanism must not break ---

  Scenario: The Super Admin role is still assignable outside the dashboard
    Given a database administrator running the Super Admin seeder
    When they assign the Super Admin role to a user by its name
    Then the role is resolved and the user holds it afterwards

  Scenario: A Super Admin's own authorization is unaffected by the role being hidden
    Given a signed-in Super Admin
    When their permission to manage any module is checked
    Then the check succeeds, because hiding the role from lists does not hide it
      from authorization
```

## Files to create/modify

The mechanism below was agreed in the Phase 1 debate and is deliberately spelled out so Phase 3 has
nothing left to interpret. Two verified facts about `spatie/laravel-permission` v8 drive it, and both
were checked against `vendor/` during the debate:

- `Role::findByName()` / `findById()` / `findOrCreate()` run through `static::query()`, and
  `PermissionRegistrar::getPermissionsWithRoles()` hydrates the permission cache with
  `$permissionClass::select()->with('roles')->get()` — an **eager load of the `roles` relation**.
  A *global* scope on the role model would therefore be inherited by all three, plus by `User`'s
  `roles()` relation, and would break the seeder, `assignRole('Super Admin')`, the permission cache,
  and a Super Admin's own `hasRole()`. **A global scope is rejected for this reason.**
- `givePermissionTo()` / `syncPermissions()` / `revokePermissionTo()` come from the `HasPermissions`
  trait and act on the `role_has_permissions` pivot via detach/sync — **no `updating`/`saving` model
  event fires on the role row.** A model-event guard alone would silently miss every permission
  downgrade, so those three methods must be overridden.

Also verified: `roles` already carries a `unique(['name', 'guard_name'])` index
(`database/migrations/2026_07_12_181045_create_permission_tables.php` line 50), so "exactly one Super
Admin role" is already guaranteed at the database level by name — which is what makes name-based
identification safe and removes any need for a new flag column (and therefore for a migration or
`database-expert` in this story).

- `app/Models/Role.php` (**new**) — `App\Models\Role extends Spatie\Permission\Models\Role`. It is the
  single home for all four mechanisms, because a scope, model events, and method overrides all require
  a subclass:
  - `scopeSelectable(Builder $query): Builder` — the **shared local scope** this story owns. Every
    roles-list and role-selector query in the app must call it (`Role::query()->selectable()`), and
    stories 0009/0011 consume it rather than re-filtering.
  - `booted()` registering `static::deleting(...)` and `static::updating(...)` guards that throw when
    the row is the Super Admin role. This is the layer that catches a code path which never calls
    `Gate`/`authorize()`.
  - Overrides of `givePermissionTo()`, `syncPermissions()`, `revokePermissionTo()` that throw for the
    Super Admin role — mandatory per the pivot-mutation fact above.
- `app/Enums/RoleName.php` (**new** — see [Open questions](#open-questions) Q1) — backed string enum of
  well-known role names, `SuperAdmin = 'Super Admin'`, so identification is one typed reference rather
  than a string literal repeated across 0002/0009/0011. Enum key is TitleCase per project `CLAUDE.md`.
- `app/Exceptions/ImmutableRoleException.php` (**new** — see Q1) — `extends RuntimeException` with a
  `render()` method returning **403**, so it converges on the same status the policy produces.
- `app/Policies/RolePolicy.php` (**new** — see Q1; scaffold with
  `php artisan make:policy RolePolicy --model=Role --no-interaction`) — `update()` and `delete()` deny
  for the Super Admin role. This is the layer 0009/0011 call via `authorize()`, and where the UI-facing
  403 originates.
- `app/Providers/AppServiceProvider.php` (**modify**) — register
  `Gate::policy(Role::class, RolePolicy::class);` in `boot()`. Laravel's convention-based discovery
  would likely resolve it anyway; registering explicitly matches this file's otherwise-explicit style.
- `config/permission.php` (**modify**) — repoint `'models' => ['role' => App\Models\Role::class]` so the
  package resolves the app-level model everywhere (one line).

Confirmed **not** needed, recorded so reviewers don't re-open them: no change to `bootstrap/app.php`
(story **0002** registers the `role` / `permission` / `role_or_permission` middleware aliases in its
`withMiddleware()` closure — *this* story adds nothing to it, since route gating belongs to
0009/0011); no `app/Observers/`
class (the two guards live in `Role::booted()`, mirroring the package's own
`HasPermissions::bootHasPermissions()`); no migration and no new column.

## Tests to perform
- [ ] Happy path / narrowness: a custom role with no holders is deletable; a custom role can be renamed; permissions can be added to, revoked from, and reduced to zero on a custom role; a custom role appears in both the list and the selector query. (Proves the guard is not "nobody can edit any role".)
- [ ] Deletion, negative: the application's delete path against the Super Admin role is rejected and the row survives; a direct `$role->delete()` on the Super Admin model instance is rejected and the row survives.
- [ ] Edit, negative: renaming is rejected; changing `guard_name` is rejected; `revokePermissionTo()` on one permission is rejected; `syncPermissions([])` is rejected; `syncPermissions()` with a strict subset is rejected; `givePermissionTo()` (a superset) is rejected. Assert the stored name/permission set is unchanged after each.
- [ ] Bypass, negative: a user holding the broadest role-management permission is rejected identically to an unprivileged user; the Super Admin user themselves is rejected (the one case that must *not* follow the Super Admin's permission-check bypass); an identifier-forging attempt aimed at the Super Admin role from an action meant for another role is rejected **and** leaves the other role untouched.
- [ ] Invisibility: the roles-list query and the role-selector query never return the Super Admin role, under any pagination/filter parameters; a custom role named "Super Admin Assistant" **is** returned by both (rules out substring/fuzzy matching).
- [ ] Regression — the invisibility mechanism must not break authorization: `$user->assignRole('Super Admin')` still resolves the role and `hasRole()` returns true; a Super Admin user's `hasPermissionTo()` still resolves after the permission cache is flushed and re-hydrated; the story-0002 seeder's create-if-missing call still locates or creates the row.
- [ ] Edge — Super Admin row absent (fresh database, before 0002's seeder has run): the list query, the selector query, and delete/edit of an unrelated role all complete without error, and nothing is wrongly blocked (rules out a guard that fails closed when its reference row is missing).
- [ ] Placement: all of the above touch `roles` / `role_has_permissions` rows, so they belong in `tests/Feature/` with `RefreshDatabase`, not `tests/Unit/`.

## Expected outcome
Once implemented, the Super Admin role is a fixed point of the system: every application code path
that goes through the Eloquent role model — dashboard action, Livewire component, console command,
or a crafted request that skips the UI — is refused with a 403 when it tries to delete, rename, or
change that role's permissions, whoever the actor is (the Super Admin included). Every roles list and
role selector built on the shared `selectable()` scope silently omits it, while seeding, role
assignment by name, the permission cache, and a Super Admin's own authorization checks all keep
working untouched. Ordinary custom roles remain fully manageable.

## Acceptance criteria
- [ ] The Super Admin role cannot be deleted through any Eloquent-model code path — refused server-side, with the row still present afterwards.
- [ ] The Super Admin role cannot be renamed, have its `guard_name` changed, or have its permission set altered in **any** direction (reduced, emptied, or extended) — "uneditable" is enforced categorically, not only against downgrades.
- [ ] The refusal is categorical, not permission-based: it holds for an unprivileged user, for the holder of the broadest role-management permission, and for the Super Admin themselves.
- [ ] Permission-revocation attempts are caught even though they bypass Eloquent model events, via overrides of `givePermissionTo()` / `syncPermissions()` / `revokePermissionTo()` on `App\Models\Role`.
- [ ] Both layers are present and independently effective: `RolePolicy` for code paths that call `authorize()`, and the model-level guards for code paths that do not.
- [ ] A single shared local scope (`Role::query()->selectable()`) exists and excludes exactly the Super Admin role; no global scope is introduced.
- [ ] The Super Admin role is identified by the `App\Enums\RoleName::SuperAdmin` enum, never by a repeated string literal, and matching is exact (a role merely containing "Super Admin" in its name is unaffected).
- [ ] Seeding, `assignRole()` by name, permission-cache hydration, and a Super Admin's own `hasRole()`/`hasPermissionTo()` are all provably unaffected by the invisibility mechanism.
- [ ] With no Super Admin role row present, nothing crashes and nothing is wrongly blocked (the guard fails open, not closed).
- [ ] `config/permission.php` resolves `models.role` to `App\Models\Role`.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper) — `docs/architecture/authorization.md` gains the real Super
      Admin invariant mechanism, and `docs/conventions/base-standards.md`'s directory-structure section
      gains `app/Exceptions/` if it is approved in Q1 (`app/Enums/` and `app/Policies/` are already
      documented by stories 0003 and 0004 respectively).
- [ ] Acceptance criteria met
- [ ] **Known limitation — query-builder mass mutations are not covered (must be recorded, not
      silently accepted):** `Role::where(...)->delete()`, `Role::query()->delete()`, and any raw
      `DB::table('roles')->delete()/->update()` bypass Eloquent model events entirely, so neither the
      policy nor the model guards intercept them. No application-layer mechanism in this story closes
      that gap; only a database-level trigger would, and that would require a migration and
      `database-expert`, changing this story's type. Code review is the backstop. See Q3.
- [ ] **Known limitation — the local scope is a convention, not an enforcement:** a future
      `Role::all()` written without `->selectable()` would leak the Super Admin role into a list. This
      is the accepted cost of rejecting a global scope (which would have broken the seeder, role
      assignment, the permission cache, and the Super Admin's own authorization). Mitigated by naming
      the scope unambiguously here and by Phase 5 code review.
- [ ] **Follow-up from story 0004's Phase 4 security audit (findings F2/F3):** `App\Livewire\Users\Index`
      and `App\Policies\UserPolicy` currently identify the `Administrator` and `Super Admin` roles by
      literal name (`->whereNot('name', 'Super Admin')`, `hasRole('Administrator', 'web')`), and the
      Administrator-level guard (`roles.manage-administrators`) is enforced only inside the Livewire
      component, not in `App\Actions\Users\CreateUser`/`UpdateUser` themselves. Whoever implements this
      story should evaluate centralising both concerns behind a stable, non-name-based identifier (e.g.
      a `Role::isAdministratorLevel()` concept or a flag column) rather than leaving name-matching as
      the mechanism 0004 introduced — a role rename would silently disarm every guard that matches on
      it. If the guard moves to a shared location, `Index`, `CreateUser` and `UpdateUser` should all
      call it, not just the component.

## Open questions

Per [`docs/contracts.md`](../../docs/contracts.md)'s Uncertainty Handling Rule, these need a human
answer before Phase 3 begins. None of them changes the scenarios or acceptance criteria above — they
are placement and depth decisions.

**Q1 — May Phase 3 create `app/Enums/`, `app/Policies/`, and `app/Exceptions/`?**

> **Partly answered by the renumbering.** Story **0003** now creates `app/Enums/` (for
> `App\Enums\UserStatus`) and story **0004** creates `app/Policies/` (for `App\Policies\UserPolicy`),
> each with the corresponding `docs/conventions/base-standards.md` line in their own Phase 6. Both
> are numbered ahead of this story, so by the time it runs those two directories already exist and
> are documented. **Only `app/Exceptions/` remains genuinely new here.** The question below is
> retained because the *approval* is still the human's to give, but its scope has narrowed to one
> folder.

None of the three existed when this story was written, and project `CLAUDE.md` says "don't create
new base folders without approval", while `docs/conventions/base-standards.md`'s directory listing
does not mention them.
- **(recommended)** Create all three. They are stock Laravel locations produced by
  `php artisan make:enum` / `make:policy` / `make:exception`, so this follows the artisan-first
  convention rather than inventing structure, and each holds a genuinely distinct concern.
- Alternative: avoid new folders by putting the name constant on `App\Models\Role` as a class constant
  and throwing a bare `RuntimeException`. Cheaper, but reintroduces a magic string, loses the typed
  enum that 0002/0009/0011 would share, and still needs `app/Policies/` for the policy.

**Q2 — Confirm that blocking permission *additions* is intended.** The PRD's scenario title says
"cannot be edited **or downgraded**", but its prose and acceptance criterion say "categorically
undeletable, **uneditable**, and cannot be downgraded", and the Then clause says "categorically
unmodifiable".
- **(recommended)** Block additions too, as specified in the scenarios above. It matches the stronger
  wording, and since the Super Admin bypasses permission checks entirely, granting it permissions is
  inert anyway — so blocking costs nothing and removes a whole class of edge cases.
- Alternative: allow additions, block only renames and reductions. Only worth choosing if some future
  flow genuinely needs to attach permissions to the Super Admin role.

**Q3 — How much depth is wanted against query-builder mass deletes?**
- **(recommended)** Accept the limitation as documented in the DoD, and rely on code review. Keeps
  this story backend-only and Small per INVEST; the attack requires code already inside the
  application writing a raw mass delete, not an external request.
- Alternative: add a database-level trigger or a foreign-key/CHECK-based guard. Genuinely closes the
  gap, but requires a migration and pulls `database-expert` in, changing this story's type — better
  raised as a separate follow-up story if wanted.

**Q4 — Constraint this story imposes on story 0002, for confirmation.** The `updating` guard blocks
edits to the Super Admin row, so 0002's seeder must be **create-if-missing** (`firstOrCreate`-style),
never `updateOrCreate`, and must not sync permissions onto the role. This follows from the PRD's own
"the Super Admin bypasses permission checks entirely" (so the role needs no permission rows at all),
but it is a real cross-story constraint and should be confirmed rather than assumed.
