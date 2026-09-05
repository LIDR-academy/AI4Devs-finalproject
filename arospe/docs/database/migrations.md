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
- `down()` always exists and is the exact inverse of `up()`.

⚠️ **The explicit `$table->index('user_id')` on the last line is *not* a pattern to copy** — it duplicates the index `constrained()` already causes InnoDB to create. It predates this repo's index discipline and is documented as a divergence, not a convention: see [An FK column does not also get an explicit index here](#an-fk-column-does-not-also-get-an-explicit-index-here).

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

> **Two real cases now exist, and they are shaped differently.** `users` (Epic 1) was a **conversion** — a breaking alteration with a backfill, described further down. `sales_regions` (task 0016) is the repo's **first greenfield UUID `create_*` migration** and is the file to copy when adding a new UUID-keyed table. Per [ADR 0001 — UUID primary keys](../decisions/0001-uuid-primary-keys.md), the six remaining entities it names (Products / Product Variants / Product Categories, PRD Epic 2; Blog Categories / Blog Tags / Blog Posts, PRD Epic 4) still **do not exist in code yet**; `sales_regions` is not one of the ADR's seven at all — see [schema.md's Notes](schema.md#notes) for the policy it ships under and the deferred ADR amendment that will record it.

✅ Good — the real greenfield pattern, quoted in full because every line of it is a decision:

```php
// database/migrations/2026_08_19_204256_create_sales_regions_table.php
Schema::create('sales_regions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('slug', 64)->unique();
    $table->string('code', 10)->nullable();
    $table->string('name', 150);
    $table->string('description', 255)->nullable();
    $table->decimal('rate', 6, 3)->nullable();
    $table->string('kind', 20);
    $table->foreignUuid('parent_id')->nullable()->constrained('sales_regions')->restrictOnDelete();
    $table->boolean('is_default')->default(false);
    $table->boolean('is_active')->default(false);
    $table->unsignedSmallInteger('sort_order')->default(0);
    $table->timestamps();
});

// down(): Schema::dropIfExists('sales_regions'); — the self-referencing FK drops with the table
```

❌ Bad — what a `bigint`-era habit produces for the same table (adapted to illustrate; not present in the repo):

```php
// anti-pattern — do not write this for a new domain table
$table->id();
$table->foreignId('parent_id')->nullable()->constrained();  // wrong type AND infers a `parents` table
$table->string('kind');                                     // VARCHAR(255) for a 20-char token
$table->float('rate');                                      // cannot represent 21.00 exactly
```

Four things the real migration establishes beyond `$table->uuid('id')->primary();` replacing `$table->id()`:

- **`foreignUuid(...)`, never `foreignId(...)`**, so the FK column type matches the parent's `CHAR(36)` key.
- **`constrained()` takes the table name explicitly when the column name doesn't imply it.** `constrained('sales_regions')` is mandatory here: from `parent_id` alone, Laravel would infer a `parents` table that does not exist. A self-referencing FK inside `Schema::create` is fine on MySQL 8.4 — Laravel emits it as a separate `ALTER TABLE`.
- **`restrictOnDelete()` where a cascade would destroy configured data**, in contrast to `create_passkeys_table`'s `cascadeOnDelete()`. Passkeys are worthless without their user; a fiscal territory's administrator-configured tax rate is not, so deleting its parent must be refused rather than silently propagate.
- **Every string column is length-capped and every money-like column is `decimal`** — the same reasoning `add_status_to_users_table` established for `users.status` (a bare `string()` is `VARCHAR(255)`), extended to `decimal(6,3)` because binary floating point cannot represent a tax rate exactly.

The model-side counterpart (the `HasUuids` trait, `@property string $id`, no `$keyType`/`$incrementing` properties) is documented in [conventions/base-standards.md](../conventions/base-standards.md#uuid-primary-keys); what each `sales_regions` column *means* lives in [schema.md](schema.md#sales_regions), not here.

### An FK column does not also get an explicit index here

`create_sales_regions_table` deliberately writes **no** `$table->index('parent_id')`, and this is the one place it diverges from [`create_passkeys_table`](#structure) above — which does write an explicit `$table->index('user_id')`. Do not "fix" the newer file to match the older one.

InnoDB **requires** an index on a foreign key column and auto-creates one when no suitable index already exists, so `constrained()` alone always leaves the column indexed. Adding `index()` on top of it can therefore produce **two** indexes on the same column — write amplification on every insert, and precisely the shape of the redundant `users_uuid_unique` debt recorded in [errors-log.md](../errors-log.md). Verified rather than assumed: `php artisan db:table sales_regions` reports exactly three indexes — `primary` on `id`, `sales_regions_slug_unique`, and `sales_regions_parent_id_foreign` on `parent_id`.

**Rule.** Let `constrained()` supply the FK's index, and confirm the result with `php artisan db:table <table>` after migrating — never by reading the migration, which cannot show you an index nobody wrote.

> ✅ **Story 0019's `create_media_table` is the second greenfield UUID table, and it followed both rules with nothing new to add** — which is the useful data point, since a convention with one instance is a description of that instance. `$table->uuid('id')->primary()`, length-capped strings, `TEXT` only where the value is genuinely unbounded prose, and **no** explicit `$table->index('uploaded_by')`; `php artisan db:table media` reports exactly three indexes (`primary`, `media_path_unique`, `media_uploaded_by_foreign`), the third of them InnoDB's own. It also gives the *explicit table name* rule its second instance and its clearest one: `foreignUuid('uploaded_by')->nullable()->constrained('users')->nullOnDelete()`. Where `create_sales_regions_table` needed `constrained('sales_regions')` because Laravel would infer a `parents` table from `parent_id`, here it would infer an `uploadeds` table from `uploaded_by` — **any FK column not named `<table>_id` needs the table name passed, and the inferred name is not always absurd enough to notice in review.**
>
> ⚠️ **`nullOnDelete()` against a soft-deleted parent is documentation, not behaviour.** `users` uses `SoftDeletes`, so deleting a user is an `UPDATE` and this FK's `ON DELETE SET NULL` will essentially never fire — `media.uploaded_by` stays populated and the relation resolves to `null` through the `SoftDeletingScope` instead. Keep the clause (it is correct against a genuine hard delete), but do not write code that *relies* on it; see [schema.md](schema.md#uploaded_by-and-the-soft-delete-interaction--read-this-before-fixing-the-fk).

> ✅ **Story 0024's two migrations (`create_products_table`, `create_product_media_table`) are this rule's third and fourth confirming instances, and the first to apply it to two FK columns inside a single migration.** `products` carries two FKs (`product_category_id`, `featured_media_id`) and `product_media` one of its own (`media_id`, the other FK column — `product_id` — leading the composite primary key instead); none of the three gets a hand-written `$table->index(...)`. Verified with `php artisan db:table products` / `product_media` rather than by reading the files: `products` reports exactly four indexes (`primary`, `products_product_category_id_foreign`, `products_featured_media_id_foreign`, `products_sku_unique`) and `product_media` exactly two (the composite `primary` on `(product_id, media_id)`, plus `product_media_media_id_foreign`) — nothing redundant on either table. It also reconfirms the *explicit table name* rule a third time: `featured_media_id` needs `constrained('media')`, since Laravel would otherwise infer a `featured_media` table from the column name — the identical trap `uploaded_by` walked into in `create_media_table`, on a differently-shaped column name.
>
> ✅ **Story 0026's `create_product_sales_region_table` is this rule's fifth confirming instance**, and needs no exception either: `$table->foreignUuid('product_id')->constrained()->cascadeOnDelete()` and `$table->foreignUuid('sales_region_id')->constrained()->restrictOnDelete()` both carry no hand-written `index()`, and `php artisan db:table product_sales_region` — run against a live, migrated MySQL instance during the story's own Phase 2 `database-expert` re-review, not read off the migration file — reports exactly two indexes: the composite `primary` on `(product_id, sales_region_id)` and `product_sales_region_sales_region_id_foreign`, InnoDB's own. `product_id` needs no index of its own since it is the composite PK's leftmost prefix; `sales_region_id`'s is the FK constraint's auto-created one. Neither FK column here needed the *explicit table name* rule — `constrained()` infers `products` and `sales_regions` correctly from `product_id` and `sales_region_id` alone (verified against the real `MySqlGrammar`), so this migration confirms the no-index rule without also exercising the naming trap. See [schema.md](schema.md#product_sales_region) for what the table itself holds.
>
> ✅ **Story 0028's `create_product_attribute_values_table` is this rule's sixth confirming instance, and it demonstrates a variant of the rule the first five had not**: `$table->foreignUuid('product_attribute_type_id')->constrained()->cascadeOnDelete()` carries no hand-written `index()` either, but here the FK column is also the **leading column of a composite unique index** (`unique(['product_attribute_type_id', 'value'])`) rather than of the primary key — `php artisan db:table product_attribute_values` reports exactly two indexes total: `primary` on `id` and `product_attribute_values_product_attribute_type_id_value_unique`, with the FK relationship listed separately as `product_attribute_values_product_attribute_type_id_foreign` and no third, redundant single-column index anywhere. `constrained()` needed no explicit table name (`product_attribute_type_id` correctly infers `product_attribute_types`). The migration's own inline comment states the reasoning explicitly — the composite unique's leftmost column *is* what InnoDB accepts as the FK's supporting index, so a standalone `index('product_attribute_type_id')` would be pure write amplification, the exact `users_uuid_unique` mistake [errors-log.md](../errors-log.md) records. `create_product_attribute_types_table` (the parent table, no FK of its own) reports exactly two indexes of its own — `primary` on `id` and `product_attribute_types_name_unique` — confirming nothing was hand-added there either.
>
> ✅ **Story 0029's two migrations (`create_product_variants_table`, `create_product_variant_values_table`) are this rule's seventh and eighth confirming instances, and between them exercise every shape the first six established.** `create_product_variants_table` carries **two** FK columns — `product_id` (leading column of the composite unique `(product_id, combination_hash)`, needing no index of its own, matching `product_attribute_values`' shape) and `featured_media_id` (nullable, InnoDB's own auto-created FK index) — with neither hand-written. Verified with `php artisan db:table product_variants`: exactly `primary`, `product_variants_sku_unique`, `product_variants_product_id_combination_hash_unique`, and `product_variants_featured_media_id_foreign` — no fifth, redundant index. `featured_media_id` needed the *explicit table name* rule again — `constrained('media')`, or Laravel infers `featured_media`, the identical trap `products.featured_media_id`/`media.uploaded_by` already walked into. `create_product_variant_values_table` — a composite-PK-only pivot with no surrogate id at all — carries one FK as the **trailing** column of the primary key (`product_attribute_value_id`, after the leading `product_variant_id`) rather than of a *unique* index, the shape `role_has_permissions` already establishes for a permission pivot: `php artisan db:table product_variant_values` reports exactly `primary` on `(product_variant_id, product_attribute_value_id)` and `product_variant_values_product_attribute_value_id_foreign`, InnoDB's own. Neither FK column here needed the explicit-table-name rule — `constrained()` correctly infers `product_variants` and `product_attribute_values` from `product_variant_id`/`product_attribute_value_id` alone.
>
> ⚠️ **`create_product_variant_values_table`'s own table name is deliberately shorter than either "more descriptive" alternative, and this is a rule worth generalising rather than a one-off name choice.** `product_variant_attribute_values` and `product_variant_attribute_value` were both tried and rejected during Phase 2 review — each produces a foreign-key constraint name of 67 and 66 characters respectively (Laravel's default FK-name convention is `<table>_<column>_foreign`), and MySQL's identifier limit is **64 characters**, failing migration outright with `ERROR 1059 Identifier name ... is too long`. Verified independently by two reviewers, at both candidate names. **The rule: when a table name is long enough that its default foreign-key constraint name might approach 64 characters, compute the actual generated name before committing to the table name** — `<table>_<column>_foreign` for a `constrained()` call, and MySQL's own identifier ceiling applies to every generated name (indexes included), not only to the ones a migration writes explicitly.

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

_Last updated: 2026-09-04 — Story 0029 (Product variants — core backend): added a ✅ under [An FK column does not also get an explicit index here](#an-fk-column-does-not-also-get-an-explicit-index-here) recording `create_product_variants_table`/`create_product_variant_values_table` as the rule's **seventh and eighth** confirming instances — between them exercising every shape the first six established (an FK as a composite unique's leading column, an FK as InnoDB's own auto-created index, and now an FK as a composite primary key's *trailing* column, matching `role_has_permissions`' shape), verified with `php artisan db:table product_variants`/`product_variant_values` reporting exactly the expected index lists with nothing hand-added. `featured_media_id` needed the *explicit table name* rule a third time (`constrained('media')`); neither `product_variant_id` nor `product_attribute_value_id` did. Added a new ⚠️ generalising the table-naming lesson behind `product_variant_values`' own name: two "more descriptive" alternatives were rejected because their default FK constraint names (67/66 characters) exceed MySQL's 64-character identifier limit — compute the generated FK name before committing to a long table name, not after `ERROR 1059`. **Verified as unchanged rather than assumed:** every other section on this page — this story adds two greenfield `create_*` migrations and alters nothing existing.

_Previously: 2026-09-03 — Story 0028 (Product variant attribute types & values — backend): added a ✅ under [An FK column does not also get an explicit index here](#an-fk-column-does-not-also-get-an-explicit-index-here) recording `create_product_attribute_values_table` as the rule's **sixth** confirming instance — the first where the FK column's supporting index is a *composite unique* rather than the primary key, verified with `php artisan db:table product_attribute_values` reporting exactly two indexes (`primary` plus the composite unique) with the FK listed separately and no third redundant index. `create_product_attribute_types_table`, the parent (no FK of its own), reports exactly two indexes as well. Neither migration needed the *explicit table name* rule — `constrained()` correctly infers `product_attribute_types` from `product_attribute_type_id`. **Verified as unchanged rather than assumed:** every other section on this page — this story adds two greenfield `create_*` migrations (the second strictly timestamped after the first, per the parent-before-child rule already established) and alters nothing existing.

_Previously: 2026-09-03 — Story 0026 (Product ↔ Sales Region assignment and tax resolution backend): added a ✅ under [An FK column does not also get an explicit index here](#an-fk-column-does-not-also-get-an-explicit-index-here) recording `create_product_sales_region_table` as the rule's **fifth** confirming instance — verified with `php artisan db:table product_sales_region` against a live migrated instance reporting exactly two indexes (the composite primary key plus the FK-support index InnoDB auto-creates on `sales_region_id`), with neither FK column needing the *explicit table name* rule (`constrained()` correctly infers both `products` and `sales_regions` from `product_id`/`sales_region_id` alone). **Verified as unchanged rather than assumed:** every other section on this page — this story adds one greenfield `create_*` migration and alters nothing existing.

_Previously: 2026-09-01 — Story 0024 (Products — core CRUD backend): added a ✅ under [An FK column does not also get an explicit index here](#an-fk-column-does-not-also-get-an-explicit-index-here) recording `create_products_table`/`create_product_media_table` as the rule's third and fourth confirming instances — the first migration pair to apply it to three FK columns across two files (`product_category_id`, `featured_media_id`, `media_id`), verified with `php artisan db:table` reporting exactly four and two indexes respectively, and the first case since `create_media_table` to need the *explicit table name* rule again (`featured_media_id` → `constrained('media')`, or Laravel infers `featured_media`). **Verified as unchanged rather than assumed:** every other section on this page — file naming, `down()` symmetry, the add-a-column/backfill rules, the `users` conversion table and package-vendored migrations — this story adds two greenfield `create_*` migrations and alters nothing existing._

_Previously: 2026-08-27 — Story 0019 (Media Library upload and conversions — backend): **no rule changed** — `create_media_table` is the [greenfield UUID pattern](#uuid-primary-keys) applied unmodified, which is worth recording precisely because that pattern had exactly one instance before this one. Added a ✅ under the FK-index rule noting that the second instance needed no exception (three real indexes, verified with `php artisan db:table media` rather than by reading the file), and that it gives the *explicit table name* rule its clearest case: `constrained('users')` on a column named `uploaded_by`, where Laravel would otherwise infer an `uploadeds` table — a wrong guess that is far less obvious in review than `sales_regions`'s `parents`. Plus a ⚠️ that this file's `nullOnDelete()` is documentation rather than behaviour, since the parent table is soft-deleted and the clause will essentially never fire. **Verified as unchanged rather than assumed:** the file-naming, `down()`-symmetry, add-a-column, backfill and drop-a-unique-index sections, and the `users` conversion table — this story adds one `create_*` migration and alters nothing._

_Previously: 2026-08-20 — Task 0016 (Sales Region catalog schema + seeder): rewrote the "UUID primary keys" section around the repo's first **real** greenfield UUID `create_*` migration (`create_sales_regions_table`), replacing the invented `create_products_table` target snippet, and added the four decisions it establishes (`foreignUuid`, an explicit table name on a self-referencing `constrained()`, `restrictOnDelete()` where a cascade would destroy configured data, length-capped strings and `decimal` over `float`). Added the "An FK column does not also get an explicit index here" subsection and flagged `create_passkeys_table`'s explicit `$table->index('user_id')` in the Structure section as a divergence rather than a pattern to copy._

_Previously: 2026-08-12 — Task 0003: added two subsections to "Adding a column to an existing table" — backfilling in the same `up()` when the new column's default is wrong for existing rows (`add_status_to_users_table`), and dropping a unique index explicitly before its column in `down()` (`add_pending_email_to_users_table`)._
