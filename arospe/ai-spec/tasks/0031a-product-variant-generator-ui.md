# [0031a] Product variant generator — the cartesian combination builder (UI)

## Description

An administrator with a product offering Talla (38, 39, 40) and Color (Black, White) generates all six
combinations in one gesture instead of building six variants by hand through
[0031](done/0031-product-variants-editor-ui.md)'s single-variant form. A "Generar combinaciones" control opens
a modal listing the catalog's attribute types as checkboxes — pre-ticked with the ones the product's
existing variants already use — with a live count of how many combinations the current selection would
produce. Confirming it calls
**[`GenerateProductVariantCombinations`](done/0029b-product-variant-combination-generator-backend.md)**
exactly as 0031's own D-17.2 already specified: combinations the product already holds are **skipped
without being touched**, a combination whose derived SKU some other record already owns is **refused by
name while the rest of the batch commits**, and an inline summary panel above the variants table reports
all three outcomes.

🔴 **This story composes onto 0031's already-shipped `App\Livewire\Products\VariantBuilder` component —
it does not add a second Livewire component.** The generator's properties (`$attributeTypeIds`,
`$generationSummary`, `$showGenerateModal`) and its `generateCombinations()` method land on **the same
class**, `app/Livewire/Products/VariantBuilder.php`, and its markup lands in **the same view**,
`resources/views/livewire/products/variant-builder.blade.php` — this is what the original, pre-split
story's own Files table already specified for the generator ("🟣 Also hosts the generator"), and this
split does not revisit that placement. It is **backend-consuming, frontend-only**: no migration, no
model, no action, no policy, no validation rule of its own. Every one of those is
[0029b](done/0029b-product-variant-combination-generator-backend.md)'s, already shipped.

