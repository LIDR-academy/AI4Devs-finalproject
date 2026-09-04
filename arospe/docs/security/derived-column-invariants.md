# Derived columns: every invariant must hold at every write site

Established by story **0029**'s Phase 4 audit (product variants — the derived `product_variants.sku`).
This is the first page here about a **stored derived column** — a value the application computes from
other rows and then persists, rather than one a user supplies.

> 🟢 **Status: both sections below are ✅ CLOSED as of 2026-09-04** (closed by the same day's
> remediation and verified by this page's own author at the Phase 4 re-audit — the slot the ❌/✅
> framing was written to leave open, per
> [errors-log.md](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20)'s
> audit-authored-page rule). Every ❌ block below is kept verbatim as the record of what shipped from
> Phase 3 — each claim about it was **reproduced by execution** against this worktree's MySQL 8.4
> instance, not reasoned about — and is now followed by the shipped ✅ rather than being deleted.
>
> ⚠️ **The remediation introduced one new finding of its own**, recorded in
> [What the remediation introduced](#what-the-remediation-introduced-a-retried-transaction-is-a-retry-safe-unit-or-it-is-a-lost-update)
> below. **Corrected 2026-09-04 (second re-audit, same day): that section is now ✅ CLOSED too** — it
> read *"That section is ❌ **OPEN** as of 2026-09-04"*, which stopped being true the moment
> `UpdateProduct` dropped its `attempts: 3`. The sentence is kept here rather than deleted, per the
> same audit-authored-page rule the paragraph above cites: a page written *during* an audit documents
> a state the remediation is expected to change, so its own claims go stale first.

## Table of Contents

- [The rule](#the-rule)
- [Why a derived column concentrates this failure](#why-a-derived-column-concentrates-this-failure)
- [❌ The three guards that exist on one write site and not the others](#-the-three-guards-that-exist-on-one-write-site-and-not-the-others)
- [✅ What closes it](#-what-closes-it)
- [The review question](#the-review-question)
- [Related: re-loading a relation does not re-read the key it resolves through](#related-re-loading-a-relation-does-not-re-read-the-key-it-resolves-through)
- [What the remediation introduced: a retried transaction is a retry-safe unit, or it is a lost update](#what-the-remediation-introduced-a-retried-transaction-is-a-retry-safe-unit-or-it-is-a-lost-update)
- [Confirmed safe: `causedByConcurrencyError()` matches a message, not a class](#confirmed-safe-causedbyconcurrencyerror-matches-a-message-not-a-class)

## The rule

**Every invariant a derived column's *creating* writer enforces must be re-enforced at every
*re-derivation* writer, or the invariant is a property of one code path rather than of the column.**

A derived value has more write sites than an ordinary one, and they are easy to miss because they do
not look like writes to that column at all — they look like edits to the column's *inputs*. In story
0029 there are three writers of `product_variants.sku`:

| Writer | Looks like | Enforces the length cap? | Enforces the empty-segment rule? | Catches `1062`? |
| --- | --- | --- | --- | --- |
| `CreateProductVariant` | creating a variant | ✅ | ✅ | ✅ (and disambiguates *which* unique index) |
| `UpdateProduct::reDeriveVariantSkus()` | renaming a **product** | ❌ | ❌ (n/a — values unchanged) | ⚠️ caught, but attributed to the product's own `sku` |
| `SyncProductAttributeValues::reDeriveVariantSkusForRenamedValues()` | renaming an **attribute value** | ❌ | ❌ | ❌ |

Only the first row *reads* as a SKU writer. The other two are the whole point: an administrator
renaming a colour on a taxonomy screen is, transitively, the author of a new value in a `UNIQUE`,
length-capped column on a different table.

> ✅ **The table above is the Phase 3 state. Every cell in it reads ✅ today** — all three writers now
> call `DeriveVariantSku::checked()` for the first two columns, and both cascades gained a `1062`
> catch for the third. Re-verified at the re-audit by enumerating the writers rather than trusting the
> fix: `grep -rn "product_variants'\|ProductVariant::" app/` returns exactly these three classes as
> writers of `product_variants.sku`, and none of them reaches `DeriveVariantSku::__invoke()` directly.

## Why a derived column concentrates this failure

The creating writer is where the invariants get written, because it is where the design conversation
happens — it is the class the story is named after, the one with the docblock, the one every test
targets. The re-derivation sites are added later in the same story as *retrofits to other stories'
files*, under a different heading ("the cascade"), and they are reviewed against the question **"does
the SKU follow its inputs?"** rather than **"is this a legal SKU?"**.

Both cascades here answer the first question correctly and neither asks the second.

## ❌ The three guards that exist on one write site and not the others

`CreateProductVariant` gets it right, and is the reference:

```php
// app/Actions/Products/CreateProductVariant.php — the creating writer
foreach ($ordered as $value) {
    if ($deriveVariantSku->segment($value->value) === '') {
        throw ValidationException::withMessages([
            'sku' => trans('products.variants.derived_sku_empty_segment', ['value' => $value->value]),
        ]);
    }
}

$sku = $deriveVariantSku($product->sku, $orderedValues);

if (mb_strlen($sku) > DeriveVariantSku::MAX_LENGTH) {
    throw ValidationException::withMessages([
        'sku' => trans('products.variants.derived_sku_too_long', ['max' => DeriveVariantSku::MAX_LENGTH]),
    ]);
}
```

Neither cascade carries either guard. The re-derivation loop is only:

```php
// app/Actions/Products/SyncProductAttributeValues.php — the value-rename cascade (❌ as shipped)
foreach ($variants as $variant) {
    $orderedValues = $variant->values->pluck('value')->all();
    $newSkus[$variant->id] = $deriveVariantSku($variant->product->sku, $orderedValues);
}

// ...a cross-table conflict pre-check per new SKU, then:

foreach ($newSkus as $variantId => $newSku) {
    DB::table('product_variants')->where('id', $variantId)->update([
        'sku' => $newSku,
        'updated_at' => now(),
    ]);
}
```

Three reproduced consequences, all with `sql_mode` including `STRICT_TRANS_TABLES` (**V-A**):

- **The length cap is enforced by MySQL instead of by the application.** `product_attribute_values.value`
  is `max:100` and a combination holds up to ten of them, against a `varchar(128)` `sku` — so renaming
  one value to a long string is enough. Reproduced: `SQLSTATE[22001] … 1406 Data too long for column
  'sku'`, an unhandled `QueryException` reaching the caller, on both cascades. This is precisely the
  outcome the story's own test checklist forbids (*"refused cleanly, not truncated and not a raw
  `1406`/`22001`"*) — that checklist item exists, and is satisfied only on the creating path.
- **The empty-segment rule is not enforced at all on the rename path.** Reproduced: renaming a value to
  `'???'` (which `segment()` reduces to `''`) raises **no exception** and stores the SKU `AA-`. The
  D-4.4 invariant that a value reducing to the empty string is *refused loudly* holds only at creation.
- **The pre-check compares each new SKU against the rows' *pre-rename* values**, so two variants whose
  renamed segments collide with each other both pass the check and the second `update()` hits the
  unique index. Reproduced: an uncaught `UniqueConstraintViolationException` (`1062 … for key
  'product_variants.product_variants_sku_unique'`). The transaction does roll back cleanly — atomicity
  is not the defect — but the administrator gets a 500 rather than the `derived_sku_taken` message that
  exists for exactly this case.

The severity is error-handling and data integrity rather than access control: no guard is *bypassed*,
and the enclosing transaction rolls back in every reproduced case. What escapes is a raw
`QueryException`, whose message carries the SQL statement plus the connection's host, port and database
name into the log and — at `APP_DEBUG=true` — onto the page.

## ✅ What closes it

**Move the invariant into the derivation's own seam, so no writer can call it and skip the check.**
Three writers each remembering three rules is the shape that produced this; the guards belong beside
`DeriveVariantSku`, which is already the single definition every writer shares:

```php
// app/Actions/Products/DeriveVariantSku.php — SHIPPED (2026-09-04). One checked entry
// point, called by all three writers; `__invoke()` remains for the pure derivation.
class DeriveVariantSku
{
    public const MAX_LENGTH = 128;

    /** @throws ValidationException */
    public function checked(string $productSku, array $orderedValues): string
    {
        foreach ($orderedValues as $value) {
            if ($this->segment($value) === '') {
                throw ValidationException::withMessages([
                    'sku' => trans('products.variants.derived_sku_empty_segment', ['value' => $value]),
                ]);
            }
        }

        $sku = $this($productSku, $orderedValues);

        if (mb_strlen($sku) > self::MAX_LENGTH) {
            throw ValidationException::withMessages([
                'sku' => trans('products.variants.derived_sku_too_long', ['max' => self::MAX_LENGTH]),
            ]);
        }

        return $sku;
    }
}
```

Two further rules the cascades need on top of it:

- **A batch pre-check must compare against the batch's own pending values, not only against the
  database.** Collect every new value first, assert the batch is internally unique, *then* check it
  against the rows that are not being rewritten. The existing `->where('id', '!=', $variantId)`
  exclusion is what makes the database half correct and is also what makes the batch half invisible.
- **A re-derivation site needs the same last-word `1062` catch its creating sibling has** — including
  `CreateProductVariant::translateRaceViolation()`'s disambiguation between the two unique indexes on
  `product_variants` (`product_variants_sku_unique` vs.
  `product_variants_product_id_combination_hash_unique`; both names verified against
  `php artisan db:table product_variants`). `UpdateProduct` has a `1062` catch but attributes every one
  of them to the *product's* own `sku`, which is now wrong for the variant rows its own cascade writes.

> ✅ **Both shipped, with one detail worth knowing before extending it.** The batch pre-check is
> `array_diff_key($newSkus, array_unique($newSkus))`, computed **before any database query runs** in
> both cascades. The disambiguation was extracted into
> [`App\Actions\Products\TranslateProductVariantUniqueViolation`](../../app/Actions/Products/TranslateProductVariantUniqueViolation.php)
> — a stateless translator that reads the violated index's own name out of the exception and returns
> the matching `ValidationException`, **never putting the index name, the SQL or the connection
> details into the message it returns**; an unrecognised index re-throws the original rather than
> guessing. `SyncProductAttributeValues`' write loop uses that translator; `UpdateProduct`'s outer
> `1062` catch does **not** — it re-implements the same index-name test inline. That is a second
> implementation of one rule, and the shape this project's own conventions warn about; it is behaviourally
> correct today only because `UpdateProduct`'s cascade never writes `combination_hash`, so its two
> variant branches collapse to one message.
>
> ✅ **Closed 2026-09-04 (second re-audit, finding R-3).** `UpdateProduct` no longer re-implements the
> index-name test: it constructor-injects `TranslateProductVariantUniqueViolation` and calls it, so
> there is exactly one implementation of *"which index was this"* behind all three writers. The
> translator gained an optional `?string $overrideMessage` for it, because the same two indexes mean a
> different thing to a **parent-SKU-change cascade** than to a newly-created variant
> (`products.variants.parent_sku_change_collides`, always under the `sku` key, rather than
> `derived_sku_taken` / `duplicate_combination` under `sku` / `combination`). Re-checked as new code:
> the override is a `trans()` key resolved at the call site, never anything derived from the exception,
> so it opens **no new path for the index name, the SQL or the connection details to reach an
> actor-facing message** — the translator still returns only `trans()` output on both branches and
> still re-throws the original for an unrecognised index. `tests/Feature/Products/ProductVariantSkuUniquenessTest.php`'s
> F-6 test pins the behaviour through a genuine injected race (`DB::listen` inserts the colliding row
> *after* the cascade's own pre-check has run and found nothing), so it exercises the catch rather than
> the pre-check, and asserts the rollback of both the product's and the variant's SKU.
>
> ⚠️ **Neither cascade's per-row database pre-check excludes the rest of its own batch** — it excludes
> only `$variantId` (`->where('id', '!=', $variantId)`). Every *other* variant in the batch still holds
> its pre-rename SKU at check time, so a rename that merely **rotates** two SKUs between two variants
> of the same batch is refused with a collision message even though the end state is legal. Fail-closed
> and therefore not a security finding, but a real false refusal; the fix is to exclude
> `array_keys($newSkus)` rather than one id, which is safe precisely *because* the batch-internal
> `array_unique` check above already rules out a genuine within-batch duplicate.
>
> ✅ **Closed 2026-09-04 (second re-audit, finding R-4) — with one honest narrowing of what "rotates"
> can mean.** Both cascades now compute `$batchVariantIds = array_keys($newSkus)` and use
> `->whereNotIn('id', $batchVariantIds)` on the `product_variants` half of the pre-check. Re-verified
> as new code, three ways:
>
> 1. **The exclusion covers the whole batch, not part of it.** `$newSkus` is keyed by variant id and is
>    populated for *every* variant the cascade fetched, before any check runs, so `array_keys()` is the
>    complete batch by construction — there is no path that checks a row it did not also exclude.
> 2. **The ordering that makes the widening safe is unchanged and is the part to preserve.** The
>    batch-internal `array_diff_key($newSkus, array_unique($newSkus))` check runs **first**, before the
>    database is consulted at all, in both cascades. Reversed, the batch-wide exclusion would hide a
>    genuine same-batch duplicate from every check — so if a future edit moves the database loop above
>    the `array_unique` one, that is the regression to catch.
> 3. **The `whereNotIn` does not weaken D-4.5's race guard.** The clause is an extra predicate on a
>    locking read whose driving condition is still equality on `product_variants_sku_unique`; when no
>    row holds the value, InnoDB's gap lock is taken at the insertion point regardless of any
>    non-driving filter, which is the case the guard exists for. The two cross-table checks also keep
>    their fixed order (`products`, then `product_variants`), so the deadlock-avoidance argument is
>    untouched. Ids are bound parameters read out of the database, never actor input.
>
> **The narrowing:** a *true* two-element swap (A ↔ B, each taking exactly what the other holds) can
> never succeed through sequential single-row `UPDATE`s against an immediately-enforced `UNIQUE` index —
> MySQL has no deferred constraints, so whichever row writes first collides. What R-4 actually buys is
> the **one-directional chain** (A's new SKU lands on B's old SKU while B's own new SKU is untaken),
> which a real write order *can* complete and which the pre-check previously refused before either
> write was attempted. The test file states this limitation explicitly; the inline code comments say
> only "rotates", which reads as the stronger claim. Two consequences worth knowing before extending
> this: the true swap now fails at the **write**, not the pre-check — still a clean, fully-rolled-back
> `ValidationException` via the `1062` catch, never a raw database error — and which of the two
> outcomes a chain gets depends on the order the batch is written in, which is explicit
> (`Product::variants()`'s `orderBy('position')->orderBy('sku')`) in `UpdateProduct`'s cascade and
> **unordered** in `SyncProductAttributeValues`' own `ProductVariant::query()->whereHas(...)` fetch.
> Fail-closed in every ordering, so this is a UX and test-stability note rather than a finding.

## The review question

> **Who else can change this column's inputs, and does that path enforce everything the column's own
> writer does?**

Ask it of every stored derived value. The answer is never "just the class the story is named after" —
the inputs are on other tables, edited from other screens, by other stories' shipped actions. The
same question applied to a *hash* rather than a SKU is what
[database/schema.md](../database/schema.md#product_attribute_values) already records as story 0029's
dependency on 0028's id-stability guarantee: a derived column's correctness is a property of the whole
set of paths that can move its inputs.

## Related: re-loading a relation does not re-read the key it resolves through

A second, smaller finding from the same audit, recorded here because it is the derived-value idea
applied to an **authorization target**. `UpdateProductVariant` and `DeleteProductVariant` authorize
against the variant's parent product, and correctly reload the relation first, per
[model-instance-trust.md](model-instance-trust.md):

```php
// app/Actions/Products/DeleteProductVariant.php (❌ as shipped)
$variant->load('product');

$this->logRefusedPrivilegedAttempt->authorize(
    'update',
    $variant->product,
    targetType: 'product',
    targetId: $variant->product->id,
);

return (bool) $variant->delete();
```

`load('product')` re-reads the **product**, but it resolves *which* product from the caller's
in-memory `$variant->product_id` — which is mass-assignable on `ProductVariant`
(`#[Fillable(['product_id', …])]`) and is simply a public attribute besides. `delete()` then acts on
`$variant->getKey()`. So the row acted on and the row authorized against come from two different
sources, and a caller that stages the instance decides which product the gate sees. Reproduced: a
variant belonging to product `VICTIM` was deleted while the gate evaluated `update` against product
`DECOY`.

**No shipped caller does this** — story 0029 ships no Livewire component or route at all, and story
0031's editor will resolve variants with `findOrFail()`. It is a latent shape, not a live bypass. The
rule it illustrates is worth keeping regardless:

> **Re-read the *subject* of the operation, not only the relation you authorize through.** A relation
> refreshed from an in-memory foreign key is exactly as trustworthy as that foreign key.

The concrete fix is one line — resolve the variant from the database inside the action
(`$variant = ProductVariant::query()->with('product')->findOrFail($variant->getKey())`) and act only
through that instance, the same "re-fetch the row and read/write only through that instance" remedy
[model-instance-trust.md](model-instance-trust.md) already prescribes for `SalesRegion`. Removing
`product_id` from `ProductVariant`'s `#[Fillable]` is worth doing beside it (a variant's parent is
fixed at creation and `CreateProductVariant` writes it through `forceCreate()` anyway), but it is
defence in depth, not the fix — `save()` writes the whole dirty set, so the omission is a
mass-assignment guard and not an integrity one.

> ✅ **Both shipped, and the ordering is the part to preserve.** `UpdateProductVariant` and
> `DeleteProductVariant` open with
> `ProductVariant::query()->with('product')->whereKey($variant->getKey())->firstOrFail()`, and that
> re-fetch is the method's **first statement** — above the `Gate` call, above validation, above any
> transaction, per D-12.1. The caller-supplied `$variant` is shadowed immediately and nothing reads it
> in between, so there is no window in which validation ran against one instance and the gate against
> another. `#[Fillable]` is now `['price', 'stock', 'featured_media_id', 'position']`. The
> `#[Fillable]` change is invisible to `ProductVariantFactory`, which is not a counter-example: Laravel
> factories build models inside `Model::unguarded()`, so mass-assignment rules never applied there in
> the first place — and the factory assigns `product_id` explicitly in its own `afterMaking()` anyway.
>
> One consequence to know rather than to fix: `firstOrFail()` on a variant that no longer exists throws
> `ModelNotFoundException` (404) **before** the gate runs, so a missing variant and an unauthorised one
> are distinguishable. That is the same ordering every route-model-bound screen in this app already
> has, and `product_variants.id` is a UUIDv7 with no enumerable surface, so it discloses nothing an
> actor could act on.

## What the remediation introduced: a retried transaction is a retry-safe unit, or it is a lost update

❌ **As found (first re-audit, 2026-09-04) — ✅ closed the same day by the second re-audit; see the
block at the end of this section.** Found by re-auditing the fix as new code, per
[errors-log.md](../errors-log.md#two-of-the-three-security-audit-rounds-found-the-flaw-in-the-previous-rounds-fix--2026-08-19).
The ❌ text below is kept verbatim as the record of what shipped, per the audit-authored-page rule.

The same remediation added `attempts: 3` to three `DB::transaction()` calls, so that the fixed lock
order those transactions rely on converges under a deadlock instead of 500-ing. `attempts: N` changes
one thing about a closure that is easy to miss: **the closure can now run more than once, and a
rollback restores the database but not the PHP objects the closure mutated.**

```php
// app/Actions/Products/UpdateProduct.php — ❌ as shipped: $product is created OUTSIDE the closure
return DB::transaction(function () use ($product, $sku, /* … */): Product {
    $skuChanged = $product->sku !== $sku;

    $product->update(['sku' => $sku, /* … */]);   // attempt 1: syncOriginal() runs

    if ($skuChanged) {
        $this->reDeriveVariantSkus($product, $sku);   // ← a plausible deadlock site
    }

    return $product;
}, attempts: 3);
```

Executed rather than reasoned about — the Eloquent half, with no database involved:

| | attempt 1 | attempt 2 (after the rollback) |
| --- | --- | --- |
| `$product->sku !== $sku` | `true` | **`false`** |
| `isDirty()` after `fill()`, i.e. does `update()` issue SQL | `true` | **`false`** |

So a concurrency error anywhere in that closure — a genuine 1213, or the far likelier
`Lock wait timeout exceeded`, both of which `causedByConcurrencyError()` matches — makes attempt 2
**commit having written nothing**: the product's own column changes were rolled back and are never
re-applied, `$skuChanged` is now false so the variant cascade is skipped entirely, and the action
returns a `Product` whose in-memory attributes show the new values, so the caller reports success. A
silent lost update, reported as saved. `SyncProductGallery` shares the shape (`forceFill(...)->save()`
on the same outside-the-closure instance), so the featured-image write is lost with it.

✅ **The pattern this repo already had, one folder away** — pass **keys** into the closure and re-read
the rows inside it, so every attempt starts from the database:

```php
// app/Actions/SalesRegions/SetSalesRegionActive.php — the shape to copy
$regionKey = $region->getKey();
$replacementKey = $replacementDefault?->getKey();

return DB::transaction(function () use ($regionKey, $replacementKey, $active): SalesRegion {
    $rows = SalesRegion::query()->whereIn('id', [$regionKey, $replacementKey])
        ->orderBy('id')->lockForUpdate()->get()->keyBy(fn ($r) => $r->getKey());
    // …every model this closure writes was fetched by THIS attempt.
}, attempts: 3);
```

**The rule: adding `attempts: N` is a change to the closure's contract, not a flag.** Before adding it,
check that every model, collection or accumulator the closure writes to was created *inside* it — an
Eloquent model created outside is the common case, and it fails silently rather than loudly, because
`save()` on a non-dirty model is a successful no-op rather than an error.

⚠️ **A second, coupled fact: `attempts` on a nested transaction is inert, and all three of this
story's are nested on the only shipped path.** `Connection::handleTransactionException()` refuses to
retry while `$this->transactions > 1` — it converts the error to a `DeadlockException` and rethrows,
so only the **outermost** transaction's `attempts` ever fires. `App\Livewire\Products\Editor::save()`
opens its own `DB::transaction()` around `CreateProduct`/`UpdateProduct`, and that outer one takes no
`attempts` — so the retry never runs there, and the window the fix was aimed at is still open on the
screen that matters. **Do not close that half first.** Moving `attempts: 3` up to `Editor::save()`
without fixing the shape above converts a rare, loud 500 into a silent lost update on every retry.
`SetSalesRegionActive`'s own docblock already records the outermost-transaction rule; it is restated
here because this story is where the two halves first pull against each other.

> ✅ **Closed 2026-09-04 (second re-audit, finding R-1) — by removal, not by rewriting the closure.**
> `UpdateProduct`'s `DB::transaction()` now takes **no** retry parameter at all, with a comment above it
> stating why and naming this section. The key-passing shape above was considered and *not* adopted
> here: `UpdateProduct` returns the caller's own `$product` instance and its cascade reads
> `$skuChanged` from the pre-mutation attribute, so re-reading inside the closure would have meant
> re-shaping the action's return contract to close a window that removal closes outright. Verified as
> new code rather than taken on the diff's word:
>
> - **`attempts` is genuinely absent, and nothing reintroduces it one layer out.**
>   `grep -rn "attempts" app/` returns exactly two `}, attempts: 3` call sites in this domain —
>   `CreateProduct` and `CreateProductVariant` — plus the two pre-existing `SalesRegions` ones and
>   `UpdateProduct`'s own explanatory comment. `App\Livewire\Products\Editor::save()`, the only shipped
>   caller, still opens a plain `DB::transaction()` with no `attempts`, so no outer retry can resurrect
>   the mutating-closure problem from above. `tests/Feature/Products/ProductVariantSkuUniquenessTest.php`
>   pins this with a source-level assertion that also proves it can fail — it asserts the literal
>   `}, attempts:` **is** present in both siblings before asserting its absence in `UpdateProduct`,
>   rather than trusting a negative on its own (the vacuous-assertion trap
>   [errors-log.md](../errors-log.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18) records).
> - **The two retained `attempts: 3` are still retry-safe.** Both build the row they mutate *inside*
>   the closure with `forceCreate()`; a second attempt re-does real work rather than skipping it. Every
>   model either closure writes to is fetched or created by that attempt — `CreateProductVariant` reads
>   `$product` from outside but only reads it (`->id`, `->sku`, `->variants()`), never mutates it.
> - **The nested-inertness note above still stands and is now the *only* residual.** `Editor::save()`'s
>   outer transaction makes both retained `attempts: 3` inert on the shipped path, so the deadlock
>   window they were added for is still open on the screen. That is unchanged by R-1 and remains
>   correct as written — and R-1 is exactly why "move `attempts` up to `Editor::save()`" is not the fix:
>   an outer retry would wrap `UpdateProduct`'s mutating closure again, one level higher, and
>   reintroduce the silent lost update this section documents. Closing that half needs the
>   key-passing shape at `Editor::save()`, not a flag.

## Confirmed safe: `causedByConcurrencyError()` matches a message, not a class

Worth recording because the obvious mental model is wrong and the safety here is contingent rather
than structural. `Illuminate\Database\ConcurrencyErrorDetector::causedByConcurrencyError()` does **not**
test that the exception is a `QueryException`. It tests `$e instanceof PDOException` with SQLSTATE
`40001`, and otherwise falls through to `Str::contains($e->getMessage(), [...])` against ten literal
strings, **for any `Throwable`**. Verified by execution:

```php
$d = new Illuminate\Database\ConcurrencyErrorDetector();
$d->causedByConcurrencyError(ValidationException::withMessages(
    ['sku' => 'Deadlock found when trying to get lock']));   // true
$d->causedByConcurrencyError(ValidationException::withMessages(
    ['sku' => 'The derived SKU AA-X is already in use.']));   // false
```

`ValidationException`'s own message is `static::summarize($validator)` — **the first validation error
message**, interpolations included. So a `ValidationException` thrown inside a retried transaction is
retried whenever its rendered message happens to contain one of those literals, and every one of them
contains spaces.

This is inert here, and each step of that was checked rather than assumed. Only five messages can be
thrown inside these transactions (`duplicate_combination`, `derived_sku_taken`,
`derived_sku_empty_segment`, `derived_sku_too_long`, `parent_sku_change_collides`, plus
`validation.unique`/`validation.exists`), and only two interpolate anything: `:sku`, which
`DeriveVariantSku::segment()` restricts to `[A-Za-z0-9._/-]` and therefore cannot contain a space; and
`:value`, the raw attribute value — which reaches that message **only** when `segment($value) === ''`,
i.e. only when the value contains no letters or digits at all, so it cannot spell any of the literals
either. **The rule for the next story: a transaction with `attempts: N` must not throw an exception
whose message can carry user-controlled text**, or an ordinary validation refusal silently becomes
three times the work — and, with a mutating closure like the one above, three times the damage.

_Last updated: 2026-09-04 (second re-audit, same day) — **this page's own remaining ❌ is now ✅**, and
the correction is the entry: the status banner and the
[What the remediation introduced](#what-the-remediation-introduced-a-retried-transaction-is-a-retry-safe-unit-or-it-is-a-lost-update)
section both still said ❌ OPEN after `UpdateProduct` had already dropped its `attempts: 3`, which is
[the audit-authored-page failure mode](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20)
recurring on the page that cites it. Closed here with the ❌ text kept verbatim: **R-1** (closed by
removal — no `attempts` on `UpdateProduct`'s transaction, none reintroduced by `Editor::save()`, both
retained `attempts: 3` re-verified retry-safe, pinned by a source assertion that proves it can fail),
**R-3** (`UpdateProduct` now calls the shared `TranslateProductVariantUniqueViolation` with an
`?string $overrideMessage`; re-checked that the override is a `trans()` key from the call site and
opens no path for an index name or SQL to reach an actor-facing message), and **R-4** (both cascades
exclude `array_keys($newSkus)`, with the internal-duplicate check confirmed to still run **first**, the
gap-lock and fixed-lock-order arguments confirmed unaffected by the added `whereNotIn`, and one honest
narrowing recorded: a true two-element swap still cannot succeed through sequential updates against an
immediately-enforced `UNIQUE` index — it now fails at the write, cleanly and fully rolled back, rather
than at the pre-check)._

_Previously: 2026-09-04 (re-audit, same day) — both original sections closed by the story's own
remediation and re-verified here by execution, per the audit-authored-page rule. Added
[What the remediation introduced](#what-the-remediation-introduced-a-retried-transaction-is-a-retry-safe-unit-or-it-is-a-lost-update)
(❌ OPEN: `attempts: 3` over a closure that mutates an Eloquent model created outside it, with the
`SetSalesRegionActive` key-passing shape as the ✅, plus the coupled fact that `attempts` on a nested
transaction is inert and `Products\Editor::save()` is where the outermost one lives) and
[Confirmed safe: `causedByConcurrencyError()` matches a message, not a class](#confirmed-safe-causedbyconcurrencyerror-matches-a-message-not-a-class).
Two ⚠️ notes added inside the existing sections: the two cascades' per-row pre-check excludes only its
own row rather than the whole batch (a fail-closed false refusal on a two-variant SKU rotation), and
`UpdateProduct`'s outer `1062` catch re-implements the two-index disambiguation inline instead of using
the extracted translator._

_Previously: 2026-09-04 — created by story 0029's Phase 4 audit (product variants — core backend).
Both sections ❌ OPEN. Every reproduction was executed against this worktree (MySQL 8.4,
`STRICT_TRANS_TABLES`, `REPEATABLE-READ`) using temporary test files that were removed afterwards._
