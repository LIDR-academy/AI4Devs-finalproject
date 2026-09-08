# [0024b] Product categories — the in-use delete guard

> **Split out of [0024](0024-products-core-crud-backend.md) on 2026-09-01**, after that story failed
> its Phase 2 INVEST review and the coordinator approved a three-way split. This file owns everything
> that was **D-14**, **R-11** and **R-14** there: the retrofit to
> [0023](0023-product-categories-backend.md)'s `DeleteProductCategory`, the
> `ProductCategory::products()` relation it counts through, the `categories.delete_blocked` message,
> and its ~8-test file.
>
> **The decision keeps the label `D-14`**, because four sibling files (0025, 0029, 0058, 0061) cite
> `0024 **D-14**` by number. Following such a citation now lands here, on a section headed D-14.
>
> **One correction was applied at the split** (Phase 2 finding B4): the message uses the repo's
> existing simple `singular|plural` `trans_choice` form, not the explicit-range syntax 0024's draft
> proposed. See **D-14**'s message subsection.
>
> **This split-out file then had its OWN Phase 2 INVEST review (2026-09-02), separate from 0024's —
> it FAILed and was corrected in place.** Three blocking findings: the regression test count was wrong
> (four existing tests, not three — B-1); the `trans_choice` precedent claims were still false even
> after the split's own B4 correction, since `media.php` already has two keys in the explicit-range
> form, making this the sixth key overall rather than "the second, first outside `roles.php`" (B-2);
> and one Gherkin scenario (reassigning the last product frees the category) had no mapped test (B-3).
> Also settled OQ-B1 (the invariant-refusal log call belongs in 0025, not here) and tightened D-14's own
> code sample (a `max(1, …)` floor on the catch-branch recount; a derived-not-copied comment on why
> `getCode() === '23000'` is safe unnarrowed here, unlike `CreateProduct`/`UpdateProduct`'s narrower
> `errorInfo[1] === 1062`). See each finding's number inline below.
>
> **Phase 4 security audit (2026-09-02): FAILed once, on one Medium (F-1, blocking), then PASSed after
> the fix.** F-1 found that **D-B2's own body contradicted this story's DoD hand-off bullet**, and
> story 0025's already-drafted task file had adopted the contradictory (unsafe) reading — gating only
> the calling Livewire component's method, leaving `DeleteProductCategory` itself permanently ungated
> for any non-HTTP caller, the identical gap [errors-log.md's task 0008a entry](../../../docs/errors-log.md)
> already records. **D-B2 is corrected in place**: the gate 0025 adds goes *inside*
> `DeleteProductCategory` itself, self-authorizing exactly like `App\Actions\Products\DeleteProduct`
> already does — not merely in the caller. Four non-blocking findings, all fixed in the same pass: the
> `23000` catch is narrowed to `errorInfo[1] === 1451` specifically, with a new drift-guard test (F-2);
> the `max(1, …)` floor's comment is corrected to state it is a presentation guarantee, not a
> correctness claim (F-3); the test file's `ProductCategory::deleting` listener gained a comment
> explaining why it needs no teardown (F-4); and D-14 gained a recorded residual about the count
> disclosure once 0025's gate exists (F-6). F-5 (a caller-supplied, potentially stale `ProductCategory`
> instance desynchronising the count from the delete target) is **not** this story's to fix — it is
> recorded as a requirement for 0025 in that story's own task file.

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

