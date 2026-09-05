# [0029a] Attribute type & value in-use delete guards — backend

## Description

Deleting a product attribute **value** (Size → "40") or an attribute **type** (Size) that any product
variant is built on must be **hard-refused with a message stating the exact count**, at every
privilege level, with no confirm-and-proceed path — instead of the raw MySQL `1451` an administrator
meets today.

This story exists because **[0029](../0029-product-variants-backend.md)** ships the
`product_variant_values` pivot whose `restrictOnDelete()` FK makes the refusal a database fact. The FK
holds integrity on its own; what is missing in front of it is the *message*. Story **0028** built the
seam for one half of this deliberately — `App\Actions\Products\DeleteProductAttributeType` exists as
its own named action for exactly this purpose, and
`#[Locked] public int $deletingTypeUsageCount = 0;` already sits in
`App\Livewire\Products\AttributeTypes\Index`'s public surface as a placeholder awaiting one query.

> 🟠 **Provenance — split out of 0029 on 2026-09-04, at Phase 2.** This is not new scope. All of it was
> **0029's D-10**, and 0029's own **R-K** had named it as *"the cleanest cut"* from the day that risk
> was written: *"Phase 2 should consider splitting the two in-use guards (D-10) into their own story —
> they are independently valuable and independently testable."* Phase 2 failed 0029 on INVEST
> **"Small"** and this is one of the two cuts that resolves it. Every decision below is 0029's,
> carried over rather than re-debated, **plus two corrections Phase 2 required** and one that follows
> from reading the shipped code:
>
> 1. 🔴 **The in-use count must be computed AFTER `Gate::authorize()`, never before** — the
>    `DeleteProductCategory` precedent (0024b/0025). See **D-A2**.
> 2. 🔴 **A database backstop, if added, must be narrowed to error `1451` and must NOT be folded into
>    `SyncProductAttributeValues`' existing `23000` catch** — that catch already means "duplicate
>    value", and 23000 covers both. See **D-A4**.
> 3. 🔴 **`SyncProductAttributeValues`' delete branch is currently wrapped in no `try`/`catch` at
>    all** — `writeRow()` wraps only the insert and update paths. Verified by reading the shipped
>    file. See **D-A4**.

It is **backend only** — no new screen and no new route. The one Livewire touch is replacing an
always-`0` placeholder with a real query on 0028's already-shipped component; the markup that renders
it is 0030's/0031's.

