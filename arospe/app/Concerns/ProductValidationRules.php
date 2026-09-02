<?php

namespace App\Concerns;

use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
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
 * Prefixed UNIFORMLY, not selectively -- a blanket rule is reviewable in one
 * glance, a per-method judgement about which names might collide with a
 * trait that does not exist yet is not.
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
     * `max:65535` currently measures the SUBMITTED value; once 0024a ships
     * its sanitize-before-validate step, this rule measures the stored
     * value instead. Do not "fix" that ordering here -- there is nothing to
     * order yet (D-13).
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
}
