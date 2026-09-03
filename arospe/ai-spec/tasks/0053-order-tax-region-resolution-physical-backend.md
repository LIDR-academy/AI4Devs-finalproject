# [0053] Order tax Sales-Region resolution — physical products (backend)

## Description
Resolve an order's tax **Sales Region** from the order's own frozen **shipping address**, for orders
whose line items are **all physical products**, per PRD
[§3.2 Orders](../../docs/PRD/PRD.md#32-orders): *"Physical product → the Sales Region is resolved from
the order's shipping address"*, and *"the region entry's rate is used, falling back to the default entry
when no matching entry applies"*. It ships one action — `App\Actions\Orders\ResolveOrderTaxRegion` —
which writes `orders.sales_region_id`, **snapshots** `orders.tax_rate`, and — since the **D-13**
amendment — derives `orders.tax_amount` and re-derives `orders.total` in the same write, and which is
invoked explicitly by the caller **after** [0045](0045-orders-core-crud-backend.md)'s `CreateOrder`
returns. No route, no Livewire component, no Blade markup, no migration and no new permission.

> **Amended after composition (D-13).** As first composed, this story deliberately wrote **no** tax
> arithmetic and left `tax_amount` / `total` to whichever story answered its own **OQ-1**. That gap is
> now closed here, because sibling story [0054](0054-order-tax-region-resolution-virtual-backend.md) —
> composed later — computes both in its own resolution action, so leaving them out here would ship a
> freshly-created **physical** order displaying a resolved `tax_rate` of `21.000` beside a
> `tax_amount` of `0.00` while an otherwise-identical **virtual** order showed both. Story
> [0055](0055-orders-list-detail-editor-ui.md) recorded exactly that as its **R-6** / **OQ-1**,
> *"BLOCKING for the epic"*. **D-13** adopts 0054's computation verbatim; **OQ-1** below is marked
> resolved rather than deleted.

> ## ⛔ BLOCKED — inherited cross-epic dependency (read this before Phase 3)
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until story
> [0045](0045-orders-core-crud-backend.md) is `done` — and 0045 is itself blocked** on PRD Epic 2
> stories [0024](done/0024-products-core-crud-backend.md) (Products),
> [0029](0029-product-variants-backend.md) (Product Variants),
> [0035](0035-shipping-carriers-backend.md), [0036](0036-shipping-rate-rules-backend.md) and
> [0038](0038-payment-methods-bank-transfer-backend.md).
>
> This story writes to `orders.sales_region_id`, `orders.tax_rate`, `orders.tax_amount`, `orders.total`
> and `orders.flagged_for_review`, and reads `orders.subtotal`, `orders.shipping_amount`,
> `orders.shipping_country` / `orders.shipping_postal_code` plus `order_items.product_id` — **ten
> columns on two tables that do not exist in code yet.** It additionally reads `products.type`
> (`App\Enums\ProductType`), which is 0024's.
>
> **What is *not* blocked:** this document. It is specified now for the same reason 0045 was — so the
> forward dependency on `products.type` and on the order's *own* address snapshot is visible while it is
> still cheap to honour, and so 0045's already-written **D-4** (the twelve frozen address columns) has a
> named consumer rather than a hypothetical one.

## Type
backend | includes database-expert: **yes**

### Three Amigos participants

- `backend-expert` — the action's shape and call site, the country→region matching key, the Spain
  postal-prefix map, the "no `Gate::authorize()`" position, and the scope fence against
  `flagged_for_review`.
- `backend-qa` — risk-based test design: the five-way Spain territory dataset, the inactive-region
  silent-failure case (flagged as the highest-risk case in the story), and the null-address case.
- `database-expert` — confirmation that `slug = strtolower(alpha2)` is the reliable matching key,
  confirmation that `sales_regions` carries **no** postal-code or province column, the "no new index"
  finding, and the fallback recommendation adopted as **D-6**.

### Why this is a separate action rather than part of `CreateOrder`

0045 is closed as specified and its scope fence states outright: *"Must **not** resolve a Sales Region,
compute a tax amount, or set `flagged_for_review` (0053/0054)."* Folding this logic into `CreateOrder`
would reopen that story rather than build on it. `ResolveOrderTaxRegion` is therefore an independent,
container-resolved action whose contract is simply **"callable against a persisted order"** — see
**D-8** for what that means for sequencing, and **D-9** for why this story deliberately does *not*
introduce a domain-event architecture to do it.

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Resolving an order's tax Sales Region from its shipping address (physical products)

  # --- PRD §3.2's two physical-tax scenarios ---

  Scenario: A physical product's order resolves its tax region from the shipping address
    Given an order administrator, with an existing order whose only line item is a physical product
      shipping to an active, rated region
    When the order's Sales Region is resolved
    Then the order records that region as the one used for tax

  Scenario: The resolved region's own rate is snapshotted onto the order
    Given an order administrator, with an existing order shipping to a region rated at 21.000
    When the order's Sales Region is resolved
    Then the order records a tax rate of 21.000

  Scenario: The default entry's rate applies when no region matches the destination
    Given an order administrator, with an existing order shipping to a country the catalog
      has not activated
    When the order's Sales Region is resolved
    Then the default catalog entry decides the rate

  # --- Spain's fiscal territories ---

  Scenario: An order shipping to mainland Spain resolves to the Península entry
    Given an order administrator, with an existing order shipping to a Madrid postal code
    When the order's Sales Region is resolved
    Then the order records the Península entry as the one used for tax

  Scenario: An order shipping to the Balearic Islands resolves to the Baleares entry
    Given an order administrator, with an existing order shipping to a Palma postal code
    When the order's Sales Region is resolved
    Then the order records the Baleares entry as the one used for tax

  Scenario: An order shipping to the Canary Islands resolves to the Canarias entry
    Given an order administrator, with an existing order shipping to a Las Palmas postal code
    When the order's Sales Region is resolved
    Then the order records the Canarias entry as the one used for tax

  Scenario: An order shipping to Ceuta resolves to the Ceuta entry
    Given an order administrator, with an existing order shipping to a Ceuta postal code
    When the order's Sales Region is resolved
    Then the order records the Ceuta entry as the one used for tax

  Scenario: An order shipping to Melilla resolves to the Melilla entry
    Given an order administrator, with an existing order shipping to a Melilla postal code
    When the order's Sales Region is resolved
    Then the order records the Melilla entry as the one used for tax

  Scenario: A Spanish order never resolves to the España heading itself
    Given an order administrator, with an existing order shipping to a Spanish postal code
    When the order's Sales Region is resolved
    Then the order records one of Spain's five fiscal territories rather than the España entry,
      which is a heading over them rather than a rateable entry

  # --- Ambiguity is recorded rather than guessed ---

  Scenario: A Spanish order with an unrecognised postal code falls back and is flagged
    Given an order administrator, with an existing order shipping to Spain with no postal code
    When the order's Sales Region is resolved
    Then the default catalog entry decides the rate,
      and the order is flagged for manual review

  Scenario: An order shipping to a region the catalog has not activated is flagged
    Given an order administrator, with an existing order shipping to a country whose
      catalog entry is not active
    When the order's Sales Region is resolved
    Then the default catalog entry decides the rate,
      and the order is flagged for manual review

  Scenario: An order shipping to a country absent from the catalog is flagged
    Given an order administrator, with an existing order whose shipping country matches
      no catalog entry at all
    When the order's Sales Region is resolved
    Then the default catalog entry decides the rate,
      and the order is flagged for manual review

  Scenario: An order with no shipping address is flagged rather than rejected
    Given an order administrator, with an existing order for a customer holding no addresses
    When the order's Sales Region is resolved
    Then the default catalog entry decides the rate,
      and the order is flagged for manual review

  Scenario: A resolved region carrying no configured rate is flagged
    Given an order administrator, with an existing order shipping to an active region
      whose rate has never been configured
    When the order's Sales Region is resolved
    Then the order records that region as the one used for tax,
      records no tax rate,
      and is flagged for manual review

  # --- The order's own frozen address decides, never the customer's live one ---

  Scenario: A later change to the customer's address does not change a resolved order's region
    Given an order administrator, with an order already resolved to the Península entry
    When that customer's shipping address is subsequently changed to the Canary Islands
    Then the order still records the Península entry as the one used for tax

  Scenario: A later change to the region's rate does not move an already-resolved order
    Given an order administrator, with an order already resolved at a rate of 21.000
    When a tax administrator changes that region's configured rate to 10.000
    Then the order still records a tax rate of 21.000

  # --- Product type decides which story owns the order ---

  Scenario: An order whose line items are all physical is resolved by this story
    Given an order administrator, with an existing order whose three line items are all
      physical products
    When the order's Sales Region is resolved from the shipping address
    Then the order records a sales region and a tax rate

  Scenario: An order containing a virtual line item is left untouched
    Given an order administrator, with an existing order whose single line item is a
      virtual product
    When the shipping-address resolution runs
    Then the order records no sales region and no tax rate,
      billing-address resolution being a separate concern

  Scenario: An order mixing physical and virtual line items is flagged rather than resolved
    Given an order administrator, with an existing order carrying one physical and one
      virtual line item
    When the shipping-address resolution runs
    Then the order records no sales region and no tax rate, its tax amount and total are
      exactly as they stood before, and it is flagged for manual review

  # --- The computed tax amount and total (D-13) ---

  Scenario: The order's total absorbs the computed tax amount
    Given an order administrator, with an order subtotalling 100.00 resolving to a 21% region
    When the order's Sales Region is resolved
    Then the order records a tax amount of 21.00 and a total of 121.00

  Scenario: A resolved region with a zero rate produces a zero tax amount
    Given an order administrator, with an order subtotalling 100.00 resolving to a region whose
      configured rate is zero percent
    When the order's Sales Region is resolved
    Then the order records a tax amount of 0.00 and a total of 100.00

  Scenario: A resolved region with no configured rate invents no tax
    Given an order administrator, with an order subtotalling 100.00 resolving to a region
      carrying no configured rate
    When the order's Sales Region is resolved
    Then the order records no tax rate, a tax amount of 0.00 and a total of 100.00,
      and is flagged for manual review

  Scenario: An order left untouched by this resolution keeps its existing tax amount
    Given an order administrator, with an existing order whose single line item is a
      virtual product
    When the shipping-address resolution runs
    Then the order's tax amount and total are exactly as they stood before

  # --- Re-running the resolution ---

  Scenario: Re-resolving an already-resolved order leaves it unchanged
    Given an order administrator, with an order already resolved to the Canarias entry
    When the order's Sales Region resolution runs a second time
    Then the order still records the Canarias entry, its original rate, its original tax amount
      and its original total
```

## Files to create/modify

### `app/Actions/Orders/ResolveOrderTaxRegion.php` — **create**

Invokable, imperative verb-phrase name with no `Action`/`Service` suffix, resolved from the container
and never `new`-ed
([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract),
[naming.md](../../docs/conventions/naming.md#classes)). It lands in `app/Actions/Orders/`, the folder
0045 creates.

```php
public function __invoke(Order $order): void
```

**Returns `void`, deliberately.** The action's whole output is five columns on the order it was handed;
returning a value would create a second source of truth for something the caller can read off the model.
A caller that needs the outcome re-reads `$order->fresh()`.

The algorithm, in this exact order — **the ordering is part of the specification, not an implementation
detail**:

1. **Idempotency guard.** If `$order->sales_region_id !== null`, return immediately (**D-10**).
2. **Product-type guard.** Load `$order->items` with their `product`, and classify:
   - every line item's product is `ProductType::Physical` ⇒ continue;
   - **any** line item's product is `ProductType::Virtual` and **none** is physical ⇒ **return, writing
     nothing** — this order is story 0054's (**D-2**);
   - the set is **mixed**, or any line item's product cannot be resolved at all ⇒ set
     `flagged_for_review = true`, leave `sales_region_id` and `tax_rate` `null`, return (**D-2**,
     **D-3**).
3. **Read the destination from the order's own frozen snapshot** — `$order->shipping_country` and
   `$order->shipping_postal_code`, never `$order->customer->…` (**D-4**, and 0045's own **D-4** is what
   makes those columns exist).
4. **Resolve the region**, mapping through the shared `ResolvesSalesRegionFromAddress` trait (below) —
   `$this->resolveSalesRegionFromAddress($order->shipping_country, $order->shipping_postal_code)`,
   which is the *same* call [0054](0054-order-tax-region-resolution-virtual-backend.md) makes with its
   **billing** columns:
   - `shipping_country` blank/`null` ⇒ the trait returns `null` ⇒ fallback (**D-6**);
   - `shipping_country` is `ES` (case-insensitively) ⇒ the trait takes the **first two characters** of
     `shipping_postal_code` and looks up `SPAIN_POSTAL_PREFIX_TERRITORIES` (**D-5**); an absent or
     unmapped postal code ⇒ `null` ⇒ fallback (**D-6**);
   - otherwise ⇒ the trait runs
     `SalesRegion::query()->where('slug', Str::lower($shipping_country))->first()` (**D-4**);
   - **the fallback policy stays in this action, not in the trait**: the row is missing, or
     `is_active === false`, or it is a **heading** (it has children) ⇒ fallback (**D-6**). The trait
     returns a matched row *regardless of `is_active`* and applies no default of its own, precisely so
     0054 can keep its own different policy (it hands the row to 0026's resolver). A shared mapping is
     not a shared fallback.
5. **Write, in one `DB::transaction()`:** `sales_region_id` = the winning row's id, `tax_rate` = that
   row's `rate` **copied as a string** (**D-7**), `flagged_for_review` where **D-6** requires it, and —
   in the *same* statement, the *same* transaction — the derived `tax_amount` and the re-derived
   `total` (**D-13**):
   - `tax_amount = subtotal × (tax_rate ÷ 100)`, computed from `orders.subtotal` and **never**
     accumulated onto whatever `tax_amount` already held;
   - `tax_rate` being `null` (**D-6** case 5) writes `tax_amount = '0.00'` — the region is known, the
     rate is not, and no tax is invented for it;
   - `total = subtotal + tax_amount + shipping_amount`, written out as 0045's **D-8** identity rather
     than as `subtotal + tax_amount`, so `shipping_amount` becoming non-zero later needs no edit here.

   This step is **identical to step 5 of
   [0054](0054-order-tax-region-resolution-virtual-backend.md)'s `ResolveVirtualOrderSalesRegion`** —
   deliberately so, per **D-13**. A reader of one action must be able to predict the other without
   re-deriving it, and the two must not round differently.

Four properties to carry into implementation:

- **It self-authorizes nothing** — no `Gate::authorize()`, no policy. This is a system-triggered
  resolution step rather than an administrator-initiated write, and it is invoked on the authorized
  success path of `CreateOrder`, which has already asked `orders.create`. It matches
  [0026](in-progress/0026-product-sales-region-assignment-and-tax-resolution-backend.md)'s own decision for
  `ResolveProductTaxRate` ("it self-authorizes nothing… Epic 3 may invoke it from a queued job with no
  acting user at all"), and the same reasoning applies here with more force: a future queued or
  scheduled caller has no acting user, and a `Gate` check would fail closed on it. **Recorded as a
  decision (D-11) so `appsec-auditor` sees one rather than an omission.**
- **The postal-prefix map is a `public const` in PHP — `SPAIN_POSTAL_PREFIX_TERRITORIES`, on the
  shared `ResolvesSalesRegionFromAddress` trait this action composes** (**D-5**): not a new table, not
  a config file, and emphatically not `sales_regions.code`. It lives on the trait rather than directly
  on this class only because the trait is what reads it; every alternative **D-5** rejects, it still
  rejects.
- **`loadMissing()`, not `load()`, for `items.product`,** so a caller that already eager-loaded them
  pays no second query — and the docblock states that a caller resolving many orders should eager-load
  `Order::with('items.product')` up front, the same hazard-flagging posture 0026 takes.
- **No `Log::warning`.** A fallback here is an ordinary business outcome recorded in a column a human
  will see, not a refused privileged attempt; [the refusal-logging
  pattern](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail)
  is for authorization refusals and does not extend to this.

### `app/Concerns/ResolvesSalesRegionFromAddress.php` — **create if absent** (shared with 0054)

```php
protected function resolveSalesRegionFromAddress(?string $countryCode, ?string $postalCode): ?SalesRegion
```

The country→region and Spain-postal-prefix mapping of step 4, extracted so that **one implementation
serves both this action and [0054](0054-order-tax-region-resolution-virtual-backend.md)'s
`ResolveVirtualOrderSalesRegion`**, which applies the identical rules to an order's **billing**
columns. It maps and nothing more: the ISO alpha-2 code lower-cased and matched against
`sales_regions.slug` (**D-4**), the Spain branch keyed on `SPAIN_POSTAL_PREFIX_TERRITORIES` (**D-5**),
and `null` when the address maps to no row. It applies **no** fallback, **no** `is_active` filter and
**no** flag — all three stay in the calling action, because 0053's and 0054's fallbacks genuinely
differ and collapsing them would be a behavioural change rather than a de-duplication.

Three properties to carry into implementation:

- **`SPAIN_POSTAL_PREFIX_TERRITORIES` is a `public const` on the trait**, not on either action. This
  is the one adjustment **D-5** takes on: its reasoning (a PHP constant, never a table, a config file
  or `sales_regions.code`) is unchanged and its three rejected alternatives stand — only the host
  class moves, so that neither action has to import the other's class constant to resolve the same
  five territories. **0054's file references this map and must never restate it.**
- **Create-if-absent, in either order.** 0053 and 0054 do not depend on each other (see
  [the sibling section](#sibling-relationship--story-0054-virtual-products-informational)); whichever
  reaches Phase 3 first writes this file, the second `use`s it **unchanged**, and neither forks a
  second copy. Phase 3 must check whether the file exists before writing it, and if it does, must not
  change its behaviour without re-running the other story's tests. 0054's **D-7** states the same rule
  from its side.
- **A trait, deliberately, rather than a fourth invokable action.** Both consumers are actions whose
  `__invoke()` signature is a public contract
  ([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)),
  and `app/Concerns/` is already where this repo puts logic two classes compose. It stays flat and
  single-concern, `use`ing no other trait, per
  [naming.md](../../docs/conventions/naming.md#traits-and-their-methods); its name follows the
  third-person-verb-phrase shape, not the `<Noun>ValidationRules` shape, which governs validation rule
  sets only.

This story's existing Spain and country-matching tests exercise the trait **through this action** and
need no restructuring — the extraction changes where the code lives, not what any scenario asserts.

### `app/Models/Order.php` — **modify** (0045 creates it)

**No new relation, no new column, no new cast.** 0045 already declares `belongsTo` → `salesRegion` and
`hasMany` → `items`, and already omits `sales_region_id`, `tax_rate`, `tax_amount`, `total` and
`flagged_for_review` from `#[Fillable]` — which is exactly the guard this story relies on:
`ResolveOrderTaxRegion` writes all five with `forceFill()`, and no form can ever supply them. **If this
story finds itself needing to add any of the five to `#[Fillable]`, something has gone wrong.**
(0054's own model section states the same five-name omission list, read from 0045 — the two agree.)

### Explicitly **not** touched by this story

- `database/migrations/**` — **no migration.** Every column read and written already exists on 0045's
  `orders`. `database-expert` confirmed the existing `slug` UNIQUE index is sufficient for the country
  lookup and that **no new index is warranted** on `sales_regions` (**D-12**).
- `app/Actions/Products/ResolveProductTaxRate.php` and `ResolvedTaxRate` — **0026's, and not called
  here.** See **D-1**, which is the single most important decision in this file.
- `app/Actions/Orders/CreateOrder.php` — not edited. This action is invoked *after* it returns
  (**D-8**).
- `orders.shipping_amount` — **read and summed into `total`, never written** (0037/0054). Its two
  siblings `orders.tax_amount` and `orders.total` **are** written, since **D-13**; they were not, as
  first composed.
- `orders.subtotal` — **read only.** Line items are 0048's; this action never re-sums them and never
  writes the column.
- `app/Policies/**` — none created (**D-11**); 0048–0052 own `OrderPolicy` per 0045's **D-13**.
- `database/seeders/RolePermissionSeeder.php` — no permission is added or asked.
- `routes/*.php`, `config/modules.php`, `app/Livewire/**`, `resources/views/**`, `lang/**` — 0055's.
- Anything reading a **billing** address, performing an IP-geolocation lookup, or setting
  `flagged_for_review` for a geo/fraud mismatch — **0054's, entirely** (**D-2**).

## Tests to perform

All Feature tests unless marked otherwise, in the existing `tests/Feature/Orders/` folder 0045 creates,
as `ResolveOrderTaxRegionTest.php`. This story ships no route, so every test is action-level
([testing/README.md](../../docs/testing/README.md)).

### Country → region matching

- [ ] Integration test: an order with `shipping_country = 'FR'` against an **activated, rated** `fr`
      catalog row resolves to that row — asserting the slug-matching key works at all.
- [ ] Integration test (dataset): `'FR'`, `'fr'`, `'Fr'` all resolve to the same `fr` row — the
      lower-casing is asserted rather than assumed, since `orders.shipping_country` is only
      `regex`-validated as two letters by 0041/0045 and is not normalised on write.
- [ ] Integration test: `tax_rate` is written as the **decimal string** the region carries, compared as
      a string and never as a float (**R-3**).

### Spain's five fiscal territories — the five-way dataset

- [ ] Integration test (dataset of five): postal codes `28001` → `es-peninsula`, `07001` → `es-baleares`,
      `35001` → `es-canarias`, `38001` → `es-canarias`, `51001` → `es-ceuta`, `52001` → `es-melilla`.
      **Both Canary prefixes are separate rows in the dataset** — a dataset carrying only `35` would pass
      against a map that has silently lost `38`.
- [ ] Integration test: each of the five resolves to a row whose `rate` matches
      `SalesRegionSeeder::SPAIN_TERRITORIES`' entry for that slug, read **from the constant** rather than
      restated as a literal — the seeder's own docblock states those rates are starting values pending
      fiscal sign-off, so a hardcoded `21.000` would redden this suite the day they are corrected.
- [ ] Integration test: an order shipping to Spain **never** resolves to the `es` heading row — asserted
      as `$order->sales_region_id !== $spain->id`, not merely as "a region was resolved".
- [ ] **Boundary test:** a postal code of `'7001'` (four digits, the leading zero lost somewhere
      upstream) does **not** silently resolve to `es-peninsula` via a `'70'` prefix — it falls back and
      flags. This is the one failure mode the prefix map cannot detect on its own.

### Fallback and flagging — the highest-risk group

`backend-qa` named the inactive-region case the single highest-risk behaviour in this story: an inactive
region and an active one are the same row shape, so a resolver that forgets the `is_active` check
produces a *plausible* region and a *plausible* rate, and nothing looks wrong until an accountant asks.

- [ ] **Dedicated test, not folded into a happy path:** an order shipping to a country whose catalog row
      exists but is `is_active = false` resolves to the **default** entry and sets
      `flagged_for_review = true`. Asserted on all three columns.
- [ ] Integration test: an order whose `shipping_country` matches **no** catalog row falls back and
      flags.
- [ ] Integration test: an order with `shipping_country = null` (an address-less customer, legitimate per
      0041 **D-3**) falls back and flags rather than throwing.
- [ ] Integration test: an order shipping to Spain with a `null` postal code falls back and flags.
- [ ] Integration test: an order shipping to Spain with an unmapped prefix (`'99999'`) falls back and
      flags.
- [ ] Integration test: the fallback target is the row carrying `is_default`, resolved by that column and
      **not** by `SalesRegionSeeder::DEFAULT_SLUG` — the constant is the seeder's, and an administrator
      moving the default (story 0017/0018) must move this resolution with it. The test additionally
      asserts the resolved row's slug **is** `DEFAULT_SLUG` on a freshly seeded catalog, so both the
      mechanism and the seeded state are pinned.
- [ ] **Negative test:** with **no** row carrying `is_default` at all, the action throws rather than
      writing a `null` region silently (**D-6**). A catalog with no default is a broken installation, not
      a runtime branch to absorb.
- [ ] Integration test: an active region whose `rate` is `null` writes `sales_region_id`, leaves
      `tax_rate` `null`, and sets the flag — the region is known, the rate is not, and the two facts are
      recorded separately (**D-6**).
- [ ] Integration test: a region whose `rate` is `'0.000'` resolves as a **real rate** — `tax_rate` is
      `'0.000'`, the flag stays `false`, and there is **no** fallback to the default. `null` and `0.000`
      cannot share a meaning ([schema.md](../../docs/database/schema.md#sales_regions)).

### The order's own address decides

- [ ] **Regression test:** resolve an order, then change the *customer's* `shipping_country` /
      `shipping_postal_code` and save; re-fetch the **order** (`->fresh()`, never the in-memory instance)
      and assert its `sales_region_id` is unchanged. Same failure mode and same reason as 0045's price
      snapshot — a live join instead of the frozen copy is invisible until someone moves house.
- [ ] **Regression test:** resolve an order, then change the winning region's `rate`; re-fetch the order
      and assert `tax_rate` is unchanged. This is what "snapshot" means and it is the assertion that
      fails if anyone ever "simplifies" the read to `$order->salesRegion->rate`.

### Product type

- [ ] Integration test: an order whose three line items are all `ProductType::Physical` is resolved.
- [ ] Integration test: an order whose only line item is `ProductType::Virtual` is left **completely**
      untouched — `sales_region_id` `null`, `tax_rate` `null`, `tax_amount` and `total` byte-identical
      to what `CreateOrder` left, **and `flagged_for_review` still `false`**. The last assertion is the
      one that matters most: a defer must be distinguishable from a flagged ambiguity, or story 0054
      inherits a flag it did not set. **The two totals assertions matter for the same reason since
      D-13** — a defer that "helpfully" zeroed or recomputed them would hand 0054 an order it did not
      write.
- [ ] Integration test: a **mixed** order (one physical, one virtual line item) writes no region, no
      rate, no `tax_amount` and no `total` **and** sets `flagged_for_review = true` (**D-2**).
- [ ] Integration test: an order whose line item has a `null` `product_id` (the catalog row was deleted,
      0045 **D-2**'s `nullOnDelete()`) is treated as unresolvable — no region, no rate, flag set
      (**D-3**).

### Idempotency and re-runs

- [ ] Integration test: calling the action twice against the same order leaves all **five** written
      columns byte-identical after the second call (**D-10**) — `sales_region_id`, `tax_rate`,
      `flagged_for_review`, and since **D-13** `tax_amount` and `total`.
- [ ] Integration test: calling the action against an order whose `sales_region_id` was already set to a
      *different* region does **not** overwrite it — the guard is "already resolved", not "re-resolve
      from scratch".

### The computed tax amount and total (D-13)

**This group is copied from
[0054](0054-order-tax-region-resolution-virtual-backend.md)'s own "The rate and the totals" group and
must stay assertion-for-assertion equivalent to it.** If the two ever disagree about a rounding, a
`null` or an idempotency, one of them is wrong — and the pair is the only thing that will say so.

- [ ] Integration test: an order whose `subtotal` is `'100.00'` resolving to a region rated `'21.000'`
      writes `tax_amount` `'21.00'` and `total` `'121.00'`, both compared as **decimal strings**
      (**R-3**). This is the group's primary assertion and it is what makes 0045 **D-8**'s written-out
      `total = subtotal + tax_amount + shipping_amount` identity executable rather than prose.
- [ ] **Integration test: `null` and `'0.000'` produce the same `tax_amount` and must still be
      distinguishable.** A region carrying **no** configured rate writes `tax_rate = null`,
      `tax_amount = '0.00'` **and sets the flag** (**D-6** case 5); a region configured at `'0.000'`
      writes `tax_rate = '0.000'`, `tax_amount = '0.00'` and **no** flag. **A test asserting only the
      amounts would pass against an implementation that conflates the two**, since both amounts are
      `'0.00'` — assert `tax_rate` and `flagged_for_review` alongside.
- [ ] Integration test: `total` is computed as the **full three-term identity**, proven by an order
      whose `shipping_amount` is non-zero — `subtotal` `'100.00'` + `tax_amount` `'21.00'` +
      `shipping_amount` `'5.50'` = `total` `'126.50'`. An implementation writing
      `subtotal + tax_amount` passes every test whose `shipping_amount` is `'0.00'`, which is every
      other test in this file.
- [ ] **Integration test (idempotency, and the sharpest one here): resolving an order twice produces
      the same `tax_amount` and the same `total`.** An implementation doing `total += tax_amount`
      rather than recomputing from `subtotal` passes every single-run test in this group and doubles
      the tax on the second call. It is guarded twice over — by **D-10**'s early return and by the
      recompute-from-`subtotal` rule — and this test is what proves the second guard exists rather than
      being masked by the first, so it must be written to reach the arithmetic (call the action against
      an order whose `sales_region_id` was cleared between the two calls, or assert the arithmetic
      directly).
- [ ] Integration test: a **fallback** resolution (**D-6** cases 1–4) computes `tax_amount` from the
      **default** row's rate, not from zero and not from the unmatched destination's. The order is
      flagged *and* correctly taxed at the default — the flag is a request for review, never a reason
      to skip the arithmetic.

### Nothing is falsely computed

Mirroring 0045's "nothing is falsely resolved" group, and for the same reason: a populated column looks
like a working feature. **This group was larger before the D-13 amendment** — it held a test asserting
`tax_amount` stays `'0.00'`, whose own note said *"if a later story changes this, this test is the thing
that must be deliberately updated"*. This is that update, and it is deliberate.

- [ ] Integration test: `shipping_amount` is **read but never written** — assert it is byte-identical
      after resolution, including on an order where it was non-zero and therefore genuinely
      participated in `total`.
- [ ] Integration test: `subtotal` is never written — assert it is byte-identical after resolution.
      `tax_amount` is derived **from** it; nothing here re-sums the line items (0048's).
- [ ] Integration test: neither `status` nor `payment_status` changes.

### Deliberately not tested

- Anything reading a billing address or performing an IP-geo lookup (0054).
- **Re**-computation of `tax_amount` after a line-item change — 0048's **D-8**, entirely. This story
  computes the amount **once, at resolution**; keeping it current across edits is that story's rule and
  is tested there.
- Any re-summing of `order_items.line_total` into `subtotal` (0048's **D-7**).
- Per-product tax overrides, `ResolveProductTaxRate`, `ResolvedTaxRate` or `TaxRateResolutionTier` —
  none of them is called from this story (**D-1**), so a test naming them here would assert a coupling
  this story explicitly refuses.
- The correctness of the seeded Spanish rates themselves — the seeder's docblock states they are
  placeholders pending fiscal sign-off, and 0016's own tests deliberately assert only their
  non-null-ness.

## Expected outcome

Once done, an order created for physical products carries a resolved tax basis **and a computed tax**:
`orders.sales_region_id` names the catalog entry the order's **own frozen shipping address** maps to,
`orders.tax_rate` holds that entry's rate **copied as a decimal string at resolution time** — unaffected
by a later change to the customer's address or to the region's configured rate — and `orders.tax_amount`
/ `orders.total` are derived from that rate and the order's `subtotal` in the same write (**D-13**), so
a resolved physical order never displays a rate beside a zero amount. A Spanish destination is
disambiguated to one of
the five fiscal territories by its postal-code prefix and never to the "España" heading; a non-Spanish
destination resolves by ISO alpha-2 against the catalog's `slug`. Anything genuinely ambiguous — an
inactive or absent catalog entry, an unrecognised or missing Spanish postal code, a missing shipping
country, a resolved region with no configured rate, or an order mixing physical and virtual line items —
falls back to the catalog default where a rate is needed **and sets `flagged_for_review`**, so a human
sees it rather than the system guessing quietly.

An order containing **only** virtual line items is left entirely untouched — flag, `tax_amount` and
`total` included — for story 0054. Nothing renders, nothing notifies, no permission is asked and no
migration runs. `orders.shipping_amount` and `orders.subtotal` are **read and never written**:
`shipping_amount` participates in `total` as the third term of 0045 **D-8**'s identity, and `subtotal`
is the basis `tax_amount` is derived from — re-summing the line items into it stays 0048's job.

## Acceptance criteria

- [ ] `App\Actions\Orders\ResolveOrderTaxRegion` exists, is invokable as `__invoke(Order $order): void`,
      and is resolved from the container at every call site including tests.
- [ ] For an order whose line items are **all** physical, the action resolves a Sales Region from
      `orders.shipping_country` / `orders.shipping_postal_code` — the order's own columns, never the
      customer's.
- [ ] A non-Spanish destination matches a catalog row on `slug === strtolower(shipping_country)`, and the
      match is case-insensitive on the order's stored value.
- [ ] A Spanish destination is disambiguated to one of `es-peninsula` / `es-baleares` / `es-canarias` /
      `es-ceuta` / `es-melilla` by the first two characters of the postal code, via a `public const` map
      on the shared `App\Concerns\ResolvesSalesRegionFromAddress` trait — **not** a database table,
      **not** a config file, and **not** `sales_regions.code`.
- [ ] The country→region and Spain-prefix mapping exists in **exactly one** place,
      `App\Concerns\ResolvesSalesRegionFromAddress`, composed by this action and by
      [0054](0054-order-tax-region-resolution-virtual-backend.md)'s
      `ResolveVirtualOrderSalesRegion` — no second copy, and no re-declaration of the map in either
      action. The fallback, the `is_active` check and the flag stay in **this** action, not in the
      trait.
- [ ] The `es` ("España") heading row is never written to `orders.sales_region_id`.
- [ ] `orders.tax_rate` is written as a **snapshot** of the winning row's `rate` and never re-read live;
      pinned by a test that changes the region's rate afterwards.
- [ ] A missing shipping country, an unmapped Spanish postal prefix, a catalog row that is absent or
      `is_active = false`, and a winning row whose `rate` is `null` each fall back to the row carrying
      `is_default` where a rate is needed **and** set `flagged_for_review = true`.
- [ ] A catalog with **no** `is_default` row causes a thrown exception rather than a silent `null` write.
- [ ] A rate of `'0.000'` is honoured as a real rate — no fallback, no flag.
- [ ] An order carrying **any** virtual line item and **no** physical one is left completely untouched,
      `flagged_for_review` included.
- [ ] An order **mixing** physical and virtual line items writes no region and no rate and sets
      `flagged_for_review = true`; the same holds for an order any of whose line items has a `null`
      `product_id`.
- [ ] Re-invoking the action against an already-resolved order changes nothing.
- [ ] The action calls **no** `Gate::authorize()` and **no** policy method, by decision (**D-11**).
- [ ] **`App\Actions\Products\ResolveProductTaxRate` and `App\Actions\Products\ResolvedTaxRate` are not
      referenced anywhere in this story's code or tests** (**D-1**).
- [ ] No migration, no schema change, no new index, no new permission, no route, no Livewire component,
      no Blade view, no policy and no lang key are added.
- [ ] **`orders.tax_amount` is derived as `subtotal × (tax_rate ÷ 100)` and `orders.total` as
      `subtotal + tax_amount + shipping_amount`, both inside the same `DB::transaction()` and the same
      `forceFill()` as the region and the rate** (**D-13**). A `tax_rate` of `null` writes
      `tax_amount = '0.00'`; a `tax_rate` of `'0.000'` writes `tax_amount = '0.00'` too, and the two
      cases stay distinguishable by `tax_rate` and `flagged_for_review` rather than by the amount.
- [ ] **Both are computed from `subtotal` on every run, never accumulated** — resolving twice produces
      the same `tax_amount` and the same `total`, pinned by a test that reaches the arithmetic rather
      than only **D-10**'s early return.
- [ ] **The computation is identical to
      [0054](0054-order-tax-region-resolution-virtual-backend.md)'s step 5** — same formula, same
      `null` handling, same three-term `total` identity, same transaction placement. A future reader of
      either action must be able to predict the other (**D-13**).
- [ ] `orders.shipping_amount` and `orders.subtotal` are **read and never written** by this action, and
      that is pinned by a test.
- [ ] `sales_region_id`, `tax_rate`, `tax_amount`, `total` and `flagged_for_review` remain absent from
      `Order`'s `#[Fillable]`, and all five are written via `forceFill()` from this action alone.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule) — run **unscoped**
      (`php artisan test`, not `--filter`), per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that the action writes only the five
      intended columns; that no caller can supply a region, a rate, a tax amount, a total or the flag;
      that `tax_amount` and `total` are derived from columns the caller cannot set rather than from
      anything passed in (**D-13**); and that the absence of a `Gate::authorize()` is the recorded
      decision **D-11** rather than an oversight.
- [ ] Documentation updated (docs-keeper):
  - [`database/schema.md`](../../docs/database/schema.md)'s `orders` section records who writes
    `sales_region_id`, `tax_rate`, `tax_amount`, `total` and `flagged_for_review`, that `tax_rate` is a
    **snapshot** rather than a live join to `sales_regions.rate`, and that `tax_amount` / `total` are
    **derived and re-derived** rather than write-once — the same note 0048's docs pass adds from the
    line-item side, so whichever story lands second must widen that note rather than duplicate it.
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md)'s directory listing gains
    `ResolveOrderTaxRegion` under `app/Actions/Orders/` and — if this story is the one that creates it
    (**D-5**) — `ResolvesSalesRegionFromAddress` under `app/Concerns/`, whose listed purpose there
    ("Shared traits (validation rule sets)") stops being accurate the day the first non-validation
    trait lands in that folder.
  - **The relationship to 0026's `ResolveProductTaxRate` is documented explicitly** — two resolvers, two
    concerns, neither calling the other (**D-1**). This is the single likeliest thing for a future reader
    to mistake for duplication and "fix".
  - **Grep for bare negative claims this story falsifies** rather than trusting the change→doc mapping —
    the failure mode recorded in
    [errors-log.md](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13).
    0045's docs pass will have written "`sales_region_id` is `null` at creation and resolving it is
    0053's"; that sentence is still true, but anything phrased as "no order ever carries a sales region"
    is not. **Add to that grep, since D-13:** anything phrased as "0053 does not compute a tax amount",
    "`tax_amount` is only written by 0048/0054", or "a resolved physical order carries a rate and no
    amount" — all three were true of this story as first composed and none of them is now.
- [ ] **Parity with [0054](0054-order-tax-region-resolution-virtual-backend.md) is verified, not
      assumed** (**D-13**). Whichever of the two reaches Phase 3 second must diff its own step 5 against
      the shipped one and reconcile any difference in the formula, the `null` handling, the rounding or
      the transaction placement **in code**, not by amending one task file. If 0054 shipped first and
      its arithmetic differs from this file's, **0054's shipped code wins and this file is corrected** —
      the point of D-13 is one behaviour, not one document.
- [ ] Acceptance criteria met.

## Documented functional decisions

Each resolves an open question raised during the debate. Every one is a **conservative, reversible
default the human may override** — the reasoning is recorded so an override is a decision rather than a
rediscovery.

- **D-1 — `orders.tax_rate` is the *destination region's own* rate, resolved once per order. This story
  does not call 0026's per-product resolver, and that is not an oversight.**
  *(Resolves `backend-expert`'s open question A — the deepest question in the debate.)*

  PRD §3.2 states the rule at the **order** level and derives it from an **address**: *"the Sales Region
  is resolved from the order's shipping address"*, and the acceptance criterion reads *"the order's tax
  Sales Region is resolved by product type: physical → shipping address"*. That is textbook
  **destination-based VAT**: every line item in a consignment shipped to one address is taxed at that
  address's rate, regardless of which product it is. Resolving per line item and summing would produce a
  different number for the same shipment depending on which regions a catalog administrator happened to
  tick on each product — which is not a tax rule any EU regime expresses.

  **0026's `ResolveProductTaxRate` is not vestigial and must not be deleted or "unified" with this one.**
  It answers a different question — *"what rate should this product display for this region?"* — in a
  catalog/pricing-display context where no order and no confirmed destination exist yet (a product page
  showing a tax-inclusive price for a browsing customer's region). Its `AssignedRegion` /
  `CatalogDefault` tiers exist so that display can say *why* a rate applied. The two resolvers are
  **orthogonal, not layered**: one is about a product's fiscal reach, the other about an order's
  destination.

  0026's own forward note — *"Epic 3 will call it from an order pipeline"* — was written before this
  debate and is **narrowed rather than honoured**: the Epic 3 caller it anticipated is an order-line
  pricing/display concern, not this story. Nothing in 0026 changes; this file records the boundary so a
  later reader does not "connect the unused resolver".

  > **If the business ever needs a genuine per-product tax override that diverges from destination-based
  > VAT** — rare in VAT regimes, but real for excise-taxed goods (alcohol, tobacco, fuel) — **that is a
  > new, separately-scoped story**, not a retrofit of this one. It would change what `orders.tax_rate`
  > *means* (an order-level rate could no longer represent the order), so it is a schema question as much
  > as a logic one, and it must be debated as such.

- **D-2 — This story resolves an order only when **every** line item's product is physical. A
  virtual-only order is deferred to 0054 untouched; a **mixed** order is resolved by neither and is
  flagged.**
  *(Resolves `backend-expert`'s open question B.)*

  Neither 0045 nor the PRD constrains an order to homogeneous product types, but PRD §3.2's tax rule
  branches entirely on *"the order's product type"* as though orders always are homogeneous. **There is
  no PRD rule for a mixed cart**, and inventing one — split the order, tax each half separately, prefer
  the shipping address, prefer the billing address — is a business decision this debate cannot make
  unilaterally. Each of those four options is defensible and they produce different tax.

  **The shipped behaviour, for both 0053 and 0054:**

  | Line items | 0053 (shipping address) | 0054 (billing address + IP geo) | Result on the order |
  | --- | --- | --- | --- |
  | All physical | resolves | defers, writes nothing | region + rate resolved |
  | All virtual | defers, writes nothing | resolves | region + rate resolved |
  | Mixed | **check-and-skip, sets the flag** | **check-and-skip, sets the flag** | `sales_region_id` `null`, `tax_rate` `null`, `flagged_for_review` `true` |

  Rejecting a mixed order **at creation** was considered and refused: that is a rule on `CreateOrder`,
  which is story 0045's closed scope, and reaching into it from here would reopen a story to solve a
  problem that a flag already surfaces. `flagged_for_review` is reused rather than adding a column — the
  column exists, it means exactly "a human should look at this before the tax is trusted", and a mixed
  cart is precisely that.

  **Both actions must implement the *same* guard shape** — "all physical / all virtual / else
  defer-and-flag" — so that the two check-and-skip branches cannot drift into a gap (neither resolves and
  neither flags) or an overlap (both resolve, last writer wins). See the Dependencies section for the
  cross-reference this places on 0054.

- **D-3 — A line item whose product cannot be resolved is treated as mixed: defer and flag.** 0045's
  **D-2** makes `order_items.product_id` `nullOnDelete()`, so a deleted catalog product leaves a line
  item whose type is unknowable. It cannot happen at creation time — the product must exist to be
  ordered — so this branch exists for a **re-resolution** of an older order. Treating unknown as
  "physical" would be a guess about tax; treating it as an ambiguity a human resolves is the same
  conservative direction **D-2** takes, reached the same way.

- **D-4 — The matching key is `sales_regions.slug`, matched against `strtolower(orders.shipping_country)`
  — never `sales_regions.code`.** `database-expert` verified this against the real seeder rather than
  recalling it: `SalesRegionSeeder` writes `'slug' => strtolower($country['alpha2'])` for every one of
  the ~249 ISO rows, and `slug` carries the table's only non-FK UNIQUE index. `code` is explicitly **not**
  a resolution key — the seeder's own docblock states *"Nothing resolves by `code`, so these are starting
  values, not contracts"*, and `code` is administrator-editable
  ([schema.md](../../docs/database/schema.md#sales_regions)), so resolving by it would let an
  administrator's cosmetic edit silently re-route an order's tax.

  The lower-casing is applied at the **query**, not assumed of the stored value: 0041 validates
  `*_country` as `['nullable','string','size:2','regex:/^[A-Za-z]{2}$/']` and does **not** normalise
  case on write, so `'FR'`, `'fr'` and `'Fr'` are all storable and all must resolve identically.

- **D-5 — Spain is disambiguated by a fixed postal-code-prefix map declared as a `public const` in
  PHP: `SPAIN_POSTAL_PREFIX_TERRITORIES`, on the shared `ResolvesSalesRegionFromAddress` trait this
  action composes.** `database-expert` confirmed `sales_regions` carries **no** postal-code, province or
  subdivision column and that adding one is not warranted for a five-entry mapping. The map mirrors
  `SalesRegionSeeder::SPAIN_TERRITORIES`' own "constant on the class that owns it" convention — and
  the class that owns it is the trait that *reads* it, so
  [0054](0054-order-tax-region-resolution-virtual-backend.md) resolves the identical five territories
  from a **billing** address without importing this action or re-declaring the map. **Only the host
  class moved; the three alternatives below are rejected exactly as first reasoned:**

  | Prefix | Territory slug |
  | --- | --- |
  | `07` | `es-baleares` |
  | `35` | `es-canarias` |
  | `38` | `es-canarias` |
  | `51` | `es-ceuta` |
  | `52` | `es-melilla` |
  | any other two-digit prefix in `01`–`50` (a real Spanish province code not listed above) | `es-peninsula`, **matched** |
  | outside `01`–`52` entirely, or absent/malformed | **fallback + flag** (**D-6**, case 4) |

  > **Fixed inconsistency (Phase 1 reconciliation pass): "anything else matches Peninsula" was
  > previously stated without a range check, which silently contradicted **D-6** case 4 and this
  > story's own test plan (`'99999'` — see [Tests to perform](#tests-to-perform)) — both of which
  > require an *unmapped* prefix to fall back and flag, not match cleanly. The corrected rule: only a
  > prefix inside the real Spanish province range (`01`–`52`) that isn't one of the five listed above
  > is a genuine Peninsula match; anything outside that range (including `99999`, `00`, or `53`–`99`)
  > is not a Spanish province code at all and must fall back and flag like any other unmapped case.
  > The trait's implementation therefore needs a bounds check (`$prefix >= 1 && $prefix <= 52`), not a
  > bare array-miss check, before defaulting to `es-peninsula`.

  Three alternatives rejected. **A new `sales_region_postal_prefixes` table**: five rows, no
  administrator ever edits them (they are Spanish fiscal geography, not configuration), and it would need
  its own migration, model, seeder and CRUD story. **A config file**: `config/` here is for a declarative
  registry a later story extends by appending data
  ([base-standards.md](../../docs/conventions/base-standards.md#an-app-owned-config-file-is-a-registry-and-must-survive-configcache)),
  and this is neither extended nor appended-to — it is a closed set fixed by Spanish law. **Reusing
  `sales_regions.code`**: refused for the reason in **D-4**.

  > **This map is Spain-specific by construction, and that is correct for this phase.** No other country
  > in the catalog has fiscal sub-territories (0016 **D11**), so the branch is reachable only for `ES`.
  > If a second country ever gains sub-territories, **that is the story that promotes this constant to a
  > real table** — and it will have a second real case to design against, which this story does not.

- **D-6 — The fallback: the `is_default` entry decides, and the order is flagged.**
  *(Adopts `database-expert`'s recommendation.)* Five situations fall back:

  1. `shipping_country` is `null` or blank;
  2. `shipping_country` matches no catalog row;
  3. the matched row is `is_active = false`;
  4. the destination is Spain and the postal code is absent or its prefix is unmapped;
  5. the winning row's `rate` is `null` — here `sales_region_id` **is** written (the region is known) and
     only the rate is missing.

  In cases 1–4 the default row's id **and** rate are written; in case 5 the resolved row's id is written
  and `tax_rate` stays `null`. **All five set `flagged_for_review = true`.** The flag is what separates a
  fallback from a clean match, and PRD §3.2's *"falling back to the default entry when no matching entry
  applies"* says what rate to use, not that the situation should pass unremarked. A default rate applied
  to a destination nobody configured is a guess — a defensible one, and one a human should confirm.

  **A catalog with no `is_default` row throws.** It is a broken installation (the seeder repairs the flag
  when no row carries it, and `is_default` is not mass-assignable), not a runtime state to absorb — and
  the alternative, writing `sales_region_id = null` while claiming resolution ran, is exactly the
  false-resolved-state failure 0045's own test group exists to prevent.

  > **Consequence to state plainly rather than discover later: on a freshly seeded catalog, every order
  > shipping outside Spain is flagged.** `SalesRegionSeeder` activates only `es` and its five
  > territories; all ~248 other countries ship `is_active = false` with `rate = null`. That is the
  > intended behaviour — an administrator must activate and rate a region (stories 0017/0018) before
  > orders ship there un-flagged — but it will look like a bug to whoever sees it first, so it belongs
  > in the docs pass and in 0055's screen copy.

- **D-7 — `orders.tax_rate` is a snapshot, copied as a decimal string.** `sales_regions.rate` casts
  `decimal:3` and therefore **returns a string**; `orders.tax_rate` is `decimal(6,3)` and mirrors it
  column-for-column (0045's schema says so explicitly). Typing or comparing it as a `float` is the single
  likeliest silent bug in this story — 0016, 0024 (R-4) and 0026 all flag the same trap. The snapshot
  itself follows the rule 0045 established for `unit_price` and for the address columns: **never
  re-derive historical financial data from a mutable source.** A tax administrator correcting a region's
  rate must not retroactively re-tax orders already placed.

- **D-8 — The action is invoked explicitly by the caller, after `CreateOrder` returns.** Its contract is
  "callable against a persisted order", and it makes no assumption about *who* calls it or *when*, beyond
  the order existing. Concretely, the caller — story 0055's Livewire component today, and any future
  non-dashboard caller — does:

  ```php
  $order = $createOrder($attributes);

  $resolveOrderTaxRegion($order);   // 0053, when every line item is physical
  $resolveOrderTaxBilling($order);  // 0054, when every line item is virtual
  ```

  Each action's own guard decides whether it acts, so the caller invokes both unconditionally and neither
  needs to know about the other. **`CreateOrder` is not edited** — 0045's scope fence forbids it, and
  0046's notification dispatch (which *is* inside `CreateOrder`, constructor-injected and post-commit) is
  not a precedent for tax resolution: a notification is a side effect of creating an order, while a tax
  basis is a second business operation with its own failure modes and its own idempotency.

- **D-9 — No `OrderCreated` domain event is introduced.** *(Resolves the sequencing suggestion raised in
  the debate.)* An event-and-listener architecture would centralise the three post-creation calls (0046's
  notification, this story's resolution, 0054's) behind one dispatch — genuinely attractive, and
  genuinely out of scope here. Stories 0045 and 0046 are already specified around explicit, documented
  call sites, and retrofitting an event system is a larger architectural change than this story owns; it
  would also make the ordering of three side effects implicit at exactly the point where 0046's
  "dispatch after commit" constraint makes ordering load-bearing.

  **Recorded as a forward-looking suggestion, not a requirement:** whichever story implements the real
  order-creation orchestration — most likely 0055's Livewire caller, or a dedicated refactor — should
  *consider* centralising the three calls. This story's own contract is unaffected either way: it is
  "callable explicitly against a persisted order", and an event listener calling it satisfies that
  contract exactly as a Livewire component does.

- **D-10 — The action is idempotent: an order with a non-null `sales_region_id` is left alone.** Two
  reasons. The obvious one is that a double call (a retried request, a re-queued job) must not rewrite a
  tax basis. The load-bearing one is **D-7**: re-running the resolution against a *changed* catalog would
  silently re-snapshot a new rate onto an old order, which is the exact behaviour the snapshot exists to
  prevent. A future story that genuinely needs to re-resolve — an administrator correcting an order's
  address, say — must do so through an explicit, separately-authorized path, not by calling this action
  again.

- **D-11 — No `Gate::authorize()` and no policy; the action authorizes nothing.** This is
  **system-triggered resolution**, not an administrator-initiated write: it is invoked on the authorized
  success path of `CreateOrder`, which has already asked `orders.create`, and it exposes no new decision
  to any caller (it takes an `Order` and reads that order's own columns — a caller who can hand it an
  order already has the order). 0026 made the identical call for `ResolveProductTaxRate` and stated the
  clinching reason: **a future queued or scheduled caller has no acting user at all**, and a `Gate` check
  would fail closed against it — turning a hardening reflex into an outage.

  This is a deliberate departure from
  [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s
  "an authorization rule belongs to the action" convention, and the departure is narrow and stated: that
  convention governs an **operation a permission gates**. No permission in the seeded catalog gates "tax
  was resolved", because it is not an operation an administrator performs. **Recorded here so
  `appsec-auditor` reads a decision rather than an omission.** If a later story adds an
  administrator-facing "re-resolve this order's tax" control, **that control** authorizes — the rule
  lands on the new operation, not retroactively on this one.

- **D-12 — No new index, and none is needed.** *(`database-expert`'s finding, verified rather than
  assumed.)* The country lookup is a single-row read on the existing `sales_regions_slug_unique` index.
  The default-row lookup is a scan of ~254 near-read-only rows, which 0016 already considered and
  declined to index on cardinality grounds — *"a boolean over 254 rows is the worst possible index
  candidate"* — and 0026 re-examined and left alone for the same reason, recommending instead that a
  caller resolving many orders **fetch the default row once and pass it down**. That remains the right
  answer here and is a caller-side optimisation, not this story's.

- **D-13 — This action also derives `orders.tax_amount` and re-derives `orders.total`, in the same
  write, using exactly [0054](0054-order-tax-region-resolution-virtual-backend.md)'s computation.**
  *(Added after composition. Resolves **OQ-1**'s "who computes `tax_amount`" half, and closes story
  [0055](0055-orders-list-detail-editor-ui.md)'s **R-6** / **OQ-1**, which that story recorded as
  "BLOCKING for the epic".)*

  **What changed and why.** As first composed this story held its scope to *resolution* — a region and
  a rate — and deferred every arithmetic to **OQ-1**, whose own recommended option was a separate
  `RecalculateOrderTotals` action owned by the line-item-editing story. Sibling story **0054** was
  composed afterwards and did **not** make the same cut: its `ResolveVirtualOrderSalesRegion` computes
  `tax_amount` and `total` inside its own step 5. Two resolution actions specified days apart therefore
  disagreed about their own output columns, and the disagreement is **visible to an end user**: a
  freshly created *physical* order would render `tax_rate 21.000%` beside `tax_amount 0.00`, while an
  otherwise identical *virtual* order rendered both — until somebody edited a line item, at which point
  0048's **D-8** recomputation made the amount appear from nowhere. 0055 found this while composing its
  tax panel and escalated it rather than papering over it.

  **The resolution is to make this story match 0054, not to make 0054 match this one.** Three reasons,
  in order of weight:

  1. **A user-visible inconsistency between two halves of one feature is worse than either half's
     scope being slightly wider.** Whichever way the pair is made consistent, one story's scope moves;
     only one direction leaves the screen correct on the day it ships.
  2. **The narrower cut was never load-bearing.** **OQ-1**'s reasoning was about *where the arithmetic
     lives so it is not implemented twice* — a real concern, and one that 0054 and 0048 have already
     resolved in the opposite direction by implementing it. Holding this story's line would produce
     **two** implementations and one abstainer, which is strictly worse than three implementations of
     an identical formula pending an extraction.
  3. **It is reversible in one direction only, cheaply.** Removing the arithmetic later is a deletion;
     shipping the inconsistency and discovering it in production is a data-correction exercise across
     every physical order created before the fix.

  **The computation, stated once so both actions can be diffed against it:**

  | Term / case | Rule |
  | --- | --- |
  | `tax_amount` | `subtotal × (tax_rate ÷ 100)` — `tax_rate` is a **percentage** (`21.000` means 21%), matching `sales_regions.rate`'s own semantics ([schema.md](../../docs/database/schema.md#sales_regions)) and 0054's `subtotal 100.00 @ 21% → 21.00` scenario. ⚠️ **0048's D-8 and 0054's own test plan both write the shorthand `subtotal × tax_rate`, which is dimensionally wrong read literally** — Phase 3 must implement the `÷ 100` form and, if 0048 or 0054 shipped the literal one, that is a bug in the shipped code, not a licence to copy it |
  | `tax_rate` is `null` | `tax_amount = '0.00'`. The region is known and the rate is not (**D-6** case 5); no tax is invented. Distinguished from a real `'0.000'` by `tax_rate` and `flagged_for_review`, **never** by the amount, since both amounts are `'0.00'` |
  | `total` | `subtotal + tax_amount + shipping_amount` — 0045 **D-8**'s identity written out in full, so `shipping_amount` becoming non-zero (0037/0054) needs no edit here |
  | Basis | Always recomputed **from `subtotal`**, never accumulated onto the column's current value. `total += tax_amount` passes every single-run test and doubles on the second call |
  | Placement | The same `forceFill()`, the same `DB::transaction()`, the same statement as the region and the rate — never a second write and never a post-commit one |

  **What this decision does *not* do.** It does not make this story the owner of order arithmetic, and
  it does not answer **OQ-1**'s *other* half (when resolution is triggered at all — still 0055's
  **OQ-1**, still open). It computes the amount **once, at resolution**; keeping it current across
  line-item edits remains 0048's **D-8**, and `subtotal` itself stays 0045's to write at creation and
  0048's to re-sum on edit — never this action's. The three
  implementations of one formula that now exist (here, 0054, 0048) are an accepted interim state with a
  named exit: [backlog item 1](#technical-tasks-for-the-backlog) is re-pointed from *"decide who
  computes `tax_amount`"* to *"extract the shared `RecalculateOrderTotals` and re-point all three call
  sites at it"*.

  > **Reversal cost:** one step-5 clause and its test group, in each of two actions. No column, no
  > migration, no contract and no permission moves in either direction — which is exactly why the
  > inconsistency was cheap to close and would have been expensive to ship.

## Scope fences: what this story must NOT do

- Must **not** read a **billing** address, perform any IP-geolocation lookup, or implement the
  geo/fraud mismatch check (0054, entirely).
- Must **not** call `App\Actions\Products\ResolveProductTaxRate`, construct a
  `App\Actions\Products\ResolvedTaxRate`, or reference `App\Enums\TaxRateResolutionTier` (**D-1**).
- Must **not** write `shipping_amount` or `subtotal` — both are **read** and summed into `total`, and
  nothing more (0037/0054 own the first, 0048 the second). ⚠️ **This fence read "must not compute
  `tax_amount`, re-derive `total`, or touch `shipping_amount`" until the D-13 amendment**; the first
  two clauses are now **inverted** and the third narrowed. Do not restore it from an older reading of
  this file.
- Must **not** *re*-compute `tax_amount` after a line-item change, or hook itself to any line-item
  write — this action computes the amount **once, at resolution** (**D-13**), and keeping it current
  across edits is 0048's **D-8**.
- Must **not** edit `App\Actions\Orders\CreateOrder`, `App\Models\Order`'s `#[Fillable]`, or any file
  0045 owns beyond adding nothing to them (**D-8**).
- Must **not** add a migration, a column, an index, a table or a seeder row.
- Must **not** add a permission, a policy, a `Gate` check, a route, a `config/modules.php` entry, a
  Livewire component, a Blade view or a lang key.
- Must **not** change any order's `status` or `payment_status` (0048–0052).
- Must **not** select or price a shipping rate (0037/0054).
- Must **not** set `flagged_for_review` for any reason other than the five ambiguity cases in **D-6** and
  the mixed/unresolvable-line-item cases in **D-2**/**D-3** — in particular, **no "flag every physical
  order" branch added by analogy with 0054's geo check.** `backend-expert` raised this explicitly, and it
  survives as a fence even though decisions **D-2**/**D-3**/**D-6** do give this story three narrow
  reasons to write the flag.

## Dependencies, risks and open questions

### Dependencies

| Depends on | State | Verified how |
| --- | --- | --- |
| `orders` table + `App\Models\Order` | story [0045](0045-orders-core-crud-backend.md) — **hard dependency, and itself ⛔ blocked** | This story writes `sales_region_id`, `tax_rate`, `flagged_for_review` and reads both shipping-address columns |
| `orders`' twelve frozen address columns | story [0045](0045-orders-core-crud-backend.md) **D-4** | 0045's D-4 names this story as the reason those columns exist rather than a live join |
| `order_items` + `App\Models\OrderItem` | story [0045](0045-orders-core-crud-backend.md) | The product-type guard reads `items.product` |
| `products.type` / `App\Enums\ProductType` | story [0024](done/0024-products-core-crud-backend.md) — **hard dependency** | `case Physical = 'physical'; case Virtual = 'virtual';`, read from 0024's own file |
| `sales_regions` table + `App\Models\SalesRegion` | task 0016 — **done (shipped)** | `docs/database/schema.md` § `sales_regions`; `slug` UNIQUE, `is_active`, `is_default`, `rate` all present |
| `SalesRegionSeeder::SPAIN_TERRITORIES` / `DEFAULT_SLUG` | **shipped** | Read from `database/seeders/SalesRegionSeeder.php`; the five slugs and `es-peninsula` confirmed |
| `slug = strtolower(alpha2)` for every country row | **shipped** | Line 79 of the same seeder, read rather than recalled |

#### Sibling relationship — story 0054 (virtual products), informational

**Not a hard dependency**: neither story calls the other, and either can be implemented first. But the
two are bound in **two** places, and both bindings are two-way.

**First, they share exactly one artifact: `App\Concerns\ResolvesSalesRegionFromAddress`, specified as
*create-if-absent* in both files** (**D-5** here, **D-7** in 0054). Whichever story reaches Phase 3
first writes the trait; the second `use`s it unchanged and forks no copy. The country→`slug` rule and
the Spain postal-prefix map are **this** story's **D-4**/**D-5** and are referenced by 0054, never
restated there. Each action keeps its own fallback around the shared mapping: this story falls back to
the `is_default` row and flags (**D-6**), 0054 falls through to 0026's catalog-default tier.

**Second, decision D-2 binds both**, and the two guards must have the *same* shape or the pair leaves a
gap or an overlap:

- 0053 acts **only** when every line item is physical.
- 0054 must act **only** when every line item is virtual.
- A mixed order (or one with an unresolvable line item, **D-3**) must be **check-and-skipped by both**,
  with `flagged_for_review = true` and no region or rate written.

> ⚠️ **Story 0054 does not exist as a file yet.** At the time this document was composed,
> `ai-spec/tasks/` contains 0045 and 0046 but no 0047–0055. **Whoever runs 0054's Phase 1 must adopt the
> D-2 table verbatim**, and Phase 2's INVEST review of 0054 must check it against this section. If 0054
> is composed without the all-virtual guard and the mixed-cart defer-and-flag, that is a **Phase 2
> correction on 0054**, not a change to this story.

#### What depends on this story

- **0055** — the Orders list/detail UI renders `sales_region_id`, `tax_rate` and, critically,
  `flagged_for_review`. The flag is only useful if something surfaces it, and **D-6**'s consequence (every
  non-Spanish order flagged on a freshly seeded catalog) makes that surfacing a first-class screen
  concern rather than a badge in a corner.
- **0048** — its **D-8** recomputes `tax_amount` from an already-resolved `tax_rate` on every line-item
  change. Since **D-13** the two stories share one formula and one identity, so **whichever ships
  second must match the other's arithmetic rather than re-derive it**; if they disagree, an order's tax
  changes the first time anybody edits a line, which is the sharpest silent bug available in this
  chain.
- **Whichever story extracts `RecalculateOrderTotals`** ([backlog item 1](#technical-tasks-for-the-backlog))
  — it consolidates the three call sites that now compute the same thing (this action, 0054's, and
  0048's three), reading `orders.tax_rate` / `orders.subtotal` / `orders.shipping_amount` and writing
  `tax_amount` / `total` per 0045's **D-8** identity.

### Risks

- **R-1 — An inactive region resolves silently and plausibly.** An inactive catalog row and an active one
  are the same row shape with the same `rate` column. A resolver that forgets the `is_active` check
  produces a real region id and a real-looking rate, and nothing surfaces until an accountant reconciles.
  *Mitigation:* the inactive case is its own dedicated test asserting **all three** columns, not folded
  into a fallback group — `backend-qa` named it the highest-risk case in the story.
- **R-2 — The Spain postal map loses an entry unnoticed.** A five-entry constant with six prefixes (35
  and 38 both map to Canarias) is exactly the shape where a copy-paste drops one, and the fallback then
  swallows the mistake: an order to Tenerife quietly becomes Península at 21% instead of 7%. *Mitigation:*
  the dataset carries **both** Canary prefixes as separate rows, and asserts the resolved rate against
  `SPAIN_TERRITORIES` rather than a literal.
- **R-3 — Money and rates compared as floats.** `decimal(6,3)` casts to a **string**. `toBe(21.00)` fails
  confusingly and `toEqual(21.0)` passes for the wrong reason. *Mitigation:* the test plan states
  decimal-string comparison explicitly, and **D-7** types the snapshot accordingly.
- **R-4 — `orders.shipping_country` case is not normalised on write.** 0041's validation accepts
  `[A-Za-z]{2}`, so a lowercase or mixed-case value is storable. A resolver matching the raw value against
  a lowercase `slug` would work for `'fr'` and silently fail for `'FR'` — falling back and flagging, which
  *looks* like a legitimate outcome. *Mitigation:* **D-4** lower-cases at the query and the three-case
  dataset asserts it.
- **R-5 — This document goes stale while it waits.** It is blocked behind 0045, which is itself blocked
  behind five Epic 2 stories, and it quotes column shapes (`shipping_country` at 2, `shipping_postal_code`
  at 20, `tax_rate` at `decimal(6,3)`, `products.type` as a `ProductType` enum) read from task files that
  are themselves still `new`. That is precisely the "a deferred finding is a claim about a tree, and the
  task file freezes while the tree does not" failure recorded in
  [errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23).
  *Mitigation:* **Phase 2's INVEST review must be re-run immediately before Phase 3**, and must
  re-verify every quoted shape against the shipped migrations. **This file's numbers are a reading aid,
  not a locator.**
- **R-6 — A future reader "unifies" the two resolvers.** Two classes named `Resolve*TaxRate` /
  `Resolve*TaxRegion`, both reading `sales_regions.rate`, both falling back to the catalog default, and
  neither calling the other, reads as duplication to anyone who has not read **D-1**. *Mitigation:*
  **D-1**, the acceptance criterion forbidding the reference, and the Definition-of-Done requirement that
  the docs pass state the boundary explicitly.
- **R-7 — The three copies of the tax arithmetic drift.** *(Added with **D-13**.)* After this amendment
  the same `tax_amount` / `total` computation exists in three places: this action, 0054's
  `ResolveVirtualOrderSalesRegion`, and 0048's three line-item actions. They are specified as identical
  and nothing enforces that — a corrected rounding, a changed `null` handling or a dropped
  `shipping_amount` term in one leaves the other two silently wrong, and the symptom is an order whose
  tax **changes** the first time somebody edits a line item. That is the worst available shape: it
  looks like the edit caused it. *Mitigation, in three layers:* **D-13**'s table states the computation
  once so all three can be diffed against a single written form; the Definition of Done requires the
  second of 0053/0054 to reach Phase 3 to verify parity **in code** rather than by reading a task file;
  and [backlog item 1](#technical-tasks-for-the-backlog) names the extraction that removes the risk
  structurally. ⚠️ **Note this is the drift **OQ-1**'s option 2 was originally rejected to avoid** — the
  rejection is now overturned with the cost accepted and named, rather than silently reversed.

### Resolved questions

| Question raised | By | Resolved as |
| --- | --- | --- |
| Does order tax call 0026's per-product resolver, or resolve once per order from the address? | backend-expert (open question A) | **D-1** — once per order, from the destination; 0026 is orthogonal and is not called |
| What happens to an order mixing physical and virtual line items? | backend-expert (open question B) | **D-2** — resolved by neither story; both check-and-skip and set `flagged_for_review` |
| A line item whose product row was deleted? | backend-expert / database-expert | **D-3** — treated as mixed: defer and flag |
| Is the matching key `slug` or `code`? | backend-qa and database-expert, independently | **D-4** — `slug`, matched against `strtolower(shipping_country)`; `code` is non-authoritative by the seeder's own docblock |
| Where does the Spain postal-prefix map live? | database-expert | **D-5** — a `public const` on the shared `ResolvesSalesRegionFromAddress` trait both this action and 0054's compose; not a table, not config, not `code` |
| Unmapped postal code, or an inactive resolved region? | database-expert | **D-6** — fall back to the `is_default` row **and** set `flagged_for_review` |
| Does a resolved region with a `null` rate fall back? | backend-qa | **D-6** case 5 — the region **is** recorded, the rate stays `null`, the flag is set |
| Is `tax_rate` a snapshot or a live read? | backend-expert | **D-7** — a snapshot, as a decimal string, pinned by a rate-change regression test |
| Inside `CreateOrder` or a separate call? | backend-expert | **D-8** — separate action, invoked after `CreateOrder` returns; 0045's scope fence forbids the alternative |
| Should an `OrderCreated` domain event centralise the three post-creation calls? | backend-expert | **D-9** — not here; recorded as a forward-looking suggestion for the orchestration story |
| Does the action authorize? | backend-expert | **D-11** — no, and the departure from the action-owns-the-rule convention is stated rather than silent |
| Does the postal map become an editable table later? | database-expert | **D-5** — stays a constant for now; a second country with sub-territories is the story that promotes it |
| Any new index? | database-expert | **D-12** — none; the existing `slug` UNIQUE suffices |
| Who computes `tax_amount` and re-derives `total`? *(raised as **OQ-1**, resolved after composition)* | facilitator, on story 0055's **R-6** / **OQ-1** escalation | **D-13** — this action does, at resolution time, using 0054's computation verbatim; the shared-action extraction survives as [backlog item 1](#technical-tasks-for-the-backlog) |

### Open questions

**OQ-1 — Who computes `orders.tax_amount` and re-derives `orders.total`? ✅ RESOLVED by decision D-13 —
this action does, at resolution time, using 0054's computation verbatim.** Kept rather than deleted,
because the reasoning that made it an open question is what makes **D-13** a decision rather than a
drive-by.

**As raised**, the question was genuinely underspecified: is tax applied to `subtotal` alone or also to
`shipping_amount`? Is it computed once over the order total, or per line item and summed (which rounds
differently)? PRD §3.2's *"the order totals and tax recalculate accordingly"* says the arithmetic is
**recomputed** on edit rather than written once, which read as an argument for handing the whole
concern to the line-item-editing story. Three options were put to the human:

1. **(was recommended)** A separate `RecalculateOrderTotals` action, owned by the line-item-editing
   story, invoked after this one at creation and again on every line-item change.
2. Fold the arithmetic into this story. Rejected **as drafted**, on the grounds that the editing story
   would then need a second implementation for the *edit* path.
3. Fold it into `CreateOrder`. Refused outright — 0045's scope fence forbids it, and at creation time
   no rate is resolved yet, so the value would always be `0.00`.

**What actually happened, and why option 2 is now adopted.** Options 1 and 2 were framed as mutually
exclusive, and they are not — option 2's stated objection (*"the editing story would need a second
implementation"*) was **already true before this question was answered**: story 0048 shipped its
**D-8** recomputation, and sibling story 0054 shipped the identical arithmetic in its own resolution
action. Two of the three implementations option 2 warned about existed while this story abstained, so
abstaining bought no consolidation and cost a visible inconsistency (story 0055's **R-6**). **D-13**
therefore adopts option 2's *computation* while keeping option 1's *goal* alive as a named extraction
— see [backlog item 1](#technical-tasks-for-the-backlog), re-pointed from "decide who computes this" to
"extract the shared action and re-point all three call sites".

The two sub-questions that made this hard are settled by **D-13**'s table and are no longer open: tax
applies to `subtotal` alone, and `shipping_amount` enters only as the third term of 0045 **D-8**'s
`total` identity; and it is computed **once over the order**, not per line item, so no per-line rounding
question arises here.

> **Still open, and deliberately not touched by D-13: *when* resolution is triggered at all.** That is
> [0054](0054-order-tax-region-resolution-virtual-backend.md)'s **OQ-2** and story
> [0055](0055-orders-list-detail-editor-ui.md)'s **OQ-1**, and it is a different question — this action
> remains "callable against a persisted order" (**D-8**) with no opinion about who calls it. Answering
> "who computes the amount" does not answer "who invokes the resolver", and 0055's **OQ-1** stays open
> on that half. *(Note this story has no open question of its own about the trigger — **D-8** settled it
> as "the caller's". 0055's OQ-1 attributes the deferral to "0053's **OQ-2**", which is this file's
> flagged-order question instead; the trigger deferral it means is 0054's OQ-2.)*

**OQ-2 — Should a flagged order block anything? Non-blocking, backlog.** `flagged_for_review` is
currently inert: nothing reads it, and this story only writes it. Whether a flagged order may be advanced
to `Enviado`, or whether the flag must be cleared first, is a status-transition rule belonging to
0048–0052 — and clearing the flag needs its own administrator-facing action, which nothing owns yet.
Recorded so nobody assumes the flag is load-bearing before something makes it so.

**OQ-3 — Does `orders.shipping_country` want normalising to uppercase on write? Non-blocking, backlog.**
**R-4**'s mitigation is a lower-casing read, which is correct and sufficient. Normalising on write (in
0041's `Customer` and 0045's snapshot) would be tidier and would make the stored value comparable
byte-for-byte, but it is a change to two other stories' columns and validation for a benefit this story
already obtains at the query. Raised, deliberately not taken.

### Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Extract a shared `RecalculateOrderTotals`** and re-point every call site at it. **Re-pointed by
   D-13** from its original *"decide who computes `tax_amount` / `total`"* — that is now decided, and
   what remains is consolidation: the identical `tax_amount` / `total` arithmetic exists in this
   action, in 0054's `ResolveVirtualOrderSalesRegion`, and in 0048's three line-item actions (its
   **D-8**). Three implementations of one formula is an accepted interim state, not a target; the
   extraction is a pure refactor with no contract change, and the trigger to take it is a fourth call
   site or the first divergence between the three. Note 0048's own [backlog item 1](0048-order-line-item-editing-backend.md)
   proposes the structurally identical extraction for its editable-state guard — the two are separate
   refactors of the same shape and should not be merged.
2. **Surface `flagged_for_review` in the Orders list and detail** (0055) — and decide, per **OQ-2**,
   whether it gates anything.
3. **An administrator-facing "re-resolve this order's tax" action**, which would be the authorizing
   operation **D-11** describes and would need to override **D-10**'s idempotency guard deliberately.
4. **Promote the Spain postal-prefix map to a real table** if and only if a second country gains fiscal
   sub-territories (**D-5**).
5. **Normalise country codes on write** (**OQ-3**).

## Provenance

- **PRD source:** [§3.2 Orders](../../docs/PRD/PRD.md#32-orders) — specifically the *"Physical product →
  the Sales Region is resolved from the order's shipping address"* rule, the scenario *"A physical
  product's order resolves tax from the shipping address"*, the scenario *"The resolved region's rate is
  used, with default fallback"*, and the acceptance criterion *"the order's tax Sales Region is resolved
  by product type"*. Also [§2.1 Sales Regions & Taxes](../../docs/PRD/PRD.md#21-sales-regions--taxes) for
  the default-fallback rule this story inherits.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `backend-expert`, `backend-qa` and `database-expert`, composed by `product-owner` as facilitator. **The
  debate raised two questions no contributor could settle alone** — the relationship to 0026's per-product
  resolver, and mixed-type carts — and both were resolved by the facilitator as documented functional
  decisions **D-1** and **D-2** rather than left open, with the reversal path named in each.
- **Amended after composition, once — decision D-13 (tax amount and total).** Not a re-debate and not a
  second Phase 1: sibling story [0054](0054-order-tax-region-resolution-virtual-backend.md) was
  composed *after* this file and computed `tax_amount` / `total` in its own resolution action, leaving
  the two halves of one feature inconsistent in a way an administrator would see on screen. Story
  [0055](0055-orders-list-detail-editor-ui.md)'s Phase 1 found it, recorded it as that story's **R-6** /
  **OQ-1**, and marked it *"BLOCKING for the epic"*. This file was amended to adopt 0054's computation
  verbatim. **The amendment is additive and reversible:** **OQ-1** is marked resolved rather than
  deleted, the superseded scope fence is flagged in place rather than removed, the old
  `tax_amount`-stays-zero test is recorded as deliberately replaced, and **D-13** carries its own
  reversal cost. Nothing else in this story's scope, decisions, dependencies or Gherkin moved — and no
  code exists yet for any of it, since the story is still `new` and ⛔ blocked.
- **Gherkin conventions:** every scenario opens with a named business-role actor ("an order
  administrator") and carries exactly one `When`, per
  [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 — mandatory
  across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md).
- **Verified rather than recalled:** `SalesRegionSeeder`'s `slug = strtolower($country['alpha2'])` write,
  its `DEFAULT_SLUG` / `SPAIN_SLUG` / `SPAIN_TERRITORIES` constants and the five territory slugs, and its
  docblock stating that nothing resolves by `code` — all read from
  [`database/seeders/SalesRegionSeeder.php`](../../database/seeders/SalesRegionSeeder.php) at composition
  time. `ProductType`'s two cases were read from
  [0024](done/0024-products-core-crud-backend.md); `orders`' column shapes and 0045's **D-2**/**D-4**/**D-8**/
  **D-9**/**D-10** from [0045](0045-orders-core-crud-backend.md); `ResolvedTaxRate`'s shape and tiers from
  [0026](in-progress/0026-product-sales-region-assignment-and-tax-resolution-backend.md).
- **Stage:** `new`, and **blocked** — see the banner under [Description](#description). It moves to
  `ai-spec/tasks/in-progress/` at the start of Phase 3, and to `ai-spec/tasks/done/` at Phase 7 — the
  first of those changes this file's directory depth, so every relative link above must be re-resolved on
  each move (both directions), per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
- **Epic 3 decomposition:** the physical half of Sales-Region tax resolution. Siblings referenced by
  number (0045 orders foundation, 0046 notification, 0048–0052 status/refunds, **0054 the virtual half**,
  0055 UI) because several of their files do not exist yet.
