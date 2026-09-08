# [0036] Shipping rate rules — backend (rate CRUD, zone-delete guard, overlap precedence)

## Description
Build the `shipping_rates` table and its domain layer: per-carrier rate rules keyed on a shipping
zone and a weight bracket, carrying a price and a delivery estimate, plus the grouped-by-carrier
query the Shipping screen renders. This story additionally discharges two obligations its siblings
deferred to it: the **in-use delete guard** on shipping zones ([0033](done/0033-shipping-zones-backend.md)
**D-1**), and the **rate-precedence-on-overlap** rule ([0033](done/0033-shipping-zones-backend.md)
**D-2**). Data and domain layer only — no route, no Livewire component, no Blade view.

## Type
backend | related_task_id: **0037** (paired UI — the Shipping screen's rate table and rate modal,
not yet debated) | includes database-expert: **yes**

**PRD coverage.** [§2.4 Shipping](../../docs/PRD/PRD.md#24-shipping). This story owns, from the
`Feature: Shipping carriers and rates` block, the scenario *Create a rate rule for a carrier* and
the `Scenario Outline: An invalid shipping rate is rejected` (both examples), and it satisfies
**AC 2** (rate rules created/edited/deleted per carrier with zone, weight range, price and delivery
estimate, shown grouped by carrier) and **AC 3** (min ≤ max weight and non-negative price
validated). It also **closes the PRD's last `pending Phase 1 confirmation` item** — the
`Feature: Deleting a shipping zone still in use` block — whose *decision* 0033 already confirmed and
whose *implementation* it handed here.

Two behaviours this story owns have **no PRD Gherkin of their own**; this task file is the first
place they are formalised, and the scenarios below are written from scratch:

- the zone-delete guard's count message and its release condition;
- rate precedence when a destination is covered by more than one zone.

**Boundaries with the sibling Epic 2 stories**, referenced and never redefined here:

- **0032 — geography catalog** ([`0032-shipping-geography-catalog-seed.md`](done/0032-shipping-geography-catalog-seed.md)).
  Owns `geography_entries`: its bigint PK, the `level` discriminator, the self-FK `parent_id`, the
  fixture and the seeder. **This story reads that ancestry chain and changes nothing in it.**
- **0033 — shipping zones** ([`0033-shipping-zones-backend.md`](done/0033-shipping-zones-backend.md)).
  Owns `shipping_zones`, the `shipping_zone_geography_entry` pivot, `ShippingZone`,
  `ShippingZonePolicy`, and the four zone actions. This story **modifies exactly one of its files**,
  `app/Actions/Shipping/DeleteShippingZone.php`, which 0033 pre-shaped as this story's extension
  point.
- **0035 — shipping carriers** ([`0035-shipping-carriers-backend.md`](0035-shipping-carriers-backend.md)).
  Owns `shipping_carriers`, `ShippingCarrier`, `ToggleShippingCarrier`, `/shipping`,
  `App\Livewire\Shipping\Index` and `resources/views/livewire/shipping.blade.php`. This story adds
  **one relation method** to `ShippingCarrier` and resolves that story's deferred decision **D**.
- **0037 — the Shipping screen UI.** Owns the rate table markup, the rate modal, the zone selector,
  the "and above" rendering of an open-ended bracket, and every browser test.
- **Epic 3 — Orders.** The resolver's *consumer*, and the first place it runs against a real
  customer address. It is not written here.

## Gherkin
```gherkin
Feature: Shipping rate rules

  Scenario: Create a rate rule for a carrier
    Given a shipping administrator, with the carrier "SEUR" active and the zone "Península"
    When they add a "Península" rate for SEUR covering 0–2 kg at 4,95 € with "24–48h" delivery
    Then the rate exists under SEUR in the shipping rate catalog

  Scenario: The rate table is grouped by carrier
    Given a shipping administrator, with rate rules belonging to SEUR, MRW and Correos
    When they list the shipping rate catalog
    Then the rates are returned grouped under their own carrier

  Scenario: Edit a rate rule's price
    Given a shipping administrator, with a SEUR "Península" rate priced at 4,95 €
    When they change its price to 5,50 €
    Then the rate is priced at 5,50 €

  Scenario: Delete a rate rule
    Given a shipping administrator, with a SEUR "Península" rate
    When they delete that rate
    Then it no longer exists in the shipping rate catalog

  Scenario: A rate rule may be created without an upper weight limit
    Given a shipping administrator, with the carrier "SEUR" active
    When they add a SEUR "Península" rate from 5 kg with no maximum weight
    Then the rate applies to every parcel of 5 kg and above

  Scenario Outline: An invalid shipping rate is rejected
    Given a shipping administrator creating a shipping rate
    When they submit it with <invalid_field>
    Then the rate is rejected with a validation message, and no rate is created

    Examples:
      | invalid_field                             |
      | a minimum weight greater than the maximum |
      | a negative price                          |
      | a negative minimum weight                 |
      | a blank name                              |
      | a blank delivery estimate                 |
      | a carrier that does not exist             |
      | a shipping zone that does not exist       |

  Scenario: A minimum weight equal to the maximum is accepted
    Given a shipping administrator creating a shipping rate
    When they submit it covering exactly 2 kg to 2 kg
    Then the rate is accepted

  Scenario: A free shipping rate is accepted
    Given a shipping administrator creating a shipping rate
    When they submit it priced at 0,00 €
    Then the rate is accepted

  Scenario: Two rate rules may share a name
    Given a shipping administrator, with a SEUR "Península" rate named "Estándar"
    When they create a Correos "Baleares" rate also named "Estándar"
    Then the second rate is accepted

  Scenario: A user without the shipping create permission cannot create a rate rule
    Given a signed-in user who does not hold the "create shipping" permission
    When they attempt to create a shipping rate
    Then the attempt is refused and no rate is created

  Scenario: A user without the shipping edit permission cannot change a rate rule
    Given a signed-in user who does not hold the "edit shipping" permission
    When they attempt to change a shipping rate's price
    Then the attempt is refused and the rate keeps its price

  Scenario: A user without the shipping delete permission cannot delete a rate rule
    Given a signed-in user who does not hold the "delete shipping" permission
    When they attempt to delete a shipping rate
    Then the attempt is refused and the rate still exists
```

```gherkin
Feature: Deleting a shipping zone still in use

  Scenario: Deleting a shipping zone referenced by rate rules is blocked with a count
    Given a shipping administrator, with the zone "Península" referenced by 7 SEUR rate rules
    When they try to delete "Península"
    Then deletion is refused with a message stating that 7 shipping rates reference the zone
    And "Península" still exists

  Scenario: The blocked-deletion message is singular for a single rate rule
    Given a shipping administrator, with the zone "Península" referenced by 1 SEUR rate rule
    When they try to delete "Península"
    Then deletion is refused with a message stating that 1 shipping rate references the zone

  Scenario: The count covers every carrier's rate rules, not one carrier's
    Given a shipping administrator, with the zone "Península" referenced by 2 SEUR rates
      and 3 Correos rates
    When they try to delete "Península"
    Then deletion is refused with a message stating that 5 shipping rates reference the zone

  Scenario: The count covers a disabled carrier's rate rules too
    Given a shipping administrator, with the zone "Península" referenced only by rates
      belonging to the disabled carrier "MRW"
    When they try to delete "Península"
    Then deletion is refused

  Scenario: A zone becomes deletable once its last rate rule is gone
    Given a shipping administrator who has deleted every rate rule referencing "Península"
    When they delete "Península"
    Then "Península" no longer exists in the shipping zone catalog

  Scenario: There is no confirm-and-proceed path
    Given a shipping administrator, with the zone "Península" referenced by 7 rate rules
    When they look for a way to delete "Península" anyway
    Then no such option exists, and the rate rules must be reassigned or deleted first

  Scenario: A blocked deletion destroys nothing
    Given a shipping administrator, with the zone "Península" referenced by 7 SEUR rate rules
    When they try to delete "Península"
    Then all 7 rate rules still exist, unchanged
```

```gherkin
Feature: Choosing which rate applies when zones overlap

  Scenario: The narrowest zone covering the address wins
    Given a store customer shipping to "Gijón", with a municipio zone "Gijón centro"
      and a country zone "España" both carrying a rate covering the parcel
    When the applicable shipping rate is resolved
    Then the rate belonging to "Gijón centro" is chosen

  Scenario: A broader zone wins when no narrower zone covers the address
    Given a store customer shipping to "Gijón", with only the country zone "España"
      carrying a rate covering the parcel
    When the applicable shipping rate is resolved
    Then the rate belonging to "España" is chosen

  Scenario: An ancestry-only overlap is resolved the same way as a listed overlap
    Given a store customer shipping to "Gijón", with the zone "Zona Norte" listing the
      municipio "Gijón" and the zone "Nacional" listing only the country "España"
    When the applicable shipping rate is resolved
    Then the rate belonging to "Zona Norte" is chosen

  Scenario: Two zones at the same level are separated by price
    Given a store customer shipping to "Gijón", with two municipio zones both listing "Gijón"
      and both carrying a rate covering the parcel at different prices
    When the applicable shipping rate is resolved
    Then the cheaper rate is chosen

  Scenario: A narrower zone's incomplete weight ladder does not fall back to a broader zone
    Given a store customer shipping a 3 kg parcel to "Gijón", with the municipio zone
      "Gijón centro" carrying rates only up to 2 kg and the country zone "España"
      carrying a rate covering 3 kg
    When the applicable shipping rate is resolved
    Then no rate is returned, and the refusal names "Gijón centro" as the zone that decided it

  Scenario: A zone carrying no rate rule does not suppress a broader zone
    Given a store customer shipping to "Gijón", with a municipio zone "Gijón centro" carrying
      no rate rule at all and the country zone "España" carrying a rate covering the parcel
    When the applicable shipping rate is resolved
    Then the rate belonging to "España" is chosen

  Scenario: A disabled carrier's rates are never chosen
    Given a store customer shipping to "Gijón", with the only municipio-level rate belonging
      to the disabled carrier "MRW" and a country-level rate belonging to the active "SEUR"
    When the applicable shipping rate is resolved
    Then the SEUR rate is chosen

  Scenario: Resolving for one carrier ignores another carrier's narrower rate
    Given a store customer shipping to "Gijón", with a municipio-level SEUR rate and a
      country-level MRW rate
    When the applicable shipping rate is resolved for MRW only
    Then the country-level MRW rate is chosen

  Scenario: A destination no zone covers has no applicable rate
    Given a store customer shipping to a municipio no shipping zone covers
    When the applicable shipping rate is resolved
    Then no rate is returned
```

## Documented functional decisions

**D-1** and **D-2** resolve the two questions the prior debate attempt left open, and **D-6**
resolves the one [0035](0035-shipping-carriers-backend.md) deferred here. None is to be reopened in
Phase 2 or Phase 3 except on new evidence.

---

### D-1 — Rate precedence on overlap: **most-specific tier wins, and the tier does not reopen on weight**. CONFIRMED.

[0033](done/0033-shipping-zones-backend.md) **D-2** allowed overlapping zones and assigned the precedence
rule here. This is that rule, stated as an algorithm because "most specific wins" is ambiguous in
exactly the place it matters:

1. Build the destination's **ancestry chain** from the `GeographyEntry` it resolves to, most
   specific first: `[municipio, comunidad autónoma, país]`. The chain is **at most three entries**
   because 0032's catalog is exactly three levels deep; if the destination is itself a comunidad or
   a country, the chain simply starts shorter.
2. Walk the chain from most specific to least. At each level, find the rate rules whose zone
   **lists that exact entry**, whose carrier is **active**, and which match the **carrier filter**
   if one was given. The first level that yields a non-empty set is the **winning tier**; stop
   walking.
3. Within the winning tier — and **only** within it — keep the rates whose **weight bracket covers
   the parcel**.
4. If that leaves nothing, **return no rate**. Do **not** continue to a broader tier.
5. Otherwise order by `price` ASC, then `created_at` ASC, then `id` ASC, and take the first.

**Step 2 selects the tier by the presence of rate rules, not by zone coverage alone.** This is the
subtle half. A zone that covers the address but carries **no rate rule at all** expresses no pricing
intent, so it must not suppress a broader zone that does — otherwise 0033 **D-5**'s legal empty zone
becomes a silent shipping outage. A zone that carries rates which merely fail to cover *this*
parcel's weight is the opposite case: it has expressed a ladder, and step 4 respects it.

**Step 2 applies the carrier filter.** Resolving "the best MRW rate for this address" must compute
the winning tier *with* the MRW filter applied. Computing the tier globally and filtering afterwards
lets a SEUR municipio-level rate suppress an MRW país-level rate and return nothing for MRW — a bug
that only appears in multi-carrier fixtures, which is precisely why it has its own scenario.

**Step 4 is the highest-stakes call in the story, and it was argued both ways.** The prior debate
attempt proposed no-fallback as "the safer default". On re-examination the counter-argument is real
and was very nearly decisive: under no-fallback, adding a narrow express zone for Madrid **silently
breaks** 3 kg shipping to Madrid that worked the day before, and no administrator would predict that
from "I added a cheaper option". The alternative rule — filter by weight *first*, then pick the most
specific tier among what survives — never blocks and still honours specificity wherever both tiers
apply.

**No-fallback wins anyway, on a precedent this project has already recorded.** Fallback's failure
mode is *undercharging*: a zone "España" catch-all quoting the mainland price for a 3 kg parcel to
the Canaries, silently, on every such order, for as long as nobody audits it. No-fallback's failure
mode is a *visible refusal to quote*. [0033](done/0033-shipping-zones-backend.md) **D-1** rejected
`nullOnDelete` for this exact tradeoff, in these words: *"That is a pricing bug wearing a nullable
column, and it would surface in Epic 3 as wrong money rather than as an error."* The same principle
decides the same way here. An error is recoverable; wrong money that nobody notices is not.

**The regression risk that argument does not answer is mitigated, not ignored.** See **D-13**: the
resolver must return *why* it found nothing, naming the zone whose ladder decided it, so a coverage
gap is diagnosable rather than a bare `null` at a checkout.

**Rejected outright:**

- **Highest price wins**, or *any* revenue-maximising tiebreak. Charging a customer the dearer of
  two rates an administrator configured for the same parcel is a defect, not a policy.
- **Row order / no tiebreak.** Two same-level zones would return whichever row the optimizer
  happened to emit — non-deterministic across MySQL and SQLite, and untestable.
- **`created_at` as the final tiebreak** (the prior contribution stopped there). Timestamps collide
  within a second routinely — in factories, in seeders, in a bulk import — so `id` is appended as
  the total-order guarantee. Without it the "cheaper rate wins" test is flaky at exactly the moment
  two fixtures share a price.
- **`WITH RECURSIVE`.** The prior contribution is right and the reasoning is worth keeping: the
  depth is **fixed at three by 0032's schema**, not arbitrary, so a recursive CTE buys nothing and
  costs portability (SQLite supports it, but the query is harder to read and harder to test than
  three bounded lookups). If 0032 ever gains a fourth level this decision is revisited — recorded
  as **R-5**.

### D-2 — Overlapping **weight brackets** within one carrier + zone are **allowed**. CONFIRMED.

The prior debate attempt left this open: reject overlapping brackets, or allow them with a silent
tiebreak. **Allow**, and the evidence is not a preference — it is the reference data:

```js
// docs/arospe-handoff/project/js/envios.js
{ id: 'r1', name: 'Estándar', carrier: 'SEUR', zone: 'Península', wmin: '0', wmax: '2', ... },
{ id: 'r2', name: 'Estándar', carrier: 'SEUR', zone: 'Península', wmin: '2', wmax: '5', ... },
```

Those two brackets **touch at 2 kg**, and the prototype renders them as "0–2 kg" and "2–5 kg". A
validation rule rejecting overlap would reject the PRD's own reference configuration on the first
screen an administrator sees. Two further reasons:

- **A second named service on the same bracket is legitimate.** `name` is free text precisely so
  "Estándar" and "Frágil" can both cover 0–2 kg on the same carrier and zone at different prices.
  A uniqueness rule over `(carrier, zone, min, max)` would forbid that (see **D-9**).
- **Range overlap is not expressible as a database constraint on MySQL** — the same structural point
  0033 **D-2** makes about zone overlap. An application-only rule would be a pre-flight check with
  no index behind it, i.e. not a race guard, for a restriction nobody asked for.

Overlap is therefore resolved, never prevented, by **D-1** step 5's deterministic tiebreak: at
exactly 2 kg the cheaper of the two touching brackets applies. A future story may add a
**non-blocking UI notice** ("this bracket overlaps Estándar 0–2 kg"), which is a UI hint in the sense
[authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)
uses the term — named here so nobody builds it as a validation failure.

### D-3 — Weight brackets are **inclusive at both ends**, and `min == max` is legal.

`min_weight_kg <= parcel <= max_weight_kg`, with the upper test skipped when `max_weight_kg` is
null. Chosen because it is the literal reading of the prototype's own "0–2 kg" label: a half-open
`[min, max)` bracket would make every rendered range lie about its upper bound, and would make a
single-weight rate (`2`–`2`) match nothing at all — a rule that silently does nothing is worse than
one that overlaps visibly. The cost is the shared-boundary ambiguity **D-2** already resolves.

### D-4 — `max_weight_kg` is **nullable**, and null means "and above".

An open-ended top tier (">5 kg: 12,00 €") is a real carrier configuration and needs an encoding. The
alternatives lose concretely: a **sentinel** like `99999.999` renders as "0–99999.999 kg" in the rate
table and makes the `min <= max` rule compare against a lie; a **separate boolean** (`is_open_ended`)
admits the contradictory state `max_weight_kg = 5 AND is_open_ended = true` and needs a `CHECK` to
forbid it. Nullable has none of that and short-circuits the validation rule for free (**D-7**).

Two consequences recorded rather than discovered:
- **The bracket query must be null-aware** — `where('max_weight_kg', '>=', $w)` silently excludes
  every open-ended tier, because `NULL >= 5` is `NULL`, not `true`. This is the likeliest silent bug
  in the resolver and has its own test (**R-1**).
- **Hand-off to 0037:** an open-ended bracket renders as "5 kg y superior", never "5–null kg".

### D-5 — The zone-delete guard **mirrors 0024b's product-category guard exactly**.

[0024](done/0024-products-core-crud-backend.md) **D-10** already solved this problem for
`product_categories` ← `products`, and the shape is adopted verbatim rather than re-derived. It
belongs in `app/Actions/Shipping/DeleteShippingZone.php` — **never in `ShippingZonePolicy`** — for
the two reasons 0033 **D-1** gives, the second decisive: a policy-level rule is reachable by the
Super Admin `Gate::before` bypass
([authorization.md](../../docs/architecture/authorization.md)), so a Super Admin could punch through
it and destroy pricing configuration, which is the precise outcome the rule exists to prevent.

Adopted properties, each load-bearing:

- **Two layers.** The count is the primary guard; `restrictOnDelete()` on
  `shipping_rates.shipping_zone_id` is the last word and closes the check-then-act race
  ([signed-link-verification.md](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)).
- **`QueryException` code `23000` is caught and re-thrown as the *same* human message**, re-counting
  at that point so the loser of the race sees an accurate number — never a 500.
- **`ValidationException`, not a domain exception**, for 0024's decisive reason: it is the one
  exception Livewire already routes into the component's error bag with no plumbing, so 0037's
  delete-confirmation modal renders it with an `@error` block and catches nothing.
- **The count is unfiltered.** Every rate referencing the zone counts, including those of a
  **disabled** carrier — a disabled carrier's rates are hidden, not deleted (**D-6**), and deleting
  the zone out from under them would destroy configuration that returns the moment the carrier is
  re-enabled. This is the likeliest implementation bug and it has its own scenario and test.
- **No `lockForUpdate()`** — a wide lock for a rare admin operation, buying what the FK guarantees.
- **`trans_choice`, not a bare `:count`**, because the singular differs. Note **R-6**: 0024 records
  that `lang/` has *no* `trans_choice` precedent, and Spanish pluralisation is not English's; both
  locale files land in this change.
- **Sound only because neither model soft-deletes.** `ShippingZone` has no `SoftDeletes` (0033
  **D-7**) so the FK actually fires, and `ShippingRate` must not gain it either (**D-14**) or the
  count silently starts excluding trashed rates with no edit to the guard.

**Error-bag key: `'shippingZoneId'`** — a hand-off contract the **zone**-delete modal binds its
`@error` to, recorded in the action's docblock, following `CreateUser`'s `'email'` precedent. That
modal belongs to [0034](done/0034-shipping-zones-ui.md) (**D-6**), which deliberately binds to the error
bag rather than to a string precisely so this guard's message appears with no markup change there.

> **Correction, 2026-08-19.** This paragraph originally named **0037** as the story that binds to
> this key, and the Definition of Done repeated the misattribution. 0037's own Phase 1 debate caught
> it (its **OQ-A**): `DeleteShippingRate` has no zone guard, so nothing on 0037's *rate*-delete modal
> can ever raise `'shippingZoneId'`. Deleting a **zone** is 0034's screen.

**No confirm-and-proceed path, ever.** The PRD says so explicitly, `shipping_zone_id` is NOT NULL so
there is no coherent "proceed", and `restrictOnDelete` would refuse regardless.

### D-6 — **Disabling a carrier that still has rate rules is allowed, unconditionally.** CONFIRMED.

[0035](0035-shipping-carriers-backend.md)'s decision **D** deferred this here, correctly — there was
no `shipping_rates` table to reason about. Resolved: **no block, no warning, no data change.** The
rates survive untouched, stop being selected by the resolver while the carrier is inactive
(**D-1** step 2), and become selectable again the instant the carrier is re-enabled.

**Why this does not contradict D-5's hard block on zone deletion.** The two cases differ on the axis
that matters: **a toggle is reversible and destroys nothing; a delete is irreversible and orphans
rows.** Blocking a disable would make the toggle un-flippable for any carrier that had ever been
configured — which is every carrier that matters — and the only escape would be deleting the very
rate rules the block exists to protect. Perverse, so rejected.

**Corollary, raised by `backend-qa` and decided here: a rate rule may be created for a carrier that
is currently disabled.** The PRD is silent and it is a real gap. Refusing would be incoherent with
this decision in both directions — it would create a chicken-and-egg for onboarding a carrier
(configure its rates *then* switch it on is the natural order), and it would mean the same rate that
may legally *survive* a disable may not be *created* during one. Rates are configuration; `is_active`
governs **resolution** (**D-1** step 2), never authoring. It has a test.

0037 may show an informational count on the card ("SEUR has 7 rate rules; they will stop applying").
That is a UI hint, never a block.

### D-7 — Column types: money and weight are `DECIMAL`, never `float`.

| Column | Type | Reasoning |
| --- | --- | --- |
| `price` | `decimal(10,2)` NOT NULL | **Verbatim consistency with [0024](done/0024-products-core-crud-backend.md) D-2's `products.price`** — same currency (assumption 10, single EUR), same minor unit, same Epic. A second money convention inside one epic is the thing to avoid; the €99,999,999.99 ceiling being absurd for a parcel rate is harmless, whereas a `decimal(8,2)` cliff would surface as MySQL `22003` (a 500), not a field message. Casts to **string** via `'price' => 'decimal:2'` — so `@property string $price`, which is 0024's **R-4** and the likeliest silent bug to inherit. |
| `min_weight_kg` | `decimal(8,3)` NOT NULL default `0` | Grams precision (scale 3), ceiling 99,999.999 kg — far above any parcel, so no plausible overflow cliff. Default `0` matches the prototype's `wmin: '0'`. |
| `max_weight_kg` | `decimal(8,3)` **nullable** | Same shape; null = "and above" (**D-4**). |
| `name` | `string(150)` | Matches `shipping_zones.name`'s length (0033), so the two never disagree in a form. |
| `delivery_estimate` | `string(50)` NOT NULL | See **D-8**. |

**Do not write `->unsigned()` on any `DECIMAL`** — deprecated on MySQL since 8.0.17 *and* ignored by
SQLite, so it would be a rule that exists in one environment and not the other. `'min:0'` in
validation is the enforcement. This is 0016's and 0024's recorded rule, adopted, not re-derived.

### D-8 — `delivery_estimate` is **free text**, not a structured day range.

The prototype's own values are `'24–48h'`, `'24h'`, `'48–72h'`, `'3–5 días'`, `'3–6 días'` — a mix of
hours and days, ranges and single values, in Spanish
(`docs/arospe-handoff/project/js/envios.js`). No structured `(min_days, max_days)` pair represents
`'24h'` and `'3–5 días'` in one shape without either losing information or inventing a unit column.
The PRD calls it an *estimate* and never computes with it. Structuring it is a later story with a
real requirement behind it — recorded so nobody adds it speculatively, and so nobody treats today's
free text as an oversight.

### D-9 — **No uniqueness anywhere on this table.**

- **Not on `name`.** The prototype has four rates named "Estándar" across different carriers and
  zones. A unique name would reject the reference data outright.
- **Not on `(shipping_carrier_id, shipping_zone_id, min_weight_kg, max_weight_kg)`.** It reads like a
  sensible "no duplicate bracket" rule and is not: two differently-named services on the same
  bracket at different prices is legitimate (**D-2**), and the constraint cannot express range
  *overlap* anyway — it only catches exact tuple duplicates, so it would be a real product
  restriction bought in exchange for a false sense of enforcement. **The migration carries a comment
  saying so**, mirroring 0033 **D-2**'s treatment of the pivot, because this is exactly the change a
  well-meaning reviewer proposes as a data-integrity improvement.

### D-10 — This story ships **no route, no Livewire component and no Blade view**.

Identical to [0033](done/0033-shipping-zones-backend.md) **D-8**, and for the same first reason, which is
dispositive here: **the route and the view path are already taken.** 0035 ships
`Route::livewire('shipping', ShippingIndex::class)->name('shipping.index')` and
`resources/views/livewire/shipping.blade.php` — *the* path Livewire's
[`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
forces for `App\Livewire\Shipping\Index`. A rate component here either collides on that file or
invents a second shipping route nobody asked for.

0035's counter-precedent (ship the component with a placeholder view) **does not transfer**: 0035
claimed a *free* route with no other owner, exactly as 0004 did before it. Story 0037 is the named
consumer, and it owns the whole screen including the carrier cards 0035 stubbed.

### D-11 — Ship `ShippingRatePolicy`, with zero call sites.

> **Corrected before this story reaches Phase 3 — the citation below is FALSE and is quoted rather
> than silently rewritten, per this project's audit-authored-page convention.** 0033's own **D-9**
> made the identical claim ("the actions deliberately self-authorize nothing (matching
> `CreateUser`/`UpdateUser`)") and it was found false at that story's Phase 4 security audit
> (finding F-1): `CreateUser`/`UpdateUser` both self-authorize as their own first statement, per
> [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s
> "an authorization rule belongs to the action, not to one of its callers" convention. 0033's four
> `app/Actions/Shipping/*` actions were corrected to self-authorize against `ShippingZonePolicy` as
> their own first statement, the same shape `App\Actions\ProductCategories\*` (story 0025) already
> uses — this story's own actions (`CreateShippingRate`/`UpdateShippingRate`/`DeleteShippingRate`)
> should follow that corrected precedent when debated, not the false one this paragraph originally
> cited. See the same correction under **File to create/modify**'s `CreateShippingRate.php` entry
> below.

Same reasoning as 0033 **D-9**: this story ships no component, so without a policy this story would
have no `Gate::authorize()`-reachable ability for the shipping rate catalog at all — and
[livewire-authorization.md](../../docs/security/livewire-authorization.md#authorization-that-lives-only-in-the-component-is-bypassed-by-every-other-call-site-of-the-action)
says the policy is the right home regardless of which consumer arrives first.

**The cost, stated rather than hidden:** until the actions are corrected to self-authorize (per the
note above, mirroring 0033's own Phase 4 fix), nothing in this story can regress if the policy is
wrong. Mitigated by direct `Gate::forUser()` tests, and carried as an explicit Definition-of-Done
hand-off to 0037.

### D-12 — **FK indexes only.** No composite index on `shipping_rates`.

This table is 10¹–10² rows in any realistic configuration (the prototype ships six). The resolver's
driving lookup filters on `shipping_zone_id`, which the FK's own auto-created index already serves;
everything downstream — the carrier's `is_active`, the weight bracket — is a filter over a handful of
rows. Adding `(shipping_zone_id, shipping_carrier_id, min_weight_kg)` would cost a write on every
rate edit and buy a sub-millisecond scan that is already sub-millisecond. This is the same reasoning
[schema.md](../../docs/database/schema.md#users) records for `users.status` and 0035 records for
`shipping_carriers.is_active`.

**Do not hand-write `$table->index('shipping_zone_id')`.** InnoDB creates an index for each FK
column automatically, and 0033's **R-1** already suspects this repo's be-explicit-about-FK-indexes
convention of producing *duplicate* indexes — the `users_uuid_unique` shape in
[errors-log.md](../../docs/errors-log.md). **Verify the resulting index list with
`php artisan db:table shipping_rates` in Phase 3**, not by reading this file.

### D-13 — The resolver returns a **result object**, never a bare `null`.

**D-1** step 4 deliberately refuses to quote in a case an administrator did not intend, so the
refusal must be diagnosable. A bare `null` at a checkout is indistinguishable between "we do not
ship there at all" and "we ship there but your parcel is heavier than the narrow zone's ladder" —
and the second is a misconfiguration somebody can fix in thirty seconds *if they are told*.

The resolver therefore returns a small readonly result carrying the chosen `ShippingRate` **or** the
reason none was chosen, plus the winning zone and tier level when one was selected. Epic 3 renders
an actionable message from it; a future admin screen can surface coverage gaps from the same shape.
The exact class name and shape are `backend-expert`'s call in Phase 3; what is **decided** here is
that "no rate" is not expressible as `null`.

### D-14 — `ShippingRate` must **not** use `SoftDeletes`.

Not a preference. **D-5**'s count guard means what it says only because a deleted rate is really
gone; adding the trait later would silently make the guard start excluding trashed rates — changing
its meaning with no edit to the guard, which is 0024 **D-12**'s recorded trap. It would also make a
trashed rate keep blocking its zone's deletion at the FK level while being invisible in the count, so
the message and the database would disagree. Deletes here are hard deletes, and a test pins the
absence of the trait.

---

## Files to create/modify

### Schema

- `database/migrations/<ts>_create_shipping_rates_table.php` — **new**, timestamped **strictly
  later** than 0033's `shipping_zones` and 0035's `shipping_carriers` migrations, so both FKs
  resolve and `down()` (rolled back first) drops this table before either parent.

  ```php
  Schema::create('shipping_rates', function (Blueprint $table): void {
      $table->uuid('id')->primary();
      $table->string('name', 150);

      // restrictOnDelete on BOTH parents. Carriers are seeded and have no delete
      // path today (0035), so this one is defence in depth only -- but cascade
      // is the dangerous default and would silently destroy pricing config the
      // day a carrier delete is added. Cheap now, unrecoverable later.
      $table->foreignUuid('shipping_carrier_id')->constrained()->restrictOnDelete();

      // This one is load-bearing: it is the database half of the zone-delete
      // guard (D-5). See app/Actions/Shipping/DeleteShippingZone.php.
      $table->foreignUuid('shipping_zone_id')->constrained()->restrictOnDelete();

      // Grams precision. NOT ->unsigned(): deprecated on DECIMAL since MySQL
      // 8.0.17 and ignored by SQLite, so it would be a rule that exists in one
      // environment only. 'min:0' in validation is the enforcement.
      $table->decimal('min_weight_kg', 8, 3)->default(0);

      // NULL means "and above" -- an open-ended top tier (D-4). Every bracket
      // query MUST be null-aware: `where('max_weight_kg','>=',$w)` silently
      // drops every open-ended tier, because NULL >= 5 is NULL, not true.
      $table->decimal('max_weight_kg', 8, 3)->nullable();

      // decimal(10,2) verbatim from 0024 D-2's products.price -- same currency,
      // same minor unit, same epic. Casts to a STRING on the model.
      $table->decimal('price', 10, 2);

      // Free text by design (D-8): the prototype mixes '24h', '3-5 dias' and
      // '48-72h'. No structured day range represents all of those.
      $table->string('delivery_estimate', 50);

      $table->timestamps();

      // NO unique on (carrier, zone, min, max). It reads like "no duplicate
      // bracket" and is not: two named services may share a bracket (D-2/D-9),
      // and a unique cannot express range OVERLAP anyway -- only exact tuple
      // duplicates. It would be a real restriction bought for a false sense of
      // enforcement. See D-9 before "improving" this.
      //
      // NO hand-written index() on either FK column: InnoDB creates one per FK,
      // and 0033 R-1 suspects the repo's explicit-FK-index convention of
      // shipping duplicates. Verify with `php artisan db:table shipping_rates`.
  });
  ```

  `down()` is `Schema::dropIfExists('shipping_rates');`.

  **Collation: inherit from the connection, set nothing per-table or per-column** — 0033's rule,
  and here it is a hard requirement rather than a preference: MySQL refuses an FK outright
  (error 3780) when the referencing and referenced `CHAR(36)` columns differ in charset or
  collation, and this table has two such FKs.

### Model / factory

- `app/Models/ShippingRate.php` — **new**. `use HasFactory, HasUuids;`, **no `SoftDeletes`**
  (**D-14**), `#[Fillable(['name', 'shipping_carrier_id', 'shipping_zone_id', 'min_weight_kg', 'max_weight_kg', 'price', 'delivery_estimate'])]`,
  `@property string $id` and `@property string $price` (the `decimal:2` cast returns a **string** —
  0024 **R-4**), no `$keyType` / `$incrementing`.

  ```php
  protected function casts(): array
  {
      return [
          'min_weight_kg' => 'decimal:3',
          'max_weight_kg' => 'decimal:3',
          'price' => 'decimal:2',
      ];
  }

  /** @return BelongsTo<ShippingCarrier, $this> */
  public function carrier(): BelongsTo { /* ... */ }

  /** @return BelongsTo<ShippingZone, $this> */
  public function zone(): BelongsTo { /* ... */ }
  ```

  Plus a **null-aware** bracket scope, written once so no call site re-derives it:

  ```php
  /**
   * Rates whose weight bracket covers the given parcel weight.
   *
   * Inclusive at BOTH ends (D-3). The nested orWhereNull is the open-ended
   * "and above" tier (D-4) -- without it, `max_weight_kg >= $weight` evaluates
   * to NULL (not true) for every open tier and silently drops them all.
   */
  public function scopeCoveringWeight(Builder $query, float|string $weight): void
  ```

- `database/factories/ShippingRateFactory.php` — **new**. Associates a `ShippingCarrier` and a
  `ShippingZone` factory, a faker `name`, a `0`–`2` bracket, a two-decimal price and a
  `'24–48h'` estimate. States: `openEnded()` (null `max_weight_kg`), `bracket($min, $max)`,
  `pricedAt($price)`.

- `app/Models/ShippingCarrier.php` — **modify** (0035's file). Adds **one** relation:

  ```php
  /** @return HasMany<ShippingRate, $this> */
  public function shippingRates(): HasMany
  ```

  > **Shared-file hazard.** This file is created by 0035 and modified here, and
  > `app/Actions/Shipping/DeleteShippingZone.php` is created by 0033 and modified here. Per
  > [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent
  > File-Ownership Rule, **0036 must not be implemented concurrently with 0033 or 0035.**
  > Sequential only, and both must land first.

- `app/Models/ShippingZone.php` — **modify** (0033's file), adding only the inverse
  `shippingRates(): HasMany` the count guard reads. 0033 explicitly forbade pre-shaping this
  relation; adding it *now*, alongside the rule that uses it, is what it deferred.

- `app/Models/GeographyEntry.php` — **NOT touched**. 0033 **D-11** refuses an inverse
  `shippingZones()` relation to keep the deliberately generic catalog free of shipping coupling, and
  that holds here: the resolver walks `parent_id` **upward**, which needs only the `parent` relation
  0032 already ships.

### Application

- `app/Concerns/ShippingRateValidationRules.php` — **new**, per
  [naming.md](../../docs/conventions/naming.md#traits-and-their-methods)'s `<Noun>ValidationRules` /
  `<noun>Rules()` convention.

  **The name method is `shippingRateNameRules()`, not `nameRules()`** — 0033 **D-6** flagged this
  exact latent collision: `ProfileValidationRules::nameRules()` already exists, 0023 plans a second,
  and traits compose flat at the consumer, so two same-named trait methods in one class is a **fatal
  error**.

  ```php
  /** @return array<int, ValidationRule|array<mixed>|string> */
  protected function maxWeightRules(): array
  {
      return [
          // 'nullable' FIRST and it short-circuits: an absent max means "and
          // above" (D-4), so gte must not run against a null.
          'nullable',
          'numeric',
          // 'decimal:0,3' not a bare 'numeric': Validator::validateDecimal()
          // calls validateNumeric() first, then matches a pattern with no e/E
          // branch -- so it rejects scientific notation, which 'numeric' happily
          // accepts ('1e2' would sail through as 100). It also caps precision at
          // 3, matching decimal(8,3); without it 2.0001 reaches MySQL and is
          // silently truncated or errors depending on strict mode. (0017.)
          'decimal:0,3',
          'min:0',
          // Bounded so a forged payload cannot overflow decimal(8,3) into a raw
          // SQLSTATE 22003 (a 500) instead of a field-level message. (0017.)
          'max:99999.999',
          // On the MAX field, never 'lte:max_weight_kg' on the min field: when
          // max is null the lte comparison has no value to compare against.
          'gte:min_weight_kg',
      ];
  }
  ```

  Sibling methods: `shippingRateNameRules()` (`required`, `string`, trimmed, `max:150`),
  `minWeightRules()` (`required`, `numeric`, `decimal:0,3`, `min:0`, `max:99999.999`),
  `priceRules()` (`required`, `numeric`, `decimal:0,2`, `min:0` — **`0.00` is a legal free-shipping
  rate**, `max:99999999.99`), `deliveryEstimateRules()` (`required`, `string`, `max:50`),
  `shippingCarrierIdRules()` and `shippingZoneIdRules()` (`required`, `uuid`,
  `Rule::exists(...)` — a pre-flight check, not a race guard; the FK has the last word, which is why
  the actions catch `23000`).

- `app/Actions/Shipping/CreateShippingRate.php` — **new**.
  `__invoke(array $attributes): ShippingRate`. Trims before validating.

  > **Corrected — see D-11's own correction above.** This entry originally read *"Performs **no**
  > authorization, matching `CreateUser` / `UpdateUser`: the caller gates first"* — the same false
  > citation D-11 makes, quoted rather than silently rewritten. Should self-authorize `create` on
  > `ShippingRate::class` against `ShippingRatePolicy` as its own first statement when this story
  > is implemented, mirroring 0033's corrected `App\Actions\Shipping\CreateShippingZone`.

- `app/Actions/Shipping/UpdateShippingRate.php` — **new**.
  `__invoke(ShippingRate $rate, array $attributes): ShippingRate`.

- `app/Actions/Shipping/DeleteShippingRate.php` — **new**.
  `__invoke(ShippingRate $rate): bool`. A plain instance `->delete()` — through the **model**, never
  the query builder
  ([base-standards.md](../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder)).

- `app/Actions/Shipping/DeleteShippingZone.php` — **MODIFY** (0033's file, pre-shaped for exactly
  this). The guard 0033 deferred, in the shape 0024 **D-10** established:

  ```php
  public function __invoke(ShippingZone $zone): bool
  {
      return DB::transaction(function () use ($zone): bool {
          $this->guardAgainstReferencingRates($zone->shippingRates()->count());

          try {
              return (bool) $zone->delete();
          } catch (QueryException $e) {
              // 23000 here is shipping_rates.shipping_zone_id refusing under
              // restrictOnDelete(): a rate was created for this zone between the
              // count above and this delete. The count is the primary guard; the
              // FK is the last word -- the same relationship CreateUser has with
              // the users.email unique index. Re-count so the loser of the race
              // sees an accurate number, never a 500.
              if ($e->getCode() === '23000') {
                  $this->guardAgainstReferencingRates($zone->shippingRates()->count());
              }

              throw $e;
          }
      });
  }

  /**
   * @throws ValidationException  keyed on 'shippingZoneId' -- a hand-off
   *                              contract story 0037's @error block binds to.
   */
  private function guardAgainstReferencingRates(int $count): void
  ```

  The count is **unfiltered by carrier and by carrier state** (**D-5**), and `trans_choice` produces
  the message. The `DB::transaction()` wrapper 0033 added for a single statement is now doing the
  job it was added for.

- `app/Actions/Shipping/ResolveApplicableShippingRate.php` — **new**. The **D-1** algorithm.

  ```php
  /**
   * Choose the rate rule that applies to a destination and parcel weight.
   *
   * Walks the destination's ancestry chain (municipio -> comunidad autonoma ->
   * pais) most-specific-first. The chain is bounded at THREE by 0032's schema,
   * which is why this is a fixed walk and not a WITH RECURSIVE query (D-1).
   *
   * The winning tier is the most specific level carrying any rate rule that
   * passes the carrier filter -- NOT merely the most specific level a zone
   * covers, so a zone with no rates never suppresses a broader one (0033 D-5).
   * Once chosen, the tier does NOT reopen: if its rates do not cover the
   * parcel's weight, this returns "no rate" rather than falling back (D-1
   * step 4), and the result names the zone that decided it (D-13).
   */
  public function __invoke(
      GeographyEntry $destination,
      float|string $weightKg,
      ?string $shippingCarrierId = null,
  ): ShippingRateResolution
  ```

  Implementation notes that are decisions, not style: the ancestry chain is loaded with **one**
  eager load (`$destination->load('parent.parent')`), not three lazy hops; each tier is **one**
  query filtered on the pivot; ordering is `price` ASC, `created_at` ASC, `id` ASC (**D-1**);
  `whereHas('zone.geographyEntries', ...)` is acceptable at this data size and is preferred over a
  hand-written join for readability, but the **weight filter runs through
  `scopeCoveringWeight()`** so the null-aware bracket logic exists in exactly one place.

- `app/Actions/Shipping/ListShippingRatesByCarrier.php` — **new**. The grouped query PRD AC 2 and
  0037 need: carriers ordered by `name`, each with its rates eager-loaded **with their zone**
  (`ShippingCarrier::with(['shippingRates.zone'])`), so the screen renders without an N+1. Grouping
  by eager load rather than by `->groupBy()` in PHP over a flat rate list is deliberate: a carrier
  with **zero** rates must still appear as an empty group, which a rate-driven grouping silently
  drops. Its PHPDoc carries the array shape 0037 binds to.

- `app/Policies/ShippingRatePolicy.php` — **new**, via
  `php artisan make:policy ShippingRatePolicy --model=ShippingRate --no-interaction`.
  Auto-discovered by name; **no `AuthServiceProvider`** (this repo has none and needs none).
  `viewAny` / `create` / `update` / `delete` over the already-seeded `shipping.view` /
  `shipping.create` / `shipping.edit` / `shipping.delete`. **No per-target rule and no count guard
  here** — see **D-5**.

- `lang/en/shipping.php` + `lang/es/shipping.php` — **modify** (0035 creates them, 0033 adds
  `zones.*`). Add the `rates.*` group and the one key 0033 deliberately left unwritten:

  ```php
  // lang/en/shipping.php
  'zones' => [
      'delete_blocked' => '{1} This zone is used by 1 shipping rate and cannot be deleted.'
          .'|[2,*] This zone is used by :count shipping rates and cannot be deleted.',
  ],
  ```

  Key-for-key identical in `lang/es/`, with **Spanish pluralisation written by hand, not translated
  mechanically from the English form** (**R-6**).

### Not touched by this story

`geography_entries`' migration, model, factory, seeder or fixtures (0032). `shipping_zones` /
`shipping_zone_geography_entry` migrations, `ShippingZonePolicy`, and the create/rename/sync zone
actions (0033). `shipping_carriers`' migration, seeder, `ToggleShippingCarrier` (0035).
`routes/web.php`, `app/Livewire/**`, `resources/views/**` (**D-10**). `RolePermissionSeeder` —
`shipping.view|create|edit|delete` already exist; **no new permission**.

## Tests to perform

### `tests/Feature/ShippingRates/CreateShippingRateTest.php`
- [ ] A shipping administrator creates a rate for an active carrier and a zone → the row exists with
      every field round-tripping (PRD's *Create a rate rule for a carrier*).
- [ ] A rate created with no `max_weight_kg` persists `null`, not `0` — the "and above" tier.
- [ ] `min_weight_kg` defaults to `0` when omitted.
- [ ] Two rates may share a `name` across different carriers **and** within the same carrier+zone
      (**D-9**) — the prototype's four "Estándar" rows.
- [ ] `price` reads back as a **string** with two decimals, and `0.00` persists as a legal free rate
      (guards 0024 **R-4** and the `min:0`-not-`gt:0` rule).
- [ ] **A rate may be created for a currently disabled carrier** (**D-6**'s corollary) — an
      onboarding order the PRD never states and an implementation could plausibly forbid.
- [ ] A **malformed, non-UUID** `shipping_carrier_id` / `shipping_zone_id` is refused as a validation
      failure, not as a 500 — distinct from a well-formed id that simply does not exist.

### `tests/Feature/ShippingRates/ShippingRateValidationTest.php`
One **dataset** (`invalid_rate_attributes`) driving the PRD's `Scenario Outline`, named cases:
`min_greater_than_max`, `negative_price`, `negative_min_weight`, `blank_name`,
`blank_delivery_estimate`, `unknown_carrier`, `unknown_zone`, `price_scientific_notation`
(`'1e2'` — proves `decimal:0,2` and not a bare `numeric`), `weight_over_precision` (`2.0001`),
`price_over_ceiling`. Every case asserts **both** the validation failure **and** that no row was
created.

Separate tests, because their assertion is acceptance rather than rejection:
- [ ] `min == max` is **accepted** (**D-3** — a single-weight bracket is legal).
- [ ] A **null** `max_weight_kg` with any `min` is accepted, and `gte:min_weight_kg` does **not**
      fire — the `nullable` short-circuit. This is the rule most likely to be written backwards
      (`lte` on the min field), and it fails only for open-ended rates.
- [ ] `price` of exactly `0` is accepted.

### `tests/Feature/ShippingRates/UpdateShippingRateTest.php` / `DeleteShippingRateTest.php`
- [ ] **The whole `invalid_rate_attributes` dataset is re-run against the update path**, via `->with()`
      rather than copy-paste. 0033 **R-7**'s reasoning applies directly: a rule threaded through one
      call site and not the other fails silently in one direction only, and update is the direction
      nobody writes a bespoke test for.
- [ ] Editing a price persists it; editing does not silently clear `max_weight_kg`.
- [ ] **Reassigning a rate to a different zone** leaves every other field untouched — the operation
      the delete guard's message tells the administrator to perform, so it must actually work.
- [ ] Deleting a rate removes the row outright — `assertDatabaseMissing`, never `assertSoftDeleted`.
- [ ] Deleting a rate leaves its carrier and its zone untouched (asserted by **exact ids**, not by
      `count()` — 0033's rule: a count passes if rows were deleted and recreated).
- [ ] An unknown or malformed-UUID rate id fails cleanly (`ModelNotFoundException` / 404), not as a
      silent no-op.

### `tests/Feature/ShippingRates/ListShippingRatesByCarrierTest.php`
- [ ] Rates are returned grouped under their own carrier, carriers ordered by name.
- [ ] **A carrier with zero rates still appears, as an empty group** — the assertion that fails
      against a PHP `groupBy()` over a flat rate list.
- [ ] **A disabled carrier's rates still appear in the admin listing** — the listing is
      configuration, not resolution (**D-6**); only the resolver filters on `is_active`. Conflating
      the two is the likeliest cross-wiring in this story.
- [ ] The query count is bounded — no N+1 across carriers, rates or zones.

### `tests/Feature/ShippingZones/DeleteShippingZoneTest.php` — **MODIFY** (0033's file)
- [ ] **Un-skip 0033's named stub** (`->skip('shipping_rates does not exist yet — story 0036 must
      un-skip this')`). Leaving it skipped is the single most likely way this obligation is
      silently dropped.
- [ ] **The count is correct for at least two distinct reference counts** — 0033's explicit
      obligation, because a guard hardcoding "1 shipping rate" passes any single-fixture test. Use a
      dataset over `1`, `2` and `7`.
- [ ] The **singular** and **plural** message forms genuinely differ (guards a `trans_choice` string
      written with one branch, and its Spanish counterpart — **R-6**).
- [ ] The count **spans carriers** — 2 SEUR + 3 Correos rates → "5", not "2" or "3".
- [ ] The count **includes a disabled carrier's rates** (**D-5**). Highest-value single assertion in
      the guard: filtering by `is_active` here reads as a sensible optimisation and destroys
      configuration.
- [ ] A blocked deletion leaves **every** rate row unchanged, asserted by exact ids.
- [ ] **A second zone with zero referencing rates deletes successfully in the same test file.**
      Not padding: `SELECT COUNT(*) FROM shipping_rates` with no `WHERE shipping_zone_id = ?` passes
      a single-zone fixture identically to a correctly-scoped query, and blocks *every* zone
      deletion forever once any rate exists anywhere. See **R-10**.
- [ ] Deleting the last referencing rate **releases** the zone, which then deletes normally.
- [ ] **Reassigning** the last referencing rate to another zone also releases it — a **separate**
      test from the one above, because they are different call sites into the same count, and
      reassignment is the path the error message actually instructs the administrator to take.
- [ ] The zone's **geography membership rows survive** a blocked delete (a guard that half-executes
      would be worse than one that fails).
- [ ] **The `23000` path, split into the two halves that are genuinely reproducible** — real
      two-connection concurrency is not, and is explicitly not attempted:
      1. **The constraint fires.** Bypass the application entirely with
         `DB::table('shipping_zones')->where('id', $zone->id)->delete()` while a rate references it,
         and assert a `QueryException`. This proves `restrictOnDelete` exists and is enforced, and
         it doubles as the regression test for anyone "simplifying" the FK to `cascade`.
      2. **The action translates it.** Pass the action a partial double whose `delete()` throws a
         `23000` `QueryException`, and assert it surfaces the **same** `ValidationException` message
         the count guard produces — never a 500. The action is a plain `__invoke(ShippingZone $zone)`,
         so this needs no HTTP layer.

      **Connection caveat, verified rather than assumed:** `phpunit.xml` pins `DB_DATABASE=testing`
      but **not** `DB_CONNECTION`, and `.github/workflows/tests.yml` copies `.env.example` verbatim,
      which pins `DB_CONNECTION=sqlite` — so **CI runs this entire suite on SQLite and never on
      MySQL**, while production is `mysql:8.4`. SQLite's FK enforcement *is* genuinely on
      (`config/database.php`'s `'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true)`), so
      half 1 is real rather than vacuous — but MySQL's exact SQLSTATE surfacing for this FK is never
      verified by CI. **Assert on the thrown `ValidationException` and its message, never on a
      driver code string**, and record the engine the suite actually ran under. This is 0033
      **R-9**'s finding, reconfirmed here for this story's own FKs. See **R-4** and
      [`ci-database-connection-gap.md`](ci-database-connection-gap.md).

### `tests/Feature/ShippingRates/ResolveApplicableShippingRateTest.php`
The story's densest file. Structured as a few datasets plus the cases whose assertions genuinely
diverge.

Dataset `precedence_by_level` — same body, asserts the chosen zone:
- [ ] municipio zone beats comunidad zone beats country zone (three cases).
- [ ] The destination is itself a **comunidad** entry, then a **country** entry — the chain simply
      starts shorter and the walk still works (two cases; guards an implementation hardcoding a
      three-hop climb and null-dereferencing at the top).

Individual tests:
- [ ] **Implicit (ancestry-only) overlap** — zone A lists the municipio "Gijón", zone B lists only
      the country "España". No pivot row is shared; A must win. This is 0033 **D-2**'s case that no
      schema constraint can see, and it is the one an implementation reading only the pivot gets
      wrong.
- [ ] **Specificity beats price *across* tiers** — the country zone's rate is **cheaper** and the
      municipio zone's rate is **dearer**; the dearer municipio rate must still win. This is the
      single test that separates the specified algorithm from "sort every qualifying rate by price
      and take the first", which passes every other case in this file. Highest-value test in the
      precedence group alongside the no-fallback pair. See **R-11**.
- [ ] **Explicit overlap, same level** — two municipio zones both listing "Gijón", different prices
      → the cheaper wins.
- [ ] **Same price, different `created_at`** → the older wins (the second tiebreak key).
- [ ] **Full tiebreak determinism** — two same-level rates at the **same price**, created in the
      same second → resolution is stable across repeated runs, proving `id` is the final key and not
      row order (**D-1**). Run the resolver twice and assert the same id.
- [ ] **The D-3 boundary asserted from both sides in one body** — given a zone holding *only* the
      country "España" pivot row: `$zone->geographyEntries()->whereKey($gijonId)->exists()` is
      **false** (storage stays literal, 0033 **D-3**), while resolving a Gijón destination against
      that zone's rate **does** match at the país tier. Pins that the ancestry walk lives exclusively
      in the resolver and that this story did not "helpfully" expand membership at write time
      (**R-8**).
- [ ] **No fallback across tiers (D-1 step 4)** — the story's highest-stakes assertion. Municipio
      zone with rates only up to 2 kg, country zone with a rate covering 3 kg, 3 kg parcel → **no
      rate returned**, and the result names the municipio zone as the decider (**D-13**). A naive
      implementation returns the country rate here and every other test in the file still passes.
- [ ] **An empty-of-rates zone does not suppress a broader one** — municipio zone covering the
      address but carrying **zero** rates, country zone carrying a covering rate → the country rate
      wins. The exact converse of the previous test; the two together pin **D-1** step 2's
      "presence of rate rules, not zone coverage" wording, and an implementation that gets one right
      usually gets the other wrong.
- [ ] A zone with **zero geography entries** (0033 **D-5**) never matches any destination.

Dataset `weight_bracket_boundaries` over a `0`–`2` bracket, asserting matched/not-matched:
`1.999` ✓, `2` ✓ (**inclusive upper**, **D-3**), `2.001` ✗, `0` ✓ (**inclusive lower**), and against
a `min == max == 2` rate: `2` ✓.
- [ ] Separately: an **open-ended** (`max_weight_kg = null`) rate matches `5`, `50` and `5000` kg —
      the null-aware bracket (**D-4**, **R-1**). A single `where('max_weight_kg','>=',$w)` fails all
      three, and passes every closed-bracket case above, so this cannot be folded into the dataset.

Carrier interaction:
- [ ] A **disabled** carrier's rate is never chosen, even when it is the most specific match — the
      broader active carrier's rate wins instead (**D-6** read from the resolution side).
- [ ] Re-enabling the carrier makes its rate win again — proves disabling hid the rate rather than
      changing it.
- [ ] **Carrier-filtered resolution computes the tier under the filter** — a municipio-level SEUR
      rate must not suppress a country-level MRW rate when resolving for MRW. Fails against an
      implementation that picks the tier globally and filters afterwards, which is the natural way
      to write it.
- [ ] A destination no zone covers → no rate, with the "not covered" reason distinguishable from the
      "covered but no bracket" reason (**D-13**).

### `tests/Feature/Policies/ShippingRatePolicyTest.php`
- [ ] Each of `viewAny` / `create` / `update` / `delete` granted with, and refused without, its
      `shipping.*` permission — driven directly through `Gate::forUser()`, since **D-11** ships the
      policy with no caller.
- [ ] A Super Admin holding **no** explicit `shipping.*` grant passes all four, exercising the
      documented `Gate::before` bypass — and, read together with **D-5**, documenting that the same
      Super Admin still **cannot** delete an in-use zone, because that guard is deliberately not in
      a policy. Worth one explicit test: it is the concrete proof of 0033 **D-1**'s decisive
      argument.

### `tests/Unit/Models/ShippingRateTest.php`
- [ ] `price` casts to a **string** with two decimals; the weights cast with three.
- [ ] A factory-created rate gets a UUID the factory never sets, and it is **v7** specifically
      (`Str::isUuid($id, 7)`) — this app's `HasUuids` wiring, not the trait's existence.
- [ ] **Mass-assignment guard**: only the `#[Fillable]` fields are settable, so a column added later
      by reflex does not silently become mass-assignable (0033's `ShippingZoneTest` precedent).
- [ ] **`ShippingRate` does not use `SoftDeletes`** — pins **D-14**, which is otherwise invisible
      until the count guard quietly changes meaning.
- [ ] `scopeCoveringWeight()` is the only place bracket logic lives — an `arch()`-style or grep-based
      assertion is overkill; instead, the resolver test above exercises it through the real path.

### Not worth writing
- Migration `up()`/`down()` mechanics — `RefreshDatabase` exercises them every run.
- That `restrictOnDelete` on `shipping_carrier_id` blocks a carrier delete: **no carrier delete path
  exists** (0035 ships none), so a test would have to reach past the application to construct the
  scenario. The FK is defence in depth; record it, do not test it.
- Re-testing 0033's zone CRUD or 0035's toggle. This story asserts only what it changes.

## Expected outcome
`shipping_rates` exists and an administrator can create, edit and delete per-carrier rate rules
carrying a zone, a weight bracket (with an optional open-ended top tier), a EUR price and a free-text
delivery estimate; invalid rates — min weight above max, negative price — are refused with field-level
messages rather than SQLSTATE errors. The Shipping screen's data is available grouped by carrier,
including carriers with no rates. Deleting a shipping zone that rate rules still reference is refused
with an accurate count, at both the application and the database layer, and the zone becomes
deletable the moment its last rate is gone. Given a destination and a parcel weight, exactly one rate
is chosen deterministically — the most specific zone's, never a broader zone's silently substituted
price — or none is, with a reason a human can act on. Nothing in the UI changes: story 0037 builds
the screen on top of this.

## Acceptance criteria
- [ ] Rate rules are **created, edited and deleted per carrier** with zone, weight range, price (€)
      and delivery estimate *(PRD §2.4 AC 2)*.
- [ ] Rates are available **grouped by carrier**, and a carrier with no rates still appears
      *(PRD §2.4 AC 2)*.
- [ ] **Min ≤ max weight and a non-negative price are validated** *(PRD §2.4 AC 3)*, with `min == max`
      and a `0,00 €` rate both legal, and an absent maximum meaning "and above".
- [ ] Deleting a zone referenced by rate rules is **hard-blocked with an accurate count**, with no
      confirm-and-proceed path, and the block releases once the last rate is gone
      *(PRD §2.4, the `pending Phase 1 confirmation` block — now closed)*.
- [ ] The zone-delete guard lives in `DeleteShippingZone`, **not** in a policy, and a Super Admin
      cannot bypass it (**D-5**; 0033 **D-1**).
- [ ] The guard's count is **unfiltered** — every carrier's rates, including a disabled carrier's.
- [ ] `restrictOnDelete()` on **both** FKs, making the block a database invariant and closing the
      check-then-act race; a caught `23000` renders the **same** human message, never a 500.
- [ ] **Rate precedence on overlap is deterministic**: most specific tier wins, the tier is selected
      by the presence of rate rules under the active carrier filter, the tier does **not** reopen on
      weight, and same-level ties break on price → `created_at` → `id` (**D-1**).
- [ ] Both **explicit** and **implicit (ancestry-only)** overlap resolve by the same rule (0033
      **D-2**).
- [ ] A **disabled carrier's rates are never resolved**, and disabling a carrier that has rate rules
      is **allowed and destroys nothing** (**D-6**, closing 0035 **D**).
- [ ] "No applicable rate" is returned as a **reason**, not a bare `null` (**D-13**).
- [ ] `price` is `decimal(10,2)` matching 0024, weights are `decimal(8,3)`, no `->unsigned()` on any
      DECIMAL, and `price` is documented as a **string** on the model (**D-7**).
- [ ] **No uniqueness constraint** on `name` or on the bracket tuple, with the migration comment
      recording why (**D-9**).
- [ ] `ShippingRate` does **not** use `SoftDeletes`, and a test pins it (**D-14**).
- [ ] `shipping_rates.id` is a UUID v7 via `HasUuids`; both FKs are `CHAR(36)`, matching their
      parents.
- [ ] `ShippingRatePolicy` gates the four abilities on the already-seeded `shipping.*` permissions;
      **no new permission and no `RolePermissionSeeder` change**.
- [ ] **No route, Livewire component or Blade view is added** (**D-10**), and the only files owned by
      other stories that this one edits are the four named in *Files to create/modify*.
- [ ] `down()` is the exact inverse of `up()`.
- [ ] No external carrier API is called, stubbed or configured *(PRD §2.4 AC 9)*.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite
      ([contracts.md](../../docs/contracts.md#full-test-suite-gate-rule)'s Full Test Suite Gate Rule).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor).
- [ ] Documentation updated (docs-keeper) — [`docs/database/schema.md`](../../docs/database/schema.md)
      (new table + ER diagram), [`docs/architecture/`](../../docs/architecture/) for the resolution
      rule (it is domain behaviour Epic 3 will consume and must not re-derive), and
      [`docs/errors-log.md`](../../docs/errors-log.md) if the FK-index duplication 0033 **R-1**
      predicts is confirmed by this story's `php artisan db:table shipping_rates` check.
- [ ] **0033's deferred obligations discharged, each verifiable**: its delete stub un-skipped; the
      count guard implemented in `DeleteShippingZone`; `restrictOnDelete` on
      `shipping_rates.shipping_zone_id`; `23000` caught and converted; the count asserted for **≥ 2
      distinct reference counts**; and the overlap-precedence rule owned and decided (**D-1**).
- [ ] **0035's deferred decision D discharged** — disabling a carrier with rate rules (**D-6**).
- [ ] **`shipping.zones.delete_blocked` added to both locales**, with Spanish pluralisation written
      by hand (**R-6**).
- [ ] **Hand-off to 0037 recorded** — the policy ships with zero call sites, so this is the only
      thing making it real. 0037 must (a) `Gate::authorize()` before invoking **every** rate action,
      (b) bind `@error('shippingZoneId')` on the **rate create/edit modal's zone select** — the
      field-level failure `shippingZoneIdRules()`'s `Rule::exists(...)` raises, i.e. this story's
      `unknown_zone` case in the `invalid_rate_attributes` dataset — alongside the rate form's other
      field keys from `ShippingRateValidationRules`, (c) render an
      open-ended bracket as "N kg y superior", never "N–null", and (d) keep the rate id feeding any
      `Rule::exists`/`ignore()` server-authoritative via `#[Locked]` plus a re-read, per
      [livewire-authorization.md](../../docs/security/livewire-authorization.md).

      > **Correction, 2026-08-19.** Item (b) originally read *"bind its **delete-modal** `@error` to
      > the `shippingZoneId` error-bag key"*, which conflated two unrelated surfaces: `'shippingZoneId'`
      > is also the key **D-5**'s zone-delete guard raises, and that guard fires on
      > [0034](done/0034-shipping-zones-ui.md)'s shipping-zone screen, never on 0037's rate-delete modal —
      > `DeleteShippingRate` has no such guard, so the original instruction named an error nothing on
      > that modal can raise. 0037's Phase 1 debate caught the misreading (its **OQ-A**) and adopted
      > the field-level reading above; the wording is corrected here so Phase 2 reviewers and Phase 3
      > implementers are not misled by the original.
- [ ] Acceptance criteria met.

## Dependencies, risks, open questions

### Dependencies
- **0033 — shipping zones.** Hard: `shipping_zones`, `ShippingZone`, and
  `app/Actions/Shipping/DeleteShippingZone.php`, which this story modifies.
- **0035 — shipping carriers.** Hard: `shipping_carriers`, `ShippingCarrier` (modified here), and
  `lang/en|es/shipping.php`.
- **0032 — geography catalog.** Hard for the resolver: the `level` discriminator and `parent_id`.
- **0002 — seeded permission catalog.** `shipping.*` already exists; nothing to add.
- **Sequential-only.** 0033, 0035 and 0036 all write `lang/en|es/shipping.php`, and 0036 additionally
  edits two files 0033/0035 create. Per
  [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent
  File-Ownership Rule these three must never be implemented concurrently.
- **Blocks 0037** (the Shipping screen UI) and **Epic 3 Orders** (the resolver's consumer).

### Risks
- **R-1 — the non-null-aware bracket query.** `where('max_weight_kg', '>=', $w)` silently drops every
  open-ended tier because `NULL >= 5` is `NULL`. It passes every closed-bracket test, so only the
  dedicated open-ended test catches it. Highest-likelihood functional bug in the story;
  `scopeCoveringWeight()` exists to give it one home.
- **R-2 — the no-fallback rule implemented as fallback.** Filtering by weight *before* selecting the
  tier is the natural way to write the resolver and produces **Rule B** (see **D-1**), which is a
  different product. Every other resolver test still passes. Guarded by the paired
  no-fallback / empty-zone tests, which must both exist.
- **R-3 — the guard's count filtered by carrier state.** `->whereHas('carrier', fn ($q) => $q->where('is_active', true))`
  reads as a sensible refinement and quietly permits destroying a disabled carrier's whole rate set.
  Guarded by a dedicated test (**D-5**).
- **R-4 — the `23000` path is engine-dependent, and CI does not run the engine production uses.**
  Verified, not suspected: `phpunit.xml` pins `DB_DATABASE=testing` but not `DB_CONNECTION`;
  `.github/workflows/tests.yml` copies `.env.example` verbatim, which pins `DB_CONNECTION=sqlite`;
  production is `mysql:8.4`. SQLite FK enforcement is genuinely on
  (`'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true)`), so restrict *semantics* are
  exercised — but MySQL's SQLSTATE surfacing for these FKs is never verified by CI, and a
  MySQL-specific divergence would ship fully green. Assert on the surfaced `ValidationException`,
  never on a driver code string, and record which engine the suite ran under. Same finding as 0033
  **R-9**. Tracked independently by [`ci-database-connection-gap.md`](ci-database-connection-gap.md),
  which is **not** a blocker for this story but does bound what its FK tests prove.
- **R-5 — a fourth geography level would invalidate the fixed three-hop walk.** 0032's **OQ-5**
  keeps province as a *column*, not a level, precisely so the depth stays three. If that is ever
  revisited, **D-1**'s "no `WITH RECURSIVE`" reasoning must be revisited with it. Named so the two
  decisions stay linked.
- **R-6 — ⚠️ CORRECTED 2026-09-01 (was: `trans_choice` has no precedent anywhere in `lang/`, citing
  0024 **R-8**, which was itself wrong).** There has been one since task 0010 —
  `lang/en/roles.php`'s `index.delete_blocked`, six `trans_choice()` call sites, and a documented
  convention in [naming.md](../../docs/conventions/naming.md#translation-keys) — and
  [0024b](done/0024b-product-category-in-use-delete-guard.md)'s `products.categories.delete_blocked` is the
  second. **Copy the shipped simple `singular|plural` form** rather than inventing an explicit-range
  one. **What survives of this risk**: Spanish pluralisation is not English's, both locale files land
  in this change, and a mis-written plural branch shows up as a message that reads wrong rather than
  as a failure.
- **R-7 — `price` cast to a string.** `if ($rate->price > 100)` on a cast string is a silent numeric
  coercion, and `@property float $price` reads as obviously correct. 0024 **R-4**, inherited whole.
- **R-8 — over-helpful transitive membership.** 0033 **D-3** makes membership literal; this story is
  the **first** place ancestry is walked, so it is also the first place someone could "helpfully"
  expand a country into its municipios at write time. The resolver walks **upward from the
  destination**, never downward from a zone; the ancestry-only-overlap test pins the difference.
- **R-10 — the delete guard's count query scoped globally instead of per zone.**
  `ShippingRate::count()` instead of `$zone->shippingRates()->count()` passes a single-zone,
  single-rate fixture *identically* to the correct query — and then blocks the deletion of **every**
  zone forever, as soon as any rate exists anywhere. Caught only by the second, unreferenced zone
  that must still delete successfully in the same test file.
- **R-11 — the price tiebreak leaking across tiers.** An implementation that collects every
  qualifying rate and sorts globally by price passes every precedence case except the one where the
  broader tier is *cheaper*. It is the natural way to write a "pick the best rate" function, and it
  quietly discards the entire specificity rule. Guarded by the dedicated cross-tier price-inversion
  test.
- **R-9 — migration ordering across branches.** This story's migration must sort after 0033's and
  0035's. A merge from parallel branches can produce the wrong filename order, and a developer who
  already ran `migrate` sees nothing — the failure lands on the next clean run. 0033 **R-6**'s guard
  applies: a full fresh migration against a **throwaway** database, which per
  [contracts.md](../../docs/contracts.md#destructive-database-command-rule)'s Destructive Database
  Command Rule is a deliberate, separately-authorized step.

### Resolved during Phase 1
Recorded so they are not reopened:
- **Both of the prior debate attempt's open questions are closed here**: the no-fallback weight rule
  (**D-1**, confirmed — but on a *different and stronger* argument than the one originally offered,
  and against a real counter-argument recorded in full), and overlapping weight brackets
  (**D-2**, allowed, on the prototype's own reference data).
- **The prior attempt's `created_at`-final tiebreak was extended** to `price → created_at → id`,
  because timestamps collide within a second and the tiebreak must be a total order (**D-1**).
- **The prior attempt's tier-selection predicate was tightened**: the tier is chosen by the presence
  of rate rules **under the carrier filter**, not by zone coverage alone (**D-1** step 2). The
  original wording would have let an empty zone cause a shipping outage and let one carrier's
  narrow rate suppress another's.
- **The prior attempt's bare-`null` "no rate" return was rejected** in favour of a reasoned result
  (**D-13**), which is what makes the no-fallback rule diagnosable rather than merely safe.
- **The prior attempt's no-route/no-component position is adopted unchanged** (**D-10**) — the
  argument that 0035 already owns the route and view path is correct and decisive.

### Open questions
None blocking. Two items are deliberately **decided rather than deferred**, and are flagged as the
cheapest things to reverse if the product owner disagrees after seeing them run:

- **OQ-A (decided, reversible) — no fallback across tiers (D-1 step 4).** The single highest-stakes
  call in the story, argued both ways in **D-1**. Reversing it is a change to one branch of the
  resolver plus two tests. If Epic 3 shows real configurations tripping it, revisit **with** the
  coverage-gap reporting **D-13** enables, not before.
- **OQ-B (decided) — inclusive-both bracket boundaries (D-3).** Makes the prototype's own touching
  brackets overlap at exactly 2 kg, resolved by the price tiebreak. The alternative (half-open) is a
  one-line change but silently kills any `min == max` rate.

## Provenance
Phase 1 Three Amigos debate, 2026-08-18: `product-owner` + `backend-expert` + `backend-qa` +
`database-expert`, per [`docs/workflow.md`](../../docs/workflow.md#phase-1--three-amigos-debate)'s
classification rule (backend, touches the data model).

Three notes on how this debate actually ran, recorded for honesty:

- **`backend-qa` was convened live and materially changed this document.** Its independent finding
  that *"matching tier"* had at least three mutually exclusive, individually defensible definitions —
  and that a suite written against one would show green against an implementation of another —
  is what forced **D-1** step 2 to be written as an explicit predicate rather than as the phrase
  "most specific wins". It also contributed the cross-tier price-inversion test (**R-11**), the
  global-count-scope test (**R-10**), the two-half `23000` technique, the verified
  CI-runs-SQLite-only finding in **R-4**, and the open question about creating a rate for a disabled
  carrier, which **D-6**'s corollary now answers.

- **`backend-expert`'s contribution came from an earlier debate attempt that was interrupted before
  synthesis.** It was re-read and evaluated rather than adopted wholesale: its schema shape,
  fixed-depth ancestry walk, `gte`-on-the-max-field validation, `DeleteShippingZone` extension shape
  and no-route position are **adopted**; its tier-selection predicate, its tiebreak, and its
  bare-`null` return are **overridden**, each with the reasoning above.
- **The `database-expert` dispatch was refused — the concurrent subagent pool was saturated — so
  `product-owner` covered that role directly**, grounding every schema decision in this repo's
  existing recorded ones (0016's `decimal(6,3)` and no-`unsigned` rules, 0024 **D-2**'s
  `decimal(10,2)` and string cast, 0033's collation and FK-index reasoning, 0032's key types) and in
  the prototype's real data (`docs/arospe-handoff/project/js/envios.js`) rather than deriving them
  independently. **Phase 2 should treat D-7, D-9 and D-12 as the decisions most worth a second
  database-informed look**, since they had no independent reviewer.
