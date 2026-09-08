# Seeder Safety

## Table of Contents

- [`db:seed` is production-reachable in this app](#dbseed-is-production-reachable-in-this-app)
- [Never put development-only accounts in an unguarded DatabaseSeeder](#never-put-development-only-accounts-in-an-unguarded-databaseseeder)
- [A required-catalog seeder must be registered in one place](#a-required-catalog-seeder-must-be-registered-in-one-place-not-in-the-runbook)
- [A catalog seeder must fail loudly rather than commit a structurally invalid catalog](#a-catalog-seeder-must-fail-loudly-rather-than-commit-a-structurally-invalid-catalog)
- [A seeder's idempotency key is byte-exact in PHP and case-insensitive in the database](#a-seeders-idempotency-key-is-byte-exact-in-php-and-case-insensitive-in-the-database)
- [Confirmed safe: seeder-owned vs. administrator-configurable columns](#confirmed-safe-split-seeder-owned-from-administrator-configurable-columns-upsert-is-the-wrong-default)
- [Bootstrapping a privileged account from a configured email](#bootstrapping-a-privileged-account-from-a-configured-email)
  - [Canonical lowercase is the project rule](#canonical-lowercase-is-the-project-rule--do-not-compare-case-sensitively)
  - [A matching row is not proof of ownership](#a-matching-row-is-not-proof-of-ownership)
  - [Provisioning turns a typo into an account takeover](#provisioning-turns-a-typo-into-an-account-takeover)

## `db:seed` is production-reachable in this app

`AppServiceProvider::configureDefaults()` calls `DB::prohibitDestructiveCommands(app()->isProduction())`,
which is easy to read as "seeding is blocked in production". It is not. The facade's own docblock
enumerates exactly what it prohibits:

```php
// vendor/laravel/framework/src/Illuminate/Support/Facades/DB.php
/**
 * Prohibits: db:wipe, migrate:fresh, migrate:refresh, migrate:reset, and migrate:rollback
 */
public static function prohibitDestructiveCommands(bool $prohibit = true)
```

`db:seed` is **not** in that list and runs unimpeded in production.

This matters more since task 0002, because `RolePermissionSeeder` is now the **only** source of the
roles and permissions catalog — the application is non-functional until it has run. Seeding is
therefore a *required production deployment step*, not a developer convenience.

## Never put development-only accounts in an unguarded DatabaseSeeder

Because `db:seed` is a production operation (above), anything `DatabaseSeeder::run()` creates
unconditionally is created **in production**. A factory-created user is not safe there:
`database/factories/UserFactory.php` sets `'password' => Hash::make('password')` and
`'email_verified_at' => now()`, i.e. a publicly known credential on a pre-verified account that can log
in through `/login` immediately.

**Rule.** `DatabaseSeeder` is split by audience. Anything the production runtime needs is called
unconditionally; anything that fabricates accounts, fixtures, or demo data is guarded by an **explicit
allow-list of environments**, never by "anything that isn't production":

```php
// database/seeders/DatabaseSeeder.php
public function run(): void
{
    // N4 — allow-list, not "not production": staging/demo/qa are internet-reachable too.
    if (app()->environment(['local', 'testing'])) {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }

    $this->call(RolePermissionSeeder::class);
}
```

❌ The deny-list form this replaced — `if (! app()->isProduction())` — reads as equivalent and is not.
`APP_ENV` is a free-form string: `staging`, `demo`, `qa`, `uat` and every future environment name
someone invents all satisfy "not production", and all of them are commonly internet-reachable. An
allow-list fails **closed** for names nobody has thought of yet, which is the property that makes it the
right default for a guard deciding where a publicly-known credential may exist.

This is a deliberate divergence from `AppServiceProvider::configureDefaults()`, which legitimately uses
`app()->isProduction()` for `DB::prohibitDestructiveCommands` / `Password::defaults`: that check hardens
*production specifically*, so erring toward "not hardened" elsewhere is harmless. A fixture guard is the
opposite question — it decides where a shared credential is created — so its default must fall the other
way. Keep `testing` in the list; the suite's own regression tests depend on the fixture.

A production deployment should additionally prefer the narrow form — `php artisan db:seed
--class=ProductionSeeder` — so the entry point cannot pick up fixtures added to `DatabaseSeeder` later.

> ⚠️ **This line used to name `--class=RolePermissionSeeder`, and that advice is withdrawn.** Task 0016
> added a second required catalog (`sales_regions`), so a runbook pinned to one seeder class now brings
> production up with a **missing** catalog, no error, and no failing test — the exact failure mode a
> targeted invocation is otherwise chosen to avoid. `Database\Seeders\ProductionSeeder` exists so the
> runbook names **one** class forever; every future required catalog is registered inside it. See
> [A required-catalog seeder must be registered in one place](#a-required-catalog-seeder-must-be-registered-in-one-place-not-in-the-runbook).

## A required-catalog seeder must be registered in one place, not in the runbook

Distinguish the two audiences a seeder can have, because the guard each needs is opposite:

| Audience | Example | Guard |
| --- | --- | --- |
| **Fixture / demo data** | the `test@example.com` account | environment **allow-list** (above) |
| **Required application data** | `RolePermissionSeeder`, `SalesRegionSeeder` | **unconditional** — the app is non-functional without it |

Required-catalog seeders are therefore *deliberately not* environment-gated, and reviewing one should
confirm that omission is intentional rather than pattern-matching on the neighbouring fixture guard:

```php
// database/seeders/DatabaseSeeder.php
$this->call(RolePermissionSeeder::class);

// Required application data, not fixture data -- unconditional, outside the
// environment allow-list above.
$this->call(SalesRegionSeeder::class);
```

The check that makes this safe is a **content** check, not an environment one: a catalog may only be
seeded unconditionally when it carries nothing environment-shaped and nothing secret. `sales_regions`
qualifies — it is a public ISO country list plus five Spanish fiscal territories, with no credential,
no account, no role grant and no config-derived value anywhere in it (`SalesRegionSeeder` reads no
config at all, which its tests pin in both directions). A catalog that fabricates an account, reads
`.env`, or writes a grant does **not** qualify, no matter how "required" it is.

```php
// database/seeders/ProductionSeeder.php — the one place a required catalog is registered
public function run(): void
{
    $this->call(RolePermissionSeeder::class);
    $this->call(SalesRegionSeeder::class);
}
```

**Rule.** When a second required catalog appears, add it to `ProductionSeeder` — never to the runbook
prose, and never by asking operators to chain `--class=` invocations. A documented list of classes
drifts silently; a composed seeder cannot.

> ⚠️ **`ProductionSeeder` does not use `WithoutModelEvents` and `DatabaseSeeder` does.**
> `Seeder::__invoke()` wraps the whole `run()` — nested `$this->call()`s included — in
> `Model::withoutEvents()` whenever the *outer* seeder uses the trait, so `SalesRegionSeeder` runs with
> model events **disabled** under `db:seed` and **enabled** under `db:seed --class=ProductionSeeder`.
> Nothing observes `SalesRegion` today, so this is inert; the moment a model observer enforces an
> invariant on a seeded table, that observer fires on one entry point and not the other — production and
> the test suite would then disagree about what the seeder did. Verified against
> `vendor/laravel/framework/src/Illuminate/Database/Seeder.php`. UUID generation is *not* affected:
> `HasUniqueStringIds` sets the key through `usesUniqueIds()` in `performInsert()`, not through a
> `creating` event.

## A catalog seeder must fail loudly rather than commit a structurally invalid catalog

A seeder that populates a fixed catalog has no user to report to and no request to fail — so a `null`
that flows through unchecked commits silently and is discovered by whatever reads the catalog months
later. Task 0016's audit found two such shapes in `SalesRegionSeeder`; both were **fixed before the
story closed**, and the before/after is kept here because the shape recurs in every catalog seeder.

❌ Bad — the two shapes as they were found (this code is **no longer in the repo**; it is quoted from
the audited pre-fix version of `SalesRegionSeeder`):

```php
// anti-pattern — both branches fail OPEN and commit a structurally invalid catalog
$spain = $existing->get(self::SPAIN_SLUG) ?? SalesRegion::query()->where('slug', self::SPAIN_SLUG)->first();

foreach (self::SPAIN_TERRITORIES as $territory) {
    $this->writeRegion($existing, [
        // ...
        'parent_id' => $spain?->id,   // <- null when the fixture has no "ES" entry
    ]);
}

if (SalesRegion::query()->where('is_default', true)->doesntExist()) {
    // <- may affect 0 rows, silently, if the default slug is not in the catalog
    SalesRegion::query()->where('slug', self::DEFAULT_SLUG)->update(['is_default' => true]);
}
```

`?->` on a **structural** lookup is not defensive programming — it converts "the fixture is wrong" into
"five rows are `kind = fiscal_territory` with `parent_id IS NULL`", silently breaking the invariant the
enum's own docblock states (`FiscalTerritory` ⟺ `parent_id IS NOT NULL`) and un-protecting the parent
row that `restrictOnDelete()` was supposed to pin. Likewise, an `update()` that matches nothing leaves
the catalog with **zero** defaults while the seeder reports success.

✅ Good — what ships today: the same two lookups, each with the outcome it cannot be allowed to have
turned into a loud, actionable failure inside the transaction:

```php
// database/seeders/SalesRegionSeeder.php
$spain = $existing->get(self::SPAIN_SLUG) ?? SalesRegion::query()->where('slug', self::SPAIN_SLUG)->first();

throw_if(
    $spain === null,
    RuntimeException::class,
    'The ISO fixture is missing the ['.self::SPAIN_SLUG.'] entry; Spain\'s fiscal territories have no parent to bind to.',
);

// ... the five territories are written with 'parent_id' => $spain->id ...

if (SalesRegion::query()->where('is_default', true)->doesntExist()) {
    $repaired = SalesRegion::query()->where('slug', self::DEFAULT_SLUG)->update(['is_default' => true]);

    throw_if(
        $repaired !== 1,
        RuntimeException::class,
        'No row matched the default slug ['.self::DEFAULT_SLUG.']; the catalog would ship with no default.',
    );
}
```

Note `$repaired !== 1`, not `$repaired === 0`: the assertion is that the repair hit **exactly** the one
row it names, so a slug that somehow matched several is a failure too. The same audit added a third
guard of this family, `assertValidCountryFixture()`, which rejects a malformed fixture entry — a missing
key, a non-string, a lowercase `alpha2` that would later collide case-insensitively against the unique
`slug` index — at load time with the offending array index in the message, rather than letting it fail
opaquely deep inside the transaction.

**Rule.** In a seeder, a value that other rows are structurally keyed to must be resolved with a
`throw_if(... === null, RuntimeException::class, ...)` — the same loud-failure convention this repo
already applies to the fixture file itself and to
[the vendored permission migration](../database/migrations.md#package-vendored-migrations) — and a
repair-only write must assert it affected the row it names. Failing the whole seed is correct here:
the transaction rolls back, nothing partial is committed, and the operator gets an actionable message
instead of a catalog nobody will notice is wrong.

## A seeder's idempotency key is byte-exact in PHP and case-insensitive in the database

`sales_regions.slug` carries `utf8mb4_unicode_ci` (verified with `SHOW FULL COLUMNS`, and
`SELECT 'es' = 'ES'` returns `1`), while every PHP-side lookup against it compares bytes:

```php
// database/seeders/SalesRegionSeeder.php
$existing = SalesRegion::query()->get()->keyBy('slug');   // byte-exact PHP map
$region = $existing->get($attributes['slug']);            // byte-exact hit/miss

$spain = ... ?? SalesRegion::query()->where('slug', self::SPAIN_SLUG)->first();  // case-INSENSITIVE
```

This is the same collation-versus-`===` mismatch task 0008 found on `roles.name` (see
[database/schema.md](../database/schema.md#roles-permissions-model_has_roles-model_has_permissions-role_has_permissions)),
now on a *seeder idempotency key*, and it splits into two behaviours worth knowing before writing the
next catalog seeder:

- **The insert branch fails closed.** A row whose slug differs only in case (`ES-Canarias`) is a miss
  for `$existing->get('es-canarias')`, so the seeder takes the insert branch — and the unique index,
  which *is* case-insensitive, rejects it with a `23000` that rolls back the whole transaction. Loud,
  and in the safe direction.
- **A `where('slug', ...)` lookup fails open.** It silently **adopts** the case-variant row, exactly as
  `firstOrCreate()` would have adopted a colliding `administrator` row in `RolePermissionSeeder`. Here
  that would parent Spain's five fiscal territories to a row nobody intended.

**Rule.** When a column is a seeder's identity key, either (a) keep every writer of that column inside
the seeder — omitting it from `#[Fillable]`, which is what makes today's exposure theoretical — or
(b) read the persisted value back and compare it byte-for-byte before acting on it, the guard
`Role::firstOrCreateSuperAdminRole()` already ships. Do not assume a `WHERE` on a `_ci` column returned
the row you asked for.

## Confirmed safe: split seeder-owned from administrator-configurable columns; `upsert()` is the wrong default

The reflexive "idempotent seeder" shape — `upsert()` / `updateOrCreate()` with a full payload —
overwrites on conflict, which on the second deploy resets every administrator-configured value to its
seed value. That is a **data-integrity** failure with security consequences on a table like
`sales_regions`, whose `rate` column feeds order tax arithmetic and whose `is_active` column decides
which regions the store transacts in: a deploy would silently reinstate a rate an administrator had
corrected. `SalesRegionSeeder` splits the columns instead, and this is the shape to copy:

| Set | Columns | Re-seed behaviour |
| --- | --- | --- |
| Seeder-owned | `slug`, `name`, `parent_id`, `kind`, `sort_order` | always refreshed — how a corrected canonical name reaches a deployed install |
| Administrator-configurable | `code`, `description`, `rate`, `is_active`, `is_default` | written **only on insert**, never touched on update |

```php
// database/seeders/SalesRegionSeeder.php — the update branch writes the seeder-owned half only
$region->forceFill([
    'name' => $attributes['name'],
    'parent_id' => $attributes['parent_id'],
    'kind' => $attributes['kind'],
    'sort_order' => $attributes['sort_order'],
])->save();
```

Two supporting properties were verified rather than assumed, and both are load-bearing:

- **The `#[Fillable]` omission is the guard, and it is genuinely closed.** `SalesRegion` declares
  `#[Fillable(['code', 'description', 'rate'])]`; `getGuarded()` is `['*']`, so
  `isFillable()` is `false` for `id`, `slug`, `name`, `kind`, `parent_id`, `is_default`, `is_active`
  and `sort_order` alike — confirmed by executing `SalesRegion::make([...])` with a full payload and
  observing only the three permitted keys survive. `id` being non-fillable matters on a `HasUuids`
  model specifically: a fillable key would let a caller choose the primary key of a row future FKs
  point at.
- **`is_active` is omitted *because* `is_default` is.** The PRD couples them ("disabling the current
  default is blocked unless a new default is set"), so leaving one fillable and the other not invites
  the split write the invariant forbids — a stray `->update($validated)` deactivating the default
  before story 0017's rule exists. When two columns are coupled by an invariant, they are one
  mass-assignment decision, not two.

Note that the **repair-only** default write (`->where('slug', …)->update(['is_default' => true])`) is
a query-builder mass update, so it bypasses model events entirely — on top of the `WithoutModelEvents`
asymmetry above. Any story that later enforces the single-default invariant through an observer must
account for both, or enforce it somewhere the seeder cannot route around.

## Bootstrapping a privileged account from a configured email

`RolePermissionSeeder` grants the Super Admin role to whichever user matches
`config('auth.super_admin.email')`, and — since the task 0002 remediation — **creates** that account when
no user matches. The lookup itself is safe from injection (`User::where('email', $email)` is
parameter-bound) and `filled()` correctly makes an unset, empty, or whitespace value a no-op. The risk is
not injection — it is **who is allowed to occupy that address**.

### Canonical lowercase is the project rule — do not compare case-sensitively

Every email address in this system is canonically lowercase, and the seeder normalizes its own input
before it touches the database:

```php
// database/seeders/RolePermissionSeeder.php
$email = Str::lower($email);

$user = User::where('email', $email)->first();
```

This is load-bearing on both sides of the branch: the lookup and the `users.email` unique index then use
**identical comparison semantics**, so the "no match" branch provably cannot collide with an existing row.

The invariant is real on every Fortify-owned write path — `config/fortify.php` sets
`'lowercase_usernames' => true`, and `RegisteredUserController::store()`,
`AuthenticatedSessionController` (via the `CanonicalizeUsername` pipe), `PasswordResetLinkController::store()`
and `ProfileInformationController::update()` all lowercase under that flag. **One app-owned path still
breaks it**: `App\Livewire\Settings\Profile::updateProfileInformation()` writes the submitted address
verbatim via `$user->fill($validated)`, bypassing Fortify's controller entirely.

An earlier version of this page recommended a `COLLATE utf8mb4_bin` lookup to make the match
case-sensitive. **That advice is withdrawn** — it was rejected in favour of normalization, and
reintroducing it would be actively wrong: it would make the lookup stricter than the unique index it is
supposed to mirror, so the "no match" branch could then hit a duplicate-key error on insert.

### A matching row is not proof of ownership

Normalization settles *which string* is looked up. It does not settle *who is entitled to it*:

- Self-registration is enabled (`Features::registration()` in `config/fortify.php`), so any visitor can
  claim an unregistered address.
- `App\Livewire\Settings\Profile` lets any signed-in user change their address to an arbitrary one. It
  nulls `email_verified_at` on change — but the new address is written to `users.email` immediately,
  before any verification.
- The connection collation `utf8mb4_unicode_ci` (`config/database.php`) is accent-insensitive, so
  `josé@example.com` and `jose@example.com` are the same row for both the lookup and the unique index.

So an address that has not yet been configured as `SUPER_ADMIN_EMAIL` can be *squatted* in advance, and
the next seed run silently grants that squatter the role.

**Rule.** A seeder that grants a privileged role from a configured address must not treat "a row with
this email exists" as proof that the operator controls it. Require the matched account to have **proved
control of the mailbox** — which is exactly what `email_verified_at` records, and which a squatter cannot
fake because they do not receive the verification mail:

```php
$user = User::query()
    ->where('email', $email)              // both sides canonically lowercase
    ->whereNotNull('email_verified_at')   // mailbox control, not merely row existence
    ->first();
```

When the address matches an **unverified** account, neither branch is safe: do not grant (unproven
ownership) and do not create (the address is taken). Abort loudly and let the operator resolve it.

The shipped shape of that abort — worth copying verbatim in any future bootstrap of this kind — is a
plain `return`, never an exception:

```php
// database/seeders/RolePermissionSeeder.php
if (User::where('email', $email)->exists()) {
    $this->command?->error("An unverified account already occupies [{$email}], ...");
    Log::warning('Super Admin bootstrap aborted: the configured address is occupied by an unverified account.', [
        'email' => $email,
        'outcome' => 'aborted_unverified_occupant',
    ]);

    return null;
}
```

The bootstrap runs **inside** the seeder's `DB::transaction(...)`, so throwing here would roll back the
roles and the whole permission catalog with it — turning "we could not safely pick a Super Admin" into
"the application has no authorization data at all". A privilege-bootstrap abort must degrade to *no
grant*, never to *no catalog*.

### Format-validate a configured identity before acting on it

`config('auth.super_admin.email')` is operator input arriving through `.env`, and the branch it selects
is "create a privileged account". Validate its **shape** immediately after normalization and before any
lookup:

```php
// database/seeders/RolePermissionSeeder.php
$email = Str::lower($email);

if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $this->command?->error("SUPER_ADMIN_EMAIL [{$email}] is not a valid email address. ...");
    Log::warning('Super Admin bootstrap skipped: SUPER_ADMIN_EMAIL is not a valid email address.', ['email' => $email]);

    return null;
}
```

Order is load-bearing: validating **before** the lookups means a malformed value never reaches the
"no match → provision" branch, which is what would otherwise create an unclaimable **ghost** privileged
account (`admin`, `0`, `admin@`) whose reset mail can never be delivered — and which a later corrected
re-seed would silently orphan alongside a *second* Super Admin. `filled()` alone does not cover this:
`'0'` is `filled()`.

### Provisioning turns a typo into an account takeover

The "no matching user" branch creates a `User` with a random `Str::password(32)`, forces
`email_verified_at`, assigns the role, and emails a Fortify password-reset link. That is a sound way to
hand an account to its owner — and an equally sound way to hand **full Super Admin** to whoever receives a
mistyped address. Under the previous warn-and-skip behaviour a typo was inert; it no longer is.

**Rule.** Any seeder branch that *creates* a privileged account must be treated as a production-changing
operation: confirm the address before provisioning in production (or gate provisioning behind an explicit
opt-in), and make both the creation and the grant auditable in the application log, not only in console
output — `Seeder::$command` is `null` when a seeder is invoked programmatically, so console-only messaging
can vanish entirely.

Operationally: set `SUPER_ADMIN_EMAIL` **before** the application is publicly reachable, use an ASCII-only
address, and re-check the spelling — the variable is a direct grant of the highest privilege in the system.

**Accepted residual risk, recorded deliberately.** Format validation cannot catch a *well-formed* typo.
`SUPER_ADMIN_EMAIL=admni@example.com` provisions a Super Admin account and mails a working password-reset
link to whoever owns that mailbox; correcting the variable afterwards provisions a second Super Admin and
leaves the first one live, marked verified, holding the role. The seeder cannot detect this, and no code
guard was added on purpose — the mitigation is operational (confirm the address before the first
production seed) plus the audit trail below.

### Log the grant, do not merely echo it

Every branch that grants, provisions, or refuses privilege writes a structured `Log` entry **in addition
to** its console line, with no `$this->command` guard around it:

```php
// database/seeders/RolePermissionSeeder.php
Log::warning('Super Admin role granted to an existing verified account.', [
    'email' => $email,
    'user_id' => $user->id,
    'outcome' => 'granted',
]);
$this->command?->info("Granted the Super Admin role to the existing verified account [{$email}].");
```

`Seeder::$command` is `null` whenever the seeder is invoked programmatically rather than through Artisan,
so console-only reporting can make a privilege grant leave **no trace anywhere**. The context carries the
address, the account id and a machine-readable `outcome` — and nothing else: never the generated
password, never a reset token or reset URL. The generated secret in this seeder is passed inline to
`User::create()` and hashed by the model's `'hashed'` cast, so no plaintext credential is ever held in a
variable that a log call or an exception report could pick up. Keep it that way.

_Last updated: 2026-08-20 — Task 0016 Phase 6: corrected the "fail loudly" section, which was written
during the Phase 4 audit and still quoted the **pre-fix** `$spain?->id` / unchecked-`update()` code as if
it were current, under the framing "both present in `SalesRegionSeeder` today". Rewritten as an explicit
❌ before / ✅ after pair against the shipped `throw_if(...)` guards, with the third guard
(`assertValidCountryFixture()`) recorded. The underlying rule is unchanged._

_Previously: 2026-08-19 — Task 0016 (Sales Region catalog schema + seeder), this repo's first
**required catalog seeder that is not a privilege bootstrap**. Withdrew the stale
`--class=RolePermissionSeeder` production runbook line (it now skips a required catalog silently) and
added four sections: required-catalog registration in `ProductionSeeder` plus the `WithoutModelEvents`
asymmetry between the two entry points; fail-loudly over `?->` on a structural lookup; the
byte-exact-PHP vs. `_ci`-database split on a seeder idempotency key (the `roles.name` trap, now on
`sales_regions.slug`); and the confirmed-safe seeder-owned / administrator-configurable column split
with the empirically verified `#[Fillable]` guard behind it._

_Previously: 2026-08-10 — Updated during the **third** Phase 4 audit of task 0002: corrected the
fixture guard to the shipped `app()->environment(['local', 'testing'])` allow-list (the earlier
`! app()->isProduction()` deny-list snippet is withdrawn), and added the abort-must-not-throw-inside-the-
transaction rule, the format-validate-before-lookup rule, and the persisted-audit-log rule._
