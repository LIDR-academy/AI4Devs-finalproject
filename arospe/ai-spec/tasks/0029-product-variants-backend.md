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
>    one, raised as [its OQ-3](0031-product-variants-editor-ui.md#open-questions). They are all
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
>    **[D-18](#d-18--the-cartesian-combination-generator)**.
>
> The classification does **not** change — see [Type](#type) for the reasoning, which is stated rather
> than asserted because "creates hundreds of rows" reads like a database question and is not one here.

It is **backend only** — no screen, no route, no Livewire component. The variant-builder UI is the
paired story **0031**. Defining the attribute types and values themselves is already built by
**0028**.

Covers [PRD](../../docs/PRD/PRD.md#22-products) §2.2's *"Create a variant as an attribute
combination"*, *"A variant without its own image inherits the parent's featured image"*, *"A variant
with its own image uses that image"*, *"A duplicate attribute combination is rejected"*, and the
**"a variant"** example of *"Scenario Outline: A duplicate SKU is rejected"* — i.e. Products
acceptance criteria **3** and **4**.

## Type
backend | fullstack (related_task_id: **0031** — variant builder UI, debated 2026-08-19) | includes
database-expert: **yes**

> 🟣 **2026-08-19 — classification restated after the generator was added, with the reasoning
> written out rather than asserted.** `includes database-expert: **yes**` is **unchanged**, and it was
> already `yes` for the reason that still holds: this story creates two tables, two unique indexes and
> a `restrictOnDelete()` FK contract inherited from 0028. **The generator itself adds nothing to that
> list**, and the temptation to conclude otherwise is worth answering point by point, because
> "one action writes hundreds of rows" *sounds* like a schema question:
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
> [`tests/Pest.php`](../../tests/Pest.php),
> [`tests/Feature/Users/IndexTest.php`](../../tests/Feature/Users/IndexTest.php), `docs/testing/**`
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
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

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

Feature: Generating every attribute combination at once

  Scenario: Generating combinations creates one variant per combination
    Given a catalog administrator, with the product "0002" offering the types Talla (38, 39, 40) and Color (Black, White), and no variants yet
    When they generate the combinations for the types Talla and Color
    Then six variants are saved against that product

  Scenario: Generating for a single attribute type creates one variant per value
    Given a catalog administrator, with the product "0002" offering the type Talla (38, 39, 40) and no variants yet
    When they generate the combinations for the type Talla alone
    Then three variants are saved against that product

  Scenario: Each generated combination derives its SKU by the ordinary formula
    Given a catalog administrator, with the product "0002" offering the types Talla (38, 39) then Color (Black), in that position order
    When they generate the combinations for the types Talla and Color
    Then the variants are stored with the SKUs "0002-38-Black" and "0002-39-Black"

  Scenario: A generated variant takes the parent product's price and no stock
    Given a catalog administrator, with the product "0002" priced at 19.99 offering the type Talla (38, 39)
    When they generate the combinations for the type Talla
    Then every generated variant carries the price 19.99 and the stock 0

  Scenario: Generating again skips the combinations that already exist
    Given a catalog administrator, with the product "0002" offering Talla (38, 39, 40) and already holding the Talla 38 variant
    When they generate the combinations for the type Talla a second time
    Then two variants are created and one is reported as already existing
    And the product still holds exactly one Talla 38 variant

  Scenario: A generated combination whose derived SKU is taken is reported, not created
    Given a catalog administrator, with the product "0002" offering Talla (38, 39) and another product already using the SKU "0002-39"
    When they generate the combinations for the type Talla
    Then one variant is created and the Talla 39 combination is reported as refused, naming the conflicting product

  Scenario: A generation larger than the batch limit is refused before anything is written
    Given a catalog administrator, with a product whose selected attribute types would produce more combinations than the batch limit allows
    When they generate the combinations for those types
    Then the generation is rejected with a validation message stating the limit
    And no variant is created for that product

  Scenario: An attribute type with no values contributes nothing to generate
    Given a catalog administrator, with the product "0002" offering the type Talla (38, 39) and the type Color with no values
    When they generate the combinations for the types Talla and Color
    Then the generation is rejected with a validation message naming the empty attribute type

Feature: Attribute values in use by variants cannot be removed

  Scenario: Deleting an attribute value in use by a variant is hard-blocked with a count
    Given a catalog administrator, with the value "40" of the type "Size" used by 7 variants
    When they try to delete the value "40"
    Then deletion is blocked with a message stating that 7 variants use it
    And no confirm-and-proceed path is offered

  Scenario: Deleting an attribute type whose values are in use is hard-blocked with a count
    Given a catalog administrator, with the type "Size" whose values are used by 12 variants
    When they try to delete the type "Size"
    Then deletion is blocked with a message stating that 12 variants use it
    And "Size" is still in the attribute type list

  Scenario: Deleting an attribute value used by no variant still works
    Given a catalog administrator, with the value "41" of the type "Size" used by no variant
    When they delete the value "41"
    Then "41" is removed from the type's value list

  Scenario: An administrator without the products permission cannot manage variants
    Given a signed-in administrator who does not hold the products management permission
    When authorization to manage a product's variants is evaluated for them
    Then the action is refused
```

## Documented functional decisions

### D-1 — Domain artifacts only; no Livewire component, route or view

0024's **D-1** precedent applies verbatim and for the same distinguishing reason: 0019 shipped a
component class because its media gallery is **modal-only with no route**, so the component class
was the only server surface a consumer could reach. Variants have an ordinary builder screen coming
in **0031**, so no such forcing function exists.

Consequence, stated plainly: like 0024 and 0023 before it, this story ships **no enforcement path**
for variant CRUD — the actions do not self-authorize (**D-12**). That is a hand-off recorded in the
Definition of Done, not an oversight.

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
// app/Support/VariantCombination.php
/** @param  array<int, string>  $productAttributeValueIds  ids ALREADY READ BACK FROM THE DATABASE */
public static function hash(array $productAttributeValueIds): string
{
    $canonical = collect($productAttributeValueIds)->unique()->sort(SORT_STRING)->values()->implode('|');

    return hash('sha256', $canonical);   // 64 lowercase hex chars
}
```

> 🔴 **The single highest-risk line in this story, and it is invisible on inspection (V-10).** The
> ids fed to `hash()` **must be read back out of the database**, never taken from the client's
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
   then for every row assert `combination_hash === VariantCombination::hash($row->values->pluck('id')->all())`.
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
[signed-link-verification.md](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
sets:

```php
try {
    return DB::transaction(function () use ($product, $valueIds, $attributes): ProductVariant {
        $variant = ProductVariant::create([
            ...$attributes,
            'combination_hash' => VariantCombination::hash($valueIds),
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
// app/Support/VariantSku.php
public const MAX_LENGTH = 128;

/** One attribute value, rendered as one SKU segment. Casing is preserved on purpose (PO rule). */
public static function segment(string $value): string
{
    $ascii = Str::ascii(trim($value));                          // 'Marrón' -> 'Marron'
    $hyphenated = (string) preg_replace('/\s+/u', '-', $ascii); // the PO's rule; a run collapses to one
    $safe = (string) preg_replace('/[^A-Za-z0-9._\/-]/', '', $hyphenated);

    return trim((string) preg_replace('/-{2,}/', '-', $safe), '-');
}

/** @param  array<int, string>  $orderedValues  value STRINGS read back from the DB, in D-4.2 order */
public static function derive(string $productSku, array $orderedValues): string
{
    return collect($orderedValues)
        ->map(static fn (string $v): string => self::segment($v))
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
$sku = VariantSku::derive($product->sku, $orderedValues);

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

#### D-4.7 — What the amendment does *not* change

- **Every point in [What both experts agree on](#what-both-experts-agree-on--settled-not-open)
  below still stands**, unchanged: the problem is real (**V-5**), both per-table `UNIQUE(sku)`
  indexes ship and are global rather than product-scoped, triggers are unavailable (**V-2**),
  single-table inheritance is dead, and `CHECK` is unavailable (**V-K**).
- **0024's product-side canonicalisation is untouched** — an admin-typed product SKU is still
  `Str::upper(trim())` + `regex:/^[A-Z0-9][A-Z0-9._\/-]*$/`. Only the *derived* variant SKU
  preserves case (**OQ-14**).
- **0024's `skuRules()` still gains its second `Rule::unique('product_variants', 'sku')`** — case
  (a) is a product-side write, and nothing on the variant side can guard it. See below.
- **The `->ignore()` asymmetry trap shrinks to one side.** The variant side no longer calls
  `skuRules()` at all (there is no typed variant SKU to validate), so the `?string $productVariantId`
  ignore parameter exists only for the *self-exclusion during re-derivation*, computed
  server-side from the model. 0024's own `->ignore($productId)` is unchanged. **R-E** narrows
  accordingly.

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
> out in **D-4.5**; its layers 1 and 3 survive as the shared `skuRules()` amendment and the
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
[base-standards.md](../../docs/conventions/base-standards.md#uuid-primary-keys) says not to write —
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
[errors-log.md](../../docs/errors-log.md)'s `getOriginal()`/`getPrevious()` entry records, one hook
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
[schema.md](../../docs/database/schema.md#users) calls "the last-word guard behind the application
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
[livewire-authorization.md](../../docs/security/livewire-authorization.md); that obligation lands on
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
[signed-link-verification.md](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
says *"`lockForUpdate()` on the row you are writing does not serialise checks against other rows"* —
and that is exactly right about the case it documents, where
[`ConfirmEmailChange`](../../app/Actions/Users/ConfirmEmailChange.php) locks a `User` **by primary
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
string in this namespace. Amending the shared `skuRules()` covers the validation layer for both
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
| — | **no `SoftDeletes`** | 0024 **D-12** reason #1 with double force: `Rule::unique()` does not apply the soft-delete scope ([schema.md](../../docs/database/schema.md#soft-deletes)), so a trashed variant would permanently squat **both** its SKU *and* its `combination_hash` — "re-create the Size 40 / Black variant" would be refused with nothing in the UI able to explain why |

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
| a `ProductVariantSeeder` | against | Same reasoning as 0028 **D8**: variants are admin-defined, and seeding demo data reopens the production-reachability question [seeder-safety.md](../../docs/security/seeder-safety.md) settled |
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

**The in-use blocks 0028 deferred to this story.** 0028's **D7** wires
`product_attribute_types → product_attribute_values` as `cascadeOnDelete()`. So deleting a *type*
whose values back any variant produces: `type DELETE → InnoDB cascades to its values → each value's
delete hits the pivot's RESTRICT → the whole statement aborts with 1451`. Integrity holds, but the
administrator sees a raw FK violation instead of a message. 0028 built the seam for the fix —
`DeleteProductAttributeType` exists as its own action for exactly this, and
`#[Locked] public int $deletingTypeUsageCount = 0;` already sits in the component's public surface
awaiting one query. Those queries are:

```php
// variants affected if this TYPE were deleted (0028 D7's pre-check)
$count = DB::table('product_variant_values as pvv')
    ->join('product_attribute_values as pav', 'pav.id', '=', 'pvv.product_attribute_value_id')
    ->where('pav.product_attribute_type_id', $type->id)
    ->distinct()
    ->count('pvv.product_variant_id');

// variants affected if a single VALUE were deleted (0028's per-value in-use block)
$count = DB::table('product_variant_values')
    ->where('product_attribute_value_id', $value->id)
    ->count();   // the pivot PK makes (variant, value) unique, so no DISTINCT is needed
```

Both are **hard blocks with a count and no confirm-and-proceed**, per the product-category precedent
(0024b **D-14**) — including the `ValidationException` exception type and its rendering rationale.
0028 raised the type-level reading as its **Q3**; carried forward here as **OQ-7**.

> 🔴 **There are TWO 0028 code paths needing this guard, not one — and the second is easy to miss.**
> `backend-expert` found it and it is not in 0028's own D7, which anticipated only the type-delete
> path:
>
> 1. **`DeleteProductAttributeType`** — the path 0028 designed the seam for. **V-12** confirms by
>    execution that without a pre-check the administrator meets a raw `1451`: InnoDB evaluates the
>    pivot's RESTRICT while cascading type→values, and **nothing at all is deleted** (types and
>    values both survive). 0028's D7 raised this as an inference; it is now a verified fact.
> 2. **`SyncProductAttributeValues`' delete branch** (0028 **D4** step 5) — removing value "40" from
>    the Size type's *inline value list* currently issues a bare delete. If any variant uses it,
>    that is a raw `1451` surfacing from inside a diff, which violates **0028's own acceptance
>    criterion** that *"a duplicate surfaces as a validation error on the offending field, never as
>    an unhandled `QueryException`"* — the same principle covers an in-use refusal. The diff must
>    count usage **per value being removed** and refuse with a per-row validation error naming which
>    value is in use.
>
> Missing path 2 would ship a screen where the *documented* delete path is guarded and the
> *everyday* one 500s.

### D-11 — Primary key: UUID v7, citing assumption 19 directly

`product_variants` keys on a **UUID v7** string primary key via `HasUuids`, at both the migration
level (`$table->uuid('id')->primary()`, `foreignUuid(...)->constrained()`) and the Eloquent level.

Unlike 0019 (`media`) and 0028 (the attribute tables), **this story needs no policy-extension
argument.** PRD [assumption 19](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) names
*"Product Variants"* explicitly as one of the seven originally-enumerated UUID entities, and
[ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md) records it as still-future and greenfield.
Cite that directly; do **not** cite the general Epic-2 policy, which exists for entities the original
seven did not cover. `@property string $id`; **no** `$keyType` / `$incrementing` properties
([base-standards.md](../../docs/conventions/base-standards.md#uuid-primary-keys)).

This story is therefore one of the ones that lets `docs-keeper` shorten ADR 0001's "still future"
list rather than extend its scope.

### D-12 — Permissions reuse `products.*`; `ProductPolicy` covers variants; actions do not self-authorize

**No new module slug and no `RolePermissionSeeder` change.**
[authorization.md](../../docs/architecture/authorization.md) already records `products` as covering
"products, product categories **and variants**", and PRD line 474 lists the module as *"Products
(categories & variants)"*. 0028's **D6** settled this for the attribute taxonomy on the same basis.

**No `ProductVariantPolicy`.** 0024 ships `ProductPolicy`, and a variant is a product sub-resource
whose authorization question is always *"may this actor manage this product's catalog entry?"* —
there is no per-row distinction between two variants of the same product anywhere in the PRD. This
follows 0028's **D6** reasoning ("a policy would add an allow/deny matrix that every method answers
identically") while staying consistent with 0024, because the ability object 0031's per-row UI hints
need already exists on `ProductPolicy` and takes the **parent product** as its target. Gate variant
operations against the parent: `Gate::authorize('update', $variant->product)`.

> ⚠️ **This decision rests on a premise that was withdrawn on 2026-09-01, and 0029 must re-decide it
> before Phase 3.** The paragraph below says the actions do not self-authorize *"per 0024's
> **D-15**/**RQ-10** (`CreateUser`/`UpdateUser` … authorize at the caller)"*. **That parenthetical is
> false** — `App\Actions\Users\CreateUser::__invoke()` opens with
> `$this->logRefusedPrivilegedAttempt->authorize('create', User::class);` and `UpdateUser` carries
> seven such calls — and [0024](done/0024-products-core-crud-backend.md) **reversed its own D-15/RQ-10** at
> its split on exactly that finding (its **C-1**): its four product actions now self-authorize, and
> `ProductPolicy` ships with real call sites. The **documented** convention
> ([base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers))
> is that the check lives in the class performing the operation, with 0023's `ProductCategories/`
> actions the sole explicitly-flagged exception. `backend-qa`'s dissent below was **right**, and was
> adopted in 0024. **Recorded here rather than re-decided**: whether 0029's variant actions follow
> 0024's reversal is 0029's own Phase 1/2 call, but it can no longer be settled by citing 0024.

**The actions do not self-authorize**, per 0024's **D-15**/**RQ-10** (`CreateUser`/`UpdateUser` and
0023's actions all authorize at the caller). Consequence, stated as 0024 required: **this story ships
no enforcement path for variant CRUD**, and that is a deliberate hand-off to **0031**, recorded in the
Definition of Done rather than left as a footnote. `backend-qa`'s standing dissent on this pattern
(recorded at 0023 **D-9** and 0024 **D-15**) is not re-litigated here, but it is not withdrawn either.

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

Deliberate omissions, following [schema.md](../../docs/database/schema.md)'s habit of documenting
*absent* indexes: **no `index('product_id')`** (covered as the composite unique's leading prefix —
0024 **D-10**, and the `users_uuid_unique` debt in [errors-log.md](../../docs/errors-log.md)); **no
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
> [its OQ-3](0031-product-variants-editor-ui.md#open-questions) — none of them is a new decision, each
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
| `attributeTypeIds` | `GenerateProductVariantCombinations` (**D-18**) | the type-id array: absent, empty, duplicated, unknown, a selected type with **no values**, or a cartesian product exceeding the batch cap |

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
([naming.md](../../docs/conventions/naming.md#traits-and-their-methods)), and **every leaf method is
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
| `variantAttributeTypeIdsRules()` | `attributeTypeIds` (**D-18**) | `['required', 'array', 'min:1', 'max:5']` |
| `variantAttributeTypeIdRules()` | `attributeTypeIds.*` (**D-18**) | `['string', 'distinct', Rule::exists('product_attribute_types', 'id')]` |

**No `skuRules()`, and no variant SKU rule of any kind** — unchanged from the original files table, and
now load-bearing for a second reason: 0031 OQ-3(b) notes that the alternative it was weighing
(composing 0024's whole `ProductValidationRules` just to reach `featuredMediaIdRules()`) would put
`skuRules()` in reach of a component that must never validate a SKU. Adding the one method here is
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
  `VariantSku::MAX_LENGTH = 128` (**D-4.4**), which refuses an over-long derivation with a message
  naming the length. Ten axes on one variant is already nonsense; the number is deliberately generous
  so it never refuses a legitimate catalog and never becomes the *reason* a variant is rejected.
- **`max:5` on the type-id array** (**D-18**) is the same kind of bound one level up, and it interacts
  with the batch cap: five types of four values each is already 1,024 combinations, so the cap
  (**D-18.5**) is what actually refuses that, with a clearer message.

### D-17 — Action signatures and named relations

0031 OQ-3(c) and (d). Both gaps are the same shape: this story describes these classes in prose and
never declares them, so two stories would each invent a signature and only discover the mismatch in
Phase 3.

#### D-17.1 — The four action signatures

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
    ?string $featuredMediaId = null,
    ?int $position = null,
): ProductVariant

// app/Actions/Products/DeleteProductVariant.php
public function __invoke(ProductVariant $variant): bool

// app/Actions/Products/GenerateProductVariantCombinations.php — D-18
public function __invoke(Product $product, array $productAttributeTypeIds): array
```

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

**None of these actions authorizes** — **D-12**, unchanged. The signatures take a `Product` /
`ProductVariant` the caller has already resolved *and already gated*.

#### D-17.2 — Every relation, named, with its return type

Prose in this document refers to `Product::variants()`, `ProductVariant::values()` and
`ProductAttributeValue::variants()` without ever declaring them, and 0028 declares its value→type
relation as a bare `belongsTo(ProductAttributeType::class)` with no method name at all. All of them,
fixed here. PHPDoc follows 0024's shape verbatim (`@return HasMany<Product, $this>`), which already
passes Larastan level 7.

| Model | Method | PHPDoc | Notes |
| --- | --- | --- | --- |
| `Product` *(0024's file)* | `variants(): HasMany` | `@return HasMany<ProductVariant, $this>` | **Ordering is declared inside the relation** — `->orderBy('position')->orderBy('sku')` — never at the call site (**D-8**). The `sku` tiebreak is total because `sku` is `UNIQUE NOT NULL` |
| `ProductVariant` | `product(): BelongsTo` | `@return BelongsTo<Product, $this>` | NOT NULL FK; never nullable in practice |
| `ProductVariant` | `values(): BelongsToMany` | `@return BelongsToMany<ProductAttributeValue, $this>` | `belongsToMany(ProductAttributeValue::class, 'product_variant_values')`. **Read-only — see below** |
| `ProductVariant` | `featuredImage(): BelongsTo` | `@return BelongsTo<Media, $this>` | on `featured_media_id`; **nullable, and the null *is* the inheritance flag** (**D-7**) |
| `ProductAttributeValue` *(0028's file)* | `variants(): BelongsToMany` | `@return BelongsToMany<ProductVariant, $this>` | the reverse of `values()`; what the per-value in-use count reads through (**D-10**) |
| `ProductAttributeValue` *(0028's file)* | ✅ `type(): BelongsTo` | `@return BelongsTo<ProductAttributeType, $this>` | **0031 OQ-3(d)**, answered as recommended. 0028 specifies the relation but never names the method; this story already modifies that model (**Files → Modifies**), so naming it here costs nothing and stops 0031 and 0030 each inventing one. `values.type` is the eager-load path 0031 **D-6** needs |
| `ProductVariant` | `label(): string` | — | Not a relation: the derived *"Talla M / Color azul marino"* string, an accessor over the eager-loaded pivot ordered by `(type.position, value.position)` (**D-9**). It reads `values.type`, which is why the relation above must exist and must be eager-loaded |

🔴 **`values()` is a read relation and must stay one.** **D-3**'s single-writer argument depends on it:
the pivot is written **only** by `CreateProductVariant`, inside its transaction, alongside the hash.
Do not add a public `syncValues()` / `attachValue()` / `detachValue()` surface, and do not reach for
`$variant->values()->sync(...)` from a component — the hash would not follow, and
`unique(product_id, combination_hash)` would start guarding a stale value (**R-B**). This is the same
reasoning `base-standards.md` gives for keeping the behaviour on `User::delete()` and every call site
on instances.

### D-18 — The cartesian combination generator

> 🟣 **This is a deliberate scope expansion, decided by the PO on 2026-08-19**, and it **reverses**
> this document's previous scope fence (*"No cartesian-product 'generate all combinations' bulk
> builder unless OQ-5 says otherwise"*). It partially answers **OQ-5**: the **generator ships here**;
> the `product_product_attribute_type` **declaration table still does not** (OQ-5a's half that
> survives). It also converts 0031's **D-3** from a scope fence with a named backend cost into a
> shipped dependency — 0031 named the missing piece precisely (*"one transaction, all-or-nothing, or
> an explicitly specified per-row outcome contract"*), and this section is the second of those two.

An administrator with a product offering Talla (38, 39, 40) and Color (Black, White) can generate all
**six** combinations in one action instead of building six variants by hand.

#### D-18.1 — Signature and return shape

```php
// app/Actions/Products/GenerateProductVariantCombinations.php
/**
 * Create one variant per combination in the cartesian product of the given types' values,
 * skipping combinations the product already has.
 *
 * @param  array<int, string>  $productAttributeTypeIds
 * @return array{
 *     created: \Illuminate\Support\Collection<int, ProductVariant>,
 *     skipped: array<int, array{value_ids: array<int, string>, label: string}>,
 *     refused: array<int, array{value_ids: array<int, string>, label: string, sku: string, message: string}>,
 *     attempted: int,
 * }
 *
 * @throws \Illuminate\Validation\ValidationException  on attributeTypeIds (D-15)
 */
public function __invoke(Product $product, array $productAttributeTypeIds): array
```

**Why a summary array and not a bare `Collection<ProductVariant>`.** The bare collection is the
obvious signature and it cannot express the outcome: *"8 created, 2 already existed"* is the sentence
the administrator must read, and a collection of 8 rows is indistinguishable from a collection of 8
rows where nothing was skipped. 0031 asked for exactly this — an *"explicitly specified per-row
outcome contract (`created` / `skipped_existing` / `refused` + reason) the UI can render as a result
table"* — so the shape is the contract, documented as a PHPDoc array shape per
[code-style.md](../../docs/conventions/code-style.md#phpdoc-array-shapes-over-inline-comments).
`created` stays a `Collection` of real models so the caller can render them without re-querying;
`skipped` and `refused` carry the value-id set plus the human-readable `label()` so the UI never has
to reconstruct which combination a row refers to.

#### D-18.2 — Outcome semantics: skip silently in the data, report loudly in the summary

**Decision: an already-existing combination is skipped and *reported*, never silently dropped and
never an abort.** Three outcomes, and no fourth:

| Outcome | When | Effect |
| --- | --- | --- |
| `created` | the combination is new and its derived SKU is free | one variant row + N pivot rows, exactly as `CreateProductVariant` writes them |
| `skipped` | the product already holds this exact combination | nothing written for that combination; the existing variant is **not** touched, re-priced or re-derived |
| `refused` | the derived SKU collides (**D-4.5** case (a), (b) or (c)) | nothing written for that combination; the collision message — which already names the conflicting record — is carried out in the summary |

**"Skip existing" is the correct semantic and the alternative is worse.** Refusing the whole batch
because one combination exists would make the generator useless for its most common real use — *"I
added a new colour, generate the rest"* — which is precisely the second run over a partially-built
product. And the skip is safe in a way an update would not be: it never overwrites a price or stock
an administrator has already set on the existing variant.

**Transaction shape, and the answer to 0031 D-3's objection.** The whole batch runs inside **one**
`DB::transaction()`, and each combination goes through the ordinary `CreateProductVariant`, whose own
`DB::transaction()` therefore becomes a **savepoint**. That is the property that makes this work:

- A per-combination `ValidationException` (a SKU collision, or a lost race on the combination index)
  rolls back **only that savepoint**, so the batch continues and the failure lands in `refused` /
  `skipped` instead of destroying the other 199 rows.
- An **unexpected** exception propagates past the outer transaction and rolls back the entire batch,
  so there is no half-built catalog from a bug or a connection drop. This is the half of 0031 **D-3**
  point 3's worry that is real, and it is closed.
- 0031's other worry — *"nests savepoints around six actions that each open their own transaction"* —
  is answered rather than dismissed: nesting is exactly the mechanism, not an accident of it. What it
  does cost is the lock-hold window, which is **R-O** and is bounded by the cap in **D-18.5** rather
  than wished away.

🔴 **One thing Phase 3 must verify by execution, not by reading**: whether the `X,GAP` locks
**V-H** describes, taken inside a savepoint that is then rolled back, are released at that rollback or
held to the end of the outer transaction. The batch is correct either way — the difference is only how
much of the SKU namespace it blocks for how long — but the answer changes what the cap should be, and
this document does not guess it. Recorded in the Definition of Done.

**Duplicate detection is one query for the whole batch, not one per combination.** Read every existing
`combination_hash` for the product up front, inside the transaction, and compare each candidate's
`VariantCombination::hash()` against that set in PHP:

```php
$existing = DB::table('product_variants')
    ->where('product_id', $product->id)
    ->pluck('combination_hash')
    ->flip();            // O(1) membership, N combinations cost ONE read
```

This is served as a covering scan by `unique(product_id, combination_hash)` (**D-14**) — the reason
[Type](#type) can say the generator introduces no new access pattern. It is a **pre-check, not a race
guard**: the unique index remains the last word, and a combination that loses the race between the
pre-read and its own insert surfaces as `23000` on `(product_id, combination_hash)` and is recorded as
`skipped` — which is the truthful outcome, since by then it genuinely does exist.

#### D-18.3 — The SKU is derived exactly as for any other variant, with no special case

A generated variant's SKU comes from `VariantSku::derive()` via `CreateProductVariant`, in **D-4.2**'s
`(type.position, type.id, value.position, value.id)` order, with **D-4.4**'s `segment()` applied
unchanged. There is no batch-specific formula, no counter suffix, and no de-duplication pass.

This is not merely "consistent" — it is what keeps **D-4.3**'s global consistency test meaningful. The
moment the generator writes a SKU any other way, that test either has to exclude generated rows (and
so stops covering most of the catalog) or fails for a reason unrelated to the code under test — the
**FP13** trap one layer over, and the usual response to it is to weaken the assertion.

Two consequences that follow for free and are worth stating so nobody re-solves them:

- **Collision case (b)** — two of the *generated* values reducing to the same segment (`azul marino`
  and `azul-marino` on one product) — is caught by the same **D-4.5** existence check as any other
  create, so the second one is `refused` with the message naming the first. The generator adds no new
  collision class.
- **Re-derivation (D-4.6) applies to generated variants identically.** They are ordinary rows; a later
  parent-SKU change or value rename rewrites them along with everything else.

#### D-18.4 — Price and stock at generation time

**Decision: the generator asks for neither. Each generated variant takes the parent product's `price`
and a `stock` of 0, both editable per-variant immediately afterwards.**

The instinct — *"leave price and stock at the column defaults"* — is right about stock and **not
available** for price: `product_variants.price` is `decimal(10,2)` **NOT NULL with no default**
(**D-6**), so there is no default to leave it at. The three real options:

| Option | Verdict |
| --- | --- |
| ✅ **Copy the parent product's `price`; `stock` = 0** | **Recommended and chosen.** **D-6** already names this exact behaviour as the answer to the NOT NULL column's ergonomic cost (*"the builder pre-fills each variant's price from the parent at creation"*) — the generator simply does in the action what **D-6** said the UI would do for one variant. `stock = 0` is the column default and is honest: no physical unit of a just-invented combination exists yet |
| Require the caller to pass one price applied to every generated row | Rejected as the default. It is a strictly worse version of the above (the caller's only sensible value *is* the parent's price) and it puts a required money input in front of a gesture whose whole point is speed |
| Ask for a price per combination at generation time | Rejected outright. Asking for N prices before the combinations exist is the UX problem the generator exists to remove, and it is 0031's concern regardless — the per-variant editor already handles it, one row at a time, afterwards |

`featured_media_id` is left **NULL**, which is not a default but the inheritance flag itself
(**D-7**) — a generated variant shows its parent's image until someone gives it one, which is the
correct behaviour and needs no decision.

Raised as **[OQ-20](#open-questions)** for confirmation, and note the coupling: if **OQ-2** ever flips
`price` to nullable-and-inheriting, this decision collapses into "leave it NULL" and this subsection
disappears rather than changing.

#### D-18.5 — The batch cap, and why the cost control is a limit rather than a faster write

**Decision: refuse the whole call, before writing anything, when the cartesian product exceeds
`GenerateProductVariantCombinations::MAX_COMBINATIONS = 200`**, with a `ValidationException` on
`attributeTypeIds` naming both the limit and the number that was attempted.

The cap is checked **after** the value sets are read and multiplied out and **before** the transaction
opens, so an over-large request costs one read and writes nothing. 200 is chosen against real catalog
shapes: 5 sizes × 8 colours is 40, and 5 × 8 × 5 materials is 200 — so the cap sits exactly at the
top of what a clothing catalog plausibly generates in one gesture, while 5 types × 4 values (1,024) is
comfortably refused. **[OQ-19](#open-questions)** carries the exact number for confirmation; the
mechanism is not in question, only the constant.

**Why a cap rather than making the write faster.** The three "make it scale" moves were considered and
all three are refused for reasons that are not about speed:

- **A chunked `insert()` of all rows at once** bypasses `HasUuids` (no keys generated), bypasses the
  per-row cross-table SKU check (**D-4.5**, a locking read against a *different* table that cannot be
  batched), and writes a model this repo requires to be written through instances.
- **Queueing the batch** turns a synchronous gesture into one with no result to render, which
  contradicts **D-18.1**'s whole summary contract, and this project has no queue worker running
  outside `QUEUE_CONNECTION=database`'s default sync-in-tests posture.
- **Dropping the outer transaction** to shorten the lock window re-creates the half-built catalog with
  no undo that 0031 **D-3** point 3 correctly refuses.

What actually scales here is doing less work, and the cap is that.

#### D-18.6 — Input rules and the ordering of what gets generated

- **The selected types need not be "offered by" the product** — there is no declaration table
  (**OQ-5a**'s surviving half), so any existing attribute type may be selected. The generator neither
  reads nor writes any notion of a product's declared axes.
- **A selected type with zero values is refused**, on `attributeTypeIds`, naming the type. Left
  unchecked, the cartesian product of anything with an empty set is **empty**, so the action would
  silently create nothing and report `attempted: 0` — an outcome indistinguishable from success and
  certain to be read as a bug. Fail loudly instead.
- **Duplicate and unknown type ids are refused by D-16's rules** (`distinct`, `Rule::exists`), with
  the same **V-10** caveat: the type ids and their values are **read back from the database**, and the
  cartesian product is built from that read-back, never from the payload.
- **Iteration order is types in `(position, id)` order, values in `(position, id)` order, with the
  last type varying fastest** — 38-Black, 38-White, 39-Black, 39-White, 40-Black, 40-White. This is
  the same ordering **D-4.2** uses for the SKU, so the generated list reads in SKU order, and it is
  what `position` is assigned from: each created variant takes `MAX(position) + 1` scoped to the
  product in that sequence (**D-8**), so a freshly generated set lands in the natural order rather
  than in whatever order the inserts happened to complete.

#### D-18.7 — What the generator deliberately does **not** do

| Considered | Verdict |
| --- | --- |
| A **dry-run / preview** seam (*"show me which rows would succeed before writing"*) | **Not here.** It is 0031's [OQ-5](0031-product-variants-editor-ui.md#open-questions) and it is a read-only seam over **D-4.5**'s query; the generator's own `skipped`/`refused` summary already tells the administrator what happened *after*. Recorded because 0031 asked for both and only one is shipped |
| **All-or-nothing** refusal of the batch on any collision | **Rejected** — see **D-18.2**. It defeats the "add a colour, generate the rest" case, which is the common one |
| **Updating** an existing combination's price/stock while generating | **Rejected, firmly.** A generator that silently re-prices variants an administrator has already tuned is a data-loss bug wearing a convenience label. Skipping is the whole point |
| A **delete-missing** / full-sync mode (*"make the variant set exactly this cartesian product"*) | **Rejected.** Variants are hard-deleted (**D-6**, no `SoftDeletes`) and carry stock; a sync that deletes is unrecoverable by construction |
| The `product_product_attribute_type` **declaration table** | **Still out of scope** — **OQ-5a**'s surviving half. The generator holds its axes transiently, as its parameters |
| A `ReorderProductVariants` action for the generated set | **Not here** (**D-17.1** point 5). The cartesian order **D-18.6** assigns is deliberately the useful one, which is what makes the absence tolerable |

### Scope fences: what this story must NOT do

- No Livewire component, route, Blade view, sidebar entry or browser test (**0031**).
- ~~No cartesian-product "generate all combinations" bulk builder unless **OQ-5** says otherwise.~~
  **Reversed 2026-08-19** — the generator **is** in scope now, as one backend action
  (**[D-18](#d-18--the-cartesian-combination-generator)**). What remains fenced out of it is narrower
  and is enumerated in **D-18.7**: no dry-run seam, no all-or-nothing batch, no re-pricing of existing
  combinations, no delete-missing sync mode, and still **no `product_product_attribute_type`
  declaration table** (OQ-5a's surviving half). The *UI* for the generator remains **0031**'s.
- No attribute type/value CRUD (0028) beyond adding the two in-use guards **D-10** specifies.
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
> (**D-4**), so no registry ships. One create is added in their place (`app/Support/VariantSku.php`),
> and `UpdateProduct`'s row grows the re-derivation cascade.

### Creates

| Path | What & why |
| --- | --- |
| `database/migrations/<ts>_create_product_variants_table.php` | **D-5**. `down()` is `Schema::dropIfExists('product_variants');` |
| `database/migrations/<ts+1>_create_product_variant_values_table.php` | **D-5**. Strictly later timestamp. Table name forced by **V-B** |
| `app/Models/ProductVariant.php` | `use HasFactory, HasUuids;`, `#[Fillable([...])]` **excluding both `combination_hash` and `sku`** (both server-derived — the same omission-as-guard rule `users.status` uses; **D-4.3**), `casts()` (`price` → `decimal:2`, `stock` → `integer`, `position` → `integer`), `product()`, `featuredImage()`, `values()` (read-only `BelongsToMany`, ordered), `displayFeaturedMediaId()`, `label()`. **No `SoftDeletes`**. **Every relation's exact signature and PHPDoc is in [D-17.2](#d-172--every-relation-named-with-its-return-type)** |
| `app/Support/VariantCombination.php` | The single `hash()` definition (**D-3**). A plain support class, not an action — it is a pure function with no dependencies and no side effects |
| `app/Support/VariantSku.php` | The single `derive()` / `segment()` definition and `MAX_LENGTH = 128` (**D-4.1**, **D-4.4**). Same shape and same reasoning as `VariantCombination` — a pure function, no dependencies, no side effects, **one** definition that `CreateProductVariant`, `UpdateProduct`'s cascade and 0028's value-rename cascade all call. A second copy of the formula anywhere is the defect this class exists to prevent |
| `app/Actions/Products/CreateProductVariant.php` | Owns the transaction, the read-back of ids **and value strings** (**V-10**), the ordered derivation, the combination check *then* the SKU check (**D-4.5**), the locking pre-check, the pivot write and the hash. Existing `app/Actions/Products/` subfolder (0024, 0028) |
| `app/Actions/Products/UpdateProductVariant.php` | `price`/`stock`/`featured_media_id`/`position` only — **never** the pivot, the hash, **or the SKU** (**D-13**, **D-4.3**). The SKU changes only through **D-4.6**'s cascades, which this action is not one of |
| `app/Actions/Products/DeleteProductVariant.php` | Thin today; exists as the single seam Epic 3's "a variant referenced by orders cannot be deleted" guard bolts onto — 0023 **D-10** / 0024's `DeleteProduct` reasoning |
| `app/Actions/Products/GenerateProductVariantCombinations.php` 🟣 | **New, 2026-08-19 (D-18).** The cartesian generator: one outer transaction, one pre-read of the product's existing `combination_hash` values, then one `CreateProductVariant` call per new combination (its transaction becomes a savepoint, so a per-row refusal does not destroy the batch). Owns `MAX_COMBINATIONS = 200` (**D-18.5**), the empty-type refusal, the iteration order (**D-18.6**) and the summary array shape (**D-18.1**). **It re-implements nothing** — not the derivation, not the hash, not the collision check; a second copy of any of those is the defect **R-L** names |
| `app/Concerns/ProductVariantValidationRules.php` | `<Noun>ValidationRules` per [naming.md](../../docs/conventions/naming.md#traits-and-their-methods). Flat, single-concern, `use`s no other trait. **Entity-prefixed leaf methods** where a name would collide — 0024's naming trap is live here, because a variant editor composing this alongside `ProductValidationRules` fatals on a duplicate method. `variantPriceRules()`, `variantStockRules()`, `variantCombinationRules()`. **No `skuRules()` and no variant SKU rule at all** — the variant SKU is derived, so there is no input to validate (**D-4.3**); the product-side `skuRules()` stays in 0024's trait. 🟣 **2026-08-19: written out in full, with three further methods, in [D-16](#d-16--productvariantvalidationrules-written-out-in-full)** — `variantCombinationValueRules()`, `variantFeaturedMediaIdRules()` (0031 OQ-3(b)) and the two `attributeTypeIds` methods **D-18** needs |
| `database/factories/ProductVariantFactory.php` | `product_id => Product::factory()` so a bare `->create()` stands alone. **The SKU must be derived, not faked**: default to `VariantSku::derive($product->sku, [$segment])` with a short unique `bothify()` segment, **never** `fake()->unique()->word()` (~1000-row `OverflowException`) and never a free-text SKU — a factory that writes an underived SKU makes **D-4.3**'s global consistency test unusable (**FP13**). States: `withCombination(array $valueIds)` (derives from the real values, in **D-4.2** order), `withOwnImage()`, `inheritingImage()`, `outOfStock()` |
| `tests/**` | Phase 3, `backend-qa` — see [Tests to perform](#tests-to-perform) |

### Modifies — including two other stories' shipped code

| Path | What & why |
| --- | --- |
| `app/Concerns/ProductValidationRules.php` **(0024's file)** | `skuRules()` gains the second `Rule::unique('product_variants', 'sku')` (**D-4.7**). Still required after the amendment: an admin-typed **product** SKU is the only remaining way a human can claim a string in this namespace (collision case **(a)**). The `?string $productVariantId` ignore parameter is **no longer needed** — nothing validates a typed variant SKU |
| `app/Actions/Products/CreateProduct.php` **(0024's file)** | Gains the locking pre-check across both tables, in the fixed lock order (**D-4.5**). Without it, "a product claiming a variant's derived SKU" is unguarded |
| `app/Actions/Products/UpdateProduct.php` **(0024's file)** | The same pre-check, **plus the re-derivation cascade** (**D-4.6**): a change to `products.sku` re-derives every one of that product's variants in the same transaction, re-checks each new value, and aborts the whole update on any collision. This is the single largest retrofit this story makes to another story's code |
| `app/Actions/Products/SyncProductAttributeValues.php` **(0028's file)** | *(second reason to touch this file — see also **D-10** path 2)* its **rename branch** must re-derive the SKU of every variant built on a renamed value (**D-4.6**), same transaction, all-or-nothing |
| `app/Models/Product.php` **(0024's file)** | Gains one method: `variants(): HasMany`, ordered `position ASC, sku ASC` (**D-8**) |
| `app/Actions/Products/DeleteProductAttributeType.php` **(0028's file)** | Gains the type-level in-use guard 0028's **D7** designed the seam for (**D-10** path 1) |
| `app/Actions/Products/SyncProductAttributeValues.php` **(0028's file)** | Gains the per-value in-use guard in its **delete branch** (0028 D4 step 5) — **D-10** path 2, the one 0028's own D7 did not anticipate |
| `app/Models/ProductAttributeType.php` **(0028's file)** | Gains `variantUsageCount(): int` — the real query behind the seam, `COUNT(DISTINCT variant)` not a pivot-row count |
| `app/Models/ProductAttributeValue.php` **(0028's file)** | Gains `variants(): BelongsToMany` through the pivot, **and names 0028's unnamed value→type relation `type(): BelongsTo`** (🟣 2026-08-19, 0031 OQ-3(d) — see **[D-17.2](#d-172--every-relation-named-with-its-return-type)**) |
| `App\Livewire\Products\AttributeTypes\Index` **(0028's file)** | `$deletingTypeUsageCount` gets its real query, replacing the always-`0` placeholder. One query, zero contract changes — exactly as 0028 designed |
| `lang/en/products.php`, `lang/es/products.php` | **Extend, never recreate** — 0024 creates this file (its **R-13** hand-off; 0028 was already amended the same way). New keys: `products.variants.duplicate_combination`; `products.variants.derived_sku_taken` (**must interpolate the derived `:sku` and name the conflicting record** — a derived SKU cannot be retyped, so a bare "already taken" leaves the administrator with no action, **D-4.5**); `products.variants.derived_sku_empty_segment` (naming the offending attribute value) and `products.variants.derived_sku_too_long` (**D-4.4**); `products.variants.parent_sku_change_collides` (**D-4.6**, naming the variant); `products.variants.value_in_use` and `products.variants.type_in_use` (both `trans_choice`, per 0024b **D-14**). 🟣 **2026-08-19, for D-18**: `products.variants.generate.empty_type` (naming the type), `products.variants.generate.too_many` (interpolating `:limit` and `:attempted`) and `products.variants.generate.summary` (a `trans_choice` over the created count, interpolating `:skipped` and `:refused`) — the last is the sentence 0031 renders, and it lives here rather than in 0031 because the *action* owns the outcome vocabulary. Key-for-key identical in both locales |
| `tests/Unit/ArchitectureTest.php` | One `expect()` **per namespace, never `expect([...])`** — that form is disjunctive and this repo has shipped one vacuous arch rule that way already (0024 **V-7**) |

### Explicitly **not** touched

`database/seeders/RolePermissionSeeder.php` (**D-12**) · `routes/web.php` · `app/Livewire/**` ·
`resources/views/**` · `tests/Browser/**` · `docs/**` (Phase 6) · anything belonging to 0026 (sales
regions), 0027 or 0031 (UI).

## Tests to perform

Backend only — this story ships no screen. `tests/Unit/` gets **no** database trait in this repo
(verified at [`tests/Pest.php`](../../tests/Pest.php), which binds `RefreshDatabase` to `Feature` and
`Browser` only), so anything needing a row is a Feature test even when integration-shaped. Do **not**
create `tests/Integration/`. Scaffold with `php artisan make:test --pest Products/CreateProductVariantTest`.

**Unit — `tests/Unit/Support/VariantCombinationTest.php`** (no DB)
- [ ] `hash()` is **order-independent**: the same id set in three different orders yields one hash.
- [ ] `hash()` is **duplicate-insensitive**: `[a, b, b]` and `[a, b]` yield the same hash.
- [ ] `hash()` **distinguishes** a subset from a superset: `[a]` ≠ `[a, b]`. This is the assertion that
      catches a "sum the ids" or "XOR the ids" implementation, both of which pass the first two.
- [ ] `hash()` returns 64 lowercase hex characters, and is **stable across calls** (no salt, no
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
- [ ] The persisted `combination_hash` equals `VariantCombination::hash()` of the pivot's real ids —
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

**Unit — `tests/Unit/Support/VariantSkuTest.php`** (no DB) — the formula itself

- [ ] The PO's four worked examples, as a dataset asserting the **literal** strings: `0001` + `M` →
      `0001-M`; `0001` + `S` → `0001-S`; `0002` + `azul marino` → `0002-azul-marino`; `0002` +
      `azul marino` + `L` → `0002-azul-marino-L`. These are the acceptance criterion in executable
      form and must be asserted exactly, never with `toContain`.
- [ ] **Casing is preserved**, both directions: `L` stays `L` and `azul marino` stays lowercase. A
      single assertion on an all-lowercase value cannot fail against an implementation that
      upper-cases, and vice versa — **both** are needed (**FP14**).
- [ ] `derive()` is **order-sensitive** — `[Color, Talla]` and `[Talla, Color]` produce *different*
      strings. This is the assertion that proves the ordering rule is load-bearing, and it is the
      exact opposite of `VariantCombination::hash()`'s order-independence test. Written next to a
      comment saying so, because the two look like a contradiction.
- [ ] `segment()` edge cases as a dataset: a whitespace **run** collapses to one hyphen
      (`"azul  marino"` → `azul-marino`, **not** `azul--marino`); leading/trailing whitespace is
      trimmed; `Marrón` → `Marron`; a character outside the safe set is stripped; a value that
      reduces to `''` is surfaced as such so the caller can refuse it.
- [ ] `derive()` is **pure and stable across calls** — the property that makes it safe to store.

**Feature — `tests/Feature/Products/ProductVariantSkuDerivationTest.php`** — the derivation in situ

- [ ] Creating a single-attribute variant persists exactly the derived SKU, asserted against the
      literal string in the database (`assertDatabaseHas`), not against a re-call of `derive()` —
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
- [ ] A derivation exceeding `VariantSku::MAX_LENGTH` is refused cleanly, not truncated and not a
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
      `VariantSku::derive()` of its *current* parent SKU and *current* ordered value strings. Run it
      **again after** a parent-SKU rename and after a value rename — that is what makes it a
      re-derivation regression net rather than a creation test.
- [ ] **The race, both directions**: a `Product::creating` hook inserting a colliding variant, and a
      `ProductVariant::creating` hook inserting a colliding product. Both must surface as a clean
      `ValidationException` on `sku`, never a 500 — the assertion that the **V-H** gap lock is
      actually being taken.

**Feature — `tests/Feature/Products/GenerateProductVariantCombinationsTest.php`** 🟣 *(new 2026-08-19, **D-18**)*

- [ ] **The count is the cartesian product**: 3 Talla values × 2 Color values generates exactly **6**
      variants and **12** pivot rows, on a product that had none. Assert both numbers — 6 variant rows
      with the wrong pivot cardinality is a real failure mode of a loop that mis-nests.
- [ ] **A single type** generates one variant per value (the N=1-axis case, which a nested-loop
      implementation can get wrong in the direction of generating nothing).
- [ ] **Every generated SKU is the ordinary derivation**, asserted as **literal strings** for the whole
      set (`0002-38-Black`, `0002-38-White`, …) — never by re-calling `derive()` (**FP15**). This is
      what pins **D-18.3**'s no-special-casing rule.
- [ ] **The `position` sequence follows D-18.6's iteration order**, asserted as an exact ordered array
      of SKUs read back through `Product::variants()` — not as a set (**FP8**).
- [ ] **Price and stock (D-18.4)**: every generated variant carries the parent's `price` as a
      **string** (`toBe('19.99')`, per **R-C**) and `stock === 0`, and `featured_media_id` is
      **literally NULL** so inheritance still applies (**D-7**).
- [ ] **The second run skips**: generate, add a value, generate again — the summary reports the right
      `created` and `skipped` counts, the pre-existing variants are **byte-identical afterwards**
      (assert their `updated_at`, price and stock are unchanged, not merely that the row still
      exists), and the product holds exactly one variant per combination.
- [ ] **A skip does not re-price.** Set a generated variant's price to something other than the
      parent's, re-generate, and assert the custom price survives. This is **D-18.7**'s "silently
      re-prices" bug, and nothing else in the suite can fail against it.
- [ ] **A SKU collision is `refused`, not fatal, and the rest of the batch still commits.** Arrange a
      product literally named `0002-39` (**D-4.5** case (a)), generate Talla 38/39/40, and assert:
      two variants created, one entry in `refused` whose message names the conflicting product, and
      **zero orphan pivot rows** for the refused combination (**FP1**'s shape at batch scale).
- [ ] **An unexpected failure rolls the whole batch back.** Register a `ProductVariant::creating` hook
      that throws a non-`ValidationException` on the third combination, and assert **zero**
      `product_variants` and **zero** pivot rows exist for that product afterwards. This is the only
      test that proves the outer transaction is real, and it is the one 0031 **D-3** point 3's
      half-built-catalog objection turns on.
- [ ] **The batch cap refuses before writing**: a type selection whose product exceeds
      `MAX_COMBINATIONS` throws `ValidationException` on `attributeTypeIds`, the message carries both
      the limit and the attempted count, and **zero rows** exist. Pair it with a boundary pair —
      exactly `MAX_COMBINATIONS` is accepted, one more is refused — or the test cannot distinguish a
      correct cap from an off-by-one.
- [ ] **A selected type with no values is refused** on `attributeTypeIds` naming the type, with zero
      rows written — **not** silently reported as `attempted: 0` (**D-18.6**).
- [ ] **Unknown, duplicated and empty type-id inputs** are refused, as a dataset, each on
      `attributeTypeIds` and each writing zero rows.
- [ ] **The pre-read is one query, and the batch does not N+1.** Count queries for a 6-combination
      generation after a throwaway warm-up call (**FP7**), and assert the existing-combination lookup
      does not scale with the combination count — the property **D-18.2**'s single `pluck` exists for.
- [ ] **The global consistency invariant (D-4.3) holds over generated rows too**: after a generation,
      every `product_variants` row's stored `sku` still equals the derivation of its current inputs,
      **with no exclusion for generated rows** (**FP13**'s rule, applied to the generator).
- [ ] **The race**: a `ProductVariant::creating` hook that inserts one of the batch's own combinations
      between the pre-read and its insert. The outcome must be a clean `skipped` entry — never a 500,
      never a duplicate — which is what proves the pre-read is treated as a pre-check and the unique
      index as the last word (**D-18.2**).

**Feature — `tests/Feature/Products/ProductVariantReferentialIntegrityTest.php`**

Driven by raw `DB::table(...)->delete()` where no application path exists yet — the same deliberate,
narrow exception to [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s
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

**Feature — `tests/Feature/Products/DeleteProductAttributeTypeTest.php`** (extends 0028's file)
- [ ] *Regression:* 0028's own delete tests stay green untouched — deleting an unused type still
      removes it and its values.
- [ ] Deleting a type whose values back N variants is blocked **and the type still exists**
      afterwards. A guard that threw *after* deleting would pass a throw-only test.
- [ ] **The count is correct** — dataset over N = 1, 2, 12, asserting the literal digits and not
      N±1. **Seed a decoy of 5 variants on a different type in every case**: without it,
      `ProductVariant::count()` and the scoped count are indistinguishable and the test cannot fail
      for the reason it exists.
- [ ] A variant using **two** values of the same type counts **once**, not twice — what the `DISTINCT`
      in **D-10**'s query is for, and it is invisible without a test.
- [ ] **No confirm-and-proceed path**, proven as 0024b **D-14** does: reflection on the signature,
      calling twice in succession, and **a `Super Admin` refused identically** (the strongest, because
      it proves the block is data integrity and not authorization).
- [ ] Singular/plural forms differ between N = 1 and N = 2 (`trans_choice`, **R-8** — still no
      precedent in `lang/`).

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

**FP15 — asserting the stored SKU by re-calling `derive()`.**
`expect($variant->sku)->toBe(VariantSku::derive(...))` is tautological against any bug that lives *inside* `derive()` — it passes even if the formula is
wrong, because both sides are wrong identically. The Feature tests assert **literal strings**; only
the Unit test may exercise `derive()` against expectations written by hand. (The one deliberate
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

**FP18 🟣 — a generator test asserting only the created count.** `toHaveCount(6)` is satisfied by an
implementation that skips nothing, refuses nothing and reports nothing — the summary is the contract
(**D-18.1**), not the row count. Assert the **whole shape**: `created`, `skipped`, `refused` and
`attempted` together, on a fixture that produces a non-empty value in each of the three lists at once.
A batch where nothing is skipped and nothing is refused cannot distinguish the three code paths.

**FP19 🟣 — the "second run skips" test asserting only that no duplicate was created.** The duplicate
would also be refused by `unique(product_id, combination_hash)` if the pre-read did not exist at all,
so a row-count assertion passes against a generator with no skip logic whatsoever — it would simply
report the skip as a refusal, or 500. Assert that the combination lands in **`skipped`** (not
`refused`), and that the pre-existing variant's own price, stock and `updated_at` are **unchanged** —
the untouched-row assertion is the only one that can fail against a generator that re-writes what it
finds.

### Test-arrangement notes for Phase 3

- `beforeEach` in authorization files: `app(PermissionRegistrar::class)->forgetCachedPermissions();`
  **then** `$this->seed(RolePermissionSeeder::class);` — both halves load-bearing (the seed because
  `can('products.view')` against an unseeded catalog throws `PermissionDoesNotExist`; the flush
  because `phpunit.xml` sets `CACHE_STORE=array`, which is per-**process**, and `RefreshDatabase`
  rolls the DB back without clearing it). **Never** flush between Act and Assert.
- Do **not** invoke the full `DatabaseSeeder` to arrange — it creates a `test@example.com` fixture
  user under `local`/`testing`.
- **Pin any config a test depends on**, including setting it to `null` when "unset" is the assumed
  state (the task-0003 lesson in [errors-log.md](../../docs/errors-log.md)).
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

Per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md): `HasUuids` itself; Eloquent
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

🟣 **An administrator can also build a product's whole variant set in one gesture.** Selecting the
attribute types Talla and Color generates the **full cartesian product** of their values — six
variants for 3 × 2 — each one an ordinary variant with an ordinary derived SKU, the parent product's
price, no stock and no image of its own. Running it again after adding a value creates only what is
missing: combinations the product already has are **skipped without being touched**, so a price
already tuned on an existing variant survives, and the action returns a summary — *created*, *skipped*,
*refused* — so the administrator is told *"8 variants created, 2 already existed"* rather than left to
count. A combination whose derived SKU collides is reported by name with the record it collided with,
and the rest of the batch still commits; an unexpected failure rolls the whole batch back, so there is
no half-built catalog. Batches larger than the cap are refused before anything is written.

Separately, the two in-use blocks story 0028 designed seams for are now real: deleting an attribute
value, or an attribute type, that any variant is built on is refused with a message naming the exact
count, at every privilege level.

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
      0024's shared `skuRules()`. All three of **D-4.5**'s collision cases are refused, each with a
      message naming the conflicting record.
- [ ] Updating a variant's price, stock, image or position leaves its SKU untouched.
- [ ] 🟣 **Every refusal throws on the bag key [D-15](#d-15--error-bag-keys-the-exact-key-every-refusal-throws-on)
      names** — `attributeValueIds`, `combination`, `sku`, `price`, `stock`, `featuredMediaId`,
      `attributeTypeIds` — with all four derived-SKU refusals sharing `sku` and distinguished only by
      their translation key, and every refusal test asserting the key rather than the exception class
      alone.
- [ ] 🟣 **`ProductVariantValidationRules` ships the seven methods
      [D-16](#d-16--productvariantvalidationrules-written-out-in-full) specifies**, all
      entity-prefixed, `use`ing no other trait, and **without any SKU rule**.
- [ ] 🟣 **The four actions carry the exact signatures
      [D-17.1](#d-171--the-four-action-signatures) fixes** — named scalars rather than an array bag,
      `string $price`, a `ProductVariant` returned from both write actions — and every relation
      [D-17.2](#d-172--every-relation-named-with-its-return-type) names exists with its documented
      return type, with `values()` exposing **no** attach/sync surface.
- [ ] 🟣 **A cartesian generation creates one variant per combination**, each with an ordinary derived
      SKU, the parent's price, `stock = 0` and a NULL `featured_media_id`, ordered by
      **D-18.6**'s sequence.
- [ ] 🟣 **Re-generating skips combinations that already exist without modifying them**, reports the
      created / skipped / refused counts in the summary shape **D-18.1** defines, and refuses a
      SKU-colliding combination by name while the rest of the batch commits.
- [ ] 🟣 **An unexpected failure mid-batch leaves zero variants**, and a cartesian product exceeding
      `MAX_COMBINATIONS` is refused on `attributeTypeIds` before anything is written — as is a
      selected attribute type with no values.
- [ ] **A variant with no own featured image resolves to the parent's at read time** — proven by a test
      that changes the parent's image and observes the variant follow it — while
      `featured_media_id` stays NULL in the database, and a variant with its own image is unaffected.
- [ ] Deleting a product removes its variants and their pivot rows; deleting an attribute **value** or
      **type** that any variant uses is refused with a message stating the exact count, with no
      confirm-and-proceed path at any privilege level, and the database FK refuses independently.
- [ ] 0028's `$deletingTypeUsageCount` reports the real count, and 0028's own tests pass unmodified.
- [ ] Authorization is expressed through `ProductPolicy` against the **parent product**, with both an
      allow and a deny test per ability; no new permission string and no `RolePermissionSeeder` change.
- [ ] `lang/en/products.php` and `lang/es/products.php` are **extended** key-for-key identically, and
      no user-facing string is hardcoded.
- [ ] No route, Livewire component, Blade view, browser test, `skus` registry table, SKU override
      field or database trigger is added.
- [ ] Pint clean and Larastan level 7 clean.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] `vendor/bin/pint --dirty --format agent` clean and Larastan level 7 passing — `phpstan.neon`
      analyses `database/`, so both migrations **and the factory** are in scope.
- [ ] **Index reality verified with `php artisan db:table product_variants` and
      `php artisan db:table product_variant_values` after a *fresh* migrate** — not by reading the
      migration, and not against the current stale local schema (**V-M**). Confirm exactly three
      declared indexes on `product_variants` plus the auto-created `featured_media_id` one, and
      exactly the composite PRIMARY plus the auto-created FK index on the pivot.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Point the audit at **D-4** specifically: whether the
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
      and **[signed-link-verification.md](../../docs/security/signed-link-verification.md) gains the
      refinement in D-4.5** — that a locking read *on the value in a unique index* is a genuine
      race guard, distinct from the PK-locking case that document currently describes. Without that
      note the two readings look contradictory. **`docs/database/schema.md` must also record that
      `product_variants.sku` is a derived column** with its formula, its ordering rule and its
      re-derivation triggers, in the same way it documents `users.email`'s obfuscation — a derived
      column that reads like an ordinary one is the single most likely thing for a future story to
      write directly.
- [ ] **Hand-off recorded for story 0031**: these actions perform no authorization of their own
      (**D-12**), so 0031 must (a) call `Gate::authorize()` against the **parent product** as the first
      statement of every method that mutates *or discloses*, (b) gate the route with
      **`can:products.view`, never `permission:products.view`**, and (c) **render the variant SKU as
      read-only** — it is derived (**D-4.3**), so the builder must show it (ideally previewing it live
      as the administrator picks values) and must never offer it as an input. A disabled input that
      still posts, or a hidden field carrying the previewed value, would re-open exactly the typed-
      claimant problem the derivation removes; the action ignores a submitted `sku`, but 0031 should
      not send one. The `->ignore()` asymmetry that previously made this bullet worse than 0024's
      **no longer applies** to the variant side (**D-4.7**).
- [ ] 🟣 **Four further hand-offs to 0031, added 2026-08-19**, all of them things 0031 asked for and
      this story now owns. **(a) Its OQ-3 is answered in full** — the error-bag keys (**D-15**), the
      missing `variantFeaturedMediaIdRules()` (**D-16**), the action signatures (**D-17.1**) and the
      named relations including `ProductAttributeValue::type()` (**D-17.2**) — so 0031's OQ-3 should be
      **closed rather than re-debated**. **(b)** Every one of this story's bag keys is **unbound on
      0031's screen**, so all of them must be rendered explicitly or three of four refusals are
      invisible while every backend test is green (0031 **D-8**). **(c) The generator now exists**
      (**D-18**), which converts 0031's **D-3** scope fence and its **OQ-2b** into a shippable UI
      decision — note the name: 0031 calls the action `GenerateProductVariants`, and what ships is
      **`GenerateProductVariantCombinations`**. **(d)** A generator UI must render the
      `created`/`skipped`/`refused` summary as a result table, and inherits the pagination consequence
      0031's own OQ-2 flagged (a capped batch is still up to `MAX_COMBINATIONS` rows arriving at once).
- [ ] 🟣 **Executed in Phase 3, not assumed (D-18.2)**: whether InnoDB releases the `X,GAP` locks
      **V-H** describes when they were taken inside a savepoint that is subsequently rolled back, or
      holds them to the end of the outer transaction. The batch is correct either way — the answer
      decides only how much of the SKU namespace a generation blocks and for how long, and therefore
      whether `MAX_COMBINATIONS = 200` (**OQ-19**) is comfortable or generous. This story's culture
      requires that to be a command result rather than a reading; record it as a new **V-** finding.
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
| **V-15** | **0024 and 0028 are specs, not code.** Every "modification to 0024/0028" in this file is an amendment to an unbuilt spec if sequenced now, and a code change only if those stories ship first. *(2026-08-18: this no longer applies to the dropped registry, but it applies with more force to what replaced it — **D-4.6**'s re-derivation cascade lands inside 0024's `UpdateProduct` and 0028's `SyncProductAttributeValues`, so the same "cheap today, expensive later" logic now governs whether those two are written with the cascade already in them.)* |
| **V-K** | **Laravel 13.19.0's `Blueprint` has no `check()` method.** A `CHECK` needs raw `DB::statement()`, which breaks the `down()`-symmetry idiom. Was load-bearing against the `skus` registry (**D-4a**); after the amendment it remains the standing reason no `CHECK` may be added to `product_variants` either |
| **V-L** | `foreignUuid('product_attribute_value_id')->constrained()` correctly infers `product_attribute_values` — no explicit table argument needed, unlike `featured_media_id` (0024 **V-4**) |
| **V-M** 🔴 | **The local dev schema is stale.** `migrate:status` shows `2026_08_17_132646_drop_redundant_uuid_unique_index_from_users_table` as **Pending**. Any Phase 3 index verification must follow a fresh migrate or it confirms the wrong reality |
| **V-N** | `char(64)` and `binary(32)` are both available; `SHA2(x,256)` is 64 hex chars / 32 raw bytes |
| **V-P** | **All four dependencies are still unimplemented** — `database/migrations/` holds only the users-era files. 0024's **V-6** still holds, extended |
| **V-Q** *(product-owner)* | **`lockForUpdate()` already has house precedent** at [`app/Actions/Users/ConfirmEmailChange.php:26`](../../app/Actions/Users/ConfirmEmailChange.php), and it is the pattern `signed-link-verification.md` documents — so **D-4** layer 2 extends an existing idiom rather than introducing one |
| **V-R** *(product-owner)* | **No trigger precedent anywhere**: `grep -rn "unprepared\|CREATE TRIGGER\|DB::statement" database/ app/` returns nothing. Load-bearing against **D-4b** |
| **V-S** *(product-owner)* | **`make:rule` exists**, so `app/Rules/` is a stock Laravel location needing no new-folder approval — noted because **D-4** does *not* need it, and a reviewer may wonder why |
| **V-T** *(product-owner)* | Laravel 13 promotes a unique-constraint `23000` to `UniqueConstraintViolationException` — `vendor/laravel/framework/src/Illuminate/Database/Connection.php:854` |

## Dependencies and risks

### Dependencies — all four hard, blocking, and none implemented (**V-P**)

- **0024 (products core CRUD)** — this story FKs into `products`, **reuses** its SKU canonicalisation
  (**RQ-9**), and **modifies three of its shipped files** (**D-4**).
- **0028 (attribute types & values)** — this story FKs into `product_attribute_values` under a
  `restrictOnDelete()` **it mandates** (D4), and fills in the `DeleteProductAttributeType` seam and
  the `$deletingTypeUsageCount` placeholder its D7 designed.
- **0019 (media library)** — the own-image FK points into `media`.
- **0023 (product categories)** — transitively, via `products.product_category_id`.
- Per [workflow.md](../../docs/workflow.md#task-ordering-rule) the numbering is correct; what must be
  enforced is **sequencing** — all four reach Phase 7 before 0029 starts Phase 3.
- **Story 0031 depends on this one** (the paired UI).

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
  single `VariantSku` definition. **Not eliminated.**
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
- **R-K — story size.** This carries two tables, two hard uniqueness rules, a read-time inheritance
  rule and retrofits to two prior stories. 0024's own Provenance already flagged this family for
  INVEST "Small" pressure. **Phase 2 should consider splitting the two in-use guards (D-10) into their
  own story** — they are independently valuable and independently testable. *(2026-08-18: the
  amendment is close to size-neutral overall — it **removes** a whole table, a model and a backfill
  migration, and **adds** `VariantSku`, the derivation tests and **D-4.6**'s two cascades. It does,
  however, cost R-K's cleanest cut line half its cleanliness: the in-use guards are no longer the
  **only** part of this file that edits 0028's shipped code, since the value-rename cascade lands in
  `SyncProductAttributeValues` too.)*

- **R-O 🟣 — the generator holds its locks for the whole batch.** New with **D-18**, and the honest
  cost of its one-transaction shape. Up to `MAX_COMBINATIONS` variants are created inside a single
  transaction, each taking **D-4.5**'s two `lockForUpdate()` reads, so the batch can hold a large set
  of `X,GAP` locks across both `products.sku` and `product_variants.sku` for its full duration — the
  same exposure **R-M** names for the re-derivation cascade, now reachable from a single deliberate
  gesture rather than only as a side effect of a rename. Mitigated by the cap (**D-18.5**) and by the
  fixed lock order (**D-4.5**), which is what keeps the deadlock class closed rather than merely
  narrow. **Not eliminated**, and its true size is unknown until the Definition of Done's savepoint
  lock-release probe is executed. Note the interaction: a generation and a product-SKU rename running
  concurrently are the two heaviest lock holders in this story and they touch the same two indexes.
- **R-P 🟣 — "skipped" and "refused" are easy to conflate, and conflating them is a data-loss story.**
  The two outcomes look adjacent in the summary and are opposite in meaning: *skipped* means the
  combination already exists and was **deliberately left untouched**, *refused* means it could not be
  created. An implementation that reports one as the other is not merely a wrong label — the natural
  "fix" for a mis-reported refusal is to make the generator overwrite what it finds, which is
  **D-18.7**'s rejected re-pricing behaviour arriving by the back door. Mitigated by **FP19** and by
  the untouched-row assertions in the second-run test; the summary vocabulary is fixed in **D-18.1**
  and belongs in `lang/`, not in ad-hoc strings.
- **R-Q 🟣 — three of four refusals share the `sku` bag key.** **D-15** makes this deliberate (so 0031
  renders them in one place) and it costs testability: `->throws(ValidationException::class)` and even
  an assertion on the key cannot distinguish `derived_sku_taken` from `derived_sku_too_long`. The
  translation key is the only discriminator, so every test of those three must assert the message.
  **FP17** carries it; **R-F** is the same risk between `sku` and `combination`.

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
> [0024](done/0024-products-core-crud-backend.md) **reversed** its D-15/RQ-10 accordingly, so the arithmetic
> above is already out of date: `ProductPolicy` is **not** a zero-call-site policy, and four of the ten
> actions this paragraph counts now authorize. What remains open is exactly `backend-expert`'s ask —
> a **project-level decision made once**, plus the `ArchitectureTest` assertion that every
> `app/Actions/` class has an authorizing call site — because `app/Actions/ProductCategories/`'s three
> actions are still the standing exception, deliberately deferred to **0025** (see
> [0024b](done/0024b-product-category-in-use-delete-guard.md) **D-B1** for why 0024b did not close a third
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

None blocks Phase 2 INVEST review. **OQ-2 should be answered before Phase 3**, together with the
six questions the 2026-08-18 amendment opened (**OQ-13**–**OQ-18**) — of which only **OQ-17** has a
schema cost, and therefore only **OQ-17** shares OQ-2's cheap-now/expensive-later timing. 🟣 The
2026-08-19 generator addition opened three more (**OQ-19**–**OQ-21**), none with a schema cost;
**OQ-20** is the one to answer alongside OQ-2, because it is the same `price` column one branch apart.

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
> ships in this story** as `GenerateProductVariantCombinations`
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

**OQ-7 — Confirm the type-level in-use block** (carried from 0028's **Q3**): deleting an attribute
*type* is refused with a count of the variants that would be destroyed, across **all** of that type's
values. **Recommended: yes** — otherwise the administrator meets a raw `1451` (**D-10**).

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
`products.delete`?** `backend-expert` recommends **`products.edit` for all three** variant
operations, on the reasoning that `products.create`/`products.delete` are about bringing a *product*
into or out of the catalog, while adding or removing one of its variants is a *modification of an
existing* catalog record — so holding `products.edit` but not `products.delete` should let you
restructure a product, not destroy one. **Recommended**, flagged because it is arguable and it is a
contract 0031 binds to.

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

🟣 The three questions below were **opened by the 2026-08-19 generator addition** (**D-18**). None
blocks Phase 2. **OQ-20 shares OQ-2's timing** — it is the same `price` column, one branch apart.

**OQ-19 — Confirm `MAX_COMBINATIONS = 200` as the batch cap.** **Recommended: 200** (**D-18.5**). The
mechanism is not in question — a cap checked before the transaction opens, refusing on
`attributeTypeIds` with the limit and the attempted count in the message — only the constant. 200 sits
at the top of what a real clothing catalog generates in one gesture (5 sizes × 8 colours × 5 materials
is exactly 200), while 5 types × 4 values (1,024) is comfortably refused.
- Lower it toward **100** if the Definition of Done's savepoint probe finds gap locks are held for the
  whole outer transaction, since the cap is the only control on that window (**R-O**).
- Raise it only with a concrete catalog shape that needs it; note that whatever the number, the *UI*
  consequence is a result table of that many rows, which is 0031's pagination question.

**OQ-20 — Confirm that a generated variant takes the parent product's `price`.** **Recommended: yes**
(**D-18.4**), with `stock = 0` and `featured_media_id` NULL. Stated as a question rather than assumed
because "leave price at the column default" is the intuitive answer and is **not available** —
`product_variants.price` is NOT NULL with no default (**D-6**), so something has to supply a number.
Copying the parent's price is what **D-6** already promised the UI would do for a single variant, done
one layer down so the generator is not the one place that behaves differently.
- Alternative: require the caller to pass one price applied to every generated row. Strictly worse —
  the only sensible value the caller has *is* the parent's price.
- **This question disappears if OQ-2 flips**: a nullable-and-inheriting `price` makes the answer
  "leave it NULL" and deletes **D-18.4** rather than changing it. Answer OQ-2 first.

**OQ-21 — Should the generator also be reachable for a *subset* of a product's existing axes?** Today
it takes exactly the type ids it is given and generates their full product (**D-18.6**), which means
re-generating after adding a **value** works naturally, while adding a whole new **type** to a product
that already has variants produces combinations that do not include the new axis for the old rows —
the old variants stay as they are, correctly, but the catalog then holds combinations of differing
arity. **Recommended: accept it, and change nothing.** **D-3** already treats a subset as a legitimate
distinct combination, so this is that decision's natural consequence rather than a new defect, and the
alternative (regenerating existing variants against a new axis) means creating rows that duplicate an
existing variant's stock and price with no way to say which is real. Flagged because the first
administrator to add a third type to a live product will ask, and because 0031 may want to warn.

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-18 per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate), derived from
[PRD](../../docs/PRD/PRD.md#22-products) §2.2's "Product variants" Gherkin block and the "a variant"
example of its duplicate-SKU Scenario Outline, plus assumptions 9, 10 and 19, and grounded in **full
readings** of [0024](done/0024-products-core-crud-backend.md),
[0028](done/0028-product-attribute-types-and-values-backend.md) and
[0019](done/0019-media-library-upload-and-conversions-backend.md), with
[0023](done/0023-product-categories-backend.md) as the precedent for how this project models a delete
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
  [`tests/Pest.php`](../../tests/Pest.php),
  [`tests/Feature/Users/IndexTest.php`](../../tests/Feature/Users/IndexTest.php), `docs/testing/**`
  and 0024/0028's own test sections. The false-pass catalogue and the subset/superset
  relational-division cases are `product-owner`'s, not a subagent's.

Findings **V-Q**–**V-T** are `product-owner`'s own, executed inline: the `lockForUpdate()` house
precedent at [`app/Actions/Users/ConfirmEmailChange.php:26`](../../app/Actions/Users/ConfirmEmailChange.php)
that makes **D-4** Option B's layer 2 an extension rather than an invention; the absence of any
trigger precedent; `make:rule`'s availability; and Laravel 13's `UniqueConstraintViolationException`.
The over-long FK constraint name was independently re-verified by arithmetic at **both** candidate
spellings (66 and 67 characters — the two experts each found one of them).

> ✅ **Housekeeping — closed 2026-08-18.** `backend-expert` created a throwaway MySQL schema
> **`zzz_probe_0029`** inside the running `arospe-mysql-1` container to execute its probes and
> deliberately did not drop it (the brief forbade destructive database commands). Nothing in `arospe`
> or `testing` was ever touched. The user authorized the drop explicitly, per
> [contracts.md](../../docs/contracts.md)'s Destructive Database Command Rule, and the schema **has
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

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Three items deserve an explicit look
there. **Size** (**R-K**): this story carries two tables, two uniqueness mechanisms, a read-time
inheritance rule, a derived-column re-derivation cascade and retrofits to two prior stories — the
**D-10** in-use guards remain the cleanest cut line, though the amendment costs them some of that
cleanliness, since **D-4.6**'s value-rename cascade also lands in 0028's
`SyncProductAttributeValues`. **OQ-5**, which is a genuine scope boundary rather than a detail: if a product must
declare its attribute types, a further table exists and this story's own Gherkin changes ("a subset
is not a duplicate" would become "a subset is refused as incomplete"). And **DIS-3**, which is a
project-level gap this story would be the third to defer rather than discharge.

### Amendment — 2026-08-19: four contract gap-fills, and the cartesian generator

Two unrelated things landed on the same day and are kept separate here, because one is bookkeeping and
the other is scope. Neither came from a new Three Amigos round: the first is 0031 reporting back from
the screen it built on this contract, the second is a PO decision.

**Part 1 — four contract gaps, filled.** Story **0031** was debated on 2026-08-19 against this
document and found four places where this story decided something and then never wrote it down, raised
as [its OQ-3](0031-product-variants-editor-ui.md#open-questions). All four are **specification, not
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
> [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move) and the
> [errors-log entry](../../docs/errors-log.md) recording the six `done/` files this already broke.
