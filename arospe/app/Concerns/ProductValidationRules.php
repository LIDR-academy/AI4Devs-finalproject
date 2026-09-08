<?php

namespace App\Concerns;

use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Query\Builder;
use Illuminate\Validation\Rule;

/**
 * Shared validation rules for the Products area (story 0024).
 *
 * D-13's naming decision: every method here is entity-prefixed
 * (`productNameRules()`, `productSkuRules()`, ...) rather than following
 * naming.md's usual "the noun is the field, not the model" rule. This is a
 * deliberate, reasoned exception: App\Concerns\ProductCategoryValidationRules
 * and App\Concerns\ProfileValidationRules already both declare `nameRules()`,
 * and App\Concerns\SalesRegionValidationRules already claims
 * `descriptionRules()`. PHP raises a fatal error when two traits composed
 * onto one class declare the same method, and the obvious future consumer
 * (0027's editor, with a create-a-category-on-the-fly control) composes
 * exactly ProductValidationRules with ProductCategoryValidationRules.
 * Prefixed uniformly for every method naming one of the product's own
 * fields -- a blanket rule there is reviewable in one glance, a per-method
 * judgement about which names might collide with a trait that does not
 * exist yet is not. Corrected 2026-09-03 (story 0026, Phase 5 finding
 * N-8): this no longer describes every method in the trait. Story 0026's
 * `salesRegionIdsRules()`/`salesRegionIdRules()` are correctly UNprefixed
 * -- they name the related Sales Region entity, not a product field, and
 * neither name collides with any trait this one composes with (verified,
 * not assumed) -- so "uniformly" now means "uniform within the product-
 * field group", not "every method in this file".
 */
