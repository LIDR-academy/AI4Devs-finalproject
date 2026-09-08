# [0037] Shipping carriers and rates — UI (carrier cards, grouped rate table, rate modal)

## Description
Build the real Shipping screen on top of the placeholder [0035](0035-shipping-carriers-backend.md)
left at `/shipping`: carrier cards with an enable/disable toggle and an Activo/Inactivo state, and
below them a rate table grouped by carrier showing each rate's name, zone badge, weight range (kg),
price (€) and delivery estimate — plus a create/edit rate modal and a delete-confirmation modal.
This story is also the first caller of [0036](0036-shipping-rate-rules-backend.md)'s
`ShippingRatePolicy`, which shipped with zero call sites.

## Type
frontend | related_task_id: **0035** and **0036** (both paired backend stories, done) | includes
database-expert: **no**

No migration, no model, no action, no policy and no new permission. Every domain artifact this
screen drives already exists; this story is markup, component wiring and authorization call sites.

**PRD coverage.** [§2.4 Shipping](../../docs/PRD/PRD.md#24-shipping). From the
`Feature: Shipping carriers and rates` block this story owns the **rendered** form of *Enable a
carrier*, *Disable a carrier*, *Create a rate rule for a carrier*, and the
`Scenario Outline: An invalid shipping rate is rejected` (both examples). It satisfies the UI half
of **AC 1** (carriers enabled/disabled with a toggle, showing an active/inactive state) and
**AC 2** (rate rules created/edited/deleted per carrier with zone, weight range, price and delivery
estimate, **shown grouped by carrier as in the prototype**) — the "shown" in AC 2 is the half no
prior story could satisfy. It renders **AC 3**'s validation as inline field messages. The
zone-catalog half of §2.4's acceptance list (**AC 4–8**) belongs to 0032/0033/0034 and is not
touched here.

**Boundaries with the sibling stories**, referenced and never redefined:

- **0035 — carriers.** Owns `shipping_carriers`, `ShippingCarrier`, `ToggleShippingCarrier`, the
  `/shipping` route, `App\Livewire\Shipping\Index` and `resources/views/livewire/shipping.blade.php`.
  This story **fills in** the last two; it adds no route and no action.
- **0036 — rate rules.** Owns `shipping_rates`, `ShippingRate`, the three rate actions,
  `ShippingRateValidationRules`, `ShippingRatePolicy`, `ListShippingRatesByCarrier` and
  `ResolveApplicableShippingRate`. This story **consumes** them and modifies none.
- **0033 / 0034 — zones.** Own `shipping_zones`, `ShippingZone`, the zone actions and the
  `shipping/zones` screen. This story **reads** `ShippingZone` to populate one dropdown and links to
  their screen; it rebuilds nothing.
- **Epic 3 — Orders.** The only consumer of `ResolveApplicableShippingRate`. **It is deliberately
  not surfaced anywhere on this screen** (**D-9**).

## Documented functional decisions

Eleven decisions. **D-2** is the one that changes an upstream assumption and is the highest-stakes
call in the story. Genuinely unresolved items are in **Open questions**, not here.

---

### D-1 — The rate table extends 0035's `App\Livewire\Shipping\Index` in place. No second component, no second route.

[0036](0036-shipping-rate-rules-backend.md) **D-10** is dispositive rather than advisory: 0035
already claims `Route::livewire('shipping', ShippingIndex::class)->name('shipping.index')` **and**
`resources/views/livewire/shipping.blade.php` — *the* path Livewire's
[`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
forces for `App\Livewire\Shipping\Index`. A separate rate component either collides on that file or
invents a second shipping route nobody asked for. 0036 names the consumer explicitly: *"Story 0037
is the named consumer, and it owns the whole screen including the carrier cards 0035 stubbed."*

**This does not contradict [0034](done/0034-shipping-zones-ui.md) D-1**, which rejected folding zone CRUD
into `/shipping` on a "one component owning three unrelated concerns" argument. That argument
carved *zones* out — a separate workflow with its own picker, its own validation surface and its own
sidebar entry — leaving `Index` with **two** concerns that are one screen: PRD §2.4's own screenshot
caption describes "carrier cards … **above** a rate table grouped by carrier" as a single view.
Splitting them would fragment one screen across two Livewire islands for no reuse.

**Vertical order is carrier cards above the rate table**, from that same caption. Recorded because
neither 0035 nor 0036 states it — both defer all markup here.

### D-2 — The blank "no max weight" field: the property is a `string` sentinel, normalised to `null` **before** `validate()`. And 0036's stated assumption about this is wrong in a way that fails *silently*.

This is the decision the brief flagged for empirical verification, and verification changed the
answer. Three findings, each read out of installed vendor source rather than reasoned from memory.

**Finding 1 — a blank input reaches the component as `''`, never `null`, and untrimmed.**
`vendor/livewire/livewire/src/Mechanisms/HandleRequests/HandleRequests.php:80-89` defines
`skipRequestPayloadTamperingMiddleware()`:

```php
\Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::skipWhen(function () {
    return $this->isLivewireRequest();
});

\Illuminate\Foundation\Http\Middleware\TrimStrings::skipWhen(function () {
    return $this->isLivewireRequest();
});
```

`isLivewireRequest()` is `request()->hasHeader('X-Livewire')`. Both middleware are **global** in
Laravel 13 (`Illuminate\Foundation\Configuration\Middleware:462`), and `TransformsRequest::clean()`
*does* reach a JSON body — so without this opt-out they would rewrite the payload. Livewire opts
itself out by name. **Consequence: no empty-string-to-null coercion and no trimming happens on any
`/livewire/update` round-trip.** A blank field is `''`.

**Finding 2 — `''` is not rejected by 0036's rule set. It is skipped, and passes.** This is where
[0036](0036-shipping-rate-rules-backend.md)'s reasoning is wrong. Its `maxWeightRules()` opens with
`'nullable'` and comments that it "short-circuits". `Validator::isNotNullIfMarkedAsNullable()`
(`Validator.php:886`) tests `is_null()`, and `''` is not null — so on that path alone `numeric`
would run and reject. But `isValidatable()` (`Validator.php:819`) checks
`presentOrRuleIsImplicit()` **first** (`Validator.php:839`):

```php
if (is_string($value) && trim($value) === '') {
    return $this->isImplicit($rule);
}
```

`Numeric`, `Decimal`, `Min`, `Max` and `Gte` are all **absent** from `$implicitRules`
(`Validator.php:207-232`, which lists only the `Required*` / `Present*` / `Missing*` / `Filled` /
`Accepted*` / `Declined*` family). So for `''` **every rule in `maxWeightRules()` is skipped**, the
field passes, and `$validated['max_weight_kg']` comes back as the empty string it went in as.

**Finding 3 — the resulting failure is engine-dependent, and CI runs the engine that hides it.**
That raw `''` reaches a `DECIMAL(8,3)` column. `.env.example:23` pins `DB_CONNECTION=sqlite` and
`phpunit.xml:29` pins only `DB_DATABASE=testing`, so **the whole suite runs on SQLite**, which is
loosely typed and stores `''` without complaint. Production is `mysql:8.4` in strict mode, which
raises `Incorrect decimal value` (SQLSTATE 22007 / error 1366) as an uncaught `QueryException` — a
**500**. So the naive implementation is *green in CI and a 500 in production*, which is the exact
shape of the gap [0036](0036-shipping-rate-rules-backend.md) **R-4** and
[`ci-database-connection-gap.md`](ci-database-connection-gap.md) already track.

**The decision, therefore:**

1. `public string $maxWeightKg = '';` — a `string`, never `?string`, never `null`. This is
   [errors-log.md](../../docs/errors-log.md)'s `null`-property rule applied beyond `<select>`: a
   `wire:model`-bound property must hold a real empty value in the type the DOM expects. Same for
   `$minWeightKg`, `$price`, `$shippingCarrierId`, `$shippingZoneId` — and `reset()` must restore
   the sentinels, never `null`.
2. **Normalise to `null` as the first statement after authorization and before `validate()`**, not
   after it:

   ```php
   // Blank means "and above" (0036 D-4). This runs BEFORE validate() deliberately:
   // Livewire skips ConvertEmptyStringsToNull, and Laravel's own validator skips every
   // non-implicit rule for a blank string -- so '' would sail through validation and hit
   // a DECIMAL(8,3) column. Converting first makes 'nullable' the rule that actually decides.
   $maxWeightKg = trim($this->maxWeightKg) === '' ? null : trim($this->maxWeightKg);
   ```

   Normalising **before** validation, rather than relying on the blank-string skip, is what makes
   the outcome depend on a documented rule (`nullable` against a real `null`) instead of on
   `presentOrRuleIsImplicit()` behaviour no future reviewer has any reason to know. This is exactly
   the position, and the reason, that `Users\Index::save()` lowercases the email in — and that
   [0017](done/0017-sales-region-tax-configuration-backend.md) **D12** normalises its rate in.
3. Because `TrimStrings` is skipped too, the component **trims every string field itself**. Do not
   assume framework trimming anywhere on this screen.

**What Phase 3 must verify empirically** — and what is *not* sufficient:

| Level | Assertion | Why it is needed |
| --- | --- | --- |
| Component | `set('maxWeightKg', '')` → `call('saveRate')` → `assertDatabaseHas('shipping_rates', ['max_weight_kg' => null])` | The cheap regression guard. Note it asserts the **row**, not the validation outcome — validation passing was never the risk. |
| Browser | Clear the max-weight field by **real keystrokes**, submit, reload, assert the persisted row is `null` | The only level that proves a real blank input produces this. |
| Browser | Reopen the saved rate in edit mode → the max-weight field renders **genuinely blank**, not `"0"` or `"null"` | The return direction. A fix handling create-only passes everything above. |

**`set('maxWeightKg', null)` must never be the proof.** It writes the property directly, never
touches the DOM, and would be green against a completely broken screen — the precise lesson
[errors-log.md](../../docs/errors-log.md) records for the `null`-`<select>` desync, whose own entry
also notes that a `selectOption()`/`fill()`-style API can miss the same class of bug because the
failure mode is a *missing* event.

**Also record the two wrong implementations this must fail against:** passing `''` straight through
(silent `''` in SQLite CI, 500 on MySQL), and `(float) ''` → `0.0`, which either rejects the
Gherkin's own "from 5 kg with no maximum" case via `gte:min_weight_kg`, or — when `min` is `0` —
**silently saves a closed `[0, 0]` bracket that looks like a successful open-ended rate**. The
second is the dangerous one, and only the exact `=== null` assertion catches it.

> **Feed this back to 0036.** Its `maxWeightRules()` comment states a mechanism that does not hold.
> The rule set itself needs no change once this story normalises upstream of it, so this is a
> **comment correction in 0036, not a code change** — but it should be corrected, because the next
> caller will read that comment and trust it.

### D-3 — The zone select is a plain `flux:select`, not 0022's searchable multi-select.

Three independent reasons, any one sufficient:

1. **Cardinality mismatch.** 0022 exists for the ~8,100-row geography catalog;
   [0034](done/0034-shipping-zones-ui.md) **D-4**'s entire justification is that "a plain `<select>` does
   not scale" *at that size*. Shipping zones are admin-curated groupings, realistically in the tens.
   `ShippingZone::orderBy('name')->get(['id', 'name'])` is one bounded query and the full option
   list in the DOM is unremarkable at that size.
2. **Arity mismatch.** 0022 is a **multi**-select bound to an array. A rate carries exactly one
   zone (`shipping_zones.id` NOT NULL, one FK). Using it would mean binding an array and validating
   "exactly one" — fighting the component's own contract for no gain.
3. **Risk avoidance.** [0034](done/0034-shipping-zones-ui.md) names embedding 0022's dropdown inside a
   `flux:modal` as an explicitly untested combination whose fallback, if unfixable, is a full-page
   editor. This story's zone control lives inside a modal. There is no reason to inherit an open
   risk that nothing here requires.

**Revisit trigger, recorded:** if the zone catalog is ever bulk-imported rather than hand-curated
and passes roughly 200 entries, or if a genuine single-select variant of 0022 is built for another
consumer, reconsider. Not before.

Consequence per **D-2**: `public string $shippingZoneId = '';` with a placeholder
`<option value="">`, never `null` — the errors-log `<select>` rule, literally.

### D-4 — The carrier select lists **every** carrier, disabled ones included.

[0036](0036-shipping-rate-rules-backend.md) **D-6**'s corollary is explicit and tested: *"a rate rule
may be created for a carrier that is currently disabled … Rates are configuration; `is_active`
governs **resolution**, never authoring."* Filtering the select on `is_active` would silently
contradict a confirmed decision and break the natural onboarding order (configure a carrier's rates,
*then* switch it on).

The same rule governs the **table**: a disabled carrier's rates stay listed. Only
`ResolveApplicableShippingRate` filters on `is_active`, and it does not run on this screen.
Conflating listing with resolution is the single likeliest cross-wiring in the whole shipping set.

### D-5 — Weight and price inputs are `type="text" inputmode="decimal"`, never `type="number"`, and a Spanish decimal comma is accepted.

Not a new decision — [0018](done/0018-sales-region-tax-configuration-ui.md) **D1** and
[0017](done/0017-sales-region-tax-configuration-backend.md) **D12** already settled this for the tax-rate
field, and the reasoning transfers verbatim: a native `<input type="number">` does its own
client-side parsing, so `4,95` is either refused as a keystroke or coerced before submission and the
comma **never reaches the wire payload** for the component to normalise. `type="text"` plus
`inputmode="decimal"` keeps the mobile numeric keypad while doing no coercion.

So `saveRate()` normalises alongside **D-2**'s blank handling, in the same pre-`validate()` block:

```php
$price = trim(str_replace(',', '.', $this->price));
```

`decimal:0,2` / `decimal:0,3` have no comma branch, so an un-normalised comma is a validation
failure — which means the normalisation is what makes `4,95` legal on the component path while
staying illegal against `priceRules()` in isolation. Both facts get asserted, per 0017's precedent.

This resolves the question `frontend-qa` raised as ambiguous: it is not open, it is precedent.

### D-6 — Row and toggle actions gate on **screen-level** `#[Computed]` capability flags, not per-row `Gate::allows()`.

[0034](done/0034-shipping-zones-ui.md) **D-5**'s reasoning transfers unchanged. The Users screen computes
`canEdit`/`canDelete` per row because `UserPolicy` carries genuine per-target rules (Super Admin
protection, trashed-target refusal). `ShippingRatePolicy` carries **none** — 0036 **D-11** ships four
uniform abilities, and **D-5** deliberately keeps the only per-record rule in the shipping domain
(the zone in-use guard) in an *action*, not a policy. So three flags evaluated once per render say
exactly as much as N × 2 `Gate::allows()` calls, and say it more honestly.

**What is reused unchanged is the disabled-branch *markup*** — see **D-8**.

**Revisit trigger:** if any story gives `ShippingRatePolicy` a per-target rule, this moves back to
per-row evaluation. The markup is identical either way, so the change is confined to where the flag
is computed.

### D-7 — Where every `Gate::authorize()` goes. This discharges 0036's central hand-off.

[0036](0036-shipping-rate-rules-backend.md) **D-11** ships `ShippingRatePolicy` with **zero call
sites** and states the cost openly: *"nothing in this story can regress if the policy is wrong."*
This story is what makes it real.

| Method | Call | Note |
| --- | --- | --- |
| `mount()` | `Gate::authorize('shipping.view')` | Bare permission string, matching 0035's already-established carrier convention on this same component. `ShippingCarrier` has no policy by 0035's explicit decision. |
| `toggleCarrier()` | `Gate::authorize('shipping.edit')` | 0035's contract, unchanged. |
| `saveRate()` — create branch | `Gate::authorize('create', ShippingRate::class)` | Class-scoped, mirroring `Gate::authorize('create', User::class)` in `Users\Index::save()`. |
| `saveRate()` — edit branch | `Gate::authorize('update', $rate)` | `$rate = ShippingRate::findOrFail($this->editingRateId)` **re-read from the database first** — never trusted from `$ratesByCarrier`. |
| `deleteRate()` | `Gate::authorize('delete', $rate)` | Same re-read discipline. |

Each is the **first statement** of its method (or of its branch). Route middleware is *not* what
protects them: `verified` and Spatie's `permission:` middleware are absent from Livewire 4's
`PersistentMiddleware` allow-list, so `/livewire/update` reaches every method directly — see
[livewire-authorization.md](../../docs/security/livewire-authorization.md).

**The screen-level flags of D-6 deliberately use the bare permission string, not the policy.**
`ShippingRatePolicy::update(User $user, ShippingRate $shippingRate)` has a **non-nullable** target,
and at render time — before any specific rate is being edited — there is no row to pass.
`UserPolicy::promoteToAdministrator(User $user, ?User $target = null)` is this repo's one
nullable-target precedent, and 0036 never gave `ShippingRatePolicy` that shape because it had no
caller. Using the permission string for the *UI hint* and the policy for the *actual mutation* (which
always has a concrete `$rate`) avoids editing a file this story does not own. Raised as **OQ-D**.

### D-8 — Rendering rules, each with a recorded trap behind it.

- **Open-ended bracket.** `maxWeightKg === null` renders
  `__('shipping.rates.weight_open_ended', ['min' => …])` → *"5 kg y superior"*. **Never**
  string-concatenate `"{$min}–{$max}"` — that is 0036's literal `"5–null kg"` bug.
- **`price` is a string.** The `decimal:2` cast returns a **string** (0036 **D-7**, **R-7**,
  inherited from 0024 **R-4**). Interpolate it directly; never `(float)` it and never compare it
  numerically in a Blade `@if`. A `0.00` rate is a **legal free-shipping rate** and must render as
  `0,00 €`, so the naive truthiness test `@if ($rate['price'])` is forbidden — the same trap
  [0018](done/0018-sales-region-tax-configuration-ui.md) **D6** records for a `0.000` tax rate.
- **Zone badge** — a `flux:badge` carrying the zone name. **Neutral `zinc`**, one colour for all
  zones: unlike `UserStatus`, zones are admin-created with no fixed set, so per-zone colouring would
  require inventing a mapping nobody has agreed.
- **Row actions are icon-only**, carrying an `aria-label` plus `data-test="edit-rate-{id}"` /
  `data-test="delete-rate-{id}"` — **present on both the enabled and the disabled branch**, so a
  browser test selects a row action the same way regardless.
- **The disabled branch is separate markup, and two non-obvious rules govern it.** A `tooltip` prop
  bound conditionally on `flux:button` renders an empty bubble on **every enabled row** under
  `livewire/blaze`, so the disabled branch must be a full `@if`/`@else` with an explicit
  `<flux:tooltip>` wrapper written out; and `cursor-not-allowed!` must sit on that **wrapper**, never
  on the button, because Flux's `disabled:pointer-events-none` removes the button from hit-testing.
  Both are in [errors-log.md](../../docs/errors-log.md) with their verification method. Copy the
  structure from `resources/views/livewire/users.blade.php`; do not rediscover either.
- **Every id in a `wire:*` argument goes through `@js()`** — `toggleCarrier(@js($carrier['id']))`,
  `openEditRateModal(@js($rate['id']))`, `confirmDeleteRate(@js($rate['id']))`. Mandatory, not
  stylistic: a value in a `wire:` directive lands in a JavaScript evaluator where Blade's HTML
  escaping is undone by the parser
  ([blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md)).
- **Both modals' inner content is wrapped** in `@if ($showRateModal)` / `@if ($showDeleteRateModal)`,
  so only one "Cancel" control is ever in the DOM — the Users-screen rule, now applied to a third
  modal pair on a screen that already has one.
- **A carrier with zero rates renders as its own group** with an explicit "no rates yet" sub-state.
  0036's `ListShippingRatesByCarrier` guarantees the empty group exists precisely so the view can
  render it; omitting it discards behaviour 0036's suite pins.

### D-9 — `ResolveApplicableShippingRate` is not surfaced anywhere, and one arch-test line pins that.

0036 built the resolver for **Epic 3 checkout consumption**, not for an admin control. Nothing on
this screen quotes a rate for a destination.

Normally this project rejects "assert the absence of a thing nobody proposed" tests
([0034](done/0034-shipping-zones-ui.md) rejects exactly that shape). This one is the narrow exception, on
`frontend-qa`'s argument: the resolver is a real, directly-importable class sitting in the same
namespace as everything this story *does* call, and 0036 **D-13** itself invites *"a future admin
screen [to] surface coverage gaps from the same shape"* — a concrete, named temptation. So:
**one line** — `expect(App\Livewire\Shipping\Index::class)->not->toUse(ResolveApplicableShippingRate::class)`
— not a dedicated file. Its real enforcement is Phase 5 review.

### D-10 — Navigation: one ungated sidebar item, plus a link to the zone screen from the rate modal.

`resources/views/layouts/app/sidebar.blade.php` today renders exactly two items (Dashboard, Users),
0035 adds none for `/shipping`, and 0034 adds one for `shipping.zones.index`. This story adds one
ungated `flux:sidebar.item` to `shipping.index`, in the deliberately cosmetic style
[api/routes.md](../../docs/api/routes.md) records for the Users link — access is still refused by
`can:shipping.view` on the route and re-checked in `mount()`; permission-aware navigation arrives
with story **0013**.

**Watch the `:current` predicate.** The existing Users item uses `request()->routeIs('users.*')`. A
`shipping.*` wildcard here would highlight the Shipping item while the user is on
`shipping.zones.index`, and vice versa. Both items must match their **exact** route name.

**The rate modal links to the zone screen.** An administrator creating a rate frequently needs a zone
that does not exist yet, and a round-trip through the sidebar and back loses the half-filled form.
A small secondary link beside the zone select pointing at `route('shipping.zones.index')` is the
minimum that fixes it. Raised as **OQ-C** because the placement is a UX call nobody has taken.

### D-11 — The carrier card's "N rate rules will stop applying" hint is out of scope.

[0036](0036-shipping-rate-rules-backend.md) **D-6** says 0037 *"may"* show it, framed as optional and
explicitly *"a UI hint, never a block"*. It is not built here: it costs a count per carrier for a
nicety the PRD never asks for, and — exactly as 0034 **D-9** argues for the overlap notice — every
line of it is a line a reviewer might later mistake for a blocking rule. **What this story does own
is the negative:** disabling a carrier that has rate rules must produce **no warning, no
confirmation and no data change**, and that has a test.

---

## Gherkin

Every scenario opens with a named business-role actor and carries a single `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3, and stays
out of DOM/column/status-code detail per rule 2.

```gherkin
Feature: The shipping carrier cards

  Scenario: The shipping screen lists the integrated carriers
    Given a shipping administrator
    When they open the shipping screen
    Then every integrated carrier is shown with its name, its short code and its tagline

  Scenario: Enable a carrier
    Given a shipping administrator, with the "MRW" carrier disabled
    When they enable the "MRW" carrier
    Then "MRW" is shown as active

  Scenario: Disable a carrier
    Given a shipping administrator, with the "MRW" carrier enabled
    When they disable the "MRW" carrier
    Then "MRW" is shown as inactive

  Scenario: A carrier's state survives leaving the screen
    Given a shipping administrator who has just disabled the "MRW" carrier
    When they reload the shipping screen
    Then "MRW" is still shown as inactive

  Scenario: Disabling a carrier that has rate rules asks for nothing and changes nothing
    Given a shipping administrator, with the carrier "SEUR" holding several rate rules
    When they disable "SEUR"
    Then it is disabled with no warning and no confirmation, and its rate rules are untouched

Feature: The grouped shipping rate table

  Scenario: Rate rules are listed under their own carrier
    Given a shipping administrator, with rate rules belonging to SEUR, MRW and Correos
    When they open the shipping screen
    Then each rate is shown under its own carrier

  Scenario: A rate row shows everything an administrator needs to recognise it
    Given a shipping administrator, with a SEUR "Península" rate covering 0–2 kg
      at 4,95 € with "24–48h" delivery
    When they open the shipping screen
    Then that row shows its name, its zone, its weight range, its price and its delivery estimate

  Scenario: A carrier with no rate rules is still shown
    Given a shipping administrator, with the carrier "DHL Express" holding no rate rule
    When they open the shipping screen
    Then "DHL Express" is still shown, with an empty state instead of a rate list

  Scenario: A disabled carrier's rate rules are still shown
    Given a shipping administrator, with rate rules belonging to the disabled carrier "MRW"
    When they open the shipping screen
    Then those rate rules are still listed under "MRW"

  Scenario: A rate with no maximum weight is shown as open-ended
    Given a shipping administrator, with a SEUR rate starting at 5 kg and no maximum weight
    When they open the shipping screen
    Then that row shows its weight range as "5 kg and above" rather than naming a maximum

  Scenario: A free shipping rate is shown as a price, not as a blank
    Given a shipping administrator, with a rate priced at 0,00 €
    When they open the shipping screen
    Then that row shows a price of 0,00 €

Feature: Creating and editing a shipping rate from the screen

  Scenario: Create a rate rule for a carrier
    Given a shipping administrator on the shipping screen, with the carrier "SEUR" active
      and the zone "Península"
    When they add a "Península" rate for SEUR covering 0–2 kg at 4,95 € with "24–48h" delivery
    Then the rate is shown under SEUR in the grouped rate table

  Scenario: Create a rate rule with no maximum weight
    Given a shipping administrator creating a shipping rate from 5 kg
    When they save it leaving the maximum weight empty
    Then the rate is accepted and shown as applying from 5 kg and above

  Scenario: Create a rate rule for a carrier that is currently disabled
    Given a shipping administrator on the shipping screen, with the carrier "MRW" disabled
    When they add a rate for "MRW"
    Then the rate is accepted and shown under "MRW"

  Scenario: A price typed with a decimal comma is accepted
    Given a shipping administrator creating a shipping rate
    When they type the price with a decimal comma and save
    Then the rate is accepted at the equivalent price

  Scenario: Edit a rate rule's price
    Given a shipping administrator, with a SEUR "Península" rate priced at 4,95 €
    When they change its price to 5,50 €
    Then the rate is shown priced at 5,50 €

  Scenario: Editing a rate rule keeps the rest of it intact
    Given a shipping administrator editing a SEUR rate that has no maximum weight
    When they change only its delivery estimate and save
    Then the rate still applies from its original minimum weight and above

  Scenario: Delete a rate rule
    Given a shipping administrator, with a SEUR "Península" rate
    When they confirm deleting that rate
    Then it is no longer shown in the rate table

  Scenario: Deleting a rate rule asks for confirmation first
    Given a shipping administrator, with a SEUR "Península" rate
    When they choose to delete that rate
    Then they are asked to confirm, and the rate is still listed until they do

  Scenario: An administrator can abandon a deletion
    Given a shipping administrator who has been asked to confirm deleting a rate
    When they cancel the confirmation
    Then the rate is still listed

  Scenario Outline: An invalid shipping rate is rejected
    Given a shipping administrator creating a shipping rate
    When they submit it with <invalid_field>
    Then the form reports the problem against that field, and no rate is created

    Examples:
      | invalid_field                             |
      | a minimum weight greater than the maximum |
      | a negative price                          |

  Scenario: A minimum weight equal to the maximum is accepted
    Given a shipping administrator creating a shipping rate
    When they submit it covering exactly 2 kg to 2 kg
    Then the rate is accepted

  Scenario: A free shipping rate is accepted
    Given a shipping administrator creating a shipping rate
    When they submit it priced at 0,00 €
    Then the rate is accepted

Feature: Choosing a zone for a shipping rate

  Scenario: The zone selector offers the zones an administrator has created
    Given a shipping administrator creating a shipping rate, with the zones
      "Península" and "Baleares" in the shipping zone catalog
    When they open the zone selector
    Then both zones are offered

  Scenario: A newly created zone becomes available to rate rules
    Given a shipping administrator who has just created the shipping zone "Zona Norte"
    When they open the zone selector on the shipping screen
    Then "Zona Norte" is offered

  Scenario: The rate modal offers a way to reach the shipping zone catalog
    Given a shipping administrator creating a shipping rate who needs a zone that does not exist
    When they look for a way to manage the shipping zone catalog
    Then the screen offers a route to it

Feature: Permissions on the shipping screen

  Scenario: A user without the shipping view permission cannot reach the screen
    Given a signed-in user who does not hold the "view shipping" permission
    When they request the shipping screen
    Then access is refused

  Scenario: A user without the shipping edit permission cannot toggle a carrier
    Given a signed-in user holding only the "view shipping" permission
    When they attempt to toggle a carrier
    Then the attempt is refused and the carrier keeps its previous state

  Scenario: A user without the shipping create permission cannot create a rate rule
    Given a signed-in user holding only the "view shipping" permission
    When they attempt to create a shipping rate
    Then the attempt is refused and no rate is created

  Scenario: A user without the shipping edit permission cannot change a rate rule
    Given a signed-in user holding only the "view shipping" permission
    When they attempt to change a shipping rate's price
    Then the attempt is refused and the rate keeps its price

  Scenario: A user without the shipping delete permission cannot delete a rate rule
    Given a signed-in user holding only the "view shipping" permission
    When they attempt to delete a shipping rate
    Then the attempt is refused and the rate still exists

  Scenario: Actions a user may not perform are offered as unavailable rather than failing on use
    Given a signed-in user holding only the "view shipping" permission
    When they open the shipping screen
    Then the carrier toggles and the rate actions are shown as unavailable

  Scenario: A Super Admin with no explicit shipping grant can manage rate rules
    Given a Super Admin holding no explicit shipping permission
    When they create a shipping rate
    Then the rate is created
```

## Files to create/modify

### Application

- `app/Livewire/Shipping/Index.php` — **MODIFY** (0035's file). The rate half is added to the
  carrier component 0035 shipped (**D-1**). `use ShippingRateValidationRules;` (0036's trait).

  ```php
  /** @var array<int, array{id: string, code: string, name: string, description: string|null, isActive: bool}> */
  public array $carriers = [];

  /**
   * @var array<int, array{
   *   carrierId: string, carrierCode: string, carrierName: string, carrierIsActive: bool,
   *   rates: array<int, array{id: string, name: string, zoneName: string, minWeightKg: string,
   *     maxWeightKg: string|null, price: string, deliveryEstimate: string}>
   * }>
   */
  public array $ratesByCarrier = [];

  public bool $showRateModal = false;

  #[Locked] public ?string $editingRateId = null;

  public string $rateName = '';

  /**
   * Bound to native form controls -- every one of these is a STRING with a real empty
   * value, never null. Livewire assigns a property's dehydrated value straight onto the
   * DOM element's .value, and a JS null stringifies to "null", desynchronising the
   * browser's own state. See docs/errors-log.md and D-2.
   */
  public string $shippingCarrierId = '';
  public string $shippingZoneId = '';
  public string $minWeightKg = '0';
  public string $price = '';
  public string $deliveryEstimate = '';

  /** '' is the "no maximum" sentinel -- normalised to null before validate(). See D-2. */
  public string $maxWeightKg = '';

  public bool $showDeleteRateModal = false;

  #[Locked] public ?string $deletingRateId = null;
  #[Locked] public string  $deletingRateName = '';
  ```

  Methods: `mount()`, `toggleCarrier()` (0035's, unchanged), `openCreateRateModal()`,
  `openEditRateModal(string $rateId)`, `saveRate(...)`, `closeRateModal()`,
  `confirmDeleteRate(string $rateId)`, `deleteRate(DeleteShippingRate $delete)`,
  `closeDeleteRateModal()`, `loadCarriers()`, `loadRates()`, plus `#[Computed]`
  `canEditShipping()` / `canCreateRate()` / `canDeleteRate()` (**D-6**), `carrierOptions()`
  (**D-4**) and `zoneOptions()` (**D-3**).

  Actions are injected **per method** as trailing container-resolved parameters, per
  [code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method).
  `openEditRateModal()` and `confirmDeleteRate()` populate from a freshly
  `ShippingRate::findOrFail()`-ed model, **never** by reading back out of the client-writable
  `$ratesByCarrier` array — the rule
  [livewire-authorization.md](../../docs/security/livewire-authorization.md) records for the Users
  delete modal. Authorization placement is **D-7**; the pre-`validate()` normalisation block is
  **D-2** and **D-5**.

- `resources/views/livewire/shipping.blade.php` — **MODIFY** (0035's placeholder). Header with the
  carrier/rate totals and a primary "New rate" button; the carrier cards (code badge, name,
  description, toggle, Activo/Inactivo `flux:badge`) **above** the rate table (**D-1**); one
  `flux:table` section per carrier including carriers with no rates; the create/edit rate
  `flux:modal` (name, carrier `flux:select`, zone `flux:select` with its link to the zone catalog,
  min/max weight and price as `type="text" inputmode="decimal"` per **D-5**, delivery estimate); the
  delete-confirmation `flux:modal` naming the target; and an explicit empty state when no rate
  exists at all. Every rendering rule and its trap is **D-8**.

- `resources/views/layouts/app/sidebar.blade.php` — **MODIFY.** One ungated `flux:sidebar.item` to
  `shipping.index`, with an **exact** `:current` route match (**D-10**).

- `lang/en/shipping.php` + `lang/es/shipping.php` — **MODIFY** (0035 creates them; 0033, 0036 and
  0034 also add groups). Add `carriers.*` and `rates.*` screen copy: headings, the "New rate"
  button, column labels, the open-ended weight string (**D-8**), the price/currency format, both
  empty states, the delete-confirmation copy, the row-action `aria-label`s, the "action not allowed"
  tooltip and the link to the zone catalog. Key-for-key identical, English source, per
  [naming.md](../../docs/conventions/naming.md#translation-keys).

  > **Five-way shared-file hazard.** `lang/en|es/shipping.php` is **created by 0035** and modified by
  > **0033**, **0036**, **0034** and **here**. Per
  > [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent
  > File-Ownership Rule these must never be implemented by concurrently-dispatched agents.
  > Sequential only. `resources/views/layouts/app/sidebar.blade.php` carries a second, smaller
  > hazard: **0034** adds a line to it and story **0013** will restructure it entirely.

### Not touched by this story

`routes/web.php` — 0035's `shipping.index` route already covers this screen and **no new route is
added** (**D-1**). No migration, no seeder, no model, no factory, no action, no policy, and **no new
permission** (`shipping.view|create|edit|delete` already exist in `RolePermissionSeeder::MODULES` ×
`ACTIONS`). `app/Models/ShippingCarrier.php`, `ShippingRate`, `ShippingZone`, every
`app/Actions/Shipping/` class, `ShippingRatePolicy`, `ShippingRateValidationRules` — all **read or
called, never edited**. `App\Livewire\Shipping\Zones` and
`resources/views/livewire/shipping/zones.blade.php` (0034). 0022's searchable multi-select is not
consumed at all (**D-3**).

## Tests to perform

Level chosen per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md): browser only
where the DOM/JS round-trip is itself the risk; everything else at the cheaper Livewire component
level. **Nothing here re-tests 0035's toggle action, 0036's validation/action/resolver semantics, or
0033's zone CRUD** — those have owners, and two owners for one fact means both go stale
independently.

### `tests/Feature/Shipping/CarrierCardsTest.php` — component level

- [ ] Every seeded carrier renders with its code, name and description.
- [ ] Toggling flips the rendered Activo/Inactivo state for **that** carrier only.
- [ ] The new state is read back after a **fresh mount** (a new `Livewire::test()` instance, not the
      same one) — guards a toggle that mutates only the in-memory property and never reloads.
- [ ] **Disabling a carrier that holds rate rules succeeds with no warning, and every rate row
      survives, asserted by exact id** (**D-11**, 0036 **D-6**).

### `tests/Feature/Shipping/RateListingTest.php` — component level

- [ ] Rates render under their own carrier, asserted by **exact carrier-id → rate-id identity**, not
      by count — a count assertion passes against an implementation that dumps every rate under one
      carrier.
- [ ] **A carrier with zero rates still renders as its own group** with an empty sub-state. Fails
      against a `$rates->groupBy('carrier_id')` built from a flat rate query, which silently drops
      empty carriers.
- [ ] **A disabled carrier's rates still appear.** Build the fixture in this order: create the rate,
      *then* disable the carrier, *then* render. Highest-value assertion in the file — it fails
      against `ShippingCarrier::where('is_active', true)->with('shippingRates')`, which reads as an
      entirely sensible "only show what's usable" refinement (**D-4**).
- [ ] An open-ended rate renders "and above" and **never** the substring `null` (**D-8**).
- [ ] A `0.00` rate renders as a real price, not as a blank — the PHP-truthiness trap
      (`@if ($rate['price'])`) that would make free shipping indistinguishable from unset.
- [ ] `price` asserted as a **string** (`toBe('4.95')`), never with a loose `==` against a float,
      which passes via coercion and masks 0036 **R-7**.
- [ ] `loadRates()` issues a bounded number of queries regardless of carrier/rate count
      (`DB::listen`) — the guard on `ListShippingRatesByCarrier`'s eager loading actually being used.
- [ ] The rate table's empty state renders when no rate exists at all.

### `tests/Feature/Shipping/RateEditorTest.php` — component level

- [ ] Creating a valid rate makes it appear under the chosen carrier, and the modal closes.
- [ ] **A rate can be created for a currently disabled carrier**, and the disabled carrier appears in
      `carrierOptions()` (**D-4**).
- [ ] `zoneOptions()` lists every zone by name, and a zone created after mount appears on a remount.
- [ ] 0036's `invalid_rate_attributes` dataset re-run **through `saveRate()`** rather than against
      the action. This is not duplication: the component's own job is to prove it does not
      pre-transform a value into something that passes a rule it should fail — see the `(float) ''`
      case in **D-2**.
- [ ] `min == max` accepted; `0` price accepted (both assert acceptance, so neither belongs in the
      rejection dataset).
- [ ] **The blank max-weight case, at component level**: `set('maxWeightKg', '')` → `saveRate()` →
      `assertDatabaseHas('shipping_rates', ['max_weight_kg' => null])`. Asserts the **row**, never
      the validation outcome — validation passing was never the risk (**D-2**).
- [ ] **A locale comma reaches the server and is normalised**: `set('price', '4,95')` → saved as
      `4.95`; and `'4,95'` is asserted **invalid** against `priceRules()` in isolation, pinning that
      the normalisation is the component's and not the rule's (**D-5**, 0017 **D12**).
- [ ] Editing only the delivery estimate leaves `max_weight_kg` `null` — the round-trip a fix that
      handles create-only would break.
- [ ] `openEditRateModal()` and `confirmDeleteRate()` populate from the model, not from
      `$ratesByCarrier`.
- [ ] `set('editingRateId', …)`, `set('deletingRateId', …)` and `set('deletingRateName', …)` each
      throw `CannotUpdateLockedPropertyException` — a regression-proof against a dropped `#[Locked]`.
- [ ] Deleting through the confirmation flow removes the rate; cancelling leaves it.

### `tests/Feature/Shipping/RateAuthorizationTest.php` — component level + HTTP level

- [ ] `GET route('shipping.index')` is refused (403) without `shipping.view` — **HTTP layer**. Owned
      jointly with 0035's carrier test; assert here only what this story adds, below.
- [ ] A `shipping.view`-only user gets **200** and sees the rate table with every create/edit/delete
      control and every carrier toggle rendered **disabled** — the new surface.
- [ ] `saveRate()` (create branch), `saveRate()` (edit branch) and `deleteRate()` each refused via
      `Livewire::test()` for a user lacking `shipping.create` / `shipping.edit` / `shipping.delete`,
      **with the data unchanged afterwards** — **component layer**. Separate from the HTTP test on
      purpose: per
      [livewire-authorization.md](../../docs/security/livewire-authorization.md), the two cover
      different entry points and neither substitutes for the other.
- [ ] `toggleCarrier()` refused without `shipping.edit`, carrier state unchanged.
- [ ] A Super Admin holding **no** explicit `shipping.*` grant passes every path. 0036's own policy
      test already proves the *policy* bypasses correctly; **this test is what proves the component
      actually calls `Gate::authorize()` with the right ability and target** — and it is the first
      thing anywhere that can catch a mis-bound `ShippingRatePolicy` (**D-7**, 0036 **D-11**).
- [ ] Row actions render **both** branches — disabled for a view-only user, enabled for a fully
      permitted one — since the disabled branch is separate markup that can rot independently.
- [ ] `beforeEach` calls `app(PermissionRegistrar::class)->forgetCachedPermissions()` **then**
      `$this->seed(RolePermissionSeeder::class)`, never flushing between Act and Assert, and asserts
      against the seeded catalog rather than fabricating `Permission` rows.

### `tests/Browser/Shipping/ShippingTest.php` — real browser

Three tests, each justified individually rather than by "browser is more thorough".

- [ ] **Create an open-ended rate by really clearing the max-weight field** — fill every other field,
      clear max-weight with real keystrokes, save, reload, assert the persisted row is `null` (not
      `0`, not `''`); then reopen it in edit mode and assert the field renders **genuinely blank**.
      *Justification:* the component-level equivalent cannot reach the DOM at all, and this story's
      whole **D-2** risk lives in what a real blank input transmits. **Highest-severity test in the
      story.**
- [ ] **Pick a carrier and a zone from the real selects**, save, and assert the rate persists under
      the **chosen** option — not the first one in the list. *Justification:* this is verbatim the
      errors-log `null`-`<select>` bug class, whose failure mode is a *missing* `change` event that
      `set()` structurally cannot reproduce. It is the executable proof of **D-2**'s
      never-null-sentinel rule.
- [ ] **The full click-driven journey** — create a rate, edit it, delete it through the confirmation
      modal, cancel a delete once, and toggle a carrier. *Justification:* exercises the acceptance
      criteria end-to-end and carries `->assertNoJavaScriptErrors()` across all three modals in one
      browser boot rather than paying that cost three times.
- [ ] `->assertNoJavaScriptErrors()` in **every** browser test — mandatory per
      [test-quality-checklist.md](../../docs/testing/frontend/test-quality-checklist.md).

### One arch-test line

- [ ] `expect(App\Livewire\Shipping\Index::class)->not->toUse(ResolveApplicableShippingRate::class)`
      (**D-9**). One line in the existing arch test file, not a dedicated file.

### Not worth writing

- **0035's** `ToggleShippingCarrier` semantics (no-op on repeat, no outbound HTTP, seeder
  idempotency).
- **0036's** action validation correctness, `ListShippingRatesByCarrier`'s own N+1 bound,
  `DeleteShippingZone`'s count guard and `23000` handling, the resolver's precedence algorithm, and
  `ShippingRatePolicy`'s ability grants via direct `Gate::forUser()`.
- **0033/0034's** zone CRUD and duplicate-name normalisation — this story does not touch
  `/shipping/zones`.
- **0022's** picker mechanics — not consumed at all (**D-3**).
- **Dark-mode visual regression.** Nothing in §2.4 makes visual correctness the requirement.

### Traps — what a naive plan here walks into

- **Proving the blank max-weight or the two selects with `Livewire::test()->set()` alone.** Both are
  direct instances of the documented failure mode; a plan that tests them only at component level
  reports green against a broken screen. The component-level assertions above are regression guards,
  **not** the proof.
- **Filtering the listing by `is_active`** because a screen about active carriers "obviously" should.
  The fixture must attach the rate *before* disabling the carrier, or the test passes vacuously.
- **Asserting `price` with `==`**, which masks the string cast (0036 **R-7** ← 0024 **R-4**).
- **Asserting grouping by count** rather than by exact identity.
- **Testing the create direction of the blank-max-weight rule and never the edit round-trip** — a fix
  that maps `'' → null` on create but re-renders `null` as `"0"` on edit is invisible without it.
- **Reaching for a `ShippingCarrierPolicy`** — it does not exist and 0035 explicitly decided against
  one. The carrier toggle gates on the bare `shipping.edit` string.
- **Assuming the CI result is the production result.** CI runs SQLite; a raw `''` in a `DECIMAL`
  column is silently accepted there and a 500 on MySQL (**D-2**, finding 3). Any assertion about a
  numeric column's *stored* value must be an exact `null`/value check, never "the save succeeded".

## Expected outcome

`/shipping` is a real screen. Carrier cards show each integrated carrier's code, name and tagline
with a toggle and an Activo/Inactivo badge whose state persists across reloads, and disabling a
carrier that holds rate rules does so silently and destroys nothing. Below them, every carrier gets
its own section of the rate table — including carriers with no rates and carriers that are disabled
— with each row showing the rate's name, its zone badge, its weight range (rendered "5 kg and above"
when open-ended), its price in euros (`0,00 €` included) and its delivery estimate. A "New rate"
button opens a modal that creates a rate against any carrier, enabled or not, and any zone in the
catalog, accepting a Spanish decimal comma and a genuinely empty maximum weight — which persists as
`NULL` and reopens blank. Invalid rates are refused with inline field messages rather than a 500.
Deleting asks for confirmation and names the target. Every mutating method re-authorizes against
`ShippingRatePolicy`, which finally has a caller, and every control the acting user may not use is
rendered unavailable rather than failing on click. The rate resolver is nowhere on the screen.

## Acceptance criteria

- [ ] Carriers are enabled and disabled from the screen and show an active/inactive state
      *(PRD §2.4 AC 1, UI half)*.
- [ ] Rate rules are **created, edited and deleted** from the screen with zone, weight range,
      price (€) and delivery estimate, and are **shown grouped by carrier as in the prototype**
      *(PRD §2.4 AC 2)*.
- [ ] A **carrier with no rate rules** still appears as its own group, and a **disabled carrier's
      rates are still listed** (**D-4**; 0036 **D-6**).
- [ ] Min ≤ max weight and a non-negative price are validated as **inline field messages**, with
      `min == max` and `0,00 €` both accepted *(PRD §2.4 AC 3)*.
- [ ] **A blank maximum weight persists as `NULL`** — never `0`, never `''` — proven through the real
      DOM and not only through `set()`, and it reopens blank on edit (**D-2**).
- [ ] An open-ended bracket renders as "N kg and above", never "N–null" (**D-8**; 0036's hand-off).
- [ ] Weight and price inputs are `type="text" inputmode="decimal"`, and a value typed with a decimal
      comma reaches the server with its comma intact and is normalised in the component (**D-5**).
- [ ] The zone select is a **plain bounded dropdown** over the existing zone catalog, not 0022's
      searchable component, and the screen offers a route to the zone catalog (**D-3**, **D-10**).
- [ ] The carrier select lists **every** carrier, disabled included (**D-4**).
- [ ] `mount()` and **every** mutating method re-authorize as their first statement, against
      `ShippingRatePolicy` for rate operations and the bare `shipping.edit` string for the carrier
      toggle — discharging 0036's zero-call-site hand-off (**D-7**).
- [ ] `$editingRateId`, `$deletingRateId` and `$deletingRateName` are `#[Locked]`, and the edit and
      delete targets are re-read from the database rather than from the rendered array.
- [ ] **No property bound to a form control is ever `null`** (**D-2**).
- [ ] Every id interpolated into a `wire:*` argument goes through `@js()` (**D-8**).
- [ ] Row actions the acting user may not perform render **disabled**, with the `data-test` hook on
      **both** branches, the tooltip written as an explicit wrapper, and `cursor-not-allowed!` on
      that wrapper rather than on the button (**D-8**).
- [ ] Only one "Cancel" control is ever in the DOM (**D-8**).
- [ ] `ResolveApplicableShippingRate` is not referenced anywhere on this screen (**D-9**).
- [ ] No route, migration, model, action, policy or permission is added, and nothing owned by 0022,
      0032, 0033, 0034, 0035 or 0036 is modified.
- [ ] All copy is English source through `__()` in `lang/en/shipping.php`, mirrored key-for-key in
      `lang/es/shipping.php`; no hardcoded literals.
- [ ] The screen renders correctly in light and dark mode and produces **no JavaScript console
      errors**.

## Definition of Done

- [ ] Tests written and green, plus the **full** suite
      ([contracts.md](../../docs/contracts.md#full-test-suite-gate-rule)'s Full Test Suite Gate Rule).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Expected focus: that `$ratesByCarrier` and every
      unlocked form property are client-writable by construction, so their only defence is the
      re-read-from-database discipline plus 0036's server-side validation.
- [ ] Documentation updated (docs-keeper) — [`docs/api/routes.md`](../../docs/api/routes.md) (what
      `shipping.index` now renders, its `data-test` selectors, and the sidebar link), and
      [`docs/errors-log.md`](../../docs/errors-log.md) **with the D-2 finding**: Livewire's
      `skipRequestPayloadTamperingMiddleware()` opt-out, Laravel's non-implicit-rule skip for a blank
      string, and the resulting SQLite-green / MySQL-500 divergence. That combination is a durable,
      project-wide trap, not a story detail.
- [ ] **0036's four-part hand-off discharged**, each verifiable: (a) `Gate::authorize()` before every
      rate action (**D-7**); (b) the `shippingZoneId` error-bag binding — see **OQ-A** for what that
      item actually means; (c) an open-ended bracket rendered "N kg and above" (**D-8**); (d) the
      rate id feeding any `Rule::exists`/`ignore()` kept server-authoritative via `#[Locked]` plus a
      re-read.
- [ ] **0036's `maxWeightRules()` comment corrected** — it states a mechanism that does not hold
      (**D-2**). A comment change in 0036's file, not a rule change.
- [ ] Acceptance criteria met.

## Dependencies, risks, open questions

### Dependencies

- **0035 — carriers.** Hard: the route, `App\Livewire\Shipping\Index`,
  `resources/views/livewire/shipping.blade.php`, `ShippingCarrier`, `ToggleShippingCarrier`,
  `lang/en|es/shipping.php`. This story modifies the first three.
- **0036 — rate rules.** Hard: `ShippingRate`, the three rate actions,
  `ShippingRateValidationRules`, `ShippingRatePolicy`, `ListShippingRatesByCarrier`.
- **0033 — zones.** Soft: `ShippingZone`, read for one dropdown.
- **0034 — zones UI.** Soft: only the `shipping.zones.index` route name, for the link in **D-10**.
- **0002 — seeded permission catalog.** `shipping.*` already exists; nothing to add.
- **Sequential only.** Five stories write `lang/en|es/shipping.php` and two write the sidebar; per
  [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule) none may be implemented
  concurrently.

### Risks

- **R-1 — the blank max-weight bug ships green.** The whole of **D-2**. It passes validation, passes
  on SQLite, and 500s on MySQL — or, worse, silently saves a closed `[0, 0]` bracket that looks
  correct. Highest-severity risk in the story; guarded by the paired component + browser assertions
  on the **exact** stored `null`.
- **R-2 — the listing filtered by `is_active`.** Reads as a sensible refinement and hides a disabled
  carrier's entire rate configuration (**D-4**). 0036 names this the likeliest cross-wiring in the
  shipping set.
- **R-3 — `price` treated as a float.** `@property string $price` reads as obviously wrong to someone
  who has not read 0024 **R-4**, and `@if ($rate['price'])` renders a legal free-shipping rate as
  though it were unset.
- **R-4 — `type="number"` sneaking into a weight or price field**, defeating **D-5** silently and
  invisibly to every `set()`-based test. Exactly the risk
  [0018](done/0018-sales-region-tax-configuration-ui.md) records for its own rate field.
- **R-5 — the sidebar `:current` wildcard.** A `shipping.*` match would highlight this item on
  0034's zones screen and vice versa (**D-10**).
- **R-6 — two stories land in the sidebar and the locale files.** 0034 and 0037 both add to both, and
  neither depends on the other, so whichever lands second must merge rather than overwrite.

### Open questions

None blocking — the story is implementable as written. Four items are genuinely open UX/contract
calls, each cheap to reverse, each with a recommendation:

- **OQ-A — 0036's Definition-of-Done hand-off item (b) appears misattributed.** It reads *"0037 must
  … bind its **delete-modal** `@error` to the **`shippingZoneId`** error-bag key."* But
  `shippingZoneId` is the key **`DeleteShippingZone`**'s in-use guard raises (0036 **D-5**), and that
  fires when deleting a **zone** — a flow owned entirely by 0034's screen. `DeleteShippingRate` has
  no zone guard at all. The reading that makes sense here is the **rate form's zone field**: bind
  `@error('shippingZoneId')` on the create/edit modal's zone select, catching
  `shippingZoneIdRules()`'s failure ("a shipping zone that does not exist", from 0036's own invalid
  dataset). **(recommended)** — adopt the field-level reading, and correct 0036's DoD wording so the
  next reader does not build toward the literal instruction. The alternative, treating it as an
  obligation on this story's *rate*-delete modal, would mean binding an error key nothing can ever
  raise there.
- **OQ-B — how a disabled carrier is distinguished in the carrier select.** **(recommended)** — an
  inline suffix, e.g. `MRW (Inactivo)`, from a translation key. Without it an administrator can
  create a rate for a carrier that will never quote and get no signal at all. The alternatives
  (nothing; a separate option group) are a one-line change either way.
- **OQ-C — where the link to the zone catalog sits.** **(recommended)** — a small secondary link
  directly beside the rate modal's zone select, which is the moment the need arises. The alternative
  (screen header only) costs the administrator their half-filled form.
- **OQ-D — should `ShippingRatePolicy::update()`/`delete()` gain a nullable target** so the
  screen-level capability flags can go through the policy uniformly instead of the bare permission
  string (**D-7**)? **(recommended)** — leave it as shipped and use the permission string for the UI
  hint, because changing it means editing a file 0036 owns for a purely cosmetic check whose real
  enforcement is the per-mutation policy call. Worth 0036's Phase 2 reviewers weighing in.

Two further items were raised and **decided rather than deferred**, recorded so they are not
relitigated:

- **Reassigning a rate to a different carrier on edit is allowed**, moving it between groups.
  `UpdateShippingRate::__invoke(ShippingRate $rate, array $attributes)` imposes no restriction, and
  the zone-delete guard's own error message instructs administrators to reassign rates — so
  reassignment must work. No extra confirmation: it is an edit like any other, and it is reversible.
- **The decimal-input format is not open** — [0018](done/0018-sales-region-tax-configuration-ui.md) **D1**
  and [0017](done/0017-sales-region-tax-configuration-backend.md) **D12** already settled it project-wide
  (**D-5**).

## Provenance

Phase 1 Three Amigos debate, 2026-08-18: `product-owner` + `frontend-expert` + `frontend-qa`, per
[`docs/workflow.md`](../../docs/workflow.md#phase-1--three-amigos-debate)'s classification rule
(frontend; no schema change, so no `database-expert`). Both amigos were convened live and both
materially changed this document.

Three notes on how this debate ran, recorded for honesty:

- **The brief's premise about `groupedByCarrier()` was wrong, and the correction matters.** The
  handed brief describes "story 0036's `groupedByCarrier()` query". No such method exists anywhere in
  0036 or in the repo. The grouped query 0036 actually ships is the action
  `app/Actions/Shipping/ListShippingRatesByCarrier.php`, whose PHPDoc carries the array shape this
  story binds to — and whose *carriers-first* construction (rather than a `groupBy()` over a flat
  rate list) is precisely what makes a zero-rate carrier still render. Building against the
  brief's name would have produced the empty-group bug 0036 wrote a test to prevent.
- **The brief's characterisation of the `gte:min_weight_kg` risk was also inexact, and verification
  inverted the conclusion.** The brief describes 0036 as having flagged the blank-field question for
  empirical verification. 0036 flags the `nullable`/`gte` **ordering** (its own **R-1** is about the
  null-aware bracket *query*, not the form), and its `maxWeightRules()` comment asserts a
  short-circuit mechanism that does not hold. Nothing upstream raised what a Livewire form actually
  submits. Verification against installed vendor source found the real behaviour is **not** the
  predicted rejection but a **silent pass** that puts `''` into a `DECIMAL` column — green on CI's
  SQLite, a 500 on production MySQL. `frontend-expert` found the `presentOrRuleIsImplicit()` half;
  `product-owner` found the Livewire `skipRequestPayloadTamperingMiddleware()` half and the
  CI-engine divergence; `frontend-qa` independently reached the same "component-level `set()` cannot
  prove this" conclusion from the errors-log precedent. All three are recorded in **D-2** with file
  and line references, because this is the kind of claim that must not be taken on trust.
- **`frontend-qa` raised the decimal-input format as a blocking ambiguity; it was resolved from
  precedent rather than escalated.** [0018](done/0018-sales-region-tax-configuration-ui.md) **D1** and
  [0017](done/0017-sales-region-tax-configuration-backend.md) **D12** had already settled it for the tax
  field. It is recorded here as **D-5** rather than as an open question, which is what the
  [Uncertainty Handling Rule](../../docs/contracts.md#uncertainty-handling-rule) asks for: ask only
  where the answer genuinely is not already in the repo.
