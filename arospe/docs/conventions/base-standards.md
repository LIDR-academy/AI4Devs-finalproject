# Base Standards

Baseline stack versions and project-structure standards for this Laravel + Livewire application. This is the "what shape does new code take" reference; for line-level style (types, braces, PHPDoc) see [code-style.md](code-style.md), and for identifier naming see [naming.md](naming.md).

## Table of Contents

- [Stack versions](#stack-versions)
- [Directory structure](#directory-structure)
  - [Controllers sit in front of actions, not instead of them](#controllers-sit-in-front-of-actions-not-instead-of-them)
  - [An authorization rule belongs to the action, not to one of its callers](#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  - [An app-owned config file is a registry, and must survive `config:cache`](#an-app-owned-config-file-is-a-registry-and-must-survive-configcache)
- [Model conventions](#model-conventions)
  - [Deleting a user goes through the model, not the query builder](#deleting-a-user-goes-through-the-model-not-the-query-builder)
  - [UUID primary keys](#uuid-primary-keys)
- [Livewire component convention: class-based, not single-file](#livewire-component-convention-class-based-not-single-file)
- [Artisan-first workflow](#artisan-first-workflow)
- [Quality gates](#quality-gates)
  - [Steps 1 and 2 are the *iteration* forms](#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done)

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
  Actions/Roles/       Domain actions for the Roles area (EnforceAdministratorPermissionGrant,
                       EnforceGrantorPermissionScope — both pure transformers over a save payload)
  Actions/Users/       Domain actions for the Users area (RequestEmailChange, ConfirmEmailChange,
                       CreateUser, UpdateUser — the last two authorize their own operation)
  Concerns/            Shared traits (validation rule sets)
  Console/Commands/    Artisan commands
  Enums/               Backed enums for domain value sets (UserStatus, RoleName, SalesRegionKind)
  Exceptions/          Domain exceptions that render their own response (ImmutableRoleException → 403,
                       RoleInUseException → 409)
  Http/Controllers/    Abstract base + domain controllers used as HTTP boundaries in front of actions
  Listeners/           Event listeners (ActivateVerifiedUser), registered in AppServiceProvider
  Livewire/            Livewire components, grouped by area (Users/, Roles/, Settings/,
                       Settings/TwoFactor/, Actions/)
  Models/              Eloquent models (User, SalesRegion; Role, which subclasses the package's
                       role model)
  Notifications/       Notification classes (PendingEmailVerification, UserInvitation)
  Policies/            Eloquent model policies (UserPolicy, RolePolicy), auto-discovered by name
  Providers/           Service providers (AppServiceProvider, FortifyServiceProvider)
config/                Laravel + package config (fortify.php, permission.php, ...), plus
                        modules.php — the one app-owned config file (see below)
database/
  data/                 Bundled, version-controlled fixture data a seeder reads — not seeder
                        classes (iso-3166-countries.json, plus its own README stating provenance)
  factories/
  migrations/
  seeders/
lang/                   Published translation files, one folder per locale (en/, es/), plus
                        app-owned domain files kept key-for-key identical across both
                        (users.php, roles.php, navigation.php)
resources/
  views/
    components/        Blade components — all anonymous (no app/View/Components/ in this repo)
    layouts/            Auth/app layout shells
    livewire/           Views for Livewire components AND plain auth Blade views (see naming.md)
    partials/
routes/                 web.php, plus one file per functional area that web.php requires
                        (settings.php, roles.php, users.php) — no api.php yet
tests/
  Feature/              Feature tests, mirrors app structure (Auth/, Settings/, Seeders/, Users/,
                        Roles/, Models/, Policies/, Authorization/, Navigation/, ...)
  Unit/                 Mirrors app structure too (Enums/, Exceptions/, Listeners/, Models/), plus ArchitectureTest.php
  Browser/              Pest browser tests, mirrors app structure too (Auth/)
  Pest.php, TestCase.php
```

`app/Enums/`, `app/Exceptions/`, `app/Listeners/`, `app/Notifications/`, `app/Policies/` and `lang/` are all **stock Laravel locations** (`make:enum`, `make:exception`, `make:listener`, `make:notification`, `make:policy`, `lang:publish`), not new base folders — creating one of them needs no approval; inventing a folder Laravel doesn't ship does.

`app/Policies/` in particular is **registration-free**: Laravel 13 auto-discovers `App\Policies\<Model>Policy` for `App\Models\<Model>`, so `UserPolicy` binds to `User` by naming alone. This repo has no `AuthServiceProvider` and does not need one — do not add one to register a conventionally-named policy. What each ability means lives in [architecture/authorization.md](../architecture/authorization.md#policies), not here.

`database/data/` is the one folder here that Laravel does **not** ship, so it needed the approval `CLAUDE.md` requires — it exists because [PRD §2.4](../PRD/PRD.md) mandates that the country list ship as a bundled fixture in this repository rather than as a Composer dependency (`league/iso3166`, `symfony/intl`). It holds **data a seeder reads**, never a seeder class and never generated output: today one JSON file plus [`database/data/README.md`](../../database/data/README.md), which states the fixture's provenance, its shape, what is deliberately excluded from it, and how to refresh it. A new file lands here only under the same test — bundled, reviewable in a diff, and read by something in `database/seeders/`.

`routes/` follows the same one-per-area shape: `web.php` declares only the app-wide routes (`home`, `dashboard`) and then `require`s one file per functional area — `settings.php`, `roles.php`, and `users.php` since task 0040, which moved `users.index` out of `web.php` so it stops being the one route that didn't follow the pattern. A new area's routes go in a new `routes/<area>.php` with its own middleware group, appended as another `require` line rather than inlined into `web.php`; what each route contract actually is belongs to [api/routes.md](../api/routes.md).

`app/Actions/` groups by concern, one subfolder per area: `Fortify/` holds the framework-contract implementations, `Users/` and `Roles/` the app's own domain actions for those areas. A new action goes in the subfolder for its domain (or directly under `app/Actions/` if it belongs to none) — never nested under an unrelated one. `Roles/` (task 0009) is the pattern to copy when a new module needs its first action: create the subfolder for the domain, even for a single class, rather than parking it in the nearest existing one.

### An app-owned config file is a registry, and must survive `config:cache`

Every other file in `config/` is Laravel's or a package's. [`config/modules.php`](../../config/modules.php) (task 0013) is the first one this app wrote itself, and it establishes when that shape is right: **a config file is for a declarative registry that a later story extends by appending data — never for behavior, and never as a home for a value that has one caller.** The alternative considered and not taken was a PHP class or a service-provider `Gate::define()` loop; config won because appending an entry must not require reading code.

Two hard constraints come with it, both cheap to violate:

- **No closures, ever.** `php artisan config:cache` serialises the merged config with `var_export()`, which cannot represent a `Closure` — one closure anywhere in `config/` makes the command fail and, in a deployment that caches config, takes the whole app down. Every value must be a scalar, array, or `null`. Where a closure is the obvious reach (`'expanded_when' => fn () => request()->routeIs('roles.*')`), store the **data** instead (`'expanded_when' => 'roles.*'`) and let the consumer apply it. `tests/Feature/Navigation/SidebarModuleGatingTest.php` runs `config:cache` as an actual assertion rather than trusting review.
- **Store keys, not copy.** A registry entry holds a translation key (`'label' => 'navigation.items.users'`), resolved with `__()` at render. A literal English string in `config/` is unreachable from `lang/es/` — see [naming.md](naming.md#translation-keys).

✅ Good — the real registry entry, quoted verbatim; every value is a scalar or array, `label` is a translation key rather than copy, and `current_when` is the *pattern* (the consumer applies `request()->routeIs()` to it at render):

```php
// config/modules.php
'roles' => [
    'group' => 'settings',
    'label' => 'navigation.items.roles',
    'icon' => 'shield-check',
    'route' => 'roles.index',
    'current_when' => 'roles.*',
    'permissions' => ['roles.manage'],
],
```

❌ Bad — the same entry written the way it is tempting to (adapted to illustrate; not present in the repo). It breaks `config:cache` outright, and hardcodes English into a file `lang/es/` cannot reach:

```php
// anti-pattern — do not write this in any config/ file
'roles' => [
    'label' => 'Roles & permissions',
    'current_when' => fn () => request()->routeIs('roles.*'),
    'visible' => fn () => auth()->user()?->can('roles.manage'),
],
```

What this particular registry *means* — the gating rules, the per-entry ability requirement, and how a later epic plugs its module in — belongs to [architecture/authorization.md](../architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry), not here.

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

`SalesRegion` (task 0016) is the same convention at a larger scale and worth reading as the reference case: it declares `#[Fillable(['code', 'description', 'rate'])]` and leaves **eight** columns out, with `database/seeders/SalesRegionSeeder.php` as their single `forceFill()` writer. Two things generalise from it. First, the omission list is derived from *who may write the column*, not from how sensitive it looks: `slug` is omitted because a form that could change it would break the seeder's idempotency by duplicating the row, and `name` because a canonical name must stay refreshable on re-seed. Second, **columns coupled by an invariant are one mass-assignment decision, not two** — `is_active` is omitted *because* `is_default` is, since leaving one fillable invites exactly the split write the invariant forbids. See [security/seeder-safety.md](../security/seeder-safety.md#confirmed-safe-split-seeder-owned-from-administrator-configurable-columns-upsert-is-the-wrong-default).

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

> **Two live examples: `User` (Epic 1) and `SalesRegion` (task 0016).** Both are real UUID (v7) PK models. `User` got there by conversion, per [ADR 0001 — UUID primary keys](../decisions/0001-uuid-primary-keys.md); `SalesRegion` is the first model in this repo created that way from day one, and is the one to copy. The six remaining entities ADR 0001 names (products, product variants, product categories, blog categories, blog tags, blog posts) still do not exist in code. **Note the ADR's entity list is narrower than the code:** `sales_regions` is not one of its seven — it ships under a confirmed project-wide policy (UUID v7 for every new Epic 2 business entity, with a high-volume geography lookup table excepted and left `bigint`) that **amending ADR 0001 to record is a deferred follow-up task**. Until that lands, read the ADR for rationale and [database/schema.md's Notes](../database/schema.md#notes) for what is actually keyed this way. This subsection is only the code-shape convention.

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

### Steps 1 and 2 are the *iteration* forms. Run both unscoped before declaring the work done

Both commands above take a scope argument, and **a narrowed gate reports "pass", not "not checked"** — nothing in either one's output distinguishes "I looked and found nothing" from "I looked at almost nothing". Task 0010 shipped past both of them at once (see [errors-log.md](../errors-log.md#both-of-this-projects-per-change-quality-gates-are-scoped-by-default-and-both-silently-passed--2026-08-20)), so the completion form is now stated explicitly:

```bash
vendor/bin/pint --format agent   # NOT --dirty
php artisan test                 # NOT --filter
```

- **`--dirty` inspects only files with *uncommitted* changes**, so it becomes a complete no-op the moment the work is committed — it is inversely coupled to commit hygiene, failing hardest exactly when the workflow is being followed best. It is the right tool mid-edit and the wrong last check on a committed branch.
- **`--filter` cannot observe a change's effect on the rest of the suite.** This matters far more often than it looks: a story that registers a **model event, an observer, a global scope, or middleware** has a blast radius of the whole suite by construction, however narrowly its own feature is scoped. `App\Models\Role`'s holder-count `deleting` guard was specified as part of the roles-CRUD story and reads as scoped to it — it binds every role in every test in the repo.

Use the scoped forms freely while iterating; the unscoped runs are what counts as the record.

_Last updated: 2026-08-22 — Task 0013 (module/sidebar access gating — UI): added the **"An app-owned config file is a registry, and must survive `config:cache`"** subsection for [`config/modules.php`](../../config/modules.php), the first config file in this repo that is neither Laravel's nor a package's — when that shape is right (a declarative registry a later story extends by appending data, never behavior), and its two hard constraints with a real ✅/❌ pair: **no closures** (`ConfigCacheCommand` serialises with `var_export()` and throws `LogicException` on anything non-serialisable, so one closure in `config/` takes down a config-caching deploy — store the data and let the consumer apply it), and **store translation keys, not copy**. Corrected three lines of the directory listing that this story falsified or left vague: `config/` is no longer only Laravel + package config, `lang/` now names its three app-owned domain files, and `resources/views/components/` records that every Blade component here is anonymous (verified: this repo has no `app/View/` at all). What the registry *means* stays in [architecture/authorization.md](../architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry)._

_Previously, 2026-08-20 — Task 0010 (Roles & permissions management — backend): added the **"Steps 1 and 2 are the iteration forms"** subsection to Quality gates — both `pint --dirty` and `test --filter` are scoped by default and report "pass" rather than "not checked", and this story shipped past both at once; the completion form is now the unscoped run of each, with the model-event/observer/global-scope blast-radius rule that makes the full suite non-optional. Updated the directory listing for `EnforceGrantorPermissionScope`, `RoleInUseException` (409, unlike `ImmutableRoleException`'s 403), `RolePolicy`, `app/Livewire/Users/` + `Roles/`, and the real `tests/Feature/` subfolders._

_Previously, 2026-08-20 — Task 0040: corrected the `routes/` line of the directory listing (`web.php` plus one file per functional area — `settings.php`, `roles.php`, `users.php`) and added a new "one-per-area" paragraph stating the convention behind it: `web.php` holds only the app-wide routes and `require`s an area file per module, so a new area gets a new `routes/<area>.php` rather than another inline block. `users.index` was the one route not following that shape until this story moved it._

_Previously, 2026-08-20 — Task 0009: added `app/Actions/Roles/` (`EnforceAdministratorPermissionGrant`) to the directory listing, and recorded it in the "one subfolder per area" paragraph as the pattern to copy — a new domain gets its own subfolder even for a single action, rather than being parked in the nearest existing one._

_Previously, 2026-08-20 — Task 0016 (Sales Region catalog schema + seeder): added `database/data/` to the directory listing with the paragraph explaining why a non-Laravel base folder was approved here (PRD-mandated bundled fixture) and what may go in it; noted `SalesRegion` beside `User` in `app/Models/` and `SalesRegionKind` in `app/Enums/`; added `SalesRegion` as the reference case for the `#[Fillable]`-omission guard (the omission list follows who may write the column, and invariant-coupled columns are one decision); and rewrote the UUID-primary-keys preamble, which claimed `User` was the only live example and implied ADR 0001's seven-entity list was exhaustive — `sales_regions` is an eighth, under a policy the ADR does not record until its deferred amendment lands._

_Previously, 2026-08-19 — Task 0008a: added the "An authorization rule belongs to the action, not to one of its callers" convention with its real ✅/❌ pair (the deleted `Index::createNewUser()` gate vs. `CreateUser`'s own first statement) and its three constraints — move the rule rather than copy it, derive a security-relevant flag internally rather than accept it as a parameter, and authorize before the first write against freshly-reloaded state. Noted `CreateUser` / `UpdateUser` in the `app/Actions/Users/` directory listing._

_Previously, 2026-08-18 — Task 0008: added `app/Exceptions/` to the directory listing and folded it into the "stock Laravel locations … needs no approval" sentence alongside `app/Enums/` and `app/Policies/`; noted `App\Models\Role` beside `User`, `RoleName` beside `UserStatus`, and `tests/Unit/`'s new `Exceptions/` folder and `ArchitectureTest.php`. What the role model's guards do lives in [architecture/authorization.md](../architecture/authorization.md#the-super-admin-roles-invariants), not here._

_Previously, 2026-08-16 — Task 0006b: added `tests/Browser/` to the directory-structure listing and corrected the browser-testing sentence, which still described the suite wiring as pending._

_Previously, 2026-08-14 — Task 0005: widened the `forceFill()` mass-assignment note from "in an action" to "from one named place" now that `User::delete()` is a second such writer, and added the "deleting a user goes through the model, not the query builder" convention with its ✅/❌ pair._
