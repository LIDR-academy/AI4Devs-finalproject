<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\ProductAttributeType;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class DeleteProductAttributeType
{
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Delete an attribute type and every one of its own values (D7: the
     * database's own cascadeOnDelete() FK removes the value rows) -- hard
     * blocked, with a message naming the exact count, while any of those
     * values is still in use by a product variant (story 0029a, D-A1
     * path 1).
     *
     * Authorizes `delete` on `$type` as its own first statement (D6), the
     * identical self-authorizing shape App\Actions\ProductCategories\
     * DeleteProductCategory already uses. The in-use count below MUST be
     * computed only AFTER that call, never before (D-A2): the count is
     * data, and computing it ahead of the gate would leak it to an actor
     * who does not even hold products.delete, turning a clean 403 into a
     * business message. App\Models\ProductAttributeType::
     * variantUsageCount() (D-A3/D-A6) is the single source of this count,
     * shared with App\Livewire\Products\AttributeTypes\Index::
     * confirmDelete().
     *
     * deleteOrFail(), not delete(), matching DeleteProductCategory's own
     * documented reasoning: Eloquent's Model::delete() carries no @throws
     * annotation Larastan can trace, so a try/catch around a plain
     * delete() is a dead catch at level 7. deleteOrFail() wraps the same
     * statement in its own DB::transaction(), so no outer transaction is
     * needed here.
     *
     * The catch below is narrowed to MySQL error 1451 (row is referenced)
     * via errorInfo[1], never the whole 23000 SQLSTATE class (D-A4) -- as
     * the race backstop behind the app-level pre-check above. Without a
     * pre-check at all, a type delete would cascade into deleting its own
     * values, each value's delete would hit product_variant_values'
     * restrictOnDelete() FK, and the whole statement would abort with
     * NOTHING deleted -- type and values alike survive (verified by
     * story 0029's own V-12).
     */
    public function __invoke(ProductAttributeType $type): bool
    {
        $this->logRefusedPrivilegedAttempt->authorize('delete', $type, targetType: 'product_attribute_type', targetId: $type->id);

        $usageCount = $type->variantUsageCount();

        if ($usageCount > 0) {
            throw $this->blockedByVariants($type, $usageCount);
        }

        try {
            return (bool) $type->deleteOrFail();
        } catch (QueryException $e) {
            if (($e->errorInfo[1] ?? null) === 1451) {
                throw $this->blockedByVariants($type, $type->variantUsageCount());
            }

            throw $e;
        }
    }

    private function blockedByVariants(ProductAttributeType $type, int $count): ValidationException
    {
        // max(1, ...): a PRESENTATION floor, the same one
        // App\Actions\ProductCategories\DeleteProductCategory's
        // blockedByProducts() documents -- a rolled-back transaction (the
        // race path's own deleteOrFail() transaction) can make the
        // recount above read 0.
        $count = max(1, $count);

        $this->logRefusedPrivilegedAttempt->log(Auth::user(), 'attribute_type_in_use', 'product_attribute_type', $type->id);

        return ValidationException::withMessages([
            'productAttributeTypeId' => trans_choice('products.variants.type_in_use', $count, ['count' => $count]),
        ]);
    }
}
