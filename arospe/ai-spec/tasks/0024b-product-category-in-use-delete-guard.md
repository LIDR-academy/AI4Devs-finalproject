# [0024b] Product categories — the in-use delete guard

> **Split out of [0024](done/0024-products-core-crud-backend.md) on 2026-09-01**, after that story failed
> its Phase 2 INVEST review and the coordinator approved a three-way split. This file owns everything
> that was **D-14**, **R-11** and **R-14** there: the retrofit to
> [0023](done/0023-product-categories-backend.md)'s `DeleteProductCategory`, the
> `ProductCategory::products()` relation it counts through, the `categories.delete_blocked` message,
> and its ~8-test file.
>
> **The decision keeps the label `D-14`**, because four sibling files (0025, 0029, 0058, 0061) cite
> `0024 **D-14**` by number. Following such a citation now lands here, on a section headed D-14.
>
> **One correction was applied at the split** (Phase 2 finding B4): the message uses the repo's
> existing simple `singular|plural` `trans_choice` form, not the explicit-range syntax 0024's draft
> proposed. See **D-14**'s message subsection.

## Description

Now that `products.product_category_id` exists, story 0023's `DeleteProductCategory` gains the **hard
block with a count** the PRD requires — *"This category is used by 12 products and cannot be
deleted"* — with **no confirm-and-proceed path at any privilege level**, backed by the `products` FK's
own `restrictOnDelete` as an independent database invariant.

It is **backend only**: no screen, no route, no Livewire component. The product-categories management
screen that renders this refusal is story **0025**, which cannot ship without it.

The story is deliberately small — one modified action, one relation method, two lang keys and one test
file — and it is the only part of the original 0024 that **edits another story's shipped code**, which
is precisely why `code-reviewer` recommended cutting it out.

