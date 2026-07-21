# Authorization

Cross-cutting concern — single source of truth for roles & permissions. Other documents link here instead of re-explaining it.

## Table of Contents

- [Stack](#stack)
- [Current state](#current-state)
- [Configuration](#configuration)
- [How to use it](#how-to-use-it)
- [Where it lives](#where-it-lives)

## Stack

`spatie/laravel-permission` (`^8.3`) is installed and its `HasRoles` trait **is attached** to the `User` model, so the package API (`assignRole()`, `hasRole()`, `hasPermissionTo()`, …) is callable today:

```php
// app/Models/User.php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;
    // HasRoles is in the trait list — $user->assignRole(...) etc. are callable.
}
```

## Current state

⚠️ The trait is attached and its API is callable, but **nothing in the application exercises roles or permissions yet** — no roles/permissions are defined, assigned, or checked anywhere:

- `HasRoles` is in `User`'s trait list (`app/Models/User.php` line 37), so `$user->assignRole(...)` / `hasRole(...)` / `hasPermissionTo(...)` work — but no code calls them.
- No route, controller, or Livewire component calls `hasRole()`, `hasPermissionTo()`, `assignRole()`, or `can()` against a Spatie permission.
- `database/seeders/DatabaseSeeder.php` seeds a single plain `User` with **no role assigned**, and no seeder creates any `Role` or `Permission` rows — the `roles` / `permissions` tables are empty.
- No `role:` or `permission:` middleware is registered on any route in `routes/web.php` or `routes/settings.php`.

This document will be updated with real usage examples (which roles exist, which routes/actions they gate) as soon as roles/permissions are actually seeded and a real `assignRole()` / `middleware('role:...')` call lands in the codebase — do not add speculative examples before that happens.

## Configuration

Teams support is **disabled** (single-tenant permission model):

```php
// config/permission.php
'teams' => false,
```

Table names are the package defaults:

| Config key | Table |
| --- | --- |
| `table_names.roles` | `roles` |
| `table_names.permissions` | `permissions` |
| `table_names.model_has_roles` | `model_has_roles` |
| `table_names.model_has_permissions` | `model_has_permissions` |
| `table_names.role_has_permissions` | `role_has_permissions` |

Permission checks are cached for 24 hours by default (`config/permission.php`, `'cache'` section) and the cache is flushed automatically whenever a role/permission is created, updated, or deleted through the package's own methods.

The schema (all five tables plus how they relate to `users`) is documented once in [database/schema.md](../database/schema.md) — this file does not repeat the ER diagram.

## How to use it

`HasRoles` is already attached to `User`, so the standard Spatie API is available now (it is simply not called anywhere yet):

```php
$user->assignRole('admin');
$user->hasRole('admin');
$user->hasPermissionTo('edit articles');
```

Route gating with the package's middleware aliases (`role`, `permission`, `role_or_permission`) once registered in `bootstrap/app.php`.

## Where it lives

| Concern | Path |
| --- | --- |
| Package config | `config/permission.php` |
| Migration | `database/migrations/2026_07_12_181045_create_permission_tables.php` |
| Trait usage | `app/Models/User.php` |

_Last updated: 2026-07-21 — Corrected doc-vs-code drift: `HasRoles` **is** attached to `User` (verified against `app/Models/User.php` line 37); reworded Stack/Current state/How-to-use-it to reflect the trait being attached and callable while roles/permissions remain unexercised (no roles seeded, no gating, no calls)._
