# Base Standards

Baseline stack versions and project-structure standards for this Laravel + Livewire application. This is the "what shape does new code take" reference; for line-level style (types, braces, PHPDoc) see [code-style.md](code-style.md), and for identifier naming see [naming.md](naming.md).

## Table of Contents

- [Stack versions](#stack-versions)
- [Directory structure](#directory-structure)
  - [Controllers sit in front of actions, not instead of them](#controllers-sit-in-front-of-actions-not-instead-of-them)
  - [An authorization rule belongs to the action, not to one of its callers](#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
- [Model conventions](#model-conventions)
  - [Deleting a user goes through the model, not the query builder](#deleting-a-user-goes-through-the-model-not-the-query-builder)
  - [UUID primary keys](#uuid-primary-keys)
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

Frontend: Tailwind CSS v4 + Vite (see [`vite.config.js`](../../vite.config.js), [`package.json`](../../package.json)). `pest-plugin-browser` drives real-browser tests through Playwright (`playwright` `^1.61.1` in `package.json` `devDependencies`); the wired-up `tests/Browser/` suite, its one-time browser-binary setup, and what CI does and does not cover live in [../testing/frontend/playwright-setup.md](../testing/frontend/playwright-setup.md).

## Directory structure

Real top-level layout — stick to it; don't create new base folders without approval (per project `CLAUDE.md`):

```
app/
  Actions/Fortify/    Fortify contract implementations (CreatesNewUsers, ResetsUserPasswords)
  Actions/Users/       Domain actions for the Users area (RequestEmailChange, ConfirmEmailChange,
                       CreateUser, UpdateUser — the last two authorize their own operation)
  Concerns/            Shared traits (validation rule sets)
  Console/Commands/    Artisan commands
  Enums/               Backed enums for domain value sets (UserStatus, RoleName)
  Exceptions/          Domain exceptions that render their own response (ImmutableRoleException)
  Http/Controllers/    Abstract base + domain controllers used as HTTP boundaries in front of actions
  Listeners/           Event listeners (ActivateVerifiedUser), registered in AppServiceProvider
  Livewire/            Livewire components, grouped by area (Settings/, Settings/TwoFactor/, Actions/)
  Models/              Eloquent models (User; Role, which subclasses the package's role model)
  Notifications/       Notification classes (PendingEmailVerification, UserInvitation)
  Policies/            Eloquent model policies (UserPolicy), auto-discovered by name
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
routes/                 web.php, plus one file per functional area that web.php requires
                        (settings.php, users.php) — no api.php yet
tests/
  Feature/              Feature tests, mirrors app structure (Auth/, Settings/, Seeders/, ...)
  Unit/                 Mirrors app structure too (Enums/, Exceptions/, Listeners/, Models/), plus ArchitectureTest.php
  Browser/              Pest browser tests, mirrors app structure too (Auth/)
  Pest.php, TestCase.php
```

`app/Enums/`, `app/Exceptions/`, `app/Listeners/`, `app/Notifications/`, `app/Policies/` and `lang/` are all **stock Laravel locations** (`make:enum`, `make:exception`, `make:listener`, `make:notification`, `make:policy`, `lang:publish`), not new base folders — creating one of them needs no approval; inventing a folder Laravel doesn't ship does.

`app/Policies/` in particular is **registration-free**: Laravel 13 auto-discovers `App\Policies\<Model>Policy` for `App\Models\<Model>`, so `UserPolicy` binds to `User` by naming alone. This repo has no `AuthServiceProvider` and does not need one — do not add one to register a conventionally-named policy. What each ability means lives in [architecture/authorization.md](../architecture/authorization.md#policies), not here.

`routes/` follows the same one-per-area shape: `web.php` declares only the app-wide routes (`home`, `dashboard`) and then `require`s one file per functional area — `settings.php`, and `users.php` since task 0040, which moved `users.index` out of `web.php` so it stops being the one route that didn't follow the pattern. A new area's routes go in a new `routes/<area>.php` with its own middleware group, appended as another `require` line rather than inlined into `web.php`; what each route contract actually is belongs to [api/routes.md](../api/routes.md).

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

### An authorization rule belongs to the action, not to one of its callers

Task 0008a established this by removing a real gap: the Administrator-tier guards lived only in `App\Livewire\Users\Index`, so `CreateUser` / `UpdateUser` were **completely ungated** for any other caller — a future API endpoint, Artisan command or queued job would have inherited nothing. The rule: **if an operation must not happen without a permission, the check lives in the class that performs the operation.** A caller may authorize too (defence in depth), but it may not be the only place the rule exists.

✅ Good — the action authorizes as its own first statements, before opening any transaction:

```php
// app/Actions/Users/CreateUser.php
public function __invoke(string $name, string $email, string $roleId, UserStatus $status): User
{
    Gate::authorize('create', User::class);
    // ...
}
```

❌ Bad — the shape this replaced (adapted from the deleted `Index::createNewUser()`; the action itself checked nothing):

```php
// anti-pattern — the rule is a property of one caller, not of the operation
if ((int) $validated['roleId'] === $this->administratorRoleId()) {
    Gate::authorize('promoteToAdministrator', User::class);
}

$createUser(/* ... */);
```

Three constraints that come with it, each learned from this story's audits:

- **Move the rule, never copy it.** Two implementations of one rule is drift waiting to happen; `Index::authorizeRoleChange()` and `administratorRoleId()` were *deleted*, not converted.
- **Derive a security-relevant flag internally; never take it as a parameter.** `UpdateUser` used to receive `bool $applyRoleAndStatus` — the self-lockout guard — from its caller. Once an action is independently callable, that is a one-argument bypass, so the action now derives it from `Auth::user()` itself.
- **Authorize before the first write, and re-read what you authorize against.** Every check sits above the action's `DB::transaction()`, and any relation an authorization decision consults is reloaded before the first check that reads it — see [security/authorization-patterns.md](../security/authorization-patterns.md#authorization-that-consults-a-relation-must-reload-it-before-the-first-check-reads-it).

What the rules themselves say, and why a rule that must bind a Super Admin actor is a direct `throw` rather than a `Gate` check, belongs to [architecture/authorization.md](../architecture/authorization.md#the-guard-belongs-to-the-action-not-to-the-caller), not here.

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

`casts()` also carries enum casts (`'status' => UserStatus::class`, `'deleted_at' => 'datetime'`), and the **omission** of a column from `#[Fillable]` *is* this codebase's mass-assignment guard: `users.status` and `users.pending_email` are deliberately absent from `User`'s `#[Fillable]` list, so the only way to write them is an explicit `forceFill()` **from one named place** — today the `app/Actions/Users/` actions that own the email-change flow, plus `User::delete()`'s obfuscation write (see below), each of which is the single writer of the columns it touches. When you add a column that no form may set, leave it out of `#[Fillable]` and write it that way — don't add it and then filter the input at each call site.

Every property is documented with a `@property` PHPDoc block above the class, matching the actual database columns (see the block above `class User` in `app/Models/User.php`) — keep this block in sync with the migration whenever a column is added or removed (this is exactly the kind of drift the `docs-maintainer` skill and this file exist to catch).

### Deleting a user goes through the model, not the query builder

`App\Models\User` is the one model using `Illuminate\Database\Eloquent\SoftDeletes` today (task 0005), and it overrides `delete()` so that a delete also obfuscates the account's email, nulls `email_verified_at` / `pending_email`, and revokes the account's `password_reset_tokens` rows — all in one transaction. What those semantics *are* belongs to [database/schema.md](../database/schema.md#soft-deletes); the convention here is narrower and easy to break by accident: **an override on `delete()` only runs for instance deletes**, so the query builder is not an equivalent shortcut.

✅ Good — delete a resolved instance, which is what every call site in the repo does:

```php
// app/Livewire/Users/Index.php — deleteUser()
$target->delete();
```

❌ Bad — a bulk delete through the builder (adapted to illustrate; not present in the repo):

```php
// anti-pattern — never do this against users
User::whereIn('id', $ids)->delete();
```

`Builder::delete()` never instantiates a model, so it silently skips the override entirely: the rows are stamped `deleted_at` while keeping their live email addresses and their still-valid password-reset tokens. Same trap for any future model that puts real behavior on `delete()` — put the behavior on the model, then keep every call site on instances.

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

_Last updated: 2026-08-20 — Task 0040: corrected the `routes/` line of the directory listing (`web.php` plus one file per functional area — `settings.php`, `users.php`) and stated the convention behind it: `web.php` holds only the app-wide routes and `require`s an area file per module, so a new area gets a new `routes/<area>.php` rather than another inline block. `users.index` was the one route not following that shape until this story moved it._

_Previously, 2026-08-19 — Task 0008a: added the "An authorization rule belongs to the action, not to one of its callers" convention with its real ✅/❌ pair (the deleted `Index::createNewUser()` gate vs. `CreateUser`'s own first statement) and its three constraints — move the rule rather than copy it, derive a security-relevant flag internally rather than accept it as a parameter, and authorize before the first write against freshly-reloaded state. Noted `CreateUser` / `UpdateUser` in the `app/Actions/Users/` directory listing._

_Previously, 2026-08-18 — Task 0008: added `app/Exceptions/` to the directory listing and folded it into the "stock Laravel locations … needs no approval" sentence alongside `app/Enums/` and `app/Policies/`; noted `App\Models\Role` beside `User`, `RoleName` beside `UserStatus`, and `tests/Unit/`'s new `Exceptions/` folder and `ArchitectureTest.php`. What the role model's guards do lives in [architecture/authorization.md](../architecture/authorization.md#the-super-admin-roles-invariants), not here._

_Previously, 2026-08-16 — Task 0006b: added `tests/Browser/` to the directory-structure listing and corrected the browser-testing sentence, which still described the suite wiring as pending._

_Previously, 2026-08-14 — Task 0005: widened the `forceFill()` mass-assignment note from "in an action" to "from one named place" now that `User::delete()` is a second such writer, and added the "deleting a user goes through the model, not the query builder" convention with its ✅/❌ pair._
