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

**Which name counts as "the Super Admin role" — one resolution path, not two.** The application already
has an authoritative answer and this story must reuse it rather than introduce a second one:
[`config/auth.php`](../../../config/auth.php) line 129 holds `'super_admin' => ['role' => 'Super Admin', …]`,
and [`App\Providers\AppServiceProvider::configureAuthorization()`](../../../app/Providers/AppServiceProvider.php)
(line 83-85) reads exactly that key to decide who bypasses every permission check:

```php
$superAdminRoleName = config('auth.super_admin.role', 'Super Admin') ?? 'Super Admin';

return $user->hasRole($superAdminRoleName, 'web') ? true : null;
```

If this story identified the protected/hidden role independently — by comparing a row's name against
`App\Enums\RoleName::SuperAdmin` directly — then overriding the config value in any environment would
silently split the two: the role that bypasses every permission check would stop being the role that is
undeletable, uneditable and hidden. That is a real privilege-escalation-shaped divergence, not a
theoretical one, and it already exists **three times over** before this story lands: the `Gate::before`
bypass reads config (`app/Providers/AppServiceProvider.php` line 83), while
`database/seeders/RolePermissionSeeder.php` line 49, `app/Livewire/Users/Index.php` line 255 and
`app/Concerns/UserValidationRules.php` line 24 each hardcode the literal independently. The last of
those is the sharpest case, and it is a *security* boundary rather than a cosmetic one: under an
overridden `config('auth.super_admin.role')`, the `roleRules()` `Rule::exists(...)` constraint would go
on excluding a role literally named `'Super Admin'` (by then an ordinary role) while **permitting** a
forged submission to assign the real, config-resolved Super Admin role — precisely the divergence this
story exists to close.

So, for this story: **`config('auth.super_admin.role')` is authoritative everywhere**, and
`App\Enums\RoleName::SuperAdmin->value` becomes that key's **compiled-in default value only** — the one
place the literal string is written — never a second identity check. Every guard, the `selectable()`
scope, the policy and the seeder resolve the name the same way `configureAuthorization()` already does.

**One resolution path means one *implementation*, not four copies of the same expression.** Phase 3 adds
a single **public static** method on `App\Models\Role` and every mechanism calls it:

```php
// app/Models/Role.php
public static function superAdminName(): string
{
    return config('auth.super_admin.role', RoleName::SuperAdmin->value) ?? RoleName::SuperAdmin->value;
}
```

Two things about this signature are load-bearing and must not be "simplified":