Covers the "Attribute values in use by variants cannot be removed" half of
[PRD](../../../docs/PRD/PRD.md#22-products) §2.2, and discharges 0028's own **Q3**/**D7** hand-off.

## Type

backend | includes database-expert: **no**

No table, column, index, FK, enum or migration. Every FK this story depends on is
[0029](../0029-product-variants-backend.md)'s and is already in place by the time this story starts. What
this story adds is two counting queries, two refusals and one component property's real value — all
application code. `database-expert` was convened for 0029 and its findings (**V-12** especially) are
inherited rather than re-derived.

## Three Amigos participants

Inherited from [0029](../0029-product-variants-backend.md)'s 2026-08-18 debate — `product-owner` (lead),
`database-expert`, `backend-expert`, with `backend-qa`'s contribution performed inline by
`product-owner` after the platform refused that dispatch. **No new debate was run for this split**:
every decision below already existed in 0029's D-10 and is carried over verbatim except where marked
🟠. `backend-expert` is the source of the second code path (**D-A1** path 2), which 0028's own D7 did
not anticipate.

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. Carried over
unchanged from 0029, plus one new scenario for the authorization-ordering correction.

```gherkin
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

  Scenario: An administrator who may not delete a type is not told how many variants use it
    Given a signed-in administrator who does not hold the products delete permission
    When they try to delete the type "Size", whose values are used by 12 variants
    Then the action is refused for lack of permission
    And no message stating the variant count is produced
```

## Documented functional decisions

### D-A1 — There are **two** 0028 code paths needing this guard, not one

Carried from 0029's **D-10** verbatim. `backend-expert` found the second, and it is not in 0028's own
D7, which anticipated only the type-delete path.

**Path 1 — `App\Actions\Products\DeleteProductAttributeType`.** The path 0028 designed the seam for.
0029's **V-12** confirms *by execution* that without a pre-check the administrator meets a raw
`1451`: 0028's `product_attribute_types → product_attribute_values` FK is `cascadeOnDelete()`, so a
type delete cascades to its values, each value's delete hits the pivot's `RESTRICT`, and the whole
statement aborts — with **nothing at all deleted** (types and values both survive). 0028's D7 raised
this as an inference; it is a verified fact.

**Path 2 — `App\Actions\Products\SyncProductAttributeValues`' delete branch** (0028 **D4** step 5).
Removing value "40" from the Size type's *inline value list* issues a bare
`ProductAttributeValue::whereIn('id', $toDelete)->delete()`. If any variant uses it, that is a raw
`1451` surfacing from inside a diff, which violates **0028's own acceptance criterion** that *"a
duplicate surfaces as a validation error on the offending field, never as an unhandled
`QueryException`"* — the same principle covers an in-use refusal. The diff must count usage **per
value being removed** and refuse with a per-row validation error naming which value is in use.

> **Missing path 2 would ship a screen where the *documented* delete path is guarded and the
> *everyday* one 500s.** Path 1 is reached from a delete-confirmation modal; path 2 is reached by
> clicking the × next to a value in the edit modal, which is what an administrator actually does.

### D-A2 🔴 — Both guards run **after** `Gate::authorize()`, never before

**Added at the 2026-09-04 split (Phase 2 defect 7); 0029's D-10 never specified the ordering.**

`App\Actions\Products\DeleteProductAttributeType` already authorizes as its own first statement:

```php
// app/Actions/Products/DeleteProductAttributeType.php — the SHIPPED first statement
$this->logRefusedPrivilegedAttempt->authorize('delete', $type, targetType: 'product_attribute_type', targetId: $type->id);

return DB::transaction(fn (): bool => (bool) $type->delete());
```

**The in-use guard goes between those two statements, and nowhere else.** The reason is not tidiness:
the count is *data*, and computing it before the gate has run leaks it to an actor who does not hold
`products.delete` — turning a clean 403 into a business message ("12 variants use this type") that
discloses catalog structure to someone with no right to it.

This is the **exact precedent** `App\Actions\ProductCategories\DeleteProductCategory` already ships
and documents in its own docblock — *"This MUST run before the in-use count below, never after: a
reversed order would leak the product count to an actor who does not even hold `products.delete`
(R-6)"* — established at 0024b/0025 and recorded in
[database/schema.md](../../../docs/database/schema.md#product_categories) and
[architecture/authorization.md](../../../docs/architecture/authorization.md). Follow it exactly rather
than re-deriving it.

**For path 2 the ordering is inherited rather than added.** `SyncProductAttributeValues` deliberately
authorizes **nothing** — it is a collaborator invoked only inside
`UpdateProductAttributeType`'s already-authorized transaction, this codebase's fifth instance of that
pattern, asserted by a reachability test. **Do not add a `Gate` call to it**; the count it computes is
already behind its caller's gate, and adding one would break the pattern the file's own docblock and
`tests/Feature/Products/SyncProductAttributeValuesTest.php` both pin.

### D-A3 — The two count queries

Carried from 0029's **D-10** verbatim.

```php
// variants affected if this TYPE were deleted (0028 D7's pre-check) — path 1
$count = DB::table('product_variant_values as pvv')
    ->join('product_attribute_values as pav', 'pav.id', '=', 'pvv.product_attribute_value_id')
    ->where('pav.product_attribute_type_id', $type->id)
    ->distinct()
    ->count('pvv.product_variant_id');

// variants affected if a single VALUE were deleted — path 2
$count = DB::table('product_variant_values')
    ->where('product_attribute_value_id', $value->id)
    ->count();   // the pivot PK makes (variant, value) unique, so no DISTINCT is needed
```

**The `DISTINCT` on the type query is load-bearing and invisible without a test.** A variant built on
*two* values of the same type (`Size 40 / Size 41` — legal at schema level, 0029's **DIS-1**) would
otherwise be counted twice, so the administrator would be told 13 variants are affected when 12 are.

**Neither query needs a hand-written index.** 0029's **D-14** already establishes why: InnoDB's
auto-created `KEY (product_attribute_value_id)` on the pivot implicitly carries the clustered-index
columns in its leaf entries, so it physically contains `(product_attribute_value_id,
product_variant_id)` — both queries are **fully covering**, the per-value count is one equality range
scan that never touches the clustered index, and the per-type count's `DISTINCT product_variant_id`
resolves from the index leaf over an `IN` list bounded by the type's 10¹–10² values. **Do not add
`$table->index('product_attribute_value_id')`** — that would be the `users_uuid_unique` write
amplification [errors-log.md](../../../docs/errors-log.md) records, and 0029's migration carries a
comment saying so.

### D-A4 🔴 — The database backstop must be narrowed to `1451`, and must not reuse the existing `23000` catch

**Added at the 2026-09-04 split (Phase 2 defect 6), from reading the shipped file.**

`SyncProductAttributeValues` already has a `QueryException` catch — but it wraps **only** the insert
and update statements, through a private `writeRow()` helper, and it is broad:

```php
// app/Actions/Products/SyncProductAttributeValues.php — the SHIPPED catch
private function writeRow(callable $write): void
{
    try {
        $write();
    } catch (QueryException $e) {
        if ($e->getCode() === '23000') {
            throw ValidationException::withMessages([
                'values' => trans('validation.distinct', ['attribute' => 'value']),
            ]);
        }
        throw $e;
    }
}
```

Two facts follow, and both constrain what this story may do:

1. **The delete branch is not wrapped at all.** `ProductAttributeValue::whereIn('id', $toDelete)->delete()`
   sits outside `writeRow()`, so a `1451` from it surfaces today as an unhandled `QueryException` —
   a 500. That is the bug path 2 closes.
2. 🔴 **Do not "fix" this by routing the delete through `writeRow()`.** SQLSTATE `23000` covers **both**
   `1062` (duplicate entry — what this catch means) **and** `1451` (row is referenced — what an in-use
   refusal is). Widening the existing catch would report *"the value must be distinct"* for an in-use
   deletion, which is 0029's **R-F** mislabelling one table over: a message that is not merely wrong
   but actively misleading, since the administrator's fix for "not distinct" (rename the value) is
   exactly the wrong action.

✅ **The shape.** Count first (the app-level guard, which produces the real message), then wrap the
delete in its **own** catch narrowed to `1451` as the race backstop:

```php
if (($e->errorInfo[1] ?? null) === 1451) { /* re-count, throw the in-use ValidationException */ }
```

`errorInfo[1]`, not `getCode()` — that is how `DeleteProductCategory` narrows its own 1451 and how
`CreateProduct` narrows 1062, and it is the only form that distinguishes the two inside one SQLSTATE
class. The re-count inside the catch carries the same `max(1, $count)` **presentation floor**
`DeleteProductCategory` documents, for the same reason: a rolled-back transaction can make the
recount read 0.

**Path 1 needs the same treatment**, narrowed identically — `DeleteProductAttributeType` currently has
no catch at all, and its `1451` arrives from the *cascade*, not from its own statement.

### D-A5 — Hard block, a count in the message, no confirm-and-proceed, at any privilege level

Carried from 0029's **D-10**, inheriting 0024b's **D-14** wholesale — including the exception *type*
and its rendering rationale:

- The refusal is a **`ValidationException`**, not a `Gate` denial, because it is a **domain
  invariant** rather than an authorization rule: the actor may hold `products.delete` and the answer
  is still no. See [architecture/authorization.md](../../../docs/architecture/authorization.md)'s
  *"a domain invariant is not an authorization rule"* section.
- It is nonetheless **logged**, via `LogRefusedPrivilegedAttempt::log()` (never `->authorize()`, which
  would re-run the already-passed gate), with a snake_case reason — `attribute_type_in_use` /
  `attribute_value_in_use` — matching the convention `SetDefaultSalesRegion`/`SetSalesRegionActive`
  and `DeleteProductCategory` already established for their own domain-invariant refusals.
- **No `bool $force` parameter exists on either action.** The refusal is architecturally impossible to
  bypass from a UI, not merely absent from this story's markup — 0024b's **D-14** point, applied here.
- A **Super Admin is refused identically**, which is the strongest single proof that this is data
  integrity and not authorization.

**Error-bag keys**, so the UI stories can bind outlets: path 1 throws on **`productAttributeTypeId`**;
path 2 throws on **`values`** — the key `SyncProductAttributeValues`' existing duplicate refusal
already uses, because both refusals are about the submitted value list as a whole and 0028's component
already renders that key. A per-row key (`values.3`) was considered and rejected: the row index shifts
as the administrator edits, and 0028's own `key`-not-index rule exists precisely because indices are
not stable.

### D-A6 — 0028's `$deletingTypeUsageCount` gets its real query

`App\Livewire\Products\AttributeTypes\Index` already declares
`#[Locked] public int $deletingTypeUsageCount = 0;`, documented in
[api/routes.md](../../../docs/api/routes.md#product-attribute-typesindex--the-fifth-permission-gated-route-and-the-first-shipped-with-a-backend-only-placeholder-view-since-task-0017)
as *"always `0` until story 0029 adds an in-use guard — the same D7 hand-off `product_categories`'s
own in-use block once was, deliberately not a stub returning a lying `0` from a model method"*.

`confirmDelete()` populates it from `ProductAttributeType::variantUsageCount(): int` — the new model
method carrying **D-A3**'s type-level query. **One query, zero contract changes**, exactly as 0028
designed. `confirmDelete()` already authorizes `delete` as its own first statement, so **D-A2**'s
ordering holds there for free — but verify it rather than assume it.

## Scope fences: what this story must NOT do

- No new table, column, index, FK or migration — every one it needs is
  [0029](../0029-product-variants-backend.md)'s.
- No Livewire component, route, Blade view, sidebar entry or browser test. The one component touch is
  a property's value, not its contract; the markup rendering the blocked-delete message is 0030's.
- **No `Gate` call added to `SyncProductAttributeValues`** — see **D-A2**.
- **No widening of `SyncProductAttributeValues`' existing `23000` catch** — see **D-A4**.
- No confirm-and-proceed path, no `force` parameter, no privilege level that bypasses the block.
- No change to `DeleteProductAttributeType`'s or `SyncProductAttributeValues`' public signatures — both
  are already-shipped contracts that 0028's tests and component bind to.
- No attribute type/value CRUD changes beyond the two guards.
- No touching of 0029's **rename**-branch SKU re-derivation cascade in the same file — that is 0029's,
  it lands first, and this story must not disturb it.
- No new permission string and no `RolePermissionSeeder` change.

## Files to create/modify

### Creates

| Path | What & why |
| --- | --- |
| `tests/Feature/Products/DeleteProductAttributeTypeTest.php` *(extends 0028's existing file)* | see [Tests to perform](#tests-to-perform) |
| `tests/Feature/Products/SyncProductAttributeValuesInUseTest.php` | path 2's own file — kept separate from 0028's `SyncProductAttributeValuesTest.php` so that story's regression suite stays readable and provably untouched |

### Modifies — all of it 0028's already-shipped code

| Path | What & why |
| --- | --- |
| `app/Actions/Products/DeleteProductAttributeType.php` | the type-level in-use guard (**D-A1** path 1), inserted **between** the existing `authorize()` call and the `DB::transaction()` (**D-A2**), plus a `1451`-narrowed catch as the race backstop (**D-A4**) |
| `app/Actions/Products/SyncProductAttributeValues.php` | the per-value in-use guard in its **delete branch** (**D-A1** path 2). ⚠️ **This story edits a file [0029](../0029-product-variants-backend.md) also edits** — 0029 owns the *rename* branch (its **D-4.6.1**), this story owns the *delete* branch. 0029 lands first (see [Dependencies](#dependencies-and-risks)) |
| `app/Models/ProductAttributeType.php` | gains `variantUsageCount(): int` — **D-A3**'s type query, `COUNT(DISTINCT variant)` and never a pivot-row count |
| `app/Livewire/Products/AttributeTypes/Index.php` | `$deletingTypeUsageCount` gets its real value from `variantUsageCount()` (**D-A6**). One query; the property's declaration, type and `#[Locked]` are unchanged |
| `lang/en/products.php`, `lang/es/products.php` | **Extend, never recreate.** Two keys, both `trans_choice` per 0024b **D-14**: `products.variants.value_in_use` and `products.variants.type_in_use`, each interpolating `:count`. Key-for-key identical in both locales |

### Explicitly **not** touched

`database/migrations/**` · `database/seeders/RolePermissionSeeder.php` · `routes/**` ·
`app/Policies/**` · `resources/views/**` · `tests/Browser/**` · `docs/**` (Phase 6) ·
`app/Models/ProductVariant.php` and everything else belonging to 0029 · anything belonging to 0029b,
0030 or 0031.

## Tests to perform

Backend only. `tests/Unit/` gets **no** database trait in this repo (verified at
[`tests/Pest.php`](../../../tests/Pest.php)), so everything here is a Feature test.

**Feature — `tests/Feature/Products/DeleteProductAttributeTypeTest.php`** (extends 0028's file)

Carried from 0029 verbatim, plus the ordering test **D-A2** requires.

- [ ] *Regression:* 0028's own delete tests stay green **untouched** — deleting an unused type still
      removes it and its values.
- [ ] Deleting a type whose values back N variants is blocked **and the type still exists**
      afterwards. A guard that threw *after* deleting would pass a throw-only test.
- [ ] **The count is correct** — dataset over N = 1, 2, 12, asserting the literal digits and not N±1.
      **Seed a decoy of 5 variants on a different type in every case**: without it,
      `ProductVariant::count()` and the scoped count are indistinguishable and the test cannot fail
      for the reason it exists (**FP-A1**).
- [ ] A variant using **two values of the same type** counts **once**, not twice — what the `DISTINCT`
      in **D-A3** is for, and invisible without a test.
- [ ] 🔴 **The guard runs after the gate (D-A2)**: an actor **without** `products.delete`, against a
      type whose values back 12 variants, gets `AuthorizationException` — **not** the in-use
      `ValidationException` — and the count appears nowhere in the exception, the message, or the
      logged context. This is the only test that can fail against a guard placed above the gate, and
      it is why this story exists as a rewrite rather than a copy.
- [ ] **No confirm-and-proceed path**, proven as 0024b **D-14** does: reflection on the signature (no
      `force`-shaped parameter), calling twice in succession, and **a `Super Admin` refused
      identically** — the strongest, because it proves the block is data integrity, not authorization.
- [ ] The refusal is **logged** with reason `attribute_type_in_use` and
      `target_type: 'product_attribute_type'`, asserted against the **context array** rather than a
      rendered string, matching `tests/Feature/Products/RefusalLoggingTest.php`'s shape.
- [ ] Singular/plural forms differ between N = 1 and N = 2 (`trans_choice`).

**Feature — `tests/Feature/Products/SyncProductAttributeValuesInUseTest.php`**

- [ ] *Regression:* every one of 0028's own `SyncProductAttributeValuesTest.php` cases stays green
      **unmodified** — the diff, the id-stability guarantee across a no-op re-save, the duplicate-id
      `unset()` fix, and the `position` full rewrite. This is the file that proves the guard did not
      disturb the diff.
- [ ] Removing a value **no variant uses** still deletes it — the control that stops a
      refuse-everything guard passing every other test here.
- [ ] Removing a value **in use** throws `ValidationException` on **`values`**, names the count, and
      **the value row survives**. Assert the surviving row, not only the throw (**FP-A2**).
- [ ] Removing **two** values where only one is in use refuses the whole save and deletes **neither** —
      the diff runs in one transaction, so a partial apply would leave the type's value list in a
      state the administrator never asked for.
- [ ] 🔴 **The refusal is an in-use message, not a duplicate-value message** (**D-A4**). Assert the
      **translation key**, not just the bag key — both refusals throw `ValidationException` on
      `values`, so a bag-key assertion alone passes against a guard that routed the delete through the
      existing `23000` catch, which is the exact bug **D-A4** exists to prevent.
- [ ] **The `1451` backstop fires cleanly under a race**: register a `ProductVariant::creating`-style
      hook (0024's established technique) that inserts a variant using the value *between* the count
      and the delete. The outcome must be the same clean `ValidationException`, never a 500 and never
      a duplicate-value message.
- [ ] A `QueryException` that is **not** 1451 still propagates — the narrowing must not swallow
      unrelated database errors.

**Feature — `tests/Feature/Products/AttributeTypeUsageCountTest.php`**

- [ ] `ProductAttributeType::variantUsageCount()` returns the same number the guard refuses with, over
      the same N = 1, 2, 12 dataset and the same decoy — one query, one source of truth.
- [ ] `App\Livewire\Products\AttributeTypes\Index::confirmDelete()` populates
      `$deletingTypeUsageCount` with the real value, and it is still `#[Locked]` and still an `int`.
- [ ] `confirmDelete()` for an actor without `products.delete` refuses **before** populating it — the
      component-level mirror of **D-A2**.

### Assertions that would be false passes if written naively

**FP-A1 — the in-use count asserted without a decoy.** With no variants on any *other* attribute value
or type, a global `count()` and a correctly scoped one return the same number, so the test passes
against the bug it exists to catch. Carried from 0029's **FP9**.

**FP-A2 — a block test asserting only that an exception was thrown.** A `ValidationException` raised
*after* the delete still throws. Pair every refusal with a survival assertion on the row. Carried from
0029's **FP5**.

**FP-A3 🟠 — asserting the bag key when two different refusals share it.** Both the duplicate-value
refusal (0028's) and the in-use refusal (this story's) throw on `values`. Only the **translation key**
distinguishes them, and **D-A4** is entirely about not conflating them. Assert the message.

**FP-A4 🟠 — an authorization-ordering test that asserts only the exception class.** An implementation
that counts first and then throws `AuthorizationException` still throws `AuthorizationException`. The
test must additionally assert the count is **absent** from the logged context and from the message —
the leak is the finding, not the exception type.

### Explicitly not tested

Per [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md): the `restrictOnDelete()` FK's own
behaviour (that is [0029](../0029-product-variants-backend.md)'s
`ProductVariantReferentialIntegrityTest`, and duplicating it here would make two stories fail for one
schema change); `Rule::exists`'s generated SQL; attribute type/value CRUD itself (0028); any markup or
modal (0030).

## Expected outcome

An administrator deleting an attribute value or an attribute type that any product variant is built on
is refused with a message naming the exact number of variants affected — *"12 variants use this
type"* — instead of the raw `1451` they meet today, on **both** paths: the delete-confirmation modal's
own action, and the everyday × next to a value inside the type's edit modal. There is no
confirm-and-proceed control anywhere, no `force` parameter to reach for, and a Super Admin is refused
identically, because this is a data-integrity rule rather than an authorization one.

An administrator who does not hold `products.delete` is refused *first*, for lack of permission, and
never learns the count.

0028's `$deletingTypeUsageCount` placeholder reports a real number for the first time. The
`restrictOnDelete()` FK behind all of it is unchanged — it was already correct; what this story adds
is the message in front of it.

## Acceptance criteria

- [ ] Deleting an attribute **type** whose values back any variant is refused with a
      `ValidationException` on `productAttributeTypeId` carrying a `trans_choice` message with the
      exact `COUNT(DISTINCT variant)`, and the type, its values and the variants all survive.
- [ ] Deleting an attribute **value** in use, through `SyncProductAttributeValues`' delete branch, is
      refused with a `ValidationException` on `values` carrying the exact count, and **no** value in
      that save is deleted.
- [ ] 🔴 **Both counts are computed after `Gate::authorize()`**, proven by a test showing an
      unauthorized actor gets `AuthorizationException` with the count absent from the message and from
      the logged context.
- [ ] 🔴 **The database backstop is narrowed to error `1451` via `errorInfo[1]`**, in its **own**
      catch — `SyncProductAttributeValues`' existing `23000` catch is **unmodified**, and an in-use
      refusal is never reported as a duplicate-value refusal.
- [ ] A variant built on two values of the **same type** is counted **once**.
- [ ] There is **no confirm-and-proceed path and no `force` parameter** on either action, and a
      `Super Admin` is refused identically.
- [ ] Both refusals are logged through `LogRefusedPrivilegedAttempt::log()` with the snake_case reasons
      `attribute_type_in_use` / `attribute_value_in_use`.
- [ ] `ProductAttributeType::variantUsageCount()` exists and is the single source of the type-level
      count, consumed by both the action and `AttributeTypes\Index::confirmDelete()`.
- [ ] **0028's own test suite passes unmodified** — both `DeleteProductAttributeTypeTest.php`'s
      pre-existing cases and every case in `SyncProductAttributeValuesTest.php`.
- [ ] `lang/en/products.php` and `lang/es/products.php` are **extended** key-for-key identically, and
      no user-facing string is hardcoded.
- [ ] No migration, no schema change, no new permission string, no route, no Blade view, no browser
      test.
- [ ] Pint clean and Larastan level 7 clean.

## Definition of Done

- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] `vendor/bin/pint --format agent` (unscoped, **not** `--dirty`) and `vendor/bin/phpstan analyse`
      (level 7) both clean, **and both recorded** — a gate absent from the record is a gate that did
      not run ([errors-log.md](../../../docs/errors-log.md)).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Point the audit at **D-A2** specifically — that neither
      count is computed on any path reachable before the gate, including through
      `AttributeTypes\Index::confirmDelete()` — and at **D-A4**, that the `1451` narrowing cannot
      swallow or be swallowed by the existing `23000` catch.
- [ ] Documentation updated (docs-keeper): [database/schema.md](../../../docs/database/schema.md)'s
      `product_attribute_types` / `product_attribute_values` sections gain the in-use blocks (the
      counterpart of what `product_categories` already carries for its own guard), and
      [api/routes.md](../../../docs/api/routes.md)'s `product-attribute-types.index` subsection's claim
      that `$deletingTypeUsageCount` is *"always `0` until story 0029 adds an in-use guard"* is
      **corrected in place** — it is this story, not 0029, and it is no longer always `0`.
- [ ] 🟠 **Digest entry appended** to
      [`ai-spec/tasks/_digests/epic-2.md`](../_digests/epic-2.md) at Phase 6/7, per
      [workflow.md](../../../docs/workflow.md#decision-digest-per-epic). ⚠️ **That file currently has no
      entry for story 0028 either** — a gap predating this story, flagged here because 0028 is 0029's
      and this story's direct, load-bearing dependency and a later Epic 2 story will re-read 0028 in
      full without one.
- [ ] Acceptance criteria met.

## Dependencies and risks

### Dependencies

- **[0029](../0029-product-variants-backend.md) — hard, blocking, and must reach Phase 7 first.** This
  story counts rows in `product_variant_values`, which 0029 creates. There is nothing to count and
  nothing to guard until it exists.
- ⚠️ **File overlap with 0029, in the same class.** Both stories edit
  `app/Actions/Products/SyncProductAttributeValues.php` — 0029 the **rename** branch (its **D-4.6.1**
  SKU re-derivation cascade), this story the **delete** branch. **Sequential, never concurrent**: this
  is the shape [errors-log.md](../../../docs/errors-log.md)'s parallel-agent file-ownership entry
  records, and 0029's own **R-J** already names uncoordinated edits to a shared file as a risk.
- **0028 (attribute types & values) — shipped**, in `done/`. Every file this story modifies is real,
  tested, reviewed code, so every claim about its shape in this document was verified by reading it.
- **0024b / 0025 — shipped**, and the source of the precedent this story copies rather than invents
  (`DeleteProductCategory`'s gate-then-count ordering, its `1451` narrowing, its
  `max(1, $count)` presentation floor, its no-`force` proof).

### Risks

- **R-A1 — the two guards can drift.** Two counts, two messages, two code paths, one rule. Mitigated
  by both reading through the same conceptual query shape (**D-A3**) and by the type-level one having
  a single named home (`ProductAttributeType::variantUsageCount()`) that both its callers share. The
  per-value count has no such home today and arguably should get one if a third caller appears.
- **R-A2 — the `23000`/`1451` conflation is one line away, permanently.** The tempting "cleanup" is to
  route the delete through the existing `writeRow()` helper, which is a two-character change and
  produces a wrong, actively misleading message. Mitigated by **D-A4**, by an inline comment at both
  catches, and by **FP-A3**'s translation-key assertion — which is the only test that can fail
  against it.
- **R-A3 — the authorization-ordering rule is invisible in review.** Nothing about a count computed
  three lines too early *looks* wrong. Mitigated by the dedicated ordering test (**D-A2**), which is
  written to fail on the leak rather than on the exception type (**FP-A4**).
- **R-A4 — 0028's suite is the regression net and it is easy to weaken.** A guard that breaks one of
  0028's diff tests will tempt an implementer to adjust that test. It must not be adjusted: 0028's
  id-stability guarantee is what 0029's combination hashes depend on. If a 0028 test goes red, the
  guard is wrong, not the test.

## Provenance

Split out of [0029](../0029-product-variants-backend.md) on **2026-09-04**, at Phase 2, after
`code-reviewer` failed that story on INVEST **"Small"**. Every decision here is 0029's **D-10**,
carried over rather than re-debated — including `database-expert`'s **V-12** (executed proof that a
type delete aborts with `1451` and deletes nothing) and `backend-expert`'s discovery of the second
code path, which 0028's own D7 did not anticipate. 0029's **R-K** had recommended exactly this cut
from the day it was written.

**Three things are new in this file and are corrections rather than carried decisions**, each raised
by the Phase 2 review and each verified against the real shipped code rather than reasoned about:
**D-A2** (the gate-then-count ordering, following `DeleteProductCategory`'s precedent), **D-A4** (the
`1451` narrowing, and the finding that `SyncProductAttributeValues`' delete branch has no catch at all
today while its `23000` catch means something else entirely), and the Gherkin scenario plus the two
tests that pin the first of those.

**0028's Q3** is discharged here rather than in 0029; **OQ-7** moved with it and is answered
affirmatively by **D-A5**.

---

> **Link-integrity note for whoever moves this file.** Every relative link above is written for
> `ai-spec/tasks/` (two levels below the repo root). Moving this file to `in-progress/` or `done/`
> puts it **three** levels down and silently breaks all of them — `../../docs/...` must become
> `../../../docs/...`, and the sibling-task links (`0029-...md`) must become `../0029-...md`. This is
> a mandatory step, not a nicety: see
> [workflow.md](../../../docs/workflow.md#link-integrity-check-on-every-stage-move) and the
> [errors-log entry](../../../docs/errors-log.md) recording the six `done/` files this already broke.
