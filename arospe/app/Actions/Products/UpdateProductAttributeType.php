<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\ProductAttributeType;
use Illuminate\Support\Facades\DB;

class UpdateProductAttributeType
{
    /**
     * Constructor injection for the same reason as
     * CreateProductAttributeType: __invoke()'s three domain arguments are
     * this action's whole public signature.
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly SyncProductAttributeValues $syncProductAttributeValues,
    ) {}

    /**
     * Rename an existing attribute type and sync its value list.
     *
     * Authorizes `update` on `$type` as its own first statement (D6), the
     * identical self-authorizing shape App\Actions\ProductCategories\
     * RenameProductCategory already uses.
     *
     * `$name` and every `$values[i]['value']` are expected to already be
     * squished and validated by the caller -- see
     * CreateProductAttributeType's docblock for the full reasoning, and
     * SyncProductAttributeValues for the diff algorithm this delegates to
     * (D4), including why editing a type never re-keys a value it did not
     * itself change.
     *
     * @param  array<int, array{id?: string|null, value: string}>  $values
     */
    public function __invoke(ProductAttributeType $type, string $name, array $values): ProductAttributeType
    {
        $this->logRefusedPrivilegedAttempt->authorize('update', $type, targetType: 'product_attribute_type', targetId: $type->id);

        return DB::transaction(function () use ($type, $name, $values): ProductAttributeType {
            $type->update(['name' => $name]);

            ($this->syncProductAttributeValues)($type, $values);

            return $type->refresh();
        });
    }
}
