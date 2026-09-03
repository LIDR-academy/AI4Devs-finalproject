<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\ProductAttributeType;
use Illuminate\Support\Facades\DB;

class DeleteProductAttributeType
{
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Delete an attribute type and every one of its own values (D7: the
     * database's own cascadeOnDelete() FK removes the value rows).
     *
     * Deliberately thin -- unguarded beyond the authorize() call below, per
     * D7: nothing in the database references a type or its values yet (no
     * products, no product_variants, no combination pivot), so an in-use
     * block would be untestable today. This action is a named seam
     * (matching User::delete()'s override-not-scattered-logic precedent)
     * so story 0029 has exactly one call site to bolt its guard onto,
     * rather than a hand-rolled `$type->delete()` scattered wherever a
     * caller happens to need it.
     *
     * Authorizes `delete` on `$type` as its own first statement (D6), the
     * identical self-authorizing shape App\Actions\ProductCategories\
     * DeleteProductCategory already uses.
     */
    public function __invoke(ProductAttributeType $type): bool
    {
        $this->logRefusedPrivilegedAttempt->authorize('delete', $type, targetType: 'product_attribute_type', targetId: $type->id);

        return DB::transaction(fn (): bool => (bool) $type->delete());
    }
}
