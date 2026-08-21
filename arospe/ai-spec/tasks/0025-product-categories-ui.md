# [0025] Product categories — management screen (list, create/edit modal, blocked delete)

## Description
Build the product category management screen: a permission-gated list of categories, a create/edit
modal carrying a single `name` field, and a delete-confirmation modal that renders the
**hard-block-with-count** refusal ("This category is used by 12 products and cannot be deleted")
when the category still has products assigned. This is the **first and only call site** of the
`ProductCategoryPolicy` and the three `app/Actions/ProductCategories/` actions that story
[0023](0023-product-categories-backend.md) shipped with zero consumers, and it is the screen the
delete guard story [0024](0024-products-core-crud-backend.md) built its `productCategoryId` error-bag
contract for.

Frontend only — no migration, no model, no action, no policy. Every domain rule this screen enforces
is consumed from 0023 and 0024 as already-shipped code.

## Type
frontend | fullstack (related_task_id: **0023** — the paired product-categories backend story) | includes database-expert: **no**

> **`related_task_id` is 0023, but the hard blocker is 0024.** 0023 is this story's FE/BE split
> partner. 0024 is a *separate* pair (its partner is 0027) that this story nonetheless **cannot ship
> without**: the delete guard, the `ProductCategory::products()` relation the count reads through,
> the `productCategoryId` error-bag key, and `lang/en|es/products.php` itself are all 0024's, not
> 0023's. Both amigos raised this independently and it is recorded as **F-1** below rather than left
> implicit in the metadata.

## Three Amigos participants

