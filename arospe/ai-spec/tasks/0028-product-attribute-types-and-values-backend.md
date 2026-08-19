# [0028] Product variant attribute types & values — backend (schema, CRUD, validation)

## Description
Build the admin-defined taxonomy of product **variant attribute types** (e.g. "Size", "Color",
"Material") and the **values** each type can take (e.g. Size → 38, 39, 40): two new tables, their
models, and a permission-gated CRUD screen component that creates, renames and deletes a type and
edits its value list inline. This is purely *what attributes can exist and what values they can
take* — it creates no product, no product variant, and no attribute combination.

## Type
backend | fullstack (related_task_id: the UI sibling, which owns the Blade markup and browser
tests — number to be assigned when Epic 2's frontend stories are sequenced) | includes
database-expert: **yes**

**Dependencies: none within Epic 2.** This story is the root of the variant sub-domain — it does
not read or write `products`, `product_categories` or `product_variants`, none of which exist in
code yet. It depends only on Epic 1's already-seeded `products.*` permissions
([`database/seeders/RolePermissionSeeder.php`](../../database/seeders/RolePermissionSeeder.php)).

**Known consumer: story 0029 (product variants).** 0029 builds variant combinations directly on
this schema and references individual attribute **value ids** from its combination pivot. The
[Documented functional decisions](#documented-functional-decisions) section below is that story's
stable contract — 0029 must not have to renegotiate it.

## Gherkin
```gherkin
Feature: Product variant attribute taxonomy

  Scenario: Define a product attribute type with values
    Given a catalog administrator
    When they define an attribute type "Size" with the values 38, 39, and 40
    Then "Size" is saved with exactly those three values
    And "Size" and its values are available when building variants

  Scenario: Define an attribute type whose values are non-numeric
    Given a catalog administrator
    When they define an attribute type "Color" with the values "Black", "White", and "Red"
    Then "Color" is saved with exactly those three values

  Scenario: Add a value to an existing attribute type
    Given a catalog administrator, with an attribute type "Size" holding the values 38, 39, and 40
    When they add the value 41 to "Size"
    Then "Size" holds four values
    And the previously saved values 38, 39, and 40 keep their existing identity

  Scenario: Remove a value from an existing attribute type
    Given a catalog administrator, with an attribute type "Size" holding the values 38, 39, and 40
    When they remove the value 39 from "Size"
    Then "Size" holds only 38 and 40
    And the surviving values 38 and 40 keep their existing identity

  Scenario: Rename an attribute type
    Given a catalog administrator, with an attribute type "Size"
    When they rename it to "Shoe size"
    Then the type is shown under its new name wherever it is used
    And its value list is unchanged

  Scenario: Rename a single value of an attribute type
    Given a catalog administrator, with an attribute type "Size" holding the value 38
    When they rename that value to "38 EU"
    Then the value is shown as "38 EU"
    And it keeps its existing identity

  Scenario: Reorder the values of an attribute type
    Given a catalog administrator, with an attribute type "Size" holding the values 40, 38, and 39
    When they reorder its values to 38, 39, and 40
    Then the values are presented in that order wherever the type is used

  Scenario: Delete an attribute type
    Given a catalog administrator, with an attribute type "Material" used by no variants
    When they delete "Material"
    Then it no longer appears in the attribute type list
    And its values are removed with it

  Scenario: Defining a duplicate attribute type name is rejected
    Given a catalog administrator, with an existing attribute type "Size"
    When they try to define a second attribute type named "Size"
    Then saving is rejected with a validation message
    And no second attribute type is created

  Scenario Outline: Saving an attribute type with an invalid name is refused
    Given a catalog administrator
    When they try to save an attribute type with <invalid_name>
    Then saving is rejected with a validation message
    And no attribute type is created

    Examples:
      | invalid_name                                          |
      | a blank name                                          |
      | a whitespace-only name                                |
      | a name longer than the permitted length               |
      | a name already used by another type                   |
      | a name differing from an existing type only by case    |
      | a name differing from an existing type only by surrounding spaces |

  Scenario: A duplicate value within the same attribute type is rejected
    Given a catalog administrator, with an attribute type "Size" holding the value 38
    When they try to add a second value 38 to "Size"
    Then saving is rejected with a validation message
    And "Size" still holds a single value 38

  Scenario: The same value text is allowed under two different attribute types
    Given a catalog administrator, with an attribute type "Color" holding the value "Black"
    When they define an attribute type "Material" with the value "Black"
    Then both types are saved, each holding its own "Black"

  Scenario: A rejected save leaves the attribute type completely unchanged
    Given a catalog administrator, with an attribute type "Size" holding the values 38, 39, and 40
    When they try to rename it and simultaneously submit one invalid value
    Then saving is rejected with a validation message
    And the type's name and all three of its values are unchanged

  Scenario: An administrator without product permission cannot reach the attribute types area
    Given a blog editor whose role was not granted any product permission
    When they navigate directly to the attribute types area
    Then access is denied server-side, not merely hidden in the UI

  Scenario: An administrator without product permission cannot save an attribute type directly
    Given a blog editor whose role was not granted any product permission
    When they attempt to save an attribute type without going through the attribute types area
    Then the change is denied server-side
    And no attribute type is created

  Scenario: An administrator without product permission cannot delete an attribute type directly
    Given a blog editor whose role was not granted any product permission
    When they attempt to delete an attribute type without going through the attribute types area
    Then the deletion is denied server-side
    And that attribute type still exists
```

## Documented functional decisions

These are the decisions the Three Amigos debate settled. **This section is story 0029's contract**
— 0029 builds on the exact shape below and should not reopen it.

### D1 — Two tables with a foreign key, not one table with a discriminator

`product_attribute_types` + `product_attribute_values`, related by a FK. The self-referencing
single-table alternative was considered and **rejected** for four reasons, the first two decisive:

1. **It is what makes 0029's pivot a database-level invariant.** 0029's combination pivot FKs an
   individual *value*. In a single self-referencing table that FK points at a row that could be
   either a type or a value, so "a combination references values, never types" becomes
   un-constrainable in SQL — enforceable only by an application rule that any seeder, tinker
   session or future import bypasses. With two tables, `foreignUuid('product_attribute_value_id')
   ->constrained()` *is* the guarantee.
2. **Single-table uniqueness would be silently unenforceable.** The two levels have genuinely
   different rules (D3): a type name is globally unique, a value only within its type. Collapsed
   into one table that becomes `unique(['parent_id', 'name'])` with `parent_id IS NULL` on type
   rows — and [`docs/database/schema.md`](../../docs/database/schema.md) already records the
   consequence in its `pending_email` note: MySQL allows unlimited `NULL`s in a unique index, so
   the constraint only binds rows actually holding a non-null parent. Global uniqueness of type
   names would be **not enforced at all**, while looking enforced in the migration.
3. The columns genuinely diverge as the domain grows (a value may later carry a swatch; a type may
   later carry an input-presentation flag), and a single table forces every level-specific column
   nullable and meaningless on half the rows.
4. No precedent for hierarchy exists in this codebase, and a recursive taxonomy would need tooling
   nobody has approved (project `CLAUDE.md`: no new dependencies without approval).

A third alternative — one values table with a free-text `type` string column — was rejected too:
renaming a type becomes an N-row `UPDATE` with no uniqueness guarantee, and the PRD requires
taxonomy entities to be renameable as first-class rows.

### D2 — Exact schema (the stable contract for 0029)

```php
// database/migrations/<ts>_create_product_attribute_types_table.php
Schema::create('product_attribute_types', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('name', 100);
    $table->unsignedInteger('position')->default(0);
    $table->timestamps();

    $table->unique('name');
});
```

```php
// database/migrations/<ts>_create_product_attribute_values_table.php  (strictly later timestamp)
Schema::create('product_attribute_values', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('product_attribute_type_id')
        ->constrained()
        ->cascadeOnDelete();
    $table->string('value', 100);
    $table->unsignedInteger('position')->default(0);
    $table->timestamps();

    // NOTE: no separate ->index('product_attribute_type_id'). The composite unique's
    // leading column IS the FK column, so InnoDB accepts it as the FK's supporting
    // index. A standalone index here would be pure write amplification — the exact
    // mistake docs/errors-log.md records for users_uuid_unique. Do not "normalise" it.
    $table->unique(['product_attribute_type_id', 'value']);
});
```

Column-level rationale:

| Column | Decision | Why |
| --- | --- | --- |
| `id` | UUID v7 via `$table->uuid('id')->primary()` | **Confirmed** — see D9 |
| `name` / `value` | `string(100)`, never bare `string()` | [`migrations.md`](../../docs/database/migrations.md) states the rule verbatim; a bare `string()` is `VARCHAR(255)`, which would make the composite unique a 2040-byte utf8mb4 key. At 100 the composite is 144 + 400 = **544 bytes**, far under InnoDB's 3072-byte DYNAMIC limit |
| `value`, not `name`, on the values table | deliberate | The PRD's own example is `Size` → `38` — `38` is a value, not a name. It also disambiguates `$type->name` from `$value->value` when both are in scope |
| `position` | `unsignedInteger`, **not nullable**, default `0` | See D5 |
| `timestamps()` | present | Universal in this repo |

**Deliberate, flagged departure from a stated convention.**
[`migrations.md`](../../docs/database/migrations.md) says this repo is explicit about FK indexes
(`$table->index('user_id')` in `create_passkeys_table`). Here that index is **omitted on purpose**,
because the composite unique already has the FK column as its leftmost prefix and therefore
satisfies both InnoDB's FK requirement and every `WHERE product_attribute_type_id = ?` lookup.
`create_passkeys_table` has no such composite, which is why the explicit index is right there and
wrong here. The migration must carry the comment above so a later reviewer does not "restore" it.

Model shape, per [`base-standards.md`](../../docs/conventions/base-standards.md) — attribute-based
`#[Fillable]`, a `casts()` **method**, `HasUuids` in the trait list, **no** `$keyType` /
`$incrementing`, `@property string $id`:

```php
#[Fillable(['name', 'position'])]
class ProductAttributeType extends Model
{
    /** @use HasFactory<ProductAttributeTypeFactory> */
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return ['position' => 'integer'];
    }
}
```

`ProductAttributeType::values()` is a `HasMany` ordered **inside the relationship** as
`->orderBy('position')->orderBy('value')` — every read wants that order, and Laravel's `reorder()`
is the documented escape hatch for the rare case that does not.

### D3 — Uniqueness rules

| Rule | Enforcement | Why |
| --- | --- | --- |
| Type name **globally** unique | `unique('name')` | Two "Size" types are semantically meaningless and make the variant builder ambiguous |
| Value unique **per type**, never globally | `unique(['product_attribute_type_id', 'value'])` | "Black" must be legal as both a Color and a Material. A global unique would forbid that, and nothing in the PRD asks for it |

**Normalisation happens in PHP, before validation, not in the action and not in the database.**
`Str::squish()` (trim + collapse internal whitespace runs) is applied to the type name and to every
submitted value *before* `validate()` runs — the same ordering as
[`app/Livewire/Users/Index.php`](../../app/Livewire/Users/Index.php)'s `Str::lower($this->email)`.
If normalisation happened only inside the action, the uniqueness rule would inspect the
un-normalised string and `"Size "` would slip past an existing `"Size"`.

**Verified fact that changes a test's design:** this project's collation is
**`utf8mb4_unicode_ci`**, not MySQL 8.4's server default `utf8mb4_0900_ai_ci` —
[`config/database.php`](../../config/database.php) sets
`'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci')` and `.env` defines no `DB_COLLATION`.
That collation is case- *and accent*-insensitive and is **PAD SPACE** (trailing spaces ignored in
comparison). Two consequences: `Size`/`SIZE`/`size` collide for free, which is the behaviour a
taxonomy wants; and a test asserting case-insensitive rejection must assert a **validation error on
the name field**, never a row count — a count assertion passes on the collation alone, whether or
not the application owns the rule (see FP1 in [Tests to perform](#tests-to-perform)).
[`errors-log.md`](../../docs/errors-log.md)'s rule against leaning on collation is scoped to
*security controls*; it does not forbid a data-quality constraint, but it does mean the application
check comes first and the index is the last word, exactly as `pending_email` is documented.

Tests also run against this same MySQL — [`phpunit.xml`](../../phpunit.xml) overrides only
`DB_DATABASE`, not the connection — so there is no SQLite portability caveat to design around here.

### D4 — Values are edited inline in the type's modal, and **diffed** on save

There is no separate value CRUD screen. The PRD's only Gherkin on this is a single act ("they
define an attribute type 'Size' with the values 38, 39, and 40"), and a value has no independent
identity: it is meaningless outside its type and would never be searched for on its own.

**The save is a diff, never a delete-and-recreate.** `SyncProductAttributeValues` runs inside one
`DB::transaction`:

1. Fetch the type's real value ids fresh: `$owned = $type->values()->pluck('id')->all()`.
2. **Re-scope every submitted id against `$owned`.** A submitted id not in that set is not an error
   to surface — it is treated as a **new row** (`id => null`).
3. Rows with a surviving id → `UPDATE` value + `position` in place.
4. Rows with `id === null` → `INSERT`.
5. Ids in `$owned` absent from the submission → delete.

Step 2 is a security requirement, not tidiness: `$values` is the form's own input and therefore
**not** `#[Locked]`, so every id in it is client-writable. Without the re-scope, a crafted
`/livewire/update` payload could point an `UPDATE` at another type's value row — the exact hazard
[`security/livewire-authorization.md`](../../docs/security/livewire-authorization.md) describes
("a modal must read authoritative values from the model rather than back them out of a
client-writable array").

**Why delete-and-recreate is a data-loss-class bug, not a style preference.** 0029 stores a variant
as a combination of attribute **value ids**. If `save()` truncated the type's values and re-inserted
them, every value would get a new id on *every* save — including a save that changed nothing but
the type's name. Under a cascading pivot FK, renaming "Size" would silently delete every variant of
every product; under a restricting one, saves would start failing with an unexplainable FK
violation. The diff must be built **now**, while it is cheap, and `SyncProductAttributeValues` must
carry its own test asserting **id stability across a no-op re-save**. That test is the regression
net for 0029, and it is the single highest-risk item in this story.

**Constraint this story imposes on 0029:** the combination pivot's FK to
`product_attribute_values` must be **`restrictOnDelete()`**, never `cascadeOnDelete()`. If 0029
wires it as a cascade, the application-level in-use block becomes the only thing standing between
an administrator and silent mass variant deletion, and any call site that misses it destroys data
with no error. The database must refuse too.

### D5 — `position` ships in this story; the drag-to-reorder UI may be deferred

**No sort the database can derive is correct for this domain.** `ORDER BY value` gives `10, 38, 39,
9` for shoe sizes and `L, M, S, XL` for apparel — not merely unsorted but visibly wrong, for the
PRD's own example. Concrete rules:

- **Not nullable, default `0`.** A nullable sort key puts NULLs first on MySQL and the list
  reshuffles as rows are edited.
- **Always tiebreak: `ORDER BY position ASC, value ASC`.** With `default(0)` a freshly imported set
  shares `position = 0` and MySQL returns ties in arbitrary order — the list visibly shuffles
  between page loads. This is the most commonly missed bug in position columns and it belongs in
  the relationship's ordering, not at each call site.
- **Assign on create as `MAX(position) + 1` scoped to the type**, in the same transaction.
- **Gaps are fine — never renumber on delete.**
- **Reorder by rewriting the whole sibling set in one transaction** (`position = $index` over the
  submitted order), not by pairwise adjacent swaps, which corrupt under concurrency.
- **No unique index on `(type_id, position)`** — it would force every reorder through a temporary
  out-of-range shuffle, and duplicates are harmless given the deterministic tiebreak.
- **No index on `position`** — same reasoning [`schema.md`](../../docs/database/schema.md) gives for
  `users.status`: the table is read wholesale into a dropdown at 10¹–10² rows.

The **column** ships here regardless, so neither 0029 nor the UI sibling needs an `ALTER`.

### D6 — Permissions reuse `products.*`; the seeded catalog is not touched

[`docs/architecture/authorization.md`](../../docs/architecture/authorization.md) already records
`products` as covering "products, product categories **and variants**", with the explicit note that
granularity is "deliberately **coarse per module**". That is a recorded decision this story must not
reopen. Gating uses the existing four-action grid:

| Component method | Gate |
| --- | --- |
| `mount()` | `products.view` |
| `openEditModal()` | `products.edit` — it **discloses** the value list, and this repo gates methods that mutate *or disclose* |
| `save()` (create branch) | `products.create` |
| `save()` (edit branch) | `products.edit` |
| `confirmDelete()` / `deleteType()` | `products.delete` |

Adding a tenth module slug was considered and **rejected**: it would be +4 permissions and would
break the hardcoded `38`/`37` assertions in
[`tests/Feature/Seeders/RolePermissionSeederTest.php`](../../tests/Feature/Seeders/RolePermissionSeederTest.php),
the permission-count claims in four `docs/` files, and story 0011's role-editor UI — a cross-story
ripple for zero functional gain.

**No `ProductAttributeTypePolicy`.** `UserPolicy` exists because user rows carry genuine *per-row*
rules (self-edit, administrator-level targets). An attribute type has no per-row distinction
anywhere in the PRD, so a policy would add an allow/deny matrix that every method answers
identically. Gate directly on the permission names. (`backend-expert` proposed a policy; the debate
resolved against it on this reasoning. If a per-row rule ever appears, adding the policy later is a
local change, because every gate call already names a single ability.)

### D7 — Deletion: cascade to values now, in-use block lands with 0029

Nothing in the database references these rows yet — there is no `products`, no `product_variants`,
no pivot. So this story ships:

- **Type → values: `cascadeOnDelete()`.** A value genuinely cannot outlive its type. Same reasoning
  as `create_passkeys_table`'s "no orphaned passkeys".
- **Type deletion itself: unguarded**, but routed through a named action
  (`DeleteProductAttributeType`) that exists specifically so 0029 has **one** call site to bolt its
  guard onto — the same reasoning [`base-standards.md`](../../docs/conventions/base-standards.md)
  gives for `User::delete()` being an override rather than scattered logic. Writing the guard now,
  against a table that does not exist, would produce an untestable code path.
- **`#[Locked] public int $deletingTypeUsageCount = 0;`** is in the component's public surface from
  day one, always `0`, so 0029 changes one query and zero contracts. **Do not** stub a model method
  that hardcodes `return 0;` — dead code that lies is worse than an absent method.

**0029 must apply the product-category precedent: a hard block with a count and no
confirm-and-proceed.** The PRD states that pattern four times for sibling entities (roles, product
categories, shipping zones, blog categories) and is explicit for categories: "deletion is always
blocked (no confirm-and-proceed path)". An attribute value in use is strictly more destructive than
a category assignment — deleting "Size 40" does not blank a field, it destroys the *identity* of
every variant built on it. One non-obvious consequence 0029 inherits: deleting a *type* whose values
are referenced will abort at the database (InnoDB evaluates the RESTRICT while cascading the
type→value delete), so integrity holds but the administrator sees a raw FK violation — 0029's
pre-check must therefore count variants across **all of a type's values**, not just before deleting
a single value. This is an inference by analogy and is raised as **Q3** for PO sign-off.

**No soft deletes.** `User` is the only `SoftDeletes` model and it earned it (identifier reuse,
session invalidation, token revocation) — none of which applies to a taxonomy row. Worse,
[`schema.md`](../../docs/database/schema.md) records that `Rule::unique()` does **not** apply the
soft-delete scope, so a soft-deleted "Size" would permanently block ever creating a type named
"Size" again, with no restore UI anywhere in the app (`restore()` already has no call site).

### D8 — Columns and behaviours deliberately **excluded**

| Considered | Verdict | Reason |
| --- | --- | --- |
| `slug` | against | Nothing routes by attribute type; `name` is already unique, and rename is a required scenario, so a slug needs sync-on-rename plus a second unique index for no consumer |
| `code` | against | The PRD assigns a `code` only to Sales Regions, where ISO codes are externally meaningful |
| `values_count` counter cache | against | `withCount('values')` on a 10¹–10² row table is one grouped subquery; a denormalised counter drifts silently and has zero precedent in this repo |
| `hex` / swatch on values | against, firmly | Never mentioned in the PRD, and it would **contradict assumption 9** by encoding special meaning for one admin-created type name — assumption 9's whole point is "not a hardcoded Size/Color pair" |
| `description` on a type | against | Not in the PRD; a four-word admin label needs no help text |
| `is_active` / status toggle | against | The attribute Gherkin has no enable/disable scenario, unlike carriers which explicitly do. A status column no UI ever sets is dead schema |
| a `data_type` discriminator (text/number/color) | against | Implies per-datatype validation, input widgets and sorting — substantial hidden scope. Numeric ordering is already solved correctly by `position` |
| a `ProductAttributeSeeder` | against | Assumption 9 says these are **admin-defined**, in explicit contrast to the seeded Sales Region catalog. Seeding demo data would reopen the production-reachability question [`security/seeder-safety.md`](../../docs/security/seeder-safety.md) settled |
| translatable names | out of scope, flagged | See **Q4** |

### D9 — Primary key: UUID v7 via `HasUuids` (confirmed)

Both tables key on a **UUID v7** string primary key generated by Laravel 13's native `HasUuids`
trait, applied at both the migration level (`$table->uuid('id')->primary()`,
`foreignUuid(...)->constrained()`) and the Eloquent level (`use HasUuids;`), per the model-side
convention in [`base-standards.md`](../../docs/conventions/base-standards.md#uuid-primary-keys).

This was raised during the debate because PRD
[assumption 19](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) enumerates exactly seven
UUID entities and neither of these two is among them. **It is now confirmed and closed**: project-wide
policy is UUID v7 for **all new Epic 2 business entities**, with one deliberate exception — the
shipping geography catalog (story 0032), which stays on integer keys. These two tables are business
entities, so they take UUIDs.

The reasoning that supported the recommendation still holds and is worth keeping on record: story
0029's `product_variants` *is* a named UUID entity, so a `bigint` value PK would produce a
**mixed-key-type pivot** joining an 8-byte column to a 144-byte one; `base-standards.md` already
generalises the convention to "every new model in PRD Epics 2 and 4"; and UUIDv7's index-locality
cost is nil at this table's 10¹–10² rows.

**Follow-up (non-blocking, not this story):** [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md)
and PRD assumption 19 both still describe the UUID set as a closed list of seven entities, which the
new project-wide policy supersedes. Amending them is a separate task for `docs-keeper` /
`product-owner` and **does not gate 0028** — this story implements the confirmed policy regardless.
Flagged here so the stale seven-entity framing is not mistaken for a contradiction during Phase 2
INVEST review or Phase 5 code review.

## Files to create/modify

### Creates

- `database/migrations/<ts>_create_product_attribute_types_table.php` — the types table per D2.
  `down()` is `Schema::dropIfExists('product_attribute_types');`.
- `database/migrations/<ts>_create_product_attribute_values_table.php` — **strictly later
  timestamp**, so the parent exists when the FK is declared. `down()` is
  `Schema::dropIfExists('product_attribute_values');`.
  Two conventions deliberately *not* applied, so nobody adds them in review: **no `dropUnique()` in
  `down()`** (that rule is scoped to `dropColumn` on a surviving table; dropping the table removes
  its indexes with it), and **no `Schema::disableForeignKeyConstraints()`** (`migrate:rollback` runs
  in reverse timestamp order, so the child table drops first and the pair is genuinely symmetric).
- `app/Models/ProductAttributeType.php` — `#[Fillable(['name', 'position'])]`, `casts()`,
  `HasUuids`, `values(): HasMany` ordered per D5.
- `app/Models/ProductAttributeValue.php` — `belongsTo(ProductAttributeType::class)`.
- `app/Concerns/ProductAttributeValidationRules.php` — the `<Noun>ValidationRules` trait per
  [`naming.md`](../../docs/conventions/naming.md), flat and single-concern:

  ```php
  /** $typeId comes from a #[Locked] property — see security/livewire-authorization.md. */
  protected function attributeTypeNameRules(?string $typeId = null): array
  {
      return [
          'required', 'string', 'max:100',
          Rule::unique(ProductAttributeType::class, 'name')->ignore($typeId),
      ];
  }

  protected function attributeValueListRules(): array
  {
      return ['required', 'array', 'max:100'];
  }

  protected function attributeValueRules(): array
  {
      return ['required', 'string', 'max:100', 'distinct:ignore_case'];
  }
  ```

  `max:100` matches the column width from D2 — do not raise it to 255 independently of the
  migration. `distinct:ignore_case` enforces per-type uniqueness **within the submission**, which
  is sufficient because the submission is the complete intended state (anything not submitted is
  being deleted, so no persisted row survives to collide with); the composite unique index is the
  database's last word, and `SyncProductAttributeValues` must catch `QueryException` SQLSTATE
  `23000` and rethrow it as a `ValidationException`. A per-row scoped `Rule::unique()->where(...)
  ->ignore($valueId)` was considered and rejected: `$valueId` is client-writable, so it would hand
  `ignore()` a forged value.
- `app/Actions/Products/CreateProductAttributeType.php` — mirrors `app/Actions/Users/CreateUser.php`.
  New `Products/` subfolder under the existing group-by-domain rule in `app/Actions/`.
- `app/Actions/Products/UpdateProductAttributeType.php`.
- `app/Actions/Products/SyncProductAttributeValues.php` — owns the D4 diff, shared by both actions
  above so the diff exists once, not twice.
- `app/Actions/Products/DeleteProductAttributeType.php` — thin today (`$type->delete()` in a
  transaction); exists as the single seam 0029 adds its in-use guard to (D7).
- `app/Livewire/Products/AttributeTypes/Index.php` — the screen component (surface below).
- `resources/views/livewire/products/attribute-types.blade.php` — **minimal placeholder only.**
  ⚠️ **The view path is the trap.** Livewire kebab-cases each namespace segment then strips a
  trailing `.index`, so `App\Livewire\Products\AttributeTypes\Index` resolves to
  `livewire/products/attribute-types` — one level *shallower* than the class, per the
  [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name).
  Do **not** create `resources/views/livewire/products/attribute-types/index.blade.php`.
- `database/factories/ProductAttributeTypeFactory.php` — with a `withValues(int $count = 3)` state,
  mirroring `UserFactory::withTwoFactor()`'s `with*` naming.
  ⚠️ `fake()->unique()->word()` draws from Faker's ~1000-word pool and throws `OverflowException`
  once enough rows are created; use `fake()->unique()->words(2, true)` or a sequence, and document
  it in the factory docblock the way `UserFactory::unverified()` documents its non-obvious state.
- `database/factories/ProductAttributeValueFactory.php` — `'product_attribute_type_id' =>
  ProductAttributeType::factory()` so a bare `->create()` works standalone.
- `lang/en/products.php` + `lang/es/products.php` — new domain file, key-for-key identical.
- `tests/Feature/Products/AttributeTypesIndexTest.php`,
  `tests/Feature/Products/SyncProductAttributeValuesTest.php`,
  `tests/Feature/Models/ProductAttributeTypeTest.php` — Phase 3, `backend-qa`.

### Modifies

- `routes/web.php` — one route inside the existing `['auth', 'verified']` group:

  ```php
  // can:products.view, NOT permission:products.view — Livewire's PersistentMiddleware
  // allow-list carries Laravel's Authorize (can:) but not Spatie's PermissionMiddleware,
  // so permission: would protect only the initial GET and leave every save()/deleteType()
  // round-trip unauthorized at the route layer. See docs/architecture/authorization.md.
  Route::livewire('products/attribute-types', ProductAttributeTypesIndex::class)
      ->middleware(['can:products.view'])
      ->name('product-attribute-types.index');
  ```

### Explicitly **not** this story

`database/seeders/RolePermissionSeeder.php` (D6) · the sidebar entry and the real Blade markup (UI
sibling) · `tests/Browser/**` (`frontend-qa`) · `docs/**` (`docs-keeper`, Phase 6) · `Product`,
`ProductCategory`, `ProductVariant` and any combination pivot (0029 and later).

### Component public surface — the contract for 0029 and the UI sibling

```php
#[Title('Product attribute types')]
class Index extends Component
{
    use ProductAttributeValidationRules;

    /** @var array<int, array{id: string, name: string, valueCount: int, valuePreview: string, canEdit: bool, canDelete: bool}> */
    public array $types = [];

    #[Locked] public ?string $editingTypeId = null;   // null => create mode
    public bool $showModal = false;

    /** Never null — bound to a text input; see docs/errors-log.md. */
    public string $name = '';

    /**
     * The editable value rows. Deliberately NOT #[Locked] — this is the form's own
     * input, so every `id` in it is client-writable and MUST be re-scoped against a
     * fresh DB read in save() (D4 step 2). `key` exists only so the view can give each
     * row a stable wire:key that survives a removal.
     *
     * @var array<int, array{id: string|null, key: string, value: string}>
     */
    public array $values = [];

    public bool $showDeleteModal = false;
    #[Locked] public ?string $deletingTypeId = null;
    #[Locked] public string $deletingTypeName = '';
    #[Locked] public int $deletingTypeUsageCount = 0;   // always 0 until 0029 — see D7

    public function openCreateModal(): void {}
    public function openEditModal(string $typeId): void {}
    public function addValue(): void {}
    public function removeValue(string $key): void {}          // by key, NOT by index
    public function moveValue(string $key, int $direction): void {}
    public function save(CreateProductAttributeType $create, UpdateProductAttributeType $update): void {}
    public function confirmDelete(string $typeId): void {}
    public function deleteType(DeleteProductAttributeType $delete): void {}

    /** @return array{total: int, values: int} */
    #[Computed] public function typesSummary(): array {}
}
```

⚠️ **`removeValue()` takes a `key`, not an index — and the UI sibling must key on `$row['key']`,
never `$loop->index`.** Index-keyed rows are the standard Livewire foot-gun: removing row 1 shifts
row 2 into index 1, the DOM node keyed `1` is reused, and the browser keeps the *old* input's value
while the server has the new one. A server-generated `key` (`(string) Str::uuid()`, assigned once
when the row is created and never mutated), used for both `wire:key` and the method argument,
removes the entire class of bug. This is the single most important thing to hand the frontend story.

## Tests to perform

All Feature tests unless noted. `tests/Unit/` gets **no** database trait in this repo — verified at
[`tests/Pest.php`](../../tests/Pest.php), which binds `RefreshDatabase` to `Feature` and `Browser`
only — so anything needing a row is a Feature test even when it is integration-shaped. Do not
create a `tests/Integration/` directory.

### Unit (no DB)

- [ ] Unit test: `attributeTypeNameRules()` returns `required` / `string` / `max:100` plus a
      uniqueness rule; assert the returned rule array, no DB.
- [ ] Unit test: `attributeValueRules()` returns `required` / `string` / `max:100` /
      `distinct:ignore_case`.

### Integration (happy path)

- [ ] Integration test: defining "Size" with 38/39/40 persists one type row and exactly three value
      rows bound to it — assert the full sorted value set, not a count.
- [ ] Integration test: adding 41 to an existing "Size" leaves the **ids of 38/39/40 identical**
      (capture the id set before, compare after) and adds exactly one row.
- [ ] Integration test: removing 39 deletes exactly that row and the **ids of the surviving 38 and
      40 are unchanged** — the id comparison, not the count, is the whole test (FP2).
- [ ] Integration test: renaming a type leaves its value id set identical and its value texts
      untouched.
- [ ] Integration test: renaming a single value changes that row's text while its id, its type
      binding, and every sibling are unchanged.
- [ ] Integration test (**the 0029 regression net**): a no-op re-save of an unchanged type leaves
      every value id byte-for-byte identical. Drive it through `SyncProductAttributeValues`
      directly, not only through the component.
- [ ] Integration test: two types can hold the same value text ("Black" under Color and under
      Material) — both persist. This is what pins the constraint as composite rather than global.
- [ ] Integration test: deleting a type removes the type row **and** every one of its value rows,
      and leaves an unrelated type's values untouched.
- [ ] Integration test: the list is ordered deterministically — create values out of order and
      assert an **exact array**, including the numeric case (`9`, `10`, `38`).
- [ ] Integration test: reordering values updates positions contiguously and does **not** touch
      value ids.
- [ ] Integration test: the list query does not N+1 as the number of types **and** the number of
      values per type grows — measure at two sizes with a throwaway warm-up call first
      (copy the design at `tests/Feature/Users/IndexTest.php:218-246`).

### Authorization (three layers; an HTTP test and a `Livewire::test()` test are not substitutes)

- [ ] Negative test: a guest visiting the route is redirected to sign-in.
- [ ] Negative test: an authenticated user without `products.view` gets 403 on the route.
- [ ] Happy-path counterpart: a user holding `products.view` gets 200 and the component mounts.
- [ ] Happy-path counterpart: a `Super Admin` reaches the screen without holding the permission
      explicitly (the `Gate::before` bypass).
- [ ] Negative test: a user without `products.create` calling `save()` directly — bypassing
      `mount()` — is refused, **and `assertDatabaseMissing` proves no row was written**.
- [ ] Negative test: same shape for `deleteType()` (`products.delete`) — refused, and the type
      **and its values** still exist.
- [ ] Negative test: same shape for `openEditModal()` (`products.edit`), which discloses the value
      list.
- [ ] Integration test (permission-cache staleness): warm the cache by asserting `true`, revoke via
      a role change, re-assert on a **freshly resolved** user, with **no**
      `forgetCachedPermissions()` between Act and Assert.

### Negative / edge

- [ ] Negative test (validation dataset, one field varied off an otherwise-valid baseline): blank
      name; whitespace-only name; name one character over `max:100`; exact duplicate; **case-only**
      duplicate; **surrounding-whitespace** duplicate. Each persists nothing, and for an edit the
      type's existing name **and** value set are provably unchanged.
- [ ] Negative test: a duplicate value within the same type is rejected as a **validation error on
      the value field**, not as an unhandled `QueryException` (FP1).
- [ ] Edge case test: `"  Size  "` persists as the trimmed `"Size"` — assert the **stored string**,
      not the absence of an error.
- [ ] Edge case test: renaming a type to its own current name succeeds, and to a case variant of
      its own name (`Size` → `SIZE`) also succeeds rather than colliding with itself.
- [ ] Negative test: a forged `editingTypeId` cannot make `Rule::unique()->ignore()` skip a
      *different* row — assert the other row's name is unchanged.
- [ ] Negative test (**D4 step 2**): a forged value `id` in the `$values` payload, belonging to
      another type, does not update that other type's row — it is treated as a new row instead.
      Assert the other type's value is unchanged.
- [ ] Negative test: a save rejecting the third of three submitted values leaves the type's name
      **and** all pre-existing values exactly as they were (implies a transaction).
- [ ] Edge case test: two entries in one submission differing only by case/whitespace are rejected
      **before either is written** — the in-payload duplicate a per-row DB constraint catches only
      after the first insert.
- [ ] Edge case test: `openEditModal()` with an **unknown** id, and separately with a **malformed**
      id, each fail cleanly — separate cases, because `HasUuids` short-circuits on `Str::isUuid()`
      before querying.
- [ ] Edge case test: deleting a type twice fails cleanly rather than 500ing.

### Assertions that would be false passes if written naively

**FP1 — case-only duplicate rejection asserted by row count.** `expect(Type::count())->toBe(1)`
passes on `utf8mb4_unicode_ci` whether or not the application owns the rule. Assert a validation
error on the name field; a `QueryException` reaching the caller is a **failure**, not a pass.

**FP2 — "removing a value" asserted by count.** `toHaveCount(2)` passes identically for "deleted one
row" and for "deleted all three and recreated two with new ids" — i.e. it passes against the single
worst bug in this story (D4). Capture the surviving ids before and compare the exact id set after.
The same blind spot makes "renaming a type preserves its values" useless when asserted by value
*text*.

**FP3 — a route-level 403 standing in for component authorization.** It proves the `can:` gate and
nothing about `save()`, which arrives at `/livewire/update` where `verified` and Spatie's middleware
never re-run. `Livewire::test()` never runs route middleware at all. Both are required.

**FP4 — a deny test asserting only that an exception was thrown.** An `AuthorizationException`
raised *after* the write still throws. Pair every deny test with `assertDatabaseMissing` or an
unchanged-row assertion; the absent side effect is the proof.

**FP5 — the N+1 test without a warm-up call.** The first `Gate::authorize()` in a process
cold-loads all permission data, a one-time cost miscounted into the small-dataset measurement.

**FP6 — ordering asserted with `toContain` or against a sorted copy.** That is a set assertion
wearing an ordering assertion's name. Use `->toBe([...])` on the exact array.

**FP7 — `->throws(Exception::class)` in a permission test.** `PermissionDoesNotExist` from an
unseeded catalog satisfies it, so a missing `beforeEach` seed reads as a passing authorization test.
Always name the specific exception class.

**FP8 — claiming any backend test as coverage for the values repeater's DOM behaviour.**
`Livewire::test()->set()` bypasses the DOM entirely. That gap belongs to `frontend-qa` and must not
be marked closed here.

### Test-arrangement notes for Phase 3

- `beforeEach` must flush the permission cache **and** seed the real catalog, in that order —
  `app(PermissionRegistrar::class)->forgetCachedPermissions();` then
  `$this->seed(RolePermissionSeeder::class);`. Both halves are load-bearing: the seed is required
  because `can('products.view')` against an unseeded catalog throws `PermissionDoesNotExist`, and
  the flush is required because `phpunit.xml` sets `CACHE_STORE=array`, which is per-**process** —
  `RefreshDatabase` rolls the DB back without clearing it.
- **Never** flush the cache between Act and Assert in the staleness test.
- Do **not** invoke the full `DatabaseSeeder` to arrange — it creates a `test@example.com` fixture
  user under `local`/`testing`.
- Do **not** depend on ambient config; a test that branches on a config key must set that key,
  including setting it to `null` when "unset" is the state under test (the task-0003 lesson).
- Scaffold with `php artisan make:test --pest Products/AttributeTypesIndexTest`; use `test()`, not
  `it()`, third person, no "should".

## Expected outcome
A signed-in administrator holding the `products.*` permissions can define attribute types, edit
each type's value list inline, reorder those values, rename types and values, and delete a type
(which removes its values with it). Type names are globally unique and values are unique within
their type, with whitespace normalised before validation. Editing a type never re-keys the values
it did not change — the property story 0029's variant combinations depend on. Everyone without the
relevant product permission is refused server-side, on page load and on every action.

## Acceptance criteria
- [ ] Two tables exist exactly as specified in D2, with the composite unique on
      `(product_attribute_type_id, value)` and no redundant standalone FK index.
- [ ] Both models follow the repo's attribute-based conventions (`#[Fillable]`, `casts()` method,
      `HasUuids`, no `$keyType`/`$incrementing`, `@property string $id`).
- [ ] An attribute type can be created, renamed and deleted; deleting it removes its values.
- [ ] A type's values can be added, renamed, removed and reordered from within the type's own form.
- [ ] **Editing a type never changes the id of a value that was not itself removed** — proven by a
      test that captures the id set before the edit and compares it after.
- [ ] A submitted value id that does not belong to the type being edited is treated as a new row
      and never updates another type's row.
- [ ] Type names are globally unique; values are unique within their type and may repeat across
      types. Whitespace is normalised before validation, and the persisted value is the normalised
      one.
- [ ] A duplicate surfaces as a validation error on the offending field, never as an unhandled
      `QueryException`.
- [ ] A rejected save applies nothing at all — name and value list both unchanged.
- [ ] Values are returned in a deterministic order (`position ASC, value ASC`) from the
      relationship itself, not from each call site.
- [ ] Access requires the corresponding `products.*` permission, enforced by `can:` route
      middleware **and** by an explicit check inside every mutating or disclosing method.
- [ ] No change to `RolePermissionSeeder`, and no new permission strings.
- [ ] `docs/database/schema.md` and `docs/api/routes.md` are flagged to `docs-keeper` for Phase 6:
      two new tables in the ER diagram, and the "No domain model exists beyond `User`" note becomes
      false. `docs/database/migrations.md` gains this repo's **first real** `create_*` example of
      the UUID-PK / `foreignUuid` pattern, which that file currently shows only as a target snippet.
- [ ] Pint clean and Larastan level 7 clean.

## Definition of Done
- [ ] Tests written and green
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met

## Open questions

Resolved during this debate and recorded so they are not reopened: the two-table shape (D1), the
exact schema (D2), uniqueness scoping (D3), the inline-diff editing model and its
`restrictOnDelete()` constraint on 0029 (D4), the `position` column (D5), reusing `products.*` with
no policy (D6), cascade-now/block-with-0029 (D7), the excluded columns (D8), and the **UUID v7
primary key (D9 — confirmed after the debate; no longer open)**. The following are **genuinely
open** and should be answered before Phase 3. None blocks Phase 2 INVEST review.

**Q2 — Is an attribute type with zero values legal?** The PRD is silent; its only scenario defines a
type *with* values.
- **Q2a (recommended)** — legal and inert, matching this project's own sibling decision in story
  0009 ("a role created with zero permissions is a legal, inert state"). The type simply contributes
  no options to 0029's combination builder.
- Q2b — refuse with `min:1`, on the grounds that a valueless type can produce no variant and is
  indistinguishable from an abandoned draft. (`backend-expert` argued for this; the house precedent
  in Q2a is what tips the recommendation.)
Either way it needs a test, and the answer decides whether `attributeValueListRules()` carries
`min:1`.

**Q3 — Confirm the deletion rule by analogy (D7).** The PRD mandates the hard-block-with-a-count
pattern for product categories, roles, shipping zones and blog categories, but says nothing for
attribute types. **Recommended: 0029 applies the same hard block, with no confirm-and-proceed**, for
the reason in D7 — but this is an inference and needs PO sign-off rather than being assumed silently.

**Q4 — Are attribute type names and value labels translatable per store language (Epic 5)?**
Assumption 14 lists translatable content as product title/description, post title/body, slug/SEO
fields, and category/tag names — attribute names are **absent**, and so are they from Epic 5's own
Scenario Outline, which enumerates only product category / blog category / blog tag. Yet
"Size"/"Talla" is obviously the same *kind* of thing.
- **Q4a (recommended)** — not translatable in 0028; plain `name`/`value` columns, with the decision
  recorded so Epic 5 inherits it as a known migration rather than a silent gap.
- Q4b — design for translation now: materially larger, and it would make this the first translatable
  entity in the codebase, setting the pattern for all of Epic 5. Wrong story for that.
⚠️ **The cost of deferring depends on an Epic 5 decision not yet made.** A side-table or JSON
translations approach makes Q4a cheap to retrofit; a per-column-suffix approach (`name_es`,
`name_fr`) makes it expensive. Worth asking whether attribute names are in Epic 5's scope *now*,
rather than discovering it during Epic 5.

**Q5 — Route name.** `product-attribute-types.index` (recommended) keeps the two-segment
`<resource>.<action>` convention; `products.attribute-types.index` groups better under Products but
introduces a three-segment name this repo has no precedent for. Minor, but it is a public contract
the UI sibling binds to, so decide before Phase 3.

**Q6 — Confirm the backend/frontend split.** On this stack the Livewire component class *is* the
backend — it holds the authorization, validation and action wiring. So this story creates
`app/Livewire/Products/AttributeTypes/Index.php` in full **plus a minimal placeholder view**, and
the UI sibling replaces the view. Without the placeholder the route 500s and this story's own
feature tests cannot run. This mirrors the 0004 → 0006 split already recorded in
[`lang/en/users.php`](../../lang/en/users.php)'s own comment. Please confirm this is intended.
