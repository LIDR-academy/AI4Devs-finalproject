# Naming Conventions

Real naming patterns observed across the codebase. For migration file naming specifically, see [database/migrations.md](../database/migrations.md#file-naming) — not repeated here.

## Table of Contents

- [Classes](#classes)
- [Livewire components and views](#livewire-components-and-views)
- [Traits and their methods](#traits-and-their-methods)
- [Route names](#route-names)
- [Permission names](#permission-names)
- [Translation keys](#translation-keys)
- [Boolean properties](#boolean-properties)

## Classes

One class per file, `StudlyCase`, filename matches class name exactly (PSR-4). Verified across `app/Actions/Fortify/`, `app/Livewire/`, `app/Concerns/`:

| Class | File |
| --- | --- |
| `App\Actions\Fortify\CreateNewUser` | `app/Actions/Fortify/CreateNewUser.php` |
| `App\Livewire\Settings\TwoFactor\RecoveryCodes` | `app/Livewire/Settings/TwoFactor/RecoveryCodes.php` |
| `App\Livewire\Actions\Logout` | `app/Livewire/Actions/Logout.php` |

Single-purpose invokable actions are named as an imperative verb phrase, not suffixed with `Action` or `Service`: `Logout`, `CreateNewUser`, `ResetUserPassword`, `RequestEmailChange`, `ConfirmEmailChange` (Fortify's own convention, followed consistently by this app's own actions in `app/Actions/Users/`).

Controllers, by contrast, **are** suffixed `Controller`, and are named after the action they front: `ConfirmEmailChange` (the action) → `ConfirmEmailChangeController` (the invokable controller in front of it). Same for listeners and notifications, which are named as a statement about what happened rather than a command: `ActivateVerifiedUser`, `PendingEmailVerification`.

| Class | File |
| --- | --- |
| `App\Actions\Users\ConfirmEmailChange` | `app/Actions/Users/ConfirmEmailChange.php` |
| `App\Http\Controllers\ConfirmEmailChangeController` | `app/Http/Controllers/ConfirmEmailChangeController.php` |
| `App\Listeners\ActivateVerifiedUser` | `app/Listeners/ActivateVerifiedUser.php` |
| `App\Notifications\PendingEmailVerification` | `app/Notifications/PendingEmailVerification.php` |
| `App\Enums\UserStatus` | `app/Enums/UserStatus.php` |
| `App\Actions\Roles\EnforceAdministratorPermissionGrant` | `app/Actions/Roles/EnforceAdministratorPermissionGrant.php` |
| `App\Actions\Roles\EnforceGrantorPermissionScope` | `app/Actions/Roles/EnforceGrantorPermissionScope.php` |
| `App\Policies\UserPolicy` | `app/Policies/UserPolicy.php` |
| `App\Exceptions\RoleInUseException` | `app/Exceptions/RoleInUseException.php` |
| `App\Actions\Auth\EnsureRecentPasswordConfirmation` | `app/Actions/Auth/EnsureRecentPasswordConfirmation.php` |
| `App\Exceptions\PasswordConfirmationRequiredException` | `app/Exceptions/PasswordConfirmationRequiredException.php` |
| `App\Actions\SalesRegions\SetDefaultSalesRegion` | `app/Actions/SalesRegions/SetDefaultSalesRegion.php` |
| `App\Policies\SalesRegionPolicy` | `app/Policies/SalesRegionPolicy.php` |
| `App\Concerns\SalesRegionValidationRules` | `app/Concerns/SalesRegionValidationRules.php` |
| `App\Actions\Media\GenerateImageConversions` | `app/Actions/Media/GenerateImageConversions.php` |
| `App\Policies\MediaPolicy` | `app/Policies/MediaPolicy.php` |
| `App\Concerns\MediaValidationRules` | `app/Concerns/MediaValidationRules.php` |

Policies are named `<Model>Policy` — and here the name is not merely a convention but a binding: Laravel 13 auto-discovers `App\Policies\UserPolicy` for `App\Models\User` by that exact name, so renaming it silently unbinds every `Gate::authorize()` call against a `User` (see [base-standards.md](base-standards.md#directory-structure)). Policy **methods** are named after the ability, as a bare verb phrase in camelCase and without a `can` prefix: `viewAny`, `update`, `promoteToAdministrator`, `updateSensitiveAttributes` — matching how they read at the call site, `Gate::authorize('promoteToAdministrator', $target)`.

Enum cases use TitleCase keys with lowercase backing values — `case Active = 'active';` in `App\Enums\UserStatus`, matching the project `CLAUDE.md` rule. `App\Enums\RoleName` is the exception the rule tolerates: its backing values are the seeded role names *exactly as persisted* (`case Administrator = 'Administrator';`), because the value is compared byte-for-byte against a database row — see [architecture/authorization.md](../architecture/authorization.md#the-administrator-tiers-identity).

**Shared identity predicates on a model are named `is<Thing>(self $x): bool` and take the row.** `App\Models\Role` carries three: the `public static` `isAdministratorRole()` and `isSuperAdminRoleRow()`, both of which a *different* class calls with a `Role` in hand, and the `private` `isSuperAdminRole()`, which asks the same question about `$this` from inside the model's own guards. The `Row` suffix on the middle one exists only to disambiguate it from that private sibling; it is a wart, accepted deliberately over renaming a method 0008's guards already depend on. When adding the next one, prefer a name that needs no suffix — and never let a private instance helper and a public static one differ by suffix alone if you can avoid it.

## Livewire components and views

Component class is `StudlyCase`; its Blade view is the **kebab-case** version of the class name, in a mirrored directory structure under `resources/views/livewire/`:

| Component | View |
| --- | --- |
| `App\Livewire\Settings\Security` | `resources/views/livewire/settings/security.blade.php` |
| `App\Livewire\Settings\Profile` | `resources/views/livewire/settings/profile.blade.php` |
| `App\Livewire\Settings\DeleteUserForm` | `resources/views/livewire/settings/delete-user-form.blade.php` |

✅ Good — `DeleteUserForm` → `delete-user-form.blade.php` (each word boundary becomes a hyphen).
❌ Bad — do not use `deleteuserform.blade.php` or `DeleteUserForm.blade.php`; Livewire's convention-based view resolution expects the kebab-case mirror.

### Exception: a component named `Index` resolves to its **parent folder's** name

The mirror rule above has one exception, and it is Livewire's, not this project's. A component class named `Index` inside a subfolder drops the `.index` segment entirely and resolves to the **subfolder name**:

| Component | View — actual | View — what the mirror rule would predict |
| --- | --- | --- |
| `App\Livewire\Users\Index` | `resources/views/livewire/users.blade.php` | ~~`resources/views/livewire/users/index.blade.php`~~ |
| `App\Livewire\Roles\Index` | `resources/views/livewire/roles.blade.php` | ~~`resources/views/livewire/roles/index.blade.php`~~ |
| `App\Livewire\SalesRegions\Index` | `resources/views/livewire/sales-regions.blade.php` | ~~`resources/views/livewire/sales-regions/index.blade.php`~~ |

This is explicit in the installed vendor source:

```php
// vendor/livewire/livewire/src/Finder/Finder.php — Finder::generateNameFromClass()
// If using an index component in a sub folder, remove the '.index' so the name is the subfolder name...
if ($fullName->endsWith('.index')) {
    $fullName = $fullName->replaceLast('.index', '');
}
```

So `App\Livewire\Users\Index` becomes the component name `users`, and `users` resolves to `livewire/users`. The nested path is still *offered* as a fallback (`Finder` also probes `<folder>/index.blade.php` and `<folder>/<folder>.blade.php`), but the flat file is what this repo uses and what a reader should expect to find.

✅ Good — the real pairing in this repo: `app/Livewire/Users/Index.php` ↔ `resources/views/livewire/users.blade.php`.
❌ Bad — assuming the mirror rule holds and looking for (or creating) `resources/views/livewire/users/index.blade.php`. It is not the path Livewire reports as the component's view, and a second file there is a silently unused duplicate.

The third row (task 0017) adds the one thing the first two could not show: **the subfolder name is kebab-cased on the way down**, so a multi-word area segment splits — `App\Livewire\SalesRegions\Index` resolves to `livewire/sales-regions.blade.php`, not `livewire/salesregions.blade.php`. That is the ordinary mirror rule applied to the *folder* name after `.index` is stripped, but `Users` and `Roles` are single words and demonstrated none of it.

**This has already cost real time once — twice now — so it is worth stating as a habit rather than a rule to recall.** Task 0010's own Phase 1 spec — and its sibling 0011's — both wrote the nested path for `App\Livewire\Roles\Index`, and the error surfaced only when the story's test suite ran and threw `Illuminate\View\ViewException: File does not exist at path .../resources/views/livewire/roles.blade.php`. Livewire never even probes the nested path first, so nothing hints at the mistake until something renders. When adding an `Index` component, resolve the view path **by running the component**, not by reasoning about it.

Task 0017 hit the *other* half of the same trap, and it is worth knowing because it costs nothing to walk into: its task file quoted the rule correctly and its component was written to the flat path, but an `artisan make:` scaffold still deposited an unused `resources/views/livewire/sales-regions/index.blade.php` stub on disk. Nothing failed — the flat view resolved, the tests passed, and the stub simply sat there as a silently-unused duplicate until it was noticed and removed (verified: only `resources/views/livewire/sales-regions.blade.php` exists today). **So the check is not only "did I write the right path" but "is there a second file at the wrong one".**

Practical consequence when adding the next module screen: an `Index` component for a new area lands at `resources/views/livewire/<area>.blade.php`, one level *shallower* than its class. Any other component in that same subfolder (`App\Livewire\Users\Editor` → `livewire/users/editor.blade.php`) follows the normal mirror rule, so the two live at different depths — that asymmetry is expected, not a mistake.

**Story 0019 is the first real instance of that "any other component" case, and it is worth naming because the exception above is memorable enough to be over-applied.** `App\Livewire\Media\Gallery` resolves to `resources/views/livewire/media/gallery.blade.php` — the **normal** mirror rule, nested, because the class is not named `Index`. The exception keys on the class name, never on the component living in a subfolder. Note the story's own task file had to state this explicitly to stop the mistake being made in the other direction, which is the tell that the exception has become the thing people remember.

Note: `resources/views/livewire/auth/*.blade.php` (login, register, forgot-password, etc.) are **plain Blade views**, not Livewire components — they live under `livewire/` for directory consistency but are bound directly as Fortify's auth views, e.g. `Fortify::loginView(fn () => view('livewire.auth.login'))` in [`app/Providers/FortifyServiceProvider.php`](../../app/Providers/FortifyServiceProvider.php). Don't assume every file under `resources/views/livewire/` has a matching PHP component class — check for one before citing it.

## Traits and their methods

Validation-rule traits are suffixed `ValidationRules`, and every public method on them is suffixed `Rules` and returns a rule array — no exceptions in the current codebase:

```php
// app/Concerns/PasswordValidationRules.php — trait name ends in "ValidationRules"
trait PasswordValidationRules
{
    protected function passwordRules(): array { /* ... */ }        // ends in "Rules"
    protected function currentPasswordRules(): array { /* ... */ } // ends in "Rules"
}
```

```php
// app/Concerns/ProfileValidationRules.php
trait ProfileValidationRules
{
    protected function profileRules(?string $userId = null): array { /* ... */ }
    protected function nameRules(): array { /* ... */ }
    protected function emailRules(?string $userId = null): array { /* ... */ }
}
```

```php
// app/Concerns/UserValidationRules.php
trait UserValidationRules
{
    protected function roleRules(): array { /* ... */ }
    protected function statusRules(): array { /* ... */ }
}
```

```php
// app/Concerns/RoleValidationRules.php
trait RoleValidationRules
{
    protected function roleNameRules(?int $roleId = null): array { /* ... */ }
    protected function rolePermissionRules(): array { /* ... */ }
}
```

```php
// app/Concerns/MediaValidationRules.php
trait MediaValidationRules
{
    public const MAX_UPLOAD_KB = 8192;       // a constant, not a rule method — see below
    public const MAX_DIMENSION = 4000;

    protected function imageUploadRules(): array { /* ... */ }
    protected function mediaDetailsRules(): array { /* ... */ }
}
```

```php
// app/Concerns/SalesRegionValidationRules.php
trait SalesRegionValidationRules
{
    protected function rateRules(): array { /* ... */ }
    protected function codeRules(): array { /* ... */ }
    protected function descriptionRules(): array { /* ... */ }
    protected function replacementDefaultRules(): array { /* ... */ }
}
```

`SalesRegionValidationRules` (task 0017) is the convention applied unchanged to a fourth trait — `<Noun>ValidationRules`, every method `<noun>Rules()`, flat and single-concern, composed at the consumer (`use SalesRegionValidationRules;` in `App\Livewire\SalesRegions\Index`). One thing it demonstrates that the others do not: **a `<noun>Rules()` method's noun is the *field*, not the model**, so a trait named after the model can hold `rateRules()` / `codeRules()` — the model name is not repeated in each method. `replacementDefaultRules()` names the field it validates (`$replacementDefaultId`) rather than the operation that submits it.

Note `RoleValidationRules` (task 0010) and `UserValidationRules` are **different traits about different things** despite the near-collision in name: the former validates a *`Role` row's* own fields, the latter validates the *role/status a user is being assigned*. Both are named after the model whose input they describe, which is the rule — not after the screen that submits it.

When adding a new validation concern, follow this exact pattern: `<Noun>ValidationRules` trait, `<noun>Rules()` methods — don't introduce a differently-named alternative (e.g. `getPasswordValidation()`). Traits stay **flat and single-concern**, composed at the consumer (`use ProfileValidationRules, UserValidationRules;` in `App\Livewire\Users\Index`, mirroring `CreateNewUser`'s `use PasswordValidationRules, ProfileValidationRules;`) — no trait in `app/Concerns/` `use`s another.

## Route names

Dot notation, `<resource>.<action>`, verified in `routes/settings.php`:

```php
// routes/settings.php
Route::livewire('settings/profile', Profile::class)->name('profile.edit');
Route::livewire('settings/appearance', Appearance::class)->name('appearance.edit');
Route::livewire('settings/security', Security::class)->name('security.edit');
```

Full real route names, including the ones Fortify registers, are listed in [api/routes.md](../api/routes.md).

## Permission names

Same dot notation as route names, one level lower: `<module-slug>.<action>`, where the module slug is **kebab-case** and the action is a bare verb. Verified in `database/seeders/RolePermissionSeeder.php`, which owns the canonical catalog:

```php
// database/seeders/RolePermissionSeeder.php
public const MODULES = [
    'users', 'products', 'sales-regions', 'shipping', 'payment-methods',
    'customers', 'orders', 'blog', 'store-languages', 'media',
];

public const ACTIONS = ['view', 'create', 'edit', 'delete'];

/**
 * Non-CRUD permissions that sit outside the module x action grid.
 *
 * @var array<int, string>
 */
public const ROLE_PERMISSIONS = ['roles.manage', 'roles.manage-administrators'];
```

✅ Good — `sales-regions.delete`, `payment-methods.view`, `roles.manage-administrators`: kebab-case slug, dot separator, verb (or verb phrase, itself kebab-cased) after the dot.
❌ Bad — do not write `salesRegions.delete`, `sales_regions.delete`, `delete-sales-regions`, or a prose form like `'manage administrator-level roles/users'`. A permission name that isn't in the seeded catalog makes `can()` / `hasPermissionTo()` throw `PermissionDoesNotExist` at runtime, so this is a correctness rule, not just a style preference.

A permission that a new feature needs is added to the constants above — never as a string only one component knows about. The catalog, the two seeded roles, and which of them hold what are documented in [architecture/authorization.md](../architecture/authorization.md#permission-catalog).

`'media'` (story 0019) is the **only** slug appended since task 0002 wrote this constant, and the one-line diff above is genuinely the whole production change — but what that one line costs elsewhere, and the one thing it silently breaks, are in [The `media` module, and what a catalog amendment costs](../architecture/authorization.md#the-media-module-and-what-a-catalog-amendment-costs). Read it before adding the eleventh.

**Where a permission name is written in PHP, name it once on the class that owns the rule.** Task 0009 established this for the two role-management names, as `public const` on the policy that decides with them — read by the policy itself, by `App\Actions\Roles\EnforceAdministratorPermissionGrant`, and by both classes' tests:

```php
// app/Policies/RolePolicy.php
public const ADMINISTRATOR_LEVEL_PERMISSION = 'roles.manage-administrators';
public const ROLE_MANAGEMENT_PERMISSION = 'roles.manage';
```

[`App\Policies\SalesRegionPolicy`](../../app/Policies/SalesRegionPolicy.php) (task 0017) is the second policy to follow it — `public const VIEW_PERMISSION = 'sales-regions.view';` / `EDIT_PERMISSION = 'sales-regions.edit';` — which makes `RolePolicy`'s shape the majority and `UserPolicy`'s repeated literals the outlier rather than the status quo. Note the constant names shorten as the class narrows: `RolePolicy` needs `ROLE_MANAGEMENT_PERMISSION` to distinguish two role-scoped rules, while `SalesRegionPolicy` has one ability per verb, so `VIEW_PERMISSION` / `EDIT_PERMISSION` are unambiguous read as `SalesRegionPolicy::EDIT_PERMISSION`. The rule is that the constant names the **rule**, at whatever precision the class requires — not that every policy uses the same constant names.

[`App\Policies\MediaPolicy`](../../app/Policies/MediaPolicy.php) (story 0019) is the **third** follower and the first to carry all four — `VIEW_PERMISSION` / `CREATE_PERMISSION` / `EDIT_PERMISSION` / `DELETE_PERMISSION`, one per CRUD verb — so of this app's four policies, only `UserPolicy` still repeats its literals. That deferral (task 0009's finding **F5**) is now the minority case by three to one; it remains a cleanup candidate rather than a pattern to copy.

✅ Good — `$user->hasPermissionTo(self::ADMINISTRATOR_LEVEL_PERMISSION)`, and `RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION` from a collaborator.
❌ Bad — re-typing `'roles.manage-administrators'` at each call site. This is exactly what `App\Policies\UserPolicy` still does at four of its own call sites (task 0009's Phase 4 finding **F5**, pre-existing and deliberately deferred); it is a known cleanup candidate, not the pattern to copy. The constant name describes the *rule* (`ADMINISTRATOR_LEVEL_PERMISSION`), not the string, so a future catalog rename touches one line.

## Translation keys

`lang/<locale>/<domain>.php` — one file per domain area, keys grouped by feature, every segment `snake_case`. Verified in [`lang/en/users.php`](../../lang/en/users.php) and its Spanish counterpart, which must stay key-for-key identical:

```php
// lang/en/users.php
'statuses' => [
    'active' => 'Active',
    // ...
],

'email_change' => [
    'notification_subject' => 'Confirm your new email address',
    'pending_notice' => 'A change to :email is pending. Use the link sent to that address to confirm it.',
    'confirmed' => 'Your email address has been updated.',
    'refused' => 'This email verification link is no longer valid.',
    'throttled' => 'Too many email change requests. Please try again later.',
],
```

✅ Good — `users.statuses.active`, `users.email_change.throttled`: domain file, feature group, snake_case leaf. Values that interpolate use Laravel's `:placeholder` form (`:email`).
❌ Bad — do not write `users.emailChange.throttled` (camelCase segment), a flat `users.email_change_throttled` (no group), or a literal string inline in a component instead of a key. `App\Enums\UserStatus::label()` resolves `__('users.statuses.'.$this->value)` by convention, so a status label that isn't in the `statuses` group renders as its own raw key.

**A `label()` method on an enum is not automatic — an enum with one rendering site keeps its copy in that screen's own lang file.** `UserStatus::label()` exists because the status is rendered in more than one place and by the enum's own `cases()` loop. [`App\Enums\SalesRegionKind`](../../app/Enums/SalesRegionKind.php) deliberately has **no** `label()` even now that task 0018 renders it: `kind` drives structure everywhere on the Sales Regions list (indentation, chevron, grouping) and is surfaced as text in exactly one place, the edit modal's read-only context block, so the two labels live in that screen's own file as `sales-regions.labels.kind_country` / `kind_fiscal_territory` and the view matches on the case. Story 0016 deferred `label()` to "the first story that actually renders `kind`"; 0018 is that story and declined it, which is the decision to copy — **add `label()` when a second consumer appears, not when the first one does**, because a one-caller `label()` is indirection that hides which lang group owns the copy. Note the leaves are still snake_case (`kind_fiscal_territory`) even though the enum's backing value is too — the match is a coincidence of this enum, not a rule to rely on.

**A count-dependent message is one key with a `|`-delimited plural form, resolved with `trans_choice()` — never two keys and never a hand-built `$count === 1 ? … : …`.** [`lang/en/roles.php`](../../lang/en/roles.php) (task 0010) is the first one:

```php
// lang/en/roles.php
'index' => [
    'delete_blocked' => 'This role cannot be deleted while it is still held by :count user.|This role cannot be deleted while it is still held by :count users.',
],
```

```php
// app/Livewire/Roles/Index.php — deleteRole()
trans_choice('roles.index.delete_blocked', $role->users_count, ['count' => $role->users_count])
```

✅ Good — the singular/plural split lives in the *translation file*, so a locale with different plural rules (Spanish here, and any future one) can express them without touching PHP.
❌ Bad — `delete_blocked_one` / `delete_blocked_many` as two keys, or branching on the count in the component. Both hardcode English's two-form plural rule into code that other locales have to live with.

**The rule binds a Blade template exactly as it binds a component.** Task 0011 added two more `trans_choice()` keys to the same group — `roles.index.summary` (the list's live role count) and `roles.index.permission_count` (each row's granted-permission count) — and the second one shipped its first draft with `':count permission|:count permissions'` written **inline in `resources/views/livewire/roles.blade.php`**, where `lang/es/roles.php` could never reach it (Phase 5 finding F-3). A hardcoded plural is no more acceptable in a view than in PHP; the giveaway is the `|` character appearing anywhere outside a `lang/` file.

**A key leaf is `snake_case` even when the value it names is not — map at render, never rename the value.** This story is where the two collide: the permission catalog's own names are `<module-slug>.<action>` with kebab-case segments (`sales-regions.view`, `roles.manage-administrators`), and those names are fixed by the seeded catalog. The labels are therefore **composed** from two flat arrays rather than written one key per permission:

```php
// lang/en/roles.php — top-level siblings of 'index', not nested under it
'modules' => ['users' => 'Users', 'sales_regions' => 'Sales regions', /* … */ 'roles' => 'Roles'],
'actions' => ['view' => 'View', /* … */ 'manage_administrators' => 'Manage administrator-level roles/users'],
```

```blade
{{-- resources/views/livewire/roles.blade.php --}}
__('roles.modules.'.str_replace('-', '_', $module)).' — '.__('roles.actions.'.str_replace('-', '_', $action))
```

✅ Good — 16 keys per language (10 module labels + 6 action labels) covering 38 of the 42 permissions, the hyphen mapped to an underscore at the point of lookup, and a new seeded module needing exactly one new key.
❌ Bad — `'sales-regions' => …` as a literal kebab-case key leaf (violates the rule above), one key per permission (42+ keys, and a catalog addition silently renders a raw key), or renaming the permission itself to match the key. The permission name is the database's, not the translation file's.

> **⚠️ Corrected 2026-08-29 — this warning said story 0019 had shipped the ❌, and it had not.** As written, it claimed that story appended the tenth module slug `media` and *"did **not** add a `roles.modules.media` leaf to either locale"*, so the Roles matrix rendered the raw key in both languages. That is false: `lang/en/roles.php` carries `'media' => 'Media'` and `lang/es/roles.php` carries `'media' => 'Medios'`, both present in story 0019's own tree and untouched by any story since — verified by reading both files, which is what the original claim says it did. It is the second false "verified" finding from that pass; [errors-log.md](../errors-log.md#one-docs-pass-reported-two-gaps-that-were-not-there-both-marked-verified--2026-08-29) records why one docs pass produced two. **Everything below the correction is the rule, and the rule is unchanged** — it is exactly *because* nothing fails that it is worth stating: the four `media.*` permissions would be seeded, grantable and enforced correctly with or without the leaf, `__()` returning its own key is not an error condition, and the seeder tests assert names and counts rather than rendered copy, so a missing leaf is **only** visible by looking at the screen. `media` is now the evidence the rule is followable, not the evidence it gets missed. Two rules follow. **(a) Adding a module slug means adding its `roles.modules.<slug>` leaf to `lang/en/` *and* `lang/es/` in the same change** — the label is not derived, and `__()` returning its own key is not an error condition. **(b) The `roles.actions.*` half needs nothing**, because a new module reuses the four existing CRUD verbs; only a genuinely new *action* segment would need a leaf there. Note `media` is a single lowercase word, so its leaf is `media` with no mapping — the `str_replace('-', '_', …)` step only matters for a kebab-case slug like `sales-regions`.

**When a lang file exists to supply copy for a registry, its key structure mirrors the registry's own keys exactly — one leaf per registry key, no extras, no renames.** [`lang/en/navigation.php`](../../lang/en/navigation.php) (task 0013) is the first such file, and the mirroring is what makes it reviewable: `config/modules.php` has `groups.platform` / `groups.settings` / `groups.taxes` and `items.dashboard` / `items.users` / `items.roles` / `items.sales_regions`, so the lang file has exactly those seven leaves under exactly those two headings.

```php
// lang/en/navigation.php — the leaves are config/modules.php's own array keys
'groups' => ['platform' => 'Platform', 'settings' => 'Settings', 'taxes' => 'Taxes'],
'items' => ['dashboard' => 'Dashboard', 'users' => 'Users', 'roles' => 'Roles & permissions', 'sales_regions' => 'Sales Regions'],
```

✅ Good — a registry key is simultaneously the translation leaf and the rendered `data-test` hook (`data-test="sidebar-link-roles"`), so one identifier connects the config entry, its copy, and the test that asserts on it. Adding a module means adding the same leaf to `lang/en/` and `lang/es/`, and nothing else.
❌ Bad — writing the copy into the registry itself (`'label' => 'Roles & permissions'` in `config/modules.php`), which puts a literal English string somewhere `lang/es/` cannot reach; or naming the leaf differently from the registry key (`items.roles_and_permissions` for the `roles` entry), which breaks the one-identifier property for no gain. Note this rule does **not** conflict with the snake_case rule above.

**Since task 0018 the multi-word case is shipped rather than hypothetical, and this paragraph is the sentence it was written against.** From task 0013 until then, every registry key was a single lowercase word (`dashboard`, `users`, `roles`), so nothing forced the decision and this text read forward: *"a future registry key that is genuinely multi-word is snake_case on both sides (`items.sales_regions`), never kebab-case."* The Sales Regions entry is that key, and it went in as `sales_regions` — verified in `config/modules.php`, both `navigation.php` files, and the rendered `data-test="sidebar-link-sales_regions"` hook that `tests/Feature/Navigation/SidebarModuleGatingTest.php` selects. Three identifiers move together, so getting the key wrong breaks all three at once.

The **values** inside that same entry stay kebab-case, and the distinction is the whole rule: `'permissions' => ['sales-regions.view']` is a seeded permission name, `'route' => 'sales-regions.index'` a route name, `'current_when' => 'sales-regions.*'` a route pattern. None of the three is a registry *key*, and each is owned by something outside this file — the seeded catalog and `routes/sales-regions.php` — exactly like the *permission* names above, whose kebab-case is imposed by the catalog and mapped at lookup.

Note `APP_LOCALE=en` today, so everything renders in English until the interface language switcher exists — an accepted, documented consequence of the English-source decision, not a defect. Adding a key means adding it to **both** `lang/en/` and `lang/es/` in the same change.

**Exception: a validation `attributes` block's leaf is the field name, byte-for-byte, even when that name is camelCase.** [`lang/en/sales-regions.php`](../../lang/en/sales-regions.php) (task 0017) is this repo's first `attributes` block — the array Laravel's `validate(..., attributes: __(...))` uses to substitute a human label for `:attribute` in a validation message. Its `replacementDefaultId` leaf is camelCase because it must equal `App\Livewire\SalesRegions\Index::$replacementDefaultId`'s own property name exactly, or Laravel silently fails to find the override and falls back to the raw field name. This is not a violation of the snake_case-leaf rule above — it is a different kind of key entirely, one Laravel itself defines the shape of, the same way a route parameter name or a Blade component prop name is never snake_cased just because it appears in a `lang/` file. Do not "fix" a camelCase `attributes` leaf to snake_case; doing so breaks the substitution instead of correcting a style slip.

## Boolean properties

Livewire component boolean properties are named as a predicate, prefixed `can`/`is`/`show`/`requires` — never a bare noun. Verified in `app/Livewire/Settings/Security.php`:

```php
public bool $canManageTwoFactor;
public bool $canManagePasskeys;
public bool $twoFactorEnabled;      // present-tense state, not prefixed — see note below
public bool $requiresConfirmation;
public bool $showModal;
public bool $showVerificationStep;
public bool $showDeleteModal;
```

Two patterns coexist in this file: `can*`/`requires*`/`show*` for capability/UI-state flags, and a bare past-participle (`twoFactorEnabled`) for a fact about the authenticated user's current state. Follow whichever of the two fits: use `can`/`requires`/`show` for UI/permission flags you're introducing, and a plain past-participle only for a mirrored model/domain fact (as `twoFactorEnabled` mirrors `User::hasEnabledTwoFactorAuthentication()`).

**The same rule binds a `#[Computed]` boolean method**, which is what a modern Livewire screen actually exposes to its view. `App\Livewire\Users\Index` carries four (task 0015a): `requiresPasswordConfirmation()`, `isEditingOwnRow()`, `isDeletingOwnRow()`, `isAdministratorRoleSelected()` — a predicate name, never a noun (`passwordConfirmation()`), and never a `get*` prefix.

**Name the predicate so it is unambiguous read *out* of its class.** `App\Actions\Auth\EnsureRecentPasswordConfirmation`'s non-throwing method is `isRecentlyConfirmed()`, deliberately not `isConfirmed()`: at the call site (`app(EnsureRecentPasswordConfirmation::class)->isRecentlyConfirmed()`) the class name supplies "password", but *recency* is the whole content of the check and a bare `isConfirmed()` reads as a yes/no about whether the password was ever confirmed at all. The invokable's own name follows the existing imperative-verb-phrase rule for actions (`Ensure…`, no `Action`/`Service` suffix), so the throwing and non-throwing halves of one rule read as a command and a question respectively.

_Last updated: 2026-08-29 — Story 0020 (Shared media gallery modal — frontend). **One correction, and it is to a warning this page added two days earlier.** The composed-label ⚠️ claimed story 0019 shipped without a `roles.modules.media` leaf, so the Roles permission matrix rendered a raw key in both locales — the page's own long-standing ❌ "arriving for real". It never arrived: both leaves (`'media' => 'Media'` / `'media' => 'Medios'`) are present in story 0019's own tree and untouched since, verified by reading the files the original claim says it read. Corrected in place with what it used to say, because the *rule* it hangs on is right and is worth keeping — a missing leaf fails nothing and is visible only by looking at the screen — and `media` is now the evidence the rule is followable rather than evidence it gets missed. This is the second false "verified" finding from story 0019's single Phase 6 pass, alongside the refusal-logging one on [architecture/authorization.md](../architecture/authorization.md#mediapolicy--the-fourth-policy-and-the-first-behind-no-route-at-all); [errors-log.md](../errors-log.md#one-docs-pass-reported-two-gaps-that-were-not-there-both-marked-verified--2026-08-29) records why one pass produced two. **Verified as unchanged rather than assumed:** the class/file table and the imperative-verb-phrase action rule (`App\Actions\Media\UpdateMediaDetails` follows it with nothing new to decide), the `Index`-in-a-subfolder exception and its `Media\Gallery` counter-example (`App\Livewire\Dev\MediaGalleryHarness` → `livewire/dev/media-gallery-harness.blade.php` is the ordinary mirror rule, and is a second confirmation that the exception keys on the class name), the `<Noun>ValidationRules` traits (`MediaValidationRules` gained a `max:2000` on an existing rule, not a method or a name), the permission-name and `<Model>Policy` sections (no permission, policy or catalog change), the route-name section (no route name), and the boolean-property rule — the story's new properties (`$open`, `$multi`, `$search`, `$editingMediaId`, `$pendingUploads`) follow the existing never-`null` and predicate-naming rules unmodified._

_Previously: 2026-08-27 — Story 0019 (Media Library upload and conversions — backend). Four changes. **Updated the quoted `RolePermissionSeeder::MODULES` constant**, which this page reproduces verbatim and which grew for the first time since task 0002 wrote it — `'media'` is the tenth slug, and a pointer now sends a reader to [what that one-line amendment actually costs](../architecture/authorization.md#the-media-module-and-what-a-catalog-amendment-costs) before they add an eleventh. **Turned this page's own ❌ into a ⚠️ about the shipped state**: the composed-label rule has warned since task 0011 that "a catalog addition silently renders a raw key", and story 0019 is where that happened — no `roles.modules.media` leaf was added to either locale, so the Roles permission matrix renders the literal key as a row label in both languages, with a fully green suite, because the seeder tests assert names and counts and never rendered copy. Recorded with the two rules that follow (add the leaf to both locales in the same change; the `roles.actions.*` half needs nothing, since a new module reuses the four existing verbs) rather than left as a prediction that came true unnoticed. Corrected the same paragraph's arithmetic — 16 keys now cover **38 of the 42** permissions, not "all 38". **Added `MediaValidationRules` to the traits section** as the fifth `<Noun>ValidationRules` trait, and the first that also carries **constants** (`MAX_UPLOAD_KB`, `MAX_DIMENSION`) beside its `<noun>Rules()` methods — the naming rule is unchanged, but a trait holding a shared limit as well as the rules that read it is new here. **Added `MediaPolicy` as the third follower** of "name a permission once on the class that owns the rule", and the first with all four CRUD constants, which leaves `UserPolicy`'s literals as one outlier in four. Also added the `Media\Gallery` counter-example to the `Index`-in-a-subfolder exception: it resolves to the **nested** `livewire/media/gallery.blade.php` by the normal mirror rule, because the exception keys on the class name and not on living in a subfolder — worth stating now that the exception is memorable enough to be over-applied. Three rows added to the class/file table. **Verified as unchanged rather than assumed:** the route-name, boolean-property and `attributes`-block sections (this story adds no route, and its two boolean-free component properties follow the existing never-`null` rule), and the `label()`-on-an-enum rule (story 0019 adds no enum)._

_Previously: 2026-08-26 — Task 0018 (Sales Regions & Taxes screen — UI). Three changes, all in **Translation keys**, and the first is the reason this page needed a pass at all. **The registry-mirroring rule's multi-word clause stopped being hypothetical.** It has read forward since task 0013 — *"a future registry key that is genuinely multi-word is snake_case on both sides (`items.sales_regions`), never kebab-case"* — naming the exact key by name against a registry in which every entry was a single lowercase word. Task 0018 shipped that key, as `sales_regions`, so the paragraph is rewritten from a prediction into a record, with the three identifiers that move together (config key, translation leaf, `data-test="sidebar-link-sales_regions"`) and the three kebab-case **values** in the same entry that correctly stay kebab because none of them is a registry key — `sales-regions.view` is the seeded catalog's, `sales-regions.index` and `sales-regions.*` are `routes/sales-regions.php`'s. The code block above it was also an under-count, listing two groups and three items where the shipped registry now has three and four. **Added the "`label()` on an enum is not automatic" rule**, because this story is where the question was live and answered *no*: story 0016 deferred `SalesRegionKind::label()` to "the first story that actually renders `kind`", 0018 is that story, and it renders `kind` as text in exactly one place while keeping the two labels in its own screen's lang file — the rule being *add `label()` when a second consumer appears, not when the first one does*. **Verified as accurate rather than rewritten:** the third `Index`-in-a-subfolder row and its stub warning (`resources/views/livewire/sales-regions.blade.php` is still the only file, and no `sales-regions/` directory exists), the `attributes`-block camelCase exception (0018 adds no `attributes` leaf — that group is 0017's), `SalesRegionValidationRules` and the `<noun>Rules()` rule (no trait changed), the permission-name and `<Model>Policy` sections (no permission, class or policy added), and the boolean-property rule (this story adds no PHP property at all — its state is Alpine's)._

_Previously: 2026-08-26 — Task 0017 (Sales Region tax configuration — backend). **The `attributes`-block exception under Translation keys was added mid-story** (Phase 5 code review nit, commit `618b865`) and is verified accurate here rather than duplicated: `lang/en/sales-regions.php` really does carry a camelCase `replacementDefaultId` leaf, and `App\Livewire\SalesRegions\Index::validate(..., attributes: __('sales-regions.attributes'))` really is what consumes it, so the leaf must equal the property name byte-for-byte. Added in this pass: a **third row** to the `Index`-in-a-subfolder exception table plus the one thing the first two rows could not demonstrate — the subfolder name is **kebab-cased** on the way down, so `App\Livewire\SalesRegions\Index` → `livewire/sales-regions.blade.php`, not `salesregions`; and the trap's other half, which 0017 walked into where 0010/0011 walked into the first — an `artisan make:` scaffold deposited an unused `livewire/sales-regions/index.blade.php` stub that broke nothing and simply sat there, so the check is "is there a second file at the wrong path", not only "did I write the right one" (verified: only the flat file exists today). Added `SalesRegionValidationRules` to **Traits**, with the property it demonstrates that the other four do not — **a `<noun>Rules()` method's noun is the *field*, not the model**, so a model-named trait holds `rateRules()` / `codeRules()` without repeating the model in each method. Added `SalesRegionPolicy` as the **second** follower of the "name a permission once on the class that owns the rule" convention, which makes `RolePolicy`'s shape the majority and `UserPolicy`'s literals the outlier — with the note that constant names shorten as the class narrows (`VIEW_PERMISSION`/`EDIT_PERMISSION` vs. `ROLE_MANAGEMENT_PERMISSION`), because the constant names the **rule** at whatever precision the class needs. Three rows added to the class/file table. Nothing else changed: this story adds no route name, no permission string, no enum and no boolean property or `#[Computed]` predicate that the existing rules do not already cover._

_Previously: 2026-08-24 — Task 0015a (step-up authentication for privileged Users actions): two additions, both to **Boolean properties**, plus two rows in the class/file table (`App\Actions\Auth\EnsureRecentPasswordConfirmation`, `App\Exceptions\PasswordConfirmationRequiredException` — both already conforming to the existing imperative-verb-phrase and `<Thing>Exception` rules, listed rather than newly ruled on). The section covered only `public bool $…` properties while a modern Livewire screen exposes `#[Computed]` boolean **methods** to its view; the rule is stated as binding both, with the story's four as the examples. Added the "name the predicate so it is unambiguous read *out* of its class" rule — `isRecentlyConfirmed()`, deliberately not `isConfirmed()`, because recency is the whole content of the check while the class name supplies "password". Nothing else on this page changed: this story adds no trait, route name, permission, translation-key group or Livewire component._

_Previously: 2026-08-22 — Task 0013 (module/sidebar access gating — UI): added the **registry-mirroring** rule to **Translation keys**, with [`lang/en/navigation.php`](../../lang/en/navigation.php) as its first real case — a lang file that exists to supply copy for a registry mirrors that registry's keys exactly, so one identifier is simultaneously the `config/modules.php` entry key, the translation leaf and the rendered `data-test` hook. Its ❌ is the literal-copy-in-config shape (unreachable from `lang/es/`) plus a renamed leaf. Recorded that this does not conflict with the snake_case-leaf rule directly above it — every registry key today is one lowercase word, and a future multi-word one is snake_case on **both** sides, unlike the permission names whose kebab-case is imposed by the seeded catalog and mapped at lookup. Nothing else in this file changed: this story adds no class, trait, route name, permission or Livewire component (its one new Blade file is an anonymous component, which the component ↔ view mirror rule does not govern)._

_Previously: 2026-08-21 — Task 0011 (Roles & permissions management — UI): extended **Translation keys** in two directions the shipped view forced. First, the `trans_choice()` rule now states explicitly that it binds a **Blade template** too — `roles.index.permission_count` shipped its first draft with the `|`-delimited plural written inline in `resources/views/livewire/roles.blade.php`, unreachable by `lang/es/` (Phase 5 finding F-3), and `roles.index.summary` is the third key in that group. Second, added the **composed-label / snake_case-leaf** convention with its real ✅/❌ pair: the seeded catalog's names are kebab-case and fixed, so the segment is mapped to its key at lookup (`sales-regions` → `sales_regions`) and the labels are composed from a 10-key `modules` array and a 6-key `actions` array — never one key per permission, and never by renaming the permission._

_Previously: 2026-08-20 — Task 0010 (Roles & permissions management — backend): added the `trans_choice()` / `|`-delimited plural convention to **Translation keys**, with `lang/en/roles.php`'s `delete_blocked` as the ✅ and a two-key/branch-in-PHP ❌; added `RoleValidationRules` to **Traits** with the note that it and `UserValidationRules` are named after the model whose input they describe rather than the screen that submits it; added `App\Livewire\Roles\Index` → `livewire/roles.blade.php` as the second row of the `Index`-in-a-subfolder exception table, with the "resolve the view path by running the component" habit this story's own spec got wrong; and listed `EnforceGrantorPermissionScope` and `RoleInUseException` in the class/file table._

_Previously: 2026-08-20 — Task 0009: added the "name a permission once on the class that owns the rule" convention to **Permission names**, with `RolePolicy`'s two `public const` names as the ✅ example and `UserPolicy`'s four remaining literals as the deferred ❌ (finding F5), and listed `App\Actions\Roles\EnforceAdministratorPermissionGrant` in the class/file table — an imperative verb phrase with no `Action` suffix, matching the existing invokable-action rule._

_Previously: 2026-08-19 — Task 0008a: recorded that `App\Enums\RoleName`'s backing values are deliberately the persisted role names rather than lowercase (they are compared byte-for-byte against a row), and the `is<Thing>(self $x): bool` naming for a model's shared identity predicates — including why `isSuperAdminRoleRow()` carries a suffix its sibling does not, and why that is a wart to avoid repeating rather than a pattern to copy._

_Previously: 2026-08-13 — Task 0004: documented the `<Model>Policy` / bare-verb-ability naming that Laravel's policy auto-discovery makes load-bearing, added `UserValidationRules` and the flat-composition rule to the traits section, and recorded Livewire's `Index`-in-a-subfolder exception to the component ↔ view mirror rule (`App\Livewire\Users\Index` → `livewire/users.blade.php`)._
