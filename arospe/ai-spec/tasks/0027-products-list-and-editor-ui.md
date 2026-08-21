# [0027] Products — list screen and product editor (UI)

## Description
Build the two screens the whole of Epic 2's product work has been feeding: a **products list**
(thumbnail, name + SKU, price, colour-coded stock, a status badge that reads *Agotado* at zero stock,
per-row edit/delete actions and a primary "Nuevo producto" button) and a **routed product editor**
(name, SKU, category select, the required physical/virtual type control, the WYSIWYG description from
[0021](0021-wysiwyg-rich-text-editor-component.md), a featured image and a gallery strip through
[0020](0020-shared-media-gallery-modal-ui.md), and a searchable Sales Region multi-select from
[0026](0026-product-sales-region-assignment-and-tax-resolution-backend.md) built on
[0022](0022-searchable-multi-select-component.md)).

It is **frontend only**: no migration, no model, no action, no policy, no enum, no validation rule.
Every one of those is consumed as already-shipped code from [0024](0024-products-core-crud-backend.md)
(core CRUD), [0026](0026-product-sales-region-assignment-and-tax-resolution-backend.md) (region
assignment) and [0023](0023-product-categories-backend.md) (the category taxonomy). This story is
where four separate stories' zero-call-site deliverables — `ProductPolicy`, `CreateProduct` /
`UpdateProduct` / `DeleteProduct` / `SyncProductGallery`, `SyncProductSalesRegions` /
`SearchSalesRegions`, and the two shared UI components — finally acquire a caller.

> **Scope note — the grouping concept is gone.** The supranational Sales Region *grouping* entries
> (Unión Europea, Internacional) were removed project-wide on 2026-08-18 (see
> [0016](done/0016-sales-region-catalog-schema-and-seeder.md)'s scope-change amendment and
> [0026 D10](0026-product-sales-region-assignment-and-tax-resolution-backend.md)). The region picker
> on this screen therefore shows **only individual countries and Spain's fiscal sub-territories**, as
> a flat list with no group headings, and nothing on this screen expands, infers or implies
> membership of any kind.

