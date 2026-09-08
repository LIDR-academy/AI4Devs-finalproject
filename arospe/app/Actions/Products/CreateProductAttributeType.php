<?php

namespace App\Actions\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\ProductAttributeType;
use Illuminate\Support\Facades\DB;

class CreateProductAttributeType
{
    /**
     * Constructor injection, not method injection: __invoke()'s two domain
     * arguments are this action's whole public signature, called that way
     * by every direct-call test -- so both collaborators are resolved from
     * the container without widening that signature. See
     * docs/conventions/code-style.md's constructor-injection exception.
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly SyncProductAttributeValues $syncProductAttributeValues,
    ) {}

    /**
     * Create a new attribute type with its initial value list.
     *
     * Authorizes `create` on `ProductAttributeType::class` as its own
     * first statement (D6), the identical self-authorizing shape
     * App\Actions\ProductCategories\CreateProductCategory already uses --
     * this gives a future Artisan command, queued job or REST controller
     * the identical refusal the dashboard gets. `targetType:
     * 'product_attribute_type'` is passed explicitly, since
     * LogRefusedPrivilegedAttempt::resolveTarget() auto-resolves only User
     * and Role instances.
     *
     * `$name` and every `$values[i]['value']` are expected to already be
     * squished and validated by the caller (App\Livewire\Products\
     * AttributeTypes\Index::save()) -- this action performs no validation
     * of its own beyond what SyncProductAttributeValues's own
     * QueryException-to-ValidationException catch provides as a last-word
     * backstop.
     *
     * @param  array<int, array{id?: string|null, value: string}>  $values
     */
    public function __invoke(string $name, array $values): ProductAttributeType
    {
        $this->logRefusedPrivilegedAttempt->authorize('create', ProductAttributeType::class, targetType: 'product_attribute_type');

        return DB::transaction(function () use ($name, $values): ProductAttributeType {
            $type = ProductAttributeType::create(['name' => $name]);

            ($this->syncProductAttributeValues)($type, $values);

            return $type->refresh();
        });
    }
}
