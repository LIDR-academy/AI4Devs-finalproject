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

## Story 0026 — Product ↔ Sales Region assignment and tax resolution backend (blocks story 0027)

- `product_sales_region` pivot: composite PK `(product_id, sales_region_id)`, no surrogate id, no
  extra columns at all (no `position`, no per-assignment rate override — a rate lives only on
  `sales_regions.rate`). `product_id` → `cascadeOnDelete()`, `sales_region_id` →
  `restrictOnDelete()` (currently unreachable — no delete path on the catalog). No hand-written
  index on either FK — story 0026.
- `App\Models\Product::salesRegions(): BelongsToMany<SalesRegion, $this>` — table/columns named
  explicitly. **No inverse `SalesRegion::products()`** — no consumer needs it — story 0026.
- `App\Models\SalesRegion::scopeActive()` / `scopeAssignable()` (active + `whereDoesntHave('children')`)
  — the single "may this entry be newly assigned" definition, consumed by both validation and the
  options resolver — story 0026.
- `App\Actions\Products\SyncProductSalesRegions::__invoke(Product $product, array $salesRegionIds): void`
  — `$product->salesRegions()->sync($salesRegionIds)`. **Self-authorizes NOTHING** (D8) — matches
  `SyncProductGallery`'s shape exactly: a collaborator invoked only inside an already-authorized
  transaction, enforced by a reachability test, not a `Gate` call. Opens **no** transaction of its own
  and swallows no exception — must be called inside a caller-opened `DB::transaction()` — story 0026.
- `App\Actions\Products\ResolveProductTaxRate::__invoke(Product $product, SalesRegion $destination): ResolvedTaxRate`
  — exactly two tiers (`AssignedRegion` then `CatalogDefault`), exact-id match only, **no ancestor
  walk in either direction**. Matches via a direct `$product->salesRegions()->whereKey($destination->id)->first()`
  pivot query — **never** `loadMissing('salesRegions')` + in-memory search, since `loadMissing()` is a
  no-op once any (possibly constrained) version of the relation is already loaded, which would
  silently drop a disabled-but-assigned region from the match. Self-authorizes nothing (pure read,
  may run from a queued job with no acting user) — story 0026.
- `App\Actions\Products\ResolvedTaxRate` — `final readonly class(public ?string $rate, public
  SalesRegion $region, public TaxRateResolutionTier $tier)`. `$rate` is **never `?float`** —
  `decimal:3` casts to string; `null` and `'0.000'` are both honoured verbatim, neither falls through
  to the other tier, neither is fabricated as `0` — story 0026.
- `App\Enums\TaxRateResolutionTier: string` — exactly `AssignedRegion = 'assigned_region'`,
  `CatalogDefault = 'catalog_default'`. No `label()` (nothing renders it yet) — story 0026.
- `App\Exceptions\NoDefaultSalesRegionException extends RuntimeException` — thrown only when the
  catalog has **no** `is_default` row at all (a genuine invariant violation per story 0017's
  guarantee), never for an unconfigured rate. Deliberately no `render()` — story 0026.