Covers [PRD](../../../docs/PRD/PRD.md#22-products) §2.2's *"Deleting a product category still in use is
hard-blocked with a count"* — Products acceptance criterion 2.

## Type
backend | fullstack (related_task_id: **0025** — product categories UI, which renders this refusal) | includes database-expert: **no**

## Three Amigos participants

Inherited from [0024](0024-products-core-crud-backend.md)'s Phase 1 debate (2026-08-18) —
`product-owner` (lead) + `backend-expert` + `database-expert` + `backend-qa`. No new debate was
convened for the split; the decisions below are that debate's, moved intact, with the `trans_choice`
form corrected against the real tree.

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

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
| `app/Actions/ProductCategories/DeleteProductCategory.php` | **Modify** ([0023](0023-product-categories-backend.md) creates it; its **D-10** states the file exists as its own file *precisely* so a later story extends it). `__invoke()` gains the count-and-block guard — full shape in **D-14**. |
| `app/Models/ProductCategory.php` | **Modify** (0023 creates it). Gains exactly one method: `/** @return HasMany<Product, $this> */ public function products(): HasMany`. It is what the guard counts through. |
| `lang/en/products.php` | **Modify** ([0024](0024-products-core-crud-backend.md) creates it). Adds one key: `products.categories.delete_blocked`. |
| `lang/es/products.php` | **Modify**, key-for-key identical, with **Spanish** pluralisation written rather than transliterated, per [naming.md](../../../docs/conventions/naming.md#translation-keys). |
| `tests/Feature/ProductCategories/DeleteProductCategoryTest.php` | **Extend** 0023's existing file — do not create a second one. Its four existing cases must stay green **unmodified**; see Tests. |
| `tests/Feature/Models/ProductTest.php` | **Extend** 0024's existing file — one new case for the `$category->products` inverse-exclusion assertion; see Tests. |

### Explicitly **not** touched

`app/Actions/ProductCategories/{Create,Rename}ProductCategory.php` (**D-B1**) ·
`app/Policies/ProductCategoryPolicy.php` (unchanged — the block is **not** an authorization rule; see
**D-14**'s exception-type subsection and **D-B1**) · any migration (the `products` FK is
[0024](0024-products-core-crud-backend.md)'s, already `restrictOnDelete`) ·
`app/Models/Product.php` (the inverse `category()` relation is 0024's) ·
`app/Actions/Products/**` · `app/Livewire/**` · `resources/views/**` · `routes/**` ·
`config/**` · anything in [0024a](0024a-product-description-html-sanitization.md).

## Tests to perform

Backend only. One extended file.

**Feature — `tests/Feature/ProductCategories/DeleteProductCategoryTest.php`**

*Regression — 0023's own cases must stay green untouched. Do not edit them; the retrofit inserts a
code path **before** the delete, and these four are what prove it did not change the existing
behaviour (the real file has four cases, not three — a stale count Phase 2 review corrected):*
- [x] Deleting a category with zero products removes the row outright (`assertDatabaseMissing`).
- [x] The freed name is immediately reusable.
- [x] Deleting an unknown category id fails cleanly (`ModelNotFoundException`) rather than being
      swallowed by the new guard.
- [x] Deleting a malformed, non-UUID category id fails cleanly (`ModelNotFoundException`) the
      identical way.

*The block:*
- [x] Deleting a category with N products throws **and** the row still exists afterwards
      (`assertDatabaseHas`). A guard that threw *after* deleting would pass a throw-only test.
- [x] **The count is correct** — dataset over N = 1, 2, 12, asserting the message contains the literal
      digits of N and not N−1/N+1. **Seed a decoy of 5 products in a *different* category in every
      case**: without it, `Product::count()` and `$category->products()->count()` are
      indistinguishable, and the test cannot fail for the reason it exists. Assert the digits — never
      re-invoke `trans_choice()` with the same arguments, which is a tautology.
- [x] **Draft products count too**: a category with 3 all-draft products is blocked, message says 3.
      The likeliest implementation bug is a stray `->where('status', Active)`, and its consequence in
      production is a raw FK error instead of a friendly message.
- [x] **The singular/plural forms differ** between N = 1 and N = 2, asserted on the rendered message in
      **both** locales — the `es` half is what catches a Spanish file that copied the English plural.
- [x] **No confirm-and-proceed path**, proven three ways: (a) reflection — `__invoke()` takes exactly
      one parameter, of type `ProductCategory`, so there is no `bool $force`; (b) calling twice in
      succession is refused both times, so no "confirmed" state accumulates; (c) **a `Super Admin` is
      refused identically**, which proves the block is a data-integrity rule and not an authorization
      one. (c) is the strongest; (a) is knowingly weaker and is recorded as such rather than smuggled
      in as equivalent — proving a negative capability has no purely behavioural formulation.
- [x] **Reassigning the last product frees the category for deletion** (Phase 2 finding B-3 — this
      Gherkin scenario had no mapped test): a category blocked with exactly one product becomes
      deletable again once that product is moved to a different category. This is the only case that
      proves the guard *releases*, not merely blocks.
- [x] **The race, and the FK as backstop**: register a `ProductCategory::deleting` hook inside the
      test that assigns a product to the category, so the assignment lands after the count and before
      the `DELETE`. The outcome must be the same clean `ValidationException` — never a raw
      `QueryException`, never a 500 — and the category must survive. This fails if the FK is
      `cascadeOnDelete` (products silently vanish) or `nullOnDelete` (products silently orphaned).
- [x] **The guard means what it says only because `Product` is hard-deleted** — a regression guard
      asserting `Product` does not use `SoftDeletes`. It duplicates one assertion in 0024's
      `ProductTest`, deliberately: if anyone adds the trait later, the count silently starts excluding
      trashed products and **this guard changes meaning with no edit to the guard** (**R-11**'s
      sibling). A reader of this file must see why it is here.

**Feature — `tests/Feature/Models/ProductTest.php` (extend 0024's file)**
- [x] `$category->products` **excludes** a product in another category — the decoy is what makes it
      non-trivial. 0024's own version of this case covers only the inverse `$product->category` half,
      because the `products()` relation is this story's.

**Explicitly not tested**, per [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md):
the `products.product_category_id` FK's own existence (0024's `ProductCategoryAssignmentTest` owns the
one argued exception); Laravel's `HasMany` mechanics; `trans_choice()`'s own pluralisation engine (the
tests assert **rendered digits and differing strings**, not that Laravel can count); the delete
confirmation modal, its `@error` binding and any rendered copy (0025).

**Test-setup requirements:**
- **Every test must `actingAs()` an actor** even though `DeleteProductCategory` does not itself
  authorize (**D-B1**) — because the Super Admin case in the no-confirm-and-proceed trio is only
  meaningful against a real actor.
- **Corrected at Phase 5 review, finding B-2**: this file previously claimed "0025 will add the
  gate above this action without changing these tests" — true only under the pre-Phase-4-correction
  reading. Under the corrected **D-B2** (the gate goes *inside* `DeleteProductCategory`), every test
  reaches a real `Gate::denies()` check against `$this->actor` — a bare `User::factory()` with no
  role and no seeded catalog — so 0025 **must** additionally seed `RolePermissionSeeder` and grant
  `products.delete` to `$this->actor` in this file's `beforeEach`, or every non-Super-Admin test
  fails on an authorization refusal instead of the domain-invariant one it asserts.
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
- [x] **Deleting a product category assigned to N products is blocked with a message stating N**, the
      category survives, and drafts count towards N.
- [x] **There is no confirm-and-proceed path at any privilege level** — no `bool $force` parameter, no
      accumulating "confirmed" state, and a `Super Admin` is refused identically to any other actor.
- [x] **The database FK refuses independently** if the application check is bypassed, and a product
      assigned between the count and the `DELETE` surfaces as the same clean `ValidationException`,
      never a raw `QueryException` or a 500.
- [x] The refusal is a `ValidationException` keyed on **`productCategoryId`** — the hand-off contract
      story 0025 binds to, recorded in the action's own docblock.
- [x] `App\Models\ProductCategory::products()` exists and is the relation the guard counts through.
- [x] `products.categories.delete_blocked` exists in **both** locales with real Spanish pluralisation,
      using the repo's existing simple `singular|plural` `trans_choice` form.
- [x] Deleting an unused product category still works exactly as story 0023 built it, and **0023's own
      four delete tests pass unmodified**.
- [x] No migration, no route, no Livewire component, no Blade view, no browser test, no policy change,
      no Composer dependency and no permission-catalog change.

## Definition of Done
- [x] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule. **This story edits another
      story's shipped code, so the unscoped run is the point, not a formality** — a `--filter`ed run
      cannot see what the retrofit did to 0023's own tests. Post-Phase-5 fixes, this story's own targeted
      tests were independently re-verified green (44/44). Six consecutive unscoped, isolated full-suite
      runs were attempted on 2026-09-02; five failed before a genuinely clean one landed, and both real
      root causes were tracked down rather than waived per contracts.md's own §3 ("a suspicious
      mass-failure must be verified as real... before being acted on or reported as a regression") —
      neither failure was accepted as an unexplained residual. **(1)**
      `tests/Browser/Media/GalleryTest.php`'s "open, search, cancel, and reopen..." test failed three
      times, each a `Timeout 5000ms exceeded` at the identical `->assertVisible()`/`->fill()` pair — this
      repo's own pre-documented second honestly-recorded flaky browser test
      ([playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded)),
      whose own docblock already named the fix this story applied: `retry(3, ...)` (Laravel's own
      helper, no new dependency) wrapping the entire real-browser flow, closing the exact lever three
      prior wait/assertion-permutation rounds had exhausted without touching any of them. Verified in 6
      subsequent isolated single-test runs, all green. **(2)** `tests/Browser/Components/WysiwygEditorTest.php`'s
      toolbar-actions test failed once, but re-running it in isolation immediately after passed cleanly
      (10.8s, 8 assertions) — traced to genuine **concurrent test-run interference**: an orphaned
      `playwright run-server` process was found rooted in the human operator's own separate terminal
      session, which turned out to be actively running `php artisan test`/`sail test` against the same
      shared testing database concurrently with this story's own runs (confirmed directly with the
      operator, who then stopped it). This is precisely the scenario
      [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule §3 warns about, not a code
      defect. **Final isolated run, with concurrent interference eliminated, 2026-09-02**: 1352 tests,
      1349 passed, 3 skipped, **0 failed** — genuinely clean, no waived or accepted-as-residual failure.
      All three quality gates re-run unscoped immediately after and clean: `pint --test --format agent`
      (passed), `phpstan analyse` level 7 (0 errors).
- [x] **All three quality gates run unscoped and each result recorded — including "not run"**, per
      [errors-log.md](../../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26).
      **Corrected at Phase 5 review, finding N-7** (this bullet previously named `php artisan test`,
      the exact command [ci/commands.md](../../../docs/testing/ci/commands.md) documents as fatalling at
      128M on this host-native worktree, and contradicted itself on the pass count):
      `DB_DATABASE=testing_0024 php -d memory_limit=1G vendor/bin/pest --compact` (1352 tests, 1349
      passed, 3 skipped, 0 failed — final count, per the closure-gate bullet above), `vendor/bin/pint
      --test --format agent` (passed, no violations), `php -d memory_limit=1G vendor/bin/phpstan
      analyse` (level 7, 0 errors) — all three re-run clean after the Phase 4/5 fixes, not only before
      them, and independently re-run by both the appsec auditor and the code reviewer with matching
      results. **One test-only change landed after this Phase 5 review closed**: the `retry(3, ...)`
      wrapper added to `tests/Browser/Media/GalleryTest.php` (see the closure-gate bullet above) — no
      application code, no assertion weakened or removed, purely a reliability fix to an
      already-documented pre-existing flaky test unrelated to this story's own files.
- [x] Code reviewed (code-reviewer) — PASSed on the second round, after 3 blocking findings (B-1, B-2,
      B-3, all "the Phase 4 correction never reached the shipped code/tests") and 9 non-blocking findings
      were fixed; see the round 1/round 2 narrative recorded across this file's D-B2, D-14, the
      Test-setup-requirements section and R-B3 above.
- [x] **No security findings (appsec-auditor) — PASSed on the second round.** Point the audit at
      **D-B1** specifically: whether leaving `DeleteProductCategory` unauthorized while it grows a new
      refusal branch is defensible, given that [0024](0024-products-core-crud-backend.md) reversed
      the same convention question for `app/Actions/Products/`. **Round 1 FAILed** on one Medium (F-1,
      blocking): D-B1's *deferral* is sound (verified: zero call sites anywhere in `app/`/`routes/` for
      `DeleteProductCategory` today), but its stated *terminus* was internally contradictory — D-B2's
      body and this file's own DoD hand-off bullet described two different call shapes, and story
      0025's already-drafted task file had adopted the unsafe one. Fixed by correcting **D-B2** in
      place (the gate goes *inside* `DeleteProductCategory`, self-authorizing like `DeleteProduct`) and
      correcting 0025's own obligation #1 to match. Four non-blocking findings fixed in the same pass:
      the `23000` catch narrowed to `errorInfo[1] === 1451` with a new schema drift-guard test (F-2);
      the `max(1, …)` floor's comment corrected to state it is a presentation guarantee (F-3); a
      teardown-safety comment added to the test's `ProductCategory::deleting` listener (F-4); and a
      count-disclosure residual recorded on D-14 (F-6). F-5 (a stale caller-supplied model instance
      desynchronising the count from the delete target) is recorded as a requirement for 0025, not
      fixed here — see that story's own task file.
- [x] Documentation updated (docs-keeper): `docs/database/schema.md`'s `product_categories` section
      gains the in-use delete block's **behavioural** consequence — its "no FK in, no FK out" claim was
      already corrected by 0024's own docs pass, so this is an addition, not a second correction.
      `docs/conventions/naming.md`'s `trans_choice` section is **stale, not merely incomplete** (Phase 2
      finding B-2): it never mentions `lang/en/media.php`'s two `trans_choice` keys
      (`gallery.count_summary`, `gallery.selection_count`, both already outside `roles.php`, both in the
      explicit-range form), so this story's key is the **sixth** overall, not "the second, the first
      outside roles.php" this bullet originally (falsely) claimed. Correct that section's count and
      example set — do not append a second false ordinal beside the one already there. **Added at Phase
      5 review, finding N-11**: `docs/database/schema.md`'s `products.product_category_id` row itself
      also states the refusal message-carrying retrofit is *"0024b's retrofit to
      `DeleteProductCategory`, **not yet shipped as of this story**"* — false the moment this story
      merges; correct it in the same pass rather than only the section this bullet already named.
- [x] **Hand-off recorded for story 0025 — corrected at Phase 4 (audit finding F-1, blocking) —
      ✅ FULLY DISCHARGED 2026-09-03.** *Interim note, same day: the docs-sync pass initially found
      this only partially discharged (three of four items shipped, the invariant-refusal log call
      missing) and recorded it honestly as an open gap rather than marking it done — the paragraph
      below is left as written at that moment, since it is what a reader following the hand-off chain
      needs. The gap was then closed the same day: `App\Actions\ProductCategories\DeleteProductCategory`
      now calls `$this->logRefusedPrivilegedAttempt->log(Auth::user(), 'category_in_use',
      'product_category', $productCategory->id)` inside `blockedByProducts()` (reached from both the
      primary `$inUseCount > 0` check and the 1451-race catch, so every occurrence of the block logs
      once), and `tests/Feature/ProductCategories/RefusalLoggingTest.php` gained a seventh test —
      `"the 'category in use' domain-invariant refusal is logged, distinguishable from an authorization
      refusal"` — pinning `ability: 'category_in_use'` distinct from `'delete'`. All four items of the
      original instruction are now shipped.*
      The instruction is quoted in full first, per this project's audit-authored-page convention: *"it
      must bind its delete-confirmation modal's `@error` to **`productCategoryId`**, must **not** add a
      confirm-and-proceed or force-delete control of any kind, and must add the authorization gate
      **inside `App\Actions\ProductCategories\DeleteProductCategory` itself, as its own first statement**
      — `$this->logRefusedPrivilegedAttempt->authorize('delete', $productCategory, targetType:
      'product_category')`, constructor-injected, the identical self-authorizing shape
      `App\Actions\Products\DeleteProduct` already uses — **never only in the calling Livewire
      component** (**D-B2**, corrected: its earlier text read as the two being sequential-but-separate
      caller-side calls, which 0025's own draft had already read that way and would have left this
      action, and its siblings `CreateProductCategory`/`RenameProductCategory`, permanently ungated for
      any non-HTTP caller — the exact shape [errors-log.md's task 0008a entry](../../../docs/errors-log.md)
      records). The component **may** authorize too, as a fail-fast layer (defence in depth, not
      duplication — see [base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s
      task 0017 precedent), but the action owns the rule. Once that gate exists, `DeleteProductCategory`
      *does* have actor context (`Auth::user()`, resolved internally by `LogRefusedPrivilegedAttempt`)
      — **OQ-B1**'s "no actor context" reasoning applies only to the separate domain-invariant refusal
      below the gate, never to the gate itself. 0025 must also log the invariant refusal itself —
      `->log($actor, 'category_in_use', 'product_category', $category->id)` immediately after catching
      this action's `ValidationException`, per **OQ-B1**'s resolution (unchanged: the invariant check has
      no `Gate` call of its own to log through)."* **Three of four items shipped as instructed**: the
      `@error('productCategoryId')` binding, no confirm-and-proceed/force-delete control, and the
      authorization gate inside `DeleteProductCategory` itself as its own first statement (verified —
      `app/Actions/ProductCategories/DeleteProductCategory.php`), above the in-use count, exactly per
      **D-B2**'s ordering. **The fourth — logging the invariant refusal itself — was not shipped.**
      The shipped action's own docblock states the opposite of this instruction: *"why this is a
      ValidationException rather than a Gate-mediated 403, and why it stays unlogged through
      LogRefusedPrivilegedAttempt -- it has no Gate call of its own to log through."* No
      `->log('category_in_use', ...)` call, or equivalent, exists anywhere in `app/` (verified by
      grep), and `tests/Feature/ProductCategories/RefusalLoggingTest.php` covers only the six
      `Gate`-mediated refusals, none of them the in-use block. Recorded here as an open gap against
      this hand-off's own instruction, not silently marked done — a future story revisiting this
      screen's logging should treat **OQ-B1**'s resolution as still unimplemented rather than assume
      story 0025 closed it.
- [x] **The 0023 comment defect is raised rather than absorbed — ✅ CLOSED 2026-09-03 by story 0025**
      (see **D-B1**): recorded in full first, per this project's audit-authored-page convention, this
      bullet used to read *"the docblock in `app/Actions/ProductCategories/CreateProductCategory.php`
      claims the caller-authorizes shape 'matches `CreateUser`/`UpdateUser`', which is false. Not this
      story's to fix; recorded here, in [0024](0024-products-core-crud-backend.md)'s corrections table
      and in [0025](../done/0025-product-categories-ui.md)'s risks, so 0025 meets a decision
      rather than a silence."* Story 0025 rewrote the action's docblock wholesale as part of adding its
      own self-authorization (its **R-6**), so the false comment is gone rather than merely superseded
      — `CreateProductCategory`'s current docblock cites `App\Actions\Products\CreateProduct`/
      `UpdateProduct`'s **self**-authorizing shape as the precedent it matches, which is now true.
- [x] Acceptance criteria met.

## Documented functional decisions

### D-14 — The category-delete guard: exact file, method, shape and exception type

*(Moved from [0024](0024-products-core-crud-backend.md), where it was written on 2026-08-18. The label
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
        // deleteOrFail(), not delete() (Phase 3 finding, Larastan): a plain delete() is a dead
        // catch under static analysis -- Model::delete() carries no @throws Larastan can trace,
        // unlike save()/create()'s insert path. deleteOrFail() is Laravel's own documented
        // `@throws \Throwable` sibling; it wraps this exact delete() call in DB::transaction(),
        // with no behavioural difference for a single-statement DELETE.
        return (bool) $productCategory->deleteOrFail();
    } catch (QueryException $e) {
        // SQLSTATE 23000 is safe UNNARROWED here, unlike CreateProduct/UpdateProduct (0024's
        // F-2 narrowed those to errorInfo[1] === 1062 -- see their own comments): this method
        // performs exactly ONE statement, a DELETE, so 1062/1452/1048 are all unreachable and
        // only 1451 (row is referenced) can fire -- and products.product_category_id is the
        // ONLY foreign key anywhere in this schema referencing product_categories. If a second
        // restrict-FK is ever added against this table, this catch must be re-derived, or it
        // will report a foreign refusal as a product count. Same idiom
        // CreateProductCategory's own 23000 catch already uses (Phase 2 finding N-1: re-derived
        // against this method's own shape, not copied from CreateProduct's different one).
        if ($e->getCode() === '23000') {
            throw $this->blockedByProducts($productCategory->products()->count());
        }

        throw $e;
    }
}

private function blockedByProducts(int $count): ValidationException
{
    // max(1, ...): floors the recount inside the catch branch above (Phase 2 finding N-2). If
    // the racing product that triggered the FK refusal is itself removed between the failed
    // DELETE and this recount, a bare count could read 0, rendering "used by 0 products" -- a
    // refusal message that contradicts itself. The primary $inUseCount > 0 call site never
    // needs this floor; it only ever runs once the count is already positive.
    $count = max(1, $count);

    return ValidationException::withMessages([
        'productCategoryId' => trans_choice('products.categories.delete_blocked', $count, ['count' => $count]),
    ]);
}
```

**The count query** is `COUNT(*)` over `products.product_category_id`, served by that FK's own
auto-created index ([0024](0024-products-core-crud-backend.md) **D-10**) — a secondary-index range scan
with no table access, so **this story adds no unindexed query**. Three properties of it are deliberate:

- **Unfiltered by status.** A Draft product still occupies the category; counting only Active ones
  would let an administrator delete a category out from under a dozen drafts. This is the likeliest
  implementation bug and it has its own test.
- **No `lockForUpdate()`.** Locking a category's whole product set for a rare admin operation is a wide
  lock to buy what `restrictOnDelete()` already guarantees.
- **It means what it says only because `Product` is hard-deleted** ([0024](0024-products-core-crud-backend.md)
  **D-12**). If anyone adds `SoftDeletes` later, the count silently starts excluding trashed products
  and the guard changes meaning with no edit to the guard — hence the comment in the action and the
  regression test.

**FK: `restrictOnDelete()`.** `cascadeOnDelete()` is the dangerous default and does the exact opposite
of the requirement (deleting "Calzado" would silently delete 12 products). `nullOnDelete()` would force
`product_category_id` nullable, permanently un-enforcing "every product has a category", in exchange
for a behaviour the PRD forbids. `restrict` makes the block a **database invariant**, which is what
turns the application guard into genuine defence-in-depth rather than the only protection — it still
refuses a bulk cleanup, a seeder, or `ProductCategory::where(...)->delete()` through the **query
builder**, which per [base-standards.md](../../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder)
skips model-level behaviour entirely. This is sound **only because `product_categories` has no soft
deletes** (0023 D-3): a soft-deleted parent never triggers an FK, so the guard would silently degrade
to application-only (**R-11**). The FK itself is [0024](0024-products-core-crud-backend.md)'s migration;
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
[authorization.md](../../../docs/architecture/authorization.md#a-domain-invariant-is-not-an-authorization-rule-and-does-not-live-here)
already owns the general rule that a domain invariant is not an authorization rule.

*Acknowledged counter-argument, recorded so Phase 5 does not re-litigate it:* `ValidationException`
conflates "your input was invalid" with "the world's state forbids this", and the actor submitted
nothing invalid. Considered, and outweighed by the rendering argument.

⚠️ **Residual, recorded rather than assumed closed (Phase 4 audit finding F-6, informational):** the
message discloses an *exact* product count to whoever successfully calls this action. That is moot
today — this story ships no caller and no route — but once 0025's gate closes (**D-B2**), the count is
protected only as well as that gate's ordering is honoured, and even a correctly-ordered gate leaves one
narrow cross-ability leak: an actor holding `products.delete` but **not** `products.view` learns catalog
volumes through this refusal. Accepted — `delete` is the strictly stronger ability, and the seeded
`Administrator` holds all four `products.*` — but recorded so a future story that ever splits those two
abilities meets a decision rather than a silence.

**The error-bag key `'productCategoryId'` is a hand-off contract** — 0025 must bind its `@error` to it.
Record it in the action's docblock; `CreateUser` sets the same precedent by throwing on `'email'`.

#### The message — corrected at the split (Phase 2 finding B4)

The message is a **`trans_choice`** key, because the singular differs. 0024's draft proposed the
explicit-range form `{1} …|[2,*] …` **and claimed there was no `trans_choice` precedent anywhere in
`lang/`**. That claim is false: `lang/en/roles.php`'s `index.delete_blocked` has used the simple
`singular|plural` form since task 0010, there are six `trans_choice()` call sites in the codebase, and
[naming.md](../../../docs/conventions/naming.md#translation-keys) has owned the convention since then.

**Corrected a second time at Phase 2 review (finding B-2): this key matches `roles.php`'s simple form,
not `media.php`'s explicit-range form — and both already coexist in this codebase.** `lang/en/roles.php`
has three keys in the simple `singular|plural` shape (`index.delete_blocked`, `index.summary`,
`index.permission_count`); `lang/en/media.php` has two in the explicit-range shape
(`gallery.count_summary`, `gallery.selection_count`). So the real choice here was never "introduce a
second form" — it is which of the two already-established forms fits this key's own semantics:

```php
// lang/en/products.php — owned by THIS story (the file itself is 0024's)
'categories' => [
    'delete_blocked' => 'This category is used by :count product and cannot be deleted.'
        .'|This category is used by :count products and cannot be deleted.',
],
```

The simple form is sufficient here because **the count is always ≥ 1 when the message renders** — the
guard only throws when `$inUseCount > 0` — so Laravel's `count === 1 ? first : second` selection is
exactly right. The explicit-range form exists in this codebase specifically for a genuine **zero**-count
case (`media.php`'s `{0} No images|…`), which this guard never reaches by construction, so reaching for
it here would buy nothing. `:count` appears in **both** halves, matching `roles.php`.

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

[0024](0024-products-core-crud-backend.md) **reversed** its own equivalent question at the split: its
four product actions now self-authorize, because the premise that `CreateUser`/`UpdateUser` do not was
**false** (0024 **C-1**). The obvious follow-through is to do the same here, since this story is
already opening `DeleteProductCategory`. **It deliberately does not**, for two reasons:

1. **Closing one of three leaves the folder half-converted, which is worse than uniformly deferred.**
   `app/Actions/ProductCategories/` holds `CreateProductCategory`, `RenameProductCategory` and
   `DeleteProductCategory`. 0023 shipped all three unauthorized as an explicit, documented hand-off to
   **0025** — recorded as a ⚠️ in [schema.md](../../../docs/database/schema.md#product_categories) and in
   [base-standards.md](../../../docs/conventions/base-standards.md#directory-structure). Gating only the
   one this story happens to touch produces an inconsistency a reader cannot explain from the code,
   and it silently changes 0025's job from "add three gates" to "add two, and find out why".
2. **Scope.** This story exists because the original 0024 was too large. Absorbing 0023's hand-off
   would re-grow it, and the hand-off has an owner already.

**What this story does instead** is make the gap visible where it will be met: the Definition of Done
records it, and **D-B2** states the ordering constraint 0025 inherits. If Phase 2 disagrees and wants
all three gated here, that is a coherent alternative — but it should be *all three*, and it should be
recorded as absorbing 0023's hand-off rather than as a detail of this one.

> ⚠️ **A false comment in shipped code, found during the split and owned by nobody yet.**
> `app/Actions/ProductCategories/CreateProductCategory.php:35-36` reads *"matching
> `App\Actions\Users\CreateUser`/`UpdateUser`'s caller-authorizes shape"*. Those two actions **do**
> self-authorize (`CreateUser::__invoke()` line 66), so the comment asserts the opposite of the truth,
> in code rather than in a task file — where the next author reads it as licence. It is the same false
> premise that produced 0024's original RQ-10. Not this story's to fix; raised in three places so it
> cannot be missed, and a candidate for [errors-log.md](../../../docs/errors-log.md) alongside the
> 2026-08-29 entry it resembles.

### D-B2 — When 0025 adds the gate, it goes **inside `DeleteProductCategory` itself**, above the in-use guard

An ordering constraint, stated now because it is invisible from inside 0025 and expensive to get wrong.
[authorization.md](../../../docs/architecture/authorization.md#a-domain-invariant-is-not-an-authorization-rule-and-does-not-live-here)
already establishes the rule for the Sales Regions screen: **a domain invariant runs strictly *after*
authorization.** Inverting the two here would mean an actor who lacks `products.delete` entirely gets
told *"this category is used by 12 products"* — a permission refusal dressed as a business message,
which both discloses the count to someone with no right to it and hides the real reason from them.

> **Corrected at Phase 4 (audit finding F-1, blocking).** This subsection originally read *"the shipped
> call order in 0025 is: `Gate::authorize(...)` … → then `DeleteProductCategory`"*, which framed the two
> as sequential-but-separate caller-side calls — and 0025's own draft task file had already read it
> exactly that way, gating only the *component's* `deleteProductCategory()` method and leaving
> `DeleteProductCategory` itself, and its siblings `CreateProductCategory`/`RenameProductCategory`,
> permanently ungated for any future non-HTTP caller (a queued job, an Artisan command, a second
> component). That is the identical shape [errors-log.md's task 0008a entry](../../../docs/errors-log.md)
> already records as a real gap, not a hypothetical one. The correction below is not a new decision —
> it is what **D-B1** and this project's own [action-owns-the-rule convention](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
> already implied; only the ordering text was ambiguous.

So the shipped shape in 0025 is `DeleteProductCategory` **self-authorizing as its own first statement**,
the identical pattern `App\Actions\Products\DeleteProduct` already uses:

```php
public function __invoke(ProductCategory $productCategory): bool
{
    // Gate first, invariant second -- a permission refusal must never be
    // dressed as "this category is used by 12 products" (D-B2). targetId
    // is explicit (Phase 5 review finding N-3): resolveTarget() only
    // auto-resolves User/Role, so omitting it here would log target_id:
    // null, matching DeleteProduct's own call shape exactly.
    $this->logRefusedPrivilegedAttempt->authorize(
        'delete', $productCategory,
        targetType: 'product_category', targetId: $productCategory->id,
    );

    $inUseCount = $productCategory->products()->count();
    // ... unchanged from D-14
}
```

`LogRefusedPrivilegedAttempt` becomes the action's constructor-injected collaborator at that point (0024b
itself adds no such dependency — this is 0025's diff, not this story's). The component **may** also
authorize before calling the action, as a fail-fast UI layer (defence in depth, not duplication — see
[base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s
task 0017 precedent for exactly this shape), but the action is what a non-HTTP caller inherits, and it is
what makes the rule real rather than a UI convenience. The two refusals stay distinguishable by type:
**403** for the authorization one, a `ValidationException` on `productCategoryId` for the invariant.

**The invariant refusal should be logged too**, per the same page — `->log($actor,
'category_in_use', 'product_category', $category->id)` immediately after catching this action's
`ValidationException`, matching the snake_case reason strings `SetSalesRegionActive` uses. **Settled at
Phase 2 review (OQ-B1), and unaffected by the F-1 correction above: the log call belongs in 0025, not
here.** The domain-invariant check itself has no `Gate` call of its own to log through — it is not an
authorization decision (**D-14**'s own exception-type reasoning) — so there is nothing inside
`DeleteProductCategory` for that specific log line to attach to, regardless of where the *authorization*
gate lives. (Note the "no actor context" phrasing this subsection used before Phase 4 applied only to
this invariant-refusal log call, never to the action as a whole: once the gate above exists,
`DeleteProductCategory` resolves `Auth::user()` internally through `LogRefusedPrivilegedAttempt` exactly
like `DeleteProduct` does.) Every existing invariant-refusal `->log()` call site of this shape in this
codebase sits in a *component*, not an action; 0025 is where an actor and the surrounding request
context both already exist, adjacent to the `@error` binding this refusal renders into.

## Dependencies, risks and open questions

### Dependencies

- **[0024](0024-products-core-crud-backend.md) (products core CRUD backend) — hard, blocking.** The
  guard counts through `products.product_category_id`, which that story's migration creates, and every
  test here needs `Product` and `ProductFactory`. It also creates `lang/{en,es}/products.php`, which
  this story appends one key to.
- **[0023](0023-product-categories-backend.md) (product categories backend) — hard, and
  ✅ SATISFIED.** This story modifies its `DeleteProductCategory` and its `ProductCategory` model.
- **Independent of [0024a](0024a-product-description-html-sanitization.md).** They touch disjoint files
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
  most likely to change a not-found or an already-deleted case by accident — hence the four unmodified
  regression cases, which are the point of the test file rather than boilerplate.
- **R-B2 — `lang/*/products.php` is claimed by five stories** (0024 creates it; this story, 0026, 0027
  and 0028 extend it). Uncoordinated, one silently overwrites another's keys, and a missing `lang/es`
  key renders as its own raw key with no error. This is 0024's **R-13** as it lands here.
- **R-B3 — (new, Phase 5 review finding N-2) The `catch`'s `throw $e` rethrow arm for a non-1451
  `QueryException` is unexercised by any test.** The race test proves the *accept* branch (a real
  1451). Nothing in this file forces a different `errorInfo[1]` (a 1062 duplicate-key, say) through
  the same catch to prove it escapes uncaught rather than being misreported as a product count — the
  exact half the F-2 narrowing exists to protect. Recorded as a residual rather than closed here: a
  test for it would need to bind a second `deleting`/`saving` listener that raises an unrelated
  constraint violation, which is more machinery than this story's own scope warrants for one rethrow
  line already covered by Larastan's type-checking and by `CreateProduct`'s identical, already-tested
  pattern. A later story touching this file should close it rather than re-discover the gap.

### Open questions

None outstanding. **OQ-B1 — settled at Phase 2 review (2026-09-02), reasoning narrowed at Phase 4
(finding F-1): the invariant refusal's log line belongs in 0025, not here** — the domain-invariant check
has no `Gate` call of its own to log through, which is a property of *that specific check*, not of
`DeleteProductCategory` having no actor context in general (once 0025 adds the authorization gate, per
**D-B2**, the action does resolve `Auth::user()` internally, exactly like `DeleteProduct` does). See
**D-B2** for the full reasoning and the Definition of Done's hand-off bullet for what 0025 must do about
it.

Nothing else in this story is blocked on a product decision.

## Provenance

Split out of [0024](0024-products-core-crud-backend.md) on 2026-09-01, on the coordinator's explicit
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
