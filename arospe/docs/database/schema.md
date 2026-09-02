# Database Schema

## Table of Contents

- [ER diagram](#er-diagram)
- [Domain tables](#domain-tables)
- [Infrastructure tables](#infrastructure-tables)
- [Notes](#notes)

## ER diagram

Connection: `mysql` (`DB_CONNECTION=mysql` in `.env`, served by the `mysql:8.4` container in [`compose.yaml`](../../compose.yaml)). Only tables that carry a meaningful relationship are diagrammed; purely infrastructural tables (`cache`, `jobs`, `password_reset_tokens`) are listed in [Infrastructure tables](#infrastructure-tables) instead, since they have no foreign keys.

```mermaid
erDiagram
    USERS ||--o{ PASSKEYS : owns
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ MODEL_HAS_ROLES : "assigned via (polymorphic)"
    USERS ||--o{ MODEL_HAS_PERMISSIONS : "assigned via (polymorphic)"
    MODEL_HAS_ROLES }o--|| ROLES : role_id
    MODEL_HAS_PERMISSIONS }o--|| PERMISSIONS : permission_id
    ROLE_HAS_PERMISSIONS }o--|| ROLES : role_id
    ROLE_HAS_PERMISSIONS }o--|| PERMISSIONS : permission_id
    SALES_REGIONS ||--o{ SALES_REGIONS : "parent_id (fiscal territory of)"
    USERS ||--o{ MEDIA : "uploaded_by (nullable)"
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : product_category_id
    MEDIA ||--o{ PRODUCTS : "featured_media_id (nullable)"
    PRODUCT_MEDIA }o--|| PRODUCTS : product_id
    PRODUCT_MEDIA }o--|| MEDIA : media_id

    USERS {
        uuid id PK
        string name
        string email UK
        string pending_email UK
        timestamp email_verified_at
        string status
        string password
        text two_factor_secret
        text two_factor_recovery_codes
        timestamp two_factor_confirmed_at
        string remember_token
        timestamp deleted_at
    }
    PASSKEYS {
        bigint id PK
        uuid user_id FK
        string name
        string credential_id UK
        json credential
        timestamp last_used_at
    }
    SESSIONS {
        string id PK
        uuid user_id FK
        string ip_address
        text user_agent
        longtext payload
        int last_activity
    }
    ROLES {
        bigint id PK
        string name
        string guard_name
    }
    PERMISSIONS {
        bigint id PK
        string name
        string guard_name
    }
    MODEL_HAS_ROLES {
        bigint role_id FK
        string model_type
        uuid model_uuid
    }
    MODEL_HAS_PERMISSIONS {
        bigint permission_id FK
        string model_type
        uuid model_uuid
    }
    ROLE_HAS_PERMISSIONS {
        bigint permission_id FK
        bigint role_id FK
    }
    SALES_REGIONS {
        uuid id PK
        string slug UK
        string code
        string name
        string description
        decimal rate
        string kind
        uuid parent_id FK
        boolean is_default
        boolean is_active
        smallint sort_order
    }
    MEDIA {
        uuid id PK
        string title
        text description
        string path UK
        string webp_path
        string avif_path
        smallint width
        smallint height
        int size_bytes
        uuid uploaded_by FK
    }
    PRODUCT_CATEGORIES {
        uuid id PK
        string name UK
    }
    PRODUCTS {
        uuid id PK
        uuid product_category_id FK
        string name
        string sku UK
        string type
        string status
        decimal price
        int stock
        text description
        uuid featured_media_id FK
    }
    PRODUCT_MEDIA {
        uuid product_id FK
        uuid media_id FK
        int position
    }
```

> The `model_has_roles` / `model_has_permissions` relationships to `USERS` are **polymorphic** (`model_type` + `model_uuid`, from `spatie/laravel-permission`) — `User` is the only morphable model in the codebase today. The morph key column is `model_uuid` (UUID-typed), renamed from the package default `model_id` (bigint) when `users.id` became a UUID — see [architecture/authorization.md](../architecture/authorization.md), which is also where the seeded roles, the permission catalog and how they are checked are documented.

## Domain tables

### `users`

Source: `database/migrations/0001_01_01_000000_create_users_table.php` + `database/migrations/2025_08_14_170933_add_two_factor_columns_to_users_table.php`, with the primary key converted to UUID by `database/migrations/2026_07_22_100001_convert_id_to_uuid_in_users_table.php` … `2026_07_22_100005_finalize_uuid_primary_key_on_users_table.php` (5 alteration migrations layered on top — the historical `create_*` files were not touched; see [migrations.md](migrations.md#uuid-primary-keys)), and the account-state columns added by `database/migrations/2026_08_11_175426_add_status_to_users_table.php` and `database/migrations/2026_08_11_175427_add_pending_email_to_users_table.php`, plus the soft-delete column added by `database/migrations/2026_08_14_183432_add_soft_deletes_to_users_table.php`.

Model: [`App\Models\User`](../../app/Models/User.php).

Columns are listed in real physical order (verified with `php artisan db:table users`):

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid (v7) PK | `CHAR(36)`; generated by `HasUuids` — see [ADR 0001](../decisions/0001-uuid-primary-keys.md) |
| `name` | string | |
| `email` | string, unique | canonically lowercase; a *change* to this column only lands once its verification link is used — see [architecture/authentication.md](../architecture/authentication.md#pending-email-changes) |
| `pending_email` | string, nullable, unique | the address a pending email change is waiting on; **not** mass-assignable (omitted from `#[Fillable]`), written only via `forceFill()` by `App\Actions\Users\RequestEmailChange` / `ConfirmEmailChange` |
| `email_verified_at` | timestamp, nullable | proof of mailbox control; set by Fortify's verification, by completing the invitation/reset flow, and by confirming a pending email change. It is **no longer** nulled on an email change — the address does not move until it is verified |
| `status` | `VARCHAR(20)`, default `inactive` | cast to [`App\Enums\UserStatus`](../../app/Enums/UserStatus.php) (`active` / `inactive` / `suspended`); **not** mass-assignable. Since task 0007 this column is an **authentication control**, not a label — only `active` obtains a session, on every sign-in path. See [architecture/authentication.md](../architecture/authentication.md#account-status-and-activation) and [the sign-in block](../architecture/authentication.md#sign-in-the-account-status-block) |
| `password` | string | hashed cast, `Hidden` |
| `two_factor_secret` | text, nullable | encrypted, `Hidden` |
| `two_factor_recovery_codes` | text, nullable | encrypted JSON, `Hidden` |
| `two_factor_confirmed_at` | timestamp, nullable | |
| `remember_token` | string, nullable | `Hidden` |
| `deleted_at` | timestamp, nullable | added `after('updated_at')`, so it is physically the last column; the `SoftDeletes` marker — see [Soft deletes](#soft-deletes) below |

Two notes on the account-state columns, both deliberate:

- **`status` carries no index.** Not a selectivity argument — a narrow secondary index genuinely would be chosen for `COUNT(*) WHERE status = 'active'` given this table's unusually fat clustered index (`CHAR(36)` PK + two `TEXT` columns). The reason is cardinality: a backoffice `users` table is 10²–10³ rows, so both queries resolve in a sub-millisecond clustered scan while an index costs a write on every insert/update. If one is ever added it must be composite `(deleted_at, status)`, never plain `status`, because the `SoftDeletingScope` puts `deleted_at IS NULL` into every one of those queries. Task 0007 does not change this reasoning: the sign-in block reads `status` off a row already fetched by the `email` unique index, so it adds no `WHERE status = …` query to the hot path.
- **`pending_email` is `unique` and nullable on purpose.** Both MySQL and SQLite allow unlimited `NULL`s in a unique index, so the constraint only binds rows actually holding a pending address — making "two accounts cannot be waiting on the same address" a database invariant rather than a validation-only one. It is the last-word guard behind the application checks documented in [security/signed-link-verification.md](../security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word).

Relations: `hasMany` → `passkeys` (via `PasskeyAuthenticatable`), `hasMany` → `sessions` (informal, via `user_id`), polymorphic `morphToMany` → `roles`/`permissions` (via `HasRoles`; roles and permissions are seeded and in active use — see [authorization.md](../architecture/authorization.md)).

#### Soft deletes

`App\Models\User` is the only model in this codebase using `Illuminate\Database\Eloquent\SoftDeletes` (task 0005). Deleting a user is an `UPDATE` that stamps `deleted_at`, never a `DELETE`, so **every relation physically survives** — `passkeys` rows included, because the `cascadeOnDelete()` FK only fires on a real `DELETE`, and `model_has_roles` / `model_has_permissions` rows too, because Spatie's detach-on-delete hook opts out for soft deletes. The trashed row then disappears from every query built on `User::query()` / `newQuery()`, which is what removes it from the users list, from route-model binding, and from every authentication lookup at once.

Deleting also **rewrites the row's identifying columns**, which is the part that matters at schema level: `App\Models\User::delete()` is overridden to obfuscate the address before the soft delete, in one transaction:

```php
// app/Models/User.php
return DB::transaction(function (): bool {
    $originalEmail = $this->getRawOriginal('email');

    DB::table('password_reset_tokens')
        ->whereIn('email', array_unique([$originalEmail, Str::lower($originalEmail)]))
        ->delete();

    $this->forceFill([
        'email' => "deleted+{$this->id}@deleted.invalid",
        'email_verified_at' => null,
        'pending_email' => null,
    ])->saveQuietly();

    return (bool) parent::delete();
});
```

Consequences to know before writing a query against `users`:

- **The original address is gone, not archived.** This app has no audit-log table; freeing the address for reuse was chosen deliberately over retaining it. `deleted+{id}@deleted.invalid` is anchored to the immutable UUID `id` (`.invalid` is RFC 2606-reserved, so it can never collide with a registrable address), which makes it deterministic and greppable back to the `passkeys` / `sessions` rows it left behind.
- **Both unique addresses are released**: `email` is replaced and `pending_email` is nulled, so a new user can immediately take either — and any outstanding pending-email confirmation link stops working, since [`ConfirmEmailChange`](../../app/Actions/Users/ConfirmEmailChange.php) aborts when `pending_email` no longer matches the address the signature is bound to.
- **`password_reset_tokens` rows keyed by the old address are deleted in the same transaction.** That table is keyed by the email *string* with no FK, so recycling the address without revoking the token would hand the deleted user's still-valid reset link to whoever claims the address next. The full reasoning, and why the query normalises case explicitly instead of relying on the connection collation, is in [security/soft-delete-patterns.md](../security/soft-delete-patterns.md#freeing-an-identifier-means-revoking-everything-keyed-by-its-string-not-just-the-row).
- **Never bulk-delete `users` through the query builder.** `User::where(...)->delete()` bypasses the model entirely, so it skips all of the above — leaving live addresses on trashed rows and their reset tokens valid. Every call site in this repo uses instance `->delete()`; see [conventions/base-standards.md](../conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder).
- **A restored user keeps the placeholder address.** `SoftDeletes::restore()` exists on the model for free but has no call site anywhere in the app; a restore flow would have to re-enter the address through the pending-email flow, and re-grant roles as an explicit decision (see the same security page).

Two index decisions were made deliberately here and are **not** oversights:

- **No index on `deleted_at`.** On MySQL 8.4 at this table's size, `deleted_at IS NULL` matches the large majority of rows, so the optimizer would very likely scan anyway while every insert and delete pays to maintain the index. If one is ever needed, the right shape is the composite `(deleted_at, status)` described in the `status` note above — never a standalone `deleted_at`.
- **No change to the `email` unique index.** Obfuscation frees the address without touching the constraint. A composite unique on `(email, deleted_at)` was considered and **rejected as unsafe on MySQL**: `NULL <> NULL` for uniqueness purposes, so all active users (`deleted_at IS NULL`) would stop being constrained against sharing an address — a regression on the exact invariant that has to hold. Note the flip side, verified during the audit: `Rule::unique(User::class)` does **not** apply the soft-delete scope, so validation still sees trashed rows and a live user cannot claim a tombstone address.

> **Done (Epic 1) — current state.** `users.id` is a **UUID (v7)** string primary key generated by the `HasUuids` trait, per [ADR 0001 — UUID primary keys](../decisions/0001-uuid-primary-keys.md). This was a breaking alteration-with-backfill (not a fresh `create_table`) that cascaded to `passkeys.user_id`, `sessions.user_id` (both retyped to UUID), and `spatie/laravel-permission`'s polymorphic morph key (renamed `model_id` → `model_uuid`, retyped to `uuid`). The other six UUID entities from ADR 0001 (Epic 2/4) are **still future** — see [Notes](#notes).

### `passkeys`

Source: `database/migrations/2024_01_01_000000_create_passkeys_table.php`. Provided by `laravel/passkeys`, consumed through `PasskeyAuthenticatable` on `User`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint PK | passkey's own PK stays `bigint` — only the FK changed |
| `user_id` | uuid FK → `users.id` | `CHAR(36)`; `cascadeOnDelete()`, FK re-added by the finalize migration once both sides are UUID |
| `name` | string | user-chosen label |
| `credential_id` | string, unique | WebAuthn credential ID |
| `credential` | json | full WebAuthn credential payload |
| `last_used_at` | timestamp, nullable | |

### `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`

Source: `database/migrations/2026_07_12_181045_create_permission_tables.php` (`spatie/laravel-permission`, teams disabled — see [config/permission.php](../../config/permission.php)). Column shapes follow the package defaults; see the migration file for the exact `Schema::create` calls, including the composite primary keys on the pivot tables.

Models: `permissions` is the package's own `Spatie\Permission\Models\Permission`; `roles` is [`App\Models\Role`](../../app/Models/Role.php) since task 0008 (`config/permission.php`'s `models.role` binding), a subclass adding the Super Admin role's immutability guards and the `selectable()` scope — **no schema change, no migration, and no new column**. Application code must never reach the `roles` table through the package class, which carries none of those guards; see [architecture/authorization.md](../architecture/authorization.md#one-role-model-class-in-application-code).

**Both privilege tiers are identified by `roles.name`, and that identity is resolved on the model — never by a query written at a call site.** Task 0008a added `Role::isAdministratorRole(self $role)` and `Role::isSuperAdminRoleRow(self $role)`, both `public static`, both delegating to a private `persistedName()` extracted from the pre-existing Super Admin guard. Again **no schema change**. Two consequences that matter when writing a query against this table:

- **`persistedName()` may issue its own `SELECT`.** For an existing row whose `name` column was never hydrated it reads the name back from the database rather than trusting the in-memory attribute, so a partially-hydrated `Role` still answers correctly. Resolve a role with a plain `Role::query()->find($id)` (full `select *`) at the call site anyway — the helper survives a `select('id')`, but the call site should not create the situation.
- **A tier check never reads `guard_name`.** Both helpers match on `name` alone, deliberately; see [architecture/authorization.md](../architecture/authorization.md#known-limitations--what-is-not-closed) for why that is fail-closed in both directions.

`roles` carries `unique(name, guard_name)`, which is what makes name-based identification of the Super Admin role safe at row level — but it is *not* what prevents a role acquiring that name, since the index only forbids a duplicate of an already-occupied pair. See [security/authorization-patterns.md](../security/authorization-patterns.md#confirmed-safe-role-name-collision-is-closed-by-a-creationrename-guard-not-by-the-database-alone).

**`roles.name` is compared case-insensitively by the database and byte-exactly by PHP, and the seeder has to reconcile the two.** The column carries `utf8mb4_unicode_ci` (`config/database.php`), so the unique index treats `administrator` and `Administrator` as the same value while every identity check in the app is a `===`. `firstOrCreate()` would therefore silently **adopt** a colliding row instead of creating the intended one, so both seeded-role creation paths read the persisted name back and throw `ImmutableRoleException` when it does not match byte-for-byte — `Role::firstOrCreateSuperAdminRole()` and, since task 0010, its exact mirror image `Role::firstOrCreateAdministratorRole()`. Both are `withoutEvents()` factory methods on the model, and `RolePermissionSeeder` calls nothing else: a raw `firstOrCreate()` on either name is now refused by the model's own `creating` guard. See [architecture/authorization.md](../architecture/authorization.md#the-seeder-writes-the-same-name-the-guards-read).

**Since task 0010 a `roles` row can also be refused deletion for a non-privilege reason.** `App\Models\Role`'s `deleting` guards now include a holder-count check (`users()->withTrashed()->exists()`), so any role — protected tier or ordinary custom role — is undeletable while `model_has_roles` still references it, and the refusal is a 409 rather than a 403. Soft-deleted holders count: the FK cascade on `model_has_roles` would otherwise destroy a trashed user's grant with no error anywhere. Same schema, no migration and no new column; see [architecture/authorization.md](../architecture/authorization.md#layer-1-registration-order-is-the-whole-point).

**Populated by [`database/seeders/RolePermissionSeeder.php`](../../database/seeders/RolePermissionSeeder.php)**, which is the only source of this data — the app is non-functional until it has run, so seeding is a required deployment step:

| Table | Seeded rows | Notes |
| --- | --- | --- |
| `roles` | 2 | `Super Admin`, `Administrator`, both `guard_name = web` — plus any custom role created from the [Roles screen](../api/routes.md#rolesindex--the-second-permission-gated-route), which the seeder neither creates nor touches |
| `permissions` | 42 | 10 modules × 4 CRUD actions, plus `roles.manage` and `roles.manage-administrators` — 38 until story 0019 added the `media` module |
| `role_has_permissions` | 41 | `Administrator` holds everything except `roles.manage-administrators`; `Super Admin` holds none — 37 until story 0019 |
| `model_has_roles` | 0 or 1 | one row only when `SUPER_ADMIN_EMAIL` resolves to a user (see the bootstrap branches in [authorization.md](../architecture/authorization.md#super-admin-bootstrap)) |
| `model_has_permissions` | 0 | no permission is granted directly to a user; grants are role-level only |

The names, the grants and the `Gate::before` bypass that lets `Super Admin` pass without any `role_has_permissions` row are documented in [architecture/authorization.md](../architecture/authorization.md).

### `sales_regions`

Source: `database/migrations/2026_08_19_204256_create_sales_regions_table.php` (task 0016) — the repo's **first greenfield UUID `create_*` migration**, and the first table of the Products/Taxes domain ([PRD Epic 2 §2.1](../PRD/PRD.md)). A tax rule *is* a Sales Region row: there is no separate tax table.

Model: [`App\Models\SalesRegion`](../../app/Models/SalesRegion.php). Columns in real physical order (verified with `php artisan db:table sales_regions`):

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid (v7) PK | `CHAR(36)`; generated by `HasUuids`. Not one of [ADR 0001](../decisions/0001-uuid-primary-keys.md)'s seven entities — see [Notes](#notes) |
| `slug` | `VARCHAR(64)`, unique | the seeder's **immutable identity key**, never `code`; not mass-assignable. Uniqueness here is a correctness constraint, not a performance one |
| `code` | `VARCHAR(10)`, nullable | administrator-editable display/fiscal chip (`ES`, `ES-CN`). Explicitly length-capped for the same reason as `users.status` — a bare `string()` is `VARCHAR(255)` for a 2–6 character token |
| `name` | `VARCHAR(150)` | canonical name, in Spanish; seeder-owned and **not** mass-assignable. Deliberately not `TEXT` — see the fat-clustered-index note on `users` above |
| `description` | `VARCHAR(255)`, nullable | administrator-editable |
| `rate` | `DECIMAL(6,3)`, nullable | **never `float`** — this value feeds order tax arithmetic and binary floating point cannot hold `21.00` exactly. `NULL` means *not configured*; `0.000` is a legitimate 0% rate, so the two cannot share a representation. `(6,3)` holds `100.000` exactly and accommodates 3-decimal non-EU rates. No `->unsigned()` (deprecated on `DECIMAL` since MySQL 8.0.17); negative-rate rejection is validation's job, not the column's |
| `kind` | `VARCHAR(20)`, **no default** | cast to [`App\Enums\SalesRegionKind`](../../app/Enums/SalesRegionKind.php) (`country` / `fiscal_territory`). `string` + a PHP backed enum over a native MySQL `enum`, the same precedent as `users.status`. No default on purpose: every row is written explicitly, and a default would let a mis-seeded row pass as a `Country` |
| `parent_id` | uuid FK → `sales_regions.id`, nullable | self-referencing, `restrictOnDelete()` — see [The two-tier tree](#the-two-tier-tree-and-its-invariant) below |
| `is_default` | boolean, default `false` | exactly one row carries it after seeding; **no database constraint enforces that** — see the index notes below |
| `is_active` | boolean, default `false` | the catalog's soft state; rows are deactivated, never deleted |
| `sort_order` | `SMALLINT UNSIGNED`, default `0` | Spain's territories are listed in **fiscal** order (Península, Baleares, Canarias, Ceuta, Melilla), which is neither alphabetical nor recoverable from any other column |

**No `SoftDeletes`, deliberately.** `is_active` *is* the soft state, and a `deleted_at` would actively fight the seeder: a trashed row is invisible to the seeder's lookup, so the next re-seed would insert a duplicate.

#### The two-tier tree and its invariant

The catalog is an adjacency list that is **exactly one level deep by domain definition**: ~249 top-level ISO countries, and beneath the `es` ("España") row its five fiscal territories. `kind === FiscalTerritory` if and only if `parent_id IS NOT NULL` — an invariant the enum's docblock states and the seeder enforces (it aborts rather than write a territory with a null parent; see [security/seeder-safety.md](../security/seeder-safety.md#a-catalog-seeder-must-fail-loudly-rather-than-commit-a-structurally-invalid-catalog)). Nothing in the database enforces the depth limit, so a query may assume two tiers only because the seeder is the sole writer of `parent_id` (it is omitted from `#[Fillable]`).

`restrictOnDelete()`, not `cascadeOnDelete()`: cascading would let deleting the "España" row silently destroy five administrator-configured tax rates. `constrained('sales_regions')` is passed the table name explicitly — Laravel would otherwise infer a `parents` table from the column name.

#### Seeded state, and which columns a re-seed may touch

Populated by [`database/seeders/SalesRegionSeeder.php`](../../database/seeders/SalesRegionSeeder.php) from the bundled fixture [`database/data/iso-3166-countries.json`](../../database/data/iso-3166-countries.json) (249 identity-only entries) plus the seeder's own `SPAIN_TERRITORIES` constant. Like the permission catalog, this is **required application data**: it is seeded unconditionally, outside `DatabaseSeeder`'s `['local', 'testing']` fixture gate, and composed into `ProductionSeeder` so a production runbook names one class forever.

| Rows | `kind` | `is_active` | `rate` |
| --- | --- | --- | --- |
| ~248 ISO countries | `country` | `false` | `NULL` |
| España (`es`) | `country` | `true` | `NULL` — a disclosure node, not independently rateable |
| Península, Baleares, Canarias, Ceuta, Melilla | `fiscal_territory` | `true` | configured |

≈254 rows, of which 6 are active and exactly one (`es-peninsula`, `SalesRegionSeeder::DEFAULT_SLUG`) carries `is_default`. **Reference the seeder's `DEFAULT_SLUG` / `SPAIN_SLUG` constants rather than restating the literal strings** — the same convention `RolePermissionSeeder::MODULES` established.

The columns split into two sets with **opposite re-seed behaviour**, and this split is the table's most load-bearing property:

| Set | Columns | Re-seed behaviour |
| --- | --- | --- |
| **Seeder-owned** | `slug`, `name`, `parent_id`, `kind`, `sort_order` | **always refreshed** — overwriting `name` is how a corrected canonical name ("Turkey" → "Türkiye") reaches an already-deployed install |
| **Administrator-configurable** | `code`, `description`, `rate`, `is_active`, `is_default` | **written only on insert; never touched on update** |

So `upsert()` / `updateOrCreate()` with a full payload are forbidden against this table: the reflexive "idempotent seeder" shape would reset every administrator-configured rate, code and flag on the next deploy. The mass-assignment guard behind it is the usual one — `#[Fillable(['code', 'description', 'rate'])]`, everything else written by `forceFill()` from the seeder alone. Why `is_active` is omitted *because* `is_default` is, and why the seeder's idempotency key is byte-exact in PHP while `slug`'s `utf8mb4_unicode_ci` collation is not, are in [security/seeder-safety.md](../security/seeder-safety.md#confirmed-safe-split-seeder-owned-from-administrator-configurable-columns-upsert-is-the-wrong-default).

#### Indexes — one present by choice, one by requirement, four omitted

`php artisan db:table sales_regions` shows exactly three: `primary` on `id`, `sales_regions_slug_unique`, and `sales_regions_parent_id_foreign`. That is the intended list.

- **`slug` UNIQUE** is the seeder's idempotency key and the resolution key a future tax lookup will use.
- **The FK index on `parent_id` is InnoDB's requirement, not a discretionary choice** — and the migration therefore does **not** write an explicit `$table->index('parent_id')`. This diverges from `create_passkeys_table`'s explicit `$table->index('user_id')` on purpose; see [migrations.md](migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here).
- **Omitted on `code`** — nothing joins or filters on it, and a UNIQUE would create a real re-seed failure mode now that `code` is administrator-editable: the seeder writes `ES` while an administrator has moved `ES` elsewhere, and the seed aborts mid-transaction with an opaque `23000`.
- **Omitted on `is_default`, `is_active`, `kind` and `name`** — cardinality, not selectivity, the same reasoning applied to `users.status` above. A boolean over 254 near-read-only rows is the worst possible index candidate.
- **No UNIQUE on `(parent_id, name)`** — `slug` already forbids a duplicate entity, and a unique index over a utf8mb4 `name` would make the invariant depend on collation ("España" vs. "Espana").

> ⚠️ **Nothing in the database enforces at-most-one `is_default`.** MySQL 8.4 has no partial indexes, but a `STORED` generated column (`CASE WHEN is_default THEN 1 END`) plus a UNIQUE on it does enforce it, since unique indexes ignore `NULL`s. It was deliberately **not** adopted here — it would force the "clear old, set new" update into a strict ordering — and is left for the story that enforces the single-default invariant. Today the property holds only because the seeder's default write is repair-only (it fires solely when no row is flagged at all) and `is_default` is not mass-assignable.

### `media`

Source: `database/migrations/2026_08_27_120000_create_media_table.php` (story 0019) — the Shared Media Gallery ([PRD §2.3](../PRD/PRD.md)), and the first table in this app whose rows **point at files on disk**. One row is one uploaded image *and* its two mandatory conversions; there is no separate conversions table.

Model: [`App\Models\Media`](../../app/Models/Media.php), which declares `#[Table('media')]` explicitly. That is not decoration: `Str::plural('Media')` returns `'Media'` unchanged, so Eloquent's convention arrives at the table name `media` **accidentally** rather than by pluralising anything. Declare it rather than rely on that.

Columns in real physical order (verified with `php artisan db:table media`):

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid (v7) PK | `CHAR(36)`; generated by `HasUuids`. The **second** UUID entity beyond [ADR 0001](../decisions/0001-uuid-primary-keys.md)'s original seven — see [Amendment 1](../decisions/0001-uuid-primary-keys.md#amendment-1-2026-08-27--the-scope-is-the-policy-not-the-list-of-seven), which story 0019 added and which closes the deferral task 0016 opened |
| `title` | `VARCHAR(255)` | user-supplied, required, searched |
| `description` | `TEXT`, nullable | user-supplied, optional per PRD, searched. `TEXT` rather than a capped `VARCHAR` because it is free-form prose with no natural ceiling and is never indexed |
| `path` | `VARCHAR(255)`, **unique** | the kept original, relative to the `public` disk root (`storage/app/public`). See the index notes below for what the UNIQUE is and is not for |
| `webp_path` | `VARCHAR(255)` | the `.webp` conversion. `NOT NULL` **is** the schema-level statement of PRD §2.3 AC 4 — an image without both variants cannot be represented |
| `avif_path` | `VARCHAR(255)` | the `.avif` conversion, same |
| `width` | `SMALLINT UNSIGNED` | captured at upload, when the image is already decoded and it is free. Impossible to backfill later without re-reading every file. `SMALLINT`'s 65,535 ceiling comfortably exceeds `MediaValidationRules::MAX_DIMENSION` (4,000) |
| `height` | `SMALLINT UNSIGNED` | same |
| `size_bytes` | `INT UNSIGNED` | the **original's** size, not the variants'. 4 GB ceiling ≫ the 8 MB upload limit |
| `uploaded_by` | uuid FK → `users.id`, nullable | `foreignUuid(...)->nullable()->constrained('users')->nullOnDelete()`. Read the soft-delete note below before relying on either half of that |
| `timestamps` | | `created_at` is the gallery's intended default sort key (newest first) |

**Three explicit path columns, not a JSON blob and not a child table.** PRD §2.3 fixes the variant set at exactly two, mandatory, for every image, so three columns make "an image always has both variants" a readable, `NOT NULL`-constrainable property, queryable with no JSON extraction and no join on every gallery tile. A `conversions` JSON column buys flexibility this phase has no use for at the cost of not being able to declare the variants required; a `media_conversions` child table is correct only if the format set were open-ended. **Do not derive the variant paths at read time** ("same basename, swap the extension") — storing them explicitly is what lets a future re-encode change the naming scheme without a data migration, and what makes a missing or orphaned variant detectable at all.

Two columns were considered and **deliberately omitted**, recorded so each is a decision rather than an oversight: a `disk` column (cloud storage is explicitly out of scope this phase; adding it later is a one-line migration with a `'public'` backfill) and a `mime_type` column (derivable from the original's extension, which validation constrains to three values).

**No `SoftDeletes`, and no `deleted_at`.** Media deletion is out of scope: the interesting question — what happens to a product or blog post referencing a deleted image — cannot be answered before those tables exist (PRD Epics 2 and 4). Deferring is the cheap direction, since adding `SoftDeletes` later is additive while removing it once call sites depend on it is not. `media.delete` is nevertheless seeded, which is this catalog's normal state; see [architecture/authorization.md](../architecture/authorization.md#mediapolicy--the-fourth-policy-and-the-first-behind-no-route-at-all).

#### `uploaded_by` and the soft-delete interaction — read this before "fixing" the FK

`users` **is** soft-deleted, so `nullOnDelete()` will essentially **never fire**: a user delete is an `UPDATE` stamping `deleted_at`, not a `DELETE`. The real runtime behaviour is that `media.uploaded_by` stays populated and `Media::uploadedBy()` resolves to `null`, because the `SoftDeletingScope` hides the trashed row — unless a call site opts into `withTrashed()`. The constraint is retained as correct-by-construction protection against a genuine hard delete, **not** as the mechanism anything relies on. So: a `null` from `uploadedBy()` means either "no uploader recorded" or "the uploader is trashed", and the two are distinguishable only by reading the raw column.

The column is also **not mass-assignable**, along with `path`, `webp_path`, `avif_path`, `width`, `height` and `size_bytes` — seven server-derived columns against a three-column `#[Fillable(['title', 'description'])]`. That makes `Media` this repo's most lopsided example of the omission-as-guard convention; see [conventions/base-standards.md](../conventions/base-standards.md#model-conventions).

#### Indexes — three, and four omissions

`php artisan db:table media` reports exactly three: `primary` on `id`, `media_path_unique`, and `media_uploaded_by_foreign`. That is the intended list, and note the migration writes **two** of them — the third is InnoDB's own, auto-created for the FK, which is why there is no explicit `$table->index('uploaded_by')` here (the same rule `create_sales_regions_table` follows; see [migrations.md](migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)).

- **`path` UNIQUE is a last-word guard, not the primary defence.** The stored basename is a 40-character random string, so a collision is already implausible; the constraint is what makes "two rows can never point at the same file" a *database* invariant rather than a convention — the same reasoning [`users.pending_email`](#users) records.
- **No index on `title` or `description`, and no `FULLTEXT`.** Search is a deliberate `LIKE '%term%'` scan (`App\Models\Media::search()`), and a leading-wildcard `LIKE` cannot use a B-tree anyway. At this table's realistic size — a backoffice media library is 10²–10³ rows — the scan resolves in well under a millisecond, while `FULLTEXT` costs a write on every insert **and changes match semantics**: its word-boundary and minimum-token-length rules would make a partial term stop matching, which a user typing part of a filename experiences as "search is broken". Note this is a **scale** judgement, not a portability one: this app's tests run on MySQL, so `FULLTEXT` genuinely would work.
- **No index on `uploaded_by` beyond the FK's own.** Nothing filters on it today; add one with the feature that needs it.
- **No index on `created_at`** despite it being the intended sort key, for the same cardinality reason as everything above.

> ⚠️ **The search scope escapes its own wildcards, and a caller must not re-implement it.** `Media::search($term)` runs `addcslashes($term, '%_\\')` before interpolation, so an administrator searching for `50%` gets a literal match rather than a wildcard. An empty term is a deliberate no-op that leaves the query unfiltered — it returns the **full library**, never an empty set. Any second query written against `title`/`description` must reuse this scope rather than hand-rolling a `LIKE`.

> ⚠️ **Rows here name files that `storage:link` must have made reachable.** `media` is the first table in this app whose contents are only half in the database; the other half is `storage/app/public`, served through the `public/storage` symlink. `composer.json`'s `setup` script gained `@php artisan storage:link` in this story precisely because it had never needed to run before — a fresh clone that skips it stores files correctly and serves every one of them as a 404, with nothing in the schema or the tests able to detect it.

### `product_categories`

Source: `database/migrations/2026_09_01_084836_create_product_categories_table.php` (story 0023) — the third Epic 2 domain table, after [`sales_regions`](#sales_regions) and [`media`](#media). At the time it shipped it was a **standalone catalog with no relationships to anything else at all** — no FK in, no FK out — and per this file's own [ER-diagram rule](#er-diagram) it earned no entity in the mermaid diagram. **That changed the same day, with story 0024**: `products.product_category_id` is a `NOT NULL` FK into this table, so `product_categories` now carries a real relationship and appears in the diagram above (`PRODUCT_CATEGORIES ||--o{ PRODUCTS`). Nothing about this table's own columns, indexes or behaviour changed — see [`products`](#products) below for the FK side.

Model: [`App\Models\ProductCategory`](../../app/Models/ProductCategory.php). Columns in real physical order (verified against `information_schema.COLUMNS`, the same physical-order discipline `php artisan db:table` gives every other table here):

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid (v7) PK | `CHAR(36)`; generated by `HasUuids`. One of [ADR 0001](../decisions/0001-uuid-primary-keys.md)'s **original seven** named entities — the first Epic 2 table to land that needed **no** ADR amendment, unlike `sales_regions` and `media`, neither of which the ADR named |
| `name` | `VARCHAR(255)`, **unique** | the entity's only mutable field; a bare `string()`, matching `users.name`/`users.email` rather than a narrower indexed length — the same precedent `sales_regions`'s columns cite, considered and rejected here too |
| `created_at` | timestamp, nullable | |
| `updated_at` | timestamp, nullable | |

**No `SoftDeletes`, deliberately.** A lookup-table row has none of the reasons `users` soft-deletes for (identity retention, freeing an authentication identifier, relations that must survive a delete), and `Rule::unique()` does **not** apply the soft-delete scope (see [the `users` note above](#users)) — so a trashed "Footwear" would squat its name forever unless every uniqueness check were made trashed-aware. Delete is a hard `DELETE`, through the model instance per [conventions/base-standards.md](../conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder)'s instance-not-builder convention.

**No seeded state — this table starts empty, unlike `sales_regions` (~254 rows) or the permission tables.** There is no `ProductCategorySeeder`; the only way a row exists is through [`App\Actions\ProductCategories\CreateProductCategory`](../../app/Actions/ProductCategories/CreateProductCategory.php), and this story ships no caller for it outside its own tests.

**Name uniqueness is enforced in two layers, and the database index is deliberately the *lesser* of them.** `name`'s `utf8mb4_unicode_ci` collation is case- **and** accent-insensitive, so the `UNIQUE(name)` index alone would refuse a "Footwear"/"footwear" or "Niño"/"Nino" pair — but only as a raw `23000` `QueryException` with no field-level message. The authoritative check is a normalised comparison in PHP, via the shared `App\Actions\NormalizeForSearch` (story 0022's D13) inside `App\Concerns\ProductCategoryValidationRules::uniqueNormalisedName()`, which refuses the same pair cleanly as a `ValidationException` on `name` before the database is ever asked; the index remains purely a **race**-condition backstop for two concurrent creates that both pass validation — the identical relationship [`users.pending_email`](#users) already establishes for its own unique column. Both `CreateProductCategory` and `RenameProductCategory` convert a `23000` into that same `ValidationException` shape, mirroring [`CreateUser`](../../app/Actions/Users/CreateUser.php)'s handling of `email`.

**Indexes — exactly two, both present by requirement rather than choice.** `primary` on `id`, and `product_categories_name_unique`, verified directly against `information_schema`/`SHOW INDEX`. No index on `created_at`/`updated_at` — this is a near-empty lookup table, not a high-write one, the same cardinality reasoning `users.status` and `sales_regions`'s several omitted columns already establish.

⚠️ **None of `CreateProductCategory`, `RenameProductCategory` or `DeleteProductCategory` authorize their own operation — a deliberate, recorded gap.** `App\Policies\ProductCategoryPolicy` exists and is fully tested (`viewAny`/`create`/`update`/`delete`, gating on the already-seeded `products.view`/`create`/`edit`/`delete`) but has **zero call sites** until the not-yet-built UI story (0025) wires in `Gate::authorize()` before every action call. See [conventions/base-standards.md](../conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers).

### `products`

Source: `database/migrations/2026_09_01_142007_create_products_table.php` (story 0024) — the fourth Epic 2 domain table, and the first with a **required** FK into another Epic 2 table (`product_categories`) alongside an **optional** one into `media`. Covers [PRD §2.2](../PRD/PRD.md#22-products)'s core product fields; sales-region assignment (story 0026) and variants (0028–0031) are later tables.

Model: [`App\Models\Product`](../../app/Models/Product.php). Columns in real physical order (verified with `php artisan db:table products`):

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid (v7) PK | `CHAR(36)`; generated by `HasUuids`. One of [ADR 0001](../decisions/0001-uuid-primary-keys.md)'s **original seven** named entities ("Products") — like `product_categories` before it, this needed **no** ADR amendment; see [Amendment 3](../decisions/0001-uuid-primary-keys.md#amendment-3-2026-09-01--products-is-the-second-of-the-original-seven-to-ship) |
| `product_category_id` | uuid FK → `product_categories.id`, **NOT NULL** | `restrictOnDelete()` — a category cannot be deleted while any product references it. The 0023-shipped `products.*` FK is genuinely enforced only by this table; 0023 itself has no FK in or out. The clean, message-carrying refusal (rather than a raw `23000`) is [0024b](../../ai-spec/tasks/0024b-product-category-in-use-delete-guard.md)'s retrofit to `DeleteProductCategory`, not yet shipped as of this story |
| `name` | `VARCHAR(255)` | a bare `string()`, matching `users.name`/`product_categories.name` rather than a narrower indexed length |
| `sku` | `VARCHAR(64)`, **unique** | the stock-keeping-unit identifier, global and unscoped (two products may not share one, and scoping it to a category would defeat its purpose). Canonicalised in PHP (`Str::upper(trim($sku))`) before both validation and persistence, so the stored value and the index always compare like-for-like — see the ⚠️ below |
| `type` | `VARCHAR(20)`, **no default** | cast to [`App\Enums\ProductType`](../../app/Enums/ProductType.php) (`physical` / `virtual`). Deliberately **no** `DEFAULT` clause, unlike every other enum-backed column in this schema (`users.status`, `sales_regions.kind`, `products.status` below) — physical and virtual are equally wrong guesses, so an omitted `type` must fail loudly (`1364` under this connection's `'strict' => true`) rather than silently guess. Safe only because the table starts empty; an `ALTER TABLE ADD COLUMN NOT NULL` against a populated table would need the conditional-backfill shape [migrations.md](migrations.md#when-the-new-columns-default-is-wrong-for-existing-rows-backfill-in-the-same-up) documents instead |
| `status` | `VARCHAR(20)`, default `draft` | cast to [`App\Enums\ProductStatus`](../../app/Enums/ProductStatus.php) — **exactly two persisted cases**, `active` / `draft`. See [Out-of-stock is computed, never stored](#out-of-stock-is-computed-never-stored) below |
| `price` | `DECIMAL(10,2)`, **NOT NULL** | **never `float`** — feeds tax arithmetic and future order-line snapshots. Unlike `sales_regions.rate`, not nullable: a product has no "unconfigured" price state, and `0.00` (a free item) must stay expressible. No `->unsigned()` (deprecated on `DECIMAL` since MySQL 8.0.17, ignored by SQLite); `'min:0'` in validation is the enforcement. Precision 10 (ceiling €99,999,999.99) is a *failure-mode* choice — `decimal(8,2)`'s €999,999.99 cliff would surface as a MySQL `22003` rather than a validation message |
| `stock` | `INT`, **signed**, default `0` | *not* `unsignedInteger` — a future stock decrement below zero (Epic 3) would otherwise become a MySQL `1264 Out of range` 500 instead of a business decision, and SQLite ignores `UNSIGNED` entirely. `NOT NULL` with default `0` is load-bearing for the out-of-stock badge: `Product::isOutOfStock()` is `stock <= 0`, and a `NULL` would make that undecidable |
| `description` | `MEDIUMTEXT`, nullable | **not** `TEXT`, deliberately: Laravel's `max:` validation rule counts *characters* (`mb_strlen`) while `TEXT` caps at 65,535 *bytes*, so a `max:65535` rule against a `TEXT` column is a silent `22001` the moment accented or markup content grows past the byte ceiling. `MEDIUMTEXT` (16 MB) makes the validation rule the binding limit instead. **Sanitized on write** — see the ✅ below |
| `featured_media_id` | uuid FK → `media.id`, nullable | `foreignUuid(...)->nullable()->constrained('media')->restrictOnDelete()`. `constrained('media')` is mandatory, not stylistic: Laravel would otherwise infer a `featured_media` table from the column name. Independent of the gallery (see [`product_media`](#product_media) below) — nothing prevents this pointing at a media row absent from the product's own gallery, by design |
| `created_at` / `updated_at` | timestamp, nullable | |

**No `SoftDeletes`, deliberately** — the same reasoning [`product_categories`](#product_categories) already gives (`Rule::unique()` does not apply the soft-delete scope, verified on `users`, so a trashed product would permanently squat its SKU), plus one specific to this table: a hard delete is what lets story 0029's future `product_variants.product_id` `cascadeOnDelete()` actually cascade — a soft delete never fires a cascade, which would leave variants live against a trashed parent. A future order line that must survive a product's deletion snapshots `name`/`sku`/`price` onto itself rather than depending on the product still existing; PRD §3.2 already requires that snapshot regardless, since a product's price changes without being deleted.

#### Out-of-stock is computed, never stored

`ProductStatus` has **exactly two** persisted cases. "Agotado" (out of stock) is a third, **display-only** state — [`App\Enums\ProductDisplayStatus`](../../app/Enums/ProductDisplayStatus.php), returned by `Product::displayStatus()` — derived from `stock` at read time and never written to any column:

```php
// app/Models/Product.php
public function displayStatus(): ProductDisplayStatus
{
    if ($this->status === ProductStatus::Active && $this->isOutOfStock()) {
        return ProductDisplayStatus::OutOfStock;
    }

    return ProductDisplayStatus::from($this->status->value);
}
```

The override applies to `Active` only — a `Draft` product with zero stock still reads as `Draft`, because publication state and stock availability are orthogonal axes a single column cannot hold without losing information (a sold-out Draft restocking would otherwise have no way to know whether to return to `active` or `draft`). Storing it would also mean every code path that ever writes `stock` — Epic 3's orders and 0029's variants both will — would have to rewrite `status` inside the same transaction or the two diverge permanently, and `WHERE status = 'active'` would silently need to become `WHERE status IN ('active', 'agotado')` everywhere.

Four structural layers make an out-of-stock value unsettable, with no convention doing the load-bearing work: the enum has no such case; `Rule::enum(ProductStatus::class)` refuses a forged payload value rather than filtering it; `CreateProduct`/`UpdateProduct` both resolve their `?string $status` parameter through `ProductStatus::from($status)` (never a cast on a typed parameter — both actions accept a plain nullable string, exactly what validation needs to check first), so a caller reaching that line with anything other than `null` or one of the two real backing values throws `ValueError` rather than silently persisting a third one; and the model cast throws the identical `ValueError` on a hand-written bad database value read back later. A raw `DB::table('products')->insert(['status' => 'agotado', ...])` **does** succeed at the database layer — a plain `VARCHAR` accepts any string — which is the one honest characterization of how thin the DDL-level guarantee is on its own; the enforcement is entirely application-level, at these four layers together.

#### Indexes — four, all present by requirement rather than choice

`php artisan db:table products` reports exactly four: `primary` on `id`, `products_product_category_id_foreign`, `products_featured_media_id_foreign`, and `products_sku_unique`. That is the intended list — no `$table->index('product_category_id')` or `$table->index('featured_media_id')` was hand-written; both FK indexes are InnoDB's own, auto-created for the constraint, per [migrations.md](migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)'s existing rule (this is that rule's **third** confirming instance, after `sales_regions` and `media`). No index on `type`, `status`, `name` or `created_at`, for the same cardinality reasoning `users.status` and `sales_regions`'s omitted columns already establish.

> ⚠️ **`sku`'s `UNIQUE` compares like-for-like on both engines only because the value is canonicalised before it ever reaches the index.** Unlike [`product_categories.name`](#product_categories) — a human-facing display label that cannot be upper-cased without becoming unreadable, and therefore needs `App\Actions\NormalizeForSearch`'s accent-folding comparison in PHP as its authoritative guard — a SKU is a machine identifier with no accent, case or whitespace significance by design (`regex:/^[A-Z0-9][A-Z0-9._\/-]*$/` after upper-casing), so `Str::upper(trim($sku))` deletes the collation problem instead of working around it. The `UNIQUE` index is still only the **race-condition backstop** behind `Rule::unique()`, not the primary defence — `CreateProduct`/`UpdateProduct` catch the resulting `QueryException` and convert exactly MySQL error code **1062** (not the whole `23000` SQLSTATE class) into a `ValidationException` on `sku`, because this transaction also carries FK writes (`product_category_id`, `featured_media_id`, every `product_media` row) that must never be misreported as "the SKU is taken".
>
> ⚠️ **A duplicate SKU namespace is coming with story 0029's `product_variants` table, and this table's `UNIQUE` alone will not close it.** [PRD §2.2](../PRD/PRD.md#22-products)'s duplicate-SKU scenario names both "another product" and "a variant" — a second, independent `UNIQUE` on `product_variants.sku` would give the two tables separate namespaces, satisfying neither example. 0029 must reuse this table's canonicalisation rather than re-derive its own uniqueness mechanism.
>
> ✅ **Corrected 2026-09-02 (story 0024a) — `description` is sanitized on write, not left unsanitized "as of this story" as this blockquote previously stated.** [`App\Actions\Products\SanitizeProductDescription`](../../app/Actions/Products/SanitizeProductDescription.php) — an allow-list HTML sanitizer built on `symfony/html-sanitizer`, configured entirely by [`config/html-sanitizer.php`](../../config/html-sanitizer.php) — is invoked as the first thing done to `$description` in both [`CreateProduct`](../../app/Actions/Products/CreateProduct.php) and [`UpdateProduct`](../../app/Actions/Products/UpdateProduct.php), **before** `Validator::make()` runs, so `productDescriptionRules()`'s `max:65535` rule measures the stored value rather than markup about to be dropped. The allow-list is exactly the WYSIWYG toolbar's own tag set (`strong`/`b`, `em`/`i`, `u`, `h2`, `ul`/`ol`/`li`, `a[href]` limited to `http`/`https`/`mailto`, `img[src,alt]` limited to `http`/`https`, `p`, `br`); every genuinely dangerous element (`script`, `iframe`, `form`, `svg`, `object`, `input`, …) is explicitly **dropped** — tag and text content both removed — rather than left to the library's `block` default, which only strips a tag and keeps its text. See [security/html-sanitization.md](../security/html-sanitization.md) for the full mechanism, the finding that made the drop-list necessary, and the idempotence caveat three later stories (0076, 0077, 0079) depend on. The previously-cited interim risk — no sanitizer existed between story 0024's closure and this one — is retired; two narrower residuals remain **by design** and are recorded on that page rather than here: a future writer that bypasses `CreateProduct`/`UpdateProduct` re-opens the hole, and the allow-list itself is now the control a later change to it must be reviewed as carefully as any other.

### `product_media`

Source: `database/migrations/2026_09_01_142008_create_product_media_table.php` (story 0024) — the ordered gallery pivot between `products` and `media`. Name declared explicitly (`Str::plural`/basename inference would otherwise produce `media_product`, alphabetising both sides' snake-cased names); the stated name reads correctly for the only direction anything traverses ("this product's gallery").

Columns in real physical order (verified with `php artisan db:table product_media`):

| Column | Type | Notes |
| --- | --- | --- |
| `product_id` | uuid FK → `products.id` | `cascadeOnDelete()` — deleting a product removes its own gallery rows. Leading column of the composite primary key below, since every real query is `WHERE product_id = ? ORDER BY position` |
| `media_id` | uuid FK → `media.id` | `constrained('media')->restrictOnDelete()` — see the ⚠️ below |
| `position` | `INT UNSIGNED`, default `0` | the caller's **0-based array index** at the time of the last `SyncProductGallery` sync — see the ⚠️ below. No `timestamps()`: nothing reads them, and this phase has no audit-trail requirement |

**No surrogate `id`; composite primary key `(product_id, media_id)`.** Nothing FKs into a pivot row, so a surrogate key buys nothing and costs a second index — the same shape the vendored `spatie/laravel-permission` pivot tables (`role_has_permissions`, `model_has_roles`) already use in this schema. The composite PK doubles as the "an image cannot appear twice in one product's gallery" invariant.

**No `SoftDeletes`, no `deleted_at`** — a pivot row has no independent identity to retain.

#### `featured_media_id` and this pivot's media FK are deliberately symmetric — and the inverse case of `media.uploaded_by`

Both `products.featured_media_id` and this table's `media_id` are `restrictOnDelete()`: **an image cannot be deleted while any product references it, as its featured image or via the gallery**, matching this project's house pattern for "you cannot delete something in use" ([0024b](../../ai-spec/tasks/0024b-product-category-in-use-delete-guard.md) implements the identical rule for categories). `nullOnDelete()` was rejected for the featured image and never available on the pivot column at all, since it is half the primary key.

This is the **exact inverse** of the trap [`media.uploaded_by`](#uploaded_by-and-the-soft-delete-interaction--read-this-before-fixing-the-fk) records: that FK's `nullOnDelete()` essentially never fires, because `users` is soft-deleted and a soft delete is an `UPDATE`. `media` carries **no `deleted_at`**, so when a future media-deletion story implements a real `DELETE`, these two FKs genuinely **will** fire — the same clause shape (`nullOnDelete()` vs. `restrictOnDelete()`) behaves oppositely depending on whether the referenced table is soft-deleted, which is exactly why `tests/Feature/Products/ProductMediaTest.php` drives both FKs with a **raw** `DB::table('media')->delete()` today: no application path deletes media yet, so this is the only executable proof either constraint exists. A future media-delete story must count references across `products.featured_media_id`, `product_media` and (0029) variants before it can ship a working delete at all — a `23000` on every referenced image is the accepted, deliberate cost of choosing `restrictOnDelete()` here.

#### `position` is written only by `App\Actions\Products\SyncProductGallery`, as the caller's array index

`SyncProductGallery` is the **single writer** of this column and of `products.featured_media_id` — no Livewire component, controller, or sibling action writes either, and a reachability test (`tests/Feature/Products/ProductAuthorizationTest.php`) asserts no class under `app/` other than `App\Actions\Products\CreateProduct`/`UpdateProduct` references it. Its contract, in full: the caller passes the **complete, authoritative** ordered gallery on every call (never a delta — ids present are the gallery, ids absent are detached), and `position` is rewritten as the 0-based array index for **every surviving row on every call**, never `MAX(position) + 1`. That full rewrite — not an append-only assignment — is what makes a gallery reorder expressible as an ordinary re-save: the action cannot distinguish a reorder from an add, a removal or a no-op, because it always rewrites the whole set from the array it was given.

`App\Models\Product::gallery()` always tiebreaks `->orderByPivot('position')->orderByPivot('media_id')`. With `default(0)` on the column, a raw insert bypassing the action — the only path left that can still produce a tie, since every action-driven row now carries an explicit index — would otherwise read back in arbitrary order.

#### Indexes — two, both present by requirement rather than choice

`php artisan db:table product_media` reports exactly two: `primary` on `(product_id, media_id)` and `product_media_media_id_foreign`. `product_id`'s own FK index need not be written separately — it is the composite primary key's leading column, which already serves that role; `media_id`'s is InnoDB's auto-created FK index, per [migrations.md](migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)'s rule (this table's own FK column is this rule's **fourth** confirming instance in this schema, `products.product_category_id`/`featured_media_id` above being the third). No unique index on `(product_id, position)` — enforcing at-most-one row per position per product would force every reorder through a temporary value or a deferred constraint MySQL 8.4 does not have — and no index on `position` alone, since it is only ever a sort key inside an already-narrow `product_id` range.

## Infrastructure tables

No foreign keys, not part of the ER diagram:

| Table | Source | Purpose |
| --- | --- | --- |
| `password_reset_tokens` | `0001_01_01_000000_create_users_table.php` | Fortify password-reset tokens (and administrator invitations), keyed by `email` with no FK to `users` — which is why `User::delete()` deletes the rows for a deleted account's address itself (see [Soft deletes](#soft-deletes)) |
| `sessions` | `0001_01_01_000000_create_users_table.php` | `SESSION_DRIVER=database` session storage |
| `cache` | `0001_01_01_000001_create_cache_table.php` | `CACHE_STORE=database` cache storage |
| `jobs` | `0001_01_01_000002_create_jobs_table.php` | `QUEUE_CONNECTION=database` job storage |

## Notes

- `app/Models/` holds six classes and they are three different kinds of thing: `User` (Epic 1's domain model), `SalesRegion` (task 0016 — the first Epic 2 domain model, and the first table this repo created greenfield with a UUID PK), `Media` (story 0019), `ProductCategory` (story 0023 — the first with no relationships to anything at all, until story 0024's `products.product_category_id` gave it one) and `Product` (story 0024 — the fourth Epic 2 domain model, and the first with a required FK into another Epic 2 table), and `Role`, which is a `spatie/laravel-permission` subclass over the package's existing `roles` table rather than a new entity — it adds no column and no migration (see [architecture/authorization.md](../architecture/authorization.md#the-super-admin-roles-invariants)). This file grows a new section per table as the domain layer is built. **`product_media` has no model class of its own** — it is reached only through `Product::gallery()`'s `BelongsToMany` and `withPivot('position')`, the same shape the vendored `role_has_permissions`/`model_has_roles` pivots use.
- For migration authoring conventions (naming, `down()` requirements, real examples), see [database/migrations.md](migrations.md).
- **UUID (v7) primary keys ([ADR 0001](../decisions/0001-uuid-primary-keys.md)).** Status is split:
  - **Done:** `users.id` is a UUID (v7) `CHAR(36)` PK (Epic 1), applied by the 5 alteration migrations `2026_07_22_100001..100005_*.php`. The cascade is complete: `passkeys.user_id`, `sessions.user_id`, and the `spatie/laravel-permission` `model_has_roles` / `model_has_permissions` morph key (renamed `model_id` → `model_uuid`, retyped to `uuid`) all match. The ER diagram and tables above reflect this real, current state.
  - **Still future:** four of ADR 0001's original six not-yet-implemented entities (product variants, blog categories, blog tags, blog posts — PRD Epics 2 and 4, see [../PRD/PRD.md](../PRD/PRD.md)) do not exist in code yet. They will be created with UUID PKs from the start — greenfield, with no migration complexity. **Product Categories and Products are the first two of the six to land** — see [`product_categories`](#product_categories) (story 0023) and [`products`](#products) (story 0024) — and neither needed an ADR amendment, since both are among the ADR's own original seven named entities rather than an addition like `sales_regions`/`media` below; see [ADR 0001 Amendment 3](../decisions/0001-uuid-primary-keys.md#amendment-3-2026-09-01--products-is-the-second-of-the-original-seven-to-ship).
  - **`product_media` is not counted against either list.** It is a pivot table with no surrogate primary key of its own — a composite `(product_id, media_id)` over two already-UUID FKs — the same shape as the vendored `spatie/laravel-permission` pivots (`role_has_permissions`, `model_has_roles`), which this ADR has never covered either. There is no "entity identifier" here for the ADR's policy to apply to.
  - **Beyond ADR 0001's original seven — still two tables, and the ADR records it.** `sales_regions` (task 0016) and `media` (story 0019) are both UUID (v7) PK tables the ADR's Context section does not name. The deferred amendment this bullet asked for **has landed**: [ADR 0001 Amendment 1](../decisions/0001-uuid-primary-keys.md#amendment-1-2026-08-27--the-scope-is-the-policy-not-the-list-of-seven) (2026-08-27) states the project-wide policy — every new business entity is UUIDv7, with a high-volume internal geography lookup table as the one named `bigint` exception — instead of extending an enumeration a third story would extend again. Two honesty notes carried over unchanged: the ADR's *stated* rationale is enumeration safety, so `sales_regions` is keyed this way for **consistency** rather than because that rationale applies (a fixed public country catalog has nothing to enumerate, and a mixed-PK domain is worse than an over-provisioned key on ~254 rows), while `media` genuinely does fit it — its ids are interpolated into Blade and passed as `wire:click` arguments across a gallery of tiles.
  - The model-side convention (`HasUuids`, `@property string $id`) is in [conventions/base-standards.md](../conventions/base-standards.md#uuid-primary-keys); the migration-side pattern is in [database/migrations.md](migrations.md#uuid-primary-keys).

_Last updated: 2026-09-02 — Story 0024a (Product description — HTML sanitization on write). **Correction, not an addition**: the `products.description` row and the ⚠️ blockquote beneath [Indexes](#indexes--four-all-present-by-requirement-rather-than-choice) both stated that `description` was stored unsanitized "as of this story" (0024) — true when written, false now that 0024a has shipped. Both are rewritten in place as ✅ blocks describing the shipped `App\Actions\Products\SanitizeProductDescription` mechanism (sanitize-before-validate, in both `CreateProduct` and `UpdateProduct`, against the allow-list in `config/html-sanitizer.php`), per this project's audit-authored-page convention rather than left standing with a note appended after them. The old text is not preserved verbatim here since it described a fact this table itself owns (the current schema), not a narrative decision — the correction is the record. New pointer to [security/html-sanitization.md](../security/html-sanitization.md), the app's first HTML-sanitization security page. **Verified as unchanged rather than assumed:** every other row and section on this page, including the rest of the `products` table, `product_media`, and every other table — this story adds no migration, no column and no model change.

_Previously: 2026-09-01 — Story 0024 (Products — core CRUD backend). Added [`products`](#products) and [`product_media`](#product_media) — the fourth and fifth Epic 2 domain tables, and the first two whose columns/pivot were verified by running `php artisan db:table products`/`product_media` (four and two indexes respectively, both lists exactly what `constrained()` alone produces — the FK-index rule's third and fourth confirming instance in this schema). Covers `products`'s twelve columns including the deliberate `type`-has-no-default / `status`-defaults-to-draft asymmetry, the new [Out-of-stock is computed, never stored](#out-of-stock-is-computed-never-stored) subsection (`ProductStatus`'s exactly-two-cases invariant and the four structural layers that keep a third value unsettable), the SKU canonicalisation that lets a plain `UNIQUE` compare like-for-like on both engines (unlike `product_categories.name`'s heavier accent-folding guard), and the ⚠️ that `description` ships unsanitized until the paired story 0024a lands; and `product_media`'s composite-PK-no-surrogate-id shape, the `restrictOnDelete()` symmetry with `products.featured_media_id` that is the **exact inverse** of `media.uploaded_by`'s inert `nullOnDelete()`, and `SyncProductGallery` as the pivot's sole writer, with `position` always the caller's 0-based array index rather than an append-only counter. **Corrected the `product_categories` section's own now-false claim** that it "earns no entity in the mermaid diagram" — it does now, via `products.product_category_id` — and added `PRODUCT_CATEGORIES`, `PRODUCTS` and `PRODUCT_MEDIA` to the ER diagram. Updated **Notes**: `app/Models/` moves from five classes to six (`Product` the fourth Epic 2 domain model), and the UUID-PK "still future" bullet drops Products (now two of the ADR's six not-yet-implemented entities have landed, `product_categories` and `products`, neither needing an amendment — see [ADR 0001's new Amendment 3](../decisions/0001-uuid-primary-keys.md#amendment-3-2026-09-01--products-is-the-second-of-the-original-seven-to-ship)) and adds a bullet stating that `product_media`, a surrogate-key-less pivot, falls outside the ADR's UUID-entity count entirely — the same standing exemption the vendored permission pivots already have. **Verified as unchanged rather than assumed:** every other table section — `users`, `passkeys`, the five permission tables, `sales_regions` and `media` all have identical schemas after this story, which adds exactly two migrations and alters nothing existing._

_Previously: 2026-09-01 — Story 0023 (Product categories — backend): added the [`product_categories`](#product_categories) section — the third Epic 2 domain table and the first with no relationships to anything at all, so (per this file's own diagramming rule) it earns no entity in the ER diagram above, only a note explaining the absence. Columns verified against `information_schema.COLUMNS` directly on this worktree's dev database (`php artisan db:table` reported a stale `testing1` snapshot rather than the real `arospe_wt0023` connection, so the direct query was used instead — both showed the same two indexes once the migration was actually run here). Covers the two-layer name-uniqueness design (`App\Actions\NormalizeForSearch` in PHP as the primary guard, `UNIQUE(name)` as a race-condition backstop only), the deliberate absence of `SoftDeletes` and of any seeded rows, and the ⚠️ that none of the three domain actions authorize themselves — `ProductCategoryPolicy` exists and is tested but has zero call sites until story 0025's UI wires it in. Corrected the `app/Models/` sentence in Notes (four classes → five) and the UUID-PK "still future" bullet, which named six not-yet-implemented ADR 0001 entities where Product Categories is now the first of those six to land — and, unlike `sales_regions`/`media`, it needed **no** ADR amendment, since it is one of the ADR's own seven originally-named entities (see [ADR 0001](../decisions/0001-uuid-primary-keys.md#amendment-2-2026-09-01--product-categories-lands-inside-the-original-seven)). **Verified as unchanged rather than assumed:** every other table section — `users`, `passkeys`, the five permission tables, `sales_regions` and `media` all have identical schemas after this story, which adds exactly one migration and alters nothing._

_Previously: 2026-08-27 — Story 0019 (Media Library upload and conversions — backend): a new domain table, and the catalog's first growth since task 0002. Added the [`media`](#media) section — the columns in verified physical order (`php artisan db:table media`, not the migration file), the three-explicit-path-columns decision with the two alternatives rejected, the two deliberately omitted columns (`disk`, `mime_type`), the **three** real indexes and four omissions, and why `NOT NULL` on `webp_path`/`avif_path` **is** the schema-level statement of PRD §2.3 AC 4 — plus a `MEDIA` entity and its `uploaded_by` relationship in the ER diagram. Two things there are worth finding before someone "fixes" them: **`nullOnDelete()` on `uploaded_by` will essentially never fire**, because `users` is soft-deleted and a delete there is an `UPDATE`, so the FK stays populated and the relation resolves to `null` through the `SoftDeletingScope` instead; and this is the first table whose contents are only **half** in the database, which is why `composer.json`'s `setup` script gained `@php artisan storage:link` in the same story. Corrected the seeded-rows table (`permissions` 38 → **42**, `role_has_permissions` 37 → **41**, and "9 modules" → "10") and the `app/Models/` sentence in Notes, which counted three classes. **Closed the deferral this file has carried since task 0016**: the "Beyond ADR 0001's seven" bullet said amending the ADR was a follow-up task, and story 0019 — adding a *second* unnamed UUID entity — is where leaving it open a second time became the [stale-claim failure mode](../errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13) this project records; [ADR 0001 Amendment 1](../decisions/0001-uuid-primary-keys.md#amendment-1-2026-08-27--the-scope-is-the-policy-not-the-list-of-seven) now states the policy. **Verified as unchanged rather than assumed:** every other table section — `users`, `passkeys`, the five permission tables and `sales_regions` all have identical schemas after this story, which adds exactly one migration and alters nothing._

_Previously: 2026-08-20 — Task 0010 (Roles & permissions management — backend): the `roles` table is now written by the application, not only by the seeder, with **no schema change**. Corrected the collation paragraph, which said the Administrator creation path threw `RuntimeException` from a line in `RolePermissionSeeder` — both seeded-role paths are now `withoutEvents()` factory methods on `App\Models\Role` throwing `ImmutableRoleException`. Added the holder-count `deleting` guard (a 409, not a 403, and soft-deleted holders count) and noted in the seeded-rows table that custom roles now coexist with the two seeded ones._

_Previously: 2026-08-20 — Task 0016 (Sales Region catalog schema + seeder): added the `sales_regions` domain-table section (columns, the one-level-deep `parent_id` tree and its `kind` invariant, the seeded state, the seeder-owned vs. administrator-configurable column split that makes `upsert()` wrong here, and the verified index list with its four deliberate omissions and the unenforced single-`is_default` ⚠️), added the `SALES_REGIONS` node and its self-relationship to the ER diagram, and corrected two now-false claims in Notes — "no domain model exists beyond `User`", and the UUID bullet, which named only ADR 0001's seven entities while `sales_regions` is an eighth under a policy the ADR does not yet record._

_Previously: 2026-08-19 — Task 0008a (centralize Administrator-level role identification): recorded that `App\Models\Role` gained `isAdministratorRole()` / `isSuperAdminRoleRow()` / `persistedName()` with **no schema change**, what `persistedName()`'s database read-back means for a partially-hydrated row, why a tier check ignores `guard_name`, and the `utf8mb4_unicode_ci` collation on `roles.name` that makes both seeded-role creation paths read the persisted name back and throw on a case-insensitive collision._

_Previously: 2026-08-18 — Task 0008 (Super Admin role invariants): recorded that the `roles` table's model is now `App\Models\Role` with **no schema change**, that its `unique(name, guard_name)` index is not what prevents name acquisition, and corrected the stale "`app/Models/` has a single model" claim in Notes._

_Previously: 2026-08-17 — Task 0014 (drop the redundant `users_uuid_unique` index): removed the "known schema debt" note above — `database/migrations/2026_08_17_132646_drop_redundant_uuid_unique_index_from_users_table.php` drops it, so `users.id` now carries a single `PRIMARY` index. See [errors-log.md](../errors-log.md) for the closed entry._

_Previously: 2026-08-17 — Task 0007 (non-active status blocks sign-in): recorded that `users.status` is now an authentication control rather than a descriptive label, cross-referenced to the sign-in block in `architecture/authentication.md`, and noted that this does not change the column's deliberate index omission (the block reads `status` off a row already fetched by the `email` unique index)._

_Previously: 2026-08-14 — Task 0005 (soft-delete users + administrator-level protection guard): added `users.deleted_at` to the ER diagram and the column table, and a **Soft deletes** subsection covering what a delete now rewrites (email obfuscation, `pending_email`/`email_verified_at` nulling, `password_reset_tokens` revocation), what survives it, the bulk-delete constraint, and the two deliberate index omissions (`deleted_at`, and the untouched `email` unique)._
