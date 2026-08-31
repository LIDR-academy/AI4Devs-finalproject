# [0026] Assign a product to Sales Regions, and resolve its tax rate for a destination

## Description
Give a product its fiscal reach and make that reach *answer a question*. A new
`product_sales_region` pivot lets a catalog administrator assign one product to one or more seeded
Sales Region entries (Spain's fiscal sub-entries included), and a resolver answers "what tax rate
applies to this product at this destination" — the assigned region's rate when the destination is one
the product targets, the catalog default's rate otherwise. It is **backend only**: no screen, no
route, no Livewire component. The product editor and its region picker are story **0027**, built on
the searchable multi-select shell of story [0022](in-progress/0022-searchable-multi-select-component.md).

> **Scope change — 2026-08-18 (two confirmed user decisions).**
> **(1) Groupings are gone.** The supranational **grouping** entries (Unión Europea, Internacional)
> have been removed from the Sales Region catalog project-wide by user decision — see
> [0016](done/0016-sales-region-catalog-schema-and-seeder.md)'s own scope-change amendment and its **D11**.
> The catalog holds only individual countries and Spain's fiscal sub-territories, so this story's
> resolver loses its grouping tier entirely and **[OQ-1](#open-questions) is resolved as moot**. See
> **D10**.
> **(2) An unresolvable submitted id rejects the whole save.** Story
> [0022](in-progress/0022-searchable-multi-select-component.md)'s option contract has been amended (its D12) so a
> consumer can detect an id its resolver cannot vouch for — `resolveSelected()` is a total function
> throwing `App\Exceptions\UnresolvedSelectionException`; this story's assignment path uses that to
> **fail the entire save** rather than silently persisting a subset. This resolves this story's own
> **D7** data-loss finding. See **D11**.

Covers [PRD](../../docs/PRD/PRD.md#22-products) §2.2's *"Selecting Spain surfaces its fiscal
sub-entries in the region picker"* (the **data half** — the options a picker renders; the picker
itself is 0027), *"Assign a product to several sales regions"* and *"A product's tax uses its
assigned region's rate"*, plus [§2.1](../../docs/PRD/PRD.md#21-sales-regions--taxes)'s *"The default
rate applies when no region matches"* — i.e. Sales Regions acceptance criterion 5 and Products
acceptance criterion 5.

## Type
backend | fullstack (related_task_id: **0027** — the products list/editor UI, which consumes both
halves of this story) | includes database-expert: **yes** (new pivot table + migration)

**Bundled deliberately, per a confirmed Phase 0 decision — do not split.** "Assignment only" would
ship a pivot nothing reads: no observable behaviour, no falsifiable acceptance criterion beyond "a
row exists". The resolver is what makes the assignment *mean* something, and it is the half both PRD
scenarios actually assert. Recorded here so Phase 2 does not re-litigate the story's size.

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Assigning a product to Sales Regions

  Scenario: Assign a product to several sales regions
    Given a catalog administrator, with the Sales Region catalog seeded
    When they assign a product to Península, Canarias and Francia
    Then the product is associated with exactly those three region entries

  Scenario: Reassigning a product replaces its previous regions
    Given a catalog administrator, with a product already assigned to Península and Canarias
    When they reassign the product to Canarias and Francia alone
    Then the product is associated with exactly Canarias and Francia,
      and no longer with Península

  Scenario: A product may be assigned to no region at all
    Given a catalog administrator, with a product already assigned to Canarias
    When they clear the product's region assignments
    Then the product is associated with no region entry

  Scenario: Assigning the same region twice associates it once
    Given a catalog administrator editing a product
    When they submit Canarias twice in one assignment
    Then the product is associated with Canarias exactly once

  Scenario: Two products may target the same region
    Given a catalog administrator, with two products both assigned to Canarias
    When they clear the first product's region assignments
    Then the second product is still associated with Canarias

  Scenario: Deleting a product releases its region assignments
    Given a catalog administrator, with a product assigned to Canarias
    When they delete that product
    Then the product's region assignments are released,
      and the Canarias entry itself is untouched

  Scenario: A region entry that is not in the catalog cannot be assigned
    Given a catalog administrator editing a product
    When they assign the product to a region entry that is not in the catalog
    Then the assignment is refused with a validation message,
      and the product's existing assignments are unchanged

  Scenario: A set containing a region that no longer exists is rejected entirely
    Given a catalog administrator, with a product already assigned to Canarias
    When they assign the product to Canarias and a region entry that no longer exists
    Then the whole assignment is refused with a validation message naming the problem,
      and the product is still associated with exactly Canarias, with no part of
      the submitted set saved

  Scenario: A disabled region entry cannot be assigned
    Given a catalog administrator, with "Francia" seeded but not enabled
    When they assign a product to "Francia"
    Then the assignment is refused with a validation message

  Scenario: Spain itself cannot be assigned, only its fiscal sub-entries
    Given a catalog administrator, with the Sales Region catalog seeded
    When they assign a product to the "España" entry itself
    Then the assignment is refused with a validation message,
      because España is a heading over its fiscal territories rather than a rateable entry

  Scenario: Disabling a region already assigned to a product keeps the assignment
    Given a tax administrator, with a product assigned to "Francia"
    When they disable the "Francia" entry
    Then the product is still associated with "Francia"

  Scenario: A product carrying a since-disabled region can still be edited
    Given a catalog administrator, with a product assigned to a since-disabled "Francia" entry
    When they rename that product without touching its regions
    Then the rename is saved,
      and the product is still associated with "Francia"

  Scenario: A since-disabled region cannot be newly added, even beside a preserved one
    Given a catalog administrator, with a product assigned to a since-disabled "Francia" entry,
      and "Italia" also disabled but never assigned to that product
    When they add "Italia" to that product's regions
    Then the assignment is refused with a validation message naming "Italia",
      and the product is still associated with exactly "Francia"

Feature: The product region picker's options

  Scenario: Selecting Spain surfaces its fiscal sub-entries
    Given a catalog administrator editing a product, with the Sales Region catalog seeded
    When they search the region picker for "España"
    Then Península, Baleares, Canarias, Ceuta and Melilla are offered as selectable options

  Scenario: Spain itself is not offered as a selectable option
    Given a catalog administrator editing a product, with the Sales Region catalog seeded
    When they search the region picker for "España"
    Then the "España" entry itself is not among the selectable options

  Scenario: A disabled region entry is not offered
    Given a catalog administrator editing a product, with "Francia" seeded but not enabled
    When they search the region picker for "Francia"
    Then no selectable option is offered for it

  Scenario: An already-assigned region keeps its name after being disabled
    Given a catalog administrator editing a product assigned to a since-disabled region
    When the product's current assignments are listed for them
    Then that region is still named among them rather than silently dropped

Feature: Resolving a product's tax rate for a destination

  Scenario: A product's tax uses its assigned region's rate
    Given a catalog administrator, with a product assigned to the "Canarias" entry
    When the tax rate for that product in Canarias is resolved
    Then the "Canarias" entry's rate is used

  Scenario: The default rate applies when no region matches
    Given a catalog administrator, with a product assigned to no entry
      matching a given destination
    When the applicable tax rate for that destination is resolved
    Then the default entry's rate is used

  Scenario: The resolved rate names the entry it came from
    Given a catalog administrator, with a product assigned to the "Canarias" entry
    When the tax rate for that product in Canarias is resolved
    Then the answer identifies "Canarias" as the entry the rate came from

  Scenario: A rate of zero is a real rate, not a missing one
    Given a catalog administrator, with a product assigned to a region entry
      whose rate is zero
    When the tax rate for that product in that region is resolved
    Then a rate of zero is used, rather than falling back to the default entry

  Scenario: A rate of zero on the default entry is a real rate
    Given a catalog administrator, with the default entry's rate set to zero
      and a product assigned to no entry matching a given destination
    When the applicable tax rate for that destination is resolved
    Then a rate of zero is used

  Scenario: An assigned entry with no configured rate resolves to no rate
    Given a catalog administrator, with a product assigned to a region entry
      that carries no configured rate
    When the tax rate for that product in that region is resolved
    Then no rate is returned and that entry is named as the one lacking configuration,
      rather than another entry's rate being used in its place

  Scenario: A default entry with no configured rate resolves to no rate
    Given a catalog administrator, with the default entry carrying no configured rate
      and a product assigned to no entry matching a given destination
    When the applicable tax rate for that destination is resolved
    Then no rate is returned and the default entry is named as the one lacking configuration

  Scenario: A disabled but still-assigned region keeps deciding the rate
    Given a catalog administrator, with a product assigned to a since-disabled
      region entry that carries a rate
    When the tax rate for that product in that region is resolved
    Then that entry's rate is used, rather than the default entry's

  Scenario: Assigning a fiscal territory does not cover its parent
    Given a catalog administrator, with a product assigned to "Canarias" alone
    When the tax rate for that product in mainland Spain is resolved
    Then the default entry's rate is used, because assignment covers only the entry chosen

  Scenario: Assigning a parent entry does not cover its fiscal territories
    Given a catalog administrator, with a product assigned to no entry
      other than a parent heading
    When the tax rate for that product in Canarias is resolved
    Then the default entry's rate is used
```

## Files to create/modify

### `database/migrations/<ts>_create_product_sales_region_table.php` — **create**

Scaffold with `php artisan make:migration create_product_sales_region_table --no-interaction`. Its
timestamp must be **strictly later** than both 0016's `create_sales_regions_table` and 0024's
`create_products_table`, since both FKs are declared inline.

```php
Schema::create('product_sales_region', function (Blueprint $table): void {
    $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
    $table->foreignUuid('sales_region_id')->constrained()->restrictOnDelete();

    $table->primary(['product_id', 'sales_region_id']);
});

// down(): Schema::dropIfExists('product_sales_region');
```

| Choice | Why exactly this |
| --- | --- |
| Table name `product_sales_region` | **Verified**, not assumed — `HasRelationships::joiningTable()` snake-cases both basenames (`product`, `sales_region`), `sort()`s them and joins with `_`. So this is the name Laravel infers, and `belongsToMany()` needs no table override. Named explicitly in the relation anyway (see below). |
| Composite PK `(product_id, sales_region_id)` | Makes "the same region assigned twice" a **database** impossibility rather than a validation-only one, exactly as `product_media`'s composite PK does in 0024 (D-8). `product_id` leads because the only real query is "this product's regions". No surrogate `id` — nothing FKs into this pivot. |
| **No extra columns at all** | No `position` (nothing in the PRD orders a product's regions — contrast the gallery *strip*, which the PRD explicitly orders), no `timestamps()` (matching `product_media`), and emphatically **no per-assignment rate override**: a rate lives on `sales_regions.rate` and nowhere else. An override column would add a fourth precedence tier and a second place a rate can hide. |
| `product_id` → `cascadeOnDelete()` | `Product` is hard-deleted (0024 D-12, no `SoftDeletes`), and an assignment without its product is meaningless. |
| `sales_region_id` → `restrictOnDelete()` | The house pattern for "cannot delete something in use" (0016's `parent_id`, 0024's two media FKs). Honestly: **this branch is currently unreachable** — 0016 and 0017 both confirm the catalog has no delete path, only `is_active`. It is a backstop against a future delete story, the same acknowledged-dead-today situation 0024 records at R-17. Do not "simplify" it to `cascadeOnDelete`; that would silently strip a product's tax assignment with nothing having gone wrong with the product. |
| **No hand-written index on either FK column** | See below — this is a verified finding, not a style preference. |

#### Indexes — verified, and why nothing is hand-written

**Verified by probing the real MySQL schema grammar** in this repo (constructing a `Blueprint`
against `MySqlConnection` + `useDefaultSchemaGrammar()` and reading `toSql()`), because no database
is reachable from the agent shell:

- The migration above emits **exactly three statements**: the `create table` carrying the composite
  PK inline, plus one `alter table … add constraint` per FK. **Zero index DDL.**
- Adding `$table->index('sales_region_id')` emits a **fourth** statement creating
  `product_sales_region_sales_region_id_index` *in addition to* the index MySQL auto-creates for the
  FK constraint — two indexes on one column, which is precisely the `users_uuid_unique` write
  amplification recorded in [errors-log.md](../../docs/errors-log.md) and re-flagged as 0024's
  **D-10**. **Do not add it.**
- `product_id` needs no index of its own: it is the composite PK's **leftmost prefix**.
  `sales_region_id` is not covered by that prefix, so InnoDB creates its own supporting index for the
  FK — which is exactly the index the reverse lookup would want, obtained for free.

> ⚠️ [`migrations.md`](../../docs/database/migrations.md#structure) still instructs the opposite
> ("this repo is explicit about it", citing `create_passkeys_table`'s manual
> `$table->index('user_id')`). **That instruction is wrong** and 0024's **D-10** already owns
> correcting it; this story is the second table it would damage. Flagged, not fixed here.

> 📌 **`constrained()` needs no table argument on either FK — verified.** The probe confirmed it
> infers `products` from `product_id` **and** `sales_regions` from `sales_region_id`. This story
> does **not** hit 0024's `featured_media_id` → `featured_media` trap (V-4) or 0016's `parent_id` →
> `parents` trap. Stated because `backend-expert` recommended writing `constrained('sales_regions')`
> defensively on the assumption that the singular would be inferred; the probe shows the inference is
> already correct, so the explicit argument is optional rather than mandatory. Either is acceptable;
> what is **not** acceptable is asserting one without checking.

**Index decisions deliberately left alone**, both inherited and both re-examined here:

- **No index on `sales_regions.is_default`**, which the resolver's fallback tier queries. 0016 omitted
  it on cardinality grounds and that still holds: 249 rows resolve in a sub-millisecond clustered
  scan, and a boolean over 249 rows is the worst possible index candidate. The right fix for Epic 3
  resolving many order lines is to **fetch the default row once per request and pass it down**, not to
  index a boolean — see the N+1 note under the resolver.
- **No index on `sales_regions.parent_id` beyond the FK's own.** Fetching Spain's children is a single
  indexed lookup on a table of 249 rows.

### `app/Models/Product.php` — **modify** (0024 creates it)

```php
/** @return BelongsToMany<SalesRegion, $this> */
public function salesRegions(): BelongsToMany
{
    return $this->belongsToMany(SalesRegion::class, 'product_sales_region', 'product_id', 'sales_region_id');
}
```

Table and column names written explicitly even though all three match convention — the relation is
the one place a future rename would silently start pointing at nothing.

**No inverse `SalesRegion::products()` relation.** Nothing in this story or its declared consumers
needs "which products target this region", and there is no delete guard to count through (the catalog
is never deleted). 0016 and 0017 both refuse to ship a relation or scope with no call site; the same
rule binds here.

### `app/Models/SalesRegion.php` — **modify** (0016 creates it)

Two query scopes, each with a real call site **in this story** — which is what clears 0016/0017's
"no scope without a consumer" bar:

```php
/** @param  Builder<SalesRegion>  $query */
public function scopeActive(Builder $query): void
{
    $query->where('is_active', true);
}

/**
 * Active entries that are not headings over fiscal territories — i.e. the entries a
 * product may actually be assigned to. See D3.
 *
 * @param  Builder<SalesRegion>  $query
 */
public function scopeAssignable(Builder $query): void
{
    $query->active()->whereDoesntHave('children');
}
```

`scopeAssignable()` is consumed by the validation rule **and** by the options resolver, so the
"assignable" definition exists once rather than being restated in two places that can drift.

### `app/Actions/Products/SyncProductSalesRegions.php` — **create**

The single named writer of the pivot, **shaped like** (but in no way calling or owning) 0024's
`SyncProductGallery`:

```php
/** @param  array<int, string>  $salesRegionIds */
public function __invoke(Product $product, array $salesRegionIds): void
{
    $product->salesRegions()->sync($salesRegionIds);
}
```

**`sync()`, not `attach()`.** The PRD scenario is edit-form shaped — "assign the product to
Península, Canarias, and France" names the *complete new set*. `attach()` can only ever grow the set,
so deselecting a region in 0027's picker would silently do nothing. Same call shape as `UpdateUser`'s
`syncRoles()` and `SyncProductGallery`'s own `sync()`.

**Deliberately not folded into `CreateProduct` / `UpdateProduct`.** This story does not edit either of
0024's shipped actions; 0027 wires this one into its save flow alongside them. Keeping out of a
sibling story's files is the same discipline 0024 applies when it *does* edit
`DeleteProductCategory` — it names the reason first.

> 📌 **Gallery sync is not this story's, in any sense — see D14.** `SyncProductGallery` is created,
> owned and tested **exclusively by [0024](0024-products-core-crud-backend.md)**. This story neither
> calls it, wraps it, extends it, nor specifies its behaviour; every mention of it here is a *shape*
> comparison for a sibling action. 0026 handles **sales-region assignment only, never product media**.

> ⚠️ **This action must be safe to call inside a caller-opened transaction, and must not open its own
> (D13).** It performs one `sync()` and lets every exception escape — no `try`/`catch`, no
> `DB::transaction()` wrapper of its own. Atomicity across the product's core-field update **and** this
> sync is the **orchestrator's** obligation, and the orchestrator is story 0027. See **D13** and the
> Definition-of-Done hand-off.

### `app/Actions/Products/ResolveProductTaxRate.php` — **create**

```php
public function __invoke(Product $product, SalesRegion $destination): ResolvedTaxRate
```

**The algorithm is now exactly two tiers, with no third.** Since groupings no longer exist (**D10**),
the resolver matches the destination's id against the product's own assigned entries — individual
countries and Spain's fiscal sub-territories, the only two kinds the catalog holds — and falls back to
the catalog default when nothing matches. There is **no grouping-tier step** between the two, and no
membership inference of any kind.

1. Match the destination **by exact entry id** against `$product->salesRegions`. A hit ⇒
   `tier: AssignedRegion`, and that entry's `rate` is the answer (`null` and `'0.000'` both honoured
   verbatim — **D5**).
2. No hit ⇒ the catalog default entry decides ⇒ `tier: CatalogDefault`, same rate rules.
3. No default row at all ⇒ a thrown domain exception (**D5**).

The full return shape and every rejected alternative are in **D4**–**D6** and **D10**. Three
properties to carry into implementation:

- **The destination arrives already resolved to a catalog row.** Address → region mapping (PRD §3.2:
  physical → shipping address, virtual → billing address plus an IP-geo check) is **Epic 3's**, and
  this story's scope fence excludes it. This action performs no geolocation and no address parsing.
- **It calls `$product->loadMissing('salesRegions')`** as a correctness net, and its docblock states
  plainly that a caller resolving many products in one request must eager-load
  `Product::with('salesRegions')` up front or pay a query per product — the same hazard-flagging
  posture 0024 takes at R-9 rather than solving a problem this story does not own.
- **It self-authorizes nothing**, per 0024's RQ-10 convention. It is also a pure read of values
  already visible to anyone holding `products.view` or `sales-regions.view`, so it discloses nothing
  new; and Epic 3 will call it from an order pipeline that may have no acting user at all.

### `app/Actions/Products/ResolvedTaxRate.php` — **create**

```php
final readonly class ResolvedTaxRate
{
    public function __construct(
        public ?string $rate,                    // decimal:3 STRING, or null == the winning entry is unconfigured
        public SalesRegion $region,              // which entry decided the answer
        public TaxRateResolutionTier $tier,
    ) {}
}
```

Placed **beside its only producer** rather than in a new `app/DataTransferObjects/` folder: project
`CLAUDE.md` forbids new base folders without approval, and `app/Actions/Products/` is already
sanctioned. See [open question OQ-3](#open-questions) if a dedicated folder is preferred.

`?string`, **never `?float`** — `sales_regions.rate` casts `decimal:3`, which returns a string. Typing
it `float` is the single likeliest silent bug in this story, and both 0016 and 0024 (R-4) flag the
same trap in their own code.

### `app/Enums/TaxRateResolutionTier.php` — **create**

```php
case AssignedRegion = 'assigned_region';   // the destination is one the product targets
case CatalogDefault = 'catalog_default';   // no assigned entry matched; the default decided
```

`app/Enums/` is a stock Laravel location, so it needs no approval. A backed enum rather than
`ResolvedTaxRate`'s originally-proposed `bool $isExactMatch`: Epic 3 must record *why* a rate applied,
not just that it did, and a boolean named after one of its two states reads badly at the call site.
TitleCase keys / lowercase values per project `CLAUDE.md`. **No `label()` method** — nothing renders
it yet, and adding one would drag `lang/{en,es}` keys with no consumer into scope, exactly as 0016
declined for `SalesRegionKind`.

### `app/Actions/Products/SearchSalesRegions.php` — **create**

**Implements story [0022](in-progress/0022-searchable-multi-select-component.md)'s locked
`App\Livewire\Components\MultiSelectOptionsResolver` interface** — and 0022's own consumer example
already names this exact class-string, so the name is a contract, not a preference:

```blade
<livewire:components.searchable-multi-select
    :option-resolver="\App\Actions\Products\SearchSalesRegions::class"
    wire:model="regionIds" field="regionIds" />
```

```php
/** @return array<int, array{id: string, label: string, group: string|null, disabled: bool}> */
public function search(string $term, int $limit): array;

/**
 * TOTAL FUNCTION: exactly one entry per requested id, or it throws. Never a short array.
 *
 * @param  array<int, string>  $ids
 * @return array<int, array{id: string, label: string, group: string|null, disabled: bool}>
 *
 * @throws \App\Exceptions\UnresolvedSelectionException when any id cannot be resolved
 */
public function resolveSelected(array $ids): array;
```

The two methods answer **deliberately different questions**, and conflating them is the story's
sharpest trap (**D7**):

- **`search()` offers only `assignable()` entries** — active, and not a heading over fiscal
  territories. It matches the term against the entry's **own name and its parent's name**, which is
  what makes PRD §2.2's *"selecting Spain surfaces its fiscal sub-entries"* fall out with no extra
  mechanism: typing `España` returns the five territories, and `España` itself is simply absent.
- **`resolveSelected()` vouches for every currently-assigned id regardless of `is_active`**, marking a
  no-longer-assignable one `disabled: true`. This is not symmetry-breaking for its own sake — see
  **D7**; getting it wrong silently deletes data.
- **An id neither method can vouch for is now a *rejection*, not a silent drop (D11).** Per
  [0022's D12](in-progress/0022-searchable-multi-select-component.md#d12--an-unresolvable-id-is-rejected-never-silently-dropped-confirmed),
  `resolveSelected()` is a **total function**: it returns exactly one entry per requested id, or it
  throws `App\Exceptions\UnresolvedSelectionException` (new class at
  `app/Exceptions/UnresolvedSelectionException.php`, following the `ImmutableRoleException` precedent
  and deliberately carrying **no** `render()` method) whose `public readonly array $missingIds` names
  every id it could not vouch for. So `SearchSalesRegions::resolveSelected()` **does throw** — a short
  return is a contract violation, not an acceptable outcome. Converting that exception into a
  `ValidationException` is the **consumer's** job: 0027 calls the shell's `assertSelectionResolvable()`
  (or `resolveSelected()` itself) in its save path, alongside the validation rule below.
- **Text matching uses `App\Actions\NormalizeForSearch`, not a local fold.** Per
  [0022's D13](in-progress/0022-searchable-multi-select-component.md#d13--one-centralized-search-term-normalizer-appactionsnormalizeforsearch-confirmed),
  the one shared normalizer is an invokable class at `app/Actions/NormalizeForSearch.php` with
  signature `__invoke(string $value): string`, implemented as `trim` → `Str::lower` → `Str::ascii` →
  collapse whitespace. The `$term` handed to `search()` **arrives already normalized** by the shell, so
  this class must fold the **haystack** side — the entry's own name and its parent's name — through
  that same class (injected per-method, per
  [code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method));
  comparing a folded needle against an unfolded haystack silently matches nothing. Hand-rolling
  `Str::lower()`/`iconv()` here is a review finding.
- **Labels are qualified: `"España (Península)"`, not `"Península"`** — with `group: null`. That is
  PRD §2.1's own spelling of that exact entry, it makes a selected chip self-describing out of
  context, and it matches 0022's D3 expectation that this consumer renders a flat list. Rejected
  alternative: `label: "Península"` + `group: "España"` using 0022's heading mechanism — a purely
  additive change to this resolver if 0027 later prefers it, requiring no change to 0022's shell.

### `app/Concerns/ProductValidationRules.php` — **modify** (0024 creates it)

```php
/** @return array<int, ValidationRule|array<mixed>|string> */
protected function salesRegionIdsRules(): array
{
    return ['array'];
}

/**
 * Rules for ONE submitted sales-region id.
 *
 * $preservedSalesRegionIds are the ids **already persisted on the product being edited**, read
 * from the database and never from the request (D12). They are exempt from the *assignable*
 * conditions, because a since-deactivated entry that is already assigned is being **preserved**,
 * not newly chosen — it must only still exist in the catalog. Every other submitted id (i.e.
 * every genuinely new one) still faces the full active + not-a-heading match.
 *
 * @param  array<int, string>  $preservedSalesRegionIds
 * @return array<int, ValidationRule|array<mixed>|string>
 */
protected function salesRegionIdRules(array $preservedSalesRegionIds = []): array
{
    return [
        'string',
        'distinct',
        Rule::exists('sales_regions', 'id')->where(
            fn (Builder $query) => $query->where(
                fn (Builder $group) => $group
                    ->where(fn (Builder $assignable) => $assignable
                        ->where('is_active', true)
                        ->whereNotExists(fn (Builder $sub) => $sub->selectRaw(1)
                            ->from('sales_regions as children')
                            ->whereColumn('children.parent_id', 'sales_regions.id')))
                    ->orWhereIn('id', $preservedSalesRegionIds),
            ),
        ),
    ];
}

// Applied as, in 0027's save path — the second argument is read from the PERSISTED product:
//
//   $preserved = $this->product?->salesRegions->pluck('id')->all() ?? [];   // [] on create
//
//   [
//       'salesRegionIds'   => $this->salesRegionIdsRules(),
//       'salesRegionIds.*' => $this->salesRegionIdRules($preserved),
//   ]
```

No entity prefix needed on either name — 0024's naming trap applies only to leaf methods that clash
across composed traits (`nameRules`), and neither of these does.

> ⚠️ **The `is_active` and no-children conditions are part of the `exists` MATCH, not a follow-up
> `if`.** Same shape, and the same reason, as 0017's `replacementDefaultRules()` and
> `RolePermissionSeeder`'s `whereNotNull('email_verified_at')` lookup: a condition checked after the
> row is found is a condition a second call site will forget. **D12's exemption keeps that property**
> — "already assigned to this product" is another branch of the same match, not a check bolted on
> afterwards.

> ⚠️ **The OR must be wrapped in its own nested group, or the rule matches everything.** `Exists`
> applies each `where(Closure)` to the **top-level** count query, which already carries
> `where id = <submitted value>`. A bare `->orWhereIn('id', $preserved)` at that level produces
> `where id = ? and (assignable…) or id in (…)` — whose right-hand branch is true for any non-empty
> `$preserved` **regardless of the submitted value**, so every garbage id would pass. The single
> outer `->where(fn ($group) => …)` above is what yields the correct
> `where id = ? and ((is_active = 1 and not exists(children)) or id in (…))`. Do not flatten it.
> An empty `$preserved` is safe as-is: `orWhereIn('id', [])` compiles to `or 0 = 1`, so a create
> falls back to exactly the pre-D12 strict rule with no `when()` guard needed.

> 🔒 **`$preservedSalesRegionIds` is server-derived, always.** It must come from
> `$product->salesRegions` (or a direct pivot query) for the product the request is editing. Taking it
> from the request — a hidden field, a `#[Locked]`-less property, the picker's own dehydrated
> selection — would let a caller name any id as "already assigned" and bypass the `is_active` /
> no-heading gate entirely, which is the whole rule. Revert-check **#11** pins this.

> 📌 **This rule is what makes "reject the whole save" true (D11).** `salesRegionIds.*` is validated
> per element, so a single unresolvable id fails the request and **`SyncProductSalesRegions` is never
> called at all** — no partial `sync()`, no subset written. That is the mechanism; 0022's now-published
> contract (`resolveSelected()` throwing `App\Exceptions\UnresolvedSelectionException` with its
> `$missingIds`, surfaced by the shell's `assertSelectionResolvable()`) is what lets 0027's component
> *surface* which id was the problem instead of quietly shrinking the chip set. The refusal message
> must name the problem (`lang/{en,es}/products.php`, below), never fail silently.

> ⚠️ **A rule enforced only in a form is bypassed by every other call site of the action**
> ([livewire-authorization.md](../../docs/security/livewire-authorization.md)). This validation runs
> on 0027's component path only. See [risk R-4](#risks) — whether `SyncProductSalesRegions` should
> re-assert assignability inside itself is a deliberate open decision, not an oversight.

### `lang/en/products.php`, `lang/es/products.php` — **modify** (0024 creates them)

A `sales_regions.*` group for the two refusal messages (not in the catalog / not assignable), added
**key-for-key to both files** per [naming.md](../../docs/conventions/naming.md#translation-keys).

> ⚠️ **Three stories now touch these two files** — 0024 creates them, 0028 extends them, and this
> story extends them. 0024's R-13 already records the hazard; this is a third writer, and
> [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent
> File-Ownership Rule governs if any two ever run concurrently.

### Explicitly **not** touched

`routes/web.php` · `app/Livewire/**` · `resources/views/**` · `tests/Browser/**` ·
`database/seeders/**` (no new permission — `products.edit` and `sales-regions.view` already cover
everything here) · `database/factories/SalesRegionFactory.php` (0016's states already cover every
arrangement these tests need) · `app/Actions/Products/CreateProduct.php` / `UpdateProduct.php` ·
`docs/**` (Phase 6).

## Tests to perform

Backend only — no browser tests, since this story ships no screen. **Every test arranges with
`SalesRegionFactory` and `ProductFactory`; none may run `SalesRegionSeeder`** (249 rows per
`beforeEach` is the exact anti-pattern 0016 forbids). No test needs `RolePermissionSeeder` or a
permission-cache flush — this story has no permission-gated surface.

> 📌 **The most likely test-authoring mistake in this story, stated once at the top of each
> resolution test file:** `SalesRegionFactory::isDefault()` is deliberately **not** the base state, so
> a file that forgets to layer it on has **zero** default rows and every fallback assertion is
> resolving against nothing. Equally: never hardcode `SalesRegionSeeder::DEFAULT_SLUG` — those
> constants identify *seeded* rows, and these tests never seed. Identify rows by the factory-returned
> instances.

**Feature — `tests/Feature/Products/ProductSalesRegionAssignmentTest.php`**
- [ ] Assign to Península + Canarias + Francia (two fiscal territories under one parent, plus a bare
      country) → the set is **exactly** those three by id, asserted as an exact set, never
      `toContain`. A `toContain` assertion passes against an `attach()`-based bug that leaks whatever
      was there before.
- [ ] **Reassignment narrows**: `{A,B,C}` → `{B,D}` yields exactly `{B,D}`. This is the single place
      `sync()` and `attach()` diverge completely — and the bug does not throw, it silently accumulates
      regions forever.
- [ ] Reassignment to a superset `{A}` → `{A,B,C}` yields exactly `{A,B,C}`.
- [ ] `sync([])` on an assigned product leaves zero pivot rows and does **not** throw — an unassigned
      product is a legitimate business state (it resolves to the default), so an `array` rule that
      also required non-emptiness would be wrong.
- [ ] The same id submitted twice yields **one** pivot row. Fails loudly against a hand-rolled
      `foreach`+`attach()` (a `23000` on the composite PK) and silently against an upsert loop.
- [ ] The same region on two products; clearing product A leaves product B's row intact — proves the
      sync is genuinely scoped by `product_id`.
- [ ] Deleting a **product** removes its pivot rows, asserted **against the pivot table directly**,
      not inferred from the product's absence — and the `sales_regions` row survives.
- [ ] A well-formed but nonexistent region id → `ValidationException`, zero pivot rows written,
      existing assignments unchanged.
- [ ] **A set that is valid except for one stale id is rejected *entirely*** (**D11**): a product
      already assigned to `{A}` submits `{A, B, <deleted id>}` → `ValidationException`, and the pivot
      still holds **exactly `{A}`** — asserted as an exact set, because the bug this pins writes
      `{A, B}` and looks like a success. This is the no-partial-save guard; a `toContain('A')`
      assertion passes against it.
- [ ] The refusal above carries a message **naming the offending id/field**
      (`salesRegionIds.*` error bag), not a bare generic failure.
- [ ] A **malformed** id (`'not-a-uuid'`, `''`, an integer, a `null` element) → `ValidationException`,
      never a `QueryException`, never a 500.
- [ ] An **inactive** region id → `ValidationException` (**D3**).
- [ ] A region **with children** (the "España" heading) → `ValidationException` (**D3**). Pair it with
      a positive control in the same test: a childless active country *is* accepted, so a
      refuse-everything rule cannot pass the negative half trivially.
- [ ] **Deactivating a region does not detach it.** Assign an active region, flip `is_active` to
      false directly, assert the pivot row survives and `$product->salesRegions` still contains it.
      This is the assertion that pins **D7**'s premise.
- [ ] **A product carrying a since-deactivated assigned region still validates and saves** (**D12**).
      Assign an active region, flip it inactive, then validate the *same* id set with
      `salesRegionIdRules($preserved)` where `$preserved` is read from the persisted product → **no**
      `ValidationException`, and the pivot still holds exactly that region. This is the test that goes
      red against the unconditional `is_active` rule this story shipped before D12, where an
      *unrelated* field change made the whole product unsaveable.
- [ ] **Newly adding a currently-inactive region is still refused, even beside a preserved one**
      (**D12**). Product assigned to inactive region `A`; submit `{A, B}` where `B` is inactive and was
      never assigned → `ValidationException` on `salesRegionIds.*`, and the pivot still holds exactly
      `{A}`, asserted as an exact set. Pair the two bullets in the same file: apart, either can pass
      against a rule that has simply stopped checking `is_active` at all.
- [ ] **The same pairing for a child-bearing entry** — a product may keep an assignment to an entry
      that has *since* acquired children (0016 D3 anticipates Portugal/Madeira/Azores arriving later),
      but may never newly add one. Same shape as the two bullets above.
- [ ] **The preserved set is server-derived** (**D12**, security). Validate a set containing an
      inactive, never-assigned id while passing a `$preserved` array computed from the persisted
      product → refused. A test that hands the id under test straight into `$preserved` proves nothing;
      the arrangement must go through `Product::salesRegions`.
- [ ] **The FKs really constrain** — two raw-query tests, an argued exception to
      [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s "database guarantees" rule,
      identical in kind to 0024's category- and media-FK tests: (a) a raw
      `DB::table('product_sales_region')->insert([...])` with a random region UUID throws
      `QueryException`; (b) a raw `DB::table('sales_regions')->…->delete()` on an assigned region
      throws `QueryException` `23000` and the region survives. (b) is the **only** executable proof of
      `restrictOnDelete()` anywhere in the codebase, since no application path deletes a region.

**Feature — `tests/Feature/Products/ResolveProductTaxRateTest.php`**
- [ ] **Direct match**: product assigned to `{Península, Canarias}`, Canarias `withRate('7.500')`,
      destination Canarias → `'7.500'`, asserted `toBe('7.500')` **and** `toBeString()`. Pinning only
      the value passes against a `float` regression. Highest-value assertion in the story.
- [ ] The returned answer names Canarias as `region` and `TaxRateResolutionTier::AssignedRegion` as
      `tier`.
- [ ] **No match → the default's rate.** Arrange three *distinguishable* rates (the assigned region's,
      the destination's own, and the default's) in one test, so a wrong-tier bug cannot coincidentally
      produce the expected number. `tier` is `CatalogDefault`.
- [ ] **The destination's own rate is NOT used when the product is not assigned to it** — the decoy
      that makes the test above non-trivial: give the unassigned destination region a rate of its own
      and assert the *default's* rate came back, not the destination's.
- [ ] **`0.000` is a real rate — at both tiers, as a pair.** Direct-match tier: an assigned region
      `withRate('0.000')` resolves to `'0.000'`, not the default's rate. Default tier: a default
      `withRate('0.000')` with no match resolves to `'0.000'`, not `null`.
- [ ] **Unconfigured assigned region** → `rate` is `null`, `region` is that region,
      `tier` is `AssignedRegion`. It does **not** fall through to the default (**D5**) — assert the
      default's rate is *not* what came back, using a default that carries a distinct rate.
- [ ] **Unconfigured default, no match** → `rate` is `null`, `region` is the default,
      `tier` is `CatalogDefault`. Never `'0.000'`, never a thrown exception (**D5**).
- [ ] **`null` and `'0.000'` resolve differently** at both tiers — the pairing that proves the
      null-handling is not accidentally identical to the zero-handling.
- [ ] **A disabled but assigned region still decides** (**D6**): assign an active region with a rate,
      flip it inactive, resolve → that region's rate, `tier` is `AssignedRegion`.
- [ ] **No hierarchy climbing, both directions** (**D4**): assigned to Canarias alone, destination
      Península → default's rate; assigned to the "España" heading alone, destination Canarias →
      default's rate.
- [ ] **A different country never matches** (**D4** / **D10**): assigned to `Francia` alone,
      destination `Portugal` → the default's rate. With groupings gone there is no tier between the
      two, so this is the whole of the "no match" surface.
- [ ] **No default row exists at all** → a thrown domain exception, not a silent `null`. This is an
      invariant violation (0017 guarantees production never reaches it), and it must be
      distinguishable from an unconfigured rate — otherwise "the developer forgot to arrange a
      default" reads as "the administrator hasn't set a rate".
- [ ] Type pinning is asserted at **both** tiers, not just the direct-match one — a branch that does
      `(string) $default->rate` would turn `null` into `''` and `'0.000'` into `'0'`.

**Feature — `tests/Feature/Products/SearchSalesRegionsTest.php`**
- [ ] Searching `España` returns the five fiscal territories as selectable options and **not** the
      "España" heading itself.
- [ ] Searching a territory's own name (`Canarias`) returns it.
- [ ] An inactive region is absent from `search()`; enabling it makes it appear.
- [ ] A region with children is absent from `search()` even when active.
- [ ] `search()` honours `$limit`.
- [ ] **`resolveSelected()` vouches for a since-deactivated assigned id** and marks it
      `disabled: true` (**D7**). This is the data-loss regression guard: a deactivated-but-still-
      existing id must still render as a (disabled) chip — it is distinct from an id absent from
      the catalog entirely, which is 0022's D12 case below.
- [ ] `resolveSelected()` throws `App\Exceptions\UnresolvedSelectionException` (0022's D12) when an
      id is absent from the catalog — a tampered id fails the whole resolution, it is never
      silently dropped or rendered.
- [ ] Every returned row matches 0022's exact array shape (`id`, `label`, `group`, `disabled`), with
      `id` a **string** and `group` `null`.

**Unit — `tests/Unit/Enums/TaxRateResolutionTierTest.php`**
- [ ] `cases()` is **exactly** `['assigned_region', 'catalog_default']`, asserted as an exact array —
      not `toContain`, which would not go red when a third tier is added without thought.

### Mandatory revert-checks

Run them; do not merely assert the tests exist (the pattern 0016 and 0017 established).

1. **Replace the rate's null check with `if (! $region->rate)` or `empty(...)`** → the `'0.000'`-at-
   both-tiers pair must go red. Note `empty('0.000')` is `false` while `! (float) '0.000'` is `true`,
   so the check must be written to catch the **truthiness-after-cast** form specifically.
2. **Add a fall-through from an unconfigured assigned region to the default** → the "unconfigured
   assigned region" test must go red. This is what pins **D5** against the recommendation both amigos
   made.
3. **Add an ancestor walk (`whereIn('parent_id', …)`) to the match query** → both no-hierarchy-climbing
   tests must go red. Proves those negatives are not vacuously passing.
4. **Swap `sync()` for a `foreach` + `attach()`** → the reassignment-narrows and duplicate-id tests
   must go red.
5. **Drop `Rule::exists(...)` from `salesRegionIdRules()`** → the nonexistent- and malformed-id tests
   must go red, surfacing as `QueryException`/500 instead of `ValidationException`.
6. **Drop the `is_active` / no-children conditions from the `exists` rule** → the inactive-region and
   España-heading refusals must go red.
7. **Make `resolveSelected()` filter on `assignable()`** (i.e. make it symmetric with `search()`) →
   the deactivated-assigned-id test must go red. This is the check that proves **D7**'s asymmetry is
   deliberate and load-bearing rather than an inconsistency someone should tidy.
8. **Change `product_id`'s FK to drop the cascade** → the product-delete test must go red on an
   orphaned pivot row.
9. **Filter the submitted set down to its resolvable ids before syncing** (i.e. restore the silent-drop
   behaviour **D11** replaces) → the "rejected entirely" test must go red, and it must go red on the
   *pivot contents*, not merely on a missing exception. This is the check that proves the no-partial-
   save rule is enforced rather than assumed.
10. **Drop the `orWhereIn('id', $preservedSalesRegionIds)` branch** (i.e. restore the unconditional
    assignable match this story carried before **D12**) → the "product carrying a since-deactivated
    assigned region still saves" test must go red. This is the check that proves D6/D7's preservation
    guarantee actually survives a save, rather than holding only until the administrator next presses
    Save.
11. **Source `$preservedSalesRegionIds` from the submitted input instead of the persisted product**
    (`$this->salesRegionIds` rather than `$product->salesRegions`) → the "newly adding an inactive
    region is refused" and "the preserved set is server-derived" tests must both go red. This is the
    security half of D12: a client-supplied preserved list makes the `is_active` / no-heading gate
    universally bypassable while every other test still passes.

### Deliberately not tested, as decisions rather than gaps

- **`HasUuids`, UUIDv7 ordering, route-binding 404s** — proved once against `users` in
  [0001](done/0001-users-uuid-primary-key.md) and re-proved at key-type level by 0016's own model test.
- **`BelongsToMany` / `sync()` internals as framework facts.** These tests assert *this app's* use of
  `sync()`, never that Eloquent's pivot mechanics work in the abstract.
- **Migration `up()`/`down()` mechanics** — `RefreshDatabase` runs every migration on every Feature
  test; `down()` symmetry is a code-review concern.
- **Rate validation** (`decimal:0,3`, `min:0`, `max:100`, the locale comma) and the
  `is_default`/`is_active` single-writer invariants — **0017's, entirely**. This story only *reads* an
  already-validated `rate`.
- **The seeder's idempotency / no-clobber / drift-repair guarantees** — 0016's, entirely.
- **Product CRUD, SKU canonicalisation, description sanitization, gallery mechanics** — 0024's,
  entirely.
- **Address → region resolution** (shipping vs billing, the IP-geo mismatch check) — PRD §3.2 /
  Epic 3. This story's resolver receives an already-resolved region.
- **The picker's rendering, grouping headers and expand interaction** — 0027's / 0022's. This story
  proves only that the options *data* is correct.
- **Authorization** — none exists here by design (**D8**), discharged as a Definition-of-Done hand-off
  to 0027 exactly as 0024 discharged the same gap, not silently assumed safe.
- **"There is no way to invent a region from the product side", as a bare absence assertion** — the
  anti-pattern [errors-log.md](../../docs/errors-log.md) warns against and 0016 already declined once.
  The testable substitute is the España-heading and inactive-region refusals above.

## Expected outcome

A product can be assigned to any number of seeded, active, rateable Sales Region entries — Spain's
fiscal territories among them — through one named action that is the only writer of the
`product_sales_region` pivot, with the "España" heading and every disabled entry refused at the
validation boundary. Asking "what tax rate applies to this product at this destination" returns a
small answer object naming the rate, the entry that decided it, and which tier decided it: the
product's own assigned entry when the destination is one it targets, the catalog default otherwise.
The resolver **never invents a rate** — a `0.000` is honoured as the real 0% it is, and an entry with
no configured rate yields no rate and names itself, rather than quietly substituting a different
region's number. Story 0027 inherits both an assignment action and an options resolver already
conforming to 0022's locked picker contract; Epic 3 inherits a resolver that tells it not just what to
charge but which region to record on the order.

## Acceptance criteria

- [ ] `product_sales_region` exists with `product_id` (FK → `products`, `cascadeOnDelete`) and
      `sales_region_id` (FK → `sales_regions`, `restrictOnDelete`), a composite primary key over the
      two, **and no other column**.
- [ ] Neither FK column carries a redundant hand-written index, verified with
      `php artisan db:table product_sales_region` rather than by reading the migration.
- [ ] A product can be assigned to several region entries at once, including more than one of Spain's
      fiscal territories. *(PRD §2.2: "Assign a product to several sales regions")*
- [ ] Assignment is **declarative** — reassigning replaces the previous set — and assigning the same
      entry twice yields one association.
- [ ] A nonexistent, malformed, inactive, or child-bearing ("España") entry is refused with a
      **validation message**, never a `QueryException` or a 500, and nothing is written.
- [ ] A submitted set containing **any** id the options resolver cannot vouch for fails the **whole**
      save with a message naming the problem — never a partial save of the resolvable remainder.
      *(D11)*
- [ ] Disabling a region already assigned to a product **does not** detach it, and
      `resolveSelected()` still vouches for it so the editor cannot silently drop it. *(D7)*
- [ ] A product carrying a **since-deactivated** (or since-child-bearing) assigned entry remains
      **saveable**: an unrelated field change validates and persists, and the assignment is preserved.
      Newly *adding* an inactive or child-bearing entry is still refused, and the exemption is computed
      from the persisted product, never from the request. *(D12)*
- [ ] The picker's option data offers Spain's five fiscal sub-entries and never "España" itself, in
      story 0022's exact `array{id, label, group, disabled}` shape. *(PRD §2.2: "Selecting Spain
      surfaces its fiscal sub-entries in the region picker" — the data half)*
- [ ] Resolving for a destination the product is assigned to returns **that entry's** rate. *(PRD
      §2.2: "A product's tax uses its assigned region's rate"; Products AC 5)*
- [ ] Resolving for a destination the product is assigned to **no** matching entry for returns the
      **default entry's** rate. *(PRD §2.1: "The default rate applies when no region matches"; Sales
      Regions AC 5)*
- [ ] The answer identifies **which** entry decided the rate and **which tier** decided it, so Epic 3
      can record the sales region used for tax on the order. *(PRD §3.2)*
- [ ] `0.000` is honoured as a real rate at **both** tiers and is never mistaken for unconfigured.
- [ ] An entry with **no configured rate** — assigned or default — yields **no rate**, names itself,
      and never causes another entry's rate to be substituted or a `0` to be fabricated. *(D5)*
- [ ] Matching is by **exact entry**, in exactly two tiers with nothing between them: assignment to a
      parent does not cover its fiscal territories, and assignment to a territory does not cover its
      parent. No grouping tier exists. *(D4, D10)*
- [ ] The rate is a **string** end to end, never coerced to `float`, at both tiers.
- [ ] No route, Livewire component, Blade view, browser test, seeder change or permission-catalog
      change is added.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] All eleven [mandatory revert-checks](#mandatory-revert-checks) performed, each confirmed to
      redden its named test — in particular **#2** (no fall-through on an unconfigured rate),
      **#7** (`resolveSelected()`'s deliberate asymmetry), **#9** (no partial save on a stale id),
      **#10** (a preserved deactivated assignment stays saveable) and **#11** (the preserved set is
      server-derived), the five most likely to be "tidied away".
- [ ] `vendor/bin/pint --dirty --format agent` clean and Larastan level 7 passing — `phpstan.neon`
      analyses `database/`, so the migration is in scope.
- [ ] **`php artisan db:table product_sales_region` run after migrating** and its index list confirmed
      to hold exactly one composite PK plus the FK-supporting index on `sales_region_id`, with **no
      duplicate**. Not verifiable during Phase 1 — no database was reachable from the agent shell.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor).
- [ ] Documentation updated (docs-keeper): `docs/database/schema.md` gains a `product_sales_region`
      section, the ER relationship and the deliberate-index-omission note; `docs/api/routes.md`
      unchanged (no route); `docs/conventions/base-standards.md`'s `app/Actions/` listing is unaffected
      (`Products/` arrives with 0024).
- [ ] **Hand-off recorded for story 0027** (real gaps, not formalities). Four obligations this story
      deliberately does not discharge in code:
      1. Neither action authorizes (**D8**), so 0027 must call `Gate::authorize('update', $product)`
         before `SyncProductSalesRegions` and gate its route with **`can:products.view`, never
         `permission:products.view`**.
      2. The submitted region-id array must be **server-validated** rather than trusted from the
         picker.
      3. `salesRegionIdRules()` must be called **with the persisted product's current region ids**,
         read server-side (**D12**). Calling it with no argument on an *edit* re-introduces the bug
         D12 fixes; calling it with a request-supplied array re-introduces a worse one.
      4. **One `DB::transaction()` must wrap the core-field write and this sync together** (**D13**) —
         `UpdateProduct` (0024) + `SyncProductSalesRegions` (this story) + `SyncProductGallery` (0024)
         in a single boundary, opened *after* validation and after
         `assertSelectionResolvable()`, so no exception can leave a renamed product with a stale
         region set. Neither owning story can open that transaction without reaching into the other's
         files; 0027 is the only place all three compose.
- [ ] **Hand-off recorded for Epic 3**: `ResolvedTaxRate::$region` is the value to snapshot onto the
      order; the default row should be fetched **once per request** and reused across line items
      rather than re-queried per line; and a `rate === null` answer must be surfaced or flagged, never
      silently treated as zero.
- [ ] Acceptance criteria met.

## Documented functional decisions

**D1 — The pivot carries the two FKs and nothing else.** No `position` (no PRD scenario orders a
product's regions — unlike the gallery *strip*, which the PRD explicitly orders), no timestamps
(matching `product_media`), and specifically **no per-assignment rate override**. An override column
would create a fourth precedence tier, a second place a rate can live, and an immediate divergence
question the PRD never poses. If a per-product override is ever wanted it is a story, not a column
added quietly here.

**D2 — Assignment is declarative (`sync`), and lives in its own action.** The PRD's phrasing names a
complete set, and 0027's picker submits a complete set; `attach()` would make deselection a silent
no-op. Keeping it out of `CreateProduct`/`UpdateProduct` means this story edits none of 0024's shipped
files, and 0027 composes the three actions in its save flow.

**D3 — Only an *assignable* entry may be assigned: active, and not a heading over fiscal
territories.** *(Amended 2026-08-19 — scoped to **newly added** ids by **D12**; the reasoning below is
unchanged and still governs that branch.)* Two conditions, both inside the `exists` match rather than
checked afterwards.

> ⚠️ ~~These conditions apply to every submitted id.~~ **Superseded by D12.** They apply to every id
> **not already assigned to the product being edited**. An id already on the product need only still
> exist in the catalog — otherwise D6's "a disabled entry keeps its assignment" guarantee lasts only
> until the administrator next presses Save.

- *Active* mirrors 0017's `replacementDefaultRules()` and its principle that the catalog must offer a
  **usable** entry, not merely a non-null one. An inactive entry seeds with no rate (0016 D7), so
  assigning one produces an assignment that can only ever resolve to "unconfigured".
- *Not a heading* is the answer to "may a product be assigned to España?" — **no**, and it is
  **refused, never silently expanded into its five children**. Silent expansion is a hidden write the
  administrator never requested, which is exactly the shape 0017 rejected when it declined to
  auto-activate a replacement default. The PRD backs refusal directly: *"selecting Spain surfaces its
  fiscal sub-entries in the region picker"* makes España an **expansion trigger in the UI**, never a
  submitted assignment. 0016 D10 independently establishes that España is not rateable at all.
- The rule is **"has children"**, not "slug is `es`". It generalises to Portugal/Madeira/Azores, which
  0016 D3 explicitly anticipates at the same depth with no schema change, and it avoids hardcoding a
  seeded slug into application code — the same objection 0016 D4 raises against magic-string
  dependencies on seed data.

*Recorded dissent:* `backend-qa` recommended **allowing** assignment of inactive entries (pre-wiring a
product before a region goes live). Overruled on the "usable, not merely present" principle above, and
because the picker would then have to offer ~241 rate-less countries. The cost is a workflow
constraint worth stating plainly: **an administrator must enable and configure a region before
products can be assigned to it.** If that ordering proves annoying in practice, relaxing it is a
one-line change to the `exists` rule plus the `search()` scope.

**D4 — Matching is by exact entry. No ancestor walk.** *(Amended 2026-08-18 — its grouping half is
superseded by **D10**.)*

- *No ancestor walk, either direction.* Assignment to Canarias does not cover Península, and
  assignment to the España heading does not cover Canarias. The second follows from D3 (España cannot
  be assigned at all) and from 0016 D10 (its rate is permanently `NULL`, so matching it could only
  ever hand back an unusable answer). The first is the deliberate semantic: the five territories
  *exhaustively partition* Spain fiscally, so an administrator who wants mainland coverage assigns
  Península.
- ~~*No grouping-membership inference.*~~ **Superseded by D10 — groupings no longer exist.** The
  original reasoning is preserved there rather than deleted, because it is why the removal is safe:
  the catalog never carried membership data, so nothing that worked stops working.

**D5 — The resolver never invents a rate, and never substitutes another entry's. One rule, both
tiers.** Precedence decides **which entry wins**; it does not decide **whether that entry has a rate**.
Once an entry wins, its rate is the answer — `'0.000'` if that is what it carries, and `null` if it
carries none, with the entry named in the result either way.

Concretely: an unconfigured **assigned** entry yields `rate: null, region: <that entry>`, and an
unconfigured **default** yields `rate: null, region: <the default>`. Neither falls through, neither
throws, and neither becomes `0`.

*Rejected — falling through an unconfigured match to the default.* **Both amigos recommended this**,
and it is overruled deliberately, so the reasoning is recorded rather than the recommendation being
quietly dropped. Three arguments against: (a) the PRD conditions its fallback on *"a product assigned
to **no region entry matching** a given destination"* — a **match** miss, not a **rate** miss, which is
a precise textual distinction; (b) it produces a confidently wrong number exactly where "no answer" is
the truth — an unconfigured Canarias would be charged Península's 21% IVA, which is the very rate
Canarias exists in the catalog *not* to charge, and the misconfiguration becomes invisible because the
system appears to work; (c) it makes the two sub-cases behave differently depending on *where* the
gap is, where one uniform rule is simpler to reason about and to test.

*Rejected — treating `NULL` as 0%.* Silently under-charges, store-wide and permanently in the default
case, and destroys the `NULL`-vs-`0.000` distinction 0016 and 0017 both built deliberately.

*Rejected — throwing a domain exception.* `backend-expert`'s objection is right: this is a legitimate
incomplete-catalog state, not a programming error, and forcing a low-stakes rate preview in 0027 into
a `try`/`catch` is the wrong shape. This repo throws for *input* problems
(`ValidationException`), and there is no input to blame here. **One exception is retained**: **no
default row existing at all** is a genuine invariant violation (0017 guarantees production cannot
reach it) and throws — following the
[`ImmutableRoleException`](../../app/Exceptions/ImmutableRoleException.php) precedent of a domain
exception in `app/Exceptions/`. It must be distinguishable from an unconfigured rate, or "the
developer forgot to arrange a default" reads as "the administrator hasn't set a rate".

**D6 — `is_active` gates *assignment*, not *resolution*.** An entry already assigned keeps deciding
the rate even after it is disabled. Deactivating a region is a forward-looking catalog decision
(0017's screen), and letting it retroactively re-tax existing products — silently, with no write to
the product — would be a change nobody requested. The reverse also holds: since assignment already
refused inactive entries (D3), the only way to reach this state is a deliberate later deactivation.
Both amigos agree, one explicitly and one structurally.

> ✅ **Completed 2026-08-19 by D12.** This decision was only half-implemented: the pivot row genuinely
> survived deactivation, but the validation rule refused the id on the next save, so the guarantee
> evaporated the moment anything about the product was edited. **D12** exempts already-assigned ids
> from the assignability match, which is what makes D6 true end to end rather than true only until Save.

**D7 — `search()` and `resolveSelected()` are deliberately asymmetric, and the asymmetry prevents
silent data loss.** Story 0022's D4 is unambiguous: *"any id `resolveSelected()` does not vouch for is
silently dropped — from the render **and** from the next dehydrated `$selected`."* So if
`resolveSelected()` filtered on `assignable()` for symmetry with `search()`, then a product assigned
to a since-disabled region would open in 0027's editor with that chip **missing**, and the very next
save would **delete the assignment** — no error, no warning, and a changed tax outcome. Therefore
`search()` offers only assignable entries, while `resolveSelected()` vouches for **every currently
assigned id regardless of `is_active`**, marking a no-longer-assignable one `disabled: true` so the
administrator can see it and remove it deliberately. Revert-check #7 exists precisely because this
asymmetry looks like an inconsistency to a reviewer who has not read this paragraph.

> ✅ **Resolved 2026-08-18 — the data-loss trap this decision worked *around* is now closed at the
> source.** D7 found that 0022's contract silently drops an id `resolveSelected()` declines to vouch
> for, and answered it defensively by making `resolveSelected()` vouch for everything currently
> assigned. The user has since decided the drop itself is wrong: an unresolvable id now **rejects the
> whole save** (**D11**). D7's asymmetry **stands unchanged and is still required** — it is what keeps
> a legitimately-assigned-then-disabled region from being treated as unresolvable and turning a normal
> edit into a rejection. What changes is that D7 is no longer the *only* thing standing between the
> administrator and silent data loss; D11 is now the backstop, and D7 the reason the backstop rarely
> fires. Revert-check #7 remains mandatory.

**D8 — Neither action self-authorizes.** 0024's RQ-10 convention: actions are plain domain
operations, and the caller (0027, or Epic 3's order pipeline) authorizes. The resolver additionally
needs no authorization at its call sites at all — it reads values already visible to anyone holding
`products.view` or `sales-regions.view`, and Epic 3 may invoke it from a queued job with no acting
user. This ships **no enforcement path** for assignment, which is the same acknowledged gap 0024
recorded at D-15 and discharged through a Definition-of-Done hand-off rather than through code.

**D9 — `ResolveProductTaxRate` returns an object, not a `?string`.** PRD §3.2 requires an order to
record *"the Sales Region used for tax resolution"*, so Epic 3 needs to know which entry won, not just
the number — and re-deriving that by running the same logic a second time is how two answers drift
apart. `TaxRateResolutionTier` is an enum rather than a `bool $isExactMatch` because Epic 3 records
*why* a rate applied, and a boolean named after one of its two states reads badly at the call site.

**D10 — Groupings are removed project-wide, so the resolver has exactly two tiers. — 2026-08-18
(confirmed user decision; supersedes D4's second bullet and resolves OQ-1 as moot.)** The Sales Region
catalog no longer contains supranational grouping entries at all: it holds individual countries and
Spain's fiscal sub-territories, and nothing else — see
[0016](done/0016-sales-region-catalog-schema-and-seeder.md)'s scope-change amendment and its D11, where
`SalesRegionKind` drops its `Grouping` case, leaving `country` / `fiscal_territory`.

Consequences here, all subtractive:

- The resolver's algorithm loses its grouping-tier step. It matches a destination against the
  product's assigned entries directly, then falls back to the catalog default. Two tiers, nothing
  between them.
- **OQ-1 is resolved: moot.** It asked whether a grouping match should apply when a destination
  country happens to be an EU member, given the catalog carries no membership data. There are no
  groupings to match, so neither option (a) nor (b) is live. Recorded as resolved rather than deleted,
  because the *reasoning* is what makes the removal cheap: no story ever built country → grouping
  inference, so nothing that worked is being taken away.
- **R-1 is closed** for the same reason, and the "if OQ-1 resolves to (b)" backlog item is withdrawn —
  no membership-data story is needed.
- Grouping-based examples are gone from the Gherkin and the test list, replaced by plain-country
  equivalents that keep each scenario's actual intent (multi-region assignment, resolution against an
  assigned region, fallback to the default when nothing matches).

*Superseded, retained for history:* D4's original position — *"a grouping matches only when it is
itself the destination"* — was correct for the catalog as it then stood, and its `Internacional`-as-
catch-all alternative was rejected there for reasons that no longer need adjudicating. Neither reaches
implementation.

**D11 — An id the options resolver cannot vouch for rejects the whole save. — 2026-08-18 (confirmed
user decision; resolves this story's own D7 finding.)** D7 established that 0022's contract *silently
drops* an unresolvable id — from the render and from the next dehydrated selection — which meant a
stale or tampered id in a submitted set would produce a quiet partial save with a changed tax outcome
and no error anywhere. The user's decision is that silent narrowing is never acceptable: **if any
submitted id is stale, unknown or otherwise unresolvable, the entire assignment fails.**

- 0022's amendment is **published** (its D12). The mechanism this story consumes rather than inventing
  a parallel one: `resolveSelected()` is a **total function** that throws
  `App\Exceptions\UnresolvedSelectionException` (`app/Exceptions/UnresolvedSelectionException.php`, no
  `render()`) carrying `public readonly array $missingIds`, and a consumer calls the shell's
  `assertSelectionResolvable()` in its save path to convert it into a `ValidationException`.
- The enforcement point here is the existing per-element `salesRegionIds.*` rule: a single failing
  element fails the request, so `SyncProductSalesRegions` is **never invoked** and no subset is
  written. No new action-level check is introduced, and OQ-2 is unaffected.
- The refusal must **name the problem** (a `lang/{en,es}/products.php` key, key-for-key in both
  files), so an administrator learns *which* region went stale instead of watching a chip vanish.
- Revert-check **#9** pins it, asserting on the **pivot contents** rather than on the exception alone —
  the regression this replaces produces a successful-looking save.

*Superseded, retained for history:* this story previously treated the silent drop as an immovable
property of 0022's contract and worked around it entirely through D7's `resolveSelected()` asymmetry.
That asymmetry is still required (see D7's resolution note) but is no longer load-bearing on its own.

**D12 — Validation gates *newly added* ids, not *preserved* ones. — 2026-08-19 (bug found by story
[0027](0027-products-list-and-editor-ui.md) while building the picker, raised there as its OQ-5;
supersedes the unconditional form of `salesRegionIdRules()` this story shipped at D3.)**

*The bug.* `salesRegionIdRules()` applied `is_active = true` + no-children to **every** submitted
element, and 0027's picker submits the **complete** set — preserved assignments included. So a product
holding a since-deactivated region (a state **D6** guarantees is reachable, and **D7** goes out of its
way to keep visible in the editor) became **unsaveable**: an administrator changing only the product's
*name* would have the whole save refused, because the preserved region's id was re-checked as if it
were a brand-new submission. D6 promises the assignment survives deactivation and D7 promises the chip
still renders; the validation rule then quietly withdrew both at the next Save. Worse, the only
"remedy" the error message offered was to remove the region — i.e. the exact silent data loss D7 and
D11 exist to prevent, converted into loss the administrator performs by hand.

*The rule.* An id's treatment depends on whether it is **new to this product**:

| Submitted id | Must satisfy | Why |
| --- | --- | --- |
| Already assigned before this request (**preserved**) | the entry still **exists** in the catalog | it is being kept, not chosen; refusing it destroys an assignment the administrator never touched |
| Not previously assigned (**newly added**) | exists **and** `is_active` **and** no children | D3 unchanged — a user must not be able to newly assign an inactive entry or the "España" heading |

*The mechanism.* One rule, not two passes. `salesRegionIdRules(array $preservedSalesRegionIds = [])`
keeps its single per-element `Rule::exists`, and the exemption becomes a second branch **inside the
same match**: `(active AND no children) OR id IN (preserved)`. This preserves D3's own principle — the
conditions live in the `exists` match, never in a follow-up `if` — and keeps the enforcement point
exactly where **D11** put it, so a single bad element still fails the request and
`SyncProductSalesRegions` is still never invoked. Three constraints, each with a real failure mode:

- **The OR is wrapped in its own nested group.** `Exists` applies the closure to the top-level count
  query that already carries `where id = <value>`, so an ungrouped `orWhereIn` matches every id.
- **`$preservedSalesRegionIds` is read from the persisted product**, `$product->salesRegions`, never
  from the request. A client-supplied preserved list turns the whole gate off. Revert-check **#11**.
- **Create passes `[]`**, which compiles to `or 0 = 1` — a create is therefore bit-for-bit the
  pre-D12 strict rule, with no branch of its own to keep in sync.

*Rejected — computing the delta and running two validation passes* (`array_diff($submitted, $current)`
validated strictly, the remainder validated for existence only). It is the same rule and it was the
first shape considered, but it splits one field's rules across two `validate()` calls with two error
bags, so `salesRegionIds.*`'s per-element message indices no longer line up with the submitted array —
and D11 requires the refusal to **name the offending id**. Recorded because it is the shape a reviewer
will reach for; the single-rule form above is equivalent and keeps one error bag.

*Rejected — dropping the `is_active` condition entirely* (`backend-qa`'s original D3 dissent, which
this bug superficially vindicates). It does not: the dissent was about pre-wiring a product to a
not-yet-live region, which is still refused, and dropping the condition would also make the ~241
rate-less countries assignable. D12 is narrower — it exempts only what is already assigned.

*Superseded, retained for history:* **D3**'s "two conditions, both inside the `exists` match" and the
unconditional rule body under *Files to create/modify* described the rule as applying to every
submitted id. That is now true only of newly added ones. D3's *reasoning* — active means usable, a
heading is an expansion trigger and never an assignment, the rule is "has children" and not a hardcoded
slug — is unchanged and still governs the newly-added branch.

**D13 — Atomicity across the core-field write and the region sync is 0027's, and it is a hand-off, not
an assumption. — 2026-08-19 (gap found by story
[0027](0027-products-list-and-editor-ui.md).)** Nothing in this story previously said the product's
own update and its region sync must commit or fail together. Without a boundary, a `sync()` that throws
after `UpdateProduct` has already committed leaves a renamed product wearing its **old** tax reach — a
silently wrong tax outcome with a successful-looking save behind it.

*Where the transaction belongs, and why not here.* Three candidates were weighed:

- **Inside `SyncProductSalesRegions`** — rejected. It writes one table; a transaction around a single
  `sync()` buys nothing, and it cannot reach the product's core-field write, which lives in a sibling
  story's action. It would look like the problem was solved while leaving it entirely open.
- **Inside `UpdateProduct` (0024)** — rejected. 0024 is the products-core owner and must not know that
  a region pivot exists; making it call `SyncProductSalesRegions` would invert the dependency (0024 is
  this story's blocking dependency, not its consumer) and force this story to edit a sibling's shipped
  action, which **D2** already refuses on the same grounds.
- **A new orchestration action in this story** (e.g. `SaveProductWithRegions`) — rejected. It would
  have to compose 0024's `UpdateProduct` *and* `SyncProductGallery` to be honest about the real save,
  which is precisely the reach-into-a-sibling's-scope this story avoids, and it would leave 0024's own
  callers with a second, differently-shaped save path.

*Therefore it is genuinely a shared-orchestration concern, and it is discharged as an explicit
obligation on 0027* — the same shape as story 0036 handing `Gate::authorize()` wiring to 0037 rather
than pretending the gap did not exist. **Story 0027 must wrap `UpdateProduct` (or `CreateProduct`),
`SyncProductSalesRegions` and `SyncProductGallery` in one `DB::transaction()`**, opened *after*
validation and after `assertSelectionResolvable()` so a `ValidationException` never travels through an
open transaction. Recorded as Definition-of-Done hand-off item 4, and as risk **R-10**.

*What this story owes in return*, and all it owes: `SyncProductSalesRegions` opens **no** transaction
of its own and swallows **no** exception, so it is safe to call inside a caller-opened one and cannot
commit past a failure. Nested `DB::transaction()` calls in Laravel become savepoints rather than
errors, so an inner one would not break — it would simply not be the guarantee anyone needs. No Gherkin
scenario is added here: the behaviour is unobservable in a backend-only story that never composes the
two writers, so the scenario proving it belongs to 0027.

**D14 — `SyncProductGallery` is 0024's alone; product media is entirely out of this story's scope. —
2026-08-19 (ownership clarification, coordinated with
[0024](0024-products-core-crud-backend.md).)** This story handles **sales-region assignment only**. It
does not create, call, wrap, extend, test or specify `SyncProductGallery`, and no obligation about
product media attaches to it. Every remaining mention of that class here is a deliberate *analogy* —
"a single named writer of one pivot, shaped like the sibling that writes the other" — or a hand-off
sentence about what **0027** composes in its own save path.

*Superseded, retained for history:* the `SyncProductSalesRegions` section previously read "mirroring
0024's `SyncProductGallery`" and "exactly as it wires in `SyncProductGallery`". Neither claimed
ownership, but both put the class close enough to this story's file list to be misread as a
co-ownership or a call site. Reworded to say plainly what is true. The `product_media` comparisons in
**D1** and the migration table (composite PK, no timestamps) are likewise citations of 0024's schema
decisions, not claims on them, and the *"gallery mechanics — 0024's, entirely"* line under
[Deliberately not tested](#deliberately-not-tested-as-decisions-rather-than-gaps) was already correct
and stands.

## Dependencies, risks and open questions

### Verified findings

Executed during this debate, against this repository.

- **V-1 — `product_sales_region` is the table name Laravel itself infers.** Read from
  `HasRelationships::joiningTable()` in the installed vendor tree: it snake-cases both basenames,
  `sort()`s them, and joins with `_`. No relation-level override is required.
- **V-2 — `constrained()` infers both parent tables correctly**, `products` from `product_id` and
  `sales_regions` from `sales_region_id`. Probed against the real `MySqlGrammar`. This story does not
  hit 0024's `featured_media_id` → `featured_media` trap (V-4) nor 0016's `parent_id` → `parents`
  trap.
- **V-3 — The migration as written emits exactly three DDL statements and zero index statements**;
  adding `$table->index('sales_region_id')` emits a fourth, duplicating the index MySQL auto-creates
  for the FK. Probed by building the `Blueprint` against `MySqlConnection` +
  `useDefaultSchemaGrammar()` and reading `toSql()`.
- **V-4 — No database is reachable from the agent shell** (`php artisan db:table users` fails with
  `getaddrinfo for mysql failed`), which is why V-1–V-3 were obtained from the grammar rather than
  from a live schema, and why `db:table` verification is a Definition-of-Done item.
- **V-5 — None of the three dependencies exists in code.** `app/Models/` holds only `Role.php` and
  `User.php`; there is no `products` or `sales_regions` migration and no `app/Actions/Products/`.
  0016, 0017 and 0024 are all still design documents.
- **V-6 — Story 0022 already names this story's resolver class**, `\App\Actions\Products\SearchSalesRegions::class`,
  in its own confirmed consumer example, and locks the `MultiSelectOptionsResolver` interface and the
  `array{id, label, group, disabled}` option shape.

### Dependencies

- **[0024](0024-products-core-crud-backend.md) — hard, blocking.** Creates `products`, `Product`,
  `ProductFactory` and `ProductValidationRules`, all of which this story extends.
- **[0016](done/0016-sales-region-catalog-schema-and-seeder.md) — hard, blocking.** Creates
  `sales_regions`, `SalesRegion`, `SalesRegionKind` and `SalesRegionFactory`.
- **[0017](done/0017-sales-region-tax-configuration-backend.md) — hard, blocking.** Nothing in this story
  calls its code, but the resolver's entire fallback tier rests on 0017's enforced "exactly one
  default, and it is active" invariant. Without it the default lookup has no guarantee behind it.
- **[0022](in-progress/0022-searchable-multi-select-component.md) — hard, blocking, and easy to miss.**
  `SearchSalesRegions` implements 0022's `MultiSelectOptionsResolver` interface, which 0022 creates.
  Numbering already satisfies [workflow.md](../../docs/workflow.md#task-ordering-rule); what must be
  enforced is the **sequencing** — all four reach Phase 7 before 0026 starts Phase 3.
- **Story 0027 depends on this one** (the paired UI), consuming both the assignment action and the
  options resolver.
- **No new Composer package. No new permission. No seeder change.**

### Risks

- ~~**R-1 — The grouping-matching ambiguity (D4 / OQ-1).**~~ **Closed 2026-08-18 by D10** — groupings
  are removed from the catalog project-wide, so there is no ambiguity left to resolve and no
  EU-membership data source is needed. Retained struck-through rather than deleted, because it was
  this story's highest-rated risk and its disappearance is a real reduction in scope, not an oversight.
- **R-2 — Overruling a 2-0 specialist recommendation on D5.** Both amigos recommended falling through
  an unconfigured match to the default; this story does the opposite. The reasoning is recorded in
  full and revert-check #2 pins it, but Phase 2 should treat it as a decision to re-examine rather
  than inherit.
- **R-3 — `resolveSelected()` "tidied" into symmetry with `search()` (D7).** Downgraded but not
  closed by **D11**: with rejection replacing the silent drop, the failure mode is no longer invisible
  data loss but a **spurious rejection** — a product assigned to a since-disabled region becomes
  unsaveable, blocking an edit for no legitimate reason. Revert-check #7 still catches it, and the
  asymmetry still looks like a bug to anyone who has not read D7.
- ~~**R-9 — 0022's amended contract is not yet published.**~~ **Resolved 2026-08-18 — published and
  substituted into this document.** Both pieces this story depends on are now locked in 0022 and named
  concretely above, so nothing here is implemented against a guessed shape:
  - **Unresolved-id rejection (D11 / [0022 D12](in-progress/0022-searchable-multi-select-component.md#d12--an-unresolvable-id-is-rejected-never-silently-dropped-confirmed))** —
    `resolveSelected()` is a total function throwing `App\Exceptions\UnresolvedSelectionException`
    (`app/Exceptions/UnresolvedSelectionException.php`, modelled on `ImmutableRoleException`, no
    `render()`) with `public readonly array $missingIds`; the consumer calls
    `assertSelectionResolvable()` in its save path and converts it to a `ValidationException`.
  - **Centralized normalizer ([0022 D13](in-progress/0022-searchable-multi-select-component.md#d13--one-centralized-search-term-normalizer-appactionsnormalizeforsearch-confirmed))** —
    `App\Actions\NormalizeForSearch` at `app/Actions/NormalizeForSearch.php`, invokable,
    `__invoke(string $value): string`, `trim` → `Str::lower` → `Str::ascii` → collapse whitespace.
    Both classes are **created and unit-tested by 0022**, not by this story; 0026 is their first
    real-save-path consumer. Retained struck-through rather than deleted so Phase 2 can see the risk
    was closed rather than dropped.
- **R-4 — Assignability enforced only in validation.** `SyncProductSalesRegions` itself does not
  re-check that each id is active and childless, so a future Artisan command or importer calling the
  action directly bypasses D3 entirely — the exact failure mode
  [livewire-authorization.md](../../docs/security/livewire-authorization.md) documents, and the one
  0017 answered by re-checking inside `SetDefaultSalesRegion`. Not adopted here because the pivot has
  no invariant to protect (an unassignable assignment is untidy, not corrupting) and because the
  database FK already refuses a nonexistent id. **Recorded as a deliberate, arguable asymmetry with
  0017** — see [OQ-2](#open-questions).
- **R-5 — `decimal` as a string.** `@property ?float $rate` and `if ($rate > 0)` are the two likeliest
  bugs, and both read as correct. Inherited verbatim from 0016 and 0024 R-4. The tests pin the type at
  both tiers.
- **R-6 — Three stories write `lang/{en,es}/products.php`** (0024 creates, 0028 extends, 0026
  extends). 0024's R-13 with one more writer.
- **R-7 — CI cannot open a database connection.** 0024's **V-1** found `phpunit.xml` never sets
  `DB_CONNECTION`, `.env.example` ships `sqlite` with `DB_DATABASE` commented out, and the workflow
  stands up neither a MySQL service nor a SQLite file. Not this story's bug, and 0024 already
  recommends raising it as its own task — but until it lands, this story's Full Test Suite Gate
  evidence can only come from a local MySQL run. None of this story's assertions are
  collation-sensitive (UUID equality, decimal-string equality, boolean casts), so the exposure is
  "can the suite run at all", not "does an assertion behave differently per engine".
- **R-8 — The workflow constraint D3 imposes.** An administrator must enable and rate-configure a
  region before any product can be assigned to it. Correct, but it is a real sequencing requirement
  that 0027's UX should make legible rather than surfacing as a bare validation error. **Narrowed
  2026-08-19 by D12** — it binds *newly added* regions only, so it no longer strands an existing
  product whose region was disabled after the fact.
- **R-10 — The transaction boundary is a hand-off, and hand-offs are what get dropped (D13).** Nothing
  in *this* story's tests can fail if 0027 forgets the `DB::transaction()`; the failure surfaces only
  as a rare, silent inconsistency in production (a renamed product wearing its old tax reach). Phase 2
  should confirm 0027 carries the obligation as an acceptance criterion of its own rather than as a
  sentence in a dependency's document — the same follow-through 0036 → 0037 needed for
  `Gate::authorize()`.
- **R-11 — D12's exemption is the kind of rule a reviewer "tidies" into symmetry (D12).** Like D7's
  asymmetry before it, `(assignable) OR (already assigned)` reads as a loophole to anyone who has not
  read D12, and the two obvious simplifications fail in opposite directions: dropping the OR branch
  makes an edited product unsaveable, while flattening the nested group makes every id valid.
  Revert-checks **#10** and **#11** pin both. The grouping trap in particular is invisible in the
  Blade/PHP source and only shows up in the compiled SQL — verify it by dumping the query, not by
  reading the closure.

### Open questions

Non-blocking for the schema; **confirm before Phase 3.**

1. ✅ **OQ-1 — Does a grouping automatically cover its member countries? — RESOLVED 2026-08-18: moot.**
   **Groupings removed project-wide** by user decision, so neither option is live — see **D10** and
   [0016](done/0016-sales-region-catalog-schema-and-seeder.md)'s amendment. The resolver matches assigned
   entries directly against the destination and falls back to the default; there is no grouping tier.
   Kept as a numbered, resolved item rather than deleted, so Phase 2 can see the question was answered
   rather than dropped.
2. **OQ-2 — Should `SyncProductSalesRegions` re-assert assignability inside itself?** *(R-4)*
   - **(a) No — validation owns it *(recommended)*.** The pivot has no invariant to corrupt, and the
     FK already refuses a nonexistent id; adding a second enforcement point means a second place to
     keep in sync.
   - (b) Yes — mirror 0017's `SetDefaultSalesRegion`, which re-checks `is_active` inside the action
     precisely so every call site inherits the rule. Defensible, and the more conservative choice if
     an importer or Artisan command is expected soon.
   - ⚠️ **Updated 2026-08-19 (D12): (b) got harder, and (a) got stronger.** A naïve action-level
     `is_active` re-check would re-introduce exactly the bug D12 just fixed — every `sync()` on a
     product holding a since-deactivated region would throw. To choose (b), the action would have to
     compute the same preserved-vs-new delta the validation rule does, i.e. read the product's current
     pivot before writing it, making it a second copy of D12's rule in a second place. That is the
     "second place to keep in sync" (a) already warned about, now with a concrete failure mode.
3. **OQ-3 — Where should `ResolvedTaxRate` live?**
   - **(a) `app/Actions/Products/`, beside its only producer *(recommended)*.** Needs no new base
     folder, so no `CLAUDE.md` approval is required.
   - (b) A new `app/DataTransferObjects/`. Cleaner conceptually, but creating a base folder Laravel
     does not ship **requires explicit approval** per project `CLAUDE.md`, and it would be this
     repo's first DTO folder — a convention decision larger than this story.
4. **OQ-4 — Should the picker's labels be qualified (`"España (Península)"`) or grouped
   (`label: "Península"`, `group: "España"`)?** Recommended: **qualified**, matching PRD §2.1's own
   spelling and 0022's D3 expectation of a flat list for this consumer, and making a selected chip
   self-describing. Switching to grouped later is purely additive to this resolver and changes
   nothing in 0022's shell or 0027's binding.

### Larastan level 7 notes

- `@property string|null $rate` on `SalesRegion` and `?string $rate` on `ResolvedTaxRate` — **never
  `float`**. Nothing in this story does arithmetic on a rate (the resolver compares `=== null` and
  returns the string), so no `bccomp()` is needed *here*; Epic 3 inherits the obligation, with both
  operands already strings.
- Relation generics take the two-parameter form: `BelongsToMany<SalesRegion, $this>`.
- `SyncProductSalesRegions::__invoke()` needs `@param array<int, string> $salesRegionIds` — UUID
  strings, not ints, unlike `UpdateUser`'s `syncRoles([(int) $roleId])`.
- `Rule::exists()->where(Closure)` returns `Exists`, which is `Stringable` but not a `ValidationRule`
  — keep the trait methods' return type as
  `array<int, ValidationRule|array<mixed>|string>`, copying `UserValidationRules` verbatim rather than
  narrowing it.
- Scope closures may need `Closure(Builder<SalesRegion>): void` PHPDoc; confirm against the real
  `phpstan.neon` run rather than assuming.
- `salesRegionIdRules()` needs `@param array<int, string> $preservedSalesRegionIds` (**D12**) — UUID
  strings again, and the default `[]` must stay a **list**, not an associative array, since
  `pluck('id')->all()` returns one and `orWhereIn` binds positionally. If the caller ever builds it by
  filtering, re-key with `array_values()`.
- D12's nested `where(Closure)` closures inside `Rule::exists()` are `Illuminate\Database\Query\Builder`,
  **not** `Eloquent\Builder` — the presence verifier runs a query-builder count. Importing the wrong
  `Builder` here is a Larastan error rather than a runtime one, which is the good outcome; the existing
  rule already has this shape, D12 only nests it deeper.
- `final readonly class ResolvedTaxRate` with promoted typed properties needs no extra annotation.

## Technical tasks for later backlog

- **Correct [`migrations.md`](../../docs/database/migrations.md#structure)'s explicit-FK-index
  instruction** — already owned by 0024's D-10; this story is the second table it would damage, and
  V-3 is a second independent confirmation.
- **Raise CI's database configuration as its own task** (0024 V-1 / R-7). It blocks the Full Test
  Suite Gate from being satisfiable in CI for every story, not just this one.
- ~~**If OQ-1 resolves to (b)**, a story to model grouping membership.~~ **Withdrawn 2026-08-18 (D10)**
  — groupings are removed from the catalog, so no membership data is ever needed.
- **Docs to update at Phase 6:** `docs/database/schema.md` (a `product_sales_region` section, the ER
  relationship, the index-omission note), and — once Epic 3 exists — a note on where
  `ResolvedTaxRate::$region` is snapshotted.

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-18 per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate), grounded in full readings of
[0016](done/0016-sales-region-catalog-schema-and-seeder.md),
[0017](done/0017-sales-region-tax-configuration-backend.md),
[0024](0024-products-core-crud-backend.md), [PRD](../../docs/PRD/PRD.md) §2.1 / §2.2 / §3.2, and this
project's conventions, security and testing doc sets.

**Participants, and one honest gap:**

- `backend-expert` — convened and returned. Its file list, resolver signature, `sync()` reasoning,
  `scopeAssignable()` proposal, "any row with children is refused" generalisation and Larastan notes
  are reflected above.
- `backend-qa` — convened and returned. Its test plan, the revert-check set, the trap analysis around
  `empty()`-vs-truthiness on `'0.000'`, and the "no default row exists at all" edge case are reflected
  above.
- `database-expert` — **dispatch refused; the concurrent subagent pool was saturated.** Per the
  coordinator's standing instruction, `product-owner` covered the database role **directly** rather
  than blocking: the pivot shape, PK choice, FK delete semantics, index analysis and the
  `is_default`/`parent_id` index re-examination above are `product-owner`'s own work, verified by
  probing the real schema grammar (V-1–V-3) rather than reasoned from memory. It carries **no
  independent specialist review**, which is exactly the single-source weakness
  [errors-log.md](../../docs/errors-log.md) records for the `getOriginal()`/`getPrevious()` mistake.
  **Re-convene `database-expert` on this document before Phase 3.**

**Two places this document departs from a specialist's recommendation**, recorded so Phase 2 sees them
as decisions rather than oversights:

1. **D5** overrules a **2-0** recommendation (both amigos favoured falling an unconfigured match
   through to the default). Reasoning in full at D5; risk logged at R-2.
2. **The options-data half.** `backend-expert` recommended shipping *no* options class, arguing no
   consumer exists to validate the shape. That argument rests on a fact that is not true:
   `product-owner` found (V-6) that story **0022** already locks the `MultiSelectOptionsResolver`
   interface, the exact option array shape, **and this class's name**. `backend-expert` was not
   pointed at 0022 in its brief — a briefing error by `product-owner`, not a reasoning error by the
   agent. D7's `resolveSelected()` asymmetry and the data-loss trap it prevents are likewise
   `product-owner`'s findings and have had no specialist review.

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Two items deserve explicit attention
there. **Size**: this story carries a migration, two actions, an options resolver, a DTO, an enum, two
model changes and a validation trait extension — whether it still satisfies INVEST's "Small" is a fair
challenge, and the obvious cut line (splitting assignment from resolution) is closed by the confirmed
Phase 0 bundling decision, so any split would have to fall elsewhere — the options resolver being the
most separable piece. **Open questions**: OQ-1 is now **resolved** (D10); OQ-2–OQ-4 remain, and should
be answered before Phase 3 the same way 0017's seven questions were resolved before its own.

**Amended 2026-08-19** with three findings raised by story
[0027](0027-products-list-and-editor-ui.md) while building the product editor that consumes this
story — **D12** (validation must exempt already-assigned ids, or a product holding a since-deactivated
region becomes unsaveable; raised there as OQ-5), **D13** (no transaction spanned the core-field write
and the region sync — assigned to 0027 as an explicit orchestration hand-off) and **D14** (an ownership
clarification: `SyncProductGallery` and product media are 0024's exclusively and out of this story's
scope entirely). D12 adds revert-checks **#10** and **#11** and risks **R-10**/**R-11**; superseded
wording in D3, D6 and R-8 is marked rather than deleted. None of the three has had specialist review —
fold them into the `database-expert` re-convention already required before Phase 3, which should now
also check D12's compiled SQL (the nested-group trap) rather than only the resolver's query shape.

**Amended 2026-08-18** with two confirmed user decisions taken outside this debate — **D10**
(groupings removed project-wide, resolving OQ-1 and closing R-1) and **D11** (an unresolvable
submitted id rejects the whole save, resolving this story's own D7 data-loss finding). Both are
recorded as new dated decisions with the superseded reasoning marked rather than deleted. Neither has
had specialist review; the `database-expert` re-convention already required before Phase 3 should
cover D10's effect on the resolver's query shape, and **R-9** tracks the 0022 contract details both
decisions depend on.
