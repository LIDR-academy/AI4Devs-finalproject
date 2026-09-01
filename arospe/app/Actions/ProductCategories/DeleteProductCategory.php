<?php

namespace App\Actions\ProductCategories;

use App\Models\ProductCategory;

class DeleteProductCategory
{
    /**
     * Delete a product category outright (D-3: no SoftDeletes, no in-use
     * guard here). This file exists on its own specifically so story 0024
     * extends it with the in-use hard-block-with-count guard once
     * `products.product_category_id` exists, rather than introducing that
     * rule in a new place.
     *
     * No authorization of its own -- see CreateProductCategory's docblock
     * and the story's Definition of Done hand-off note.
     */
    public function __invoke(ProductCategory $productCategory): bool
    {
        return $productCategory->delete();
    }
}