- `App\Actions\Products\SearchSalesRegions` implements story 0022's `MultiSelectOptionsResolver` —
  **this is the exact class-string 0022's own consumer example already names**. `search()` offers only
  `assignable()` entries, matched against the entry's own name **and its parent's name** (via
  `App\Actions\NormalizeForSearch`, folding the haystack side). `resolveSelected()` vouches for
  **every currently-assigned id regardless of `is_active`/children**, marking a no-longer-assignable
  one `disabled: true`, and is a **total function** — throws `App\Exceptions\UnresolvedSelectionException`
  (0022's) for any id it cannot vouch for at all, never a short return. Labels are qualified
  (`"España (Península)"`), `group: null` always. Self-authorizes nothing (catalog data — name,
  `is_active`, has-children — treated as uniformly visible to any authenticated admin) — story 0026.
- **D12 (validation): an id's treatment depends on whether it is new to this product.** A **preserved**
  id (already on the product before this request) need only still exist in the catalog; a **newly
  added** id must additionally be active and childless. `App\Concerns\ProductValidationRules::
  salesRegionIdRules(array $preservedSalesRegionIds = [])` — the OR sits **inside** the single
  per-element `Rule::exists()->where()` match, never a follow-up `if`. `$preservedSalesRegionIds`
  **must be read server-side from `$product->salesRegions`, never from the request** — a
  client-supplied preserved list bypasses the assignability gate entirely. `salesRegionIdsRules()` is
  `['array', 'list', 'max:254']` (254 = 249 ISO countries + 5 Spain fiscal territories, the catalog's
  real hard ceiling) — story 0026.
- **D11: an unresolvable submitted id rejects the WHOLE save, never a partial one.** The
  per-element `salesRegionIds.*` rule failing means `SyncProductSalesRegions` is **never invoked** —
  no subset written. The refusal must name the problem via `lang/{en,es}/products.php`'s
  `sales_regions.not_in_catalog` / `sales_regions.not_assignable` keys — story 0026.
- **DoD hand-off item 5 (mandatory for story 0027, R-1 security finding): `salesRegionIdsRules()` and
  `salesRegionIdRules()` MUST be validated in two separate, sequential `Validator::make(...)->validate()`
  calls, never combined into one rule array.** `max:254` bounds what may succeed, not what a request
  *costs* — Laravel runs every element's `Rule::exists()` query regardless of whether the array-level
  `max`/`list` rule already failed (measured: up to ~40,000 elements ≈ ~40,000 queries on one request
  from a `products.edit`-only actor). Validate `salesRegionIdsRules()` alone first; only then validate
  `salesRegionIds.*` against `salesRegionIdRules($preserved)`. Full mechanism, measurements and the two
  bounding shapes are at [docs/security/array-validation-bounds.md](../../../docs/security/array-validation-bounds.md)
  — story 0026.
- **DoD hand-off items 1–4 (mandatory for story 0027, not yet discharged in code):** (1) authorize
  `Gate::authorize('update', $product)` before calling `SyncProductSalesRegions`, and gate the route
  with `can:products.view`; (2) the submitted region-id array must be server-validated, never trusted
  from the picker; (3) `salesRegionIdRules()` must be called with the **persisted** product's current
  region ids (D12) — this is the *only* gate a stale-but-still-existing preserved id ever meets,
  `resolveSelected()` vouches for **any** id still in `sales_regions`, not only ones assigned to this
  product; (4) **D13**: one `DB::transaction()` must wrap `UpdateProduct`/`CreateProduct` +
  `SyncProductSalesRegions` + `SyncProductGallery` together, opened *after* validation and after
  `assertSelectionResolvable()` — story 0026.
- Groupings (the supranational `SalesRegionKind::Grouping` case) **do not exist in the catalog at
  all** — removed project-wide by story 0016's own scope-change amendment (D11 there). The resolver
  and the picker have exactly two/no grouping tiers respectively — do not reintroduce a
  grouping-membership concept anywhere in story 0027 — story 0026 (D10).
- Full mechanism is documented at [docs/database/schema.md#product_sales_region](../../../docs/database/schema.md#product_sales_region).

## Story 0027 — Products list + editor UI (discharges 0026's hand-off; the first real caller of ProductPolicy/CreateProduct/UpdateProduct/DeleteProduct/SyncProductGallery/SyncProductSalesRegions/SearchSalesRegions)

- Three routes, one new area file `routes/products.php` (`require`d from `web.php`): `GET /products` →
  `products.index`, `GET /products/create` → `products.create`, `GET /products/{product}/edit` →
  `products.edit` — all `can:products.view`. `products.create`/`.edit` both resolve **the same**
  `App\Livewire\Products\Editor` class (the app's first component repeated across two route names) —
  story 0027.
- `App\Livewire\Products\Index` (flat view, `resources/views/livewire/products.blade.php` — the
  `Index`-in-a-subfolder exception): `#[Computed] products(): LengthAwarePaginator`, explicit-column
  `select()` (never `description`), eager-loads `category:id,name` +
  `featuredImage:id,title,path,webp_path,avif_path`, `orderBy('name')->orderBy('id')`, `paginate(25)`,
  mapped `->through()` into row arrays `{id,name,sku,price,stock,stockBand,displayStatus,thumbnail,
  canEdit,canDelete}`. `canEdit`/`canDelete` are `Gate::allows('update'|'delete', $product)` — the
  same `ProductPolicy` methods `confirmDelete()`/`deleteProduct()` and `Editor` authorize against, so
  the per-row hint cannot drift — story 0027.
- `App\Livewire\Products\Editor` (nested view, `resources/views/livewire/products/editor.blade.php` —
  the ordinary mirror rule, one level deeper than `Index`'s in the same folder): `$productId` is
  `#[Locked] ?string`, written only from `$product->id` inside `mount()`. **`$status` is a plain
  `string` (`ProductStatus::Draft->value` default), never a typed `ProductStatus` property** — task
  0015 finding F8's rule (`EnumSynth` hydrates a forged value through `::from()` *before* validation,
  turning a tampered status into a raw `\ValueError`/500 instead of a validation error) applied a
  second time on a second screen. `$type` is a plain `string` defaulting to `''` with **no** legitimate
  default at all (0024's own rule) — its `<flux:select>` placeholder is `disabled selected value=""`,
  the one new Flux/Blaze markup rule this screen adds. Four imagery properties
  (`$featuredMediaId`/`$featuredPreview`/`$galleryMediaIds`/`$galleryPreviews`) are all `#[Locked]`,
  written only from a server-side `Media::find()`/`whereIn()` lookup inside the two `#[On]` listeners
  below — never from the event payload's own `title`/`url` fields. `$regionIds` is the
  `SearchableMultiSelect` child's `#[Modelable]` target and is deliberately **not** locked — story 0027.
- **Two `Gallery` embeds + one `WysiwygEditor` + one `SearchableMultiSelect`, all on one page, is now a
  real, shipped instance later stories (0031, 0077) can pattern-match against.** Featured-image picker:
  `select-event="featured-image-selected"` → `#[On] setFeaturedImage()`, single-select. Gallery-strip
  picker: `select-event="product-images-added"` → `#[On] addGalleryImages()`, multi-select. Both sit
  inside `@can('viewAny', \App\Models\Media::class)`, with the trigger button rendered `disabled`
  (never hidden) on the else-branch. The WYSIWYG's own internal gallery derives its event name per
  instance (0021 D5) — three `Gallery` instances, three distinct names, no cross-wiring — story 0027.
- **`setFeaturedImage()`/`addGalleryImages()` are page-globally-registered `#[On]` listeners on a
  *routed* component and still needed their own `Gate::authorize('viewAny', Media::class)` (F-6,
  code-review re-audit)** — the route's `can:products.view` replay covers only that one ability, not
  the finer `media.view` these two listeners actually need. Generalises: **a route's `can:` replay
  covers only the ability it names; a method inside that route asking a different, finer ability still
  needs its own gate.** Full write-up:
  [docs/security/livewire-authorization.md](../../../docs/security/livewire-authorization.md#the-routeless-case-a-component-with-no-route-has-no-per-request-backstop-at-all) — story 0027.
- `addGalleryImages()` carries `self::MAX_GALLERY_SIZE = 20` (matching
  `productGalleryMediaIdsRules()`'s `max:20`) as a **mutation-point** cap, not only a `save()`-time
  validation cap — a public, client-dispatchable method with no other bound would otherwise let the
  array grow past 20 in component state (serialized into the snapshot every round trip) even if
  `save()` is never called. Re-audit (R-1) then found the cap alone insufficient: it only stopped the
  *array* growing, not the *loop* — a payload of hundreds of non-existent/duplicate ids still drove one
  `Media::query()->find()` per item. Fixed by slicing candidate ids to remaining capacity **before**
  any query runs and resolving the survivors in one `whereIn()`. **Rule: capping an accumulator does
  not cap a loop that can iterate without filling it** — story 0027.
- Gallery reorder ships as **buttons** (`moveGalleryImageEarlier()`/`moveGalleryImageLater()`), never
  drag — mutates only the in-memory `$galleryMediaIds`/`$galleryPreviews` arrays, no query, no pivot
  write, nothing persisted until `save()`. `save()` **always** passes the complete reordered array to
  `CreateProduct`/`UpdateProduct` (never a default) — `SyncProductGallery` is **never called directly**
  from `Editor`, discharging 0024's own hand-off item (d) — story 0027.
- **`save()`'s ordering, now the shipped reference for "one `DB::transaction()` composing multiple
  writers" on this screen family**: authorize (`create`/`update` via `LogRefusedPrivilegedAttempt`) →
  read `$preserved = $product?->salesRegions->pluck('id')->all() ?? []` from the **persisted** row,
  never the request → canonicalise `name`/`sku` → validate core fields → validate `galleryMediaIds`
  shape+bound alone, then `galleryMediaIds.*` → validate `regionIds` shape+bound alone, then
  `regionIds.*` against `salesRegionIdRules($preserved)` → mandatory
  `$searchSalesRegions->resolveSelected($this->regionIds)` (never skipped, never a short-circuit) →
  **open** `DB::transaction()` → `create()`/`update()` (which reach `SyncProductGallery` internally) →
  `$syncRegions($saved, $this->regionIds)` → redirect to `products.index`. This discharges 0026's DoD
  hand-off items 1–4 in full — story 0027.
- **The `.*`-wildcard two-pass validation pattern 0026 handed off is now extended from `regionIds` to
  `galleryMediaIds` too, in the identical shape**: `Validator::make(['x' => $arr], ['x' =>
  $shapeAndBoundRules])->validate()` first, then a second `Validator::make(['x' => $arr], ['x.*' =>
  $perElementRules])->validate()` — never combined, because Laravel expands a `.*` wildcard against
  every element regardless of whether the parent's own `max:` already failed. Full measurements (one
  combined call = one `Rule::exists()` query per submitted id before the cap is ever consulted) at
  [docs/security/array-validation-bounds.md](../../../docs/security/array-validation-bounds.md#story-0027-the-two-pass-shape-is-only-half-the-bound--the-mutation-point-needs-one-too) — story 0027.
- `ProductPolicy` now has real call sites for **all four** abilities (`viewAny` via `Index::mount()`;
  `create`/`update`/`delete` as a **second** layer over 0024's already-self-authorizing actions, via
  `Editor::mount()`/`::save()` and `Index::confirmDelete()`/`::deleteProduct()`) — story 0027.
- Thumbnail/preview URLs are built at the call site from 0019's real `path`/`webp_path`/`avif_path`
  columns via `Storage::disk('public')->url(...)` — **there is no `url()`-style accessor on
  `App\Models\Media`.** Mirrors `Gallery::toPayloadItem()`'s and `WysiwygEditor::insertImage()`'s
  identical shape; `Editor::toPreview(Media $media): array` is the one reviewable place per component
  — story 0027.
- Sidebar: `config/modules.php` gained `items.products` (`group: platform`, icon `cube`,
  `current_when: 'products.*'`, `permissions: ['products.view']`), matching
  `lang/{en,es}/navigation.php` leaves. `resources/views/layouts/app/sidebar.blade.php` untouched
  (fifth confirmation of the registry's append-data-only claim) — story 0027.
- New lang groups `products.index.*` / `products.editor.*` in both locales, plus
  `products.sales_regions.unresolvable` (the `resolveSelected()` failure message). `products.php` is
  now a six-story writer (0024/0024a/0024b/0025/0026/0027) — extend, never recreate — story 0027.
- **The story 0020/0021 `dev.media-gallery-harness` scaffolding is fully retired**: both harness
  browser test files (`tests/Browser/Media/GalleryTest.php`,
  `tests/Browser/Components/WysiwygEditorTest.php`, plus the un-red-phase-listed
  `WysiwygEditorOutputHtmlTest.php`) were re-pointed at `route('products.create')`/
  `route('products.edit', $product)` and made green **before** `App\Livewire\Dev\MediaGalleryHarness`,
  its view, its `routes/web.php` registration block and `tests/Feature/Dev/MediaGalleryHarnessRouteTest.php`
  were deleted. No later story should expect `app/Livewire/Dev/` to exist — story 0027.
- Full mechanism is documented at
  [docs/api/routes.md#productsindex-productscreate-and-productsedit--the-fifth-permission-gated-route-family](../../../docs/api/routes.md#productsindex-productscreate-and-productsedit--the-fifth-permission-gated-route-family)
  and [docs/architecture/authorization.md#productpolicy--the-sixth-policy-and-the-second-built-entirely-for-a-screen-that-does-not-exist-yet](../../../docs/architecture/authorization.md#productpolicy--the-sixth-policy-and-the-second-built-entirely-for-a-screen-that-does-not-exist-yet).

## Story 0028 — Product variant attribute types & values backend (gap-filled at story 0029's Phase 6 — missing since 0028's own closure)

- Two tables, `product_attribute_types` and `product_attribute_values`, related by a plain FK
  (`product_attribute_values.product_attribute_type_id`) rather than a pivot — **D1**, rejected a
  single self-referencing table with a discriminator for two reasons: it makes "a future combination
  pivot references only values, never types" unenforceable in SQL, and `unique(parent_id, name)` with
  `parent_id IS NULL` on type rows makes global type-name uniqueness silently unenforced (MySQL allows
  unlimited `NULL`s in a unique index) — story 0028.
- `product_attribute_types`: `id` (uuid v7), `name` (`VARCHAR(100)`, globally unique), `position`
  (`INT UNSIGNED default 0`, ships now but **nothing writes it yet** — deferred drag-to-reorder, D5).
  `product_attribute_values`: `id`, `product_attribute_type_id` (FK, `cascadeOnDelete()`), `value`
  (`VARCHAR(100)`, deliberately not `name` — disambiguates `$type->name` from `$value->value`),
  `position` (**is** written on every save, unlike its parent's homonymous column). Uniqueness is
  **per-type**: `unique(product_attribute_type_id, value)`, so "Black" is legal as both a Color value
  and a Material value — story 0028 D2/D3.
- `App\Actions\Products\SyncProductAttributeValues::__invoke(ProductAttributeType $type, array
  $values)` is the **single writer** of every `product_attribute_values` row for a type — a
  **diff, never delete-and-recreate**, against a fresh `$type->values()->pluck('id')` read on every
  save: a submitted owned id → `UPDATE` in place; an unowned/null/foreign id → new row; an owned id
  absent from the submission → `DELETE`. **This is what guarantees value-id stability across an
  edit** — a save that only renames the type does not re-key any value id, which is what makes a
  variant's stored combination (a set of value ids) survive a taxonomy edit — story 0028 D4, depended
  on directly by story 0029.
- `SyncProductAttributeValues` authorizes **nothing** — the codebase's fifth "collaborator invoked
  only by an already-authorized action needs no gate of its own" instance (after
  `GenerateImageConversions`, `EnforceGrantorPermissionScope`, `SyncProductGallery`,
  `SyncProductSalesRegions`), invoked only inside `CreateProductAttributeType`'s/
  `UpdateProductAttributeType`'s already-authorized transaction — story 0028.
- `CreateProductAttributeType`/`UpdateProductAttributeType`/`DeleteProductAttributeType` each
  self-authorize `update`/`create`/`delete` on `App\Models\ProductAttributeType` via the **new**
  `App\Policies\ProductAttributeTypePolicy` (the app's seventh policy, and the first whose Three
  Amigos "no policy needed" recommendation was reversed at Phase 2 review) — gating on the existing
  `products.*` catalog, **no tenth permission slug added**, catalog still 42 — story 0028 D6.
- **`DeleteProductAttributeType` shipped with NO in-use guard as of story 0029's own closure** — D7
  explicitly deferred it to "0029", written before Phase 2 review split that story into
  0029/0029a/0029b; 0029 itself shipped no change to `DeleteProductAttributeType`/
  `DeleteProductVariant`'s in-use behaviour at all. **Closed by story 0029a** (see its own section
  below) — `DeleteProductAttributeType` and `SyncProductAttributeValues`' delete branch both now hard
  block, and `$deletingTypeUsageCount` is no longer a hardcoded `0`.
- D7 also names the analogous hazard 0029a inherits: deleting a **type** whose values are referenced
  aborts at the database (InnoDB evaluates the RESTRICT while cascading the type→value delete) unless
  the application-level pre-check counts variants across **all of a type's values**, not one value at
  a time.
- Row-targeting contract for any future editor: each value row carries a stable, server-generated
  `key` (`(string) Str::uuid()`, assigned once — on `addValue()` or on read in `openEditModal()`),
  and `removeValue()`/`moveValue()` must target by that `key`, **never by array index** — removing by
  index shifts every later row's DOM identity out from under `wire:key`, leaving the browser showing
  stale content against a different server row — story 0028.
- Values are validated in a **three-pass** sequential `Validator::make()->validate()` (not two): pass
  1 bounds `values` array size (`max:100`) + validates `name`; pass 2 establishes each row's shape
  (`values.*` is `['array']`, `values.*.id` is `['nullable','string']`) **before any text
  normalisation runs**; pass 3 applies `distinct:ignore_case` only to the now-bounded, now-shaped set
  — closing an O(n²) validation-cost hazard on `values.*.value` (the first real, shipped call site of
  [array-validation-bounds.md](../../../docs/security/array-validation-bounds.md)'s rule) and an
  unhandled `TypeError` from a forged row/id shape — story 0028 Phase 4.
- `App\Concerns\ProductAttributeValidationRules` — the sixth `<Noun>ValidationRules` trait:
  `attributeTypeNameRules()`, `attributeValueListRules()`, `attributeValueRowRules()`,
  `attributeValueIdRules()`, `attributeValueRules()`. Entity-prefixed, but **not** `ProductValidationRules`'s
  collision-driven exception applied again — none of the five collide with an existing sibling trait;
  they follow the plain field-not-model rule, naming the real submitted field — story 0028.
- Route `GET /products/attribute-types` → `product-attribute-types.index`, `can:products.view`. The
  Blade view is a **genuine one-line placeholder** (`{{ $this->typesSummary['total'] }}`) — full
  authorization/validation/action wiring shipped, no real markup, matching `sales-regions.index`'s own
  precedent between tasks 0017/0018. **No `config/modules.php` sidebar entry** — third time this
  linkless half-state has occurred (after `roles.index`, `sales-regions.index`) — story 0028.
- Full mechanism at [docs/database/schema.md#product_attribute_types](../../../docs/database/schema.md#product_attribute_types)
  / [#product_attribute_values](../../../docs/database/schema.md#product_attribute_values).

## Story 0029 — Product variants core backend (two tables, derived SKU, combination-hash duplicate guard, read-time image inheritance, self-authorizing actions)

- Two new tables: `product_variants` (id uuid v7 PK, `product_id` FK `cascadeOnDelete()`,
  `combination_hash` `CHAR(64)`, `sku` `VARCHAR(128)` unique, `price` `DECIMAL(10,2)` NOT NULL,
  `stock` signed INT default 0, `featured_media_id` nullable FK → `media` `restrictOnDelete()`,
  `position` INT UNSIGNED default 0) and `product_variant_values` (composite PK
  `(product_variant_id, product_attribute_value_id)`, `product_attribute_value_id`
  `restrictOnDelete()` — **mandated by story 0028's own D4**, not this story's choice). Table named
  `product_variant_values`, not `product_variant_attribute_values`/`product_variant_attribute_value`
  — both alternatives produce a FK constraint name over MySQL's 64-char identifier limit
  (`ERROR 1059`), verified independently twice — story 0029.
- `App\Models\ProductVariant`: `#[Fillable(['price', 'stock', 'featured_media_id', 'position'])]` —
  `product_id`/`sku`/`combination_hash` deliberately excluded (server-derived or fixed-at-creation).
  `casts()`: `price` → `'decimal:2'` (returns a **string**), `stock`/`position` → `'integer'`.
  `values(): BelongsToMany` is ordered **inside the relationship**
  `(product_attribute_types.position, .id, product_attribute_values.position, .id)` — every consumer
  (`label()` included) sees one canonical order, never re-derived per call site.
  `displayFeaturedMediaId(): ?string` = `$this->featured_media_id ?? $this->product->featured_media_id`
  — resolved at **READ time only**, never copied at creation, so a later change to the parent's image
  keeps propagating to every variant that never chose its own — story 0029.
- `App\Actions\Products\HashVariantCombination::__invoke(array $productAttributeValueIds): string` —
  the single definition of `combination_hash`: `sha256` of the ids, **deduplicated, `SORT_STRING`
  sorted, `|`-joined**. Order-independent, duplicate-insensitive. **The ids passed in MUST already be
  read back from the database, never taken from a client payload** —
  `product_attribute_values` sits under `utf8mb4_unicode_ci`, so `Rule::exists()` is case-insensitive
  and a submitted `V-40` would otherwise hash differently than a stored `v-40` and evade the
  duplicate-combination guard — story 0029.
- `App\Actions\Products\DeriveVariantSku` — the SKU formula:
  `{product.sku}-{segment(value)}...`, values rendered in
  `(product_attribute_types.position, .id, product_attribute_values.position, .id)` order (never
  submission order, and a **different** order than the hash sorts by — the hash is a set key, the SKU
  an ordered rendering). `segment()`: `Str::ascii()` transliterate → space-runs to one hyphen (the
  PO's one named rule; casing preserved verbatim) → strip outside `[A-Za-z0-9._/-]` → collapse/trim
  repeated hyphens. `MAX_LENGTH = 128` (not 0024's 64 — the inputs aren't admin-typed, so there's no
  field to shorten). `checked(string $productSku, array $orderedValues): string` is the validating
  entry point **every writer must call, not the bare `__invoke()`** — it throws on an empty-segment
  value (`products.variants.derived_sku_empty_segment`) and on exceeding `MAX_LENGTH`
  (`products.variants.derived_sku_too_long`); the bare derivation skips both — story 0029.
- `App\Actions\Products\TranslateProductVariantUniqueViolation::__invoke(UniqueConstraintViolationException
  $e, string $sku, ?string $overrideMessage = null): ValidationException` — disambiguates which of
  `product_variants`' **two** unique indexes (`sku` vs `(product_id, combination_hash)`) a caught
  violation came from, by matching the violated index's own name in `$e->getMessage()`; re-throws the
  original for an unrecognised index. `$overrideMessage` exists because `UpdateProduct`'s parent-SKU-
  change cascade needs `products.variants.parent_sku_change_collides` (always under the `sku` key)
  rather than the two create-path messages for the identical two indexes — story 0029.
- **SKUs are one namespace across `products` AND `product_variants`.**
  `ProductValidationRules::productSkuRules()` gained a second `Rule::unique(ProductVariant::class,
  'sku')` alongside its existing `Rule::unique(Product::class, 'sku')`, with no `->ignore()` on
  either side (a variant SKU is derived, never typed, so there's no `?string $productVariantId`
  ignore-parameter needed). Every cross-table SKU-collision check (`CreateProductVariant`,
  `CreateProduct`, `UpdateProduct`) locks both tables in the **same fixed order** — `products`, then
  `product_variants` — via `lockForUpdate()`, closing one deadlock class rather than eliminating every
  possible one — story 0029.
- **Two re-derivation triggers for `product_variants.sku`, both retrofits to already-shipped 0024/0028
  actions, both routed through `DeriveVariantSku::checked()`**: (1) `UpdateProduct::reDeriveVariantSkus()`
  — a change to `products.sku` re-derives every one of that product's variants in the **same
  transaction** as the product update, all-or-nothing; `UpdateProduct`'s own `DB::transaction()` call
  deliberately carries **no `attempts: N`** (see the errors-log entry below). (2)
  `SyncProductAttributeValues::reDeriveVariantSkusForRenamedValues()` — a rename branch retrofit
  (0028's file), re-derives every variant built on a renamed value **across every product** that uses
  it; it is a query-builder mass update with no Eloquent events, so this cascade is explicit code, not
  something a model observer could carry. Both cascades gained a **batch-internal-duplicate
  pre-check** that excludes the WHOLE batch of variants being re-derived from the per-row database
  collision check, not just each row's own id — a batch can legitimately rotate SKUs among its own
  members — story 0029, closing Phase 4 findings F-1/F-2/F-3/R-3/R-4 (full history:
  [derived-column-invariants.md](../../../docs/security/derived-column-invariants.md)).
- **`App\Concerns\ProductVariantValidationRules`** — the seventh `<Noun>ValidationRules` trait:
  `variantCombinationRules()` (pass 1 — shape/bound alone, `['required','array','min:1','max:10']`, no
  DB-touching rule), `variantCombinationValueRules()` (pass 2 — per-element,
  `['string','distinct',Rule::exists('product_attribute_values','id')]` — a first pass only, never
  authoritative; the read-back inside `CreateProductVariant` is what actually decides), plus
  `variantPriceRules()`/`variantStockRules()`/`variantFeaturedMediaIdRules()` (0024's product rules
  verbatim). **Deliberately does NOT `use ProductValidationRules`** and declares **no**
  `skuRules()`/`variantSkuRules()` at all — there is no SKU input to validate — story 0029.
- **`App\Actions\Products\CreateProductVariant`** — self-authorizes `update` on the **parent
  `Product`** as its first statement (before validation, before any transaction). Reads attribute-value
  ids **and** their `value` strings back from the database in one query (never from the payload — see
  the case-collation note above). Checks the duplicate-combination invariant (V-lock on
  `(product_id, combination_hash)`) **before** the cross-table SKU collision, so the clearer message
  wins when both would apply. `DB::transaction($fn, attempts: 3)` — **safe** because the row is built
  **inside** the closure via `forceCreate()`, so a retried attempt re-does real work — story 0029.
- **`App\Actions\Products\UpdateProductVariant`/`DeleteProductVariant`** — self-authorize the same way,
  against the variant's **freshly re-fetched** row: `ProductVariant::query()->with('product')
  ->whereKey($variant->getKey())->firstOrFail()` as the literal first statement, **not** merely
  `load('product')` on the caller-supplied instance (Phase 4 finding F-8 — `load('product')` alone
  re-reads the product but resolves *which* product from the caller's in-memory, mass-assignable-until-
  this-fix `product_id`). `UpdateProductVariant`'s `$featuredMediaId` parameter carries **NO default**
  (unlike `CreateProductVariant`'s `= null`, which is correct there) — an update caller must state
  intent explicitly, matching the `docs/errors-log.md` 2026-09-01 entry's rule applied a second time —
  story 0029.
- **No `ProductVariantPolicy` — a genuine Three Amigos plan reversal.** The task file originally
  planned NO self-authorization inside the actions at all, citing a stale claim about
  `CreateUser`/`UpdateUser`'s own shape (falsified by task 0008a, which moved authorization *into*
  those actions specifically). Phase 2 review caught the stale citation and reversed the plan — all
  three variant actions now self-authorize `update` on `App\Models\Product` via the existing
  `ProductPolicy`, following the fully-established action-owns-the-rule convention. There is no per-row
  distinction between two variants of one product for a variant-scoped policy to encode — story 0029.
- **`DB::transaction($fn, attempts: N)` hazard, found and closed this story**: `attempts: 3` was
  briefly on `UpdateProduct`'s transaction too, but its closure mutates `$product` — a model **created
  outside the closure** — so a retried attempt after a genuine deadlock reused the model's own
  post-mutation dirty-tracking state, issued no SQL, skipped the SKU cascade, and returned success
  while writing nothing. Fixed by **removing** the retry from `UpdateProduct` entirely (not by
  key-passing, since that would reshape the action's return contract). The two retained `attempts: 3`
  sites (`CreateProduct`, `CreateProductVariant`) are safe because both `forceCreate()` their row
  inside the closure. **`attempts` is silently inert on a nested `DB::transaction()`** — only the
  outermost transaction's `attempts` ever fires, so story 0031's `Editor::save()` must NOT add its own
  `attempts:` without first re-deriving this analysis — full history at
  [derived-column-invariants.md](../../../docs/security/derived-column-invariants.md#what-the-remediation-introduced-a-retried-transaction-is-a-retry-safe-unit-or-it-is-a-lost-update)
  and [errors-log.md](../../../docs/errors-log.md#dbtransactionfn-attempts-n-retried-a-closure-that-mutated-a-model-created-outside-it-producing-a-silent-lost-update-reported-as-success--2026-09-04).
- **This story ships NO Livewire component, NO route, NO in-use delete guard change.** Story 0031
  owns the editor UI; story 0029a is planned to own the attribute-value/type in-use guards (see the
  0028 section above — D7's "0029" reference actually resolves to 0029a); story 0029b is planned to
  own a combination generator. Neither 0029a nor 0029b had started as of this story's own closure
  (both still sit at the top level of `ai-spec/tasks/`, not `in-progress/`) — a later story must not
  assume either has shipped.
- Full mechanism at [docs/database/schema.md#product_variants](../../../docs/database/schema.md#product_variants)
  / [#product_variant_values](../../../docs/database/schema.md#product_variant_values), and
  [docs/architecture/authorization.md#product-variant-actions-gate-against-the-parent-product-not-a-new-policy](../../../docs/architecture/authorization.md#product-variant-actions-gate-against-the-parent-product-not-a-new-policy).

## Story 0029a — Attribute type & value in-use delete guards backend (split out of 0029's D-10; discharges 0028's own Q3/D7 hand-off)

- Two hard-block-with-count in-use guards, no schema change, no new permission, no Livewire
  component, no route — the same D-14 shape `App\Actions\ProductCategories\DeleteProductCategory`
  already established, applied to the two paths story 0029's own `restrictOnDelete()` FKs made a
  database fact: deleting a `product_attribute_types` row that cascades into a
  `product_attribute_values` row still referenced by `product_variant_values` (path 1), and removing a
  single value from a type's inline value list via the diff editor (path 2) — both previously met a
  raw MySQL `1451` (path 1, verified by 0029's own V-12) or an unhandled `QueryException` (path 2,
  since `SyncProductAttributeValues`' delete branch had **no** `try`/`catch` at all until now).
- **`App\Models\ProductAttributeType::variantUsageCount(): int`** — the single source of the
  type-level count, `COUNT(DISTINCT pvv.product_variant_id)` joined `product_variant_values` through
  `product_attribute_values`, scoped to the type's own values. `DISTINCT` is load-bearing: a variant
  built on two values of the same type (legal at schema level, story 0029's DIS-1) counts once, not
  twice. Consumed by both `App\Actions\Products\DeleteProductAttributeType`'s guard and
  `App\Livewire\Products\AttributeTypes\Index::confirmDelete()`, which now populates
  `$deletingTypeUsageCount` with a real value instead of the hardcoded `0` 0028 shipped as a documented
  placeholder.
- **Path 1 — `DeleteProductAttributeType`**: authorizes `delete` as its first statement (unchanged from
  0028), computes `variantUsageCount()` **after** that call (never before — a reversed order would
  leak the count to an actor who does not even hold `products.delete`), throws a `ValidationException`
  keyed on `productAttributeTypeId` when positive, logged via `LogRefusedPrivilegedAttempt::log()` with
  reason `attribute_type_in_use`. `deleteOrFail()` (not `delete()`, matching `DeleteProductCategory`'s
  own Larastan-driven reasoning — a plain `delete()` gives Larastan no `@throws` to trace, making a
  `try`/`catch` around it a dead catch at level 7) replaces the outer `DB::transaction()`, with a catch
  narrowed to MySQL error **1451** via `errorInfo[1]` as the race backstop.
- **Path 2 — `SyncProductAttributeValues`' delete branch**: per submitted id about to be removed, a
  `product_variant_values` count (no `DISTINCT` needed — the pivot's own PK already makes
  `(variant, value)` unique) runs **before** any `DELETE`, refusing the **whole** save (never just the
  offending value — the diff runs in one transaction, so a thrown `ValidationException` rolls back
  every update/insert already applied in the same call) with a `ValidationException` keyed on
  `values`, logged with reason `attribute_value_in_use`. The delete's own narrowed-to-1451 catch is
  deliberately **separate** from `writeRow()`'s pre-existing `23000` catch (which means "duplicate
  value" — `23000` covers both MySQL `1062` and `1451`, so folding them would report "the value must
  be distinct" for an in-use deletion). `SyncProductAttributeValues` authorizes **nothing** of its own
  (unchanged, D6) — the ordering guarantee here is inherited from its caller's own
  `Gate::authorize()`, not a new Gate call added to this class.
- **Both counts share one presentation floor**, `max(1, $count)`, the identical
  `DeleteProductCategory::blockedByProducts()` precedent: a rolled-back transaction on the race path
  can make the recount read `0`.
- **`lang/{en,es}/products.php`** extended (never recreated) with two new `trans_choice` keys under
  the existing `variants` group — `type_in_use`/`value_in_use` — both the **simple** `singular|plural`
  form (never the explicit-range form `media.php` uses), since both refusals only ever throw once
  their count is already positive.
- **No confirm-and-proceed path at any privilege level, proven the same three ways
  `DeleteProductCategory` established**: reflection on `DeleteProductAttributeType::__invoke()`'s
  signature (exactly one parameter, no `force`-shaped argument), calling twice in succession, and a
  Super Admin refused identically — the strongest proof, since it shows the block is data integrity
  rather than authorization.
- **This story ships NO migration, NO new column, NO permission, NO policy change, NO Livewire
  component, NO route, NO Blade view and NO browser test** — every FK it counts against is story
  0029's. Full mechanism at
  [docs/database/schema.md#product_attribute_types](../../../docs/database/schema.md#product_attribute_types)
  and
  [docs/database/schema.md#since-story-0029a-deleting-a-value-in-use-is-hard-refused-per-value-with-a-message-naming-the-exact-count](../../../docs/database/schema.md#since-story-0029a-deleting-a-value-in-use-is-hard-refused-per-value-with-a-message-naming-the-exact-count).
