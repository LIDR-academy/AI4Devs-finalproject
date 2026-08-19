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
| `App\Policies\UserPolicy` | `app/Policies/UserPolicy.php` |

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

Practical consequence when adding the next module screen: an `Index` component for a new area lands at `resources/views/livewire/<area>.blade.php`, one level *shallower* than its class. Any other component in that same subfolder (`App\Livewire\Users\Editor` → `livewire/users/editor.blade.php`) follows the normal mirror rule, so the two live at different depths — that asymmetry is expected, not a mistake.

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
    'customers', 'orders', 'blog', 'store-languages',
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

**Where a permission name is written in PHP, name it once on the class that owns the rule.** Task 0009 established this for the two role-management names, as `public const` on the policy that decides with them — read by the policy itself, by `App\Actions\Roles\EnforceAdministratorPermissionGrant`, and by both classes' tests:

```php
// app/Policies/RolePolicy.php
public const ADMINISTRATOR_LEVEL_PERMISSION = 'roles.manage-administrators';
public const ROLE_MANAGEMENT_PERMISSION = 'roles.manage';
```

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

Note `APP_LOCALE=en` today, so everything renders in English until the interface language switcher exists — an accepted, documented consequence of the English-source decision, not a defect. Adding a key means adding it to **both** `lang/en/` and `lang/es/` in the same change.

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

_Last updated: 2026-08-20 — Task 0009: added the "name a permission once on the class that owns the rule" convention to **Permission names**, with `RolePolicy`'s two `public const` names as the ✅ example and `UserPolicy`'s four remaining literals as the deferred ❌ (finding F5), and listed `App\Actions\Roles\EnforceAdministratorPermissionGrant` in the class/file table — an imperative verb phrase with no `Action` suffix, matching the existing invokable-action rule._

_Previously: 2026-08-19 — Task 0008a: recorded that `App\Enums\RoleName`'s backing values are deliberately the persisted role names rather than lowercase (they are compared byte-for-byte against a row), and the `is<Thing>(self $x): bool` naming for a model's shared identity predicates — including why `isSuperAdminRoleRow()` carries a suffix its sibling does not, and why that is a wart to avoid repeating rather than a pattern to copy._

_Previously: 2026-08-13 — Task 0004: documented the `<Model>Policy` / bare-verb-ability naming that Laravel's policy auto-discovery makes load-bearing, added `UserValidationRules` and the flat-composition rule to the traits section, and recorded Livewire's `Index`-in-a-subfolder exception to the component ↔ view mirror rule (`App\Livewire\Users\Index` → `livewire/users.blade.php`)._
