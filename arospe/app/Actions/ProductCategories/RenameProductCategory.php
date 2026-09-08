<?php

namespace App\Actions\ProductCategories;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\NormalizeForSearch;
use App\Concerns\ProductCategoryValidationRules;
use App\Models\ProductCategory;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class RenameProductCategory
{
    use ProductCategoryValidationRules;

    /**
     * Constructor injection for the same reason as CreateProductCategory:
     * __invoke()'s two domain arguments are this action's whole public
     * signature.
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly NormalizeForSearch $normalizeForSearch,
    ) {}

    /**
     * Rename an existing product category.
     *
     * Authorizes `update` on `$productCategory` as its own first statement
     * (story 0025), the identical self-authorizing shape
     * App\Actions\Products\UpdateProduct already uses -- see
     * CreateProductCategory's docblock for the full reasoning.
     *
     * The uniqueness rule ignores the target's own id (R-1), which is what
     * makes saving a category under its own unchanged name succeed.
     */
    public function __invoke(ProductCategory $productCategory, string $name): ProductCategory
    {
        $this->logRefusedPrivilegedAttempt->authorize(
            'update',
            $productCategory,
            targetType: 'product_category',
            targetId: $productCategory->id,
        );

        $name = trim($name);

        Validator::make(
            ['name' => $name],
            $this->productCategoryRules($this->normalizeForSearch, $productCategory->id),
        )->validate();

        try {
            $productCategory->update(['name' => $name]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                // Last-word race guard behind the validation rule above --
                // see CreateProductCategory's identical catch and D-4/R-2.
                throw ValidationException::withMessages([
                    'name' => trans('validation.unique', ['attribute' => 'name']),
                ]);
            }

            throw $e;
        }

        return $productCategory;
    }
}
