# Migration Conventions

## Table of Contents

- [File naming](#file-naming)
- [Structure](#structure)
- [Real examples](#real-examples)
- [Adding a column to an existing table](#adding-a-column-to-an-existing-table)
- [UUID primary keys](#uuid-primary-keys)
- [Package-vendored migrations](#package-vendored-migrations)

## File naming

Standard Laravel timestamp-prefixed naming, verified against every file in `database/migrations/`:

```
YYYY_MM_DD_HHMMSS_verb_noun.php
```

Real examples from this repo:

- `2024_01_01_000000_create_passkeys_table.php`
- `2025_08_14_170933_add_two_factor_columns_to_users_table.php`
- `2026_07_12_181045_create_permission_tables.php`

Table-creation migrations are named `create_<table>_table`; alterations are named `<verb>_<what>_to_<table>_table` (e.g. `add_two_factor_columns_to_users_table`).

## Structure

Every migration in this repo is an anonymous class returned from the file, with `up()` and a symmetric `down()` that reverses it exactly:

```php
// database/migrations/2024_01_01_000000_create_passkeys_table.php
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('passkeys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('credential_id')->unique();
            $table->json('credential');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('passkeys');
    }
};
```

✅ Good — matches this pattern:
- `foreignId(...)->constrained()->cascadeOnDelete()` for FKs that should disappear with their parent (passkeys belong to a user; no orphaned passkeys).
- Explicit `$table->index('user_id')` even though `foreignId` already indexes it implicitly in some setups — this repo is explicit about it.
- `down()` always exists and is the exact inverse of `up()`.

❌ Bad — do not do this in this codebase:
```php
// Anti-pattern — do not commit a migration like this
public function down(): void
{
    // TODO
}
```
An empty or missing `down()` breaks `php artisan migrate:rollback` and CI resets. Every migration in `database/migrations/` has a real `down()` — keep that invariant.

## Real examples

### Creating a table with a unique index

```php
// database/migrations/0001_01_01_000000_create_users_table.php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->rememberToken();
    $table->timestamps();
});
```

### Non-incrementing primary key table

```php
// database/migrations/0001_01_01_000000_create_users_table.php
Schema::create('password_reset_tokens', function (Blueprint $table) {
    $table->string('email')->primary();
    $table->string('token');
    $table->timestamp('created_at')->nullable();
});
```

## Adding a column to an existing table

Real example — a dedicated migration adds columns to `users` rather than editing the original `create_users_table` migration:

```php
// database/migrations/2025_08_14_170933_add_two_factor_columns_to_users_table.php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->text('two_factor_secret')->after('password')->nullable();
        $table->text('two_factor_recovery_codes')->after('two_factor_secret')->nullable();
        $table->timestamp('two_factor_confirmed_at')->after('two_factor_recovery_codes')->nullable();
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn([
            'two_factor_secret',
            'two_factor_recovery_codes',
            'two_factor_confirmed_at',
        ]);
    });
}
```

✅ Good — `after(...)` keeps column order deliberate and readable; `down()` drops exactly the columns `up()` added, nothing more.

### When the new column's default is wrong for existing rows, backfill in the same `up()`

`ALTER TABLE ... DEFAULT` also writes that default into every pre-existing row, so a default chosen for *new* rows can silently mis-state the *old* ones. When it does, the fix is a second statement in the same `up()`, not a different default:

```php
// database/migrations/2026_08_11_175426_add_status_to_users_table.php
use App\Enums\UserStatus;   // importing an app class from a migration follows 2026_07_22_100004_*

public function up(): void
{
    Schema::table('users', function (Blueprint $table): void {
        $table->string('status', 20)->after('email_verified_at')->default(UserStatus::Inactive->value);
    });

    DB::table('users')
        ->whereNotNull('email_verified_at')
        ->update(['status' => UserStatus::Active->value]);
}
```

✅ Good — three things this example establishes:

- **`string(20)`, not bare `string()`.** A bare `string()` is `VARCHAR(255)` for a 10-character token, and would make any future index a 1020-byte utf8mb4 key.
- **`string` + a PHP enum over a native MySQL `enum`** — a native `enum` needs DDL for each new value and orders by ordinal rather than alphabetically; `Rule::enum(UserStatus::class)` is the validation boundary, so the database need not re-enforce the value set. The enum class is imported straight into the migration, matching `2026_07_22_100004_*`.
- **The conditional backfill is why `up()` is two statements.** Applying the `inactive` default blindly would have flipped every already-verified account — the Super Admin included — to `inactive`.

### Drop a unique index explicitly before its column

```php
// database/migrations/2026_08_11_175427_add_pending_email_to_users_table.php
public function down(): void
{
    Schema::table('users', function (Blueprint $table): void {
        $table->dropUnique(['pending_email']);
        $table->dropColumn('pending_email');
    });
}
```

✅ Good — dropping the column first leaves the engine to infer the index drop, which is version-dependent; being explicit keeps `migrate:rollback` deterministic. This is the same "be explicit about indexes" instinct as the manual `$table->index('user_id')` in `create_passkeys_table` above.

## UUID primary keys

> **Implemented for `users` (Epic 1); the greenfield pattern below is still the target for future tables.** Per [ADR 0001 — UUID primary keys](../decisions/0001-uuid-primary-keys.md), the seven UUID-keyed entities are `users` (**done** — converted by the 5 alteration migrations `2026_07_22_100001..100005_*.php`) plus the greenfield Products / Product Variants / Product Categories (PRD Epic 2) and Blog Categories / Blog Tags / Blog Posts (PRD Epic 4), which **do not exist in code yet**. The `create_products_table` snippet below is the *target* greenfield pattern (not a citation of an existing file); the `users` conversion — which was an alteration, not a `create_table` — is described further down and its real files are cited there.

Today's pattern (real, current):
```php
// database/migrations/0001_01_01_000000_create_users_table.php — current bigint PK
$table->id();
```

Upcoming pattern for a new UUID-keyed table (greenfield Epic 2/4 entities are created this way from day one):
```php
// target pattern — a future create_products_table migration
Schema::create('products', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('product_category_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->timestamps();
});
```

Key differences from today's `create_passkeys_table` FK pattern: `$table->uuid('id')->primary();` replaces `$table->id()`, and child tables use `foreignUuid(...)->constrained()->cascadeOnDelete()` instead of `foreignId(...)->constrained()->cascadeOnDelete()` so the FK column type matches the parent's UUID key. The model-side counterpart (the `HasUuids` trait, `@property string $id`, no `$keyType`/`$incrementing` properties) is documented in [conventions/base-standards.md](../conventions/base-standards.md#uuid-primary-keys).

### The real `users` conversion (alteration, not `create_table`)

`users` was **not** a fresh `create_table` — it was a breaking alteration migration with a backfill, done as **5 new alteration migrations** (the historical `create_*` files were left untouched):

| Order | File | Purpose |
| --- | --- | --- |
| 1 | `2026_07_22_100001_convert_id_to_uuid_in_users_table.php` | rename `id` → `legacy_id` (kept as-is), add nullable `uuid` `CHAR(36)`, backfill it |
| 2 | `2026_07_22_100002_convert_user_id_to_uuid_in_passkeys_table.php` | drop the passkeys FK, retype `user_id` bigint → uuid (backfill by joining on `users.legacy_id`) |
| 3 | `2026_07_22_100003_convert_user_id_to_uuid_in_sessions_table.php` | retype `sessions.user_id` bigint → uuid |
| 4 | `2026_07_22_100004_convert_model_morph_key_to_uuid_in_permission_tables_table.php` | retype/rename the permission morph key to `model_uuid` (name read from config) |
| 5 | `2026_07_22_100005_finalize_uuid_primary_key_on_users_table.php` | drop `legacy_id`, rename `uuid` → `id`, set it PRIMARY KEY, **re-add** the passkeys `cascadeOnDelete` FK |

Two ordering facts worth internalizing before writing any similar alteration set: the transient `legacy_id` is what every dependent (2–4) joins against to backfill its own column, and it is only dropped in the finalize step (5) — that is also the single point the passkeys FK reappears. The permission morph key needed two distinct steps: changing `config/permission.php`'s `column_names.model_morph_key` (to `model_uuid`) only tells the package which column to *query* — the physical column is renamed/retyped by migration 4, which reads the column name from config rather than hardcoding, and you must **not** edit the vendored `2026_07_12_181045_create_permission_tables.php` in place (see [Package-vendored migrations](#package-vendored-migrations)). Rollback across this set is **data-lossy** (an accepted, human-confirmed tradeoff). Read [ADR 0001's Consequences](../decisions/0001-uuid-primary-keys.md#consequences) before touching it.

## Package-vendored migrations

`database/migrations/2026_07_12_181045_create_permission_tables.php` is `spatie/laravel-permission`'s stub, published as-is. It reads its shape entirely from `config('permission.*')` rather than hardcoding table/column names — do not hand-edit table/column names inside this file; change `config/permission.php` instead and regenerate. It also guards against missing config with `throw_if(...)`:

```php
// database/migrations/2026_07_12_181045_create_permission_tables.php
throw_if(empty($tableNames), 'Error: config/permission.php not loaded. Run [php artisan config:clear] and try again.');
```

When vendoring a package migration like this, keep that defensive `throw_if` pattern — it turns a silent misconfiguration into an immediate, actionable migration failure.

_Last updated: 2026-08-12 — Task 0003: added two subsections to "Adding a column to an existing table" — backfilling in the same `up()` when the new column's default is wrong for existing rows (`add_status_to_users_table`), and dropping a unique index explicitly before its column in `down()` (`add_pending_email_to_users_table`)._
