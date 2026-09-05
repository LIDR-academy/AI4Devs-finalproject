<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Concerns\ProductVariantValidationRules;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UpdateProductVariant
{
    use ProductVariantValidationRules;

    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Update a variant's price, stock, own featured image and/or position.
     *
     * NEVER touches the pivot, the hash, or the SKU (D-13, D-4.3) --
     * changing a combination means deleting the variant and creating a new
     * one. `$position` is `null` on every call site today (D-17.1 point
     * 5): a reorder is a whole-sibling-set rewrite this story does not
     * ship an action for.
     *
     * `$featuredMediaId` carries NO default, unlike CreateProductVariant's
     * identical-looking `?string $featuredMediaId = null` -- the two are not
     * equivalent here. On CREATE, omission and "no image yet" denote the
     * same real state, so a default is safe. On UPDATE, omission does not
     * mean "clear the image" -- it usually means the caller never touched
     * that field -- so a default would silently null out a variant's own
     * image on every partial-field save. This is docs/errors-log.md's
     * 2026-09-01 entry ("An action's own parameter default reintroduced the
     * omission ambiguity...") applying its own second rule (a create-safe
     * default does not transfer to update by symmetry) to this action's own
     * signature -- every caller must state intent explicitly: pass the
     * variant's current featured_media_id to leave it alone, null to clear
     * it, or a new id to change it.
     *
     * D-12.1: authorizes `update` on the variant's PARENT PRODUCT as the
     * first statement -- before validation, before any transaction. The
     * whole variant row is re-read fresh from the database (Phase 4 finding
     * F-8), never trusted from a caller-staged instance:
     * `load('product')` alone re-reads the product but resolves WHICH
     * product from the caller's in-memory `product_id` -- a public
     * attribute -- so the row acted on and the row authorized against could
     * come from two different sources. See
     * docs/security/model-instance-trust.md and
     * docs/security/derived-column-invariants.md's "Related" section.
     */
    public function __invoke(
        ProductVariant $variant,
        string $price,
        int $stock,
        ?string $featuredMediaId,
        ?int $position = null,
    ): ProductVariant {
        $variant = ProductVariant::query()->with('product')->whereKey($variant->getKey())->firstOrFail();

        $this->logRefusedPrivilegedAttempt->authorize(
            'update',
            $variant->product,
            targetType: 'product',
            targetId: $variant->product->id,
        );

        Validator::make(
            ['price' => $price, 'stock' => $stock, 'featuredMediaId' => $featuredMediaId],
            [
                'price' => $this->variantPriceRules(),
                'stock' => $this->variantStockRules(),
                'featuredMediaId' => $this->variantFeaturedMediaIdRules(),
            ],
        )->validate();

        DB::transaction(function () use ($variant, $price, $stock, $featuredMediaId, $position): void {
            $attributes = [
                'price' => $price,
                'stock' => $stock,
                'featured_media_id' => $featuredMediaId,
            ];

            if ($position !== null) {
                $attributes['position'] = $position;
            }

            $variant->update($attributes);
        });

        return $variant;
    }
}
