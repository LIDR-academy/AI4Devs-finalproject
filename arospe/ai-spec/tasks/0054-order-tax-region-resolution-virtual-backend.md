# [0054] Order tax Sales-Region resolution — virtual products (backend)

## Description
Resolve an order's tax **Sales Region** from its own frozen **billing** address snapshot when the
order is for a **virtual** (digital) product, write the resolved region, rate and tax amount onto the
order, and ship the **geo/fraud-check mechanism** PRD [§3.2](../../docs/PRD/PRD.md#32-orders)
describes — three new `orders` columns plus the billing-country-vs-IP-country comparison that sets
`flagged_for_review`. This story is the virtual-product sibling of story 0053 (physical products,
shipping address); the two are independent of each other and both depend only on
[0045](0045-orders-core-crud-backend.md).

> ## ⛔ BLOCKED — inherited cross-epic dependency (read this before Phase 3)
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until
> [0045](0045-orders-core-crud-backend.md) is `done` — and 0045 is itself blocked on PRD Epic 2
> stories 0024, 0029, 0035, 0036 and 0038.** There is no `orders` table, no `Order` model and no
> `billing_*` snapshot to read until 0045 ships. This story adds columns to a table that does not
> exist yet.
>
> It additionally consumes [0026](in-progress/0026-product-sales-region-assignment-and-tax-resolution-backend.md)'s
> `ResolveProductTaxRate` / `ResolvedTaxRate` contract and 0024's `ProductType` enum. See
> [Dependencies](#dependencies).
>
> **What is *not* blocked:** this document. Specifying it now is what lets 0045 ship with
> `flagged_for_review` and the `billing_*` columns already in place — which it did, deliberately,
> anticipating this story (0045 **D-4**, **D-10**).

## Type
backend | includes database-expert: **yes**

### Three Amigos participants

- `backend-expert` — the resolution action's shape, the IP-geolocation dependency question, the
  storage columns, and the mirror-of-0053 structure.
- `backend-qa` — risk-based test design, the mismatch/atomicity regression cases, and the
  never-partially-resolved-and-flagged invariant.
- `database-expert` — the three new columns, their types, nullability, and the confirmed absence of
  any new index.

---

## 🔷 THE CENTRAL DECISION — what "the purchaser's IP-derived location" means in an app with no checkout

**All three contributors independently flagged this as the single most important open question and
each refused to guess at a default. It is resolved here, as facilitator, under
[contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule — with both the interim default
*and* an explicit escalation, so the human can overturn it as a decision rather than rediscover it as
a surprise.**

### The problem

PRD §3.2 says a virtual-product order's billing address "must first be **validated to match the
purchaser's IP-address-derived location**", and that a mismatch **flags the order for manual review**
instead of auto-resolving tax.

But this app has **no public storefront and no checkout** — PRD Epic 3's own stated boundary. Orders
originate from *manual admin entry* or from *a future external channel that does not exist yet*. So
for **every order this application can currently produce, there is no purchaser IP at all**: nothing
in the request that creates an order carries the purchaser's address, because there is no purchaser
making a request. The administrator's own IP is not the purchaser's, and treating it as such would be
worse than having none.

### The resolution — interim default for this story's scope

> **An order with no captured IP data — which is EVERY order today — is treated as "no geo-check
> possible" and skips the mismatch check entirely.** It resolves tax normally from the order's frozen
> `billing_*` address snapshot alone (the same logic story 0053 applies to `shipping_*`, reading the
> other six columns), with `flagged_for_review` staying `false` and `flag_reason` staying `null`.

**Reasoning, stated in full so an override is cheap:**

1. **An administrator manually entering an order IS the trusted source of truth for that order's
   data.** The geo/fraud check exists to catch a *purchaser* asserting a billing location that
   contradicts where they demonstrably are. In a channel with **no purchaser-facing form at all**,
   there is no claimed location and nothing to contradict — the administrator typed both halves.
2. **Treating administrator-entered data as inherently suspect is a false-positive generator with
   zero fraud-prevention value in the current channel.** The alternative default — flag every order
   whose IP data is absent — would flag *100% of orders this app can create*, permanently, making
   `flagged_for_review` meaningless as a signal and making manual review a mandatory step on every
   single order. A flag that fires always is not a control; it is noise that trains administrators to
   dismiss it.
3. **The failure directions are asymmetric and both are recoverable.** Skipping the check on an
   admin-entered order under-flags a scenario that cannot currently occur; flagging everything
   under-serves every scenario that *does* occur. The first costs nothing today and self-corrects the
   moment real IP data arrives; the second costs every order, every day, until someone turns it off.

### The escalation — this is NOT scope-cutting, and it is NOT silent

**The IP-mismatch-flagging behaviour PRD §3.2 describes is effectively *dormant* until a future
external ordering channel — which this application does not have — supplies real purchaser IP data by
populating `orders.ip_address` / `orders.ip_derived_country`.**

**This story still builds the whole flagging mechanism**: the two IP columns, the `flag_reason`
column, the billing-country-vs-IP-country comparison, the `flagged_for_review` write, the
tax-fields-stay-null-when-flagged rule, and a full test suite that exercises **both** branches by
populating those columns directly. That is deliberate: it is **forward-compatible infrastructure
whose trigger condition does not fire yet**, not a feature deferred. The day a channel starts writing
`ip_address` / `ip_derived_country`, the check activates automatically with **no code change** — and
it will already be under test.

Two consequences worth stating plainly:

- **The mechanism is tested, not dead.** The mismatch and match branches are both proven by tests that
  set the IP columns directly, so the dormant path is never "untested code waiting to be wrong".
- **No IP-geolocation dependency is added by this story.** `backend-expert` correctly flagged that
  adding one needs human approval per project `CLAUDE.md` ("do not change the application's
  dependencies without approval"), and recommended a bundled GeoLite2-style database file mirroring
  this repo's [`database/data/`](../../docs/conventions/base-standards.md#directory-structure)
  fixture precedent over a third-party API call. **Under this resolution that question does not need
  answering yet**: this story stores an *already-derived* country code and compares it. Deriving a
  country **from** an IP address is explicitly out of scope and is
  [backlog item 1](#technical-tasks-for-the-backlog).

> ### ⚠️ Recommended human confirmation before Phase 3 — non-blocking, but important
>
> **This is a genuine product/business judgment with real behavioural consequences, not a technical
> implementation detail.** The facilitator's reading above is recorded as an interim default; please
> confirm it is acceptable before Phase 3 begins. The alternative, if the business prefers it:
>
> | Option | Behaviour when no IP data is captured | Consequence |
> | --- | --- | --- |
> | **(a) Skip the check — resolve normally (recommended)** | `flagged_for_review` stays `false`; tax resolves from the billing address | Zero flags today; the control activates automatically when a real channel arrives |
> | **(b) Flag every order with no IP data** | Every virtual-product order is flagged; tax stays unresolved | 100% flag rate on every order the app can currently create; manual review becomes mandatory on all of them |
>
> **(a) is recommended** for the three reasons above. It is reversible by a single branch in one
> action plus its tests — no column, no migration and no contract moves either way.

---

## Gherkin

```gherkin
Feature: Sales Region tax resolution for virtual-product orders (backend)

  # --- The path every order takes today: no IP data captured ---

  Scenario: A virtual-product order with no captured IP data resolves tax from its billing address
    Given an order administrator, with a virtual-product order whose billing address is in mainland Spain and which carries no purchaser IP data
    When the order's Sales Region is resolved
    Then the order records the mainland Spain region and that region's rate

  Scenario: An order with no captured IP data is not flagged for manual review
    Given an order administrator, with a virtual-product order that carries no purchaser IP data
    When the order's Sales Region is resolved
    Then the order is not flagged for manual review and records no flag reason

  Scenario: A billing address in a Spanish fiscal territory resolves to that territory
    Given an order administrator, with a virtual-product order whose billing address is in the Canary Islands
    When the order's Sales Region is resolved
    Then the order records the Canary Islands region rather than mainland Spain

  Scenario: A billing country the product does not target falls back to the catalog default
    Given an order administrator, with a virtual-product order whose billing country the product is not assigned to
    When the order's Sales Region is resolved
    Then the order records the catalog default region and that entry's rate

  Scenario: An order for a customer who had no billing address falls back to the catalog default
    Given an order administrator, with a virtual-product order whose billing address snapshot is empty
    When the order's Sales Region is resolved
    Then the order records the catalog default region rather than being flagged

  # --- The dormant geo/fraud check, exercised directly ---

  Scenario: A billing country matching the captured IP-derived country resolves tax normally
    Given an order administrator, with a virtual-product order whose billing country and captured IP-derived country are both Spain
    When the order's Sales Region is resolved
    Then the order records the resolved region and is not flagged for manual review

  Scenario: A billing country contradicting the captured IP-derived country is flagged for manual review
    Given an order administrator, with a virtual-product order whose billing country is Spain and whose captured IP-derived country is France
    When the order's Sales Region is resolved
    Then the order is flagged for manual review, recording the mismatch as its flag reason

  Scenario: A flagged order has no tax resolved against it
    Given an order administrator, with a virtual-product order whose billing country contradicts its captured IP-derived country
    When the order's Sales Region is resolved
    Then the order records no sales region, no tax rate and no tax amount

  # --- The resolved rate ---

  Scenario: The resolved region's own rate is recorded on the order
    Given an order administrator, with a virtual-product order resolving to a region the product targets
    When the order's tax is computed
    Then the order records that region's configured rate

  Scenario: A resolved region with no configured rate records no rate
    Given an order administrator, with a virtual-product order resolving to a region carrying no configured rate
    When the order's tax is computed
    Then the order records no tax rate, distinct from a rate of zero

  Scenario: A resolved region with a zero rate records a zero rate
    Given an order administrator, with a virtual-product order resolving to a region whose configured rate is zero percent
    When the order's tax is computed
    Then the order records a rate of zero, distinct from no rate at all

  Scenario: The order's total absorbs the computed tax amount
    Given an order administrator, with a virtual-product order subtotalling 100.00 resolving to a 21% region
    When the order's tax is computed
    Then the order records a tax amount of 21.00 and a total of 121.00

  # --- The frozen snapshot is what is read ---

  Scenario: Resolution reads the order's own billing address, not the customer's current one
    Given an order administrator, with a resolved virtual-product order whose customer subsequently moves to another country
    When that order's Sales Region is resolved again
    Then it still resolves from the billing address as it stood at order time

  # --- Refusals and edge cases ---

  Scenario: An order for a physical product is refused by this resolution path
    Given an order administrator, with an order whose line items are all physical products
    When the virtual-product resolution path is invoked against it
    Then the attempt is refused and the order is left untouched

  Scenario: A resolution that cannot complete leaves the order entirely unchanged
    Given an order administrator, with an unresolved virtual-product order and no catalog default region configured
    When the order's Sales Region resolution fails
    Then the order records no sales region, no rate, no tax amount and no flag
```

## Files to create/modify

### Migration — `add_geo_fraud_check_columns_to_orders_table` (new)

`database/migrations/<ts>_add_geo_fraud_check_columns_to_orders_table.php` — **new**. Story 0045
shipped `flagged_for_review` anticipating this story (its **D-10**) but **not** the three columns the
check itself needs, because nothing then knew what they should hold. This story is what needs them, so
this story adds them — an `ALTER` against a table 0045 already created, per
[migrations.md](../../docs/database/migrations.md#adding-a-column-to-an-existing-table).

```php
public function up(): void
{
    Schema::table('orders', function (Blueprint $table): void {
        $table->string('ip_address', 45)->after('flagged_for_review')->nullable();
        $table->string('ip_derived_country', 2)->after('ip_address')->nullable();
        $table->string('flag_reason', 64)->after('ip_derived_country')->nullable();
    });
}

public function down(): void
{
    Schema::table('orders', function (Blueprint $table): void {
        $table->dropColumn(['ip_address', 'ip_derived_country', 'flag_reason']);
    });
}
```

| Column | Type | Why |
| --- | --- | --- |
| `ip_address` | `VARCHAR(45)`, nullable | 45 characters is the IPv6-safe maximum (an IPv4-mapped IPv6 address, `::ffff:255.255.255.255`, is 45 characters). Length-capped, never a bare `string()` — the `users.status` precedent. **`NULL` is the state of every row today** and means "no IP was captured", never "an IP was captured and was empty" |
| `ip_derived_country` | `VARCHAR(2)`, nullable | An ISO 3166-1 alpha-2 code, matching `orders.billing_country` / `customers.*_country` column-for-column so the comparison is like-for-like. Deliberately **not** a full region — the check PRD §3.2 describes is a country/region-level match, and a city-level one would flag every legitimate traveller |
| `flag_reason` | `VARCHAR(64)`, nullable | Records **why** an order was flagged, so an administrator reviewing it sees the cause without re-deriving the comparison by hand — this repo's "explicit state over re-derivation" preference. See **D-4** for why it is a bounded `VARCHAR` holding a snake_case token rather than `TEXT` holding prose |

**No index on any of the three**, confirmed by `database-expert` and consistent with every
cardinality argument this repo has already made (`users.status`, `sales_regions.is_default`,
`orders.status`): nothing joins or filters on them, `ip_derived_country` is a two-character token over
a backoffice-sized table, and `flag_reason` is `NULL` on effectively every row. If a future
"flagged orders" list filter appears, its index belongs to that story with a measurement behind it —
[backlog item 2](#technical-tasks-for-the-backlog). Verify with `php artisan db:table orders` after
migrating, never by reading the migration
([migrations.md](../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)).

### Model — `app/Models/Order.php` (modify)

- Add `ip_address`, `ip_derived_country` and `flag_reason` to the **`@property`** docblock.
- **All three are deliberately omitted from `#[Fillable]`**, joining `flagged_for_review`,
  `sales_region_id`, `tax_rate`, `tax_amount` and `total` in 0045's omission list. Omission **is**
  this codebase's mass-assignment guard
  ([base-standards.md](../../docs/conventions/base-standards.md#model-conventions)): a caller that
  could set its own `ip_derived_country` could set it equal to whatever billing country it submitted
  and disable the check from the outside, which is the single sharpest write this story adds.
- **No cast** on any of the three: two are plain strings and `flag_reason` is a token compared as a
  string (**D-4**).
- No new relation. `salesRegion` already exists from 0045.

### Action — `app/Actions/Orders/ResolveVirtualOrderSalesRegion.php` (new)

Invokable, imperative-verb-phrase class with no `Action`/`Service` suffix, resolved from the container
and never `new`-ed
([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)).

```php
public function __invoke(Order $order): void
```

It performs, in this order:

1. **Determine homogeneity, per [OQ-1](#open-questions)'s resolution (settled, not blocking).** If
   every line item is `Physical`, this action is a no-op (0053's order entirely). If every line item
   is `Virtual`, continue to step 2. If the order is genuinely **mixed** (at least one `Physical` and
   at least one `Virtual` line item), this action writes `flagged_for_review = true` and
   `flag_reason = self::REASON_MIXED_BASKET`, leaves `sales_region_id`/`tax_rate`/`tax_amount` at
   `null`/`0.00`, and returns — the *same* guard 0053's **D-2**/**D-3** specify verbatim on its side,
   so a mixed order is resolved by **neither** action and flagged by **whichever runs**, idempotently
   (both would write the identical reason constant, so running order between 0053 and 0054 doesn't
   matter). This is not a programming-error throw: an order arriving with an unexpected type mix is a
   real, reachable state (0045 permits it), not a caller bug.
2. **Read the order's own frozen `billing_*` snapshot.** Never `$order->customer->billing_*` — 0045
   **D-4** exists precisely so a customer who moves house cannot retroactively change the tax basis of
   a two-year-old order, and re-introducing the live join here is the failure that decision was
   written to prevent.
3. **Run the geo/fraud check — and skip it when there is nothing to check.**
   - `ip_derived_country` is `NULL` (every order today) ⇒ **no check is possible; continue to step 4**
     (the central decision above).
   - `ip_derived_country` is present and equals `billing_country` (case-insensitively, both being
     alpha-2 codes) ⇒ continue to step 4.
   - `ip_derived_country` is present and differs ⇒ **flag and stop**: write `flagged_for_review = true`
     and `flag_reason = self::REASON_BILLING_IP_COUNTRY_MISMATCH`, leave `sales_region_id`, `tax_rate`
     and `tax_amount` untouched at `null`/`0.00`, and return. **Never both flag and resolve** (**D-5**).
   - `billing_country` is absent ⇒ no comparison is possible ⇒ continue to step 4 (**D-3**).
4. **Map the billing address to a Sales Region catalog row** through the shared
   `ResolvesSalesRegionFromAddress` trait (below) —
   `$this->resolveSalesRegionFromAddress($order->billing_country, $order->billing_postal_code)`, the
   *same* call [0053](0053-order-tax-region-resolution-physical-backend.md) makes with its
   **shipping** columns — then ask
   [0026](in-progress/0026-product-sales-region-assignment-and-tax-resolution-backend.md)'s
   `ResolveProductTaxRate(Product, SalesRegion): ResolvedTaxRate` for the rate. That action already
   owns the two-tier assigned-entry/catalog-default fallback and honours `null` and `'0.000'` as
   distinct answers — **this story re-implements none of it**.
5. **Write the outcome inside a `DB::transaction()`**: `sales_region_id`, `tax_rate`, the derived
   `tax_amount`, and the recomputed `total` — via `forceFill()`, since every one of those columns is
   deliberately non-fillable.

> **Phase 3 must re-read the transaction-side-effect rule before writing step 5**, per
> [errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21).
> The forward-looking constraint here is specific: **if a later story notifies on a flag, that
> dispatch must happen after the commit**, or a rolled-back resolution mails somebody about a flag
> that does not exist — the same rule 0045 states for its own "new order received" notification.

**This action self-authorizes nothing** (**D-6**), following
[0026](in-progress/0026-product-sales-region-assignment-and-tax-resolution-backend.md)'s precedent rather than
0045's: it is a pipeline step that Epic 3 may run with **no acting user at all** (the future external
channel), and a `Gate::authorize()` there would either fail closed for every machine-originated order
or be satisfied by a fictional actor. The gate belongs to whichever caller a human actually drives —
story 0055's manual "re-resolve" control — and that is discharged as a
[Definition-of-Done hand-off](#definition-of-done), not silently assumed safe.

### Trait — `app/Concerns/ResolvesSalesRegionFromAddress.php` (**create if absent** — shared with 0053)

```php
protected function resolveSalesRegionFromAddress(?string $countryCode, ?string $postalCode): ?SalesRegion
```

Maps a country code plus a postal code to a `sales_regions` catalog row: the ISO alpha-2 code
lower-cased and matched against `sales_regions.slug` — **never `code`** — and, for Spain, the
postal-code prefix to the correct fiscal territory (Península / Baleares / Canarias / Ceuta /
Melilla), which is the one place in the catalog where a country code alone is not enough.

**It returns the matched row, or `null` when the address maps to none, and it applies no fallback
policy of its own.** That split is what lets one mapping serve two stories whose fallbacks genuinely
differ: 0053 falls back to the `is_default` row and sets `flagged_for_review` (its **D-6**), while
this story falls through to 0026's catalog-default tier. It likewise returns a matched row
**regardless of `is_active`**, so each caller keeps its own activity policy — 0053 treats an inactive
row as a fallback case, this story hands the row to `ResolveProductTaxRate` and inherits whatever
0026 defines for an inactive entry.

**The country→`slug` rule and the Spain postal-prefix map are
[0053's **D-4** and **D-5**](0053-order-tax-region-resolution-physical-backend.md#documented-functional-decisions),
which reasoned them out first and rejected the alternatives (a `sales_region_postal_prefixes` table, a
`config/` file, `sales_regions.code`). This file references them and deliberately restates neither.**
The map is `SPAIN_POSTAL_PREFIX_TERRITORIES`, a `public const` on the trait itself — on the trait
rather than on either action precisely so neither action has to import the other's class constant.

**This is the one artifact stories 0053 and 0054 share, and it is deliberately specified as
*create-if-absent* rather than as a dependency in either direction** (**D-7**). Whichever of the two
stories reaches Phase 3 first creates it; the second **consumes it unchanged** and adds only tests for
the paths its own branch exercises. Neither story blocks the other, and neither may fork a second
copy — two implementations of one mapping is exactly the drift this project's conventions spend most
of their effort preventing.

Two shape notes for whichever story writes it. It is a **trait composed by both actions**, not a
fourth invokable action, because a shared invokable would have to be injected into two actions whose
`__invoke()` signatures are already public contracts
([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)),
while `app/Concerns/` is where this repo already puts logic two classes compose. And it stays **flat
and single-concern**, `use`ing no other trait, per
[naming.md](../../docs/conventions/naming.md#traits-and-their-methods) — note its name follows the
third-person-verb-phrase shape rather than the `<Noun>ValidationRules` shape, which is specific to
validation rule sets and does not apply here.

### Translations — `lang/en/orders.php` + `lang/es/orders.php` (modify)

One new key group, `flag_reasons`, key-for-key identical across both locales
([naming.md](../../docs/conventions/naming.md#translation-keys)), with exactly one leaf today:
`billing_ip_country_mismatch`. It ships here rather than with the UI story for the same reason 0045
shipped `statuses` / `payment_statuses` here rather than with 0055 — the value set is this story's, and
the screen that renders it is not. **No screen copy, no button labels, no validation-message
overrides.**

### Explicitly **not** touched by this story

- `database/seeders/RolePermissionSeeder.php` — no permission is added; this action authorizes nothing.
- `routes/*.php`, `config/modules.php`, `app/Livewire/**`, `resources/views/**` — story 0055's.
- `app/Policies/**` — none is created; 0045 **D-13** already names 0048–0052 as `OrderPolicy`'s owner.
- `App\Actions\Orders\CreateOrder` — **unchanged**. Resolution is a separate step invoked after
  creation, not folded into it; see **D-8**.
- `App\Actions\Products\ResolveProductTaxRate` / `ResolvedTaxRate` / `TaxRateResolutionTier` — consumed
  verbatim, modified in no way.
- The `shipping_*` snapshot columns and any physical-product path — story 0053's, entirely.
- Anything that *derives* a country from an IP address — out of scope by the central decision, and a
  dependency question requiring human approval ([backlog item 1](#technical-tasks-for-the-backlog)).

## Tests to perform

All Feature tests unless marked otherwise, in the existing `tests/Feature/Orders/` folder from 0045.
This story ships no route, so **every** test here is action-level.

### Schema & model

- [ ] Integration test: the three new columns exist on `orders` with the expected types and are
      `NULL` on a freshly created order — the "nothing is falsely resolved" posture 0045 established,
      extended to this story's own columns.
- [ ] **Integration test (mass-assignment guard):** `Order::create([... 'ip_derived_country' => 'ES',
      'flag_reason' => 'x', 'ip_address' => '1.2.3.4' ...])` writes **none** of the three. The
      omission-as-guard convention is only real if something fails when it is undone, and this one is
      security-relevant: a caller able to set `ip_derived_country` can disable the check from outside.

### The path every order takes today — no IP data

- [ ] Integration test: a virtual-product order with `ip_derived_country = null` and a mainland-Spain
      billing address resolves to the mainland Spain entry, records its rate, and leaves
      `flagged_for_review` `false` and `flag_reason` `null`. **This is the story's primary happy
      path**, because under the central decision it is *every* order the app can currently create.
- [ ] Integration test: `ip_address` being populated while `ip_derived_country` is `null` still skips
      the check — the trigger is the **derived country**, not the raw address, and an implementation
      keying off `ip_address` would flag every order the day a channel starts recording addresses
      without deriving countries from them.

### The billing-address mapping

- [ ] Integration test (dataset): billing postal codes in Canarias, Ceuta, Melilla, Baleares and
      Península each resolve to their own fiscal territory rather than to a single "España" row —
      reusing the shared `ResolvesSalesRegionFromAddress` trait (**D-7**), asserted from **this**
      story's `billing_postal_code` column.
- [ ] Integration test: a billing country the product is not assigned to falls back to the catalog
      default entry, with `ResolvedTaxRate::$tier` reported as `CatalogDefault`.
- [ ] **Regression test:** resolve an order, then change the **customer's** `billing_country` and
      `billing_postal_code` and re-resolve the order; assert it resolves from the order's own frozen
      snapshot, unchanged. Same failure mode and same reason as 0045's price- and address-snapshot
      regressions — a live join instead of a snapshot is invisible until somebody moves house.
- [ ] Integration test: an order whose entire billing snapshot is `null` (a legitimate state — story
      0041 **D-3** makes a customer's addresses optional) resolves to the catalog default and is
      **not** flagged (**D-3**).

### The dormant geo/fraud check — exercised directly

The IP columns are populated by the test itself, since no channel populates them yet. **This group is
what makes the mechanism forward-compatible infrastructure rather than dead code**, and it is not
optional.

- [ ] Integration test: `billing_country = 'ES'`, `ip_derived_country = 'ES'` → resolves normally, not
      flagged.
- [ ] Integration test: `billing_country = 'ES'`, `ip_derived_country = 'FR'` → `flagged_for_review`
      is `true` and `flag_reason` is the mismatch token.
- [ ] **Integration test (the highest-risk invariant, and `backend-qa`'s explicit call): a flagged
      order is NEVER also resolved.** Assert `sales_region_id`, `tax_rate` and `tax_amount` are **all**
      still `null`/`0.00` on the flagged order, re-fetched from the database (`->fresh()`, never the
      in-memory instance). Asserting only "it was flagged" would pass against an implementation that
      resolves tax *and then* flags — which is the worst outcome available here, because a flagged
      order carrying a confident-looking tax figure is exactly what manual review would rubber-stamp.
- [ ] Integration test: the comparison is case-insensitive (`'es'` vs `'ES'` does not flag) — a
      channel supplying lowercase codes must not flag every order it sends.
- [ ] Integration test: `billing_country = null` with `ip_derived_country` present does **not** flag —
      an absent billing country is a data gap, not a contradiction (**D-3**).

### The rate and the totals

- [ ] Integration test: a resolved region carrying a configured rate writes that rate to
      `orders.tax_rate`, compared as a **decimal string** and never as a float (0045 **R-3**).
- [ ] **Integration test: `null` and `'0.000'` resolve differently** — a region with no configured
      rate writes `tax_rate = null` and `tax_amount = 0.00`; a region configured at `0.000` writes
      `tax_rate = '0.000'` and `tax_amount = 0.00`. The two must not share a representation, exactly as
      [`sales_regions.rate`](../../docs/database/schema.md#sales_regions) establishes. **A test
      asserting only the amounts would pass against an implementation that conflates them.**
- [ ] Integration test: `subtotal` `100.00` at a 21% rate writes `tax_amount` `21.00` and `total`
      `121.00`, as decimal strings — proving 0045 **D-8**'s written-out
      `total = subtotal + tax_amount + shipping_amount` identity stays true once a later story fills a
      term in, rather than being rewritten.
- [ ] Integration test: resolving an order **twice** is idempotent — the second run produces the same
      region, rate, amount and total, and does not add the tax a second time. An implementation that
      does `total += tax_amount` rather than recomputing from `subtotal` passes every single-run test.

### Refusals and atomicity

- [ ] Negative test: invoking this action against an order whose line items are all **physical**
      throws, and leaves every one of the order's tax columns and both flag columns untouched.
- [ ] **Negative test (atomicity):** with no catalog default region configured, 0026's resolver throws;
      assert the order is left with `sales_region_id` `null`, `tax_rate` `null`, `tax_amount` `0.00`,
      `flagged_for_review` `false` **and** `flag_reason` `null` — no half-written state of any kind.
- [ ] Integration test: an **inactive** Sales Region matching the billing address behaves exactly as
      0026's resolver defines for an inactive assigned entry — asserted rather than assumed, because
      this is the same class of gap 0053 answers for the shipping path and the two must not diverge.

### Deliberately not tested

- **Deriving a country from an IP address** — no such code exists in this story, by decision.
- Any status transition, refund, notification or rendered screen (0048–0052, 0046, 0055).
- The physical-product path (0053), and the `ResolvesSalesRegionFromAddress` trait's *own* correctness
  if 0053 created it first — this story tests the mapping **through its own billing columns**, not the
  trait's internals twice.
- `ResolveProductTaxRate`'s two-tier algorithm — 0026's, entirely. This story asserts it is *called
  with the right destination*, not that it is internally correct.
- Migration `up()`/`down()` mechanics ([what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)).

## Expected outcome

A virtual-product order can have its tax Sales Region resolved from its **own frozen billing address
snapshot** — including Spain's fiscal territories, resolved by postal prefix — with the rate answered
by story 0026's existing two-tier resolver and written onto the order alongside the derived `tax_amount`
and a recomputed `total`. `null` and `0.000` stay distinguishable end to end.

The `orders` table carries three new columns — `ip_address`, `ip_derived_country`, `flag_reason` — and
the complete geo/fraud-check mechanism PRD §3.2 describes: a billing-country-vs-IP-country comparison
that, on a mismatch, **flags the order for manual review with a recorded reason and resolves no tax at
all**. Both branches are under test.

**And the trigger condition does not fire yet.** With no storefront and no external channel, every
order this application can currently create carries no IP data, takes the "no geo-check possible" path,
and resolves tax normally without ever being flagged. The mechanism activates automatically, with no
code change, the day a channel begins populating those columns.

## Acceptance criteria

- [ ] `orders` carries `ip_address` (`VARCHAR(45)`), `ip_derived_country` (`VARCHAR(2)`) and
      `flag_reason` (`VARCHAR(64)`), all nullable, verified with `php artisan db:table orders`.
- [ ] **No index exists on any of the three**, and the migration writes none.
- [ ] All three are omitted from `Order`'s `#[Fillable]`, pinned by a test that fails if the omission
      is undone.
- [ ] `App\Actions\Orders\ResolveVirtualOrderSalesRegion` exists, takes an `Order`, and refuses an
      order that is not virtual.
- [ ] **An order with `ip_derived_country` `null` skips the geo check entirely and resolves tax
      normally**, leaving `flagged_for_review` `false` and `flag_reason` `null` — the central decision,
      pinned by a test.
- [ ] An order whose `ip_derived_country` differs from its `billing_country` is flagged with the
      mismatch reason **and** has `sales_region_id`, `tax_rate` and `tax_amount` left unresolved —
      never both flagged and resolved.
- [ ] The comparison is case-insensitive and treats an absent `billing_country` as "no comparison
      possible", not as a mismatch.
- [ ] Resolution reads the order's own `billing_*` snapshot and never the customer's live address,
      pinned by a mutate-then-re-resolve regression test.
- [ ] The rate comes from `ResolveProductTaxRate`; `null` and `'0.000'` are written distinctly, and
      `total` equals `subtotal + tax_amount + shipping_amount` computed from `subtotal` rather than
      accumulated.
- [ ] Resolving the same order twice is idempotent.
- [ ] `lang/{en,es}/orders.php` gain a `flag_reasons` group, key-for-key identical, with the one
      mismatch leaf and no screen copy.
- [ ] No route, Livewire component, Blade view, policy, notification, listener or permission is added,
      and `CreateOrder` is unchanged.
- [ ] **No IP-geolocation dependency, service, fixture or bundled database is added** — deriving a
      country from an IP address is out of scope and remains a backlog item pending human approval.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule) — run **unscoped**
      (`php artisan test`, not `--filter`), per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that `ip_derived_country` and `flag_reason`
      cannot be caller-supplied (a caller who can set the former disables the check); that a flagged
      order is never also tax-resolved; and that skipping the check on absent IP data is a **recorded
      decision** (the central decision above) rather than an oversight.
- [ ] **The central decision has been confirmed or overturned by the human**, and the outcome recorded
      in this file. Non-blocking for Phase 2; **required before Phase 3**.
- [x] **[OQ-1](#open-questions) (mixed-basket orders) is settled** — defer-and-flag, recorded
      identically in this file and in 0053's D-2/D-3.
- [ ] Documentation updated (docs-keeper):
  - [`database/schema.md`](../../docs/database/schema.md)'s `orders` section gains the three columns,
    with the "`NULL` means no IP was captured" note and the no-index reasoning.
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md)'s directory listing
    gains this story's action under `app/Actions/Orders/` and — if this story is the one that creates
    it (**D-7**) — `ResolvesSalesRegionFromAddress` under `app/Concerns/`, whose listed purpose there
    ("Shared traits (validation rule sets)") stops being accurate the day the first non-validation
    trait lands in that folder.
  - The dormancy is recorded **where a reader will meet it** — in `schema.md` beside the columns, not
    only in this task file — so nobody later reads `flagged_for_review` being universally `false` as a
    broken feature. This is the [bare-negative-claim](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
    failure mode inverted: a **positive** claim ("orders are flagged on an IP mismatch") that is true
    of the code and false of every row.
- [ ] Acceptance criteria met.

## Documented functional decisions

Each is a **conservative, reversible default the human may override** — the reasoning is recorded so an
override is a decision rather than a rediscovery.

- **D-1 — See [the central decision](#-the-central-decision--what-the-purchasers-ip-derived-location-means-in-an-app-with-no-checkout).**
  An order with no captured IP data skips the geo check and resolves tax normally. Interim default;
  human confirmation recommended before Phase 3.
- **D-2 — The three columns ship here, not in 0045.** 0045 shipped `flagged_for_review` early (its
  **D-10**) on the "it lives on a table a sibling story will already be writing to" argument, and
  correctly stopped there: nothing then knew what the check would *read*. This story is what needs
  them, so this story adds them. An `ALTER` against a table whose only rows are this phase's own is
  cheap; guessing the columns a story ahead of its requirements is not.
- **D-3 — An absent `billing_country`, or an absent billing address entirely, is "no comparison
  possible" — never a mismatch.** A `null` on either side of a comparison is a data gap, and flagging
  on it would make an address-less customer (a legitimate state per story 0041 **D-3**) permanently
  suspicious. The order falls through to 0026's catalog-default tier, which is what that tier exists
  for. *Reversal cost: one branch.*
- **D-4 — `flag_reason` is a bounded `VARCHAR(64)` holding a snake_case token, not `TEXT` holding
  prose.** `database-expert` recommended a "companion text column"; the *column* is adopted unchanged
  and only its type is refined, recorded here as a decision rather than a silent edit. Two reasons:
  every string column in this repo is length-capped
  ([migrations.md](../../docs/database/migrations.md#uuid-primary-keys)), and a token resolved through
  `lang/{en,es}/orders.php`'s `flag_reasons` group is reachable from `lang/es/` while an English
  sentence written into the column is not — the same rule that keeps copy out of `config/modules.php`.
  **No `OrderFlagReason` enum is created**: it would have exactly one case, currently unreachable, and
  a one-case enum is speculation. The token is a `public const` on the action that writes it, per the
  [name-a-string-once-on-the-class-that-owns-the-rule](../../docs/conventions/naming.md#permission-names)
  convention. A second reason arriving is what justifies the enum, and that is
  [backlog item 3](#technical-tasks-for-the-backlog).
- **D-5 — An order is never both flagged and tax-resolved.** PRD §3.2 says a mismatch flags the order
  "**instead of** auto-resolving tax". The flag-and-stop ordering is not an implementation detail: a
  flagged order carrying a confident-looking `tax_rate` is materially worse than an unflagged one,
  because manual review reads a populated column as a working answer. Asserted from both sides.
- **D-6 — The resolution action self-authorizes nothing**, following
  [0026](in-progress/0026-product-sales-region-assignment-and-tax-resolution-backend.md)'s precedent rather than
  0045's `CreateOrder`. It is a pipeline step Epic 3 may run with **no acting user at all** — the whole
  premise of the external channel PRD §3.2 assumes. A `Gate::authorize()` here would fail closed for
  every machine-originated order. The gate belongs to the human-driven caller (story 0055's re-resolve
  control) and is discharged as a Definition-of-Done hand-off, exactly as 0026 discharged the same gap
  to 0027 — not silently assumed safe.
- **D-7 — The address→region mapping is a shared, create-if-absent `app/Concerns/` trait, not a
  dependency in either direction — and its rules are 0053's, referenced rather than re-decided here.**
  Stories 0053 and 0054 both need it, and both depend only on 0045. Whichever reaches Phase 3 first
  creates `App\Concerns\ResolvesSalesRegionFromAddress`; the second `use`s it unchanged and neither
  forks a copy. This keeps the two stories independently schedulable — the property the facilitator was
  asked to preserve — while being honest that they share code. **Phase 3 must check whether the file
  exists before writing it**, and if it does, must not modify its behaviour without re-running the
  other story's tests.

  ⚠️ **Corrected after composition.** As first composed this section named a separate action class,
  `app/Actions/Orders/ResolveSalesRegionFromAddress.php`, and described it as an artifact "both
  stories use". **That class does not exist in 0053's design and never will.** 0053 was composed
  independently and reasoned the mapping out in its own **D-4**/**D-5**, inlining it in
  `ResolveOrderTaxRegion` with the Spain map as a `public const` on that class — so the shared piece
  this file assumed already had an owner had, in fact, a *different* owner with a different shape. The
  correction is to defer to 0053's shipped reasoning rather than re-open it: the country→`slug` rule
  and the postal-prefix map stay exactly as **D-4**/**D-5** decided them, and only the **host** moves
  — from `ResolveOrderTaxRegion` to the trait both actions compose, which is the smallest change that
  lets one implementation serve two callers reading two different address column sets.

  **Why a trait rather than 0054 calling 0053's action.** `ResolveOrderTaxRegion::__invoke(Order): void`
  is not reusable from here in any form: it takes an `Order` and reads that order's **shipping**
  columns, it refuses any order that is not all-physical (0053's **D-2**), and it is idempotent on an
  already-resolved order (**D-10**). Calling it from the virtual path would trip all three guards
  before reaching a single line of mapping. Copying its inlined logic into this action instead is the
  fork this decision exists to forbid. Extracting the two shared statements into a trait both actions
  `use` is what leaves exactly one implementation of one rule — and it is a **small addition to 0053's
  own scope**, recorded in that file too rather than imposed on it from here.

  **What each caller keeps.** The trait maps and returns `?SalesRegion`; the fallback stays with the
  caller, because the two fallbacks genuinely differ (0053's `is_default`-row-plus-flag **D-6** versus
  this story's hand-off to 0026's catalog-default tier). A shared mapping does not mean a shared
  policy, and collapsing the two would have been a real behavioural change rather than a
  consistency fix.
- **D-8 — Resolution is a separate step invoked after creation, not folded into `CreateOrder`.** 0045
  ships an order with `sales_region_id`, `tax_rate` and `flagged_for_review` deliberately unresolved
  and has an explicit test group asserting exactly that ("nothing is falsely resolved"). Folding
  resolution into creation would break those tests and, worse, would couple order recording to tax
  policy: a channel that records an order must not fail because a catalog default is misconfigured.
  **When resolution is triggered — automatically after creation, or by an administrator action — is
  story 0055's, and is deliberately not decided here.**

### Scope fences: what this story must NOT do

- Must **not** derive a country from an IP address, add any geolocation library, service, API call or
  bundled database, or change `composer.json` / `package.json` in any way.
- Must **not** resolve tax from the `shipping_*` snapshot, or touch any physical-product path (0053).
- Must **not** modify `CreateOrder`, or resolve tax during order creation (**D-8**).
- Must **not** re-implement any part of `ResolveProductTaxRate`'s two-tier fallback (0026).
- Must **not** read `$order->customer`'s live address for any purpose (0045 **D-4**).
- Must **not** change any `status` or `payment_status`, or add an `OrderPolicy` (0048–0052).
- Must **not** add a route, a Livewire component, a Blade view, a `config/modules.php` entry, a
  manual-review screen, or any screen copy to `lang/{en,es}/orders.php` beyond the `flag_reasons`
  group (0055).
- Must **not** add a permission to `RolePermissionSeeder`.
- Must **not** add an index to any of the three new columns.

## Dependencies, risks and open questions

### Dependencies

| Depends on | State | Verified how |
| --- | --- | --- |
| **[0045](0045-orders-core-crud-backend.md) — Orders core CRUD** | **HARD dependency; `new` and ⛔ BLOCKED** | This story `ALTER`s `orders`, reads its `billing_*` snapshot and writes `sales_region_id` / `tax_rate` / `tax_amount` / `flagged_for_review`. **This story inherits 0045's blocked status in full** — including its five Epic 2 blockers (0024, 0029, 0035, 0036, 0038) |
| **0053 — physical-product tax resolution** | **SIBLING, not a dependency** | Both depend only on 0045; **there is no dependency between 0053 and 0054 in either direction**, and either may be implemented first. They share exactly one artifact — the `App\Concerns\ResolvesSalesRegionFromAddress` trait, specified as create-if-absent (**D-7**), whose country→`slug` rule and Spain postal-prefix map are [0053's **D-4**/**D-5**](0053-order-tax-region-resolution-physical-backend.md#documented-functional-decisions) and are referenced here, never restated |
| [0026](in-progress/0026-product-sales-region-assignment-and-tax-resolution-backend.md) — product↔region assignment + `ResolveProductTaxRate` | `new` | Provides the `ResolveProductTaxRate` / `ResolvedTaxRate` / `TaxRateResolutionTier` contract this story consumes verbatim; its scope fence explicitly hands address→region mapping to Epic 3 |
| [0024](done/0024-products-core-crud-backend.md) — Products | `new` | Provides `App\Enums\ProductType` (`Physical` / `Virtual`), which is how "the order is virtual" is determined at all |
| `sales_regions` catalog | **done** (task 0016) | [`schema.md`](../../docs/database/schema.md#sales_regions); the fiscal territories the postal mapping targets, and the `is_default` row the fallback tier needs |

### ⚠️ Forward-compatibility framing — read this before treating the feature as broken

**The geo/fraud check this story builds is complete, tested, and dormant.** Its trigger condition —
`orders.ip_derived_country` being populated — is not met by any code path this application contains,
because this application has no storefront, no checkout and no external ordering channel. Every order
it can currently create is administrator-entered and carries no purchaser IP.

That is **not** an unfinished feature and **not** scope-cutting. It is infrastructure built ahead of
its trigger, deliberately, so that:

- the day an external channel begins populating `ip_address` / `ip_derived_country`, the check
  activates **with no code change**;
- the activation lands on code that is already under test on both branches, rather than on code
  written under schedule pressure at the moment it is first needed;
- and the columns exist on `orders` *before* the table has production rows, so no backfill is ever
  required.

**Anyone reviewing this system and finding `flagged_for_review` `false` on 100% of rows is looking at
correct behaviour**, and the Definition of Done requires that sentence to live in
[`database/schema.md`](../../docs/database/schema.md) beside the columns — not only in this file —
precisely so it is met by the reader who needs it.

### Risks

- **R-1 — The dormant branch rots.** Code that never runs in production drifts silently: a refactor
  breaks it, and nothing observable changes for months or years. *Mitigation:* the "dormant geo/fraud
  check" test group exercises **both** branches by populating the columns directly, so the branch is
  covered by the suite even though it is unreachable in production. It is the only defence available
  and it is not optional.
- **R-2 — The check is disabled from the outside.** If `ip_derived_country` were mass-assignable, a
  caller could submit it equal to whatever `billing_country` it also submitted and pass the check
  unconditionally. *Mitigation:* omitted from `#[Fillable]`, pinned by a mass-assignment test, and
  named explicitly in the Definition of Done's security bullet.
- **R-3 — Flag-then-resolve, or resolve-then-flag.** An implementation that resolves tax and *then*
  flags produces a flagged order carrying a plausible tax figure — the worst available outcome, because
  manual review rubber-stamps a populated column. *Mitigation:* **D-5**, plus the dedicated
  all-three-columns-still-null assertion re-fetched from the database.
- **R-4 — Money compared as floats.** `decimal(10,2)` and `decimal(6,3)` cast to **strings** in
  Eloquent. `expect($order->tax_rate)->toBe(21.0)` fails confusingly and `toEqual(21.0)` passes for the
  wrong reason. *Mitigation:* decimal-string comparison is stated explicitly for every money assertion,
  as 0045 **R-3** and 0026 both already require.
- **R-5 — `null` and `0.000` collapse into each other.** The single likeliest silent bug in the tax
  chain, flagged by 0016, 0026 and 0045 independently. *Mitigation:* a paired test asserting the two
  produce **different** stored values, not merely the same tax amount.
- **R-6 — This document goes stale while it waits.** It is blocked behind 0045, which is blocked behind
  five Epic 2 stories, every one of which may change during its own Phase 4/5 — including the
  `ProductType` enum, the `ResolveProductTaxRate` signature and the `billing_*` column shapes this file
  quotes. *Mitigation:* **the Phase 2 INVEST review must be re-run immediately before Phase 3**, with
  every cited contract re-verified against `HEAD`, per
  [errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23).
  This file's shapes are a reading aid, not a locator.
- **R-7 — The central decision is overturned after Phase 3.** *Mitigation:* the decision is isolated to
  **one branch** in one action (`ip_derived_country === null ⇒ continue` vs `⇒ flag`) plus its tests.
  No column, migration or contract changes in either direction — which is precisely why the interim
  default is safe to proceed on while confirmation is pending.

### Open questions

**OQ-1 — What resolves the tax basis for a *mixed* order carrying both physical and virtual line
items? RESOLVED by the facilitator during 0053's Phase 1 composition — recorded here for consistency,
not left as a choice between this file's original three options.**

Story [0045](0045-orders-core-crud-backend.md) permits an order to carry any number of line items
naming any products, so an order containing **one physical and one virtual product** is creatable
today with no rule covering it. PRD §3.2 states the resolution rule per **product type** and is silent
on a basket holding both.

**Adopted: defer-and-flag, not "ship-to-basis wins."** Neither action resolves a mixed order —
0053 acts only when *every* line item is `Physical`, this story only when *every* line item is
`Virtual`; a genuinely mixed order is check-and-skipped by both and left with
`flagged_for_review = true` / `flag_reason = REASON_MIXED_BASKET`, `sales_region_id`/`tax_rate` null.
This supersedes this file's original recommendation of option (a) ("ship-to-basis wins" — silently
resolving a mixed order from the shipping address with no flag). Reasoning for the change: this
story's whole design already treats a genuinely ambiguous tax basis (the IP/billing mismatch) as a
**flag for human review**, never a silent guess — applying "ship-to-basis wins" to a mixed basket
would silently guess in exactly the situation this story otherwise refuses to. A mixed-VAT-regime
basket is a real edge case in EU tax law (physical and digital goods can carry different treatment),
so deferring to a human reviewer is the same conservative default this story already uses elsewhere,
not a new inconsistent rule. Option (b) (per-line-item resolution) remains rejected as materially
larger than either story's scope; option (c) (refuse mixed baskets at creation) remains rejected as
changing an already-reviewed sibling (0045) and forbidding a legitimate real-world order. Recorded
identically in **[0053's D-2/D-3](0053-order-tax-region-resolution-physical-backend.md)** — the two
files state one rule, not two half-implementations of it, per **D-7**'s own reasoning.

**OQ-2 — When is resolution triggered? Non-blocking; story 0055's.** Automatically after `CreateOrder`
returns, by an explicit administrator action, or both. **D-8** deliberately keeps the trigger out of
this story: the action is invokable and idempotent, so any trigger works. Recorded so nobody reads its
absence as an omission.

**OQ-3 — Is a country-level match the right granularity? Non-blocking; backlog.** This story compares
ISO alpha-2 codes, following PRD §3.2's "billing country/region does not match". A finer comparison
(region or city) would flag a traveller buying from a hotel abroad, which is a false positive with real
customer cost. Recorded only because "make the geo check stricter" is a natural later request and the
tradeoff should be a decision rather than a reflex.

### Resolved questions

| Question raised | By | Resolved as |
| --- | --- | --- |
| What is "the purchaser's IP-derived location" with no checkout? | **all three contributors** | **[The central decision](#-the-central-decision--what-the-purchasers-ip-derived-location-means-in-an-app-with-no-checkout)** — skip the check when no IP data is captured; build the mechanism anyway; escalate for confirmation |
| Which IP-geolocation dependency? | backend-expert | **Not answered, and not needed**: no derivation happens here. If it is ever needed, a bundled GeoLite2-style fixture under `database/data/` is the recommended shape over a third-party API — pending human approval ([backlog 1](#technical-tasks-for-the-backlog)) |
| Where is the IP data stored? | backend-expert / database-expert | `orders.ip_address` `VARCHAR(45)`, `orders.ip_derived_country` `VARCHAR(2)`, both nullable |
| How does an administrator see *why* an order was flagged? | database-expert | **D-4** — a `flag_reason` column, refined to `VARCHAR(64)` holding a snake_case token resolved through `lang/{en,es}/orders.php` |
| Any index on the three new columns? | database-expert | **No** — confirmed; cardinality, and no query filters on them |
| Can an order be flagged *and* tax-resolved? | backend-qa | **D-5** — never; flag and stop |
| Does an absent billing address flag the order? | backend-qa | **D-3** — no; it falls through to the catalog default |
| Do 0053 and 0054 depend on each other? | facilitator | **No.** Both depend only on 0045; the one shared artifact is the create-if-absent `ResolvesSalesRegionFromAddress` trait (**D-7**) |
| Does this action authorize? | backend-expert | **D-6** — no, per 0026's precedent; the human-driven caller does |
| Is resolution part of `CreateOrder`? | backend-qa | **D-8** — no; a separate, idempotent step |

### Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Derive a country from an IP address**, if and when an external ordering channel supplies raw
   `ip_address` values without a derived country. **Requires human dependency approval** per project
   `CLAUDE.md`; the recommended shape is a bundled GeoLite2-style fixture under `database/data/`
   (mirroring the ISO 3166 country list) rather than a per-request third-party API call, for the same
   reasons PRD §2.4 gave for bundling the country list.
2. **Revisit indexing on `orders`** once story 0055's list filters exist and a real order volume can be
   measured — specifically whether a "flagged for review" filter warrants an index. Measure, do not
   assume; this is the same provisional-YAGNI shape 0045 already recorded.
3. **An `App\Enums\OrderFlagReason`**, once a *second* flag reason exists (**D-4** deliberately ships a
   class constant instead of a one-case enum).
4. **A manual-review workflow** — how an administrator clears a flag, and whether clearing it
   re-triggers resolution. PRD §3.2 says "flagged for manual review" and stops there; the review action
   itself is unspecified and belongs to a story of its own.

## Provenance

- **PRD source:** [§3.2 Orders](../../docs/PRD/PRD.md#32-orders) — specifically the "Sales Region
  resolution for tax" paragraph, its two virtual-product Gherkin scenarios, and the acceptance
  criterion "virtual → billing address validated against the purchaser's IP-derived location, with a
  mismatch flagged for manual review". PRD's own parenthetical marks the flagging behaviour as "a
  conservative default chosen here … adjust if the business prefers hard-reject or hold", which is the
  licence under which this story's central decision is recorded rather than assumed.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `backend-expert`, `backend-qa` and `database-expert`, composed by `product-owner` as facilitator.
  **All three contributors independently flagged the same central open question and all three declined
  to guess at a default**; it is resolved above as an explicitly-labelled interim default plus an
  escalation, per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, rather than
  settled silently.
- **Gherkin conventions:** every scenario opens with a named business-role actor ("an order
  administrator") and carries exactly one `When`, per
  [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 — mandatory
  across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md). PRD's two virtual-product scenarios are adapted rather than
  copied: the "mismatched billing address" case cannot currently occur in this application, so it is
  specified as the dormant mechanism's test rather than as the primary path, and the
  no-IP-data case — which is *every* case today — is written as a first-class scenario it did not have.
- **Stage:** `new`, and **blocked** — see the banner under [Description](#description). It moves to
  `ai-spec/tasks/in-progress/` at the start of Phase 3 and to `ai-spec/tasks/done/` at Phase 7 — both
  moves change this file's directory depth, so every relative link above must be re-resolved on each
  move (both directions), per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
- **Epic 3 decomposition:** the virtual-product half of tax resolution. Story 0053 (physical products)
  is its sibling and is referenced by number without a link because its file may not exist yet — the
  same convention [0045](0045-orders-core-crud-backend.md) uses for its own unwritten siblings.
