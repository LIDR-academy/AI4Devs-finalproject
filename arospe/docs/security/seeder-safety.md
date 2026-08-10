# Seeder Safety

## Table of Contents

- [`db:seed` is production-reachable in this app](#dbseed-is-production-reachable-in-this-app)
- [Never put development-only accounts in an unguarded DatabaseSeeder](#never-put-development-only-accounts-in-an-unguarded-databaseseeder)
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

A production deployment should additionally prefer the narrow form —
`php artisan db:seed --class=RolePermissionSeeder` — so the entry point cannot pick up fixtures added
to `DatabaseSeeder` later.

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

_Last updated: 2026-08-10 — Updated during the **third** Phase 4 audit of task 0002: corrected the
fixture guard to the shipped `app()->environment(['local', 'testing'])` allow-list (the earlier
`! app()->isProduction()` deny-list snippet is withdrawn), and added the abort-must-not-throw-inside-the-
transaction rule, the format-validate-before-lookup rule, and the persisted-audit-log rule._
