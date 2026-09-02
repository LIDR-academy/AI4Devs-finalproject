<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\Product;

/**
 * Delete a product outright (D-12: no SoftDeletes -- a product delete is a
 * hard delete, cascading its own `product_media` rows away).
 *
 * Exists as its own file specifically so Epic 3's "a product referenced by
 * orders cannot be deleted" guard has one seam to bolt onto, the same
 * reasoning 0023's D-10 gives for App\Actions\ProductCategories\
 * DeleteProductCategory.
 */
class DeleteProduct
{
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Delete a product.
     *
     * Authorizes `delete` on `$product` as its own first statement (D-15),
     * with `targetType: 'product'` and `targetId: $product->id` passed
     * explicitly since LogRefusedPrivilegedAttempt::resolveTarget()
     * auto-resolves only User and Role instances.
     */
    public function __invoke(Product $product): bool
    {
        $this->logRefusedPrivilegedAttempt->authorize(
            'delete',
            $product,
            targetType: 'product',
            targetId: $product->id,
        );

        return (bool) $product->delete();
    }
}
