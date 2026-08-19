# [0016] Create the `sales_regions` catalog table and seed it with the ISO countries and Spain's fiscal territories

## Description
Create the `sales_regions` table — the single source of truth behind [PRD Epic 2 §2.1](../../docs/PRD/PRD.md#21-sales-regions--taxes), where **a tax rule *is* a Sales Region entry** — and the seeder that populates it with the ISO 3166-1 country list plus Spain's five fiscal territories (Península, Baleares, Canarias, Ceuta, Melilla) related to a parent "España" row. The catalog is **fixed and seeded**: administrators configure existing entries, they never invent countries. This story ships the schema, the model, the enum, the bundled ISO fixture and the seeder only — no UI, no invariant enforcement, no tax resolution.

> **Scope change — 2026-08-18.** The supranational **groupings** (Unión Europea, Internacional) that earlier revisions of this story seeded have been **removed from the catalog entirely** by user decision. Only direct, individual countries and Spain's fiscal sub-territories exist. See **D11** in [Documented functional decisions](#documented-functional-decisions).

## Type
backend | includes database-expert: **yes** (new table + migration + seeder)

**Confirmed decisions** (resolved in the Phase 1 Three Amigos debate; re-verify at Phase 2). Each is recorded with its reasoning in [Documented functional decisions](#documented-functional-decisions) below:

- **UUID v7 primary key via `HasUuids`** — `sales_regions` is a real business entity under the project-wide PK policy (D9).
- **An immutable, seeder-owned `slug` is the idempotency key — never `code`** (D1). This is the single most consequential decision in the story.
- **`code` *is* administrator-editable** (D2), which is exactly why `slug` exists.
- **A self-referencing nullable `parent_id`** relates Spain's five fiscal territories to the "España" row (D3).
- **A `kind` enum** (`country` / `fiscal_territory`) makes each row's type explicit rather than inferred from `parent_id` (D4, revised by D11).
- **No grouping entries** — the catalog holds only individual countries and Spain's fiscal sub-territories (D11; supersedes D5).
- **Seeded names are in Spanish**; the bundled fixture also carries `name_en` as forward insurance (D6).
- **6 rows seed active; the remaining ~248 ISO countries seed inactive** (D7).
- **A new `ProductionSeeder` composes the required catalogs** (D8).

**Out of scope — owned by sibling stories.** Do not implement these here:

- Editing rate/description/code on an entry, the **single-default invariant enforcement**, and rate validation (negative/non-numeric) → **story 0017**. This story only leaves the catalog in a coherent starting state (exactly one default); it enforces nothing.
- The Sales Regions list/editor UI, the group-header rendering of the "España" row, and the "no way to add a country" affordance → **story 0018**.
- Tax-rate **resolution** for a product/order, and what `rate IS NULL` means at resolution time → **story 0026**.
- The shipping geography catalog and its zone CRUD → **story 0032**. It is a separate catalog with **no shared table** ([PRD assumption 4](../../docs/PRD/PRD.md#assumptions--confirmed-decisions)); it will *read* this story's ISO fixture file read-only.
- The `sales-regions.{view,create,edit,delete}` permissions **already exist** from [story 0002](done/0002-seed-roles-permissions-catalog.md)'s catalog. Do **not** re-seed them and do **not** invent new permission strings.

## Gherkin
```gherkin
Feature: The seeded Sales Region catalog

  # --- Catalog coverage ---

  Scenario: Seeding populates the Sales Region catalog
    Given a platform operator with an empty Sales Region catalog
    When they run the sales region seeder
    Then the catalog holds the ISO country list and Spain's fiscal territories

  Scenario: Spain exposes its fiscal sub-territories as separate entries
    Given a tax administrator viewing Spain in the seeded Sales Region catalog
    When they expand Spain's entries
    Then Península, Baleares, Canarias, Ceuta, and Melilla appear as
      distinct, separately-configurable entries

  Scenario: Each Spanish fiscal territory belongs to the Spain entry
    Given a platform operator who has run the sales region seeder
    When the parent of each Spanish fiscal territory is read
    Then every one of the five identifies the "España" entry as its parent

  Scenario: The catalog is never nested more than one level deep
    Given a platform operator who has run the sales region seeder
    When the catalog's parent relationships are read
    Then no entry has a parent that itself has a parent

  Scenario: The catalog holds only countries and their fiscal territories
    Given a platform operator who has run the sales region seeder
    When the kind of every seeded entry is read
    Then every entry is either an individual country or a fiscal territory
      of one, and no supranational grouping entry exists

  Scenario: The catalog carries no retired or invented country codes
    Given a platform operator who has run the sales region seeder
    When the seeded country codes are read
    Then codes retired from the standard are absent

  # --- The catalog is fixed, not admin-authored ---

  Scenario: The catalog does not allow inventing new countries
    Given a tax administrator viewing the seeded, fixed Sales Region catalog
    When they look for a way to add a brand-new country from scratch
    Then no such option exists, and only seeded entries can be configured
      or enabled/disabled

  Scenario Outline: A structural attribute of an entry cannot be mass-assigned
    Given a tax administrator configuring a seeded region entry
    When a submitted form attempts to set <attribute>
    Then the value is discarded, because only the seeder writes it

    Examples:
      | attribute            |
      | the identifying slug |
      | the parent entry     |
      | the entry kind       |
      | the default flag     |
      | the active flag      |

  # --- Initial state the catalog ships in ---

  Scenario: Seeding flags exactly one entry as the default
    Given a platform operator with an empty Sales Region catalog
    When they run the sales region seeder
    Then exactly one entry is flagged as the default

  Scenario: The seeded default entry is España Península
    Given a platform operator with an empty Sales Region catalog
    When they run the sales region seeder
    Then the "España (Península)" entry is the one flagged as the default

  Scenario: Only the entries the business already operates in start active
    Given a platform operator with an empty Sales Region catalog
    When they run the sales region seeder
    Then the Spanish entries are active,
      and the remaining countries are inactive until an administrator configures them

  Scenario: An unconfigured country carries no tax rate
    Given a platform operator who has run the sales region seeder
    When the tax rate of an inactive country entry is read
    Then no rate is set, because no rate has been configured rather than a rate of zero

  # --- Idempotency and the no-clobber guarantee ---

  Scenario: Re-running the seeder duplicates no entry
    Given a platform operator who has already run the sales region seeder once
    When they run the sales region seeder again
    Then the catalog holds the same number of entries as before

  Scenario: Re-seeding preserves an administrator's configured tax rate
    Given a tax administrator who has set a rate on the "Canarias" entry
    When a platform operator runs the sales region seeder again
    Then the "Canarias" entry still carries the administrator's rate

  Scenario: Re-seeding preserves an administrator's edited code
    Given a tax administrator who has changed the code on the "Canarias" entry
    When a platform operator runs the sales region seeder again
    Then the entry still carries the administrator's code, and no second
      "Canarias" entry is created

  Scenario: Re-seeding leaves an entry's identity untouched
    Given a tax administrator who has configured the "Canarias" entry
    When a platform operator runs the sales region seeder again
    Then the entry keeps the same identifier, because the catalog is updated in place
      rather than rebuilt

  Scenario: Re-seeding does not move the default away from the administrator's choice
    Given a tax administrator who has made "Canarias" the default entry
    When a platform operator runs the sales region seeder again
    Then "Canarias" is still the only default entry

  Scenario: Re-seeding restores a canonical name that was overwritten
    Given a platform operator whose catalog holds an entry whose canonical name was altered
    When they run the sales region seeder again
    Then that entry carries its canonical name again

  # --- Deployment ---

  Scenario: Seeding a production environment populates the Sales Region catalog
    Given a platform operator seeding a production environment
    When they run the production seeder
    Then the Sales Region catalog is fully populated, because the catalog is
      required application data rather than demonstration data

  Scenario: The production seeder also populates the roles and permission catalog
    Given a platform operator seeding a production environment
    When they run the production seeder
    Then the roles and the permission catalog are populated as well

  Scenario: Seeding the Sales Region catalog creates no accounts or roles
    Given a platform operator with an empty database
    When they run the sales region seeder on its own
    Then no user, role or permission is created by it
```

## Files to create/modify

### `database/migrations/<ts>_create_sales_regions_table.php` — **create**

Scaffold with `php artisan make:migration create_sales_regions_table --no-interaction`. This is the repo's **first real greenfield UUID `create_*` migration** — [`docs/database/migrations.md`](../../docs/database/migrations.md#uuid-primary-keys) currently presents that pattern only as a *target* snippet.

```php
Schema::create('sales_regions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('slug', 64)->unique();              // immutable seeder key — never user-writable
    $table->string('code', 10)->nullable();            // admin-editable display/fiscal chip
    $table->string('name', 150);
    $table->string('description', 255)->nullable();
    $table->decimal('rate', 6, 3)->nullable();         // NULL = not configured; 0.000 = a real 0%
    $table->string('kind', 20);                        // App\Enums\SalesRegionKind — no default
    $table->foreignUuid('parent_id')->nullable()->constrained('sales_regions')->restrictOnDelete();
    $table->boolean('is_default')->default(false);
    $table->boolean('is_active')->default(false);
    $table->unsignedSmallInteger('sort_order')->default(0);
    $table->timestamps();
});

// down(): Schema::dropIfExists('sales_regions');  — the self-referencing FK drops with the table
```

Column choices that are load-bearing rather than stylistic:

| Column | Why exactly this |
| --- | --- |
| `slug` `string(64)` **unique**, NOT NULL | The immutable identity the seeder matches on (D1). Unique because it is a **correctness constraint**, not a performance one. |
| `code` `string(10)` nullable | Explicit length, never bare `string()` — the same reasoning [`migrations.md`](../../docs/database/migrations.md) records for `users.status` (a bare `string()` is `VARCHAR(255)`, a 1020-byte utf8mb4 index key for a 2–6 character token). Nullable because an entry may carry none. |
| `name` `string(150)`, `description` `string(255)` | Deliberately **not** `TEXT`. [`schema.md`](../../docs/database/schema.md) already calls out `users`' fat clustered index caused by two `TEXT` columns; don't repeat it on a table whose whole point is cheap full scans. |
| `rate` **`decimal(6,3)` nullable** | **Never `float`** — binary floating point cannot represent `21.00` exactly, and this value feeds order tax arithmetic. `(6,3)` and `(5,2)` both occupy 3 bytes in MySQL, but `(6,3)` can represent `100.000` exactly (so 0017's "≤ 100" boundary is expressible) and accommodates real 3-decimal non-EU rates. **Nullable is the point**: `0.000` is a *legitimate* rate, so it cannot double as "unconfigured". Do **not** write `->unsigned()` — deprecated on `DECIMAL` since MySQL 8.0.17, and negative-rate rejection is 0017's validation rule. |
| `kind` `string(20)`, **no default** | `string` + a PHP backed enum, never a native MySQL `enum` — the exact precedent in `add_status_to_users_table`. No default on purpose: every row is written explicitly, and a default would let a mis-seeded row pass as a `Country`. Consequently this migration needs **no** enum import. |
| `parent_id` `foreignUuid` nullable `constrained('sales_regions')` `restrictOnDelete()` | `constrained()` **must** be given `'sales_regions'` explicitly, or Laravel infers a `parents` table from the column name. `restrictOnDelete()` over `cascadeOnDelete()`: cascading would let deleting "España" silently destroy five administrator-configured tax rates. |
| `sort_order` `unsignedSmallInteger` | The PRD lists Spain's territories in **fiscal** order (Península, Baleares, Canarias, Ceuta, Melilla), which is *not* alphabetical and is unrecoverable from the other columns. 2 bytes/row now vs. a second migration + re-seed later. |

**No `SoftDeletes`.** The catalog is fixed and rows are never deleted, only deactivated — `is_active` *is* the soft state. A `deleted_at` would also actively fight idempotency: a trashed row is invisible to the seeder's lookup, so a re-seed would insert a duplicate.

#### Indexes — present, and the deliberate omissions

Table shape: **~254 rows, near-read-only, written only by a deploy-time seeder**, clustered on a `CHAR(36)` PK. At this size an index earns its place by enforcing an **invariant**, not by speeding a read.

- **Present — `slug` UNIQUE.** The seeder's idempotency key and 0026's resolution key. Non-negotiable.
- **Present — the FK's index on `parent_id`.** InnoDB requires one regardless, so it is not discretionary.
  > ⚠️ **Do not also write an explicit `$table->index('parent_id')`.** This deliberately diverges from `create_passkeys_table`'s explicit `$table->index('user_id')`: MySQL auto-creates a supporting index for an FK only when no suitable index exists, so `constrained()` **plus** `index()` can produce **two** indexes on the same column — the exact shape of the `users_uuid_unique` write-amplification debt in [`errors-log.md`](../../docs/errors-log.md). **Verify with `php artisan db:table sales_regions` after migrating, not by reading the migration** — that entry's own rule. Neither expert could run it (no DB reachable from their shell).
- **Omitted — no index on `code`, and no UNIQUE on it.** Nothing joins or filters on it. A UNIQUE would create a real re-seed failure mode now that `code` is admin-editable (D2): the seeder writes `ES` while an administrator has moved `ES` elsewhere, and the seed aborts mid-transaction with an opaque `23000`. If 0017 wants distinct codes, that belongs there as a `Rule::unique()` with a human-readable message.
- **Omitted — no UNIQUE on `(parent_id, name)`.** `slug` already guarantees no duplicate entity, and a unique index over a utf8mb4 `name` would make the invariant depend on collation ("España" vs "Espana").
- **Omitted — no index on `is_default`, `is_active`, `kind` or `name`.** Cardinality, not selectivity — the same reasoning [`schema.md`](../../docs/database/schema.md) applies to `users.status`. A boolean over 254 rows is the worst possible index candidate. The searchable picker will use `LIKE '%…%'`, which no B-tree serves anyway.
  > 📌 **A working at-most-one-default constraint exists and is deliberately not used here.** MySQL 8.4 has no partial/filtered indexes, but a `STORED` generated column (`CASE WHEN is_default THEN 1 END`) plus a UNIQUE on it does enforce it, since unique indexes ignore `NULL`s. It is **story 0017's** to adopt knowingly — it would force 0017's "clear old, set new" into a strict ordering. Flagged so 0017 doesn't rediscover it.

### `app/Enums/SalesRegionKind.php` — **create**

Backed string enum, TitleCase keys / lowercase values, mirroring [`App\Enums\UserStatus`](../../app/Enums/UserStatus.php) and the project `CLAUDE.md` rule:

```php
case Country = 'country';                    // an ISO 3166-1 entity; address-resolvable
case FiscalTerritory = 'fiscal_territory';   // a sub-entity of a Country; parent_id NOT NULL
```

**Exactly two cases — there is no `Grouping`.** Supranational grouping entries were removed from the catalog on 2026-08-18 (D11); every seeded row is one of the two cases above, and both are address-resolvable.

Invariant, seeder-enforced and documented on the enum: `kind === FiscalTerritory` ⟺ `parent_id IS NOT NULL`.

**No `label()` method in this story.** `UserStatus::label()` exists because something renders it; nothing renders `kind` yet, and adding it would force `lang/en/sales-regions.php` **and** `lang/es/sales-regions.php` (which [`naming.md`](../../docs/conventions/naming.md#translation-keys) requires to stay key-for-key identical) into scope for keys with no consumer. Story 0018 adds both together.

### `app/Models/SalesRegion.php` — **create**

Scaffold: `php artisan make:model SalesRegion --factory --no-interaction` (skip `-m`; the migration is scaffolded separately so its filename follows `create_<table>_table`).

```php
/**
 * @property string $id
 * @property string $slug
 * @property string|null $code
 * @property string $name
 * @property string|null $description
 * @property string|null $rate            'decimal:3' casts to a STRING, not a float
 * @property SalesRegionKind $kind
 * @property string|null $parent_id
 * @property bool $is_default
 * @property bool $is_active
 * @property int $sort_order
 * @property-read SalesRegion|null $parent
 * @property-read Collection<int, SalesRegion> $children
 */
#[Fillable(['code', 'description', 'rate'])]
class SalesRegion extends Model
{
    /** @use HasFactory<SalesRegionFactory> */
    use HasFactory, HasUuids;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'kind' => SalesRegionKind::class,
            'rate' => 'decimal:3',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<SalesRegion, $this> */
    public function parent(): BelongsTo { return $this->belongsTo(self::class, 'parent_id'); }

    /** @return HasMany<SalesRegion, $this> */
    public function children(): HasMany { return $this->hasMany(self::class, 'parent_id'); }
}
```

Per [`base-standards.md`](../../docs/conventions/base-standards.md#uuid-primary-keys): `HasUuids` in the trait list, `@property string $id`, and **no `$keyType` / `$incrementing` properties** — `HasUniqueStringIds` already overrides those as methods. No `#[Hidden]` (nothing here is secret). No `SoftDeletes`.

**`#[Fillable(['code', 'description', 'rate'])]` — the omissions are the guard**, following this repo's documented convention that omission *is* the mass-assignment guard (`users.status`, `users.pending_email`), with `forceFill()` from one named place:

| Omitted | Why |
| --- | --- |
| `slug` | The seeder's immutable identity. A form that could change it breaks re-seed idempotency by duplicating the row. Non-negotiable. |
| `parent_id`, `kind`, `sort_order` | Structural; the tree is seeded and fixed. PRD: *"only seeded entries can be configured"*. |
| `is_default` | Story 0017's invariant owns every write. There is no DB constraint behind it (above), so leaving it fillable lets a stray `->update($validated)` create a second default before 0017's rule ever runs. |
| `is_active` | The PRD **couples** deactivation to the default invariant (*"disabling the current default is blocked unless a new default is set"*), so the two must be written together by one guarded operation. Fillable `is_active` + non-fillable `is_default` invites exactly the split write the invariant forbids — the failure mode [`security/livewire-authorization.md`](../../docs/security/livewire-authorization.md) records. |
| `name` | PRD §2.1 lists only rate/description/code as editable, and *"the catalog does not allow inventing new countries"* implies canonical names are fixed. It is also what lets a re-seed refresh a renamed country ("Turkey" → "Türkiye"). |

**Relations:** `parent()` / `children()` only — both have a consumer *in this story* (the seeder's own tests). **Query scopes: none** — `User` has none, and a scope with no call site is untested surface. 0017/0018/0026 add the ones they use.

### `database/data/iso-3166-countries.json` — **create**

The bundled ISO 3166-1 fixture, mandated by [PRD §2.4](../../docs/PRD/PRD.md#24-shipping) (*"ships as a CSV/JSON fixture bundled in this repository (under `database/data/`)"*), which also states both catalogs *"may ultimately read their country rows from the same bundled ISO-country source file"*. **This story creates that directory and file; story 0032 consumes it read-only.**

- **Catalog-neutral — identity only.** `{"alpha2": "ES", "name_es": "España", "name_en": "Spain"}`. **No `rate`, no `is_default`, no fiscal fields, no shipping fields** — that is what keeps the two catalogs genuinely independent.
- **Carries `name_en` as well as `name_es`** (D6) — this story writes only `name_es` into `name`; regenerating a 249-row fixture later costs more than a second key now.
- **JSON, not CSV** — values include `España`, `Türkiye`, `Côte d'Ivoire`; JSON removes every delimiter/quoting/encoding question.
- **No Composer dependency** (`league/iso3166`, `symfony/intl`): `CLAUDE.md` forbids dependency changes without approval, and the PRD already mandates the bundled-fixture approach.
- **State the provenance** in a short header/README beside the file so the list can be re-derived and reviewed. One object per line, so the diff is reviewable.
- **The 5 Spanish territories do NOT go in this file.** They are fiscal-domain rows with no shipping meaning (PRD §2.4: they *"are neither ISO entities nor autonomous communities"*). Putting them here would invite the shipping seeder to read them and quietly merge the catalogs. They live as a `public const` array on the seeder — the `RolePermissionSeeder::MODULES` convention.

### `database/seeders/SalesRegionSeeder.php` — **create**

```php
class SalesRegionSeeder extends Seeder
{
    public const DEFAULT_SLUG = 'es-peninsula';
    public const SPAIN_SLUG = 'es';

    /** @var array<int, array{slug: string, name: string, code: string, sort_order: int}> */
    public const SPAIN_TERRITORIES = [ /* peninsula, baleares, canarias, ceuta, melilla */ ];
}
```

> 📌 **These constants are canonical**, exactly as `RolePermissionSeeder::MODULES` is. Stories 0017/0018/0026 and every test reference `SalesRegionSeeder::DEFAULT_SLUG` rather than restating `'es-peninsula'`.

**Flow:**

1. **Load the fixture defensively** — `throw_if(! is_file($path), …)` then `json_decode(..., flags: JSON_THROW_ON_ERROR)`, mirroring the `throw_if` convention [`migrations.md`](../../docs/database/migrations.md#package-vendored-migrations) singles out in the vendored permission migration. A missing or corrupt fixture must **fail loudly**, never seed a partial catalog.
2. **One preload query** — `SalesRegion::query()->get()->keyBy('slug')` — so the loop issues no per-row `SELECT`.
3. **Insert/refresh through Eloquent inside one `DB::transaction()`**, writing with `forceFill()` because every seeder-owned column is deliberately absent from `#[Fillable]` (the same idiom `RolePermissionSeeder` uses for `email_verified_at`).
4. **Parent before children** — the `es` row is created before its five territories, or the FK rejects them. Territories resolve their parent **by `slug` lookup**, not from a variable held across a possible skip branch (on a partial re-seed `es` may already exist).
5. **Default flag last, repair-only** — guarded by `where('is_default', true)->doesntExist()`.

**The two column sets — this is the heart of the story:**

| Set | Columns | Re-seed behaviour |
| --- | --- | --- |
| **Seeder-owned** | `slug`, `name`, `parent_id`, `kind`, `sort_order` | **Always written.** `name` is intentionally overwritten — that is how a corrected canonical name reaches an already-deployed install. |
| **Administrator-configurable** | `code`, `description`, `rate`, `is_active`, `is_default` | **Written only on insert. Never touched on update.** |

> ⚠️ **`upsert()` / `updateOrCreate()` with a full payload are forbidden here.** The reflexive "idempotent seeder" shape overwrites on conflict, which on the second deploy resets every administrator-configured rate, description, code and flag to seed values. The correct semantic is *refresh the seeder-owned half, never touch the administrator's half*. `RolePermissionSeeder`'s `syncPermissions()` drift-repair precedent does **not** transfer: there the seeded state is the only correct state, whereas here divergence from seed values **is the feature**.

**Eloquent `save()` per row, not chunked mass insert — and the reasoning is on record** because "254 rows, chunk it" is the reflex. `insert()` bypasses `HasUuids`, timestamps, casts and model events — four things to hand-roll to save a few hundred milliseconds in a once-per-deploy seeder. One transaction, one commit. **PRD §2.4's ~8,100 municipios is where chunking genuinely becomes correct** (the PRD says "chunk-seeded" for exactly that table) — do not import that constraint here, and do not copy this seeder's shape there.

**Transaction:** the whole seed is a single `DB::transaction()`. Unlike `RolePermissionSeeder` there are **no post-commit side effects** (no mail, no cache flush), so `run()` does not need 0002's split-around-commit structure. Stated explicitly so a reviewer fresh from 0002 doesn't ask why it's missing. `SalesRegion` has no observers or cache layer, so `WithoutModelEvents` needs no compensation here either.

**Seeded rows** — ~249 ISO countries (España among them) + 5 fiscal territories ≈ **254 rows**, of which **6** are active:

| Row | `slug` | `code` | `kind` | `is_active` | `rate` |
| --- | --- | --- | --- | --- | --- |
| ISO countries (~248 others) | `fr`, `de`, … | `FR`, `DE` | `country` | `false` | `NULL` |
| España | `es` | `ES` | `country` | **`true`** | `NULL` — a parent/disclosure node, not independently rateable |
| Península | `es-peninsula` | `ES-PEN` | `fiscal_territory` | **`true`** | configured |
| Baleares | `es-baleares` | `ES-IB` | `fiscal_territory` | **`true`** | configured |
| Canarias | `es-canarias` | `ES-CN` | `fiscal_territory` | **`true`** | configured |
| Ceuta | `es-ceuta` | `ES-CE` | `fiscal_territory` | **`true`** | configured |
| Melilla | `es-melilla` | `ES-ML` | `fiscal_territory` | **`true`** | configured |

**On the codes** (administrator-visible, and they may reach invoices — worth a sign-off): `ES-IB` / `ES-CN` / `ES-CE` / `ES-ML` are **real** ISO 3166-2:ES subdivisions. `ES-PEN` is **synthetic** — "Península" is not an ISO subdivision, because it is *the rest of Spain*; `ES-PEN` was chosen over `ES-PE` deliberately, since `PE` is Peru's alpha-2 and would read as a bug to anyone scanning the list. Because nothing ever *resolves* by `code`, all of these are starting values rather than contracts.

> ⚠️ **The specific numeric `rate` values need fiscal sign-off before Phase 3.** The *structure* is what this story guarantees; the actual percentages (IVA general on Península/Baleares, IGIC on Canarias, IPSI on Ceuta/Melilla) are real-world fiscal data that changes over time. See [Open questions](#open-questions-non-blocking-for-schema-confirm-before-phase-3). The tests below deliberately assert **"the 5 rate-carrying active rows carry a non-null rate"**, not specific numbers, so a corrected rate never turns the suite red.

### `database/seeders/ProductionSeeder.php` — **create**

Composes the **required application catalogs** — the data without which the app is non-functional:

```php
public function run(): void
{
    $this->call(RolePermissionSeeder::class);
    $this->call(SalesRegionSeeder::class);
    // Story 0032 adds the shipping geography catalog here. Keep this list the one place
    // a required catalog is registered.
}
```

This exists because [story 0002](done/0002-seed-roles-permissions-catalog.md)'s runbook told production to call `php artisan db:seed --class=RolePermissionSeeder` — a targeted invocation that would now **silently** skip the Sales Region catalog, bringing production up with an empty `sales_regions` table and **no error at all**. A composed seeder keeps production on **one** targeted class forever, and PRD §2.4's shipping geography catalog is already a third required seed on the roadmap. **Do not implement 0032's call now** — leave the composition extensible.

### `database/seeders/DatabaseSeeder.php` — **modify**

Add `$this->call(SalesRegionSeeder::class);` **unconditionally**, after the existing `RolePermissionSeeder` call and **outside** the `['local', 'testing']` allow-list. The catalog is required application data, not fixture data — it carries no credentials and nothing environment-shaped, and it is the same category [`schema.md`](../../docs/database/schema.md) already describes for the permission catalog (*"the app is non-functional until it has run, so seeding is a required deployment step"*). Do not wrap it in the environment gate by pattern-matching on its neighbour.

**Verified blast radius on the existing suite — small.** Every test but two uses the targeted `$this->seed(RolePermissionSeeder::class)`. Only `tests/Feature/Seeders/DatabaseSeederTest.php` and `tests/Feature/Seeders/RolePermissionSeederTest.php` call a bare `$this->seed()`; both are seeder tests, neither asserts on cross-table row counts.

### `database/factories/SalesRegionFactory.php` — **create**

Needed, and not merely because `CLAUDE.md` says models get factories: stories 0017/0018/0026 must arrange *arbitrary* catalog states (two competing defaults, an inactive region, a parent with children) and cannot do so by running a ~254-row seeder in every `beforeEach`. `definition()` produces a plain active `Country`; states `fiscalTerritoryOf(SalesRegion $parent)`, `isDefault()`, `inactive()`, `withRate(string $rate)`.

Three things the implementer must get right:

- **`slug` must use `fake()->unique()->…`** — it is the table's only unique column and the classic factory collision.
- **`isDefault()` must not be the default state**, and it *can* create a second default (the DB permits it — there is no constraint). Document that on the state: it is precisely what 0017's negative tests need.
- **A factory setting non-`#[Fillable]` columns is fine** — `Factory::make()` wraps instantiation in `Model::unguarded(...)`. Empirical proof already in this repo: `UserFactory::definition()` sets `email_verified_at`, `status` and `remember_token`, none of which are in `User`'s `#[Fillable]`. Written down so nobody "fixes" it.

## Tests to perform

Test files (scaffold artisan-first: `php artisan make:test --pest Seeders/SalesRegionSeederTest`, `php artisan make:test --pest --unit Models/SalesRegionTest`):

| Path | Suite | Holds |
| --- | --- | --- |
| `tests/Feature/Seeders/SalesRegionSeederTest.php` | Feature | catalog coverage, idempotency, no-clobber, seeded state, isolation |
| `tests/Unit/Models/SalesRegionTest.php` | Unit | key-type and mass-assignment guards (no DB needed) |
| `tests/Feature/Models/SalesRegionTest.php` | Feature | cast round-trips (need a real write→read through the driver) |
| `tests/Feature/Seeders/DatabaseSeederTest.php` | Feature (extend) | the production-environment cases, beside the existing role/permission ones |

Every test seeds explicitly; none may depend on another test having seeded. **No `forgetCachedPermissions()` `beforeEach()`** — that hook exists in the seeder tests only because Spatie caches; copying it here would be cargo-cult.

- [ ] **Integration (coverage):** seeding populates the catalog; the **five** Spanish fiscal territories exist with their exact names and parent (exact count `5`); **every row's `kind` is `country` or `fiscal_territory`** — no other kind exists and no grouping row (`union-europea`, `internacional`) is seeded; a representative anchor set of ISO countries (`ES`, `FR`, `DE`, `PT`, `US`, `JP`, `GB`) is present; every country code matches a two-letter uppercase shape; **retired/invented codes are absent** (`UK`, `AN`, `CS`, `YU`, `EU`).
- [ ] **Integration (structure):** no entry is nested more than one level deep (every row with a parent has a parent whose own `parent_id` is null); the España row has no parent.
- [ ] **Integration (idempotency):** running the seeder twice leaves the row count unchanged.
- [ ] **Integration (no-clobber — the load-bearing test):** configure `rate`, `description`, `is_active` **and an edited `code`** on Canarias; re-seed; assert all four survive **and** the row's `id` and `created_at` are unchanged **and** the total count is unchanged.
      > The `id`-stability assertion must not be dropped in review: it is the single assertion distinguishing a real in-place update from a `truncate()`-and-reinsert, which passes every value assertion while silently reissuing UUIDs — orphaning every future `products` / `orders` FK. It is also what catches the edited-`code` duplicate-row bug.
      > **Mandatory revert-check:** change the seeder to write `rate` on update and confirm this test goes **red**. If it stays green, the fixture wasn't configured with values that differ from the seeded ones.
- [ ] **Integration (drift repair):** overwrite a seeder-owned `name` directly, re-seed, assert the canonical name is restored — the mirror of the test above. Without it, the seeder could satisfy no-clobber by skipping existing rows entirely, and a corrected name would never reach a deployed install.
- [ ] **Integration (seeded state):** exactly **one** row carries `is_default`, and it is `SalesRegionSeeder::DEFAULT_SLUG`; that row is active; the 6 named rows are active and the remaining countries are inactive; an inactive country's `rate` is **`null`** (not `0`).
- [ ] **Integration (default is not yanked back):** move `is_default` to `es-canarias`, re-seed, assert it stayed there and the default count is still 1.
- [ ] **Integration (isolation):** running `SalesRegionSeeder` alone creates **no** users, roles or permissions.
- [ ] **Integration (deployment):** `ProductionSeeder` populates **both** the permission catalog and the Sales Region catalog; the Sales Region catalog is **not** environment-gated (fake a production environment and assert it still seeds) — mirroring 0002's existing production/staging cases.
- [ ] **Integration (no ambient config):** the seeder reads no config at all; assert it seeds identically with any related key explicitly unset — per the [`errors-log.md`](../../docs/errors-log.md) rule that a test depending on a config key must set that key, including to `null`.
- [ ] **Feature (casts):** `rate` round-trips `21.000`, `7.500`, `0.000`, `4.050` with exact value **and type** (`decimal:3` returns a **string** — pin it, since every downstream consumer depends on which); `is_default` / `is_active` return **strict** `true`/`false` (strict, not truthy: CI runs SQLite while dev runs MySQL, and the two differ on `1` vs `"1"` when a cast is missing).
- [ ] **Unit (model):** `getKeyType() === 'string'` and `getIncrementing() === false`; `fill()` does **not** set `slug`, `parent_id`, `kind`, `is_default`, `is_active` or `name` (one assertion per omitted column, mirroring `UserTest`'s `status` / `pending_email` tests).
- [ ] **Negative/edge:** a second row with an existing `slug` is rejected by the database; no two seeded rows share a `slug`; no test asserts on row **order** unless `sort_order` is what it is testing.

**Deliberately not tested, as decisions rather than gaps:**

- **The UUIDv7 version nibble, lexicographic ordering, explicit-id respect, and route-binding 404s.** All are properties of `HasUuids` itself, proved once against `users` in [story 0001](done/0001-users-uuid-primary-key.md), and they cannot regress here without regressing there first. What *is* new per-model — "is the trait on this class and does it match the column type" — is covered by the key-type test plus one `Str::isUuid()` assertion. Re-running 0001's battery would be coverage theatre.
- **Migration `up()`/`down()` mechanics** — `RefreshDatabase` runs every migration on every Feature test ([`what-not-to-test.md`](../../docs/testing/qa/what-not-to-test.md)).
- **An absolute ISO country count.** Unlike 0002's `Permission::count() === 38` — a hand-authored catalog where the number *is* the contract — an ISO count is a property of an **external standard**: `toBe(249)` either duplicates the fixture's own length (tautological) or breaks on a fixture refresh, and in both cases the only possible "fix" is editing the number to match. Assert **shape + blacklist + anchors + a floor** (`at least 200 countries`) instead, which catches the failure that actually happens — a truncated list or a loop that broke early.
- **"No shipping table is touched."** `Schema::hasTable('shipping_zones')` asserts the absence of a table nobody built and turns red for a correct reason the moment 0032 lands — a bare negative claim of exactly the kind `errors-log.md` warns against, encoded as a test. The independence rule is a **design constraint enforced at review**; the isolation test above is the genuinely testable part.
- **"No way to invent a country."** Owned by 0018 — at this layer there is no affordance to deny. The data-level half (structural columns are not mass-assignable) *is* tested above.

## Expected outcome

After this story, `php artisan db:seed --class=ProductionSeeder` on a fresh install produces a complete, coherent Sales Region catalog: ~249 ISO countries and a "España" node with its five fiscal territories beneath it (~254 rows) — with exactly one default (`es-peninsula`), the 6 business-relevant rows active (the five territories rate-configured), and every other country present-but-inactive awaiting configuration. Re-running any seeder converges: no duplicate rows, no reissued identifiers, and **zero writes** to any rate, description, code or flag an administrator has since configured. Story 0017 inherits a catalog that already satisfies the exactly-one-default invariant it is written to enforce, and story 0018 inherits a two-level tree it can render directly.

## Acceptance criteria

- [ ] The `sales_regions` table exists with a **UUID v7 primary key** via `HasUuids`, applied at **both** migration and model level, with no `$keyType` / `$incrementing` properties.
- [ ] The catalog is seeded from the bundled ISO 3166-1 fixture **plus** Spain's five fiscal territories, and **nothing else** — no supranational grouping entry is created.
- [ ] Spain's five fiscal territories exist as **distinct, separately-configurable entries**, each related to the "España" row via `parent_id`; the tree is never more than one level deep. *(PRD scenario: "Spain exposes its fiscal sub-territories as separate entries")*
- [ ] `App\Enums\SalesRegionKind` has **exactly two cases** (`country`, `fiscal_territory`) and every seeded row uses one of them.
- [ ] Each entry carries its own `rate`, `description` and `code`; `code` is administrator-editable while `slug`, `name`, `parent_id`, `kind`, `is_default` and `is_active` are **not mass-assignable**. *(PRD scenario: "The catalog does not allow inventing new countries" — grounded here at the data layer)*
- [ ] **Exactly one** entry is flagged default after seeding, and it is `es-peninsula`. *(PRD acceptance criterion: "Exactly one entry is the default at all times")*
- [ ] The 6 named rows seed `is_active = true`; every other ISO country seeds inactive with a **`null`** rate (distinguishable from a real `0`).
- [ ] The seeder is **idempotent**: re-running duplicates nothing, reissues no identifier, and never overwrites an administrator's `rate`, `description`, `code`, `is_active` or `is_default` — while still refreshing a changed canonical `name`.
- [ ] The catalog is **not environment-gated**; `ProductionSeeder` composes it with `RolePermissionSeeder` and is extensible for story 0032.
- [ ] Sales Regions and Shipping zones remain **two independent catalogs** with no shared table; this story touches nothing shipping-related and creates the ISO fixture as a read-only input for 0032. *(PRD acceptance criterion 7)*
- [ ] `php artisan db:table sales_regions` shows exactly the intended index list — one PK, one unique on `slug`, one FK index on `parent_id`, **no duplicate**.

## Documented functional decisions

**D1 — The seeder's identity key is an immutable `slug`, never `code`.** PRD §2.1 makes `code` administrator-editable (*"they set the rate, description, **and code** on the 'Canarias' entry"*). Keying idempotency on `code` means the first administrator who edits one silently breaks the next deploy's re-seed: the seeder finds no match and **inserts a duplicate**, or collides and aborts the seed. The failure appears only on the *second* deploy *after* an edit — in production, months later. A separate seeder-owned, non-fillable, immutable natural key removes the failure mode structurally. This is the highest-value decision in the story and it is invisible from the PRD's column list alone.

**D2 — `code` is administrator-editable** (confirmed). The PRD contradicts itself — §2.1's Gherkin includes `code`, its prose two paragraphs earlier says the modal edits *"rate/description/status"*. The Gherkin is the more specific statement. D1 is what makes this safe.

**D3 — Spain's territories relate via a self-referencing nullable `parent_id`, not a `country_code` + `is_fiscal_subdivision` pair.** Two concrete defects in the alternative: (a) `country_code` is a string with no referential integrity — `'Es'` or `'ESP'` silently orphans a row and MySQL never objects, whereas a real `foreignUuid` makes "a fiscal territory always has a real parent" a **database invariant**, the same reasoning [`schema.md`](../../docs/database/schema.md) applies to `users.pending_email`'s unique index; (b) ~~neither column can place Unión Europea or Internacional~~ — *this second argument concerned the grouping rows and is moot since **D11** (2026-08-18) removed them; it is left visible rather than deleted so the history reads straight.* **D3 stands on (a) alone, and is unaffected by D11**: `parent_id` never had anything to do with groupings — it exists solely to relate Spain's five fiscal territories to the "España" row. Adjacency list is correct precisely **because the tree is exactly one level deep by domain definition** — no recursive CTE, no nested set. Portugal/Madeira/Azores would slot in later at the same depth with zero schema change.

**D4 — A `kind` enum, so a row's type is stated rather than inferred.** *(Revised 2026-08-18 by D11: the original rationale rested chiefly on discriminating a grouping from a country — "structure cannot ever distinguish Unión Europea from France" — which is moot now that no grouping row exists. The enum **survives with two cases**, on the narrower reasoning below.)* Structure *can* distinguish España from France (has children vs. doesn't) and a territory from a country (`parent_id` set vs. null), but that derivation is implicit, order-dependent and re-derived at every call site. A stored `kind` makes each row self-describing for 0018's grouped rendering and 0026's resolution, keeps the seeder-enforced invariant `kind === FiscalTerritory` ⟺ `parent_id IS NOT NULL` checkable in one place, and leaves room for a future third case without a migration. If Phase 2 judges two cases too thin to justify a column, dropping it is a coherent alternative — but it must be an explicit decision, not an omission.

**D5 — ~~Unión Europea and Internacional are top-level siblings, not parents of the 27 member states.~~ SUPERSEDED / REMOVED 2026-08-18 by D11** — the grouping rows no longer exist at all, so the question of how to place them is void. *Original text kept for history:* Tempting and wrong: PRD §2.1's *"Marking a new default clears the previous one"* scenario makes **Unión Europea itself the default entry**, i.e. rateable in its own right — whereas the España parent must *not* be independently rateable (D10). Modelling EU as a parent puts those two rows in one structural bucket while they need opposite behaviour. It would also overload `parent_id` with two incompatible meanings (*subdivision-of* vs. *member-of*), and France would need two parents.

**D6 — Seeded names are Spanish; the fixture also carries `name_en`** (confirmed). The PRD writes every region name in Spanish (`España`, `Canarias`, and `Francia` in §2.4), the prototype is Spanish-labelled, and the store's install-default content language is Spanish. [PRD assumption 14](../../docs/PRD/PRD.md#assumptions--confirmed-decisions)'s translatable-content list is explicit and does **not** include region names. The PRD contradicts itself once — §2.2's picker scenario says *"select **Spain**"* in English — which is a PRD wording slip, not a signal. Carrying `name_en` in the fixture is cheap insurance; if a locale-aware display is ever wanted, the cheapest answer needs **no schema change** (a `lang/{en,es}/sales-regions.php` lookup keyed by the immutable `slug` — a second, independent reason `slug` must never be user-editable).

**D7 — 6 rows seed active; the remaining ISO countries seed inactive** (confirmed; count revised from 8 by D11 on 2026-08-18). Active: **España** (the parent node, so 0018 can render it as a header) and its **five** fiscal territories. Seeding ~249 countries active would render a list of 249 "active" rows with no rates — unusable noise, and a resolution hazard for 0026, since an active row with a `NULL` rate is exactly the ambiguous state. Inactive-by-default also matches the column default, so the seeder states the exception rather than the rule.

**D8 — A composed `ProductionSeeder`** (confirmed, Option B). Story 0002's runbook pointed production at `db:seed --class=RolePermissionSeeder`; that targeted call would now silently skip this catalog and bring production up empty with no error. Composition keeps production on one class forever and gives 0032's shipping geography catalog a registered home. It revises a decision 0002 established — see Risks.

**D9 — UUID v7, under the confirmed project-wide policy.** The user confirmed: **UUID v7 via `HasUuids` for all new Epic 2 domain/business entities not already named in ADR 0001**, excepting story 0032's shipping geography catalog (a pure high-volume internal lookup table, which stays `bigint`). `sales_regions` is a real business entity — it will be FK'd from a product↔region pivot and from orders, both UUID-keyed, and a mixed-PK domain is worse than a slightly over-provisioned key on 249 rows. Recorded honestly: [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md)'s *stated* rationale is enumeration safety, and a fixed public country catalog has nothing to enumerate — so this is **consistency-driven, not rationale-driven**. **ADR 0001 needs a follow-up amendment** generalizing its seven-entity list into this policy and citing `sales_regions` as one of the entities it covers — **a later task, not this one**.

**D10 — The "España" row is seeded and visible but not independently rateable.** Península, Baleares, Canarias, Ceuta and Melilla **exhaustively partition Spain fiscally** — Península *is* mainland Spain — so no Spanish address can ever resolve to a bare "España" rate. Such a rate would be permanently unreachable, and if flagged default it would be an unreachable default. The row therefore exists as the disclosure node PRD §2.1's *"expand Spain's entries"* and §2.2's *"select Spain in the picker"* refer to, with `rate` staying `NULL`. The PRD corroborates this: it never names a plain "España" default, it names **`"España (Península)"`**, a leaf. Whether 0018 renders it as a read-only group header or a normal-but-unrateable row is that story's call; the schema supports either.

**D11 — The "grouping" concept is removed from the catalog entirely (2026-08-18, user decision).** The catalog holds **only direct, individual countries** (the ISO list) **plus Spain's five fiscal sub-territories**. There are no Unión Europea / Internacional entries, and `SalesRegionKind` has no `Grouping` case. **Why:** story 0026's Three Amigos debate established that **nothing anywhere in this system knows which countries are EU members** — there is no membership column, no bundled list, and the ISO fixture is deliberately identity-only (see the fixture section above). A grouping entry could therefore only ever be matched **manually**, which defeats the entire purpose of having it: a fallback that a human must select per order is not a fallback, and a grouping rate that never resolves automatically is an unreachable rate of exactly the kind D10 rejects for a bare "España" row. Backing it with a real EU-membership data source was rejected as out of scope for Epic 2 and as a new source of drift (membership changes politically, not on an ISO release cadence). **What it supersedes:** **D5** (void — nothing left to place) and the grouping half of **D4** (the enum survives with two cases on narrower grounds). **What it does not touch:** **D1** (`slug` idempotency), **D2** (`code` editability), **D3** (`parent_id` — verified independent: it exists only to relate Spain's territories to the "España" row and never carried grouping semantics), **D6**, **D8**, **D9**, **D10**. **Consequences recorded elsewhere in this file:** the seeded-row count drops from ~256 to **~254**, the active-row count from 8 to **6**, `SalesRegionSeeder::GROUPINGS` is gone, the factory loses its `grouping()` state, and the `EU` / `INTL` codes leave the sign-off list. Story **0026** must now resolve tax by country/fiscal-territory match with a fall-through to the default entry — it has no grouping tier to fall back through.

## Dependencies, risks and open questions

**Dependencies**

- **[Story 0002](done/0002-seed-roles-permissions-catalog.md)** — only for its seeder conventions (constants, transaction, idempotency, environment classification) and because it already seeds `sales-regions.*`. No code dependency.
- **None within Epic 2.** The dependency to 0017 runs the *other* way: 0017 hardens the `is_default` column this story creates, exactly as 0008 hardens the `Super Admin` role 0002 created.
- **No new Composer package.**

**Risks**

1. **The `code`-editability / idempotency conflict (D1)** — mitigated structurally by `slug`. If `slug` is ever dropped in review as "redundant with `code`", the bug returns silently.
2. **The 0002 runbook regression (D8)** — a production deploy following the *existing* documented runbook comes up with an empty catalog, **no error, and no failing test**. `ProductionSeeder` fixes it going forward; **`docs-keeper` must add a follow-up note to 0002's runbook documentation at Phase 6** (flagged here, not this story's edit to make).
3. **Duplicate `parent_id` index** — `foreignUuid()->constrained()` may already create one; an explicit `index()` would add a second, repeating the `users_uuid_unique` debt. Verify empirically with `php artisan db:table sales_regions`, never by reading the migration.
4. **Self-referencing FK inside `Schema::create`** — MySQL 8.4 supports it, but Laravel emits the FK as a separate `ALTER TABLE`. Verify the migration runs green against the real test database; fallback is a second `Schema::table()` call in the same `up()`.
5. **Fixture provenance and drift** — the ISO list is a committed snapshot. Because the seeder always refreshes `name`, a regenerated fixture propagates on the next deploy with no versioning column needed (deliberate — do not add a `revision` column). A country *removal* is deliberately **not** handled: the row stays, possibly holding a configured rate. Right call, but stated rather than accidental.
6. **`database/data/` file ownership** — this story **owns** `database/data/iso-3166-countries.json`; story 0032 consumes it **read-only**. If the two ever run concurrently, that is precisely the scenario [`contracts.md`](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent File-Ownership Rule governs.
7. **Test-suite performance** — only two existing tests use a bare `$this->seed()`, so the blast radius is verified-small. New stories must arrange regions with the **factory**, never by seeding ~254 rows in a `beforeEach`.
8. **A forward-looking trap for 0017:** `DatabaseSeeder` uses `WithoutModelEvents`. If 0017 enforces the single-default invariant via a **model observer**, this seeder's own default-flag write will silently bypass it under `db:seed` — structurally the same trap that bit `RolePermissionSeeder`'s Spatie cache flush in 0002.

**Open questions (non-blocking for schema; confirm before Phase 3)**

1. **The numeric `rate` values for the five Spanish fiscal territories** need fiscal sign-off — they are real-world tax data (IVA / IGIC / IPSI) that changes over time, and they are administrator-visible. The tests deliberately assert *"a non-null rate"* rather than specific numbers so a correction never reddens the suite.
2. **The synthetic code `ES-PEN`** — administrator-visible and potentially invoice-visible. `ES-IB`/`ES-CN`/`ES-CE`/`ES-ML` are standards-backed and need no sign-off.
3. **What `rate IS NULL` means at resolution time** — fall through to the default entry (the reading *"the default rate applies when no region matches"* implies), or treat as 0%? **Story 0026 decides**; this story only needs to *permit* the distinction. Flagged so 0026 doesn't discover it late. Note this question gained weight under **D11**: with no grouping tier, the default entry is now the *only* fallback.

**Larastan level 7 notes** (`phpstan.neon` analyses `database/`, so the migration, seeder and factory are all in scope): `json_decode()` returns `mixed` — needs an explicit array-shape `@var` **plus** the runtime `throw_if` guard, never `@phpstan-ignore`; `'decimal:3'` returns a **string**, so `@property string|null $rate` (typing it `float` is the likeliest failure here, and later rate comparisons must not use `==`/`<` on the raw attribute); relation generics need the two-parameter form `BelongsTo<SalesRegion, $this>`; `/** @use HasFactory<SalesRegionFactory> */` on the trait-use line and `@extends Factory<SalesRegion>` on the factory; and a `$this->command?->info(...)` summary line will need the same `@phpstan-ignore nullsafe.neverNull` `RolePermissionSeeder` already carries.

## Technical tasks for later backlog

- **Amend [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md)** to generalize its seven-entity list into the confirmed project-wide policy (UUID v7 for new Epic 2 business entities; `bigint` for 0032's high-volume geography lookup), citing `sales_regions` as a covered entity. *(D9 — a later task.)*
- **Add the follow-up note to story 0002's runbook documentation** now that `ProductionSeeder` supersedes the single targeted `--class=RolePermissionSeeder` invocation. *(`docs-keeper`, Phase 6.)*
- **Docs to update at Phase 6:** [`database/schema.md`](../../docs/database/schema.md) (a new Domain-tables section, the `SALES_REGIONS` node and its self-relationship in the ER diagram, and the deliberate-index-omission notes); [`database/migrations.md`](../../docs/database/migrations.md#uuid-primary-keys) (its greenfield UUID snippet is labelled a *target* pattern — there is now a real migration to cite); [`conventions/base-standards.md`](../../docs/conventions/base-standards.md) (the directory listing gains `database/data/`, and the UUID subsection's Epic 2/4 entity list is now incomplete).
- **Story 0017 hand-off:** the working MySQL at-most-one-default constraint (a `STORED` generated column + UNIQUE, since unique indexes ignore `NULL`s) is available and deliberately unused here; and the `WithoutModelEvents` observer trap in risk 8.

## Definition of Done
- [ ] Tests written and green (the full suite, not just this story's — per [`contracts.md`](../../docs/contracts.md)'s Full Test Suite Gate Rule)
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met
- [ ] `php artisan db:table sales_regions` run and its index list confirmed to hold no duplicate on `parent_id`
- [ ] The no-clobber test's revert-check performed (the test provably goes red when the seeder overwrites `rate`)
