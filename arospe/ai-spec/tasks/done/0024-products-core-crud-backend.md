# [0024] Products — core CRUD backend (schema, model, actions, policy)

> **This file was split on 2026-09-01, after a Phase 2 INVEST FAIL.** It previously carried three
> deliverables. Two are now their own stories, and this file is the **core** one:
>
> | Story | Deliverable | Depends on |
> | --- | --- | --- |
> | **0024** (this file) | `products` + `product_media` schema, three enums, `Product` + factory, `ProductValidationRules`, the four `app/Actions/Products/` actions, `ProductPolicy` | 0019 ✅, 0023 ✅ |
> | [**0024a**](0024a-product-description-html-sanitization.md) | `symfony/html-sanitizer`, `config/html-sanitizer.php`, `SanitizeProductDescription`, the sanitize-on-write wiring and its security-critical test file | **0024** |
> | [**0024b**](0024b-product-category-in-use-delete-guard.md) | the retrofit to 0023's `DeleteProductCategory`, `ProductCategory::products()`, the `categories.delete_blocked` key | **0024** (needs `products.product_category_id`) |
>
> **Decision, risk and question numbering is deliberately unchanged**, because ~30 sibling story files
> cite `0024 D-5`, `0024 D-11`, `0024 D-17b`, `0024 R-4`, `0024 R-9`, `0024 RQ-4` and so on by number.
> The entries that moved (**D-14**, **D-16**, **R-11**, **R-14**, **R-16**, **RQ-1**) are left here as
> one-line forwarding stubs rather than deleted, so an old citation still lands somewhere true.
>
> **Four claims this file previously made are corrected below rather than silently dropped** — see
> [Corrections made at the split](#corrections-made-at-the-split-2026-09-01). One of them reverses a
> decision (**D-15** / **RQ-10**).

## Description

Introduce `products` as a first-class Epic 2 entity: a new `products` table (UUID v7 primary key per
[ADR 0001](../../../docs/decisions/0001-uuid-primary-keys.md)) plus its `product_media` gallery pivot,
the `App\Models\Product` model, three backing enums, shared name/SKU/price validation, the
create / update / delete / gallery-sync domain actions, and `App\Policies\ProductPolicy` — which the
actions themselves authorize against.

It is **backend only** — no screen, no route, no Livewire component; the products list and editor are
the paired story **0027**.

Covers [PRD](../../../docs/PRD/PRD.md#22-products) §2.2's *"Create a product with core fields"* and the
*"another product"* example of *"Scenario Outline: A duplicate SKU is rejected"* — i.e. Products
acceptance criteria 1, 4 (the product-SKU half), 6 and 7. Acceptance criterion 2 (the category
in-use delete block) is [0024b](0024b-product-category-in-use-delete-guard.md)'s.

## Type
backend | fullstack (related_task_id: **0027** — products list/editor UI) | includes database-expert: **yes**

## Three Amigos participants

`product-owner` (lead) + `backend-expert` (files and approach) + `database-expert` (schema, indexes,
FK semantics) + `backend-qa` (test design). All three were convened as subagents and all three
contributions are reflected below, including **three recorded dissents** that remain in this file
(D-3, D-9, D-15 — the fourth, D-4, is also here; the sanitization and category-guard dissents moved
with their stories).

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Product catalog — core fields

  Scenario: Create a product with core fields
    Given a catalog administrator, with the product category "Calzado" in the catalog
    When they create a product with a name, a unique SKU, that category, a product type,
      an EUR price, stock, a status, a description and a featured image
    Then the product is saved in the catalog carrying every one of those values

  Scenario: A product is saved as a draft when no status is given
    Given a catalog administrator
    When they create a product without choosing a status
    Then the product is saved as a draft, never as active

  Scenario: A product without a product type is refused
    Given a catalog administrator
    When they create a product without choosing physical or virtual
    Then the creation is refused with a validation message
    And no product is added to the catalog
    And no fallback type is applied on the product's behalf

  Scenario: A product must belong to a product category
    Given a catalog administrator
    When they create a product without choosing a category
    Then the creation is refused with a validation message

  Scenario: A product referencing an unknown category is refused
    Given a catalog administrator
    When they create a product against a category that is not in the catalog
    Then the creation is refused with a validation message

  Scenario: A product referencing an unknown image is refused
    Given a catalog administrator
    When they create a product whose featured image is not in the media library
    Then the creation is refused with a validation message

  Scenario: Editing a product changes its stored values
    Given a catalog administrator, with an existing product "Runner Pro"
    When they rename it to "Runner Pro II"
    Then the product is shown as "Runner Pro II" wherever it is used

  Scenario: Deleting a product removes it from the catalog
    Given a catalog administrator, with an existing product "Runner Pro"
    When they delete that product
    Then "Runner Pro" is removed from the product catalog

  Scenario: An administrator without the products permission cannot create a product
    Given a signed-in administrator who does not hold the products create permission
    When they try to create a product
    Then the creation is refused
    And no product is added to the catalog

  Scenario: An administrator without the products permission cannot delete a product
    Given a signed-in administrator who does not hold the products delete permission
    When they try to delete an existing product
    Then the deletion is refused
    And the product is still in the catalog

Feature: Product SKU uniqueness

  Scenario: A duplicate SKU is rejected
    Given a catalog administrator, with an existing product using SKU "RNR-001"
    When they try to save another product with the SKU "RNR-001"
    Then saving is rejected with a validation message
    And the catalog still holds exactly one product with SKU "RNR-001"

  Scenario: A SKU differing only in letter case is treated as the same SKU
    Given a catalog administrator, with an existing product using SKU "RNR-001"
    When they try to save another product with the SKU "rnr-001"
    Then saving is rejected with a validation message

  Scenario: A SKU is stored in its canonical form
    Given a catalog administrator
    When they create a product with the SKU "  rnr-002  "
    Then the product is stored with the SKU "RNR-002"

  Scenario: Saving a product under its own unchanged SKU is accepted
    Given a catalog administrator, with an existing product using SKU "RNR-001"
    When they save that same product with the SKU "RNR-001" unchanged
    Then the save is accepted
    And the product keeps the SKU "RNR-001"

Feature: Out-of-stock is shown, never stored

  Scenario: An active product with no stock is shown as out of stock
    Given a catalog administrator, with an active product whose stock is zero
    When the product's catalog badge is resolved
    Then the badge reads out of stock

  Scenario: Showing a product as out of stock does not change its stored status
    Given a catalog administrator, with an active product whose stock is zero
    When the product's stored status is inspected
    Then it is still active, no out-of-stock state having been written

  Scenario: Restocking a product restores its badge without a status change
    Given a catalog administrator, with an active product whose stock is zero
    When they set that product's stock to 5
    Then the badge reads active
    And the product's stored status was never written during the change

  Scenario: An out-of-stock status cannot be chosen
    Given a catalog administrator
    When they try to save a product with an out-of-stock status
    Then saving is rejected with a validation message

Feature: Product image gallery

  Scenario: A product's gallery keeps the order the administrator gave it
    Given a catalog administrator, with an existing product and three images
    When they save the product with those images in a chosen order
    Then the gallery reads back in exactly that order

  Scenario: Reordering a gallery is an ordinary save
    Given a catalog administrator, with a product whose gallery is ordered A, B, C
    When they save the product with the same three images ordered C, A, B
    Then the gallery reads back as C, A, B

  Scenario: A featured image is not implicitly part of the gallery
    Given a catalog administrator, with a product that has no gallery images
    When they set one of the library's images as that product's featured image
    Then the product's gallery is still empty

  Scenario: An image in use by a product cannot be deleted from the library
    Given a catalog administrator, with an image used as a product's featured image
    When that image row is deleted directly from the database
    Then the database refuses the deletion
    And the image is still in the media library
```

## Files to create/modify

### Migrations

| Path | What & why |
| --- | --- |
| `database/migrations/<ts>_create_products_table.php` | **New.** Greenfield UUID table. Its timestamp must be **strictly later** than 0023's `create_product_categories_table` (`2026_09_01_084836`) and 0019's `create_media_table` (`2026_08_27_120000`), because both FKs are declared inline. |
| `database/migrations/<ts+1>_create_product_media_table.php` | **New.** The gallery pivot; later still, since it FKs into `products`. |

```php
// <ts>_create_products_table.php
Schema::create('products', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('product_category_id')->constrained()->restrictOnDelete();
    $table->string('name', 255);
    $table->string('sku', 64);
    $table->string('type', 20);                                    // NO default — see D-5
    $table->string('status', 20)->default(ProductStatus::Draft->value);
    $table->decimal('price', 10, 2);
    $table->integer('stock')->default(0);                          // signed on purpose — see D-3
    $table->mediumText('description')->nullable();                 // see D-4; sanitized by 0024a
    $table->foreignUuid('featured_media_id')->nullable()->constrained('media')->restrictOnDelete();
    $table->timestamps();

    $table->unique('sku');
});
```

```php
// <ts+1>_create_product_media_table.php
Schema::create('product_media', function (Blueprint $table): void {
    $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
    $table->foreignUuid('media_id')->constrained('media')->restrictOnDelete();
    $table->unsignedInteger('position')->default(0);        // 0-based, written from the array index — D-17

    $table->primary(['product_id', 'media_id']);
});
```

Seven things in those two files are decisions, not defaults, each with its own entry below:
`string('type', 20)` with **no** `->default()` (**D-5**), `->default('draft')` on `status` (**D-6**),
`decimal(10,2)` (**D-2**), signed `integer` on `stock` (**D-3**), `mediumText` on `description`
(**D-4**), the composite-PK pivot with a `position` column (**D-8**), and `restrictOnDelete()` on
**both** media FKs (**D-9** — confirmed, and deliberately not the `nullOnDelete`/`cascadeOnDelete`
pair an earlier draft of this story recommended). `down()` in both files is the exact
`Schema::dropIfExists(...)` inverse, per this repo's `down()`-symmetry rule; because Laravel rolls
back in reverse timestamp order, the pivot drops before `products`, so the pair is genuinely
symmetric.

> **No `$table->index('product_category_id')` and no `$table->index('featured_media_id')`** — let
> `constrained()` supply each FK's index. This is [migrations.md](../../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)'s
> **existing, already-correct rule**, followed rather than established; see **D-10**, which is now a
> one-paragraph "follow the rule" entry rather than the doc correction it used to be.

### Enums — `app/Enums/`

| Path | What & why |
| --- | --- |
| `app/Enums/ProductType.php` | `case Physical = 'physical'; case Virtual = 'virtual';` + `label()` resolving `__('products.types.'.$this->value)`, mirroring `UserStatus::label()`. |
| `app/Enums/ProductStatus.php` | **Exactly two cases** — `case Active = 'active'; case Draft = 'draft';` + `label()`. This is the persisted enum. |
| `app/Enums/ProductDisplayStatus.php` | Three cases (`Active`, `Draft`, `OutOfStock`). **Never persisted, never validated, no column, no cast** — the badge type only. See **D-7**. |

TitleCase keys, lowercase backing values, per project `CLAUDE.md` and
[naming.md](../../../docs/conventions/naming.md#classes).

> **All three enums get `label()` in this story, which is a deliberate departure from
> [naming.md](../../../docs/conventions/naming.md#translation-keys)'s "add `label()` when a second
> consumer appears" rule** — and the reason is that the second consumer is already named and already
> written down: 0027 renders `type` and the badge, and PRD assumption 15's low/zero-stock
> notification reads `displayStatus()`. `SalesRegionKind` correctly declined `label()` because its
> only consumer renders it in one read-only block; these three are rendered by a list, a `<select>`
> and a badge. If Phase 2 disagrees, the fallback is to drop `label()` and keep the copy in 0027's
> own lang group — but then `lang/*/products.php`'s `types`/`statuses` groups move with it.

### Model, factory, validation trait

| Path | What & why |
| --- | --- |
| `app/Models/Product.php` | **New.** `use HasFactory, HasUuids;`, `#[Fillable([...])]`, `casts()`, the `category()` / `featuredImage()` / `gallery()` relations, and `isOutOfStock()` / `displayStatus()`. **No `SoftDeletes`** (**D-12**), no `#[Hidden]` (nothing sensitive). |
| `database/factories/ProductFactory.php` | **New**, via `php artisan make:factory ProductFactory --model=Product --no-interaction`. `product_category_id => ProductCategory::factory()` so a bare `->create()` stands alone; `status => Draft` deliberately matching the column default; `sku` in canonical form. States: `active()`, `draft()`, `outOfStock()`, `physical()`, `virtual()`, `withFeaturedImage()`, `withGallery(int $count)`. |
| `app/Concerns/ProductValidationRules.php` | **New**, `<Noun>ValidationRules` per [naming.md](../../../docs/conventions/naming.md#traits-and-their-methods). Flat and single-concern — it `use`s no other trait. **Every method is entity-prefixed**; see the naming note below and **D-13**. |

> **Naming decision: every method in this trait is entity-prefixed, which is a deliberate, reasoned
> exception to [naming.md](../../../docs/conventions/naming.md#traits-and-their-methods)'s "a
> `<noun>Rules()` method's noun is the **field**, not the model" rule.** Two verified collisions make
> the unprefixed form unusable rather than merely inconsistent: `App\Concerns\ProductCategoryValidationRules::nameRules()`
> and `App\Concerns\ProfileValidationRules::nameRules()` already both exist, and
> `App\Concerns\SalesRegionValidationRules::descriptionRules()` already claims `descriptionRules()`.
> PHP raises a **fatal error** when two traits composed onto one class declare the same method, and
> the obvious future consumer — 0027's editor with a create-a-category-on-the-fly control — composes
> exactly those traits. So the methods are `productNameRules()`, `productSkuRules()`,
> `productCategoryIdRules()`, `productTypeRules()`, `productStatusRules()`, `productPriceRules()`,
> `productStockRules()`, `productDescriptionRules()`, `productFeaturedMediaIdRules()` and
> `productGalleryMediaIdsRules()`, plus the composing `productRules(?string $productId = null)`.
>
> **Prefixed *uniformly*, not selectively** (Phase 2 finding N1 — the earlier draft exempted
> `descriptionRules()`, which is precisely the one that collides today). A blanket "every method in
> this trait carries the entity prefix" is reviewable in one glance; a per-method judgement about
> which names *might* collide with a trait that does not exist yet is not. Every method still ends in
> `Rules`, so the half of the convention that governs discoverability is intact.
>
> **Phase 6 owns recording this**: `naming.md`'s field-not-model rule needs the exception written into
> it, with the collision as the reason, or the next reader reads this trait as a violation.

### Actions — new subfolder `app/Actions/Products/`

Sanctioned by [base-standards.md](../../../docs/conventions/base-standards.md#directory-structure)'s
one-subfolder-per-area rule, same as `app/Actions/Users/`.

| Path | What & why |
| --- | --- |
| `CreateProduct.php` | `__invoke(...): Product`. **Authorizes `create` on `Product::class` as its first statement** (**D-15**). Canonicalises the SKU, validates, builds the row from a **literal whitelist** (never a spread of `$validated`), delegates imagery to `SyncProductGallery`, and catches `QueryException` `23000` → `ValidationException` on `sku` — the `CreateUser` pattern. |
| `UpdateProduct.php` | `__invoke(Product $product, ...): Product`. **Authorizes `update` on `$product` as its first statement.** Same handling, with the uniqueness rule ignoring the target's own id. |
| `DeleteProduct.php` | `__invoke(Product $product): bool` — **authorizes `delete` on `$product`**, then a plain instance `->delete()`. It exists as its own file **specifically so Epic 3's "a product referenced by orders cannot be deleted" guard has one seam to bolt onto**, the same reasoning 0023's D-10 gives for `DeleteProductCategory`. |
| `SyncProductGallery.php` | `__invoke(Product $product, ?string $featuredMediaId, array $orderedGalleryMediaIds): void`. **Defined and owned exclusively by this story.** The **single writer** of `featured_media_id` and of the `product_media` pivot, shared by `CreateProduct` and `UpdateProduct` so the diff exists once. `$orderedGalleryMediaIds` is the **complete, authoritative new order**; `position` is written from the **0-based array index**, never appended. **It deliberately does not authorize** — see **D-15**'s third paragraph for why, which is a real trap and not an omission. See **D-9** (independence + ownership) and **D-17** (the ordering contract). |

**`Update`, not a set of narrow verbs.** 0023's D-2 chose `Rename` because `ProductCategory` has
exactly one mutable field; `Product` has nine, and the PRD's own verb is "create/edit a product". So
`App\Actions\Users\UpdateUser` is the model to copy — the two stories are consistent, not divergent.
*Rejected:* `PublishProduct` / `AdjustStock` / `RepriceProduct` as separate verbs; no PRD scenario
treats any of them as a distinct operation, and 0027's editor would have to fan one form submit out
to four actions.

### Policy

| Path | What & why |
| --- | --- |
| `app/Policies/ProductPolicy.php` | **New.** Four abilities (`viewAny` / `create` / `update` / `delete`), each gating on the already-seeded `products.*` permission named once as a `public const` — the shape [`ProductCategoryPolicy`](../../../app/Policies/ProductCategoryPolicy.php), `SalesRegionPolicy` and `MediaPolicy` already use ([naming.md](../../../docs/conventions/naming.md#permission-names)). Auto-discovered by name; **no `AuthServiceProvider`**. Three of the four have real call sites in this story (**D-15**): `create`, `update` and `delete`. `viewAny` is defined with no caller until 0027's list screen — the same deliberate shape `MediaPolicy` shipped (story 0019: four abilities, two used at ship time), per [authorization.md](../../../docs/architecture/authorization.md)'s "define an ability when you can name what will ask it". This is **not** 0023's zero-call-sites gap, which had no caller for any ability. |

### Translations

| Path | What & why |
| --- | --- |
| `lang/en/products.php` | **New — this story creates the file.** 0023 deliberately created none. Keys owned here: `products.types.*`, `products.statuses.*`, `products.display_statuses.out_of_stock`. |
| `lang/es/products.php` | **New**, key-for-key identical, per [naming.md](../../../docs/conventions/naming.md#translation-keys). |

> ⚠️ **File-ownership hand-off, now three-way.** `lang/en|es/products.php` is **created here** and
> then **extended, never recreated**, by [0024a](0024a-product-description-html-sanitization.md) (no
> keys today, but it is in the same family), [0024b](0024b-product-category-in-use-delete-guard.md)
> (`categories.delete_blocked`), **0026**, **0027** and **0028**. If any of them runs uncoordinated,
> one silently overwrites another's keys — and a key missing from `lang/es` renders as its own raw
> key with no error. This is **R-13**.

### Explicitly **not** touched

`database/seeders/RolePermissionSeeder.php` (the `products.*` permissions are already seeded — 0023
D-8/RQ-1, confirmed; **no catalog growth, unlike 0019**) · `routes/web.php` · `app/Livewire/**` ·
`resources/views/**` · `tests/Browser/**` · `docs/**` (Phase 6) · `composer.json` (no dependency —
that is 0024a's) · `app/Actions/ProductCategories/**` and `app/Models/ProductCategory.php` (0024b's) ·
anything belonging to 0026 (sales regions), 0027 (UI) or 0028–0031 (variants).

## Tests to perform

Backend only — **no browser tests**, since this story ships no screen. Grouped by file; each item
states what it asserts, and the non-obvious ones state **why they can genuinely fail**.

**Unit — `tests/Unit/Enums/ProductStatusTest.php`**
- [ ] `ProductStatus::cases()` is **exactly** `['active', 'draft']`, asserted as an exact array — not
      `toContain`. This is the primary pin on the Phase 0 two-case decision; it goes red the moment
      anyone adds a third case, which `toContain` would not.
- [ ] `tryFrom()` returns `null` for `'agotado'`, `'out_of_stock'`, `'sold_out'`, `'outofstock'`
      (dataset), and `from('agotado')` throws `ValueError`.
- [ ] `label()` resolves **through the translator**, not a hardcoded literal.

**Unit — `tests/Unit/Enums/ProductTypeTest.php`**
- [ ] `ProductType::cases()` is exactly `['physical', 'virtual']`.
- [ ] The enum exposes **no** default-returning helper — the enum-level half of "no silent fallback".

**Unit — `tests/Unit/Concerns/ProductValidationRulesTest.php`** (joins 0023's
`ProductCategoryValidationRulesTest.php` in the same folder)
- [ ] `productRules(null)` marks `name`, `sku`, `product_category_id`, `type`, `price`, `stock` as
      `required`, and **does not** mark `status` required (it has a default).
- [ ] `productRules($id)` threads `$id` into the SKU uniqueness rule's ignore branch and
      `productRules(null)` does not — 0023's **R-7** (asymmetric `$id` threading) applies verbatim.
- [ ] The `price` and `stock` rule sets carry the scale/`min:0` rules the boundary tests derive from.
- [ ] **The collision guard is a real test, not a comment**: a throwaway test class composing
      `ProductValidationRules` with `ProfileValidationRules` **and** `ProductCategoryValidationRules`
      instantiates without a fatal error. This is what pins the entity-prefix decision; without it the
      prefixes read as a style choice and the next author "tidies" one away.

> These assert *rule composition*, one step removed from behaviour. They exist to catch the
> asymmetry class of bug only; every rule's actual effect is re-asserted through the actions below.
> Do not let them substitute for those.

**Feature — `tests/Feature/Models/ProductTest.php`** (mirrors `tests/Feature/Models/UserTest.php`)
- [ ] A factory-created product's `id` is a UUID **v7** string (`Str::isUuid($id, 7)`).
- [ ] Two products created in succession sort lexicographically in creation order.
- [ ] **Column types on round-trip**: `price` is a **`string`** (`toBeString()` *and* `toBe('19.99')`),
      `stock` an `int`, `status` a `ProductStatus`, `type` a `ProductType`. A test asserting only the
      *value* passes against either type and lets the `decimal:2`-returns-a-string drift ship (**R-4**).
- [ ] `#[Fillable]` contains exactly the intended set.
- [ ] `$product->category` resolves, and `$category->products` **excludes** a product in another
      category — the decoy is what makes it non-trivial. *(The `products()` relation itself is
      [0024b](0024b-product-category-in-use-delete-guard.md)'s; until it ships, assert the inverse
      `$product->category` half only and mark the second half as 0024b's.)*
- [ ] The model does **not** use `SoftDeletes` — a regression guard on **D-12**, because adding the
      trait later silently changes both `Rule::unique()` and 0024b's delete-guard count.

**Feature — `tests/Feature/Products/CreateProductTest.php`**
- [ ] Creating with every required field persists exactly one row, each column round-tripping with
      the right value, and populates both timestamps.
- [ ] **Product type is required with no default — three tests, at three layers**, because each
      covers a different place a silent fallback could be introduced:
      (a) the action called without `type` throws `ValidationException` on `type`, zero rows;
      (b) a raw `DB::table('products')->insert([...without type...])` throws `QueryException` — **this
      is the one that survives someone adding a column default later**, where (a) would stay green;
      (c) `(new Product)->type` is `null` (no model-level attribute default).
- [ ] Creating without a status persists `ProductStatus::Draft` — the **observable** outcome,
      layer-agnostic.
- [ ] Creating with `status = Active` **explicitly** persists `active`, asserted with
      `assertDatabaseHas`. If `status` were ever dropped from `#[Fillable]`, `create()` would silently
      discard it and the row would fall back to Draft; nothing else in the suite would notice (**R-5**).
- [ ] Dataset of invalid inputs, each throwing on the named key and writing zero rows: blank name,
      whitespace-only name, over-length name, blank SKU, whitespace-only SKU, missing category,
      invalid type (`'digital'`), invalid status (`'agotado'`), non-numeric price, non-integer stock.
- [ ] Leading/trailing whitespace on `name` and `sku` is **stored trimmed** — assert the exact
      persisted value, not merely "no error" (0023's **R-6** class).
- [ ] Length boundary **pair** for `name` and `sku`: exactly max accepted, max+1 refused, with the
      boundary derived from the same constant the migration uses (**R-7**).

**Feature — `tests/Feature/Products/ProductSkuUniquenessTest.php`** (its own file; the layer
distinction is the whole point)
- [ ] A second product with an existing SKU throws `ValidationException` on `sku` — **not**
      `QueryException` — and the row count stays 1.
- [ ] **The race**: register a `Product::creating` hook inside the test that inserts a colliding row,
      so the collision lands *between* validation and insert. It must surface as `ValidationException`
      on `sku`, never a 500. This drives a real collision through the unique index, as 0023 requires —
      asserting the *outcome*, not the existence of a catch block.
- [ ] **Case-differing SKU — three assertions, because only two of them can fail.** (a) creating
      `'rnr-001'` stores exactly `'RNR-001'`; (b) creating `'rnr-001'` when `'RNR-001'` exists is
      refused; (c) `Validator::make(['sku' => 'rnr-001'], $rules)->fails()` is true, asserted against
      the rule set in isolation. **(b) alone cannot fail** on the engine the suite runs on:
      `utf8mb4_unicode_ci` is case-insensitive, so the index refuses it regardless of what the app
      does. (a) and (c) are what separate app-level canonicalisation from collation.
- [ ] **Whitespace-differing SKU**, same shape — and for the same reason: `utf8mb4_unicode_ci` is a
      PAD SPACE collation, so the refusal half would pass without any trim. The exact-stored-value
      assertion is what actually catches it.
- [ ] **Saving a product under its own unchanged SKU** — written as **three** tests per 0023's R-1
      pattern: (a) the no-op save succeeds; (b) the row is genuinely unchanged; (c) a genuinely free
      SKU is still accepted, as the control that stops a reject-everything rule passing (a) trivially.
      (Lives in `UpdateProductTest.php`; listed here because it belongs to this rule.)

**Feature — `tests/Feature/Products/ProductStockStatusTest.php`** — the "Agotado" invariant
- [ ] Submitting `'agotado'` / `'out_of_stock'` / `'sold_out'` as a status throws `ValidationException`
      on `status`, zero rows (the `Rule::enum` layer); **and** `Product::create(['status' => 'agotado'])`
      throws `ValueError` (the Eloquent cast layer — the path a seeder or console command would take).
- [ ] A raw `DB::table('products')->insert(['status' => 'agotado', …])` **succeeds**, asserted as such.
      A deliberate characterization test: a plain `VARCHAR` accepts it, so this documents that the
      enforcement is app-level and stops a reviewer believing a constraint exists that does not.
- [ ] **The paired assertion, which is what defeats the tautology**: an Active product with `stock = 0`
      yields the out-of-stock badge **and** its stored `status` is still `active`
      (`assertDatabaseHas`). A single assertion on `isOutOfStock()` is just a restatement of
      `stock === 0`; the second assertion is what goes red if anyone implements "Agotado" by writing
      the column.
- [ ] Restocking: after `update(['stock' => 5])` the badge reads active, the stored status is
      unchanged, **and** `wasChanged('status')` is false — plus a `Product::updating` listener
      registered in the test asserting `'status'` is not among `getDirty()`'s keys, which catches a
      side-effect write that happens to land on the same value.
- [ ] A **Draft** product with `stock = 0` reads as **Draft, not out of stock** (**RQ-4**: the
      out-of-stock badge overrides Active only), and its stored status is still `draft`.
- [ ] The threshold boundary: dataset over `stock` = 0 and 1. Negative stock is refused by validation
      (**RQ-3**), so it is covered in `ProductBoundariesTest` rather than here.

**Feature — `tests/Feature/Products/ProductBoundariesTest.php`**
- [ ] `stock = 0` is **accepted** and persists as integer `0` — zero is a legitimate value, not
      "empty", and a loose `filled()`/`required` reading rejects it.
- [ ] `stock = -1` is refused by `ValidationException` on `stock` — asserting the exception *class*
      is what keeps the rule app-level rather than an engine artefact (**D-3**).
- [ ] Dataset pinning which of `'12'` (numeric string) and `12.5` are accepted, with the persisted
      type asserted for the accepted ones.
- [ ] `price = 0` accepted (a free product); `price = -1` refused.
- [ ] `price = '19.999'` against a 2-decimal column — **refused by validation** (**RQ-5**), zero rows.
      If it were allowed to reach the database, MySQL would round it to `20.00` with only a note, so
      the customer is charged a different price than the administrator typed.
- [ ] Maximum boundary pair: `99999999.99` accepted and stored exactly as the string `'99999999.99'`;
      `100000000.00` refused **by validation**, not by a `22003` `QueryException`.
- [ ] `'free'` and `'19,99'` (comma decimal — a genuine input path in a Spanish-language backoffice)
      are refused.

**Feature — `tests/Feature/Products/ProductCategoryAssignmentTest.php`**
- [ ] A nonexistent but well-formed category UUID is refused by `ValidationException` on
      `product_category_id`, zero rows.
- [ ] A **malformed** category id (`'not-a-uuid'`, `''`, an integer) is refused by
      `ValidationException` — not a `QueryException`, not a 500.
- [ ] **The FK is a real constraint**: a raw insert with a random UUID category id throws
      `QueryException`. A deliberate, argued exception to
      [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md)'s "database guarantees" rule —
      here the FK is [0024b](0024b-product-category-in-use-delete-guard.md)'s delete guard's second
      line of defence, and a migration quietly dropping `->constrained()` would remove that backstop
      with nothing else going red. One test, not a suite.

**Feature — `tests/Feature/Products/ProductMediaTest.php`**

Uses `MediaFactory`, which per 0019 **fakes paths without touching disk** — so **no
`Storage::fake('public')` and no file-existence assertions belong here**; asserting a file exists
would be asserting the factory.
- [ ] A nonexistent or malformed `featured_media_id` is refused.
- [ ] `featured_media_id` is nullable: a product saves with none and the accessor returns `null`.
- [ ] Gallery `sync([a, b])` on a product currently holding `[b, c]` leaves exactly `[a, b]` —
      assert the resulting set exactly, not just that `b` is present.
- [ ] Attaching the same media twice yields **one** pivot row (the composite PK).
- [ ] The **same media used by two products**: both keep it, and detaching from product A leaves
      product B's row intact — the shared-library premise of 0019.
- [ ] Setting a featured image creates **no** pivot row (**D-9**: featured and gallery are
      independent) — this must not be left unasserted, or 0027 inherits an ambiguous "remove image".
- [ ] **Gallery order round-trips, and `position` is the array index (D-17).** Four assertions, because
      each pins a different half of the contract and the first two alone would pass against an
      append-only implementation:
      (a) `SyncProductGallery($product, null, [a, b, c])` persists `position` **0, 1, 2** respectively —
      assert the literal pivot values with `assertDatabaseHas`, not merely the read-back order;
      (b) the relationship reads back as `[a, b, c]`;
      (c) **the reorder**: calling the action again on the *same* product with `[c, a, b]` leaves the
      same three pivot rows with `position` **0, 1, 2** now belonging to `c, a, b` — this is the test
      that goes red against `MAX(position) + 1`, and it is the reason D-17 exists;
      (d) **positions stay contiguous after a removal**: syncing `[a, c]` over `[a, b, c]` leaves
      exactly two rows at `position` 0 and 1, with no gap at 1 and no row left at 2.
- [ ] A reorder is **one transaction and one shape of call** — resubmitting an unchanged array is a
      no-op in effect (same rows, same positions), so the action cannot distinguish a reorder from a
      plain re-save. Guards the "0027 just resubmits the array" premise of **D-17**.
- [ ] A duplicated id in the input array yields **one** pivot row and a total order (**D-17**'s
      deduplication rule), never a `23000`.
- [ ] Two rows written by a **raw insert** without explicit positions still come back in a **stable**
      order (the `position, media_id` tiebreak — **R-6**, which the action itself can no longer trigger
      now that every row gets an explicit index).
- [ ] **The media FKs really restrict (`RQ-2`)** — two tests, driven by a raw
      `DB::table('media')->where('id', …)->delete()`, since no application path deletes media today:
      (a) deleting a media row referenced as a product's `featured_media_id` throws `QueryException`
      and the media row survives; (b) the same for a media row referenced by a `product_media` pivot
      row. These are the *only* executable proof of **D-9** in the whole codebase until a media-delete
      story exists, and they are what stops a later migration quietly relaxing the constraint. Same
      argued exception to [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md) as the
      category FK test.
- [ ] The complement, so the restriction is not over-broad: deleting a **product** succeeds and takes
      its `product_media` rows with it (`product_id` still cascades), leaving the `media` rows intact.

**Feature — `tests/Feature/Products/ProductAuthorizationTest.php`** *(new in the split — **D-15**)*

`beforeEach`: `app(PermissionRegistrar::class)->forgetCachedPermissions()` **then**
`$this->seed(RolePermissionSeeder::class)` — the order `UserPolicyTest` / `CreateUserTest` use.
- [ ] Each of the three write actions is refused for an actor lacking its permission, with
      `AuthorizationException` and **zero rows written / the row unchanged** — the state assertion is
      what distinguishes "refused" from "threw after writing".
- [ ] Each is **allowed** for an actor holding it, as the control. Without the allow half, a
      deny-everything implementation passes.
- [ ] A `Super Admin` holding zero permission rows passes all three via `Gate::before`.
- [ ] The refusal is **logged** through `App\Actions\Auth\LogRefusedPrivilegedAttempt`, asserted with
      `Log::spy()` against the **context array** (`target_type: 'product'`), never a rendered string —
      the shape [authorization.md](../../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail)
      requires and `tests/Feature/SalesRegions/RefusalLoggingTest.php` already demonstrates.
- [ ] **`SyncProductGallery` is not independently reachable**: a test asserting that no class under
      `app/` other than `CreateProduct` / `UpdateProduct` references it. This is what makes its
      deliberate lack of a `Gate` call safe rather than an oversight (**D-15**).

**Feature — `tests/Feature/Policies/ProductPolicyTest.php`**
- [ ] Each of `viewAny` / `create` / `update` / `delete` gets **both an allow and a deny** test, per
      [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md)'s authorization rule.
- [ ] A `Super Admin` holding zero permission rows passes every ability via `Gate::before`.
- [ ] **Server-side enforcement**: `Gate::forUser($denied)->authorize('create', Product::class)` throws
      `AuthorizationException` — not merely `allows()` returning false.

**Unit — `tests/Unit/ArchitectureTest.php` (extend)**
- [ ] `App\Models\Product` references no blog-taxonomy namespace — written as **one `expect()` per
      namespace, never `expect([...])`**, because that form is **disjunctive** and this repo has
      already shipped one vacuous arch rule that way (the file carries the comment recording it).
      Same honest caveat 0023 gave: with no blog taxonomy in code, this is a scope fence expressed as
      a test, not a behavioural assertion.

**Explicitly not tested**, per [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md):
`HasUuids` itself, Eloquent timestamps, `Rule::unique`/`Rule::exists`'s generated SQL, the `Storage`
facade, MySQL's own decimal arithmetic; migration `up()`/`down()` mechanics (`RefreshDatabase` proves
every migration runs, and `down()` symmetry is a code-review concern); the `.webp`/`.avif` pipeline
(0019); HTML sanitization ([0024a](0024a-product-description-html-sanitization.md)); the
category-delete block ([0024b](0024b-product-category-in-use-delete-guard.md)); variant SKUs and
attribute combinations (0029); sales-region assignment and tax resolution (0026); any badge markup,
colour or screen (0027). The two FK tests above are argued exceptions, not oversights.

**Test-setup requirements** (carried from `backend-qa`, not optional):
- Flush Spatie's permission cache in `beforeEach` **before** seeding, and **never** between Act and
  Assert — a mid-test flush destroys the test's ability to detect its own bug. Only in files that
  actually test authorization.
- **Every non-authorization test file must `actingAs()` an actor holding the `products.*`
  permissions** — a consequence of **D-15** that did not apply before the split, and the likeliest
  cause of a confusing wave of `AuthorizationException`s on first run. `ProductFactory` does not
  authenticate anybody.
- **Pin the config a test depends on**, including setting it to `null` when "unset" is the assumed
  state ([errors-log.md](../../../docs/errors-log.md), 2026-08-12).
- `ProductFactory` supplies every required column, but **every required-ness / uniqueness / boundary
  test passes its input explicitly to the action** — never as a factory override, or the factory's
  defaults mask the rule under test.
- `fake()->unique()` is a per-instance guard, **not** a database one (0023 **R-5**); a test needing a
  guaranteed collision passes the literal SKU. Also note `fake()->unique()->word()` overflows at
  ~1 000 rows — use `bothify()` or a sequence for SKUs.
- Scaffold with `php artisan make:test --pest Products/CreateProductTest` (the `{name}` argument
  excludes the suite directory).

## Expected outcome

A `products` table exists with a UUID v7 primary key, a globally unique canonical `sku`, a required
category, a required physical/virtual type with **no** default, an EUR `decimal(10,2)` price, stock,
a two-case Active/Draft status defaulting to Draft, a description, an optional featured image and an
ordered gallery pivot into `media` whose order is written by the single `SyncProductGallery` action
from the caller's own array index (**D-17**), which is what makes 0027's reorder control expressible
as an ordinary re-save. A catalog administrator's create / update / delete operations are available
as invokable domain actions with shared, trait-held validation, and **each action authorizes itself
against `ProductPolicy`**, so a future Artisan command, queued job or REST controller inherits the
same refusal the dashboard will get. "Agotado" exists only as a **computed** badge derived from
`stock`, with no column, no enum case, no validation value and no code path that could write it.

Nothing is user-visible yet: the screen that consumes all of this is story 0027. The description
column accepts HTML and **nothing sanitizes it until [0024a](0024a-product-description-html-sanitization.md)
ships** — see that story's own framing, and the scope fence below, for why that is safe in the
interim and what must not happen before it closes.

## Acceptance criteria
- [x] `products` exists with `id` (UUID v7 PK), `product_category_id` (NOT NULL FK,
      `restrictOnDelete`), `name`, `sku` (unique), `type`, `status`, `price`, `stock`, `description`,
      `featured_media_id` (nullable FK into `media`), `created_at`, `updated_at` — and nothing else.
- [x] `product_media` exists with `product_id`, `media_id`, `position` and a composite primary key,
      and neither FK column carries a redundant hand-written index.
- [x] `App\Models\Product` uses `HasUuids`, does **not** use `SoftDeletes`, and casts `type` /
      `status` to their enums and `price` to `decimal:2`.
- [x] A product can be created with all core fields; blank, over-length, malformed and missing-required
      inputs are each refused with a validation message and write no row.
- [x] **Product type is required and has no default at any layer** — migration, model, action
      signature and validation all refuse an omission, and no fallback value is ever applied.
- [x] **`status` has exactly two cases, Active and Draft**, defaults to Draft, and no out-of-stock
      value is accepted by validation, by the enum, or by the model cast.
- [x] **Out-of-stock is computed, never stored**: an Active product with zero stock reports the
      out-of-stock badge while its stored `status` remains `active`, and restocking changes the badge
      without ever writing `status`.
- [x] A duplicate SKU is refused at the **validation** layer, and a duplicate that races past
      validation surfaces as a `ValidationException` rather than a 500; SKUs are stored canonically
      (trimmed, upper-cased), so case- and whitespace-differing SKUs are the same SKU.
- [x] Saving a product under its own unchanged SKU is accepted.
- [x] A featured image and a gallery of images can be attached; both refuse an id absent from `media`;
      the same media may be used by two products; the featured image is **not** implicitly a gallery
      member.
- [x] **`App\Actions\Products\SyncProductGallery` is the only writer of `featured_media_id` and of
      `product_media` anywhere in `app/`** — no Livewire component, controller or sibling action writes
      either, it is defined only here (**D-9**, **D-17a**), and it is reachable only through
      `CreateProduct` / `UpdateProduct` (**D-15**).
- [x] **The gallery's `position` is the caller's 0-based array index** (**D-17b**): the action takes the
      complete, authoritative ordered array, rewrites every surviving row's `position` contiguously from
      `0` in one transaction, and therefore expresses a reorder as an ordinary re-save with no append-only
      path, no pairwise swap and no second pivot writer.
- [x] **A media row cannot be deleted while any product references it** — as its featured image or via
      the gallery pivot — and the database refuses independently of any application check. Deleting a
      **product** still removes its own pivot rows and leaves the `media` rows untouched.
- [x] **`CreateProduct`, `UpdateProduct` and `DeleteProduct` each authorize their own operation**
      against `ProductPolicy` before their first write, refusals route through
      `LogRefusedPrivilegedAttempt` with `target_type: 'product'`, and each has both an allow and a
      deny test (**D-15**).
- [x] Authorization is expressed in `ProductPolicy`, with both an allow and a deny test per ability,
      and **three of its four abilities** (`create`, `update`, `delete`) **have a real call site in
      this story**, with `viewAny` deliberately deferred to 0027's list screen.
- [x] `lang/en/products.php` and `lang/es/products.php` are created key-for-key identical, and no
      user-facing string is hardcoded.
- [x] No route, Livewire component, Blade view, browser test, Composer dependency or
      permission-catalog change is added.

## Definition of Done
- [x] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [x] **All three quality gates run unscoped and each result recorded — including "not run"**, per
      [errors-log.md](../../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26):
      `php artisan test`, `vendor/bin/pint --format agent`, `vendor/bin/phpstan analyse`. Note
      `phpstan.neon` analyses `database/`, so the migration **and the factory** are in scope.

  > **Verification record (Phase 5, `code-reviewer`, re-confirmed by the orchestrator after the F-6 fix, 2026-09-01).** All three gates run unscoped on this host-native worktree (`DB_DATABASE=testing_0024`, and `php -d memory_limit=1G` on the two commands this repo's own [ci/commands.md](../../../docs/testing/ci/commands.md#php-artisan-test-unscoped-on-a-host-native-worktree) documents as fatal at the default 128M here — `vendor/bin/pest` invoked directly rather than `php artisan test`, since a subprocess it shells out to does not inherit the parent's `-d` flag):
  > - **Tests**: `vendor/bin/pest --compact` → 1300 tests, 1296 passed, 3 skipped, **1 failed** — `tests/Browser/Media/GalleryTest.php`'s reopen-leak test, story 0020's own pre-existing, docblock-measured 25–50% flake (confirmed non-deterministic across three independent re-runs in this same session, with zero code touched in between); no failure traces to any file this story added or modified. This matches the accepted-residual precedent stories 0020/0021 already closed on.
  > - **Pint**: `vendor/bin/pint --test --format agent` → passed, 0 files needing changes.
  > - **Larastan** (level 7, `phpstan.neon`): `php -d memory_limit=1G vendor/bin/phpstan analyse` → passed, 0 errors.
- [x] Index reality verified with **`php artisan db:table products`** after migrating — not by reading
      the migration. [errors-log.md](../../../docs/errors-log.md)'s `users_uuid_unique` entry establishes
      that a redundant index is invisible in a migration diff.
- [x] Code reviewed (code-reviewer). Phase 5, 2026-09-01: approved, ready for Phase 6. Two
      non-blocking test-quality nits recorded (N-2, N-3) and fixed in the same pass; one observation
      (N-4) carried forward with no action needed.
- [x] No security findings (appsec-auditor). Point the audit at **D-15** specifically: whether
      `SyncProductGallery`'s deliberate lack of a `Gate` call is genuinely closed by its reachability
      test, and whether the create path's `create`-then-`SyncProductGallery` sequence leaves any write
      unauthorized. **Result**: first round found F-1 (Medium — destructive defaults on
      `UpdateProduct`'s gallery parameters) plus F-2 through F-5 (Low); all five fixed, and a
      re-audit found one further Low (F-6, the same class as F-1 on `UpdateProduct`'s `$description`
      parameter), fixed and verified. Second round: PASS, no further findings.
- [x] Documentation updated (docs-keeper, 2026-09-01). `docs/database/schema.md` gained `products`
      and `product_media` sections (columns/indexes verified with `php artisan db:table` against
      this worktree's `testing_0024` database, not read off the migration), the new
      [Out-of-stock is computed, never stored](../../docs/database/schema.md#out-of-stock-is-computed-never-stored)
      subsection, ER-diagram entities for `PRODUCT_CATEGORIES`/`PRODUCTS`/`PRODUCT_MEDIA`, and a
      correction to `product_categories`' own now-false "no entity in the diagram" claim.
      `docs/decisions/0001-uuid-primary-keys.md` gained **Amendment 3** (Products needed no
      amendment, like Product Categories; `product_media` recorded as falling outside the ADR's
      scope entirely, since it has no surrogate UUID of its own). `docs/database/migrations.md`
      gained a ✅ recording this story's two migrations as the FK-no-hand-written-index rule's third
      and fourth confirming instances. `docs/conventions/base-standards.md`'s UUID-entity blockquote
      and `app/Actions/`/`app/Models/`/`app/Enums/`/`app/Policies/` directory listings all moved, with
      a paragraph distinguishing `SyncProductGallery`'s narrow "collaborator of an already-authorized
      action" shape from `ProductCategories/`'s "no caller exists yet" gap. `docs/conventions/naming.md`
      records the entity-prefix exception to its field-not-model rule (`ProductValidationRules`,
      with the real trait-collision as the ✅/❌ pair) and adds `ProductPolicy` as the permission-name
      convention's fifth follower — while doing so, found and fixed a pre-existing gap where
      `ProductCategoryPolicy` had never been added as a follower since story 0023.
      `docs/architecture/authorization.md` gained a full `ProductPolicy` section (explicitly
      contrasted with `ProductCategoryPolicy`'s zero-call-sites shape) and corrected the policy count
      to six in three places, one of which (`RolePolicy`'s "four policies" note) was already stale
      before this story touched it. `docs/errors-log.md` gained one new entry (thirty-four → thirty-five)
      for the F-1/F-6 pattern — an action's own parameter default reopening the omission ambiguity a
      stricter collaborator (or a full-replace update field) was built to close; the Phase 2 split's
      C-1 reversal was evaluated against the log's existing "unverified claim about the code stood in
      for a fact" family and declined as a third instance of an already-recorded lesson rather than
      logged again. `docs/README.md`'s per-doc summaries and top footer updated to match every change
      above. **One inaccuracy in this file's own D-5/D-7 was found and corrected in place while
      verifying schema.md's claims against the real code**: both said "the action's typed
      non-nullable `ProductType`/`ProductStatus`" parameter is a fourth enforcement layer, but neither
      `CreateProduct` nor `UpdateProduct` types `$type`/`$status` that way — both accept a plain
      `?string` and resolve it themselves via `::from()` immediately after validation. Corrected in
      both D-5 and D-7 with what they used to say, per this project's own convention for a stale
      claim found during a docs pass.
- [x] **Hand-off recorded for story 0027**, now narrower than before the split because the actions
      self-authorize: 0027 must still (a) call `Gate::authorize()` as the first statement of every
      method that mutates *or discloses* — **defence in depth and the honest source of its per-row
      `canEdit`/`canDelete` hints, not a redundancy** ([base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s
      task-0017 blockquote); (b) gate the route with **`can:products.view`, never
      `permission:products.view`**; (c) keep the id fed to `Rule::unique()->ignore()`
      server-authoritative (`#[Locked]`, re-read from the model) — per
      [security/livewire-authorization.md](../../../docs/security/livewire-authorization.md); and (d) pass
      the **ordered** gallery array into `CreateProduct` / `UpdateProduct` and **never call
      `SyncProductGallery` directly** (0027 **D-12a**), the reorder control it owns being expressed
      purely as a reordered array on an ordinary save, per **D-17**.
- [x] **Constraint recorded for story 0029**: variant SKUs must be unique against `products.sku` as
      well as against each other — a second independent `UNIQUE` index does **not** satisfy PRD §2.2's
      Scenario Outline. Whatever mechanism 0029 picks, it must **reuse** this story's SKU
      canonicalisation rather than re-implement it. See **D-11**.
- [x] **Constraint recorded for any future media-delete story** (**D-9**, confirmed): both media FKs
      are `restrictOnDelete`, so a bare `DELETE` on a referenced image fails with a `23000`. That story
      **must** count references across `products.featured_media_id`, `product_media`, and by then
      0029's variants and Epic 4's blog posts, and refuse with a "used by N products" message — the
      same shape [0024b](0024b-product-category-in-use-delete-guard.md) uses for categories. It cannot
      ship a delete without that guard; this is a deliberately accepted cost of the confirmed decision,
      not an oversight.
- [x] **The two follow-on stories are named as blocking their own consumers, not as optional**:
      [0024a](0024a-product-description-html-sanitization.md) blocks **0027** (and 0061/0076/0077/0079),
      and [0024b](0024b-product-category-in-use-delete-guard.md) blocks **0025**. Recording it here is
      what stops this story reading as "products are done".
- [x] Acceptance criteria met.

## Corrections made at the split (2026-09-01)

Recorded rather than silently applied, because three of the four were load-bearing enough that a
reader of a sibling story will have absorbed the wrong version.

| # | What this file said | What is true |
| --- | --- | --- |
| **C-1** | **D-15 / RQ-10**: *"`CreateUser`/`UpdateUser` (verified to contain no `Gate` call) … authorize at the caller"*, so this story's actions must not self-authorize. | **False, and it reverses the decision.** `App\Actions\Users\CreateUser::__invoke()` line 66 is `$this->logRefusedPrivilegedAttempt->authorize('create', User::class);`, and `UpdateUser` self-authorizes four abilities through `authorize()` and logs two further non-`Gate` refusals through `->log()`. The **documented** convention is the opposite of what RQ-10 preserved — [base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers) quotes `CreateUser` as its ✅ example. `backend-qa`'s recorded dissent was right and was overruled on false evidence. **D-15** is rewritten; the actions self-authorize. |
| **C-2** | **V-1 / R-1**: CI cannot open a database connection; `phpunit.xml` never pins `DB_CONNECTION`, `.env.example` selects sqlite, the workflow runs no MySQL service. | **True on 2026-08-18, fixed on 2026-08-26**, by the task this very finding spawned — [`ci-database-connection-gap.md`](../ci-database-connection-gap.md), which records `866/866` passing against real MySQL. Verified at the split: `phpunit.xml:29` sets `DB_CONNECTION=mysql`, `.env.example:28` sets `DB_CONNECTION=mysql`, and `.github/workflows/tests.yml:27-47` runs a `mysql:8.4` service with job-level `DB_CONNECTION`/`DB_DATABASE`. **The dependent claim that 0019's V7 and 0023's R-2 were "wrong about CI" is withdrawn.** This is [the 2026-08-29 errors-log entry](../../../docs/errors-log.md#one-docs-pass-reported-two-gaps-that-were-not-there-both-marked-verified--2026-08-29)'s exact shape — a real finding whose write-up outlived its own fix — and a candidate for that log. |
| **C-3** | **V-6**: *"`app/Models/` holds only `Role.php` and `User.php`; there is no `media` migration, no `Media` model, no `product_categories` migration, no `ProductCategory`."* | **False.** Both [0019](../done/0019-media-library-upload-and-conversions-backend.md) and [0023](../done/0023-product-categories-backend.md) are closed and merged; `app/Models/{Media,ProductCategory}.php`, `database/factories/MediaFactory.php` and both migrations exist. **This story is unblocked**, and R-2's sequencing warning is discharged. |
| **C-4** | **R-8**: *"there is no `trans_choice` precedent anywhere in `lang/` today."* | **False.** `lang/en/roles.php`'s `index.delete_blocked` has used the `|`-delimited plural form since task 0010, with six `trans_choice()` call sites, and [naming.md](../../../docs/conventions/naming.md#translation-keys) has owned the convention since then. The consequence lands in [0024b](0024b-product-category-in-use-delete-guard.md), which now **matches** that precedent's simple `singular|plural` form rather than introducing explicit-range syntax. |

**A fifth finding, outside this file, that the split surfaced and nobody owns yet.**
`app/Actions/ProductCategories/CreateProductCategory.php:36` carries the comment *"matching
`App\Actions\Users\CreateUser`/`UpdateUser`'s caller-authorizes shape"* — the same false premise as
**C-1**, in shipped code rather than a task file, where it will be read as licence by the next author.
It is **not** this story's to fix (0023's actions are 0025's hand-off), and it is recorded here plus in
[0025](../in-progress/0025-product-categories-ui.md)'s risks so it is met as a decision rather than as a silence.

## Documented functional decisions

### D-1 — Domain artifacts only; no Livewire component, route or view

0023's **D-1** precedent applies; 0019's **D10** does not. The distinguishing fact is *why* 0019
shipped a component class: its D10 records that the media gallery is **modal-only with no route**, so
the component class *is* the only server surface any consumer can reach. A product has an ordinary
routed screen coming in **0027**, so no such forcing function exists, and a placeholder component here
would mean registering a `/products` route rendering nothing — which 0006's history shows gets
rewritten wholesale anyway.

**What changed at the split:** this entry used to end by conceding that the story therefore ships *no
enforcement path* for product CRUD. That is no longer true — **D-15** puts the guard in the actions,
so the enforcement path exists on day one and 0027's component is a second layer rather than the only
one.

### D-2 — `price` is `decimal(10,2)`, NOT NULL, and casts to a **string**

**Never `float`.** Binary floating point cannot represent `21.00` or `0.10` exactly, and this value
feeds 0026's tax arithmetic and Epic 3's order-line snapshots — 0016's `rate` reasoning verbatim.

Scale **2** because EUR's minor unit is the cent and the currency is confirmed single (assumption 10).
Precision **10** — ceiling €99,999,999.99 — is a *failure-mode* choice rather than a storage one:
`decimal(8,2)` caps at €999,999.99, a plausible cliff for a B2B line, and it would surface as a MySQL
`22003` (a 500), not a validation message. The ceiling was **derived rather than supplied**, and is
**confirmed acceptable** (**RQ-6**).

**Not nullable — a deliberate divergence from 0016**, where `rate` is nullable because `0.000` is a
legitimate rate and "unconfigured" is a real distinct state. Here there is no unconfigured state, and
`0.00` (a free item) must stay expressible without colliding with "not set".

**Do not write `->unsigned()`**: deprecated on `DECIMAL` since MySQL 8.0.17, *and* ignored entirely by
SQLite — it would be a rule that exists in one environment and not the other. `'min:0'` in validation
is the enforcement.

`'price' => 'decimal:2'` returns a **string**, so `@property string $price`. This is **R-4**, the
likeliest silent bug in the story: `@property float` reads as obviously correct, and
`if ($product->price > 100)` on a cast string is a silent numeric coercion.

### D-3 — `stock` is a **signed** `integer`, NOT NULL, default 0 *(recorded dissent)*

`database-expert` and `backend-expert` disagreed here. **`backend-expert` proposed
`unsignedInteger`**; the decision went to **`database-expert`'s signed `integer`**, on three grounds:

1. An unsigned column turns a future decrement below zero into MySQL `1264 Out of range value` — a
   **500** — instead of a business decision. Nothing decrements stock in this story (Epic 3 does), so
   pinning the invariant into DDL now pre-decides a question that story owns.
2. **SQLite ignores `UNSIGNED` entirely**, so the invariant would be MySQL-only — the same
   one-engine-only class of rule that 0023's R-2 and this story's **D-11** exist to avoid.
3. The app-level `'integer', 'min:0'` rule is required regardless, which makes the DDL half redundant
   rather than defence-in-depth.

`integer` (4 bytes), not `smallInteger`, whose 65 535 ceiling is plausible to hit on a wholesale line.
**NOT NULL with default `0` is load-bearing for the badge**: out-of-stock is `stock <= 0`, and a NULL
would make it undecidable; the default means any path that forgets `stock` reads as out-of-stock,
which is the conservative direction. The model helper is `isOutOfStock(): bool { return $this->stock <= 0; }`
— `<= 0`, not `=== 0`, so a negative value (representable, though refused by validation today) still
reads correctly.

### D-4 — `description` is `mediumText`, nullable *(recorded dissent)*

`database-expert` proposed `text`; **`backend-expert`'s `mediumText` was adopted**, on a concrete
mismatch: `TEXT` is 65 535 **bytes**, while Laravel's `max:` counts **characters** (`mb_strlen`). A
40 000-character Spanish description with accents is ~44 000 bytes and fits, but a `max:65535` rule
against a `TEXT` column is a silent `22001` waiting for the moment 0021's WYSIWYG starts emitting
markup. `MEDIUMTEXT` (16 MB) makes the **validation rule** the binding limit, which is the only
arrangement where an over-long description is a message rather than a database error. The extra byte
of length prefix is irrelevant.

Nullable, because a Draft mid-authoring has none. **No cast** — it is HTML; an `array`/`json` cast
would corrupt it.

**The stored HTML is *not* sanitized by this story.** That is
[0024a](0024a-product-description-html-sanitization.md)'s whole deliverable, and it is what makes the
`max:` rule finally meaningful: once 0024a ships, the rule measures the post-sanitization value. Until
then `productDescriptionRules()`'s `max:65535` measures the submitted value, which is the *stricter*
direction and therefore safe — a description that passes the rule now still passes it after 0024a
inserts the sanitize step ahead of it.

Consequence to implement knowingly (`database-expert`'s point, which stands regardless of the type):
in InnoDB DYNAMIC a short `TEXT`/`MEDIUMTEXT` value stays **inline** and fattens the clustered index —
the exact defect `schema.md` records for `users`' two `TEXT` columns. The mitigation is a query rule,
not a schema one: **0027's products list must select explicit columns, never `SELECT *`** (**R-9**).

### D-5 — Product type is a `string(20)` column + a PHP backed enum, required, with **no default**

**Enum column, not a lookup table.** The distinguishing test is *does behaviour hang off the value?* —
and it does: PRD §3.2 attaches code to each case (a **physical** order resolves its tax Sales Region
from the shipping address; a **virtual** one from the billing address, after an IP-geo match that
flags a mismatch for manual review). A value with a `match` behind it **cannot** be admin-creatable —
a lookup table structurally invites a third row no branch knows how to handle, and the failure is
silent. The contrast inside this very story is instructive: `product_categories` **is** a lookup
table, correctly, because it is admin-CRUD with zero behaviour attached.

Rejected alternatives: a native MySQL `ENUM` (DDL for every new value, ordinal ordering, no SQLite
equivalent — [migrations.md](../../../docs/database/migrations.md#adding-a-column-to-an-existing-table)'s
explicit rule); a `product_types` FK table (a join on every read to make a closed two-member set
"configurable" in a way that would break tax resolution the moment anyone used it); a bare `string()`
(`VARCHAR(255)` for an 8-character token); and a `boolean is_virtual` (unextensible, and it reads
backwards at every call site). Direct precedent: `sales_regions.kind` (0016 D4) and `users.status` —
this project has decided this exact question twice.

**What "no default" actually does**, and why it is safe here:

- The DDL is `` `type` varchar(20) not null `` with **no `DEFAULT`** clause. MySQL runs with
  `'strict' => true` (verified in `config/database.php`), so an `INSERT` omitting `type` raises
  `1364 Field 'type' doesn't have a default value` — loud, at the right place. Without strict mode it
  would silently insert `''` and then blow up at *read* time in the enum cast, far from the cause
  (**R-10**).
- SQLite raises `NOT NULL constraint failed`, so **this rule behaves identically on both engines** —
  unlike `UNSIGNED` or collation. (Note the suite runs on MySQL; this is a property of the rule, not a
  claim that both engines are exercised.)
- **Safe for a greenfield table, unconditionally.** The no-default hazard is exclusively
  `ALTER TABLE ADD COLUMN NOT NULL` against a populated table — precisely why
  `add_status_to_users_table` needed a default *plus* a conditional backfill. `products` starts empty,
  so **no backfill belongs in `up()`**, and applying `migrations.md`'s backfill rule here by reflex
  would mean inventing exactly the default this decision forbids. Record it in the migration so a
  later reader does not "fix" it.

Enforced at four layers: migration (above), `Rule::enum(ProductType::class)` in validation, the model
cast (a hand-written bad value throws `ValueError` on read rather than rendering), and — **corrected
at Phase 6 docs sync, 2026-09-01**: this originally said "the action's typed non-nullable
`ProductType $type` parameter", which does not match what shipped. `CreateProduct`/`UpdateProduct`
both accept a plain `?string $type` (nullable, so validation can run on the raw string first) and
resolve it themselves via `ProductType::from((string) $type)` immediately after `validate()` passes —
a caller reaching that line with anything that is not one of the two real backing values throws
`ValueError` there, which is the fourth layer in practice rather than a typed parameter.

### D-6 — `status` defaults to `'draft'`, and the asymmetry with `type` is deliberate

The default is **confirmed**, but for a sharper reason than "the PRD implies it": the PRD's create
scenario passes a status explicitly, so the default is never exercised by the happy path. It exists
purely as a **fail-closed safety net** for any path that omits it — a factory, a seeder, a future
import — and `draft` is the non-publishing state, so an omission cannot accidentally publish. Same
shape as `users.status` defaulting to `inactive`.

**Why `type` gets no default and `status` does**, stated in the migration as a comment because someone
will try to normalise them: for `type` there is *no* safe fallback — physical and virtual are equally
wrong guesses, so failing loudly is the only correct behaviour. For `status` a conservative value
genuinely exists.

### D-7 — "Agotado" is **computed**, never stored *(confirmed Phase 0 decision — do not reopen)*

`App\Enums\ProductStatus` has **exactly two cases**. Out-of-stock is derived from `stock` at read
time. This section records *why*, at schema level, so the reasoning survives:

1. **It is derived state that would have to be written.** `stock` and `status` would encode one fact
   twice, and every path mutating `stock` would have to rewrite `status` **inside the same
   transaction** or they diverge permanently. No such transaction boundary exists — 0029's variants
   and Epic 3's orders both mutate stock from elsewhere.
2. **It destroys the administrator's own choice.** If a **Draft** product sells out, is it `draft` or
   `agotado`? Publication state and availability are orthogonal axes; one column cannot hold both
   without losing information — and restocking could not know whether to restore `active` or `draft`,
   because that fact is simply gone.
3. **It makes "list the active products" unwritable.** `WHERE status = 'active'` would silently
   exclude out-of-stock actives, so every query becomes `WHERE status IN ('active','agotado')` —
   a longer way of saying the column has two real values.
4. **It is irreversible.** Once rows carry `agotado`, removing the case requires knowing what they
   *were*.

**Four structural layers guarantee it is unsettable**, with no convention or comment doing
load-bearing work: the enum has no such case; `Rule::enum()` refuses a forged payload value (it is
*refused*, not filtered out); `CreateProduct`/`UpdateProduct` resolve their `?string $status`
parameter through `ProductStatus::from($status)` immediately after validation, so a caller reaching
that line with anything other than `null` or one of the two real backing values throws `ValueError`;
and the column cast throws the identical `ValueError` on a hand-written database value read back
later. There is no `agotado` string anywhere in `app/` or in `lang/*/products.php`'s `statuses`
group. **Corrected at Phase 6 docs sync, 2026-09-01**: this originally said "the action signature is
a typed non-nullable `ProductStatus`", which does not match what shipped — see the identical
correction on `type` above for why the parameter is a plain nullable string rather than a typed enum.

**The badge lives on the model**, returning a dedicated never-persisted enum:

```php
// app/Models/Product.php
public function displayStatus(): ProductDisplayStatus
{
    if ($this->status === ProductStatus::Active && $this->isOutOfStock()) {
        return ProductDisplayStatus::OutOfStock;
    }

    return ProductDisplayStatus::from($this->status->value);
}
```

*Rejected:* a method on `ProductStatus` (the enum has no access to `stock`; it would be a static
helper wearing an enum's clothes); a `#[Computed]` property on 0027's component or an `@if` in Blade
(it puts a domain rule in the presentation layer, where the *next* consumer restates it — and PRD
assumption 15 already names a second consumer, the low/zero-stock notification).

**Corollary — do not add `Agotado` to `ProductStatus` even as a display-only case.**
`ProductStatus::cases()` feeds 0027's status `<select>`; a case that can never be persisted becomes an
option the user can pick and the server then rejects, and [errors-log.md](../../../docs/errors-log.md)'s
2026-08-16 entry is a standing reminder of how badly a status `<select>`'s option set bites here.

### D-8 — The gallery pivot is `product_media`, composite-PK, with a `position` column

**Name declared explicitly.** Laravel would derive `media_product` (both basenames snake-cased and
sorted alphabetically). The alphabetical rule exists so both sides *guess* the same name; it is
irrelevant once the name is stated on the relationship, and `product_media` reads correctly for the
only direction anything traverses. This is the same instinct 0019's V8 applies with `#[Table('media')]`.

**No `id`; composite PK `(product_id, media_id)`.** Nothing FKs into a pivot row, so a surrogate key
buys nothing and costs a second index — and the composite PK *is* the "an image cannot appear twice in
one gallery" rule **and** gives the clustered index exactly the shape the only real query needs
(`WHERE product_id = ? ORDER BY position`, one prefix range scan). `product_id` leads because every
read is "this product's gallery"; the reverse lookup is served for free by the FK's own auto-created
index on `media_id`. Precedent: the vendored permission pivots use composite PKs.

**No `timestamps()`** — nothing reads them, and assumption 17 rules out audit trails this phase.

**`position` is needed, and belongs on the pivot.** The PRD editor shows an "image gallery strip",
which is an ordered presentation and an editorial choice. It is not recoverable from anything else:
`media.created_at` is *upload* order, and decisively the **same** media row can sit at different
positions in two different products' galleries. Adopt 0028 D5's rules verbatim, because these are the
ones that bite:

- **Always tiebreak, declared inside the relationship**: `->orderByPivot('position')->orderByPivot('media_id')`.
  With `default(0)`, a bulk multi-select attach leaves every new row at `0`, MySQL returns ties in
  arbitrary order, and the strip visibly reshuffles between page loads (**R-6**).
- ~~Assign on attach as `MAX(position) + 1` scoped to the product, in the same transaction.~~
  **SUPERSEDED by D-17 (2026-08-19).** `position` is written from the caller's **0-based array index**
  on every sync — attach, detach and reorder alike. There is no append-only path.
- **Reorder by rewriting the whole set in one transaction**, never pairwise swaps, which corrupt under
  concurrency. (Retained, and D-17 makes it the *only* write mode.)
- **No unique index on `(product_id, position)`** — it forces every reorder through a temporary value
  or a deferred constraint MySQL 8.4 does not have. **No index on `position`** — it is only ever a
  sort key inside an already-narrow range.

**Confirmed (RQ-7): the gallery has a user-defined order, so `position` ships.** 0027 owns the
reorder *control*; **this story owns the write**, through `SyncProductGallery` and nothing else. The
exact mechanism — the ordered array in, the array index out — is **D-17**.

### D-9 — Featured image and gallery are **independent**; both media FKs `restrictOnDelete` *(confirmed)*

> **Ownership, stated once and unambiguously (clarified 2026-08-19 — see D-17).**
> `App\Actions\Products\SyncProductGallery` is **defined, owned and implemented exclusively by story
> 0024**. It is a product-media-sync action and `product_media` is this story's own table, so this file
> is its single source of truth for signature, semantics and ordering. Other stories **call** it —
> today only through `CreateProduct` / `UpdateProduct`, which 0027 invokes (0027 **D-12a**: the editor
> passes `featuredMediaId` and the ordered `galleryMediaIds` *into* those actions and must **not** call
> `SyncProductGallery` itself, or the sync runs twice). No other story may re-implement it, duplicate
> it, wrap it in a second pivot writer, or redefine its signature; any such text elsewhere is a
> documentation slip to be corrected in that file, never a competing definition. Story 0026 mentions
> `SyncProductGallery` only as a **naming and structural precedent** for its own
> `SyncProductSalesRegions` — that is a citation, not a claim of ownership.

**They are independent, and `SyncProductGallery` does not auto-add the featured image to the gallery.**
Both amigos converged here. They answer different questions ("the one image representing this product
in a list" vs "the images shown on the product"); the prototype models them as two separate controls;
0029's variants inherit the *parent's featured image*, which is a pointer, not set membership; and a
cross-constraint would mean the UI silently repairing the gallery whenever the featured pick changes —
the kind of silent repair that makes a form's saved state differ from what was submitted. *Rejected:*
an `is_featured` boolean on the pivot, which would make "exactly one featured image" a constraint
**MySQL 8.4 cannot express** (no partial indexes — the wall 0016 hit with `is_default`) and turn the
list thumbnail into a join. Consequence to accept: nothing prevents `featured_media_id` pointing at a
media row absent from the gallery. Intentional.

**`constrained('media')` is mandatory, not stylistic.** Laravel infers the parent table from the
column name — verified producing `product_categories` from `product_category_id`, which means
`featured_media_id` would infer **`featured_media`**. It fails at migrate time, but the fix is
non-obvious (**R-3**).

**The FK delete semantics were the debate's sharpest split, and the coordinator confirmed
`restrictOnDelete()` on both** — `products.featured_media_id` **and** `product_media.media_id`.
**An image cannot be deleted while any product references it, as featured or in its gallery.**

This is `backend-expert`'s position, and it is confirmed on the ground that it makes the media library
consistent with **this project's existing house pattern for "you cannot delete something that is in
use"** — the very pattern [0024b](0024b-product-category-in-use-delete-guard.md) implements for product
categories, and which the PRD states for roles, shipping zones and blog categories too. Applying it to
media as well means the backoffice behaves the same way everywhere: the system refuses and tells you
what is using the thing, rather than silently degrading data behind your back. 0019's **D11**
deliberately deferred "what happens to a product pointing at a deleted image" until the product tables
existed — this is that story, and this is the answer.

Recorded for completeness, because it was argued and rejected: `database-expert` proposed
`nullOnDelete` on the featured image and `cascadeOnDelete` on the pivot, on the principle that **a
category is a *classification* whose loss corrupts the product's meaning, while a featured image is
*decoration* whose loss leaves the product semantically intact**. The rejected trade is real and the
next story pays it: a future media-delete feature can no longer ship a bare `DELETE`, because InnoDB
will refuse with an opaque `23000` on every referenced image. That is a **cost accepted deliberately**,
and it converts into a concrete obligation recorded in the Definition of Done.

Note the pivot is symmetric with `products` here, not asymmetric: `restrictOnDelete` refuses the media
delete while the association exists. (`nullOnDelete` was never available on the pivot regardless — the
column is half the primary key.) Deleting a **product** still cascades its own pivot rows away, since
`product_id` keeps `cascadeOnDelete()`; only the `media` side restricts.

**One trap to name explicitly, because it is the exact inverse of 0019's own note.** 0019 records that
`media.uploaded_by → users` uses `nullOnDelete()` that **essentially never fires**, because `users` is
soft-deleted and a soft delete is an `UPDATE`. Here `media` has **no `deleted_at`**, so when media
deletion is eventually implemented as a real `DELETE`, these FKs genuinely **will** fire. The two lines
look identical in a migration and behave oppositely — which is precisely why the restriction must be
tested now (see `ProductMediaTest`), while nothing in the app can yet reach it.

**What the FKs buy today:** their delete behaviour is currently unreachable, since no application path
deletes media. What they buy *now* is the insert/update guarantee that `featured_media_id` and every
pivot row can never point at a nonexistent image — not theoretical, because the featured image is
chosen in a modal that ships an id over the wire as a `wire:click` argument, i.e. a **client-supplied
identifier**, exactly the input class an FK backstops.

### D-10 — FK columns get **no** hand-written index (following the existing rule, not correcting it)

`foreignUuid(...)->constrained()` plus an explicit `$table->index(...)` emits **two** DDL statements on
the same column — verified with a `Blueprint::toSql()` probe against the MySQL grammar
(`ADD CONSTRAINT … FOREIGN KEY` followed by `ADD INDEX products_product_category_id_index`). InnoDB
auto-creates the FK's supporting index when none exists at constraint time, so writing both produces a
redundant index: precisely the `users_uuid_unique` write-amplification debt
[errors-log.md](../../../docs/errors-log.md) already records.

> **Corrected at the split (Phase 2 finding N3).** This entry previously claimed
> [migrations.md](../../../docs/database/migrations.md) *"instructs the opposite and must be corrected in
> Phase 6"*. **It does not.** That page has carried
> [An FK column does not also get an explicit index here](../../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)
> since task 0016, explicitly flagging `create_passkeys_table`'s `$table->index('user_id')` as *"not a
> pattern to copy"*, and story 0019's `create_media_table` is recorded there as the rule's second clean
> instance. So this story **follows** the documented rule; it establishes nothing and corrects nothing.
> The only Phase 6 item left is optional: re-check whether `passkeys` still carries the duplicate index
> that page names, and if so raise it as its own small task rather than folding it in here.

Per the errors-log entry's own rule, **verify with `php artisan db:table products` after migrating,
never by reading the migration** — the migration diff cannot show you an index nobody removed. That is
a Definition-of-Done item.

### D-11 — SKU uniqueness: canonicalise on write, don't compare; global scope; and a constraint on 0029

0023's **D-4** solved category-name uniqueness with a normalised comparison in PHP because the two
engines' collations disagree. **SKU does not need that machinery — its character set lets the problem
be deleted rather than papered over.**

**Canonicalise on write**: `Str::upper(trim($sku))` before validation *and* before persistence (the
same shape as `Users\Index::save()` lowercasing an email, and for the identical reason — normalising
only inside the action would let the uniqueness rule see a still-mixed-case value), plus
`regex:/^[A-Z0-9][A-Z0-9._\/-]*$/` after upper-casing. Then:

- Every stored SKU is already canonical, so a plain `Rule::unique()` **and** the `UNIQUE` index compare
  like-for-like on both engines — no custom rule, no normalising helper.
- The **accent** half becomes moot by construction: no accented character can enter the column, so
  `utf8mb4_unicode_ci`'s accent-insensitivity has nothing to act on. That is the half 0023 had to
  solve with explicit folding.
- **The contrast with category `name` is the reason, and belongs in the story so a reviewer does not
  flag the inconsistency:** you cannot upper-case a human-facing display label — "FOOTWEAR" is not an
  acceptable rendering — so 0023 was forced into the heavier mechanism. A SKU is a machine identifier;
  canonicalising it is the correct model, not a compromise.
- Keep the `23000` → `ValidationException` catch regardless: the index is still the last-word race
  guard, not the definition ([signed-link-verification.md](../../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)).

`string('sku', 64)` with `max:64`, kept **adjacent and cross-referenced** so they cannot drift (0023's
**R-4**). The charset assumption is what the whole simplification rests on — it asserts `abc-1` and
`ABC-1` are the *same* SKU and that no SKU needs `Ñ`, spaces or case-significance — and it is
**confirmed** (**RQ-8**). *Considered and not applied:* declaring the column `ascii_bin` (free
hardening, but SQLite ignores per-column collation, and it would be this schema's first per-column
charset, i.e. a convention decision that does not belong in this story).

**Scope: global and unscoped.** A SKU is a stock-keeping *unit* identifier; scoping it to a category
would let two products share one, destroying its only purpose.

**The part that matters for 0029, and is invisible from inside this story:** PRD §2.2's Scenario
Outline has **two** examples — "another product" **and** "a variant". A `UNIQUE` on `products.sku`
plus an independent `UNIQUE` on `product_variants.sku` gives two separate namespaces and **does not
satisfy that scenario**. Three options were weighed:

| Option | Verdict |
| --- | --- |
| Two tables, each with its own `UNIQUE`, cross-checked in PHP at both call sites | **Rejected as the sole mechanism** — exactly the "a rule enforced only in a component is bypassed by every other call site" failure, with no database backstop for the cross-table half. |
| A shared `skus` registry table both tables FK into | Correct and genuinely enforceable, but a real design with real cost (an insert per product/variant, a delete-cascade story, a join to answer "what owns this SKU"). **It is 0029's decision, not 0024's.** |
| **✅ Ship `unique('sku')` now and record the cross-table requirement as a named constraint on 0029** | The same device 0028 used to pin 0029's `restrictOnDelete()`. |

Put the canonicalisation in `app/Concerns/ProductValidationRules.php` (or a small `Sku` value object)
from day one, so 0029 reuses it rather than re-implementing it — which **RQ-9** confirms it must.

### D-12 — Hard delete; `Product` does not use `SoftDeletes`

Consistent with 0023 D-3 and 0028, but for reasons specific to `products`:

1. **`Rule::unique()` does not apply the soft-delete scope** — verified on `users`, recorded in
   [schema.md](../../../docs/database/schema.md#soft-deletes). A trashed product would **permanently squat
   its SKU**, so re-listing a discontinued line under its own SKU would be refused with nothing in the
   UI able to explain why. A direct, user-visible defect on this story's *central* uniqueness rule.
2. **`users`' reasons do not transfer.** It soft-deletes to retain identity, free an authentication
   identifier and preserve relations that must survive a deleted account. A product has no identity to
   retain and nothing authenticates as one.
3. **The referential argument cuts the other way.** 0029's `product_variants` will `cascadeOnDelete()`
   from `products`, and **a cascade never fires on a soft delete** — so soft-deleting a product would
   leave its variants live and reachable, exactly the "a child could reference a trashed parent"
   defect 0023 D-3 lists.
4. **Future order lines are the one real counter-argument, and they do not need it.** PRD §3.2 already
   specifies that a line item carries *"the price at the time of order"* — order lines **snapshot**
   rather than dereference. The correct shape there is a nullable `product_id` plus denormalised
   `name`/`sku`/`price` on the line, which is required anyway because a product's name and price change
   **without being deleted** — something a soft delete does nothing about.
5. Assumption 17 rules out the audit/recycle-bin class of feature this phase.
6. Adding `SoftDeletes` later is an additive migration; removing it after call sites depend on it is not.

**Settled semantics for 0029 and Epic 3:** *a product delete is a hard delete.* It cascades to
`product_media` and (0029) `product_variants`, and would be blocked by any future `order_lines` FK
choosing `restrictOnDelete`. **Any story needing a product to survive deletion must snapshot, not
soft-delete.**

### D-13 — Validation rules, and the two SKU traps

`ProductValidationRules` composes exactly as `ProfileValidationRules::profileRules()` does, with the
same PHPDoc shape (which already passes Larastan level 7 — copy it verbatim rather than "tidying" it:
`Rule::unique()`/`Rule::exists()` return `Unique`/`Exists`, which are `Stringable` and **not**
`ValidationRule` implementations, so a narrower `array<int, ValidationRule|string>` fails).

Method names are entity-prefixed throughout — see the naming note in
[Files to create/modify](#model-factory-validation-trait). The **field** column below is the payload
key, which is unprefixed.

| Field | Method | Rules |
| --- | --- | --- |
| `name` | `productNameRules()` | `['required', 'string', 'max:255']` |
| `sku` | `productSkuRules(?string $productId = null)` | `['required', 'string', 'max:64', 'regex:/^[A-Z0-9][A-Z0-9._\/-]*$/', Rule::unique(Product::class, 'sku')` (`->ignore($productId)` on the edit path)`]` |
| `product_category_id` | `productCategoryIdRules()` | `['required', 'string', Rule::exists('product_categories', 'id')]` |
| `type` | `productTypeRules()` | `['required', Rule::enum(ProductType::class)]` |
| `status` | `productStatusRules()` | `['nullable', Rule::enum(ProductStatus::class)]` — see the Phase 3 correction note directly below |
| `price` | `productPriceRules()` | `['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99']` |
| `stock` | `productStockRules()` | `['required', 'integer', 'min:0']` |
| `description` | `productDescriptionRules()` | `['nullable', 'string', 'max:65535']` |
| `featured_media_id` | `productFeaturedMediaIdRules()` | `['nullable', 'string', Rule::exists('media', 'id')]` |
| `gallery_media_ids` | `productGalleryMediaIdsRules()` | `['array', 'max:20']`, and `.*` → `['string', 'distinct', Rule::exists('media', 'id')]` |

> **Phase 3 correction (implementation, `backend-expert`).** This table's `status` row originally read
> `['required', Rule::enum(ProductStatus::class)]`, which directly contradicted this story's own
> Gherkin scenario "A product is saved as a draft when no status is given", **D-6** ("the default is a
> fail-closed safety net for any path that omits it"), and the "Tests to perform" checklist's own item
> for `ProductValidationRulesTest.php` ("`productRules(null)` ... **does not** mark `status` required —
> it has a default"). `backend-qa`'s red tests (`ProductValidationRulesTest.php`,
> `CreateProductTest.php`, `ProductStockStatusTest.php`) were written against the Gherkin/D-6 reading,
> not the literal table cell above — implemented to match: `productStatusRules()` is
> `['nullable', Rule::enum(ProductStatus::class)]`, so omitting `status` validates and the action
> defaults it to `ProductStatus::Draft` in PHP, while a present-but-invalid value (`'agotado'` and
> every other out-of-stock spelling) is still refused by `Rule::enum()` regardless of `nullable`. The
> table cell above is corrected in place to match rather than left contradicting the rest of the file.

`'numeric'` alone accepts `1e5` and fifteen decimals, which is why `decimal:0,2` is there. `min:0` on
`stock` is the app-level statement of the invariant **D-3** deliberately kept out of the DDL — without
it a `-1` becomes a SQL error instead of a message. `distinct` refuses the same image twice at the app
layer, with the pivot's composite PK as the database's last word behind it.

**Trap (a) — `->ignore()` on the edit path.** Omitting it makes "save a product without changing its
SKU" fail; 0023 rated the analogous omission its **R-1**, the single most likely bug in that story. It
is **only safe while the id is server-authoritative** — `#[Locked]`, assigned from a value read back
out of the database, never from the method argument. That obligation is 0027's, and it is in the
Definition of Done.

**Trap (b) — the collation divergence** is what **D-11** removes by canonicalising. Note the residual:
the upper-casing must happen **before** `validate()`, not only in the action, or the uniqueness rule
sees a value the database never stores.

**`productDescriptionRules()`'s `max:65535` currently measures the submitted value.**
[0024a](0024a-product-description-html-sanitization.md) inserts the sanitize step **ahead of**
`validate()`, at which point it measures the stored value — its **D-16** constraint 1. Do not "fix"
the ordering here; there is nothing to order yet.

### D-14 — *(moved)* The category-delete guard

**Moved in full to [0024b](0024b-product-category-in-use-delete-guard.md)**, which owns the exact file,
method, guard shape, exception type, error-bag key, `trans_choice` message, the three
no-confirm-and-proceed reasons and the FK reasoning. Nothing about it changed except its home and the
`trans_choice` form (see **C-4**). Cited as `0024 D-14` by 0025, 0029, 0058 and 0061 — those citations
are repointed, and this stub is what catches any that were missed.

### D-15 — The actions **self-authorize**, and `ProductPolicy` ships with real call sites *(REVERSED at the split — see C-1)*

**Ship the policy.** 0028's D6 gated directly on permission names with no policy; that reasoning does
not transfer, for three reasons: (a) **0027 needs a per-row ability object** —
[authorization.md](../../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)
requires the UI hint to come from *the same policy method* the mutating path authorizes against, and
0027 renders per-row edit/delete actions while 0028's screen renders rows that all answer identically;
(b) Epic 2 already has a `ProductCategoryPolicy` (0023 D-9), and two sibling entities in one module
with opposite authorization idioms is a coherence cost; (c) a per-record deletability rule is already
visible — [0024b](0024b-product-category-in-use-delete-guard.md) establishes "cannot be deleted because
N others reference it" for categories, and Epic 3's orders make the identical rule true of products.

**The reversal.** This entry previously said the actions must **not** authorize, "on convention":
*"`CreateUser`/`UpdateUser` (verified to contain no `Gate` call) … authorize at the caller"*. That
premise is false — `CreateUser::__invoke()` opens with
`$this->logRefusedPrivilegedAttempt->authorize('create', User::class);` and `UpdateUser` self-authorizes
four abilities through `authorize()` and logs two further non-`Gate` refusals through `->log()` — and
the real, **documented** convention is the opposite:
[base-standards.md](../../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
states that *"if an operation must not happen without a permission, the check lives in the class that
performs the operation"*, quotes `CreateUser` as its ✅ example, and records task 0017's `SalesRegions`
actions as the case where applying it at Phase 1 cost nothing. **The precise rule, stated narrowly
rather than as a blanket "every action" claim** (verified: `app/Actions/Media/GenerateImageConversions.php`
and `app/Actions/Roles/EnforceGrantorPermissionScope.php` contain no `authorize()` call at all): every
action that **performs an authorizable domain operation** self-authorizes; a collaborator invoked only
by an action that has *already* authorized does not. `GenerateImageConversions` (constructor-injected
into `StoreUploadedImage`, which authorizes `create`) and `EnforceGrantorPermissionScope` (a payload
transformer called from `Roles\Index::saveRole()`, which authorizes first) are the two shipped
precedents for exactly the shape `SyncProductGallery` takes below — it is the **third** instance of
this pattern, not a bespoke exception. `ProductCategories/` (0023) is the **sole, explicitly
flagged exception to the first half** (an action performing a real domain operation with no
authorization at all), recorded as a ⚠️ gap in
[schema.md](../../../docs/database/schema.md#product_categories) — an exception to be discharged by 0025,
not a precedent to copy. **`backend-qa`'s recorded dissent at the original debate was correct**, and
was overruled on false evidence; it is adopted here.

So: **`CreateProduct` authorizes `create` on `Product::class`, `UpdateProduct` authorizes `update` on
`$product`, and `DeleteProduct` authorizes `delete` on `$product`** — each as the action's first
statement, before any transaction opens, through
`App\Actions\Auth\LogRefusedPrivilegedAttempt::authorize(...)` with `targetType: 'product'` passed
explicitly (`resolveTarget()` auto-resolves only `User` and `Role`), per
[the refusal-logging recipe](../../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail).
`LogRefusedPrivilegedAttempt` is **constructor**-injected, per
[code-style.md](../../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)'s
documented exception: `__invoke()`'s parameter list is a public contract these actions' direct-call
tests match verbatim.

**`SyncProductGallery` deliberately authorizes nothing, and it is the third shipped instance of the
narrow rule above, not a bespoke exception.** The reflexive move is to have it authorize `update` on
`$product` — task 0017's *"authorize every row
the operation writes"* rule. It is **wrong here, and would break the create path**: `CreateProduct`
inserts the row and then calls `SyncProductGallery` inside the same transaction, so `update` would be
asked of an actor who legitimately holds `products.create` and may not hold `products.edit` — a
correct create refused halfway through. Nor can it ask `create`, which is meaningless against an
existing row. The resolution is to treat it as what it is: a **collaborator of two actions that have
already authorized**, never an independently-reachable entry point. That is made structural rather than
conventional by three things — its docblock says so, `CreateProduct`/`UpdateProduct` are its only
callers, and `ProductAuthorizationTest` asserts that no other class under `app/` references it. **If a
later story ever calls it directly, that story owns adding the gate**, and this paragraph is what tells
it so. Flagged for Phase 4 in the Definition of Done rather than asserted as settled.

**What must NOT go in the policy: the category in-use guard** ([0024b](0024b-product-category-in-use-delete-guard.md)).
A policy denial renders 403 *unauthorized*, which is a lie there — the actor holds `products.delete`
and the answer is still no.

**What this changes for 0027** (narrower than the pre-split hand-off, not wider): 0027 still calls
`Gate::authorize()` in every mutating and disclosing component method, but now as **defence in depth
and as the honest source of its per-row hints**, not as the only enforcement. A reviewer who deletes
one of the two layers has removed a layer, not a redundancy.

### D-16 — *(moved)* `description` HTML sanitization

**Moved in full to [0024a](0024a-product-description-html-sanitization.md)**, which owns the package
choice (`symfony/html-sanitizer`, with `mews/purifier` / `stevebauman/purify` considered and rejected),
the allow-list table, `config/html-sanitizer.php`, `SanitizeProductDescription`, the three
implementation constraints (sanitize-before-length, idempotence, lossiness) and the security-critical
test file. Cited as `0024 D-16` by 0027, 0029, 0061, 0076, 0077, 0079 and done/0021 — those citations
are repointed, and this stub is what catches any that were missed.

### D-17 — `SyncProductGallery` is owned here, and `position` is the caller's array index *(clarified 2026-08-19)*

**Why this entry exists.** Story **0027**'s own Three Amigos debate (its **D-9a** / **OQ-6**, raised as
its **R-2**) found two real ambiguities in this file that only became visible at 0027's composition
point, and both are 0024's to answer because both concern 0024's own action and 0024's own table:

1. **Who owns `SyncProductGallery`?** 0026 names it in prose while describing its own
   `SyncProductSalesRegions`, which reads — to a story trying to wire a screen — as though ownership
   might sit there.
2. **How is `position` actually written?** **D-8** as originally written said two things that pull in
   opposite directions: *"assign on attach as `MAX(position) + 1`"* and *"reorder by rewriting the whole
   set in one transaction"*. The first is append-only; the second is a full rewrite. Nothing said which
   one the action does, so **the reorder control 0027 was told to own was not expressible** through the
   published signature.

**(a) Ownership.** `App\Actions\Products\SyncProductGallery` is **defined and owned exclusively by this
story (0024)**, as the single writer of `products.featured_media_id` and of every `product_media` row.
Consumers call it — via `CreateProduct` / `UpdateProduct`, never directly (0027 **D-12a**) — and no
story re-implements, duplicates or redefines it. Any language elsewhere suggesting otherwise is a
documentation slip and is corrected in *that* file. See the ownership note at the head of **D-9**, and
**D-15** for why that single-caller property is now load-bearing for authorization too.

**(b) The ordering contract — the exact signature.**

```php
// app/Actions/Products/SyncProductGallery.php
/**
 * @param  list<string>  $orderedGalleryMediaIds  The complete, authoritative gallery in display order.
 */
public function __invoke(
    Product $product,
    ?string $featuredMediaId,
    array $orderedGalleryMediaIds,
): void
```

Three rules, and they are the whole contract:

- **The array is authoritative and complete.** It is not a delta. Ids present are the gallery; ids
  absent are detached. This is the same "pass the full desired set" shape as Eloquent's own
  `sync()` and Spatie's `syncRoles()`.
- **`position` is the 0-based array index.** `$orderedGalleryMediaIds[0]` gets `position = 0`,
  `[1]` gets `1`, and so on — contiguous, gap-free, rewritten for **every** surviving row on **every**
  call, not only for the rows whose membership changed.
- **One transaction, one pass.** The detach, the attach and the full `position` rewrite happen inside a
  single `DB::transaction()`. No pairwise swaps, no read-modify-write of a `MAX(position)`.

**Why the array index and not `MAX(position) + 1`.** Append-only assignment cannot express "move item 3
to position 0" at all: the caller would have to either detach-and-reattach the whole gallery (three
round trips, a visible flicker, and a window where the product has no images) or a second writer would
have to `UPDATE` the pivot directly — which violates this story's own single-writer rule (**D-9**) and
puts pivot-writing logic in a Livewire component. With the index rule, a reorder is *the same call as
any other save*: 0027's "move earlier" / "move later" buttons reorder an in-memory PHP array and the
ordinary save resubmits it, and the action cannot tell a reorder from an add, a removal, or a no-op.
That is precisely the property that makes the reorder control expressible without amending this story.

**Consequences to implement knowingly:**

- **`position` values are always `0..n-1`.** They carry no meaning beyond sort order and are never
  stable identifiers — nothing may join or bookmark on a `position` value.
- **The `default(0)` on the column stays**, but is now unreachable through the action (every row gets an
  explicit index). It remains as the defence for a raw insert, which is why the
  `->orderByPivot('position')->orderByPivot('media_id')` tiebreak from **D-8** also stays — a raw insert
  is the only path that can still produce ties (**R-6**, now narrowed).
- **A full rewrite writes rows whose `position` did not change.** Deliberate: at a gallery strip's real
  size (single digits, tens at worst) a conditional "only update what moved" is more code, more branches
  and more tests for no measurable gain, and it re-introduces the read-modify-write the transaction
  exists to avoid.
- **Duplicate ids in the input are the caller's bug, not a silent tie.** The composite PK
  `(product_id, media_id)` makes a duplicate a `23000`; the action deduplicates the array
  (preserving first occurrence) before writing, so ordering is total.

**Supersedes**, retained above rather than deleted, per this project's convention: **D-8**'s
*"assign on attach as `MAX(position) + 1` scoped to the product"* bullet, and the file table's earlier
`array $galleryMediaIds` parameter name, which did not say the array was ordered.

### Scope fences: what this story must NOT do

- No Livewire component, route, Blade view, sidebar entry or browser test (0027).
- **No HTML sanitizer, no `symfony/html-sanitizer`, no `config/html-sanitizer.php`, no
  `SanitizeProductDescription`** — [0024a](0024a-product-description-html-sanitization.md)'s, in full.
- **No `ProductCategory::products()` relation, no change to `app/Actions/ProductCategories/**`, no
  `categories.delete_blocked` key** — [0024b](0024b-product-category-in-use-delete-guard.md)'s, in full.
- **No code anywhere that renders, echoes or returns `products.description` to a client.** This is the
  fence that makes the unsanitized interim safe (see the note below); it binds this story only, because
  0024a lifts it.
- No WYSIWYG editor (0021), no media-picker UI (0020), no media **deletion** (0019 D11 defers it).
- No sales-region assignment, no tax resolution, no `product_sales_region` pivot (0026).
- No `product_variants`, no attribute combinations, no variant SKUs (0028–0031).
- No `slug`, no SEO meta, no translation table or any other i18n scaffolding (Epic 5).
- No new permission module slug and no `RolePermissionSeeder` change — `products.*` is already seeded.
- No `SoftDeletes` on `Product`, no `deleted_at`, no restore flow.
- No third status case, no `agotado` string, no stored out-of-stock state — under any circumstance.

> **Why shipping `description` unsanitized here is safe, stated explicitly rather than left implicit.**
> This project's conventions warn hard against persisting an unsanitized value "temporarily"
> ([base-standards.md](../../../docs/conventions/base-standards.md#a-wireignored-client-owned-region--the-apps-first-instance),
> [api/routes.md](../../../docs/api/routes.md#applivewirecomponentswysiwygeditor--the-gallerys-first-real-consumer-and-the-second-routeless-gated-component)),
> and that warning is about a **render** sink. Three conditions hold across this story's whole life,
> and together they make the interim exposure **zero** rather than merely small:
>
> 1. **No render path exists.** Nothing in `app/`, `resources/` or `routes/` reads
>    `products.description` — the model does not exist until this story creates it, and the scope fence
>    above forbids adding a reader.
> 2. **No non-test writer exists.** The column is reachable only through `CreateProduct` /
>    `UpdateProduct`, whose only callers until 0027 are this story's own tests. Storing a payload
>    requires already being able to run PHP in the application.
> 3. **The consumer is gated on 0024a, in writing.** 0024a is recorded as a **blocking** dependency of
>    0027, 0061, 0076, 0077 and 0079 — the stories that render or re-bind the value — in this file's
>    Definition of Done and in 0024a's own Dependencies section.
>
> The alternatives were weighed and rejected. **Omitting the column** and adding it in 0024a means an
> `ALTER` on a table created one story earlier, plus rewriting every `ProductFactory`-based test —
> churn with no security gain. **Shipping the column but keeping `description` out of `#[Fillable]`
> and out of both action signatures** until 0024a is genuinely stronger (no row *can* hold unsanitized
> HTML), and was the closest call; it was rejected because it splits one validation trait, one
> `#[Fillable]` list and two action signatures across two stories, which is the kind of half-built
> seam this project's own errors-log repeatedly records as the thing that goes wrong. **If Phase 2
> disagrees, that is the fallback to take** — it is a smaller change than it looks, and this paragraph
> is here so the choice is re-decidable rather than inherited.

## Dependencies, risks and open questions

### Verified environment findings

Executed against this repository during the debate, and **re-verified at the split on 2026-09-01**.
Two of the eight were stale and are corrected in place rather than deleted, because sibling stories
cite them by number.

- **V-1 — ⚠️ WITHDRAWN (was: the CI database configuration cannot run the suite).** True when written
  on 2026-08-18; **fixed on 2026-08-26** by the very task this finding spawned,
  [`ci-database-connection-gap.md`](../ci-database-connection-gap.md), which records a clean
  `866/866` run against real MySQL. Re-verified at the split: `phpunit.xml:29`
  `DB_CONNECTION=mysql`, `.env.example:28` `DB_CONNECTION=mysql`, and
  `.github/workflows/tests.yml:27-47` a `mysql:8.4` service with job-level `DB_CONNECTION` /
  `DB_DATABASE=testing`. **The dependent claim that 0019's V7 and 0023's R-2 were wrong about CI is
  withdrawn** — 0019's V7 was right, and 0023's R-2's mitigation *is* live. See **C-2**.
- **V-2 — `config/database.php` pins `utf8mb4_unicode_ci` and `'strict' => true`.** Strict mode is what
  makes **D-5**'s no-default column a real constraint rather than a silent `''`. **Still true.**
- **V-3 — `foreignUuid()->constrained()` plus an explicit `index()` emits two DDL statements** (probe
  against the MySQL grammar). The basis of **D-10**. **Still true.**
- **V-4 — `constrained()` infers the parent table from the column name**, producing `product_categories`
  from `product_category_id` — hence `featured_media_id` would infer `featured_media`. **Still true.**
- **V-5 — `Larastan` runs at level 7 over `database/`**, so the migration *and the factory* are
  analysed. **Still true.**
- **V-6 — ⚠️ CORRECTED (was: neither dependency exists in code).** Both **do** exist:
  `app/Models/Media.php`, `app/Models/ProductCategory.php`, `database/factories/MediaFactory.php` and
  both migrations are merged, since [0019](../done/0019-media-library-upload-and-conversions-backend.md)
  and [0023](../done/0023-product-categories-backend.md) are closed. `app/Models/` holds five classes, not
  two. **This story is unblocked.** See **C-3**.
- **V-7 — `expect([...])` in `arch()` is disjunctive**, recorded in `tests/Unit/ArchitectureTest.php`
  after a vacuous rule shipped once. **Still true.**
- **V-8 — `Model::preventSilentlyDiscardingAttributes()` is not enabled anywhere**, which is why the
  actions must build rows from a literal whitelist and why **R-5** is real. **Still true.**
- **V-9 — (new, at the split) `App\Actions\Users\CreateUser` and `UpdateUser` self-authorize**, through
  `LogRefusedPrivilegedAttempt::authorize()`. This is the basis of the reversed **D-15**. See **C-1**.

### Dependencies

- **[0023](../done/0023-product-categories-backend.md) (product categories backend) — hard, and
  ✅ SATISFIED.** This story FKs into `product_categories`. Closed and merged.
- **[0019](../done/0019-media-library-upload-and-conversions-backend.md) (media library backend) — hard,
  and ✅ SATISFIED.** The featured-image FK and the gallery pivot both point into `media`, and
  `ProductMediaTest` needs `MediaFactory`. Closed and merged.
- **This story blocks its own two siblings**, both of which are worthless without it:
  [0024a](0024a-product-description-html-sanitization.md) (needs `CreateProduct`/`UpdateProduct` to
  wire into) and [0024b](0024b-product-category-in-use-delete-guard.md) (needs
  `products.product_category_id` to count through). 0024a and 0024b are **independent of each other**
  and may ship in either order.
- **Story 0027 depends on all three** (the paired UI), as do **0026** (sales regions on products) and
  **0029** (variants), which inherits **D-11**'s SKU constraint and **D-12**'s hard-delete semantics.
  **0025** depends on 0024b specifically.

### Risks

- **R-1 — ⚠️ CLOSED (was: CI cannot connect to a database).** Fixed 2026-08-26; see **V-1** and **C-2**.
  Retained as a numbered stub because 0027 **R-10** and 0029 **R-H** cite it.
- **R-2 — ⚠️ CLOSED (was: two unshipped dependencies).** Both shipped; see **V-6** and **C-3**.
- **R-3 — `constrained()` infers `featured_media` (V-4).** Must be `constrained('media')`. Fails loudly
  at migrate time; the fix is non-obvious.
- **R-4 — `decimal:2` returns a string.** `@property float $price` and `if ($product->price > 100)` are
  the two likeliest bugs in the story, and both read as correct. It bites the tests too:
  `toBe('19.99')`, with quotes. 0026's tax arithmetic inherits it.
- **R-5 — A silently discarded `status` (V-8).** If `status` were ever dropped from `#[Fillable]`,
  `Product::create([... 'status' => Active])` would drop it and the row would fall back to Draft with
  no error anywhere. Guarded by the `#[Fillable]` test plus the explicit-Active persistence test.
- **R-6 — `position` ties.** `default(0)` plus a bulk multi-select attach leaves every row at 0, and
  MySQL returns ties arbitrarily, so the gallery strip visibly reshuffles between page loads. Only the
  in-relationship `position, media_id` tiebreak prevents it. **Narrowed by D-17 (2026-08-19):**
  `SyncProductGallery` now writes an explicit index on every row, so the *application* can no longer
  produce a tie; the risk survives only for a raw insert or a seeder that bypasses the action, which is
  why the tiebreak and its test both stay.
- **R-7 — Column width and validation `max:` drifting apart.** Four pairs now, not one: `sku`/64,
  `price`/`decimal(10,2)`, `stock`/`integer`, `description`/`MEDIUMTEXT`. 0023's **R-4** with four times
  the surface; the boundary-pair tests must derive from the same constants.
- **R-8 — ⚠️ CORRECTED (was: no `trans_choice` precedent in `lang/`).** There is one, since task 0010:
  `lang/en/roles.php`'s `index.delete_blocked`, with six `trans_choice()` call sites and a documented
  convention in [naming.md](../../../docs/conventions/naming.md#translation-keys). Consumed by
  [0024b](0024b-product-category-in-use-delete-guard.md), which matches the existing simple
  `singular|plural` form. See **C-4**. Retained as a stub because 0025 **R-4**, 0029 and 0036 **R-6**
  all cite it.
- **R-9 — `SELECT *` on the products list** drags `description` out of the clustered index on every
  row (**D-4**). A constraint 0027 inherits.
- **R-10 — `type`'s no-default relies on MySQL strict mode (V-2).** If strict were ever disabled, an
  omitted `type` becomes `''` and fails at *read* time in the enum cast, far from the cause.
- **R-11 — *(moved to [0024b](0024b-product-category-in-use-delete-guard.md))*** — `restrictOnDelete`
  on the category FK is load-bearing only while `ProductCategory` stays hard-deleted.
- **R-12 — Stored XSS via `description`. NOT mitigated in this story.** Before the split this risk was
  marked mitigated by D-16; with the sanitizer moved to
  [0024a](0024a-product-description-html-sanitization.md), **this story's own state is unmitigated by
  construction** and is safe only for the three structural reasons in the scope-fence note above (no
  render path, no non-test writer, 0024a blocking every consumer). It is rated **high the moment any
  of those three stops holding**, which is exactly why the third is a Definition-of-Done item rather
  than an assumption. The two residuals 0024a inherits are stated there.
- **R-13 — `lang/*/products.php` is claimed by five stories** (0024 creates it; 0024b, 0026, 0027 and
  0028 extend it). Uncoordinated, one silently overwrites another's keys, and a missing `lang/es` key
  renders as its own raw key.
- **R-14 — *(moved to [0024b](0024b-product-category-in-use-delete-guard.md))*** — the reassign-away
  race between the count and the delete.
- **R-15 — The `->ignore()` omission.** Saving a product under its own unchanged SKU fails. 0023's R-1,
  one entity over; caught only by writing it as three tests, not one.
- **R-16 — *(moved to [0024a](0024a-product-description-html-sanitization.md))*** — sanitization is
  silently lossy.
- **R-17 — `restrictOnDelete` on the media FKs is a constraint on a story that does not exist yet.**
  Nothing can delete media today, so these FKs are unreachable in production and their only proof is
  the two raw-`DELETE` tests. The risk is that a future media-delete story meets an opaque `23000` and
  "fixes" it by relaxing the FK instead of building the reference guard — which is why the obligation
  is written into the Definition of Done rather than left to be rediscovered.
- **R-18 — (new, at the split) Every existing Products test now needs an authenticated actor.**
  **D-15**'s reversal means a `Livewire`-free direct action call that previously "just worked" now
  throws `AuthorizationException` unless the test `actingAs()` a permission-holder. This is the
  likeliest cause of a confusing first red run, and it is why the test-setup requirements call it out
  explicitly rather than leaving it to be discovered file by file.

### Resolved questions

**All ten questions raised during the debate were resolved on 2026-08-18, before Phase 2.** One is
**re-decided** at the split; two moved with their stories. Recorded with the confirmed answer and the
dropped alternatives, so a later reader sees what was decided and why.

- **RQ-1 — *(moved to [0024a](0024a-product-description-html-sanitization.md))*** — is the
  `description` HTML sanitized, and where? Answered there, unchanged: sanitized on write, before
  persistence, with an approved new Composer dependency.

- **RQ-2 — What happens to a product pointing at a deleted image? → `restrictOnDelete` on
  both media FKs.** An image cannot be deleted while any product references it as its featured image or
  through the gallery pivot. Confirmed on the ground that it makes media consistent with **this
  project's house pattern for refusing to delete something in use** — the same pattern
  [0024b](0024b-product-category-in-use-delete-guard.md) implements for categories and the PRD states
  for roles, shipping zones and blog categories. Implemented by **D-9**. *Dropped:* `nullOnDelete` +
  `cascadeOnDelete`, which would have let a product survive with a blanked image and spared a future
  media-delete story from building a reference guard first. That cost is now **accepted deliberately**
  and is written into the Definition of Done as an obligation on whichever story implements media
  deletion.

- **RQ-3 — May stock go negative? → No.** `'integer', 'min:0'` in validation; the column
  stays **signed** so Epic 3 can decide its own oversell/backorder behaviour without inheriting a MySQL
  `1264` 500 (**D-3**).

- **RQ-4 — Does a zero-stock Draft product show "Agotado"? → No; the out-of-stock badge
  overrides Active only.** A Draft with zero stock reads as Draft. Implemented by `displayStatus()`
  (**D-7**), and pinned by a dedicated test.

- **RQ-5 — A price submitted with three decimals? → Refused by validation.** `decimal:0,2`
  refuses it before the database can round `19.999` to `20.00` with only a note — i.e. before the
  customer could be charged a different price than the administrator typed (**D-2**, **D-13**).

- **RQ-6 — Is €99,999,999.99 an acceptable ceiling? → Yes.** `decimal(10,2)` stands, with
  the over-ceiling value refused by validation rather than surfacing as a `22003` (**D-2**).

- **RQ-7 — Does the gallery have a user-defined order? → Yes.** The `position` column stays,
  with the tiebreak and full-rewrite rules in **D-8**. 0027 owns the reorder control.
  **Extended 2026-08-19 (D-17), after story 0027's debate found the *mechanism* was never specified:**
  `SyncProductGallery` takes the complete ordered array and writes `position` from the 0-based array
  index; **D-8**'s `MAX(position) + 1` assignment bullet is superseded.

- **RQ-8 — Is the SKU charset restriction acceptable? → Yes.** Upper-cased ASCII
  alphanumerics plus `- _ . /`, max 64, canonicalised on write. This is the assumption the whole
  cross-engine simplification rests on (**D-11**): `abc-1` and `ABC-1` are the same SKU, and no SKU
  needs accents, spaces or meaningful case. Because it holds, SKU does **not** need 0023's heavier
  normalised-comparison machinery.

- **RQ-9 — Confirm the cross-table SKU reading. → Confirmed:** a variant SKU may not equal
  *any* product's SKU, including a different product's. Two independent `UNIQUE` indexes therefore do
  not satisfy PRD §2.2's Scenario Outline, which is why **D-11** records it as a named design
  constraint on story **0029** and requires 0029 to reuse this story's canonicalisation.

- **RQ-10 — ⚠️ RE-DECIDED at the split (2026-09-01). Should 0024 wire `Gate::authorize()` into its own
  actions? → YES.** The original answer was *no*, on the stated ground that `CreateUser`/`UpdateUser`
  "contain no `Gate` call". **That is false** — see **C-1** and **V-9** — and the documented convention
  is that the check lives in the class performing the operation. `backend-qa`'s dissent is adopted and
  **D-15** is rewritten. Consequences: `ProductPolicy` ships with real call sites rather than zero;
  0027's hand-off narrows from "you are the only enforcement" to "you are the second layer and the
  source of the UI hints"; and every Products test needs an authenticated actor (**R-18**).

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-18 with `backend-expert` (files and approach),
`database-expert` (schema, indexes, FK semantics) and `backend-qa` (test design), per
[workflow.md](../../../docs/workflow.md#phase-1--three-amigos-debate). Derived from
[PRD](../../../docs/PRD/PRD.md#22-products) §2.2's "Product catalog" Gherkin block and assumptions 8, 9,
10, 11, 17 and 19, grounded in full readings of
[0023](../done/0023-product-categories-backend.md) and
[0019](../done/0019-media-library-upload-and-conversions-backend.md), with
[0005](../done/0005-soft-delete-users-admin-guard.md) as the precedent for how this project models a
guard that refuses a delete.

The "Agotado is computed, never stored", "Active/Draft only", "no slug/SEO", "plain non-i18n columns"
and "UUID v7" positions are **confirmed Phase 0 decisions**, recorded here with their reasoning so a
later reader sees why the alternatives were closed rather than re-opening them.

**Split on 2026-09-01 after a Phase 2 INVEST FAIL** (`code-reviewer`), on the coordinator's explicit
instruction to split rather than patch. The review's four blocking findings were all factual errors in
this file against the real tree, and all four are recorded in
[Corrections made at the split](#corrections-made-at-the-split-2026-09-01) rather than silently applied
— B1 reverses **D-15**/**RQ-10**, B2 and B3 close stale environment findings, and B4 corrects the
`trans_choice` precedent claim now consumed by 0024b. Its three non-blocking findings are also
addressed: N1 and N2 by the uniform entity-prefix decision and its Phase 6 docs item, N3 by narrowing
**D-10** to "follow the existing, already-correct rule".

**The split itself was the review's own recommendation**, and it answers the two items this file's
pre-Phase-2 note flagged for that review by name: *size* (RQ-1 and RQ-2 had grown the story into a
schema change plus a Composer dependency plus a fifth action plus a security-critical test file) and
*whether the category-delete retrofit should be its own story* (it is the only part that edited another
story's shipped code, and it is independently valuable and independently testable). Both cut lines the
note itself named — the sanitization work and the category retrofit — are the two that were taken.

> **A third cut was considered and rejected, so Phase 2 meets a decision rather than a silence.** This
> file is still the largest of the three, and the obvious next slice is `product_media` +
> `SyncProductGallery` + `ProductMediaTest`. **It does not divide cleanly**, for two structural
> reasons rather than one preference: `featured_media_id` is a **column on `products`**, so the
> migration cannot be split without an `ALTER` on a table created one story earlier; and
> `CreateProduct` / `UpdateProduct` take `$featuredMediaId` and `$orderedGalleryMediaIds` as part of
> their `__invoke()` signature, so deferring the gallery would ship two actions with two parameters
> that do nothing and then widen a signature every direct-call test matches verbatim
> ([code-style.md](../../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)).
> That is the same half-built seam the `description` fallback was rejected for in the scope-fence note
> above. **What remains here is irreducible**: a table cannot ship without its schema, its model and
> the actions that write it. Note also that this file's *length* is not its *scope* — a large share of
> it is the corrections table, the withdrawn-finding records and the provenance the split itself
> produced, none of which is implementation work.

All three amigos' contributions are reflected above, including the **four recorded dissents** — D-3
(`stock` signedness), D-4 (`description` column type), D-9 (media FK delete semantics) and D-15
(whether the actions self-authorize, now **resolved in the dissenter's favour**). The one finding this
story originally claimed no prior story had right — the CI database configuration — was real, was
escalated to its own task, and **was fixed on 2026-08-26**; this file simply never recorded that, which
is [the 2026-08-29 errors-log entry](../../../docs/errors-log.md#one-docs-pass-reported-two-gaps-that-were-not-there-both-marked-verified--2026-08-29)'s
exact failure mode and is recorded as **C-2**.