trait ProductValidationRules
{
    /**
     * Get the validation rules used to validate a product.
     *
     * `status` is deliberately NOT marked `required` -- it has a database
     * default (D-6) and the Gherkin scenario "A product is saved as a draft
     * when no status is given" requires that omitting it is valid. This is
     * a corrected reading of an internal contradiction in this story's own
     * task file, whose D-13 rules table literally lists `status` as
     * `required` -- the more specific "Tests to perform" checklist and D-6
     * both require the opposite, and this trait follows them.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function productRules(?string $productId = null): array
    {
        return [
            'name' => $this->productNameRules(),
            'sku' => $this->productSkuRules($productId),
            'product_category_id' => $this->productCategoryIdRules(),
            'type' => $this->productTypeRules(),
            'status' => $this->productStatusRules(),
            'price' => $this->productPriceRules(),
            'stock' => $this->productStockRules(),
            'description' => $this->productDescriptionRules(),
            'featured_media_id' => $this->productFeaturedMediaIdRules(),
            'gallery_media_ids' => $this->productGalleryMediaIdsRules(),
            // D-13: the wildcard half of `gallery_media_ids` has no
            // dedicated entity-prefixed method of its own -- the field
            // itself is `productGalleryMediaIdsRules()`'s, and its `.*`
            // children are validated inline here rather than inventing an
            // eleventh method name the task file never lists.
            'gallery_media_ids.*' => ['string', 'distinct', Rule::exists('media', 'id')],
        ];
    }

    /**
     * Get the validation rules used to validate a product's name.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function productNameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate a product's SKU.
     *
     * D-11: the SKU is canonicalised (upper-cased, trimmed) on write BEFORE
     * this rule set is ever consulted -- so a plain `Rule::unique()` and the
     * database's own `UNIQUE` index compare like-for-like on both engines,
     * with no custom normalising helper needed the way category `name`
     * requires. $productId excludes that row from the comparison (the
     * trap this story shares with 0023's R-1): saving a product under its
     * own unchanged SKU must succeed.
     *
     * Story 0029 D-4/D-4.7: SKUs are one namespace across `products` AND
     * `product_variants` -- PRD Sec 2.2's Scenario Outline names both "another
     * product" and "a variant" as collision cases. The second
     * `Rule::unique(ProductVariant::class, 'sku')` below closes the product-
     * side half of that rule (a variant SKU is derived, never admin-typed, so
     * nothing on the variant side ever calls this method or needs an
     * `?string $productVariantId` parameter -- D-4.7's third correction). It
     * sits OUTSIDE the ternary above and carries NO `->ignore()` on either
     * branch: no variant row is ever the subject being saved here, so there is
     * nothing to exclude from the comparison.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function productSkuRules(?string $productId = null): array
    {
        return [
            'required',
            'string',
            'max:64',
            'regex:/^[A-Z0-9][A-Z0-9._\/-]*$/',
            $productId === null
                ? Rule::unique(Product::class, 'sku')
                : Rule::unique(Product::class, 'sku')->ignore($productId),
            Rule::unique(ProductVariant::class, 'sku'),
        ];
    }

    /**
     * Get the validation rules used to validate a product's category
     * assignment.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function productCategoryIdRules(): array
    {
        return ['required', 'string', Rule::exists('product_categories', 'id')];
    }

    /**
     * Get the validation rules used to validate a product's type.
     *
     * D-5: required, with no fallback anywhere -- physical and virtual are
     * equally wrong guesses for an omission.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function productTypeRules(): array
    {
        return ['required', Rule::enum(ProductType::class)];
    }

    /**
     * Get the validation rules used to validate a product's status.
     *
     * NOT `required` (see `productRules()`'s docblock) -- an omission is
     * valid and defaults to Draft server-side (D-6). `Rule::enum()` still
     * applies whenever a value IS present, which is what refuses every
     * "Agotado" spelling (D-7): the enum has no such case, so an invalid
     * string can never validate through to the model regardless.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function productStatusRules(): array
    {
        return ['nullable', Rule::enum(ProductStatus::class)];
    }

    /**
     * Get the validation rules used to validate a product's price.
     *
     * `decimal:0,2` refuses a three-decimal value (RQ-5) before the
     * database could round it with only a note, and caps the ceiling at
     * `max:99999999.99` (D-2) before it could surface as a raw `22003`.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function productPriceRules(): array
    {
        return ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'];
    }

    /**
     * Get the validation rules used to validate a product's stock level.
     *
     * `min:0` (RQ-3) is the app-level statement of the invariant D-3
     * deliberately keeps out of the DDL -- without it a `-1` becomes a
     * MySQL 500 instead of a validation message.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function productStockRules(): array
    {
        return ['required', 'integer', 'min:0'];
    }

    /**
     * Get the validation rules used to validate a product's description.
     *
     * `max:65535` measures the SANITIZED value, not the submitted one: both
     * `CreateProduct` and `UpdateProduct` call `App\Actions\Products\
     * SanitizeProductDescription` and reassign `$description` before this
     * rule set is ever consulted (story 0024a, D-16/D-A1) -- so a
     * description that is over the limit only because of markup the
     * sanitizer removes is accepted, and this rule never needs to
     * duplicate that ordering itself.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function productDescriptionRules(): array
    {
        return ['nullable', 'string', 'max:65535'];
    }

    /**
     * Get the validation rules used to validate a product's featured image.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function productFeaturedMediaIdRules(): array
    {
        return ['nullable', 'string', Rule::exists('media', 'id')];
    }

    /**
     * Get the validation rules used to validate a product's gallery
     * membership array. `distinct` (on the `.*` wildcard applied in
     * `productRules()`) refuses the same image twice at the app layer, with
     * the pivot's composite PK as the database's last word behind it.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function productGalleryMediaIdsRules(): array
    {
        return ['array', 'max:20'];
    }

    /**
     * Get the validation rules used to validate a product's Sales Region
     * assignment array (story 0026). No entity prefix needed on either this
     * or `salesRegionIdRules()` -- 0024's naming trap applies only to leaf
     * methods that clash across composed traits, and neither of these does.
     *
     * `max:254` (Phase 4 finding F-3) bounds the array the same way its
     * sibling `productGalleryMediaIdsRules()` already bounds the gallery
     * array. 254 is not an arbitrary round number: it is the Sales Region
     * catalog's real ceiling, 249 ISO countries
     * (`database/data/iso-3166-countries.json`, verified 249 entries) plus
     * Spain's 5 fixed fiscal territories
     * (`SalesRegionSeeder::SPAIN_TERRITORIES`) -- 254 rows total, so a
     * legitimate submission can never exceed it even in the (currently
     * impossible) case a caller submitted the entire catalog. `list`
     * refuses a sparse/associative array, matching the shape every other
     * id-array submission in this codebase expects -- it does **not**
     * prevent the per-element rules from running either, for the identical
     * reason `max:254` doesn't (see the ⚠️ below): a 30-key associative
     * array still issues 30 `Rule::exists()` queries before `list` fails.
     *
     * ⚠️ CORRECTED (Phase 4 re-audit, R-1): `max:254` bounds what may
     * SUCCEED, not what a request COSTS -- Laravel expands `field.*`
     * against every element it was given and runs each expanded rule
     * regardless of whether `field`'s own rules already failed, so a
     * caller who submits BOTH these rule sets in one `validate()` call
     * (as a bare `$this->validate([...])` on a Livewire component would)
     * still pays one `Rule::exists()` query per submitted element before
     * `max:254` is ever consulted -- measured linear, one query per
     * element, with no early exit. **Whoever calls these two rule sets
     * (story 0027's save path) MUST validate `salesRegionIdsRules()`
     * alone, in its own `Validator::make(...)->validate()` call, BEFORE
     * validating `salesRegionIds.*` against `salesRegionIdRules($preserved)`
     * in a second call** -- two sequential calls, not one combined rule
     * array, so an oversized submission throws before a single per-element
     * query runs. This does not reopen D12's rejected delta-validation
     * shape (which split ids into two *different* rule sets by
     * preserved/new); both calls here use the identical per-element rules,
     * just sequenced so the shape check runs first. See
     * [docs/security/array-validation-bounds.md](../../docs/security/array-validation-bounds.md)
     * and this story's own Definition-of-Done hand-off item 5.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function salesRegionIdsRules(): array
    {
        return ['array', 'list', 'max:254'];
    }

    /**
     * Rules for ONE submitted sales-region id (story 0026, D12).
     *
     * $preservedSalesRegionIds are the ids **already persisted on the
     * product being edited**, read from the database and never from the
     * request. They are exempt from the *assignable* conditions, because a
     * since-deactivated entry that is already assigned is being
     * **preserved**, not newly chosen -- it must only still exist in the
     * catalog. Every other submitted id (i.e. every genuinely new one)
     * still faces the full active + not-a-heading match.
     *
     * The `is_active` and no-children conditions are part of the `exists`
     * MATCH, not a follow-up `if` -- same shape as 0017's
     * `replacementDefaultRules()` -- and the OR sits INSIDE the same
     * per-element `Rule::exists()->where(Closure)` call, so a single bad
     * element still fails the whole request and `SyncProductSalesRegions`
     * is never invoked.
     *
     * `$preservedSalesRegionIds` must be server-derived, always -- from
     * `$product->salesRegions` (or a direct pivot query), never from the
     * request. Taking it from a client-supplied value would let a caller
     * name any id as "already assigned" and bypass the `is_active` /
     * no-heading gate entirely.
     *
     * `required` is what makes an empty-string element fail: Laravel's
     * Validator skips every non-implicit rule (`string`, `distinct`,
     * `exists`) for a trimmed-empty string value
     * (`Validator::presentOrRuleIsImplicit()`), so without an implicit rule
     * present an empty-string id would silently validate.
     *
     * @param  array<int, string>  $preservedSalesRegionIds
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function salesRegionIdRules(array $preservedSalesRegionIds = []): array
    {
        return [
            'required',
            'string',
            'distinct',
            Rule::exists('sales_regions', 'id')->where(
                fn (Builder $query) => $query->where(
                    fn (Builder $group) => $group
                        ->where(fn (Builder $assignable) => $assignable
                            ->where('is_active', true)
                            ->whereNotExists(fn (Builder $sub) => $sub->selectRaw('1')
                                ->from('sales_regions as children')
                                ->whereColumn('children.parent_id', 'sales_regions.id')))
                        ->orWhereIn('id', $preservedSalesRegionIds),
                ),
            ),
        ];
    }
}
