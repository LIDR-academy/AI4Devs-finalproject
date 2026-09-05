# [0029b] Product variant combination generator — backend (the cartesian "generate all combinations" action)

## Description

An administrator with a product offering Talla (38, 39, 40) and Color (Black, White) can generate all
**six** combinations in one action instead of building six variants by hand.
`App\Actions\Products\GenerateProductVariantCombinations` creates one variant per combination in the
cartesian product of the selected attribute types' values, **skipping combinations the product already
has without touching them**, refusing SKU collisions by name while the rest of the batch commits, and
returning a `created` / `skipped` / `refused` / `attempted` summary the UI renders as a result table.

It re-implements **nothing** — not the SKU derivation, not the combination hash, not the collision
check, not the pivot write. Every combination goes through
**[0029](0029-product-variants-backend.md)**'s ordinary `CreateProductVariant`.

> 🟠 **Provenance — split out of 0029 on 2026-09-04, at Phase 2.** This is not new scope and it is not
> deferred scope: it is the same generator the PO decided on **2026-08-19**, in its own story. Phase 2
> failed 0029 on INVEST **"Small"**, and this is the cleanest of the two cuts that resolves it — the
> generator is purely **additive** on top of `CreateProductVariant`, touches **no schema, no index, no
> FK and no shared file**, and removing it changes no contract in 0029. It is also the piece whose
> addition on 2026-08-19 **reversed a scope fence** and against which 0029's **R-K** size assessment
> (dated 2026-08-18) was never re-run — the specific finding the review raised.
>
> Everything in **D-18.1** through **D-18.7** below is 0029's, carried over rather than re-debated,
> renumbered **D-G1**–**D-G7**. **Three things are new**, and each is a Phase 2 correction verified
> against the real shipped code:
>
> 1. 🔴 **The action self-authorizes, once, before the batch** — not once per generated variant. See
>    **D-G0**.
> 2. 🔴 **`attributeTypeIds` is validated in two passes**, per
>    [array-validation-bounds.md](../../../docs/security/array-validation-bounds.md). See **D-G8**.
> 3. 🔴 **The batch cap is computed by multiplying value-set *sizes*, never by materializing the
>    cartesian product and counting it.** See **D-G5**.

It is **backend only** — no screen, no route, no Livewire component. The generator's UI is **0031**.

Partially answers 0029's **OQ-5**: the generator ships; the `product_product_attribute_type`
declaration table still does not.

## Type

backend | fullstack (related_task_id: **0031** — variant builder UI) | includes database-expert: **no**

> 🟠 **The classification argument, carried verbatim from 0029's Type section (2026-08-19), because it
> is this story's argument rather than 0029's.** The temptation to answer `yes` is worth addressing
> point by point, because "one action writes hundreds of rows" *sounds* like a schema question:
>
> - **No new table, column, enum or FK.** A generated variant is an ordinary `product_variants` row
>   with an ordinary set of `product_variant_values` rows. The generator is a loop over a cartesian
>   product in PHP, not a new shape of data.
> - **No new index, because the generator introduces no new access pattern.** Its one new read is
>   *"which combinations does this product already have?"*, and that is
>   `SELECT combination_hash FROM product_variants WHERE product_id = ?` — served as a **covering**
>   range scan by 0029's existing `unique(product_id, combination_hash)`, whose leading column is
>   `product_id` (0029 **D-14**). Note the shape this makes possible and which **D-G2** mandates:
>   **one** query answers the duplicate question for the whole batch, so N combinations cost one read,
>   not N.
> - **No chunked bulk insert, and therefore no schema consequence from performance at scale.** The
>   obvious "make it fast" move — `ProductVariant::insert([...])` — is **refused on three independent
>   grounds**, none of which is performance: it bypasses `HasUuids`, so no row gets a key; it bypasses
>   the per-row cross-table SKU existence check (0029 **D-4.5**), which is a `lockForUpdate()` read on
>   a *different* table and cannot be batched away; and it writes a model this repo requires to be
>   written through instances ([base-standards.md](../../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder)'s
>   `User::delete()` rule, one model over). The real cost control is the **batch cap** (**D-G5**),
>   which bounds the work instead of speeding it up.
> - **The residual that *is* real is a lock-hold window, not a storage problem** — the batch holds its
>   gap locks for the whole transaction. That is **R-G1**, and its mitigation is the cap, not an index.
>
> If any of the above stops being true — most plausibly, someone proposing a real bulk insert, or a
> denormalised per-product variant counter to make the pre-read cheaper — the classification question
> genuinely reopens. Nothing specified here reaches that point.

## Three Amigos participants

Inherited from [0029](0029-product-variants-backend.md)'s 2026-08-18 debate plus the PO's 2026-08-19
generator decision. **No new debate was run for this split.** `database-expert`'s **V-H** (the gap lock
that makes 0029 **D-4.5**'s cross-table check a real race guard) and **V-A** (REPEATABLE READ is the
live isolation level) are the two findings this story leans on hardest, and both are inherited.

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. Carried over
unchanged from 0029, plus one new scenario for the authorization correction.

```gherkin
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

  Scenario: An administrator without the products permission cannot generate combinations
    Given a signed-in administrator who does not hold the products management permission
    When they try to generate the combinations for a product's attribute types
    Then the action is refused and no variant is created
    And they are not told how many combinations would have been generated
```

## Documented functional decisions

### D-G0 🔴 — The generator authorizes **once**, up front, against the parent product

**New at the 2026-09-04 split (Phase 2 defect 4), and the consequence of 0029's own **D-12.1**.**

```php
// app/Actions/Products/GenerateProductVariantCombinations.php — the FIRST statement,
// before validation, before the value-set read, before the cap check, before the transaction.
$this->logRefusedPrivilegedAttempt->authorize(
    'update', $product, targetType: 'product', targetId: $product->id,
);
```

Five points:

1. **Once, against the parent product — never once per generated variant.** The authorization question
   is identical for every combination in the batch (same actor, same product, same ability), so asking
   it N times answers nothing new and costs N gate evaluations. More importantly, a refusal discovered
   *inside* the loop would arrive inside a savepoint, mid-batch, with rows already written — an
   incoherent state for a control that should never have let the batch start.
2. **Before the cap check and before the empty-type check**, so a refused actor learns **nothing**:
   not the combination count, not which types are empty, not the limit. This is the same disclosure
   rule [0029a](0029a-attribute-in-use-delete-guards-backend.md)'s **D-A2** applies to its in-use
   count and `DeleteProductCategory` already ships.
