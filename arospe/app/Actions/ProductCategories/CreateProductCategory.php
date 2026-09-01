<?php

namespace App\Actions\ProductCategories;

use App\Actions\NormalizeForSearch;
use App\Concerns\ProductCategoryValidationRules;
use App\Models\ProductCategory;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CreateProductCategory
{
    use ProductCategoryValidationRules;

    /**
     * Constructor injection, not method injection: __invoke()'s single
     * domain argument is this action's whole public signature, called that
     * way by every direct-call test (there is no Livewire caller yet -- D-1)
     * -- so the shared normaliser is resolved from the container without
     * widening that signature. See docs/conventions/code-style.md's
     * constructor-injection exception.
     */
    public function __construct(
        private readonly NormalizeForSearch $normalizeForSearch,
    ) {}

    /**
     * Create a new product category.
     *
     * The name is trimmed BEFORE validation, not after (R-6): Laravel's
     * `required` treats a string of spaces as present, so without this a
     * whitespace-only name would validate and persist.
     *
     * This action performs NO authorization of its own -- matching
     * App\Actions\Users\CreateUser/UpdateUser's caller-authorizes shape.
     * Since this story ships no caller, that is a real, recorded gap: the
     * UI story (0025) must call Gate::authorize('create', ...) before
     * invoking this action. See the story's Definition of Done hand-off
     * note and docs/security/livewire-authorization.md.
     */
    public function __invoke(string $name): ProductCategory
    {
        $name = trim($name);

        Validator::make(
            ['name' => $name],
            $this->productCategoryRules($this->normalizeForSearch),
        )->validate();

        try {
            return ProductCategory::create(['name' => $name]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                // The unique index is the last-word RACE guard behind the
                // normalised-comparison validation rule above, not the
                // primary defence -- see D-4/R-2. Converted to the same
                // clean ValidationException shape App\Actions\Users\
                // CreateUser already uses for `email`.
                throw ValidationException::withMessages([
                    'name' => trans('validation.unique', ['attribute' => 'name']),
                ]);
            }

            throw $e;
        }
    }
}
