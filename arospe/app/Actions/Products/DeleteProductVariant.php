<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\ProductVariant;

class DeleteProductVariant
{
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Delete a product variant.
     *
     * Thin today -- exists as the single seam Epic 3's "a variant
     * referenced by orders cannot be deleted" guard bolts onto (0023
     * D-10 / 0024's DeleteProduct reasoning).
     *
     * D-12.1: authorizes `update` on the variant's PARENT PRODUCT as the
     * first statement, against a freshly RE-READ row (Phase 4 finding F-8)
     * -- not merely a reloaded relation. `load('product')` alone re-reads
     * the product but resolves WHICH product from the caller's in-memory
     * `product_id`, a public attribute; re-fetching the whole variant makes
     * the row authorized against and the row deleted the SAME instance. See
     * docs/security/model-instance-trust.md.
     */
    public function __invoke(ProductVariant $variant): bool
    {
        $variant = ProductVariant::query()->with('product')->whereKey($variant->getKey())->firstOrFail();

        $this->logRefusedPrivilegedAttempt->authorize(
            'update',
            $variant->product,
            targetType: 'product',
            targetId: $variant->product->id,
        );

        return (bool) $variant->delete();
    }
}