> 🟠 **Provenance — split out of [0031](done/0031-product-variants-editor-ui.md) on 2026-09-06, at Phase 2.**
> `code-reviewer` failed 0031 on INVEST **"Small"**: it bundled two conceptually separable units — the
> single-variant builder (0031's D-1–D-16, ~28 Gherkin scenarios, 6 test files) and this generator UI (a
> whole modal/axis-picker/summary/pagination surface, its own 15-case test file, 2 browser cases, 5 of
> ~20 acceptance-criteria bullets, 4 false-pass entries, a 12-scenario Gherkin feature) — the exact shape
> that made **0029** itself fail "Small" and split into 0029/0029a/0029b, whose generator half (0029b) is
> the very feature this story renders a UI for. See [Provenance](#provenance) below for the full account.

## Type

frontend | fullstack (related_task_id: **0031** — a **hard dependency**, not an FE/BE pair: 0031 is the
frontend story this one composes onto, not a paired backend) | includes database-expert: **no**

No schema change, no migration, no index decision, no new query shape — every database-shaped
consequence of the generator (the batch transaction and its savepoints, the `MAX_COMBINATIONS` cap, the
one-query duplicate pre-read, the lock-hold window) landed in
[0029b](done/0029b-product-variant-combination-generator-backend.md), which states plainly that its own
`includes database-expert: yes` *"stays yes and the generator is **not** why"*. This story calls one
already-specified action and renders the array it returns. `database-expert` is not convened, matching
0031's own unchanged classification and this project's FE/BE-pair convention (0024/0027, 0028/0030 —
the backend side's `yes` never propagates to its UI sibling, and it does not propagate to a sibling's
own follow-on split either).

**Hard dependency chain**: **[0029b](done/0029b-product-variant-combination-generator-backend.md)** (the
action this story calls) and **[0031](done/0031-product-variants-editor-ui.md)** (the component this story
composes onto) must both reach Phase 7 first. 0031's own chain (0019 → … → 0030 → 0031) is inherited
transitively; nothing here shortens or lengthens it beyond adding 0029b and 0031 themselves as direct
blockers.

## Three Amigos participants

**Not a fresh Phase 1 debate.** This story's entire content originates from two things: 0031's own
2026-08-18 Three Amigos debate (`frontend-expert` + `frontend-qa`, facilitated by `product-owner`) and
its 2026-08-19 amendment binding to the PO's decision to bring the generator in scope — both of which
already produced every decision below, argued in full, executed against the real repository — plus this
Phase 2 INVEST split itself (2026-09-06), which is bookkeeping, not a design change. No specialist was
re-convened: nothing in the split changes an axis-picker decision, a summary-panel decision or a
pagination decision that was not already made and verified. See [Provenance](#provenance) for exactly
which parts of the original debate this file inherits and how they map onto this story's own decision
numbering (unchanged — **D-17**, **D-17.1**–**D-17.5** — see the note there on why the numbers were kept
rather than renumbered).

## PRD coverage

🔴 **This capability is deliberately *not* PRD-derived**, and saying so is more honest than retro-fitting
a scenario to it: the **cartesian generator** is a **PO decision taken on 2026-08-19**, above the PRD
rather than out of it. **FE-V12** ([PRD §2.2](../../docs/PRD/PRD.md#22-products)'s only creation scenario
is singular — *"When they **generate the variant** 'Size 40 / Color Black'"*) remains true, so the
generator is scope the PO added, and the twelve Gherkin scenarios under *"Generating every combination at
once"* below are **new acceptance criteria this story authors**, not a rendering of existing PRD text.
Whoever reconciles the PRD later should add the bulk scenario there rather than assume it was missed
here.

**Not covered here** (each names its owner): the derivation formula, the combination hash, the collision
matrix, the cross-table SKU checks, the referential-integrity FKs (**0029**); the generator's own outcome
semantics, transaction shape, savepoint isolation and batch cap (**[0029b](done/0029b-product-variant-combination-generator-backend.md)**);
the single-variant builder, its SKU preview, its image inheritance and its own refusal rendering
(**[0031](done/0031-product-variants-editor-ui.md)**); the attribute taxonomy screen (**0030**); the product's
own fields, list and delete (**0027**); the gallery's own mechanics (**0019**/**0020**).

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. Moved verbatim
from 0031's own Gherkin block, unedited, at the 2026-09-06 split.

```gherkin
Feature: Generating every combination at once

  Scenario: Generating across one attribute type creates one variant per value
    Given a catalog administrator editing the product "0002" with the attribute type Talla holding the values 38, 39 and 40, and no variants yet
    When they generate the combinations for the attribute type Talla
    Then the product is listed with the three variants "0002-38", "0002-39" and "0002-40"

  Scenario: The generation summary reports what was created
    Given a catalog administrator editing the product "0002" with the attribute types Talla (38, 39) and Color (Black, White), and no variants yet
    When they generate the combinations for the attribute types Talla and Color
    Then a summary panel reports that four variants were created

  Scenario: Generating a second time skips the combinations that already exist
    Given a catalog administrator editing the product "0002" with the attribute type Talla holding 38, 39 and 40, already holding the Talla 38 variant
    When they generate the combinations for the attribute type Talla again
    Then the summary panel reports two variants created and one combination already existing

  Scenario: A skipped combination leaves the variant it matched untouched
    Given a catalog administrator editing the product "0002" whose Talla 38 variant is priced at 5.00 with 7 in stock
    When they generate the combinations for the attribute type Talla again
    Then the Talla 38 variant is still priced at 5.00 with 7 in stock

  Scenario: A refused combination is reported by name without blocking the rest of the batch
    Given a catalog administrator editing the product "0002" with the attribute type Talla holding 38 and 39, and another product in the catalog already using the SKU "0002-39"
    When they generate the combinations for the attribute type Talla
    Then the summary panel reports one variant created and lists the Talla 39 combination as refused, naming the product that holds that SKU

  Scenario: The variants the batch did create are listed even though one was refused
    Given a catalog administrator who has just generated a batch in which one combination was refused
    When they read the variants table
    Then every created variant is listed and the refused combination is absent from it

  Scenario: The administrator chooses which attribute types to generate across
    Given a catalog administrator editing a product, with the attribute types Talla, Color and Acabado in the catalog
    When they open the generate-combinations control
    Then each attribute type is offered as a checkbox and the number of combinations the current selection would produce is shown

  Scenario: The attribute types already used by the product are pre-selected
    Given a catalog administrator editing a product whose existing variants use the attribute types Talla and Color, with Acabado also in the catalog
    When they open the generate-combinations control
    Then Talla and Color are pre-selected and Acabado is not

  Scenario: A selection larger than the batch limit is refused before anything is written
    Given a catalog administrator editing a product, with a selection of attribute types that would produce more combinations than the batch limit allows
    When they generate the combinations for those attribute types
    Then the generation is refused with a message stating the limit and the product holds no new variant

  Scenario: An attribute type with no values is refused by name
    Given a catalog administrator editing a product, with the attribute type Color holding no values
    When they generate the combinations for the attribute types Talla and Color
    Then the generation is refused with a message naming Color and the product holds no new variant

  Scenario: Generating nothing is refused
    Given a catalog administrator editing a product, with the generate-combinations control open
    When they generate the combinations with no attribute type selected
    Then the generation is refused with a message asking for at least one attribute type

  Scenario: The summary survives the control closing
    Given a catalog administrator who has just generated a batch of combinations
    When the generate-combinations control closes
    Then the summary is still readable above the variants table

  Scenario: An administrator without the products edit permission cannot generate combinations
    Given a signed-in administrator who does not hold the products edit permission
    When they submit a generation for a product
    Then the generation is refused and the product holds no new variant
```

## Documented functional decisions

> 🟠 **Numbering carried over unchanged from 0031, not renumbered — deliberate, following
> [0029b](done/0029b-product-variant-combination-generator-backend.md)'s own precedent for exactly this
> kind of split.** 0029b renumbered 0029's D-18.1–D-18.7 to D-G1–D-G7 because 0029 kept its own D-1–D-17
> numbers occupied by other, still-live decisions. 0031's situation is different: D-17 was the *last*
> top-level decision in the file and nothing after it reuses the number, so 0031's own text — the top-of-
> file amendment, the OQ-2/OQ-6 resolution table, the Files table, the Provenance section — already links
> to `D-17`, `D-17.1`, `D-17.2`, `D-17.4` by these exact names, written before this file existed. Keeping
> the numbers here is what makes every one of those existing links resolve without also having to hunt
> down and rewrite each one across 0031's own history. Read `D-17.x` in this file exactly as 0031 always
> meant it.

### D-17 — The cartesian generator UI

An administrator with a product offering Talla (38, 39, 40) and Color (Black, White) generates all six
combinations in one gesture instead of building six variants by hand. The gesture has exactly three
beats — **pick the axes**, **confirm**, **read what happened** — and each of the three is decided below,
because the third is the one a naïve implementation drops.

**Where the trigger lives.** A **secondary** `flux:button` in the variants section header, beside 0031's
existing primary "Añadir variante": `products.variants.generate.trigger` — *"Generar combinaciones"*. It
is secondary rather than primary because the single-variant path stays the default gesture (**FE-V12**:
the PRD's only creation scenario is still singular), and it sits in the header rather than in the create
form because it is an **alternative** to that form, not a mode of it. It renders `disabled` on the same
`$canManageVariants` computed [0031's D-10 note 4](done/0031-product-variants-editor-ui.md#d-10--authorization-gates-against-the-parent-product-once-with-no-per-row-matrix)
already establishes — one policy read, not a second one — and, when the catalog holds no attribute types,
it is absent entirely rather than disabled, because the "no attribute types" empty state already explains
the dead end and two explanations of one fact is worse than one.

### D-17.1 — The axis picker: a checkbox list of attribute types, pre-selected from the product's own

**Container: a `flux:modal`, and it is safe here for a reason `flux:modal` was rejected in 0031's D-12.**

| | ✅ **Modal** | Inline panel (as 0031's D-12) | A second route |
| --- | --- | --- | --- |
| Nested `<dialog>` risk (0031's **T10**) | **none** — the picker opens **no media gallery**, so the one hazard D-12 refused to bet on does not exist on this path | none | none |
| Reads as a discrete, confirmable gesture | ✅ up to `MAX_COMBINATIONS` rows are about to be written | 🔴 an inline panel beside another inline form reads as a second form; the administrator can plausibly fill in both | ✅ |
| Competes with the create form | ✅ modal state is exclusive by construction | 🔴 two open panels, two "Guardar"-ish buttons | n/a |
| Cost | `flux:modal` is already on this screen for the delete confirmation | none | 🔴 a route, middleware, a docs row — 0031's D-1 rejected this shape once already |

So 0031's D-12 rule is not being broken, it is being applied: the form that opens the Gallery stays
inline; the control that opens nothing may be a modal. State the reason in the view comment, or the next
reader will read the two as inconsistent. 0031's **T11** applies unchanged — the modal's inner content is
wrapped in `@if ($showGenerateModal)` so only one Cancel control is ever in the DOM.

**The picker itself: a checkbox list of attribute types, ordered `(position ASC, id ASC)`.**

- **Ordered by `position`, not by name**, because that is the order
  [0029b's **D-G6**](done/0029b-product-variant-combination-generator-backend.md#d-g6--input-rules-and-the-ordering-of-what-gets-generated-0029s-d-186)
  generates in and the order the derived SKU reads in (0029's **D-4.2**). The list therefore previews the
  shape of the output for free, which is the same argument 0031's D-2 makes for the row repeater's type
  select.
- 🔴 **The bound property is named `attributeTypeIds` — exactly 0029b's bag key.** This is the *one*
  place on this whole screen (0031 included) where **FE-V4** works **for** us: a Flux field auto-renders
  an error whose key equals its `wire:model` path, so naming the property after the key makes
  `.too_many`, `.empty_type` and the array rules render without an explicit `flux:error`. Do not rename
  it to `generateTypeIds` or `selectedTypeIds` for readability — the name **is** the wiring. It is
  `public array $attributeTypeIds = [];`, and every element is a **string** id (0031's **T1** discipline
  extends to checkbox arrays: an element is present or absent, never `null`).
- **Pre-selected from the types this product's existing variants already use** — the mitigation 0031's
  D-3 last paragraph recommended, now doing double duty. It reads from data 0031's builder already loads
  for the variants list (`values.type`, 0031's D-6), so it costs **zero extra queries**, and it makes the
  overwhelmingly common second run — *"I added a colour, generate the rest"*, which is the case
  [0029b's D-G2](done/0029b-product-variant-combination-generator-backend.md#d-g2--outcome-semantics-skip-silently-in-the-data-report-loudly-in-the-summary-0029s-d-182)
  built "skip existing" for — a two-click gesture. For a product with no variants yet, nothing is
  pre-selected and the administrator picks.
- **Every type in the catalog is offered, not only the pre-selected ones.** 0029b's D-G6 is explicit that
  *"the selected types need not be 'offered by' the product"* — there is no declaration table — so
  restricting the list would invent a constraint the backend does not have. The `max:5` array rule is the
  only ceiling, and it is the server's.
- *Rejected:* [0022](done/0022-searchable-multi-select-component.md)'s searchable multi-select, on 0031's
  D-2's grounds unchanged (a bare-id selection with no group structure), plus one specific to this
  control: the count preview below needs the **value count per selected type**, which a component
  returning bare ids cannot supply without a second query.
- *Rejected:* generating across **all** types with no picker. Simpler, and wrong at the first product
  that does not vary along every axis in the catalog — it would produce a cartesian product over
  unrelated types (Talla × Color × Acabado × Material) that trips `MAX_COMBINATIONS` on a catalog with
  five types and nothing unusual about it.

**A live combination count, and deliberately no disabled button.** A `#[Computed]` multiplies the
selected types' value counts — again from already-loaded data, zero extra queries — and renders
`products.variants.generate.count` (*":count combinaciones"*) beside the confirm button. When it exceeds
`MAX_COMBINATIONS` an inline `flux:callout variant="warning"` names the limit **and the count**, mirroring
0029b's own `.too_many` copy. The confirm button is **not** disabled in that state, for two independent
reasons: the server rule stays the single authority (the same posture 0031's D-13 takes for the price
input, and the count is a client-visible estimate of a set the server re-reads under 0029's **V-10**), and
a disabled button drags in 0031's **T3** and **T4** for a state the administrator can fix in one click
anyway.

### D-17.2 — The confirmed action surface this component calls

🔴 **Only the generator's own signature — the other three variant actions' confirmed signatures are
0031's own [D-13a](done/0031-product-variants-editor-ui.md#d-13a--the-confirmed-action-surface-this-component-calls-single-variant-actions),
not repeated here.**
[0029 **D-17.1**](done/0029-product-variants-backend.md#d-171--the-action-signatures--three-since-the-generators-moved-to-0029b)
closes 0031's OQ-3(c) for all four actions; this section carries only the fourth:

```php
// injected per method, per code-style.md's per-method action-injection convention
GenerateProductVariantCombinations::__invoke(Product $product, array $productAttributeTypeIds): array;
```

🔴 **The generator is `GenerateProductVariantCombinations`, not `GenerateProductVariants`.** The shorter
name appears in 0031's superseded D-3 and its OQ-2(b) as that story's own guess, before 0029's Definition
of Done called the divergence out by name. Use the real one everywhere.

**None of the four variant actions authorizes** — 0029's **D-12** unchanged (all four are self-authorizing
per 0029's own **D-12.1** since Phase 2, matching 0031's own D-10 correction — this is defence in depth,
not the only layer), and the generator adds a **seventh** gated method to
[0031's D-10](done/0031-product-variants-editor-ui.md#d-10--authorization-gates-against-the-parent-product-once-with-no-per-row-matrix)'s
list:

```php
public function generateCombinations(GenerateProductVariantCombinations $generate): void
{
    Gate::authorize('update', $this->product());   // update, per OQ-1 — same ability as create
    // …validate attributeTypeIds, call, store the summary, close the modal
}
```

### D-17.3 — The result summary: an inline panel above the table, not a flash and not the modal

**Decision: the modal closes on a successful call and the summary renders as a dismissible
`flux:card` between the section header and the variants table.** Three shapes were weighed:

| | ✅ **Inline summary panel** | A flash / `flux:toast` | Keep the result in the modal |
| --- | --- | --- | --- |
| Can carry a **per-row** `refused` list | ✅ each row has a `label`, a `sku` **and** a `message` naming the conflicting record | 🔴 **structurally cannot** — a flash is one string, and up to `MAX_COMBINATIONS` outcomes do not fit in one | ✅ |
| Readable **while looking at the table it changed** | ✅ | ✅ but it disappears on a timer | 🔴 the modal covers the table; the administrator must dismiss the result to see the rows |
| Survives the next Livewire round trip | ✅ a `#[Locked]` property, cleared only on dismiss or on the next generation | 🔴 a session flash is consumed on the next render | n/a |
| Precedent | this repo has no toast primitive in Flux Free (0031's **FE-V3** neighbourhood) | 🔴 would be the codebase's first | — |

**The panel's exact content**, driven by
[0029b's D-G1](done/0029b-product-variant-combination-generator-backend.md#d-g1--signature-and-return-shape-0029s-d-181)'s
array shape and nothing else:

- **The headline sentence is 0029b's, not this story's.** `products.variants.generate.summary` is a
  `trans_choice` over the created count interpolating `:skipped` and `:refused`, and it lives in the
  action's own key space *"because the **action** owns the outcome vocabulary"*. This story renders it;
  it must **not** compose an equivalent sentence out of three separate keys.
- **`created`** — the count only. The rows themselves are now in the table directly beneath, so listing
  them twice is noise; the table is re-read from the database (0031's **D-5 R1**), never appended from
  the returned collection.
- **`skipped`** — the count, plus each combination's `label` in a collapsed list. These are **not
  errors** and must not be styled as such: an administrator who generated deliberately over an existing
  set expects them. Neutral `flux:badge color="zinc"`, matching the *Heredada* precedent in 0031's D-6.
- **`refused`** — 🔴 **always expanded, one row each, never collapsed and never a count alone.** Each
  renders its `label`, its derived `sku` and 0029b's `message` — which already names the conflicting
  record — plus 0031's D-8's `products.variants.sku.remedy_hint`, because the remedy is identical to the
  single-variant path's and the administrator cannot retype a derived SKU on either. `flux:callout
  variant="danger"` around the group.
- **`attempted`** is rendered only when it disagrees with `created + skipped + refused`, which it never
  should. It is a reconciliation figure; showing it unconditionally invites the administrator to do
  arithmetic that is the code's job.

**When the whole call is refused** — over the cap, an empty type, no type selected — there is **no
summary at all**: the modal stays **open** with the error rendered on `attributeTypeIds` (**D-17.1**),
because nothing was written and the administrator's next action is to change the selection. A summary
panel reporting "0 created" for a refused call would be a lie about a batch that never ran.

### D-17.4 — The pagination consequence

🔴 **The generator can put 200 rows into a table 0031 shipped assuming it would hold a handful.** Every
other pagination consequence — the mechanism, the total order, the `#[Computed]`-returns-a-paginator
shape, the page size — is decided **in 0031 itself**, as its own
[D-17](done/0031-product-variants-editor-ui.md#d-17--pagination-kept-from-the-old-d-174-because-it-is-not-generator-specific):
it is not generator-specific (needed the moment a product accumulates more than ~25 variants at all), and
retrofitting it after the component's public surface is set is the expensive path 0027's own **D-4**
already argues against.

**The one thing that *is* generator-specific, and the only reason this subsection exists at all**: **a
freshly generated batch lands where the administrator expects it.**
[0029b's D-G6](done/0029b-product-variant-combination-generator-backend.md#d-g6--input-rules-and-the-ordering-of-what-gets-generated-0029s-d-186)
assigns `position` as `MAX(position) + 1` in cartesian order, so a generated set is contiguous and in SKU
order rather than scattered by insert timing — which means it lands as a contiguous run on whichever
page(s) of 0031's paginated list its position falls on, with no special-casing needed on this side to
make that true.

### D-17.5 — OQ-6 resolved: this section references 0031's D-16a rather than re-arguing it

[OQ-6](done/0031-product-variants-editor-ui.md#open-questions) (whether `position` ships on variants, and
whether it needs a manual reorder control) is **resolved in full in 0031's own
[D-16a](done/0031-product-variants-editor-ui.md#d-16a--oq-6-resolved-variant-row-order-and-images-need-no-reorder-control-in-v1)** —
both the variant-image half (does not apply: a variant has exactly one optional image, so there is
nothing to reorder) and the variant-row-order half (`position` ships, is written in a useful order, gets
no manual control in v1). Neither half is generator-specific, and D-16a says so explicitly: `position`
already has a real, useful writer the moment a single variant is created
(`CreateProductVariant`'s own `MAX(position) + 1`), with or without this story ever shipping.

**What this story adds to that reasoning, and it is the only thing it adds**: if this generator ships
alongside 0031's single-variant builder, it becomes a **second** writer of `position`, in its own useful
cartesian order (0029b's **D-G6**) — which is exactly **D-17.4**'s one generator-specific consequence
above. This story ships **no reorder affordance of any kind**, for the identical reasons D-16a already
gives in full; do not re-argue them here, and do not call `UpdateProductVariant`'s `?int $position` N
times to fake a reorder — that is the pairwise-swap corruption 0029's **D-8** forbids.

### D-15 — Translation keys

`lang/en/products.php` and `lang/es/products.php` are **extended, never recreated**, key-for-key
identical — this story is products.php's **eighth** writer (0024 creates; 0025–0029, 0031 extend).

**Already owned by [0029b](done/0029b-product-variant-combination-generator-backend.md) — do not
duplicate:** `products.variants.generate.empty_type` (naming the type),
`products.variants.generate.too_many` (interpolating `:limit` and `:attempted`) and
`products.variants.generate.summary` — the last being *"the sentence this story renders"*, a
`trans_choice` over the created count interpolating `:skipped` and `:refused`. These live in 0029b's key
space *"because the **action** owns the outcome vocabulary"* — **D-17.3**'s panel renders that key and
must not reassemble the sentence from parts.

**New here** (this story owns every leaf that labels a **control**; 0029b owns every leaf that describes
an **outcome** — see 0031's own D-15 for the split rule stated in full):

```
products.variants.generate.trigger                    ← the header button
products.variants.generate.modal_title | .intro
products.variants.generate.types_legend | .types_help ← the checkbox fieldset
products.variants.generate.count (:count)             ← the live combination count, D-17.1
products.variants.generate.over_limit (:count, :limit)← the pre-flight warning callout
products.variants.generate.confirm | .cancel
products.variants.generate.result_title               ← the summary panel, D-17.3
products.variants.generate.result_skipped (:count) | .result_refused (:count)
products.variants.generate.result_dismiss
products.variants.generate.no_types_selected          ← the client-side companion to 0029b's array rule
```

## Scope fences: what this story must NOT do

- **No migration, model, action, policy, enum, factory, seeder, validation rule or permission-catalog
  change.** Every one is consumed as shipped (0029's **D-12**: no new permission string, no
  `RolePermissionSeeder` edit).
- **No dry-run/preview seam.** [0029b's D-G7](done/0029b-product-variant-combination-generator-backend.md#d-g7--what-the-generator-deliberately-does-not-do-0029s-d-187)
  declines it, leaving it as 0031's own [OQ-5](done/0031-product-variants-editor-ui.md#open-questions).
- **No all-or-nothing batch semantics re-imposed from the UI.** The per-row outcome contract (created /
  skipped / refused) is 0029b's and is rendered as-is, never re-ordered or softened.
- **No "regenerate and overwrite" affordance of any kind.** 0029b's D-G7 rejects it outright as *"a
  data-loss bug wearing a convenience label"* — a skipped combination's existing variant is never
  re-priced or re-stocked by this UI.
- **No delete-missing sync mode.** Variants are hard-deleted (0029's **D-6**, no `SoftDeletes`); a sync
  that deletes what a selection no longer covers is unrecoverable by construction.
- **No `product_product_attribute_type` declaration table.** 0029's OQ-5a survives; the axes are
  transient UI state, read fresh from the picker's own selection on every call.
- **No re-implementation of any outcome semantic.** `skipped`, `refused`, `created` and `attempted` are
  read from 0029b's returned array and rendered. This story does not re-query to recompute them, does not
  re-derive a refused row's SKU to "check", and does not turn a `skipped` into an update.
- **No reorder control of any kind** — see **D-17.5** and 0031's own **D-16a**.
- **No second Livewire component.** The generator's state and methods land on 0031's own
  `App\Livewire\Products\VariantBuilder` class and view — see [Description](#description).
- **No new route, no sidebar entry, no `docs/api/routes.md` row.**
- **No changes to the single-variant builder's own decisions** (SKU preview, image inheritance, refusal
  rendering, authorization gates) — all of those are 0031's, unchanged by this story.
- **No re-running of a dependency's own suite**: not 0029's derivation/hash/collision/FK tests, not
  0029b's cartesian-expansion/savepoint/cap tests, not 0031's single-variant builder suite
  ([what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)).

## Files to create/modify

### Creates

| Path | What & why |
| --- | --- |
| `tests/Feature/Products/VariantBuilderGeneratorTest.php` | see [Tests to perform](#tests-to-perform) |

### Modifies

| Path | What & why | Owner |
| --- | --- | --- |
| `app/Livewire/Products/VariantBuilder.php` | Adds `public array $attributeTypeIds = []`, `#[Locked] public ?array $generationSummary = null`, `public bool $showGenerateModal = false`, the `generateCombinations()` method (a **seventh** gated method — **D-17.2**), and `use WithPagination` if 0031 has not already added it for its own pagination decision. **Same class 0031 creates and owns** — this story never creates a second component. | 0031 |
| `resources/views/livewire/products/variant-builder.blade.php` | Adds the trigger button, the axis-picker modal (**D-17.1**) and the result summary panel (**D-17.3**) to 0031's existing view. | 0031 |
| `tests/Browser/Products/VariantBuilderTest.php` | Appends **B9** and **B10** (see [Tests to perform](#tests-to-perform)) to 0031's existing browser file — no new file. | 0031 |
| `lang/en/products.php`, `lang/es/products.php` | **Extend** with the eleven `products.variants.generate.*` **control** keys (0029b already owns the three **outcome** keys — `.empty_type`, `.too_many`, `.summary`; see the split rule in 0031's own D-15). Key-for-key identical. | 0024 creates |

### Explicitly **not** touched

`database/migrations/**` · `app/Models/ProductVariant.php` ·
`app/Actions/Products/GenerateProductVariantCombinations.php` (**called, never written or edited** — its
cap, its transaction shape and its summary contract are 0029b's) ·
`app/Actions/Products/{Create,Update,Delete}ProductVariant.php` ·
`app/Concerns/ProductVariantValidationRules.php` · `app/Policies/ProductPolicy.php` (all **0029**) ·
`routes/**` · `database/seeders/RolePermissionSeeder.php` ·
`tests/Feature/Products/VariantBuilder{Test,SkuPreviewTest,RenderingTest,QueryTest,AuthorizationTest}.php`
(**0031's own**, untouched by this story) · `docs/**` (Phase 6).

> ⚠️ **[Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule).**
> This story modifies four files 0031 creates (`VariantBuilder.php`, its view, its browser test file, and
> the shared `lang/*/products.php`). Its Phase 3 must **never** be dispatched in the same batch as 0031
> — **including 0031's own verification steps** — which the sequencing (0031 must reach Phase 7 first)
> already guarantees is not needed, but is worth stating explicitly per the errors-log entry this rule
> exists to prevent from recurring.

## Tests to perform

**Layer rule, inherited from 0031's own Tests-to-perform header.** `tests/Feature/` (`Livewire::test()`)
owns everything provable from server state; `tests/Browser/` owns only what a real DOM, a real event loop
and real JS produce.

### `tests/Feature/Products/VariantBuilderGeneratorTest.php`

**Layer note that decides half of these cases.** 0029b owns the generator's *behaviour* — the cartesian
expansion, the skip-existing semantics, the savepoint isolation, the cap, the empty-type refusal, the
per-variant price/stock. Re-testing any of that here is exactly what
[what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md) forbids. **What is only provable here is
that the UI passes the right axes in and renders the right summary out** — plus the one thing no backend
test can reach, that a partial batch's `refused` rows are *visible*.

- [ ] The axis picker is **pre-selected from the types this product's existing variants already use**,
      and a type in the catalog that no variant uses is offered **unchecked**. Both halves in one test —
      asserting only the pre-selection passes against an implementation that checks everything.
- [ ] A product with **no** variants pre-selects **nothing**, and the picker still lists every type.
- [ ] The live count multiplies the selected types' value counts, asserted for a **two-type** selection
      whose factors differ (3 × 2 = 6, never 2 × 2 — a squared fixture passes against an
      implementation that sums, adds, or reads one factor twice).
- [ ] 🔴 **The component passes exactly the checked type ids** to
      `GenerateProductVariantCombinations`, in the order the picker renders. Assert against the
      **action's recorded arguments** (a container-bound spy), not against the resulting variants —
      the resulting variants are the same for several wrong inputs.
- [ ] A successful call **closes the modal** and leaves the summary panel rendered.
- [ ] The summary renders `products.variants.generate.summary` with the created count, `:skipped` and
      `:refused` — asserted via `trans_choice`, never a hardcoded English sentence (**FP-V15**, 0031's
      own).
- [ ] 🔴 **A refused row renders its `label`, its `sku` and 0029b's `message` individually**, arranged so
      the batch has **one refused and at least two created** rows: assert the two created variants
      **exist in the database**, the refused combination **does not**, and the refused row is
      **visible** on screen. This is the UI half of *"reported individually without blocking the rest"*
      and it is the single highest-value case in this file.
- [ ] **A skipped row is not styled as an error**: assert the skipped group renders **outside** the
      `flux:callout variant="danger"` that wraps `refused`.
- [ ] 🔴 **A skipped combination's existing variant is untouched** — arrange the existing variant with a
      non-default price **and** stock, generate again, assert **both** are byte-identical afterwards
      (`toBe('5.00')`, quoted, 0031's **T12**). 0029b guarantees this; this test proves the *UI* did not
      "helpfully" re-save it, which is a mistake only a component can make.
- [ ] **A wholly refused call renders no summary panel and leaves the modal open**, with the message on
      `attributeTypeIds` — one case per refusal: over the cap, an empty type, and nothing selected.
- [ ] **`attributeTypeIds` auto-renders** because the property name equals the bag key: assert the error
      appears **without** an explicit `flux:error` for it in the template (**D-17.1**). This is the one
      key on this screen where that is true, and a rename would silently break it.
- [ ] The summary is **cleared** by the next generation and by an explicit dismiss, and **survives** an
      unrelated round trip (opening the create form, changing a page) — **D-17.3**'s `#[Locked]`
      property, not a session flash.
- [ ] **Authorization pair for `generateCombinations()`**: allowed for an actor with `products.edit`,
      refused for one without — and the deny paired with **zero** new variant rows and **zero** pivot
      rows (0029's **FP5**: an exception raised after the write still throws).
- [ ] The trigger renders **disabled** from the same `$canManageVariants` computed the mutating path
      authorizes against, and is **absent entirely** when the catalog holds no attribute types.

### Assertions that would be false passes if written naively

Carried verbatim from 0031's own false-pass catalogue, moved here as its own group at the split.

**FP-V19 — the generator asserted by counting the variants it created.** *"Generate across Talla (38,
39, 40), assert 3 variants exist"* passes identically against a UI that ignored the checkboxes and
generated across every type in the catalog whenever the catalog holds exactly one type — which is what
a minimal fixture holds. Assert the **arguments handed to the action**, and use a fixture with **at
least one type deliberately left unchecked**.

**FP-V20 — a partial batch asserted by the summary counts alone.** `created: 2, refused: 1` is produced
both by the correct implementation and by one that renders the summary faithfully while writing nothing,
or while writing all three. Every partial-batch test asserts **three things**: the counts, the database
(the created rows exist, the refused combination does not), and the **rendered refused row**. This is
0029's **FP1** shape — a count is not a state.

**FP-V21 — the "skipped combination is untouched" test arranged on a default-priced variant.** If the
pre-existing variant carries the parent's price and `stock = 0` — which is exactly what a factory
default and a previous generation both produce — then a UI that wrongly re-saves it writes the same
values back and the test passes. Arrange the existing variant with a price **and** a stock that the
generator would never produce.

**FP-V22 — the summary panel asserted with a page-wide `assertSee` of a number.** *"8 creadas"* shares
a page with the variant count in the section header, the live combination count and every price in the
table. Scope every summary assertion to `[data-test=generate-summary]`, the same discipline 0031's own
**FP-V1** imposes on the SKU preview.

### `tests/Browser/Products/VariantBuilderTest.php` — appended cases

Deliberately few, per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md) and 0027
**R-6**, appended to 0031's own **B1**–**B8**.

- [ ] **B9 — the generate modal is a `<dialog>` that opens over the page and closes cleanly**, with the
      summary panel readable **after** it closes and the variants table visible behind it. This is
      **D-17.1**'s whole safety argument (no nested `<dialog>`, unlike the single-variant create form)
      and **D-17.3**'s "readable while looking at the table it changed" — both are DOM-layer claims that
      a component test cannot see.
- [ ] **B10 — the live combination count updates as checkboxes are toggled**, driven by genuine clicks.
      Same failure mode as 0031's own **B2**: a missing `.live` on the checkbox group is invisible to
      `Livewire::test()->set()` (0031's **FP-V4**) and produces a count that never moves.

### Explicitly not tested here

Per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md): the cartesian expansion, iteration
order, savepoint isolation, `MAX_COMBINATIONS`, the empty-type refusal, the one-query duplicate pre-read
and a generated variant's price/stock/NULL image (all
**[0029b](done/0029b-product-variant-combination-generator-backend.md)**'s); the single-variant builder's
own SKU preview, image inheritance and refusal rendering (**[0031](done/0031-product-variants-editor-ui.md)**'s).

## Expected outcome

Building variants one at a time is no longer the only way. A "Generar combinaciones" control in the
variants section header opens a modal listing the catalog's attribute types as checkboxes — pre-ticked
with the ones the product's variants already use — with a live count of how many combinations the
current selection would produce. Confirming it writes the whole cartesian product in one batch:
combinations the product already holds are **skipped without being touched**, a combination whose
derived SKU some other record already owns is **refused by name while the rest of the batch commits**,
and an inline summary panel above the table reports all three outcomes — *"8 variantes creadas, 2 ya
existían, 1 con SKU en conflicto"* — with every refused combination listed individually, naming the
conflicting record and the two remedies. The table beneath it — 0031's own paginated list — already shows
the rows the batch created.

Generating combinations authorizes against the **parent product** before it does anything, and an
administrator who may view but not edit sees the trigger rendered disabled with an explanation.

Structurally: `GenerateProductVariantCombinations` acquires its **first and only UI call site**, and
Epic 2's product arc closes.

## Acceptance criteria

- [ ] A "Generar combinaciones" control writes the full cartesian product of the selected attribute
      types through `GenerateProductVariantCombinations`, with the types pre-selected from the ones the
      product's variants already use, a live count of the resulting combinations, and **no price or
      stock asked for up front**.
- [ ] The generation summary is rendered from the action's returned array — created, skipped and
      refused — using 0029b's own `products.variants.generate.summary` key, as an inline panel that
      survives the modal closing; **each refused combination is listed individually** with its label,
      its derived SKU, 0029b's message and the remedy hint, while the rest of the batch is committed and
      listed in the table.
- [ ] A skipped combination's existing variant is not re-saved — its price and stock are byte-identical
      after a second generation — and **no "regenerate and overwrite" affordance exists**.
- [ ] A wholly refused generation (over the cap, an empty type, nothing selected) writes nothing, renders
      no summary panel, and leaves the modal open with the message on `attributeTypeIds`.
- [ ] `attributeTypeIds` auto-renders its own bag-key errors with no explicit `flux:error` in the
      template — the one key on this whole screen (0031 included) where the property name is
      deliberately chosen to equal the bag key.
- [ ] The trigger renders disabled from the same `$canManageVariants` computed 0031's mutating paths
      authorize against, and is absent entirely when the catalog holds no attribute types.
- [ ] Every one of the seven gated methods on `VariantBuilder` — the six 0031 ships plus
      `generateCombinations` — calls `Gate::authorize()` against the parent product as its first
      statement, with an allow and a deny test, each deny paired with its absent side effect.
- [ ] `lang/en/products.php` and `lang/es/products.php` are extended with the eleven control keys,
      key-for-key identically, and no user-facing string is hardcoded.
- [ ] No migration, model, action, policy, enum, validation rule, factory, seeder, route,
      permission-catalog change, or second Livewire component is added by this story.
- [ ] Pint clean and Larastan level 7 clean.

## Definition of Done

- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] `vendor/bin/pint --format agent` (unscoped) clean and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] **No security findings (appsec-auditor).** Point the audit at: (1) the `generateCombinations()`
      gate runs before validation, before the value-set read and before the transaction, on every path;
      (2) `attributeTypeIds` is validated the same two-pass shape 0029b's own trait methods expect, with
      no unbounded read-back; (3) the axis picker discloses no more than the type/value counts already
      visible to a `products.view` holder; (4) `@js()` encoding of every id in a `wire:*` argument in the
      new markup.
- [ ] **Documentation updated (docs-keeper).** `docs/api/routes.md`'s `products.edit` entry gains a note
      that the generator's modal is part of the same embedded builder (no new route, no new gallery
      instance — the generator opens no `media.gallery`); the [epic-2 digest](_digests/epic-2.md)
      gains a Story 0031a section recording the generator's UI call site.
- [ ] **Hand-offs discharged, recorded explicitly**: 0029's own Definition-of-Done items about the
      generator UI's action name (built against the correct, real `GenerateProductVariantCombinations`,
      never the guessed `GenerateProductVariants`) and about rendering the `created`/`skipped`/`refused`
      summary as a result table.
- [ ] Acceptance criteria met.

## Dependencies and risks

### Dependencies

- **[0029b](done/0029b-product-variant-combination-generator-backend.md) — hard, blocking, must reach
  Phase 7 first.** This story calls `GenerateProductVariantCombinations` and renders its returned array;
  neither exists until 0029b ships.
- **[0031](done/0031-product-variants-editor-ui.md) — hard, blocking, must reach Phase 7 first.** This story
  composes onto `App\Livewire\Products\VariantBuilder`, its view and its browser test file — none of
  which exist until 0031 ships. Sequenced immediately after 0031, per the Phase 2 split that produced
  this file.
- **What it consumes from 0029b, named exactly so the contract cannot drift**:
  `GenerateProductVariantCombinations`'s signature (**D-17.2**), its summary array shape (**D-G1**), its
  skip/refuse/create outcome semantics (**D-G2**), `MAX_COMBINATIONS` (**D-G5**), and the
  `products.variants.generate.{empty_type,too_many,summary}` translation keys.
- **What it consumes from 0031**: the `App\Livewire\Products\VariantBuilder` class and its view, the
  `$canManageVariants` computed property, the paginated variants list (**D-17** in 0031), and
  `products.variants.sku.remedy_hint`.

### Risks

- **R-11 — the generator makes every "the table is small" assumption false at once.** Up to
  `MAX_COMBINATIONS` rows can appear in one gesture, each with a thumbnail, two badges and two row
  actions. 0031's own **D-17** (pagination) answers the query and ordering half, but three things are
  only provable at Phase 3: the **DOM weight** of a 25-row page with four Gallery instances already on
  it (0031's **R-4**), whether the **summary panel** stays readable when `refused` holds tens of rows,
  and the interaction between `wire:key` stability and a paginator on a `#[Computed]` list.
- **R-12 — the generator's happiest path is also its least tested one.** *"Generate across one type on
  a product with no variants"* produces a summary with an empty `skipped` and an empty `refused`, which
  is the fixture every naive test reaches for and the one that exercises none of **D-17.3**'s three
  groups. **FP-V19**–**FP-V22** exist for exactly this; the Phase 3 reviewer should check that at least
  one generator test arranges a batch with **all three** outcomes simultaneously.
- **R-13 — this story is a consumer of two contracts that land in earlier stories.** Everything under
  [Dependencies](#dependencies) is a seam either 0029b or 0031 could move. Mitigated by naming each
  consumed element explicitly rather than re-describing it, and by strict sequencing — but a change to
  either contract during its own Phase 3 silently invalidates a decision here.

## Open questions

**None blocking Phase 2.** [0031](done/0031-product-variants-editor-ui.md)'s own **OQ-2** (was the generator
in scope at all), **OQ-3** (the four 0029 contract gaps) and **OQ-6** (`position`/reorder) are all
already resolved and this story is built on their resolutions rather than re-opening them. **OQ-1**
(which ability gates variant create/delete) is 0031's own question, already accepted administratively
(2026-09-06) as `products.edit` for all three variant operations plus the generator, matching 0029's
shipped **D-12.1**. The ergonomic case for a pre-generate, advisory SKU-conflict check is narrower than
the single-variant case for the identical reason 0031's own **OQ-5** already gives (the post-hoc
`skipped`/`refused` summary reports every outcome after the fact, so nothing is half-written) — see that
question there rather than repeating it here; it is not this story's own open question.

## Provenance

Split out of [0031](done/0031-product-variants-editor-ui.md) on **2026-09-06**, at Phase 2, after
`code-reviewer` failed that story on INVEST **"Small"** — the finding, quoted:

> This story bundles two conceptually separable units into one: the single-variant builder (D-1–D-16, ~16
> decision sections, ~28 Gherkin scenarios, 6 test files) and the cartesian-generator UI (the old D-17 +
> 5 subsections, its own modal/axis-picker/summary/pagination, 1 dedicated test file with 15 cases, 2
> dedicated browser cases, 5 of ~20 acceptance-criteria bullets, 4 dedicated false-pass entries, a whole
> Gherkin feature of 12 scenarios). This is the same shape that made 0029 fail "Small" and split into
> 0029/0029a/0029b, and the generator half of that split (0029b) is the *exact same feature* this story's
> D-17 renders the UI for.

**Everything in this file is 0031's own content, carried over rather than re-debated.** The generator's
entire design — the modal container, the axis picker, the confirmed action surface, the result summary,
the pagination consequence, OQ-6's resolution — was decided in 0031's 2026-08-19 amendment, which itself
was 0031 binding to [0029's own 2026-08-19 amendment](done/0029-product-variants-backend.md#amendment--2026-08-19-four-contract-gap-fills-and-the-cartesian-generator)
plus the PO's explicit decision to bring the generator in scope. No new Three Amigos round was run for
either that amendment or this split — see [Three Amigos participants](#three-amigos-participants).

**What is genuinely new in this file, and it is bookkeeping rather than design**: the file itself; the
split-aware framing in [Description](#description), [Type](#type) and [Scope fences](#scope-fences-what-this-story-must-not-do);
**D-17.2**, narrowed to the generator's own signature now that the other three actions' signatures moved
to 0031's own **D-13a**; and **D-17.5**, rewritten from a five-paragraph resolution into a two-paragraph
pointer at 0031's own **D-16a**, per this project's convention (confirmed against
[0029b](done/0029b-product-variant-combination-generator-backend.md)'s own precedent of referencing a
sibling's decision rather than re-arguing it) that a decision genuinely shared between split siblings
lives in exactly one of them.

---

> **Link-integrity note for whoever moves this file.** Every relative link above is written for
> `ai-spec/tasks/` (two levels below the repo root). Moving this file to `in-progress/` or `done/` puts
> it **three** levels down and silently breaks all of them — `../../docs/...` must become
> `../../../docs/...`, and the sibling-task link (`0031-...md`) must become `../0031-...md` (or
> `done/0031-...md`, once 0031 itself has moved there). This is a mandatory step, not a nicety: see
> [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move) and the
> [errors-log entry](../../docs/errors-log.md) recording the files this already broke.