Covers [PRD](../../docs/PRD/PRD.md#22-products) §2.2's *"Deleting a product category still in use is
hard-blocked with a count"* — Products acceptance criterion 2.

## Type
backend | fullstack (related_task_id: **0025** — product categories UI, which renders this refusal) | includes database-expert: **no**

## Three Amigos participants

Inherited from [0024](done/0024-products-core-crud-backend.md)'s Phase 1 debate (2026-08-18) —
`product-owner` (lead) + `backend-expert` + `database-expert` + `backend-qa`. No new debate was
convened for the split; the decisions below are that debate's, moved intact, with the `trans_choice`
form corrected against the real tree.

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Deleting a product category that is in use

  Scenario: Deleting a product category still in use is hard-blocked with a count
    Given a catalog administrator, with the category "Calzado" assigned to 12 products
    When they try to delete "Calzado"
    Then deletion is blocked with a message stating that 12 products use it
    And "Calzado" is still in the product category catalog
    And no confirm-and-proceed path is offered

  Scenario: Draft products count towards the block
    Given a catalog administrator, with the category "Calzado" assigned to 3 products, all drafts
    When they try to delete "Calzado"
    Then deletion is blocked with a message stating that 3 products use it

  Scenario: The block names a single product in the singular
    Given a catalog administrator, with the category "Calzado" assigned to 1 product
    When they try to delete "Calzado"
    Then deletion is blocked with a message stating that 1 product uses it

  Scenario: Deleting an unused product category still works
    Given a catalog administrator, with the product category "Calzado" assigned to no products
    When they delete "Calzado"
    Then "Calzado" is removed from the product category catalog

  Scenario: Reassigning the last product frees the category for deletion
    Given a catalog administrator, with the category "Calzado" assigned to 1 product
    When they move that product to another category
    Then "Calzado" can then be deleted

  Scenario: No privilege level can force a blocked category deletion
    Given a signed-in Super Admin, with the category "Calzado" assigned to 12 products
    When they try to delete "Calzado"
    Then deletion is blocked exactly as it is for any other administrator
```

## Files to create/modify

| Path | What & why |
| --- | --- |
| `app/Actions/ProductCategories/DeleteProductCategory.php` | **Modify** ([0023](done/0023-product-categories-backend.md) creates it; its **D-10** states the file exists as its own file *precisely* so a later story extends it). `__invoke()` gains the count-and-block guard — full shape in **D-14**. |
| `app/Models/ProductCategory.php` | **Modify** (0023 creates it). Gains exactly one method: `/** @return HasMany<Product, $this> */ public function products(): HasMany`. It is what the guard counts through. |
| `lang/en/products.php` | **Modify** ([0024](done/0024-products-core-crud-backend.md) creates it). Adds one key: `products.categories.delete_blocked`. |
| `lang/es/products.php` | **Modify**, key-for-key identical, with **Spanish** pluralisation written rather than transliterated, per [naming.md](../../docs/conventions/naming.md#translation-keys). |
| `tests/Feature/ProductCategories/DeleteProductCategoryTest.php` | **Extend** 0023's existing file — do not create a second one. Its three existing cases must stay green **unmodified**; see Tests. |

### Explicitly **not** touched

`app/Actions/ProductCategories/{Create,Rename}ProductCategory.php` (**D-B1**) ·
`app/Policies/ProductCategoryPolicy.php` (unchanged — the block is **not** an authorization rule; see
**D-14**'s exception-type subsection and **D-B1**) · any migration (the `products` FK is
[0024](done/0024-products-core-crud-backend.md)'s, already `restrictOnDelete`) ·
`app/Models/Product.php` (the inverse `category()` relation is 0024's) ·
`app/Actions/Products/**` · `app/Livewire/**` · `resources/views/**` · `routes/**` ·
`config/**` · anything in [0024a](done/0024a-product-description-html-sanitization.md).

## Tests to perform

Backend only. One extended file.

**Feature — `tests/Feature/ProductCategories/DeleteProductCategoryTest.php`**

*Regression — 0023's own cases must stay green untouched. Do not edit them; the retrofit inserts a
code path **before** the delete, and these three are what prove it did not change the existing
behaviour:*
- [ ] Deleting a category with zero products removes the row outright (`assertDatabaseMissing`).
- [ ] The freed name is immediately reusable.
- [ ] Deleting an unknown / malformed-UUID category still fails cleanly (`ModelNotFoundException`)
      rather than being swallowed by the new guard.

*The block:*
- [ ] Deleting a category with N products throws **and** the row still exists afterwards
      (`assertDatabaseHas`). A guard that threw *after* deleting would pass a throw-only test.
- [ ] **The count is correct** — dataset over N = 1, 2, 12, asserting the message contains the literal
      digits of N and not N−1/N+1. **Seed a decoy of 5 products in a *different* category in every
      case**: without it, `Product::count()` and `$category->products()->count()` are
      indistinguishable, and the test cannot fail for the reason it exists. Assert the digits — never
      re-invoke `trans_choice()` with the same arguments, which is a tautology.
- [ ] **Draft products count too**: a category with 3 all-draft products is blocked, message says 3.
      The likeliest implementation bug is a stray `->where('status', Active)`, and its consequence in
      production is a raw FK error instead of a friendly message.
- [ ] **The singular/plural forms differ** between N = 1 and N = 2, asserted on the rendered message in
      **both** locales — the `es` half is what catches a Spanish file that copied the English plural.
- [ ] **No confirm-and-proceed path**, proven three ways: (a) reflection — `__invoke()` takes exactly
      one parameter, of type `ProductCategory`, so there is no `bool $force`; (b) calling twice in
      succession is refused both times, so no "confirmed" state accumulates; (c) **a `Super Admin` is
      refused identically**, which proves the block is a data-integrity rule and not an authorization
      one. (c) is the strongest; (a) is knowingly weaker and is recorded as such rather than smuggled
      in as equivalent — proving a negative capability has no purely behavioural formulation.
- [ ] **The race, and the FK as backstop**: register a `ProductCategory::deleting` hook inside the
      test that assigns a product to the category, so the assignment lands after the count and before
      the `DELETE`. The outcome must be the same clean `ValidationException` — never a raw
      `QueryException`, never a 500 — and the category must survive. This fails if the FK is
      `cascadeOnDelete` (products silently vanish) or `nullOnDelete` (products silently orphaned).
- [ ] **The guard means what it says only because `Product` is hard-deleted** — a regression guard
      asserting `Product` does not use `SoftDeletes`. It duplicates one assertion in 0024's
      `ProductTest`, deliberately: if anyone adds the trait later, the count silently starts excluding
      trashed products and **this guard changes meaning with no edit to the guard** (**R-11**'s
      sibling). A reader of this file must see why it is here.

**Feature — `tests/Feature/Models/ProductTest.php` (extend 0024's file)**
- [ ] `$category->products` **excludes** a product in another category — the decoy is what makes it
      non-trivial. 0024's own version of this case covers only the inverse `$product->category` half,
      because the `products()` relation is this story's.

**Explicitly not tested**, per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md):
the `products.product_category_id` FK's own existence (0024's `ProductCategoryAssignmentTest` owns the
one argued exception); Laravel's `HasMany` mechanics; `trans_choice()`'s own pluralisation engine (the
tests assert **rendered digits and differing strings**, not that Laravel can count); the delete
confirmation modal, its `@error` binding and any rendered copy (0025).

**Test-setup requirements:**
- **Every test must `actingAs()` an actor** even though `DeleteProductCategory` does not itself
  authorize (**D-B1**) — because the Super Admin case in the no-confirm-and-proceed trio is only
  meaningful against a real actor, and because 0025 will add the gate above this action without
  changing these tests.
- The Super Admin case needs `app(PermissionRegistrar::class)->forgetCachedPermissions()` **then**
  `$this->seed(RolePermissionSeeder::class)` in `beforeEach`, in that order.
- Use `ProductFactory` (0024's) for the products; pass the category explicitly rather than letting the
  factory create its own, or the decoy assertion is meaningless.

## Expected outcome

Deleting a product category that any product still references is refused with a message naming the
exact count, the category survives, drafts count towards the count, there is no confirm-and-proceed
path at any privilege level — a Super Admin is refused identically — and the database FK refuses
independently if the application check is ever bypassed by a query-builder delete, a seeder or a bulk
cleanup. Deleting an unused category continues to work exactly as story 0023 built it.

Nothing is user-visible yet: the screen that renders the refusal is story 0025, which binds its
`@error` block to the `productCategoryId` key this story throws on.

## Acceptance criteria
- [ ] **Deleting a product category assigned to N products is blocked with a message stating N**, the
      category survives, and drafts count towards N.
- [ ] **There is no confirm-and-proceed path at any privilege level** — no `bool $force` parameter, no
      accumulating "confirmed" state, and a `Super Admin` is refused identically to any other actor.
- [ ] **The database FK refuses independently** if the application check is bypassed, and a product
      assigned between the count and the `DELETE` surfaces as the same clean `ValidationException`,
      never a raw `QueryException` or a 500.
- [ ] The refusal is a `ValidationException` keyed on **`productCategoryId`** — the hand-off contract
      story 0025 binds to, recorded in the action's own docblock.
- [ ] `App\Models\ProductCategory::products()` exists and is the relation the guard counts through.
- [ ] `products.categories.delete_blocked` exists in **both** locales with real Spanish pluralisation,
      using the repo's existing simple `singular|plural` `trans_choice` form.
- [ ] Deleting an unused product category still works exactly as story 0023 built it, and **0023's own
      three delete tests pass unmodified**.
- [ ] No migration, no route, no Livewire component, no Blade view, no browser test, no policy change,
      no Composer dependency and no permission-catalog change.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule. **This story edits another
      story's shipped code, so the unscoped run is the point, not a formality** — a `--filter`ed run
      cannot see what the retrofit did to 0023's own tests.
- [ ] **All three quality gates run unscoped and each result recorded — including "not run"**, per
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26):
      `php artisan test`, `vendor/bin/pint --format agent`, `vendor/bin/phpstan analyse`.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Point the audit at **D-B1** specifically: whether leaving
      `DeleteProductCategory` unauthorized while it grows a new refusal branch is defensible, given
      that [0024](done/0024-products-core-crud-backend.md) reversed the same convention question for
      `app/Actions/Products/`.
- [ ] Documentation updated (docs-keeper): `docs/database/schema.md`'s `product_categories` section
      gains the in-use delete block and the `products` FK's role in it (its current text says the table
      has *"no FK in, no FK out"*, which 0024 already falsifies and this story gives a behavioural
      consequence); `docs/conventions/naming.md`'s `trans_choice` section gains this as the convention's
      **second** real key, and the first outside `roles.php`.
- [ ] **Hand-off recorded for story 0025**: it must bind its delete-confirmation modal's `@error` to
      **`productCategoryId`**, must **not** add a confirm-and-proceed or force-delete control of any
      kind, and — per **D-B1** — must add the `Gate::authorize('delete', $category)` call this action
      still lacks, **above** the in-use guard, never below it (**D-B2**).
- [ ] **The 0023 comment defect is raised rather than absorbed** (see **D-B1**): the docblock in
      `app/Actions/ProductCategories/CreateProductCategory.php` claims the caller-authorizes shape
      "matches `CreateUser`/`UpdateUser`", which is false. Not this story's to fix; recorded here, in
      [0024](done/0024-products-core-crud-backend.md)'s corrections table and in
      [0025](0025-product-categories-ui.md)'s risks, so 0025 meets a decision rather than a silence.
- [ ] Acceptance criteria met.

## Documented functional decisions

### D-14 — The category-delete guard: exact file, method, shape and exception type

*(Moved from [0024](done/0024-products-core-crud-backend.md), where it was written on 2026-08-18. The label
is kept so existing citations resolve. One subsection — the message form — is corrected.)*

**File:** `app/Actions/ProductCategories/DeleteProductCategory.php`. **Method:** `__invoke(ProductCategory $productCategory): bool`.
**Before this story** (0023) its body is a plain instance `->delete()`. 0023's **D-10** states the file
exists as its own file *specifically* so a later story extends it — this is that extension, and it is
the **only** change to 0023's shipped code besides one relation method on `ProductCategory`.

```php
public function __invoke(ProductCategory $productCategory): bool
{
    $inUseCount = $productCategory->products()->count();

    if ($inUseCount > 0) {
        throw $this->blockedByProducts($inUseCount);
    }

    try {
        return (bool) $productCategory->delete();
    } catch (QueryException $e) {
        // 23000 here is products.product_category_id refusing under restrictOnDelete():
        // a product was assigned to this category between the count above and this delete.
        // The count is the primary guard; the FK is the last word -- the same relationship
        // CreateUser has with the users.email unique index.
        if ($e->getCode() === '23000') {
            throw $this->blockedByProducts($productCategory->products()->count());
        }

        throw $e;
    }
}

private function blockedByProducts(int $count): ValidationException
{
    return ValidationException::withMessages([
        'productCategoryId' => trans_choice('products.categories.delete_blocked', $count, ['count' => $count]),
    ]);
}
```

**The count query** is `COUNT(*)` over `products.product_category_id`, served by that FK's own
auto-created index ([0024](done/0024-products-core-crud-backend.md) **D-10**) — a secondary-index range scan
with no table access, so **this story adds no unindexed query**. Three properties of it are deliberate:

- **Unfiltered by status.** A Draft product still occupies the category; counting only Active ones
  would let an administrator delete a category out from under a dozen drafts. This is the likeliest
  implementation bug and it has its own test.
- **No `lockForUpdate()`.** Locking a category's whole product set for a rare admin operation is a wide
  lock to buy what `restrictOnDelete()` already guarantees.
- **It means what it says only because `Product` is hard-deleted** ([0024](done/0024-products-core-crud-backend.md)
  **D-12**). If anyone adds `SoftDeletes` later, the count silently starts excluding trashed products
  and the guard changes meaning with no edit to the guard — hence the comment in the action and the
  regression test.

**FK: `restrictOnDelete()`.** `cascadeOnDelete()` is the dangerous default and does the exact opposite
of the requirement (deleting "Calzado" would silently delete 12 products). `nullOnDelete()` would force
`product_category_id` nullable, permanently un-enforcing "every product has a category", in exchange
for a behaviour the PRD forbids. `restrict` makes the block a **database invariant**, which is what
turns the application guard into genuine defence-in-depth rather than the only protection — it still
refuses a bulk cleanup, a seeder, or `ProductCategory::where(...)->delete()` through the **query
builder**, which per [base-standards.md](../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder)
skips model-level behaviour entirely. This is sound **only because `product_categories` has no soft
deletes** (0023 D-3): a soft-deleted parent never triggers an FK, so the guard would silently degrade
to application-only (**R-11**). The FK itself is [0024](done/0024-products-core-crud-backend.md)'s migration;
this story only relies on it.

**Exception type: `ValidationException`.** *Rejected:* a domain exception. Decisive reason — it is the
one exception Livewire already routes into the component's error bag with no plumbing at the call
site, so 0025's delete-confirmation modal renders the message with an `@error` block and catches
nothing. A `RuntimeException` subclass would need a `try`/`catch` + `addError()` at *every* call site,
and any call site that forgot would get an unhandled 500 — the exact failure this guard exists to
prevent. `App\Exceptions\ImmutableRoleException` is this repo's one domain exception of that shape and
is wrong here: its `render()` returns a **403**, converging on an authorization denial, and **this
refusal is not one** — the actor holds `products.delete` and the answer is still no. Precedent that
settles it: `CreateUser` converts a `23000` into a `ValidationException` for exactly this reason, and
[authorization.md](../../docs/architecture/authorization.md#a-domain-invariant-is-not-an-authorization-rule-and-does-not-live-here)
already owns the general rule that a domain invariant is not an authorization rule.

*Acknowledged counter-argument, recorded so Phase 5 does not re-litigate it:* `ValidationException`
conflates "your input was invalid" with "the world's state forbids this", and the actor submitted
nothing invalid. Considered, and outweighed by the rendering argument.

**The error-bag key `'productCategoryId'` is a hand-off contract** — 0025 must bind its `@error` to it.
Record it in the action's docblock; `CreateUser` sets the same precedent by throwing on `'email'`.

#### The message — corrected at the split (Phase 2 finding B4)

The message is a **`trans_choice`** key, because the singular differs. 0024's draft proposed the
explicit-range form `{1} …|[2,*] …` **and claimed there was no `trans_choice` precedent anywhere in
`lang/`**. That claim is false: `lang/en/roles.php`'s `index.delete_blocked` has used the simple
`singular|plural` form since task 0010, there are six `trans_choice()` call sites in the codebase, and
[naming.md](../../docs/conventions/naming.md#translation-keys) has owned the convention since then.

**So this key matches the existing precedent's form rather than introducing a second one:**

```php
// lang/en/products.php — owned by THIS story (the file itself is 0024's)
'categories' => [
    'delete_blocked' => 'This category is used by :count product and cannot be deleted.'
        .'|This category is used by :count products and cannot be deleted.',
],
```

The simple form is sufficient here because **the count is always ≥ 1 when the message renders** — the
guard only throws when `$inUseCount > 0` — so Laravel's `count === 1 ? first : second` selection is
exactly right, and the explicit-range syntax would buy nothing while diverging from the one existing
key a reader would compare against. `:count` appears in **both** halves, matching `roles.php`.

*Placement note:* the string is *about* categories but lives in `products.php`, because the message is
about **products using** the category, and 0026/0027/0028 all extend the same file. Alternatives were a
new `product-categories.php` domain file for one key, or extending 0023's file (there isn't one).
Recorded so nobody "tidies" it later. Spanish pluralisation is written, not transliterated, and both
locales land in the same change.

#### Why there is no confirm-and-proceed path, ever

Three independent reasons, any one sufficient:

1. **The PRD says so, twice** (§2.2's Gherkin: *"deletion is always blocked (no confirm-and-proceed
   path) … they must reassign those products' category before it can be deleted"*, and AC 2). It is
   stated for four sibling entities across the PRD — a house pattern, not a per-entity preference.
2. **`product_category_id` is NOT NULL, so there is no coherent "proceed".** It would have to null the
   column (the schema forbids it), cascade-delete the products (catastrophic, never asked for), or
   reassign them to a fallback category nobody has defined and which does not exist. Every branch is
   worse than refusing.
3. **The database would refuse anyway** under `restrictOnDelete`, so a confirm button could not work.

### D-B1 — This story does **not** add authorization to `DeleteProductCategory`, and that is a decision

[0024](done/0024-products-core-crud-backend.md) **reversed** its own equivalent question at the split: its
four product actions now self-authorize, because the premise that `CreateUser`/`UpdateUser` do not was
**false** (0024 **C-1**). The obvious follow-through is to do the same here, since this story is
already opening `DeleteProductCategory`. **It deliberately does not**, for two reasons:

1. **Closing one of three leaves the folder half-converted, which is worse than uniformly deferred.**
   `app/Actions/ProductCategories/` holds `CreateProductCategory`, `RenameProductCategory` and
   `DeleteProductCategory`. 0023 shipped all three unauthorized as an explicit, documented hand-off to
   **0025** — recorded as a ⚠️ in [schema.md](../../docs/database/schema.md#product_categories) and in
   [base-standards.md](../../docs/conventions/base-standards.md#directory-structure). Gating only the
   one this story happens to touch produces an inconsistency a reader cannot explain from the code,
   and it silently changes 0025's job from "add three gates" to "add two, and find out why".
2. **Scope.** This story exists because the original 0024 was too large. Absorbing 0023's hand-off
   would re-grow it, and the hand-off has an owner already.

**What this story does instead** is make the gap visible where it will be met: the Definition of Done
records it, and **D-B2** states the ordering constraint 0025 inherits. If Phase 2 disagrees and wants
all three gated here, that is a coherent alternative — but it should be *all three*, and it should be
recorded as absorbing 0023's hand-off rather than as a detail of this one.

> ⚠️ **A false comment in shipped code, found during the split and owned by nobody yet.**
> `app/Actions/ProductCategories/CreateProductCategory.php:36` reads *"matching
> `App\Actions\Users\CreateUser`/`UpdateUser`'s caller-authorizes shape"*. Those two actions **do**
> self-authorize (`CreateUser::__invoke()` line 66), so the comment asserts the opposite of the truth,
> in code rather than in a task file — where the next author reads it as licence. It is the same false
> premise that produced 0024's original RQ-10. Not this story's to fix; raised in three places so it
> cannot be missed, and a candidate for [errors-log.md](../../docs/errors-log.md) alongside the
> 2026-08-29 entry it resembles.

### D-B2 — When 0025 adds the gate, it goes **above** the in-use guard

An ordering constraint, stated now because it is invisible from inside 0025 and expensive to get wrong.
[authorization.md](../../docs/architecture/authorization.md#a-domain-invariant-is-not-an-authorization-rule-and-does-not-live-here)
already establishes the rule for the Sales Regions screen: **a domain invariant runs strictly *after*
authorization.** Inverting the two here would mean an actor who lacks `products.delete` entirely gets
told *"this category is used by 12 products"* — a permission refusal dressed as a business message,
which both discloses the count to someone with no right to it and hides the real reason from them.

So the shipped call order in 0025 is: `Gate::authorize('delete', $category)` (through
`LogRefusedPrivilegedAttempt`, per the refusal-logging recipe) → **then** `DeleteProductCategory`,
whose own first act is the count. The two refusals stay distinguishable by type: **403** for the
authorization one, a `ValidationException` on `productCategoryId` for the invariant.

**The invariant refusal should be logged too**, per the same page — `->log($actor,
'category_in_use', 'product_category', $category->id)` immediately above the `throw`, matching the
snake_case reason strings `SetSalesRegionActive` uses. **Whether that log call lands in this story or
in 0025 is a Phase 2 question**: putting it here means the action logs before any caller authorizes,
which is harmless but odd; putting it in 0025 splits the refusal from its record. Recorded as a real
choice rather than decided unilaterally.

## Dependencies, risks and open questions

### Dependencies

- **[0024](done/0024-products-core-crud-backend.md) (products core CRUD backend) — hard, blocking.** The
  guard counts through `products.product_category_id`, which that story's migration creates, and every
  test here needs `Product` and `ProductFactory`. It also creates `lang/{en,es}/products.php`, which
  this story appends one key to.
- **[0023](done/0023-product-categories-backend.md) (product categories backend) — hard, and
  ✅ SATISFIED.** This story modifies its `DeleteProductCategory` and its `ProductCategory` model.
- **Independent of [0024a](done/0024a-product-description-html-sanitization.md).** They touch disjoint files
  and may ship in either order.
- **Story 0025 depends on this one** — half of that screen's stated scope (the blocked-delete message,
  the count, the `productCategoryId` error-bag binding) comes from here, and 0025's own **F-1** already
  records that its hard blocker was never only 0023.

> **Sequential-implementation requirement.** This story and **0025** both write
> `lang/en|es/products.php`, and this story edits `app/Actions/ProductCategories/DeleteProductCategory.php`
> which 0025 then calls. **0024, then this story, must each be fully closed before 0025 starts.**

### Risks

- **R-11 — `restrictOnDelete` on the category FK is load-bearing only while `ProductCategory` stays
  hard-deleted.** Adding `SoftDeletes` to it later silently disarms the **database** half of the guard,
  since a soft delete is an `UPDATE` and never triggers an FK — leaving the application count as the
  only protection, with nothing going red. The mirror hazard is on the other side: adding `SoftDeletes`
  to **`Product`** silently changes what the count *means* (trashed products stop counting), which is
  why both are asserted by regression tests rather than trusted to review.
- **R-14 — The reassign-away race is not testable here.** If the last product is reassigned *between*
  the count and the delete, the count says 1 while reality says 0 — the category is refused deletion
  although nothing uses it. It needs genuine concurrency against an open `RefreshDatabase` transaction.
  **Fail-closed (refuse; the administrator's retry succeeds) is the correct behaviour and is recorded
  as a decision**, not left as an unasserted assumption. Note the *opposite* race — a product assigned
  between the count and the delete — **is** testable and is covered, via a `deleting` hook.
- **R-B1 — (new, at the split) This story edits another story's shipped code, so its blast radius is
  larger than its diff.** `DeleteProductCategory` is called by 0023's own tests today and by 0025's
  screen tomorrow. The retrofit inserts a branch *before* the existing behaviour, which is the shape
  most likely to change a not-found or an already-deleted case by accident — hence the three unmodified
  regression cases, which are the point of the test file rather than boilerplate.
- **R-B2 — `lang/*/products.php` is claimed by five stories** (0024 creates it; this story, 0026, 0027
  and 0028 extend it). Uncoordinated, one silently overwrites another's keys, and a missing `lang/es`
  key renders as its own raw key with no error. This is 0024's **R-13** as it lands here.

### Open questions

- **OQ-B1 — Does the invariant refusal's log line belong in this story or in 0025?** See **D-B2**. Both
  placements are defensible; the choice affects whether the refusal and its record can drift. **For
  Phase 2 to settle**, not a product decision — no acceptance criterion depends on it either way.

Nothing else in this story is blocked on a product decision.

## Provenance

Split out of [0024](done/0024-products-core-crud-backend.md) on 2026-09-01, on the coordinator's explicit
instruction, after `code-reviewer`'s Phase 2 INVEST review returned **FAIL** and recommended a
three-way split. Its own reasoning for this cut line, which 0024's pre-Phase-2 note had itself flagged
for that review: this is *the only part of that file that edits another story's shipped code*, and it
is independently valuable and independently testable — it depends only on `products.product_category_id`
existing, not on the sanitization work or on anything else 0024 ships.

**D-14 is moved with one correction.** Its message subsection previously proposed the explicit-range
`trans_choice` form on the stated ground that *"there is no `trans_choice` precedent anywhere in `lang/`
today"*; that claim is false (`lang/en/roles.php`, task 0010), and the key now matches the existing
simple `singular|plural` form. Everything else — the guard shape, the three deliberate properties of
the count, the FK reasoning, the `ValidationException` choice with its acknowledged counter-argument,
the `productCategoryId` hand-off key, the placement note and the three no-confirm-and-proceed reasons —
is unchanged.

**D-B1 and D-B2 are new**, and each answers a question that only exists *because* of the split: whether
a story that opens `DeleteProductCategory` should also close 0023's authorization hand-off (no, and
why), and what ordering 0025 must use when it does (gate first, invariant second, both logged). **D-B1
also carries the split's incidental finding** — a false claim about `CreateUser`/`UpdateUser` sitting in
shipped code — which is recorded rather than fixed here because it belongs to a folder this story is
deliberately not converting.