- **The `??` fallback is mandatory, not redundant.** `config($key, $default)` delegates to `Arr::get()`,
  whose `Arr::exists()` is `array_key_exists()` — so the default substitutes only for a **missing** key,
  while a key that is *present but `null`* (`'role' => env('SUPER_ADMIN_ROLE')` with the env var unset, a
  `bootstrap/cache/config.php` built before the block existed, or a test doing
  `config(['auth.super_admin.role' => null])`) returns `null`. This repo already documents the rule with
  this exact config key as its worked example —
  [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#read-the-super-admin-role-name-with-a-literal-default),
  which states the correct form outright and says "Do not 'simplify' this to one of the two" — and the
  already-shipped `Gate::before` bypass at `app/Providers/AppServiceProvider.php:83` carries both
  fallbacks for exactly this reason. Dropping the `??` here would recreate the divergence this story
  exists to close, in its worst shape: the `Gate::before` bypass would still resolve `'Super Admin'` and
  grant the role its bypass, while the guards, scope, policy and seeder all resolved `null` and therefore
  protected, hid and seeded **nothing**.
- **`public`, not `private`.** `RolePolicy` and `RolePermissionSeeder` are separate classes and must call
  the same implementation; a private helper would force them to re-derive the config read independently,
  which is the duplication this method exists to remove. `static`, because the policy and the seeder need
  it without a `Role` instance in hand.

The read happens **inside the method body**, i.e. at call time (query time, guard time, policy time) —
never in `__construct()`, a property initialiser, or any other place that could run before the config is
loaded or before `config/permission.php`'s `models.role` binding resolves. A static method called on
demand has no such ordering hazard.

- `config/auth.php` (**modify**) — change `'super_admin' => ['role' => …]`'s default from the bare
  string `'Super Admin'` to `App\Enums\RoleName::SuperAdmin->value`, so the literal lives in exactly one
  place while config resolution stays what everything reads at runtime. Behaviour is unchanged (same
  value); what changes is that the enum and the config default can no longer drift apart.
- `app/Models/Role.php` (**new**) — `App\Models\Role extends Spatie\Permission\Models\Role`. It is the
  single home for all four mechanisms, because a scope, model events, and method overrides all require
  a subclass. It also carries **`public static function superAdminName(): string`** — the single
  implementation of "which name is the Super Admin role?", defined verbatim in the resolution paragraph
  above (`config(...) ?? RoleName::SuperAdmin->value`, both fallbacks). **Every one of the four
  mechanisms answers "is this the Super Admin role?" by calling `self::superAdminName()`** — never by
  re-writing the `config()` expression inline, and never by comparing against `RoleName::SuperAdmin`
  directly — so they cannot drift from one another or from `AppServiceProvider::configureAuthorization()`:
  - `scopeSelectable(Builder $query): Builder` — the **shared local scope** this story owns. Every
    roles-list and role-selector query in the app must call it (`Role::query()->selectable()`), and
    stories 0009/0011 consume it rather than re-filtering. It excludes `self::superAdminName()`, with an
    exact match (`whereNot('name', self::superAdminName())`), never a `LIKE`. The name is resolved when
    the scope runs, i.e. at query-build time — not captured at boot or construction.
  - **A `deleting` / `updating` guard that throws for the Super Admin role, registered so that it runs
    *before* the package's own `deleting` listener.** This is the layer that catches a code path which
    never calls `Gate`/`authorize()`. The registration point is load-bearing and **must not** be
    `booted()` — see the boxed note below.

  - Overrides of `givePermissionTo()`, `syncPermissions()`, `revokePermissionTo()` that throw for the
    Super Admin role — mandatory per the pivot-mutation fact above.

  > **Registration point — `booted()` is wrong here, and it is not a style preference.** Verified
  > against vendor source: `Spatie\Permission\Traits\HasPermissions::bootHasPermissions()`
  > (`vendor/spatie/laravel-permission/src/Traits/HasPermissions.php:34`) registers its **own**
  > `static::deleting(...)` listener, and trait boots run inside `Model::boot()` → `bootTraits()`
  > (`vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php:375-377`), which
  > `bootIfNotBooted()` calls **before** `static::booted()`. `fireModelEvent('deleting')` dispatches
  > with `until` and halts on the first listener returning non-null, **in registration order**
  > (`.../Concerns/HasEvents.php:205`). Spatie's listener returns `null`, so it does not halt — it
  > runs to completion, detaching every `role_has_permissions` row **and** every `model_has_roles` row
  > for the role. A guard registered in `booted()` would therefore fire *after* that detach and throw
  > only then; since `Model::delete()` opens no transaction, the detach **persists**. Net effect: the
  > `roles` row survives (so a naive "the role still exists" assertion passes) while the Super Admin
  > role has silently lost all its permission and user assignments — the exact destruction this story
  > exists to prevent, reached through the very delete path meant to be blocked.
  >
  > Phase 3 picks **one** of these two — either is acceptable, `booted()` is not:
  > 1. Override `protected static function boot(): void` and register `static::deleting(...)` /
  >    `static::updating(...)` **before** calling `parent::boot()`, so this story's guard is registered
  >    ahead of `bootHasPermissions()`'s listener and halts first.
  > 2. Override `public function delete()` on `App\Models\Role` to throw for the Super Admin role
  >    before ever calling `parent::delete()`, sidestepping event ordering entirely. (The `updating`
  >    guard is still needed for renames/`guard_name`, and can stay wherever option 1 places it.)
  >
  > Whichever is chosen, the proof is a test asserting that a refused delete leaves the
  > `role_has_permissions` **and** `model_has_roles` rows for the Super Admin role intact — not merely
  > that the `roles` row is still there. See [Tests to perform](#tests-to-perform).
- `app/Enums/RoleName.php` (**new** — see [Open questions](#open-questions) Q1) — backed string enum of
  well-known role names, `SuperAdmin = 'Super Admin'`. Enum key is TitleCase per project `CLAUDE.md`.
  **Its role in this story is narrow and worth stating precisely:** it is the one place the literal
  string is written, and therefore **both** fallbacks inside `Role::superAdminName()` (`config()`'s
  default *and* the `??` right-hand side) plus the value `config/auth.php` itself compiles in. It is
  *not* the identity check — no guard, scope or policy compares a role row against it directly (see the
  resolution paragraph above).
- `app/Exceptions/ImmutableRoleException.php` (**new** — see Q1) — `extends RuntimeException` with a
  `render()` method returning **403**, so it converges on the same status the policy produces.
- `app/Policies/RolePolicy.php` (**new** — see Q1; scaffold with
  `php artisan make:policy RolePolicy --model=Role --no-interaction`) — `update()` and `delete()` deny
  for the Super Admin role, identified by calling **`App\Models\Role::superAdminName()`** like every
  other guard (this is why that method is `public static` rather than a private model helper — the
  policy is a separate class and must not re-derive the config read). This is the layer 0009/0011 call
  via `authorize()`, and where the UI-facing 403 originates.

  **No `Gate::policy()` registration, and no `AppServiceProvider` change for the policy at all.**
  `App\Policies\RolePolicy` binds to `App\Models\Role` by Laravel 13's auto-discovery, which is this
  repo's documented, registration-free convention
  ([base-standards.md](../../../docs/conventions/base-standards.md#directory-structure),
  [naming.md](../../../docs/conventions/naming.md#classes)). An earlier draft of this story kept an
  explicit `Gate::policy(Role::class, RolePolicy::class)` line, justified by the claim that code paths
  still holding a `Spatie\Permission\Models\Role` instance would otherwise not resolve the policy. **The
  conclusion — drop the registration — is right, but that justification is not, so don't reinstate the
  line on the strength of it.** `Gate::getPolicyFor()` *does* walk the inheritance chain
  (`vendor/laravel/framework/src/Illuminate/Auth/Access/Gate.php:679-683` loops the registered policies
  testing `is_subclass_of($class, $expected)`). The walk simply doesn't help here: it matches only a
  class that is a **subclass of** an already-registered one, and `Spatie\Permission\Models\Role` is the
  **parent** of `App\Models\Role`, not a child — parent-of does not satisfy `is_subclass_of`. So
  `Gate::policy(App\Models\Role::class, …)` binds `App\Models\Role` and nothing else, and a raw
  `Spatie\Permission\Models\Role` instance goes unmatched with or without the registration
  (`guessPolicyName('Spatie\Permission\Models\Role')` does not reach any existing class either).
  The raw-Spatie-instance gap is closed by the import convention and its `arch()` test below, not by a
  registration. Follow the documented convention; nothing for `docs-keeper` to reconcile.
- `config/permission.php` (**modify**) — repoint `'models' => ['role' => App\Models\Role::class]` so the
  package resolves the app-level model everywhere (one line).
- `app/Livewire/Users/Index.php` (**modify**) — this file is the reason repointing `config/permission.php`
  is **not** sufficient on its own. Today it does `use Spatie\Permission\Models\Role;` (line 19) and its
  `roleOptions()` (line 251) filters with a hardcoded `->whereNot('name', 'Super Admin')` (line 255).
  Repointing `models.role` changes only what the *package* resolves internally; it does not touch a
  direct import. Swap the import to `App\Models\Role` and replace `->whereNot('name', 'Super Admin')`
  with `->selectable()`. Without this, the Gherkin scenario "The Super Admin role is absent from the user
  role selector" is not implemented by anything this story builds, and the acceptance criterion about
  resolving the role's identity through `config('auth.super_admin.role')` stays false in one of the
  places in the repo where that literal actually lives.
- `app/Concerns/UserValidationRules.php` (**modify**) — the **server-side half** of the same role-selector
  scenario, and the one that actually matters. `roleRules()` (line 24) validates the submitted role id
  with `Rule::exists('roles', 'id')->where('guard_name', 'web')->whereNot('name', 'Super Admin')`, and its
  own docblock states that this exclusion — not the dropdown — is what stops a forged submission from
  assigning the Super Admin role; `roleOptions()` above is only the cosmetic half. Replace the literal
  with `Role::superAdminName()` (importing `App\Models\Role`, per the one-role-model convention below), so
  the rule excludes whichever role the `Gate::before` bypass actually grants. Left as-is, an overridden
  `config('auth.super_admin.role')` makes this rule exclude an ordinary role while permitting assignment of
  the real Super Admin role — a privilege-escalation-shaped divergence, and the most consequential of the
  three literal sites this story closes.
- `app/Providers/AppServiceProvider.php` (**modify**, one line) — `configureAuthorization()`'s
  `Gate::before` bypass (line 83) currently inlines its own copy of the name resolution:
  `config('auth.super_admin.role', 'Super Admin') ?? 'Super Admin'`. That expression is **equivalent
  today** to `Role::superAdminName()` — including both fallbacks, which the F6 comment above it already
  explains — so this is not a behaviour change; it is the removal of a second, independent implementation
  of the resolution logic `Role::superAdminName()` now centralises. Leaving both in place directly
  contradicts this story's own premise (*one resolution path, not several copies*): a future change to one
  would silently not reach the other, and the two that drift would be the bypass and the guards. Replace
  the two lines with `return $user->hasRole(Role::superAdminName(), 'web') ? true : null;`, keeping the F5
  explicit-`'web'`-guard and F7 `instanceof` comments and behaviour intact, and retaining a pointer to
  where the fallbacks now live. **No ordering hazard**: the closure body runs at check time, not at
  provider-boot time, exactly like every other `superAdminName()` call site. This change is unrelated to
  policy registration — see the `RolePolicy` bullet above, which still stands: `App\Policies\RolePolicy`
  is auto-discovered and **no** `Gate::policy()` line is added here or anywhere.
- `database/seeders/RolePermissionSeeder.php` (**modify**) — two changes. First, swap
  `use Spatie\Permission\Models\Role;` (line 12) to `App\Models\Role`, required by the import convention
  below. Second, resolve the role's name rather than hardcoding it: line 49's
  `Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web'])` becomes
  `['name' => Role::superAdminName(), 'guard_name' => 'web']` — the same single implementation the
  guards, the scope and the policy call, not a re-written `config()` expression — closing the second of
  the two independent definitions of "which role is Super Admin". (Leave line
  204's `'name' => 'Super Admin'` alone — that is the provisioned *user's* display name, not a role
  identity.) Verified the swap does **not** conflict with the Q4 decision: the call is a create or a
  plain lookup, never an update, and `syncPermissions()` is called only on `$administratorRole`, so
  neither the `updating` guard nor the permission-mutation overrides can fire on the Super Admin role.

**Convention this story establishes — one role model class in application code.** Every application
call site imports `App\Models\Role`; **no application file may import `Spatie\Permission\Models\Role`
directly**, the single legitimate exception being `config/permission.php`'s own `models.role` binding
(which is where the two are deliberately joined). The reason is not tidiness: `App\Models\Role` and
`Spatie\Permission\Models\Role` are two different Eloquent classes pointing at the *same* `roles` table,
and only the former carries this story's guards — so a direct import is a live bypass of everything this
story builds, not a hypothetical one (it is exactly how `app/Livewire/Users/Index.php` reaches the table
today). Enforced by a Pest `arch()` test — see [Tests to perform](#tests-to-perform) — scoped to
`['App', 'Database\Seeders']`. Those are real PSR-4 roots in
[`composer.json`](../../../composer.json) (whose `autoload.psr-4` map is exactly `App\`,
`Database\Factories\`, `Database\Seeders\` — there is **no** bare `Database\` root, so `arch()` cannot be
pointed at one), and `Database\Seeders` is the only one of the two `Database\*` roots this story's file
list touches. `config/permission.php` is not in an autoloaded namespace at all and is therefore
naturally outside that scope.

Scope note on `tests/`: eleven test files currently import `Spatie\Permission\Models\Role` directly.
They are **out of the `arch()` rule's scope on purpose** — a test that proves the documented
query-builder/foreign-model bypass legitimately needs the package class. Phase 3 should still move test
*fixtures* over to `App\Models\Role`, because a fixture built through the package class silently does not
exercise the guards; that is a test-quality obligation, not part of this invariant.

Confirmed **not** needed, recorded so reviewers don't re-open them: no change to `bootstrap/app.php`
(story **0002** registers the `role` / `permission` / `role_or_permission` middleware aliases in its
`withMiddleware()` closure — *this* story adds nothing to it, since route gating belongs to
0009/0011); no `app/Observers/`
class (the two guards live on `App\Models\Role` itself, registered per the boxed note above — an
overridden `boot()` before `parent::boot()`, or an overridden `delete()`; **not** `booted()`); no
migration and no new column.

## Tests to perform
- [x] Happy path / narrowness: a custom role with no holders is deletable; a custom role can be renamed; permissions can be added to, revoked from, and reduced to zero on a custom role; a custom role appears in both the list and the selector query. (Proves the guard is not "nobody can edit any role".)
- [x] Deletion, negative: the application's delete path against the Super Admin role is rejected and the row survives; a direct `$role->delete()` on the Super Admin model instance is rejected and the row survives.
- [x] **Deletion is a clean no-op, not a partial one (the test that catches the `booted()` ordering bug):** seed the Super Admin role, attach at least one permission to it and assign it to at least one user, then attempt the refused delete — afterwards assert the `role_has_permissions` rows **and** the `model_has_roles` rows for that role are still present, in addition to the `roles` row. Asserting only "the role still exists" passes even when the package's `deleting` listener has already detached everything, which is precisely the failure mode described in the boxed note under [Files to create/modify](#files-to-createmodify).
- [x] **Role selector, invisibility:** `App\Livewire\Users\Index::roleOptions()` does not return the Super Admin role, and does so via `->selectable()` (not a local string match) — the assertion should fail if the scope call is removed. Covers the Gherkin scenario "The Super Admin role is absent from the user role selector", which had no test bullet before.
- [x] **Role selector, server-side enforcement (the half a forged submission actually hits):** with `config(['auth.super_admin.role' => 'Something Else'])` overridden and a role of that name present, `roleRules()` **rejects** the id of the config-resolved Super Admin role ("Something Else"), and **accepts** the id of the now-ordinary role literally named "Super Admin". Drive it through the real submission path (`App\Livewire\Users\Index`'s save, so the trait's rules are exercised as used), not by asserting on the rule array's shape. This bullet fails today and would keep failing if Phase 3 changed only `roleOptions()`; the selector-invisibility bullet above cannot cover it, because the dropdown filter is cosmetic and a forged submission never reads it.
- [x] **`arch()` test — one role model class:** no file in the `['App', 'Database\Seeders']` namespaces imports/uses `Spatie\Permission\Models\Role`; `config/permission.php` is outside that scope by construction (it is in no autoloaded namespace). Scope those two namespaces explicitly — `composer.json`'s PSR-4 map has no bare `Database\` root. This is what turns the `app/Livewire/Users/Index.php` import swap into a checked invariant instead of a one-off fix that regresses silently the next time someone types `use Spatie\Permission\Models\Role;`.
- [x] **Config is the single source of truth — the two definitions cannot diverge:** with `config(['auth.super_admin.role' => 'Something Else'])` set and a role of that name present, the same role that the `Gate::before` bypass grants (a user holding "Something Else" passes an arbitrary `can()` check) is the role `selectable()` hides and the guards refuse to delete/rename/re-permission — while the role literally named "Super Admin" becomes an ordinary, fully manageable, fully visible role. Two assertions or a small dataset, both directions; `backend-qa` refines the exact shape in Phase 3. This is the test that fails if any guard, the scope, the policy or the seeder ever compares against `App\Enums\RoleName::SuperAdmin` directly instead of resolving `config('auth.super_admin.role')`.
- [x] **A present-but-`null` config key still resolves to the enum default — the test that proves the `??` is actually there:** with `config(['auth.super_admin.role' => null])` set, `App\Models\Role::superAdminName()` returns `RoleName::SuperAdmin->value`, and every mechanism built on it still behaves normally — the guards still refuse to delete/rename/re-permission the `'Super Admin'` role, `selectable()` still hides it, and `RolePolicy` still denies. Note why the bullet above cannot cover this: `config(['… => 'Something Else'])` sets a **present, non-null** key, which the two-argument `config('auth.super_admin.role', RoleName::SuperAdmin->value)` form resolves perfectly well — so nothing else in this list fails if Phase 3 drops the `?? RoleName::SuperAdmin->value` half. A present-but-`null` key is the only input that distinguishes the two forms, and it is a reachable state (`'role' => env('SUPER_ADMIN_ROLE')` with the env var unset, or a stale cached config), not a synthetic one. Without the `??`, this test sees `superAdminName()` return `null` and the whole protection surface silently resolve to nothing.
- [x] Edit, negative: renaming is rejected; changing `guard_name` is rejected; `revokePermissionTo()` on one permission is rejected; `syncPermissions([])` is rejected; `syncPermissions()` with a strict subset is rejected; `givePermissionTo()` (a superset) is rejected. Assert the stored name/permission set is unchanged after each.
- [x] Bypass, negative: a user holding the broadest role-management permission is rejected identically to an unprivileged user; the Super Admin user themselves is rejected (the one case that must *not* follow the Super Admin's permission-check bypass); an identifier-forging attempt aimed at the Super Admin role from an action meant for another role is rejected **and** leaves the other role untouched.
- [x] Invisibility: the roles-list query and the role-selector query never return the Super Admin role, under any pagination/filter parameters; a custom role named "Super Admin Assistant" **is** returned by both (rules out substring/fuzzy matching).
- [x] Regression — the invisibility mechanism must not break authorization: `$user->assignRole('Super Admin')` still resolves the role and `hasRole()` returns true; a Super Admin user's `hasPermissionTo()` still resolves after the permission cache is flushed and re-hydrated; the story-0002 seeder's create-if-missing call still locates or creates the row.
- [x] Edge — Super Admin row absent (fresh database, before 0002's seeder has run): the list query, the selector query, and delete/edit of an unrelated role all complete without error, and nothing is wrongly blocked (rules out a guard that fails closed when its reference row is missing).
- [x] Placement: all of the above touch `roles` / `role_has_permissions` rows, so they belong in `tests/Feature/` with `RefreshDatabase`, not `tests/Unit/`.

## Expected outcome
Once implemented, the Super Admin role is a fixed point of the system: every application code path goes
through `App\Models\Role` — enforced by an `arch()` test, so the package's own role class is no longer a
way around it — and every such path, whether a dashboard action, a Livewire component, a console command
or a crafted request that skips the UI, is refused with a 403 when it tries to delete, rename, or change
that role's permissions, whoever the actor is (the Super Admin included). A refused delete is a clean
no-op: the role keeps its permission grants and its holders, not just its row. Every roles list and
role selector built on the shared `selectable()` scope silently omits it, while seeding, role
assignment by name, the permission cache, and a Super Admin's own authorization checks all keep
working untouched. Ordinary custom roles remain fully manageable.

## Acceptance criteria
- [x] The Super Admin role cannot be deleted through `App\Models\Role`, which is the only role model class the application uses outside `config/permission.php` — refused server-side, with the row still present afterwards **and its `role_has_permissions` / `model_has_roles` rows untouched** (a refused delete is a clean no-op, not a partial one).
- [x] No application file outside `config/permission.php` imports `Spatie\Permission\Models\Role`; every call site goes through `App\Models\Role`, and this is enforced by an `arch()` test rather than by convention alone. (Without it, `Spatie\Permission\Models\Role::find($id)->delete()` — a different Eloquent class over the same table — is a reachable bypass of every guard this story adds.)
- [x] The Super Admin role cannot be renamed, have its `guard_name` changed, or have its permission set altered in **any** direction (reduced, emptied, or extended) — "uneditable" is enforced categorically, not only against downgrades.
- [x] The refusal is categorical, not permission-based: it holds for an unprivileged user, for the holder of the broadest role-management permission, and for the Super Admin themselves.
- [x] Permission-revocation attempts are caught even though they bypass Eloquent model events, via overrides of `givePermissionTo()` / `syncPermissions()` / `revokePermissionTo()` on `App\Models\Role`.
- [x] Both layers are present and independently effective: `RolePolicy` for code paths that call `authorize()`, and the model-level guards for code paths that do not.
- [x] A single shared local scope (`Role::query()->selectable()`) exists and excludes exactly the Super Admin role; no global scope is introduced.
- [x] The Super Admin role is identified **via the single `App\Models\Role::superAdminName(): string` method** — one `public static` implementation reading `config('auth.super_admin.role', RoleName::SuperAdmin->value) ?? RoleName::SuperAdmin->value`, with `App\Enums\RoleName::SuperAdmin->value` the single place the literal string is written — called by every guard, by the `selectable()` scope, by `RolePolicy` and by the seeder alike, none of which re-derives the config read itself. **Both fallbacks are present**: `config()`'s default for a missing key and `??` for a key that is present but `null` (per [`docs/security/authorization-patterns.md`](../../../docs/security/authorization-patterns.md#read-the-super-admin-role-name-with-a-literal-default)) — so the method can never return `null` and leave the guards, scope, policy and seeder protecting nothing while the `Gate::before` bypass still grants the role. This is the same source of truth the existing `Gate::before` permission bypass in `AppServiceProvider::configureAuthorization()` already reads, so the role that bypasses permission checks and the role that is protected/hidden are provably the same role and cannot diverge when the config value is overridden. Matching is exact (a role merely containing "Super Admin" in its name is unaffected).
- [x] Seeding, `assignRole()` by name, permission-cache hydration, and a Super Admin's own `hasRole()`/`hasPermissionTo()` are all provably unaffected by the invisibility mechanism.
- [x] With no Super Admin role row present, nothing crashes and nothing is wrongly blocked (the guard fails open, not closed).
- [x] `config/permission.php` resolves `models.role` to `App\Models\Role`.
- [x] `config/auth.php`'s `super_admin.role` default is `App\Enums\RoleName::SuperAdmin->value` rather than a bare string literal, and **every site this story's mechanism reaches resolves the name through `App\Models\Role::superAdminName()` instead of writing the literal `'Super Admin'`** — namely `app/Livewire/Users/Index.php`'s `roleOptions()` (via `->selectable()`), `app/Concerns/UserValidationRules.php`'s `roleRules()`, `app/Providers/AppServiceProvider.php`'s `Gate::before` bypass, and `database/seeders/RolePermissionSeeder.php`'s role lookup. Two exemptions, both deliberate:
  - The provisioned user's display name at `RolePermissionSeeder.php:204` (`'name' => 'Super Admin'`) is a *person's* name, not a role identity, and stays as-is.
  - `app/Policies/UserPolicy.php`'s two `$target->hasRole('Super Admin', 'web')` checks (lines 34 and 113) are **out of scope for this story**. They answer a different question — *does this target user hold the role?* — rather than *which role is the Super Admin?*, and they belong to the story-0004 F2/F3 literal-role-name centralisation already recorded as deferred follow-up work in [Notes / follow-up](#notes--follow-up) (alongside `UserPolicy`'s `hasRole('Administrator', 'web')` checks, which have the identical shape and must move together, not piecemeal). Phase 5 should not flag them as a miss; Phase 3 must not "fix" them here.
  - Comments and log/console message strings mentioning "Super Admin" in prose are not role identities either, and are out of scope.

## Definition of Done
- [x] Tests written and green
- [x] Code reviewed (code-reviewer)
- [x] No security findings (appsec-auditor)
- [x] Documentation updated (docs-keeper) — `docs/architecture/authorization.md` gains the real Super
      Admin invariant mechanism, and `docs/conventions/base-standards.md`'s directory-structure section
      gains `app/Exceptions/` (approved in Q1; `app/Enums/` and `app/Policies/` are already documented
      by stories 0003 and 0004 respectively) — see the Phase 6 note in
      [Notes / follow-up](#notes--follow-up). `docs/architecture/authorization.md` must also record that
      `config('auth.super_admin.role')` is now the single source of truth shared by the `Gate::before`
      bypass, this story's guards and scope, and the seeder. Nothing to reconcile about policy
      registration — this story follows the documented auto-discovery convention.
- [x] Acceptance criteria met

> **What a ticked box means on the four "Known limitation" items below.** They are checked as
> **documented**, not as *implemented* or *fixed*. Each is a deliberate, human-confirmed scope
> boundary (Q3 for the query-builder gap; a re-audit judgement call for F7 and F8; an architectural
> impossibility for the bare-relation / foreign-model / event-suppression bypasses), and the DoD
> obligation each one carries is to be **enumerated honestly in this file** rather than left as a
> silent gap. That obligation is met. Closing story 0008 does not assert these gaps are closed.

- [x] **Known limitation — enumerated model-layer bypasses that remain (corrected during the Phase 4
      re-audit; a prior draft of this bullet overclaimed the query-builder gap was the *only* one
      remaining — it was not):**
      - `Role::where(...)->delete()`, `Role::query()->delete()`, and any raw
        `DB::table('roles')->delete()/->update()` bypass Eloquent model events entirely, so neither the
        policy nor the model guards intercept them. No application-layer mechanism in this story closes
        that gap; only a database-level trigger would, and that would require a migration and
        `database-expert`, changing this story's type. Code review is the backstop. See Q3.
      - `$role->permissions()->detach(...)` and other direct mutation of the `permissions()`
        `MorphToMany`/`BelongsToMany` relation object bypass `givePermissionTo()` /
        `syncPermissions()` / `revokePermissionTo()` entirely, since those overrides guard the
        *methods*, not the underlying relation. A parent model cannot guard a bare relation object
        returned to the caller.
      - **The exact analogue on the holders side: `$role->users()->detach(...)`** (and any other
        direct mutation of the `users()` relation object) bypasses the
        `assignToModels()` / `removeFromModels()` / `syncModels()` overrides for precisely the same
        reason — those guard the *methods*, and the relation object is handed to the caller
        unguarded. Verified executable during the Phase 4 audit, and worth naming separately rather
        than folding into the bullet above because its blast radius is larger: a bare
        `$role->users()->detach()` strips **every** Super Admin holder in one call, which is an
        irrecoverable lockout — `Gate::before` is the only route to unrestricted access, and with no
        holder left there is no actor who can grant it back through the application. (Recorded in
        [`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md#the-super-admin-roles-invariants)'s
        bypass table alongside the `permissions()` case.)
      - `Spatie\Permission\Models\Permission` also uses `HasRoles`, so
        `Permission::first()->removeRole('Super Admin')` mutates the identical `role_has_permissions`
        pivot from the other side and is equally unguarded — `App\Models\Role`'s overrides cannot
        intercept a mutation issued from a different model class.
      - The sibling bypass this story *does* close: reaching the same table through
        `Spatie\Permission\Models\Role` directly (no guards at all) is closed by the import convention
        and its `arch()` test.
      - `saveQuietly()` / `deleteQuietly()` / `Role::withoutEvents(...)` bypass the `creating` /
        `updating` / `deleting` guards wholesale, since all three suppress model events outright
        (verified: `$sa->name = 'QuietPwn'; $sa->saveQuietly();` succeeds unguarded). Same reachability
        class as the query-builder bypass above — code review is the backstop — and worth naming
        explicitly here because `firstOrCreateSuperAdminRole()`'s own F3 fix normalises `withoutEvents()`
        as an in-house pattern, making a future engineer more likely to reach for it elsewhere.
      No application-layer mechanism closes the bare-relation bullets (`permissions()->detach()`,
      `users()->detach()`), the foreign-model bullet (`Permission::removeRole()`) or the
      event-suppression bullet (`saveQuietly()` / `withoutEvents()`) either; guarding a bare Eloquent
      relation object from the parent model, a trait shared by an unrelated model class, or a caller
      that deliberately suppresses model events, is not achievable without changing that other class
      or call site. Code review is the backstop for every bullet above **except** the
      raw-`Spatie\Permission\Models\Role` one, which is the only bypass this story actually closes
      (by the import convention and its `arch()` test). Not fixed in this round — recorded here
      rather than left as a silent gap.
- [x] **Known limitation — the local scope is a convention, not an enforcement:** a future
      `Role::all()` written without `->selectable()` would leak the Super Admin role into a list. This
      is the accepted cost of rejecting a global scope (which would have broken the seeder, role
      assignment, the permission cache, and the Super Admin's own authorization). Mitigated by naming
      the scope unambiguously here and by Phase 5 code review.
- [x] **Known limitation (Phase 4 re-audit F7, "plantable" claim corrected in the second re-audit) —
      matching ignores `guard_name`:** `superAdminName()`, `selectable()`, and the model guards all match
      on `name` alone, while the `Gate::before` bypass is explicitly `web`-scoped. A role named "Super
      Admin" (or whatever the config resolves to) on a non-`web` guard is **not** plantable through
      `App\Models\Role`: the `creating` guard (`guardAgainstAssumingSuperAdminName()`, the F3 fix) matches
      on `name` alone regardless of `guard_name`, so `Role::create(['name' => 'Super Admin', 'guard_name'
      => 'api'])` is refused just like the `web`-guard case (verified during the second Phase 4
      re-audit). Such a role is reachable only via the already-documented raw-query-builder /
      raw-`Spatie\Permission\Models\Role` bypasses above — and if it somehow exists (e.g. planted before
      this story shipped, or via one of those bypasses), it remains invisible to `selectable()` and
      permanently undeletable/uneditable through `App\Models\Role` while granting no `Gate::before`
      bypass — a minor availability/hygiene issue, not a privilege escalation
      (`tests/Feature/Authorization/SuperAdminBypassTest.php` already proves an `api`-guard "Super Admin"
      role does not bypass a `web`-guard check). Guard-scoping all three checks to `(name, guard_name =
      'web')` explicitly remains deferred rather than fixed in this round: it touches every mechanism this
      story built and was judged not worth the added surface for a low-severity, low-reachability gap
      under re-audit time pressure. Left as a follow-up.
- [x] **Known limitation (Phase 4 re-audit F8) — `RolePolicy` can throw `PermissionDoesNotExist` (→ 500)
      instead of denying (→ 403) on a database with roles but no seeded `roles.manage` permission
      row:** `RolePolicy::update()`/`delete()` call `$user->hasPermissionTo('roles.manage')` directly,
      which throws rather than returning `false` when the permission doesn't exist in the catalog.
      Deliberately left as-is rather than switching to `$user->can('roles.manage')`: every ability check
      in the sibling `App\Policies\UserPolicy` uses the identical `hasPermissionTo(...)` form (six call
      sites), so fixing only `RolePolicy` would make it inconsistent with the codebase's one established
      pattern for this exact shape of check, without closing the same, pre-existing gap in `UserPolicy`.
      Low reachability (a database with the `roles`/`permissions` tables migrated but not seeded), and a
      pattern-wide fix belongs in one pass across both policies, not a one-off deviation here.
- [x] **A written evaluation of the story-0004 F2/F3 follow-up is recorded in this task file** (see
      [Notes / follow-up](#notes--follow-up) below). Implementing the centralisation itself is
      explicitly **out of scope** for story 0008.

## Notes / follow-up

**Follow-up from story 0004's Phase 4 security audit (findings F2/F3) — evaluation only, implementation
out of scope.** `App\Livewire\Users\Index`, `App\Concerns\UserValidationRules` and
`App\Policies\UserPolicy` currently identify the `Administrator` and `Super Admin` roles by literal name,
and the Administrator-level guard (`roles.manage-administrators`) is
enforced only inside the Livewire component, not in `App\Actions\Users\CreateUser` / `UpdateUser`
themselves — so a role rename would silently disarm every guard that matches on the name, and every
non-component caller of those two actions is ungated.

**What story 0008 does and does not take off this list.** 0008 closes the *role-identity resolution* half
for the Super Admin name only — `Index::roleOptions()`, `UserValidationRules::roleRules()`,
`AppServiceProvider`'s `Gate::before` and the seeder all route through `Role::superAdminName()` once it
lands. What remains deferred to this follow-up, untouched by 0008 and explicitly exempted in its
acceptance criteria:

- `App\Policies\UserPolicy` lines 34 and 113 — `$target->hasRole('Super Admin', 'web')`. These ask
  *does this target user hold the role?*, not *which role is the Super Admin?*; they are the same shape
  as the `Administrator` checks beside them and should be centralised in one pass with them, not
  half-migrated by 0008.
- `App\Policies\UserPolicy`'s `hasRole('Administrator', 'web')` checks, and every other
  `Administrator`-by-literal-name site — `Administrator` has no config key at all today.
- The ungated `App\Actions\Users\CreateUser` / `UpdateUser` call paths.

The deliverable for story 0008 is **a written evaluation recorded in this section** of centralising that
Administrator-level role identification behind a stable identifier — e.g. an
`App\Models\Role::isAdministratorLevel()` concept, versus a dedicated flag column — including which of
`Index`, `UserPolicy`, `CreateUser` and `UpdateUser` would call it. Nothing is refactored under this
story.

The evaluation should weigh the shape this story settles on for the Super Admin role as the precedent:
a **config key** (`config('auth.super_admin.role')`) is authoritative and environment-overridable, with
`App\Enums\RoleName` supplying only its compiled-in default. Note the asymmetry, which is exactly what
makes this an evaluation rather than a foregone conclusion: the Super Admin name is already a config key
because `Gate::before` needs it, whereas `Administrator` has **no** config key today, so mirroring the
pattern means adding one (`auth.administrator.role` or similar) rather than reusing one.

Two reasons it is bounded this way rather than left as a completion gate:

- It was sitting inside the Definition of Done, which is a *gate*, phrased as an open-ended refactor
  obligation ("should evaluate centralising"). A checklist item nobody can objectively mark done blocks
  closure on judgement rather than on evidence.
- One of its own suggested options — a flag column — needs a migration and therefore `database-expert`,
  which directly contradicts this story's declared type (`includes database-expert: **no**`) and the
  confirmed **Q3** decision to keep story 0008 Small per INVEST.

> **Recommendation for the human, not a decision taken here (recommended):** promote this to its own
> follow-up story rather than carrying it as a note on 0008. The flag-column option pulls in a migration
> and `database-expert`, and the change surface (`Index`, `UserPolicy`, `CreateUser`, `UpdateUser`) is
> its own independently-valuable slice — which is exactly the INVEST argument for splitting it. The
> alternative is to keep it as this note and let a later story pick it up from the recorded evaluation;
> cheaper now, but it leaves a known security finding tracked only inside a closed task file.
> **Resolved — the follow-up story now exists.** The recommendation above was accepted: the work is
> tracked as [`0008a` — Centralize Administrator-level role
> identification](../0008a-centralize-administrator-role-identification.md), written up as full
> Phase 1 output and sitting in the **new** stage (not yet picked up for implementation). It carries
> the evaluation recorded in this section forward as its starting point, and it owns the three
> deferred items listed above (`UserPolicy`'s `hasRole('Super Admin', 'web')` checks at lines 34 and
> 113, every `Administrator`-by-literal-name site, and the ungated `CreateUser` / `UpdateUser` call
> paths). Story 0008 is therefore closed with its own scope complete and nothing tracked only inside
> a closed task file.

**Note for Phase 6 (`docs-keeper`), unrelated to the above.** `app/Exceptions/` is a stock
`make:exception` Laravel location, exactly like `app/Enums/` and `app/Policies/`, so
[`docs/conventions/base-standards.md`](../../../docs/conventions/base-standards.md#directory-structure)'s
"stock Laravel locations … creating one of them needs no approval" sentence should list it alongside the
others when this story adds `app/Exceptions/ImmutableRoleException.php`. Recorded here so it is not
rediscovered as a question; not a change to make before Phase 6.

**Post-closure PRD alignment check (2026-08-18), requested by the human after closure.** Re-read
[`docs/PRD/PRD.md`](../../../docs/PRD/PRD.md)'s Epic 1 "Super Admin role" prose (around its "Managing
roles at all is a gated permission" / "A stricter, separate permission gates administrator-level
management" paragraphs) and its "Roles & Permissions" Gherkin block against every decision recorded in
this file (Q1-Q4, the config-vs-enum source-of-truth call, and the Phase 4 security-audit fixes). No
divergence found — every decision here is an implementation choice about *how* to build a requirement
the PRD already states, not a change to *what* it requires:

- The PRD's "[the Super Admin role] is assignable **only via direct database access or a seeder**,
  never through the dashboard" is exactly what the Phase 4 `Role::firstOrCreateSuperAdminRole()` fix
  (the F3 finding) closes — the security audit brought the implementation into fuller alignment with an
  existing PRD requirement the original Phase 1 spec had not fully enforced, rather than introducing a
  new one.
- Q2's "categorically unmodifiable in every direction, including additions" matches the PRD's "it can
  never be modified or removed at all" verbatim.
- The PRD's Super Admin-grant-visibility scenarios ("Only the Super Admin sees the
  administrator-management grant option", "A broad administrator never sees the … toggle", "The Super
  Admin grants a role administrator-management permission") are UI-facing and correctly out of this
  story's backend-only scope — deferred to stories 0009/0011 (roles CRUD screens), not overlooked.
- Story 0008a's decision to move the Administrator-level guard into `CreateUser`/`UpdateUser` (so every
  caller is covered, not only the Livewire component) is a stricter reading of the PRD's "the action is
  denied server-side" scenarios, which don't specify a mechanism — not a divergence from them.

No PRD update was made as a result of this story; none was needed.

## Open questions

Per [`docs/contracts.md`](../../../docs/contracts.md)'s Uncertainty Handling Rule, these need a human
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

---

## Human decisions (recorded before Phase 3)

- **Q1 — Approved.** Create `app/Enums/RoleName.php`, `app/Policies/RolePolicy.php`, and the new
  `app/Exceptions/ImmutableRoleException.php`. Follows the artisan-first convention; no magic-string
  fallback.
- **Q2 — Approved (stronger reading).** The Super Admin role is blocked from **every** direction of
  change, including permission *additions*, not only renames/downgrades — `givePermissionTo()` throws
  for the Super Admin role exactly like `syncPermissions()`/`revokePermissionTo()` do. Matches the
  PRD's "categorically unmodifiable" wording; costs nothing since the Super Admin bypass ignores the
  role's permission rows entirely.
- **Q3 — Approved (accept the limitation).** Query-builder mass mutations
  (`Role::where(...)->delete()`, raw `DB::table('roles')`) remain uncovered by this story, as already
  documented in the Definition of Done. No database-level trigger; code review is the backstop. Keeps
  this story backend-only and Small per INVEST.
- **Q4 — Already satisfied, verified against the real code.** `database/seeders/RolePermissionSeeder.php`
  already creates the Super Admin role with `Role::firstOrCreate(['name' => 'Super Admin', 'guard_name'
  => 'web'])` and never calls `syncPermissions()`/`givePermissionTo()` on that role instance — only on
  `$administratorRole`. No change to story 0002 is needed.
