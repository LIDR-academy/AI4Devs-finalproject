# [0024] Products — core CRUD backend (+ the product-category in-use delete guard)

## Description
Introduce `products` as a first-class Epic 2 entity: a new `products` table (UUID v7 primary key per
[ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md)) plus its `product_media` gallery pivot,
the `App\Models\Product` model, two backing enums, shared name/SKU/price validation, and the
create / update / delete domain actions. It is **backend only** — no screen, no route, no Livewire
component; the products list and editor are the paired story **0027**.

It also carries a **second, smaller deliverable**: now that `products.product_category_id` exists,
story 0023's `DeleteProductCategory` gains the **hard block with a count** the PRD requires
("This category is used by 12 products and cannot be deleted"), with no confirm-and-proceed path.

Covers [PRD](../../docs/PRD/PRD.md#22-products) §2.2's *"Create a product with core fields"*, the
*"another product"* example of *"Scenario Outline: A duplicate SKU is rejected"*, and the product
categories block's *"Deleting a product category still in use is hard-blocked with a count"* — i.e.
Products acceptance criteria 1, 2 (the count half), 4 (the product-SKU half), 6 and 7.

## Type
backend | fullstack (related_task_id: **0027** — products list/editor UI) | includes database-expert: **yes**

## Three Amigos participants

`product-owner` (lead) + `backend-expert` (files and approach) + `database-expert` (schema, indexes,
FK semantics) + `backend-qa` (test design). All three were convened as subagents and all three
contributions are reflected below, including **four recorded dissents** (D-3, D-9, D-11, D-14) and
**one blocking environment finding neither prior story had right** (see
[V-1](#verified-environment-findings) and [R-1](#risks)).

## Gherkin

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

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

  Scenario: An administrator without the products permission cannot manage the catalog
    Given a signed-in administrator who does not hold the products management permission
    When authorization to manage the product catalog is evaluated for them
    Then the action is refused

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

### Migrations

| Path | What & why |
| --- | --- |
| `database/migrations/<ts>_create_products_table.php` | **New.** Greenfield UUID table. Its timestamp must be **strictly later** than 0023's `create_product_categories_table` and 0019's `create_media_table`, because both FKs are declared inline. |
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
    $table->mediumText('description')->nullable();                 // sanitized on write — D-4, D-16
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
pair an earlier draft of this story recommended). `down()` in both files is
the exact `Schema::dropIfExists(...)` inverse, per this repo's `down()`-symmetry rule; because
Laravel rolls back in reverse timestamp order, the pivot drops before `products`, so the pair is
genuinely symmetric.

> ⚠️ **Do not add `$table->index('product_category_id')` or `$table->index('featured_media_id')`.**
> [migrations.md](../../docs/database/migrations.md#structure) currently instructs the opposite
> ("this repo is explicit about it"), and **that instruction is wrong** — see **D-10**, which is a
> `docs-keeper` item as well as an implementation one.

### Enums — `app/Enums/`

| Path | What & why |
| --- | --- |
| `app/Enums/ProductType.php` | `case Physical = 'physical'; case Virtual = 'virtual';` + `label()` resolving `__('products.types.'.$this->value)`, mirroring `UserStatus::label()`. |
| `app/Enums/ProductStatus.php` | **Exactly two cases** — `case Active = 'active'; case Draft = 'draft';` + `label()`. This is the persisted enum. |
| `app/Enums/ProductDisplayStatus.php` | Three cases (`Active`, `Draft`, `OutOfStock`). **Never persisted, never validated, no column, no cast** — the badge type only. See **D-7**. |

TitleCase keys, lowercase backing values, per project `CLAUDE.md` and
[naming.md](../../docs/conventions/naming.md#classes).

### Model, factory, validation trait

| Path | What & why |
| --- | --- |
| `app/Models/Product.php` | **New.** `use HasFactory, HasUuids;`, `#[Fillable([...])]`, `casts()`, the `category()` / `featuredImage()` / `gallery()` relations, and `isOutOfStock()` / `displayStatus()`. **No `SoftDeletes`** (**D-12**), no `#[Hidden]` (nothing sensitive). |
| `app/Models/ProductCategory.php` | **Modify (0023 creates it).** Gains exactly one method: `/** @return HasMany<Product, $this> */ public function products(): HasMany`. It is what the delete guard counts through. |
| `database/factories/ProductFactory.php` | **New**, via `php artisan make:factory ProductFactory --model=Product --no-interaction`. `product_category_id => ProductCategory::factory()` so a bare `->create()` stands alone; `status => Draft` deliberately matching the column default; `sku` in canonical form. States: `active()`, `draft()`, `outOfStock()`, `physical()`, `virtual()`, `withFeaturedImage()`, `withGallery(int $count)`. |
| `app/Concerns/ProductValidationRules.php` | **New**, `<Noun>ValidationRules` / `<noun>Rules()` per [naming.md](../../docs/conventions/naming.md#traits-and-their-methods). Flat and single-concern — it `use`s no other trait. Full rule set in **D-13**. |
| `app/Actions/Products/SanitizeProductDescription.php` | **New.** Invokable; the **only** class in the app that touches the HTML sanitizer, mirroring how 0019 confines the imaging library to `GenerateImageConversions`. Called by `CreateProduct` and `UpdateProduct` before persistence. See **D-16**. |
| `config/html-sanitizer.php` | **New.** The allow-list configuration — the WYSIWYG toolbar's tag set and nothing else. See **D-16**. |
| `composer.json` / `composer.lock` | **Modify.** Add `symfony/html-sanitizer` (**D-16** — an approved new dependency). |

> **Naming trap, found in the debate and worth pinning.** 0023 already claims
> `nameRules(?string $id)` on `ProductCategoryValidationRules`, and `ProfileValidationRules` has its
> own `nameRules()`. PHP fatals on a conflicting method when two traits are composed onto one class,
> and the obvious future consumer — a product editor with create-a-category-on-the-fly — composes
> exactly those two. So **every ambiguous leaf method here is entity-prefixed**:
> `productNameRules()`, `productTypeRules()`, `productStatusRules()`, `productCategoryIdRules()`.
> `skuRules()`, `priceRules()`, `stockRules()`, `descriptionRules()` need no prefix. All still end
> in `Rules`, so the convention holds.

### Actions — new subfolder `app/Actions/Products/`

Sanctioned by [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)'s
one-subfolder-per-area rule, same as `app/Actions/Users/`.

| Path | What & why |
| --- | --- |
| `CreateProduct.php` | `__invoke(...): Product`. Canonicalises the SKU, validates, builds the row from a **literal whitelist** (never a spread of `$validated`), delegates imagery to `SyncProductGallery`, and catches `QueryException` `23000` → `ValidationException` on `sku` — the `CreateUser` pattern. |
| `UpdateProduct.php` | `__invoke(Product $product, ...): Product`. Same handling, with the uniqueness rule ignoring the target's own id. |
| `DeleteProduct.php` | `__invoke(Product $product): bool` — a plain instance `->delete()` today. It exists as its own file **specifically so Epic 3's "a product referenced by orders cannot be deleted" guard has one seam to bolt onto**, the same reasoning 0023's D-10 gives for `DeleteProductCategory`. |
| `SyncProductGallery.php` | `__invoke(Product $product, ?string $featuredMediaId, array $orderedGalleryMediaIds): void`. **Defined and owned exclusively by this story.** The **single writer** of `featured_media_id` and of the `product_media` pivot, shared by `CreateProduct` and `UpdateProduct` so the diff exists once. `$orderedGalleryMediaIds` is the **complete, authoritative new order**; `position` is written from the **0-based array index**, never appended. See **D-9** (independence + ownership) and **D-17** (the ordering contract). |

**`Update`, not a set of narrow verbs.** 0023's D-2 chose `Rename` because `ProductCategory` has
exactly one mutable field; `Product` has nine, and the PRD's own verb is "create/edit a product". So
`App\Actions\Users\UpdateUser` is the model to copy — the two stories are consistent, not divergent.
*Rejected:* `PublishProduct` / `AdjustStock` / `RepriceProduct` as separate verbs; no PRD scenario
treats any of them as a distinct operation, and 0027's editor would have to fan one form submit out
to four actions.

### The category-delete guard retrofit

| Path | What & why |
| --- | --- |
| `app/Actions/ProductCategories/DeleteProductCategory.php` | **Modify (0023 creates it; its D-10 says the file exists as its own file precisely so this story extends it).** `__invoke()` gains the count-and-block guard. This is the story's second deliverable — full shape in **D-14**. |

### Translations

| Path | What & why |
| --- | --- |
| `lang/en/products.php` | **New — this story creates the file.** 0023 deliberately created none. Keys owned here: `products.types.*`, `products.statuses.*`, `products.display_statuses.out_of_stock`, and `products.categories.delete_blocked`. |
| `lang/es/products.php` | **New**, key-for-key identical, per [naming.md](../../docs/conventions/naming.md#translation-keys). |

> ⚠️ **File-ownership hand-off.** Story **0028** also plans to create `lang/en|es/products.php`.
> 0024 has the lower id and therefore **creates** it; **0028 must be amended to extend it**. If both
> run uncoordinated, one silently overwrites the other's keys — and a key missing from `lang/es`
> renders as its own raw key with no error.

### Explicitly **not** touched

`database/seeders/RolePermissionSeeder.php` (the `products.*` permissions are already seeded — 0023
D-8/RQ-1, confirmed; **no catalog growth, unlike 0019**) · `routes/web.php` · `app/Livewire/**` ·
`resources/views/**` · `tests/Browser/**` · `docs/**` (Phase 6) · anything belonging to 0026 (sales
regions), 0027 (UI) or 0028–0031 (variants).

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

**Unit — `tests/Unit/Concerns/ProductValidationRulesTest.php`**
- [ ] `productRules(null)` marks `name`, `sku`, `product_category_id`, `type`, `price`, `stock` as
      `required`, and **does not** mark `status` required (it has a default).
- [ ] `productRules($id)` threads `$id` into the SKU uniqueness rule's ignore branch and
      `productRules(null)` does not — 0023's **R-7** (asymmetric `$id` threading) applies verbatim.
- [ ] The `price` and `stock` rule sets carry the scale/`min:0` rules the boundary tests derive from.

> These three assert *rule composition*, one step removed from behaviour. They exist to catch the
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
      category — the decoy is what makes it non-trivial.
- [ ] The model does **not** use `SoftDeletes` — a regression guard on **D-12**, because adding the
      trait later silently changes both `Rule::unique()` and the delete guard's count.

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
      the rule set in isolation. **(b) alone cannot fail** on the engine the suite actually runs on:
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
      [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s "database guarantees" rule —
      here the FK is the delete guard's second line of defence, and a migration quietly dropping
      `->constrained()` would remove the backstop with nothing else going red. One test, not a suite.

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
      argued exception to [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md) as the
      category FK test.
- [ ] The complement, so the restriction is not over-broad: deleting a **product** succeeds and takes
      its `product_media` rows with it (`product_id` still cascades), leaving the `media` rows intact.

**Feature — `tests/Feature/Products/ProductDescriptionSanitizationTest.php`** (**D-16**)

The security-critical file of this story. Every case asserts the **persisted** value
(`assertDatabaseHas` / a fresh `->fresh()->description`), never the action's return value — the
guarantee being tested is about what is in the column.
- [ ] Each allowed tag survives a round-trip unchanged: dataset over `<strong>`, `<em>`, `<u>`, `<h2>`,
      `<ul><li>`, `<ol><li>`, `<a href="https://…">`, `<img src="https://…" alt="…">`, `<p>`, `<br>`.
      Without this, a sanitizer configured too tightly would silently destroy legitimate content and
      every "is it stripped?" test below would still pass.
- [ ] `<script>alert(1)</script>` does not survive — assert the stored value contains no `<script`,
      **and** that the surrounding legitimate text is still there (a sanitizer that dropped everything
      would pass the first half).
- [ ] Dataset of vectors, each asserted absent from the stored value: an `on*` handler
      (`<img src=x onerror=alert(1)>`), `javascript:` in an `<a href>`, `data:text/html` in an
      `<a href>` and an `<img src>`, `<iframe>`, `<style>`, `<form>`, `<h1>` and `<h3>`, a `style`
      attribute, and an SVG payload — the last one because 0019 excluded SVG from *uploads* for
      exactly this reason, and inline SVG in a description is the same vector by another door.
- [ ] A mangled/unclosed vector (`<scr<script>ipt>`) does not reassemble into a live tag — the case a
      regex-based strip fails and a real parser passes.
- [ ] **Idempotence**: sanitizing an already-sanitized description yields a byte-identical value, so an
      edit round-trip does not mutate the content (**D-16** constraint 2).
- [ ] **Ordering**: a description that is under the length limit *after* sanitization but over it
      before is **accepted** — the assertion that pins "sanitize, then validate length" (**D-16**
      constraint 1). It fails if the two steps are ever swapped.
- [ ] `null` and `''` descriptions pass through untouched, with no sanitizer error.
- [ ] The **update** path sanitizes too, asserted independently — not assumed symmetric with create.
      A sanitizer wired into `CreateProduct` only is a silent hole reachable by editing any product.

**Feature — `tests/Feature/ProductCategories/DeleteProductCategoryTest.php`** (**extends 0023's file**)

*Regression — 0023's own cases must stay green untouched:*
- [ ] Deleting a category with zero products removes the row outright (`assertDatabaseMissing`).
- [ ] The freed name is immediately reusable.
- [ ] Deleting an unknown / malformed-UUID category still fails cleanly (`ModelNotFoundException`)
      rather than being swallowed by the new guard — the retrofit inserts a code path *before* the
      delete, and this is what proves it did not change the not-found behaviour.

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
- [ ] The **singular/plural** forms differ between N = 1 and N = 2. Note there is **no `trans_choice`
      precedent anywhere in `lang/` today** (**R-8**) — this is new ground for the repo.

**Feature — `tests/Feature/Policies/ProductPolicyTest.php`**

`beforeEach`: `app(PermissionRegistrar::class)->forgetCachedPermissions()` **then**
`$this->seed(RolePermissionSeeder::class)` — the order `UserPolicyTest` / `CreateUserTest` use.
- [ ] Each of `viewAny` / `create` / `update` / `delete` gets **both an allow and a deny** test, per
      [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s authorization rule.
- [ ] A `Super Admin` holding zero permission rows passes every ability via `Gate::before`.
- [ ] **Server-side enforcement**: `Gate::forUser($denied)->authorize('create', Product::class)` throws
      `AuthorizationException` — not merely `allows()` returning false.

**Unit — `tests/Unit/ArchitectureTest.php` (extend)**
- [ ] `App\Models\Product` references no blog-taxonomy namespace — written as **one `expect()` per
      namespace, never `expect([...])`**, because that form is **disjunctive** and this repo has
      already shipped one vacuous arch rule that way (the file carries the comment recording it).
      Same honest caveat 0023 gave: with no blog taxonomy in code, this is a scope fence expressed as
      a test, not a behavioural assertion.

**Explicitly not tested**, per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md):
`HasUuids` itself, Eloquent timestamps, `Rule::unique`/`Rule::exists`'s generated SQL, the `Storage`
facade, MySQL's own decimal arithmetic; migration `up()`/`down()` mechanics (`RefreshDatabase` proves
every migration runs, and `down()` symmetry is a code-review concern); the `.webp`/`.avif` pipeline
(0019); variant SKUs and attribute combinations (0029); sales-region assignment and tax resolution
(0026); any badge markup, colour or screen (0027). The two FK tests above are argued exceptions, not
oversights.

**Test-setup requirements** (carried from `backend-qa`, not optional):
- Flush Spatie's permission cache in `beforeEach` **before** seeding, and **never** between Act and
  Assert — a mid-test flush destroys the test's ability to detect its own bug. Only in files that
  actually test authorization.
- **Pin the config a test depends on**, including setting it to `null` when "unset" is the assumed
  state ([errors-log.md](../../docs/errors-log.md), 2026-08-12).
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
as an ordinary re-save. A catalog administrator's create / update / delete operations are
available as invokable domain actions with shared, trait-held validation, and `ProductPolicy`
expresses who may perform them. "Agotado" exists only as a **computed** badge derived from
`stock`, with no column, no enum case, no validation value and no code path that could write it.

Separately, deleting a product category that any product still references is refused with a message
naming the exact count, and the refusal holds for every actor including the Super Admin. Deleting an
unused category continues to work exactly as story 0023 built it.

Nothing is user-visible yet: the screen that consumes all of this is story 0027.

## Acceptance criteria
- [ ] `products` exists with `id` (UUID v7 PK), `product_category_id` (NOT NULL FK,
      `restrictOnDelete`), `name`, `sku` (unique), `type`, `status`, `price`, `stock`, `description`,
      `featured_media_id` (nullable FK into `media`), `created_at`, `updated_at` — and nothing else.
- [ ] `product_media` exists with `product_id`, `media_id`, `position` and a composite primary key,
      and neither FK column carries a redundant hand-written index.
- [ ] `App\Models\Product` uses `HasUuids`, does **not** use `SoftDeletes`, and casts `type` /
      `status` to their enums and `price` to `decimal:2`.
- [ ] A product can be created with all core fields; blank, over-length, malformed and missing-required
      inputs are each refused with a validation message and write no row.
- [ ] **Product type is required and has no default at any layer** — migration, model, action
      signature and validation all refuse an omission, and no fallback value is ever applied.
- [ ] **`status` has exactly two cases, Active and Draft**, defaults to Draft, and no out-of-stock
      value is accepted by validation, by the enum, or by the model cast.
- [ ] **Out-of-stock is computed, never stored**: an Active product with zero stock reports the
      out-of-stock badge while its stored `status` remains `active`, and restocking changes the badge
      without ever writing `status`.
- [ ] A duplicate SKU is refused at the **validation** layer, and a duplicate that races past
      validation surfaces as a `ValidationException` rather than a 500; SKUs are stored canonically
      (trimmed, upper-cased), so case- and whitespace-differing SKUs are the same SKU.
- [ ] Saving a product under its own unchanged SKU is accepted.
- [ ] A featured image and a gallery of images can be attached; both refuse an id absent from `media`;
      the same media may be used by two products; the featured image is **not** implicitly a gallery
      member.
- [ ] **`App\Actions\Products\SyncProductGallery` is the only writer of `featured_media_id` and of
      `product_media` anywhere in `app/`** — no Livewire component, controller or sibling action writes
      either, and it is defined only here (**D-9**, **D-17a**).
- [ ] **The gallery's `position` is the caller's 0-based array index** (**D-17b**): the action takes the
      complete, authoritative ordered array, rewrites every surviving row's `position` contiguously from
      `0` in one transaction, and therefore expresses a reorder as an ordinary re-save with no append-only
      path, no pairwise swap and no second pivot writer.
- [ ] **A media row cannot be deleted while any product references it** — as its featured image or via
      the gallery pivot — and the database refuses independently of any application check. Deleting a
      **product** still removes its own pivot rows and leaves the `media` rows untouched.
- [ ] **The `description` HTML is sanitized before it is persisted**, against an allow-list limited to
      the WYSIWYG toolbar's own tag set; scripts, event handlers, `javascript:`/`data:` URIs, embedded
      frames and inline styles never reach the column, on the create path **and** the update path; the
      length limit is applied to the post-sanitization value.
- [ ] **Deleting a product category assigned to N products is blocked with a message stating N**, the
      category survives, drafts count towards N, there is no confirm-and-proceed path at any privilege
      level, and the database FK refuses independently if the application check is ever bypassed.
- [ ] Deleting an unused product category still works exactly as story 0023 built it, and 0023's own
      delete tests pass unmodified.
- [ ] Authorization is expressed in `ProductPolicy`, with both an allow and a deny test per ability.
- [ ] `lang/en/products.php` and `lang/es/products.php` are created key-for-key identical, and no
      user-facing string is hardcoded.
- [ ] `symfony/html-sanitizer` is added to `composer.json` with its resolved constraint recorded, and
      `config/html-sanitizer.php` holds the allow-list; `App\Actions\Products\SanitizeProductDescription`
      is the only class in `app/` that imports the sanitizer.
- [ ] No route, Livewire component, Blade view, browser test or permission-catalog change is added.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule.
- [ ] `vendor/bin/pint --dirty --format agent` clean and Larastan level 7 passing — note
      `phpstan.neon` analyses `database/`, so the migration **and the factory** are in scope.
- [ ] Index reality verified with **`php artisan db:table products`** after migrating — not by reading
      the migration. [errors-log.md](../../docs/errors-log.md)'s `users_uuid_unique` entry establishes
      that a redundant index is invisible in a migration diff, and **D-10** makes that risk live here.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Point the audit at **D-16** specifically: the allow-list's
      completeness, the link/media scheme restrictions, and the sanitize-then-validate ordering.
- [ ] Documentation updated (docs-keeper): `docs/database/schema.md` gains `products` and
      `product_media` sections plus ER entities and the deliberate-index-omission notes;
      **`docs/database/migrations.md`'s explicit-FK-index instruction is corrected (D-10)** and can
      finally cite a real greenfield UUID `create_table` instead of a "target pattern"; ADR 0001's
      "still future" list drops Products; `docs/conventions/base-standards.md`'s UUID entity list moves.
- [ ] **Hand-off recorded for story 0027** (a real gap, not a formality): these actions perform **no
      authorization of their own**, matching `CreateUser`/`UpdateUser` and 0023's actions, so
      `ProductPolicy` ships tested with **zero call sites**. 0027 must (a) call `Gate::authorize()` as
      the first statement of every method that mutates *or discloses*, (b) gate the route with
      **`can:products.view`, never `permission:products.view`**, (c) keep the id fed to
      `Rule::unique()->ignore()` server-authoritative (`#[Locked]`, re-read from the model) — per
      [security/livewire-authorization.md](../../docs/security/livewire-authorization.md) — and
      (d) pass the **ordered** gallery array into `CreateProduct` / `UpdateProduct` and **never call
      `SyncProductGallery` directly** (0027 **D-12a**), the reorder control it owns being expressed
      purely as a reordered array on an ordinary save, per **D-17**.
- [ ] **Constraint recorded for story 0029**: variant SKUs must be unique against `products.sku` as
      well as against each other — a second independent `UNIQUE` index does **not** satisfy PRD §2.2's
      Scenario Outline. Whatever mechanism 0029 picks, it must **reuse** this story's SKU
      canonicalisation rather than re-implement it. See **D-11**.
- [ ] **Constraint recorded for any future media-delete story** (**D-9**, confirmed): both media FKs
      are `restrictOnDelete`, so a bare `DELETE` on a referenced image fails with a `23000`. That story
      **must** count references across `products.featured_media_id`, `product_media`, and by then
      0029's variants and Epic 4's blog posts, and refuse with a "used by N products" message — the
      same shape as **D-14**. It cannot ship a delete without that guard; this is a deliberately
      accepted cost of the confirmed decision, not an oversight.
- [ ] **Dependency approval recorded**: `symfony/html-sanitizer` is a new Composer dependency,
      **explicitly approved** by the coordinator when resolving RQ-1, satisfying project `CLAUDE.md`'s
      "do not change dependencies without approval" rule. Record the resolved constraint in
      `composer.json` after running `composer require` (0019's D1 precedent — the exact version that
      resolves is settled by running it, not asserted here).
- [ ] Acceptance criteria met.

## Documented functional decisions

### D-1 — Domain artifacts only; no Livewire component, route or view

0023's **D-1** precedent applies; 0019's **D10** does not. The distinguishing fact is *why* 0019
shipped a component class: its D10 records that the media gallery is **modal-only with no route**, so
the component class *is* the only server surface any consumer can reach. A product has an ordinary
routed screen coming in **0027**, so no such forcing function exists, and a placeholder component here
would mean registering a `/products` route rendering nothing — which 0006's history shows gets
rewritten wholesale anyway.

Consequence, stated plainly rather than left implicit: the actions do not self-authorize, so this
story ships **no enforcement path** for product CRUD. That is the hand-off in the Definition of Done,
not an oversight. **One thing in this story *is* enforced on day one with no caller** — the
category-delete guard (**D-14**), which lives in the action and therefore binds every future call
site including Artisan commands and 0025's screen. That contrast is the clearest illustration in this
codebase of `livewire-authorization.md`'s closing rule.

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
would corrupt it. The stored HTML is always the **sanitized** form (**D-16**), which is what makes the
`max:` rule meaningful: it must measure the post-sanitization value, not the submitted one.

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
equivalent — [migrations.md](../../docs/database/migrations.md#adding-a-column-to-an-existing-table)'s
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
  unlike `UNSIGNED` or collation.
- **Safe for a greenfield table, unconditionally.** The no-default hazard is exclusively
  `ALTER TABLE ADD COLUMN NOT NULL` against a populated table — precisely why
  `add_status_to_users_table` needed a default *plus* a conditional backfill. `products` starts empty,
  so **no backfill belongs in `up()`**, and applying `migrations.md`'s backfill rule here by reflex
  would mean inventing exactly the default this decision forbids. Record it in the migration so a
  later reader does not "fix" it.

Enforced at four layers: migration (above), the action's typed non-nullable `ProductType $type`
parameter (which catches every non-validating call site — seeders, console commands, a future REST
controller), `Rule::enum(ProductType::class)` in validation, and the model cast (a hand-written bad
value throws `ValueError` on read rather than rendering).

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
*refused*, not filtered out); the action signature is a typed non-nullable `ProductStatus`, so a
caller bypassing validation entirely still cannot pass a third value; and the column cast throws
`ValueError` on a hand-written database value. There is no `agotado` string anywhere in `app/` or in
`lang/*/products.php`'s `statuses` group.

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
option the user can pick and the server then rejects, and [errors-log.md](../../docs/errors-log.md)'s
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
exact mechanism — the ordered array in, the array index out — is **D-17**, which was left unspecified
here and is what story 0027's own debate surfaced as blocking.

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
use"** — the very pattern this story implements for product categories (**D-14**), and which the PRD
states for roles, shipping zones and blog categories too. Applying it to media as well means the
backoffice behaves the same way everywhere: the system refuses and tells you what is using the thing,
rather than silently degrading data behind your back. 0019's **D11** deliberately deferred "what
happens to a product pointing at a deleted image" until the product tables existed — this is that
story, and this is the answer.

Recorded for completeness, because it was argued and rejected: `database-expert` proposed
`nullOnDelete` on the featured image and `cascadeOnDelete` on the pivot, on the principle that **a
category is a *classification* whose loss corrupts the product's meaning, while a featured image is
*decoration* whose loss leaves the product semantically intact**. The rejected trade is real and the
next story pays it: a future media-delete feature can no longer ship a bare `DELETE`, because InnoDB
will refuse with an opaque `23000` on every referenced image. That is a **cost accepted deliberately**,
and it converts into a concrete obligation recorded in the Definition of Done — that story must count
references across `products.featured_media_id`, `product_media`, and later 0029's variants and Epic 4's
blog posts, and surface a "used by N products" refusal, exactly as **D-14** does for categories.

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

### D-10 — FK columns get **no** hand-written index, contradicting `migrations.md`

`foreignUuid(...)->constrained()` plus an explicit `$table->index(...)` emits **two** DDL statements on
the same column — verified with a `Blueprint::toSql()` probe against the MySQL grammar
(`ADD CONSTRAINT … FOREIGN KEY` followed by `ADD INDEX products_product_category_id_index`). InnoDB
auto-creates the FK's supporting index when none exists at constraint time, so writing both produces a
redundant index: precisely the `users_uuid_unique` write-amplification debt
[errors-log.md](../../docs/errors-log.md) already records.

[migrations.md](../../docs/database/migrations.md#structure) currently instructs the opposite, citing
`create_passkeys_table`. **That instruction is wrong and must be corrected in Phase 6** — otherwise
every Epic 2 table inherits the debt (0016 already diverged from it silently). `passkeys` should be
re-checked for the same duplicate at the same time.

Per that errors-log entry's own rule, **verify with `php artisan db:table products` after migrating,
never by reading the migration** — the migration diff cannot show you an index nobody removed. It is a
Definition-of-Done item because no database was reachable during this debate to confirm it.

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
  guard, not the definition ([signed-link-verification.md](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)).

`string('sku', 64)` with `max:64`, kept **adjacent and cross-referenced** so they cannot drift (0023's
**R-4**). The charset assumption is what the whole simplification rests on — it asserts `abc-1` and
`ABC-1` are the *same* SKU and that no SKU needs `Ñ`, spaces or case-significance — and it is
**confirmed** (**RQ-8**). *Considered and not applied:* declaring the column `ascii_bin` (free hardening, but SQLite
ignores per-column collation, so it would be a MySQL-only rule again — and it would be this schema's
first per-column charset, i.e. a convention decision that does not belong in this story).

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
   [schema.md](../../docs/database/schema.md#soft-deletes). A trashed product would **permanently squat
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

| Field | Rules |
| --- | --- |
| `name` | `['required', 'string', 'max:255']` |
| `sku` | `['required', 'string', 'max:64', 'regex:/^[A-Z0-9][A-Z0-9._\/-]*$/', Rule::unique(Product::class, 'sku')` (`->ignore($productId)` on the edit path)`]` |
| `productCategoryId` | `['required', 'string', Rule::exists('product_categories', 'id')]` |
| `type` | `['required', Rule::enum(ProductType::class)]` |
| `status` | `['required', Rule::enum(ProductStatus::class)]` |
| `price` | `['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99']` |
| `stock` | `['required', 'integer', 'min:0']` |
| `description` | `['nullable', 'string', 'max:65535']` |
| `featuredMediaId` | `['nullable', 'string', Rule::exists('media', 'id')]` |
| `galleryMediaIds` | `['array', 'max:20']` |
| `galleryMediaIds.*` | `['string', 'distinct', Rule::exists('media', 'id')]` |

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

**HTML in `description` is sanitized on write, in this story — confirmed. See D-16**, which owns the
package choice, the allow-list and the ordering constraint (sanitize **before** the `max:` rule runs,
or the length check measures markup the database never stores).

### D-14 — The category-delete guard: exact file, method, shape and exception type

**File:** `app/Actions/ProductCategories/DeleteProductCategory.php`. **Method:** `__invoke(ProductCategory $productCategory): bool`.
**Before this story** (0023) its body is a plain instance `->delete()`. 0023's **D-10** states the file
exists as its own file *specifically* so 0024 extends it — this is that extension, and it is the
**only** change to 0023's shipped code besides one relation method on `ProductCategory`.

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
auto-created index (**D-10**) — a secondary-index range scan with no table access, so **this story adds
no unindexed query**. Three properties of it are deliberate:

- **Unfiltered by status.** A Draft product still occupies the category; counting only Active ones
  would let an administrator delete a category out from under a dozen drafts. This is the likeliest
  implementation bug and it has its own test.
- **No `lockForUpdate()`.** Locking a category's whole product set for a rare admin operation is a wide
  lock to buy what `restrictOnDelete()` already guarantees.
- **It means what it says only because `Product` is hard-deleted** (**D-12**). If anyone adds
  `SoftDeletes` later, the count silently starts excluding trashed products and the guard changes
  meaning with no edit to the guard — hence the comment in the action and the regression test.

**FK: `restrictOnDelete()`.** `cascadeOnDelete()` is the dangerous default and does the exact opposite
of the requirement (deleting "Calzado" would silently delete 12 products). `nullOnDelete()` would force
`product_category_id` nullable, permanently un-enforcing "every product has a category", in exchange
for a behaviour the PRD forbids. `restrict` makes the block a **database invariant**, which is what
turns the application guard into genuine defence-in-depth rather than the only protection — it still
refuses a bulk cleanup, a seeder, or `ProductCategory::where(...)->delete()` through the **query
builder**, which per [base-standards.md](../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder)
skips model-level behaviour entirely. This is sound **only because `product_categories` has no soft
deletes** (0023 D-3): a soft-deleted parent never triggers an FK, so the guard would silently degrade
to application-only (**R-11**).

**Exception type: `ValidationException`.** *Rejected:* a domain exception. Decisive reason — it is the
one exception Livewire already routes into the component's error bag with no plumbing at the call
site, so 0025's delete-confirmation modal renders the message with an `@error` block and catches
nothing. A `RuntimeException` subclass would need a `try`/`catch` + `addError()` at *every* call site,
and any call site that forgot would get an unhandled 500 — the exact failure this guard exists to
prevent. `App\Exceptions\ImmutableRoleException` is this repo's one domain exception and is the wrong
shape here: its `render()` returns a **403**, converging on an authorization denial, and **this refusal
is not one** — the actor holds `products.delete` and the answer is still no. Precedent that settles it:
`CreateUser` converts a `23000` into a `ValidationException` for exactly this reason.

*Acknowledged counter-argument, recorded so Phase 5 does not re-litigate it:* `ValidationException`
conflates "your input was invalid" with "the world's state forbids this", and the actor submitted
nothing invalid. Considered, and outweighed by the rendering argument.

**The error-bag key `'productCategoryId'` is a hand-off contract** — 0025 must bind its `@error` to it.
Record it in the action's docblock; `CreateUser` sets the same precedent by throwing on `'email'`.

**The message uses `trans_choice`, not a bare `:count`**, because the singular differs:

```php
// lang/en/products.php — owned by THIS story
'categories' => [
    'delete_blocked' => '{1} This category is used by 1 product and cannot be deleted.'
        .'|[2,*] This category is used by :count products and cannot be deleted.',
],
```

with a key-for-key Spanish counterpart. *Placement note:* the string is *about* categories but lives in
`products.php`, because the message is about **products using** the category and 0028 will populate the
same file. Alternatives were a new `product-categories.php` domain file for one key, or extending
0023's file (there isn't one). Recorded so nobody "tidies" it later. **There is no `trans_choice`
precedent anywhere in `lang/` today** (**R-8**) — Spanish pluralisation is not identical to English and
both files land in the same change.

**Why there is no confirm-and-proceed path, ever** — three independent reasons, any one sufficient:

1. **The PRD says so, twice** (§2.2's Gherkin: *"deletion is always blocked (no confirm-and-proceed
   path) … they must reassign those products' category before it can be deleted"*, and AC 2). It is
   stated for four sibling entities across the PRD — a house pattern, not a per-entity preference.
2. **`product_category_id` is NOT NULL, so there is no coherent "proceed".** It would have to null the
   column (the schema forbids it), cascade-delete the products (catastrophic, never asked for), or
   reassign them to a fallback category nobody has defined and which does not exist. Every branch is
   worse than refusing.
3. **The database would refuse anyway** under `restrictOnDelete`, so a confirm button could not work.

### D-15 — `ProductPolicy` ships, and the actions do not self-authorize *(recorded dissent; confirmed at RQ-10)*

**Ship the policy.** 0028's D6 gated directly on permission names with no policy; that reasoning does
not transfer, for three reasons: (a) **0027 needs a per-row ability object** —
[authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)
requires the UI hint to come from *the same policy method* the mutating path authorizes against, and
0027 renders per-row edit/delete actions while 0028's screen renders rows that all answer identically;
(b) Epic 2 already has a `ProductCategoryPolicy` (0023 D-9), and two sibling entities in one module
with opposite authorization idioms is a coherence cost; (c) a per-record deletability rule is already
visible — this very story establishes "cannot be deleted because N others reference it" for
categories, and Epic 3's orders make the identical rule true of products.

**What must NOT go in the policy: the category in-use guard.** A policy denial renders 403
*unauthorized*, which is a lie here.

**Recorded dissent (`backend-qa`):** QA recommended that **0024 wire `Gate::authorize()` into its own
actions**, closing 0023's standing zero-call-site hand-off in the same story that creates the second
policy — otherwise `app/Policies/` ends up holding two policies whose combined call-site count is
zero, and the next reader of `app/Actions/Products/*` will reasonably assume the actions are
self-protecting. **The decision went the other way**, on convention: `CreateUser`/`UpdateUser` (verified
to contain no `Gate` call) and 0023's actions both authorize at the *caller*, and diverging here would
create a third idiom rather than resolving two. QA's point that stands regardless: **this story ships
no enforcement path for product CRUD**, and that must read as a deliberate hand-off, which is why it is
a Definition-of-Done item rather than a footnote. **Confirmed by the coordinator at RQ-10**: the
convention stands, and the hand-off to 0027 is how the gap is discharged.

### D-16 — `description` HTML is sanitized **on write**, with `symfony/html-sanitizer` *(confirmed; approved new dependency)*

**Sanitize on write, before persistence** — not on render. The decisive property is that it binds
**every** call site forever: the actions are the only way a description reaches the column, so a
seeder, an Artisan command, a future import or a REST controller all inherit the guarantee without
knowing it exists. Sanitizing on render is bypassed by the first consumer that forgets, and this
codebase already has the rule that
[a control enforced only in a component is bypassed by every other call site](../../docs/security/livewire-authorization.md).
The stored value is therefore *always* safe HTML, which is what lets 0027 render it unescaped at all.

**Package: `symfony/html-sanitizer`.** Justification, in the order that decided it:

1. **The Symfony 8.1 line is already installed and locked here** — 34 `symfony/*` packages, all
   `v8.1.x` (verified in `composer.lock`), pulled in transitively by Laravel itself. Adding one more
   component from a major line the lockfile already pins is the smallest possible dependency-graph
   change, and it cannot introduce a conflicting version of anything.
2. **PHP 8.5 support is certain.** This project runs PHP 8.5 (`composer.json` requires `^8.3`) and
   Symfony 8.1 supports it today. That is not a given for the alternatives — see below.
3. **It is an allow-list sanitizer by construction**, modelled on the W3C HTML Sanitizer API: unknown
   elements and attributes are dropped rather than escaped, which is exactly the HTML-Purifier-style
   semantics required. It also handles the cases a naive strip-tags pass misses — `javascript:` and
   `data:` URI schemes on `<a href>` and `<img src>`, and event-handler attributes.
4. **No disk-cached state.** It compiles nothing to a writable path, so it adds no deployment concern.

*Considered and rejected:* `mews/purifier` and `stevebauman/purify`, the two well-known Laravel
wrappers. Both are Laravel-friendlier on the surface (a facade, a publishable config) but both depend
transitively on `ezyang/htmlpurifier`, which brings two concrete costs this project would carry: its
PHP-version support historically lags (PHP 8.5 compatibility must be confirmed rather than assumed),
and it **caches compiled definitions to disk**, which needs a writable path configured and kept out of
version control. Neither buys anything over a directly-injected sanitizer given the single call site
this story has. *Also rejected:* `strip_tags()` — it takes a tag allow-list but **no attribute
allow-list at all**, so `<a onclick="…">` survives it; it is not a sanitizer.

**The allow-list is exactly the WYSIWYG toolbar's own tag set** ([PRD](../../docs/PRD/PRD.md) names it:
Bold, Italic, Underline, H2, bullet list, numbered list, link, insert image), and nothing else:

| Allowed | For |
| --- | --- |
| `<strong>` / `<b>`, `<em>` / `<i>`, `<u>` | Bold, Italic, Underline |
| `<h2>` | the H2 button (**only** h2 — not h1, which belongs to the page, nor h3–h6, which the toolbar cannot produce) |
| `<ul>`, `<ol>`, `<li>` | bullet and numbered lists |
| `<a href>` | link — **http/https/mailto schemes only** |
| `<img src alt>` | insert image — **http/https only**, and see the note below |
| `<p>`, `<br>` | the block/line structure any contenteditable emits |

Everything else is dropped: `<script>`, `<style>`, `<iframe>`, `<form>`, every `on*` handler, every
`style` attribute, and `<h1>`/`<h3>`–`<h6>`. **Do not add a tag to this list because the sanitizer
stripped something** — if the toolbar cannot produce it, its presence means the input did not come from
the toolbar. Configure `allowedLinkSchemes`/`allowedMediaSchemes` explicitly rather than relying on
defaults, and keep the list in `config/html-sanitizer.php` so it is reviewable in one place.

**Three implementation constraints, each a real bug if missed:**

1. **Sanitize before validating the length.** `max:65535` must measure what is actually stored;
   sanitizing afterwards means the rule counted markup the column never receives.
2. **Sanitizing is not idempotent-by-assumption — prove it.** An edit round-trip re-sanitizes
   already-sanitized HTML, so `sanitize(sanitize($x)) === sanitize($x)` must hold, or a description
   mutates slightly every time it is saved.
3. **It is a data-lossy transform, and the administrator is not told.** Pasting from Word silently
   loses formatting. Accepted for this story (the alternative is a rejection UX the PRD does not
   describe), but recorded as **R-16** and flagged to 0027, which may want to warn.

**Scope fence:** the sanitizer is applied to `products.description` only. 0021's WYSIWYG editor and
Epic 4's blog body are separate stories; when the blog arrives it must **reuse this configuration**
rather than define a second allow-list, or the two drift.

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
documentation slip and is corrected in *that* file. See the ownership note at the head of **D-9**.

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
- No WYSIWYG editor (0021), no media-picker UI (0020), no media **deletion** (0019 D11 defers it).
- No sales-region assignment, no tax resolution, no `product_sales_region` pivot (0026).
- No `product_variants`, no attribute combinations, no variant SKUs (0028–0031).
- No `slug`, no SEO meta, no translation table or any other i18n scaffolding (Epic 5).
- No new permission module slug and no `RolePermissionSeeder` change — `products.*` is already seeded.
- No `SoftDeletes` on `Product`, no `deleted_at`, no restore flow.
- No third status case, no `agotado` string, no stored out-of-stock state — under any circumstance.

## Dependencies, risks and open questions

### Verified environment findings

Executed against this repository during the debate. The first is load-bearing well beyond this story.

- **V-1 — The CI database configuration cannot run the suite, and *both* prior stories describe it
  wrongly.** `phpunit.xml` pins `DB_DATABASE=testing` but **never** `DB_CONNECTION`; `.env.example`
  line 23 sets `DB_CONNECTION=sqlite` with `DB_DATABASE` commented out; `.github/workflows/tests.yml`
  runs `cp .env.example .env` with **no MySQL service container and no sqlite file creation**. Two
  independent reproductions: `DB_CONNECTION=sqlite DB_DATABASE=":memory:" php artisan test` dies in
  migration `2026_07_22_100002_convert_user_id_to_uuid_in_passkeys_table` with
  `no such column: users.uuid`, and `DB_CONNECTION=sqlite DB_DATABASE=testing` throws
  `SQLiteDatabaseDoesNotExistException`. Also verified: both workflows trigger only on
  `develop`/`main`/`master`/`workos`, and the current branch is `feature-entrega2-ARP` — which is why
  this has gone unnoticed. **Consequence:** 0019's **V7** ("tests run on MySQL") is right in effect but
  wrong about CI; 0023's **R-2** is right about the configuration but its mitigation ("CI genuinely
  tests the production behaviour") is **not live**. Every uniqueness assertion in this story is
  therefore exercised **only** under `utf8mb4_unicode_ci`, which is exactly why the SKU tests must
  target the *layer* rather than the outcome.
- **V-2 — `config/database.php` pins `utf8mb4_unicode_ci` and `'strict' => true`.** Strict mode is what
  makes **D-5**'s no-default column a real constraint rather than a silent `''`.
- **V-3 — `foreignUuid()->constrained()` plus an explicit `index()` emits two DDL statements** (probe
  against the MySQL grammar). The basis of **D-10**.
- **V-4 — `constrained()` infers the parent table from the column name**, producing `product_categories`
  from `product_category_id` — hence `featured_media_id` would infer `featured_media`.
- **V-5 — `Larastan` runs at level 7 over `database/`**, so the migration *and the factory* are analysed.
- **V-6 — Neither dependency exists in code.** `app/Models/` holds only `Role.php` and `User.php`; there
  is no `media` migration, no `Media` model, no `product_categories` migration, no `ProductCategory`.
- **V-7 — `expect([...])` in `arch()` is disjunctive**, recorded in `tests/Unit/ArchitectureTest.php`
  after a vacuous rule shipped once.
- **V-8 — `Model::preventSilentlyDiscardingAttributes()` is not enabled anywhere**, which is why the
  actions must build rows from a literal whitelist and why **R-5** is real.

### Dependencies

- **0023 (product categories backend) — hard, blocking.** This story FKs into `product_categories` and
  its second deliverable *edits a file 0023 creates*. **Not yet implemented (V-6).**
- **0019 (media library backend) — hard, blocking.** The featured-image FK and the gallery pivot both
  point into `media`, and `ProductMediaTest` needs `MediaFactory`. **Not yet implemented (V-6).**
- Per [workflow.md](../../docs/workflow.md#task-ordering-rule) the numbering is already correct; what
  must be enforced is the **sequencing** — 0019 and 0023 both reach Phase 7 before 0024 starts Phase 3.
- **`ai-spec/tasks/in-progress/0008-super-admin-role-invariants.md` is still open.** The Full Test Suite
  Gate makes closure impossible while any red TDD tests are in flight; establish the baseline before
  starting.
- **Story 0027 depends on this one** (the paired UI), as do **0026** (sales regions on products) and
  **0029** (variants), which inherits **D-11**'s SKU constraint and **D-12**'s hard-delete semantics.

### Risks

- **R-1 — CI cannot connect to a database (V-1). Highest, and not this story's bug.** The project's Full
  Test Suite Gate rests on a job whose database configuration throws before the first query. 0024 must
  not be the story that discovers it; **recommend raising it as its own task**, and re-deriving 0023's
  R-2 mitigation once the real CI engine is known. This is also an
  [errors-log.md](../../docs/errors-log.md) candidate under the existing rule that a test must pin the
  configuration it depends on rather than inherit it.
- **R-2 — Two unshipped dependencies (V-6).** Neither `ProductCategory` nor `Media` exists. Sequencing,
  not renumbering, is the mitigation.
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
- **R-8 — No `trans_choice` precedent in `lang/`.** The count message is new ground for this repo, and
  Spanish pluralisation is not identical to English.
- **R-9 — `SELECT *` on the products list** drags `description` out of the clustered index on every
  row (**D-4**). A constraint 0027 inherits.
- **R-10 — `type`'s no-default relies on MySQL strict mode (V-2).** If strict were ever disabled, an
  omitted `type` becomes `''` and fails at *read* time in the enum cast, far from the cause.
- **R-11 — `restrictOnDelete` on the category FK is load-bearing only while `ProductCategory` stays
  hard-deleted.** Adding `SoftDeletes` to it later silently disarms the database half of the guard,
  since a soft delete is an `UPDATE` and never triggers an FK.
- **R-12 — Stored XSS via `description`. Mitigated by D-16, not eliminated.** The column is written
  only through the two actions, both of which sanitize, so the stored value is always safe HTML — and
  that is what permits 0027 to render it unescaped. Two residual exposures remain and belong in the
  Phase 4 audit: **(a)** any *future* writer that bypasses the actions (a seeder, an import, a raw
  `update()`) re-opens it, because the guarantee lives in the action and not in the column; **(b)** the
  allow-list itself is now the control — a tag added to it later without thought is a new sink. Rated
  high before mitigation: the render is unescaped by necessity and `Administrator` holds
  `products.create`.
- **R-16 — Sanitization is silently lossy.** A description pasted from Word or another CMS loses
  formatting with no warning, and a paste containing a disallowed tag comes back altered rather than
  rejected. Accepted for this story (a rejection UX is described nowhere in the PRD) and flagged to
  **0027**, which may want to surface a notice. It also makes a characterization test worthwhile: pin
  what the sanitizer *does* to a realistic paste, so a later package upgrade changing that output is
  visible rather than silent.
- **R-17 — `restrictOnDelete` on the media FKs is a constraint on a story that does not exist yet.**
  Nothing can delete media today, so these FKs are unreachable in production and their only proof is
  the two raw-`DELETE` tests. The risk is that a future media-delete story meets an opaque `23000` and
  "fixes" it by relaxing the FK instead of building the reference guard — which is why the obligation
  is written into the Definition of Done rather than left to be rediscovered.
- **R-13 — `lang/*/products.php` is claimed by two stories** (0024 and 0028). Uncoordinated, one
  silently overwrites the other's keys, and a missing `lang/es` key renders as its own raw key.
- **R-14 — The reassign-away race is not testable here.** If the last product is reassigned *between*
  the count and the delete, the count says 1 while reality says 0. It needs genuine concurrency against
  an open `RefreshDatabase` transaction. **Fail-closed (refuse; the retry succeeds) is the correct
  behaviour and is recorded as a decision**, not left as an unasserted assumption.
- **R-15 — The `->ignore()` omission.** Saving a product under its own unchanged SKU fails. 0023's R-1,
  one entity over; caught only by writing it as three tests, not one.

### Resolved questions

**All ten questions raised during the debate were resolved on 2026-08-18, before Phase 2.** Nothing in
this story is blocked on a product decision. Recorded with the confirmed answer and the dropped
alternatives, so a later reader sees what was decided and why — the same format 0023 uses.

- **RQ-1 (was OQ-1) — Is the `description` HTML sanitized, and where? → Sanitized on write, before
  persistence, with a new approved Composer dependency.** The allow-list is limited to the WYSIWYG
  toolbar's own tag set. Implemented by **D-16**, which owns the package choice
  (`symfony/html-sanitizer`, with `mews/purifier` / `stevebauman/purify` considered and rejected on
  their transitive `ezyang/htmlpurifier` PHP-version and disk-cache costs), the allow-list table, and
  the three implementation constraints — most importantly that sanitization runs **before** the length
  rule. *Dropped:* sanitizing on render (bypassed by the first consumer that forgets) and storing as
  given (indefensible while the permission catalog is granular enough to admit partly-trusted authors).
  This adds `app/Actions/Products/SanitizeProductDescription.php`, `config/html-sanitizer.php` and
  `tests/Feature/Products/ProductDescriptionSanitizationTest.php` to the story.

- **RQ-2 (was OQ-2) — What happens to a product pointing at a deleted image? → `restrictOnDelete` on
  both media FKs.** An image cannot be deleted while any product references it as its featured image or
  through the gallery pivot. Confirmed on the ground that it makes media consistent with **this
  project's house pattern for refusing to delete something in use** — the same pattern this story
  implements for categories (**D-14**) and the PRD states for roles, shipping zones and blog
  categories. Implemented by **D-9**. *Dropped:* `nullOnDelete` + `cascadeOnDelete`, which would have
  let a product survive with a blanked image and spared a future media-delete story from building a
  reference guard first. That cost is now **accepted deliberately** and is written into the Definition
  of Done as an obligation on whichever story implements media deletion.

- **RQ-3 (was OQ-3) — May stock go negative? → No.** `'integer', 'min:0'` in validation; the column
  stays **signed** so Epic 3 can decide its own oversell/backorder behaviour without inheriting a MySQL
  `1264` 500 (**D-3**).

- **RQ-4 (was OQ-4) — Does a zero-stock Draft product show "Agotado"? → No; the out-of-stock badge
  overrides Active only.** A Draft with zero stock reads as Draft. Implemented by `displayStatus()`
  (**D-7**), and pinned by a dedicated test.

- **RQ-5 (was OQ-5) — A price submitted with three decimals? → Refused by validation.** `decimal:0,2`
  refuses it before the database can round `19.999` to `20.00` with only a note — i.e. before the
  customer could be charged a different price than the administrator typed (**D-2**, **D-13**).

- **RQ-6 (was OQ-6) — Is €99,999,999.99 an acceptable ceiling? → Yes.** `decimal(10,2)` stands, with
  the over-ceiling value refused by validation rather than surfacing as a `22003` (**D-2**).

- **RQ-7 (was OQ-7) — Does the gallery have a user-defined order? → Yes.** The `position` column stays,
  with the tiebreak and full-rewrite rules in **D-8**. 0027 owns the reorder control.
  **Extended 2026-08-19 (D-17), after story 0027's debate found the *mechanism* was never specified:**
  `SyncProductGallery` takes the complete ordered array and writes `position` from the 0-based array
  index; **D-8**'s `MAX(position) + 1` assignment bullet is superseded.

- **RQ-8 (was OQ-8) — Is the SKU charset restriction acceptable? → Yes.** Upper-cased ASCII
  alphanumerics plus `- _ . /`, max 64, canonicalised on write. This is the assumption the whole
  cross-engine simplification rests on (**D-11**): `abc-1` and `ABC-1` are the same SKU, and no SKU
  needs accents, spaces or meaningful case. Because it holds, SKU does **not** need 0023's heavier
  normalised-comparison machinery.

- **RQ-9 (was OQ-9) — Confirm the cross-table SKU reading. → Confirmed:** a variant SKU may not equal
  *any* product's SKU, including a different product's. Two independent `UNIQUE` indexes therefore do
  not satisfy PRD §2.2's Scenario Outline, which is why **D-11** records it as a named design
  constraint on story **0029** and requires 0029 to reuse this story's canonicalisation.

- **RQ-10 (was OQ-10) — Should 0024 wire `Gate::authorize()` into its own actions? → No.** Keep the
  repo's caller-authorizes convention (`CreateUser`, `UpdateUser`, 0023's actions) and hand off to
  0027. `backend-qa`'s dissent — that `app/Policies/` now holds two policies with zero combined call
  sites — is recorded at **D-15** and remains a real, acknowledged gap, discharged by the explicit
  Definition-of-Done hand-off rather than by code in this story.

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-18 with `backend-expert` (files and approach),
`database-expert` (schema, indexes, FK semantics) and `backend-qa` (test design), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Derived from
[PRD](../../docs/PRD/PRD.md#22-products) §2.2's "Product catalog" and "Product categories" Gherkin
blocks and assumptions 8, 9, 10, 11, 17 and 19, grounded in full readings of
[0023](in-progress/0023-product-categories-backend.md) and
[0019](done/0019-media-library-upload-and-conversions-backend.md), with
[0005](done/0005-soft-delete-users-admin-guard.md) as the precedent for how this project models a
guard that refuses a delete.

The "Agotado is computed, never stored", "Active/Draft only", "no slug/SEO", "plain non-i18n columns"
and "UUID v7" positions are **confirmed Phase 0 decisions**, recorded here with their reasoning so a
later reader sees why the alternatives were closed rather than re-opening them.

All three amigos' contributions are reflected above, including **four recorded dissents** — D-3
(`stock` signedness), D-4 (`description` column type), D-9 (media FK delete semantics) and D-15
(whether the actions self-authorize) — and **one finding neither prior story had right**: the CI
database configuration cannot open a connection at all (**V-1**), which makes 0019's V7 wrong about CI
and 0023's R-2's mitigation not live. That is a pre-existing, project-level defect this story surfaced
rather than introduced, and it is recommended as its own task.

Two of those dissents were escalated to the coordinator rather than settled in the debate, and **both
were resolved on 2026-08-18 against the recommendation this file originally carried**: media FK
semantics went to `restrictOnDelete` (**RQ-2**, adopting `backend-expert`'s position over
`database-expert`'s), and description HTML is sanitized on write with an approved new dependency
(**RQ-1**). Both are folded into the decisions, schema, tests, acceptance criteria and Definition of
Done above; the superseded recommendations are retained inside **D-9** and **D-16** as the dropped
alternatives, so the reasoning is not lost.

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Two items deserve an explicit look there
rather than at implementation time. First, **size**: RQ-1 and RQ-2 both grew the story — it now adds a
Composer dependency, a config file, a fifth action and a security-critical test file on top of an
already-large schema change, so whether it still satisfies INVEST's "Small" is a fair challenge.
Second, and relatedly, whether the **category-delete retrofit should be split into its own story**: it
is the only part of this file that edits another story's shipped code, and it is independently
valuable and independently testable. Splitting the sanitization work out is the other obvious cut line
if one is needed.
