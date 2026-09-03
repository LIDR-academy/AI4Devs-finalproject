# [0031] Product variants — the variant builder inside the product editor (UI)

## Description
Build the **variant builder** embedded in [0027](0027-products-list-and-editor-ui.md)'s routed product
editor: a list of the product's existing variants and a form that composes one attribute-value
combination at a time, each variant carrying its **live-previewed, read-only, derived SKU**, its own
price and stock, and an **optional** own image picked through the shared media gallery
([0020](done/0020-shared-media-gallery-modal-ui.md), single-select) that falls back to the parent product's
featured image when unset.

It is **frontend only**: no migration, no model, no action, no policy, no validation rule. Every one of
those is consumed as already-shipped code from [0029](0029-product-variants-backend.md) (variant
persistence, the SKU derivation, the duplicate-combination rule, read-time image inheritance, and —
since 0029's 2026-08-19 amendment — the **cartesian combination generator**) and
[0028](0028-product-attribute-types-and-values-backend.md) (the attribute taxonomy). This story is
where 0029's eleven zero-call-site deliverables — **four** actions (`CreateProductVariant`,
`UpdateProductVariant`, `DeleteProductVariant`, `GenerateProductVariantCombinations`),
`ProductVariant`, `VariantSku`, `VariantCombination`, and `ProductPolicy`'s newly-widened coverage —
acquire their **only** caller and their **only** enforcement path.

