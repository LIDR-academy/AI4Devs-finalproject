<?php

namespace App\Actions\ProductCategories;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
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
     * way by every direct-call test -- so both collaborators are resolved
     * from the container without widening that signature. See
     * docs/conventions/code-style.md's constructor-injection exception.
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly NormalizeForSearch $normalizeForSearch,
    ) {}

    /**
     * Create a new product category.
     *
     * Authorizes `create` on `ProductCategory::class` as its own first
     * statement (story 0025, discharging the hand-off 0023 recorded --
     * see docs/database/schema.md#product_categories and
     * docs/conventions/base-standards.md#directory-structure) -- the
     * identical self-authorizing shape App\Actions\Products\CreateProduct
     * already uses, so a future Artisan command, queued job or REST
     * controller inherits the same refusal the dashboard gets.
     * `targetType: 'product_category'` is passed explicitly, since
     * LogRefusedPrivilegedAttempt::resolveTarget() auto-resolves only User
     * and Role instances/classes; there is no `targetId` yet, matching
     * CreateProduct's own `Product::class` create-time call.
     *
     * The name is trimmed BEFORE validation, not after (R-6): Laravel's
     * `required` treats a string of spaces as present, so without this a
     * whitespace-only name would validate and persist.
     */
    public function __invoke(string $name): ProductCategory
    {
        $this->logRefusedPrivilegedAttempt->authorize('create', ProductCategory::class, targetType: 'product_category');

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