`product-owner` (lead) + `frontend-expert` (files and approach) + `frontend-qa` (test design), per
[workflow.md](../../docs/workflow.md#task-classification-rule)'s Frontend classification. Both
contributions are reflected below, including **one divergence** (D-7, the header summary line) and
**one finding neither the brief nor the story metadata had right** (F-1, the 0024 dependency).

## PRD coverage

[PRD](../../docs/PRD/PRD.md#22-products) §2.2's "Product categories (extends the prototype)" Gherkin
block — this story owns the **rendered** half of every scenario in it:

| PRD scenario | Owned here as |
| --- | --- |
| *Create a product category* | the create modal |
| *Rename a product category* | the edit modal |
| *Delete an unused product category* | the delete-confirmation modal's success path |
| *Deleting a product category still in use is hard-blocked with a count* | the delete modal's inline refusal |
| *Product categories are independent from blog categories* | a structural scope fence — see **D-9** |

Products acceptance criterion 2, the **rendered** half. The CRUD rules themselves are 0023's and the
count guard is 0024's; this story adds no rule of its own.

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Product category management screen

  Scenario: A catalog administrator views the product category catalog
    Given a catalog administrator, with the product categories "Footwear" and "Apparel"
    When they open the product category screen
    Then they see "Footwear" and "Apparel" listed

  Scenario: An empty catalog tells the administrator there is nothing yet
    Given a catalog administrator, with no product categories in the catalog
    When they open the product category screen
    Then they are told the catalog holds no product categories

  Scenario: A catalog administrator creates a product category from the screen
    Given a catalog administrator
    When they submit a new product category named "Outerwear"
    Then "Outerwear" appears in the product category list

  Scenario: Creating a product category with a name already in the catalog is refused on the screen
    Given a catalog administrator, with a product category "Footwear"
    When they submit a new product category named "Footwear"
    Then they are shown a validation message on the name field
    And the catalog still holds exactly one category named "Footwear"

  Scenario Outline: A product category with an unacceptable name is refused on the screen
    Given a catalog administrator
    When they submit a new product category with <invalid_name>
    Then they are shown a validation message on the name field
    And no category is added to the catalog

    Examples:
      | invalid_name                                                |
      | a blank name                                                |
      | a name made only of whitespace                              |
      | a name longer than the accepted maximum                     |
      | a name differing from an existing category only in case      |
      | a name differing from an existing category only in accents   |

  Scenario: A catalog administrator renames a product category from the screen
    Given a catalog administrator, with a product category "Footwear"
    When they rename it to "Running shoes"
    Then the category is shown as "Running shoes" in the list

  Scenario: Saving a product category under its own unchanged name is accepted on the screen
    Given a catalog administrator, with a product category "Footwear"
    When they save that same category with the name "Footwear" unchanged
    Then the save is accepted and the category keeps the name "Footwear"

  Scenario: A catalog administrator deletes an unused product category from the screen
    Given a catalog administrator, with a product category "Footwear" assigned to no products
    When they delete "Footwear"
    Then "Footwear" no longer appears in the product category list

  Scenario: Deleting a product category still in use is blocked on the screen with a count
    Given a catalog administrator, with the product category "Calzado" assigned to 12 products
    When they try to delete "Calzado"
    Then they are shown a message stating that 12 products use it
    And "Calzado" still appears in the product category list

  Scenario: The block names a single product in the singular on the screen
    Given a catalog administrator, with the product category "Calzado" assigned to 1 product
    When they try to delete "Calzado"
    Then they are shown a message stating that 1 product uses it

  Scenario: Draft products count towards the block shown on the screen
    Given a catalog administrator, with the product category "Calzado" assigned to 3 products, all drafts
    When they try to delete "Calzado"
    Then they are shown a message stating that 3 products use it

  Scenario: No privilege level can force a blocked deletion from the screen
    Given a signed-in Super Admin, with the product category "Calzado" assigned to 12 products
    When they try to delete "Calzado"
    Then deletion is blocked exactly as it is for any other catalog administrator

  Scenario: The screen offers no way to proceed past a blocked deletion
    Given a catalog administrator shown the blocked-deletion message for "Calzado"
    When they look for a way to delete it anyway
    Then the screen offers no confirm-and-proceed control

  Scenario: An administrator without the products permission cannot reach the screen
    Given a signed-in administrator who does not hold the products management permission
    When they try to open the product category screen
    Then access is refused

  Scenario: An administrator who may only view the catalog is offered no way to change it
    Given a signed-in administrator holding only the products view permission
    When they open the product category screen
    Then the create, edit and delete controls are shown as unavailable

  Scenario: The product category screen references no blog taxonomy
    Given a catalog administrator
    When they open the product category screen
    Then it shows only product categories, with no link or reference to any blog taxonomy
```

## Files to create/modify

**Owned by this story:**

| Path | Change |
| --- | --- |
| `app/Livewire/ProductCategories/Index.php` | **New.** Class-based component per [base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file). Composes 0023's `ProductCategoryValidationRules` trait. |
| `resources/views/livewire/product-categories.blade.php` | **New.** The **flat** path — per the [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name), `App\Livewire\ProductCategories\Index` drops `.index` and resolves here, **not** to `livewire/product-categories/index.blade.php`. |
| `routes/web.php` | **Modify.** One `Route::livewire(...)` inside the existing `auth`+`verified` group — see the snippet below. |
| `resources/views/layouts/app/sidebar.blade.php` | **Modify** — one `flux:sidebar.item`. **Branch on whether [0013](done/0013-sidebar-module-gating-ui.md) has landed** — see **D-8**, and **OQ-1** for the placement question. |
| `lang/en/products.php` + `lang/es/products.php` | **Modify** (0024 creates both). Append an `index` subgroup under the existing `categories` group — see **D-6**. Key-for-key identical. |
| `tests/Feature/ProductCategories/IndexTest.php` | **New.** Component + route-authorization tests. |
| `tests/Feature/ProductCategories/IndexRenderingTest.php` | **New.** View-level rendering tests. |
| `tests/Browser/ProductCategoriesIndexTest.php` | **New.** Pest 4 browser tests (the suite is wired up and green in CI since [0006b](done/0006b-browser-test-infra-setup.md)). |
| `tests/Unit/ArchitectureTest.php` | **Modify** — extend the existing blog-taxonomy scope fence to cover `App\Livewire\ProductCategories\*` (**D-9**). |

```php
// routes/web.php — inside the existing auth+verified group, beside users.index
// `can:products.view`, not Spatie's `permission:` — Livewire 4's PersistentMiddleware
// allowlist does not carry `permission:`, so every /livewire/update round-trip
// (save(), deleteProductCategory(), ...) would run unauthorized.
// See docs/architecture/authorization.md.
Route::livewire('product-categories', ProductCategoriesIndex::class)
    ->middleware(['can:products.view'])
    ->name('product-categories.index');
```

**Explicitly NOT touched** (consumed as already-shipped code, so the boundary is unambiguous):

| File | Owner |
| --- | --- |
| `database/migrations/*_create_product_categories_table.php` | 0023 |
| `app/Models/ProductCategory.php` — including the `products()` relation | 0023 (created), 0024 (relation) |
| `app/Actions/ProductCategories/{Create,Rename,Delete}ProductCategory.php` | 0023 (created), 0024 (delete guard) |
| `app/Concerns/ProductCategoryValidationRules.php`, `app/Policies/ProductCategoryPolicy.php` | 0023 |
| `database/factories/ProductCategoryFactory.php`, `ProductFactory.php` | 0023 / 0024 |
| `lang/*/products.php`'s `categories.delete_blocked` key itself | 0024 |
| `database/seeders/RolePermissionSeeder.php` | nobody — `products.*` is already seeded (0023 **D-8**) |
| The products list/editor screen | 0027 |

> **Sequential-implementation requirement.** This story and 0024 both write
> `lang/en|es/products.php`, and 0024 also edits `app/Actions/ProductCategories/DeleteProductCategory.php`
> that this screen calls. Their Phase 3 work must **never be dispatched in the same batch**, per the
> [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule):
> 0023, then 0024, must each be fully closed before 0025 starts.

### Interface contract consumed from 0023 and 0024

```php
// From 0023 — all present, all with zero call sites until this story
App\Models\ProductCategory                                     // HasUuids, #[Fillable(['name'])], no SoftDeletes
App\Concerns\ProductCategoryValidationRules::productCategoryRules(?string $productCategoryId = null)
App\Actions\ProductCategories\CreateProductCategory::__invoke(string $name): ProductCategory
App\Actions\ProductCategories\RenameProductCategory::__invoke(ProductCategory $c, string $name): ProductCategory
App\Actions\ProductCategories\DeleteProductCategory::__invoke(ProductCategory $c): bool
App\Policies\ProductCategoryPolicy                             // viewAny/create/update/delete
                                                               //   -> products.view/create/edit/delete

// From 0024
ProductCategory::products(): HasMany                           // what the guard counts through
DeleteProductCategory                                          // now throws ValidationException::withMessages([
                                                               //   'productCategoryId' => trans_choice(
                                                               //       'products.categories.delete_blocked', $count,
                                                               //       ['count' => $count])])
lang/en|es/products.php                                        // created by 0024, with categories.delete_blocked
```

**Two obligations this story inherits verbatim from 0023's Definition of Done**, both non-negotiable:

1. **The actions do not self-authorize.** `Gate::authorize()` is the first statement of every method
   that mutates. This story is where `ProductCategoryPolicy` stops being a zero-call-site policy.
2. **The id fed to `Rule::unique()->ignore()` must be server-authoritative** — `#[Locked]`, and
   assigned from a value read back out of the database, never from the method argument. See
   [security/livewire-authorization.md](../../docs/security/livewire-authorization.md#locked-is-what-makes-ruleunique-ignore-safe-here).

### Component public surface

```php
namespace App\Livewire\ProductCategories;

#[Title('Product categories')]
class Index extends Component
{
    use ProductCategoryValidationRules;

    /** @var array<int, array{id: string, name: string, productCount: int, canEdit: bool, canDelete: bool}> */
    public array $productCategories = [];   // deliberately unlocked — see the traps below

    #[Locked] public ?string $editingCategoryId = null;   // written only from $target->id
    public bool $showModal = false;
    public string $name = '';                             // the only form field; never ?string

    public bool $showDeleteModal = false;
    #[Locked] public ?string $deletingCategoryId = null;
    #[Locked] public string $deletingCategoryName = '';

    public function mount(): void;                                  // Gate::authorize('viewAny', ProductCategory::class)
    public function openCreateModal(): void;
    public function openEditModal(string $categoryId): void;        // findOrFail, then assign $target->id
    public function save(CreateProductCategory $c, RenameProductCategory $r): void;
    public function closeModal(): void;
    public function confirmDelete(string $categoryId): void;
    public function deleteProductCategory(DeleteProductCategory $d): void;   // no try/catch — see D-2
    public function closeDeleteModal(): void;                       // also resetErrorBag('productCategoryId')
}
```

`loadProductCategories()` is private and builds the row array with
`ProductCategory::query()->withCount('products')->orderBy('name')->orderBy('id')`, mapping
`canEdit`/`canDelete` from `Gate::allows('update'|'delete', $category)` — the *same* policy methods
`save()`/`deleteProductCategory()` authorize against, so the disabled state cannot drift from what a
click would actually do ([authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)).

### Four runtime traps the markup must not fall into

Three are already paid for in [errors-log.md](../../docs/errors-log.md); the fourth is this screen's own.

1. **`@js()` is mandatory** on `wire:click="openEditModal(@js($category['id']))"` and
   `wire:click="confirmDelete(@js($category['id']))"`. A value interpolated into a `wire:*` attribute
   lands in a JavaScript evaluator, where Blade's HTML escaping is undone by the parser
   ([blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md)). The id
   being a UUIDv7 does not exempt it — the rule is unconditional.
2. **A disabled row action is a separate `@if`/`@else` branch wrapped in a hand-written
   `<flux:tooltip>`** — never `:tooltip="$cond ? … : null"`, which under `livewire/blaze` renders an
   empty tooltip bubble on every *enabled* row.
3. **`cursor-not-allowed!` belongs on that `flux:tooltip` wrapper, not on the button** — Flux's own
   `disabled:pointer-events-none` takes the disabled button out of hit-testing entirely.
4. **The `null`-property/native-`<select>` trap does NOT apply here** — recorded so nobody
   "defensively" applies it. This modal has a single text `name` field and **no `<select>` anywhere**,
   so there is no `selectedIndex` state to desync. `public string $name = ''` is still the right
   declaration (never `?string`), for the ordinary reason that a bound property should carry an empty
   value in the type the DOM expects.

## Tests to perform

Levels chosen per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md) — browser tests
only where real-DOM/Livewire round-trip behaviour is the actual risk, everything else at the cheaper
component level. **The deliberate calibration in this plan is that it does not re-run 0023's suite one
layer up**: 0023 already proves the normalisation, trimming and boundary rules exhaustively at the
action layer, so this story asserts only that the **component routes into the same shared rule** rather
than reimplementing its own.

**Feature — `tests/Feature/ProductCategories/IndexTest.php`** (mirrors `tests/Feature/Users/IndexTest.php`'s two-part shape)

*Listing*
- [ ] The list is ordered by name. Create out of order, assert alphabetical. *Why it can fail:* nothing
      in the schema enforces order (0023 **D-6** has no `sort_order`); only the query does, silently.
- [ ] Each row exposes exactly `{id, name, productCount, canEdit, canDelete}` — locks the view contract
      so a renamed or dropped key breaks here rather than silently in the Blade.

*Create*
- [ ] A valid name persists exactly one row and the modal closes.
- [ ] Blank and whitespace-only names produce `assertHasErrors(['name'])` and add zero rows. *Why:*
      proves `save()` routes through the shared trait rather than validating the raw `wire:model` value
      (0023 **R-6**, one layer up).
- [ ] A duplicate name (exact case) produces `assertHasErrors(['name'])`.
- [ ] **One canary each** for a case-only and an accent-only duplicate — not the full matrix. *Why this
      is not redundant with 0023:* a Livewire form built independently could easily validate with a bare
      `Rule::unique()` that misses **D-4**'s normalised comparison entirely; this is the only test that
      would catch that.
- [ ] **One** length-boundary canary (max accepted, max+1 refused), derived from the same constant 0023
      uses.

*Rename*
- [ ] Renaming to a free name updates the row.
- [ ] Saving under the category's **own unchanged name** is accepted (0023 **R-1**'s canary).
- [ ] **The `->ignore()` id is server-authoritative.** Attempt to retarget the edit by setting the
      locked property from the client (`->call('openEditModal', $a->id)->set('editingCategoryId', $b->id)`)
      and assert it **throws**, not that it silently retargets `$b`. *Why it earns its own test:* this is
      the exact vulnerability class 0023's hand-off note and
      [livewire-authorization.md](../../docs/security/livewire-authorization.md) name, and nothing else
      in the plan proves it.

*Delete — unused*
- [ ] Deleting an unused category removes the row and it disappears from the reloaded list.

*Delete — blocked (requires 0024)*
- [ ] Deleting a category with N products surfaces an error on the **`productCategoryId`** key (0024
      **D-14**'s hand-off contract) **and** the category still exists afterwards. A guard that threw
      *after* deleting would pass a throw-only test.
- [ ] **The count is correct** — dataset over N = 1, 2, 12, asserting the literal digits, **with a decoy
      of products in a *different* category in every case** (0024's explicit guidance). Without the
      decoy, a global `Product::count()` and a scoped count are indistinguishable and the test cannot
      fail for the reason it exists. Never re-invoke `trans_choice()` with the same arguments — that is a
      tautology.
- [ ] Singular (N=1) and plural (N≥2) forms differ.
- [ ] **Draft products count too**: a category with 3 all-draft products is blocked, message says 3. The
      likeliest implementation bug is a stray status filter.
- [ ] **A Super Admin is refused identically.** *The single most important test in this story* — it is
      what proves the block is a data-integrity rule and not an authorization one. If the guard were
      ever routed through `Gate`, a Super Admin could force-delete and orphan 12 products.
- [ ] Calling delete twice in succession on the same in-use category is refused both times — no
      "confirmed" state accumulates.

*Authorization*
- [ ] `viewAny` / `create` / `update` / `delete` each get **both an allow and a deny** test at **two
      layers**: the route (`$this->get(route('product-categories.index'))->assertOk()`/`assertForbidden()`)
      **and** the component (`Livewire::test()` mounting directly, and calling `save()` /
      `deleteProductCategory()` throwing `AuthorizationException` for a denied actor). These are
      genuinely not substitutes — [testing/README.md](../../docs/testing/README.md) — because the route
      test never exercises the component's own `Gate::authorize()`, and `/livewire/update` never runs
      most route middleware.
- [ ] A Super Admin holding zero permission rows passes `viewAny`/`create`/`update` via `Gate::before`.
- [ ] **One** global-state test that an actor holding only `products.view` sees every action disabled.
      *Deliberately not a Users-shaped per-row matrix* — see **D-5**.

*Malformed / unknown ids*
- [ ] `openEditModal()` and `confirmDelete()` with an unknown or malformed UUID fail cleanly
      (`ModelNotFoundException`), not as a silent no-op.

**Feature — `tests/Feature/ProductCategories/IndexRenderingTest.php`**
- [ ] The list renders each category's name and its product count.
- [ ] The empty state renders when the catalog holds no categories.
- [ ] The create/edit modal contains exactly one input and **no `<select>` markup** — a cheap guard
      against a stray element copy-pasted in from the Users view.
- [ ] **The blocked-delete message renders in the DOM** with the correct digit, singular and plural. A
      test asserting only `assertHasErrors()` never proves the human actually sees the sentence.
- [ ] Validation messages appear next to the name field and the modal stays open.

**Browser — `tests/Browser/ProductCategoriesIndexTest.php`**
- [ ] Opening the create form shows a blank field (no stale prefill leaking from a previous edit).
- [ ] Creating a category through a real `fill()` + `click('Save')` round-trip: the new name appears in
      the list, with no JS errors. **This is the one test that proves `wire:model` actually delivers the
      typed value** — `Livewire::test()->set()` writes the property directly and never touches the DOM.
- [ ] Editing prefills the name; re-saving it unchanged preserves it.
- [ ] Cancelling the create form adds nothing.
- [ ] Deleting an unused category through the confirmation modal removes it from the list.
- [ ] **Deleting a category that is in use**: the blocked message renders inline where a real user would
      see it, the category is still listed, no JS errors. ***The highest-value browser test in this
      story*** — only a real DOM render proves the confirmation UI does not *look* like it succeeded
      (closing, removing the row) while the delete was actually refused server-side. That is precisely
      the outcome this story exists to deliver.
- [ ] Creating a duplicate name through the real form shows the inline error — proves the `@error`
      binding works in a browser, not merely in the component's error bag.
- [ ] One continuous smoke pass (open create → cancel → open edit → cancel → attempt delete → cancel)
      asserting `assertNoJavaScriptErrors()` after every step.

**Unit — `tests/Unit/ArchitectureTest.php` (extend)**
- [ ] `App\Livewire\ProductCategories\*` references no blog-taxonomy namespace — written as **one
      `expect()` per namespace, never `expect([...])`**, which is disjunctive (this repo has already
      shipped one vacuous arch rule that way; the file carries the comment recording it).

**Explicitly not tested here**, per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md):
- The full case/accent normalisation matrix and the full length-boundary pair — 0023's own suite proves
  these exhaustively at the action layer. Only the canaries above belong here.
- The FK `restrictOnDelete` backstop and the `ProductCategory::deleting`-hook race simulation — 0024
  owns and tests both at the action layer. This story only confirms the same `productCategoryId` key
  surfaces through the UI.
- `trans_choice`'s own pluralisation engine, `HasUuids`, Eloquent timestamps, `Rule::unique`'s SQL —
  vendor behaviour.
- The reassign-away race (0024 **R-14**) — it needs genuine concurrency against an open
  `RefreshDatabase` transaction and is untestable at this layer. 0024 already records fail-closed as
  the accepted behaviour.
- The reflection-based "`__invoke()` takes no `bool $force`" proof — 0024 itself records this as the
  knowingly weaker form. The Super-Admin-refused-identically test is the strong one; do not duplicate
  the weak one here.
- Visual/pixel regression — nothing in this story carries a stated visual-correctness requirement.

## Expected outcome

An administrator holding `products.view` reaches a **Product categories** screen from the sidebar and
sees every category listed alphabetically with the number of products using it. Holding
`products.create` / `products.edit`, they create and rename categories through a single-field modal,
with blank, whitespace-only, over-length and duplicate names (including case- and accent-only
duplicates) each refused inline on the name field. Holding `products.delete`, they delete an unused
category from a confirmation modal.

Attempting to delete a category that any product still references — draft products included — leaves
the confirmation modal open with an inline message naming the exact count ("This category is used by 12
products and cannot be deleted"), the category still in the list, and **no control anywhere on the
screen that would proceed anyway**. That refusal is identical for a Super Admin, because it is a
data-integrity rule and not an authorization one.

An administrator without the relevant permission is refused at the route and again inside the
component. Nothing on the screen references, links to, or shares anything with a blog taxonomy.

## Acceptance criteria

- [ ] `/product-categories` is registered as `product-categories.index`, gated **`can:products.view`**
      (never `permission:`), inside the existing `auth`+`verified` group.
- [ ] The screen is reachable from the sidebar, and the gating status of that link is recorded (see
      **D-8**).
- [ ] The list renders every category ordered by name, with its product count, an empty state when the
      catalog is empty, and icon-only row actions carrying `aria-label` plus
      `data-test="edit-product-category-{id}"` / `data-test="delete-product-category-{id}"` hooks
      **present on both the enabled and the disabled branch**.
- [ ] A category can be created and renamed through a modal whose only field is `name`; blank,
      whitespace-only, over-length, duplicate, case-only-duplicate and accent-only-duplicate names are
      each refused with a message on the `name` field and add no row.
- [ ] Saving a category under its own unchanged name is accepted.
- [ ] An unused category can be deleted from a confirmation modal naming the target.
- [ ] **Deleting a category assigned to N products is blocked with an inline message stating N**, the
      modal stays open, the category survives, drafts count towards N, the singular and plural forms
      differ, and the refusal is identical at every privilege level including Super Admin.
- [ ] **No confirm-and-proceed / force-delete control exists anywhere on the screen.**
- [ ] `Gate::authorize()` is the first statement of every mutating method, and the id fed to
      `Rule::unique()->ignore()` is `#[Locked]` and read back out of the database.
- [ ] Per-row `canEdit` / `canDelete` come from the same `ProductCategoryPolicy` methods the mutating
      methods authorize against, and the product count is **never** used to disable the delete action
      (**D-3**).
- [ ] Every user-facing string is a translation key or a bare `__()` call per **D-6**; `lang/en/products.php`
      and `lang/es/products.php` stay key-for-key identical.
- [ ] No model, migration, action, policy, factory, seeder or permission-catalog change is made.
- [ ] Nothing on the screen references any blog taxonomy.

## Definition of Done

- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md#full-test-suite-gate-rule)'s Full Test Suite Gate Rule.
- [ ] `vendor/bin/pint --dirty --format agent` clean and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Point the audit specifically at: the `#[Locked]` +
      server-read id pair behind `Rule::unique()->ignore()`, that every mutating method gates before it
      acts, and that `$productCategories` being unlocked is safe because no method reads it for a
      decision (**D-4**).
- [ ] Documentation updated (docs-keeper): [api/routes.md](../../docs/api/routes.md) gains a
      `product-categories.index` section describing what the view renders, its `data-test` hooks and the
      sidebar link's gating status; [architecture/authorization.md](../../docs/architecture/authorization.md)
      records that `ProductCategoryPolicy` now has its first call site.
- [ ] **0023's and 0024's hand-off items are discharged and marked as such** in both of those task
      files: 0023's "the policy has zero call sites" (**R-3**) and 0024's `productCategoryId` error-bag
      contract are both closed by this story.
- [ ] Acceptance criteria met.

## Documented functional decisions

- **D-1 — This story owns the whole client surface: component, route, view, sidebar entry and copy.**
  This is *not* the 0038→0039 relationship, where the backend story shipped the Livewire component and
  the UI story only replaced its view. 0023's **D-1** and its scope fences are explicit that it ships
  **no** Livewire component, route or Blade view at all, so there is nothing here to extend — 0025
  creates all of it. The closest precedent is therefore 0004→0006 inverted: the component class is this
  story's, and it consumes 0023's actions/policy exactly as `App\Livewire\Users\Index` consumes
  `app/Actions/Users/*`.
- **D-2 — The blocked-delete message renders inline in the still-open delete modal, and
  `deleteProductCategory()` does not catch the exception.** Both amigos converged here independently.
  0024 **D-14** chose `ValidationException` *specifically* because it is "the one exception Livewire
  already routes into the component's error bag with no plumbing at the call site" — so catching it
  would defeat the reason it was chosen. The throw aborts the method before `closeDeleteModal()` runs,
  which is what keeps the modal open by construction rather than by an explicit flag. The view binds
  `@error('productCategoryId')` to a `<flux:callout variant="danger">`, following the real precedent
  already in this repo for a non-field error key (`resources/views/livewire/settings/security.blade.php`'s
  `@error('setupData')` block). `closeDeleteModal()` must also `resetErrorBag('productCategoryId')`, or a
  stale block message leaks into the next delete attempt.
  *Rejected:* a toast. There is **no precedent anywhere in this repo for a toast raised from application
  code** — `@persist('toast')` in the sidebar only mounts the container, and nothing calls `Flux::toast()`
  from a Livewire method. Introducing that pattern for one screen is unjustified, and a toast that
  appears *after* the modal closes reads as "deleted" for the moment it takes to read it.
- **D-3 — The product count is shown as an informational column but is NEVER used to disable the delete
  action.** This is the sharpest design point in the story. Pre-disabling delete on `productCount > 0`
  would visually conflate the in-use refusal with the `canEdit`/`canDelete` **authorization** UI-hint
  pattern, which exists precisely to mirror what a `Gate::authorize()` call would do. 0024 **D-14** is
  explicit that this refusal is *not* an authorization denial ("the actor holds `products.delete` and the
  answer is still no") and that the guard must **not** go in the policy. Letting the user attempt the
  delete and read the count in the modal is also the only path that satisfies the PRD's own wording,
  which requires the *message* to state the count. The count column is what makes that outcome
  predictable rather than surprising.
- **D-4 — `$productCategories` is deliberately unlocked; every id-carrying property is `#[Locked]`.**
  Same rationale [blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md)
  records for `$users`: every method that mutates re-reads its target with `findOrFail()` and
  re-authorizes, so nothing reads the array for a decision — only for display. **Improve on the
  precedent by stating that in the property's docblock**, which `Users\Index` does not (it is explained
  only in the security doc).
- **D-5 — Per-row `Gate::allows()` is kept for consistency, but the per-row *test* matrix is not.** A
  real difference from Users, worth stating so a reviewer does not read it as under-testing:
  `UserPolicy::update()`/`delete()` vary per target row (a Super-Admin-holding or trashed target changes
  the answer), whereas `ProductCategoryPolicy`'s abilities gate purely on the actor's module permission,
  so **every row answers identically for a given actor**. Per-row computation stays (negligible cost,
  consistent with the established pattern, and it survives the day a per-instance rule does appear), but
  one global-state test replaces the Users-shaped matrix, which here would be padding rather than
  coverage.
  *Rejected:* a single class-level `Gate::allows('update', ProductCategory::class)` computed once —
  Laravel's policy dispatch for an ability whose signature type-hints a model instance cannot be
  satisfied by a bare class-string.
- **D-6 — Copy extends `lang/*/products.php`; no new `product-categories.php` domain file.** 0024 already
  creates both locale files with the `categories` group, and its own file-ownership note warns about a
  second story colliding on creation. 0025 appends a `categories.index` subgroup (`summary`,
  `action_not_allowed`). Everything else follows the *actual* precedent in `users.blade.php`, which uses
  bare un-namespaced `__()` for one-off labels (`__('Cancel')`, `__('Save')`) and reserves domain keys for
  strings reused across render sites or genuinely cross-cutting. **Do not reach across into
  `users.index.action_not_allowed`** — a duplicated English string in its own domain file is correct per
  [naming.md](../../docs/conventions/naming.md#translation-keys)'s one-file-per-domain rule.
- **D-7 — No header summary line.** *(Recorded divergence.)* `frontend-expert` proposed a
  `categories.index.summary` key mirroring the Users screen's ":total users · :active active" header;
  `frontend-qa` recommended omitting it as UI no requirement asks for. **The decision went to QA**:
  nothing in the PRD or the story brief calls for a count header, the categories screen has no second
  dimension to summarise (Users has *active*; categories have nothing analogous), and the per-row product
  count already carries the only number that matters here. Raised as **OQ-2** in case the product owner
  wants Users parity anyway; if it is added, the `summary` key comes back with it.
- **D-8 — Sidebar entry branches on whether [0013](done/0013-sidebar-module-gating-ui.md) has landed**, exactly
  as [0039](0039-payment-methods-ui.md) already specifies for itself:
  - *If 0013 has **not** landed (expected):* add one
    `<flux:sidebar.item icon="tag" :href="route('product-categories.index')" :current="request()->routeIs('product-categories.*')" wire:navigate>`
    to `resources/views/layouts/app/sidebar.blade.php`, with a comment noting it is scaffolding 0013's
    registry will absorb. Static and **ungated**, exactly like the Users link — a **cosmetic** leak only;
    access is refused by `can:products.view` on the route and re-checked in `mount()`, precisely as
    [api/routes.md](../../docs/api/routes.md#usersindex--the-first-permission-gated-route) already
    documents. The caveat must be recorded in the docs pass.
  - *If 0013 **has** landed:* add a `config/modules.php` entry keyed on `products.view` instead, and **do
    not touch `sidebar.blade.php`**, which 0013 replaces.
  The *placement* within the nav is **OQ-1**.
- **D-9 — Independence from the blog taxonomy is a structural scope fence, not a behavioural test.**
  Honest and unchanged from 0023 **D-11**: with no blog taxonomy anywhere in code, "the screen shows no
  blog categories" cannot fail today. It is honoured by construction (own route, own component, own
  permission, own model) and pinned two thin ways — the `arch()` assertion above, and one
  `assertDontSee('blog')` scoped to **the component's own `->html()`**, never the full page, since the
  shared sidebar may legitimately gain a "Blog" entry once Epic 4 lands and that has nothing to do with
  this screen. Write no more than those two; anything heavier tests an absence that has no way to be
  violated yet.
- **D-10 — No pagination, no search, ordered `name ASC, id ASC`.** Matches `Users\Index::loadUsers()`
  exactly (which is also unpaginated), and a product-category catalog is a smaller lookup table than
  `users`. The `id` tiebreak costs nothing and is a meaningful creation-order tiebreak given UUIDv7, even
  though 0023 **D-4**'s normalised uniqueness makes exact name collisions structurally impossible.

### Scope fences: what this story must NOT do

- No migration, model, action, policy, factory, seeder, enum or validation trait — all consumed from
  0023/0024 as shipped.
- No confirm-and-proceed, force-delete, or bulk-delete control of any kind. 0024 **D-14** makes this
  architecturally impossible server-side (`__invoke()` takes no `force` flag); the UI must not invent a
  client-side equivalent.
- No reassign-products-then-delete flow. The PRD requires the administrator to reassign first, from the
  products screen (0027) — this screen only refuses and states the count.
- No inline create-category-on-the-fly affordance inside a product editor (0027).
- No product-count breakdown beyond the flat integer (no "3 active, 2 draft" split) — that is 0027's.
- No new permission slug and no `RolePermissionSeeder` change.
- No pagination, search, sort picker, drag-ordering, slug, description or i18n scaffolding.

## Dependencies, findings, risks and open questions

### Findings

- **F-1 — This story's hard blocker is 0024, not only 0023, and both amigos raised it independently.**
  The story brief and the `related_task_id` metadata name 0023. But the delete-guard behaviour that is
  *half this story's stated scope* comes entirely from 0024: `ProductCategory::products()`, the count
  guard inside `DeleteProductCategory`, the `productCategoryId` error-bag key, and
  `lang/en|es/products.php` itself. **Every blocked-delete test in the plan above is unwritable until
  0024 ships**, since `Product` and `ProductFactory` do not exist before it. Recorded here rather than
  silently corrected in the metadata, because `related_task_id` correctly identifies the FE/BE *pair*
  (0023) while 0024 is a hard dependency from a different pair.
- **F-2 — Neither dependency exists in code yet.** Verified during the debate: there is no
  `app/Models/ProductCategory.php`, no `app/Actions/ProductCategories/`, and no `product_categories` or
  `products` migration. This story's entire interface contract is *documented*, not *shipped*.

### Dependencies

- **[0023](0023-product-categories-backend.md) — hard, blocking.** The model, actions, validation trait
  and policy this screen calls. **Not yet implemented (F-2).**
- **[0024](0024-products-core-crud-backend.md) — hard, blocking (F-1).** The delete guard, the `products()`
  relation, the error-bag key and the `lang/*/products.php` files. **Not yet implemented (F-2).**
- Sequencing, enforced strictly: **0023 → 0024 → 0025**, each fully closed before the next starts, per
  [workflow.md](../../docs/workflow.md#task-ordering-rule) and the Parallel Agent File-Ownership note
  above.
- Depends on already-shipped work: the seeded `products.*` permissions (0002), the `Gate::before` Super
  Admin bypass, policy auto-discovery (0004), the Users screen's list+modal pattern (0006), and the
  wired-up browser suite (0006b).
- Optional interaction: **[0013](done/0013-sidebar-module-gating-ui.md)** changes *which file* the sidebar
  entry goes in (**D-8**), but does not block this story either way.

### Risks

- **R-1 — CI cannot open a database connection at all.** 0024's **V-1** verified this against the repo:
  `phpunit.xml` pins `DB_DATABASE` but never `DB_CONNECTION`, `.env.example` sets `sqlite` with no file
  created, and the workflow provides no MySQL service. Every test in this plan is therefore a promise
  about what runs **locally** until that is fixed. Not this story's bug; 0024 already recommends it as
  its own task, and it should be resolved before this story's Full Test Suite Gate is relied on.
- **R-2 — Building this screen before 0024 lands.** If implementation starts early, every blocked-delete
  test must be *deferred with the reason recorded*, never silently skipped — the delete block is the
  story's headline requirement, and a story that ships its list and modal while quietly dropping its
  hardest scenario would pass a filtered test run.
- **R-3 — The `->ignore()` id becoming client-controlled.** Dropping `#[Locked]`, or assigning
  `$this->editingCategoryId = $categoryId` (the raw argument) instead of `$target->id`, silently turns a
  uniqueness check into a rename-any-category primitive. The two lines are a pair; the dedicated
  retarget test above is what pins them.
- **R-4 — `trans_choice` has no precedent anywhere in `lang/`** (0024 **R-8**). Spanish pluralisation is
  not identical to English. Assert the resolved **digit in the rendered DOM**, never a hand-typed
  sentence, or the test silently desyncs from the real copy.
- **R-5 — Modelling the tests too literally on the Users screen.** Two specific over-reaches to avoid: the
  per-row authorization matrix (**D-5**) and re-running 0023's normalisation suite one layer up. Both
  inflate the count without adding coverage, which
  [coverage-review-checklist.md](../../docs/testing/qa/coverage-review-checklist.md) treats as a finding.
- **R-6 — A stale `productCategoryId` error leaking between delete attempts.** The blocked message lives
  in the error bag, not in a reset property, so `closeDeleteModal()` must clear it explicitly (**D-2**).
  A user who is blocked on "Calzado", cancels, then opens the modal for an unused category would
  otherwise see the old refusal.
- **R-7 — The three Flux/Blaze/`@js()` traps** recur verbatim on this screen's row actions. All three are
  already in [errors-log.md](../../docs/errors-log.md) with their verification method; re-deriving them
  costs a Phase 5 round.

### Open questions

Four, all genuine, none blocking Phase 2 on their own — but **OQ-1 changes a file path** and should be
answered before Phase 3.

- **OQ-1 — Where does the sidebar entry go?**
  (a) A flat `flux:sidebar.item` in the existing "Platform" group, beside Users **_(recommended)_** — it
  is the only precedent this repo has, it is the lowest-churn option, and the information-architecture
  question has no real siblings to organise around until 0027 (Products) and 0026 (Sales Regions) ship,
  at which point restructuring is cheap.
  (b) A new "Catalog" `flux:sidebar.group` created now, anticipating those siblings — correct
  eventually, but it means designing a nav taxonomy around one entry.
  (c) No sidebar link at all, reached only from the Products screen — rejected as a recommendation
  because 0027 does not exist yet, so the screen would be unreachable except by typing the URL.

- **OQ-2 — Does the screen carry a Users-style header summary line?** The two amigos diverged (**D-7**).
  (a) No summary line **_(recommended)_** — nothing in the PRD or the brief asks for one, and unlike
  Users there is no second dimension to summarise. (b) Add `:total product categories` for visual parity
  with the Users screen. Choosing (b) reinstates the `categories.index.summary` key and one rendering
  test.

- **OQ-3 — Is the per-category product count column wanted at all?** **D-3** specifies it (shown, but
  never used to disable delete), which both amigos supported.
  (a) Show the count **_(recommended)_** — it is nearly free (`withCount`, served by the FK's own index),
  and it turns the delete block from a surprise into something the administrator could see coming, which
  matters because the PRD's remedy is "reassign those products first".
  (b) Omit it and let the modal be the only place a count appears — strictly closer to the PRD's literal
  wording, and a smaller screen.
  Flagged because it is a product-visible addition the PRD does not request, not because the debate was
  split.

- **OQ-4 — Should `openEditModal()` and `confirmDelete()` gate as well?**
  [livewire-authorization.md](../../docs/security/livewire-authorization.md) states the rule as "every
  method that mutates **or discloses**", but the real `App\Livewire\Users\Index` gates only `save()` and
  `deleteUser()` — apparently because those two openers disclose nothing beyond what `mount()` already
  sent every `viewAny` holder.
  (a) Follow the shipped Users precedent **_(recommended)_** — the same reasoning holds exactly here (a
  row's `name` is already client-visible regardless of `canEdit`), and diverging would create a second
  idiom for the same question.
  (b) Gate them anyway as defence in depth.
  Either way, this deserves an explicit **Phase 2 sign-off** on whether (a) is the sanctioned reading of
  the rule or a latent gap in the existing code that should not be replicated — the answer applies to
  every future list screen, not just this one.

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-18 with `frontend-expert` (files and approach) and
`frontend-qa` (test design), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Classified **Frontend** under the
[task classification rule](../../docs/workflow.md#task-classification-rule), so no `backend-expert` or
`database-expert` was convened — this story adds no backend or schema artifact. Derived from
[PRD](../../docs/PRD/PRD.md#22-products) §2.2's "Product categories (extends the prototype)" Gherkin
block and Products acceptance criterion 2, grounded in full readings of
[0023](0023-product-categories-backend.md) and [0024](0024-products-core-crud-backend.md), with
[0006](done/0006-users-list-editor-ui.md) / `App\Livewire\Users\Index` as the list+modal pattern and
[0039](0039-payment-methods-ui.md) as the precedent for a UI story's sidebar branching.

Both amigos' contributions are reflected above, including **one recorded divergence** (**D-7**, whether
the screen carries a header summary line — decided for QA's position, and re-raised as **OQ-2** so the
product owner can overrule it) and **one finding neither the brief nor the story metadata had right**,
raised independently by both: **F-1**, that the hard blocker is 0024 and not only 0023, because the
delete guard, the `products()` relation, the `productCategoryId` error key and `lang/*/products.php` are
all 0024's.

Two things this debate deliberately did *not* re-litigate, both settled upstream and recorded here so a
later reader does not reopen them: that the in-use refusal is a `ValidationException` rather than a
policy denial (0024 **D-14**, with its acknowledged counter-argument already recorded there), and that
there is no confirm-and-proceed path at any privilege level (PRD §2.2, stated twice, plus two
independent structural reasons in 0024 **D-14**).

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Three items deserve an explicit look there
rather than at implementation time. **Independence** is the fair challenge — F-1 means this story is
gated behind two unshipped backend stories, so INVEST's "Independent" holds only in the sequencing sense.
**OQ-4** is a project-wide authorization-convention question this story merely surfaces, and answering it
here sets the precedent for every future list screen. And **OQ-1** should be closed before Phase 3, since
it decides which file the navigation change lands in.
