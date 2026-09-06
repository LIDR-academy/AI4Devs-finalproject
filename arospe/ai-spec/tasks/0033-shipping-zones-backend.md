# [0033] Shipping zones — backend (admin CRUD + zone↔geography membership)

## Description
Build the admin-editable **shipping zone** catalog: a `shipping_zones` table (UUID v7 PK) with
create / rename / delete domain actions, plus the **zone↔geography membership** pivot that lets a
zone bundle one or more entries from the seeded geography catalog **at any level** — country,
comunidad autónoma, or municipio. This is the data and domain layer only: no route, no Livewire
component, no Blade view, no picker. It is the story that turns
[PRD §2.4](../../docs/PRD/PRD.md#24-shipping)'s confirmed divergence — zones are admin-created and
fully editable, not a fixed list of badges — into schema and behaviour.

## Type
backend | related_task_id: **0034** (paired UI — see OQ-C, its exact scope is not settled) |
includes database-expert: **yes**

**PRD coverage.** [§2.4 Shipping](../../docs/PRD/PRD.md#24-shipping), rewritten 2026-08-17. This
story owns these scenarios from its `Feature: Shipping zones (extends the prototype)` block:
*Create a shipping zone*, *Rename a shipping zone*, *Delete a shipping zone no rate rule
references* (the delete half — see the table in **Tests to perform**), the *Assign geography
entries to a zone at any level* `Scenario Outline`, the backend half of *The geography catalog does
not allow inventing new entries*, and *Creating a shipping zone leaves the Sales Region catalog
untouched*. It resolves — and closes — the PRD's two `pending Phase 1 confirmation` items; see
**Documented functional decisions**.

It does **not** own: the picker's search/filter/empty-state scenarios (0022 + 0034), carriers
(0035, written), or rate rules (0036).

**Boundaries with the sibling Epic 2 stories**, referenced and never redefined here:

- **0032 — shipping geography catalog seed**
  ([`0032-shipping-geography-catalog-seed.md`](done/0032-shipping-geography-catalog-seed.md)). Owns
  `geography_entries` entirely: its **bigint** PK (the one confirmed exception to the UUIDv7
  policy), the `level` discriminator, the self-referencing `parent_id`, the model, the factory,
  the CSV fixtures and the seeder. **This story adds nothing to it and changes nothing in it.**
- **0035 — shipping carriers** ([`0035-shipping-carriers-backend.md`](0035-shipping-carriers-backend.md)).
  Owns `/shipping`, `App\Livewire\Shipping\Index`, `resources/views/livewire/shipping.blade.php`,
  `app/Actions/Shipping/ToggleShippingCarrier.php`, and **creates** `lang/en|es/shipping.php`.
- **0036 — rate rules.** Owns `shipping_rates`, its `foreignUuid('shipping_zone_id')`, the FK's
  `onDelete`, and the **in-use delete guard this story hands off** (D-1).
- **0022 / 0034 — the searchable multi-select and its geography resolver.** Own the picker.

## Gherkin
```gherkin
Feature: Shipping zones

  Scenario: Create a shipping zone
    Given a shipping administrator
    When they create a shipping zone named "Zona Norte"
    Then "Zona Norte" exists in the shipping zone catalog

  Scenario: A zone is created without any geography coverage
    Given a shipping administrator
    When they create a shipping zone named "Zona Norte"
    Then the zone covers no geography catalog entry until entries are assigned to it

  Scenario: Rename a shipping zone
    Given a shipping administrator, with a shipping zone "Zona Norte"
    When they rename it to "Cornisa Cantábrica"
    Then the zone is known by its new name everywhere it is used

  Scenario: A zone may be saved under its own unchanged name
    Given a shipping administrator, with a shipping zone "Zona Norte"
    When they save it again under the name "Zona Norte"
    Then the change is accepted and the zone is unchanged

  Scenario: Two zones may not share a name
    Given a shipping administrator, with an existing shipping zone "Zona Norte"
    When they create a second shipping zone named "Zona Norte"
    Then the second zone is rejected with a validation message

  Scenario Outline: A name that differs only by case or accent is treated as the same name
    Given a shipping administrator, with an existing shipping zone "Península"
    When they create a second shipping zone named <name>
    Then the second zone is rejected with a validation message

    Examples:
      | name         |
      | "península"  |
      | "PENÍNSULA"  |
      | "Peninsula"  |

  Scenario: A blank zone name is rejected
    Given a shipping administrator
    When they create a shipping zone whose name is only whitespace
    Then the zone is rejected with a validation message

  Scenario Outline: Assign geography entries to a zone at any level
    Given a shipping administrator editing the shipping zone "Zona Norte",
      with the geography catalog seeded
    When they add <entry> to the zone
    Then the zone covers <entry>

    Examples:
      | entry                                        |
      | the country "Francia"                        |
      | the autonomous community "Galicia"           |
      | the municipios "Gijón", "Avilés" and "Siero" |

  Scenario: A single zone may mix geography levels
    Given a shipping administrator editing the shipping zone "Zona Norte",
      with the geography catalog seeded
    When they add the country "Francia", the community "Galicia" and the municipio "Gijón"
    Then the zone covers all three, at their own levels

  Scenario: Coverage is exactly what was assigned, never expanded
    Given a shipping administrator editing the shipping zone "Zona Norte"
    When they add the country "España" to the zone
    Then the zone covers the country "España" and nothing else
    And no comunidad autónoma or municipio is added to the zone on its behalf

  Scenario: Reassigning a zone's geography replaces its coverage
    Given a shipping administrator editing the shipping zone "Zona Norte",
      which covers the municipios "Gijón" and "Avilés"
    When they save the zone covering "Avilés" and "Siero"
    Then the zone covers exactly "Avilés" and "Siero"

  Scenario: A zone's geography coverage may be emptied
    Given a shipping administrator editing the shipping zone "Zona Norte", which covers "Gijón"
    When they save the zone covering no geography entry
    Then the zone covers nothing, and the zone itself still exists

  Scenario: Two zones may cover the same municipio
    Given a shipping administrator, with the shipping zone "Asturias Centro" covering "Gijón"
    When they add "Gijón" to the shipping zone "Zona Norte" as well
    Then both zones cover "Gijón"

  Scenario: The geography catalog does not allow inventing new entries
    Given a shipping administrator editing a shipping zone
    When they try to add a geography entry the seeded catalog does not contain
    Then the attempt is rejected, and no new catalog entry is created

  Scenario: Delete a shipping zone no rate rule references
    Given a shipping administrator, with a shipping zone "Zona Norte" referenced by no rate rule
    When they delete "Zona Norte"
    Then it no longer exists in the shipping zone catalog

  Scenario: Deleting a zone releases its name for reuse
    Given a shipping administrator who has deleted the shipping zone "Zona Norte"
    When they create a new shipping zone named "Zona Norte"
    Then the new zone is accepted

  Scenario: Deleting a zone discards its coverage but never the catalog
    Given a shipping administrator, with the shipping zone "Zona Norte" covering "Gijón"
    When they delete "Zona Norte"
    Then the zone covers nothing because it no longer exists
    And "Gijón" remains in the geography catalog, unchanged

  Scenario: Deleting a zone leaves another zone's coverage intact
    Given a shipping administrator, with the zones "Zona Norte" and "Asturias Centro"
      both covering "Gijón"
    When they delete "Zona Norte"
    Then "Asturias Centro" still covers "Gijón"

  Scenario: A user without the shipping create permission cannot create a zone
    Given a signed-in user who does not hold the "create shipping" permission
    When they attempt to create a shipping zone
    Then the attempt is refused and no zone is created

  Scenario: A user without the shipping edit permission cannot change a zone
    Given a signed-in user who does not hold the "edit shipping" permission
    When they attempt to rename a shipping zone
    Then the attempt is refused and the zone keeps its name

  Scenario: A user without the shipping delete permission cannot delete a zone
    Given a signed-in user who does not hold the "delete shipping" permission
    When they attempt to delete a shipping zone
    Then the attempt is refused and the zone still exists

  Scenario: Creating a shipping zone leaves the Sales Region catalog untouched
    Given a shipping administrator, with the Sales Region (fiscal) catalog seeded
    When they create the shipping zone "Zona Norte"
    Then no Sales Region entry, rate, or default flag is changed
```

> **One scenario the PRD carries that this story deliberately does not.** *"Deleting a shipping zone
> still referenced by a rate rule is hard-blocked with a count"* is **confirmed as a functional
> decision** (D-1) but is **not implementable here**: `shipping_rates` does not exist until story
> 0036, so no zone can be in use and there is nothing to count. It is handed off to 0036 exactly as
> [0023](done/0023-product-categories-backend.md) handed the identical product-category guard to 0024
> (its decision **D-10**). See D-1 for what this story pre-shapes so the hand-off is a one-file
> extension rather than a new rule in a new place.

## Documented functional decisions

The two decisions the PRD explicitly left open are **D-1** and **D-2**. Both are now **closed**;
neither is to be reopened in Phase 2 or Phase 3 except on new evidence.

---

### D-1 — Deleting a zone a rate rule still references is **hard-blocked with a count**. CONFIRMED.

The PRD's tentative recommendation is **accepted as written**: deletion is *always* refused (no
confirm-and-proceed path), the message states how many rate rules reference the zone, and the
administrator must reassign those rules' zone before the zone can be deleted.

**Why hard-block, and why the alternatives lose.** The PRD named one alternative — *blocking only
until the affected rate rules are reassigned through a guided flow*. That is not really a different
deletion rule; it is a **hard block plus a convenience feature layered on top of it**. That
asymmetry decides it: shipping the hard block now leaves the guided reassignment flow available as
a later additive story, whereas shipping the softer rule first and tightening it later is a
behavioural regression for anyone who relied on it. Two rules genuinely rejected:

- **Cascade** (delete the zone, delete its rate rules) silently destroys pricing configuration —
  the strongest possible version of the exact outcome the acceptance criterion forbids.
- **Null out** (`nullOnDelete`) leaves a rate rule with no zone, which at checkout matches either
  everything or nothing. That is a pricing bug wearing a nullable column, and it would surface in
  Epic 3 as wrong money rather than as an error.

**Consistency**: this is the same rule [0023/0024](done/0023-product-categories-backend.md) apply to
product categories, so the panel answers "you cannot delete something that is in use" the same way
in two modules. That mattered enough to the PRD to be named as the model; it is honoured.

**Two layers, and the second one is not optional.** The application-layer count guard is a
**pre-flight check, not a race guard** — admin A opens the confirmation while admin B creates a
rate for that zone; A's count read zero; A deletes; B's rate is orphaned. That is the same class of
gap [`signed-link-verification.md`](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
already documents. So:

- **Application layer (0036):** count the referencing rate rules and refuse with a `:count`-bearing
  `ValidationException`.
- **Database layer (0036):** `foreignUuid('shipping_zone_id')->constrained()->restrictOnDelete()`
  on `shipping_rates`, which makes the block a database invariant and closes the race.
- **Consequence 0036 must implement knowingly:** `restrict` surfaces as `QueryException` code
  `23000`, so the losing side of that race must be caught and re-rendered as the *same* human
  message the count guard produces — never a 500. This is the repo's established two-layer shape
  (`Rule::unique()` + `UNIQUE` index + `23000` catch in
  [`App\Actions\Users\CreateUser`](../../app/Actions/Users/CreateUser.php)).

**The guard belongs in the action, never in the policy.** Two independent reasons, the second
decisive:

1. It is a **data precondition**, not an authorization rule. In the policy it would produce a 403
   `AuthorizationException`; the PRD requires a message stating *how many* rate rules reference the
   zone, which is a `ValidationException` with a placeholder. (Contrast
   [`UserPolicy::delete()`](../../app/Policies/UserPolicy.php)'s trashed-target refusal, which
   genuinely *is* an authorization rule — nobody may ever delete a trashed user.)
2. **A policy-level rule is reachable by the Super Admin `Gate::before` bypass**
   ([authorization.md](../../docs/architecture/authorization.md)). Putting the block in the policy
   would let a Super Admin punch straight through it and destroy rate rules — the precise outcome
   this decision exists to prevent. That alone settles it.

**What this story pre-shapes** (cheap, and it is what makes 0036 a one-file change):

- `app/Actions/Shipping/DeleteShippingZone.php` exists **now** as its own file, body a plain
  instance `->delete()`, **specifically so 0036 extends this one file** rather than introducing the
  rule somewhere new — the `DeleteProductCategory` (0023 D-10) and `UserPolicy::delete()` (0005)
  precedents.
- That delete is wrapped in `DB::transaction()` **today**, even though it is a single statement,
  because 0036's guard must count-and-delete atomically and adding the transaction later is exactly
  the diff a reviewer waves through.
- The action returns `bool`, so 0036 can change the *refusal* mechanism without changing the
  success signature.

**What this story must NOT pre-shape:** no `shippingRates()` relation stub, no `rates_count`
accessor or column, and **no `zones.delete_blocked` translation key** — a `:count` string whose
wording no product owner has approved is dead copy in two locales. 0036 adds the key alongside the
rule that emits it.

**Obligations recorded on 0036** (write these into its task file when it is debated):
un-skip this story's named delete stub; catch `23000` and convert it; and assert the count is
**correct for at least two different reference counts**, since a guard that always says "used by 1
shipping rate" passes a single-fixture test.

---

### D-2 — Overlapping zones are **allowed**. CONFIRMED.

Two zones may both cover the same municipio. No constraint, no validation rule, and no picker
filter prevents it. Rate precedence on overlap is **deferred** — see the ownership note below.

**Why allow it.** Three reasons, in increasing force:

1. **It is a legitimate configuration, not a data-entry accident.** "Península" (broad, 4,95 €)
   alongside "Madrid capital" (narrow, express premium) is exactly how Spanish carriers quote.
   Forbidding overlap forbids the product.
2. **The rule most people actually want — "most specific wins" — *requires* overlap to exist.**
   Enforcing non-overlap and then wanting tiered rates are contradictory goals.
3. **At the pivot level, enforcement is not merely expensive; for the case that matters it is
   impossible.** See below.

**Implicit overlap is undetectable, and that is the part that must be written down rather than
discovered in Epic 3.** Zone A holds the **country** row "España"; zone B holds the **municipio**
row "Gijón". No pivot row is shared, the two `geography_entry_id`s differ, and nothing at the
schema level distinguishes this from a genuinely disjoint pair — zone A covers Gijón by *ancestry*,
not by membership. Detecting it requires expanding every member of every zone to its transitive
descendant set (a country expands to ~8,100 rows) and intersecting — a `WITH RECURSIVE` **query**,
never a constraint. `CHECK` constraints cannot reference other rows, and there is no
exclusion-constraint equivalent on MySQL.

Three consequences recorded now:

- **Any future non-overlap rule is necessarily application-layer, and therefore is not a race
  guard.** Two administrators saving concurrently can both pass a pre-flight overlap check and both
  commit — the same shape as D-1's race, but with **no index that can have the last word**. Whoever
  introduces such a rule must reach for a lock or a serialised write path, and must say so.
- **Epic 3's precedence rule does double duty**: it must resolve *explicit* overlap (two zones both
  listing Gijón) and *implicit* overlap (España vs Gijón) with one tiebreak, which means computing
  specificity from `level` plus the parent chain.
- **A cheap mitigation exists and is explicitly not a constraint**: the zone editor may show an
  informational notice — *"Gijón is already covered by Zona Norte"* — computed on save. That is a
  **UI hint**, structurally the same as the per-row `Gate::allows()` hints in
  [`App\Livewire\Users\Index`](../../app/Livewire/Users/Index.php)
  ([authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)):
  helpful, never a validation failure. Named here so nobody builds it as a blocking rule.

**Where precedence is owned — a correction to the brief this story was given.** The instruction was
to defer precedence to *Epic 3 Orders*. `backend-expert` and `database-expert` independently
objected, and they are right: *"when two zones both cover the destination, which rate applies"* is
a **rate-selection** rule, and rate rules are story **0036**. Deferring it to "Epic 3" hands it to
an epic boundary, where it belongs to nobody. **Resolved: 0036 owns the rule; Epic 3 Orders is its
consumer** and the place it is first exercised against a real destination address. Recommended
default for 0036 to debate, not decided here: most-specific-wins by catalog level (municipio >
comunidad autónoma > país) with a deterministic tiebreak (lowest price, then oldest `created_at`),
so two same-level matches never depend on row order.

**Schema consequences — one constraint that must exist, one that must never.**

- **Must exist:** `UNIQUE(shipping_zone_id, geography_entry_id)`, delivered free by the pivot's
  composite primary key. The same entry twice in the *same* zone is meaningless and is a database
  invariant, not a `sync()`-behaviour accident (`sync()` de-duplicates its own input, but
  `attach()` does not, and 0036 or a future import is a second call site).
- **Must never exist:** any unique on `geography_entry_id` alone. It is the schema shape of "an
  entry belongs to at most one zone globally" — it would silently invert this decision, and it
  would do so *incompletely*, catching only explicit overlap while missing every implicit case. The
  worst of both: a real product restriction plus a false sense of enforcement. **The migration
  carries a comment saying so**, because it is exactly the change a well-meaning reviewer proposes
  as a data-integrity improvement.

---

### D-3 — Membership is **literal, not transitive**.

Assigning the country "España" to a zone creates **one** pivot row. It is not expanded into 17
comunidades or ~8,100 municipios, and nothing in this story interprets the country row as
"containing" a municipio. This is stated because it is currently implicit, it is invisible in the
schema, and it fails by someone *adding* helpful behaviour — which no absence-of-code review
catches. Epic 3 will need the opposite (transitive resolution at order time); recording the
boundary now stops half of it being implemented here. It has a test.

### D-4 — Assignment uses **replace (`sync`) semantics**, in one action.

Saving a zone's geography submits **the full set**. `SyncShippingZoneGeography` replaces the zone's
membership with exactly the ids given; an empty array detaches everything. Append-only semantics
were rejected because the consumer is a multi-select whose submit is "here is the current
selection" — appending makes deselection impossible and forces a second "remove" action that exists
only because the first one was wrong. This collapses *assign several*, *remove one*, and
*re-assign* into one operation with one set of tests. Accepted consequence: a full replace over a
client-supplied array is destructive on a truncated payload, so every id is validated server-side
and the consuming component must not reconstruct the array from client-writable state (see the
Definition-of-Done hand-off).

### D-5 — A zone with **zero** geography entries is valid at the data layer.

PRD §2.4 says a zone bundles "one or more" entries, but its own *Create a shipping zone* scenario
is name-only — a `min:1` rule would make `CreateShippingZone` impossible. Create-then-populate is
the real flow. The screen may warn about an empty zone; the data layer allows it. **Epic 3
consequence, recorded rather than discovered:** a rate rule pointing at an empty zone matches no
destination, which is a silent pricing gap rather than an error.

### D-6 — Zone names are **unique**, enforced in PHP first and by the index last.

Two "Península" rows in the rate modal's zone selector is a real defect, so uniqueness is required.
It is enforced exactly as [0023](done/0023-product-categories-backend.md)'s **D-4** enforces product
category names, and for a verified reason: `phpunit.xml` pins `DB_DATABASE` but **not**
`DB_CONNECTION`, `.env.example` sets `DB_CONNECTION=sqlite`, and `config/database.php` pins
`utf8mb4_unicode_ci` on MySQL. SQLite's `BINARY` is case-sensitive; `utf8mb4_unicode_ci` folds case
**and** accents. An index-only rule therefore passes in CI and in production *for opposite
reasons* — and for a Spanish zone catalog the accent case is not hypothetical, it is the first
thing an administrator types. So: **a normalised comparison in PHP is the authoritative rule**, the
`UNIQUE(name)` index is the last-word race guard behind it, and both actions catch `QueryException`
code `23000` and rethrow as a `ValidationException` on `name`.

**Cross-story obligation — now settled, see D-12.** 0023 places its accent-folding helper inside
`ProductCategoryValidationRules`. This story needs the identical "folds at least as aggressively as
`utf8mb4_unicode_ci`" behaviour, and two independent implementations of that constraint **will**
drift — invisibly, because SQLite reproduces neither. It is **extracted once**: the fold used by
`shippingZoneNameRules()` is a call into the project's centralized text-normalizer utility, not a
private helper on this trait. See **D-12** (which resolves the former OQ-A). This story must not
ship a second copy.

### D-7 — `ShippingZone` must **not** use `SoftDeletes`.

Not a preference — soft deletes would silently disable two FK behaviours this whole design rests
on. [`schema.md`](../../docs/database/schema.md#soft-deletes) already records that
`cascadeOnDelete()` never fires on a soft delete (which is why trashed users keep their `passkeys`
rows); the same is true of `restrictOnDelete`. Adding the trait would therefore leave a trashed
zone's memberships in place **and** stop 0036's restrict guard firing at all, letting a zone be
trashed out from under its rate rules with no error anywhere. It also reproduces 0023 **D-3**'s
problem: `Rule::unique()` does not apply the soft-delete scope, so a trashed "Península" would
squat its name forever. Deletes here are hard deletes, and a test pins the absence of the trait.

### D-8 — This story ships **no route, no Livewire component and no Blade view**.

It follows [0023](done/0023-product-categories-backend.md)'s pure-domain-layer shape, **not**
[0035](0035-shipping-carriers-backend.md)'s. Four reasons, in descending strength:

1. **The route and the view path are already taken.** 0035 ships
   `Route::livewire('shipping', ShippingIndex::class)->name('shipping.index')` and
   `resources/views/livewire/shipping.blade.php` — which is *the* path Livewire's
   [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
   forces for `App\Livewire\Shipping\Index`. A zone component here either collides on it or invents
   a second shipping route nobody has asked for.
2. **The zone editor's core interaction is blocked on unbuilt work.** Without the geography picker
   (0022's component + 0034's resolver, neither built) a zone screen is a form with a name field.
   Shipping one now guarantees 0034 rewrites it.
3. **0035's counter-precedent does not transfer.** 0035 overruled deferral on the 0004→0006
   precedent, correctly: 0004 introduced a brand-new route with no other owner. Here the route
   exists and this story has a named later consumer — 0023's situation exactly.
4. **This story's Gherkin needs no HTTP layer.** Its scenarios are satisfiable through the actions
   and the policy, which is how 0023's are.

**The cost, stated rather than hidden:** `ShippingZonePolicy` ships with **zero call sites**, so
nothing in this story can regress if it is wrong. That is carried as an explicit Definition-of-Done
hand-off to the consuming story, and mitigated by direct `Gate::forUser()` tests.

**If Phase 2 overrules this**, the concrete shape is class `App\Livewire\Shipping\Zones` → view
`resources/views/livewire/shipping/zones.blade.php` (the `Index` exception does **not** apply — it
keys off the class literally being named `Index`), route
`Route::livewire('shipping/zones', ...)->middleware(['can:shipping.view'])->name('shipping.zones.index')`,
with `can:`, never `permission:`.

### D-9 — Ship `ShippingZonePolicy`, diverging from 0035 knowingly.

0035 refused a policy because a carrier toggle has no per-target rule and its component is a real
enforcement surface. **Neither half holds here.** This story ships no component, and the actions
deliberately self-authorize nothing (matching `CreateUser`/`UpdateUser`), so without a policy this
story would ship *zero* authorization artifacts — and
[`livewire-authorization.md`](../../docs/security/livewire-authorization.md#authorization-that-lives-only-in-the-component-is-bypassed-by-every-other-call-site-of-the-action)'s
rule says the policy is the right home regardless of which consumer arrives first. 0023 hit exactly
this and shipped `ProductCategoryPolicy`.

The repo now carries **both** patterns inside the same module, which is worth reconciling rather
than papering over. Proposed rule, for `docs-keeper` to record in Phase 6: *a policy is created
when the story ships no caller, or when an ability carries a per-target rule; a bare permission
check suffices only when the component is the sole enforcement point and the ability is uniform
across targets.* That reconciles 0004, 0023, 0033 and 0035 without retconning any of them.

### D-10 — Pivot table name: `shipping_zone_geography_entry`, with the table passed explicitly.

**Recorded dissent — the two experts disagreed and both arguments are good.**
`backend-expert` recommended Laravel's alphabetical default, `geography_entry_shipping_zone`, which
is zero-config (no `$table` argument at any call site) and is "the Laravel way" per project
`CLAUDE.md`. `database-expert` recommended the domain-first name, on the grounds that this schema
groups by prefix (`shipping_carriers`, `shipping_zones`, `shipping_rates`) and a flat MySQL
namespace offers exactly one navigational affordance.

**Decided in favour of the domain-first name**, on one argument neither the default nor convenience
answers: 0032 chose the *generic* name `geography_entries` deliberately (its **OQ-3**) so a future
non-shipping consumer could reuse the catalog. A pivot sorting under `g`, adjacent to that
deliberately-generic table while being 100% shipping-owned, is therefore not merely unhelpful —
it is misleading about ownership. The cost is one explicit string in one relation method, and this
repo already treats that kind of explicitness as a feature (0016's `constrained('sales_regions')`;
[`migrations.md`](../../docs/database/migrations.md)'s be-explicit-about-indexes section).
`shipping_zone_areas` was rejected outright: "area" is a new domain word appearing nowhere in the
PRD, and a noun-shaped pivot name invites someone to give it a model and attributes it must never
have. **Phase 2 may overrule this; nothing else in the design changes if it does.**

### D-11 — No inverse `shippingZones()` relation on `GeographyEntry`.

Adding it would make the deliberately generic catalog import a shipping model — the coupling 0032
spent an open question avoiding. Every reverse query is expressible from this side:
`ShippingZone::whereHas('geographyEntries', fn ($q) => $q->whereKey($entryId))`. Revisit only when
a *second* module pivots into the catalog, at which point the coupling would be symmetric.

### D-12 — Text normalization is **one shared utility**, project-wide. CONFIRMED 2026-08-18. (resolves OQ-A)

Case/accent folding — the thing that makes a search for `Nino` find `Niño`, and that makes
`"península"` / `"PENÍNSULA"` / `"Peninsula"` collide with `"Península"` — is **identical across
every story that searches the geography catalog or the sales-region catalog**: **0022** (the shared
searchable multi-select), **0026** (product↔region resolver), **0032** (the geography catalog seed),
**this story**, and **0034** (the zone geography picker). Confirmed by the product owner across the
Epic 2 Phase 1 debates. It is a **five-story** decision, not the two-story one OQ-A framed.

**The rule is not defined here.** This story consumes the project's **centralized text-normalizer
utility** — one function that is the single source of truth for what "normalized" means: the
invokable **`App\Actions\NormalizeForSearch`**, at `app/Actions/NormalizeForSearch.php`, with the
signature `__invoke(string $value): string`, implemented as trim → `Str::lower` → `Str::ascii` →
collapse whitespace, owned by [0022](done/0022-searchable-multi-select-component.md)'s **D13**.
Concretely:

- `app/Concerns/ShippingZoneValidationRules.php`'s `shippingZoneNameRules()` folds by **calling that
  utility**, not via a private helper on the trait and not via an inline
  `Str::lower()` + `iconv()`/transliterator pipeline. D-6's authoritative PHP comparison is a
  comparison of two utility outputs.
- **0023 must consume the same utility** rather than keeping its accent-folding helper inside
  `ProductCategoryValidationRules` — the cross-story obligation under D-6, now with a named target.
  Feed this back to 0023 alongside **OQ-F**.
- **The bug class this closes is drift between a stored fold and a query-time fold.** 0032 computes
  `geography_entries.normalized_name` at seed time; 0034 normalizes the administrator's live search
  term. If those are two implementations, one folding accents and the other only lowercasing, `Niño`
  is stored as `nino` while the query stays `niño` and the row becomes unfindable — a silent
  zero-results bug that neither side's tests catch, because each side is internally consistent.
  **Both must resolve to the same function.** Same reasoning one level down for zone names: SQLite's
  `BINARY` and MySQL's `utf8mb4_unicode_ci` disagree, so a second implementation diverges *invisibly*
  in CI (**R-3**).
- **Changing the utility is a re-seed event** for `geography_entries.normalized_name` — recorded on
  0032 as its **D-N1**, and repeated here so whoever edits the fold from the zone side knows it has a
  stored consumer.

`tests/Unit/Concerns/ShippingZoneValidationRulesTest.php`'s pure-function normalization test
therefore asserts *this story's use of* the shared utility, while the utility's own fold table is
0022's to test. Do not duplicate that table here.

## Files to create/modify

### Schema

- `database/migrations/<ts>_create_shipping_zones_table.php` — **new**.

  ```php
  Schema::create('shipping_zones', function (Blueprint $table): void {
      $table->uuid('id')->primary();
      $table->string('name', 150);
      $table->timestamps();

      // Defence in depth ONLY. The authoritative uniqueness check is the
      // normalised comparison in PHP -- CI runs SQLite (BINARY, case-sensitive)
      // while production runs MySQL utf8mb4_unicode_ci (case- AND accent-
      // insensitive), so a collation-backed rule is a different rule in each
      // place. See D-6 and 0023 D-4. This index is the last-word race guard.
      $table->unique('name');
  });
  ```

  `down()` is `Schema::dropIfExists('shipping_zones');` — the unique index drops with the table, so
  no explicit `dropUnique()` (contrast `add_pending_email_to_users_table`, which drops a column).

  **`id` — UUID v7 via `HasUuids`.** Confirmed project policy for Epic 2 business entities (0016
  **D9**, 0035 **F**); it is also what makes 0036's `foreignUuid('shipping_zone_id')` match on both
  sides. No `$keyType` / `$incrementing` properties on the model.

  **`name` — `string(150)`.** Matching `sales_regions` (0016), which is the nearer analogue: a
  small admin catalog whose name is unique, short, and rendered as a picker label or badge. At 150
  the utf8mb4 unique key is 600 bytes rather than 1020. The inconsistency with 0023's bare
  `string()` (255) is real and flagged as **OQ-E**. Whichever length survives, the migration length
  and the validation `max:` must move together and the boundary test must derive from the same
  constant (0023 **R-4**).

  **Columns argued and rejected**, each with the evidence:

  | Rejected | Why |
  | --- | --- |
  | `description` | 0035 earned its `description` from the prototype's real carrier record in `docs/arospe-handoff/project/js/envios.js`. The zone side of that same file is `var ZONES = ['Península', 'Baleares', ...]` — a **bare string array**. No zone description exists in the prototype, the PRD scenarios, or the acceptance criteria. The 0035 argument does not transfer. |
  | `is_active` | Invents a state nobody has defined, and immediately raises "what happens to the 7 SEUR rates pointing at a deactivated zone?" — an Epic 3 pricing question nobody has asked. The zone lifecycle already has its decided rule (D-1). |
  | `sort_order` | `ORDER BY name`. Same as 0023 **D-6**; a cheap additive migration the day drag-ordering is asked for, and the PRD never asks. |
  | `slug` | `sales_regions` has one because it is **seeded** and its seeder needs an immutable match key. Zones are admin-created — there is no seeder and no idempotency key to protect. |
  | `color` / `hue` | The prototype's `docs/arospe-handoff/project/js/common.js` does `ZONE_BADGE[zone] \|\| 'gray'` — a **name-keyed lookup with a neutral fallback**. Every admin-created zone is absent from that map by definition, so the prototype's own logic already degrades to a neutral badge. The frontend story renders one neutral style or derives a hue from `id`. |
  | `SoftDeletes` | See **D-7** — it silently disables two FK behaviours this design depends on. |

- `database/migrations/<ts+1>_create_shipping_zone_geography_entry_table.php` — **new**, and
  **strictly later** than both this story's zones migration and 0032's catalog migration, so the
  pivot's FKs resolve and its `down()` (rolled back first) drops the pivot before either parent.

  ```php
  Schema::create('shipping_zone_geography_entry', function (Blueprint $table): void {
      // UUID parent -> CHAR(36), matches shipping_zones.id.
      // cascadeOnDelete: memberships are meaningless without their zone, and
      // restrict here would fail EVERY legitimate zone delete (D-1's guard is
      // about rate rules, never about a zone's own coverage).
      $table->foreignUuid('shipping_zone_id')
          ->constrained()
          ->cascadeOnDelete();

      // bigint parent -> unsignedBigInteger, matches geography_entries.id
      // ($table->id() = bigIncrements = UNSIGNED BIGINT). Named explicitly:
      // constrained() would infer it correctly, but this is the one place a
      // reader needs the mixed-key crossing documented.
      // restrictOnDelete mirrors 0032's own parent_id choice and turns its
      // "upsert, never truncate" decision -- taken FOR this story -- into a
      // database invariant instead of a paragraph someone has to remember.
      $table->foreignId('geography_entry_id')
          ->constrained('geography_entries')
          ->restrictOnDelete();

      // The composite PK IS the "same entry twice in one zone" constraint, and
      // it is the clustered index. Zone first: the dominant read is "this
      // zone's members", a leading-column range scan.
      //
      // NEVER narrow this to unique('geography_entry_id'): that is the schema
      // shape of "an entry belongs to at most one zone" and would silently
      // invert D-2 (overlap is allowed), while still missing every implicit
      // overlap. See D-2.
      $table->primary(['shipping_zone_id', 'geography_entry_id']);

      // No timestamps(): sync() deletes and re-inserts rows, so created_at
      // would reset on every unrelated edit -- a timestamp that lies.
      // No index('geography_entry_id'): InnoDB creates one for the FK because
      // the column is non-leading in the PK. Writing it by hand ships a
      // duplicate -- the users_uuid_unique shape in errors-log.md. Verify with
      // `php artisan db:table` in Phase 3, not by reading this file.
  });
  ```

  `down()` is `Schema::dropIfExists('shipping_zone_geography_entry');`.

  **Key-type helpers, verified**: `$table->id()` in 0032 is `bigIncrements` → `UNSIGNED BIGINT`,
  and `foreignId()` emits `unsignedBigInteger` — exact match. `foreignUuid()` emits `CHAR(36)`,
  matching `$table->uuid('id')->primary()`.

  **Collation: inherit from the connection; set nothing per-table or per-column.**
  `config/database.php` pins `utf8mb4` / `utf8mb4_unicode_ci` on the `mysql` connection and
  Laravel's grammar appends it to every `CREATE TABLE`. This is a *decision*, not a default:
  MySQL requires a referencing and referenced string column to share charset **and** collation or
  it refuses the FK outright (error 3780), so hand-setting one table's collation and not the
  other's is the exact failure mode. This closes 0032's **OQ-6** for these two tables — the answer
  is "inherit, and record that we inherited". Do **not** add an accent-sensitive collation to
  "fix" name uniqueness: that would make the index *disagree with* the PHP rule instead of backing
  it up (0023 **RQ-2** rejected the same idea).

### Model / factory

- `app/Models/ShippingZone.php` — **new**. `use HasFactory, HasUuids;`, `#[Fillable(['name'])]` and
  nothing else fillable, `@property string $id`, no `$keyType`/`$incrementing`, **no
  `SoftDeletes`** (D-7), no `#[Hidden]`, no `casts()` beyond default timestamp handling.

  ```php
  /**
   * The geography catalog entries this zone covers.
   *
   * Deliberately UNCONSTRAINED by level: a zone bundles entries at ANY level --
   * country, comunidad autónoma or municipio (PRD 2.4). Do NOT add a
   * ->where('level', ...) filter here; the absence of that filter IS the
   * "at any level" rule. Membership is literal, never transitive (D-3).
   *
   * @return BelongsToMany<GeographyEntry, $this>
   */
  public function geographyEntries(): BelongsToMany
  {
      return $this->belongsToMany(GeographyEntry::class, 'shipping_zone_geography_entry');
  }
  ```

- `database/factories/ShippingZoneFactory.php` — **new**.
  `['name' => fake()->unique()->words(2, true)]`, plus a `withGeography(int $count = 1)` state using
  0032's `GeographyEntryFactory`. Faker's `unique()` is a per-instance guard, **not** a database
  one — any test needing a guaranteed-distinct name passes it as a literal (0023 **R-5**).

- `app/Models/GeographyEntry.php` — **NOT touched**. See D-11; this is a position, not an omission.

### Application

- `app/Concerns/ShippingZoneValidationRules.php` — **new**, following
  [naming.md](../../docs/conventions/naming.md#traits-and-their-methods)'s `<Noun>ValidationRules`
  / `<noun>Rules()` convention.

  **The name method is `shippingZoneNameRules()`, not `nameRules()`.**
  `ProfileValidationRules::nameRules()` already exists and 0023 plans a second
  `ProductCategoryValidationRules::nameRules()`; traits in `app/Concerns/` are composed flat at the
  consumer, so two same-named trait methods in one class is a **fatal error**. Do not add a third.
  *(This is a real latent collision in 0023's current plan and should be flagged back to it.)*

  ```php
  /** @return array<int, ValidationRule|array<mixed>|string> */
  protected function geographyEntryIdsRules(): array
  {
      return [
          'present',
          'array',
          // Bounded so a forged payload cannot turn one save into an unbounded
          // query. A whole country is ONE row, so 500 is far above any
          // legitimate zone.
          'max:500',
          // ONE query for the whole array. The obvious form --
          //   'geographyEntryIds.*' => Rule::exists('geography_entries', 'id')
          // -- issues N SELECTs, one per element, and is deliberately not used.
          // No ->where('level', ...): entries at ANY level are valid (D-3).
          function (string $attribute, mixed $value, Closure $fail): void {
              $ids = array_values(array_unique(array_map(intval(...), (array) $value)));

              if (GeographyEntry::whereKey($ids)->count() !== count($ids)) {
                  $fail(trans('validation.exists', ['attribute' => $attribute]));
              }
          },
      ];
  }
  ```

  Note `'present'`, not `'required'`: an empty array is legal (D-5). The `exists` check is a
  **pre-flight check, not a race guard** — the FK has the last word, which is why the action
  catches `23000`.

- `app/Actions/Shipping/CreateShippingZone.php` — **new**. `__invoke(string $name): ShippingZone`.
  Trims **before** validating, catches `QueryException` `23000` → `ValidationException` on `name`,
  exactly as [`App\Actions\Users\CreateUser`](../../app/Actions/Users/CreateUser.php) does for
  `email`. Takes a name only — never an id array (D-4 keeps membership a separate operation, which
  is also how the PRD splits its own scenarios).

- `app/Actions/Shipping/RenameShippingZone.php` — **new**.
  `__invoke(ShippingZone $zone, string $name): ShippingZone`. Same trim + `23000` handling, with
  the uniqueness rule ignoring the target's own id.

- `app/Actions/Shipping/DeleteShippingZone.php` — **new**. `__invoke(ShippingZone $zone): bool`.
  Body is a plain instance `->delete()` wrapped in `DB::transaction()`, with a docblock naming 0036
  as the extension point — see D-1 for why all three properties are load-bearing.

- `app/Actions/Shipping/SyncShippingZoneGeography.php` — **new**.

  ```php
  /**
   * Replace the zone's geography membership with the given catalog entries.
   *
   * Performs NO authorization, matching App\Actions\Users\CreateUser and
   * UpdateUser: the caller gates first. See the DoD hand-off note.
   *
   * Passing an empty array detaches everything -- that is legal (D-5).
   *
   * @param  array<int, int|string>  $geographyEntryIds
   * @return array{attached: array<int, int>, detached: array<int, int>, updated: array<int, int>}
   */
  public function __invoke(ShippingZone $zone, array $geographyEntryIds): array
  ```

  Casts and de-duplicates before `sync()` (a mixed `"33024"` / `33024` payload otherwise produces a
  dishonest changes array, which the caller renders back to the administrator), runs inside
  `DB::transaction()`, and catches `23000` → `ValidationException` on `geographyEntryIds`.
  Returning `sync()`'s changes array rather than the model is deliberate: the future editor needs
  "3 added, 1 removed" and recomputing it from a re-query is both slower and racy.

- `app/Policies/ShippingZonePolicy.php` — **new**, via
  `php artisan make:policy ShippingZonePolicy --model=ShippingZone --no-interaction`.
  Auto-discovered by name; **no** `AuthServiceProvider` (this repo has none and needs none).
  `viewAny` / `create` / `update` / `delete` over the already-seeded `shipping.view` /
  `shipping.create` / `shipping.edit` / `shipping.delete`. **The D-1 count guard does not go
  here** — see D-1.

- `lang/en/shipping.php` + `lang/es/shipping.php` — **modify** (0035 creates them). Add a `zones.*`
  group, key-for-key identical across both locales. **No `zones.delete_blocked` key** (D-1).

  > **Shared-file hazard.** These two files are created by 0035 and modified here. Per
  > [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent
  > File-Ownership Rule, 0033 and 0035 must **not** be implemented by concurrently-dispatched
  > agents. Sequential only.

### Not touched by this story

`geography_entries`' migration, model, factory, seeder or fixtures (0032) — including no inverse
relation on `GeographyEntry`. `routes/web.php`, `app/Livewire/**`, `resources/views/**` (D-8, and
0035 owns the shipping ones). `database/seeders/**` — zones are admin-created, so there is no zone
seeder and no `RolePermissionSeeder` change: `shipping.view|create|edit|delete` **already exist**
(verified in `RolePermissionSeeder::MODULES` × `ACTIONS`).

## Tests to perform

Backend only — **no browser tests** (this story ships no screen). Files mirror 0023's
`tests/Feature/ProductCategories/` layout; scaffold with
`php artisan make:test --pest ShippingZones/CreateShippingZoneTest`.

**Test-data strategy — never seed the geography catalog.** ~8,300 rows inside a `RefreshDatabase`
transaction, times every zone test, converts a seconds-long suite into a minutes-long one for zero
behavioural signal: zone behaviour is identical against 3 rows and 8,300. Use
`GeographyEntryFactory`'s `country()` / `community()` / `municipality()` states; **most tests need
only a row with the right `level`, not a valid parent chain**. Where parentage *is* the assertion,
`GeographyEntry::factory()->community()->for($country, 'parent')->create()` suffices — no helper.
Extract a `tests/Pest.php` helper only if a **third** file needs the full país→comunidad→municipio
triple. Use the PRD's own names (Gijón, Avilés, Siero, Asturias, Galicia, Francia, España) for
traceability, but **always create them via the factory with explicit names, never look them up from
a seeded catalog** — that single rule is what decouples this story from 0032's **OQ-1**.

**Precise dependency, worth stating because 0032 currently reads as one indivisible blocked unit:**
this story depends on 0032's **migration, model and factory** landing. It does **not** depend on
OQ-1 (the INE dataset, its licence and vintage) resolving. If 0032 splits, 0033 can start.

### `tests/Feature/ShippingZones/CreateShippingZoneTest.php`
- [ ] A valid name persists exactly one row with that name and populates both timestamps.
- [ ] A blank name is refused with a `ValidationException` on `name`; no row is written.
- [ ] **A whitespace-only name (`'   '`) is refused** — proves the trim runs *before* validation.
      Highest-value single case in the file.
- [ ] A name with leading/trailing whitespace is stored **trimmed** — assert the exact persisted
      string, not merely "no error".
- [ ] Length boundary as a **pair**: exactly max accepted, max+1 refused, both derived from the
      same constant the migration uses.
- [ ] A duplicate name is refused at the **validation** layer (`ValidationException`, not
      `QueryException`).
- [ ] **Case-only** and **accent-only** duplicates are refused **by validation** — one dataset over
      `"península"` / `"PENÍNSULA"` / `"Peninsula"` against an existing `"Península"`. This is the
      assertion that pins the fold-at-least-as-hard-as-`utf8mb4_unicode_ci` rule; without it SQLite
      CI accepts what MySQL rejects with a `23000` (D-6).
- [ ] A duplicate that bypasses validation surfaces as a `ValidationException` on `name`, never a
      500 — **drive the collision through the real unique index**, per
      [signed-link-verification.md](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word).
- [ ] A newly created zone has **no** geography memberships (guards a create path that helpfully
      attaches something).

### `tests/Feature/ShippingZones/RenameShippingZoneTest.php`
- [ ] Rename to a free name updates the row, and the old name becomes immediately reusable.
- [ ] Rename onto another zone's name is refused; the target keeps its original name.
- [ ] Rename to **its own current name**, as **three** tests so a reject-everything rule cannot
      pass trivially: (a) the no-op rename succeeds; (b) the row is genuinely unchanged; (c) a
      genuinely free name is still accepted, as the control. This is the story's single most likely
      bug — the missing `->ignore()` (0023 **R-1**).
- [ ] Full validation depth (blank / whitespace-only / boundary pair) **re-asserted independently
      on the rename path** — an id threaded through one call site and not the other fails silently
      in one direction only (0023 **R-7**).
- [ ] Renaming leaves the zone's geography memberships untouched (count **and** exact ids).

### `tests/Feature/ShippingZones/DeleteShippingZoneTest.php`
- [ ] Deleting a zone with no memberships removes the row outright — `assertDatabaseMissing`, never
      `assertSoftDeleted` (D-7).
- [ ] The freed name is immediately reusable.
- [ ] **Deleting a zone with memberships removes every pivot row for that zone** — assert the pivot
      table directly, not `$zone->geographyEntries`.
- [ ] **…and leaves `geography_entries` completely untouched** — assert the **exact ids** still
      present, not a `count()`. A count passes if rows were deleted and recreated; ids do not. This
      is the highest-severity test in the story: the distance between
      `$zone->geographyEntries()->detach()` and `->delete()` is one word, and the second hard-deletes
      seeded catalog rows another story owns.
- [ ] Deleting zone A does **not** strip a shared entry from zone B (guards a detach scoped by
      entry instead of by zone — the same mistake D-2's overlap test catches from the other side).
- [ ] Deleting an unknown or malformed-UUID zone fails cleanly (`ModelNotFoundException` / 404),
      not as a silent no-op — `HasUuids::resolveRouteBindingQuery()` rejects a non-UUID before
      querying.
- [ ] **Exactly one** skipped stub for the deferred guard:
      `->skip('shipping_rates does not exist yet — story 0036 must un-skip this')`. **Name the
      blocking artifact (`shipping_rates`) first and the story id second**, so a grep survives
      renumbering. See the caveats under **Risks**.

### `tests/Feature/ShippingZones/ZoneGeographyAssignmentTest.php`
- [ ] **One entry at each level — a single dataset with three named cases**
      (`country` / `community` / `municipality`), not three tests: the bodies are identical
      (assign one entry of level X, assert the pivot holds exactly that id and the level
      round-trips). Split only if the assertions genuinely diverge.
- [ ] **Several entries at once** — a separate test, because the assertion differs (count = 3,
      exact id set). This is the PRD's "Gijón, Avilés and Siero" example.
- [ ] **One zone may mix levels** — a country + a community + a municipio together.
- [ ] **Replace semantics (D-4):** syncing `[A, B]` then `[B, C]` leaves exactly `[B, C]`.
- [ ] Syncing an empty array clears coverage and **leaves the zone itself intact** (D-5).
- [ ] **The same entry twice in one zone is refused by the database.** Drive it through a direct
      `attach()`/insert against the composite PK — **not** through `sync()`, which de-duplicates
      its own input and would make this pass vacuously with or without the constraint.
- [ ] **An unknown `geography_entry_id` is refused**, and the test asserts **which layer**:
      validation refuses cleanly first, and a validation-bypassing insert raises `23000` rather
      than writing an orphan. Verified as engine-portable: `config/database.php` sets
      `'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true)` and `phpunit.xml` does not pin
      `DB_FOREIGN_KEYS`, so SQLite FK enforcement is genuinely on in CI and both engines raise
      SQLSTATE `23000`.
- [ ] **…and no `geography_entries` row is created as a side effect** — assert the catalog's exact
      id set is unchanged. This is the *only* meaningful executable form of the PRD's "the catalog
      does not allow inventing new entries" scenario; it fails against a `firstOrCreate`-based
      implementation, which is the real way an administrator would end up inventing an entry
      through this story.
- [ ] **Explicit overlap is allowed (D-2):** the same municipio assigned to two zones — both
      assignments succeed, both pivot rows exist, neither zone loses it. This guards the concrete
      one-token accident of writing `unique('geography_entry_id')` instead of the composite.
- [ ] **Membership is literal, not transitive (D-3):** a zone assigned the country "España" holds
      **exactly one** pivot row — not 17 communities, not 8,100 municipios; and an "España" zone
      plus a "Gijón" zone both save, each keeping its own single entry, neither rewriting the
      other. This is the testable half of implicit overlap.

### `tests/Feature/Models/ShippingZoneTest.php`
- [ ] A factory-created zone's `id` is a UUID **v7** string (`Str::isUuid($id, 7)`) — this app's
      wiring of `HasUuids`, not the trait's own correctness.
- [ ] Two zones created in immediate succession sort lexicographically in creation order (the
      time-ordering assertion `tests/Feature/Models/UserTest.php` already makes).
- [ ] `name` is mass-assignable and **nothing else is** (guards a future column added to
      `#[Fillable]` by reflex).
- [ ] The model does **not** use `SoftDeletes` — a regression guard on **D-7**, whose failure mode
      is silent.
- [ ] `geographyEntries()` returns `GeographyEntry` models with the pivot intact — one assertion,
      not a tour of `belongsToMany`.

### `tests/Feature/Database/ShippingZoneSchemaIndependenceTest.php`
- [ ] `Schema::getForeignKeys()` on the pivot reports **exactly two** foreign keys — one to
      `shipping_zones`, one to `geography_entries` — and none to anything else. *Verify
      `getForeignKeys()` returns usefully on SQLite before relying on it; drop rather than make it
      MySQL-only.*
- [ ] One `->skip('sales_regions does not exist yet — story 0016')` stub for the PRD's
      Sales-Region-untouched scenario.

  > **Recorded dissent, and this story acts on it.** 0032 proposes asserting
  > `Schema::hasTable('sales_regions')` is **false**. `backend-qa` objects and this story agrees:
  > that assertion goes red the day 0016 ships, for no defect — a test scheduled to fail teaches
  > people to edit tests to make them green. The FK-shape assertion above encodes the same intent
  > as a property of *this story's own schema*, stays true forever, and actually fails if someone
  > later adds a `sales_region_id` to the pivot, which is the coupling worth fearing. **This should
  > be fed back to 0032 before it is implemented.**

### `tests/Unit/Concerns/ShippingZoneValidationRulesTest.php`
- [ ] `shippingZoneNameRules(null)` vs `shippingZoneNameRules($id)` return the expected arrays, the
      second carrying the `->ignore()` branch.
- [ ] Normalisation as a **pure function**, no database: case folding, accent folding, whitespace
      collapsing, over a handful of Spanish inputs. Asserts that this trait **routes through the
      shared text-normalizer utility** (D-12) — the utility's own exhaustive fold table belongs to
      0022, not here. This is the cheapest place to pin D-6's rule, and where a re-inlined private
      fold shows up first.

### `tests/Feature/Policies/ShippingZonePolicyTest.php`
- [ ] Every ability gets **both an allow and a deny** test via `Gate::forUser($actor)->allows(...)`,
      following `tests/Feature/Policies/UserPolicyTest.php`.
- [ ] `Gate::forUser($denied)->authorize(...)` still throws `AuthorizationException` — what proves
      a denial is server-side rather than merely hidden in a UI.
- [ ] A `Super Admin` holding no explicit `shipping.*` grant is allowed through `Gate::before`.
- [ ] `beforeEach` calls `app(PermissionRegistrar::class)->forgetCachedPermissions()` **then**
      `$this->seed(RolePermissionSeeder::class)` — never flush between Act and Assert. Assert
      against the seeded catalog rather than fabricating `Permission` rows: an uncatalogued string
      throws `PermissionDoesNotExist` at runtime.

### Not worth writing
- **Migration `up()`/`down()` mechanics** — `RefreshDatabase` exercises them every run;
  `down()` symmetry is a code-review item
  ([what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)).
- **Eloquent's `belongsToMany` / `sync()` / `detach()` internals.** Test the *semantic decision*
  (what set the zone ends up holding), never the method.
- **`HasUuids` itself** — the one UUID assertion that stays tests this app's wiring, not the trait.
- **Any performance or `EXPLAIN`-shaped assertion on the pivot index**, and indeed **no
  index-existence test at all here.** SQLite creates no implicit FK index and `Schema::getIndexes()`
  differs per driver, so such a test would assert a driver artifact rather than a design decision.
  (Contrast 0032, where the search index *is* the deliverable and existence-only is right.)
- **The geography catalog's own contents** (counts, parentage, accent round-trips, Gijón→Asturias)
  — 0032's surface. Two owners for one fact means both go stale independently.
- **A route-absence or `arch()` test for "admins cannot invent catalog entries."** `arch()` can
  only express class-level dependency, and `->not->toUse(GeographyEntry::class)` is flatly *false*
  here — this story's actions legitimately read the model. `expect(Route::has(...))->toBeFalse()`
  asserts nobody added a route nobody proposed. Both are vacuous or wrong; the meaningful test is
  the "no catalog row created as a side effect" assertion above.
- **The full cross-product of level × operation** — level is orthogonal to zone CRUD. One dataset
  over levels on the *assignment* path is the whole of it.

### PRD §2.4 Gherkin — who covers what

| PRD scenario | Covered here? |
| --- | --- |
| Create a shipping zone | ✅ fully |
| Rename a shipping zone | ✅ fully |
| Delete a zone no rate rule references | ⚠️ **half** — the delete: yes. *"And it is no longer offered in the shipping rate modal's zone selector"*: no (0036 + the Shipping frontend story). Do not let that clause sit unclaimed. |
| Assign geography entries at any level (Outline) | ✅ fully — the one PRD scenario this story owns end to end |
| The picker filters as the administrator searches | ❌ 0034 (query) + browser test |
| The picker shows a "no results" empty state | ❌ 0034 browser test |
| The catalog does not allow inventing new entries | ⚠️ **half, and this is the stronger half** — the falsifiable version (unknown id refused, catalog id set unchanged) is here; 0034's "no such option exists in the picker" can only assert the absence of an affordance nobody built |
| Creating a zone leaves the Sales Region catalog untouched | ❌ named skip (0016) + the durable FK-shape assertion as the real substitute |
| Deleting a zone referenced by a rate rule is hard-blocked with a count | ❌ named skip (0036) — decision **confirmed** in D-1, implementation deferred |

## Expected outcome
`shipping_zones` and `shipping_zone_geography_entry` exist. An administrator's create / rename /
delete operations are available as three invokable domain actions, and a fourth replaces a zone's
geography coverage with any set of catalog entries at any of the three levels. A zone can be as
narrow as three municipios or as broad as a country; two zones may cover the same municipio; the
same entry cannot appear twice in one zone. Zone names are unique in a way that holds identically
on SQLite and MySQL. Deleting a zone removes its coverage rows and **never** touches the seeded
catalog, whose rows remain impossible to create, alter or delete through anything this story ships.
`ShippingZonePolicy` states the four abilities in one place, ready for its first caller. Nothing in
the UI changes: there is no zone screen yet. Story 0036 can then add `shipping_rates` with a
`restrictOnDelete` FK into `shipping_zones` and extend one existing action file with the in-use
count guard; story 0034 can build the picker over 0032's catalog and bind it to this story's sync
action.

## Acceptance criteria
- [ ] Shipping zones are a **full admin-CRUD catalog** — created, renamed and deleted freely, not a
      fixed seeded list *(PRD §2.4 AC 4)*.
- [ ] A zone is a **named group bundling one or more geography-catalog entries at any level**, and
      a single zone may mix levels *(PRD §2.4 AC 6)*.
- [ ] Administrators **cannot add, alter or delete a geography catalog entry** through anything
      this story ships; an unknown entry id is refused and creates nothing *(PRD §2.4 AC 5)*.
- [ ] Zone names are unique, with the rule enforced by a normalised PHP comparison and backed by a
      `UNIQUE` index, giving identical behaviour on SQLite and MySQL for case- and accent-only
      collisions (**D-6**).
- [ ] That normalisation is performed by the project's **centralized text-normalizer utility**
      (**D-12**) — no fold logic is inlined in `ShippingZoneValidationRules` and no second copy is
      introduced, so this story, 0023, 0032's `normalized_name` and 0034's search all fold
      identically.
- [ ] Names are trimmed before validation; a whitespace-only name is refused.
- [ ] Assignment uses **replace semantics** and an empty set is legal (**D-4**, **D-5**).
- [ ] **Two zones may cover the same municipio** (**D-2**), and the pivot carries **no** unique on
      `geography_entry_id` alone.
- [ ] The same entry twice in one zone is impossible, enforced by the composite primary key rather
      than by `sync()` behaviour.
- [ ] Membership is **literal, never transitive** — assigning a country adds exactly one row
      (**D-3**).
- [ ] Deleting a zone removes its membership rows and leaves `geography_entries` byte-for-byte
      unchanged.
- [ ] `ShippingZone` does **not** use `SoftDeletes`, and a test pins it (**D-7**).
- [ ] `shipping_zones.id` is a UUID v7 via `HasUuids`; `geography_entry_id` on the pivot is
      `bigint`, matching 0032's confirmed key type.
- [ ] `ShippingZonePolicy` gates `viewAny`/`create`/`update`/`delete` on the already-seeded
      `shipping.*` permissions; **no new permission and no `RolePermissionSeeder` change**.
- [ ] The in-use delete guard is **decided (D-1) and deliberately not implemented**, with
      `DeleteShippingZone` pre-shaped as its single extension point and one named skip recording
      the blocker.
- [ ] No route, Livewire component or Blade view is added, and nothing 0035 owns is edited
      (**D-8**).
- [ ] `down()` is the exact inverse of `up()` in both migrations.

## Definition of Done
- [ ] Tests written and green, plus the **full** suite per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Expected focus: the unbounded-array vector on
      `geographyEntryIds` (`max:500` + the single-query existence check), that the `exists` check is
      a pre-flight rather than a race guard with the FK behind it, and that the actions
      deliberately self-authorize nothing so the hand-off below is the real control.
- [ ] Documentation updated (docs-keeper): `docs/database/schema.md` (both tables + ER diagram, the
      mixed-key-type pivot, and the inherit-the-connection-collation decision closing 0032's
      **OQ-6** for these tables); `docs/architecture/authorization.md` (`ShippingZonePolicy` and the
      reconciling policy-vs-permission rule from **D-9**); `docs/conventions/naming.md` if the
      `<Model>NameRules` collision-avoidance rule is worth generalizing; and — if the `passkeys`
      duplicate-index suspicion (**R-1**) is confirmed — a correction to
      `docs/database/migrations.md` plus an `docs/errors-log.md` entry.
- [ ] **Hand-off to the consuming story recorded** (the policy ships with zero call sites, so this
      is the only thing making it real): that story must (a) `Gate::authorize()` before invoking
      **every** action, including the sync action — which is the method most likely to ship ungated
      because it does not look like "saving" — and (b) keep the zone id feeding
      `Rule::unique()->ignore()` server-authoritative via `#[Locked]` plus a re-read, per
      [livewire-authorization.md](../../docs/security/livewire-authorization.md#locked-is-what-makes-ruleunique-ignore-safe-here).
- [ ] **Obligations written into 0036's task file**: un-skip the delete stub; implement the
      count guard in `DeleteShippingZone`; `restrictOnDelete` on `shipping_rates.shipping_zone_id`;
      catch `23000` and re-render the count message; assert the count for ≥2 distinct reference
      counts; and own the overlap-precedence rule (**D-2**).
- [ ] Acceptance criteria met.

## Dependencies, risks, open questions

### Dependencies
- **0032 — geography catalog.** Precisely: its **migration, model and factory**. **Not** its
  **OQ-1** (the INE dataset/licence/vintage), which does not block this story at all.
- **0035 — carriers.** Only through the shared `lang/en|es/shipping.php`. Must land first, and the
  two must never be implemented concurrently (Parallel Agent File-Ownership Rule).
- **0002 — seeded permission catalog.** `shipping.*` already exists; nothing to add.
- **Blocks 0036** (rate rules) and **0034** (the geography picker's zone binding).

### Risks
- **R-1 — `migrations.md`'s explicit-FK-index convention may itself be creating duplicate
  indexes.** `database-expert` predicts (could not measure — no reachable MySQL from the agent
  shell) that `create_passkeys_table`'s `foreignId('user_id')->constrained()` **plus**
  `$table->index('user_id')` yields two indexes on `user_id` on MySQL, since `constrained()` adds
  the FK command first. 0016 raised the same suspicion independently. **Make this an explicit
  Phase 3 verification step**: one `php artisan db:table passkeys`. If confirmed, it is a
  `migrations.md` correction plus an `errors-log.md` entry, and this story found it. Either way,
  **do not hand-write `index('geography_entry_id')`** — verify the resulting index list with
  `php artisan db:table shipping_zone_geography_entry`, per the `users_uuid_unique` rule
  ([errors-log.md](../../docs/errors-log.md)).
- **R-2 — the missing `->ignore()` on rename.** Highest-likelihood functional bug; mitigated by the
  deliberate three-test treatment above.
- **R-3 — two accent-folding normalisers drifting.** Invisible in CI, because SQLite reproduces
  neither. **Mitigated by D-12**: there is exactly one shared normalizer and every consumer calls
  it. The residual risk is now narrower and concrete — someone re-inlines a fold "just here" rather
  than importing the utility, which is a code-review item, not a design gap.
- **R-4 — an over-helpful implementation walking `parent_id`** (expanding a country, or rejecting a
  municipio whose ancestor another zone holds). Fails by *adding* behaviour, which no
  absence-of-code review catches; **D-3**'s test is the guard.
- **R-5 — a wrongly-scoped pivot unique** silently inverting **D-2**; guarded by the overlap test
  and the migration comment.
- **R-6 — migration ordering across branches, with a delayed failure.** The pivot's FK needs
  `geography_entries` to exist, and Laravel orders by filename timestamp. A merge of 0032 and 0033
  from parallel branches can produce a pivot migration timestamped *before* the catalog's; the
  developer who already ran `migrate` sees nothing, and the failure lands on the next clean run.
  Guard: after merging, run a full fresh migration against a **throwaway** database — which, per
  [contracts.md](../../docs/contracts.md#destructive-database-command-rule)'s Destructive Database
  Command Rule, must be a deliberate, separately-authorized step, never assumed.
- **R-7 — `restrictOnDelete` on the catalog side turns an INE vintage refresh into a hard failure**
  when a merged/removed municipio is held by a zone. That is the *correct* failure (a human must
  decide what happens to the zone) but it needs a "which zones reference entry X" report to exist
  before the first refresh, or it becomes an incident. Owned by whichever story does that refresh;
  named here as a downstream dependency.
- **R-8 — the deferred guard is never retrofitted, and the gap reads as coverage.** Three caveats
  on relying on the skip: (i) there is **no `->skip()` anywhere in the current suite** — 0032 would
  introduce the first, so verify that `php artisan test --compact` surfaces skips *visibly* before
  either story leans on it; (ii) a skip naming a story id rots under renumbering, hence naming
  `shipping_rates` first; (iii) the real enforcement is 0036's Definition of Done, not the skip.
- **R-9 — CI proves FK *behaviour* but not index *shape*.** SQLite FK enforcement is genuinely on
  (`config/database.php`), so cascade/restrict semantics are exercised — but SQLite creates no
  implicit FK index. Recorded as a known gap rather than papered over with a driver-dependent
  assertion, the way 0032 records its collation gap.
- **R-10 — mixed-key-type ergonomics, not performance.** The two FK columns never join each other;
  each is a PK seek into its own parent, and the clustered pivot key is ~152 bytes/row (~1 MB at a
  few thousand rows). The genuine hazards: `GeographyEntry` has `@property int $id` while
  `ShippingZone` has `@property string $id`, so any helper assuming "all our ids are UUID strings"
  breaks here (Larastan level 7 should catch it); and `HasUuids::resolveRouteBindingQuery()` rejects
  a malformed id early while `GeographyEntry` does not, so the two sides fail differently — relevant
  to 0034's picker, not to this schema.
- **R-11 — Faker uniqueness is not database uniqueness** (0023 **R-5**).

### Open questions

**OQ-A — where does the name normaliser live? RESOLVED 2026-08-18 — see D-12.**
Answered exactly as recommended, and wider than this story asked: it is extracted **once**, into the
project's centralized text-normalizer utility, and it turned out to be a **five-story** decision
(0022, 0026, 0032, 0033, 0034) rather than the two-story one recorded here. Nothing is left open;
the only thing Phase 3 must not do is ship a second copy. Full statement in **D-12**.

**OQ-B — pivot table name.** Decided in **D-10** in favour of `shipping_zone_geography_entry`;
`backend-expert`'s dissent for Laravel's zero-config default is recorded there. Flagged so Phase 2
reviews it as a decision rather than inheriting it. Changing it after data exists is a rename
migration.

**OQ-C — who owns the zone management *screen*? (genuinely unresolved)**
[0032](done/0032-shipping-geography-catalog-seed.md) describes **0034** as *"the zone geography
picker"*; [0022](done/0022-searchable-multi-select-component.md) describes it as owning *"its resolver,
the by-level grouping content, and the search query/index"*; this story's brief calls it *"the
paired UI story"*. Those are not the same scope, and **0035 already owns `/shipping` and
`App\Livewire\Shipping\Index`**. So either 0034 absorbs the whole zone CRUD screen (and should be
renamed to say so), or a story between 0033 and 0034 is missing. This does **not** block 0033,
which ships no UI under **D-8** — but it must be resolved before 0033 closes, because 0033's
Definition-of-Done hand-off has to name its consumer. **Recommendation: widen 0034 to
"shipping zones — UI (list, editor, geography picker)" (recommended)**, since a picker with no
screen to live in cannot be delivered independently and splitting them creates a second story
blocked on the first with nothing to show. The alternative — a new story between the two — is
cleaner on paper and costs a renumbering pass across the Epic 2 files.

**OQ-D — name length: 150 or 255?** Three Epic 2 stories currently give three answers
(`sales_regions` 150, `product_categories` 255, this 150). **150 (recommended)** on the
`sales_regions` analogy — a short unique label rendered as a badge — and because it halves the
utf8mb4 unique key. Worth reconciling across the three in Phase 2 rather than letting it calcify;
whichever wins, the migration length and the validation `max:` must move together.

**OQ-E — should 0032 drop its `Schema::hasTable('sales_regions') === false` assertion?** This story
recommends yes and does not copy it (see the dissent under the schema-independence test file).
Feed back to 0032 before it is implemented.

**OQ-F — a latent trait-method collision in 0023.** `ProfileValidationRules::nameRules()` already
exists and 0023 plans `ProductCategoryValidationRules::nameRules()`. Traits compose flat at the
consumer, so any class using both is a fatal error. This story avoids it with
`shippingZoneNameRules()`; **0023 should be amended before implementation.**

## Provenance
Phase 1 Three Amigos debate, 2026-08-18: `product-owner` + `backend-expert` + `backend-qa` +
`database-expert` (added per [workflow.md](../../docs/workflow.md#task-classification-rule)'s
classification rule — the task creates two tables). Scope derives from PRD
[§2.4 Shipping](../../docs/PRD/PRD.md#24-shipping) as rewritten 2026-08-17, and this debate
**closes the two items that section marked `pending Phase 1 confirmation`** — the in-use delete
rule (**D-1**) and the overlap policy (**D-2**). Every expert disagreement is recorded in place
rather than resolved silently: the pivot name (**D-10**), the policy-vs-permission divergence from
0035 (**D-9**), the precedence-ownership correction to this story's own brief (**D-2**), and the
recommendation against 0032's `hasTable` assertion. No application code was written in this phase.
