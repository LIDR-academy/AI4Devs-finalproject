# Naming Conventions

Real naming patterns observed across the codebase. For migration file naming specifically, see [database/migrations.md](../database/migrations.md#file-naming) — not repeated here.

## Table of Contents

- [Classes](#classes)
- [Livewire components and views](#livewire-components-and-views)
- [Traits and their methods](#traits-and-their-methods)
- [Route names](#route-names)
- [Boolean properties](#boolean-properties)

## Classes

One class per file, `StudlyCase`, filename matches class name exactly (PSR-4). Verified across `app/Actions/Fortify/`, `app/Livewire/`, `app/Concerns/`:

| Class | File |
| --- | --- |
| `App\Actions\Fortify\CreateNewUser` | `app/Actions/Fortify/CreateNewUser.php` |
| `App\Livewire\Settings\TwoFactor\RecoveryCodes` | `app/Livewire/Settings/TwoFactor/RecoveryCodes.php` |
| `App\Livewire\Actions\Logout` | `app/Livewire/Actions/Logout.php` |

Single-purpose invokable actions are named as an imperative verb phrase, not suffixed with `Action` or `Service`: `Logout`, `CreateNewUser`, `ResetUserPassword` (Fortify's own convention, followed consistently by this app's own `Logout` action).

## Livewire components and views

Component class is `StudlyCase`; its Blade view is the **kebab-case** version of the class name, in a mirrored directory structure under `resources/views/livewire/`:

| Component | View |
| --- | --- |
| `App\Livewire\Settings\Security` | `resources/views/livewire/settings/security.blade.php` |
| `App\Livewire\Settings\Profile` | `resources/views/livewire/settings/profile.blade.php` |
| `App\Livewire\Settings\DeleteUserForm` | `resources/views/livewire/settings/delete-user-form.blade.php` |

✅ Good — `DeleteUserForm` → `delete-user-form.blade.php` (each word boundary becomes a hyphen).
❌ Bad — do not use `deleteuserform.blade.php` or `DeleteUserForm.blade.php`; Livewire's convention-based view resolution expects the kebab-case mirror.

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
    protected function profileRules(?int $userId = null): array { /* ... */ }
    protected function nameRules(): array { /* ... */ }
    protected function emailRules(?int $userId = null): array { /* ... */ }
}
```

When adding a new validation concern, follow this exact pattern: `<Noun>ValidationRules` trait, `<noun>Rules()` methods — don't introduce a differently-named alternative (e.g. `getPasswordValidation()`).

## Route names

Dot notation, `<resource>.<action>`, verified in `routes/settings.php`:

```php
// routes/settings.php
Route::livewire('settings/profile', Profile::class)->name('profile.edit');
Route::livewire('settings/appearance', Appearance::class)->name('appearance.edit');
Route::livewire('settings/security', Security::class)->name('security.edit');
```

Full real route names, including the ones Fortify registers, are listed in [api/routes.md](../api/routes.md).

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

_Last updated: 2026-07-12 — Initial scaffold of the documentation set by the docs-maintainer skill._