> 🔴 **The single most important fact about this screen, and the one most likely to be built wrong:
> a variant's SKU is not an input.** 0029 was substantially redesigned on 2026-08-18
> ([its D-4](0029-product-variants-backend.md#d-4--sku-is-derived-from-the-parent-products-sku-and-the-variants-attribute-values)):
> the SKU is **computed** as `{product.sku}` followed by each attribute value with whitespace runs
> collapsed to a single hyphen and casing preserved, appended in
> `(type.position, type.id, value.position, value.id)` order. `0001` + Talla `M` → `0001-M`;
> `0002` + Color `azul marino` + Talla `L` → `0002-azul-marino-L`. There is **no SKU field**, no
> disabled input, no hidden field, and no public property named `sku` on this component. The builder
> **previews** the value live as the administrator picks values, and **displays** the stored value for
> saved variants — two different sources that must never be confused ([D-4](#d-4--the-live-sku-preview-is-a-server-side-computed-never-a-property-and-never-client-side)).

## Type
frontend | fullstack (related_task_id: **0029** — product variants backend, whose paired UI this is) |
includes database-expert: **no**

No schema change, no migration, no index decision, no new query shape beyond two eager loads over
tables 0029 designed. `database-expert` is therefore not convened, matching
[0025](done/0025-product-categories-ui.md)'s and [0027](0027-products-list-and-editor-ui.md)'s precedent for
the sibling screens.

> 🟣 **The classification is unchanged by the 2026-08-19 generator decision, and this is stated
> explicitly so nobody re-classifies it by association.** [OQ-2](#open-questions) resolved **in scope**
> and 0029 now ships `GenerateProductVariantCombinations` ([its D-18](0029-product-variants-backend.md#d-18--the-cartesian-combination-generator)),
> but **every** database-shaped consequence of that decision landed in **0029**, not here: the batch
> transaction and its savepoints, the `MAX_COMBINATIONS` cap, the one-query duplicate pre-read served
> by the existing `unique(product_id, combination_hash)`, and the lock-hold window. 0029 itself records
> that its own `includes database-expert: yes` *"stays yes and the generator is **not** why"*. This
> story calls one already-specified action and renders the array it returns. **No new table, column,
> index, migration, seeder or query shape is introduced here** — see
> [D-17](#d-17--the-cartesian-generator-ui-oq-2-resolved-in-scope).
>
> The one genuinely new UI-side consequence is **pagination** — a capped batch is still up to
> `MAX_COMBINATIONS` rows arriving in the table at once — and that is a Livewire/Blade decision taken in
> [D-17.4](#d-174--the-pagination-consequence-decided-here-because-retrofitting-it-is-the-expensive-path),
> not a database one. `0031` stays **`includes database-expert: no`**; `0029`'s `yes` does not
> propagate across the FE/BE pair, and never has (0024/0027 and 0028/0030 are the same shape).

**Hard dependency chain, longer than `related_task_id` suggests.** This story cannot start until
**0019 → 0020 → 0021 → 0022 → 0023 → 0024 → 0026 → 0027 → 0028 → 0029 → 0030** are all closed.
`related_task_id` correctly names the FE/BE pair (0029); 0027 and 0020 are hard blockers from other
pairs, and 0028/0030 supply the taxonomy this screen reads. This is the **last** story of Epic 2's
products arc and therefore the one with the longest chain in the project.

## Three Amigos participants

`product-owner` (lead) + `frontend-expert` (files and approach) + `frontend-qa` (test design), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate)'s
[task classification rule](../../docs/workflow.md#task-classification-rule).

Both specialists were convened as subagents and **both delivered in full**, each executing its claims
against this repository rather than reasoning about them — every **V-** finding below is a command
result. `product-owner` then reconciled the two contributions, which **converged on every major
decision but split on one** ([D-2](#d-2--the-combination-is-composed-in-a-keyed-repeater-of-paired-selects-the-one-place-the-two-specialists-split)),
and contributed three findings of its own. See [Provenance](#provenance) for exactly which role covered
what.

## PRD coverage

Derived from [PRD §2.2 Products](../../docs/PRD/PRD.md#22-products)' *"Product variants (extends the
prototype)"* Gherkin block and [§2.3](../../docs/PRD/PRD.md#23-shared-media-gallery). This story is the
**screen half** of scenarios whose data half [0029](0029-product-variants-backend.md) already owns:

| PRD scenario / criterion | Owned here |
| --- | --- |
| *Create a variant as an attribute combination* → **"that variant has its own SKU, price, and stock"** | the builder's create form, the live SKU preview, and the rendered variants list. 0029 owns the persistence and the derivation. |
| *A variant without its own image inherits the parent's featured image* → **"When the variant is displayed"** | the rendered inheritance, including the badge that distinguishes it from an own image. The PRD's `When` is literally a *display* verb, so this scenario is **only** satisfiable here. |
| *A variant with its own image uses that image* | same. |
| *A duplicate attribute combination is rejected* | the builder rendering the refusal legibly. 0029 owns the rule. |
| Products AC 3 (*"each variant combination has its own SKU/price/stock and an optional image that inherits the parent's"*) — **rendered** | the whole story. |
| Products AC 4 (*"duplicate variant combinations are rejected"*) — **rendered** | the refusal's visibility. |
| §2.3 / Products AC 6 (*"product and variant images come from the shared media gallery"*) — **rendered** | the fourth `media.gallery` embed on the editor page. |

> 🟣 **One capability on this screen is deliberately *not* PRD-derived**, and saying so is more honest
> than retro-fitting a scenario to it: the **cartesian generator** (**D-17**) is a **PO decision taken
> on 2026-08-19**, above the PRD rather than out of it. **FE-V12** remains true — §2.2's only creation
> scenario is singular — so the generator is scope the PO added, and the twelve Gherkin scenarios under
> *"Generating every combination at once"* are **new acceptance criteria this story authors**, not a
> rendering of existing PRD text. Whoever reconciles the PRD later should add the bulk scenario there
> rather than assume it was missed here.

**Not covered here** (each names its owner): the derivation formula, the combination hash, the
collision matrix, the referential-integrity FKs and the two attribute in-use guards (**0029**); 🟣 the
generator's own outcome semantics, transaction shape and batch cap (**0029 D-18**); the
attribute taxonomy screen (**0030**); the product's own fields, list and delete (**0027**); the gallery's
own mechanics (**0019**/**0020**).

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. Glossary terms
(**attribute type**, **attribute value**, **combination**, **variant**, **derived SKU**, **catalog
administrator**) are taken from 0028/0029/0030; none is invented.

```gherkin
Feature: Building a product's variants

  Scenario: A single-attribute variant is listed with its derived SKU
    Given a catalog administrator editing the product "Camiseta" with the SKU "0001", with the attribute type Talla in the catalog
    When they add the variant for the Talla value "M"
    Then the variant is listed with the SKU "0001-M"

  Scenario: A multi-attribute variant reads in the attribute types' own configured order
    Given a catalog administrator editing the product "Pantalón" with the SKU "0002", with the attribute types ordered Acabado, Talla then Color
    When they add the variant for Acabado "Mate", Talla "L" and Color "azul marino"
    Then the variant is listed with the SKU "0002-Mate-L-azul-marino"

  Scenario: The order the values are chosen in does not change the derived SKU
    Given a catalog administrator editing the product "Pantalón" with the SKU "0002", with the attribute types ordered Acabado, Talla then Color
    When they add the variant choosing Color "azul marino" first, then Acabado "Mate", then Talla "L"
    Then the variant is listed with the SKU "0002-Mate-L-azul-marino"

  Scenario: The derived SKU is previewed before the variant is added
    Given a catalog administrator editing the product "Camiseta" with the SKU "0001", with the attribute type Talla in the catalog
    When they choose the Talla value "M"
    Then the SKU "0001-M" is previewed beside the combination

  Scenario: The preview shows the same transliteration the catalog will store
    Given a catalog administrator editing the product "Pantalón" with the SKU "0002", with the attribute type Color in the catalog
    When they choose the Color value "Marrón"
    Then the SKU "0002-Marron" is previewed

  Scenario: An empty combination previews no SKU
    Given a catalog administrator editing a product, with no attribute value chosen yet
    When they open the variant form
    Then no SKU is previewed and a placeholder is shown in its place

  Scenario: The administrator is never offered a SKU to type
    Given a catalog administrator editing a product that offers attribute types
    When they open the variant form
    Then the derived SKU is shown as read-only text and no SKU field is offered

  Scenario: A newly added variant is listed with the SKU the catalog stored
    Given a catalog administrator editing a product, with the previewed SKU on screen
    When they add that variant
    Then the listed SKU is the one recorded in the catalog rather than the previewed text

  Scenario: A variant's price is pre-filled from the product
    Given a catalog administrator editing a product priced at 119.95 EUR
    When they open the variant form
    Then the variant's price is pre-filled with 119.95

  Scenario: A product with no variants explains itself
    Given a catalog administrator editing a product that holds no variants
    When they open that product's editor
    Then an empty state is shown instead of an empty variants table

  Scenario: Variants are unavailable until the product exists
    Given a catalog administrator creating a brand-new product
    When they open the product editor
    Then the variant builder is replaced by a notice that the product must be saved first

  Scenario: A catalog with no attribute types explains the dead end
    Given a catalog administrator editing a product, with no attribute types defined in the catalog
    When they open that product's editor
    Then the builder explains that attribute types must be defined first and offers a way to reach them

Feature: Refusing a variant the catalog cannot accept

  Scenario: A duplicate attribute combination is refused
    Given a catalog administrator editing a product that already holds the variant "Talla M"
    When they add the combination "Talla M" to that same product again
    Then the save is refused with a duplicate-combination message and the product still holds one "Talla M" variant

  Scenario: A combination whose derived SKU a product already uses is refused
    Given a catalog administrator editing the product "0001", with another product in the catalog using the SKU "0001-M"
    When they add the variant for the Talla value "M"
    Then the save is refused with a message naming the product that holds that SKU

  Scenario: Two attribute values that reduce to the same SKU segment are refused
    Given a catalog administrator editing the product "0002" that already holds the Color "azul marino" variant
    When they add the variant for the Color value "azul-marino"
    Then the save is refused with a message naming the SKU both values produce

  Scenario: An attribute value that reduces to nothing is refused by name
    Given a catalog administrator editing a product, with an attribute type holding the value "★"
    When they add the variant for the value "★"
    Then the save is refused with a message naming that attribute value

  Scenario: A refusal names a remedy the administrator can act on
    Given a catalog administrator whose variant was refused for a SKU already in use
    When they read the refusal
    Then it names the conflicting record and tells them to change the product's SKU or rename the attribute value

  Scenario Outline: A refused variant leaves the catalog untouched
    Given a catalog administrator editing a product, arranged so that <refusal> will occur
    When they add the offending variant
    Then no variant and no attribute combination is recorded against that product

    Examples:
      | refusal                                |
      | a duplicate combination                |
      | a derived SKU a product already holds  |
      | an attribute value reducing to nothing |
      | a derived SKU longer than the limit    |

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

Feature: A variant's image

  Scenario: A variant with no image of its own shows the product's featured image
    Given a catalog administrator editing a product with a featured image, holding a variant that has no image of its own
    When they open that product's variants
    Then that variant shows the product's featured image marked as inherited

  Scenario: Changing the product's featured image changes what an inheriting variant shows
    Given a catalog administrator editing a product whose variant has no image of its own
    When they choose a different featured image for the product
    Then that variant shows the product's new featured image

  Scenario: A variant with its own image keeps it when the product's featured image changes
    Given a catalog administrator editing a product whose variant has its own image
    When they choose a different featured image for the product
    Then that variant still shows its own image

  Scenario: An image chosen for one variant does not reach another
    Given a catalog administrator editing a product holding the variants "Talla M" and "Talla L"
    When they choose an image from the media gallery for "Talla L"
    Then "Talla L" shows that image and "Talla M" is unchanged

  Scenario: An own image is reverted to the product's
    Given a catalog administrator editing a product whose variant has its own image
    When they revert that variant to the product's image
    Then the variant shows the product's featured image marked as inherited

  Scenario: An administrator without the media view permission still reaches the builder
    Given a signed-in catalog administrator who may edit products but may not view the media library
    When they open a product's variants
    Then the builder renders with the image picker shown disabled and an explanation

Feature: Changing and removing a variant

  Scenario: A variant's combination cannot be changed once it exists
    Given a catalog administrator editing a product that holds the variant "Talla M"
    When they open that variant to edit it
    Then its price, stock and image are editable and its attribute combination is shown as fixed

  Scenario: Removing a variant asks for confirmation naming it
    Given a catalog administrator editing a product that holds the variant "Talla M"
    When they choose to remove that variant
    Then a confirmation naming "Talla M" and its SKU is shown and the variant is still listed

  Scenario: The removal confirmation states that it cannot be undone
    Given a catalog administrator who has chosen to remove a variant
    When they read the confirmation
    Then it states that the removal is permanent

  Scenario: A removed combination can be built again immediately
    Given a catalog administrator who has just removed the "Talla M" variant from the product "0001"
    When they add the combination "Talla M" to that product again
    Then the variant is listed with the SKU "0001-M"

Feature: Permission to manage a product's variants

  Scenario: An administrator without the products view permission cannot open the editor
    Given a signed-in administrator who does not hold the products view permission
    When they request a product's editor
    Then access is refused

  Scenario: An administrator without the products edit permission cannot add a variant
    Given a signed-in administrator who does not hold the products edit permission
    When they submit a new variant for a product
    Then the submission is refused and the product holds no new variant

  Scenario: An administrator without the products edit permission cannot remove a variant
    Given a signed-in administrator who does not hold the products edit permission
    When they submit the removal of a variant
    Then the removal is refused and the variant is still in the catalog

  Scenario: A variant belonging to another product cannot be removed through this product's editor
    Given a catalog administrator permitted to edit the product "Camiseta" but not the product "Pantalón"
    When they submit the removal of a "Pantalón" variant from the "Camiseta" editor
    Then the removal is refused and that variant still belongs to "Pantalón"

  Scenario: An action the administrator may not perform is shown disabled
    Given a signed-in administrator who holds the products view permission but not the products edit permission
    When they open a product's variants
    Then each variant's remove action is shown disabled with an explanation
```

## Documented functional decisions

> 🟣 **Amendment — 2026-08-19: three open questions closed by 0029's own amendment, and a scope
> expansion.** [0029](0029-product-variants-backend.md) was substantially amended on the same day, in
> direct response to this story reporting back from the screen built on its contract. Nothing below is
> a new *debate*; it is this story binding to answers that now exist. **Prior framing is marked
> superseded rather than deleted**, so the reasoning that produced each question stays readable.
>
> | What changed | Where it landed here |
> | --- | --- |
> | **[OQ-3](#open-questions) — the four contract gaps — is RESOLVED**, all four answered exactly as this story recommended: the error-bag keys ([0029 **D-15**](0029-product-variants-backend.md#d-15--error-bag-keys-the-exact-key-every-refusal-throws-on)), the missing `variantFeaturedMediaIdRules()` and the trait written out in full ([0029 **D-16**](0029-product-variants-backend.md#d-16--productvariantvalidationrules-written-out-in-full)), the four action signatures ([0029 **D-17.1**](0029-product-variants-backend.md#d-171--the-four-action-signatures)), and every relation named including `ProductAttributeValue::type()` ([0029 **D-17.2**](0029-product-variants-backend.md#d-172--every-relation-named-with-its-return-type)) | **[D-8](#d-8--where-every-refusal-renders-and-why-none-of-them-renders-on-its-own)** now carries 0029's complete **six**-key table (and the three keys this story had not noticed were also unbound), **[D-6](#d-6--inheritance-is-rendered-and-labelled-null-is-the-flag-and-it-stays-null)** cites the confirmed relation names, **[D-13](#d-13--price-and-stock-strings-pre-filled-and-identical-in-shape-to-0027s)** the confirmed trait, and **[D-17.2](#d-172--the-confirmed-action-surface-this-component-calls)** the confirmed signatures |
> | **[OQ-2](#open-questions) — the cartesian generator — is RESOLVED: IN SCOPE**, by the PO's explicit 2026-08-19 decision. 0029 ships [**D-18**](0029-product-variants-backend.md#d-18--the-cartesian-combination-generator)'s `GenerateProductVariantCombinations`, and 0031 owns its UI | **[D-3](#d-3--superseded-2026-08-19--was-single-variant-creation-only-the-cartesian-generator-is-a-named-scope-fence-with-a-named-backend-cost)** is **superseded** (kept in place, struck at the head) and replaced by the new **[D-17](#d-17--the-cartesian-generator-ui-oq-2-resolved-in-scope)** |
> | **[OQ-6](#open-questions) — `position` not writable — is RESOLVED**, in two halves: variant **images** are single-image-only so there is no image order to express at all, and variant **row order** is now written by 0029 in a deliberately useful order with **no manual reorder control in v1** | **[D-17.5](#d-175--oq-6-resolved-two-halves-neither-of-which-needs-a-reorder-control-in-v1)** |
> | **The story's own classification is unaffected.** 0029 is `includes database-expert: yes`; 0031 stays **no** | stated point by point in **[Type](#type)** |
>
> **What this story must NOT infer from the amendment.** The generator's *outcome semantics* are 0029's
> and are fixed: existing combinations are **skipped without being touched**, a SKU collision is
> **refused individually** while the rest of the batch commits, and an unexpected failure rolls the
> whole batch back. This UI renders those outcomes; it must not re-implement, re-order or soften any of
> them, and in particular it must never offer a "regenerate and overwrite" affordance —
> [0029 **D-18.7**](0029-product-variants-backend.md#d-187--what-the-generator-deliberately-does-not-do)
> rejects it as *"a data-loss bug wearing a convenience label"*.

### D-1 — The builder is a **nested child component**, not part of `Editor` and not its own route

`App\Livewire\Products\VariantBuilder`, embedded in
`resources/views/livewire/products/editor.blade.php`, rendered only when a product exists. Four shapes
were weighed; the verdict is **not close**, and the deciding argument is a correctness one rather than
an aesthetic one.

| | ✅ **(A) Nested child** | (B) Properties on `Editor` | (C) Own route `products/{product}/variants` | (D) A Livewire island |
| --- | --- | --- | --- | --- |
| **Error bag** | **Separate bag.** No field on this component binds `sku`, so nothing mis-renders | 🔴 **Broken by construction** — see below | Separate | 🔴 Same bag as (B); an island scopes *rendering*, not the error bag |
| **Unsaved product edits** | ✅ survive a builder round-trip | ✅ survive | 🔴 **lost on navigation** | ✅ survive |
| **Re-render cost** | only the child re-renders per value pick | 🔴 the whole editor re-renders — three galleries, the WYSIWYG and the region picker included | n/a | partially mitigated |
| **`Editor` size** | unchanged (0027 already calls its own test file "the largest file") | 🔴 ~25 properties, ~25 methods, 4 embedded children, 5 selects | small | 🔴 as (B) |
| **Route / docs cost** | **none** | none | one route + middleware + `docs/api/routes.md` | none |
| **New idiom** | none — nested children are the house pattern (0020, 0021, 0022 are all embedded children) | none | none | 🔴 the codebase's **first** island (**FE-V6**: zero usages today) |

**Why (B) is a real bug and not merely inelegant.** **FE-V4** verifies that `flux:select`'s and
`flux:input`'s stubs declare `'name' => $attributes->whereStartsWith('wire:model')->first()` and then
`$invalid ??= ($name && $errors->has($name))`. A Flux field therefore auto-renders — and turns red —
for an error whose bag key **exactly equals its own `wire:model` path**. 0029's
`CreateProductVariant` throws `derived_sku_taken` on the key **`sku`**, and 0027's `Editor` binds
`wire:model="sku"` to the *product's* SKU input. Under (B), a variant's cross-table SKU collision would
paint the product's SKU field red and print *"SKU 0001-M is already used by product X"* beside a field
the administrator never touched. Fixable only by re-keying every throw at the catch site, i.e. by
amending 0029's shipped action to accommodate a UI choice.

*Rejected:* (C), on 0027 **D-1**'s own logic run backwards — the editor is a page precisely so the whole
product is edited in one place, and splitting variants onto a second URL discards unsaved product edits
at the exact moment an administrator is most likely to have them. *Rejected:* (D), which would be this
codebase's first island for no gain on the deciding criterion.

**Embed shape** — the child needs nothing from `Editor`'s PHP, because `$productId` is already in Blade
scope:

```blade
{{-- resources/views/livewire/products/editor.blade.php — a section below the product form --}}
<flux:separator class="my-8" />

@if ($productId !== null)
    <livewire:products.variant-builder :product-id="$productId" wire:key="variant-builder-{{ $productId }}" />
@else
    <flux:callout icon="information-circle">
        {{ __('products.variants.builder.requires_saved_product') }}
    </flux:callout>
@endif
```

The child re-declares `#[Locked] public string $productId` and **re-reads the model with `findOrFail()`
at the top of every method** — the 0022 **D6** `$optionResolver` precedent applied verbatim, and the
`#[Locked]`-plus-server-authoritative-id discipline 0027 inherited as its obligation 3.

**Not a tab strip.** **FE-V3** verifies Flux Free 2.15.0 ships **no `tabs`**, no `combobox`, no
`accordion` and no repeater primitive. A "General | Variantes" tab strip would have to be hand-rolled or
faked with `flux:navbar`; a plain section under a `flux:separator` needs no new primitive and keeps the
page's single "Guardar producto" button unambiguous.

### D-2 — The combination is composed in a **keyed repeater of paired selects** *(the one place the two specialists split)*

```
┌ Combinación ─────────────────────────────────────────────┐
│  [ Color        ▾ ]  [ azul marino ▾ ]              [✕]  │
│  [ Talla        ▾ ]  [ L           ▾ ]              [✕]  │
│  ⊕ Añadir atributo                                       │
└──────────────────────────────────────────────────────────┘
```

**The split, stated plainly.** `frontend-expert` proposed an **add-a-row repeater**
(`$combinationRows[$i] = ['key' => …, 'typeId' => '', 'valueId' => '']`); `frontend-qa` proposed a
**map keyed by attribute type** (`$selectedValues[$typeId] = $valueId`, pre-seeded to `''` for every
type). Both structurally prevent the **DIS-1** shape (`Size 40 / Size 41`), which matters because 0029's
DIS-1 was resolved as an *application-level rule only* on the explicit ground that *"the UI cannot
produce such a combination"* — so whichever shape ships, that claim must stay true.

**Recommendation: the repeater**, for two reasons the map cannot answer:

1. **It scales.** The map renders one select pair per attribute type **in the whole catalog**, always.
   At 10¹–10² types that is a form nobody can use, and it makes "this product uses Size and Color" an
   accident of which rows were left blank rather than a choice.
2. **It matches the established house pattern.** 0028 **D4** / 0030 already built a keyed value
   repeater for exactly this shape, including the two keying rules it needs.

**What is adopted from `frontend-qa`'s shape regardless**, because it is the better half of that
proposal: its selector insight (**QA-V5**) survives the change. `flux:select` derives its `name` from
the `wire:model` path, so a positional binding `wire:model.live="combinationRows.0.typeId"` yields
`name="combinationRows.0.typeId"` — a **contract-derived selector needing no new `data-test` hook**, and
the anchor [D-9](#d-9--the-null-select-desync-detector-and-why-every-obvious-test-for-it-provably-cannot-work)'s
detector uses.

**The two keying rules, both mandatory and both easy to get backwards** (0028 **D4**, 0030's traps 1–2):

```blade
@foreach ($combinationRows as $index => $row)
    <div wire:key="{{ $row['key'] }}">                        {{-- STABLE server-generated key --}}
        <flux:select wire:model.live="combinationRows.{{ $index }}.typeId" ...>   {{-- POSITIONAL path --}}
        <flux:select wire:model.live="combinationRows.{{ $index }}.valueId" ...>
        <flux:button wire:click="removeCombinationRow(@js($row['key']))" ... />   {{-- by KEY, never index --}}
    </div>
@endforeach
```

`key` is assigned once with `(string) Str::uuid()` and never mutated; removal is **by key, never by
index**. A positional `wire:key` makes Livewire's DOM diff reuse the wrong row's client state after a
removal, and an index-based removal deletes the wrong row after any reorder.

**One-value-per-type is enforced structurally**: once a type is chosen in a row it is removed from every
other row's type options, so `Size 40 / Size 41` is unbuildable — which is what keeps 0029 **DIS-1**'s
verdict honest.

**Ordering:** the type select lists types in `(position ASC, id ASC)` — **the same order the derivation
uses** — so the rows read in the same order as the SKU. Rows themselves stay in **insertion** order while
editing (a row must never jump under the cursor), while the SKU preview renders in **D-4.2** order. That
divergence is deliberate and is the cheapest way to teach the rule; see
[D-4](#d-4--the-live-sku-preview-is-a-server-side-computed-never-a-property-and-never-client-side)'s
provisional-label note for the wrinkle it creates.

*Rejected:* [0022](done/0022-searchable-multi-select-component.md)'s searchable multi-select, on three
grounds. Its selection carries **bare ids with no structure**, so its `group` field could display the
type name but cannot *enforce* one option per group — reopening DIS-1 from the UI. Its **D11** excludes
an already-selected option from results, which is the wrong exclusion here (after picking Size 40 you
want the other **Size** values hidden, not just that one). And at 10¹–10² types × 10¹–10² values, search
adds nothing two selects do not already give. *Rejected:* a checkbox matrix of every type × value —
that **is** the axis picker for a generator, and without one it produces an ambiguous selection.

### D-3 — SUPERSEDED 2026-08-19 — ~~was: Single-variant creation only; the cartesian generator is a named scope fence with a named backend cost~~

> 🟣 **SUPERSEDED by [D-17](#d-17--the-cartesian-generator-ui-oq-2-resolved-in-scope) — the generator
> ships.** [OQ-2](#open-questions) resolved **in scope** on 2026-08-19 by explicit PO decision, and
> 0029 responded by shipping
> [`GenerateProductVariantCombinations`](0029-product-variants-backend.md#d-18--the-cartesian-combination-generator).
> **This section is kept unedited below because it is the reason the backend contract has the shape it
> does** — point 3 named the missing piece precisely (*"one transaction, all-or-nothing, or an
> explicitly specified per-row outcome contract"*), and 0029 built the second of those two and says so.
> Read it as the analysis that produced D-18, not as this story's current scope.
>
> What each of its four points became:
>
> | D-3's point | Status after 0029's amendment |
> | --- | --- |
> | 1 — the PRD has no bulk scenario (**FE-V12**) | **Still factually true**, and no longer decisive: the generator is a PO scope decision taken above the PRD, not a reading of it. **FE-V12 stands as a finding**; it stops being an argument |
> | 2 — the declaration table is not what is missing | **Confirmed by 0029** ([D-18.6](0029-product-variants-backend.md#d-186--input-rules-and-the-ordering-of-what-gets-generated)): the generator holds its axes **transiently, as parameters**, and `product_product_attribute_type` is still **not** shipped (0029's OQ-5a survives). **PO-V3 stands** |
> | 3 🔴 — the missing outcome semantics are a backend gap | **Closed.** One outer `DB::transaction()` with each `CreateProductVariant` as a **savepoint**; a per-combination refusal rolls back only its savepoint; an unexpected exception rolls back the batch. The half-built-catalog worry was **real and is answered**, not dismissed ([0029 D-18.2](0029-product-variants-backend.md#d-182--outcome-semantics-skip-silently-in-the-data-report-loudly-in-the-summary)) |
> | 4 — `price` is `NOT NULL`, so a generator owns that decision | **Answered by the backend, not by this UI** ([0029 D-18.4](0029-product-variants-backend.md#d-184--price-and-stock-at-generation-time)): a generated variant takes the **parent product's price** and `stock = 0`. The generator therefore asks for **no** prices up front, which is what keeps its UI a two-field gesture instead of an N-row form |
>
> **The one mitigation D-3 recommended at the bottom of this section survives and is now doubly
> useful**: defaulting from the types this product's existing variants already use is exactly how
> [D-17.1](#d-171--the-axis-picker-a-checkbox-list-of-attribute-types-pre-selected-from-the-products-own) pre-selects the generator's checkboxes.

**No "generate all combinations" bulk builder in this story.** Both specialists reached this
independently, and the reasoning is worth recording in full because the PRD's word *"generate"* invites
the opposite conclusion.

1. **The PRD does not ask for it (FE-V12).** §2.2's only creation scenario is singular — *"When they
   **generate the variant** 'Size 40 / Color Black'"* — and per
   [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rule 3 that single `When`
   is a one-variant verb. There is no bulk scenario anywhere in the PRD.
2. **The declaration table is *not* what is missing.** A generator is buildable on 0029's shipped
   surface with the axes held as transient UI state — pick Size 38/39/40 and Color Black/White, call
   `CreateProductVariant` six times. 0029's **OQ-5b** table would make the axis set *persistent*, which
   is a nicety, not a blocker.
3. 🔴 **What is genuinely missing is the outcome semantics, and that is a backend gap.** 0029 ships
   **no batch action**. Six calls means six transactions and six independent `lockForUpdate()`
   cross-table checks — so when combination 4 collides via **D-4.5** case (a)/(b)/(c), **1–3 are
   committed and 4–6 are not**. The administrator is left with a half-built catalog, a wall of per-row
   errors, and **no undo**, because variants are hard-deleted (0029 **D-6**, no `SoftDeletes`). Wrapping
   the six calls in this component's own `DB::transaction()` nests savepoints around six actions that
   each open their own transaction *and* holds every gap lock for the whole batch — precisely the
   exposure 0029 **R-M** warns about, now in a screen rather than in an action.
4. **`price` is `NOT NULL`** (0029 **OQ-2a**), so a generator must supply one per generated row and owns
   that decision too.

**What 0029 (or a new story) would have to add for a generator to be shippable**, stated precisely so
the PO can price it rather than discover it:

- `app/Actions/Products/GenerateProductVariants.php` — one transaction, all-or-nothing, refusing the
  whole batch on any collision with a message naming the offending combination; **or** an explicitly
  specified per-row outcome contract (`created` / `skipped_existing` / `refused` + reason) the UI can
  render as a result table.
- A **read-only** derivation/collision preview seam, so the generator can show which rows will succeed
  *before* writing anything (the same seam [OQ-5](#open-questions) wants for the single-variant form).

Raised as **[OQ-2](#open-questions)**. It is the largest scope question in this story and it changes the
story's own classification (see [Type](#type)).

> 🟣 **Outcome (2026-08-19): both bullets were priced and one was bought.** 0029 shipped the second
> option in the first bullet — the **per-row outcome contract**, not the all-or-nothing batch — under
> the name **`GenerateProductVariantCombinations`** (**not** `GenerateProductVariants`, which is the
> name this paragraph guessed; 0029's Definition of Done flags the divergence explicitly, so use the
> real one everywhere). The second bullet — the **read-only dry-run seam** — was **not** bought:
> [0029 D-18.7](0029-product-variants-backend.md#d-187--what-the-generator-deliberately-does-not-do)
> leaves it with this story as [OQ-5](#open-questions), on the ground that the post-hoc
> `skipped`/`refused` summary already tells the administrator what happened. The classification did
> **not** change — see [Type](#type).

**One mitigation available today at zero backend cost, and recommended:** default a new variant's type
rows from the **types this product's existing variants already use**, read at render time. It gives the
common case ("another size") one click, needs no declaration table, and is purely presentational.

### D-4 — The live SKU preview is a server-side `#[Computed]`, never a property, and never client-side

| | ✅ **Server-side `#[Computed]`** | Client-side JS | Only after save |
| --- | --- | --- | --- |
| Correctness | exact — calls the **one** `VariantSku::derive()` definition | 🔴 **a second copy of the formula** | exact |
| Teaches D-4.2 | ✅ the administrator watches segment order follow the *type* order, not their click order | ✅ | ❌ |
| Cost | one round trip per value pick | zero | zero |

**Why client-side is rejected outright rather than weighed.** 0029's files table says of
`app/Support/VariantSku.php` that *"a second copy of the formula anywhere is the defect this class
exists to prevent"* (**R-L**). A JS copy cannot faithfully reproduce `Str::ascii()` transliteration, the
`[^A-Za-z0-9._/-]` strip, the whitespace-run collapse or the `MAX_LENGTH = 128` refusal — and, fatally,
**it gets `M`, `L` and `azul marino` exactly right**, so every naturally-written test passes while
`Marrón` previews as `0002-Marrón` and stores as `0002-Marron`. That asymmetry is why
[the browser test for it](#tests-to-perform) must use a value whose `segment()` is *not* the identity.

```php
// app/Livewire/Products/VariantBuilder.php
/**
 * The SKU the current combination would derive, or null while nothing is chosen.
 * A #[Computed] METHOD, never a property: a Livewire property is sent in the snapshot whether or
 * not its input is disabled, so a property here would re-open exactly the typed-claimant problem
 * the derivation removes. See story 0029 D-4.3 and its Definition of Done hand-off.
 */
#[Computed]
public function skuPreview(): ?string
{
    $values = $this->orderedSelectedValues();   // strings read back from the DB, in D-4.2 order

    return $values === [] ? null : VariantSku::derive($this->product()->sku, $values);
}
```

Five load-bearing details:

1. 🔴 **The value *strings* are read back out of the database**, in the same query that feeds the
   selects — never taken from the request payload. This is 0029's **V-10** applied to the preview:
   `Rule::exists()` is case-insensitive under `utf8mb4_unicode_ci`, so a payload naming a
   differently-cased id would preview one SKU and store another. The builder already loads
   `ProductAttributeType::with('values')` for the selects, so this costs **zero extra queries**.
2. **`wire:model.live` is mandatory** on the value select. `wire:model` is deferred by default in
   Livewire 4, and a deferred binding **syncs perfectly under `Livewire::test()->set()`** — so a missing
   `.live` produces a preview that never moves a character in a real browser while every component test
   stays green. See **FP-V4**.
3. **Nothing is ever posted back.** No `wire:model`, no hidden input, no `readonly` `<flux:input>`, and
   **no public property named `sku` on this component at all**.
4. **Partial combinations** render the derivation of the completed rows only, labelled **provisional**.
   The honest wrinkle the copy must carry: because **D-4.2** orders by *type position*, adding a second
   value can **insert a segment in the middle** (`0002-L` → `0002-azul-marino-L`), which reads like the
   SKU changed retroactively. That is exactly why it is labelled provisional rather than shown as a fait
   accompli. An empty combination renders a placeholder, **never a bare parent SKU** — see
   [OQ-4](#open-questions).
5. **Presentation is deliberately not an input:**

```blade
<flux:field>
    <flux:label>{{ __('products.variants.sku.preview_label') }}</flux:label>

    <div class="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm
                text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
         data-test="variant-sku-preview">
        {{ $this->skuPreview ?? '—' }}
    </div>

    <flux:description>{{ __('products.variants.sku.derived_notice') }}</flux:description>
</flux:field>
```

`<flux:input readonly>` was considered and rejected: it *looks* like a field, and it invites a future
reviewer to "wire it up" — which is the one change that reopens the whole typed-claimant problem.

### D-5 — Preview and stored SKU are **two different sources**, and conflating them is a silent data bug

For a **saved** variant the list renders the **stored `sku` column**. For the **unsaved** form it renders
the **preview**. They must never be confused, and after a successful create the list must re-read the
stored value rather than reuse the preview string.

🔴 **The concrete bug this prevents — `frontend-qa`'s finding, and it exists nowhere in 0029.** An
administrator opens the builder; someone renames an attribute value in another tab; they return and add
a variant. 0029's derivation reads the value strings **back out of the database** (**V-10**), so the
**stored** SKU is correct — while the preview they just read was built from the option list loaded at
mount. They see `0002-azul-marino`; the catalog gets `0002-azul`. Nothing errors, nothing looks wrong,
and the divergence is permanent.

Three requirements follow, all testable:

- **R1 — the variants list is a `#[Computed]` over a query, never a `mount()`-populated public array.**
  This converts "stale until a full page reload" into "stale until the next interaction", which is the
  best achievable without polling. It is also what makes the read-time image inheritance of
  [D-6](#d-6--inheritance-is-rendered-and-labelled-null-is-the-flag-and-it-stays-null) actually
  re-resolve.
- **R2 — after a successful create, the builder re-reads the created variant's SKU from the database**
  and renders that, never the previewed string.
- **R3 — `confirmDelete()` re-reads the target's label *and* SKU from the database** into `#[Locked]`
  properties. This is [livewire-authorization.md](../../docs/security/livewire-authorization.md)'s own
  rule — *"a modal must read authoritative values from the model rather than back them out of a
  client-writable array"* — with a **stale-rename trigger** rather than a tampering one: naming the
  target from a client-held array lets an administrator confirm *"Delete `0002-azul-marino`"* and
  actually delete a variant now called `0002-azul`.

### D-6 — Inheritance is rendered **and labelled**; `NULL` is the flag and it stays `NULL`

0029 **D-7** resolves the image at read time and forbids copying the parent's `featured_media_id` into
the variant row. Every row therefore shows an image, which means **the image alone carries no
information** — the state must be labelled:

| State | Thumbnail | Marker |
| --- | --- | --- |
| Own image | the variant's own media | `<flux:badge size="sm" color="lime">` — *Propia* |
| Inherited | the **parent's** featured media | `<flux:badge size="sm" color="zinc">` — *Heredada* |
| Neither (the parent has none either) | 0027 **OQ-2**'s placeholder tile — the *same* one, not a second design | none |

*Rejected:* reduced opacity or a bare link icon for the inherited case. Opacity reads as *disabled*, and
an unlabelled icon is not accessible. The badge is explicit, translatable and screen-reader-visible; the
tile also carries an `aria-label` naming the state.

**Clearing an own image** is a per-row action labelled `products.variants.image.revert_to_inherited` —
*"Usar la imagen del producto"*, **never** *"Eliminar imagen"*, which would tell the administrator the
variant ends up with no image. It sets `featuredMediaId = null` and calls `UpdateProductVariant`; no
confirmation, because it is non-destructive and instantly reversible.

**One `media.gallery` instance, mounted once — never one per row.** Livewire registers every `#[On]`
listener as a **page-global `window.addEventListener`**, and the event-name string is the only thing
separating instances (0020 **D2**/**V3**, 0027 **D-8**). One Gallery per variant row would share one
literal and **every row would receive every selection**. The single instance targets whichever variant
the open form addresses, tracked by `#[Locked] public ?string $editingVariantId`.

> 🔵 **This makes a *fourth* Gallery instance on the product editor page.** 0027 **D-8** tabulates three
> (`featured-image-selected`, `product-images-added`, and 0021's per-instance-derived
> `wysiwyg-image-selected-{componentId}`). `variant-image-selected` is a fourth distinct literal, which
> is safe — but 0027's table and the docs pass must gain the row, or the next reader will believe three
> is the complete set.

**R-D is incomplete as 0029 states it.** 0029 **R-D** says a variants list must eager-load
`['featuredImage', 'product.featuredImage']`. The combination column renders `ProductVariant::label()`,
which 0029 **D-9** specifies as an accessor over the eager-loaded pivot ordered by
`(type.position, value.position)` — so it also needs **`values`** and each value's **`type`**, neither of
which R-D mentions. Without them the combination column N+1s twice per row. The correct load:

```php
$this->product()->variants()                              // 0029 adds Product::variants(), position ASC, sku ASC
    ->with([
        'featuredImage:id,title,path,webp_path,avif_path', // 0019's REAL columns — 0027 D-17 / V-7
        'values.type:id,name,position',
    ])
    ->get();
```

`product.featuredImage` is deliberately **absent**: the builder already holds the parent, so the
parent's featured image is loaded once into component state and inheritance is resolved in PHP. The view
then never touches `$variant->product`, which is the actual N+1 in R-D's shape.

> 🟣 **2026-08-19 — every relation in that eager-load is now named and confirmed** by
> [0029 **D-17.2**](0029-product-variants-backend.md#d-172--every-relation-named-with-its-return-type),
> which closes [OQ-3](#open-questions)(d). Four consequences for this eager load, all of which were
> assumptions when D-6 was written and are now contract:
>
> - **`ProductAttributeValue::type(): BelongsTo`** is the confirmed method name, adopted *"exactly as
>   0031 recommended"* — so `values.type` is a real path, not a guess. 0029 also records **why** it
>   named it: to stop 0030 and 0031 each inventing a different name for the same relation.
> - **`ProductVariant::values(): BelongsToMany`** over `product_variant_values` is confirmed **as a
>   read relation and must stay one**. 0029 forbids `sync()` / `attachValue()` / `detachValue()` from a
>   component, because `combination_hash` would not follow. This builder therefore **never** touches
>   the pivot directly — every write goes through the actions, which is already **D-7**'s rule and is
>   now enforced by the model surface itself.
> - **`ProductVariant::featuredImage(): BelongsTo`** on `featured_media_id` is confirmed, *"nullable,
>   and the null **is** the inheritance flag"* — the same sentence **D-6** is built on.
> - **`Product::variants(): HasMany` declares its own ordering** (`->orderBy('position')->orderBy('sku')`),
>   *"never at the call site"*. So the query above must **not** re-`orderBy()`; the total order arrives
>   with the relation, and `sku` being `UNIQUE NOT NULL` is what makes the tiebreak total. That is also
>   precisely what makes [D-17.4](#d-174--the-pagination-consequence-decided-here-because-retrofitting-it-is-the-expensive-path)'s
>   pagination safe.

### D-7 — Variants are written **immediately and independently**, never inside `Editor::save()`

One `CreateProductVariant` / `UpdateProductVariant` / `DeleteProductVariant` call per gesture, committed
on the spot. Five structural reasons, not a preference:

1. `product_variants.product_id` is **NOT NULL** (0029 **D-6**), so a variant cannot be staged before its
   product row exists.
2. **The SKU derives from `products.sku` as persisted** (**D-4.1**). Deriving from an uncommitted in-form
   SKU produces a preview that is wrong the moment the product save is abandoned.
3. **D-4.5's collision check is a `lockForUpdate()` read across two tables in a fixed order.** Folding N
   variant creations into 0027 **D-12b**'s product+regions transaction would hold those gap locks across
   the whole gesture, widening exactly the deadlock window 0029 **R-M** exists to control.
4. **D-4.6's re-derivation cascade lives inside `UpdateProduct`.** A product SKU change and a variant
   creation in one transaction means deriving a variant SKU from a SKU that the same transaction is
   rewriting — undefined by construction.
5. 0029 ships **no batch action and no all-or-nothing wrapper** for variants (see **D-3**).

**Consequence for the create path, and one amendment 0027 should make.** On `products.create` the
builder is not rendered at all. That is correct, but 0027 **D-12c** redirects to `products.index` after a
successful save, so the natural "create a product, then add its variants" flow bounces the administrator
to the list. **Recommended: 0027's create path redirects to `products.edit` for the newly-created
product** (the edit path keeps redirecting to the list). One line in 0027's `save()`; raised as
**[OQ-7](#open-questions)**.

### D-8 — Where every refusal renders, and why none of them renders on its own

🔴 **This is the easiest thing on this screen to get silently wrong.** **FE-V4** is the mechanism: a Flux
field auto-renders an error whose bag key **exactly equals its `wire:model` path**. **None** of 0029's
throws matches a field path on this screen, so **every one of them must be rendered explicitly** — left
alone, three of four refusals are *invisible to the administrator* while every backend test is green.

> 🟣 **2026-08-19 — the keys below are no longer this story's recommendation; they are 0029's
> contract.** [0029 **D-15**](0029-product-variants-backend.md#d-15--error-bag-keys-the-exact-key-every-refusal-throws-on)
> answers [OQ-3](#open-questions)(a) exactly as recommended and publishes the **complete six-key
> table**, adding three keys this section had not accounted for. Two of 0029's own rules are worth
> repeating here because they shape the markup:
>
> - **`combination` is deliberately *not* keyed to `attributeValueIds`**, and 0029 says so citing this
>   section: a duplicate combination is a fault of the **set**, not of any submitted id, and keeping
>   the key distinct is *"only expressible because"* D-8 puts it under the whole fieldset.
> - **All four SKU refusals share the single key `sku`** and are *"distinguished by their **translation
>   key**, never by their bag key"*. 0029 records this as its own **R-Q**/**FP17**: a test asserting
>   the exception class — or even the bag key — **cannot fail against the wrong message**. Every
>   assertion in this story therefore asserts the **rendered message**, never the key alone.

| Bag key | Message | Bound to a field here? | Renders |
| --- | --- | --- | --- |
| `combination` | `products.variants.duplicate_combination` | **no** | a `flux:error` **inside the combination `flux:fieldset`**, under the last row — the errored thing is the row-set, not any one select |
| `sku` | `products.variants.derived_sku_taken` (interpolates `:sku`, names the conflicting record per 0029 **D-4.5** point 2) | **no** — there is no SKU input, by design | a `flux:callout variant="danger"` **immediately under the SKU preview** |
| `sku` | `products.variants.derived_sku_empty_segment` (names the offending value) | **no** | same callout |
| `sku` | `products.variants.derived_sku_too_long` | **no** | same callout |
| 🟣 `attributeValueIds` | 0029's array-level rules (absent, not an array, empty, over `max:10`, duplicate id, unknown id, **or an id that survives `Rule::exists()` and does not come back from the V-10 read-back**) | 🔴 **no** — the rows bind `combinationRows.{i}.valueId`, **not** `attributeValueIds` | **the same `flux:error` inside the combination fieldset** as `combination`. This key was missed by the original table and would have rendered nowhere at all |
| 🟣 `featuredMediaId` | `variantFeaturedMediaIdRules()`'s `Rule::exists('media', 'id')` | 🔴 **no** — the image is chosen through the Gallery event, so nothing binds a field of that name | a `flux:error` **beside the image picker**. Only reachable if the Gallery hands back an id that has since been deleted, which is exactly the race worth surfacing rather than swallowing |
| 🟣 `attributeTypeIds` | `products.variants.generate.empty_type` / `.too_many`, plus the array rules (**D-17**) | ✅ **yes, and deliberately so** | **the one key on this screen that auto-renders.** [D-17.1](#d-171--the-axis-picker-a-checkbox-list-of-attribute-types-pre-selected-from-the-products-own) names the picker's property `attributeTypeIds` **precisely so the path matches the bag key** and **FE-V4** does the work |
| `combinationRows.{i}.typeId` / `.valueId`, `price`, `stock` | this component's own rules | ✅ yes | auto-rendered by Flux — these **are** bound paths |

🔴 **Five of the seven rows above render nowhere unless this story renders them.** That was already
D-8's headline; 0029's amendment made it worse by two keys before making it explicit, and 0029's own
Definition of Done now repeats the obligation *"so the hand-off is recorded on both sides"*.

Three things to pin:

1. **A `derived_sku_taken` refusal must name a remedy.** 0029 **OQ-16a** ships **no override**, so the
   administrator cannot resolve the collision from this form at all. The message names the conflicting
   record; the builder appends the two real remedies — *"Cambia el SKU del producto o renombra el valor
   del atributo."* (`products.variants.sku.remedy_hint`).
2. **`closeForm()` must call `resetErrorBag()`.** 0025 **R-6**'s stale-error trap bites harder here,
   because the error is attached to a *derived* value the next combination no longer produces.
3. **R-F becomes UI-visible.** `product_variants` carries two unique indexes and 0029's `23000` catch
   must disambiguate them; if it mislabels, the builder faithfully renders "duplicate combination" in
   the wrong place. The builder cannot detect this — **the browser test must assert which message
   appears for each of D-4.5's three collision cases**, not merely that *a* message appeared.

**One cheap improvement worth taking.** Because the saved variants are already loaded with their value
ids, the builder can find the colliding row in PHP by comparing sorted value-id sets — no hash, no extra
query — and **highlight it in the table with a "ver" anchor** (`products.variants.combination.duplicate_of`).

### D-9 — The null-`<select>` desync detector, and why every obvious test for it **provably cannot work**

[errors-log.md](../../docs/errors-log.md)'s 2026-08-16 entry is the single most relevant prior incident
to this screen, and this screen is **the worst case in the codebase so far**: two native `<select>`s per
combination row, bound to *array paths*, where the natural default for an unset element is `null` — the
forbidden value, reached by a route (an unset array key) the original `roleId` fix does not cover.
**FE-V4** confirms `flux:select`'s only variant renders a genuine native `<select>`.

> 🔴 **`frontend-qa` verified that all three obvious tests for this are structurally incapable of
> failing against the bug — and that a claim in a *shipped* test in this repository is therefore
> false.** `product-owner` independently re-verified each.

| Approach | Why it cannot fail against the bug |
| --- | --- |
| `Livewire::test()->set(…)` | Writes the property; no DOM exists. (The errors-log already says so.) |
| `visit(…)->select(…)` | **QA-V1** — `InteractsWithElements::select()` is a one-line pass-through to Playwright's `selectOption`, whose injected implementation does `select.value = void 0`, sets `option.selected = true`, then dispatches `input` **and** `change` **unconditionally**. It destroys the pre-existing `selectedIndex` before anything can observe it, and it manufactures the very event whose *absence* is the bug. |
| `assertValue()` / `assertSelected()` | **QA-V3** — both resolve to Playwright's `inputValue()` → `select.value`, which returns `''` **both** when the disabled placeholder is correctly selected **and** when `selectedIndex === -1`. Indistinguishable. |

**The detector that does work — `assertScript()` on `selectedIndex` (QA-V4), read before any
interaction:**

```php
->assertScript(
    "document.querySelector('[name=\"combinationRows.0.typeId\"]').selectedIndex",
    0                       // 0 = the disabled placeholder is genuinely selected
)                           //-1 = wire:model assigned "null"/"undefined" — the bug
```

`selectedIndex` is the **only** DOM property that separates the two states. This is a *root-cause*
assertion: it fails the instant a bound value is `null`, before any user action, with no event-timing
dependency and no flakiness.

**Three structural requirements that make the whole class impossible**, which is cheaper than detecting
it:

- **Every bound value is `''`, never `null` and never absent.** A row is created as
  `['key' => …, 'typeId' => '', 'valueId' => '']`. *An unset array element dehydrates to `undefined` in
  the browser, which stringifies just as fatally as `null`* — this is the array-shaped version of the
  original bug, and it is why a row must be fully seeded on creation rather than lazily filled.
- **Both placeholders are `<option value="" disabled selected>`**, per 0027 **D-5**'s new markup rule.
- 🔴 **The dependent-select reset.** Changing a row's type changes the value select's option set. If the
  old `valueId` survives, the DOM holds a value no option carries — **the same desync arrived at from
  the other direction**, and it is invisible to `Livewire::test()->set()`. `wire:model.live` on the type
  select plus an `updated('combinationRows.*.typeId')` hook resetting that row's `valueId` to `''` in
  the same round trip.

> 🔵 **Finding to hand to `docs-keeper`, not to fix here.** `tests/Browser/UsersIndexTest.php` carries a
> comment asserting that picking the first option *"is the only choice that actually exercises the
> fix"*. **QA-V1** shows it is not: `->select()` fires `change` regardless, so that test passes
> identically against `public ?string $roleId = null`. It remains a good round-trip test; it is **not**
> the regression net the errors-log entry believes exists. Recorded in
> [Risks](#dependencies-findings-and-risks) as **R-3** and in the Definition of Done as a docs hand-off.

### D-10 — Authorization gates against the **parent product**, once, with no per-row matrix

0029 **D-12** ships `ProductVariant` with **no policy of its own**: every variant operation authorizes
against the parent product through `ProductPolicy`. The actions **do not self-authorize**, so this story
is 0029's only enforcement path.

```php
public function mount(string $productId): void { $this->productId = $productId; Gate::authorize('view', $this->product()); }
public function openCreateForm(): void         { Gate::authorize('update', $this->product()); … }
public function openEditForm(string $id): void { Gate::authorize('update', $this->product()); … }   // DISCLOSES price/stock
public function saveVariant(…): void           { Gate::authorize('update', $this->product()); … }
public function confirmDelete(string $id): void{ Gate::authorize('update', $this->product()); … }
public function deleteVariant(…): void         { Gate::authorize('update', $this->product()); … }
#[On('variant-image-selected')]
public function setVariantImage(array $media): void { Gate::authorize('update', $this->product()); … }
```

Five notes:

1. **`update` for create, too.** Per 0029 **OQ-12**, all three variant operations map to `products.edit`
   — adding or removing a variant is a *modification of an existing catalog record*, not bringing a
   product into or out of the catalog. The resulting line looks wrong at a glance
   (`Gate::authorize('update', …)` inside a *create* method) and needs its comment. Confirm as
   **[OQ-1](#open-questions)** before Phase 3: if it flips, six lines and the whole authorization
   fixture change.
2. **`openEditForm()` gates because it *discloses*** a variant's price and stock —
   [livewire-authorization.md](../../docs/security/livewire-authorization.md)'s rule is "mutates **or**
   discloses".
3. **`mount()` gates even though the page route already does.** `Livewire::test()` reaches `mount()`
   with no route, and the child is a second `/livewire/update` entry point. Whether route
   `PersistentMiddleware` propagates to a *child* component's own update request is **unverified**; it
   does not matter, because the child gates itself — but Phase 3 must not assume it either way.
4. **No per-row authorization matrix.** Every `ProductPolicy` ability answers identically for every
   variant of one product (they all target the same parent), so per-row `Gate::allows()` would be N
   identical calls. Compute **once** into `#[Locked] public bool $canManageVariants` from
   `Gate::allows('update', $this->product())` — the *same* policy method the mutating paths authorize
   against, satisfying
   [authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)'s
   cannot-drift rule — and render every disabled branch from it. This is 0027 **R-9**'s "do not model
   this too literally on Users" applied concretely.
5. **No `->ignore()` anywhere on the variant side.** 0029 **D-4.7** removed it: the SKU is derived, so
   there is nothing to validate and no id to feed `Rule::unique()->ignore()`. **State this in the
   component docblock**, so a reviewer looking for the `#[Locked]`/`->ignore()` pair (0027's inherited
   obligation 3) knows its absence is correct rather than missing.

**Route:** none added. The builder inherits `products.edit`'s `can:products.view` — **never**
`permission:products.view`, since Livewire 4's `PersistentMiddleware` allow-list carries Laravel's
`Authorize` but not Spatie's `PermissionMiddleware` ([api/routes.md](../../docs/api/routes.md#usersindex--the-first-permission-gated-route)).

### D-11 — Editing a variant: the combination is shown **fixed**, not disabled

0029 **D-13** makes a combination immutable after creation. The edit form therefore renders it as
**static badges**, not as disabled selects:

```blade
@if ($editingVariantId !== null)
    <div class="flex flex-wrap items-center gap-2">
        @foreach ($lockedCombination as $pair)
            <flux:badge color="zinc">{{ $pair['type'] }}: {{ $pair['value'] }}</flux:badge>
        @endforeach
    </div>
    <flux:description>{{ __('products.variants.combination.immutable_notice') }}</flux:description>
@else
    {{-- the editable repeater --}}
@endif
```

Disabled selects were rejected for two reasons: Flux's own `disabled:pointer-events-none` makes them
un-hoverable, so an explanation cannot be attached to them (errors-log, 2026-08-16), and a disabled
control reads as *temporarily* unavailable — the opposite of "immutable by design".

Only `price`, `stock` and `featured_media_id` are editable, matching exactly what
`UpdateProductVariant` may write.

**"I want to change this variant's combination"** → an explanatory note plus the existing Delete action.
No compound "replace" affordance in v1. If one is ever wanted (**[OQ-8](#open-questions)**), the ordering
is non-obvious and is recorded now: it must be **create-then-delete**, never delete-then-create, because
a delete-first flow that fails on the create **loses the variant permanently** (hard delete, no restore).
Create-first is safe *precisely because* **D-3**'s uniqueness is scoped to
`(product_id, combination_hash)` — the replacement's combination is by definition different, so it
cannot collide with the original's hash or SKU.

**Deleting** is a `flux:modal` confirmation naming **both** the derived `label()` *and* the stored `sku`
(the SKU is the operational identifier an administrator recognises), mirroring `Users\Index` and 0027
**D-3**: `#[Locked]` properties re-read with `findOrFail()` (**D-5** R3), inner content wrapped in
`@if ($showDeleteModal)` so only one Cancel control is ever in the DOM, and the error bag cleared on
close.

⚠️ **The copy must say the removal is permanent.** Every previous delete confirmation in this app
(Users, 0005) is a **soft** delete; this one is not. Reusing that wording would misinform. New key
`products.variants.delete.irreversible`.

### D-12 — The create/edit **form** is an inline panel; only the delete confirmation is a modal

**FE-V5** verifies `flux:modal` renders a native `<dialog>` inside `<ui-modal>`. Putting the variant form
in a modal means opening 0020's Gallery — itself a `<dialog>` — **from inside another `<dialog>`**: two
stacked focus traps, two body scroll locks, and the stacking-context class of problem that **0027 D-1
reason 1 refused to bet on when deciding the whole editor should be a page**. Native `<dialog>` nesting
is not categorically broken, but it is unverified in this stack and 0027 already ruled on the same
question one level up.

So: the form is an inline expanding `flux:card` under the variants table, the Gallery opens over the
page exactly as it does on the product form, and `flux:modal` is reserved for the delete confirmation
(which contains no nested modal).

### D-13 — Price and stock: strings, pre-filled, and identical in shape to 0027's

```php
/**
 * decimal:2 returns a STRING (0024 R-4 / 0029 R-C). Never float — a float reformats '19.90' to
 * 19.9 on every round trip — and never null, which is the errors-log desync trap.
 */
public string $price = '';

/** String for the same reason: an int property cannot hold the '' a cleared input sends. */
public string $stock = '0';
```

- **Pre-fill from the parent**, which is 0029 **OQ-2a**'s own answer to the ergonomic cost of a NOT NULL
  price: in the **create** branch only, `$this->price = $product->price;`. Because `price` is already the
  `decimal:2` **string** `'119.95'`, it round-trips byte-for-byte — **do not `number_format()` it**,
  which is the double-formatting bug **R-4** exists to warn about. The edit branch loads the variant's
  own price and never re-applies the parent's. A `flux:description` says the value was pre-filled, so it
  does not read as a locked mirror.
- **`type="text" inputmode="decimal"`, not `type="number"`** — the latter invites `19.999` (which 0024
  rejects) and, on a Spanish keyboard, produces `19,99` (which `decimal:0,2` refuses). The server rule
  stays the single authority. **Whatever 0027 does for the product price field, this screen does
  identically** — two visually different money inputs on one page is a defect in itself
  (**[OQ-9](#open-questions)**).
- **Stock** is `inputmode="numeric"`, rule `['required','integer','min:0']`. The column is deliberately
  **signed** (0029 **D-6**) so a negative never reaches MySQL as a `1264` 500; the UI's job is only to
  refuse it with a message.
- **Compose `ProductVariantValidationRules` alone.** Do **not** also compose 0024's
  `ProductValidationRules`: it would put `skuRules()` in reach of a component that must never validate a
  SKU, and 0029 entity-prefixed `variantPriceRules()` / `variantStockRules()` /
  `variantCombinationRules()` precisely so the two never need to meet.

> 🟣 **2026-08-19 — the trait is now written out in full and the "compose one trait only" rule is
> genuinely sufficient**, which it was not when this section was written.
> [0029 **D-16**](0029-product-variants-backend.md#d-16--productvariantvalidationrules-written-out-in-full)
> closes [OQ-3](#open-questions)(b) by adding the missing method and publishing all **seven**:
>
> | Method | Applies to | Used by this component for |
> | --- | --- | --- |
> | `variantCombinationRules()` | `attributeValueIds` | `['required','array','min:1','max:10']` — the row-set as a whole |
> | `variantCombinationValueRules()` | `attributeValueIds.*` | `['string','distinct',Rule::exists(...)]` — one element |
> | `variantPriceRules()` | `price` | 0024's `priceRules()` verbatim |
> | `variantStockRules()` | `stock` | `['required','integer','min:0']` — the `min:0` **D-13** relies on |
> | ✅ `variantFeaturedMediaIdRules()` | `featuredMediaId` | **the method this story was missing.** It is why composing 0024's whole `ProductValidationRules` is no longer even tempting |
> | `variantAttributeTypeIdsRules()` | `attributeTypeIds` | `['required','array','min:1','max:5']` — the generator's axis picker (**D-17**) |
> | `variantAttributeTypeIdRules()` | `attributeTypeIds.*` | `['string','distinct',Rule::exists(...)]` |
>
> Three consequences: the **array/element split** means the component's `rules()` declares two entries
> per array input (`attributeValueIds` **and** `attributeValueIds.*`), never one; **`Rule::exists()` is
> a first pass and never the authority** (0029's **V-10** read-back decides both the hash and the
> derivation, which is the same fact **D-4**.1 builds the preview on); and there is still **no
> `skuRules()` and no variant SKU rule of any kind**, so a reviewer who cannot find one has found the
> design rather than a gap.

### D-14 — Every Flux/Blaze/Livewire trap this screen hits

All verified live in this repo, not recalled. **FE-V14**: `flux/select` and `flux/modal` both open with
`@blaze(fold: true, …)`, so Blaze compile-time folding is **live on the exact components this screen is
built from** — the errors-log's `tooltip` finding is not a historical curiosity here.

| # | Trap | Where it bites | Mitigation |
| --- | --- | --- | --- |
| **T1** 🔴 | A `null` `wire:model`-bound property desyncs a native `<select>` | two selects **per row** — more than any prior screen | **D-9**: `''` everywhere, placeholders `disabled`, `selectedIndex` detector |
| **T2** 🔴 | **New instance of T1** — the dependent value select after a type change | the type→value pair | **D-9**'s reset hook, proven by real clicks asserting the **persisted** value |
| **T3** 🔴 | A `tooltip` prop **cannot** be conditionally bound (Blaze presence trap) | disabled edit/delete when `!$canManageVariants`; disabled "Añadir atributo" when every type is used | written-out `@if`/`@else` with `<flux:tooltip>` wrapping only the disabled branch — copy `users.blade.php` verbatim (**FE-V10**) |
| **T4** | `disabled:cursor-*` never renders — `disabled:pointer-events-none` removes the button from hit-testing | the same buttons | `cursor-not-allowed!` on the **`flux:tooltip` wrapper**; `cursor-pointer!` on enabled buttons |
| **T5** 🔴 | `@js()` on **every** id in a `wire:*` argument, UUIDs included | `openEditForm`, `confirmDelete`, `removeCombinationRow`, `revertToInheritedImage` | never `{{ }}` |
| **T6** 🔴 | Repeater keying — two axes, both required | the combination repeater | **D-2**: stable `wire:key`, positional `wire:model`, removal **by key** |
| **T7** 🔴 | A Flux field auto-binds an error only on an **exact** `wire:model` path match | all four of 0029's throws match nothing | **D-8**: render every one explicitly, and test that each is *visible* |
| **T8** | `wire:model` is **deferred** by default in Livewire 4 | the live preview would never move | `.live` on both selects |
| **T9** | Livewire listeners are page-global; `dispatchTo()` broadcasts by component **name** | a **fourth** Gallery instance joins the page's three | one instance, literal `variant-image-selected`, distinct `wire:key` — never one per row |
| **T10** 🔴 | Nested native `<dialog>` | a modal form opening the Gallery modal | **D-12**: inline panel |
| **T11** | Modal inner content must be wrapped in `@if ($showDeleteModal)` | the delete modal | one Cancel control in the DOM, ever |
| **T12** | `decimal:2` returns a **string** | `$price`, the price column, every assertion | **D-13**; `toBe('19.99')` with quotes |
| **T13** | The `@can('viewAny', Media::class)` wrapper (0020 **D12**) | the Gallery embed | without it, an actor who may edit products but lacks `media.view` gets the **whole page** 403'd by the child's own `Gate::authorize()`. Wrap the embed; render the trigger `disabled` inside an explicit `<flux:tooltip>` on the other branch |
| **T14** | **FE-V3**: no `flux:tabs`, no `flux:combobox`, no repeater primitive in Flux Free | anyone reaching for a tabbed editor or a searchable value picker | section-below-separator; hand-rolled repeater, as 0030 already established |
| **T15** | Icon-only actions need an `aria-label` **and** a `data-test` hook on **both** branches | every row action | `data-test="edit-variant-{id}"` / `"delete-variant-{id}"` / `"revert-variant-image-{id}"` |

### D-15 — Translation keys

`lang/en/products.php` and `lang/es/products.php` are **extended, never recreated**, key-for-key
identical. **FE-V8**: the file does not exist yet, and **this story is its seventh writer** (0024
creates; 0025, 0026, 0027, 0028, 0029 extend) — 0027's **R-7** at more than double the scale, and a key
missing from `lang/es` renders as its own raw key with no error.

**Already owned by 0029 — do not duplicate:** `products.variants.duplicate_combination`,
`.derived_sku_taken`, `.derived_sku_empty_segment`, `.derived_sku_too_long`,
`.parent_sku_change_collides`, `.value_in_use`, `.type_in_use`, and 🟣 **(2026-08-19, for the
generator)** `products.variants.generate.empty_type` (naming the type),
`products.variants.generate.too_many` (interpolating `:limit` and `:attempted`) and
`products.variants.generate.summary` — the last being *"the sentence 0031 renders"*, a `trans_choice`
over the created count interpolating `:skipped` and `:refused`. It lives in 0029's key space *"because
the **action** owns the outcome vocabulary"*, so **D-17.3**'s panel renders that key and must not
reassemble the sentence from parts.

**New here** (nested sub-groups so nothing collides with 0029's flat leaves; every segment `snake_case`
per [naming.md](../../docs/conventions/naming.md#translation-keys)):

```
products.variants.builder.heading | .summary (:count) | .add | .empty
products.variants.builder.requires_saved_product      ← the products.create branch
products.variants.builder.no_attribute_types          ← dead end; links to product-attribute-types.index
products.variants.builder.action_not_allowed          ← the T3 disabled-action tooltip

products.variants.columns.combination | .sku | .price | .stock | .image | .actions

products.variants.form.create_title | .edit_title
products.variants.form.combination_legend
products.variants.form.attribute_type_label | .attribute_type_placeholder
products.variants.form.attribute_value_label | .attribute_value_placeholder
products.variants.form.add_attribute_row | .remove_attribute_row
products.variants.form.price_label | .price_prefilled_help | .stock_label
products.variants.form.save | .cancel

products.variants.sku.preview_label | .preview_pending | .preview_provisional | .derived_notice
products.variants.sku.remedy_hint                     ← OQ-16a ships no override, so name the two remedies

products.variants.combination.immutable_notice        ← D-13
products.variants.combination.duplicate_of (:label)   ← the "ver" anchor, D-8

products.variants.image.own_badge | .inherited_badge | .none
products.variants.image.choose | .replace | .revert_to_inherited | .confirm_label

products.variants.delete.title | .confirm (:label, :sku) | .irreversible

🟣 the generator UI (D-17) — the OUTCOME vocabulary is 0029's, these are the CONTROL's
products.variants.generate.trigger                    ← the header button
products.variants.generate.modal_title | .intro
products.variants.generate.types_legend | .types_help ← the checkbox fieldset
products.variants.generate.count (:count)             ← the live combination count, D-17.1
products.variants.generate.over_limit (:count, :limit)← the pre-flight warning callout
products.variants.generate.confirm | .cancel
products.variants.generate.result_title               ← the summary panel, D-17.3
products.variants.generate.result_skipped (:count) | .result_refused (:count)
products.variants.generate.result_dismiss
products.variants.generate.no_types_selected          ← the client-side companion to 0029's array rule
```

> ⚠️ **`products.variants.generate.*` now has two owners, which is a first in this key space.** 0029
> owns `.empty_type`, `.too_many` and `.summary`; this story owns the eleven above. They must not
> collide, and the split is not arbitrary — **0029 owns every leaf that describes an outcome the action
> produced, this story owns every leaf that labels a control**. When adding a key here, ask which side
> of that line it falls on; if it names something that happened to the data, it belongs to 0029.

> 🔵 **Correction to 0029's OQ-18, and it is a mis-attribution rather than a disagreement.** OQ-18 says
> *"0031 owns the reorder control and should warn on it"* about **attribute-type** reordering. It does
> not: 0028 **D5** ships `position` on *types* and **0030 owns their screen**. 0031 owns *variant*
> reordering only (0029 **OQ-11**). The warning that reordering types changes the SKU of variants
> created afterwards therefore belongs on **0030's** control, beside the buttons that cause it. Raised
> as **[OQ-11](#open-questions)**.

### D-16 — The attribute-value rename edge case, resolved

> **This is the question `product-owner` was asked to resolve rather than defer, and it is resolved
> here.** 0029's **D-4.6** re-derives the SKU of every variant built on a renamed attribute value, in
> the same transaction — but that decision is still carried as 0029's open **OQ-13** (re-derive vs
> freeze vs a middle option). What follows is the **UI's** answer, and it contributes an argument 0029
> does not make.

**(a) Does the builder display a stale SKU until reload?** Briefly, and acceptably — *iff* **D-5**'s
**R1** holds. The rename happens on a different route (0030's screen), in another tab or by another
administrator; there is no polling and no broadcast. With the variant rows as a `#[Computed]` over a
query, the stale display self-heals on the **next Livewire round-trip** — any interaction at all. With a
`mount()`-time public array it stays stale until a full page load. R1 is what turns an unbounded
staleness into the same bounded staleness every list screen in this app already has, and it is testable:
mutate the value's string directly in the database between two renders of the same component instance
and assert the second render shows the new SKU.

**(b) Does anything need to warn *before* the rename? Yes — and it belongs to 0030, not here.** 0029
already builds `ProductAttributeValue::variants()` and the per-value in-use count for the *delete* guard
(**D-10**); the identical query answers *"renaming this value will rewrite N variant SKUs"*.
**Recommended: a non-blocking inline notice in 0030's value repeater** when an in-use value's text is
edited, with the total repeated at the save affordance. Non-blocking because the rename is legitimate
and D-4.6 makes it transactional and all-or-nothing. *Rejected:* no warning at all — an administrator
fixing a typo (`azul marnio` → `azul marino`) would silently rewrite SKUs printed on physical stock, and
0029's own OQ-13b argues that cost is real. Under 13a the rename **is** a catalog-wide mutation, and a
screen presenting it as a text edit is misleading.

> 🔴 **A second 0030 gap found here, and it is the sharper one.** D-4.6 aborts the whole rename on any
> resulting SKU collision — which means `products.variants.derived_sku_taken` can surface **on a
> taxonomy screen that has no SKUs on it**. 0030's contract has no error key, no field and no copy for
> that. Left as-is, an administrator renaming a value meets a message about a SKU with nothing to attach
> it to and no remedy on that screen. It must render against the offending value row (0030's own
> per-row error rule) and name the conflicting record. **[OQ-10](#open-questions)**.

**(c) Does an open editor page holding stale rows need handling? Yes, in exactly one place.** Read
staleness is (a). **Write** staleness is the dangerous half — and a rename changes the SKU *string* but
not the variant's `id`, so an inline price/stock save still targets the right row and is harmless. The
exception is the **delete confirmation**, which is why **D-5 R3** is a requirement rather than a
nicety.

The **same-page** case is sharper than the cross-page one: 0027's editor holds the product's `sku` field
*and* this builder. After a save that changes the SKU, D-4.6 rewrites every variant's SKU while the
rendered rows still say `0001-M`. 0027 **D-12c**'s redirect means the stale rows are never shown — but
that protection is **accidental**, so it must be asserted, not assumed.

**(d) Can displayed and stored SKU diverge unnoticed? Yes, in three distinct ways — two of them
invisible to every backend test.** Cross-page staleness (closed by R1); a preview re-implemented in JS
(closed by **D-4**); and the **stale-option-list divergence** described in **D-5** (closed by R2). Each
has a named test.

**The recommendation on 0029's OQ-13, from the UI's point of view: 13a (re-derive), with D-5's R1–R3 as
conditions.** The backend argument is that the formula stays globally assertable. The **UI-specific**
argument is stronger, and it settles the middle option outright:

- Under **13a**, the invariant *"what is displayed = `derive(current inputs)`"* holds on every screen, so
  the preview and the list are the same function of the same data and one test pins both.
- Under **13b (freeze)**, the builder must display SKUs the live preview can no longer reproduce. Add a
  variant to a product whose values were renamed last month and the new row follows a different formula
  from its neighbours'. Neither the UI nor a test can distinguish a correctly-frozen SKU from a bug — the
  screen would ship with a permanently unverifiable column.
- 🔴 **The middle option (freeze on value rename, re-derive on parent-SKU change) is not the cheap
  compromise it appears to be — it is unimplementable as specified.** The preview would have to know
  *which of a variant's inputs had ever been renamed* in order to render honestly, and nothing records
  that: there is no `sku_frozen_at`, no rename log. **It requires a new column**, so choosing it is a
  schema change and must land before Phase 3.

**What remains genuinely for the PO:** whether 0030's rename warning is blocking or non-blocking
(**OQ-10**), and whether the operational re-labelling cost is real enough to reopen 13b. **If 13b is
chosen, this story's entire preview design changes** — the preview would only be truthful for *new*
variants, and the list would need a visible marker distinguishing derived-current from frozen SKUs.

### D-17 — The cartesian generator UI (OQ-2 resolved: in scope)

> 🟣 **Added 2026-08-19.** [OQ-2](#open-questions) resolved **(b) — yes, properly** by explicit PO
> decision: 0029 first added the batch action, and this story owns its screen. **[D-3](#d-3--superseded-2026-08-19--was-single-variant-creation-only-the-cartesian-generator-is-a-named-scope-fence-with-a-named-backend-cost)
> is superseded by this section.** Everything below is a **UI** decision; not one line of it re-decides
> an outcome semantic, all of which belong to
> [0029 **D-18**](0029-product-variants-backend.md#d-18--the-cartesian-combination-generator).

An administrator with a product offering Talla (38, 39, 40) and Color (Black, White) generates all six
combinations in one gesture instead of building six variants by hand. The gesture has exactly three
beats — **pick the axes**, **confirm**, **read what happened** — and each of the three is decided below,
because the third is the one a naïve implementation drops.

**Where the trigger lives.** A **secondary** `flux:button` in the variants section header, beside the
existing primary "Añadir variante": `products.variants.generate.trigger` — *"Generar combinaciones"*. It
is secondary rather than primary because the single-variant path stays the default gesture (**FE-V12**:
the PRD's only creation scenario is still singular), and it sits in the header rather than in the create
form because it is an **alternative** to that form, not a mode of it. It renders `disabled` on the same
`$canManageVariants` computed **D-10** note 4 already establishes — one policy read, not a second one —
and, when the catalog holds no attribute types, it is absent entirely rather than disabled, because the
"no attribute types" empty state already explains the dead end and two explanations of one fact is
worse than one.

#### D-17.1 — The axis picker: a checkbox list of attribute types, pre-selected from the product's own

**Container: a `flux:modal`, and it is safe here for a reason `flux:modal` was rejected in D-12.**

| | ✅ **Modal** | Inline panel (as **D-12**) | A second route |
| --- | --- | --- | --- |
| Nested `<dialog>` risk (**T10**) | **none** — the picker opens **no media gallery**, so the one hazard **D-12** refused to bet on does not exist on this path | none | none |
| Reads as a discrete, confirmable gesture | ✅ up to `MAX_COMBINATIONS` rows are about to be written | 🔴 an inline panel beside another inline form reads as a second form; the administrator can plausibly fill in both | ✅ |
| Competes with the create form | ✅ modal state is exclusive by construction | 🔴 two open panels, two "Guardar"-ish buttons | n/a |
| Cost | `flux:modal` is already on this screen for the delete confirmation | none | 🔴 a route, middleware, a docs row — **D-1** rejected this shape once already |

So **D-12's rule is not being broken, it is being applied**: the form that opens the Gallery stays
inline; the control that opens nothing may be a modal. State the reason in the view comment, or the next
reader will read the two as inconsistent. **T11** applies unchanged — the modal's inner content is
wrapped in `@if ($showGenerateModal)` so only one Cancel control is ever in the DOM.

**The picker itself: a checkbox list of attribute types, ordered `(position ASC, id ASC)`.**

- **Ordered by `position`, not by name**, because that is the order
  [0029 **D-18.6**](0029-product-variants-backend.md#d-186--input-rules-and-the-ordering-of-what-gets-generated)
  generates in and the order the derived SKU reads in (**D-4.2**). The list therefore previews the shape
  of the output for free, which is the same argument **D-2** makes for the row repeater's type select.
- 🔴 **The bound property is named `attributeTypeIds` — exactly 0029's bag key.** This is the *one*
  place on this screen where **FE-V4** works **for** us: a Flux field auto-renders an error whose key
  equals its `wire:model` path, so naming the property after the key makes `.too_many`, `.empty_type`
  and the array rules render without an explicit `flux:error`. Do not rename it to `generateTypeIds` or
  `selectedTypeIds` for readability — the name **is** the wiring. It is `public array $attributeTypeIds = [];`,
  and every element is a **string** id (**T1**'s discipline extends to checkbox arrays: an element is
  present or absent, never `null`).
- **Pre-selected from the types this product's existing variants already use** — the mitigation
  **D-3**'s last paragraph recommended, now doing double duty. It reads from data the builder already
  loads for the variants list (`values.type`, **D-6**), so it costs **zero extra queries**, and it makes
  the overwhelmingly common second run — *"I added a colour, generate the rest"*, which is the case
  [0029 **D-18.2**](0029-product-variants-backend.md#d-182--outcome-semantics-skip-silently-in-the-data-report-loudly-in-the-summary)
  built "skip existing" for — a two-click gesture. For a product with no variants yet, nothing is
  pre-selected and the administrator picks.
- **Every type in the catalog is offered, not only the pre-selected ones.** 0029 **D-18.6** is explicit
  that *"the selected types need not be 'offered by' the product"* — there is no declaration table — so
  restricting the list would invent a constraint the backend does not have. The `max:5` array rule is
  the only ceiling, and it is the server's.
- *Rejected:* [0022](done/0022-searchable-multi-select-component.md)'s searchable multi-select, on **D-2**'s
  grounds unchanged (a bare-id selection with no group structure), plus one specific to this control:
  the count preview below needs the **value count per selected type**, which a component returning bare
  ids cannot supply without a second query.
- *Rejected:* generating across **all** types with no picker. Simpler, and wrong at the first product
  that does not vary along every axis in the catalog — it would produce a cartesian product over
  unrelated types (Talla × Color × Acabado × Material) that trips `MAX_COMBINATIONS` on a catalog with
  five types and nothing unusual about it.

**A live combination count, and deliberately no disabled button.** A `#[Computed]` multiplies the
selected types' value counts — again from already-loaded data, zero extra queries — and renders
`products.variants.generate.count` (*":count combinaciones"*) beside the confirm button. When it exceeds
`MAX_COMBINATIONS` an inline `flux:callout variant="warning"` names the limit **and the count**, mirroring
0029's own `.too_many` copy. The confirm button is **not** disabled in that state, for two independent
reasons: the server rule stays the single authority (the same posture **D-13** takes for the price
input, and the count is a client-visible estimate of a set the server re-reads under **V-10**), and a
disabled button drags in **T3** and **T4** for a state the administrator can fix in one click anyway.

#### D-17.2 — The confirmed action surface this component calls

🟣 [0029 **D-17.1**](0029-product-variants-backend.md#d-171--the-four-action-signatures) closes
[OQ-3](#open-questions)(c). All four signatures are contract now, and this component is every one's only
caller. **Use these verbatim** — three of the four differ in some detail from what this story assumed:

```php
// injected per method, per code-style.md's per-method action-injection convention
CreateProductVariant::__invoke(
    Product $product, array $productAttributeValueIds, string $price, int $stock,
    ?string $featuredMediaId = null,
): ProductVariant;

UpdateProductVariant::__invoke(
    ProductVariant $variant, string $price, int $stock,
    ?string $featuredMediaId = null, ?int $position = null,
): ProductVariant;

DeleteProductVariant::__invoke(ProductVariant $variant): bool;

GenerateProductVariantCombinations::__invoke(Product $product, array $productAttributeTypeIds): array;
```

Five binding details, each of which changes a line this story had already written:

1. 🔴 **The generator is `GenerateProductVariantCombinations`, not `GenerateProductVariants`.** The
   shorter name appears in **D-3** and in **OQ-2**(b) as this story's own guess, and 0029's Definition
   of Done calls the divergence out by name. Every reference in this file is now the real one.
2. **The create action's array parameter is `$productAttributeValueIds`** — the *model-qualified* name,
   not `$attributeValueIds`. The **error-bag key is still `attributeValueIds`** (**D-15**'s camelCase-
   of-the-input rule); the parameter and the key differ on purpose and both are fixed. Do not
   "harmonise" them.
3. **`string $price`, never `float`** — **R-8** / 0024 **R-4**, and now enforced by the signature
   itself. `$this->price` is already the `decimal:2` string and is passed straight through.
4. **Both write actions return `ProductVariant`**, explicitly *"so the caller can render it without
   re-querying"*. This does **not** license bypassing **D-5 R2**: the returned model's `sku` is read
   from the row the action just wrote, which is the database value, so rendering it is correct —
   rendering the **preview string** is not. The distinction is the returned model versus
   `$this->skuPreview`, and only the second is forbidden.
5. **`?int $position = null` on the update action means "leave it alone", and no call site passes it** —
   see [D-17.5](#d-175--oq-6-resolved-two-halves-neither-of-which-needs-a-reorder-control-in-v1).

**None of the four authorizes** — 0029 **D-12** unchanged, and the generator adds a **seventh** gated
method to **D-10**'s list:

```php
public function generateCombinations(GenerateProductVariantCombinations $generate): void
{
    Gate::authorize('update', $this->product());   // update, per OQ-1 — same ability as create
    // …validate attributeTypeIds, call, store the summary, close the modal
}
```

#### D-17.3 — The result summary: an inline panel above the table, not a flash and not the modal

**Decision: the modal closes on a successful call and the summary renders as a dismissible
`flux:card` between the section header and the variants table.** Three shapes were weighed:

| | ✅ **Inline summary panel** | A flash / `flux:toast` | Keep the result in the modal |
| --- | --- | --- | --- |
| Can carry a **per-row** `refused` list | ✅ each row has a `label`, a `sku` **and** a `message` naming the conflicting record | 🔴 **structurally cannot** — a flash is one string, and up to `MAX_COMBINATIONS` outcomes do not fit in one | ✅ |
| Readable **while looking at the table it changed** | ✅ | ✅ but it disappears on a timer | 🔴 the modal covers the table; the administrator must dismiss the result to see the rows |
| Survives the next Livewire round trip | ✅ a `#[Locked]` property, cleared only on dismiss or on the next generation | 🔴 a session flash is consumed on the next render | n/a |
| Precedent | this repo has no toast primitive in Flux Free (**FE-V3**'s neighbourhood) | 🔴 would be the codebase's first | — |

**The panel's exact content**, driven by
[0029 **D-18.1**](0029-product-variants-backend.md#d-181--signature-and-return-shape)'s array shape and
nothing else:

- **The headline sentence is 0029's, not this story's.** `products.variants.generate.summary` is a
  `trans_choice` over the created count interpolating `:skipped` and `:refused`, and it lives in the
  action's own key space *"because the **action** owns the outcome vocabulary"*. This story renders it;
  it must **not** compose an equivalent sentence out of three separate keys.
- **`created`** — the count only. The rows themselves are now in the table directly beneath, so listing
  them twice is noise; the table is re-read from the database (**D-5 R1**), never appended from the
  returned collection.
- **`skipped`** — the count, plus each combination's `label` in a collapsed list. These are **not
  errors** and must not be styled as such: an administrator who generated deliberately over an existing
  set expects them. Neutral `flux:badge color="zinc"`, matching the *Heredada* precedent in **D-6**.
- **`refused`** — 🔴 **always expanded, one row each, never collapsed and never a count alone.** Each
  renders its `label`, its derived `sku` and 0029's `message` — which already names the conflicting
  record — plus **D-8**'s `products.variants.sku.remedy_hint`, because the remedy is identical to the
  single-variant path's and the administrator cannot retype a derived SKU on either. `flux:callout
  variant="danger"` around the group.
- **`attempted`** is rendered only when it disagrees with `created + skipped + refused`, which it never
  should. It is a reconciliation figure; showing it unconditionally invites the administrator to do
  arithmetic that is the code's job.

**When the whole call is refused** — over the cap, an empty type, no type selected — there is **no
summary at all**: the modal stays **open** with the error rendered on `attributeTypeIds`
(**D-17.1**), because nothing was written and the administrator's next action is to change the
selection. A summary panel reporting "0 created" for a refused call would be a lie about a batch that
never ran.

#### D-17.4 — The pagination consequence, decided here because retrofitting it is the expensive path

🔴 **The generator can put 200 rows into a table this story had assumed would hold a handful.** 0029's
Definition of Done hands this over explicitly — a generator UI *"inherits the pagination consequence
0031's own OQ-2 flagged"* — and [OQ-2](#open-questions)'s note already named the mechanism: **adding
`WithPagination` later changes the component's public surface (`array` → `LengthAwarePaginator`) and
every test written against it**, which is 0027 **D-4**'s own argument for paginating from day one.

**Decision: the variants list paginates from the start**, `->paginate(25)` matching
[0027](0027-products-list-and-editor-ui.md) **D-4**'s page size exactly (two differently-paginated lists
on one product screen is the same class of defect as **OQ-9**'s two money inputs). Four consequences,
all of which Phase 3 must carry:

1. **The order is already total and already declared**, so pagination is safe here in a way 0027 **D-4**
   had to argue for: `Product::variants()` orders `position ASC, sku ASC` **inside the relation** (0029
   **D-17.2**) and `sku` is `UNIQUE NOT NULL`, so no two pages can reshuffle a tie.
2. **`#[Computed]` still holds** (**D-5 R1**) — it returns a paginator rather than a collection, and it
   still re-reads per round trip, which is what keeps the stale-rename self-heal and the read-time image
   inheritance working.
3. **The "assert the exact sequence" tests scope to page 1** and gain one page-2 case, rather than being
   rewritten. **FP-V12** stands unchanged.
4. **A freshly generated batch lands where the administrator expects it** — 0029 **D-18.6** assigns
   `position` as `MAX(position) + 1` in cartesian order, so a generated set is contiguous and in
   SKU order rather than scattered by insert timing.

Page size is the only part left open — raised as **[OQ-13](#open-questions)**, recommending 25 for
consistency with 0027.

#### D-17.5 — OQ-6 resolved: two halves, neither of which needs a reorder control in v1

[OQ-6](#open-questions) asked whether `position` ships on variants and noted *"it is not expressible
today"* — a reorder needs a whole-set rewrite in one transaction, and 0029 ships no
`ReorderProductVariants`. **R-6** filed it as the same shape as
[0027](0027-products-list-and-editor-ui.md)'s **OQ-6**/**D-9a** finding about `SyncProductGallery` one
story over. 0029's amendment settles both halves, though only one of them the way the question expected.

**Half 1 — variant *images*: the question does not apply, and it never could.** Checked against 0029's
schema rather than assumed: **a variant has exactly one optional own image**, `featured_media_id`, a
single nullable FK on `product_variants` ([0029 **D-5**](0029-product-variants-backend.md#d-5--exact-schema)).
There is **no variant gallery pivot** — 0029 **D-9** rejects one outright (*"PRD says 'an optional
image', singular"*), and its scope fences repeat it as *"no `product_variant_media` gallery"*. So the
0024/`SyncProductGallery` ordered-array/index-position pattern has **nothing to apply to** on this
screen: there is no second image, therefore no order, therefore no reorder. This is not a deferral —
**the 0027-class bug is structurally absent from the variant image field**, and this story's existing
scope fence *"No variant gallery"* is what keeps it absent. The single image is chosen and reverted
through **D-6**'s one Gallery instance, and that is the whole of it.

**Half 2 — variant *row order*: `position` ships, is written by the backend in a useful order, and gets
no manual reorder control in v1.** What changed is that the column is no longer dead schema, which was
OQ-6's actual objection:

| OQ-6's option | Verdict after 0029's amendment |
| --- | --- |
| (a) 0029 adds `ReorderProductVariants` + this story ships move-earlier/move-later buttons | **Not taken.** 0029 declined it explicitly in [D-18.7](0029-product-variants-backend.md#d-187--what-the-generator-deliberately-does-not-do) — *"the cartesian order **D-18.6** assigns is deliberately the useful one, which is what makes the absence tolerable"* — and **D-17.1** point 5 records the same for the `?int $position` parameter that no call site passes |
| (b) Do not ship the column | **Not taken, and no longer the tidy answer it was.** The column now has two real writers: `MAX(position) + 1` on every create, and the generator's cartesian sequence |
| ✅ (c) Ship the column, ship no control | **Taken** — and it is no longer *"the worst of both"*, which is what this story called it while the column had no writer. With 0029 **D-18.6** populating it in `(type.position, id)` × `(value.position, id)` order, a generated set reads 38-Black, 38-White, 39-Black, 39-White out of the box. The order the administrator wants is the order they get, without a control |

**What this closes, and the exact condition that reopens it.** OQ-6 is **resolved** and this story ships
**no reorder affordance of any kind** — no buttons, no drag (Flux Free ships nothing draggable anyway,
**FE-V3**), no `position` input. It reopens the moment an administrator wants an order the derivation
does not produce — a merchandising order like "M, L, S" against a Talla whose own `position` says
otherwise — and the fix is **not** this story's to invent:

> 🔵 **Follow-up amendment 0029 would need, described rather than designed here.** A manual reorder
> requires **`ReorderProductVariants(Product $product, array $orderedIds): void`** — a whole-sibling-set
> rewrite in **one** transaction, never pairwise swaps (0029 **D-8**, inheriting 0024 **D-8**), refusing
> an id set that is not exactly the product's current variant ids. 0029 already names the action and
> already explains why it is absent, so this is a **known, costed gap, not an oversight**. Per
> [contracts.md](../../docs/contracts.md)'s rule against inventing a dependency's contract, this story
> does **not** specify it further and does **not** call `UpdateProductVariant`'s `$position` parameter
> N times to fake it — that is the pairwise-swap corruption the rule exists to prevent. If the PO wants
> manual ordering, it is an amendment to **0029** first and a small addition here second.

## Scope fences: what this story must NOT do

- **No migration, model, action, policy, enum, factory, seeder, validation rule or permission-catalog
  change.** Every one is consumed as shipped (0029 **D-12**: no new permission string, no
  `RolePermissionSeeder` edit).
- **No SKU input of any kind** — no field, no `readonly` input, no hidden field, no disabled input that
  still posts, and **no public property named `sku`** on the component (0029 **D-4.3** and its DoD).
- **No client-side re-implementation of the derivation formula** (**D-4**).
- ~~**No cartesian "generate all combinations" builder**~~ — **reversed 2026-08-19**, the generator's
  **UI ships here** (**[D-17](#d-17--the-cartesian-generator-ui-oq-2-resolved-in-scope)**) against
  0029's `GenerateProductVariantCombinations`. What stays fenced out of it is narrower and is now
  explicit: **no dry-run/preview seam** (0029 **D-18.7**; still [OQ-5](#open-questions)), **no
  all-or-nothing batch semantics re-imposed from the UI**, **no "regenerate and overwrite" affordance**
  of any kind, **no delete-missing sync mode**, and — unchanged — **no `product_product_attribute_type`
  declaration table** (0029's OQ-5a survives; the axes are transient UI state, **PO-V3**).
- **No re-implementation of any outcome semantic.** `skipped`, `refused`, `created` and `attempted`
  are read from 0029's returned array and rendered. This story does not re-query to recompute them,
  does not re-derive a refused row's SKU to "check", and does not turn a `skipped` into an update.
- **No editing of an existing variant's combination** (0029 **D-13**), and no "replace" affordance in v1.
- **No variant gallery** — PRD says *"an optional image"*, singular (0029 **D-9**), and 0029's own
  fences say *"no `product_variant_media` gallery"*. This is what makes
  [D-17.5](#d-175--oq-6-resolved-two-halves-neither-of-which-needs-a-reorder-control-in-v1)'s image
  half a non-question rather than a deferral.
- **No variant `status`** (0029 **D-9**/its **OQ-6**: `stock = 0` already expresses it).
- **No reorder control of any kind** — **[OQ-6](#open-questions)** is **resolved** to option (c)
  (**D-17.5**): the column ships and is written by the backend in a useful order, and no UI writes it.
  In particular, **do not** call `UpdateProductVariant`'s `?int $position` parameter N times to
  simulate a reorder; that is the pairwise-swap corruption 0029 **D-8** forbids. A manual reorder
  begins with a `ReorderProductVariants` amendment on **0029**.
- **No new route, no sidebar entry, no `docs/api/routes.md` row** — the builder is a nested child of an
  existing routed page.
- **No changes to 0030's attribute-type screen** — the two gaps **D-16** found there are raised as
  amendment questions on **0030**, not performed here.
- **No re-running of a dependency's own suite**: not 0029's derivation/hash/collision/FK/in-use tests,
  not 0027's editor suite, not 0020's gallery mechanics, not 0030's repeater tests
  ([what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)).
- No bulk actions, no CSV import, no duplicate-variant action, no i18n scaffolding (Epic 5).

## Files to create/modify

### Creates

| Path | What & why |
| --- | --- |
| `app/Livewire/Products/VariantBuilder.php` | The child component (**D-1**). Class-based per [base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file). Composes **`ProductVariantValidationRules` only** (**D-13**), now **seven** methods (0029 **D-16**). **No `#[Title]`** — it is a nested child, not a page; the title stays 0027's `#[Title('Product editor')]`. 🟣 **Also hosts the generator (D-17)**: `public array $attributeTypeIds = []`, `#[Locked] public ?array $generationSummary = null`, `public bool $showGenerateModal = false`, the `generateCombinations()` method (a **seventh** gated method, **D-10**), and `use WithPagination` (**D-17.4**). |
| `resources/views/livewire/products/variant-builder.blade.php` | The **ordinary kebab-case mirror** — `VariantBuilder` is not an `Index`, so the [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name) does **not** apply. Same depth as 0027's `products/editor.blade.php`. |
| `tests/Feature/Products/VariantBuilderTest.php` | Create/update/delete orchestration, the one-unsaved-variant invariant, error-key routing. |
| `tests/Feature/Products/VariantBuilderSkuPreviewTest.php` | The derivation as rendered: literal-string assertions, the three-way ordering fixture, submission-order irrelevance, the no-SKU-control guard. |
| `tests/Feature/Products/VariantBuilderRenderingTest.php` | Own/inherited/none badges, the four refusal surfaces, the three Flux/Blaze regression guards, `data-test` hooks on both branches, the `@can('viewAny', Media::class)` branch, both empty states. |
| 🟣 `tests/Feature/Products/VariantBuilderGeneratorTest.php` | **New 2026-08-19 (D-17).** The generator UI: the axis picker's pre-selection and its live count, the summary panel's three outcome groups, the refused-row rendering, the "whole call refused" branch that shows **no** panel, the `attributeTypeIds` auto-render, and the authorization pair for `generateCombinations()`. A **separate** file rather than more cases in `VariantBuilderTest.php`, matching how 0029 gave the generator its own test file. |
| `tests/Feature/Products/VariantBuilderQueryTest.php` | **D-6**'s corrected eager-load list and the two-axis N+1 guard. 🟣 Now also owns the pagination query shape (**D-17.4**). |
| `tests/Feature/Products/VariantBuilderAuthorizationTest.php` | One allow/deny pair per method, the cross-product target test, Super Admin via `Gate::before`, every deny paired with its absent side effect. |
| `tests/Browser/Products/VariantBuilderTest.php` | **Only** the real-DOM cases — see [Tests to perform](#tests-to-perform). |

### Modifies

| Path | What & why | Owner |
| --- | --- | --- |
| `resources/views/livewire/products/editor.blade.php` | The embed block plus the `products.create` callout (**D-1**). **`app/Livewire/Products/Editor.php` needs no change** — `$productId` is already in Blade scope. | 0027 |
| `lang/en/products.php`, `lang/es/products.php` | **Extend** with **D-15**'s keys, key-for-key identical. **Seventh writer** (FE-V8). | 0024 creates |
| `tests/Unit/ArchitectureTest.php` | Extend the `App\Livewire\Products\*` fence. **One `expect()` per namespace, never `expect([...])`** — that form is disjunctive and this repo has already shipped one vacuous arch rule that way (0024 **V-7**). | 0027 extends it too |

### Conditional on an open question

| Path | When |
| --- | --- |
| `app/Livewire/Products/Editor.php` (+ its view) | **OQ-7** accepted → the create-path redirect to `products.edit`; **OQ-12** accepted → the "changing this SKU re-derives N variant SKUs" notice on the SKU field |
| `app/Livewire/Products/AttributeTypes/Index.php` (+ its view, + lang) | **OQ-10** accepted → 0030's rename warning and its missing collision-error rendering. **These are amendments to 0030, not work this story performs.** |

### Explicitly **not** touched

`database/migrations/*variant*`, `app/Models/ProductVariant.php`,
`app/Support/{VariantSku,VariantCombination}.php`,
`app/Actions/Products/{Create,Update,Delete}ProductVariant.php`,
`app/Actions/Products/GenerateProductVariantCombinations.php` (🟣 **called, never written or edited** —
its cap, its transaction shape and its summary contract are 0029's),
`app/Concerns/ProductVariantValidationRules.php`, `app/Policies/ProductPolicy.php` (all **0029**) ·
`app/Models/ProductAttribute*.php` (**0028**) · `app/Livewire/Media/Gallery.php`,
`app/Livewire/Components/*` (**0020**/**0021**/**0022**) · `routes/web.php` ·
`database/seeders/RolePermissionSeeder.php` · `docs/**` (Phase 6).

> ⚠️ **[Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule).**
> This story writes `lang/en|es/products.php` (shared with **six** other stories) and
> `resources/views/livewire/products/editor.blade.php` (0027's file). Its Phase 3 must **never** be
> dispatched in the same batch as 0024, 0025, 0026, 0027, 0028 or 0029 — **including their verification
> steps**, which is the part the errors-log entry records as the one that gets missed.

## Tests to perform

**Layer rule, stated once.** `tests/Feature/` (`Livewire::test()`) owns everything provable from server
state — validation, authorization, persistence, query counts and rendered markup. `tests/Browser/` owns
**only** what a real DOM, a real event loop and real JS produce. Where a case appears at both layers,
each half proves something the other structurally cannot, and that is stated.

Scaffold with `php artisan make:test --pest Products/VariantBuilderTest`. Use `test()`, not `it()`; third
person; no "should".

### `tests/Feature/Products/VariantBuilderSkuPreviewTest.php`

- [ ] Adding a variant for Talla `M` on product `0001` persists **and renders** the **literal** `'0001-M'`.
      **Never** `toBe(VariantSku::derive(...))` — 0029 **FP15**, and worse here: the component itself calls
      `derive()`, so both sides would be the same wrong value twice over (**FP-V2**).
- [ ] 🔴 **The three-way ordering fixture** (see the table below), asserting the position-ordered literal.
- [ ] **Submission order is irrelevant**: the same three values set in reverse key order produce the
      identical literal. `$combinationRows` is a PHP array whose insertion order *is* the submission
      order, so this is a faithful reproduction of the payload vector.
- [ ] **A submitted `sku` is impossible to send**: the component exposes no `sku` property
      (`Livewire::test()->set('sku', …)` fails), and the rendered form contains no `sku`-named control
      and no hidden input carrying the preview.
- [ ] Casing is preserved **in both directions** — `L` stays `L` and `azul marino` stays lowercase.
      A single all-one-case assertion cannot fail against an implementation that upper-cases (0029
      **FP14**).
- [ ] An empty combination renders the placeholder, **not** a bare parent SKU.
- [ ] **After a successful create, the rendered SKU is re-read from the database**, not the preview
      string — **D-5 R2**. Arrange by mutating the attribute value's `value` directly in the database
      between `mount()` and `addVariant()`, then assert the listed SKU is the **new** derivation. *This
      test exists nowhere else in the project.*

**The three-way ordering fixture (0029 FP16, corrected).**

> 🔵 **`frontend-qa`'s correction to 0029's own test plan.** 0029 **FP16** requires that ordering by
> position, by name and by id/creation all **disagree**, and its worked example uses **two** attribute
> types. That is arithmetically impossible: two items admit only two permutations, so position-order can
> be separated from {name, id} order, but **name-order can never be separated from id-order**. The
> fixture needs **three** types.

| Type | Created | `position` | Name | Value |
| --- | --- | --- | --- | --- |
| T1 | 1st (earliest UUIDv7) | `2` | `Color` | `azul marino` |
| T2 | 2nd | `0` | `Acabado` | `Mate` |
| T3 | 3rd (latest UUIDv7) | `1` | `Talla` | `L` |

| Candidate ordering | Derived SKU |
| --- | --- |
| ✅ **`type.position`** (the rule) | `0002-Mate-L-azul-marino` |
| by type **name** | `0002-Mate-azul-marino-L` |
| by type **id** / creation | `0002-azul-marino-Mate-L` |
| by **submission** (T3, T1, T2) | `0002-L-azul-marino-Mate` |

All four distinct, so the test can only pass for the right reason. The value-level tail of the sort key
(`value.position, value.id`, 0029's **DIS-1** shape) is **unreachable from this UI** by construction
(**D-2**) — it stays 0029's test and this story must not claim it.

### `tests/Feature/Products/VariantBuilderTest.php`

- [ ] A full valid payload creates exactly one variant with exactly N pivot rows, `price` asserted as the
      **string** `'19.99'` (**T12**).
- [ ] The price is **pre-filled from the parent** on create and **from the variant** on edit, byte-for-byte.
- [ ] **A duplicate combination** throws `ValidationException` on **`combination`**, and the product still
      holds exactly **one** such variant **and** exactly **N** pivot rows. 0029 **FP1**: a variant-row
      count alone passes when the row rolled back but orphan pivot rows survived.
- [ ] **`derived_sku_taken` is a different refusal**: arrange a *product* literally named `0001-M`, add
      the Talla `M` variant of product `0001`, assert the key is **`sku`** and the message **names the
      conflicting product**. 0029 **D-4.5** case (a) — no index spans the two tables, so nothing but the
      application check can produce it.
- [ ] **The discriminator**: arrange a case where **both** are true and assert the **combination** message
      wins (0029 **D-4.5**'s deliberate ordering; mislabelling is **R-F**).
- [ ] Empty-segment and over-length refusals, each on **its own** key, each writing **zero** rows and
      **zero** pivot rows.
- [ ] **The builder never holds more than one unsaved variant** — a structural invariant of **D-3**.
- [ ] `closeForm()` clears the error bag (**D-8**), proven by a refused save followed by a fresh open.
- [ ] Deleting a variant removes its row **and** its pivot rows, and the freed combination **and SKU are
      immediately re-creatable** — the UI-layer proof of 0029 **D-6**'s "no `SoftDeletes`".
- [ ] `confirmDelete()` populates the label **and SKU** from the **database** (**D-5 R3**), proven by
      mutating the value's string between `confirmDelete()` and the assertion and asserting the modal
      shows the **new** SKU.
- [ ] 🔴 **Combination immutability, proven against the method rather than the markup**: `set()` a
      different combination on an **existing** variant and `call('saveVariant')` → the pivot's value-id
      set is **byte-identical** and both `combination_hash` and `sku` are unchanged. **FP-V16**: absent
      markup is not an absent method — `/livewire/update` reaches `saveVariant()` regardless of what
      renders.

### 🟣 `tests/Feature/Products/VariantBuilderGeneratorTest.php` *(new 2026-08-19, D-17)*

**Layer note that decides half of these cases.** 0029 owns the generator's *behaviour* — the cartesian
expansion, the skip-existing semantics, the savepoint isolation, the cap, the empty-type refusal, the
per-variant price/stock. Re-testing any of that here is exactly what
[what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md) forbids. **What is only provable here
is that the UI passes the right axes in and renders the right summary out** — plus the one thing no
backend test can reach, that a partial batch's `refused` rows are *visible*.

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
      `:refused` — asserted via `trans_choice`, never a hardcoded English sentence (**FP-V15**).
- [ ] 🔴 **A refused row renders its `label`, its `sku` and 0029's `message` individually**, arranged so
      the batch has **one refused and at least two created** rows: assert the two created variants
      **exist in the database**, the refused combination **does not**, and the refused row is
      **visible** on screen. This is the UI half of *"reported individually without blocking the rest"*
      and it is the single highest-value case in this file.
- [ ] **A skipped row is not styled as an error**: assert the skipped group renders **outside** the
      `flux:callout variant="danger"` that wraps `refused`.
- [ ] 🔴 **A skipped combination's existing variant is untouched** — arrange the existing variant with a
      non-default price **and** stock, generate again, assert **both** are byte-identical afterwards
      (`toBe('5.00')`, quoted, **T12**). 0029 guarantees this; this test proves the *UI* did not "helpfully"
      re-save it, which is a mistake only a component can make.
- [ ] **A wholly refused call renders no summary panel and leaves the modal open**, with the message on
      `attributeTypeIds` — one case per refusal: over the cap, an empty type, and nothing selected.
- [ ] **`attributeTypeIds` auto-renders** because the property name equals the bag key: assert the error
      appears **without** an explicit `flux:error` for it in the template (**D-17.1**). This is the one
      key on the screen where that is true, and a rename would silently break it.
- [ ] The summary is **cleared** by the next generation and by an explicit dismiss, and **survives** an
      unrelated round trip (opening the create form, changing a page) — **D-17.3**'s `#[Locked]`
      property, not a session flash.
- [ ] **Authorization pair for `generateCombinations()`**: allowed for an actor with `products.edit`,
      refused for one without — and the deny paired with **zero** new variant rows and **zero** pivot
      rows (0029 **FP5**: an exception raised after the write still throws).
- [ ] The trigger renders **disabled** from the same `$canManageVariants` computed the mutating path
      authorizes against, and is **absent entirely** when the catalog holds no attribute types.

### `tests/Feature/Products/VariantBuilderRenderingTest.php`

- [ ] A variant with no image renders the **parent's** image and the **inherited** badge; with its own
      image, its own and the **own** badge; with neither, 0027 **OQ-2**'s placeholder.
- [ ] 🔴 **The FP2 discriminator at the UI layer**: change the parent's `featured_media_id` to a different
      row, re-render, assert the inheriting variant now shows the **new** URL. A UI that snapshots the
      resolved URL at mount passes every other image test and fails only here.
- [ ] A variant created with no image persists `featured_media_id` as **literally NULL**.
- [ ] Reverting an own image sets it back to NULL and re-renders the inherited badge.
- [ ] **All four refusals are visible**, one test per key, asserting the message text **and** the
      container it renders in (**D-8** — three of four have no matching field and render nowhere by
      default).
- [ ] The combination is rendered as **static badges** on edit, with no enabled attribute control (**D-11**).
- [ ] Both empty states: no variants yet, and **no attribute types in the catalog** (with its link out).
      **FP-V17**: checking the latter only for "no exception" is a structural false positive — it passes
      even if the whole builder is broken, because nothing builder-related runs.
- [ ] **The three Flux/Blaze regression guards**: an *enabled* row action renders **no**
      `data-flux-tooltip-content` element; the disabled branch's `cursor-not-allowed!` sits on the
      `flux:tooltip` wrapper, not the button; every id in a `wire:*` argument went through `@js()`.
- [ ] Every row action carries its `data-test` hook on **both** branches.
- [ ] The Gallery embed is inside `@can('viewAny', Media::class)`, and an actor without `media.view`
      still renders the builder rather than a 403 (**T13**).
- [ ] The delete confirmation states the removal is **permanent** (**D-11**).

### `tests/Feature/Products/VariantBuilderQueryTest.php`

- [ ] **Warm-up call first** (0029 **FP7** — the first `Gate::authorize()` cold-loads all Spatie
      permission data; copy the design at `tests/Feature/Users/IndexTest.php:218-246`), then the query
      count for 1 variant equals the count for 10.
- [ ] 🔴 **Grow the second axis too**: 10 variants each with **three** attribute values vs. 10 with one.
      **FP-V11**: growing only the variant count cannot detect an N+1 on the `values` pivot — the very
      relation **D-6** found missing from 0029's **R-D**.
- [ ] The fixture uses **distinct** related rows (a distinct own image per variant, distinct values) —
      identical ones pass through Eloquent's identity map and hide the defect.
- [ ] The eager load is **used, not merely issued**: assert the rendered combination label and thumbnail
      are correct in the same test.
- [ ] 🟣 **Pagination (D-17.4)**: 30 variants render 25 rows on page 1 and 5 on page 2; the query count
      on page 2 equals page 1's (± the paginator's own count query, 0027 **D-4**'s allowance); and the
      **order is total across the page boundary** — page 1's last row sorts before page 2's first by
      `(position, sku)`. Arrange **tied `position` values** deliberately, or the `sku` tiebreak that
      makes pagination safe is never exercised.

### `tests/Feature/Products/VariantBuilderAuthorizationTest.php`

- [ ] One **allow/deny pair per method that mutates or discloses** — `openCreateForm`, `openEditForm`,
      `saveVariant`, `confirmDelete`, `deleteVariant`, `setVariantImage` and 🟣 `generateCombinations`
      (the seventh, **D-17.2**; its pair may live in `VariantBuilderGeneratorTest.php` instead, but it
      must exist somewhere and this list is the checklist) — driven through
      `Livewire::test()` as the acting user. A route-level 403 never reaches these: `/livewire/update`
      re-runs only the `PersistentMiddleware` allow-list.
- [ ] **Every deny paired with its absent side effect** (0029 **FP5**: an `AuthorizationException` raised
      *after* the write still throws).
- [ ] 🔴 **The cross-product target test**: as an actor allowed on product X, call `deleteVariant()` with a
      variant id belonging to product Y → refused, **and Y's variant still exists**. If the method
      resolves the parent from the client-held `$productId` rather than from `$variant->product`, an
      actor authorised on X is authorised for a delete on Y. **0029 cannot write this test (no
      component) and 0027 cannot (no variants) — it exists only here.**
- [ ] A `Super Admin` holding **zero** permission rows passes every one via `Gate::before`.
- [ ] `Gate::forUser($denied)->authorize(...)` **throws** — not merely `allows()` returning false.
- [ ] Permission-cache staleness: warm by asserting `true`, revoke via a role change, re-assert on a
      **freshly resolved** user, with **no** `forgetCachedPermissions()` between Act and Assert.
- [ ] **Named exception classes everywhere** — never `->throws(Exception::class)`, which
      `PermissionDoesNotExist` from an unseeded catalog satisfies (0029 **FP6**).
- [ ] `$canManageVariants` comes from the **same** policy method the mutating paths authorize against, so
      the disabled state cannot drift (**D-10** note 4).

### `tests/Browser/Products/VariantBuilderTest.php`

Deliberately few, per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md) and 0027
**R-6**. Each names the thing no server-side test can see.

- [ ] 🔴 **B1 — the null-`<select>` detector.** `assertScript("…selectedIndex", 0)` on every attribute
      select immediately after the form renders, **before any interaction** (**D-9**). This is the
      root-cause assertion and the only one that cannot be fooled.
- [ ] 🔴 **B2 — the live preview, with a non-identity value.** Pick Color `Marrón`, assert the DOM preview
      reads exactly `0002-Marron`, then add the variant and assert the **persisted** SKU is the same
      literal. **The single highest-value test in this story**: two bugs die here and only here — a
      missing `.live` modifier (invisible at component level, **FP-V4**) and a JS re-implementation of
      the formula (which gets `M`/`L`/`azul marino` right and `Marrón` wrong, so **every naive fixture
      passes it**).
- [ ] **B3 — the dependent-select reset (T2)**, driven by genuine clicks, asserting the **persisted**
      value. The fixture's type must offer **at least two real values**, or both implementations end on
      the same value and the test cannot fail.
- [ ] **B4 — cross-instance image routing.** With two variants listed, open the gallery for one, confirm,
      and assert the other variant, the product's **featured image** and the product's **gallery strip**
      are all untouched. Four Gallery instances now share one page (**D-6**); instance separation is a
      page-global event-name game resolved only in the browser.
- [ ] **B5 — in-page inheritance reactivity.** Change the **product's** featured image **without
      reloading** and assert the inheriting variant's thumbnail follows. **FP-V8**: changing it and then
      *reloading* re-runs `mount()` and passes against a snapshot implementation — the reload is the
      false pass.
- [ ] **B6 — each of D-4.5's three collision messages is *visible***, and it is the right one for each
      case (**R-F**).
- [ ] **B7 — the disabled row action** does not respond to a click, its `data-test` hook is present on
      both branches, and the tooltip appears on hover of the **`ui-tooltip` wrapper** (the button is
      `pointer-events-none`), while an **enabled** row renders **no** `data-flux-tooltip-content`.
- [ ] **B8 — `assertNoJavaScriptErrors()` after every step** of a full journey: open the editor, open the
      form, change each select, add a variant, open the gallery, confirm, open the delete modal, cancel,
      confirm. 🟣 **Extend the journey with the generator**: open the generate modal, toggle two
      checkboxes, confirm, dismiss the summary.
- [ ] 🟣 **B9 — the generate modal is a `<dialog>` that opens over the page and closes cleanly**, with
      the summary panel readable **after** it closes and the variants table visible behind it. This is
      **D-17.1**'s whole safety argument (no nested `<dialog>`, unlike the create form) and **D-17.3**'s
      "readable while looking at the table it changed" — both are DOM-layer claims that a component test
      cannot see.
- [ ] 🟣 **B10 — the live combination count updates as checkboxes are toggled**, driven by genuine
      clicks. Same failure mode as **B2**: a missing `.live` on the checkbox group is invisible to
      `Livewire::test()->set()` (**FP-V4**) and produces a count that never moves.

**Deliberately not in the browser suite:** every validation refusal's *rule* (component-level — re-driving
a server rule through Chromium costs 30× for no new signal), the authorization matrix, query counts, and
the ordering fixture.

### Assertions that would be false passes if written naively

**FP-V1 — the SKU preview asserted with a page-wide `assertSee`.** The parent's SKU, the preview and
every listed variant's SKU are on one page, so `assertSee('0001-M')` passes when the preview is blank and
a *listed* variant happens to carry it. Scope it to `[data-test=variant-sku-preview]`.

**FP-V2 — asserting a SKU by re-calling `VariantSku::derive()`.** 0029 **FP15** at one remove, and worse:
the component itself calls `derive()`, so the assertion compares the function against itself. **Every SKU
assertion in this story is a hand-written literal.**

**FP-V3 — the ordering fixture built from two attribute types.** Arithmetically cannot separate
name-order from id-order. Three types (above).

**FP-V4 — "the preview updates live", asserted at component level.** `Livewire::test()->set()` syncs the
property whether or not the view carries `.live`. A deferred binding passes every component test and
never moves a character in a real browser.

**FP-V5 — "no SKU is posted back", asserted by "the stored SKU is correct".** 0029 **D-4.3** makes the
action *ignore* a submitted `sku`, so the stored value is right in both worlds. Assert the **markup**.

**FP-V6 — a refusal asserted by "the modal stayed open" or a substring like `assertSee('already')`.**
Four distinct refusals reach this screen. Assert the specific key **and** where it renders.

**FP-V7 — duplicate-combination refusal asserted by variant row count alone** (0029 **FP1**). Assert the
pivot count too.

**FP-V8 — the inheritance test that changes the parent's image and then reloads.** The reload is the
false pass; only an in-session change discriminates.

**FP-V9 — a deny test asserting only that an exception was thrown**, and its UI twin: **asserting that
the button renders disabled**. A disabled button proves nothing about the method —
`/livewire/update` reaches it directly. Pair every disabled-hint assertion with a `Livewire::test()` call
of the same method as the same actor, plus the absent side effect.

**FP-V10 — `->throws(Exception::class)` in a permission test** (0029 **FP6**).

**FP-V11 — the N+1 test that grows only the variant count.** Cannot see the `values` pivot N+1.

**FP-V12 — variant-list ordering asserted with three `assertSee` calls.** They pass in any DOM order
(0029 **FP8**). Assert the exact sequence.

**FP-V13 — an enabled row action tested without a *negative* assertion on the Blaze tooltip.** The
conditionally-bound `tooltip` prop renders an empty bubble on every **enabled** row and breaks no text
assertion.

**FP-V14 — any `->select()`-driven test claimed as coverage for the null-desync.** Verified impossible
(**QA-V1**). This also invalidates the stated rationale of a **shipped** test (**QA-V2** / **R-3**).

**FP-V15 — a translated refusal asserted against a hardcoded English literal.** `APP_LOCALE=en` today;
the assertion rots silently under Epic 5. Use `__('products.variants.…')`. **The inverse holds for the
SKU: never `__()` there, always a literal.**

**FP-V16 — combination immutability proven only by the absent markup.** Absent markup is not an absent
method.

**FP-V17 — the "no attribute types" empty state checked only for "no exception".** Passes even if the
whole builder is broken.

**FP-V18 — a test that arranges a SKU collision by *passing a SKU*.** There is no such input. Collisions
are arranged by choosing the **fixture**; name the intended case (a/b/c per 0029 **D-4.5**) in the test
name, or the next reader cannot tell which one a fixture constructs.

🟣 **The four below were added on 2026-08-19 with the generator (D-17).**

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
table. Scope every summary assertion to `[data-test=generate-summary]`, the same discipline **FP-V1**
imposes on the SKU preview.

### Test-arrangement notes for Phase 3

- `beforeEach` in authorization files: `app(PermissionRegistrar::class)->forgetCachedPermissions();`
  **then** `$this->seed(RolePermissionSeeder::class);` — both halves load-bearing. **Never** flush between
  Act and Assert.
- Do **not** invoke the full `DatabaseSeeder` to arrange (it creates a `test@example.com` fixture user).
- **Pin any config a test depends on**, including setting it to `null` when "unset" is the assumed state
  (the task-0003 lesson in [errors-log.md](../../docs/errors-log.md)).
- The browser suite runs **Chromium only** in CI ([playwright-setup.md](../../docs/testing/frontend/playwright-setup.md)).

### Deliberately not tested here

| Not tested here | Owner |
| --- | --- |
| The derivation formula itself, `segment()`, the combination hash, the collision matrix, re-derivation cascades | 0029 |
| 🟣 The generator's **behaviour** — the cartesian expansion, iteration order, savepoint isolation, `MAX_COMBINATIONS`, the empty-type refusal, the one-query duplicate pre-read, and a generated variant's price/stock/NULL image | 0029 (**D-18**) |
| The referential-integrity FKs and the two attribute in-use guards | 0029 |
| The `DIS-1` two-values-of-one-type ordering tail (unreachable from this UI by construction) | 0029 |
| The product's own fields, list, delete, region picker and WYSIWYG | 0027 |
| The gallery's search, upload, tile cap and detail editing | 0019 / 0020 |
| The attribute-type/value repeater's own behaviour | 0030 |

## Expected outcome

A catalog administrator editing a saved product sees a **Variantes** section beneath the product form.
It lists every variant with its combination, its **stored** SKU, price, stock and a thumbnail badged
*Propia* or *Heredada* — an inheriting variant showing the product's own featured image, resolved at
read time, so changing the product's image changes what those variants show while a variant with its own
image is untouched.

Adding a variant is a form of paired attribute-type/value selects. As values are picked, the SKU
**appears and updates live** — `0001-M`, then `0002-azul-marino-L` — computed on the server by the one
`VariantSku::derive()` definition, ordered by the attribute types' own configured order rather than by
the order the administrator clicked, and rendered as read-only text. **There is no SKU field anywhere on
the screen**, nothing carrying a SKU is ever posted back, and once the variant is saved the list shows
the value the catalog actually stored rather than the text that was previewed.

A duplicate combination, a SKU some product already holds, an attribute value that reduces to nothing,
and an over-long derivation are each refused **visibly and distinguishably** — the SKU collision naming
the conflicting record and the two remedies the administrator can act on, since the SKU is not something
they can retype. An existing variant's price, stock and image are editable while its combination is shown
as fixed; changing a combination means removing the variant and building it again, behind a confirmation
that names the target and says the removal is permanent.

🟣 **And building them one at a time is no longer the only way.** A "Generar combinaciones" control in
the section header opens a modal listing the catalog's attribute types as checkboxes — pre-ticked with
the ones this product's variants already use — with a live count of how many combinations the current
selection would produce. Confirming it writes the whole cartesian product in one batch: combinations the
product already holds are **skipped without being touched**, a combination whose derived SKU some other
record already owns is **refused by name while the rest of the batch commits**, and an inline summary
panel above the table reports all three outcomes — *"8 variantes creadas, 2 ya existían, 1 con SKU en
conflicto"* — with every refused combination listed individually, naming the conflicting record and the
two remedies. The table beneath it, now paginated, already shows the rows the batch created.

Every one of those operations authorizes against the **parent product** before it does anything, and an
administrator who may view but not edit sees each action rendered disabled with an explanation.

Structurally: 0029's **four** actions, `ProductVariant`, `VariantSku`, `VariantCombination` and
`ProductPolicy`'s variant coverage acquire their **first and only** call sites, and Epic 2's product arc
closes.

## Acceptance criteria

- [ ] `App\Livewire\Products\VariantBuilder` exists as a **nested child** of 0027's editor, rendered only
      when the product is saved, with **no new route** and no sidebar entry.
- [ ] On `products/create` the builder is replaced by a notice that the product must be saved first.
- [ ] The variants list renders combination, stored SKU, price, stock and a thumbnail, ordered
      deterministically and asserted as an exact sequence, with an explicit empty state — and a second,
      distinct empty state when the catalog holds no attribute types.
- [ ] **A variant's SKU is previewed live as attribute values are chosen**, computed **server-side** by
      `VariantSku::derive()`, matching the literals `0001-M`, `0002-azul-marino` and
      `0002-azul-marino-L`, in the attribute types' `position` order regardless of the order the values
      were picked.
- [ ] **There is no SKU input of any kind** — no field, no `readonly` input, no hidden field, and no
      public `sku` property on the component — and nothing carrying a SKU is posted back.
- [ ] **The formula is not re-implemented client-side**, proven by a browser test using an attribute
      value whose `segment()` is not the identity (`Marrón` → `0002-Marron`).
- [ ] **After a successful create, the listed SKU is re-read from the database**, never the previewed
      string, and the variants list is a `#[Computed]` over a query rather than a `mount()`-time array.
- [ ] **A duplicate combination is refused visibly** on the `combination` key, with the product still
      holding exactly one such variant **and** exactly N pivot rows.
- [ ] 🟣 **Every one of 0029 D-15's six bag keys renders somewhere the administrator can see** — the
      four SKU refusals distinguishable from one another **by message**, plus `combination`,
      `attributeValueIds`, `featuredMediaId` and `attributeTypeIds` — with the SKU collision naming the
      conflicting record and the two available remedies. **Five of the six are unbound on this screen
      and render nowhere unless rendered explicitly**; `attributeTypeIds` is the one exception and only
      because the picker's property is named after it.
- [ ] 🟣 **A "Generar combinaciones" control writes the full cartesian product of the selected attribute
      types** through `GenerateProductVariantCombinations`, with the types pre-selected from the ones
      this product's variants already use, a live count of the resulting combinations, and **no price
      or stock asked for up front**.
- [ ] 🟣 **The generation summary is rendered from the action's returned array** — created, skipped and
      refused — using 0029's own `products.variants.generate.summary` key, as an inline panel that
      survives the modal closing; **each refused combination is listed individually** with its label,
      its derived SKU, 0029's message and the remedy hint, while the rest of the batch is committed and
      listed in the table.
- [ ] 🟣 **A skipped combination's existing variant is not re-saved** — its price and stock are
      byte-identical after a second generation — and **no "regenerate and overwrite" affordance exists**.
- [ ] 🟣 **A wholly refused generation (over the cap, an empty type, nothing selected) writes nothing,
      renders no summary panel, and leaves the modal open** with the message on `attributeTypeIds`.
- [ ] 🟣 **The variants list paginates at 25** with a total order (`position ASC, sku ASC`) that holds
      across the page boundary.
- [ ] **A variant with no own image renders the parent's featured image and is badged as inherited** —
      proven by a test that changes the parent's image and observes the variant follow — while
      `featured_media_id` stays NULL; a variant with its own image is unaffected; and an own image can be
      reverted to inherited.
- [ ] The variant image is picked through **one** `media.gallery` instance in single-select mode with its
      own distinct `select-event`, and a selection for one variant reaches no other variant, nor the
      product's featured image, nor its gallery strip.
- [ ] **An existing variant's combination cannot be changed** — proven against the *method*, not only the
      markup — while price, stock and image are editable.
- [ ] Removing a variant is behind a confirmation naming the target and stating that it is **permanent**,
      and the freed combination and SKU are immediately re-creatable.
- [ ] **Every one of the seven methods that mutate or disclose calls `Gate::authorize()` against the
      parent product as its first statement** (`generateCombinations` included), each with an allow and
      a deny test, each deny paired with its absent side effect — including the cross-product target
      test.
- [ ] The disabled-action hint comes from the **same** policy method the mutating path authorizes
      against, computed once rather than per row.
- [ ] The variants query eager-loads `featuredImage` **and `values.type`**, with no N+1 as either the
      variant count or the values-per-variant count grows.
- [ ] Every errors-log trap is honoured: no `wire:model`-bound value is ever `null` or absent, both
      placeholders are `disabled`, the dependent value select resets on a type change, `@js()` wraps every
      id in a `wire:*` argument, the disabled tooltip is a written-out branch, and `cursor-not-allowed!`
      sits on the wrapper.
- [ ] `lang/en/products.php` and `lang/es/products.php` are **extended** key-for-key identically, and no
      user-facing string is hardcoded.
- [ ] No migration, model, action, policy, enum, validation rule, factory, seeder, route or
      permission-catalog change is added by this story.
- [ ] Pint clean and Larastan level 7 clean.

## Definition of Done

- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] `vendor/bin/pint --dirty --format agent` clean and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] **No security findings (appsec-auditor). Point the audit at five things specifically:** (1) that no
      SKU value is reachable from the client in any form — no property, no hidden field, no `disabled`
      input that still posts; (2) that the preview's attribute-value **strings** are read back from the
      database and never taken from the payload (0029 **V-10**, of which this preview is a third
      consumer); (3) `#[Locked]` placement on `$productId`, `$editingVariantId`, `$deletingVariantId` and
      every id-carrying property, each assigned from a value read out of the database; (4) that
      `Gate::authorize()` targets `$variant->product` **re-read from the variant**, never the
      client-held `$productId` — the cross-product escalation the authorization test pins; and (5) the
      `@js()` encoding of every id in a `wire:*` argument.
- [ ] **Documentation updated (docs-keeper)**, with four specific items beyond the usual:
      `docs/api/routes.md`'s `products.edit` entry gains the embedded builder and its **fourth** gallery
      instance (0027 **D-8**'s table currently says three);
      `docs/architecture/authorization.md` records that `ProductPolicy` now covers variants **and has
      call sites for them**; **and the errors-log gains the `->select()` finding** described in **R-3**
      below — that Playwright's `selectOption` fires `change` unconditionally, so no `->select()`-driven
      test can be the regression net for the 2026-08-16 null-desync entry, and
      `tests/Browser/UsersIndexTest.php`'s comment claiming otherwise is wrong. The `assertScript`
      `selectedIndex` detector is the rule that replaces it.
- [ ] **Hand-offs discharged, recorded explicitly**: 0029 **D-12**'s zero-call-site enforcement gap
      (🟣 now **four** actions + `ProductPolicy`'s variant coverage), and 0029's own Definition-of-Done
      bullet *"render the variant SKU as read-only"*. Each is a checkbox in 0029's DoD; name which one
      this story satisfied.
- [ ] 🟣 **0029's four 2026-08-19 hand-offs discharged too**, each named in its DoD: **(a)** OQ-3
      **closed rather than re-debated** (done — see the [amendment note](#documented-functional-decisions));
      **(b)** every bag key rendered explicitly (**D-8**'s seven-row table); **(c)** the generator UI
      built against the **correct action name** `GenerateProductVariantCombinations` (**D-17.2** point
      1); **(d)** the `created`/`skipped`/`refused` summary rendered as a result table **and** the
      pagination consequence taken (**D-17.3**, **D-17.4**).
- [ ] **Amendments raised on other stories, not silently performed here**: **OQ-7** and **OQ-12** on
      **0027**; **OQ-10** on **0030**; ~~**OQ-3**~~ (🟣 **discharged** — 0029 **D-15**–**D-17**),
      **OQ-5** and ~~**OQ-6**~~ (🟣 **discharged** — resolved in **D-17.5**; the only thing left on
      0029 is the *conditional* `ReorderProductVariants`, which is raised **only if** the PO wants
      manual ordering) on **0029**. Every remaining one is to a story still in the `new` stage and
      therefore free to amend — but each must be *carried back*, not fixed in this story's Phase 3.
- [ ] **[OQ-1](#open-questions) answered before Phase 3 starts** — it is now the **only** blocking
      question, and it changes six `Gate::authorize()` lines plus a fixture. 🟣 **OQ-2 and OQ-3 are
      resolved** (2026-08-19) and no longer block anything; **[OQ-13](#open-questions)** (the paginator's
      page size) is a one-constant answer that can be given during Phase 3 without reopening a design.
- [ ] Acceptance criteria met.

## Dependencies, findings and risks

### Verified findings

Executed against this repository on 2026-08-18 during this debate. `FE-` are `frontend-expert`'s, `QA-`
are `frontend-qa`'s, `PO-` are `product-owner`'s own.

| # | Finding |
| --- | --- |
| **FE-V2** | `livewire/livewire` **4.3.3**, `livewire/flux` **2.15.0** (Free), `livewire/blaze` **1.0.12**, `laravel/framework` **13.19.0**, PHP **8.5.0**. |
| **FE-V3** | **Flux Free 2.15.0 has no `tabs`, no `combobox`, no `accordion`, no repeater primitive.** Drives **D-1** (section, not tabs) and **D-2** (hand-rolled repeater). |
| **FE-V4** 🔴 | **`flux:select`'s only variant renders a native `<select>`**, and its stub declares `'name' => $attributes->whereStartsWith('wire:model')->first()` then `$invalid ??= ($name && $errors->has($name))`. Two consequences: the errors-log desync trap applies at the source, **and a Flux field only auto-renders an error whose bag key exactly equals its `wire:model` path**. Decisive for **D-1** and **D-8**. |
| **FE-V5** 🔴 | **`flux:modal` renders a native `<dialog>`** inside `<ui-modal>`. 0027 **D-1** reason 1 is grounded in the real implementation. Drives **D-12**. |
| **FE-V6** | Livewire 4.3.3 **does** ship islands (`@island`/`@endisland`), with **zero** usages in this repo today. Recorded so **D-1**'s rejection of (D) is "not for this" rather than "not available". |
| **FE-V8** 🔴 | `lang/en/` and `lang/es/` contain **only `users.php`**. `products.php` does not exist; this story is its **seventh** writer. |
| **FE-V10** | `resources/views/livewire/users.blade.php` carries both Flux/Blaze trap comments verbatim. The house pattern to copy character-for-character. |
| **FE-V11** 🔴 | **The prototype contains no variants UI at all** — `grep -io "variante?s?\|atributos?\|combinaci[oó]n\|talla"` across `docs/arospe-handoff/project/` returns only three incidental `talla` hits in JS sample data. *(Independently found by `frontend-qa` as its **V-7**.)* |
| **FE-V12** | **PRD §2.2's variants block has exactly one creation scenario and it is singular** — *"When they generate the variant 'Size 40 / Color Black'"*. No bulk scenario anywhere. Load-bearing for **D-3**. |
| **FE-V14** | `flux/select/index.blade.php` and `flux/modal/index.blade.php` both open with `@blaze(fold: true, …)` — **Blaze folding is live on the exact components this screen is built from**. |
| **QA-V1** 🔴 | **`->select()` provably cannot detect the null-`<select>` desync.** `InteractsWithElements::select()` is a one-line pass-through to Playwright's `selectOption`, whose injected implementation does `select.value = void 0`, sets `option.selected = true`, then dispatches `input` **and** `change` **unconditionally**. *(Re-verified by `product-owner`: `InteractsWithElements.php:117-122` is literally `$this->guessLocator($field)->selectOption($option);`.)* |
| **QA-V2** 🔴 | **A shipped test in this repo makes a claim QA-V1 falsifies.** `tests/Browser/UsersIndexTest.php:114-117` argues that picking the first option *"is the only choice that actually exercises the fix"*. It is not. *(Re-verified by `product-owner` — the comment is at those exact lines.)* See **R-3**. |
| **QA-V3** | **`assertValue()` / `assertSelected()` cannot distinguish the two states either** — both resolve to Playwright's `inputValue()` → `select.value`, which returns `''` for a correctly-selected disabled placeholder **and** for `selectedIndex === -1`. |
| **QA-V4** 🟢 | **`assertScript(string $expression, mixed $expected = true)` exists** (`MakesElementAssertions.php:155`) and strict-compares against a live-page `evaluate()`. *(Re-verified by `product-owner`.)* This is what makes **D-9**'s detector possible. |
| **QA-V5** 🟢 | **Flux derives a select's `name` from its `wire:model` expression**, so `wire:model.live="combinationRows.0.typeId"` yields `name="combinationRows.0.typeId"` — a contract-derived selector needing **no new `data-test` hook**. *(Re-verified by `product-owner` at `select/variants/default.blade.php:3,39`.)* |
| **QA-V6** | Pest's `@`-prefixed selector resolves to `[data-testid=…], [data-test=…]`, and a bare string falls back to `[id]` → `[name]` → `getByText`. So both selector styles above work with no plumbing. |
| **QA-V9** | `CannotUpdateLockedPropertyException` exists, so "a locked property cannot be set from the client" is a nameable assertion. |
| **QA-V10** | The N+1 warm-up idiom is real and citable at `tests/Feature/Users/IndexTest.php:218-246`. |
| **PO-V1** | **Nothing in the dependency chain exists in code.** `app/Models/` holds `Role.php` + `User.php`; `app/Livewire/` holds `Actions/`, `Settings/`, `Settings/TwoFactor/`, `Users/`; `resources/views/livewire/` holds `auth/`, `settings/`, `users.blade.php`; `database/migrations/` holds 15 users-era files. **This story's entire interface contract is documented, not shipped** — 0027's **V-9** extended by four more stories. |
| **PO-V2** | **`ProductVariantValidationRules`' entity-prefixed method names were chosen for this story specifically.** 0029's files table says the prefixes exist *"because a variant editor composing this alongside `ProductValidationRules` fatals on a duplicate method"*. **D-13**'s "compose one trait only" is what makes the prefixes unnecessary in practice — they remain the safety net. |
| **PO-V3** | **No `product_product_attribute_type` table is specified anywhere.** 0029's **OQ-5a** parks it in "0030/0031"; 0030 shipped without it. So the declaration table is genuinely **unowned**, which is why **D-3** must fence it explicitly rather than inherit a decision. |

### Dependencies

Hard and blocking, in required order:
**0019 → 0020 → 0021 → 0022 → 0023 → 0024 → 0026 → 0027 → 0028 → 0029 → 0030 → 0031.**

Already-shipped work relied on: the seeded `products.*` permissions (0002), the `Gate::before` Super
Admin bypass and policy auto-discovery (0004), the Users list+modal+disabled-row-action pattern (0006),
and the wired-up browser suite (0006b).

### Risks

- **R-1 — 🔴 There is no design reference for this screen (FE-V11 / QA-V7).** Every other Epic 2 screen
  could settle an information-architecture argument by pointing at
  `docs/arospe-handoff/project/*.html` — 0027 **D-1** did exactly that, three times. The prototype
  contains **no variants UI whatsoever**. Every IA choice in **D-1**, **D-2**, **D-6**, **D-11** and
  **D-12** is argued from the backend contract, from PRD text and from this repo's precedents. **Phase 2
  should treat them as decisions to confirm, not as renderings of something already designed.**
- **R-2 — The SKU preview is the story's central mechanism and its failure modes are all silent.** A
  missing `.live`, a JS re-implementation, or a preview built from a stale option list each produce a
  screen that looks right. Mitigated by **D-4**, **D-5** and browser test **B2**; **not eliminated**.
- **R-3 — 🔴 The project's belief about how the null-`<select>` desync is tested is wrong (QA-V1/QA-V2).**
  A shipped test claims to be a regression net it cannot be. This story does not fix that test (out of
  scope), but it must not copy its reasoning, and the correction is a Definition-of-Done docs item.
- **R-4 — Four hand-rolled JS surfaces become five.** 0027 **R-6** already flags the featured gallery,
  the strip gallery, the WYSIWYG's internal gallery and the region picker running together for the first
  time. This story adds a fourth Gallery instance and a live-updating repeater to the same page.
- ~~**R-5 — Three real contract gaps in 0029**~~ 🟣 **CLOSED 2026-08-19.** All four (the count was
  four, not three, once `ProductAttributeValue::type()` was included) were amended into 0029 the same
  day: **D-15** the error-bag keys, **D-16** the trait including `variantFeaturedMediaIdRules()`,
  **D-17.1** the action signatures, **D-17.2** the named relations. The risk was *"cheap to amend now,
  expensive mid-Phase-3"* and it was taken while cheap. **The residual is one line, not zero**: 0029's
  amendment also revealed that this story had under-counted the unbound bag keys (five, not three), so
  **D-8**'s rendering obligation grew rather than shrank.
- ~~**R-6 — `position` is specified but not writable.**~~ 🟣 **RESOLVED 2026-08-19, and it was two
  risks wearing one name** — see **[D-17.5](#d-175--oq-6-resolved-two-halves-neither-of-which-needs-a-reorder-control-in-v1)**.
  The **image** half turned out not to exist: a variant has exactly one optional `featured_media_id`
  and 0029 rejects a variant gallery outright, so 0027's `SyncProductGallery` shape — a column whose
  reorder cannot be expressed through the published action signature — **has nothing to attach to
  here**. The **row-order** half is real, is accepted, and is now benign: 0029 **D-18.6** writes
  `position` in a deliberately useful order and this story ships **no reorder control**. It reopens
  only if a merchandising order is wanted, and then it starts with a `ReorderProductVariants`
  amendment on 0029 — described in **D-17.5**, deliberately **not** designed here.
- 🟣 **R-11 — the generator makes every "the table is small" assumption false at once.** Up to
  `MAX_COMBINATIONS` rows can appear in one gesture, each with a thumbnail, two badges and two row
  actions. **D-17.4** answers the query and ordering half with pagination, but three things are only
  provable at Phase 3: the **DOM weight** of a 25-row page with four Gallery instances already on it
  (**R-4**), whether the **summary panel** stays readable when `refused` holds tens of rows, and the
  interaction between `wire:key` stability and a paginator on a `#[Computed]` list.
- 🟣 **R-12 — the generator's happiest path is also its least tested one.** *"Generate across one type
  on a product with no variants"* produces a summary with an empty `skipped` and an empty `refused`,
  which is the fixture every naive test reaches for and the one that exercises none of **D-17.3**'s
  three groups. **FP-V19**–**FP-V22** exist for exactly this; the Phase 3 reviewer should check that at
  least one generator test arranges a batch with **all three** outcomes simultaneously.
- **R-7 — Seven writers on `lang/*/products.php`** (FE-V8). 0027's **R-7** at more than double the scale;
  a key missing from `lang/es` renders as its own raw key with no error.
- **R-8 — `price` is a string, not a float** (0024 **R-4**, 0029 **R-C**). `@property float` and
  `if ($variant->price > 100)` both read as correct and both are wrong. `toBe('19.99')`, with quotes.
- **R-9 — CI cannot open a database connection** (`ci-database-connection-gap.md`, still open). Inherited
  at its largest scale: this story's closure evidence spans feature **and** browser suites and can only
  come from a local run until that is fixed.
- **R-10 — Modelling this screen on Users.** Two specific over-reaches: a per-row authorization matrix
  (every ability answers identically — **D-10** note 4) and re-running 0029's validation suite one layer
  up.

## Open questions

~~Eleven. **OQ-1, OQ-2 and OQ-3 block Phase 3**; OQ-2 additionally changes this story's classification.~~

🟣 **Updated 2026-08-19. Twelve, of which three are resolved and one is new.** **OQ-2**, **OQ-3** and
**OQ-6** are **RESOLVED** — struck at the head, kept in place with their resolution recorded, because
the reasoning that produced each is what the amended contract is built on. **OQ-1 is now the only
question that blocks Phase 3.** **OQ-5** is narrowed rather than answered. **OQ-13** is new and does not
block. This story's classification did **not** change (see [Type](#type)).

> 🔵 **Bookkeeping note, not a question.** **OQ-12** is referenced twice in this document — in
> [Files → Conditional on an open question](#conditional-on-an-open-question) and in
> [Provenance](#provenance), as *"the 'changing this SKU re-derives N variant SKUs' notice on 0027's SKU
> field"*, with an *"(a) option"* — but was never written out in this section. It is a **0027**
> amendment either way; the new question below is numbered **OQ-13** so the dangling reference is not
> silently re-pointed at unrelated content.

**⚠️ OQ-1 — Confirm 0029's OQ-12: which ability gates variant create and delete?** 0029 recommends
**`products.edit` for all three** variant operations, on the reasoning that adding or removing a variant
is a *modification of an existing catalog record*. This story binds to it in **six** `Gate::authorize()`
calls and its whole authorization fixture. **Recommended: confirm as-is.** If it flips to
`products.create` / `products.delete`, six lines and one test file change.

**✅ ~~OQ-2~~ — RESOLVED 2026-08-19: the cartesian generator is IN SCOPE, option (b).**
*(was: the largest scope question, and it re-classifies this story — see the superseded
[D-3](#d-3--superseded-2026-08-19--was-single-variant-creation-only-the-cartesian-generator-is-a-named-scope-fence-with-a-named-backend-cost);
the UI is now specified in [D-17](#d-17--the-cartesian-generator-ui-oq-2-resolved-in-scope))*

> **Resolution.** The PO decided **(b) — yes, properly**, on 2026-08-19, and 0029 executed the
> precondition that option named: it added the batch action **first**, as
> [**D-18**](0029-product-variants-backend.md#d-18--the-cartesian-combination-generator)'s
> `GenerateProductVariantCombinations`. Three notes on how the resolution differs from the option as
> this story wrote it, each of which matters:
>
> - **The action is the per-row outcome contract, not the all-or-nothing batch.** (b) offered both; 0029
>   took the second, with one outer transaction and per-combination savepoints — so an existing
>   combination is **skipped**, a colliding SKU is **refused individually**, and only an *unexpected*
>   failure rolls the batch back.
> - 🔴 **The dry-run seam (b) also asked for was NOT bought.** 0029 **D-18.7** leaves it here as
>   [OQ-5](#open-questions), reasoning that the post-hoc summary already tells the administrator what
>   happened. So (b) shipped at about three-quarters of its stated price.
> - **The classification did not change**, contrary to what this question predicted: every
>   database-shaped consequence landed in 0029. See [Type](#type), which now argues this point by point.
>
> **The pagination linkage this question flagged was real and is taken**: the variants list paginates
> from the start at 25 (**[D-17.4](#d-174--the-pagination-consequence-decided-here-because-retrofitting-it-is-the-expensive-path)**),
> rather than being retrofitted after the component's public surface is set — which is the outcome
> 0027 **D-4**'s argument, quoted here originally, exists to produce.

Options (a) and (c) are recorded as **not taken**: (a) is superseded by the PO's decision (**FE-V12**
survives as a *finding* — the PRD still has no bulk scenario — but stops being an argument), and (c)
(N best-effort calls with the administrator owning the cleanup) is precisely what 0029 **D-18.2**'s
outer transaction was built to avoid.

**✅ ~~OQ-3~~ — RESOLVED 2026-08-19: all four contract gaps filled by 0029, exactly as recommended.**
*(was: four contract gaps in 0029 that 0031 cannot fill itself; all four cheap now, expensive during
Phase 3 — and they were taken while cheap)*

| Gap | Recommended | 0029's answer | Bound here in |
| --- | --- | --- | --- |
| (a) the bag key for `derived_sku_empty_segment` / `derived_sku_too_long` | `sku`, so all three render in one place | ✅ **`sku`** — all **four** SKU refusals share it, *"distinguished by their translation key, never by their bag key"*. 0029 published the complete **six**-key table | [**D-8**](#d-8--where-every-refusal-renders-and-why-none-of-them-renders-on-its-own) |
| (b) no `variantFeaturedMediaIdRules()` | 0029 adds the one method | ✅ added, `['nullable','string',Rule::exists('media','id')]`, and the whole trait written out — **seven** methods, still **no** `skuRules()` | [**D-13**](#d-13--price-and-stock-strings-pre-filled-and-identical-in-shape-to-0027s) |
| (c) the action signatures are never written down | named scalars, `string $price`, `ProductVariant` return | ✅ **four** signatures fixed (the generator is the fourth), named scalars over an `array $data` bag *"so a literal whitelist is structural rather than disciplinary"* | [**D-17.2**](#d-172--the-confirmed-action-surface-this-component-calls) |
| (d) `ProductAttributeValue`'s value→type relation is unnamed | `type()` | ✅ **`type(): BelongsTo`**, plus every other relation this contract referred to only in prose | [**D-6**](#d-6--inheritance-is-rendered-and-labelled-null-is-the-flag-and-it-stays-null) |

> **Two things the resolution added that the question did not ask for**, both of which change work here:
> the create action's array parameter is `$productAttributeValueIds` while its **bag key stays
> `attributeValueIds`** (**D-17.2** point 2 — do not harmonise them), and **`attributeValueIds` and
> `featuredMediaId` are also unbound on this screen**, which this story had not noticed. **D-8**'s
> table grew from four rows to seven and its headline count from three to five.

**OQ-4 — What does the preview show for a partially-chosen combination?**
- **(a) The derivation of the completed rows, explicitly labelled provisional _(recommended)_** — it is
  the only option that teaches **D-4.2**'s mid-string insertion before it surprises anyone.
- (b) Nothing until every row is complete. Simpler, but there is no "complete" to define under **D-3**:
  without a declaration table, any non-empty subset is a legitimate variant, so a one-row combination is
  not partial at all. This is why (a) is recommended despite (b) being the more conservative-looking
  answer.
- (c) The parent SKU alone. **Excluded** — `0002` is a real product SKU and would read as the variant's.

**OQ-5 — Should there be an *advisory* pre-save SKU-conflict check?** Because the preview is live but the
collision check only runs at save, an administrator can watch a preview form and then be refused.
- **(a) Yes, but only if 0029 exposes a read-only seam _(recommended)_** — e.g.
  `VariantSku::conflictFor(string $sku, ?string $ignoreVariantId): ?array`, so the cross-table query
  exists **once**. Without it the builder would hand-write **D-4.5**'s two-table query, which is exactly
  the second-copy drift **R-L** warns about.
- (b) No — accept the save-time refusal, which **D-8**'s remedy hint already makes actionable.
- (c) Yes, with the query written in the component. **Not recommended.**

> 🟣 **Narrowed 2026-08-19, still open, and now larger in one direction and smaller in another.** 0029
> **D-18.7** considered the dry-run seam and **declined it**, leaving it here by name. Two updates:
> **(i)** the single-variant case is unchanged and (a) remains the recommendation; **(ii)** the
> *generator* no longer needs it as badly as **OQ-2**(b) assumed, because its `skipped`/`refused`
> summary reports each outcome after the fact and nothing is half-written. The remaining argument for
> a seam is ergonomic, not correctness: an administrator who selects four axes and generates 60
> combinations learns about a collision only afterwards. **Recommendation unchanged — (a), and only if
> 0029 exposes the read-only seam**; it is now a smaller prize than it was this morning.

**✅ ~~OQ-6~~ — RESOLVED 2026-08-19: no reorder control, and half the question turned out not to
exist.** Full reasoning in
[**D-17.5**](#d-175--oq-6-resolved-two-halves-neither-of-which-needs-a-reorder-control-in-v1); the
original question and its three options are kept below.

> **Resolution, in two halves.**
>
> **Variant images — the question does not apply.** Checked against 0029's schema rather than assumed:
> a variant has **exactly one optional own image** (`featured_media_id`, a single nullable FK —
> [0029 **D-5**](0029-product-variants-backend.md#d-5--exact-schema)), and 0029 **D-9** rejects a
> variant gallery outright (*"PRD says 'an optional image', singular"*), repeating it in its scope
> fences as *"no `product_variant_media` gallery"*. **There is no multi-image strip on a variant,
> therefore no order, therefore nothing to reorder** — so 0024's `SyncProductGallery` ordered-array /
> index-position pattern has no surface to be applied to here, and the 0027-class bug **R-6** compared
> this to is *structurally absent* rather than deferred. **Reordering does not apply to a single-image
> field. Closed.**
>
> **Variant row order — option (c), and it is no longer "the worst of both".** 0029's amendment gave
> `position` two real writers (`MAX(position) + 1` on create, and the generator's cartesian sequence —
> [**D-18.6**](0029-product-variants-backend.md#d-186--input-rules-and-the-ordering-of-what-gets-generated)),
> so it is no longer the dead schema option (b) was aimed at. 0029 declined to add
> `ReorderProductVariants` (**D-18.7**) and records that no call site passes `UpdateProductVariant`'s
> `?int $position` (**D-17.1** point 5). **This story therefore ships no reorder affordance**, and must
> not fake one by calling the update action N times — that is the pairwise-swap corruption 0029 **D-8**
> forbids. The follow-up 0029 would need if a merchandising order is ever wanted is **described, not
> designed**, in **D-17.5**.

*Original question, retained:* **Confirm 0029's OQ-11 (`position` on variants) — and note it is not
expressible today.** 🔴 If `position` ships, a reorder needs a **whole-set rewrite in one transaction**
(0029 **D-8**, inheriting 0024 **D-8**'s "never pairwise swaps"). **0029 ships no
`ReorderProductVariants`, and `UpdateProductVariant` writes one row at a time** — so a reorder would be
N transactions, i.e. pairwise-equivalent.
- (a) **0029 adds `ReorderProductVariants(Product $product, array $orderedIds): void`** and 0031 ships
  move-earlier / move-later **buttons** _(was recommended; **not taken** — 0029 declined the action)_ —
  buttons rather than drag for 0027 **D-9b**'s reasons verbatim (WCAG 2.2 SC 2.5.7 requires a non-drag
  path anyway, and Flux Free ships nothing draggable). **Still the right shape if it is ever revisited.**
- (b) **OQ-11 resolves to not shipping the column** — a column no UI writes is dead schema by 0028
  **D8**'s own test, and UUIDv7 makes `ORDER BY id` creation order for free. **Not taken:** the column
  now has two backend writers, so its premise no longer holds.
- (c) Ship the column, ship no control — ~~the worst of both~~. ✅ **Taken**, and the judgement is
  withdrawn: with the generator populating `position` in the order the administrator wants to read,
  the absent control costs nothing.

**OQ-7 — Should 0027's create path redirect to `products.edit` instead of `products.index`?**
**(a) Yes _(recommended)_** — otherwise "create a product, then add its variants" bounces the
administrator to the list (**D-7**). One line in 0027's `save()`. (b) No; add a "Guardar y añadir
variantes" secondary button. (c) No change.

**OQ-8 — A "replace this variant's combination" affordance?**
**(a) No in v1 — the note plus Delete _(recommended)_** (**D-11**). (b) Yes — and then it must be
**create-then-delete**, with copy for the partial-failure window.

**OQ-9 — The variant price input's shape must match 0027's exactly.** **Recommended:
`type="text" inputmode="decimal"` on both screens**, with the server rule as the only authority. The
sub-question worth answering once: does `priceRules()` accept `19,99`? Moot at `APP_LOCALE=en`; Epic 5
makes it real.

**OQ-10 — Two amendments to 0030's attribute-type screen, both found from this story's composition point
(see [D-16](#d-16--the-attribute-value-rename-edge-case-resolved)).**
- (a) **A rename warning.** **Recommended: a non-blocking inline notice** in 0030's value repeater when
  an in-use value's text is edited, stating how many variant SKUs will be rewritten. Alternative: a
  blocking confirmation listing the affected variants — justified only if the physical re-labelling cost
  is real. **Not recommended: no warning**, which presents a catalog-wide mutation as a text edit.
- (b) 🔴 **The missing collision-error rendering.** **D-4.6** aborts a rename whole on any resulting SKU
  collision, so `products.variants.derived_sku_taken` can surface on a taxonomy screen that has no SKUs
  on it — and 0030 has no key, no field and no copy for it. **Recommended: 0030 renders it against the
  offending value row, naming the conflicting record.** This is a gap, not a preference.

**OQ-11 — 0029's OQ-18 is attributed to the wrong story.** It says *"0031 owns the reorder control and
should warn on it"* about **attribute-type** reordering; 0030 owns that screen (**D-15**).
**Recommended: re-point OQ-18 at 0030.** 0031 can at most render an informational note.

> 🟣 **2026-08-19: sharper, not weaker.** OQ-6's resolution means this story ships **no reorder control
> at all** (**D-17.5**), so OQ-18's premise — *"0031 owns the reorder control"* — is now false on both
> readings, not just on the attribute-type one. Re-pointing it at **0030** is the only correct
> disposition. 0029's amendment did not touch OQ-18.

🟣 **OQ-13 — What page size does the paginated variants list use?** *(new 2026-08-19, opened by
[D-17.4](#d-174--the-pagination-consequence-decided-here-because-retrofitting-it-is-the-expensive-path);
does **not** block Phase 3 — the mechanism is decided, only the constant is open)*
- **(a) 25, matching [0027](0027-products-list-and-editor-ui.md) **D-4**'s `->paginate(25)` _(recommended)_.**
  Two differently-paginated lists on one product screen is the same class of inconsistency **OQ-9**
  refuses for the two money inputs, and 25 already survived review one story over.
- (b) A larger page (50) on the argument that a generated batch of 40 should be visible at once.
  Weigh it against **R-11**: the page also carries four Gallery instances, a WYSIWYG and the region
  picker, and each variant row renders a thumbnail, two badges and two actions.
- (c) A page size that varies with the generator's outcome (*"show all the rows I just created"*).
  **Not recommended** — a list whose page size changes under the administrator is worse than one that
  is occasionally short, and it makes every ordering assertion conditional.
- Note the coupling to 0029's **OQ-19**: if `MAX_COMBINATIONS` moves off 200, the worst-case number of
  pages a single gesture produces moves with it. The page size does not need to follow.

## Provenance

Phase 1 (Three Amigos) debate for Epic 2, run on **2026-08-18** with `frontend-expert` (files and
approach) and `frontend-qa` (test design), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Derived from
[PRD §2.2](../../docs/PRD/PRD.md#22-products)'s *"Product variants (extends the prototype)"* Gherkin block
and [§2.3](../../docs/PRD/PRD.md#23-shared-media-gallery), and grounded in **full readings** of
[0029](0029-product-variants-backend.md) (2,306 lines, read in full — it was substantially redesigned on
the same day) and [0027](0027-products-list-and-editor-ui.md) (1,512 lines, read in full), plus
[0028](0028-product-attribute-types-and-values-backend.md),
[0030](0030-product-attribute-types-and-values-ui.md) and
[0020](done/0020-shared-media-gallery-modal-ui.md) for their data and embedding contracts, and the whole of
[errors-log.md](../../docs/errors-log.md).

**How the three roles were covered — stated plainly rather than implied.** Both specialists were
convened as subagents and **both delivered in full**, each executing its claims against this repository
rather than reasoning about them; neither wrote a file. `product-owner` read 0029, 0027, the PRD block,
`workflow.md`, `contracts.md`, the Gherkin guidelines and the errors log directly, then reconciled the
two contributions and independently re-verified **QA-V1**, **QA-V2**, **QA-V4** and **QA-V5** — the four
findings the test strategy turns on — before adopting them.

- **`frontend-expert`** is the source of **D-1**'s four-way comparison and its decisive error-bag
  argument, **D-2**'s repeater and keying rules, **D-3**'s costed generator analysis, **D-4**'s
  implementation, **D-6**'s corrected eager-load list, **D-7**, **D-11**, **D-12**, **D-13**, **D-14**'s
  fifteen-trap table, **D-15**, and findings **FE-V2**–**FE-V14**.
- **`frontend-qa`** is the source of the test plan's layer split, **D-5**'s three requirements and the
  stale-option-list divergence, **D-9**'s detector, the eighteen-item false-pass catalogue, the
  three-type ordering-fixture correction, and findings **QA-V1**–**QA-V10**.
- **`product-owner`** contributed **PO-V1**–**PO-V3**, resolved the **D-2** split, composed the Gherkin,
  and reconciled the two specialists' overlapping-but-different proposals for the combination control
  and for the dirty-parent-SKU case.

**Where the specialists split, and how it was resolved.** Exactly one substantive disagreement:
`frontend-expert` proposed an **add-a-row repeater** for the combination control, `frontend-qa` a **map
keyed by attribute type**. Both prevent 0029's **DIS-1** shape, which is the property that had to hold.
The repeater was chosen because the map renders one select pair per attribute type in the whole catalog
— unusable at 10¹–10² types — and because 0028/0030 already established the keyed-repeater pattern. **The
better half of the map proposal was adopted anyway**: **QA-V5**'s contract-derived
`[name="combinationRows.0.typeId"]` selector survives the change and is what **D-9**'s detector targets.
A second, smaller divergence — whether the builder should be disabled while the product's SKU field is
dirty (`frontend-qa`) or whether the child should not know about the parent's dirty state at all
(`frontend-expert`) — was resolved in favour of the latter, with the warning obligation moved onto 0027's
SKU field as **OQ-12**'s (a) option; the honest cost is recorded in **D-16(c)**.

**Three findings neither specialist was asked for and both would have been entitled to miss:**

1. **QA-V1/QA-V2 — a shipped test's stated rationale is false.** `tests/Browser/UsersIndexTest.php`
   claims to be the regression net for the 2026-08-16 null-`<select>` errors-log entry; Playwright's
   `selectOption` fires `change` unconditionally, so it cannot be. Carried as **R-3** and as a
   Definition-of-Done docs item rather than fixed here.
2. **The three-type ordering fixture.** 0029's own **FP16** demands three-way disagreement between
   position-, name- and id-order but illustrates it with **two** attribute types, which cannot produce
   it. A genuine correction to a dependency's test plan.
3. **D-5's stale-option-list divergence.** A preview built from a mount-time option list and a stored SKU
   derived from a database read-back can differ permanently, silently, with nothing wrong on either side
   — a UI-layer consequence of 0029's **V-10** that 0029 could not have seen, because it ships no
   component.

**The brief's hard question was answered rather than deferred.** [D-16](#d-16--the-attribute-value-rename-edge-case-resolved)
resolves what happens to a variant's SKU display when an attribute value in its combination is renamed:
0029's **OQ-13a** (re-derive) is endorsed with three concrete conditions, and the UI supplies an argument
0029 does not make — **the middle option (freeze on value rename, re-derive on parent-SKU change) is not
a cheap compromise but is unimplementable as specified**, because an honest preview would have to know
which of a variant's inputs had ever been renamed and nothing records that. What genuinely remains for a
human is recorded as **OQ-10**, not smuggled into a decision.

**Two of 0027's flagged bugs are noted but do not block this story.** 0027's **OQ-5** (0026's
`salesRegionIdRules()` re-validating every previously-assigned region, which would make a product with a
since-deactivated region unsaveable) and **OQ-6** (`SyncProductGallery`'s position-writing mechanism, and
the 0024/0026 disagreement about who calls it) are both about **product-level** sales-region and gallery
sync. Nothing in this story touches either path: the builder writes only `product_variants` and its
pivot, through 0029's own actions. They are recorded here as **known surrounding-system issues being
fixed in parallel**, not as this story's defects — but note the second-order effect: while 0027's OQ-5 is
open, a product carrying a deactivated region cannot be saved at all, which means its **editor page** —
and therefore this builder — is reachable but its parent form is not saveable. That does not break the
builder (variants save independently, **D-7**), and it is worth knowing before someone reports it as a
variant bug.

### 🟣 Amendment — 2026-08-19

**Not a new Three Amigos round.** This amendment is this story binding to
[0029's own amendment](0029-product-variants-backend.md#amendment--2026-08-19-four-contract-gap-fills-and-the-cartesian-generator)
of the same day, plus one PO scope decision. `product-owner` read 0029's D-15 through D-18 in full and
verified each claim against the amended document rather than against the summary of it; no subagent was
convened, because nothing here required a specialist judgement that was not already made in 0029.

**What changed in this document:**

- The [Description](#description) (four actions, eleven deliverables) and [Type](#type) (the
  classification restated point by point, and why 0029's `includes database-expert: yes` does not
  propagate).
- A new Gherkin feature — *Generating every combination at once*, **twelve** scenarios — plus a note in
  [PRD coverage](#prd-coverage) recording that the generator is PO-added scope, not PRD-derived.
- A dated amendment block at the head of [Documented functional decisions](#documented-functional-decisions).
- **D-3 superseded** (struck at the head, kept whole, with a point-by-point table of what each of its
  four arguments became) and replaced by **D-17** — the generator UI, in five subsections: the trigger
  and modal container, the axis picker, the confirmed action surface, the result summary, the
  pagination consequence, and OQ-6's resolution.
- **D-6**, **D-8**, **D-13** and **D-15** bound to 0029's now-published contract: the named relations,
  the six-key error table (grown to seven rows here, of which **five** render nowhere unless rendered
  explicitly — up from three), the seven-method trait, and the generator's translation keys with the
  two-owner split rule.
- Scope fences: the cartesian fence **struck and replaced** with the narrower set 0029 **D-18.7**
  leaves standing; the reorder fence tightened from *"unless OQ-6 says otherwise"* to a resolved *"none,
  and do not fake one"*.
- One new test file (`VariantBuilderGeneratorTest.php`, fifteen cases), two new browser cases
  (**B9**, **B10**), a pagination case in the query file, four new false passes
  (**FP-V19**–**FP-V22**), six new acceptance criteria, and two Definition-of-Done bullets.
- Risks: **R-5** and **R-6** closed with their resolutions recorded; **R-11** and **R-12** added.
- Open questions: **OQ-2**, **OQ-3** and **OQ-6** resolved; **OQ-5** narrowed; **OQ-11** sharpened;
  **OQ-13** (page size) added. **OQ-1 is now the only blocker.**

**Three judgements this amendment made that 0029 did not hand down**, each argued in place rather than
assumed: the generator's container is a **modal** (safe here precisely because it opens no Gallery, so
**D-12**'s nested-`<dialog>` rule is applied rather than broken); the result is an **inline summary
panel**, not a flash (a flash structurally cannot carry a per-row `refused` list) and not the modal (it
would cover the table it just changed); and the axis picker's property is named **`attributeTypeIds`**
so that it collides *deliberately* with 0029's bag key and auto-renders — the one place on this screen
where **FE-V4** works in our favour.

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Four items deserve an explicit look.
🟣 **Size — and it grew on 2026-08-19, which is the item Phase 2 should weigh first.** This story
carries a nested component, a live-derived read-only display, a keyed repeater, a fourth gallery
instance, an authorization surface of **seven** methods, and now a generator with its own modal, axis
picker, live count, summary panel and paginator. Two cut lines are available and they are not equally
good: the **image** half (**D-6**) is independently valuable and independently testable and was the
original recommendation; the **generator** half (**D-17**) is a cleaner cut *technically* — it touches
one new action, one new modal and one new test file, and the single-variant builder is complete
without it — but it depends on the builder existing, so it can only be a *follow-on*, never a parallel
split. ~~**OQ-2**, which is a genuine scope boundary that changes the story's classification.~~
🟣 **resolved — it did not change the classification** (see [Type](#type)), and what it changed instead
is the size above. **R-1**, since unlike every sibling screen this one has no design reference and its
information architecture is argued rather than rendered — 🟣 **and the generator UI has even less: no
prototype, no PRD scenario, no sibling screen in this codebase does anything like it**, so **D-17** is
the most purely-argued part of an already-argued story. And **the amendment load**: this story raised
six amendments across three other stories (0027, 0029, 0030) — 🟣 **two of them (OQ-3, OQ-6) are now
discharged**, leaving four (**OQ-5** on 0029, **OQ-7** and **OQ-12** on 0027, **OQ-10** on 0030), all
still in the `new` stage — cheap today, expensive once any of them enters Phase 3.

---

> **Link-integrity note for whoever moves this file.** Every relative link above is written for
> `ai-spec/tasks/` (two levels below the repo root). Moving this file to `in-progress/` or `done/` puts
> it **three** levels down and silently breaks all of them — `../../docs/...` must become
> `../../../docs/...`, and the sibling-task links (`0029-...md`) must become `../0029-...md`. This is a
> mandatory step, not a nicety: see
> [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move) and the
> [errors-log entry](../../docs/errors-log.md) recording the six `done/` files this already broke.
