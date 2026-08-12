# Base Standards

Baseline stack versions and project-structure standards for this Laravel + Livewire application. This is the "what shape does new code take" reference; for line-level style (types, braces, PHPDoc) see [code-style.md](code-style.md), and for identifier naming see [naming.md](naming.md).

## Table of Contents

- [Stack versions](#stack-versions)
- [Directory structure](#directory-structure)
  - [Controllers sit in front of actions, not instead of them](#controllers-sit-in-front-of-actions-not-instead-of-them)
- [Model conventions](#model-conventions)
- [Livewire component convention: class-based, not single-file](#livewire-component-convention-class-based-not-single-file)
- [Artisan-first workflow](#artisan-first-workflow)
- [Quality gates](#quality-gates)

## Stack versions

From [`composer.json`](../../composer.json):

| Package | Constraint |
| --- | --- |
| `php` | `^8.3` |
| `laravel/framework` | `^13.17` |
| `laravel/fortify` | `^1.37.2` |
| `livewire/livewire` | `^4.1` |
| `livewire/flux` | `^2.13.1` |
| `spatie/laravel-permission` | `^8.3` |
| `pestphp/pest` (dev) | `^4.7` |
| `pestphp/pest-plugin-browser` (dev) | `^4.3` |
| `larastan/larastan` (dev) | `^3.9` |
| `laravel/pint` (dev) | `^1.27` |

Frontend: Tailwind CSS v4 + Vite (see [`vite.config.js`](../../vite.config.js), [`package.json`](../../package.json)). `pest-plugin-browser` drives real-browser tests through Playwright (`playwright` `^1.61.1` in `package.json` `devDependencies`); its install status, one-time browser-binary setup, and pending suite wiring live in [../testing/frontend/playwright-setup.md](../testing/frontend/playwright-setup.md).

## Directory structure

Real top-level layout — stick to it; don't create new base folders without approval (per project `CLAUDE.md`):

```
app/
  Actions/Fortify/    Fortify contract implementations (CreatesNewUsers, ResetsUserPasswords)
  Actions/Users/       Domain actions for the Users area (RequestEmailChange, ConfirmEmailChange)
  Concerns/            Shared traits (validation rule sets)
  Console/Commands/    Artisan commands
  Enums/               Backed enums for domain value sets (UserStatus)
  Http/Controllers/    Abstract base + domain controllers used as HTTP boundaries in front of actions
  Listeners/           Event listeners (ActivateVerifiedUser), registered in AppServiceProvider
  Livewire/            Livewire components, grouped by area (Settings/, Settings/TwoFactor/, Actions/)
  Models/              Eloquent models
  Notifications/       Notification classes (PendingEmailVerification)
  Providers/           Service providers (AppServiceProvider, FortifyServiceProvider)
config/                Laravel + package config (fortify.php, permission.php, ...)
database/
  factories/
  migrations/
  seeders/
lang/                   Published translation files, one folder per locale (en/, es/)
resources/
  views/
    components/        Blade components
    layouts/            Auth/app layout shells
    livewire/           Views for Livewire components AND plain auth Blade views (see naming.md)
    partials/
routes/                 web.php, settings.php (no api.php yet)
tests/
  Feature/              Feature tests, mirrors app structure (Auth/, Settings/, Seeders/, ...)
  Unit/                 Mirrors app structure too (Enums/, Listeners/, Models/)
  Pest.php, TestCase.php
```

`app/Enums/`, `app/Listeners/`, `app/Notifications/` and `lang/` are all **stock Laravel locations** (`make:enum`, `make:listener`, `make:notification`, `lang:publish`), not new base folders — creating one of them needs no approval; inventing a folder Laravel doesn't ship does.

`app/Actions/` groups by concern, one subfolder per area: `Fortify/` holds the framework-contract implementations, `Users/` the app's own Users-domain actions. A new action goes in the subfolder for its domain (or directly under `app/Actions/` if it belongs to none) — never nested under an unrelated one.

### Controllers sit in front of actions, not instead of them

`App\Http\Controllers\ConfirmEmailChangeController` is this repo's first domain controller, and it exists for a specific reason worth generalizing: **a controller is added only when there is an HTTP-specific concern — route-parameter binding, building a redirect response — that an `app/Actions/` class should not absorb.** The action stays a plain domain operation; the controller adapts HTTP to it.

✅ Good — the real controller: it turns the URL's `{hash}` segment into a verified address, delegates, and branches on the action's `bool` result to pick a redirect:

```php
// app/Http/Controllers/ConfirmEmailChangeController.php
public function __invoke(User $user, string $hash, ConfirmEmailChange $confirmEmailChange): RedirectResponse
{
    if ($user->pending_email === null || ! hash_equals(sha1($user->pending_email), $hash)) {
        return redirect()->route('profile.edit')->with('status', __('users.email_change.refused'));
    }

    if (! $confirmEmailChange($user, $user->pending_email)) {
        return redirect()->route('profile.edit')->with('status', __('users.email_change.refused'));
    }

    return redirect()->route('profile.edit')->with('status', __('users.email_change.confirmed'));
}
```

Note the action is injected as a **trailing container-resolved parameter**, after the route parameters — the same per-method action-injection convention the Livewire components use (see [code-style.md](code-style.md#inject-single-purpose-actions-per-method)).

❌ Bad — routing the action class directly (adapted to illustrate; this is what the controller exists to avoid):

```php
// anti-pattern — do not do this
Route::get('settings/email/confirm/{user}/{hash}', ConfirmEmailChange::class);
```

`ConfirmEmailChange::__invoke(User $user, string $email)` takes the *address*, while the URL's second segment is `{hash}`. Laravel binds non-class-typed parameters positionally against the remaining route parameters, so the hash would land in `$email` and the equality check could never succeed — silently, with no error. On top of that, the action returns `bool`, which cannot be a response.

Corollary: don't invert this either. A controller that re-implements the domain logic instead of delegating to an action puts business rules somewhere the Livewire components and future admin screens can't reuse them.

## Model conventions

This codebase uses PHP 8 attributes for mass-assignment and serialization instead of the classic `$fillable`/`$hidden` properties, and a `casts()` method instead of a `$casts` property — both are Laravel 13 idioms:

```php
// app/Models/User.php
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

✅ Good — new models follow the same attribute-based style (`#[Fillable]`, `#[Hidden]`, `casts()` method).
❌ Bad — mixing the old property-based style into a new model (adapted to illustrate; not present in the repo):
```php
// anti-pattern — do not introduce this alongside the attribute-based style
class Post extends Model
{
    protected $fillable = ['title', 'body'];
    protected $hidden = ['internal_notes'];
}
```
Mixing both styles in the same codebase makes it unclear which one governs a given model at a glance.

`casts()` also carries enum casts (`'status' => UserStatus::class`), and the **omission** of a column from `#[Fillable]` *is* this codebase's mass-assignment guard: `users.status` and `users.pending_email` are deliberately absent from `User`'s `#[Fillable]` list, so the only way to write them is an explicit `forceFill()` in an action. When you add a column that no form may set, leave it out of `#[Fillable]` and write it from one named place — don't add it and then filter the input at each call site.

Every property is documented with a `@property` PHPDoc block above the class, matching the actual database columns (see the block above `class User` in `app/Models/User.php`) — keep this block in sync with the migration whenever a column is added or removed (this is exactly the kind of drift the `docs-maintainer` skill and this file exist to catch).

### UUID primary keys

> **`User` is the live example (Epic 1, done).** `App\Models\User` is now a real UUID-PK model — its `id` is a UUID (v7) string, per [ADR 0001 — UUID primary keys](../decisions/0001-uuid-primary-keys.md). This subsection documents the convention it follows, which **every new model** in PRD Epics 2 and 4 (products, product variants, product categories, blog categories, blog tags, blog posts) must also follow once those are built — they do not exist in code yet. The rationale and the `users`-table migration impact live in ADR 0001; this subsection is only the code-shape convention.

These models key on a UUID **version 7** generated by Laravel 13's native `HasUuids` trait (`Illuminate\Database\Eloquent\Concerns\HasUuids`), whose default `newUniqueId()` returns `Str::uuid7()` (time-ordered, not random UUIDv4). The convention:

- Add `use HasUuids;` to the model's trait list alongside whatever other traits it needs (e.g. `HasFactory`) — do not substitute a different UUID-generation trait or a custom `newUniqueId()` override (`HasUlids` was considered and rejected — see [ADR 0001](../decisions/0001-uuid-primary-keys.md)).
- Type the `@property` PHPDoc for `id` as `string`, not `int`.
- Do **not** declare `$keyType` or `$incrementing` as properties. The trait's `HasUniqueStringIds` concern already overrides `getKeyType()` / `getIncrementing()` as methods, so restating them as properties is redundant.
- Route-model binding needs no syntax change (`{model}` still binds on `id`). Note one behavioral change: `resolveRouteBindingQuery()` validates the parameter with `Str::isUuid()` first, so a malformed non-UUID route parameter throws `ModelNotFoundException` (a 404) immediately rather than running a doomed query.
- Factories need no change — the trait populates the key just before insert, exactly as today's auto-increment models never set `id` in their factory `definition()`.

✅ Good — the real, current shape, from `App\Models\User`: `HasUuids` sits in the trait list and `id` is `@property string`, with no `$keyType`/`$incrementing` properties:
```php
// app/Models/User.php
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $name
 * // ...
 */
#[Fillable(['name', 'email', 'password'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, HasUuids, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;
}
```
❌ Bad — restating what the trait already provides (adapted to illustrate; not present in the repo):
```php
// anti-pattern — do not do this; HasUuids already overrides these as methods
class Product extends Model
{
    use HasUuids;

    protected $keyType = 'string';   // redundant
    public $incrementing = false;    // redundant
}
```

The migration side of this convention (`$table->uuid('id')->primary();`, `foreignUuid(...)`) is documented in [database/migrations.md](../database/migrations.md#uuid-primary-keys).

## Livewire component convention: class-based, not single-file

Livewire 4 supports single-file components (PHP + Blade in one `.blade.php`), but this project consistently uses the **class-based / multi-file** form: a `Livewire\Component` subclass in `app/Livewire/**` paired with a same-named kebab-case view in `resources/views/livewire/**` (see [naming.md](naming.md#livewire-components-and-views)):

```php
// app/Livewire/Settings/Appearance.php — minimal example of the pattern
namespace App\Livewire\Settings;

use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('Appearance settings')]
class Appearance extends Component
{
    //
}
```

Every Livewire route in `routes/settings.php` is mounted with `Route::livewire('<uri>', <Component>::class)`, and every component declares its page `#[Title(...)]` attribute rather than setting the title from the Blade view. Follow this pattern for new settings/feature pages instead of introducing single-file components, to keep the codebase's one way of doing this.

## Artisan-first workflow

Per project `CLAUDE.md` (Laravel Boost guidelines): use `php artisan make:*` to scaffold new files (models, migrations, controllers, tests, etc.) instead of hand-writing boilerplate, and pass `--no-interaction` plus the correct options. Use `php artisan make:test --pest <Name>` for tests (see [pest-testing skill](../../.claude/skills/pest-testing/SKILL.md)).

## Quality gates

Every PHP change in this repo should pass, in this order, before being considered done:

1. `php artisan test --compact --filter=<Name>` — narrowest relevant test(s) first, matching [`tests/Feature/**`](../../tests) structure.
2. `vendor/bin/pint --dirty --format agent` — auto-fixes formatting against the `laravel` preset (`pint.json`).
3. Larastan level 7 (`phpstan.neon`) for static analysis on `app/`, `bootstrap/app.php`, `config/`, `database/`, `routes/`.

_Last updated: 2026-08-12 — Task 0003: added `app/Actions/Users/`, `app/Enums/`, `app/Listeners/`, `app/Notifications/` and `lang/` to the directory listing, rewrote the `app/Http/Controllers/` line now that `ConfirmEmailChangeController` is the repo's first domain controller (with the "controller in front of an action" convention it establishes), and recorded that omission from `#[Fillable]` is the mass-assignment guard for `status` / `pending_email`._
