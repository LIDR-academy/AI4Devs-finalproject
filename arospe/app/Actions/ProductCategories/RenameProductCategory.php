<?php

namespace App\Actions\ProductCategories;

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
        private readonly NormalizeForSearch $normalizeForSearch,
    ) {}

    /**
     * Rename an existing product category.
     *
     * The uniqueness rule ignores the target's own id (R-1), which is what
     * makes saving a category under its own unchanged name succeed.
     *
     * No authorization of its own -- see CreateProductCategory's docblock
     * and the story's Definition of Done hand-off note.
     */
    public function __invoke(ProductCategory $productCategory, string $name): ProductCategory
    {
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