> **Scope note — variants are not on this screen.** Product variants (0028/0029) get their own
> builder in story **0031**. This editor ships the product-level `price` / `stock` fields exactly as
> [0024](0024-products-core-crud-backend.md) defines them. See
> [OQ-9](#open-questions) for the one forward dependency (0029's OQ-3) that could change that later.

## Type
frontend | fullstack (related_task_id: **0024** — products core CRUD backend, whose paired UI this is)
| includes database-expert: **no**

No schema change, no migration, no index decision, no new query shape beyond an explicit-column
`select()` and two eager loads over tables 0024 and 0026 already designed. `database-expert` is
therefore not convened, matching [0025](0025-product-categories-ui.md)'s precedent for the sibling
category screen.

**Hard dependency chain, and it is longer than `related_task_id` suggests.** This story cannot start
until **0019 → 0020 → 0021 → 0022 → 0023 → 0024 → 0026** are all closed. `related_task_id` correctly
names the FE/BE pair (0024); the other six are hard blockers from different pairs, exactly the
situation [0025](0025-product-categories-ui.md)'s **F-1** records for itself.

## Three Amigos participants

`product-owner` (lead) + `frontend-expert` (files and approach) + `frontend-qa` (test design), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate)'s
[task classification rule](../../docs/workflow.md#task-classification-rule).

Both specialists contributed in full, grounded in real reads of every dependency file. The
coordinator then **re-read every dependency on disk after 0022 and 0026 were amended on 2026-08-18**
and reconciled the two contributions against the amended contracts. That reconciliation
**overrode three of the specialists' conclusions and produced four findings neither raised** — all
recorded below with the reasoning, in **D-9**, **D-10**, **D-11**, **D-12**, **D-14** and **D-17**.
See [Provenance](#provenance) for exactly which role covered what.

> **Amended 2026-08-19 — three of those findings came back answered.** The two blocking open questions
> this story raised against its dependencies (**OQ-5** / **D-11** and **OQ-6** / **D-9a**) and the
> transaction-boundary gap (**D-12b**) were carried upstream and settled by amendments to
> [0026](0026-product-sales-region-assignment-and-tax-resolution-backend.md) (**D12**, **D13**, **D14**)
> and [0024](0024-products-core-crud-backend.md) (**D-17**). All three are now **resolved with concrete
> mechanisms**, recorded in **D-18** and folded into the decisions, tests and acceptance criteria they
> touch. Nothing about them blocks Phase 3 any more.

## PRD coverage

Derived from [PRD §2.2 Products](../../docs/PRD/PRD.md#22-products) and the
[Design reference](../../docs/PRD/PRD.md#design-reference--the-dashboard-shell) section. This story
is the **screen half** of scenarios whose data half other stories already own:

| PRD scenario / criterion | Owned here |
| --- | --- |
| *Create a product with core fields* → **"the product appears in the products list with its status badge"** | the list + the editor's create path. 0024 owns the persistence half. |
| *A duplicate SKU is rejected* (the *"another product"* example) | the editor rendering the refusal inline against the SKU field. 0024 owns the rule. |
| *Selecting Spain surfaces its fiscal sub-entries in the region picker* | the picker's real embedding and real typing. 0026 owns the resolver; 0022 owns the shell. |
| *Assign a product to several sales regions* | the picker's selection reaching `SyncProductSalesRegions`. |
| Products AC 1 (all core fields "per the prototype list+editor") | the whole story. |
| Products AC 5 (searchable multi-select) | the embedded picker. |
| Products AC 6 (images come from the shared media gallery) | both gallery embeds. |
| List presentation: *"thumbnail, name + SKU, price, color-coded stock (low / out-of-stock), and a status badge (Activo / Borrador / Agotado), with a primary 'Nuevo producto' action"* | the list, verbatim. |

**Not covered here** (and each names its owner): variant CRUD (0031), the category taxonomy screen
(0025), tax *resolution* (0026's backend action, which this screen never calls), media upload/search
mechanics (0019/0020), and the WYSIWYG's own editing behaviour (0021).

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Products list

  Scenario: The products list shows each product's core columns
    Given a catalog administrator, with a product "Zapatillas Runner Pro" priced at 119.95 EUR
    When they open the products list
    Then the row shows the product's thumbnail, its name, its SKU, its price and its stock

  Scenario: An active product with stock reads as active
    Given a catalog administrator, with an active product whose stock is 42
    When they open the products list
    Then that product's badge reads active

  Scenario: An active product with no stock reads as out of stock
    Given a catalog administrator, with an active product whose stock is zero
    When they open the products list
    Then that product's badge reads out of stock

  Scenario: A draft product with no stock still reads as draft
    Given a catalog administrator, with a draft product whose stock is zero
    When they open the products list
    Then that product's badge reads draft

  Scenario: A low stock figure is called out visually
    Given a catalog administrator, with an active product whose stock is 8
    When they open the products list
    Then that product's stock figure is rendered in the low-stock treatment

  Scenario: An empty catalog explains itself
    Given a catalog administrator, with no products in the catalog
    When they open the products list
    Then an empty state is shown instead of an empty table

  Scenario: An administrator without the products view permission cannot open the list
    Given a signed-in administrator who does not hold the products view permission
    When they request the products list
    Then access is refused

Feature: Creating a product

  Scenario: The new-product button opens an empty editor
    Given a catalog administrator on the products list
    When they choose "Nuevo producto"
    Then the product editor opens with no product loaded

  Scenario: A product is created from the editor
    Given a catalog administrator in the product editor, with the category "Calzado" in the catalog
    When they save a product carrying a name, a unique SKU, that category, a product type, a price,
      stock, a status and a description
    Then the product is added to the catalog and appears in the products list

  Scenario: The editor pre-selects no product type
    Given a catalog administrator opening the product editor for a new product
    When they inspect the product type control
    Then no type is pre-selected and the placeholder cannot be chosen as a value

  Scenario: Saving without a product type is refused
    Given a catalog administrator in the product editor for a new product
    When they save without choosing physical or virtual
    Then the save is refused with a validation message beside the type control
    And no product is added to the catalog

  Scenario: A duplicate SKU is refused in the editor
    Given a catalog administrator in the product editor, with an existing product using SKU "RNR-001"
    When they save a new product with the SKU "RNR-001"
    Then the save is refused with a validation message beside the SKU field
    And no product is added to the catalog

  Scenario: The editor stores the SKU in its canonical form
    Given a catalog administrator in the product editor for a new product
    When they save the product with the SKU "  rnr-002  "
    Then the product is stored with the SKU "RNR-002"

  Scenario: The editor cannot offer an out-of-stock status
    Given a catalog administrator in the product editor
    When they inspect the status control
    Then it offers only active and draft

Feature: Editing a product

  Scenario: Opening a product loads its stored values
    Given a catalog administrator, with an existing product "Runner Pro"
    When they open that product in the editor
    Then every field is populated from the product's stored values

  Scenario: Saving a product under its own unchanged SKU is accepted
    Given a catalog administrator editing an existing product using SKU "RNR-001"
    When they save it with the SKU "RNR-001" unchanged
    Then the save is accepted

  Scenario: An administrator without the products edit permission cannot save
    Given a signed-in administrator who does not hold the products edit permission
    When they submit a product save
    Then the save is refused and the product is unchanged

Feature: The product's description

  Scenario: A description written in the editor is stored with the product
    Given a catalog administrator in the product editor
    When they save a product whose description was written in the rich-text editor
    Then the product's stored description carries that content

  Scenario: A stored description is shown when the product is reopened
    Given a catalog administrator, with an existing product carrying a description
    When they open that product in the editor
    Then the rich-text editor is seeded with the stored description

Feature: The product's images

  Scenario: Choosing a featured image sets it on the product
    Given a catalog administrator in the product editor, with an image in the media library
    When they choose that image as the product's featured image
    Then the editor shows it as the featured image

  Scenario: A featured image is not added to the gallery strip
    Given a catalog administrator in the product editor with an empty gallery strip
    When they choose an image as the product's featured image
    Then the gallery strip is still empty

  Scenario: Removing the featured image leaves the gallery strip untouched
    Given a catalog administrator in the product editor, with a featured image and three gallery images
    When they clear the featured image
    Then the gallery strip still holds those three images

  Scenario: Images are added to the gallery strip
    Given a catalog administrator in the product editor with an empty gallery strip
    When they add two images from the media gallery
    Then both appear in the gallery strip

  Scenario: An image already in the strip is not added twice
    Given a catalog administrator in the product editor, with an image already in the gallery strip
    When they add that same image again from the media gallery
    Then the gallery strip still holds it exactly once

  Scenario: The administrator reorders the gallery strip
    Given a catalog administrator in the product editor, with the gallery strip holding A, B and C in that order
    When they move B ahead of A
    Then the strip reads B, A, C

  Scenario: Reordering the strip changes nothing until the product is saved
    Given a catalog administrator in the product editor, with a saved product whose gallery reads A, B, C
    When they move B ahead of A without saving
    Then the product's stored gallery order is still A, B, C

  Scenario: A reordered strip keeps its order after the product is saved and reopened
    Given a catalog administrator who has reordered a product's gallery strip to B, A, C
    When they save the product and reopen it
    Then the strip reads B, A, C

  Scenario: A removed gallery image leaves the surviving images contiguously ordered
    Given a catalog administrator in the product editor, with the gallery strip holding A, B and C in that order
    When they remove B and save the product
    Then the product's stored gallery reads A then C with no gap in their order

Feature: The product's sales regions

  Scenario: Typing in the region picker narrows the options
    Given a catalog administrator in the product editor, with the Sales Region catalog seeded
    When they type "España" in the region picker
    Then Spain's fiscal sub-entries are offered as selectable options

  Scenario: Spain itself is not offered as an assignable region
    Given a catalog administrator in the product editor, with the Sales Region catalog seeded
    When they type "España" in the region picker
    Then the España heading entry itself is not offered as a selectable option

  Scenario: A product is assigned to several regions
    Given a catalog administrator in the product editor, with the Sales Region catalog seeded
    When they save the product with Península, Canarias and France selected
    Then the product is associated with exactly those three regions

  Scenario: Deselecting a region removes the assignment
    Given a catalog administrator editing a product assigned to Península and Canarias
    When they save the product with Canarias deselected
    Then the product is associated with Península alone

  Scenario: A selection carrying a region that no longer exists refuses the whole save
    Given a catalog administrator editing a product, with one selected region deleted from the catalog
      since the editor was opened
    When they save the product
    Then the save is refused with a message naming the problem
    And nothing about the product is changed, including its other region assignments

  Scenario: A product assigned to a since-deactivated region can still be edited and saved
    Given a catalog administrator editing a product assigned to a region that has since been deactivated
    When they save the product with only its price changed
    Then the save is accepted
    And the product is still associated with that deactivated region

  Scenario: A deactivated region cannot be newly assigned to a product
    Given a catalog administrator editing a product not assigned to a deactivated region
    When they save the product with that deactivated region added to its selection
    Then the save is refused with a message naming that region
    And the product's region assignments are unchanged

  Scenario: A failure while saving the region set leaves the product entirely unchanged
    Given a catalog administrator editing a product, with the region assignment set to fail
    When they save the product with a new name, a new gallery order and a new region selection
    Then the product keeps its original name, its original gallery order and its original regions

Feature: Deleting a product

  Scenario: Deleting a product removes it from the list
    Given a catalog administrator on the products list, with an existing product "Runner Pro"
    When they confirm the deletion of "Runner Pro"
    Then "Runner Pro" is no longer in the products list

  Scenario: The delete confirmation names the product
    Given a catalog administrator on the products list, with an existing product "Runner Pro"
    When they choose the delete action on that row
    Then a confirmation names "Runner Pro" before anything is deleted

  Scenario: An administrator without the products delete permission cannot delete
    Given a signed-in administrator who does not hold the products delete permission
    When they submit a product deletion
    Then the deletion is refused and the product is still in the catalog

  Scenario: A row action the administrator may not perform is shown disabled
    Given a signed-in administrator who does not hold the products delete permission
    When they open the products list
    Then each row's delete action is rendered disabled with an explanation
```

## Files to create/modify

**Owned by this story:**

| Path | Change |
| --- | --- |
| `app/Livewire/Products/Index.php` | **New.** The list. Class-based per [base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file). |
| `resources/views/livewire/products.blade.php` | **New.** The **flat** path — `App\Livewire\Products\Index` drops `.index` per the [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name). |
| `app/Livewire/Products/Editor.php` | **New.** The create/edit screen (**D-1**: a routed page, not a modal). |
| `resources/views/livewire/products/editor.blade.php` | **New.** The ordinary kebab-case mirror — note it sits one level *deeper* than the list's view; [naming.md](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name) already records that this asymmetry is expected. |
| `routes/web.php` | **Modify.** Three `Route::livewire(...)` registrations inside the existing `auth`+`verified` group (**D-2**), **and** deletion of 0020's harness block (**D-14**). |
| `resources/views/layouts/app/sidebar.blade.php` | **Modify** — one `flux:sidebar.item`, branching on whether [0013](done/0013-sidebar-module-gating-ui.md) has landed (**D-15**). |
| `lang/en/products.php` + `lang/es/products.php` | **Modify** (0024 creates them; 0026 and 0028 also extend them). Append an `index` group and an `editor` group. Key-for-key identical. |
| `app/Livewire/Dev/MediaGalleryHarness.php`, `resources/views/livewire/dev/media-gallery-harness.blade.php` | **Delete** (**D-14**). Both files carry a comment naming this story as their expiry. |
| `tests/Feature/Dev/MediaGalleryHarnessRouteTest.php` | **Delete** (**D-14**) — its subject no longer exists. |
| `tests/Browser/Media/GalleryTest.php`, `tests/Browser/Components/WysiwygEditorTest.php` | **Modify** (**D-14**) — re-point from the harness URL onto the real product editor. This is a **test migration**, not a footnote. |
| `tests/Feature/Products/IndexTest.php` | **New.** List component + route-authorization tests. |
| `tests/Feature/Products/IndexQueryTest.php` | **New.** The explicit-column `select()` and the N+1 guard (**D-4**). |
| `tests/Feature/Products/IndexRenderingTest.php` | **New.** Markup-level assertions for the list. |
| `tests/Feature/Products/EditorTest.php` | **New.** The largest file: the editor's save orchestration. |
| `tests/Feature/Products/EditorRenderingTest.php` | **New.** Option-set and embedded-component markup guards. |
| `tests/Feature/Products/AuthorizationTest.php` | **New.** Discharges 0024 **D-15** and 0026 **D-8**'s zero-call-site hand-offs. |
| `tests/Browser/Products/EditorJourneyTest.php` | **New.** The one comprehensive happy-path journey (**D-16** rationale). |
| `tests/Browser/Products/IndexTest.php` | **New.** The list's real-DOM cases only. |
| `tests/Unit/ArchitectureTest.php` | **Modify** — extend the existing scope fence to cover `App\Livewire\Products\*`, matching 0025 **D-9**. |

**Explicitly NOT touched** (consumed as already-shipped code, so the boundary is unambiguous):

| File / concern | Owner |
| --- | --- |
| `database/migrations/*products*`, `app/Models/Product.php`, `app/Enums/Product*.php` | 0024 |
| `app/Actions/Products/{Create,Update,Delete}Product.php`, `SyncProductGallery.php`, `SanitizeProductDescription.php` | 0024 |
| `app/Concerns/ProductValidationRules.php`, `app/Policies/ProductPolicy.php` | 0024 (0026 extends the trait) |
| `app/Actions/Products/{SyncProductSalesRegions,SearchSalesRegions,ResolveProductTaxRate}.php` | 0026 |
| `app/Livewire/Media/Gallery.php`, `app/Livewire/Components/{WysiwygEditor,SearchableMultiSelect}.php` | 0020 / 0021 / 0022 |
| `app/Actions/NormalizeForSearch.php`, `app/Exceptions/UnresolvedSelectionException.php` | 0022 |
| `app/Livewire/ProductCategories/Index.php` and the categories screen | 0025 |
| `database/seeders/RolePermissionSeeder.php` | nobody — `products.*` is already seeded (0023 **D-8**) |
| Any variant builder markup | 0031 |

> **Sequential-implementation requirement.** This story writes `lang/en|es/products.php`, which 0024
> creates and 0025/0026/0028 also extend, and it deletes files 0020 and 0021 own. Its Phase 3 work
> must **never** be dispatched in the same batch as any of those stories, per the
> [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule).

### Interface contract consumed — reconciled against the amended dependencies

Everything below was re-read on disk on 2026-08-18, **after** 0022's and 0026's amendments. Where a
name is uncertain it is flagged, not guessed.

```php
// From 0024 — all present, all with ZERO call sites until this story
App\Models\Product                             // HasUuids, no SoftDeletes, casts type/status enums,
                                               //   price => decimal:2 (a STRING, never a float — R-4)
Product::displayStatus(): ProductDisplayStatus // Active | Draft | OutOfStock — computed, never stored
Product::isOutOfStock(): bool                  // stock <= 0
Product::category() / featuredImage() / gallery()
App\Enums\ProductStatus                        // EXACTLY Active, Draft — this feeds the <select>
App\Enums\ProductDisplayStatus                 // Active, Draft, OutOfStock — this feeds the BADGE only
App\Enums\ProductType                          // Physical, Virtual — required, NO default anywhere
App\Concerns\ProductValidationRules            // productNameRules, skuRules, productCategoryIdRules,
                                               //   productTypeRules, productStatusRules, priceRules,
                                               //   stockRules, descriptionRules, featuredMediaIdRules,
                                               //   galleryMediaIdsRules  (entity-prefixed where ambiguous)
App\Actions\Products\CreateProduct             // __invoke(...): Product — canonicalises SKU, sanitizes
                                               //   description, and DELEGATES IMAGERY TO SyncProductGallery
App\Actions\Products\UpdateProduct             // __invoke(Product, ...): Product — same, ->ignore()d unique
App\Actions\Products\DeleteProduct             // __invoke(Product): bool
App\Actions\Products\SyncProductGallery        // __invoke(Product $product, ?string $featuredMediaId,
                                               //   array $orderedGalleryMediaIds): void
                                               // 0024 D-17: owned EXCLUSIVELY by 0024; the array is the
                                               //   COMPLETE, AUTHORITATIVE order and `position` is its
                                               //   0-based INDEX, rewritten for every row on every call.
                                               // NEVER called directly from here — it is reached through
                                               //   CreateProduct / UpdateProduct (D-12a, 0024 hand-off (d)).
App\Policies\ProductPolicy                     // viewAny/view/create/update/delete -> products.*
lang/en|es/products.php                        // types.*, statuses.*, display_statuses.out_of_stock,
                                               //   categories.delete_blocked

// From 0026
App\Actions\Products\SyncProductSalesRegions   // __invoke(Product, array $salesRegionIds): void — sync()
App\Actions\Products\SearchSalesRegions        // implements MultiSelectOptionsResolver;
                                               //   resolveSelected() is a TOTAL FUNCTION or it throws
ProductValidationRules::salesRegionIdsRules()  // ['array']
ProductValidationRules::salesRegionIdRules(array $preservedSalesRegionIds = [])
                                               // string|distinct|
                                               //   exists( (is_active AND no children) OR id IN (preserved) )
                                               // 0026 D12 (2026-08-19): the argument is READ SERVER-SIDE from
                                               //   the persisted product's current regions, never from the
                                               //   request. [] on create == the pre-D12 strict rule.  <-- D-11

// From 0022 (amended 2026-08-18)
<livewire:components.searchable-multi-select :option-resolver="..." wire:model="..." field="..." />
SearchableMultiSelect::assertSelectionResolvable()
App\Exceptions\UnresolvedSelectionException    // public readonly array $missingIds; NO render()

// From 0021
<livewire:components.wysiwyg-editor wire:model="description" wire:key="..." :label="..." />
                                               // $value is never null; region is wire:ignore'd (D9)

// From 0020
<livewire:media.gallery wire:model="showX" wire:key="..." :multi="bool" select-event="..." />
                                               // dispatches array<int, array{id,title,description,
                                               //   url,webpUrl,avifUrl,width,height}>

// From 0019 — the media COLUMNS are path/webp_path/avif_path, NOT url/webp_url/avif_url.
Media                                          // id, title, description, path, webp_path, avif_path,
                                               //   width, height, size_bytes, uploaded_by
                                               // URL-shaped values come from url()-style ACCESSORS (D-17)
```

**Six obligations inherited verbatim from the dependencies' own Definitions of Done** (three original,
three added by the 2026-08-19 upstream amendments — see **D-18**), all non-negotiable:

1. **`Gate::authorize()` is the first statement of every method that mutates or discloses.** 0024
   **D-15** and 0026 **D-8** both ship their actions with no self-authorization; this story is where
   `ProductPolicy` stops being a zero-call-site policy.
2. **Gate the routes with `can:products.view`, never `permission:products.view`** — Livewire 4's
   `PersistentMiddleware` allow-list carries Laravel's `Authorize` but not Spatie's
   `PermissionMiddleware`, so `permission:` would protect only the initial `GET`. See
   [api/routes.md](../../docs/api/routes.md#usersindex--the-first-permission-gated-route).
3. **The id fed to `Rule::unique()->ignore()` must be server-authoritative** — `#[Locked]`, assigned
   from a value read back out of the database, never from a method argument. 0029's own note warns
   this trap is *worse* one story over; getting it wrong here turns a uniqueness check into a
   rename-any-product primitive. See
   [security/livewire-authorization.md](../../docs/security/livewire-authorization.md).
4. **`salesRegionIdRules()` is called with the persisted product's current region ids** — read from
   `$product->salesRegions` server-side, never from the request (0026 **D12**, hand-off item 3).
   Calling it with no argument on an *edit* re-introduces the bug D12 fixed; calling it with a
   client-supplied array turns the whole `is_active` gate off, which is strictly worse.
5. **The ordered gallery array goes *into* `CreateProduct` / `UpdateProduct`; `SyncProductGallery` is
   never called directly from here** (0024 **D-17a**, hand-off item (d); **D-12a** below).
6. **One `DB::transaction()` wraps the whole save** — the core-field write, the region sync and the
   gallery sync — opened *after* validation and after `resolveSelected()` (0026 **D13**, hand-off item
   4; **D-12b** below). Neither owning story can open it without reaching into the other's files.

### Route registrations

```php
// routes/web.php — inside the existing auth+verified group, beside users.index
// `can:products.view`, not Spatie's `permission:` — Livewire 4's PersistentMiddleware
// allowlist does not carry `permission:`, so every /livewire/update round-trip
// (save(), deleteProduct(), the gallery's own methods, ...) would run unauthorized.
// The finer abilities (create/update/delete) are authorized inside the components.
// See docs/architecture/authorization.md.
Route::livewire('products', ProductsIndex::class)
    ->middleware(['can:products.view'])
    ->name('products.index');

Route::livewire('products/create', ProductEditor::class)
    ->middleware(['can:products.view'])
    ->name('products.create');

Route::livewire('products/{product}/edit', ProductEditor::class)
    ->middleware(['can:products.view'])
    ->name('products.edit');
```

**Verified:** `Route::livewire()` is a thin macro over `Route::get($uri, LivewirePageController::class)`
(`vendor/livewire/livewire/src/Mechanisms/HandleRouting/HandleRouting.php`), so it accepts route
parameters and route-model binding exactly like any GET route. Two registrations onto **one**
component is deliberate — see **D-2**.

### Component public surfaces

```php
namespace App\Livewire\Products;

#[Title('Products')]
class Index extends Component
{
    use WithPagination;                                   // D-4

    #[Locked] public bool $showDeleteModal = false;
    #[Locked] public ?string $deletingProductId = null;   // written only from $target->id
    #[Locked] public string $deletingProductName = '';

    public function mount(): void;                        // Gate::authorize('viewAny', Product::class)
    public function confirmDelete(string $productId): void;
    public function deleteProduct(DeleteProduct $delete): void;   // Gate::authorize('delete', $target)
    public function closeDeleteModal(): void;
    #[Computed] public function products(): LengthAwarePaginator;  // D-4
}
```

```php
namespace App\Livewire\Products;

#[Title('Product editor')]
class Editor extends Component
{
    use ProductValidationRules;

    #[Locked] public ?string $productId = null;        // null => create. From $product->id, never an argument.

    // --- form fields, all bound with wire:model. NONE of them is ever null. See D-5.
    public string $name = '';
    public string $sku = '';
    public string $productCategoryId = '';             // '' matches the placeholder <option value="">
    public string $type = '';                          // plain string, NOT ?ProductType — D-5
    public ProductStatus $status = ProductStatus::Draft;
    public string $price = '';
    public string $stock = '';
    public string $description = '';                   // the WYSIWYG's #[Modelable] target
    public array $regionIds = [];                      // the multi-select's #[Modelable] target — NOT locked

    // --- imagery: server-derived, so locked (D-8)
    #[Locked] public ?string $featuredMediaId = null;
    #[Locked] public ?array  $featuredPreview = null;  // {id,title,url,webpUrl,avifUrl}
    #[Locked] public array   $galleryMediaIds = [];    // ORDERED — the array order IS the gallery order,
                                                       //   and it IS the persisted `position` (0024 D-17b)
    #[Locked] public array   $galleryPreviews = [];    // same order, same keys as above

    // --- modal open flags, each the #[Modelable] target of one Gallery instance (D-8)
    public bool $showFeaturedGallery = false;
    public bool $showStripGallery = false;

    public function mount(?Product $product = null): void;   // D-2, D-12
    #[On('featured-image-selected')] public function setFeaturedImage(array $media): void;
    public function clearFeaturedImage(): void;
    #[On('product-images-added')]    public function addGalleryImages(array $media): void;
    public function removeGalleryImage(string $mediaId): void;
    public function moveGalleryImageEarlier(string $mediaId): void;   // D-9 — reorders the ARRAY only;
    public function moveGalleryImageLater(string $mediaId): void;     //   nothing is persisted until save()
    public function save(
        CreateProduct $create,
        UpdateProduct $update,
        SyncProductSalesRegions $syncRegions,
        SearchSalesRegions $searchSalesRegions,
    ): mixed;                                          // returns a redirect — D-12
                                                       // authorize -> read $preserved from the DB ->
                                                       //   validate -> resolveSelected() ->
                                                       //   DB::transaction(create/update + syncRegions)
    #[Computed] public function categoryOptions(): array;
    #[Computed] public function typeOptions(): array;
    #[Computed] public function statusOptions(): array;
}
```

## Tests to perform

Levels chosen per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md): browser tests
only where the real-DOM/JS round trip is itself the risk, everything else at the cheaper component
level. **The deliberate calibration is that this story does not re-run its dependencies' suites one
layer up** — see [Deliberately not tested here](#deliberately-not-tested-here).

### `tests/Feature/Products/IndexTest.php`

- [ ] The route resolves for a holder of `products.view` and is refused (403) without it.
- [ ] `mount()` authorizes `viewAny` — proven by a direct `Livewire::test()` call as a denied actor,
      not merely by the route 403 (an HTTP test and a `Livewire::test()` test are **not** substitutes,
      per [testing/backend](../../docs/testing/README.md)).
- [ ] The list renders every product with name, SKU, price and stock.
- [ ] Ordering is deterministic (see **D-4**), asserted as an exact sequence, never `toContain`.
- [ ] `confirmDelete()` populates `$deletingProductName` from the **database**, not from a row array.
- [ ] `deleteProduct()` authorizes `delete` **first**, and removes the row.
- [ ] `deleteProduct()` as a denied actor writes nothing — asserted against the database.
- [ ] `deleteProduct()` with a `$deletingProductId` naming a nonexistent product fails closed.
- [ ] `closeDeleteModal()` clears both locked properties and the error bag.

### `tests/Feature/Products/IndexQueryTest.php` *(its own file — the query shape is a named risk)*

- [ ] The list query selects **explicit columns and never `description`** — captured with
      `DB::listen()` and asserted on the SQL, per 0024 **R-9**. A `SELECT *` here drags a
      `MEDIUMTEXT` out of the clustered index on every row.
- [ ] **N+1 guard**: the query count for 10 products with 10 distinct categories and 10 distinct
      featured images equals the count for 1 product, ± the paginator's own count query. Distinct
      relations are load-bearing — identical ones would pass through Eloquent's identity map and hide
      the defect.
- [ ] Pagination: page 2 returns the next page's rows and the total is correct.

### `tests/Feature/Products/IndexRenderingTest.php`

- [ ] An active product with stock renders the **active** badge; with zero stock, the **out-of-stock**
      badge; a **draft** with zero stock renders **draft** (0024 RQ-4 — the override applies to Active
      only).
- [ ] The badge text comes from `ProductDisplayStatus`, and the string `agotado` appears nowhere in
      `ProductStatus`'s rendered option set anywhere on the site.
- [ ] Stock at 0 / 8 / 42 renders the out / low / ok treatment respectively (**D-7**).
- [ ] Every row action carries `data-test="edit-product-{id}"` / `data-test="delete-product-{id}"` on
      **both** the enabled and the disabled branch.
- [ ] **Flux/Blaze regression guards**, all three already in
      [errors-log.md](../../docs/errors-log.md): an *enabled* row action renders **no**
      `data-flux-tooltip-content` element; the disabled branch's `cursor-not-allowed!` sits on the
      `flux:tooltip` wrapper and not on the button; every id in a `wire:*` argument went through
      `@js()`.
- [ ] The empty state renders when there are no products, and the table does not.
- [ ] A product with no featured image renders the agreed placeholder rather than a broken image
      (pending [OQ-2](#open-questions)).

### `tests/Feature/Products/EditorTest.php` *(the largest file)*

Create path:

- [ ] A full valid payload creates exactly one product carrying every submitted value, with `price`
      asserted as the **string** `'119.95'` (0024 **R-4** — `toBe(119.95)` silently coerces).
- [ ] Saving without a type writes **zero rows** and reports an error on the type field. This is
      0024's most load-bearing invariant (**D-5**: no fallback is ever applied).
- [ ] Saving without a category / with an unknown category writes zero rows.
- [ ] A duplicate SKU is refused with the error on the **`sku`** field. ⚠️ The error-bag key is
      assumed to be `sku` — **confirm it against 0024's shipped `skuRules()` binding before writing
      this test**, since a test written against the wrong key passes vacuously.
- [ ] `"  rnr-002  "` round-trips through the component and is stored as `'RNR-002'` — proving the
      component routes into 0024's canonicalisation rather than re-implementing it.
- [ ] A price with three decimals is refused (0024 RQ-5).
- [ ] Negative stock is refused.

Edit path:

- [ ] Opening an existing product populates every field from the database.
- [ ] Saving with the SKU unchanged is **accepted** — the `->ignore()` test. 0024 **R-15** and 0023
      **R-1** both rate the omission the single likeliest bug of their story.
- [ ] **The retarget test**: a crafted payload setting `productId` to another product's id cannot
      make this editor rename that product. `#[Locked]` plus assignment from `$product->id` is what
      prevents it; this test is what pins the pair.

Orchestration — **the tests only this story can write**:

- [ ] **A stale region id refuses the whole save with ZERO database writes.** Seed a product assigned
      to region A; put B in the pending selection; delete B from the database; save. Assert the
      product's `name`/`price` are unchanged **and** the pivot holds exactly `{A}` — an exact-set
      assertion, never `toContain`. This is the single highest-value test in the story: 0024 and 0026
      each test their own actions in isolation and structurally cannot see a wiring bug here.
- [ ] **A since-deactivated *preserved* region does not block the save** (**D-11** resolution, 0026
      **D12**). Seed a product assigned to region A; deactivate A; change only `price`; save. Assert the
      save is **accepted**, `price` changed, and the pivot still holds exactly `{A}`. This is the
      regression test for the bug this story found, and it must go red if `salesRegionIdRules()` is
      ever called without its `$preserved` argument.
- [ ] **A since-deactivated region that is *newly added* is still refused.** Same fixture, but A is not
      previously assigned. Assert the save is refused, the error is on `regionIds.*` (indexed to the
      offending element, per 0026 **D11**), and zero rows changed. Together with the test above this is
      the pair that proves the exemption is scoped to *preserved* ids and did not become a blanket
      relaxation.
- [ ] 🔒 **`$preserved` cannot be supplied by the client.** A crafted payload naming a deactivated,
      never-assigned region as though it were pre-existing is still refused — the preserved set is read
      from `$product->salesRegions`, never from the request (0026 **D12** constraint 2 / revert-check
      **#11**). Without this test the whole `is_active` gate is one refactor away from being optional.
- [ ] **Create passes `[]`**: a create submitting a deactivated region is refused exactly as it was
      before 0026 **D12** — the exemption has no create-path branch of its own.
- [ ] **A save that fails mid-flight leaves *nothing* partially written** — the single
      `DB::transaction()` of **D-12b** / 0026 **D13**, exercised by forcing `SyncProductSalesRegions`
      to throw on a save that also changes `name`, the featured image and the gallery order. Assert
      **all four** are unchanged: `products.name`, `products.featured_media_id`, the `product_media`
      order, and the `product_sales_region` set. Asserting only the product row would pass against a
      missing boundary, because `UpdateProduct` commits first.
- [ ] **A `ValidationException` never travels through an open transaction.** A save refused by
      validation (or by `resolveSelected()`) must not have opened one — asserted with
      `DB::transactionLevel()` observed from a `DB::listen()`/event hook, or at minimum by proving zero
      writes across all three tables. Ordering, not just atomicity, is the contract (**D-12b**).
- [ ] Setting a featured image does **not** change the `product_media` pivot row count (0024 **D-9**
      independence, re-asserted at *this* story's integration layer).
- [ ] **The gallery strip's array order is persisted as the 0-based `position`** (**D-9a**, 0024
      **D-17b**) — asserted on the pivot as an exact `[0, 1, 2]` sequence mapped to the expected media
      ids, then again on a fresh mount. Never `toContain`.
- [ ] **A reorder is expressed as a resubmitted array, not a swap.** Move the third strip item to the
      front through `moveGalleryImageEarlier()` twice, save, and assert the pivot's `position` values
      are contiguous `0..n-1` in the new order — and that the component issued **one** save call, not a
      per-move write. The buttons must leave the database untouched until `save()` runs.
- [ ] **A removal leaves no `position` gap.** Remove the middle image and save; assert `0, 1` rather
      than `0, 2` — proof the full-rewrite contract is in force and nothing here appends.
- [ ] `save()` authorizes `create` (new) / `update` (existing) as its **first** statement, proven by a
      direct `Livewire::test()` call as a denied actor.
- [ ] A save by a denied actor writes nothing across `products`, `product_media` **and**
      `product_sales_region`.

### `tests/Feature/Products/EditorRenderingTest.php`

- [ ] The status `<select>`'s option set is **exactly** `ProductStatus::cases()` — a regression guard
      against anyone feeding it `ProductDisplayStatus::cases()` (**D-6**).
- [ ] The type control renders a placeholder that is `disabled` and carries `value=""`, and **no real
      option is pre-selected** on a fresh create form (**D-5**).
- [ ] The category `<select>` is fed from real `product_categories` rows, ordered by name.
- [ ] The three embedded components are present with their exact static attributes: two
      `media.gallery` embeds with **distinct** `wire:key`s and the literal `select-event` names
      `featured-image-selected` / `product-images-added`; one `components.wysiwyg-editor` bound to
      `description`; one `components.searchable-multi-select` whose `option-resolver` is
      `SearchSalesRegions::class` and whose `field` is `regionIds` (**D-8**, **D-10**).
- [ ] Both direct gallery embeds are inside an `@can('viewAny', Media::class)` branch (0020 **D12**),
      and an actor without `media.view` still renders the editor page rather than a 403.
- [ ] The description field carries the static lossy-sanitization notice (**D-13**).

### `tests/Feature/Products/AuthorizationTest.php`

Discharges 0024 **D-15**'s and 0026 **D-8**'s hand-offs explicitly, so `ProductPolicy` stops being a
zero-call-site policy:

- [ ] One allow/deny pair per component method that mutates or discloses, driven through
      `Livewire::test()` as the acting user — never inferred from hidden UI.
- [ ] A Super Admin passes every one of them via the `Gate::before` bypass.
- [ ] The per-row `canEdit`/`canDelete` hints come from the **same** policy methods `save()` /
      `deleteProduct()` authorize against, so the disabled state cannot drift
      ([authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)).

### `tests/Browser/Products/EditorJourneyTest.php`

**One comprehensive journey rather than many isolated browser tests**, deliberately. Four
independently hand-rolled JS surfaces — the featured gallery, the strip gallery, the WYSIWYG's own
internal gallery, and the region picker's debounced search — run simultaneously on one real page for
the first time here. Isolated tests could each pass while the combined page fails on timing
interaction between them, which is exactly the gap 0022's own "honest limitation" note hands forward.

- [ ] Fill every field, write a description, pick a featured image, add two strip images, reorder
      them, type in the region picker and select two regions, save — then reopen and verify every
      value survived.

Plus the cases a `Livewire::test()` genuinely cannot reach:

- [ ] **The `type` control, driven the way a person drives it.** Open the select and **click the
      first non-placeholder option** with a genuine click sequence, then save and assert the
      **persisted** value equals that option. A scripted `selectOption()`/`select()` helper
      **does not reproduce** this class of bug — the errors-log entry is explicit that the failure
      mode is a *missing* `change` event. Repeat for `productCategoryId`, the other plain-string
      select. This is the most dangerous instance of that bug in the codebase so far, because unlike
      Users' `roleId` the type field has **no** safe fallback value to fall back to.
- [ ] Typing `España` in the region picker narrows the live dropdown to Spain's fiscal sub-entries
      and does **not** offer España itself. This is explicitly **owed forward** by
      [0022](0022-searchable-multi-select-component.md)'s own provenance note: 0022 proves the
      mechanics against a test-only host, and named 0027 as the story that proves the real embedding
      with the real resolver.
- [ ] A duplicate SKU refusal is **visible** next to the field, not merely present in the error bag.
- [ ] Featured/strip visual independence: setting a featured image leaves the strip's rendered tiles
      unchanged.
- [ ] Reorder through the real controls, then save, then reload, and read the order off the DOM.

### `tests/Browser/Products/IndexTest.php`

- [ ] Clicking a row's edit action navigates to the editor URL for that product.
- [ ] The delete confirmation modal opens, names the product, and cancelling leaves it in the list.
- [ ] A disabled row action does not respond to a click and shows its tooltip on hover of the
      **wrapper** (the button itself is `pointer-events-none` — errors-log, 2026-08-16).

### Migrated from the retired harness (**D-14**)

These are **existing tests being re-pointed**, not new coverage, and the migration is itemized in
**D-14**. Every one of them must be green against the real editor before the harness is deleted:

- [ ] `tests/Browser/Media/GalleryTest.php` — every case, including the **two-instance re-entrancy**
      assertion (an image confirmed in the featured gallery must not reach the strip's listener, and
      vice versa).
- [ ] `tests/Browser/Components/WysiwygEditorTest.php` — every case, including its own re-entrancy
      assertion, now re-provable because the real editor page carries **three** Gallery instances.

### Deliberately not tested here

Redundant-coverage discipline, per
[what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md) and
[coverage-review-checklist.md](../../docs/testing/qa/coverage-review-checklist.md). This story proves
the **integration and wiring** points; it never re-derives a dependency's own covered logic:

| Not tested here | Owner |
| --- | --- |
| SKU canonicalisation rules, the `23000` race catch, the collation reasoning | 0024 **D-11** |
| The HTML sanitizer's allow-list, its idempotence, its scheme restrictions | 0024 **D-16** |
| The WYSIWYG's tag emission, caret restore, toolbar `aria-pressed` | 0021 |
| The media gallery's search, upload, tile cap, detail editing | 0019 / 0020 |
| The multi-select's debounce timing, over-fetch arithmetic, truncation row | 0022 |
| `SearchSalesRegions`' own matching, folding and qualified-label rules | 0026 |
| `ResolveProductTaxRate` — this screen never calls it | 0026 |

## Expected outcome

A catalog administrator holding `products.view` sees **Productos** in the sidebar. The list shows the
catalog with a thumbnail, name over SKU, price, a colour-coded stock figure and a status badge that
reads *Agotado* for an active product that has run out — without any product ever having been *stored*
as out of stock. A primary **Nuevo producto** button opens an empty editor at its own URL; clicking a
row opens that product's editor at its own URL, which means the browser's back button, a bookmark and
a deep link all work, and a save can safely redirect.

In the editor the administrator fills the core fields, must consciously pick physical or virtual
(nothing is pre-selected and nothing is guessed on their behalf), writes a description in the
rich-text editor, picks a featured image and builds an ordered gallery strip from the shared media
gallery — the two remaining wholly independent of each other — and assigns Sales Regions through a
searchable picker where typing `España` surfaces Península, Baleares, Canarias, Ceuta and Melilla
while España itself is not offered. Saving writes the product, its imagery and its region set in one
transaction, or writes nothing at all and says why. Deleting is a confirmation on the list that names
the product.

Structurally: `ProductPolicy` and eight actions across three stories acquire their first call sites;
the two shared UI components acquire their first real embeddings; and the temporary
`dev/media-gallery-harness` scaffolding 0020 and 0021 built is removed, with its browser coverage
moved onto a real screen.

## Acceptance criteria

- [ ] `products.index`, `products.create` and `products.edit` exist, all three gated `can:products.view`
      (never `permission:`), all three inside the `auth`+`verified` group.
- [ ] The list renders thumbnail, name + SKU, price, colour-coded stock and a status badge, with a
      primary "Nuevo producto" action and an explicit empty state.
- [ ] **The badge reads out-of-stock for an active product with zero stock, and the stored `status`
      is never written when stock changes.** A zero-stock **draft** still reads draft.
- [ ] **The status control offers exactly Active and Draft.** No out-of-stock option exists anywhere
      in the UI, and the prototype's third `<option>` is deliberately not reproduced.
- [ ] **The type control pre-selects nothing, its placeholder is unselectable, and a save without a
      type is refused with no row written and no fallback applied at any layer.**
- [ ] The editor is a **routed page** with its own URL for create and for edit; a successful save
      redirects rather than resetting the form in place.
- [ ] A duplicate SKU is refused with the message rendered beside the SKU field; a product saved under
      its own unchanged SKU is accepted; a canonicalising SKU round-trips through the component.
- [ ] The featured image and the gallery strip are set through two independent gallery instances, and
      setting one never modifies the other in either direction.
- [ ] The gallery strip has a user-defined order that survives a save/reopen round trip, changeable
      through a control that works without dragging.
- [ ] **The reorder buttons mutate only the in-memory ordered array; the save resubmits that array
      complete to `CreateProduct` / `UpdateProduct`, and the persisted `position` is its 0-based index,
      contiguous with no gaps** (0024 **D-17b**). No pairwise swap, no per-move write, and
      `SyncProductGallery` is **never** called from this story's code directly (0024 **D-17a**).
- [ ] Sales Regions are assigned through the shared searchable multi-select fed by
      `SearchSalesRegions`; typing `España` surfaces its fiscal sub-entries and does not offer España
      itself.
- [ ] **A submitted selection containing an id the resolver cannot vouch for refuses the entire save**
      — no product write, no gallery write, no pivot write — with a message naming the problem.
- [ ] **A product already assigned to a since-deactivated region stays saveable**: `salesRegionIdRules()`
      is called with the persisted product's current region ids, read server-side and never from the
      request (0026 **D12**). A *newly added* inactive or heading region is still refused, and a create
      passes `[]`.
- [ ] The product, its imagery and its region set are written in **one `DB::transaction()`** owned by
      this story — `CreateProduct`/`UpdateProduct` (which reaches `SyncProductGallery` internally) plus
      `SyncProductSalesRegions` — opened **after** validation and after `resolveSelected()`, or nothing
      is written at all (0026 **D13**).
- [ ] Every component method that mutates or discloses calls `Gate::authorize()` as its first
      statement, and each row's edit/delete action renders enabled or disabled from the **same**
      policy method that would run on click.
- [ ] Deleting a product is available from the list behind a confirmation naming the target, and is
      refused for an actor without `products.delete`.
- [ ] The list query selects explicit columns, excludes `description`, and eager-loads the category
      and featured image with no N+1.
- [ ] `lang/en/products.php` and `lang/es/products.php` stay key-for-key identical, and no
      user-facing string is hardcoded.
- [ ] **The `dev/media-gallery-harness` route, component, view and gating test are gone**, and every
      browser assertion that ran against them runs against the real product editor instead — with no
      net loss of coverage.
- [ ] No migration, model, action, policy, enum, validation rule, factory, seeder or permission-catalog
      change is added by this story.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule. Note this story **deletes
      and re-points existing browser tests**, so the full-suite run is the only evidence that the
      harness migration lost nothing.
- [ ] `vendor/bin/pint --dirty --format agent` clean and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Point the audit at four things specifically: the
      `#[Locked]` placement on every id-carrying property (**D-8**), the `->ignore()` id's
      server-authoritative provenance, the `@js()` encoding of every id in a `wire:*` argument, and
      the fact that this screen renders **no** product description HTML at all (**D-13** scope fence)
      — 0024 **R-12** permits unescaped rendering, and this story deliberately does not use it.
- [ ] Documentation updated (docs-keeper): `docs/api/routes.md` gains the three product routes and
      **loses** the temporary harness route it recorded for 0020; `docs/architecture/authorization.md`
      records that `ProductPolicy` now has call sites; `docs/conventions/naming.md`'s `Index`-exception
      section can cite the real `Products\Index` / `Products\Editor` depth asymmetry rather than a
      hypothetical one.
- [ ] **Hand-off discharged, not deferred**: this story closes 0024 **D-15** and its hand-off item
      **(d)** (0024 **D-17a**), 0026 **D-8** plus its hand-off items **3** (0026 **D12**) and **4**
      (0026 **D13**), 0022's "prove the real embedding" forward dependency, and 0020 **D16** / 0021
      **D13**'s harness expiry. Each is a checkbox in another story's Definition of Done; record
      explicitly which one this story satisfied.
- [x] ~~**[OQ-5](#open-questions) and [OQ-6](#open-questions) answered before Phase 3 starts.**~~
      ✅ **Discharged 2026-08-19 — both answered upstream** by 0026 **D12** and 0024 **D-17**
      respectively; the transaction gap was answered by 0026 **D13**. See **D-18**. Phase 3 is no
      longer blocked on either. What replaces this item is the verification below.
- [ ] **The three upstream resolutions are honoured in code, not merely cited** (**D-18**), and each is
      named in the closing report: (1) `salesRegionIdRules($preserved)` with `$preserved` read from the
      persisted product; (2) the ordered gallery array passed into `CreateProduct`/`UpdateProduct` with
      `SyncProductGallery` never called directly; (3) one `DB::transaction()` around all three writers,
      opened after validation and after `resolveSelected()`. Each has a named test in
      `tests/Feature/Products/EditorTest.php`.
- [ ] Acceptance criteria met.

## Documented functional decisions

### D-1 — The editor is a **routed page**, not a modal *(confirmed; both specialists converged independently)*

The Users (0006) and Product Categories (0025) screens both put create/edit in a `flux:modal`, so this
is a deliberate divergence from the house pattern and needs its reasons stated.

1. **The information architecture is not a quick-create.** This form composes five nested pieces of
   real UI — a WYSIWYG with its own toolbar and popover, two media-gallery modals, and a searchable
   dropdown — several of which own internal state and their own overlay. `flux:modal` renders a native
   `<dialog>`; opening a second `<dialog>` (the media gallery) from inside the first, with a
   `flux:dropdown` competing for the same stacking context, is a class of z-index/overflow problem
   with no clean answer.
2. **`wire:ignore` makes a re-opened modal actively wrong.** 0021 **D9** states that the editable
   region is seeded from `$value` **at client initialisation only** and that a server-side write to
   it does not appear in the editor. In a modal, closing and re-opening for a different product either
   remounts (losing the child's client state deliberately, which needs a `wire:key` dance) or keeps
   stale content. On a routed page every navigation is a fresh mount, and the problem does not exist.
   0021's D9 even says "0027 should be told rather than discovering it" — this is that.
3. **The prototype models it this way, and *this* is the one thing the prototype legitimately
   settles.** `docs/arospe-handoff/project/productos.html` has two sibling screens (`data-screen="list"`
   / `data-screen="edit"`) and a "Volver a productos" back link, with a two-column editor layout. The
   PRD's design-reference section is explicit that the prototype's *markup and CSS* are never ported —
   but *what is grouped with what, and whether a thing is a page or an overlay*, is information
   architecture, which is exactly what a design reference is for.
4. **A URL per product is a real product feature** — deep links, bookmarks, the browser back button,
   and a safe redirect-after-save (**D-12**).

*Rejected:* a modal, for the four reasons above. *Rejected:* a single-page list-plus-inline-editor
mirroring the prototype's `hidden` toggle — it reproduces the modal's remount problem while also
giving up the URL.

### D-2 — Three routes, two of them onto one `Editor` component

`products.create` and `products.edit` both resolve `App\Livewire\Products\Editor`; `mount()` takes an
**optional** `?Product $product = null` and branches. Verified that `Route::livewire()` is a plain
`Route::get(...)` macro, so route-model binding behaves normally, and 0024's `HasUuids` makes a
malformed non-UUID `{product}` a 404 before any query runs.

*Rejected:* one route `products/{product?}/edit` with an optional parameter — it produces the ugly
`products//edit` for the create case and a single route name for two conceptually different entry
points. *Rejected:* two component classes (`Create` and `Edit`) — the two share every field, every
validation rule and the entire save path; splitting them would duplicate ~200 lines to vary one
branch in `mount()`.

**Route middleware is `can:products.view` on all three**, with the finer abilities authorized inside
the component (`create` / `update` in `save()`, `delete` in `deleteProduct()`). `can:update,product`
on the edit route was considered — it is idiomatic Laravel and `Authorize` *is* on Livewire's
`PersistentMiddleware` allow-list — but whether the bound route parameter is re-resolvable on a
`/livewire/update` round trip is **unverified**, and this story is not the place to find out. Recorded
as a Phase 3 verification item, not adopted on faith. The in-component `Gate::authorize()` calls are
what actually protect the mutations either way.

### D-3 — Delete is in scope, as a list-row confirmation *(decision, previously unstated in the brief)*

The brief scopes "the list and the editor" without naming delete. It is **in scope**, on four grounds:

1. 0024 ships `DeleteProduct` **and** `ProductPolicy::delete()` explicitly as a hand-off with zero call
   sites, and names 0027 as the story that discharges it.
2. Every list screen in this project pairs list + editor + delete (`Users\Index`,
   `ProductCategories\Index`). A products screen without delete would be the odd one out.
3. The prototype's own list row carries a `icon-btn--danger` delete action.
4. PRD §2.2's category block requires an administrator to *"reassign those products' category before
   it can be deleted"*, and 0025's scope fence explicitly says the reassign-or-delete work happens on
   **this** screen. Without delete, a category blocked by a single obsolete product has no remedy
   anywhere in the product.

Shape: a `flux:modal` confirmation naming the target, mirroring `Users\Index` and 0025 exactly —
including `#[Locked] $deletingProductId` re-read with `findOrFail()`, and `closeDeleteModal()`
clearing the error bag (0025 **R-6**'s stale-error trap applies verbatim).

### D-4 — The list query: explicit columns, two eager loads, and real pagination

```php
Product::query()
    ->select(['id', 'product_category_id', 'featured_media_id', 'name', 'sku',
              'type', 'status', 'price', 'stock', 'created_at'])   // NEVER description — 0024 R-9
    ->with([
        'category:id,name',
        'featuredImage:id,title,path,webp_path,avif_path',          // 0019's real columns — D-17
    ])
    ->orderBy('name')
    ->orderBy('id')
    ->paginate(25);
```

- **`description` is excluded deliberately.** 0024 **D-4** records that a short `MEDIUMTEXT` stays
  inline in InnoDB DYNAMIC and fattens the clustered index; **R-9** makes avoiding `SELECT *` this
  story's inherited obligation. Nothing on the list renders it.
- **Pagination is a divergence from `Users\Index` and `ProductCategories\Index`, both unpaginated, and
  it is deliberate.** Those two are bounded lookup tables (a backoffice's users, a handful of
  categories); `products` is the first table in this application with no natural size bound. Adding
  `WithPagination` later changes the component's public surface (`array` → `LengthAwarePaginator`) and
  every test written against it, whereas shipping it now costs one trait and one method call. Page
  size is a single constant — see [OQ-8](#open-questions).
- **`orderBy('name')->orderBy('id')`** — the `id` tiebreak costs nothing and, with UUIDv7, is a
  meaningful creation-order tiebreak. Without it, two products sharing a name (permitted — only `sku`
  is unique) reshuffle between pages, which is worse under pagination than without it.
- **No search and no filter in this story.** The prototype has none and the PRD asks for none. Raised
  as [OQ-4](#open-questions) because pagination without search becomes uncomfortable past a few
  hundred products.

### D-5 — Three `<select>`s, three different answers to the null-desync trap

[errors-log.md](../../docs/errors-log.md)'s 2026-08-16 entry is the single most relevant prior
incident to this screen: a `null` Livewire property bound to a native `<select>` stringifies to
`"null"`, matches no option, moves `selectedIndex` to `-1`, and the browser then settles on the first
real option — so the user's click on that option produces **no** `change` event and the server never
receives their pick. It reproduces only through genuine interaction, and neither
`Livewire::test()->set()` nor a scripted `selectOption()` helper can see it.

The rule (`a wire:model-bound property must never be null; give it a real empty value in the type the
DOM expects`) applies to all three selects here, but the *right* empty value differs for each:

| Property | Declaration | Why this one |
| --- | --- | --- |
| `$productCategoryId` | `public string $productCategoryId = '';` | Exactly the `$roleId` fix from the original incident. `''` matches the placeholder `<option value="">`. |
| `$status` | `public ProductStatus $status = ProductStatus::Draft;` | A status enum has no empty-string member, and every product has *some* status. `Draft` is chosen because it matches the column default and 0024 **D-6** names it the fail-closed value. |
| `$type` | `public string $type = '';` — **plain string, deliberately NOT `ProductType`** | 0024 **D-5** is categorical: type has *no* legitimate default and *"no fallback type is applied on the product's behalf"*. An enum-typed property is structurally incapable of holding "nothing chosen", so it would force a case to be pre-selected and violate D-5 before the server ever saw a submission. The string is cast with `ProductType::from(...)` **only after** validation passes. |

**Two obvious wrong answers, named so a reviewer recognises them:** typing `$type` as `?ProductType`
(reintroduces the exact `null` the errors-log forbids on a bound select) and typing it `ProductType`
with a default case (silently violates D-5). **Neither fails a `Livewire::test()`.** That is why this
property gets its own browser test driven by real clicks (see the test plan).

**New markup rule this screen establishes:** the type select's placeholder `<option value="">` must
carry **`disabled`** as well as `selected`, so it is genuinely unselectable. Users' `roleId` did not
need this — "no role" is a coherent persisted state there — but "no type" is not a state a product may
ever reach.

### D-6 — The badge reads `displayStatus()`; the `<select>` reads `ProductStatus::cases()`

Two enums, two consumers, and crossing them is the failure mode:

- The **badge** renders `$product->displayStatus()` → `ProductDisplayStatus` (Active / Draft /
  OutOfStock), coloured `lime` / `zinc` / `red` following the Users screen's badge convention.
- The **status control** iterates `ProductStatus::cases()` → Active / Draft, and **never**
  `ProductDisplayStatus::cases()`.

0024 **D-7**'s corollary spells out why: an option that can never be persisted becomes something the
user picks and the server then rejects. Generalised rule for this codebase, worth stating once: **a
computed options list must be typed against the *persisted* enum, never the *display* enum.** The
`EditorRenderingTest` option-set assertion is the regression guard.

**The prototype's status `<select>` contains a third `<option>Agotado</option>`.** That is a
divergence to *not* reproduce, and it is recorded here because it is the exact shape of mistake
someone porting the prototype's markup would make. The string `agotado` appears nowhere in
`ProductStatus` or in `lang/*/products.php`'s `statuses` group.

### D-7 — Stock colour bands, taken from the design reference rather than invented

`docs/arospe-handoff/project/js/productos.js` defines them literally:

```js
function stockClass(n) { return n === 0 ? 'stock-out' : (n < 10 ? 'stock-low' : 'stock-ok'); }
```

So: **`0` → out-of-stock treatment, `1–9` → low, `≥10` → ok.** This matches the PRD caption's own
wording (*"color-coded stock (low / out-of-stock)"*) — exactly two called-out bands plus a normal one.

Adopted as-written rather than guessed, and implemented as a **single named constant** on the
component (not a magic number in Blade), so changing the low-stock threshold is a one-line edit. The
colour treatment is Tailwind utility classes, not the prototype's CSS classes. Recorded as
[OQ-3](#open-questions) for confirmation, since the threshold is a merchandising preference the
prototype merely happens to encode.

*Rejected:* deriving the band from `Product::isOutOfStock()` alone (it answers only the zero case, and
the PRD asks for two bands); putting the threshold in `config/` (nothing else in this app configures a
presentation threshold, and one constant does not justify a config key).

### D-8 — Three `Gallery` instances on one page, and why they cannot collide

The editor page mounts **three** `App\Livewire\Media\Gallery` instances:

| Instance | Embedded by | `multi` | `select-event` | Listener |
| --- | --- | --- | --- | --- |
| Featured image picker | `Editor` (this story) | `false` | `featured-image-selected` (literal) | `Editor::setFeaturedImage()` |
| Gallery strip picker | `Editor` (this story) | `true` | `product-images-added` (literal) | `Editor::addGalleryImages()` |
| WYSIWYG "insert image" | `WysiwygEditor` (0021 **D4**) | `false` | `wysiwyg-image-selected-{componentId}` (**derived** at mount) | `WysiwygEditor::insertImage()` |

**This is safe, and the reason is 0021 D5, not luck.** Livewire registers every `#[On]` listener as a
page-global `window.addEventListener(name, …)`; the event-name string is the *only* thing separating
instances. The two literals here are hand-written and distinct, and 0021's is auto-derived per
instance — so three instances, three distinct names, no cross-wiring. The two literals are exactly the
names 0020 **D2**'s own consumer example writes for this very screen, so they are a published
contract, not a preference.

Consequences the markup must honour:

- **A distinct `wire:key` on every embed** (`featured-image-gallery`, `product-gallery-picker`, and
  0021's own derived key).
- **Both direct embeds sit inside `@can('viewAny', \App\Models\Media::class)`** per 0020 **D12** —
  otherwise a user who can edit products but lacks `media.view` gets the *whole page* 403'd by the
  child's own `Gate::authorize()`. The picker *triggers* are not hidden on that branch: they render
  `disabled` inside an explicit `<flux:tooltip>`, matching the Users list convention.
- **Featured image and gallery strip stay independent**, per 0024 **D-9**: two properties, two
  listeners, no shared state, no auto-add and no auto-remove in either direction. This falls out for
  free from the shape above — the risk is someone "helpfully" adding it later, which is why it has its
  own test at this story's integration layer even though 0024 tests it at the action layer.
- **Every id interpolated into a `wire:*` argument goes through `@js()`** (`removeGalleryImage`,
  `moveGalleryImage*`, `confirmDelete`), unconditionally — the rule does not exempt UUIDs.

### D-9 — The gallery strip's array order **is** its persisted order; reorder ships as buttons ✅

0024 **D-8** / **RQ-7** confirm the gallery has a user-defined order, that `position` ships, and that
**"0027 owns the reorder control"**. Two things follow. The first was a contract question blocking
Phase 3; **it is now answered upstream.**

**(a) `SyncProductGallery` writes `position` from the 0-based array index — confirmed by
[0024 **D-17**](0024-products-core-crud-backend.md) (2026-08-19).** ✅ **Resolved; supersedes the
open-question framing this section previously carried ([OQ-6](#open-questions)).**

0024 **D-8** as originally written said two things that pull in opposite directions — *"assign on
attach as `MAX(position) + 1` scoped to the product"* and *"reorder by rewriting the whole set in one
transaction, never pairwise swaps"* — and nothing said which one the action does, so the reorder
control this story was told to own **was not expressible** through the published signature. 0024's
**D-17** settles it in this story's favour, and states the contract in three rules:

```php
// app/Actions/Products/SyncProductGallery.php — 0024 D-17b, the confirmed signature
/**
 * @param  list<string>  $orderedGalleryMediaIds  The complete, authoritative gallery in display order.
 */
public function __invoke(
    Product $product,
    ?string $featuredMediaId,
    array $orderedGalleryMediaIds,
): void
```

- **The array is authoritative and complete**, never a delta — ids present are the gallery, ids absent
  are detached, exactly like Eloquent's own `sync()`.
- **`position` is the 0-based array index**, contiguous and gap-free, rewritten for *every* surviving
  row on *every* call — not only for the rows whose membership changed.
- **One transaction, one pass** inside the action: detach, attach and the full `position` rewrite. No
  pairwise swaps, no read-modify-write of a `MAX(position)`.

**What this story therefore does, concretely.** `$galleryMediaIds` is passed straight through to
`CreateProduct` / `UpdateProduct` in its current in-memory order — and, per 0024 **D-17a** and its
hand-off item (d), **`SyncProductGallery` is never called from here directly** (see **D-12a**); the
core actions reach it. The action cannot tell a reorder from an add, a removal or a no-op, which is
exactly the property that makes the reorder control expressible with **no** amendment to 0024's code.

Two consequences worth implementing knowingly, both from **D-17**: `position` values are `0..n-1` and
carry no meaning beyond sort order, so nothing here may bookmark or join on one; and duplicate ids in
the submitted array are deduplicated by the action (first occurrence wins), which is a backstop, not a
licence — `addGalleryImages()` still refuses to add an id already in the strip.

**(b) The reorder control ships as per-item "move earlier" / "move later" buttons, not drag.**
This **overrides the `frontend-expert` contribution**, which recommended Livewire 4's `wire:sort` with
a hand-rolled Alpine drag as fallback. `wire:sort` **does** exist in this repo's installed Livewire
(verified: `wire:sort`, `wire:sort:item`, `wire:sort:group`, `wire:sort:config`, `wire:sort:ignore` all
appear in `vendor/livewire/livewire/dist/livewire.js`), so availability is not the objection. Three
things are:

1. **The prototype has no drag at all.** Its strip is a horizontally scrolling carousel with a
   per-item action bar (change / remove) and `‹ ›` navigation buttons. Two more icon buttons in that
   existing bar are visually native to the design; a drag affordance is new UI the design reference
   does not describe.
2. **Drag-only reordering fails WCAG 2.2 SC 2.5.7 (Dragging Movements)**, which requires a
   single-pointer alternative. So a button path has to exist regardless — which makes drag the
   *second* mechanism, not the first.
3. **Drag inside a horizontally scrolling container is the fiddliest possible case** (auto-scroll at
   the edges, pointer capture, touch), and browser tests for it are the flakiest kind. The button path
   is deterministic at the component level and needs no browser test to be trustworthy.

`wire:sort` drag is therefore **deferred as a purely additive enhancement** on top of the button path,
not shipped here. Raised as [OQ-7](#open-questions) in case the product owner wants drag in v1.

**How the buttons work, now that (a) is settled.** `moveGalleryImageEarlier($mediaId)` /
`moveGalleryImageLater($mediaId)` swap the element with its neighbour **in `$galleryMediaIds` (and in
the parallel `$galleryPreviews`) and do nothing else** — no action call, no query, no pivot write, no
`position` arithmetic anywhere in the component. Persistence happens only on `save()`, which
**resubmits the complete reordered array** to `CreateProduct` / `UpdateProduct` on every save, reorder
or not; the action then rewrites every row's `position` from that array's index (0024 **D-17b**).

Three things this rules out explicitly, because each is a plausible-looking wrong turn:

- **No immediate persistence on a button press.** A reorder is not its own save; it is indistinguishable
  from any other unsaved edit until the administrator saves, and abandoning the page discards it.
- **No pairwise `position` swap and no partial array.** The component never sends "B and A traded
  places" — it sends `[B, A, C]`. The control *looks* like a swap; the write never is.
- **No second pivot writer.** The component holds an array of ids and nothing more; every
  `product_media` row is written by `SyncProductGallery` alone (0024 **D-9** / **D-17a**).

### D-10 — Who calls `resolveSelected()`, and why this story calls it directly

The picker is embedded exactly as 0022 **D1**'s consumer example and 0026 both spell out:

```blade
<livewire:components.searchable-multi-select
    :option-resolver="\App\Actions\Products\SearchSalesRegions::class"
    wire:model="regionIds"
    wire:key="product-region-picker"
    field="regionIds"
    :label="__('products.editor.regions_label')"
/>
```

**`Editor::save()` re-resolves the submitted selection itself, and this is mandatory.** This
**overrides the `frontend-expert` contribution**, which leaned toward relying on 0026's validation
rule alone. Three reasons:

1. **0022 D12 says so in terms**: *"The consumer's save path re-checks independently … **This re-check
   is mandatory, not belt-and-braces**"*, because the shell's `$unresolvableSelected` flag is UI state
   and `/livewire/update` is an independent entry point.
2. **The two checks answer different questions.** `Rule::exists('sales_regions','id')->where(active AND
   childless)` asks "is this row present and assignable"; `resolveSelected()` asks "can the resolver
   vouch for this id". Under 0026 **D12** — now shipped, see **D-11** — the *assignable* half of that
   match stops applying to already-assigned ids (they need only still **exist**), which makes
   `resolveSelected()` the sharper of the two guards on exactly the ids the rule relaxes for.
3. **A parent cannot cleanly invoke a child component's method in Livewire 4.** So rather than reaching
   for `assertSelectionResolvable()` across the component boundary, `Editor::save()` takes
   `SearchSalesRegions` as a trailing container-resolved parameter (the per-method action-injection
   convention) and calls `resolveSelected($this->regionIds)` itself, catching
   `UnresolvedSelectionException` and rethrowing as
   `ValidationException::withMessages(['regionIds' => __('products.sales_regions.unresolvable')])`.
   0022 D12 explicitly sanctions this branch: *"`assertSelectionResolvable()` on the shell, **or its
   own `resolveSelected()` call**"*.

**Never `array_intersect()` the submitted ids against the valid ones and proceed with the remainder** —
0022 D12's consumer obligation, stated once so it is copied verbatim rather than re-reasoned.

### D-11 — ✅ The `is_active` validation rule made a legitimately-assigned product unsaveable *(finding raised here; **fixed upstream by 0026 D12 on 2026-08-19**)*

> ✅ **Resolved — jump to [the resolution](#d-11-resolution) for what this story now does.** The
> analysis below is retained as the finding's record; its **options list and the
> [OQ-5](#open-questions) framing are superseded**, not deleted.

**Neither specialist raised this, and it is the sharpest correctness problem in the story.** It is a
conflict between two of 0026's own decisions, which only becomes visible at 0027's composition point.

- **0026 D6** is explicit: *"`is_active` gates **assignment**, not **resolution**. An entry already
  assigned keeps deciding the rate even after it is disabled … letting it retroactively re-tax
  existing products — silently, with no write to the product — would be a change nobody requested."*
- **0026 D7** builds machinery specifically so such an assignment **stays visible**:
  `resolveSelected()` vouches for every currently-assigned id *regardless of `is_active`*, marking it
  `disabled: true` so the administrator can see it and remove it **deliberately**.
- But **0026's `salesRegionIdRules()` applies `is_active = true` inside the `exists` match to every
  element of `salesRegionIds.*`** — and 0027's editor submits the **complete** set, because that is
  what a `wire:model`-bound picker plus `sync()` semantics require.

**Consequence:** an administrator opens a product that was assigned to a region since deactivated,
changes only its price, and saves. Validation refuses the whole request. The product is **unsaveable**
until they remove a region assignment that D6 says must survive — which is precisely the retroactive
re-taxing D6 refuses, now performed manually under duress. 0026's own **R-3** anticipates the
*symptom* ("a spurious rejection … blocking an edit for no legitimate reason") but attributes it to
someone tidying `resolveSelected()` into symmetry; the validation rule reaches the same state with
nobody having made a mistake.

**Options as they stood on 2026-08-18 — superseded 2026-08-19, retained for history.** Option (a) was
recommended and is the one that carried; 0026 **D12** adopted its *intent* but **rejected its
mechanism** (see the resolution below, which is what Phase 3 implements):

- **(a) Validate assignability only against ids that are *not already assigned to this product*
  _(recommended)_.** `Editor::save()` computes the delta server-side from the database
  (`array_diff($this->regionIds, $product->salesRegions->pluck('id')->all())`) and applies
  `salesRegionIdRules()` to the delta, while every submitted id — new or pre-existing — still goes
  through `resolveSelected()` (**D-10**). This is the only option that honours all three of D3
  (nothing newly unassignable can be added), D6 (an existing assignment survives an unrelated edit)
  and D7 (the disabled chip is informative rather than fatal) simultaneously. The delta is computed
  from the database, never from client input, so it cannot be gamed by a payload claiming an id was
  pre-existing. Cost: one documented amendment note on 0026, no change to its shipped code.
- (b) Accept the refusal and make it legible — the chip renders "unavailable", the save is refused
  with a message naming the region and telling the administrator to remove it. Simplest to build, and
  arguably a defensible reading of 0026's **R-8**, but it directly contradicts D6's stated intent.
- (c) Amend 0026's `salesRegionIdRules()` to drop the `is_active` condition, relying on the picker to
  only ever *offer* assignable entries. **Not recommended** — it makes assignability a UI-only rule,
  which is exactly what
  [livewire-authorization.md](../../docs/security/livewire-authorization.md) says a rule must never be.
- (d) Silently drop the disabled id from the submitted set. **Excluded outright** — 0022 D12 and 0026
  D11 both forbid silent narrowing, and the user confirmed that decision on 2026-08-18.

<a id="d-11-resolution"></a>
#### ✅ Resolution — 0026 **D12** and **D13**, 2026-08-19

[0026](0026-product-sales-region-assignment-and-tax-resolution-backend.md) accepted the finding and
amended its own validation rule. **`salesRegionIdRules()` now takes
`array $preservedSalesRegionIds = []`**, and the per-element `exists` match became
**`(is_active AND no children) OR id IN (preserved)`** — one rule, one error bag, the conditions still
inside the match rather than in a follow-up `if`, so a single bad element still fails the whole request
and `SyncProductSalesRegions` is still never invoked (0026 **D11** unchanged).

| Submitted id | Must satisfy | Why |
| --- | --- | --- |
| Already assigned before this request (**preserved**) | the entry still **exists** | it is being *kept*, not chosen — refusing it destroys an assignment nobody touched (0026 **D6**/**D7**) |
| Not previously assigned (**newly added**) | exists **and** `is_active` **and** no children | 0026 **D3** unchanged — nothing newly unassignable can be added, and "España" is still never assignable |

**What `Editor::save()` does, and it is the whole of this story's obligation** (0026 hand-off item 3):

```php
// Editor::save() — read the preserved set from the PERSISTED product, before validating.
// [] on create, which compiles to `or 0 = 1` — i.e. bit-for-bit the pre-D12 strict rule.
$product   = $this->productId === null ? null : Product::findOrFail($this->productId);
$preserved = $product?->salesRegions->pluck('id')->all() ?? [];

$this->validate([
    // ... the core-field rules ...
    'regionIds'   => $this->salesRegionIdsRules(),
    'regionIds.*' => $this->salesRegionIdRules($preserved),
]);
```

Three constraints inherited verbatim from 0026 **D12**, each with a real failure mode:

1. 🔒 **`$preserved` is server-derived, always** — from `$product->salesRegions` (or a direct pivot
   query) for the product *this request is editing*. Taking it from a hidden field, from the picker's
   dehydrated selection, or from any `#[Locked]`-less property lets a caller declare any id
   "already assigned" and **turns the entire `is_active` / no-heading gate off**. 0026's revert-check
   **#11** pins this, and this story's own `AuthorizationTest` re-pins it at the composition layer.
2. **Calling `salesRegionIdRules()` with no argument on an edit re-introduces the exact bug D12 fixed.**
   The default `[]` exists for the *create* path only.
3. **The OR is wrapped in its own nested group inside the rule** — that is 0026's code, not this
   story's, but a reviewer seeing a flattened `orWhereIn` here should know it makes every garbage id
   pass.

**Note the mechanism differs from option (a) as this story phrased it, deliberately.** 0026 explicitly
**rejected** the `array_diff($submitted, $current)` delta with two validation passes: it is the same
rule, but it splits one field across two `validate()` calls with two error bags, so `regionIds.*`'s
per-element message indices stop lining up with the submitted array — and 0026 **D11** requires the
refusal to *name the offending id*. **Do not reach for the delta form**; it is recorded as rejected in
0026 precisely because it is the shape a reviewer will reach for.

**Unchanged by this resolution:** the mandatory consumer-side `resolveSelected()` call (**D-10**) still
runs on **every** submitted id, preserved ones included. It is what catches a pre-existing id whose row
was **deleted outright** — the case the relaxed branch deliberately no longer covers by itself.

### D-12 — Save composition: who calls what, in one transaction, then redirect

**(a) `Editor::save()` does *not* call `SyncProductGallery`.** 0024's own file table says
`CreateProduct` *"delegates imagery to `SyncProductGallery`"*, and 0024 **D-9** names that action the
**single writer** of `featured_media_id` and the pivot, shared by Create and Update *"so the diff
exists once"*. 0026's prose ("0027 wires this one in … exactly as it wires in `SyncProductGallery`")
is loose on this point; **0024 is authoritative about its own actions**. So the editor passes
`featuredMediaId` and the ordered `galleryMediaIds` **into** `CreateProduct` / `UpdateProduct`, and
calls `SyncProductSalesRegions` itself. Calling `SyncProductGallery` directly as well would
double-sync; calling neither would silently drop the imagery. Pinned here because both mistakes are
one-line and neither errors.

> ✅ **Confirmed 2026-08-19 by both owners.** [0024 **D-17a**](0024-products-core-crud-backend.md)
> declares `SyncProductGallery` *"defined and owned exclusively by story 0024"* and its hand-off item
> (d) instructs this story to *"pass the **ordered** gallery array into `CreateProduct` /
> `UpdateProduct` and **never call `SyncProductGallery` directly**"*.
> [0026 **D14**](0026-product-sales-region-assignment-and-tax-resolution-backend.md) reciprocally
> disclaims it — every remaining mention of the class in 0026 is an analogy or a hand-off sentence
> about what 0027 composes, never a claim of ownership or a call site. The loose prose that produced
> this finding has been reworded in 0026 itself. **This paragraph is no longer an inference; it is the
> published contract.**

**(b) ✅ The whole save is one transaction, and that boundary is *this* story's to own — now
confirmed by both dependencies rather than asserted here.** Raised by this story as a gap; accepted
and formally assigned to 0027 by [0026 **D13**](0026-product-sales-region-assignment-and-tax-resolution-backend.md)
(2026-08-19) as its Definition-of-Done hand-off item 4. 0026 weighed and **rejected** all three
alternative homes for the boundary: inside `SyncProductSalesRegions` (it writes one table and cannot
reach the core-field write), inside `UpdateProduct` (0024 must not learn that a region pivot exists,
and it would invert the dependency), and a new orchestration action in 0026 (it would have to compose
0024's actions, the exact cross-scope reach 0026 refuses). **0027 is the only place all three writers
compose**, so the boundary is unambiguously here.

**The obligation, stated as code:**

```php
// Editor::save() — authorize, then read $preserved, then validate, then resolve, THEN open the
// transaction. A ValidationException must never travel through an open transaction (0026 D13).
Gate::authorize($this->productId === null ? 'create' : 'update', $product ?? Product::class);

$preserved = $product?->salesRegions->pluck('id')->all() ?? [];
$this->validate([/* ... 'regionIds.*' => $this->salesRegionIdRules($preserved) ... */]);
$this->resolveOrFail($searchSalesRegions);            // D-10; rethrows as a ValidationException

DB::transaction(function () use ($create, $update, $syncRegions, $product): void {
    // CreateProduct / UpdateProduct call SyncProductGallery internally (D-12a, 0024 D-17a),
    // so the ordered gallery array is written inside this same boundary.
    $saved = $product === null
        ? $create(/* ..., $this->featuredMediaId, $this->galleryMediaIds */)
        : $update($product, /* ..., $this->featuredMediaId, $this->galleryMediaIds */);

    $syncRegions($saved, $this->regionIds);
});
```

**All three writers are inside it**, which is what both hand-offs require: `CreateProduct` /
`UpdateProduct` (0024), `SyncProductGallery` (0024, reached *through* them — never called directly,
**D-12a**) and `SyncProductSalesRegions` (0026). Without the boundary, a `sync()` that throws after the
core write has committed leaves a renamed product wearing its **old** tax reach — a silently wrong tax
outcome behind a successful-looking save.

**Why nesting is safe.** 0026 **D13** guarantees in return that `SyncProductSalesRegions` opens **no**
transaction of its own and swallows **no** exception, so it cannot commit past a failure. 0024
**D-17b**'s `SyncProductGallery` *does* open one, and that is fine: Laravel turns a nested
`DB::transaction()` into a savepoint rather than an error — but it is emphatically **not** the
guarantee anyone needs, which is why the outer boundary here is not optional.

**Ordering is load-bearing:** authorize → read `$preserved` from the database → validate →
`resolveSelected()` → **open transaction** → create/update (which syncs the gallery) → sync regions.
Everything that can fail on ordinary user input fails **before** a transaction is ever opened.

**(c) A successful save redirects; it never resets the form in place.** `redirect()->route('products.index')`
with a status flash. This is not cosmetic: 0021 **D9** states that a server-side write to the WYSIWYG's
bound `$value` **does not appear in the editor**, because the region is `wire:ignore`d and seeded only
at client initialisation. Blanking `$description` after a create would leave the previous product's
text visibly sitting in the editor. A redirect sidesteps it entirely — and is the third independent
argument for **D-1**'s routed shape.

**(d) A failed save keeps the page and the user's input.** `ValidationException` is what Livewire
already routes into the error bag with no plumbing, which is why 0024 **D-14** chose it for the
category guard and why **D-10** rethrows as one here.

### D-13 — A static notice that formatting is lossy; no dynamic diff warning

0024 **R-16** records that description sanitization is *silently* lossy — a paste from Word loses
formatting with no warning — and flags 0027 as the story that "may want to surface a notice".

**Decision: a static, always-visible helper line under the description field**, e.g.
*"Formatting is limited to the toolbar's options; anything else is removed when the product is
saved."* One translation key, zero mechanism, and it sets the expectation **before** the paste rather
than explaining a surprise afterwards.

*Rejected:* detecting the loss and warning dynamically. It requires comparing pre- and
post-sanitization HTML server-side and round-tripping a diff to the client, for an event that is rare
and non-destructive to anything but formatting — real complexity for a marginal gain, and it would put
a second consumer of the sanitizer's behaviour outside 0024's single call site.

**Scope fence, and it is a security-relevant one:** this screen renders **no product description HTML
at all** — not in the list, not in the editor (the WYSIWYG seeds itself client-side through `@js()`
per 0021 D9). There is no `{!! !!}` anywhere in either view. 0024 **R-12** says the sanitizer is what
*permits* unescaped rendering; this story deliberately does not exercise that permission, and Phase 4
should verify the absence rather than the correctness of an escape.

### D-14 — The harness is retired here, and the retirement is a **test migration** *(confirmed; scope corrected)*

Both source stories name this one as their expiry trigger — 0020 **D16** constraint 4 (*"deleted by
story 0027, which supplies a real host page"*) and 0021 **D13** — and both specialists recommended
acting on it. **Confirmed.** But the `frontend-qa` contribution described the obligation as porting
"two re-entrancy assertions", and **that understates it materially**: 0020's *entire*
`tests/Browser/Media/GalleryTest.php` and 0021's *entire*
`tests/Browser/Components/WysiwygEditorTest.php` are written against the harness URL, because neither
component had any other URL to `visit()`. Deleting the route without migrating them orphans **two
whole browser test files**.

**The migration is feasible, and the real page is a strict superset of the harness.** The harness
embeds two bare `Gallery` instances (one single, one multi, distinct event names) plus a
`WysiwygEditor`; the product editor embeds exactly that shape (**D-8**), with the third gallery living
inside the WYSIWYG. Every harness assertion therefore has a home.

**Itemized plan — all of it inside this story:**

1. Re-point both browser test files' `visit()` from `route('dev.media-gallery-harness')` to
   `route('products.create')`, and their opener clicks from the harness's bare buttons to the editor's
   real "Elegir de la galería" / "Añadir imágenes" / `wysiwyg-insert-image` controls. The
   `data-test` hooks 0020 **D14** and 0021 **D10** already mandate are what make this a selector swap
   rather than a rewrite.
2. **Give the acting user the right permissions.** The harness carried only `auth` + `verified`; the
   real page needs `products.view` **and** `media.view` (0020 **D12**'s `@can` wrapper hides the embed
   otherwise). This is the single likeliest cause of a confusing migration failure.
3. Re-point the **re-entrancy** assertions specifically: 0020's onto the featured-vs-strip pair
   (`featured-image-selected` must not reach `addGalleryImages`, and vice versa), and 0021's onto the
   WYSIWYG's own gallery versus the two direct embeds — a **stronger** proof than the harness gave,
   since 0021 **D5**'s derived event name is now competing with two real literals rather than with a
   second copy of itself.
4. Delete `app/Livewire/Dev/MediaGalleryHarness.php`, its view, the `routes/web.php` gate block, and
   `tests/Feature/Dev/MediaGalleryHarnessRouteTest.php`.
5. Assert the retirement: `Route::has('dev.media-gallery-harness')` is `false`, and
   `grep -r "media-gallery-harness"` over `app/`, `routes/`, `resources/` and `tests/` returns nothing.
6. `docs-keeper` removes the temporary-route entry 0020's Definition of Done added to
   `docs/api/routes.md`.

**Ordering is not optional: steps 1–3 must be green before step 4.** Coverage improves rather than
degrades — the assertions now run against a real embedding, closing exactly the gap 0022's "honest
limitation" note and 0020's own D16 describe.

**Fallback, stated so it is a decision rather than an improvisation:** if the migration cannot be
completed within this story, the harness **stays** and its deletion moves to a named follow-up task.
Deleting it while letting the two files break, or deleting the files with their coverage, is not an
acceptable outcome under any schedule pressure.

### D-15 — Sidebar entry, branching on 0013

Identical to 0025 **D-8** and 0039's own specification, and verified against the repo's *current*
state: `config/modules.php` does not exist, `routes/web.php` carries one hardcoded gated route, and
`resources/views/layouts/app/sidebar.blade.php` is still the static starter-kit list.

- *If [0013](done/0013-sidebar-module-gating-ui.md) has **not** landed (expected):* one
  `<flux:sidebar.item icon="cube" :href="route('products.index')" :current="request()->routeIs('products.*')" wire:navigate>`,
  with a comment noting it is scaffolding 0013's registry will absorb. **Static and ungated** — a
  cosmetic leak only; access is refused by `can:products.view` on the route and re-checked in
  `mount()`, exactly as
  [api/routes.md](../../docs/api/routes.md#usersindex--the-first-permission-gated-route) already
  documents for `users.index`. The caveat is recorded in the docs pass.
- *If 0013 **has** landed:* add a `config/modules.php` entry keyed on `products.view` and do not touch
  `sidebar.blade.php`.

`:current="request()->routeIs('products.*')"` is deliberate — it keeps the nav item highlighted on
`products.create` and `products.edit`, which a bare `routeIs('products.index')` would not.

Placement follows whatever [OQ-1 of 0025](0025-product-categories-ui.md) settled; if a "Catalog"
group has been created by then, Productos and Categorías belong in it together.

### D-16 — Every Flux/Blaze/encoding trap carried forward, plus one new one

All four already-recorded traps recur verbatim on this screen; re-deriving any of them costs a Phase 5
round. From [errors-log.md](../../docs/errors-log.md):

1. **`@js()` on every id in a `wire:*` argument** — unconditional, UUIDs included.
2. **A disabled row action is a written-out `@if`/`@else` with an explicit `<flux:tooltip>` wrapper** —
   never `:tooltip="$cond ? … : null"`, which under `livewire/blaze` renders an empty tooltip bubble on
   every *enabled* row.
3. **`cursor-not-allowed!` goes on that tooltip wrapper, not on the button** — Flux's own
   `disabled:pointer-events-none` removes the button from hit-testing entirely.
4. **No `wire:model`-bound property is ever `null`** (**D-5**).

**New, this screen's own (D-5):** the type select's placeholder must be **`disabled selected`** with
`value=""`, because unlike every previous select in this app there is no coherent state the
placeholder could legitimately persist as.

Also carried: icon-only row actions get an `aria-label` plus a `data-test` hook present on **both**
branches, so a browser test selects a row action identically whether it is enabled or disabled.

### D-17 — The thumbnail renders `<picture>`, over 0019's real column names

0020 **D13** establishes the shape, and the list thumbnail reuses it rather than inventing a second
one:

```blade
<picture>
    <source srcset="{{ $product->featuredImage->avifUrl }}" type="image/avif">
    <source srcset="{{ $product->featuredImage->webpUrl }}" type="image/webp">
    <img src="{{ $product->featuredImage->url }}" alt="{{ $product->featuredImage->title }}" loading="lazy">
</picture>
```

**Correction to the `frontend-expert` contribution, verified against 0019 on disk:** the `media` table's
columns are **`path` / `webp_path` / `avif_path`**, not `url` / `webp_url` / `avif_url`. The
URL-shaped values come from `url()`-style **accessors** 0019 defines. So the eager load selects the
`*_path` columns (plus `id` and `title`) and the Blade reads the accessors — selecting `url` would
fail with an unknown-column error, and selecting only `path` would make the accessors return wrong
values for the two variants. **Reconcile the exact accessor casing against 0019's shipped model in
Phase 3** — 0020 **D13** already flags the same uncertainty for itself.

`loading="lazy"` on a paginated list; no width descriptors, because 0019 generates **format** variants,
not **size** variants.

### D-18 — ✅ The two blocking open questions and the transaction gap are resolved upstream — 2026-08-19

This story's Phase 1 debate produced three findings that it could **not** settle alone, because each
concerned a sibling story's shipped contract. All three were carried to their owners and answered by
amendments dated **2026-08-19**. This entry is the single place a reader can see what changed and what
it costs this story; each is also folded into the decision it belongs to.

| Finding (as raised here) | Answered by | Outcome for this story |
| --- | --- | --- |
| **OQ-5 / D-11 / R-1** — the `is_active` rule makes a legitimately-assigned product unsaveable | [0026 **D12**](0026-product-sales-region-assignment-and-tax-resolution-backend.md) | `salesRegionIdRules(array $preservedSalesRegionIds = [])`; the match becomes `(is_active AND no children) OR id IN (preserved)`. `Editor::save()` reads `$preserved` from the persisted product **before** validating and passes it in. See [the D-11 resolution](#d-11-resolution). |
| **OQ-6 / D-9a / R-2** — is `position` the array index or `MAX(position)+1`? | [0024 **D-17**](0024-products-core-crud-backend.md) | Index, confirmed. `SyncProductGallery(Product, ?string, array $orderedGalleryMediaIds)` takes the **complete, ordered** array and rewrites `position` from its 0-based index in one transaction. The reorder buttons resubmit the full array; **no amendment to 0024's code was needed.** See **D-9a**. |
| **D-12b / R-1's sibling** — nobody owned the transaction across the core write and the region sync | [0026 **D13**](0026-product-sales-region-assignment-and-tax-resolution-backend.md) (+ [0024 **D-17a**](0024-products-core-crud-backend.md) / [0026 **D14**](0026-product-sales-region-assignment-and-tax-resolution-backend.md) on ownership) | **This story owns it, explicitly.** One `DB::transaction()` wraps `CreateProduct`/`UpdateProduct` (which reaches `SyncProductGallery` internally) **and** `SyncProductSalesRegions`, opened after validation and after `resolveSelected()`. See **D-12b**. |

**Superseded framings, marked rather than deleted**, per this project's convention:

- **[OQ-5](#open-questions) and [OQ-6](#open-questions) are no longer open, and no longer block Phase
  3.** Both are struck through in place with a pointer here. The Definition-of-Done bullet requiring
  them to be *"answered before Phase 3 starts"* is likewise marked discharged.
- **D-11's four-option list** (a)–(d) is history. Option (a) carried in *intent*, but 0026 **D12**
  deliberately **rejected its mechanism** — the `array_diff` delta with two validation passes — in
  favour of one rule with a `$preserved` argument, because the delta form splits one field across two
  error bags and breaks the per-element message indices 0026 **D11** needs to name the offending id.
  A reviewer who reaches for `array_diff` here is reaching for a rejected shape.
- **D-9a's "verify against 0024's shipped code, and amend it if append-only"** contingency is void.
  0024's own D-17 chose the index rule for exactly this story's reason, so no sibling file is touched.
- **R-1 and R-2** are downgraded from blocking risks to implementation-discipline notes; both are
  re-stated in their new form in [Risks](#risks).

**What this cost in net new obligation** — three items, all in `Editor::save()` and all listed among
the six inherited obligations above: read `$preserved` server-side, keep `SyncProductGallery` unreached
except through the core actions, and open exactly one `DB::transaction()`. Each is one or two lines,
and each has a named test below.

**What it did *not* change:** the mandatory consumer-side `resolveSelected()` re-check (**D-10**), the
refusal semantics (a single bad id refuses the **whole** save, with zero writes), the ban on silent
narrowing (0022 D12 / 0026 D11), the buttons-not-drag reorder control (**D-9b**), and every scope fence
below.

## Scope fences: what this story must NOT do

- No migration, model, action, policy, enum, factory, seeder, validation rule or permission-catalog
  change. Every one of those is consumed as shipped.
- No variant builder, no attribute-combination UI, no per-variant SKU/price/stock fields (**0031**).
- No product-category CRUD, and specifically **no create-a-category-on-the-fly affordance inside the
  editor** — 0025's own scope fence names this story and forbids it.
- No tax-rate preview, no call to `ResolveProductTaxRate`, no destination picker (0026 backend / Epic 3).
- No media *deletion* control anywhere (0019 **D11** defers it, and 0024 **D-9** makes it a guarded
  feature a future story must build properly).
- No bulk actions, no CSV import/export, no duplicate-product action.
- No `slug`, no SEO fields, no translation scaffolding (Epic 5).
- No `{!! !!}` anywhere in either view (**D-13**).
- No search or filter on the list in this story (**D-4**, [OQ-4](#open-questions)).
- No third status case, no `agotado` string, no stored out-of-stock state — under any circumstance
  (0024 **D-7**).

## Dependencies, findings, risks and open questions

### Verified findings

Executed against this repository on 2026-08-18, during this debate.

- **V-1 — `Route::livewire()` is a plain `Route::get()` macro** onto `LivewirePageController`
  (`vendor/livewire/livewire/src/Mechanisms/HandleRouting/HandleRouting.php:15`), so route parameters
  and route-model binding work exactly as on any GET route. **D-2** relies on this.
- **V-2 — `wire:sort` genuinely exists in this repo's installed Livewire** — `wire:sort`,
  `wire:sort:item`, `wire:sort:group`, `wire:sort:group-id`, `wire:sort:config` and `wire:sort:ignore`
  all appear in `vendor/livewire/livewire/dist/livewire.js`. Availability is therefore **not** the
  reason **D-9** ships buttons instead; the reasons are accessibility, the design reference, and test
  determinism.
- **V-3 — The prototype encodes the stock bands** (`0` / `<10` / else) in
  `docs/arospe-handoff/project/js/productos.js`. **D-7** adopts them rather than inventing thresholds.
- **V-4 — The prototype's editor is a routed-style second screen**, not a modal
  (`data-screen="list"` / `data-screen="edit"` plus a "Volver a productos" back link), with a
  two-column layout. Supports **D-1**.
- **V-5 — The prototype's status `<select>` offers `Agotado`**, which 0024 **D-7** forbids. Recorded in
  **D-6** as a divergence to not reproduce.
- **V-6 — The prototype's gallery strip has no drag-reorder** — a scrolling carousel with per-item
  change/remove and `‹ ›` navigation. Supports **D-9(b)**.
- **V-7 — `media`'s columns are `path`/`webp_path`/`avif_path`**, not `*_url` (0019's schema table).
  Corrects the `frontend-expert` contribution; see **D-17**.
- **V-8 — The sidebar is still the static starter-kit list** and `config/modules.php` does not exist,
  so **D-15**'s "0013 has not landed" branch is the live one today.
- **V-9 — Nothing in this story's dependency chain exists in code yet.** `app/Livewire/` holds only
  `Actions/`, `Settings/`, `Settings/TwoFactor/` and `Users/`; there is no `Products`, `Media`,
  `Components` or `Dev` namespace, and `resources/views/livewire/` holds only `auth/`, `settings/` and
  `users.blade.php`. This story's entire interface contract is **documented, not shipped**.

### Dependencies

Hard and blocking, in required order: **0019 → 0020 → 0021 → 0022 → 0023 → 0024 → 0026 → 0027.**
(0025 is not a blocker, but shipping it first gives the category screen the editor's empty-catalog
link a destination — see [OQ-1](#open-questions).)

Already-shipped work this relies on: the seeded `products.*` permissions (0002), the `Gate::before`
Super Admin bypass and policy auto-discovery (0004), the Users screen's list+modal+per-row-hint pattern
(0006), and the wired-up browser suite (0006b).

Optional interaction: **0013** changes *which file* the sidebar entry goes in (**D-15**), blocking
nothing either way.

### Risks

- **R-1 — ✅ *Closed 2026-08-19* — The `is_active` unsaveable-product conflict (D-11).** Was the
  highest risk in the story and the only one that could produce a genuinely stuck administrator. Fixed
  at the source by 0026 **D12**. **What survives as a live risk is narrower and purely local:**
  `salesRegionIdRules()` is called *without* its `$preserved` argument on the edit path (re-creating
  the original bug), or *with* a client-supplied array (turning the `is_active` gate off entirely,
  which is worse). Both are one-line mistakes, neither errors, and both have a named test.
- **R-2 — ✅ *Closed 2026-08-19* — `SyncProductGallery`'s position semantics (D-9a).** 0024 **D-17b**
  confirms the 0-based array index, so the reorder control is expressible and **no sibling file is
  amended**. **What survives:** persisting on each button press instead of on save, sending a partial
  array, or a second writer touching `product_media` — each of which quietly breaks the full-rewrite
  contract rather than failing loudly.
- **R-2b — The transaction boundary is a hand-off, and hand-offs are what get dropped** (0026
  **D13**'s own **R-10**, inherited here as the owner). Nothing in 0024's or 0026's code fails if
  `save()` simply never opens a `DB::transaction()`; both actions work perfectly in isolation and the
  happy path is identical. The only thing that catches its absence is the deliberate mid-save failure
  test in `EditorTest.php` — and only because it asserts on all four writes, not just the product row.
- **R-3 — The `type` select's null-desync.** The single likeliest *silent* bug on this screen. It
  passes every `Livewire::test()` and every scripted `selectOption()` browser helper; only a real
  click sequence asserting the **persisted** value catches it. Mitigated by **D-5** plus a named
  browser test, and worse here than in the original incident because `type` has no safe fallback at
  all.
- **R-4 — Harness retirement losing coverage (D-14).** Two whole browser test files depend on a route
  this story deletes. Mitigated by the itemized migration and the "steps 1–3 before step 4" ordering,
  with an explicit fallback.
- **R-5 — `price` is a string, not a float** (0024 **R-4**, 0026 **R-5**). `@property float` and
  `if ($product->price > 100)` both read as correct and both are wrong. It bites the tests too:
  `toBe('119.95')`, with quotes.
- **R-6 — Four hand-rolled JS surfaces running together for the first time.** The featured gallery, the
  strip gallery, the WYSIWYG's internal gallery and the region picker's debounced search were each
  tested in isolation by their own story, and none of them against the others. This is precisely why
  **one comprehensive journey test** is specified instead of several isolated ones.
- **R-7 — Three stories write `lang/en|es/products.php`** before this one, and this makes a fourth
  writer (0024 creates; 0025, 0026, 0028 extend). A key missing from `lang/es` renders as its own raw
  key with no error.
- **R-8 — The workflow constraint 0026 R-8 imposes**, now user-visible: an administrator must enable
  and rate-configure a Sales Region before any product can be assigned to it. This screen should make
  that legible rather than surfacing a bare validation error — closely related to **D-11**.
- **R-9 — Modelling this screen too literally on Users.** Two specific over-reaches: a per-row
  authorization *matrix* (`ProductPolicy`'s abilities gate on the actor's module permission, so every
  row answers identically — 0025 **D-5**'s reasoning applies verbatim), and re-running 0024's
  validation suite one layer up.
- **R-10 — CI cannot open a database connection at all** (0024 **V-1**, tracked separately as
  `ci-database-connection-gap.md`). Inherited here at its largest scale, since this is the biggest
  story in the chain and the only one whose closure evidence spans feature *and* browser suites. Not
  this story's bug, but its Full Test Suite Gate evidence can only come from a local run until it is
  fixed.
- **R-11 — The `->ignore()` id becoming client-controlled.** Dropping `#[Locked]`, or assigning the
  raw method argument instead of `$product->id`, silently turns a uniqueness check into a
  rename-any-product primitive. The retarget test is what pins the pair.

### Open questions

Nine were raised. **OQ-5 and OQ-6 were the two blocking ones; both are now ✅ resolved upstream
(2026-08-19) and neither blocks Phase 3** — see **D-18**. **Seven remain open**, all product-level
calls that can be answered any time before the markup is written.

- **✅ OQ-5 — *Resolved 2026-08-19; framing superseded, retained for history.*** ~~How does a save
  behave when the product carries an assignment to a since-deactivated Sales Region?~~
  **Answered by [0026 **D12**](0026-product-sales-region-assignment-and-tax-resolution-backend.md):**
  a *preserved* assignment need only still **exist**; only *newly added* ids face the
  `is_active` + no-children match. Mechanically:
  `salesRegionIdRules(array $preservedSalesRegionIds = [])`, whose per-element `exists` becomes
  `(is_active AND no children) OR id IN (preserved)`, with `$preserved` read **server-side** from the
  persisted product. So the product stays saveable and the deactivated assignment survives, exactly as
  0026's D6/D7 promised. ~~The four options (a)–(d) below D-11~~ are superseded: (a) carried in intent,
  but its `array_diff` two-pass mechanism was explicitly **rejected** by 0026 in favour of the
  single-rule form. See [the D-11 resolution](#d-11-resolution) for this story's obligations.

- **✅ OQ-6 — *Resolved 2026-08-19; framing superseded, retained for history.*** ~~Does
  `SyncProductGallery` write `position` from the array index, or append with `MAX(position)+1`?~~
  **Answered by [0024 **D-17**](0024-products-core-crud-backend.md): the 0-based array index.** The
  signature is confirmed as
  `__invoke(Product $product, ?string $featuredMediaId, array $orderedGalleryMediaIds): void`; the
  array is the complete, authoritative order, `position` is rewritten for every surviving row from its
  index, all in one transaction inside the action. ~~The contingency that this story would have to
  amend 0024's shipped action if it turned out append-only~~ is void — 0024 chose the index rule for
  precisely this story's reason, so **no sibling file is touched**. See **D-9a**.

- **OQ-1 — What does the editor do when the product-category catalog is empty?** A real, reachable
  state: nothing stops an administrator deleting the last *unused* category, after which product
  creation is structurally blocked (`product_category_id` is NOT NULL with an `exists` rule).
  **(a) An inline empty state on the category field explaining the block, with a link to
  `product-categories.index` _(recommended)_** — it explains the dead end and offers the remedy in one
  click, and it respects 0025's fence against an inline category creator. (b) Disable the "Nuevo
  producto" button on the list with a tooltip. (c) Say nothing and let the `required` message speak —
  rejected as a recommendation; "The product category id field is required" in front of an empty
  dropdown is a dead end with no way out.

- **OQ-2 — What does a list row show when a product has no featured image?** `featured_media_id` is
  nullable, so this is common for drafts. **(a) A neutral placeholder tile — a muted box with a Flux
  image icon _(recommended)_**, matching the prototype's own `featured-pick` empty affordance and
  keeping row heights uniform. (b) Render nothing and let the cell collapse. (c) A generated
  initials/colour tile like the Users avatar.

- **OQ-3 — Confirm the stock colour bands** (**D-7**): out at `0`, low at `1–9`, ok at `≥10`, taken
  from the prototype's own `stockClass()`. Recommended as-is; it is a single constant if a different
  low-stock threshold is wanted.

- **OQ-4 — Does the list need a search box or filters?** **(a) Not in this story _(recommended)_** —
  the PRD asks for none, the prototype has none, and it is purely additive later. (b) Add a debounced
  name/SKU search now, on the grounds that pagination without search becomes uncomfortable past a few
  hundred products. Tied to OQ-8.

- **OQ-7 — Is drag-to-reorder wanted for the gallery strip in v1?** **(a) Buttons only
  _(recommended)_** — see **D-9(b)**: WCAG 2.2 SC 2.5.7 requires a pointer alternative anyway, the
  prototype has no drag, and the button path is deterministic to test. (b) `wire:sort` drag **plus**
  the buttons — genuinely available (V-2), nicer, and additive on top of (a) at any time.

- **OQ-8 — Page size for the products list.** Recommended **25**. Directly related to OQ-4: with
  search, a smaller page is fine; without it, a larger page reduces the number of times an
  administrator pages blindly.

- **OQ-9 — Forward dependency, not blocking: 0029's OQ-3** asks what `products.stock` means once a
  product has variants, and explicitly notes the answer "decides whether 0027's editor should hide the
  product-level stock field once variants exist". Nothing changes here today (variants do not exist,
  and 0031 is not written), but whichever way it lands, **0031** will amend this screen rather than
  this story pre-empting it.

## Provenance

Phase 1 (Three Amigos) debate for Epic 2, run on 2026-08-18 with `frontend-expert` (files and
approach) and `frontend-qa` (test design), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Derived from
[PRD §2.2](../../docs/PRD/PRD.md#22-products) and the
[Design reference](../../docs/PRD/PRD.md#design-reference--the-dashboard-shell) section, and grounded
in full readings of [0019](0019-media-library-upload-and-conversions-backend.md),
[0020](0020-shared-media-gallery-modal-ui.md), [0021](0021-wysiwyg-rich-text-editor-component.md),
[0022](0022-searchable-multi-select-component.md), [0023](0023-product-categories-backend.md),
[0024](0024-products-core-crud-backend.md), [0025](0025-product-categories-ui.md),
[0026](0026-product-sales-region-assignment-and-tax-resolution-backend.md) and
[0029](0029-product-variants-backend.md), with
[0006](done/0006-users-list-editor-ui.md) / `App\Livewire\Users\Index` as the list+row-action pattern
and [0025](0025-product-categories-ui.md) as the most recent sibling screen.

**A note on how this document was produced, recorded because it affects how much weight each part
carries.** An earlier run of this debate collected full contributions from both specialists; that run
was interrupted during synthesis by an infrastructure failure, not a content problem. Both
contributions were carried forward. The coordinator then **re-read every dependency file on disk
after 0022 and 0026 were amended on 2026-08-18**, verified the nine environment findings above
directly, and reconciled the two contributions against the amended contracts — covering the synthesis
and reconciliation role directly rather than re-convening the specialists for it.

**Adopted from `frontend-expert`**, essentially unchanged: the routed-page shape and its reasoning
(**D-1**), the two-component file layout, the composition contracts for all three shared components
(**D-8**, **D-10**), the three-property analysis of the null-select trap and specifically the
plain-string `$type` (**D-5**), the persisted-vs-display enum separation (**D-6**), the explicit-column
list query (**D-4**), the `can:`-not-`permission:` gating, and the Flux/Blaze trap inventory
(**D-16**).

**Adopted from `frontend-qa`**, essentially unchanged: the test-file split, the zero-DB-writes
stale-region test as the story's highest-value assertion, the one-comprehensive-journey browser
strategy and its reasoning (**R-6**), the real-click requirement for the `type` select (**R-3**), the
explicit not-tested-here table, and the insistence that harness retirement is a migration with a plan
rather than a deletion.

**Overridden, with the reasoning recorded in place:**

1. **The reorder mechanism (D-9b).** `frontend-expert` recommended `wire:sort` with a hand-rolled drag
   fallback, flagged for empirical verification. Verification was done (**V-2**: `wire:sort` exists),
   and the recommendation was still overridden — accessibility (WCAG 2.2 SC 2.5.7), the design
   reference (**V-6**), and test determinism all favour buttons, with drag additive later.
2. **`assertSelectionResolvable()` (D-10).** `frontend-expert` leaned toward omitting the consumer-side
   re-check as redundant with 0026's validation rule. Overridden: 0022 D12 calls the re-check
   *mandatory*, the two checks answer different questions, and under **D-11(a)** the resolver call
   becomes the only guard against a deleted pre-existing id. The mechanism is changed too — the Editor
   calls `SearchSalesRegions::resolveSelected()` itself rather than reaching across the component
   boundary.
3. **Media column names (D-17).** `frontend-expert` specified eager-loading
   `featuredImage:id,url,webp_url,avif_url`; 0019's real schema has `path` / `webp_path` /
   `avif_path`, with URLs as accessors (**V-7**). Selecting the named columns would have failed at
   runtime.

**Found during reconciliation, raised by neither specialist:**

4. **The `is_active` unsaveable-product conflict (D-11 / OQ-5)** — the sharpest correctness problem in
   the story, and a genuine conflict between 0026's own D3, D6/D7 and its validation rule that is only
   visible from this story's composition point. ✅ **Accepted and fixed upstream by 0026 D12 on
   2026-08-19**, which cites this story as where the bug was found.
5. **`SyncProductGallery`'s position semantics (D-9a / OQ-6)** — whether the ordered array is
   authoritative or appended, which decides whether the reorder control is expressible at all.
   ✅ **Answered upstream by 0024 D-17 on 2026-08-19**: the 0-based array index, with the ambiguity in
   0024's own D-8 formally superseded there.
6. **The save-composition contract (D-12a)** — 0024 says `CreateProduct`/`UpdateProduct` own the gallery
   sync while 0026's prose implies 0027 calls it; calling it here would double-sync, omitting it would
   drop the imagery, and neither errors. ✅ **Confirmed 2026-08-19 from both sides** — 0024 **D-17a**
   claims exclusive ownership, 0026 **D14** disclaims it and reworded the prose that caused the doubt.
7. **The transaction boundary (D-12b)** — two independent actions now write for one gesture, and
   neither owns the other, so the boundary is this story's to create. ✅ **Formally assigned to this
   story by 0026 D13 on 2026-08-19**, after 0026 weighed and rejected all three alternative homes.
8. **The true scale of the harness migration (D-14)** — two entire browser test files, not two
   assertions.

**Amendment, 2026-08-19.** Findings 4, 5, 6 and 7 were carried to their owning stories and answered
there; this file was amended the same day to fold the concrete mechanisms into **D-9a**, **D-11**,
**D-12a/b** and the new **D-18**, and to mark the superseded open-question framing rather than delete
it. This is the process working as intended: a composition story is the only vantage point from which
these four were visible, and all four were fixed **in the files that own them** rather than worked
around here.

Three positions are treated as **settled** and are recorded with their reasoning so Phase 2 does not
re-litigate them: the routed-page editor (**D-1**), harness retirement in this story's Definition of
Done (**D-14**), and delete being in scope (**D-3**). Three questions are deliberately left **open for
a human**, because they are merchandising/UX calls rather than engineering ones: the empty-category
dead end (**OQ-1**), the missing-thumbnail placeholder (**OQ-2**) and the stock bands (**OQ-3**) — the
last of which now at least has a grounded default from the design reference rather than a guess.
