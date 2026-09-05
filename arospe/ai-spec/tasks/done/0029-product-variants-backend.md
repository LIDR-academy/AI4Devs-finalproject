# [0029] Product variants — backend (combinations, per-variant SKU/price/stock, image inheritance)

## Description
Introduce `product_variants` as a first-class Epic 2 entity: a variant is a **specific combination
of attribute values** ("Size 40 / Color Black") belonging to one product, carrying a **derived** SKU
plus its own price and stock, and an **optional** featured image that falls back to the parent
product's at **read time** when unset. Two new tables (`product_variants` + the
`product_variant_values` combination pivot), the `ProductVariant` model, the create/update/delete
actions, and two uniqueness rules that are the hard part of this story: **no duplicate attribute
combination on a product**, and **a SKU namespace that spans both `products.sku` and
`product_variants.sku`**.

> 🔵 **Amendment — 2026-08-18: the variant SKU is computed, not typed.** The PO resolved
> [OQ-1](#open-questions) with a business rule that neither debated option anticipated: a variant's
> SKU is **derived** from the parent product's SKU plus the variant's attribute values
> (`0001` + Talla "M" → `0001-M`; `0002` + Color "azul marino" + Talla "L" → `0002-azul-marino-L`).
> It is never admin-typed. That deletes the `skus` registry table from this story entirely and
> shrinks the cross-table collision surface to three narrow, enumerable cases. **[D-4](#d-4--sku-is-derived-from-the-parent-products-sku-and-the-variants-attribute-values)**
> is rewritten around it; the superseded registry-vs-gap-lock debate is retained below its new
> content, marked as such, because it is still the record of *why* those options were closed.

> 🟣 **Amendment — 2026-08-19: four contract gap-fills, plus the cartesian generator.** Two separate
> things landed on the same day and are kept distinct throughout, because one is bookkeeping and the
> other is scope.
>
> 1. **Four contract gaps** that story **0031** found while designing the screen that consumes this
>    one, raised as [its OQ-3](../0031-product-variants-editor-ui.md#open-questions). They are all
>    *underspecification of things this story already decided*, not new decisions: the error-bag keys
>    two refusals throw on, one missing validation-rules method, the three action signatures, and the
>    Eloquent relations this story names in prose but never declares. Filled in as
>    **[D-15](#d-15--error-bag-keys-the-exact-key-every-refusal-throws-on)**,
>    **[D-16](#d-16--productvariantvalidationrules-written-out-in-full)** and
>    **[D-17](#d-17--action-signatures-and-named-relations)**.
> 2. **A genuine scope addition, decided by the PO**: this story now also ships a **bulk
>    "generate all combinations" action** — the full cartesian product of the selected attribute
>    types' values, created in one call. This **reverses** the scope fence that previously deferred
>    it, and it partially answers **[OQ-5](#open-questions)** (the generator: yes; the
>    `product_product_attribute_type` declaration table: still no). Specified as
>    **[D-18](#d-18----moved-to-0029b0029b-product-variant-combination-generator-backendmd-2026-09-04)**, now **[0029b](0029b-product-variant-combination-generator-backend.md)**.
>
> The classification does **not** change — see [Type](#type) for the reasoning, which is stated rather
> than asserted because "creates hundreds of rows" reads like a database question and is not one here.

> 🟠 **Amendment — 2026-09-04: this story FAILED Phase 2 INVEST on "Small" and was split three ways,
> plus eight doc-consistency defects fixed.** The Phase 2 reviewer's verdict was that **R-K**'s own
> size self-assessment was stale — dated 2026-08-18 and written about the derived-SKU amendment only,
> never re-evaluated after the 2026-08-19 generator addition *reversed a scope fence*. That is
> correct, and re-asserting "None blocks Phase 2" was not an acceptable answer to it. The story is now
> three:
>
> | Story | Scope |
> | --- | --- |
> | **0029** *(this file)* | the core: two tables, `ProductVariant`, the derived SKU, the combination hash, read-time image inheritance, the three single-variant actions, and the retrofits to 0024's shipped code (`productSkuRules()`, `CreateProduct`/`UpdateProduct`) and to 0028's `SyncProductAttributeValues` **rename** branch |
> | **[0029a](0029a-attribute-in-use-delete-guards-backend.md)** | the two **D-10** in-use guards against 0028's shipped delete paths — extracted per **R-K**'s own long-standing recommendation |
> | **[0029b](0029b-product-variant-combination-generator-backend.md)** | the **D-18** cartesian generator — the cleanest cut of the three: purely additive on top of `CreateProductVariant`, no schema, no shared file |
>
> **The eight doc-consistency defects fixed in this file**, each verified against the real shipped
> code rather than taken on the reviewer's word: (1) `productSkuRules()` does not exist — the shipped method
> is `productSkuRules(?string $productId = null)` and its body uses `Rule::unique(Product::class, 'sku')`
> with a ternary, not `->ignore()`; (2) `app/Actions/Products/` was a new base folder with no `CLAUDE.md`
> approval and no precedent — both classes move to `app/Actions/Products/` as invokable actions;
> (3) `ProductAttributeValue::type(): BelongsTo` **already exists** in 0028's shipped model, so it is
> a no-op, not work; (4) **D-12** is decided rather than punted (the actions self-authorize);
> (5) the two-pass validation shape from
> [array-validation-bounds.md](../../../docs/security/array-validation-bounds.md) is now mandatory on
> both id arrays; (6) `SyncProductAttributeValues`' rename branch is a **query-builder** mass update
> firing no model events, and its `23000` catch wraps only insert/update; (7) the in-use guard runs
> **after** `Gate::authorize()` (now specified in **0029a**); (8) the batch cap is computed by
> multiplying set sizes (now specified in **0029b**). **V-15**/**V-P**'s "0024 and 0028 are specs,
> not code" framing is also retired — both are in `done/`.

It is **backend only** — no screen, no route, no Livewire component. The variant-builder UI is the
paired story **0031**. Defining the attribute types and values themselves is already built by
**0028**. The bulk combination generator is **0029b**; the two attribute in-use delete guards are
**0029a**.

Covers [PRD](../../../docs/PRD/PRD.md#22-products) §2.2's *"Create a variant as an attribute
combination"*, *"A variant without its own image inherits the parent's featured image"*, *"A variant
with its own image uses that image"*, *"A duplicate attribute combination is rejected"*, and the
**"a variant"** example of *"Scenario Outline: A duplicate SKU is rejected"* — i.e. Products
acceptance criteria **3** and **4**.

## Type
backend | fullstack (related_task_id: **0031** — variant builder UI, debated 2026-08-19) | includes
database-expert: **yes**

> 🟠 **2026-09-04 — classification after the three-way split.** `includes database-expert: **yes**`
> is **unchanged**, and this file is where that `yes` belongs: it creates two tables, two unique
> indexes and a `restrictOnDelete()` FK contract inherited from 0028. **0029a** and **0029b** are both
> `includes database-expert: no` — neither adds a table, column, index or FK. The 2026-08-19
> blockquote that argued that point by point for the *generator* moved with the generator to
> **[0029b](0029b-product-variant-combination-generator-backend.md)**, where it is that story's own
> classification argument; it is reproduced there rather than summarised. The rest of this blockquote
> is retained as the record of that reasoning:
>
> *(retained, 2026-08-19 — now 0029b's argument, kept here because it is also the reason this story's
> own `yes` is about the tables and never about row volume)*
>
> - **No new table, column, enum or FK.** A generated variant is an ordinary `product_variants` row
>   with an ordinary set of `product_variant_values` rows. The generator is a loop over a cartesian
>   product in PHP, not a new shape of data.
> - **No new index, because the generator introduces no new access pattern.** Its one new read is
>   *"which combinations does this product already have?"*, and that is
>   `SELECT combination_hash FROM product_variants WHERE product_id = ?` — served as a **covering**
>   range scan by the existing `unique(product_id, combination_hash)`, whose leading column is
>   `product_id` (**D-14**). Note the shape this makes possible and which **D-18** mandates: **one**
>   query answers the duplicate question for the whole batch, so N combinations cost one read, not N.
> - **No chunked bulk insert, and therefore no schema consequence from performance at scale.** The
>   obvious "make it fast" move — `ProductVariant::insert([...])` — is **refused on three independent
>   grounds**, none of which is performance: it bypasses `HasUuids`, so no row gets a key; it bypasses
>   the per-row cross-table SKU existence check (**D-4.5**), which is a `lockForUpdate()` read on a
>   *different* table and cannot be batched away; and it writes a model this repo requires to be
>   written through instances (`base-standards.md`'s `User::delete()` rule, one model over). The real
>   cost control is the **batch cap** (**D-18.5**), which bounds the work instead of speeding it up.
> - **The residual that *is* real is a lock-hold window, not a storage problem** — the batch holds its
>   gap locks for the whole transaction. That is **R-O**, and its mitigation is the cap, not an index.
>
> If any of the above stops being true — most plausibly, someone proposing a real bulk insert or a
> denormalised per-product variant counter to make the generator's pre-read cheaper — the
> classification question genuinely reopens. Nothing in **D-18** as specified reaches that point.

## Three Amigos participants

`product-owner` (lead) + `database-expert` (schema, indexes, FK semantics, lock behaviour) +
`backend-qa` (test design) + `backend-expert` (files and approach).

> **Process note — how this debate was actually run.** `database-expert` and `backend-expert` were
> both convened as subagents and both delivered in full, each executing its claims against this
> repository rather than reasoning about them — every **V-** finding below is a command result. The
> **`backend-qa` dispatch was refused by the platform** (concurrent-subagent pool saturated, hard
> limit, no retry), so `product-owner` performed the QA contribution inline, grounded by reading
> [`tests/Pest.php`](../../../tests/Pest.php),
> [`tests/Feature/Users/IndexTest.php`](../../../tests/Feature/Users/IndexTest.php), `docs/testing/**`
> and 0024/0028's own test sections rather than invented.
>
> ⚠️ **The two experts reached opposite conclusions on this story's central decision** — the
> cross-table SKU mechanism — and both positions are backed by execution. That split was escalated
> as **OQ-1** and is now **closed**: on **2026-08-18** the PO answered it with a third rule neither
> expert proposed (a **derived** variant SKU), which supersedes both options rather than picking one.
> See **[D-4](#d-4--sku-is-derived-from-the-parent-products-sku-and-the-variants-attribute-values)**
> and [Provenance](#provenance). The experts' positions are retained under
> [the superseded debate](#superseded--the-registry-vs-gap-lock-debate-2026-08-18) because their
> *verified findings* still constrain what may be built.

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Product variants as attribute combinations

  Scenario: Create a variant as an attribute combination
    Given a catalog administrator, with a product offering the attribute types Size and Color
    When they create the variant "Size 40 / Color Black" with its own SKU, price and stock
    Then that variant is saved against the product carrying every one of those values

  Scenario: A duplicate attribute combination is rejected
    Given a catalog administrator, with the variant "Size 40 / Color Black" already on a product
    When they try to add the combination "Size 40 / Color Black" to that same product again
    Then saving is rejected with a validation message
    And the product still holds exactly one "Size 40 / Color Black" variant

  Scenario: A combination offered in a different order is still a duplicate
    Given a catalog administrator, with the variant "Size 40 / Color Black" already on a product
    When they try to add the combination "Color Black / Size 40" to that same product
    Then saving is rejected with a validation message

  Scenario: The same combination is allowed on a different product
    Given a catalog administrator, with the variant "Size 40 / Color Black" on one product
    When they add the combination "Size 40 / Color Black" to a different product
    Then the variant is saved against that other product

  Scenario: A combination that is a subset of an existing one is not a duplicate
    Given a catalog administrator, with the variant "Size 40 / Color Black" already on a product
    When they add the combination "Size 40" to that same product
    Then the variant is saved as a distinct combination

  Scenario: Deleting a product removes its variants
    Given a catalog administrator, with a product holding three variants
    When they delete that product
    Then none of its three variants remain in the catalog

Feature: Variant featured-image inheritance

  Scenario: A variant without its own image inherits the parent's featured image
    Given a catalog administrator, with a variant that has no featured image of its own
    When the variant's featured image is resolved
    Then the parent product's featured image is used

  Scenario: Changing the parent's image changes what an inheriting variant shows
    Given a catalog administrator, with a variant that has no featured image of its own
    When they change the parent product's featured image
    Then the variant resolves to the parent's new featured image

  Scenario: A variant with its own image uses that image
    Given a catalog administrator, with a variant that has its own featured image
    When the variant's featured image is resolved
    Then its own featured image is used instead of the parent's

  Scenario: Changing the parent's image leaves a variant with its own image untouched
    Given a catalog administrator, with a variant that has its own featured image
    When they change the parent product's featured image
    Then the variant still resolves to its own featured image

Feature: A variant SKU is derived from its product and its attribute values

  Scenario: A single-attribute variant takes the parent SKU plus its attribute value
    Given a catalog administrator, with the product "Camiseta" using the SKU "0001"
    When they create the variant for the Talla value "M"
    Then the variant is stored with the SKU "0001-M"

  Scenario: Spaces inside an attribute value become hyphens
    Given a catalog administrator, with the product "Pantalón" using the SKU "0002"
    When they create the variant for the Color value "azul marino"
    Then the variant is stored with the SKU "0002-azul-marino"

  Scenario: A multi-attribute variant appends every value in attribute-type order
    Given a catalog administrator, with the product "Pantalón" using the SKU "0002" and the attribute types Color then Talla
    When they create the variant for the Color value "azul marino" and the Talla value "L"
    Then the variant is stored with the SKU "0002-azul-marino-L"

  Scenario: The order the administrator submits the values in does not change the SKU
    Given a catalog administrator, with the product "Pantalón" using the SKU "0002" and the attribute types Color then Talla
    When they create the variant submitting the Talla value "L" before the Color value "azul marino"
    Then the variant is stored with the SKU "0002-azul-marino-L"

  Scenario: Reordering the attribute types changes the SKU of variants created afterwards
    Given a catalog administrator, with the attribute types ordered Talla then Color
    When they create a variant of the product "0002" for the Color value "azul marino" and the Talla value "L"
    Then the variant is stored with the SKU "0002-L-azul-marino"

  Scenario: A catalog administrator cannot type a variant SKU
    Given a catalog administrator creating a variant of the product "0001"
    When they submit a SKU of their own alongside the attribute values
    Then the submitted SKU is ignored and the derived SKU is stored instead

Feature: SKU uniqueness across the whole catalog

  Scenario: A derived variant SKU that a product already uses is rejected
    Given a catalog administrator, with a product already using the SKU "0001-M"
    When they create the Talla "M" variant of the product "0001"
    Then saving is rejected with a validation message naming the conflicting product
    And the catalog still holds exactly one record using the SKU "0001-M"

  Scenario: A product SKU that a variant already derived is rejected
    Given a catalog administrator, with the product "0001" already holding the Talla "M" variant
    When they try to save a product with the SKU "0001-M"
    Then saving is rejected with a validation message
    And the catalog still holds exactly one record using the SKU "0001-M"

  Scenario: Two attribute values that reduce to the same SKU segment collide
    Given a catalog administrator, with the product "0002" already holding the Color "azul marino" variant
    When they create the Color "azul-marino" variant of that same product
    Then saving is rejected with a validation message

  Scenario: Two products whose SKU prefixes overlap can derive the same variant SKU
    Given a catalog administrator, with the product "0001-M" holding the Talla "L" variant
    When they create the Talla "M-L" variant of the product "0001"
    Then saving is rejected with a validation message

  Scenario: A derived variant SKU differing only in letter case is treated as the same SKU
    Given a catalog administrator, with a product using the SKU "0002-AZUL-MARINO"
    When they create the Color "azul marino" variant of the product "0002"
    Then saving is rejected with a validation message

  Scenario: Saving a variant without changing its combination keeps its SKU
    Given a catalog administrator, with an existing variant using the SKU "0001-M"
    When they save that same variant with a new price
    Then the save is accepted
    And the variant keeps the SKU "0001-M"

  Scenario: Renaming the parent product's SKU re-derives its variants' SKUs
    Given a catalog administrator, with the product "0001" holding the Talla "M" and Talla "S" variants
    When they change that product's SKU to "0009"
    Then its variants are stored with the SKUs "0009-M" and "0009-S"

  Scenario: Renaming the parent product's SKU into a collision is rejected whole
    Given a catalog administrator, with the product "0001" holding the Talla "M" variant, and a product using the SKU "0009-M"
    When they change the product "0001" SKU to "0009"
    Then saving is rejected with a validation message
    And the product still uses the SKU "0001" and its variant still uses "0001-M"

Feature: Managing variants requires the products permission

  Scenario: An administrator without the products permission cannot create a variant
    Given a signed-in administrator who does not hold the products management permission
    When they try to create a variant of a product
    Then the action is refused and no variant is created

  Scenario: An administrator without the products permission cannot update a variant
    Given a signed-in administrator who does not hold the products management permission
    When they try to change an existing variant's price
    Then the action is refused and the variant is unchanged

  Scenario: An administrator without the products permission cannot delete a variant
    Given a signed-in administrator who does not hold the products management permission
    When they try to delete an existing variant
    Then the action is refused and the variant still exists
```

> 🟠 **Two Gherkin features moved out of this file on 2026-09-04**, with the split. *"Generating every
> attribute combination at once"* (eight scenarios) is now
> **[0029b](0029b-product-variant-combination-generator-backend.md)**'s, and *"Attribute values in use
> by variants cannot be removed"* (three scenarios) is now
> **[0029a](0029a-attribute-in-use-delete-guards-backend.md)**'s. The authorization scenario that used
> to sit at the tail of the second feature is **rewritten and kept here**, expanded from one
> abstract *"authorization is evaluated"* line into three concrete per-action ones — because **D-12**
> is now a real decision (the actions self-authorize) rather than a hand-off, so this story finally
> has an enforcement path of its own to assert against.

## Documented functional decisions

### D-1 — Domain artifacts only; no Livewire component, route or view

0024's **D-1** precedent applies verbatim and for the same distinguishing reason: 0019 shipped a
component class because its media gallery is **modal-only with no route**, so the component class
was the only server surface a consumer could reach. Variants have an ordinary builder screen coming
in **0031**, so no such forcing function exists.

🟠 **Corrected 2026-09-04.** This paragraph used to read: *"Consequence, stated plainly: like 0024 and
0023 before it, this story ships **no enforcement path** for variant CRUD — the actions do not
self-authorize (**D-12**). That is a hand-off recorded in the Definition of Done, not an oversight."*
That is no longer true and was the deferral Phase 2 refused. **The three variant actions self-authorize
(D-12.1)**, so this story ships a complete enforcement path for variant CRUD despite shipping no
screen — exactly the property that lets a queued job, Artisan command or future REST controller
inherit the same refusal the dashboard will get. What 0031 still owns is the *second* layer (component
re-checks) and the route gate, not the only layer.

### D-2 — The combination is a **normalized pivot**, never a JSON column *(verdict is not close)*

Ship `product_variant_values`. The JSON alternative was evaluated properly and lost on a decisive
point plus five supporting ones.

**Decisive: a JSON design cannot satisfy a frozen contract this story inherits.** 0028's **D4**
states that *"the combination pivot's FK to `product_attribute_values` must be `restrictOnDelete()`,
never `cascadeOnDelete()`"*. A JSON blob cannot carry a foreign key, so a design with no FK cannot
implement a decision *about* that FK's delete behaviour. This is not a tradeoff — it is out of
contract.

| Criterion | (A) pivot | (B) JSON column |
| --- | --- | --- |
| 0028 D4's mandated `restrictOnDelete()` | `foreignUuid(...)->constrained()->restrictOnDelete()` — the rule **is** the DDL | impossible |
| 0028 D1 reason #1 ("the pivot FK *is* the guarantee a combination references values, never types") | preserved | discarded — a JSON id could reference a type, a deleted value, or a random string, and nothing in SQL notices |
| 0028 D7's in-use count | one covering range scan (**V-G**) | `JSON_CONTAINS` per candidate → table scan, or a multi-valued index that still yields zero referential integrity |
| Uniqueness indexing | composite unique on the hash (**D-3**) | **a JSON column cannot carry a `UNIQUE` index at all** — `ERROR 3152` (**V-E**). (B) does not even solve the problem it is proposed for |
| Canonical ordering | a set is a set | JSON *arrays* are order-sensitive (**V-F**), so the app must canonically sort before every write |
| Reversibility | pivot → JSON is a trivial `GROUP_CONCAT` | JSON → pivot is a PHP backfill with no way to validate the ids it finds |
| House precedent | 0019 **D8** rejected JSON for conversion paths; 0016 rejected native `ENUM` | would be this codebase's **first** JSON domain column (**V-I**: zero today outside the vendored `passkeys.credential`) |

This directly answers the project's stated preference for explicit, queryable schema over JSON blobs:
the preference holds, and here it is not even a close call.

> **Note on `combination_hash` (D-3), pre-empting the obvious objection.** It is not "JSON-lite". It
> stores no attribute identity, is never joined, never read for meaning, never rendered, and is a
> pure function of the pivot. It is a uniqueness key in the same family as `media.path`'s unique
> index — a last-word guard, not a data store.

### D-3 — Duplicate combinations: a `combination_hash` column + `unique(product_id, combination_hash)`

A set of N unordered value ids, with N varying per product, has **no** plain composite `UNIQUE`
expression. Four mechanisms were evaluated; three were rejected on verified grounds.

| Mechanism | Verdict |
| --- | --- |
| A generated/virtual column derived from the pivot | **Impossible — verified.** MySQL 8.4.10 rejects a subquery in a generated-column expression (`ERROR 3102`, **V-C**), and a `CHECK` constraint likewise (`ERROR 3815`, **V-D**). A generated column can only read its own row. Recorded so nobody re-proposes it. |
| Application-only, pivot as the sole record | **Rejected as the sole mechanism.** Set-equality over a variable-cardinality pivot is relational division — there is **no single index entry to lock**, so unlike the SKU case (**D-4**) *no* race guard is available. Two concurrent creates of the same combination both pass and both commit. |
| Lock the parent `products` row for every variant write | **Rejected, but genuinely weighed.** `SELECT ... FROM products WHERE id = ? FOR UPDATE` does serialise variant creation per product and does close the race. It fails because it is discipline, not a constraint: any writer that forgets the lock silently reopens the hole, and nothing in the schema records that the rule exists. |
| ✅ **`combination_hash` + `unique(['product_id','combination_hash'])`** | **Recommended.** The only mechanism that makes the invariant a database fact, and it reuses this repo's established shape — application check first, unique index as the last word, `23000` caught and rethrown (`sku`, `media.path`, `users.pending_email`). |

**The hash, specified exactly — one definition, never a second copy:**

```php
// app/Actions/Products/HashVariantCombination.php
/** @param  array<int, string>  $productAttributeValueIds  ids ALREADY READ BACK FROM THE DATABASE */
public function __invoke(array $productAttributeValueIds): string
{
    $canonical = collect($productAttributeValueIds)->unique()->sort(SORT_STRING)->values()->implode('|');

    return hash('sha256', $canonical);   // 64 lowercase hex chars
}
```

> 🟠 **Where this class lives, corrected 2026-09-04 (Phase 2 defect 2).** It was specified at
> `app/Support/VariantCombination.php` until this pass. **`app/Support/` does not exist in this
> repository and would be a new base folder**, which `CLAUDE.md` forbids without approval
> (*"Stick to existing directory structure; don't create new base folders without approval"*) — and
> this story never gave the justification that would be needed. The two candidates that remain, and
> why the second wins:
>
> - **Directly under `app/Actions/`**, beside [`App\Actions\NormalizeForSearch`](../../../app/Actions/NormalizeForSearch.php) —
>   the repo's one real precedent for a pure function belonging to no single domain. **Rejected**,
>   because [base-standards.md](../../../docs/conventions/base-standards.md#directory-structure) states
>   that branch as *"or directly under `app/Actions/` **if it belongs to none**"*, and this one
>   belongs squarely to the Products domain. `NormalizeForSearch` is shared by four different areas;
>   this class has exactly one.
> - ✅ **`app/Actions/Products/`** — the existing, approved subfolder that already holds every other
>   class this story writes. **Chosen.** No new folder, no approval needed, and the class sits with
>   the domain it serves.
>
> Two consequences of filing it as an action rather than as a static utility, both deliberate:
> **the class is invokable and container-resolved** (`app(HashVariantCombination::class)($ids)`),
> matching `NormalizeForSearch` and every other action in this repo — never `new`-ed, including in
> tests, per [code-style.md](../../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method)'s
> rule that *"a zero-argument constructor is not a contract"*; and **it is named as an imperative
> verb phrase** (`HashVariantCombination`, not `VariantCombination`), per
> [naming.md](../../../docs/conventions/naming.md#classes). Its unit test mirrors the app path:
> `tests/Unit/Actions/Products/HashVariantCombinationTest.php`.

> 🔴 **The single highest-risk line in this story, and it is invisible on inspection (V-10).** The
> ids fed to `__invoke()` **must be read back out of the database**, never taken from the client's
> payload:
>
> ```php
> // in CreateProductVariant, before hashing
> $ids = ProductAttributeValue::query()->whereIn('id', $submittedIds)->pluck('id')->all();
>
> if (count($ids) !== count(array_unique($submittedIds))) {
>     throw ValidationException::withMessages(['attributeValueIds' => __('validation.exists', [...])]);
> }
> ```
>
> **Why:** `utf8mb4_unicode_ci` makes `Rule::exists()` **case-insensitive**, so a submitted
> `V-40` validates happily against a stored `v-40` — but `sha256('V-40|…') !== sha256('v-40|…')`.
> A case-varied payload therefore passes every validation rule **and produces a different
> combination hash**, walking straight past `unique(product_id, combination_hash)` to create a
> genuine duplicate combination. Verified by execution (**V-10**). The naive version — hashing what
> the client sent — looks obviously correct and passes every test written from the UI's
> perspective, because a UI never varies the case of a UUID. It needs its own test driven with
> deliberately upper-cased ids (**FP11**). The read-back doubles as the existence check, and the
> `whereIn`/`pluck` collapses `[A, A, B]` to `[A, B]` for free.
>
> `SORT_STRING` is explicit because PHP's default `sort()` flags compare numeric-looking strings
> numerically; `'|'` rather than `','` because it cannot occur in a UUID.
>
> 🔵 **2026-08-18 — V-10 is unchanged by the derived-SKU amendment, and now guards *two* derived
> artifacts.** V-10 was never a finding about the `skus` registry; it is a finding about hashing
> client-supplied ids, so nothing about dropping the registry touches it. What the amendment adds is
> a **second** consumer of the same read-back: **D-4**'s SKU derivation needs each attribute value's
> `value` *string*, and a payload that passes `Rule::exists()` case-insensitively can just as easily
> name a different row than the one the administrator meant. **One read-back serves both** — select
> `id` *and* `value` (and the owning type's `position`) in the same query, and derive the hash and
> the SKU from that single result set. Never issue a second query for the strings, and never mix
> database-read ids with payload-read strings.

- **Input is value *ids*, never value *strings*.** 0028 supports renaming a value; hashing `"Black"`
  would invalidate every hash the moment an administrator types `"Negro"`. 0028's **D4** diff-not-
  recreate design exists precisely to keep those ids stable, which makes **this hash its first real
  consumer** — that story's "id stability across a no-op re-save" test is transitively this story's
  regression net.
- **Computed in PHP, never `SHA2()` in SQL.** It must exist *before* the insert (for the pre-check
  and the error message) and must be identical on SQLite, which has no `SHA2()`. Unsalted and
  unkeyed, so it is reproducible across deploys and in tests.
- **`sha256`, not `md5`/`crc32`.** Not a security control, so collision *resistance* is not the
  argument. The argument is that a collision's user-visible failure mode is a **false rejection**
  ("this combination already exists" for a genuinely new one) — unexplainable and undebuggable — and
  sha256 deletes that conversation for microseconds.
- **`char(64)`, not `binary(32)`.** `binary(32)` halves the index footprint but costs
  `hex()`/`unhex()` at every boundary, unreadable assertions and `SELECT` output, and a cast nobody
  else in this repo uses. At 10²–10⁴ variants the saving is ~2 MB at the extreme. Ergonomics win.
- **No per-column charset.** `ascii_bin` was considered and rejected on 0024 **D-11**'s exact
  precedent: SQLite ignores per-column collation, so it would be a MySQL-only rule, and it would be
  this schema's first per-column charset. The residual under `utf8mb4_unicode_ci` is
  case-insensitive comparison, which for app-generated lowercase hex has nothing to act on — and
  fails *closed* if it ever did.
- **NOT NULL.** The empty set hashes to a well-defined constant, so there is no "no combination yet"
  state.

**Preventing hash/pivot drift — the real objection, answered by making the fact write-once:**

1. **A variant's combination is immutable after creation** (**D-13**). `CreateProductVariant` writes
   the row and its pivot rows in one transaction; `UpdateProductVariant` may write
   `sku`/`price`/`stock`/`featured_media_id`/`position` and **must never touch the pivot or the
   hash**. Editing a combination means deleting the variant and creating a new one.
2. **Single writer.** Expose the relation read-only (`values()`); the pivot is written only by the
   create action. Do **not** hand out a public `attach()`/`sync()` surface a future component could
   reach for — the same reasoning `base-standards.md` gives for `User::delete()`.
3. **A cheap consistency test that catches the whole class**: create N variants via the factory,
   then for every row assert `combination_hash === app(HashVariantCombination::class)($row->values->pluck('id')->all())`.
   It goes red the moment a second writer appears.
4. Because the hash is derived from the pivot and never the reverse, drift is always **recoverable
   by recomputation** — there is no scenario where information is lost, only one where a duplicate
   slips through until a recompute.

**The pivot's composite PK is still required — and know its limits.**
`primary(['product_variant_id','product_attribute_value_id'])` prevents the same *value* twice in
one combination (`Size 40 / Size 40`) and structurally prevents a surrogate `id` and its second
index (0024 **D-8**). It does **not** prevent two *different* values of the same type
(`Size 40 / Size 41`) — see **DIS-1** — nor two variants with identical value sets, which is the
hash's job.

**The race guard**, to the standard
[signed-link-verification.md](../../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
sets:

```php
try {
    return DB::transaction(function () use ($product, $valueIds, $attributes): ProductVariant {
        $variant = ProductVariant::create([
            ...$attributes,
            'combination_hash' => app(HashVariantCombination::class)($valueIds),
        ]);
        $variant->values()->attach($valueIds);   // same transaction, always

        return $variant;
    });
} catch (UniqueConstraintViolationException $e) {
    throw ValidationException::withMessages([
        'combination' => __('products.variants.duplicate_combination'),
    ]);
}
```

Two Phase 3 notes: Laravel 13 already promotes a unique-constraint `23000` to
`Illuminate\Database\UniqueConstraintViolationException` (**verified** at
`vendor/laravel/framework/src/Illuminate/Database/Connection.php:854`), so catch that rather than
string-matching `QueryException`; and the catch **must disambiguate the two unique indexes on this
table** — `sku` and `(product_id, combination_hash)` both raise `23000`, and reporting a duplicate
combination for a duplicate SKU is a genuinely confusing bug (**R-F**).

### D-4 — SKU is derived from the parent product's SKU and the variant's attribute values

> 🔵 **PO resolution, 2026-08-18.** This section previously presented two competing mechanisms for
> making `products.sku` and `product_variants.sku` one namespace — a shared `skus` registry table
> (`backend-expert`) and an application rule under a gap lock (`database-expert`) — and escalated
> the choice as OQ-1. **The PO answered with a business rule that supersedes both**: a variant SKU
> is not something anyone types, so there is nothing to *reserve*. It is **computed** from the
> parent product's SKU and the variant's own attribute values. The registry table is **dropped from
> this story**. The prior debate is retained verbatim below under
> [Superseded](#superseded--the-registry-vs-gap-lock-debate-2026-08-18), because its **verified
> findings still bind** what may be built (no triggers, no single-table inheritance, no `CHECK`) and
> because a future third SKU-bearing entity may reopen it.

The requirement itself is unchanged and still comes from 0024's **D-11** / **RQ-9** and PRD §2.2's
Scenario Outline: *"a variant SKU may not equal **any** product's SKU, including a different
product's"*. What changes is that a variant SKU is now a **function**, not an input — which is why
the collision surface collapses from "any two writes anywhere" to the three enumerable cases in
**D-4.5**.

#### D-4.1 — The formula

```
variant_sku = product.sku  ⧺  ("-" ⧺ segment(value))  for each value, in the order D-4.2 fixes
```

Worked, using the PO's own examples:

| Parent SKU | Attribute values (in derivation order) | Derived variant SKU |
| --- | --- | --- |
| `0001` (t-shirt) | Talla = `M` | `0001-M` |
| `0001` | Talla = `S` | `0001-S` |
| `0002` (trousers) | Color = `azul marino` | `0002-azul-marino` |
| `0002` | Color = `azul marino`, Talla = `L` | `0002-azul-marino-L` |

**The hyphen is both the separator and the space replacement, and that is deliberate but not free** —
it makes the concatenation ambiguous, which is collision case **(c)** in D-4.5. An escaped separator
(`__`, or percent-encoding) would remove the ambiguity and was rejected: it produces SKUs no human
would write on a label, and the PO's rule specifies a plain hyphen. The ambiguity is handled by
detection, not by encoding.

#### D-4.2 — Multi-attribute ordering: `product_attribute_types.position`, then `id`

**This is the rule the PO's examples imply but did not state, and it must be deterministic**: two
administrators building the same variant by clicking the attribute types in a different order must
get the same SKU, or "the same variant" has two identities. The derivation therefore **never** uses
submission order.

**Decision: sort by `(type.position ASC, type.id ASC, value.position ASC, value.id ASC)`.**

| Candidate ordering key | Verdict |
| --- | --- |
| **Submission / click order** | **Rejected.** Non-deterministic by construction — it is exactly the failure the PO flagged. It is also the order the payload arrives in, i.e. client-controlled, which **V-10**'s whole lesson says never to derive a stored identifier from |
| **Attribute type name, alphabetically** | Rejected. Deterministic, but it silently re-orders every future variant's SKU the moment an administrator renames "Color" to "Colour" — and 0028 explicitly supports renaming |
| **Attribute value id / the `combination_hash` sort** | Rejected. Deterministic and stable, but the resulting order is *arbitrary* (UUID byte order), so `0002-L-azul-marino` and `0002-azul-marino-L` would be assigned by coin-flip across products. A SKU is read by humans; the order must mean something |
| ✅ **`product_attribute_types.position`, then `type.id`** | **Recommended and chosen.** 0028 **D5** already ships `position` as the *canonical, administrator-controlled* order of the attribute types, and it is the same order 0028's own screens and **D-9**'s derived `label()` render in. Using it means **the SKU reads in the same order as the variant's displayed name** — `0002-azul-marino-L` next to "Color azul marino / Talla L" — which is the property that makes a derived SKU legible instead of merely unique |

Three notes that make the rule total rather than merely good:

1. **The `type.id` tiebreak is required, not decorative.** 0028's `position` is `default(0)` and is
   assigned `MAX + 1` *by the action* — so any writer that bypasses the action (seeder, factory,
   import) can leave two types sharing `position = 0`, and an `ORDER BY position` alone is then
   non-deterministic. `id` is a UUIDv7, hence time-ordered, so the tiebreak is stable and reads as
   creation order.
2. **The `(value.position, value.id)` tail covers the DIS-1 case.** A combination holding two values
   of the *same* type (`Size 40 / Size 41` — legal at schema level, see **DIS-1**) ties on both type
   keys, so the value-level keys are what stop the derivation being undefined for a payload the
   schema permits.
3. **This is *not* the same order as `combination_hash`'s** (**D-3** sorts value ids as strings).
   They are deliberately different: the hash is a **set** key that must be insensitive to every
   ordering, the SKU is an **ordered rendering** meant to be read. Do not "unify" them — a hash
   ordered by type position would change whenever an administrator reorders the types, silently
   invalidating every stored hash.

> ⚠️ **Consequence, and it is genuinely a product decision, not an implementation detail:**
> reordering the attribute types changes the SKU that variants created *afterwards* will derive,
> while variants created *before* keep theirs (**D-4.6** re-derives only on a change to the
> variant's own inputs, and type order is not one of them). Two variants of two products can
> therefore render their values in different orders. The Gherkin states this explicitly rather than
> leaving it to be discovered. Raised for confirmation as **[OQ-18](#open-questions)**.

#### D-4.3 — Stored in the `sku` column, not computed on read

**Decision: keep `product_variants.sku` as a real, `NOT NULL`, `UNIQUE` column, written by the
derivation.** A virtual/accessor-only SKU was considered and rejected on four counts, any one of
which is sufficient:

- **Uniqueness would have nothing to enforce against.** The `UNIQUE (sku)` index — and the entire
  cross-table check — needs a stored value. This alone closes it.
- It would make "find the variant with SKU X" (assumption 15 puts SKU in global search, and Epic 3
  will scan a barcode into it) a full scan with a PHP-side join, on a value that is otherwise a
  one-index-seek lookup.
- A generated column cannot do it either — the derivation reads `products` and
  `product_attribute_values`, and **V-C** verified MySQL 8.4 rejects a subquery in a
  generated-column expression (`ERROR 3102`). Same wall **D-3** hit.
- 0024's order-line snapshot (**D-12** reason 4) copies the SKU string; a value that only exists
  when a full relation graph is loaded is one lazy-load away from snapshotting `null`.

The cost is the same class of drift **D-3** already manages for `combination_hash`, and it is
managed the same way: **derived, write-once per input change, single writer, plus a consistency
test** that recomputes every stored SKU from its current inputs and asserts equality.

`sku` therefore joins `combination_hash` in being **omitted from `#[Fillable]`** — the
omission-as-mass-assignment-guard rule this repo uses for `users.status`. Neither is ever accepted
from a form. A submitted `sku` key is **ignored**, not rejected: 0031's form simply will not have
the field, and rejecting an extra key would make the action brittle to a payload it should not care
about.

#### D-4.4 — `segment()`: what happens to an attribute value on the way into a SKU

The PO's rule names exactly one transformation — **spaces become hyphens, casing is preserved
verbatim**. Everything else here is the minimum needed to keep the result a usable identifier, and
every addition is called out as such:

```php
// app/Actions/Products/DeriveVariantSku.php — same folder/naming reasoning as
// HashVariantCombination above (Phase 2 defect 2, 2026-09-04): NOT app/Support/, which
// would be an unapproved new base folder; invokable and container-resolved, never new-ed.
public const MAX_LENGTH = 128;

/** One attribute value, rendered as one SKU segment. Casing is preserved on purpose (PO rule). */
public function segment(string $value): string
{
    $ascii = Str::ascii(trim($value));                          // 'Marrón' -> 'Marron'
    $hyphenated = (string) preg_replace('/\s+/u', '-', $ascii); // the PO's rule; a run collapses to one
    $safe = (string) preg_replace('/[^A-Za-z0-9._\/-]/', '', $hyphenated);

    return trim((string) preg_replace('/-{2,}/', '-', $safe), '-');
}

/** @param  array<int, string>  $orderedValues  value STRINGS read back from the DB, in D-4.2 order */
public function __invoke(string $productSku, array $orderedValues): string
{
    return collect($orderedValues)
        ->map(fn (string $v): string => $this->segment($v))
        ->prepend($productSku)
        ->implode('-');
}
```

| Input character | Treatment | Why |
| --- | --- | --- |
| Space (and any whitespace run) | → a single `-` | The PO's rule. Collapsing a run is an addition: `"azul  marino"` must not become `0002-azul--marino`, which is a different SKU for a typo the administrator cannot see |
| Letter case | **preserved verbatim** | The PO's rule, and the reason `0002-azul-marino-L` is correct rather than `0002-AZUL-MARINO-L`. **This contradicts 0024's `Str::upper()` canonicalisation** — see **[OQ-14](#open-questions)** |
| Accented / non-ASCII letters | `Str::ascii()` → nearest ASCII | Not in the PO's rule; an addition. `Marrón` is a perfectly ordinary attribute value in this catalog, and a SKU is scanned, printed and typed by hand. Flagged as **[OQ-15](#open-questions)** |
| Anything still outside `[A-Za-z0-9._/-]` | stripped | Keeps the derived value inside 0024's own SKU character set (minus the case rule) |
| A value that reduces to the empty string (e.g. `"★"`) | **refused at creation** with a validation error naming the offending attribute value | Silently dropping a segment would produce `0002--L`, then `0002-L`, i.e. a *different variant's* SKU. Fail loudly |

**Length.** `product_variants.sku` is `string(128)`, **not** 0024's `string(64)`. The width is a
deviation from 0024 **D-11**'s "pin the width adjacent to `max:64` so they cannot drift", and it is
deliberate: a variant SKU's length is a function of inputs the administrator does not directly
control, and refusing a legitimate three-attribute variant because the derivation came to 65
characters is a dead end — there is no field to shorten. A derivation exceeding 128 is refused with
a message naming the length, which is a real (if remote) outcome the message must handle. A derived
SKU longer than 64 can never collide with a `products.sku`, which is harmless. Confirm as
**[OQ-17](#open-questions)**.

#### D-4.5 — The collision surface is now three cases, and one existence check closes them

With a derived SKU there is no longer a general "any writer may claim any string" problem. A
collision requires one of exactly three shapes:

| # | Shape | Example |
| --- | --- | --- |
| **(a)** | A **product's own typed SKU** equals a variant's derived SKU | Product Y's SKU is literally `0001-M`, and product `0001` has a Talla `M` variant |
| **(b)** | **Two attribute values reduce to the same segment** | `azul marino` and `azul-marino` (or `Marrón`/`Marron`) both → `azul-marino`, on the same product |
| **(c)** | **Separator ambiguity across two products** | Product `0001-M` + value `L` and product `0001` + value `M-L` both → `0001-M-L` |

**A plain existence check against both tables is now sufficient — no registry table, no
`skus` row to reserve.** The value is deterministic, so there is nothing to claim *ahead* of the
write; the only question is whether it is free at the moment of writing:

```php
// app/Actions/Products/CreateProductVariant.php — inside the write transaction.
// ALWAYS this order — products, then product_variants. A fixed lock order is what prevents a 1213
// deadlock when a product and a variant claim the same string concurrently.
$sku = app(DeriveVariantSku::class)($product->sku, $orderedValues);

$conflict = DB::table('products')->where('sku', $sku)->lockForUpdate()->value('id');

if ($conflict === null) {
    $conflict = DB::table('product_variants')->where('sku', $sku)
        ->when($ignoreVariantId, fn ($q) => $q->whereKeyNot($ignoreVariantId))
        ->lockForUpdate()->value('id');
}

if ($conflict !== null) {
    throw ValidationException::withMessages([
        'sku' => __('products.variants.derived_sku_taken', ['sku' => $sku]),
    ]);
}
```

Four things about that block, each load-bearing:

1. **`lockForUpdate()` stays, and it is still the race guard** — this half of `database-expert`'s
   Option B is *not* superseded. **V-H** verified that a locking equality read on a **nonexistent**
   value in a `UNIQUE` index takes an `X,GAP` lock under the live REPEATABLE READ isolation
   (**V-A**), which blocks a concurrent `INSERT` of that exact key *whether or not the concurrent
   writer locks anything itself*. Without it, two concurrent creates of colliding SKUs both pass the
   check. The house precedent is **V-Q**.
2. **`value('id')`, not `exists()`** — the refusal message must be able to name what it collided
   with. A derived SKU cannot be changed by retyping it, so "SKU already taken" with no further
   information leaves the administrator with no action to take. The message must say *which*
   product or variant holds it, so the remedy (rename the attribute value, or change the product's
   SKU) is obvious. This is a genuine difference from 0024's product-side message and is why it is
   its own translation key.
3. **The `||` short-circuit of the superseded Option B is written out as two statements** so the
   conflicting id survives; the short-circuit property (skip the second lock once the first hits)
   is preserved and still correct.
4. **The per-table `UNIQUE (sku)` indexes remain the last word** on each table, with the `23000`
   catch, and **R-F** still applies — `product_variants` carries two unique indexes and the catch
   must disambiguate them.

**Case (b) is deliberately *not* prevented at the attribute-value level in 0028.** It was
considered: 0028 could refuse a new value whose `segment()` matches a sibling's. Rejected, because
(i) the clash is only a problem for values used *together on one product*, so a type-wide rule would
refuse legitimate values that never meet; (ii) it would push a SKU concern into a taxonomy screen
that has no idea SKUs exist, coupling 0028 to this story permanently; and (iii) the existence check
here catches it anyway, at the exact moment it becomes real, with a message that can name both
values. The cost is that the administrator learns about it later than they might have.

**Duplicate combinations are still refused by D-3 first, and that ordering is deliberate.** Two
variants of one product with the identical combination derive the *identical* SKU, so this check
would also catch them — but with the wrong message ("SKU 0001-M is already used by a variant of this
product" instead of "this combination already exists"). **`CreateProductVariant` therefore runs the
combination check before the SKU check**, so the clearer error always wins. The SKU rule becomes a
**second, independent** enforcement of the same invariant, which is a free strengthening, not the
primary mechanism.

#### D-4.6 — Re-derivation: the SKU follows its inputs

A stored derived value raises the question a computed one does not: what happens when an input
changes?

| Input change | Behaviour | Why |
| --- | --- | --- |
| **The variant's own combination** | Cannot happen — **D-13**, a combination is immutable after creation | The whole drift argument rests on it |
| **The parent product's `sku`** | ✅ **Re-derive every variant of that product, in the same transaction as the product update**, re-running the D-4.5 check for each new value; any single collision aborts the whole update | Leaving `0001-M` on a product now called `0009` produces a SKU that is false on its face and that no rule can ever re-establish |
| **An attribute value's `value` string** (0028 supports renaming) | ✅ **Re-derive every variant built on that value**, same transaction, same all-or-nothing rule | Same argument, and it is what keeps the consistency test meaningful |
| **`product_attribute_types.position` reordered** | ❌ **No re-derivation** | Type order is a presentation choice, not an identity of the variant; re-deriving would rewrite the SKU of every variant in the catalog from a drag-and-drop. See the D-4.2 consequence box and **OQ-18** |

The alternative — **freeze the SKU at creation and never re-derive** — was weighed seriously, and it
is the option that best matches "a SKU is a physical label you already printed". It was rejected for
this story because it makes the formula *un-assertable*: after the first rename, no test and no
reader can tell a correctly-derived SKU from a bug, and the story loses the one cheap global
invariant that protects a derived column. **This is a product call with a real operational cost
(re-labelling), so it is raised as [OQ-13](#open-questions)** rather than assumed. Note the timing:
it is a decision about action code, not schema, so unlike OQ-1 it is *not* expensive to revisit
after Phase 3.

Both re-derivation paths are **all-or-nothing inside one transaction**: a product SKU change that
would make any one of its variants collide is refused whole, with the message naming the variant.
Partially re-deriving would leave a product whose variants disagree about their own parent.

#### D-4.6.1 🔴 — The rename branch is a query-builder mass update, so the cascade cannot be hooked

**Added 2026-09-04 (Phase 2 defect 6), from reading the shipped file rather than the spec.**
`SyncProductAttributeValues`' update branch is:

```php
// app/Actions/Products/SyncProductAttributeValues.php — the shipped rename branch
$this->writeRow(fn () => ProductAttributeValue::where('id', $id)->update([
    'value' => $text,
    'position' => $position,
]));
```

That is `Builder::update()`, **not** `Model::save()`. It instantiates no model, so it fires **no**
`updating`/`updated`/`saved` Eloquent event — the identical trap
[base-standards.md](../../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder)
records for `User::delete()`, one class over. **A model observer, a `static::updated()` hook, or
anything else event-driven is therefore not available to carry D-4.6's value-rename cascade**, and a
Phase 3 implementer reaching for one would ship a cascade that silently never runs while every
single-value test passes.

Three consequences, all of them constraints on how the cascade is written:

1. **The cascade is explicit code inside `SyncProductAttributeValues`**, in the same
   `DB::transaction()` the diff already opens, after the diff loop and before it returns.
2. 🔴 **The action cannot currently tell a rename from a no-op, and must be changed so it can.** It
   reads its owned set as `$type->values()->pluck('id')->all()` — **ids only**. To know *which* values
   were renamed (and therefore which variants to re-derive), it must read `id` **and** `value`:
   `$owned = $type->values()->get(['id', 'value'])->keyBy('id');`, with `$ownedSet` built from
   `$owned->keys()` so every existing `array_key_exists()` / `unset()` behaviour — including story
   0028's Phase 4 duplicate-id fix — is preserved byte for byte. A row whose submitted text differs
   from `$owned[$id]->value` is a rename; a row whose text matches is a no-op and contributes nothing
   to the cascade. **This is a real change to a shipped file's read, not a comment**, and it is the
   only way the cascade can be scoped to the values that actually moved rather than re-deriving every
   variant of the type on every save.
3. **Collect, then cascade once.** Accumulate the renamed value ids through the loop and run **one**
   re-derivation pass over
   `ProductVariant::whereHas('values', fn ($q) => $q->whereIn('product_attribute_values.id', $renamedIds))`
   after it — never one pass per renamed row, which would re-derive a multi-value variant repeatedly
   and multiply **R-M**'s lock-hold window by the number of renames in one save.

> ⚠️ **Known limitation, accepted 2026-09-04 (Phase 5 code review) — the batch write loop in both
> `reDeriveVariantSkus()` (`UpdateProduct`) and `reDeriveVariantSkusForRenamedValues()`
> (`SyncProductAttributeValues`) can hit a false 1062 on a same-batch SKU rotation.** The pre-check
> stage correctly widens `whereNotIn('id', $batchVariantIds)` (R-4 above) so a batch that rotates two
> SKUs between two of its own variants passes the check — but the write loop then applies each
> variant's new SKU **sequentially** (`foreach ($newSkus as $variantId => $newSku) { DB::table(...)->update(...) }`).
> If variant A's new SKU equals variant B's **current, not-yet-rewritten** SKU, the write can still hit
> `product_variants_sku_unique` even though the pre-check correctly allowed it and the final state
> would be valid once every row in the batch is written. This is fail-**closed** — a clean
> `ValidationException` via the shared `TranslateProductVariantUniqueViolation` translator, the whole
> transaction rolled back — not a security bug, and reachable only via deliberately-engineered
> separator-ambiguity SKUs colliding across a batch, not by ordinary use. Left as a documented residual
> rather than fixed in this round: a real fix means either (a) writing through a temporary placeholder
> value in a first pass then the real values in a second, or (b) computing a topological write order —
> either adds real complexity for a narrowly-reachable, fail-closed case. Revisit if a future story
> needs same-batch SKU rotation to succeed rather than merely fail cleanly.

#### D-4.7 — What the amendment does *not* change

- **Every point in [What both experts agree on](#what-both-experts-agree-on--settled-not-open)
  below still stands**, unchanged: the problem is real (**V-5**), both per-table `UNIQUE(sku)`
  indexes ship and are global rather than product-scoped, triggers are unavailable (**V-2**),
  single-table inheritance is dead, and `CHECK` is unavailable (**V-K**).
- **0024's product-side canonicalisation is untouched** — an admin-typed product SKU is still
  `Str::upper(trim())` + `regex:/^[A-Z0-9][A-Z0-9._\/-]*$/`. Only the *derived* variant SKU
  preserves case (**OQ-14**).
- **0024's `productSkuRules()` still gains its second `Rule::unique(ProductVariant::class, 'sku')`** —
  case (a) is a product-side write, and nothing on the variant side can guard it. See below.
- **The `->ignore()` asymmetry trap disappears entirely on the variant side.** The variant side never
  calls `productSkuRules()` (there is no typed variant SKU to validate), so **no**
  `?string $productVariantId` parameter is added at all. 0024's own signature keeps its single
  `?string $productId`. **R-E** narrows accordingly.

> 🟠 **Corrected 2026-09-04 (Phase 2 defect 1) — the method this story retrofits is
> `productSkuRules()`, and its shipped body is not the shape this document quoted.** Every reference
> above and below used to say `skuRules()`, a method that **does not exist**. The real one, read from
> [`app/Concerns/ProductValidationRules.php`](../../../app/Concerns/ProductValidationRules.php):
>
> ```php
> protected function productSkuRules(?string $productId = null): array
> {
>     return [
>         'required',
>         'string',
>         'max:64',
>         'regex:/^[A-Z0-9][A-Z0-9._\/-]*$/',
>         $productId === null
>             ? Rule::unique(Product::class, 'sku')
>             : Rule::unique(Product::class, 'sku')->ignore($productId),
>     ];
> }
> ```
>
> Three things this changes about the retrofit, none of them cosmetic. **(a) The entity-prefixed name
> is mandatory, not optional** — 0024's own naming trap ([naming.md](../../../docs/conventions/naming.md#traits-and-their-methods))
> is why every method in that trait carries the `product` prefix, and a `skuRules()` added beside them
> would break the blanket rule the trait is reviewed against in one glance. **(b) The shipped form is
> `Rule::unique(Product::class, 'sku')` — the model-class form — under a ternary, not
> `Rule::unique('products', 'sku')->ignore(...)`.** The added variant rule must match that shape:
> `Rule::unique(ProductVariant::class, 'sku')`, with **no** `->ignore()` on either branch, since no
> variant row is ever the subject of this rule. **(c) The ternary exists because `->ignore(null)` is
> not equivalent to omitting `->ignore()`** — do not "simplify" the added rule into the ternary; it
> takes no id and belongs outside it.

#### What both experts agree on — settled, not open

1. **The problem is real, and empirically so.** `backend-expert` executed the collision:
   inserting `product_variants(sku='RNR-001')` while `products(sku='RNR-001')` exists **succeeds**
   under two independent `UNIQUE` indexes (**V-5**). 0024's **RQ-9** reading is confirmed by
   execution, not just by reading the PRD.
2. **Canonicalisation is reused from 0024, never re-implemented** (**RQ-9**). `Str::upper(trim())`
   plus `regex:/^[A-Z0-9][A-Z0-9._\/-]*$/`, applied **before `validate()`** and again defensively in
   the action — the belt-and-braces shape this repo already uses for email
   (`app/Livewire/Users/Index.php:149`, then again in `CreateUser`/`UpdateUser`).
3. **Both per-table `UNIQUE(sku)` indexes ship regardless**, and each is **global, never scoped to
   `product_id`** — 0024 **D-11**: *"A SKU is a stock-keeping **unit** identifier; scoping it would
   let two products share one, destroying its only purpose."* Two variants of two *different*
   products sharing a SKU is exactly as broken as two products sharing one.
4. **Trigger and generated column are dead — verified three ways.** A generated column cannot
   reference another table (`ERROR 3102`, **V-C**); a `CHECK` cannot contain a subquery
   (`ERROR 3815`, **V-D**); and decisively, **the application's own database user cannot create a
   trigger at all** — `ERROR 1419: You do not have the SUPER privilege and binary logging is
   enabled` (**V-2**). A `DB::unprepared('CREATE TRIGGER …')` migration **fails at migrate time in
   this exact environment**. Add to that: zero trigger precedent in the repo (**V-R**), invisibility
   to Larastan and to `db:table`, no SQLite equivalent, and a `SIGNAL` error mapping (`HY000`/3819,
   **V-11**) that the repo's standard `23000` catch would not even catch.
5. **Single-table inheritance (variants as rows in `products`) is dead**, with three concrete
   failures rather than aesthetic ones: it would silently corrupt 0024b's shipped category-delete
   guard (`ProductCategory::products()` would count variants, so *"used by 12 products"* becomes a
   lie, and 0024's own decoy-seeded test would still pass); `product_category_id` and `type` are
   `NOT NULL` on `products` and a variant has neither, so either they go nullable — permanently
   un-enforcing "every product has a category", which 0024b **D-14** reason 2 refuses — or every
   variant carries a duplicable copy; and every existing query would need
   `whereNull('parent_product_id')`, where forgetting once is silent. Structurally identical to the
   discriminator design 0028's **D1** already rejected in this sub-domain.
6. **The `CHECK` constraint is not available either way.** Laravel 13.19.0's `Blueprint` has **no
   `check()` method** (**V-K**), so it needs raw `DB::statement()` — which breaks the `down()`-symmetry
   idiom and, on SQLite, cannot be added by `ALTER TABLE` at all. Both experts independently reached
   "do not add a CHECK; enforce structurally instead."

#### Superseded — the registry-vs-gap-lock debate (2026-08-18)

> 🔵 **Everything from here to the end of D-4 is retained history, not a live proposal.** The
> `skus` registry table (Option A) and the choose-between-them framing (the head-to-head, and
> `product-owner`'s original Option A recommendation) are **closed by the PO resolution in D-4
> above** and must not be implemented. Option B's **layer-2 locking read survives** and is written
> out in **D-4.5**; its layers 1 and 3 survive as the shared `productSkuRules()` amendment and the
> per-table unique indexes. This is kept, per project convention, because the *reasons* the other
> shapes were closed are still the reasons — and because the **revisit trigger** recorded at the end
> of it may bring the registry back.

#### Option A — the shared `skus` registry *(`backend-expert`'s recommendation — SUPERSEDED)*

A registry table whose single `UNIQUE(sku)` **is** the cross-table namespace. Of four possible
shapes, only one survives; the shape matters more than the choice, so both the winner and the
discarded three are recorded:

| Registry shape | Verdict |
| --- | --- |
| **a1** — registry is the *parent*; both tables FK **into** `skus.sku` with a composite FK binding ownership | Airtight on insert, but **leaks on delete**: the product→variant cascade is executed by InnoDB, so the app never sees the variant deletions and cannot clean their registry rows — and a leaked row **permanently squats a SKU**, the exact defect 0024 **D-12** rejected `SoftDeletes` to avoid |
| **a2** — registry is the *sole home* of the SKU; the column is removed from both tables | Also airtight, and "never store one fact twice" holds literally. **Rejected on read ergonomics**: `sku` is a first-class, user-visible, searchable field (the list renders "name + SKU"; assumption 15 puts SKU in global search). It would also break every `assertDatabaseHas('products', ['sku' => …])` 0024 ships |
| **a3** — registry alongside the column, **no** FKs, app deletes registry rows | Same cascade leak as a1 |
| **✅ a4** — registry alongside the column, with two **nullable owner FK columns cascading FROM** `products` and `product_variants` | Cross-table uniqueness is a real `UNIQUE` index (**V-6**), and cleanup is automatic through two cascade levels (**V-7**) |

```php
Schema::create('skus', function (Blueprint $table): void {
    $table->uuid('id')->primary();                 // surrogate UUID, NOT sku-as-PK — see below
    $table->string('sku', 64);
    $table->foreignUuid('product_id')->nullable()->constrained()->cascadeOnDelete();
    $table->foreignUuid('product_variant_id')->nullable()->constrained()->cascadeOnDelete();

    $table->unique('sku');                         // THE cross-table namespace
    $table->unique('product_id');                  // one registration per product
    $table->unique('product_variant_id');          // one registration per variant
});
```

**Three sub-decisions inside that file.** A **surrogate UUID `id` rather than `sku` as the primary
key**: `string('sku')->primary()` works, but forces `$primaryKey`/`$keyType`/`$incrementing` onto the
model — precisely the three properties
[base-standards.md](../../../docs/conventions/base-standards.md#uuid-primary-keys) says not to write —
and it makes `Rule::unique(Sku::class, 'sku')->ignore($id)` natural. **No `timestamps()`** (nothing
reads them). **No `CHECK`** that exactly one owner is set — see agreed point 6; enforce structurally
by exposing only `Sku::registerFor(Product|ProductVariant $owner, string $sku)`.

**Where the registry write lives is the most important detail in this option: a `saved` hook on both
owner models, not in the actions.**

```php
// app/Models/Product.php (and identically on ProductVariant, with the other owner column)
static::saved(function (self $product): void {
    if ($product->wasChanged('sku') || $product->wasRecentlyCreated) {
        Sku::updateOrCreate(['product_id' => $product->id], ['sku' => $product->sku]);
    }
});
```

Three reasons for that placement: it binds **every** call site — factories, seeders, tinker, a future
import — which is 0024a **D-16**'s own argument applied one layer deeper; it means **`ProductFactory`
needs no change**, which matters enormously because a factory that silently skips registration would
make *every SKU-uniqueness test in the suite vacuously green* (**T-4**); and it keeps the actions
thin. Ordering is enforced by the mechanism rather than by discipline — the owner row is inserted
first, `saved` fires after, so both concurrent transactions lock in the same order and **no
deadlock class is introduced**. `wasChanged()`, **not** `isDirty()`: inside `saved`, `finishSave()`
has already synced, so `isDirty()` is false — the same class of mistake
[errors-log.md](../../../docs/errors-log.md)'s `getOriginal()`/`getPrevious()` entry records, one hook
over (**T-6**).

**What `backend-expert` verified that changes the picture:** the orphan objection above (a1/a3) does
**not** apply to a4. Deleting a product cascades to its variants *and* to both sets of registry rows,
leaving 0 products, 0 variants, 0 registry rows, with the freed SKU immediately re-insertable —
**executed, not assumed** (**V-7**). And `utf8mb4_unicode_ci` protects the registry for free: `rnr-001`
and `RNR-001 ` (trailing space, PAD SPACE) both hit `1062` against a stored `RNR-001` (**V-8**).

**The "don't store one fact twice" objection, stated against the option, and its answer.** 0024's
**D-7** rejects derived state because two columns encoding one fact "diverge permanently". Here the
answer is that a registry row is **a reservation, not a second answer to a question anyone asks** —
nothing ever *reads* `skus.sku` to learn a SKU; it is written to claim the name and deleted by
cascade to release it. There is exactly one readable column. The precedent for a claim-row shadowing
an identifier is already in this schema: `users.pending_email`'s unique index, which
[schema.md](../../../docs/database/schema.md#users) calls "the last-word guard behind the application
checks".

**The residual this option accepts.** `Product::where(...)->update(['sku' => 'X'])` through the
**query builder** bypasses the model hook — the trap `base-standards.md` already documents for
`User::delete()`, now applying to a second model (**T-7**). A stale registration fails **closed** (a
spurious "already taken"); a missing one fails **open** to the per-table unique, degrading to Option
B's guarantee for that one row. Neither corrupts data, and a one-query integrity assertion is
available to any test: `Product::whereDoesntHave('skuRegistration')->exists()` must be false.

#### Option B — application-level, centralised, under a locking read *(`database-expert`'s recommendation)*

No new table. Three layers, of which layer 2 is the novel part.

**Layer 1 — one shared validation rule, so the cross-table half cannot be forgotten at one call
site.** This is an **amendment to 0024's `app/Concerns/ProductValidationRules.php`**, not a new
trait — putting it anywhere else is how the two call sites drift:

```php
/**
 * SKUs are one namespace across products AND variants — PRD §2.2's Scenario Outline has both
 * "another product" and "a variant" as examples. Both Rule::unique() entries run; omitting
 * either silently reopens half the rule. See story 0029 D-4.
 *
 * @return array<int, \Illuminate\Contracts\Validation\ValidationRule|\Illuminate\Database\Query\Expression|string>
 */
// SUPERSEDED SHAPE — this is Option B's proposal as originally written, and BOTH its method
// name and its body are wrong against the shipped code (Phase 2 defect 1, 2026-09-04). The
// real method is productSkuRules(?string $productId = null) and it uses the model-class form
// under a ternary. See the correction box at the end of D-4.7 for the shipped shape and for
// what the retrofit actually adds. Retained unedited as the record of what was proposed.
protected function skuRules(?string $productId = null, ?string $productVariantId = null): array
{
    return [
        'required', 'string', 'max:64', 'regex:/^[A-Z0-9][A-Z0-9._\/-]*$/',
        Rule::unique('products', 'sku')->ignore($productId),
        Rule::unique('product_variants', 'sku')->ignore($productVariantId),
    ];
}
```

Two `Rule::unique()` entries in one rule array both execute, so **no custom `app/Rules/` class is
needed** and the repo's `<Noun>ValidationRules` / `<noun>Rules()` convention holds unchanged. (Note
`app/Rules/` *would* have been fine had one been needed — `make:rule` exists, so it is a stock
Laravel location like `app/Enums/` and `app/Policies/`, needing no new-folder approval. It simply
is not needed.)

**The `->ignore()` asymmetry is the trap here, and it is worse than 0024's.** A variant editing
itself must ignore **its own row in `product_variants`** and must **not** ignore anything in
`products`; a product editing itself is the mirror image. Passing the same id to both — or passing a
variant's id to the products rule — silently disables half the constraint. Both ids must be
server-authoritative (`#[Locked]`, re-read from the model), per
[livewire-authorization.md](../../../docs/security/livewire-authorization.md); that obligation lands on
**0031** and on 0027, and is in the Definition of Done.

> **Under Option A this trap largely disappears, which is a point in its favour.** With a registry
> there is **one** `Rule::unique(Sku::class, 'sku')->ignore($registrationId)`, and the value fed to
> `->ignore()` is the *registration row's* id read off the owner through a relation
> (`$product->skuRegistration?->id`) — not client-reachable at all, whereas 0024's `->ignore($productId)`
> is safe only *because* the component keeps that id `#[Locked]`. One rule instead of two also means
> there is no "half the constraint" to silently disable (**R-E**).

Either way, both edit paths need the self-exclusion: "save this product under its own unchanged SKU"
and the same for a variant are 0024's **R-15** and 0023's **R-1** one and two entities over. **This
repo has now had the identical bug pattern flagged three times** — write it as three tests each (the
no-op save succeeds / the row is genuinely unchanged / a genuinely free SKU is still accepted, as the
control that stops a reject-everything rule passing the first trivially).

**Layer 2 — a locking pre-check inside the write transaction (the race guard).**

```php
// ALWAYS this order — products, then product_variants. A fixed lock order is what prevents
// deadlocks (1213) when a product and a variant claim the same SKU concurrently.
$taken = DB::table('products')->where('sku', $sku)->lockForUpdate()->exists()
      || DB::table('product_variants')->where('sku', $sku)->lockForUpdate()->exists();

if ($taken) {
    throw ValidationException::withMessages(['sku' => __('products.variants.sku_taken')]);
}
```

Why this is a real guard and not another pre-flight check: under REPEATABLE READ (**V-A**, the live
default) a `FOR UPDATE` equality read on a **nonexistent** value in a `UNIQUE` index takes an
`X,GAP` lock on that index — **verified** in `performance_schema.data_locks` (**V-H**) — and a gap
lock blocks a concurrent `INSERT` of that exact key until commit. Crucially, it blocks the
concurrent inserter **whether or not that inserter took any lock itself**, so this protects against
an unaware writer inserting into either table, not just against a cooperating one.

**This refines the repo's own rule rather than contradicting it, and the distinction matters.**
[signed-link-verification.md](../../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
says *"`lockForUpdate()` on the row you are writing does not serialise checks against other rows"* —
and that is exactly right about the case it documents, where
[`ConfirmEmailChange`](../../../app/Actions/Users/ConfirmEmailChange.php) locks a `User` **by primary
key** and then runs a **non-locking** `exists()` against other rows. What is proposed here is a
different shape: a locking read **on the value, in the unique index itself**. That does serialise,
because the lock is taken on the index entry the competing insert needs. Phase 6 should record this
refinement in that document rather than leave the two readings looking contradictory.

Three caveats to carry into Phase 3: **(i)** the fixed lock order is mandatory, and a `1213` deadlock
is retryable, not a 500; **(ii)** `||` short-circuits, which is correct — if `products` already holds
the SKU we abort and the second gap lock is never needed; **(iii)** SQLite ignores all of it, but
SQLite serialises writers wholesale, so behaviour degrades to "no worse" (relevant only while 0024's
**V-1** / `ci-database-connection-gap.md` remains open).

**Layer 3 — each table's own `UNIQUE` index, with the `23000` catch at every call site.**
`products.sku` (0024) and `product_variants.sku` (here). These are the within-table last word, and
0024 already requires the catch regardless.

#### Head to head — what actually separates them

| | **Option A — registry** | **Option B — app rule + gap lock** |
| --- | --- | --- |
| Cross-table duplicate, **concurrent** writers | refused by a real `UNIQUE` index (**V-6**) | refused by the gap lock (**V-H**) |
| Cross-table duplicate, **sequential** writer that bypasses the shared code (seeder, import, raw `INSERT`) | **still refused** — the index does not care who is writing | **not refused** — both layers are application code |
| Writer that bypasses the **model** but not the query builder | fails closed or degrades to B for that row (**T-7**) | n/a |
| New schema | a third table, two nullable owner FKs | none |
| Retrofit of 0024 | `ProductValidationRules`, `CreateProduct`, `UpdateProduct`, `Product`, and a `skus` backfill (**T-9**) | `ProductValidationRules`, `CreateProduct`, `UpdateProduct` |
| Error surface | one `23000` per collision class, one catch (**V-6**) | one `23000` per table + an app-thrown `ValidationException` |
| Factory/seeder coverage | inherited automatically via the model hook (**T-4**) | must be remembered at each writer |
| Repo precedent | four DB-last-word precedents (0024 **D-9**, **D-14**; 0028 **D1**; `pending_email`) | `lockForUpdate()` precedent at `ConfirmEmailChange` (**V-Q**) |

**The honest summary of the disagreement.** Option B is race-safe but **application-scoped**: it has
no database backstop for the cross-table half, so a *sequential* writer that never checks can still
create the collision. Option A closes that, and `backend-expert`'s **V-7** removes the orphan
objection that would otherwise have been its biggest cost. Against it: a third table, a model hook,
and a wider retrofit.

`backend-expert`'s strongest argument is precedent-based and worth quoting in substance: this repo
pays real cost for a database last word with unusual consistency — 0024b **D-14** chose
`restrictOnDelete` explicitly so the guard is *"genuine defence-in-depth rather than the only
protection"*; 0024 **D-9** accepted a **named forward cost** on a future story for the same house
consistency; 0028 **D1** chose two tables so the FK *"is* the guarantee" rather than "an application
rule that any seeder, tinker session or future import bypasses"; and **0024's own D-11 already listed
the application-only mechanism as "Rejected as the sole mechanism"**. Choosing Option B means
consciously overturning that, which is a PO call and not an implementer's.

`database-expert`'s strongest counter is that **V-H** makes the race — the part everyone assumes is
the real danger — genuinely closed without any new structure, and that the remaining hole (a
sequential unaware writer) is a data-quality annoyance rather than an integrity failure: **nothing
joins on SKU anywhere**, and Epic 3's order lines *snapshot* it per 0024 **D-12** reason 4, so no FK
will ever key on it.

~~**`product-owner`'s recommendation: Option A**~~ — **superseded 2026-08-18**; the PO chose neither
option. Retained verbatim: on the narrow ground that 0024 **D-11** already
rejected the application-only mechanism and this story should not silently overturn a dependency's
recorded decision — with the strong rider from `backend-expert`'s **D-C** that if 0024 has not yet
entered Phase 3, **the registry should be folded into 0024 rather than retrofitted here**. That is
strictly cheaper (one implementation instead of one-then-amended), and it makes 0024's own central
acceptance criterion *"a duplicate SKU is refused"* true for the first time — today 0024 ships a rule
PRD §2.2's Scenario Outline demonstrably defeats (**V-5**). Recorded as **[OQ-1](#open-questions)**.

> **Revisit trigger, recorded either way and still live after the 2026-08-18 amendment: the moment a
> *third* SKU-bearing entity appears** — bundles/kits, or Epic 3 order lines carrying a SKU —
> pairwise application checks become N² and the registry wins outright. At two tables it is a
> judgement call; at three it is not. Note the derived-SKU rule *weakens* this trigger rather than
> removing it: a third entity whose SKU is also derived adds no typed claimant, but one that lets a
> human type a SKU does.

#### The product side must be retrofitted too *(still live after the amendment)*

Because the namespace is shared, **0024's `CreateProduct` and `UpdateProduct` must also check
`product_variants.sku`** — otherwise collision case **(a)**, a product claiming a string some
variant already derived, is unguarded. **This is the half the derived-SKU amendment does not
simplify away**: a product SKU *is* typed, so it is the only remaining place a human can claim a
string in this namespace. Amending the shared `productSkuRules()` covers the validation layer for both
sides automatically, which is precisely why it belongs in 0024's trait; the locking pre-check
(**D-4.5**) must be added to 0024's two product actions explicitly, in the same fixed order.
`UpdateProduct` additionally owns the **re-derivation cascade** of **D-4.6**. This is a
**modification to another story's shipped code**, listed as such in
[Files to create/modify](#files-to-createmodify), and it is the direct analogue of 0024 retrofitting
0023's `DeleteProductCategory`.

### D-5 — Exact schema

**Timestamp ordering (hard requirement).** Both FKs are declared inline, so both parents must
already exist:

```
<0019>   create_media_table
<0023>   create_product_categories_table
<0024>   create_products_table
<0024+>  create_product_media_table
<0028>   create_product_attribute_types_table
<0028+>  create_product_attribute_values_table
<0029>   create_product_variants_table          ← strictly later than products AND media
<0029+>  create_product_variant_values_table    ← strictly later than product_variants AND product_attribute_values
```

Laravel rolls back in reverse timestamp order, so the pivot drops before `product_variants` and that
drops before `products` — the `dropIfExists` pair is genuinely symmetric with no manual FK drops.

```php
// <ts>_create_product_variants_table.php
Schema::create('product_variants', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();

    // sha256 of the variant's sorted attribute-value ids. Derived, write-once, never read for
    // meaning — it exists only so "no two variants of a product share a combination" is a database
    // invariant. A generated column cannot do this: MySQL 8.4 rejects a subquery in a
    // generated-column expression (ERROR 3102, verified). See story 0029 D-3.
    $table->char('combination_hash', 64);

    // DERIVED from products.sku + the variant's attribute values (D-4). Never admin-typed, never
    // mass-assignable. 128 rather than 0024's 64 on purpose: the length is a function of inputs the
    // administrator does not control directly, and there is no field to shorten — D-4.4, OQ-17.
    $table->string('sku', 128);
    $table->decimal('price', 10, 2);              // NOT NULL — 0024 D-2, and see D-6 / OQ-2
    $table->integer('stock')->default(0);         // signed on purpose — 0024 D-3
    $table->foreignUuid('featured_media_id')->nullable()
        ->constrained('media')                    // 'media' is MANDATORY — 0024 V-4/R-3: Laravel
        ->restrictOnDelete();                     // would otherwise infer `featured_media`
    $table->unsignedInteger('position')->default(0);
    $table->timestamps();

    // NOTE: no ->index('product_id') and no ->index('featured_media_id'). The composite unique's
    // leading column IS product_id, and InnoDB auto-creates the supporting index for
    // featured_media_id at constraint time. Writing either by hand emits a second DDL statement and
    // produces a redundant index — 0024 D-10, and the exact write amplification
    // docs/errors-log.md records for users_uuid_unique. Do not "restore" them.
    $table->unique('sku');
    $table->unique(['product_id', 'combination_hash']);
});
```

```php
// <ts+1>_create_product_variant_values_table.php
//
// The table is `product_variant_values`, NOT `product_variant_attribute_values` (67-char FK name)
// and NOT `product_variant_attribute_value` (66-char FK name). BOTH exceed MySQL's 64-char
// identifier limit and fail at migrate time with ERROR 1059. Verified independently by both
// amigos, at both name lengths. See V-B / V-9. Do not "improve" this name back.
Schema::create('product_variant_values', function (Blueprint $table): void {
    $table->foreignUuid('product_variant_id')->constrained()->cascadeOnDelete();

    // restrictOnDelete() is MANDATED by story 0028's D4, not a local choice: an attribute value any
    // variant is built on must not be deletable. The application-level in-use block is the message;
    // this is the guarantee behind it.
    $table->foreignUuid('product_attribute_value_id')->constrained()->restrictOnDelete();

    // No surrogate id (nothing FKs a pivot row), no timestamps (0024 D-8), no position (a
    // combination's display order derives from the types'/values' own `position`). No hand-written
    // index on product_attribute_value_id: InnoDB auto-creates the supporting index for the
    // trailing FK column — verified live on role_has_permissions, whose migration declares only the
    // composite PRIMARY.
    $table->primary(['product_variant_id', 'product_attribute_value_id']);
});
```

`->constrained()` with **no argument** is correct on both pivot FKs — verified (**V-L**) that
`product_attribute_value_id` infers `product_attribute_values`. Only `featured_media_id` needs the
explicit `'media'`. `down()` in both files is the exact `Schema::dropIfExists(...)` inverse.

### D-6 — Per-column rationale

| Column | Decision | Why |
| --- | --- | --- |
| `id` | UUID v7 via `$table->uuid('id')->primary()` + `use HasUuids;` | See **D-11** |
| `product_id` | `foreignUuid()->constrained()->cascadeOnDelete()`, NOT NULL | 0024 **D-12**: a product delete is a hard delete that *"cascades to `product_media` and (0029) `product_variants`"*. A variant cannot exist without its product |
| `combination_hash` | `char(64)`, NOT NULL | **D-3** |
| `sku` | `string(128)`, NOT NULL, `unique`, **derived and not `#[Fillable]`** | **D-4**. Computed as `{product.sku}-{segment(value)}…` in `(type.position, type.id, value.position, value.id)` order (**D-4.2**), stored rather than virtual (**D-4.3**), re-derived when the parent SKU or a value string changes (**D-4.6**). Width widened from 0024's 64 (**D-4.4**, **OQ-17**). 0024's `Str::upper()` canonicalisation does **not** apply — the derived value preserves the attribute value's casing (**OQ-14**) |
| `price` | `decimal(10,2)`, **NOT NULL**, no default | See below. 0024 **D-2** applies unchanged: never `float`; scale 2 (EUR cent, single currency per assumption 10); **do not write `->unsigned()`** (deprecated on `DECIMAL` since MySQL 8.0.17 *and* ignored by SQLite); `'price' => 'decimal:2'` returns a **string**, so `@property string $price` (0024 **R-4**, inherited wholesale) |
| `stock` | `integer` (**signed**), NOT NULL, `default(0)` | 0024 **D-3** verbatim — signed so Epic 3 owns the oversell decision rather than inheriting a MySQL `1264` 500; `UNSIGNED` is ignored by SQLite anyway; `'integer','min:0'` is the app-level enforcement |
| `featured_media_id` | `foreignUuid()->nullable()->constrained('media')->restrictOnDelete()` | 0024 **D-9** confirmed. **Nullable *is* the inheritance mechanism** — see **D-7** |
| `position` | `unsignedInteger`, NOT NULL, `default(0)` | See **D-8** |
| `timestamps()` | present | Universal in this repo |
| — | **no `SoftDeletes`** | 0024 **D-12** reason #1 with double force: `Rule::unique()` does not apply the soft-delete scope ([schema.md](../../../docs/database/schema.md#soft-deletes)), so a trashed variant would permanently squat **both** its SKU *and* its `combination_hash` — "re-create the Size 40 / Black variant" would be refused with nothing in the UI able to explain why |

**On `price` being NOT NULL rather than nullable-and-inheriting.** Read the two PRD sentences against
each other: the Gherkin says *"that variant has its own SKU, price, and stock"*, and the acceptance
criterion says *"each variant combination has its own SKU/price/stock **and an optional image that
inherits the parent's**"*. The acceptance criterion marks **exactly one** field as
optional-and-inheriting, in the same breath as listing the other three as "its own". That contrast
reads as deliberate authoring, not an omission. Three engineering reasons agree:

1. A nullable-inherit price makes every price read a coalesce and an N+1 magnet
   (`$variant->price ?? $variant->product->price`). The image has the same shape but its failure mode
   is a missing thumbnail; the price failure mode is a **wrong number**.
2. Epic 3 snapshots the price onto the order line (PRD §3.2, quoted in 0024 **D-12** reason #4). A
   NULL that must be resolved through a parent before snapshotting is one forgotten `??` from
   persisting `null` or `0.00` onto an order line — a money bug, permanently.
3. `decimal:2` already returns a string (0024 **R-4**). Making it `?string` stacks a second silent-
   coercion trap on this codebase's single most-noted footgun.

The genuine cost is admin ergonomics — 40 variants where only 3 sizes differ in price means typing
the same number 37 times — and that is a **UI** problem with a UI answer (the builder pre-fills each
variant's price from the parent at creation). Flagged as **[OQ-2](#open-questions)** because it is a
product decision and it is a one-line `->nullable()` change *before* Phase 3 versus an expensive
backfill after. **Inheriting *stock* is not open**: stock is a count of physical units, and a variant
sharing its parent's count double-counts inventory.

### D-7 — Featured-image inheritance is resolved at **read time**, never copied

```php
// app/Models/ProductVariant.php
/** Own image if set; otherwise the parent product's. Never copies — the pointer stays null. */
public function displayFeaturedMediaId(): ?string
{
    return $this->featured_media_id ?? $this->product->featured_media_id;
}
```

**Do not copy the parent's `featured_media_id` into the variant row at creation.** It would satisfy
the first PRD scenario and then silently break it forever: changing the product's featured image
would stop propagating to variants that never chose one, which is exactly what *"inherits the
parent's featured image"* forbids. **NULL is the inheritance flag, and it must stay NULL** — which is
why the test for this must change the parent's image and re-resolve (see **FP2**).

Naming mirrors 0024 **D-7**'s `displayStatus()` precedent for a computed, never-persisted value:
`featuredImage()` for the own relation, `displayFeaturedMedia*()` for the resolved value. Consequence
to design around (**R-D**): a variants list must eager-load
`['featuredImage', 'product.featuredImage']` or the accessor lazy-loads per row.

### D-8 — `position` ships *(second expert split — minor, but decide it)*

> **The two amigos disagreed here too.** `database-expert` ships the column; `backend-expert` omits
> it and orders by `id`, on the ground that **UUIDv7 is time-ordered** (ADR 0001's own premise), so
> `ORDER BY id` *is* creation order for free and a `position` column nobody's UI writes is dead
> schema — 0028 **D8**'s own test. The counter, and why the column is recommended: creation order
> only matches the natural expectation ("38, 39, 40") if the administrator happened to create them
> in that order, and a bulk generator would have to sort its output to compensate. This is cheap
> either way and is **[OQ-11](#open-questions)**; the column is one line now and an `ALTER` later.
> The rules below apply if it ships.

0028 **D5** and 0024 **D-8**'s rules apply verbatim: not nullable, `default(0)`, assign on create as
`MAX(position) + 1` scoped to the product in the same transaction, gaps are fine, reorder by
rewriting the whole sibling set in one transaction (never pairwise swaps, which corrupt under
concurrency), **no** unique on `(product_id, position)`, **no** index on `position`.

One thing is *better* here than in either precedent: **the tiebreak is guaranteed total.**
`ORDER BY position ASC, sku ASC` is deterministic because `sku` is `UNIQUE NOT NULL` — unlike 0024's
**R-6**, whose `media_id` tiebreak is only unique within one product's gallery. Declare it inside the
relationship, not at each call site.

Why not derive the order from the attribute values' own `position` (which is why 0028 shipped that
column)? Because for a multi-type combination that is a lexicographic sort over a **variable-length
tuple** of `(type.position, value.position)` pairs — not expressible as a single `ORDER BY` over the
pivot without a pivoted subquery per type or a sort in PHP. The `position` column is the cheap escape
hatch, and a generator naturally populates it in exactly that derived order at creation.

### D-9 — Columns and behaviours deliberately **excluded**

| Considered | Verdict | Reason |
| --- | --- | --- |
| `status` on a variant | **against** | No PRD scenario has one; 0024 **D-6**'s `status` belongs to the product, and "an Active variant on a Draft product" is undefined everywhere. 0028 **D8** rejected `is_active` on attribute types on identical grounds ("a status column no UI ever sets is dead schema"). The real need — discontinue one size — is expressible today as `stock = 0`, which already drives 0024 **D-7**'s badge. Raised as **OQ-6** so the omission is a decision |
| `name` / `label` | **against, firmly** | "Size 40 / Color Black" is *derived* from the combination, ordered by `(type.position, value.position)`. Storing it duplicates data 0028 explicitly allows renaming, so it drifts the first time an admin renames a value — the same denormalisation 0028 **D8** rejected for `values_count`. Derive it in an accessor over the eager-loaded pivot |
| `description` | against | Not in the PRD; a variant is a SKU/price/stock delta, not a content entity |
| a **manual SKU override** (`sku_override`, or making `sku` editable when set) | **against, for now** | The PO's rule is that a variant SKU *is* derived; an override field re-introduces the typed claimant the derivation exists to remove, and with it the whole reserve-a-string problem D-4's superseded debate was about. The escape hatch it would provide — an unresolvable collision (**D-4.5** case (a)/(c)) — is instead resolved by renaming the attribute value or the product's SKU, which the refusal message names. Raised as **OQ-16** so the omission is a decision, not an oversight |
| a second, normalised `sku_canonical` column for case-insensitive matching | **against** | It is a registry by another name — a second column encoding one fact, which 0024 **D-7** rejects. Case-insensitivity comes from `utf8mb4_unicode_ci` (**V-8**) with the app comparing an upper-cased form on both sides; the residual is the SQLite gap already recorded as **R-H** |
| `barcode` / `ean` | against | Never mentioned; additive later |
| `weight` / dimensions | against | Shipping (0032/0033/0035) references no per-variant weight |
| a variant gallery pivot | against | PRD says *"an optional image"*, singular. 0024 **D-9** already establishes featured and gallery as independent concepts; a variant gallery invents scope |
| a `variants_count` / summed-stock counter on `products` | **against** | A counter cache that drifts silently, zero precedent (0028 **D8** rejected the same for `values_count`). But it exposes a real semantic question — **OQ-3** |
| a `ProductVariantSeeder` | against | Same reasoning as 0028 **D8**: variants are admin-defined, and seeding demo data reopens the production-reachability question [seeder-safety.md](../../../docs/security/seeder-safety.md) settled |
| translatable value labels | out of scope | 0028's **Q4** owns it; nothing here changes it |

### D-10 — Delete / cascade matrix, and the in-use blocks this story finally makes real

| FK | Behaviour | Justification |
| --- | --- | --- |
| `product_variants.product_id` → `products.id` | **`cascadeOnDelete()`** | 0024 **D-12**, verbatim inheritance of a frozen decision |
| `product_variants.featured_media_id` → `media.id` | **`restrictOnDelete()`**, nullable, `constrained('media')` mandatory | 0024 **D-9**/**RQ-2**. **This adds a fourth reference source** to the obligation 0024 wrote into its DoD |
| `product_variant_values.product_variant_id` → `product_variants.id` | **`cascadeOnDelete()`** | A combination row is meaningless without its variant — `create_passkeys_table`'s "no orphaned passkeys" |
| `product_variant_values.product_attribute_value_id` → `product_attribute_values.id` | **`restrictOnDelete()` — mandated, not chosen** | 0028 **D4**: *"If 0029 wires it as a cascade, the application-level in-use block becomes the only thing standing between an administrator and silent mass variant deletion."* |

**The three-level chain, stated explicitly because it reads ambiguously.** Deleting a **product**
fires `products → product_variants (CASCADE) → product_variant_values (CASCADE)` and completes
cleanly. The pivot's `RESTRICT` does **not** interfere: `RESTRICT` guards deleting the *parent*
`product_attribute_values` row, not deleting a pivot row. This needs its own test — a reviewer will
ask.

Two related facts worth pinning: **`ON DELETE CASCADE` fires no Eloquent model events**, so deleting
a product removes its variants with no `deleting` hook and no observer — anything that must run
per-variant has to be explicit, the same lesson `base-standards.md` draws from `User::delete()`. And
**0024 D-12 reason #3 is now load-bearing on this table**: if anyone ever adds `SoftDeletes` to
`Product`, this cascade stops firing (a soft delete is an `UPDATE`), leaving variants live under a
trashed parent.

🟠 **The two in-use blocks moved to [0029a](0029a-attribute-in-use-delete-guards-backend.md) on
2026-09-04.** This section used to specify both of them — the type-level guard 0028's **D7** built the
`DeleteProductAttributeType` seam for, and the per-value guard in `SyncProductAttributeValues`' delete
branch that 0028's D7 did **not** anticipate — together with their two count queries, the
hard-block-with-a-count rule inherited from 0024b **D-14**, and **OQ-7**. All of it is now 0029a's,
verbatim plus the two corrections Phase 2 required (the guard must run **after** `Gate::authorize()`,
and the database backstop must be narrowed to **1451** rather than folded into
`SyncProductAttributeValues`' existing `23000` catch).

**What stays here** is the schema half above, which is what makes those guards possible and which
this story genuinely owns: the pivot's `restrictOnDelete()` FK, mandated by 0028 **D4**, and **V-12**'s
executed proof that without an application-level pre-check the administrator meets a raw `1451` while
InnoDB cascades type→values and **nothing at all is deleted**. The FK's own behaviour is still tested
here (see `ProductVariantReferentialIntegrityTest`); the *message* in front of it is 0029a's.

**Sequencing consequence, stated because it is the one cost of this cut.** Both this story and 0029a
edit [`app/Actions/Products/SyncProductAttributeValues.php`](../../../app/Actions/Products/SyncProductAttributeValues.php),
in **different branches** of the same class: this story amends the **rename** branch (**D-4.6**'s SKU
re-derivation cascade), 0029a amends the **delete** branch. 0029a therefore runs strictly after this
story reaches Phase 7. **R-J** already names uncoordinated edits to a shared file as this story's own
risk; this is that risk, made explicit and made sequential rather than concurrent.

### D-11 — Primary key: UUID v7, citing assumption 19 directly

`product_variants` keys on a **UUID v7** string primary key via `HasUuids`, at both the migration
level (`$table->uuid('id')->primary()`, `foreignUuid(...)->constrained()`) and the Eloquent level.

Unlike 0019 (`media`) and 0028 (the attribute tables), **this story needs no policy-extension
argument.** PRD [assumption 19](../../../docs/PRD/PRD.md#assumptions--confirmed-decisions) names
*"Product Variants"* explicitly as one of the seven originally-enumerated UUID entities, and
[ADR 0001](../../../docs/decisions/0001-uuid-primary-keys.md) records it as still-future and greenfield.
Cite that directly; do **not** cite the general Epic-2 policy, which exists for entities the original
seven did not cover. `@property string $id`; **no** `$keyType` / `$incrementing` properties
([base-standards.md](../../../docs/conventions/base-standards.md#uuid-primary-keys)).

This story is therefore one of the ones that lets `docs-keeper` shorten ADR 0001's "still future"
list rather than extend its scope.

### D-12 — Permissions reuse `products.*`; `ProductPolicy` covers variants; 🟠 the actions **do** self-authorize (D-12.1)

**No new module slug and no `RolePermissionSeeder` change.**
[authorization.md](../../../docs/architecture/authorization.md) already records `products` as covering
"products, product categories **and variants**", and PRD line 474 lists the module as *"Products
(categories & variants)"*. 0028's **D6** settled this for the attribute taxonomy on the same basis.

**No `ProductVariantPolicy`.** 0024 ships `ProductPolicy`, and a variant is a product sub-resource
whose authorization question is always *"may this actor manage this product's catalog entry?"* —
there is no per-row distinction between two variants of the same product anywhere in the PRD. This
follows 0028's **D6** reasoning ("a policy would add an allow/deny matrix that every method answers
identically") while staying consistent with 0024, because the ability object 0031's per-row UI hints
need already exists on `ProductPolicy` and takes the **parent product** as its target. Gate variant
operations against the parent: `Gate::authorize('update', $variant->product)`.

#### D-12.1 — ✅ **Every variant action self-authorizes** *(decided 2026-09-04 at Phase 2; this was the deferral the review refused)*

> 🟠 **This subsection replaces a deferral, not a decision.** What stood here said *"the actions do not
> self-authorize, per 0024's **D-15**/**RQ-10**"* under a ⚠️ recording that the parenthetical
> justifying it was **false** and that 0029 *"must re-decide it before Phase 3"* — which is what Phase 2
> is. The old text is quoted in the box below rather than deleted, per this project's
> correct-in-place convention, and the reasoning it rested on is now answered instead of carried.

**Decision. All three variant actions authorize `update` on the *parent product* as their own first
statement, through `App\Actions\Auth\LogRefusedPrivilegedAttempt::authorize()`, before any validation
runs and before any transaction opens.**

```php
// app/Actions/Products/CreateProductVariant.php — the first statement, before everything
$this->logRefusedPrivilegedAttempt->authorize(
    'update', $product, targetType: 'product', targetId: $product->id,
);

// UpdateProductVariant / DeleteProductVariant — identical, against $variant->product
$this->logRefusedPrivilegedAttempt->authorize(
    'update', $variant->product, targetType: 'product', targetId: $variant->product->id,
);
```

Six points, each of which a reviewer would otherwise ask:

1. **Why this and not the deferral.** The convention is documented and unambiguous —
   [base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers):
   *"if an operation must not happen without a permission, the check lives in the class that performs
   the operation."* Every counter-precedent this document used to cite has since gone the other way:
   0024 reversed its own D-15/RQ-10 at its split (its **C-1**), 0025 discharged 0023's hand-off so all
   three `ProductCategories/` actions now self-authorize, and 0028's three attribute-type actions were
   written self-authorizing at Phase 1. **There is no live exception to the convention left standing.**
   Deferring here would make this the eleventh–thirteenth ungated action in `app/Actions/Products/`,
   which is precisely the compounding **DIS-3** names.
2. **The ability is `update`, and the target is the parent `Product`.** A variant is a product
   sub-resource; the authorization question is always *"may this actor manage this product's catalog
   entry?"*, which is what **D-12**'s no-`ProductVariantPolicy` paragraph above already establishes.
   Adding or removing one of a product's variants is a *modification of an existing catalog record*,
   not bringing a product into or out of the catalog — so `products.edit` (`ProductPolicy::update`)
   governs all three, including the delete. That is **OQ-12**'s standing recommendation, now adopted;
   the question is left flagged for PO confirmation of the **ability name only**, since it is action
   code and cheap to revisit (unlike a schema choice).
3. **`targetType: 'product'` is passed explicitly**, because
   `LogRefusedPrivilegedAttempt::resolveTarget()` auto-resolves only `User` and `Role` — the same
   explicit pass 0025's `DeleteProductCategory` and 0028's three actions already make. The logged
   target is the **gate's** target (the product), not the variant, so the audit line says what was
   authorized against rather than what was being written.
4. **`LogRefusedPrivilegedAttempt` is constructor-injected**, not method-injected — each action's
   `__invoke()` parameter list is a public contract every direct-call test matches verbatim
   (**D-17.1**), which is exactly the exception
   [code-style.md](../../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)
   documents. Consequence for tests: resolve every action with `app(...)`, never `new` — a
   zero-argument constructor is not a contract.
5. **`UpdateProductVariant` and `DeleteProductVariant` must not trust a hydrated `product` relation.**
   `$variant->product` is what the gate reads, so it must be a real read of the current parent, not a
   caller-staged instance — `$variant->loadMissing('product')` is insufficient if the caller
   pre-attached one. Load it fresh (`$variant->load('product')`) as the statement immediately before
   the gate, per [security/model-instance-trust.md](../../../docs/security/model-instance-trust.md) and
   the *"re-read what you authorize against"* half of base-standards' own rule.
6. **0031 still gates too, and that is a layer rather than duplication.** The component re-checks the
   same ability in every method that mutates *or discloses*; the action's check is what a queued job,
   Artisan command or future REST controller inherits. A reviewer deleting either has removed a layer.

> **Superseded text, retained verbatim (2026-08-18 – 2026-09-04):** *"**The actions do not
> self-authorize**, per 0024's **D-15**/**RQ-10** (`CreateUser`/`UpdateUser` and 0023's actions all
> authorize at the caller). Consequence, stated as 0024 required: **this story ships no enforcement
> path for variant CRUD**, and that is a deliberate hand-off to **0031**, recorded in the Definition of
> Done rather than left as a footnote."* Its parenthetical was false when written —
> `App\Actions\Users\CreateUser::__invoke()` opens with
> `$this->logRefusedPrivilegedAttempt->authorize('create', User::class);` and `UpdateUser` carries
> seven such calls. `backend-qa`'s standing dissent (recorded at 0023 **D-9** and 0024 **D-15**) is
> hereby **upheld** rather than merely "not withdrawn".

**What this changes elsewhere in this document**, so nothing is left contradicting it: **D-1**'s
*"ships no enforcement path"* consequence is retired; **D-17.1**'s closing *"none of these actions
authorizes"* is reversed; the Definition of Done's hand-off to 0031 keeps parts (b) and (c) and drops
part (a); and the Gherkin gains three authorization scenarios. **DIS-3**'s arithmetic improves again —
`app/Actions/Products/` gains three more **authorizing** actions rather than three more ungated ones —
but its actual ask (a project-level decision plus an `ArchitectureTest` assertion) is untouched and
still open.

### D-13 — A variant's combination is immutable after creation

`CreateProductVariant` writes the row and its pivot rows in one transaction.
`UpdateProductVariant` may write `sku`, `price`, `stock`, `featured_media_id` and `position`, and
**must never touch the pivot or the hash**. Changing a combination means deleting the variant and
creating a new one.

This is domain-correct, not a workaround: a variant **is** its combination, so mutating "Size 40 /
Color Black" into "Size 41 / Color Black" would carry the first physical item's SKU and stock history
onto a different one. It is also the load-bearing assumption under **D-3**'s entire drift argument,
which is why it is raised for sign-off as **OQ-4** rather than assumed silently.

### D-14 — Index plan and the deliberate omissions

**`product_variants` — three declared indexes, and that is all:**

| Index | Purpose |
| --- | --- |
| `PRIMARY (id)` | clustered `char(36)`; UUIDv7 is time-ordered, so insert locality is fine |
| `UNIQUE (sku)` | the within-table last word on the derived SKU (**D-4**), and the index **V-H**'s gap lock acts on. 512 bytes at `varchar(128)` utf8mb4 — still far under InnoDB DYNAMIC's 3072-byte limit, so widening the column from 64 costs nothing structural |
| `UNIQUE (product_id, combination_hash)` | the duplicate-combination invariant (**D-3**) **and** the `product_id` FK's supporting index, since `product_id` is its leftmost prefix. 400 bytes (144 + 256 in utf8mb4), far under InnoDB DYNAMIC's 3072-byte limit — 0028 **D2**'s omission pattern reused exactly |

Plus one InnoDB **auto-created** index nobody writes: the supporting index on `featured_media_id`.

Deliberate omissions, following [schema.md](../../../docs/database/schema.md)'s habit of documenting
*absent* indexes: **no `index('product_id')`** (covered as the composite unique's leading prefix —
0024 **D-10**, and the `users_uuid_unique` debt in [errors-log.md](../../../docs/errors-log.md)); **no
`index('featured_media_id')`** (InnoDB creates it at constraint time); **no `index('position')`**
(only ever a sort key inside an already-narrow `WHERE product_id = ?` range); **no `index('stock')`
or `index('price')`** (a variants list is always scoped to one product, and the eventual low-stock
report wants a composite, not a standalone — the same argument `schema.md` makes for `users.status`);
**no `unique(product_id, position)`** (it forces every reorder through a temporary out-of-range
shuffle; MySQL 8.4 has no deferred constraints); **no index on `combination_hash` alone** ("which
product has combination X" is not a query anyone runs).

**`product_variant_values` — one declared index and one free one.** `PRIMARY (product_variant_id,
product_attribute_value_id)` leads with `product_variant_id` because the dominant read is "this
variant's combination", and for a list `WHERE product_variant_id IN (…)` is one clustered prefix
range scan. InnoDB auto-creates `KEY (product_attribute_value_id)` as the trailing FK's supporting
index (**V-G**).

**Why the reverse direction needs no hand-written index** — the question **D-10**'s in-use counts
raise. An InnoDB secondary index implicitly carries the clustered-index columns in its leaf entries,
so the auto-created `KEY (product_attribute_value_id)` physically contains
`(product_attribute_value_id, product_variant_id)`. Both in-use queries are therefore **fully
covering**: the per-value count is one equality range scan that never touches the clustered index,
and the per-type count's `DISTINCT product_variant_id` resolves from the index leaf with no table
lookup, over an `IN` list bounded by the type's 10¹–10² values. This is the one place a reviewer will
reach for `$table->index('product_attribute_value_id')`; the migration comment exists to stop them,
and `php artisan db:table product_variant_values` **after a fresh migrate** (see **V-M**) is the DoD
verification — per errors-log's own rule, verify index reality against the database, never against
the migration diff.

---

> 🟣 **D-15 to D-18 were added on 2026-08-19.** D-15–D-17 fill the four contract gaps 0031 raised as
> [its OQ-3](../0031-product-variants-editor-ui.md#open-questions) — none of them is a new decision, each
> is a thing this story already decided and then never wrote down. **D-18 is the one genuine scope
> addition**: the cartesian generator.

### D-15 — Error-bag keys: the exact key every refusal throws on

0031 **D-8** established why this cannot be left implicit: a Flux field auto-renders an error only
when the bag key **exactly equals** its `wire:model` path, so an unspecified key is a refusal that is
invisible on screen while every backend test stays green. This story throws on **six** keys and no
others. This table is the contract.

| Bag key | Thrown by | Cases it carries |
| --- | --- | --- |
| `attributeValueIds` | `CreateProductVariant` (validation, then the **V-10** read-back) | the input array itself: absent, not an array, empty, over the per-combination cap, holding a duplicate id, holding an unknown id, or holding an id that survives `Rule::exists()` but does **not** come back from the authoritative read-back (the **V-10** case-variance path) |
| `combination` | `CreateProductVariant` (**D-3**), and the `23000` catch on `unique(product_id, combination_hash)` | *this exact combination already exists on this product* — and nothing else |
| `sku` | `CreateProductVariant` (**D-4.5**), `UpdateProduct`'s re-derivation cascade (**D-4.6**), and the `23000` catch on `unique(sku)` | **all four** derived-SKU refusals: `derived_sku_taken`, `derived_sku_empty_segment`, `derived_sku_too_long`, `parent_sku_change_collides` |
| `price` / `stock` / `featuredMediaId` | `CreateProductVariant`, `UpdateProductVariant` (validation) | the ordinary per-field rules of **D-16** |

🟠 **The seventh key, `attributeTypeIds`, moved to
[0029b](0029b-product-variant-combination-generator-backend.md) on 2026-09-04**, with the generator
that throws on it. **This story throws on exactly six keys** — `attributeValueIds`, `combination`,
`sku`, `price`, `stock`, `featuredMediaId` — and no others; 0029b adds a seventh of its own and
inherits all four rules below unchanged.

Four rules that make the table total rather than merely descriptive:

1. **A key is the camelCase name of the action parameter it is about.** `attributeValueIds`,
   `featuredMediaId`, `attributeTypeIds` — matching 0024's `productCategoryId` / `galleryMediaIds`
   and this repo's existing `pending_email`-era habit of naming the bag after the input, not after the
   column. The one deliberate exception is the next point.
2. **`combination` is deliberately *not* `attributeValueIds`, and this is the answer to 0031
   OQ-3(a)'s sibling question.** A duplicate combination is not a fault of any one submitted id — the
   ids are individually valid and the set as a whole is the problem. Attaching it to
   `attributeValueIds` would render it under whichever value picker happens to be bound to that path
   (0031 **D-8** puts it under the *whole* fieldset instead, which is only expressible because the key
   is distinct). Keeping the two keys separate is also what lets a test assert *which* rule refused —
   see **R-F**, where reporting a duplicate SKU as a duplicate combination is the named bug.
3. ✅ **`derived_sku_empty_segment` and `derived_sku_too_long` throw on `sku`** — this is 0031
   OQ-3(a)'s question, answered as it recommended. All four SKU refusals share one key so 0031 renders
   them in one place (its single `flux:callout` under the SKU preview) rather than three. They are
   distinguished by their **translation key**, never by their bag key, and a test that asserts
   *which* message appeared must assert the message, not the key.
4. **Every one of these keys is unbound on 0031's screen** (there is no `sku` input — **D-4.3** — and
   no field bound to `combination` or `attributeValueIds` as a whole), so 0031 must render all of
   them explicitly. That obligation is 0031's, and it is repeated in this story's Definition of Done
   so the hand-off is recorded on both sides.

### D-16 — `ProductVariantValidationRules`, written out in full

The [Files table](#creates) named three methods and specified none of them; 0031 OQ-3(b) additionally
needs a fourth that was never listed. The trait is written out here so there is one definition and no
call site has to guess. It stays flat and single-concern and `use`s no other trait
([naming.md](../../../docs/conventions/naming.md#traits-and-their-methods)), and **every leaf method is
entity-prefixed** per 0024's naming trap — a variant editor composing this alongside
`ProductValidationRules` would otherwise fatal on `priceRules()` / `stockRules()` /
`featuredMediaIdRules()`, which is exactly the composition 0031 performs.

| Method | Applies to | Rules |
| --- | --- | --- |
| `variantCombinationRules()` | `attributeValueIds` (the array itself) | `['required', 'array', 'min:1', 'max:10']` |
| `variantCombinationValueRules()` | `attributeValueIds.*` (each element) | `['string', 'distinct', Rule::exists('product_attribute_values', 'id')]` |
| `variantPriceRules()` | `price` | `['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99']` — 0024's `priceRules()` verbatim |
| `variantStockRules()` | `stock` | `['required', 'integer', 'min:0']` — 0024's `stockRules()` verbatim; `min:0` is the app-level statement of the invariant **D-6** deliberately kept out of the DDL |
| ✅ `variantFeaturedMediaIdRules()` | `featuredMediaId` | `['nullable', 'string', Rule::exists('media', 'id')]` — **the method 0031 OQ-3(b) is missing**, added exactly as it recommended |

🟠 **Two further methods moved to [0029b](0029b-product-variant-combination-generator-backend.md) on
2026-09-04** — `variantAttributeTypeIdsRules()` and `variantAttributeTypeIdRules()`, which only the
generator calls. **This trait ships five methods here**; 0029b appends the other two to the same
trait (an append, never a second trait — the same "extend, never recreate" rule the `lang/` files
follow).

#### D-16.1 🔴 — The two id arrays MUST be validated in two passes, never one combined rule array

**Added 2026-09-04 (Phase 2 defect 5).** This story was debated on 2026-08-18/19, before story
0028's Phase 4 finding wrote the mechanism onto
[security/array-validation-bounds.md](../../../docs/security/array-validation-bounds.md), so **D-16** as
written above specifies exactly the hazard that page documents: an array-level `max:10` on
`attributeValueIds` sitting in the same rule array as a `.*` rule carrying
`Rule::exists('product_attribute_values', 'id')`.

**`max:N` on an array bounds what may *succeed*; it does not bound what the request *costs*.** Laravel
expands `field.*` against the data it was given and runs every expanded rule regardless of whether the
parent attribute's own rules already failed — so a payload of 4,000 ids pays 4,000 `Rule::exists()`
queries before the `max:10` message is returned. That page's measured numbers for the identical shape:
2,000 submitted ids → **2,000 queries, 3.28 s, 2,001 error messages** in one pass; **0 queries, 0.00 s,
1 message** in two. Neither `bail` form helps — `field` and `field.*` are different attributes.

✅ **Mandatory shape, in `CreateProductVariant`, matching how 0027 discharged the identical hand-off
for `regionIds`/`galleryMediaIds`:**

```php
// app/Actions/Products/CreateProductVariant.php — after the D-12.1 gate, before the transaction.
// PASS 1 -- shape and bound ALONE, in its own call. Must throw before a single
// per-element exists() query runs.
Validator::make(
    ['attributeValueIds' => $productAttributeValueIds],
    ['attributeValueIds' => $this->variantCombinationRules()],
)->validate();

// PASS 2 -- the per-element rules, now provably running against at most 10 elements.
Validator::make(
    ['attributeValueIds' => $productAttributeValueIds],
    ['attributeValueIds.*' => $this->variantCombinationValueRules()],
)->validate();

// PASS 3 -- the scalar fields. Separate only because passes 1 and 2 must not be
// delayed behind them; combining these three with the array rules is what the page forbids.
Validator::make(
    ['price' => $price, 'stock' => $stock, 'featuredMediaId' => $featuredMediaId],
    [
        'price' => $this->variantPriceRules(),
        'stock' => $this->variantStockRules(),
        'featuredMediaId' => $this->variantFeaturedMediaIdRules(),
    ],
)->validate();
```

Four rules that come with it:

1. **Pass 1 must contain the bound and nothing that touches the database.**
   `variantCombinationRules()` is `['required', 'array', 'min:1', 'max:10']` — all four are shape
   rules, so pass 1 issues zero queries and either throws or guarantees ≤ 10 elements to pass 2.
2. **The two passes produce two `ValidationException`s rather than one merged bag, and that is the
   correct trade** — an oversized array has no per-element errors worth showing, and Livewire
   *persists* the error bag across requests, so a one-pass shape bloats every subsequent round trip
   until the bag is reset.
3. 🔴 **The bound also protects the D-3 read-back, which is the thing that actually matters here.**
   The `ProductAttributeValue::query()->whereIn('id', $submittedIds)` read-back is **one** query
   whatever the array size — but its `IN (…)` placeholder list is client-sized unless something
   bounds the array first. Pass 1 is that something, and it is the only thing that is: the read-back
   runs *after* validation by construction (**V-10** requires it), so there is no second control.
   This is [array-validation-bounds.md](../../../docs/security/array-validation-bounds.md)'s
   *"a cap on the array's length is not a cap on the loop's work"* rule arriving at the read-back
   instead of at a loop — and its own ⚠️ that a query-count test cannot distinguish "bounded before
   the query" from "not bounded at all" (both issue exactly one) applies verbatim: **assert the
   binding count, not the query count.**
4. **0031 inherits the obligation and does not replace it.** The component validates in the same two
   passes as defence in depth; the action's passes are what a non-Livewire caller inherits. Neither
   is optional.

**No `productSkuRules()`, and no variant SKU rule of any kind** — unchanged from the original files table, and
now load-bearing for a second reason: 0031 OQ-3(b) notes that the alternative it was weighing
(composing 0024's whole `ProductValidationRules` just to reach `featuredMediaIdRules()`) would put
`productSkuRules()` in reach of a component that must never validate a SKU. Adding the one method here is
what closes that, so **do not** "simplify" this trait by having it `use ProductValidationRules`.

Four notes, each of which a reviewer will otherwise raise:

- **The array/element split mirrors 0024's `galleryMediaIds` / `galleryMediaIds.*`** exactly. Two
  methods rather than one, because Laravel needs the two rule sets under two different keys and a
  single method returning both is not expressible.
- 🔴 **`Rule::exists()` here is a first pass, never the authority.** **V-10**: `utf8mb4_unicode_ci`
  makes it case-insensitive, so a submitted `V-40` validates against a stored `v-40` and then hashes
  differently. The **read-back in D-3 remains mandatory** and is what actually decides both the hash
  and the SKU derivation. Nothing in this trait relaxes that, and a reviewer who sees `Rule::exists()`
  and concludes the ids are verified has made precisely the mistake **FP11** exists to catch.
- **`max:10` on the combination array** is a sanity bound, not the real backstop. The real one is
  `DeriveVariantSku::MAX_LENGTH = 128` (**D-4.4**), which refuses an over-long derivation with a message
  naming the length. Ten axes on one variant is already nonsense; the number is deliberately generous
  so it never refuses a legitimate catalog and never becomes the *reason* a variant is rejected.
- 🟠 The `max:5` note that sat here, about the type-id array's own bound and how it interacts with the
  batch cap, moved to **[0029b](0029b-product-variant-combination-generator-backend.md)** with the two
  methods it describes.

### D-17 — Action signatures and named relations

0031 OQ-3(c) and (d). Both gaps are the same shape: this story describes these classes in prose and
never declares them, so two stories would each invent a signature and only discover the mismatch in
Phase 3.

#### D-17.1 — The action signatures 🟠 *(three, since the generator's moved to 0029b)*

```php
// app/Actions/Products/CreateProductVariant.php
/**
 * @param  array<int, string>  $productAttributeValueIds  as submitted; re-read from the DB per V-10
 *
 * @throws \Illuminate\Validation\ValidationException  on attributeValueIds, combination or sku
 */
public function __invoke(
    Product $product,
    array $productAttributeValueIds,
    string $price,
    int $stock,
    ?string $featuredMediaId = null,
): ProductVariant

// app/Actions/Products/UpdateProductVariant.php
/**
 * Never touches the pivot, the hash, or the SKU (D-13, D-4.3).
 * $position is null on every call site today — see the note below.
 */
public function __invoke(
    ProductVariant $variant,
    string $price,
    int $stock,
    ?string $featuredMediaId,
    ?int $position = null,
): ProductVariant

// app/Actions/Products/DeleteProductVariant.php
public function __invoke(ProductVariant $variant): bool

// 🟠 GenerateProductVariantCombinations' signature moved to 0029b with D-18 (2026-09-04).
```

**Corrected 2026-09-04 (Phase 5 code review) — `UpdateProductVariant`'s `$featuredMediaId` carries no
default.** This section originally specified `?string $featuredMediaId = null`, copied from
`CreateProductVariant`'s identical-looking parameter without checking whether the default transfers to
an update path. It does not: per `docs/errors-log.md`'s 2026-09-01 entry ("An action's own parameter
default reintroduced the omission ambiguity its stricter collaborator was built to close"), a default
that is safe on **create** — where omission and "no value yet" denote the same real state — is not
automatically safe on **update**, where omission usually means "the caller never touched this field",
not "clear it". An unchanged default would have let any future caller that simply forgot to pass
`featuredMediaId` silently null out a variant's own image on an otherwise ordinary price/stock edit,
with no error. `CreateProductVariant`'s own `?string $featuredMediaId = null` is unaffected and remains
correct — a brand-new variant genuinely starts with no image.

**All three constructors take `LogRefusedPrivilegedAttempt` (D-12.1)**, and none of them widens
`__invoke()` to carry it — that is
[code-style.md](../../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)'s
documented exception, and the reason every direct-call test must reach these through `app(...)` rather
than `new`.

Five things these signatures decide, each with the alternative that was rejected:

1. **Explicit named scalars, not an `array $data` bag.** The bag form is shorter and is what a first
   draft reaches for; it is refused because (i) Larastan level 7 cannot check the shape of an untyped
   array, so every typo becomes a runtime surprise in a story whose whole risk profile is derived
   columns, and (ii) a `$data` array is exactly how `sku` or `combination_hash` gets smuggled into a
   `create()`. 0024 already states the countermeasure — *"builds the row from a **literal whitelist**,
   never a spread of `$validated`"* — and a named-parameter signature makes that structural rather
   than disciplinary. This matches 0031's own OQ-3(c) recommendation.
2. **`string $price`, never `float`.** **R-C** / 0024 **R-4**: `decimal:2` round-trips as a string, and
   a `float` parameter silently reformats `'19.90'`. The value arrives from the form as a string and
   is stored as one; nothing in between should convert it.
3. **`ProductVariant` return, not `bool` or `void`**, on both write actions — the caller needs the row
   back to render it (0031 appends it to the list without re-querying), and the derived `sku` is only
   knowable from the returned model.
4. **`DeleteProductVariant` returns `bool`**, matching 0024's `DeleteProduct::__invoke(Product): bool`
   rather than inventing a third convention for a delete in the same folder.
5. **`?int $position = null` means "leave it alone".** **D-13** permits the update path to write
   `position`, so the parameter exists; **no call site passes it today**, because a reorder is a
   whole-sibling-set rewrite in one transaction (**D-8**, inheriting 0024 **D-8**'s "never pairwise
   swaps") and therefore belongs to a `ReorderProductVariants` action that **this story does not
   ship**. That absence is what 0031's OQ-6 flags; it is recorded here rather than silently implied by
   a parameter that looks usable.

🟠 **Reversed 2026-09-04.** This paragraph used to read: *"**None of these actions authorizes** —
**D-12**, unchanged. The signatures take a `Product` / `ProductVariant` the caller has already resolved
*and already gated*."* **All three authorize, as their own first statement** (**D-12.1**). The
signatures still take a resolved `Product` / `ProductVariant`, and the caller may gate too — that is
defence in depth, not duplication — but the action is no longer relying on it.

#### D-17.2 — Every relation, named, with its return type

Prose in this document refers to `Product::variants()`, `ProductVariant::values()` and
`ProductAttributeValue::variants()` without ever declaring them. All of them, fixed here. PHPDoc
follows 0024's shape verbatim (`@return HasMany<Product, $this>`), which already passes Larastan
level 7.

> 🟠 **Corrected 2026-09-04 (Phase 2 defect 3).** This paragraph used to add: *"and 0028 declares its
> value→type relation as a bare `belongsTo(ProductAttributeType::class)` with no method name at all."*
> **That is false.** [`app/Models/ProductAttributeValue.php`](../../../app/Models/ProductAttributeValue.php)
> ships the relation already named `type()`, already typed `BelongsTo`, already carrying
> `@return BelongsTo<ProductAttributeType, $this>`, and already passing the foreign key explicitly
> (`belongsTo(ProductAttributeType::class, 'product_attribute_type_id')` — with its own comment saying
> why, since a method named `type` would otherwise make Eloquent infer `type_id`). There is nothing to
> add and nothing to name.

| Model | Method | PHPDoc | Notes |
| --- | --- | --- | --- |
| `Product` *(0024's file)* | `variants(): HasMany` | `@return HasMany<ProductVariant, $this>` | **Ordering is declared inside the relation** — `->orderBy('position')->orderBy('sku')` — never at the call site (**D-8**). The `sku` tiebreak is total because `sku` is `UNIQUE NOT NULL` |
| `ProductVariant` | `product(): BelongsTo` | `@return BelongsTo<Product, $this>` | NOT NULL FK; never nullable in practice |
| `ProductVariant` | `values(): BelongsToMany` | `@return BelongsToMany<ProductAttributeValue, $this>` | `belongsToMany(ProductAttributeValue::class, 'product_variant_values')`. **Read-only — see below** |
| `ProductVariant` | `featuredImage(): BelongsTo` | `@return BelongsTo<Media, $this>` | on `featured_media_id`; **nullable, and the null *is* the inheritance flag** (**D-7**) |
| `ProductAttributeValue` *(0028's file)* | `variants(): BelongsToMany` | `@return BelongsToMany<ProductVariant, $this>` | the reverse of `values()`; what the per-value in-use count reads through (**D-10**) |
| `ProductAttributeValue` *(0028's file)* | 🟠 `type(): BelongsTo` — **ALREADY SHIPPED, no work** | `@return BelongsTo<ProductAttributeType, $this>` | **0031 OQ-3(d) needs no answer from this story.** 0028 shipped this relation named, typed, PHPDoc'd and with its foreign key passed explicitly. This row used to describe it as work; it is now a **verification item only** — confirm the method still exists and still eager-loads as `values.type` (the path 0031 **D-6** needs) and change nothing. Phase 2 defect 3 |
| `ProductVariant` | `label(): string` | — | Not a relation: the derived *"Talla M / Color azul marino"* string, an accessor over the eager-loaded pivot ordered by `(type.position, value.position)` (**D-9**). It reads `values.type`, which is why the relation above must exist and must be eager-loaded |

🔴 **`values()` is a read relation and must stay one.** **D-3**'s single-writer argument depends on it:
the pivot is written **only** by `CreateProductVariant`, inside its transaction, alongside the hash.
Do not add a public `syncValues()` / `attachValue()` / `detachValue()` surface, and do not reach for
`$variant->values()->sync(...)` from a component — the hash would not follow, and
`unique(product_id, combination_hash)` would start guarding a stale value (**R-B**). This is the same
reasoning `base-standards.md` gives for keeping the behaviour on `User::delete()` and every call site
on instances.

### D-18 — 🟠 MOVED to [0029b](0029b-product-variant-combination-generator-backend.md) (2026-09-04)

The cartesian combination generator — `GenerateProductVariantCombinations`, its summary-array return
shape, its skip/refuse outcome semantics, the savepoint transaction shape, the `MAX_COMBINATIONS`
batch cap, the iteration order and the seven things it deliberately does not do — was the cleanest of
the three cuts Phase 2's "Small" failure forced, and **all of D-18.1 through D-18.7 moved to 0029b
verbatim**, together with **OQ-19**–**OQ-21**, **R-O**–**R-Q**, **FP18**/**FP19**, its Gherkin
feature, its test file, its three `products.variants.generate.*` translation keys, the two
`attributeTypeIds` trait methods, the `attributeTypeIds` error-bag key, and the savepoint gap-lock
probe the Definition of Done had made an execution obligation.

**Why this cut and not another.** The generator is purely **additive on top of `CreateProductVariant`**
— it re-implements nothing (not the derivation, not the hash, not the collision check, not the pivot
write), touches no schema, adds no index, and shares no file with this story. Removing it removes one
action, one test file, eight Gherkin scenarios, three acceptance criteria, three open questions, three
risks and one probe from this story, and costs this story nothing: nothing here reads it, and
`CreateProductVariant`'s contract does not change to accommodate it. It is also the piece whose
addition on 2026-08-19 **reversed a scope fence** and was never re-weighed against **R-K** — which is
precisely the finding Phase 2 raised.

**What this story still owes 0029b**, so the dependency is one-directional and explicit: the three
single-variant actions, `DeriveVariantSku`, `HashVariantCombination`, both tables, and the
`ValidationException`-per-savepoint behaviour of `CreateProductVariant` that lets a per-row refusal
roll back only its own savepoint. 0029b runs strictly after this story reaches Phase 7.


### Scope fences: what this story must NOT do

- No Livewire component, route, Blade view, sidebar entry or browser test (**0031**).
- ~~No cartesian-product "generate all combinations" bulk builder unless **OQ-5** says otherwise.~~
  ~~**Reversed 2026-08-19** — the generator **is** in scope now.~~ 🟠 **Re-fenced 2026-09-04 by the
  three-way split**: the generator is **out of this story** and is
  **[0029b](0029b-product-variant-combination-generator-backend.md)**. It is not deferred or cancelled
  — it is a sibling story that ships on top of this one. The `product_product_attribute_type`
  **declaration table** is still out of scope in *all three* (OQ-5a's surviving half), and the
  generator's *UI* remains **0031**'s.
- 🟠 **No in-use delete guard against 0028's attribute types or values** — that is
  **[0029a](0029a-attribute-in-use-delete-guards-backend.md)**. This story ships the
  `restrictOnDelete()` FK that makes the guards necessary and tests the FK's own behaviour; it does
  **not** ship the message in front of it, the two count queries,
  `ProductAttributeType::variantUsageCount()`, or the wiring of 0028's `$deletingTypeUsageCount`
  placeholder.
- No attribute type/value CRUD (0028) at all, beyond the **rename**-branch SKU re-derivation cascade
  **D-4.6** puts in `SyncProductAttributeValues` — which is this story's, and is the one edit it makes
  to that file.
- No `product_variant_media` gallery, no variant `status`, no variant `name` column.
- No new permission module slug and no `RolePermissionSeeder` change.
- No `SoftDeletes` on `ProductVariant`, no `deleted_at`, no restore flow.
- **No database trigger** under any circumstance (**D-4** agreed point 4 — the app's own DB user
  cannot create one, **V-2**), and no single-table inheritance (agreed point 5).
- **No `skus` registry table** — closed by the PO's derived-SKU rule (**D-4**, 2026-08-18). This was
  **OQ-1** and is now a scope fence rather than an open choice.
- **No admin-typed variant SKU and no SKU override field** (**D-4.3**, **D-9**, **OQ-16**), and no
  second normalised SKU column.
- No SKU-safety validation added to 0028's attribute-value screens (**D-4.5**, case (b)).
- No i18n scaffolding (Epic 5).

## Files to create/modify

> 🔵 **2026-08-18.** The rows previously marked **(A)** — `create_skus_table`, `app/Models/Sku.php`,
> and the `Product` model/factory hook changes — are **removed**: OQ-1 resolved to a derived SKU
> (**D-4**), so no registry ships. One create is added in their place (`app/Actions/Products/DeriveVariantSku.php`),
> and `UpdateProduct`'s row grows the re-derivation cascade.

### Creates

| Path | What & why |
| --- | --- |
| `database/migrations/<ts>_create_product_variants_table.php` | **D-5**. `down()` is `Schema::dropIfExists('product_variants');` |
| `database/migrations/<ts+1>_create_product_variant_values_table.php` | **D-5**. Strictly later timestamp. Table name forced by **V-B** |
| `app/Models/ProductVariant.php` | `use HasFactory, HasUuids;`, `#[Fillable([...])]` **excluding both `combination_hash` and `sku`** (both server-derived — the same omission-as-guard rule `users.status` uses; **D-4.3**), `casts()` (`price` → `decimal:2`, `stock` → `integer`, `position` → `integer`), `product()`, `featuredImage()`, `values()` (read-only `BelongsToMany`, ordered), `displayFeaturedMediaId()`, `label()`. **No `SoftDeletes`**. **Every relation's exact signature and PHPDoc is in [D-17.2](#d-172--every-relation-named-with-its-return-type)** |
| `app/Actions/Products/HashVariantCombination.php` | The single `__invoke()` definition (**D-3**). A plain support class, not an action — it is a pure function with no dependencies and no side effects |
| `app/Actions/Products/DeriveVariantSku.php` | The single `__invoke()` / `segment()` definition and `MAX_LENGTH = 128` (**D-4.1**, **D-4.4**). Same shape and same reasoning as `HashVariantCombination` — a pure function, no dependencies, no side effects, **one** definition that `CreateProductVariant`, `UpdateProduct`'s cascade and 0028's value-rename cascade all call. A second copy of the formula anywhere is the defect this class exists to prevent |
| `app/Actions/Products/CreateProductVariant.php` | Owns the transaction, the read-back of ids **and value strings** (**V-10**), the ordered derivation, the combination check *then* the SKU check (**D-4.5**), the locking pre-check, the pivot write and the hash. Existing `app/Actions/Products/` subfolder (0024, 0028) |
| `app/Actions/Products/UpdateProductVariant.php` | `price`/`stock`/`featured_media_id`/`position` only — **never** the pivot, the hash, **or the SKU** (**D-13**, **D-4.3**). The SKU changes only through **D-4.6**'s cascades, which this action is not one of |
| `app/Actions/Products/DeleteProductVariant.php` | Thin today; exists as the single seam Epic 3's "a variant referenced by orders cannot be deleted" guard bolts onto — 0023 **D-10** / 0024's `DeleteProduct` reasoning |
| ~~`app/Actions/Products/GenerateProductVariantCombinations.php`~~ 🟠 **MOVED to [0029b](0029b-product-variant-combination-generator-backend.md), 2026-09-04.** *(row retained struck through so the cut is visible in the diff rather than silent)* | **Was, 2026-08-19 (D-18).** The cartesian generator: one outer transaction, one pre-read of the product's existing `combination_hash` values, then one `CreateProductVariant` call per new combination (its transaction becomes a savepoint, so a per-row refusal does not destroy the batch). Owns `MAX_COMBINATIONS = 200` (**D-18.5**), the empty-type refusal, the iteration order (**D-18.6**) and the summary array shape (**D-18.1**). **It re-implements nothing** — not the derivation, not the hash, not the collision check; a second copy of any of those is the defect **R-L** names |
| `app/Concerns/ProductVariantValidationRules.php` | `<Noun>ValidationRules` per [naming.md](../../../docs/conventions/naming.md#traits-and-their-methods). Flat, single-concern, `use`s no other trait. **Entity-prefixed leaf methods** where a name would collide — 0024's naming trap is live here, because a variant editor composing this alongside `ProductValidationRules` fatals on a duplicate method. **No `skuRules()`/`productSkuRules()` and no variant SKU rule at all** — the variant SKU is derived, so there is no input to validate (**D-4.3**); the product-side `productSkuRules()` stays in 0024's trait. **Written out in full in [D-16](#d-16--productvariantvalidationrules-written-out-in-full): five methods** — `variantCombinationRules()`, `variantCombinationValueRules()`, `variantPriceRules()`, `variantStockRules()`, `variantFeaturedMediaIdRules()`. 🟠 The two `attributeTypeIds` methods **appended to this same trait by [0029b](0029b-product-variant-combination-generator-backend.md)**, never a second trait. 🔴 **Every consumer validates the id array in TWO passes** — [D-16.1](#d-161----the-two-id-arrays-must-be-validated-in-two-passes-never-one-combined-rule-array) |
| `database/factories/ProductVariantFactory.php` | `product_id => Product::factory()` so a bare `->create()` stands alone. **The SKU must be derived, not faked**: default to `app(DeriveVariantSku::class)($product->sku, [$segment])` with a short unique `bothify()` segment, **never** `fake()->unique()->word()` (~1000-row `OverflowException`) and never a free-text SKU — a factory that writes an underived SKU makes **D-4.3**'s global consistency test unusable (**FP13**). States: `withCombination(array $valueIds)` (derives from the real values, in **D-4.2** order), `withOwnImage()`, `inheritingImage()`, `outOfStock()` |
| `tests/**` | Phase 3, `backend-qa` — see [Tests to perform](#tests-to-perform) |

### Modifies — including two other stories' **already-shipped** code

🟠 **2026-09-04: two rows removed to [0029a](0029a-attribute-in-use-delete-guards-backend.md)** (`DeleteProductAttributeType`, `ProductAttributeType`) and one narrowed to a single branch (`SyncProductAttributeValues`). One row is now a **verification-only** no-op (`ProductAttributeValue::type()`, Phase 2 defect 3), one had the wrong method name (`ProductValidationRules`, defect 1), and `AttributeTypes\Index` moved out too. **These files are shipped code in `done/`, not specs** — see the V-15/V-P correction under [Verified environment findings](#verified-environment-findings).

| Path | What & why |
| --- | --- |
| `app/Concerns/ProductValidationRules.php` **(0024's SHIPPED file)** | 🟠 **Method name corrected 2026-09-04 (Phase 2 defect 1): it is `productSkuRules(?string $productId = null)`, not `skuRules()`.** It gains a second uniqueness rule, `Rule::unique(ProductVariant::class, 'sku')` — the **model-class** form, matching the shipped body's own `Rule::unique(Product::class, 'sku')`, and placed **outside** the existing `$productId === null` ternary with **no** `->ignore()` on either branch. **No `?string $productVariantId` parameter is added**; the signature is unchanged. Still required after the derived-SKU amendment: an admin-typed **product** SKU is the only remaining way a human can claim a string in this namespace (collision case **(a)**). See the correction box at the end of **D-4.7** for the shipped body |
| `app/Actions/Products/CreateProduct.php` **(0024's file)** | Gains the locking pre-check across both tables, in the fixed lock order (**D-4.5**). Without it, "a product claiming a variant's derived SKU" is unguarded |
| `app/Actions/Products/UpdateProduct.php` **(0024's file)** | The same pre-check, **plus the re-derivation cascade** (**D-4.6**): a change to `products.sku` re-derives every one of that product's variants in the same transaction, re-checks each new value, and aborts the whole update on any collision. This is the single largest retrofit this story makes to another story's code |
| `app/Actions/Products/SyncProductAttributeValues.php` **(0028's SHIPPED file)** | Its **rename branch** must re-derive the SKU of every variant built on a renamed value (**D-4.6**), same transaction, all-or-nothing. 🔴 **This is now the ONLY edit this story makes to that file** — the delete-branch in-use guard moved to [0029a](0029a-attribute-in-use-delete-guards-backend.md). 🔴 **And the branch does not fire model events, which changes how the cascade must be written** — see [D-4.6.1](#d-461----the-rename-branch-is-a-query-builder-mass-update-so-the-cascade-cannot-be-hooked) |
| `app/Models/Product.php` **(0024's file)** | Gains one method: `variants(): HasMany`, ordered `position ASC, sku ASC` (**D-8**) |
| ~~`app/Actions/Products/DeleteProductAttributeType.php`~~ · ~~`SyncProductAttributeValues.php` (delete branch)~~ · ~~`app/Models/ProductAttributeType.php`~~ | 🟠 **All three MOVED to [0029a](0029a-attribute-in-use-delete-guards-backend.md), 2026-09-04** — the type-level in-use guard, the per-value in-use guard in the delete branch, and `variantUsageCount()`. Rows retained struck through so the cut is visible |
| `app/Models/ProductAttributeValue.php` **(0028's SHIPPED file)** | Gains **exactly one** method: `variants(): BelongsToMany` through the pivot. 🟠 **Corrected 2026-09-04 (Phase 2 defect 3):** this row also claimed the story would *"name 0028's unnamed value→type relation `type(): BelongsTo`"*. `type()` **already exists**, named, typed and PHPDoc'd, with its foreign key passed explicitly. Nothing to add — verify only |
| ~~`App\Livewire\Products\AttributeTypes\Index` (0028's file)~~ | 🟠 **MOVED to [0029a](0029a-attribute-in-use-delete-guards-backend.md), 2026-09-04** — `$deletingTypeUsageCount`'s real query belongs with the guard it renders for. This story touches **no** Livewire component at all, which restores the scope fence exactly |
| `lang/en/products.php`, `lang/es/products.php` | **Extend, never recreate** — 0024 creates this file (its **R-13** hand-off; 0028 was already amended the same way). New keys: `products.variants.duplicate_combination`; `products.variants.derived_sku_taken` (**must interpolate the derived `:sku` and name the conflicting record** — a derived SKU cannot be retyped, so a bare "already taken" leaves the administrator with no action, **D-4.5**); `products.variants.derived_sku_empty_segment` (naming the offending attribute value) and `products.variants.derived_sku_too_long` (**D-4.4**); `products.variants.parent_sku_change_collides` (**D-4.6**, naming the variant); 🟠 **`products.variants.value_in_use` / `type_in_use` moved to [0029a](0029a-attribute-in-use-delete-guards-backend.md)** and the three `products.variants.generate.*` keys to [0029b](0029b-product-variant-combination-generator-backend.md), 2026-09-04 — each key ships in the story that throws it, so no story adds a key nothing reads. Key-for-key identical in both locales |
| `tests/Unit/ArchitectureTest.php` | One `expect()` **per namespace, never `expect([...])`** — that form is disjunctive and this repo has shipped one vacuous arch rule that way already (0024 **V-7**) |

### Explicitly **not** touched

`database/seeders/RolePermissionSeeder.php` (**D-12** — no new permission string) · `routes/web.php` ·
**`app/Livewire/**` (nothing at all, since `AttributeTypes\Index` moved to 0029a)** ·
`app/Policies/ProductPolicy.php` (**D-12.1** reuses its existing `update` ability unchanged; no policy
edit) · `resources/views/**` · `tests/Browser/**` · `docs/**` (Phase 6) · anything belonging to 0026
(sales regions), 0027 or 0031 (UI) · **anything belonging to 0029a or 0029b**.

## Tests to perform

Backend only — this story ships no screen. `tests/Unit/` gets **no** database trait in this repo
(verified at [`tests/Pest.php`](../../../tests/Pest.php), which binds `RefreshDatabase` to `Feature` and
`Browser` only), so anything needing a row is a Feature test even when integration-shaped. Do **not**
create `tests/Integration/`. Scaffold with `php artisan make:test --pest Products/CreateProductVariantTest`.

**Unit — `tests/Unit/Actions/Products/HashVariantCombinationTest.php`** (no DB)
- [ ] `__invoke()` is **order-independent**: the same id set in three different orders yields one hash.
- [ ] `__invoke()` is **duplicate-insensitive**: `[a, b, b]` and `[a, b]` yield the same hash.
- [ ] `__invoke()` **distinguishes** a subset from a superset: `[a]` ≠ `[a, b]`. This is the assertion that
      catches a "sum the ids" or "XOR the ids" implementation, both of which pass the first two.
- [ ] `__invoke()` returns 64 lowercase hex characters, and is **stable across calls** (no salt, no
      randomness) — the property that makes it safe to store.

**Feature — `tests/Feature/Models/ProductVariantTest.php`**
- [ ] A factory-created variant's `id` is a UUID **v7** string (`Str::isUuid($id, 7)`).
- [ ] Column types on round-trip: `price` is a **`string`** (`toBeString()` *and* `toBe('19.99')`),
      `stock` an `int`, `position` an `int`. 0024's **R-4** inherited — a value-only assertion passes
      against either type and lets the `decimal:2` drift ship.
- [ ] `#[Fillable]` contains exactly the intended set and **excludes both `combination_hash` and
      `sku`** — the two server-derived columns (**D-4.3**).
- [ ] The model does **not** use `SoftDeletes` — a regression guard on **D-6**, because adding it
      later silently changes `Rule::unique()` and both in-use counts.
- [ ] `values()` returns the combination in a deterministic order, asserted as an **exact array**.

**Feature — `tests/Feature/Products/CreateProductVariantTest.php`**
- [ ] Creating a variant with a full combination persists one row, exactly N pivot rows bound to it,
      and every column round-trips.
- [ ] The persisted `combination_hash` equals `app(HashVariantCombination::class)()` of the pivot's real ids —
      the **drift consistency test** from **D-3**, which goes red the moment a second writer appears.
- [ ] `position` is assigned `MAX + 1` scoped to the product, and two products number independently.
- [ ] Dataset of invalid inputs, each throwing on the named key and writing **zero** rows *and zero
      pivot rows*: missing product, unknown product, empty attribute-value list, negative stock,
      non-numeric price, three-decimal price, unknown attribute-value id, malformed attribute-value
      id. **No "blank SKU" / "malformed SKU" rows** — there is no SKU input to malform (**D-4.3**);
      the SKU's own failure modes live in `ProductVariantSkuDerivationTest`.
- [ ] A rejected create leaves **no orphan pivot rows** — the partial-write case. Asserted separately
      from the row count, because an implementation that inserts the variant, then the pivot, then
      discovers the duplicate, passes a row-count-only test on the *variant* table.

**Feature — `tests/Feature/Products/ProductVariantCombinationTest.php`** — the duplicate rule
- [ ] The same combination twice on one product throws `ValidationException` on `combination` — **not**
      `UniqueConstraintViolationException`, **not** a 500 — and the product still holds exactly one.
- [ ] **The reordered duplicate**: `{Size 40, Color Black}` then `{Color Black, Size 40}` is refused.
      This is the case a naive `implode()` without a sort passes on the first test and fails here.
- [ ] **The subset is NOT a duplicate**: with `{Size 40, Color Black}` existing, `{Size 40}` is
      accepted as a distinct combination. This is the classic relational-division bug — an
      implementation that asks "does an existing variant contain all my values?" wrongly rejects it.
- [ ] **The superset is NOT a duplicate**: with `{Size 40}` existing, `{Size 40, Color Black}` is
      accepted. The mirror image, and it fails against a different wrong implementation than the
      subset case, so both are needed.
- [ ] The same combination **on a different product** is accepted — what pins the unique as
      `(product_id, combination_hash)` rather than `combination_hash` alone.
- [ ] **The race**: register a `ProductVariant::creating` hook inside the test that inserts the
      colliding combination, so it lands between the check and the insert (0024's established
      technique). The outcome must be a clean `ValidationException`, never a 500, and the product must
      end with exactly one such variant.
- [ ] A duplicate **SKU** error is not reported as a duplicate **combination** — both raise `23000` on
      the same table, and mislabelling is **R-F**.

**Feature — `tests/Feature/Products/ProductVariantImageInheritanceTest.php`**
- [ ] A variant created with no image persists `featured_media_id` as **literally NULL**
      (`assertDatabaseHas([... 'featured_media_id' => null])`). This is the storage-layer proof that
      no copy happened, and it is the only assertion that distinguishes the two implementations
      before any resolution occurs.
- [ ] An inheriting variant resolves to the parent's featured image.
- [ ] **The discriminating test (FP2)**: change the parent's featured image to a *different* media
      row, then re-resolve — the variant must now report the **new** one. A copy-at-creation
      implementation returns the old one and fails here, while passing every other test in this file.
- [ ] A variant with its own image resolves to its own.
- [ ] Changing the parent's featured image leaves a variant with its own image **unchanged** — proves
      the fallback does not override an explicit choice.
- [ ] A variant whose parent has **no** featured image either resolves to `null` cleanly, not an error.
- [ ] The list does not N+1 as the variant count grows, with a throwaway warm-up call first (copy the
      design at `tests/Feature/Users/IndexTest.php:218-246`).

**Unit — `tests/Unit/Actions/Products/DeriveVariantSkuTest.php`** (no DB) — the formula itself

- [ ] The PO's four worked examples, as a dataset asserting the **literal** strings: `0001` + `M` →
      `0001-M`; `0001` + `S` → `0001-S`; `0002` + `azul marino` → `0002-azul-marino`; `0002` +
      `azul marino` + `L` → `0002-azul-marino-L`. These are the acceptance criterion in executable
      form and must be asserted exactly, never with `toContain`.
- [ ] **Casing is preserved**, both directions: `L` stays `L` and `azul marino` stays lowercase. A
      single assertion on an all-lowercase value cannot fail against an implementation that
      upper-cases, and vice versa — **both** are needed (**FP14**).
- [ ] `__invoke()` is **order-sensitive** — `[Color, Talla]` and `[Talla, Color]` produce *different*
      strings. This is the assertion that proves the ordering rule is load-bearing, and it is the
      exact opposite of `app(HashVariantCombination::class)()`'s order-independence test. Written next to a
      comment saying so, because the two look like a contradiction.
- [ ] `segment()` edge cases as a dataset: a whitespace **run** collapses to one hyphen
      (`"azul  marino"` → `azul-marino`, **not** `azul--marino`); leading/trailing whitespace is
      trimmed; `Marrón` → `Marron`; a character outside the safe set is stripped; a value that
      reduces to `''` is surfaced as such so the caller can refuse it.
- [ ] `__invoke()` is **pure and stable across calls** — the property that makes it safe to store.

**Feature — `tests/Feature/Products/ProductVariantSkuDerivationTest.php`** — the derivation in situ

- [ ] Creating a single-attribute variant persists exactly the derived SKU, asserted against the
      literal string in the database (`assertDatabaseHas`), not against a re-call of `__invoke()` —
      re-calling the function under test makes the assertion tautological (**FP15**).
- [ ] **A submitted `sku` key is ignored**, and the derived value is stored instead. This is the only
      test that proves `sku` really is outside `#[Fillable]`; without it, a mass-assignable `sku`
      passes every other test in this file.
- [ ] **Submission order does not affect the SKU**: the same two values submitted in both orders
      produce the identical string. The discriminating test for **D-4.2** — an implementation that
      derives from payload order passes every single-attribute test.
- [ ] **The order is `product_attribute_types.position`**, proven by *changing* it: create the
      variant, assert `0002-azul-marino-L`; then reorder the types and create the equivalent variant
      on another product, asserting `…-L-azul-marino`. Asserting one fixed order once cannot
      distinguish "ordered by type position" from "ordered by type name" or "ordered by value id"
      when the fixture happens to agree (**FP16**) — seed the fixture so **name order, id order and
      position order deliberately disagree**.
- [ ] Two values of the **same type** (the **DIS-1** shape) derive deterministically, ordered by
      `(value.position, value.id)` — the case that is undefined without the tail of the sort key.
- [ ] A value that reduces to an empty segment is refused with a `ValidationException` naming that
      value, and **zero rows and zero pivot rows** are written.
- [ ] A derivation exceeding `DeriveVariantSku::MAX_LENGTH` is refused cleanly, not truncated and not a
      raw `1406`/`22001`.

**Feature — `tests/Feature/Products/ProductVariantSkuUniquenessTest.php`** — its own file; the layer
distinction is the whole point. Rewritten 2026-08-18 for derived SKUs: the four Examples rows of the
old Scenario Outline are replaced by **D-4.5**'s three collision cases, because a variant SKU can no
longer be chosen to collide — it has to be *arranged* to collide.
- [ ] **Case (a) — a derived variant SKU colliding with an existing PRODUCT's typed SKU is refused.**
      Arrange a product literally named `0001-M`, then create the Talla `M` variant of product
      `0001`. This one **can only pass for the right reason**: no index spans the two tables, so
      nothing but the application check can produce the refusal. It is still the strongest test in
      the story.
- [ ] **Case (a), reverse — a product SKU colliding with an already-derived VARIANT SKU is refused**,
      and it is the only test that proves 0024's actions were actually retrofitted (**R-E**).
- [ ] **Case (b) — two attribute values reducing to the same segment** (`azul marino` and
      `azul-marino`) on the same product: the second is refused. Deliberately *not* prevented in 0028
      (**D-4.5**), so this test is the only place that behaviour is pinned.
- [ ] **Case (c) — separator ambiguity**: product `0001-M` with value `L`, and product `0001` with
      value `M-L`, both derive `0001-M-L`; the second is refused. Non-obvious enough that without a
      test nobody would believe it can happen.
- [ ] The refusal **names the conflicting record**, not just the SKU — assert the message payload,
      since **D-4.5** makes this the difference between an actionable error and a dead end.
- [ ] A duplicate **combination** is reported as a duplicate combination, **not** as a duplicate SKU,
      even though both are true (**D-4.5** ordering). Assert the message key.
- [ ] **Case-differing SKU — three assertions, because only two can fail** (0024's pattern):
      (a) the Color `azul marino` variant of product `0002` stores exactly `0002-azul-marino`, in
      that casing; (b) creating it when a product `0002-AZUL-MARINO` exists is refused; (c) the
      derivation in isolation returns the lowercase form. **(b) alone cannot fail** on the engine the
      suite runs on — `utf8mb4_unicode_ci` is case-insensitive, so the index refuses it regardless of
      what the app does. (a) and (c) are what pin the **casing rule** (**OQ-14**) rather than the
      collation.
- [ ] **Whitespace-differing values**, same three-part shape: `"azul  marino"` (double space) stores
      `0002-azul-marino` and collides with the single-space value's variant.
- [ ] **Re-derivation on a parent SKU change** (**D-4.6**): renaming product `0001` to `0009` rewrites
      `0001-M`/`0001-S` to `0009-M`/`0009-S`, asserted as exact strings on **every** variant — a
      cascade that updates only the first row passes a single-variant test.
- [ ] **Re-derivation is all-or-nothing**: a parent SKU change that would collide for *one* variant
      aborts the whole update, and the product **and every variant** still hold their old SKUs.
      Assert the unchanged rows, not only the exception (**FP5**'s shape).
- [ ] **Re-derivation on an attribute-value rename** (**D-4.6**): renaming the value `azul marino` to
      `azul` rewrites every variant built on it, on **every** product that uses it — not just one.
- [ ] **The global consistency test** (**D-4.3**), the analogue of **D-3**'s: create N variants across
      several products through the action, then assert every stored `sku` equals
      `app(DeriveVariantSku::class)()` of its *current* parent SKU and *current* ordered value strings. Run it
      **again after** a parent-SKU rename and after a value rename — that is what makes it a
      re-derivation regression net rather than a creation test.
- [ ] **The race, both directions**: a `Product::creating` hook inserting a colliding variant, and a
      `ProductVariant::creating` hook inserting a colliding product. Both must surface as a clean
      `ValidationException` on `sku`, never a 500 — the assertion that the **V-H** gap lock is
      actually being taken.

🟠 **`tests/Feature/Products/GenerateProductVariantCombinationsTest.php` (fifteen cases) moved to
[0029b](0029b-product-variant-combination-generator-backend.md) on 2026-09-04**, with the generator.


**Feature — `tests/Feature/Products/ProductVariantReferentialIntegrityTest.php`**

Driven by raw `DB::table(...)->delete()` where no application path exists yet — the same deliberate,
narrow exception to [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md)'s
"database guarantees" rule that 0024 argued for its media FKs. These are the **only** executable
proof of 0028's **D4** mandate in the whole codebase.
- [ ] Deleting an attribute **value** in use by a variant throws `QueryException` and the value
      survives (the `restrictOnDelete` mandate).
- [ ] Deleting an attribute **type** whose values are in use aborts, and the type, its values and the
      variants all survive — the InnoDB cascade-meets-RESTRICT trap 0028's **D7** flagged.
- [ ] Deleting a **product** removes its variants **and** their pivot rows, and leaves the
      `product_attribute_values` rows untouched — the three-level chain from **D-10**.
- [ ] Deleting a `media` row referenced as a variant's own featured image is refused, and the media
      row survives (0024 **D-9**'s fourth reference source).
- [ ] The complement, so the restriction is not over-broad: deleting a variant succeeds, takes its own
      pivot rows with it, and leaves the media and attribute-value rows intact.

🟠 **`tests/Feature/Products/DeleteProductAttributeTypeTest.php` (six cases) moved to
[0029a](0029a-attribute-in-use-delete-guards-backend.md) on 2026-09-04**, with the guards it tests.


**Feature — `tests/Feature/Products/ProductVariantAuthorizationTest.php`** 🟠 *(new 2026-09-04, **D-12.1**)*

The file **D-12.1** makes possible — this story now ships an enforcement path, so it must be tested
here rather than handed to 0031. Modelled on `tests/Feature/Products/ProductAuthorizationTest.php`.

- [ ] Each of the three actions, called directly with an actor holding **no** `products.edit`, throws
      `AuthorizationException` (**not** a bare `Exception` — **FP6**) **and writes nothing**: assert
      `assertDatabaseMissing`/an unchanged row beside the throw, never the throw alone (**FP5**).
- [ ] Each action **succeeds** for an actor holding `products.edit` — the control that stops a
      refuse-everything implementation passing the deny tests trivially.
- [ ] A `Super Admin` holding **zero** permission rows passes all three, via `Gate::before`.
- [ ] The gate is asked against the **parent product**, proven by a target-swap: an actor allowed on
      product A is still refused for a variant of product B. A policy with no target-dependent branch
      makes this pass trivially today — the test exists so it *starts* failing the day one is added.
- [ ] **Every refusal is logged** through `LogRefusedPrivilegedAttempt` with
      `target_type: 'product'` and `target_id` = the **parent product's** id, asserted against the
      context array rather than a rendered message string, matching
      `tests/Feature/Products/RefusalLoggingTest.php`'s shape.
- [ ] 🔴 **The gate runs before validation and before any transaction**: call each action with an
      actor who is *both* unauthorized *and* passing structurally invalid input (an empty
      `attributeValueIds`, a negative stock), and assert the **`AuthorizationException`**, not a
      `ValidationException`. An implementation that validates first leaks the shape of the input rules
      to an actor with no permission at all, and this is the only assertion that can fail against it.
- [ ] The actions are resolved with `app(...)`, never `new` — a constructor dependency now exists
      (**D-17.1**), and `new CreateProductVariant` would not even construct.

**Feature — `tests/Feature/Products/ProductVariantValidationBoundsTest.php`** 🟠 *(new 2026-09-04, **D-16.1**)*

- [ ] 🔴 **An oversized `attributeValueIds` submission issues ZERO `product_attribute_values`
      existence queries.** Count with `DB::listen()` (one callback registered **once**, not per loop
      iteration — the measurement bug [array-validation-bounds.md](../../../docs/security/array-validation-bounds.md)
      records) after a throwaway warm-up call (**FP7**), submitting 2,000 ids against `max:10`. The
      exact regression test `tests/Feature/Products/EditorTest.php` already ships for `regionIds`.
- [ ] The same submission returns **one** error message, not 2,001 — the Livewire error-bag bloat
      half of the same finding.
- [ ] 🔴 **The D-3 read-back's `IN (…)` binding list is bounded, asserted on the BINDINGS and not on
      the query count.** Both a bounded and an unbounded implementation issue exactly one read-back
      query; only the binding count moves. `expect(count($query->bindings))->toBeLessThanOrEqual(10)`
      inside the `DB::listen()` closure is the only assertion that can fail here.
- [ ] A legitimate 3-id submission still validates and still creates — the control that stops a
      reject-everything bound passing the two tests above.

**Authorization — `tests/Feature/Policies/ProductPolicyTest.php`** (extends 0024's file)
- [ ] Variant operations authorize against the **parent product** (**D-12**): both an allow and a deny
      per ability, per what-not-to-test's authorization rule.
- [ ] A `Super Admin` holding zero permission rows passes via `Gate::before`.
- [ ] `Gate::forUser($denied)->authorize(...)` **throws** `AuthorizationException` — not merely
      `allows()` returning false.
- [ ] Permission-cache staleness: warm the cache by asserting `true`, revoke via a role change,
      re-assert on a **freshly resolved** user, with **no** `forgetCachedPermissions()` between Act
      and Assert.

### Assertions that would be false passes if written naively

**FP1 — duplicate-combination rejection asserted by variant row count.** `toHaveCount(1)` passes
identically for "correctly refused" and for "the variant row was rolled back but N orphan pivot rows
were left behind". Assert the `ValidationException` on the named key **and** the pivot row count.

**FP2 — image inheritance asserted without ever changing the parent's image.** Create product with
image M1, create variant with no image, assert the variant resolves to M1 — this passes against a
**read-time resolver** and against a **copy-at-creation** implementation equally, so it cannot detect
the one thing **D-7** decides. The discriminating assertion is: change the parent to M2, re-resolve,
expect M2. Pair it with the `featured_media_id IS NULL` database assertion.

**FP3 — cross-table SKU rejection that a single-table index would also produce.** A
variant-vs-variant collision is refused by `product_variants.sku`'s own `UNIQUE` whether or not any
cross-table rule exists. Only the **product↔variant** cases can fail for the right reason; write all
three of **D-4.5**'s collision cases and both directions of case (a).

**FP4 — a case-only SKU rejection asserted by row count.** `utf8mb4_unicode_ci` is case-insensitive
*and* PAD SPACE, so the index refuses it on the collation alone. Assert the **exact stored string**
and the derivation in isolation, per 0024's three-assertion pattern. Post-amendment this is
*sharper*, not softer: the stored-string assertion is now the only thing pinning the PO's
casing-preserved rule against 0024's `Str::upper()` instinct.

**FP5 — a deny test asserting only that an exception was thrown.** An `AuthorizationException`
raised *after* the write still throws. Pair every deny with `assertDatabaseMissing` or an
unchanged-row assertion; the absent side effect is the proof.

**FP6 — `->throws(Exception::class)` in a permission test.** `PermissionDoesNotExist` from an
unseeded catalog satisfies it, so a missing `beforeEach` seed reads as a passing authorization test.
Always name the specific exception class.

**FP7 — the N+1 test without a warm-up call.** The first `Gate::authorize()` in a process cold-loads
all permission data, a one-time cost miscounted into the small-dataset measurement.

**FP8 — ordering asserted with `toContain` or against a sorted copy.** A set assertion wearing an
ordering assertion's name. Use `->toBe([...])` on the exact array.

**FP9 — the in-use count asserted without a decoy.** With no variants on any *other* attribute value,
a global `count()` and a correctly scoped one return the same number, so the test passes against the
bug it exists to catch.

**FP10 — claiming any backend test as coverage for the variant builder's DOM behaviour.**
`Livewire::test()->set()` bypasses the DOM entirely. That gap belongs to **0031**'s `frontend-qa` and
must not be marked closed here.

**FP11 — every duplicate-combination test written from the UI's perspective (V-10).** A UI never
varies the case of a UUID, so no naturally-written test submits `V-40` where the database holds
`v-40` — and that is precisely the payload that passes `Rule::exists()` (case-insensitive under
`utf8mb4_unicode_ci`) while hashing differently and slipping past the unique index. The whole
duplicate-combination suite can be green against a hash-the-client's-input implementation. **One
test must submit deliberately case-varied ids and assert the combination is still refused.**

~~**FP12 — the entire SKU-uniqueness suite going vacuously green under Option A (T-4).**~~
**Superseded 2026-08-18** along with the registry it describes (**D-4**). Retained so a reader of the
superseded Option A section does not think its `T-4` risk went unanswered. Its successor is **FP13**,
which is the same *shape* of trap one layer over.

**FP13 — a factory that writes an underived SKU makes the consistency test unfalsifiable.** If
`ProductVariantFactory` sets `sku` to a `bothify()` string rather than deriving it, **D-4.3**'s
global consistency assertion either has to exclude factory rows (in which case it never runs against
most of the suite) or fails everywhere for a reason that has nothing to do with the code under test —
and the usual fix for the latter is to weaken the assertion. Derive in the factory, then assert the
invariant across **every** `product_variants` row with no exclusions.

**FP14 — a casing assertion on a value that is already all one case.** Asserting `0001-M` proves
nothing about case preservation, because `Str::upper()` returns `0001-M` too. Every casing test needs
a **mixed-case or lowercase** value (`azul marino`, `L`) and must assert both a lowercase segment
survives *and* an uppercase one survives, in the same file.

**FP15 — asserting the stored SKU by re-calling `__invoke()`.**
`expect($variant->sku)->toBe(app(DeriveVariantSku::class)(...))` is tautological against any bug that lives *inside* `__invoke()` — it passes even if the formula is
wrong, because both sides are wrong identically. The Feature tests assert **literal strings**; only
the Unit test may exercise `__invoke()` against expectations written by hand. (The one deliberate
exception is **D-4.3**'s global consistency test, whose whole purpose is comparing storage against
the function — and which is therefore *not* a test of the formula.)

**FP16 — the ordering test whose fixture makes every candidate ordering agree.** With attribute types
seeded as Color (position 0, created first) and Talla (position 1, created second), ordering by
position, by name, by creation and by id all yield the same SKU, so the test passes against three
wrong implementations. **The fixture must make them disagree** — e.g. types created Talla-then-Color
but positioned Color-then-Talla, with names chosen so alphabetical order differs again — and the
strongest form additionally *reorders* the types mid-test and observes the derived SKU follow.

**FP17 🟣 — every refusal test asserting `ValidationException::class` and nothing else.** 🔴 New with
**D-15**, and it is the trap that makes the whole error-bag contract untested. Four of this story's
refusals throw the *same* exception class, and three of them share the *same* bag key (`sku`), so
`->throws(ValidationException::class)` passes against an implementation that throws the right
exception on the **wrong key** with the **wrong message** — which, per 0031 **D-8**, is exactly the bug
that renders a refusal invisible on screen. **Every refusal test must assert the bag key**, and the
three `sku` refusals must additionally assert the **translation key**, since the bag key alone cannot
tell them apart. **R-F**'s combination-vs-SKU mislabelling is the same trap with the stakes named.

🟠 **FP18 and FP19 moved to [0029b](0029b-product-variant-combination-generator-backend.md) on
2026-09-04** — both are generator-specific false passes (asserting only the created count; asserting
only that no duplicate was created). **FP20** and **FP21** below are new with this pass.

**FP20 🟠 — an authorization deny test that asserts the exception and nothing else.** New with
**D-12.1**, and it is **FP5** applied to this story's own new enforcement path: an
`AuthorizationException` raised *after* a write still throws. Every deny must carry
`assertDatabaseMissing` or an unchanged-row assertion beside it. The sharper version, which only this
story's ordering makes available: a deny test whose input is *also* invalid must assert the
**authorization** exception, or a validate-then-authorize implementation passes it.

**FP21 🟠 — a validation-bound test that counts queries instead of bindings.** New with **D-16.1**.
The **D-3** read-back is one `whereIn` whatever the array size, so a query-count assertion is
satisfied identically by a bounded and an unbounded implementation — the exact warning
[array-validation-bounds.md](../../../docs/security/array-validation-bounds.md) records against story
0027's own shipped test. Assert the **binding count**, inside the same `DB::listen()` closure.

### Test-arrangement notes for Phase 3

- `beforeEach` in authorization files: `app(PermissionRegistrar::class)->forgetCachedPermissions();`
  **then** `$this->seed(RolePermissionSeeder::class);` — both halves load-bearing (the seed because
  `can('products.view')` against an unseeded catalog throws `PermissionDoesNotExist`; the flush
  because `phpunit.xml` sets `CACHE_STORE=array`, which is per-**process**, and `RefreshDatabase`
  rolls the DB back without clearing it). **Never** flush between Act and Assert.
- Do **not** invoke the full `DatabaseSeeder` to arrange — it creates a `test@example.com` fixture
  user under `local`/`testing`.
- **Pin any config a test depends on**, including setting it to `null` when "unset" is the assumed
  state (the task-0003 lesson in [errors-log.md](../../../docs/errors-log.md)).
- `ProductVariantFactory` supplies every required column, but **every required-ness / uniqueness /
  boundary test passes its input explicitly to the action** — never as a factory override, or the
  factory's defaults mask the rule under test.
- `fake()->unique()` is a per-instance guard, **not** a database one; a test needing a guaranteed
  collision passes the literal SKU.
- **A variant SKU collision cannot be arranged by passing a SKU** — there is no such input
  (**D-4.3**). It is arranged by choosing the *fixture*: a product literally named `0001-M`, two
  attribute values that reduce to one segment, or two products whose SKU prefixes overlap. Write the
  intended collision case (a/b/c per **D-4.5**) in the test name, or the next reader cannot tell
  which one a fixture is constructing.
- Use `test()`, not `it()`; third person; no "should".

### Explicitly not tested

Per [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md): `HasUuids` itself; Eloquent
timestamps; `Rule::unique`/`Rule::exists`'s generated SQL; MySQL's own decimal arithmetic; migration
`up()`/`down()` mechanics (`RefreshDatabase` proves every migration runs, and `down()` symmetry is a
code-review concern); the `.webp`/`.avif` pipeline (0019); attribute type/value CRUD itself (0028);
product core CRUD (0024); any builder markup, badge or screen (0031). The referential-integrity tests
above are argued exceptions, not oversights.

## Expected outcome

A `product_variants` table exists with a UUID v7 primary key, a **derived** globally-unique `sku`, a
required `decimal(10,2)` price, signed stock, an optional own featured image and an ordered position,
plus a `product_variant_values` pivot recording each variant's attribute-value combination under a
`restrictOnDelete()` FK. A catalog administrator's create / update / delete operations are available
as invokable domain actions with shared, trait-held validation.

A variant's SKU is **computed, never typed**: the parent product's SKU, then each attribute value
with its spaces turned into hyphens, appended in the attribute types' own `position` order — so
`0001` + Talla "M" is `0001-M`, and `0002` + Color "azul marino" + Talla "L" is `0002-azul-marino-L`,
whichever order the administrator happened to enter them in. The value is stored, and it follows its
inputs: renaming a product's SKU, or an attribute value, re-derives every variant built on it in the
same transaction, all-or-nothing.

Two combinations of attribute values can never repeat on one product — enforced by an application
check and made a database invariant by `unique(product_id, combination_hash)` — while the *same*
combination remains legal on a different product, and a subset or superset is correctly treated as a
distinct combination. A variant's SKU is unique against **every other product's SKU and every other
variant's SKU**, in both directions — enforced by an existence check across both tables under a
locking read, with each table keeping its own unique index as the last word. Because the SKU is
derived, the only ways a collision can arise are the three narrow cases **D-4.5** enumerates, and
each is refused with a message naming what it collided with. A variant with no featured image of its own
resolves to its parent's **at read time**, so changing the product's image changes what its
inheriting variants show, while a variant with its own image is untouched.

🟠 **Two paragraphs moved out of this section on 2026-09-04**, with the split. The cartesian
generator's whole outcome — *"8 variants created, 2 already existed"*, the skip-without-touching rule,
the by-name refusal, the batch cap — is now
**[0029b](0029b-product-variant-combination-generator-backend.md)**'s expected outcome, and the two
attribute in-use blocks 0028 designed seams for are now
**[0029a](0029a-attribute-in-use-delete-guards-backend.md)**'s. What this story delivers toward both:
the pivot table and its `restrictOnDelete()` FK (which is what makes 0029a's guards necessary and its
counts possible), and `CreateProductVariant` with its per-call transaction (which is what lets 0029b
run a batch of them as savepoints).

🟠 **And one thing this story now delivers that it previously handed off**: variant CRUD is
**enforced**, not merely modelled. Each of the three actions authorizes `update` on the parent product
as its own first statement and logs the refusal, so an Artisan command, a queued job or a future REST
controller inherits the same refusal the builder screen will get — rather than 0031 being the only
thing standing between an actor and the catalog.

Nothing is user-visible yet: the builder that consumes all of this is story **0031**.

## Acceptance criteria
- [ ] `product_variants` exists with `id` (UUID v7 PK), `product_id` (NOT NULL FK, `cascadeOnDelete`),
      `combination_hash`, `sku` (`string(128)`, unique), `price`, `stock`, `featured_media_id`
      (nullable FK into `media`, `restrictOnDelete`), `position`, `created_at`, `updated_at` — and
      nothing else. **No `skus` registry table.**
- [ ] `product_variant_values` exists with `product_variant_id` (`cascadeOnDelete`),
      `product_attribute_value_id` (**`restrictOnDelete`**, per 0028 D4) and a composite primary key,
      and **neither FK column carries a redundant hand-written index**.
- [ ] `App\Models\ProductVariant` uses `HasUuids`, does **not** use `SoftDeletes`, omits **both**
      `combination_hash` and `sku` from `#[Fillable]`, and casts `price` to `decimal:2`.
- [ ] A variant is created as a combination of attribute values, with a derived SKU and its own price
      and stock.
- [ ] **A variant's SKU is derived, never typed**: `{product.sku}` followed by each attribute value
      with whitespace runs replaced by a single hyphen, casing preserved, appended in
      `(type.position, type.id, value.position, value.id)` order — verified against the literal
      strings `0001-M`, `0001-S`, `0002-azul-marino` and `0002-azul-marino-L`. A submitted `sku` key
      is ignored, and the order the values are submitted in does not change the result.
- [ ] The SKU is **re-derived when its inputs change** — a parent product's SKU change or an attribute
      value rename rewrites every affected variant in the same transaction, and any resulting
      collision aborts the whole operation leaving every row unchanged.
- [ ] Every stored `sku` equals the derivation of its current inputs, proven by a global consistency
      test that also runs after a parent-SKU rename and after a value rename.
- [ ] **A duplicate combination on the same product is refused** — including when submitted in a
      different order — while the same combination on a **different** product is accepted, and a
      subset or superset of an existing combination is accepted as distinct.
- [ ] The refusal is a `ValidationException` on the combination key, never an unhandled
      `UniqueConstraintViolationException`, and a rejected create leaves **no orphan pivot rows**.
- [ ] `combination_hash` always equals the hash of the variant's real pivot rows, proven by a
      consistency test, and is never written by the update path.
- [ ] **A variant's SKU is unique against both `products.sku` and `product_variants.sku`**, in **both**
      directions (a derived variant SKU may not equal any product's SKU; a product may not take a
      SKU some variant already derived), enforced by an existence check across both tables under a
      locking read in a fixed order, plus the second `Rule::unique('product_variants', 'sku')` in
      0024's shared `productSkuRules()`. All three of **D-4.5**'s collision cases are refused, each with a
      message naming the conflicting record.
- [ ] Updating a variant's price, stock, image or position leaves its SKU untouched.
- [ ] 🟣 **Every refusal throws on the bag key [D-15](#d-15--error-bag-keys-the-exact-key-every-refusal-throws-on)
      names** — `attributeValueIds`, `combination`, `sku`, `price`, `stock`, `featuredMediaId`,
      `attributeTypeIds` — with all four derived-SKU refusals sharing `sku` and distinguished only by
      their translation key, and every refusal test asserting the key rather than the exception class
      alone.
- [ ] 🟠 **`ProductVariantValidationRules` ships the five methods
      [D-16](#d-16--productvariantvalidationrules-written-out-in-full) specifies**, all
      entity-prefixed, `use`ing no other trait, and **without any SKU rule** — the two
      `attributeTypeIds` methods are appended to the same trait by **0029b**, not shipped here.
- [ ] 🔴 **Both id arrays are validated in two sequential `Validator::make(...)->validate()`
      calls, never one combined rule array** ([D-16.1](#d-161----the-two-id-arrays-must-be-validated-in-two-passes-never-one-combined-rule-array)),
      proven by a test asserting **zero** `product_attribute_values` existence queries for an
      oversized submission and by a **binding-count** assertion on the D-3 read-back — never a
      query-count one (**FP21**).
- [ ] 🟠 **The three actions carry the exact signatures
      [D-17.1](#d-171--the-four-action-signatures) fixes** — named scalars rather than an array bag,
      `string $price`, a `ProductVariant` returned from both write actions, and
      `LogRefusedPrivilegedAttempt` **constructor**-injected rather than widening `__invoke()` — and
      every relation [D-17.2](#d-172--every-relation-named-with-its-return-type) names exists with its
      documented return type, with `values()` exposing **no** attach/sync surface.
      `ProductAttributeValue::type()` is **verified as already shipped**, not re-created.
- [ ] 🟠 **Each of `CreateProductVariant`, `UpdateProductVariant` and `DeleteProductVariant`
      authorizes `update` on the parent product as its own first statement**
      ([D-12.1](#d-121----every-variant-action-self-authorizes-decided-2026-09-04-at-phase-2-this-was-the-deferral-the-review-refused)),
      through `LogRefusedPrivilegedAttempt` with `targetType: 'product'`, **before** validation and
      **before** any transaction — with an allow test, a deny test asserting the absent side effect
      (**FP20**), a `Super Admin` bypass test and a refusal-logging assertion for each. No new
      permission string, no `ProductVariantPolicy`, no `ProductPolicy` edit.
🟠 *(Three cartesian-generation acceptance criteria moved to*
*[0029b](0029b-product-variant-combination-generator-backend.md) on 2026-09-04.)*

- [ ] **A variant with no own featured image resolves to the parent's at read time** — proven by a test
      that changes the parent's image and observes the variant follow it — while
      `featured_media_id` stays NULL in the database, and a variant with its own image is unaffected.
- [ ] Deleting a product removes its variants and their pivot rows, and the **database FK refuses
      independently** when an attribute value or type in use by a variant is deleted — driven by raw
      `DB::table(...)->delete()`, since no application path exists here.
      🟠 *The message-carrying in-use guards in front of that FK, and 0028's
      `$deletingTypeUsageCount`, are [0029a](0029a-attribute-in-use-delete-guards-backend.md)'s
      acceptance criteria, not this story's.*
- [ ] Authorization is expressed through `ProductPolicy` against the **parent product**, with both an
      allow and a deny test per ability; no new permission string and no `RolePermissionSeeder` change.
- [ ] `lang/en/products.php` and `lang/es/products.php` are **extended** key-for-key identically, and
      no user-facing string is hardcoded.
- [ ] No route, Livewire component, Blade view, browser test, `skus` registry table, SKU override
      field or database trigger is added, and **no new base folder** — both pure-function classes ship
      in the existing `app/Actions/Products/`, never `app/Support/`.
- [ ] Pint clean and Larastan level 7 clean.

## Definition of Done
- [x] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule. **Recorded, Phase 5
      closure**: `DB_DATABASE=testing0029 php -d memory_limit=512M vendor/bin/pest` (isolated run,
      no concurrent process on the same database, verified via `ps aux` beforehand) —
      `1790 tests, 1787 passed, 0 failed, 3 skipped`. A prior run in the same session hit exactly
      one failure, `tests/Browser/Components/WysiwygEditorTest.php` (story 0021's file, this story
      touches zero browser/frontend files) — a `Timeout 5000ms exceeded`, re-run clean immediately
      after with no code change, matching this project's own documented browser-test flakiness under
      memory pressure (`docs/testing/frontend/playwright-setup.md`).
- [x] `vendor/bin/pint --format agent` clean and Larastan level 7 passing — `phpstan.neon`
      analyses `database/`, so both migrations **and the factory** are in scope. **Recorded**: both
      unscoped, both `passed`, 0 Larastan errors (`--memory-limit=1G`, since the default worker's own
      128M can fail unrelated to code — see `docs/testing/ci/commands.md`).
- [x] **Index reality verified with `php artisan db:table product_variants` and
      `php artisan db:table product_variant_values` after a *fresh* migrate** — not by reading the
      migration, and not against the current stale local schema (**V-M**). Confirm exactly three
      declared indexes on `product_variants` plus the auto-created `featured_media_id` one, and
      exactly the composite PRIMARY plus the auto-created FK index on the pivot. **Recorded** (executed
      independently twice — once by `database-expert` at Phase 3, once by `code-reviewer` at Phase 5,
      both against a fresh `testing0029` migrate): `product_variants` reports exactly `primary` (id),
      `product_variants_sku_unique`, `product_variants_product_id_combination_hash_unique`, plus the
      auto-created `product_variants_featured_media_id_foreign` — matching **D-14** exactly.
      `product_variant_values` reports exactly the composite `primary` on
      `(product_variant_id, product_attribute_value_id)` plus the auto-created
      `product_variant_values_product_attribute_value_id_foreign` — no hand-written index on either
      pivot FK column, per **D-14**'s omission rules.
- [x] Code reviewed (code-reviewer). Two rounds: first FAILed on four missing test-coverage items
      (an `UpdateProductVariant` behaviour test file, a `combination_hash` global-consistency sweep
      after an update, `featuredMediaId` refusal coverage plus a weak class-only assertion, a
      binding-count assertion that could not fail) and one code bug
      (`UpdateProductVariant`'s `?string $featuredMediaId = null` default silently clearing a
      variant's own image on an update — the identical anti-pattern `docs/errors-log.md`'s 2026-09-01
      entry already records for `UpdateProduct`'s own `$description` parameter), plus 15 dead
      cross-reference anchors in `0031`'s Phase-2-split redirect (path retargeted, fragments were
      not). All closed; second round PASSed.
- [x] No security findings (appsec-auditor). Three rounds: round 1 FAILed on 3 Medium/5 Low (the SKU
      length/empty-segment/batch-collision invariants enforced on the creating path but not on either
      re-derivation cascade, plus smaller hardening items); round 2 FAILed on 1 new Medium the round-1
      fix itself introduced (`attempts: 3` retry on `UpdateProduct`'s transaction was unsafe because
      the closure mutates an externally-created `$product` model whose in-memory state a rollback
      does not reset — a silent lost update on retry); round 3 PASSed. See
      [docs/security/derived-column-invariants.md](../../../docs/security/derived-column-invariants.md)
      for the full record. Point the audit at **D-4** specifically: whether the
      locking pre-check genuinely serialises the cross-table claim under the live isolation level,
      whether the fixed lock order is honoured at every call site (now five — the two variant
      actions, 0024's two product actions, and `SyncProductAttributeValues`' rename cascade), and
      the accepted residual that the cross-table half has no database backstop (**R-G**).
      **Additionally, and specific to the derived-SKU amendment:** confirm that both the SKU
      derivation and the combination hash consume attribute-value ids *and strings* read back from
      the database in a single query, never from the request payload (**V-10** — the derivation is
      now a second consumer of that rule), and that `sku` is genuinely unreachable by mass assignment
      on `ProductVariant`.
- [ ] Documentation updated (docs-keeper): `docs/database/schema.md` gains both tables, ER entities and
      the deliberate-index-omission notes; ADR 0001's "still future" list drops **Product Variants**;
      and **[signed-link-verification.md](../../../docs/security/signed-link-verification.md) gains the
      refinement in D-4.5** — that a locking read *on the value in a unique index* is a genuine
      race guard, distinct from the PK-locking case that document currently describes. Without that
      note the two readings look contradictory. **`docs/database/schema.md` must also record that
      `product_variants.sku` is a derived column** with its formula, its ordering rule and its
      re-derivation triggers, in the same way it documents `users.email`'s obfuscation — a derived
      column that reads like an ordinary one is the single most likely thing for a future story to
      write directly.
- [ ] 🟠 **Hand-off to story 0031, rewritten 2026-09-04 — part (a) is discharged here, not handed
      over.** It used to open *"these actions perform no authorization of their own (**D-12**), so 0031
      must (a) call `Gate::authorize()` against the parent product as the first statement of every
      method that mutates or discloses"*. **The actions now authorize themselves (D-12.1)**, so (a)
      becomes *defence in depth* rather than the only layer: 0031 still gates every mutating and
      disclosing method, and its gate is what fails fast before a transaction opens and what makes its
      per-row UI hints honest — a reviewer deleting either layer has removed a layer, not a
      redundancy. Parts (b) and (c) are unchanged and still 0031's alone: **(b)** gate the route with
      **`can:products.view`, never `permission:products.view`**; **(c)** **render the variant SKU as
      read-only** — it is derived (**D-4.3**), so the builder must show it (ideally previewing it live
      as values are picked) and must never offer it as an input. A disabled input that still posts, or
      a hidden field carrying the previewed value, re-opens exactly the typed-claimant problem the
      derivation removes; the action ignores a submitted `sku`, but 0031 should not send one. The
      `->ignore()` asymmetry that once made this bullet worse than 0024's **does not apply** at all
      (**D-4.7**).
- [ ] 🟣 **Four further hand-offs to 0031, added 2026-08-19**, all of them things 0031 asked for and
      this story now owns. **(a) Its OQ-3 is answered in full** — the error-bag keys (**D-15**), the
      missing `variantFeaturedMediaIdRules()` (**D-16**), the action signatures (**D-17.1**) and the
      named relations including `ProductAttributeValue::type()` (**D-17.2**) — so 0031's OQ-3 should be
      **closed rather than re-debated**. **(b)** Every one of this story's bag keys is **unbound on
      0031's screen**, so all of them must be rendered explicitly or three of four refusals are
      invisible while every backend test is green (0031 **D-8**). **(c) The generator now exists**, 🟠 **but it is
      [0029b](0029b-product-variant-combination-generator-backend.md)'s, not this story's, since
      2026-09-04** — which converts 0031's **D-3** scope fence and its **OQ-2b** into a shippable UI
      decision against a *sibling* story. Note the name: 0031 calls the action
      `GenerateProductVariants`, and what ships is **`GenerateProductVariantCombinations`**. **(d)** A generator UI must render the
      `created`/`skipped`/`refused` summary as a result table, and inherits the pagination consequence
      0031's own OQ-2 flagged (a capped batch is still up to `MAX_COMBINATIONS` rows arriving at once).
- [ ] 🟠 **The savepoint gap-lock probe moved to
      [0029b](0029b-product-variant-combination-generator-backend.md)** on 2026-09-04, with the batch
      that raises the question. Nothing in this story nests a savepoint inside another transaction, so
      it has no occasion to run it.
- [ ] 🟠 **Cross-reference sweep for the split**: every mention of the generator or of the two
      in-use guards in [0031](../0031-product-variants-editor-ui.md) points at **0029b** / **0029a**
      rather than at this file, and both new siblings' own relative links resolve from
      `ai-spec/tasks/` — verified by resolving each path against the filesystem, per
      [workflow.md](../../../docs/workflow.md#link-integrity-check-on-every-stage-move), not by
      pattern-matching.
- [ ] **Constraint recorded for Epic 3**: a variant delete is a hard delete, and any story needing a
      variant to survive deletion must **snapshot**, not soft-delete (0024 **D-12**'s settled
      semantics, inherited).
- [ ] **Constraint restated for any future media-delete story**: `product_variants.featured_media_id`
      is a **fourth** reference source alongside `products.featured_media_id`, `product_media` and
      Epic 4's blog posts. That story must count across all four (0024 **R-17**).
- [ ] Acceptance criteria met.

## Verified environment findings

Executed against this repository during the debate — by `database-expert` unless marked otherwise.
Several decisions would be wrong without them.

> 🔵 **2026-08-18 — status after the derived-SKU amendment.** No finding is *withdrawn*; a probe's
> result does not stop being true when the design around it changes. Three (**V-6**, **V-7**,
> **V-8**) are marked **no longer load-bearing**, because the only decision they supported was the
> `skus` registry. **V-10 is explicitly unaffected** and now covers a second artifact — see the note
> in **D-3**. Everything else stands unchanged.

| # | Finding |
| --- | --- |
| **V-A** | **MySQL 8.4.10**, `innodb_default_row_format=dynamic`, `sql_mode` includes `STRICT_TRANS_TABLES`, **`transaction_isolation = REPEATABLE-READ`**, schema collation `utf8mb4_unicode_ci`. Confirms 0024 **V-2** still holds |
| **V-B** 🔴 | **The obvious pivot name is a migrate-time blocker.** `product_variant_attribute_values` generates a **67-character** FK constraint name, over MySQL's 64-char identifier limit → `ERROR 1059`. Forces the name `product_variant_values`. *(Independently re-verified by `product-owner` by arithmetic: 32 + 1 + 26 + 8 = 67; `product_variant_values` gives 57.)* |
| **V-C** | **A generated column cannot read another table** — `ERROR 3102`. Kills the "derive the combination key in SQL" option outright |
| **V-D** | **A `CHECK` constraint cannot read another table either** — `ERROR 3815` |
| **V-E** | **A JSON column cannot carry a `UNIQUE` index at all** — `ERROR 3152`. The JSON option does not even solve the problem it is proposed for |
| **V-F** | MySQL normalises JSON **object** keys (order-independent equality) but JSON **arrays** preserve order, so `JSON_ARRAY('b','a') = JSON_ARRAY('a','b')` is `0` |
| **V-G** 🟢 | **InnoDB auto-creates the supporting index for a trailing FK column, and none when the FK column is a PK's leading prefix.** Live proof: `role_has_permissions` carries an auto-created `KEY (role_id)` its migration never declares, while `model_has_roles` has none on `role_id`. The empirical basis for 0024 **D-10** and 0028 **D2** |
| **V-H** 🟢 | **A locking read on a *nonexistent* value in a unique index takes an `X,GAP` lock under REPEATABLE READ**, blocking a concurrent `INSERT` of that key — observed in `performance_schema.data_locks` against `users_email_unique`. **This is what makes D-4 layer 2 a real race guard** |
| **V-I** | **Zero JSON columns in any app-owned table** and zero `json`/`array` casts in `app/Models/` — the only hit is the vendored `passkeys.credential` |
| **V-J** | `constrained($table, $column, $indexName)` accepts an explicit constraint name and emits the short name correctly — the escape hatch for **V-B**. `backend-expert` recommends *using* it (`indexName: 'pv_attribute_value_foreign'`) and keeping a descriptive table name; `database-expert` recommends renaming the table instead, on the ground that a hand-picked constraint name is a magic string nobody reproduces on the next pivot. **OQ-9** |
| **V-2** 🔴 | **The application's database user cannot create a trigger.** `CREATE TRIGGER` as `sail` → `ERROR 1419 (HY000): You do not have the SUPER privilege and binary logging is enabled` (`log_bin=ON`, `log_bin_trust_function_creators=OFF`). A `DB::unprepared('CREATE TRIGGER …')` migration **fails at migrate time in this exact environment** — the trigger option is not merely unidiomatic, it is unavailable |
| **V-5** 🔴 | **Two independent `UNIQUE(sku)` indexes genuinely do not stop the collision.** Inserting `product_variants(sku='RNR-001')` while `products(sku='RNR-001')` exists **succeeded**. 0024's **RQ-9** reading is confirmed by execution, and 0024 currently ships an acceptance criterion PRD §2.2's Scenario Outline defeats. **Still fully live after the amendment** — it is the proof that **D-4.5**'s application check is doing real work, since nothing in the schema does it |
| **V-6** ⚪ | *No longer load-bearing (2026-08-18 — supported only the dropped registry).* A shared registry row does stop it, as SQLSTATE `23000` (`1062 Duplicate entry`) — catchable exactly as `CreateUser` catches `'23000'` |
| **V-7** ⚪ | *No longer load-bearing (2026-08-18 — supported only the dropped registry).* The two-level cascade reaches the registry: deleting a product with `products→product_variants` and both `skus` owner FKs cascading left **0 products, 0 variants, 0 registry rows**, and the freed SKU was immediately re-insertable |
| **V-8** ⚪ | *No longer load-bearing for the registry, but the collation fact it establishes still is.* `utf8mb4_unicode_ci` matched `rnr-001` and `RNR-001 ` (trailing space, PAD SPACE) against a stored `RNR-001` with `1062` — which is why **D-4.5**'s existence check is case- and trailing-space-insensitive for free on MySQL, and why **R-H**'s SQLite gap matters for it |
| **V-10** 🔴 | **`Rule::exists()` on a UUID is case-insensitive here, but a hash of it is not.** `WHERE id='V-BLACK'` matched a stored `v-black` under `utf8mb4_unicode_ci`, while `SHA2('v-40\|v-black') != SHA2('V-40\|V-BLACK')`. A case-varied payload passes validation **and produces a different combination hash**, evading the duplicate-combination unique index. The read-back in **D-3** is mandatory. **Unaffected by the 2026-08-18 amendment and now doubly load-bearing**: this was never a registry finding, and the SKU derivation (**D-4**) is a second consumer of the same read-back, since it needs each value's `value` *string* |
| **V-11** | **A `CHECK` violation is SQLSTATE `HY000` (error 3819), not `23000`** — so it would slip past the repo's standard catch. Moot given no CHECK is recommended, but it is the reason nobody should "harden" the registry with one and assume the existing catch covers it |
| **V-12** 🟢 | **0028 D7's inferred claim is correct, by execution.** Deleting an attribute *type* whose values are referenced by the `restrictOnDelete` pivot aborts with `ERROR 1451 (23000)` while cascading type→values, and **nothing is deleted** — types and values both survive |
| **V-9** | The FK name for the *singular* pivot spelling `product_variant_attribute_value` is **66** chars — also over the limit. Both candidate spellings fail; independently re-confirmed by `product-owner` by arithmetic (66 and 67) |
| **V-15** ⚪ | 🟠 **RETIRED 2026-09-04 — its premise is false and had been for days.** It read: *“0024 and 0028 are specs, not code. Every ‘modification to 0024/0028’ in this file is an amendment to an unbuilt spec if sequenced now, and a code change only if those stories ship first.”* Both stories sit in **`ai-spec/tasks/done/`** with their code shipped, so **every** row in the Modifies table is a change to real, tested, reviewed code — which is why this pass verified each row against the actual file and found three of them wrong (Phase 2 defects 1, 3 and 6). The “write the cascade in while it is still spec” advice hanging off this finding is likewise moot: `UpdateProduct` and `SyncProductAttributeValues` both exist, so the cascade is a retrofit either way, with **R-J**'s coordination cost paid rather than avoided |
| **V-K** | **Laravel 13.19.0's `Blueprint` has no `check()` method.** A `CHECK` needs raw `DB::statement()`, which breaks the `down()`-symmetry idiom. Was load-bearing against the `skus` registry (**D-4a**); after the amendment it remains the standing reason no `CHECK` may be added to `product_variants` either |
| **V-L** | `foreignUuid('product_attribute_value_id')->constrained()` correctly infers `product_attribute_values` — no explicit table argument needed, unlike `featured_media_id` (0024 **V-4**) |
| **V-M** 🔴 | **The local dev schema is stale.** `migrate:status` shows `2026_08_17_132646_drop_redundant_uuid_unique_index_from_users_table` as **Pending**. Any Phase 3 index verification must follow a fresh migrate or it confirms the wrong reality |
| **V-N** | `char(64)` and `binary(32)` are both available; `SHA2(x,256)` is 64 hex chars / 32 raw bytes |
| **V-P** ⚪ | 🟠 **RETIRED 2026-09-04 — false.** It read: *“All four dependencies are still unimplemented — `database/migrations/` holds only the users-era files.”* All four (0019, 0023, 0024, 0028) are closed and in `done/`, and `database/migrations/` holds `create_media_table`, `create_product_categories_table`, `create_products_table`, `create_product_media_table`, `create_product_sales_region_table`, `create_product_attribute_types_table` and `create_product_attribute_values_table`. The **sequencing** requirement this finding supported is already satisfied rather than pending |
| **V-Q** *(product-owner)* | **`lockForUpdate()` already has house precedent** at [`app/Actions/Users/ConfirmEmailChange.php:26`](../../../app/Actions/Users/ConfirmEmailChange.php), and it is the pattern `signed-link-verification.md` documents — so **D-4** layer 2 extends an existing idiom rather than introducing one |
| **V-R** *(product-owner)* | **No trigger precedent anywhere**: `grep -rn "unprepared\|CREATE TRIGGER\|DB::statement" database/ app/` returns nothing. Load-bearing against **D-4b** |
| **V-S** *(product-owner)* | **`make:rule` exists**, so `app/Rules/` is a stock Laravel location needing no new-folder approval — noted because **D-4** does *not* need it, and a reviewer may wonder why |
| **V-T** *(product-owner)* | Laravel 13 promotes a unique-constraint `23000` to `UniqueConstraintViolationException` — `vendor/laravel/framework/src/Illuminate/Database/Connection.php:854` |

## Dependencies and risks

### Dependencies — all four hard, blocking, and 🟠 **all four already shipped** (V-P retired 2026-09-04)

- **0024 (products core CRUD)** — this story FKs into `products`, **reuses** its SKU canonicalisation
  (**RQ-9**), and **modifies three of its shipped files** (**D-4**).
- **0028 (attribute types & values)** — this story FKs into `product_attribute_values` under a
  `restrictOnDelete()` **it mandates** (D4), and fills in the `DeleteProductAttributeType` seam and
  the `$deletingTypeUsageCount` placeholder its D7 designed.
- **0019 (media library)** — the own-image FK points into `media`.
- **0023 (product categories)** — transitively, via `products.product_category_id`.
- Per [workflow.md](../../../docs/workflow.md#task-ordering-rule) the numbering is correct, and the
  sequencing requirement is **already met**: 0019, 0023, 0024 and 0028 are all in
  `ai-spec/tasks/done/`. What that changes in practice is that every retrofit above is a change to
  **shipped** code rather than an amendment to a sibling spec — the reason this file's own Modifies
  rows had to be verified against the real files, and the reason three of them were wrong.
- 🟠 **Two stories now depend on this one and did not exist before 2026-09-04:**
  **[0029a](0029a-attribute-in-use-delete-guards-backend.md)** (the attribute in-use delete guards)
  and **[0029b](0029b-product-variant-combination-generator-backend.md)** (the cartesian generator).
  Both are hard-blocked on this story reaching Phase 7. 0029a additionally edits
  `SyncProductAttributeValues`, which this story also edits (a different branch), so the order is
  strictly **0029 → 0029a**. 0029b shares no file with either and could run in parallel with 0029a;
  sequential is the safe default given **R-J**.
- **Story 0031 depends on all three** (the paired UI).

### Risks

- **R-A — the 67-char FK name (V-B)** fails at migrate time with a non-obvious fix. Closed by the
  table name in **D-5**; keep the migration comment so nobody "improves" it back.
- **R-B — hash/pivot drift.** Mitigated by combination immutability (**D-13**), a single writer and
  the consistency test — **not eliminated**. A future variant-edit-combination feature must recompute
  the hash in the same transaction or the unique index starts guarding a stale value.
- **R-C — `decimal:2` returns a string.** 0024 **R-4** inherited unchanged. `@property string $price`;
  `toBe('19.99')` with quotes.
- **R-D — the featured-image accessor is an N+1 magnet** (**D-7**). Any variants list must eager-load
  `['featuredImage', 'product.featuredImage']`.
- **R-E — half the cross-table SKU rule can vanish silently.** If one call site keeps only one of the
  two `Rule::unique()` entries, nothing errors and the gap closes for one table only. Mitigated by the
  single shared trait method; **tested from both directions**. *(2026-08-18: narrowed. Only the
  product side validates a typed SKU now, so there is one trait method and one call path where there
  were two — but the risk does not vanish, because the variant side's guard moved into
  `CreateProductVariant`'s existence check, which is just as easy to omit and has no validator to
  make its absence visible.)*
- **R-L — the derived SKU drifts from its inputs.** New with the 2026-08-18 amendment, and the direct
  analogue of **R-B**: a stored derived column is only as good as the completeness of its
  re-derivation triggers (**D-4.6**). The two known writers of an input are `UpdateProduct` and
  `SyncProductAttributeValues`' rename branch; a **third** — a bulk import, a tinker session, a future
  "merge two attribute values" feature — reintroduces drift silently. Mitigated by the global
  consistency test (**D-4.3**), which is what turns drift from invisible into a red suite, and by the
  single `DeriveVariantSku` definition. **Not eliminated.**
- **R-M — the re-derivation cascade is an unbounded write inside someone else's transaction.**
  Renaming one attribute value can rewrite every variant on every product using it, and renaming a
  product SKU rewrites all of that product's variants — each with its own locking cross-table check.
  At this catalog's scale (10²–10⁴ variants) that is fine; it is recorded because the cost lands in
  **0024's and 0028's** actions, where a reader looking only at those stories would not expect it,
  and because a lock held across N checks widens the deadlock window that **D-4.5**'s fixed order
  exists to control.
- **R-N — the casing rule contradicts 0024's, and the contradiction is invisible in code review.**
  `Str::upper()` on a product SKU sits three files away from a derivation that deliberately does not
  upper-case. The most likely "cleanup" a future reviewer makes is to unify them, silently rewriting
  every variant SKU in the catalog on the next re-derivation. Mitigated by **OQ-14** being answered
  explicitly, by the three-part casing test, and by a comment at the derivation site.
- **R-F — the `23000` catch must disambiguate two unique indexes** on `product_variants` (`sku` vs
  `(product_id, combination_hash)`). Reporting the wrong one is a genuinely confusing bug.
- **R-G — no database backstop for the cross-table SKU half** (**D-4**, accepted). A sequential writer
  that bypasses both the shared trait and the locking action can still create the collision.
  *(2026-08-18: substantially narrowed but still live. The registry that would have closed it is
  dropped. What shrank the exposure is that a variant SKU is no longer chooseable — the only
  remaining human-typed claimant in the namespace is a **product** SKU, so the residual is a
  seeder/import/raw-`INSERT` that writes `products.sku` without checking `product_variants`, plus the
  same for a raw variant insert. Accepted on `database-expert`'s original grounds: nothing joins on
  SKU, and Epic 3 snapshots it.)*
- **R-H — ⚠️ CLOSED 2026-09-01 (was: 0024's V-1 / `ci-database-connection-gap.md` is still open).**
  That task shipped on **2026-08-26** — `phpunit.xml`, `.env.example` and
  `.github/workflows/tests.yml` all pin MySQL, with a `mysql:8.4` service in CI and a recorded clean
  `866/866` run. **What survives, and is the useful half**: every FK, gap-lock and unique-index
  assertion here is exercised only under **MySQL**, which is now a deliberate project decision rather
  than an accident (MySQL is this project's only supported database) — and the gap lock still has no
  SQLite equivalent at all, so none of these assertions is portable.
- **R-I — the local dev schema is stale (V-M)**, so the DoD index verification must follow a fresh
  migrate — the same trap that let `users_uuid_unique` survive.
- **R-J — this story modifies four files owned by two other stories** (**D-4**, **D-10**). 0024's
  **R-13** records what uncoordinated edits to a shared file cost. Sequencing is the mitigation.
- **R-K — story size. 🟠 CLOSED 2026-09-04 by a three-way split, after Phase 2 FAILED this story on
  INVEST "Small".** This risk had been carried, correctly, since the story was written; what the
  Phase 2 review found is that its own **self-assessment was stale**. That assessment — *"the
  amendment is close to size-neutral overall"* — is dated **2026-08-18** and is about the
  derived-SKU amendment only. The **cartesian generator arrived on 2026-08-19**, *reversing a scope
  fence*, and R-K was never re-evaluated after it. Re-asserting "None blocks Phase 2" against a
  specific, reasoned FAIL was not an answer.

  **The cut, and why these two lines and not others.** The story is now three:

  | Story | What it carries | Why it is a clean cut |
  | --- | --- | --- |
  | **0029** *(this file)* | two tables, `ProductVariant`, the derived SKU + its re-derivation cascades, the combination hash, read-time image inheritance, three self-authorizing actions, the 0024 retrofit | the irreducible core: everything here shares the two tables and the derived column, and nothing in it is independently shippable |
  | **[0029a](0029a-attribute-in-use-delete-guards-backend.md)** | the two **D-10** in-use guards against 0028's shipped delete paths | **R-K named this cut itself**, from the day it was written. Independently valuable (0028's screen stops 500-ing on an everyday gesture), independently testable, and it needs from this story only the pivot table's existence |
  | **[0029b](0029b-product-variant-combination-generator-backend.md)** | the **D-18** cartesian generator | **the cleanest of the three.** Purely additive on `CreateProductVariant`: no schema, no index, no shared file, re-implements nothing. Removing it changes no contract here. It is also the piece that was added *after* R-K was last assessed |

  **What the cut costs, stated rather than glossed.** R-K's own 2026-08-18 note observed that the
  derived-SKU amendment *"costs R-K's cleanest cut line half its cleanliness"*, because **D-4.6**'s
  value-rename cascade lands in `SyncProductAttributeValues` too. That is true and is not wished
  away: **0029 and 0029a both edit that file**, in different branches (rename vs. delete). The
  mitigation is sequencing — 0029a runs strictly after this story reaches Phase 7 — which is what
  **R-J** already prescribes for exactly this shape. The alternative considered and rejected was
  moving the rename cascade into 0029a as well, so that one story owned the whole file: rejected
  because the cascade is load-bearing for **this** story's own global consistency invariant
  (**D-4.3**/**D-4.6**), and a story whose central acceptance criterion is knowingly half-true is a
  worse outcome than two coordinated edits to one file.

  **The residual.** This file is still large — two tables, two uniqueness mechanisms, a derived
  column with two re-derivation cascades, and a retrofit to three of 0024's shipped files. It is not
  claimed to be small in the abstract; the claim is that no further cut leaves two independently
  valuable stories, because everything remaining is bound together by the two tables and the derived
  `sku` column. A fourth cut (splitting the 0024 retrofit from the tables) was considered and
  rejected: it would ship a `product_variants` table whose SKU uniqueness is enforced in one
  direction only, which is **V-5**'s executed collision left deliberately open.

🟠 **R-O, R-P and R-Q moved to [0029b](0029b-product-variant-combination-generator-backend.md)
on 2026-09-04** — the generator's lock-hold window, the skipped/refused conflation, and the three
refusals sharing the `sku` bag key at batch scale. **R-F** stays here (it is `CreateProductVariant`'s
own two-unique-index disambiguation), and so does the `sku`-key half of R-Q's concern, which **FP17**
already carries.

- **R-S 🟠 — the split itself is a coordination risk.** New 2026-09-04. Three stories now share a
  contract that used to be one document, and two of them edit a file this one also edits. Every
  cross-reference between them is a place the three can drift: 0029a's count queries assume this
  story's pivot table name and column names, 0029b assumes `CreateProductVariant`'s exact signature
  and its `ValidationException`-per-savepoint behaviour, and **0031 binds to all three**. Mitigated
  by strict sequencing, by each sibling naming the exact contract it consumes rather than restating
  it, and by 0031's own cross-references being updated in the same pass as the split. **Not
  eliminated** — the honest cost of resolving "Small" is that a contract split three ways is a
  contract with two more seams.

### Recorded dissents

**DIS-1 (`database-expert`, live — needs a ruling).** *"One value per attribute type per variant"
ships as an application-level rule only, and `database-expert` would rather it were a database
invariant.* Nothing in the recommended schema prevents `Size 40 / Size 41` in one combination: the
pivot PK stops the same *value* twice, and the composite unique stops the same *set* twice, but
neither sees types. The airtight version costs one amendment to 0028 and ~36 bytes per pivot row:

```php
// amendment to 0028's create_product_attribute_values_table:
$table->unique(['id', 'product_attribute_type_id']);   // MySQL needs the referenced columns to be
                                                       // an index's leftmost prefix

// then, in this story's pivot:
$table->uuid('product_attribute_type_id');             // denormalised, but composite-FK-guarded
$table->foreign(['product_attribute_value_id', 'product_attribute_type_id'])
    ->references(['id', 'product_attribute_type_id'])
    ->on('product_attribute_values')
    ->restrictOnDelete();
$table->unique(['product_variant_id', 'product_attribute_type_id']);
```

The denormalised type id cannot drift, because the composite FK makes "this value really does belong
to this type" a database fact, and 0028's **D4** diff never moves a value between types.
`database-expert` recommends shipping the **application-level** rule — because it needs an amendment
to a contract this story was told not to reopen, because no PRD scenario mandates it, and because the
composite unique already blocks any *repeat* of such a combination — but records the dissent because
this is exactly the class of argument 0028's **D1** reason #1 won on. Routed as **OQ-8**.
`backend-expert` independently reached the same conclusion (app-level only), on the additional ground
that the UI cannot produce such a combination and the worst outcome of a forged payload is a nonsense
row — so this dissent is **against the schema, not between the two experts**.

**DIS-2 (`backend-expert`) — the cross-table SKU mechanism. ✅ CLOSED 2026-08-18, by neither
position.** The dissent was between the `skus` registry and the application rule under a gap lock,
and it was routed as OQ-1. The PO resolved it with a **derived** variant SKU, which removes the thing
both mechanisms existed to arbitrate: there is no longer a variant SKU for anyone to claim. Recorded
as closed rather than deleted because `backend-expert`'s underlying argument — *this repo pays real
cost for a database last word* — was not refuted and is the reason **R-G** is still carried as an
accepted residual rather than treated as solved. The revisit trigger at the end of **D-4**'s
superseded block is the condition under which this dissent reopens.

**DIS-3 (`backend-expert`) — the zero-call-site policy gap has compounded across three stories, and
discharging it story-by-story is the wrong instrument.** By the end of 0029, `app/Policies/` holds
`UserPolicy` (many call sites), `ProductCategoryPolicy` (**zero**) and `ProductPolicy` (**zero**, now
covering a second entity), while three backend stories will have shipped ten action classes in
`app/Actions/Products/` and `app/Actions/ProductCategories/` containing no `Gate` call, with
enforcement deferred to UI stories (0025, 0027, 0031) that do not exist yet. `backend-qa` raised this
at 0023 **D-9** and again at 0024 **D-15**; it was overruled on consistency grounds, correctly at the
time. What has changed is **scale**: the next reader will find ten actions and two zero-call-site
policies, and "the actions are self-protecting" is a reasonable and dangerous inference.

> ⚠️ **Partly answered on 2026-09-01, in `backend-qa`'s and `backend-expert`'s favour.** The
> "overruled on consistency grounds" reading rested on a **false** claim that `CreateUser`/`UpdateUser`
> contain no `Gate` call; they do, and the documented convention is action-owns-the-rule. At its split
> [0024](../done/0024-products-core-crud-backend.md) **reversed** its D-15/RQ-10 accordingly, so the arithmetic
> above is already out of date: `ProductPolicy` is **not** a zero-call-site policy, and four of the ten
> actions this paragraph counts now authorize. What remains open is exactly `backend-expert`'s ask —
> a **project-level decision made once**, plus the `ArchitectureTest` assertion that every
> `app/Actions/` class has an authorizing call site — because `app/Actions/ProductCategories/`'s three
> actions are still the standing exception, deliberately deferred to **0025** (see
> [0024b](../done/0024b-product-category-in-use-delete-guard.md) **D-B1** for why 0024b did not close a third
> of that folder unilaterally).
`backend-expert` explicitly does **not** ask 0029 to diverge — a third idiom would be worse — but asks
the coordinator to treat this as a **project-level decision made once** (a `docs/security/` rule plus
an `ArchitectureTest` assertion that every `app/Actions/` class has an authorizing call site) rather
than a per-story Definition-of-Done bullet now written three times without being discharged.
**`product-owner` endorses this** and recommends raising it as its own task, alongside
`ci-database-connection-gap.md`.

**DIS-4 (`backend-expert`) — ADR 0001's "closed list of seven" is now contradicted by two tables.**
0028's two attribute tables already sit outside the enumerated seven. *(2026-08-18: the third,
Option A's `skus`, is gone with the registry — so this dissent is one table smaller than when it was
written, and unchanged in substance.)* `product_variants` itself is unaffected (it *is* one of the
seven — **D-11**).
Still non-blocking, but worth escalating to `docs-keeper` before Epic 2 closes rather than after.

## Open questions

🟠 **Rewritten 2026-09-04, because the previous preamble's claim was the one Phase 2 rejected.**
It opened *"None blocks Phase 2 INVEST review"* — which was true of the questions but was also used to
wave through the two things the review actually failed the story on. Both are now **decided rather
than open**: **D-12.1** settles authorization (the actions self-authorize), and **R-K** settles size
(a three-way split). Neither is an open question any more.

Of what remains here, **OQ-2 must be answered before Phase 3** (a one-line `->nullable()` now versus a
backfill later), and **OQ-17** shares its timing for the same reason (`string(128)` now versus an
`ALTER`). **OQ-13**–**OQ-16** and **OQ-18** are action code and are revisitable at moderate cost.
**OQ-12 is now answered** (see below). **OQ-7 moved to
[0029a](0029a-attribute-in-use-delete-guards-backend.md)** and **OQ-19**–**OQ-21** to
[0029b](0029b-product-variant-combination-generator-backend.md)**, each with the decision it belongs
to. **Nine open questions remain in this file** — OQ-2, OQ-3, OQ-4, OQ-6, OQ-8, OQ-9, OQ-10, OQ-11 and
the OQ-13–OQ-18 group's five live members — none of which blocks Phase 2.

**OQ-1 — The cross-table SKU mechanism. ✅ ANSWERED 2026-08-18 — neither option; the SKU is
derived.**

The question as posed was "registry table or application rule under a gap lock", and the PO answered
by removing its premise: **a variant SKU is not typed, so there is nothing to reserve.** It is
computed from the parent product's SKU plus the variant's attribute values —
`0001` + Talla "M" → `0001-M`; `0002` + Color "azul marino" + Talla "L" → `0002-azul-marino-L`.

What the answer settles, and what it leaves open:

- **Settled.** No `skus` table (a scope fence now, not a choice). No `Sku` model. No `saved` hook on
  `Product`. No registry backfill migration. The variant SKU is a stored, derived, non-fillable
  column (**D-4.3**), and cross-table uniqueness is an existence check across both tables under the
  **V-H** locking read (**D-4.5**) — i.e. Option B's *race guard* survives while Option B's *framing*
  does not.
- **Still true, and the reason R-G is carried rather than closed.** `backend-expert`'s objection to
  an application-only mechanism was never refuted; the amendment shrinks its blast radius (one typed
  claimant instead of two) rather than answering it.
- **OQ-1c is moot** — there is no registry to fold into 0024. Its *sequencing* logic transferred to
  **V-15**'s note: **D-4.6**'s re-derivation cascade should be written into 0024's `UpdateProduct`
  and 0028's `SyncProductAttributeValues` while both are still spec.
- **The revisit trigger stands**: a third SKU-bearing entity that lets a human *type* a SKU reopens
  the registry question. A third entity whose SKU is also derived does not.

Full reasoning at **[D-4](#d-4--sku-is-derived-from-the-parent-products-sku-and-the-variants-attribute-values)**;
the superseded options are retained beneath it.

**OQ-2 — Does a variant inherit the parent's price when unset, or must it carry its own?**
- **OQ-2a (recommended)** — **own price, NOT NULL** (**D-6**). The PRD's acceptance criterion marks
  only the *image* as inheriting while listing price among the three "its own" fields, and a nullable
  money column is one forgotten `??` from a wrong order-line snapshot in Epic 3.
- OQ-2b — nullable and inheriting, mirroring the image. Cheaper for the administrator; the ergonomic
  case it answers is better solved in 0031 by pre-filling each variant's price from the parent.
- **Timing matters**: a one-line `->nullable()` before Phase 3, an expensive backfill after.

**OQ-3 — Once a product has variants, what does `products.stock` mean** — the sum of its variants,
ignored, or still the sellable count of a base product? No schema change is requested either way
(**D-9** explicitly rejects a denormalised counter), but the answer decides whether 0027's editor
should hide the product-level stock field once variants exist, and Epic 3 needs it settled.

**OQ-4 — Is a variant's attribute combination immutable after creation** (editing it = delete and
recreate)?
- **Recommended: yes** (**D-13**). The entire hash/pivot drift argument rests on it, and it is
  domain-correct. Raised explicitly rather than assumed because **D-3** depends on it.

**OQ-5 — Does a product *declare* which attribute types it uses, and does this story ship a
"generate all combinations" builder?** 🟣 **PARTIALLY ANSWERED 2026-08-19 — the generator: yes; the
declaration table: still no.**

> The PO split this question, which had always bundled two separable things. **The cartesian generator
> ships** — 🟠 **in [0029b](0029b-product-variant-combination-generator-backend.md) since the
> 2026-09-04 split, not in this story** — as `GenerateProductVariantCombinations`
> (**[D-18](#d-18--the-cartesian-combination-generator)**), reversing the scope fence that deferred
> it. **The `product_product_attribute_type` declaration table does not** — OQ-5a's other half stands
> unchanged, and the generator holds its axes transiently as parameters, which is exactly what 0031's
> **D-3** point 2 observed was sufficient (*"the declaration table is not what is missing"*).
>
> **What this settles:** the *outcome semantics* 0031 **D-3** point 3 correctly identified as the real
> backend gap — one transaction, per-row outcomes, no half-built catalog — are now specified
> (**D-18.2**). 0031's own **OQ-2** becomes a pure UI decision on an action that exists.
>
> **What it leaves open, deliberately:** the Gherkin scenario *"a subset is not a duplicate"* stays
> **correct as written**, because without a declaration table there is no notion of a combination
> being *incomplete* — any non-empty subset is a legitimate variant. The OQ-5b reading (*"a
> combination must cover every type the product offers, exactly once"*) remains unenforceable and
> unenforced, and if it is ever wanted it is a new story, not an amendment to this one.

The original framing is retained below, because the declaration-table half is still live. PRD §2.2 says
*"a product **having** the attribute types Size and Color"* and *"they **generate** the variant"* —
both of which read as a declared axis set plus a cartesian generator.
- **OQ-5a (recommended)** — this story ships **single-variant creation only**, and the declared
  type set (a `product_product_attribute_type` table) plus the cartesian generator belong to
  **0030/0031**. Rationale: nothing in this story's own rules needs the declaration, and adding a
  third table here worsens the size pressure **R-K** already flags.
- OQ-5b — ship the declaration table here, since the "a variant's combination must cover every type
  the product offers, exactly once" rule is unenforceable without it, and without that rule a
  subset combination (which **D-3** correctly treats as distinct) is legal but arguably incoherent.
- Note the two interact: under OQ-5a, the Gherkin scenario "a subset is not a duplicate" is correct
  as written; under OQ-5b it would become "a subset is refused as incomplete".

**OQ-6 — Does a variant need its own `status`** (discontinue one size while the product stays
Active)? **Recommended: no** (**D-9**) — `stock = 0` already expresses it and already drives 0024's
badge. Recorded so the omission is a decision.

**OQ-7 — 🟠 MOVED to [0029a](0029a-attribute-in-use-delete-guards-backend.md) (2026-09-04),** with
the type-level in-use block it asks about.

**OQ-8 — Amend 0028 with `unique(['id','product_attribute_type_id'])`** so the one-value-per-type
rule can be a composite FK? See **DIS-1**. Exact DDL is ready; the cost is a contract amendment to a
table that does not exist yet, not a migration.

**OQ-9 — Confirm the pivot table name `product_variant_values`**, forced by **V-B**. Runner-up:
`variant_attribute_values` (59-char FK name, also safe). **Recommended: `product_variant_values`.**

**OQ-10 — May two variants of different products share the same combination?** **Yes** — confirming
only that the unique is `(product_id, combination_hash)` and not `combination_hash` alone. Stated
because a globally-unique hash is a tempting simplification that would be silently wrong.

**OQ-11 — Does a variant need a user-defined display order (`position`)?** The second expert split
(**D-8**). `database-expert` ships the column; `backend-expert` omits it because UUIDv7 makes
`ORDER BY id` creation order for free, and a column no UI writes is dead schema (0028 **D8**'s own
test). **Recommended: ship it** — creation order only matches the natural "38, 39, 40" expectation
by luck, and it is one line now versus an `ALTER` later. Confirm with 0031's owner, since that story
owns the reorder control that would write it.

**OQ-12 — Do variant create and delete map to `products.edit`, or to `products.create` /
`products.delete`? 🟠 ADOPTED 2026-09-04 as part of D-12.1 — `products.edit`
(`ProductPolicy::update`) for all three, against the parent product.** It could not stay open once
**D-12.1** made the actions self-authorizing: an action that authorizes needs an ability name, and
"decide it in 0031" is exactly the deferral Phase 2 refused. The reasoning is `backend-expert`'s,
unchanged: `products.create`/`products.delete` are about bringing a *product* into or out of the
catalog, while adding or removing one of its variants is a *modification of an existing* catalog
record — so holding `products.edit` but not `products.delete` should let you restructure a product,
not destroy one. **Still flagged for PO confirmation of the ability name only**, because it is
arguable and 0031 binds to it — and it is action code, so unlike OQ-2/OQ-17 it is cheap to revisit
after Phase 3. If the PO prefers `products.delete` for the variant delete, only
`DeleteProductVariant`'s one gate line and its own tests change.

---

The six questions below were **opened by the 2026-08-18 derived-SKU amendment**. Each is a genuine
product decision the PO's rule did not cover, and each is stated with the option `product-owner`
recommends and why.

**OQ-13 — When an input changes, is the SKU re-derived, or frozen at creation?** The PO's rule fixes
the formula but not its lifetime, and the two answers diverge the first time anyone renames anything.
- **OQ-13a (recommended)** — **re-derive** (**D-4.6**): a change to the parent product's SKU, or to an
  attribute value's text, rewrites every affected variant's SKU in the same transaction,
  all-or-nothing. Recommended because it is the only answer under which the formula stays *true*, and
  therefore the only one a test can assert globally — a frozen SKU makes a correctly-derived value and
  a bug indistinguishable after the first rename. It also avoids the obviously-wrong artifact of a
  product called `0009` whose variants all start `0001-`.
- OQ-13b — **freeze at creation**, never re-derive. The honest case for it is strong and operational:
  a SKU is printed on labels, scanned in a warehouse and snapshotted onto Epic 3 order lines, so
  silently rewriting it is a real-world cost that no amount of transactional correctness pays back.
- **A middle option exists if 13b appeals**: freeze on *value* rename (labels already printed for that
  variant) but re-derive on *parent SKU* change (a deliberate, rarer, product-level act). Say so
  explicitly if that is the intent — it is not a compromise anyone should infer.
- **Timing**: unlike OQ-1, this is action code, not schema. It is revisitable after Phase 3 at
  moderate cost.

**OQ-14 — Does the derived SKU preserve the attribute value's casing, or follow 0024's uppercase
canonicalisation?** The PO's example `0002-azul-marino-L` is mixed case, while 0024 **D-11** stores
every product SKU `Str::upper()`-ed and validates it against `^[A-Z0-9]…$` — so the two rules, applied
in the same namespace, genuinely conflict.
- **OQ-14a (recommended)** — **preserve casing, exactly as the PO specified.** `0002-azul-marino-L`
  is stored verbatim. Recommended because it is the stated rule and because nothing breaks:
  `utf8mb4_unicode_ci` is case-insensitive (**V-8**), so `0002-AZUL-MARINO-L` still collides with it
  and uniqueness is unaffected. The costs are cosmetic inconsistency in a SKU column that holds both
  shapes, and **R-N** (a future reviewer "unifying" them).
- OQ-14b — upper-case the derived SKU too (`0002-AZUL-MARINO-L`), making one canonical form across the
  whole namespace and removing R-N entirely. **This contradicts the PO's example**, which is why it is
  not recommended — but it is the answer a reader of 0024 alone would expect, so the decision needs to
  be explicit either way.
- Note the SQLite caveat: case-insensitive comparison is a **collation** property, and **R-H** /
  `ci-database-connection-gap.md` is still open. Under either option the application must compare an
  upper-cased form on both sides rather than trust the engine.

**OQ-15 — What happens to characters other than spaces?** The PO's rule names spaces only, but real
attribute values in this catalog contain accents (`Marrón`), and could contain slashes, quotes or
symbols.
- **OQ-15a (recommended)** — `Str::ascii()` first (`Marrón` → `Marron`), then spaces → hyphens, then
  strip anything still outside `[A-Za-z0-9._/-]`, and **refuse** a value that reduces to nothing
  (**D-4.4**). Recommended because a SKU is hand-typed and scanned, and because it keeps derived SKUs
  inside the character set 0024 already defined for typed ones.
- OQ-15b — pass non-ASCII through unchanged (`0002-Marrón`). Simpler and more faithful to "verbatim",
  at the cost of a SKU nobody can type reliably.
- Either way the transliteration is many-to-one, so `Marrón` and `Marron` on the same product collide —
  which is collision case (b) and is refused, not silently merged.

**OQ-16 — Is there any escape hatch when a derived SKU is unavailable?** Under **D-4.5** an
administrator can hit a collision they cannot resolve from the variant form, because there is no SKU
field to change.
- **OQ-16a (recommended)** — **no override.** The refusal names the conflicting record, and the two
  real remedies (rename the attribute value; change the product's SKU) are both things the
  administrator can do. Recommended because an override field re-introduces the typed claimant the
  whole design removes, and because the collision cases are narrow enough to be rare.
- OQ-16b — allow a per-variant manual override, stored in the same column, with the derivation used
  only as the default. Answer this "yes" only if a real workflow demands it; it changes **D-4.3**,
  **D-4.6** and the consistency test at once.

**OQ-17 — Confirm `product_variants.sku` at `string(128)` rather than 0024's `string(64)`.**
**Recommended: 128** (**D-4.4**) — a derived length is not something the administrator can shorten,
so refusing a legitimate variant at 65 characters is a dead end. **This is the one amendment-opened
question with a schema cost**, so it shares OQ-2's timing: one number now, an `ALTER` later.
Runner-up: keep 64 and refuse over-long derivations, which is defensible if parent SKUs are always
short (the PO's examples are 4 characters).

**OQ-18 — Reordering the attribute types changes the SKU of variants created afterwards, but not of
existing ones. Confirm that is acceptable.** A consequence of **D-4.2** plus **D-4.6**, not a separate
choice, but it produces a catalog where two variants render their values in different orders and it
will look like a bug to whoever finds it first. **Recommended: accept it** — the alternative
(re-deriving the whole catalog on a drag-and-drop) is far worse, and type reordering is rare. Flagged
because 0031 owns the reorder control and should warn on it.

---

🟠 **OQ-19, OQ-20 and OQ-21 moved to
[0029b](0029b-product-variant-combination-generator-backend.md) on 2026-09-04** — the batch cap's
constant, whether a generated variant takes the parent's price, and whether the generator should be
reachable for a subset of a product's axes. All three are questions *about the generator*, and none
of them has a schema cost, so moving them costs this story nothing. **One coupling survives the move
and is recorded on both sides**: 0029b's price question collapses into *"leave it NULL"* if **OQ-2**
here ever flips `product_variants.price` to nullable-and-inheriting — so **OQ-2 must be answered
first**, and it is this story's.

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-18 per
[workflow.md](../../../docs/workflow.md#phase-1--three-amigos-debate), derived from
[PRD](../../../docs/PRD/PRD.md#22-products) §2.2's "Product variants" Gherkin block and the "a variant"
example of its duplicate-SKU Scenario Outline, plus assumptions 9, 10 and 19, and grounded in **full
readings** of [0024](../done/0024-products-core-crud-backend.md),
[0028](../done/0028-product-attribute-types-and-values-backend.md) and
[0019](../done/0019-media-library-upload-and-conversions-backend.md), with
[0023](../done/0023-product-categories-backend.md) as the precedent for how this project models a delete
guard.

**How the three roles were actually covered — stated plainly rather than implied:**

- **`database-expert`** was convened as a subagent and **delivered in full**. Its contribution is the
  backbone of **D-2**, **D-3**, **D-5**, **D-6**, **D-10** and **D-14**, the migration code, and
  findings **V-A**–**V-P**. All were *executed* read-only; no migration was run and no file written.
- **`backend-expert`** was convened as a subagent and **delivered in full**, but *after* the
  coordinator had asked for the document to be composed. Its contribution was **folded in on a second
  pass** and is the source of **D-4**'s Option A, the **V-10** hash trap, **V-2**/**V-5**–**V-9**,
  **V-11**, **V-12**, **V-15**, the second 0028 code path in **D-10**, **T-4**/**T-6**/**T-7**/**T-9**,
  and dissents **DIS-2**–**DIS-4**.
- **`backend-qa`'s dispatch was refused by the platform** (concurrent-subagent pool saturated; hard
  limit, no retry). `product-owner` performed the QA contribution inline, grounding it by reading
  [`tests/Pest.php`](../../../tests/Pest.php),
  [`tests/Feature/Users/IndexTest.php`](../../../tests/Feature/Users/IndexTest.php), `docs/testing/**`
  and 0024/0028's own test sections. The false-pass catalogue and the subset/superset
  relational-division cases are `product-owner`'s, not a subagent's.

Findings **V-Q**–**V-T** are `product-owner`'s own, executed inline: the `lockForUpdate()` house
precedent at [`app/Actions/Users/ConfirmEmailChange.php:26`](../../../app/Actions/Users/ConfirmEmailChange.php)
that makes **D-4** Option B's layer 2 an extension rather than an invention; the absence of any
trigger precedent; `make:rule`'s availability; and Laravel 13's `UniqueConstraintViolationException`.
The over-long FK constraint name was independently re-verified by arithmetic at **both** candidate
spellings (66 and 67 characters — the two experts each found one of them).

> ✅ **Housekeeping — closed 2026-08-18.** `backend-expert` created a throwaway MySQL schema
> **`zzz_probe_0029`** inside the running `arospe-mysql-1` container to execute its probes and
> deliberately did not drop it (the brief forbade destructive database commands). Nothing in `arospe`
> or `testing` was ever touched. The user authorized the drop explicitly, per
> [contracts.md](../../../docs/contracts.md)'s Destructive Database Command Rule, and the schema **has
> been dropped**. No action remains for Phase 3.

The "hard delete", "SKU canonicalised on write", "no new module slug", "actions do not self-authorize"
and "UUID v7" positions are **inherited confirmed decisions** from 0024/0028, recorded here with their
reasoning so a later reader sees why the alternatives were closed rather than re-opening them. The
UUID position is the one place this story cites **PRD assumption 19 directly** rather than the
general Epic-2 policy, because *"Product Variants"* is one of the seven originally-named entities.

**Four recorded dissents** (**DIS-1** one-value-per-type as a database invariant; **DIS-2** the
cross-table SKU mechanism — **now closed**; **DIS-3** the compounding zero-call-site policy gap;
**DIS-4** ADR 0001's stale seven-entity framing) and **twenty-one open questions**, of which **OQ-1 is
answered** and **OQ-5 is half-answered** (2026-08-19), are carried forward.

### Amendment — 2026-08-18: the derived variant SKU

This document was written with **OQ-1** — the cross-table SKU mechanism — as its one unresolved
central decision, on which `backend-expert` (a `skus` registry) and `database-expert` (an application
rule under a gap lock) had reached opposite, execution-backed conclusions. **The PO answered it with
a business rule neither expert proposed**: a variant's SKU is *derived*, not typed —
`{parent_sku}-{value}…`, with spaces inside a value becoming hyphens, values appended in sequence for
a multi-attribute variant. Worked examples given by the PO: `0001`+`M` → `0001-M`; `0001`+`S` →
`0001-S`; `0002`+`azul marino` → `0002-azul-marino`; `0002`+`azul marino`+`L` → `0002-azul-marino-L`.

`product-owner` made two calls the PO's rule did not cover, both flagged as such rather than smuggled
in:

1. **The multi-attribute ordering rule** (**D-4.2**), which the PO explicitly delegated: sort by
   `(product_attribute_types.position, type.id, value.position, value.id)`. Chosen over submission
   order (non-deterministic — the failure the PO named), over type name (breaks on rename, which 0028
   supports), and over value id / the combination-hash sort (deterministic but arbitrary, so the SKU
   would read in a meaningless order). 0028's `position` is already the administrator-controlled
   canonical order of the types and the order the variant's own derived label renders in, so the SKU
   ends up reading in the same order as the name beside it. The `type.id` and value-level tiebreaks
   make the sort **total**, which matters because 0028's `position` is `default(0)` and a
   non-action writer can leave two types tied.
2. **Store, don't compute on read** (**D-4.3**), as the PO recommended, with the four reasons written
   out — the decisive one being that a `UNIQUE` index and a cross-table check have nothing to act on
   without a stored value, and **V-C** already proved a generated column cannot cross tables.

**What was rewritten**, rather than patched: the description, the SKU Gherkin feature (replaced
outright — the old duplicate-SKU Scenario Outline described a typed SKU that no longer exists), all
of **D-4**, the `sku` rows of **D-5**/**D-6**/**D-14**, the scope fences, the files tables, the SKU
test files (one new unit file, one new feature file, one rewritten), the false-pass catalogue
(**FP12** superseded, **FP13**–**FP16** added), the expected outcome, six acceptance criteria and
four Definition-of-Done bullets.

**What was retained and marked, per this project's convention of keeping superseded reasoning
visible**: the whole registry-vs-gap-lock debate, under
[Superseded](#superseded--the-registry-vs-gap-lock-debate-2026-08-18) inside D-4, including
`product-owner`'s original Option A recommendation (struck through, not deleted) and the revisit
trigger. `database-expert`'s **V-H** gap-lock finding is the one part of Option B that is not
superseded — it survives verbatim as **D-4.5**'s race guard. **V-6**, **V-7** and **V-8** are marked
*no longer load-bearing* rather than removed; **V-10** is explicitly marked *unaffected*, because it
was never a registry finding and the derivation is now a second consumer of its read-back rule.

**Six new open questions** (**OQ-13**–**OQ-18**) record the decisions the PO's rule did not reach:
re-derivation vs freezing, the casing conflict with 0024's `Str::upper()` canonicalisation, non-space
characters, the absence of an override escape hatch, the widened column, and the consequence of
reordering attribute types. **Three new risks** (**R-L** derived-column drift, **R-M** the unbounded
cascade inside another story's transaction, **R-N** the invisible casing contradiction) and one
narrowed one (**R-G**) come with them.

**Time-sensitive decisions, which is the main thing `product-owner` wants the coordinator to see.**
OQ-1c is moot (no registry to fold), but its logic transferred: **D-4.6**'s re-derivation cascade
should be written into 0024's `UpdateProduct` and 0028's `SyncProductAttributeValues` while both are
still spec (**V-15**), not retrofitted after. The other two remain **OQ-2** (a one-line
`->nullable()` on `price` versus a backfill) and **OQ-17** (`string(128)` versus an `ALTER`).

🟠 **Phase 2 HAS now run — and this story FAILED it (2026-09-04).** The paragraph that stood here
read *"**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Three items deserve an explicit
look there. **Size** (**R-K**) … **OQ-5** … And **DIS-3**"* — and it was right about which three
items mattered. All three were raised, and two were failures rather than observations:

| Item this section flagged | Phase 2 verdict |
| --- | --- |
| **Size (R-K)** | **FAIL on INVEST "Small".** R-K's self-assessment was **stale** — dated 2026-08-18, about the derived-SKU amendment only, and never re-run after the 2026-08-19 generator addition *reversed a scope fence*. Resolved by a three-way split; see the rewritten **R-K** |
| **OQ-5** | Unchanged as a scope boundary. Its generator half is now [0029b](0029b-product-variant-combination-generator-backend.md)'s; the declaration-table half is still fenced out of all three stories |
| **DIS-3** | **The deferral it warned about was rejected.** **D-12.1** decides authorization here rather than handing it to 0031, so this story adds three *authorizing* actions rather than three more ungated ones. DIS-3's actual ask — a project-level decision plus an `ArchitectureTest` assertion — is untouched and still open |

**Plus eight doc-consistency defects**, each verified against the real shipped code rather than
reasoned about, and each fixed in place with what it used to say: the `productSkuRules()` name and
shape, the unapproved `app/Support/` base folder, `ProductAttributeValue::type()` already existing,
the D-12 deferral, the missing two-pass validation shape, `SyncProductAttributeValues`' event-free
rename branch and its `23000`-vs-`1451` catch, the in-use guard's ordering against the gate, and the
batch cap's computation. Two non-blocking reservations were also closed: **V-15**/**V-P**'s "0024 and
0028 are specs, not code" framing is retired (both are in `done/`), and the missing story-0028 entry
in [`_digests/epic-2.md`](../_digests/epic-2.md) is **flagged rather than written** — that file is
`docs-keeper`'s, appended at each story's Phase 6/7 per
[workflow.md](../../../docs/workflow.md#decision-digest-per-epic), not `product-owner`'s to author.

### Amendment — 2026-08-19: four contract gap-fills, and the cartesian generator

Two unrelated things landed on the same day and are kept separate here, because one is bookkeeping and
the other is scope. Neither came from a new Three Amigos round: the first is 0031 reporting back from
the screen it built on this contract, the second is a PO decision.

**Part 1 — four contract gaps, filled.** Story **0031** was debated on 2026-08-19 against this
document and found four places where this story decided something and then never wrote it down, raised
as [its OQ-3](../0031-product-variants-editor-ui.md#open-questions). All four are **specification, not
new decisions**, and all four are answered as 0031 recommended:

| 0031's gap | Answer | Where |
| --- | --- | --- |
| (a) The bag key for `derived_sku_empty_segment` / `derived_sku_too_long` is unspecified | **`sku`**, shared by all four SKU refusals and distinguished by translation key. The complete six-key table is now the contract | **D-15** |
| (b) `ProductVariantValidationRules` has no `variantFeaturedMediaIdRules()` | Added, plus the trait written out in full — seven methods, all entity-prefixed, still with **no** SKU rule | **D-16** |
| (c) The action signatures were never written down | All four fixed, with named scalars over an array bag and `string $price` | **D-17.1** |
| (d) `ProductAttributeValue`'s relation to its type is unnamed | **`type()`**, together with every other relation this document referred to in prose — `Product::variants()`, `ProductVariant::product()/values()/featuredImage()`, `ProductAttributeValue::variants()` | **D-17.2** |

Gap (a) additionally produced **FP17** and **R-Q**: three refusals sharing one bag key is deliberate
and it means a test asserting the exception class, or even the key, cannot fail against the wrong
message.

**Part 2 — the cartesian generator, a decided scope expansion.** The PO decided this story also ships
a **bulk "generate all combinations" action**. This **reverses** a scope fence
(*"No cartesian-product 'generate all combinations' bulk builder"*) and **partially answers OQ-5** —
generator yes, `product_product_attribute_type` declaration table no. Specified in **D-18**:
`GenerateProductVariantCombinations::__invoke(Product, array $productAttributeTypeIds): array`, one
outer transaction with each `CreateProductVariant` call as a savepoint, existing combinations
**skipped without being touched**, SKU collisions **refused by name** while the rest commits, an
unexpected failure rolling the whole batch back, a `MAX_COMBINATIONS = 200` cap checked before any
write, and a `created`/`skipped`/`refused`/`attempted` summary the UI renders as a result table.

Four sub-decisions the PO's instruction did not settle, each made explicitly rather than smuggled in:
**(1)** the return is a summary array, not a bare `Collection`, because a collection of created rows
cannot express *"8 created, 2 already existed"* — which is the sentence the administrator has to read;
**(2)** a generated variant takes the **parent product's price**, because "leave it at the column
default" is not available (`price` is NOT NULL with no default) and **D-6** already promised the UI
would pre-fill from the parent — raised as **OQ-20**; **(3)** the cost control is a **cap**, not a
faster write, with bulk `insert()`, queueing and dropping the transaction each refused for a reason
that is not performance — raised as **OQ-19** for the constant only; **(4)** a selected attribute type
with **no values** is refused loudly, because the cartesian product of an empty set is empty and would
otherwise report a silent, successful-looking `attempted: 0`.

**On the classification.** `includes database-expert` stays **yes** and the generator is **not** why —
the [Type](#type) section now states the reasoning point by point rather than asserting it: no table,
column or FK; no new index, because the one new read (*"which combinations does this product already
have"*) is a covering scan on the existing `unique(product_id, combination_hash)` and answers the whole
batch in **one** query; and no chunked bulk insert, refused on `HasUuids`, on the un-batchable
cross-table SKU lock and on this repo's write-through-instances rule rather than on speed. The residual
is a lock-hold window (**R-O**), whose control is the cap and not an index. The named condition under
which the classification reopens is recorded in the same place.

**What changed in this document**: the Description and [Type](#type) blocks; a new Gherkin feature
(eight scenarios); four new decisions (**D-15**–**D-18**); the cartesian scope fence struck through
and replaced; four rows added or amended in the files tables (the new action, the model/trait
cross-references, `ProductAttributeValue::type()`, three `products.variants.generate.*` translation
keys); one new test file with fifteen cases; three new false passes (**FP17**–**FP19**); three new
risks (**R-O**, **R-P**, **R-Q**); seven acceptance criteria; two Definition-of-Done bullets, one of
which is an **execution** obligation (the savepoint gap-lock probe, deliberately not guessed here);
**OQ-5** marked partially answered; and three new open questions (**OQ-19**–**OQ-21**).

**Total open questions: twenty-one**, of which **OQ-1 is answered** and **OQ-5 is half-answered**.
**Recorded dissents remain four**, unchanged — nothing in this amendment touches DIS-1 through DIS-4,
though **DIS-3**'s point sharpens: `app/Actions/Products/` now ships an **eleventh** zero-call-site
action.

---

> **Link-integrity note for whoever moves this file.** Every relative link above is written for
> `ai-spec/tasks/` (two levels below the repo root). Moving this file to `in-progress/` or `done/`
> puts it **three** levels down and silently breaks all of them — `../../docs/...` must become
> `../../../docs/...`, and the sibling-task links (`0024-...md`) must become `../0024-...md`. This is
> a mandatory step, not a nicety: see
> [workflow.md](../../../docs/workflow.md#link-integrity-check-on-every-stage-move) and the
> [errors-log entry](../../../docs/errors-log.md) recording the six `done/` files this already broke.