3. **`CreateProductVariant`'s own gate still runs, per row, and that is correct rather than
   redundant.** It is 0029 **D-12.1**'s action-owns-the-rule guarantee, which must hold for every
   caller including this one. On this path it is an idempotent re-check against the same (actor,
   product, ability) triple that already passed — cheap, since Spatie's permission set is cached
   per-request — and it is what keeps `CreateProductVariant` independently safe if a future caller
   forgets. **Do not remove it, and do not build a "skip the gate" parameter to avoid it** — that
   parameter is a one-argument bypass, exactly the shape
   [base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
   forbids ("derive a security-relevant flag internally; never take it as a parameter").
4. **`LogRefusedPrivilegedAttempt` is constructor-injected**, with `targetType: 'product'` passed
   explicitly (`resolveTarget()` auto-resolves only `User` and `Role`) — the same shape all three of
   0029's variant actions use.
5. **The ability is `update`**, per 0029's **OQ-12** as adopted in **D-12.1**: generating variants is
   a modification of an existing catalog record, not bringing a product into the catalog.

### D-G1 — Signature and return shape *(0029's D-18.1)*

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
 * @throws \Illuminate\Auth\Access\AuthorizationException  D-G0
 * @throws \Illuminate\Validation\ValidationException      on attributeTypeIds (D-G8)
 */
public function __invoke(Product $product, array $productAttributeTypeIds): array
```

**Why a summary array and not a bare `Collection<ProductVariant>`.** The bare collection is the obvious
signature and it cannot express the outcome: *"8 created, 2 already existed"* is the sentence the
administrator must read, and a collection of 8 rows is indistinguishable from a collection of 8 rows
where nothing was skipped. 0031 asked for exactly this — an *"explicitly specified per-row outcome
contract (`created` / `skipped_existing` / `refused` + reason) the UI can render as a result table"* —
so the shape **is** the contract, documented as a PHPDoc array shape per
[code-style.md](../../../docs/conventions/code-style.md#phpdoc-array-shapes-over-inline-comments).
`created` stays a `Collection` of real models so the caller can render them without re-querying;
`skipped` and `refused` carry the value-id set plus the human-readable `label()` so the UI never has to
reconstruct which combination a row refers to.

### D-G2 — Outcome semantics: skip silently in the data, report loudly in the summary *(0029's D-18.2)*

**Decision: an already-existing combination is skipped and *reported*, never silently dropped and
never an abort.** Three outcomes, and no fourth:

| Outcome | When | Effect |
| --- | --- | --- |
| `created` | the combination is new and its derived SKU is free | one variant row + N pivot rows, exactly as `CreateProductVariant` writes them |
| `skipped` | the product already holds this exact combination | nothing written for that combination; the existing variant is **not** touched, re-priced or re-derived |
| `refused` | the derived SKU collides (0029 **D-4.5** case (a), (b) or (c)) | nothing written for that combination; the collision message — which already names the conflicting record — is carried out in the summary |

**"Skip existing" is the correct semantic and the alternative is worse.** Refusing the whole batch
because one combination exists would make the generator useless for its most common real use — *"I
added a new colour, generate the rest"* — which is precisely the second run over a partially-built
product. And the skip is safe in a way an update would not be: it never overwrites a price or stock an
administrator has already set on the existing variant.

**Transaction shape, and the answer to 0031 D-3's objection.** The whole batch runs inside **one**
`DB::transaction()`, and each combination goes through the ordinary `CreateProductVariant`, whose own
`DB::transaction()` therefore becomes a **savepoint**. That is the property that makes this work:

- A per-combination `ValidationException` (a SKU collision, or a lost race on the combination index)
  rolls back **only that savepoint**, so the batch continues and the failure lands in `refused` /
  `skipped` instead of destroying the other 199 rows.
- An **unexpected** exception propagates past the outer transaction and rolls back the entire batch, so
  there is no half-built catalog from a bug or a connection drop. This is the half of 0031 **D-3**
  point 3's worry that is real, and it is closed.
- 0031's other worry — *"nests savepoints around six actions that each open their own transaction"* —
  is answered rather than dismissed: nesting is exactly the mechanism, not an accident of it. What it
  does cost is the lock-hold window, which is **R-G1** and is bounded by the cap in **D-G5** rather
  than wished away.

🔴 **One thing Phase 3 must verify by execution, not by reading**: whether the `X,GAP` locks **V-H**
describes, taken inside a savepoint that is then rolled back, are released at that rollback or held to
the end of the outer transaction. The batch is correct either way — the difference is only how much of
the SKU namespace it blocks for how long — but the answer changes what the cap should be, and this
document does not guess it. Recorded in the Definition of Done as an execution obligation.

**Duplicate detection is one query for the whole batch, not one per combination.** Read every existing
`combination_hash` for the product up front, inside the transaction, and compare each candidate's
`app(HashVariantCombination::class)()` against that set in PHP:

```php
$existing = DB::table('product_variants')
    ->where('product_id', $product->id)
    ->pluck('combination_hash')
    ->flip();            // O(1) membership, N combinations cost ONE read
```

This is served as a covering scan by 0029's `unique(product_id, combination_hash)` — the reason
[Type](#type) can say the generator introduces no new access pattern. It is a **pre-check, not a race
guard**: the unique index remains the last word, and a combination that loses the race between the
pre-read and its own insert surfaces as `23000` on `(product_id, combination_hash)` and is recorded as
`skipped` — which is the truthful outcome, since by then it genuinely does exist.

### D-G3 — The SKU is derived exactly as for any other variant, with no special case *(0029's D-18.3)*

A generated variant's SKU comes from `app(DeriveVariantSku::class)()` via `CreateProductVariant`, in
0029 **D-4.2**'s `(type.position, type.id, value.position, value.id)` order, with **D-4.4**'s
`segment()` applied unchanged. There is no batch-specific formula, no counter suffix, and no
de-duplication pass.

This is not merely "consistent" — it is what keeps 0029 **D-4.3**'s global consistency test meaningful.
The moment the generator writes a SKU any other way, that test either has to exclude generated rows
(and so stops covering most of the catalog) or fails for a reason unrelated to the code under test —
0029's **FP13** trap one layer over, and the usual response to it is to weaken the assertion.

Two consequences that follow for free:

- **Collision case (b)** — two of the *generated* values reducing to the same segment (`azul marino`
  and `azul-marino` on one product) — is caught by the same **D-4.5** existence check as any other
  create, so the second one is `refused` with the message naming the first. The generator adds no new
  collision class.
- **Re-derivation (0029 D-4.6) applies to generated variants identically.** They are ordinary rows; a
  later parent-SKU change or value rename rewrites them along with everything else.

### D-G4 — Price and stock at generation time *(0029's D-18.4)*

**Decision: the generator asks for neither. Each generated variant takes the parent product's `price`
and a `stock` of 0, both editable per-variant immediately afterwards.**

The instinct — *"leave price and stock at the column defaults"* — is right about stock and **not
available** for price: `product_variants.price` is `decimal(10,2)` **NOT NULL with no default** (0029
**D-6**), so there is no default to leave it at. The three real options:

| Option | Verdict |
| --- | --- |
| ✅ **Copy the parent product's `price`; `stock` = 0** | **Recommended and chosen.** 0029 **D-6** already names this exact behaviour as the answer to the NOT NULL column's ergonomic cost (*"the builder pre-fills each variant's price from the parent at creation"*) — the generator simply does in the action what D-6 said the UI would do for one variant. `stock = 0` is the column default and is honest: no physical unit of a just-invented combination exists yet |
| Require the caller to pass one price applied to every generated row | Rejected as the default. It is a strictly worse version of the above (the caller's only sensible value *is* the parent's price) and it puts a required money input in front of a gesture whose whole point is speed |
| Ask for a price per combination at generation time | Rejected outright. Asking for N prices before the combinations exist is the UX problem the generator exists to remove, and it is 0031's concern regardless |

`featured_media_id` is left **NULL**, which is not a default but the inheritance flag itself (0029
**D-7**) — a generated variant shows its parent's image until someone gives it one.

Raised as **[OQ-G2](#open-questions)**, and note the coupling: if 0029's **OQ-2** ever flips `price` to
nullable-and-inheriting, this decision collapses into "leave it NULL" and this section disappears
rather than changing. **0029's OQ-2 must be answered first.**

### D-G5 — The batch cap, and 🔴 how it is computed *(0029's D-18.5, with the Phase 2 correction)*

**Decision: refuse the whole call, before writing anything, when the cartesian product exceeds
`GenerateProductVariantCombinations::MAX_COMBINATIONS = 200`**, with a `ValidationException` on
`attributeTypeIds` naming both the limit and the number that was attempted.

🔴 **The count is computed by MULTIPLYING the value-set sizes — never by building the cartesian
product and counting it.** Added at the 2026-09-04 split (Phase 2 defect 8), because the prior wording
(*"checked after the value sets are read and multiplied out"*) reads ambiguously and the wrong reading
is the expensive one:

```php
// ✅ the cap, computed from the SIZES alone — five integers multiplied, whatever the answer is
$attempted = array_product(array_map(
    static fn (Collection $values): int => $values->count(),
    $valueSetsByType,
));

if ($attempted > self::MAX_COMBINATIONS) {
    throw ValidationException::withMessages([
        'attributeTypeIds' => __('products.variants.generate.too_many', [
            'limit' => self::MAX_COMBINATIONS, 'attempted' => $attempted,
        ]),
    ]);
}

// only now is the product materialised, and only for an $attempted already proven <= 200
```

**Why this is a correctness rule and not a micro-optimisation.** Materialising first is what an
implementer naturally writes (`$combos = cartesian($sets); if (count($combos) > 200) throw;`) and it
means a request selecting five types of twenty values allocates **3.2 million** PHP arrays before
discovering it is 16,000× over the limit — an out-of-memory fatal instead of a validation message,
from a payload that is refused either way. `array_product()` over the counts answers the same question
in five multiplications and cannot allocate anything. This is the identical lesson
[array-validation-bounds.md](../../../docs/security/array-validation-bounds.md) records for validation
(*"a cap on the array's length is not a cap on the loop's work"*) arriving at a generator instead of a
validator: **bound the work by the numbers, before doing the work.**

Two ordering facts that come with it: the cap is checked **after** the value sets are read (one query;
their sizes are not knowable without it) and **before** the outer transaction opens, so an over-large
request costs exactly one read and writes nothing. And `array_product()` on an empty-valued set returns
`0`, which would pass the cap silently — which is why the empty-type refusal (**D-G6**) must run
**before** the multiplication, not after.

200 is chosen against real catalog shapes: 5 sizes × 8 colours is 40, and 5 × 8 × 5 materials is
exactly 200 — so the cap sits at the top of what a clothing catalog plausibly generates in one
gesture, while 5 types × 4 values (1,024) is comfortably refused. **[OQ-G1](#open-questions)** carries
the constant for confirmation; the mechanism is not in question.

**Why a cap rather than making the write faster** — the three "make it scale" moves, all refused for
reasons that are not about speed, are enumerated in [Type](#type) above. What actually scales here is
doing less work, and the cap is that.

### D-G6 — Input rules and the ordering of what gets generated *(0029's D-18.6)*

- **The selected types need not be "offered by" the product** — there is no declaration table (0029's
  **OQ-5a** surviving half), so any existing attribute type may be selected. The generator neither
  reads nor writes any notion of a product's declared axes.
- 🔴 **A selected type with zero values is refused**, on `attributeTypeIds`, naming the type, **and
  this check runs before the cap multiplication** (**D-G5**). Left unchecked, the cartesian product of
  anything with an empty set is **empty**, so the action would silently create nothing and report
  `attempted: 0` — an outcome indistinguishable from success and certain to be read as a bug — and
  `array_product()` would return `0`, passing the cap. Fail loudly instead.
- **Duplicate and unknown type ids are refused by D-G8's rules** (`distinct`, `Rule::exists`), with the
  same **V-10** caveat 0029 records: the type ids and their values are **read back from the
  database**, and the cartesian product is built from that read-back, never from the payload.
- **Iteration order is types in `(position, id)` order, values in `(position, id)` order, with the last
  type varying fastest** — 38-Black, 38-White, 39-Black, 39-White, 40-Black, 40-White. This is the same
  ordering 0029 **D-4.2** uses for the SKU, so the generated list reads in SKU order, and it is what
  `position` is assigned from: each created variant takes `MAX(position) + 1` scoped to the product in
  that sequence (0029 **D-8**), so a freshly generated set lands in the natural order rather than in
  whatever order the inserts happened to complete.

### D-G7 — What the generator deliberately does **not** do *(0029's D-18.7)*

| Considered | Verdict |
| --- | --- |
| A **dry-run / preview** seam (*"show me which rows would succeed before writing"*) | **Not here.** It is 0031's [OQ-5](../0031-product-variants-editor-ui.md#open-questions) and it is a read-only seam over 0029 **D-4.5**'s query; the `skipped`/`refused` summary already tells the administrator what happened *after* |
| **All-or-nothing** refusal of the batch on any collision | **Rejected** — see **D-G2**. It defeats the "add a colour, generate the rest" case, which is the common one |
| **Updating** an existing combination's price/stock while generating | **Rejected, firmly.** A generator that silently re-prices variants an administrator has already tuned is a data-loss bug wearing a convenience label. Skipping is the whole point |
| A **delete-missing** / full-sync mode | **Rejected.** Variants are hard-deleted (0029 **D-6**, no `SoftDeletes`) and carry stock; a sync that deletes is unrecoverable by construction |
| The `product_product_attribute_type` **declaration table** | **Still out of scope** — 0029's OQ-5a surviving half. The generator holds its axes transiently, as its parameters |
| A `ReorderProductVariants` action for the generated set | **Not here** (0029 **D-17.1** point 5). **D-G6**'s cartesian order is deliberately the useful one, which is what makes the absence tolerable |
| A **queued** batch | **Rejected** (see [Type](#type)): it turns a synchronous gesture into one with no result to render, contradicting **D-G1**'s summary contract |

### D-G8 🔴 — `attributeTypeIds` is validated in **two passes**, and the two trait methods are appended to 0029's trait

**New at the 2026-09-04 split (Phase 2 defect 5).** The two methods themselves are 0029's **D-16**,
carried over:

| Method | Applies to | Rules |
| --- | --- | --- |
| `variantAttributeTypeIdsRules()` | `attributeTypeIds` (the array itself) | `['required', 'array', 'min:1', 'max:5']` |
| `variantAttributeTypeIdRules()` | `attributeTypeIds.*` (each element) | `['string', 'distinct', Rule::exists('product_attribute_types', 'id')]` |

**They are appended to `App\Concerns\ProductVariantValidationRules`** — 0029's trait, which ships five
methods — **never a second trait.** A `ProductVariantGeneratorValidationRules` would be a second home
for the same concern, and [naming.md](../../../docs/conventions/naming.md#traits-and-their-methods)'s
flat, single-concern rule plus 0024's entity-prefix trap (a consumer composing two of these fatals on
a duplicate method) both point the same way. Both names keep the `variant` prefix for the same
collision reason.

✅ **The two-pass shape is mandatory**, exactly as 0029 **D-16.1** requires of `attributeValueIds`:

```php
// app/Actions/Products/GenerateProductVariantCombinations.php — after the D-G0 gate.
// PASS 1 -- shape and bound ALONE. Throws before a single per-element exists() query runs.
Validator::make(
    ['attributeTypeIds' => $productAttributeTypeIds],
    ['attributeTypeIds' => $this->variantAttributeTypeIdsRules()],
)->validate();

// PASS 2 -- per-element rules, now provably against at most 5 elements.
Validator::make(
    ['attributeTypeIds' => $productAttributeTypeIds],
    ['attributeTypeIds.*' => $this->variantAttributeTypeIdRules()],
)->validate();
```

**`max:N` on an array bounds what may *succeed*; it does not bound what the request *costs*.** Laravel
expands `field.*` against the data it was given and runs every expanded rule regardless of whether the
parent attribute's own rules already failed, so a payload of 4,000 type ids pays 4,000
`Rule::exists()` queries before the `max:5` message is returned. Neither `bail` form helps —
`field` and `field.*` are different attributes. See
[array-validation-bounds.md](../../../docs/security/array-validation-bounds.md) for the measured numbers
and for how stories 0027 and 0028 discharged the identical obligation.

**And the bound protects the value-set read too**, which is the thing that matters more here: the
read-back that loads each selected type's values is one query, but its `IN (…)` binding list is
client-sized unless something bounds the array first. Pass 1 is that something. **Assert the binding
count, not the query count** — both a bounded and an unbounded implementation issue exactly one query.

**`max:5` interacts with the batch cap**, and the interaction is deliberate: five types of four values
each is already 1,024 combinations, so the **cap** (**D-G5**) is what actually refuses that, with a
clearer message than an array-size error would give. `max:5` is the sanity bound one level up.

## Verified environment findings

Executed against this repository's real `testing0029` database on 2026-09-05 — the Definition of
Done's own instruction that the savepoint/gap-lock question be "a command result rather than a
reading". Two raw PDO connections, no ORM: one ("holder") opens a transaction under
`REPEATABLE READ`, brackets a non-existent `products.sku` value between two committed real rows,
takes an `X,GAP` lock on it with a `SELECT ... FOR UPDATE` (the same shape **D-4.5**'s cross-table
check and this action's own SKU-collision check use), issues `ROLLBACK TO SAVEPOINT`, then holds the
still-open outer transaction for 60 seconds; the other ("prober"), started only after the holder's
own stdout confirms the savepoint rollback happened, attempts to `INSERT` the exact bracketed value
under a 2-second `innodb_lock_wait_timeout`, so a still-held lock surfaces as a fast, observable
error rather than a hang.

| # | Finding |
| --- | --- |
| **V-G1** 🟢 | **`ROLLBACK TO SAVEPOINT` releases the `X,GAP` lock immediately — it is NOT held to the end of the outer transaction.** The prober's `INSERT` of the bracketed value succeeded in 0.008s, immediately after the holder printed that it had rolled back to its savepoint, while the holder's outer transaction was still deliberately open (and stayed open for another ~60s afterward). Reproduced on this project's MySQL 8.4 container, whose `ROLLBACK TO SAVEPOINT` lock-release behaviour post-dates the older InnoDB versions where this was a known, since-fixed limitation (upstream bug #42640, fixed 5.7.22/8.0.13). Setup and teardown both verified clean (`DB::table('products')`/`product_categories` show zero residual rows after the run) |

**What this answers, per D-G2's own framing and OQ-G1.** The batch's lock-hold window is **not**
uniform across all `MAX_COMBINATIONS` candidates: only the combinations that actually **commit**
(created rows) hold their `X,GAP`/row locks for the whole outer transaction's duration, exactly as
any ordinary multi-row write would. A combination that is **refused** (a SKU collision, caught by
`CreateProductVariant`'s own `catch (UniqueConstraintViolationException)` path, which rolls back to
its own savepoint) or that **loses the race** on the pre-read (D-G2's own skip-via-savepoint-rollback
case) releases its locks at that point, not at the batch's end. **OQ-G1's "lower the cap toward 100
if locks are held for the whole outer transaction" condition does not apply** — the worst case is
bounded by how many combinations actually *commit* in one batch, which `MAX_COMBINATIONS = 200`
already caps directly, not by a separate, larger number of transiently-locked-then-released
candidates. **200 stands, with this now a verified rather than an assumed basis for it.**

## Scope fences: what this story must NOT do

- No new table, column, index, FK, enum or migration. Everything it writes to is
  [0029](0029-product-variants-backend.md)'s.
- No Livewire component, route, Blade view, sidebar entry or browser test — the generator's UI is
  **0031**'s.
- **No re-implementation of the SKU derivation, the combination hash, the cross-table collision check
  or the pivot write.** Every one goes through `CreateProductVariant`. A second copy of any of them is
  the defect 0029's **R-L** names.
- **No bulk `insert()`, no queued batch, no dropping the outer transaction** — see [Type](#type).
- **No `product_product_attribute_type` declaration table**, no dry-run seam, no all-or-nothing batch,
  no re-pricing of existing combinations, no delete-missing sync mode (**D-G7**).
- **No second validation trait** (**D-G8**) and no `ProductVariantPolicy`.
- **No "skip the gate" parameter on `CreateProductVariant`** to avoid its per-row re-check (**D-G0**
  point 3).
- No new permission string and no `RolePermissionSeeder` change.
- No change to `CreateProductVariant`'s signature or behaviour. If the generator needs something it
  does not offer, that is a finding against 0029, not a local amendment.

## Files to create/modify

### Creates

| Path | What & why |
| --- | --- |
| `app/Actions/Products/GenerateProductVariantCombinations.php` | one outer transaction, one pre-read of the product's existing `combination_hash` values, then one `CreateProductVariant` call per new combination (its transaction becomes a savepoint, so a per-row refusal does not destroy the batch). Owns `MAX_COMBINATIONS = 200` (**D-G5**), the gate (**D-G0**), the two validation passes (**D-G8**), the empty-type refusal (**D-G6**), the iteration order and the summary array shape (**D-G1**). Constructor-injects `LogRefusedPrivilegedAttempt` and `CreateProductVariant` — one action depending on another, [code-style.md](../../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)'s documented exception, the same shape `SetSalesRegionActive` ← `SetDefaultSalesRegion` already ships |
| `tests/Feature/Products/GenerateProductVariantCombinationsTest.php` | see [Tests to perform](#tests-to-perform) |

### Modifies

| Path | What & why |
| --- | --- |
| `app/Concerns/ProductVariantValidationRules.php` **(0029's file)** | **appends** `variantAttributeTypeIdsRules()` and `variantAttributeTypeIdRules()` (**D-G8**). Append only — the five methods 0029 ships are untouched, and no second trait is created |
| `lang/en/products.php`, `lang/es/products.php` | **Extend, never recreate.** Three keys: `products.variants.generate.empty_type` (naming the type), `products.variants.generate.too_many` (interpolating `:limit` and `:attempted`) and `products.variants.generate.summary` (a `trans_choice` over the created count, interpolating `:skipped` and `:refused`) — the last is the sentence 0031 renders, and it lives here rather than in 0031 because the *action* owns the outcome vocabulary. Key-for-key identical in both locales |

### Explicitly **not** touched

`database/migrations/**` · `database/seeders/RolePermissionSeeder.php` · `routes/**` ·
`app/Policies/**` · `app/Models/**` · `app/Livewire/**` · `resources/views/**` · `tests/Browser/**` ·
`docs/**` (Phase 6) · `app/Actions/Products/CreateProductVariant.php` and every other file
[0029](0029-product-variants-backend.md) ships · anything belonging to
[0029a](0029a-attribute-in-use-delete-guards-backend.md), 0030 or 0031.

## Tests to perform

**Feature — `tests/Feature/Products/GenerateProductVariantCombinationsTest.php`**

Carried from 0029 verbatim, plus the three cases the Phase 2 corrections require.

- [x] **The count is the cartesian product**: 3 Talla values × 2 Color values generates exactly **6**
      variants and **12** pivot rows, on a product that had none. Assert both numbers — 6 variant rows
      with the wrong pivot cardinality is a real failure mode of a loop that mis-nests.
- [x] **A single type** generates one variant per value (the N=1-axis case, which a nested-loop
      implementation can get wrong in the direction of generating nothing).
- [x] **Every generated SKU is the ordinary derivation**, asserted as **literal strings** for the whole
      set (`0002-38-Black`, `0002-38-White`, …) — never by re-calling the derivation (**FP-G1**). This
      pins **D-G3**'s no-special-casing rule.
- [x] **The `position` sequence follows D-G6's iteration order**, asserted as an exact ordered array of
      SKUs read back through `Product::variants()` — not as a set.
- [x] **Price and stock (D-G4)**: every generated variant carries the parent's `price` as a **string**
      (`toBe('19.99')`) and `stock === 0`, and `featured_media_id` is **literally NULL** so inheritance
      still applies (0029 **D-7**).
- [x] **The second run skips**: generate, add a value, generate again — the summary reports the right
      `created` and `skipped` counts, the pre-existing variants are **byte-identical afterwards**
      (assert their `updated_at`, price and stock are unchanged, not merely that the row still exists),
      and the product holds exactly one variant per combination.
- [x] **A skip does not re-price.** Set a generated variant's price to something other than the
      parent's, re-generate, and assert the custom price survives. This is **D-G7**'s "silently
      re-prices" bug, and nothing else in the suite can fail against it.
- [x] **A SKU collision is `refused`, not fatal, and the rest of the batch still commits.** Arrange a
      product literally named `0002-39` (0029 **D-4.5** case (a)), generate Talla 38/39/40, and assert:
      two variants created, one entry in `refused` whose message names the conflicting product, and
      **zero orphan pivot rows** for the refused combination.
- [x] **An unexpected failure rolls the whole batch back.** Register a `ProductVariant::creating` hook
      that throws a non-`ValidationException` on the third combination, and assert **zero**
      `product_variants` and **zero** pivot rows exist for that product afterwards. This is the only
      test that proves the outer transaction is real, and it is the one 0031 **D-3** point 3's
      half-built-catalog objection turns on.
- [x] **The batch cap refuses before writing**: a type selection whose product exceeds
      `MAX_COMBINATIONS` throws `ValidationException` on `attributeTypeIds`, the message carries both
      the limit and the attempted count, and **zero rows** exist. Pair it with a **boundary pair** —
      exactly `MAX_COMBINATIONS` accepted, one more refused — or the test cannot distinguish a correct
      cap from an off-by-one.
- [x] 🔴 **The cap is computed without materialising the product (D-G5).** Select five types of twenty
      values each (3.2M combinations) and assert the call returns a `ValidationException` **promptly
      and within a bounded memory envelope** — assert `memory_get_peak_usage()` does not grow past a
      stated ceiling across the call, and that the `attempted` figure in the message is `3200000`.
      A materialise-then-count implementation either OOMs or blows the ceiling; a
      multiply-the-sizes one is indistinguishable from a no-op. **This is the only test that can fail
      against defect 8.**
- [x] 🔴 **The empty-type check runs before the cap (D-G6).** A selection containing one type with
      **zero** values *and* enough other values to exceed the cap must be refused with the
      **empty-type** message, not the too-many one — because `array_product()` returns `0` for that
      input and would pass the cap silently. Assert the translation key, not the exception class.
- [x] **A selected type with no values is refused** on `attributeTypeIds` naming the type, with zero
      rows written — **not** silently reported as `attempted: 0`.
- [x] **Unknown, duplicated and empty type-id inputs** are refused, as a dataset, each on
      `attributeTypeIds` and each writing zero rows.
- [x] 🔴 **The two-pass validation bound (D-G8)**: an oversized `attributeTypeIds` submission (2,000
      ids against `max:5`) issues **zero** `product_attribute_types` existence queries and returns
      **one** error message. Count with `DB::listen()` registered **once** after a warm-up call
      (**FP-G3**), and additionally assert the **binding count** on the value-set read is ≤ 5.
- [x] 🔴 **Authorization (D-G0)**: an actor without `products.edit` gets `AuthorizationException`, and
      **zero rows** exist. Additionally assert the actor is told **nothing** — neither the attempted
      count nor which type is empty appears in the exception, the message or the logged context, even
      when the same call would have been refused by the cap or by the empty-type rule (**FP-G4**). A
      `Super Admin` with zero permission rows passes, and the refusal is logged with
      `target_type: 'product'` and the **parent product's** id.
- [x] 🔴 **The gate is asked once, not per row.** Spy on `LogRefusedPrivilegedAttempt` (or count
      `Gate` evaluations) across a successful 6-combination run and assert the *generator's own* call
      happened exactly once — the per-row `CreateProductVariant` gate is expected and separate. This
      pins the difference between "gate once, up front" and "discover the refusal mid-batch".
- [x] **The pre-read is one query, and the batch does not N+1.** Count queries for a 6-combination
      generation after a throwaway warm-up call, and assert the existing-combination lookup does not
      scale with the combination count — the property **D-G2**'s single `pluck` exists for.
- [x] **The global consistency invariant (0029 D-4.3) holds over generated rows too**: after a
      generation, every `product_variants` row's stored `sku` still equals the derivation of its
      current inputs, **with no exclusion for generated rows**.
- [x] **The race**: a `ProductVariant::creating` hook that inserts one of the batch's own combinations
      between the pre-read and its insert. The outcome must be a clean `skipped` entry — never a 500,
      never a duplicate — which proves the pre-read is a pre-check and the unique index the last word.

### Assertions that would be false passes if written naively

**FP-G1 — asserting a generated SKU by re-calling the derivation.** Tautological against any bug
inside the derivation itself: both sides are wrong identically. Assert **literal strings**. Carried
from 0029's **FP15**.

**FP-G2 — a generator test asserting only the created count.** `toHaveCount(6)` is satisfied by an
implementation that skips nothing, refuses nothing and reports nothing — the summary **is** the
contract (**D-G1**), not the row count. Assert the **whole shape** — `created`, `skipped`, `refused`
and `attempted` together — on a fixture that produces a non-empty value in each of the three lists at
once. A batch where nothing is skipped and nothing is refused cannot distinguish the three code paths.
Carried from 0029's **FP18**.

**FP-G3 — the "second run skips" test asserting only that no duplicate was created.** The duplicate
would also be refused by `unique(product_id, combination_hash)` if the pre-read did not exist at all,
so a row-count assertion passes against a generator with **no skip logic whatsoever** — it would simply
report the skip as a refusal, or 500. Assert the combination lands in **`skipped`** (not `refused`),
and that the pre-existing variant's own price, stock and `updated_at` are **unchanged**. Carried from
0029's **FP19**.

**FP-G4 🟠 — an authorization deny test that asserts only the exception class.** New with **D-G0**. An
implementation that validates, reads the value sets and computes the cap *before* gating still throws
`AuthorizationException` — and has already disclosed nothing directly, but has done the work and would
disclose on any change to the message. The test must assert the count and the empty-type name are
**absent**, on an input that would otherwise have produced them.

**FP-G5 🟠 — a cap test whose fixture is small enough that materialising is cheap.** New with **D-G5**.
201 combinations materialise instantly, so a boundary test alone cannot fail against a
materialise-then-count implementation. The cap-computation test needs a fixture whose cartesian product
is large enough that materialising it is *observably* different from multiplying its sizes.

### Explicitly not tested

Per [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md): the SKU derivation itself, the
combination hash, the cross-table collision check, the pivot write and the referential-integrity FKs
(all [0029](0029-product-variants-backend.md)'s, and duplicating them here would make two stories fail
for one change); Laravel's own transaction/savepoint mechanics beyond the two behavioural assertions
above; any generator markup, result table or pagination (0031).

## Expected outcome

An administrator can build a product's whole variant set in one gesture. Selecting the attribute types
Talla and Color generates the **full cartesian product** of their values — six variants for 3 × 2 —
each one an ordinary variant with an ordinary derived SKU, the parent product's price, no stock and no
image of its own. Running it again after adding a value creates only what is missing: combinations the
product already has are **skipped without being touched**, so a price already tuned on an existing
variant survives, and the action returns a summary — *created*, *skipped*, *refused* — so the
administrator is told *"8 variants created, 2 already existed"* rather than left to count. A
combination whose derived SKU collides is reported by name with the record it collided with, and the
rest of the batch still commits; an unexpected failure rolls the whole batch back, so there is no
half-built catalog. Batches larger than the cap are refused before anything is written — and refused
by arithmetic over the value-set sizes, so an absurd selection costs one read rather than three million
allocations.

An administrator who does not hold `products.edit` is refused before any of that runs, and learns
neither the attempted count nor which of their selected types is empty.

Nothing is user-visible yet: the generator UI that consumes all of this is story **0031**.

## Acceptance criteria

- [x] A cartesian generation creates **one variant per combination**, each with an ordinary derived
      SKU, the parent's price as a string, `stock = 0` and a **literally NULL** `featured_media_id`,
      ordered by **D-G6**'s sequence, with exactly N pivot rows per variant.
- [x] **Re-generating skips combinations that already exist without modifying them** — asserted on the
      existing rows' price, stock and `updated_at`, not merely on their continued existence — and
      reports created / skipped / refused / attempted in the summary shape **D-G1** defines.
- [x] A **SKU-colliding combination is refused by name** while the rest of the batch commits, with zero
      orphan pivot rows for the refused combination.
- [x] **An unexpected failure mid-batch leaves zero variants and zero pivot rows** for that product.
- [x] 🔴 **The batch cap is computed as the product of the value-set sizes**, before the cartesian
      product is materialised and before the transaction opens, refusing on `attributeTypeIds` with
      both `:limit` and `:attempted` in the message — proven by a fixture large enough that
      materialising would be observable.
- [x] 🔴 **The empty-type refusal runs before the cap multiplication** and wins on an input that would
      trip both.
- [x] 🔴 **The action authorizes `update` on the parent product once, as its own first statement**,
      before validation, the value-set read, the cap check and the transaction — with a deny test
      asserting zero rows **and** that neither the attempted count nor the empty type name is
      disclosed, a `Super Admin` bypass test, and a refusal logged with `target_type: 'product'`.
- [x] 🔴 **`attributeTypeIds` is validated in two sequential `Validator::make(...)->validate()` calls**,
      proven by a zero-query assertion for an oversized submission and a binding-count assertion on the
      value-set read.
- [x] The two `attributeTypeIds` rule methods are **appended to 0029's
      `ProductVariantValidationRules`**, entity-prefixed, with no second trait created.
- [x] The generator **re-implements nothing** — a grep shows no second copy of the derivation, the
      hash, or the cross-table collision check, and every write goes through `CreateProductVariant`.
- [x] `lang/en/products.php` and `lang/es/products.php` are **extended** key-for-key identically with
      the three `products.variants.generate.*` keys, and no user-facing string is hardcoded.
- [x] No migration, no schema change, no new permission string, no route, no Livewire component, no
      Blade view, no browser test.
- [x] Pint clean and Larastan level 7 clean.

## Definition of Done

- [x] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule. ⚠️ **Partially
      discharged, recorded honestly rather than claimed in full.** The 25-test new suite is green
      (119 assertions), and `DB_DATABASE=testing0029 vendor/bin/pest tests/Feature/Products
      tests/Unit` — the full blast radius of every file this story touches — is green (595/595,
      1513 assertions). Two separate attempts at one single unscoped `vendor/bin/pest` run both
      hung indefinitely in the browser-test layer (a spawned `playwright run-server` sitting
      near-idle for 15–45+ minutes on this session's shared host) and were killed rather than left
      running — the same class of environmental failure this project's own
      [errors-log.md](../../../docs/errors-log.md) and
      [testing/frontend/playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md)
      already document (orphaned Playwright processes, sustained-session-load degradation), not a
      regression this story's diff could plausibly cause (it touches zero routes, Livewire
      components, Blade views or JS). An **earlier**, successfully-completed unscoped run (before
      this story's Phase 4/5 fix round, which touched only the four backend files already covered
      by the 595/595 re-run above) showed 1739/1739 non-browser tests green and a subsequent
      isolated `tests/Browser` re-run green at 96/96 (3 skipped) — the accepted disambiguator this
      project's own errors-log entries use for exactly this failure signature. A follow-up single
      clean unscoped run on a less-contended host is still owed and is not being claimed here.
- [x] `vendor/bin/pint --format agent` (unscoped, **not** `--dirty`) and `vendor/bin/phpstan analyse`
      (level 7) both clean, **and both recorded** — a gate absent from the record is a gate that did
      not run ([errors-log.md](../../../docs/errors-log.md)). Both re-run and clean after the Phase
      4/5 fix round: `vendor/bin/pint --format agent` → `{"result":"passed"}`;
      `php -d memory_limit=3G vendor/bin/phpstan analyse` → `{"result":"passed","errors":0}`.
- [x] Code reviewed (code-reviewer). First pass found FP-G2's combined-outcome test missing, the
      missing `attributeTypeIds` read-back count guard, and the binding-count test's dead branch —
      all three fixed (see the action's own diff and the strengthened test file) and re-verified
      green.
- [x] No security findings (appsec-auditor). Point the audit at three things specifically: **D-G0**
      (the gate runs before every disclosing computation, on every path, and the per-row re-check is
      not bypassable), **D-G5** (the cap cannot be reached with an unbounded allocation), and
      **D-G8** (the two-pass validation, and the binding count on the value-set read). All three
      **PASS** as specified. First pass additionally found and closed: a Medium (nested
      `CreateProductVariant` `attempts: 3` silently inert inside this action's own transaction —
      fixed by adding `attempts: 3` to the outer transaction itself, verified safe since every
      mutable accumulator is created fresh inside the closure) and three Lows (unbounded value-row
      hydration before the cap — now a bounded aggregate `COUNT` read first; no `uuid` format bound
      on each `attributeTypeIds` element — added; the missing read-back count guard on
      `attributeTypeIds`, the same finding code-reviewer made independently — added). Re-verified
      clean.
- [x] 🔴 **Executed in Phase 3, not assumed (D-G2)**: whether InnoDB releases the `X,GAP` locks
      **V-H** describes when they were taken inside a savepoint that is subsequently rolled back, or
      holds them to the end of the outer transaction. The batch is correct either way — the answer
      decides only how much of the SKU namespace a generation blocks and for how long, and therefore
      whether `MAX_COMBINATIONS = 200` (**OQ-G1**) is comfortable or generous. This project's culture
      requires that to be a command result rather than a reading; **record it as a new V- finding in
      this file.** ✅ Done — see [**V-G1**](#verified-environment-findings): the lock is released at
      `ROLLBACK TO SAVEPOINT`, not held to the outer transaction's end. `MAX_COMBINATIONS = 200` needs
      no lowering on this basis.
- [x] Documentation updated (docs-keeper): [database/schema.md](../../../docs/database/schema.md)'s
      `product_variants` section records that a batch generator is a second writer of the table and of
      `product_variant_values`, and that it writes through `CreateProductVariant` rather than in bulk.
      Also widened `architecture/authorization.md`, `conventions/base-standards.md`,
      `conventions/naming.md` and `security/derived-column-invariants.md` (the substantive one — the
      stale "`Editor::save()` is the domain's only outer transaction" claim, and the new
      nested-`attempts`-fires-only-at-nesting-level-1 mechanism).
- [x] **Hand-off recorded for story 0031**: the action is named
      **`GenerateProductVariantCombinations`** (0031 calls it `GenerateProductVariants` — the name
      that ships is this one); its UI must render the `created`/`skipped`/`refused` summary as a
      result table and inherits the pagination consequence 0031's own OQ-2 flagged (a capped batch is
      still up to `MAX_COMBINATIONS` rows arriving at once); and the `attributeTypeIds` bag key is
      **unbound on 0031's screen**, so it must be rendered explicitly or the refusal is invisible while
      every backend test stays green (0031 **D-8**). Recorded here in this file's own text, and
      restated in the [epic-2 digest](../_digests/epic-2.md)'s Story 0029b section below.
- [x] 🟠 **Digest entry appended** to [`ai-spec/tasks/_digests/epic-2.md`](../_digests/epic-2.md) at
      Phase 6/7, per [workflow.md](../../../docs/workflow.md#decision-digest-per-epic).
- [x] Acceptance criteria met.

## Dependencies and risks

### Dependencies

- **[0029](0029-product-variants-backend.md) — hard, blocking, and must reach Phase 7 first.** This
  story writes nothing itself: it calls `CreateProductVariant`, reads `product_variants.combination_hash`,
  and appends to `ProductVariantValidationRules`. None of those exists until 0029 ships.
- **What it consumes from 0029, named exactly so the contract cannot drift**: `CreateProductVariant`'s
  signature (**D-17.1**), its per-call `DB::transaction()` (which becomes this story's savepoint), its
  `ValidationException`-on-refusal behaviour (so a per-row failure is catchable rather than fatal),
  `unique(product_id, combination_hash)` (which serves the pre-read as a covering scan),
  `HashVariantCombination` and `DeriveVariantSku`, `ProductVariant::label()`, and
  `ProductVariantValidationRules`.
- **No file overlap with [0029a](0029a-attribute-in-use-delete-guards-backend.md).** The two siblings
  could run in parallel; sequential (0029 → 0029a → 0029b) is the safe default given 0029's **R-J**.
- **Story 0031 depends on this one** (the generator UI).

### Risks

- **R-G1 — the generator holds its locks for the whole batch.** *(0029's R-O.)* Up to
  `MAX_COMBINATIONS` variants are created inside a single transaction, each taking 0029 **D-4.5**'s two
  `lockForUpdate()` reads, so the batch can hold a large set of `X,GAP` locks across both
  `products.sku` and `product_variants.sku` for its full duration — the same exposure 0029's **R-M**
  names for its re-derivation cascade, now reachable from a single deliberate gesture rather than only
  as a side effect of a rename. Mitigated by the cap (**D-G5**) and by the fixed lock order
  (0029 **D-4.5**), which keeps the deadlock class closed rather than merely narrow. ✅ **Its true size
  is now measured, not merely bounded**: [**V-G1**](#verified-environment-findings) confirms
  `ROLLBACK TO SAVEPOINT` releases a candidate's locks immediately, so only the combinations that
  actually **commit** hold their locks for the batch's full duration — a *refused* or *skipped*
  candidate's window is as short as its own savepoint. **Not eliminated**, since a full 200-combination
  create-everything batch is still the worst case and it is real, but the window does not additionally
  grow with refused/skipped candidates the way an unmeasured reading would have to assume. Note the
  interaction: a generation and a product-SKU rename running concurrently are the two heaviest lock
  holders in this epic and they touch the same two indexes.
- **R-G2 — "skipped" and "refused" are easy to conflate, and conflating them is a data-loss story.**
  *(0029's R-P.)* The two outcomes look adjacent in the summary and are opposite in meaning: *skipped*
  means the combination already exists and was **deliberately left untouched**; *refused* means it
  could not be created. An implementation reporting one as the other is not merely mislabelled — the
  natural "fix" for a mis-reported refusal is to make the generator overwrite what it finds, which is
  **D-G7**'s rejected re-pricing behaviour arriving by the back door. Mitigated by **FP-G3** and by the
  untouched-row assertions in the second-run test; the vocabulary is fixed in **D-G1** and lives in
  `lang/`, never in ad-hoc strings.
- **R-G3 — three of 0029's four SKU refusals share the `sku` bag key**, and the generator surfaces
  them as free-text `message` strings inside `refused`. *(0029's R-Q, one layer out.)* A test asserting
  only that an entry landed in `refused` cannot tell `derived_sku_taken` from `derived_sku_too_long`.
  Assert the message.
- **R-G4 🟠 — the cap's computation is a one-line regression away, permanently.** New 2026-09-04.
  `count(cartesian($sets))` is the shorter, more obvious expression and is what a refactor toward
  "readability" produces. It passes every functional test in this file except the one written
  specifically against it (**FP-G5**), and its failure mode is an OOM fatal on a payload that is
  refused either way. Mitigated by that test, and by an inline comment at the multiplication saying
  why it is not a `count()`.
- **R-G5 🟠 — this story is a consumer of a contract that lands one story earlier.** New with the
  split. Everything under [Dependencies](#dependencies) is a seam 0029 could move. Mitigated by naming
  each consumed element explicitly rather than by re-describing it, and by strict sequencing — but a
  change to `CreateProductVariant`'s signature or to its transaction shape during 0029's Phase 3
  silently invalidates **D-G2**'s savepoint reasoning, which is the load-bearing one.

## Open questions

None blocks Phase 2. **OQ-G2 depends on 0029's OQ-2 and must be answered after it.**

**OQ-G1 — Confirm `MAX_COMBINATIONS = 200` as the batch cap.** **Recommended: 200** (**D-G5**). The
mechanism is not in question — a cap computed by multiplying the value-set sizes, checked before the
transaction opens, refusing on `attributeTypeIds` with the limit and the attempted count in the
message — only the constant. 200 sits at the top of what a real clothing catalog generates in one
gesture (5 sizes × 8 colours × 5 materials is exactly 200), while 5 types × 4 values (1,024) is
comfortably refused.
- ✅ **Resolved: stays at 200.** [**V-G1**](#verified-environment-findings) found gap locks are
  **released** at `ROLLBACK TO SAVEPOINT`, not held for the whole outer transaction — the condition
  under which this question recommended lowering the cap toward 100 does not hold.
- Raise it only with a concrete catalog shape that needs it; note that whatever the number, the *UI*
  consequence is a result table of that many rows, which is 0031's pagination question.

**OQ-G2 — Confirm that a generated variant takes the parent product's `price`.** **Recommended: yes**
(**D-G4**), with `stock = 0` and `featured_media_id` NULL. Stated as a question rather than assumed
because "leave price at the column default" is the intuitive answer and is **not available** —
`product_variants.price` is NOT NULL with no default (0029 **D-6**), so something has to supply a
number. Copying the parent's price is what 0029 **D-6** already promised the UI would do for a single
variant, done one layer down so the generator is not the one place that behaves differently.
- Alternative: require the caller to pass one price applied to every generated row. Strictly worse —
  the only sensible value the caller has *is* the parent's price.
- ⚠️ **This question disappears if 0029's OQ-2 flips**: a nullable-and-inheriting `price` makes the
  answer "leave it NULL" and deletes **D-G4** rather than changing it. **Answer 0029's OQ-2 first.**

**OQ-G3 — Should the generator also be reachable for a *subset* of a product's existing axes?** Today
it takes exactly the type ids it is given and generates their full product (**D-G6**), which means
re-generating after adding a **value** works naturally, while adding a whole new **type** to a product
that already has variants produces combinations that do not include the new axis for the old rows — the
old variants stay as they are, correctly, but the catalog then holds combinations of differing arity.
**Recommended: accept it, and change nothing.** 0029's **D-3** already treats a subset as a legitimate
distinct combination, so this is that decision's natural consequence rather than a new defect, and the
alternative (regenerating existing variants against a new axis) means creating rows that duplicate an
existing variant's stock and price with no way to say which is real. Flagged because the first
administrator to add a third type to a live product will ask, and because 0031 may want to warn.

## Provenance

Split out of [0029](0029-product-variants-backend.md) on **2026-09-04**, at Phase 2, after
`code-reviewer` failed that story on INVEST **"Small"** — with the specific finding that this
generator, added by PO decision on **2026-08-19**, had *reversed a scope fence* and was never
re-weighed against 0029's own **R-K** size assessment (dated 2026-08-18, and about the derived-SKU
amendment only). The reviewer named this as the cleanest cut and it is: purely additive, no schema, no
shared file, re-implements nothing.

**Every decision here is 0029's D-18, carried over rather than re-debated** — renumbered D-G1–D-G7,
with its four PO sub-decisions intact (the summary array over a bare `Collection`; the parent's price
because "leave it at the default" is not available; a cap rather than a faster write; a loud refusal
for an empty attribute type). The four `V-` findings it leans on (**V-A**, **V-H**, **V-10**, **V-T**)
are inherited from 0029's own Verified environment findings and are not restated here.

**Three things are new in this file**, each a Phase 2 correction verified against the real shipped code
rather than reasoned about: **D-G0** (the action self-authorizes, once, up front — following 0029's own
newly-decided **D-12.1**), **D-G5**'s multiplication rule (the cap must never materialise the cartesian
product first), and **D-G8** (the two-pass validation shape from
[array-validation-bounds.md](../../../docs/security/array-validation-bounds.md), which did not exist as a
documented rule when this generator was first specified). Each carries its own test and its own false
pass — **FP-G4**, **FP-G5** and the two-pass bound case — because none of the three can fail against
the tests carried over from 0029.

---

> **Link-integrity note for whoever moves this file.** Every relative link above is written for
> `ai-spec/tasks/` (two levels below the repo root). Moving this file to `in-progress/` or `done/`
> puts it **three** levels down and silently breaks all of them — `../../docs/...` must become
> `../../../docs/...`, and the sibling-task links (`0029-...md`) must become `../0029-...md`. This is
> a mandatory step, not a nicety: see
> [workflow.md](../../../docs/workflow.md#link-integrity-check-on-every-stage-move) and the
> [errors-log entry](../../../docs/errors-log.md) recording the six `done/` files this already broke.
