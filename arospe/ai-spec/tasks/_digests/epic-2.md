# Epic 2 decision digest (Products, Taxes & Sales Regions, Shipping)

Append-only. See [workflow.md#decision-digest-per-epic](../../../docs/workflow.md#decision-digest-per-epic)
for what belongs here and what doesn't — facts and decisions a later story in this epic must not
re-derive, never the full prose of a finalized story.

## Story 0024a — Product description HTML sanitization on write

- `App\Actions\Products\SanitizeProductDescription` — invokable, `__invoke(?string $html): ?string`,
  the **only** class in `app/` that imports `symfony/html-sanitizer` — story 0024a.
- Wired as the **third** constructor-injected collaborator (after `LogRefusedPrivilegedAttempt`,
  `SyncProductGallery`) into both `App\Actions\Products\CreateProduct` and `UpdateProduct`, called on
  `$description` and reassigned immediately before `Validator::make()`, so `max:65535` measures the
  stored value rather than markup about to be dropped — story 0024a.
- Allow-list config lives entirely in `config/html-sanitizer.php`: `strong`/`b`, `em`/`i`, `u`, `h2`
  (only h2), `ul`/`ol`/`li`, `a[href]` (`allowed_link_schemes: ['http','https','mailto']`),
  `img[src,alt]` (`allowed_media_schemes: ['http','https']`), `p`, `br`. `default_action: 'block'`
  keeps a removed element's text — a genuinely dangerous element (script/iframe/form/svg/input/etc.)
  must be in the explicit `dropped_elements` list instead, or its content survives as inert text —
  story 0024a.
- Idempotence is guaranteed only as **convergence by the second pass**, not strict one-pass
  byte-for-byte equality — a third sanitize pass never differs from the second, but a second pass can
  differ from the first for pathological/malformed input. Any story applying the sanitizer a second
  time over an already-sanitized value (0076's model-event layer, 0077/0079's Livewire call sites)
  must rely on convergence, not on `sanitize(sanitize($x)) === sanitize($x)` holding unconditionally —
  story 0024a.
- `config/html-sanitizer.php` is a **fixed security allow-list to be reused exactly**, not a registry
  a later story extends by appending entries — a second consumer (e.g. 0061's blog `body` column)
  must reuse this file as-is rather than fork a second allow-list for the same trust boundary —
  story 0024a.
- Known, unavoidable residual: `<style>`/`<title>` in body context cannot be fully dropped/blocked by
  this library in any configuration (`HtmlSanitizer::createDomVisitorForContext()` discards a
  drop/block config for `W3CReference::HEAD_ELEMENTS` in body context) — their text content can
  survive as inert, escaped text regardless of config. Do not attempt to "fix" this in
  `config/html-sanitizer.php` — story 0024a.
- Full mechanism and both Phase 4 findings (F-1 block-vs-drop, F-2 idempotence-to-convergence) are
  documented at [docs/security/html-sanitization.md](../../../docs/security/html-sanitization.md).

## Story 0024b — Product category in-use delete guard

- `App\Models\ProductCategory::products(): HasMany<Product, $this>` — the one new relation this story
  adds, keyed on `products.product_category_id` — story 0024b.
- `App\Actions\ProductCategories\DeleteProductCategory::__invoke(ProductCategory $productCategory): bool`
  — signature unchanged from 0023. Body now: count `$productCategory->products()->count()`; if > 0,
  throw `ValidationException::withMessages(['productCategoryId' => trans_choice(...)])` before
  attempting the delete; otherwise `deleteOrFail()` inside a `catch (QueryException $e)` narrowed to
  `$e->getCode() === '23000' && $e->errorInfo[1] === 1451` (not the whole `23000` class — safe
  unnarrowed here only because this method issues exactly one statement, a `DELETE`, and
  `products.product_category_id` is the only restricting FK anywhere in this schema referencing
  `product_categories`), re-counting (floored at `max(1, ...)`) and throwing the identical exception —
  story 0024b.
- **`DeleteProductCategory` still performs NO authorization of its own** — this story does not close
  that gap (deliberate, see D-B1/D-B2 in its own task file). Story 0025 must add the gate **inside**
  `DeleteProductCategory` itself, as its own first statement (self-authorizing, matching
  `App\Actions\Products\DeleteProduct`'s shape) — gate first, invariant second — never only in the
  calling Livewire component. Also must bind its delete-confirmation modal's `@error` to
  **`productCategoryId`**, must not add any confirm-and-proceed/force-delete control, and must log the
  invariant refusal itself (`->log($actor, 'category_in_use', 'product_category', $category->id)`
  immediately after catching the `ValidationException` — the domain-invariant check has no `Gate` call
  of its own to log through) — story 0024b.
- New lang key `products.categories.delete_blocked` (both locales), in the repo's existing **simple**
  `singular|plural` `trans_choice()` form (matching `roles.php`'s form, not `media.php`'s
  explicit-range form) — the count is always ≥ 1 when the message renders, so there is no zero case
  to express. This is the **sixth** `trans_choice()` key overall (`roles.php` 3, `media.php` 2, this
  one) — story 0024b.
- `App\Actions\ProductCategories\CreateProductCategory.php`'s docblock contains a known, pre-existing
  false comment ("matches `CreateUser`/`UpdateUser`'s caller-authorizes shape" — those two actually
  self-authorize). Not this story's or 0025's to silently inherit as license; raised, not fixed —
  story 0024b (originating in 0023/0024).
- Full mechanism, the exception-type reasoning (`ValidationException` not a domain exception, since a
  Livewire error bag needs no per-call-site try/catch), and the residual count-disclosure note are
  documented at [docs/database/schema.md#product_categories](../../../docs/database/schema.md#product_categories).

## Story 0025 — Product categories management screen (list, create/edit modal, blocked delete)

- `App\Livewire\ProductCategories\Index` — flat view path per the `Index`-in-a-subfolder exception
  (`resources/views/livewire/product-categories.blade.php`, not `product-categories/index.blade.php`).
  Route `GET /product-categories` → `product-categories.index`, `can:products.view`, declared in
  `routes/product-categories.php` — story 0025.
- Public surface: `$productCategories` (array of `{id, name, productCount, canEdit, canDelete}`,
  **deliberately unlocked** — display-only, every mutating method re-`findOrFail()`s + re-authorizes),
  `#[Locked] ?string $editingCategoryId` (assigned only from `$target->id`), `string $name = ''`
  (the only form field, never `?string`), `#[Locked] ?string $deletingCategoryId`,
  `#[Locked] string $deletingCategoryName` — story 0025.
- `App\Actions\ProductCategories\{Create,Rename,Delete}ProductCategory` **were modified by this
  story** to each self-authorize as their own first statement (constructor-injecting
  `App\Actions\Auth\LogRefusedPrivilegedAttempt`), discharging 0023's/0024b's hand-off — this is the
  first and only call site of `ProductCategoryPolicy`, for all four abilities at once. In
  `DeleteProductCategory` the new authorize call runs **before** the in-use count — order is
  load-bearing (leaking the count to a `products.delete`-less actor otherwise) — story 0025.
- The component gates as defence in depth on **all five** mutating/disclosing methods
  (`openCreateModal`, `openEditModal`, `save`, `confirmDelete`, `deleteProductCategory`), passing
  `targetType: 'product_category'`/`targetId` explicitly to every `LogRefusedPrivilegedAttempt::authorize()`
  call (`resolveTarget()` only auto-resolves `User`/`Role`) — story 0025.
- The domain-invariant in-use refusal is logged too, per 0024b's OQ-B1 hand-off: inside
  `blockedByProducts()` (reached from both the primary count check and the 1451-race catch),
  `$this->logRefusedPrivilegedAttempt->log(Auth::user(), 'category_in_use', 'product_category',
  $productCategory->id)`, distinguishable from the `'delete'` Gate refusal by its `ability` value —
  `tests/Feature/ProductCategories/RefusalLoggingTest.php`'s seventh test pins it — story 0025.
- `config/modules.php` gained `items.product_categories` (`group: platform`, icon `tag`,
  `permissions: ['products.view']`) with matching `lang/{en,es}/navigation.php` leaves;
  `resources/views/layouts/app/sidebar.blade.php` untouched (registry-only, per task 0013's
  mechanism) — story 0025.
- `lang/{en,es}/products.php` gained `categories.index.action_not_allowed` only — **no**
  `summary`/header-count key (OQ-2 resolved: no header line, since nothing in the PRD asks for one
  and there's no second dimension to summarise like Users has "active") — story 0025.
- Full mechanism (the two-layer gating, the `#[Locked]`/unlocked property split, the row-hint
  parity) is documented at
  [docs/api/routes.md#product-categoriesindex--the-fourth-permission-gated-route](../../../docs/api/routes.md#product-categoriesindex--the-fourth-permission-gated-route)
  and [docs/architecture/authorization.md#productcategorypolicy--the-fifth-policy-and-the-first-to-gain-its-call-site-in-a-later-story-than-the-one-that-created-it](../../../docs/architecture/authorization.md#productcategorypolicy--the-fifth-policy-and-the-first-to-gain-its-call-site-in-a-later-story-than-the-one-that-created-it).
